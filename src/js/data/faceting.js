function getValueFacetsForOneProp(arr, prop) {
  let m = new Map();
  for (let obj of arr) {
    let v = obj[prop];
    if (typeof v === "object") {
      v = v["valueForFaceting"];
    }
    let c = m.get(v);
    if (c === undefined) {
      m.set(v, 1);
    } else {
      m.set(v, c + 1);
    }
  }
  let res = [];
  for (let [k, v] of m) {
    res.push({
      facetType: "value",
      facetValue: k,
      count: v
    });
  }
  res.sort((a, b) => {
    if (a.count > b.count) {
      return -1;
    }
    if (a.count < b.count) {
      return 1;
    }
    return a.facetValue > b.facetValue ? -1 : 1;
  });
  return res;
}

const getValueFacets = function (data, facets) {
  let res = [];
  for (let facet of facets) {
    let obj = {name: facet};
    obj.facets = getValueFacetsForOneProp(data, facet);
    res.push(obj);
  }
  return res;
};

export default getValueFacets;