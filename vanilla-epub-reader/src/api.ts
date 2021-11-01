import { serverUrl } from './config'

export const fetchOrFail = async (path, type = 'json') => {
  const res = await fetch(`${serverUrl}${path}`)
  if (!res.ok) {
    throw new Error(`Could not fetch: ${res.statusText}`)
  }
  const books = await res[type]()
  return books
}

export const fetchBookshelf = async () => fetchOrFail(`/books.json`)

export const fetchBookToc = async (slug) => fetchOrFail(`/${slug}/toc.ncx`, 'text')

export const fetchBookChapter = async (bookSlug, file) => fetchOrFail(`/${bookSlug}/${file}`, 'text')
