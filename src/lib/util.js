/**
 * isDomAvailable
 * @description Checks to see if the DOM is available by checking the existence of the window and document
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/ExecutionEnvironment.js#L12
 */

export function isDomAvailable() {
  return typeof window !== 'undefined' && !!window.document && !!window.document.createElement;
}

 export const ES_URL = 'https://1z85a4how2.execute-api.us-east-1.amazonaws.com/search_es'
// [minLat, minLong, maxLat, maxLong]
 export function bbox_to_pairs(arr) {
   return [
     [
       [arr[0], arr[1]],
       [arr[0], arr[3]],
       [arr[2], arr[3]],
       [arr[2], arr[1]],
    ]
  ]
 }