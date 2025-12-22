// banners.js
import { API_BASE } from "./config.js";

let index = 1;
let timer = null;
let banners = [];

// ===== INIT =====
export function initBanners() {
    loadBanners();
}

// ===== FETCH DESDE BACKEND =====
async function loadBanners() {
    try {
        const res = await fetch(`${API_BASE}/api/banners`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) return;

        // ordenar por "order"
        banners = data.sort((a, b) => a.order - b.order);

        buildCarousel();

    } catch (err) {
        console.error("Error cargando banners:", err);
    }
}

// ===== RECONSTRUCCIÓN COMPLETA =====
function buildCarousel() {
    const track = document.getElementById("bannerTrack");
    if (!track || banners.length === 0) return;

    clearInterval(timer);
    track.innerHTML = "";
    index = 1;

    // 👯‍♂️ [último] + reales + [primero]
    const items = [
        banners[banners.length - 1],
        ...banners,
        banners[0]
    ];

    items.forEach(banner => {
        const div = document.createElement("div");
        div.className = "banner-item";

        const img = document.createElement("img");

        // 🔁 cache busting + resolución correcta de URL
        const cacheBuster = Date.now();
        const resolvedSrc = banner.image.startsWith("http")
            ? banner.image
            : `${API_BASE.replace(/\/$/, "")}/${banner.image.replace(/^\//, "")}`;

        img.src = `${resolvedSrc}?v=${cacheBuster}`;
        img.alt = "Banner Xaimua";
        img.loading = "eager";

        div.appendChild(img);
        div.addEventListener("click", () => handleBannerClick(banner));
        track.appendChild(div);
    });

    jumpTo(track, index);
    setupButtons(track, items.length);
    setupAutoplay(track, items.length);
    setupSwipe(track);
}

// ===== MOVIMIENTO =====
function moveTo(track, i) {
    track.style.transition = "transform 0.6s ease-in-out";
    track.style.transform = `translateX(-${i * 100}%)`;
}

function jumpTo(track, i) {
    track.style.transition = "none";
    track.style.transform = `translateX(-${i * 100}%)`;
}

// ===== AUTOPLAY =====
function setupAutoplay(track, total) {
    timer = setInterval(() => {
        index++;
        moveTo(track, index);

        track.addEventListener(
            "transitionend",
            () => {
                if (index === total - 1) {
                    index = 1;
                    jumpTo(track, index);
                }
            },
            { once: true }
        );
    }, 5000);
}

// ===== BOTONES =====
function setupButtons(track, total) {
    const prev = document.querySelector(".banner-btn.prev");
    const next = document.querySelector(".banner-btn.next");

    if (prev) prev.onclick = () => {
        index--;
        moveTo(track, index);

        track.addEventListener(
            "transitionend",
            () => {
                if (index === 0) {
                    index = total - 2;
                    jumpTo(track, index);
                }
            },
            { once: true }
        );
    };

    if (next) next.onclick = () => {
        index++;
        moveTo(track, index);

        track.addEventListener(
            "transitionend",
            () => {
                if (index === total - 1) {
                    index = 1;
                    jumpTo(track, index);
                }
            },
            { once: true }
        );
    };
}

// ===== SWIPE ANDROID =====
function setupSwipe(track) {
    let startX = 0;

    track.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    track.addEventListener("touchend", e => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 50) {
            diff < 0
                ? document.querySelector(".banner-btn.next")?.click()
                : document.querySelector(".banner-btn.prev")?.click();
        }
    });
}

// ===== CLICK =====
function handleBannerClick(banner) {
    switch (banner.action) {
        case "ANCHOR":
            window.location.hash = `#${banner.value}`;
            break;

        case "URL":
            window.location.href = banner.value;
            break;

        case "PRODUCT":
            window.location.href = `/producto.html?id=${banner.value}`;
            break;
    }
}
