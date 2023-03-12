//Globals Required: Username
const toggleDisplayDeleteModal = (enable = false) => {
    let modalDeleteAccount = document.querySelector('.modalDeleteAccount');
    if (enable) {
        modalDeleteAccount.classList.remove('displayNone');
    }
    else {
        modalDeleteAccount.classList.add('displayNone');
    }
}
const toggleEditProfilePicForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.getElementById('editProfilePicContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
}
const toggleEditBannerForm = () => {
    document.querySelector('.backdrop').classList.toggle('displayNone');
    document.getElementById('editBannerContainer').classList.toggle('displayNone');
    document.querySelector('body').classList.toggle('overflowHidden');
}
const toggleSettingSelected = (btn) => {
    btn.classList.toggle('btnSettingSelected');
};
const setSettingsButtonEvents = () => {
    document.getElementById('btnRefreshTitle').addEventListener('click', async (e) => {
        let result;
        let currentlyChecked = (e.target.classList.contains('btnSettingSelected')) ? '0' : '1';
        try {
            result = await fetch(`/user/${USERNAME}/settings/updateRefreshMetadata`,{
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
            result = await fetch(`/user/${USERNAME}/settings/updateRefreshMetadata`,{
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
            result = await fetch(`/user/${USERNAME}/settings/updateRefreshMetadata`,{
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
    document.getElementById('btnEditProfilePic').addEventListener('click',()=>{
        document.querySelector('body').classList.add('overflowHidden');
        document.getElementById('editProfilePicContainer').classList.remove('displayNone');
        toggleBackdrop(true);
    });
    document.getElementById('btnCancelEditProfilePic').addEventListener('click',()=>{
        document.querySelector('body').classList.remove('overflowHidden');
        document.getElementById('editProfilePicContainer').classList.add('displayNone');
        toggleBackdrop();
    });
    //File Upload Effect for Profile Pic
    const profilePicEvent = () => {
        document.getElementById('btnProfilePicUpload').addEventListener('change', function() {
        
        if (this.files[0].type.includes('image')) {
            document.getElementById('profilePicSelected').textContent = this.files[0].name;
        let reader = new FileReader();
        reader.onload = (e) => {
            let img = document.querySelector('#lblProfilePicUpload img');
            img.src = e.target.result;
            img.classList.remove('displayNone');
            document.querySelector('#lblProfilePicUpload div').classList.add('displayNone');
        }
        reader.readAsDataURL(this.files[0]);
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
            let result = await fetch(`/user/${USERNAME}/settings/updateProfilePic`, {
                method:'PATCH',
                body: formData,
            });
            let data = await result.json();
            
            toggleBackdrop(false);
            toggleModal(false);
            if (Object.keys(data).includes('error')) {
                flashBanner('error', `${data.error}`, FLASH_REFERENCE);
            }
            else {
                flashBanner('success', 'Successfully updated profile picture.', FLASH_REFERENCE);
                document.querySelector('.settingsProfilePic').style.backgroundImage = `url('${data.path}')`;
                document.getElementById('editProfilePicImage').style.backgroundImage = `url('${data.path}')`;
                document.getElementById('avatar').style.backgroundImage = `url('${data.path}')`;
                document.getElementById('btnProfilePicUpload').value = null;
                document.getElementById('streamedProfilePic').classList.add('displayNone');
                document.querySelector('#lblProfilePicUpload div').classList.remove('displayNone');
                document.getElementById('profilePicSelected').textContent = 'No file selected.';
                document.getElementById('btnDeleteProfilePic').classList.remove('displayNone');
            }
        });
    }
    updateProfilePicEvent();
    const deleteProfilePicEvent = () => {
        const btnDeleteprofilePic = document.getElementById('btnDeleteProfilePic');
        btnDeleteprofilePic.addEventListener('click', async () => {
            toggleBackdrop(true, '#fff', '10%');
            toggleModal(true, 'Deleting profile pic...');

            let result = await fetch(`/user/${USERNAME}/settings/updateProfilePic`,{
                method:'DELETE'
            });
            let data = await result.json();

            toggleBackdrop(false);
            toggleModal(false);
            if (Object.keys(data).includes('error')) {
                flashBanner('error', `${data.error}`, FLASH_REFERENCE);
            }
            else {
                flashBanner('success', 'Successfully deleted profile picture.', FLASH_REFERENCE);
                document.querySelector('.settingsProfilePic').style.backgroundImage = `url('${data.image.path}')`;
                document.getElementById('editProfilePicImage').style.backgroundImage = `url('${data.image.path}')`;
                document.getElementById('avatar').style.backgroundImage = `url('${data.image.path}')`;
                document.getElementById('btnProfilePicUpload').value = null;
                document.getElementById('profilePicSelected').textContent = 'No file selected.';
                document.getElementById('btnDeleteProfilePic').classList.add('displayNone');
            }
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
    });
    //Confirm Display Name Button
    document.getElementById('btnConfirmEditDisplayName').addEventListener('click',async () => {
        let txtDN =  document.getElementById('txtDisplayName');
        let txtDisplayName = txtDN.value;
        if (txtDisplayName.length >= 3 && txtDisplayName.length <= 24) {
            let result = await fetch(`/user/${USERNAME}/settings/updateDisplayName`,{
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
    });
    //Email Validator
    const validateEmail = (e) => {
    const input = e.target.value;
    if (input.length < 3 || input.length > 45 || !input.includes('@')) {
        e.target.classList.add('errorBorder');
        document.getElementById('errorEmail').classList.remove('displayNone');
    }
    else {
        e.target.classList.remove('errorBorder');
        document.getElementById('errorEmail').classList.add('displayNone');
    }
   }
    //Edit Email Button
    document.getElementById('btnEditEmail').addEventListener('click',() => {
        document.getElementById('displayEmailContainer').classList.add('displayNone');
        document.getElementById('editDisplayEmailContainer').classList.remove('displayNone');
        document.getElementById('txtEmail').addEventListener('input',validateEmail);
    });
    //Confirm Email Button
    document.getElementById('btnConfirmEditEmail').addEventListener('click',async() => {
        let txtE = document.getElementById('txtEmail')
        let txtEmail = txtE.value;
        if (txtEmail.length <= 45 && txtEmail.includes('@')) {
            let result = await fetch(`/user/${USERNAME}/settings/updateEmail`,{
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
                flashBanner('success', data.message, FLASH_REFERENCE);
                document.getElementById('email').textContent = txtEmail;
                document.getElementById('editDisplayEmailContainer').classList.add('displayNone');
                document.getElementById('displayEmailContainer').classList.remove('displayNone');
                document.getElementById('txtEmail').removeEventListener('input',validateEmail);
                txtE.setAttribute('placeholder',txtEmail);
            }
            else if (data.response === 'error') {
                flashBanner('error', data.message, FLASH_REFERENCE);
            }
        }
    });
    //Cancel Email Button
    document.getElementById('btnCancelEditEmail').addEventListener('click',() => {
        document.getElementById('editDisplayEmailContainer').classList.add('displayNone');
        document.getElementById('displayEmailContainer').classList.remove('displayNone');
        document.getElementById('txtEmail').removeEventListener('input',validateEmail);
    });
    //Banner Code
    document.getElementById('btnEditBanner').addEventListener('click',()=>{
        document.querySelector('body').classList.add('overflowHidden');
        document.getElementById('editBannerContainer').classList.remove('displayNone');
        toggleBackdrop(true);
    });
    document.getElementById('btnCancelEditBanner').addEventListener('click',()=>{
        document.querySelector('body').classList.remove('overflowHidden');
        document.getElementById('editBannerContainer').classList.add('displayNone');
        toggleBackdrop();
    });
    //File Upload Effect for Banner
    const bannerPicEvent = () => {
        document.getElementById('btnBannerUpload').addEventListener('change', function() {
        
        if (this.files[0].type.includes('image')) {
            document.getElementById('bannerSelected').textContent = this.files[0].name;
        let reader = new FileReader();
        reader.onload = (e) => {
            let img = document.querySelector('#lblBannerUpload img');
            img.src = e.target.result;
            img.classList.remove('displayNone');
            document.querySelector('#lblBannerUpload div').classList.add('displayNone');
        }
        reader.readAsDataURL(this.files[0]);
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
            let result = await fetch(`/user/${USERNAME}/settings/updateBanner`, {
                method:'PATCH',
                body: formData,
            });
            let data = await result.json();
            
            toggleBackdrop(false);
            toggleModal(false);
            if (Object.keys(data).includes('error')) {
                flashBanner('error', `${data.error}`, FLASH_REFERENCE);
            }
            else {
                flashBanner('success', 'Successfully updated banner.', FLASH_REFERENCE);
                document.querySelector('.channelBannerPreview').style.backgroundImage = `url('${data.path}')`;
                document.getElementById('btnBannerUpload').value = null;
                document.getElementById('streamedBanner').classList.add('displayNone');
                document.querySelector('#lblBannerUpload div').classList.remove('displayNone');
                document.getElementById('bannerSelected').textContent = 'No file selected.';
                document.getElementById('btnDeleteBanner').classList.remove('displayNone');
            }
        });
    }
    updateBannerEvent();
    const deleteBannerEvent = () => {
        const btnDeleteBanner = document.getElementById('btnDeleteBanner').addEventListener('click', async () => {
            toggleBackdrop(true, '#fff', '10%');
            toggleModal(true, 'Deleting Banner...');

            let result = await fetch(`/user/${USERNAME}/settings/deleteBanner`,{
                method:'DELETE',
                headers:{
                    'Content-Type':'application/json'
                }
            });
            let data = await result.json();
            
            toggleBackdrop(false);
            toggleModal(false);
            if (Object.keys(data).includes('error')) {
                flashBanner('error', `${data.error}`, FLASH_REFERENCE);
            } else {
                flashBanner('success', 'Successfully deleted banner.', FLASH_REFERENCE);
                document.getElementById('btnDeleteBanner').classList.add('displayNone');
                document.querySelector('.channelBannerPreview').style.backgroundImage = `url('')`;
            }
        })
    }
    deleteBannerEvent();
}
const addDeleteAccountEvent = () => {
    let btnDeleteAcct = document.getElementById('deleteAccountButton');
    btnDeleteAcct.addEventListener('click', (e) => {
        toggleBackdrop(true, '#000', '50%');
        toggleDisplayDeleteModal(true);
    });

    let btnCancelDeleteAcct = document.getElementById('btnCancelDeleteAcct');
    btnCancelDeleteAcct.addEventListener('click', (e) => {
        toggleBackdrop(false);
        toggleDisplayDeleteModal(false);
    });
}
const init = () => {
    setSettingsButtonEvents();
    addBasicInfoEvents();
    addDeleteAccountEvent();
};
init();