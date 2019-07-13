import {Datasource} from "../datasources/types";

export interface Table {
    timestamp: number
    datasource: Datasource
    id: string
}

export interface XySeries {
    labels: Array<any>
    datasets: Array<Series>
}

export interface Series {
    label: any
    data: Array<any>
}