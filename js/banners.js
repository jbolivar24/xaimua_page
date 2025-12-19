// banners.js
const API_BASE = "https://undeservedly-hammerheaded-lindsay.ngrok-free.dev";

let bannerIndex = 0;
let bannerTimer = null;

export async function initBanners() {
    const track = document.getElementById("bannerTrack");
    if (!track) return;

    try {
        const res = await fetch(`${API_BASE}/api/banners`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });

        const banners = await res.json();
        banners.sort((a, b) => a.order - b.order);

        track.innerHTML = "";

        banners.forEach(banner => {
            const div = document.createElement("div");
            div.className = "banner-item";

            div.innerHTML = `
                <img src="${API_BASE}${banner.image}" alt="">
            `;

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

function rotateBanner(total) {
    bannerIndex = (bannerIndex + 1) % total;
    const track = document.getElementById("bannerTrack");
    if (track) {
        track.style.transform = `translateX(-${bannerIndex * 100}%)`;
    }
}

function handleBannerClick(banner) {
    switch (banner.action) {
        case "PRODUCT":
            window.location.href = `/producto.html?id=${banner.value}`;
            break;
        case "ANCHOR":
            window.location.href = `/#${banner.value}`;
            break;
        case "URL":
            window.location.href = banner.value;
            break;
    }
}
