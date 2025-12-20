
if (!localStorage.getItem("adminToken")) {
    window.location.href = "../login.html";
}

import { API_BASE } from "../../js/config.js";

const BASE_URL = `${API_BASE}/api/data`;

const clientInfoBox = document.getElementById("clientInfo");
const logBox = document.getElementById("log");

let selectedClient = null;

// LOG
function log(msg) {
    logBox.textContent += msg + "\n";
    logBox.scrollTop = logBox.scrollHeight;
}

// FORMATEO DE TIMESTAMPS
function formatTimestamp(t) {
    if (!t || t === "0" || t === "") return "-";
    const n = Number(t);
    if (isNaN(n)) return t;
    return new Date(n).toLocaleString();
}

// =======================
// CARGAR TABLA COMPLETA
// =======================
async function loadClients() {
    try {
        const res = await fetch(`${BASE_URL}/devices`, {
            mode: "cors",
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        const arr = await res.json();

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
                <td>${c.ip ?? "-"}</td>
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
        log("❌ Error cargando clientes: " + e);
    }
}

loadClients();

// =======================
// SELECCIONAR FILA
// =======================
function selectClientRow(row, clientData) {
    document.querySelectorAll("#clientsTable tbody tr")
        .forEach(r => r.classList.remove("selected"));

    row.classList.add("selected");
    selectedClient = clientData;

    // Mostrar JSON completo
    clientInfoBox.textContent = JSON.stringify(clientData, null, 2);

    // Mostrar barra de acciones
    document.getElementById("actionBar").classList.remove("hidden");
}

// =======================
// ENVIAR MENSAJE / ACCIÓN (VERSIÓN PERFECTA)
// =======================
async function sendMessage(text) {
    try {
        if (!selectedClient) {
            alert("Selecciona un cliente primero.");
            return;
        }

        const toId = selectedClient.deviceId;

        if (!toId || toId.trim() === "") {
            log("❌ No se puede enviar: el cliente no tiene deviceId válido.");
            return;
        }

        const params = new URLSearchParams();
        params.append("text", text);
        params.append("to", toId);

        const res = await fetch(`${BASE_URL}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        });

        if (!res.ok) {
            log(`⚠️ Error HTTP ${res.status}`);
            return;
        }

        let msg = "";
        try {
            msg = await res.text(); // por si el backend devuelve string plano
        } catch (_) {}

        log(`✅ Acción ejecutada (${text}) → ${msg}`);

    } catch (e) {
        log("❌ Error enviando mensaje: " + e);
    }
}

function executeAction(cmd) {
    if (!selectedClient) {
        alert("Selecciona un cliente.");
        return;
    }
    sendMessage(cmd);
}

// =======================
// RESTAURAR BACKUP
// =======================
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
        const res = await fetch(`${BASE_URL}/restore`, {
            method: "POST",
            body: form
        });

        log(res.ok ? "📦 Respaldo enviado." : "⚠️ Error HTTP " + res.status);
    } catch (e) {
        log("❌ Error enviando backup: " + e);
    }
});

// =======================
// NOTIFY CONFIG (pendiente de UI final)
// =======================
function openNotifyConfig() {
    alert("Aquí irá el configurador de notificaciones (si quieres, te lo hago igualito al de escritorio ❤️)");
}

function shutdownBackend() {

    if (!confirm("¿Seguro que deseas detener el backend?\n\nSe cerrará inmediatamente.")) {
        return;
    }

    window.location.href =
        "https://undeservedly-hammerheaded-lindsay.ngrok-free.dev/__dev/shutdown";
}

// =======================
// EXPONER FUNCIONES AL HTML
// =======================
window.executeAction = executeAction;
window.executeRestore = executeRestore;
window.openNotifyConfig = openNotifyConfig;
window.shutdownBackend = shutdownBackend;
