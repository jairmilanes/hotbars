
$.fn.richEditor = function() {
  this.editor = new Quill(this.get(0), {
    theme: 'snow',
    modules: {
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true
      },
    },
  });

  return this;
}
