import {IndexesActions, IndexesState, SET_ALL_INDEXES, SET_DISPLAYED_INDEXES, SET_INDEXES_DATA,} from "./types";

const initialState: IndexesState = {
    all: [],
    displayed: [],
    data: {
        overview: [],
        charts: {},
    },
};

export function indexesReducer(state = initialState, action: IndexesActions): IndexesState {
    switch (action.type) {
        case SET_ALL_INDEXES:
            return {
                all: action.payload,
                displayed: state.displayed,
                data: state.data,
            };
        case SET_DISPLAYED_INDEXES:
            return {
                all: state.all,
                displayed: action.payload,
                data: state.data,
            };
        case SET_INDEXES_DATA:
            return {
                all: state.all,
                displayed: state.displayed,
                data: action.payload,
            };
        default:
            return state
    }
}