import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

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
    const from = document.getElementById("fromDate")?.value;
    const to = document.getElementById("toDate")?.value;

    if (!from || !to) {
      alert("Selecciona un rango de fechas.");
      return;
    }

    const token = getAnyToken();
    if (!token) {
      alert("Sesión no encontrada. Inicia sesión de nuevo.");
      logout();
      return;
    }

    const userId = getUserIdFallback();

    const url =
      `${API_BASE}/api/history` +
      `?userId=${encodeURIComponent(userId)}` +
      `&from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}`;

    try {
      loadDataBtn.disabled = true;
      loadDataBtn.textContent = "Cargando...";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": token
        }
      });

      if (response.status === 401 || response.status === 403) {
        // tu filtro devuelve 401/403 cuando token falta o muere
        alert("Tu sesión expiró o el token no es válido. Inicia sesión otra vez.");
        logout();
        return;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error("Error HTTP:", response.status, text);
        throw new Error(`Error ${response.status}`);
      }

      const rows = await response.json();
      renderTable(rows);

    } catch (err) {
      console.error(err);
      alert("No se pudieron cargar los datos.");
    } finally {
      loadDataBtn.disabled = false;
      loadDataBtn.textContent = "Consultar";
    }
  });
});
