import {propStat, flatten} from "../src/js/utils/utils.js";
import test from "./test.js";

let objA = {x: 3, y: 4, z: 5};
let objB = {
  x: {
    a: {
      m: 3,
      n: 4
    },
    b: {
      p: 5,
      q: 6
    },
    c: [7, 8, 9]
  },
  y: {
    s: 'hello',
    w: 'world'
  },
  z: 'test'
};

test({"/x":3,"/y":4,"/z":5}, flatten(objA));
test({
    "prop": "",
    "depth": 0,
    "children": [
        {
            "prop": "x",
            "depth": 1,
            "children": [
                {
                    "prop": "a",
                    "depth": 2,
                    "children": [
                        {
                            "prop": "m",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        },
                        {
                            "prop": "n",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    ],
                    "colSpan": 2
                },
                {
                    "prop": "b",
                    "depth": 2,
                    "children": [
                        {
                            "prop": "p",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        },
                        {
                            "prop": "q",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    ],
                    "colSpan": 2
                },
                {
                    "prop": "c",
                    "depth": 2,
                    "children": [
                        {
                            "prop": "0",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        },
                        {
                            "prop": "1",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        },
                        {
                            "prop": "2",
                            "depth": 3,
                            "colSpan": 1,
                            "rowSpan": 1
                        }
                    ],
                    "colSpan": 3
                }
            ],
            "colSpan": 7
        },
        {
            "prop": "y",
            "depth": 1,
            "children": [
                {
                    "prop": "s",
                    "depth": 2,
                    "colSpan": 1,
                    "rowSpan": 2
                },
                {
                    "prop": "w",
                    "depth": 2,
                    "colSpan": 1,
                    "rowSpan": 2
                }
            ],
            "colSpan": 2
        },
        {
            "prop": "z",
            "depth": 1,
            "colSpan": 1,
            "rowSpan": 3
        }
    ],
    "maxDepth": 3,
    "colSpan": 10
}, propStat(objB));

// console.log(JSON.stringify(flatten(objA)));
// console.log(JSON.stringify(propStat(objB), null, '    '));