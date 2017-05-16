import React from 'react';
import autobind from 'react-autobind';
import Rnd from 'react-rnd';
import $ from 'jquery';
import cn from 'classnames';

import './ImageOverlay.scss';

export default class ImageOverlay extends React.Component {
    constructor() {
        super();
        autobind(this);
    }
    onResizeStart(direction, styleSize, clientSize, event) {
        event.preventDefault();
    }
    onDragStop(iBox, event, { position }) {
        let scale = this.props.scale;
        let box = this.props.boxes[iBox];
        this.props.onUpdateBox(iBox, position.left / scale, position.top / scale, box.w, box.h);
    }
    onResizeStop(iBox, direction, styleSize, clientSize, delta, position) {
        let scale = this.props.scale;
        this.props.onUpdateBox(iBox, position.x / scale, position.y / scale, clientSize.width / scale, clientSize.height / scale);
    }
    onTouchStart(e) {
        if (e.target != this.refs.overlay) return;
        if (e.targetTouches.length != 1) return;
        e.preventDefault();
        this.startBoxCreation(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        $(window).on('touchmove', this.onTouchMove);
        $(window).on('touchend', this.onTouchEnd);
    }
    onTouchMove(e) {
        this.endX = e.targetTouches[0].clientX;
        this.endY = e.targetTouches[0].clientY;
        this.updateCreationBoxPosition();
    }
    onTouchEnd(e) {
        this.updateCreationBoxPosition(true);
        $(window).off('touchend', this.onTouchEnd);
        $(window).off('touchmove', this.onTouchMove);
    }
    onMouseDown(e) {
        if (e.target != this.refs.overlay) return;
        e.preventDefault();
        this.startBoxCreation(e.clientX, e.clientY);
        $(window).on('mousemove', this.onMouseMove);
        $(window).on('mouseup', this.onMouseUp);
    }
    onMouseMove(e) {
        this.endX = e.clientX;
        this.endY = e.clientY;
        this.updateCreationBoxPosition();
    }
    onMouseUp(e) {
        this.endX = e.clientX;
        this.endY = e.clientY;
        this.updateCreationBoxPosition(true);
        $(this.refs.creationBox).addClass('_hidden');
        $(window).off('mouseup', this.onMouseUp);
        $(window).off('mousemove', this.onMouseMove);
    }
    startBoxCreation(x, y) {
        this.props.onSelectBox(null);
        this.startX = x;
        this.startY = y;
        this.endX = x;
        this.endY = y;
        this.firstMoved = true;
    }
    updateCreationBoxPosition(save) {
        let minX = Math.min(this.startX, this.endX);
        let minY = Math.min(this.startY, this.endY);
        let maxX = Math.max(this.startX, this.endX);
        let maxY = Math.max(this.startY, this.endY);
        let style = {
            left: minX,
            top: minY,
            width: Math.max(20, maxX - minX),
            height: Math.max(20, maxY - minY)
        };
        $(this.refs.creationBox).css(style);
        if (maxX - minX > 5 || maxY - minY > 5) {
            if (this.firstMoved) {
                this.firstMoved = false;
                $(this.refs.creationBox).removeClass('_hidden');
            }
            if (save) {
                let scale = this.props.scale;
                this.props.onCreateBox(style.left / scale, style.top / scale, style.width / scale, style.height / scale);
                $(this.refs.creationBox).addClass('_hidden');
            }
        }
    }
    componentDidUpdate() {
        if (!this.props.boxes) return;
        let scale = this.props.scale;
        this.props.boxes.forEach((box, iBox) => {
            this.refs['box' + iBox].updateSize({
                width: box.w * scale,
                height: box.h * scale
            });
            this.refs['box' + iBox].updatePosition({
                x: box.x * scale,
                y: box.y * scale
            });
        })
    }
    onBoxClick(iBox, e) {
        this.props.onSelectBox(iBox);
    }
    render() {
        const { width, height, scale, boxes, selectedBox } = this.props;
        return <div
            ref="overlay"
            className="image-overlay"
            style={{width: width + 'px', height: height + 'px'}}
            onMouseDown={this.onMouseDown}
            onTouchStart={this.onTouchStart}
        >

            {boxes && boxes.map((box, iBox) => (
                <Rnd
                    key={iBox}
                    ref={'box' + iBox}
                    initial={{
                        x: box.x * scale,
                        y: box.y * scale,
                        width: box.w * scale,
                        height: box.h * scale,
                    }}
                    minWidth={20}
                    minHeight={20}
                    maxWidth={width}
                    maxHeight={height}
                    bounds={'parent'}
                    onResizeStart={this.onResizeStart}
                    onResizeStop={this.onResizeStop.bind(null, iBox)}
                    onDragStop={this.onDragStop.bind(null, iBox)}
                    onClick={this.onBoxClick.bind(null, iBox)}
                >
                    <div className={cn("image-overlay__box", {_active: selectedBox == iBox})} />
                </Rnd>
            ))}

            <div ref="creationBox" className="image-overlay__box _hidden">
            </div>

        </div>;
    }
}