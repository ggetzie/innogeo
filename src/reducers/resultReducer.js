import { FETCH_RESULTS, SET_LOADING } from "../actions/types";

const initialState = {
    papers: {
        hits: [],
        buckets: [],
    },
    patents: {
        hits: [],
        buckets: [],
    },
    loading: false,
    searched: false
}

export default function(state=initialState, action) {
    switch(action.type) {
        case FETCH_RESULTS:
            try {
                return {
                    ...state,
                    papers: {
                        hits: action.payload.hits,
                    },
                    loading: false,
                    searched: true
                };
            } catch(error) {
                console.log(error);
                console.log(action.payload);
                return {
                    ...state,
                    papers: {},
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