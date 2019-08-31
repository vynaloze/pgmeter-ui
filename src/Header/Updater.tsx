import React from 'react';
import {connect} from "react-redux";
import {setDisplayedTimeRange, setTimeRange} from "../_store/timeRange/actions";
import {setLastUpdate, setLiveUpdates} from "../_store/updater/actions";
import {UpdaterState} from "../_store/updater/types";
import {AppState} from "../_store";

interface StateFromProps {
    state: UpdaterState
}

interface DispatchFromProps {
    setActualTimeRange: typeof setTimeRange
    setDisplayedTimeRange: typeof setDisplayedTimeRange
    setLiveUpdates: typeof setLiveUpdates
    setLastUpdate: typeof setLastUpdate
}

type Props = StateFromProps & DispatchFromProps


class Updater extends React.Component<Props> {
    render() {
        return (<div>{this.props.state.liveUpdates.toString()}</div>)
    }
}


function mapStateToProps(state: AppState): StateFromProps {
    return {
        state: state.updater,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {
        setActualTimeRange: setTimeRange,
        setDisplayedTimeRange: setDisplayedTimeRange,
        setLiveUpdates: setLiveUpdates,
        setLastUpdate: setLastUpdate
    }
)(Updater);