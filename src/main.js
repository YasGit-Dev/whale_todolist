import './style.css'


import { loadLayout } from "./js/layout.js";
import { initNavbar } from "./js/components/navbar.js";

document.addEventListener("DOMContentLoaded", () => {
    loadLayout();
    initNavbar();
});