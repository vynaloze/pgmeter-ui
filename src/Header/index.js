import React from 'react';
import './index.css';
import TimeRange from "./TimeRange";

function Header() {
    return (
        <div className="Header">
            <h1 className="title">
                pgmeter
            </h1>
            <div className="content container-fluid">
                <div className="row" style={{height: '100%'}}>
                    <div className="col">
                        datasource placeholder
                    </div>
                    <div className="col align-right">
                        <TimeRange/>
                    </div>
                </div>
            </div>
            <div className="content">
                <button className="btn-refresh">
                    <svg id="i-reload" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32"
                         height="32" fill="none" stroke="currentcolor" strokeLinecap="round"
                         strokeLinejoin="round" strokeWidth="2">
                        <path
                            d="M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default Header;
