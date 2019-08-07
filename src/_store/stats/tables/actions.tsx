import {SET_ALL_TABLES, SET_DISPLAYED_TABLES, SET_TABLES_DATA, Table, TablesActions, TablesData,} from "./types";

export const setAllTables = (data: Array<Table>): TablesActions => ({
    type: SET_ALL_TABLES,
    payload: data
});

export const setDisplayedTables = (data: Array<Table>): TablesActions => ({
    type: SET_DISPLAYED_TABLES,
    payload: data
});

export const setTablesData = (data: TablesData): TablesActions => ({
    type: SET_TABLES_DATA,
    payload: data
});
