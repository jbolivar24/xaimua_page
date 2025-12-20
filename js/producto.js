// producto.js

import { API_BASE } from "./config.js";

const REPO_BASE = window.location.hostname.includes("github.io")
    ? "/xaimua_page"
    : "";

// ================= SHIPPING BADGE =================
function renderShippingBadge(text) {
    const ship = (text || "").trim();
    const low = ship.toLowerCase();

    let cls = "";
    if (low.includes("gratis")) cls = "free";
    else if (low.includes("cobro") || low.includes("destino")) cls = "paid";
    else if (low.includes("chilexpress") || low.includes("starket") || low.includes("starken")) cls = "carrier";

    return `
        <span class="ship-badge ${cls}">
            <span class="ship-dot"></span>
            <span>${ship}</span>
        </span>
    `;
}

// ================= UTIL: ruta local imagen =================
function getLocalImagePath(imagePath) {
    if (!imagePath) return `${REPO_BASE}/img/no-image.png`;

    // Acepta:
    // "router/img1_v4.png"
    // "/img/router/img1_v4.png"
    // "img/router/img1_v4.png"
    const clean = imagePath.replace(/^\/?img\//, "");
    return `${REPO_BASE}/img/${clean}`;
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {

    // 1️⃣ Leer ID desde URL
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"), 10);

    if (!productId) {
        alert("Producto inválido");
        return;
    }

    try {
        // 2️⃣ Cargar producto desde backend (DATA ONLY)
        const response = await fetch(
            `${API_BASE}/api/products/${productId}`,
            {
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Producto no encontrado");
        }

        const product = await response.json();

        // 3️⃣ Referencias DOM
        const qtyInput = document.getElementById("productQty");
        const priceEl  = document.getElementById("productPrice");
        const totalEl  = document.getElementById("productTotal");

        const mainImage = document.getElementById("productMainImage");
        const thumbsContainer = document.getElementById("productThumbs");

        const buyBtn    = document.getElementById("buyProductBtn");
        const modal     = document.getElementById("buyModal");
        const cancelBtn = document.getElementById("cancelBuy");
        const form      = document.getElementById("buyForm");

        // 4️⃣ Pintar datos
        document.getElementById("productName").textContent = product.name;
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("productShipping").innerHTML = renderShippingBadge(product.dataShip);

        // 5️⃣ Imágenes (LOCAL)
        thumbsContainer.innerHTML = "";

        const images = Array.isArray(product.images) ? product.images : [];

        if (images.length > 0) {
            mainImage.src = getLocalImagePath(images[0]);
        }

        images.forEach((imgPath, index) => {
            const thumb = document.createElement("img");
            thumb.src = getLocalImagePath(imgPath);
            thumb.className = "product-thumb";

            if (index === 0) thumb.classList.add("active");

            thumb.addEventListener("click", () => {
                mainImage.src = getLocalImagePath(imgPath);

                document
                    .querySelectorAll(".product-thumb")
                    .forEach(t => t.classList.remove("active"));

                thumb.classList.add("active");
            });

            thumbsContainer.appendChild(thumb);
        });

        // 6️⃣ Precio inicial
        const priceFormatted = `$${product.price.toLocaleString("es-CL")}`;
        priceEl.textContent = priceFormatted;
        totalEl.textContent = priceFormatted;

        // 7️⃣ Recalcular total
        function updateTotal() {
            let qty = parseInt(qtyInput.value, 10) || 1;

            if (qty < 1) {
                qty = 1;
                qtyInput.value = 1;
            }

            const total = product.price * qty;
            totalEl.textContent = `$${total.toLocaleString("es-CL")}`;
        }

        qtyInput.addEventListener("input", updateTotal);

        // 8️⃣ Modal compra
        buyBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
        });

        cancelBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });

        // 9️⃣ Submit (pasarela futura)
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const qty = parseInt(qtyInput.value, 10) || 1;
            const total = product.price * qty;

            console.log("🧾 Pedido:", {
                productId: product.id,
                name: product.name,
                qty,
                total
            });

            alert(`Total a pagar: $${total.toLocaleString("es-CL")}`);
            modal.classList.add("hidden");
        });

    } catch (err) {
        console.error("❌ Error cargando producto", err);
        alert("Error cargando el producto");
    }
});
