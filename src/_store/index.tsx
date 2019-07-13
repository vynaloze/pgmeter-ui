import {combineReducers, createStore} from 'redux'
import {timeRangeReducer} from './timeRange/reducers'
import {datasourcesReducer} from "./datasources/reducers";
import {statsReducer} from "./stats/reducers";

const rootReducer = combineReducers({
    timeRange: timeRangeReducer,
    datasources: datasourcesReducer,
    stats: statsReducer
});

export type AppState = ReturnType<typeof rootReducer>

export default createStore(rootReducer)