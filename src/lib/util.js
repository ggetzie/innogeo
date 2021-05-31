/**
 * isDomAvailable
 * @description Checks to see if the DOM is available by checking the existence of the window and document
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/ExecutionEnvironment.js#L12
 */
import { encode } from "ngeohash";

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

//  export class Graph {
//    constructor() {
//      this.adjacency_matrix = new Map()
//    }

//    add_edge(e) {

//    }

//  }