// banners.js
import { API_BASE } from "./config.js";

let index = 1;
let timer = null;

// ===== CONFIGURACIÓN =====
const banners = [
    { image: "banner1_v3.png", action: "ANCHOR", value: "que-es" },
    { image: "banner2_v3.png", action: "ANCHOR", value: "capturas" },
    { image: "banner3_v3.png", action: "ANCHOR", value: "descargas" },
    { image: "banner4_v3.png", action: "URL", value: "https://xaimua.com" }
];

// ===== INIT =====
export function initBanners() {
    const track = document.getElementById("bannerTrack");
    if (!track || banners.length === 0) return;

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
        img.src = `${API_BASE}/img/banners/${banner.image}`;
        img.alt = "Banner Xaimua";
        img.loading = "eager";

        div.appendChild(img);
        div.addEventListener("click", () => handleBannerClick(banner));
        track.appendChild(div);
    });

    // posición inicial (primer banner real)
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
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        index++;
        moveTo(track, index);

        track.addEventListener("transitionend", () => {
            if (index === total - 1) {
                index = 1;
                jumpTo(track, index);
            }
        }, { once: true });

    }, 5000);
}

// ===== BOTONES =====
function setupButtons(track, total) {
    const prev = document.querySelector(".banner-btn.prev");
    const next = document.querySelector(".banner-btn.next");

    if (prev) prev.onclick = () => {
        index--;
        moveTo(track, index);

        track.addEventListener("transitionend", () => {
            if (index === 0) {
                index = total - 2;
                jumpTo(track, index);
            }
        }, { once: true });
    };

    if (next) next.onclick = () => {
        index++;
        moveTo(track, index);

        track.addEventListener("transitionend", () => {
            if (index === total - 1) {
                index = 1;
                jumpTo(track, index);
            }
        }, { once: true });
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
    if (banner.action === "ANCHOR") {
        window.location.hash = `#${banner.value}`;
    }
    if (banner.action === "URL") {
        window.open(banner.value, "_blank");
    }
}
