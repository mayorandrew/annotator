import autobind from 'react-autobind';
import axios from 'axios';
import $ from 'jquery';

import Store from './Store';

const initialState = {
    folders: null,
    id: null,
    folder: null,
    iImage: null,
    images: null
};

export default class ImageStore extends Store {
    constructor(locationStore) {
        super();
        autobind(this);
        this.state = initialState;
        this.state.id = localStorage.getItem('userId') || null;
        this.locationStore = locationStore;
        this.locationStore.on('update', this.onChangeLocationStore);
        setTimeout(() => this.updateImagesets(), 0);
    }

    onChangeLocationStore({ location }) {
        let match = null;
        if (match = location.pathname.match(/^\/annotate\/(\w+)\/(\d+)/)) {
            if (this.state.id) {
                this.setState({
                    folder: match[1],
                    iImage: +match[2]
                });
                this.updateImages(match[1]);
            } else {
                this.locationStore.gotoLocation('/');
            }
        } else if (match = location.pathname.match(/^\/$/)) {
            this.setState({ folder: null });
        } else {
            this.locationStore.gotoLocation('/');
        }
    }

    updateImagesets() {
        axios.get('/api/sets/').then((response) => {
            this.setState({
                folders: response.data.data
            });
        });
    }

    updateImages() {
        if (this.state.images) return;
        axios.get(`/api/sets/${this.state.folder}/`).then((response) => {
            this.setState({
                images: response.data.data
            });
        });
    }

    goForward() {
        if (this.state.iImage < this.state.images.length - 1) {
            this.locationStore.gotoLocation(`/annotate/${this.state.folder}/${this.state.iImage+1}`);
        }
    }

    goBackward() {
        if (this.state.iImage > 0) {
            this.locationStore.gotoLocation(`/annotate/${this.state.folder}/${this.state.iImage-1}`);
        }
    }

    select(data) {
        this.setState({ id: data.id });
        localStorage.setItem('userId', data.id);
        this.locationStore.gotoLocation(`/annotate/${data.folder}/0`);
    }

    logout() {
        this.setState({ id: null });
        this.locationStore.gotoLocation('/');
    }

    createArchive() {
        axios.post(`/api/sets/${this.state.folder}`, { id: this.state.id }).then((response) => {
            let zipPath = response.data.data.zipPath;
            let missing = response.data.data.missingAnnotations;
            if (zipPath) {
                if (missing.length == 0) {
                    alert(`Создан архив: ${zipPath}`);
                } else {
                    let ellipsis = missing.length > 3 ? '...' : '';
                    alert(`Создан архив: ${zipPath}. В архиве отсутствует разметка для некоторых файлов:\n${missing.slice(0,3).join(', ')}${ellipsis}`);
                }
            }
        });
    }
}
