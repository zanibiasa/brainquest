class Scorer {
  calculateScore(timeRemaining) {
    return Math.max(100, timeRemaining * 10 + 50);
  }
}
