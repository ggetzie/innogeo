import { 
    SET_LOADING, 
    LOADING_PAPERS, 
    LOADING_PATENTS } from "./types"

export const setLoading = (payload) => ({
        type: SET_LOADING,
        payload: payload
    })