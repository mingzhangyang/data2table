/**
 * Created by yangm11 on 11/14/2019.
 */


import DataManager from '../src/js/data/dataManager.js';
import test from "./test.js";

let a = [
  {x: 2, y: 24, z: 12, foo: {valueForSorting: 2}, bar: {valueForFiltering: 'A'}},
  {x: 5, y: 2, z: 12, foo: {valueForSorting: 3}, bar: {valueForFiltering: 'E'}},
  {x: 1, y: 24, z: 12, foo: {valueForSorting: 6}, bar: {valueForFiltering: 'G'}},
  {x: 8, y: 2, z: 12, foo: {valueForSorting: 1}, bar: {valueForFiltering: 'R'}},
  {x: 2, y: 24, z: 12, foo: {valueForSorting: 5}, bar: {valueForFiltering: 'F'}},
  {x: 6, y: 24, z: 12, foo: {valueForSorting: 1}, bar: {valueForFiltering: 'D'}},
  {x: 1, y: 4, z: 12, foo: {valueForSorting: 0}, bar: {valueForFiltering: 'N'}},
  {x: 6, y: 24, z: 12, foo: {valueForSorting: 4}, bar: {valueForFiltering: 'I'}},
  {x: 7, y: 4, z: 12, foo: {valueForSorting: 7}, bar: {valueForFiltering: 'H'}},
  {x: 9, y: 24, z: 12, foo: {valueForSorting: 3}, bar: {valueForFiltering: 'C'}},
];
let dm = new DataManager(a, {dataIsComplete: true});
let queryObject = {};
test(a, dm.serve(queryObject).data);

queryObject = {start: 4};
test(a.slice(4), dm.serve(queryObject).data);

queryObject = {filter: {bar: ['N', 'I', 'H'], x: 7}};
test([a[8]], dm.serve(queryObject).data);

queryObject = {sort: {foo: -1}, start: 0, limit: 2};
test([a[8], a[2]], dm.serve(queryObject).data);

queryObject = {facets: ["x", "y"]};
test([{
  name: 'x',
  facets: [
    {facetType: "value", facetValue: 6, count: 2},
    {facetType: "value", facetValue: 2, count: 2},
    {facetType: "value", facetValue: 1, count: 2},
    {facetType: "value", facetValue: 9, count: 1},
    {facetType: "value", facetValue: 8, count: 1},
    {facetType: "value", facetValue: 7, count: 1},
    {facetType: "value", facetValue: 5, count: 1},
  ]
}, {
  name: 'y',
  facets: [
    {facetType: "value", facetValue: 24, count: 6},
    {facetType: "value", facetValue: 4, count: 2},
    {facetType: "value", facetValue: 2, count: 2},
  ]
}], dm.serve(queryObject));
 
 