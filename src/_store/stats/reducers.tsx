import {combineReducers} from "redux";
import {queriesReducer} from "./queries/reducers";

export const statsReducer = combineReducers({
    queries: queriesReducer
});