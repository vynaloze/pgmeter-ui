import {SET_ALL_TABLES, SET_DISPLAYED_TABLES, SET_TABLES_DATA, TablesActions, TablesState,} from "./types";

const initialState: TablesState = {
    all: [],
    displayed: [],
    tablesData: {
        overview: [],
        charts: {},
    },
};

export function tablesReducer(state = initialState, action: TablesActions): TablesState {
    switch (action.type) {
        case SET_ALL_TABLES:
            return {
                all: action.payload,
                displayed: state.displayed,
                tablesData: state.tablesData,
            };
        case SET_DISPLAYED_TABLES:
            return {
                all: state.all,
                displayed: action.payload,
                tablesData: state.tablesData,
            };
        case SET_TABLES_DATA:
            return {
                all: state.all,
                displayed: state.displayed,
                tablesData: action.payload,
            };
        default:
            return state
    }
}