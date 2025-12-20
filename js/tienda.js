// tienda.js
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

// ================= UTIL: construir ruta local =================
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

    const grid = document.getElementById("productGrid");
    if (!grid) return;

    try {
        const response = await fetch(
            `${API_BASE}/api/products`,
            {
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Backend no respondió");
        }

        const products = await response.json();
        grid.innerHTML = "";

        products.forEach(product => {

            // ⛔ Saltar banners si existieran
            if (product.name.toLowerCase() === "banner") return;

            const imgSrc = getLocalImagePath(product.images?.[0]);

            const card = document.createElement("div");
            card.className = "product-card";
            card.style.cursor = "pointer";

            card.innerHTML = `
                <img src="${imgSrc}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="product-price">
                    $${product.price.toLocaleString("es-CL")}
                </p>
                <p class="product-meta">
                    ${renderShippingBadge(product.dataShip)}
                </p>
            `;

            card.addEventListener("click", () => {
                window.location.href = `${REPO_BASE}/html/producto.html?id=${product.id}`;
            });

            grid.appendChild(card);
        });

    } catch (err) {
        console.error("❌ Error cargando productos", err);
        grid.innerHTML = "<p>Error cargando productos</p>";
    }
});
