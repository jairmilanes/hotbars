class Preloader {

  cache(key, template) {
    if (key && !template) {
      return localStorage.getItem(key)
    }

    localStorage.setItem(key, template)
  }

  async load(partial, context) {
    const cache = Handlebars.partials[partial]

    if (cache) return Handlebars.template(cache)(context);

    const response = await $.rest.post(
      `/_precompile`, [partial]
    )

    if (response && response[partial]) {
      Handlebars.registerPartial(partial, response[partial])
    }

    return Handlebars.template(response[partial])(context)
  }

  async preload(partials) {
    const response = await $.rest.post(
      `/_precompile`, partials
    )

    Object.keys(response).forEach((key) => {
      const pre = (new Function('return ' + response[key])());
      Handlebars.registerPartial(key, Handlebars.template(pre))
    })
  }
}

$.preloader = new Preloader()
