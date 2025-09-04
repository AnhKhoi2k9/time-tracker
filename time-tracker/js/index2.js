
// ---------------- Sidebar logic ----------------
const pages = {
  tasks: `
    <div class="dashboard-title">Tasks</div>
    <div id="weekHeader" class="card-title"></div>
    <div class="controls">
      <button id="prevWeek">⟨ Prev</button>
      <button id="nextWeek">Next ⟩</button>
    </div>
    <div id="week" class="dashboard-grid"></div>
  `,
  calendar: `
    <div class="dashboard-title">Calendar</div>
    <div class="card">Calendar view here.</div>
  `,
  pomodoro: `
    <div class="dashboard-title">Pomodoro</div>
    <div class="card">
      <div class="pomodoro-timer" id="pomodoroTimer2">25:00</div>
      <div class="pomodoro-controls">
        <button class="pomodoro-btn" id="pomodoroStart2">Start</button>
        <button class="pomodoro-btn" id="pomodoroReset2">Reset</button>
      </div>
    </div>
  `,
  chatgpt: `
    <div class="dashboard-title">ChatGPT</div>
    <div class="card">ChatGPT chat here.</div>
  `,
  notes: `
    <div class="dashboard-title">Notes</div>
    <div id="noteHeader" class="card-title"></div>
    <div class="controls">
      <button id="prevNotesDay">⟨ Prev</button>
      <button id="nextNotesDay">Next ⟩</button>
    </div>
    <div id="notesContainer" class="dashboard-grid"></div>
  `,
  profile: `
    <div class="dashboard-title">Profile</div>
    <div class="card">Profile info here.</div>
  `,
  notifications: `
    <div class="dashboard-title">Notifications</div>
    <div class="card">Notifications here.</div>
  `,
  resources: `
    <div class="dashboard-title">Resources</div>
    <div class="card">Resources here.</div>
  `,
  lifegoals: `
    <div class="dashboard-title">Life Goals</div>
    <div class="card">Life goals here.</div>
  `
};

const sidebarLinks = document.querySelectorAll('.sidebar li');
const mainContent = document.getElementById('mainContent');

function setActive(page) {
  sidebarLinks.forEach(li => {
    li.classList.toggle('active', li.dataset.page === page);
  });

  if (page === 'dashboard') {
    renderDashboard();
  } else {
    mainContent.innerHTML = pages[page] || '';
    if (page === 'calendar') renderCalendar();
    if (page === 'pomodoro') pomodoroInit('pomodoroTimer2', 'pomodoroStart2', 'pomodoroReset2');
    if (page === 'chatgpt') chatInit();
    if (page === 'tasks') loadTasks();
    if (page === 'notes') loadNotes();
  }
}

sidebarLinks.forEach(li => {
  li.onclick = () => setActive(li.dataset.page);
});

// ---------------- Dashboard Firestore ----------------
async function renderDashboard() {
  const todayStr = new Date().toLocaleDateString();

  // Tasks
  let tasksHTML = "<ul>";
  try {
    const tasksSnap = await db.collection("tasks").get();
    if (tasksSnap.empty) {
      tasksHTML += "<li>No tasks found</li>";
    } else {
      tasksSnap.forEach(doc => {
        const task = doc.data();
        tasksHTML += `<li>${task.completed ? "✅" : "⬜"} ${task.text} 
          <span style="color:#999;">(${task.date || "No date"})</span></li>`;
      });
    }
  } catch (err) {
    console.error("Error loading tasks:", err);
    tasksHTML += "<li>Error loading tasks</li>";
  }
  tasksHTML += "</ul>";

  // Notes
  let notesHTML = "<ul>";
  try {
    const notesSnap = await db.collection("notes").get();
    if (notesSnap.empty) {
      notesHTML += "<li>No notes yet</li>";
    } else {
      notesSnap.forEach(doc => {
        const note = doc.data();
        notesHTML += `<li>${note.text}</li>`;
      });
    }
  } catch (err) {
    console.error("Error loading notes:", err);
    notesHTML += "<li>Error loading notes</li>";
  }
  notesHTML += "</ul>";

  mainContent.innerHTML = `
    <div class="dashboard-title">Dashboard</div>
    <div class="dashboard-grid">
      <div class="card" style="grid-column: span 2;">
        <div class="card-title">Welcome back!</div>
        <div>You should continue working on your tasks today.</div>
      </div>
      <div class="card">
        <div class="card-title">Today's Tasks</div>
        ${tasksHTML}
      </div>
      <div class="card">
        <div class="card-title">Notes</div>
        ${notesHTML}
      </div>
      <div class="card">
        <div class="card-title">Calendar</div>
        <div>${todayStr}</div>
      </div>
    </div>
  `;
}
// ---------------- Dummy functions ----------------
function renderCalendar() { console.log("Calendar page loaded"); }
function pomodoroInit(timerId, startId, resetId) { console.log("Pomodoro init:", timerId, startId, resetId); }
function chatInit() { console.log("ChatGPT page loaded"); }

// ---------------- Load mặc định Dashboard ----------------
setActive('dashboard');
