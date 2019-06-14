import {Moment} from "moment";

export interface TimeRangeState {
    start: Moment
    end: Moment
}

export const SET_TIME_RANGE = "SET_TIME_RANGE";

export interface SetTimeRangeAction {
    type: typeof SET_TIME_RANGE
    payload: {
        start: Moment,
        end: Moment,
    }
}

export type TimeRangeActions = SetTimeRangeAction