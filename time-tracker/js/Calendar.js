let currentUserUid = null;

// Lắng nghe trạng thái đăng nhập
firebase.auth().onAuthStateChanged((user) => {
  currentUserUid = user ? user.uid : null;
  if (document.getElementById("calendarTable")) {
    renderCalendar();
  }
});

function renderCalendar() {
  const calendarTable = document.getElementById("calendarTable");
  const calMonth = document.getElementById("calMonth");
  const calPrev = document.getElementById("calPrev");
  const calNext = document.getElementById("calNext");
  const quickPicker = document.getElementById("quickPicker");

  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  function formatDateLocal(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (quickPicker) {
    quickPicker.value = `${currentYear}-${pad(currentMonth + 1)}-${pad(
      today.getDate()
    )}`;
  }

  async function updateCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calMonth.textContent = new Date(year, month).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });

    let html = "<tr>";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let d of days) html += `<th>${d}</th>`;
    html += "</tr>";

    // 🔎 Lấy tasks & notes của user trong tháng
    let highlights = new Set();
    if (currentUserUid) {
      const startDate = formatDateLocal(new Date(year, month, 1));
      const endDate = formatDateLocal(new Date(year, month, daysInMonth));

      // Tasks
      const tasksSnap = await firebase.firestore()
        .collection("tasks")
        .where("uid", "==", currentUserUid)
        .get();
      tasksSnap.forEach((doc) => {
        const d = doc.data().date;
        if (d >= startDate && d <= endDate) highlights.add(d);
      });

      // Notes
      const notesSnap = await firebase.firestore()
        .collection("notes")
        .where("uid", "==", currentUserUid)
        .get();

      notesSnap.forEach((doc) => {
        const d = doc.data().date;
        if (d >= startDate && d <= endDate) highlights.add(d);
      });
    }

    // Vẽ lịch
    let date = 1;
    for (let i = 0; i < 6; i++) {
      html += "<tr>";
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          html += "<td></td>";
        } else if (date > daysInMonth) {
          html += "<td></td>";
        } else {
          const thisDate = new Date(year, month, date);
          const dateStr = formatDateLocal(thisDate);
          const isToday = thisDate.toDateString() === new Date().toDateString();
          const hasData = highlights.has(dateStr);

          html += `<td class="calendar-cell${isToday ? " today" : ""}" 
                      data-date="${dateStr}">
                      ${date} ${hasData ? "<span class='dot'></span>" : ""}
                   </td>`;
          date++;
        }
      }
      html += "</tr>";
      if (date > daysInMonth) break;
    }

    calendarTable.innerHTML = html;

    document.querySelectorAll(".calendar-cell").forEach((cell) => {
      cell.onclick = () => {
        document
          .querySelectorAll(".calendar-cell.selected")
          .forEach((c) => c.classList.remove("selected"));
        cell.classList.add("selected");
        const selectedDate = new Date(cell.dataset.date);
        showEventsForDate(selectedDate);
      };
    });
  }

  calPrev.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateCalendar(currentMonth, currentYear);
  };

  calNext.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateCalendar(currentMonth, currentYear);
  };

  if (quickPicker) {
    quickPicker.onchange = () => {
      const d = new Date(quickPicker.value);
      currentMonth = d.getMonth();
      currentYear = d.getFullYear();
      updateCalendar(currentMonth, currentYear);
    };
  }

  updateCalendar(currentMonth, currentYear);

  // Show today's events
  const todayCell = document.querySelector(".calendar-cell.today");
  if (todayCell) {
    todayCell.classList.add("selected");
    showEventsForDate(new Date());
  }

  async function showEventsForDate(dateObj) {
    const dateStr = formatDateLocal(dateObj);
    const calendarEvents = document.getElementById("calendarEvents");
    if (!calendarEvents) return;

    if (!currentUserUid) {
      calendarEvents.innerHTML = `<div>Please log in to see your events.</div>`;
      return;
    }

    let tasks = [];
    let notes = [];

    // Lấy tasks trong ngày
    const tasksSnap = await firebase.firestore()
      .collection("tasks")
      .where("uid", "==", currentUserUid)
      .where("date", "==", dateStr)
      .get();
    tasks = tasksSnap.docs.map((d) => d.data());

    // Lấy notes trong ngày
    const notesSnap = await firebase.firestore()
      .collection("notes")
      .where("uid", "==", currentUserUid)
      .where("date", "==", dateStr)
      .get();
    notes = notesSnap.docs.map((d) => d.data());

    calendarEvents.innerHTML = `
      <div><strong>${dateObj.toLocaleDateString()}</strong></div>
      <section>
        <h4>Tasks</h4>
        <ul>
          ${tasks.length ? tasks.map((t) => `<li>${t.text}</li>`).join("") : "<li>No tasks</li>"}
        </ul>
      </section>
      <section>
        <h4>Notes</h4>
        <ul>
          ${notes.length ? notes.map((n) => `<li>${n.text}</li>`).join("") : "<li>No notes</li>"}
        </ul>
      </section>
    `;
  }
}
