// ============ Week identity (real date based, auto-resets every ISO week) ============
function getISODate(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function getISOWeekInfo(date = new Date()) {
    const d = getISODate(date);
    const dayNum = d.getUTCDay() || 7; // Monday=1 ... Sunday=7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // move to Thursday of this ISO week
    const isoYear = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { weekNumber, isoYear };
}

export function getCurrentWeekKey() {
    const { weekNumber, isoYear } = getISOWeekInfo();
    return `${isoYear}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getCurrentWeekNumber() {
    return getISOWeekInfo().weekNumber;
}

export function getCurrentWeekYear() {
    return getISOWeekInfo().isoYear;
}

function getMondayOfCurrentWeek() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun..6=Sat
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
}

export function getWeekDayDates() {
    const monday = getMondayOfCurrentWeek();
    const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return names.map((name, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return { name, label, dayIndex: index };
    });
}

// ============ Generic per-week storage helper ============
function readJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ============ Priorities ============
function prioritiesKey() {
    return `weekly-priorities-${getCurrentWeekKey()}`;
}

export function getPriorities() {
    return readJSON(prioritiesKey(), []);
}

export function addPriority(text) {
    const priorities = getPriorities();
    const newItem = { id: Date.now().toString(), text, done: false };
    priorities.push(newItem);
    writeJSON(prioritiesKey(), priorities);
    return newItem;
}

export function togglePriorityDone(id) {
    const priorities = getPriorities();
    const item = priorities.find((p) => p.id === id);
    if (item) item.done = !item.done;
    writeJSON(prioritiesKey(), priorities);
}

// ============ Day tasks (7 real days + "any") ============
function dayTasksKey(dayKey) {
    return `weekly-daytasks-${getCurrentWeekKey()}-${dayKey}`;
}

export function getDayTasks(dayKey) {
    return readJSON(dayTasksKey(dayKey), []);
}

export function addDayTask(dayKey, text) {
    const tasks = getDayTasks(dayKey);
    const newItem = { id: Date.now().toString(), text, done: false };
    tasks.push(newItem);
    writeJSON(dayTasksKey(dayKey), tasks);
    return newItem;
}

export function toggleDayTaskDone(dayKey, id) {
    const tasks = getDayTasks(dayKey);
    const item = tasks.find((t) => t.id === id);
    if (item) item.done = !item.done;
    writeJSON(dayTasksKey(dayKey), tasks);
}

// ============ Habit tracker ============
function habitsKey() {
    return `weekly-habits-${getCurrentWeekKey()}`;
}

const DEFAULT_HABITS = ["Water", "Exercise", "Reading"];

export function getHabits() {
    const stored = readJSON(habitsKey(), null);
    if (stored) return stored;

    const fresh = {};
    DEFAULT_HABITS.forEach((name) => {
        fresh[name] = [false, false, false, false, false, false, false];
    });
    writeJSON(habitsKey(), fresh);
    return fresh;
}

export function toggleHabitDay(habitName, dayIndex) {
    const habits = getHabits();
    if (!habits[habitName]) return;
    habits[habitName][dayIndex] = !habits[habitName][dayIndex];
    writeJSON(habitsKey(), habits);
}

// ============ Notes ============
function notesKey() {
    return `weekly-notes-${getCurrentWeekKey()}`;
}

export function saveWeeklyNotes(text) {
    localStorage.setItem(notesKey(), text);
}

export function loadWeeklyNotes() {
    return localStorage.getItem(notesKey()) || "";
}