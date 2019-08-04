export interface DatasourceState {
    all: Array<Datasource>
    selected: Array<Datasource>
    maxSelected: number
    labelTemplate: string
}

export interface Datasource {
    id: number
    ip: string
    hostname?: string
    port?: number
    database: string,
    tags: JSON
}

export const SET_DATASOURCES = 'SET_DATASOURCES';
export const SET_SELECTED_DATASOURCES = 'SET_SELECTED_DATASOURCES';
export const SET_MAX_SELECTED_DATASOURCES = 'SET_MAX_SELECTED_DATASOURCES';
export const SET_DATASOURCE_LABEL = 'SET_DATASOURCE_LABEL';

export interface SetDatasources {
    type: typeof SET_DATASOURCES,
    payload: Array<Datasource>
}

export interface SetSelectedDatasources {
    type: typeof SET_SELECTED_DATASOURCES,
    payload: Array<Datasource>
}

export interface SetMaxSelectedDatasources {
    type: typeof SET_MAX_SELECTED_DATASOURCES,
    payload: number
}

export interface SetDatasourceLabel {
    type: typeof SET_DATASOURCE_LABEL,
    payload: string
}

export type DatasourceActions = SetDatasources | SetSelectedDatasources | SetMaxSelectedDatasources | SetDatasourceLabel