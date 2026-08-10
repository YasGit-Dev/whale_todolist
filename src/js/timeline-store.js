const TIMELINE_KEY = "timelineEntries";

function getAllTimelineEntries() {
    const raw = localStorage.getItem(TIMELINE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveTimelineEntries(entries) {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries));
}

export function addTimelineEntry(text, time) {
    const entries = getAllTimelineEntries();
    const newEntry = {
        id: Date.now().toString(),
        text,
        time,
        date: new Date().toISOString().split('T')[0],
    };
    entries.push(newEntry);
    saveTimelineEntries(entries);
    return newEntry;
}

export function getTodayTimelineEntries() {
    const today = new Date().toISOString().split('T')[0];
    return getAllTimelineEntries()
        .filter((e) => e.date === today)
        .sort((a, b) => b.time.localeCompare(a.time));
}

export function deleteTimelineEntry(id) {
    const entries = getAllTimelineEntries().filter((e) => e.id !== id);
    saveTimelineEntries(entries);
}

// ============ نوتیفیکیشن/الارم ============
function getNotifiedKey() {
    const today = new Date().toISOString().split('T')[0];
    return `notified-entries-${today}`;
}

function getNotifiedIds() {
    const raw = localStorage.getItem(getNotifiedKey());
    return raw ? JSON.parse(raw) : [];
}

function markAsNotified(id) {
    const ids = getNotifiedIds();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(getNotifiedKey(), JSON.stringify(ids));
    }
}

export function getPendingNotifications(currentTime) {
    const notifiedIds = getNotifiedIds();
    return getTodayTimelineEntries().filter(
        (entry) => entry.time === currentTime && !notifiedIds.includes(entry.id)
    );
}

export function markEntryNotified(id) {
    markAsNotified(id);
}