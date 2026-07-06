class QuestionSelector {
  constructor(questionBanks) {
    this._banks = questionBanks;
    this._usedQuestions = {};
  }

  getQuestion(category) {
    const bank = this._banks[category];
    if (bank) return this._fromBank(category, bank);
    return this._genMath(category);
  }

  _fromBank(category, bank) {
    if (!this._usedQuestions[category]) this._usedQuestions[category] = new Set();
    const used = this._usedQuestions[category];
    let available = bank.filter(q => !used.has(q.text));
    if (available.length === 0) {
      this._usedQuestions[category] = new Set();
      available = bank;
    }
    const q = available[this._randInt(0, available.length - 1)];
    this._usedQuestions[category].add(q.text);
    return q;
  }

  _genMath(category) {
    if (!this._usedQuestions[category]) this._usedQuestions[category] = new Set();
    const used = this._usedQuestions[category];
    let q;
    for (let attempt = 0; attempt < 100; attempt++) {
      q = this._genMathRaw(category);
      if (!used.has(q.text)) break;
    }
    this._usedQuestions[category].add(q.text);
    return q;
  }

  _genMathRaw(category) {
    let a, b, answer;
    switch (category) {
      case 'addition':
        a = this._randInt(1, 50); b = this._randInt(1, 50); answer = a + b;
        return this._makeNumQ(`${a} + ${b} = ?`, answer);
      case 'division':
        b = this._randInt(2, 12); answer = this._randInt(1, 12); a = b * answer;
        return this._makeNumQ(`${a} ÷ ${b} = ?`, answer);
      default:
        a = this._randInt(1, 20); b = this._randInt(1, 20); answer = a + b;
        return this._makeNumQ(`${a} + ${b} = ?`, answer);
    }
  }

  _makeNumQ(text, answer) {
    const opts = new Set([answer]);
    while (opts.size < 4) {
      const offset = this._randInt(1, 10) * (Math.random() < 0.5 ? 1 : -1);
      const alt = answer + offset;
      if (alt >= 0) opts.add(alt);
    }
    const options = this._shuffle([...opts]).map(String);
    const answerIndex = options.indexOf(String(answer));
    return { text, options, answerIndex };
  }

  _randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this._randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  reset() {
    this._usedQuestions = {};
  }
}
