// js/config.js
export const API_BASE = "https://assumed-previous-bell-pam.trycloudflare.com";

// js/config.js
export const AppConfig = (() => {

    const path = window.location.pathname;

    const isGithub = path.includes("/xaimua_page/");
    const isInHtml = path.includes("/html/");

    const base = isGithub ? "/xaimua_page" : "";

    const fromHtml = isInHtml ? ".." : ".";

    return {
        base,
        fromHtml,

        link: (target) => {
            if (target.startsWith("#")) {
                return `${fromHtml}/index.html${target}`;
            }

            if (target === "index") {
                return `${fromHtml}/index.html`;
            }

            return `${fromHtml}/html/${target}.html`;
        }
    };

})();
