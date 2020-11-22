import { FETCH_RESULTS } from "../actions/types";

const initialState = {
    papers: []
}

export default function(state=initialState, action) {
    switch(action.type) {
        case FETCH_RESULTS:
            // console.log("payload")
            // console.log(action.payload)
            // console.log("action.payload.data.hits.hits")
            // console.log(action.payload.data.hits.hits)
            const res = {
                ...state,
                papers: action.payload.data.hits.hits
            }
            // console.log("result reducer res")
            // console.log(res)
            return res
        default:
            return state;        
    }
}