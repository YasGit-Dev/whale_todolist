import '../../style.css'

const form = document.getElementById("add-task-form")
const taskInput = document.getElementById("add-task-input")
const addButton = document.getElementById("add-task-btn")
const textWrapper = document.getElementById("priority-tasks-list")


export function initForm() {

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        console.log("Form submitted");
    });

    function addTask() {
    if (taskInput.value.trim() === "") return;

    textWrapper.innerHTML += `<li data-task-id="1" class="flex items-center gap-3 rounded-2xl bg-orca-100 p-4">
              <input type="checkbox" class="task-checkbox h-5 w-5 shrink-0 accent-orca-blue-900" />
              <span class="task-label flex-1 wrap-break-word">${taskInput.value}</span>
              <button data-action="delete-task" class="shrink-0 text-orca-500 hover:text-orca-900">✕</button>
            </li>`;

    taskInput.value = "";
    taskInput.focus();
}

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});


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

// ذخیره مود انتخاب‌شده امروز در localStorage
function saveMoodToStorage(moodValue) {
  try {
    localStorage.setItem(getTodayMoodKey(), moodValue);
  } catch (err) {
    console.error('Could not save mood to localStorage:', err);
  }
}
 
// خوندن مود ذخیره‌شده امروز (اگه وجود داشته باشه)
function loadTodayMood() {
  try {
    return localStorage.getItem(getTodayMoodKey());
  } catch (err) {
    console.error('Could not read mood from localStorage:', err);
    return null;
  }
}
 
 
// آپدیت دکمه شناور (floating button) با عکس مود انتخاب‌شده
function updateFloatingMoodButton(moodValue) {
  const floatingBtn = document.getElementById('floating-mood-btn');
  if (!floatingBtn) return;
 
  floatingBtn.style.backgroundImage = `url('/src/img/mood/${moodValue}.png')`;
  floatingBtn.style.backgroundSize = 'contain';
  floatingBtn.style.backgroundPosition = 'center';
  floatingBtn.style.backgroundRepeat = 'no-repeat';
  floatingBtn.dataset.mood = moodValue;
 
  floatingBtn.classList.remove('hidden');
}
 
// هندلر اصلی: وقتی کاربر روی یکی از دکمه‌های mood کلیک می‌کنه
function handleMoodSelect(event) {
  const button = event.target.closest('.mood-btn');
  if (!button) return; // کلیک روی جای خالی بین دکمه‌ها بوده، کاری نکن
 
  const moodValue = button.dataset.mood;
  if (!moodValue) return;
 
  highlightSelectedMood(moodValue);
  saveMoodToStorage(moodValue);
  updateFloatingMoodButton(moodValue);
}

// راه‌اندازی اولیه صفحه
function initMoodTracker() {
  // اگه کاربر قبلاً امروز مودی انتخاب کرده، نمایشش بده
  const savedMood = loadTodayMood();
  if (savedMood) {
    highlightSelectedMood(savedMood);
    updateFloatingMoodButton(savedMood);
  } 
  // گوش‌دادن به کلیک روی دکمه‌های mood (با event delegation روی کانتینرشون)
  const moodOptions = document.getElementById('mood-options');
  if (moodOptions) {
    moodOptions.addEventListener('click', handleMoodSelect);
  }
}
    initMoodTracker(); // ← مستقیم صدا زده می‌شه، نه از طریق DOMContentLoaded



//زوم دکمه مود->
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
}

