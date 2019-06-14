import moment from "moment";
import {SET_TIME_RANGE, TimeRangeActions, TimeRangeState} from "./types";

const initialTimeRange: TimeRangeState = {
    start: moment().subtract(1, "hour"),
    end: moment(),
};

export function timeRangeReducer(state = initialTimeRange, action: TimeRangeActions): TimeRangeState {
    switch (action.type) {
        case SET_TIME_RANGE:
            return Object.assign({}, state, {
                start: action.payload.start,
                end: action.payload.end,
            });
        default:
            return state
    }
}
