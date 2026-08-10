import { getPastNotes } from "./notes-store.js";

const notesListWrapper = document.getElementById("notes-list");

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function renderNoteEntry(entry) {
    return `<div class="rounded-2xl bg-white p-5 shadow">
              <h3 class="text-sm font-semibold text-orca-blue-900 mb-2">${formatDate(entry.date)}</h3>
              <p class="text-orca-700 whitespace-pre-wrap">${entry.text}</p>
            </div>`;
}

export function initNotesArchive() {
    const pastNotes = getPastNotes();

    notesListWrapper.innerHTML = pastNotes.length
        ? pastNotes.map(renderNoteEntry).join("")
        : `<p class="text-orca-400 text-sm">No past notes yet</p>`;
}