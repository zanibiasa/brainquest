class EventPoller {
  constructor(url, interval = 100) {
    this.url = url;
    this.interval = interval;
    this.lastId = 0;
    this.onEvent = null;
    this.onStatus = null;
    this._timer = null;
  }

  start() {
    const poll = () => {
      fetch(`${this.url}/events?since=${this.lastId}`)
        .then(r => r.json())
        .then(events => {
          this.onStatus?.('connected');
          for (const e of events) {
            if (e.id > this.lastId) this.lastId = e.id;
            try {
              const msg = e.data;
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
