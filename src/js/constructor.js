/**
 * Created by yangm11 on 11/14/2019.
 */

import createColModel from './support/colModel.js';
import DataManager from './data/dataManager.js';
import updateData from './methods/updateData.js';
 
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
        visualize: false,
        search: false
      },
      firstColumnType: undefined, // 'number', 'checkbox', 'custom'
      scheme: 'default'
    };

    this._uid = 'my-1535567872393-product';

    // below are methods
    this._updateData = updateData.bind(this);

  }
}