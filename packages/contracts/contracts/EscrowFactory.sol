// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';
import './Escrow.sol';
import './interfaces/IIdentityRegistry.sol';
import './interfaces/IReputationToken.sol';

/**
 * @title EscrowFactory
 * @notice Creates and tracks all Escrow contracts.
 *         Also hooks into IdentityRegistry and ReputationToken to reward
 *         completed jobs automatically — keeping reputation logic DRY.
 */
contract EscrowFactory is Ownable {
    // --- Config ---
    uint256 public platformFeeBps = 250; // 2.5%
    address public feeRecipient;
    address public mediator;

    IIdentityRegistry public immutable identityRegistry;
    IReputationToken public immutable reputationToken;

    // Achievement URIs (use constants to avoid duplication)
    string private constant ACHIEVEMENT_JOB_COMPLETE = 'ipfs://avaxverse/achievement/job-complete';

    // --- Job Tracking ---
    struct Job {
        address escrow;
        address client;
        address freelancer;
        string title;
        uint256 budget;
        uint256 createdAt;
    }

    Job[] private _jobs;
    // Indexed by escrow address for quick lookup
    mapping(address => uint256) private _escrowToJobIndex;
    mapping(address => uint256[]) private _userJobs; // jobs per user

    // --- Events ---
    event JobCreated(
        uint256 indexed jobId,
        address indexed escrow,
        address indexed client,
        address freelancer,
        uint256 budget
    );
    event JobCompleted(uint256 indexed jobId, address indexed escrow);
    event ConfigUpdated(uint256 feeBps, address feeRecipient, address mediator);

    // --- Constructor ---
    constructor(
        address _identityRegistry,
        address _reputationToken,
        address _feeRecipient,
        address _mediator
    ) Ownable(msg.sender) {
        identityRegistry = IIdentityRegistry(_identityRegistry);
        reputationToken = IReputationToken(_reputationToken);
        feeRecipient = _feeRecipient;
        mediator = _mediator;
    }

    // --- External Functions ---

    /**
     * @notice Create a new escrow for a job. Client must send AVAX to fund it.
     * @param freelancer Freelancer's address.
     * @param title Job title (stored for discovery).
     */
    function createJob(address freelancer, string calldata title)
        external
        payable
        returns (address escrowAddr)
    {
        require(identityRegistry.hasProfile(msg.sender), 'EscrowFactory: client must have profile');
        require(identityRegistry.hasProfile(freelancer), 'EscrowFactory: freelancer must have profile');
        require(msg.value > 0, 'EscrowFactory: must provide payment');
        require(msg.sender != freelancer, 'EscrowFactory: client != freelancer');

        Escrow escrow = new Escrow{ value: msg.value }(
            msg.sender,
            freelancer,
            mediator,
            platformFeeBps,
            feeRecipient
        );

        escrowAddr = address(escrow);
        uint256 jobId = _jobs.length;

        _jobs.push(Job({
            escrow: escrowAddr,
            client: msg.sender,
            freelancer: freelancer,
            title: title,
            budget: msg.value,
            createdAt: block.timestamp
        }));

        _escrowToJobIndex[escrowAddr] = jobId;
        _userJobs[msg.sender].push(jobId);
        _userJobs[freelancer].push(jobId);

        emit JobCreated(jobId, escrowAddr, msg.sender, freelancer, msg.value);
    }

    /**
     * @notice Called after approveWork() completes to reward both parties.
     *         The escrow must be in RELEASED state (cannot double-call).
     */
    function onJobCompleted(address escrowAddr) external {
        uint256 jobId = _escrowToJobIndex[escrowAddr];
        Job storage job = _jobs[jobId];

        require(msg.sender == job.escrow || msg.sender == owner(), 'EscrowFactory: unauthorized');
        require(
            Escrow(payable(escrowAddr)).getState() == IEscrow.State.RELEASED,
            'EscrowFactory: escrow not released'
        );

        // Reward both parties with a reputation increment
        reputationToken.mintAchievement(job.freelancer, ACHIEVEMENT_JOB_COMPLETE);

        emit JobCompleted(jobId, escrowAddr);
    }

    // --- Admin ---
    function setConfig(uint256 feeBps, address _feeRecipient, address _mediator) external onlyOwner {
        require(feeBps <= 1000, 'EscrowFactory: fee too high'); // max 10%
        platformFeeBps = feeBps;
        feeRecipient = _feeRecipient;
        mediator = _mediator;
        emit ConfigUpdated(feeBps, _feeRecipient, _mediator);
    }

    // --- Views ---
    function getJob(uint256 jobId) external view returns (Job memory) {
        return _jobs[jobId];
    }

    function getJobsByUser(address user) external view returns (uint256[] memory) {
        return _userJobs[user];
    }

    function totalJobs() external view returns (uint256) {
        return _jobs.length;
    }
}
