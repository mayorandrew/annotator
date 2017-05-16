import LocationStore from './LocationStore';
import ImageStore from './ImageStore';
import BoxStore from './BoxStore';
import CategoriesStore from './CategoriesStore';
import { browserHistory } from 'react-router';

export const locationStore = new LocationStore(browserHistory);
export const imageStore = new ImageStore(locationStore);
export const boxStore = new BoxStore(imageStore);
export const categoriesStore = new CategoriesStore();

export const list = [
    locationStore,
    imageStore,
    boxStore,
    categoriesStore
];

export const all = {
    locationStore,
    imageStore,
    boxStore,
    categoriesStore
};

window.locationStore = locationStore;
window.imageStore = imageStore;
window.boxStore = boxStore;
window.categoriesStore = categoriesStore;

list.forEach((store) => store.triggerAll());
