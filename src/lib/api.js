// ─── REST API Client ─────────────────────────────────────────────────────────
// Replaces @supabase/supabase-js with direct REST calls to the Express backend.
// Stores JWT access + refresh tokens in localStorage.


const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:8080";
    return url.replace(/\/$/, ""); 
};

const TOKEN_KEY = "sp_access_token";
const REFRESH_KEY = "sp_refresh_token";

// ─── Token helpers ───────────────────────────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(access, refresh) {
  if (access) localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function request(method, path, body = null, options = {}) {

  const url = `${getApiUrl()}${path}`;
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };

  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body && method !== "GET") config.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(url, config);

  // Auto-refresh on 401
  if (res.status === 401 && getRefreshToken() && !options._retried) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    try {
      const newToken = await refreshPromise;
      headers["Authorization"] = `Bearer ${newToken}`;
      // Retry once — use a new variable to avoid reassigning const
      const retryRes = await fetch(url, { ...config, headers });
      if (!retryRes.ok && retryRes.status === 401) {
        clearTokens();
        window.location.href = "/";
        throw new Error("Session expired");
      }
      // Handle the retry response directly and return
      if (retryRes.status === 204) return null;
      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({ message: retryRes.statusText }));
        let msg = retryRes.statusText;
        if (typeof error.message === 'string') msg = error.message;
        else if (error.error?.message) msg = error.error.message;
        throw { status: retryRes.status, message: msg };
      }
      return retryRes.json();
    } catch (err) {
      if (err.message === "Session expired" || err.status) throw err;
      clearTokens();
      window.location.href = "/";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearTokens();
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
         console.error("API returned 401 - Forcing redirect to home");
         window.location.replace("/");
         // Hang JS execution to prevent subsequent errors before the redirect completes
         await new Promise(resolve => setTimeout(resolve, 10000));
         return null;
      }
    }

    const error = await res.json().catch(() => ({ message: res.statusText }));
    // Extract a string message — backend may return { error: { code, message } } or { message: "..." }
    let msg = res.statusText;
    if (typeof error.message === 'string') msg = error.message;
    else if (error.error?.message) msg = error.error.message;
    else if (typeof error.error === 'string') msg = error.error;
    else if (error.message?.message) msg = error.message.message;
    throw {
      status: res.status,
      message: msg,
    };
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Public API ──────────────────────────────────────────────────────────────
const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export default api;
