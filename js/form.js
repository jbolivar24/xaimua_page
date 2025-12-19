document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-xaimua");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        mostrarToast("Mensaje enviado ✔");
        form.reset();

        setTimeout(() => {
            window.location.href = "index.html#que-es";
        }, 1200);
    });
});
