// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './Escrow.sol';
import './interfaces/IIdentityRegistry.sol';
import './interfaces/IReputationToken.sol';

/**
 * @title EscrowFactory
 * @notice Two-sided marketplace with anti-fraud controls:
 *         - client commitment deposit
 *         - operator application stake + cooldown
 *         - timeout-based penalties
 *         - blocklist + penalty points
 */
contract EscrowFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable, ReentrancyGuard {
  uint256 public platformFeeBps; // 250 = 2.5%
  address public feeRecipient;
  address public mediator;
  address public mediatorBackup;

  error Unauthorized();
  error InvalidBudget();
  error JobNotOpen();
  error AlreadyApplied();
  error CooldownActive();
  error InvalidStake();
  error AlreadyAccepted();
  error ProfileRequired();
  error StakeLocked();
  error EscrowNotTracked();
  error AddressMismatch();
  error StateMismatch();
  error FeeTooHigh();
  error InvalidTitle();
  error InvalidURI();
  error WindowExpired();
  error NoStake();
  error Blocked();
  error WithdrawFailed();
  error JobNotFound();

  // --- Anti-fraud config ---
  uint256 public clientCommitmentWei;
  uint256 public applicationStakeWei;
  uint256 public applicationCooldownSec;
  uint256 public clientCancelGraceSec;
  uint256 public selectionTimeoutSec;
  uint256 public fundingTimeoutSec;
  uint256 public autoBlockPenaltyThreshold;

  IIdentityRegistry public identityRegistry;
  IReputationToken public reputationToken;

  string private constant ACHIEVEMENT_JOB_COMPLETE = 'ipfs://avaxverse/a/jc';

  enum JobStatus {
    OPEN,
    SELECTED,
    ACCEPTED,
    FUNDED,
    CLOSED,
    CANCELLED
  }

  struct Job {
    address escrow;
    address client;
    address freelancer;
    string title;
    string metadataURI;
    uint256 budget;
    uint256 createdAt;
    JobStatus status;
    bool operatorAccepted;
  }

  struct Application {
    string proposalURI;
    uint256 appliedAt;
    bool exists;
  }

  Job[] private _jobs;
  mapping(address => uint256) private _escrowToJobIndex;
  mapping(address => uint256[]) private _userJobs;

  mapping(uint256 => address[]) private _jobApplicants;
  mapping(uint256 => mapping(address => Application)) private _applications;

  mapping(uint256 => uint256) private _clientCommitmentByJob;
  mapping(uint256 => mapping(address => uint256)) private _applicationStakeByJob;

  mapping(uint256 => uint256) private _selectedAt;
  mapping(uint256 => uint256) private _acceptedAt;

  mapping(address => uint256) public lastApplicationAt;
  mapping(address => bool) public blocked;
  mapping(address => uint256) public penaltyPoints;

  // Deprecated: kept for storage layout compatibility.
  mapping(address => uint256) public pendingWithdrawals;
  mapping(address => mapping(uint256 => bool)) private _userHasJob;
  mapping(address => mapping(address => uint256)) public pairCompletions;
  uint256 public minWalletAgeSec;
  uint256 public minDisputeFee;
  uint256 public escrowReviewTimeoutSec;
  uint256 public escrowDisputeResponseWindowSec;
  uint256 public escrowDisputeRecoveryTimeoutSec;

  event JobCreated(
    uint256 indexed jobId,
    address indexed client,
    string title,
    uint256 budget,
    string metadataURI
  );
  event JobApplied(uint256 indexed jobId, address indexed operator, string proposalURI);
  event OperatorSelected(uint256 indexed jobId, address indexed operator);
  event AssignmentAccepted(uint256 indexed jobId, address indexed operator);
  event JobFunded(uint256 indexed jobId, address indexed escrow, uint256 budget);
  event JobCancelled(uint256 indexed jobId);
  event JobReopened(uint256 indexed jobId);
  event JobCompleted(uint256 indexed jobId, address indexed escrow);
  event ApplicationStakeWithdrawn(uint256 indexed jobId, address indexed operator, uint256 amount);
  event ClientCommitmentRefunded(uint256 indexed jobId, uint256 amount);
  event BlockedStatusUpdated(address indexed user, bool blockedStatus);
  event DisputeFeeConfigUpdated(uint256 oldDisputeFee, uint256 newDisputeFee);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address _identityRegistry,
    address _reputationToken,
    address _feeRecipient,
    address _mediator,
    address _mediatorBackup
  ) public initializer {
    if (_feeRecipient == address(0)) revert AddressMismatch();
    if (_mediator == address(0)) revert AddressMismatch();
    if (_mediatorBackup == address(0)) revert AddressMismatch();

    __Ownable_init(msg.sender);
    identityRegistry = IIdentityRegistry(_identityRegistry);
    reputationToken = IReputationToken(_reputationToken);
    feeRecipient = _feeRecipient;
    mediator = _mediator;
    mediatorBackup = _mediatorBackup;

    platformFeeBps = 250;
    clientCommitmentWei = 0.01 ether;
    applicationStakeWei = 0.001 ether;
    applicationCooldownSec = 30 seconds;
    clientCancelGraceSec = 30 minutes;
    selectionTimeoutSec = 10 minutes;
    fundingTimeoutSec = 10 minutes;
    autoBlockPenaltyThreshold = 100;
    minWalletAgeSec = 0;
    minDisputeFee = 0.005 ether;
    escrowReviewTimeoutSec = 30 minutes;
    escrowDisputeResponseWindowSec = 30 minutes;
    escrowDisputeRecoveryTimeoutSec = 14 days;
  }

  /**
   * @dev Dynamic stake: high reputation = lower stake.
   * Formula: baseStake * 100 / (100 + rep)
   */
  function requiredStakeFor(address user) public view returns (uint256) {
    uint256 rep = identityRegistry.getProfile(user).reputationScore;
    return (applicationStakeWei * 100) / (100 + rep);
  }

  modifier notBlocked(address user) {
    if (blocked[user]) revert Blocked();
    _;
  }

  function createJob(
    string calldata title,
    uint256 budget,
    string calldata metadataURI
  ) external payable notBlocked(msg.sender) nonReentrant {
    if (!identityRegistry.hasProfile(msg.sender)) revert ProfileRequired();
    if (identityRegistry.getBaseRole(msg.sender) != 1) {
      revert Unauthorized();
    }
    IIdentityRegistry.Profile memory profile = identityRegistry.getProfile(msg.sender);
    if (block.timestamp - profile.registeredAt < minWalletAgeSec) revert Unauthorized();
    if (bytes(title).length == 0) revert InvalidTitle();
    if (budget == 0) revert InvalidBudget();
    if (msg.value != clientCommitmentWei) revert InvalidStake();

    uint256 jobId = _jobs.length;
    _jobs.push(
      Job({
        escrow: address(0),
        client: msg.sender,
        freelancer: address(0),
        title: title,
        metadataURI: metadataURI,
        budget: budget,
        createdAt: block.timestamp,
        status: JobStatus.OPEN,
        operatorAccepted: false
      })
    );

    _clientCommitmentByJob[jobId] = msg.value;
    _trackUserJob(msg.sender, jobId);
    emit JobCreated(jobId, msg.sender, title, budget, metadataURI);
  }

  function applyToJob(
    uint256 jobId,
    string calldata proposalURI
  ) external payable notBlocked(msg.sender) nonReentrant {
    if (jobId >= _jobs.length) revert JobNotFound();
    Job storage job = _jobs[jobId];
    if (job.status != JobStatus.OPEN) revert JobNotOpen();
    if (msg.sender == job.client) revert Unauthorized();
    if (!identityRegistry.hasProfile(msg.sender)) revert ProfileRequired();
    if (identityRegistry.getBaseRole(msg.sender) != 2) {
      revert Unauthorized();
    }
    if (_applications[jobId][msg.sender].exists) revert AlreadyApplied();
    if (bytes(proposalURI).length == 0) revert InvalidURI();

    uint256 requiredStake = requiredStakeFor(msg.sender);
    if (msg.value != requiredStake) revert InvalidStake();

    uint256 last = lastApplicationAt[msg.sender];
    if (last != 0 && block.timestamp < last + applicationCooldownSec) revert CooldownActive();

    lastApplicationAt[msg.sender] = block.timestamp;
    _applications[jobId][msg.sender] = Application({
      proposalURI: proposalURI,
      appliedAt: block.timestamp,
      exists: true
    });
    _applicationStakeByJob[jobId][msg.sender] = msg.value;
    _jobApplicants[jobId].push(msg.sender);
    _trackUserJob(msg.sender, jobId);

    emit JobApplied(jobId, msg.sender, proposalURI);
  }

  function selectOperator(uint256 jobId, address operator) external notBlocked(msg.sender) {
    Job storage job = _jobs[jobId];
    if (msg.sender != job.client) revert Unauthorized();
    if (job.status != JobStatus.OPEN) revert JobNotOpen();
    if (blocked[operator]) revert Unauthorized();
    if (!_applications[jobId][operator].exists) revert Unauthorized();
    if (_applicationStakeByJob[jobId][operator] == 0) revert NoStake();

    job.freelancer = operator;
    job.status = JobStatus.SELECTED;
    job.operatorAccepted = false;
    _selectedAt[jobId] = block.timestamp;
    _acceptedAt[jobId] = 0;

    _trackUserJob(operator, jobId);
    emit OperatorSelected(jobId, operator);
  }

  function acceptAssignment(uint256 jobId) external notBlocked(msg.sender) {
    Job storage job = _jobs[jobId];
    if (job.status != JobStatus.SELECTED) revert StateMismatch();
    if (msg.sender != job.freelancer) revert Unauthorized();

    job.operatorAccepted = true;
    job.status = JobStatus.ACCEPTED;
    _acceptedAt[jobId] = block.timestamp;
    emit AssignmentAccepted(jobId, msg.sender);
  }

  function fundEscrow(
    uint256 jobId
  ) external payable notBlocked(msg.sender) nonReentrant returns (address escrowAddr) {
    Job storage job = _jobs[jobId];
    if (msg.sender != job.client) revert Unauthorized();
    if (job.status != JobStatus.ACCEPTED) revert StateMismatch();
    if (job.freelancer == address(0)) revert Unauthorized();
    if (msg.value != job.budget) revert InvalidStake();

    if (_acceptedAt[jobId] > 0) {
      if (block.timestamp > _acceptedAt[jobId] + fundingTimeoutSec) revert WindowExpired();
    }

    Escrow escrow = new Escrow{value: msg.value}(
      job.client,
      job.freelancer,
      mediator,
      mediatorBackup,
      address(this),
      platformFeeBps,
      feeRecipient,
      minDisputeFee,
      escrowReviewTimeoutSec,
      escrowDisputeResponseWindowSec,
      escrowDisputeRecoveryTimeoutSec
    );

    escrowAddr = address(escrow);
    job.escrow = escrowAddr;
    job.status = JobStatus.FUNDED;

    _escrowToJobIndex[escrowAddr] = jobId + 1;
    _refundClientCommitment(jobId, job.client);
    _refundOperatorStake(jobId, job.freelancer);

    emit JobFunded(jobId, escrowAddr, msg.value);
  }

  function cancelOpenJob(uint256 jobId) external notBlocked(msg.sender) nonReentrant {
    Job storage job = _jobs[jobId];
    if (msg.sender != job.client) revert Unauthorized();
    if (job.status != JobStatus.OPEN && job.status != JobStatus.SELECTED) revert StateMismatch();

    job.status = JobStatus.CANCELLED;

    uint256 commitment = _clientCommitmentByJob[jobId];
    if (commitment > 0) {
      _clientCommitmentByJob[jobId] = 0;
      if (block.timestamp <= job.createdAt + clientCancelGraceSec) {
        _safeTransfer(job.client, commitment);
        emit ClientCommitmentRefunded(jobId, commitment);
      } else {
        _safeTransfer(feeRecipient, commitment);
        _addPenalty(job.client, 10, 1);
      }
    }

    emit JobCancelled(jobId);
  }

  /// @notice Immediate reopen without slash (manual recovery path).
  function reopenJob(uint256 jobId) external notBlocked(msg.sender) {
    Job storage job = _jobs[jobId];
    if (msg.sender != job.client) revert Unauthorized();
    if (job.status != JobStatus.SELECTED) revert StateMismatch();
    if (job.operatorAccepted) revert AlreadyAccepted();

    job.freelancer = address(0);
    job.status = JobStatus.OPEN;
    _selectedAt[jobId] = 0;
    _acceptedAt[jobId] = 0;
    emit JobReopened(jobId);
  }

  /// @notice Slash selected operator stake if they do not accept in time, then reopen.
  function timeoutReopenAndSlashSelected(
    uint256 jobId
  ) external notBlocked(msg.sender) nonReentrant {
    Job storage job = _jobs[jobId];
    if (msg.sender != job.client) revert Unauthorized();
    if (job.status != JobStatus.SELECTED) revert StateMismatch();
    if (job.operatorAccepted) revert AlreadyAccepted();
    if (_selectedAt[jobId] == 0) revert StateMismatch();
    if (block.timestamp <= _selectedAt[jobId] + selectionTimeoutSec) revert WindowExpired();

    address prevOperator = job.freelancer;
    uint256 stake = _applicationStakeByJob[jobId][prevOperator];
    if (stake > 0) {
      _applicationStakeByJob[jobId][prevOperator] = 0;
      _safeTransfer(job.client, stake);
      emit ApplicationStakeWithdrawn(jobId, prevOperator, stake);
    }

    _addPenalty(prevOperator, 25, 2);

    job.freelancer = address(0);
    job.status = JobStatus.OPEN;
    _selectedAt[jobId] = 0;
    _acceptedAt[jobId] = 0;
    emit JobReopened(jobId);
  }

  /// @notice If client does not fund in time after acceptance, operator can cancel and claim commitment.
  function timeoutCancelByOperator(uint256 jobId) external notBlocked(msg.sender) nonReentrant {
    Job storage job = _jobs[jobId];
    if (job.status != JobStatus.ACCEPTED) revert StateMismatch();
    if (!job.operatorAccepted) revert StateMismatch();
    if (msg.sender != job.freelancer) revert Unauthorized();
    if (_acceptedAt[jobId] == 0) revert StateMismatch();
    if (block.timestamp <= _acceptedAt[jobId] + fundingTimeoutSec) revert WindowExpired();

    uint256 commitment = _clientCommitmentByJob[jobId];
    if (commitment > 0) {
      _clientCommitmentByJob[jobId] = 0;
      _safeTransfer(job.freelancer, commitment);
    }

    _addPenalty(job.client, 25, 3);
    job.status = JobStatus.CANCELLED;
    emit JobCancelled(jobId);
  }

  function withdrawApplicationStake(uint256 jobId) external notBlocked(msg.sender) nonReentrant {
    Job storage job = _jobs[jobId];
    uint256 amount = _applicationStakeByJob[jobId][msg.sender];
    if (amount == 0) revert NoStake();

    bool canWithdraw;
    if (job.status == JobStatus.OPEN) {
      canWithdraw = true;
    } else if (job.status == JobStatus.SELECTED || job.status == JobStatus.ACCEPTED) {
      canWithdraw = msg.sender != job.freelancer;
    } else {
      canWithdraw = true;
    }

    if (!canWithdraw) revert StakeLocked();

    _applicationStakeByJob[jobId][msg.sender] = 0;
    _safeTransfer(msg.sender, amount);
    emit ApplicationStakeWithdrawn(jobId, msg.sender, amount);
  }

  function onJobCompleted(address escrowAddr) external nonReentrant {
    uint256 jobIdPlusOne = _escrowToJobIndex[escrowAddr];
    if (jobIdPlusOne == 0) revert EscrowNotTracked();
    uint256 jobId = jobIdPlusOne - 1;

    Job storage job = _jobs[jobId];
    if (job.escrow != escrowAddr) revert AddressMismatch();

    if (
      msg.sender != job.escrow &&
      msg.sender != owner() &&
      msg.sender != job.client &&
      msg.sender != job.freelancer
    ) revert Unauthorized();

    if (job.status != JobStatus.FUNDED) revert StateMismatch();
    if (IEscrow(payable(escrowAddr)).getState() != IEscrow.State.RELEASED) revert StateMismatch();

    pairCompletions[job.client][job.freelancer] += 1;
    uint256 pairs = pairCompletions[job.client][job.freelancer];
    uint256 repGain = 25;
    if (pairs == 2) repGain = 12;
    if (pairs == 3) repGain = 6;
    if (pairs >= 4) repGain = 0;

    job.status = JobStatus.CLOSED;
    try reputationToken.mintAchievement(job.freelancer, ACHIEVEMENT_JOB_COMPLETE) {} catch {}
    if (repGain > 0) {
      try identityRegistry.incrementReputation(job.freelancer, repGain) {} catch {}
    }
    emit JobCompleted(jobId, escrowAddr);
  }

  function setConfig(uint256 feeBps, address _feeRecipient, address _mediator) external onlyOwner {
    if (feeBps > 1000) revert FeeTooHigh();
    if (_feeRecipient == address(0) || _mediator == address(0)) revert AddressMismatch();
    platformFeeBps = feeBps;
    feeRecipient = _feeRecipient;
    mediator = _mediator;
  }

  function setMediatorBackup(address _mediatorBackup) external onlyOwner {
    if (_mediatorBackup == address(0)) revert AddressMismatch();
    mediatorBackup = _mediatorBackup;
  }

  function setBlocked(address user, bool isBlocked) external onlyOwner {
    blocked[user] = isBlocked;
    emit BlockedStatusUpdated(user, isBlocked);
  }

  function setWalletAgeConfig(uint256 _minWalletAgeSec) external onlyOwner {
    minWalletAgeSec = _minWalletAgeSec;
  }

  function setDisputeFeeConfig(uint256 _minDisputeFee) external onlyOwner {
    uint256 oldFee = minDisputeFee;
    minDisputeFee = _minDisputeFee;
    emit DisputeFeeConfigUpdated(oldFee, _minDisputeFee);
  }

  function setTimingConfig(
    uint256 _applicationCooldownSec,
    uint256 _selectionTimeoutSec,
    uint256 _fundingTimeoutSec,
    uint256 _escrowReviewTimeoutSec,
    uint256 _escrowDisputeResponseWindowSec,
    uint256 _escrowDisputeRecoveryTimeoutSec
  ) external onlyOwner {
    applicationCooldownSec = _applicationCooldownSec;
    selectionTimeoutSec = _selectionTimeoutSec;
    fundingTimeoutSec = _fundingTimeoutSec;
    escrowReviewTimeoutSec = _escrowReviewTimeoutSec;
    escrowDisputeResponseWindowSec = _escrowDisputeResponseWindowSec;
    escrowDisputeRecoveryTimeoutSec = _escrowDisputeRecoveryTimeoutSec;
  }

  function getDisputeFee(address user) external view returns (uint256) {
    user;
    return minDisputeFee;
  }

  function getJob(uint256 jobId) external view returns (Job memory) {
    return _jobs[jobId];
  }

  function getJobsByUser(address user) external view returns (uint256[] memory) {
    return _userJobs[user];
  }

  function getApplicants(uint256 jobId) external view returns (address[] memory) {
    return _jobApplicants[jobId];
  }

  function totalJobs() external view returns (uint256) {
    return _jobs.length;
  }

  function getApplication(
    uint256 jobId,
    address operator
  ) external view returns (Application memory) {
    return _applications[jobId][operator];
  }

  function _refundClientCommitment(uint256 jobId, address client) internal {
    uint256 commitment = _clientCommitmentByJob[jobId];
    if (commitment > 0) {
      _clientCommitmentByJob[jobId] = 0;
      _safeTransfer(client, commitment);
      emit ClientCommitmentRefunded(jobId, commitment);
    }
  }

  function _refundOperatorStake(uint256 jobId, address operator) internal {
    uint256 stake = _applicationStakeByJob[jobId][operator];
    if (stake > 0) {
      _applicationStakeByJob[jobId][operator] = 0;
      _safeTransfer(operator, stake);
      emit ApplicationStakeWithdrawn(jobId, operator, stake);
    }
  }

  function _addPenalty(address user, uint256 points, uint8 reasonCode) internal {
    penaltyPoints[user] += points;
    reasonCode;

    if (
      autoBlockPenaltyThreshold > 0 &&
      penaltyPoints[user] >= autoBlockPenaltyThreshold &&
      !blocked[user]
    ) {
      blocked[user] = true;
      emit BlockedStatusUpdated(user, true);
    }
  }

  function _safeTransfer(address to, uint256 amount) internal {
    if (amount == 0) return;
    // Cap gas at 50k to prevent external contract from gas griefing
    // and blocking the rest of the transaction.
    (bool ok, ) = to.call{value: amount, gas: 50000}('');
    if (!ok) {
      pendingWithdrawals[to] += amount;
    }
  }

  function _trackUserJob(address user, uint256 jobId) internal {
    if (!_userHasJob[user][jobId]) {
      _userHasJob[user][jobId] = true;
      _userJobs[user].push(jobId);
    }
  }

  function withdraw() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    if (amount == 0) revert NoStake();

    pendingWithdrawals[msg.sender] = 0;
    (bool ok, ) = msg.sender.call{value: amount}('');
    if (!ok) revert WithdrawFailed();
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
