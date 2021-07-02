import { 
    FETCH_RESULTS, 
    SET_LOADING, 
    CLEAR_RESULTS,
    SAVE_PAPERS,
    SAVE_PATENTS,
    LOADING_PAPERS,
    LOADING_PATENTS,
    SET_SELECTED,
    CLEAR_SELECTED,
    SET_SELECTED_PAPERS,
    CLEAR_SELECTED_PAPERS,
    SET_SELECTED_PATENTS,
    CLEAR_SELECTED_PATENTS,
 } from "../actions/types";

 import { Graph } from "../lib/util";

const initialState = {
    papers: {
        hits: [],
        buckets: [],
        graph: new Graph([]),
    },
    patents: {
        hits: [],
        buckets: [],
        graph: new Graph([]),
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
    searched: false,
    selectedPapers: null,
    selectedPatents: null,
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
                    graph: new Graph(action.payload)
                },
                searched: true
            }
        case SAVE_PATENTS:
            return {
                ...state,
                patents: {
                    hits: action.payload,
                    buckets: [],
                    graph: new Graph(action.payload)
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
        case SET_SELECTED_PAPERS:
            return {
                ...state,
                selectedPapers: action.payload
            }
        case CLEAR_SELECTED_PAPERS:
            return {
                ...state,
                selectedPapers: null
            }

        case SET_SELECTED_PATENTS:
            return {
                ...state,
                selectedPatents: action.payload
            }
        case CLEAR_SELECTED_PATENTS:
            return {
                ...state,
                selectedPatents: null
            }            
        default:
            return state;        
    }
}