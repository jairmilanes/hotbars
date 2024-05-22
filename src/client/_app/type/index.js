import { TableView, PostView, GridView, ProductGridView } from "./views/index.js";

class TypeList {

  collection;
  type;
  view;

  constructor() {
    this.collection = $("div[data-collection]").data("collection")
    $.subscribe("hb-new-entry", this.handleCreate.bind(this))
    this.getType()
      .then((type) => {
        const id = this.id(type?.listView)
        switch(type?.listView) {
          case "table":
            this.view = new TableView(id, { type: this.type })
            break;
          case "post":
            this.view = new PostView(id, { type: this.type })
            break;
          case "grid":
            this.view = new GridView(id, { type: this.type })
            break;
          case "product-grid":
            this.view = new ProductGridView(id, { type: this.type })
            break;
        }
      })
  }

  id(viewType) {
    return `${viewType}-view`
  }

  request() {
    return
  }

  async getType() {
    const types = await $.rest.get(`/_api/__types/?name=${this.collection}`, {})
    if (types.items.length) {
      this.type = types.items[0];
      return this.type
    }
  }

  async createCollection(name) {
    if (!name) throw new Error(`Most provide a collection name, received "${name}"`)
    try {
      await $.rest.post("/_api/collections", { name })
    } catch(e) {
      console.error(e)
      throw new Error("Failed to create collection.")
    }
  }

  async handleCreate(e, retry = false) {
    const payload = this.type?.fields.reduce((ac, field) => {
      if (field.defaultValue) {
        ac[field.name] = field.defaultValue
      }
      return ac
    }, {})

    try {
      const post = await $.rest.post(
        `/_api/${e.collection}`,
        payload
      )

      $.navigate(`/_hotbars/type/${e.collection}/${post.id}`)
    } catch(error) {
      if (error.status === 404 && retry) {
        await this.createCollection(e.collection)
        return this.handleCreate(e, false)
      }
      console.error(error)
      throw new Error(`Error while creating a new ${e.collection} entry`)
    }
  }
}

$(async () => {
  await $.preloader.preload([
    "_grid-list-tile",
    "_post-view-row",
    "_product-grid-tile"
  ])

  const table = new TypeList()
})