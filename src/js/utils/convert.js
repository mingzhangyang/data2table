// convert JSON to CSV, TSV, etc.
// don't support nested object
function jsonToXSV(arr, delimiter = ",") {
  if (!Array.isArray(arr)) {
    throw new TypeError('an array of objects expected');
  }
  if (arr.length === 0) {
    return '';
  }
  let cols = Object.keys(arr[0]);
  let cols_sanitized = cols.map(s => {
    if (s.includes(delimiter)) {
      return `"${s}"`;
    }
    return s;
  });
  let res = cols_sanitized.join(delimiter) + '\n';
  for (let obj of arr) {
    let line = cols.map(p => obj[p]);
    line = line.map(s => {
      if (s.includes(delimiter)) {
        return `"${s}"`;
      }
      return s;
    });
    res += line.join(delimiter) + '\n';
  }
  return res;
}

// stringify any types of data
function stringify(d) {
  switch (typeof d) {
    case 'number':
      return d + '';
    case 'string':
      return d;
    case 'boolean':
      return d + '';
    case 'object':
      if (Array.isArray(d)) {
        return d.join(', ');
      }
      if (d === null) {
        return 'N/A';
      }
      return JSON.stringify(d);
    default:
      return 'N/A';
  }
}

/**
 * serialize the filter/sort setting object to query string parameters
 * @param obj, <Object>, format: {key: value} or {key: [v1, v2, ...]}
 * @param delimiter, <String>, default: _._
 * @returns {*} <String>, 'key_._value' or ['key_._v1', 'key_._v2', ...]
 */
function serialize(obj, delimiter = "=") {
  if (typeof obj !== "object" || obj === null) {
    throw new TypeError("an object expected");
  }
  let key = Object.keys(obj)[0];
  if (Array.isArray(obj[key])) {
    return obj[key].map(v => `${key}${delimiter}${v}`);
  }
  return `${key}${delimiter}${obj[key]}`;
}

export {
  jsonToXSV,
  stringify,
  serialize,
};


 
 