import ColumnSetting from './utils/columnSetting.js';
import DataManager from './data/dataManager.js';
import StateManager from './state/stateManager.js';
import formatterPool from './utils/formatterPool.js';
import notifyStatus from './utils/notify.js';
import updateView from './ui/updateView.js';
import createFilterSection from './ui/createFilterSection.js';
import generateTable from './ui/generate.js';
import createTableSection from "./ui/createTableSection.js";
import CustomSet from './utils/set.js';

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

    this._columnSetting = new ColumnSetting(this._dataManager.data);

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
      uidName: "", // if firstColumnType is checkbox, this uidName is required
      scheme: 'default',
      schemes: ["default", "light", "dark"],
      fileName: opts.fileName ? opts.fileName : 'data',
      urlForDownloading: opts.urlForDownloading,
      columnsToDownload: opts.columnsToDownload,
      dataToDownload: opts.dataToDownload,
      stickyHeader: opts.stickyHeader,
      pagination: opts.pagination === undefined || opts.pagination,
    };

    this._selectedRows = null;

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
    this._columnSetting.configureColumn(name, obj);
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
    this._columnSetting.setShownColumns(arr);
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
        if (typeof elementDescriptor !== "object" || !elementDescriptor.uidName) {
          throw "a uid name is required when first column is checkbox";
        }
        this._configuration.firstColumnType = 'checkbox';
        this._configuration.uidName = elementDescriptor.uidName;
        this._selectedRows = new CustomSet(this._configuration.uidName);
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
    this._updateTableBodyView().catch(err => {
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
    this._updateTableBodyView().catch(err => {
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
    this._updateTableBodyView().catch(err => {
      console.error(err.message);
    });
  }

  /**
   * filter the table
   * @private
   */
  _filterData() {
    this._stateManager.currentPageNumber = 1;
    if (this._configuration.firstColumnType === "checkbox") {
      this._selectedRows = new CustomSet(this._configuration.uidName);
    }
    this._updateTableBodyView()
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

  _notifyStatus(status) {
    notifyStatus(this._targetId, status);
  }

  _updateCheckboxInHeader(dataToShow) {
    let ctrl = document.getElementById(`${this._targetId}-table-header-checkbox`);

    let m = 0;
    for (let d of dataToShow) {
      if (this._selectedRows.has(d)) {
        m++;
      }
    }

    switch (m) {
      case dataToShow.length:
        ctrl.classList.remove('partial');
        ctrl.checked = true;
        break;
      case 0:
        ctrl.classList.remove('partial');
        ctrl.checked = false;
        break;
      default:
        ctrl.classList.add('partial');
        ctrl.checked = false;
    }
  }

  /**
   * The most called function
   * @private
   */
  async _updateTableBodyView() {
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
   * This should be invoked internally to update both the thead and tbody view.
   * Use case: changing columns to show
   * @private
   */
  _updateWholeTableView() {
    let oldId = this._targetId + '-table-section';
    let oldTable = document.getElementById(oldId);
    oldTable.id = oldId + "-to-be-removed";
    let table = createTableSection(this);
    oldTable.parentNode.insertBefore(table, oldTable);
    oldTable.parentNode.removeChild(oldTable);
    this._updateTableBodyView().catch(err => {
      console.error(err);
    });
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