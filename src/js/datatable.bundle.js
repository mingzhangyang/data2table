const DataTable = (function () {
  'use strict';

  const createColModel = (arr) => {
    // Create column model object
    let res = {};
    res.colModel = {};
    res.allColumns = [];
    let s = new Set();
    for (let d of arr) {
      let keys = Object.keys(d);
      for (let key of keys) {
        s.add(key);
      }
    }
    for (let name of s) {
      res.colModel[name] = {
        name: name,
        label: name,
        tips: '',
        sortable: false,
        hidden: false, // redundant, use shownColumns to manage shown/hidden
        width: '',
        align: '',
        formatter: undefined, // must a function
      };
      res.allColumns.push(name);
    }
    res.shownColumns = res.allColumns;
    res.hiddenColumns = [];
    return res;
  };

  function fetchData(queryObject) {
    let start = queryObject.start;
    let limit = queryObject.limit;
    let filter = queryObject.filter;
    let sort = queryObject.sort;

    let tmp = this.data.slice();
    if (filter) {
      let props = Object.keys(filter);
      for (let prop of props) {
        if (Array.isArray(filter[prop])) {
          tmp = tmp.filter(obj => {
            if (typeof obj[prop] === 'object') {
              return filter[prop].includes(obj[prop].valueForFiltering);
            }
            return filter[prop].includes(obj[prop]);
          });
        } else {
          tmp = tmp.filter(obj => {
            if (typeof obj[prop] === 'object') {
              return filter[prop] === obj[prop].valueForFiltering;
            }
            return filter[prop] === obj[prop];
          });
        }
      }
    }

    if (sort) {
      // currently supports sorting by only one field
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
      data: tmp.slice(start, (start + limit)),
      totalCount: tmp.length
    };
  }

  function getValueFacetsForOneProp(arr, prop) {
    let m = new Map();
    for (let obj of arr) {
      let v = obj[prop];
      if (typeof v === "object") {
        v = v["valueForFaceting"];
      }
      let c = m.get(v);
      if (c === undefined) {
        m.set(v, 1);
      } else {
        m.set(v, c + 1);
      }
    }
    let res = [];
    for (let [k, v] of m) {
      res.push({
        facetType: "value",
        facetValue: k,
        count: v
      });
    }
    res.sort((a, b) => {
      if (a.count > b.count) {
        return -1;
      }
      if (a.count < b.count) {
        return 1;
      }
      return a.facetValue > b.facetValue ? -1 : 1;
    });
    return res;
  }

  const getValueFacets = function (data, facets) {
    let res = [];
    for (let facet of facets) {
      let obj = {name: facet};
      obj.facets = getValueFacetsForOneProp(data, facet);
      res.push(obj);
    }
    return res;
  };

  /**
   * compare two objects, return true if they are equal in value
   * e.g. {a: 3, b: 4} equals {b: 4, a: 3}
   * @param obj1
   * @param obj2
   * @returns {boolean}
   */
  function cmp(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    }
    if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2)) {
      return false;
    }
    // below is handled in the first check
    // if (typeof obj1 !== "object") {
    //     return obj1 === obj2;
    // }
    // if (obj1 === null && obj2 === null) {
    //     return true;
    // }
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let key of keys1) {
      let v1 = obj1[key];
      let v2 = obj2[key];
      if (Object.prototype.toString.call(v1) !== Object.prototype.toString.call(v2)) {
        return false;
      }
      if (typeof v1 === "object") {
        let t = cmp(v1, v2);
        if (!t) {
          return false;
        }
      } else {
        if (v1 !== v2) {
          return false;
        }
      }
    }
    return true;
  }
  function assertQueryObject(obj1, obj2) {
    return cmp(obj1.sort, obj2.sort) && cmp(obj1.filter, obj2.filter)
  }

  const maxRowsPerPage = 200;
  const series = [
    5 * maxRowsPerPage,
    4 * maxRowsPerPage,
    3 * maxRowsPerPage,
    2 * maxRowsPerPage,
    maxRowsPerPage,
  ];

  class DataManager {
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

  class StateManager {
    constructor() {
      this.rowsPerPage = 10;
      this.currentPageNumber = 1;
      this.sort = {};
      this.filter = {}; // only name and value of the selected ones
      this.filterStatus = {}; // contains all info (name, value, type, selected) of all faceting
    }

    // analyzing the filterStatus object to update the filter
    extractFilter() {
      let tmp = {};
      let colNames = Object.keys(this.filterStatus);
      for (let colName of colNames) {
        let arr = this.filterStatus[colName].filter(d => d.selected);
        if (arr.length > 0) {
          tmp[colName] = arr.map(d => d.facetValue);
        }
      }
      this.filter = tmp;
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
    },
  };

  function formatterPool(type) {
    return pool[type];
  }

  /**
   * Show status on the top of the table
   * @param id: the _targetId of DataTable instance
   * @param status: <Object> {type: 'progress|success|error'(required), message: <String> (optional)>}
   */
  function notifyStatus(id, status) {
    let ns = document.getElementById(id + '-notification-section');
    let msgs = ns.getElementsByClassName('message-bar');
    switch (status.type) {
      case 'progress':
        ns.classList.add('progress-active');
        ns.classList.remove('error-active', 'alert-active');
        break;
      case 'error':
        ns.classList.add('error-active');
        ns.classList.remove('alert-active', 'progress-active');
        msgs[0].innerText = status.message;
        break;
      case 'alert':
        ns.classList.add('alert-active');
        ns.classList.remove('error-active', 'progress-active');
        msgs[1].innerText = status.message;
        break;
      case 'success':
        ns.classList.remove('progress-active');
        ns.classList.remove('error-active', 'alert-active');
        break;
      default:
        ns.classList.remove('progress-active');
        ns.classList.remove('error-active', 'alert-active');
    }
  }

  // convert JSON to CSV, TSV, etc.
  // don't support nested object
  function jsonToXSV(arr, delimiter = ",") {
    if (!Array.isArray(arr)) {
      throw new TypeError('an array of objects expected');
    }
    if (arr.length === 0) {
      return '';
    }
    let cols = Object.keys(arr[0]);
    let cols_sanitized = cols.map(s => {
      if (s.includes(delimiter)) {
        return `"${s}"`;
      }
      return s;
    });
    let res = cols_sanitized.join(delimiter) + '\n';
    for (let obj of arr) {
      let line = cols.map(p => obj[p]);
      line = line.map(s => {
        if (s.includes(delimiter)) {
          return `"${s}"`;
        }
        return s;
      });
      res += line.join(delimiter) + '\n';
    }
    return res;
  }

  // stringify any types of data
  function stringify(d) {
    switch (typeof d) {
      case 'number':
        return d + '';
      case 'string':
        return d;
      case 'boolean':
        return d + '';
      case 'object':
        if (Array.isArray(d)) {
          return d.join(', ');
        }
        if (d === null) {
          return 'N/A';
        }
        return JSON.stringify(d);
      default:
        return 'N/A';
    }
  }

  function updateTableView(datatable, dataToShow, totalPages) {
    // check formatter
    for (let colName of datatable._columnSetting.shownColumns) {
      if (datatable._columnSetting.colModel[colName].formatter) {
        if (typeof datatable._columnSetting.colModel[colName].formatter === 'string') {
          if (!formatterPool((datatable._columnSetting.colModel[colName].formatter))) {
            throw new Error('formatter not recognized');
          } else {
            datatable._columnSetting.colModel[colName].formatter = formatterPool(
              (datatable._columnSetting.colModel[colName].formatter));
          }
        } else if (typeof datatable._columnSetting.colModel[colName].formatter === 'function') ; else {
          throw new Error('Invalid formatter for ' + colName);
        }
      }
    }

    if (typeof datatable._targetId !== 'string' || !datatable._targetId) {
      throw new Error('an element id expected');
    }
    let table = document.getElementById(datatable._targetId + '-table-section');
    if (!table) {
      throw new Error('failed to locate the table');
    }

    // delete tBody
    let tBody = table.getElementsByTagName('tbody')[0];
    tBody._data = null;
    table.removeChild(tBody);

    // re-generate the tbody up to date
    let df = document.createDocumentFragment();
    tBody = df.appendChild(document.createElement("tbody"));
    tBody._data = dataToShow;

    for (let i = 0; i < dataToShow.length; i++) {
      let rowData = dataToShow[i];
      let tr = tBody.appendChild(document.createElement('tr'));

      switch (datatable._configuration.firstColumnType) {
        case 'number':
          let baseIndex = datatable._stateManager.getStart() + 1;
          let td_i = tr.appendChild(document.createElement('td'));
          td_i.innerText = baseIndex + i;
          td_i.classList.add('table-row-index-column');
          break;
        case 'checkbox':
          let td_c = tr.appendChild(document.createElement('td'));
          td_c.classList.add('table-row-index-column', 'table-row-checkbox-column');
          break;
      }
      for (let name of datatable._columnSetting.shownColumns) {
        let td = tr.appendChild(document.createElement('td'));
        if (datatable._columnSetting.colModel[name].formatter) {
          let v = datatable._columnSetting.colModel[name].formatter(rowData[name]);
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
          td.innerText = stringify(rowData[name]);
        }
        if (datatable._columnSetting.colModel[name].align) {
          td.style.textAlign = datatable._columnSetting.colModel[name].align;
        }
      }
    }

    // attach the new tbody to table
    table.appendChild(df);

    // update current page number and total page number
    // Below is necessary and indispensable!
    if (datatable._configuration.pagination) {
      let cPage = document.getElementById(datatable._targetId + '-table-page-number-current');
      cPage.value = datatable._stateManager.currentPageNumber;
      cPage.setAttribute('aria-label', 'current page is ' + cPage.value);
      let tPages = document.getElementById(datatable._targetId + '-table-page-number-total');
      tPages.value = totalPages;
      tPages.setAttribute('aria-label', `all ${totalPages} pages`);
    }
  }

  // create or update the Filter section
  function createFilterSection(datatable) {
    let filterSection = document.getElementById(datatable._targetId + '-filter-section');
    if (!filterSection) {
      throw new Error('Creating filter section failed.');
    }

    while (filterSection.lastChild) {
      filterSection.removeChild(filterSection.lastChild);
    }

    let filterNames = Object.keys(datatable._stateManager.filterStatus);
    if (filterNames.length === 0) {
      console.error('No filters found.');
      return;
    }

    let btns = document.getElementById(datatable._targetId + '-filter-viz-download-buttons-wrapper');

    // create filter button
    if (btns.getElementsByClassName('filter-section-control-button').length === 0) {
      let fBtn = btns.insertBefore(document.createElement('div'), btns.firstElementChild);
      fBtn.classList.add('table-top-button', 'filter-section-control-button');
      fBtn.appendChild(document.createTextNode('Filters'));
      fBtn.setAttribute('role', 'button');
      fBtn.setAttribute('aria-label', 'filter button');
      fBtn.addEventListener('click', function () {
        document.getElementById(datatable._targetId).classList.toggle('filter-section-active');
      });
      fBtn.classList.add('filter-ready-signal');
      setTimeout(function () {
        fBtn.classList.remove('filter-ready-signal');
      }, 2000);
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
      td.appendChild(document.createTextNode(datatable._columnSetting.colModel[filterName].label
        ? datatable._columnSetting.colModel[filterName].label : filterName));
      // reuse td variable below
      td = row.appendChild(document.createElement('td'));
      td.classList.add('filter-values');
      td.classList.add('unfold-fold-fold');

      for (let i = 0; i < datatable._stateManager.filterStatus[filterName].length; i++) {
        let obj = datatable._stateManager.filterStatus[filterName][i];
        let span = td.appendChild(document.createElement('span'));
        span.classList.add('filter-value');
        if (i > 9) {
          span.classList.add('filter-value-hidden');
        }

        let inp = span.appendChild(document.createElement('input'));
        inp.type = 'checkbox';
        let uid = `${datatable._targetId}-filter-value-${filterName}-value-${i}`;
        inp.id = uid;

        inp.counterpart = obj;
        inp.addEventListener('change', function () {
          this.counterpart.selected = this.checked;
          datatable._filterData();
        });

        let label = span.appendChild(document.createElement('label'));
        label.setAttribute('for', uid);
        label.appendChild(document.createTextNode(`${obj.facetValue} (${obj.count})`));

        if (i > datatable._configuration.maxNumOfFacets - 1) {
          let info = td.appendChild(document.createElement('span'));
          info.classList.add('filter-value-hidden');
          info.classList.add('filter-value-overflow-message');
          info.innerText = '(showing the first 50 items only)';
          datatable._notifyStatus({
            type: 'alert',
            message: `Too many facets, only a partial list is shown in the Filter section`,
          });
          break;
        }
      }
      if (datatable._stateManager.filterStatus[filterName].length > 10) {
        let ctrl = td.appendChild(document.createElement('span'));
        ctrl.classList.add('unfold-fold-ctrl');
        ctrl.addEventListener('click', function (evt) {
          evt.target.parentNode.classList.toggle('unfold-fold-fold');
        });
      }
    }
    filterSection.appendChild(df);
  }

  // generate all table related panels,
  // can be used to refresh the whole object
  function generateTable(datatable) {
    // replace the table with a div element
    let target = document.getElementById(datatable._targetId);
    let div = document.createElement('div');
    target.parentNode.insertBefore(div, target);
    target.parentNode.removeChild(target);
    div.id = datatable._targetId;
    div.classList.add(datatable._uid, datatable._configuration.scheme);

    // set ARIA attribute
    div.setAttribute('role', 'table');

    // create the contents of the new object
    let container = document.createDocumentFragment();

    // create control buttons, i.e. search box, filter button, download button
    let sbPanel = container.appendChild(document.createElement('div'));
    sbPanel.classList.add('search-bar-panel');

    if (datatable._configuration.search) {
      let searchBar = sbPanel.appendChild(document.createElement('div'));
      searchBar.id = datatable._targetId + '-search-bar';
      searchBar.classList.add('search-bar-wrapper');

      let sb = searchBar.appendChild(document.createElement('input'));
      sb.type = 'search';
      sb.id = datatable._targetId + '-search-box';
      sb.classList.add('search-box');
      sb.setAttribute('aria-label', 'search box');
      sb.addEventListener('focus', function () {
        this.parentElement.classList.remove('search-hints-active');
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
        this.parentElement.classList.add('search-hints-active');
      });

      let hintWrapper = searchBar.appendChild(document.createElement('div'));
      hintWrapper.classList.add('search-hints-wrapper');
      hintWrapper.setAttribute('role', 'table');
      let hint = hintWrapper.appendChild(document.createElement('p'));
      hint.innerText = `Syntax: "column name":[[operator] value] [AND | OR] ["column name"[:[operator]value]]`;
      hint.setAttribute('role', 'row');
      let example = hintWrapper.appendChild(document.createElement('p'));
      example.appendChild(document.createTextNode('e.g. '));
      example.appendChild(document.createElement('span')).appendChild(document.createTextNode('"length": > 120'));
      example.appendChild(document.createElement('span')).appendChild(document.createTextNode(';'));
      example.appendChild(document.createElement('span')).appendChild(document.createTextNode('"height": 80 AND "width": 100'));
      example.setAttribute('role', 'row');
    }

    let btns = container.appendChild(document.createElement('div'));
    btns.id = datatable._targetId + '-filter-viz-download-buttons-wrapper';
    btns.classList.add('filter-viz-download-buttons-wrapper');

    if (datatable._configuration.layout.chart) {
      let vBtn = btns.appendChild(document.createElement('div'));
      vBtn.classList.add('table-top-button');
      vBtn.classList.add('viz-section-control-button');
      vBtn.appendChild(document.createTextNode('Visualize'));
      vBtn.addEventListener('click', function () {
        document.getElementById(datatable._targetId).classList.toggle('viz-section-active');
      });
    }

    if (datatable._configuration.layout.download) {
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
        inp.id = datatable._targetId + '-data-table-download-type-option-' + type;
        inp.classList.add('data-table-download-type-option');
        // inp.checked = type === 'CSV';
        inp.name = 'data-table-download-type';
        span.appendChild(inp);
        let label = document.createElement('label');
        label.classList.add('data-table-download-type-option-label');
        label.appendChild(document.createTextNode(type));
        label.htmlFor = 'data-table-download-type-option ' + type;

        label.addEventListener('click', () => {
          // console.log('download type selected');
          let a = document.createElement('a');
          a.setAttribute('download', datatable._configuration.fileName + '.' + type.toLowerCase());

          // use urlForDownloading as the first choice
          if (datatable._configuration.urlForDownloading) {
            let url = `${datatable._configuration.urlForDownloading}&type=${type.toLowerCase()}`;
            let fields = datatable._configuration.columnsToDownload
              ? datatable._configuration.columnsToDownload
              : datatable._columnSetting.shownColumns;
            for (let field of fields) {
              url += `&field=${field}`;
            }
            let qo = datatable._stateManager.queryObject();
            if (qo.filter) {
              let filters = Object.keys(qo.filter);
              if (filters.length > 0) {
                for (let filter of filters) {
                  let arr = qo.filter[filter];
                  for (let v of arr) {
                    url += `&filter=${filter}_._${v}`;
                  }
                }
              }
            }
            let keys = Object.keys(qo.sort);
            if (keys.length) {
              url += `&sort=${keys[0]}_._${qo.sort[keys[0]]}`;
            }
            // console.log(url);
            a.setAttribute('href', url);
          } else if (datatable._dataManager.dataIsComplete && datatable._configuration.dataToDownload) {
            let str;
            switch (type) {
              case 'CSV':
                str = jsonToXSV(datatable._configuration.dataToDownload, ',');
                break;
              case 'TSV':
                str = jsonToXSV(datatable._configuration.dataToDownload, '\t');
                break;
              case 'JSON':
                str = JSON.stringify(datatable._configuration.dataToDownload);
                break;
            }
            a.setAttribute('href', `data:text/${type.toLowerCase()};charset=utf-8,${encodeURIComponent(str)}`);
          } else {
            a.addEventListener('click', () => {
              alert('Sorry, the data is not ready for downloading.');
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
    }

    // create filter panel
    let filterSection = container.appendChild(document.createElement('div'));
    filterSection.id = datatable._targetId + '-filter-section';
    filterSection.classList.add('filter-section');

    // create visualization panel
    let vizSection = container.appendChild(document.createElement('div'));
    vizSection.id = datatable._targetId + '-visualization-section';
    vizSection.classList.add('visualization-section');

    // create notification panel
    let notifySection = container.appendChild(document.createElement('div'));
    notifySection.id = datatable._targetId + '-notification-section';
    notifySection.classList.add('notification-section');
    let progressBar = notifySection.appendChild(document.createElement('div'));
    progressBar.classList.add('progress-bar');
    let dotWrapper = progressBar.appendChild(document.createElement('div'));
    dotWrapper.classList.add('progress-dot-wrapper');
    for (let i = 0; i < 3; i++) {
      let sp = dotWrapper.appendChild(document.createElement('span'));
      sp.classList.add('progress-dot');
      sp.classList.add(`dot-num-${i + 1}`);
    }
    let errorBar = notifySection.appendChild(document.createElement('div'));
    errorBar.classList.add('error-message');
    errorBar.classList.add('message-bar');
    let alertBar = notifySection.appendChild(document.createElement('div'));
    alertBar.classList.add('alert-message');
    alertBar.classList.add('message-bar');

    // create table panel
    let table = container.appendChild(document.createElement('table'));
    table.id = datatable._targetId + '-table-section';
    table.classList.add('table-section');

    // add caption to the table
    table.appendChild(document.createElement('caption')).appendChild(document.createTextNode(datatable._configuration.caption));

    // create table header
    // Since the header is supposed not to update, create it once
    let head = table.appendChild(document.createElement('thead')).appendChild(document.createElement('tr'));
    head.classList.add('table-header-row');
    // set sticky header
    if (datatable._configuration.stickyHeader) {
      head.classList.add("sticky-header");
    }

    switch (datatable._configuration.firstColumnType) {
      case 'number':
        let firstCol_i = head.appendChild(document.createElement('th'));
        firstCol_i.innerHTML = '#';
        firstCol_i.classList.add('table-row-index-column');
        firstCol_i.style.width = ((datatable._dataManager.cache.totalCount + '').length) * 6 + 24 + 'px';
        break;
      case 'checkbox':
        let firstCol_c = head.appendChild(document.createElement('input'));
        firstCol_c.setAttribute('type', 'checkbox');
        firstCol_c.classList.add('table-row-index-column');
        firstCol_c.style.width = '24px';
        break;
    }

    for (let name of datatable._columnSetting.shownColumns) {
      let th = head.appendChild(document.createElement('th'));
      // set the content of th
      let sp = th.appendChild(document.createElement('span'));
      sp.classList.add('table-row-regular-column-name');
      sp.appendChild(document.createTextNode(datatable._columnSetting.colModel[name].label));
      sp.setAttribute('aria-label', datatable._columnSetting.colModel[name].label);
      let model = datatable._columnSetting.colModel[name];
      // set width
      if (model.width) {
        th.style.width = model.width;
      }
      // create tooltips
      if (model.tips) {
        let tip = th.appendChild(document.createElement('span'));
        tip.classList.add('tooltiptext');
        tip.setAttribute('aria-label', model.tips);
        let t = tip.appendChild(document.createElement('span'));
        t.innerHTML = model.tips;
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

        up.addEventListener('click', function () {
          let ctrls = head.getElementsByClassName('table-sorting-control');
          for (let i = 0, n = ctrls.length; i < n; i++) {
            ctrls[i].classList.remove('table-sorting-control-active');
          }
          up.classList.add('table-sorting-control-active');
          datatable._sortOnColumn(up._colName, 1);
        });

        let down = control.appendChild(document.createElement('i'));
        down.classList.add('table-sorting-control', 'table-sorting-down-control');
        down._colName = name;
        down.setAttribute('role', 'button');
        down.setAttribute('aria-label', 'sort in descending order');

        down.addEventListener('click', function () {
          let ctrls = head.getElementsByClassName('table-sorting-control');
          for (let i = 0, n = ctrls.length; i < n; i++) {
            ctrls[i].classList.remove('table-sorting-control-active');
          }
          down.classList.add('table-sorting-control-active');
          datatable._sortOnColumn(down._colName, -1);
        });
      }
    }

    //create tBody
    table.appendChild(document.createElement('tbody'));

    if (datatable._configuration.pagination) {
      // create page controller panel
      let pager = container.appendChild(document.createElement('div'));
      pager.id = datatable._targetId + '-pager-section';
      pager.classList.add('table-page-control-container');

      // create number of rows per page selector
      let a = pager.appendChild(document.createElement('div'));
      a.classList.add('table-rows-per-page-control-container');
      let rpp = a.appendChild(document.createElement('label'));
      rpp.appendChild(document.createTextNode('Rows per page:'));
      let num = a.appendChild(document.createElement('select'));
      num.id = datatable._targetId + '-table-row-number-selector';
      rpp.setAttribute('for', num.id);
      num.classList.add('table-row-number-selector');
      num.setAttribute('aria-label', `showing ${datatable._stateManager.rowsPerPage} rows per page`);
      let arr = [5, 10, 20, 50, 100, 200];
      for (let i of arr) {
        num.appendChild(document.createElement('option')).appendChild(document.createTextNode(i + ''));
      }

      num.selectedIndex = arr.indexOf(datatable._stateManager.rowsPerPage);
      num.addEventListener('change', function () {
        this.setAttribute('aria-label', `showing ${this.value} rows per page`);
        datatable._updateRowsPerPage(+this.value);
      });

      // page selector candidate
      let c = pager.appendChild(document.createElement('div'));
      c.classList.add('table-page-number-control-container');
      // last page button
      let minusOneBtn = c.appendChild(document.createElement('div'));
      minusOneBtn.classList.add('table-page-number-control-block', 'table-page-number-minus-one');
      minusOneBtn.setAttribute('role', 'button');
      minusOneBtn.setAttribute('aria-label', 'last page');

      minusOneBtn.addEventListener('click', function () {
        datatable._setPageNumber(datatable._stateManager.currentPageNumber - 1);
      });


      // middle content
      let m = c.appendChild(document.createElement('div'));
      m.classList.add('table-page-number-current-container');
      let cPage = m.appendChild(document.createElement('label'));
      cPage.appendChild(document.createTextNode('Page'));
      let inp1 = m.appendChild(document.createElement('input'));
      inp1.type = 'text';
      inp1.id = datatable._targetId + '-table-page-number-current';
      cPage.setAttribute('for', inp1.id);
      inp1.setAttribute('aria-label', 'current page is 1');

      inp1.addEventListener('change', function () {
        let n = +this.value;
        if (isNaN(n)) {
          alert('Invalid page number!');
          return;
        }
        datatable._setPageNumber(n);
      });

      let tPages = m.appendChild(document.createElement('label'));
      tPages.appendChild(document.createTextNode('of'));
      let inp2 = m.appendChild(document.createElement('input'));
      inp2.type = 'text';
      inp2.id = datatable._targetId + '-table-page-number-total';
      tPages.setAttribute('for', inp2.id);
      inp2.classList.add('table-page-number-total');
      inp2.readonly = true;
      let t = datatable._totalPages();
      inp2.value = t;
      inp2.setAttribute('aria-label', `all ${t} pages`);

      // next page button
      let plusOneBtn = c.appendChild(document.createElement('div'));
      plusOneBtn.classList.add('table-page-number-control-block');
      plusOneBtn.classList.add('table-page-number-plus-one');
      plusOneBtn.setAttribute('role', 'button');
      plusOneBtn.setAttribute('aria-label', 'next page');

      plusOneBtn.addEventListener('click', function () {
        datatable._setPageNumber(datatable._stateManager.currentPageNumber + 1);
      });
    } else {
      datatable._stateManager.rowsPerPage = datatable._dataManager.cache.totalCount;
    }

    // add the df to div
    div.appendChild(container);
    datatable._updateView().catch(err => {
      console.error(err);
    });
    if (datatable._configuration.layout.filter) {
      datatable._createFilterSection().catch(err => {
        console.error(err);
      });
    }
  }

  class DataTable {
    /******************************************************************************
     * To create an instance of DataTable class
     * @param arr: <Array>, array of data objects
     * @param targetId: <String>, the id of the table of placeholder
     * @param opts: <Object>, potential properties include:
     *
     * @returns {object}
     *******************************************************************************/
    constructor(arr, targetId, opts = {dataIsComplete: true}) {
      if (typeof targetId !== 'string' || !targetId) {
        throw new TypeError('target id should be a non-empty string');
      }
      this._targetId = targetId;
      this._dataManager = new DataManager(arr, opts);
      this._stateManager = new StateManager();

      this._columnSetting = createColModel(this._dataManager.data);

      this._configuration = {
        caption: '',
        maxNumOfFacets: 50,
        layout: {
          download: false,
          filter: false,
          chart: false,
          search: false,
          column_selector: false,
        },
        firstColumnType: undefined, // 'number', 'checkbox', 'custom'
        scheme: 'default',
        fileName: opts.fileName ? opts.fileName : 'data',
        urlForDownloading: opts.urlForDownloading,
        columnsToDownload: opts.columnsToDownload,
        dataToDownload: opts.dataToDownload,
        stickyHeader: opts.stickyHeader,
        pagination: opts.pagination === undefined || opts.pagination,
      };

      this._uid = 'my-1535567872393-product';
    }

    /*********************** Below are public methods for user to execute ***************************/

    /**
     * setRowsPerPage is used to set and update _rowsPerPage and _totalPages
     * @param n
     */
    setRowsPerPage(n) {
      if (typeof n !== 'number' || n < 0) {
        throw new Error('a natural number expected');
      }
      if ([5, 10, 20, 50, 100, 200].includes(n)) {
        this._stateManager.rowsPerPage = n;
        return;
      }
      throw `${n} is invalid`;
    }

    /**
     * formatter to create customized elements with the data,
     * the provided func should return an document element object or innerHTML
     * @param colName
     * @param func
     */
    setFormatter(colName, func) {
      if (typeof colName !== 'string' || !this._columnSetting.colModel[colName]) {
        throw new Error(`Column name ${colName} not recognized.`);
      }
      if (typeof func === 'string') {
        let f = formatterPool[func];
        if (!f) {
          throw new Error(`The formatter name ${func} not recognized.`);
        }
        this._columnSetting.colModel[colName].formatter = f;
        return;
      }
      if (typeof func === 'function') {
        this._columnSetting.colModel[colName].formatter = func;
        return;
      }
      throw new Error('A predefined formatter name or custom function expected.');
    }

    /**
     * customize a column to show
     * @param name: string, column name
     * @param obj: object, an object describing the column
     */
    configureColumn(name, obj) {
      if (!this._columnSetting.colModel[name]) {
        throw new Error('Column name not recognized.');
      }
      if (typeof obj !== 'object') {
        throw new Error('An object describing the column expected.');
      }
      Object.assign(this._columnSetting.colModel[name], obj);
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
          this._configuration.layout.download = value;
          break;
        case 'FILTER':
          this._configuration.layout.filter = value;
          break;
        case 'CHART':
          this._configuration.layout.chart = value;
          break;
        case 'SEARCH':
          this._configuration.layout.search = value;
          break;
        case 'COLUMN_SELECTOR':
          this._configuration.layout.selectColumns = value;
          break;
        default:
          console.error('Property not recognized!');
          console.error('Expect: download | search | filter | chart | column_selector');
          return;
      }
      console.log('Configuration updated.');
    }

    /**
     * set the shown columns and hidden columns
     * @param arr: array of strings (column names)
     */
    setShownColumns(arr) {
      let tmp = [];
      for (let col of arr) {
        if (!this._columnSetting.allColumns.includes(col)) {
          throw 'invalid column name found when set shown columns';
        }
        tmp.push(col);
      }
      this._columnSetting.shownColumns = tmp;
      this._columnSetting.hiddenColumns = this._columnSetting.allColumns.filter(c => !tmp.includes(c));
    }

    /**
     * set a faceting column
     * @param colName
     * @param type, currently supporting value faceting only
     */
    addFilter(colName, type = "value") {
      if (!this._columnSetting.shownColumns.includes(colName)) {
        throw `the column name ${colName} is invalid`;
      }
      this._stateManager.filterStatus[colName] = [];
      this._configuration.layout.filter = true;
    }

    // set table caption
    setCaption(str) {
      if (typeof str === 'string' && str.length > 0) {
        this._configuration.caption = str;
      }
    }

    // set scheme of the table, currently only "default" is implemented
    setScheme(str) {
      this._configuration.scheme = str;
    }

    /**
     * set the type of the first column
     * @param type, <string>, number | checkbox | image | custom
     * @param elementDescriptor <object>, e.g. {tagName: 'div', className: 'my-class', text: 'some text'}
     */
    setFirstColumnType(type, elementDescriptor) {
      if (typeof type !== 'string') {
        throw new TypeError('a string expected to set the type of the first column');
      }
      switch (type.toLowerCase()) {
        case 'number':
          this._configuration.firstColumnType = 'number';
          break;
        case 'checkbox':
          this._configuration.firstColumnType = 'checkbox';
          break;
        case 'image':
          this._configuration.firstColumnType = 'image';
          if (elementDescriptor.tagName !== 'img') {
            throw new TypeError('an img element descriptor expected');
          }
          this._configuration.firstColumnFormatter = elementDescriptor.formatter;
          break;
        case 'custom':
          this._configuration.firstColumnType = 'custom';
          let t = document.createElement(elementDescriptor.tagName);
          if (Object.prototype.toString.call(t) === '[object HTMLUnknownElement]') {
            throw 'invalid tag name to create custom element';
          }
          this._configuration.firstColumnFormatter = elementDescriptor.formatter;
          break;
        default:
          throw new TypeError('valid types: number, checkbox, image, custom');
      }
    }

    /**
     * Users should execute this function to generate the table
     */
    generate() {
      generateTable(this);
    }

    /************************* Below are methods for internal use *****************************/
    /************************* and should not be invoked by user *****************************/

    /**
     * set this as a function to always get up-to-date value
     * @returns {number}
     * @private
     */
    _totalPages() {
      // if totalCount is 0, the totalPages will be 1, not 0
      // The reason that Math.floor() + 1 is used instead of Math.ceil() is Math.ceil(0) = 0
      // However, we expect to see total page 1 if there are no rows
      let n = Math.floor(this._dataManager.cache.totalCount / this._stateManager.rowsPerPage) + 1;
      if (isNaN(n)) {
        throw 'invalid total page number';
      }
      return n;
    }

    /**
     * update page number; then update the view
     * @param n
     * @private
     */
    _setPageNumber(n) {
      if (n < 1 || n > this._totalPages()) {
        alert('Page number out of range!');
        return;
      }
      this._stateManager.currentPageNumber = n;
      this._updateView().catch(err => {
        console.error(err.message);
      });
    }

    /**
     * update the number of rows to show on page
     * @private
     */
    _updateRowsPerPage(n) {
      this._stateManager.rowsPerPage = n;
      this._stateManager.currentPageNumber = 1;
      this._updateView().catch(err => {
        console.error(err.message);
      });
    }

    /**
     * sort on a given column
     * @param colName
     * @param n, 1 or -1
     * @private
     */
    _sortOnColumn(colName, n) {
      this._stateManager.sort = {};
      this._stateManager.sort[colName] = n;
      this._stateManager.currentPageNumber = 1;
      this._updateView().catch(err => {
        console.error(err.message);
      });
    }

    /**
     * filter the table
     * @private
     */
    _filterData() {
      this._stateManager.currentPageNumber = 1;
      this._updateView()
        .then(() => {
          let wrapper = document.getElementById(this._targetId + '-filter-viz-download-buttons-wrapper');
          if (Object.keys(this._stateManager.filter).length) {
            wrapper.classList.add('filter-active');
          } else {
            wrapper.classList.remove('filter-active');
          }
        })
        .catch(err => {
          console.error(err.message);
        });
    }

    /**
     * Add a column to the table to show
     * @param colName: string, can put as many as possible
     */
    _addColumn(...colName) {
      for (let name of colName) {
        if (!this._columnSetting.allColumns.includes(name)) {
          console.error(`invalid column name ${name} to add`);
          continue;
        }
        if (this._columnSetting.shownColumns.includes(name)) {
          console.error(`column name ${name} already in the shown list`);
          continue;
        }
        this._columnSetting.shownColumns.push(name);
        this._columnSetting.hiddenColumns.splice(this._columnSetting.hiddenColumns.indexOf(name), 1);
      }
    }

    /**
     * remove a present column in the table
     * @param colName
     */
    _removeColumn(...colName) {
      for (let name of colName) {
        let i = this._columnSetting.shownColumns.indexOf(name);
        if (i === -1) {
          console.error(`invalid column name ${name} to remove`);
          continue;
        }
        this._columnSetting.shownColumns.splice(i, 1);
        this._columnSetting.hiddenColumns.push(name);
      }
    }

    _notifyStatus(status) {
      notifyStatus(this._targetId, status);
    }

    /**
     * The most called function
     * @private
     */
    async _updateView() {
      let data = null;
      try {
        this._notifyStatus({
          type: 'progress',
          message: '',
        });
        let res = await this._dataManager.serve(this._stateManager.queryObject());
        data = res.data;
      } catch (err) {
        this._notifyStatus({
          type: 'error',
          message: 'failed to load data',
        });
        throw err;
      }

      try {
        let totalPages = this._totalPages();
        updateTableView(this, data, totalPages);
        this._notifyStatus({
          type: 'success',
          message: '',
        });
      } catch (err) {
        this._notifyStatus({
          type: 'error',
          message: 'failed to update the view',
        });
        throw err;
      }
    }

    /**
     * This should be an async function, which will not block the table rendering
     * @private
     */
    async _createFilterSection() {
      let facets = null;
      try {
        facets = await this._dataManager.serve({facets: Object.keys(this._stateManager.filterStatus)});
      } catch (err) {
        this._notifyStatus({
          type: 'error',
          message: 'failed to create the filter section',
        });
        throw err;
      }

      let tmp = {};
      for (let facet of facets) {
        tmp[facet.name] = facet.facets;
      }
      this._stateManager.filterStatus = tmp;

      try {
        createFilterSection(this);
      } catch (err) {
        throw err;
      }
    }
  }

  return DataTable;

}());

export default DataTable;