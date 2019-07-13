import {
    QueriesActions,
    QueriesTable,
    SET_QUERIES_CALLS_CHART,
    SET_QUERIES_TABLE,
    SET_QUERIES_TIME_CHART,
} from "./types";
import {XySeries} from "../types";

export const setQueriesTable = (data: Array<QueriesTable>): QueriesActions => ({
    type: SET_QUERIES_TABLE,
    payload: data
});

export const setQueriesTimeChart = (data: Array<XySeries>): QueriesActions => ({
    type: SET_QUERIES_TIME_CHART,
    payload: data
});

export const setQueriesCallsChart = (data: Array<XySeries>): QueriesActions => ({
    type: SET_QUERIES_CALLS_CHART,
    payload: data
});