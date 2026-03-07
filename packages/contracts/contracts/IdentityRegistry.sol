// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './interfaces/IIdentityRegistry.sol';
import './interfaces/IAVAXToken.sol';

/**
 * @title IdentityRegistry
 * @notice On-chain DID registry for AVAXVERSE.
 *         Each address can register exactly one profile.
 *         Reputation scores are updated by authorized updaters (e.g., Escrow or ReputationToken contracts).
 */
contract IdentityRegistry is IIdentityRegistry, Ownable {
  // --- State ---
  mapping(address => Profile) private _profiles;
  mapping(address => bool) private _authorizedUpdaters;
  IAVAXToken public avaxToken;

  // --- Modifiers ---
  modifier onlyRegistered(address user) {
    require(_profiles[user].exists, 'IdentityRegistry: profile not found');
    _;
  }

  modifier onlyUpdater() {
    require(
      _authorizedUpdaters[msg.sender] || msg.sender == owner(),
      'IdentityRegistry: not authorized'
    );
    _;
  }

  // --- Constructor ---
  constructor() Ownable(msg.sender) {}

  // --- External Functions ---

  /**
   * @notice Register a new DID-based profile. One per address.
   * @param name Display name for the user.
   * @param pfp Profile picture URI.
   * @param metadataURI IPFS/Arweave URI with extended profile data.
   */
  function register(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI
  ) external override {
    require(!_profiles[msg.sender].exists, 'IdentityRegistry: already registered');
    require(bytes(name).length > 0, 'IdentityRegistry: name required');

    string memory did = _buildDID(msg.sender);

    _profiles[msg.sender] = Profile({
      did: did,
      name: name,
      pfp: pfp,
      metadataURI: metadataURI,
      verificationLevel: 0,
      reputationScore: 0,
      registeredAt: block.timestamp,
      exists: true
    });

    emit ProfileRegistered(msg.sender, did, block.timestamp);
  }

  /**
   * @notice Update an existing profile.
   */
  function updateProfile(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI
  ) external override onlyRegistered(msg.sender) {
    require(bytes(name).length > 0, 'IdentityRegistry: name required');

    Profile storage profile = _profiles[msg.sender];
    profile.name = name;
    profile.pfp = pfp;
    profile.metadataURI = metadataURI;

    emit ProfileUpdated(msg.sender, name, pfp, metadataURI);
  }

  /**
   * @notice Update the IPFS/Arweave metadata URI of an existing profile.
   */
  function updateMetadata(
    string calldata metadataURI
  ) external override onlyRegistered(msg.sender) {
    _profiles[msg.sender].metadataURI = metadataURI;
    emit ProfileUpdated(
      msg.sender,
      _profiles[msg.sender].name,
      _profiles[msg.sender].pfp,
      metadataURI
    );
  }

  /**
   * @notice Called by authorized contracts (e.g., Escrow) to increment reputation.
   */
  function incrementReputation(
    address user,
    uint256 amount
  ) external override onlyUpdater onlyRegistered(user) {
    _profiles[user].reputationScore += amount;
    emit ReputationUpdated(user, _profiles[user].reputationScore);

    if (address(avaxToken) != address(0)) {
      // Mint 1 whole token (assuming 18 decimals) per absolute reputation point
      avaxToken.mint(user, amount * 10 ** 18);
    }
  }

  /**
   * @notice Authorize a contract to update reputation scores.
   */
  function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
    _authorizedUpdaters[updater] = authorized;
  }

  /**
   * @notice Set the AVAXToken contract to mint governance power based on reputation.
   */
  function setAVAXToken(address _token) external onlyOwner {
    avaxToken = IAVAXToken(_token);
  }

  // --- Views ---
  function getProfile(address user) external view override returns (Profile memory) {
    return _profiles[user];
  }

  function hasProfile(address user) external view override returns (bool) {
    return _profiles[user].exists;
  }

  // --- Internal Helpers ---
  function _buildDID(address user) internal pure returns (string memory) {
    return string.concat('did:avax:', Strings.toHexString(uint160(user), 20));
  }
}
