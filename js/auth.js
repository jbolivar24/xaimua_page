// js/auth.js
import { API_BASE, buildPath } from "./config.js";

/**
 * Devuelve el token activo (admin / usuario / vendedor)
 */
export function getActiveToken() {
  return localStorage.getItem("xaToken");
}

export function getActiveRole() {
  return localStorage.getItem("xaRole");
}

/**
 * Logout universal
 */
export async function logout() {
  const token = getActiveToken();

  if (token) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": token }
      });
    } catch (e) {
      console.warn("Logout backend no respondió", e);
    }
  }

  localStorage.clear();
  window.location.href = buildPath("/html/login.html");
}
