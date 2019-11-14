'use strict';

class StateManager {
    constructor(setting) {
        this.state = Object.assign({}, setting);
    }
    setRowsPerPage(n) {
        this.state.rowsPerPage = n;
    }
    setPageNumber(n) {
        this.state.pageNumber = n;
    }
    updateFilters(obj) {
        this.state.filter = obj;
    }
    updateSorting(obj) {
        this.state.sort = obj;
    }
    toOptions() {
        return {
            start: this.state.pageNumber - 1,
            limit: this.state.rowsPerPage,
            filter: this.state.filter,
            sort: this.state.sort
        };
    }
}