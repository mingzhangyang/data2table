export default function createTableFrame(datatable) {
  let frame = document.createElement("div");
  frame.classList.add("table-frame");

  let table = frame.appendChild(document.createElement('table'));
  table.id = datatable._targetId + '-table-section';
  table.classList.add('table-section');

  // add caption to the table
  table.appendChild(document.createElement('caption')).
    appendChild(document.createTextNode(datatable._configuration.caption));

  // create table header
  // Since the header is supposed not to update, create it once
  let head = table.appendChild(document.createElement('thead')).appendChild(document.createElement('tr'));

  head.classList.add('table-header-row');
  // set sticky header
  if (datatable._configuration.stickyHeader) {
    head.classList.add('sticky-header');
  }

  switch (datatable._configuration.firstColumnType) {
    case 'number':
      let firstCol_i = head.appendChild(document.createElement('th'));
      firstCol_i.innerHTML = '#';
      firstCol_i.classList.add('table-row-index-column');
      firstCol_i.style.width = ((datatable._dataManager.cache.totalCount + '').length) * 6 + 24 + 'px';
      break;
    case 'checkbox':
      let firstCol_c = head.appendChild(document.createElement('input'));
      firstCol_c.setAttribute('type', 'checkbox');
      firstCol_c.classList.add('table-row-index-column');
      firstCol_c.style.width = '24px';
      break;
    case 'image':
      break;
    case 'custom':
      break;
    default:
  }

  for (let name of datatable._columnSetting.shownColumns) {
    let th = head.appendChild(document.createElement('th'));
    // set the content of th
    let sp = th.appendChild(document.createElement('span'));
    sp.classList.add('table-row-regular-column-name');
    sp.appendChild(document.createTextNode(datatable._columnSetting.colModel[name].label));
    sp.setAttribute('aria-label', datatable._columnSetting.colModel[name].label);
    let model = datatable._columnSetting.colModel[name];
    // set width
    if (model.width) {
      th.style.width = model.width;
    }
    // create tooltips
    if (model.tips) {
      let tip = th.appendChild(document.createElement('span'));
      tip.classList.add('tooltiptext');
      tip.setAttribute('aria-label', model.tips);
      let t = tip.appendChild(document.createElement('span'));
      t.innerHTML = model.tips;
    }
    // create sorting icon if sortable
    if (model.sortable) {
      sp.classList.add('table-row-filter-column-name');
      let control = th.appendChild(document.createElement('div'));
      control.classList.add('table-sorting-control-container');
      control._colName = name;
      let up = control.appendChild(document.createElement('i'));
      up.classList.add('table-sorting-control', 'table-sorting-up-control');
      up._colName = name;
      up.setAttribute('role', 'button');
      up.setAttribute('aria-label', 'sort in ascending order');

      up.addEventListener('click', function() {
        let ctrls = head.getElementsByClassName('table-sorting-control');
        for (let i = 0, n = ctrls.length; i < n; i++) {
          ctrls[i].classList.remove('table-sorting-control-active');
        }
        up.classList.add('table-sorting-control-active');
        datatable._sortOnColumn(up._colName, 1);
      });

      let down = control.appendChild(document.createElement('i'));
      down.classList.add('table-sorting-control', 'table-sorting-down-control');
      down._colName = name;
      down.setAttribute('role', 'button');
      down.setAttribute('aria-label', 'sort in descending order');

      down.addEventListener('click', function() {
        let ctrls = head.getElementsByClassName('table-sorting-control');
        for (let i = 0, n = ctrls.length; i < n; i++) {
          ctrls[i].classList.remove('table-sorting-control-active');
        }
        down.classList.add('table-sorting-control-active');
        datatable._sortOnColumn(down._colName, -1);
      });
    }
  }

  // create tBody as placeholder for _updateTableBodyView to populate
  table.appendChild(document.createElement('tbody'));

  return frame;
}