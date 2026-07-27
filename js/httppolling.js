class EventPoller {
  constructor(url, interval = 100) {
    this.url = url;
    this.interval = interval;
    this.onEvent = null;
    this.onStatus = null;
    this._timer = null;
  }

  start() {
    const poll = () => {
      fetch(`${this.url}/events`)
        .then(r => r.json())
        .then(events => {
          this.onStatus?.('connected');
          const last = events[events.length - 1];
          if (last) {
            try {
              const msg = last.data;
              if (msg.data !== undefined) this.onEvent?.(msg.data);
            } catch {}
          }
          this._timer = setTimeout(poll, this.interval);
        })
        .catch(() => {
          this.onStatus?.('disconnected');
          this._timer = setTimeout(poll, this.interval);
        });
    };
    poll();
  }

  setInterval(ms) {
    this.interval = ms;
  }

  stop() {
    clearTimeout(this._timer);
  }
}
