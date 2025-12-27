// js/config.js

const isLocal = true;//["localhost", "127.0.0.1"].includes(window.location.hostname);

// Backend base
export const API_BASE = isLocal
  ? "http://localhost:8080"
  : "https://api.xaimua.com";

// GitHub Pages base (si aplica)
export const REPO_BASE = window.location.hostname.includes("github.io")
  ? "/xaimua_page"
  : "";

// Rutas lógicas (las que te devuelve el backend en LoginResponse.redirect)
export const ROUTES = {
  "/admin": "/admin/index.html",
  "/usuario": "/usuario/index.html",
  "/login": "/html/login.html",
  "/crear-password": "/html/crear-password.html"
};

// helper para prefijar REPO_BASE cuando aplique
export function buildPath(path) {
  if (!REPO_BASE) return path;
  if (path.startsWith(REPO_BASE)) return path;
  return `${REPO_BASE}${path}`;
}
//https://api.xaimua.com/api/banners