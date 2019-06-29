import {combineReducers, createStore} from 'redux'
import {timeRangeReducer} from './timeRange/reducers'
import {datasourcesReducer} from "./datasources/reducers";
import {queriesReducer} from "./stats/queries/reducers";

const rootReducer = combineReducers({
    timeRange: timeRangeReducer,
    datasources: datasourcesReducer,
    queries: queriesReducer
});

export type AppState = ReturnType<typeof rootReducer>

export default createStore(rootReducer)