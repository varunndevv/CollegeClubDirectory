/**
 * API base URL resolution:
 *
 * Browser (client-side):
 *   Uses "" (empty string) → requests go to the same origin as the page.
 *   In dev, Next.js rewrites proxy /api/* to the Express server on :4000.
 *   In production, Express serves both the API and the Next.js app on one port.
 *
 * Server (SSR / API routes):
 *   Uses INTERNAL_API_URL (defaults to http://localhost:4000) since there is
 *   no "same origin" concept on the server.
 */
function getApiBase() {
  // Client-side: always use same-origin relative path
  if (typeof window !== "undefined") {
    return "/api"
  }
  // Server-side (SSR): use the internal server URL
  const port = process.env.PORT || 4000
  const serverUrl = process.env.INTERNAL_API_URL || `http://localhost:${port}`
  return `${serverUrl}/api`
}

/**
 * Make an authenticated API request.
 * JWT token is sent via httpOnly cookie automatically.
 */
export async function apiRequest(endpoint, options = {}) {
  const API_BASE = getApiBase()
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("authToken")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
      const userStr = localStorage.getItem("currentUser")
      if (userStr) {
        const user = JSON.parse(userStr)
        const userId = user?.id || user?._id
        if (userId) {
          headers["x-user-id"] = String(userId)
        }
      }
    } catch {
      // ignore
    }
  }

  const fetchOptions = {
    method: options.method || "GET",
    headers,
    credentials: "include", // Send httpOnly cookies
  }

  if (options.body && fetchOptions.method !== "GET") {
    fetchOptions.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    let errorData = null;
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const text = await response.text();
      if (text) {
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData?.message || errorData?.error || text;
        } catch {
          errorMessage = text;
        }
      }
    } catch (e) {
      // If reading text fails, we keep the default message
    }

    // Ensure the message is always a strict string
    if (typeof errorMessage !== "string") {
      try {
        errorMessage = JSON.stringify(errorMessage);
      } catch {
        errorMessage = String(errorMessage);
      }
    }

    const error = new Error(errorMessage || "API Request Failed");
    error.status = response.status || 500;
    // Safely attach serializable data
    error.data = errorData || {};
    throw error;
  }

  try {
    return await response.json()
  } catch {
    return {}
  }
}
