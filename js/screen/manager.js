const appEl = document.getElementById('app');
let currentScreen = null;
const initialized = {};

function showScreen(name, state) {
  if (currentScreen && currentScreen.id === name) return false;

  if (currentScreen) {
    currentScreen.destroy();
    currentScreen = null;
  }

  const screen = SCREENS[name];
  if (!screen) return false;

  if (!initialized[name]) {
    screen.init();
    initialized[name] = true;
  }

  currentScreen = screen;
  appEl.innerHTML = screen.render(state);
  const screenEl = appEl.querySelector('.screen');
  if (screenEl) screenEl.classList.add('active');
  screen.events(state);
  if (state.screenMode === 'touch') {
    screen.orientation.lock('landscape').catch(() => {});
  }
  return true;
}
