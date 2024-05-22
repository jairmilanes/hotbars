
$.fn.gallery = function(userOptions = {}) {
  const opts = { ...(this.data() || {}), ...(userOptions || {}) }
  const options = Object.keys(opts).reduce((ac, key) => {
      if (opts[key] === "") return ac;

      if (opts[key] === "true") {
        ac[key] = true;
      } else if (opts[key] === "false") {
        ac[key] = false;
      } else {
        ac[key] = opts[key];
      }
      return ac;
    }, {});

  if (window.Splide) {
    const id = this.data("gallery")

    const splide = new Splide( this.find(`div[data-slider="${id}"]`).get(0), {
      type      : 'fade',
      rewind    : true,
      pagination: false,
      arrows    : false,
      height: "300px",
      ...options
    });

    splide.mount();

    if (options.thumbnails) {
      const thumbs = new Splide( this.find(`div[data-thumbs="${id}"]`).get(0), {
        fixedWidth  : 100,
        fixedHeight : 60,
        gap         : 10,
        rewind      : true,
        pagination  : false,
        isNavigation: true,
        breakpoints : {
          600: {
            fixedWidth : 60,
            fixedHeight: 44,
          },
        },
      })

      thumbs.mount();
      splide.sync(thumbs)
    }

    this.slide = splide;
  }
  return this;
}

$(() => {
  $(`div[data-gallery][data-auto-init="true"]`).each((i, el) => {
    $(el).gallery()
  })
})