const SCREENS = {};
const SCREEN_LIST = [
  ScreenConnect,
  ScreenDashboard,
  ScreenRegister,
  ScreenWaiting,
  ScreenPlaying,
  ScreenResult,
  ScreenSettings,
  ScreenStats,
  ScreenEditor,
];

SCREEN_LIST.forEach(s => {
  SCREENS[s.id] = s;
});
