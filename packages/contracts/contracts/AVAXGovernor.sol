// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/governance/Governor.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorSettings.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorVotes.sol';
import '@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol';

/**
 * @title AVAXGovernor
 * @notice The core governance engine for AVAXVERSE.
 *         Handles proposal creation, voting, and counting.
 */
contract AVAXGovernor is
  GovernorSettings,
  GovernorCountingSimple,
  GovernorVotes,
  GovernorVotesQuorumFraction
{
  constructor(
    IVotes _token
  )
    Governor('AVAXVERSE Governor')
    GovernorSettings(
      1 /* 1 block voting delay */,
      300 /* ~10 minutes test period (approx 300 * 2s) */,
      0 /* 0 tokens required to propose */
    )
    GovernorVotes(_token)
    GovernorVotesQuorumFraction(4) /* 4% quorum */
  {}

  // The following functions are overrides required by Solidity.

  function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
    return super.votingDelay();
  }

  function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
    return super.votingPeriod();
  }

  function quorum(
    uint256 blockNumber
  ) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
    return super.quorum(blockNumber);
  }

  function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
    return super.proposalThreshold();
  }

  function state(uint256 proposalId) public view override(Governor) returns (ProposalState) {
    return super.state(proposalId);
  }

  function proposalNeedsQueuing(uint256 proposalId) public view override(Governor) returns (bool) {
    return super.proposalNeedsQueuing(proposalId);
  }
}
