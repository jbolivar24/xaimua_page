// captures.js (DESDE BACKEND)

import { API_BASE } from "./config.js";

// ===== CONFIGURACIÓN DE CAPTURAS =====
// Si mañana agregas más imágenes, solo suma aquí
const capturesImages = [
    "c1.png"
];

// ===== INIT =====
export function initCaptures() {
    const track = document.getElementById("capturesTrack");
    if (!track) return;

    track.innerHTML = "";

    // Esperamos un frame para asegurar DOM listo
    requestAnimationFrame(() => {
        capturesImages.forEach(file => {
            const img = document.createElement("img");
            img.src = `${API_BASE}/img/captures/${file}`;
            img.alt = "Captura Xaimua";
            img.loading = "lazy";
            img.decoding = "async";

            track.appendChild(img);
        });
    });
}
