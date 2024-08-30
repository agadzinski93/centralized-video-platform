//Globals Required:UserId, AUTHOR_USERNAME, API_PATH
const addSubscribeEvents = () => {
    const btnSubscribe = document.getElementById('btnSubscribe');
    const btnUnsubscribe = document.getElementById('btnUnsubscribe');
    btnSubscribe.addEventListener('click',async()=>{
        btnSubscribe.disabled = true;
        toggleBackgroundLoading(true,btnSubscribe,true);
        let result = await fetch(`${API_PATH}/subscribe/${AUTHOR_USERNAME}`,{
            method:'POST'
        });
        let data = await result.json();
        toggleBackgroundLoading(false,btnSubscribe,false,'Subscribe');
        if (data.response === 'success') {
            btnSubscribe.classList.add('displayNone');
            btnUnsubscribe.classList.remove('displayNone');
            flashBanner(data.response,data.message,FLASH_REFERENCE);
        } else {
            flashBanner(data.response,data.message,FLASH_REFERENCE);
        }
        btnSubscribe.disabled = false;
    });
    btnUnsubscribe.addEventListener('click',async()=>{
        btnUnsubscribe.disabled = true;
        toggleBackgroundLoading(true,btnUnsubscribe,true);
        let result = await fetch(`${API_PATH}/subscribe/${AUTHOR_USERNAME}`,{
            method:'DELETE'
        });
        let data = await result.json();
        toggleBackgroundLoading(false,btnUnsubscribe,false,'Unsubscribe');
        if (data.response === 'success') {
            btnUnsubscribe.classList.add('displayNone');
            btnSubscribe.classList.remove('displayNone');
        } else {
            flashBanner(data.response,data.message,FLASH_REFERENCE);
        }
        btnUnsubscribe.disabled = false;
    });
}
const addDescriptionClickEvent = () => {
    const description = document.getElementById('mainVideoDescription');
    const toggleDescription = (e) => {
        if (e.type === 'click' || (e.type === 'keypress' && e.key === 'Enter')) {
            description.classList.toggle('hidden');
            description.classList.toggle('overflowHidden');
            description.classList.toggle('heightInitial');
        }
    }
    if (description) {
        document.getElementById('mainVideoDescription').addEventListener('click',toggleDescription);
        document.querySelector('.mainVideoDescriptionContainer').addEventListener('keypress',toggleDescription);
    }
}
/**
 * Converts text link into functional anchor tag
 * @param {string} link text 
 * @returns string with input wrapped in anchor tag
 */
const convertToLink = (input) => {
    let output = `<a href="${input}" target="_blank">${input}</a>`;
    return output;
}
/**
 * Returns index of the earliest occurence of the provided strings in set
 * @param {string} text - text to scan
 * @param {string[]} set - array of characters to check for index
 * @param {boolean} toEnd - if set to true, returns length if nothing in set is found
 * @returns index of the earliest position of a character in set, -1 or toEnd otherwise
 */
const indexOfSet = (text,set,toEnd=false) => {
    let output = -1;
    let found = false;
    if (text && set) {
        let pos = new Array(set.length);
        for (let i=0;i<set.length;i++) {
            pos[i] = text.indexOf(set[i]);
            if (pos[i]>=0&&(pos[i]<output||output===-1)) {
                output = pos[i];
                found = true;
            }
        }
        if (!found&&toEnd){
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
const scanForLinks = (text) => {
    const http = 'http';
    if (text.length > http.length) {
        let prelink,
            link;
        for (let i=0;i<text.length-7;i++) {
            if (text[i]==='h'&&text[i+1]==='t'&&text[i+2]==='t'&&text[i+3]==='p') {
                if (text[i+4]===':'&&text[i+5]==='/'&&text[i+6]==='/') {
                    prelink = text.substring(i,i+indexOfSet(text.substring(i),[' ','\n'],true));
                    link = convertToLink(prelink);
                    text = text.replaceFromIndex(prelink,link,i);
                    i += link.length - prelink.length;
                }
                else if (text[i+4]==='s'&&text[i+5]===':'&&text[i+6]==='/'&&text[i+7]==='/') {
                    prelink = text.substring(i,i+indexOfSet(text.substring(i),[' ','\n'],true))
                    link = convertToLink(prelink);
                    text = text.replaceFromIndex(prelink,link,i);
                    i += link.length - prelink.length;
                }
                
            }
        }
    }
    return text;
}
/**
 * 
 * @param {object} element - element with text to transform into links
 */
const addLinksToText = (element) => {
    if (element) {
        const newText = scanForLinks(element.textContent);
        element.innerHTML = newText;
    }
}
const init = () => {
    let selectedVideo = document.getElementById('selectedVideo');
    selectedVideo.parentNode.parentNode.scrollTop = selectedVideo.offsetTop - selectedVideo.parentNode.parentNode.offsetTop;
    addSubscribeEvents();
    addDescriptionClickEvent();
    addLinksToText(document.getElementById('mainVideoDescription'));
  }
  init();