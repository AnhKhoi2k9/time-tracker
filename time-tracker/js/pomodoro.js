  let timerDisplay = document.getElementById("timer");
    let startPauseBtn = document.getElementById("startPause");
    let resetBtn = document.getElementById("reset");
    let interval;
    let isRunning = false;
    let currentDuration = 25 * 60;
    let remainingTime = currentDuration;

    const modes = {
      pomodoro: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    };

    function updateDisplay() {
      let mins = Math.floor(remainingTime / 60).toString().padStart(2, '0');
      let secs = (remainingTime % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${mins}:${secs}`;
    }

    function startPause() {
      if (isRunning) {
        clearInterval(interval);
        startPauseBtn.textContent = "▶️";
      } else {
        interval = setInterval(() => {
          if (remainingTime > 0) {
            remainingTime--;
            updateDisplay();
          } else {
            clearInterval(interval);
            alert("⏰ Hết giờ!");
            isRunning = false;
            startPauseBtn.textContent = "▶️";
          }
        }, 1000);
        startPauseBtn.textContent = "⏸️";
      }
      isRunning = !isRunning;
    }

    function resetTimer() {
      clearInterval(interval);
      isRunning = false;
      startPauseBtn.textContent = "▶️";
      remainingTime = currentDuration;
      updateDisplay();
    }

    function switchMode(mode) {
      clearInterval(interval);
      isRunning = false;
      startPauseBtn.textContent = "▶️";
      currentDuration = modes[mode];
      remainingTime = currentDuration;
      updateDisplay();

      document.querySelectorAll('.mode-switch button').forEach(btn => btn.classList.remove('active'));
      document.getElementById(mode).classList.add('active');
    }

    document.getElementById("pomodoro").onclick = () => switchMode("pomodoro");
    document.getElementById("shortBreak").onclick = () => switchMode("shortBreak");
    document.getElementById("longBreak").onclick = () => switchMode("longBreak");

    startPauseBtn.onclick = startPause;
    resetBtn.onclick = resetTimer;

    updateDisplay();