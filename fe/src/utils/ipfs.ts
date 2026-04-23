const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.io/ipfs/',
];

// In-memory cache to avoid redundant fetches
const metadataCache = new Map<string, any>();

const normalizeCID = (cid: string): string => {
  if (!cid) return '';
  return cid.startsWith('ipfs://') ? cid.replace('ipfs://', '') : cid;
};

export const getIPFSUrl = (cid: string) => {
  const clean = normalizeCID(cid);
  if (!clean) return '';
  return `${GATEWAYS[0]}${clean}`;
};

const fetchWithTimeout = async (url: string, timeoutMs = 8000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export const fetchIPFSJSON = async (cid: string): Promise<any> => {
  if (!cid) return null;
  const clean = normalizeCID(cid);

  // Return cached result immediately
  if (metadataCache.has(clean)) {
    return metadataCache.get(clean);
  }

  for (const gateway of GATEWAYS) {
    try {
      const url = `${gateway}${clean}`;
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) continue;
      const data = await res.json();
      metadataCache.set(clean, data); // Cache successful result
      return data;
    } catch {
      // Try next gateway
      continue;
    }
  }

  console.warn(`[IPFS] All gateways failed for CID: ${clean}`);
  return null;
};

