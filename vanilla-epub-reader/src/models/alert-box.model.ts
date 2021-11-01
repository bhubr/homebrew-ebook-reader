import EventEmitter from '../event-emitter'

export default class AlertBoxModel extends EventEmitter {
  _error: Error | null = null

  setError(err: Error | null): void {
    this._error = err;
    this.emit('error');
  }

  get errorMessage () {
    return this._error?.message || '';
  }
}