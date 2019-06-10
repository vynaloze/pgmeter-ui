import React, {Component} from 'react'
import {NavLink} from "react-router-dom";
import './index.css';

class Sidebar extends Component {
    render() {
        return (
            <div className="Sidebar">
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/" activeClassName="active" exact={true}> Overview </NavLink>
                        </li>
                        <li>
                            <NavLink to="/1" activeClassName="active" exact={true}> Page1 </NavLink>
                        </li>
                        <li>
                            <NavLink to="/2" activeClassName="active" exact={true}> Page2 </NavLink>
                        </li>
                        <li>
                            <NavLink to="/" activeClassName="active" exact={true}> ... </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }
}

export default Sidebar;
