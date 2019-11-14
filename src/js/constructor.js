/**
 * Created by yangm11 on 11/14/2019.
 */

import createColModel from './support/colModel.js';
import DataManager from './data/dataManager.js';
 
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
   * @returns {object}
   *******************************************************************************/
  constructor(arr, targetId, opts={dataIsComplete: true}) {
    if (typeof targetId !== 'string' || !targetId) {
      throw new TypeError('target id should be a non-empty string');
    }

    this._dataManager = new DataManager(arr, opts);



    // below are properties required to create and update table
    this._originalData = arr;



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

    let colModel = createColModel(this._originalData);
    this._colModel = colModel.colModel;
    this.shownColumns = colModel.shownColumns;

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
      caption: '',
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
}