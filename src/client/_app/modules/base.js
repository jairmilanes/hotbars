export class BaseModule {
  container;
  template;
  collection;

  constructor(el, template) {
    this.container = el
    this.template = template
  }

  update(context) {
    this.container.render(this.template, context)
    $.swap(this.container)
    $.dispatch(this.container)
  }
}