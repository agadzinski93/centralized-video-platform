/**
 * 
 * @param {string} type - string of either success or error
 * @param {string} text - text displayed by banner
 * @param {object} reference - HTML Element used to determine location of banner
 */
const flashBanner = (type = 'success', text = '', reference) => {
    let flash;
    let newFlash;
    let referenceNode = reference;
    switch(type) {
    case 'success':
    case 'Success':
        flash = document.querySelector('.flashSuccess');
        if (flash !== null) {
        flash.remove();
        }
        newFlash = document.createElement('div');
        newFlash.textContent = text;
        newFlash.classList.add('flashSuccess');
        referenceNode.parentNode.insertBefore(newFlash, referenceNode);
        break;
    case 'error':
    case 'Error':
        flash = document.querySelector('.flashError');
        if (flash !== null) {
        flash.remove();
        }
        newFlash = document.createElement('div');
        newFlash.textContent = text;
        newFlash.classList.add('flashError');
        referenceNode.parentNode.insertBefore(newFlash, referenceNode);
        break;
    default:
    }
};
/**
 * 
 * @param {boolean} enable - enable/disable backdrop or 'toggle'
 * @param {string} bgColor - background color of backdrop using acceptable CSS units
 * @param {string} opacity - opacity of backdrop using acceptable CSS units
 */
const toggleBackdrop = (enable = false, bgColor = "#000", opacity = '50%') => {
    let backdrop = document.querySelector('.backdrop');
    switch(enable) {
        case true:
            backdrop.classList.remove('displayNone');
            document.querySelector('body').classList.add('overflowHidden');
            break;
        case false:
            backdrop.classList.add('displayNone');
            document.querySelector('body').classList.remove('overflowHidden');
            break;
        case 'toggle':
            backdrop.classList.toggle('displayNone');
            document.querySelector('body').classList.toggle('overflowHidden');
        default:
    }
    backdrop.style.backgroundColor = bgColor;
    backdrop.opacity = opacity;
};
/**
 * 
 * @param {string} text - text displayed by modal
 */
const setModalText = (text = '') => {
    document.getElementById('modalText').textContent = text;
};
/**
 * 
 * @param {boolean} enable - enable/disable modal
 * @param {string} text - text displayed by modal
 */
const toggleModal = (enable = false, text = '') => {
    let modal = document.querySelector('.modal');
    if (enable) {
        modal.classList.remove('displayNone');
        setModalText(text);
    }
    else {
        modal.classList.add('displayNone');
        setModalText();
    }
};
/**
 * 
 * @param {boolean} enable - Enable/Disable spinner background
 * @param {object} element - Element that will host the spinner icon
 * @param {boolean} removeTxtContent - Upon enabling spinner, remove text content
 * @param {string} txtContent - Upon disabling spinner, optional text to give back to element
 * @param {string} height - Optional height for element with corresponding unit
 * @param {string} width - Optional width for element with corresponding unit
 */
const toggleBackgroundLoading = (enable = false, element, removeTxtContent = false, txtContent = null, height = null, width = null) => {
    if (enable) {
        if (height) {
            element.style.height = height;
        }
        if (width) {
            element.style.width = width;
        }
        if (removeTxtContent) {
            element.textContent = "";
        }
        element.classList.add('backgroundLoading');
    }
    else {
        if (txtContent) {
            element.textContent = txtContent;
        }
        element.style.height = null;
        element.style.width = null;
        element.classList.remove('backgroundLoading');
    }
}
/**
 * 
 * @param {string} input - date as formatted by DATE or DATETIME in SQL
 * @returns E.g. January 5, 2022 or 'invalid' if wrong input
 */
const convertSQLDate = (input) => {
    let output = '';
    if (input.length >= 10) {
        switch(input.substring(5,7)) {
            case "01":
                output += 'January ';
                break;
            case "02":
                output += 'February ';
                break;
            case "03":
                output += 'March ';
                break;
            case "04":
                output += 'April ';
                break;
            case "05":
                output += 'May ';
                break;
            case "06":
                output += 'June ';
                break;
            case "07":
                output += 'July ';
                break;
            case "08":
                output += 'August ';
                break;
            case "09":
                output += 'September ';
                break;
            case "10":
                output += 'October ';
                break;
            case "11":
                output += 'November ';
                break;
            case "12":
                output += 'December ';
                break;
            default:
        }
        output += (input.charAt(8) === '0') ? `${input.charAt(9)}, ` : `${input.substring(8,10)}, `;
        output += input.substring(0,4);
    }
    else {
        output = 'invalid';
    }
    return output;
}
/**
 * Replace first occurence of string with new string after specified index
 * @param {string} search 
 * @param {string} replace 
 * @param {int} from 
 * @returns 
 */
String.prototype.replaceFromIndex = function(search, replace, from) {
    if (this.length > from) {
      return this.slice(0, from) + this.slice(from).replace(search, replace);
    }
    return this;
}

document.createElementTree = function(element,classes = [],attributes = null, children = null, text = null){
    const el = document.createElement(element);
    if (Array.isArray(classes)) {
        for (let i = 0; i < classes.length; i++) {
            el.classList.add(classes[i]);
        }
    }
    if (attributes && typeof attributes === 'object') {
        for (const [k,v] of Object.entries(attributes)) {
            el.setAttribute(`${k}`,`${v}`);
        }
    }
    if (text) {
        el.innerHTML = text;
    }
    if (Array.isArray(children) && children.length > 0) {
        for (let i = 0; i < children.length; i++) {
            el.append(document.createElementTree(...children[i]));
        }
    }
    return el;
};