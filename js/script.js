// js/script.js — handles tasks and localStorage persistence

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const stats = document.getElementById('task-stats');
const clearAllBtn = document.getElementById('clear-all');

// STORAGE KEY used to save tasks in localStorage
const STORAGE_KEY = 'neurotasks_v1';

// In-memory tasks array
let tasks = [];

/*
  How tasks are stored in localStorage:
  - The `tasks` array is serialized to JSON and saved under `STORAGE_KEY`.
  - Each task is an object: { id, text, createdAt }
*/
function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/*
  How tasks are retrieved on page load:
  - On init(), we read the JSON string from localStorage using `STORAGE_KEY`.
  - If present, parse it to restore the `tasks` array and render them.
*/
function loadTasks(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try{
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed)) tasks = parsed;
  }catch(e){
    console.warn('Failed to parse tasks from localStorage', e);
    tasks = [];
  }
}

function render(){
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    const span = document.createElement('div');
    span.className = 'task-text';
    span.textContent = task.text;

    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', `Delete task: ${task.text}`);
    btn.textContent = 'Delete';

    btn.addEventListener('click', () => removeTask(task.id, li));

    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
  stats.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
}

function addTask(text){
  const trimmed = text.trim();
  if(!trimmed) return false; // input validation: do not allow empty tasks

  const task = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), text: trimmed, createdAt: Date.now() };
  tasks.unshift(task); // newest first
  saveTasks();
  render();
  return true;
}

function removeTask(id, element){
  // animate then remove
  element.classList.add('removing');
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }, 260);
}

function clearAll(){
  if(!tasks.length) return;
  if(!confirm('Clear all tasks?')) return;
  tasks = [];
  saveTasks();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = addTask(input.value);
  if(ok){
    input.value = '';
    input.focus();
  } else {
    // subtle feedback for invalid input
    input.animate([
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' }
    ], { duration: 220, easing: 'ease' });
  }
});

clearAllBtn.addEventListener('click', clearAll);

// Keyboard accessibility: press Enter to add when input is focused is already handled by form submit

// Initialize app
function init(){
  loadTasks(); // load tasks from localStorage into `tasks` array
  render();
}

init();
