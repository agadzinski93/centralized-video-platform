//Globals Required: Username
let topics;
const toggleNewTopicForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.newTopicFormContainer').classList.toggle('displayNone');
    document.querySelector('html').classList.toggle('overflowHidden');
  };
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
    let selectedTopics = document.querySelectorAll('.dashboardTopicWrapperSelected');
    if (selectedTopics.length > 0) {
      try {
        let topicsToDelete = new Array();
        for (let i = 0;i < selectedTopics.length; i++) {
          topicsToDelete.push(selectedTopics[i].getAttribute('id').replaceAll(' ','-'));
        }
        await fetch(`/topics/${USERNAME}/deleteSelected`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'},
          body: JSON.stringify({
            topics: topicsToDelete
          }),
        });
        for (let i = 0;i < selectedTopics.length; i++) {
          selectedTopics[i].remove();
        }
        let itemsSelected = document.getElementById('itemsSelected');
        itemsSelected.classList.remove('itemsSelected');
        itemsSelected.textContent = ``;
        document.getElementById('btnDeleteSelected').classList.remove('deleteSelected');
        document.getElementById('btnSelectAllTopics').classList.remove('selectedAll');
      } catch {
      };
    }
  };
  const addTopicSelectEvents = () => {
    for (let i = 0;i < topics.length; i++) {
      document.getElementById(`btnSelect${topics[i].textContent.replaceAll(' ','-')}`).addEventListener("click", (e) => {
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
              document.getElementById(`${topics[k].textContent.replaceAll(' ','-')}`).classList.remove('dashboardTopicWrapperSelected');
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
              document.getElementById(`${topics[k].textContent.replaceAll(' ','-')}`).classList.add('dashboardTopicWrapperSelected');
            }
          }
        }
        else {
          document.getElementById(`btnSelect${topics[i].textContent.replaceAll(' ','-')}`).classList.toggle('btnSelectTopicSelected');
          document.getElementById(`${topics[i].textContent.replaceAll(' ','-')}`).classList.toggle('dashboardTopicWrapperSelected');
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
      });
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
  const init = () => {
    topics = document.getElementsByClassName("topicName");

    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.newTopicFormContainer').classList.toggle('displayNone');

    document.getElementById("btnCreateTopicForm").addEventListener("click", toggleNewTopicForm);
    document.querySelector('.btnCancelNewTopic').addEventListener("click", toggleNewTopicForm);

    document.getElementById('btnSelectAllTopics').addEventListener('click', toggleSelectAllTopics);

    document.getElementById('btnDeleteSelected').addEventListener('click', deleteSelectedTopics);

    addTopicSelectEvents();
    topicImageEvent();
    addTopicAddAndEditEvents();
  };
  init();