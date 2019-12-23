import {jsonToXSV} from '../utils/convert.js';

export default function createDownloadForm(datatable) {
  let dBtn = document.createElement('div');
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
          default:
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
  return dBtn;
}