/**
 * Created by yangm11 on 11/14/2019.
 */

import createColModel from './utils/colModel.js';
import DataManager from './data/dataManager.js';
import formatterPool from './utils/formatterPool.js';
 
class DataTable {
  /******************************************************************************
   * To create an instance of DataTable class
   * @param arr: <Array>, array of data objects
   * @param targetId: <String>, the id of the table of placeholder
   * @param opts: <Object>, potential properties include:
   *
   * @returns {object}
   *******************************************************************************/
  constructor(arr, targetId, opts={dataIsComplete: true}) {
    if (typeof targetId !== 'string' || !targetId) {
      throw new TypeError('target id should be a non-empty string');
    }
    this._targetId = targetId;
    this._dataManager = new DataManager(arr, opts);
    this._stateManager = new StateManager();

    let colModel = createColModel(this._originalData);
    this._colModel = colModel.colModel;
    this.shownColumns = colModel.shownColumns;

    this._dataToShow = this._dataManager.cache.data.slice(0, this._stateManager.rowsPerPage);
    this._totalPages = Math.ceil(this._dataManager.cache.totalCount / this._stateManager.rowsPerPage);

    this.configuration = {
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
      scheme: 'default'
    };

    this._uid = 'my-1535567872393-product';
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
      let f = formatterPool[func];
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
        this.configuration.layout.download = value;
        break;
      case 'FILTER':
        this.configuration.layout.filter = value;
        break;
      case 'CHART':
        this.configuration.layout.chart = value;
        break;
      case 'SEARCH':
        this.configuration.layout.search = value;
        break;
      case 'COLUMN_SELECTOR':
        this.configuration.layout.selectColumns = value;
        break;
      default:
        console.log('Property not recognized!');
        console.log('Expect: download | search | filter | chart | column_selector');
        return;
    }
    console.log('Configuration updated.');
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

  // set table caption
  setCaption(str) {
    if (typeof str === 'string' && str.length > 0) {
      this.configuration.caption = str;
    }
  }


  /************************* Below are internal methods *****************************/

  _updateData() {
    let data = this._dataManager.serve(this._stateManager.queryObject());
    this._dataToShow = data.data;
    this._totalPages = Math.ceil(data.totalCount / this._stateManager.rowsPerPage);
  }
}