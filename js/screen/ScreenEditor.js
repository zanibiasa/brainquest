const ScreenEditor = {
  id: 'editor',

  init() {
    this._state = {
      screen: 'list',
      editingKey: null,
      editingCat: null,
      creating: false,
    };
    this._colorDots = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' };
    this._colorNames = [
      { color: 'red', label: 'Red' },
      { color: 'blue', label: 'Blue' },
      { color: 'green', label: 'Green' },
      { color: 'yellow', label: 'Yellow' },
    ];
    this._letters = ['A', 'B', 'C', 'D'];
  },

  _switchTo(sub) {
    this._state.screen = sub;
    const fn = sub.charAt(0).toUpperCase() + sub.slice(1);
    appEl.innerHTML = this[`_render${fn}`]();
    appEl.querySelector('.screen')?.classList.add('active');
    this[`_events${fn}`]();
  },

  render(state) {
    const es = this._state;
    if (es.screen === 'list') return this._renderList();
    if (es.screen === 'preset') return this._renderPreset();
    if (es.screen === 'questions') return this._renderQuestions();
    return '<div class="screen"></div>';
  },

  events(state) {
    const es = this._state;
    if (es.screen === 'list') return this._eventsList();
    if (es.screen === 'preset') return this._eventsPreset();
    if (es.screen === 'questions') return this._eventsQuestions();
  },

  _renderList() {
    const custom = loadCustomPresets();
    const keys = Object.keys(custom);
    let listHtml;
    if (keys.length === 0) {
      listHtml = '<div class="editor-empty">No custom presets yet — create one! ✨</div>';
    } else {
      listHtml = keys.map(key => {
        const p = custom[key];
        const catsHtml = Object.entries(p.categories || {})
          .filter(([, v]) => v)
          .map(([c]) => `${this._colorDots[c] || '⚪'} ${ALL_CATEGORY_NAMES[p.categories[c]] || p.categories[c]}`)
          .join(' ');
        return `<div class="editor-preset-card">
          <div class="editor-preset-card-info">
            <span class="editor-preset-card-icon">${p.icon || '📦'}</span>
            <div>
              <div class="editor-preset-card-name">${p.name}</div>
              <div class="editor-preset-card-cats">${catsHtml}</div>
            </div>
          </div>
          <div class="editor-preset-card-actions">
            <button class="btn-sm" data-action="edit" data-key="${key}">✏️ Edit</button>
            <button class="btn-sm btn-sm-danger" data-action="delete" data-key="${key}">🗑️</button>
          </div>
        </div>`;
      }).join('');
    }

    return `
      <div id="editor-list-screen" class="screen">
        <div class="editor-header-bar">
          <h2>✏️ Custom Presets</h2>
          <div class="editor-header-actions">
            <button id="btn-editor-back-dash" class="btn-secondary">🔙 Dashboard</button>
            <button id="btn-editor-new" class="btn-primary">➕ New Preset</button>
          </div>
        </div>
        <div id="editor-list" class="editor-list">${listHtml}</div>
      </div>`;
  },

  _eventsList() {
    document.getElementById('btn-editor-back-dash')?.addEventListener('click', () => {
      game.goToDashboard();
    });

    document.getElementById('btn-editor-new')?.addEventListener('click', () => {
      this._state.screen = 'preset';
      this._state.editingKey = null;
      this._state.creating = false;
      this._switchTo('preset');
    });

    document.querySelectorAll('[data-action="edit"]').forEach(b => {
      b.addEventListener('click', () => {
        this._state.screen = 'preset';
        this._state.editingKey = b.dataset.key;
        this._state.creating = false;
        this._switchTo('preset');
      });
    });

    document.querySelectorAll('[data-action="delete"]').forEach(b => {
      b.addEventListener('click', () => {
        const key = b.dataset.key;
        const custom = loadCustomPresets();
        if (confirm(`Delete "${custom[key]?.name}"?`)) {
          deleteCustomPreset(key);
          this._switchTo('list');
        }
      });
    });
  },

  _renderPreset() {
    const custom = loadCustomPresets();
    const data = custom[this._state.editingKey] || null;
    const existing = data?.questionBanks || {};
    const nameVal = data?.name || '';
    const iconVal = data?.icon || '';

    const catsHtml = this._colorNames.map(({ color, label }) => {
      const val = data?.categories?.[color] || '';
      const qCount = existing?.[val]?.length || 0;
      const qLabel = val ? `${qCount} Q${qCount !== 1 ? 's' : ''}` : '';
      return `<div class="editor-cat-row" data-color="${color}">
        <span class="editor-cat-dot">${this._colorDots[color]}</span>
        <span class="editor-cat-label">${label}</span>
        <input type="text" class="editor-cat-input" data-color="${color}" value="${val}" placeholder="(none)" maxlength="30">
        <button class="btn-sm btn-sm-questions" data-cat="${val}" ${!val ? 'disabled' : ''}>✏️ ${qLabel || 'Qs'}</button>
      </div>`;
    }).join('');

    return `
      <div id="editor-preset-screen" class="screen">
        <div class="editor-header-bar">
          <button id="btn-editor-preset-back" class="btn-nav-back">← Back</button>
          <h2>Preset Settings</h2>
          <button id="btn-editor-preset-save" class="btn-primary">💾 Save</button>
        </div>
        <div class="editor-preset-form">
          <div class="editor-form-col">
            <div>
              <label class="editor-field-label">Preset Name</label>
              <input type="text" id="editor-preset-name" class="editor-input" placeholder="e.g. Math v2" value="${nameVal}" maxlength="30">
            </div>
            <div>
              <label class="editor-field-label">Icon</label>
              <input type="text" id="editor-preset-icon" class="editor-input editor-input-icon" placeholder="e.g. 🧮" value="${iconVal}" maxlength="4">
            </div>
          </div>
          <div class="editor-form-col">
            <label class="editor-field-label">Categories</label>
            <div id="editor-categories" class="editor-categories">${catsHtml}</div>
          </div>
        </div>
      </div>`;
  },

  _eventsPreset() {
    document.getElementById('btn-editor-preset-back')?.addEventListener('click', () => {
      this._switchTo('list');
    });

    document.getElementById('btn-editor-preset-save')?.addEventListener('click', () => {
      const form = this._getEditorFormData();
      if (!form) return;
      saveCustomPreset(form.key, form.data);
      this._switchTo('list');
    });

    document.querySelectorAll('.btn-sm-questions').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.editor-cat-row');
        const input = row?.querySelector('.editor-cat-input');
        const cat = input?.value.trim();
        if (!cat) return;
        const custom = loadCustomPresets();
        const data = custom[this._state.editingKey];
        if (!data) return;
        data.categories = {};
        document.querySelectorAll('.editor-cat-input').forEach(inp => {
          data.categories[inp.dataset.color] = inp.value.trim() || null;
        });
        if (!data.questionBanks) data.questionBanks = {};
        if (!data.questionBanks[cat]) data.questionBanks[cat] = [];
        saveCustomPreset(this._state.editingKey, data);
        this._state.editingCat = cat;
        this._switchTo('questions');
      });
    });
  },

  _renderQuestions() {
    const custom = loadCustomPresets();
    const data = custom[this._state.editingKey];
    const questions = data?.questionBanks?.[this._state.editingCat] || [];
    const catName = ALL_CATEGORY_NAMES[this._state.editingCat] || this._state.editingCat;

    const optRow = (l, i, val = '', isCorrect = false) =>
      `<div class="editor-q-option-row">
        <button type="button" class="editor-q-opt-letter ${isCorrect ? 'is-correct' : ''}" data-idx="${i}">${l}</button>
        <input type="text" class="editor-q-opt-input" data-idx="${i}" value="${val}" placeholder="Option ${l}" maxlength="100">
      </div>`;

    let html = '';
    if (this._state.creating) {
      html += `<div class="editor-q-card" data-correct="0">
        <textarea class="editor-q-input-text" placeholder="Enter your question..." maxlength="200"></textarea>
        <div class="editor-q-opts">${this._letters.map((l, i) => optRow(l, i, '', i === 0)).join('')}</div>
        <div class="editor-q-actions">
          <button class="btn-sm" data-action="save-q" data-idx="-1">💾 Save</button>
          <button class="btn-sm btn-sm-danger" data-action="cancel-q">Cancel</button>
        </div>
      </div>`;
    }

    if (!questions || questions.length === 0) {
      if (!this._state.creating) html += '<div class="editor-empty">No questions yet — add one! ✍️</div>';
    } else {
      html += questions.map((q, i) =>
        `<div class="editor-q-card" data-idx="${i}" data-correct="${q.answerIndex}">
          <textarea class="editor-q-input-text" maxlength="200">${q.text}</textarea>
          <div class="editor-q-opts">${this._letters.map((l, oi) => optRow(l, oi, q.options[oi] || '', oi === q.answerIndex)).join('')}</div>
          <div class="editor-q-actions">
            <button class="btn-sm" data-action="save-q" data-idx="${i}">💾 Save</button>
            <button class="btn-sm btn-sm-danger" data-action="delete-q" data-idx="${i}">🗑️</button>
          </div>
        </div>`
      ).join('');
    }

    return `
      <div id="editor-questions-screen" class="screen">
        <div class="editor-header-bar">
          <button id="btn-editor-questions-back" class="btn-nav-back">← Back</button>
          <h3 id="editor-questions-title" class="editor-questions-title">Questions: ${catName}</h3>
          <button id="btn-editor-question-add" class="btn-secondary">➕ Add Question</button>
        </div>
        <div id="editor-questions-list" class="editor-questions-list">${html}</div>
      </div>`;
  },

  _eventsQuestions() {
    if (this._editorQuestionClick) {
      document.removeEventListener('click', this._editorQuestionClick);
    }

    document.getElementById('btn-editor-questions-back')?.addEventListener('click', () => {
      this._switchTo('preset');
    });

    document.getElementById('btn-editor-question-add')?.addEventListener('click', () => {
      this._state.creating = true;
      this._switchTo('questions');
    });

    document.addEventListener('click', this._editorQuestionClick = (e) => {
      const letterBtn = e.target.closest('.editor-q-opt-letter');
      if (letterBtn) {
        const card = letterBtn.closest('.editor-q-card');
        if (!card) return;
        const idx = letterBtn.dataset.idx;
        card.dataset.correct = idx;
        card.querySelectorAll('.editor-q-opt-letter').forEach(b => b.classList.remove('is-correct'));
        letterBtn.classList.add('is-correct');
        return;
      }

      const saveBtn = e.target.closest('[data-action="save-q"]');
      if (saveBtn) {
        const card = saveBtn.closest('.editor-q-card');
        if (!card) return;
        const text = card.querySelector('.editor-q-input-text')?.value.trim();
        if (!text) { alert('Please enter a question'); return; }
        const opts = [];
        card.querySelectorAll('.editor-q-opt-input').forEach(inp => {
          opts.push(inp.value.trim());
        });
        if (opts.some(o => !o)) { alert('All options must have text'); return; }
        const answerIndex = parseInt(card.dataset.correct);
        if (isNaN(answerIndex)) { alert('Select the correct answer'); return; }
        const idx = parseInt(saveBtn.dataset.idx);
        const custom = loadCustomPresets();
        const data = custom[this._state.editingKey];
        if (!data) return;
        if (!data.questionBanks) data.questionBanks = {};
        if (!data.questionBanks[this._state.editingCat]) data.questionBanks[this._state.editingCat] = [];
        const bank = data.questionBanks[this._state.editingCat];
        const question = { text, options: opts, answerIndex };
        if (idx >= 0 && idx < bank.length) {
          bank[idx] = question;
        } else {
          bank.push(question);
        }
        this._state.creating = false;
        saveCustomPreset(this._state.editingKey, data);
        this._switchTo('questions');
        return;
      }

      const cancelBtn = e.target.closest('[data-action="cancel-q"]');
      if (cancelBtn) {
        this._state.creating = false;
        this._switchTo('questions');
        return;
      }

      const delBtn = e.target.closest('[data-action="delete-q"]');
      if (delBtn) {
        const idx = parseInt(delBtn.dataset.idx);
        if (isNaN(idx)) return;
        const custom = loadCustomPresets();
        const data = custom[this._state.editingKey];
        const bank = data?.questionBanks?.[this._state.editingCat];
        if (!bank) return;
        if (!confirm(`Delete question #${idx + 1}?`)) return;
        bank.splice(idx, 1);
        this._state.creating = false;
        saveCustomPreset(this._state.editingKey, data);
        this._switchTo('questions');
        return;
      }
    });
  },

  _getEditorFormData() {
    const name = document.getElementById('editor-preset-name')?.value.trim();
    const icon = document.getElementById('editor-preset-icon')?.value.trim() || '📦';
    if (!name) { alert('Please enter a preset name'); return null; }
    const custom = loadCustomPresets();
    const key = this._state.editingKey || generateKey(name, custom);
    const catInputs = document.querySelectorAll('.editor-cat-input');
    const categories = {};
    const questionBanks = {};
    catInputs.forEach(inp => {
      const color = inp.dataset.color;
      const val = inp.value.trim();
      categories[color] = val || null;
      if (val) {
        const prevData = custom[key];
        const prevQs = prevData?.questionBanks?.[val] || [];
        questionBanks[val] = [...prevQs];
      }
    });
    return { key, data: { name, icon, categories, questionBanks } };
  },

  destroy() {
    if (this._editorQuestionClick) {
      document.removeEventListener('click', this._editorQuestionClick);
      this._editorQuestionClick = null;
    }
  },
};

window.showEditorList = function() {
  ScreenEditor._state = {
    screen: 'list',
    editingKey: null,
    editingCat: null,
    creating: false,
  };
  showScreen('editor', game.state);
};
