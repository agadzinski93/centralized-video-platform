//Globals Required: Username, API_PATH
let topics;
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
    toggleBackdrop('toggle',"#000",'50%');
    document.querySelector('.newTopicFormContainer').classList.toggle('displayNone');
    document.querySelector('html').classList.toggle('overflowHidden');
    addRemoveModalEvent('NEW_TOPIC');
  };
const createTopicTile = ({name,difficulty,description,imageUrl}) => {
  const dashedName = name.replaceAll(' ','-');
  if (imageUrl === 'null') {
    imageUrl = '';
  }
  return document.createElementTree('div',['dashboardTopicWrapper'],{id:`${dashedName}`},[
    ['div',['topicButtonsContainer'],null,[
      ['button',['btnSelectTopic'],{id:`btnSelect${dashedName}`}],
      ['div',['topicButtons'],null,[
        ['button',['btnTopicEdit'],{id:`btnEdit${dashedName}`},[
          ['img',['icon'],{src:'/assets/svg/edit-dark.png',alt:'edit'}],
          ['span',null,null,null,'Edit Topic']
        ]],
        ['button',['btnTopicDelete','deleteTopic'],{id:`btnDeleteTopic${dashedName}`},[
          ['img',['icon'],{src:`/assets/svg/trashBlack.svg`,alt:'delete'}],
          ['span',null,null,null,'Delete Topic']
        ]]
      ]]
    ]],
    ['a',null,{href:`${API_PATH}/user/${USERNAME}/dashboard/${dashedName}`},[
      ['div',['dashboardTopicContainer'],null,[
        ['div',['topicImageContainer'],{style:`background-image:url('${imageUrl}')`}],
        ['div',['topicInfo'],{id:'topicInfo'},[
          ['div',['dashboardTopicFirstRow'],null,[
            ['p',['topicName'],{id:'topicNameTitle'},null,`${name}`]
          ]],
          ['p',['topicDifficulty'],null,null,`${difficulty}`],
          ['p',['topicDescription'],{id:`${dashedName}Description`},null,`${description}`]
        ]]
      ]]
    ]]
  ]);
}
const createEditTopicTile = ({name,difficulty,description}) => {
  const dashedName = name.replaceAll(' ','-');
  return document.createElementTree('div',['dashboardTopicWrapperEdit','removeDisplay'],{id:`edit${dashedName}`},[
    ['form',null,{id:`editForm${dashedName}`},[
      ['div',['topicButtons'],null,[
        ['button',['btnTopicEdit','editTopic'],null,[
          ['img',['icon'],{src:'/assets/svg/accept.png',alt:'save changes'}],
          ['span',null,null,null,'Save Changes']
        ]],
        ['button',['btnTopicDelete','cancelEdit'],{id:`btnCancelEdit${dashedName}`,type:'button'},[
          ['img',['icon'],{src:'/assets/svg/cancel.png',alt:'cancel'}],
          ['span',null,null,null,'Cancel']
        ]]
      ]],
      ['label',['lblTopicName'],{type:'text',for:'topicName'},null,'Topic Name'],
      ['input',null,{id:'topicName',type:'text',name:'name',placeholder:`${name}`}],
      ['div',['editDifficultyContainer'],null,[
        ['label',['lblTopicDifficulty'],{for:'difficulty'},null,'Difficulty'],
        ['select',null,{id:'difficulty',name:'difficulty'},[
          ['option',null,{value:'Beginner'},null,'Beginner'],
          ['option',null,{value:'Intermediate'},null,'Intermediate'],
          ['option',null,{value:'Advanced'},null,'Advanced']
        ]]
      ]],
      ['label',['lblTopicDescription'],{for:`${dashedName}DescriptionInput`},null,'Description'],
      ['textarea',null,{id:`${dashedName}DescriptionInput`,name:'description',cols:'50',rows:'5',maxlength:'255'},null,`${description}`]
    ]]
  ]);
}
const createTopicHandler = async (e) => {
  e.preventDefault();
  toggleBackdrop(true, '#fff', '10%');
  toggleModal(true, 'Creating topic...');
  try {
    const form =  new FormData(document.getElementById('newTopicForm'));
    const result = await fetch(`${API_PATH}/topics/${USERNAME}/create`,{
      method:'POST',
      body:form
    });
    const data = await result.json();
    if (data.response === 'success') {
      const dashboardTopicList = document.querySelector('.dashboardTopicList');
      dashboardTopicList.append(createTopicTile(data.data[0]));
      dashboardTopicList.append(createEditTopicTile(data.data[0]));
      const foo = highlightTopicHandler(topics,topics.length - 1);
      const nameDashed = data.data[0].name.replaceAll(' ','-')
      document.getElementById(`btnSelect${nameDashed}`).addEventListener('click',foo);
      document.getElementById(`btnEdit${nameDashed}`).addEventListener('click',editEventHandler);
      document.getElementById(`btnCancelEdit${nameDashed}`).addEventListener('click',cancelEditEventHandler);
      document.getElementById(`btnDeleteTopic${nameDashed}`).addEventListener('click',deleteTopicHandler);
      document.querySelector(`#editForm${nameDashed} button.editTopic`).addEventListener('click',saveEditHandler);
    }
    flashBanner(data.response,data.message,REFERENCE_NODE);
  } catch (err) {
    console.error(`Error creating topic: ${err.message}`);
  }
  toggleNewTopicForm();
  toggleModal(false);
}
const addCreateTopicEvent = () => {
  document.getElementById('newTopicForm').addEventListener('submit',createTopicHandler);
}
  const toggleTopicSelected = () => {
    document.querySelector('.btnSelectTopic').classList.toggle('btnSelectTopicSelected');
  };
  const toggleSelectAllTopics = (e) => {
    let topicContainers = document.getElementsByClassName('dashboardTopicWrapper');
    let topicButtons = document.getElementsByClassName('btnSelectTopic');
    let topicIsSelected = document.querySelector('btnSelectTopicSelected');
    let itemsSelected = document.getElementById('itemsSelected');
    
    if (e.target.classList.contains('selectedAll') || topicIsSelected) {
      e.target.classList.remove('selectedAll');
      document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
      //Create 'items selected' box at top with appropriate number selected
      itemsSelected.classList.remove('itemsSelected');
      itemsSelected.textContent = ``;
      //Remove highlighted button and border on all topics on dashboard
      for (let i = 0; i < topicContainers.length; i++) {
        topicContainers[i].classList.remove('dashboardTopicWrapperSelected');
        topicButtons[i].classList.remove('btnSelectTopicSelected');
      }
    }
    else {
      e.target.classList.add('selectedAll');
      document.getElementById('btnDeleteSelected').classList.add('deleteSelected');
      //Remove 'items selected' box at top of dashboard page
      itemsSelected.classList.add('itemsSelected');
      if (topicContainers.length === 1) {
        itemsSelected.textContent = `${topicContainers.length} item selected.`;
      } else {
        itemsSelected.textContent = `${topicContainers.length} items selected.`;
      }
      //Add highlighted button and border on all topics on dashboard
      for (let i = 0; i < topicContainers.length; i++) {
        topicContainers[i].classList.add('dashboardTopicWrapperSelected');
        topicButtons[i].classList.add('btnSelectTopicSelected');
      }
    }
  };
  const deleteSelectedTopics = async () => {
    toggleBackdrop(true, '#fff', '10%');
    toggleModal(true, 'Deleting topic...');
    let selectedTopics = document.querySelectorAll('.dashboardTopicWrapperSelected .topicName');
    if (selectedTopics.length > 0) {
      try {
        let topicsToDelete = new Array();
        for (let i = 0;i < selectedTopics.length; i++) {
          topicsToDelete.push(selectedTopics[i].textContent);
        }

        const result = await fetch(`${API_PATH}/topics/${USERNAME}/deleteSelected`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'},
          body: JSON.stringify({
            topics: topicsToDelete
          }),
        });
        const data = await result.json();
        if (data.response === 'success') {
          for (let i = 0;i < selectedTopics.length; i++) {
            selectedTopics[i].parentElement.parentElement.parentElement.parentElement.parentElement.remove();
          }
          let itemsSelected = document.getElementById('itemsSelected');
          itemsSelected.classList.remove('itemsSelected');
          itemsSelected.textContent = ``;
          document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
          document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');
        }
        flashBanner(data.response,data.message,REFERENCE_NODE);
        
      } catch (err) {
        console.error(`Error deleting selected topics: ${err.message}`);
      };
    }
    toggleBackdrop(false);
    toggleModal(false);
  };
  const highlightTopicHandler = (topics,i) => {
    return function (e) {
      let topicNames = document.getElementsByClassName("dashboardTopicWrapper");
      let numOfSelected = document.getElementsByClassName('btnSelectTopicSelected').length;
      let allTopics = document.getElementsByClassName('btnSelectTopic');
      let totalTopics = allTopics.length;
      let itemsSelected = document.getElementById('itemsSelected');

      if (e.shiftKey) {
        //Get index of topic clicked
        const topicButtons = document.getElementsByClassName('btnSelectTopic');
        let currentItem = 0;
        let j = 0;
        let found = false;
        do {
          if (topicButtons[j].getAttribute('id').replaceAll(' ','-') === e.target.getAttribute('id').replaceAll(' ','-')) {
            found = true;
            currentItem = j;
            j--;
          }
          j++;
        } while (!found && j < totalTopics);

        found = false;
        let topicList = document.getElementsByClassName('btnSelectTopic');
        let firstPreviousItem = 0;
        
        //Shift+Click On Selected Item
        if (e.target.getAttribute('class').includes('btnSelectTopicSelected')) {
          do {
            if (!topicList[j].getAttribute('class').includes('btnSelectTopicSelected')) {
              found = true;
              firstPreviousItem = j;
              j++;
            }
            j--;
          } while (!found && j >= firstPreviousItem);

          for (let k = firstPreviousItem; k <= currentItem; k++) {
            document.getElementById(`btnSelect${topics[k].textContent.replaceAll(' ','-')}`).classList.remove('btnSelectTopicSelected');
            document.getElementById(`${topicNames[k].getAttribute('id')}`).classList.remove('dashboardTopicWrapperSelected');
          }
        } 
        //Shift+Click On Unselected Item
        else {
          do {
            if (topicList[j].getAttribute('class').includes('btnSelectTopicSelected')) {
              found = true;
              firstPreviousItem = j;
              j++;
            }
            j--;
          } while (!found && j >= 0);

          for (let k = firstPreviousItem; k <= i; k++) {
            document.getElementById(`btnSelect${topics[k].textContent.replaceAll(' ','-')}`).classList.add('btnSelectTopicSelected');
            document.getElementById(`${topicNames[k].getAttribute('id')}`).classList.add('dashboardTopicWrapperSelected');
          }
        }
      }
      else {
        document.getElementById(`btnSelect${topics[i].textContent.replaceAll(' ','-')}`).classList.toggle('btnSelectTopicSelected');
        document.getElementById(`${topicNames[i].getAttribute('id')}`).classList.toggle('dashboardTopicWrapperSelected');
      }
      
      numOfSelected = document.getElementsByClassName('btnSelectTopicSelected').length;

      (numOfSelected === totalTopics) 
      ? document.getElementById('btnSelectAllTopics').classList.add('selectedAll') 
      : document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');

      if (numOfSelected > 0) {
        document.getElementById('btnDeleteSelected').classList.add('deleteSelected');
        itemsSelected.classList.add('itemsSelected');
        if (numOfSelected > 1) {
          itemsSelected.textContent = `${numOfSelected} items selected.`;
        }
        else {
          itemsSelected.textContent = `${numOfSelected} item selected.`;
        }
        
      }
      else {
        document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
        document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');
        itemsSelected.classList.remove('itemsSelected');
        itemsSelected.textContent = ``;
      }
    }
  }
  const addTopicSelectEvents = () => {
    for (let i = 0;i < topics.length; i++) {
      const foo = highlightTopicHandler(topics,i);
      document.getElementById(`btnSelect${topics[i].textContent.replaceAll(' ','-')}`).addEventListener("click", foo);
    }
  };
  const topicImageEvent = () => {
    document.getElementById('btnFileUpload').addEventListener('change', function() {
      if (this.files[0].type.includes('image')) {
        document.getElementById('fileSelected').textContent = this.files[0].name;
      let reader = new FileReader();
      reader.onload = (e) => {
        let img = document.createElement('img');
        img.src = e.target.result;
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
              let img = document.createElement('img');
              img.src = e2.target.result;
              document.getElementById('lblFileUpload').append(img);
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
  const editEventHandler = (e) => {
    const topicName = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('id');
    let topicInfo = document.getElementById(`${topicName.replaceAll(' ','-')}`);
    let form = document.getElementById(`edit${topicName.replaceAll(' ','-')}`);
    topicInfo.classList.add("removeDisplay");
    form.classList.remove("removeDisplay");
  }
  const cancelEditEventHandler = (e) => {
    const topicName = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('id').substring(4);
    let topicInfo = document.getElementById(`${topicName.replaceAll(' ','-')}`);
    let form = document.getElementById(`edit${topicName.replaceAll(' ','-')}`);
    topicInfo.classList.remove("removeDisplay");
    form.classList.add("removeDisplay");
  }
  const addTopicAddAndEditEvents = () => {
    const addEditEvent = (btn, topicName) => {
        btn.addEventListener("click", () => {
          let topicInfo = document.getElementById(`${topicName.replaceAll(' ','-')}`);
          let form = document.getElementById(`edit${topicName.replaceAll(' ','-')}`);
          topicInfo.classList.add("removeDisplay");
          form.classList.remove("removeDisplay");
        });
      };
      const addCancelEditEvent = (btn, topicName) => {
        btn.addEventListener("click", () => {
          let topicInfo = document.getElementById(`${topicName.replaceAll(' ','-')}`);
          let form = document.getElementById(`edit${topicName.replaceAll(' ','-')}`);
          topicInfo.classList.remove("removeDisplay");
          form.classList.add("removeDisplay");
        });
      };
      const setDescriptionOnEditForm = (textArea, text) => {
        textArea.textContent = text.trim();
      };
    
      for (let i = 0; i < topics.length; i++) {
        addEditEvent(
          document.getElementById(`btnEdit${topics[i].textContent.replaceAll(' ','-')}`),
          topics[i].textContent,
          i
        );
        addCancelEditEvent(
          document.getElementById(`btnCancelEdit${topics[i].textContent.replaceAll(' ','-')}`),
          topics[i].textContent,
          i
        );
        setDescriptionOnEditForm(
          document.getElementById(`${topics[i].textContent.replaceAll(' ','-')}DescriptionInput`),
          document.getElementById(`${topics[i].textContent.replaceAll(' ','-')}Description`).textContent
        );
      }
  }
  const deleteTopicHandler = async (e) => {
    e.preventDefault();
    toggleBackdrop(true, '#fff', '10%');
    toggleModal(true, 'Deleting topics...');
    const id = e.target.parentElement.getAttribute('id').substring(14);
    const fetchId = document.querySelector(`#${id} p#topicNameTitle`).textContent.replaceAll(' ','-');
    try {
      const result = await fetch(`${API_PATH}/topics/${USERNAME}/${fetchId.replaceAll(' ','-')}`,{
        method:'DELETE'
      });
      const data = await result.json();
      if (data.response === 'success') {
        e.target.parentElement.parentElement.parentElement.parentElement.remove();
      }
      flashBanner(data.response,data.message,REFERENCE_NODE);
    } catch (err) {
      console.error(`Error deleting topic: ${err.message}`);
    }
    toggleBackdrop(false);
    toggleModal(false);
  }
  const addDeleteTopicEvents = () => {
    const topics = document.getElementsByClassName('deleteTopic');
    for (const topic of topics) {
      topic.addEventListener('click',deleteTopicHandler);
    }
  }
  const saveEditHandler = async (e) => {
    e.preventDefault();
    toggleBackdrop(true, '#fff', '10%');
    toggleModal(true, 'Editing topic...');
    try {
      const form = e.target.parentElement.parentElement.parentElement;
      const id = document.querySelector(`#${form.getAttribute('id').substring(8)}`).getAttribute('id');
      const fetchId = document.querySelector(`#${id} p#topicNameTitle`).textContent.replaceAll(' ','-');
      
      const submitForm = new FormData(form);

      let body = {};
      submitForm.forEach((v,k)=>{
        body[k] = v;
      });

      const result = await fetch(`${API_PATH}/topics/${USERNAME}/${fetchId}`,{
        method:'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify(body)
      });
      const data = await result.json();
      
      if (data.response === 'success') {
        try {
          const newTitle = document.querySelector(`#editForm${id} > input[name="name"]`).value;
          document.querySelector(`#${id} p#topicNameTitle`).textContent = newTitle;
          document.querySelector(`#${id} p.topicDifficulty`).textContent = document.querySelector(`#editForm${id} > .editDifficultyContainer > select`).value;
          document.getElementById(`${id}Description`).textContent = document.querySelector(`#editForm${id} > textArea`).value;
          document.querySelector(`#editForm${id} > input[name="name"]`).setAttribute('placeholder',newTitle);
          document.querySelector(`#${id.replaceAll(' ','-')} > a`).setAttribute('href',`${API_PATH}/user/${USERNAME}/dashboard/${newTitle.replaceAll(' ','-')}`);
          document.getElementById(`btnSelect${fetchId}`).setAttribute('id',`btnSelect${newTitle.replaceAll(' ','-')}`);
        } catch (err) {
          console.error(`Topic updated but error updating screen: ${err.message}`);
        }
      }
      flashBanner(data.response,data.message,REFERENCE_NODE)
    } catch(err) {
      console.error(`Error editing topic: ${err.message}`);
    }
    toggleBackdrop(false);
    toggleModal(false);
  }
  const addSaveEditEvents = () => {
    const saveTopicButtons = document.getElementsByClassName('editTopic');
    for (const button of saveTopicButtons) {
      button.addEventListener('click',saveEditHandler);
    }
  }
  const init = () => {
    topics = document.getElementsByClassName("topicName");
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.newTopicFormContainer').classList.toggle('displayNone');

    document.getElementById("btnCreateTopicForm").addEventListener("click", toggleNewTopicForm);
    document.querySelector('.btnCancelNewTopic').addEventListener("click", toggleNewTopicForm);

    document.getElementById('btnSelectAllTopics').addEventListener('click', toggleSelectAllTopics);

    document.getElementById('btnDeleteSelected').addEventListener('click', deleteSelectedTopics);

    addCreateTopicEvent();
    addTopicSelectEvents();
    topicImageEvent();
    addTopicAddAndEditEvents();
    addDeleteTopicEvents();
    addSaveEditEvents();
  };
  init();