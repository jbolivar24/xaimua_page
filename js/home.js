// home.js
import { API_BASE } from "./config.js";
import { initBanners } from "./banners.js";
import { loadWebContent } from "./webContent.js";

document.addEventListener("DOMContentLoaded", () => {
    initBanners();
    loadWebContent();
});

const directBtn = document.getElementById("directDownloadBtn");
if (directBtn) {
    directBtn.href = `${API_BASE}/apk/xaimua`;
}
