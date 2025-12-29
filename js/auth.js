// /js/auth.js
import { API_BASE, ROUTES, buildPath } from "./config.js";

export function getRole() {
  return localStorage.getItem("xaRole") || "";
}

export function getTokenForRole(role) {
  if (role === "ADMIN") return localStorage.getItem("adminToken");
  if (role === "VENDEDOR") return localStorage.getItem("vendedorToken");
  if (role === "USUARIO") return localStorage.getItem("userToken");
  return null;
}

export function getAnyToken() {
  return (
    localStorage.getItem("xaToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("vendedorToken") ||
    localStorage.getItem("userToken") ||
    ""
  );
}

export function getActiveToken() {
  const role = getRole();
  return getTokenForRole(role) || localStorage.getItem("xaToken") || "";
}

export function clearSession() {
  localStorage.removeItem("xaToken");
  localStorage.removeItem("xaRole");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("vendedorToken");
  localStorage.removeItem("userToken");
  // si luego guardas username, bórralo aquí también:
  localStorage.removeItem("xaUser");
}

export async function logout() {
  const token = getAnyToken();

  try {
    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: token }
      });
    }
  } catch (e) {
    // da igual si falla, igual limpiamos
    console.warn("logout error:", e);
  } finally {
    clearSession();
    window.location.href = buildPath(ROUTES["/login"]);
  }
}

// Guard genérico por rol
export function requireRole(expectedRole) {
  const role = getRole();
  const token =
    (expectedRole === "USUARIO" && (localStorage.getItem("userToken") || localStorage.getItem("xaToken"))) ||
    (expectedRole === "VENDEDOR" && (localStorage.getItem("vendedorToken") || localStorage.getItem("xaToken"))) ||
    (expectedRole === "ADMIN" && (localStorage.getItem("adminToken") || localStorage.getItem("xaToken"))) ||
    "";

  if (!token || (role && role !== expectedRole)) {
    // Si no hay token, o si hay role pero no coincide => pa' login
    window.location.href = buildPath(ROUTES["/login"]);
    return false;
  }

  return true;
}
