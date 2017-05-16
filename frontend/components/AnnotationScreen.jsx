import React from 'react';
import autobind from 'react-autobind';
import $ from 'jquery';
import StoreConnector from '../stores/StoreConnector';
import { imageStore, boxStore, categoriesStore } from '../stores/stores';

import ImageOverlay from './ImageOverlay';

import './AnnotationScreen.scss';

class AnnotationScreen extends React.Component {
    constructor() {
        super();
        autobind(this);
        this.state = {
            scale: null,
            scaledWidth: null,
            scaledHeight: null
        };

        this.containerWidth = null;
        this.containerHeight = null;
        this.imageWidth = null;
        this.imageHeight = null;
    }
    componentDidMount() {
        $(window).on('resize', this.onWindowResize);
        this.updateContainerDimensions();
    }
    componentWillUnmount() {
        $(window).off('resize', this.onWindowResize);
    }

    onWindowResize() {
        this.updateContainerDimensions();
    }

    updateContainerDimensions() {
        this.containerWidth = $(this.refs.left).innerWidth();
        this.containerHeight = $(this.refs.left).innerHeight();
        if (this.imageWidth && this.imageHeight) {
            this.updateImagePosition();
        } else {
            this.updateImageDimensions();
        }
    }

    updateImageDimensions() {
        const { folder, iImage, images } = this.props.image;
        if (!images) return;
        const image = images[iImage];

        const ctrl = this;
        const img = new Image();
        img.onload = function() {
            ctrl.imageWidth = this.width;
            ctrl.imageHeight = this.height;
            ctrl.updateImagePosition();
        };
        img.src = `/imagesets/${folder}/${image}`;
    }

    updateImagePosition() {
        let { imageWidth, imageHeight, containerWidth, containerHeight } = this;
        let imageAspect = imageWidth / imageHeight;
        let containerAspect = containerWidth / containerHeight;
        let scale = 0;
        if (imageAspect > containerAspect) {
            scale = containerWidth / imageWidth;
        } else {
            scale = containerHeight / imageHeight;
        }
        let scaledWidth = imageWidth * scale;
        let scaledHeight = imageHeight * scale;
        this.setState({ scale, scaledWidth, scaledHeight })
    }

    componentDidUpdate(oldProps) {
        if (oldProps.image.images != this.props.image.images || oldProps.image.iImage != this.props.image.iImage) {
            this.updateImageDimensions();
        }
    }

    onLogout(e) {
        e.preventDefault();
        imageStore.logout();
    }
    onForward(e) {
        e.preventDefault();
        imageStore.goForward();
    }
    onBackward(e) {
        e.preventDefault();
        imageStore.goBackward();
    }
    onChangeBoxCategory(e) {
        boxStore.updateBoxCategory(this.props.box.iBox, this.refs.category.value);
    }
    onChangeBoxType(e) {
        boxStore.updateBoxType(this.props.box.iBox, this.refs.type.value);
    }
    render() {
        const { categories } = this.props.categories;
        const { boxes, iBox } = this.props.box;
        const { id, folder, iImage, images } = this.props.image;
        const { scale, scaledWidth, scaledHeight } = this.state;

        if (!images || !scale) {
            return <div className="annotation-screen">
                <div ref="left" className="annotation-screen__left">
                </div>
                <div className="annotation-screen__right">
                </div>
            </div>;
        }

        const image = images[iImage];
        const box = boxes && boxes[iBox];
        const category = box && categories.find((f) => f.value == box.category);
        const types = category && category.types;

        return <div className="annotation-screen">
            <div ref="left" className="annotation-screen__left">
                <img
                    className="annotation-screen__image"
                    src={`/imagesets/${folder}/${image}`}
                    style={{width: scaledWidth + 'px', height: scaledHeight + 'px'}}
                />
                <ImageOverlay
                    width={scaledWidth}
                    height={scaledHeight}
                    scale={scale}
                    boxes={boxes}
                    selectedBox={iBox}
                    onUpdateBox={boxStore.updateBox}
                    onCreateBox={boxStore.createBox}
                    onSelectBox={boxStore.selectBox}
                />
            </div>
            <div className="annotation-screen__right">
                <div className="annotation-screen__controls annotation-controls">
                    <div className="annotation-controls__name">
                        <div className="annotation-controls__name-name">
                            {id}
                        </div>
                        <button className="annotation-controls__name-logout" onClick={this.onLogout}>
                            Выйти
                        </button>
                    </div>
                    <div className="annotation-controls__image">
                        <div className="annotation-controls__image-title">
                            Текущее изображение:
                        </div>
                        <div className="annotation-controls__image-name">
                            {image}
                        </div>
                        <div className="annotation-controls__image-controls">
                            <button className="annotation-controls__image-button _back" onClick={this.onBackward}>
                                &laquo; Назад
                            </button>
                            <div className="annotation-controls__image-number">
                                {iImage+1}&nbsp;/&nbsp;{images.length}
                            </div>
                            <button className="annotation-controls__image-button _forward" onClick={this.onForward}>
                                &raquo; Вперед
                            </button>
                        </div>
                    </div>
                    {iBox == null
                        ? <div className="annotation-controls__message">
                            Обведите регион на изображении с помощью мыши. При необходимости переместите прямоугольник
                        </div>
                        : <div className="annotation-controls__message">
                            Выберите категорию и тип для выбранного региона. Или нажмите кнопку "удалить", чтобы удалить прямоугольник
                        </div> }
                    {iBox == null
                        ? false
                        : <div className="annotation-controls__properties">
                            <button className="annotation-controls__properties-delete" onClick={boxStore.deleteBox}>
                                Удалить
                            </button>
                            <div className="annotation-controls__property _category">
                                <div className="annotation-controls__property-name">
                                    Категория
                                </div>
                                <div className="annotation-controls__property-value">
                                    <select ref="category" name="category" size="5" value={box.category} onChange={this.onChangeBoxCategory}>
                                        { categories && categories.map((category) => (
                                            <option key={category.value} value={category.value}>{category.name}</option>
                                        )) }
                                    </select>
                                </div>
                            </div>
                            <div className="annotation-controls__property _type">
                                <div className="annotation-controls__property-name">
                                    Тип
                                </div>
                                <div className="annotation-controls__property-value">
                                    <select ref="type" name="type" size="5" value={box.type} onChange={this.onChangeBoxType}>
                                        { types && types.map((type) => (
                                            <option key={type.value} value={type.value}>{type.name}</option>
                                        )) }
                                    </select>
                                </div>
                            </div>
                        </div>}
                    <div className="annotation-controls__space"></div>
                    <div className="annotation-controls__finish">
                        <button className="annotation-controls__button-finish" onClick={imageStore.createArchive}>
                            Создать архив
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default StoreConnector(AnnotationScreen, {
    image: imageStore,
    box: boxStore,
    categories: categoriesStore
}, {});
