import { BaseList } from "./list.js"

export class ProductGridView extends BaseList {

  constructor(id, context) {
    super(id, { ...context, rowTemplate: "_product-grid-tile"});
  }
}