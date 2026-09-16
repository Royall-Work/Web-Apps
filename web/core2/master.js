import {attachHeader} from './header.js';
import './toast.js';

const RoyallUI={};
attachHeader(RoyallUI);
RoyallUI.toast=window.RoyallToast;

window.RoyallUI=RoyallUI;
export {RoyallUI};
