import {SET_DATASOURCE_LABEL, UPDATE_DATASOURCES, UPDATE_SELECTED_DATASOURCES} from "../actions";

const initialState = {
    all: [],
    selected: [],
    label: '%ip%/%database%'
};

export default function (state = initialState, action) {
    switch (action.type) {
        case UPDATE_DATASOURCES:
            const datasources = action.payload.datasources;
            return {
                all: datasources,
                selected: state.selected.filter((ds) => datasources.includes(ds)),
                label: state.label,
            };
        case UPDATE_SELECTED_DATASOURCES:
            return {
                all: state.all,
                selected: action.payload.selected,
                label: state.label,
            };
        case SET_DATASOURCE_LABEL:
            return {
                all: state.all,
                selected: state.selected,
                label: action.payload.label,
            };
        default:
            return state
    }
}