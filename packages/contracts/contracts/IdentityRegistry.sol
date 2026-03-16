// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './interfaces/IIdentityRegistry.sol';
import './interfaces/IAVAXToken.sol';

/**
 * @title IdentityRegistry
 * @notice On-chain DID registry for AVAXVERSE.
 *         Each address can register exactly one profile.
 *         Reputation scores are updated by authorized updaters (e.g., Escrow or ReputationToken contracts).
 */
contract IdentityRegistry is IIdentityRegistry, Initializable, OwnableUpgradeable, UUPSUpgradeable {
  // --- State ---
  mapping(address => Profile) private _profiles;
  mapping(address => bool) private _authorizedUpdaters;
  mapping(bytes32 => address) private _nameToAddress;
  IAVAXToken public avaxToken;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {
    __Ownable_init(msg.sender);
  }

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

  // --- External Functions ---

  function register(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI
  ) external override {
    require(!_profiles[msg.sender].exists, 'IdentityRegistry: already registered');
    require(bytes(name).length > 0, 'IdentityRegistry: name required');

    _reserveName(name, msg.sender);

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

  function updateProfile(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI
  ) external override onlyRegistered(msg.sender) {
    require(bytes(name).length > 0, 'IdentityRegistry: name required');

    Profile storage profile = _profiles[msg.sender];

    if (keccak256(bytes(profile.name)) != keccak256(bytes(name))) {
      _releaseName(profile.name);
      _reserveName(name, msg.sender);
    }

    profile.name = name;
    profile.pfp = pfp;
    profile.metadataURI = metadataURI;

    emit ProfileUpdated(msg.sender, name, pfp, metadataURI);
  }

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

  function incrementReputation(
    address user,
    uint256 amount
  ) external override onlyUpdater onlyRegistered(user) {
    _profiles[user].reputationScore += amount;
    emit ReputationUpdated(user, _profiles[user].reputationScore);

    if (address(avaxToken) != address(0)) {
      avaxToken.mint(user, amount * 10 ** 18);
    }
  }

  function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
    _authorizedUpdaters[updater] = authorized;
  }

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

  function isNameAvailable(string calldata name) external view override returns (bool) {
    if (bytes(name).length == 0) return false;
    bytes32 nameHash = keccak256(bytes(name));
    return _nameToAddress[nameHash] == address(0);
  }

  // --- Internal Helpers ---
  function _reserveName(string memory name, address user) internal {
    if (!this.isNameAvailable(name)) revert NameAlreadyTaken(name);
    bytes32 nameHash = keccak256(bytes(name));
    _nameToAddress[nameHash] = user;
    emit NameReserved(user, name);
  }

  function _releaseName(string memory name) internal {
    bytes32 nameHash = keccak256(bytes(name));
    delete _nameToAddress[nameHash];
    emit NameReleased(name);
  }

  function _buildDID(address user) internal pure returns (string memory) {
    return string.concat('did:avax:', Strings.toHexString(uint160(user), 20));
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
