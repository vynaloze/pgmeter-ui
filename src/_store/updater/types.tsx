export interface UpdaterState {
    liveUpdates: boolean
    lastUpdate?: Date
    loading: number
}

export const SET_LIVE_UPDATES = "SET_LIVE_UPDATES";
export const SET_LAST_UPDATE = "SET_LAST_UPDATE";
export const INCREMENT_LOADING = "INCREMENT_LOADING";
export const DECREMENT_LOADING = "DECREMENT_LOADING";

export interface SetLiveUpdates {
    type: typeof SET_LIVE_UPDATES
    payload: boolean
}

export interface SetLastUpdate {
    type: typeof SET_LAST_UPDATE
    payload: Date
}

export interface IncrementLoading {
    type: typeof INCREMENT_LOADING
}

export interface DecrementLoading {
    type: typeof DECREMENT_LOADING
}

export type UpdaterActions = SetLiveUpdates | SetLastUpdate | IncrementLoading | DecrementLoading