// webContent.js

// ================= BACKEND =================
import { API_BASE } from "./config.js";

// ================= IMPORTS =================
import { initCaptures } from "./captures.js";

// ================= LOAD CONTENT =============
export function loadWebContent() {

    fetch(`${API_BASE}/api/web/sections`, {
        headers: { "ngrok-skip-browser-warning": "true" }
    })
    .then(res => {
        if (!res.ok) throw new Error("Error cargando contenido web");
        return res.json();
    })
    .then(data => {

        // ===== ¿QUÉ ES? =====
        if (data["que-es"]) {
            const t = document.getElementById("titulo-que-es");
            const p = document.getElementById("texto-que-es");

            if (t) t.textContent = data["que-es"].title;
            if (p) p.textContent = data["que-es"].text;
        }

        // ===== CARACTERÍSTICAS =====
        if (data.caracteristicas) {
            const t = document.getElementById("titulo-caracteristicas");
            const ul = document.getElementById("lista-caracteristicas");

            if (t) t.textContent = data.caracteristicas.title;

            if (ul) {
                ul.innerHTML = "";
                data.caracteristicas.items.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = item;
                    ul.appendChild(li);
                });
            }
        }

        // ===== CAPTURAS =====
        if (data.captures) {
            const t = document.getElementById("titulo-capturas");
            const p = document.getElementById("texto-capturas");

            if (t) t.textContent = data.captures.title;
            if (p) p.textContent = data.captures.text;

            // ✅ PASAR LAS IMÁGENES DESDE BACKEND
            if (Array.isArray(data.captures.images) && data.captures.images.length > 0) {
                initCaptures(data.captures.images);
            }
        }

        // ===== DESCARGAS =====
        if (data.descargas) {
            const t = document.getElementById("titulo-descargas");
            const top = document.getElementById("texto-descargas-top");
            const bottom = document.getElementById("texto-descargas-bottom");
            const ul = document.getElementById("lista-descargas");

            if (t) t.textContent = data.descargas.title;
            if (top) top.textContent = data.descargas.textTop;
            if (bottom) bottom.textContent = data.descargas.textBottom;

            if (ul) {
                ul.innerHTML = "";
                data.descargas.items.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = item;
                    ul.appendChild(li);
                });
            }
        }

    })
    .catch(err => {
        console.error("Error cargando web content:", err);
    });
}
