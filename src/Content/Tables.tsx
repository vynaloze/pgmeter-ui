import React from 'react';
import './index.css';
import StyledSelect from "../StyledSelect";
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {Table, TablesState, TablesTableEntry} from "../_store/stats/tables/types";
import {setAllTables, setDisplayedTables, setTablesData} from '../_store/stats/tables/actions';
import ApiClient from "../ApiClient";
import {AppState} from "../_store";
import {connect} from "react-redux";
import TranslateRequest from "../ApiClient/body";
import VerticalTable from "../VerticalTable";
import {format, formatDistanceToNow, fromUnixTime, getUnixTime, isValid, parseISO} from "date-fns";
import {Series} from "../_store/stats/types";
import * as Utils from "./Utils";
import StyledLineChart from "../StyledLineChart";
import {UpdaterState} from "../_store/updater/types";
import {setTimeRange} from "../_store/timeRange/actions";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    tables: TablesState
    updater: UpdaterState
}

interface DispatchFromProps {
    setAllTables: typeof setAllTables
    setDisplayedTables: typeof setDisplayedTables
    setTablesData: typeof setTablesData
    setTimeRange: typeof setTimeRange
}

type Props = StateFromProps & DispatchFromProps

class Tables extends React.Component<Props> {
    private eventSource?: EventSource;

    constructor(props: Props) {
        super(props);
        this.handleTableSelection = this.handleTableSelection.bind(this);
        this.datasetFilter = this.datasetFilter.bind(this);
        this.datasetMapper = this.datasetMapper.bind(this);
        this.labelMapper = this.labelMapper.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount(): void {
        this.fetchData()
    }

    componentDidUpdate(prevProps: Readonly<StateFromProps & DispatchFromProps>, prevState: any, snapshot?: any): void {
        if (Utils.SelectedDatasourcesHaveChanged(this.props.datasources.selected, prevProps.datasources.selected)
            || Utils.SelectedTimeRangeHasChanged(this.props.timeRange, prevProps.timeRange)) {
            this.unsubscribe();
            this.props.setTablesData({overview: this.props.tables.data.overview, charts: {}});
            this.fetchData()
        }
        if (prevProps.updater.liveUpdates && !this.props.updater.liveUpdates) {
            this.unsubscribe()
        }
        if (!prevProps.updater.liveUpdates && this.props.updater.liveUpdates) {
            this.subscribe()
        }
    }

    componentWillUnmount(): void {
        this.unsubscribe()
    }

    subscribe() {
        const ids = this.props.datasources.selectedBackend.map(bds => bds.id);
        if (ids.length === 0) {
            return;
        }
        const types = ["pg_stat_user_tables"];
        this.eventSource = ApiClient.subscribe(ids, types);
        this.eventSource.addEventListener("message", e => {
            const event = JSON.parse(e.data);
            if (!event.ignored) {
                const tr = Utils.GetTimeRangeNow(this.props.timeRange.displayedTimeRange.start, this.props.timeRange.displayedTimeRange.end);
                this.props.setTimeRange(tr.start, tr.end);
                this.fetchData();
            }
        });
    }

    unsubscribe() {
        if (this.eventSource !== undefined) {
            this.eventSource.close();
            this.eventSource = undefined;
        }
    }

    fetchData() {
        if (this.props.datasources.selected.length > 0) {
            this.fetchTables();
            this.fetchTableData();
        } else {
            this.props.setDisplayedTables([]);
            this.props.setAllTables([]);
        }

        if (this.props.updater.liveUpdates) {
            this.subscribe()
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
            }),
            (error => {
                //todo error handling
            }));
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
                    .flatMap((r: any) => r.payload.map((p: any) => ({
                        table: p.table,
                        seq_scan: p.seq_scan,
                        seq_tup_fetch: p.seq_tup_fetch,
                        idx_scan: p.idx_scan,
                        idx_tup_fetch: p.idx_tup_fetch,
                        live_tup: p.live_tup,
                        dead_tup: p.dead_tup,
                        ins_tup: p.ins_tup,
                        upd_tup: p.upd_tup,
                        del_tup: p.del_tup,
                        last_vacuum: parseISO(p.last_vacuum),
                        last_autovacuum: parseISO(p.last_autovacuum),
                        last_analyze: parseISO(p.last_analyze),
                        last_autoanalyze: parseISO(p.last_autoanalyze),
                        vacuum_count: p.vacuum_count,
                        autovacuum_count: p.autovacuum_count,
                        analyze_count: p.analyze_count,
                        autoanalyze_count: p.autoanalyze_count,
                        datasourceId: r.datasource.id
                    }) as TablesTableEntry))
                    .forEach((tte: TablesTableEntry) => overview.push(tte));
                let data = this.props.tables.data;
                data.overview = overview;
                this.props.setTablesData(data);
            }),
            (error => {
                //todo error handling
            }));
    }

    fetchChartData() {
        const xyKeys = ["seq_scan", "seq_tup_fetch", "idx_scan", "idx_tup_fetch", "live_tup", "dead_tup", "ins_tup",
            "upd_tup", "del_tup", "vacuum_count", "autovacuum_count", "analyze_count", "autoanalyze_count"];
        xyKeys.forEach((k: string) => {
            const req = {
                filter: {
                    timestampFrom: getUnixTime(this.props.timeRange.start),
                    timestampTo: getUnixTime(this.props.timeRange.end),
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
                }),
                (error => {
                    //todo error handling
                }));
        })
    }

    handleTableSelection(selected: Array<Table>) {
        this.props.setDisplayedTables(selected);
    }

    datasetFilter(dataset: Series): boolean {
        return this.props.tables.displayed.some(table => table.datasourceId === dataset.label[0] && table.label === dataset.label[1]);
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
        const entries: any = this.props.tables.data.overview
            .filter((t: TablesTableEntry) => this.props.tables.displayed.some(table => table.datasourceId === t.datasourceId && table.label === t.table))
            .map((t: TablesTableEntry) => {
                const key = this.props.datasources.selected.length === 1
                    ? t.table
                    : "[" + Utils.GetLabelFromBackendDatasource(t.datasourceId, this.props.datasources.selected) + "] " + t.table;
                const data = {
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
                    "Manual Vacuum": (t.vacuum_count || 0) + "" + (isValid(t.last_vacuum) ? "; last at " + format(t.last_vacuum, "do MMM yyyy, H:mm:ss") + " (" + formatDistanceToNow(t.last_vacuum, {
                        includeSeconds: true,
                        addSuffix: true
                    }) + ")" : ""),
                    "Auto Vacuum": (t.autovacuum_count || 0) + "" + (isValid(t.last_autovacuum) ? "; last at " + format(t.last_autovacuum, "do MMM yyyy, H:mm:ss") + " (" + formatDistanceToNow(t.last_autovacuum, {
                        includeSeconds: true,
                        addSuffix: true
                    }) + ")" : ""),
                    "Manual Analyze": (t.analyze_count || 0) + "" + (isValid(t.last_analyze) ? "; last at " + format(t.last_analyze, "do MMM yyyy, H:mm:ss") + " (" + formatDistanceToNow(t.last_analyze, {
                        includeSeconds: true,
                        addSuffix: true
                    }) + ")" : ""),
                    "Auto Analyze": (t.autoanalyze_count || 0) + "" + (isValid(t.last_autoanalyze) ? "; last at " + format(t.last_autoanalyze, "do MMM yyyy, H:mm:ss") + " (" + formatDistanceToNow(t.last_autoanalyze, {
                        includeSeconds: true,
                        addSuffix: true
                    }) + ")" : ""),
                };
                return {key, data};
            });

        return (
            <div className="Content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col Picker">
                            <StyledSelect
                                all={this.props.tables.all || undefined}
                                selected={this.props.tables.displayed || undefined}
                                placeholder={"Pick table..."}
                                loading={this.props.updater.loading > 0}
                                withGrouping={this.props.datasources.selected.length > 1}
                                handleChange={this.handleTableSelection}
                            />
                        </div>
                        <div className="col"/>
                    </div>
                </div>
                <VerticalTable entries={entries}/>
                <div className="container-fluid">
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.seq_scan}
                                title={"Sequential Scans"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={0}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.seq_tup_fetch}
                                title={"Sequential Scans - Rows Fetched"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={0}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.idx_scan}
                                title={"Index Scans"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={1}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.idx_tup_fetch}
                                title={"Index Scans - Rows Fetched"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={1}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.live_tup}
                                title={"Live Rows"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={2}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.dead_tup}
                                title={"Dead Rows"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={2}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    <div className="row no-gutters">
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            <StyledLineChart
                                data={this.props.tables.data.charts.ins_tup}
                                title={"Inserted Rows"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={3}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            <StyledLineChart
                                data={this.props.tables.data.charts.upd_tup}
                                title={"Updated Rows"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={3}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            <StyledLineChart
                                data={this.props.tables.data.charts.dead_tup}
                                title={"Deleted Rows"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={3}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    {/* TODO cache hits % */}
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.vacuum_count}
                                title={"Vacuums"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={4}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.autovacuum_count}
                                title={"Autovacuums"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={4}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.analyze_count}
                                title={"Analyzes"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={5}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.tables.data.charts.autoanalyze_count}
                                title={"Autoanalyzes"}
                                shiftColors={this.props.tables.displayed.length === 1}
                                colorIndex={5}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
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
        tables: state.stats.tables,
        updater: state.updater,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setAllTables, setDisplayedTables, setTablesData, setTimeRange}
)(Tables);
