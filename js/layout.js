// ================= ANIMACIÓN DE TÍTULOS =================
function animarTituloSeccion(idTitulo) {
    const titulo = document.getElementById(idTitulo);
    if (!titulo) return;

    titulo.classList.add("palpite");
    setTimeout(() => titulo.classList.remove("palpite"), 600);
}

// ================= SCROLL SUAVE + PALPITE ===============
function configurarScrollYAnimaciones() {
    const mapaAnimaciones = {
        "#que-es": "titulo-que-es",
        "#caracteristicas": "titulo-caracteristicas",
        "#capturas": "titulo-capturas",
        "#descargas": "titulo-descargas"
    };

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href) return;

            if (
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
            ) {
                return;
            }

            const hashIndex = href.indexOf("#");
            if (hashIndex === -1) return;

            const hash = href.slice(hashIndex);
            if (!hash || hash === "#") return;

            const seccion = document.querySelector(hash);
            if (!seccion) return;

            e.preventDefault();
            seccion.scrollIntoView({ behavior: "smooth" });

            const idTitulo = mapaAnimaciones[hash];
            if (idTitulo) {
                setTimeout(() => animarTituloSeccion(idTitulo), 600);
            }

            const menu = document.querySelector(".menu");
            if (menu) menu.classList.remove("show");
        });
    });
}

// ================= ANIMACIÓN CONTACTO FOOTER ============
function iniciarAnimacionContacto() {
    const btnContacto = document.getElementById("btn-contacto");
    const tituloContacto = document.getElementById("titulo-contacto");

    if (!btnContacto || !tituloContacto) return;

    btnContacto.addEventListener("click", () => {
        setTimeout(() => {
            tituloContacto.classList.add("contacto-animado");
            setTimeout(
                () => tituloContacto.classList.remove("contacto-animado"),
                700
            );
        }, 600);
    });
}

// ================= CORREO FOOTER ========================
function activarCorreo() {
    const link = document.getElementById("correo-xaimua");
    if (!link) return;

    if (link.dataset.mailReady === "1") return;
    link.dataset.mailReady = "1";

    link.addEventListener("click", (e) => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) return;

        e.preventDefault();

        const email = "soporte@xaimua.com";
        const subject = encodeURIComponent("Consulta sobre Xaimua");
        const body = encodeURIComponent("Hola, necesito ayuda con:");

        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
        window.open(url, "_blank", "noopener");
    });
}

// ================= TOAST GENÉRICO =======================
function mostrarToast(texto) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = texto;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 2500);
}

// ================= HEADER / FOOTER ======================
document.addEventListener("DOMContentLoaded", () => {
    const headerHost = document.getElementById("header");
    const footerHost = document.getElementById("footer");

    // HEADER
    if (headerHost) {
        fetch("//xaimua_page/header.html")
        .then(res => res.text())
        .then(html => {
            headerHost.innerHTML = html;

            configurarScrollYAnimaciones();

            const menuToggle = document.getElementById("menuToggle");
            const menu = document.querySelector(".menu");

            if (menuToggle && menu) {
                menuToggle.addEventListener("click", () => {
                    menu.classList.toggle("show");
                });

                const menuLinks = document.querySelectorAll(".menu a");
                menuLinks.forEach(link => {
                    link.addEventListener("click", () => {
                        menu.classList.remove("show");
                    });
                });
            }
        });

    }

    // FOOTER
    if (footerHost) {
        fetch("/html/footer.html")
            .then(res => res.text())
            .then(html => {
                footerHost.innerHTML = html;

                iniciarAnimacionContacto();
                activarCorreo();
            })
            .catch(err => console.error("Error cargando footer:", err));
    }
});

// ================= WHATSAPP: REINICIAR ANIMACIÓN ========
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        const btn = document.querySelector(".btn-whatsapp");
        if (!btn) return;

        btn.style.animation = "none";
        void btn.offsetWidth;
        btn.style.animation = "";
    }
});
