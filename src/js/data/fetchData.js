function fetchData(queryObject) {
  let start = queryObject.start;
  let limit = queryObject.limit;
  let filter = queryObject.filter;
  let sort = queryObject.sort;

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

  return {
    data: tmp.slice(start, (start + limit)),
    totalCount: tmp.length
  };
};


export default fetchData;
 