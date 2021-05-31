import { 
    FETCH_RESULTS, 
    SET_LOADING, 
    CLEAR_RESULTS,
    SAVE_PAPERS,
    SAVE_PATENTS,
    LOADING_PAPERS,
    LOADING_PATENTS,
 } from "../actions/types";

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
            requested: false,
            total: "calculating...",
            relation: "eq",
            received: "calculating...",
            search_after: "",
        },
        patents: {
            isLoading: false,
            requested: false,
            total: "calculating...",
            relation: "eq",
            received: "calculating...",
            search_after: "",
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
            return initialState
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
        case LOADING_PAPERS:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    papers: {
                        ...action.payload
                    }
                }
            }
        case LOADING_PATENTS:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    patents: {
                        ...action.payload
                    }
                }
            }
        default:
            return state;        
    }
}