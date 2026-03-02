// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IIdentityRegistry
 * @notice Interface for on-chain DID registration and profile management.
 */
interface IIdentityRegistry {
    struct Profile {
        string did;
        string name;
        string metadataURI; // IPFS/Arweave URI for off-chain profile data
        uint256 verificationLevel; // 0=unverified, 1=social, 2=KYC
        uint256 reputationScore;
        uint256 registeredAt;
        bool exists;
    }

    event ProfileRegistered(address indexed user, string did, uint256 timestamp);
    event ProfileUpdated(address indexed user, string metadataURI);
    event ReputationUpdated(address indexed user, uint256 newScore);

    function register(string calldata name, string calldata metadataURI) external;
    function updateMetadata(string calldata metadataURI) external;
    function getProfile(address user) external view returns (Profile memory);
    function hasProfile(address user) external view returns (bool);
}
