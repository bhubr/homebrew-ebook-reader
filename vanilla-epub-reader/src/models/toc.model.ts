import EventEmitter from '../event-emitter'
import { NavPoint } from '../types'

export default class TocModel extends EventEmitter {
  private _toc: NavPoint | null = null

  private _opened: boolean = false

  set toc(tableOfContents: NavPoint | null) {
    this._toc = tableOfContents
    this._opened = true
    this.emit("tocChanged")
  }

  get toc(): NavPoint | null {
    return this._toc
  }

  set opened(nextOpened: boolean) {
    this._opened = nextOpened
    this.emit("tocToggled")
  }

  get opened() {
    return this._opened
  }
}
