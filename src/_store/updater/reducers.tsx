import {
    DECREMENT_LOADING,
    INCREMENT_LOADING,
    SET_LAST_UPDATE,
    SET_LIVE_UPDATES,
    UpdaterActions,
    UpdaterState
} from "./types";

const initialState: UpdaterState = {
    liveUpdates: true,
    lastUpdate: undefined,
    loading: 0,
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
        case INCREMENT_LOADING:
            return Object.assign({}, state, {
                loading: state.loading + 1,
            });
        case DECREMENT_LOADING:
            return Object.assign({}, state, {
                loading: state.loading - 1,
            });
        default:
            return state
    }
}
