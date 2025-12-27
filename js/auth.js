// js/auth.js
import { API_BASE, buildPath } from "./config.js";

export async function logout() {
  const token = localStorage.getItem("adminToken");

  if (token) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": token }
      });
    } catch (e) {
      // si el backend no responde, igual salimos
      console.warn("Logout backend no respondió", e);
    }
  }

  localStorage.clear();
  window.location.href = buildPath("/html/login.html");
}
