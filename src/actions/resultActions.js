import { 
    CLEAR_RESULTS, 
    SAVE_PAPERS, 
    SAVE_PATENTS
    } from "./types"

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

