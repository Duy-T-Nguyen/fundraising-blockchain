# Transparent Fundraising: Factory + Multi-Campaign Architecture Guide

This is the recommended architecture when you need multiple fundraising campaigns running in parallel.

Instead of one global contract for everything, use:

- one Factory contract to create and register campaigns
- one Campaign contract per fundraising campaign

This gives each campaign isolated state and clean ownership boundaries.

## Why this architecture

- Multiple campaigns can run at the same time without sharing balances or voter state.
- Each campaign has its own manager and request history.
- FE can show a campaign listing page from Factory, then open detail pages per campaign.
- It is safer operationally: a bug or bad state in one campaign does not corrupt all campaigns.

## Contract responsibilities

### 1) Factory contract

Factory handles campaign creation and discovery.

State:

- deployedCampaigns: array of campaign addresses

Core functions:

- createCampaign(minimumContribution, title): deploys a new campaign and stores the address
- getCampaignsCount(): returns number of campaigns
- getCampaignAt(index): returns one campaign address
- getDeployedCampaigns(): returns all campaign addresses (good for small lists)

Event:

- CampaignCreated(creator, campaign, minimumContribution, title)

### 2) Campaign contract

Each campaign stores and manages its own donations, voting, and spending requests.

State:

- minimumContribution
- title
- donors: mapping(address => uint256)
- approversCount
- requests

Request struct:

~~~solidity
struct Request {
    string description;
    uint256 value;
    address payable recipient;
    bool complete;
    uint256 approvalCount;
    mapping(address => bool) approvals;
}
~~~

## Campaign function logic

### contribute() payable

- Require msg.value >= minimumContribution.
- If first donation from sender, increase approversCount.
- Add contribution to donors[sender].
- Emit Donated.

### createRequest(description, value, recipient) onlyOwner

- Require recipient != zero address.
- Require value > 0.
- Create a new request in storage.
- Emit RequestCreated.

### approveRequest(index) onlyDonor

- Require index is valid.
- Require request is not complete.
- Require sender has not approved before.
- Set approvals[sender] = true and increment approvalCount.
- Emit RequestApproved.

### finalizeRequest(index) onlyOwner nonReentrant

- Require index is valid.
- Require request is not complete.
- Require approvalCount > approversCount / 2.
- Require campaign balance is enough.
- Mark complete, then transfer funds using call.
- Emit RequestFinalized.

## Drop-in skeleton code

### contracts/TransparentFundraisingCampaign.sol

~~~solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TransparentFundraisingCampaign is Ownable, ReentrancyGuard {
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
    uint256 public approversCount;
    Request[] private requests;

    event Donated(address indexed donor, uint256 amount);
    event RequestCreated(uint256 indexed requestIndex, string description, uint256 value, address recipient);
    event RequestApproved(uint256 indexed requestIndex, address indexed donor);
    event RequestFinalized(uint256 indexed requestIndex, address recipient, uint256 value);

    constructor(
        uint256 minimum,
        address initialOwner,
        string memory campaignTitle
    ) Ownable(initialOwner) {
        require(initialOwner != address(0), "Invalid owner");
        require(minimum > 0, "Minimum must be > 0");
        require(bytes(campaignTitle).length > 0, "Title is required");

        minimumContribution = minimum;
        title = campaignTitle;
    }

    modifier onlyDonor() {
        require(donors[msg.sender] > 0, "Only donors can call this");
        _;
    }

    function contribute() external payable {
        require(msg.value >= minimumContribution, "Contribution below minimum");

        if (donors[msg.sender] == 0) {
            approversCount++;
        }

        donors[msg.sender] += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    function createRequest(
        string calldata description,
        uint256 value,
        address payable recipient
    ) external onlyOwner {
        require(bytes(description).length > 0, "Description is required");
        require(recipient != address(0), "Invalid recipient");
        require(value > 0, "Value must be > 0");

        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;

        emit RequestCreated(requests.length - 1, description, value, recipient);
    }

    function approveRequest(uint256 index) external onlyDonor {
        require(index < requests.length, "Invalid request index");

        Request storage request = requests[index];
        require(!request.complete, "Request already completed");
        require(!request.approvals[msg.sender], "Already approved");

        request.approvals[msg.sender] = true;
        request.approvalCount++;

        emit RequestApproved(index, msg.sender);
    }

    function finalizeRequest(uint256 index) external onlyOwner nonReentrant {
        require(index < requests.length, "Invalid request index");

        Request storage request = requests[index];
        require(!request.complete, "Request already completed");
        require(request.approvalCount > approversCount / 2, "Not enough approvals");
        require(address(this).balance >= request.value, "Insufficient campaign balance");

        request.complete = true;

        (bool ok, ) = request.recipient.call{value: request.value}("");
        require(ok, "Transfer failed");

        emit RequestFinalized(index, request.recipient, request.value);
    }

    function getRequestsCount() external view returns (uint256) {
        return requests.length;
    }

    function getRequestSummary(uint256 index)
        external
        view
        returns (
            string memory description,
            uint256 value,
            address recipient,
            bool complete,
            uint256 approvalCount
        )
    {
        require(index < requests.length, "Invalid request index");
        Request storage r = requests[index];
        return (r.description, r.value, r.recipient, r.complete, r.approvalCount);
    }

    function hasApproved(uint256 index, address donor) external view returns (bool) {
        require(index < requests.length, "Invalid request index");
        return requests[index].approvals[donor];
    }

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
        return (
            owner(),
            title,
            minimumContribution,
            address(this).balance,
            approversCount,
            requests.length
        );
    }
}
~~~

### contracts/TransparentFundraisingFactory.sol

~~~solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TransparentFundraisingCampaign.sol";

contract TransparentFundraisingFactory {
    address[] private deployedCampaigns;

    event CampaignCreated(
        address indexed creator,
        address indexed campaign,
        uint256 minimumContribution,
        string title
    );

    function createCampaign(
        uint256 minimumContribution,
        string calldata title
    ) external returns (address campaignAddress) {
        TransparentFundraisingCampaign campaign = new TransparentFundraisingCampaign(
            minimumContribution,
            msg.sender,
            title
        );

        campaignAddress = address(campaign);
        deployedCampaigns.push(campaignAddress);

        emit CampaignCreated(msg.sender, campaignAddress, minimumContribution, title);
    }

    function getCampaignsCount() external view returns (uint256) {
        return deployedCampaigns.length;
    }

    function getCampaignAt(uint256 index) external view returns (address) {
        require(index < deployedCampaigns.length, "Invalid campaign index");
        return deployedCampaigns[index];
    }

    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}
~~~

## FE integration flow

1. Read all campaign addresses from Factory.
2. Render a campaign listing page.
3. On campaign detail page, bind to campaign address and call getCampaignSummary().
4. For requests table:
   - getRequestsCount()
   - getRequestSummary(index)
   - hasApproved(index, currentUser)
5. Listen to events from both contracts to keep UI state in sync.

## Data indexing and scalability notes

- getDeployedCampaigns() is fine for small to medium projects.
- For large lists, FE should paginate via getCampaignAt(index) + getCampaignsCount().
- Event indexing by The Graph or another indexer is recommended once usage grows.

## Implementation checklist in this repo

1. Add campaign contract file under contracts/.
2. Add factory contract file under contracts/.
3. Install OpenZeppelin dependencies:
   - npm i @openzeppelin/contracts
4. Compile:
   - npx hardhat compile
5. Deploy Factory to Sepolia.
6. FE uses Factory address as entry point.

## Migration note from single-contract design

If you previously used one global contract:

- Keep old deployment as legacy data source.
- Start new campaigns through Factory only.
- FE route model becomes:
  - /campaigns for listing
  - /campaigns/:address for detail and actions
