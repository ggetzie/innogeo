import { 
    FETCH_RESULTS, 
    CLEAR_RESULTS, 
    SAVE_PAPERS, 
    SAVE_PATENTS
    } from "./types"
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

export const fetchResults = (search_params, soFar, search_after) => dispatch => {
    let sp = JSON.parse(JSON.stringify(search_params))
    if (search_after !== "") {
        sp.search_after = search_after;
    }
    axios.post(ES_URL, sp).then(res => {
        console.log("response from ES");
        console.log(res);
        const resHits =  res.data.hits.hits
        const hits = soFar.concat(resHits);
        const complete = (hits.length >= 100000 || hits.length === 0);
        const new_sa = complete ? "" : resHits[resHits.length -1].sort
        return dispatch({
            type:FETCH_RESULTS,
            payload: {
                hits: hits,
                complete: complete,
                search_after: new_sa
            }
        })
    });
};


export const clearResults = () => dispatch => {
    return dispatch({
        type: CLEAR_RESULTS,
    })
};

export const savePapers = (hits) => dispatch => {
    return dispatch({
        type: SAVE_PAPERS,
        payload: hits
    })
}

export const savePatents = (hits) => dispatch => {
    return dispatch({
        type: SAVE_PATENTS,
        payload: hits
    })
}

