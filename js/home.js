// home.js
import { API_BASE } from "./config.js";
import { initBanners } from "./banners.js";
import { loadWebContent } from "./webContent.js";

document.addEventListener("DOMContentLoaded", async () => {
    initBanners();

    // ✅ esperamos a que el backend llene los textos
    await loadWebContent();

    const directBtn = document.getElementById("directDownloadBtn");
    if (directBtn) directBtn.href = `${API_BASE}/apk/xaimua`;

    // ✅ si entraste con hash (o recargaste con hash), ahora sí funciona
    highlightWhenArrives();
});

// ============================
// Highlight al llegar a sección
// ============================
let observer = null;

function pulseTitle(sectionId) {
    // primero intentamos por id exacto (tu caso)
    const byId = document.getElementById(`titulo-${sectionId}`);
    const title = byId || document.querySelector(`#${sectionId} h2`);
    if (!title) return;

    title.classList.remove("section-highlight");
    void title.offsetWidth;
    title.classList.add("section-highlight");
}

function highlightWhenArrives() {
    const id = (window.location.hash || "").replace("#", "").trim();
    if (!id) return;

    const section = document.getElementById(id);
    if (!section) return;

    if (observer) observer.disconnect();

    observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                pulseTitle(id);
                observer.disconnect();
                observer = null;
                break;
            }
        }
    }, { threshold: 0.6 });

    observer.observe(section);
}

// cuando haces click en el menú (cambia el hash)
window.addEventListener("hashchange", () => {
    // esperamos 1 frame para que el scroll avance
    requestAnimationFrame(() => highlightWhenArrives());
});
