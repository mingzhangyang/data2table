/**
 * Created by yangm11 on 11/14/2019.
 */


import DataManager from '../src/js/data/dataManager.js';

let a = [
  {x: 3, y: 24, z: 12, foo: {valueForSorting: 2}, bar: {valueForFiltering: 'A'}},
  {x: 5, y: 24, z: 12, foo: {valueForSorting: 3}, bar: {valueForFiltering: 'E'}},
  {x: 1, y: 24, z: 12, foo: {valueForSorting: 6}, bar: {valueForFiltering: 'G'}},
  {x: 8, y: 24, z: 12, foo: {valueForSorting: 1}, bar: {valueForFiltering: 'R'}},
  {x: 2, y: 24, z: 12, foo: {valueForSorting: 5}, bar: {valueForFiltering: 'F'}},
  {x: 6, y: 24, z: 12, foo: {valueForSorting: 1}, bar: {valueForFiltering: 'D'}},
  {x: 1, y: 24, z: 12, foo: {valueForSorting: 0}, bar: {valueForFiltering: 'N'}},
  {x: 0, y: 24, z: 12, foo: {valueForSorting: 4}, bar: {valueForFiltering: 'I'}},
  {x: 7, y: 24, z: 12, foo: {valueForSorting: 7}, bar: {valueForFiltering: 'H'}},
  {x: 9, y: 24, z: 12, foo: {valueForSorting: 3}, bar: {valueForFiltering: 'C'}},
];
let dm = new DataManager(a, {dataIsComplete: true});
let queryObject = {};
console.log(dm.serve(queryObject));
queryObject = {start: 4};
console.log(queryObject, dm.serve(queryObject));
queryObject = {filter: {bar: ['N', 'I', 'H'], x: 7}};
console.log(queryObject, dm.serve(queryObject));
queryObject = {sort: {foo: -1}};
console.log(queryObject, dm.serve(queryObject));
 
 