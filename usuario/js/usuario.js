import { API_BASE, buildPath } from "/xaimua_page/js/config.js";

// ================= TOKEN HELPERS =================
function getAuthHeader() {
  // intenta con userToken primero; si no existe, usa adminToken
  const token =
    localStorage.getItem("userToken") ||
    localStorage.getItem("adminToken") ||
    "";

  if (!token) return null;

  // si ya viene con "Bearer ", lo respetamos
  if (token.startsWith("Bearer ")) return token;

  return `Bearer ${token}`;
}

// ================= LOGOUT =================
async function logout() {
  try {
    const auth = getAuthHeader();

    if (auth) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": auth }
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
      "La aplicación sincronizará los datos cuando se conecte."
    );

    if (!ok) return;

    // Si todavía no tienes el endpoint listo, evita el 403/401:
    alert("Función de restauración en desarrollo.");
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

    // TODO: luego vendrá del token. Por ahora lo dejamos fijo como lo tenías.
    const userId = "779787907";

    const auth = getAuthHeader();
    if (!auth) {
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
          "Authorization": auth
        }
      });

      if (!response.ok) {
        // te dejo el status para que no sea un "no se pudo" genérico
        throw new Error(`Error ${response.status}`);
      }

      const rows = await response.json();
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
    tr.innerHTML = `
      <td>${r.date ?? ""}</td>
      <td>${r.time ?? ""}</td>
      <td>${r.type ?? ""}</td>
      <td>${r.document ?? ""}</td>
      <td>${r.folio ?? ""}</td>
      <td>${r.total ?? ""}</td>
      <td>${r.payment ?? r.method ?? ""}</td>
    `;
    tbody.appendChild(tr);
  });
}
