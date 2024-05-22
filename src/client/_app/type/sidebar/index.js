import { CategoryModule } from "../../modules/category.js"
import { PublishModule } from "../../modules/publish.js"

export class Sidebar {
  container = $("#hb-type-modules")
  mirror = $("#hb-modules-placeholder")
  scroller = $("div[data-form-container]")
  modules = {}
  lastClass = ""

  constructor(type, collection, entryId) {
    this.fixDimentions()

    this.modules = {
      category: new CategoryModule(type, collection, entryId),
      publish: new PublishModule(type, collection, entryId)
    }

    window.addEventListener("resize", this.fixDimentions.bind(this))

    this.container.addClass(this.lastClass = "top-10")

    this.scroller.on("scroll", (e) => {
      const offSet = this.scroller.prop("scrollTop")

      this.container.removeClass(this.lastClass)
      this.container.addClass(this.lastClass = `-top-[${offSet}px]`)
    })

    const resizeObserver = new ResizeObserver(this.fixDimentions.bind(this))
    resizeObserver.observe(this.container.get(0))
  }

  /**
   * Fix dimentions of the modules placeholder and type sidebar
   */
  fixDimentions() {
    const mirrorStats = this.mirror.get(0).getBoundingClientRect()
    const containerStats = this.container.get(0).getBoundingClientRect()
    this.mirror.get(0).style.height = containerStats.height
    this.container.get(0).style.width = mirrorStats.width
  }

  reload(name) {
    if (this.modules[name]) {
      this.modules[name].reload()
    }
  }
}