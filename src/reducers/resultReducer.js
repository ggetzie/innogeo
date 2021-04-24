import { 
    FETCH_RESULTS, 
    SET_LOADING, 
    CLEAR_RESULTS,
    SAVE_PAPERS,
    SAVE_PATENTS } from "../actions/types";

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
                    papers: {
                        hits: [],
                        buckets: [],
                    },
                    loading: false,
                    searched: true,
                };
            }
        case SET_LOADING:
            return {
                ...state,
                loading: action.payload,
            }
        case CLEAR_RESULTS:
            return {
                ...state,
                ...initialState
            }
        case SAVE_PAPERS:
            return {
                ...state,
                papers: {
                    hits: action.payload,
                    buckets: [],
                }
            }
        case SAVE_PATENTS:
            return {
                ...state,
                patents: {
                    hits: action.payload,
                    buckets: []
                }
            }
        default:
            return state;        
    }
}