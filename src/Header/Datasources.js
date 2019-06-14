import React from "react";
import {connect} from "react-redux";
import {updateDatasources, updateSelectedDatasources} from "../_redux/actions";
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css" //todo?


class Datasources extends React.Component {
    constructor(props) {
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

    componentDidUpdate(prevProps, prevState, snapshot) {
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
                    this.props.updateDatasources(result)
                },
                (error) => {
                    this.setState({
                        loading: false,
                        error
                    });
                }
            )
    }

    handleChange(selected) {
        this.props.updateSelectedDatasources(selected);
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

function mapStateToProps(state) {
    return {
        start: state.timeRange.start,
        end: state.timeRange.end,
        all: state.datasources.all,
        selected: state.datasources.selected,
        datasourceLabel: state.datasources.label,
    }
}

export default connect(
    mapStateToProps,
    {updateDatasources, updateSelectedDatasources}
)(Datasources);
