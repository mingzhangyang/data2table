export default class CustomSet {
  constructor(uid) {
    if (typeof uid !== "string") {
      throw "a uid property is required to create the set"
    }
    this._data = [];
    this.uid = uid;
  }
  toArray() {
    return [...this._data];
  }
  add(obj) {
    for (let i = 0; i < this._data.length; i++) {
      if (this._data[i][this.uid] === obj[this.uid]) {
        return;
      }
    }
    this._data.push(obj);
  }
  delete(obj) {
    for (let i = 0; i < this._data.length; i++) {
      if (this._data[i][this.uid] === obj[this.uid]) {
        this._data.splice(i, 1);
        return;
      }
    }
  }
  size() {
    return this._data.length;
  }

  has(obj) {
    for (let d of this._data) {
      if(d[this.uid] === obj[this.uid]) {
        return true;
      }
    }
    return false;
  }
}