import {XySeries} from "../types";

export interface IndexesState {
    all: Array<Index>
    displayed: Array<Index>
    data: IndexesData
}

export interface Index {
    id: number      // internal id
    label: string   // index name
    group: string   // "human" datasource + table name
    table: string
    datasourceId: number
}

export interface IndexesData {
    overview: Array<IndexesTableEntry>
    charts: IndexesXyPayload
}

export interface IndexesTableEntry extends IndexesTablePayload {
    datasourceId: number
}

export interface IndexesTablePayload {
    table: string
    index: string
    idx_scan: number
    idx_tup_read: number
    idx_tup_fetch: number
}

export interface IndexesXyPayload {
    idx_scan?: XySeries
    idx_tup_read?: XySeries
    idx_tup_fetch?: XySeries
}

export const SET_ALL_INDEXES = 'SET_ALL_INDEXES';
export const SET_DISPLAYED_INDEXES = 'SET_DISPLAYED_INDEXES';
export const SET_INDEXES_DATA = 'SET_INDEXES_DATA';

export interface SetAllIndexes {
    type: typeof SET_ALL_INDEXES,
    payload: Array<Index>
}

export interface SetDisplayedIndexes {
    type: typeof SET_DISPLAYED_INDEXES,
    payload: Array<Index>
}

export interface SetIndexesData {
    type: typeof SET_INDEXES_DATA,
    payload: IndexesData
}

export type IndexesActions = SetAllIndexes | SetDisplayedIndexes | SetIndexesData