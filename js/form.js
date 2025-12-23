import { API_BASE } from "./config.js";
import { AppConfig } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: name.value,
            email: email.value,
            phone: phone.value,
            subject: subject.value,
            message: message.value
        };

        try {
            await fetch(`${API_BASE}/api/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            // volver al inicio real
            window.location.href = `${root}/index.html`;

        } catch (err) {
            console.error("Error enviando mensaje", err);
            alert("No se pudo enviar el mensaje");
        }
    });

});
