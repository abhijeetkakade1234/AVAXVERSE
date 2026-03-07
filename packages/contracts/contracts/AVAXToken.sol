// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';

/**
 * @title AVAXToken
 * @notice Governance token for the AVAXVERSE ecosystem.
 *         Supports checkpoints for on-chain voting.
 */
contract AVAXToken is
  Initializable,
  ERC20Upgradeable,
  ERC20BurnableUpgradeable,
  OwnableUpgradeable,
  ERC20PermitUpgradeable,
  ERC20VotesUpgradeable,
  UUPSUpgradeable
{
  error SoulboundTransferForbidden();

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(address initialOwner) public initializer {
    __ERC20_init('AVAXVERSE Token', 'AVAXV');
    __ERC20Burnable_init();
    __Ownable_init(initialOwner);
    __ERC20Permit_init('AVAXVERSE Token');
    __ERC20Votes_init();
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  // The following functions are overrides required by Solidity.

  function _update(
    address from,
    address to,
    uint256 value
  ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
    if (from != address(0) && to != address(0)) {
      revert SoulboundTransferForbidden();
    }
    super._update(from, to, value);
  }

  function nonces(
    address owner
  ) public view override(ERC20PermitUpgradeable, NoncesUpgradeable) returns (uint256) {
    return super.nonces(owner);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
