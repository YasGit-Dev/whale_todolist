import confetti from 'canvas-confetti';
const STORAGE_KEY = "priorityTasks";


export function getTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTaskToStore(text) {
    const tasks = getTasks();
    const newTask = {
        id: Date.now().toString(),
        text,
        completed: false,
        date: new Date().toISOString().split('T')[0],
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

export function deleteTaskFromStore(id) {
    const tasks = getTasks().filter((t) => t.id !== id);
    saveTasks(tasks);
}

export function toggleTaskInStore(id) {
    const tasks = getTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
    saveTasks(tasks);
}

export function getTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    return getTasks().filter((task) => task.date === today);
}

export function getProgress(tasks) {
    if (tasks.length === 0) return 0;

    const completedCount = tasks.filter((t) => t.completed).length;
    const percent = Math.round((completedCount / tasks.length) * 100);

    if (percent === 100) {
        const currentIds = tasks.map((t) => t.id);
        const lockedIds = getLockedTaskIds();

        // آیا id ای هست که تازه داره قفل میشه (یعنی این یه لحظه‌ی ۱۰۰٪ جدیده)؟
        const hasNewLock = currentIds.some((id) => !lockedIds.includes(id));

        if (hasNewLock) {
            fireConfettiAboveProgressBar();
            const mergedIds = Array.from(new Set([...lockedIds, ...currentIds]));
            saveLockedTaskIds(mergedIds);
        }
    }

    return percent;
}

function fireConfettiAboveProgressBar() {
    const progressBar = document.getElementById("progress-bar-fill");
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();

    // تبدیل موقعیت المنت به نسبت 0 تا 1 از کل صفحه (که canvas-confetti نیاز داره)
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = rect.top / window.innerHeight;

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { x, y },
        colors: ['#445976', '#637a9a', '#71829e', '#8ea0b7', '#a7b6c9']
    });
}

function getTodayLockKey() {
    const today = new Date().toISOString().split('T')[0];
    return `locked-tasks-${today}`;
}

function getLockedTaskIds() {
    const raw = localStorage.getItem(getTodayLockKey());
    return raw ? JSON.parse(raw) : [];
}

function saveLockedTaskIds(ids) {
    localStorage.setItem(getTodayLockKey(), JSON.stringify(ids));
}

export function isTaskLocked(taskId) {
    return getLockedTaskIds().includes(taskId);
}