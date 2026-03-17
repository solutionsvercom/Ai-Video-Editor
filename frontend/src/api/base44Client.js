/**
 * Local, self-hosted replacement for the Base44 SDK client.
 *
 * The rest of the app expects a `base44` object with:
 * - base44.auth.me(), updateMe(), redirectToLogin(), logout()
 * - base44.entities.<Entity>.list(), filter(), update()
 * - base44.integrations.Core.GenerateImage(), UploadFile()
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_STORAGE_KEY = "aivideo_token";
const LOCAL_USER_STORAGE_KEY = "aivideo_local_user";

function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setToken(token) {
  if (!token) localStorage.removeItem(TOKEN_STORAGE_KEY);
  else localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

async function request(path, { method = "GET", headers, body, isFormData = false } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: "include",
  });

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

async function ensureLocalAuth() {
  // Base44 handled auth; locally we auto-provision a user to keep the UI working.
  if (getToken()) return;

  let localUser = null;
  try {
    localUser = JSON.parse(localStorage.getItem(LOCAL_USER_STORAGE_KEY) || "null");
  } catch {
    localUser = null;
  }

  if (!localUser?.email || !localUser?.password) {
    const nonce = Math.random().toString(36).slice(2, 8);
    localUser = {
      email: `local_${nonce}@example.com`,
      password: `local_${nonce}_pass`,
      full_name: "Local User",
    };
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(localUser));
  }

  try {
    const login = await request("/auth/login", { method: "POST", body: { email: localUser.email, password: localUser.password } });
    setToken(login.token);
    return;
  } catch {
    // If the user doesn't exist yet, register then store token.
    const reg = await request("/auth/register", { method: "POST", body: { email: localUser.email, password: localUser.password, full_name: localUser.full_name } });
    setToken(reg.token);
  }
}

function entityClient(entityName) {
  return {
    list: async (params = {}) => {
      await ensureLocalAuth();
      const qs = new URLSearchParams(params).toString();
      return request(`/entities/${encodeURIComponent(entityName)}${qs ? `?${qs}` : ""}`);
    },
    filter: async (filters = {}) => {
      await ensureLocalAuth();
      const qs = new URLSearchParams(filters).toString();
      return request(`/entities/${encodeURIComponent(entityName)}${qs ? `?${qs}` : ""}`);
    },
    create: async (data) => {
      await ensureLocalAuth();
      return request(`/entities/${encodeURIComponent(entityName)}`, { method: "POST", body: data });
    },
    update: async (id, data) => {
      await ensureLocalAuth();
      return request(`/entities/${encodeURIComponent(entityName)}/${encodeURIComponent(id)}`, { method: "PUT", body: data });
    },
    delete: async (id) => {
      await ensureLocalAuth();
      return request(`/entities/${encodeURIComponent(entityName)}/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  };
}

export const base44 = {
  auth: {
    me: async () => {
      await ensureLocalAuth();
      return request("/auth/me");
    },
    updateMe: async (data) => {
      await ensureLocalAuth();
      return request("/auth/me", { method: "PUT", body: data });
    },
    redirectToLogin: () => {
      // Keep UI behavior: provision auth and route to the app.
      ensureLocalAuth()
        .then(() => {
          if (window.location.pathname === "/Welcome" || window.location.pathname === "/") {
            window.location.assign("/Dashboard");
          } else {
            window.location.reload();
          }
        })
        .catch(() => {
          window.location.assign("/Welcome");
        });
    },
    logout: () => {
      setToken(null);
      window.location.assign("/Welcome");
    },
  },

  entities: {
    Project: entityClient("Project"),
    MusicTrack: entityClient("MusicTrack"),
  },

  integrations: {
    Core: {
      GenerateImage: async ({ prompt, existing_image_urls }) => {
        await ensureLocalAuth();
        return request("/integrations/generate-image", { method: "POST", body: { prompt, existing_image_urls } });
      },
      UploadFile: async ({ file }) => {
        await ensureLocalAuth();
        const form = new FormData();
        form.append("file", file);
        return request("/integrations/upload", { method: "POST", body: form, isFormData: true });
      },
      InvokeLLM: async (payload) => {
        await ensureLocalAuth();
        return request("/integrations/llm", { method: "POST", body: payload });
      },
      SendEmail: async (payload) => {
        await ensureLocalAuth();
        return request("/integrations/send-email", { method: "POST", body: payload });
      },
    },
  },

  videos: {
    generate: async ({ type, prompt, settings, audio_url, image_urls }) => {
      await ensureLocalAuth();
      return request("/videos/generate", {
        method: "POST",
        body: { type, prompt, settings, audio_url, image_urls },
      });
    },
  },
};
