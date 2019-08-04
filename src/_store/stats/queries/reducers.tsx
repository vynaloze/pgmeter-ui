import {
    QueriesActions,
    QueriesState,
    SET_QUERIES_CALLS_CHART,
    SET_QUERIES_DISPLAYED,
    SET_QUERIES_TABLE,
    SET_QUERIES_TIME_CHART,
} from "./types";

const initialState: QueriesState = {
    table: [],
    displayed: [],
    timeChart: [],
    callsChart: [],
};

export function queriesReducer(state = initialState, action: QueriesActions): QueriesState {
    switch (action.type) {
        case SET_QUERIES_TABLE:
            return {
                table: action.payload,
                displayed: state.displayed,
                timeChart: state.timeChart,
                callsChart: state.callsChart,
            };
        case SET_QUERIES_DISPLAYED:
            return {
                table: state.table,
                displayed: action.payload,
                timeChart: state.timeChart,
                callsChart: state.callsChart,
            };
        case SET_QUERIES_TIME_CHART:
            return {
                table: state.table,
                displayed: state.displayed,
                timeChart: action.payload,
                callsChart: state.callsChart,
            };
        case SET_QUERIES_CALLS_CHART:
            return {
                table: state.table,
                displayed: state.displayed,
                timeChart: state.timeChart,
                callsChart: action.payload,
            };
        default:
            return state
    }
}