class Scorer {
  calculateSteps(correct, timeRemaining, timerDuration) {
    if (!correct) return 1;
    const pct = timeRemaining / timerDuration;
    if (pct > 0.7) return 3;
    if (pct > 0.3) return 2;
    return 1;
  }
}
