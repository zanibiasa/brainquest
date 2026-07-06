class GameEngine {
  constructor({ timer, scorer, questionSelector, presets, categoryNames, timerDuration }) {
    this.state = {
      screen: 'connect',
      preset: null,
      players: [],
      currentPlayerIdx: -1,
      currentCategory: null,
      currentCategoryName: '',
      registerTag: null,
      question: null,
      timeRemaining: 0,
      answered: false,
      feedback: null,
      timerDuration: timerDuration ?? 10,
      waitingMessage: '',
      waitingMode: 'tag',
      answerHistory: [],
      playerStats: {},
    };
    this._observers = [];
    this._pendingNameTag = null;
    this._prevScreen = null;
    this._waitingMode = 'tag';
    this.state.waitingMode = 'tag';

    this._timer = timer;
    this._timer.onTick = remaining => this._onTimerTick(remaining);
    this._timer.onExpire = () => this._onTimerExpire();

    this._scorer = scorer;
    this._questionSelector = questionSelector;
    this._presets = presets;
    this._categoryNames = categoryNames;
  }

  subscribe(fn) {
    this._observers.push(fn);
  }

  _notify(change) {
    this._observers.forEach(fn => fn(this.state, change));
  }

  goToDashboard() {
    this.state.screen = 'dashboard';
    this._notify({ type: 'dashboard' });
  }

  onPresetSelect(presetKey) {
    this.state.preset = presetKey;
    this.state.players = [];
    this.state.screen = 'register';
    this._pendingNameTag = null;
    this._waitingMode = 'tag';
    this.state.waitingMode = 'tag';
    this._notify({ type: 'preset_selected', preset: presetKey });
    this._notify({ type: 'next_registration' });
  }

  onInput(value) {
    if (this.state.screen === 'playing' && !this.state.answered) {
      const n = parseInt(value);
      if (!isNaN(n) && n >= 0 && n <= 3) {
        this._handleAnswer(n);
        return;
      }
    }
    this._handleTag(value);
  }

  _handleTag(uid) {
    if (this.state.screen === 'register') {
      if (this.state.players.some(p => p.tag === uid)) return;
      this._pendingNameTag = uid;
      this.state.registerTag = uid;
      this._notify({ type: 'tag_scanned_registration', tag: uid });
      return;
    }

    if (this.state.screen === 'waiting' && this._waitingMode === 'tag') {
      const idx = this.state.players.findIndex(p => p.tag === uid);
      if (idx === -1) {
        this.state.waitingMessage = 'Unknown tag — player not registered';
        this._notify({ type: 'unknown_tag' });
        return;
      }
      this.state.currentPlayerIdx = idx;
      const player = this.state.players[idx];
      player.turnCount++;

      if (player.turnCount === 1) {
        const preset = this._presets[this.state.preset];
        const catKeys = Object.values(preset.categories).filter(Boolean);
        const catKey = catKeys[Math.floor(Math.random() * catKeys.length)];
        this.state.currentCategory = catKey;
        this.state.currentCategoryName = this._categoryNames[catKey] || catKey;
        this.state.waitingMessage = `${player.name} gets ${this.state.currentCategoryName}`;
        this._notify({ type: 'first_turn' });
        this._startPlaying();
      } else {
        this._waitingMode = 'category';
        this.state.waitingMode = 'category';
        this.state.waitingMessage = `${player.name}, scan a category tag`;
        this._notify({ type: 'waiting_category' });
      }
      return;
    }

    if (this.state.screen === 'waiting' && this._waitingMode === 'category') {
      const color = TAG_COLORS[uid];
      if (!color) {
        this.state.waitingMessage = 'Unknown tag — scan a category tag';
        this._notify({ type: 'invalid_category' });
        return;
      }
      const preset = this._presets[this.state.preset];
      const catKey = preset.categories[color];
      if (!catKey) {
        this.state.waitingMessage = `No ${color} category for ${preset.name}`;
        this._notify({ type: 'invalid_category' });
        return;
      }
      this.state.currentCategory = catKey;
      this.state.currentCategoryName = this._categoryNames[catKey] || catKey;
      this._startPlaying();
      return;
    }
  }

  submitName(name) {
    if (!this._pendingNameTag) return;
    const trimmed = name.trim() || `Player ${this.state.players.length + 1}`;
    this.state.players.push({
      tag: this._pendingNameTag,
      name: trimmed,
      score: 0,
      correctCount: 0,
      turnCount: 0,
    });
    this._pendingNameTag = null;
    this.state.registerTag = null;
    this._notify({ type: 'player_added' });
    this._notify({ type: 'next_registration' });
  }

  startGame() {
    if (this.state.players.length === 0) return;
    this.state.screen = 'waiting';
    this._waitingMode = 'tag';
    this.state.waitingMode = 'tag';
    this.state.waitingMessage = 'Next player, scan your tag';
    this._notify({ type: 'game_started' });
  }

  _handleAnswer(index) {
    if (this.state.screen !== 'playing') return;
    if (this.state.answered) return;

    this.state.answered = true;
    this._timer.stop();

    const correct = index === this.state.question.answerIndex;
    this.state.feedback = correct ? 'correct' : 'wrong';

    const player = this.state.players[this.state.currentPlayerIdx];
    if (correct) {
      player.score += this._scorer.calculateScore(this.state.timeRemaining);
      player.correctCount++;
    }

    this._recordAnswer(correct, this.state.timeRemaining);
    this._notify({ type: 'answer', correct, index, playerName: player?.name });
    setTimeout(() => this._afterAnswer(), 1500);
  }

  _startPlaying() {
    this.state.screen = 'playing';
    this.state.question = this._questionSelector.getQuestion(this.state.currentCategory);
    this.state.answered = false;
    this.state.feedback = null;
    this.state.timeRemaining = this.state.timerDuration;
    this._notify({ type: 'question' });
    this._timer.start(this.state.timerDuration);
  }

  _afterAnswer() {
    this.state.screen = 'waiting';
    this._waitingMode = 'tag';
    this.state.waitingMode = 'tag';
    this.state.currentPlayerIdx = -1;
    this.state.currentCategory = null;
    this.state.waitingMessage = 'Next player, scan your tag';
    this._notify({ type: 'next_turn' });
  }

  _onTimerTick(remaining) {
    this.state.timeRemaining = remaining;
    this._notify({ type: 'timer' });
  }

  _onTimerExpire() {
    if (!this.state.answered) {
      this.state.answered = true;
      this.state.feedback = 'timeout';
      this._recordAnswer(false, 0);
      this._notify({ type: 'timeout' });
      setTimeout(() => this._afterAnswer(), 1500);
    }
  }

  _recordAnswer(correct, timeRemaining) {
    const player = this.state.players[this.state.currentPlayerIdx];
    const cat = this.state.currentCategory;
    if (!player || !cat) return;
    this.state.answerHistory.push({ playerName: player.name, category: cat, correct, timeRemaining });
    if (!this.state.playerStats[player.name]) this.state.playerStats[player.name] = {};
    if (!this.state.playerStats[player.name][cat]) {
      this.state.playerStats[player.name][cat] = { correct: 0, wrong: 0, totalTime: 0, count: 0 };
    }
    const s = this.state.playerStats[player.name][cat];
    if (correct) s.correct++; else s.wrong++;
    s.totalTime += timeRemaining;
    s.count++;
  }

  viewStats() {
    this.state.screen = 'statistics';
    this._notify({ type: 'statistics' });
  }

  backToResults() {
    this.state.screen = 'result';
    this._notify({ type: 'back_to_results' });
  }

  goToSettings() {
    this._prevScreen = this.state.screen;
    this.state.screen = 'settings';
    this._notify({ type: 'settings' });
  }

  backFromSettings() {
    this.state.screen = this._prevScreen || 'dashboard';
    this._notify({ type: this.state.screen });
  }

  setTimerDuration(seconds) {
    this.state.timerDuration = seconds;
    this._notify({ type: 'timer_duration_changed', duration: seconds });
  }

  endGame() {
    this._timer.stop();
    this.state.screen = 'result';
    this.state.players.sort((a, b) => b.score - a.score);
    this._notify({ type: 'game_end' });
  }

  resetGame() {
    this._timer.stop();
    this.state.screen = 'dashboard';
    this.state.preset = null;
    this.state.players = [];
    this.state.currentPlayerIdx = -1;
    this.state.currentCategory = null;
    this.state.registerTag = null;
    this._pendingNameTag = null;
    this._questionSelector.reset();
    this._waitingMode = 'tag';
    this.state.waitingMode = 'tag';
    this.state.answerHistory = [];
    this.state.playerStats = {};
    this._notify({ type: 'reset' });
  }
}
