import { TypesList } from "./modules/type-list.js"
import { TypeView } from "./modules/type-view.js"


$(async function() {
  await $.preloader.preload([
    "_data-type-form",
    "_add-field-form",
    "_data-type-form-view",
    "_data_field",
    "_no-data-field-found",
    "_validation-item",
    "_no-validations-found",
    "_add-field-modal",
    "_data_type",
    "_add-header-modal",
    "_create-group-modal",
    "_sidemenu-item",
    "_modules/_view-config",
  ])

  this.typesList = new TypesList()
  this.typeView = new TypeView()

  await this.typesList.load({ page: 1 });

  $.stateChange((params) => {
    this.TypesList.load(params);
  });
});