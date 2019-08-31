export interface UpdaterState {
    liveUpdates: boolean
    lastUpdate: Date
    loading: boolean
}

export const SET_LIVE_UPDATES = "SET_LIVE_UPDATES";
export const SET_LAST_UPDATE = "SET_LAST_UPDATE";
export const SET_LOADING = "SET_LOADING";

export interface SetLiveUpdates {
    type: typeof SET_LIVE_UPDATES
    payload: boolean
}

export interface SetLastUpdate {
    type: typeof SET_LAST_UPDATE
    payload: Date
}

export interface SetLoading {
    type: typeof SET_LOADING
    payload: boolean
}

export type UpdaterActions = SetLiveUpdates | SetLastUpdate | SetLoading