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

function formToObject() {
  const fields = this.get(0).elements
  const data = {};

  for (let i = 0; i < fields.length; i++) {
    const field = $(fields.item(i));
    data[field.attr("name")] = field.val()
  }

  return data;
}

function render(template, context, mode) {
  const { templates, partials } = Handlebars;
  const tpl = templates[template] || partials[template];

  console.log("TEMPLATE", template, tpl, templates, partials)

  if (tpl) {
    if (mode === "append") {
      return this.append(tpl(context));
    }

    if (mode === "prepend") {
      return this.prepend(tpl(context));
    }

    this.html(tpl(context));
  }

  return this;
}

function swapClass(classOne, classTwo) {
  this.removeClass(classOne)
  this.addClass(classTwo)
  return this;
}

function toggleBeetweenClasses(classOne, classTwo) {
  console.log("SWAPING", classOne, classTwo)
  if (this.hasClass(classOne)) {
    this.swapClass(classOne, classTwo)
  } else {
    this.swapClass(classTwo, classOne)
  }
  return this;
}

function toggleElements() {
  $(`[hb-toggle]`).on("click", (e) => {
    const el = $(e.currentTarget);
    const target = el.attr("hb-toggle")
    const targetEl = $(`#${target}`);

    if (targetEl) {
      if (targetEl.hasClass("hidden")) {

      }
    }
  })
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

const stickyHeader = (selector) => {
  const el = $(selector || "header.should-stick");
  const main = $("main")
  const bg = $('.sticky-bg', el)

  const bgColor = `bg-${el.attr("hb-bg") || 'transparent'}`
  const textColor = `text-${el.attr("hb-text") || 'white'}`
  const bgStickyColor = `bg-${el.attr("hb-sticky-bg") || 'white'}`
  const textStickyColor = `text-${el.attr("hb-sticky-text") || 'gray-700'}`

  if (el) {
    addEventListener("scroll",  (e) => {
      if (window.scrollY > el.outerHeight()) {
        main.swapClass('-mt-0', `-mt-[${el.outerHeight()}px]`)
        el.swapClass('absolute', 'sticky')
        bg.swapClass(bgColor, bgStickyColor)
        el.swapClass(textColor, textStickyColor)
      } else {
        main.swapClass(`-mt-[${el.outerHeight()}px]`, '-mt-0')
        el.swapClass('sticky', 'absolute')
        bg.swapClass(bgStickyColor, bgColor)
        el.swapClass(textStickyColor, textColor)
      }
    })
  }
}

const scrollTop = () => {
  const el = $("[hb-back-to-top=\"true\"]");

  addEventListener("scroll",  (e) => {
    if (window.scrollY > 200) {
      el.swapClass("bottom-[-100px]", "bottom-[30px]")
      el.swapClass("opacity-0", "opacity-1")
    } else {
      el.swapClass("bottom-[30px]", "bottom-[-100px]")
      el.swapClass("opacity-1", "opacity-0")
    }
  })

  el.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo({top: 0, behavior: 'smooth'});
  });
}

const dismiss = (elementId) => {
  const close = (el) => {
    el.swapClass("opacity-100", "opacity-0")

    setTimeout(() => {
      el.remove();
    }, 600)
  }

  if (!elementId) {
    $(`button[hb-dismiss]`).on("click", (e) => {
      e.preventDefault();
      close($($(e.target).attr("hb-dismiss")))
    })
  } else {
    close($(elementId))
  }
}

(function () {
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
    stickyHeader,
    scrollTop,
    dismiss,
  });

  $.fn.extend({
    formToObject: formToObject,
    swapClass: swapClass,
    scrollTop: scrollTop,
    toggleBeetweenClasses: toggleBeetweenClasses,
    modal: function (name, context) {
      this.render(name, context, "append");
    },
    confirm: modals.confirm,
    render,
    mutate: mutationObserver,
  });

  dismiss()
  console.log($)
})();
