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
  ?.addEventListener("click", async () => {

    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
      alert("Selecciona un rango de fechas.");
      return;
    }

    const userId = "779787907"; // luego vendrá del token

    try {
      const url =
        `${API_BASE}/api/history` +
        `?userId=${encodeURIComponent(userId)}` +
        `&from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}`;

      const token = localStorage.getItem("adminToken");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const rows = await response.json();
      renderTable(rows);

    } catch (err) {
      console.error(err);
      alert("No se pudieron cargar los datos.");
    }
  });


  function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  rows.forEach(r => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.type}</td>
      <td>${r.document}</td>
      <td>${r.folio}</td>
      <td>${r.total}</td>
      <td>${r.payment}</td>
    `;

    tbody.appendChild(tr);
  });
}
