import {Index, IndexesActions, IndexesData, SET_ALL_INDEXES, SET_DISPLAYED_INDEXES, SET_INDEXES_DATA,} from "./types";

export const setAllIndexes = (data: Array<Index>): IndexesActions => ({
    type: SET_ALL_INDEXES,
    payload: data
});

export const setDisplayedIndexes = (data: Array<Index>): IndexesActions => ({
    type: SET_DISPLAYED_INDEXES,
    payload: data
});

export const setIndexesData = (data: IndexesData): IndexesActions => ({
    type: SET_INDEXES_DATA,
    payload: data
});