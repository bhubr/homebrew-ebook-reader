export default class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(evt: string, listener: Function) {
    if (!this.events[evt]) {
      this.events[evt] = [];
    }
    this.events[evt].push(listener);
    return this;
  }

  emit(evt: string, arg?: any) {
    (this.events[evt] || []).slice().forEach((lsn: Function) => lsn(arg));
  }
}
