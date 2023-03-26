let seeMore; //Global variable for controlling click event for 'See More' button
const appendTopics = (topics) => {
    const container = document.getElementById('userContent');
        for (let i = 0; i < topics.length;i++) {
            const topic = createVideo(`/lib/${topics[i].name}`,topics[i].imageUrl,topics[i].name);
            container.append(topic);
        }
}
const appendVideos = (videos) => {
    const container = document.getElementById('userContent');
        for (let i = 0; i < videos.length;i++) {
            let urlIndex = 0;
            if (videos[i].url.includes('youtube.com')) {
                urlIndex = 20;
            }
            const video = createVideo(`/lib/${videos[i].topic}/${videos[i].url.substring(urlIndex)}`,videos[i].thumbnail,videos[i].title);
            container.append(video);
        }
}
/**
 * 
 * @param {string} choice - select from 'topics' or 'videos'
 * @param {int} page - page number 
 */
const getMoreResults = async (choice,page) => {
    let output = null;
 try{
    let result = await fetch(`/user/${AUTHOR}/getUserContent?content=${choice}&viewAll=true&page=${page}`);
    let data = await result.json();
    switch(choice){
        case 'topics':
            appendTopics(data.data);
            break;
        case 'videos':
            appendVideos(data.data);
            break;
        default:
    }
    output = {response:'success',moreResults:data.moreResults}; 
 } catch(err) {
    output = {response:'error',message:'Problem retrieving results.'}
 }
 //console.log(output);
 if (output.response === 'success') {
    let btnSeeMore = document.getElementById('btnSeeMore');
    if (seeMore) {
        btnSeeMore.removeEventListener("click",seeMore);
    }
    if (output.moreResults) {
        seeMore = getMoreResults.bind(null,choice,page+1);
        btnSeeMore.addEventListener("click",seeMore);
    }
    else {
        document.querySelector('.moreResultsContainer').classList.add('displayNone');
    }
 } else {
    flashBanner('error',output.message,FLASH_REFERENCE);
 }
}
const toggleViewAllButton = (enable = false) => {
    if (enable) {
        document.getElementById('btnViewAll').classList.remove('displayNone');
    }
    else {
        document.getElementById('btnViewAll').classList.add('displayNone');
    }
}
const btnViewAll = async () => {
    let selected = document.querySelector('.contentSelected');
    switch(selected.getAttribute('id').substring(6)) {
        case 'Topics':
            await getAuthorTopics(null,true);
            break;
        case 'Videos':
            await getAuthorVideos(null,true);
            break;
        default:
    }
}
const createTopic = (link,thumbnail,title) => {
    //EDIT
    let topicLink = document.createElement('a');
    topicLink.classList.add('displayBlock', 'contentLink');
    topicLink.setAttribute('href',link);
    let topicContainer = document.createElement('div');
    topicContainer.classList.add('videoContainer');
    let topicThumbnail = document.createElement('div');
    topicThumbnail.classList.add('thumbnail');
    topicThumbnail.style.backgroundImage = `url('${thumbnail}')`;
    topicContainer.append(topicThumbnail);
    let topicTitle = document.createElement('p');
    topicTitle.classList.add('title');
    topicTitle.textContent = title;
    topicContainer.append(topicTitle);
    topicLink.append(topicContainer);
    return topicLink;
}
const createVideo = (link,thumbnail,title) => {
    let videoLink = document.createElement('a');
    videoLink.classList.add('displayBlock', 'contentLink');
    videoLink.setAttribute('href',link);
    let videoContainer = document.createElement('div');
    videoContainer.classList.add('videoContainer');
    let videoThumbnail = document.createElement('div');
    videoThumbnail.classList.add('thumbnail');
    videoThumbnail.style.backgroundImage = `url('${thumbnail}')`;
    videoContainer.append(videoThumbnail);
    let videoTitle = document.createElement('p');
    videoTitle.classList.add('title');
    videoTitle.textContent = title;
    videoContainer.append(videoTitle);
    videoLink.append(videoContainer);
    return videoLink;
}
/**
 * Prints alternative data if author has no videos or topics
 * @param {string} text - text to display
 */
const txtNoContent = (text) => {
    const element = document.createElement('span');
    element.classList.add('noContent');
    element.textContent = text;
    document.getElementById('userContent').append(element);
}
/**
 * Underline a button signifying selection
 * @param {string} id - id of button to give underline
 */
const replaceContentUnderline = (id) => {
    document.querySelector('.contentSelected').classList.remove('contentSelected');
    document.getElementById(id).classList.add('contentSelected');
}
const deleteUserContent = () => {
    document.getElementById('userContent').replaceChildren();
}
/**
 * 
 * @param {event} e - event object if called via event handler, pass null otherwise
 * @param {boolean} viewAll - enable or disable
 */
const getAuthorTopics = async (e, viewAll = false) => {
    replaceContentUnderline('btnGetTopics');
    deleteUserContent();
    let result = await fetch(`/user/${AUTHOR}/getUserContent`,{
        method:'GET'
    });
    let data = await result.json();
    if (data.response === 'success') {
        if (data.data.length > 0) {
            const topics = data.data;
            appendTopics(topics);
            if (data.data.length === 12) {
                toggleViewAllButton(true);
            }
            else {
                toggleViewAllButton();
            }
        }
        else {
            txtNoContent(`${AUTHOR} has no topics`);
        }
    } 
    else {
        flashBanner('error', `${data.message}`, FLASH_REFERENCE);
    }
}
/**
 * 
 * @param {event} e - event object if called via event handler, pass null otherwise
 * @param {boolean} viewAll - enable or disable
 */
const getAuthorVideos = async (e, viewAll = false) => {
    replaceContentUnderline('btnGetVideos');
    deleteUserContent();
    let result = null;
    if (viewAll) {
        result = await fetch(`/user/${AUTHOR}/getUserContent?content=videos&viewAll=true`,{
            method:'GET'
        });
    }
    else {
        result = await fetch(`/user/${AUTHOR}/getUserContent?content=videos`,{
            method:'GET'
        });
    }
    let data = await result.json();
    if (data.response === 'success') {
        if (data.data.length > 0) {
            const videos = data.data;
            appendVideos(videos);
            if (data.data.length === 12) {
                toggleViewAllButton(true);
            }
            else {
                toggleViewAllButton();
            }
            let btnSeeMore = document.getElementById('btnSeeMore');
            if (data.moreResults){
                if (seeMore) {
                    btnSeeMore.removeEventListener("click",seeMore);
                }
                seeMore = getMoreResults.bind(null,'videos',2);
                btnSeeMore.addEventListener("click",seeMore);
                document.querySelector('.moreResultsContainer').classList.remove('displayNone');
            }
            else {
                if (seeMore) {
                    btnSeeMore.removeEventListener("click",seeMore);
                }
                document.querySelector('.moreResultsContainer').classList.add('displayNone');
            }
        }
        else {
            txtNoContent(`${AUTHOR} has no videos`);
        }
    } 
    else {
        flashBanner('error', `${data.message}`, FLASH_REFERENCE);
    }
}
const getAuthorAbout = async () => {
    replaceContentUnderline('btnGetAbout');
    deleteUserContent();
    toggleViewAllButton();
}
const addGetContentEvents = () => {
    document.getElementById('btnGetTopics').addEventListener("click",getAuthorTopics);
    document.getElementById('btnGetVideos').addEventListener("click",getAuthorVideos);
    document.getElementById('btnGetAbout').addEventListener("click",getAuthorAbout);
    document.getElementById('btnViewAll').addEventListener("click",btnViewAll);
}
(function init(){
    addGetContentEvents();
    getAuthorTopics();
})();