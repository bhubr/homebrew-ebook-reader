import EventEmitter from '../event-emitter'
import { Book } from '../types'

export default class BookListModel extends EventEmitter {
  _items: Book[] = [];

  _selectedPath: string = '';

  private _opened: boolean = true;

  constructor() {
    super();
  }
  
  set items (items: Book[]) {
    this._items = items
    this.emit('itemsLoaded');
  }

  get items () {
    return this._items
  }

  set opened(nextOpened: boolean) {
    this._opened = nextOpened
    this.emit("bookshelfToggled")
  }

  get opened() {
    return this._opened
  }

  get selectedPath () {
    return this._selectedPath
  }

  set selected(path: string) {
    const previousPath = this._selectedPath;
    this._selectedPath = path;
    this.emit('selectedChanged', previousPath);
  }
}