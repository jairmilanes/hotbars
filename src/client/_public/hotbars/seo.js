

class SeoPage {
  pages = $(`#hb-pages-list li:not([data-scored="true"])`)

  scoreForm = $("#hb-score-form").form({})

  list = $(`#hb-pages-list li:not([data-scored="true"])`)

  context = {
    formFactor: "mobile"
  }

  cache = $.cache()

  constructor() {
    const pages = [...this.pages]

    this.loadScores(pages.shift(), pages)
      .then(() => console.log("Scores loaded!"))

    this.list.each((i, el) => {
        const page = $(el)

        // page.mutate(["data-scored"])
        const path = page.data("path")
          .replace(/http(s)?:\/\//, "")
          .split("/")
          .pop()

        const scoreBtn = $(`[data-score-btn="true"]`, page)

        scoreBtn.on("click", e => {
          this.getNewScore(page.data("path"))
            .then(() => this.getScore(path))
        })
      })

    this.scoreForm.on("change", (e) => {
      console.log(e)
      if (e.currentTarget.id === this.scoreForm.attr("id")) {
        this.context.formFactor = e.target.value
      }
    })

    $.subscribe("hb-submit", (e) => {
      if (e.id === this.scoreForm.attr("id")) {
        this.scoreForm.freeze()

        const data = this.scoreForm.data()

        this.context.formFactor = data.formFactor

        // this.cache.add({ key: "formFactor", data: data.formFactor })

        const pages = [...this.pages]

        this.chainScoreing(pages.shift(), pages, true)
          .then(() => {
            this.scoreForm.unfreeze()
            console.log("Scoring complete!")
          })
      }
    })

    $("[data-regenerate]")
      .on("click", async (e) => {

        e.preventDefault()
        const el = $(e.target)
        const page = el.parents("li")

        console.log(el, page)

        this.loader(page).show()

        const score = await this.getNewScore(`http://localhost:3000${$(page).data("path")}`)
        console.log(score)
        if (score) {
          this.renderScore(page, score)
        }
        this.loader(page).hide()
      })

    /* this.cache.get("formFactor")
      .then((data) => {
        if (data) {
          this.scoreForm.setValue(
            "formFactor",
            data
          )
        }
      }) */
  }

  renderScore(page, score) {
    if (score?.screenshot) {
      const placeholder = $(page).find(`div[data-placeholder]`)

      console.log("placeholder", placeholder)
      if (placeholder.length > 0) {
        placeholder.replaceWith(
          `<img alt="" src="${score.screenshot}" class="block h-auto w-full" />`
        )
      } else {
        console.log("IMG", $(page).find("img"))
        $(page).find("img").attr("src", score.screenshot)
      }

    }

    $(page)
      .find(`[data-score-btn="true"]`)
      .hide()

    const scoreEl = $(page).find(`[data-score="true"]`).show()
    const text= scoreEl.find("strong:last-child")

    text.html((score.score * 100).toFixed(1))

    if (score.score < .30) {
      text.addClass("text-red-600")
    } else if (score.score > .30 && score.score < .60) {
      text.addClass("text-amber-600")
    } else {
      text.addClass("text-lime-600")
    }
  }

  getPagePath(page) {
    let path = $(page).data("path")
      .replace(/http(s)?:\/\//, "")
      .split("/")

    path.shift()

    return path.join("/")
  }

  async loadScores(page, pages) {
    const path = this.getPagePath(page)
    const loader = $(page).find(`[data-spinner="true"]`)
    const cached = false //await this.cache.get(`_report-${path}`)

    if (cached) {
      this.renderScore(page, JSON.parse(cached.data))
    } else {
      loader.show()

      const score = await this.getScore(path)

      if (score) {
        // this.cache.set(`_report-${path}`, score)
        this.renderScore(page, score)
      }

      loader.hide()
    }

    console.log(pages)

    if (pages.length) {
      return this.loadScores(pages.shift(), pages)
    }
  }

  async chainScoreing(page, pages, forceNew = false) {
    const path = this.getPagePath(page)
    const loader = $(page).find(`[data-spinner="true"]`)

    loader.show()

    try {
      if (forceNew) {
        throw new Error("Must re-create")
      }

      const score = await this.getScore(path)

      if (score) {
        this.renderScore(page, score)
      } else {
        throw new Error("Score not found")
      }

      loader.hide()

      if (pages.length) {
        return this.chainScoreing(pages.shift(), pages, forceNew)
      }
    } catch(e) {
      try {
        const score = await this.getNewScore(`http://localhost:3000${$(page).data("path")}`)

        if (score) {
          // HERE
          this.renderScore(page, score)
        }

        loader.hide()

        if (pages.length) {
          return this.chainScoreing(pages.shift(), pages, forceNew)
        }
      } catch(e) {
        loader.hide()

        if (pages.length) {
          return this.chainScoreing(pages.shift(), pages, forceNew)
        }
      }
    }
  }

  loader(page) {
    return  $(page).find(`[data-spinner="true"]`)
  }

  async genNewScore(page) {
    this.loader(page).show()

    const score = await this.getNewScore(`http://localhost:3000${$(page).data("path")}`)

    if (score) {
      // HERE
      this.renderScore(page, score)
    }

    this.loader(page).hide()
  }

  getScore(page) {
    const query = new URLSearchParams()

    query.set("path", page)
    query.set("_limit", "1")
    query.set("_sort", "date")
    query.set("_order", "desc")

    return fetch(`/_api/__lighthouse?${query.toString()}`, {})
      .then(response => response.status !== 200 ? null : response.json())
      .then((response) => response.items.length ? response.items[0] : null)
      .catch(() => null)
  }

  getNewScore(path) {
    const query = new URLSearchParams()

    query.set("format", "json")
    query.set("url", path)
    query.set("formFactor", this.context.formFactor)

    return fetch(`/lighthouse/score?${query.toString()}`, {})
      .then(response => response.json())
  }
}

$(async () => {

  return new SeoPage()
})