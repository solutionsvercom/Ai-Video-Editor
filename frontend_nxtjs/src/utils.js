const ROUTE_MAP = {
  Welcome: "",
  Login: "login",
  Dashboard: "dashboard",
  Projects: "projects",
  Templates: "templates",
  MusicLibrary: "music-library",
  ImageGenerator: "image-generator",
  CreateProject: "create-project",
  Settings: "settings",
  Account: "account",
  Editor: "editor",
  Export: "export",
};

function fallbackHyphenate(name) {
  // Convert PascalCase / camelCase to hyphenated lowercase.
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

export function createPageUrl(pageName) {
  const [page, query] = pageName.split("?");
  const route = ROUTE_MAP[page] ?? fallbackHyphenate(page);

  // Root route: Welcome.
  if (page === "Welcome") return "/";

  // Dynamic segments (id from query string).
  if (page === "Editor" || page === "Export") {
    const params = new URLSearchParams(query || "");
    const id = params.get("id");
    return `/${route}/${id || ""}`.replace(/\/$/, "");
  }

  const path = route ? `/${route}` : "";
  return query ? `${path}?${query}` : path;
}
