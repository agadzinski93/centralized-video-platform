//Globals Required: Username and Topic Url
let MODAL_TARGET = null;
/**
  * Close modal when clicking anywhere off the modal
  * @param {object} e event object
*/
const clickOffEvent = function(target) {
  return function(e) {
    switch (target) {
      case 'NEW_TOPIC':
        toggleNewTopicForm();
        break;
      case 'EDIT_TOPIC_IMAGE':
        toggleEditTopicImageForm();
        break;
      default:
    }
    document.querySelector('.backdrop').removeEventListener('click',clickOffEvent);
  }
}
const addRemoveModalEvent = function(target) {
  if (MODAL_TARGET === null) {
      MODAL_TARGET = clickOffEvent(target);
      document.querySelector('.backdrop').addEventListener('click',MODAL_TARGET);
  }
  else {
      document.querySelector('.backdrop').removeEventListener('click',MODAL_TARGET);
      MODAL_TARGET = null;
  }
}
const toggleNewTopicForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.newVideoFormContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
    addRemoveModalEvent('NEW_TOPIC');
  };
  const toggleEditTopicImageForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.editImageFormContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
    addRemoveModalEvent('EDIT_TOPIC_IMAGE');
  }

  const addNewVideoSubmitEvent = () => {
    document.getElementById('newVideoForm').addEventListener('submit', (e) => {
      document.querySelector('.newVideoFormContainer').classList.add('displayNone');
      toggleBackdrop(true, '#fff', '10%');
      toggleModal(true, 'Adding video(s). Please be patient.');
    });
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
const addSwapVideoEvents = async () => {
    const upButtons = document.getElementsByClassName('moveUp');
    const downButtons = document.getElementsByClassName('moveDown');

    const downClickOne = async (i,e) => {
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
        if (data.data == null) {
          swapVideoInfo(currentVidId, swapVidId);
        }
      }
      catch (err) {
        flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
      }
      toggleBackdrop(false);
      toggleModal(false);
    }
    const upClickOne = async (i,e) => {
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
        if (data.data == null) {
          swapVideoInfo(currentVidId, swapVidId);
        }
        else {
          flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
        }
      } catch(err) {
      }
      toggleBackdrop(false);
      toggleModal(false);
    }
    const upClickMany = async (i,e) => {
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
        if (data.data == null) {
          swapVideoInfo(currentVidId, swapVidId);
        }
      } catch(err) {
        flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
      }
      toggleBackdrop(false);
      toggleModal(false);
    }
    const downClickMany = async (i,e) => {
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
        if (data.data == null) {
          swapVideoInfo(currentVidId, swapVidId);
        }
      } catch(err) {
        flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
      }
      toggleBackdrop(false);
      toggleModal(false);
    }
    if (upButtons.length > 1) {
      let foo;
      let bar;
      for (let i = 0; i < upButtons.length; i++) {
        if (i === 0) {
          foo = downClickOne.bind(null,i);
          downButtons[i].addEventListener('click', foo);
        }
        else if (i === upButtons.length - 1) {
          foo = upClickOne.bind(null,i)
          upButtons[i].addEventListener('click', foo);
        }
        else {
          foo = upClickMany.bind(null,i);
          bar = downClickMany.bind(null,i);
          upButtons[i].addEventListener('click', foo);
          downButtons[i].addEventListener('click', bar);
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
  const selectVideoEvent = (e) => {
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
          if (!btnSelectVideoList[j].classList.contains('btnSelectVideoSelected')) {
            btnSelectVideoList[j].classList.add('btnSelectVideoSelected');
            btnSelectVideoList[j].parentNode.parentNode.classList.add('videoOptionsPanelSelected');
            j--;
          }
          else {
            done = true;
          }
        } while(!done && j >= 0);
      }
      else {
        do {
          if (btnSelectVideoList[j].classList.contains('btnSelectVideoSelected')) {
            btnSelectVideoList[j].classList.remove('btnSelectVideoSelected');
            btnSelectVideoList[j].parentNode.parentNode.classList.remove('videoOptionsPanelSelected');
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
    if (numSelected === btnSelectVideoList.length) {
      document.getElementById('btnSelectAllTopics').classList.add('selectedAll');
    }
    else {
      document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');
    }
  }
  /**
   * Add 'Select Video' highlight event for new or all videos
   * @param {*} selectedVideos 
   * @param {string} condition 'all': all videos upon initial page render, 'new': when a new video is added
   */
  const addSelectVideoEvents = (selectedVideos, condition) => {
    let panels;
    switch(condition) {
      case 'all':
        panels = document.getElementsByClassName('videoOptionsPanel');
        break;
      case 'new':
        panels = Array();
        panels.push(document.querySelector(`#dashboardTopicVideosList > .dashboardTopicVideoContainer:last-child .videoOptionsPanel`));
      default:
    };
    if (panels) {
      for (let i = 0; i < selectedVideos.length; i++) {
        selectedVideos[i].addEventListener('click', selectVideoEvent);
      }
    }
  };
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
          if (data.data === null) {
            for (let i = 0; i < videoList.length; i++) {
              document.getElementById(`${videoList[i]}` + `Container`).remove();
            }
            document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
            document.getElementById('btnRefreshMetadata').classList.remove('itemsSelected');
            toggleItemsSelected();

            //Update 'video select' buttons
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
                document.getElementById(`vidDescription${videoList[i]}`).textContent = data.finalResult[i].description.substring(0,2047);
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
        let img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('streamedTopicImg');
        document.getElementById('lblFileUpload').append(img);
        document.querySelector('.file-upload span').classList.add('displayNone');
      }
      reader.readAsDataURL(this.files[0]);
      }
    });
    document.getElementById('lblFileUpload').addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });
    document.getElementById('lblFileUpload').addEventListener('dragenter', (e) => {
      if (e.dataTransfer.items[0].kind === 'file') {
        document.getElementById('lblFileUpload').style.border = 'solid 1px blue';
      }
    });
    document.getElementById('lblFileUpload').addEventListener('dragleave', (e) => {
      document.getElementById('lblFileUpload').style.border = '';
    });
    document.getElementById('lblFileUpload').addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.items[0].kind === 'file') {
        let files = e.dataTransfer.files;
        let reader;
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.includes('image')) {
            reader = new FileReader();
            reader.onload = (e2) => {
              let img = document.querySelector('.file-upload img');
              img.src = e2.target.result;
              img.classList.remove('displayNone');
              document.querySelector('.file-upload span').classList.add('displayNone');
              document.getElementById('fileSelected').textContent = files[i].name;
              document.getElementById('btnFileUpload').files = files;
            }
            reader.readAsDataURL(files[i]);
          }
        }
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
  const createVideoTile = (v) => {
    const {id,title,url,thumbnail,description} = v;
    const dashboardTopicVideoContainer = document.createElementTree('div',['dashboardTopicVideoContainer'],{id:`${id}Container`});

    //Video Options Panel
    const videoOptionsPanel = document.createElementTree('div',['videoOptionsPanel'],null,[
      ['p',[],null,[
          ['button',['moveUp'],{id: `moveUp${id}`},null,'&#x25B2;'],
        ]
      ],
      ['p',[],null,[
          ['button',['btnSelectVideo'],{id:`${id}`}],
        ]
      ],
      ['p',[],null,[
          ['button',['moveDown'],{id: `moveDown${id}`},null,'&#x25BC;'],
      ]
      ],
    ]);
    dashboardTopicVideoContainer.append(videoOptionsPanel);

    const videoThumbnailContainer = document.createElementTree('div',['videoThumbnailContainer'],{id:`thumbnail${id}`,style:`background-image:url('${thumbnail}')`});
    dashboardTopicVideoContainer.append(videoThumbnailContainer);

    //Edit Form
    const editVideoForm = document.createElementTree('div',['editVideoForm','displayNone'],{id:`editVideoForm${id}`},[
      ['form',['editForm'],{action:`/video/${USERNAME}/${TOPIC_URL}/${id}/edit`, method:'POST'},[
        ['div',['firstRow'],null,[
          ['input',null,{id:`editTitle${id}`,type:'text',name:'title',placeholder:`${title}`,value:`${title}`}],
          ['div',['editVideoButtons'],null,[
            ['button',['btnSaveEdit','icon'],{id:`btnSaveEdit${id}`}],
            ['button',['btnCancelEdit','icon'],{id:`btnCancelEdit${id}`}]
          ]]
        ]],
        ['textarea',null,{name:'description',id:`editDescription${id}`,maxlength:'1024'},null,description]
      ]]
    ]);
    dashboardTopicVideoContainer.append(editVideoForm);

    const displayVideoInfo = document.createElementTree('div',['displayVideoInfo','displayFlex'],{id:`displayVideoInfo${id}`},[
      ['div',['videoContentContainer'],null,[
        ['div',['dashboardTopicVideoContainerFirstRow'],null,[
          ['p',['dashboardVideoTitle'],{id:`vidTitle${id}`},[
            ['a',null,{href:`/lib/${TOPIC_URL}/${url.substring(20)}`},null,`${title}`]
          ]],
          ['div',['btnEditDelete'],null,[
            ['button',['btnVideoEdit'],{id:`btnVideoEdit${id}`},[
              ['img',['icon'],{src:`/assets/svg/edit-dark.png`,alt:'edit'}],
              ['span',null,null,null,'Edit Video']
            ]],
            ['button',['btnVideoDelete'],null,[
              ['img',['icon'],{src:'/assets/svg/trashBlack.svg',alt:'delete'}]
            ]]
          ]]
        ]],
        ['div',['vidDescriptionContainer'],null,[
          ['p',null,{id:`vidDescription${id}`},null,`${description}`]
        ]]
      ]]
    ]);
    dashboardTopicVideoContainer.append(displayVideoInfo);

    return dashboardTopicVideoContainer;
  }
  const appendVideos = async (v) => {
    const appendSwapVideoEvents = (down,up) => {
      const newDownEvent = async () => {
        toggleBackdrop(true, '#FFF', '10%');
        toggleModal(true, 'Swapping videos...');
        try {
          const currentVidId = up.getAttribute('id').substring(6);
          const swapVidId = down.getAttribute('id').substring(8);
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
          if (data.data == null) {
            swapVideoInfo(currentVidId, swapVidId);
          }
        } catch(err) {
          flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
        }
        toggleBackdrop(false);
        toggleModal(false);
      }
      const newUpEvent = async () => {
        toggleBackdrop(true, '#FFF', '10%');
        toggleModal(true, 'Swapping videos...');
        try {
          const currentVidId = down.getAttribute('id').substring(8);
          const swapVidId = up.getAttribute('id').substring(6);
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
          if (data.data == null) {
            swapVideoInfo(currentVidId, swapVidId);
          }
        } catch(err) {
          flashBanner('error', 'Error swapping videos', REFERENCE_NODE);
        }
        toggleBackdrop(false);
        toggleModal(false);
      }
      down.addEventListener('click',newDownEvent);
      up.addEventListener('click',newUpEvent);
    }
    const addDeleteVideoEvent = (el) => {
      el.addEventListener('click',deleteVideoHandler);
    }
    const h2 = document.querySelector('#dashboardTopicVideosList > h2');
    if (h2) {
      document.querySelector('#dashboardTopicVideosList > h2').remove();
    }
    const container = document.getElementById('dashboardTopicVideosList');
    if (Array.isArray(v)) {
      let tile;
      let list;
      let length;
      let prevLastDownButton;
      let newUpButton;
      let btnSelect = Array();
      for (let i = 0; i < v.length; i++) {
        tile = createVideoTile(v[i]);
        container.append(tile);
        list = document.querySelectorAll('.dashboardTopicVideoContainer');
        length = list?.length;
        if (length && length > 1) {
          prevLastDownButton = document.querySelector('.dashboardVideosContainer .dashboardTopicVideoContainer:nth-last-child(2) .moveDown');
          newUpButton = document.querySelector('.dashboardVideosContainer .dashboardTopicVideoContainer:last-child .moveUp');
          appendSwapVideoEvents(prevLastDownButton,newUpButton);
        }
        btnSelect.push(document.querySelector(`#dashboardTopicVideosList .dashboardTopicVideoContainer:last-child .btnSelectVideo`));
        addSelectVideoEvents(btnSelect,'new');
        btnSelect.pop();
        addEditEvent(document.getElementById(`btnVideoEdit${v[i].id}`),document.getElementById(`btnCancelEdit${v[i].id}`));
        addDeleteVideoEvent(document.querySelector(`#btnVideoEdit${v[i].id} + .btnVideoDelete`));
      }
    }
    else {
      const tile = createVideoTile(v);
      container.append(tile);
      const list = document.querySelectorAll('.dashboardTopicVideoContainer');
      const length = list?.length;
      let prevLastDownButton;

      if (length && length > 1) {
        prevLastDownButton = document.querySelector('.dashboardVideosContainer .dashboardTopicVideoContainer:nth-last-child(2) .moveDown');
        const newUpButton = document.querySelector('.dashboardVideosContainer .dashboardTopicVideoContainer:last-child .moveUp');
        appendSwapVideoEvents(prevLastDownButton,newUpButton);
      }
      const btnSelect = Array();
      btnSelect.push(document.querySelector(`#dashboardTopicVideosList .dashboardTopicVideoContainer:last-child .btnSelectVideo`));
      addSelectVideoEvents(btnSelect,'new');
      addEditEvent(document.getElementById(`btnVideoEdit${v.id}`),document.getElementById(`btnCancelEdit${v.id}`));
      addDeleteVideoEvent(document.querySelector(`#btnVideoEdit${v.id} + .btnVideoDelete`));
    }
  }
  const addVideo = async (e) => {
    e.preventDefault();
    document.querySelector('.newVideoFormContainer').classList.add('displayNone');
    toggleBackdrop(true, '#fff', '10%');
    toggleModal(true, 'Adding video(s). Please be patient.');
    const form = new FormData(document.getElementById('newVideoForm'));

    let body = {};
    form.forEach((v,k) => {
      body[k] = v;
    });

    const res = await fetch(`/video/${USERNAME}/${TOPIC_URL}/create`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(body)
    });
    const data = await res.json();

    toggleBackdrop(false);
    toggleModal(false);
    flashBanner(data.response,data.message, REFERENCE_NODE);

    if (data.response === 'success') {
      appendVideos(data.data);
    }
  }
  const addVideoClickEvent = () => {
    const btnAdd = document.getElementById('btnAddVideo');
    btnAdd.addEventListener('click',addVideo);
  }

  const deleteVideoHandler = async (e) => {
    e.preventDefault();
    toggleBackdrop(true, '#fff', '10%');
    toggleModal(true, 'Adding video(s). Please be patient.');
    const el = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
    const id = el.getAttribute('id').substring(16);
    const result = await fetch(`/video/${USERNAME}/${TOPIC_URL}/${id}/delete`,{
      method:'POST'
    });
    const data = await result.json();
    toggleBackdrop(false);
    toggleModal(false);
    el.parentElement.remove();
    flashBanner(data.response,data.message, REFERENCE_NODE);
  }

  const addDeleteVideoEvents = () => {
    const deleteButtons = document.querySelectorAll('.btnVideoDelete');
    for (let i = 0; i < deleteButtons.length; i++) {
      deleteButtons[i].addEventListener('click',deleteVideoHandler)
    }
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

    addSwapVideoEvents();

    addSelectVideoEvents(document.getElementsByClassName('btnSelectVideo'),'all');
    addSelectAllEvent();

    addRemoveSelectedVideos();
    addRefreshMetadataEvent();

    topicImageEvent();
    addUpdateImageEvent();

    addVideoClickEvent();
    addDeleteVideoEvents();
  };
  
  init();