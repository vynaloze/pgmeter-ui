export interface UpdaterState {
    liveUpdates: boolean
    lastUpdate: Date
}

export const SET_LIVE_UPDATES = "SET_LIVE_UPDATES";
export const SET_LAST_UPDATE = "SET_LAST_UPDATE";

export interface SetLiveUpdates {
    type: typeof SET_LIVE_UPDATES
    payload: boolean
}

export interface SetLastUpdate {
    type: typeof SET_LAST_UPDATE
    payload: Date
}

export type UpdaterActions = SetLiveUpdates | SetLastUpdate