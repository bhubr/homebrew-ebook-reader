import EventEmitter from '../event-emitter'
import BookListModel from '../models/book-list.model'

export default class NavView extends EventEmitter {
  private _prev: HTMLElement;

  private _next: HTMLElement;

  constructor(bookListModel: BookListModel, prevSel: string, nextSel: string) {
    super()
    this._prev = document.querySelector(prevSel)
    this._next = document.querySelector(nextSel)

    console.log(this.bookListModel)

    this._prev.addEventListener("click", () => this.emit("prev"))
    this._next.addEventListener("click", () => this.emit("next"))
  }
}
