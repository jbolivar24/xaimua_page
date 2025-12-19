// home.js
import { initBanners } from "./banners.js";
import { loadWebContent } from "./webContent.js";

document.addEventListener("DOMContentLoaded", () => {
    initBanners();
    loadWebContent();
});
