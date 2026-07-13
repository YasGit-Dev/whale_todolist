export function initNavbar() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const iconOpen = document.getElementById("menu-icon-open");
    const iconClose = document.getElementById("menu-icon-close");

    if (!menuBtn || !menu || !iconOpen || !iconClose) {return;}

    menuBtn.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("flex");
        menu.classList.toggle("hidden");
        iconOpen.classList.toggle("hidden");
        iconClose.classList.toggle("hidden");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
}