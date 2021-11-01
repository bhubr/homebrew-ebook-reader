import EventEmitter from '../event-emitter'
import { NavPoint } from '../types'

export default class TocModel extends EventEmitter {
  private _toc: NavPoint | null = null

  private _opened: boolean = false

  _map: any[] = []

  private _currentPath: string = ''

  buildNavMap(navPoint: NavPoint) {
    const label = navPoint.children.find(
      (c: NavPoint) => c.tagName === "navLabel"
    )
    const content = navPoint.children.find(
      (c: NavPoint) => c.tagName === "content"
    )!
    const labelLine = label ? label.children[0].children[0] : "N/A"
    const children = navPoint.children.filter((c) => c.tagName === "navPoint")
    const obj = {
      label: labelLine,
      src: content.attributes.src
    }
    this._map.push(obj)
    children
        .forEach((navPoint) => this.buildNavMap(navPoint))
  }

  buildNavTree(toc: NavPoint) {
    return this.buildNavMap(toc.children[0])
  }

  set toc(tableOfContents: NavPoint | null) {
    this._toc = tableOfContents
    this._opened = true
    if (this._toc) this.buildNavTree(this._toc)
    console.log(this)
    this.emit("tocChanged")
  }

  setCurrentPath(path: string) {
    this._currentPath = path
    this.emit("tocCurrentPathChanged")
  }

  getCurrentPath(): string {
    return this._currentPath
  }

  previous() {
    const current = this._currentPath
    console.log('tocm prev', current)
    if (!current) return
    let itemIdx = this._map.findIndex(item => item.src === current)
    if (itemIdx === 0) {
      return
    }
    itemIdx -= 1 
    this.setCurrentPath(this._map[itemIdx].src)
  }
  
  next() {
    const current = this._currentPath
    console.log('tocm next', current)
    if (!current) return
    let itemIdx = this._map.findIndex(item => item.src === current)
    if (itemIdx === this._map.length - 1) {
      return
    }
    itemIdx += 1
    this.setCurrentPath(this._map[itemIdx].src)
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
