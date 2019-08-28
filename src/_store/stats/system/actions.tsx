import {SET_SYSTEM_DATA, SystemActions, SystemData,} from "./types";

export const setSystemData = (data: SystemData): SystemActions => ({
    type: SET_SYSTEM_DATA,
    payload: data
});
