// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './interfaces/IEscrow.sol';

interface IEscrowFactoryDisputes {
  function getDisputeFee(address user) external view returns (uint256);
}

/**
 * @title Escrow
 * @notice Holds payment for a single freelance job. State machine:
 *         FUNDED → SUBMITTED → APPROVED → RELEASED
 *                           ↘ DISPUTED → (resolved) → RELEASED | REFUNDED
 *                           ↘ REFUNDED (if client cancels before submission)
 *
 *  Roles: client, freelancer, mediator (optional — set by EscrowFactory).
 */
contract Escrow is IEscrow, ReentrancyGuard {
  // --- Immutable State ---
  address public immutable client;
  address public immutable freelancer;
  address public immutable mediator;
  address public immutable mediatorBackup;
  address public immutable factory;
  uint256 public immutable platformFeeBps; // basis points (e.g., 250 = 2.5%)
  address public immutable feeRecipient;

  // --- Mutable State ---
  State private _state;
  string public deliverableURI;
  bytes32 private _lastSubmissionHash;
  address public disputeRaiser;
  uint256 public disputedAt;
  string public disputeReason;
  uint256 public _submittedAt;
  uint256 public reviewTimeoutSec;
  uint256 public disputeResponseWindowSec;
  uint256 public disputeRecoveryTimeoutSec;

  mapping(address => uint256) public pendingWithdrawals;

  event FundsWithdrawn(address indexed user, uint256 amount);
  event WithdrawalFailed(address indexed user, uint256 amount);
  event DisputeTimeoutResolved(
    address indexed caller,
    uint256 clientRefund,
    uint256 freelancerPayout
  );

  string public _disputeEvidenceURI;
  string public _counterEvidenceURI;
  string public _resolutionReasonHash;
  uint256 public disputeFee;
  bool public hadDispute;
  bool public counterEvidenceSubmitted;
  address public finalWinner;
  bool public disputeWasSplitOrTimeout;

  // --- Errors ---
  error Unauthorized();
  error InvalidState(State current, State expected);

  // --- Constructor ---
  constructor(
    address _client,
    address _freelancer,
    address _mediator,
    address _mediatorBackup,
    address _factory,
    uint256 _feeBps,
    address _feeRecipient,
    uint256 _disputeFee,
    uint256 _reviewTimeoutSec,
    uint256 _disputeResponseWindowSec,
    uint256 _disputeRecoveryTimeoutSec
  ) payable {
    require(msg.value > 0, 'Escrow: must fund on creation');
    require(_client != _freelancer, 'Escrow: client != freelancer');

    client = _client;
    freelancer = _freelancer;
    mediator = _mediator;
    mediatorBackup = _mediatorBackup;
    factory = _factory;
    platformFeeBps = _feeBps;
    feeRecipient = _feeRecipient;
    disputeFee = _disputeFee;
    reviewTimeoutSec = _reviewTimeoutSec;
    disputeResponseWindowSec = _disputeResponseWindowSec;
    disputeRecoveryTimeoutSec = _disputeRecoveryTimeoutSec;
    _state = State.FUNDED;
  }

  // --- External Functions ---

  /// @notice Freelancer submits their work deliverable URI.
  function submitWork(string calldata uri) external override {
    if (msg.sender != freelancer) revert Unauthorized();
    _requireState(State.FUNDED);
    require(bytes(uri).length > 10, 'Escrow: uri too short');
    bytes32 uriHash = keccak256(bytes(uri));
    require(uriHash != _lastSubmissionHash, 'Escrow: duplicate submission');

    deliverableURI = uri;
    _lastSubmissionHash = uriHash;
    _submittedAt = block.timestamp;
    _state = State.SUBMITTED;
    emit WorkSubmitted(freelancer, uri);
  }

  /// @notice Client approves work and triggers fund release.
  function approveWork() external override nonReentrant {
    if (msg.sender != client) revert Unauthorized();
    _requireState(State.SUBMITTED);

    _state = State.APPROVED;
    emit WorkApproved(client, address(this).balance);

    _releaseFunds(freelancer);
  }

  /// @notice Client or freelancer can raise a dispute after submission.
  function raiseDispute(
    string calldata reason,
    string calldata evidenceURI
  ) external payable override {
    if (msg.sender != client && msg.sender != freelancer) revert Unauthorized();
    _requireState(State.SUBMITTED);
    require(bytes(reason).length > 0, 'Escrow: dispute reason required');
    uint256 requiredFee = disputeFee;
    if (factory != address(0)) {
      try IEscrowFactoryDisputes(factory).getDisputeFee(msg.sender) returns (uint256 dynamicFee) {
        requiredFee = dynamicFee;
      } catch {}
    }
    require(msg.value >= requiredFee, 'Escrow: dispute fee too low');

    disputeRaiser = msg.sender;
    disputedAt = block.timestamp;
    disputeReason = reason;
    _disputeEvidenceURI = evidenceURI;
    hadDispute = true;
    _state = State.DISPUTED;
    emit DisputeRaised(msg.sender, reason, evidenceURI);

    if (requiredFee > 0 && feeRecipient != address(0)) {
      _safeTransfer(feeRecipient, requiredFee);
    }
    uint256 overpayment = msg.value - requiredFee;
    if (overpayment > 0) {
      _safeTransfer(msg.sender, overpayment);
    }
  }

  /// @notice The other party can submit their evidence during the window.
  function submitCounterEvidence(string calldata evidenceURI) external override {
    if (msg.sender != client && msg.sender != freelancer) revert Unauthorized();
    _requireState(State.DISPUTED);
    require(msg.sender != disputeRaiser, 'Escrow: raiser cannot counter-evidence');
    require(!counterEvidenceSubmitted, 'Escrow: counter evidence already submitted');

    _counterEvidenceURI = evidenceURI;
    counterEvidenceSubmitted = true;
    emit CounterEvidenceSubmitted(msg.sender, evidenceURI);
  }

  /// @notice Mediator resolves dispute by choosing winner (client or freelancer).
  function resolveDispute(
    address winner,
    string calldata reasonHash
  ) external override nonReentrant {
    if (msg.sender != mediator && msg.sender != mediatorBackup) revert Unauthorized();
    _requireState(State.DISPUTED);
    require(winner == client || winner == freelancer, 'Escrow: invalid winner');
    require(
      block.timestamp > disputedAt + disputeResponseWindowSec,
      'Escrow: response window active'
    );

    _resolutionReasonHash = reasonHash;
    finalWinner = winner;
    emit DisputeResolved(msg.sender, winner, reasonHash);
    _releaseFunds(winner);
  }

  /**
   * @notice If the mediator fails to resolve the dispute within 14 days, anyone can call this
   * to split the funds 50/50 and prevent permanent lock.
   */
  function resolveByTimeout() external override nonReentrant {
    _requireState(State.DISPUTED);
    require(
      block.timestamp > disputedAt + disputeRecoveryTimeoutSec,
      'Escrow: recovery timeout not reached'
    );

    uint256 total = address(this).balance;
    uint256 half = total / 2;
    uint256 otherHalf = total - half;

    _state = State.RELEASED;
    disputeWasSplitOrTimeout = true;

    _safeTransfer(client, half);
    _safeTransfer(freelancer, otherHalf);

    emit DisputeTimeoutResolved(msg.sender, half, otherHalf);

    // Notify factory
    if (factory != address(0)) {
      (bool success, ) = factory.call(
        abi.encodeWithSignature('onJobCompleted(address)', address(this))
      );
      success;
    }
  }

  /**
   * @notice Allows users to withdraw funds that failed to transfer automatically.
   */
  function withdraw() external override nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, 'Escrow: no funds to withdraw');

    pendingWithdrawals[msg.sender] = 0;
    (bool ok, ) = msg.sender.call{value: amount}('');
    require(ok, 'Escrow: withdraw failed');

    emit FundsWithdrawn(msg.sender, amount);
  }

  /// @notice Mediator resolves dispute by splitting funds.
  function resolveDisputeSplit(
    uint256 clientShareBps,
    string calldata reasonHash
  ) external override nonReentrant {
    if (msg.sender != mediator && msg.sender != mediatorBackup) revert Unauthorized();
    _requireState(State.DISPUTED);
    require(clientShareBps <= 10000, 'Escrow: invalid split');
    require(
      block.timestamp > disputedAt + disputeResponseWindowSec,
      'Escrow: response window active'
    );

    _resolutionReasonHash = reasonHash;
    emit DisputeResolvedSplit(msg.sender, reasonHash, clientShareBps);

    uint256 total = address(this).balance;
    uint256 fee = (total * platformFeeBps) / 10000;
    uint256 payout = total - fee;

    uint256 clientPayout = (payout * clientShareBps) / 10000;
    uint256 freelancerPayout = payout - clientPayout;

    _state = State.RELEASED;
    disputeWasSplitOrTimeout = true;

    if (fee > 0 && feeRecipient != address(0)) {
      _safeTransfer(feeRecipient, fee);
    }

    _safeTransfer(client, clientPayout);
    _safeTransfer(freelancer, freelancerPayout);

    // Notify factory for reputation
    if (factory != address(0)) {
      (bool success, ) = factory.call(
        abi.encodeWithSignature('onJobCompleted(address)', address(this))
      );
      success; // suppress unused variable warning
      // We don't require() here to prevent reputation errors from blocking fund release,
      // but we log it if needed in a more advanced setting.
    }
  }

  /// @notice Anyone can trigger after review timeout to release funds to freelancer.
  function autoApprove() external override nonReentrant {
    _requireState(State.SUBMITTED);
    require(_submittedAt > 0, 'Escrow: not submitted');
    require(
      block.timestamp > _submittedAt + reviewTimeoutSec,
      'Escrow: review timeout not reached'
    );

    _state = State.APPROVED;
    emit WorkApproved(client, address(this).balance);

    _releaseFunds(freelancer);
  }

  /// @notice Client can cancel and reclaim funds before freelancer submits.
  function refund() external override nonReentrant {
    if (msg.sender != client) revert Unauthorized();
    _requireState(State.FUNDED);

    _state = State.REFUNDED;
    uint256 amount = address(this).balance;
    _safeTransfer(client, amount);
    emit Refunded(client, amount);
  }

  /// @notice Returns the current state of the escrow.
  function getState() external view override returns (State) {
    return _state;
  }

  function disputeEvidenceURI() external view override returns (string memory) {
    return _disputeEvidenceURI;
  }

  function counterEvidenceURI() external view override returns (string memory) {
    return _counterEvidenceURI;
  }

  function resolutionReasonHash() external view override returns (string memory) {
    return _resolutionReasonHash;
  }

  receive() external payable {}

  fallback() external payable {}

  // --- Internal Helpers ---

  function _requireState(State expected) internal view {
    if (_state != expected) revert InvalidState(_state, expected);
  }

  /**
   * @dev Deducts platform fee and sends the rest to the winner.
   */
  function _releaseFunds(address winner) internal {
    uint256 total = address(this).balance;
    uint256 fee = (total * platformFeeBps) / 10_000;
    uint256 payout = total - fee;

    _state = State.RELEASED;
    finalWinner = winner;

    if (fee > 0 && feeRecipient != address(0)) {
      (bool feeOk, ) = feeRecipient.call{value: fee, gas: 50000}('');
      if (!feeOk) {
        pendingWithdrawals[feeRecipient] += fee;
        emit WithdrawalFailed(feeRecipient, fee);
      }
    }

    _safeTransfer(winner, payout);
    emit FundsReleased(winner, payout);

    // Notify factory for reputation.
    if (factory != address(0)) {
      (bool success, ) = factory.call(
        abi.encodeWithSignature('onJobCompleted(address)', address(this))
      );
      success;
    }
  }

  function _safeTransfer(address to, uint256 amount) internal {
    if (amount == 0) return;
    // Cap gas at 50k to prevent external contract from gas griefing
    // and blocking the rest of the transaction.
    (bool ok, ) = to.call{value: amount, gas: 50000}('');
    if (!ok) {
      pendingWithdrawals[to] += amount;
      emit WithdrawalFailed(to, amount);
    }
  }
}
