import {SET_LAST_UPDATE, SET_LIVE_UPDATES, UpdaterActions} from "./types";
import {Moment} from "moment";

export const setLiveUpdates = (liveUpdates: boolean): UpdaterActions => ({
    type: SET_LIVE_UPDATES,
    payload: liveUpdates
});

export const setLastUpdate = (lastUpdate: Moment): UpdaterActions => ({
    type: SET_LAST_UPDATE,
    payload: lastUpdate
});