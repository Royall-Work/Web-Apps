import {attachHeader} from './js/header.js';
import {attachChips} from './js/chips.js';
import {attachInputs} from './js/inputs.js';
import {attachResults} from './js/results.js';
import {attachDialogs} from './js/dialogs.js';
import {attachFeedback} from './js/feedback.js';
import {attachActions} from './js/actions.js';
import {attachScreens} from './js/screens.js';

const RoyallUI={};
attachHeader(RoyallUI);
attachChips(RoyallUI);
attachInputs(RoyallUI);
attachResults(RoyallUI);
attachDialogs(RoyallUI);
attachFeedback(RoyallUI);
attachActions(RoyallUI);
attachScreens(RoyallUI);

window.RoyallUI=RoyallUI;
export {RoyallUI};
