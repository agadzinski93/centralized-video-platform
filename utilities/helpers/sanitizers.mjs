/**
 * Reusable function to remove all <> tags including the contents inside
 * @param {string} input String input from client
 * @returns {string} String after the removal of all tags
 */
const escapeHTML =  (input) => {
  return input.replace(new RegExp("<.+?>", "g"), "");
}
/**
 * Searches for the existence of HTML tags in string
 * @param {string} input String input from the client
 * @returns {boolean} Whether the string contained HTML tags
 */
const containsHTML = (input) => {
  return input.match(new RegExp("<.+?>", "g"));
}
/**
 * Escapes special characters in strings before use in SQL statements
 * @param {string} input String input from the client
 * @returns {string} String with special characters escaped
 */
const escapeSQL = (input) => {
  return input.replaceAll("'", "\\'");
}
const unescapeSQL = (input) => {
  return input.replaceAll("\\'", "'");
}
/**
 * Removes parameters from GET string
 * @param {string} input String input from the client
 * @returns {string} String after removing paramters
 */
const removeParams = (input) => {
  let output;
  if (input.includes('&')) {
    output = input.substring(0,input.indexOf('&'));
  }
  else {
    output = input;
  }
  return output;
}

export {
  escapeHTML,
  containsHTML,
  escapeSQL,
  unescapeSQL,
  removeParams
};