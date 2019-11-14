'use strict';

import fetchData from './fetchData.js';

class DataManager {
  /**
   * constructor of DataManger class
   * @param arr, required, array of objects
   * @param opts, optional, a collection of custom functions for fetching data
   */
  constructor(arr, opts) {
    if (!Array.isArray(arr)) {
      throw new TypeError('an array of objects expected');
    }
    if (Object.prototype.toString.call(arr[0]) !== '[object Object]') {
      throw new TypeError('an array of objects expected');
    }
    this.data = arr;
    Object.assign(this, opts);

    if (!this["dataIsComplete"]) {
      if (!this.fetchData) {
        throw 'Data is not complete. A fetchData function is required.';
      }
      if (typeof this.fetchData !== 'function') {
        throw new TypeError('fetchData should be a function');
      }
    }

    this.fetchData = fetchData;
  }

  serve(queryObj) {
      return this.fetchData(queryObj);
  }
}

export default DataManager;
