let seeMore; //Global variable for controlling click event for 'See More' button
const appendTopics = (topics) => {
    const container = document.getElementById('userContent');
        for (let i = 0; i < topics.length;i++) {
            const topic = createTopic(`/lib/${topics[i].topicUrl}`,topics[i].imageUrl,topics[i].name);
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
            const video = createVideo(`/lib/${videos[i].topicUrl}/${videos[i].url.substring(urlIndex)}`,videos[i].thumbnail,videos[i].title);
            container.append(video);
        }
}
const appendAboutMe = (subscriptions,dateJoined,aboutMe) => {
    let infoContainer = document.createElement('div');
    infoContainer.classList.add('infoContainer');
    let lblSubscriptions = document.createElement('p');
    lblSubscriptions.textContent = "Subscriptions: ";
    let p_subscriptions = document.createElement('p');
    p_subscriptions.textContent = subscriptions;

    let lblDateJoined = document.createElement('p');
    lblDateJoined.textContent = "Joined: "
    let p_dateJoined = document.createElement('p');
    p_dateJoined.textContent = convertSQLDate(dateJoined);

    let lblAboutMe = document.createElement('p');
    lblAboutMe.textContent = 'About Me'
    let p_aboutMe = document.createElement('p');
    p_aboutMe.textContent = (aboutMe == '' || aboutMe == null) ? 'Nothing here!' : aboutMe;

    infoContainer.append(lblSubscriptions,p_subscriptions,lblDateJoined,p_dateJoined,lblAboutMe,p_aboutMe);
    document.getElementById('userContent').append(infoContainer);
}
/**
 * @param {string} choice - select from 'topics' or 'videos'
 * @param {int} page - page number 
 */
const getMoreResults = async (choice,page) => {
 try{
    let result = await fetch(`/user/${AUTHOR}/getUserContent?content=${choice}&viewAll=true&page=${page}`);
    let data = await result.json();
    switch(choice){
        case 'topics':
            appendTopics(data.data.data);
            break;
        case 'videos':
            appendVideos(data.data.data);
            break;
        default:
    }
    if (data.response === 'success') {
        let btnSeeMore = document.getElementById('btnSeeMore');
        if (seeMore) {
            btnSeeMore.removeEventListener("click",seeMore);
        }
        if (data.data.moreResults) {
            seeMore = getMoreResults.bind(null,choice,page+1);
            btnSeeMore.addEventListener("click",seeMore);
        }
        else {
            document.querySelector('.moreResultsContainer').classList.add('displayNone');
        }
     } else {
        flashBanner(data.response,data.message,FLASH_REFERENCE);
     }
    data = {response:'success',moreResults:data.data.moreResults}; 
 } catch(err) {
    data = {response:'error',message:'Problem retrieving results.'}
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
            await getAuthorTopics(null,true,true);
            break;
        case 'Videos':
            await getAuthorVideos(null,true,true);
            break;
        default:
    }
}
const createTopic = (link,thumbnail,title) => {
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
 * @param {object} element 
 * @param {boolean} enable 
 * @param {boolean} wrap 
 */
const toggleDisplayFlex = (element,enable = false,wrap = false) => {
    if (enable) {
        if (wrap) {
            element.classList.add('displayFlex','flexWrap');
        }
        else {
            element.classList.add('displayFlex');
        }
    }
    else {
        element.classList.remove('displayFlex','flexWrap');
    }
}
/**
 * Check to prevent refetching info if tab is already selected
 * @param {object} button - button to see if it's already selected (topic,video,about)
 * @returns 
 */
const isAlreadySelected = (button) => {
    let isSelected = false;
    isSelected = (document.querySelector('.contentSelected') === button) ? true : false;
    return isSelected;
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
 * @param {event} e - event object if called via event handler, pass null otherwise
 * @param {boolean} viewAll - enable or disable
 * @param {boolean} ovverride - Run code even if tab is selected, helpful for preloading
 */
const getAuthorTopics = async (e, viewAll = false, override = false) => {
    if (override || !isAlreadySelected(document.getElementById('btnGetTopics'))) {
        replaceContentUnderline('btnGetTopics');
        deleteUserContent();
        toggleViewAllButton();
        toggleBackgroundLoading(true,document.getElementById('userContent'),false,null,'2rem','2rem');
        let result = await fetch(`/user/${AUTHOR}/getUserContent`,{
            method:'GET'
        });
        let data = await result.json();
        toggleBackgroundLoading(false,document.getElementById('userContent'),false,null);
        if (data.response === 'success') {
            if (data.data.data.length > 0) {
                const topics = data.data.data;
                appendTopics(topics);
                if (topics.length === 12 && !viewAll) {
                    toggleViewAllButton(true);
                }
                else {
                    toggleViewAllButton();
                }
                let btnSeeMore = document.getElementById('btnSeeMore');
                if (data.data.moreResults){
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
                toggleDisplayFlex(document.getElementById('userContent'),true,true);
            }
            else {
                toggleDisplayFlex(document.getElementById('userContent'),false);
                txtNoContent(`${AUTHOR} has no topics`);
            }
        } 
        else {
            flashBanner('error', `${data.message}`, FLASH_REFERENCE);
        }
    }
}
/**
 * @param {event} e - event object if called via event handler, pass null otherwise
 * @param {boolean} viewAll - enable or disable
 * @param {boolean} ovverride - Run code even if tab is selected, helpful for preloading
 */
const getAuthorVideos = async (e, viewAll = false, override = false) => {
    if (override || !isAlreadySelected(document.getElementById('btnGetVideos'))) {
        replaceContentUnderline('btnGetVideos');
        deleteUserContent();
        toggleViewAllButton();
        toggleBackgroundLoading(true,document.getElementById('userContent'),false,null,'2rem','2rem');
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
        toggleBackgroundLoading(false,document.getElementById('userContent'),false,null);
        if (data.response === 'success') {
            if (data.data.data.length > 0) {
                const videos = data.data.data;
                appendVideos(videos);
                if (videos.length === 12 && !viewAll) {
                    toggleViewAllButton(true);
                }
                else {
                    toggleViewAllButton();
                }
                let btnSeeMore = document.getElementById('btnSeeMore');
                if (data.data.moreResults){
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
                toggleDisplayFlex(document.getElementById('userContent'),true,true);
            }
            else {
                toggleDisplayFlex(document.getElementById('userContent'),false);
                txtNoContent(`${AUTHOR} has no videos`);
            }
        } 
        else {
            flashBanner('error', `${data.message}`, FLASH_REFERENCE);
        }
    }
}
/**
 * @param {event} e - event object if called via event handler, pass null otherwise
 * @param {boolean} override - Run code even if tab is selected, helpful for preloading
 */
const getAuthorAbout = async (e,override = false) => {
    if (override || !isAlreadySelected(document.getElementById('btnGetAbout'))) {
        replaceContentUnderline('btnGetAbout');
        deleteUserContent();
        toggleViewAllButton();
        toggleBackgroundLoading(true,document.getElementById('userContent'),false,null,'2rem','2rem');
        if (seeMore) {
            document.getElementById('btnSeeMore').removeEventListener('click',seeMore);
            document.querySelector('.moreResultsContainer').classList.add('displayNone');
        }
        let data = null;
        try{
            let result = await fetch(`/user/${AUTHOR}/getUserContent?content=about-me`);
            data = await result.json();
            toggleBackgroundLoading(false,document.getElementById('userContent'),false,null);
            if (data.response === 'success') {
                data = data.data;
                appendAboutMe(data.data.subscriptions,data.data.dateJoined,data.data.about_me);
            }
            else {
                flashBanner('error',data.message,FLASH_REFERENCE);
            }
        } catch(err) {
            flashBanner('error','Failed fetching \'About Me\' section.',FLASH_REFERENCE);
        }
    }
}
const addGetContentEvents = () => {
    document.getElementById('btnGetTopics').addEventListener("click",getAuthorTopics);
    document.getElementById('btnGetVideos').addEventListener("click",getAuthorVideos);
    document.getElementById('btnGetAbout').addEventListener("click",getAuthorAbout);
    document.getElementById('btnViewAll').addEventListener("click",btnViewAll);
}
(function init(){
    addGetContentEvents();
    getAuthorTopics(null,false,true);
})();