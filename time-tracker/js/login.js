const inpEmail = document.querySelector(".inp-email");
const inpPwd = document.querySelector(".inp-pwd");
const loginForm = document.querySelector("#login-form");
const googleLoginBtn = document.querySelector("#googleLoginBtn");
const messageDiv = document.querySelector("#message");

const now = new Date().getTime();

// Hiển thị thông báo
function showMessage(message, type = 'success') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Lưu thông tin người dùng vào localStorage
function saveUserSession(user) {
    const userSession = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: user.providerData[0]?.providerId || 'password',
        expiry: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 tiếng
    };
    
    localStorage.setItem('user_session', JSON.stringify(userSession));
}

// Chuyển hướng sau khi đăng nhập thành công
function redirectAfterLogin() {
    showMessage('Đăng nhập thành công!', 'success');
    setTimeout(() => {
        window.location.href = "index2.html";
    }, 1000);
}

function handleLogin(event) {
    event.preventDefault();

    let email = inpEmail.value;
    let password = inpPwd.value;

    if (!email || !password) {
        showMessage("Vui lòng điền đủ các trường", 'error');
        return;
    }

    // Hiển thị loading
    const submitBtn = document.querySelector("#submitBtn");
    const loading = document.querySelector("#loading");
    const btnText = document.querySelector("#btnText");
    
    submitBtn.disabled = true;
    loading.style.display = 'inline-block';
    btnText.textContent = 'Đang đăng nhập...';

    // Đăng nhập với Firebase Auth
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            saveUserSession(user);
            redirectAfterLogin();
        })
        .catch((error) => {
            console.error("Lỗi đăng nhập:", error);
            let errorMessage = "Đăng nhập thất bại";
            
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = "Email không tồn tại";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Mật khẩu không đúng";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Email không hợp lệ";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau";
                    break;
            }
            
            showMessage(errorMessage, 'error');
        })
        .finally(() => {
            // Ẩn loading
            submitBtn.disabled = false;
            loading.style.display = 'none';
            btnText.textContent = 'Đăng nhập';
        });
}

// Đăng nhập với Google
function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Cấu hình scope cho Google
    provider.addScope('profile');
    provider.addScope('email');
    
    // Hiển thị loading
    googleLoginBtn.disabled = true;
    googleLoginBtn.innerHTML = '<span class="loading"></span>Đang đăng nhập...';
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            saveUserSession(user);
            redirectAfterLogin();
        })
        .catch((error) => {
            console.error("Lỗi đăng nhập Google:", error);
            let errorMessage = "Đăng nhập Google thất bại";
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Đăng nhập bị hủy";
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = "Popup bị chặn. Vui lòng cho phép popup cho trang này";
            }
            
            showMessage(errorMessage, 'error');
        })
        .finally(() => {
            // Khôi phục nút Google
            googleLoginBtn.disabled = false;
            googleLoginBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
            `;
        });
}

// Kiểm tra trạng thái đăng nhập khi trang load
// document.addEventListener('DOMContentLoaded', function() {
//     // Kiểm tra xem người dùng đã đăng nhập chưa
//     firebase.auth().onAuthStateChanged(function(user) {
//         if (user) {
//             // Người dùng đã đăng nhập, chuyển hướng
//             window.location.href = "index2.html";
//         }
//     });
// });

loginForm.addEventListener("submit", handleLogin);
googleLoginBtn.addEventListener("click", handleGoogleLogin);