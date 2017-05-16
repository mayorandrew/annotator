import React from 'react';
import autobind from 'react-autobind';
import StoreConnector from '../stores/StoreConnector';
import { imageStore, locationStore } from '../stores/stores';

import './LoginScreen.scss';

class LoginScreen extends React.Component {
    constructor() {
        super();
        autobind(this);
    }
    onSubmit(e) {
        e.preventDefault();

        const data = {
            id: this.refs.id.value.trim(),
            folder: this.refs.folder.value
        };

        if (!data.id) {
            alert('Пожалуйста, введите идентификатор');
            return;
        }

        if (!data.folder) {
            alert('Пожалуйста, выберите папку');
            return;
        }

        imageStore.select(data);
    }
    render() {
        const { folders } = this.props.image;

        return <div className="login-screen">
            <div className="login-screen__box">
                <form className="login-screen__form form" onSubmit={this.onSubmit}>
                    <div className="form__row">
                        <div className="form__label">
                            Введите ваш идентификатор
                        </div>
                        <div className="form__field">
                            <input ref="id" name="id" type="text" />
                        </div>
                    </div>
                    <div className="form__row">
                        <div className="form__label">
                            Выберите папку
                        </div>
                        <div className="form__field">
                            <select ref="folder" name="folder">
                                {folders && folders.map((set) => (
                                    <option key={set} value={set}>{set}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form__submit">
                        <button className="form__submit-button">Выбрать</button>
                    </div>
                </form>
            </div>
        </div>;
    }
}

export default StoreConnector(LoginScreen, {
    image: imageStore
}, {});
