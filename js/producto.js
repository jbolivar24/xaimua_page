// producto.js (DESDE BACKEND)

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

    // ===== ID PRODUCTO =====
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"), 10);

    if (!productId) {
        alert("Producto inválido");
        return;
    }

    try {
        // ===== FETCH PRODUCTO =====
        const response = await fetch(`${API_BASE}/api/products/${productId}`);
        if (!response.ok) throw new Error("Producto no encontrado");

        const product = await response.json();

        // ===== DOM =====
        const qtyInput = document.getElementById("productQty");
        const priceEl  = document.getElementById("productPrice");
        const totalEl  = document.getElementById("productTotal");

        const mainImage = document.getElementById("productMainImage");
        const thumbsContainer = document.getElementById("productThumbs");

        const btnPrev = document.querySelector(".main-btn.prev");
        const btnNext = document.querySelector(".main-btn.next");
        const mainWrapper = document.querySelector(".product-main-wrapper");

        const buyBtn    = document.getElementById("buyProductBtn");
        const modal     = document.getElementById("buyModal");
        const cancelBtn = document.getElementById("cancelBuy");
        const form      = document.getElementById("buyForm");

        // ===== TEXTO =====
        document.getElementById("productName").textContent = product.name;
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("productShipping").innerHTML =
            renderShippingBadge(product.dataShip);

        // ===== IMÁGENES =====
        thumbsContainer.innerHTML = "";

        let images = Array.isArray(product.images) && product.images.length
            ? product.images.map(p => `${API_BASE}${p}`)
            : [`${API_BASE}/img/no-image.png`];

        let currentIndex = 0;

        function showImage(index) {
            currentIndex = (index + images.length) % images.length;
            mainImage.src = images[currentIndex];

            document.querySelectorAll(".product-thumb").forEach((t, i) => {
                t.classList.toggle("active", i === currentIndex);
            });
        }

        images.forEach((src, index) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.className = "product-thumb";

            thumb.addEventListener("click", () => {
                showImage(index);
            });

            thumbsContainer.appendChild(thumb);
        });

        showImage(0);

        // ===== BOTONES ‹ › =====
        btnPrev?.addEventListener("click", () => {
            showImage(currentIndex - 1);
        });

        btnNext?.addEventListener("click", () => {
            showImage(currentIndex + 1);
        });

        // ===== SWIPE ANDROID =====
        let startX = 0;

        mainWrapper?.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
        });

        mainWrapper?.addEventListener("touchend", e => {
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 50) {
                diff < 0
                    ? showImage(currentIndex + 1)
                    : showImage(currentIndex - 1);
            }
        });

        // ===== PRECIO =====
        const priceFormatted = `$${product.price.toLocaleString("es-CL")}`;
        priceEl.textContent = priceFormatted;
        totalEl.textContent = priceFormatted;

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

        // ===== MODAL COMPRA =====
        buyBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
        });

        cancelBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });

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
