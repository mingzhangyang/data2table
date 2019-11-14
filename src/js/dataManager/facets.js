'use strict';

export const getValueFacets = (arr, prop) => {
    let m = new Map();
    for (let obj of arr) {
        let v = obj[prop];
        if (typeof v === "object") {
            v = v.valueForFaceting;
        }
        let c = m.get(v);
        if (c === undefined) {
            m.set(v, 1);
        } else {
            m.set(v, c+1);
        }
    }
    let res = [];
    for (let [k, v] of m) {
        res.push({
            facetValue: k,
            count: v
        });
    }
    res.sort((a, b) => {
        return a.count > b.count ? -1 : 1;
    });
    return res;
};