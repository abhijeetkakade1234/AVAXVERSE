// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title Rejector
 * @notice Test helper contract:
 * - rejects plain ETH transfers
 * - can execute arbitrary calls as contract account
 */
contract Rejector is Ownable {
  constructor() Ownable(msg.sender) {}

  function execute(
    address target,
    bytes calldata data
  ) external payable onlyOwner returns (bytes memory) {
    require(target != address(0), 'Rejector: zero target');
    (bool ok, bytes memory result) = target.call{value: msg.value}(data);
    require(ok, 'Rejector: call failed');
    return result;
  }

  receive() external payable {
    revert('Rejector: no direct AVAX');
  }

  fallback() external payable {
    revert('Rejector: no fallback AVAX');
  }
}

