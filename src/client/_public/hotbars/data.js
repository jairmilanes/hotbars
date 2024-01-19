class BaseList {
  container;
  list;

  constructor(listID, tpl, collectionName) {
    this.list = $(`#${listID}`).list(tpl, null, collectionName)
    this.list.setActiveState(
      "bg-gray-100 dark:bg-gray-900",
      "bg-white dark:bg-gray-800"
    )
    this.container = this.list.parent()
  }

  loading(on) {
    const loader = $("div[hb-loader]", this.container);
    return on ? loader.show() : loader.hide();
  };

  load(params) {
    this.loading(true)
    return this.list
      .load(params, (collections) => collections)
  }
}

class CollectionsList extends BaseList {

  form = $("#collection-form")
  newEl = $("#hb-new-collection")
  cancelEl = $("#hb-cancel-collection")
  active = null;
  collections = []

  constructor() {
    super("hb-collections", "_data_collection", "collections");
    this.newEl.prev().addClass("hidden")

    $.subscribe("hb-before-submit",this.handleBeforeDelete.bind(this))
    $.subscribe("hb-after-submit", this.handleAfterDelete.bind(this))
  }

  load(params) {
    return super.load(params)
      .then((collections) => {
        $.dropdown(this.list)
        $.swap(this.list)
        $.forms()

        this.loading(false)

        $("h4 > a", this.list).on(
          "click", this.handleClick.bind(this)
        );

        this.collections = collections

        return collections;
      })
  }

  handleBeforeDelete(e) {
    const { form } = e

    if (form.attr("id").startsWith("delete-collection-")) {
      const container = form.closest('h4[hb-list-item]')
      if (container) container.addClass("animate-pulse text-gray-700 dark:text-white bg-red-500 dark:bg-red-600")
      // close the dropdown
      container.get(0).focus()
    }
  }

  handleAfterDelete(e) {
    const { form } = e

    if (form.attr("id").startsWith("delete-collection-")) {
      const container = form.closest('h4[hb-list-item]')
      if (container) container.remove()
    }

    if (this.form.attr("id") === form.attr("id")) {
      this.cancelEl.trigger("click")
      this.load($.query())
    }
  }

  handleClick(e) {
    e.preventDefault()
    console.log(e)
    const el = $(e.currentTarget)
    const isActions = el.closest(`div[hb-actions="true"]`)

    if (isActions.length) return

    const collection = this.collections.find(collection => collection.name === el.data("id"))

    console.log("collection", el, el.data("id"), collection, this.collections)

    el.addClass("active")

    this.list.setActive(collection.name, true)

    $.dispatch("hb-load-items", { collection })
  }
}

class ItemsList extends BaseList {
  collection = null
  newEl = $("#hb-new-collection-item", this.list.parent())

  constructor() {
    super("hb-data-items", "_data_list_item")

    this.newEl.attr("disabled", "disabled")

    $.subscribe("hb-load-items", (e) => {
      if (!e.collection) return
      this.newEl.removeAttr("disabled")

      this.collection = e.collection

      $.dispatch("hb-data-editor-unload")

      if (!this.collection.single) {
        this.list.parent().show()
        $.dispatch("hb-unload-item")
        this.load(e.collection.name, e.page || 1)
      } else {
        this.list.parent().hide()
        $.dispatch("hb-load-item", {
          collection: this.collection,
          item: null
        });
      }
    })

    $.subscribe("hb-create-item", (e) => {
      this.newEl.attr("disabled", "disabled")
    })

    $.subscribe("hb-item-created", (e) => {
      this.list.setActive(e.item.id, true)
      this.newEl.removeAttr("disabled")
    })

    $.subscribe("hb-data-editor-unload", (e) => {
      this.newEl.removeAttr("disabled")
    })

    this.newEl.on("click", (e) => {
      if (this.collection) {
        $.dispatch("hb-create-item", { collection: this.collection })
      }
    })
  }

  async load(collectionName, page) {
    this.list.setCollection(collectionName)

    this.loading(true)

    return this.list
      .load({ page }, (response) =>
        Array.isArray(response?.items) ? response?.items : []
      ).then((items) => {
        this.loading(false)

        $("h4 > a", this.list).on(
          "click", this.handleClick.bind(this)
        )

        return items
      });
  };

  handleClick(e) {
    e.preventDefault();

    const el = $(e.target).closest("a")
    const itemId =  el.data("id");
    const item = this.list.items.find(item => item.id === itemId);

    this.list.setActive(itemId, true)

    $.dispatch("hb-load-item", {
      item,
      collection: this.collection
    })

    $.dispatch("hb-data-editor-unload")
  }
}

class ItemView {
  el = $("#hb-data-item")
  actions = $("#hb-item-actions")
  editEl = $("#hb-edit-item", this.actions)
  removeEl = $("#hb-remove-item-confirm")
  item = null;
  collection = null;

  constructor() {
    $.subscribe("hb-load-item", (e) => {
      this.item = e.item
      this.collection = e.collection
      this.el.parent().show()

      if (this.collection.single) {
        return this.load(this.collection.name)
      } else {
        return this.load(this.collection.name, this.item.id)
      }
    })

    $.subscribe("hb-load-items", (e) => {
      if (e.collection.single) {
        this.el.parent().swapClass("col-span-4", "col-span-8")
      } else {
        this.el.parent().swapClass("col-span-8", "col-span-4")
      }
    })

    $.subscribe("hb-edit-item", (e) => {
      this.el.parent().hide()
    })

    $.subscribe("hb-create-item", () => {
      this.el.parent().hide()
    })

    $.subscribe("hb-unload-item", () => {
      this.item = null
      this.collection = null
      this.actions.hide()
      this.el.html("")
    })

    $.subscribe("hb-data-editor-unload", () => {
      this.el.parent().show()
    })

    this.editEl.on("click", e => {
      $.dispatch("hb-edit-item", {
        item: this.item,
        collection: this.collection
      })
    })

    this.removeEl.on("click", this.remove.bind(this))
  }

  loading = (on) => {
    const loader = $('div[hb-loader="true"]', this.el.parent());
    return on ? loader.show() : loader.hide();
  };

  title(text) {
    $("h4", this.actions).html(`Id: <strong>${text}</strong>`)
  }

  remove() {
    return fetch(`/_api/${this.collection.name}/${this.item.id}`, {
      method: "DELETE"
    }).then(() => {
      $.dispatch("hb-load-items", { collection: this.collection })
      $.dispatch("hb-unload-item")
    })
  }

  load(collection, id) {
    this.loading(true)

    return fetch(`/_api/${collection}${id ? `/${id}` : ""}`)
      .then(response => response.json())
      .then(item => {
        this.actions.show()
        this.title(id ? item.id : collection)

        // updates the item as it may be a collection item or a single collection
        // itself, this will be passed to the editor on edit action,
        this.item = item

        this.el.render("_data_item", {item});

        Prism.highlightAll()

        this.loading(false)

        return item;
      })
  }
}

class EditorView {
  el = $("#hb-data-item-editor")
  container = $("#hb-editor-container")
  editor = this.container.aceEditor("json");
  saveBtn = $('#hb-save-item')
  closeBtn = $("#hb-close-editor")
  titleEl = $("#hb-editor-title")

  item = null
  collection = null

  new = false

  constructor() {
    $.subscribe("hb-create-item", (e) => {
      this.new = true
      this.item = e.item
      this.collection = e.collection
      this.el.parent().show()
      this.titleEl.html(`${this.collection.name}: New`)

      const value = {}

      this.editor.editor.session.setValue(JSON.stringify(value, null, 4))
      this.editor.editor.focus()
      this.editor.editor.moveCursorTo(1, 5)
      this.editor.editor.resize()
    })

    $.subscribe("hb-edit-item", (e) => {
      this.new = false
      this.item = e.item
      this.collection = e.collection
      this.el.parent().show()
      this.titleEl.html(`id: ${this.item.id}`)

      const value = { ...this.item }
      delete value.id

      this.editor.editor.session.setValue(JSON.stringify(value, null, 4));
      this.editor.editor.focus()
      this.editor.editor.moveCursorTo(1, 5);
      this.editor.editor.resize()
    })

    $.subscribe("hb-data-editor-unload", () => {
      this.item = null
      this.collection = null
      this.editor.editor.session.setValue("");
      this.editor.editor.moveCursorTo(0, 0);
      this.el.parent().hide()
    })

    $.subscribe("hb-load-items", (e) => {
      if (e.collection.single) {
        this.el.parent().swapClass("col-span-4", "col-span-8")
      } else {
        this.el.parent().swapClass("col-span-8", "col-span-4")
      }
    })

    this.saveBtn.on("click", this.handleSave.bind(this))
    this.closeBtn.on("click", () => $.dispatch("hb-data-editor-unload"))
  }

  loading(on) {
    const loader = $("div[hb-loader]", this.el.parent().find('div[hb-loader="true"]'));
    return on ? loader.show() : loader.hide();
  }

  handleSave(e) {
    e.preventDefault()
    this.loading(true)

    const url = this.collection.single
      ? `/_api/${this.collection.name}`
      : `/_api/${this.collection.name}${this.new ? `` : `/${this.item.id}`}`

    return fetch(url, {
      method: this.new ? "POST" : "PUT",
      body: this.editor.editor.getValue(),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then((response) => {
        $.dispatch("hb-load-item", {
          collection: this.collection,
          item: response
        })
        $.dispatch("hb-load-items", {
          collection: this.collection
        })

        setTimeout(() => {
          $.dispatch("hb-item-created", { collection: { ...this.collection }, item: response })
          $.dispatch("hb-data-editor-unload")
        }, 50)

        this.loading(false)
      })
  }
}

function DataPage() {

  this.collections = new CollectionsList()
  this.items = new ItemsList()
  this.view = new ItemView()
  this.editor = new EditorView()

  this.collections.load({ page: 1 });

  $.stateChange((params) => {
    this.collections.load(params);
  });
}

/* function DataPage() {
  this.window = $(window)
  this.collectionsList = $("#hbs-collections")
    .list("_data_collection", null, "collections")
  this.itemsList = $("#hbs-data-items").list("_data_list_item")
  this.itemTpl = $("#hbs-data-item")
  this.collectionForm = $("#collection-form")
  this.newColectionEl = $("#hb-new-collection")
  this.cancelCollectionEl = $("#hb-cancel-collection")
  this.item = null;
  this.activeCollection = null;

  this.newColectionEl.prev().addClass("hidden")

  this.editor = $("#hb-data-item-form-editor").aceEditor("json")

  this.loading = (on) => {
    const loader = $("#hbs-data-loading");
    return on ? loader.show() : loader.hide();
  };

  this.loadItems = async (collection, page) => {
    this.itemsList.setCollection(collection)
    this.loading(true)

    return this.itemsList.load({ page }, (response) => {
      return Array.isArray(response?.items) ? response?.items : []
    })
      .then((items) => {
        this.loading(false)
        return items
      });
  };

  this.loadSingleCollection = async (collection) => {
    this.loading(true)

    return fetch(`/_api/${collection}/`)
      .then((response) => response.json())
      .then(collection => {
        this.loading(false)
        return collection.items;
      })

  };

  this.loadCollections = async (params) => {
    this.loading(true)

    return this.collectionsList
      .load(params, (collections) => collections)
      .then((collections) => {
        $.dropdown(this.collectionsList);
        $.swap(this.collectionsList);
        $.forms()
        this.loading(false)

        $("h4 > a", this.collectionsList).on(
          "click", this.handleCollectionClick.bind(this)
        );

        return collections;
      })
  };

  this.handleBeforeDelete = (e) => {
    const form = $(e.target)

    if (form.attr("id").startsWith("delete-collection-")) {
      const container = form.closest('[data-name="collection"]')
      if (container) container.addClass("animate-pulse text-red-600 dark:text-red-600")
    }
  }

  this.window.on(
    "hb-before-submit",
    this.handleBeforeDelete.bind(this)
  )

  this.handleAfterDelete = (e) => {
    const form = $(e.target)

    if (form.attr("id").startsWith("delete-collection-")) {
      const container = form.closest('[data-name="collection"]')
      if (container) container.remove()
    }

    if (this.collectionForm.attr("id") === form.attr("id")) {
      this.cancelCollectionEl.trigger("click")
      this.loadCollections($.query())
    }
  }

  this.window.on(
    "hb-after-submit",
    this.handleAfterDelete.bind(this)
  )

  this.handleCollectionClick = (e) => {
    e.preventDefault();

    const el = $(e.target);
    const isActions = el.closest(`div[hb-actions="true"]`)

    if (isActions.length) return;

    const collection = el.data("id");
    const single = el.data("single");

    el.addClass("active")

    if (!single) {
      this.loadItems(collection, 1)
        .then(() => {
          this.activeCollection = collection;
        });
    } else {
      this.loadSingleCollection(collection)
        .then((collection) => {
          this.itemTpl.render("_data_item", collection);
          Prism.highlightAll()
        })
    }
  }

  this.handleItemClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const itemId =  $(e.target).closest("a").data("id");
    const item = this.itemsList.items.find(item => item.id === itemId);

    this.itemTpl.render("_data_item", item);

    Prism.highlightAll()
  }

  this.itemsList.on("click", this.handleItemClick.bind(this));

  this.collectionForm.on("hb-after-submit", (e) => {
    this.cancelCollectionEl.trigger("click")
  })

  this.loadCollections($.query()).then(() => this.collectionsList.click(0));

  $.stateChange((params) => {
    this.loadCollections(params);
  });
} */

$(() => new DataPage());