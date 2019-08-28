import {XySeries} from "../types";

export interface SystemState {
    data: SystemData
}

export interface SystemData {
    cpu: Cpu
    disk: Disk
    load: Load
    net: Net
    virt_mem: VirtMem
    swap_mem: SwapMem
}

export interface Cpu {
    usage_percent?: XySeries
}

export interface Disk {
    bytes_available?: XySeries
    reads?: XySeries
    writes?: XySeries
    bytes_read?: XySeries
    bytes_write?: XySeries
}

export interface Load {
    load1?: XySeries
    load5?: XySeries
    load15?: XySeries
}

export interface Net {
    bytes_in?: XySeries
    bytes_out?: XySeries
}

export interface VirtMem {
    available?: XySeries
}

export interface SwapMem {
    available?: XySeries
}

export const SET_SYSTEM_DATA = 'SET_SYSTEM_DATA';

export interface SetSystemData {
    type: typeof SET_SYSTEM_DATA,
    payload: SystemData
}

export type SystemActions = SetSystemData