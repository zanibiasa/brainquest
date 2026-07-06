const CUSTOM_PRESETS_KEY = 'inova_custom_presets';

function loadCustomPresets() {
  return JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) || '{}');
}

function saveCustomPresetsToDisk(data) {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(data));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'untitled';
}

function generateKey(name, existing) {
  let key = slugify(name);
  if (!existing[key]) return key;
  let n = 2;
  while (existing[key + '_' + n]) n++;
  return key + '_' + n;
}

const ALL_PRESETS = {};
const ALL_QUESTION_BANKS = {};
const ALL_CATEGORY_NAMES = {};

function initCustomPresets() {
  Object.assign(ALL_PRESETS, PRESETS);
  Object.assign(ALL_QUESTION_BANKS, QUESTION_BANKS);
  Object.assign(ALL_CATEGORY_NAMES, CATEGORY_NAMES);

  const custom = loadCustomPresets();
  for (const [presetKey, preset] of Object.entries(custom)) {
    const cats = {};
    if (preset.questionBanks) {
      for (const [color, catName] of Object.entries(preset.categories)) {
        if (!catName) { cats[color] = null; continue; }
        const nsKey = presetKey + '_' + slugify(catName);
        cats[color] = nsKey;
        ALL_CATEGORY_NAMES[nsKey] = catName;
        if (preset.questionBanks[catName]) {
          ALL_QUESTION_BANKS[nsKey] = preset.questionBanks[catName];
        }
      }
    }
    ALL_PRESETS[presetKey] = { name: preset.name, icon: preset.icon, categories: cats };
  }
}

function saveCustomPreset(key, data) {
  const all = loadCustomPresets();
  all[key] = data;
  saveCustomPresetsToDisk(all);
  initCustomPresets();
}

function deleteCustomPreset(key) {
  const all = loadCustomPresets();
  delete all[key];
  saveCustomPresetsToDisk(all);
  initCustomPresets();
}

initCustomPresets();
