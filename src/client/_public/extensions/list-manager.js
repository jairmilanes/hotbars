function list(templateName, emptyTemplate, collection) {
  const { partials, templates } = Handlebars;
  let count = 0;

  this.ssr = !!collection
  this.collection = collection
  this.items = []
  this.itemsEl = []
  this.activeState = ""
  this.inactiveState = ""
  console.log("partials", Object.keys(partials))
  console.log("templates", Object.keys(templates))
  this.setSSR = (value) => {
    this.ssr = value
    return this
  }

  this.setCollection = (value) => {
    this.collection = value
    this.ssr = !!value
    return this
  }

  this.setActiveState = (active, inactive) => {
    this.activeState = active
    this.inactiveState = inactive
    return this
  }

  const template = name => templates[name] || partials[name]

  const withId = (context) => ({ id: context.id || count + 1, ...context });

  const removable = (item) =>
    $(".remove", item).on("click",() => this.removeItem(item.attr("hb-list-item")));

  this.newItem = (context) => $(template(templateName)(withId(context)).trim());

  this.reset = () => {
    count = 0;
    this.html("");
  };

  this.load = (params, responseCallback) => {
    if (!this.ssr) return;
    return fetch(`/_api/${this.collection}/?${$.searchParams(params)}`)
      .then((response) => response.json())
      .then(typeof responseCallback === "function" ? responseCallback : response => response)
      .then((items) => {
        this.reset();

        items.forEach((item) =>
          this.appendItem({ ...item, __collection: this.collection })
        );

        this.items = items

        return items;
      });
  }

  this.clearActive = () => {
    const els = this.children();

    els.each((i, el) => {
      $(el).removeClass(this.activeState)
      $(el).addClass(this.inactiveState)
    })
  }

  this.setActive = (id, on) => {
    this.clearActive()

    if (on) {
      $(`*[hb-list-item="${id}"]`, this).swapClass(this.inactiveState, this.activeState)
    } else {
      $(`*[hb-list-item="${id}"]`, this).swapClass(this.activeState, this.inactiveState)
    }
  }

  this.getItem = (id) => $(`*[hb-list-item="${id}"]`, this);

  this.dispatch = (type, item) => {
    this.trigger("hb-list-changed", {
      type: "append",
      item,
      count,
      lastCount: count - 1
    })
  }

  this.removeItem = (id) => {
    this.getItem(id).remove();

    --count;

    if (count === 0 && emptyTemplate) {
      this.html(template(emptyTemplate)({}));
    }

    this.itemsEl.forEach((item, i) => {
      if (item.attr("hb-list-item") === id) {
        this.itemsEl.splice(i, 1)
      }
    })

    if (this.ssr && this.items.length) {
      this.items.each((i, item) => {
        if (item.id === id) {
          this.items.splice(i, 1)
        }
      })
    }

    this.dispatch("removed", null)

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

    item.attr("hb-list-item", context.id)

    ++count;

    this.dispatch("prepend", item)

    return this;
  };

  this.appendItem = (context = {}) => {
    const item = this.newItem(context);

    this.append(item);

    removable(item);

    item.attr("hb-list-item", context.id)

    this.itemsEl.push(item)

    ++count;

    this.dispatch("append", item)

    return this;
  };

  this.replaceItem = (id, context) => {
    const item = this.newItem(context);

    this.getItem(id).replaceWith(item);

    removable(item);

    this.dispatch("replaced", item)

    return this;
  };

  this.click = (index) => {
    this.children().eq(index).trigger("click");
  };

  this.find(`[hb-list-item]`).each((i, item) => {
    this.itemsEl.push($(item))
    ++count
  })

  if (count === 0 && emptyTemplate) {
    this.html(template(emptyTemplate)({}));
  }

  return this;
}


(() => {
  if ($ === undefined) return;

  $.fn.extend({
    list: list,
  });
})();