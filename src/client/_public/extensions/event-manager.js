
function dispatch(name, data) {
  $(document).trigger(name, data);
}

function _subscribe(name, callback) {
  if(!$.__subscriptions.has(name)) {
    $.__subscriptions.set(name, new Set())

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
  if ($.__subscriptions.has(name)) {
    $.__subscriptions.get(name).delete(callback)

    if ($.__subscriptions.get(name).size === 0) {
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

(() => {
  $.__subscriptions = new Map();

  $.extend({
    dispatch,
    subscribe,
    unsubscribe
  })
})()
