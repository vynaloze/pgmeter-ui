import {XySeries} from "../types";

export interface TablesState {
    all: Array<Table>
    displayed: Array<Table>
    tablesData: TablesData
}

export interface Table {
    id: number
    label: string
}

export interface TablesData {
    overview: Array<TablesTablePayload>
    charts: TablesXyPayload
}

export interface TablesTablePayload {
    table: string
    seq_scan: number
    seq_tup_fetch: number
    idx_scan: number
    idx_tup_fetch: number
    live_tup: number
    dead_tup: number
    ins_tup: number
    upd_tup: number
    del_tup: number
    last_vacuum: Date
    last_autovacuum: Date
    last_analyze: Date
    last_autoanalyze: Date
    vacuum_count: number
    autovacuum_count: number
    analyze_count: number
    autoanalyze_count: number
}

// todo IO stats
// cacheHits: number
// indexHits: number
// toastCacheHits: number
// toastIndexHits: number

export interface TablesXyPayload {
    seq_scan?: XySeries
    seq_tup_fetch?: XySeries
    idx_scan?: XySeries
    idx_tup_fetch?: XySeries
    live_tup?: XySeries
    dead_tup?: XySeries
    ins_tup?: XySeries
    upd_tup?: XySeries
    del_tup?: XySeries
    // todo IO stats
    // cacheHits?: XySeries
    // indexHits?: XySeries
    // toastCacheHits?: XySeries
    // toastIndexHits?: XySeries
    vacuum_count?: XySeries
    autovacuum_count?: XySeries
    analyze_count?: XySeries
    autoanalyze_count?: XySeries
}

export const SET_ALL_TABLES = 'SET_ALL_TABLES';
export const SET_DISPLAYED_TABLES = 'SET_DISPLAYED_TABLES';
export const SET_TABLES_DATA = 'SET_TABLES_DATA';

export interface SetAllTables {
    type: typeof SET_ALL_TABLES,
    payload: Array<Table>
}

export interface SetDisplayedTables {
    type: typeof SET_DISPLAYED_TABLES,
    payload: Array<Table>
}

export interface SetTableData {
    type: typeof SET_TABLES_DATA,
    payload: TablesData
}

export type TablesActions = SetAllTables | SetDisplayedTables | SetTableData