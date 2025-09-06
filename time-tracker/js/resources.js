// Resources JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let resources = JSON.parse(localStorage.getItem('resources')) || [];
    let linkedGoals = JSON.parse(localStorage.getItem('linkedGoals')) || {};

    // Elements
    const resourceFileInput = document.getElementById('resource-file-input');
    const uploadResourceBtn = document.getElementById('upload-resource-btn');
    const linkGoalBtn = document.getElementById('link-goal-btn');
const resourceList = document.getElementById('resource-list');
    const searchResources = document.getElementById('search-resources');
    const categoryFilter = document.getElementById('category-filter');
    const linkedResources = document.getElementById('linked-resources');

    // Stats elements
    const totalResources = document.getElementById('total-resources');
    const totalSize = document.getElementById('total-size');
    const linkedGoalsCount = document.getElementById('linked-goals');

    // Initialize
    updateStats();
    renderResources();
    renderLinkedResources();
    setupEventListeners();

    // Setup event listeners
    function setupEventListeners() {
        uploadResourceBtn.addEventListener('click', uploadResource);
        linkGoalBtn.addEventListener('click', linkToGoal);
        searchResources.addEventListener('input', filterResources);
        categoryFilter.addEventListener('change', filterResources);
        
        // Add focus effects for form inputs
        const formInputs = document.querySelectorAll('.search-input, .filter-select');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    // Upload resource
    function uploadResource() {
        const files = resourceFileInput.files;
        if (files.length === 0) {
            showNotification('Vui lòng chọn file để upload!', 'error');
            return;
        }

        let uploadedCount = 0;
        Array.from(files).forEach(file => {
            const resource = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: getFileType(file.name),
                category: getFileCategory(file.name),
                uploadDate: new Date().toISOString(),
                url: URL.createObjectURL(file),
                linkedGoals: []
            };

            resources.push(resource);
            uploadedCount++;
        });

        saveResources();
        updateStats();
        renderResources();
        resourceFileInput.value = '';
        
        showNotification(`Đã upload ${uploadedCount} file thành công! 📤`, 'success');
    }

    // Link resource to goal
    function linkToGoal() {
        if (resources.length === 0) {
            showNotification('Chưa có tài liệu nào để liên kết!', 'error');
            return;
        }

        // Check if there's a selected goal from Life Goals page
        const selectedGoal = JSON.parse(localStorage.getItem('selectedGoalForLinking'));
        
        if (selectedGoal) {
            // Show resource selection modal
            showResourceSelectionModal(selectedGoal);
        } else {
            // Redirect to Life Goals page
            window.location.href = 'life-goals.html';
        }
    }

    // Show resource selection modal
    function showResourceSelectionModal(goal) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>🔗 Liên kết tài liệu với mục tiêu</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p><strong>Mục tiêu:</strong> ${goal.text}</p>
                    <div class="resource-selection">
                        <h4>Chọn tài liệu để liên kết:</h4>
                        ${resources.map(resource => `
                            <label class="resource-checkbox">
                                <input type="checkbox" value="${resource.id}">
                                <span>${resource.name} (${resource.type})</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn" onclick="this.closest('.modal-overlay').remove()">Hủy</button>
                    <button class="primary-btn" onclick="confirmLinkResources('${goal.id}')">Liên kết</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Confirm resource linking
    window.confirmLinkResources = function(goalId) {
        const selectedResources = Array.from(document.querySelectorAll('.resource-checkbox input:checked'))
            .map(checkbox => resources.find(r => r.id == checkbox.value));

        if (selectedResources.length === 0) {
            showNotification('Vui lòng chọn ít nhất một tài liệu!', 'error');
            return;
        }

        // Link resources to goal
        selectedResources.forEach(resource => {
            if (!linkedGoals[goalId]) {
                linkedGoals[goalId] = [];
            }
            linkedGoals[goalId].push({
                id: resource.id,
                name: resource.name,
                type: resource.type,
                url: resource.url
            });
        });

        localStorage.setItem('linkedGoals', JSON.stringify(linkedGoals));
        
        // Update stats and render
        updateStats();
        renderLinkedResources();
        
        // Close modal
        document.querySelector('.modal-overlay').remove();
        
        // Clear selected goal
        localStorage.removeItem('selectedGoalForLinking');
        
        showNotification('Đã liên kết tài liệu thành công! 🔗', 'success');
    };

    // Filter resources
    function filterResources() {
        const searchTerm = searchResources.value.toLowerCase();
        const categoryFilterValue = categoryFilter.value;

        const filteredResources = resources.filter(resource => {
            const matchesSearch = resource.name.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilterValue || resource.category === categoryFilterValue;

            return matchesSearch && matchesCategory;
        });

        renderResources(filteredResources);
    }

    // Render resources
    function renderResources(resourcesToRender = resources) {
        resourceList.innerHTML = '';
        
        if (resourcesToRender.length === 0) {
            resourceList.innerHTML = '<li class="empty-state">Chưa có tài liệu nào</li>';
            return;
        }

        resourcesToRender.forEach(resource => {
            const li = document.createElement('li');
            li.className = 'resource-item';
            
            const categoryIcon = getCategoryIcon(resource.category);
            const fileIcon = getFileIcon(resource.type);
            
            li.innerHTML = `
                <div class="resource-header">
                    <span class="resource-icon">${fileIcon}</span>
                    <span class="resource-category">${categoryIcon}</span>
                    <h3 class="resource-name">${resource.name}</h3>
                </div>
                <div class="resource-meta">
                    <span class="resource-size">📏 ${formatFileSize(resource.size)}</span>
                    <span class="resource-type">📄 ${resource.type}</span>
                    <span class="resource-date">📅 ${formatDate(resource.uploadDate)}</span>
                </div>
                <div class="resource-actions">
                    <a href="${resource.url}" target="_blank" class="action-btn view-btn">👁️ Xem</a>
                    <button onclick="deleteResource(${resource.id})" class="action-btn delete-btn">🗑️ Xóa</button>
                </div>
            `;
            
        resourceList.appendChild(li);
    });
}

    // Render linked resources
    function renderLinkedResources() {
        const linkedCount = Object.keys(linkedGoals).length;
        linkedGoalsCount.textContent = linkedCount;

        if (linkedCount === 0) {
            linkedResources.innerHTML = '<p class="empty-state">Chưa có tài liệu nào được liên kết với mục tiêu</p>';
            return;
        }

        let resourcesHTML = '';
        Object.entries(linkedGoals).forEach(([goalId, resources]) => {
            resourcesHTML += `
                <div class="linked-resource-group">
                    <h4>🎯 Mục tiêu ID: ${goalId}</h4>
                    <ul class="resource-list">
                        ${resources.map(resource => `
                            <li>
                                <a href="${resource.url}" target="_blank">${resource.name}</a>
                                <span class="resource-type">${resource.type}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });

        linkedResources.innerHTML = resourcesHTML;
    }

    // Helper functions
    function getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const types = {
            'pdf': 'PDF',
            'doc': 'DOC',
            'docx': 'DOCX',
            'txt': 'TXT',
            'jpg': 'JPG',
            'jpeg': 'JPEG',
            'png': 'PNG',
            'mp4': 'MP4',
            'mp3': 'MP3'
        };
        return types[ext] || 'Unknown';
    }

    function getFileCategory(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'study';
        if (['jpg', 'jpeg', 'png'].includes(ext)) return 'personal';
        if (['mp4', 'mp3'].includes(ext)) return 'work';
        return 'personal';
    }

    function getCategoryIcon(category) {
        const icons = {
            'study': '📚',
            'work': '💼',
            'personal': '👤',
            'health': '🏃‍♂️'
        };
        return icons[category] || '📄';
    }

    function getFileIcon(type) {
        const icons = {
            'PDF': '📄',
            'DOC': '📝',
            'DOCX': '📝',
            'TXT': '📄',
            'JPG': '🖼️',
            'JPEG': '🖼️',
            'PNG': '🖼️',
            'MP4': '🎥',
            'MP3': '🎵'
        };
        return icons[type] || '📄';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    function saveResources() {
        localStorage.setItem('resources', JSON.stringify(resources));
    }

    function updateStats() {
        totalResources.textContent = resources.length;
        
        const totalBytes = resources.reduce((sum, resource) => sum + resource.size, 0);
        totalSize.textContent = formatFileSize(totalBytes);
        
        const linkedCount = Object.keys(linkedGoals).length;
        linkedGoalsCount.textContent = linkedCount;
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">✕</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            max-width: 400px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
        } else {
            notification.style.background = 'linear-gradient(45deg, #42a5f5, #1976d2)';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    // Global functions for buttons
    window.deleteResource = function(resourceId) {
        if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
            resources = resources.filter(r => r.id !== resourceId);
            
            // Remove from linked goals
            Object.keys(linkedGoals).forEach(goalId => {
                linkedGoals[goalId] = linkedGoals[goalId].filter(r => r.id !== resourceId);
                if (linkedGoals[goalId].length === 0) {
                    delete linkedGoals[goalId];
                }
            });
            
            saveResources();
            localStorage.setItem('linkedGoals', JSON.stringify(linkedGoals));
            updateStats();
            renderResources();
            renderLinkedResources();
            showNotification('Đã xóa tài liệu thành công!', 'success');
        }
    };

    // Add modal styles
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
        }
        
        .resource-selection {
            margin: 20px 0;
        }
        
        .resource-checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 10px 0;
            color: #b8c5d6;
        }
        
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 20px;
        }
    `;
    document.head.appendChild(modalStyles);
});
