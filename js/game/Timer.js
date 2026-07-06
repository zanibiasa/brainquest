class Timer {
  constructor() {
    this._interval = null;
    this._duration = 0;
    this._remaining = 0;
    this.onTick = null;
    this.onExpire = null;
  }

  start(duration) {
    this.stop();
    this._duration = duration;
    this._remaining = duration;
    this.onTick?.(this._remaining);
    this._interval = setInterval(() => {
      this._remaining--;
      this.onTick?.(this._remaining);
      if (this._remaining <= 0) {
        this.stop();
        this.onExpire?.();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this._interval);
    this._interval = null;
  }

  get remaining() {
    return this._remaining;
  }
}
