const _timer = new Timer();
const _scorer = new Scorer();
const _questionSelector = new QuestionSelector(ALL_QUESTION_BANKS);

const game = new GameEngine({
  timer: _timer,
  scorer: _scorer,
  questionSelector: _questionSelector,
  presets: ALL_PRESETS,
  categoryNames: ALL_CATEGORY_NAMES,
  timerDuration: 10,
});
