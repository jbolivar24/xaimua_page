// form.js
import { API_BASE, AppConfig } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-xaimua");
  if (!form) return;

  const toast = document.getElementById("toast");
  const btn = form.querySelector('button[type="submit"]');

  function showToast(text, isError = false) {
    if (!toast) {
      alert(text);
      return;
    }

    toast.textContent = text;
    toast.classList.toggle("error", isError);

    toast.classList.remove("show");
    void toast.offsetWidth; // reflow para reiniciar animación
    toast.classList.add("show");

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: (document.getElementById("nombre")?.value || "").trim(),
      email: (document.getElementById("correo")?.value || "").trim(),
      phone: (document.getElementById("telefono")?.value || "").trim(),
      subject: (document.getElementById("asunto")?.value || "").trim(),
      message: (document.getElementById("mensaje")?.value || "").trim(),
      createdAt: new Date().toISOString(),
      source: window.location.href
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      showToast("Completa los campos obligatorios 🙏", true);
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Enviando...";
      }

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      showToast("Mensaje enviado ✔");
      form.reset();

      // ✅ Volver al INICIO del INDEX (landing)
      setTimeout(() => {
        window.location.href = AppConfig.link("#inicio");
      }, 650);

    } catch (err) {
      console.error("❌ Error enviando mensaje:", err);
      showToast("No pude enviar el mensaje 😕", true);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Enviar mensaje";
      }
    }
  });
});
