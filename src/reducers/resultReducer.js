import { FETCH_RESULTS } from "../actions/types";

const initialState = {
    papers: []
}

export default function(state=initialState, action) {
    switch(action.type) {
        case FETCH_RESULTS:
            const res = {
                ...state,
                papers: action.payload.data.hits.hits
            }
            console.log("result reducer res")
            console.log(res)
            return res
        default:
            return state;        
    }
}