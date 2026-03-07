// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';
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
contract EscrowFactory is Ownable, ReentrancyGuard {
  uint256 public platformFeeBps = 250; // 2.5%
  address public feeRecipient;
  address public mediator;

  // --- Anti-fraud config ---
  uint256 public clientCommitmentWei = 0.01 ether;
  uint256 public applicationStakeWei = 0.001 ether;
  uint256 public applicationCooldownSec = 10 minutes;
  uint256 public clientCancelGraceSec = 30 minutes;
  uint256 public selectionTimeoutSec = 24 hours;
  uint256 public fundingTimeoutSec = 24 hours;
  uint256 public autoBlockPenaltyThreshold = 100;

  IIdentityRegistry public immutable identityRegistry;
  IReputationToken public immutable reputationToken;

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
  mapping(address => mapping(uint256 => bool)) private _userHasJob;

  mapping(uint256 => address[]) private _jobApplicants;
  mapping(uint256 => mapping(address => Application)) private _applications;

  mapping(uint256 => uint256) private _clientCommitmentByJob;
  mapping(uint256 => mapping(address => uint256)) private _applicationStakeByJob;

  mapping(uint256 => uint256) private _selectedAt;
  mapping(uint256 => uint256) private _acceptedAt;

  mapping(address => uint256) public lastApplicationAt;
  mapping(address => bool) public blocked;
  mapping(address => uint256) public penaltyPoints;

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

  constructor(
    address _identityRegistry,
    address _reputationToken,
    address _feeRecipient,
    address _mediator
  ) Ownable(msg.sender) {
    identityRegistry = IIdentityRegistry(_identityRegistry);
    reputationToken = IReputationToken(_reputationToken);
    feeRecipient = _feeRecipient;
    mediator = _mediator;
  }

  /**
   * @dev Dynamic stake: high reputation = lower stake.
   * Formula: baseStake * 1000 / (100 + rep)
   */
  function requiredStakeFor(address user) public view returns (uint256) {
    uint256 rep = IReputationToken(reputationToken).getScore(user);
    return (applicationStakeWei * 1000) / (100 + rep);
  }

  modifier notBlocked(address user) {
    require(!blocked[user], 'EscrowFactory: user blocked');
    _;
  }

  function createJob(
    string calldata title,
    uint256 budget,
    string calldata metadataURI
  ) external payable notBlocked(msg.sender) returns (uint256 jobId) {
    require(identityRegistry.hasProfile(msg.sender), 'EscrowFactory: client must have profile');
    require(bytes(title).length > 0, 'EscrowFactory: title required');
    require(budget > 0, 'EscrowFactory: budget must be > 0');
    require(msg.value == clientCommitmentWei, 'EscrowFactory: invalid commitment deposit');

    jobId = _jobs.length;
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
    Job storage job = _jobs[jobId];
    require(job.status == JobStatus.OPEN, 'EscrowFactory: job not open');
    require(msg.sender != job.client, 'EscrowFactory: client cannot apply');
    require(identityRegistry.hasProfile(msg.sender), 'EscrowFactory: operator must have profile');
    require(!_applications[jobId][msg.sender].exists, 'EscrowFactory: already applied');
    require(bytes(proposalURI).length > 0, 'EscrowFactory: proposal required');

    uint256 requiredStake = requiredStakeFor(msg.sender);
    require(msg.value == requiredStake, 'EscrowFactory: invalid application stake');

    uint256 last = lastApplicationAt[msg.sender];
    require(
      last == 0 || block.timestamp >= last + applicationCooldownSec,
      'EscrowFactory: application cooldown active'
    );

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
    require(msg.sender == job.client, 'EscrowFactory: only client');
    require(job.status == JobStatus.OPEN, 'EscrowFactory: job not open');
    require(!blocked[operator], 'EscrowFactory: operator blocked');
    require(_applications[jobId][operator].exists, 'EscrowFactory: operator did not apply');

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
    require(job.status == JobStatus.SELECTED, 'EscrowFactory: job not selected');
    require(msg.sender == job.freelancer, 'EscrowFactory: only selected operator');

    job.operatorAccepted = true;
    job.status = JobStatus.ACCEPTED;
    _acceptedAt[jobId] = block.timestamp;
    emit AssignmentAccepted(jobId, msg.sender);
  }

  function fundEscrow(
    uint256 jobId
  ) external payable notBlocked(msg.sender) nonReentrant returns (address escrowAddr) {
    Job storage job = _jobs[jobId];
    require(msg.sender == job.client, 'EscrowFactory: only client');
    require(job.status == JobStatus.ACCEPTED, 'EscrowFactory: job not accepted');
    require(job.freelancer != address(0), 'EscrowFactory: no operator selected');
    require(msg.value == job.budget, 'EscrowFactory: incorrect funding amount');

    if (_acceptedAt[jobId] > 0) {
      require(
        block.timestamp <= _acceptedAt[jobId] + fundingTimeoutSec,
        'EscrowFactory: funding window expired'
      );
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
    require(msg.sender == job.client, 'EscrowFactory: only client');
    require(
      job.status == JobStatus.OPEN || job.status == JobStatus.SELECTED,
      'EscrowFactory: cannot cancel'
    );

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
    require(msg.sender == job.client, 'EscrowFactory: only client');
    require(job.status == JobStatus.SELECTED, 'EscrowFactory: job not selected');
    require(!job.operatorAccepted, 'EscrowFactory: already accepted');

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
    require(msg.sender == job.client, 'EscrowFactory: only client');
    require(job.status == JobStatus.SELECTED, 'EscrowFactory: job not selected');
    require(!job.operatorAccepted, 'EscrowFactory: already accepted');
    require(_selectedAt[jobId] > 0, 'EscrowFactory: no selection timestamp');
    require(
      block.timestamp > _selectedAt[jobId] + selectionTimeoutSec,
      'EscrowFactory: selection timeout not reached'
    );

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
    require(job.status == JobStatus.ACCEPTED, 'EscrowFactory: job not accepted');
    require(job.operatorAccepted, 'EscrowFactory: operator not accepted');
    require(msg.sender == job.freelancer, 'EscrowFactory: only selected operator');
    require(_acceptedAt[jobId] > 0, 'EscrowFactory: no acceptance timestamp');
    require(
      block.timestamp > _acceptedAt[jobId] + fundingTimeoutSec,
      'EscrowFactory: funding timeout not reached'
    );

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
    require(amount > 0, 'EscrowFactory: no stake');

    bool canWithdraw;
    if (job.status == JobStatus.OPEN) {
      canWithdraw = true;
    } else if (job.status == JobStatus.SELECTED || job.status == JobStatus.ACCEPTED) {
      canWithdraw = msg.sender != job.freelancer;
    } else {
      canWithdraw = true;
    }

    require(canWithdraw, 'EscrowFactory: selected operator stake locked');

    _applicationStakeByJob[jobId][msg.sender] = 0;
    _safeTransfer(msg.sender, amount);
    emit ApplicationStakeWithdrawn(jobId, msg.sender, amount);
  }

  function onJobCompleted(address escrowAddr) external nonReentrant {
    uint256 jobIdPlusOne = _escrowToJobIndex[escrowAddr];
    require(jobIdPlusOne > 0, 'EscrowFactory: escrow not tracked');
    uint256 jobId = jobIdPlusOne - 1;

    require(jobId < _jobs.length, 'EscrowFactory: invalid job index');
    Job storage job = _jobs[jobId];
    require(job.escrow == escrowAddr, 'EscrowFactory: address mismatch');

    require(
      msg.sender == job.escrow ||
        msg.sender == owner() ||
        msg.sender == job.client ||
        msg.sender == job.freelancer,
      'EscrowFactory: unauthorized completion'
    );
    require(job.status == JobStatus.FUNDED, 'EscrowFactory: job not in funded state');
    require(
      IEscrow(payable(escrowAddr)).getState() == IEscrow.State.RELEASED,
      'EscrowFactory: funds not yet released'
    );

    job.status = JobStatus.CLOSED;
    try reputationToken.mintAchievement(job.freelancer, ACHIEVEMENT_JOB_COMPLETE) {} catch {}
    try identityRegistry.incrementReputation(job.freelancer, 25) {} catch {}
    emit JobCompleted(jobId, escrowAddr);
  }

  function setConfig(uint256 feeBps, address _feeRecipient, address _mediator) external onlyOwner {
    require(feeBps <= 1000, 'EscrowFactory: fee too high');
    platformFeeBps = feeBps;
    feeRecipient = _feeRecipient;
    mediator = _mediator;
    emit ConfigUpdated(feeBps, _feeRecipient, _mediator);
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
    (bool ok, ) = to.call{value: amount}('');
    require(ok, 'EscrowFactory: transfer failed');
  }

  function _trackUserJob(address user, uint256 jobId) internal {
    if (!_userHasJob[user][jobId]) {
      _userHasJob[user][jobId] = true;
      _userJobs[user].push(jobId);
    }
  }
}
