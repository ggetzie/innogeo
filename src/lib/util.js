/**
 * isDomAvailable
 * @description Checks to see if the DOM is available by checking the existence of the window and document
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/ExecutionEnvironment.js#L12
 */
import { encode, decode, decode_bbox } from "ngeohash";
import { Polygon, Polyline } from "react-leaflet";

export function isDomAvailable() {
  return typeof window !== 'undefined' && !!window.document && !!window.document.createElement;
}

 export const ES_URL = 'https://1z85a4how2.execute-api.us-east-1.amazonaws.com/search_es'


 export function bbox_to_pairs(arr) {
   // arr = [minLat, minLong, maxLat, maxLong]
   // Transform to
  //  [
  //    [
  //      [minLat, minLong],
  //      [minLat, maxLong],
  //      [maxLat, maxLong],
  //      [maxLat, minLong]
  //    ]
  //  ]
   return [
     [
       [arr[0], arr[1]],
       [arr[0], arr[3]],
       [arr[2], arr[3]],
       [arr[2], arr[1]],
    ]
  ]
 }

 export class Graph {
   constructor(itemArray) {
     this.itemArray = itemArray;
     this.edgeMap = new Map();
     this.vertices = new Set();
     let i = 0;
     console.log("creating graph from items");
     console.log(itemArray);
     for (const item of this.itemArray) {
       // loop through the array of papers or patents and index them by 
       // the geohashes of their locations
       let hashArray = item._source.locations.map(x => encode(x[1], x[0], 4));
       hashArray = [...new Set(hashArray)]; // remove duplicates
       hashArray = hashArray.sort();
       for (let v of hashArray) {
         this.vertices.add(v);
       }
       const hashes = hashArray.join(",");
       if (this.edgeMap.has(hashes)) {
         const indexList = this.edgeMap.get(hashes);
         this.edgeMap.set(hashes, indexList.concat(i));
       } else {
         this.edgeMap.set(hashes, [i]);
       }
       i++;
     }
   }

   bboxes() {
     const verticesArray = [...this.vertices];
     return verticesArray.map(gh => ([gh,bbox_to_pairs(decode_bbox(gh))]));
   }

   lines() {
     let res = [];
     for (let [key, value] of this.edgeMap) {
       const hashes = key.split(",");
       const points = hashes.map(gh => (decode(gh)));
       console.log(points);
       res.push([key, points])
     }
     console.log("lines result");
     console.log(res);
     return res
   }
 }