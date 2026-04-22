import { publicClient } from './client';
import { ABIS, CONTRACT_ADDRESSES } from './constants';

export async function debug() {
  const count = await publicClient.readContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
    abi: ABIS.CAMPAIGN_FACTORY,
    functionName: 'getCampaignsCount',
  }) as bigint;
  console.log('Campaign count:', count.toString());

  const campaigns = await publicClient.readContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
    abi: ABIS.CAMPAIGN_FACTORY,
    functionName: 'getCampaigns',
    args: [0, '0x0000000000000000000000000000000000000000', 0, 0n, count],
  }) as string[];
  console.log('Campaigns:', campaigns);

  for (const campaign of campaigns) {
    const logs = await publicClient.getLogs({
      address: campaign as `0x${string}`,
      fromBlock: 0n
    });
    console.log(`Logs for ${campaign}:`, logs.length);
    logs.forEach((l: any) => console.log('Event:', l.eventName, 'Args:', l.args));
  }
}
