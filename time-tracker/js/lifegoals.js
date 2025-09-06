// Life Goals JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let goals = JSON.parse(localStorage.getItem('lifeGoals')) || [];
    let linkedResources = JSON.parse(localStorage.getItem('linkedResources')) || {};

    // Elements
const goalInput = document.getElementById('goal-input');
    const goalCategory = document.getElementById('goal-category');
    const goalDescription = document.getElementById('goal-description');
    const remindDatetime = document.getElementById('remind-datetime');
    const remindRepeat = document.getElementById('remind-repeat');
    const repeatFrequency = document.getElementById('repeat-frequency');
const addGoalBtn = document.getElementById('add-goal-btn');
    const linkResourceBtn = document.getElementById('link-resource-btn');
const goalList = document.getElementById('goal-list');
    const searchGoals = document.getElementById('search-goals');
    const categoryFilterGoals = document.getElementById('category-filter-goals');
    const statusFilter = document.getElementById('status-filter');
    const goalResources = document.getElementById('goal-resources');

    // Stats elements
    const totalGoals = document.getElementById('total-goals');
    const completedGoals = document.getElementById('completed-goals');
    const linkedResourcesCount = document.getElementById('linked-resources-count');

    // Initialize
    updateStats();
    renderGoals();
    renderLinkedResources();
    setupEventListeners();

    // Setup event listeners
    function setupEventListeners() {
        addGoalBtn.addEventListener('click', addGoal);
        linkResourceBtn.addEventListener('click', linkResource);
        remindRepeat.addEventListener('change', toggleRepeatFrequency);
        searchGoals.addEventListener('input', filterGoals);
        categoryFilterGoals.addEventListener('change', filterGoals);
        statusFilter.addEventListener('change', filterGoals);
        
        // Add focus effects for form inputs
        const formInputs = document.querySelectorAll('.rounded-input, .rounded-textarea');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    // Add new goal
    function addGoal() {
        const text = goalInput.value.trim();
        const category = goalCategory.value;
        const description = goalDescription.value.trim();
        const datetime = remindDatetime.value;
        const repeat = remindRepeat.checked;
        const frequency = repeatFrequency.value;

        if (!text) {
            showNotification('Vui lòng nhập mục tiêu!', 'error');
            return;
        }

        if (!category) {
            showNotification('Vui lòng chọn danh mục!', 'error');
            return;
        }

        const goal = {
            id: Date.now(),
            text: text,
            category: category,
            description: description,
            datetime: datetime,
            repeat: repeat,
            frequency: frequency,
            status: 'active',
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        goals.push(goal);
        saveGoals();
        updateStats();
            renderGoals();
        clearForm();
        showNotification('Đã thêm mục tiêu thành công! 🎯', 'success');
    }

    // Link resource to goal
    function linkResource() {
        const selectedGoal = goals.find(g => g.status === 'active');
        if (!selectedGoal) {
            showNotification('Vui lòng tạo mục tiêu trước khi liên kết tài liệu!', 'error');
            return;
        }

        // Redirect to resources page with goal context
        localStorage.setItem('selectedGoalForLinking', JSON.stringify(selectedGoal));
        window.location.href = 'resources.html';
    }

    // Toggle repeat frequency select
    function toggleRepeatFrequency() {
        repeatFrequency.disabled = !remindRepeat.checked;
        
        if (remindRepeat.checked) {
            repeatFrequency.style.opacity = '1';
            repeatFrequency.style.cursor = 'pointer';
        } else {
            repeatFrequency.style.opacity = '0.6';
            repeatFrequency.style.cursor = 'not-allowed';
        }
    }

    // Filter goals
    function filterGoals() {
        const searchTerm = searchGoals.value.toLowerCase();
        const categoryFilter = categoryFilterGoals.value;
        const statusFilterValue = statusFilter.value;

        const filteredGoals = goals.filter(goal => {
            const matchesSearch = goal.text.toLowerCase().includes(searchTerm) || 
                                goal.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || goal.category === categoryFilter;
            const matchesStatus = !statusFilterValue || goal.status === statusFilterValue;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        renderGoals(filteredGoals);
    }

    // Render goals
    function renderGoals(goalsToRender = goals) {
        goalList.innerHTML = '';
        
        if (goalsToRender.length === 0) {
            goalList.innerHTML = '<li class="empty-state">Chưa có mục tiêu nào</li>';
            return;
        }

        goalsToRender.forEach(goal => {
            const li = document.createElement('li');
            li.className = `goal-item goal-${goal.status}`;
            
            const statusIcon = goal.status === 'completed' ? '✅' : 
                             goal.status === 'paused' ? '⏸' : '🔄';
            
            const categoryIcon = getCategoryIcon(goal.category);
            
            li.innerHTML = `
                <div class="goal-header">
                    <span class="goal-status">${statusIcon}</span>
                    <span class="goal-category">${categoryIcon}</span>
                    <h3 class="goal-text">${goal.text}</h3>
                </div>
                ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                <div class="goal-meta">
                    ${goal.datetime ? `<span class="goal-time">${formatDateTime(goal.datetime)}</span>` : ''}
                    ${goal.repeat ? `<span class="goal-repeat">🔄 ${goal.frequency}</span>` : ''}
                    <span class="goal-created">📅 ${formatDate(goal.createdAt)}</span>
                </div>
                <div class="goal-actions">
                    ${goal.status === 'active' ? 
                        `<button onclick="toggleGoalStatus(${goal.id}, 'completed')" class="action-btn complete-btn">✅ Hoàn thành</button>
                         <button onclick="toggleGoalStatus(${goal.id}, 'paused')" class="action-btn pause-btn">⏸ Tạm dừng</button>` :
                        goal.status === 'completed' ?
                        `<button onclick="toggleGoalStatus(${goal.id}, 'active')" class="action-btn reactivate-btn">🔄 Kích hoạt lại</button>` :
                        `<button onclick="toggleGoalStatus(${goal.id}, 'active')" class="action-btn reactivate-btn">🔄 Kích hoạt lại</button>`
                    }
                    <button onclick="deleteGoal(${goal.id})" class="action-btn delete-btn">🗑️ Xóa</button>
                </div>
            `;
            
        goalList.appendChild(li);
    });
}

    // Render linked resources
    function renderLinkedResources() {
        const linkedCount = Object.keys(linkedResources).length;
        linkedResourcesCount.textContent = linkedCount;

        if (linkedCount === 0) {
            goalResources.innerHTML = '<p class="empty-state">Chưa có tài liệu nào được liên kết với mục tiêu</p>';
            return;
        }

        let resourcesHTML = '';
        Object.entries(linkedResources).forEach(([goalId, resources]) => {
            const goal = goals.find(g => g.id == goalId);
            if (goal) {
                resourcesHTML += `
                    <div class="linked-resource-group">
                        <h4>🎯 ${goal.text}</h4>
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
            }
        });

        goalResources.innerHTML = resourcesHTML;
    }

    // Helper functions
    function getCategoryIcon(category) {
        const icons = {
            'study': '📚',
            'career': '💼',
            'health': '🏃‍♂️',
            'personal': '👤',
            'financial': '💰'
        };
        return icons[category] || '🎯';
    }

    function formatDateTime(datetime) {
        return new Date(datetime).toLocaleString('vi-VN');
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    function clearForm() {
        goalInput.value = '';
        goalCategory.value = '';
        goalDescription.value = '';
        remindDatetime.value = '';
        remindRepeat.checked = false;
        repeatFrequency.disabled = true;
        repeatFrequency.value = 'daily';
        toggleRepeatFrequency();
    }

    function saveGoals() {
        localStorage.setItem('lifeGoals', JSON.stringify(goals));
    }

    function updateStats() {
        totalGoals.textContent = goals.length;
        completedGoals.textContent = goals.filter(g => g.status === 'completed').length;
        
        // Update linked resources count
        const linkedCount = Object.keys(linkedResources).length;
        linkedResourcesCount.textContent = linkedCount;
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
    window.toggleGoalStatus = function(goalId, newStatus) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            goal.status = newStatus;
            if (newStatus === 'completed') {
                goal.completedAt = new Date().toISOString();
                showNotification(`Chúc mừng! Đã hoàn thành mục tiêu: ${goal.text} 🎉`, 'success');
            } else {
                goal.completedAt = null;
            }
            saveGoals();
            updateStats();
            renderGoals();
        }
    };

    window.deleteGoal = function(goalId) {
        if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
            goals = goals.filter(g => g.id !== goalId);
            delete linkedResources[goalId];
            saveGoals();
            updateStats();
            renderGoals();
            renderLinkedResources();
            showNotification('Đã xóa mục tiêu thành công!', 'success');
        }
    };

    // Check for resources to link when returning from resources page
    const selectedGoal = JSON.parse(localStorage.getItem('selectedGoalForLinking'));
    if (selectedGoal) {
        localStorage.removeItem('selectedGoalForLinking');
        // You can add logic here to handle the returned resource linking
    }
}); 