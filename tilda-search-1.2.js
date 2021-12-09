/**
 * tilda-search work with block T838, T985, ME901
 */
if (document.readyState !== 'loading') {
    t_search__init();
} else {
    document.addEventListener('DOMContentLoaded', t_search__init);
}

function t_search__init() {
    var styleTag = '<style>@-webkit-keyframes rotate360{to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes rotate360{to{-moz-transform:rotate(360deg);transform:rotate(360deg)}}@-o-keyframes rotate360{to{-o-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotate360{to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}.t-site-search-input input::-ms-clear{display:none}.t-site-search-dm{z-index:9999;position:absolute;-webkit-box-shadow:0 2px 10px rgba(0,0,0,.1);-moz-box-shadow:0 2px 10px rgba(0,0,0,.1);box-shadow:0 2px 10px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.05);background-color:#fff;max-height:70vh;overflow-y:scroll;right:0;left:0;text-align:left}.t-site-search-dm__result{margin:15px}.t-site-search-dm__result a{color:#111!important;text-decoration:none}.t-site-search-dm__result__title{color:#000;text-align:left;font-size:20px;margin-bottom:3px;height:auto;display:block!important}.t-site-search-dm__result__product_title b,.t-site-search-dm__result__title b{font-weight:600}.t-site-search-close,.t-site-search-loader{position:absolute;display:none;top:0;bottom:0;margin:auto;right:20px}.t-site-search-loader{-webkit-animation:rotate360 2s linear infinite;-moz-animation:rotate360 2s linear infinite;-o-animation:rotate360 2s linear infinite;animation:rotate360 2s linear infinite;opacity:.7}.t-site-search-close{opacity:.8;cursor:pointer}.t-site-search-popup__preloader{-webkit-animation:rotate360 2s linear infinite;-moz-animation:rotate360 2s linear infinite;-o-animation:rotate360 2s linear infinite;animation:rotate360 2s linear infinite;margin-left:15px;display:none}.t-site-search-dm__result__body{font-size:14px;text-align:left;color:#323232}.t-site-search-dm__result__product,.t-site-search-dm__result__product_text{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.t-site-search-dm__result__product_text{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-moz-box-orient:vertical;-moz-box-direction:normal;-ms-flex-direction:column;flex-direction:column}.t-site-search-dm__result__product_img{position:absolute;top:0;bottom:0;left:0;right:0;-webkit-background-size:cover;-moz-background-size:cover;background-size:cover;background-position:center;background-repeat:no-repeat}.t-site-search-dm__result__product_title{color:#000;text-align:left;font-size:20px;margin-bottom:3px;height:auto;display:block;line-height:22px}.t-site-search-dm__result__product_price{color:rgba(0,0,0,.55);margin-top:2px}.t-site-search-dm__allresultslink{padding-bottom:30px;padding-right:20px;text-decoration:underline!important;color:#000!important;float:right;cursor:pointer}.t-site-search-popup,.t-site-search-popup__background{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.t-site-search-popup__background{position:fixed;top:0;right:0;bottom:0;left:0;overflow-y:auto;-webkit-transition:opacity ease-in-out .3s;-moz-transition:opacity ease-in-out .3s;-o-transition:opacity ease-in-out .3s;transition:opacity ease-in-out .3s;width:100%;height:100%;padding:0 20px;background-color:rgba(0,0,0,.6);z-index:9999999}.t-site-search-popup{z-index:100000;padding:60px 60px 0!important;-webkit-box-shadow:0 2px 10px rgba(0,0,0,.1);-moz-box-shadow:0 2px 10px rgba(0,0,0,.1);box-shadow:0 2px 10px rgba(0,0,0,.1);border:1px solid rgba(0,0,0,.05);background-color:#fff;margin:5vh auto;min-height:90vh}.t-site-search-pu__close img{width:25px;opacity:1;float:right;margin-right:-35px;cursor:pointer;margin-top:-40px}.t-site-search-pu__pagination{margin-bottom:40px;display:block}.t-site-search-pu__pagination-active{pointer-events:none;color:gray}.t-site-search-pu__pagination span{margin:0 15px 0 0}.t-site-search-pu__pagination span:first-child{margin-left:0}.t-site-search-pu__pagination span:last-child{margin-right:0}.t-site-search-pu__pagination span[page]{cursor:pointer;font-size:16px;font-weight:700;width:30px;max-width:30px;height:30px;line-height:32px;display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center}.body-fix{height:100vh;min-height:100vh;overflow:hidden}@media screen and (max-width:620px){.t-site-search-popup{padding:60px 20px 0!important;top:0;margin-bottom:0}.t-site-search-pu__close img{margin-right:-5px;margin-top:-40px}}.t-site-search-dm__thubmnail{display:-webkit-box;display:-ms-flexbox;display:-webkit-flex;display:-moz-box;display:flex;-webkit-box-align:center;-ms-flex-align:center;-webkit-align-items:center;-moz-box-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;-webkit-justify-content:center;-moz-box-pack:center;justify-content:center;border:1px solid #eee;margin-right:15px;min-width:70px;max-width:70px;min-height:70px;max-height:70px;position:relative}</style>';
    document.head.insertAdjacentHTML('beforeend', styleTag);

    var inputFormWidth = 0;
    var inputFormLeft = 0;
    var timerID = 0;
    var currentInput;
    var currentPage;
    var xhr;

    var close_svg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxIiBoZWlnaHQ9IjEwMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOTguNjUgOTYuNTVMNTIuMTEgNDkuOTMgOTguMzYgMy41Yy41OS0uNTkuNTktMS40NyAwLTIuMDZhMS40MiAxLjQyIDAgMDAtMi4wNiAwTDUwLjA1IDQ3Ljg3IDMuNjkgMS40NGExLjQyIDEuNDIgMCAwMC0yLjA1IDAgMS40MiAxLjQyIDAgMDAwIDIuMDZsNDYuMzUgNDYuNDNMMS40NCA5Ni41NUExLjQyIDEuNDIgMCAwMDMuNCA5OC42bDQ2LjU1LTQ2LjYyTDk2LjUgOTguNmMuMy4zLjY4LjM5Ljk4LjM5LjMgMCAuNjgtLjEuOTgtLjQuNjgtLjU4LjY4LTEuNDYuMi0yLjA1eiIgZmlsbD0iIzExMSIgc3Ryb2tlPSIjMTExIi8+PC9zdmc+';
    var loader_svg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0IiBmaWxsPSJub25lIj48c3R5bGU+LmF7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlOiM3RjdGN0Y7fS5ie3N0cm9rZS1saW5lam9pbjpiZXZlbDtzdHJva2Utd2lkdGg6MjtzdHJva2U6IzdGN0Y3Rjt9PC9zdHlsZT48cGF0aCBkPSJNMzMgMUM0MC43IDEgNDguNCAzLjkgNTQuMiA5LjggNjQuOSAyMC41IDY1LjggMzcuMiA1NyA0OUw1MSA1NSIgY2xhc3M9ImEiLz48cGF0aCBkPSJNMzEgNjNDMjMuMyA2MyAxNS42IDYwLjEgOS44IDU0LjIgLTAuOSA0My41LTEuOCAyNi44IDcgMTVMMTMgOSIgY2xhc3M9ImEiLz48cGF0aCBkPSJNNTEgNDRWNTVINjIiIGNsYXNzPSJiIi8+PHBhdGggZD0iTTEzIDIwVjlIMiIgY2xhc3M9ImIiLz48L3N2Zz4=';

    var lang = window.browserLang;

    var translation = {
        placeholder: {
            EN: 'Search',
            RU: 'Поиск',
            FR: 'Rechercher',
            DE: 'Suche',
            ES: 'Buscar',
            PT: 'Procurar',
            UK: 'Пошук',
            JA: '探す',
            ZH: '搜索',
            PL: 'Wyszukiwanie',
            KK: 'Іздеу',
            IT: 'Ricerca',
            LV: 'Meklēt',
        },
        noResult: {
            EN: 'Nothing found',
            RU: 'Ничего не найдено',
            FR: 'Rien n\'a été trouvé',
            DE: 'Nichts gefunden',
            ES: 'Nada Encontrado',
            PT: 'Nada encontrado',
            UK: 'Нічого не знайдено',
            JA: '何も見つかりません',
            ZH: '没有发现',
            PL: 'Nic nie znaleziono',
            KK: 'Ештеңе табылмады',
            IT: 'Non abbiamo trovato nulla',
            LV: 'Nekas nav atrasts',
        },
        showAll: {
            EN: 'Show all results',
            RU: 'Показать все результаты',
            FR: 'Afficher tous les résultats',
            DE: 'Alle Ergebnisse anzeigen',
            ES: 'Mostrar todos los resultados',
            PT: 'Mostrar todos os resultados',
            UK: 'Показати всі результати',
            JA: 'すべての検索結果を表示',
            ZH: '显示所有结果',
            PL: 'Pokaż wszystko',
            KK: 'Барлық нәтижелерді көрсету',
            IT: 'Mostra tutti i risultati',
            LV: 'Rādīt visus rezultātus',
        },
        showAlltitle: {
            EN: 'Results for',
            RU: 'Результаты по запросу',
            FR: 'Résultats pour',
            DE: 'Ergebnisse für',
            ES: 'Resultados para',
            PT: 'Resultados para',
            UK: 'Результати за запитом',
            JA: 'の結果：',
            ZH: '结果：',
            PL: 'Wyniki wyszukiwania',
            KK: 'Арналған нәтижелері',
            IT: 'Risultati per',
            LV: 'Rezultāti par',
        },
        errorOccurred: {
            EN: 'An error occurred while sending the request',
            RU: 'При отправке запроса произошла ошибка',
            FR: 'Une erreur est survenue pendant l\'envoi de la demande',
            DE: 'Fehler beim Senden der Anforderung',
            ES: 'Se produjo un error al enviar la solicitud',
            PT: 'Ocorreu um erro ao enviar o pedido',
            UK: 'При відправленні запиту виникла помилка',
            JA: 'リクエストを送信中にエラーが発生しました',
            ZH: '发送请求时出错',
            PL: 'Wystąpił błąd podczas wysyłania żądania',
            KK: 'Сұрау жіберу кезінде қате пайда болды',
            IT: 'Si è verificato un errore durante l\'invio della richiesta',
            LV: 'Radās kļūda nosūtot pieprasījumu',
        },
        errorOccurredText: {
            EN: 'The server could not respond to the request',
            RU: 'Сервер не смог ответить на запрос',
            FR: 'Le serveur n\'a pas pu répondre à la demande',
            DE: 'Der Server konnte nicht auf die Anfrage antworten',
            ES: 'El servidor no ha podido responder a la solicitud',
            PT: 'O servidor não conseguiu responder ao pedido',
            UK: 'Сервер не зміг відповісти на запит',
            JA: 'サーバが要求に応答することができませんでした',
            ZH: '服务器无法响应请求',
            PL: 'Serwer nie odpowiada',
            KK: 'Сервер сұрауына жауап алмады,',
            IT: 'Il server non ha potuto rispondere alla richiesta',
            LV: 'Serveris nevarēja atbildēt uz pieprasījumu',
        },
        description: {
            EN: 'Description',
            RU: 'Описание',
            FR: 'La description',
            DE: 'Beschreibung',
            ES: 'Descripción',
            PT: 'Descrição',
            UK: 'Опис',
            JA: '説明',
            ZH: '描述',
            PL: 'Opis',
            KK: 'Сипаттамасы',
            IT: 'Descrizione',
            LV: 'Apraksts',
        }

    };

    var eventOnChangeScreenVal = window.isMobile ? 'orientationchange' : 'resize';

    window.addEventListener(eventOnChangeScreenVal, t_search__searchDMClose);

    var siteSearchInputs = document.querySelectorAll('.t-site-search-input input');
    Array.prototype.forEach.call(siteSearchInputs, function (siteSearchInput) {
        if (!siteSearchInput.getAttribute('placeholder')) {
            siteSearchInput.setAttribute('placeholder', translation.placeholder[lang]);
        }
        siteSearchInput.addEventListener('keyup', function (e) {
            if (e.keyCode === 13) {
                currentInput = siteSearchInput;
                t_search__requestSth(2);
                siteSearchInput.blur();
            }
            if (e.keyCode === 27) {
                var siteSearchDM = document.querySelectorAll('.t-site-search-dm');
                if (siteSearchDM.length) {
                    t_search__searchDMClose();
                    e.preventDefault();
                }
            }
        });
    });

    if ('URLSearchParams' in window) {
        var search = new URLSearchParams(window.location.search);
        var query = search.get('search');
        var slice = search.get('slice');
        if (slice === null) {
            slice = 1;
        }
        if (query !== null) {
            var newInput = document.createElement('input');
            newInput.value = t_search__escapeHtml(query);
            currentInput = newInput;
            currentPage = slice;
            t_search__requestSth(2, slice, query);
        }
    }

    function t_search__waitEscPressed(e) {
        if (e.keyCode == 27) {
            var siteSearchDM = document.querySelectorAll('.t-site-search-dm');
            var siteSearchPopup = document.querySelectorAll('.t-site-search-popup');
            if (siteSearchDM.length) {
                t_search__searchDMClose();
                e.preventDefault();
            }
            if (siteSearchPopup.length) {
                t_search__hidePopup();
                if (xhr) {
                    xhr.abort();
                }
                e.preventDefault();
            }
        }
    }

    function t_search__waitClickDone(e) {
        if (e.target.closest('.t-site-search-pu__close img')) {
            var searchCloseImg = document.querySelectorAll('.t-site-search-pu__close img');
            if (searchCloseImg.length) {
                t_search__hidePopup();
                if (xhr) {
                    xhr.abort();
                }
            }
        }

        if (!e.target.closest('.t-site-search-dm') &&
            e.target.closest('input') !== currentInput) {
            t_search__searchDMClose();
        }

        if (!e.target.closest('.t-site-search-popup')) {
            var siteSearchPopup = document.querySelectorAll('.t-site-search-popup');
            if (siteSearchPopup.length) {
                t_search__hidePopup();
                if (xhr) {
                    xhr.abort();
                }
            }
        }

        if (e.target.closest('.t-site-search-close')) {
            t_search__searchDMClose();
            var targetParent = e.target.closest('div');
            targetParent.querySelector('input').value = '';
            e.target.style.display = 'none';
        }
    }

    /**
     * Adding to input close btn and hidden loader. Add event oninput
     */
    function t_search__inputInit() {
        var searchInputs = document.querySelectorAll('.t-site-search-input input');
        Array.prototype.forEach.call(searchInputs, function (searchInput) {
            searchInput.insertAdjacentHTML('afterend', '<img width="18px" class="t-site-search-loader" src="' + loader_svg + '">');
            searchInput.insertAdjacentHTML('afterend', '<img width="18px" class="t-site-search-close" src="' + close_svg + '">');
            searchInput.addEventListener('input', function (e) {
                var currentSearchInput = e.target.closest('input');
                var parentBlock = e.target.closest('div.t-site-search-input');
                var parentBlockAttr = parentBlock ? parentBlock.getAttribute('data-onlypopup') : '';
                var documentHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );
                var searchInputTopPos = currentSearchInput ? currentSearchInput.getBoundingClientRect().top : 0;
                if (parentBlockAttr) {
                    return false;
                }
                if (documentHeight - (searchInputTopPos + window.pageYOffset) < 400) {
                    return false;
                }
                currentInput = currentSearchInput;
                if (currentInput.value.length >= 2) {
                    if (timerID > 0) {
                        clearTimeout(timerID);
                    }
                    timerID = setTimeout(function () {
                        t_search__requestSth(1);
                    }, 300);
                }
                if (currentInput.value.length === 0) {
                    var currentInputParent = currentInput.closest('div');
                    var currentInputImgClose = currentInputParent.querySelector('img.t-site-search-close');
                    if (currentInputImgClose) {
                        currentInputImgClose.style.display = 'none';
                    }
                }
            });
        });
    }

    t_search__inputInit();

    function t_search__setBtnEvent() {
        var searchInputBtns = document.querySelectorAll('.t-site-search-input button');
        Array.prototype.forEach.call(searchInputBtns, function (searchInputBtn) {
            searchInputBtn.addEventListener('click', function (e) {
                var btnParent = searchInputBtn.closest('div.t-site-search-input');
                if (btnParent && btnParent.querySelector('input')) {
                    currentInput = btnParent.querySelector('input');
                    t_search__requestSth(2);
                }
                e.target.blur();
            });
        });
    }

    t_search__setBtnEvent();


    function t_search__setInputsEvent() {
        var searchBlockList = document.querySelectorAll('.t-site-search-input');
        Array.prototype.forEach.call(searchBlockList, function (searchBlock) {
            searchBlock.addEventListener('click', function (e) {
                if (e.target.closest('.t-site-search-dm__allresultslink')) {
                    t_search__requestSth(2);
                }
            });
        });
    }

    t_search__setInputsEvent();

    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.t-site-search-pu__pagination span[page]')) {
            var currentEl = e.target.closest('.t-site-search-pu__pagination span[page]');
            currentEl.setAttribute('disabled', 'disabled');
            var currentPage = currentEl.getAttribute('page');
            t_search__requestSth(2, currentPage);
        }
    });

    function t_search__displayDownMenu(sResults) {
        document.body.addEventListener('keyup', t_search__waitEscPressed);
        document.body.addEventListener('click', t_search__waitClickDone);

        var siteSearchDMList = document.querySelectorAll('.t-site-search-dm');
        Array.prototype.forEach.call(siteSearchDMList, function (siteSearchDM) {
            siteSearchDM.remove();
        });

        var html = '<div class="t-site-search-dm" style="width: ' + inputFormWidth + 'px !important; left: ' + inputFormLeft + 'px !important">';
        if (sResults['total'] > 0) {
            Array.prototype.forEach.call(sResults['pages'], function (value) {
                var title = value['title'];
                var highlight = value['highlight'];
                var pageurl = value['pageurl'];

                if (sResults['error'] === true) {
                    html += '<div class="t-site-search-dm__result">' +
                        '<div class="t-site-search-dm__result__title t-text">' + title + '</div>' +
                        '<div class="t-site-search-dm__result__body t-text">' + highlight + '</div>' +
                        '</div>';
                } else if (typeof value['product'] !== 'undefined') {
                    var title = value['product']['title'].length < 2 ? value['highlight'] : value['product']['title'];
                    var currency = value['product']['currency'];
                    var currency_dec = value['product']['currency_dec'];
                    /* TODO: add separator */
                    // var currency_sep = value['product']['currency_sep'];
                    var currency_side = value['product']['currency_side'];
                    /* TODO: add old_price */
                    // var priceold = value['product']['priceold'] || '';
                    var price = (currency_dec === '' ? parseFloat(value['product']['price']) : value['product']['price']) || '';
                    if (currency !== '' && price !== '') {
                        price = currency_side === 'r' ? price + ' ' + currency : currency_side === 'l' ? currency + ' ' + price : price;
                    }
                    var img = value['product']['img'];

                    html += '<div class="t-site-search-dm__result">' +
                        '<a class="t-site-search-dm__result__product" target="_blank" href="' + pageurl + '">' +
                        '<div class="t-site-search-dm__thubmnail">' +
                        '<div class="t-site-search-dm__result__product_img" style="background-image:url(\'' + img + '\')"></div>' +
                        '</div>' +
                        /* TODO: add old_price with strike and currency (left,right position) */
                        '<div class="t-site-search-dm__result__product_text">' +
                        '<div class="t-site-search-dm__result__product_title t-text">' + title + '</div>' +
                        '<div class="t-site-search-dm__result__product_price t-text">' + price + '</div>' +
                        '</div>' +
                        '</a>' +
                        '</div>';
                } else {
                    html += '<div class="t-site-search-dm__result">' +
                        '<a target="_blank" href="' + pageurl + '">' +
                        '<div class="t-site-search-dm__result__title t-text">' + title + '</div>' +
                        '<div class="t-site-search-dm__result__body t-text">' + highlight + '</div>' +
                        '</a>' +
                        '</div>';
                }
            });
            if (sResults['total'] > 10) {
                html += '<a class="t-site-search-dm__allresultslink t-descr">' + translation.showAll[lang] + '</a>';
            }
            var closeImages = document.querySelectorAll('.tilda-site-search-close-img');
            Array.prototype.forEach.call(closeImages, function (closeImg) {
                closeImg.style.display = 'inline';
            });

        } else {
            html += '<div class="t-site-search-dm__result">' +
                '<div class="t-site-search-dm__result__title t-text">' + translation.noResult[lang] + '</div>' +
                '</div>';
        }
        html += '</div>';
        currentInput.insertAdjacentHTML('afterend', html);
        var currentInputParent = currentInput.closest('div');
        var currentParentClose = currentInputParent ? currentInputParent.querySelector('.t-site-search-close') : null;
        if (currentParentClose) {
            if (currentParentClose.style.display === 'none') {
                currentParentClose.style.display = 'block';
            } else {
                currentParentClose.style.display = '';
            }
        }
        currentInput.insertAdjacentHTML('afterend', html);
    }

    /**
     * create Popup
     * @param {Object} sResults response 
     * @param {Boolean} initUp - show preloader animation or not
     */
    function t_search__displayPopup(sResults, initUp) {
        initUp = initUp || false;

        document.body.addEventListener('keyup', t_search__waitEscPressed);
        document.body.addEventListener('click', t_search__waitClickDone);

        if ('URLSearchParams' in window) {
            var search = new URLSearchParams(window.location.search);
            var query = search.get('search');
            var slice = search.get('slice');
            if (currentInput) {
                if (query !== currentInput.value) {
                    search.set('search', t_search__escapeHtml(currentInput.value));
                }
            }
            if (slice !== currentPage && currentPage > 0) {
                search.set('slice', currentPage > 0 ? currentPage : 1);
            }

            try {
                window.history.replaceState(null, '', window.location.pathname.replace(/\/+/g, '/') + '?' + search.toString());
            } catch (e) { /* */ }
        }

        var siteSearchDMList = document.querySelectorAll('.t-site-search-dm');
        Array.prototype.forEach.call(siteSearchDMList, function (siteSearchDM) {
            siteSearchDM.remove();
        });

        var html = '<div class="t-site-search-popup__background">' +
            '<div class="t-site-search-popup t-width t-width_8">' +
            '<div class="t-site-search-pu__close">' +
            '<img style="width:20px" src="' + close_svg + '">' +
            '</div>' +
            '<div class="t-site-search-pu">';

        if (sResults['error'] !== true) {
            html += '<h3 class="t-title" style="margin: 15px; margin-bottom: 25px; margin-top: 0">' + translation.showAlltitle[lang] + ': ' + t_search__escapeHtml(currentInput.value) + '</h3>';
        }

        if (initUp) {
            html += '<img width="24px" class="t-site-search-popup__preloader" src="' + loader_svg + '" />';
        }

        if (sResults['total'] > 0 && typeof sResults['pages'] !== 'undefined') {
            Array.prototype.forEach.call(sResults['pages'], function (value) {
                var title = value['title'];
                var highlight = value['highlight'];
                var pageurl = value['pageurl'];

                if (sResults['error'] === true) {
                    html += '<div class="t-site-search-dm__result">' +
                        '<div class="t-site-search-dm__result__title t-descr">' + title + '</div>' +
                        '<div class="t-site-search-dm__result__body t-text">' + highlight + '</div>' +
                        '</div>';
                } else if (typeof value['product'] !== 'undefined') {
                    var title = value['product']['title'].length < 2 ? value['highlight'] : value['product']['title'];
                    var currency = value['product']['currency'];
                    var currency_dec = value['product']['currency_dec'];
                    /* TODO: add separator */
                    // var currency_sep = value['product']['currency_sep'];
                    var currency_side = value['product']['currency_side'];
                    /* TODO: add old_price */
                    // var priceold = value['product']['priceold'] || '';
                    var price = (currency_dec === '' ? parseFloat(value['product']['price']) : value['product']['price']) || '';
                    if (currency !== '' && price !== '') {
                        price = currency_side === 'r' ? price + ' ' + currency : currency_side === 'l' ? currency + ' ' + price : price;
                    }
                    var img = value['product']['img'];

                    html += '<div class="t-site-search-dm__result">' +
                        '<a class="t-site-search-dm__result__product" target="_blank" href="' + pageurl + '">' +
                        '<div class="t-site-search-dm__thubmnail">' +
                        '<div class="t-site-search-dm__result__product_img" style="background-image:url(\'' + img + '\')"></div>' +
                        '</div>' +
                        /* TODO: add old_price with strike and currency (left,right position) */
                        '<div class="t-site-search-dm__result__product_text">' +
                        '<div class="t-site-search-dm__result__product_title t-text">' + title + '</div>' +
                        '<div class="t-site-search-dm__result__product_price t-text">' + price + '</div>' +
                        '</div>' +
                        '</a>' +
                        '</div>';
                } else {
                    html += '<div class="t-site-search-dm__result">' +
                        '<a target="_blank" href="' + pageurl + '">' +
                        '<div class="t-site-search-dm__result__title t-descr">' + title + '</div>' +
                        '<div class="t-site-search-dm__result__body t-text">' + highlight + '</div>' +
                        '</a>' +
                        '</div>';
                }

            });
            html += '</div>';

            /* TODO: prettie pagination */
            if (sResults['pagin'] > 1) {
                html += '<hr style="opacity: 0.2; margin-top: 20px; margin-bottom: 20px">';
                html += '<div class="t-site-search-pu__pagination">';
                for (var page = 1; page <= sResults['pagin']; page++) {
                    if (page == currentPage) {
                        html += '<span class="t-text t-site-search-pu__pagination-active" page="' + page + '">' + page + '</span>';
                        continue;
                    }
                    html += '<span class="t-text" page="' + page + '">' + page + '</span>';
                }
                html += '</div>';
            }
            html += '</div>';
        } else if (sResults['total'] == 0 && !initUp) {
            html += '<div class="t-site-search-dm__result t-text">' + translation.noResult[lang] + '</div></div>';
            var siteSearchPreloader = document.querySelector('.t-site-search-popup__preloader');
            if (siteSearchPreloader) {
                siteSearchPreloader.style.display = 'none';
            }
        } else if (typeof sResults['pages'] === 'undefined' && sResults['total'] > 0 && sResults['pagin'] > 0) {
            html += '<div class="t-site-search-dm__result t-text">' + translation.noResult[lang] + '</div></div>';
            var siteSearchPreloader = document.querySelector('.t-site-search-popup__preloader');
            if (siteSearchPreloader) {
                siteSearchPreloader.style.display = 'none';
            }
        }
        html += '</div>';

        var siteSearchPopupBgList = document.querySelectorAll('.t-site-search-popup__background');
        Array.prototype.forEach.call(siteSearchPopupBgList, function (siteSearchPopupBg) {
            siteSearchPopupBg.remove();
        });

        document.body.classList.add('body-fix');

        var currentInputPar = currentInput.closest('div.t-site-search-input');
        var currentInputParAttr = currentInputPar ? currentInputPar.getAttribute('data-sidemenu-search') : null;

        if (currentInput.parentElement || currentInputParAttr) {
            document.body.insertAdjacentHTML('beforeend', html);
        } else if (currentInputPar) {
            currentInputPar.insertAdjacentHTML('afterend', html);
        }

        var siteSearchPreloader = document.querySelector('.t-site-search-popup__preloader');
        if (siteSearchPreloader) {
            siteSearchPreloader.style.display = 'block';
        }
    }

    function t_search__hidePopup() {
        if ('URLSearchParams' in window) {
            var search = new URLSearchParams(window.location.search);
            var query = search.get('search');
            var slice = search.get('slice');

            if (query !== null) {
                search.delete('search');
            }
            if (slice !== null) {
                search.delete('slice');
            }

            try {
                if (search.toString() !== '') {
                    window.history.replaceState(null, '', window.location.pathname.replace(/\/+/g, '/') + '?' + t_search__escapeHtml(search.toString()));
                } else {
                    window.history.replaceState(null, '', window.location.pathname.replace(/\/+/g, '/'));
                }
            } catch (e) { /* */ }
        }
        document.body.classList.remove('body-fix');
        var siteSearchPopupBgList = document.querySelectorAll('.t-site-search-popup__background');
        Array.prototype.forEach.call(siteSearchPopupBgList, function (siteSearchPopupBg) {
            siteSearchPopupBg.remove();
        });

        document.body.removeEventListener('keyup', t_search__waitEscPressed);
    }

    function t_search__searchDMClose() {
        var siteSearchDM = document.querySelectorAll('.t-site-search-dm');
        if (siteSearchDM.length) {
            if (xhr) {
                xhr.abort();
            }
            Array.prototype.forEach.call(siteSearchDM, function (siteSearchDMEl) {
                siteSearchDMEl.remove();
            });

            document.body.removeEventListener('keyup', t_search__waitEscPressed);
        }
    }

    function t_search__requestSth(action, page, query) {
        page = parseInt(page, 10) || 1;
        var cAction = action || 1;
        var allRec = document.getElementById('allrecords');
        var project = allRec ? allRec.getAttribute('data-tilda-project-id') : '';

        if (currentInput && typeof query === 'undefined') {
            query = currentInput.value;
        }

        if (query.length < 2) {
            return;
        }

        if (xhr) {
            xhr.abort();
        }

        /**
         * remove close btn, search btn disabled, show loader
         */
        function t_search__getActionBeforeSend() {
            var currentInputParent = currentInput.closest('div');
            var currentInputClose = currentInputParent ? currentInputParent.querySelector('.t-site-search-close') : null;
            if (currentInputClose) {
                currentInputClose.style.display = 'none';
            }

            if (cAction === 2) {
                t_search__displayPopup({}, true);
                var currentInputBtn = currentInputClose ? currentInputClose.querySelector('button') : null;
                if (currentInputBtn) {
                    currentInputBtn.setAttribute('disabled', 'disabled');
                    currentInputBtn.style.opacity = 0.5;
                }
                currentPage = page;
            } else {
                var siteSearchLoader = currentInputParent ? currentInputParent.querySelector('.t-site-search-loader') : null;

                if (siteSearchLoader) {
                    if (siteSearchLoader.style.display === 'none') {
                        siteSearchLoader.style.display = 'block';
                    } else {
                        siteSearchLoader.style.display = '';
                    }
                }
                currentPage = 1;
            }
            inputFormWidth = currentInput.offsetWidth;
            // -1 for include currentInput border width
            inputFormLeft = currentInput.offsetLeft - 1;
        }
        t_search__getActionBeforeSend();

        //TODO при определении запроса в xhr, некорректно работает btn.t-submit, пока оставляю так
        xhr = '';
        var request = new XMLHttpRequest();
        request.open('GET', 'https://search.tildacdn.com/search/?p=' + project + '&q=' + encodeURIComponent(query) + '&page=' + page);
        request.send();
        request.onprogress = function () {
            if (cAction == 1) {
                t_search__displayDownMenu(JSON.parse(request.response));
            } else {
                t_search__displayPopup(JSON.parse(request.response));
            }
        };
        request.onload = function () {
            var currentInputParent = currentInput.closest('div');
            if (query.length > 1) {
                var currentSearchClose = currentInputParent ? currentInputParent.querySelector('.t-site-search-close') : null;
                if (currentSearchClose) {
                    currentSearchClose.style.display = 'block';
                }
            }
            var currentSearchLoader = currentInputParent ? currentInputParent.querySelector('.t-site-search-loader') : null;
            if (currentSearchLoader) {
                currentSearchLoader.style.display = 'none';
            }

            var currentSearchBtn = currentInputParent ? currentInputParent.querySelector('button') : null;
            if (currentSearchBtn) {
                currentSearchBtn.removeAttribute('disabled');
                currentSearchBtn.style.opacity = 1;
            }

            var searchAllLoaders = document.querySelectorAll('.t-site-search-showAllLoader');
            Array.prototype.forEach.call(searchAllLoaders, function (searchAllLoader) {
                searchAllLoader.remove();
            });
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
                        title: translation.errorOccurred[lang],
                        highlight: translation.errorOccurredText[lang] + '. ' + '<br>' + translation.description[lang] + ': ' + request.statusText + ' ' + request.responseText
                    }
                }
            };
            if (cAction == 1) {
                t_search__displayDownMenu(failData);
            } else {
                t_search__displayPopup(failData);
            }
        };
    }

    function t_search__escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function (el) {
            return map[el];
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