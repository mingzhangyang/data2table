import fetchData from './fetchData.js';
import getValueFacets from './faceting.js';
import {assertQueryObject} from '../utils/cmp.js';

const maxRowsPerPage = 200;
const series = [
  5 * maxRowsPerPage,
  4 * maxRowsPerPage,
  3 * maxRowsPerPage,
  2 * maxRowsPerPage,
  maxRowsPerPage,
];

export default class DataManager {
  /**
   * constructor of DataManger class
   * @param arr, <array>, required, array of objects
   * @param opts, <object>, optional, required when the data is not complete.
   *        - fetchData, <function>, which receive a query object as parameter and return the data requested
   *        - totalCount, <number>, indicated the total rows of the whole dataset
   */
  constructor(arr, opts) {
    if (!Array.isArray(arr)) {
      throw new TypeError('an array of objects expected');
    }
    if (Object.prototype.toString.call(arr[0]) !== '[object Object]') {
      throw new TypeError('an array of objects expected');
    }
    this.dataIsComplete = opts.dataIsComplete;
    if (this.dataIsComplete) {
      this.data = arr;
      this.batchSize = arr.length;
      this.cache = {
        data: this.data.slice(),
        queryObject: {
          filter: {},
          sort: {},
        },
        range: [0, this.batchSize],
        totalCount: arr.length,
      };
      this.fetchData = fetchData.bind(this);

    } else {
      if (arr.length < maxRowsPerPage) {
        throw `dataIsComplete is set false, but the provided dataset contains less than ${maxRowsPerPage} rows`;
      }
      for (let n of series) {
        if (arr.length >= n) {
          this.data = arr.slice(0, n);
          this.batchSize = n;
          this.cache = {
            data: this.data.slice(),
            queryObject: {
              filter: {}, // default {}
              sort: {}, // default {}
            },
            range: [0, this.batchSize],
          };
          break;
        }
      }
      if (!opts.fetchData) {
        throw 'data is not complete, a fetchData function is required';
      }
      if (typeof opts.fetchData !== 'function') {
        throw new TypeError('fetchData should be a function');
      }
      if (!opts.totalCount) {
        throw 'data is not complete, a totalCount property indicating total rows is missing';
      }
      this.fetchData = opts.fetchData;
      this.cache.totalCount = opts.totalCount;
    }
  }

  /**
   * This is the API to return data as requested
   * @param queryObject, <object>, possible properties:
   *        - start, <number>, specify the index of the first row of the requested rows
   *        - limit, <number>, specify the number of rows requested
   *        - filter, <object>, e.g. {columnNameA: x, columnNameB: [y, z]}
   *        - sort, <object>, e.g. {columnName: -1}
   *        - facets, <array>, an array of column names
   * @returns {Promise<{data: T[], totalCount: *}|[]>}
   */
  async serve(queryObject) {
    // serve faceting data
    // currently only get the faceting of the whole dataset, ignore the faceting of filtered subsets
    if (Array.isArray(queryObject.facets)) {
      return getValueFacets(this.data, queryObject.facets);
    }

    // this is an internal method, all the arguments are supposed to be valid
    let start = queryObject.start ? queryObject.start : 0; // the index of the first row of requested data
    let limit = queryObject.limit ? queryObject.limit : 10; // the number of rows requested
    let filter = queryObject.filter ? queryObject.filter : {}; // default {}
    let sort = queryObject.sort ? queryObject.sort : {}; // default {}

    // serve data query from cache
    // we assume here start + limit will not exceed the current batch, given that start is in the current batch
    // except for the last batch, but it doesn't matter
    if (assertQueryObject(queryObject, this.cache.queryObject)
      && (start >= this.cache.range[0] && start < this.cache.range[1])) {
      // Below is critical. Get the index of data in the current batch
      let idx = start - this.cache.range[0];
      return {
        data: this.cache.data.slice(idx, idx + limit),
        totalCount: this.cache.totalCount,
      };
    }

    // if the requested data is out of cache, request new data
    let newStart = start - start % this.batchSize;
    let qo = {
      start: newStart,
      limit: this.batchSize,
      filter: filter,
      sort: sort,
    };
    let data = null;
    try {
      data = await this.fetchData(qo);
    } catch (err) {
      throw err;
    }
    this.cache.data = data.data;
    this.cache.queryObject = qo;
    this.cache.range = [newStart, newStart + this.batchSize];
    this.cache.totalCount = data.totalCount;
    // Below is critical to get the idx, the index of requested data in the current batch.
    let idx = start - newStart;
    return {
      data: this.cache.data.slice(idx, idx + limit),
      totalCount: data.totalCount,
    };
  }
}