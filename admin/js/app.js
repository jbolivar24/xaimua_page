// admin/js/app.js
import { API_BASE, buildPath } from "../../js/config.js";
import { logout } from "../../js/auth.js";

/* ===============================
   IDLE TIMEOUT (2 minutos)
   =============================== */

const IDLE_LIMIT = 2 * 60 * 1000; // 2 minutos
let idleTimer = null;
let registroHoy = [];

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    console.warn("⏰ Inactividad → logout");
    logout();
  }, IDLE_LIMIT);
}

// Eventos que cuentan como actividad real del usuario
["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});

// Inicializar al cargar la página
resetIdleTimer();


const token =
  localStorage.getItem("adminToken") ||
  localStorage.getItem("xaToken");

if (!token) {
  window.location.href = buildPath("/html/login.html");
}

const BASE_URL = `${API_BASE}/api/data`;

const clientInfoBox = document.getElementById("clientInfo");
const logBox = document.getElementById("log");

let selectedClient = null;

function log(msg) {
  logBox.textContent += msg + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

function formatTimestamp(t) {
  if (!t || t === "0" || t === "") return "-";
  const n = Number(t);
  if (isNaN(n)) return t;
  return new Date(n).toLocaleString();
}

async function fetchAuth(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    Authorization: token
  };

  const res = await fetch(url, { ...options, headers });

  // si token venció o no es válido → botamos al login
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("xaToken");
    localStorage.removeItem("xaRole");
    window.location.href = buildPath("/html/login.html");
    throw new Error("Unauthorized");
  }

  return res;
}

async function loadClients() {
  try {
    const res = await fetchAuth(`${BASE_URL}/devices`);
    const arr = await res.json();

    if (!Array.isArray(arr)) {
      log("❌ Backend no devolvió un array de clientes.");
      console.warn("Respuesta:", arr);
      return;
    }

    const tbody = document.querySelector("#clientsTable tbody");
    tbody.innerHTML = "";

    arr.forEach(c => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${c.clientId ?? "-"}</td>
        <td>${c.deviceId ?? "-"}</td>
        <td style="color:${c.status === "online" ? "green" : "red"};">
          ${c.status ?? "-"}
        </td>
        <td>${formatTimestamp(c.lastSeen)}</td>
        <td>${formatTimestamp(c.timestamp)}</td>
        <td>${c.ipAddress ?? "-"}</td>
        <td>${c.salesToday ?? "-"}</td>
        <td>${c.lastPaymentDate ?? "-"}</td>
        <td>${formatTimestamp(c.firstShiftStart)}</td>
        <td>${c.linkedClients ?? "-"}</td>
        <td>${c.state ?? "-"}</td>
        <td>${c.shiftClosures ?? "-"}</td>
        <td>${c.androidVersion ?? "-"}</td>
      `;

      tr.addEventListener("click", () => selectClientRow(tr, c));
      tbody.appendChild(tr);
    });

    log("✅ Lista de clientes actualizada.");

  } catch (e) {
    if (e.message !== "Unauthorized") log("❌ Error cargando clientes: " + e);
  }
}

function selectClientRow(row, clientData) {
  document.querySelectorAll("#clientsTable tbody tr")
    .forEach(r => r.classList.remove("selected"));

  row.classList.add("selected");
  selectedClient = clientData;

  clientInfoBox.textContent = JSON.stringify(clientData, null, 2);
  document.getElementById("actionBar").classList.remove("hidden");
}

async function sendMessage(text) {
  try {
    if (!selectedClient) return alert("Selecciona un cliente primero.");

    const toId = selectedClient.deviceId;
    if (!toId || toId.trim() === "") {
      log("❌ No se puede enviar: deviceId inválido.");
      return;
    }

    const params = new URLSearchParams();
    params.append("text", text);
    params.append("to", toId);

    const res = await fetchAuth(`${BASE_URL}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const msg = await res.text().catch(() => "");
    log(`✅ Acción ejecutada (${text}) → ${msg}`);

  } catch (e) {
    if (e.message !== "Unauthorized") log("❌ Error enviando mensaje: " + e);
  }
}

function executeAction(cmd) {
  if (!selectedClient) return alert("Selecciona un cliente.");
  sendMessage(cmd);
}

function executeRestore() {
  if (!selectedClient) return alert("Selecciona un cliente.");
  document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;

  const form = new FormData();
  form.append("file", file);
  form.append("deviceId", selectedClient.deviceId);
  form.append("timestamp", Date.now());

  try {
    const res = await fetchAuth(`${BASE_URL}/restore`, {
      method: "POST",
      body: form
    });

    log(res.ok ? "📦 Respaldo enviado." : "⚠️ Error HTTP " + res.status);

  } catch (e) {
    if (e.message !== "Unauthorized") log("❌ Error enviando backup: " + e);
  }
});

function openNotifyConfig() {
  alert("Aquí irá el configurador de notificaciones ❤️");
}

// OJO: si tu endpoint /__dev/shutdown también está protegido,
// esto debería ser un fetch con Authorization, no window.location.

window.executeAction = executeAction;
window.executeRestore = executeRestore;
window.openNotifyConfig = openNotifyConfig;

async function loadRegistroHoy() {
  try {
    const res = await fetchAuth(`${API_BASE}/api/logs/registro/hoy`);
    const data = await res.json();

    if (!data || !Array.isArray(data.registros)) {
      log("❌ Respuesta inválida del backend");
      console.warn("Respuesta:", data);
      return;
    }

    registroHoy = data.registros;
    window.cobranzasHoy = data.cobranzas || [];

    buildRepartidorSelect(registroHoy);
    renderRegistro(registroHoy);
    updateTotales(registroHoy);

    log(`📋 Registro cargado (${registroHoy.length} filas)`);
    log(`💰 Cobranzas cargadas (${window.cobranzasHoy.length})`);

  } catch (e) {
    if (e.message !== "Unauthorized") {
      log("❌ Error cargando registro: " + e);
    }
  }
}

function buildRepartidorSelect(arr) {
  const select = document.getElementById("repartidorSelect");
  select.innerHTML = `<option value="ALL">Todos</option>`;

  const set = new Set();

  arr.forEach(r => {
    if (r.repartidor) {
      set.add(r.repartidor);
    }
  });

  [...set].sort().forEach(rep => {
    const opt = document.createElement("option");
    opt.value = rep;
    opt.textContent = rep;
    select.appendChild(opt);
  });
}

function renderRegistro(arr) {
  const tbody = document.querySelector("#registroTable tbody");
  tbody.innerHTML = "";

  arr.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.hora ?? "-"}</td>
      <td>${r.repartidor ?? "-"}</td>
      <td style="text-align:right">${r.cantidad ?? 0}</td>
      <td>${r.cliente ?? "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateTotales(arr) {
  let total = 0;

  arr.forEach(r => {
    const v = parseFloat(r.cantidad);
    if (!isNaN(v)) total += v;
  });

  document.getElementById("totalRepartidor").textContent = total.toFixed(2);

  // total general SIEMPRE es sobre todo el día
  let totalAll = 0;
  registroHoy.forEach(r => {
    const v = parseFloat(r.cantidad);
    if (!isNaN(v)) totalAll += v;
  });

  document.getElementById("totalGeneral").textContent = totalAll.toFixed(2);
}

document.getElementById("repartidorSelect").addEventListener("change", e => {
  const rep = e.target.value;

  if (rep === "ALL") {
    renderRegistro(registroHoy);
    updateTotales(registroHoy);
  } else {
    const filtrado = registroHoy.filter(r => r.repartidor === rep);
    renderRegistro(filtrado);
    updateTotales(filtrado);
  }
});

function exportCSV(data) {
  if (!data.length) {
    alert("No hay datos para exportar");
    return;
  }

  const headers = ["Hora", "Repartidor", "Cantidad", "Cliente"];

  const rows = data.map(r => [
    r.hora ?? "",
    r.repartidor ?? "",
    r.cantidad ?? "",
    r.cliente ?? ""
  ]);

  const csvContent =
    [headers, ...rows]
      .map(row =>
        row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `registro_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById("btnExportCSV").addEventListener("click", () => {
  const rep = document.getElementById("repartidorSelect").value;

  if (rep === "ALL") {
    exportCSV(registroHoy);
  } else {
    exportCSV(registroHoy.filter(r => r.repartidor === rep));
  }
});

function exportPDF(data) {
  if (!data.length) {
    alert("No hay datos para exportar");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const today = new Date().toLocaleDateString("es-CL");

  doc.setFontSize(14);
  doc.text("Registro de ventas", 14, 15);

  doc.setFontSize(10);
  doc.text(`Fecha: ${today}`, 14, 22);

  const rows = data.map(r => [
    r.hora ?? "",
    r.repartidor ?? "",
    r.cantidad ?? "",
    r.cliente ?? ""
  ]);

  doc.autoTable({
    startY: 28,
    head: [["Hora", "Repartidor", "Cantidad", "Cliente"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [60, 64, 61] }
  });

  const total = data.reduce((acc, r) => {
    const v = parseFloat(r.cantidad);
    return isNaN(v) ? acc : acc + v;
  }, 0);

  doc.text(
    `Total: ${total.toFixed(2)}`,
    14,
    doc.lastAutoTable.finalY + 10
  );

  doc.save(`registro_${today.replace(/\//g, "-")}.pdf`);
}

document.getElementById("btnExportPDF").addEventListener("click", () => {
  const rep = document.getElementById("repartidorSelect").value;

  if (rep === "ALL") {
    exportPDF(registroHoy);
  } else {
    exportPDF(registroHoy.filter(r => r.repartidor === rep));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadClients();
  loadRegistroHoy();
});



