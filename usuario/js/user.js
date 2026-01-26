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
