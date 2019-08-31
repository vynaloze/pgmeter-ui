import moment from "moment";
import {SET_DISPLAYED_TIME_RANGE, SET_TIME_RANGE, TimeRangeActions, TimeRangeState} from "./types";

const initialTimeRange: TimeRangeState = {
    start: moment().subtract(90, "day"),
    end: moment(),

    displayedTimeRange: {
        start: moment().subtract(90, "day"),
        end: moment(),
    },
};

export function timeRangeReducer(state = initialTimeRange, action: TimeRangeActions): TimeRangeState {
    switch (action.type) {
        case SET_TIME_RANGE:
            return Object.assign({}, state, {
                start: action.payload.start,
                end: action.payload.end,
            });
        case SET_DISPLAYED_TIME_RANGE:
            return Object.assign({}, state, {
                displayedTimeRange: {
                    start: action.payload.start,
                    end: action.payload.end,
                }
            });
        default:
            return state
    }
}
