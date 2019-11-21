import {test} from "./test.js";
import {sample} from './sample.js';
import DataTable from '../src/js/datatable.js';

window.onload = () => {
  let dt = new DataTable(sample, 'test-table', {
    caption: '',
    dataIsComplete: true,
    downloadFileName: 'data2table.test',
    dataToDownload: sample,
    stickyHeader: true,
    pagination: false,
  });
  // dt.setCaption("DataTable Demo");
  dt.addFilter('Gene_symbol', 'value');
  dt.configureColumn('Aff_id', {
    label: 'uid',
    tips: 'unique identifier',
    sortable: true,
    width: '100px',
    align: 'center',
    formatter: 'highlight'
  });
  dt.configureColumn('Gene_symbol', {
    label: 'Gene Symbol',
    width: '100px',
    align: 'center'
  });
  dt.configureColumn('Gene_accession', {
    label: 'Accession',
    width: '120px',
    align: 'center',
  });
  dt.generate();
  // console.log(dt);
  // dt._dataManager.serve(dt._stateManager.queryObject).then(console.log).catch(err => err);
};



 
 