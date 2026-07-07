const ScreenConnect = {
  id: 'connect',

  init() {
    this._touchMode = false;
    document.addEventListener('fullscreenchange', () => {
      const btn = document.getElementById('btn-fullscreen');
      if (btn) btn.textContent = document.fullscreenElement ? '⛶ Exit' : '⛶ Fullscreen';
    });
  },

  render(state) {
    const isConnected = state.screenMode === 'touch';
    const statusClass = isConnected ? 'connected' : 'connecting';
    const statusText = isConnected ? 'Touch Mode 🖐️' : 'Connecting to host...';
    return `
      <div id="connect-screen" class="screen">
        <h1>🧠 Brain Quest! ✨</h1>
        <div id="conn-status"><span class="status-dot ${statusClass}"></span>${statusText}</div>
        <button id="btn-keyboard-mode" class="btn-secondary" style="max-width:320px;margin-top:12px;">🖐️ Touch Mode</button>
        <button id="btn-fullscreen" class="btn-secondary" style="max-width:320px;margin-top:8px;">⛶ Fullscreen</button>
        <button id="btn-rescan" class="btn-secondary" style="max-width:320px;margin-top:8px;background:#8b5cf6;border-color:#a78bfa;">🔄 Re-scan ESP</button>
        <div class="conn-divider">— or —</div>
        <div class="conn-manual-row">
          <input type="text" id="conn-manual-ip" class="conn-ip-input" placeholder="e.g. 192.168.1.58" maxlength="15">
          <button id="btn-conn-connect" class="btn-conn-connect">Connect</button>
        </div>
      </div>`;
  },

  events(state) {
    document.getElementById('btn-keyboard-mode')?.addEventListener('click', () => {
      poller.stop();
      game.state.screenMode = 'touch';
      const el = document.getElementById('conn-status');
      if (el) el.innerHTML = '<span class="status-dot connected"></span>Touch Mode 🖐️';
      setTimeout(() => game.goToDashboard(), 400);
    });

    document.getElementById('btn-fullscreen')?.addEventListener('click', async () => {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        try { await screen.orientation.lock('landscape'); } catch {}
      } else {
        await document.exitFullscreen();
      }
    });

    document.getElementById('btn-rescan')?.addEventListener('click', async () => {
      localStorage.removeItem('inova_esp_ip');
      poller.stop();
      const el = document.getElementById('conn-status');
      if (el) el.innerHTML = '<span class="status-dot connecting"></span>Scanning for ESP32... 🔍';
      const found = await discoverESP(ESP_CANDIDATES, '58', (msg) => {
        if (el) el.innerHTML = `<span class="status-dot connecting"></span>${msg}`;
      });
      if (found) {
        ESP_IP = found;
        localStorage.setItem('inova_esp_ip', found);
        if (el) el.innerHTML = `<span class="status-dot connected"></span>Found at ${found} ✅`;
        poller.url = `http://${found}`;
        if (typeof startPoller === 'function') startPoller();
      } else {
        if (el) el.innerHTML = '<span class="status-dot disconnected"></span>Could not find ESP32 ⚠️';
      }
    });

    document.getElementById('btn-conn-connect')?.addEventListener('click', () => {
      const ip = document.getElementById('conn-manual-ip').value.trim();
      tryManualConnect(ip);
    });

    document.getElementById('conn-manual-ip')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const ip = e.target.value.trim();
        tryManualConnect(ip);
      }
    });
  },

  destroy() {},
};
