import React from "react";
import {connect} from "react-redux";
import {Moment} from "moment";
// @ts-ignore
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css"
// @ts-ignore
import onClickOutside from "react-onclickoutside";
import {Datasource} from "../_store/datasources/types";
import {setDatasources, setSelectedDatasources} from "../_store/datasources/actions";
import {AppState} from "../_store";
import './Datasources.css'

interface StateFromProps {
    all: Array<Datasource>
    selected: Array<Datasource>
    start: Moment
    end: Moment
}

interface DispatchFromProps {
    setDatasources: typeof setDatasources
    setSelectedDatasources: typeof setSelectedDatasources
}

type Props = StateFromProps & DispatchFromProps

interface InternalState {
    error: any
    loading: boolean
    all: Array<InternalDatasource>
    selected: Array<InternalDatasource>
    selectBoxOpen: boolean
}

interface InternalDatasource {
    id: number
    label: string
    representedBy: Array<Datasource>
}

class Datasources extends React.Component<Props, InternalState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            loading: true,
            all: toInternalDatasources(props.all),
            selected: toInternalDatasources(props.selected),
            selectBoxOpen: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.toggleSelectBox = this.toggleSelectBox.bind(this);
    }

    componentDidMount() {
        this.fetchDatasources()
    }

    componentDidUpdate(prevProps: Props, prevState: InternalState, snapshot: any) {
        if (prevProps.start !== this.props.start || prevProps.end !== this.props.end) {
            this.fetchDatasources()
        }
    }

    fetchDatasources() {
        this.setState({
            loading: true,
            error: null,
        });

        fetch("http://localhost:3000/api/ds/" + this.props.start.unix() + "/" + this.props.end.unix()) //todo remember to change
            .then(res => res.json())
            .then(
                (result) => {
                    this.props.setDatasources(result);
                    let all = toInternalDatasources(result);
                    let oldSelected = this.state.selected.flatMap(s => s.representedBy);
                    let selected = all.filter(ds => ds.representedBy.some(d => oldSelected.includes(d)));
                    this.setState({
                        loading: false,
                        all: all,
                        selected: selected,
                    });
                },
                (error) => {
                    this.setState({
                        loading: false,
                        error
                    });
                }
            )
    }

    handleChange(selected: Array<InternalDatasource>) {
        this.setState({
            selected: selected
        });
        this.props.setSelectedDatasources(toDatasources(selected));
    }

    toggleSelectBox() {
        this.setState({
            selectBoxOpen: !this.state.selectBoxOpen
        })
    }

    handleClickOutside = () => {
        this.setState({
            selectBoxOpen: false
        })
    };

    render() {
        return <div className="Datasources horizontal">
            <input value={this.state.selected.map(s => s.label)}
                   type="text" className="info-box align-right" readOnly={true} onClick={this.toggleSelectBox}/>
            <div className="select-box">
                {this.state.selectBoxOpen ?
                    <MultiSelect
                        items={this.state.all}
                        selectedItems={this.state.selected}
                        onChange={this.handleChange}
                        loading={this.state.loading}
                    /> : null}
            </div>
        </div>
    }
}

function toInternalDatasources(ds: Array<Datasource>): Array<InternalDatasource> {
    interface GroupedByIp {
        [ip: string]: Array<Datasource>
    }

    let groupedByIp = ds.reduce((res: GroupedByIp, bd) => {
        res[bd.ip] = res[bd.ip] || [];
        res[bd.ip].push(bd);
        return res;
    }, {} as GroupedByIp);

    return Object.values(groupedByIp).map((value, index) => {
        return {
            id: index,
            label: value[0].ip, // todo
            representedBy: value
        } as InternalDatasource
    });
}

function toDatasources(ids: Array<InternalDatasource>): Array<Datasource> {
    return ids.reduce((res: Array<Datasource>, id: InternalDatasource) => {
        res = res.concat(...id.representedBy);
        return res;
    }, new Array<Datasource>());
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        start: state.timeRange.start,
        end: state.timeRange.end,
        all: state.datasources.all,
        selected: state.datasources.selected,
        // datasourceLabel: state.datasources.labelTemplate,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setDatasources, setSelectedDatasources}
)(onClickOutside(Datasources));
