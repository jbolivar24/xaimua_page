// captures.js
import { API_BASE } from "./config.js";

export function initCaptures(images) {
    const track = document.getElementById("capturesTrack");
    if (!track || !Array.isArray(images) || images.length === 0) return;

    track.innerHTML = "";

    // 🔁 dos ciclos completos
    const loopImages = [...images, ...images];

    let loaded = 0;
    const total = loopImages.length;

    loopImages.forEach(src => {
        const img = document.createElement("img");
        img.src = src.startsWith("http")
        ? src
        : `${API_BASE}${src}`;

        img.alt = "Capturas Xaimua";
        img.loading = "eager";
        img.decoding = "async";

        img.onload = () => {
            loaded++;
            if (loaded === total) {
                startCarousel(track);
            }
        };

        track.appendChild(img);
    });
}

function startCarousel(track) {
    let x = 0;
    let paused = false;
    const speed = 1.0;

    const singleCycleWidth = track.scrollWidth / 2;

    track.addEventListener("mouseenter", () => paused = true);
    track.addEventListener("mouseleave", () => paused = false);

    function animate() {
        if (!paused) {
            x -= speed;

            if (Math.abs(x) >= singleCycleWidth) {
                x = 0;
            }

            track.style.transform = `translateX(${x}px)`;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
