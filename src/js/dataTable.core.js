/**
 * Created by yangm11 on 8/9/2018.
 */
'use strict';

/*******************************************************************************
 * To-DO:
 *    1. Panel for download options
 *    2. Add charts (d3 or G2)
 *    3. Layout adjustment
 *    4. More color schemes
 *    5. Probably rewrite in TypeScript
 *******************************************************************************/

class DataTable {
  /******************************************************************************
   * To create an instance of DataTable class
   * @param arr: <Array>, array of data objects
   * @param targetId: <String>, the id of the table of placeholder
   * @param opts: <Object>, potential properties include:
   *    # caption: <String>, the caption of the table
   *    # dataIsComplete: <Bool>, required. It indicates whether new data are needed,
   *      if true then fetchData function (below) is required.
   *    # totalRows: <Number>, if data is not complete, user should provide the
   *      totalRows parameter
   *    # downloadFileName: <String>, specify the file name of download.
   *    # dataToDownload: <Array>, the raw data for user to download in case of
   *      dataIsComplete. To be noted, the arr provided to DataTable might not
   *      be the same as this. The data consumed by DataTable might be converted.
   *    # fetchData: <Function>, fetch new data to update the table, an object
   *      that specifies the parameters, i.e. filter <Object>, sort <Object>, etc.
   *      will be provided as the sole argument. And this function should return
   *      a promise.
   *    # urlForDownloading: <String>, a link to download the whole data
   *    # fetchFacetingData: <Function>, fetch faceting data function is required
   *      if the data is not complete
   *    # columnsToDownload: <Array>, defines the columns to be downloaded
   * @returns {number|any}
   *******************************************************************************/
  constructor(arr, targetId, opts) {
    // if (typeof window === 'undefined') {
    //   throw new Error('Data Table only works in browser');
    // }
    if (typeof targetId !== 'string' || !targetId) {
      throw new TypeError('target id should be a non-empty string');
    }
    if (typeof opts !== 'undefined') {
      if (Object.prototype.toString.call(opts) !== '[object Object]') {
        throw new TypeError('if provided, opts should be an object');
      } else {
        this.opts = opts;
      }
    } else {
      this.opts = {
        caption: '',
        dataIsComplete: true
      }
    }

    if (!this.opts.downloadFileName) {
      this.opts.downloadFileName = 'data';
    }

    if (!this.opts.dataIsComplete) {
      if (!this.opts.urlForDownloading) {
        throw "Data is not complete. An url for downloading the data is required.";
      }
      if (!this.opts.fetchData) {
        throw "Data is not complete. A fetchData function is required.";
      }
      if (!this.opts.fetchFacetingData) {
        throw "Data is not complete. A fetchFacetingData function is required.";
      }

      if (typeof this.opts.fetchData !== "function") {
        throw new TypeError("fetchData should be a function")
      }
      this.fetchData = this.opts.fetchData;

      if (typeof this.opts.fetchFacetingData !== "function") {
        throw new TypeError("fetchFacetingData should be a function")
      }
      this.fetchFacetingData = this.opts.fetchFacetingData;
    }

    // below are properties required to create and update table
    this._originalData = arr;

    if (!Array.isArray(this._originalData)) {
      throw new TypeError('an array of objects expected');
    }
    if (Object.prototype.toString.call(this._originalData[0]) !== '[object Object]') {
      throw new TypeError('an array of objects expected');
    }

    this._data = this._originalData.slice();
    this._targetId = targetId;
    this._rowsPerPage = 10;

    // for a huge amount of data, partition is necessary for performance
    this._partition = !this.opts.dataIsComplete;
    // _partIndex starts from 0, not 1. PAY ATTENTION.
    this._partIndex = 0;
    this._binSize = 1000;

    // if _partition is true, the user should also set the _totalRows and _totalPages
    // _totalRows will initialized at beginning, and can be updated by _setTotalPages
    this._totalRows = this._partition ? opts.totalRows : this._data.length;
    // _totalPages can be updated by _setTotalPages or setRowsPerPage
    this._totalPages = Math.ceil(this._totalRows / this._rowsPerPage);

    // _pageNumberInAll is the page number in all, starts from 1
    this._pageNumberInAll = 1;
    // _offset is the current page offset in the current bin/part, starts from 1
    this._offset = 1;

    this._changePageByUser = true;
    this._firstColumnAsRowNumber = true;
    this.maxNumOfFacets = this.opts.maxNumOfFacets ? this.opts.maxNumOfFacets : 50;

    // Create column model object
    this._colModel = {};
    this.shownColumns = [];
    let s = new Set();
    for (let d of this._data) {
      let keys = Object.keys(d);
      for (let key of keys) {
        s.add(key);
      }
    }
    for (let name of s) {
      this._colModel[name] = {
        name: name,
        label: name,
        tips: '',
        sortable: false,
        hidden: false, // redundant, use shownColumns to manage shown/hidden
        width: '',
        align: '',
        formatter: undefined // must a function
      };
      this.shownColumns.push(name);
    }

    // below are sort setting and filter setting
    this._filters = {};
    this.sortSetting = null; // format: {colName: order}, where order = 1 or -1
    this.filterSetting = null; // format: [{colName1: [v1, v2, ...]}, {colName2: [v3, ...]}, ...]

    // properties required to configure the whole
    this._charts = [];
    this._colorSchemes = {
      default: 'default-color-scheme'
    };
    this.configuration = {
      caption: typeof this.opts.caption === 'string' ? this.opts.caption : '',
      searchBar: true,
      filterButton: false,
      vizButton: false,
      downloadButton: true,
      colorScheme: 'default',
    };

    // below are miscellaneous properties
    this.messageQueue = [];
    this._uid = 'my-1535567872393-product';
  }

  /**
   * _setTotalPages is an internal method to calculate the number of total pages
   * it will update the _totalPages and _totalRows if provided
   * @param n: total records/rows (PAY ATTENTION!!!)
   * if _partition is true or filtering is on, the parameter n should be provided
   * This function should be invoked when filtering the _data, in which case the
   * _totalRows is likely to change
   * @private
   */
  _setTotalPages(n) {
    if (typeof n !== "undefined") {
      if (typeof n !== "number") {
        throw new TypeError("a number argument expected");
      }
      this._totalRows = n;
      this._totalPages = Math.ceil(n / this._rowsPerPage);
      // when _totalRows is 0, _totalPages should be 1 not 0. *** Math.ceil(0) is 0 ***
      if (this._totalPages === 0) {
        this._totalPages = 1;
      }
    } else {
      this._totalPages = Math.ceil(this._totalRows / this._rowsPerPage);
      if (this._totalPages === 0) {
        this._totalPages = 1;
      }
    }
  }

  /**
   * setRowsPerPage is used to set and update _rowsPerPage and _totalPages
   * @param n
   */
  setRowsPerPage(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('a natural number expected');
    }
    this._rowsPerPage = n;
    this._totalPages = Math.ceil(this._totalRows / this._rowsPerPage);
  }

  // reset source data after sorting or filtering
  resetData() {
    if (!this._partition) {
      this._data = this._originalData.slice();
      // console.log(this._data.length);
    } else {
      // fetch data from the server?
    }
  }

  /**
   * internal method to set page number (starts from 1)
   * @param n: <Number>. It is for internal use. The parameter received is supposed
   * to be valid. No type check.
   * @private
   */
  _setPageNumber(n) {
    this._pageNumberInAll = n;
    if (!this._partition) {
      this._offset = n;
    } else {
      this._offset = n % (this._binSize / this._rowsPerPage);
      // Below is critical. It's due to _pageNumberInAll and _offset start from 1.
      // *CRITICAL*
      if (this._offset === 0) {
        this._offset = this._binSize / this._rowsPerPage;
      }
    }
  }

  /**
   * Check whether a page number is in the current partition
   * If not in the current partition, then update the data and table view;
   * If in the current partition, only update the table view
   * @param v: <Number>, the page number
   *****************************************************************************
   * This method should be the only one that invoke _updateTableView function? *
   * It equals to "_setPageNumber(v)" plus "_updateTableView()".               *
   * No. It seems not to be a good idea. sort and filterData should invoke     *
   * _setPageNumber and _updateTableView directly to avoid redundant checks.   *
   * Besides, sort or filterData will change the underlying data, it is        *
   * necessary to fetch new data from the server anyway. But the function      *
   * below will not fetch new data if the _partitionIndex doesn't change.      *
   *****************************************************************************
   */
  _checkPageNumber(v) {
    if (!this._partition) {
      this._setPageNumber(v);
      this._updateTableView();
    } else {
      // compute the _partIndex from page number
      // v * this._rowsPerPage - 1, it is critical to minus one.
      let t = Math.floor((v * this._rowsPerPage - 1) / this._binSize);
      // the above <=> Math.floor((v - 1) / (this._binSize / this._rowsPerPage))
      // console.log(t, this._partIndex);
      if (t !== this._partIndex) {
        this._partIndex = t;
        let opts;
        if (this.sortSetting) {
          opts = {sort: this.sortSetting};
        }
        if (this.filterSetting) {
          if (opts) {
            opts.filter = this.filterSetting;
          } else {
            opts = {filter: this.filterSetting};
          }
        }
        this._notifyStatus({ type: 'progress'});
        let p = this.fetchData(t * this._binSize, opts);
        p.then(data => {
          // data is in the form of {totalCount: number, data: array}
          // the data should be ready to use without any pre-processing
          try {
            this._data = data.data;
            console.log("Loading new data.");
            // console.log(this);
            this._setPageNumber(v);
            this._updateTableView();
            this._notifyStatus({
              type: 'success'
            });
          } catch(err) {
            this._notifyStatus({
              type: 'error',
              message: 'New data loaded but error happens in switching page'
            });
          }
        }).catch(err => {
          this._notifyStatus({
            type: 'error',
            message: 'Failed to load new data (pagination)'
          });
          console.error(err);
        });
      } else {
        this._setPageNumber(v);
        this._updateTableView();
        this._notifyStatus({
          type: 'success'
        });
      }
    }
  }

  /**
   * fetchData should be overwritten by the user to load new data
   * @param n: <Number>, this will be used as "skip" parameter in the query string
   * n is the number of rows/docs to skip
   * @param opts: <Object>, options including filtering fields, sorting fields and so on
   * should be provided as an object
   * This function should return a promise, which resolved as an object with the pattern
   * {totalCount: number, data: array}
   */
  fetchData(n, opts) {
    // should return a promise
  }

  /**
   * fetchFacetingData should be over-written by the user to get faceting info from server
   * @param arr: <Array>, a list of field names for faceting
   */
  fetchFacetingData(arr) {
    // fetch faceting data from server
  }

  // set table caption
  setTableCaption(str) {
    if (typeof str === 'string' && str.length > 0) {
      this._tableCaption = str;
    }
  }


  /**
   * choose the columns to display in the table
   * @param arr: array, a list of column names
   */
  selectColumnsToShow(arr) {
    if (!Array.isArray(arr)) {
      throw 'An array of column names expected.';
    }
    // column names not in the colModel will be eliminated
    this.shownColumns = arr.filter(name => {
      return this._colModel[name];
    });
  }

  /**
   * customize a column to show
   * @param name: string, column name
   * @param obj: object, an object describing the column
   */
  configureColumn(name, obj) {
    if (!this._colModel[name]) {
      throw new Error('Column name not recognized.');
    }
    if (typeof obj !== 'object') {
      throw new Error('An object describing the column expected.');
    }
    Object.assign(this._colModel[name], obj);
  }

  // Redundant mark
  /**
   * Add a column to the table to show
   * @param colName: string, can put as many as possible
   */
  addColumn(...colName) {
    for (let name of colName) {
      if (typeof name !== 'string') {
        continue;
      }
      if (!this._colModel[name]) {
        console.error('Column name not recognized:', name);
        continue;
      }
      if (this.shownColumns.indexOf(name) > -1) {
        console.log('Column name has been in the shown list.');
      } else {
        this.shownColumns.push(name);
      }
    }
  }

  // Redundant mark
  /**
   * remove a present column in the table
   * @param colName
   */
  removeColumn(colName) {
    if (typeof colName !== 'string') {
      console.error('Invalid argument.');
    }
    let i = this.shownColumns.indexOf(colName);
    if (i === -1) {
      console.error('Column not present in the table yet.');
    } else {
      this.shownColumns.splice(i, 1);
    }
  }

  // Redundant mark
  // customized column names
  renameColumn(oldName, newName) {
    if (!this._colModel[oldName]) {
      throw 'Column name not recognized.';
    }
    this._colModel[oldName].label = newName;
  }

  /**
   * formatter to create customized elements with the data,
   * the provided func should return an document element object or innerHTML
   * @param colName
   * @param func
   */
  setFormatter(colName, func) {
    if (typeof colName !== 'string' || !this._colModel[colName]) {
      throw new Error(`Column name ${colName} not recognized.`);
    }
    if (typeof func === 'string') {
      let f = DataTable.formatterPool(func);
      if (!f) {
        throw new Error(`The formatter name ${func} not recognized.`);
      }
      this._colModel[colName].formatter = f;
      return;
    }
    if (typeof func === 'function') {
      this._colModel[colName].formatter = func;
      return;
    }
    throw new Error('A predefined formatter name or custom function expected.');
  }


  /**
   * configureLayout method set configuration property
   * @param prop: string
   * @param value: boolean | string
   */
  configureLayout(prop, value) {
    if (typeof prop !== 'string') {
      throw 'Invalid property: ' + prop;
    }
    switch (prop.toUpperCase()) {
      case 'DOWNLOAD':
        this.configuration.downloadButton = value;
        break;
      case 'FILTER':
        this.configuration.filterButton = value;
        break;
      case 'CAPTION':
        this.configuration.caption = value;
        break;
      case 'VISUALIZATION':
        this.configuration.vizButton = value;
        break;
      case 'SEARCH':
        this.configuration.searchBar = value;
        break;
      case 'SCHEME':
        this.changeColorScheme(value);
        break;
      default:
        console.log('Property not recognized!');
        console.log('Expect: download | search | filter | visualization |' +
          ' scheme | caption');
        return;
    }
    console.log('Configuration updated.');
  }

  /**
   * AddFilter add a filter to filter section
   * @param colName: <string>, column names
   * @param type: <string>, value | range
   * @param dataObj: <array | null>, return by solr/ngram. If is null,
   * it will be computed locally
   * @param int: <boolean>, specify when using range facet, only use integer as
   * range boundaries
   */
  addFilter(colName, type, dataObj, int) {
    if (!this._colModel[colName]) {
      throw `Column name ${colName} not recognized. Please use the original column name, but not the customized name.`;
    }
    if (type !== 'value' && type !== 'range') {
      throw 'Type not recognized. Only value or range allowed.';
    }

    this.configuration.filterButton = true;
    if (dataObj === null || typeof dataObj === 'undefined') {
      // compute the dataObj locally
      if (type === 'value') {
        let m = new Map();
        for (let item of this._data) {
          let v = item[colName];
          if (typeof v === 'undefined') {
            continue;
          }
          if (typeof v === 'object') {
            v = v.valueForFiltering;
          }
          let c = m.get(v);
          if (c === undefined) {
            m.set(v, 1);
          } else {
            m.set(v, c + 1);
          }
        }
        let arr = [];
        for (let [k, c] of m.entries()) {
          arr.push({
            facetType: 'value',
            facetValue: k,
            count: c
          });
        }
        arr.sort((d1, d2) => d2.count - d1.count);
        this._filters[colName] = arr;
      }

      if (type === 'range') {
        // if type is range, the values of that column should be number
        if (typeof this._data[0][colName] !== 'number' || typeof this._data[0][colName].valueForFiltering !== 'number') {
          throw 'This column should be of type of number or object that contains a valueForFiltering of number type.';
        }
        this._sort(colName, -1);
        if (this._data.length < 5) {
          throw 'Two few items to range.';
        }
        let min = this._data[0][colName];
        let max = this._data[this._data.length - 1][colName];
        let d;
        if (int) {
          // when both min and max are integers, you don't expect to see floats
          d = Math.ceil((max - min) / 5);
        } else {
          d = ((max - min) / 5).toFixed(2);
          if (d.slice(-2) === '00') {
            d = +d;
          } else {
            d = +(+d + .01).toFixed(2);
          }
        }
        let arr = [];
        for (let i = 0; i < 5; i++) {
          arr.push([min + i * d, min + (i+1) * d, 0]);
        }

        // To avoid errors when categorized the max value
        if (arr[4][1] === max) {
          arr[4][1] += 1;
        }

        let idx = 0;
        for (let item of this._data) {
          if (item[colName] >= arr[idx][0] && item[colName] < arr[idx][1]) {
            arr[idx][2]++;
          } else {
            arr[idx+1][2]++;
            idx++;
          }
        }
        this._filters[colName] = arr.map(d => {
          return {
            facetType: 'range',
            facetValue: `[${d[0]}, ${d[1]})`,
            count: d[2]
          };
        });
      }
    } else if (Array.isArray(dataObj)) {
      // provide a specified array similar with the array above
      // dataObj: interface{facetType: string, facetValue: string, count:
      // number}[]
      this._filters[colName] = dataObj;
    } else {
      throw 'Adding filter failed';
    }

  }

  /**
   * AddChart add a chart to visualization section
   * @param chart: object
   * {
   *    charType: bar/line/scatter/pie/...
   *    xAxisColumn: a,
   *    yAxisColumn: b,
   *    ...
   * }
   */
  addCharts(chart) {
    this.configuration.vizButton = true;
    this._charts.push(chart);
  }

  /**
   * ChangeColorScheme change the color scheme of the whole object
   * @param scheme: string
   */
  changeColorScheme(scheme) {
    if (!this._colorSchemes[scheme]) {
      throw new Error(scheme + ' not set.');
    }
    this.configuration.colorScheme = scheme;
  }

  // static method
  static convertToString(d) {
    switch (typeof d) {
      case 'number':
        return d + '';
      case 'string':
        return d;
      case 'object':
        if (Array.isArray(d)) {
          return d.join(', ');
        } else if (d === null) {
          return 'null';
        } else {
          return JSON.stringify(d);
        }
      case 'bool':
        return d + '';
      default:
        return 'null';
    }
  }

  // Predefined formatter
  static formatterPool(name) {
    const pool = {
      highlight: function (s) {
        return `<mark>${s}</mark>`;
      },
      addLink: function (obj) {
        return `<a href="${obj.link}">${obj.text}</a>`;
      },
      bold: function (word) {
        return `<strong>${word}</strong>`;
      },
      colorText: function (obj) {
        return `<span style="color: ${obj.color}">${obj.text}</span>`;
      }
    };
    return pool[name];
  }

  // Convert JSON to CSV or TSV
  static convert(arr, delimiter) {
    if (!Array.isArray(arr)) {
      throw new TypeError('an array of objects expected');
    }
    if (arr.length === 0) {
      return '';
    }
    let cols = Object.keys(arr[0]);
    let res = cols.join(delimiter) + '\n';
    for (let obj of arr) {
      res += cols.map(p => obj[p]).join(delimiter) + '\n';
    }
    return res;
  }

  /**
   * serialize the filter/sort setting object to query string parameters
   * @param obj, <Object>, format: {key: value} or {key: [v1, v2, ...]}
   * @param delimiter, <String>, default: _._
   * @returns {*} <String>, 'key_._value' or ['key_._v1', 'key_._v2', ...]
   */
  static serialize(obj, delimiter) {
    // return a serialized string or an array of serialized string
    if (typeof delimiter === 'undefined') {
      delimiter = '_._';
    }
    let key = Object.keys(obj)[0];
    if (Array.isArray(obj[key])) {
      return obj[key].map(v => `${key}${delimiter}${v}`);
    } else {
      return `${key}${delimiter}${obj[key]}`;
    }
  }

  /**
   * This is an internal method to sort the data on a specified column and update the table
   * @param col: <String>, must be a valid column name
   * @param order: <Number>, 1 for ascending; -1 for descending. If order is not provided, -1 will be taken.
   * @private
   */
  _sort(col, order) {
    if (!order) {
      order = -1;
    }

    this.sortSetting = {};
    this.sortSetting[col] = order;

    if (!this._partition) {
      // Below is very important. Without the checking, if the _data is empty,
      // the code below to sort will throw error -- this._data[0] is undefined.
      // if _data contains 0 or just 1 object, we can return immediately,
      // no need to do anything.
      if (this._data.length < 2) {
        return;
      }
      if (order === -1) {
        try {
          switch (typeof this._data[0][col]) {
            case 'object':
              this._data.sort((x, y) => {
                return x[col].valueForSorting < y[col].valueForSorting ? 1 : -1;
              });
              break;
            default:
              this._data.sort((x, y) => x[col] < y[col] ? 1 : -1);
          }
        } catch(err) {
          console.error(err);
          this._notifyStatus({
            type: 'error',
            message: "Error happens while sorting column " + col + " locally"
          });
        }
      } else if (order === 1) {
        try {
          switch (typeof this._data[0][col]) {
            case 'object':
              this._data.sort((x, y) => {
                return x[col].valueForSorting < y[col].valueForSorting ? -1 : 1;
              });
              break;
            default:
              this._data.sort((x, y) => x[col] < y[col] ? -1 : 1);
          }
        } catch(err) {
          console.error(err);
          this._notifyStatus({
            type: 'error',
            message: "Error happens while sorting column " + col + " locally"
          });
        }
      }

      // sort doesn't change the underlying data
      // Therefore, it is not required to consider the filterSetting here
      this._setPageNumber(1);
      this._updateTableView();
      this._notifyStatus({
        type: 'success'
      });

    } else {
      // sort will update the underlying data, therefore it is necessary to re-fetch
      // data from the server. It is not correct to use _checkPageNumber to replace the
      // codes below, which will not fetch new data if the _partitionIndex doesn't change
      // get data from server side
      this._notifyStatus({type: 'progress'});
      let opts = {sort: this.sortSetting};
      if (this.filterSetting) {
        opts.filter = this.filterSetting;
      }
      this.fetchData(0, opts).then(newData => {
        // newData is in the form of {totalCount: number, data: array}
        // Using arrow functions, therefore "this" points to real this
        try {
          // the newData should be ready to use without any pre-processing
          this._data = newData.data;
          this._setPageNumber(1);
          this._updateTableView();
          this._notifyStatus({
            type: 'success'
          });
        } catch(err) {
          // console.error(err.toString());
          this._notifyStatus({
            type: 'error',
            message: `Error happens while processing the data from server for sorting on ${col}`
          });
        }
      }).catch(err => {
        // console.error(err);
        this._notifyStatus({
          type: 'error',
          message: 'Error happens while loading data from server for sorting on ' + col
        });
      });
    }
  }

  /**
   * _filterData change the underlying data and update the table view accordingly
   */
  _filterData() {
    this.resetData();
    // iterate the _filters object
    let cond = {};
    this.filterSetting = [];
    let colNames = Object.keys(this._filters);
    for (let colName of colNames) {
      let arr = this._filters[colName].filter(d => d.selected);
      if (arr.length > 0) {
        let t = arr.map(d => d.facetValue);
        cond[colName] = {
          facetType: this._filters[colName][0].facetType,
          facetValues: t
        };
        let o = {};
        o[colName] = t;
        this.filterSetting.push(o);
      }
    }

    // console.log(this.filterSetting);

    let wrapper = document.getElementsByClassName('filter-viz-download-buttons-wrapper')[0];
    if (Object.keys(cond).length) {
      wrapper.classList.add('filter-active');
    } else {
      wrapper.classList.remove('filter-active');
    }

    if (!this._partition) {
      // filter the data
      let cols = Object.keys(cond);
      let newData = this._data;
      for (let col of cols) {
        switch (cond[col].facetType) {
          case 'value':
            try {
              let values = cond[col].facetValues;

              switch (typeof newData[0][col]) {
                case 'object':
                  newData = newData.filter(d => values.includes(d[col].valueForFiltering));
                  break;
                default:
                  newData = newData.filter(d => values.includes(d[col]));
              }
            } catch (err) {
              console.error(err);
              this._notifyStatus({
                type: 'error',
                message: "Error happens while filtering the data locally"
              });
            }
            break;
          case 'range':
            let ranges = cond[col].facetValues.map(d => {
              let t = d.slice(1, -1).split(',');
              return [+t[0], +t[1]];
            });
            newData = newData.filter(d => {
              for (let range of ranges) {
                // may be updated to handle the case d[col] is an object
                if (d[col] >= range[0] && d[col] < range[1]) {
                  return true;
                }
              }
              return false;
            });
            break;
          default:
            // console.log(cond[col][0].facetType);
            this._notifyStatus({
              type: 'error',
              message: cond[col][0].facetType + ' is not a valid facet type'
            });
        }
      }
      this._data = newData;
      // console.log(newData);
      // The underlying data might be changed, thus totalPages needs to be updated
      this._setTotalPages(this._data.length);

      // filter will change the underlying data, therefore if the sorting is on,
      // it is required to resort the data. CRITICAL!
      if (this.sortSetting) {
        let name = Object.keys(this.sortSetting)[0];
        let order = this.sortSetting[name];
        this._sort(name, order);
      } else {
        this._setPageNumber(1);
        this._updateTableView();
      }

      this._notifyStatus({
        type: 'success'
      });

      if (this._data.length === 0) {
        this._notifyStatus({
          type: 'alert',
          message: 'No data match to the given filter'
        });
      }
    } else {
      // It is most likely that the underlying data will be changed, therefore
      // it is necessary to re-fetch data from server. We can not use _checkPageNumber
      // here, which will not fetch new data if the _partitionIndex is not changed.
      // filter data on the server side
      // how to deal with the sort settings?
      this._notifyStatus({
        type: 'progress',
        message: 'filtering'
      });
      let opts = {filter: this.filterSetting};
      if (this.sortSetting) {
        opts.sort = this.sortSetting;
      }
      this.fetchData(0, opts).then(newData => {
        try {
          // newData is in the form of {totalCount: number, data: array}
          // update the _data
          this._data = newData.data;
          // update the totalPages!!!!
          this._setTotalPages(newData.totalCount);
          // update the page number
          this._setPageNumber(1);
          // update table view
          this._updateTableView();

          // hide progress bar or error/alert message in the notification section
          this._notifyStatus({type: 'success'});
          // add a reminder to the notification section if no data
          if (this._data.length === 0) {
            this._notifyStatus({
              type: 'alert',
              message: 'No data match to the given filter'
            });
          }
        } catch (err) {
          // console.error(err.toString());
          this._notifyStatus({
            type: 'error',
            message: `Error happens while processing the data from server for filtering`
          });
        }
      }).catch(err => {
        // console.error(err.toString());
        // deal with errors
        this._notifyStatus({
          type: 'error',
          message: 'Failed to load new data (filtering)'
        });
      });
    }
  }

  /**
   * Show status on the top of the table
   * @param o: <Object> {type: 'progress|success|error'(required), message: <String> (optional)>}
   */
  _notifyStatus(o) {
    let ns = document.getElementById(this._targetId + '-notification-section');
    let msgs = ns.getElementsByClassName('message-bar');
    switch (o.type) {
      case 'progress':
        ns.classList.add('progress-active');
        ns.classList.remove('error-active');
        ns.classList.remove('alert-active');
        break;
      case 'error':
        ns.classList.add('error-active');
        ns.classList.remove('alert-active');
        ns.classList.remove('progress-active');
        msgs[0].innerText = o.message;
        break;
      case 'alert':
        ns.classList.add('alert-active');
        ns.classList.remove('error-active');
        ns.classList.remove('progress-active');
        msgs[1].innerText = o.message;
        break;
      case 'success':
        ns.classList.remove('progress-active');
        ns.classList.remove('error-active');
        ns.classList.remove('alert-active');
        break;
      default:
        ns.classList.remove('progress-active');
        ns.classList.remove('error-active');
        ns.classList.remove('alert-active');
    }
  }


  // internal method, determine the range of data to show
  _updateDataToShow() {
    let res = [];
    // _offset should be used below
    // console.log(this._offset);
    console.log(`current partition index: ${this._partIndex}`);
    console.log(`Current page number: ${this._pageNumberInAll}`);
    console.log(`Current offset: ${this._offset}`);
    let start = (this._offset - 1) * this._rowsPerPage;
    for (let i = 0; i < this._rowsPerPage && start + i < this._data.length; i++) {
      res.push(this._data[start+i]);
    }
    this._dataToShow = res;
  }

  /**
   * This is an internal method to update the table view.
   * It is mainly invoked by _sort | _filterData | _checkPageNumber to update the table
   * @private
   */
  _updateTableView() {
    this._updateDataToShow();
    // check formatter
    for (let colName of this.shownColumns) {
      if (this._colModel[colName].formatter) {
        if (typeof this._colModel[colName].formatter === 'string') {
          if (!DataTable.formatterPool((this._colModel[colName].formatter))) {
            throw new Error('formatter not recognized');
          } else {
            this._colModel[colName].formatter = DataTable.formatterPool((this._colModel[colName].formatter));
          }
        } else if (typeof this._colModel[colName].formatter === 'function') {
          // do nothing
        } else {
          throw new Error('Invalid formatter for ' + colName);
        }
      }
    }

    if (typeof this._targetId !== 'string' || !this._targetId) {
      throw new Error('an element id expected');
    }
    let table = document.getElementById(this._targetId + '-table-section');
    if (!table) {
      throw new Error('failed to locate the table');
    }

    // delete all the rows in tBody
    let tBody = table.getElementsByTagName('tbody')[0];
    while (tBody.lastChild) {
      tBody.removeChild(tBody.lastChild);
    }

    // _pageNumberInAll should be use below
    let startIndex = (this._pageNumberInAll - 1) * this._rowsPerPage + 1;
    let df = document.createDocumentFragment();
    for (let i = 0; i < this._dataToShow.length; i++) {
      let row = this._dataToShow[i];
      let tr = df.appendChild(document.createElement('tr'));
      if (this._firstColumnAsRowNumber) {
        let td = tr.appendChild(document.createElement('td'));
        td.innerText = startIndex + i;
        td.classList.add('table-row-index-column');
      }
      for (let name of this.shownColumns) {
        let td = tr.appendChild(document.createElement('td'));
        if (this._colModel[name].formatter) {
          let v = this._colModel[name].formatter(row[name]);
          switch (typeof v) {
            case 'string':
              td.innerHTML = v;
              break;
            case 'object':
              td.appendChild(v);
              break;
            default:
              td.innerText = 'invalid customized formatter';
          }
        } else {
          td.innerText = DataTable.convertToString(row[name]);
        }
        if (this._colModel[name].align) {
          td.style.textAlign = this._colModel[name].align;
        }
      }
    }
    tBody.appendChild(df);

    // update current page number and total page number
    document.getElementById('table-page-number-current').value = this._pageNumberInAll;
    document.getElementById('table-page-number-total').value = this._totalPages;
  }

  // generate all table related panels,
  // can be used to refresh the whole object
  generate() {
    // replace the table with a div element
    let target = document.getElementById(this._targetId);
    let div = document.createElement('div');
    target.parentNode.insertBefore(div, target);
    target.parentNode.removeChild(target);
    div.id = this._targetId;
    div.classList.add(this._uid);
    div.classList.add(this._colorSchemes[this.configuration.colorScheme]);
    // set ARIA attribute
    div.setAttribute('role', 'table');

    // create the contents of the new object
    let container = document.createDocumentFragment();
    let that = this;

    // create control buttons, i.e. search box, filter button, download button
    let sbPanel = container.appendChild(document.createElement('div'));
    sbPanel.classList.add('search-bar-panel');

    if (this.configuration.searchBar) {
      let searchBar = sbPanel.appendChild(document.createElement('div'));
      searchBar.id = this._targetId + '-search-bar';
      searchBar.classList.add('search-bar-wrapper');

      let sb = searchBar.appendChild(document.createElement('input'));
      sb.type = 'search';
      sb.id = this._targetId + '-search-box';
      sb.classList.add('search-box');
      sb.setAttribute('aria-label', 'search box');
      sb.addEventListener('focus', function () {
        searchBar.classList.remove('search-hints-active');
      });

      let lb = searchBar.appendChild(document.createElement('label'));
      lb.htmlFor = sb.id;
      lb.classList.add('label-for-search-box');
      lb.setAttribute('role', 'button');
      lb.setAttribute('aria-label', 'search button');
      lb.appendChild(document.createTextNode('Search'));

      let sp = searchBar.appendChild(document.createElement('span'));
      sp.classList.add('question-mark');
      sp.setAttribute('role', 'button');
      sp.setAttribute('aria-label', 'hints for search syntax');
      sp.addEventListener('click', function () {
        searchBar.classList.add('search-hints-active');
      });

      let hintWrapper = searchBar.appendChild(document.createElement('div'));
      hintWrapper.classList.add('search-hints-wrapper');
      hintWrapper.setAttribute('role', 'table');
      let hint = hintWrapper.appendChild(document.createElement('p'));
      hint.innerText = `Syntax: "column name":[[operator] value] [AND | OR] ["column name"[:[operator]value]]`;
      hint.setAttribute('role', 'row');
      let example = hintWrapper.appendChild(document.createElement('p'));
      example.appendChild(document.createTextNode('e.g. '));
      example.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode('"length": > 120'));
      example.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode(';'));
      example.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode('"height": 80 AND "width": 100'));
      example.setAttribute('role', 'row');
    }

    let btns = container.appendChild(document.createElement('div'));
    btns.classList.add('filter-viz-download-buttons-wrapper');

    if (this.configuration.filterButton) {
      let fBtn = btns.appendChild(document.createElement('div'));
      fBtn.classList.add('table-top-button', 'filter-section-control-button');
      fBtn.appendChild(document.createTextNode('Filters'));
      fBtn.setAttribute('role', 'button');
      fBtn.setAttribute('aria-label', 'filter button');
      fBtn.addEventListener('click', function () {
        document.getElementById(that._targetId).classList.toggle('filter-section-active');
      });
    }

    if (this.configuration.vizButton) {
      let vBtn = btns.appendChild(document.createElement('div'));
      vBtn.classList.add('table-top-button', 'viz-section-control-button');
      vBtn.appendChild(document.createTextNode('Visualize'));
      vBtn.addEventListener('click', function () {
        document.getElementById(that._targetId).classList.toggle('viz-section-active');
      });
    }

    if (this.configuration.downloadButton) {
      let that = this;
      let dBtn = btns.appendChild(document.createElement('div'));
      dBtn.classList.add('table-top-button', 'download-control-button');
      let sp = document.createElement('span');
      sp.appendChild(document.createTextNode('Download'));
      dBtn.appendChild(sp);
      dBtn.setAttribute('role', 'button');
      dBtn.setAttribute('aria-label', 'download button');

      let list = document.createElement('form');
      list.classList.add('data-table-download-type-options');
      for (let type of ['CSV', 'TSV', 'JSON']) {
        let span = document.createElement('span');
        let inp = span.appendChild(document.createElement('input'));
        inp.type = 'radio';
        inp.value = type;
        inp.id = 'data-table-download-type-option ' + type;
        inp.classList.add('data-table-download-type-option');
        // inp.checked = type === 'CSV';
        inp.name = 'data-table-download-type';
        span.appendChild(inp);
        let label = document.createElement('label');
        label.classList.add('data-table-download-type-option-label');
        label.appendChild(document.createTextNode(type));
        label.htmlFor = 'data-table-download-type-option ' + type;

        label.addEventListener('click', () => {
          console.log('download type selected');
          // console.log(type);
          // need to be done
          let a = document.createElement('a');
          a.setAttribute('download', that.opts.downloadFileName + '.' + type.toLowerCase());

          // use urlForDownloading as the first choice
          if (that.opts.urlForDownloading) {
            let url = `${that.opts.urlForDownloading}&type=${type.toLowerCase()}`;
            let fields = that.opts.columnsToDownload ? that.opts.columnsToDownload : that.shownColumns;
            for (let field of fields) {
              url += `&field=${field}`;
            }
            if (that.filterSetting) {
              for (let obj of that.filterSetting) {
                let arr = DataTable.serialize(obj, '_._');
                for (let s of arr) {
                  url += `&filter=${s}`;
                }
              }
            }
            if (that.sortSetting) {
              url += `&sort=${DataTable.serialize(that.sortSetting, '_._')}`;
            }
            a.setAttribute('href', url);
          } else if (that.opts.dataIsComplete && that.opts.dataToDownload) {
            let str;
            switch (type) {
              case 'CSV':
                str = DataTable.convert(that.opts.dataToDownload, ',');
                break;
              case 'TSV':
                str = DataTable.convert(that.opts.dataToDownload, '\t');
                break;
              case 'JSON':
                str = JSON.stringify(that.opts.dataToDownload);
                break;
              default:
            }
            a.setAttribute('href', `data:text/${type.toLowerCase()};charset=utf-8,${encodeURIComponent(str)}`);
          } else {
            a.addEventListener('click', () => {
              alert("Sorry, the data is not ready for downloading.");
            });
          }

          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });

        span.appendChild(label);
        list.appendChild(span);
      }

      dBtn.appendChild(list);

      // dBtn.addEventListener('click', function () {
      //   // control download options
      // });
    }


    // create filter panel
    let filterSection = container.appendChild(document.createElement('div'));
    filterSection.id = this._targetId + '-filter-section';
    filterSection.classList.add('filter-section');

    // create visualization panel
    let vizSection = container.appendChild(document.createElement('div'));
    vizSection.id = this._targetId + '-visualization-section';
    vizSection.classList.add('visualization-section');

    // create notification panel
    let notifySection = container.appendChild(document.createElement('div'));
    notifySection.id = this._targetId + '-notification-section';
    notifySection.classList.add('notification-section');
    let progressBar = notifySection.appendChild(document.createElement('div'));
    progressBar.classList.add('progress-bar');
    let dotWrapper = progressBar.appendChild(document.createElement('div'));
    dotWrapper.classList.add('progress-dot-wrapper');
    for (let i = 0; i < 3; i++) {
      let sp = dotWrapper.appendChild(document.createElement('span'));
      sp.classList.add('progress-dot');
      sp.classList.add(`dot-num-${i+1}`);
    }
    let errorBar = notifySection.appendChild(document.createElement('div'));
    errorBar.classList.add('error-message');
    errorBar.classList.add('message-bar');
    let alertBar = notifySection.appendChild(document.createElement('div'));
    alertBar.classList.add('alert-message');
    alertBar.classList.add('message-bar');

    // create table panel
    let table = container.appendChild(document.createElement('table'));
    table.id = this._targetId + '-table-section';
    table.classList.add('table-section');

    // add caption to the table
    table.appendChild(document.createElement('caption'))
    .appendChild(document.createTextNode(this.configuration.caption));

    // create table header
    // Since the header is supposed not to update, create it once
    let head = table.appendChild(document.createElement('thead'))
    .appendChild(document.createElement('tr'));
    head.classList.add('table-header-row');

    if (this._firstColumnAsRowNumber) {
      let firstCol = head.appendChild(document.createElement('th'));
      firstCol.innerHTML = '#';
      firstCol.classList.add('table-row-index-column');
      firstCol.style.width = ((this._totalRows + '').length) * 15 + 'px';
    }
    for (let name of this.shownColumns) {
      let th = head.appendChild(document.createElement('th'));
      let sp = th.appendChild(document.createElement('span'));
      sp.classList.add('table-row-regular-column-name');
      sp.appendChild(document.createTextNode(this._colModel[name].label));
      sp.setAttribute('aria-label', this._colModel[name].label);
      let model = this._colModel[name];
      // set width
      if (model.width) {
        th.style.width = model.width;
      }
      // create tooltips
      if (model.tips) {
        let tip = th.appendChild(document.createElement('span'));
        tip.classList.add('tooltiptext');
        tip.setAttribute('aria-label', model.tips);
        tip.appendChild(document.createTextNode(model.tips));
      }
      // create sorting icon if sortable
      if (model.sortable) {
        sp.classList.add('table-row-filter-column-name');
        let control = th.appendChild(document.createElement('div'));
        control.classList.add('table-sorting-control-container');
        control._colName = name;
        let up = control.appendChild(document.createElement('i'));
        up.classList.add('table-sorting-control', 'table-sorting-up-control');
        up._colName = name;
        up.setAttribute('role', 'button');
        up.setAttribute('aria-label', 'sort in ascending order');
        let down = control.appendChild(document.createElement('i'));
        down.classList.add('table-sorting-control', 'table-sorting-down-control');
        down._colName = name;
        down.setAttribute('role', 'button');
        down.setAttribute('aria-label', 'sort in descending order');
      }
    }

    //create tBody
    table.appendChild(document.createElement('tbody'));

    // create page controller panel
    let pager = container.appendChild(document.createElement('div'));
    pager.id = this._targetId + '-pager-section';
    pager.classList.add('pager-section', 'table-page-control-container');

    // create number of rows per page selector
    let a = pager.appendChild(document.createElement('div'));
    a.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('Rows per Page'));
    let num = a.appendChild(document.createElement('select'));
    num.classList.add('table-row-number-selector');
    for (let i of [5, 10, 20, 50, 100, 200]) {
      num.appendChild(document.createElement('option'))
      .appendChild(document.createTextNode(i+''));
    }
    num.value = this._rowsPerPage;

    // page selector candidate
    let c = pager.appendChild(document.createElement('div'));
    c.classList.add('table-page-number-control-container');
    // last page button
    let minusOneBtn = c.appendChild(document.createElement('div'));
    minusOneBtn.classList.add('table-page-number-control-block', 'table-page-number-minus-one');
    minusOneBtn.setAttribute('role', 'button');
    minusOneBtn.setAttribute('aria-label', 'last page');


    // middle content
    let m = c.appendChild(document.createElement('div'));
    m.classList.add('table-page-number-current-container');
    m.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('Page'));
    let inp1 = m.appendChild(document.createElement('input'));
    inp1.type = 'text';
    inp1.id = 'table-page-number-current';
    m.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('of'));
    let inp2 = m.appendChild(document.createElement('input'));
    inp2.type = 'text';
    inp2.id = 'table-page-number-total';
    inp2.readonly = true;
    inp2.value = this._totalPages;

    // next page button
    let plusOneBtn = c.appendChild(document.createElement('div'));
    plusOneBtn.classList.add('table-page-number-control-block', 'table-page-number-plus-one');
    plusOneBtn.setAttribute('role', 'button');
    plusOneBtn.setAttribute('aria-label', 'next page');


    // add the df to div
    div.appendChild(container);
    this._updateTableView();
    this._attachListeners();
    if (this.configuration.filterButton) {
      this.createFilterSection();
    }
  }

  // attach event listeners to controller elements
  // Although it is better to add event listener as the element was created,
  // which you save the time searching the DOM tree to get the elements,
  // it is acceptable to add event listener after all the elements have been
  // created. Because there are only a few of elements to take care of.
  // Below are event listener to update the table view. Other listeners are
  // registered when they were created.
  /**
   * This is an internal method to add event listeners
   * @private
   */
  _attachListeners() {
    let that = this;
    // document.getElementById(this._targetId)
    //     .addEventListener('click', function (evt) {
    //         that.messageQueue.push({
    //           target: evt.target,
    //           //....
    //         });
    //         console.log(`${evt.target.tagName} clicked.`);
    // });

    let table = document.getElementById(this._targetId + '-table-section');
    if (!table) {
      throw new Error('failed to locate the table');
    }

    let pager = document.getElementById(this._targetId + '-pager-section');
    let rowPerPageSelector = pager.getElementsByTagName('select')[0];
    let currentPageNumber = document.getElementById('table-page-number-current');

    // add event listener to up/down sort controls
    let sortingControls = document.getElementsByClassName('table-sorting-control');
    table.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('table-sorting-control')) {
        for (let ctrl of sortingControls) {
          ctrl.classList.remove('table-sorting-control-active');
        }
      }
      if (evt.target.classList.contains('table-sorting-up-control')) {
        evt.target.classList.add('table-sorting-control-active');
        let col = evt.target._colName;
        that._sort(col, 1);
      } else if (evt.target.classList.contains('table-sorting-down-control')) {
        evt.target.classList.add('table-sorting-control-active');
        let col = evt.target._colName;
        that._sort(col, -1);
      }
    });

    // add event listener to page-number-control minus/plus icon using event
    // delegation
    pager.addEventListener('click', function (evt) {
      // console.log('pager clicked');
      if (evt.target.classList.contains('table-page-number-minus-one')) {
        if (+currentPageNumber.value > 1) {
          let v = +currentPageNumber.value - 1;
          that._checkPageNumber(v);
        }
      }

      if (evt.target.classList.contains('table-page-number-plus-one')) {
        if (+currentPageNumber.value < that._totalPages) {
          let v = +currentPageNumber.value + 1;
          that._checkPageNumber(v);
        }
      }
    });

    // add event listener to number of rows per page selector
    rowPerPageSelector.addEventListener('change', function () {
      // setRowsPerPage will update both the _rowsPerPage and _totalPages
      that.setRowsPerPage(+this.value);

      // Below is not strict. The filterSetting and sortSetting may be set.
      // It is not safe to reset to originalData.
      // that._data = that._originalData;
      // that._setPageNumber(1);
      // that._updateTableView();

      // A safe means is just _checkPageNumber(1), which can handle it.
      that._checkPageNumber(1);

      // Below is redundant???
      that._changePageByUser = false;
      setTimeout(function () {
        that._changePageByUser = true;
      }, 1000);
    });

    // add event listener to page selector
    currentPageNumber.addEventListener('change', function () {
      let n = +this.value;
      if (isNaN(n)) {
        alert('invalid page number!');
        return;
      }
      if (n < 1 || n > that._totalPages) {
        alert('page number out of range');
        return;
      }

      // whether the _changePageByUser is necessary here?
      that._checkPageNumber(+this.value);
    });
  }

  // create or update the Filter section
  createFilterSection() {
    let that = this;
    let filterSection = document.getElementById(this._targetId + '-filter-section');
    if (!filterSection) {
      throw new Error('Creating filter section failed.')
    }

    while (filterSection.lastChild) {
      filterSection.removeChild(filterSection.lastChild);
    }

    let filterNames = Object.keys(this._filters);
    if (filterNames.length === 0) {
      console.error('No filters found.');
      return;
    }

    let btns = document.getElementsByClassName('filter-viz-download-buttons-wrapper')[0];

    if (btns.getElementsByClassName('filter-section-control-button').length === 0) {
      let fBtn = btns.appendChild(document.createElement('div'));
      fBtn.classList.add('table-top-button', 'filter-section-control-button');
      fBtn.appendChild(document.createTextNode('Filters'));
      fBtn.setAttribute('role', 'button');
      fBtn.setAttribute('aria-label', 'filter button');
      fBtn.addEventListener('click', function () {
        document.getElementById(that._targetId).classList.toggle('filter-section-active');
      });
      fBtn.classList.add('filter-ready-signal');
      setTimeout(function() {
        fBtn.classList.remove('filter-ready-signal');
      }, 6000);
    }

    let df = document.createDocumentFragment();

    let table = df.appendChild(document.createElement('table'));
    table.classList.add('filter-section-table');
    for (let filterName of filterNames) {
      let row = table.appendChild(document.createElement('tr'));
      row.classList.add('filter-section-row');
      row.filterName = filterName;
      let td = row.appendChild(document.createElement('td'));
      td.classList.add('filter-name');
      td.appendChild(document.createTextNode(this._colModel[filterName].label ? this._colModel[filterName].label : filterName));
      // reuse td variable below
      td = row.appendChild(document.createElement('td'));
      td.classList.add('filter-values');
      td.classList.add('unfold-fold-fold');
      for (let i = 0; i < this._filters[filterName].length; i++) {
        let obj = this._filters[filterName][i];
        let span = td.appendChild(document.createElement('span'));
        span.classList.add('filter-value');
        if (i > 9) {
          span.classList.add('filter-value-hidden');
        }

        let inp = span.appendChild(document.createElement('input'));
        inp.type = 'checkbox';
        let uid = `${that._targetId}-filter-value-${filterName}-value-${i}`;
        inp.id = uid;

        inp.counterpart = obj;
        inp.addEventListener('change', function() {
          this.counterpart.selected = this.checked;
          that._filterData();
        });
        let label = span.appendChild(document.createElement('label'));
        label.setAttribute('for', uid);
        label.appendChild(document.createTextNode(`${obj.facetValue} (${obj.count})`));

        if (i > this.maxNumOfFacets - 1) {
          let info = td.appendChild(document.createElement('span'));
          info.classList.add('filter-value-hidden');
          info.innerText = ". . .";
          this._notifyStatus({
            type: 'alert',
            message: `Too many facets, only a partial list is shown in the Filter section`
          });
          break;
        }
      }
      if (this._filters[filterName].length > 10) {
        let ctrl = td.appendChild(document.createElement('span'));
        ctrl.classList.add('unfold-fold-ctrl');
        ctrl.addEventListener('click', function(evt) {
          evt.target.parentNode.classList.toggle('unfold-fold-fold');
        });
      }
    }
    filterSection.appendChild(df);
  }

  // create Visualization section
  createVizSection() {
    let that = this;
    let vizSection = document.getElementById(this._targetId + '-visualization-section');
    if (!vizSection) {
      throw new Error('Creating visualization section failed.');
    }
    // create visualization control panel

    // add event listener to controls

    // create visualization area
  }


}


// testing code
if (typeof module !== 'undefined' && !module.parent) {
  let data = [
    {a: 'a', b: 'x', c: 17},
    {a: 'a', b: 'y', c: 1},
    {a: 'a', b: 'd', c: 7},
    {a: 'a', b: 'e', c: 27},
    {a: 'a', b: 'd', c: 12},
    {a: 'a', b: 'c', c: 4},
    {a: 'a', b: 'e', c: 8},
    {a: 'a', b: 'c', c: 23},
    {a: 'a', b: 'v', c: 21},
    {a: 'a', b: 'd', c: 78},
    {a: 'a', b: 's', c: 65},
    {a: 'a', b: 'c', c: 34},
    {a: 'a', b: 'x', c: 89},
    {a: 'a', b: 'x', c: 3},
    {a: 'a', b: 'z', c: 56},
    {a: 'a', b: 'e', c: 27},
    {a: 'a', b: 'r', c: 62},
    {a: 'a', b: 'f', c: 4},
    {a: 'a', b: 'x', c: 17},
    {a: 'a', b: 'r', c: 19},
    {a: 'a', b: 'r', c: 27}
  ];

  let start = Date.now();
  let t = new DataTable(data, 'test');
  t.addFilter('c', 'range');
  t.addFilter('b', 'value');
  console.log(t._filters);
  console.log(Date.now() - start);
}

export default DataTable;