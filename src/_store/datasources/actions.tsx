import {
    BackendDatasource,
    Datasource,
    DatasourceActions,
    SET_DATASOURCE_LABEL,
    SET_DATASOURCES,
    SET_SELECTED_DATASOURCES
} from "./types";

export const setDatasources = (datasources: Array<BackendDatasource>): DatasourceActions => ({
    type: SET_DATASOURCES,
    payload: datasources
});

export const setSelectedDatasources = (selected: Array<Datasource>): DatasourceActions => ({
    type: SET_SELECTED_DATASOURCES,
    payload: selected
});

export const setDatasourceLabel = (label: string): DatasourceActions => ({
    type: SET_DATASOURCE_LABEL,
    payload: label
});