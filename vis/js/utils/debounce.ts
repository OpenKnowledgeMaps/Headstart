// @ts-nocheck
/**
 * Debounce any function
 *
 * Copied from helpers.js
 */
export default function debounce(func, wait, immediate?) {
  var timeout;
  return function () {
    let context = this,
      args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
