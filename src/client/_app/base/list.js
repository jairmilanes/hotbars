export class BaseList {
  container;
  list;

  constructor(listID, tpl, collectionName) {
    this.list = $(`#${listID}`).list(tpl, null, collectionName)

    this.list.setActiveState(
      "bg-white dark:bg-gray-800",
      "bg-gray-100 dark:bg-gray-900"
    )

    this.container = this.list.parent()
  }

  loading(on) {
    const loader = $("div[hb-loader]", this.container);
    return on ? loader.show() : loader.hide();
  };

  load(params, callback) {
    this.loading(true)
    return this.list
      .load(params, callback)
  }
}