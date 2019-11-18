// generate all table related panels,
// can be used to refresh the whole object
export default function generate() {
  // replace the table with a div element
  let target = document.getElementById(this._targetId);
  let div = document.createElement('div');
  target.parentNode.insertBefore(div, target);
  target.parentNode.removeChild(target);
  div.id = this._targetId;
  div.classList.add(this._uid);
  div.classList.add(this._colorSchemes[this.configuration.colorScheme]);
  // set ARIA attribute
  div.setAttribute('role', 'table');

  // create the contents of the new object
  let container = document.createDocumentFragment();
  let that = this;

  // create control buttons, i.e. search box, filter button, download button
  let sbPanel = container.appendChild(document.createElement('div'));
  sbPanel.classList.add('search-bar-panel');

  if (this.configuration.searchBar) {
    let searchBar = sbPanel.appendChild(document.createElement('div'));
    searchBar.id = this._targetId + '-search-bar';
    searchBar.classList.add('search-bar-wrapper');

    let sb = searchBar.appendChild(document.createElement('input'));
    sb.type = 'search';
    sb.id = this._targetId + '-search-box';
    sb.classList.add('search-box');
    sb.setAttribute('aria-label', 'search box');
    sb.addEventListener('focus', function () {
      searchBar.classList.remove('search-hints-active');
    });

    let lb = searchBar.appendChild(document.createElement('label'));
    lb.htmlFor = sb.id;
    lb.classList.add('label-for-search-box');
    lb.setAttribute('role', 'button');
    lb.setAttribute('aria-label', 'search button');
    lb.appendChild(document.createTextNode('Search'));

    let sp = searchBar.appendChild(document.createElement('span'));
    sp.classList.add('question-mark');
    sp.setAttribute('role', 'button');
    sp.setAttribute('aria-label', 'hints for search syntax');
    sp.addEventListener('click', function () {
      searchBar.classList.add('search-hints-active');
    });

    let hintWrapper = searchBar.appendChild(document.createElement('div'));
    hintWrapper.classList.add('search-hints-wrapper');
    hintWrapper.setAttribute('role', 'table');
    let hint = hintWrapper.appendChild(document.createElement('p'));
    hint.innerText = `Syntax: "column name":[[operator] value] [AND | OR] ["column name"[:[operator]value]]`;
    hint.setAttribute('role', 'row');
    let example = hintWrapper.appendChild(document.createElement('p'));
    example.appendChild(document.createTextNode('e.g. '));
    example.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('"length": > 120'));
    example.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode(';'));
    example.appendChild(document.createElement('span'))
    .appendChild(document.createTextNode('"height": 80 AND "width": 100'));
    example.setAttribute('role', 'row');
  }

  let btns = container.appendChild(document.createElement('div'));
  btns.id = this._targetId + '-filter-viz-download-buttons-wrapper';
  btns.classList.add('filter-viz-download-buttons-wrapper');

  if (this.configuration.filterButton) {
    let fBtn = btns.appendChild(document.createElement('div'));
    fBtn.classList.add('table-top-button');
    fBtn.classList.add('filter-section-control-button');
    fBtn.appendChild(document.createTextNode('Filters'));
    fBtn.setAttribute('role', 'button');
    fBtn.setAttribute('aria-label', 'filter button');
    fBtn.addEventListener('click', function () {
      document.getElementById(that._targetId).classList.toggle('filter-section-active');
    });
  }

  if (this.configuration.vizButton) {
    let vBtn = btns.appendChild(document.createElement('div'));
    vBtn.classList.add('table-top-button');
    vBtn.classList.add('viz-section-control-button');
    vBtn.appendChild(document.createTextNode('Visualize'));
    vBtn.addEventListener('click', function () {
      document.getElementById(that._targetId).classList.toggle('viz-section-active');
    });
  }

  if (this.configuration.downloadButton) {
    let that = this;
    let dBtn = btns.appendChild(document.createElement('div'));
    dBtn.classList.add('table-top-button');
    dBtn.classList.add('download-control-button');
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
      inp.id = this._targetId + '-data-table-download-type-option-' + type;
      inp.classList.add('data-table-download-type-option');
      // inp.checked = type === 'CSV';
      inp.name = 'data-table-download-type';
      span.appendChild(inp);
      let label = document.createElement('label');
      label.classList.add('data-table-download-type-option-label');
      label.appendChild(document.createTextNode(type));
      label.htmlFor = 'data-table-download-type-option ' + type;

      label.addEventListener('click', () => {
        console.log('download type selected');
        // console.log(type);
        // need to be done
        let a = document.createElement('a');
        a.setAttribute('download', that.opts.downloadFileName + '.' + type.toLowerCase());

        // use urlForDownloading as the first choice
        if (that.opts.urlForDownloading) {
          let url = `${that.opts.urlForDownloading}&type=${type.toLowerCase()}`;
//            let fields = that.opts.columnsToDownload ? that.opts.columnsToDownload : that.shownColumns;
//            for (let field of fields) {
//              url += `&field=${field}`;
//            }
          if (that.filterSetting) {
            let filters = Object.keys(that.filterSetting);
            if (filters.length > 0) {
              for (let filter of filters) {
                let arr = that.filterSetting[filter];
                for (let v of arr) {
                  url += `&filter=${filter}_._${v}`;
                }
              }
            }
          }
          // Should below be disabled due to a bug on server-side cgi?
//            if (that.sortSetting) {
//              url += `&sort=${that.sortSetting.name}_._${that.sortSetting.order}`;
//            }
          // console.log(url);
          a.setAttribute('href', url);
        } else if (that.opts.dataIsComplete && that.opts.dataToDownload) {
          let str;
          switch (type) {
            case 'CSV':
              str = DataTable.convert(that.opts.dataToDownload, ',');
              break;
            case 'TSV':
              str = DataTable.convert(that.opts.dataToDownload, '\t');
              break;
            case 'JSON':
              str = JSON.stringify(that.opts.dataToDownload);
              break;
            default:
          }
          a.setAttribute('href', `data:text/${type.toLowerCase()};charset=utf-8,${encodeURIComponent(str)}`);
        } else {
          a.addEventListener('click', () => {
            alert("Sorry, the data is not ready for downloading.");
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
  }


  // create filter panel
  let filterSection = container.appendChild(document.createElement('div'));
  filterSection.id = this._targetId + '-filter-section';
  filterSection.classList.add('filter-section');

  // create visualization panel
  let vizSection = container.appendChild(document.createElement('div'));
  vizSection.id = this._targetId + '-visualization-section';
  vizSection.classList.add('visualization-section');

  // create notification panel
  let notifySection = container.appendChild(document.createElement('div'));
  notifySection.id = this._targetId + '-notification-section';
  notifySection.classList.add('notification-section');
  let progressBar = notifySection.appendChild(document.createElement('div'));
  progressBar.classList.add('progress-bar');
  let dotWrapper = progressBar.appendChild(document.createElement('div'));
  dotWrapper.classList.add('progress-dot-wrapper');
  for (let i = 0; i < 3; i++) {
    let sp = dotWrapper.appendChild(document.createElement('span'));
    sp.classList.add('progress-dot');
    sp.classList.add(`dot-num-${i+1}`);
  }
  let errorBar = notifySection.appendChild(document.createElement('div'));
  errorBar.classList.add('error-message');
  errorBar.classList.add('message-bar');
  let alertBar = notifySection.appendChild(document.createElement('div'));
  alertBar.classList.add('alert-message');
  alertBar.classList.add('message-bar');

  // create table panel
  let table = container.appendChild(document.createElement('table'));
  table.id = this._targetId + '-table-section';
  table.classList.add('table-section');

  // add caption to the table
  table.appendChild(document.createElement('caption'))
  .appendChild(document.createTextNode(this.configuration.caption));

  // create table header
  // Since the header is supposed not to update, create it once
  let head = table.appendChild(document.createElement('thead'))
  .appendChild(document.createElement('tr'));
  head.classList.add('table-header-row');

  if (this._firstColumnAsRowNumber) {
    let firstCol = head.appendChild(document.createElement('th'));
    firstCol.innerHTML = '#';
    firstCol.classList.add('table-row-index-column');
    firstCol.style.width = ((this._totalRows + '').length) * 15 + 'px';
  }
  for (let name of this.shownColumns) {
    let th = head.appendChild(document.createElement('th'));
    let sp = th.appendChild(document.createElement('span'));
    sp.classList.add('table-row-regular-column-name');
    sp.appendChild(document.createTextNode(this._colModel[name].label));
    sp.setAttribute('aria-label', this._colModel[name].label);
    let model = this._colModel[name];
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
      up.classList.add('table-sorting-control');
      up.classList.add('table-sorting-up-control');
      up._colName = name;
      up.setAttribute('role', 'button');
      up.setAttribute('aria-label', 'sort in ascending order');

      up.addEventListener('click', function() {
        let ctrls = head.getElementsByClassName('table-sorting-control');
        for (let i = 0, n = ctrls.length; i < n; i++) {
          ctrls[i].classList.remove('table-sorting-control-active');
        }
        up.classList.add('table-sorting-control-active');
        that._sort(up._colName, 1);
      });

      let down = control.appendChild(document.createElement('i'));
      down.classList.add('table-sorting-control');
      down.classList.add('table-sorting-down-control');
      down._colName = name;
      down.setAttribute('role', 'button');
      down.setAttribute('aria-label', 'sort in descending order');

      down.addEventListener('click', function() {
        let ctrls = head.getElementsByClassName('table-sorting-control');
        for (let i = 0, n = ctrls.length; i < n; i++) {
          ctrls[i].classList.remove('table-sorting-control-active');
        }
        down.classList.add('table-sorting-control-active');
        that._sort(down._colName, -1);
      });
    }
  }

  //create tBody
  table.appendChild(document.createElement('tbody'));

  // create page controller panel
  let pager = container.appendChild(document.createElement('div'));
  pager.id = this._targetId + '-pager-section';
  pager.classList.add('table-page-control-container');

  // create number of rows per page selector
  let a = pager.appendChild(document.createElement('div'));
  a.classList.add('table-rows-per-page-control-container');
  let rpp = a.appendChild(document.createElement('label'));
  rpp.appendChild(document.createTextNode('Rows per page:'));
  let num = a.appendChild(document.createElement('select'));
  num.id = this._targetId + '-table-row-number-selector';
  rpp.setAttribute('for', num.id);
  num.classList.add('table-row-number-selector');
  num.setAttribute('aria-label', `showing ${this._rowsPerPage} rows per page`);
  let arr = [5, 10, 20, 50, 100, 200];
  for (let i of arr) {
    num.appendChild(document.createElement('option'))
    .appendChild(document.createTextNode(i+''));
  }
  // num.value = this._rowsPerPage;
  num.selectedIndex = arr.indexOf(this._rowsPerPage);
  num.addEventListener('change', function() {
    num.setAttribute('aria-label', `showing ${this.value} rows per page`);
    // setRowsPerPage will update both the _rowsPerPage and _totalPages
    that.setRowsPerPage(+this.value);

    // Below is not strict. The filterSetting and sortSetting may be set.
    // It is not safe to reset to originalData.
    // A safe means is just _checkPageNumber(1), which can handle it.
    that._checkPageNumber(1);

    // Below is redundant??? YES!!!
    // that._changePageByUser = false;
    // setTimeout(function () {
    //   that._changePageByUser = true;
    // }, 1000);
  });

  // page selector candidate
  let c = pager.appendChild(document.createElement('div'));
  c.classList.add('table-page-number-control-container');
  // last page button
  let minusOneBtn = c.appendChild(document.createElement('div'));
  minusOneBtn.classList.add('table-page-number-control-block');
  minusOneBtn.classList.add('table-page-number-minus-one');
  minusOneBtn.setAttribute('role', 'button');
  minusOneBtn.setAttribute('aria-label', 'last page');

  minusOneBtn.addEventListener('click', function() {
    if (that._pageNumberInAll > 1) {
      let v = that._pageNumberInAll - 1;
      that._checkPageNumber(v);
    }
  });


  // middle content
  let m = c.appendChild(document.createElement('div'));
  m.classList.add('table-page-number-current-container');
  let cPage = m.appendChild(document.createElement('label'));
  cPage.appendChild(document.createTextNode('Page'));
  let inp1 = m.appendChild(document.createElement('input'));
  inp1.type = 'text';
  inp1.id = this._targetId + '-table-page-number-current';
  cPage.setAttribute('for', inp1.id);
  inp1.setAttribute('aria-label', 'current page is 1');

  inp1.addEventListener('change', function() {
    let n = +this.value;
    if (isNaN(n)) {
      alert('invalid page number!');
      this.value = that._pageNumberInAll;
      return;
    }
    if (n < 1 || n > that._totalPages) {
      alert('page number out of range');
      this.value = that._pageNumberInAll;
      return;
    }
    that._checkPageNumber(+this.value);
  });

  let tPages = m.appendChild(document.createElement('label'));
  tPages.appendChild(document.createTextNode('of'));
  let inp2 = m.appendChild(document.createElement('input'));
  inp2.type = 'text';
  inp2.id = this._targetId + '-table-page-number-total';
  tPages.setAttribute('for', inp2.id);
  inp2.classList.add('table-page-number-total');
  inp2.readonly = true;
  inp2.value = this._totalPages;
  inp2.setAttribute('aria-label', `all ${this._totalPages} pages`);

  // next page button
  let plusOneBtn = c.appendChild(document.createElement('div'));
  plusOneBtn.classList.add('table-page-number-control-block');
  plusOneBtn.classList.add('table-page-number-plus-one');
  plusOneBtn.setAttribute('role', 'button');
  plusOneBtn.setAttribute('aria-label', 'next page');

  plusOneBtn.addEventListener('click', function() {
    if (that._pageNumberInAll < that._totalPages) {
      let v = that._pageNumberInAll + 1;
      that._checkPageNumber(v);
    }
  });

  // add the df to div
  div.appendChild(container);
  this._updateTableView();
  this._attachListeners();
  if (this.configuration.filterButton) {
    this.createFilterSection();
  }
}

 
 