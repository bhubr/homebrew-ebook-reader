// import { parse } from "txml"
/* global txml */
import { fetchBookshelf, fetchBookToc } from "./api"
import AlertBoxModel from "./models/alert-box.model"
import AlertBoxView from "./views/alert-box.view"
import BookListModel from "./models/book-list.model"
import BookListView from "./views/book-list.view"
import TocModel from "./models/toc.model"
import TocView from "./views/toc.view"
import NavView from "./views/nav.view"
import { serverUrl } from "./config"
import { Book } from "./types"
import "./style.css"

const renderAppSkeleton = () => `
<main>
  <button class="nav-btn nav-btn-prev">&lt;</button>
  <button class="nav-btn nav-btn-next">&gt;</button>
  <div id="bookshelf"></div>
  <div id="toc"></div>
  <div id="alert"></div>
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
    bookListView = new BookListView(bookListModel, "#bookshelf")
    const navView = new NavView(bookListModel, '.nav-btn-prev', '.nav-btn-next')
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

    bookListView.on("open", () => {
      bookListModel.opened = true
    })

    bookListView.on("close", () => {
      bookListModel.opened = false
    })

    tocView.on("open", () => {
      tocModel.opened = true
    })

    tocView.on("close", () => {
      tocModel.opened = false
    })

    tocView.on("tocLinkClicked", (link: string) => {
      tocModel.setCurrentPath(link)
    });

    tocModel.on("tocCurrentPathChanged", () => {
      const link = tocModel.getCurrentPath()
      console.log('current path changed', link)
      let iframe = document.querySelector("#content iframe") as HTMLIFrameElement
      if (!iframe) {
        iframe = document.createElement("IFRAME") as HTMLIFrameElement
        const contentDiv = document.querySelector("#content")!
        contentDiv.innerHTML = ""
        contentDiv.appendChild(iframe)
      }
      iframe.src = `${serverUrl}/${bookListModel.selectedPath}/${link}`
    })

    navView.on("prev", () => {
      tocModel.previous()
      // console.log('previous')
    })

    navView.on("next", () => {
      tocModel.next()
      // console.log('next')
    })
  } catch (err) {
    fetchErr = err as Error
    alertModel.setError(fetchErr)
  }
}

init()
