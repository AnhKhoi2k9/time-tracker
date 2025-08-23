// Import Firebase từ CDN (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekContainer = document.getElementById("week");

// 🔹 Load tasks từ Firestore
async function loadTasks() {
  console.log("Loading tasks...");
  const snap = await getDocs(collection(db, "tasks"));
  console.log("Loaded docs:", snap.docs.map(d => d.data()));

  weekContainer.innerHTML = "";

  daysOfWeek.forEach(day => {
    const column = document.createElement("div");
    column.className = "day-column";

    const header = document.createElement("h2");
    header.textContent = day;

    const taskList = document.createElement("ul");
    taskList.className = "task-list";

    // Render tasks theo day
    snap.forEach(docSnap => {
      const t = docSnap.data();
      if (t.day === day) {
        const li = document.createElement("li");
        li.className = "task-item";

        const span = document.createElement("span");
        span.textContent = t.text;
        if (t.completed) li.classList.add("completed");

        // Toggle completed
        span.onclick = async () => {
          const newStatus = !li.classList.contains("completed");
          li.classList.toggle("completed");
          await updateDoc(doc(db, "tasks", docSnap.id), { completed: newStatus });
        };

        // Actions
        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Edit
        const editBtn = document.createElement("button");
        editBtn.textContent = "✎";
        editBtn.onclick = async () => {
          const newText = prompt("Edit task:", t.text);
          if (newText && newText.trim() !== "") {
            await updateDoc(doc(db, "tasks", docSnap.id), { text: newText.trim() });
            loadTasks();
          }
        };

        // Delete
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = async () => {
          await deleteDoc(doc(db, "tasks", docSnap.id));
          loadTasks();
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(span);
        li.appendChild(actions);
        taskList.appendChild(li);
      }
    });

    // Input + Add button
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Add task for ${day}`;

    const button = document.createElement("button");
    button.textContent = "Add";
    button.onclick = async () => {
      const taskText = input.value.trim();
      if (taskText) {
        await addDoc(collection(db, "tasks"), { 
          text: taskText, 
          day, 
          date: new Date().toISOString().slice(0,10), 
          completed: false 
        });
        input.value = "";
        loadTasks();
      }
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

// 🔹 Chạy
loadTasks();
