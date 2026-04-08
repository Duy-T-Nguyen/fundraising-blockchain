// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// =====================
// Access Control Errors
// =====================
error NotManager();
error NotDonor();
error ManagerCannotVote();

// =====================
// State Errors
// =====================
error AlreadyVoted();
error RequestCompleted();
error NotEnoughApprovals();
error CampaignNotActive();

// =====================
// Validation Errors
// =====================
error InsufficientFunds();
error InvalidAddress();
error InvalidRequestIndex();
error EmptyDescription();
error TransferFailed();