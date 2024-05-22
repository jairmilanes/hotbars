import { BaseModule } from "./base.js"

export class CategoryModule extends BaseModule {
  static id = "hb-new-cat-form"
  collection = "__categories"
  form
  entryId
  entryCollection
  catTimer
  typeName
  categories = []
  entryCategories = []
  tree = []
  options = []
  values = []

  constructor(type, collection, entryId) {
    super(
      $("#hb-category-module"),
      "_modules/_category"
    );
    this.entryId = entryId
    this.typeName = collection

    if (type?.trackCategories) {
      this.reload()
    }
  }

  async init() {
    this.form = $(`#${CategoryModule.id}`).form({})
    this.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))

    $("input[name$=-check]", this.container)
      .on("change", e => this.handleToggleSelect(e.target.value))

    if (typeof callback === "function") {
      return callback()
    }
  }

  load() {
    return Promise.all([
      this.loadCategories(),
      this.loadEntryCategories()
    ]).then(() => {
      this.options = this.mapToOptions()
      this.tree = this.mapToTree()
      this.values = this.mapToValues()
    })
  }

  async reload() {
    await this.load()
    super.update({
      categories: this.options,
      options: this.options,
      tree: this.tree,
      values: this.values
    })
    this.init()
  }

  mapToOptions() {
    const categories = (this.categories || [])
      ?.map((cat) => ({
        label: cat.name,
        parent: cat.parent,
        value: cat.id
      }))

    categories.unshift({
      label: "Top level",
      parent: null,
      value: null
    })

    return categories
  }

  mapToTree(parentId = null) {
    const tree = (this.categories || [])
      ?.filter(cat => parentId ? cat.parent == parentId : !cat.parent)
      .map((cat) => ({
        label: cat.name,
        parent: cat.parent,
        value: cat.id,
        children: this.mapToTree(cat.id)
      }))

    return tree
  }

  mapToValues() {
    return (this.entryCategories || [])
      .reduce((ac, item) => {
        const cat = this.categories.find(cat => cat.id == item.categoryId)

        if (cat) {
          ac[`${cat.id}-check`] = cat.id
        }

        return ac;
      }, {})
  }

  findInTree(id, children = null) {
    return (children || this.tree)
      .reduce((ac, item) => {
        if (ac) return ac;

        if (item.value === id) {
          ac = item;
          return ac;
        };

        if (item.children) {
          ac = this.findInTree(id, item.children)
        }

        return ac;
      }, null)
  }

  async loadCategories() {
    this.categories = await $.rest.get(`/_api/${this.collection}`)
      .then((response) => response.items)
  }

  getSelected() {
    return $('input[type=checkbox]').reduce((ac, el) => {
      if (el.checked) {
        ac[$(el).data("name")] = true
      }
      return ac;
    }, {})
  }

  async loadEntryCategories() {
    return $.rest.get(`/_api/__type-categories?entryId=${this.entryId}`)
      .then(response => {
        this.entryCategories = response.items || []
        return this.entryCategories
      })
  }

  async select(categoryId) {
    const name = `${categoryId}-check`

    const exists = this.entryCategories?.find(
      ec => ec.categoryId === categoryId
    )

    // If selecting a child and later a parent, the child
    // is already in the database since it was selected first
    // so here we avoid creating reapeated database entries
    // by checking if it had been selected before.
    if (!exists) {
      const entry = await $.rest.post("/_api/__type-categories", {
        categoryId,
        type: this.typeName,
        entryId: this.entryId
      }).catch(e => console.error(e))
      this.entryCategories.push(entry)
    }

    this.values[name] = categoryId
    $(`input[name="${name}"]`).prop("checked", true)
  }

  async unselect(categoryId) {
    const entry = this.entryCategories.find(
      ec => ec.categoryId === categoryId
    )

    if (entry) {
      await $.rest
        .delete(`/_api/__type-categories/${entry.id}`)
        .catch(e => console.error(e))

      this.entryCategories = this.entryCategories.filter(et => et.id !== entry.id)
    }

    delete this.values[`${categoryId}-check`]
    $(`input[name="${categoryId}-check"]`).prop("checked", false)
  }

  async handleToggleSelect(id, force) {
    const cat = this.categories.find(cat => cat.id === id)

    if (!cat) return;

    const el = $(`input[name="${cat.id}-check"]`)
    const it = this.findInTree(cat.id)
    const checked = typeof force === "boolean" ? force : el.get(0).checked

    if (checked || force === true) {
      await this.select(cat.id)
    } else if(!el.get(0).checked || force === false) {
      await this.unselect(cat.id)
    }

    if (it.children) {
      it.children.forEach(
        child => this.handleToggleSelect(child.value, checked)
      )
    }
  }

  handleBeforeSubmit(e) {
    const { data } = e.___td
    if (data.parent) {
      data.parent = this.categories.find(cat => cat.id == data.parent)?.id
    }
  }

  handleAfterSubmit(e) {
    const { id } = e.___td
    if (id === CategoryModule.id) {
      this.reload()
    }
  }
}
