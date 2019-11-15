'use strict';

class StateManager {
  constructor() {
    this.rowsPerPage = 10;
    this.currentPageNumber = 1;
    this.sort = {};
    this.filter = {};
  }

  setRowsPerPage(n) {
    this.rowsPerPage = n;
  }

  setPageNumber(n) {
    this.currentPageNumber = n;
  }

  updateSort(obj) {
    this.sort = obj;
  }

  updateFilter(obj) {
    this.filter = obj;
  }

  queryObject() {
    return {
      start: (this.currentPageNumber - 1) * this.rowsPerPage,
      limit: this.rowsPerPage,
      filter: this.filter,
      sort: this.sort,
    };
  }
}