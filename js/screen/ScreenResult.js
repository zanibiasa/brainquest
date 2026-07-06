const ScreenResult = {
  id: 'result',

  init() {},

  render(state) {
    const players = state.players;
    let body;
    if (players.length === 0) {
      body = '<div class="lb-entry">No players yet! 😭</div>';
    } else {
      const sorted = [...players].sort((a, b) => b.score - a.score);
      body = sorted.map((p, i) => {
        let icon = '';
        if (i === 0) icon = '👑 ';
        else if (i === 1) icon = '🥈 ';
        else if (i === 2) icon = '🥉 ';
        return `<div class="lb-entry${i === 0 ? ' lb-top' : ''}">
          <span class="lb-rank">#${i + 1}</span>
          <span class="lb-name">${icon}${p.name}</span>
          <span class="lb-score">✨ ${p.score}</span>
        </div>`;
      }).join('');
    }

    return `
      <div id="result-screen" class="screen">
        <h2 class="result-title">🎉 Game Over! 🎉</h2>
        <div id="result-leaderboard" class="result-leaderboard">${body}</div>
        <button id="btn-play-again" class="btn-primary">🔄 Play Again!</button>
      </div>`;
  },

  events(state) {
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      game.resetGame();
    });
  },

  destroy() {},
};
