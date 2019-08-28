import {SET_SYSTEM_DATA, SystemActions, SystemState,} from "./types";

const initialState: SystemState = {
    data: {
        cpu: {},
        disk: {},
        load: {},
        net: {},
        virt_mem: {},
        swap_mem: {},
    }
};

export function systemReducer(state = initialState, action: SystemActions): SystemState {
    switch (action.type) {
        case SET_SYSTEM_DATA:
            return {
                data: action.payload
            };
        default:
            return state
    }
}