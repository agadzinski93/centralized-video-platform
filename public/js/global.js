const flashBanner = (type = 'success', text = '', reference) => {
    let flash;
    let newFlash;
    let referenceNode = reference;
    switch(type) {
    case 'success':
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
const toggleBackdrop = (enable = false, bgColor = "#000", opacity = '50%') => {
    let backdrop = document.querySelector('.backdrop');
    if (enable) {
        backdrop.classList.remove('displayNone');
        document.querySelector('body').classList.add('overflowHidden');
    }
    else {
        backdrop.classList.add('displayNone');
        document.querySelector('body').classList.remove('overflowHidden');
    }
    backdrop.style.backgroundColor = bgColor;
    backdrop.opacity = opacity;
};
const setModalText = (text = '') => {
    document.getElementById('modalText').textContent = text;
};
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
}