// Avatar change
    const avatarInput = document.getElementById('avatarInput');
    const avatarImg = document.getElementById('avatar');
    avatarInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          avatarImg.src = e.target.result;
        }
        reader.readAsDataURL(file);
      }
    });

    // Notes
    const notesList = document.getElementById('notesList');
    const addNoteForm = document.getElementById('addNoteForm');
    const noteInput = document.getElementById('noteInput');
    let notes = [];

    function renderNotes() {
      notesList.innerHTML = '';
      notes.forEach((note, idx) => {
        const li = document.createElement('li');
        li.textContent = note;
        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.title = 'Delete note';
        delBtn.onclick = () => {
          notes.splice(idx, 1);
          renderNotes();
        };
        li.appendChild(delBtn);
        notesList.appendChild(li);
      });
    }

    addNoteForm.onsubmit = function(e) {
      e.preventDefault();
      if (noteInput.value.trim()) {
        notes.push(noteInput.value.trim());
        noteInput.value = '';
        renderNotes();
      }
    };

    // Profile settings
    const settingsForm = document.getElementById('settingsForm');
    const nameInput = document.getElementById('nameInput');
    const bioInput = document.getElementById('bioInput');
    const username = document.getElementById('username');
    const userbio = document.getElementById('userbio');

    settingsForm.onsubmit = function(e) {
      e.preventDefault();
      username.textContent = nameInput.value;
      userbio.textContent = bioInput.value;
      alert('Profile updated!');
    };