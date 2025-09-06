// Chờ cho DOM tải xong trước khi thực thi mã
document.addEventListener('DOMContentLoaded', function() {
    // ===== DOM ELEMENTS =====
    // Lấy các phần tử DOM cần thiết
    const timerDisplay = document.getElementById('timer');
    const progressBar = document.getElementById('progress-bar');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const tasksContainer = document.getElementById('tasks');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const spotifyEmbed = document.querySelector('.spotify-embed');
    const body = document.body;

    // ===== STATE VARIABLES =====
    // Biến lưu trạng thái ứng dụng
    let timer;
    let timeLeft;
    let currentMode = 'pomodoro';
    let isRunning = false;
    let totalTime = 25 * 60; // 25 minutes in seconds

    // ===== INITIALIZATION =====
    // Khởi tạo ứng dụng
    updateDisplay();

    // ===== EVENT LISTENERS =====
    // Gán sự kiện cho các nút điều khiển
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Gán sự kiện cho các nút chọn chế độ
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            switchMode(this.dataset.mode);
        });
    });
    
    // Gán sự kiện cho quản lý công việc
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Gán sự kiện cho điều hướng menu
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Cập nhật menu active
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Hiển thị section tương ứng
            const sectionId = this.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionId}-section`).classList.add('active');
        });
    });
    
    // Gán sự kiện cho chọn playlist - THAY ĐỔI BACKGROUND THEO PLAYLIST
    playlistItems.forEach(item => {
        item.addEventListener('click', function() {
            // Cập nhật playlist active
            playlistItems.forEach(playlist => playlist.classList.remove('active'));
            this.classList.add('active');
            
            // Lấy theme từ data attribute
            const theme = this.dataset.theme;
            
            // THAY ĐỔI BACKGROUND THEO PLAYLIST
            changeBackgroundTheme(theme);
            
            // Cập nhật player Spotify
            const playlistId = this.dataset.playlist;
            spotifyEmbed.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
        });
    });

    // ===== TIMER FUNCTIONS =====
    // Chuyển đổi giữa các chế độ
    function switchMode(mode) {
        currentMode = mode;
        
        // Cập nhật nút active
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Đặt thời gian theo chế độ
        if (mode === 'pomodoro') {
            totalTime = 25 * 60;
        } else if (mode === 'short-break') {
            totalTime = 5 * 60;
        } else if (mode === 'long-break') {
            totalTime = 15 * 60;
        }
        
        resetTimer();
    }
    
    // Cập nhật hiển thị bộ đếm thời gian
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Cập nhật tiêu đề trang
        document.title = `${timerDisplay.textContent} - Dream Pomodoro`;
    }
    
    // Bắt đầu bộ đếm thời gian
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            timer = setInterval(() => {
                timeLeft--;
                
                // Cập nhật thanh tiến trình
                const progress = ((totalTime - timeLeft) / totalTime) * 100;
                progressBar.style.width = `${progress}%`;
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    isRunning = false;
                    startBtn.disabled = false;
                    pauseBtn.disabled = true;
                    
                    // Phát âm thanh thông báo
                    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                    audio.play();
                    
                    // Tự động chuyển chế độ
                    if (currentMode === 'pomodoro') {
                        switchMode('short-break');
                    } else {
                        switchMode('pomodoro');
                    }
                    
                    startTimer(); // Tự động bắt đầu phiên tiếp theo
                }
                
                updateDisplay();
            }, 1000);
        }
    }
    
    // Tạm dừng bộ đếm thời gian
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    // Đặt lại bộ đếm thời gian
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        timeLeft = totalTime;
        updateDisplay();
        progressBar.style.width = '0%';
    }

    // ===== TASK MANAGEMENT =====
    // Thêm công việc mới
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox">
                <span>${taskText}</span>
                <div class="task-actions">
                    <button class="edit-task"><i class="fas fa-edit"></i></button>
                    <button class="delete-task"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Thêm sự kiện cho checkbox
            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.addEventListener('change', function() {
                taskItem.classList.toggle('completed', this.checked);
            });
            
            // Thêm sự kiện cho nút xóa
            taskItem.querySelector('.delete-task').addEventListener('click', function() {
                taskItem.remove();
            });
            
            // Thêm sự kiện cho nút sửa
            taskItem.querySelector('.edit-task').addEventListener('click', function() {
                const span = taskItem.querySelector('span');
                const newText = prompt('Chỉnh sửa công việc:', span.textContent);
                if (newText !== null) {
                    span.textContent = newText;
                }
            });
            
            tasksContainer.appendChild(taskItem);
            taskInput.value = '';
        }
    }

    // ===== BACKGROUND THEME FUNCTIONS =====
    // Hàm thay đổi background theme theo playlist
    function changeBackgroundTheme(theme) {
        // Xóa tất cả các class theme hiện có
        body.classList.remove('theme-deep-focus', 'theme-deep-house', 'theme-ambient', 'theme-piano');
        
        // Thêm class theme mới
        body.classList.add(`theme-${theme}`);
    }
});