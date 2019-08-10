import React from "react";
import {connect} from "react-redux";
import {BackendDatasource, Datasource, DatasourceState} from "../_store/datasources/types";
import {
    setBackendDatasources,
    setDatasources,
    setSelectedBackendDatasources,
    setSelectedDatasources
} from "../_store/datasources/actions";
import {AppState} from "../_store";
import './Datasources.css'
import ApiClient from "../ApiClient";
import StyledSelect from "../StyledSelect";
import {TimeRangeState} from "../_store/timeRange/types";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
}

interface DispatchFromProps {
    setDatasources: typeof setDatasources
    setSelectedDatasources: typeof setSelectedDatasources
    setBackendDatasources: typeof setBackendDatasources
    setSelectedBackendDatasources: typeof setSelectedBackendDatasources
}

type Props = StateFromProps & DispatchFromProps

interface InternalState {
    error: any
    loading: boolean
}

class Datasources extends React.Component<Props, InternalState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            loading: true,
        };
        this.handleChange = this.handleChange.bind(this);
        this.updateDatasources = this.updateDatasources.bind(this);
    }

    componentDidMount() {
        this.fetchDatasources()
    }

    componentDidUpdate(prevProps: Props, prevState: InternalState, snapshot: any) {
        if (prevProps.timeRange.start !== this.props.timeRange.start || prevProps.timeRange.end !== this.props.timeRange.end) {
            this.fetchDatasources()
        }
    }

    fetchDatasources() {
        this.setState({
            loading: true,
            error: null,
        });

        ApiClient.getDatasources(this.props.timeRange.start, this.props.timeRange.end,
            this.updateDatasources,
            (error) => {
                this.setState({
                    loading: false,
                    error
                });
            });
    }

    updateDatasources(result: any) {
        this.props.setBackendDatasources(result);
        let all = toDatasources(result, this.props.datasources.labelTemplate);
        let oldSelected = this.props.datasources.selected.flatMap(s => s.representedBy);
        let selected = all.filter(ds => ds.representedBy.some(d => oldSelected.includes(d)));
        this.props.setDatasources(all);
        this.props.setSelectedDatasources(selected);
        this.setState({
            loading: false
        });
    }

    handleChange(selected: Array<Datasource>) {
        this.props.setSelectedDatasources(selected);
        this.props.setSelectedBackendDatasources(toBackendDatasources(selected));
    }

    render() {
        return <div className="Datasources align-right">
            <StyledSelect
                all={this.props.datasources.all}
                selected={this.props.datasources.selected}
                placeholder={"Pick datasources..."}
                loading={this.state.loading}
                handleChange={this.handleChange}
            />
        </div>
    }
}

function toDatasources(ds: Array<BackendDatasource>, labelTemplate: string): Array<Datasource> {
    // first group all datasources by IP
    interface GroupedByIp {
        [ip: string]: Array<BackendDatasource>
    }

    let groupedByIp = ds.reduce((res: GroupedByIp, bd) => {
        res[bd.ip] = res[bd.ip] || [];
        res[bd.ip].push(bd);
        return res;
    }, {} as GroupedByIp);
    let groupedArray = Object.values(groupedByIp);

    // than join each non-#system datasource with respective #system datasource of that machine
    let internalDatasources = Array<Datasource>();
    for (let i = 0, newIndex = 0; i < groupedArray.length; i++) {
        let group = groupedArray[i];
        let indexOfSystemSource = group.findIndex(ds => ds.database === '#system');
        // if there is only one datasource with such IP and it is #system, add it
        if (group.length === 1 && indexOfSystemSource === 0) {
            internalDatasources.push({
                id: newIndex,
                label: replaceLabel(group[0], labelTemplate),
                representedBy: [group[0]]
            });
            newIndex++;
        } // else,  exclude #system from results but add it as representedBy to each other datasource in the group
        else {
            for (let j = 0; j < group.length; j++) {
                if (j !== indexOfSystemSource) {
                    let representedBy = [group[j]];
                    if (indexOfSystemSource !== -1) {
                        representedBy.push(group[indexOfSystemSource])
                    }
                    internalDatasources.push({
                        id: newIndex,
                        label: replaceLabel(group[j], labelTemplate),
                        representedBy: representedBy
                    });
                    newIndex++;
                }
            }
        }
    }
    return internalDatasources;
}

function replaceLabel(datasource: any, labelTemplate: string): string {
    // console.log(datasource);
    return labelTemplate.replace(/%\w+%/g, s => {
        let key = s.slice(1, -1);
        // console.log(key);
        // console.log(datasource[key]);
        return datasource[key]
    });
}

function toBackendDatasources(ids: Array<Datasource>): Array<BackendDatasource> {
    return ids.reduce((res: Array<BackendDatasource>, id: Datasource) => {
        res = res.concat(...id.representedBy);
        return res;
    }, new Array<BackendDatasource>());
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        timeRange: state.timeRange,
        datasources: state.datasources,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setDatasources, setSelectedDatasources, setBackendDatasources, setSelectedBackendDatasources}
)(Datasources);
