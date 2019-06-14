import {combineReducers, createStore} from 'redux'
import {timeRangeReducer} from './timeRange/reducers'
import {datasourcesReducer} from "./datasources/reducers";

const rootReducer = combineReducers({
    timeRange: timeRangeReducer,
    datasources: datasourcesReducer,
});

export type AppState = ReturnType<typeof rootReducer>

export default createStore(rootReducer)