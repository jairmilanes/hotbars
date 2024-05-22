

export class Pageable {

  collection;

  context = {
    rows: [],
    paging: {
      total: 0,
      pages: 0,
      page: null,
      next: null,
      prev: null
    }
  }

  constructor() {
  }
}