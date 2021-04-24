import { 
    FETCH_RESULTS, 
    CLEAR_RESULTS, 
    SAVE_PAPERS, 
    SAVE_PATENTS
    } from "./types"
import axios from 'axios';
import { ES_URL } from '../lib/util'

// export const fetchResults = (search_params, soFar, search_after) => dispatch => {
//     // keeping this for now, but results are fetched in the SearchForm component
//     // and added to the store via savePapers and savePatents below
//     let sp = JSON.parse(JSON.stringify(search_params))
//     if (search_after !== "") {
//         sp.search_after = search_after;
//     }
//     axios.post(ES_URL, sp).then(res => {
//         console.log("response from ES");
//         console.log(res);
//         const resHits =  res.data.hits.hits
//         const hits = soFar.concat(resHits);
//         const complete = (hits.length >= 100000 || hits.length === 0);
//         const new_sa = complete ? "" : resHits[resHits.length -1].sort
//         return dispatch({
//             type:FETCH_RESULTS,
//             payload: {
//                 hits: hits,
//                 complete: complete,
//                 search_after: new_sa
//             }
//         })
//     });
// };


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

