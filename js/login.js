// js/login.js
import { API_BASE, ROUTES, buildPath } from "./config.js";

// ================== ELEMENTOS ==================
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const loginBtn   = document.getElementById("loginBtn");
const msgEl      = document.getElementById("loginMessage");
const forgotBtn  = document.getElementById("forgotBtn");

// Modales
const recoverTypeModal     = document.getElementById("recoverTypeModal");
const recoverPasswordModal = document.getElementById("recoverPasswordModal");
const recoverEmailModal    = document.getElementById("recoverEmailModal");

// Botones
const continueRecover          = document.getElementById("continueRecover");
const cancelRecoverType        = document.getElementById("cancelRecoverType");

const cancelRecoverPassword    = document.getElementById("cancelRecoverPassword");
const confirmRecoverPassword   = document.getElementById("confirmRecoverPassword");

const cancelRecoverEmail       = document.getElementById("cancelRecoverEmail");
const confirmRecoverEmail      = document.getElementById("confirmRecoverEmail");

// Inputs recovery
const recoverEmailInput        = document.getElementById("recoverEmailInput");
const newEmailInput            = document.getElementById("newEmailInput");
const confirmNewEmailInput     = document.getElementById("confirmNewEmailInput");

// ================== HELPERS ==================
function setMsg(text, isError = true) {
  msgEl.textContent = text || "";
  msgEl.style.color = isError ? "#ff6b6b" : "#7CFFB2";
}

function saveTokenByRole(role, token) {
  localStorage.setItem("xaToken", token);
  localStorage.setItem("xaRole", role);

  if (role === "ADMIN")    localStorage.setItem("adminToken", token);
  if (role === "VENDEDOR") localStorage.setItem("vendedorToken", token);
  if (role === "USUARIO")  localStorage.setItem("userToken", token);
}

// ================== LOGIN ==================
async function doLogin() {
  const email = (usernameEl.value || "").trim();
  const password = (passwordEl.value || "").trim();

  loginBtn.disabled = true;
  setMsg("");

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(data?.message || "Credenciales inválidas");
      return;
    }

    if (data?.token && data?.role) {
      saveTokenByRole(data.role, data.token);
    }

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

// ================== EVENTOS ==================
loginBtn.addEventListener("click", doLogin);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});

// ================== RECUPERACIÓN ==================
forgotBtn.addEventListener("click", () => {
  recoverTypeModal.classList.remove("hidden");
});

cancelRecoverType.addEventListener("click", () => {
  recoverTypeModal.classList.add("hidden");
});

continueRecover.addEventListener("click", () => {
  const type = document.querySelector("input[name='recoverType']:checked")?.value;

  if (!type) {
    setMsg("Debes seleccionar una opción.");
    return;
  }

  recoverTypeModal.classList.add("hidden");

  if (type === "PASSWORD") {
    recoverPasswordModal.classList.remove("hidden");
  }

  if (type === "EMAIL" || type === "BOTH") {
    recoverEmailModal.classList.remove("hidden");
  }
});

// ================== RECUPERAR CONTRASEÑA ==================
cancelRecoverPassword.addEventListener("click", () => {
  recoverPasswordModal.classList.add("hidden");
});

confirmRecoverPassword.addEventListener("click", async () => {
  const email = (recoverEmailInput.value || "").trim().toLowerCase();

  if (!email) {
    setMsg("Debes ingresar un correo.", true);
    return;
  }

  recoverPasswordModal.classList.add("hidden");
  setMsg("Enviando correo...", false);

  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => null);
    setMsg(data?.message || "Revisa tu correo.", false);

  } catch (err) {
    console.error(err);
    setMsg("No fue posible enviar el correo.", true);
  }
});

// ================== RECUPERAR CORREO / TODO ==================
cancelRecoverEmail.addEventListener("click", () => {
  recoverEmailModal.classList.add("hidden");
});

confirmRecoverEmail.addEventListener("click", async () => {
  const email1 = (newEmailInput.value || "").trim().toLowerCase();
  const email2 = (confirmNewEmailInput.value || "").trim().toLowerCase();

  if (!email1 || !email2) {
    setMsg("Debes completar ambos campos.", true);
    return;
  }

  if (email1 !== email2) {
    setMsg("Los correos no coinciden.", true);
    return;
  }

  recoverEmailModal.classList.add("hidden");
  setMsg("Enviando instrucciones...", false);

  try {
    await fetch(`${API_BASE}/api/auth/recover-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail: email1 })
    });

    setMsg("Revisa tu correo para continuar.", false);
  } catch (e) {
    setMsg("No fue posible enviar la solicitud.", true);
  }
});

function setRecoverPasswordMsg(text, isError = true) {
  const el = document.getElementById("recoverPasswordMsg");
  if (!el) return;

  el.textContent = text || "";
  el.style.color = isError ? "#ff6b6b" : "#7CFFB2";
}

confirmRecoverPassword.addEventListener("click", async () => {
  const email = (recoverEmailInput.value || "").trim().toLowerCase();

  if (!email) {
    setRecoverPasswordMsg("Debes ingresar tu correo.", true);
    return;
  }

  setRecoverPasswordMsg("Enviando correo...", false);

  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => null);
    setRecoverPasswordMsg(data?.message || "Revisa tu correo.", false);

  } catch (err) {
    setRecoverPasswordMsg("No fue posible enviar el correo.", true);
  }
});

