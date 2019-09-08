import React from 'react';
import './index.css';

interface Props {
    entries: Array<Entry>
}

interface Entry {
    key: string
    data: Data
}

interface Data {
    [label: string]: string | number
}

interface InternalState {
    displayedIndex: number
}

export default class VerticalTable extends React.Component<Props, InternalState> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            displayedIndex: 0
        };
        this.isPaginated = this.isPaginated.bind(this);
        this.hasPrevious = this.hasPrevious.bind(this);
        this.previous = this.previous.bind(this);
        this.hasNext = this.hasNext.bind(this);
        this.next = this.next.bind(this);
    }

    static entriesHaveChanged(entries1: Array<Entry>, entries2: Array<Entry>): boolean {
        if (entries1.length !== entries2.length) return true;
        const keys1 = entries1.map(e => e.key);
        const keys2 = entries2.map(e => e.key);
        return !(keys1.every(k => keys2.includes(k)) && keys2.every(k => keys1.includes(k)));
    }

    isPaginated(): boolean {
        return this.props.entries.length > 1;
    }

    hasPrevious(): boolean {
        return this.state.displayedIndex > 0;
    }

    previous(): void {
        if (this.hasPrevious())
            this.setState({
                displayedIndex: this.state.displayedIndex - 1
            });
    }

    hasNext(): boolean {
        return this.state.displayedIndex < this.props.entries.length - 1;
    }

    next(): void {
        if (this.hasNext())
            this.setState({
                displayedIndex: this.state.displayedIndex + 1
            });
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<InternalState>, snapshot?: any): void {
        if (VerticalTable.entriesHaveChanged(prevProps.entries, this.props.entries)) {
            this.setState({
                displayedIndex: 0
            })
        }
    }

    render() {
        if (this.props.entries.length < 1) {
            return <div/>
        }

        const entry = this.props.entries[this.state.displayedIndex];
        const keys = Object.keys(entry.data);
        let content: any[] = [];
        keys.forEach((key: string) =>
            content.push(
                <tr key={key}>
                    <th style={{width: '25%'}} scope="row">{key}</th>
                    <td style={{width: '75%'}}>{entry.data[key]}</td>
                </tr>
            )
        );

        return <div className="VerticalTable">
            <div className="container Header">
                <div className="col-3 text-left">
                    <button
                        disabled={!this.isPaginated() || !this.hasPrevious()}
                        onClick={this.previous}
                    >Previous
                    </button>
                </div>
                <div className="col text-center font-weight-bold">
                    {entry.key}
                </div>
                <div className="col-3 text-right">
                    <button
                        disabled={!this.isPaginated() || !this.hasNext()}
                        onClick={this.next}
                    >Next
                    </button>
                </div>
            </div>
            <table className="table table-dark table-hover table-borderless">
                <tbody>
                {content}
                </tbody>
            </table>
        </div>
    }
}