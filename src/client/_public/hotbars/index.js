$(() => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  }

  const updateView = (app, env) => {
    $(`#hb-env-${env}`)
      .renderRemote(
        "pages/index/env",
        $.toQueryString({
          title: env,
          env: app
        }),
        "replace"
      )
  }

  $.subscribe("hb-create-environment", (data) => {
    options.body = JSON.stringify({ name: data.env })
    const btn = data._el.button()

    btn.loading(true, "Creating environment")

    fetch(`/_d/env`, options)
      .then((response) => response.json())
      .then((app) => {
        updateView(app, data.env)

        btn.loading(false)
      })
  })


  $.subscribe("hb-sync-environment", (data) => {
    options.body = JSON.stringify({ name: data.env })
    const btn = data._el.button()

    btn.loading(true, "Syncing environment")

    fetch(`/_d/env/${data.env}/sync`, options)
      .then((response) => response.json())
      .then((app) => {
        updateView(app, data.env)
        btn.loading(false)
      })
  })

  $.subscribe("hb-push-environment", (data) => {
    const btn = data._el.button()

    btn.loading(true, "Pushing").disable(true)

    fetch(`/git/push`, options)
      .then((response) => response.json())
      .then((app) => {
        // updateView(app, data.env)
        btn.loading(false).disable(true)
      })
  })

  /* setInterval(function() {
    const op = { ...options, method: "GET" }

    fetch(`/_d/env`, op)
      .then((response) => response.json())
      .then((apps) => {
        Object.keys(apps).forEach(name =>
          updateView(apps[name], name)
        )
      })
  }, 5000) */
})