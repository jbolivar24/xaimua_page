import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

// ================= TOKEN =================
// En usuario NO puedes depender solo de adminToken.
// Intentamos varias llaves para que no te deje botado.
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

// ================= CONSULTA DE DATOS =================
document.getElementById("loadDataBtn")
  ?.addEventListener("click", async () => {

    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;

    if (!from || !to) {
      alert("Selecciona un rango de fechas.");
      return;
    }

    const userId = "779787907"; // luego lo sacas del token / sesión

    const token = getToken();
    if (!token) {
      alert("No hay sesión activa (token). Vuelve a iniciar sesión.");
      return;
    }

    try {
      const url =
        `${API_BASE}/api/history` +
        `?userId=${encodeURIComponent(userId)}` +
        `&from=${encodeURIComponent(from)}` +
        `&to=${encodeURIComponent(to)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token // ✅ sin Bearer
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const rows = await response.json();

      console.log("Filas:", rows.length, "Bytes aprox:", new Blob([JSON.stringify(rows)]).size);

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

    // ✅ por si algún día vuelve a venir "method" en vez de "payment"
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

function isoToDDMMYYYY(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

async function loadMonths(userId, token) {
  const res = await fetch(`${API_BASE}/api/history/meta?userId=${encodeURIComponent(userId)}`, {
    headers: { "Authorization": token }
  });
  if (!res.ok) throw new Error(`meta ${res.status}`);
  return await res.json(); // { months: [{value,label}], ... }
}

async function loadDays(userId, monthIso, token) {
  const res = await fetch(
    `${API_BASE}/api/history/days?userId=${encodeURIComponent(userId)}&month=${encodeURIComponent(monthIso)}`,
    { headers: { "Authorization": token } }
  );
  if (!res.ok) throw new Error(`days ${res.status}`);
  return await res.json(); // ["2025-12-01","2025-12-02",...]
}

function fillSelect(selectEl, items, getValue, getLabel) {
  selectEl.innerHTML = "";
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = getValue(item);
    opt.textContent = getLabel(item);
    selectEl.appendChild(opt);
  });
}

async function initDaySelector() {
  const userId = "779787907"; // luego lo sacas de sesión
  const token = getToken();
  if (!token) return;

  const monthSelect = document.getElementById("monthSelect");
  const daySelect = document.getElementById("daySelect");

  const meta = await loadMonths(userId, token);

  // months viene como [{ value:"2025-12", label:"DICIEMBRE 2025" }, ...]
  fillSelect(
    monthSelect,
    meta.months || [],
    m => m.value,
    m => m.label
  );

  // carga días del primer mes disponible
  if (monthSelect.value) {
    const daysIso = await loadDays(userId, monthSelect.value, token);
    fillSelect(daySelect, daysIso, d => d, d => isoToDDMMYYYY(d));
  }

  // al cambiar mes, recarga días
  monthSelect.addEventListener("change", async () => {
    const daysIso = await loadDays(userId, monthSelect.value, token);
    fillSelect(daySelect, daysIso, d => d, d => isoToDDMMYYYY(d));
  });

  // botón consultar: usa el ISO (value) del select
  document.getElementById("loadDataBtn")?.addEventListener("click", async () => {
    const dayIso = daySelect.value; // ✅ ISO listo para backend
    if (!dayIso) return alert("No hay días disponibles para este mes.");

    const url = `${API_BASE}/api/history/day?userId=${encodeURIComponent(userId)}&day=${encodeURIComponent(dayIso)}`;

    const response = await fetch(url, {
      headers: { "Authorization": token }
    });

    if (!response.ok) throw new Error(`day ${response.status}`);

    const rows = await response.json();
    renderTable(rows);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDaySelector().catch(err => {
    console.error(err);
    alert("No se pudo inicializar el selector de días.");
  });
});
