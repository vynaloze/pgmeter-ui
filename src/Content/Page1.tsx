import React from 'react';
import './index.css';
import {connect} from "react-redux";
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {AppState} from "../_store";
import {setDatasourceLabel} from "../_store/datasources/actions";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
}

interface DispatchFromProps {
    setDatasourceLabel: typeof setDatasourceLabel
}

type Props = StateFromProps & DispatchFromProps

class Page1 extends React.Component<Props, {}> {
    // todo remove in future
    withDb = false;

    constructor(props: Props) {
        super(props);
        this.changeLabel = this.changeLabel.bind(this);
    }

    changeLabel() {
        let label = this.withDb ? "%ip%/%database%" : "%ip%";
        this.props.setDatasourceLabel(label);
        this.withDb = !this.withDb;
    }

    render() {
        // TODO - MAJOR TODOs
        // 1. autoupdate data somehow (SSE or periodic pulls)
        // 2. shareable links - save time range, datasources, tables etc in URL
        // 3. alerting
        return (
            <div className="Content">
                Page1
                <div>{this.props.timeRange.start.toString()}</div>
                <div>{this.props.timeRange.end.toString()}</div>
                Change label:
                <button onClick={this.changeLabel}>{this.props.datasources.labelTemplate}</button>
                <br/>
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

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setDatasourceLabel}
)(Page1);
