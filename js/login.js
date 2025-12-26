// js/login.js
import { API_BASE, ROUTES, buildPath } from "./config.js";

const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msgEl = document.getElementById("loginMessage");

function setMsg(text, isError = true) {
  msgEl.textContent = text || "";
  msgEl.style.color = isError ? "#ff6b6b" : "#7CFFB2";
}

function saveTokenByRole(role, token) {
  // token general
  localStorage.setItem("xaToken", token);
  localStorage.setItem("xaRole", role);

  // token por rol (por comodidad)
  if (role === "ADMIN") localStorage.setItem("adminToken", token);
  if (role === "VENDEDOR") localStorage.setItem("vendedorToken", token);
  if (role === "USUARIO") localStorage.setItem("userToken", token);
}

async function doLogin() {
  const username = (usernameEl.value || "").trim();
  const password = (passwordEl.value || "").trim();

  if (!username || !password) {
    setMsg("Completa usuario y contraseña.");
    return;
  }

  loginBtn.disabled = true;
  setMsg("");

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(data?.message || "Credenciales inválidas");
      return;
    }

    // si backend indica redirección (ej: crear contraseña)
    if (data?.redirect) {
    window.location.href = buildPath(data.redirect);
    return;
    }

    if (!data?.token) {
      setMsg(data?.message || "No se recibió token.");
      return;
    }

    saveTokenByRole(data.role, data.token);

    const target = ROUTES[data.redirect] || ROUTES["/login"];
    window.location.href = buildPath(target);

  } catch (e) {
    setMsg("Error conectando con el backend.");
    console.error(e);
  } finally {
    loginBtn.disabled = false;
  }
}

loginBtn.addEventListener("click", doLogin);

// Enter para loguear
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});
