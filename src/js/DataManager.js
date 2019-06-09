'use strict';

class DataManager {
    /**
     * constructor of DataManger class
     * @param arr, required, array of objects
     * @param fetch, optional, a function to fetch new data, which is supposed to return a promise
     */
    constructor(arr, fetch) {
        this.stock = arr;
        this.complete = true;
        if (typeof fetch === "function") {
            this.complete = false;
            this.fetch = fetch;
        }
    }

    serve(opts) {
        if (!this.complete) {
            return this.fetch(opts);
        }

        let start = opts.start ? opts.start : 0;
        let limit = opts.limit ? opts.limit : 1000;
        let filter = opts.filter ? opts.filter : undefined;
        let sort = opts.sort ? opts.sort : undefined;

        let tmp = this.stock;
        if (filter) {
            let props = Object.keys(filter);
            for (let prop of props) {
                if (Array.isArray(filter[prop])) {
                    tmp = tmp.filter(obj => {
                        if (typeof obj[prop] === 'object') {
                            return filter[prop].includes(obj[prop].valueForFiltering)
                        }
                        return filter[prop].includes(obj[prop]);
                    });
                } else {
                    tmp = tmp.filter(obj => {
                        if (typeof obj[prop] === 'object') {
                            return filter[prop] === obj[prop].valueForFiltering;
                        }
                        return filter[prop] === obj[prop];
                    })
                }
            }
        }

        if (sort) {
            let prop = Object.keys(sort)[0];
            let order = sort[prop];
            if (order === 1) {
                tmp.sort((a, b) => {
                    if (typeof a[prop] === 'object' && typeof b[prop] === 'object') {
                        return a[prop].valueForSorting < b[prop].valueForSorting ? -1 : 1;
                    } else {
                        return a[prop] < b[prop] ? -1 : 1;
                    }
                });
            } else if (order === -1) {
                tmp.sort((a, b) => {
                    if (typeof a[prop] === 'object' && typeof b[prop] === 'object') {
                        return a[prop].valueForSorting < b[prop].valueForSorting ? 1 : -1;
                    } else {
                        return a[prop] < b[prop] ? 1 : -1;
                    }
                });
            }
        }

        return {
            data: tmp.slice(start, (start+limit)),
            totalCount: tmp.length
        };
    }
}


if (typeof module === "object" && !module.parent) {
    let a = [
        {x: 3, y : 24, z: 12, foo: {valueForSorting: 2}, bar: {valueForFiltering: "A"}},
        {x: 5, y : 24, z: 12, foo: {valueForSorting: 3}, bar: {valueForFiltering: "E"}},
        {x: 1, y : 24, z: 12, foo: {valueForSorting: 6}, bar: {valueForFiltering: "G"}},
        {x: 8, y : 24, z: 12, foo: {valueForSorting: 1}, bar: {valueForFiltering: "R"}},
        {x: 2, y : 24, z: 12, foo: {valueForSorting: 5}, bar: {valueForFiltering: "F"}},
        {x: 6, y : 24, z: 12, foo: {valueForSorting: 1}, bar: {valueForFiltering: "D"}},
        {x: 1, y : 24, z: 12, foo: {valueForSorting: 0}, bar: {valueForFiltering: "N"}},
        {x: 0, y : 24, z: 12, foo: {valueForSorting: 4}, bar: {valueForFiltering: "I"}},
        {x: 7, y : 24, z: 12, foo: {valueForSorting: 7}, bar: {valueForFiltering: "H"}},
        {x: 9, y : 24, z: 12, foo: {valueForSorting: 3}, bar: {valueForFiltering: "C"}}
    ];
    let dm = new DataManager(a);
    let opts = {};
    console.log(opts, dm.serve(opts));
    opts = {start: 4};
    console.log(opts, dm.serve(opts));
    opts = {filter: {bar: ["N", "I", "H"], x: 7}};
    console.log(opts, dm.serve(opts));
    opts = {sort: {foo: -1}};
    console.log(opts, dm.serve(opts));
} else {

}

export default DataManager;
