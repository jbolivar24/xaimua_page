// captures.js
import { API_BASE } from "./config.js";

const capturesImages = [
    "c1.png",
    "c2.png"
];

export function initCaptures() {
    const track = document.getElementById("capturesTrack");
    if (!track || capturesImages.length === 0) return;

    track.innerHTML = "";

    const loopImages = [...capturesImages, ...capturesImages];
    let loaded = 0;
    const total = loopImages.length;

    loopImages.forEach(file => {
        const img = document.createElement("img");
        img.src = `${API_BASE}/img/captures/${file}`;
        img.alt = "Capturas Xaimua";
        img.loading = "lazy";
        img.decoding = "async";

        img.onload = () => {
            loaded++;
            if (loaded === total) {
                // 👈 SOLO cuando todas cargaron
                startCarousel(track);
            }
        };

        track.appendChild(img);
    });
}

function startCarousel(track) {
    let x = 0;
    let speed = 0.3;
    let paused = false;

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

