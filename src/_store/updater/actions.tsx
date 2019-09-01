import {DECREMENT_LOADING, INCREMENT_LOADING, SET_LAST_UPDATE, SET_LIVE_UPDATES, UpdaterActions} from "./types";

export const setLiveUpdates = (liveUpdates: boolean): UpdaterActions => ({
    type: SET_LIVE_UPDATES,
    payload: liveUpdates
});

export const setLastUpdate = (lastUpdate: Date): UpdaterActions => ({
    type: SET_LAST_UPDATE,
    payload: lastUpdate
});

export const incrementLoading = (): UpdaterActions => ({
    type: INCREMENT_LOADING,
});

export const decrementLoading = (): UpdaterActions => ({
    type: DECREMENT_LOADING,
});