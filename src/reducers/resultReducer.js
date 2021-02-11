import { FETCH_RESULTS, SET_LOADING } from "../actions/types";

const initialState = {
    papers: [],
    paper_buckets: [],
    loading: false,
    searched: false
}

export default function(state=initialState, action) {
    switch(action.type) {
        case FETCH_RESULTS:
            try {
                return {
                    ...state,
                    papers: action.payload.data.hits.hits,
                    paper_buckets: action.payload.data.aggregations["large-grid"].buckets,
                    loading: false,
                    searched: true
                };
            } catch(error) {
                console.log(error);
                console.log(action.payload);
                return {
                    ...state,
                    papers: [],
                    loading: false,
                    searched: true,
                };
            }
        case SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            }
        default:
            return state;        
    }
}