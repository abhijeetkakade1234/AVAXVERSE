// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title AVAXToken
 * @notice Governance token for the AVAXVERSE ecosystem.
 *         Supports checkpoints for on-chain voting.
 */
contract AVAXToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, ERC20Votes {
  error SoulboundTransferForbidden();

  constructor(
    address initialOwner
  ) ERC20('AVAXVERSE Token', 'AVAXV') Ownable(initialOwner) ERC20Permit('AVAXVERSE Token') {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  // The following functions are overrides required by Solidity.

  function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
    if (from != address(0) && to != address(0)) {
      revert SoulboundTransferForbidden();
    }
    super._update(from, to, value);
  }

  function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
    return super.nonces(owner);
  }
}
