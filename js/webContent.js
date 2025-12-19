// webContent.js

// ================= BACKEND =================
// Si estás en GitHub Pages → usa backend remoto
// Si estás en local → puedes cambiar esto sin romper nada
const API_BASE = window.location.hostname.includes("github.io")
    ? "https://undeservedly-hammerheaded-lindsay.ngrok-free.dev"
    : "http://localhost:8080";

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

        if (data["que-es"]) {
            document.getElementById("titulo-que-es").textContent = data["que-es"].title;
            document.getElementById("texto-que-es").textContent = data["que-es"].text;
        }

        if (data.caracteristicas) {
            document.getElementById("titulo-caracteristicas").textContent = data.caracteristicas.title;

            const ul = document.getElementById("lista-caracteristicas");
            ul.innerHTML = "";

            data.caracteristicas.items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                ul.appendChild(li);
            });
        }

        if (data.captures) {
            document.getElementById("titulo-capturas").textContent = data.captures.title;
            document.getElementById("texto-capturas").textContent = data.captures.text;
            initCaptures(data.captures);
        }

        if (data.descargas) {
            document.getElementById("titulo-descargas").textContent = data.descargas.title;
            document.getElementById("texto-descargas-top").textContent = data.descargas.textTop;

            const ul = document.getElementById("lista-descargas");
            ul.innerHTML = "";

            data.descargas.items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                ul.appendChild(li);
            });

            document.getElementById("texto-descargas-bottom").textContent = data.descargas.textBottom;
        }

    })
    .catch(err => {
        console.error("Error cargando web content:", err);
    });
}
