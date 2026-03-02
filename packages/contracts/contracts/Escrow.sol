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
    uint256 public immutable platformFeeBps; // basis points (e.g., 250 = 2.5%)
    address public immutable feeRecipient;

    // --- Mutable State ---
    State private _state;
    string public deliverableURI;

    // --- Errors ---
    error Unauthorized();
    error InvalidState(State current, State expected);

    // --- Constructor ---
    constructor(
        address _client,
        address _freelancer,
        address _mediator,
        uint256 _feeBps,
        address _feeRecipient
    ) payable {
        require(msg.value > 0, 'Escrow: must fund on creation');
        require(_client != _freelancer, 'Escrow: client != freelancer');

        client = _client;
        freelancer = _freelancer;
        mediator = _mediator;
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
    function raiseDispute() external override {
        if (msg.sender != client && msg.sender != freelancer) revert Unauthorized();
        _requireState(State.SUBMITTED);

        _state = State.DISPUTED;
        emit DisputeRaised(msg.sender);
    }

    /// @notice Mediator resolves dispute by choosing winner (client or freelancer).
    function resolveDispute(address winner) external override nonReentrant {
        if (msg.sender != mediator) revert Unauthorized();
        _requireState(State.DISPUTED);
        require(winner == client || winner == freelancer, 'Escrow: invalid winner');

        emit DisputeResolved(mediator, winner);
        _releaseFunds(winner);
    }

    /// @notice Client can cancel and reclaim funds before freelancer submits.
    function refund() external override nonReentrant {
        if (msg.sender != client) revert Unauthorized();
        _requireState(State.FUNDED);

        _state = State.REFUNDED;
        uint256 amount = address(this).balance;
        (bool ok, ) = client.call{ value: amount }('');
        require(ok, 'Escrow: refund failed');

        emit Refunded(client, amount);
    }

    /// @notice Returns the current state of the escrow.
    function getState() external view override returns (State) {
        return _state;
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
            (bool feeOk, ) = feeRecipient.call{ value: fee }('');
            require(feeOk, 'Escrow: fee transfer failed');
        }

        (bool ok, ) = winner.call{ value: payout }('');
        require(ok, 'Escrow: payout failed');

        emit FundsReleased(winner, payout);
    }
}
