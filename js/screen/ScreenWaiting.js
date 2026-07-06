const ScreenWaiting = {
  id: 'waiting',

  init() {},

  render(state) {
    const showTouch = state.screenMode === 'touch';
    const showPlayers = showTouch && state.waitingMode === 'tag';
    const showCats = showTouch && state.waitingMode === 'category';

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
            <div id="waiting-status" class="waiting-status"></div>
            ${showPlayers ? `<div id="waiting-touch-players" class="touch-grid">
              <button class="touch-btn touch-player" data-tag="TAG1">1</button>
              <button class="touch-btn touch-player" data-tag="TAG2">2</button>
              <button class="touch-btn touch-player" data-tag="TAG3">3</button>
              <button class="touch-btn touch-player" data-tag="TAG4">4</button>
            </div>` : ''}
            ${showCats ? `<div id="waiting-touch-categories" class="touch-grid">
              <button class="touch-btn touch-cat" data-color="blue">🔵 Blue</button>
              <button class="touch-btn touch-cat" data-color="red">🔴 Red</button>
              <button class="touch-btn touch-cat" data-color="green">🟢 Green</button>
              <button class="touch-btn touch-cat" data-color="yellow">🟡 Yellow</button>
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
};
