import {
    DatasourceActions,
    DatasourceState,
    SET_DATASOURCE_LABEL,
    SET_DATASOURCES,
    SET_SELECTED_DATASOURCES
} from "./types";

const initialState: DatasourceState = {
    all: [],
    selected: [],
    labelTemplate: '%ip%/%database%'
};

export function datasourcesReducer(state = initialState, action: DatasourceActions): DatasourceState {
    switch (action.type) {
        case SET_DATASOURCES:
            const datasources = action.payload;
            return {
                all: datasources,
                selected: state.selected.filter((s) => datasources.some((d) => s.id === d.id)),
                labelTemplate: state.labelTemplate,
            };
        case SET_SELECTED_DATASOURCES:
            return {
                all: state.all,
                selected: action.payload,
                labelTemplate: state.labelTemplate,
            };
        case SET_DATASOURCE_LABEL:
            return {
                all: state.all,
                selected: state.selected,
                labelTemplate: action.payload,
            };
        default:
            return state
    }
}