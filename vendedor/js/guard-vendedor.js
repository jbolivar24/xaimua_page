// js/guard-vendedor.js
import { getActiveToken, getActiveRole } from "/xaimua_page/js/auth.js";
import { buildPath } from "/xaimua_page/js/config.js";

const token = getActiveToken();
const role  = getActiveRole();

console.log("🛡️ GUARD usuario → token:", token, "role:", role);

if (!token || role !== "VENDEDOR") {
  window.location.href = buildPath("/html/login.html");
}
