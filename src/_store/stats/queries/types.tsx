import {Table} from "../types";

export interface QueriesState {
    table: Array<QueriesTable>
    timeChart: any
    callsChart: any
}

export interface QueriesTable extends Table {
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

export const SET_QUERIES_TABLE = 'SET_QUERIES_TABLE';
export const SET_QUERIES_TIME_CHART = 'SET_QUERIES_TIME_CHART';
export const SET_QUERIES_CALLS_CHART = 'SET_QUERIES_CALLS_CHART';

export interface SetQueriesTable {
    type: typeof SET_QUERIES_TABLE,
    payload: Array<QueriesTable>
}

export interface SetQueriesTimeChart {
    type: typeof SET_QUERIES_TIME_CHART,
    payload: any
}

export interface SetQueriesCallsChart {
    type: typeof SET_QUERIES_CALLS_CHART,
    payload: any
}

export type QueriesActions = SetQueriesTable | SetQueriesTimeChart | SetQueriesCallsChart