// Centralized API utility with automatic base URL detection and safe JSON parsing

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000' 
    : '');

/**
 * Robust fetch wrapper that:
 * 1. Dispatches directly to http://127.0.0.1:8000 in dev (bypassing any Node proxy EPERM issues)
 * 2. Safely parses response text to avoid "Unexpected end of JSON input" errors
 * 3. Gracefully provides readable error messages if backend is unreachable
 */
export async function safeFetchJson(endpoint, options = {}) {
  const primaryUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  let response;
  try {
    response = await fetch(primaryUrl, options);
  } catch (primaryErr) {
    // If direct connection failed, attempt relative path fallback
    if (!endpoint.startsWith('http') && API_BASE_URL) {
      try {
        response = await fetch(endpoint, options);
      } catch (fallbackErr) {
        throw new Error(
          `Cannot reach QMS backend at ${primaryUrl}. Make sure the FastAPI server is running at http://127.0.0.1:8000.`
        );
      }
    } else {
      throw new Error(`Connection error: Failed to connect to ${primaryUrl}.`);
    }
  }

  const rawText = await response.text();
  let parsedJson = null;

  if (rawText && rawText.trim()) {
    try {
      parsedJson = JSON.parse(rawText);
    } catch (parseError) {
      // Content is not valid JSON
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${rawText.slice(0, 150)}`);
      }
    }
  }

  if (!response.ok) {
    const errorMsg =
      parsedJson?.detail ||
      parsedJson?.message ||
      `Request failed with HTTP status ${response.status}`;
    throw new Error(errorMsg);
  }

  return parsedJson;
}
