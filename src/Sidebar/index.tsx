import React, {Component} from 'react'
import {NavLink} from "react-router-dom";
import './index.css';

class Sidebar extends Component {
    render() {
        return (
            <div className="Sidebar">
                <ul>
                    <li>
                        <NavLink to="/dev" activeClassName="active" exact={true}> Dev </NavLink>
                    </li>
                    <li>
                        <NavLink to="/queries" activeClassName="active" exact={true}> Queries </NavLink>
                    </li>
                    <li>
                        <NavLink to="/tables" activeClassName="active" exact={true}> Tables </NavLink>
                    </li>
                    <li>
                        <NavLink to="/indexes" activeClassName="active" exact={true}> Indexes </NavLink>
                    </li>
                    <li>
                        <NavLink to="/system" activeClassName="active" exact={true}> System </NavLink>
                    </li>
                    <li>
                        <NavLink to="/activity" activeClassName="active" exact={true}> Activity </NavLink>
                    </li>
                    <li>
                        <NavLink to="/locks" activeClassName="active" exact={true}> Locks </NavLink>
                    </li>
                    <li>
                        <NavLink to="/wal" activeClassName="active" exact={true}> WAL </NavLink>
                    </li>
                </ul>
            </div>
        );
    }
}

export default Sidebar;
