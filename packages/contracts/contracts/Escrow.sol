// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './interfaces/IEscrow.sol';

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
  address public immutable factory;
  uint256 public immutable platformFeeBps; // basis points (e.g., 250 = 2.5%)
  address public immutable feeRecipient;

  // --- Mutable State ---
  State private _state;
  string public deliverableURI;
  address public disputeRaiser;
  uint256 public disputedAt;
  string public disputeReason;
  uint256 public _submittedAt;
  uint256 public constant REVIEW_TIMEOUT = 7 days;
  uint256 public constant DISPUTE_RESPONSE_WINDOW = 3 days;

  string public _disputeEvidenceURI;
  string public _counterEvidenceURI;
  string public _resolutionReasonHash;

  // --- Errors ---
  error Unauthorized();
  error InvalidState(State current, State expected);

  // --- Constructor ---
  constructor(
    address _client,
    address _freelancer,
    address _mediator,
    address _factory,
    uint256 _feeBps,
    address _feeRecipient
  ) payable {
    require(msg.value > 0, 'Escrow: must fund on creation');
    require(_client != _freelancer, 'Escrow: client != freelancer');

    client = _client;
    freelancer = _freelancer;
    mediator = _mediator;
    factory = _factory;
    platformFeeBps = _feeBps;
    feeRecipient = _feeRecipient;
    _state = State.FUNDED;
  }

  // --- External Functions ---

  /// @notice Freelancer submits their work deliverable URI.
  function submitWork(string calldata uri) external override {
    if (msg.sender != freelancer) revert Unauthorized();
    _requireState(State.FUNDED);

    deliverableURI = uri;
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
  function raiseDispute(string calldata reason, string calldata evidenceURI) external override {
    if (msg.sender != client && msg.sender != freelancer) revert Unauthorized();
    _requireState(State.SUBMITTED);
    require(bytes(reason).length > 0, 'Escrow: dispute reason required');

    disputeRaiser = msg.sender;
    disputedAt = block.timestamp;
    disputeReason = reason;
    _disputeEvidenceURI = evidenceURI;
    _state = State.DISPUTED;
    emit DisputeRaised(msg.sender, reason, evidenceURI);
  }

  /// @notice The other party can submit their evidence during the window.
  function submitCounterEvidence(string calldata evidenceURI) external override {
    if (msg.sender != client && msg.sender != freelancer) revert Unauthorized();
    _requireState(State.DISPUTED);
    require(msg.sender != disputeRaiser, 'Escrow: raiser cannot counter-evidence');

    _counterEvidenceURI = evidenceURI;
    emit CounterEvidenceSubmitted(msg.sender, evidenceURI);
  }

  /// @notice Mediator resolves dispute by choosing winner (client or freelancer).
  function resolveDispute(
    address winner,
    string calldata reasonHash
  ) external override nonReentrant {
    if (msg.sender != mediator) revert Unauthorized();
    _requireState(State.DISPUTED);
    require(winner == client || winner == freelancer, 'Escrow: invalid winner');
    require(
      block.timestamp > disputedAt + DISPUTE_RESPONSE_WINDOW,
      'Escrow: response window active'
    );

    _resolutionReasonHash = reasonHash;
    emit DisputeResolved(mediator, winner, reasonHash);
    _releaseFunds(winner);
  }

  /// @notice Mediator resolves dispute by splitting funds.
  function resolveDisputeSplit(
    uint256 clientShareBps,
    string calldata reasonHash
  ) external override nonReentrant {
    if (msg.sender != mediator) revert Unauthorized();
    _requireState(State.DISPUTED);
    require(clientShareBps <= 10000, 'Escrow: invalid split');
    require(
      block.timestamp > disputedAt + DISPUTE_RESPONSE_WINDOW,
      'Escrow: response window active'
    );

    _resolutionReasonHash = reasonHash;
    emit DisputeResolvedSplit(mediator, reasonHash, clientShareBps);

    uint256 total = address(this).balance;
    uint256 fee = (total * platformFeeBps) / 10000;
    uint256 payout = total - fee;

    uint256 clientPayout = (payout * clientShareBps) / 10000;
    uint256 freelancerPayout = payout - clientPayout;

    _state = State.RELEASED;

    if (fee > 0 && feeRecipient != address(0)) {
      (bool feeOk, ) = feeRecipient.call{value: fee}('');
      require(feeOk, 'Escrow: fee transfer failed');
    }

    if (clientPayout > 0) {
      (bool cOk, ) = client.call{value: clientPayout}('');
      require(cOk, 'Escrow: client payout failed');
    }

    if (freelancerPayout > 0) {
      (bool fOk, ) = freelancer.call{value: freelancerPayout}('');
      require(fOk, 'Escrow: freelancer payout failed');
    }

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
    require(block.timestamp > _submittedAt + REVIEW_TIMEOUT, 'Escrow: review timeout not reached');

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
    (bool ok, ) = client.call{value: amount}('');
    require(ok, 'Escrow: refund failed');

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

    if (fee > 0 && feeRecipient != address(0)) {
      (bool feeOk, ) = feeRecipient.call{value: fee}('');
      require(feeOk, 'Escrow: fee transfer failed');
    }

    (bool ok, ) = winner.call{value: payout}('');
    require(ok, 'Escrow: payout failed');

    emit FundsReleased(winner, payout);

    // Notify factory for reputation. This is a low-level call to ensure
    // that if the factory reverts (e.g. gas issues), the funds release still completes.
    if (factory != address(0)) {
      (bool success, ) = factory.call(
        abi.encodeWithSignature('onJobCompleted(address)', address(this))
      );
      success; // suppress unused variable warning
    }
  }
}
