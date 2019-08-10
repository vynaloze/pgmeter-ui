export interface DatasourceState {
    all: Array<Datasource>
    selected: Array<Datasource>
    allBackend: Array<BackendDatasource>
    selectedBackend: Array<BackendDatasource>
    labelTemplate: string
}

export interface BackendDatasource {
    id: number
    ip: string
    hostname?: string
    port?: number
    database: string,
    tags: JSON
}

export interface Datasource {
    id: number
    label: string
    representedBy: Array<BackendDatasource>
}

export const SET_DATASOURCES = 'SET_DATASOURCES';
export const SET_SELECTED_DATASOURCES = 'SET_SELECTED_DATASOURCES';
export const SET_BACKEND_DATASOURCES = 'SET_BACKEND_DATASOURCES';
export const SET_SELECTED_BACKEND_DATASOURCES = 'SET_SELECTED_BACKEND_DATASOURCES';
export const SET_DATASOURCE_LABEL = 'SET_DATASOURCE_LABEL';

export interface SetDatasources {
    type: typeof SET_DATASOURCES,
    payload: Array<Datasource>
}

export interface SetSelectedDatasources {
    type: typeof SET_SELECTED_DATASOURCES,
    payload: Array<Datasource>
}

export interface SetBackendDatasources {
    type: typeof SET_BACKEND_DATASOURCES,
    payload: Array<BackendDatasource>
}

export interface SetSelectedBackendDatasources {
    type: typeof SET_SELECTED_BACKEND_DATASOURCES,
    payload: Array<BackendDatasource>
}

export interface SetDatasourceLabel {
    type: typeof SET_DATASOURCE_LABEL,
    payload: string
}

export type DatasourceActions =
    SetDatasources
    | SetSelectedDatasources
    | SetBackendDatasources
    | SetSelectedBackendDatasources
    | SetDatasourceLabel