module.exports = {
  /**
   * Reusable function to remove all <> tags including the contents inside
   * @param {string} input String input from client
   * @returns {string} String after the removal of all tags
   */
  escapeHTML: (input) => {
    return input.replace(new RegExp("<.+?>", "g"), "");
  },
  /**
   * Searches for the existence of HTML tags in string
   * @param {string} input String input from the client
   * @returns {boolean} Whether the string contained HTML tags
   */
  containsHTML: (input) => {
    return input.match(new RegExp("<.+?>", "g"));
  },
  /**
   * Escapes special characters in strings before use in SQL statements
   * @param {string} input String input from the client
   * @returns {string} String with special characters escaped
   */
  escapeSQL: (input) => {
    return input.replaceAll("'", "\\'");
  },
  unescapeSQL: (input) => {
    return input.replaceAll("\\'", "'");
  },
  /**
   * Removes parameters from GET string
   * @param {string} input String input from the client
   * @returns {string} String after removing paramters
   */
  removeParams: (input) => {
    let output;
    if (input.includes('&')) {
      output = input.substring(0,input.indexOf('&'));
    }
    else {
      output = input;
    }
    return output;
  }
};
