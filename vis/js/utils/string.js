/**
 * Since helpers.js is basically untestable (it requires some libraries from lib/),
 * I set up this utils folder and this file.
 */

/**
 * Sets first letter of the string to uppercase.
 * @param {String} s string to be capitalized
 */
export const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
