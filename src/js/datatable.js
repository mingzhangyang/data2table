/**
 * Created by yangm11 on 11/14/2019.
 */

import createColModel from './utils/colModel.js';
import DataManager from './data/dataManager.js';
import StateManager from './state/stateManager.js';
import formatterPool from './utils/formatterPool.js';
import notifyStatus from './methods/notify.js';
import updateView from './methods/updateView.js';
import createFilterSection from './methods/createFilterSection.js';
import generateTable from './methods/generate.js';

export default class DataTable {
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
        console.log('Property not recognized!');
        console.log('Expect: download | search | filter | chart | column_selector');
        return;
    }
    console.log('Configuration updated.');
  }

  /**
   * set the shown columns and hidden columns
   * @param arr
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

  generate() {
    generateTable(this);
  }

  /************************* Below are methods for internal use *****************************/

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
      updateView(this, data, totalPages);
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