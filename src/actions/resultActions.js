import { FETCH_RESULTS } from "./types"
import axios from 'axios';
import { ES_URL } from '../lib/util'

// export const fetchResults = query => dispatch => {
//     axios
//     .get('https://1z85a4how2.execute-api.us-east-1.amazonaws.com/search_es', { params: query })
//     .then(( res ) => (
//         dispatch({
//         type: FETCH_RESULTS,
//         payload: res
//     })));
// };

// import axios from 'axios'

// const baseUrl: string = 'https://api.worldbank.org/v2/country/'

// const getIndicatorByCountry = async (country: string, indicator: string, page:number=1): Promise<[]> => {  
//   const query = `${baseUrl}/${country}/indicator/${indicator}?page=${page}&format=json`
//   const response = await axios.get(query)  
//   const data = response.data

//   if (data[0].pages > page) {
//     return data.concat(await getIndicatorByCountry(country, indicator, page+1)) 
//   } else {
//     return data
//   }
// }

async function fetchAllHits(search_params, soFar=0) {
    console.log(`Fetching hits: soFar=${soFar}`)
    let sp = JSON.parse(JSON.stringify(search_params))
    const response = await axios.post(ES_URL, sp)
    const resHits = response.data.hits.hits;
    if (resHits.length === 0) {
        return []
    } else if (soFar >= 100000) {
        return resHits
    } else {
        sp.search_after = resHits[resHits.length -1].sort
        return resHits.concat(await fetchAllHits(sp, soFar + resHits.length))
    }
}

export const fetchResults = (search_params) => dispatch => {
    const hits =  fetchAllHits(search_params, 0);
    return dispatch({
        type:FETCH_RESULTS,
        payload: hits
    })
};

