/**
 * tilda-search-help use in https://help.tilda.cc/
 */
if (document.readyState !== 'loading') {
    t_searchHelp__init();
} else {
    document.addEventListener('DOMContentLoaded', t_searchHelp__init);
}
function t_searchHelp__init() {
    var styleTag = '<style>@keyframes rotate360{to{transform:rotate(360deg)}}.t-site-search-input input::-ms-clear{display:none}.t-site-search-dm{z-index:9999;position:absolute;box-shadow:0 2px 10px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.05);background-color:#fff;max-height:70vh;overflow-y:scroll;right:0;left:0;text-align:left}.t-site-search-dm__result{margin:15px}.t-site-search-dm__result a{color:#111!important;text-decoration:none}.t-site-search-dm__result__title{color:#000;text-align:left;font-size:20px;margin-bottom:3px;height:auto;display:block;line-height:22px}.t-site-search-dm__result__title b{font-weight:600}.t-site-search-close,.t-site-search-loader{position:absolute;display:none;top:0;bottom:0;margin:auto;right:20px}.t-site-search-loader{animation:rotate360 2s linear infinite;opacity:.7}.t-site-search-close{opacity:.8;cursor:pointer}.t-site-search-popup__preloader{animation:rotate360 2s linear infinite;margin-left:15px;display:none}.t-site-search-dm__result__body{font-size:14px;text-align:left;color:#323232}.t-site-search-dm__allresultslink{padding-bottom:30px;padding-right:20px;text-decoration:underline!important;color:#000!important;float:right;cursor:pointer}.t-site-search-popup__background{position:fixed;top:0;right:0;bottom:0;left:0;overflow-y:auto;-webkit-transition:opacity ease-in-out .3s;-moz-transition:opacity ease-in-out .3s;-o-transition:opacity ease-in-out .3s;transition:opacity ease-in-out .3s;width:100%;height:100%;box-sizing:border-box;padding:0 20px;background-color:rgba(0,0,0,.6);z-index:9999999}.t-site-search-popup{z-index:100000;padding:60px 60px 0!important;box-shadow:0 2px 10px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.05);background-color:#fff;margin:5vh auto;box-sizing:border-box;min-height:90vh}.t-site-search-pu__close img{width:25px;opacity:1;float:right;margin-right:-35px;cursor:pointer;margin-top:-40px}.t-site-search-pu__pagination{margin-bottom:40px}.t-site-search-pu__pagination button{background-color:#fff;margin-right:10px;cursor:pointer;text-align:center;font-size:16px;font-weight:700;border:0;width:30px;outline:0}.t-site-search-pu__pagination button:disabled{color:gray;cursor:default}.body-fix{height:100vh;min-height:100vh;overflow:hidden}@media screen and (max-width:620px){.t-site-search-popup{padding:60px 20px 0!important;top:0}.t-site-search-pu__close img{margin-right:-5px;margin-top:-40px}}.t-site-search-answerpopup img{width:100%}.t-site-search-notfound:empty .t-site-search-dm__result{margin-top:none}.t-site-search-help{border-top:1px solid #cecece}.t-site-search-help:empty{border:0}.t-site-search-answers{padding-top:5px;padding-bottom:10px}.t-site-search-answers:empty{padding:unset;border:0}.t-site-search-answers .t-site-search-dm__result{margin:10px 15px;cursor:pointer}.t-site-search-answers .t-site-search-dm__result__title{font-size:16px}.t-site-search-answers-title,.t-site-search-instructions-title{opacity:.4;margin:10px 15px 13px;font-family:"futura-pt",Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:1px}.t-site-search-instructions-title{padding-top:10px}.t-site-search-answerpopup a{color:#fa876b!important;font-weight:700!important;text-decoration:none}.t-site-search-answerpopup li a{overflow:hidden;text-overflow:ellipsis}.t-site-search-answerpopup p{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis}</style>';
    document.head.insertAdjacentHTML('beforeend', styleTag);

    var timerID = 0;
    var currentPage;
    var xhr;

    var close_svg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxIiBoZWlnaHQ9IjEwMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOTguNjUgOTYuNTVMNTIuMTEgNDkuOTMgOTguMzYgMy41Yy41OS0uNTkuNTktMS40NyAwLTIuMDZhMS40MiAxLjQyIDAgMDAtMi4wNiAwTDUwLjA1IDQ3Ljg3IDMuNjkgMS40NGExLjQyIDEuNDIgMCAwMC0yLjA1IDAgMS40MiAxLjQyIDAgMDAwIDIuMDZsNDYuMzUgNDYuNDNMMS40NCA5Ni41NUExLjQyIDEuNDIgMCAwMDMuNCA5OC42bDQ2LjU1LTQ2LjYyTDk2LjUgOTguNmMuMy4zLjY4LjM5Ljk4LjM5LjMgMCAuNjgtLjEuOTgtLjQuNjgtLjU4LjY4LTEuNDYuMi0yLjA1eiIgZmlsbD0iIzExMSIgc3Ryb2tlPSIjMTExIi8+PC9zdmc+';
    var loader_svg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0IiBmaWxsPSJub25lIj48c3R5bGU+LmF7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlOiM3RjdGN0Y7fS5ie3N0cm9rZS1saW5lam9pbjpiZXZlbDtzdHJva2Utd2lkdGg6MjtzdHJva2U6IzdGN0Y3Rjt9PC9zdHlsZT48cGF0aCBkPSJNMzMgMUM0MC43IDEgNDguNCAzLjkgNTQuMiA5LjggNjQuOSAyMC41IDY1LjggMzcuMiA1NyA0OUw1MSA1NSIgY2xhc3M9ImEiLz48cGF0aCBkPSJNMzEgNjNDMjMuMyA2MyAxNS42IDYwLjEgOS44IDU0LjIgLTAuOSA0My41LTEuOCAyNi44IDcgMTVMMTMgOSIgY2xhc3M9ImEiLz48cGF0aCBkPSJNNTEgNDRWNTVINjIiIGNsYXNzPSJiIi8+PHBhdGggZD0iTTEzIDIwVjlIMiIgY2xhc3M9ImIiLz48L3N2Zz4=';

    var userLang = (navigator.language || navigator.browserLanguage).toLowerCase().indexOf('ru') != -1 ? 'RU' : 'EN';

    var translation = {
        placeholder: {
            RU: 'Поиск',
            EN: 'Search'
        },
        button: {
            RU: 'Поиск',
            EN: 'Find'
        },
        noResult: {
            RU: 'Ничего не найдено',
            EN: 'Nothing found'
        },
        showAll: {
            RU: 'Показать все результаты',
            EN: 'Show all results'
        },
        showAlltitle: {
            RU: 'Результаты по запросу:',
            EN: 'Results for:'
        },
        errorOccurred: {
            RU: 'При отправке запроса произошла ошибка',
            EN: 'An error occurred while sending the request'
        },
        errorOccurredText: {
            RU: 'Сервер не смог ответить на запрос.<br>Описание: ',
            EN: 'The server could not respond to the request.<br>Description: '
        },
        fastAnswer: {
            RU: 'Вопрос - ответ',
            EN: 'Questions and Answers'
        },
        instructions: {
            RU: 'Подробные инструкции',
            EN: 'Detailed instructions'
        }
    };

    var lastQuery = '';
    var lastQueryPage = 0;

    var eventOnChangeScreenVal = window.isMobile ? 'orientationchange' : 'resize';

    window.addEventListener(eventOnChangeScreenVal, t_searchHelp__resizeDropDownList);

    var siteSearchInputs = document.querySelectorAll('.t-site-search-input input');
    Array.prototype.forEach.call(siteSearchInputs, function (siteSearchInput) {
        if (!siteSearchInput.getAttribute('placeholder')) {
            siteSearchInput.setAttribute('placeholder', translation.placeholder[userLang]);
        }
        siteSearchInput.addEventListener('keyup', function (e) {
            if (e.keyCode === 13) {
                window.currentInput = siteSearchInput;
                lastQuery = '';
                lastQueryPage = 0;
                t_searchHelp__request(2);
                siteSearchInput.blur();
            }
        });
    });

    function t_searchHelp__waitEscPressed(e) {
        if (e.keyCode == 27) {
            var siteSearchPopup = document.querySelectorAll('.t-site-search-popup');
            if (siteSearchPopup.length) {
                t_searchHelp__hidePopup();
                if (xhr) {
                    xhr.abort();
                }
                e.preventDefault();
            }
        }
    }

    function t_searchHelp__inputInit() {
        var searchInputs = document.querySelectorAll('.t-site-search-input input');
        Array.prototype.forEach.call(searchInputs, function (searchInput) {
            searchInput.insertAdjacentHTML('afterend', '<img width="18px" class="t-site-search-loader" src="' + loader_svg + '" />');
            searchInput.insertAdjacentHTML('afterend', '<img width="18px" class="t-site-search-close" src="' + close_svg + '" />');
            searchInput.addEventListener('input', function (e) {
                t_searchHelp__oninput(e.target);
                if (e.target.value.length < 3) {
                    t_searchHelp__searchDMClose();
                }
            });
            searchInput.addEventListener('click', function (e) {
                t_searchHelp__oninput(e.target);
            });
        });
    }

    t_searchHelp__inputInit();

    function t_searchHelp__oninput(currentEl, fast) {
        fast = fast ? 0 : 300;

        var currentElParent = currentEl.closest('div.t-site-search-input');
        var isOnlyPopup = currentElParent ? currentElParent.hasAttribute('data-onlypopup') : false;

        if (isOnlyPopup) {
            return false;
        }

        var documentHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        var currentElTopPos = currentEl.getBoundingClientRect().top;

        if (documentHeight - (currentElTopPos + window.pageYOffset) < 400) {
            return false;
        }

        window.currentInput = currentEl;
        if (window.currentInput.value.length >= 2) {
            if (timerID > 0) {
                clearTimeout(timerID);
            }
            timerID = setTimeout(function () {
                t_searchHelp__request();
            }, fast);
        }
        if (window.currentInput.value.length === 0) {
            var currentInputParent = window.currentInput.closest('div');
            var currentInputClose = currentInputParent ? currentInputParent.querySelector('img.t-site-search-close') : null;
            if (currentInputClose) {
                currentInputClose.style.display = 'none';
            }
        }
    }

    t_searchHelp__setResultLinkEvent();
    t_searchHelp__setSearchBtnEvent();

    function t_searchHelp__setResultLinkEvent() {
        var searchBlocks = document.querySelectorAll('.t-site-search-input');
        Array.prototype.forEach.call(searchBlocks, function (searchBlock) {
            searchBlock.addEventListener('click', function (e) {
                if (e.target.closest('.t-site-search-dm__allresultslink')) {
                    lastQuery = '';
                    lastQueryPage = '';
                    t_searchHelp__request(2);
                }
            });
        });
    }

    function t_searchHelp__setSearchBtnEvent() {
        var searchBtns = document.querySelectorAll('.t-site-search-input button');
        Array.prototype.forEach.call(searchBtns, function (searchBtn) {
            searchBtn.addEventListener('click', function (e) {
                var searchDM = document.querySelector('.t-site-search-dm');
                if (searchDM) {
                    searchDM.remove();
                }
                var searchBtnParent = e.target.closest('div.t-site-search-input');
                var searchInput = searchBtnParent ? searchBtnParent.querySelector('input') : null;
                if (searchInput) {
                    window.currentInput = searchInput;
                    t_searchHelp__request(2);
                }
            });
        });
    }

    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.t-site-search-pu__pagination button')) {
            var currentClicked = e.target.closest('.t-site-search-pu__pagination button');
            currentClicked.setAttribute('disabled', 'disabled');
            t_searchHelp__request(2, currentClicked.getAttribute('page'));
        }
    });

    function t_searchHelp__waitClickDone(e) {
        if (e.target.closest('.t-site-search-pu__close img')) {
            t_searchHelp__hidePopup();
            if (xhr) {
                xhr.abort();
            }
            return;
        }

        if (
            !e.target.closest('.t-site-search-dm') &&
            e.target.closest('input') !== window.currentInput
        ) {
            t_searchHelp__searchDMClose();
        }
        if (!e.target.closest('.t-site-search-popup')) {
            if (document.querySelectorAll('.t-site-search-popup').length) {
                t_searchHelp__hidePopup();
                if (xhr) {
                    xhr.abort();
                }
            }
        }

        if (e.target.closest('.t-site-search-close')) {
            var currentClicked = e.target.closest('.t-site-search-close');
            t_searchHelp__searchDMClose();
            var currentClickedParent = currentClicked.closest('div');
            var currentInput = currentClickedParent ? currentClickedParent.querySelector('input') : null;
            if (currentInput) {
                currentInput.value = '';
            }
            currentClicked.style.display = 'none';
        }
    }

    function t_searchHelp__displayDownMenu(sResults) {
        var alredyBindEsc = document.body.getAttribute('data-alreadyBindEsc');
        var alredyBindClick = document.body.getAttribute('data-alreadyBindClk');
        if (!alredyBindEsc && alredyBindEsc !== 'true') {
            document.body.setAttribute('data-alreadyBindEsc', 'true');
            document.body.addEventListener('keyup', t_searchHelp__waitEscPressed);
        }
        if (!alredyBindClick && alredyBindClick !== 'true') {
            document.body.setAttribute('data-alreadyBindClk', 'true');
            document.body.addEventListener('click', t_searchHelp__waitClickDone);
        }

        var width;
        if (window.currentInput.closest('.t838__blockinput')) {
            var currentInputBorderLeftWidth = parseInt(window.currentInput.style.borderLeftWidth) || 0;
            var currentInputBorderRightWidth = parseInt(window.currentInput.style.borderRightWidth) || 0;
            width = window.currentInput.offsetWidth - (currentInputBorderLeftWidth + currentInputBorderRightWidth);
        } else {
            width = window.currentInput.offsetWidth + 250;
            if (width > window.innerWidth - 40) {
                width = window.innerWidth - 40;
            }
        }
        var left = window.currentInput.offsetLeft + 1;

        var html = '<div class="t-site-search-dm" style="width: ' + width + 'px !important; left: ' + left + 'px !important; display: none">' +
            '<div class="t-site-search-notfound" style="display: none">' +
            '<div class="t-site-search-dm__result">' +
            '<div class="t-site-search-dm__result__title t-text">' + translation.noResult[userLang] + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="t-site-search-answers" style="display: none">' +
            '<div class="t-site-search-answers-title">' + translation.fastAnswer[userLang] + '</div>' +
            '</div>' +
            '<div class="t-site-search-help" style="display: none">' +
            '<div class="t-site-search-instructions-title">' + translation.instructions[userLang] + '</div>' +
            '</div>' +
            '<a class="t-site-search-dm__allresultslink t-descr" style="display: none">' + translation.showAll[userLang] + '</a>' +
            '</div>' +
            '<style>.t830m.t830m__menu_show, .t830m .t830m__container {' +
            'overflow: visible !important' +
            '}' +
            '@media screen and (min-width:1500px) {' +
            '.t830m.t830m_close {' +
            'overflow: visible !important' +
            '}' +
            '}</style>';

        var parent = window.currentInput.nextElementSibling;
        if (!parent.classList.contains('t-site-search-dm')) {
            window.currentInput.insertAdjacentHTML('afterend', html);
            parent = window.currentInput.nextElementSibling;
        }

        // Dont display link for the popup
        var searchDmAllRes = parent.querySelector('.t-site-search-dm__allresultslink');
        if (searchDmAllRes) {
            searchDmAllRes.style.display = 'none';

        }

        if (typeof sResults !== 'undefined') {
            var answers = '';
            if (typeof sResults.answers !== 'undefined' && typeof sResults.answers.total === 'undefined' && sResults.answers.length > 0) {
                for (var i = 0; i < sResults.answers.length; i++) {
                    var curAns = sResults.answers[i][0];
                    answers += '<div class="t-site-search-dm__result">' +
                        '<div onclick="t_searchHelp__displayAnswerPopup(' + curAns['id'] + ')" class="t-site-search-dm__result__title t-text">' + curAns['quest'] + '</div>' +
                        '</a>' +
                        '</div>';
                }
            }

            var help = '';
            if (typeof sResults.search !== 'undefined' && typeof sResults.search.total !== 'undefined' && sResults.search.total > 0) {
                Array.prototype.forEach.call(sResults.search.pages, function (value) {
                    if (sResults.search.error) {
                        help += '<div class="t-site-search-dm__result">' +
                            '<div class="t-site-search-dm__result__title t-text">' + value.title + '</div>' +
                            '<div class="t-site-search-dm__result__body t-text">' + value.highlight + '</div>' +
                            '</div>';
                    } else {
                        help += '<div class="t-site-search-dm__result">' +
                            '<a target="_blank" href="' + value.pageurl + '">' +
                            '<div class="t-site-search-dm__result__title t-text">' + value.title + '</div>' +
                            '<div class="t-site-search-dm__result__body t-text">' + value.highlight + '</div>' +
                            '</a>' +
                            '</div>';
                    }
                });

                if (sResults.search.total > 10) {

                    var allResLink = parent.querySelector('.t-site-search-dm__allresultslink');
                    if (allResLink) {
                        allResLink.style.display = 'block';
                    }
                } else {

                    var allResLink = parent.querySelector('.t-site-search-dm__allresultslink');
                    if (allResLink) {
                        allResLink.style.display = 'none';
                    }
                }

                var searchCloseImg = document.querySelector('.tilda-site-search-close-img');
                if (searchCloseImg) {
                    searchCloseImg.style.display = 'inline';
                }
            }

            if (parent.classList.contains('t-site-search-dm')) {
                if (answers.length > 0 || help.length > 0) {
                    var searchNotFound = parent.querySelector('.t-site-search-notfound');
                    if (searchNotFound) {
                        searchNotFound.style.display = 'none';
                    }
                }

                if (answers.length > 0) {
                    var results = parent.querySelectorAll('.t-site-search-answers .t-site-search-dm__result');
                    Array.prototype.forEach.call(results, function (result) {
                        result.style.display = 'none';
                        if (result) {
                            result.remove();
                        }
                    });
                    var searchAnswers = parent.querySelector('.t-site-search-answers');
                    if (searchAnswers) {
                        searchAnswers.insertAdjacentHTML('beforeend', answers);
                        searchAnswers.style.display = 'block';
                    }
                }

                if (help.length > 0) {
                    var results = parent.querySelectorAll('.t-site-search-help .t-site-search-dm__result');
                    Array.prototype.forEach.call(results, function (result) {
                        result.style.display = 'none';
                        if (result) {
                            result.remove();
                        }
                    });
                    var searchHelp = parent.querySelector('.t-site-search-help');
                    if (searchHelp) {
                        searchHelp.insertAdjacentHTML('beforeend', help);
                        searchHelp.style.display = 'block';
                    }
                }

                if (answers.length === 0 && help.length === 0) {
                    var parentAnswersAndHelp = parent.querySelectorAll('.t-site-search-answers, .t-site-search-help');
                    Array.prototype.forEach.call(parentAnswersAndHelp, function (el) {
                        el.style.display = 'none';
                    });
                    var searchNotFount = parent.querySelector('.t-site-search-notfound');
                    if (searchNotFount) {
                        searchNotFount.style.display = 'block';
                    }
                }
                parent.style.display = 'block';
            }

            var currentInputParent = window.currentInput.closest('div');
            var currentInputClose = currentInputParent ? currentInputParent.querySelector('.t-site-search-close') : null;
            if (currentInputClose) {
                currentInputClose.style.display = 'block';
            }
        }
    }

    function t_searchHelp__resizeDropDownList() {
        var downmenu = document.querySelector('.t-site-search-dm');
        if (downmenu) {
            var width;
            if (window.currentInput.closest('.t838__blockinput')) {
                var currentInputBorderLeftWidth = parseInt(window.currentInput.style.borderLeftWidth) || 0;
                var currentInputBorderRightWidth = parseInt(window.currentInput.style.borderRightWidth) || 0;
                width = window.currentInput.offsetWidth - (currentInputBorderLeftWidth + currentInputBorderRightWidth);
            } else {
                width = window.currentInput.offsetWidth + 250;
                if (width > window.innerWidth - 40) {
                    width = window.innerWidth - 40;
                }
            }
            var left = window.currentInput.offsetLeft + 1;
            downmenu.style.width = width + 'px';
            downmenu.style.left = left + 'px';
        }
    }

    window.t_searchHelp__displayAnswerPopup = function (answerid) {
        var html = '<div class="t-site-search-popup__background">' +
            '<div class="t-site-search-popup t-width t-width_8" style="padding-bottom: 45px !important;">' +
            '<div class="t-site-search-pu__close">' +
            '<img style="width:20px;" src="' + close_svg + '">' +
            '</div><div class="t-site-search-answers-title" style="margin-left: 0px !important;">' + translation.fastAnswer[userLang] + '</div>' +
            '<div class="t-site-search-answerpopup t-text"></div></div></div>';

        setTimeout(function () {
            document.body.classList.add('body-fix');
            document.body.insertAdjacentHTML('beforeend', html);

            var requestAnswr = new XMLHttpRequest();
            requestAnswr.open('GET', 'https://answers.tilda.cc/api/answer/get/' + answerid);
            requestAnswr.send();
            requestAnswr.onload = function () {
                var data = JSON.parse(requestAnswr.response);
                var answerPopup = document.querySelector('.t-site-search-answerpopup');
                if (answerPopup) {
                    answerPopup.innerHTML = '<h3 class="t-title" style="margin-bottom: 25px; margin-top: 0;">' + data.quest + '</h3>' + data.answer;
                }
            };
        }, 10);
    };

    function t_searchHelp__displayPopup(sResults, initUp) {
        initUp = initUp || false;
        var alredyBindEsc = document.body.getAttribute('data-alreadyBindEsc');
        var alredyBindClick = document.body.getAttribute('data-alreadyBindClk');
        if (!alredyBindEsc && alredyBindEsc !== 'true') {
            document.body.setAttribute('data-alreadyBindEsc', 'true');
            document.body.addEventListener('keyup', t_searchHelp__waitEscPressed);
        }
        if (!alredyBindClick && alredyBindClick !== 'true') {
            document.body.setAttribute('data-alreadyBindClk', 'true');
            document.body.addEventListener('click', t_searchHelp__waitClickDone);
        }

        var searchDM = document.querySelector('.t-site-search-dm');

        if (searchDM) {
            searchDM.style.display = 'none';
        }

        var html = '<div class="t-site-search-popup__background">' +
            '<div class="t-site-search-popup t-width t-width_8">' +
            '<div class="t-site-search-pu__close">' +
            '<img style="width:20px;" src="' + close_svg + '">' +
            '</div>' +
            '<div class="t-site-search-pu">';
        if (sResults.search && sResults.search['error'] !== true) {
            html += '<h3 class="t-title" style="margin: 15px; margin-bottom: 25px; margin-top: 0;">' + translation.showAlltitle[userLang] + ' ' + t_searchHelp__escapeHtml(window.currentInput.value) + '</h3>';
        }
        if (initUp) {
            html += '<img width="24px" class="t-site-search-popup__preloader" src="' + loader_svg + '" />';
        }
        if (sResults.search && sResults.search['total'] > 0) {
            Array.prototype.forEach.call(sResults.search['pages'], function (value) {
                if (sResults.search['error'] === true) {
                    html += '<div class="t-site-search-dm__result">' +
                        '<div class="t-site-search-dm__result__title t-descr">' + value['title'] + '</div>' +
                        '<div class="t-site-search-dm__result__body t-text">' + value['highlight'] + '</div>' +
                        '</div>';
                } else {
                    html += '<div class="t-site-search-dm__result">' +
                        '<a target="_blank" href="' + value['pageurl'] + '">' +
                        '<div class="t-site-search-dm__result__title t-descr">' + value['title'] + '</div>' +
                        '<div class="t-site-search-dm__result__body t-text">' + value['highlight'] + '</div>' +
                        '</a>' +
                        '</div>';
                }
            });
            html += '</div>';

            if (sResults.search['pagin'] > 1) {
                html += '<hr style="opacity: 0.2; margin-top: 20px; margin-bottom: 20px;">';
                html += '<div class="t-site-search-pu__pagination">';
                for (var p = 1; p <= sResults.search['pagin']; p++) {
                    if (p == currentPage) {
                        html += '<button disabled="disabled" class="t-text" page="' + p + '">' + p + '</button>';
                        continue;
                    }
                    html += '<button class="t-text" page="' + p + '">' + p + '</button>';
                }
                html += '</div>';
            }
            html += '</div>';
        } else if (sResults.search['total'] === 0 && !initUp) {
            html += '<div class="t-site-search-dm__result t-text">' + translation.noResult[userLang] + '</div></div>';
        }
        html += '</div>';
        setTimeout(function () {
            t_searchHelp__justHidePopup();

            document.body.classList.add('body-fix');

            var currentInputParent = window.currentInput.closest('div.t-site-search-input');

            if (currentInputParent) {
                if (currentInputParent.hasAttribute('data-sidemenu-search')) {
                    document.body.insertAdjacentHTML('beforeend', html);
                } else {
                    currentInputParent.insertAdjacentHTML('afterend', html);
                }
            }

            var searchPopupPreloader = document.querySelector('.t-site-search-popup__preloader');
            if (searchPopupPreloader) {
                searchPopupPreloader.style.display = 'block';
            }
        }, 10);
    }

    function t_searchHelp__hidePopup() {
        document.body.classList.remove('body-fix');
        var searchPopupBg = document.querySelector('.t-site-search-popup__background');
        if (searchPopupBg) {
            searchPopupBg.remove();
        }
        window.currentInput.focus();
    }

    function t_searchHelp__justHidePopup() {
        document.body.classList.remove('body-fix');
        var searchPopupBg = document.querySelector('.t-site-search-popup__background');
        if (searchPopupBg) {
            searchPopupBg.remove();
        }
    }

    function t_searchHelp__searchDMClose() {
        lastQuery = '';
        lastQueryPage = 0;
        var searchDM = document.querySelector('.t-site-search-dm');
        var searchAnswerPopup = document.querySelector('.t-site-search-answerpopup');
        if (searchDM && !searchAnswerPopup) {
            if (xhr) {
                xhr.abort();
            }
            searchDM.style.display = 'none';
        }
    }

    function t_searchHelp__completeAjax() {
        var query = window.currentInput.value;
        var currentInputParent = window.currentInput.closest('div');
        if (query.length > 1) {
            var currentInputClose = currentInputParent ? currentInputParent.querySelector('.t-site-search-close') : null;
            if (currentInputClose) {
                currentInputClose.style.display = 'block';
            }
        }
        var currentInputLoader = currentInputParent ? currentInputParent.querySelector('.t-site-search-loader') : null;
        if (currentInputLoader) {
            currentInputLoader.style.display = 'none';
        }
        var currentInputBtn = currentInputParent ? currentInputParent.querySelector('button') : null;
        if (currentInputBtn) {
            currentInputBtn.removeAttribute('disabled');
            currentInputBtn.style.opacity = 1;
        }
        var searchAllLoader = document.querySelector('.t-site-search-showAllLoader');
        if (searchAllLoader) {
            searchAllLoader.remove();
        }
    }

    function t_searchHelp__request(action, page) {
        var handler = {};
        page = page || 1;
        var cAction = action || 1;

        var query = window.currentInput ? window.currentInput.value : '';

        var project = 1241;
        var queryLangPrefix = '';
        if (window.tilda_help_language && window.tilda_help_language === 'EN') {
            project = 6518;
            queryLangPrefix = '&lang=en';
        }

        if (query.length < 2) {
            return;
        }
        if (xhr) {
            xhr.abort();
        }

        xhr = '';
        if (encodeURIComponent(query.trim()) !== lastQuery || page !== lastQueryPage) {
            lastQuery = encodeURIComponent(query.trim());
            lastQueryPage = page;
            var currentInputParent = window.currentInput.closest('div');
            var currentInputClose = currentInputParent ? currentInputParent.querySelector('.t-site-search-close') : null;
            if (currentInputClose) {
                currentInputClose.style.display = 'none';
            }
            if (cAction === 2) {
                t_searchHelp__displayPopup({
                    search: {}
                }, true);
                var currentInputBtn = currentInputParent ? currentInputParent.querySelector('button') : null;
                if (currentInputBtn) {
                    currentInputBtn.setAttribute('disabled', 'disabled');
                    currentInputBtn.style.opacity = 0.5;
                }
                currentPage = page;
            } else {
                var currentInputLoader = currentInputParent ? currentInputParent.querySelector('.t-site-search-loader') : null;
                if (currentInputLoader) {
                    currentInputLoader.style.display = 'block';
                }
                currentPage = 1;
            }

            // Поиск по сайту
            var request = new XMLHttpRequest();
            request.open('GET', 'https://search.tildacdn.com/search/?p=' + project + '&q=' + encodeURIComponent(query) + '&page=' + page);
            request.send();
            request.onprogress = function () {
                handler.search = JSON.parse(request.response);
                t_searchHelp__renderAnswer(handler, cAction);
            };
            request.onload = function () {
                t_searchHelp__completeAjax();
            };
            request.onerror = function () {
                if (request.status === 0) {
                    return;
                }
                var failData = {
                    total: 1,
                    error: true,
                    pages: {
                        0: {
                            id: 0,
                            pageurl: '#',
                            title: translation.errorOccurred[userLang],
                            highlight: translation.errorOccurredText[userLang] + ' ' + request.statusText + ' ' + request.response
                        }
                    }
                };
                handler.search = failData;
            };

            // Поиск среди Answers
            if (page === 1) {
                var requestAnswers = new XMLHttpRequest();
                requestAnswers.open('GET', 'https://answers.tilda.cc/api/search?q=' + encodeURIComponent(query.trim()) + queryLangPrefix);
                requestAnswers.send();
                requestAnswers.onprogress = function () {
                    handler.answers = JSON.parse(requestAnswers.response).slice(0, 3);
                    t_searchHelp__renderAnswer(handler, 1);
                };
                requestAnswers.onload = function () {
                    t_searchHelp__completeAjax();
                };
            }
        }
    }

    function t_searchHelp__renderAnswer(data, cAction) {
        if (cAction === 1) {
            t_searchHelp__displayDownMenu(data);
        } else {
            t_searchHelp__displayPopup(data);
        }
    }

    function t_searchHelp__escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }
    // Polyfill: Element.prototype.matches
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.oMatchesSelector;
    }
    // Polyfill: Element.closest
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;

            while (el && el.nodeType === 1) {
                if (Element.prototype.matches.call(el, s)) {
                    return el;
                }
                el = el.parentElement || el.parentNode;
            }

            return null;
        };
    }
    // Polyfill: Element.prototype.remove
    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }
}