// import { parse } from "txml"
/* global txml */
import { fetchBookshelf, fetchBookToc } from "./api"
import EventEmitter from "./event-emitter"
import AlertBoxModel from "./models/alert-box.model"
import AlertBoxView from "./views/alert-box.view"
import BookListModel from "./models/book-list.model"
import BookListView from "./views/book-list.view"
import { serverUrl } from "./config"
import { Book } from "./types"
import "./style.css"

interface AttrMap {
  src: string
}

interface NavPoint {
  tagName: string
  attributes: AttrMap
  children: NavPoint[]
}

class TocModel extends EventEmitter {
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

class TocView extends EventEmitter {
  _el: HTMLElement

  constructor(private _model: TocModel, selector: string) {
    super()
    this._el = document.querySelector(selector)!

    _model.on("tocChanged", () => this.render())
    _model.on("tocToggled", () => this.toggleOpen())
  }

  buildNavPointTree(navPoint: NavPoint) {
    const label = navPoint.children.find(
      (c: NavPoint) => c.tagName === "navLabel"
    )
    const content = navPoint.children.find(
      (c: NavPoint) => c.tagName === "content"
    )!
    const labelLine = label ? label.children[0].children[0] : "N/A"
    const children = navPoint.children.filter((c) => c.tagName === "navPoint")
    let text: string = `<span>
        <a href="#${content.attributes.src}">${labelLine}</a>
      </span>
      <ul>
      ${children
        .map((navPoint) => `<li>${this.buildNavPointTree(navPoint)}</li>`)
        .join("")}
      </ul>
    `
    console.log(text, children)
    return text
  }

  buildTocTree(toc: NavPoint) {
    return this.buildNavPointTree(toc.children[0])
  }

  toggleOpen() {
    const { opened } = this._model
    const tocInner = this._el.querySelector("#toc-inner")!
    if (opened) {
      tocInner.classList.remove("toc-closed")
    } else {
      tocInner.classList.add("toc-closed")
    }
  }

  render() {
    const { toc } = this._model
    this._el.innerHTML = `<button class="toc-do-open" type="button">&raquo;</button>
    <div id="toc-inner">
      <button class="toc-do-close" type="button">&laquo;</button>
    ${toc ? this.buildTocTree(toc) : "N/A"}
    </div>`
    this.toggleOpen()

    const openBtn = this._el.querySelector(".toc-do-open")!
    openBtn.addEventListener("click", () => this.emit("open"))
    const closeBtn = this._el.querySelector(".toc-do-close")!
    closeBtn.addEventListener("click", () => this.emit("close"))

    for (const l of this._el.querySelectorAll("#toc-inner a")!) {
      l.addEventListener("click", async (e) => {
        e.preventDefault()
        const [, link] = e.target.href.split("#")
        console.log("clicked link", link)
        this.emit("tocLinkClicked", link)
        this.emit("close")
      })
    }
  }
}

const renderAppSkeleton = () => `
<main>
  <div id="toc"></div>
  <div id="alert"></div>
  <div id="bookshelf-wrapper"></div>
  
  <div id="content"></div>
</main>
`

const init = async () => {
  let fetchErr
  let books
  let bookListModel: BookListModel
  let bookListView: BookListView

  const app = document.querySelector<HTMLDivElement>("#app")!
  app.innerHTML = renderAppSkeleton()

  const alertModel = new AlertBoxModel()
  const alertView = new AlertBoxView(alertModel, "#alert")
  const tocModel = new TocModel()
  const tocView = new TocView(tocModel, "#toc")
  alertView.on("close", () => alertModel.setError(null))
  try {
    books = (await fetchBookshelf()) as Book[]
    bookListModel = new BookListModel()
    bookListView = new BookListView(bookListModel, "#bookshelf-wrapper")
    bookListModel.items = books
    bookListView.on("bookChanged", (path: string) => {
      console.log("book changed", path)
      bookListModel.selected = path
    })

    bookListModel.on("selectedChanged", async () => {
      console.log("book changed", bookListModel.selectedPath)
      const toc = await fetchBookToc(bookListModel.selectedPath)
      const parsedToc = txml.parse(toc)
      const navMap = parsedToc[1].children[2]
      tocModel.toc = navMap
    })

    tocView.on("open", () => {
      tocModel.opened = true
    })

    tocView.on("close", () => {
      tocModel.opened = false
    })

    tocView.on("tocLinkClicked", (link: string) => {
      const iframe = document.createElement("IFRAME")
      iframe.src = `${serverUrl}/${bookListModel.selectedPath}/${link}`
      const contentDiv = document.querySelector("#content")!
      contentDiv.innerHTML = ""
      contentDiv.appendChild(iframe)
    })
  } catch (err) {
    fetchErr = err as Error
    alertModel.setError(fetchErr)
  }
}

init()
