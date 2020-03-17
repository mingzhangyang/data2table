class ColumnSetting {
  constructor(arr) {
    this.colModel = {};
    this.allColumns = [];
    let s = new Set();
    for (let d of arr) {
      let keys = Object.keys(d);
      for (let key of keys) {
        s.add(key);
      }
    }
    for (let name of s) {
      this.colModel[name] = {
        name: name,
        label: name,
        tips: '',
        sortable: false,
        hidden: false,
        width: '',
        align: '',
        formatter: undefined, // must be a name in formatter pools or a function
      };
      this.allColumns.push(name);
    }
    this.shownColumns = this.allColumns.slice();
    this.hiddenColumns = [];
  }
  configureColumn(name, obj) {
    if (!this.colModel[name]) {
      throw new Error('Column name not recognized.');
    }
    if (typeof obj !== 'object') {
      throw new Error('An object describing the column expected.');
    }
    Object.assign(this.colModel[name], obj);
    if (this.colModel[name]["hidden"] || this.colModel[name]["shown"] === false) {
      let i = this.shownColumns.indexOf(name);
      if (i !== -1) {
        this.hiddenColumns.push(this.shownColumns.splice(i, 1)[0]);
      }
    }
  }
  setShownColumns(arr) {
    let tmp = [];
    for (let col of arr) {
      if (!this.allColumns.includes(col)) {
        throw 'invalid column name found when set shown columns';
      }
      tmp.push(col);
    }
    this.shownColumns = tmp;
    this.hiddenColumns = this.allColumns.filter(c => !tmp.includes(c));
  }
}

export default ColumnSetting;