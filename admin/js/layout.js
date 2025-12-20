document.addEventListener("DOMContentLoaded", () => {

    const header = document.getElementById("header");
    const footer = document.getElementById("footer");

    if (header) {
        fetch("html/header.html")
            .then(r => r.text())
            .then(html => {
                header.innerHTML = html;

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
