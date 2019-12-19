export default function createConfigPanel(datatable) {
  let df = document.createDocumentFragment();
  let configIcon = df.appendChild(document.createElement("div"));
  configIcon.classList.add("data-table-config-icon");
  configIcon.setAttribute('role', 'button');
  configIcon.setAttribute('aria-label', 'configuration button');
  for (let i = 0; i < 4; i++) {
    let c = configIcon.appendChild(document.createElement("div"));
    c.classList.add("config-icon-child");
  }
  configIcon.appendChild(document.createElement('div')).classList.add('data-table-config-icon-outer-circle');
  configIcon.appendChild(document.createElement('div')).classList.add('data-table-config-icon-inner-circle');

  let configPanel = df.appendChild(document.createElement('div'));
  configPanel.classList.add("data-table-config-panel");


  return df;
}