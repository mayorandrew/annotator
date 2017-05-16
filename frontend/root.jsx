import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

import LoginScreen from './components/LoginScreen';
import AnnotationScreen from './components/AnnotationScreen';

class App extends React.Component {
    render() {
        return <div className="app">
            {this.props.children}
        </div>;
    }
}

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={LoginScreen} />
            <Route path="/annotate/:imageset/:page" component={AnnotationScreen} />
        </Route>
    </Router>
, $('#root').get(0));
