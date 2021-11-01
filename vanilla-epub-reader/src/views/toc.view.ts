import EventEmitter from '../event-emitter'
import TocModel from '../models/toc.model'
import { NavPoint } from '../types'

export default class TocView extends EventEmitter {
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
    return text
  }

  buildTocTree(toc: NavPoint) {
    return this.buildNavPointTree(toc.children[0])
  }

  toggleOpen() {
    const { opened } = this._model
    const tocInner = this._el.querySelector("#toc-inner")!
    const openBtn = this._el.querySelector(".toc-do-open")!
    const closeBtn = this._el.querySelector(".toc-do-close")!
    if (opened) {
      tocInner.classList.remove("toc-closed")
      openBtn.style.display = 'none'
      closeBtn.style.display = 'block'
    } else {
      tocInner.classList.add("toc-closed")
      openBtn.style.display = 'block'
      closeBtn.style.display = 'none'
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

    const linksCollection = this._el.querySelectorAll("#toc-inner a")!
    const links = Array.from(linksCollection)
    links.forEach(l => {
      l.addEventListener("click", async (e) => {
        e.preventDefault()
        const [, link] = e.target.href.split("#")
        console.log("clicked link", link)
        this.emit("tocLinkClicked", link)
        this.emit("close")
      })
    })
  }
}