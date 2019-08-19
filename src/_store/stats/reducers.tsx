import {combineReducers} from "redux";
import {queriesReducer} from "./queries/reducers";
import {tablesReducer} from "./tables/reducers";
import {indexesReducer} from "./indexes/reducers";

export const statsReducer = combineReducers({
    queries: queriesReducer,
    tables: tablesReducer,
    indexes: indexesReducer,
});