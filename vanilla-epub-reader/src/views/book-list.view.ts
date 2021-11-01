import EventEmitter from '../event-emitter'
import BookListModel from '../models/book-list.model'

export default class BookListView extends EventEmitter {
  private _el: HTMLElement;

  constructor(private _model: BookListModel, selector: string) {
    super()
    this._el = document.querySelector(selector)!

    _model.on('itemsLoaded', () => this.render())
  }

  render() {
    const books = this._model.items
    this._el.innerHTML = `<ul id="books">${books
      .map(
        (book) => `
    <li>
      <a href="#${book.path}">
        ${book.title}
      </a>
    </li>
    `
      )
      .join("")}
    </ul>`
    const bookLinks = this._el.querySelectorAll("#books li a")! as unknown as HTMLCollection
    for (const l of bookLinks) {
      l.addEventListener("click", async (e) => {
        const [, href] = e.target.href.split("#")
        console.log(href)
        this.emit("bookChanged", href)
      })
    }
  }
}