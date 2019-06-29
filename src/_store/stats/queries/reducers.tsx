import {
    QueriesActions,
    QueriesState,
    SET_QUERIES_CALLS_CHART,
    SET_QUERIES_TABLE,
    SET_QUERIES_TIME_CHART,
} from "./types";

const initialState: QueriesState = {
    table: [],
    timeChart: null,
    callsChart: null,
};

export function queriesReducer(state = initialState, action: QueriesActions): QueriesState {
    switch (action.type) {
        case SET_QUERIES_TABLE:
            console.log(action.payload);
            return {
                table: action.payload,
                timeChart: state.timeChart,
                callsChart: state.callsChart,
            };
        case SET_QUERIES_TIME_CHART:
            return {
                table: state.table,
                timeChart: action.payload,
                callsChart: state.callsChart,
            };
        case SET_QUERIES_CALLS_CHART:
            return {
                table: state.table,
                timeChart: state.timeChart,
                callsChart: action.payload,
            };
        default:
            return state
    }
}