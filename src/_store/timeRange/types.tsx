export interface TimeRangeState extends TimeRange {
    displayedTimeRange: TimeRange
}

export interface TimeRange {
    start: Date
    end: Date
}

export const SET_TIME_RANGE = "SET_TIME_RANGE";
export const SET_DISPLAYED_TIME_RANGE = "SET_DISPLAYED_TIME_RANGE";

export interface SetTimeRange {
    type: typeof SET_TIME_RANGE
    payload: TimeRange
}

export interface SetDisplayedTimeRange {
    type: typeof SET_DISPLAYED_TIME_RANGE
    payload: TimeRange
}

export type TimeRangeActions = SetTimeRange | SetDisplayedTimeRange