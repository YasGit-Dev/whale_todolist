import {
    getCurrentWeekNumber, getCurrentWeekYear, getWeekDayDates,
    getPriorities, addPriority, togglePriorityDone,
    getDayTasks, addDayTask, toggleDayTaskDone,
    getHabits, toggleHabitDay,
    saveWeeklyNotes, loadWeeklyNotes
} from "../weekly-store.js";

// ============ Week badges ============
function renderWeekBadges() {
    const numberBadge = document.getElementById("week-number-badge");
    const yearBadge = document.getElementById("week-year-badge");
    if (numberBadge) numberBadge.textContent = `Week ${getCurrentWeekNumber()}`;
    if (yearBadge) yearBadge.textContent = String(getCurrentWeekYear());
}

// ============ Priorities (add + paginate 3-at-a-time + double-click complete) ============
const PRIORITIES_PAGE_SIZE = 3;
let prioritiesPage = 0;

function renderPriorityItem(item) {
    return `<div data-priority-id="${item.id}" class="priority-item flex items-start gap-3 rounded-2xl bg-orca-100 p-4 select-none">
              <img src="/src/img/task-icon.png" alt="" class="mt-0.5 h-5 w-5 shrink-0 opacity-60" />
              <div class="max-h-24 w-full min-w-0 overflow-y-auto pr-1">
                <span class="priority-text block text-sm break-all whitespace-normal ${item.done ? "line-through opacity-50" : ""}">${item.text}</span>
              </div>
            </div>`;
}

function renderPriorities() {
    const allPriorities = getPriorities();
    const listEl = document.getElementById("priorities-list");
    const prevBtn = document.getElementById("priorities-prev");
    const nextBtn = document.getElementById("priorities-next");
    if (!listEl) return;

    const maxPage = Math.max(0, Math.ceil(allPriorities.length / PRIORITIES_PAGE_SIZE) - 1);
    if (prioritiesPage > maxPage) prioritiesPage = maxPage;

    const start = prioritiesPage * PRIORITIES_PAGE_SIZE;
    const pageItems = allPriorities.slice(start, start + PRIORITIES_PAGE_SIZE);

    listEl.innerHTML = pageItems.length
        ? pageItems.map(renderPriorityItem).join("")
        : `<p class="text-sm text-orca-400 md:col-span-3">No priorities yet — add your first one below.</p>`;

    const showArrows = allPriorities.length > PRIORITIES_PAGE_SIZE;
    if (prevBtn) {
        prevBtn.classList.toggle("invisible", !showArrows);
        prevBtn.disabled = prioritiesPage <= 0;
    }
    if (nextBtn) {
        nextBtn.classList.toggle("invisible", !showArrows);
        nextBtn.disabled = prioritiesPage >= maxPage;
    }
}

function setupPriorities() {
    const form = document.getElementById("add-priority-form");
    const input = document.getElementById("add-priority-input");
    const listEl = document.getElementById("priorities-list");
    const prevBtn = document.getElementById("priorities-prev");
    const nextBtn = document.getElementById("priorities-next");
    if (!form || !input || !listEl) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (input.value.trim() === "") return;

        addPriority(input.value.trim());
        input.value = "";
        input.focus();

        const total = getPriorities().length;
        prioritiesPage = Math.max(0, Math.ceil(total / PRIORITIES_PAGE_SIZE) - 1);
        renderPriorities();
    });

    listEl.addEventListener("dblclick", (e) => {
        const item = e.target.closest(".priority-item");
        if (!item) return;
        togglePriorityDone(item.dataset.priorityId);
        renderPriorities();
    });

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prioritiesPage--;
            renderPriorities();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            prioritiesPage++;
            renderPriorities();
        });
    }
}

// ============ Days grid (real dates + "Any day", per-card scroll, focus-only whale bg) ============
function renderDayTaskItem(task) {
    return `<div data-task-id="${task.id}" class="day-task-item flex items-center gap-2 border-b border-dashed border-orca-200 pb-2 select-none">
              <span class="day-task-text w-full text-sm break-words ${task.done ? "line-through opacity-50" : ""}">${task.text}</span>
            </div>`;
}

function renderDayCard(day) {
    const dayKey = day.dayIndex !== undefined ? String(day.dayIndex) : "any";
    const tasks = getDayTasks(dayKey);

    const taskItems = tasks.length
        ? tasks.map(renderDayTaskItem).join("")
        : `<p class="text-xs text-orca-400">No tasks yet</p>`;

    const dateLabel = day.label ? `<span class="shrink-0 text-xs text-orca-blue-900">${day.label}</span>` : "";

    return `<div data-day-key="${dayKey}" class="day-card group relative min-w-0 rounded-3xl bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
              <div class="pointer-events-none absolute right-0 bottom-0 h-32 w-32 bg-[url('/src/img/orca_whale_diving.png')] bg-contain bg-no-repeat opacity-0 transition-opacity duration-300 group-focus-within:opacity-10 group-hover:opacity-10"></div>

              <div class="relative mb-4 flex items-center justify-between gap-2">
                <h3 class="truncate text-lg font-bold text-orca-900">${day.name}</h3>
                ${dateLabel}
              </div>

              <div class="day-task-list relative mb-3 max-h-44 space-y-3 overflow-y-auto overscroll-contain pr-1">
                ${taskItems}
              </div>

              <form class="day-task-form relative flex gap-2">
                <input type="text" placeholder="Add a task…" class="day-task-input w-full min-w-0 rounded-full border-0 bg-orca-100 px-3 py-2 text-sm outline-none placeholder:text-orca-400 focus:ring-2 focus:ring-orca-blue-900/30" />
              </form>
            </div>`;
}


function renderEmptyDayTasks() {
  return Array.from({ length: 4 }, () => `
    <div
      class="
        day-task-item
        flex
        min-h-10
        items-center
        rounded-lg
        border
        border-orca-200/20
        px-3
        text-sm
        text-orca-200/50
      "
    >
      Put your task
    </div>
  `).join("");
}


function renderDaysGrid() {
    const grid = document.getElementById("days-grid");
    if (!grid) return;

    const allDays = [...getWeekDayDates(), { name: "Any day", label: null }];
    grid.innerHTML = allDays.map(renderDayCard).join("");
}

function refreshDayTaskList(dayKey) {
  const card = document.querySelector(
    `.day-card[data-day-key="${dayKey}"]`
  );

  if (!card) return;

  const list = card.querySelector(".day-task-list");
  if (!list) return;

  const tasks = getDayTasks(dayKey);

  if (tasks.length === 0) {
    list.innerHTML = renderEmptyDayTasks();
    return;
  }

  list.innerHTML = tasks
    .map(
      (task) => `
        <div
          class="day-task-item"
          data-task-id="${task.id}"
        >
          ${task.text}
        </div>
      `
    )
    .join("");
}

function setupDaysGrid() {
    const grid = document.getElementById("days-grid");
    if (!grid) return;

    grid.addEventListener("submit", (e) => {
        const form = e.target.closest(".day-task-form");
        if (!form) return;
        e.preventDefault();

        const card = form.closest(".day-card");
        const dayKey = card.dataset.dayKey;
        const input = form.querySelector(".day-task-input");
        if (input.value.trim() === "") return;

        addDayTask(dayKey, input.value.trim());
        input.value = "";
        refreshDayTaskList(dayKey);
    });

    grid.addEventListener("dblclick", (e) => {
        const item = e.target.closest(".day-task-item");
        if (!item) return;

        const card = item.closest(".day-card");
        const dayKey = card.dataset.dayKey;
        toggleDayTaskDone(dayKey, item.dataset.taskId);
        refreshDayTaskList(dayKey);
    });
}

// ============ Habit tracker (click to toggle whale-image state) ============
function renderHabitDots(habitName, filledArray) {
  return filledArray
    .map(
      (isFilled, dayIndex) => `
        <button
          type="button"
          data-habit="${habitName}"
          data-day-index="${dayIndex}"
          class="
            habit-dot
            h-4
            flex-1
            min-w-0
            rounded-full
            border
            bg-contain
            bg-center
            bg-no-repeat
            transition
            sm:h-4
            md:h-7
            lg:h-6
            xl:h-7
            ${
              isFilled
                ? "border-white bg-white"
                : "border-orca-200 bg-orca-50"
            }
          "
          style="${
            isFilled
              ? "background-image:url('/src/img/orca_whale_front_view.png')"
              : ""
          }"
        ></button>
      `
    )
    .join("");
}

function renderHabitRow(habitName, filledArray) {
    return `<div class="flex items-center gap-2 sm:gap-4">
              <span class="w-16 shrink-0 truncate text-xs text-orca-700 sm:w-24 sm:text-sm">${habitName}</span>
              <div class="grid flex-1 grid-cols-7 gap-1.5 sm:gap-2">
                ${renderHabitDots(habitName, filledArray)}
              </div>
            </div>`;
}

function renderHabitTracker() {
    const habitList = document.getElementById("habit-list");
    if (!habitList) return;

    const habits = getHabits();
    habitList.innerHTML = Object.entries(habits)
        .map(([name, filledArray]) => renderHabitRow(name, filledArray))
        .join("");
}

function setupHabitTracker() {
    const habitList = document.getElementById("habit-list");
    if (!habitList) return;

    habitList.addEventListener("click", (e) => {
        const dot = e.target.closest(".habit-dot");
        if (!dot) return;

        toggleHabitDay(dot.dataset.habit, Number(dot.dataset.dayIndex));
        renderHabitTracker();
    });
}

// ============ Notes (auto-save, scoped to current week) ============
function setupWeeklyNotes() {
    const textarea = document.getElementById("weekly-notes-textarea");
    if (!textarea) return;

    textarea.value = loadWeeklyNotes();

    let debounceTimer = null;
    textarea.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            saveWeeklyNotes(textarea.value);
        }, 500);
    });
}

// ============ Init ============
export function initWeeklyPlanner() {
    renderWeekBadges();

    renderPriorities();
    setupPriorities();

    renderDaysGrid();
    setupDaysGrid();


    renderHabitTracker();
    setupHabitTracker();

    renderEmptyDayTasks();
    setupWeeklyNotes();
}