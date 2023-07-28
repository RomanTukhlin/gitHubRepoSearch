import '../scss/normalize.scss'
import '../scss/style.scss'
import '../scss/button-style.scss'

const search = document.querySelector('.search')
const searchInput = document.querySelector('.search__input')
const searchButton = document.querySelector('.search__button')
const seachAutocom = document.querySelector('.search__autocom')
const starred = document.querySelector('.starred')

function debounce(fn, delay) {
  let timer
  return function () {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, arguments), delay)
  }
}

function createElement(position, tag, classArr, text, spanContent) {
  const block = document.createDocumentFragment()
  const element = document.createElement(`${tag}`)
  if (classArr) {
    element.classList.add(classArr)
  }
  if (Array.isArray(classArr)) {
    classArr.forEach((className) => {
      element.classList.add(className)
    })
  }
  element.textContent = `${text}`
  if (spanContent) {
    const span = document.createElement('span')
    span.textContent = `${spanContent}`
    element.appendChild(span)
  }
  if (position === '') {
    return element
  } else {
    block.appendChild(element)
    position.appendChild(block)
  }
}

function addStarred(event) {
  const target = event.target
  starredCard(target)
  searchInput.value = ''
  removeElement()
}

async function getRepository(value) {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${value}`
    )
    const data = await response.json()
    return data.items.slice(0, 5)
  } catch (error) {
    console.log(error)
    throw new Error('Error!')
  }
}

function addReposytories(arrayRepos) {
  removeElement()
  const block = document.createDocumentFragment()
  if (arrayRepos.length === 0) {
    createElement(seachAutocom, 'li', 'search__autocom-item', 'Result 0')
    seachAutocom.removeEventListener('click', addStarred)
  } else {
    arrayRepos.forEach((elem) => {
      const item = createElement('', 'li', 'search__autocom-item', elem.name)
      item.gitHubName = elem.name
      item.gitHubOwner = elem.owner.login
      item.gitHubStarred = elem.stargazers_count
      block.appendChild(item)
      seachAutocom.appendChild(block)
    })
    seachAutocom.addEventListener('click', addStarred)
  }
}

function removeElement() {
  document.querySelectorAll('.search__autocom-item').forEach((elem) => {
    if (searchInput.value.length === 0) {
      seachAutocom.classList.remove('active')
      elem.remove()
    }
    seachAutocom.classList.remove('active')
    elem.remove()
  })
}

async function searchRepo() {
  let repositories
  const inputValue = searchInput.value
  if (inputValue.length !== 0) {
    repositories = await getRepository(inputValue)
    addReposytories(repositories)
    seachAutocom.classList.add('active')
    console.log(repositories)
  } else {
    removeElement()
  }
}

function starredCard(target) {
  const block = document.createDocumentFragment()
  const item = document.createElement('div')
  item.classList.add('starred__item')
  const content = document.createElement('div')
  content.classList.add('starred__item-content')

  // add name
  createElement(
    content,
    'div',
    'starred__item-text',
    'Name:',
    target.gitHubName
  )

  // add owner
  createElement(
    content,
    'div',
    'starred__item-text',
    'Owner:',
    target.gitHubOwner
  )

  // add stars
  createElement(
    content,
    'div',
    'starred__item-text',
    'Stars:',
    target.gitHubStarred
  )

  item.appendChild(content)
  block.appendChild(item)
  const button = document.createElement('button')
  button.classList.add('starred__item-close')
  button.classList.add('close-icon')
  item.appendChild(button)
  const removeStarred = () => {
    item.remove()
    button.removeEventListener('click', removeStarred)
  }
  button.addEventListener('click', removeStarred)
  starred.appendChild(block)
}

searchInput.addEventListener(
  'keyup',
  debounce((event) => {
    // get last elem from searchInput.value
    let inputValue = searchInput.value
    const lastElem = event.target.value.charAt(event.target.value.length - 1)
    if (searchInput.value.length === 0) {
      removeElement()
    }
    if (lastElem !== ' ') {
      return searchRepo()
    }
  }, 300)
)
searchButton.addEventListener('click', debounce(searchRepo, 300))
