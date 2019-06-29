import React, {Component} from 'react'
import {Route} from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Page1 from "./Content/Page1";
import Queries from "./Content/Queries";
import Tables from "./Content/Tables";
import Indexes from "./Content/Indexes";
import System from "./Content/System";
import Activity from "./Content/Activity";
import Locks from "./Content/Locks";
import Wal from "./Content/Wal";

class App extends Component {
    render() {
        return (
            <div>
                <Header/>
                <div className="horizontal">
                    <Sidebar/>
                    <Route path="/dev" component={Page1}/>
                    <Route path="/queries" component={Queries}/>
                    <Route path="/tables" component={Tables}/>
                    <Route path="/indexes" component={Indexes}/>
                    <Route path="/system" component={System}/>
                    <Route path="/activity" component={Activity}/>
                    <Route path="/locks" component={Locks}/>
                    <Route path="/wal" component={Wal}/>
                </div>
            </div>
        )
    }
}

export default App;