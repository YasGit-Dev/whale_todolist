import './style.css';

import { loadLayout } from "./js/layout.js";
import { initNavbar } from "./js/components/navbar.js";
import { initForm,initMoodTracker  } from "./js/pages/daily.js";
import { initHomeTasksPreview } from "./js/pages/home.js";

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
    
});
