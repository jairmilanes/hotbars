import { BaseList } from "./list.js"

export class PostView extends BaseList {

  constructor(id, context) {
    super(id, { ...context, rowTemplate: "_post-view-row"});
  }
}