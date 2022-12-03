["pushState", "replaceState"].forEach((name) => {
  window.history[name] = new Proxy(window.history[name], {
    apply: (target, thisArg, argArray) => {
      target.apply(thisArg, argArray);

      window.dispatchEvent(
        new CustomEvent(name, {
          detail: new URL(argArray[2]),
        })
      );
    },
  });
});

function toCamelCase(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
}

$.fn.register = function (prefix) {
  const targets = {};

  $("[id]", this).each((i, elem) => {
    const id = $(elem).attr("id");

    if (id) {
      const cleaned = id.replace(prefix, "");

      if (!targets[cleaned]) {
        targets[toCamelCase(cleaned)] = elem;
      }
    }
  });

  return targets;
};

$.fn.mutate = function (attributes, callback) {
  const config = {
    attributes: true,
    childList: true,
    attributeOldValue: true,
    attributeFilter: attributes,
  };

  const observer = new MutationObserver((mutationList, observer) => {
    const { target, attributeName } = mutationList[0] || {};

    if (attributes.indexOf(attributeName) > -1) {
      callback(
        attributes.reduce((values, attribute) => {
          return {
            ...values,
            [attribute]: target.getAttribute(attribute),
          };
        }, {})
      );
    }
  });

  this.each((i, el) => {
    observer.observe(el, config);
  });
};

$.url = function () {
  return new URL(window.location.href);
};

$.query = function () {
  return new URL(window.location.href).searchParams;
};

$.pushState = function (params = {}) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    if ([null, undefined].indexOf(params[key]) > 0) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
      }
    } else {
      url.searchParams.set(key, params[key]);
    }
  });

  window.history.replaceState(null, "", url.toString());
};

$.navigate = function (params = {}) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });

  window.location.assign(url.toString());
};

$.onStateChange = function (callback) {
  const cb = (e) => callback(e.detail.searchParams);
  $(window).on("pushstate replaceState", cb);
  return () => {
    $(window).off("pushstate replaceState", cb);
  };
};

$.fn.click = function (callback) {
  this.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    callback($(e.currentTarget));
  });
};

$.fn.render = function (template, context, mode) {
  const { templates, partials } = Handlebars;
  const tpl = templates[template] || partials[template];

  if (tpl) {
    if (mode === "append") {
      return this.append(tpl(context));
    }

    if (mode === "prepend") {
      return this.prepend(tpl(context));
    }

    this.html(tpl(context));
  }
};

$.fn.modal = function (name, context) {
  this.render("_confirm-modal", context, "append");
};

$.fn.confirm = function (name, context, callback) {
  this.render(name, context, "append");
  console.log(`#${context.id}`);
  const modal = $(`#${context.id}`);
  console.log(modal);
  $("[data-modal-confirm]", modal).click(() => {
    callback(modal);
  });
  $("[data-modal-cancel]", modal).click(() => {
    modal.remove();
  });
};

$.fn.openClose = function (callback) {
  const target = this.data("toggle");

  this.click((elem) => {
    if (this.data("active") === true) {
      $(`#${target}`).hide();
      this.data("active", false);
    } else {
      $(`#${target}`).show();
      this.data("active", true);
    }

    callback(this.data("active"), elem);
  });
};

$.fn.list = function (template, emptyTemplate) {
  const { partials } = Handlebars;
  let count = 0;

  const withId = (context) => ({ id: context.id || count + 1, ...context });

  const removable = (item) =>
    $(".remove", item).click(() => this.removeItem(item));

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
};
