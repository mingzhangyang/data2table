export default class StateManager {
  constructor() {
    this.rowsPerPage = 10;
    this.currentPageNumber = 1;
    this.sort = {};
    this.filter = {}; // only name and value of the selected ones
    this.filterStatus = {}; // contains all info (name, value, type, selected) of all faceting
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

  getStart() {
    return (this.currentPageNumber - 1) * this.rowsPerPage;
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