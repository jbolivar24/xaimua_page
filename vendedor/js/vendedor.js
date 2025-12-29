// /vendedor/js/vendedor.js
import { logout } from "../../js/auth.js";

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", logout);
