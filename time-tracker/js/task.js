console.log("task.js loaded");
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekContainer = document.getElementById("week");
const weekHeader = document.getElementById("weekHeader"); // 👈 nhớ thêm div này trong HTML
const prevBtn = document.getElementById("prevWeek");
const nextBtn = document.getElementById("nextWeek");
let currentUserUid = null;
let currentWeekStart = getMonday(new Date()); // ngày Monday của tuần hiện tại

// Xác định ngày Monday của 1 tuần bất kỳ
function getMonday(d) {
  d = new Date(d);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // chuyển về Monday
  return new Date(d.setDate(diff));
}

// Tính ngày cho cột (Mon…Sat) dựa vào currentWeekStart
function getDateForDayInWeek(startOfWeek, dayIndex) {
  const d = new Date(startOfWeek);
  d.setDate(d.getDate() + (dayIndex - 1)); // Monday=1 … Saturday=6
  return d.toISOString().slice(0, 10);
}

const dayIndexMap = { 
  "Monday": 1, "Tuesday": 2, "Wednesday": 3, 
  "Thursday": 4, "Friday": 5, "Saturday": 6 
};

firebase.auth().onAuthStateChanged((user) => {
  currentUserUid = user ? user.uid : null;
  if (user) {
    loadTasks();
  } else {
    weekContainer.innerHTML = `<div style="padding:16px;color:#bdbdbd;">Please log in to manage your tasks.</div>`;
  }
});

// Load tasks cho tuần hiện tại
async function loadTasks() {
  if (!currentUserUid) return;

  const snap = await firebase.firestore()
    .collection("tasks")
    .where("uid", "==", currentUserUid)
    .get();

  weekContainer.innerHTML = "";

  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 5);
  weekHeader.textContent = `Week of ${currentWeekStart.toDateString()} - ${endOfWeek.toDateString()}`;

  daysOfWeek.forEach(day => {
    const column = document.createElement("div");
    column.className = "day-column";

    const header = document.createElement("h2");
    header.textContent = day;

    const taskList = document.createElement("ul");
    taskList.className = "task-list";

    const taskDate = getDateForDayInWeek(currentWeekStart, dayIndexMap[day]);

    snap.forEach(docSnap => {
      const t = { id: docSnap.id, ...docSnap.data() };
      if (t.day === day && t.date === taskDate) {
        const li = document.createElement("li");
        li.className = "task-item";

        const span = document.createElement("span");
        span.textContent = t.text;
        if (t.completed) li.classList.add("completed");

        span.onclick = async () => {
          const newStatus = !li.classList.contains("completed");
          li.classList.toggle("completed");
          await firebase.firestore().collection("tasks").doc(t.id).update({ completed: newStatus });
        };

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "✎";
        editBtn.onclick = async () => {
          const newText = prompt("Edit task:", t.text);
          if (newText && newText.trim() !== "") {
            await firebase.firestore().collection("tasks").doc(t.id).update({ text: newText.trim() });
            loadTasks();
          }
        };

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = async () => {
          if (confirm("Delete this task?")) {
            await firebase.firestore().collection("tasks").doc(t.id).delete();
            loadTasks();
          }
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(span);
        li.appendChild(actions);
        taskList.appendChild(li);
      }
    });

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Add task for ${day}`;

    const button = document.createElement("button");
    button.textContent = "Add";
    button.onclick = async () => {
      const taskText = input.value.trim();
      if (!taskText || !currentUserUid) return;
      await firebase.firestore().collection("tasks").add({
        text: taskText,
        day,
        date: taskDate,
        completed: false,
        uid: currentUserUid,
        createdAt: new Date()
      });
      input.value = "";
      loadTasks();
    };

    const inputWrapper = document.createElement("div");
    inputWrapper.className = "add-task";
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(button);

    column.appendChild(header);
    column.appendChild(taskList);
    column.appendChild(inputWrapper);
    weekContainer.appendChild(column);
  });
}


// Nút điều khiển tuần
prevBtn.onclick = () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  loadTasks();
};

nextBtn.onclick = () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  loadTasks();
};
