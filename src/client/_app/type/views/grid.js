import { BaseList } from "./list.js"

export class GridView extends BaseList {

  constructor(id, context) {
    super(id, { ...context, rowTemplate: "_grid-list-tile"});
  }
}