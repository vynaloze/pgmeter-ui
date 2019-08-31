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
import {QueriesState, QueriesTable, QueriesTableRow} from "../_store/stats/queries/types";
import {Series} from "../_store/stats/types";
import TranslateRequest from "../ApiClient/body";
import 'chartjs-plugin-colorschemes';
import {fromUnixTime, getUnixTime} from "date-fns";
import * as Utils from "./Utils";
import StyledLineChart from "../StyledLineChart";


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
        this.datasetFilter = this.datasetFilter.bind(this);
        this.datasetMapper = this.datasetMapper.bind(this);
        this.labelMapper = this.labelMapper.bind(this);
    }

    componentDidMount(): void {
        this.fetchData()
    }

    componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
        if (Utils.SelectedDatasourcesHaveChanged(this.props.datasources.selected, prevProps.datasources.selected)) {
            this.fetchData()
        }
    }

    fetchData() {
        // table
        ApiClient.getRecentStats("pg_stat_statements",
            (response => {
                const table: Array<QueriesTable> = response.map((r: any) => ({
                    datasourceId: r.datasource.id,
                    payload: r.payload
                }));
                this.props.setQueriesTable(table);
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching table data: " + error.toString()})));

        // time chart
        const timeChartRequest = {
            filter: {
                timestampFrom: getUnixTime(this.props.timeRange.start),
                timestampTo: getUnixTime(this.props.timeRange.end),
                type: "pg_stat_statements",
                datasourceIds: this.props.datasources.selectedBackend.map(d => d.id)
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
                dimension: [{
                    name: "ds",
                    type: "datasource"
                }, {
                    name: "query",
                    type: "key"
                }]
            }
        } as TranslateRequest;
        ApiClient.getXyStats(timeChartRequest,
            (response => {
                this.props.setQueriesTimeChart(response);
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching time chart data: " + error.toString()})));

        // calls chart
        const callsChartRequest = {
            filter: {
                timestampFrom: getUnixTime(this.props.timeRange.start),
                timestampTo: getUnixTime(this.props.timeRange.end),
                type: "pg_stat_statements",
                datasourceIds: this.props.datasources.selectedBackend.map(d => d.id)
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
                dimension: [{
                    name: "ds",
                    type: "datasource"
                }, {
                    name: "query",
                    type: "key"
                }]
            }
        } as TranslateRequest;
        ApiClient.getXyStats(callsChartRequest,
            (response => {
                this.props.setQueriesCallsChart(response);
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching calls chart data: " + error.toString()})));
    }

    renderTable(): ReactNode {
        const columns = [
            {
                id: 'datasourceLabel',
                Header: 'Datasource',
                accessor: (d: QueriesTableRow) => Utils.GetLabelFromBackendDatasource(d.datasourceId, this.props.datasources.selected),
                show: this.props.datasources.selected.length > 1
            }, {
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
                Header: 'Avg Time',
                accessor: 'avg_time',
                Cell: (props: any) => props.value.toFixed(2)
            }, {
                Header: 'Min Time',
                accessor: 'min_time',
                Cell: (props: any) => props.value.toFixed(2)
            }, {
                Header: 'Max Time',
                accessor: 'max_time',
                Cell: (props: any) => props.value.toFixed(2)
            }, {
                id: "buffer_hit",
                Header: 'Buffer Hit %',
                accessor: (d: QueriesTableRow) => {
                    let sum = d.shared_blks_hit + d.shared_blks_read;
                    if (sum === 0) return 0;
                    return ((d.shared_blks_hit / sum) * 100)
                },
                Cell: (props: any) => props.value.toFixed(0) + "%"
            }, {
                id: "local_buffer_hit",
                Header: 'Local Buffer Hit %',
                accessor: (d: QueriesTableRow) => {
                    let sum = d.local_blks_hit + d.local_blks_read;
                    if (sum === 0) return 0;
                    return ((d.local_blks_hit / sum) * 100)
                },
                Cell: (props: any) => props.value.toFixed(0) + "%"
            }
        ];

        const data: Array<QueriesTableRow> = this.props.queries.table
            .filter((qt => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(qt.datasourceId)))
            .flatMap((qt => qt.payload.map(p => ({...p, datasourceId: qt.datasourceId}))));

        return <ReactTable
            data={data}
            columns={columns}
            defaultPageSize={10}>
            {(tableState, makeTable, instance) => {
                const displayedQueries = tableState.sortedData.slice(tableState.startRow, tableState.endRow).map(x => x._original as QueriesTableRow);
                if (JSON.stringify(this.props.queries.displayed) !== JSON.stringify(displayedQueries)) {
                    this.props.setQueriesDisplayed(displayedQueries);
                }
                return makeTable()
            }}
        </ReactTable>
    }

    datasetFilter(dataset: Series): boolean {
        return this.props.queries.displayed.some(queryTable => queryTable.datasourceId === dataset.label[0] && queryTable.query === dataset.label[1])
    }

    datasetMapper(datasets: Array<Series>): Array<Series> {
        if (this.props.datasources.selected.length === 1) {
            return datasets.map(d => ({data: d.data, label: d.label[1]}))
        }
        return datasets.map(d => ({
            data: d.data,
            label: "[" + Utils.GetLabelFromBackendDatasource(d.label[0], this.props.datasources.selected) + "] " + d.label[1]
        }))
    }

    labelMapper(labels: Array<any>): Array<any> {
        return labels.map(l => Utils.FormatTime(fromUnixTime(labels[0]), fromUnixTime(labels[labels.length - 1]), fromUnixTime(l)));
    }

    render() {
        return (
            <div className="Content container-fluid">
                {this.state.error != null ? <div className="Element Error">{this.state.error}</div> : null}
                <div className="Element Table">
                    {this.renderTable()}
                </div>
                <div className="Element Chart">
                    <StyledLineChart
                        data={this.props.queries.timeChart}
                        title={"Average time spent on query"}
                        yAxis={"ms"}
                        shiftColors={false}
                        colorIndex={0}
                        datasetFilter={this.datasetFilter}
                        datasetMapper={this.datasetMapper}
                        labelMapper={this.labelMapper}
                    />
                </div>
                <div className="Element Chart">
                    <StyledLineChart
                        data={this.props.queries.callsChart}
                        title={"Query calls"}
                        shiftColors={false}
                        colorIndex={0}
                        datasetFilter={this.datasetFilter}
                        datasetMapper={this.datasetMapper}
                        labelMapper={this.labelMapper}
                    />
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
    {setQueriesTable, setQueriesDisplayed, setQueriesTimeChart, setQueriesCallsChart}
)(Queries);
