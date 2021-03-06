import {test} from "./test.js";
import {sample} from './sample.js';
import DataTable from '../src/js/datatable.js';

window.onload = () => {
  let dt = new DataTable(sample, 'test-table', {
    caption: '',
    dataIsComplete: true,
    downloadFileName: 'data2table.test',
    dataToDownload: sample,
  });
  dt.setFirstColumnType('number');
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
  dt.configureLayout('download', true);
  dt.generate();
};




