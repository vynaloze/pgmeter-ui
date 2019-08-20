import {
    QueriesActions,
    QueriesTable,
    QueriesTableRow,
    SET_QUERIES_CALLS_CHART,
    SET_QUERIES_DISPLAYED,
    SET_QUERIES_TABLE,
    SET_QUERIES_TIME_CHART,
} from "./types";
import {XySeries} from "../types";

export const setQueriesTable = (data: Array<QueriesTable>): QueriesActions => ({
    type: SET_QUERIES_TABLE,
    payload: data
});

export const setQueriesDisplayed = (data: Array<QueriesTableRow>): QueriesActions => ({
    type: SET_QUERIES_DISPLAYED,
    payload: data
});

export const setQueriesTimeChart = (data: XySeries): QueriesActions => ({
    type: SET_QUERIES_TIME_CHART,
    payload: data
});

export const setQueriesCallsChart = (data: XySeries): QueriesActions => ({
    type: SET_QUERIES_CALLS_CHART,
    payload: data
});