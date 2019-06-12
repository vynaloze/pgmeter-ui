export const SET_TIME_RANGE = "SET_TIME_RANGE";


export const setTimeRange = (start, end) => ({
    type: SET_TIME_RANGE,
    payload: {
        start: start,
        end: end,
    }
});
