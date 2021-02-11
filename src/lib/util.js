/**
 * isDomAvailable
 * @description Checks to see if the DOM is available by checking the existence of the window and document
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/ExecutionEnvironment.js#L12
 */

export function isDomAvailable() {
  return typeof window !== 'undefined' && !!window.document && !!window.document.createElement;
}


/**
 * Decode Bounding Box
 *
 * Decode hashString into a bound box matches it. Data returned in a four-element array: [minlat, minlon, maxlat, maxlon]
 * @param {String} hash_string
 * @returns {Array}
 * 
 * from https://github.com/missinglink/leaflet-spatial-prefix-tree/blob/master/geohash.js
 
 * Copyright (c) 2011, Sun Ning.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

 export const ES_URL = 'https://1z85a4how2.execute-api.us-east-1.amazonaws.com/search_es'

var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
var BASE32_CODES_DICT = {};
for (var i = 0; i < BASE32_CODES.length; i++) {
  BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}
export function decode_bbox(hash_string) {
  var isLon = true,
  maxLat = 90,
  minLat = -90,
  maxLon = 180,
  minLon = -180,
  mid;

  var hashValue = 0;
  for (var i = 0, l = hash_string.length; i < l; i++) {
    var code = hash_string[i].toLowerCase();
    hashValue = BASE32_CODES_DICT[code];

    for (var bits = 4; bits >= 0; bits--) {
      var bit = (hashValue >> bits) & 1;
      if (isLon) {
        mid = (maxLon + minLon) / 2;
        if (bit === 1) {
          minLon = mid;
        } else {
          maxLon = mid;
        }
      } else {
        mid = (maxLat + minLat) / 2;
        if (bit === 1) {
          minLat = mid;
        } else {
          maxLat = mid;
        }
      }
      isLon = !isLon;
    }
  }
  return [minLat, minLon, maxLat, maxLon];
};