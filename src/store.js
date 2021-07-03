import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

const middleware = [thunk];
// when deploying comment out compose and uncomment applyMiddleware
// redux devtools won't work with static gatsby build
const store = createStore(
    rootReducer, 
    initialState, 
    applyMiddleware(...middleware),
    // compose(
    //     applyMiddleware(...middleware),
    //     typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    // )
);

export default store;