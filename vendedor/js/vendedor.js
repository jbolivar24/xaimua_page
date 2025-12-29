import { API_BASE, FRONT_BASE } from "../js/config.js";

// 🔐 token guardado al login
const token = localStorage.getItem("authToken");

if (!token) {
    window.location.href = `${FRONT_BASE}/html/login.html`;
}

// Mostrar vendedor (por ahora simple)
const userRutEl = document.getElementById("userRut");
userRutEl.textContent = localStorage.getItem("username") || "—";

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {

    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            headers: { "Authorization": token }
        });
    } catch {}

    localStorage.clear();
    window.location.href = `${FRONT_BASE}/html/login.html`;
});
