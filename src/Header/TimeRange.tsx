import React from 'react';
import {connect} from "react-redux";
// @ts-ignore
import DateTimeRangeContainer from 'react-advanced-datetimerange-picker'
import moment, {Moment} from "moment"
import {AppState} from "../_store";
import {setDisplayedTimeRange, setTimeRange} from "../_store/timeRange/actions";
import './TimeRange.css'
import {TimeRangeState} from "../_store/timeRange/types";
import {setLiveUpdates} from "../_store/updater/actions";
import {UpdaterState} from "../_store/updater/types";

interface StateFromProps {
    state: TimeRangeState
    updaterState: UpdaterState
}

interface DispatchFromProps {
    setActualTimeRange: typeof setTimeRange
    setDisplayedTimeRange: typeof setDisplayedTimeRange
    setLiveUpdates: typeof setLiveUpdates
}

type Props = StateFromProps & DispatchFromProps

class TimeRange extends React.Component<Props> {
    private interval?: NodeJS.Timer;

    constructor(props: any) {
        super(props);
        this.applyCallback = this.applyCallback.bind(this);
        this.autoUpdate = this.autoUpdate.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(() => this.autoUpdate(), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval as NodeJS.Timer);
    }

    autoUpdate() {
        if (this.props.updaterState.liveUpdates) {
            this.props.setDisplayedTimeRange(this.props.state.displayedTimeRange.start.clone().add("second", 1),
                this.props.state.displayedTimeRange.end.clone().add("second", 1));
            // fixme for sure
        }
    }

    applyCallback(startDate: Moment, endDate: Moment) {
        // if endDate is not now (or almost now), stop the live updates
        if (moment.duration(moment().diff(endDate)).asSeconds() > 1) {
            this.props.setLiveUpdates(false);
        }
        this.props.setDisplayedTimeRange(startDate, endDate);
        this.props.setActualTimeRange(startDate, endDate);
    }

    render() {
        const ranges = {
            // "Last 15 min": [this.state.now.clone().subtract(15, "minute"), this.state.now],
            // "Last 30 min": [this.state.now.clone().subtract(30, "minute"), this.state.now],
            // "Last 1 hour": [this.state.now.clone().subtract(1, "hour"), this.state.now],
            // "Last 3 hours": [this.state.now.clone().subtract(3, "hour"), this.state.now],
            // "Last 12 hours": [this.state.now.clone().subtract(12, "hour"), this.state.now],
            // "Last 24 hours": [this.state.now.clone().subtract(24, "hour"), this.state.now],
            // "Last 2 days": [this.state.now.clone().subtract(2, "day"), this.state.now],
            // "Last 7 days": [this.state.now.clone().subtract(7, "day"), this.state.now],
            // "Last 30 days": [this.state.now.clone().subtract(30, "day"), this.state.now],
            // "Last 90 days": [this.state.now.clone().subtract(90, "day"), this.state.now],
        }; //fixme - get rid of this shitty moment.js lib
        const local = {
            "format": "DD-MM-YYYY HH:mm:ss",
            "sundayFirst": false
        };
        return (
            <div className="TimeRange horizontal">
                <DateTimeRangeContainer
                    ranges={ranges}
                    start={this.props.state.displayedTimeRange.start}
                    end={this.props.state.displayedTimeRange.end}
                    local={local}
                    applyCallback={this.applyCallback}
                    autoApply={true}
                >
                    <div className="click-area"/>
                </DateTimeRangeContainer>
                <input
                    value={this.props.state.displayedTimeRange.start.format(local.format) + " / " + this.props.state.displayedTimeRange.end.format(local.format)}
                    type="text" className="info-box" readOnly={true}/>
            </div>
        );
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        state: state.timeRange,
        updaterState: state.updater
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setActualTimeRange: setTimeRange, setDisplayedTimeRange: setDisplayedTimeRange, setLiveUpdates: setLiveUpdates}
)(TimeRange);
