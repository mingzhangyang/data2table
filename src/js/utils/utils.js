export function splitLineB(s, sep) {
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

export function csvString2JSON(str, delimiter, firstLineAsColName) {
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

export function jsonArrayToJsonObj(arr) {
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

/**
 * Flatten a nested object to get a flatten object
 * @param obj: object
 */
export function flatten(obj) {
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
 * analyze the paths of a flatten object
 * @param arr: array, the sorted keys of a flatten object
 * return an array of arrays instructing a table head with
 * colspan and rowspan
 */
export function analyzePaths(arr) {
  let a = arr.map(d => d.split('/').filter(d => d));
  let maxDepth = a.reduce((acc, d) => {
    return acc > d.length ? acc : d.length;
  }, 0);

  let tmp = new Array(maxDepth);
  for (let i = 0; i < maxDepth; i++) {
    tmp[i] = a.map(d => {
      let obj = {
        path: d.slice(0, i+1).join('/'),
        depth: i+1
      };
      if (d.length > i) {
        obj.prop = d[i];
      }
      return obj;
    });
  }

  // calculate rowSpan and mark the field to be removed
  for (let k = tmp.length - 2; k > -1; k--) {
    for (let h = 0; h < arr.length; h++) {
      if (tmp[k][h].path === tmp[k+1][h].path) {
        tmp[k][h].rowSpan = tmp[k+1][h].rowSpan ? tmp[k+1][h].rowSpan + 1 : 1 + 1;
        tmp[k+1][h].toBeDeleted = true;
      }
    }
  }

  let res = new Array(maxDepth);

  // calculate the colSpan and delete the fields to be removed
  for (let i = 0; i < tmp.length; i++) {
    let t = [tmp[i][0]];
    t[0].colSpan = 1;
    for (let j = 1; j < arr.length; j++) {
      if (t[t.length-1].path === tmp[i][j].path) {
        t[t.length-1].colSpan += 1;
      } else {
        t.push(tmp[i][j]);
        t[t.length-1].colSpan = 1;
      }
    }
    res[i] = t.filter(d => !d.toBeDeleted);
  }

  return res;
}

/**
 * statistics of the properties of an nested object.
 * This is required to create table headers spanning multiple columns
 * @param obj: object
 */
export function propStat(obj) {
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