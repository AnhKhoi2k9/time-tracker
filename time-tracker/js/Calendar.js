const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('monthYear');

    let currentDate = new Date();

    function renderCalendar(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      calendarDays.innerHTML = '';
      monthYear.textContent = date.toLocaleString('default', { month: 'long' }) + ' ' + year;

      // Blank days
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        calendarDays.appendChild(empty);
      }

      // Days
      for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = i;
        day.addEventListener('click', () => {
          document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
          day.classList.add('selected');
          alert(`You clicked on ${i}/${month + 1}/${year}`);
        });
        calendarDays.appendChild(day);
      }
    }

    function prevMonth() {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    }

    function nextMonth() {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    }

    renderCalendar(currentDate);
    document.getElementById("quickPicker").addEventListener("change", function () {
        const selectedDate = new Date(this.value);
        if (!isNaN(selectedDate)) {
          currentDate = selectedDate;
          renderCalendar(currentDate);
        }
      });