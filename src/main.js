import { getScrollProgress } from './scroll.js';
import { initNav, initReveals } from './ui.js';
import { initTech } from './tech.js';

document.documentElement.classList.add('js');

initNav();
initReveals();
initTech({ getScrollProgress });
