import autobind from 'react-autobind';
import axios from 'axios';
import $ from 'jquery';
const CancelToken = axios.CancelToken;

import Store from './Store';

const initialState = {
    categories: null
};

export default class CategoriesStore extends Store {
    constructor() {
        super();
        autobind(this);
        this.state = initialState;
        setTimeout(() => this.updateCategories(), 0);
    }

    updateCategories() {
        axios.get('/categories.json').then((response) => {
            this.setState({
                categories: response.data
            });
        });
    }
}