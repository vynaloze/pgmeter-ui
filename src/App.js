import React, {Component} from 'react'
import {Route} from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Page1 from "./Content/Page1";
import Page2 from "./Content/Page2";

class App extends Component {
    render() {
        return (
            <div>
                <Header/>
                <div className="horizontal">
                    <Sidebar/>
                    <Route path="/1" component={Page1}/>
                    <Route path="/2" component={Page2}/>
                </div>
            </div>
        )
    }
}

export default App;