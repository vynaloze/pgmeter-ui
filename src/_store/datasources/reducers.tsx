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
    label: '%ip%/%database%'
};

export function datasourcesReducer(state = initialState, action: DatasourceActions): DatasourceState {
    switch (action.type) {
        case SET_DATASOURCES:
            const datasources = action.payload;
            console.log(datasources);
            return {
                all: datasources,
                selected: state.selected.filter((s) => datasources.some((d) => s.internalIds.includes(d.id))),
                label: state.label,
            };
        case SET_SELECTED_DATASOURCES:
            return {
                all: state.all,
                selected: action.payload,
                label: state.label,
            };
        case SET_DATASOURCE_LABEL:
            return {
                all: state.all,
                selected: state.selected,
                label: action.payload,
            };
        default:
            return state
    }
}