/**
 * compare two objects, return true if they are equal in value
 * e.g. {a: 3, b: 4} equals {b: 4, a: 3}
 * @param obj1
 * @param obj2
 * @returns {boolean}
 */
function cmp(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2)) {
        return false;
    }
    // below is handled in the first check
    // if (typeof obj1 !== "object") {
    //     return obj1 === obj2;
    // }
    // if (obj1 === null && obj2 === null) {
    //     return true;
    // }
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
};

function assertQueryObject(obj1, obj2) {
    return cmp(obj1.sort, obj2.sort) && cmp(obj1.filter, obj2.filter)
}

export {
    cmp,
    assertQueryObject
};