let currentUserUid = null;
let currentDate = new Date();

function formatDateLocal(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

auth.onAuthStateChanged((user) => {
  currentUserUid = user ? user.uid : null;
  if (user) {
    loadNotes();
  }
});

async function loadNotes() {
  if (!currentUserUid) return;

  // 👉 lấy element sau khi sidebar render
  const notesContainer = document.getElementById("notesContainer");
  const noteHeader = document.getElementById("noteHeader");
  const prevBtn = document.getElementById("prevNotesDay");
  const nextBtn = document.getElementById("nextNotesDay");

  if (!notesContainer || !noteHeader) return;

  const dateStr = formatDateLocal(currentDate);
  noteHeader.textContent = `Notes for ${dateStr}`;

  const snap = await db
    .collection("notes")
    .where("uid", "==", currentUserUid)
    .where("date", "==", dateStr)
    .get();

  notesContainer.innerHTML = "";

  const column = document.createElement("div");
  column.className = "day-column";

  const header = document.createElement("h2");
  header.textContent = dateStr;

  const noteList = document.createElement("ul");
  noteList.className = "task-list";

  snap.forEach((docSnap) => {
    const note = { id: docSnap.id, ...docSnap.data() };

    const li = document.createElement("li");
    li.className = "task-item";

    const span = document.createElement("span");
    span.textContent = note.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.onclick = async () => {
      const newText = prompt("Edit note:", note.text);
      if (newText && newText.trim() !== "") {
        await db.collection("notes").doc(note.id).update({ text: newText.trim() });
        loadNotes();
      }
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = async () => {
      if (confirm("Delete this note?")) {
        await db.collection("notes").doc(note.id).delete();
        loadNotes();
      }
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(span);
    li.appendChild(actions);
    noteList.appendChild(li);
  });

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Add note for ${dateStr}`;

  const button = document.createElement("button");
  button.textContent = "Add";
  button.onclick = async () => {
    const text = input.value.trim();
    if (!text || !currentUserUid) return;

    await db.collection("notes").add({
      text,
      date: dateStr,
      uid: currentUserUid,
      createdAt: new Date()
    });
    input.value = "";
    loadNotes();
  };

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "add-task";
  inputWrapper.appendChild(input);
  inputWrapper.appendChild(button);

  column.appendChild(header);
  column.appendChild(noteList);
  column.appendChild(inputWrapper);

  notesContainer.appendChild(column);

  // 👉 gắn lại sự kiện prev/next
  prevBtn.onclick = () => {
    currentDate.setDate(currentDate.getDate() - 1);
    loadNotes();
  };

  nextBtn.onclick = () => {
    currentDate.setDate(currentDate.getDate() + 1);
    loadNotes();
  };
}
