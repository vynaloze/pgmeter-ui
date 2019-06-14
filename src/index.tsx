import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Provider} from 'react-redux'
import store from "./_store";
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Route path="/" component={App}/>
        </Router>
    </Provider>,
    document.getElementById('root'));
