import {Moment} from "moment";
import {SET_TIME_RANGE, TimeRangeActions} from "./types";

export const setTimeRange = (start: Moment, end: Moment): TimeRangeActions => ({
    type: SET_TIME_RANGE,
    payload: {
        start: start,
        end: end,
    }
});
