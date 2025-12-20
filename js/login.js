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

        // Login provisiorio local
        if (user === "admin" && pass === "1") {
            localStorage.setItem("adminToken", "OK");
            window.location.href = "admin/index.html";
            return;
        }

        msg.textContent = "Credenciales inválidas.";
    });
});
