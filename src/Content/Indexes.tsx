import React from 'react';
import './index.css';
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {Table, TablesState} from "../_store/stats/tables/types";
import {Index, IndexesState, IndexesTableEntry, IndexesTablePayload} from "../_store/stats/indexes/types";
import {setAllIndexes, setDisplayedIndexes, setIndexesData} from '../_store/stats/indexes/actions';
import {AppState} from "../_store";
import {connect} from "react-redux";
import {setAllTables, setDisplayedTables} from "../_store/stats/tables/actions";
import * as Utils from "./Utils";
import ApiClient from "../ApiClient";
import TranslateRequest, {TranslatedStats} from "../ApiClient/body";
import StyledSelect from "../StyledSelect";
import VerticalTable from "../VerticalTable";
import StyledLineChart from "../StyledLineChart";
import {Series} from "../_store/stats/types";
import {fromUnixTime, getUnixTime} from "date-fns";
import {UpdaterState} from "../_store/updater/types";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    tables: TablesState
    indexes: IndexesState
    updater: UpdaterState
}

interface DispatchFromProps {
    setAllTables: typeof setAllTables
    setDisplayedTables: typeof setDisplayedTables
    setAllIndexes: typeof setAllIndexes
    setDisplayedIndexes: typeof setDisplayedIndexes
    setIndexesData: typeof setIndexesData
}

type Props = StateFromProps & DispatchFromProps

class Indexes extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
        this.handleTableSelection = this.handleTableSelection.bind(this);
        this.handleIndexSelection = this.handleIndexSelection.bind(this);
        this.datasetFilter = this.datasetFilter.bind(this);
        this.datasetMapper = this.datasetMapper.bind(this);
        this.labelMapper = this.labelMapper.bind(this);
        this.formatIndexDisplayedName = this.formatIndexDisplayedName.bind(this);
    }

    componentDidMount(): void {
        if (this.props.datasources.selected.length > 0) {
            this.fetchTables();
        }
        if (this.props.tables.displayed.length > 0) {
            this.fetchIndexes();
            this.fetchIndexData();
        }
    }

    componentDidUpdate(prevProps: Readonly<StateFromProps & DispatchFromProps>, prevState: Readonly<any>, snapshot?: any): void {
        if (Utils.SelectedDatasourcesHaveChanged(this.props.datasources.selected, prevProps.datasources.selected)) {
            if (this.props.datasources.selected.length > 0) {
                this.fetchTables();
            } else {
                this.props.setDisplayedTables([]);
                this.props.setAllTables([]);
            }
        }

        if (this.selectedTablesHaveChanged(prevProps.tables.displayed)) {
            this.props.setIndexesData({overview: [], charts: {}});
            if (this.props.tables.displayed.length > 0) {
                this.fetchIndexes();
                this.fetchIndexData();
            } else {
                this.props.setDisplayedIndexes([]);
                this.props.setAllIndexes([]);
            }
        }
    }

    selectedTablesHaveChanged(prevTables: Array<Table>): boolean {
        const tables = this.props.tables.displayed;
        if (tables.length !== prevTables.length) return true;
        let s1 = tables.sort();
        let s2 = prevTables.sort();
        for (let i = 0; i < s1.length; i++) {
            if (s1[i].datasourceId !== s2[i].datasourceId || s1[i].label !== s2[i].label) return true;
        }
        return false;
    }

    fetchTables() {
        ApiClient.getRecentStats("pg_stat_user_indexes",
            (response => {
                const filteredByDatasources: any = response.filter(((r: any) => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(r.datasource.id)));
                let tableIndex = 0;
                const tables: Array<Table> = filteredByDatasources.flatMap((r: any) => r.payload.map((p: any) => ({
                    id: tableIndex++,
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

    fetchIndexes() {
        ApiClient.getRecentStats("pg_stat_user_indexes",
            (response => {
                const filteredByDatasources: any = response.filter(((r: any) => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(r.datasource.id)));
                let indexIndex = 0;
                const indexes: Array<Index> = filteredByDatasources.flatMap((r: any) => r.payload.map((p: any) => {
                    const group = this.props.datasources.selected.length > 1 ?
                        Utils.GetLabelFromBackendDatasource(r.datasource.id, this.props.datasources.selected) + "\n" + p.table
                        : p.table;
                    return {
                        id: indexIndex++,
                        label: p.index,
                        group: group,
                        table: p.table,
                        datasourceId: r.datasource.id
                    }
                }));
                const filteredIndexes = indexes
                    .filter(i => this.props.tables.displayed.some(t => t.datasourceId === i.datasourceId && t.label === i.table));
                this.props.setAllIndexes(filteredIndexes);
                this.props.setDisplayedIndexes(filteredIndexes.filter(i => this.props.indexes.displayed.some(
                    i2 => i2.label === i.label && i2.datasourceId === i.datasourceId && i2.table === i.table)));
            }),
            (error => {
                //todo error handling
            }));
    }

    fetchIndexData() {
        this.fetchOverviewData();
        this.fetchChartData();
    }

    fetchOverviewData() {
        ApiClient.getRecentStats("pg_stat_user_indexes",
            (response => {
                let overview: Array<IndexesTableEntry> = [];
                response
                    .filter(((r: any) => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(r.datasource.id)))
                    .flatMap((r: any) => r.payload.map((p: IndexesTablePayload) => ({
                        ...p,
                        datasourceId: r.datasource.id
                    })))
                    .forEach((p: any) => overview.push(p));
                let data = this.props.indexes.data;
                data.overview = overview;
                this.props.setIndexesData(data);
            }),
            (error => {
                //todo error handling
            }));
    }

    fetchChartData() {
        const xyKeys = ["idx_scan", "idx_tup_read", "idx_tup_fetch"];
        const params = xyKeys.map((k: string) => ({
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
            }, {
                name: "index",
                type: "key"
            }]
        }));
        const req = {
            filter: {
                timestampFrom: getUnixTime(this.props.timeRange.start),
                timestampTo: getUnixTime(this.props.timeRange.end),
                type: "pg_stat_user_indexes",
                datasourceIds: this.props.datasources.selectedBackend.map(d => d.id)
            },
            params: params
        } as TranslateRequest;

        let data = this.props.indexes.data;
        ApiClient.getXyStats(req,
            (response => {
                response.forEach((e: TranslatedStats) => {
                    const key = e.params.y.name;
                    // @ts-ignore
                    data.charts[key] = e.data;
                });
                this.props.setIndexesData(data);
            }),
            (error => {
                //todo error handling
            }));

    }

    handleTableSelection(selected: Array<Table>) {
        this.props.setDisplayedTables(selected);
    }

    handleIndexSelection(selected: Array<Index>) {
        this.props.setDisplayedIndexes(selected);
    }

    datasetFilter(dataset: Series): boolean {
        return this.props.indexes.displayed.some(index => index.datasourceId === dataset.label[0] && index.table === dataset.label[1] && index.label === dataset.label[2]);
    }

    datasetMapper(datasets: Array<Series>): Array<Series> {
        return datasets.map(d => ({
            data: d.data,
            label: this.formatIndexDisplayedName(d.label[0], d.label[1], d.label[2])
        }))
    }

    labelMapper(labels: Array<any>): Array<any> {
        return labels.map(l => Utils.FormatTime(fromUnixTime(labels[0]), fromUnixTime(labels[labels.length - 1]), fromUnixTime(l)));
    }

    formatIndexDisplayedName(dsId: number, table: string, index: string): string {
        let name = "";
        if (this.props.datasources.selected.length > 1) {
            name += "[" + Utils.GetLabelFromBackendDatasource(dsId, this.props.datasources.selected) + "] "
        }
        if (this.props.tables.displayed.length > 1) {
            name += table + " "
        }
        name += index;
        return name;
    }


    render() {
        const entries: any = this.props.indexes.data.overview
            .filter((i: IndexesTableEntry) =>
                this.props.indexes.displayed.some(index => index.datasourceId === i.datasourceId && index.table === i.table && index.label === i.index))
            .map((i: IndexesTableEntry) => {
                const key = this.formatIndexDisplayedName(i.datasourceId, i.table, i.index);
                const data = {
                    "Scans": (i.idx_scan || 0),
                    "Reads": (i.idx_tup_read || 0),
                    "Fetches": (i.idx_tup_fetch || 0),
                    "Bloated?": i.idx_tup_read === i.idx_tup_fetch ? "Nope" : "Perhaps (reads =/= fetches)",
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
                        <div className="col Picker">
                            <StyledSelect
                                all={this.props.indexes.all || undefined}
                                selected={this.props.indexes.displayed || undefined}
                                placeholder={"Pick index..."}
                                loading={this.props.updater.loading > 0}
                                withGrouping={this.props.tables.displayed.length > 1}
                                handleChange={this.handleIndexSelection}
                            />
                        </div>
                    </div>
                </div>
                <VerticalTable entries={entries}/>
                <div className="Element Chart">
                    <StyledLineChart
                        data={this.props.indexes.data.charts.idx_scan}
                        title={"Index Scans"}
                        shiftColors={this.props.indexes.displayed.length === 1}
                        colorIndex={0}
                        datasetFilter={this.datasetFilter}
                        datasetMapper={this.datasetMapper}
                        labelMapper={this.labelMapper}
                    />
                </div>
                <div className="Element Chart">
                    <StyledLineChart
                        data={this.props.indexes.data.charts.idx_tup_read}
                        title={"Index Reads"}
                        shiftColors={this.props.indexes.displayed.length === 1}
                        colorIndex={1}
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
        tables: state.stats.tables,
        indexes: state.stats.indexes,
        updater: state.updater,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {
        setAllTables,
        setDisplayedTables,
        setAllIndexes,
        setDisplayedIndexes,
        setIndexesData,
    }
)(Indexes);
