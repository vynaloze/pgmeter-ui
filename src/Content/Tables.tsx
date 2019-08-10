import React, {ReactNode} from 'react';
import './index.css';
import StyledSelect from "../StyledSelect";
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {Table, TablesState, TablesTablePayload} from "../_store/stats/tables/types";
import {setAllTables, setDisplayedTables, setTablesData} from '../_store/stats/tables/actions';
import ApiClient from "../ApiClient";
import {AppState} from "../_store";
import {connect} from "react-redux";
import TranslateRequest from "../ApiClient/body";
import VerticalTable from "../VerticalTable";
import moment from "moment"
import {XySeries} from "../_store/stats/types";
import * as TimeUtils from "./TimeUtils";
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
            this.fetchTables()
        }
    }

    componentDidUpdate(prevProps: Readonly<StateFromProps & DispatchFromProps>, prevState: Readonly<InternalState>, snapshot?: any): void {
        if (this.props.datasources.selected.length > 0
            && this.props.datasources.selected !== prevProps.datasources.selected) {
            this.fetchTables();
            this.fetchTableData();
        }
    }

    fetchTables() {
        this.setState({loading: true});
        ApiClient.getRecentStats("pg_stat_user_tables",
            (response => {
                const tables: Array<Table> = response
                    .filter(((r: any) => this.props.datasources.selected.map((ds => ds.id)).includes(r.datasource.id)))
                    .flatMap((r: any) => r.payload)
                    .map((p: any, index: number) => {
                        return {id: index, label: p.table}
                    });
                this.props.setAllTables(tables);
                this.setState({error: null, loading: false})
            }),
            (error => this.setState({error: "Error fetching tables: " + error.toString(), loading: false})));
    }

    fetchTableData() {
        this.fetchOverviewData();
        this.fetchChartData();
    }

    fetchOverviewData() {
        ApiClient.getRecentStats("pg_stat_user_tables",
            (response => {
                let overview: Array<TablesTablePayload> = [];
                response
                    .filter(((r: any) => this.props.datasources.selected.map((ds => ds.id)).includes(r.datasource.id)))
                    .flatMap((r: any) => r.payload)
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
                    datasourceIds: this.props.datasources.selected.map(d => d.id)
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
                    dimension: {
                        name: "table",
                        type: "key"
                    }
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
            return <div>No data</div>
        }

        // make data depend on displayed table
        const filteredDatasets = data.datasets.filter(d => this.props.tables.displayed.map((t => t.label)).includes(d.label)); //fixme again - multiple tables or not?

        // format displayed time depending on selected time range
        const sortedLabels = data.labels.sort();
        const mappedLabels = sortedLabels.map(l => TimeUtils.FormatTime(moment.unix(sortedLabels[0]),
            moment.unix(sortedLabels[sortedLabels.length - 1]), moment.unix(l)));

        const getSingleColor = (schemeColors: any[]) => [schemeColors[colorIndex % schemeColors.length]];

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
                                  scheme: 'brewer.DarkTwo8',
                                  custom: getSingleColor,
                              }
                          }
                      }}/>)
    }

    render() {
        const t = this.props.tables.data.overview
            .filter((o) => this.props.tables.displayed.map((t => t.label)).includes(o.table))[0]; //fixme - decide if support multiple tables or not
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
                                maxSelected={1}
                                loading={this.state.loading}
                                handleChange={this.handleTableSelection}
                            />
                        </div>
                        <div className="col"/>
                    </div>
                </div>
                <VerticalTable data={tableData}/>
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
