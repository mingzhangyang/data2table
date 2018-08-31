/**
 * Created by yangm11 on 8/31/2018.
 */
'use strict';

function splitLineB(s, sep) {
  sep = sep || ',';
  var elem = '';
  var quo = 0;
  var array = [];

  for (var i = 0; i < s.length; i++) {
    if (s[i] === '"') {
      if (quo === 0) {
        quo++;
      } else {
        quo--;
      }
    }
    if (s[i] === sep) {
      if (quo === 0) {
        array.push(elem);
        elem = '';
        continue;
      }
    }
    elem  += s[i];
  }
  array.push(elem);
  return array;
}

function csvString2JSON(str, delimiter, firstLineAsColName) {
  let arr = str.split('\n').map(line => line.trim());
  arr = arr.map(line => splitLineB(line, delimiter));
  let colNames = [];
  let num = 0;
  if (firstLineAsColName) {
    colNames = arr[0];
    num = 1;
  } else {
    for (let i = 0; i < arr[0].length; i++) {
      colNames.push(`Col #${i+1}`);
    }
  }
  let res = [];
  for (num; num < arr.length; num++) {
    let obj = {};
    for (let k = 0; k < colNames.length; k++) {
      obj[colNames[k]] = arr[num][k];
    }
    res.push(obj);
  }
  return res;
}

function jsonArrayToJsonObj(arr) {
  let colNames = [];
  for (let i = 0; i < arr[0].length; i++) {
    colNames.push(`Col #${i+1}`);
  }
  let res = [];
  for (let k = 0; k < arr.length; k++) {
    let obj = {};
    for (let h = 0; h < colNames.length; h++) {
      obj[colNames[h]] = arr[k][h];
    }
    res.push(obj);
  }
  return res;
}

function getData(url, targetId, prop) {
  fetch(url).then(res => {
    if (res.ok) {
      return res.text().then(text => {
        document.getElementById(targetId)[prop] = text;
      });
    }
    alert(`Failed with status code: ${res.status}`);
  }).catch(err => {
    alert('Fetching data failed:', err.message);
  });
}

if (typeof module !== 'undefined' && module.parent) {
  // Node environment, required as module
} else if (typeof window === 'object') {
  // Browser environment
} else {
  // Node environment, run directly
  // test code go here
}