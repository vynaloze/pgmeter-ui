import {SET_LAST_UPDATE, SET_LIVE_UPDATES, UpdaterActions} from "./types";

export const setLiveUpdates = (liveUpdates: boolean): UpdaterActions => ({
    type: SET_LIVE_UPDATES,
    payload: liveUpdates
});

export const setLastUpdate = (lastUpdate: Date): UpdaterActions => ({
    type: SET_LAST_UPDATE,
    payload: lastUpdate
});