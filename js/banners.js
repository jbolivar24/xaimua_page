// banners.js
import { API_BASE, buildPath } from "./config.js";


let banners = [];
let bannerTrack = null;
let currentIndex = 0;
let timer = null;
let bannerCount = 0;

const INTERVAL = 5000;
const TRANSITION = "transform 0.6s ease";

// swipe
let startX = 0;
let isSwiping = false;
const SWIPE_THRESHOLD = 50; // px mínimos

export async function initBanners() {
  bannerTrack = document.getElementById("bannerTrack");
  if (!bannerTrack) return;

  try {
    const res = await fetch(`${API_BASE}/api/banners`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    banners = await res.json();
    if (!Array.isArray(banners) || banners.length === 0) return;

    bannerCount = banners.length;
    renderInfiniteBanners();
    bindControls();
    bindSwipe();        // 👈 NUEVO
    startAuto();

  } catch (err) {
    console.error("Error cargando banners:", err);
  }
}

// ================= RENDER =================

function renderInfiniteBanners() {
  bannerTrack.innerHTML = "";

  // duplicamos para el loop infinito
  [...banners, ...banners].forEach(b => {
    const div = document.createElement("div");
    div.className = "banner-item";
    div.style.cursor = "pointer";

    div.innerHTML = `
      <img src="${API_BASE}${b.image}" alt="banner">
    `;

    // 👉 acción al click
    div.addEventListener("click", () => handleBannerAction(b));

    bannerTrack.appendChild(div);
  });

  bannerTrack.style.transition = "none";
  currentIndex = 0;
  moveTo(currentIndex);

  bannerTrack.offsetHeight; // reflow
  bannerTrack.style.transition = TRANSITION;
}

// ================= MOVIMIENTO =================

function moveTo(index) {
  bannerTrack.style.transform = `translateX(-${index * 100}%)`;
}

function nextBanner() {
  currentIndex++;
  moveTo(currentIndex);

  if (currentIndex === bannerCount) {
    setTimeout(() => {
      bannerTrack.style.transition = "none";
      currentIndex = 0;
      moveTo(currentIndex);

      bannerTrack.offsetHeight;
      bannerTrack.style.transition = TRANSITION;
    }, 650);
  }
}

function prevBanner() {
  if (currentIndex === 0) {
    bannerTrack.style.transition = "none";
    currentIndex = bannerCount;
    moveTo(currentIndex);

    bannerTrack.offsetHeight;
    bannerTrack.style.transition = TRANSITION;
  }

  currentIndex--;
  moveTo(currentIndex);
}

// ================= AUTO =================

function startAuto() {
  if (timer) clearInterval(timer);
  timer = setInterval(nextBanner, INTERVAL);
}

function resetAuto() {
  startAuto();
}

// ================= CONTROLES =================

function bindControls() {
  const btnPrev = document.querySelector(".banner-btn.prev");
  const btnNext = document.querySelector(".banner-btn.next");

  btnPrev?.addEventListener("click", () => {
    prevBanner();
    resetAuto();
  });

  btnNext?.addEventListener("click", () => {
    nextBanner();
    resetAuto();
  });
}

// ================= SWIPE =================

function bindSwipe() {
  bannerTrack.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  bannerTrack.addEventListener("touchmove", e => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 10) e.preventDefault();
  }, { passive: false });

  bannerTrack.addEventListener("touchend", e => {
    if (!isSwiping) return;
    isSwiping = false;

    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    if (delta < 0) {
      nextBanner();   // swipe izquierda
    } else {
      prevBanner();   // swipe derecha
    }

    resetAuto();
  });
}

function handleBannerAction(banner) {
  const { action, value } = banner;

  if (!action || !value) return;

  switch (action) {

    case "PRODUCT":
        window.location.href = buildPath(`/html/producto.html?id=${encodeURIComponent(value)}`);
        break;

    case "ANCHOR":
        // ejemplo: /#ayuda
        window.location.href = `/#${encodeURIComponent(value)}`;
        break;

    case "URL":
        // puede ser relativa o absoluta
        window.location.href = value;
        break;

    default:
      console.warn("Acción de banner desconocida:", action);
  }
}
