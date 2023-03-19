//Globals Required:UserId and AuthorId
const addSubscribeEvents = () => {
    const btnSubscribe = document.getElementById('btnSubscribe');
    const btnUnsubscribe = document.getElementById('btnUnsubscribe');
    btnSubscribe.addEventListener('click',async()=>{
        toggleBackgroundLoading(true,btnSubscribe,true);
        let result = await fetch("/subscribe",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                user_id:USER_ID,
                author_id:AUTHOR_ID
            })
        });
        let data = await result.json();
        toggleBackgroundLoading(false,btnSubscribe,false,'Subscribe');
        if (data.response === 'success') {
            btnSubscribe.classList.add('displayNone');
            btnUnsubscribe.classList.remove('displayNone');
        } else {
            flashBanner('error',data.message,FLASH_REFERENCE);
        }
    });
    btnUnsubscribe.addEventListener('click',async()=>{
        toggleBackgroundLoading(true,btnUnsubscribe,true);
        let result = await fetch("/subscribe",{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                user_id:USER_ID,
                author_id:AUTHOR_ID
            })
        });
        let data = await result.json();
        toggleBackgroundLoading(false,btnUnsubscribe,false,'Unsubscribe');
        if (data.response === 'success') {
            btnUnsubscribe.classList.add('displayNone');
            btnSubscribe.classList.remove('displayNone');
        } else {
            flashBanner('error',data.message,FLASH_REFERENCE);
        }
    });
}
const init = () => {
    document.getElementById('selectedVideo').scrollIntoView(true);
    addSubscribeEvents();
  }
  init();