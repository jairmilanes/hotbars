class Pagination {
  container;
  prevEl;
  nextEl;
  firstEl;
  lastEl;
  fromEl;
  toEl;
  totalEl;
  list;
  collection;
  baseUrl;
  state = {
    page: 1,
    next: -1,
    prev: -1,
    pages: -1
  };
  maxItems = 10
  onPage

  clickCallback = () => null

  constructor(el, baseUrl, collection) {
    this.container = el
    this.baseUrl = baseUrl
    this.ssr = true
    this.list = $("ul ul", el).list("_pagination-item")
    this.prevEl = $("[data-prev=true]", el)
    this.nextEl = $("[data-next=true]", el)
    this.firstEl = $("[data-first=true]", el)
    this.lastEl = $("[data-last=true]", el)
    this.fromEl = $("span:first-child > span:first-child", el)
    this.toEl = $("span:first-child > span:nth-child(2)", el)
    this.totalEl = $("span:first-child > span:last-child", el)
    this.collection = collection;

    this.list.setActiveState(null, null, "a")

    this.state.page = parseInt($.query("page") || "1")

    if (this.state.page) {
      this.state.next = this.state.page + 1;
      this.state.prev = this.state.page > 1 ? this.state.page - 1 : 1
    }

    this.firstEl.on("click", this.handleClick.bind(this))
    this.nextEl.on("click", this.handleClick.bind(this))
    this.prevEl.on("click", this.handleClick.bind(this))
    this.lastEl.on("click", this.handleClick.bind(this))
  }

  pageStart(page, pages) {
    if (page < 5) return 0
    if ((pages - page) < 5) return pages - this.maxItems
    return page - 5;
  }

  update(params) {
    const {from, to, total, pages, page} = params

    this.list.reset()

    this.state = {
      page,
      next: page < pages ? page + 1 : pages,
      prev: page > 1 ? page - 1 : 1,
      pages,
    }

    let count = 0;

    for (let i = this.pageStart(page,pages); i < pages; i++) {
      this.list.appendItem({
        id: `page-${i + 1}`,
        baseUrl: `${this.baseUrl}/${this.collection}?page=`,
        page: i + 1
      })

      // Set up to dispatch click events ???
      $("a", this.list.lastEl()).on(
        "click", this.handleClick.bind(this)
      )

      ++count

      if (count >= this.maxItems) break;
    }

    this.list.setActive(`page-${page}`, true)

    this.updateMeta({ from, to, total })
    this.disableNext(params)
    this.disablePrev(params)
  }

  handleClick(e) {
    if (this.ssr) {
      e.preventDefault()
    }

    const listItemEL = $(e.target).closest("li")
    const itemId = listItemEL.data("list-item")

    let item;
    if (listItemEL.data("prev")) {
      item = { page: this.state.prev }
    } else if (listItemEL.data("next")) {
      item = { page: this.state.next }
    } else if (listItemEL.data("first")) {
      item = { page: 1 }
    } else if (listItemEL.data("last")) {
      item = { page: this.state.pages }
    } else {
      item = this.list.getItem(itemId)
    }

    if (typeof this.clickCallback === "function") {
      this.clickCallback(e, {
        page: item.page,
        baseUrl: this.baseUrl
      })
    }
  }

  click(callback) {
    if (typeof callback === "function") {
      this.clickCallback = callback
    }
    return this
  }

  disableNext({ pages, page }) {
    if (pages > 1 && page < pages) {
      this.setNext(this.state.next)
      this.setLast(this.state.pages)
      $("a", this.nextEl).off("click")
      $("a", this.lastEl).off("click")
    } else {
      $("a", this.nextEl).on("click", e => {
        e.stopPropagation()
        e.preventDefault()
      })
      $("a", this.lastEl).on("click", e => {
        e.stopPropagation()
        e.preventDefault()
      })
    }
  }

  disablePrev({ pages, page }) {
    if (pages > 1 && page > 1) {
      this.setPrev(this.state.prev)
      this.setFirst(1)
      $("a", this.prevEl).off("click")
      $("a", this.firstEl).off("click")
    } else {
      $("a", this.prevEl).on("click", e => {
        e.stopPropagation()
        e.preventDefault()
      })
      $("a", this.firstEl).on("click", e => {
        e.stopPropagation()
        e.preventDefault()
      })
    }
  }

  showNext(params) {
    if (params.pages > 1 && params.page < params.pages) {
      this.setNext(this.state.next)
      this.nextEl.show()
    } else {
      this.nextEl.hide()
    }
  }

  showPrev(params) {
    if (params.pages > 1 && params.page > 1) {
      this.setPrev(this.state.prev)
      this.prevEl.show()
    } else {
      this.prevEl.hide()
    }
  }

  setFirst(page) {
    const url = $.utils.createUrl({ page })
    $("a", this.firstEl).attr("href", url)
  }

  setNext(page) {
    const url = $.utils.createUrl({ page })
    $("a", this.nextEl).attr("href", url)
  }

  setPrev(page) {
    const url = $.utils.createUrl({ page })
    $("a", this.prevEl).attr("href", url)
  }

  setLast(page) {
    const url = $.utils.createUrl({ page })
    $("a", this.lastEl).attr("href", url)
  }

  updateMeta({ from, to, total }) {
    this.fromEl.html(from)
    this.toEl.html(to)
    this.totalEl.html(total)
  }

  reset() {
    this.list.reset()
  }
}


(() => {
  $.fn.pagination = function(baseUrl, collection) {
    return new Pagination(this, baseUrl, collection)
  }
})()