import React from 'react';
import './index.css';
import {connect} from "react-redux";

class Page1 extends React.Component {
    render() {
        return (
            <div className="Content">
                Page1
                <div>{this.props.start.toString()}</div>
                <div>{this.props.end.toString()}</div>
                Selected:
                <div>{JSON.stringify(this.props.selected)}</div>
                All datasources:
                <div>{JSON.stringify(this.props.all)}</div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        start: state.timeRange.start,
        end: state.timeRange.end,
        all: state.datasources.all,
        selected: state.datasources.selected,
    }
}

export default connect(
    mapStateToProps,
    null
)(Page1);
