const $ = id => document.getElementById(id);
const savedPoll = parseInt(localStorage.getItem('inova_poll_rate')) || 100;
const poller = new EventPoller(`http://${ESP_IP}`, savedPoll);
let pollerStarted = false;

const IMG_CACHE = 'brain-quest-images-v1';

async function precacheImages() {
  const statusEl = $('conn-status');
  if (!statusEl) return;
  try {
    const cache = await caches.open(IMG_CACHE);
    const cached = await cache.match(IMAGE_CACHE_URLS[0]);
    if (cached && cached.ok) return;
    statusEl.innerHTML = '<span class="status-dot connecting"></span>Caching images... 🖼️';
    let done = 0;
    const total = IMAGE_CACHE_URLS.length;
    await Promise.allSettled(IMAGE_CACHE_URLS.map(async url => {
      try {
        const r = await fetch(url);
        if (r.ok) await cache.put(url, r);
      } catch {}
      done++;
      if (done % 15 === 0 || done === total) {
        statusEl.innerHTML = `<span class="status-dot connecting"></span>Caching images ${done}/${total}... 🖼️`;
      }
    }));
    if (statusEl.innerHTML.includes('Caching')) {
      statusEl.innerHTML = '<span class="status-dot connected"></span>Connecting to host...';
    }
  } catch {}
}

function startPoller() {
  if (pollerStarted) return;
  pollerStarted = true;
  poller.onStatus = (status) => {
    const el = $('conn-status');
    if (!el) return;
    if (status === 'connected') {
      if (game.state.screen === 'connect') {
        el.innerHTML = '<span class="status-dot connected"></span>Connected!';
        game.goToDashboard();
      }
    } else {
      el.innerHTML = '<span class="status-dot disconnected"></span>Disconnected';
    }
  };
  poller.onEvent = (value) => processEvent(value);
  poller.start();
}

async function discoverESP(candidates, suffix, onProgress) {
  for (const subnet of candidates) {
    const ip = `${subnet}.${suffix}`;
    onProgress?.(`Trying ${ip}...`);
    try {
      const r = await fetch(`http://${ip}/api/status`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) return ip;
    } catch {}
  }
  return null;
}

function isValidIP(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return n >= 0 && n <= 255 && String(n) === p;
  });
}

async function tryManualConnect(ip) {
  const statusEl = $('conn-status');
  if (!ip) {
    statusEl.innerHTML = '<span class="status-dot disconnected"></span>Please enter an IP address ⚠️';
    return;
  }
  if (!isValidIP(ip)) {
    statusEl.innerHTML = '<span class="status-dot disconnected"></span>Invalid IP format ⚠️';
    return;
  }
  statusEl.innerHTML = `<span class="status-dot connecting"></span>Trying ${ip}...`;
  try {
    const r = await fetch(`http://${ip}/api/status`, { signal: AbortSignal.timeout(5000) });
    if (r.ok) {
      ESP_IP = ip;
      localStorage.setItem('inova_esp_ip', ip);
      poller.stop();
      pollerStarted = false;
      poller.url = `http://${ip}`;
      statusEl.innerHTML = `<span class="status-dot connected"></span>Connected to ${ip} ✅`;
      startPoller();
    } else {
      statusEl.innerHTML = `<span class="status-dot disconnected"></span>ESP at ${ip} returned error ⚠️`;
    }
  } catch {
    statusEl.innerHTML = `<span class="status-dot disconnected"></span>Could not reach ${ip} ⚠️`;
  }
}

const savedIP = localStorage.getItem('inova_esp_ip');
if (savedIP) {
  ESP_IP = savedIP;
  startPoller();
} else {
  discoverESP(ESP_CANDIDATES, '58', (msg) => {
    const el = $('conn-status');
    if (el) el.innerHTML = `<span class="status-dot connecting"></span>${msg}`;
  }).then(found => {
    if (found) {
      ESP_IP = found;
      localStorage.setItem('inova_esp_ip', found);
      const el = $('conn-status');
      if (el) el.innerHTML = `<span class="status-dot connected"></span>Found at ${found} ✅`;
      poller.url = `http://${found}`;
      startPoller();
    }
  });
}

function updateTouchLabels() {
  document.querySelectorAll('.touch-player[data-tag]').forEach(btn => {
    const p = game.state.players.find(pl => pl.tag === btn.dataset.tag);
    btn.textContent = p ? p.name : btn.dataset.tag.replace('TAG', '');
  });
}

const handlers = {
  tag_scanned_registration: (state, change) => {
    const s = SCREENS.register;
    s.updateStatus(`Tag detected: ${change.tag} ✨`);
    s.showNameArea();
    s.clearAndFocusName();
  },
  player_added: (state) => {
    const s = SCREENS.register;
    s.hideNameArea();
    s.updatePlayerList(state.players);
    if (state.players.length >= 1) s.showActions();
    if (state.screenMode === 'touch') updateTouchLabels();
  },
  next_registration: (state) => {
    const s = SCREENS.register;
    s.updatePrompt(`Player ${state.players.length + 1}, select your player! 🚀`);
    s.updateStatus('Waiting for tag... ⏳');
    s.hideNameArea();
    if (state.players.length === 0) s.hideActions();
    s.updatePlayerList(state.players);
  },
  game_started: (state) => {
    const s = SCREENS.waiting;
    s.updatePrompt(state.waitingMessage);
    s.updatePlayerName('');
    s.updateStatus('');
    if (state.screenMode === 'touch') { s.setTouchGrid('tag'); updateTouchLabels(); }
  },
  unknown_tag: (state) => {
    SCREENS.waiting.updateStatus(state.waitingMessage);
  },
  waiting_category: (state) => {
    const s = SCREENS.waiting;
    s.updatePrompt('Press a color button for your category! 🧭');
    s.updatePlayerName(state.players[state.currentPlayerIdx]?.name || '');
    s.updateStatus('');
    if (state.screenMode === 'touch') s.setTouchGrid('category');
  },
  category_selected: (state) => {
    const s = SCREENS.waiting;
    s.updatePrompt('Category selected! Get ready...');
    s.updatePlayerName(state.players[state.currentPlayerIdx]?.name || '');
    s.updateStatus(state.waitingMessage);
    if (state.screenMode === 'touch') s.setTouchGrid('category');
  },
  first_turn: (state) => {
    SCREENS.waiting.updateStatus(state.waitingMessage);
  },
  invalid_category: (state) => {
    SCREENS.waiting.updateStatus(state.waitingMessage);
  },
  timer: (state) => {
    SCREENS.playing.updateTimer(state.timeRemaining);
  },
  answer: (state, change) => {
    SCREENS.playing.showFeedback(change.correct, change.index, state.question);
    SCREENS.playing.showStepFeedback(change.steps, change.correct);
    const player = state.players[state.currentPlayerIdx];
    if (player) SCREENS.playing.updateScore(player.score);
  },
  timeout: (state, change) => {
    SCREENS.playing.showTimeout(state.question);
    SCREENS.playing.showStepFeedback(change.steps);
    const player = state.players[state.currentPlayerIdx];
    if (player) SCREENS.playing.updateScore(player.score);
  },
  next_turn: (state) => {
    const s = SCREENS.waiting;
    s.updateLeaderboard(state.players);
    s.updatePrompt(state.waitingMessage);
    s.updatePlayerName('');
    s.updateStatus('');
    if (state.screenMode === 'touch') { s.setTouchGrid('tag'); updateTouchLabels(); }
  },
};

game.subscribe((state, change) => {
  showScreen(state.screen, state);
  handlers[change.type]?.(state, change);
});

document.addEventListener('click', (e) => {
  const playerBtn = e.target.closest('.touch-player');
  if (playerBtn) { processEvent(playerBtn.dataset.tag); return; }
  const catBtn = e.target.closest('.touch-cat');
  if (catBtn) { processEvent(catBtn.dataset.color); }
});

$('btn-stats')?.addEventListener('click', () => game.viewStats());
$('btn-settings')?.addEventListener('click', () => game.goToSettings());

showScreen('connect', game.state);
precacheImages();
