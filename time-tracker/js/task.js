const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekContainer = document.getElementById('week');

    daysOfWeek.forEach(day => {
      // Tạo cột cho mỗi ngày
      const column = document.createElement('div');
      column.className = 'day-column';

      // Tiêu đề ngày
      const header = document.createElement('h2');
      header.textContent = day;

      // Danh sách task
      const taskList = document.createElement('ul');
      taskList.className = 'task-list';

      // Input thêm task
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Add task for ${day}`;

      const button = document.createElement('button');
      button.textContent = 'Add';

      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'add-task';
      inputWrapper.appendChild(input);
      inputWrapper.appendChild(button);

      // Sự kiện thêm task
      button.onclick = () => {
        const taskText = input.value.trim();
        if (taskText === '') return;

        const li = document.createElement('li');
        li.className = 'task-item';

        const span = document.createElement('span');
        span.textContent = taskText;
        span.style.cursor = 'pointer';
        span.onclick = () => li.classList.toggle('completed');

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '🗑️';
        delBtn.onclick = () => li.remove();

        actions.appendChild(delBtn);
        li.appendChild(span);
        li.appendChild(actions);
        taskList.appendChild(li);

        input.value = '';
      };

      // Tạo layout
      column.appendChild(header);
      column.appendChild(taskList);
      column.appendChild(inputWrapper);
      weekContainer.appendChild(column);
    });