import { SET_LOADING } from "./types"

export const setLoading = (payload) => dispatch => {
    console.log("setting loading")
    return dispatch({
        type: SET_LOADING,
        payload: payload
    })
}