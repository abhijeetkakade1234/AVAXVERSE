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

  error Unauthorized();
  error InvalidBudget();
  error JobNotOpen();
  error AlreadyApplied();
  error CooldownActive();
  error InvalidStake();
  error NotSelected();
  error AlreadyAccepted();
  error NotFunded();
  error ProfileRequired();
  error NotMediator();
  error StakeLocked();
  error EscrowNotTracked();
  error AddressMismatch();
  error StateMismatch();
  error FeeTooHigh();
  error InvalidTitle();
  error WindowExpired();
  error NoStake();
  error Blocked();
  error WithdrawFailed();
  error ApplicationNotFound();
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

  string private constant ACHIEVEMENT_JOB_COMPLETE = 'ipfs://avaxverse/achievement/job-complete';

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

  event FundsWithdrawn(address indexed user, uint256 amount);
  event WithdrawalFailed(address indexed user, uint256 amount);
  event ReputationUpdateFailed(uint256 indexed jobId, address indexed user, string reason);

  mapping(uint256 => address[]) private _jobApplicants;
  mapping(uint256 => mapping(address => Application)) private _applications;

  mapping(uint256 => uint256) private _clientCommitmentByJob;
  mapping(uint256 => mapping(address => uint256)) private _applicationStakeByJob;

  mapping(uint256 => uint256) private _selectedAt;
  mapping(uint256 => uint256) private _acceptedAt;

  mapping(address => uint256) public lastApplicationAt;
  mapping(address => bool) public blocked;
  mapping(address => uint256) public penaltyPoints;

  // Append new variables at the end
  mapping(address => uint256) public pendingWithdrawals;
  mapping(address => mapping(uint256 => bool)) private _userHasJob;

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
  event PenaltyApplied(address indexed user, uint256 points, string reason);
  event BlockedStatusUpdated(address indexed user, bool blockedStatus);
  event AntiFraudConfigUpdated(
    uint256 clientCommitmentWei,
    uint256 applicationStakeWei,
    uint256 applicationCooldownSec,
    uint256 clientCancelGraceSec,
    uint256 selectionTimeoutSec,
    uint256 fundingTimeoutSec,
    uint256 autoBlockPenaltyThreshold
  );
  event ConfigUpdated(uint256 feeBps, address feeRecipient, address mediator);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address _identityRegistry,
    address _reputationToken,
    address _feeRecipient,
    address _mediator
  ) public initializer {
    __Ownable_init(msg.sender);
    identityRegistry = IIdentityRegistry(_identityRegistry);
    reputationToken = IReputationToken(_reputationToken);
    feeRecipient = _feeRecipient;
    mediator = _mediator;

    platformFeeBps = 250;
    clientCommitmentWei = 0.01 ether;
    applicationStakeWei = 0.001 ether;
    applicationCooldownSec = 10 minutes;
    clientCancelGraceSec = 30 minutes;
    selectionTimeoutSec = 24 hours;
    fundingTimeoutSec = 24 hours;
    autoBlockPenaltyThreshold = 100;
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
    if (_applications[jobId][msg.sender].exists) revert AlreadyApplied();
    if (bytes(proposalURI).length == 0) revert('URI required');

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
    if (!_applications[jobId][operator].exists) revert ApplicationNotFound();

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
      address(this),
      platformFeeBps,
      feeRecipient
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
        _addPenalty(job.client, 10, 'Late cancellation');
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
  ) external nonReentrant notBlocked(msg.sender) {
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

    _addPenalty(prevOperator, 25, 'Did not accept assignment');

    job.freelancer = address(0);
    job.status = JobStatus.OPEN;
    _selectedAt[jobId] = 0;
    _acceptedAt[jobId] = 0;
    emit JobReopened(jobId);
  }

  /// @notice If client does not fund in time after acceptance, operator can cancel and claim commitment.
  function timeoutCancelByOperator(uint256 jobId) external nonReentrant notBlocked(msg.sender) {
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

    _addPenalty(job.client, 25, 'Did not fund escrow after operator acceptance');
    job.status = JobStatus.CANCELLED;
    emit JobCancelled(jobId);
  }

  function withdrawApplicationStake(uint256 jobId) external nonReentrant notBlocked(msg.sender) {
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
    _applications[jobId][msg.sender].exists = false; // Fix: Mark application as removed
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

    job.status = JobStatus.CLOSED;
    try reputationToken.mintAchievement(job.freelancer, ACHIEVEMENT_JOB_COMPLETE) {} catch {
      emit ReputationUpdateFailed(jobId, job.freelancer, 'Mint fail');
    }
    try identityRegistry.incrementReputation(job.freelancer, 25) {} catch {
      emit ReputationUpdateFailed(jobId, job.freelancer, 'Rep fail');
    }
    emit JobCompleted(jobId, escrowAddr);
  }

  function setConfig(uint256 feeBps, address _feeRecipient, address _mediator) external onlyOwner {
    if (feeBps > 1000) revert FeeTooHigh();
    platformFeeBps = feeBps;
    feeRecipient = _feeRecipient;
    mediator = _mediator;
    emit ConfigUpdated(feeBps, _feeRecipient, _mediator);
  }

  /**
   * @notice Allows users to withdraw any funds that failed to transfer automatically.
   */
  function withdraw() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    if (amount == 0) revert NoStake();

    pendingWithdrawals[msg.sender] = 0;
    (bool ok, ) = msg.sender.call{value: amount}('');
    if (!ok) revert WithdrawFailed();

    emit FundsWithdrawn(msg.sender, amount);
  }

  function setAntiFraudConfig(
    uint256 _clientCommitmentWei,
    uint256 _applicationStakeWei,
    uint256 _applicationCooldownSec,
    uint256 _clientCancelGraceSec,
    uint256 _selectionTimeoutSec,
    uint256 _fundingTimeoutSec,
    uint256 _autoBlockPenaltyThreshold
  ) external onlyOwner {
    clientCommitmentWei = _clientCommitmentWei;
    applicationStakeWei = _applicationStakeWei;
    applicationCooldownSec = _applicationCooldownSec;
    clientCancelGraceSec = _clientCancelGraceSec;
    selectionTimeoutSec = _selectionTimeoutSec;
    fundingTimeoutSec = _fundingTimeoutSec;
    autoBlockPenaltyThreshold = _autoBlockPenaltyThreshold;

    emit AntiFraudConfigUpdated(
      _clientCommitmentWei,
      _applicationStakeWei,
      _applicationCooldownSec,
      _clientCancelGraceSec,
      _selectionTimeoutSec,
      _fundingTimeoutSec,
      _autoBlockPenaltyThreshold
    );
  }

  function setBlocked(address user, bool isBlocked) external onlyOwner {
    blocked[user] = isBlocked;
    emit BlockedStatusUpdated(user, isBlocked);
  }

  function clearPenalty(address user) external onlyOwner {
    penaltyPoints[user] = 0;
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

  function getSelectedTimestamps(
    uint256 jobId
  ) external view returns (uint256 selectedAt, uint256 acceptedAt) {
    return (_selectedAt[jobId], _acceptedAt[jobId]);
  }

  function getClientCommitment(uint256 jobId) external view returns (uint256) {
    return _clientCommitmentByJob[jobId];
  }

  function getApplicationStake(uint256 jobId, address operator) external view returns (uint256) {
    return _applicationStakeByJob[jobId][operator];
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

  function _addPenalty(address user, uint256 points, string memory reason) internal {
    penaltyPoints[user] += points;
    emit PenaltyApplied(user, points, reason);

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
    (bool ok, ) = to.call{value: amount, gas: 50000}('');
    if (!ok) {
      pendingWithdrawals[to] += amount;
      emit WithdrawalFailed(to, amount);
    }
  }

  function _trackUserJob(address user, uint256 jobId) internal {
    if (!_userHasJob[user][jobId]) {
      _userHasJob[user][jobId] = true;
      _userJobs[user].push(jobId);
    }
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
