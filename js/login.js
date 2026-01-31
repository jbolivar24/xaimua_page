// js/login.js
import { API_BASE, ROUTES, buildPath } from "./config.js";

const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const loginBtn   = document.getElementById("loginBtn");
const msgEl      = document.getElementById("loginMessage");
const forgotBtn    = document.getElementById("forgotBtn");
const forgotModal  = document.getElementById("forgotModal");
const cancelForgot = document.getElementById("cancelForgot");
const confirmForgot = document.getElementById("confirmForgot");

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
  const rawUsername = (usernameEl.value || "").trim();
  //const normalized = rawUsernamenormalizeRut(rawUsername);
  const username = rawUsername;//normalized ? normalized.replace("-", "") : null;
  const password = (passwordEl.value || "").trim();

  //if (!username) {
    //setMsg("RUT inválido.");
    //return;
  //}

  loginBtn.disabled = true;
  setMsg("");

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password })
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

forgotBtn.addEventListener("click", () => {
    const username = (usernameEl.value || "").trim();

    if (!username) {
        setMsg("Debes ingresar tu correo para recuperar la contraseña.");
        usernameEl.focus();
        return;
    }

    // abrir modal
    forgotModal.classList.remove("hidden");
});

cancelForgot.addEventListener("click", () => {
    forgotModal.classList.add("hidden");
});

confirmForgot.addEventListener("click", async () => {
  const email = (usernameEl.value || "").trim().toLowerCase();

  if (!email) {
    setMsg("Debes ingresar tu correo.", true);
    return;
  }

  confirmForgot.disabled = true;
  forgotModal.classList.add("hidden");
  setMsg("Enviando correo...", false);

  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => null);

    setMsg(
      data?.message || "Si el correo se encuentra registrado, recibirás un mensaje con las instrucciones.",
      false
    );
  } catch (err) {
    console.error(err);
    setMsg("No fue posible enviar la solicitud. Intenta más tarde.", true);
  } finally {
    confirmForgot.disabled = false;
  }
});

function normalizeRut(input) {
    if (!input) return null;

    // 1. Quitar puntos, espacios y guiones
    let clean = input
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[^0-9K]/g, "");

    // 2. Debe tener al menos 2 caracteres (cuerpo + DV)
    if (clean.length < 2) return null;

    // 3. Separar cuerpo y dígito verificador
    const body = clean.slice(0, -1);
    const dv   = clean.slice(-1);

    // 4. Validar cuerpo numérico
    if (!/^\d+$/.test(body)) return null;

    // 5. Validar DV
    if (!/^[0-9K]$/.test(dv)) return null;

    // 6. Formato final estándar
    return `${body}-${dv}`;
}

const continueRecover = document.getElementById("continueRecover");

continueRecover.addEventListener("click", () => {
  const type = document.querySelector("input[name='recoverType']:checked")?.value;

  if (!type) {
    setMsg("Debes seleccionar una opción.");
    return;
  }

  forgotModal.classList.add("hidden");

  if (type === "PASSWORD") {
    recoverPassword();
  }

  if (type === "EMAIL") {
    openRecoverEmailModal();
  }

  if (type === "BOTH") {
    recoverAccount();
  }
});

function recoverPassword() {
  confirmForgot.click(); // reutilizas lo que ya tienes
}

function openRecoverEmailModal() {
  // abrir modal nuevo para ingresar y confirmar correo
}

async function recoverAccount() {
  setMsg("Enviando instrucciones...", false);

  await fetch(`${API_BASE}/api/auth/recover-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: (usernameEl.value || "").trim().toLowerCase()
    })
  });

  setMsg("Revisa tu correo para continuar.", false);
}
