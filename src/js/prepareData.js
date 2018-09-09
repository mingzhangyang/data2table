/**
 * Created by yangm11 on 8/31/2018.
 */
'use strict';

function splitLineB(s, sep) {
  sep = sep || ',';
  let elem = '';
  let quo = 0;
  let array = [];

  for (let i = 0; i < s.length; i++) {
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

/**
 * Flatten a nested object to get a flatten object
 * @param obj: object
 */
function flatten(obj) {
  if (typeof obj !== 'object' || obj === null) {
    throw new TypeError('an object expected');
  }
  let res = {};
  function worker(obj, path) {
    let keys = Object.keys(obj);
    for (let key of keys) {
      let value = obj[key];
      if (typeof value === 'object' && value !== null) {
        worker(value, path + '/' + key);
      } else {
        res[path + '/' + key] = value;
      }
    }
  }
  worker(obj, '');
  return res;
}

/**
 * statistics of the properties of an nested object.
 * This is required to create table headers with multiple rows
 * @param obj: object
 */
function propStat(obj) {
  if (typeof obj !== 'object' || obj === null) {
    throw new TypeError('an object expected');
  }
  // root stat object
  let root = {
    prop: '',
    depth: 0,
    children: [],
    maxDepth: 0
  };
  // below is the worker for recursion
  function worker(obj, parentStatObj) {
    let keys = Object.keys(obj);
    for (let key of keys) {
      let value = obj[key];
      if (typeof value === 'object' && value !== null) {
        let o = {
          prop: key,
          depth: parentStatObj.depth + 1,
          children: []
        };
        parentStatObj.children.push(o);
        worker(value, o);
      } else {
        parentStatObj.children.push({
          prop: key,
          depth: parentStatObj.depth + 1
        });
        if (parentStatObj.depth + 1 > root.maxDepth) {
          root.maxDepth = parentStatObj.depth + 1;
        }
      }
    }
  }
  worker(obj, root);

  // recursive function to count colSpan
  function count(obj) {
    if (!obj.children) {
      obj.colSpan = 1;
      obj.rowSpan = root.maxDepth - obj.depth + 1;
    } else {
      obj.colSpan = 0;
      for (let child of obj.children) {
        obj.colSpan += count(child);
      }
    }
    return obj.colSpan;
  }
  count(root);
  return root;
}

if (typeof module !== 'undefined' && module.parent) {
  // Node environment, required as module
} else if (typeof window === 'object') {
  // Browser environment
} else {
  // Node environment, run directly
  // test code go here

  let obj = {
    x: {
      a: {
        m: 3,
        n: 4
      },
      b: {
        p: 5,
        q: 6
      },
      c: [7, 8, 9]
    },
    y: {
      s: 'hello',
      w: 'world'
    },
    z: 'test'
  };

  console.log(flatten(obj));
  console.dir(propStat(obj), {colors: true, depth: null});
}