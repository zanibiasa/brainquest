const ScreenStats = {
  id: 'statistics',

  init() {
    this._currentPlayer = null;
    this._players = [];
    this._data = {};
  },

  render(state) {
    if (!this._currentPlayer && state.players.length > 0) {
      this._currentPlayer = state.players[0].name;
    }
    this._players = state.players;
    this._data = state.playerStats;

    const tabs = this._players.map(p =>
      `<button class="stats-tab${p.name === this._currentPlayer ? ' active' : ''}" data-player="${p.name}">${p.name}</button>`
    ).join('');

    const tableBody = this._renderTable();

    return `
      <div id="statistics-screen" class="screen">
        <h2>📊 Game Statistics 📊</h2>
        <div id="stats-player-tabs" class="stats-tabs">${tabs}</div>
        <div id="stats-table" class="stats-table">${tableBody}</div>
        <button id="btn-back-from-stats" class="btn-secondary" style="max-width:300px;margin:0 auto;">🔙 Back to Results</button>
      </div>`;
  },

  events(state) {
    const tabs = document.getElementById('stats-player-tabs');
    if (tabs) {
      tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.stats-tab');
        if (!tab) return;
        this._currentPlayer = tab.dataset.player;
        const state = game.state;
        const tableEl = document.getElementById('stats-table');
        if (tableEl) {
          this._players = state.players;
          this._data = state.playerStats;
          tableEl.innerHTML = this._renderTable();
        }
        tabs.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    }

    document.getElementById('btn-back-from-stats')?.addEventListener('click', () => {
      game.backToResults();
    });
  },

  _renderTable() {
    const pStats = this._data[this._currentPlayer];
    if (!pStats || Object.keys(pStats).length === 0) {
      return '<div class="stats-empty">No data yet — play a game first! 🎮</div>';
    }
    const catNames = typeof CATEGORY_NAMES !== 'undefined' ? CATEGORY_NAMES : {};
    const rows = Object.entries(pStats).map(([cat, s]) => {
      const total = s.correct + s.wrong;
      const accuracy = total > 0 ? Math.round((s.correct / total) * 100) : 0;
      const avgSpeed = s.count > 0 ? (s.totalTime / s.count).toFixed(1) : '—';
      let verdict, verdictClass;
      if (accuracy >= 70) { verdict = '💪 Strong'; verdictClass = 'strong'; }
      else if (accuracy >= 50) { verdict = '📘 Mixed'; verdictClass = 'mixed'; }
      else { verdict = '🎯 Needs Work'; verdictClass = 'weak'; }
      const topic = catNames[cat] || cat;
      return `<div class="stats-row">
        <div class="stats-cell topic">${topic}</div>
        <div class="stats-cell">${s.correct}</div>
        <div class="stats-cell">${s.wrong}</div>
        <div class="stats-cell stats-accuracy">${accuracy}%</div>
        <div class="stats-cell stats-speed">${avgSpeed}s</div>
        <div class="stats-cell"><span class="stats-verdict ${verdictClass}">${verdict}</span></div>
      </div>`;
    }).join('');
    return `<div class="stats-table-header">
      <div>Topic</div><div>✅ Correct</div><div>❌ Wrong</div><div>🎯 Accuracy</div><div>⚡ Avg Speed</div><div>Verdict</div>
    </div>${rows}`;
  },

  destroy() {},
};
