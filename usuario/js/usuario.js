import { API_BASE, buildPath } from "../../js/config.js";

// elementos
const usernameEl = document.getElementById("usernameValue");
const statusEl   = document.getElementById("statusValue");
const logoutBtn  = document.getElementById("logoutBtn");

// datos desde localStorage
const token = localStorage.getItem("userToken") || localStorage.getItem("xaToken");
const role  = localStorage.getItem("xaRole");
const user  = localStorage.getItem("xaUser");

// pintar datos (defensivo)
if (usernameEl) {
    usernameEl.textContent = user || "Usuario";
}

if (statusEl) {
    statusEl.textContent = "Activo";
}

// cerrar sesión
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            if (token) {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": token
                    }
                });
            }
        } catch (e) {
            console.warn("Error cerrando sesión", e);
        }

        // limpiar todo
        localStorage.clear();

        // volver a login
        window.location.href = buildPath("/html/login.html");
    });
}
