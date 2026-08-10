const NOTES_DATES_KEY = "notesDates";

function getTodayNotesKey() {
    const today = new Date().toISOString().split('T')[0];
    return `notes-${today}`;
}

function getNoteDates() {
    const raw = localStorage.getItem(NOTES_DATES_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveNoteDates(dates) {
    localStorage.setItem(NOTES_DATES_KEY, JSON.stringify(dates));
}

function registerTodayInDates() {
    const today = new Date().toISOString().split('T')[0];
    const dates = getNoteDates();
    if (!dates.includes(today)) {
        dates.push(today);
        saveNoteDates(dates);
    }
}

export function saveTodayNotes(text) {
    localStorage.setItem(getTodayNotesKey(), text);
    if (text.trim() !== "") {
        registerTodayInDates();
    }
}

export function loadTodayNotes() {
    return localStorage.getItem(getTodayNotesKey()) || "";
}

export function getPastNotes() {
    const today = new Date().toISOString().split('T')[0];
    const dates = getNoteDates().filter((d) => d !== today);

    return dates
        .map((date) => ({
            date,
            text: localStorage.getItem(`notes-${date}`) || "",
        }))
        .filter((entry) => entry.text.trim() !== "")
        .sort((a, b) => b.date.localeCompare(a.date));
}