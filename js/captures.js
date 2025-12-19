// captures.js (LOCAL, SIN BACKEND)

const REPO_BASE = window.location.hostname.includes("github.io")
    ? "/xaimua_page"
    : "";

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
            img.src = `${REPO_BASE}/img/captures/${file}`;
            img.alt = "Captura Xaimua";
            img.loading = "lazy";
            img.decoding = "async";

            track.appendChild(img);
        });
    });
}
