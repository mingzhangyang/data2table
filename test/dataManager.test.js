/**
 * Created by yangm11 on 11/14/2019.
 */


import DataManager from '../src/js/data/dataManager.js';
import {asyncTest} from "./test.js";

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
let queryObject1 = {};
let p1 = asyncTest(a, dm.serve(queryObject1).then(res => res.data));

let queryObject2 = {start: 4};
let p2 = asyncTest(a.slice(4), dm.serve(queryObject2).then(res => res.data));

let queryObject3 = {filter: {bar: ['N', 'I', 'H'], x: 7}};
let p3 = asyncTest([a[8]], dm.serve(queryObject3).then(res => res.data));

let queryObject4 = {sort: {foo: -1}, start: 0, limit: 2};
let p4 = asyncTest([a[8], a[2]], dm.serve(queryObject4).then(res => res.data));

let queryObject5 = {facets: ["x", "y"]};
let p5 = asyncTest([{
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
}], dm.serve(queryObject5));
 
Promise.all([p1, p2, p3, p4, p5]).then(console.log);