import { FETCH_RESULTS, SET_LOADING } from "../actions/types";

const initialState = {
    papers: [],
    loading: false
}

export default function(state=initialState, action) {
    switch(action.type) {
        case FETCH_RESULTS:
            const res = {
                ...state,
                papers: action.payload.data.hits.hits,
                loading: false,
            }
            console.log("result reducer res")
            console.log(res)
            return res
        case SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            }
        default:
            return state;        
    }
}