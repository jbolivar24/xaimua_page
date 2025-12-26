import { API_BASE } from "./config.js";

const form = document.getElementById("createPasswordForm");
const msg = document.getElementById("msg");
const btn = form?.querySelector("button");

// ================================
// 1️⃣ LEER USERNAME DESDE LA URL
// ================================
const params = new URLSearchParams(window.location.search);
const username = params.get("u");

if (!username) {
    msg.textContent = "Usuario inválido o inexistente.";
    msg.classList.add("error");

    // 🔒 bloqueamos el formulario
    if (btn) btn.disabled = true;
    return;
}

// ================================
// 2️⃣ SUBMIT DEL FORM
// ================================
form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pass1 = document.getElementById("password").value.trim();
    const pass2 = document.getElementById("password2").value.trim();

    if (pass1.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    if (pass1 !== pass2) {
        showError("Las contraseñas no coinciden.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "Guardando...";

        const res = await fetch(`${API_BASE}/api/auth/create-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password: pass1
            })
        });

        if (!res.ok) {
            const t = await res.text();
            throw new Error(t);
        }

        msg.textContent = "Contraseña creada con éxito. Redirigiendo…";
        msg.classList.remove("error");
        msg.classList.add("success");

        setTimeout(() => {
            window.location.href = "../html/login.html";
        }, 1500);

    } catch (err) {
        console.error(err);
        showError("No se pudo crear la contraseña.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Guardar contraseña";
    }
});

// ================================
// helpers
// ================================
function showError(text) {
    msg.textContent = text;
    msg.classList.remove("success");
    msg.classList.add("error");
}
