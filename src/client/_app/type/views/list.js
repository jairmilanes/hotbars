import { BaseListView } from "./base.js";

export const _s = {
  listActions: (context) => $("div[data-list-actions]", context),
  el: (id) => $(`#${id}`),
  paging: (id) => $(`#${id}-paging`),
  checkAll: (id) => $(`input[name=${id}-check-all]`),
  form: (id) => $(`form[data-page-form="${id}-form"]`)
}

export class BaseList extends BaseListView {
  list;
  form;
  pagination

  constructor(id, context) {
    super(id, context);

    $.subscribe("hb-remove-row", this.handleRemove.bind(this))
    $.subscribe("hb-edit-row", this.handleEdit.bind(this))
    $.subscribe("hb-view-row", this.handleView.bind(this))

    this.initList(id, context)
  }

  initList(id, context) {
    if (!this.context.rowTemplate) {
      throw new Error("Row template must be set.")
    }

    this.setUpForm(id, context)
    this.setUpList(id, context)
    this.setUpPagination(id, context)

    $.stateChange(this.load.bind(this))

    $.subscribe("hb-select-all", this.list.selectAll.bind(this.list))
    $.subscribe("hb-delete-all", this.handleDeleteAll.bind(this))
    $.pushState(this.params())
  }

  params(page) {
    return {
      ...($.query() || {}),
      _page: page || $.query("_page") || "1",
      _limit: this.context?.type?.itemsPerPage || 10
    }
  }

  setUpList(id, context) {
    this.list = this.el
      .list(this.context.rowTemplate, null, this.collection)
      .setDefaultContext(context)
      .setSSR(true)
      .on("hb-selection-changed", this.handleSelectionChanged.bind(this))
      .on("hb-list-loaded", this.handleOnLoad.bind(this))
  }

  setUpPagination(id, context) {
    if (this.context.type.enablePagination) {
      this.pagination = _s.paging(id)
        .pagination(
          this.baseUrl,
          this.collection
        )
        .click((e, item) =>
          $.pushState(this.params(item.page))
        );
    }
  }

  setUpForm(id, context) {
    this.form = _s.form(id).form({})
    this.form.setAll($.query())
    this.form.on("hb-submit", (e) => $.pushState(e.___td.data))
  }

  load() {
    this.list.load(
      this.params(),
      this.handleOnData.bind(this)
    ).then(() => {
      $.dispatch(this.list)
      this.form.loading(false)
    })
  }

  handleOnLoad(e) {
    const data = e.___td

    this.pagination?.update({
      ...e.___td
    });
  }

  handleSelectionChanged(e) {
    const { value, count } = e.___td

    if (count > 0) {
      _s.listActions().show()
    } else {
      _s.listActions().hide()
    }
  }

  async handleRemove(e) {
    if (this.list.has(e.rowid)) {
      await this.remove(this.list.getItem(e.rowid))
      await this.list.load()
    }
  }

  async handleDeleteAll(e) {
    const items = this.list.all()

    await this.deleteAll(items)

    this.list.load()
  }
}