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

 class AffiliationMap {
   // keep a list of all the affiliations indexed by geohash and affiliation_id
   constructor(searchIndex) {
     this.hashToAff = new Map();
     this.searchIndex = searchIndex;
   }

   add(geohash, affiliation) {
     if (this.hashToAff.has(geohash)) {
       let affs = this.hashToAff.get(geohash);
       affs.set(affiliation.affiliation_id, affiliation);
       this.hashToAff.set(geohash, affs);
     } else {
       let affs = new Map();
       affs.set(affiliation.affiliation_id, affiliation);
       this.hashToAff.set(geohash, affs);
     }
   }

   get(geohash) {
     if (this.hashToAff.has(geohash)) {
       const affs = this.hashToAff.get(geohash);
       return [...affs.values()];
     } else {
       return [];
     }
   }
 }

 export class Graph {
   constructor(itemArray) {
     this.itemArray = itemArray;
     this.edgeMap = new Map();
     this.vertices = new Set();
     this.affMap = new AffiliationMap(); // {geohash: {affiliation_id: {affiliation}}
     if (itemArray.length > 0) {
       this.searchIndex = itemArray[0]._index;
     } else {
       this.searchIndex = null;
     }
     
     let i = 0;
     console.log("creating graph from items");
     console.log(itemArray);
     for (const item of this.itemArray) {
       // loop through the array of papers or patents and index them by 
       // the geohashes of their locations
       let hashArray = [];
       for (let a of item._source.authors) {
         if (!a.affiliation || !a.affiliation.location) { continue; }
         const aff = a.affiliation;
         // elasticsearch stores coordinates as [longitude, latitude]
         const longitude = aff.location[0];
         const latitude = aff.location[1];
         const geohash = encode(latitude, longitude, 3); 
         hashArray.push(geohash);
         this.affMap.add(geohash, aff);
       }
       for (let v of hashArray) {
         this.vertices.add(v);
       }
       const hashes = [...new Set(hashArray)].sort().join(",");
       if (this.edgeMap.has(hashes)) {
         const indexList = this.edgeMap.get(hashes);
         this.edgeMap.set(hashes, indexList.concat(i));
       } else {
         this.edgeMap.set(hashes, [i]);
       }
       i++;
     }
   }

   rects() {
     const verticesArray = [...this.vertices];
     return verticesArray.map(gh => {
       const pairs = bbox_to_pairs(decode_bbox(gh));
       const decoded = decode(gh);
       const latlong = [decoded.latitude, decoded.longitude];
       return {
         hash: gh,
         latlong: latlong,
         pairs: pairs,
       }
      })
    }

   lines() {
     let res = [];
     for (let [key, value] of this.edgeMap) {
       const hashes = key.split(",");
       const points = hashes.map(gh => (decode(gh)));
       res.push([key, points])
     }
     return res
   }

   affiliationsInGeohash(geohash) {
     return this.affMap.get(geohash);
   }
 }