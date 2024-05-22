
function init(context) {
  $("[data-dispatch]", context?.length ? context : null)
    .on("click", e => {
      const el = $(e.currentTarget)
      dispatch(el.attr("data-dispatch"), { _el: el, ...(el.data() || {}) })
    })
}

function dispatch(name, data) {
  console.info("Dispatch: ", name, data)
  if (typeof name === "object" && name !== null && !data) {
    if (!name.length) return;
    return init(name)
  }

  $(document).trigger(name, data === "undefined" || data === null ? {} : data);
}

function _subscribe(name, group, callback) {
  if (!callback && typeof group === "function") {
    callback = group;
    group = undefined
  }

  const setUp = (name) => {
    $(document).on(name, (e) => {
      console.info(`Event: ${name}`, e)
      const subs = $.__subscriptions.get(name)

      for (callback of subs) {
        if (typeof callback === "function") {
          callback(e.___td);
        }
      }
    })
  }

  callback.__group = group

  console.info("Subscribe: ", name)
  if(!$.__subscriptions.has(name)) {
    $.__subscriptions.set(name, new Set())
    setUp(name)
  }

  $.__subscriptions.get(name).add(callback)
}

function subscribe(name, callback) {
  if (name.indexOf(" ") > -1) {
    const events = name.split(" ")

    events.forEach(
      eventName => _subscribe(eventName, callback)
    )
  } else {
    _subscribe(name, callback)
  }
}

function _unsubscribe(name, callback) {
  console.info("Unsubscribe: ", name)
  if ($.__subscriptions.has(name)) {
    if (!callback) {
      $.__subscriptions.delete(name)
    } else {
      $.__subscriptions.get(name).delete(callback)
    }

    if (!$.__subscriptions.get(name) || $.__subscriptions.get(name).size === 0) {
      $(document).off(name)
    }
  }
}

function unsubscribe(name, callback) {
  if (name.indexOf(" ") > -1) {
    const events = name.split(" ")

    events.forEach(
      eventName => _unsubscribe(eventName, callback)
    )
  } else {
    _unsubscribe(name, callback)
  }
}

function unsubscribeGroup(group) {
  const events = Array.from($.__subscriptions.keys())

  for (let i = 0; i < events.length; i++) {
    const callback = $.__subscriptions.get(events[i])

    if (callback.__group === group) {
      _unsubscribe(events[i], callback)
    }
  }
}

(() => {
  $.__subscriptions = new Map();

  $.extend({
    dispatch,
    subscribe,
    unsubscribe,
    unsubscribeGroup
  })

  // init()


})()
