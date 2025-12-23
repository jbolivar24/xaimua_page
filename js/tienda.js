// tienda.js (DESDE BACKEND)

import { API_BASE } from "./config.js";

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

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {

    const grid = document.getElementById("productGrid");
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) throw new Error("Backend no respondió");

        const products = await response.json();
        grid.innerHTML = "";

        products.forEach(product => {

            // ⛔ Saltar banners si existieran
            if (product.name?.toLowerCase() === "banner") return;

            const imagePath = product.images?.[0];
            const imgSrc = imagePath
                ? `${API_BASE}${imagePath}`
                : `${API_BASE}/img/no-image.png`;

            const card = document.createElement("div");
            card.className = "product-card";
            card.style.cursor = "pointer";

            card.innerHTML = `
                <div class="product-image">
                    <img src="${imgSrc}" alt="${product.name}">
                </div>

                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>

                    <p class="product-price">
                        $${product.price.toLocaleString("es-CL")}
                    </p>

                    <div class="product-shipping">
                        ${renderShippingBadge(product.dataShip)}
                    </div>
                </div>
            `;

            card.addEventListener("click", () => {
                window.location.href = `producto.html?id=${product.id}`;
            });

            grid.appendChild(card);
        });

    } catch (err) {
        console.error("❌ Error cargando productos", err);
        grid.innerHTML = "<p>Error cargando productos</p>";
    }
});
