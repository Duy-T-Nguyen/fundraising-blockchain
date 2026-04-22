export const getIPFSUrl = (cid: string) => {
  if (!cid) return '';
  if (cid.startsWith('ipfs://')) {
    return `https://gateway.pinata.cloud/ipfs/${cid.replace('ipfs://', '')}`;
  }
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

export const fetchIPFSJSON = async (cid: string) => {
  try {
    const url = getIPFSUrl(cid);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch from IPFS');
    return await res.json();
  } catch (error) {
    console.error('IPFS fetch error:', error);
    return null;
  }
};
