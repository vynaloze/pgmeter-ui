import {SET_ALL_TABLES, SET_DISPLAYED_TABLES, SET_TABLES_DATA, TablesActions, TablesState,} from "./types";

const initialState: TablesState = {
    all: [],
    displayed: [],
    tableData: {
        entries: {
            seq_scan: {},
            seq_tup_fetch: {},
            idx_scan: {},
            idx_tup_fetch: {},
            live_tup: {},
            dead_tup: {},
            ins_tup: {},
            upd_tup: {},
            del_tup: {},
            // cacheHits: {}
            // indexHits: {}
            // toastCacheHits: {}
            // toastIndexHits: {}
            vacuum_count: {},
            autovacuum_count: {},
            analyze_count: {},
            autoanalyze_count: {},
        },
        events: {}
    },
};

export function tablesReducer(state = initialState, action: TablesActions): TablesState {
    switch (action.type) {
        case SET_ALL_TABLES:
            return {
                all: action.payload,
                displayed: state.displayed,
                tableData: state.tableData,
            };
        case SET_DISPLAYED_TABLES:
            return {
                all: state.all,
                displayed: action.payload,
                tableData: state.tableData,
            };
        case SET_TABLES_DATA:
            return {
                all: state.all,
                displayed: state.displayed,
                tableData: action.payload,
            };
        default:
            return state
    }
}