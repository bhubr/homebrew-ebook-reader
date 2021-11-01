import EventEmitter from '../event-emitter'
import BookListModel from '../models/book-list.model'
import { serverUrl } from "../config"

export default class BookListView extends EventEmitter {
  private _el: HTMLElement;

  constructor(private _model: BookListModel, selector: string) {
    super()
    this._el = document.querySelector(selector)!

    _model.on('itemsLoaded', () => this.render())
    _model.on("bookshelfToggled", () => this.toggleOpen())
  }
  
  toggleOpen() {
    const { opened } = this._model
    const bookshelfInner = this._el.querySelector("#bookshelf-inner")!
    const openBtn = this._el.querySelector(".btn-open")!
    const closeBtn = this._el.querySelector(".btn-close")!
    if (opened) {
      bookshelfInner.classList.remove("bookshelf-closed")
      openBtn.style.display = 'none'
      closeBtn.style.display = 'block'
    } else {
      bookshelfInner.classList.add("bookshelf-closed")
      openBtn.style.display = 'block'
      closeBtn.style.display = 'none'
    }
  }

  render() {
    const books = this._model.items
    this._el.innerHTML = `
    <button class="btn-open" type="button">B</button>
    <div id="bookshelf-inner">
      <button class="btn-close" type="button">X</button>
      <ul id="books">${books
        .map(
          (book) => `
          
      <li>
        <a href="#${book.path}">
          <img class="book-cover" src="${serverUrl}/${book.path}/${book.cover}" alt="${book.title}" />
          <span class="book-title">${book.title}</span>
        </a>
      </li>
      `
        )
        .join("")}
      </ul>
    </div>`
    const bookLinks = this._el.querySelectorAll("#books li a")! as unknown as HTMLCollection
    for (const l of bookLinks) {
      l.addEventListener("click", async (e) => {
        let el = e.target
        while (el.tagName !== 'A') {
          el = el.parentNode
        }
        const [, href] = el.href.split("#")
        console.log(href)
        this.emit("bookChanged", href)
        this.emit("close")
      })
    }
    const openBtn = this._el.querySelector(".btn-open")!
    openBtn.addEventListener("click", () => this.emit("open"))
    const closeBtn = this._el.querySelector(".btn-close")!
    closeBtn.addEventListener("click", () => this.emit("close"))
    this.toggleOpen()
  }
}