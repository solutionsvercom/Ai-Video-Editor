/**
 * Local API client (auth, entities, videos).
 * File uploads and image generation: `@/api/integrationsApi`.
 */

import { apiRequest, setToken } from "./httpClient";

function entityClient(entityName) {
  return {
    list: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/entities/${encodeURIComponent(entityName)}${qs ? `?${qs}` : ""}`);
    },
    filter: async (filters = {}) => {
      const qs = new URLSearchParams(filters).toString();
      return apiRequest(`/entities/${encodeURIComponent(entityName)}${qs ? `?${qs}` : ""}`);
    },
    create: async (data) => {
      return apiRequest(`/entities/${encodeURIComponent(entityName)}`, { method: "POST", body: data });
    },
    update: async (id, data) => {
      return apiRequest(`/entities/${encodeURIComponent(entityName)}/${encodeURIComponent(id)}`, { method: "PUT", body: data });
    },
    delete: async (id) => {
      return apiRequest(`/entities/${encodeURIComponent(entityName)}/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  };
}

export const base44 = {
  auth: {
    me: async () => {
      return apiRequest("/auth/me");
    },
    login: async ({ email, password }) => {
      const result = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
      if (result?.token) setToken(result.token);
      return result;
    },
    register: async ({ email, password, full_name }) => {
      const result = await apiRequest("/auth/register", { method: "POST", body: { email, password, full_name } });
      if (result?.token) setToken(result.token);
      return result;
    },
    updateMe: async (data) => {
      return apiRequest("/auth/me", { method: "PUT", body: data });
    },
    redirectToLogin: () => {
      window.location.assign("/login");
    },
    logout: () => {
      setToken(null);
      window.location.assign("/login");
    },
  },

  entities: {
    Project: entityClient("Project"),
    MusicTrack: entityClient("MusicTrack"),
  },

  videos: {
    generate: async ({ type, prompt, settings, audio_url, image_urls }) => {
      return apiRequest("/videos/generate", {
        method: "POST",
        body: { type, prompt, settings, audio_url, image_urls },
      });
    },
  },
};
