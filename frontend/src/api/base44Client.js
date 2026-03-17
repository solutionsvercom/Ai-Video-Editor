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

function entityClient(entityName) {
  return {
    list: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/entities/${encodeURIComponent(entityName)}${qs ? `?${qs}` : ""}`);
    },
    filter: async (filters = {}) => {
      const qs = new URLSearchParams(filters).toString();
      return request(`/entities/${encodeURIComponent(entityName)}${qs ? `?${qs}` : ""}`);
    },
    create: async (data) => {
      return request(`/entities/${encodeURIComponent(entityName)}`, { method: "POST", body: data });
    },
    update: async (id, data) => {
      return request(`/entities/${encodeURIComponent(entityName)}/${encodeURIComponent(id)}`, { method: "PUT", body: data });
    },
    delete: async (id) => {
      return request(`/entities/${encodeURIComponent(entityName)}/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  };
}

export const base44 = {
  auth: {
    me: async () => {
      return request("/auth/me");
    },
    login: async ({ email, password }) => {
      const result = await request("/auth/login", { method: "POST", body: { email, password } });
      if (result?.token) setToken(result.token);
      return result;
    },
    register: async ({ email, password, full_name }) => {
      const result = await request("/auth/register", { method: "POST", body: { email, password, full_name } });
      if (result?.token) setToken(result.token);
      return result;
    },
    updateMe: async (data) => {
      return request("/auth/me", { method: "PUT", body: data });
    },
    redirectToLogin: () => {
      window.location.assign("/Login");
    },
    logout: () => {
      setToken(null);
      window.location.assign("/Login");
    },
  },

  entities: {
    Project: entityClient("Project"),
    MusicTrack: entityClient("MusicTrack"),
  },

  integrations: {
    Core: {
      GenerateImage: async ({ prompt, existing_image_urls }) => {
        return request("/integrations/generate-image", { method: "POST", body: { prompt, existing_image_urls } });
      },
      UploadFile: async ({ file }) => {
        const form = new FormData();
        form.append("file", file);
        return request("/integrations/upload", { method: "POST", body: form, isFormData: true });
      },
      InvokeLLM: async (payload) => {
        return request("/integrations/llm", { method: "POST", body: payload });
      },
      SendEmail: async (payload) => {
        return request("/integrations/send-email", { method: "POST", body: payload });
      },
    },
  },

  videos: {
    generate: async ({ type, prompt, settings, audio_url, image_urls }) => {
      return request("/videos/generate", {
        method: "POST",
        body: { type, prompt, settings, audio_url, image_urls },
      });
    },
  },
};
