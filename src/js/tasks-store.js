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
    return Math.round((completedCount / tasks.length) * 100);
}