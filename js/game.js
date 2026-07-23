const _timer = new Timer();
const _scorer = new Scorer();
const _questionSelector = new QuestionSelector(ALL_QUESTION_BANKS);

const savedDuration = parseInt(localStorage.getItem('inova_timer_duration'));
const savedFeedbackDelay = parseInt(localStorage.getItem('inova_feedback_delay'));

const game = new GameEngine({
  timer: _timer,
  scorer: _scorer,
  questionSelector: _questionSelector,
  presets: ALL_PRESETS,
  categoryNames: ALL_CATEGORY_NAMES,
  timerDuration: savedDuration || 10,
  feedbackDelay: savedFeedbackDelay || FEEDBACK_DELAY_DEFAULT,
});
