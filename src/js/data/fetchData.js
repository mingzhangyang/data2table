import getValueFacets from './faceting.js';

function cmp(obj1, obj2) {
  if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2)) {
    return false;
  }
  if (typeof obj1 !== "object") {
    return obj1 === obj2;
  }
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    let v1 = obj1[key];
    let v2 = obj2[key];
    if (Object.prototype.toString.call(v1) !== Object.prototype.toString.call(v2)) {
      return false;
    }
    if (typeof v1 === "object") {
      let t = cmp(v1, v2);
      if (!t) {
        return false;
      }
    } else {
      if (v1 !== v2) {
        return false;
      }
    }
  }
  return true;
}

function objectEqual(obj1, obj2) {
  return cmp(obj1.sort, obj2.sort) && cmp(obj1.filter)
}

const fetchData = function(queryObject) {
  let start = queryObject.start ? queryObject.start : 0;
  let limit = queryObject.limit ? queryObject.limit : 1000;
  let filter = queryObject.filter ? queryObject.filter : undefined;
  let sort = queryObject.sort ? queryObject.sort : undefined;
  let facets = queryObject["facets"] ? queryObject["facets"] : undefined;

  // serve faceting data
  if (Array.isArray(facets)) {
    return getValueFacets(this.data);
  }

  // serve data query
  if (!this.cache) {
    this.cache = {
      data: this.data,
      queryObject: {}
    };
  }

  if (objectEqual(queryObject, this.cache.queryObject)) {
    return {
      data: this.cache.data.slice(start, (start + limit)),
      totalCount: this.cache.data.length,
    };
  }

  let tmp = this.data;
  if (filter) {
    let props = Object.keys(filter);
    for (let prop of props) {
      if (Array.isArray(filter[prop])) {
        tmp = tmp.filter(obj => {
          if (typeof obj[prop] === 'object') {
            return filter[prop].includes(obj[prop].valueForFiltering);
          }
          return filter[prop].includes(obj[prop]);
        });
      } else {
        tmp = tmp.filter(obj => {
          if (typeof obj[prop] === 'object') {
            return filter[prop] === obj[prop].valueForFiltering;
          }
          return filter[prop] === obj[prop];
        });
      }
    }
  }

  if (sort) {
    // currently supports sorting by only one field
    let prop = Object.keys(sort)[0];
    let order = sort[prop];
    if (order === 1) {
      tmp.sort((a, b) => {
        if (typeof a[prop] === 'object' && typeof b[prop] === 'object') {
          return a[prop].valueForSorting < b[prop].valueForSorting ? -1 : 1;
        } else {
          return a[prop] < b[prop] ? -1 : 1;
        }
      });
    } else if (order === -1) {
      tmp.sort((a, b) => {
        if (typeof a[prop] === 'object' && typeof b[prop] === 'object') {
          return a[prop].valueForSorting < b[prop].valueForSorting ? 1 : -1;
        } else {
          return a[prop] < b[prop] ? 1 : -1;
        }
      });
    }
  }

  this.cache.data = tmp;
  this.cache.queryObject = queryObject;

  return {
    data: tmp.slice(start, (start + limit)),
    totalCount: tmp.length,
  };
};


export default fetchData;
 