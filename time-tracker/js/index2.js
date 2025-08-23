import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase config của bạn
const firebaseConfig = {
    apiKey: "AIzaSyDpdBTdauiwq0RU1lic4kBlMoVbjdW4-co",
    authDomain: "yghgjhg.firebaseapp.com",
    projectId: "yghgjhg",
    storageBucket: "yghgjhg.firebasestorage.app",
    messagingSenderId: "164220086048",
    appId: "1:164220086048:web:25f38250b06d16d2b7d945",
    measurementId: "G-ZF9FRKRCF9"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pages = {
  dashboard: `
    <div class="dashboard-title">Dashboard</div>
    <div class="dashboard-grid">
      <div class="card" style="grid-column: span 2;">
        <div class="card-title">Welcome back!</div>
        <div>You should continue working on Math course today.</div>
        <div class="card-stats">
          <div class="stat-box">
            <div style="font-size:15px;">Tasks Completed</div>
            <div style="font-size:22px;font-weight:700;">5</div>
          </div>
          <div class="stat-box">
            <div style="font-size:15px;">Time Spent</div>
            <div style="font-size:22px;font-weight:700;">3h 45m</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Tasks</div>
        <div class="card-tasks"><input type="checkbox" checked> Write essay <span style="float:right;color:#bdbdbd;">Today</span></div>
        <div class="card-tasks"><input type="checkbox"> Read Chapter 5 <span style="float:right;color:#bdbdbd;">June 13</span></div>
        <div class="card-tasks"><input type="checkbox"> Complete problem set <span style="float:right;color:#bdbdbd;">June 14</span></div>
        <div class="card-tasks"><input type="checkbox"> Review notes <span style="float:right;color:#bdbdbd;">June 15</span></div>
      </div>
      <div class="card">
        <div class="card-title">Calendar</div>
        <div class="calendar">
          <div class="calendar-header">
            <span id="calPrev" style="cursor:pointer;">&#60;</span>
            <span id="calMonth"></span>
            <span id="calNext" style="cursor:pointer;">&#62;</span>
          </div>
          <table class="calendar-table" id="calendarTable"></table>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Pomodoro</div>
        <div class="pomodoro-timer" id="pomodoroTimer">25:00</div>
        <div class="pomodoro-controls">
          <button class="pomodoro-btn" id="pomodoroStart">Start</button>
          <button class="pomodoro-btn" id="pomodoroReset">Reset</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">ChatGPT</div>
        <div class="chat-box" id="chatBox">Send a message...</div>
        <input class="chat-input" id="chatInput" placeholder="Type a message...">
        <button class="chat-send-btn" id="chatSend">Send</button>
      </div>
      <div class="card">
        <div class="card-title">Notes</div>
        <ul class="notes-list">
          <li>Lecture: Photosynthesis</li>
          <li>Research Topics</li>
          <li>Meeting with Advisor</li>
        </ul>
      </div>
    </div>
  `,
  tasks: `<div class="dashboard-title">Tasks</div><div class="card">Your tasks will be shown here.</div>`,
  calendar: `<div class="dashboard-title">Calendar</div><div class="card">Calendar view here.</div>`,
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
  chatgpt: `<div class="dashboard-title">ChatGPT</div><div class="card">ChatGPT chat here.</div>`,
  notes: `<div class="dashboard-title">Notes</div><div class="card">Your notes will be shown here.</div>`,
  profile: `<div class="dashboard-title">Profile</div><div class="card">Profile info here.</div>`,
  notifications: `<div class="dashboard-title">Notifications</div><div class="card">Notifications here.</div>`,
  resources: `<div class="dashboard-title">Resources</div><div class="card">Resources here.</div>`,
  lifegoals: `<div class="dashboard-title">Life Goals</div><div class="card">Life goals here.</div>`
};

const sidebarLinks = document.querySelectorAll('.sidebar li');
const mainContent = document.getElementById('mainContent');

function setActive(page) {
  sidebarLinks.forEach(li => {
    li.classList.toggle('active', li.dataset.page === page);
  });
  mainContent.innerHTML = pages[page] || '';
  if (page === 'dashboard') {
    renderCalendar();
    pomodoroInit('pomodoroTimer', 'pomodoroStart', 'pomodoroReset');
    chatInit();
  }
  if (page === 'pomodoro') {
    pomodoroInit('pomodoroTimer2', 'pomodoroStart2', 'pomodoroReset2');
  }
}

sidebarLinks.forEach(li => {
  li.onclick = () => setActive(li.dataset.page);
});

// Load dashboard by default
setActive('dashboard');

// Pomodoro timer logic
function pomodoroInit(timerId, startId, resetId) {
  let timer = 25 * 60;
  let interval = null;
  const timerEl = document.getElementById(timerId);
  const startBtn = document.getElementById(startId);
  const resetBtn = document.getElementById(resetId);

  function updateTimer() {
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    timerEl.textContent = `${min}:${sec}`;
  }
  updateTimer();

  if (startBtn) {
    startBtn.onclick = function() {
      if (interval) return;
      interval = setInterval(() => {
        if (timer > 0) {
          timer--;
          updateTimer();
        } else {
          clearInterval(interval);
          interval = null;
        }
      }, 1000);
    };
  }
  if (resetBtn) {
    resetBtn.onclick = function() {
      timer = 25 * 60;
      updateTimer();
      clearInterval(interval);
      interval = null;
    };
  }
}

// Simple chat demo
function chatInit() {
  const chatBox = document.getElementById('chatBox');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  if (chatSend) {
    chatSend.onclick = function() {
      if (chatInput.value.trim()) {
        chatBox.textContent = chatInput.value;
        chatInput.value = '';
      }
    };
  }
}

// Calendar logic
function renderCalendar() {
  const calendarTable = document.getElementById('calendarTable');
  const calMonth = document.getElementById('calMonth');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');
  let today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();

  function drawCalendar() {
    calMonth.textContent = `${today.toLocaleString('default', {month:'long'})} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    let html = '<tr>';
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => html += `<th>${d}</th>`);
    html += '</tr><tr>';
    for (let i = 0; i < firstDay; i++) html += '<td></td>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isActive = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
      html += `<td${isActive ? ' class="active"' : ''}>${d}</td>`;
      if ((firstDay + d) % 7 === 0) html += '</tr><tr>';
    }
    html += '</tr>';
    calendarTable.innerHTML = html;
  }
  drawCalendar();
  calPrev.onclick = () => {
    month--;
    if (month < 0) { month = 11; year--; }
    today = new Date(year, month, 1);
    drawCalendar();
  };
  calNext.onclick = () => {
    month++;
    if (month > 11) { month = 0; year++; }
    today = new Date(year, month, 1);
    drawCalendar();
  };
}

async function renderDashboard() {
  const mainContent = document.getElementById('mainContent');
  const todayStr = new Date().toISOString().slice(0, 10);

  // Lấy tasks hôm nay
  const tasksQuery = query(collection(db, "tasks"), where("date", "==", todayStr));
  const tasksSnap = await getDocs(tasksQuery);
  const todayTasks = tasksSnap.docs.map(doc => doc.data());

  // Lấy notes hôm nay
  const notesQuery = query(collection(db, "notes"), where("date", "==", todayStr));
  const notesSnap = await getDocs(notesQuery);
  const todayNotes = notesSnap.docs.map(doc => doc.data());

  mainContent.innerHTML = `
    <h2>Dashboard - ${todayStr}</h2>
    <section>
      <h3>Today's Tasks</h3>
      <ul>
        ${todayTasks.length ? todayTasks.map(t => `<li>${t.text}</li>`).join('') : '<li>No tasks for today.</li>'}
      </ul>
    </section>
    <section>
      <h3>Today's Notes</h3>
      <ul>
        ${todayNotes.length ? todayNotes.map(n => `<li>${n.text}</li>`).join('') : '<li>No notes for today.</li>'}
      </ul>
    </section>
    <section>
      <h3>Calendar</h3>
      <div>${new Date().toLocaleDateString()}</div>
    </section>
  `;
}

if (window.location.pathname.endsWith('index2.html')) {
  renderDashboard();
}

