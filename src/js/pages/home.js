import { getTasks } from "../tasks-store.js";
import taskIconUrl from "../../img/task-icon.png"; //عکسی که دادم برای ایکن


const tasksListWrapper = document.getElementById("tasks-list");

function renderPreviewTask(task) {
    return `<div data-task-id="${task.id}" class="flex items-center gap-3 rounded-2xl bg-orca-100 p-4">
              <img src="${taskIconUrl}" alt="" class="h-5 w-5 shrink-0" />
              <span class="task-label flex-1 wrap-break-word ${task.completed ? "line-through opacity-50" : ""}">${task.text}</span>
            </div>`;
}

export function initHomeTasksPreview() {
    const tasks = getTasks().slice(0, 4);

    tasksListWrapper.innerHTML = tasks.length
        ? tasks.map(renderPreviewTask).join("")
        : `<div class="text-orca-500 text-sm">no wave, The sea is calm :) /div>`;
}




