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
*******************************************************************************/

class DataTable {
  constructor(arr, targetId, caption) {
    if (!Array.isArray(arr)) {
      throw new Error('an array of objects expected');
    }
    if (Object.prototype.toString.call(arr[0]) !== '[object Object]') {
      throw new Error('an array of objects expected');
    }
    // if (typeof window === 'undefined') {
    //   throw new Error('Data Table only works in browser');
    // }

    // below are properties required to create and update table
    this._originalData = arr;
    this._data = arr.slice();
    this._targetId = targetId;
    this._rowsPerPage = 10;
    this._pageNumber = 1;
    this._totalPages = Math.ceil(this._data.length / this._rowsPerPage);

    this._changePageByUser = true;
    this._firstColumnAsRowNumber = true;

    // Create column model
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

    // below are properties required to configure the whole
    this._filters = {};
    this._charts = [];
    this._colorSchemes = {
      default: 'default-color-scheme'
    };
    this.configuration = {
      caption: typeof caption === 'string' ? caption : '',
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

  // reset source data after sorting or filtering
  resetData() {
    this._data = this._originalData.slice();
    this.updateTableView();
  }

  // set table caption
  setTableCaption(str) {
    if (typeof str === 'string' && str.length > 0) {
      this._tableCaption = str;
    }
  }

  // customized column names
  renameColumn(oldName, newName) {
    if (!this._colModel[oldName]) {
      throw 'Column name not recognized.';
    }
    this._colModel[oldName].label = newName;
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

  // formatter to create customized elements with the data
  // the provided func should return an document element object
  // or innerHTML
  setFormatter(colName, func) {
    if (typeof colName !== 'string' || !this._colModel[colName]) {
      throw new Error('Column name not recognized.');
    }
    if (typeof func === 'string') {
      let f = DataTable.formatterPool(func);
      if (!f) {
        throw new Error('The formatter name not recognized.');
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

  // internal method to set page number (starts from 1)
  setPageNumber(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('a natural number expected');
    }
    this._pageNumber = n;
  }

  // actually, this is a internal method, update the internal properties
  // _rowsPerPage and _totalPages
  setRowsPerPage(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('a natural number expected');
    }
    this._rowsPerPage = n;
    this._totalPages = Math.ceil(this._data.length / this._rowsPerPage);
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

  // if descending is omitted, sort in descending order by default
  sort(col, descending) {
    if (descending) {
      this._data.sort((x, y) => x[col] < y[col] ? 1 : -1);
    } else {
      this._data.sort((x, y) => x[col] < y[col] ? -1 : 1);
    }
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
   * @param colName: string, column names
   * @param type: string, value | range
   * @param dataObj: array | null, return by solr/ngram. If is null,
   * it will be computed locally
   * @param int: boolean, specify when using range facet, only use integer as
   * range boundaries
   */
  addFilter(colName, type, dataObj, int) {
    if (!this._colModel[colName]) {
      throw 'Column name not recognized. Please use the original column name' +
      ' but not the customized name.';
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
          let c = m.get(v);
          if (c === undefined) {
            m.set(v, 1);
          } else {
            m.set(v, c + 1);
          }
        }
        let arr = [];
        for (let [k, v] of m.entries()) {
          arr.push({
            facetType: 'value',
            facetValue: k,
            count: v
          });
        }
        this._filters[colName] = arr;
      }

      if (type === 'range') {
        // if type is range, the values of that column should be number
        if (typeof this._data[0][colName] !== 'number') {
          throw 'This column should be of type of number.';
        }
        this.sort(colName, false);
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
    }
    else if (typeof  dataObj === 'object' && dataObj[colName]) {
      // receive the dataObj returned by ngram/solr
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
   * @param scheme
   */
  changeColorScheme(scheme) {
    if (this._colorSchemes.indexOf(scheme) === -1) {
      throw new Error(scheme + ' not set.');
    }
    this.configuration.colorScheme = scheme;
  }

  // internal method, determine the range of data to show
  _updateDataToShow() {
    let res = [];
    let start = (this._pageNumber - 1) * this._rowsPerPage;
    for (let i = 0; i < this._rowsPerPage && start + i < this._data.length; i++) {
      res.push(this._data[start+i]);
    }
    this._dataToShow = res;
  }

  // update the table content
  updateTableView() {
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

    let startIndex = (this._pageNumber - 1) * this._rowsPerPage + 1;
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
    let btnPanle = container.appendChild(document.createElement('div'));
    btnPanle.classList.add('control-button-panel');

    if (this.configuration.searchBar) {
      let searchBar = btnPanle.appendChild(document.createElement('div'));
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
      let dBtn = btns.appendChild(document.createElement('div'));
      dBtn.classList.add('table-top-button', 'download-control-button');
      dBtn.appendChild(document.createTextNode('Download'));
      dBtn.setAttribute('role', 'button');
      dBtn.setAttribute('aria-label', 'download button');
      dBtn.addEventListener('click', function () {
        // control download options
      });
    }


    // create filter panel
    let filterSection = container.appendChild(document.createElement('div'));
    filterSection.id = this._targetId + '-filter-section';
    filterSection.classList.add('filter-section');

    // create visualization panel
    let vizSection = container.appendChild(document.createElement('div'));
    vizSection.id = this._targetId + '-visualization-section';
    vizSection.classList.add('visualization-section');

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
    }
    for (let name of this.shownColumns) {
      let th = head.appendChild(document.createElement('th'));
      th.appendChild(document.createTextNode(this._colModel[name].label));
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
      .appendChild(document.createTextNode(i));
    }
    num.value = 10;

    // page selector candidate
    let c = pager.appendChild(document.createElement('div'));
    c.classList.add('table-page-number-control-container');
    // last page button
    let minusOne = c.appendChild(document.createElement('div'));
    minusOne.classList.add('table-page-number-control', 'table-page-number-minus-one');
    minusOne.setAttribute('role', 'button');
    minusOne.setAttribute('aria-label', 'last page');

    // middle content
    let m = c.appendChild(document.createElement('div'));
    m.classList.add('table-page-number-current-container');
    m.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('Page'));
    let inp1 = m.appendChild(document.createElement('input'));
    inp1.id = 'table-page-number-current';
    inp1.value = this._pageNumber;
    m.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('of'));
    let inp2 = m.appendChild(document.createElement('input'));
    inp2.id = 'table-page-number-total';
    inp2.setAttribute('readonly', true);
    inp2.value = this._totalPages;

    // next page button
    let plusOne = c.appendChild(document.createElement('div'));
    plusOne.classList.add('table-page-number-control', 'table-page-number-plus-one');
    plusOne.setAttribute('role', 'button');
    plusOne.setAttribute('aria-label', 'next page');

    // add the df to div
    div.appendChild(container);
    this.updateTableView();
    this.attachListeners();
    if (this.configuration.filterButton) {
      this.createFilterSection();
    }
  }

  // attach event listeners to controller elements
  // Although it is better to add event listener as the element was created,
  // which you save the time searching the DOM tree to get the elements,
  // it is acceptable to add event listener after all the elements have been
  // created. Because there are only a few of elements to take care of.
  attachListeners() {
    let that = this;
    document.getElementById(this._targetId)
        .addEventListener('click', function (evt) {
            that.messageQueue.push({
              target: evt.target,
              //....
            });
    });

    let table = document.getElementById(this._targetId + '-table-section');
    if (!table) {
      throw new Error('failed to locate the table');
    }

    let pager = document.getElementById(this._targetId + '-pager-section');
    let rowPerPageSelector = pager.getElementsByTagName('select')[0];
    let currentPageArea = document.getElementById('table-page-number-current');
    let totalPageNumberArea = document.getElementById('table-page-number-total');

    // add event listener to up/down sort controls
    let sortingControls = document.getElementsByClassName('table-sorting-control');
    table.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('table-sorting-control')) {
        for (let ctrl of sortingControls) {
          ctrl.classList.remove('table-sorting-control-active');
        }
      }
      if (evt.target.classList.contains('table-sorting-up-control')) {
        let col = evt.target._colName;
        that.sort(col, false);
        evt.target.classList.add('table-sorting-control-active');
      } else if (evt.target.classList.contains('table-sorting-down-control')) {
        let col = evt.target._colName;
        that.sort(col, true);
        evt.target.classList.add('table-sorting-control-active');
      }
      that._pageNumber = 1;
      currentPageArea.value = 1;
      that.updateTableView();
    });

    // add event listener to page-number-control minus/plus icon using event
    // delegation
    pager.addEventListener('click', function (evt) {
      if (evt.target.classList.contains('table-page-number-minus-one')) {
        if (+currentPageArea.value > 1) {
          let v = +currentPageArea.value - 1;
          that._pageNumber = v;
          currentPageArea.value = v;
          that.updateTableView();
        }
      }
      if (evt.target.classList.contains('table-page-number-plus-one')) {
        if (+currentPageArea.value < that._totalPages) {
          let v = +currentPageArea.value + 1;
          that._pageNumber = v;
          currentPageArea.value = v;
          that.updateTableView();
        }
      }
    });

    // add event listener to number of rows per page selector
    rowPerPageSelector.addEventListener('change', function () {
      // update table view
      that.setRowsPerPage(+this.value);
      that.setPageNumber(1);
      that.updateTableView();

      // update pager
      currentPageArea.value = 1;
      totalPageNumberArea.value = that._totalPages;
      that._changePageByUser = false;
      setTimeout(function () {
        that._changePageByUser = true;
      }, 1000);
    });

    // add event listener to page selector
    currentPageArea.addEventListener('change', function () {
      let n = +this.value;
      if (isNaN(n)) {
        alert('invalid page number!');
        return;
      }
      if (n < 0 || n > that._totalPages) {
        alert('page number out of range');
        return;
      }
      if (that._changePageByUser) {
        that.setPageNumber(+this.value);
        that.updateTableView();
      }
    });
  }

  // create Filter section
  createFilterSection() {
    let that = this;
    let filterSection = document.getElementById(this._targetId + '-filter-section');
    if (!filterSection) {
      throw new Error('Creating filter section failed.')
    }

    let filterNames = Object.keys(this._filters);
    if (filterNames.length === 0) {
      throw new Error('No filters found.');
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
      td.appendChild(document.createTextNode(filterName));
      // reuse td variable below
      td = row.appendChild(document.createElement('td'));
      td.classList.add('filter-values');
      for (let obj of this._filters[filterName]) {
        let span = td.appendChild(document.createElement('span'));
        span.classList.add('filter-value');
        let inp = span.appendChild(document.createElement('input'));
        inp.type = 'checkbox';
        inp.facetType = obj.facetType;
        inp.facetValue = obj.facetValue;
        inp.count = obj.count;
        let label = span.appendChild(document.createElement('label'));
        label.appendChild(document.createTextNode(`${obj.facetValue} (${obj.count})`));
      }
    }
    filterSection.appendChild(df);

    // add event listener to input[type='checkbox'] elements
    
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

