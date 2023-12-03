

function DataPage() {

  this.collectionsList = $("#hbs-data-collections").list("_data_collection");
  this.collections = [];
  this.itemsList = $("#hbs-data-items").list("_data_list_item");
  this.items = [];
  this.itemTpl = $("#hbs-data-item");
  this.item = null;
  this.activeCollection = null;

  this.fetch = async (collection, page) => {
    return fetch(`/_api/${collection}/?page=${page}`)
      .then((response) => response.json())
      .then((collection) => {
        this.items = collection.items;
      });
  };

  this.fetchCollections = async () => {
    return fetch(`/_api/collections`)
      .then((response) => response.json())
      .then((collections) => {
        this.collections = collections;
      });
  };

  this.fetchItem = async (collection, id) => {
    return fetch(`/_api/${collection}/${id}`)
      .then((response) => response.json())
      .then((collections) => {
        this.item = collections;
      });
  };

  this.load = async () => {
    return this.fetchCollections().then(this.render.bind(this));
  };

  this.loading = (on) => {
    const loader = $("#hbs-data-loading");
    return on ? loader.show() : loader.hide();
  };

  this.render = () => {
    this.loading(false);

    this.collectionsList.reset();

    this.collections.forEach((collection) =>
      this.collectionsList.appendItem({
        name: collection
      })
    );
  };

  this.collectionsList.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const collection =  $(e.target)
      .closest("a")
      .data("id");

    $(e.target).addClass("active")

    this.fetch(collection, 1).then(() => {
      this.itemsList.reset()
      this.activeCollection = collection;
      this.items.forEach((item) => {
        this.itemsList.appendItem({
          collection: this.activeCollection,
          item
        });
      });
    });
  });

  this.itemsList.on("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const itemId =  $(e.target).closest("a").data("id");
    const item = this.items.find(item => item.id === itemId);
    this.itemTpl.render("_data_item", item);

    Prism.highlightAll()
  });

  this.load($.query().get("page") || 1).then(() => this.collectionsList.click(0));

  $.stateChange((params) => {
    this.load(params.get("page") || 1);
  });
}

$(() => new DataPage());