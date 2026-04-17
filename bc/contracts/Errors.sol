// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// =====================
// Access Control Errors
// =====================
error NotManager();
error NotDonor();
error ManagerCannotVote();
error NotAuthorized();

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
error EmptyEvidenceHash();
error TransferFailed();
error InvalidSignature();
error NotAuthorizedValidator();
error InvalidMilestoneIndex();
error MilestoneAlreadyReleased();
error MilestoneNotApproved();
error ManagerNotAllowedAsRecipient();
error AggregateMonthlyCapExceeded();

// =====================
// Supplier Registry Errors
// =====================
error NotAdmin();
error RecipientNotWhitelisted();
error AlreadyWhitelisted();
error NotWhitelisted();
error RequestAlreadyProcessed();