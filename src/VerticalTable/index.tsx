import React from 'react';
import './index.css';

interface Props {
    data: Data
}

interface Data {
    [label: string]: string | number
}

export default class VerticalTable extends React.Component<Props, {}> {
    render() {
        const keys = Object.keys(this.props.data);
        let content: any[] = [];
        keys.forEach((key: string) =>
            content.push(
                <tr>
                    <th scope="row">{key}</th>
                    <td>{this.props.data[key]}</td>
                </tr>
            )
        );
        return <table className="table table-dark table-hover table-borderless">
            <tbody>
            {content}
            </tbody>
        </table>
    }
}