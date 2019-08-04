import {Moment} from "moment";

export function FormatTime(start: Moment, end: Moment, value: Moment): string {
    if (end.diff(start, "minutes") < 15) {
        return value.format("HH:mm:ss")
    } else if (end.diff(start, "days") < 1) {
        return value.format("HH:mm")
    } else if (end.diff(start, "weeks") < 1) {
        return value.format("DD/MM HH:mm")
    } else if (end.diff(start, "months") < 1) {
        return value.format("DD/MM")
    } else {
        return value.format("MM/YY")
    }
}