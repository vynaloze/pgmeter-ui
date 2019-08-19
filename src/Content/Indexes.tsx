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
import TranslateRequest from "../ApiClient/body";
import StyledSelect from "../StyledSelect";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    tables: TablesState
    indexes: IndexesState
}

interface DispatchFromProps {
    setAllTables: typeof setAllTables
    setDisplayedTables: typeof setDisplayedTables
    setAllIndexes: typeof setAllIndexes
    setDisplayedIndexes: typeof setDisplayedIndexes
    setIndexesData: typeof setIndexesData
}

type Props = StateFromProps & DispatchFromProps

interface InternalState {
    error: string | null
    loading: boolean
}

class Indexes extends React.Component<Props, InternalState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            loading: false
        };
        this.handleTableSelection = this.handleTableSelection.bind(this);
        this.handleIndexSelection = this.handleIndexSelection.bind(this);
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

    componentDidUpdate(prevProps: Readonly<StateFromProps & DispatchFromProps>, prevState: Readonly<InternalState>, snapshot?: any): void {
        if (Utils.SelectedDatasourcesHaveChanged(this.props.datasources.selected, prevProps.datasources.selected)) {
            if (this.props.datasources.selected.length > 0) {
                this.setState({loading: true});
                this.fetchTables();
                this.setState({loading: false});
            } else {
                this.props.setDisplayedTables([]);
                this.props.setAllTables([]);
            }
        }

        if (Utils.SelectedTablesHaveChanged(this.props.tables.displayed, prevProps.tables.displayed)) {
            this.props.setIndexesData({overview: [], charts: {}});
            if (this.props.tables.displayed.length > 0) {
                this.setState({loading: true});
                this.fetchIndexes();
                this.fetchIndexData();
                this.setState({loading: false});
            } else {
                this.props.setDisplayedIndexes([]);
                this.props.setAllIndexes([]);
            }
        }
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
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching indexes: " + error.toString()})));
    }

    fetchIndexes() {
        ApiClient.getRecentStats("pg_stat_user_indexes",
            (response => {
                const filteredByDatasources: any = response.filter(((r: any) => this.props.datasources.selectedBackend.map((ds => ds.id)).includes(r.datasource.id)));
                let indexIndex = 0;
                const indexes: Array<Index> = filteredByDatasources.flatMap((r: any) => r.payload.map((p: any) => ({
                    id: indexIndex++,
                    label: p.index,
                    group: "[" + Utils.GetLabelFromBackendDatasource(r.datasource.id, this.props.datasources.selected) + "]\n" + p.table,
                    table: p.table,
                    datasourceId: r.datasource.id
                })));
                const filteredIndexes = indexes
                    .filter(i => this.props.tables.displayed.some(t => t.datasourceId === i.datasourceId && t.label === i.table));
                this.props.setAllIndexes(filteredIndexes);
                this.props.setDisplayedIndexes(filteredIndexes.filter(i => this.props.indexes.displayed.some(
                    i2 => i2.label === i.label && i2.datasourceId === i.datasourceId && i2.table === i.table)));
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching indexes: " + error.toString()})));
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
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching data: " + error.toString()})));
    }

    fetchChartData() {
        const xyKeys = ["idx_scan", "idx_tup_read", "idx_tup_fetch"];
        xyKeys.forEach((k: string) => {
            const req = {
                filter: {
                    timestampFrom: this.props.timeRange.start.unix(),
                    timestampTo: this.props.timeRange.end.unix(),
                    type: "pg_stat_user_indexes",
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
                    }, {
                        name: "index",
                        type: "key"
                    }]
                }
            } as TranslateRequest;
            let data = this.props.indexes.data;
            ApiClient.getXyStats(req,
                (response => {
                    // @ts-ignore
                    data.charts[k] = response;
                    this.props.setIndexesData(data);
                    this.setState({error: null})
                }),
                (error => this.setState({error: "Error fetching data: " + error.toString()})));
        })
    }

    handleTableSelection(selected: Array<Table>) {
        this.props.setDisplayedTables(selected);
    }

    handleIndexSelection(selected: Array<Index>) {
        this.props.setDisplayedIndexes(selected);
    }

    render() {
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
                        <div className="col Picker">
                            <StyledSelect
                                all={this.props.indexes.all || undefined}
                                selected={this.props.indexes.displayed || undefined}
                                placeholder={"Pick index..."}
                                loading={this.state.loading}
                                withGrouping={this.props.tables.displayed.length > 1}
                                handleChange={this.handleIndexSelection}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    {JSON.stringify(this.props.indexes)}
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
