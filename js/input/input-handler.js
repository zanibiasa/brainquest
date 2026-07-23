const BTN2TAG = ['blue', 'yellow', 'green', 'red'];

function processEvent(value) {
  const s = game.state.screen;
  if (s === 'register' || (s === 'waiting' && game.state.waitingMode === 'tag')) {
    if (value !== 'TAG1' && value !== 'TAG2' && value !== 'TAG3' && value !== 'TAG4') return;
  } else if (s === 'waiting' && game.state.waitingMode === 'category') {
    const isValidColor = value === 'blue' || value === 'red' || value === 'green' || value === 'yellow';
    const cn = parseInt(value);
    const isValidBtn = !isNaN(cn) && cn >= 4 && cn <= 7;
    if (!isValidColor && !isValidBtn) return;
  } else if (s === 'playing') {
    const n = parseInt(value);
    if (isNaN(n) || n < 0 || n > 3) return;
  } else {
    return;
  }

  const n = parseInt(value);
  if (!isNaN(n) && n >= 0 && n <= 7) {
    if (n <= 3) {
      game.onInput(value);
    } else {
      game.onInput(BTN2TAG[n - 4]);
    }
  } else {
    game.onInput(value);
  }
}
