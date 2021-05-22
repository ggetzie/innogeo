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

export const thunkResults = (paper_params) => (dispatch, getState) => {
    const state = getState();
    // copy parameters to modify
    let sp = JSON.parse(JSON.stringify(paper_params));
    let complete = false;
    let hits = state.papers.hits;
    let resLen;
    // store the last element of the current search to
    // to search_after for the next search
    let sa;
    do {
        console.log("searching with parameters");
        console.log("sp");
        axios.post(ES_URL, sp).then(res => {
         console.log("got response");
         console.log(res)
         hits = hits.concat(res.data.hits.hits);
         resLen = res.data.hits.hits.length;
         sa = resLen > 0 ? res.data.hits.hits[resLen-1].sort : [];
         dispatch({
             type: LOADING_PAPERS,
             payload: {
                 isLoading:true,
                 total: res.data.hits.total.value,
                 relation: res.data.hits.total.relation,
                 received: hits.length
             }
         })
         // stop when we get no results or have more than 10000
         if (hits.length >= 10000 || resLen ===0 ) {
             console.log("finished getting results");
             complete = true;
             dispatch({
                 type: LOADING_PAPERS,
                 payload: {
                     isLoading: false,
                     total: 0,
                     relation: "",
                     received: 0
                 }
             })
             dispatch(savePapers(hits));
         } else {
             console.log(`Searching after ${sa}`);
             sp.search_after = sa
         }
        })
    } while (!complete)
}