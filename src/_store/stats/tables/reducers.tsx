import {SET_ALL_TABLES, SET_DISPLAYED_TABLES, SET_TABLES_DATA, TablesActions, TablesState,} from "./types";

const initialState: TablesState = {
    all: [],
    displayed: [],
    data: {
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
                data: state.data,
            };
        case SET_DISPLAYED_TABLES:
            return {
                all: state.all,
                displayed: action.payload,
                data: state.data,
            };
        case SET_TABLES_DATA:
            return {
                all: state.all,
                displayed: state.displayed,
                data: action.payload,
            };
        default:
            return state
    }
}