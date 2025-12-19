// banners.js
const API_BASE = "https://undeservedly-hammerheaded-lindsay.ngrok-free.dev";
const REPO_BASE = window.location.hostname.includes("github.io")
    ? "/xaimua_page"
    : "";

let bannerIndex = 0;
let bannerTimer = null;

// ================= IMG URL NORMALIZER =================
function toApiImgUrl(src) {
    if (!src) return "";

    // Si ya es absoluta
    if (src.startsWith("http://") || src.startsWith("https://")) {
        return `${src}?ngrok-skip-browser-warning=true`;
    }

    // Asegura slash inicial
    if (!src.startsWith("/")) src = `/${src}`;

    // "/img/banners/b1.png" -> "banners/b1.png"
    const clean = src.replace(/^\/img\//, "");

    return `${API_BASE}/api/img/${clean}?ngrok-skip-browser-warning=true`;
}

// ================= INIT BANNERS ======================
export async function initBanners() {
    const track = document.getElementById("bannerTrack");
    if (!track) return;

    try {
        const res = await fetch(`${API_BASE}/api/banners`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });

        if (!res.ok) throw new Error("No se pudieron cargar banners");

        const banners = await res.json();
        banners.sort((a, b) => a.order - b.order);

        track.innerHTML = "";
        bannerIndex = 0;

        banners.forEach(banner => {
            const div = document.createElement("div");
            div.className = "banner-item";

            const img = document.createElement("img");
            img.alt = banner.title || "Banner Xaimua";
            img.loading = "lazy";
            img.decoding = "async";
            img.src = toApiImgUrl(banner.image);

            img.onerror = () => {
                console.warn("❌ No cargó banner:", img.src);
            };

            div.appendChild(img);
            div.addEventListener("click", () => handleBannerClick(banner));

            track.appendChild(div);
        });

        if (bannerTimer) clearInterval(bannerTimer);
        if (banners.length > 1) {
            bannerTimer = setInterval(() => rotateBanner(banners.length), 5000);
        }

    } catch (err) {
        console.error("Error cargando banners:", err);
    }
}

// ================= ROTATION ==========================
function rotateBanner(total) {
    bannerIndex = (bannerIndex + 1) % total;
    const track = document.getElementById("bannerTrack");
    if (track) {
        track.style.transform = `translateX(-${bannerIndex * 100}%)`;
    }
}

// ================= CLICK ACTIONS =====================
function handleBannerClick(banner) {
    switch (banner.action) {
        case "PRODUCT":
            window.location.href = `${REPO_BASE}/html/producto.html?id=${banner.value}`;
            break;

        case "ANCHOR":
            window.location.href = `${REPO_BASE}/index.html#${banner.value}`;
            break;

        case "URL":
            window.open(banner.value, "_blank");
            break;
    }
}
