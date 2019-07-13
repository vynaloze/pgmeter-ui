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
import {XySeries} from "../_store/stats/types";
import {Line} from 'react-chartjs-2';
import TranslateRequest from "../ApiClient/body";
import 'chartjs-plugin-colorschemes';

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
        this.renderChart = this.renderChart.bind(this);
    }

    componentDidMount(): void {
        this.fetchData()
    }

    componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
        if (prevProps.timeRange.start !== this.props.timeRange.start || prevProps.timeRange.end !== this.props.timeRange.end
            || prevProps.datasources.selected !== this.props.datasources.selected) {
            this.fetchData()
        }
    }

    fetchData() {
        // table
        ApiClient.getRecentStats("pg_stat_statements",
            (response => this.props.setQueriesTable(response)),
            (error => alert(error)));// fixme error handling

        // time chart
        const timeChartRequest = {
            filter: {
                timestampFrom: this.props.timeRange.start.unix(),
                timestampTo: this.props.timeRange.end.unix(),
                type: "pg_stat_statements",
                datasourceIds: this.props.datasources.selected.map(d => d.id)
            },
            params: {
                x: {
                    name: "ts",
                    type: "timestamp"
                },
                y: {
                    name: "avg_time",
                    type: "key"
                },
                dimension: {
                    name: "query",
                    type: "key"
                }
            }
        } as TranslateRequest;
        ApiClient.getXyStats(timeChartRequest,
            (response => this.props.setQueriesTimeChart(response)),
            (error => alert(error))); // fixme error handling

        // calls chart
        const callsChartRequest = {
            filter: {
                timestampFrom: this.props.timeRange.start.unix(),
                timestampTo: this.props.timeRange.end.unix(),
                type: "pg_stat_statements",
                datasourceIds: this.props.datasources.selected.map(d => d.id)
            },
            params: {
                x: {
                    name: "ts",
                    type: "timestamp"
                },
                y: {
                    name: "calls",
                    type: "key"
                },
                dimension: {
                    name: "query",
                    type: "key"
                }
            }
        } as TranslateRequest;
        ApiClient.getXyStats(callsChartRequest,
            (response => this.props.setQueriesCallsChart(response)),
            (error => alert(error))); // fixme error handling
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

        return <ReactTable
            data={data}
            columns={columns}
            defaultPageSize={10}
        />
    }

    renderChart(data: Array<XySeries>, title: string): ReactNode {
        if (typeof data === 'undefined' || data.length === 0) {
            return <div>No data</div> //fixme
        }
        // todo data depending on displayed table??
        // todo format displayed time depending on selected time range
        return (<Line data={data}
                      legend={{position: 'bottom', fullWidth: false}}
                      options={{
                          title: {
                              display: true,
                              text: title
                          },
                          maintainAspectRatio: false,
                          plugins: {
                              colorschemes: {
                                  // scheme: 'brewer.Paired12'
                                  // scheme: 'tableau.HueCircle19'
                                  // scheme: 'brewer.SetOne9'
                                  scheme: 'brewer.DarkTwo8'
                              }
                          }
                      }}/>)
    }

    render() {
        return (
            <div className="Content container-fluid">
                <div className="Element Table">
                    {this.renderTable()}
                </div>
                <div className="row">
                    <div className="Element Chart col">
                        {this.renderChart(this.props.queries.timeChart, "Time spent on query")}
                    </div>
                    <div className="Element Chart col">
                        {this.renderChart(this.props.queries.callsChart, "Query calls")}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        timeRange: state.timeRange,
        datasources: state.datasources,
        queries: state.stats.queries
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setQueriesTable, setQueriesTimeChart, setQueriesCallsChart}
)(Queries);
