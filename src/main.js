import './style.css';

import { loadLayout } from "./js/layout.js";
import { initNavbar } from "./js/components/navbar.js";
import { initForm,initMoodTracker  } from "./js/pages/daily.js";
import { initHomeTasksPreview } from "./js/pages/home.js";
import { initNotesArchive } from "./js/notes-archive.js";
import {initExpenseTracker}from "./js/pages/expenseTracker.js";
import{initWeeklyPlanner}from "./js/pages/weekly.js";

document.addEventListener("DOMContentLoaded", () => {
    loadLayout();
    initNavbar();

    if (document.getElementById("add-task-form")) {
        initForm();
        initMoodTracker ();
    }

    if (document.getElementById("tasks-list")) {
        initHomeTasksPreview();
    }

    
if (document.getElementById("notes-list")) {
    initNotesArchive();
}

    if (document.getElementById("transaction-form")) {
        initExpenseTracker();
    }

    if (document.getElementById("days-grid")) {
        initWeeklyPlanner();
    }
    
    
});
