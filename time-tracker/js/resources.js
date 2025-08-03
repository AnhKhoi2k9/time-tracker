const fileInput = document.getElementById('resource-file-input');
const uploadBtn = document.getElementById('upload-resource-btn');
const resourceList = document.getElementById('resource-list');

function getResources() {
    return JSON.parse(localStorage.getItem('resources') || '[]');
}

function saveResources(resources) {
    localStorage.setItem('resources', JSON.stringify(resources));
}

// ✨ Hàm rút gọn tên file nếu quá dài
function getFileDisplayName(fileName) {
    const maxLength = 40;
    if (fileName.length <= maxLength) return fileName;

    const parts = fileName.split('.');
    const ext = parts.pop();
    const base = parts.join('.');
    const shortBase = base.slice(0, maxLength - ext.length - 5);
    return `${shortBase}... .${ext}`;
}

function renderResources() {
    const resources = getResources();
    resourceList.innerHTML = '';
    resources.forEach((res, idx) => {
        const li = document.createElement('li');
        li.style.marginBottom = '16px';

        // 👉 Link tải file
        const link = document.createElement('a');
        link.href = res.data;
        link.download = res.name;
        link.textContent = getFileDisplayName(res.name);
        link.title = res.name; // Tooltip
        link.style.display = 'block';

        // 🕒 Thời gian thêm
        const time = document.createElement('span');
        time.textContent = `Thêm lúc: ${new Date(res.time).toLocaleTimeString('vi-VN')} ${new Date(res.time).toLocaleDateString('vi-VN')}`;
        time.className = 'goal-time';

        // 🗑️ Nút xóa
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Xóa';
        deleteBtn.className = 'rounded-btn';
        deleteBtn.style.marginTop = '6px';
        deleteBtn.addEventListener('click', () => {
            const updated = resources.filter((_, i) => i !== idx);
            saveResources(updated);
            renderResources();
        });

        li.appendChild(link);
        li.appendChild(time);
        li.appendChild(deleteBtn);
        resourceList.appendChild(li);
    });
}

uploadBtn.addEventListener('click', () => {
    const files = fileInput.files;
    if (!files.length) return;
    const resources = getResources();
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resources.push({
                name: file.name,
                data: e.target.result,
                time: new Date().toISOString()
            });
            saveResources(resources);
            renderResources();
        };
        reader.readAsDataURL(file);
    });
    fileInput.value = '';
});

window.addEventListener('DOMContentLoaded', renderResources);
