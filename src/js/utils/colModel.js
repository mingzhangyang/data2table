/**
 * Created by yangm11 on 11/14/2019.
 */
'use strict';

const createColModel = (arr) => {
  // Create column model object
  let res = {};
  res.colModel = {};
  res.shownColumns = [];
  let s = new Set();
  for (let d of arr) {
    let keys = Object.keys(d);
    for (let key of keys) {
      s.add(key);
    }
  }
  for (let name of s) {
    res.colModel[name] = {
      name: name,
      label: name,
      tips: '',
      sortable: false,
      hidden: false, // redundant, use shownColumns to manage shown/hidden
      width: '',
      align: '',
      formatter: undefined, // must a function
    };
    res.shownColumns.push(name);
  }
  return res;
};

export default createColModel;