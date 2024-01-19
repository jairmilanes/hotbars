function keys(obj) {
  return Object.keys(obj)
}

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function isNil(value) {
  return value !== undefined && value !== null;
}

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

    if (["button"].indexOf(field.get(0).localName) > -1) continue;

    if (["radio", "checkbox"].indexOf(field.attr("type")) > -1) {
      if (fields.item(i).checked) {
        data[field.attr("name")] = field.val()
      }
    } if (field.attr("type") === "file") {
      data[field.attr("name")] = field.get(0).files
    } else {
      data[field.attr("name")] = field.val()
    }
  }

  return data;
}

function render(template, context, mode) {
  const { templates, partials } = Handlebars;
  const tpl = templates[template] || partials[template];

  if (tpl) {
    if (mode === "append") {
      return this.append(tpl({...context}));
    }

    if (mode === "prepend") {
      return this.prepend(tpl({...context}));
    }

    this.html(tpl({...context}));
  }

  return this;
}

async function renderRemote(template, context, mode) {
  const params = new URLSearchParams(context)

  params.set("partialId", template)

  const response = await fetch(`/_partial?${params.toString()}`)
  const html = await response.text()

  if (mode === "append") {
    return this.append(html);
  }

  if (mode === "prepend") {
    return this.prepend(html);
  }

  if (mode === "replace") {
    return this.replaceWith(html);
  }

  this.html(html);
}

function swapClass(classOne, classTwo) {
  if (!classTwo && isObject(classOne)) {
    const classes = keys(classOne)

    classes.forEach(className => {
      this.removeClass(className)
      if (!isNil(classOne[className])) {
        this.addClass(classOne[className])
      }
    })
  } else {
    this.removeClass(classOne)
    this.addClass(classTwo)
  }

  return this;
}

function toggleBeetweenClasses(classOne, classTwo) {
  if (this.hasClass(classOne)) {
    this.swapClass(classOne, classTwo)
  } else {
    this.swapClass(classTwo, classOne)
  }
  return this;
}

const modals = {
  custom(template, context, callback) {
    if (!context.id) {
      throw new Error(`Must provide "context.id" for a modal to be created.`)
    }

    if (!template) {
      throw new Error(`Must provide "template" for a modal to be created.`)
    }

    $("body").render(template, context, "append");

    const modal = $(`#${context.id}`);

    $.dismiss(null, modal)

    $("[data-dismiss]", modal).on("click",() => {
      if (typeof callback === "function") {
        callback(modal);
      }
    });
  },
  alert(context, callback) {
    if (!context.id) {
      throw new Error(`Must provide "context.id" for a modal to be created.`)
    }

    $("body").render(context.template || "_alert-modal", context, "append");

    const modal = $(`#${context.id}`);

    $.dismiss(null, modal)

    $("[data-dismiss]", modal).on("click",() => {
      if (typeof callback === "function") {
        callback(modal);
      }
    });
  },
  confirm(context, callback) {
    if (!context.id) {
      throw new Error(`Must provide "context.id" for a modal to be created.`)
    }

    $("body").render(context.template || "_confirm-modal", context, "append");

    const modal = $(`#${context.id}`);

    $.dismiss(null, modal)

    $("[data-modal-confirm]", modal).on("click", () => {
      if (typeof callback === "function") {
        callback(modal);
      }

      $.dismiss(context.id, modal)
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

/**
 * Fades an element out and removes it from the view.
 * @param elementId
 * @param context
 */
const dismiss = (elementId, context) => {
  const close = (el) => {
    el.swapClass("opacity-100", "opacity-0")

    setTimeout(() => {
      el.remove();
    }, 600)
  }

  if (!elementId) {
    $(`button[data-dismiss]`, context || $("body"))
      .on("click", (e) => {
        e.preventDefault();
        close($(`#${$(e.currentTarget).data("dismiss")}`))
      })
  } else {
    close($(`#${elementId}`))
  }
}

function disable(v = true) {
  if (v) {
    this.attr("disabled", "disabled")
  } else {
    this.removeAttr("disabled")
  }
  return this;
}

function toggleEl(el) {
  if (!el) return;

  let target;
  if (typeof el === "string") {
    target = $(`#${el}`)
  } else if (isObject(el)) {
    target = $(el)
  }

  if (target.length > 0) {
    if (target.hasClass("hidden")) {
      target.removeClass("hidden")
    } else {
      target.addClass("hidden")
    }
  }
}

function toggles(context) {
  $("[hb-toggle],[data-toggle]", context || $("body")).on("click", (e) => {
    const el = $(e.currentTarget)
    const target = $(`#${el.attr("hb-toggle") || el.attr("data-toggle")}`)
    toggleEl(target)
  })
}

function swap(context) {
  $("[hb-swap]", context || $("body")).each((i, el) => {
    let timer = null;
    $(el).on("click", (e) => {
      const el = $(e.currentTarget)
      if (!el) return;

      const target = $(`#${el.attr("hb-swap")}`)
      const swapEl = $(`#${el.attr("hb-swap-target")}`)
      const swapDuration = el.attr("hb-swap-duration")

      if ((swapEl || el) && target) {
        if (target.hasClass("hidden")) {
          (swapEl.length === 0 ? el : swapEl).addClass("hidden")
          target.removeClass("hidden")

          if (swapDuration) {
            clearTimeout(timer)
            timer = setTimeout(() => {
              (swapEl.length === 0 ? el : swapEl).removeClass("hidden")
              target.addClass("hidden")
            }, parseInt(swapDuration, 10))
          }
        } else {
          (swapEl.length === 0 ? el : swapEl).removeClass("hidden")
          target.addClass("hidden")

          if (swapDuration) {
            clearTimeout(timer)
            timer = setTimeout(() => {
              (swapEl.length === 0 ? el : swapEl).addClass("hidden")
              target.removeClass("hidden")
            }, parseInt(swapDuration, 10))
          }
        }
      }
    })
  })
}

function hide() {
  this.addClass("hidden")
  return this
}

function show() {
  this.removeClass("hidden")
  return this
}

function differ(time) {
  let timer = null
  this.then = (callback) => {
    if (typeof callback === "function") {
      const t = typeof time === "string" ? parseInt(time, 10) : time;
      clearTimeout(timer)
      timer = setTimeout(() => callback(), t)
    }
  }
  return this;
}

function initState(states) {
  this.setState = (name) => {
    const nextState = typeof states === "function" ? states(name) : states[name];
    const stateKeys = typeof states === "function" ? states() : keys(states)

    stateKeys.forEach(key => {
      if (key !== name && key !== "init") {
        const classes = ((typeof states === "function" ? states(key) : states[key]) || "").split(" ")

        classes.forEach(className => this.removeClass(className))
      }
    })

    this.addClass(nextState)

    return this;
  }

  return this;
}

function button() {
  this.isLoading = function() {
    const spinner = this.find(`[data-spinner="true"]`)
    return spinner.hasClass("hidden")
  }

  this.loading = function(on, text) {
    const spinner = this.find(`[data-spinner="true"]`)
    const textEl = this.find(`.button-text`)
    const loadingText = this.data("loading-text")

    if (on) {
      spinner.show()

      if (!this.data("loading-text")) {
        textEl.hide()
      } else {
        if (text) {
          this.data("default-text", textEl.html())
          textEl.html(text)
        } else if (loadingText) {
          this.data("default-text", textEl.html())
          textEl.html(loadingText)
        }
      }
    } else {
      spinner.hide()
      textEl.show()

      if (this.data("default-text")) {
        textEl.html(this.data("default-text"))
        this.data("default-text", null)
      }
    }
    return this;
  }

  this.disable = function(on) {
    if (on) {
      this.addClass("cursor-not-allowed")
      this.attr("disabled", "disabled")
    } else {
      this.removeClass("cursor-not-allowed")
      this.removeAttr("disabled")
    }
    return this;
  }

  return this;
}

function toggleElClass(el, className, callback) {
  this.on("click", (e) => {
    let on = localStorage.getItem("hb-side-panel") || true;
    let elem = null

    if (el !== null && typeof el === "object") {
      elem = el

      if (el.hasClass(className)) {
        el.removeClass(className)
      } else {
        el.addClass(className)
      }
    } else {
      elem = $(`#${el}`)

      if (elem.hasClass(className)) {
        elem.removeClass(className)
      } else {
        elem.addClass(className)
      }
    }

    console.log(el, elem)
    on = elem.hasClass(className)

    if (typeof callback === "function") {
      callback(on)
    }
  })

  return this;
}

function toast(type, message, timeout = 5000, position = "bottom-right") {
  const { templates, partials } = Handlebars;
  const tpl = templates["_toast"] || partials["_toast"];
  const newContainer = $(`<div class="fixed z-50" data-toasts="true"></div>`)
  let container = $('div[data-toasts]')

  if (!container.length) {
    if (position === "top-right" || position === "top-left") {
      newContainer.addClass(`top-10`)
    }

    if (position === "bottom-right" || position === "bottom-left") {
      newContainer.addClass(`bottom-2`)
    }

    if (position === "bottom-right" || position === "top-right") {
      newContainer.addClass(`right-10`)
    }

    if (position === "bottom-left" || position === "top-left") {
      newContainer.addClass(`left-10`)
    }

    container = newContainer
    $("body").append(newContainer)
  }

  const newToast = $(tpl({ message, type, position: null }).trim())

  container.prepend(newToast)

  $.dismiss(null, newToast)

  $(".hb-toast-backdrop", newToast)
    .addClass(`w-0 ease-linear duration-[${timeout}ms]`)

  setTimeout(() => {
    $(".hb-toast-backdrop", newToast)
      .swapClass("w-0", "w-full")
  }, 50)

  setTimeout(() => {
    $.dismiss(newToast.attr("id"))
  }, timeout)

  return newToast
}

function toQueryString(obj, prefix) {
  var str = [], k, v;
  for(var p in obj) {
    if (!obj.hasOwnProperty(p)) {continue;} // skip things from the prototype
    if (~p.indexOf('[')) {
      k = prefix ? prefix + "[" + p.substring(0, p.indexOf('[')) + "]" + p.substring(p.indexOf('[')) : p;
// only put whatever is before the bracket into new brackets; append the rest
    } else {
      k = prefix ? prefix + "[" + p + "]" : p;
    }
    v = obj[p];
    str.push(typeof v == "object" ?
      toQueryString(v, k) :
      encodeURIComponent(k) + "=" + encodeURIComponent(v));
  }
  return str.join("&");
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
    searchParams: function(params) {
      const q = new URLSearchParams(params);
      return q.toString()
    },
    pushState,
    navigate,
    stateChange,
    stickyHeader,
    scrollTop,
    dismiss,
    swap,
    differ,
    modals,
    toast,
    toggle: toggleEl,
    toQueryString
  });

  $.fn.extend({
    hide,
    show,
    button,
    initState,
    formToObject,
    swapClass,
    scrollTop,
    toggleBeetweenClasses,
    render,
    renderRemote,
    mutate: mutationObserver,
    disable,
    toggleElClass,
  });

  swap()
  toggles()
  dismiss()
})();
