function carousel() {
  const items = this.children();
  const controls = $('.hb-carousel-controls ul');

  this.css("height", items.eq(0).css("height"))

  if (items.length <= 1) return;

  for (let i = 0; i < items.length; i++) {
    controls.append(`
      <li class="mx-2">
        <a href="#" class="${i > 0 ? "opacity-50" : ""}" hb-carousel-target="${i}" hb-active="${i > 0 ? false : true}">
          <span class="inline-block h-[12px] w-[12px] rounded rounded-full bg-slate-700"></span>
        </a>
      </li>
    `)
  }

  const tallest = Array.from(items).reduce((found, el, i) => {
    if (!found || parseInt($(el).css("height")) > parseInt(found.css("height"))) {
      return $(el)
    }
    return found;
  }, null)

  this.css("height", tallest.css("height"))

  const testimonials = $("a", controls);

  testimonials.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const el = $(e.currentTarget);
    const targetIndex = el.attr("hb-carousel-target")
    const testimonial = items.eq(targetIndex)
    const activeTarget = $(`a[hb-active="true"]`, controls);
    const activeTestimonial = items.eq(activeTarget.attr("hb-carousel-target"))

    // Transition active item out of view
    activeTarget.attr("hb-active", false);
    activeTarget.swapClass("opacity-100", "opacity-50")

    // Slide active testimonial to the right
    activeTestimonial.swapClass("left-[50%]", "left-[58%]")
    activeTestimonial.swapClass("opacity-100", "opacity-0")

    // Move new into view
    el.swapClass("opacity-50", "opacity-100")
    el.attr("hb-active", true)

    testimonial.swapClass("left-[58%]", "left-[42%]")

    // Delay here after reseting the position here in case
    // the item is still animating from the last click
    setTimeout(() => {
      testimonial.swapClass("left-[42%]", "left-[50%]")
      testimonial.swapClass("opacity-0", "opacity-100")

      // After it is over, reset the position
      setTimeout(() => {
        activeTestimonial.swapClass("left-[58%]", "left-[42%]")
      }, 800)
    }, 100)
  });
}

(function () {
  if ($ === undefined) return;

  $.fn.extend({
    carousel: carousel,
  });
})()