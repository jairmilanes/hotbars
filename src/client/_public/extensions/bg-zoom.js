

function bgZoom(duration, direction = "down", bg) {
  bg.removeClass('scale-100 scale-125')

  if (direction === "up") {
    bg.addClass('scale-125')
  } else {
    bg.addClass('scale-100')
  }

  setTimeout(() => {
    bgZoom(duration, direction === "up" ? "down" : "up", bg)
  }, duration);
}

function timer(duration = 20000) {
  if (!this) return;

  this.each((i, el) => {
    const bg =  $(`div[hb-bg="true"]`, el);

    if (!bg) return;

    bg.addClass("scale-100")

    setTimeout(() => {
      bg.addClass(`transition-all duration-[${duration}ms] ease-linear `)

      setTimeout(() => {
        bgZoom(duration, "up", bg)
      }, 100)
    }, 100)
  })
}

(() => {
  $.fn.extend({
    bgZoom: timer
  })
})()