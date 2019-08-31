import React from 'react';
import {connect} from "react-redux";
import {AppState} from "../_store";
import {setDisplayedTimeRange, setTimeRange} from "../_store/timeRange/actions";
import './TimeRange.css'
import {TimeRangeState} from "../_store/timeRange/types";
import {setLiveUpdates} from "../_store/updater/actions";
import {UpdaterState} from "../_store/updater/types";
// @ts-ignore
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker'
// @ts-ignore
import onClickOutside from "react-onclickoutside";

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
        this.onChange = this.onChange.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);

        // this.autoUpdate = this.autoUpdate.bind(this);
    }

    // componentDidMount() {
    //     this.interval = setInterval(() => this.autoUpdate(), 1000)
    // }
    //
    // componentWillUnmount() {
    //     clearInterval(this.interval as NodeJS.Timer);
    // }

    // autoUpdate() {
    //     if (this.props.updaterState.liveUpdates) {
    //         this.props.setDisplayedTimeRange(this.props.state.displayedTimeRange.start.clone().add("second", 1),
    //             this.props.state.displayedTimeRange.end.clone().add("second", 1));
    //         // fixme for sure
    //     }
    // }

    onChange(date: Array<Date>) {
        this.props.setDisplayedTimeRange(date[0], date[1]);

    }

    onRangePickerClicked() {
        console.log("click") //todo open quick ranges
    }

    // don't delete me
    handleClickOutside = () => {
        this.props.setActualTimeRange(this.props.state.displayedTimeRange.start, this.props.state.displayedTimeRange.end);
    };

    // applyCallback(startDate: Moment, endDate: Moment) {
    //     // if endDate is not now (or almost now), stop the live updates
    //     if (moment.duration(moment().diff(endDate)).asSeconds() > 1) {
    //         this.props.setLiveUpdates(false);
    //     }
    //     this.props.setDisplayedTimeRange(startDate, endDate);
    //     this.props.setActualTimeRange(startDate, endDate);
    // }

    render() {
        // const ranges = {
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
        // }; //fixme - implement quick ranges by myself
        return (
            <div className="TimeRange" onClick={this.onRangePickerClicked}>
                <DateTimeRangePicker
                    calendarIcon={null}
                    clearIcon={null}
                    disableClock={true}
                    format={"yyyy-MM-dd H:mm:ss"}
                    onChange={this.onChange}
                    onCalendarClose={this.handleClickOutside}
                    value={[this.props.state.displayedTimeRange.start, this.props.state.displayedTimeRange.end]}
                />
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
)(onClickOutside(TimeRange));
