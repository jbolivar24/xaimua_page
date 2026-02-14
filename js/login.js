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
  resetRecoverTypeSelection();
});

continueRecover.addEventListener("click", () => {
  const type = document.querySelector("input[name='recoverType']:checked")?.value;

  if (!type) {
    return;
  }

  recoverTypeModal.classList.add("hidden");
  resetRecoverTypeSelection();

  if (type === "PASSWORD") {
    resetRecoverPasswordForm();
    recoverPasswordModal.classList.remove("hidden");
  }

  if (type === "EMAIL" || type === "BOTH") {
    resetRecoverEmailForm();
    recoverEmailModal.classList.remove("hidden");
  }
});

// ================== RECUPERAR CONTRASEÑA ==================
cancelRecoverPassword.addEventListener("click", () => {
  recoverPasswordModal.classList.add("hidden");
  clearRecoverPasswordMsg();
  resetRecoverPasswordForm();
});

// ================== RECUPERAR CORREO / TODO ==================
cancelRecoverEmail.addEventListener("click", () => {
  recoverEmailModal.classList.add("hidden");
  clearRecoverEmailMsg();
  resetRecoverPasswordForm();
});

confirmRecoverEmail.addEventListener("click", async () => {
  const email1 = (newEmailInput.value || "").trim().toLowerCase();
  const email2 = (confirmNewEmailInput.value || "").trim().toLowerCase();

  if (!email1 || !email2) {
    setRecoverEmailMsg("Debes completar ambos campos.", true);
    return;
  }

  if (email1 !== email2) {
    setRecoverEmailMsg("Los correos no coinciden.", true);
    return;
  }

  setRecoverEmailMsg("Enviando instrucciones...", false);

  try {
    const res = await fetch(`${API_BASE}/api/auth/recover-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email1 })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setRecoverEmailMsg(data?.message || "Error al procesar la solicitud.", true);
      return;
    }

    setRecoverEmailMsg(data?.message || "Solicitud procesada.", false);

  } catch (e) {
    setRecoverEmailMsg("No fue posible enviar la solicitud.", true);
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

function setRecoverEmailMsg(text, isError = true) {
  const el = document.getElementById("recoverEmailMsg");
  if (!el) return;

  el.textContent = text || "";
  el.style.color = isError ? "#ff6b6b" : "#7CFFB2";
}

function clearRecoverPasswordMsg() {
  const el = document.getElementById("recoverPasswordMsg");
  if (el) el.textContent = "";
}

function clearRecoverEmailMsg() {
  const el = document.getElementById("recoverEmailMsg");
  if (el) el.textContent = "";
}

function resetRecoverPasswordForm() {
  recoverEmailInput.value = "";
  clearRecoverPasswordMsg();
}

function resetRecoverEmailForm() {
  newEmailInput.value = "";
  confirmNewEmailInput.value = "";
  clearRecoverEmailMsg();
}

function resetRecoverTypeSelection() {
  const radios = document.querySelectorAll("input[name='recoverType']");
  radios.forEach(r => r.checked = false);
}

async function openSecurityQuestionsModal(token) {

  const modal = document.getElementById("securityQuestionsModal");
  const container = document.getElementById("securityQuestionsContainer");

  modal.classList.remove("hidden");
  container.innerHTML = "Cargando preguntas...";

  try {
    const res = await fetch(`${API_BASE}/api/auth/recovery-questions?token=${token}`);
    const data = await res.json();

    container.innerHTML = "";

    data.questions.forEach(q => {
      container.innerHTML += `
        <label>${formatQuestion(q)}</label>
        <input type="text" data-question="${q}" class="securityAnswer">
      `;
    });

    setupSecurityValidation(token);

  } catch {
    container.innerHTML = "No fue posible cargar las preguntas.";
  }
}

function getRecoveryTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("recoverToken");
}

function formatQuestion(q) {
  return q.replaceAll("_", " ");
}

function setupSecurityValidation(token) {

  document.getElementById("confirmSecurityAnswers")
    .onclick = async () => {

      const answers = {};
      document.querySelectorAll(".securityAnswer").forEach(input => {
        answers[input.dataset.question] = input.value.trim().toLowerCase();
      });

      const res = await fetch(`${API_BASE}/api/auth/recovery-validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers })
      });

      const data = await res.json();

      document.getElementById("securityQuestionsMsg")
        .textContent = data.message;

      if (res.ok) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      }
  };
}

window.addEventListener("DOMContentLoaded", async () => {

  const token = getRecoveryTokenFromUrl();
  if (!token) return;

  await openSecurityQuestionsModal(token);
});
