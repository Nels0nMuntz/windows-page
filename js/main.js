let modalWindows = [];
let modalState = {};
let deadline = '2020-09-15';


function createModal(modalSelector) {

    const modalWindow = document.querySelector(modalSelector);
    const messageBlock = modalWindow.querySelector('.popup-message');
    const scrollWidth = getScroll();

    function openModal() {
        modalWindow.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.body.style.marginRight = `${scrollWidth}px`
    }

    function closeModal() {
        modalWindow.style.display = 'none';
        document.body.style.overflow = '';
        document.body.style.marginRight = `0px`
    }

    function showMessage(message) {
        messageBlock.textContent = message;
    }

    function hideMessage() {
        messageBlock.textContent = '';
    }


    return {
        modalWindow,
        openModal,
        closeModal,
        showMessage,
        hideMessage,
    }
};
function modals(){


    function bindModal({triggerSelector, closeSelector, modalSelector, closeByOverlay = true}){
        const trigger = document.querySelectorAll(triggerSelector);
        let close = null;
        const modal = createModal(modalSelector);
        modalWindows.push(modal);

        if(closeSelector){
            close = document.querySelector(closeSelector);
        };

        trigger.forEach(item => {
            item.addEventListener('click', event => {   
                event.preventDefault();  
                modalWindows.forEach(item => {
                    item.closeModal();
                })   
                modal.openModal();
            })
        });

        if(close !== null){      
            close.addEventListener('click', event => {                
                if(event.target.closest(closeSelector)){
                    modal.closeModal();
                }
            })
        }

        modal.modalWindow.addEventListener('click', event => {
            if(closeByOverlay && event.target === modal.modalWindow){
                modal.closeModal();
            }
        })
    }

    modalData.forEach(item => {
        bindModal(item);
    })
};
function formsHandling(modalWindows) {
    const forms = document.querySelectorAll('.contact-form');
    const inputs = document.querySelectorAll('.contact-form input');

    const message = {
        loading: 'Загрузка...',
        success: 'Спасибо! Мы Вам скоро перезвоним.',
        postError: 'Ошибка',
        inputError: 'Не корректно введен номер телефона',
    }

    forms.forEach(item => {
        item.addEventListener('submit', event => {
            event.preventDefault();
            const submitButton = item.querySelector('button');
            const messageBlock = item.querySelector('.popup-message');
            const inputPhone = item.querySelector('input[name="user_phone"]');

            if (inputPhone.value.length == 19) {
                const formData = new FormData(item);
                if (Object.keys(modalState).length !== 0) {
                    for (let elem in modalState) {
                        formData.append(elem, modalState[elem])
                    }
                }

                postForm('server.php', formData, submitButton, messageBlock)
                    .then(response => {
                        console.log(response);
                        messageBlock.textContent = message.success;
                    })
                    .catch(error => {
                        console.log(error);
                        messageBlock.textContent = message.postError;
                    })
                    .finally(() => {
                        clearInputs();
                        modalState = {};
                        clearCalcModal();
                        setTimeout(() => {
                            submitButton.setAttribute('type', 'submit');
                            messageBlock.textContent = '';
                            modalWindows.forEach(item => {
                                item.closeModal();
                            })
                        }, 3000);
                    })
            } else {
                messageBlock.textContent = message.inputError;
            }
        })
    })

    async function postForm(uri, data, btn, messageBlock) {
        btn.setAttribute('type', 'button');
        messageBlock.textContent = message.loading;

        let response = await fetch(uri, {
            method: 'POST',
            body: data,
        })
        let text = response.text();
        return text;
    }

    function clearInputs() {
        inputs.forEach(item => {
            item.value = '';
        })
    }

    function clearCalcModal() {
        const inputWidth = document.querySelector('#width');
        const inputHeight = document.querySelector('#height');
        const windowProfile = document.querySelectorAll('input.checkbox');
        inputWidth.value = '';
        inputHeight.value = '';
        windowProfile.forEach(item => {
            item.checked = false;
        })
        
        
    }
};
function changeModalState() {
    const windowForm = document.querySelectorAll('.balcon_icons_img');
    const windowWidth = document.querySelectorAll('#width');
    const windowHeight = document.querySelectorAll('#height');
    const windowType = document.querySelectorAll('#view_type');
    const windowProfile = document.querySelectorAll('input.checkbox');
    const popupCalcButton = document.querySelectorAll('.popup_calc_button');
    const popupProfileButton = document.querySelectorAll('.popup_calc_profile_button');

    checkNumInputs('#width');
    checkNumInputs('#height');

    function bindActionToElems(element, eventName, propertyName) {
        element.forEach((item, index) => {
            item.addEventListener(eventName, event => {
                switch (item.nodeName) {
                    case 'SPAN':
                        modalState[propertyName] = index + 1;
                        break;
                    case 'INPUT':
                        if (item.getAttribute('type') === 'text') {
                            modalState[propertyName] = item.value;
                        }
                        else if (item.getAttribute('type') === 'checkbox') {
                            if (index == 0) {
                                modalState[propertyName] = 'cold';
                                element[0].cheked = true;
                                element[1].cheked = false;
                            }
                            else if (index == 1) {
                                modalState[propertyName] = 'warm';
                                element[1].cheked = true;
                                element[0].cheked = false;
                            }
                        };
                        break;
                    case 'SELECT':
                        modalState[propertyName] = item.value;
                        break;
                    case 'BUTTON':
                        if (event.target.classList.contains('popup_calc_button')) {
                            checkModal({
                                currentModalSelector: '.popup_calc',
                                nextModalSelector: '.popup_calc_profile',
                                closeSelector: '.popup_calc_profile_close',
                                properties: ['form', 'width', 'height'],
                            });
                        }
                        if (event.target.classList.contains('popup_calc_profile_button')) {
                            checkModal({
                                currentModalSelector: '.popup_calc_profile',
                                nextModalSelector: '.popup_calc_end',
                                closeSelector: '.popup_calc_end_close',
                                properties: ['type', 'profile'],
                            });
                        }
                    default:
                        break;
                }
                console.log(modalState);
            })
        })
    }

    bindActionToElems(windowForm, 'click', 'form');
    bindActionToElems(windowWidth, 'input', 'width');
    bindActionToElems(windowHeight, 'input', 'height');
    bindActionToElems(windowType, 'change', 'type');
    bindActionToElems(windowProfile, 'change', 'profile');

    bindActionToElems(popupCalcButton, 'click');
    bindActionToElems(popupProfileButton, 'click');

    function checkNumInputs(selector) {
        const numInputs = document.querySelectorAll(selector);

        numInputs.forEach(item => {
            item.addEventListener('input', () => {
                item.value = item.value.replace(/\D/, '');
            })
        })
    }

    function checkModal({ currentModalSelector, nextModalSelector, closeSelector, properties }) {
        modalWindows.forEach((item, index) => {
            if (item.modalWindow == event.target.closest(currentModalSelector)) {// получить индекс текущего окна

                if (properties.every(item => {
                    return modalState.hasOwnProperty(item);
                })) {
                    modalWindows[index].closeModal()
                    const modal = createModal(nextModalSelector);
                    modalWindows.push(modal);
                    modal.openModal();

                    const closeButtton = modal.modalWindow.querySelector(closeSelector);
                    closeButtton.addEventListener('click', () => {
                        modal.closeModal();
                    })
                } else {
                    modalWindows[index].showMessage('Выберите все параметры')
                    setTimeout(() => {
                        modalWindows[index].hideMessage();
                    }, 3000);
                }
            }
        })
    }
};
const modalData = [
    {
        triggerSelector: ".popup_engineer_btn",
        closeSelector: ".popup_engineer button.popup_close",
        modalSelector: ".popup_engineer",
    },
    {
        triggerSelector: ".header-callback__link",
        closeSelector: ".popup .popup_close",
        modalSelector: ".popup",
    },
    {
        triggerSelector: ".questions__link",
        closeSelector: ".popup .popup_close",
        modalSelector: ".popup",
    },
    {
        triggerSelector: ".glazing_content .popup_calc_btn",
        closeSelector: ".popup_calc .popup_calc_close",
        modalSelector: ".popup_calc",
    },
    // {
    //     triggerSelector: ".popup_calc .popup_calc_button",
    //     closeSelector: ".popup_calc_profile .popup_calc_profile_close",
    //     modalSelector: ".popup_calc_profile",
    //     closeByOverlay: false,
    // },
    // {
    //     triggerSelector: ".popup_calc_profile .popup_calc_profile_button",
    //     closeSelector: ".popup_calc_end .popup_calc_end_close",
    //     modalSelector: ".popup_calc_end",
    //     closeByOverlay: false,
    // },
];

function getScroll(){
    let div = document.createElement('div');
    div.style.cssText = `
        width: 50px;
        height: 50px;
        overflow: scroll;
        visibility: hidden;
    `;
    document.body.append(div);
    let scrollWidth = div.offsetWidth - div.clientWidth;
    div.remove();
    return scrollWidth;
};
function inputMask(){
    const phoneInputs = document.querySelectorAll('input[name="user_phone"]');
    let currentInputValue = '';

    phoneInputs.forEach(inputElement => {
        inputElement.addEventListener('focus', event => {
            event.preventDefault();
            if(inputElement.value === ""){
                inputElement.value = '+';
            }
        })

        inputElement.addEventListener('blur', event => {
            event.preventDefault();
            if(inputElement.value === "+"){
                inputElement.value = '';
            }
        })

        inputElement.addEventListener('mouseup', event => {
            event.preventDefault();
            inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
        })

        inputElement.addEventListener('input', event => {  
            if(!/\d/.test(event.data) && event.data !== null){
                inputElement.value = currentInputValue;
            }         
            if(inputElement.value.length == 3 && event.data !== null){
                inputElement.value += ' (';
                inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
            }
            if(inputElement.value.length == 8 && event.data !== null){
                inputElement.value += ') ';
                inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
            }
            if(inputElement.value.length == 13 && event.data !== null ||
                inputElement.value.length == 16 && event.data !== null){
                inputElement.value += '-';
                inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
            }
            if(inputElement.value === ""){             
                inputElement.value = '+';
            }
            currentInputValue = inputElement.value;
        })
    })
};
function tabs(){

    function bindTabs(headerSelector, tabsSelector, contentSelector, activeClass, displayAs = 'flex'){
        const header = document.querySelector(headerSelector);
        const tabs = document.querySelectorAll(tabsSelector);
        const content = document.querySelectorAll(contentSelector);

        hideContent();
        showContent();
    
        header.addEventListener('click', event => {
            tabs.forEach((item, index) => {
                if(event.target.closest(tabsSelector) === item){
                    hideContent();
                    showContent(index)
                }
            })
        })
    
        function hideContent(){
            tabs.forEach(item => {
                item.classList.remove(activeClass);
            })
            content.forEach(item => {
                item.style.display = 'none';
            })
        }
    
        function showContent(index = 0){
            content[index].style.display = displayAs;
            tabs[index].classList.add(activeClass);
        }
    }
    
    bindTabs('.decoration_slider', '.no_click', '.decoration_content', 'after_click');
    bindTabs('.glazing-slider', '.glazing_block', '.glazing_content', 'active');

    bindTabs('.balcon_icons', '.balcon_icons_img', '.big_img img', 'do_image_more', 'inline');
};
function timer(id, deadline) {
    const getTimeRemaining = endTime => {
        const time = Date.parse(endTime) - Date.parse(new Date()),
              seconds = Math.floor((time/1000) % 60),
              minutes = Math.floor((time/1000/60) % 60),
              hours = Math.floor((time/(1000 * 60 * 60)) % 24),
              days = Math.floor((time/(1000 * 60 * 60 * 24)));

        return {
            total: time,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        }
    }

    const setClockk = (selector, endTime) => {
        const timer = document.querySelector(selector);
        const days = timer.querySelector('#days');
        const hours = timer.querySelector('#hours');
        const minutes = timer.querySelector('#minutes');
        const seconds = timer.querySelector('#seconds');
        const timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const time = getTimeRemaining(endTime);
            days.textContent = addZero(time.days);
            hours.textContent = addZero(time.hours);
            minutes.textContent = addZero(time.minutes);
            seconds.textContent = addZero(time.seconds);

            if (time.total <= 0) {
                days.textContent = "00";
                hours.textContent = "00";
                minutes.textContent = "00";
                seconds.textContent = "00";

                clearInterval(timeInterval);
            }
        }
    }

    function addZero(num){
        if(num < 10){
            return '0' + num;
        }else{
            return num;
        }
    }

    setClockk(id, deadline);
};

function showBigImages(){
    const popupImages = document.querySelector('.popup_images');
    const popupImagesWrap = document.querySelector('.popup_images-wrap');
    const popupImagesImg = document.querySelector('.popup_images-img');
    const worksSection = document.querySelector('section.works');
    const bigImage = document.createElement('img');
    const photoCollection = document.querySelectorAll('img.preview');
    const scroll = getScroll();

    bigImage.style.cssText = `
        width: 100%;
        height: 100%;
        box-shadow: 0px 0px 30px 30px rgba(0,0,0,0.5)
    `;
    popupImagesImg.appendChild(bigImage);
    
        

    worksSection.addEventListener('click', event => {
        event.preventDefault();
        const target = event.target;

        if(target && target.classList.contains('preview')){
            popupImages.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.body.style.marginRight = `${scroll}px`;
            const path = target.getAttribute('src');
            bigImage.setAttribute('src', path);

            carousel(target, photoCollection, '.popup_images-arrow');
        }
    })

    popupImages.addEventListener('click', event => {
        const target = event.target;
        if(target && target == popupImagesWrap){
            popupImages.style.display = 'none';
            document.body.style.overflow = '';
            document.body.style.marginRight = `0px`;
        }
    })

    function carousel(currentImg, collection, selectorErrow){
        const arrows = popupImagesWrap.querySelectorAll(selectorErrow);
        let currentIndex = 0;

        collection.forEach((item, index) => {
            if(item == currentImg) currentIndex = index;
        });

        arrows.forEach(item => {
            item.addEventListener('click', event => {
                if(event.target.closest('.previous_arrow')){
                    currentIndex--;
                }
                if(event.target.closest('.next_arrow')){
                    currentIndex++;
                }

                if(currentIndex < 0) currentIndex = collection.length - 1;
                if(currentIndex == collection.length) currentIndex = 0;
                
                bigImage.setAttribute('src', collection[currentIndex].getAttribute('src'));
            })
        })
    }
};


window.addEventListener('DOMContentLoaded', () => {    

    modals();
    formsHandling(modalWindows);
    tabs();
    changeModalState();
    showBigImages();
    timer('.timer__display', deadline)

    inputMask();
})


