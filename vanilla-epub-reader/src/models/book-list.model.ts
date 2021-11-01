import EventEmitter from '../event-emitter'
import { Book } from '../types'

export default class BookListModel extends EventEmitter {
  _items: Book[] = [];

  _selectedPath: string = '';

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

  get selectedPath () {
    return this._selectedPath
  }

  set selected(path: string) {
    const previousPath = this._selectedPath;
    this._selectedPath = path;
    this.emit('selectedChanged', previousPath);
  }
}