# data2table
An easy way to display data on web

### Get

1. using npm ? Try the command below.

   `npm install my-data2table`       (not working yet)

2. Or your can download the source files manually

   `Download the files directly into your project directory`

3. or try CDN

   `not working yet`
   
### For development

1. `npm install --global gulp-cli`

2. `npm install`

3. `gulp build`

### Usage

1) import `data2table.core.js` and `data2table.core.css` into your HTML file

   ```
   <link rel="stylesheet" href="path/to/dataTable.core.css">
   <script src="path/to/dataTable.core.js"></script>
   ```

2) Put `<table id="your-name-it></table>`into the place where you want to show 
the table

3) Prepare your data as JSON array, i.e.

   ```javascript
      let exampleData = [
        {
          "Aff_id": "10377550",
          "Gene_accession": "NM_001127233",
          "Gene_symbol": "Trp53",
          "Gene_title": "transformation related protein 53"
        },
        {
          "Aff_id": "10374366",
          "Gene_accession": "NM_007912",
          "Gene_symbol": "Egfr",
          "Gene_title": "epidermal growth factor receptor"
        },
        {
          "Aff_id": "10375038",
          "Gene_accession": "NM_010822",
          "Gene_symbol": "Mpg",
          "Gene_title": "N-methylpurine-DNA glycosylase"
        },
        ...
      ];
   ```
   
3) Configure the table.

    ```javascript
    let dt = new DataTable(exampleData, 'you-name-it');
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
   ```

Please find the demo page [here](https://mingzhangyang.github.io/myBench/html/dataTable.html).

### Advanced

>create customized formatter

>change the layout

>customize the style
