import React from 'react';
import autobind from 'react-autobind';

export default function StoreConnector(Component, stores, actions = {}) {
    class Connector extends React.Component {
        state = { allInitialized: false, initialized: {}, stores: {} };
        stateUpdate = {};
        timeoutId = null;
        listeners = {};

        constructor(props) {
            super(props);
            autobind(this);
        }

        componentWillMount() {
            let anyKey = false;
            for (let storeKey in stores) {
                if (!stores.hasOwnProperty(storeKey)) continue;
                anyKey = true;
                let store = stores[storeKey];

                let listener = this.onStoreUpdate.bind(null, storeKey);
                this.listeners[storeKey] = listener;
                store.on('update', listener);

                if (store.initialized) {
                    this.onStoreUpdate(storeKey, store.state);
                }
            }

            if (!anyKey) {
                this.setState({ allInitialized: true });
            }
        }

        componentWillUnmount() {
            for (let storeKey in stores) {
                if (!stores.hasOwnProperty(storeKey)) continue;
                let store = stores[storeKey];
                store.off('update', this.listeners[storeKey]);
            }
            this.listeners = [];
        }

        onStoreUpdate(storeKey, value) {
            this.newStores = Object.assign({}, this.state.stores, this.newStores);
            this.newStores[storeKey] = value;

            let newInitialized = this.state.initialized;
            newInitialized[storeKey] = true;
            let allInitialized = true;

            for (let storeKey in stores) {
                if (!stores.hasOwnProperty(storeKey)) continue;
                if (!newInitialized[storeKey]) {
                    allInitialized = false;
                }
            }

            this.setState({
                allInitialized,
                initialized: newInitialized,
                stores: this.newStores
            }, () => {
                this.newStores = {};
            });
        }

        render() {
            if (!this.state.allInitialized) return false;
            let {children, ...props} = this.props;

            return <Component {...props} {...this.state.stores} {...actions}>
                {children}
            </Component>;
        }
    }

    return Connector;
}
