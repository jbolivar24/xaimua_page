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

forgotBtn.addEventListener("click", () => {
    const username = (usernameEl.value || "").trim();

    if (!username) {
        setMsg("Debes ingresar tu RUT para recuperar la contraseña.");
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
    forgotModal.classList.add("hidden");

    setMsg("Enviando correo...", false);

    // 👇 luego aquí va el fetch real al backend
    // por ahora solo simulamos
    confirmForgot.addEventListener("click", async () => {
        forgotModal.classList.add("hidden");

        const rut = usernameEl.value.trim();
        setMsg("Enviando correo...", false);

        try {
            const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rut })
            });

            const data = await res.json().catch(() => null);

            setMsg(
                data?.message || 
                "Si el usuario existe, recibirás un correo con instrucciones.",
                false
            );

        } catch (err) {
            console.error(err);
            setMsg("No fue posible enviar la solicitud. Intenta más tarde.");
        }
    });
});

