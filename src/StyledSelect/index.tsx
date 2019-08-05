import React from "react";
// @ts-ignore
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css"
// @ts-ignore
import onClickOutside from "react-onclickoutside";
import './index.css'

interface Props {
    all: Array<any>
    selected: Array<any>
    maxSelected: number
    loading: boolean

    handleChange(a: any): void

    selectedAccessor(a: any): any
}

interface InternalState {
    selectBoxOpen: boolean
}

class StyledSelect extends React.Component<Props, InternalState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectBoxOpen: false
        };
        this.toggleSelectBox = this.toggleSelectBox.bind(this);
    }

    toggleSelectBox() {
        this.setState({
            selectBoxOpen: !this.state.selectBoxOpen
        })
    }

    // don't delete me
    handleClickOutside = () => {
        this.setState({
            selectBoxOpen: false
        })
    };

    render() {
        return <div className="StyledSelect horizontal">
            <input value={this.props.selected.map(this.props.selectedAccessor)}
                   type="text" className="info-box" readOnly={true} onClick={this.toggleSelectBox}/>
            <div className="select-box">
                {this.state.selectBoxOpen ?
                    <MultiSelect
                        items={this.props.all}
                        selectedItems={this.props.selected}
                        onChange={this.props.handleChange}
                        loading={this.props.loading}
                        maxSelectedItems={this.props.maxSelected}
                    /> : null}
            </div>
        </div>
    }
}

export default onClickOutside(StyledSelect);