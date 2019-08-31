import React from 'react';
import './index.css';
import TimeRange from "./TimeRange";
import Datasources from "./Datasources";
import Updater from "./Updater";

function Header() {
    return (
        <div className="Header">
            <h1 className="title">
                pgmeter
            </h1>
            <div className="content container-fluid">
                <div className="row" style={{height: '100%'}}>
                    <div className="col-6">
                        <Datasources/>
                    </div>
                    <div className="col-5 align-right">
                        <TimeRange/>
                    </div>
                    <div className="col-1 align-right">
                        <Updater/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
