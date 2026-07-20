import './style.css'


import { loadLayout } from "./js/layout.js";
import { initNavbar } from "./js/components/navbar.js";
import { initForm } from "./js/pages/daily.js";



document.addEventListener("DOMContentLoaded", () => {
    loadLayout();
    initNavbar();
    initForm();
});

const taskInput = document.getElementById("taskInput")
const addButton = document.getElementById("addButton")
const textWrapper = document.getElementById("tasks-list")


function addTask() {
    if (taskInput.value.trim() === "") return;

    textWrapper.innerHTML += `<div class="rounded-2xl bg-orca-100 p-4 sm:p-5">${taskInput.value}</div>`;

    taskInput.value = "";
    taskInput.focus();
}

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});