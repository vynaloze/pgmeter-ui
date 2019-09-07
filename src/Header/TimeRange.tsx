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
import {differenceInMilliseconds, subDays, subHours, subMinutes} from "date-fns";
import QuickRanges from "./QuickRanges";

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
    calendarOpen: boolean
    quickRangesOpen: boolean
    selectedQuickRange: string | null
}


class TimeRange extends React.Component<Props, InternalState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            calendarOpen: false,
            quickRangesOpen: false,
            selectedQuickRange: "24 hours",
        };

        this.onChange = this.onChange.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.onRangePickerClicked = this.onRangePickerClicked.bind(this);
        this.onRangePickerClosed = this.onRangePickerClosed.bind(this);
        this.setQuickTime = this.setQuickTime.bind(this);
    }

    onChange(date: Array<Date>) {
        this.setState({selectedQuickRange: null});
        // if end date is not now (or almost now), stop the live updates
        if (differenceInMilliseconds(new Date(), date[1]) > 1000) {
            this.props.setLiveUpdates(false);
        }
        this.props.setDisplayedTimeRange(date[0], date[1]);
    }

    onRangePickerClicked() {
        this.setState({
            calendarOpen: true,
            quickRangesOpen: true,
        });
        this.props.setLiveUpdates(false);
    }

    onRangePickerClosed() {
        if (this.state.calendarOpen) {
            this.props.setActualTimeRange(this.props.state.displayedTimeRange.start, this.props.state.displayedTimeRange.end);
            this.setState({
                calendarOpen: false,
                quickRangesOpen: false,
            });
        }
    }

    // don't delete me
    handleClickOutside = () => {
        this.onRangePickerClosed();
        this.setState({
            calendarOpen: false,
            quickRangesOpen: false,
        });
    };

    setQuickTime(amount: number, unit: string) {
        const end = new Date();
        let start;
        switch (unit) {
            case "min":
                start = subMinutes(end, amount);
                break;
            case "hour":
                start = subHours(end, amount);
                break;
            case "day":
                start = subDays(end, amount);
                break;
            default:
                start = new Date();
        }
        this.props.setDisplayedTimeRange(start, end);
        this.props.setActualTimeRange(start, end);
        this.props.setLiveUpdates(true);
        this.setState({
            selectedQuickRange: amount + " " + unit,
        });
    }

    render() {
        const ranges = [
            {title: "Last 15 min", onClick: () => this.setQuickTime(15, "min")},
            {title: "Last 30 min", onClick: () => this.setQuickTime(30, "min")},
            {title: "Last 1 hour", onClick: () => this.setQuickTime(1, "hour")},
            {title: "Last 3 hours", onClick: () => this.setQuickTime(3, "hour")},
            {title: "Last 12 hours", onClick: () => this.setQuickTime(12, "hour")},
            {title: "Last 24 hours", onClick: () => this.setQuickTime(24, "hour")},
            {title: "Last 2 days", onClick: () => this.setQuickTime(2, "day")},
            {title: "Last 7 days", onClick: () => this.setQuickTime(7, "day")},
            {title: "Last 30 days", onClick: () => this.setQuickTime(30, "day")},
            {title: "Last 90 days", onClick: () => this.setQuickTime(90, "day")},
        ];

        return (
            <div className="TimeRange" onClick={this.onRangePickerClicked}>
                <DateTimeRangePicker
                    calendarIcon={null}
                    clearIcon={null}
                    disableClock={true}
                    format={"yyyy-MM-dd H:mm:ss"}
                    isCalendarOpen={this.state.calendarOpen}
                    onChange={this.onChange}
                    onCalendarClose={this.onRangePickerClosed}
                    value={[this.props.state.displayedTimeRange.start, this.props.state.displayedTimeRange.end]}
                    locale={"en-EN"}
                />
                <div className="Ranges">
                    <QuickRanges
                        isOpen={this.state.quickRangesOpen}
                        ranges={ranges}
                        selected={this.state.selectedQuickRange}
                    />
                </div>
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
