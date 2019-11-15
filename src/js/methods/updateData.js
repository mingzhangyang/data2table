export function updateData() {
  let data = this._dataManager.serve(this._stateManager.queryObject());
  this._dataToShow = data.data;
  this._totalPages = Math.ceil(data.totalCount / this._stateManager.rowsPerPage);
}


 
 