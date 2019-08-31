import {SET_DISPLAYED_TIME_RANGE, SET_TIME_RANGE, TimeRangeActions} from "./types";

export const setTimeRange = (start: Date, end: Date): TimeRangeActions => ({
    type: SET_TIME_RANGE,
    payload: {
        start: start,
        end: end,
    }
});

export const setDisplayedTimeRange = (start: Date, end: Date): TimeRangeActions => ({
    type: SET_DISPLAYED_TIME_RANGE,
    payload: {
        start: start,
        end: end,
    }
});
