// ================= CONFIG =================
import { API_BASE, FRONT_BASE } from "./config.js";

// ================= ELEMENTOS =================
const pass1El = document.getElementById("newPassword");
const pass2El = document.getElementById("confirmPassword");
const saveBtn = document.getElementById("savePasswordBtn");
const msgEl = document.getElementById("msg");

// ================= HELPERS =================
function setMsg(text, isError = true) {
    msgEl.textContent = text || "";
    msgEl.style.color = isError ? "#ff6b6b" : "#7CFFB2";
}

// ================= TOKEN (SE GUARDA UNA SOLA VEZ) =================
const params = new URLSearchParams(window.location.search);
const RESET_TOKEN = params.get("token");

console.log("🔐 Token recibido desde la URL:", RESET_TOKEN);

if (!RESET_TOKEN) {
    setMsg("Token inválido o inexistente");
    saveBtn.disabled = true;
}

// ================= EVENTO =================
saveBtn.addEventListener("click", async () => {

    if (!RESET_TOKEN) {
        setMsg("Token inválido o inexistente");
        return;
    }

    const pass1 = pass1El.value.trim();
    const pass2 = pass2El.value.trim();

    // ===== VALIDACIONES =====
    if (!pass1 || !pass2) {
        setMsg("Debes completar ambos campos");
        return;
    }

    if (pass1.length < 4) {
        setMsg("La contraseña debe tener al menos 4 caracteres");
        return;
    }

    if (pass1 !== pass2) {
        setMsg("Las contraseñas no coinciden");
        return;
    }

    saveBtn.disabled = true;
    setMsg("Guardando contraseña...", false);

    const payload = {
        token: RESET_TOKEN,
        password: pass1
    };

    console.log("📤 Enviando payload:", payload);

    try {
        const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            setMsg(data?.message || "Token inválido o vencido");
            saveBtn.disabled = false;
            return;
        }

        // ===== ÉXITO =====
        setMsg("Contraseña actualizada correctamente", false);

        setTimeout(() => {
            window.location.href = `${FRONT_BASE}/html/login.html`;
        }, 1500);

    } catch (err) {
        console.error(err);
        setMsg("Error al procesar la solicitud");
        saveBtn.disabled = false;
    }
});
