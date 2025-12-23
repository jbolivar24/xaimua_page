// ================= ANIMACIÓN DE TÍTULOS =================
function animarTituloSeccion(idTitulo) {
    const titulo = document.getElementById(idTitulo);
    if (!titulo) return;

    // Reinicia la animación aunque se haya usado hace 1 segundo
    titulo.classList.remove("section-highlight");
    void titulo.offsetWidth; // fuerza reflow
    titulo.classList.add("section-highlight");

    setTimeout(() => titulo.classList.remove("section-highlight"), 700);
}

// Espera a que termine el scroll (de verdad) y ahí ejecuta callback
function esperarFinScrollHastaSeccion(seccion, callback) {
    if (!seccion) return;

    const pageBottom = document.documentElement.scrollHeight - window.innerHeight;
    const header = document.querySelector("header");
    const headerH = header ? header.offsetHeight : 0;

    // Queremos que la sección “quede” justo debajo del header (con un airecito)
    const desiredTop = headerH + 14;

    let lastY = window.scrollY;
    let quietFrames = 0;
    const start = performance.now();
    const MAX_MS = 2500;

    function tick() {
        const isNearBottom = window.scrollY > pageBottom - 40;
        const y = window.scrollY;
        const dy = Math.abs(y - lastY);
        lastY = y;

        const top = seccion.getBoundingClientRect().top;
        const dist = Math.abs(top - desiredTop);

        // si casi no se mueve, contamos frames “quietos”
        if (dy < 0.4) quietFrames++;
        else quietFrames = 0;

        const elapsed = performance.now() - start;

        // condición: scroll quieto y la sección ya está donde debe
        if (
        quietFrames >= 6 &&
            (dist <= 10 || isNearBottom)
        ) {
            callback();
            return;
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ================= SCROLL SUAVE + ANIMACIÓN (POST-SCROLL) ===============
function configurarScrollYAnimaciones() {

    const mapaAnimaciones = {
        "#que-es": "titulo-que-es",
        "#caracteristicas": "titulo-caracteristicas",
        "#capturas": "titulo-capturas",
        "#descargas": "titulo-descargas",
        "#contacto-footer": "titulo-contacto" // 👈 ESTA ES LA CLAVE
    };

    // 1) Clicks del menú
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href) return;

            const seccion = document.querySelector(href);
            if (!seccion) return;

            e.preventDefault();

            // Actualiza URL sin que el navegador haga su scroll “por su cuenta”
            history.pushState(null, "", href);

            // Scroll suave
            seccion.scrollIntoView({ behavior: "smooth", block: "start" });

            // Animación cuando ya llegó
            const idTitulo = mapaAnimaciones[href];
            if (idTitulo) {
                esperarFinScrollHastaSeccion(seccion, () => animarTituloSeccion(idTitulo));
            }

            const menu = document.querySelector(".menu");
            if (menu) menu.classList.remove("show");
        });
    });

    // 2) Si el hash cambia por código (ej: banner) o al entrar con URL #...
    window.addEventListener("hashchange", () => {
        const hash = window.location.hash;
        const seccion = document.querySelector(hash);
        const idTitulo = mapaAnimaciones[hash];

        if (seccion && idTitulo) {
            esperarFinScrollHastaSeccion(seccion, () => animarTituloSeccion(idTitulo));
        }
    });

    // 3) Si la página ya cargó con #algo (sin hashchange)
    const initialHash = window.location.hash;
    if (mapaAnimaciones[initialHash]) {
        const seccion = document.querySelector(initialHash);
        const idTitulo = mapaAnimaciones[initialHash];

        if (seccion && idTitulo) {
            setTimeout(() => {
                esperarFinScrollHastaSeccion(seccion, () => animarTituloSeccion(idTitulo));
            }, 50);
        }
    }
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
                const logoHeader = headerHost.querySelector("#logo-header");
                if (logoHeader) {
                    logoHeader.src = `${root}/img/logo.png`;
                }

                // 🔗 Resolver data-link
                const path = window.location.pathname;
                const isIndex =
                    path.endsWith("/index.html") ||
                    path.endsWith("/xaimua_page/") ||
                    path === "/" ||
                    path.endsWith("/xaimua_page/index.html");

                headerHost.querySelectorAll("[data-link]").forEach(el => {
                    const target = el.dataset.link;

                    if (target.startsWith("index#")) {
                        const hash = target.split("#")[1];
                        el.href = isIndex ? `#${hash}` : `${root}/index.html#${hash}`;
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

                const logoFooter = footerHost.querySelector("#logo-footer");
                if (logoFooter) {
                    logoFooter.src = `${root}/img/logo.png`;
                }

                iniciarAnimacionContacto();
                activarCorreo();
            })
            .catch(err => console.error("Error cargando footer:", err));
    }

});
