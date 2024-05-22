const _s = {
  rowCheckbox: (context) => $("input[data-check=true]", context),
  loader: (context) => $("div[data-loader]", context),
  deleteAll: (context) => $("#hb-delete-all", context),
  deleteAllBtn: (context) => $("#hb-delete-all-action", context),
};

function table(collectionName, onLoad) {

  this.baseUrl = this.data("baseurl");
  this.onLoad = onLoad;
  this.rowCallback = (row) => row
  this.headers = this.data("headers")?.split(",");
  this.paging = {
    total: 0,
    pages: 0,
    page: null,
    next: null,
    prev: null
  };
  this.collection = collectionName || this.data("collection");
  this.list = $(`tbody`, this)
    .list("_table-row", null, this.collection)
    .setDefaultSort("id", "asc")
    .setDefaultContext({
      compact: this.data("compact")
    })
  this.checked = [];
  this.defaultContext = {}

  // if (tableEl.tagName !== "table") return;

  const id = this.attr("id")
  const searchForm = $(`#${id}-search`).form({})
  const ssrValue = this.data("ssr")
  const ssr = typeof ssrValue === "boolean" ? ssrValue : true;
  const checkAllEl = $("#checkbox-all");

  const container = $(`#${this.attr("id")}-container`);

  this.paging.page = parseInt($.query("page")) || 1;

  this.pagingEl = $(`#${this.attr("id")}-paging`)
    .pagination(
      this.baseUrl,
      this.collection
    ).click((e, item) => this.load({ _page: item.page }));

  this.loading = (on) => {
    const loader = _s.loader(container);
    return on ? loader.show() : loader.hide();
  };

  this.wait = (timer) => {
    return new Promise((resolve) => setTimeout(resolve, timer))
  }

  this.onRow = (callback) => {
    if (typeof callback === "function") {
      this.rowCallback = callback
    }
    return this;
  }

  this.load = async (params) => {
    this.loading(true);

    return this.list
      .load({ _page: this.paging.page, ...params }, this.handleOnLoad.bind(this))
      .finally(() => {
        this.checked = []
        this.loading(false);
        $.dispatch(this);
        $.swap(this);
      });
  }

  this.setDefaultContext = (context = {}) => {
    this.defaultContext = context || {}
    return this
  }

  this.rows = () => {
    return this.list.all().map(row => row.row)
  }

  this.remove = (id) => {
    this.list.removeItem(id);
  }

  this.selected = () => {
    return this.checked
  }

  this.setRows = (rows, context = {}) => {
    let mapped = (rows || []).map(row => (this.rowCallback({
      id: row.id,
      row,
      headers: this.headers,
      context: {
        ...this.defaultContext,
        ...context,
      },
      actions: []
    })))

    if (typeof this.onLoad === "function") {
      mapped = this.onLoad(mapped);
    }

    this.list
      .setItems(mapped)
      .sort()
      .update({ ...this.defaultContext, ...context })

    $.dispatch(this.list)
  }

  this.appendRow = (row, context = {}) => {
    this.list.appendItem(this.rowCallback({
      id: row.id,
      row,
      headers: this.headers,
      context: {
        ...this.defaultContext,
        ...context,
      },
      actions: []
    }), context)

    $.dispatch(this.list.lastEl())
    return this;
  }

  this.prependRow = (row, context = {}) => {
    this.list.prependItem(this.rowCallback({
      id: row.id,
      row,
      headers: this.headers,
      context: {
        ...this.defaultContext,
        ...context,
      },
      actions: []
    }), context)

    $.dispatch(this.list.firstEl())
    return this;
  }

  this.replaceRow = (row, context = {}) => {
    this.list.replaceItem(this.rowCallback({
      id: row.id,
      row,
      headers: this.headers,
      context: {
        ...this.defaultContext,
        ...context,
      },
      actions: []
    }), context)

    $.dispatch(this.list.getItemEl(row.id))
    return this;
  }

  this.selectAll = (e) => {
    const allItems = this.list.all();
    if (!e.target.checked) {
      this.checked = [];
      allItems.forEach(item =>
        this.deselectRow(item.id)
      );
      _s.deleteAll().hide()
    } else {
      allItems.forEach(item => {
        this.checked.push(item.id);
        this.selectRow(item.id);
      });
      _s.deleteAll().show()
    }
  }

  this.selectRow = (id) => {
    const itemEl = this.list.getItemEl(id);
    const rowCheckbox = _s.rowCheckbox(itemEl);
    rowCheckbox.prop("checked", true);
    this.checked.push(id)
  }

  this.deselectRow = (id) => {
    const itemEl = this.list.getItemEl(id);
    const rowCheckbox = _s.rowCheckbox(itemEl);
    rowCheckbox.prop("checked", false);
    this.checked = this.checked.filter(iid => iid !== id)
  }

  this.handleSearch = (e) => {
    const data = searchForm.data()
    const payload = {}
    if (data.search) {
      payload.q = data.search
    }
    this.load(payload)
  }

  this.handleOnLoad = (response) => {
    this.paging = response;

    this.pagingEl?.update({
      ...response
    });

    const data = {
      ...response,
      items: (response.items || [])
        .map(item => this.rowCallback({
          id: item.id,
          row: item,
          headers: this.headers,
          context: {
            ...this.defaultContext,
          },
          actions: []
        }))
    };

    if (typeof this.onLoad === "function") {
      return this.onLoad(data);
    }

    return data;
  }

  this.handleListChanged = (e) => {
    const item = e.___td.item;
    const itemEl = this.list.getItemEl(item.id);
    const checkbox = _s.rowCheckbox(itemEl);

    checkbox.off("change");
    checkbox.on("change", (e) => {
      if (e.target.checked) {
        this.checked.push(item.id);
        _s.deleteAll().show()
      } else {
        this.checked = this.checked.filter(i => i !== item.id);
        if (!this.checked.length) {
          _s.deleteAll().hide()
        }
      }
    });
  }

  this.handleDeleteAll = async() => {
    _s.deleteAllBtn().prop("disabled", true)

    if (ssr) {
      const promises = this.checked.map(id => {
        this.checked = this.checked.filter(i => i !== id)
        return $.rest.delete(`/_api/${this.collection}/${id}`)
      })

      await Promise.all(promises)

      await this.load({ _page: this.paging.page})
    } else {
      this.checked = []
    }

    _s.deleteAllBtn().prop("disabled", false)
    _s.deleteAll().hide()
    return true;
  }

  checkAllEl.on("change", this.selectAll.bind(this));

  this.list.on("hb-list-changed", this.handleListChanged.bind(this));

  $.subscribe("hb-delete-all", this.handleDeleteAll.bind(this))

  searchForm.on("change", this.handleSearch.bind(this))

  if (ssr) {
    this.load({ _page: this.paging.page });
  }

  return this
}

$.fn.table = table;

$.table = function(context) {
  $("table[data-auto-init=true]", context).each((i, el) => $(el).table())
}

$(() => {
  // $("table[data-auto-init=true]").each((i, el) => $(el).table())
});