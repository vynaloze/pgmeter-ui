import moment from "moment";
import {SET_LAST_UPDATE, SET_LIVE_UPDATES, UpdaterActions, UpdaterState} from "./types";

const initialState: UpdaterState = {
    liveUpdates: true,
    lastUpdate: moment()
};

export function updaterReducer(state = initialState, action: UpdaterActions): UpdaterState {
    switch (action.type) {
        case SET_LIVE_UPDATES:
            return Object.assign({}, state, {
                liveUpdates: action.payload,
            });
        case SET_LAST_UPDATE:
            return Object.assign({}, state, {
                lastUpdate: action.payload,
            });
        default:
            return state
    }
}
