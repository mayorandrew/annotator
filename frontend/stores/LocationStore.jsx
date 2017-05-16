import autobind from 'react-autobind';
import Store from './Store';

export default class LocationStore extends Store {
    constructor(history) {
        super();
        this.state = {
            location: history.getCurrentLocation()
        };
        this.history = history;
        history.listen((nextLocation) => { this.onChangeLocation(nextLocation) });
        autobind(this);
    }

    onChangeLocation(location) {
        this.setState({ location });
    }

    goBack() {
        this.history.go(-1);
    }

    gotoLocation(path, query = {}, replaceQuery = false) {
        let location = Object.assign({}, this.state.location);
        if (replaceQuery) {
            location.query = query;
        } else {
            Object.assign(location.query, query);
        }
        if (path) {
            location.pathname = path;
        }
        this.history.push(location);
    }
}
