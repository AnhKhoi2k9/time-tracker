import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const datePicker = document.getElementById("noteDate");

let currentUserUid = null;

onAuthStateChanged(auth, (user) => {
  currentUserUid = user ? user.uid : null;
  if (user) {
    loadNotes();
  } else {
    notesList.innerHTML = "<p>Please log in to manage notes.</p>";
  }
});

function formatDateLocal(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Load all notes for current user
async function loadNotes() {
  if (!currentUserUid) return;
  notesList.innerHTML = "Loading...";
  const q = query(
    collection(db, "notes"),
    where("uid", "==", currentUserUid)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    notesList.innerHTML = "<p>No notes yet.</p>";
    return;
  }

  const ul = document.createElement("ul");
  snap.forEach((docSnap) => {
    const note = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `[${note.date}] ${note.text}`;

    // nút edit
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = async () => {
      const newText = prompt("Edit note:", note.text);
      if (newText) {
        await updateDoc(doc(db, "notes", docSnap.id), { text: newText });
        loadNotes();
      }
    };

    // nút xóa
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "notes", docSnap.id));
      loadNotes();
    };

    li.appendChild(editBtn);
    li.appendChild(delBtn);

    ul.appendChild(li);
  });
  notesList.innerHTML = "";
  notesList.appendChild(ul);
}

// Add new note
addNoteBtn.onclick = async () => {
  const text = noteInput.value.trim();
  if (!text || !currentUserUid) return;

  let selectedDate;
  if (datePicker.value) {
    selectedDate = datePicker.value; // yyyy-mm-dd
  } else {
    selectedDate = formatDateLocal(new Date()); // mặc định hôm nay
  }

  await addDoc(collection(db, "notes"), {
    text,
    date: selectedDate,
    uid: currentUserUid,
    createdAt: new Date(),
  });

  noteInput.value = "";
  loadNotes();
};
