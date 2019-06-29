import React, {ReactNode} from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import './index.css';
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {AppState} from "../_store";
import {connect} from "react-redux";
import ApiClient from "../ApiClient";
import {setQueriesCallsChart, setQueriesTable, setQueriesTimeChart} from '../_store/stats/queries/actions';
import {QueriesState, QueriesTablePayload} from "../_store/stats/queries/types";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    queries: QueriesState
}

interface DispatchFromProps {
    setQueriesTable: typeof setQueriesTable
    setQueriesTimeChart: typeof setQueriesTimeChart
    setQueriesCallsChart: typeof setQueriesCallsChart
}

type Props = StateFromProps & DispatchFromProps

class Queries extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
        this.renderTable = this.renderTable.bind(this);
    }

    componentDidMount(): void {
        ApiClient.getRecentStats("pg_stat_statements",
            (response => this.props.setQueriesTable(response)),
            (error => alert(error))) // fixme error handling
    }

    renderTable(): ReactNode {
        const columns = [
            {
                Header: 'Query',
                accessor: 'query'
            }, {
                Header: 'User',
                accessor: 'user'
            }, {
                Header: 'Calls',
                accessor: 'calls'
            }, {
                Header: 'Rows',
                accessor: 'rows'
            }, {
                id: 'avg_time',
                Header: 'Avg Time',
                accessor: (d: QueriesTablePayload) => d.avg_time.toFixed(2)
            }, {
                id: 'min_time',
                Header: 'Min Time',
                accessor: (d: QueriesTablePayload) => d.min_time.toFixed(2)
            }, {
                id: 'max_time',
                Header: 'Max Time',
                accessor: (d: QueriesTablePayload) => d.max_time.toFixed(2)
            }, {
                id: "buffer_hit",
                Header: 'Buffer Hit %',
                accessor: (d: QueriesTablePayload) => {
                    let sum = d.shared_blks_hit + d.shared_blks_read;
                    if (sum === 0) return "0%";
                    return ((d.shared_blks_hit / sum) * 100).toFixed(2) + "%"
                }
            }, {
                id: "local_buffer_hit",
                Header: 'Local Buffer Hit %',
                accessor: (d: QueriesTablePayload) => {
                    let sum = d.local_blks_hit + d.local_blks_read;
                    if (sum === 0) return "0%";
                    return ((d.local_blks_hit / sum) * 100).toFixed(2) + "%"
                }
            }
        ];

        const data = this.props.queries.table
            .filter((qt => this.props.datasources.selected.map((ds => ds.id)).includes(qt.datasource.id))) //todo - don't pick all tables? force only one?
            .flatMap((qt => qt.payload));

        console.log(data);

        return <ReactTable
            data={data}
            columns={columns}
        />
    }

    render() {
        return (
            <div className="Content">
                <div className="Element Table">
                    {this.renderTable()}
                </div>
                <div className="Element Chart">
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        timeRange: state.timeRange,
        datasources: state.datasources,
        queries: state.queries
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setQueriesTable, setQueriesTimeChart, setQueriesCallsChart}
)(Queries);
