import React from 'react';
import './index.css';
import {TimeRangeState} from "../_store/timeRange/types";
import {DatasourceState} from "../_store/datasources/types";
import {SystemState} from "../_store/stats/system/types";
import {AppState} from "../_store";
import {connect} from "react-redux";
import * as Utils from "./Utils";
import TranslateRequest from "../ApiClient/body";
import ApiClient from "../ApiClient";
import {setSystemData} from '../_store/stats/system/actions';
import StyledLineChart from "../StyledLineChart";
import {Series} from "../_store/stats/types";
import {fromUnixTime, getUnixTime} from "date-fns";

interface StateFromProps {
    timeRange: TimeRangeState
    datasources: DatasourceState
    system: SystemState
}

interface DispatchFromProps {
    setSystemData: typeof setSystemData
}

type Props = StateFromProps & DispatchFromProps

interface SystemTypes {
    [type: string]: Array<string>
}

export class System extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
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
        const types: SystemTypes = {
            "cpu": ["usage_percent"],
            "disk": ["bytes_available", "reads", "writes", "bytes_read", "bytes_write"],
            "load": ["load1", "load5", "load15"],
            "net": ["bytes_in", "bytes_out"],
            "virt_mem": ["available"],
            "swap_mem": ["available"]
        };

        Object.keys(types).forEach(type => {
            this.makeRequests(type, types[type]);
        })
    }

    makeRequests(type: string, keys: Array<string>) {
        keys.forEach(key => {
            let data = this.props.system.data;
            this.makeRequest(type, key, (response => {
                // @ts-ignore
                data[type][key] = response;
                this.props.setSystemData(data);
            }))
        })
    }

    makeRequest(type: string, key: string, callback: (response: any) => void) {
        const req = {
            filter: {
                timestampFrom: getUnixTime(this.props.timeRange.start),
                timestampTo: getUnixTime(this.props.timeRange.end),
                type: type,
                datasourceIds: this.props.datasources.selectedBackend.map(d => d.id)
            },
            params: {
                x: {
                    name: "ts",
                    type: "timestamp"
                },
                y: {
                    name: key,
                    type: "key"
                },
                dimension: [{
                    name: "ds",
                    type: "datasource"
                }]
            }
        } as TranslateRequest;

        ApiClient.getXyStats(req,
            (response => {
                callback(response);
                this.setState({error: null})
            }),
            (error => this.setState({error: "Error fetching data: " + error.toString()})));
    }

    datasetFilter(dataset: Series): boolean {
        return true;
    }

    datasetMapper(datasets: Array<Series>): Array<Series> {
        return datasets.map(d => ({
            data: d.data,
            label: Utils.GetLabelFromBackendDatasource(d.label, this.props.datasources.selected)
        }))
    }

    labelMapper(labels: Array<any>): Array<any> {
        return labels.map(l => Utils.FormatTime(fromUnixTime(labels[0]), fromUnixTime(labels[labels.length - 1]), fromUnixTime(l)));
    }

    render() {
        return (
            <div className="Content">
                <div className="container-fluid">
                    <div className="row no-gutters">
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            <StyledLineChart
                                data={this.props.system.data.load.load1}
                                title={"Load 1m"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={0}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            <StyledLineChart
                                data={this.props.system.data.load.load5}
                                title={"Load 5m"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={0}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col" style={{maxWidth: '32%'}}>
                            <StyledLineChart
                                data={this.props.system.data.load.load15}
                                title={"Load 15m"}
                                shiftColors={this.props.datasources.selected.length === 1}
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
                                data={this.props.system.data.disk.bytes_available}
                                title={"Space Left"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={1}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.cpu.usage_percent}
                                title={"CPU Usage"}
                                yAxis={"%"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={2}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.disk.reads}
                                title={"Disk Reads"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={3}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.disk.writes}
                                title={"Disk Writes"}
                                shiftColors={this.props.datasources.selected.length === 1}
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
                                data={this.props.system.data.disk.bytes_read}
                                title={"Disk Reads"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={3}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.disk.bytes_write}
                                title={"Disk Writes"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
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
                                data={this.props.system.data.net.bytes_in}
                                title={"Network In"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={5}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.net.bytes_out}
                                title={"Network Out"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={5}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.virt_mem.available}
                                title={"Available Memory"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={6}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                        <div className="Element Chart col">
                            <StyledLineChart
                                data={this.props.system.data.swap_mem.available}
                                title={"Swap Space Left"}
                                yAxis={"bytes"}
                                shiftColors={this.props.datasources.selected.length === 1}
                                colorIndex={7}
                                datasetFilter={this.datasetFilter}
                                datasetMapper={this.datasetMapper}
                                labelMapper={this.labelMapper}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        timeRange: state.timeRange,
        datasources: state.datasources,
        system: state.stats.system
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setSystemData}
)(System);
