'use strict';

class StateManager {
  constructor() {
    this.rowsPerPage = 10;
    this.currentPageNumber = 1;
    this.sort = {};
    this.filter = {}; // only the selected ones
    this.filterStatus = {}; // contains all
  }

  extractFilter() {
    let tmp = {};
    let colNames = Object.keys(this.filterStatus);
    for (let colName of colNames) {
      let arr = this.filterStatus[colName].filter(d => d.selected);
      if (arr.length > 0) {
        tmp[colName] = arr.map(d => d.facetValue);
      }
    }
    return tmp;
  }

  queryObject() {
    return {
      start: (this.currentPageNumber - 1) * this.rowsPerPage,
      limit: this.rowsPerPage,
      filter: this.extractFilter(),
      sort: this.sort,
    };
  }


}