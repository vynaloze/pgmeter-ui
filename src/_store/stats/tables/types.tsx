import {XySeries} from "../types";

export interface TablesState {
    all: Array<Table>
    displayed: Array<Table>
    tableData: TablesData
}

export interface Table {
    id: number
    label: string
}

export interface TablesData {
    entries: Entries
    events: Events
}

export interface Entries {
    seq_scan: Entry
    seq_tup_fetch: Entry
    idx_scan: Entry
    idx_tup_fetch: Entry
    live_tup: Entry
    dead_tup: Entry
    ins_tup: Entry
    upd_tup: Entry
    del_tup: Entry
    // cacheHits: Entry
    // indexHits: Entry
    // toastCacheHits: Entry
    // toastIndexHits: Entry
    vacuum_count: Entry
    autovacuum_count: Entry
    analyze_count: Entry
    autoanalyze_count: Entry
}

export interface Entry {
    last?: number
    chartData?: XySeries
}

export interface Events {
    last_vacuum?: Date
    last_autovacuum?: Date
    last_analyze?: Date
    last_autoanalyze?: Date
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