import "./style.css"

// Run server: serve -C -l 5500
const serverUrl = "http://localhost:5500"

const fetchOrFail = async (path, type = 'json') => {
  const res = await fetch(`${serverUrl}${path}`)
  if (!res.ok) {
    throw new Error(`Could not fetch: ${res.statusText}`)
  }
  const books = await res[type]()
  return books
}

const fetchBookshelf = async () => fetchOrFail(`/books.json`)

const fetchBookToc = async (slug) => fetchOrFail(`/${slug}/toc.ncx`, 'text')

const fetchBookChapter = async (bookSlug, file) => fetchOrFail(`/${bookSlug}/${file}`, 'text')

const content = (err, books) => {
  return err
    ? `<p>${err.message}</p>`
    : `<ul id="books">${books
        .map(
          (book) => `
      <li>
        <a href="#${book.path}">
          ${book.title}
        </a>
      </li>
      `
        )
        .join("")}
      </ul>`
}

const buildNavPointTree = (navPoint) => {
  // ret
  const label = navPoint.children.find(c => c.tagName === 'navLabel')
  const content = navPoint.children.find(c => c.tagName === 'content')
  const labelLine = label ? label.children[0].children[0] : 'N/A'
  const children = navPoint.children.filter(c => c.tagName === 'navPoint')
  let text = `<span>
      <a href="#${content.attributes.src}">${labelLine}</a>
    </span>
    <ul>
    ${
      children.map(navPoint => `<li>${buildNavPointTree(navPoint)}</li>`).join('')
    }
    </ul>
  `
  console.log(text, children)
  return text
}

const buildTocTree = (toc) => {
  return buildNavPointTree(toc.children[0])
}

const init = async () => {
  let fetchErr
  let books
  try {
    books = await fetchBookshelf()
  } catch (err) {
    fetchErr = err
  }

  document.querySelector("#app").innerHTML = `
  ${content(fetchErr, books)}
  <main>
    <div id="toc" class="toc-closed">
      <div id="toc-top">
        <button type="button">X</button>
      </div>
    </div>
    <div id="content"</div>
  </main>
  `
  const bookLinks = document.querySelectorAll("#books li a")
  for (const l of bookLinks) {
    l.addEventListener("click", async (e) => {
      e.preventDefault()
      const [, href] = e.target.href.split("#")
      console.log(href)
      const toc = await fetchBookToc(href)
      const parsedToc = txml.parse(toc)
      const navMap = parsedToc[1].children[2]
      const div = document.createElement('DIV')
      div.innerHTML = buildTocTree(navMap)
      document.querySelector('#toc').appendChild(div)
      for (const l of document.querySelectorAll('#toc a')) {
        l.addEventListener('click', async e => {
          e.preventDefault()
          const [, link] = e.target.href.split("#")
          // const content = await fetchBookChapter(href, link)
          // console.log(txml.parse(content))
          const iframe = document.createElement('IFRAME')
          iframe.src = `${serverUrl}/${href}/${link}`
          const contentDiv = document.querySelector('#content')
          contentDiv.innerHTML = ''
          contentDiv.appendChild(iframe)
        })
      }
    })
  }
}

init()
