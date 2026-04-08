// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A crowdfunding campaign contract with request approval mechanism.
contract Campaign is Ownable, ReentrancyGuard {
    /// @dev A spending request approved by donors before payout.
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    string public title;
    uint256 public minimumContribution;
    mapping(address => uint256) public donors;
    uint256 public totalContributors;
    uint256 public totalContributions;
    Request[] private requests;

    event Donated(address indexed donor, uint256 amount);
    event RequestCreated(uint256 indexed requestIndex, string description, uint256 value, address recipient);
    event RequestApproved(uint256 indexed requestIndex, address indexed donor);
    event RequestFinalized(uint256 indexed requestIndex, address recipient, uint256 value);

    modifier onlyDonor() {
        require(donors[msg.sender] > 0, "Only donors can call this function");
        _;
    }

    /// @notice Creates a campaign instance with an owner and minimum donation.
    constructor(uint256 minimum, address initialOwner, string memory campaignTitle) Ownable(initialOwner) {
        require(initialOwner != address(0), "Owner address cannot be zero");
        require(minimum > 0, "Minimum donation amount must be greater than zero");
        require(bytes(campaignTitle).length > 0, "Campaign title cannot be empty");

        minimumContribution = minimum;
        title = campaignTitle;
    }

    /// @notice Donate to this campaign and become a voter on first contribution.
    function contribute() external payable {
        require(msg.value >= minimumContribution, "Contribution must be at least the minimum amount");

        if (donors[msg.sender] == 0) {
            totalContributors++;
        }

        donors[msg.sender] += msg.value;
        totalContributions += msg.value;

        emit Donated(msg.sender, msg.value);
    }

    /// @notice Owner creates a spending request for contributors to approve.
    function createRequest(string calldata description, uint256 requestValue, address payable requestRecipient) external onlyOwner {
        require(bytes(description).length > 0, "Description cannot be empty");
        require(requestValue > 0, "Value must be greater than zero");
        require(requestRecipient != address(0), "Recipient address cannot be zero");

        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value = requestValue;
        newRequest.recipient = requestRecipient;

        emit RequestCreated(requests.length - 1, description, requestValue, requestRecipient);
    }

    /// @notice Approve a request once. Only contributors can approve.
    function approveRequest(uint256 requestIndex) external onlyDonor {
        require(requestIndex < requests.length, "Invalid request index");

        Request storage request = requests[requestIndex];
        require(!request.complete, "Request has already been finalized");
        require(!request.approvals[msg.sender], "You have already approved this request");

        request.approvals[msg.sender] = true;
        request.approvalCount++;

        emit RequestApproved(requestIndex, msg.sender);
    }

    /// @notice Finalize and transfer funds when approvals are above 50%.
    function finalizeRequest(uint256 requestIndex) external onlyOwner nonReentrant {
        require(requestIndex < requests.length, "Invalid request index");

        Request storage request = requests[requestIndex];
        require(!request.complete, "Request has already been finalized");
        require(request.approvalCount > totalContributors / 2, "Not enough approvals to finalize this request");
        require(address(this).balance >= request.value, "Not enough funds to finalize this request");

        request.complete = true;
        (bool success, ) = request.recipient.call{value: request.value}("");
        require(success, "Transfer failed");

        emit RequestFinalized(requestIndex, request.recipient, request.value);
    }

    /// @notice Returns total number of spending requests in this campaign.
    function getRequestCount() external view returns (uint256) {
        return requests.length;
    }

    /// @notice Returns key fields for a request row used by FE.
    function getRequestSummary(uint256 requestIndex)
        external
        view
        returns (
            string memory description,
            uint256 requestValue,
            address requestRecipient,
            bool isComplete,
            uint256 approvals
        )
    {
        require(requestIndex < requests.length, "Invalid request index");

        Request storage request = requests[requestIndex];
        return (
            request.description,
            request.value,
            request.recipient,
            request.complete,
            request.approvalCount
        );
    }

    /// @notice Returns whether a donor has approved a specific request.
    function hasApproved(uint256 requestIndex, address donor) external view returns (bool) {
        require(requestIndex < requests.length, "Invalid request index");
        require(donor != address(0), "Donor address cannot be zero");

        Request storage request = requests[requestIndex];
        return request.approvals[donor];
    }

    /// @notice Returns the top-level campaign summary for listing/detail pages.
    function getCampaignSummary()
        external
        view
        returns (
            address manager,
            string memory campaignTitle,
            uint256 minimum,
            uint256 balance,
            uint256 donorsCount,
            uint256 requestsCount
        )
    {
        return (owner(), title, minimumContribution, address(this).balance, totalContributors, requests.length);
    }
}