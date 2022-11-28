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

$.fn.queryParams = function () {
  const url = new URL(window.location.href);
  return url.searchParams;
};

$.fn.updateUrl = function (params = {}) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, value);
  });

  window.history.pushState(null, "", url.toString());
};

$.fn.navigate = function (params = {}) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, value);
  });

  window.location.href = url.toString();
};

$.fn.template = function (template, context, mode) {
  const { templates } = Handlebars;

  if (template in templates) {
    if (mode === "append") {
      return this.append(templates[template](context));
    }
    if (mode === "prepend") {
      return this.prepend(templates[template](context));
    }

    this.html(templates[template](context));
  }
};

$.fn.partial = function (template, context, mode) {
  const { partials } = Handlebars;

  if (template in partials) {
    if (mode === "append") {
      return this.append(partials[template](context));
    }
    if (mode === "prepend") {
      return this.prepend(partials[template](context));
    }

    this.html(partials[template](context));
  }
};

$.fn.list = function (prefix, template, emptyTemplate) {
  let count = 0;
  const { partials } = Handlebars;
  const children = this.children();

  const idx = (id) => `${prefix}-${id || ++count}`;

  const withId = (context, id) => ({ id: idx(id), ...context });

  const newItem = (context, id) => $(partials[template](withId(context, id)));

  const remove = (id) => {
    --count;

    if (typeof id === "string") {
      $(`#${id}`, this).remove();
    } else {
      $(id).remove();
    }

    if (count === 0 && emptyTemplate) {
      this.html(partials[emptyTemplate]({}));
    }

    return this.list(prefix, template, emptyTemplate);
  };

  const removable = (elem) =>
    $(".remove", elem).on("click", () => remove(elem));

  const prepend = (context = {}) => {
    const item = newItem(context);

    if (count === 0) {
      this.html(item);
    } else {
      this.prepend(item);
    }

    removable(item);

    return this.list(prefix, template, emptyTemplate);
  };

  const append = (context = {}) => {
    const item = newItem(context);

    if (count === 0) {
      this.html(item);
    } else {
      this.append(item);
    }

    removable(item);

    return this.list(prefix, template, emptyTemplate);
  };

  const replace = (id, context) => {
    const item = newItem(context, id);

    $(idx(id), this).replaceWith(item);

    removable(item);

    return this.list(prefix, template, emptyTemplate);
  };

  children.each((i, child) => {
    if (!$(child).attr("id") || !$(child).attr("id").startsWith(prefix)) {
      $(child).attr("id", idx(i));
      ++count;
    }

    removable($(child));
  });

  if (count === 0 && emptyTemplate) {
    this.html(partials[emptyTemplate]({}));
  }

  return {
    prepend,
    append,
    remove,
    replace,
  };
};
