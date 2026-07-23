const ScreenSettings = {
  id: 'settings',

  init() {},

  render(state) {
    const savedPoll = parseInt(localStorage.getItem('inova_poll_rate')) || 100;
    const savedFeedbackDelay = parseInt(localStorage.getItem('inova_feedback_delay')) || 3000;
    return `
      <div id="settings-screen" class="screen">
        <h2>⚙️ Settings ⚙️</h2>
        <div class="settings-card">
          <label class="settings-label">⏱️ Timer Duration</label>
          <div class="settings-slider-row">
            <span class="settings-slider-label">5s</span>
            <input type="range" id="settings-timer-slider" class="settings-slider" min="5" max="20" step="1" value="${state.timerDuration}">
            <span class="settings-slider-label">20s</span>
          </div>
          <div id="settings-timer-value" class="settings-value">${state.timerDuration} seconds</div>
        </div>
        <div class="settings-card">
          <label class="settings-label">🎬 Feedback Duration</label>
          <div class="settings-slider-row">
            <span class="settings-slider-label">1s</span>
            <input type="range" id="settings-feedback-slider" class="settings-slider" min="1000" max="5000" step="500" value="${savedFeedbackDelay}">
            <span class="settings-slider-label">5s</span>
          </div>
          <div id="settings-feedback-value" class="settings-value">${savedFeedbackDelay / 1000} seconds</div>
        </div>
        <div class="settings-card">
          <label class="settings-label">⚡ Polling Rate</label>
          <div class="settings-slider-row">
            <span class="settings-slider-label">50ms</span>
            <input type="range" id="settings-poll-slider" class="settings-slider" min="50" max="1000" step="50" value="${savedPoll}">
            <span class="settings-slider-label">1000ms</span>
          </div>
          <div id="settings-poll-value" class="settings-value">${savedPoll} ms</div>
        </div>
        <button id="btn-back-from-settings" class="btn-secondary" style="max-width:300px;margin:0 auto;">🔙 Back</button>
      </div>`;
  },

  events(state) {
    document.getElementById('settings-timer-slider')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      game.setTimerDuration(val);
      localStorage.setItem('inova_timer_duration', val);
      const display = document.getElementById('settings-timer-value');
      if (display) display.textContent = `${val} seconds`;
    });

    document.getElementById('settings-feedback-slider')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      game.setFeedbackDelay(val);
      localStorage.setItem('inova_feedback_delay', val);
      const display = document.getElementById('settings-feedback-value');
      if (display) display.textContent = `${val / 1000} seconds`;
    });

    document.getElementById('settings-poll-slider')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      const display = document.getElementById('settings-poll-value');
      if (display) display.textContent = `${val} ms`;
      poller.setInterval(val);
      localStorage.setItem('inova_poll_rate', val);
    });

    document.getElementById('btn-back-from-settings')?.addEventListener('click', () => {
      game.backFromSettings();
    });
  },

  destroy() {},
};
