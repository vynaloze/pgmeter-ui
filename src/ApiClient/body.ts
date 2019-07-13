export default interface TranslateRequest {
    filter: Filter
    params: Params
}

export interface Filter {
    timestampFrom: number,
    timestampTo: number,
    type: string
}

export interface Params {
    x: Param
    y: Param
    dimension: Param
}

export interface Param {
    name: string
    type: ParamType
}

export enum ParamType {
    TIMESTAMP = "timestamp",
    DATASOURCE = "datasource",
    KEY = "key",
    COMPOSITE_KEY = "composite_key"
}