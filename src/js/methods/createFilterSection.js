// create or update the Filter section
export default function createFilterSection(dt) {
  let that = dt;
  let filterSection = document.getElementById(dt._targetId + '-filter-section');
  if (!filterSection) {
    throw new Error('Creating filter section failed.')
  }

  while (filterSection.lastChild) {
    filterSection.removeChild(filterSection.lastChild);
  }

  let filterNames = Object.keys(dt._filters);
  if (filterNames.length === 0) {
    console.error('No filters found.');
    return;
  }

  let btns = document.getElementById(dt._targetId + '-filter-viz-download-buttons-wrapper');

  if (btns.getElementsByClassName('filter-section-control-button').length === 0) {
    let fBtn = btns.insertBefore(document.createElement('div'), btns.firstElementChild);
    fBtn.classList.add('table-top-button');
    fBtn.classList.add('filter-section-control-button');
    fBtn.appendChild(document.createTextNode('Filters'));
    fBtn.setAttribute('role', 'button');
    fBtn.setAttribute('aria-label', 'filter button');
    fBtn.addEventListener('click', function () {
      document.getElementById(that._targetId).classList.toggle('filter-section-active');
    });
    fBtn.classList.add('filter-ready-signal');
    setTimeout(function() {
      fBtn.classList.remove('filter-ready-signal');
    }, 2000);
  }

  let df = document.createDocumentFragment();

  let table = df.appendChild(document.createElement('table'));
  table.classList.add('filter-section-table');
  for (let filterName of filterNames) {
    let row = table.appendChild(document.createElement('tr'));
    row.classList.add('filter-section-row');
    row.filterName = filterName;
    let td = row.appendChild(document.createElement('td'));
    td.classList.add('filter-name');
    td.appendChild(document.createTextNode(dt._colModel[filterName].label ? dt._colModel[filterName].label : filterName));
    // reuse td variable below
    td = row.appendChild(document.createElement('td'));
    td.classList.add('filter-values');
    td.classList.add('unfold-fold-fold');
    for (let i = 0; i < dt._filters[filterName].length; i++) {
      let obj = dt._filters[filterName][i];
      let span = td.appendChild(document.createElement('span'));
      span.classList.add('filter-value');
      if (i > 9) {
        span.classList.add('filter-value-hidden');
      }

      let inp = span.appendChild(document.createElement('input'));
      inp.type = 'checkbox';
      let uid = `${that._targetId}-filter-value-${filterName}-value-${i}`;
      inp.id = uid;

      inp.counterpart = obj;
      inp.addEventListener('change', function() {
        dt.counterpart.selected = dt.checked;
        that._filterData();
      });
      let label = span.appendChild(document.createElement('label'));
      label.setAttribute('for', uid);
      label.appendChild(document.createTextNode(`${obj.facetValue} (${obj.count})`));

      if (i > dt.maxNumOfFacets - 1) {
        let info = td.appendChild(document.createElement('span'));
        info.classList.add('filter-value-hidden');
        info.classList.add('filter-value-overflow-message');
        info.innerText = "(showing the first 50 items only)";
//          dt._notifyStatus({
//            type: 'alert',
//            message: `Too many facets, only a partial list is shown in the Filter section`
//          });
        break;
      }
    }
    if (dt._filters[filterName].length > 10) {
      let ctrl = td.appendChild(document.createElement('span'));
      ctrl.classList.add('unfold-fold-ctrl');
      ctrl.addEventListener('click', function(evt) {
        evt.target.parentNode.classList.toggle('unfold-fold-fold');
      });
    }
  }
  filterSection.appendChild(df);
}

 
 