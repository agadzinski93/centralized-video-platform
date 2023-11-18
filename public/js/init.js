/**
 * Change focus to first element in main content upon clicking or entering Skip Link
 */
const focusMainContent = () => {
    const skipLink = document.querySelector('.skip-to-main-content');
    const skipToMainContentEvent = (e) => {
        if (e.type === 'click' || (e.type === 'keypress' && e.key === 'enter')) {
            setTimeout(()=>{
                const firstLink = document.querySelector('#main a');
                const firstInput = document.querySelector('#main input');
                const firstButton = document.querySelector('#main button');
                if (firstLink) {
                    if (firstInput) {
                        if (firstButton) {
                            if (firstLink.compareDocumentPosition(firstInput) & Node.DOCUMENT_POSITION_FOLLOWING) {
                                if (firstLink.compareDocumentPosition(firstButton)) {
                                    firstLink.focus({focusVisible:true});
                                }
                                else {
                                    firstButton.focus({focusVisible:true});
                                }
                            }
                            else {
                                if (firstInput.compareDocumentPosition(firstButton) & Node.DOCUMENT_POSITION_FOLLOWING) {
                                    firstInput.focus({focusVisible:true});
                                }
                                else {
                                    firstButton.focus({focusVisible:true});
                                }
                            }
                        }
                        else {
                            if (firstLink.compareDocumentPosition(firstInput) & Node.DOCUMENT_POSITION_FOLLOWING) {
                                firstLink.focus({focusVisible:true});
                            }
                            else {
                                firstInput.focus({focusVisible:true});
                            }
                        }
                    }
                    else if (firstButton) {
                        if (firstLink.compareDocumentPosition(firstButton) & Node.DOCUMENT_POSITION_FOLLOWING) {
                            firstLink.focus({focusVisible:true});
                        }
                        else {
                            firstButton.focus({focusVisible:true});
                        }
                    }
                    else {
                        firstLink.focus({focusVisible:true});
                    }
                }
                else if (firstInput) {
                    if (firstButton) {
                        if (firstInput.compareDocumentPosition(firstButton) & Node.DOCUMENT_POSITION_FOLLOWING) {
                            firstInput.focus({focusVisible:true});
                        }
                        else {
                            firstButton.focus({focusVisible:true});
                        }
                    }
                    else {
                        firstInput.focus({focusVisible:true});
                    }
                }
                else {
                    if (firstButton) {
                        firstButton.focus({focusVisible:true});
                    }
                }
                
            },50);
        }
    }
    skipLink.addEventListener('click',skipToMainContentEvent);
    skipLink.addEventListener('keypress',skipToMainContentEvent);
}

;(function init() {
    focusMainContent();
  })();