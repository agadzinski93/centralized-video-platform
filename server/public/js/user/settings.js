//Globals Required: Username
let MODAL_TARGET = null;
/**
  * Close modal when clicking anywhere off the modal
  * @param {object} e event object
*/
const clickOffEvent = function(target) {
  return function(e) {
    switch (target) {
      case 'EDIT_PROFILE_PIC':
        toggleEditProfilePicForm();
        break;
      case 'EDIT_BANNER_PIC':
        toggleEditBannerForm();
        break;
      case 'DELETE_ACCOUNT':
        toggleDisplayDeleteModal();
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
const toggleDisplayDeleteModal = (enable = false) => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.querySelector('.modalDeleteAccount').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
    addRemoveModalEvent('DELETE_ACCOUNT');
}
const toggleEditProfilePicForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.getElementById('editProfilePicContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
    addRemoveModalEvent('EDIT_PROFILE_PIC');
}
const toggleEditBannerForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.getElementById('editBannerContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
    addRemoveModalEvent('EDIT_BANNER_PIC');
}
const toggleSettingSelected = (btn) => {
    btn.classList.toggle('btnSettingSelected');
};
const setSettingsButtonEvents = () => {
    document.getElementById('btnRefreshTitle').addEventListener('click', async (e) => {
        let result;
        let currentlyChecked = (e.target.classList.contains('btnSettingSelected')) ? '0' : '1';
        try {
            result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateRefreshMetadata`,{
                method:'PATCH',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(
                    {
                        setting: 'Title',
                        value:currentlyChecked,
                    }
                )
            });
            toggleSettingSelected(e.target);
        } catch(err) {
            result = err;
        }
        const data = await result.json();
    });
    document.getElementById('btnRefreshDescription').addEventListener('click', async (e) => {
        let result;
        let currentlyChecked = (e.target.classList.contains('btnSettingSelected')) ? '0' : '1';
        try {
            result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateRefreshMetadata`,{
                method:'PATCH',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(
                    {
                        setting: 'Description',
                        value:currentlyChecked,
                    }
                )
            });
            toggleSettingSelected(e.target);
        } catch(err) {
            result = err;
        }
        const data = await result.json();
    });
    document.getElementById('btnRefreshThumbnail').addEventListener('click', async (e) => {
        let result;
        let currentlyChecked = (e.target.classList.contains('btnSettingSelected')) ? '0' : '1';
        try {
            result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateRefreshMetadata`,{
                method:'PATCH',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(
                    {
                        setting: 'Thumbnail',
                        value:currentlyChecked,
                    }
                )
            });
            toggleSettingSelected(e.target);
        } catch(err) {
            result = err;
        }
        const data = await result.json();
    });
};
const addBasicInfoEvents = () => {
    //Profile Pic Code
    document.getElementById('btnEditProfilePic').addEventListener('click',toggleEditProfilePicForm);
    document.getElementById('btnCancelEditProfilePic').addEventListener('click',toggleEditProfilePicForm);
    //File Upload Effect for Profile Pic
    const profilePicEvent = () => {
        document.getElementById('btnProfilePicUpload').addEventListener('change', function() {
        
        if (this.files[0].type.includes('image')) {
            document.getElementById('profilePicSelected').textContent = this.files[0].name;
            let reader = new FileReader();
            reader.onload = (e) => {
            let img = document.createElement('img');
            img.classList.add('streamedTopicImg');
            img.setAttribute('id','streamedProfilePic');
            img.src = e.target.result;
            const prevImg = document.querySelector('#lblProfilePicUpload img');
            if (prevImg) prevImg.remove();
            document.getElementById('lblProfilePicUpload').append(img);
            document.querySelector('#lblProfilePicUpload span').classList.add('displayNone');
        }
        reader.readAsDataURL(this.files[0]);
        }
        });

        document.getElementById('lblProfilePicUpload').addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          });
          document.getElementById('lblProfilePicUpload').addEventListener('dragenter', (e) => {
            if (e.dataTransfer.items[0].kind === 'file') {
              document.getElementById('lblProfilePicUpload').style.border = 'solid 1px blue';
            }
          });
          document.getElementById('lblProfilePicUpload').addEventListener('dragleave', (e) => {
            document.getElementById('lblProfilePicUpload').style.border = '';
          });
          document.getElementById('lblProfilePicUpload').addEventListener('drop', (e) => {
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
                    const prevImg = document.querySelector('#lblProfilePicUpload img');
                    if (prevImg) prevImg.remove();
                    document.getElementById('lblProfilePicUpload').append(img);
                    document.querySelector('#lblProfilePicUpload span').classList.add('displayNone');
                    document.getElementById('fileSelected').textContent = files[i].name;
                    document.getElementById('btnFileUpload').files = files;
                  }
                  reader.readAsDataURL(files[i]);
                }
              }
            }
          });
    }
    profilePicEvent();
    const updateProfilePicEvent = () => {
        const btnUpdateProfilePic = document.getElementById('btnUpdateProfilePic');
        btnUpdateProfilePic.addEventListener('click',async () => {
            toggleEditProfilePicForm();
            toggleBackdrop(true, '#fff', '10%');
            toggleModal(true, 'Updating profile pic...');
            const form = document.getElementById('editProfilePicForm');
            const formData = new FormData(form);
            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateProfilePic`, {
                method:'PATCH',
                body: formData,
            });
            let data = await result.json();
            toggleBackdrop(false);
            toggleModal(false);
            if (data.response === 'success'){
                document.querySelector('.settingsProfilePic').style.backgroundImage = `url('${data.data.path}')`;
                document.getElementById('editProfilePicImage').style.backgroundImage = `url('${data.data.path}')`;
                document.querySelector('.avatar').style.backgroundImage = `url('${data.data.path}')`;
                document.getElementById('btnProfilePicUpload').value = null;
                document.getElementById('streamedProfilePic').classList.add('displayNone');
                document.querySelector('#lblProfilePicUpload span').classList.remove('displayNone');
                document.getElementById('profilePicSelected').textContent = 'No file selected.';
                document.getElementById('btnDeleteProfilePic').classList.remove('displayNone');
            }
            flashBanner(data.response, data.message, FLASH_REFERENCE);
        });
    }
    updateProfilePicEvent();
    const deleteProfilePicEvent = () => {
        const btnDeleteprofilePic = document.getElementById('btnDeleteProfilePic');
        btnDeleteprofilePic.addEventListener('click', async () => {
            toggleBackdrop(true, '#fff', '10%');
            toggleModal(true, 'Deleting profile pic...');

            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateProfilePic`,{
                method:'DELETE'
            });
            let data = await result.json();

            toggleBackdrop(false);
            toggleModal(false);
            if (data.response === 'success') {
                document.querySelector('.settingsProfilePic').style.backgroundImage = `url('${data.data.image.path}')`;
                document.getElementById('editProfilePicImage').style.backgroundImage = `url('${data.data.image.path}')`;
                document.querySelector('.avatar').style.backgroundImage = `url('${data.data.image.path}')`;
                document.getElementById('btnProfilePicUpload').value = null;
                document.getElementById('profilePicSelected').textContent = 'No file selected.';
                document.getElementById('btnDeleteProfilePic').classList.add('displayNone');
            }
            flashBanner(data.response, data.message, FLASH_REFERENCE);
        });
    }
    deleteProfilePicEvent();
    //Display Name Validator
   const validateDisplayName = (e) => {
    const input = e.target.value;
    if (input.length < 3 || input.length > 24) {
        e.target.classList.add('errorBorder');
        document.getElementById('errorDisplayName').classList.remove('displayNone');
    }
    else {
        e.target.classList.remove('errorBorder');
        document.getElementById('errorDisplayName').classList.add('displayNone');
    }
   }
    //Edit Display Name Button
    document.getElementById('btnEditDisplayName').addEventListener('click',() => {
        document.getElementById('displayNameContainer').classList.add('displayNone');
        document.getElementById('editDisplayNameContainer').classList.remove('displayNone');
        document.getElementById('txtDisplayName').addEventListener('input',validateDisplayName);
        document.getElementById('btnEditDisplayName').classList.add('displayNone');
    });
    //Confirm Display Name Button
    document.getElementById('btnConfirmEditDisplayName').addEventListener('click',async () => {
        let txtDN =  document.getElementById('txtDisplayName');
        let txtDisplayName = txtDN.value;
        if (txtDisplayName.length >= 3 && txtDisplayName.length <= 24) {
            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateDisplayName`,{
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    displayName:txtDisplayName
                })
            });
            let data = await result.json();
            if (data.response === 'success') {
                flashBanner('success', data.message, FLASH_REFERENCE);
                if (document.getElementById('noDisplayName') != null) {
                    document.getElementById('noDisplayName').remove();
                }
                document.getElementById('displayName').textContent = txtDisplayName;
                document.getElementById('editDisplayNameContainer').classList.add('displayNone');
                document.getElementById('displayNameContainer').classList.remove('displayNone');
                document.getElementById('txtDisplayName').removeEventListener('input',validateDisplayName);
                txtDN.setAttribute('placeholder', txtDisplayName);
                document.getElementById('btnEditDisplayName').classList.remove('displayNone');
            }
            else if (data.response === 'error') {
                flashBanner('error', data.message, FLASH_REFERENCE);
            }
        }
    });
    //Cancel Display Name Button
    document.getElementById('btnCancelEditDisplayName').addEventListener('click', ()=> {
        document.getElementById('editDisplayNameContainer').classList.add('displayNone');
        document.getElementById('displayNameContainer').classList.remove('displayNone');
        document.getElementById('txtDisplayName').removeEventListener('input',validateDisplayName);
        document.getElementById('btnEditDisplayName').classList.remove('displayNone');
    });
    /**
     * Validate Email
     * @param {object} e Event object - Set to null if not used
     * @param {object} inputField - If event object is not a text input or null, use this arg instead
     * @returns bool Validation success
     */
    const validateEmail = (e, inputField) => {
        const input = e ? e.target.value : inputField.value;
        const indexOfAt = input.indexOf('@');
        const indexOfDot = input.indexOf('.',indexOfAt);
        if (input.length < 3 || input.length > 45 || indexOfAt === -1 || indexOfDot === -1 || indexOfDot < indexOfAt + 2 || indexOfDot > input.length - 2) {
            if (e) {
                e.target.classList.add('errorBorder');
            }
            else {
                inputField.classList.add('errorBorder');
            }
            document.getElementById('errorEmail').classList.remove('displayNone');
        }
        else {
            if (e) {
                e.target.classList.remove('errorBorder');
            }
            else {
                inputField.classList.remove('errorBorder');
            }
            output = true;
            document.getElementById('errorEmail').classList.add('displayNone');
        }
        return output;
   }
    //Edit Email Button
    document.getElementById('btnEditEmail').addEventListener('click',() => {
        document.getElementById('displayEmailContainer').classList.add('displayNone');
        document.getElementById('editDisplayEmailContainer').classList.remove('displayNone');
        document.getElementById('txtEmail').addEventListener('input',validateEmail);
        document.getElementById('btnEditEmail').classList.add('displayNone');
    });
    //Confirm Email Button
    document.getElementById('btnConfirmEditEmail').addEventListener('click',async(e) => {
        let txtE = document.getElementById('txtEmail')
        let txtEmail = txtE.value;
        if (validateEmail(null,txtE)) {
            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateEmail`,{
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    email:txtEmail
                })
            });
            let data = await result.json();
            if (data.response === 'success') {
                document.getElementById('email').textContent = txtEmail;
                document.getElementById('editDisplayEmailContainer').classList.add('displayNone');
                document.getElementById('displayEmailContainer').classList.remove('displayNone');
                document.getElementById('txtEmail').removeEventListener('input',validateEmail);
                txtE.setAttribute('placeholder',txtEmail);
                document.getElementById('btnEditEmail').classList.remove('displayNone');
            }
            flashBanner(data.response, data.message, FLASH_REFERENCE);
        }
    });
    //Cancel Email Button
    document.getElementById('btnCancelEditEmail').addEventListener('click',() => {
        document.getElementById('editDisplayEmailContainer').classList.add('displayNone');
        document.getElementById('displayEmailContainer').classList.remove('displayNone');
        document.getElementById('txtEmail').removeEventListener('input',validateEmail);
        document.getElementById('btnEditEmail').classList.remove('displayNone');
    });
    //About Me
    document.getElementById('btnEditAboutMe').addEventListener("click",()=>{
        document.getElementById('aboutMeContainer').classList.add('displayNone');
        document.getElementById('editAboutMeContainer').classList.remove('displayNone');
        document.getElementById('btnEditAboutMe').classList.add('displayNone');
    });
    //Confirm About Me
    document.getElementById('btnConfirmEditAboutMe').addEventListener('click',async (e) => {
        let txtAboutMe = document.getElementById('aboutMe').value;
        if (txtAboutMe.length <= 1024) {
            toggleBackdrop(true,'#FFF','10%');
            toggleModal('Updating your \'About Me\'...');
            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateAboutMe`,{
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    txtAboutMe
                })
            });
            let data = await result.json();
            toggleBackdrop(false);
            toggleModal(false);
            if(data.response === 'success') {
                let aboutMe = document.getElementById('txtAboutMe');
                if (data.data.aboutMe === "") {
                    aboutMe.classList.add('noDisplayName');
                    aboutMe.classList.remove('aboutMeContainer');
                    aboutMe.textContent = 'None';
                }
                else {
                    aboutMe.classList.remove('noDisplayName');
                    aboutMe.classList.add('aboutMeContainer');
                    aboutMe.textContent = data.data.aboutMe;
                }
                document.getElementById('aboutMeContainer').classList.remove('displayNone');
                document.getElementById('editAboutMeContainer').classList.add('displayNone');
                document.getElementById('btnEditAboutMe').classList.remove('displayNone');
            }
            flashBanner(data.response, data.message, FLASH_REFERENCE);
        }
    });
    //Cancel About Me
    document.getElementById('btnCancelEditAboutMe').addEventListener('click',()=>{
        document.getElementById('aboutMeContainer').classList.remove('displayNone');
        document.getElementById('editAboutMeContainer').classList.add('displayNone');
        document.getElementById('btnEditAboutMe').classList.remove('displayNone');
    });
    //Banner Code
    document.getElementById('btnEditBanner').addEventListener('click',toggleEditBannerForm);
    document.getElementById('btnCancelEditBanner').addEventListener('click',toggleEditBannerForm);
    //File Upload Effect for Banner
    const bannerPicEvent = () => {
        document.getElementById('btnBannerUpload').addEventListener('change', function() {
        
        if (this.files[0].type.includes('image')) {
            document.getElementById('bannerSelected').textContent = this.files[0].name;
        let reader = new FileReader();
        reader.onload = (e) => {
            let img = document.createElement('img');
            img.classList.add('streamedTopicImg');
            img.setAttribute('id','streamedBanner');
            img.src = e.target.result;
            const prevImg = document.querySelector('#lblBannerUpload img');
            if (prevImg) prevImg.remove();
            document.getElementById('lblBannerUpload').append(img);
            document.querySelector('#lblBannerUpload span').classList.add('displayNone');
        }
        reader.readAsDataURL(this.files[0]);
        }
        });

        document.getElementById('lblBannerUpload').addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          });
          document.getElementById('lblBannerUpload').addEventListener('dragenter', (e) => {
            if (e.dataTransfer.items[0].kind === 'file') {
              document.getElementById('lblBannerUpload').style.border = 'solid 1px blue';
            }
          });
          document.getElementById('lblBannerUpload').addEventListener('dragleave', (e) => {
            document.getElementById('lblBannerUpload').style.border = '';
          });
          document.getElementById('lblBannerUpload').addEventListener('drop', (e) => {
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
                    const prevImg = document.querySelector('#lblBannerUpload img');
                    if (prevImg) prevImg.remove();
                    document.getElementById('lblBannerUpload').append(img);
                    document.querySelector('#lblBannerUpload span').classList.add('displayNone');
                    document.getElementById('fileSelected').textContent = files[i].name;
                    document.getElementById('btnBannerUpload').files = files;
                  }
                  reader.readAsDataURL(files[i]);
                }
              }
            }
          });
    }
    bannerPicEvent();
    const updateBannerEvent = () => {
        const btnUpdateBanner = document.getElementById('btnUpdateBanner');
        btnUpdateBanner.addEventListener('click',async () => {
            toggleEditBannerForm();
            toggleBackdrop(true, '#fff', '10%');
            toggleModal(true, 'Updating Banner...');
            
            const form = document.getElementById('editBannerForm');
            const formData = new FormData(form);
            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateBanner`, {
                method:'PATCH',
                body: formData,
            });
            let data = await result.json();
            
            toggleBackdrop(false);
            toggleModal(false);
            if (data.response === 'success') {
                document.querySelector('.channelBannerPreview').style.backgroundImage = `url('${data.data.path}')`;
                document.getElementById('btnBannerUpload').value = null;
                document.getElementById('streamedBanner').classList.add('displayNone');
                document.querySelector('#lblBannerUpload span').classList.remove('displayNone');
                document.getElementById('bannerSelected').textContent = 'No file selected.';
                document.getElementById('btnDeleteBanner').classList.remove('displayNone');
            }
            flashBanner(data.response, data.message, FLASH_REFERENCE);
        });
    }
    updateBannerEvent();
    const deleteBannerEvent = () => {
        document.getElementById('btnDeleteBanner').addEventListener('click', async () => {
            toggleBackdrop(true, '#fff', '10%');
            toggleModal(true, 'Deleting Banner...');

            let result = await fetch(`${API_PATH}/user/${USERNAME}/settings/updateBanner`,{
                method:'DELETE',
                headers:{
                    'Content-Type':'application/json'
                }
            });
            let data = await result.json();
            
            toggleBackdrop(false);
            toggleModal(false);
            if (data.response === 'success') {
                document.getElementById('btnDeleteBanner').classList.add('displayNone');
                document.querySelector('.channelBannerPreview').style.backgroundImage = `url('')`;
            }
            flashBanner(data.response, data.message, FLASH_REFERENCE);
        })
    }
    deleteBannerEvent();
}
const deleteAccount = async (e) => {
    e.preventDefault();
    try {
        let result = await fetch(`${API_PATH}/user/${USERNAME}`,{
            method: 'DELETE'
        });
        result = await result.json();
        if (result.response === 'success') {
            result = await fetch(`${API_PATH}/auth/logoutUser`,{
                method: 'POST'
            });
            result = await result.json();
            if (result.response === 'success') {
                window.location.href = `${API_PATH}/`;
            } else {
                console.error(result.message);
            }
        } else {
            console.error(result.message);
        }
    } catch(err) {
        console.error(err.message);
    }
}
const addDeleteAccountEvent = () => {
    document.getElementById('deleteAccountButton').addEventListener('click', toggleDisplayDeleteModal);
    document.getElementById('btnCancelDeleteAcct').addEventListener('click', toggleDisplayDeleteModal);

    document.getElementById('btnDeleteAccount').addEventListener('click',deleteAccount);
}
const init = () => {
    setSettingsButtonEvents();
    addBasicInfoEvents();
    addDeleteAccountEvent();
};
init();