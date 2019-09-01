import React from 'react';
import {connect} from "react-redux";
import {AppState} from "../_store";
import {setDisplayedTimeRange, setTimeRange} from "../_store/timeRange/actions";
import './TimeRange.css'
import {TimeRangeState} from "../_store/timeRange/types";
import {setLiveUpdates} from "../_store/updater/actions";
// @ts-ignore
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker'
// @ts-ignore
import onClickOutside from "react-onclickoutside";
import {differenceInMilliseconds} from "date-fns";

interface StateFromProps {
    state: TimeRangeState
}

interface DispatchFromProps {
    setActualTimeRange: typeof setTimeRange
    setDisplayedTimeRange: typeof setDisplayedTimeRange
    setLiveUpdates: typeof setLiveUpdates
}

type Props = StateFromProps & DispatchFromProps

interface InternalState {
    focusedOnBox: boolean
}


class TimeRange extends React.Component<Props, InternalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            focusedOnBox: false
        };
        this.onChange = this.onChange.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.onRangePickerClicked = this.onRangePickerClicked.bind(this);
        this.onRangePickerClosed = this.onRangePickerClosed.bind(this);
    }

    onChange(date: Array<Date>) {
        // if end date is not now (or almost now), stop the live updates
        if (differenceInMilliseconds(new Date(), date[1]) > 1000) {
            this.props.setLiveUpdates(false);
        }
        this.props.setDisplayedTimeRange(date[0], date[1]);
    }

    onRangePickerClicked() {
        this.setState({
            focusedOnBox: true
        });
        this.props.setLiveUpdates(false);
        console.log("click") //todo open quick ranges
    }

    onRangePickerClosed() {
        if (this.state.focusedOnBox) {
            this.props.setActualTimeRange(this.props.state.displayedTimeRange.start, this.props.state.displayedTimeRange.end);
            this.setState({
                focusedOnBox: false
            });
        }
    }

    // don't delete me
    handleClickOutside = () => {
        this.onRangePickerClosed();
    };

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
                    onCalendarClose={this.onRangePickerClosed}
                    value={[this.props.state.displayedTimeRange.start, this.props.state.displayedTimeRange.end]}
                />
            </div>
        );
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        state: state.timeRange,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setActualTimeRange: setTimeRange, setDisplayedTimeRange: setDisplayedTimeRange, setLiveUpdates: setLiveUpdates}
)(onClickOutside(TimeRange));
