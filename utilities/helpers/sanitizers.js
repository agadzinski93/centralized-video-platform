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
};
