import { SET_LOADING } from "./types"

export const setLoading = () => dispatch => {
    dispatch({
        type: SET_LOADING,
        payload: true
    })
}