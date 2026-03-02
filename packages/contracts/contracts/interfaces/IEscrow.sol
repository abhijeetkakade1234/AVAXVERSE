// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IEscrow
 * @notice Interface for a single job escrow contract.
 */
interface IEscrow {
    enum State { FUNDED, SUBMITTED, APPROVED, DISPUTED, RELEASED, REFUNDED }

    event WorkSubmitted(address indexed freelancer, string deliverableURI);
    event WorkApproved(address indexed client, uint256 amount);
    event FundsReleased(address indexed freelancer, uint256 amount);
    event DisputeRaised(address indexed raiser);
    event DisputeResolved(address indexed mediator, address winner);
    event Refunded(address indexed client, uint256 amount);

    function submitWork(string calldata deliverableURI) external;
    function approveWork() external;
    function raiseDispute() external;
    function resolveDispute(address winner) external;
    function refund() external;
    function getState() external view returns (State);
}
