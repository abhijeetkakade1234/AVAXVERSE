// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IReputationToken
 * @notice Interface for Soulbound Reputation NFTs (ERC-5192 inspired).
 */
interface IReputationToken {
    event Locked(uint256 indexed tokenId);
    event Minted(address indexed to, uint256 tokenId, string achievementURI);
    event ScoreUpdated(address indexed user, uint256 newScore);

    function mintAchievement(address to, string calldata achievementURI) external;
    function updateScore(address user, uint256 newScore) external;
    function getScore(address user) external view returns (uint256);
    function locked(uint256 tokenId) external view returns (bool);
}
