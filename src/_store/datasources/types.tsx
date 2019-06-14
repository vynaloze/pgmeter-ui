export interface DatasourceState {
    all: Array<BackendDatasource>
    selected: Array<Datasource>
    label: string
}

export interface BackendDatasource {
    id: number
    ip: string
    hostname: string
    port: number
    database: string,
    tags: JSON
}

export interface Datasource {
    id: number
    label: string
    internalIds: Array<number>
}

export const SET_DATASOURCES = 'SET_DATASOURCES';
export const SET_SELECTED_DATASOURCES = 'SET_SELECTED_DATASOURCES';
export const SET_DATASOURCE_LABEL = 'SET_DATASOURCE_LABEL';

export interface SetDatasources {
    type: typeof SET_DATASOURCES,
    payload: Array<BackendDatasource>
}

export interface SetSelectedDatasources {
    type: typeof SET_SELECTED_DATASOURCES,
    payload: Array<Datasource>
}

export interface SetDatasourceLabel {
    type: typeof SET_DATASOURCE_LABEL,
    payload: string
}

export type DatasourceActions = SetDatasources | SetSelectedDatasources | SetDatasourceLabel