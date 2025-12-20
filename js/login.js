const basePath = window.location.pathname.includes("/xaimua_page/")
    ? "/xaimua_page"
    : "";

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("loginBtn");
    const msg = document.getElementById("loginMessage");

    if (!btn || !msg) return;

    btn.addEventListener("click", () => {
        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();

        if (user === "" || pass === "") {
            msg.textContent = "Completa todos los campos.";
            return;
        }

        // 🔐 Login provisorio local
        if (user === "admin" && pass === "1") {
            localStorage.setItem("adminToken", "OK");

            // ✅ redirección compatible con Live Server y GitHub Pages
            window.location.href =
                `${window.location.origin}${basePath}/admin/index.html`;

            return;
        }

        msg.textContent = "Credenciales inválidas.";
    });
});
