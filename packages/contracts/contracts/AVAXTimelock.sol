// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/governance/TimelockController.sol';

/**
 * @title AVAXTimelock
 * @notice Thin wrapper used by deployment and tests for delayed admin actions.
 */
contract AVAXTimelock is TimelockController {
  constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) TimelockController(minDelay, proposers, executors, admin) {}
}

