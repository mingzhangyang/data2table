export default function cmp(obj1, obj2) {
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
};