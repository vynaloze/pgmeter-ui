import {SET_LAST_UPDATE, SET_LIVE_UPDATES, SET_LOADING, UpdaterActions, UpdaterState} from "./types";

const initialState: UpdaterState = {
    liveUpdates: true,
    lastUpdate: new Date(),
    loading: false,
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
        case SET_LOADING:
            return Object.assign({}, state, {
                loading: action.payload,
            });
        default:
            return state
    }
}
