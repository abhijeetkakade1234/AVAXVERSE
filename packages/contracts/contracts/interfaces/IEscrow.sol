// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IEscrow
 * @notice Interface for a single job escrow contract.
 */
interface IEscrow {
  enum State {
    FUNDED,
    SUBMITTED,
    APPROVED,
    DISPUTED,
    RELEASED,
    REFUNDED
  }

  event WorkSubmitted(address indexed freelancer, string deliverableURI);
  event WorkApproved(address indexed client, uint256 amount);
  event FundsReleased(address indexed freelancer, uint256 amount);
  event DisputeRaised(address indexed raiser, string reason, string evidenceURI);
  event CounterEvidenceSubmitted(address indexed submitter, string evidenceURI);
  event DisputeResolved(address indexed mediator, address winner, string reasonHash);
  event DisputeResolvedSplit(address indexed mediator, string reasonHash, uint256 clientShareBps);
  event Refunded(address indexed client, uint256 amount);

  function submitWork(string calldata deliverableURI) external;
  function approveWork() external;
  function raiseDispute(string calldata reason, string calldata evidenceURI) external;
  function submitCounterEvidence(string calldata evidenceURI) external;
  function resolveDispute(address winner, string calldata reasonHash) external;
  function resolveDisputeSplit(uint256 clientShareBps, string calldata reasonHash) external;
  function refund() external;
  function autoApprove() external;
  function getState() external view returns (State);

  // View functions for tests/UI
  function disputeEvidenceURI() external view returns (string memory);
  function counterEvidenceURI() external view returns (string memory);
  function resolutionReasonHash() external view returns (string memory);
}
