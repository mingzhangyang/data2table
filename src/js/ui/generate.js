import createDownloadForm from './createDownloadForm.js';
import createConfigPanel from './createConfigPanel.js';
import createNotificationBar from './createNotificationBar.js';
import createSearchPanel from './createSearchPanel.js';
import createPaginationPanel from './createPaginationPanel.js';
import createTableFrame from './createTableFrame.js';

// generate all table related panels,
// can be used to refresh the whole object
export default function generateTable(datatable) {
  // replace the table with a div element
  let target = document.getElementById(datatable._targetId);
  let div = document.createElement('div');
  target.parentNode.insertBefore(div, target);
  target.parentNode.removeChild(target);
  div.id = datatable._targetId;
  div.classList.add(datatable._uid, datatable._configuration.scheme);

  // set ARIA attribute
  div.setAttribute('role', 'table');

  // create the contents of the new object
  let container = document.createDocumentFragment();

  // create control buttons, i.e. search box, filter button, download button
  let sbPanel = container.appendChild(document.createElement('div'));
  sbPanel.classList.add('search-bar-panel');

  if (datatable._configuration.search) {
    sbPanel.appendChild(createSearchPanel(datatable));
  }

  let btns = container.appendChild(document.createElement('div'));
  btns.id = datatable._targetId + '-filter-viz-download-buttons-wrapper';
  btns.classList.add('filter-viz-download-buttons-wrapper');

  btns.appendChild(createConfigPanel(datatable));

  if (datatable._configuration.layout.chart) {
    let vBtn = btns.appendChild(document.createElement('div'));
    vBtn.classList.add('table-top-button');
    vBtn.classList.add('viz-section-control-button');
    vBtn.appendChild(document.createTextNode('Visualize'));
    vBtn.addEventListener('click', function() {
      document.getElementById(datatable._targetId).classList.toggle('viz-section-active');
    });
  }

  if (datatable._configuration.layout.download) {
    btns.appendChild(createDownloadForm(datatable));
  }

  // create filter panel
  let filterSection = container.appendChild(document.createElement('div'));
  filterSection.id = datatable._targetId + '-filter-section';
  filterSection.classList.add('filter-section');

  // create visualization panel
  let vizSection = container.appendChild(document.createElement('div'));
  vizSection.id = datatable._targetId + '-visualization-section';
  vizSection.classList.add('visualization-section');

  // create notification panel
  container.appendChild(createNotificationBar(datatable));

  // create table panel
  container.appendChild(createTableFrame(datatable));

  // create pagination panel
  if (datatable._configuration.pagination) {
    container.appendChild(createPaginationPanel(datatable));
  } else {
    datatable._stateManager.rowsPerPage = datatable._dataManager.cache.totalCount;
  }

  // add the df to div
  div.appendChild(container);
  datatable._updateView().catch(err => {
    console.error(err);
  });

  if (datatable._configuration.layout.filter) {
    datatable._createFilterSection().catch(err => {
      console.error(err);
    });
  }
}

 
 