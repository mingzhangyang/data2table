export default function createPaginationPanel(datatable) {
  // create page controller panel
  let pager = document.createElement('div');
  pager.id = datatable._targetId + '-pager-section';
  pager.classList.add('table-page-control-container');

  // create number of rows per page selector
  let a = pager.appendChild(document.createElement('div'));
  a.classList.add('table-rows-per-page-control-container');
  let rpp = a.appendChild(document.createElement('label'));
  rpp.appendChild(document.createTextNode('Rows per page:'));
  let num = a.appendChild(document.createElement('select'));
  num.id = datatable._targetId + '-table-row-number-selector';
  rpp.setAttribute('for', num.id);
  num.classList.add('table-row-number-selector');
  num.setAttribute('aria-label', `showing ${datatable._stateManager.rowsPerPage} rows per page`);
  let arr = [5, 10, 20, 50, 100, 200];
  for (let i of arr) {
    num.appendChild(document.createElement('option')).appendChild(document.createTextNode(i + ''));
  }

  num.selectedIndex = arr.indexOf(datatable._stateManager.rowsPerPage);
  num.addEventListener('change', function () {
    this.setAttribute('aria-label', `showing ${this.value} rows per page`);
    datatable._updateRowsPerPage(+this.value);
  });

  // page selector candidate
  let c = pager.appendChild(document.createElement('div'));
  c.classList.add('table-page-number-control-container');
  // last page button
  let minusOneBtn = c.appendChild(document.createElement('div'));
  minusOneBtn.classList.add('table-page-number-control-block', 'table-page-number-minus-one');
  minusOneBtn.setAttribute('role', 'button');
  minusOneBtn.setAttribute('aria-label', 'last page');

  minusOneBtn.addEventListener('click', function () {
    datatable._setPageNumber(datatable._stateManager.currentPageNumber - 1);
  });


  // middle content
  let m = c.appendChild(document.createElement('div'));
  m.classList.add('table-page-number-current-container');
  let cPage = m.appendChild(document.createElement('label'));
  cPage.appendChild(document.createTextNode('Page'));
  let inp1 = m.appendChild(document.createElement('input'));
  inp1.type = 'text';
  inp1.id = datatable._targetId + '-table-page-number-current';
  cPage.setAttribute('for', inp1.id);
  inp1.setAttribute('aria-label', 'current page is 1');

  inp1.addEventListener('change', function () {
    let n = +this.value;
    if (isNaN(n)) {
      alert('Invalid page number!');
      return;
    }
    datatable._setPageNumber(n);
  });

  let tPages = m.appendChild(document.createElement('label'));
  tPages.appendChild(document.createTextNode('of'));
  let inp2 = m.appendChild(document.createElement('input'));
  inp2.type = 'text';
  inp2.id = datatable._targetId + '-table-page-number-total';
  tPages.setAttribute('for', inp2.id);
  inp2.classList.add('table-page-number-total');
  inp2.readonly = true;
  let t = datatable._totalPages();
  inp2.value = t;
  inp2.setAttribute('aria-label', `all ${t} pages`);

  // next page button
  let plusOneBtn = c.appendChild(document.createElement('div'));
  plusOneBtn.classList.add('table-page-number-control-block');
  plusOneBtn.classList.add('table-page-number-plus-one');
  plusOneBtn.setAttribute('role', 'button');
  plusOneBtn.setAttribute('aria-label', 'next page');

  plusOneBtn.addEventListener('click', function () {
    datatable._setPageNumber(datatable._stateManager.currentPageNumber + 1);
  });

  return pager;
}