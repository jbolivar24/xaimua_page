import { API_BASE, buildPath } from "../../js/config.js";

/**
 * En tu proyecto estás guardando tokens con nombres distintos según pantalla.
 * Aquí lo hacemos tolerante:
 */
function getAnyToken() {
  return (
    localStorage.getItem("userToken") ||
    localStorage.getItem("xaToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
}

function getUserIdFallback() {
  // Si luego lo metes en el token, aquí lo reemplazas.
  // Por ahora dejamos fallback para que no te bloquee.
  return localStorage.getItem("xaUserId") || "779787907";
}

// ================= LOGOUT =================
async function logout() {
  try {
    const token = getAnyToken();

    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": token }
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
  if (inactivityTimer) clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    console.warn("Sesión cerrada por inactividad");
    logout();
  }, SESSION_TIMEOUT);
}

function setupInactivityWatcher() {
  const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
  events.forEach(evt => document.addEventListener(evt, resetInactivityTimer, true));
  resetInactivityTimer();
}

// ================= TABLA =================
function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" style="opacity:.75;">Sin resultados en el rango seleccionado.</td>`;
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date ?? ""}</td>
      <td>${r.time ?? ""}</td>
      <td>${r.type ?? ""}</td>
      <td>${r.document ?? ""}</td>
      <td>${r.folio ?? ""}</td>
      <td>${r.total ?? ""}</td>
      <td>${r.payment ?? ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  // Logout header
  const logoutHeaderBtn = document.getElementById("logoutHeaderBtn");
  if (logoutHeaderBtn) logoutHeaderBtn.addEventListener("click", logout);

  // Inactividad
  setupInactivityWatcher();

  // Restaurar respaldo
  const restoreBackupBtn = document.getElementById("restoreBackupBtn");
  restoreBackupBtn?.addEventListener("click", async () => {
    const ok = confirm(
      "¿Estás seguro de restaurar el respaldo?\n\n" +
      "La aplicación sincronizará los datos cuando se conecte."
    );
    if (!ok) return;

    try {
      const token = getAnyToken();
      if (!token) {
        alert("Sesión no encontrada. Inicia sesión de nuevo.");
        logout();
        return;
      }

      // TODO: tu endpoint real (ej: POST /api/restore-request?userId=...)
      // Por ahora lo dejamos como placeholder para que no rompa.
      alert("Solicitud de restauración enviada al servidor (pendiente endpoint real).");

    } catch (e) {
      console.error(e);
      alert("No se pudo enviar la solicitud de restauración.");
    }
  });

  // Pago suscripción
  const paySubscriptionBtn = document.getElementById("paySubscriptionBtn");
  paySubscriptionBtn?.addEventListener("click", () => {
    // TODO: redirigir a Transbank/MercadoPago
    alert("Redirigiendo a plataforma de pago (pendiente integración)...");
  });

  // Consulta de datos
  const loadDataBtn = document.getElementById("loadDataBtn");
    loadDataBtn?.addEventListener("click", async () => {
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
      alert("Selecciona un rango de fechas");
      return;
    }

    const token = getAnyToken();
    const userId = getUserIdFallback();

    try {
      loadDataBtn.disabled = true;
      loadDataBtn.textContent = "Cargando...";

      const res = await fetch(
        `${API_BASE}/api/history?userId=${userId}&from=${from}&to=${to}`,
        {
          headers: { Authorization: token }
        }
      );

      if (!res.ok) throw new Error(res.status);

      const rows = await res.json();

      if (!rows.length) {
        alert("Sin resultados en el rango seleccionado.");
        renderTable([]);
        return;
      }

      renderTable(rows);

    } catch (e) {
      console.error(e);
      alert("No se pudieron cargar los datos.");
    } finally {
      loadDataBtn.disabled = false;
      loadDataBtn.textContent = "Consultar";
    }
  });
});
