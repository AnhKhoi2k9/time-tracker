// Xử lý thêm, lưu, hiển thị mục tiêu
const goalInput = document.getElementById('goal-input');
const addGoalBtn = document.getElementById('add-goal-btn');
const goalList = document.getElementById('goal-list');
const remindDatetimeInput = document.getElementById('remind-datetime');
const remindRepeatCheckbox = document.getElementById('remind-repeat');

function getGoals() {
    return JSON.parse(localStorage.getItem('lifeGoals') || '[]');
}

function saveGoals(goals) {
    localStorage.setItem('lifeGoals', JSON.stringify(goals));
    localStorage.setItem('lastGoalView', Date.now());
}

function renderGoals() {
    const goals = getGoals();
    goalList.innerHTML = '';
    goals.forEach((goalObj, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${goalObj.text}</span>`;
        const time = document.createElement('div');
        time.className = 'goal-time';
        time.textContent = 'Tạo lúc: ' + new Date(goalObj.created).toLocaleString('vi-VN');
        li.appendChild(time);
        // Trạng thái lặp lại
        const repeatStatus = document.createElement('div');
        repeatStatus.className = 'goal-time';
        repeatStatus.textContent = 'Lặp lại: ' + (goalObj.repeat ? 'Có' : 'Không');
        li.appendChild(repeatStatus);
        // Nút lặp lại/tắt lặp lại
        const repeatBtn = document.createElement('button');
        repeatBtn.textContent = goalObj.repeat ? 'Tắt lặp lại' : 'Lặp lại';
        repeatBtn.className = 'rounded-btn';
        repeatBtn.onclick = () => {
            goalObj.repeat = !goalObj.repeat;
            saveGoals(goals);
            renderGoals();
        };
        li.appendChild(repeatBtn);
        // Nút xóa
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Xóa';
        delBtn.className = 'rounded-btn';
        delBtn.onclick = () => {
            goals.splice(idx, 1);
            saveGoals(goals);
            renderGoals();
        };
        li.appendChild(delBtn);
        goalList.appendChild(li);
    });
}

function renderRepeatStatus() {
    const repeatStatus = document.getElementById('repeat-status');
    repeatStatus.textContent = remindRepeatCheckbox.checked ? 'Lặp lại: Có' : 'Lặp lại: Không';
}

addGoalBtn.addEventListener('click', () => {
    const value = goalInput.value.trim();
    if (!value) return;
    const goals = getGoals();
    // Lấy trạng thái checkbox lặp lại
    const repeatChecked = remindRepeatCheckbox.checked;
    goals.push({ text: value, created: Date.now(), repeat: repeatChecked });
    saveGoals(goals);
    renderGoals();
    goalInput.value = '';
});

// Lưu thời gian nhắc lại và trạng thái lặp lại
remindDatetimeInput.addEventListener('change', () => {
    const selected = new Date(remindDatetimeInput.value).getTime();
    const now = Date.now();
    if (selected <= now) {
        alert('Vui lòng chọn thời gian trong tương lai!');
        remindDatetimeInput.value = '';
        return;
    }
    localStorage.setItem('remindDatetime', remindDatetimeInput.value);
});
remindRepeatCheckbox.addEventListener('change', () => {
    localStorage.setItem('remindRepeat', remindRepeatCheckbox.checked ? '1' : '0');
    renderRepeatStatus();
});

window.addEventListener('DOMContentLoaded', () => {
    renderGoals();
    // Set lại input nếu đã lưu
    const savedDatetime = localStorage.getItem('remindDatetime');
    if (savedDatetime) remindDatetimeInput.value = savedDatetime;
    remindRepeatCheckbox.checked = localStorage.getItem('remindRepeat') === '1';
    renderRepeatStatus();

    // Cập nhật lại logic nhắc nhở: kiểm tra từng mục tiêu có repeat hay không
    function checkReminder() {
        const goals = getGoals();
        const now = Date.now();
        let changed = false;
        goals.forEach(goal => {
            if (!goal.nextRemind && goal.created) {
                // Nếu chưa có thời gian nhắc, lấy từ input hoặc mặc định 7 ngày sau khi tạo
                goal.nextRemind = localStorage.getItem('remindDatetime') ? new Date(localStorage.getItem('remindDatetime')).getTime() : (goal.created + 7*24*60*60*1000);
                changed = true;
            }
            if (goal.nextRemind && now >= goal.nextRemind) {
                alert('Đã đến lúc bạn xem lại mục tiêu: ' + goal.text);
                if (goal.repeat) {
                    // Lặp lại: cộng thêm 7 ngày
                    goal.nextRemind += 7*24*60*60*1000;
                } else {
                    // Không lặp lại: xóa thời gian nhắc
                    goal.nextRemind = null;
                }
                changed = true;
            }
        });
        if (changed) saveGoals(goals);
    }
    setInterval(checkReminder, 60*1000);
    checkReminder();
}); 