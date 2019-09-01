import React from 'react';
import {connect} from "react-redux";
import {setDisplayedTimeRange, setTimeRange} from "../_store/timeRange/actions";
import {setLastUpdate, setLiveUpdates} from "../_store/updater/actions";
import {UpdaterState} from "../_store/updater/types";
import {AppState} from "../_store";
import {TimeRangeState} from "../_store/timeRange/types";
import {differenceInSeconds, formatDistanceToNow, subSeconds} from "date-fns";
import Switch from "react-switch";
import './Updater.css'

interface StateFromProps {
    state: UpdaterState
    timeRange: TimeRangeState
}

interface DispatchFromProps {
    setActualTimeRange: typeof setTimeRange
    setDisplayedTimeRange: typeof setDisplayedTimeRange
    setLiveUpdates: typeof setLiveUpdates
    setLastUpdate: typeof setLastUpdate
}

type Props = StateFromProps & DispatchFromProps


class Updater extends React.Component<Props> {
    private interval?: NodeJS.Timer;

    constructor(props: Props) {
        super(props);
        this.autoUpdate = this.autoUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => this.autoUpdate(), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval as NodeJS.Timer);
    }

    autoUpdate() {
        if (this.props.state.liveUpdates) {
            const period = differenceInSeconds(this.props.timeRange.displayedTimeRange.end, this.props.timeRange.displayedTimeRange.start);
            this.props.setDisplayedTimeRange(subSeconds(new Date(), period), new Date());
        }
    }

    handleChange(checked: boolean) {
        this.props.setLiveUpdates(checked);
    }

    render() {
        return (
            <div className="container-fluid no-padding" style={{minWidth: "190px"}}>
                <div className="row no-gutters justify-content-end">
                    <div className="col">
                        {this.props.state.loading > 0 ?
                            <svg className="i-reload float-right" viewBox="0 0 32 32" width="24" height="24" fill="none"
                                 stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                <path
                                    d="M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2"/>
                            </svg>
                            : null}
                    </div>
                    <div className="col">
                        <div className="row no-gutters">
                            <div className="col">
                                <div className="float-right">
                                    <Switch
                                        checked={this.props.state.liveUpdates}
                                        onChange={this.handleChange}
                                        onColor="#275889"
                                        onHandleColor="#55c8f0"
                                        handleDiameter={21}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                        height={12}
                                        width={32}
                                        className=""
                                        id="material-switch"
                                    />
                                </div>
                            </div>
                            <div className="col">
                                {this.props.state.liveUpdates ?
                                    <div className="live-text">
                                        <span className="glow">LIVE</span>
                                    </div>
                                    :
                                    <div className="live-text">
                                        <span>LIVE</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row no-gutters small-text float-right text-right">
                    {this.props.state.lastUpdate !== undefined ?
                        <div>updated {formatDistanceToNow(this.props.state.lastUpdate, {
                            includeSeconds: true,
                            addSuffix: true
                        })}</div>
                        : null}
                </div>
            </div>
        )
    }
}


function mapStateToProps(state: AppState): StateFromProps {
    return {
        state: state.updater,
        timeRange: state.timeRange
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