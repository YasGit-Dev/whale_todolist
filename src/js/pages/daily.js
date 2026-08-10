import {
    getTasks, addTaskToStore, deleteTaskFromStore, toggleTaskInStore,
    getTodayTasks, getProgress, isTaskLocked, getTopics, addTopic, removeTopic,
    getLockedTasksForToday
} from "../tasks-store.js";

import {
    addTimelineEntry, getTodayTimelineEntries, deleteTimelineEntry,
    getPendingNotifications, markEntryNotified
} from "../timeline-store.js";

import { saveTodayNotes, loadTodayNotes
} from "../notes-store.js";

// ============ Elements ============
const form = document.getElementById("add-task-form");
const taskInput = document.getElementById("add-task-input");
const topicInput = document.getElementById("add-task-topic");
const addButton = document.getElementById("add-task-btn");
const textWrapper = document.getElementById("priority-tasks-list");
const topicsWrapper = document.getElementById("topics-list");
const addTopicBtn = document.getElementById("add-topic-btn");
const prevBtn = document.getElementById("page-prev");
const nextBtn = document.getElementById("page-next");
const completedToggle = document.getElementById("completed-toggle");
const completedToggleLabel = document.getElementById("completed-toggle-label");
const completedWrapper = document.getElementById("completed-tasks-list");
const heroForm = document.getElementById("hero-task-form");
const heroTaskInput = document.getElementById("add-task-input1");
const heroTimeInput = document.getElementById("add-task-time1");
const timelineList = document.getElementById("timeline-list");
const notesTextarea = document.getElementById("notes-textarea");


const PAGE_SIZE = 5;
let activeTopic = null;
let currentPage = 0;

// ============ Render: Task item ============
function renderTask(task) {
    const locked = isTaskLocked(task.id);
    return `<li data-task-id="${task.id}" class="flex items-center gap-3 rounded-2xl bg-orca-100 p-4 select-none">
              <input type="checkbox" class="task-checkbox h-5 w-5 shrink-0 accent-orca-blue-900" ${task.completed ? "checked" : ""} ${locked ? "disabled" : ""} />
              <span class="task-label flex-1 wrap-break-word ${task.completed ? "line-through opacity-50" : ""}">${task.text}</span>
              <button data-action="delete-task" class="shrink-0 text-orca-500 hover:text-orca-900 disabled:opacity-30" ${locked ? "disabled" : ""}>✕</button>
            </li>`;
}

// ============ Render: Topics tabs ============
function renderTopics() {
    const topics = getTopics();
    if (!activeTopic || !topics.includes(activeTopic)) {
        activeTopic = topics[0] || null;
    }
    topicsWrapper.innerHTML = topics.map((topic) => {
        const isActive = topic === activeTopic;
        const canDelete = topic !== "General";

        return `<div data-topic-item="${topic}" class="topic-item flex items-center gap-1 rounded-full px-1 py-0.5 transition-colors">
                  ${canDelete ? `
                    <button data-delete-topic="${topic}" class="topic-delete-btn mr-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200">
                      <svg class="h-4 w-4 text-orca-500 hover:text-orca-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ` : ""}
                  <button data-topic="${topic}" class="topic-btn pb-1 text-sm font-semibold uppercase italic ${isActive ? "border-b-2 border-orca-blue-900 text-orca-900" : "text-orca-500"}">${topic}</button>
                </div>`;
    }).join("");
}


// ============ Render: Topic datalist (برای فیلد اضافه‌کردن تسک) ============
// ⬅️ این تابع الان بیرون از initForm هست، پس renderEverything می‌تونه ببیندش
function renderTopicSelect() {
    const topics = getTopics();
    const datalist = document.getElementById("topic-options");
    if (!datalist) return;
    datalist.innerHTML = topics.map((topic) =>
        `<option value="${topic}"></option>`
    ).join("");
}

function setupLongPress() {
    const LONG_PRESS_DURATION = 500;
    let pressTimer = null;

    function showDeleteButton(item) {
        // پاک کردن حالت قبلی از همه‌ی تاپیک‌ها
        document.querySelectorAll(".topic-item.pressed").forEach((el) => {
            el.classList.remove("pressed");
        });
        document.querySelectorAll(".topic-delete-btn.show").forEach((btn) => {
            btn.classList.remove("show");
        });

        item.classList.add("pressed"); // ⬅️ قاب/بک‌گراند رو نشون بده
        const deleteBtn = item.querySelector(".topic-delete-btn");
        if (deleteBtn) deleteBtn.classList.add("show"); // ⬅️ آیکون حذف رو نشون بده
    }

    function startPress(e) {
        const item = e.target.closest(".topic-item");
        if (!item) return;

        pressTimer = setTimeout(() => {
            showDeleteButton(item);
        }, LONG_PRESS_DURATION);
    }

    function cancelTimerOnly() {
        clearTimeout(pressTimer);
    }

    topicsWrapper.addEventListener("mousedown", startPress);
    topicsWrapper.addEventListener("touchstart", startPress);
    topicsWrapper.addEventListener("mouseup", cancelTimerOnly);
    topicsWrapper.addEventListener("mouseleave", cancelTimerOnly);
    topicsWrapper.addEventListener("touchend", cancelTimerOnly);
    topicsWrapper.addEventListener("touchcancel", cancelTimerOnly);

    document.addEventListener("click", (e) => {
        if (!topicsWrapper.contains(e.target)) {
            document.querySelectorAll(".topic-item.pressed").forEach((el) => {
                el.classList.remove("pressed");
            });
            document.querySelectorAll(".topic-delete-btn.show").forEach((btn) => {
                btn.classList.remove("show");
            });
        }
    });
}

// ============ Task list filtering + pagination ============
function getFilteredTasks() {
    return getTodayTasks().filter((t) => (t.topic || "General") === activeTopic && !isTaskLocked(t.id));
}

function renderTaskList() {
    const filtered = getFilteredTasks();
    const start = currentPage * PAGE_SIZE;
    const pageTasks = filtered.slice(start, start + PAGE_SIZE);

    textWrapper.innerHTML = pageTasks.map(renderTask).join("");

    const maxPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);
    prevBtn.disabled = currentPage <= 0;
    nextBtn.disabled = currentPage >= maxPage;
}

// ============ Progress bar ============
function renderProgress() {
    const todayTasks = getTodayTasks();
    const percent = getProgress(todayTasks);

    const progressBar = document.getElementById("progress-bar-fill");
    const progressLabel = document.getElementById("progress-label");

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}%`;
}

// ============ Completed (locked) tasks ============
function renderCompletedTask(task) {
    return `<li class="flex items-center gap-2 text-xs text-orca-400 select-none">
              <span class="h-2 w-2 rounded-full bg-orca-blue-300 shrink-0"></span>
              <span class="line-through">${task.text}</span>
            </li>`;
}

function renderCompletedTasks() {
    const locked = getLockedTasksForToday().filter((t) => (t.topic || "General") === activeTopic);

    completedToggleLabel.textContent = `${locked.length} task${locked.length !== 1 ? "s" : ""} completed today`;

    completedWrapper.innerHTML = locked.length
        ? locked.map(renderCompletedTask).join("")
        : `<li class="text-orca-300 text-xs">Nothing yet</li>`;
}


// ============ Init ============
export function initForm() {
    renderEverything();
    setupLongPress();
    setupTimelineLongPress();
    setupNotes();



        heroForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (heroTaskInput.value.trim() === "" || heroTimeInput.value === "") return;

        addTimelineEntry(heroTaskInput.value.trim(), heroTimeInput.value);

        heroTaskInput.value = "";
        heroTimeInput.value = "";
        heroTaskInput.focus();


        renderTimeline();
    });





    form.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    function addTask() {
        if (taskInput.value.trim() === "") return;

        addTaskToStore(taskInput.value.trim(), topicInput.value.trim());

        taskInput.value = "";
        topicInput.value = "";
        taskInput.focus();

        renderEverything();
        
    }

    addButton.addEventListener("click", addTask);

   form.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        addTask();
    }
});

     topicsWrapper.addEventListener("click", (e) => {
    // اول چک کن آیا روی دکمه‌ی حذف کلیک شده
    const deleteBtn = e.target.closest("[data-delete-topic]");
    if (deleteBtn) {
        const topicName = deleteBtn.dataset.deleteTopic;
        const confirmed = confirm(`Delete topic "${topicName}"? Its tasks will move to General.`);
        if (!confirmed) return;

        removeTopic(topicName);

        if (activeTopic === topicName) {
            activeTopic = null; // اجازه بده renderTopics دوباره تاپیک اول رو انتخاب کنه
        }

        currentPage = 0;
        renderEverything();
        return;
    }

    // بعد چک کن آیا روی خود تب تاپیک کلیک شده
    const btn = e.target.closest(".topic-btn");
    if (!btn) return;

    activeTopic = btn.dataset.topic;
    currentPage = 0;
    renderTopics();
    renderTaskList();
    renderCompletedTasks();
});



    addTopicBtn.addEventListener("click", () => {
        const name = prompt("Enter topic name:");
        if (!name || name.trim() === "") return;

        addTopic(name.trim());
        activeTopic = name.trim();
        currentPage = 0;
        renderEverything();
    });

    prevBtn.addEventListener("click", () => {
        currentPage--;
        renderTaskList();
    });

    nextBtn.addEventListener("click", () => {
        currentPage++;
        renderTaskList();
    });

    completedToggle.addEventListener("click", () => {
        completedWrapper.classList.toggle("hidden");
        completedToggle.classList.toggle("completed-open");
    });

    textWrapper.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-task-id]");
        if (!li) return;
        const id = li.dataset.taskId;

        if (e.target.matches('[data-action="delete-task"]')) {
            if (isTaskLocked(id)) return;
            deleteTaskFromStore(id);
            renderEverything();
        } else if (e.target.matches(".task-checkbox")) {
            if (isTaskLocked(id)) return;
            toggleTaskInStore(id);
            renderEverything();
        }
    });

    timelineList.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest('[data-action="delete-entry"]');
    if (!deleteBtn) return;

    const li = deleteBtn.closest("li[data-entry-id]");
    const id = li.dataset.entryId;

    deleteTimelineEntry(id);
    renderTimeline();
});

}

// ============ بخش Mood ============
function getTodayMoodKey() {
    const today = new Date().toISOString().split('T')[0];
    return `mood-${today}`;
}

function highlightSelectedMood(moodValue) {
    const buttons = document.querySelectorAll('.mood-btn');
    buttons.forEach((btn) => {
        const isSelected = btn.dataset.mood === moodValue;
        btn.classList.toggle('ring-2', isSelected);
        btn.classList.toggle('ring-orca-blue-900', isSelected);
        btn.classList.toggle('ring-offset-2', isSelected);
        btn.classList.toggle('scale-110', isSelected);
    });
}

function clearMoodHighlight() {
    const buttons = document.querySelectorAll('.mood-btn');
    buttons.forEach((btn) => {
        btn.classList.remove('ring-2', 'ring-orca-blue-900', 'ring-offset-2', 'scale-110');
    });
}

function saveMoodToStorage(moodValue) {
    try {
        localStorage.setItem(getTodayMoodKey(), moodValue);
    } catch (err) {
        console.error('Could not save mood to localStorage:', err);
    }
}

function clearMoodFromStorage() {
    try {
        localStorage.removeItem(getTodayMoodKey());
    } catch (err) {
        console.error('Could not clear mood from localStorage:', err);
    }
}

function loadTodayMood() {
    try {
        return localStorage.getItem(getTodayMoodKey());
    } catch (err) {
        console.error('Could not read mood from localStorage:', err);
        return null;
    }
}

function updateFloatingMoodButton(moodValue) {
    const floatingBtn = document.getElementById('floating-mood-btn');
    if (!floatingBtn) return;
    floatingBtn.style.backgroundImage = `url('/src/img/mood/${moodValue}.png')`;
    floatingBtn.style.backgroundSize = 'contain';
    floatingBtn.style.backgroundPosition = 'center';
    floatingBtn.style.backgroundRepeat = 'no-repeat';
    floatingBtn.dataset.mood = moodValue;
    floatingBtn.classList.remove('hidden');
    floatingBtn.classList.add('mood-pulse-active');
}

function hideFloatingMoodButton() {
    const floatingBtn = document.getElementById('floating-mood-btn');
    if (!floatingBtn) return;
    floatingBtn.classList.add('hidden');
    floatingBtn.classList.remove('mood-pulse-active');
    delete floatingBtn.dataset.mood;
}

function handleMoodSelect(event) {
    const button = event.target.closest('.mood-btn');
    if (!button) return;
    const moodValue = button.dataset.mood;
    if (!moodValue) return;

    const currentMood = loadTodayMood();

    if (currentMood === moodValue) {
        clearMoodHighlight();
        clearMoodFromStorage();
        hideFloatingMoodButton();
        return;
    }

    highlightSelectedMood(moodValue);
    saveMoodToStorage(moodValue);
    updateFloatingMoodButton(moodValue);
}

export function initMoodTracker() {
    const savedMood = loadTodayMood();
    if (savedMood) {
        highlightSelectedMood(savedMood);
        updateFloatingMoodButton(savedMood);
    }

    const moodOptions = document.getElementById('mood-options');
    if (moodOptions) {
        moodOptions.addEventListener('click', handleMoodSelect);
    }
}

function renderTimelineItem(entry) {
    return `<li data-entry-id="${entry.id}" data-time="${entry.time}" class="timeline-item relative flex items-start gap-2 select-none">
              <button data-action="delete-entry" class="timeline-delete-btn shrink-0 text-orca-300 opacity-0 max-w-0 overflow-hidden transition-all duration-200 hover:text-orca-navy-600">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="timeline-content">
                <span class="absolute -right-6.5 top-1 h-3 w-3 rounded-full bg-orca-blue-900"></span>
                <span class="text-sm font-semibold text-orca-blue-900">${entry.time}</span>
                <p class="text-orca-700">${entry.text}</p>
              </div>
            </li>`;
}

function renderTimeline() {
    const entries = getTodayTimelineEntries();
    timelineList.innerHTML = entries.length
        ? entries.map(renderTimelineItem).join("")
        : `<li class="text-orca-400 text-sm">No scheduled items for today</li>`;
}



function setupTimelineLongPress() {
    const LONG_PRESS_DURATION = 500;
    let pressTimer = null;

    function showDeleteButton(item) {
        document.querySelectorAll(".timeline-delete-btn.show").forEach((btn) => {
            btn.classList.remove("show");
        });

        const deleteBtn = item.querySelector(".timeline-delete-btn");
        if (deleteBtn) deleteBtn.classList.add("show");
    }

    function startPress(e) {
         const content = e.target.closest(".timeline-content");
    if (!content) return;

    const item = content.closest(".timeline-item");
    if (!item) return;

        pressTimer = setTimeout(() => {
            showDeleteButton(item);
        }, LONG_PRESS_DURATION);
    }

    function cancelTimerOnly() {
        clearTimeout(pressTimer);
    }

    timelineList.addEventListener("mousedown", startPress);
    timelineList.addEventListener("touchstart", startPress);

    timelineList.addEventListener("mouseup", cancelTimerOnly);
    timelineList.addEventListener("mouseleave", cancelTimerOnly);
    timelineList.addEventListener("touchend", cancelTimerOnly);
    timelineList.addEventListener("touchcancel", cancelTimerOnly);

    document.addEventListener("click", (e) => {
        if (!timelineList.contains(e.target)) {
            document.querySelectorAll(".timeline-delete-btn.show").forEach((btn) => {
                btn.classList.remove("show");
            });
        }
    });
}


function setupNotes() {
    if (!notesTextarea) return;

    notesTextarea.value = loadTodayNotes();

    let debounceTimer = null;
    notesTextarea.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            saveTodayNotes(notesTextarea.value);
        }, 500);
    });
}



// ============ Render everything together ============
function renderEverything() {
    renderTopics();
    renderTopicSelect();
    renderProgress();   // اول: اینجا قفل فعال می‌شه (اگه ۱۰۰٪ شده باشه)
    renderTaskList();   // بعد: حالا می‌دونه کدوم قفله، پس فیلترش می‌کنه و از لیست حذف می‌شه
    renderCompletedTasks(); //  و همینجا هم نمایششون می‌ده
    renderTimeline();
}
