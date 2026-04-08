// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./campaign.sol";

contract CampaignFactory {
    address[] private deployedCampaigns;

    event CampaignCreated(address indexed creator, address indexed campaign, uint256 minimumContribution, string title);

    function createCampaign(uint256 minimumContribution, string calldata title) external returns (address campaignAddress) {
        Campaign campaign = new Campaign(minimumContribution, msg.sender, title);

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