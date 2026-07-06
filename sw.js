const CACHE = "brain-quest-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/config.js",
  "/js/questions.js",
  "/js/game/Timer.js",
  "/js/game/Scorer.js",
  "/js/game/QuestionSelector.js",
  "/js/game/GameEngine.js",
  "/js/game.js",
  "/js/httppolling.js",
  "/js/input/input-handler.js",
  "/js/screen/ScreenConnect.js",
  "/js/screen/ScreenDashboard.js",
  "/js/screen/ScreenRegister.js",
  "/js/screen/ScreenWaiting.js",
  "/js/screen/ScreenPlaying.js",
  "/js/screen/ScreenResult.js",
  "/js/screen/ScreenSettings.js",
  "/js/screen/ScreenStats.js",
  "/js/screen/ScreenEditor.js",
  "/js/screen/index.js",
  "/js/screen/manager.js",
  "/js/app.js",
  "/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
