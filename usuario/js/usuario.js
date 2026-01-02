import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

let currentRows = [];

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
});

// ================= RESTAURAR RESPALDO =================
document.getElementById("restoreBackupBtn")
  ?.addEventListener("click", async () => {

    const ok = confirm(
      "¿Estás seguro de restaurar el respaldo?\n\n" +
      "La aplicación sincronizará la información cuando vuelva a conectarse."
    );

    if (!ok) return;

    alert("Solicitud de restauración enviada al servidor.");
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

    const userId = "779787907"; // luego lo sacas del token / sesión

    const token = getToken();
    if (!token) {
      alert("No hay sesión activa (token). Vuelve a iniciar sesión.");
      return;
    }

    try {
      // ✅ 1) intentamos endpoint por día
      let url =
        `${API_BASE}/api/history/day` +
        `?userId=${encodeURIComponent(userId)}` +
        `&day=${encodeURIComponent(day)}`;

      let response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });

      // ✅ 2) fallback: si /day no existe, usamos rango con from=to
      if (response.status === 404) {

        const fallbackUrl = `${API_BASE}/api/history?userId=${encodeURIComponent(userId)}&from=${encodeURIComponent(day)}&to=${encodeURIComponent(day)}`;
        console.warn("⚠️ FALLBACK ACTIVADO (RANGE):", fallbackUrl);

        url =
          `${API_BASE}/api/history` +
          `?userId=${encodeURIComponent(userId)}` +
          `&from=${encodeURIComponent(day)}` +
          `&to=${encodeURIComponent(day)}`;

        response = await fetch(url, {
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

      console.log(
        "Filas:", rows.length,
        "Bytes aprox:", new Blob([JSON.stringify(rows)]).size
      );

      renderTable(rows);

    } catch (err) {
      console.error(err);
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

    const tableHtml = document.getElementById("dataTable").outerHTML;

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Historial</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #000; padding: 6px; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h3>Historial de ventas</h3>
          ${tableHtml}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  });
