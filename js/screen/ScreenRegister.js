const ScreenRegister = {
  id: 'register',

  init() {},

  render(state) {
    const showTouch = state.screenMode === 'touch';
    const preset = ALL_PRESETS[state.preset];
    const presetLabel = preset ? `${preset.icon} ${preset.name}` : '';
    const prompt = `Player ${state.players.length + 1}, select your player! 🚀`;
    const statusText = 'Waiting for tag... ⏳';
    const hasPlayers = state.players.length > 0;
    const hasName = state.registerTag !== null;

    const playerChips = state.players.map((p, i) =>
      `<div class="player-chip">👤 #${i + 1} ${p.name}</div>`
    ).join('');

    return `
      <div id="register-screen" class="screen" ${showTouch ? 'style="gap:8px;padding:12px"' : ''}>
        <h2>👥 Register Players! 👥</h2>
        <div id="reg-preset-label" class="reg-preset-label">${presetLabel}</div>
        <div id="reg-prompt" class="reg-prompt">${prompt}</div>
        ${!showTouch ? `<div id="reg-status" class="reg-status">${statusText}</div>` : ''}
        ${showTouch ? `<div id="reg-touch-players" class="touch-grid" style="gap:8px;">
          <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG1">1</button>
          <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG2">2</button>
          <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG3">3</button>
          <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG4">4</button>
        </div>` : ''}
        <div id="reg-name-area" class="reg-name-area ${hasName ? '' : 'hidden'}">
          <input type="text" id="reg-name-input" class="reg-name-input" placeholder="What's your name? 🤔" maxlength="20">
          <button id="reg-name-save" class="btn-save">Save! 💾</button>
        </div>
        <div id="reg-player-list" class="reg-player-list">${playerChips}</div>
        <div id="reg-actions" class="reg-actions ${hasPlayers ? '' : 'hidden'}">
          <button id="reg-add-player" class="btn-secondary">➕ Add Player</button>
          <button id="reg-start-game" class="btn-primary">🏁 Start Game!</button>
        </div>
      </div>`;
  },

  events(state) {
    document.getElementById('reg-name-save')?.addEventListener('click', () => {
      const inp = document.getElementById('reg-name-input');
      game.submitName(inp?.value || '');
    });

    document.getElementById('reg-name-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        game.submitName(e.target.value);
      }
    });

    document.getElementById('reg-add-player')?.addEventListener('click', () => {
      const s = game.state;
      const el = document.getElementById('reg-prompt');
      if (el) el.textContent = `Player ${s.players.length + 1}, scan your tag! 🚀`;
      const status = document.getElementById('reg-status');
      if (status) status.textContent = 'Waiting for tag... ⏳';
      const area = document.getElementById('reg-name-area');
      if (area) area.classList.add('hidden');
      const actions = document.getElementById('reg-actions');
      if (actions) actions.classList.add('hidden');
    });

    document.getElementById('reg-start-game')?.addEventListener('click', () => {
      game.startGame();
    });
  },

  destroy() {},

  updatePrompt(text) {
    const el = document.getElementById('reg-prompt');
    if (el) el.textContent = text;
  },

  updateStatus(text) {
    const el = document.getElementById('reg-status');
    if (el) el.textContent = text;
  },

  showNameArea() {
    const el = document.getElementById('reg-name-area');
    if (el) el.classList.remove('hidden');
  },

  hideNameArea() {
    const el = document.getElementById('reg-name-area');
    if (el) el.classList.add('hidden');
  },

  showActions() {
    const el = document.getElementById('reg-actions');
    if (el) el.classList.remove('hidden');
  },

  hideActions() {
    const el = document.getElementById('reg-actions');
    if (el) el.classList.add('hidden');
  },

  clearAndFocusName() {
    const inp = document.getElementById('reg-name-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
  },

  updatePlayerList(players) {
    const el = document.getElementById('reg-player-list');
    if (!el) return;
    el.innerHTML = players.map((p, i) =>
      `<div class="player-chip">👤 #${i + 1} ${p.name}</div>`
    ).join('');
  },
};
