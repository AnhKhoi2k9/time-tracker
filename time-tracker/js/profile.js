// Kiểm tra trạng thái đăng nhập và hiển thị thông tin người dùng
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loadUserProfile(user);
        } else {
            // Nếu chưa đăng nhập, chuyển hướng về trang login
            window.location.href = 'login.html';
        }
    });
});

// Tải thông tin profile người dùng
function loadUserProfile(user) {
    const username = document.getElementById('username');
    const userbio = document.getElementById('userbio');
    const avatar = document.getElementById('avatar');
    const nameInput = document.getElementById('nameInput');
    const bioInput = document.getElementById('bioInput');
    
    // Hiển thị thông tin người dùng
    if (user.displayName) {
        username.textContent = user.displayName;
        nameInput.value = user.displayName;
    } else {
        username.textContent = user.email.split('@')[0];
        nameInput.value = user.email.split('@')[0];
    }
    
    // Hiển thị avatar
    if (user.photoURL) {
        avatar.src = user.photoURL;
    } else {
        // Tạo avatar từ tên người dùng
        const name = user.displayName || user.email.split('@')[0];
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=232326&color=fff&size=256`;
    }
    
    // Lấy thông tin bổ sung từ Firestore nếu có
    loadUserDataFromFirestore(user.uid);
}

// Tải dữ liệu người dùng từ Firestore
function loadUserDataFromFirestore(uid) {
    db.collection('users').doc(uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const userbio = document.getElementById('userbio');
                const bioInput = document.getElementById('bioInput');
                
                if (userData.bio) {
                    userbio.textContent = userData.bio;
                    bioInput.value = userData.bio;
                }
                
                // Tải notes nếu có
                if (userData.notes && Array.isArray(userData.notes)) {
                    notes = userData.notes;
                    renderNotes();
                }
            }
        })
        .catch((error) => {
            console.error("Lỗi khi tải dữ liệu người dùng:", error);
        });
}

// Lưu dữ liệu người dùng vào Firestore
function saveUserDataToFirestore(uid, data) {
    db.collection('users').doc(uid).set(data, { merge: true })
        .then(() => {
            console.log("Dữ liệu người dùng đã được lưu");
        })
        .catch((error) => {
            console.error("Lỗi khi lưu dữ liệu:", error);
        });
}

// Đăng xuất
function logout() {
    firebase.auth().signOut()
        .then(() => {
            // Xóa session khỏi localStorage
            localStorage.removeItem('user_session');
            // Chuyển hướng về trang login
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error("Lỗi khi đăng xuất:", error);
        });
}

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
            // Lưu notes vào Firestore
            const user = firebase.auth().currentUser;
            if (user) {
                saveUserDataToFirestore(user.uid, { notes: notes });
            }
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
        
        // Lưu notes vào Firestore
        const user = firebase.auth().currentUser;
        if (user) {
            saveUserDataToFirestore(user.uid, { notes: notes });
        }
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
    
    // Lưu thông tin vào Firestore
    const user = firebase.auth().currentUser;
    if (user) {
        const userData = {
            displayName: nameInput.value,
            bio: bioInput.value,
            updatedAt: new Date()
        };
        saveUserDataToFirestore(user.uid, userData);
    }
    
    alert('Profile đã được cập nhật!');
};

// Cập nhật nút đăng xuất
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.profile-actions button');
    if (logoutBtn) {
        logoutBtn.textContent = 'Đăng xuất';
        logoutBtn.onclick = logout;
    }
});