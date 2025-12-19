// banners.js (LOCAL, SIN BACKEND)

const REPO_BASE = window.location.hostname.includes("github.io")
    ? "/xaimua_page"
    : "";

let bannerIndex = 0;
let bannerTimer = null;

// ===== CONFIGURACIÓN DE BANNERS =====
const banners = [
    {
        image: "banner1_v3.png",
        action: "ANCHOR",
        value: "que-es"
    },
    {
        image: "banner2_v3.png",
        action: "ANCHOR",
        value: "capturas"
    },
    {
        image: "banner3_v3.png",
        action: "ANCHOR",
        value: "descargas"
    },
    {
        image: "banner4_v3.png",
        action: "URL",
        value: "https://xaimua.com"
    }
];

// ===== INIT =====
export function initBanners() {
    const track = document.getElementById("bannerTrack");
    if (!track) return;

    track.innerHTML = "";
    bannerIndex = 0;

    banners.forEach(banner => {
        const div = document.createElement("div");
        div.className = "banner-item";

        const img = document.createElement("img");
        img.src = `${REPO_BASE}/img/banners/${banner.image}`;
        img.alt = "Banner Xaimua";
        img.loading = "lazy";
        img.decoding = "async";

        div.appendChild(img);
        div.addEventListener("click", () => handleBannerClick(banner));
        track.appendChild(div);
    });

    if (bannerTimer) clearInterval(bannerTimer);
    if (banners.length > 1) {
        bannerTimer = setInterval(() => rotateBanner(banners.length), 5000);
    }
}

// ===== ROTACIÓN =====
function rotateBanner(total) {
    bannerIndex = (bannerIndex + 1) % total;
    const track = document.getElementById("bannerTrack");
    if (track) {
        track.style.transform = `translateX(-${bannerIndex * 100}%)`;
    }
}

// ===== CLICK =====
function handleBannerClick(banner) {
    const base = window.location.hostname.includes("github.io")
        ? "/xaimua_page/index.html"
        : "/index.html";

    switch (banner.action) {
        case "ANCHOR":
            window.location.href = `${base}#${banner.value}`;
            break;

        case "URL":
            window.open(banner.value, "_blank");
            break;
    }
}
