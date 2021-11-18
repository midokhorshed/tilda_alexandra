$('head').append('<style>.t-form__screen .t-form__screen-wrapper{display:block;}.t-form__screen .t-form__submit{position:relative;}.t-form__screen .t-form__submit::before,.t-form__screen .t-form__submit::after{content:"";display:table;}.t-form__screen .t-form__submit::after{clear: both;}.t-form__screen .t-form__screen-btn-prev td,.t-form__screen .t-form__screen-btn-next td{position:relative;}.t-form__screen .t-form__screen-btn-prev{display:none;float:left;padding-left:45px;-webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0);}.t-form__screen .t-form__screen-btn-next{float:right;padding-right:45px;-webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0);}.t-form__screen .t-form__screen-btn-prev td::before{content:"→";position:absolute;left:-23px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.3;-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg);}.t-form__screen .t-form__screen-btn-next td::after{content:" →";position:absolute;margin-left:5px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1;}.t-form__screen .t-submit{float:right;width:auto;height:45px;font-size:14px;padding-left:30px;padding-right:30px;}.t-form__screen .t-form__screen-number-container{display:inline-block;vertical-align:middle;margin-right:6px;}.t-form__screen .t-form__screen-current-view{position:absolute;top:50%;left:50%;font-size:12px;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%);}.t-form__screen .t-form__screen-number-container{margin-left:3px;color:#000000}.t-form__screen .t-form__screen-number-container span{opacity:0.3;}.t-form__screen .t-form__screen-number-container span:nth-child(2){padding-left:3px;padding-right:3px;}.t-form__screen .t-form__screen-progress{display:inline-block;vertical-align:middle;}.t-form__screen .t-form__screen-progress circle{stroke-dashoffset:62.8319;-webkit-transition:stroke-dashoffset 0.5s linear;-o-transition:stroke-dashoffset 0.5s linear;transition:stroke-dashoffset 0.5s linear;stroke-width:2px;}.t-form__screen .t-form__screen-progress-circle{stroke:#000000;opacity:0.3;}.t-form__screen .t-form__screen-progress-bar{stroke:#003cff;stroke-width:3px;}.t-form__screen .t-form__screen-btn-prev,.t-form__screen .t-form__screen-btn-next{outline:none;}@media screen and (max-width: 480px){.t-form__screen .t-form__submit{text-align:center;}.t-form__screen .t-form__screen-btn-prev,.t-form__screen .t-form__screen-btn-next,.t-form__screen .t-submit{float:none;vertical-align:middle;margin:3px 0;}.t-form__screen .t-form__screen-btn-prev{margin-right:10px;padding-left:20px;}.t-form__screen .t-form__screen-btn-next{padding-right:20px;}.t-form__screen .t-form__screen-btn-prev td::before,.t-form__screen .t-form__screen-btn-next td::after{display:none;}.t-form__screen .t-form__screen-current-view{position:relative;top:0;-webkit-transform:none;-ms-transform:none;transform:none;-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%);margin-top:15px;}.t-form__screen .t-form__screen-number-container{margin-left:0;}}</style>');

// eslint-disable-next-line no-unused-vars
function t_form_splittingOnStep(recid) {
    var rec = $('#rec' + recid);
    $('.t-input-group.t-input-group_st').css('margin', '0');

    rec.find('.t-form__inputsbox').each(function () {
        var $this = $(this);
        var splitField = $this.find('.t-input-group_st');
        if (splitField.length !== 0) {
            $this.addClass('t-form__screen');
            $this.parents('.t-form').removeClass('js-form-proccess');
            t_form_addBtns($this);
            var submitBtn = $this.find('.t-submit');
            var prevBtn = $this.find('.t-form__screen-btn-prev');
            var nextBtn = $this.find('.t-form__screen-btn-next');
            var lastSplitField = splitField.last();
            var lastInputsBeforeSplitField = lastSplitField.nextAll('.t-input-group');
            var numberContainer = $this.find('.t-form__screen-current-view');
            var currentScreen = 0;
            var stepDivider = $this.find('.t-form-step-divider_novalidate');
            var inputsBoxWidth = $this.width();

            if (submitBtn.length !== 0) {
                submitBtn.hide();
            }

            t_form_breakOnStep($this, splitField, lastInputsBeforeSplitField);
            var formScreen = $this.find('.t-form__screen-wrapper');
            $(formScreen).hide();
            $(formScreen[currentScreen]).show();
            $(formScreen[currentScreen]).addClass('t-form__screen-wrapper_active');
            t_form_addAllNumberAndProgress(numberContainer, formScreen);
            t_form_setCurrentNumber($this, currentScreen);
            t_form_setProgressbar($this, formScreen, 1);
            if (!$this.is(':hidden')) {
                t_form_checkFormWidth(inputsBoxWidth, numberContainer);
            }

            nextBtn.on('click', function (e) {
                var $this = $(this);
                var $activeForm = $this.parents('.t-form');
                var inputBoxForm = $this.parents('.t-form__inputsbox');
                var errorOnScreen = stepDivider.length !== 0 ? false : t_form_checkOnError($activeForm, formScreen, currentScreen);

                if (!errorOnScreen) {
                    currentScreen++;
                    t_form_calculateCoverHeight($this.parents('.r'), 1);
                    t_form_transitionToNextStep($activeForm, inputBoxForm, formScreen, currentScreen, numberContainer, submitBtn, prevBtn, nextBtn);
                    t_form_scrollToFormStart($this, formScreen, currentScreen);
                }

                t_form_lazyLoad();
                e.preventDefault();
            });

            prevBtn.on('click', function (e) {
                var $this = $(this);
                var $activeForm = $this.parents('.t-form');
                var inputBoxForm = $this.parents('.t-form__inputsbox');
                if (currentScreen > 0) {
                    currentScreen--;
                }
                t_form_transitionToPrevStep($activeForm, inputBoxForm, formScreen, currentScreen, numberContainer, submitBtn, prevBtn, nextBtn);
                t_form_calculateCoverHeight($(this).parents('.r'), 0);
                t_form_scrollToFormStart($this, formScreen, currentScreen);
                e.preventDefault();
            });

            formScreen.keypress(function (e) {
                var $this = $(this);
                var $activeForm = $this.parents('.t-form');
                var inputBoxForm = $this.parents('.t-form__inputsbox');
                var $activeScreen = inputBoxForm.find('.t-form__screen-wrapper_active');

                if (e.keyCode === 13 && !$activeForm.hasClass('js-form-proccess') && $activeScreen.find('.t-input-group.t-input-group_ta').length == 0) {
                    var errorOnScreen = stepDivider.length !== 0 ? false : t_form_checkOnError($activeForm, formScreen, currentScreen);
                    if (!errorOnScreen) {
                        currentScreen++;
                        t_form_calculateCoverHeight($this.parents('.r'), 1);
                        t_form_transitionToNextStep($activeForm, inputBoxForm, formScreen, currentScreen, numberContainer, submitBtn, prevBtn, nextBtn);
                        t_form_scrollToFormStart($this, formScreen, currentScreen);
                    }

                    t_form_lazyLoad();
                    e.preventDefault();
                }
            });

            $(window).on('resize', function () {
                t_form_calculateCoverHeight(splitField.parents('.r'), 0);
                if (!$this.is(':hidden')) {
                    t_form_checkFormWidth(inputsBoxWidth, numberContainer);
                }
            });

            $this.parents('.t-form').on('submit', function () {
                prevBtn.hide();
                if ($(this).hasClass('js-send-form-success')) {
                    prevBtn.hide();
                }
            });

        }
    });
}


function t_form_lazyLoad() {
    if (typeof $('.t-records').attr('data-tilda-mode') == 'undefined') {
        if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
            t_form_onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
    }
}


function t_form_scrollToFormStart($this, formScreen, currentScreen) {
    var topCoordinateForm = $this.parents('.t-form__screen').offset().top - 150;
    var stepHeight = $(formScreen[currentScreen]).parents('.t-popup__container').outerHeight(true);
    var windowHeight = $(window).height();
    var popupContainer = $('.t-popup__container:visible');

    if (stepHeight > windowHeight) {
        popupContainer.css({
            'transform': 'translateY(0)',
            'top': '0',
            'transition': 'none'
        });
    } else {
        popupContainer.css({
            'transform': 'translateY(-50%)',
            'top': '50%'
        });
    }

    if (stepHeight > windowHeight) {
        $('.t-popup.t-popup_show').animate({
            scrollTop: 0
        }, 0);
    }

    /* updated on 08/11/21 */
    if (topCoordinateForm >= window.scrollY) return;

    /* it's not a popup */
    if (stepHeight === null) {
        var paddingTop = 0;

        if ($('.t228__positionfixed').length > 0 && !window.isMobile) {
            paddingTop = paddingTop + $('.t228__positionfixed').height();
        }

        $('html, body').animate({
            scrollTop: topCoordinateForm - paddingTop
        }, 0);
    }

}


function t_form_checkFormWidth(inputsBoxWidth, numberContainer) {
    if (inputsBoxWidth < 360) {
        numberContainer.hide();
    }
}


function t_form_addBtns($this) {
    var submitWrapper = $this.find('.t-form__submit');
    var buttonsHTML = '';
    var btnNext = '';
    var btnPrev = '';
    var langAttr = $this.find('.t-form-step-divider').attr('data-tilda-form-step-lang');
    var attrBtnNext = $this.find('.t-form-step-divider').attr('data-tilda-form-step-btn-next');
    var attrBtnPrev = $this.find('.t-form-step-divider').attr('data-tilda-form-step-btn-prev');

    if (attrBtnNext !== undefined) {
        btnNext = attrBtnNext;
    } else if (langAttr == 'RU' && langAttr != undefined) {
        btnNext = 'Далее';
    } else {
        btnNext = 'Next';
    }

    if (attrBtnPrev !== undefined) {
        btnPrev = attrBtnPrev;
    } else if (langAttr == 'RU' && langAttr != undefined) {
        btnPrev = 'Назад';
    } else {
        btnPrev = 'Back';
    }

    buttonsHTML = '<button class="t-btn t-btn_sm t-form__screen-btn-prev" type="button"><table style="width:100%; height:100%;"><tbody><tr><td>' + btnPrev + '</td></tr></tbody></table></button><button class="t-btn t-btn_sm t-form__screen-btn-next" type="button"><table style="width:100%; height:100%;"><tbody><tr><td>' + btnNext + '</td></tr></tbody></table></button>';

    var progressHTML = '<div class="t-form__screen-current-view t-name"></div>';
    submitWrapper.prepend(buttonsHTML);
    submitWrapper.append(progressHTML);
}


function t_form_addAllNumberAndProgress(numberContainer, formScreen) {
    numberContainer.html('<div class="t-form__screen-number-container"><span class="t-form__screen-number_opacity"></span><span>/</span><span>' + (formScreen.length) + '</span></div><svg class="t-form__screen-progress" style="-webkit-transform:rotate(-90deg);-ms-transform:rotate(-90deg);transform:rotate(-90deg);" width="30" height="30" viewPort="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle class="t-form__screen-progress-circle" r="10" cx="15" cy="15" fill="transparent" stroke-dasharray="0" stroke-dashoffset="0"></circle><circle class="t-form__screen-progress-bar" r="10" cx="15" cy="15" fill="transparent" stroke-dasharray="62.8319" stroke-dashoffset="62.8319"></circle></svg>');
}


function t_form_setCurrentNumber($this, currentScreen) {
    var numberCurrentContainer = $this.find('.t-form__screen-number_opacity');
    numberCurrentContainer.html(currentScreen + 1);
}


function t_form_setProgressbar($activeForm, formScreen, direction) {
    var progressBar = $activeForm.find('.t-form__screen-progress-bar');
    var progressCircleLength = parseFloat(progressBar.attr('stroke-dasharray')).toFixed(3);
    var progressBarLength = parseFloat(progressBar.attr('stroke-dashoffset')).toFixed(3);
    var progressStep = parseFloat(progressCircleLength / (formScreen.length)).toFixed(3);
    var newProgressLength = parseFloat(progressBarLength - direction * progressStep).toFixed(3);
    progressBar.css('stroke-dashoffset', newProgressLength);
    progressBar.attr('stroke-dashoffset', newProgressLength);
}


function t_form_breakOnStep($this, splitField, lastInputsBeforeSplitField) {
    splitField.each(function (i) {
        $(splitField[i]).prevUntil(splitField[i - 1]).wrapAll('<div class="t-form__screen-wrapper"></div>');
    });
    t_form_reverseScreenInput($this);
    if (lastInputsBeforeSplitField.length !== 0) {
        lastInputsBeforeSplitField.wrapAll('<div class="t-form__screen-wrapper"></div>');
    }
}


function t_form_reverseScreenInput($this) {
    var screenWrapper = $this.find('.t-form__screen-wrapper');
    var reverseInputGroup = [];
    screenWrapper.each(function (i) {
        var $this = $(this);
        var inputGroup = $this.find('.t-input-group');
        reverseInputGroup.push(Array.prototype.slice.call(inputGroup).reverse());
        $this.append(reverseInputGroup[i]);
    });
}


function t_form_checkOnError($activeForm, formScreen, currentScreen) {
    var $activeScreen = $(formScreen[currentScreen]);
    var arErrors = window.tildaForm.validate($activeScreen);
    window.tildaForm.hideErrors($activeForm);
    var errorOnScreen;
    var errorsTypeObj = arErrors[0];
    if (errorsTypeObj != undefined) {
        var errorType = errorsTypeObj.type[0];
        errorOnScreen = errorType == 'emptyfill' ? false : window.tildaForm.showErrors($activeForm, arErrors);
    }
    return errorOnScreen;
}


function t_form_transitionToPrevStep($activeForm, inputBoxForm, formScreen, currentScreen, numberContainer, submitBtn, prevBtn, nextBtn) {
    window.tildaForm.hideErrors($activeForm);
    nextBtn.show();
    submitBtn.hide();
    t_form_setProgressbar($activeForm, formScreen, -1);
    if (currentScreen == 0) {
        prevBtn.hide();
    }
    $(formScreen).hide();
    $(formScreen).removeClass('t-form__screen-wrapper_active');
    $(formScreen[currentScreen]).show();
    $(formScreen[currentScreen]).addClass('t-form__screen-wrapper_active');
    $activeForm.removeClass('js-form-proccess');
    t_form_setCurrentNumber(inputBoxForm, currentScreen);
}


function t_form_transitionToNextStep($activeForm, inputBoxForm, formScreen, currentScreen, numberContainer, submitBtn, prevBtn, nextBtn) {
    formScreen.hide();
    $(formScreen).removeClass('t-form__screen-wrapper_active');
    $(formScreen[currentScreen]).show();
    $(formScreen[currentScreen]).addClass('t-form__screen-wrapper_active');
    prevBtn.show();
    t_form_setProgressbar($activeForm, formScreen, 1);
    if (currentScreen == formScreen.length - 1) {
        nextBtn.hide();
        submitBtn.css('display', 'inline-block');
        $activeForm.addClass('js-form-proccess');
    }
    t_form_setCurrentNumber(inputBoxForm, currentScreen);
}


function t_form_calculateCoverHeight(el, index) {
    /* correct cover height if content more when cover height */
    var hcover = el.find('.t-cover').height();
    var hcontent = el.find('div[data-hook-content]').outerHeight();
    var startHeight = el.find('.t-cover__carrier').attr('data-content-cover-height');
    if (typeof startHeight != 'undefined') {
        if (startHeight.indexOf('px') != -1) {
            startHeight = parseInt(startHeight);
        } else {
            startHeight = $(window).height() * (parseInt(startHeight) / 100);
        }
    }
    var currentWrapperHeight = 0;
    var wrapperHeight = 0;
    var wrap = el.find('.t-form__screen-wrapper');

    wrap.each(function (i) {
        if ($(wrap[i]).css('display') == 'block') {
            currentWrapperHeight = $(wrap[i + index]).outerHeight();
            wrapperHeight = $(wrap[i]).outerHeight();
            hcontent = el.find('div[data-hook-content]').outerHeight() - wrapperHeight + currentWrapperHeight;
        }
    });

    if (hcontent > 300 && hcover < hcontent) {
        var hcontent = hcontent + 120;
        if (hcontent > 1000) {
            hcontent += 100;
        }
        // eslint-disable-next-line no-console
        console.log('auto correct cover height: ' + hcontent);
        el.find('.t-cover').height(hcontent);
        el.find('.t-cover__filter').height(hcontent);
        el.find('.t-cover__carrier').height(hcontent);
        el.find('.t-cover__wrapper').height(hcontent);
        el.find('.t-cover__container').height(hcontent);
        if (!window.isMobile) {
            setTimeout(function () {
                var divvideo = el.find('.t-cover__carrier');
                if (divvideo.find('iframe').length > 0) {
                    // eslint-disable-next-line no-console
                    console.log('correct video from cover_fixcontentheight');
                    setWidthHeightYoutubeVideo(divvideo, hcontent + 'px');
                }
            }, 2000);
        }
    }

    if (hcontent > startHeight) {
        el.find('.t-cover').height(hcontent + 160);
        el.find('.t-cover__filter').height(hcontent + 160);
        el.find('.t-cover__carrier').height(hcontent + 160);
        el.find('.t-cover__wrapper').height(hcontent + 160);
        el.find('.t-cover__container').height(hcontent + 160);
    } else {
        el.find('.t-cover').height(startHeight);
        el.find('.t-cover__filter').height(startHeight);
        el.find('.t-cover__carrier').height(startHeight);
        el.find('.t-cover__wrapper').height(startHeight);
        el.find('.t-cover__container').height(startHeight);
    }
}


function t_form_onFuncLoad(funcName, okFunc, time) {
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