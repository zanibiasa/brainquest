const ScreenWaiting = {
  id: 'waiting',

  init() {},

  render(state) {
    const showTouch = state.screenMode === 'touch';

    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    const leaderboard = sorted.map((p, i) => {
      const isTop = i === 0;
      const isCurrent = state.players.indexOf(p) === state.currentPlayerIdx;
      return `<div class="lb-entry${isTop ? ' lb-top' : ''}${isCurrent ? ' lb-current' : ''}">
        <span class="lb-rank">#${i + 1}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">✨ ${p.score}</span>
      </div>`;
    }).join('');

    return `
      <div id="waiting-screen" class="screen">
        <div class="waiting-body">
          <div class="waiting-main">
            <div class="waiting-prompt-text" id="waiting-prompt">${state.waitingMessage}</div>
            <div class="waiting-player-name" id="waiting-player-name"></div>
            ${!showTouch ? '<div id="waiting-status" class="waiting-status"></div>' : ''}
            ${showTouch ? `<div id="waiting-touch-players" class="touch-grid" style="gap:8px;">
              <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG1">1</button>
              <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG2">2</button>
              <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG3">3</button>
              <button class="touch-btn touch-player" style="padding:12px 8px;min-height:48px;font-size:1.2rem;" data-tag="TAG4">4</button>
            </div>
            <div id="waiting-touch-categories" class="touch-grid hidden" style="gap:8px;">
              <button class="touch-btn touch-cat" style="padding:12px 8px;min-height:48px;font-size:1.1rem;" data-color="blue">🔵 Blue</button>
              <button class="touch-btn touch-cat" style="padding:12px 8px;min-height:48px;font-size:1.1rem;" data-color="red">🔴 Red</button>
              <button class="touch-btn touch-cat" style="padding:12px 8px;min-height:48px;font-size:1.1rem;" data-color="green">🟢 Green</button>
              <button class="touch-btn touch-cat" style="padding:12px 8px;min-height:48px;font-size:1.1rem;" data-color="yellow">🟡 Yellow</button>
            </div>` : ''}
          </div>
          <div class="leaderboard-sidebar">
            <h3>🌟 Current Scores 🌟</h3>
            <div id="leaderboard-list">${leaderboard}</div>
          </div>
        </div>
        <button id="btn-end-game" class="btn-end-game">🛑 End Game</button>
      </div>`;
  },

  events(state) {
    document.getElementById('btn-end-game')?.addEventListener('click', () => {
      game.endGame();
    });
  },

  destroy() {},

  updateLeaderboard(players) {
    const el = document.getElementById('leaderboard-list');
    if (!el) return;
    const sorted = [...players].sort((a, b) => b.score - a.score);
    el.innerHTML = sorted.map((p, i) => {
      const isTop = i === 0;
      return `<div class="lb-entry${isTop ? ' lb-top' : ''}">
        <span class="lb-rank">#${i + 1}</span>
        <span class="lb-name">${p.name}</span>
        <span class="lb-score">✨ ${p.score}</span>
      </div>`;
    }).join('');
  },

  updatePrompt(text) {
    const el = document.getElementById('waiting-prompt');
    if (el) el.textContent = text;
  },

  updatePlayerName(text) {
    const el = document.getElementById('waiting-player-name');
    if (el) el.textContent = text;
  },

  updateStatus(text) {
    const el = document.getElementById('waiting-status');
    if (el) el.textContent = text;
  },

  setTouchGrid(mode) {
    const playersGrid = document.getElementById('waiting-touch-players');
    const catsGrid = document.getElementById('waiting-touch-categories');
    if (!playersGrid || !catsGrid) return;
    playersGrid.classList.toggle('hidden', mode !== 'tag');
    catsGrid.classList.toggle('hidden', mode !== 'category');
  },
};
