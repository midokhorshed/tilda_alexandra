// Add style in site
function t_form__addStyleSteps() {
    var styleEls = document.head.querySelectorAll('style');
    var cssCode = '.t-form__screen .t-form__screen-wrapper {display: block;}.t-form__screen .t-form__submit {position: relative;}.t-form__screen .t-form__submit::before, .t-form__screen .t-form__submit::after {content: "";display: table;}.t-form__screen .t-form__submit::after {clear: both;}.t-form__screen .t-form__screen-btn-prev, .t-form__screen .t-form__screen-btn-next {position: relative;display: -webkit-inline-box;display: -ms-inline-flexbox;display: inline-flex;-webkit-box-align: center;-ms-flex-align: center;align-items: center;}.t-form__screen .t-form__screen-btn-prev {display: none;float: left;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0);}.t-form__screen .t-form__screen-btn-next {float: right;-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0);}.t-form__screen .t-form__screen-btn-prev::before, .t-form__screen .t-form__screen-btn-next::after {display: -webkit-inline-box;display: -ms-inline-flexbox;display: inline-block;font-family: Arial,Helvetica,sans-serif;font-size: 18px;}.t-form__screen .t-form__screen-btn-prev::before {content:"←";margin-right: 5px;}.t-form__screen .t-form__screen-btn-next::after {content:"→";margin-left: 5px;}.t-form__screen .t-submit {float: right;width: auto;height: 45px;font-size: 14px;padding-left: 30px;padding-right: 30px;}.t-form__screen .t-form__screen-number-container {display: inline-block;vertical-align: middle;margin-right: 6px;}.t-form__screen .t-form__screen-current-view {position: absolute;top: 50%;left: 50%;font-size: 12px;-webkit-transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);transform: translate(-50%,-50%);}.t-form__screen .t-form__screen-number-container {margin-left: 3px;color: #000000;}.t-form__screen .t-form__screen-number-container span {opacity: 0.3;}.t-form__screen .t-form__screen-number-container span:nth-child(2) {padding-left: 3px;padding-right: 3px;}.t-form__screen .t-form__screen-progress {display: inline-block;vertical-align: middle;}.t-form__screen .t-form__screen-progress circle {stroke-dashoffset: 62.8319;-webkit-transition: stroke-dashoffset 0.5s linear;-o-transition: stroke-dashoffset 0.5s linear;transition: stroke-dashoffset 0.5s linear;stroke-width: 2px;}.t-form__screen .t-form__screen-progress-circle {stroke: #000000;opacity: 0.3;}.t-form__screen .t-form__screen-progress-bar {stroke: #003cff;stroke-width: 3px;}.t-form__screen .t-form__screen-btn-prev,.t-form__screen .t-form__screen-btn-next {outline: none;}@media screen and (max-width: 480px) {.t-form__screen .t-form__submit {text-align: center;}.t-form__screen .t-form__screen-btn-prev,.t-form__screen .t-form__screen-btn-next,.t-form__screen .t-submit {float: none;vertical-align: middle;margin: 3px 0;}.t-form__screen .t-form__screen-btn-prev {margin-right: 10px;padding-left: 20px;}.t-form__screen .t-form__screen-btn-next {padding-right: 20px;}.t-form__screen .t-form__screen-btn-prev td::before, .t-form__screen .t-form__screen-btn-next td::after {display: none;}.t-form__screen .t-form__screen-current-view {position: relative;top: 0;-webkit-transform: none;-ms-transform: none;transform: none;-webkit-transform: translateX(-50%);-ms-transform: translateX(-50%);transform: translateX(-50%);margin-top: 15px;}.t-form__screen .t-form__screen-number-container {margin-left: 0;}}.example {display: -ms-grid;display: grid;-webkit-transition: all .5s;-o-transition: all .5s;transition: all .5s;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;background: -webkit-gradient(linear, left top, left bottom, from(white), to(black));background: -o-linear-gradient(top, white, black);background: linear-gradient(to bottom, white, black);}';
    var cssFlag = true;

    Array.prototype.forEach.call(styleEls, function(element) {
        if (element.textContent === cssCode) {
            cssFlag = false;
        }
    });

    if (cssFlag) {
        var styleString = '<style>'+ cssCode +'</style>';
        document.head.insertAdjacentHTML('beforeend', styleString);
    }
}

t_form__addStyleSteps();

// Main init fn
// eslint-disable-next-line
function t_form_splittingOnStep(recId) {
    var rec = document.querySelector('#rec'+ recId);
    var form = rec.querySelector('.t-form');
    var inputGroups = form.querySelectorAll('.t-input-group.t-input-group_st');
    var inputsbox = rec.querySelector('.t-form__inputsbox');
    var splitField = inputsbox.querySelectorAll('.t-input-group_st');
    var formScreen;
    var numberContainer;
    var inputsBoxWidth = 0;
    var currentScreen = 0;

    // Start
    function t_form__steps() {
        if (splitField.length === 0) return;

        Array.prototype.forEach.call(inputGroups, function (el) {
            el.style.margin = '0px';
        });

        inputsbox.classList.add('t-form__screen');
        t_form__addBtns();
        numberContainer = inputsbox.querySelector('.t-form__screen-current-view');
        inputsBoxWidth = inputsbox.clientWidth;
        t_form__breakOnStep();
        formScreen = inputsbox.querySelectorAll('.t-form__screen-wrapper');
        t_form__addAllNumberAndProgress();
        t_form__controlFormScreen();

        if (inputsbox) {
            t_form__checkFormWidth();
        }
    }

    // Add button navigation in form
    function t_form__addBtns() {
        var submitWrapper = inputsbox.querySelector('.t-form__submit');
        var buttonsHTML = '';
        var btnNext = '';
        var btnPrev = '';
        var stepDiv = inputsbox.querySelector('.t-form-step-divider');

        if (stepDiv) {
            // <-- This attribute is set from the form settings (THE LANGUAGE OF MESSAGES FROM DATA RECEPTION SERVICES) https://tilda.cc/projects/forms/settings/
            var langAttr = stepDiv.getAttribute('data-tilda-form-step-lang');
            // -->
            var attrBtnNext = stepDiv.getAttribute('data-tilda-form-step-btn-next');
            var attrBtnPrev = stepDiv.getAttribute('data-tilda-form-step-btn-prev');
        }

        if (attrBtnNext) {
            btnNext = attrBtnNext;
        } else if (langAttr === 'RU' && langAttr) {
            btnNext = 'Далее';
        } else {
            btnNext = 'Next';
        }

        if (attrBtnPrev) {
            btnPrev = attrBtnPrev;
        } else if (langAttr === 'RU' && langAttr) {
            btnPrev = 'Назад';
        } else {
            btnPrev = 'Back';
        }

        buttonsHTML = '<button class="t-btn t-btn_sm t-form__screen-btn-prev" type="button"><span>' + btnPrev + '</span></button><button class="t-btn t-btn_sm t-form__screen-btn-next" type="button"><span>' + btnNext + '</span></button>';

        var progressHTML = '<div class="t-form__screen-current-view t-name"></div>';

        submitWrapper.insertAdjacentHTML('beforeend', buttonsHTML);
        submitWrapper.insertAdjacentHTML('beforeend', progressHTML);
    }

    // Collecting inputs in groups for step by step
    function t_form__breakOnStep() {
        var inputGroups = inputsbox.querySelectorAll('.t-input-group');
        var wrapper = t_form__createInputWrapper();
        var list = [];

        Array.prototype.forEach.call(inputGroups, function(input) {
            if (!input.classList.contains('t-input-group_st')) {
                wrapper.appendChild(input);
            } else {
                list.push(wrapper);
                list.push(input);
                wrapper = t_form__createInputWrapper();
            }
        });

        list.push(wrapper);

        Array.prototype.forEach.call(list, function(element, index) {
            inputsbox.insertBefore(element, inputsbox.childNodes[index]);
        });
    }

    // Generating wrapper for group of inputs
    function t_form__createInputWrapper() {
        var div = document.createElement('div');
        div.classList.add('t-form__screen-wrapper');

        return div;
    }

    // Add progress bar
    function t_form__addAllNumberAndProgress() {
        numberContainer.innerHTML = '<div class="t-form__screen-number-container"><span class="t-form__screen-number_opacity"></span><span>/</span><span>' + (formScreen.length) + '</span></div><svg class="t-form__screen-progress" style="-webkit-transform:rotate(-90deg);-ms-transform:rotate(-90deg);transform:rotate(-90deg);" width="30" height="30" viewPort="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle class="t-form__screen-progress-circle" r="10" cx="15" cy="15" fill="transparent" stroke-dasharray="0" stroke-dashoffset="0"></circle><circle class="t-form__screen-progress-bar" r="10" cx="15" cy="15" fill="transparent" stroke-dasharray="62.8319" stroke-dashoffset="62.8319"></circle></svg>';
    }

    // Control job navigation
    function t_form__controlFormScreen() {
        var prevBtn = rec.querySelector('.t-form__screen-btn-prev');
        var nextBtn = rec.querySelector('.t-form__screen-btn-next');
        var submitBtn = rec.querySelector('.t-submit');
        var stepDivider = rec.querySelector('.t-form-step-divider_novalidate');
        var numberCurrentContainer = rec.querySelector('.t-form__screen-number_opacity');
        var progressBar = rec.querySelector('.t-form__screen-progress-bar');
        var throttleResize = t_throttle(t_form__resize, 300, this);

        // Show screen, refresh progress bar, calc height section
        function t_form__initFormScreen() {
            Array.prototype.forEach.call(formScreen, function (screen) {
                screen.style.display = 'none';
                screen.classList.remove('t-form__screen-wrapper_active');
            });

            formScreen[currentScreen].style.display = 'block';
            formScreen[currentScreen].classList.add('t-form__screen-wrapper_active');

            if (currentScreen === formScreen.length - 1) {
                form.classList.add('js-form-proccess');
                submitBtn.style.display = 'inline-block';
            } else {
                form.classList.remove('js-form-proccess');
                submitBtn.style.display = 'none';
            }

            t_form__setCurrentNumber(numberCurrentContainer, currentScreen);
            t_form__setProgressbar(progressBar, formScreen, currentScreen + 1);
            t_form__calculateCoverHeight(currentScreen + 1);

        }

        // Change step
        function t_form__setCurrentNumber(rec, currentScreen) {
            rec.innerHTML = (currentScreen + 1);
        }

        // Change fill icon progress bar
        function t_form__setProgressbar(progressBar, formScreen, direction) {
            var progressCircleLength = parseFloat(progressBar.getAttribute('stroke-dasharray')).toFixed(3);
            var progressBarLength = parseFloat(progressBar.getAttribute('stroke-dasharray')).toFixed(3);
            var progressStep = parseFloat(progressCircleLength / (formScreen.length)).toFixed(3);
            var newProgressLength = parseFloat(progressBarLength - direction * progressStep).toFixed(3);
            progressBar.style.strokeDashoffset = newProgressLength;
            progressBar.setAttribute('stroke-dashoffset', newProgressLength);
        }

        // Btn prev
        function t_form__prevBtn(e) {
            e.preventDefault();

            if (currentScreen !== 0) {
                currentScreen -= 1;
            } else {
                return;
            }

            t_form__showHideBtn();
            t_form__initFormScreen();
            t_form__scrollToFormStart();
        }

        // Btn next
        function t_form__nextBtn(e) {
            e.preventDefault();

            var errorOnScreen = (stepDivider) ? false : t_form__checkOnError(form, formScreen, currentScreen);

            if (errorOnScreen) return;

            if (currentScreen < formScreen.length - 1) {
                currentScreen += 1;
            } else return;

            t_form__showHideBtn();
            t_form__initFormScreen();
            t_form__scrollToFormStart();
            t_form__lazyLoad();
        }

        // Btn enter
        function t_form__keypress(e) {
            var tInputGroupTa = formScreen[currentScreen].querySelectorAll('.t-input-group.t-input-group_ta');

            if (e.keyCode === 13 && !form.classList.contains('js-form-proccess') && tInputGroupTa.length === 0) {
                var errorOnScreen = (stepDivider) ? false : t_form__checkOnError(form, formScreen, currentScreen);

                if (errorOnScreen) {
                    e.preventDefault();
                    return;
                }

                t_form__nextBtn(e);
                e.preventDefault();
            }
        }

        // Show or hide btn depending on state
        function t_form__showHideBtn() {
            if (currentScreen === 0) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'inline-block';
            } else if (currentScreen === formScreen.length - 1) {
                prevBtn.style.display = 'inline-block';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'inline-block';
                nextBtn.style.display = 'inline-block';
            }
        }

        prevBtn.addEventListener('click', t_form__prevBtn);
        nextBtn.addEventListener('click', t_form__nextBtn);
        Array.prototype.forEach.call(formScreen, function(screen) {
            screen.addEventListener('keypress', t_form__keypress);
        });
        window.addEventListener('resize', throttleResize);

        t_form__initFormScreen();
    }

    // Scroll form start
    function t_form__scrollToFormStart() {
        var popup = rec.querySelector('.t-popup');
        var topCoordinateForm = 0;

        if (popup) {
            topCoordinateForm = form.offsetTop;
            popup.scrollTop = topCoordinateForm;
        } else {
            topCoordinateForm = rec.querySelector('.t-form__screen').getBoundingClientRect().top + window.pageYOffset - 150;
            window.scrollTo(0, topCoordinateForm);
        }
    }

    // Calc cover height
    function t_form__calculateCoverHeight(index) {
        var cover = rec.querySelector('.t-cover');
        var coverHook = rec.querySelector('div[data-hook-content]');
        var coverCarrier = rec.querySelector('.t-cover__carrier');

        if (cover && coverHook && coverCarrier) {
            var coverHeight = cover.offsetHeight;
            var coverHookHeight = coverHook.offsetHeight;
            var startHeight = coverCarrier.getAttribute('data-content-cover-height');
        }

        if (startHeight) {
            if (startHeight.indexOf('px') !== -1) {
                startHeight = parseInt(startHeight);
            } else {
                startHeight = window.innerHeight * (parseInt(startHeight) / 100);
            }
        }

        var currentWrapperHeight = 0;
        var wrapperHeight = 0;

        Array.prototype.forEach.call(formScreen, function(element, ind) {
            if(element.style.display === 'block') {
                if (ind + index < formScreen.length) {
                    formScreen[ind + index].style.display = 'block';
                    currentWrapperHeight = formScreen[ind + index].offsetHeight;
                    formScreen[ind + index].style.display = 'none';
                }
                wrapperHeight = element.offsetHeight;
                coverHookHeight = coverHookHeight - wrapperHeight + currentWrapperHeight;
            }
        });

        if (coverHookHeight > 300 && coverHeight < coverHookHeight) {
            var coverHookHeight = coverHookHeight + 160;

            if (coverHookHeight > 1000) {
                coverHookHeight += 100;
            }

            var coverFilter = rec.querySelector('.t-cover__filter');
            var coverWrapper = rec.querySelector('.t-cover__wrapper');
            var coverContainer = rec.querySelector('.t-cover__container');

            if (cover) cover.style.height = coverHookHeight + 'px';

            if (coverCarrier) coverCarrier.style.height = coverHookHeight + 'px';

            if (coverFilter) coverFilter.style.height = coverHookHeight + 'px';

            if (coverWrapper) coverWrapper.style.height = coverHookHeight + 'px';

            if (coverContainer) coverContainer.style.height = coverHookHeight + 'px';

            // eslint-disable-next-line no-console
            console.log('auto correct cover height: ' + coverHookHeight);

            if (!window.isMobile) {
                setTimeout(function () {
                    if (coverCarrier.querySelectorAll('iframe').length > 0) {
                        // eslint-disable-next-line no-console
                        console.log('correct video from cover_fixcontentheight');
                        t_form__onFuncLoad('setWidthHeightYoutubeVideo', function () {
                            // eslint-disable-next-line
                            setWidthHeightYoutubeVideo(coverCarrier, coverHookHeight + 'px');
                        });
                    }
                }, 2000);
            }
        }
    }

    // Resize event refresh height and progress bar
    function t_form__resize() {
        t_form__calculateCoverHeight(currentScreen + 1);
        if (inputsbox) {
            t_form__checkFormWidth();
        }
    }

    // Hide progress bar on 360 window width
    function t_form__checkFormWidth() {
        inputsBoxWidth = inputsbox.clientWidth;
        if (inputsBoxWidth < 360) {
            numberContainer.style.display = 'none';
        } else {
            numberContainer.style.display = 'block';
        }
    }

    // Validation step form
    function t_form__checkOnError(activeForm, formScreen, currentScreen) {
        var activeScreen = formScreen[currentScreen];
        var arErrors = window.tildaForm.validate(activeScreen);
        window.tildaForm.hideErrors(activeForm);
        var errorOnScreen;
        var errorsTypeObj = arErrors[0];
        if (errorsTypeObj) {
            var errorType = errorsTypeObj.type[0];
            errorOnScreen = errorType == 'emptyfill' ? false : window.tildaForm.showErrors(activeForm, arErrors);
        }
        return errorOnScreen;
    }

    t_form__steps();
}

function t_form__lazyLoad() {
    var allRecords = document.querySelector('#allrecords');
    if (!allRecords) return;
    if (!allRecords.getAttribute('data-tilda-mode')) {
        if (window.lazy === 'y' || allRecords.getAttribute('data-tilda-lazy') === 'yes') {
            t_form__onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
    }
}

function t_form__onFuncLoad(funcName, okFunc, time) {
    if (typeof window[funcName] === 'function') {
        okFunc();
    } else {
        setTimeout(function checkFuncExist() {
            if (typeof window[funcName] === 'function') {
                okFunc();
                return;
            }
            if (document.readyState === 'complete' && typeof window[funcName] !== 'function') {
                throw new Error(funcName + ' is undefined');
            }
            setTimeout(checkFuncExist, time || 100);
        });
    }
}