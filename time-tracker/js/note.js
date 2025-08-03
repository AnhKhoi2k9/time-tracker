// Helper: get today's date in UTC (YYYY-MM-DD)
    function getTodayUTC() {
      const now = new Date();
      return now.toISOString().slice(0, 10);
    }

    // Save/load notes from localStorage (for demo)
    function loadNotes() {
      try {
        return JSON.parse(localStorage.getItem('notes-v2')) || [];
      } catch {
        return [];
      }
    }
    function saveNotes(notes) {
      localStorage.setItem('notes-v2', JSON.stringify(notes));
    }

    // Elements
    const addNoteForm = document.getElementById('addNoteForm');
    const noteInput = document.getElementById('noteInput');
    const dateInput = document.getElementById('dateInput');
    const notesList = document.getElementById('notesList');
    const noNotesMsg = document.getElementById('noNotesMsg');
    const viewDateInput = document.getElementById('viewDateInput');

    // Set default date to today (UTC)
    dateInput.value = getTodayUTC();
    viewDateInput.value = getTodayUTC();

    // Notes structure: [{text, date, id}]
    let notes = loadNotes();

    // Render notes for selected day (UTC)
    function renderNotes() {
      const selectedDay = viewDateInput.value || getTodayUTC();
      notesList.innerHTML = '';
      let hasNotes = false;
      notes
        .filter(note => note.date === selectedDay)
        .forEach(note => {
          hasNotes = true;
          const li = document.createElement('li');
          li.className = 'note-item';

          // Edit mode
          if (note.editing) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = note.text;
            input.className = 'edit-input';
            input.onkeydown = e => {
              if (e.key === 'Enter') saveEdit(note.id, input.value);
              if (e.key === 'Escape') cancelEdit(note.id);
            };
            li.appendChild(input);

            const saveBtn = document.createElement('button');
            saveBtn.textContent = '💾';
            saveBtn.onclick = () => saveEdit(note.id, input.value);
            li.appendChild(saveBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '✕';
            cancelBtn.onclick = () => cancelEdit(note.id);
            li.appendChild(cancelBtn);
          } else {
            // Show note
            const textDiv = document.createElement('div');
            textDiv.textContent = note.text;
            li.appendChild(textDiv);

            const dateDiv = document.createElement('div');
            dateDiv.className = 'note-date';
            dateDiv.textContent = 'Date: ' + note.date;
            li.appendChild(dateDiv);

            // Actions
            const actions = document.createElement('div');
            actions.className = 'note-actions';

            const editBtn = document.createElement('button');
            editBtn.title = 'Edit';
            editBtn.textContent = '✎';
            editBtn.onclick = () => editNote(note.id);

            const delBtn = document.createElement('button');
            delBtn.title = 'Delete';
            delBtn.textContent = '🗑';
            delBtn.onclick = () => deleteNote(note.id);

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            li.appendChild(actions);
          }

          notesList.appendChild(li);
        });
      noNotesMsg.style.display = hasNotes ? 'none' : 'block';
    }

    // Add note
    addNoteForm.onsubmit = function(e) {
      e.preventDefault();
      const text = noteInput.value.trim();
      const date = dateInput.value;
      if (!text || !date) return;
      notes.push({
        id: Date.now() + Math.random(),
        text,
        date,
      });
      saveNotes(notes);
      noteInput.value = '';
      dateInput.value = getTodayUTC();
      renderNotes();
    };

    // Edit note
    function editNote(id) {
      notes = notes.map(note => note.id === id ? {...note, editing: true} : {...note, editing: false});
      renderNotes();
    }
    function saveEdit(id, newText) {
      notes = notes.map(note =>
        note.id === id ? {...note, text: newText, editing: false} : note
      );
      saveNotes(notes);
      renderNotes();
    }
    function cancelEdit(id) {
      notes = notes.map(note => ({...note, editing: false}));
      renderNotes();
    }

    // Delete note
    function deleteNote(id) {
      notes = notes.filter(note => note.id !== id);
      saveNotes(notes);
      renderNotes();
    }

    // Khi đổi ngày xem, render lại note
    viewDateInput.addEventListener('change', renderNotes);

    // Show notes for selected day (UTC) on load
    renderNotes();

    // Optional: update notes at midnight UTC
    setInterval(() => {
      renderNotes();
    }, 60 * 1000); // check every minute