import {subDays} from "date-fns";
import {SET_DISPLAYED_TIME_RANGE, SET_TIME_RANGE, TimeRangeActions, TimeRangeState} from "./types";

const initialTimeRange: TimeRangeState = {
    start: subDays(new Date(), 1),
    end: new Date(),

    displayedTimeRange: {
        start: subDays(new Date(), 1),
        end: new Date(),
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
