export interface Book {
  title: string;
  path: string;
  cover: string;
}

interface AttrMap {
  src: string
}

export interface NavPoint {
  tagName: string
  attributes: AttrMap
  children: NavPoint[]
}
