const BTN2TAG = ['blue', 'yellow', 'green', 'red'];

function processEvent(value) {
  console.log('[processEvent] received:', value, '| screen:', game.state.screen, '| screenMode:', game.state.screenMode, '| waitingMode:', game.state.waitingMode);

  const s = game.state.screen;
  if (s === 'register' || (s === 'waiting' && game.state.waitingMode === 'tag')) {
    console.log('[processEvent] in register/waiting-tag block, screenMode:', game.state.screenMode);
    if (game.state.screenMode === 'touch' && value !== 'TAG1' && value !== 'TAG2' && value !== 'TAG3' && value !== 'TAG4') {
      console.warn('[processEvent] BLOCKED by touch-only TAG1-TAG4 guard:', value);
      return;
    }
  } else if (s === 'waiting' && game.state.waitingMode === 'category') {
    console.log('[processEvent] in waiting-category block');
    const isValidColor = value === 'blue' || value === 'red' || value === 'green' || value === 'yellow';
    const cn = parseInt(value);
    const isValidBtn = !isNaN(cn) && cn >= 4 && cn <= 7;
    if (!isValidColor && !isValidBtn) {
      console.warn('[processEvent] BLOCKED by category guard:', value);
      return;
    }
  } else if (s === 'playing') {
    console.log('[processEvent] in playing block');
    const n = parseInt(value);
    if (isNaN(n) || n < 0 || n > 3) {
      console.warn('[processEvent] BLOCKED by playing guard:', value);
      return;
    }
  } else {
    console.warn('[processEvent] BLOCKED by else fallthrough for screen:', s);
    return;
  }

  const n = parseInt(value);
  if (!isNaN(n) && n >= 0 && n <= 7) {
    if (n <= 3) {
      console.log('[processEvent] calling game.onInput with:', value);
      game.onInput(value);
    } else {
      const tag = BTN2TAG[n - 4];
      console.log('[processEvent] calling game.onInput with mapped tag:', tag);
      game.onInput(tag);
    }
  } else {
    console.log('[processEvent] calling game.onInput with raw value:', value);
    game.onInput(value);
  }
}
