//Globals Required:searchQuery and API_PATH
const appendNewResults = (videos,pageNumber) => {
    let list = document.getElementById('searchListContainer');
    let newVidLink,
        newVid,
        thumbnail,
        vidInfo,
        pTag,
        divAvatarUsername,
        avatar,
        username;
    for (let i = 0; i < videos.length; i++) {
        //Create New Link Block Element
        newVidLink = document.createElement('a');
        newVidLink.setAttribute('id', 'result' + (pageNumber * 20 + i + 1));
        newVidLink.setAttribute('href', `${API_PATH}/lib/${videos[0].topicUrl}/${videos[i].url.substring(20)}`);

        //Create DIV For Vid Link
        newVid = document.createElement('div');
        newVid.classList.add('searchResultVideo');

        //Create Thumbnail
        thumbnail = document.createElement('div');
        thumbnail.classList.add('videoThumbnail');
        thumbnail.style.backgroundImage = 'url(' + videos[i].thumbnail + ')';
        newVid.append(thumbnail);

        //Create Video Info Block
        vidInfo = document.createElement('div');
        vidInfo.classList.add('videoInfo');

        //Title
        pTag = document.createElement('p');
        if (videos[i].title.length > 80) {
            pTag.textContent = videos[i].title.substring(0,80) + '...';
        }
        else {
            pTag.textContent = videos[i].title;
        }
        vidInfo.append(pTag);
        //Avatar and Author
        divAvatarUsername = document.createElement('div');
        divAvatarUsername.classList.add('userAvatarUsername');
        avatar = document.createElement('div');
        avatar.classList.add('videoAvatar');
        avatar.style.backgroundImage = `url('${videos[i].pic_url}')`;
        username = document.createElement('p');
        username.classList.add('username');
        username.textContent = videos[i].username
        divAvatarUsername.append(avatar);
        divAvatarUsername.append(username);
        vidInfo.append(divAvatarUsername);
        //Description
        pTag = document.createElement('p');
        if (videos[i].description.length > 320) {
            pTag.textContent = videos[i].description.substring(0,320) + '...';
        }
        else {
            pTag.textContent = videos[i].description;
        }
        vidInfo.append(pTag);

        newVid.append(vidInfo);
        newVidLink.append(newVid);
        list.append(newVidLink);
    }
}
const addPullMoreResultsEvent = () => {
    let lastResult = document.getElementById('result20');
    let pageNumber = 1;
    let wait = false;
    const resultsPerPage = 20;
    if (lastResult !== undefined) {
        document.addEventListener('scroll', async () => {
            if (lastResult !== undefined && lastResult !== null && !wait) {
                wait = true;
                if (window.innerHeight - lastResult.getBoundingClientRect().top > 0) {
                    let videos = await fetch(`${API_PATH}/search`, {
                        method:'POST',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({
                            searchQuery,
                            pageNumber
                        })
                    });
                    const data = await videos.json();
                    appendNewResults(data.data, pageNumber);
                    pageNumber++;
                    lastResult = document.getElementById(`result${pageNumber*resultsPerPage}`);
                }
                wait = false;
            }
    });
    }
}
const init = () => {
    addPullMoreResultsEvent();
}
init();