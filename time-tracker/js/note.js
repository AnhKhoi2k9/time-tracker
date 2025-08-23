import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from "firebase/firestore";

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

function getTodayUTC() {
  return new Date().toISOString().slice(0, 10);
}

// Elements
const addNoteForm = document.getElementById('addNoteForm');
const noteInput = document.getElementById('noteInput');
const dateInput = document.getElementById('dateInput');
const notesList = document.getElementById('notesList');
const noNotesMsg = document.getElementById('noNotesMsg');
const viewDateInput = document.getElementById('viewDateInput');

dateInput.value = getTodayUTC();
viewDateInput.value = getTodayUTC();

// Render notes from Firestore
async function renderNotes() {
  const selectedDay = viewDateInput.value || getTodayUTC();
  notesList.innerHTML = "";

  const q = query(collection(db, "notes"), where("date", "==", selectedDay));
  const snap = await getDocs(q);

  if (snap.empty) {
    noNotesMsg.style.display = "block";
    return;
  }
  noNotesMsg.style.display = "none";

  snap.forEach(docSnap => {
    const note = docSnap.data();
    const li = document.createElement("li");
    li.className = "note-item";

    const textDiv = document.createElement("div");
    textDiv.textContent = note.text;
    li.appendChild(textDiv);

    const dateDiv = document.createElement("div");
    dateDiv.className = "note-date";
    dateDiv.textContent = "Date: " + note.date;
    li.appendChild(dateDiv);

    const actions = document.createElement("div");
    actions.className = "note-actions";

    // Edit
    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.onclick = async () => {
      const newText = prompt("Edit note:", note.text);
      if (newText) {
        await updateDoc(doc(db, "notes", docSnap.id), { text: newText });
        renderNotes();
      }
    };

    // Delete
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "notes", docSnap.id));
      renderNotes();
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(actions);
    notesList.appendChild(li);
  });
}

// Add note
addNoteForm.onsubmit = async (e) => {
  e.preventDefault();
  const text = noteInput.value.trim();
  const date = dateInput.value;
  if (!text || !date) return;

  await addDoc(collection(db, "notes"), { text, date });
  noteInput.value = "";
  renderNotes();
};

viewDateInput.addEventListener("change", renderNotes);

// Load default
renderNotes();
