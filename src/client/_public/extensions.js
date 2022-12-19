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

function listManager(template, emptyTemplate) {
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
}

function mutationObserver(attributes, callback) {
  const targetValues = {};

  const config = {
    attributes: true,
    childList: true,
    attributeOldValue: true,
    attributeFilter: attributes.map((attr) => {
      if (attr && typeof attr === "object") {
        const key = Object.keys(attr)[0];
        targetValues[key] = attr[key].split(/\s/g);
        return key;
      }
      return attr;
    }),
  };

  const observer = new MutationObserver((mutationList, observer) => {
    const { target, attributeName } = mutationList[0] || {};

    if (config.attributeFilter.indexOf(attributeName) > -1) {
      const value = $(target).attr(attributeName);

      if (attributeName in targetValues) {
        const mutated = targetValues[attributeName].filter((attr) =>
          value.includes(attr)
        );

        if (mutated && mutated.length) {
          return callback(attributeName, mutated, value);
        }
        return;
      }

      callback(
        attributeName,
        attributes.reduce(
          (values, attribute) => ({
            ...values,
            [attribute]: $(target).attr(attribute),
          }),
          {}
        ),
        value
      );
    }
  });

  this.each((i, el) => {
    observer.observe(el, config);
  });
}

function pushState(params = {}) {
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
}

function stateChange(callback) {
  const cb = (e) => callback(e.detail.searchParams);
  $(window).on("pushstate replaceState", cb);
  return () => {
    $(window).off("pushstate replaceState", cb);
  };
}

function navigate(params = {}) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });

  window.location.assign(url.toString());
}

function render(template, context, mode) {
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
}

const modals = {
  confirm: function (name, context, callback) {
    this.render(name, context, "append");

    const modal = $(`#${context.id}`);

    $("[data-modal-confirm]", modal).click(() => {
      callback(modal);
    });
    $("[data-modal-cancel]", modal).click(() => {
      modal.remove();
    });
  },
};

(function ($) {
  $.extend({
    url: function () {
      return new URL(window.location.href);
    },
    query: function (key) {
      const q = new URL(window.location.href).searchParams;
      if (key) return q.get(key);
      return q;
    },
    pushState,
    navigate,
    stateChange,
  });

  $.fn.extend({
    list: listManager,
    modal: function (name, context) {
      this.render(name, context, "append");
    },
    confirm: modals.confirm,
    render,
    mutate: mutationObserver,
  });
})(jQuery);
