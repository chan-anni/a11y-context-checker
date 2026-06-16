// Rules tool kit, allows for plugging in and removing any tools/tool scripts

import wcag244 from './wcag_244.js';
import wcag314 from './wcag314.js';
import wcag131 from './wcag131.js';

export const rules = [
  wcag244,
  wcag314,
  wcag131
];