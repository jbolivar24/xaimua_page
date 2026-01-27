import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

let currentRows = [];

// =========================
// UI helpers (toggle Consultar / Exportar)
// =========================

function setExportMode(enabled) {
  const consultBtn = document.getElementById("loadDataBtn");
  const csvBtn = document.getElementById("exportCsvBtn");
  const pdfBtn = document.getElementById("exportPdfBtn");

  // enabled = true  -> ocultar Consultar y mostrar Exportar
  // enabled = false -> mostrar Consultar y ocultar Exportar
  if (consultBtn) consultBtn.classList.toggle("is-hidden", enabled);
  if (csvBtn) csvBtn.classList.toggle("is-hidden", !enabled);
  if (pdfBtn) pdfBtn.classList.toggle("is-hidden", !enabled);
}

function resetQueryUI() {
  // Vuelve al estado "antes de consultar"
  setExportMode(false);

  // Evita exportar datos viejos si cambias la fecha
  currentRows = [];
  renderTable([]);

  const total = document.getElementById("totalAmount");
  if (total) total.textContent = "$0";
}

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

// ================= LOGOUT =================
async function logout() {
  try {
    const token = getToken();

    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": token } // ✅ sin Bearer
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
  ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach(ev => {
    document.addEventListener(ev, resetInactivityTimer, true);
  });
  resetInactivityTimer();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutHeaderBtn")?.addEventListener("click", logout);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  setupInactivityWatcher();

  // ✅ opcional: deja el selector en "hoy" por defecto
  const fromEl = document.getElementById("fromDate");
  if (fromEl && !fromEl.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    fromEl.value = `${yyyy}-${mm}-${dd}`;
  }

  // Estado inicial: ocultar Exportar y mostrar Consultar
  resetQueryUI();

  // Si el usuario cambia la fecha, invalidamos exportaciones previas
  if (fromEl) {
    fromEl.addEventListener("change", resetQueryUI);
    fromEl.addEventListener("input", resetQueryUI);
  }
});

// ================= RESTAURAR RESPALDO =================
document.getElementById("restoreBackupBtn")
  ?.addEventListener("click", async () => {

    const ok = confirm(
      "¿Estás seguro de restaurar el respaldo?\n\n" +
      "La aplicación sincronizará la información cuando vuelva a conectarse."
    );
    if (!ok) return;

    const token = getToken();
    if (!token) {
      alert("Sesión inválida. Vuelve a iniciar sesión.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/restore/request`, {
        method: "POST",
        headers: {
          "Authorization": token
        }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      alert("Solicitud de restauración enviada correctamente.");

    } catch (e) {
      console.error(e);
      alert("No se pudo solicitar la restauración.");
    }
  });

// ================= PAGO SUSCRIPCIÓN =================
document.getElementById("paySubscriptionBtn")
  ?.addEventListener("click", () => {
    alert("Redirigiendo a plataforma de pago...");
  });

// ================= CONSULTA DE DATOS (1 DÍA) =================
document.getElementById("loadDataBtn")
  ?.addEventListener("click", async () => {

    const day = document.getElementById("fromDate")?.value;

    if (!day) {
      alert("Selecciona un día.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("No hay sesión activa (token). Vuelve a iniciar sesión.");
      return;
    }

    try {
      // ✅ 1) intentamos endpoint por día
      let url =
        `${API_BASE}/api/history/day` +
        `?day=${encodeURIComponent(day)}`;

      let response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });

      // ✅ 2) fallback: rango from=to
      if (response.status === 404) {

        const fallbackUrl =
          `${API_BASE}/api/history` +
          `?from=${encodeURIComponent(day)}` +
          `&to=${encodeURIComponent(day)}`;

        console.warn("⚠️ FALLBACK ACTIVADO (RANGE):", fallbackUrl);

        response = await fetch(fallbackUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          }
        });
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const rows = await response.json();

      currentRows = rows;

      if (!rows || rows.length === 0) {
        renderTable([]);
        updateTotal([]);

        // No hay datos: mantener Consultar visible y Exportar oculto
        setExportMode(false);

        alert("No hay ventas registradas para el día seleccionado.");
        return;
      }

      renderTable(rows);
      updateTotal(rows);

      // Datos OK: ocultar Consultar y mostrar Exportar
      setExportMode(true);

    } catch (err) {
      console.error(err);
      // Error al consultar: dejar la UI en modo "Consultar"
      setExportMode(false);
      alert(`No se pudieron cargar los datos. (${err.message})`);
    }
  });

function renderTable(rows) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  rows.forEach(r => {
    const tr = document.createElement("tr");

    const payment = r.payment ?? r.method ?? "";

    tr.innerHTML = `
      <td>${r.date ?? ""}</td>
      <td>${r.time ?? ""}</td>
      <td>${r.type ?? ""}</td>
      <td>${r.document ?? ""}</td>
      <td>${r.folio ?? ""}</td>
      <td>${r.total ?? ""}</td>
      <td>${payment}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ================= EXPORTAR CSV =================
document.getElementById("exportCsvBtn")
  ?.addEventListener("click", () => {

    if (!currentRows || currentRows.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = [
      "Fecha",
      "Hora",
      "Tipo",
      "Documento",
      "Folio",
      "Total",
      "Medio de pago"
    ];

    const escape = v =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;

    const lines = [
      headers.join(";"),
      ...currentRows.map(r => [
        escape(r.date),
        escape(r.time),
        escape(r.type),
        escape(r.document),
        escape(r.folio),
        escape(r.total),
        escape(r.payment ?? r.method)
      ].join(";"))
    ];

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial.csv";
    a.click();

    URL.revokeObjectURL(url);
  });
// ================= EXPORTAR PDF =================
document.getElementById("exportPdfBtn")
  ?.addEventListener("click", () => {

    if (!currentRows || currentRows.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("l", "pt", "a4"); // horizontal

    doc.setFontSize(14);
    doc.text("Historial de ventas", 40, 40);

    const headers = [
      ["Fecha", "Hora", "Tipo", "Documento", "Folio", "Total", "Medio de pago"]
    ];

    const body = currentRows.map(r => ([
      r.date ?? "",
      r.time ?? "",
      r.type ?? "",
      r.document ?? "",
      r.folio ?? "",
      r.total ?? "",
      r.payment ?? r.method ?? ""
    ]));

    doc.autoTable({
      head: headers,
      body: body,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 220, 220] }
    });

    doc.save("historial.pdf"); // ⬅️ descarga directa
  });

function updateTotal(rows) {
  const totalEl = document.getElementById("totalAmount");
  if (!totalEl) return;

  const total = rows.reduce((acc, r) => {
    const val = String(r.total ?? "0")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    return acc + (parseFloat(val) || 0);
  }, 0);

  totalEl.textContent = `$${total.toLocaleString("es-CL")}`;
}

function fmt(ts) {
  if (!ts || ts <= 0) return "—";
  return new Date(ts).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

async function loadLastBackupInfo() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/backup/last`, {
      headers: { "Authorization": token }
    });

    if (!res.ok) return;

    const data = await res.json();

    // Email en header
    const emailEl = document.getElementById("userEmail");
    if (emailEl && data.email) {
      emailEl.textContent = data.email;
    }

    // ✅ SOLO lo que existe en tu HTML actual:
    // Último respaldo (ya no usas #lastBackupInfo span)
    const lastFullEl = document.getElementById("lastFullBackup");
    if (lastFullEl) {
      // intenta con varios nombres por si cambia el backend
      const value = data.lastFullBackupAt || data.serverTime || data.lastUpdate;
      lastFullEl.textContent = value ? fmt(value) : "—";
    }

  } catch (e) {
    console.warn("No se pudo cargar info de backup", e);
  }
}

document.addEventListener("DOMContentLoaded", loadLastBackupInfo);

function formatRut(rut) {
  if (!rut) return "";

  // limpiar todo lo que no sea número o K/k
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // puntos cada 3 desde la derecha
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${dv}`;
}
