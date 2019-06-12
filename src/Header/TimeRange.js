import React from 'react';
import {connect} from "react-redux";
import {setTimeRange} from "../_redux/actions";
import DateTimeRangeContainer from 'react-advanced-datetimerange-picker'
import moment from "moment"
import './TimeRange.css'

class TimeRange extends React.Component {
    constructor(props) {
        super(props);
        this.applyCallback = this.applyCallback.bind(this);
    }

    applyCallback(startDate, endDate) {
        this.props.setTimeRange(startDate, endDate)
    }

    render() {
        let ranges = {
            "Last 15 min": [moment().subtract(15, "minute"), moment()],
            "Last 30 min": [moment().subtract(30, "minute"), moment()],
            "Last 1 hour": [moment().subtract(1, "hour"), moment()],
            "Last 3 hours": [moment().subtract(3, "hour"), moment()],
            "Last 12 hours": [moment().subtract(12, "hour"), moment()],
            "Last 24 hours": [moment().subtract(24, "hour"), moment()],
            "Last 2 days": [moment().subtract(2, "day"), moment()],
            "Last 7 days": [moment().subtract(7, "day"), moment()],
            "Last 30 days": [moment().subtract(30, "day"), moment()],
            "Last 90 days": [moment().subtract(90, "day"), moment()],
        };
        let local = {
            "format": "DD-MM-YYYY HH:mm:ss",
            "sundayFirst": false
        };
        return (
            <div className="TimeRange horizontal">
                <DateTimeRangeContainer
                    ranges={ranges}
                    start={this.props.start}
                    end={this.props.end}
                    local={local}
                    applyCallback={this.applyCallback}
                    autoApply={true}
                >
                    <div className="click-area"/>
                </DateTimeRangeContainer>
                <input value={this.props.start.format(local.format) + " / " + this.props.end.format(local.format)}
                       type="text" className="info-box" placeholder="TIME RANGE" readOnly={true}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        start: state.timeRange.start,
        end: state.timeRange.end,
    }
}

export default connect(
    mapStateToProps,
    {setTimeRange}
)(TimeRange);
