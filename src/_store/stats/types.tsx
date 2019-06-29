import {Datasource} from "../datasources/types";

export interface Table {
    timestamp: number
    datasource: Datasource
    id: string
}