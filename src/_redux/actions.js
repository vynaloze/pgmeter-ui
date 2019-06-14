export const SET_TIME_RANGE = "SET_TIME_RANGE";
export const UPDATE_DATASOURCES = 'UPDATE_DATASOURCES';
export const UPDATE_SELECTED_DATASOURCES = 'UPDATE_SELECTED_DATASOURCES';
export const SET_DATASOURCE_LABEL = 'SET_DATASOURCE_LABEL';


export const setTimeRange = (start, end) => ({
    type: SET_TIME_RANGE,
    payload: {
        start: start,
        end: end,
    }
});

export const updateDatasources = (datasources) => ({
    type: UPDATE_DATASOURCES,
    payload: {
        datasources: datasources
    }
});

export const updateSelectedDatasources = (selected) => ({
    type: UPDATE_SELECTED_DATASOURCES,
    payload: {
        selected: selected
    }
});

export const setDatasourceLabel = (label) => ({
    type: SET_DATASOURCE_LABEL,
    payload: {
        label: label
    }
});