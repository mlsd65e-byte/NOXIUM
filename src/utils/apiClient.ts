/**
 * Safe API Client for Nexus Community Hub
 * Validates Content-Type and prevents JSON parse errors on HTML responses
 */

export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit,
  fallback?: T
): Promise<T> {
  try {
    const res = await fetch(url, options);

    // Check if response is JSON
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[apiClient] Warning: ${url} returned ${contentType || 'non-JSON'} (status: ${res.status})`);
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`La respuesta de ${url} no es JSON válido (status ${res.status})`);
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(errBody.error || `Error HTTP ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error: any) {
    console.warn(`[apiClient] Fetch failed for ${url}:`, error?.message);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}
