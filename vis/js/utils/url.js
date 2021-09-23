/**
 * Adds a parameter into the URL query (without redirect).
 * @param {string} key parameter name
 * @param {string} value parameter value
 */
export const addQueryParam = (key, value) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);

  window.history.pushState("", "", url.pathname + url.search);
};

/**
 * Removes a parameter from the URL query (without redirect).
 * @param {string} key parameter name
 */
export const removeQueryParam = (key) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);

  window.history.pushState("", "", url.pathname + url.search);
};
