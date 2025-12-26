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

// Precio seguro (por si viene string/null)
function toNumber(val) {
  if (val == null) return 0;
  const n = Number(String(val).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error(`Backend no respondió (HTTP ${response.status})`);

    const products = await response.json();
    grid.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = "<p>No hay productos disponibles.</p>";
      return;
    }

    products.forEach(product => {

      // ⛔ filtro “anti-banner” más flexible (por si el nombre no es EXACTO "banner")
      const nameLow = (product.name || "").toLowerCase();
      if (nameLow === "banner" || nameLow.includes("banner")) return;

      const price = toNumber(product.price);
      const imagePath = product.images?.[0];

      const imgSrc = imagePath
        ? `${API_BASE}${imagePath}`
        : `${API_BASE}/img/no-image.png`;

      const card = document.createElement("div");
      card.className = "product-card";
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="product-image">
          <img src="${imgSrc}" alt="${product.name || "Producto"}">
        </div>

        <div class="product-info">
          <h3 class="product-name">${product.name || "Producto sin nombre"}</h3>

          <p class="product-price">
            $${price.toLocaleString("es-CL")}
          </p>

          <div class="product-shipping">
            ${renderShippingBadge(product.dataShip)}
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        // ✅ Esto arma bien la URL aunque estés en subcarpetas
        const url = new URL(`producto.html?id=${product.id}`, window.location.href);
        window.location.href = url.toString();
      });

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Error cargando productos", err);
    grid.innerHTML = "<p>Error cargando productos</p>";
  }
});
