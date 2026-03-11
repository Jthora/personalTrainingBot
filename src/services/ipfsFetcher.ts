/**
 * IPFS Content Fetcher — Gateway-based decentralized content retrieval.
 *
 * Fetches content by IPFS CID using public gateways. No IPFS node required.
 * Strategy:
 *   1. Race all configured gateways with a per-gateway timeout.
 *   2. First successful response wins.
 *   3. If all gateways fail or time out, fall back to the original HTTP URL.
 *
 * This gives the app decentralized content distribution while maintaining
 * compatibility with the existing static hosting fallback.
 */
import { isFeatureEnabled } from '../config/featureFlags';
import { trackEvent } from '../utils/telemetry';

/** Public IPFS gateways to race against each other. */
export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://dweb.link/ipfs',
];

/** Per-gateway fetch timeout in milliseconds. */
export const GATEWAY_TIMEOUT_MS = 5000;

/**
 * Fetch a resource by IPFS CID, racing all configured gateways.
 * Falls back to `fallbackUrl` if all gateways fail or time out.
 *
 * @param cid - The IPFS content identifier (CIDv0 or CIDv1 base32).
 * @param fallbackUrl - HTTP URL to fall back to if IPFS is unavailable.
 * @returns The first successful Response.
 * @throws If both IPFS gateways and the fallback URL all fail.
 */
export const fetchFromIpfs = async (
  cid: string,
  fallbackUrl: string,
): Promise<Response> => {
  if (!isFeatureEnabled('ipfsContent')) {
    // Feature flag off — skip IPFS entirely.
    return fetchWithValidation(fallbackUrl, 'http-fallback');
  }

  const gatewayAttempt = raceGateways(cid);

  try {
    const response = await gatewayAttempt;
    trackEvent('ipfs_fetch_success', { cid: cid.slice(0, 12) });
    return response;
  } catch (err) {
    console.warn('[IPFS] All gateways failed, falling back to HTTP', err);
    trackEvent('ipfs_fetch_fallback', { cid: cid.slice(0, 12) });
    return fetchWithValidation(fallbackUrl, 'http-fallback');
  }
};

/**
 * Race all IPFS gateways against each other. Each gateway has its own timeout.
 * Resolves with the first 200-OK response, rejects if all fail/timeout.
 */
export const raceGateways = (cid: string): Promise<Response> => {
  const attempts = IPFS_GATEWAYS.map((gateway) =>
    fetchWithTimeout(`${gateway}/${cid}`, GATEWAY_TIMEOUT_MS, gateway),
  );

  return new Promise<Response>((resolve, reject) => {
    let failures = 0;
    const total = attempts.length;

    attempts.forEach((attempt) => {
      attempt
        .then(resolve)
        .catch(() => {
          failures += 1;
          if (failures === total) {
            reject(new Error(`[IPFS] All ${total} gateways failed for CID ${cid}`));
          }
        });
    });
  });
};

/**
 * Fetch a URL with a hard timeout. Aborts the request if it exceeds `ms`.
 * Throws if the response is not 2xx.
 */
export const fetchWithTimeout = async (
  url: string,
  ms: number,
  label: string,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`[IPFS] Gateway ${label} returned ${response.status}`);
    }
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

/**
 * Fetch a plain HTTP URL, throwing if the response is not 2xx.
 */
const fetchWithValidation = async (url: string, label: string): Promise<Response> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[Fetch] ${label} returned ${response.status} for ${url}`);
  }
  return response;
};
