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

export const fetchResults = search_params => dispatch => {
    axios
    .post(ES_URL, search_params)
    .then(( res ) => {
        console.log("results from post")
        console.log(res);
        return dispatch({
            type: FETCH_RESULTS,
            payload: res
        });
    });
};