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
    loading: {
        papers: {
            isLoading: false,
            total: 0,
            relation: "eq",
            received: 0,
        },
        patents: {
            isLoading: false,
            total: 0,
            relation: "eq",
            received: 0
        }
    },
    searched: false
}

export default function(state=initialState, action) {
    switch(action.type) {
        case SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    ...action.payload
                }
            }
        case CLEAR_RESULTS:
            return {
                ...state,
                papers: {
                    hits: [],
                    buckets: [],
                },
                patents: {
                    hits: [],
                    buckets: []
                },
                searched: false
            }
        case SAVE_PAPERS:
            return {
                ...state,
                papers: {
                    hits: action.payload,
                    buckets: [],
                },
                searched: true
            }
        case SAVE_PATENTS:
            return {
                ...state,
                patents: {
                    hits: action.payload,
                    buckets: []
                },
                searched: true
            }
        default:
            return state;        
    }
}