// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IIdentityRegistry
 * @notice Interface for on-chain DID registration and profile management.
 */
interface IIdentityRegistry {
  enum BaseRole {
    NONE,
    CLIENT,
    OPERATOR
  }

  struct Profile {
    string did;
    string name;
    string pfp; // Profile picture URI
    string metadataURI; // IPFS/Arweave URI for off-chain profile data (bio, socials, etc.)
    uint256 verificationLevel; // 0=unverified, 1=social, 2=KYC
    uint256 reputationScore;
    uint256 registeredAt;
    bool exists;
    uint256 crossChainScore;
    bool sybilVerified;
    uint256 diversityScore;
    uint256 totalUniqueClients;
    uint256 totalUniqueOperators;
  }

  event ProfileRegistered(address indexed user, string did, uint256 timestamp);
  event ProfileUpdated(address indexed user, string name, string pfp, string metadataURI);
  event ReputationUpdated(address indexed user, uint256 newScore);
  event VerificationLevelUpdated(address indexed user, uint256 level);
  event ProfileSignalsUpdated(
    address indexed user,
    uint256 crossChainScore,
    bool sybilVerified,
    uint256 diversityScore,
    uint256 totalUniqueClients,
    uint256 totalUniqueOperators
  );
  event NameReserved(address indexed user, string name);
  event NameReleased(string name);
  event BaseRoleInitialized(address indexed user, uint8 indexed role);
  event DisputeHandlerUpdated(address indexed user, bool enabled);
  event AdminRoleUpdated(address indexed user, bool enabled);

  error NameAlreadyTaken(string name);

  function register(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI
  ) external;
  function registerWithRole(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI,
    uint8 role
  ) external;
  function updateProfile(
    string calldata name,
    string calldata pfp,
    string calldata metadataURI
  ) external;
  function updateMetadata(string calldata metadataURI) external;
  function incrementReputation(address user, uint256 amount) external;
  function setVerificationLevel(address user, uint256 level) external;
  function updateProfileSignals(
    address user,
    uint256 crossChainScore,
    bool sybilVerified,
    uint256 diversityScore,
    uint256 totalUniqueClients,
    uint256 totalUniqueOperators
  ) external;
  function getProfile(address user) external view returns (Profile memory);
  function hasProfile(address user) external view returns (bool);
  function isNameAvailable(string calldata name) external view returns (bool);
  function setInitialBaseRole(uint8 role) external;
  function getBaseRole(address user) external view returns (uint8);
  function isDisputeHandler(address user) external view returns (bool);
  function isAdmin(address user) external view returns (bool);
  function setDisputeHandler(address user, bool enabled) external;
  function setAdminRole(address user, bool enabled) external;
}
