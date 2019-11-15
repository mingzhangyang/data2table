import getValueFacets from './faceting.js';
import cmp from "../utils/cmp.js";

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
  // currently only get the facets of the whole dataset, ignore filtering
  if (Array.isArray(facets)) {
    return getValueFacets(this.data, facets);
  }

  // serve data query
  if (objectEqual(queryObject, this.cache.queryObject) &&
      start >= this.cache.range[0] && start + limit < this.cache.range[1]) {
    return {
      data: this.cache.data.slice(start, (start + limit)),
      totalCount: this.cache.data.length,
    };
  }

  let tmp = this.data.slice();
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
  this.cache.range = [0, tmp.length];

  return {
    data: tmp.slice(start, (start + limit)),
    totalCount: tmp.length,
  };
};


export default fetchData;
 