declare global {
  interface String {
    replaceFromIndex(search: string, replace: string, from: number): string
  }
}

/**
 * Replace first occurence of string with new string after specified index
 * @param {string} search 
 * @param {string} replace 
 * @param {int} from 
 * @returns 
 */
String.prototype.replaceFromIndex = function (search: string, replace: string, from: number): string {
  if (this.length > from) {
    return this.slice(0, from) + this.slice(from).replace(search, replace);
  }
  return this as string;
}

const getUploadedWhen = (arg: string): string => {
  const currentTimeStamp = new Date().getTime();
  const uploadedTimeStamp = new Date(Date.parse(arg)).getTime();

  let output = "";
  let num = 0;

  const timeDifference = Math.floor(
    (currentTimeStamp - uploadedTimeStamp) / (1000 * 60 * 60 * 24)
  );

  if (timeDifference <= 6) {
    if (timeDifference === 0) {
      output = "Added today";
    } else if (timeDifference === 1) {
      output = "Added 1 day ago";
    } else {
      output = `Added ${timeDifference} days ago`;
    }
  } else if (timeDifference <= 30) {
    num = Math.floor(timeDifference / 7);
    if (num === 1) {
      output = "Added 1 week ago";
    } else {
      output = `Added ${num} weeks ago`;
    }
  } else if (timeDifference <= 365) {
    num = Math.floor(timeDifference / 30);
    if (num === 1) {
      output = "Added 1 month ago";
    } else {
      output = `Added ${num} months ago`;
    }
  } else {
    num = Math.floor(timeDifference / 365);
    if (num === 1) {
      output = "Added 1 year ago";
    } else {
      output = `Added ${num} years ago`;
    }
  }

  return output;
};

/**
 * Converts text link into functional anchor tag
 * @param {string} link text 
 * @returns string with input wrapped in anchor tag
 */
const convertToLink = (input: string) => {
  const output = `<a href="${input}" target="_blank">${input}</a>`;
  return output;
}
/**
* Returns index of the earliest occurence of the provided strings in set
* @param {string} text - text to scan
* @param {string[]} set - array of characters to check for index
* @param {boolean} toEnd - if set to true, returns length if nothing in set is found
* @returns index of the earliest position of a character in set, -1 or toEnd otherwise
*/
const indexOfSet = (text: string, set: string[], toEnd = false): number => {
  let output = -1;
  let found = false;
  if (text && set) {
    const pos = new Array(set.length);
    for (let i = 0; i < set.length; i++) {
      pos[i] = text.indexOf(set[i]);
      if (pos[i] >= 0 && (pos[i] < output || output === -1)) {
        output = pos[i];
        found = true;
      }
    }
    if (!found && toEnd) {
      output = text.length;
    }
  }
  return output;
}
/**
* Adds links to innerHTML text
* @param {string} text - text from innerHTML
* @return - new text with working links
*/
const scanForLinks = (text: string) => {
  const http = 'http';
  if (text.length > http.length) {
    let prelink,
      link;
    for (let i = 0; i < text.length - 7; i++) {
      if (text[i] === 'h' && text[i + 1] === 't' && text[i + 2] === 't' && text[i + 3] === 'p') {
        if (text[i + 4] === ':' && text[i + 5] === '/' && text[i + 6] === '/') {
          prelink = text.substring(i, i + indexOfSet(text.substring(i), [' ', '\n'], true));
          link = convertToLink(prelink);
          text = text.replaceFromIndex(prelink, link, i);
          i += link.length - prelink.length;
        }
        else if (text[i + 4] === 's' && text[i + 5] === ':' && text[i + 6] === '/' && text[i + 7] === '/') {
          prelink = text.substring(i, i + indexOfSet(text.substring(i), [' ', '\n'], true))
          link = convertToLink(prelink);
          text = text.replaceFromIndex(prelink, link, i);
          i += link.length - prelink.length;
        }

      }
    }
  }
  return text;
}

export { getUploadedWhen, scanForLinks };