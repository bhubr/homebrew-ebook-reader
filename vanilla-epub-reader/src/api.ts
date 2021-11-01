import { serverUrl } from './config'

type ResType = 'json' | 'text'

export const fetchOrFail = async (path: string, type: ResType = 'json') => {
  const res = await fetch(`${serverUrl}${path}`)
  if (!res.ok) {
    throw new Error(`Could not fetch: ${res.statusText}`)
  }
  const books = await res[type]()
  return books
}

export const fetchBookshelf = async () => fetchOrFail('/books.json')

export const fetchBookToc = async (slug: string) => fetchOrFail(`/${slug}/toc.ncx`, 'text')

export const fetchBookChapter = async (bookSlug: string, file: string) => fetchOrFail(`/${bookSlug}/${file}`, 'text')
