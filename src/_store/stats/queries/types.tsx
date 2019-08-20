import {Table, XySeries} from "../types";

export interface QueriesState {
    table: Array<QueriesTable>
    displayed: Array<QueriesTableRow>
    timeChart?: XySeries
    callsChart?: XySeries
}

export interface QueriesTable extends Table {
    datasourceId: number
    payload: Array<QueriesTablePayload>
}

export interface QueriesTablePayload {
    query: string
    user: string
    calls: number
    rows: number
    avg_time: number
    min_time: number
    max_time: number
    shared_blks_hit: number
    shared_blks_read: number
    local_blks_hit: number
    local_blks_read: number
}

export interface QueriesTableRow extends QueriesTablePayload {
    datasourceId: number
}

export const SET_QUERIES_TABLE = 'SET_QUERIES_TABLE';
export const SET_QUERIES_DISPLAYED = 'SET_QUERIES_DISPLAYED';
export const SET_QUERIES_TIME_CHART = 'SET_QUERIES_TIME_CHART';
export const SET_QUERIES_CALLS_CHART = 'SET_QUERIES_CALLS_CHART';

export interface SetQueriesTable {
    type: typeof SET_QUERIES_TABLE,
    payload: Array<QueriesTable>
}

export interface SetQueriesDisplayed {
    type: typeof SET_QUERIES_DISPLAYED,
    payload: Array<QueriesTableRow>
}

export interface SetQueriesTimeChart {
    type: typeof SET_QUERIES_TIME_CHART,
    payload: XySeries
}

export interface SetQueriesCallsChart {
    type: typeof SET_QUERIES_CALLS_CHART,
    payload: XySeries
}

export type QueriesActions = SetQueriesTable | SetQueriesDisplayed | SetQueriesTimeChart | SetQueriesCallsChart