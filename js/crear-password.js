// ================= CONFIG =================
const API_BASE = "https://api.xaimua.com";

// ================= ELEMENTOS =================
const pass1El = document.getElementById("password");
const pass2El = document.getElementById("password2");
const btn = document.getElementById("createPasswordBtn");
const msgEl = document.getElementById("msg");

// ================= HELPERS =================
function showMsg(text, ok = false) {
  msgEl.textContent = text;
  msgEl.style.color = ok ? "#7CFFB2" : "#ff6b6b";
}

function disableForm(disabled = true) {
  pass1El.disabled = disabled;
  pass2El.disabled = disabled;
  btn.disabled = disabled;
}

// ================= DETECTAR MODO =================
const params = new URLSearchParams(window.location.search);
const username = params.get("u");
const token = params.get("token");

let mode = null;

if (token) {
  mode = "RESET";
} else if (username) {
  mode = "CREATE";
} else {
  showMsg("Enlace inválido o vencido.");
  disableForm(true);
  throw new Error("No mode detected");
}

// ================= AJUSTAR TEXTOS =================
const titleEl = document.querySelector(".form-card h2");
const subtitleEl = document.querySelector(".form-card .muted");

if (mode === "RESET") {
  titleEl.textContent = "Recuperar contraseña";
  subtitleEl.textContent = "Crea una nueva contraseña para tu cuenta";
} else {
  titleEl.textContent = "Crear contraseña";
  subtitleEl.textContent = "Establece una contraseña para tu cuenta";
}

// ================= SUBMIT =================
btn.addEventListener("click", async (e) => {
  e.preventDefault();

  const pass1 = pass1El.value.trim();
  const pass2 = pass2El.value.trim();

  if (!pass1 || !pass2) {
    showMsg("Debes completar ambos campos.");
    return;
  }

  if (pass1 !== pass2) {
    showMsg("Las contraseñas no coinciden.");
    return;
  }

  disableForm(true);
  showMsg("Procesando...", true);

  let endpoint;
  let payload;

  if (mode === "RESET") {
    endpoint = `${API_BASE}/api/auth/reset-password`;
    payload = {
      token,
      password: pass1
    };
  } else {
    endpoint = `${API_BASE}/api/auth/create-password`;
    payload = {
      username,
      password: pass1
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al procesar la solicitud");
    }

    showMsg("Contraseña guardada correctamente. Redirigiendo...", true);

    setTimeout(() => {
      window.location.href = "/xaimua_page/html/login.html";
    }, 2000);

  } catch (err) {
    showMsg(err.message || "Ocurrió un error.");
    disableForm(false);
  }
});
