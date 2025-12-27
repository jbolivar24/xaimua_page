// js/login.js
import { API_BASE, ROUTES, buildPath } from "./config.js";

const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const loginBtn   = document.getElementById("loginBtn");
const msgEl      = document.getElementById("loginMessage");

function setMsg(text, isError = true) {
  msgEl.textContent = text || "";
  msgEl.style.color = isError ? "#ff6b6b" : "#7CFFB2";
}

function saveTokenByRole(role, token) {
  // token general
  localStorage.setItem("xaToken", token);
  localStorage.setItem("xaRole", role);

  // token por rol
  if (role === "ADMIN")     localStorage.setItem("adminToken", token);
  if (role === "VENDEDOR")  localStorage.setItem("vendedorToken", token);
  if (role === "USUARIO")   localStorage.setItem("userToken", token);
}

async function doLogin() {
  const username = (usernameEl.value || "").trim();
  const password = (passwordEl.value || "").trim();

  if (!username) {
    setMsg("Ingresa tu usuario.");
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

    // 🔐 GUARDAR TOKEN PRIMERO (CLAVE)
    if (data?.token && data?.role) {
      saveTokenByRole(data.role, data.token);
    }

    // 🔁 redirecciones (crear contraseña / admin / usuario)
    if (data?.redirect) {
      const target = ROUTES[data.redirect] || data.redirect;
      window.location.href = buildPath(target);
      return;
    }

    setMsg("Login exitoso", false);

  } catch (err) {
    console.error(err);
    setMsg("Error conectando con el backend.");
  } finally {
    loginBtn.disabled = false;
  }
}

loginBtn.addEventListener("click", doLogin);

// Enter para loguear
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});
