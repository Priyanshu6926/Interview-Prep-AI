export const TOKEN_KEY = "interview-prep-token";
export const USER_KEY = "interview-prep-user";
const getApiBase = () => {
  let url = import.meta.env.VITE_API_BASE_URL;
  if (!url) {
    return typeof window !== "undefined" && window.location.origin
      ? `${window.location.origin}/api`
      : "/api";
  }
  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

export const API_BASE = getApiBase();

