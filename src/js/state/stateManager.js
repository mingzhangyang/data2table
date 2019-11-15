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
    updateFilters(obj) {
        this.filter = obj;
    }
    updateSorting(obj) {
        this.sort = obj;
    }
    queryObject() {
        return {
            start: (this.currentPageNumber - 1) * this.rowsPerPage,
            limit: this.rowsPerPage,
            filter: this.filter,
            sort: this.sort
        };
    }
}