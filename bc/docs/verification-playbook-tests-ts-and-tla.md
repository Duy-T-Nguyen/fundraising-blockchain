# Verification Playbook: TypeScript Tests and TLA+ Invariants

This guide gives you a practical verification path for this project:

- executable tests in Hardhat using TypeScript
- formalized behavior checks using TLA+ invariants

It is written for the current contracts:

- contracts/campaign.sol
- contracts/campaignFactory.sol

The goal is simple: catch implementation bugs early, then prove core state-machine rules at model level.

## 1) What each method gives you

TypeScript tests are concrete and close to real EVM execution.

- Great for checking revert reasons, event payloads, and balance changes.
- Great for validating integration assumptions used by FE.

TLA+ is abstract and exhaustive within a finite model.

- Great for proving high-level rules such as access control, one-vote-only, and no over-spend.
- Great for finding edge-case sequences that are hard to enumerate manually.

Use both. Neither one replaces the other.

## 2) Test plan in TypeScript

### 2.1 Test file layout

Create these files under test:

- test/CampaignFactory.ts
- test/Campaign.ts

You can keep test/Lock.ts for reference or remove it later.

### 2.2 Shared fixture pattern

Use loadFixture so each test starts from clean deterministic state.

Suggested fixture responsibilities:

- deploy CampaignFactory
- create one campaign with known minimum
- attach Campaign instance by reading getCampaignAt(0)
- return signers: owner, donorA, donorB, outsider, recipient

### 2.3 CampaignFactory test checklist

Happy paths:

1. should create campaign and increase campaigns count
2. should store campaign address in deployedCampaigns
3. should emit CampaignCreated with correct args

Failure and edge behavior:

1. should revert when getCampaignAt index is out of range
2. should support creating multiple campaigns independently

### 2.4 Campaign test checklist

Deployment:

1. should set owner correctly
2. should set minimumContribution correctly
3. should set title correctly

Contribute:

1. should accept contribution >= minimum
2. should revert when contribution < minimum
3. should increment totalContributors only on first contribution of each donor
4. should accumulate donors[address] and totalContributions
5. should emit Donated

Create request:

1. owner can create request
2. non-owner cannot create request
3. revert on empty description
4. revert on zero value
5. revert on zero recipient
6. emit RequestCreated

Approve request:

1. donor can approve once
2. non-donor cannot approve
3. cannot approve the same request twice
4. cannot approve invalid request index
5. emit RequestApproved

Finalize request:

1. owner can finalize when approvals > totalContributors / 2 and balance is enough
2. non-owner cannot finalize
3. cannot finalize without enough approvals
4. cannot finalize same request twice
5. cannot finalize invalid index
6. should transfer ether to recipient
7. emit RequestFinalized

Read helpers:

1. getRequestCount returns accurate length
2. getRequestSummary returns expected fields
3. hasApproved returns true only for approving donors
4. getCampaignSummary returns consistent aggregate values

### 2.5 Example test skeleton

~~~ts
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";

describe("Campaign", function () {
  async function deployFixture() {
    const [owner, donorA, donorB, outsider, recipient] = await hre.ethers.getSigners();

    const Factory = await hre.ethers.getContractFactory("CampaignFactory");
    const factory = await Factory.deploy();

    await factory.createCampaign(hre.ethers.parseEther("0.1"), "School Supplies");

    const campaignAddress = await factory.getCampaignAt(0);
    const campaign = await hre.ethers.getContractAt("Campaign", campaignAddress);

    return { factory, campaign, owner, donorA, donorB, outsider, recipient };
  }

  it("accepts valid contribution", async function () {
    const { campaign, donorA } = await loadFixture(deployFixture);

    await expect(
      campaign.connect(donorA).contribute({ value: hre.ethers.parseEther("0.1") })
    ).to.emit(campaign, "Donated");

    expect(await campaign.totalContributors()).to.equal(1n);
  });
});
~~~

### 2.6 Commands you should run

Install dependencies once:

- npm i @openzeppelin/contracts

Compile:

- npx hardhat compile

Run tests:

- npx hardhat test

Optional gas report:

- REPORT_GAS=true npx hardhat test

## 3) TLA+ invariants for this project

### 3.1 Modeling scope

Model the business logic only:

- campaign creation and registration
- donations and voter counting
- request creation
- request approvals
- request finalization and payout

Do not model low-level EVM gas behavior in the first iteration.

### 3.2 Suggested model variables

Factory level:

- campaigns
- campaignsCount

Per campaign:

- owner[c]
- minimum[c]
- balance[c]
- donors[c][u]
- totalContributors[c]
- totalContributions[c]
- requests[c]

Per request:

- reqDescription[c][r]
- reqValue[c][r]
- reqRecipient[c][r]
- reqComplete[c][r]
- reqApprovalCount[c][r]
- reqApproved[c][r][u]

### 3.3 Actions to include

- CreateCampaign(creator, minimum, title)
- Contribute(campaign, donor, amount)
- CreateRequest(campaign, owner, description, value, recipient)
- ApproveRequest(campaign, requestId, donor)
- FinalizeRequest(campaign, requestId, owner)

### 3.4 Core safety invariants

I1. Owner-only request creation

For every campaign c and request r, only owner[c] can cause r to be added.

I2. Owner-only finalize

If request r in campaign c changes from incomplete to complete, the actor must be owner[c].

I3. No double approval

For every c, r, u: reqApproved[c][r][u] can change from FALSE to TRUE at most once.

I4. Approval count is consistent

For every c, r: reqApprovalCount[c][r] equals the number of users u where reqApproved[c][r][u] is TRUE.

I5. Finalize requires strict majority

If reqComplete[c][r] is TRUE, then reqApprovalCount[c][r] > totalContributors[c] / 2.

I6. Finalize requires sufficient balance

If finalize transition occurs on (c, r), then pre-state balance[c] >= reqValue[c][r].

I7. No finalize twice

Once reqComplete[c][r] becomes TRUE, it never returns to FALSE.

I8. Donor count matches donor set

totalContributors[c] equals count of users u with donors[c][u] > 0.

I9. Contribution totals are monotonic

donors[c][u] and totalContributions[c] never decrease.

I10. Campaign isolation

An action on campaign c1 cannot mutate state of campaign c2 when c1 # c2.

I11. Non-negative balances and values

All balances and request values are always >= 0.

I12. No over-spend accounting

For each campaign c:

balance[c] = totalContributions[c] - SumFinalizedPayouts[c]

### 3.5 Useful liveness properties

L1. Finalizable request can eventually complete

If a request has majority approvals, is incomplete, and campaign has enough balance, there exists a future path where finalize makes it complete.

L2. Valid contribution eventually changes donor state

If amount >= minimum[c], contribution action can eventually increase donors[c][u].

### 3.6 Model constraints for tractable checking

Use small bounded sets first:

- Users = 3..5
- Campaigns = 2..3
- Requests per campaign = 2..4
- Amount domain = small integer set

This keeps TLC exhaustive runs practical while still surfacing logic bugs.

## 4) Mapping from Solidity functions to TLA+ checks

- contribute -> I8, I9, I11, I12
- createRequest -> I1, I11
- approveRequest -> I3, I4
- finalizeRequest -> I2, I5, I6, I7, I11, I12
- factory createCampaign and list access -> I10

## 5) Suggested delivery checklist for your report

1. A test matrix table with pass/fail status and links to test names.
2. Hardhat test execution logs.
3. The TLA+ module plus TLC config used for verification.
4. A list of verified invariants and any assumptions.
5. A short section called Limitations of the Model.

## 6) Important truth about formal verification

A green TLC run does not mean the deployed contract is correct in every possible real-world condition.

It means the model satisfies the specified properties under modeled assumptions and bounds.

That is still extremely valuable, but it is not a substitute for code review, fuzzing, and security testing.
