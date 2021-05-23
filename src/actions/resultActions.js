import { 
    CLEAR_RESULTS, 
    LOADING_PAPERS, 
    SAVE_PAPERS, 
    SAVE_PATENTS
    } from "./types"
import { ES_URL } from '../lib/util';
import axios from "axios";

export const clearResults = () => ({type:CLEAR_RESULTS})

export const savePapers = (hits) => ({
    type: SAVE_PAPERS,
    payload: hits
})

export const savePatents = (hits) => ({
        type: SAVE_PATENTS,
        payload: hits
})

export const thunkResults = (paper_params) => async (dispatch, getState) => {
    dispatch({
        type: LOADING_PAPERS,
        payload: {
            isLoading: true,
            total: "calculating...",
            relation: "eq",
            received: "calculating...",
        }
    })
    const state = getState();
    console.log("state in thunkResults");
    console.log(state);
    // copy parameters to modify
    let sp = JSON.parse(JSON.stringify(paper_params));
    let complete = false;
    let hits = [];
    do {
        console.log("searching with parameters");
        console.log(sp);
        const res = await axios.post(ES_URL, sp);
        console.log("awaited response");
        console.log(res);
        hits = hits.concat(res.data.hits.hits);
        const resLen = res.data.hits.hits.length;
        const search_after = resLen > 0 ? res.data.hits.hits[resLen-1].sort : [];
        dispatch({
             type: LOADING_PAPERS,
             payload: {
                 isLoading:true,
                 total: res.data.hits.total.value,
                 relation: res.data.hits.total.relation,
                 received: hits.length
             }
         })

         if (hits.length >= 10000 || resLen === 0 ) {
             // stop when we get no results or have more than 10000
             console.log("finished getting results");
             complete = true;
             dispatch({
                 type: LOADING_PAPERS,
                 payload: {
                     isLoading: false,
                     total: "calculating...",
                     relation: "eq",
                     received: "calculating...",
                 }
             })
             dispatch(savePapers(hits));
         } else {
             console.log(`Searching after ${search_after}`);
             sp.search_after = search_after;
         }
    } while (!complete)
}