import navbar from "../components/navbar.html?raw";
import footer from "../components/footer.html?raw";

export function loadLayout() {

            console.log("loadLayout called"); // ⬅️ اضافه کن
    console.log("navbar content:", navbar); // ⬅️ اضافه کن

    const nav = document.querySelector("#navbar");
    const foot = document.querySelector("#footer");

        console.log("nav element found:", nav); // ⬅️ اضافه کن


    if (nav) nav.innerHTML = navbar;
    if (foot) foot.innerHTML = footer;
}