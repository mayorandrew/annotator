import autobind from 'react-autobind';
import axios from 'axios';
import $ from 'jquery';
const CancelToken = axios.CancelToken;

import Store from './Store';

const initialState = {
    folder: null,
    iImage: null,
    images: null,
    boxes: null,
    iBox: null
};

export default class BoxStore extends Store {
    constructor(imageStore) {
        super();
        autobind(this);
        this.state = initialState;
        this.imageStore = imageStore;
        this.imageStore.on('update', this.onChangeImageStore);

        this.cancelUpdate = null;
    }

    onChangeImageStore({ folder, iImage, images }) {
        if (this.state.folder != folder || this.state.iImage != iImage || this.state.images != images) {
            this.setState({ folder, iImage, images });
            this.updateBoxes();
        }
    }

    updateBoxes() {
        this.setState({ boxes: null, iBox: null });
        let { folder, images, iImage } = this.state;
        if (!images) return;
        const image = images[iImage];
        if (this.cancelUpdate) this.cancelUpdate();
        axios.get(`/api/sets/${folder}/${image}`, {
            cancelToken: new CancelToken((c) => this.cancelUpdate = c)
        }).then((response) => {
            this.cancelUpdate = null;
            this.setState({
                boxes: response.data.data && response.data.data.boxes || []
            });
        }).catch((err) => console.log(err));
    }

    updateBox(iBox, x, y, w, h) {
        this.state.boxes[iBox].x = x;
        this.state.boxes[iBox].y = y;
        this.state.boxes[iBox].w = w;
        this.state.boxes[iBox].h = h;
        this.setState({ boxes: this.state.boxes });
        this.saveBoxes();
    }

    updateBoxCategory(iBox, category) {
        this.state.boxes[iBox].category = category;
        this.setState({ boxes: this.state.boxes });
        this.saveBoxes();
    }

    updateBoxType(iBox, type) {
        this.state.boxes[iBox].type = type;
        this.setState({ boxes: this.state.boxes });
        this.saveBoxes();
    }

    createBox(x, y, w, h) {
        this.state.boxes.push({x,y,w,h});
        this.setState({ boxes: this.state.boxes, iBox: this.state.boxes.length - 1 });
        this.saveBoxes();
    }

    saveBoxes() {
        let { folder, images, iImage } = this.state;
        if (!images) return;
        const image = images[iImage];
        axios.post(`/api/sets/${folder}/${image}`, { boxes: this.state.boxes });
    }

    selectBox(iBox) {
        this.setState({
            iBox: iBox
        });
    }

    deleteBox() {
        this.state.boxes.splice(this.state.iBox, 1);
        this.setState({ boxes: this.state.boxes, iBox: null });
        this.saveBoxes();
    }
}
