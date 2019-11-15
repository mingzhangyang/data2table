// convert JSON to CSV, TSV, etc.
function jsonToXSV(arr, delimiter) {
  if (!Array.isArray(arr)) {
    throw new TypeError('an array of objects expected');
  }
  if (arr.length === 0) {
    return '';
  }
  let cols = Object.keys(arr[0]);
  let res = cols.join(delimiter) + '\n';
  for (let obj of arr) {
    res += cols.map(p => obj[p]).join(delimiter) + '\n';
  }
  return res;
}

function stringify(d) {
  switch (typeof d) {
    case 'number':
      return d + '';
    case 'string':
      return d;
    case 'object':
      if (Array.isArray(d)) {
        return d.join(', ');
      } else if (d === null) {
        return 'null';
      } else {
        return JSON.stringify(d);
      }
    case 'bool':
      return d + '';
    default:
      return 'null';
  }
}

export {
  jsonToXSV,
  stringify,
};


 
 