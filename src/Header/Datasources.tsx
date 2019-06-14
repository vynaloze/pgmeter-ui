import React from "react";
import {connect} from "react-redux";
import {Moment} from "moment";
// @ts-ignore
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css"
import {BackendDatasource, Datasource} from "../_store/datasources/types";
import {setDatasources, setSelectedDatasources} from "../_store/datasources/actions";
import {AppState} from "../_store";

interface StateFromProps {
    all: Array<BackendDatasource>
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
}

class Datasources extends React.Component<Props, InternalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            error: null,
            loading: true,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.fetchDatasources()
    }

    componentDidUpdate(prevProps: any, prevState: InternalState, snapshot: any) {
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
                    this.setState({
                        loading: false,
                    });
                    // todo map to another model
                    console.log(result);
                    this.props.setDatasources(result)
                },
                (error) => {
                    this.setState({
                        loading: false,
                        error
                    });
                }
            )
    }

    handleChange(selected: Array<Datasource>) {
        this.props.setSelectedDatasources(selected);
    }

    render() {
        return <MultiSelect
            items={this.props.all}
            selectedItems={this.props.selected}
            onChange={this.handleChange}
            loading={this.state.loading}
        />
    }
}

function mapStateToProps(state: AppState): StateFromProps {
    return {
        start: state.timeRange.start,
        end: state.timeRange.end,
        all: state.datasources.all,
        selected: state.datasources.selected,
        // datasourceLabel: state.datasources.label,
    }
}

export default connect<StateFromProps, DispatchFromProps, {}, AppState>(
    mapStateToProps,
    {setDatasources, setSelectedDatasources}
)(Datasources);
