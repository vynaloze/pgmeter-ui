import React from 'react';
import './index.css';
import {connect} from "react-redux";
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {AppState} from "../_store";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
}

class Page1 extends React.Component<StateFromProps, {}> {
    render() {
        return (
            <div className="Content">
                Page1
                <div>{this.props.timeRange.start.toString()}</div>
                <div>{this.props.timeRange.end.toString()}</div>
                Selected:
                <div>{JSON.stringify(this.props.datasources.selected)}</div>
                All datasources:
                <div>{JSON.stringify(this.props.datasources.all)}</div>
            </div>
        );
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        timeRange: state.timeRange,
        datasources: state.datasources,
    }
}

export default connect<StateFromProps, {}, {}, AppState>(
    mapStateToProps
)(Page1);
