import {Moment} from "moment";
import {Datasource} from "../_store/datasources/types";

export function FormatTime(start: Moment, end: Moment, value: Moment): string {
    if (end.diff(start, "minutes") < 15) {
        return value.format("HH:mm:ss")
    } else if (end.diff(start, "days") < 1) {
        return value.format("HH:mm")
    } else if (end.diff(start, "weeks") < 1) {
        return value.format("DD-MM HH:mm")
    } else if (end.diff(start, "months") < 1) {
        return value.format("DD-MM")
    } else {
        return value.format("MM-YYYY")
    }
}

export function GetLabelFromBackendDatasource(id: number, datasources: Array<Datasource>): string {
    const datasource = datasources.find(d => d.representedBy.map(bd => bd.id).includes(id));
    if (datasource !== undefined) return datasource.label;
    return "";
}

export function SelectedDatasourcesHaveChanged(datasources1: Array<Datasource>, datasources2: Array<Datasource>): boolean {
    if (datasources1.length !== datasources2.length) return true;
    const ids1 = datasources1.map(ds => ds.id);
    const ids2 = datasources2.map(ds => ds.id);
    return !(ids1.every(id => ids2.includes(id)) && ids2.every(id => ids1.includes(id)));
}