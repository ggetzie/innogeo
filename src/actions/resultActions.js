import { 
    CLEAR_RESULTS, 
    LOADING_PAPERS, 
    LOADING_PATENTS, 
    SAVE_PAPERS, 
    SAVE_PATENTS
    } from "./types"
import { ES_URL } from '../lib/util';
import axios from "axios";

const RelationMap = new Map([
    ["gte", ">"],
    ["lte", "<"], 
    ["eq", ""]
]);


export const clearResults = () => ({type:CLEAR_RESULTS})

export const savePapers = (hits) => ({
    type: SAVE_PAPERS,
    payload: hits
})

export const savePatents = (hits) => ({
        type: SAVE_PATENTS,
        payload: hits
})

export const thunkResults = (params) => async (dispatch, getState) => {
    // copy parameters to modify
    let sp = JSON.parse(JSON.stringify(params));
    let L_TYPE;
    let disp_func;
    if (sp.index === "papers") {
        L_TYPE = LOADING_PAPERS;
        disp_func = savePapers;
    } else if (sp.index === "patents") {
        L_TYPE = LOADING_PATENTS;
        disp_func = savePatents;
    } else {
        throw "Unrecognized index type";
    }

    dispatch({
        type: L_TYPE,
        payload: {
            isLoading: true,
            requested: true,
            total: "calculating...",
            relation: "",
            received: "calculating...",
        }
    })
    const state = getState();
    console.log("state in thunkResults");
    console.log(state);
    
    let complete = false;
    let hits = [];
    let attempts = 0;
    do {
        console.log("searching with parameters");
        console.log(sp);
        const res = await axios.post(ES_URL, sp);
        console.log("awaited response");
        console.log(res);
        hits = hits.concat(res.data.hits.hits);
        const resLen = res.data.hits.hits.length;
        const search_after = resLen > 0 ? res.data.hits.hits[resLen-1].sort : [];
        const relation = RelationMap.get(res.data.hits.total.relation)
        const total = res.data.hits.total.value
        dispatch({
             type: L_TYPE,
             payload: {
                 isLoading:true,
                 requested: true,
                 total: total,
                 relation: relation,
                 received: hits.length
             }
         })

         if (hits.length >= 10000 || resLen === 0 ) {
             // stop when we get no results or have more than 10000
             console.log("finished getting results");
             complete = true;
             dispatch({
                 type: L_TYPE,
                 payload: {
                     isLoading: false,
                     requested: true,
                     total: total, 
                     relation: relation,
                     received: hits.length,
                 }
             })
             dispatch(disp_func(hits));
         } else {
             console.log(`Searching after ${search_after}`);
             sp.search_after = search_after;
         }
    } while (!complete)
}