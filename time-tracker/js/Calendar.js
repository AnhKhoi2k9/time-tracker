import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase của bạn
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

export async function renderCalendar() {
  const calendarTable = document.getElementById('calendarTable');
  const calMonth = document.getElementById('calMonth');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');
  const eventsBox = document.getElementById('calendarEvents');

  let today = new Date();
  let month = today.getMonth();
  let year = today.getFullYear();

  async function drawCalendar() {
    calMonth.textContent = `${today.toLocaleString('default', {month:'long'})} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    let html = '<tr>';
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => html += `<th>${d}</th>`);
    html += '</tr><tr>';

    // Lấy tasks + notes trong tháng từ Firestore
    const startDate = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const endDate = `${year}-${String(month+1).padStart(2,'0')}-${daysInMonth}`;
    const tasksSnap = await getDocs(collection(db, "tasks"));
    const notesSnap = await getDocs(collection(db, "notes"));

    const eventsByDate = {};
    tasksSnap.forEach(doc => {
      const t = doc.data();
      if (t.date && t.date >= startDate && t.date <= endDate) {
        if (!eventsByDate[t.date]) eventsByDate[t.date] = [];
        eventsByDate[t.date].push({type:"Task", text:t.text});
      }
    });
    notesSnap.forEach(doc => {
      const n = doc.data();
      if (n.date && n.date >= startDate && n.date <= endDate) {
        if (!eventsByDate[n.date]) eventsByDate[n.date] = [];
        eventsByDate[n.date].push({type:"Note", text:n.text});
      }
    });

    for (let i = 0; i < firstDay; i++) html += '<td></td>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const hasEvent = eventsByDate[dateStr];
      html += `<td class="${hasEvent ? 'has-event' : ''}" data-date="${dateStr}">${d}</td>`;
      if ((firstDay + d) % 7 === 0) html += '</tr><tr>';
    }
    html += '</tr>';
    calendarTable.innerHTML = html;

    // Gắn click event cho từng ngày
    calendarTable.querySelectorAll("td[data-date]").forEach(td => {
      td.onclick = () => {
        const dateStr = td.dataset.date;
        const events = eventsByDate[dateStr] || [];
        const listHtml = events.length 
          ? `<ul>${events.map(e => `<li>[${e.type}] ${e.text}</li>`).join("")}</ul>`
          : "<p>No events.</p>";
        eventsBox.innerHTML = `<h3>${dateStr}</h3>${listHtml}`;
      };
    });
  }

  drawCalendar();
  calPrev.onclick = () => { month--; if (month < 0) {month=11;year--;} today=new Date(year,month,1); drawCalendar(); };
  calNext.onclick = () => { month++; if (month > 11) {month=0;year++;} today=new Date(year,month,1); drawCalendar(); };
}
