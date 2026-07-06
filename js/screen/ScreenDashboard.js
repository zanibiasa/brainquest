const ScreenDashboard = {
  id: 'dashboard',

  init() {},

  render(state) {
    const colorDots = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' };
    const cards = Object.entries(ALL_PRESETS).map(([key, preset]) => {
      const catLines = Object.entries(preset.categories)
        .filter(([, cat]) => cat)
        .map(([color, cat]) =>
          `<div class="preset-cat-line">${colorDots[color]} ${ALL_CATEGORY_NAMES[cat] || cat}</div>`
        ).join('');
      return `<button class="preset-card" data-preset="${key}">
        <span class="preset-icon">${preset.icon}</span>
        <span class="preset-name">${preset.name}</span>
        <div class="preset-cats">${catLines}</div>
      </button>`;
    }).join('');

    return `
      <div id="dashboard-screen" class="screen">
        <h1>🧠 Brain Quest! ✨</h1>
        <h2 class="dash-subtitle">✨ Select Your Adventure! ✨</h2>
        <div id="preset-scroll" class="preset-scroll">
          <div class="preset-grid" id="preset-grid">${cards}</div>
        </div>
        <button id="btn-custom-presets" class="btn-custom-presets">✏️ Custom Presets</button>
      </div>`;
  },

  events(state) {
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        game.onPresetSelect(card.dataset.preset);
      });
    });

    document.getElementById('btn-custom-presets')?.addEventListener('click', showEditorList);
  },

  destroy() {},
};
