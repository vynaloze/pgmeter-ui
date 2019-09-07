import React from 'react';
import './index.css'

export interface Props {
    ranges: Array<Ranges>
    selected: string | null
    isOpen: boolean
}

export interface Ranges {
    title: string
    onClick: () => void
}

export default class QuickRanges extends React.Component<Props> {
    render() {
        if (!this.props.isOpen) {
            return <div/>;
        }
        const entries = this.props.ranges.map(range => {
            return (
                <li key={range.title} onMouseDown={range.onClick}>
                    <span
                        className={this.props.selected !== null && range.title.includes(this.props.selected) ? "active" : ""}>
                        {range.title}
                    </span>
                </li>
            )
        });
        return (
            <div className="QuickRanges">
                <ul>
                    {entries}
                </ul>
            </div>
        )
    }
}