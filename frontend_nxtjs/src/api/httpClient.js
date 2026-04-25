const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const TOKEN_STORAGE_KEY = "aivideo_token";
const IS_DEV = process.env.NODE_ENV !== "production";

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token) {
  if (!token) localStorage.removeItem(TOKEN_STORAGE_KEY);
  else localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function apiRequest(path, { method = "GET", headers, body, isFormData = false } = {}) {
  const token = getToken();
  if (IS_DEV) {
    const payloadPreview = isFormData
      ? Object.fromEntries(
          Array.from(body?.entries?.() || []).map(([key, value]) => [
            key,
            value instanceof File
              ? { name: value.name, type: value.type, size: value.size }
              : value,
          ])
        )
      : body ?? null;

    console.log("[apiRequest] Sending request", {
      url: `${API_BASE_URL}${path}`,
      method,
      params: payloadPreview,
    });
    console.log(
      `[apiRequest] ${method} ${API_BASE_URL}${path} payload=${JSON.stringify(payloadPreview)}`
    );
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      credentials: "include",
    });
  } catch (e) {
    const code = e?.cause?.code || e?.code;
    const msg =
      code === "ECONNRESET" || /socket hang up|Failed to fetch|NetworkError/i.test(String(e?.message || ""))
        ? "Connection to the API was reset (often a timeout). If image generation takes a long time, restart the Next dev server after updating next.config.mjs proxyTimeout, or set NEXT_PUBLIC_API_BASE_URL to your backend URL (e.g. http://localhost:5000/api)."
        : e?.message || "Network request failed";
    const err = new Error(msg);
    err.cause = e;
    throw err;
  }

  if (!res.ok) {
    let payload;
    try {
      payload = await res.json();
    } catch {
      payload = { error: await res.text().catch(() => "Request failed") };
    }
    const err = new Error(payload?.error || "Request failed");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}
