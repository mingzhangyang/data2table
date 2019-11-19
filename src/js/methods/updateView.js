import formatterPool from '../utils/formatterPool.js';
import {stringify} from '../utils/convert.js';

export default function updateTableView(datatable, dataToShow, totalPages) {
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
      } else if (typeof datatable._columnSetting.colModel[colName].formatter === 'function') {
        // do nothing
      } else {
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

  // delete all the rows in tBody
  let tBody = table.getElementsByTagName('tbody')[0];
  while (tBody.lastChild) {
    tBody.removeChild(tBody.lastChild);
  }

  // _stateManager.currentPageNumber should be use below
  let baseIndex = datatable._stateManager.getStart() + 1;
  let df = document.createDocumentFragment();
  for (let i = 0; i < dataToShow.length; i++) {
    let row = dataToShow[i];
    let tr = df.appendChild(document.createElement('tr'));
    switch (datatable._configuration.firstColumnType) {
      case 'number':
        let td = tr.appendChild(document.createElement('td'));
        td.innerText = baseIndex + i;
        td.classList.add('table-row-index-column');
        break;
      case 'checkbox':
        break;
      case 'image':
        break;
      case 'custom':
        break;
      default:
    }
    for (let name of datatable._columnSetting.shownColumns) {
      let td = tr.appendChild(document.createElement('td'));
      if (datatable._columnSetting.colModel[name].formatter) {
        let v = datatable._columnSetting.colModel[name].formatter(row[name]);
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
        td.innerText = stringify(row[name]);
      }
      if (datatable._columnSetting.colModel[name].align) {
        td.style.textAlign = datatable._columnSetting.colModel[name].align;
      }
    }
  }
  tBody.appendChild(df);

  // update current page number and total page number
  // Below is necessary and indispensable!
  let cPage = document.getElementById(datatable._targetId + '-table-page-number-current');
  cPage.value = datatable._stateManager.currentPageNumber;
  cPage.setAttribute('aria-label', 'current page is ' + cPage.value);
  let tPages = document.getElementById(datatable._targetId + '-table-page-number-total');
  tPages.value = totalPages;
  tPages.setAttribute('aria-label', `all ${totalPages} pages`);
}


 
 