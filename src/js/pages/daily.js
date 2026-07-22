import { getTasks, addTaskToStore, deleteTaskFromStore, toggleTaskInStore, getTodayTasks, getProgress } from "../tasks-store.js";

// ============ بخش تسک‌ها ============
const form = document.getElementById("add-task-form");
const taskInput = document.getElementById("add-task-input");
const addButton = document.getElementById("add-task-btn");
const textWrapper = document.getElementById("priority-tasks-list");

function renderTask(task) {
    return `<li data-task-id="${task.id}" class="flex items-center gap-3 rounded-2xl bg-orca-100 p-4">
              <input type="checkbox" class="task-checkbox h-5 w-5 shrink-0 accent-orca-blue-900" ${task.completed ? "checked" : ""} />
              <span class="task-label flex-1 wrap-break-word ${task.completed ? "line-through opacity-50" : ""}">${task.text}</span>
              <button data-action="delete-task" class="shrink-0 text-orca-500 hover:text-orca-900">✕</button>
            </li>`;
}

function renderAllTasks() {
    textWrapper.innerHTML = getTasks().map(renderTask).join("");
}

function renderProgress() {
    const todayTasks = getTodayTasks();
    const percent = getProgress(todayTasks);

    const progressBar = document.getElementById("progress-bar-fill");
    const progressLabel = document.getElementById("progress-label");

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressLabel) progressLabel.textContent = `${percent}%`;
}

export function initForm() {
    renderAllTasks();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
    });

    function addTask() {
        if (taskInput.value.trim() === "") return;

        const newTask = addTaskToStore(taskInput.value.trim());
        textWrapper.insertAdjacentHTML("beforeend", renderTask(newTask));

        taskInput.value = "";
        taskInput.focus();
    }

    addButton.addEventListener("click", addTask);

    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addTask();
        }
    });

    textWrapper.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-task-id]");
        if (!li) return;
        const id = li.dataset.taskId;
        renderProgress();

        if (e.target.matches('[data-action="delete-task"]')) {
            deleteTaskFromStore(id);
            li.remove();
            renderProgress();

        } else if (e.target.matches(".task-checkbox")) {
            toggleTaskInStore(id);
            const label = li.querySelector(".task-label");
        label.classList.toggle("line-through");
        label.classList.toggle("opacity-50");
        renderProgress();
        }
        
    
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

// این تابع جدیده: برداشتن هایلایت از همه‌ی دکمه‌ها
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

// این تابع جدیده: پاک کردن مود امروز از localStorage
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

// این تابع جدیده: مخفی کردن دکمه‌ی شناور وقتی مود برداشته میشه
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

    // اگه روی همون موودی که از قبل انتخاب شده کلیک کرده → از حالت انتخاب خارجش کن
    if (currentMood === moodValue) {
        clearMoodHighlight();
        clearMoodFromStorage();
        hideFloatingMoodButton();
        return;
    }

    // در غیر این صورت، مود جدید رو انتخاب کن
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