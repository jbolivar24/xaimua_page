// js/guard-vendedor.js
import { getActiveToken, getActiveRole } from "../js/auth.js";
import { buildPath } from "../js/config.js";

const token = getActiveToken();
const role  = getActiveRole();

if (!token || role !== "VENDEDOR") {
  window.location.href = buildPath("/html/login.html");
}
