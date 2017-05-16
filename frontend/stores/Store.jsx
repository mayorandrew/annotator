import EventEmitter from 'wolfy87-eventemitter';

export default class Store extends EventEmitter {
    state = {};
    initialized = false;

    setState(stateUpdate) {
        this.state = Object.assign({}, this.state);

        for (let key in stateUpdate) {
            if (stateUpdate.hasOwnProperty(key)) {
                this.state[key] = stateUpdate[key];
            }
        }

        this.triggerEvents();
    }

    triggerEvents() {
        this.trigger('update', [this.state]);
    }

    triggerAll() {
        this.setState(this.state);
        this.initialized = true;
    }
}
