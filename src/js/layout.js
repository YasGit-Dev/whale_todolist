import navbar from "../components/navbar.html?raw";
import footer from "../components/footer.html?raw";

export function loadLayout() {
    const nav = document.querySelector("#navbar");
    const foot = document.querySelector("#footer");

    if (nav) nav.innerHTML = navbar;
    if (foot) foot.innerHTML = footer;
}