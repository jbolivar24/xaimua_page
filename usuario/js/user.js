import { API_BASE } from "/xaimua_page/js/config.js";

// ================= TOKEN =================
function getToken() {
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("usuarioToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

// ================= HINT =================
function setHint(id, msg, ok = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || "";
  el.style.opacity = msg ? "1" : "0";
  el.style.color = ok ? "#7CFCB0" : "rgba(255,255,255,0.85)";
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("usuarioToken");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("token");
  window.location.href = "/xaimua_page/index.html";
}

// ================= EMAIL HEADER =================
async function loadUserEmail() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/backup/last`, {
      headers: { Authorization: token }
    });
    if (!res.ok) return;

    const data = await res.json();
    const email = data.email || data.userEmail || data.rut || "";
    if (email) document.getElementById("userEmail").textContent = email;
  } catch (e) {
    console.warn("loadUserEmail", e);
  }
}

// ================= MODALS =================
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("open");
  el.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  el.setAttribute("aria-hidden", "true");
}

function wireModals() {
  document.getElementById("openEmailModalBtn")?.addEventListener("click", () => openModal("emailModal"));
  document.getElementById("openPassModalBtn")?.addEventListener("click", () => openModal("passModal"));
  document.getElementById("openSecurityQModalBtn")?.addEventListener("click", () => openModal("securityQModal"));
  document.getElementById("openClientDataModalBtn")?.addEventListener("click", async () => {
    openModal("clientDataModal");
    await loadUserProfile();
  });

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close")));
  });

  ["emailModal", "passModal", "securityQModal", "clientDataModal"].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener("click", e => {
      if (e.target === el) closeModal(id);
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal("emailModal");
      closeModal("passModal");
      closeModal("securityQModal");
      closeModal("clientDataModal");
    }
  });
}

// ================= UPDATE EMAIL =================
async function updateEmail() {
  const e1 = document.getElementById("modalNewEmail").value.trim().toLowerCase();
  const e2 = document.getElementById("modalNewEmail2").value.trim().toLowerCase();

  setHint("emailHint", "");

  if (!e1 || !e2) return setHint("emailHint", "Completa ambos campos.");
  if (e1 !== e2) return setHint("emailHint", "Los correos no coinciden.");

  try {
    const res = await fetch(`${API_BASE}/api/user/email`, {
      method: "PUT",
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ newEmail: e1 })
    });

    const data = await res.json();

    if (!res.ok) return setHint("emailHint", data.message || "Error");

    setHint("emailHint", data.message, true);

    if (data.action === "RELOGIN_REQUIRED") {
      setTimeout(logout, 1200);
    } else {
      closeModal("emailModal");
    }

  } catch (e) {
    console.error(e);
    setHint("emailHint", "Error de conexión");
  }
}

// ================= UPDATE PASSWORD =================
async function updatePassword() {
  const p1 = document.getElementById("modalNewPass").value;
  const p2 = document.getElementById("modalNewPass2").value;

  setHint("passHint", "");

  if (!p1 || !p2) return setHint("passHint", "Completa ambos campos.");
  if (p1 !== p2) return setHint("passHint", "Las contraseñas no coinciden.");
  if (p1.length < 4) return setHint("passHint", "Contraseña muy corta.");

  try {
    const res = await fetch(`${API_BASE}/api/user/password`, {
      method: "PUT",
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ newPassword: p1 })
    });

    const data = await res.json();
    if (!res.ok) return setHint("passHint", data.message || "Error");

    setHint("passHint", "Contraseña actualizada", true);
    closeModal("passModal");

  } catch (e) {
    console.error(e);
    setHint("passHint", "Error de conexión");
  }
}

// ================= SECURITY QUESTIONS =================
async function saveSecurityAnswers() {
  const a1 = document.getElementById("secAns1").value.trim();
  const a2 = document.getElementById("secAns2").value.trim();
  const a3 = document.getElementById("secAns3").value.trim();

  setHint("securityQHint", "");

  if (!a1 || !a2 || !a3) {
    return setHint("securityQHint", "Debes responder todas las preguntas.");
  }

  const payload = {
    questions: [
      "nombre_mascota_favorita",
      "lugar_nacimiento_abuela_materna",
      "escuela_basica"
    ],
    answers: [a1, a2, a3]
  };

  try {
    const res = await fetch(`${API_BASE}/api/user/security-questions`, {
      method: "POST",
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return setHint("securityQHint", data.message || "Error");

    setHint("securityQHint", "Preguntas guardadas", true);
    closeModal("securityQModal");

  } catch (e) {
    console.error(e);
    setHint("securityQHint", "Error de conexión");
  }
}

// ================= PROFILE =================
async function loadUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      headers: { Authorization: getToken() }
    });
    if (!res.ok) return;

    const d = await res.json();
    document.getElementById("userPhone").value = d.phone || "";
    document.getElementById("userBusinessName").value = d.businessName || "";
    document.getElementById("userRut").value = d.rut || "";
    document.getElementById("userTaxAddress").value = d.taxAddress || "";
    document.getElementById("userGiro").value = d.giro || "";

  } catch (e) {
    console.warn("loadUserProfile", e);
  }
}

async function saveUserProfile() {
  setHint("profileHint", "");

  const payload = {
    phone: document.getElementById("userPhone").value.trim(),
    businessName: document.getElementById("userBusinessName").value.trim(),
    rut: document.getElementById("userRut").value.trim(),
    taxAddress: document.getElementById("userTaxAddress").value.trim(),
    giro: document.getElementById("userGiro").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return setHint("profileHint", data.message || "Error");

    setHint("profileHint", "Datos guardados correctamente", true);
    closeModal("clientDataModal");

  } catch (e) {
    console.error(e);
    setHint("profileHint", "Error de conexión");
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadUserEmail();
  wireModals();

  document.getElementById("logoutHeaderBtn")?.addEventListener("click", logout);
  document.getElementById("updateEmailBtn")?.addEventListener("click", updateEmail);
  document.getElementById("updatePassBtn")?.addEventListener("click", updatePassword);
  document.getElementById("saveSecurityAnswersBtn")?.addEventListener("click", saveSecurityAnswers);
  document.getElementById("saveProfileBtn")?.addEventListener("click", saveUserProfile);

  document.getElementById("backBtn")?.addEventListener("click", () => {
    window.location.href = "/xaimua_page/usuario/index.html";
  });
});
