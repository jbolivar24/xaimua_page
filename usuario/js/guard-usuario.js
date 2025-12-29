// usuario/js/guard-usuario.js
import { getActiveToken, getActiveRole } from "../../js/auth.js";
import { buildPath } from "../../js/config.js";

const token = getActiveToken();
const role  = getActiveRole();

if (!token || role !== "USUARIO") {
  window.location.href = buildPath("/html/login.html");
}
