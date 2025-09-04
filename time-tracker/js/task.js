console.log("task.js loaded");
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentUserUid = null;
let currentWeekStart = getMonday(new Date());

// Xác định ngày Monday
function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getDateForDayInWeek(startOfWeek, dayIndex) {
  const d = new Date(startOfWeek);
  d.setDate(d.getDate() + (dayIndex - 1));
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
  }
});

// Load tasks
async function loadTasks() {
  if (!currentUserUid) return;

  // 👉 lấy element sau khi sidebar render lại
  const weekContainer = document.getElementById("week");
  const weekHeader = document.getElementById("weekHeader");
  const prevBtn = document.getElementById("prevWeek");
  const nextBtn = document.getElementById("nextWeek");

  if (!weekContainer || !weekHeader) return;

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

  // 👉 gắn lại sự kiện nút tuần
  prevBtn.onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    loadTasks();
  };

  nextBtn.onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    loadTasks();
  };
}
