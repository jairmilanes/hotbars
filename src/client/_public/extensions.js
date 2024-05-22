function keys(obj) {
  return Object.keys(obj)
}

function isObject(value) {
  return value && typeof value === "object" && value !== null;
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

function createUrl(params = {}) {
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

  return url
}

function pushState(params = {}) {
  const url = createUrl(params)

  window.history.replaceState(null, "", url.toString());
}

function stateChange(callback) {
  const cb = (e) => callback(Object.fromEntries(e.detail.searchParams));
  $(window).on("pushstate replaceState", cb);
  return () => {
    $(window).off("pushstate replaceState", cb);
  };
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
    } else if (field.attr("type") === "file") {
      const { files } = field.get(0)
      if (!files?.length && field.data("file-id")) {
        data[field.attr("name")] = field.data("file-id")
      } else {
        data[field.attr("name")] = files.length ? files : null
      }
    } else {
      data[field.attr("name")] = field.val()
    }
  }

  return data;
}

function template(tplOrName) {
  const { partials } = Handlebars

  if (partials[tplOrName]) {
    return partials[tplOrName]
  }

  if (tplOrName.indexOf("{{") > -1) {
    try {
      return Handlebars.compile(tplOrName)
    } catch(e) {
      console.error(e)
    }
  }

  throw new Error(`Could not find template "${tplOrName}" in partials.`)
}

function render(tplOrName, context, mode) {
  let tpl = template(tplOrName);

  if (tpl) {
    if (mode === "append") {
      return this.append(tpl({...context}));
    }

    if (mode === "prepend") {
      return this.prepend(tpl({...context}));
    }

    this.html(tpl({...context}));
  } else {
    console.warn("Template ", tplOrName, "Not found")
  }

  return this;
}

async function renderPartial(partial, context, mode) {
  const response = await fetch(`/_partial`, {
    method: "POST",
    body: JSON.stringify({
      partial,
      context
    }),
    headers: {
      "Content-type": "application/json"
    }
  })

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

    const modalId = `#${context.id}`
    const modal = $(modalId);

    callback("opened", modal);

    $.dismiss(null, modal, () => {
      if (typeof callback === "function") {
        callback("close", modal);
      }
    })

    modal.close = () => {
      $.dismiss(modalId, {}, () => {
        if (typeof callback === "function") {
          callback("close", modal);
        }
      })
    }

    // modal.on("close", () => $.dismiss(modalId))

    return modal
  },
  alert(context, callback) {
    if (!context.id) {
      throw new Error(`Must provide "context.id" for a modal to be created.`)
    }

    $("body")
      .render(context.template || "_alert-modal", context, "append");

    const modal = $(`#${context.id}`);

    callback("opened", modal);

    $.dismiss(null, modal)

    $("[data-dismiss]", modal).on("click",() => {
      if (typeof callback === "function") {
        callback("closed", modal);
      }
    });
  },
  confirm(context, callback) {
    if (!context.id) {
      throw new Error(`Must provide "context.id" for a modal to be created.`)
    }

    $("body").render(context.template || "_confirm-modal", context, "append");

    const modal = $(`#${context.id}`);

    callback("opened", modal);

    $.dismiss(null, modal, () => {
      callback("closed", modal);
    })

    $("[data-modal-confirm]", modal).on("click", () => {
      if (typeof callback === "function") {
        callback("confirmed", modal);
      }

      $.dismiss(context.id, modal, () => {
        callback("closed", modal);
      })
    });
  },
};

const modalsInit = () => {
  $("[data-modal]").on("click", (e) => {
    const el = $(e.target)
    $.modals.custom(el.data("modal"), {}, () => {
      $(e.target)
    });
  })
}

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
 * @param {string|HTMLElement} element A element id or an element it self
 * @param context
 * @param {!function} callback
 */
const dismiss = (element, context, callback) => {
  const close = (el, delay) => {
    el.swapClass("opacity-100", "opacity-0")

    setTimeout(() => {
      el.remove();

      if (typeof callback === "function") {
        callback()
      }
    }, delay || 600)
  }

  if (!element) {
    $(`button[data-dismiss]`, context || $("body"))
      .on("click", (e) => {
        e.preventDefault();
        const elId = $(e.currentTarget).data("dismiss")
        const delay = parseInt($(e.currentTarget).data("delay") || "600", 10)
        close($(`#${elId}`), delay)
      })
  } else {

    if (typeof element === "string") {

      close($(element.charAt(0) !== "#" ? `#${element}` : element))
    } else {
      close($(element))
    }
  }
}

const toggleable = (element, context, callback) => {
  const toggle = (target) => {
    if (target.data("open")) {
      target.get(0).style.height = 0
      target.data("open", false)
      target.removeClass("open")
    } else {
      target.get(0).style.height = target.data("height")
      target.data("open", true)
      target.addClass("open")
    }
  }

  if (!element) {
    $(`[data-toggleable]`, context || $("body"))
      .each((i, el) => {
        const target = $(`#${$(el).data("toggleable")}`)
        const style = getComputedStyle(target.get(0))
        target.get(0).style.height = style.height
        target.data("height", style.height)
        target.data("open", true)
        target.addClass("open transition-[height] ease-in-out duration-300")
      })
      .on("click", (e) => {
        e.preventDefault();
        toggle($(`#${$(e.currentTarget).data("toggleable")}`))
      })
  } else {
    if (typeof element === "string") {
      toggle($(element.charAt(0) !== "#" ? `#${element}` : element))
    } else {
      toggle($(element))
    }
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

function _swap(target, swapDuration) {
  const source = $(this)

  if (target) {
    if (target.hasClass("hidden")) {
      source.addClass("hidden")
      target.removeClass("hidden")

      if (swapDuration) {
        setTimeout(() => {
          source.removeClass("hidden")
          target.addClass("hidden")
        }, swapDuration)
      }
    } else {
      source.removeClass("hidden")
      target.addClass("hidden")

      if (swapDuration) {
        setTimeout(() => {
          source.addClass("hidden")
          target.removeClass("hidden")
        }, swapDuration)
      }
    }
  }
}

function swap(source, target, swapDuration) {
  _swap.call(source, target, swapDuration)
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

    on = elem.hasClass(className)

    if (typeof callback === "function") {
      callback(on)
    }
  })

  return this;
}

function toast(type, message, timeout = 5000, position = "bottom-right") {
  const tpl = template("_toast");
  let container = $(`div[data-toasts="${position}"]`)

  if (!container.length) {
    const newContainer = $(`<div class="fixed z-50" data-toasts="${position}"></div>`)

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

  console.log("MESSAHE", message)

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

function click(callback) {
  this.on("click", e => {
    e.preventDefault()
    if (typeof callback === "function") {
      callback(e)
    }
  })
}

function dashCase(str) {
  return str.toLowerCase().replace(/\s+/g, '-');

}

function capitalize(str) {
  if (!(typeof str === "string")) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function titleize(str) {
  if (!(typeof str === "string")) return '';
  const title = str.replace(/[- _]+/g, ' ');
  const words = title.split(' ');
  let len = words.length;
  const res = [];
  let i = 0;
  while (len--) {
    const word = words[i++];
    res.push(capitalize(word));
  }
  return res.join(' ');
}

function camelCase(str) {
  if (!(typeof str === "string")) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+(.)/g, function(match, group1) {
      return group1.toUpperCase();
    });
}

function navigate(userUrl, params = {}) {
  const url = new URL(userUrl, window.location);

  if (params) {
    Object.keys(params).forEach((key) => {
      url.searchParams.set(key, params[key])
    })
  }

  window.location.assign(url.toString());
}
function uniqueId(length = 5) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}

const overwriteMerge =  (target, source, options) => {
  const destination = target.slice()

  const keys = destination.reduce((ac, i) => ({
    ...ac,
    [i.id]: true
  }), {})

  return source.reduce((arr, item, i) => {
    if (!keys[item.id]) {
      if (options.isMergeableObject(item)) {
        arr.push(deepmerge(destination[i], item))
      } else {
        arr.push(options.cloneUnlessOtherwiseSpecified(item, options))
      }
    }
    return arr
  }, destination)
}

function merge(...objects) {
  if (typeof deepmerge !== "function") {
    throw new Error("Deepmerge utility is missing.")
  }

  return objects.reduce((rs, obj) => {
    return deepmerge(rs, obj)
  }, {})
}

function mergeById(...objects) {
  if (typeof deepmerge !== "function") {
    throw new Error("Deepmerge utility is missing.")
  }

  return objects.reduce((rs, obj) => {
    return deepmerge(rs, obj, { arrayMerge: overwriteMerge })
  }, {})
}

function sort(by, direction, list) {
  let sorted = []

  if (direction === 'asc') {
    sorted = list.sort((a, b) => (a[by] > b[by]) ? 1 : ((b[by] > a[by]) ? -1 : 0));
  } else if (direction === 'desc') {
    sorted = list.sort((a, b) => (a[by] < b[by]) ? 1 : ((b[by] < a[by]) ? -1 : 0));
  }

  return sorted;
}

function shorten(str, desiredLength) {
  if (str.length <= desiredLength) {
    return str; // No need to shorten the string
  }

  const charsToRemove = str.length - desiredLength + 3; // Adding 3 for the ellipsis "..."
  const startChars = Math.ceil(charsToRemove / 2);
  const endChars = charsToRemove - startChars;

  return str.slice(0, -endChars) + "..." + str.slice(startChars);
}

function bytesToSize(bytes, options) {
  if (typeof bytes === "string") {
    bytes = parseInt(bytes, 10)
  }
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

(function () {

  console.log("EDDING EXTENSIONS")

  $.extend({
    uniqueId,
    mergeById,
    url: function (userUrl, params) {
      const newUrl =  new URL(userUrl, window.location)

      if (params) {
        Object.keys(params).forEach((key) => {
          newUrl.searchParams.set(key, params[key])
        })
      }

      return newUrl
    },
    query: function (key) {
      const q = new URL(window.location.href).searchParams;
      if (key) return q.get(key);
      return Object.fromEntries(q);
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
    toggleable,
    swap,
    differ,
    modals,
    toast,
    toggle: toggleEl,
    toQueryString,
    template,
    utils: {
      dashCase,
      camelCase,
      capitalize,
      titleize,
      createUrl,
      isObject,
      sort,
      merge,
      mergeById,
      shorten,
      bytesToSize
    }
  });

  $.fn.extend({
    hide,
    show,
    click,
    swap: _swap,
    button,
    initState,
    formToObject,
    swapClass,
    scrollTop,
    toggleBeetweenClasses,
    render,
    renderPartial,
    mutate: mutationObserver,
    disable,
    toggleElClass,
  });

  toggleable()
})();
