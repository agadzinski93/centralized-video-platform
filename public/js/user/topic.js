//Globals Required: Username and Topic Url
const toggleNewTopicForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.newVideoFormContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
  };
  const toggleEditTopicImageForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.editImageFormContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
  }

  const addNewVideoSubmitEvent = () => {
    document.getElementById('newVideoForm').addEventListener('submit', (e) => {
      document.querySelector('.newVideoFormContainer').classList.add('displayNone');
      toggleBackdrop(true, '#fff', '10%');
      toggleModal(true, 'Adding video(s). Please be patient.');
    });
  }
  const addDeleteVideoSubmitEvents = () => {
    let deleteVideoButtons = document.getElementsByClassName('deleteVideoForm');
    for (let i = 0; i < deleteVideoButtons.length; i++) {
      deleteVideoButtons[i].addEventListener('submit', () => {
        toggleBackdrop(true, '#fff', '10%');
        toggleModal(true, 'Deleting video. Please be patient.');
      });
    }
  }
  const addEditEvent = (btn, btnCancelEdit) => {
    const vidId = btn.getAttribute('id').substring(12);
    
    btn.addEventListener('click', () => {
      document.getElementById(`editVideoForm${vidId}`).classList.toggle('displayFlex');
      document.getElementById(`editVideoForm${vidId}`).classList.toggle('displayNone');
      document.getElementById(`displayVideoInfo${vidId}`).classList.toggle('displayNone');
      document.getElementById(`displayVideoInfo${vidId}`).classList.toggle('displayFlex');
    });
    btnCancelEdit.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(`editVideoForm${vidId}`).classList.toggle('displayFlex');
      document.getElementById(`editVideoForm${vidId}`).classList.toggle('displayNone');
      document.getElementById(`displayVideoInfo${vidId}`).classList.toggle('displayNone');
      document.getElementById(`displayVideoInfo${vidId}`).classList.toggle('displayFlex');
    });

    //Add backdrop and modal message when submitting an edit
    let editForms = document.getElementsByClassName('editForm');
    for (let i = 0; i < editForms.length; i++) {
      editForms[i].addEventListener('submit', () => {
        toggleBackdrop(true, '#FFF', '90%');
        toggleModal(true, 'Editing video...');
      });
    }
  };
  /**
   * If either the current video or swap video is highlighted, switch the highlight
   * @param {number} current - ID of video to swap
   * @param {number} swap - ID of video to swap with
   */
  const swapHighlight = (current, swap) => {
    const btnCurrent = document.getElementById(current.toString());
    const btnSwap = document.getElementById(swap.toString());
    const currentHighlighted = (btnCurrent.classList.contains('btnSelectVideoSelected')) ? true : false;
    const swapHighlighted = (btnSwap.classList.contains('btnSelectVideoSelected')) ? true : false;
    if ((currentHighlighted && !swapHighlighted) || (!currentHighlighted && swapHighlighted)) {
        if (currentHighlighted) {
          btnCurrent.classList.remove('btnSelectVideoSelected');
          btnCurrent.parentElement.parentElement.classList.remove('videoOptionsPanelSelected');
          btnSwap.classList.add('btnSelectVideoSelected');
          btnSwap.parentElement.parentElement.classList.add('videoOptionsPanelSelected');
        }
        else {
          btnCurrent.classList.add('btnSelectVideoSelected');
          btnCurrent.parentElement.parentElement.classList.add('videoOptionsPanelSelected');
          btnSwap.classList.remove('btnSelectVideoSelected');
          btnSwap.parentElement.parentElement.classList.remove('videoOptionsPanelSelected');
        }
    }
  };
  const swapVideoInfo = (current, swap) => {
    //Swap Thumbnails
    const currentThumbnail = document.getElementById(`thumbnail${current}`).style.backgroundImage;
    document.getElementById(`thumbnail${current}`).style.backgroundImage = document.getElementById(`thumbnail${swap}`).style.backgroundImage;
    document.getElementById(`thumbnail${swap}`).style.backgroundImage = currentThumbnail;
    //Swap Edit Forms
    const currentEditTitle = document.getElementById(`editTitle${current}`).getAttribute('placeholder');
    const swapEditTitle = document.getElementById(`editTitle${swap}`).getAttribute('placeholder');
    document.getElementById(`editTitle${current}`).setAttribute('placeholder', swapEditTitle);
    document.getElementById(`editTitle${swap}`).setAttribute('placeholder', currentEditTitle);
    document.getElementById(`editTitle${current}`).setAttribute('value', swapEditTitle);
    document.getElementById(`editTitle${swap}`).setAttribute('value', currentEditTitle);

    const currentEditDescription = document.getElementById(`editDescription${current}`).textContent;
    document.getElementById(`editDescription${current}`).textContent = document.getElementById(`editDescription${swap}`).textContent;
    document.getElementById(`editDescription${swap}`).textContent = currentEditDescription;
    //Swap Main Text and Links
    const currentTitle = document.getElementById(`vidTitle${current}`).textContent;
    const currentLink = document.querySelector(`#vidTitle${current} > a`);
    const swapLink = document.querySelector(`#vidTitle${swap} > a`);
    currentLink.textContent = document.getElementById(`vidTitle${swap}`).textContent;
    swapLink.textContent = currentTitle;

    const currentVidDescription = document.getElementById(`vidDescription${current}`).textContent;
    document.getElementById(`vidDescription${current}`).textContent = document.getElementById(`vidDescription${swap}`).textContent;
    document.getElementById(`vidDescription${swap}`).textContent = currentVidDescription;
    
    const linkHolder = currentLink.getAttribute('href');
    currentLink.setAttribute('href',swapLink.getAttribute('href'));
    swapLink.setAttribute('href',linkHolder);
};
const addSwapVideoEvents = async (upButtons, downButtons) => {
    if (upButtons.length > 1) {
      for (let i = 0; i < upButtons.length; i++) {
        if (i === 0) {
          downButtons[i].addEventListener('click', async (e) => {
            toggleBackdrop(true, '#FFF', '10%');
            toggleModal(true, 'Swapping videos...');
            try {
              const currentVidId = downButtons[i].getAttribute('id').substring(8);
              const swapVidId = upButtons[i+1].getAttribute('id').substring(6);
              swapHighlight(currentVidId,swapVidId);

              const result = await fetch(`/video/${USERNAME}/swapVideos`, {
                method:'POST',
                headers: {
                  'Content-Type':'application/json'
                },
                body: JSON.stringify({
                  currentVidId,
                  swapVidId,
                })
              });
              const data = await result.json();
              if (data == null) {
                swapVideoInfo(currentVidId, swapVidId);
              }
            }
            catch (err) {
              flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
            }
            toggleBackdrop(false);
            toggleModal(false);
          });
        }
        else if (i === upButtons.length - 1) {
          upButtons[i].addEventListener('click', async (e) => {
            toggleBackdrop(true, '#FFF', '10%');
            toggleModal(true, 'Swapping videos...');
            try {
              const currentVidId = upButtons[i].getAttribute('id').substring(6);
              const swapVidId = downButtons[i-1].getAttribute('id').substring(8);
              swapHighlight(currentVidId,swapVidId);

              const result = await fetch(`/video/${USERNAME}/swapVideos`, {
                method:'POST',
                headers: {
                  'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    currentVidId,
                    swapVidId,
                })
                
              });
              const data = await result.json();
              if (data == null) {
                swapVideoInfo(currentVidId, swapVidId);
              }
              else {
                flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
              }
            } catch(err) {
            }
            toggleBackdrop(false);
            toggleModal(false);
          });
        }
        else {
          upButtons[i].addEventListener('click', async (e) => {
            toggleBackdrop(true, '#FFF', '10%');
            toggleModal(true, 'Swapping videos...');
            try {
              const currentVidId = upButtons[i].getAttribute('id').substring(6);
              const swapVidId = downButtons[i-1].getAttribute('id').substring(8);
              swapHighlight(currentVidId,swapVidId);

              const result = await fetch(`/video/${USERNAME}/swapVideos`, {
                method:'POST',
                headers: {
                  'Content-Type':'application/json'
                },
                body: JSON.stringify({
                  currentVidId,
                  swapVidId,
                })
              });
              const data = await result.json();
              if (data == null) {
                swapVideoInfo(currentVidId, swapVidId);
              }
            } catch(err) {
              flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
            }
            toggleBackdrop(false);
            toggleModal(false);
          });
          downButtons[i].addEventListener('click', async (e) => {
            toggleBackdrop(true, '#FFF', '10%');
            toggleModal(true, 'Swapping videos...');
            try {
              const currentVidId = downButtons[i].getAttribute('id').substring(8);
              const swapVidId = upButtons[i+1].getAttribute('id').substring(6);
              swapHighlight(currentVidId,swapVidId);

              const result = await fetch(`/video/${USERNAME}/swapVideos`, {
                method:'POST',
                headers: {
                  'Content-Type':'application/json'
                },
                body: JSON.stringify({
                  currentVidId,
                  swapVidId,
                })
              });
              const data = await result.json();
              if (data == null) {
                swapVideoInfo(currentVidId, swapVidId);
              }
            } catch(err) {
              flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
            }
            toggleBackdrop(false);
            toggleModal(false);
          });
        }
      }
    }
  };
  const toggleItemsSelected = (enabled = false, numOfItems = 0) => {
    const itemsSelectedContainer = document.getElementById('itemsSelected');
    if (enabled) {
      itemsSelectedContainer.classList.add('itemsSelected');
      if (numOfItems === 1) {
        itemsSelectedContainer.textContent = `${numOfItems} video selected`;
      } else {
        itemsSelectedContainer.textContent = `${numOfItems} videos selected`;
      }
    }
    else {
      itemsSelectedContainer.classList.remove('itemsSelected');
      itemsSelectedContainer.textContent = ``;
    }
  }
  const addSelectVideoEvents = (selectedVideos) => {
    const panels = document.getElementsByClassName('videoOptionsPanel');
    for (let i = 0; i < selectedVideos.length; i++) {
      selectedVideos[i].addEventListener('click', (e) => {
        let btnSelectVideoList = document.getElementsByClassName('btnSelectVideo');
        if (e.shiftKey) {
          let done = false;
          let j = 0;
          do {
            if (btnSelectVideoList[j] === e.target) {
              done = true;
              j--;
            }
            j++;
          } while (!done && j < btnSelectVideoList.length);
          done = false;

          if (!e.target.classList.contains('btnSelectVideoSelected')) {
            do {
              if (!selectedVideos[j].classList.contains('btnSelectVideoSelected')) {
                selectedVideos[j].classList.add('btnSelectVideoSelected');
                selectedVideos[j].parentNode.parentNode.classList.add('videoOptionsPanelSelected');
                j--;
              }
              else {
                done = true;
              }
            } while(!done && j >= 0);
          }
          else {
            do {
              if (selectedVideos[j].classList.contains('btnSelectVideoSelected')) {
                selectedVideos[j].classList.remove('btnSelectVideoSelected');
                selectedVideos[j].parentNode.parentNode.classList.remove('videoOptionsPanelSelected');
                j--;
              }
              else {
                done = true;
              }
            } while(!done && j >= 0);
          }
        }
        else {
          e.target.classList.toggle('btnSelectVideoSelected');
          e.target.parentNode.parentNode.classList.toggle('videoOptionsPanelSelected');
        }
        const numSelected = document.querySelectorAll('.btnSelectVideoSelected').length;

        //Highlight 'Delete Selected' button and show/hide 'items selected' panel
        //Highlight 'Refresh Metadata' button
        if (numSelected >= 1) {
          document.getElementById('btnDeleteSelected').classList.add('deleteSelected');
          toggleItemsSelected(true, numSelected);
          document.getElementById('btnRefreshMetadata').classList.add('itemsSelected');
        }
        else {
          document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
          toggleItemsSelected(false, numSelected);
          document.getElementById('btnRefreshMetadata').classList.remove('itemsSelected');
        }
        //Highlight 'Select All' button?
        if (numSelected === panels.length) {
          document.getElementById('btnSelectAllTopics').classList.add('selectedAll');
        }
        else {
          document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');
        }
      });
    }
  };
  const removeSelectVideoEvents = () => {
    let selectVideoButtons = document.getElementsByClassName('btnSelectVideo');
    let btnNew;
    for (btn of selectVideoButtons) {
      //btnNew = btn.cl
    }
  }
  const addSelectAllEvent = () => {
    document.getElementById('btnSelectAllTopics').addEventListener('click', (e) => {
      const selectVideoButtons = document.getElementsByClassName('btnSelectVideo');
      const panels = document.getElementsByClassName('videoOptionsPanel');

      if (selectVideoButtons.length >= 1) {
        const currentlySelected = e.target.classList.contains('selectedAll');
      
        if (!currentlySelected) {
          e.target.classList.add('selectedAll');
          document.getElementById('btnDeleteSelected').classList.add('deleteSelected');
          document.getElementById('btnRefreshMetadata').classList.add('itemsSelected');
          for (let i = 0; i < selectVideoButtons.length; i++) {
            selectVideoButtons[i].classList.add('btnSelectVideoSelected');
            panels[i].classList.add('videoOptionsPanelSelected');
          }
          toggleItemsSelected(true, selectVideoButtons.length);
        }
        else {
          e.target.classList.remove('selectedAll');
          document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
          document.getElementById('btnRefreshMetadata').classList.remove('itemsSelected');
          for (let i = 0; i < selectVideoButtons.length; i++) {
            selectVideoButtons[i].classList.remove('btnSelectVideoSelected');
            panels[i].classList.remove('videoOptionsPanelSelected');
          }
          toggleItemsSelected(false, selectVideoButtons.length);
        }
      }   
    });
  };
  const addRemoveSelectedVideos = () => {
    document.getElementById('btnDeleteSelected').addEventListener('click', async (e) => {
      const selectedVideos = document.getElementsByClassName('btnSelectVideoSelected');
      const selectedVideosLength = selectedVideos.length;
      const totalVideos = document.querySelectorAll('.dashboardTopicVideoContainer').length;
      if (selectedVideos.length > 0) {
        toggleBackdrop(true, '#fff', '10%');
        toggleModal(true, 'Deleting videos. Please be patient.');
        let videoList = new Array();
        for (let i = 0; i < selectedVideos.length; i++) {
          videoList.push(selectedVideos[i].getAttribute('id'));
        }
        try {
          const result = await fetch(`/video/${USERNAME}/deleteSelected`, {
            method:'DELETE',
            headers: {
              'Content-Type':'application/json',
            },
            body: JSON.stringify({
              videos:videoList,
            })
          });
          
          const data = await result.json();
          if (data === null) {
            for (let i = 0; i < videoList.length; i++) {
              document.getElementById(`${videoList[i]}` + `Container`).remove();
            }
            document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
            document.getElementById('btnRefreshMetadata').classList.remove('itemsSelected');
            toggleItemsSelected();

            //Update 'video select' buttons
            //let updatedVideoButtons = document.getElementsByClassName('btnSelectVideo');
            //addSelectVideoEvents(updatedVideoButtons);
            if (videoList.length === 1) {
              flashBanner('success', `Sucessfully deleted ${videoList.length} video`, REFERENCE_NODE);
            } else {
              flashBanner('success', `Sucessfully deleted ${videoList.length} videos`, REFERENCE_NODE);
            }
            if (selectedVideosLength === totalVideos) {
              document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');
              let text = document.createElement('h2');
              text.textContent = 'No Videos in Topic';
              document.getElementById('dashboardTopicVideosList').append(text);
            }
          }
        } catch(err) {

        }
        toggleBackdrop(false);
        toggleModal(false);
      }
    });
  };
  const addRefreshMetadataEvent = () => {
    let btnRefresh = document.getElementById('btnRefreshMetadata');
    btnRefresh.addEventListener('click', async () => {
      let selectedVideos = document.getElementsByClassName('btnSelectVideoSelected');
      if (selectedVideos.length > 0) {
        toggleBackdrop(true, '#fff', '10%');
        toggleModal(true, 'Refreshing metadata. Hold on a moment.');
        let videoList = new Array();
        for (let i = 0; i < selectedVideos.length; i++) {
          videoList.push(selectedVideos[i].getAttribute('id'));
        }
        try {
          const result = await fetch(`/video/${USERNAME}/refreshMetadata`, {
            method:'PUT',
            headers: {
              'Content-Type':'application/json',
            },
            body: JSON.stringify({
              videos:videoList,
            })
          });
          
          const data = await result.json();
          
          if (data.status !== 'error') {
            for (let i = 0; i < videoList.length; i++) {
              if (data.finalResult[i].title !== null) {
                document.querySelector(`#vidTitle${videoList[i]} > a`).textContent = data.finalResult[i].title;
                document.getElementById(`editTitle${videoList[i]}`).setAttribute('placeholder', data.finalResult[i].title);
                document.getElementById(`editTitle${videoList[i]}`).setAttribute('value', data.finalResult[i].title);
              }
              if (data.finalResult[i].description !== null) {
                document.getElementById(`vidDescription${videoList[i]}`).textContent = data.finalResult[i].description.substring(0,100);
                document.getElementById(`editDescription${videoList[i]}`).textContent = data.finalResult[i].description.substring(0,2047);
              }
              if (data.finalResult[i].thumbnail !== null) {
                document.getElementById(`thumbnail${videoList[i]}`).style.backgroundImage = `url('${data.finalResult[i].thumbnail}')`;
              }
            }
            flashBanner('success', `Sucessfully refreshed ${videoList.length} videos`, REFERENCE_NODE);
          }
        } catch(err) {
          flashBanner('error', `Error refreshing video(s)`, REFERENCE_NODE);
        }
        toggleBackdrop(false);
        toggleModal(false);
      }
    });
  };
  const topicImageEvent = () => {
    document.getElementById('btnFileUpload').addEventListener('change', function() {
      
      if (this.files[0].type.includes('image')) {
        document.getElementById('fileSelected').textContent = this.files[0].name;
      let reader = new FileReader();
      reader.onload = (e) => {
        let img = document.querySelector('.file-upload img');
        img.src = e.target.result;
        img.classList.remove('displayNone');
        document.querySelector('.file-upload div').classList.add('displayNone');
      }
      reader.readAsDataURL(this.files[0]);
      }
    });
  }
  const addUpdateImageEvent = async () => {
    const btnUpdateImage = document.getElementById('btnUpdateImage');
    btnUpdateImage.addEventListener('click',async () => {
      const form = document.getElementById('editTopicImgForm');
      const formData = new FormData(form);
      if (formData.get("topic[file]").name) {
        toggleEditTopicImageForm();
        toggleBackdrop(true, '#fff', '10%');
        toggleModal(true, 'Updating image...');
        let result = await fetch(`/topics/${USERNAME}/editImage/${TOPIC_URL}`, {
          method:'POST',
          body: formData,
        });
        let data = await result.json();
        
        toggleBackdrop(false);
        toggleModal(false);
        if (Object.keys(data).includes('error')) {
          flashBanner('error', `${data.error}`, REFERENCE_NODE);
        }
        else {
          flashBanner('success', 'Successfully updated image', REFERENCE_NODE);
          document.querySelector('.topicPageImageContainer').style.backgroundImage = `url('${data}')`;
          document.querySelector('.editTopicImageImageContainer').style.backgroundImage = `url('${data}')`;
          document.getElementById('btnFileUpload').value = null;
          document.querySelector('.streamedTopicImg').classList.add('displayNone');
          document.querySelector('.file-upload div').classList.remove('displayNone');
          document.getElementById('fileSelected').textContent = 'No file selected.';
          document.getElementById('no-image').remove();
          document.querySelector('.txtNoTopicImage').classList.add('displayNone');
        }
      }
    });
  }
  const init = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.newVideoFormContainer').classList.add('displayNone');
    
    document.getElementById("btnCreateTopicForm").addEventListener("click", toggleNewTopicForm);
    document.querySelector('.btnCancelNewTopic').addEventListener("click", toggleNewTopicForm);
    addNewVideoSubmitEvent();
    
    document.querySelector('.editImageFormContainer').classList.add('displayNone');
    document.querySelector('.topicPageImageContainer').addEventListener("click", toggleEditTopicImageForm);
    document.getElementById('cancelEditTopicImage').addEventListener('click', toggleEditTopicImageForm);

    const editVideoButtons = document.getElementsByClassName('btnVideoEdit');
    const cancelEditVideoButtons = document.getElementsByClassName('btnCancelEdit');
    
    for (let i = 0; i < editVideoButtons.length; i++) {
      addEditEvent(editVideoButtons[i], cancelEditVideoButtons[i]);
    }

    const moveUpButtons = document.getElementsByClassName('moveUp');
    const moveDownButtons = document.getElementsByClassName('moveDown');
    addSwapVideoEvents(moveUpButtons, moveDownButtons);

    const selectVideoButtons = document.getElementsByClassName('btnSelectVideo');
    addSelectVideoEvents(selectVideoButtons);
    addSelectAllEvent();

    addDeleteVideoSubmitEvents();
    addRemoveSelectedVideos();
    addRefreshMetadataEvent();

    topicImageEvent();
    addUpdateImageEvent();
  };
  
  init();