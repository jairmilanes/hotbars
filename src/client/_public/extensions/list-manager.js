function list(template, emptyTemplate) {
  const { partials } = Handlebars;
  let count = 0;

  const withId = (context) => ({ id: context.id || count + 1, ...context });

  const removable = (item) =>
    $(".remove", item).on("click",() => this.removeItem(item));

  this.newItem = (context) => $(partials[template](withId(context)).trim());

  this.reset = () => {
    count = 0;
    this.html("");
  };

  this.getItem = (id) => $(`*[data-id="${id}"]`, this);

  this.removeItem = (id) => {
    if (typeof id === "number" || typeof id === "string") {
      this.getItem(id).remove();
    } else {
      $(id).remove();
    }

    --count;

    if (count === 0 && emptyTemplate) {
      this.html(partials[emptyTemplate]({}));
    }

    return this;
  };

  this.prependItem = (context = {}) => {
    const item = this.newItem(context);

    if (count === 0) {
      this.html(item.get(0).outerHTML);
    } else {
      this.prepend(item);
    }

    removable(item);

    ++count;

    return this;
  };

  this.appendItem = (context = {}) => {
    const item = this.newItem(context);

    if (count === 0) {
      this.html(item.get(0).outerHTML);
    } else {
      this.append(item);
    }

    removable(item);

    ++count;

    return this;
  };

  this.replaceItem = (id, context) => {
    const item = this.newItem(context);

    this.getItem(id).replaceWith(item);

    removable(item);

    return this;
  };

  this.click = (index) => {
    this.children().eq(index).trigger("click");
  };

  if (count === 0 && emptyTemplate) {
    this.html(partials[emptyTemplate]({}));
  }

  return this;
}

(() => {
  if ($ === undefined) return;

  $.fn.extend({
    list: list,
  });
})();