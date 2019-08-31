import {differenceInDays, differenceInMinutes, format} from "date-fns";
import {Datasource} from "../_store/datasources/types";

export function FormatTime(start: Date, end: Date, value: Date): string {
    if (differenceInMinutes(end, start) < 15) {
        return format(value, "HH:mm:ss")
    } else if (differenceInDays(end, start) < 1) {
        return format(value, "HH:mm")
    } else if (differenceInDays(end, start) < 7) {
        return format(value, "DD-MM HH:mm")
    } else if (differenceInDays(end, start) < 30) {
        return format(value, "DD-MM")
    } else {
        return format(value, "MM-YYYY")
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