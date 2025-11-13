const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const API_BASE =
  RAW_API_BASE.trim().replace(/\/+$/, "") || "";

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (!API_BASE) {
    return path;
  }

  return `${API_BASE}${path}`;
}

export function apiFetch(input: string, init?: RequestInit) {
  const url = buildUrl(input);
  return fetch(url, init);
}

export function getApiBaseUrl() {
  return API_BASE;
}


