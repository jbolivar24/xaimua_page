import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

// ================= LOGOUT =================
async function logout() {
  try {
    const token = localStorage.getItem("adminToken");

    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });
    }
  } catch (e) {
    console.warn("Error cerrando sesión", e);
  } finally {
    localStorage.clear();
    window.location.href = buildPath("/html/login.html");
  }
}

// ================= INACTIVIDAD =================
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos
let inactivityTimer = null;

function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    console.warn("Sesión cerrada por inactividad");
    logout();
  }, SESSION_TIMEOUT);
}

function setupInactivityWatcher() {
  const events = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart"
  ];

  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });

  resetInactivityTimer();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // botón logout del header
  const logoutHeaderBtn = document.getElementById("logoutHeaderBtn");
  if (logoutHeaderBtn) {
    logoutHeaderBtn.addEventListener("click", logout);
  }

  // botón logout interno (si lo dejas)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  setupInactivityWatcher();
});

// ================= RESTAURAR RESPALDO =================

document.getElementById("restoreBackupBtn")
  ?.addEventListener("click", async () => {

    const ok = confirm(
      "¿Estás seguro de restaurar el respaldo?\n\n" +
      "La aplicación sincronizará los datos cuando se conecte."
    );

    if (!ok) return;

    // TODO: llamar endpoint backend
    // POST /api/restore-request
    alert("Solicitud de restauración enviada al servidor.");
  });


// ================= PAGO SUSCRIPCIÓN =================

document.getElementById("paySubscriptionBtn")
  ?.addEventListener("click", () => {

    // TODO: redirigir a Transbank / MercadoPago
    alert("Redirigiendo a plataforma de pago...");
  });


// ================= CONSULTA DE DATOS =================

document.getElementById("loadDataBtn")
  ?.addEventListener("click", () => {

    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
      alert("Selecciona un rango de fechas.");
      return;
    }

    // TODO: llamar backend con rango
    // GET /api/data?from=...&to=...

    // Mock visual
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = `
      <tr>
        <td>${from}</td>
        <td>Boleta</td>
        <td>$12.500</td>
      </tr>
    `;
  });
