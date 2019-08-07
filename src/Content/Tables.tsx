import React from 'react';
import './index.css';
import StyledSelect from "../StyledSelect";
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {Table, TablesState} from "../_store/stats/tables/types";
import {setAllTables, setDisplayedTables, setTablesData} from '../_store/stats/tables/actions';
import {setMaxSelectedDatasources} from "../_store/datasources/actions";
import ApiClient from "../ApiClient";
import {AppState} from "../_store";
import {connect} from "react-redux";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    tables: TablesState
}

interface DispatchFromProps {
    setAllTables: typeof setAllTables
    setDisplayedTable: typeof setDisplayedTables
    setTableData: typeof setTablesData
    setMaxSelectedDatasources: typeof setMaxSelectedDatasources
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
        this.props.setMaxSelectedDatasources(1);
        if (this.props.datasources.selected.length > 0) {
            this.fetchTables()
        }
        this.fetchTableData()
    }

    componentDidUpdate(prevProps: Readonly<StateFromProps & DispatchFromProps>, prevState: Readonly<InternalState>, snapshot?: any): void {
        if (this.props.datasources.selected.length > 0
            && this.props.datasources.selected !== prevProps.datasources.selected) {
            this.fetchTables()
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
        let keys = Object.keys(this.props.tables.tableData);
        console.log(keys)
    }

    handleTableSelection(selected: Array<Table>) {
        this.props.setDisplayedTable(selected);
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
                                maxSelected={1}
                                loading={this.state.loading}
                                handleChange={this.handleTableSelection}
                            />
                        </div>
                        <div className="col"/>
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
    {setAllTables, setDisplayedTable: setDisplayedTables, setTableData: setTablesData, setMaxSelectedDatasources}
)(Tables);
