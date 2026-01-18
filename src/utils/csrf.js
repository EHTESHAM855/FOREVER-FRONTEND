const BACKEND_BASE = import.meta.env.VITE_API_URL

let csrfTokenCache = null

export async function fetchCsrfToken(forceRefresh = false) {
  if (!forceRefresh && csrfTokenCache) return csrfTokenCache

  try {
    const response = await fetch(`${BACKEND_BASE}/api/csrf-token`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`CSRF token fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    csrfTokenCache = data.csrfToken;
    localStorage.setItem('csrfToken', csrfTokenCache);
    return csrfTokenCache;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}
