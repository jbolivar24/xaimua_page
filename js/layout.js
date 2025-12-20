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
            ) return;

            const hashIndex = href.indexOf("#");
            if (hashIndex === -1) return;

            const hash = href.slice(hashIndex);
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

// ================= CONTACTO FOOTER ======================
function iniciarAnimacionContacto() {
    const btnContacto = document.getElementById("btn-contacto");
    const tituloContacto = document.getElementById("titulo-contacto");
    if (!btnContacto || !tituloContacto) return;

    btnContacto.addEventListener("click", () => {
        setTimeout(() => {
            tituloContacto.classList.add("contacto-animado");
            setTimeout(() => {
                tituloContacto.classList.remove("contacto-animado");
            }, 700);
        }, 600);
    });
}

// ================= CORREO FOOTER ========================
function activarCorreo() {
    const link = document.getElementById("correo-xaimua");
    if (!link) return;

    if (link.dataset.ready) return;
    link.dataset.ready = "1";

    link.addEventListener("click", (e) => {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) return;

        e.preventDefault();

        const email = "soporte@xaimua.com";
        const subject = encodeURIComponent("Consulta sobre Xaimua");
        const body = encodeURIComponent("Hola, necesito ayuda con:");

        window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
            "_blank",
            "noopener"
        );
    });
}

// ================= HEADER / FOOTER ======================
document.addEventListener("DOMContentLoaded", () => {

    const headerHost = document.getElementById("header");
    const footerHost = document.getElementById("footer");

    // 🌍 Detectar entorno correctamente
    const isGithub = window.location.pathname.includes("/xaimua_page/");
    const root = isGithub ? "/xaimua_page" : "";

    // -------- HEADER --------
    if (headerHost) {
        fetch(`${root}/html/header.html`)
            .then(res => res.text())
            .then(html => {
                headerHost.innerHTML = html;

                // 🖼 LOGO
                const logo = headerHost.querySelector("#logo-img");
                if (logo) {
                    logo.src = `${root}/img/logo.png`;
                }

                // 🔗 Resolver data-link
                headerHost.querySelectorAll("[data-link]").forEach(el => {
                    const target = el.dataset.link;

                    if (target.startsWith("index#")) {
                        const hash = target.split("#")[1];
                        el.href = `${root}/index.html#${hash}`;
                        return;
                    }

                    if (target === "index") {
                        el.href = `${root}/index.html`;
                        return;
                    }

                    el.href = `${root}/html/${target}.html`;
                });

                configurarScrollYAnimaciones();

                const menuToggle = document.getElementById("menuToggle");
                const menu = document.querySelector(".menu");

                if (menuToggle && menu) {
                    menuToggle.addEventListener("click", () => {
                        menu.classList.toggle("show");
                    });

                    menu.querySelectorAll("a").forEach(a => {
                        a.addEventListener("click", () => {
                            menu.classList.remove("show");
                        });
                    });
                }
            })
            .catch(err => console.error("Error cargando header:", err));
    }

    // -------- FOOTER --------
    if (footerHost) {
        fetch(`${root}/html/footer.html`)
            .then(res => res.text())
            .then(html => {
                footerHost.innerHTML = html;
                iniciarAnimacionContacto();
                activarCorreo();
            })
            .catch(err => console.error("Error cargando footer:", err));
    }
});
