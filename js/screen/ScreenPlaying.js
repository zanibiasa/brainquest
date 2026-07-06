const ScreenPlaying = {
  id: 'playing',

  init() {
    this._letters = ['a', 'b', 'c', 'd'];
  },

  render(state) {
    const q = state.question;
    if (!q) return '<div id="playing-screen" class="screen"></div>';

    const player = state.players[state.currentPlayerIdx];
    const tiles = this._letters.map((l, i) => `
      <button class="answer-tile ${l}" id="ans-${l}">
        <span class="letter">${l.toUpperCase()}</span>
        <span class="answer-value">${q.options[i] || ''}</span>
      </button>`).join('');

    return `
      <div id="playing-screen" class="screen">
        <div class="top-bar">
          <div class="score-display">✨ Score: <span id="score-value">${player?.score || 0}</span></div>
          <div class="timer-display" id="timer-display">${state.timerDuration}</div>
        </div>
        <div class="game-body">
          <div class="question-area">
            <img id="question-image" class="question-image ${q.image ? '' : 'hidden'}" src="${q.image || ''}" alt="">
            <div class="question-text" id="question-text">${q.text}</div>
          </div>
          <div class="answers-grid">${tiles}</div>
        </div>
        <div class="bottom-bar">
          <span id="player-label">${player?.name || 'Player'}</span>
          <span id="category-label">${state.currentCategoryName}</span>
        </div>
      </div>`;
  },

  events(state) {
    const LETTERS = ['a', 'b', 'c', 'd'];
    LETTERS.forEach((l, i) => {
      const tile = document.getElementById(`ans-${l}`);
      if (tile) {
        tile.addEventListener('click', () => processEvent(String(i)));
      }
    });
  },

  destroy() {},

  updateTimer(remaining) {
    const el = document.getElementById('timer-display');
    if (el) {
      el.textContent = remaining;
      el.classList.toggle('warning', remaining <= 5);
    }
  },

  updateScore(value) {
    const el = document.getElementById('score-value');
    if (el) el.textContent = value;
  },

  showFeedback(correct, index, question) {
    const letters = ['a', 'b', 'c', 'd'];
    letters.forEach((l, i) => {
      const tile = document.getElementById(`ans-${l}`);
      if (!tile) return;
      if (i === question.answerIndex) {
        tile.classList.add('correct');
      } else if (i === index && !correct) {
        tile.classList.add('wrong');
      } else {
        tile.classList.add('reveal');
      }
    });
  },

  showTimeout(question) {
    const letters = ['a', 'b', 'c', 'd'];
    letters.forEach((l, i) => {
      const tile = document.getElementById(`ans-${l}`);
      if (!tile) return;
      if (i === question.answerIndex) {
        tile.classList.add('correct');
      } else {
        tile.classList.add('reveal');
      }
    });
  },
};
