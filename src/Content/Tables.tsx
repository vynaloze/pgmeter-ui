import React, {ReactNode} from 'react';
import './index.css';
import StyledSelect from "../StyledSelect";
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {Table, TablesState, TablesTableEntry, TablesTablePayload} from "../_store/stats/tables/types";
import {setAllTables, setDisplayedTables, setTablesData} from '../_store/stats/tables/actions';
import ApiClient from "../ApiClient";
import {AppState} from "../_store";
import {connect} from "react-redux";
import TranslateRequest from "../ApiClient/body";
import VerticalTable from "../VerticalTable";
import moment from "moment"
import {XySeries} from "../_store/stats/types";
import * as Utils from "./Utils";
import {Line} from "react-chartjs-2";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    tables: TablesState
}

interface DispatchFromProps {
    setAllTables: typeof setAllTables
    setDisplayedTables: typeof setDisplayedTables
    setTablesData: typeof setTablesData
}

type Props = StateFromProps & DispatchFromProps

interface InternalState {
    error: string | null
    loading: boolean
}

class Tables extends React.Component<Props, InternalState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            loading: false
        };
        this.handleTableSelection = this.handleTableSelection.bind(this);
    }

    componentDidMount(): void {
        if (this.props.datasources.selected.length > 0) {
            this.fetchTables();
            this.fetchTableData();
        }
    }

    componentDidUpdate(prevProps: Readonly<StateFromProps & DispatchFromProps>, prevState: Readonly<InternalState>, snapshot?: any): void {
        if (Utils.SelectedDatasourcesHaveChanged(this.props.datasources.selected, prevProps.datasources.selected)) {
            this.props.setTablesData({overview: [], charts: {}});
            if (this.props.datasources.selected.length > 0) {
                this.setState({loading: true});
                this.fetchTables();
                this.fetchTableData();
                this.setState({loading: false});
            } else {
                this.props.setDisplayedTables([]);
                this.props.setAllTables([]);
            }
        }
    }

    fetchTables() {
        ApiClient.getRecentStats("pg_stat_user_tables",
            (response => {
                let index = 0;
                const tables: Array<Table> = response
                    .filter(((r: any) => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(r.datasource.id)))
                    .flatMap((r: any) => r.payload.map((p: any) => ({
                        id: index++,
                        label: p.table,
                        group: Utils.GetLabelFromBackendDatasource(r.datasource.id, this.props.datasources.selected),
                        datasourceId: r.datasource.id
                    })));
                this.props.setAllTables(tables);
                this.props.setDisplayedTables(tables.filter(t => this.props.tables.displayed.some(
                    t2 => t2.label === t.label && t2.datasourceId === t.datasourceId)));
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching tables: " + error.toString()})));
    }

    fetchTableData() {
        this.fetchOverviewData();
        this.fetchChartData();
    }

    fetchOverviewData() {
        ApiClient.getRecentStats("pg_stat_user_tables",
            (response => {
                let overview: Array<TablesTableEntry> = [];
                response
                    .filter(((r: any) => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(r.datasource.id)))
                    .flatMap((r: any) => r.payload.map((p: TablesTablePayload) => ({
                        ...p,
                        datasourceId: r.datasource.id
                    })))
                    .forEach((p: any) => overview.push(p));
                let data = this.props.tables.data;
                data.overview = overview;
                this.props.setTablesData(data);
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching data: " + error.toString()})));
    }

    fetchChartData() {
        const xyKeys = ["seq_scan", "seq_tup_fetch", "idx_scan", "idx_tup_fetch", "live_tup", "dead_tup", "ins_tup",
            "upd_tup", "del_tup", "vacuum_count", "autovacuum_count", "analyze_count", "autoanalyze_count"];
        xyKeys.forEach((k: string) => {
            const req = {
                filter: {
                    timestampFrom: this.props.timeRange.start.unix(),
                    timestampTo: this.props.timeRange.end.unix(),
                    type: "pg_stat_user_tables",
                    datasourceIds: this.props.datasources.selectedBackend.map(d => d.id)
                },
                params: {
                    x: {
                        name: "ts",
                        type: "timestamp"
                    },
                    y: {
                        name: k,
                        type: "key"
                    },
                    dimension: [{
                        name: "ds",
                        type: "datasource"
                    }, {
                        name: "table",
                        type: "key"
                    }]
                }
            } as TranslateRequest;
            let data = this.props.tables.data;
            ApiClient.getXyStats(req,
                (response => {
                    // @ts-ignore
                    data.charts[k] = response;
                    this.props.setTablesData(data);
                    this.setState({error: null})
                }),
                (error => this.setState({error: "Error fetching data: " + error.toString()})));
        })
    }

    handleTableSelection(selected: Array<Table>) {
        this.props.setDisplayedTables(selected);
    }

    renderChart(data: XySeries | undefined, title: string, colorIndex: number, yAxis?: string): ReactNode {
        if (typeof data === 'undefined') {
            return <div/>
        }

        // show only chosen tables
        const filteredDatasets = data.datasets.filter(d => this.props.tables.displayed.some(t => t.datasourceId === d.label[0] && t.label === d.label[1]));

        // format series labels to show datasource in human format
        const mappedDatasets =
            this.props.datasources.selected.length === 1
                ? filteredDatasets.map(d => ({data: d.data, label: d.label[1]}))
                : filteredDatasets.map(d => ({
                    data: d.data,
                    label: "[" + Utils.GetLabelFromBackendDatasource(d.label[0], this.props.datasources.selected) + "] " + d.label[1]
                }));

        // format displayed time depending on selected time range
        const mappedLabels = data.labels.map(l => Utils.FormatTime(moment.unix(data.labels[0]),
            moment.unix(data.labels[data.labels.length - 1]), moment.unix(l)));

        const shiftFirstColorForSingleTable = (schemeColors: any[]) => {
            if (this.props.tables.displayed.length === 1) {
                for (let i = 0; i < colorIndex % schemeColors.length; i++) schemeColors.push(schemeColors.shift());
            }
            return schemeColors;
        };
        return (<Line data={{labels: mappedLabels, datasets: mappedDatasets}}
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
                                  scheme: 'brewer.DarkTwo8',
                                  custom: shiftFirstColorForSingleTable,
                              }
                          }
                      }}/>)
    }

    render() {
        const t = this.props.tables.data.overview
            .filter((o) => this.props.tables.displayed.map((t => t.label)).includes(o.table))[0]; //fixme - can't decide how to do it - multiple tables or not
        const tableData: any = t === undefined ?
            {
                "Size": " - ",
                "Bloat": " - ",
                "Sequential Access": " - ",
                "Index Access": " - ",
                "Rows": " - ",
                "Rows Changes": " - ",
                "Cache Hits": " - ",
                "Index Cache Hits": " - ",
                "TOAST Cache Hits": " - ",
                "TOAST Index Cache Hits": " - ",
                "Manual Vacuum": " - ",
                "Auto Vacuum": " - ",
                "Manual Analyze": " - ",
                "Auto Analyze": " - ",
            } :
            {
                "Size": "TODO",
                "Bloat": "TODO",
                "Sequential Access": (t.seq_scan || 0) + " scans; " + (t.seq_tup_fetch || 0) + " rows fetched (" + (Math.round(t.seq_tup_fetch / t.seq_scan) || 0) + " rows per scan)",
                "Index Access": (t.idx_scan || 0) + " scans; " + (t.idx_tup_fetch || 0) + " rows fetched (" + (Math.round(t.idx_tup_fetch / t.idx_scan) || 0) + " rows per scan)",
                "Rows": (t.live_tup || 0) + " live; " + (t.dead_tup || 0) + " dead (" + ((Math.round(t.live_tup / (t.dead_tup + t.live_tup)) || 0) * 100) + "% live)",
                "Rows Changes": (t.ins_tup || 0) + " inserts; " + (t.upd_tup || 0) + " updates; " + (t.del_tup || 0) + " deletes",
                "Cache Hits": "TODO",
                "Index Cache Hits": "TODO",
                "TOAST Cache Hits": "TODO",
                "TOAST Index Cache Hits": "TODO",
                "Manual Vacuum": (t.vacuum_count || 0) + "" + (moment(t.last_vacuum).isValid() ? "; last at " + moment(t.last_vacuum).format("Do MMM YYYY, H:mm:ss") + " (" + moment(t.last_vacuum).fromNow() + ")" : ""),
                "Auto Vacuum": (t.autovacuum_count || 0) + "" + (moment(t.last_autovacuum).isValid() ? "; last at " + moment(t.last_autovacuum).format("Do MMM YYYY, H:mm:ss") + " (" + moment(t.last_autovacuum).fromNow() + ")" : ""),
                "Manual Analyze": (t.analyze_count || 0) + "" + (moment(t.last_analyze).isValid() ? "; last at " + moment(t.last_analyze).format("Do MMM YYYY, H:mm:ss") + " (" + moment(t.last_analyze).fromNow() + ")" : ""),
                "Auto Analyze": (t.autoanalyze_count || 0) + "" + (moment(t.last_autoanalyze).isValid() ? "; last at " + moment(t.last_autoanalyze).format("Do MMM YYYY, H:mm:ss") + " (" + moment(t.last_autoanalyze).fromNow() + ")" : ""),
            };

        return (
            <div className="Content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col Picker">
                            <StyledSelect
                                all={this.props.tables.all || undefined}
                                selected={this.props.tables.displayed || undefined}
                                placeholder={"Pick table..."}
                                loading={this.state.loading}
                                withGrouping={this.props.datasources.selected.length > 1}
                                handleChange={this.handleTableSelection}
                            />
                        </div>
                        <div className="col"/>
                    </div>
                </div>
                {this.props.tables.displayed.length === 1 ? <VerticalTable data={tableData}/> : null}
                <div className="container-fluid">
                    <div className="row">
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.seq_scan, "Sequential Scans", 0)}
                        </div>
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.seq_tup_fetch, "Sequential Scans - Rows Fetched", 0)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.idx_scan, "Index Scans", 1)}
                        </div>
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.idx_tup_fetch, "Index Scans - Rows Fetched", 1)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.live_tup, "Live Rows", 2)}
                        </div>
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.dead_tup, "Dead Rows", 2)}
                        </div>
                    </div>
                    <div className="row no-gutters">
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            {this.renderChart(this.props.tables.data.charts.ins_tup, "Inserted Rows", 3)}
                        </div>
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            {this.renderChart(this.props.tables.data.charts.upd_tup, "Updated Rows", 3)}
                        </div>
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            {this.renderChart(this.props.tables.data.charts.dead_tup, "Deleted Rows", 3)}
                        </div>
                    </div>
                    {/* TODO cache hits % */}
                    <div className="row">
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.vacuum_count, "Vacuums", 4)}
                        </div>
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.autovacuum_count, "Autovacuums", 4)}
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.analyze_count, "Analyzes", 5)}
                        </div>
                        <div className="Element Chart col">
                            {this.renderChart(this.props.tables.data.charts.autoanalyze_count, "Autoanalyzes", 5)}
                        </div>
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
        tables: state.stats.tables
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setAllTables, setDisplayedTables, setTablesData}
)(Tables);
