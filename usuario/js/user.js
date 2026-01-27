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

function setHint(id, msg, ok=false){
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

// ================= CARGAR EMAIL (reutiliza /api/backup/last) =================
async function loadUserEmail() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/backup/last`, {
      headers: { "Authorization": token }
    });
    if (!res.ok) return;

    const data = await res.json();

    // En tu back ya viene rut/email en varios endpoints; aquí tomamos lo que exista
    const email = data.email || data.userEmail || data.rut || "";
    if (email) {
      const el = document.getElementById("userEmail");
      if (el) el.textContent = email;
    }
  } catch (e) {
    console.warn("loadUserEmail error", e);
  }
}

// ================= INIT UI =================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutHeaderBtn")?.addEventListener("click", logout);

  // Carga email arriba
  loadUserEmail();

  // Botones: por ahora solo placeholders hasta que hagamos endpoints
  document.getElementById("saveEmailBtn")?.addEventListener("click", async () => {
    setHint("emailHint", "Pendiente: endpoint backend para cambiar email.");
  });

  document.getElementById("savePasswordBtn")?.addEventListener("click", async () => {
    setHint("passHint", "Pendiente: endpoint backend para cambiar contraseña.");
  });

  document.getElementById("saveSecurityBtn")?.addEventListener("click", async () => {
    setHint("secHint", "Pendiente: endpoint backend para guardar preguntas de seguridad.");
  });

  document.getElementById("saveProfileBtn")?.addEventListener("click", async () => {
    setHint("profileHint", "Pendiente: endpoint backend para guardar datos del cliente.");
  });
});

function openModal(id){
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("open");
  el.setAttribute("aria-hidden", "false");
}

function closeModal(id){
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  el.setAttribute("aria-hidden", "true");
}

function wireModals(){
  const openEmail = document.getElementById("openEmailModalBtn");
  const openPass  = document.getElementById("openPassModalBtn");

  if (openEmail) openEmail.addEventListener("click", () => openModal("emailModal"));
  if (openPass)  openPass.addEventListener("click", () => openModal("passModal"));

  // cerrar con botones
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.getAttribute("data-close")));
  });

  // cerrar clickeando fuera
  ["emailModal","passModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
      if (e.target === el) closeModal(id);
    });
  });

  // cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal("emailModal");
    closeModal("passModal");
  });
}

// ✅ validaciones + llamadas
async function updateEmail(){
  const e1 = document.getElementById("modalNewEmail").value.trim();
  const e2 = document.getElementById("modalNewEmail2").value.trim();
  const hint = document.getElementById("emailHint");

  if (hint) hint.textContent = "";

  if (!e1 || !e2) { if (hint) hint.textContent = "Completa ambos campos."; return; }
  if (e1.toLowerCase() !== e2.toLowerCase()) { if (hint) hint.textContent = "Los correos no coinciden."; return; }

  // 👉 Aquí llama tu endpoint real
  // Ejemplo:
  // await fetch(`${API_BASE}/api/user/email`, {method:"POST", headers:{Authorization:getToken(), "Content-Type":"application/json"}, body: JSON.stringify({email:e1})})

  if (hint) hint.textContent = "✅ Correo actualizado.";
  closeModal("emailModal");
}

async function updatePassword(){
  const p1 = document.getElementById("modalNewPass").value;
  const p2 = document.getElementById("modalNewPass2").value;
  const hint = document.getElementById("passHint");

  if (hint) hint.textContent = "";

  if (!p1 || !p2) { if (hint) hint.textContent = "Completa ambos campos."; return; }
  if (p1 !== p2) { if (hint) hint.textContent = "Las contraseñas no coinciden."; return; }
  if (p1.length < 4) { if (hint) hint.textContent = "La contraseña es muy corta."; return; }

  // 👉 Aquí llama tu endpoint real

  if (hint) hint.textContent = "✅ Contraseña actualizada.";
  closeModal("passModal");
}

document.addEventListener("DOMContentLoaded", () => {
  wireModals();

  const b1 = document.getElementById("updateEmailBtn");
  const b2 = document.getElementById("updatePassBtn");

  if (b1) b1.addEventListener("click", updateEmail);
  if (b2) b2.addEventListener("click", updatePassword);
});

const openSecQ = document.getElementById("openSecurityQModalBtn");
if (openSecQ) {
  openSecQ.addEventListener("click", () => openModal("securityQModal"));
}

async function saveSecurityAnswers(){
  const a1 = document.getElementById("secAns1").value.trim();
  const a2 = document.getElementById("secAns2").value.trim();
  const a3 = document.getElementById("secAns3").value.trim();
  const hint = document.getElementById("securityQHint");

  if (hint) hint.textContent = "";

  if (!a1 || !a2 || !a3) {
    if (hint) hint.textContent = "Debes responder todas las preguntas.";
    return;
  }

  const payload = {
    questions: [
      "nombre_mascota_favorita",
      "lugar_nacimiento_abuela_materna",
      "escuela_basica"
    ],
    answers: [a1, a2, a3]
  };

  // 👉 Aquí conectas tu endpoint real
  // await fetch(`${API_BASE}/api/user/security-questions`, {
  //   method: "POST",
  //   headers: {
  //     "Authorization": getToken(),
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify(payload)
  // });

  if (hint) hint.textContent = "✅ Preguntas guardadas correctamente.";
  closeModal("securityQModal");
}

const saveSecBtn = document.getElementById("saveSecurityAnswersBtn");
if (saveSecBtn) {
  saveSecBtn.addEventListener("click", saveSecurityAnswers);
}


document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");
  if(backBtn){
    backBtn.addEventListener("click", () => {
      window.location.href = "/xaimua_page/usuario/index.html";
    });
  }
});

const openClientData = document.getElementById("openClientDataModalBtn");
if (openClientData) {
  openClientData.addEventListener("click", () =>
    openModal("clientDataModal")
  );
}
