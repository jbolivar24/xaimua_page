import { API_BASE } from "/xaimua_page/js/config.js";
import { logout, setupInactivityWatcher, getAnyToken, getUserIdFallback } from "/xaimua_page/js/auth.js";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {

  // Logout header
  const logoutHeaderBtn = document.getElementById("logoutHeaderBtn");
  if (logoutHeaderBtn) {
    logoutHeaderBtn.addEventListener("click", logout);
  }

  // Inactividad
  setupInactivityWatcher();

  // ================= RESTAURAR RESPALDO =================
  const restoreBackupBtn = document.getElementById("restoreBackupBtn");
  restoreBackupBtn?.addEventListener("click", async () => {
    const ok = confirm(
      "¿Estás seguro de restaurar el respaldo?\n\n" +
      "La aplicación sincronizará los datos cuando vuelva a conectarse."
    );
    if (!ok) return;

    try {
      const token = getAnyToken();
      if (!token) {
        alert("Sesión no encontrada. Inicia sesión nuevamente.");
        logout();
        return;
      }

      // Endpoint futuro
      alert("Solicitud de restauración enviada (pendiente endpoint real).");

    } catch (e) {
      console.error(e);
      alert("No se pudo enviar la solicitud de restauración.");
    }
  });

  // ================= PAGO SUSCRIPCIÓN =================
  const paySubscriptionBtn = document.getElementById("paySubscriptionBtn");
  paySubscriptionBtn?.addEventListener("click", () => {
    alert("Redirigiendo a plataforma de pago (pendiente integración).");
  });

  // ================= CONSULTA DE DATOS =================
  const loadDataBtn = document.getElementById("loadDataBtn");
  loadDataBtn?.addEventListener("click", loadHistory);

});

// ======================================================
// ================= FUNCIONES ===========================
// ======================================================

async function loadHistory() {

  const from = document.getElementById("fromDate")?.value;
  const to = document.getElementById("toDate")?.value;

  if (!from || !to) {
    alert("Selecciona un rango de fechas.");
    return;
  }

  const token = getAnyToken();
  if (!token) {
    alert("Sesión no encontrada. Inicia sesión nuevamente.");
    logout();
    return;
  }

  const userId = getUserIdFallback();

  const url =
    `${API_BASE}/api/history` +
    `?userId=${encodeURIComponent(userId)}` +
    `&from=${encodeURIComponent(from)}` +
    `&to=${encodeURIComponent(to)}`;

  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = `<tr><td colspan="7" class="empty">Cargando...</td></tr>`;

  try {
    setLoading(true);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": token
      }
    });

    if (response.status === 401 || response.status === 403) {
      alert("Tu sesión expiró o el token no es válido.");
      logout();
      return;
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Error HTTP:", response.status, text);
      throw new Error(`HTTP ${response.status}`);
    }

    const rows = await response.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      tbody.innerHTML =
        `<tr><td colspan="7" class="empty">Sin resultados en el rango seleccionado.</td></tr>`;
      return;
    }

    renderTable(rows);

  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      `<tr><td colspan="7" class="empty">No se pudieron cargar los datos.</td></tr>`;
  } finally {
    setLoading(false);
  }
}

// ================= RENDER TABLA =================

function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  for (const row of rows) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.date ?? "-"}</td>
      <td>${row.time ?? "-"}</td>
      <td>${row.type ?? "-"}</td>
      <td>${row.document ?? "-"}</td>
      <td>${row.folio ?? "-"}</td>
      <td>${formatCurrency(row.total)}</td>
      <td>${row.method ?? "-"}</td>
    `;

    tbody.appendChild(tr);
  }
}

// ================= HELPERS =================

function setLoading(isLoading) {
  const btn = document.getElementById("loadDataBtn");
  if (!btn) return;

  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Cargando..." : "Consultar";
}

function formatCurrency(value) {
  if (value == null || isNaN(value)) return "-";
  return Number(value).toLocaleString("es-CL");
}
