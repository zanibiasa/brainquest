class EventPoller {
  constructor(url, interval = 100) {
    this.url = url;
    this.interval = interval;
    this.onEvent = null;
    this.onStatus = null;
    this._timer = null;
    this._lastEventId = 0;
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
              console.log('[EventPoller] raw events count:', events.length, '| last event:', JSON.stringify(last));
              if (last.id > this._lastEventId && msg.data !== undefined) {
                console.log('[EventPoller] dispatching onEvent with:', msg.data, '| id:', last.id);
                this._lastEventId = last.id;
                this.onEvent?.(msg.data);
              } else if (msg.data !== undefined) {
                console.log('[EventPoller] skipped stale event, id:', last.id, '<= lastEventId:', this._lastEventId);
              }
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
    this._lastEventId = 0;
  }
}
