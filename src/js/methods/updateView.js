/**
 * This is an internal method to update the table view.
 * It is mainly invoked by _sort | _filterData | _checkPageNumber to update the table
 * @private
 */
export default function updateTableView(dt) {
  // check formatter
  for (let colName of dt.shownColumns) {
    if (dt._colModel[colName].formatter) {
      if (typeof dt._colModel[colName].formatter === 'string') {
        if (!DataTable.formatterPool((dt._colModel[colName].formatter))) {
          throw new Error('formatter not recognized');
        } else {
          dt._colModel[colName].formatter = DataTable.formatterPool((dt._colModel[colName].formatter));
        }
      } else if (typeof dt._colModel[colName].formatter === 'function') {
        // do nothing
      } else {
        throw new Error('Invalid formatter for ' + colName);
      }
    }
  }

  if (typeof dt._targetId !== 'string' || !dt._targetId) {
    throw new Error('an element id expected');
  }
  let table = document.getElementById(dt._targetId + '-table-section');
  if (!table) {
    throw new Error('failed to locate the table');
  }

  // delete all the rows in tBody
  let tBody = table.getElementsByTagName('tbody')[0];
  while (tBody.lastChild) {
    tBody.removeChild(tBody.lastChild);
  }

  // _pageNumberInAll should be use below
  let startIndex = (dt._pageNumberInAll - 1) * dt._rowsPerPage + 1;
  let df = document.createDocumentFragment();
  for (let i = 0; i < dt._dataToShow.length; i++) {
    let row = dt._dataToShow[i];
    let tr = df.appendChild(document.createElement('tr'));
    if (dt._firstColumnAsRowNumber) {
      let td = tr.appendChild(document.createElement('td'));
      td.innerText = startIndex + i;
      td.classList.add('table-row-index-column');
    }
    for (let name of dt.shownColumns) {
      let td = tr.appendChild(document.createElement('td'));
      if (dt._colModel[name].formatter) {
        let v = dt._colModel[name].formatter(row[name]);
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
      if (dt._colModel[name].align) {
        td.style.textAlign = dt._colModel[name].align;
      }
    }
  }
  tBody.appendChild(df);

  // update current page number and total page number
  // Below is necessary and indispensable!
  let cPage = document.getElementById(dt._targetId + '-table-page-number-current');
  cPage.value = dt._pageNumberInAll;
  cPage.setAttribute('aria-label', 'current page is ' + cPage.value);
  let tPages = document.getElementById(dt._targetId + '-table-page-number-total');
  tPages.value = dt._totalPages;
  tPages.setAttribute('aria-label', `all ${dt._totalPages} pages`);
}


 
 