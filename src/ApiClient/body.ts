export default interface TranslateRequest {
    filter: Filter
    params: Array<Params>
}

export interface Filter {
    timestampFrom: number,
    timestampTo: number,
    type: string
}

export interface Params {
    x: Param
    y: Param
    dimension: Array<Param>
}

export interface Param {
    name: string
    type: ParamType
}

export enum ParamType {
    TIMESTAMP = "timestamp",
    DATASOURCE = "datasource",
    KEY = "key",
}

export interface TranslatedStats {
    params: Params
    data: any
}