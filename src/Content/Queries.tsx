import React, {ReactNode} from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import './index.css';
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {AppState} from "../_store";
import {connect} from "react-redux";
import ApiClient from "../ApiClient";
import {
    setQueriesCallsChart,
    setQueriesDisplayed,
    setQueriesTable,
    setQueriesTimeChart
} from '../_store/stats/queries/actions';
import {QueriesState, QueriesTablePayload} from "../_store/stats/queries/types";
import {XySeries} from "../_store/stats/types";
import {defaults, Line} from 'react-chartjs-2';
import TranslateRequest from "../ApiClient/body";
import 'chartjs-plugin-colorschemes';
import * as moment from "moment";
import * as TimeUtils from "./TimeUtils";
import {setMaxSelectedDatasources} from '../_store/datasources/actions';
// @ts-ignore
defaults.global.defaultFontColor = '#dee5ec';
// @ts-ignore
defaults.global.defaultFontFamily = 'Fira Mono';


interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    queries: QueriesState
}

interface DispatchFromProps {
    setQueriesTable: typeof setQueriesTable
    setQueriesDisplayed: typeof setQueriesDisplayed,
    setQueriesTimeChart: typeof setQueriesTimeChart
    setQueriesCallsChart: typeof setQueriesCallsChart
    setMaxSelectedDatasources: typeof setMaxSelectedDatasources
}

type Props = StateFromProps & DispatchFromProps

interface InternalState {
    error: string | null
}

class Queries extends React.Component<Props, InternalState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null
        };
        this.renderTable = this.renderTable.bind(this);
        this.renderChart = this.renderChart.bind(this);
    }

    componentDidMount(): void {
        this.props.setMaxSelectedDatasources(1);
        this.fetchData()
    }

    componentWillUnmount(): void {
        this.props.setMaxSelectedDatasources(9999);
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
            (response => {
                this.props.setQueriesTable(response);
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching table data: " + error.toString()})));

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
            (response => {
                this.props.setQueriesTimeChart(Array(response));
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching time chart data: " + error.toString()})));

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
            (response => {
                this.props.setQueriesCallsChart(Array(response));
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching calls chart data: " + error.toString()})));
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
            defaultPageSize={10}>
            {(tableState, makeTable, instance) => {
                const displayedQueries = tableState.sortedData.slice(tableState.startRow, tableState.endRow).map(x => x.query);
                if (this.props.queries.displayed.toString() !== displayedQueries.toString()) {
                    this.props.setQueriesDisplayed(displayedQueries);
                }
                return makeTable()
            }}
        </ReactTable>
    }

    renderChart(data: Array<XySeries>, series: Array<string>, title: string, yAxis?: string): ReactNode {
        if (typeof data === 'undefined' || data.length !== 1) {
            return <div>No data</div>
        }
        const actualData = data[0];

        // make data depend on displayed table
        const filteredDatasets = actualData.datasets.filter(d => series.includes(d.label));

        // format displayed time depending on selected time range
        const sortedLabels = actualData.labels.sort();
        const mappedLabels = sortedLabels.map(l => TimeUtils.FormatTime(moment.unix(sortedLabels[0]),
            moment.unix(sortedLabels[sortedLabels.length - 1]), moment.unix(l)));

        return (<Line data={{labels: mappedLabels, datasets: filteredDatasets}}
                      legend={{position: 'bottom'}}
                      options={{
                          title: {
                              display: true,
                              text: title,
                              fontStyle: 'normal'
                          },
                          scales: {
                              yAxes: [{
                                  scaleLabel: {
                                      display: yAxis !== undefined,
                                      labelString: yAxis
                                  }
                              }]
                          },
                          maintainAspectRatio: false,
                          plugins: {
                              colorschemes: {
                                  scheme: 'brewer.DarkTwo8'
                              }
                          }
                      }}/>)
    }

    render() {
        return (
            <div className="Content container-fluid">
                {this.state.error != null ? <div className="Element Error">{this.state.error}</div> : null}
                <div className="Element Table">
                    {this.renderTable()}
                </div>
                <div className="Element Chart">
                    {this.renderChart(this.props.queries.timeChart, this.props.queries.displayed, "Average time spent on query", "ms")}
                </div>
                <div className="Element Chart">
                    {this.renderChart(this.props.queries.callsChart, this.props.queries.displayed, "Query calls")}
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
    {setQueriesTable, setQueriesDisplayed, setQueriesTimeChart, setQueriesCallsChart, setMaxSelectedDatasources}
)(Queries);
