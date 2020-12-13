import { FETCH_RESULTS, SET_LOADING } from "../actions/types";

const initialState = {
    papers: [],
    loading: false
}

export default function(state=initialState, action) {
    switch(action.type) {
        case FETCH_RESULTS:
            return {
                ...state,
                papers: action.payload.data.hits.hits,
                loading: false,
            };
        case SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            }
        default:
            return state;        
    }
}