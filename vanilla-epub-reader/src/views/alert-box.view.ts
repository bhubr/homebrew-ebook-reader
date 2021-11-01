import EventEmitter from '../event-emitter'
import AlertBoxModel from '../models/alert-box.model'

export default class AlertBoxView extends EventEmitter {
  private _el: HTMLElement;

  constructor(private _model: AlertBoxModel, selector: string) {
    super()
    this._el = document.querySelector(selector)!

    _model.on('error', () => this.render())
  }

  render() {
    const { errorMessage } = this._model
    if (!errorMessage) {
      this._el.innerHTML = ''
      return
    }
    this._el.innerHTML = `
    <div class="alert-box">
    ${errorMessage} <button class="alert-box-close-btn" type="button">x</button>
    </div>`
    this._el.querySelector('.alert-box-close-btn')!.addEventListener('click', () => this.emit('close'))
    
  }
}