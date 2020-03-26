export default function createConfigPanel(datatable) {
  let df = document.createDocumentFragment();
  let configIcon = df.appendChild(document.createElement('div'));
  configIcon.classList.add('data-table-config-icon');
  configIcon.setAttribute('role', 'button');
  configIcon.setAttribute('aria-label', 'configuration button');
  for (let i = 0; i < 4; i++) {
    let c = configIcon.appendChild(document.createElement('div'));
    c.classList.add('config-icon-child');
  }
  configIcon.appendChild(document.createElement('div')).classList.add('data-table-config-icon-outer-circle');
  configIcon.appendChild(document.createElement('div')).classList.add('data-table-config-icon-inner-circle');

  configIcon.addEventListener('click', () => {
    document.getElementById(datatable._targetId).getElementsByClassName('data-table-config-panel')[0].classList.add(
      'active');
  });

  let configPanel = df.appendChild(document.createElement('div'));
  configPanel.classList.add('data-table-config-panel');

  let content = configPanel.appendChild(document.createElement('div'));
  content.classList.add('data-table-config-panel-content');

  let header = content.appendChild(document.createElement('div'));
  header.classList.add('data-table-config-panel-header');

  let cols = header.appendChild(document.createElement('span'));
  cols.setAttribute('role', 'button');
  cols.setAttribute('aria-label', 'select columns to show');
  cols.appendChild(document.createTextNode('Columns'));
  cols.classList.add('selected');
  cols.getData = () => {
    return {
      name: 'columns',
      all: datatable._columnSetting.allColumns,
      selected: datatable._columnSetting.shownColumns,
    };
  };
  cols.addEventListener('click', switchState);
  setTimeout(() => {
    header.nextElementSibling.update(cols.getData());
  }, 1000);

  let scheme = header.appendChild(document.createElement('span'));
  scheme.setAttribute('role', 'button');
  scheme.setAttribute('aria-label', 'select color scheme');
  scheme.appendChild(document.createTextNode('Style'));
  scheme.getData = () => {
    return {
      name: 'scheme',
      all: datatable._configuration.schemes,
      selected: [datatable._configuration.scheme],
    };
  };
  scheme.addEventListener('click', switchState);

  let body = content.appendChild(document.createElement('div'));
  body.classList.add('data-table-config-panel-body');
  body.update = update;
  body.pullData = pullData;

  let btns = content.appendChild(document.createElement('div'));
  btns.classList.add('data-table-config-panel-confirm-button-wrapper');

  let cancel = btns.appendChild(document.createElement('span'));
  cancel.setAttribute('role', 'button');
  cancel.setAttribute('arial-label', 'cancel');
  cancel.classList.add('data-table-config-panel-confirm-button');
  cancel.appendChild(document.createTextNode('Cancel'));
  cancel.addEventListener('click', () => {
    document.getElementById(datatable._targetId).getElementsByClassName('data-table-config-panel')[0].classList.remove(
      'active');
  });

  let save = btns.appendChild(document.createElement('span'));
  save.setAttribute('role', 'button');
  save.setAttribute('arial-label', 'save');
  save.classList.add('data-table-config-panel-confirm-button');
  save.appendChild(document.createTextNode('Save'));
  save.addEventListener('click', () => {
    document.getElementById(datatable._targetId).getElementsByClassName('data-table-config-panel')[0].classList.remove(
      'active');
    let d = body.pullData();
    switch (d.name) {
      case "columns":
        datatable._columnSetting.setShownColumns(d.selected);
        datatable._updateWholeTableView();
        break;
      case "scheme":
        let oldScheme = datatable._configuration.scheme;
        datatable._configuration.scheme = d.selected[0];
        let div = document.getElementById(datatable._targetId);
        div.classList.remove(oldScheme);
        div.classList.add(datatable._configuration.scheme);
        break;
      default:
        console.log("What?");
    }
  });

  return df;
}

function switchState() {
  if (this.classList.contains('selected')) {
    return;
  }
  this.classList.add('selected');
  let ch = this.parentElement.firstElementChild;
  while (ch) {
    if (ch !== this) {
      ch.classList.remove('selected');
    }
    ch = ch.nextElementSibling;
  }
  let data = this.getData();
  this.parentElement.nextElementSibling.update(data);
}

function update(data) {
  let body = this;
  while (body.lastElementChild) {
    body.removeChild(body.lastElementChild);
  }
  body.data = data;
  for (let i = 0; i < data.all.length; i++) {
    let d = data.all[i];
    let sp = body.appendChild(document.createElement('span'));
    sp.classList.add('data-table-config-selection-unit');
    let inp = sp.appendChild(document.createElement('input'));
    inp.setAttribute('name', data.name);
    let id = "config-panel-label";
    switch (data.name) {
      case 'scheme':
        inp.setAttribute('type', 'radio');
        id += 'scheme-item-' + i;
        break;
      case 'columns':
        inp.setAttribute('type', 'checkbox');
        id += 'column-item-' + i;
        break;
      default:
        console.log('what?');
    }
    inp.setAttribute('value', d);
    inp.checked = data.selected.includes(d);
    inp.setAttribute("id", id);
    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.appendChild(document.createTextNode(d));
    sp.appendChild(label);
  }
}

function pullData() {
  let body = this;
  let res = {
    name: body.data.name,
    selected: [],
  };
  let c = body.firstChild;
  while (c) {
    if (c.firstChild.checked) {
      res.selected.push(c.firstChild.value);
    }
    c = c.nextSibling;
  }
  return res;
}