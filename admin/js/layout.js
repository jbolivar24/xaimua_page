document.addEventListener("DOMContentLoaded", () => {

    const header = document.getElementById("header");
    const footer = document.getElementById("footer");

    if (header) {
        fetch("/xaimua_page/header.html")
            .then(r => r.text())   // ← ESTA LÍNEA FALTABA
            .then(html => {
                header.innerHTML = html;

                // Inyectar BASE_URL si existe
                if (window.BASE_URL) {
                    const lbl = document.getElementById("server-label");
                    if (lbl) lbl.textContent = window.BASE_URL;
                }
            })
            .catch(err => console.error("❌ Error cargando header:", err));
    }

    if (footer) {
        fetch("html/footer.html")
            .then(r => r.text())
            .then(html => {
                footer.innerHTML = html;
            })
            .catch(err => console.error("❌ Error cargando footer:", err));
    }

});
