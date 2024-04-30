/**
 * Reusable function to remove all <> tags including the contents inside
 * @param {string} input String input from client
 * @returns {string | null} String after the removal of all tags
 */
const escapeHTML = (input: string): string => {
  let output;
  try {
    output = input.replace(/<|>/g, "");
  } catch (err) {
    output = '';
  }
  return output;
}
/**
 * Searches for the existence of HTML tags in string
 * @param {string} input String input from the client
 * @returns {boolean} Whether the string contained HTML tags
 */
const containsHTML = (input: string): RegExpMatchArray | null => {
  return input.match(/<|>/g);
}
/**
 * Escapes special characters in strings before use in SQL statements
 * @param {string} input String input from the client
 * @returns {string} String with special characters escaped
 */
const escapeSQL = (input: string): string => {
  return input.replaceAll("'", "\\'");
}
const unescapeSQL = (input: string): string => {
  return input.replaceAll("\\'", "'");
}
/**
 * Removes parameters from GET string
 * @param {string} input String input from the client
 * @returns {string} String after removing paramters
 */
const removeParams = (input: string): string => {
  let output;
  if (input.includes('&')) {
    output = input.substring(0, input.indexOf('&'));
  }
  else {
    output = input;
  }
  return output;
}

/**
 * Pass the query along with characters like !,%,_, and [] used in SQL LIKE stataement
 * @param {string} q - Query string meant to be used with the SQL LIKE operator
 * @returns {string} - Returns a proper query string to be used in a prepared statement
 */
const prepareLikeStatement = (q: string): string => {
  return q
    .replace('!', '!!')
    .replace('%', '!%')
    .replace('_', '!_')
    .replace('[', '![');
}

export {
  escapeHTML,
  containsHTML,
  escapeSQL,
  unescapeSQL,
  removeParams,
  prepareLikeStatement
};