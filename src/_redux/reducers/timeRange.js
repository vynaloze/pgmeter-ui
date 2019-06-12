import moment from 'moment';
import {SET_TIME_RANGE} from "../actions";

const initialTimeRange = {
    start: moment().subtract(1, "hour"),
    end: moment(),
};

export default function (state = initialTimeRange, action) {
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
