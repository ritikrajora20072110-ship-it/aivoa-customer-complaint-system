// Centralized API utility with automatic base URL detection and safe JSON parsing

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:8000` 
    : '');

/**
 * Robust fetch wrapper that:
 * 1. Tries direct port 8000 connection matching user's current hostname (localhost or 127.0.0.1)
 * 2. Tries alternative local IP/host if preflight or network error occurs
 * 3. Gracefully parses text and JSON without unexpected end-of-input crashes
 */
export async function safeFetchJson(endpoint, options = {}) {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const altHost = host === 'localhost' ? '127.0.0.1' : 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

  const candidates = [];
  if (endpoint.startsWith('http')) {
    candidates.push(endpoint);
  } else {
    // 1. Direct host matching browser origin
    candidates.push(`${protocol}//${host}:8000${endpoint}`);
    // 2. Alternative host
    candidates.push(`${protocol}//${altHost}:8000${endpoint}`);
    // 3. Relative path (Vite proxy fallback)
    candidates.push(endpoint);
  }

  let response = null;
  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        response = res;
        break;
      }
      
      const raw = await res.text();
      let errorMsg = `Server error (HTTP ${res.status})`;
      try {
        const json = JSON.parse(raw);
        errorMsg = json.detail || json.message || errorMsg;
      } catch (_) {
        if (raw && raw.length < 150) errorMsg = raw;
      }
      
      lastError = new Error(errorMsg);
      // If it's a client 4xx validation error, don't retry other candidates
      if (res.status >= 400 && res.status < 500) {
        throw lastError;
      }
    } catch (err) {
      lastError = err;
      // If it was an explicit client error thrown above, rethrow
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }

  if (!response) {
    throw lastError || new Error(`Unable to reach QMS backend on port 8000. Please ensure the server is running.`);
  }

  const rawText = await response.text();
  if (!rawText || !rawText.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch (parseError) {
    return { text: rawText };
  }
}
