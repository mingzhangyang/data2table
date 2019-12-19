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
    return  {
      all: datatable._columnSetting.allColumns,
      selected: datatable._columnSetting.shownColumns,
    };
  };
  cols.addEventListener('click', switchState);

  let scheme = header.appendChild(document.createElement('span'));
  scheme.setAttribute('role', 'button');
  scheme.setAttribute('aria-label', 'select color scheme');
  scheme.appendChild(document.createTextNode('Style'));
  scheme.getData = () => {
    return {
      all: datatable._configuration.schemes,
      selected: datatable._configuration.scheme,
    };
  };
  scheme.addEventListener('click', switchState);

  let body = content.appendChild(document.createElement("div"));
  body.classList.add("data-table-config-panel-body");

  let btns = content.appendChild(document.createElement("div"));
  btns.classList.add("data-table-config-panel-confirm-button-wrapper");

  let cancel = btns.appendChild(document.createElement("span"));
  cancel.setAttribute("role", "button");
  cancel.setAttribute("arial-label", "cancel");
  cancel.classList.add("data-table-config-panel-confirm-button");
  cancel.appendChild(document.createTextNode("Cancel"));

  let save = btns.appendChild(document.createElement("span"));
  save.setAttribute("role", "button");
  save.setAttribute("arial-label", "save");
  save.classList.add("data-table-config-panel-confirm-button");
  save.appendChild(document.createTextNode("Save"));

  return df;
}

function switchState() {
  if (this.classList.contains("selected")) {
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
  this.getData();
}
