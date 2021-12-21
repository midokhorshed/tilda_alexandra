$(document).ready(function () {
    var timerID = 0,
        currentInput,
        currentPage,
        scrollPos,
        xhr,
        lang = window.browserLang;

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
        button: {
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
        loading: {
            EN: 'Search in progress...',
            RU: 'Идет поиск...',
            FR: 'Recherche en cours...',
            DE: 'Suche läuft...',
            ES: 'Búsqueda en curso...',
            PT: 'Pesquisa em andamento...',
            UK: 'Йде пошук...',
            JA: '進行中の検索',
            ZH: '搜索中',
            PL: 'Wyszukiwanie w toku...',
            KK: 'Іздеу жүріп жатыр...',
            IT: 'Ricerca in corso...',
            LV: 'Meklēšana notiek...',
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
        showMore: {
            EN: 'Show more',
            RU: 'Показать ещё',
            FR: 'Afficher plus',
            DE: 'Mehr anzeigen',
            ES: 'Mostrar más',
            PT: 'Mostrar mais',
            UK: 'Показати ще',
            JA: 'もっと見せる',
            ZH: '展示更多',
            PL: 'Pokaż więcej',
            KK: 'Көбірек көрсет',
            IT: 'Mostra di più',
            LV: 'Rādīt vairāk',
        },
        showAlltitle: {
            EN: ['result for:', 'results for:', 'results for:'],
            RU: ['результат по запросу:', 'результата по запросу:', 'результатов по запросу:'],
            FR: ['résultat pour:', 'résultats pour:', 'résultats pour:'],
            DE: ['Ergebnis für:', 'Ergebnisse für:', 'Ergebnisse für:'],
            ES: ['resultado para:', 'resultados para:', 'resultados para:'],
            PT: ['resultado para:', 'resultados para:', 'resultados para:'],
            UK: ['результат за запитом:', 'результати за запитом:', 'результатів за запитом:'],
            JA: ['の結果：', 'の結果：', 'の結果：'],
            ZH: ['结果：', '结果：', '结果：'],
            PL: ['wynik wyszukiwania:', 'wyniki wyszukiwania:', 'wyników wyszukiwania:'],
            KK: 'Арналған нәтижелері',
            IT: ['risultato per', 'risultati per', 'risultati per'],
            LV: ['rezultātu par', 'rezultāti par', 'rezultāti par'],
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
    function tsearchwidget_addListeners() {
        $('.t-search-widget__button').click(function() {
            tsearchwidget_drawSearchBar();
        });
        var linkhook = $('.t985').attr('data-search-hook');
        if (linkhook !== '') {
            $('body').on('click', 'a[href="' + linkhook + '"]', function(e) {
                tsearchwidget_drawSearchBar();
                e.preventDefault();
            });
        }
		$('body').on('click', 'a[href="#opensearch"]', function(e) {
			tsearchwidget_drawSearchBar();
			e.preventDefault();
		});
        $('body').on('click', '.t-search-widget__search-icon', function() {
            currentInput = $('input.t-search-widget__input');
            if (currentInput.val().length >= 2) {
                tsearchwidget__request(currentPage);
            }
        });
        $('body').on('click', 'span[page].t-search-widget__pagination-item', function() {
            $(this).addClass('t-search-widget__pagination-active');
            currentPage = $(this).attr('page');
            $('.t-search-widget__pagination').attr('data-search-active-page', currentPage);
            tsearchwidget__request(currentPage);
        });
        $('body').on('click', '.t-search-widget__loadmore-btn', function() {
            currentPage = parseInt($('.t-search-widget__pagination').attr('data-search-active-page'), 10) + 1;
            $(this).addClass('t-search-widget__spinner');
            tsearchwidget__request(currentPage, null, true);
            $('.t-search-widget__pagination-item[data-search-active-page="' + currentPage + '"]').addClass('t-search-widget__pagination-active');
            $('.t-search-widget__pagination').attr('data-search-active-page', currentPage);
        });
        $('body').on('click', '.t-search-widget__pagination-prev', function() {
            currentPage--;
            tsearchwidget__request(currentPage);
        });
        $('body').on('click', '.t-search-widget__pagination-next', function() {
            currentPage++;
            tsearchwidget__request(currentPage);
        });
        $('body').on('click', '.t985__searchvariant', function() {
            $('input.t-search-widget__input').val($(this).text());
            currentInput = $('input.t-search-widget__input');
            $('.t985__searchvariants').hide();
            tsearchwidget__request();
        });

        $('body').on('click', '.t-search-widget__close-icon', function() {
            tsearchwidget_hideOverlay();
        });
        $('body').on('click', '.t-search-widget__clear-icon', function() {
            tsearchwidget_clearInput();
            $(this).removeClass('t-search-widget__clear_show');
        });
        $('body').on('click', '.t-search-widget__overlay', function(e) {
            var target = $(e.target);
            if (!target.is('.t-search-widget__header, .t-search-widget__popup') && !target.parents().is('.t-search-widget__header, .t-search-widget__popup')) {
                tsearchwidget_hideOverlay();
            }
        });
        $('body').on('input', 'input.t-search-widget__input', function() {
            if ($(document).height() - $(this).offset().top < 400) {
                return false;
            }
            currentInput = $(this);
            if (currentInput.val().length >= 2) {
                if (timerID > 0) {
                    clearTimeout(timerID);
                }
                timerID = setTimeout(function() {
                    tsearchwidget__request();
                }, 300);
            }
            if (currentInput.val().length === 0) {
                tsearchwidget_clearInput();
                $('.t985__searchvariants').show();
            }
        });
        $('body').on('keyup', '.t-search-widget__input', function (event) {
            if (event.keyCode == 13) {
                currentInput = $(this);
                if (currentInput.val().length >= 2) {
                    tsearchwidget__request();
                    $(this).blur();
                }
            }
        });
    }

    tsearchwidget_addListeners();

    if ('URLSearchParams' in window) {
        var search = new URLSearchParams(window.location.search);
        var query = search.get('search');
        var slice = search.get('slice');
        if (slice === null) {
            slice = 1;
        }
        if (query !== null) {
            currentInput = $('<input value="' + escapeHtml(query) + '">');
            currentPage = slice;
            tsearchwidget_drawSearchBar();
            $('input.t-search-widget__input').val(query);
            tsearchwidget__request(slice, query);
        }
    }

    function tsearchwidget_drawSearchBar() {
        $('input.t-search-widget__input').val('');
        $('.t-search-widget__overlay').addClass('t-search-widget__overlay_opened');
        $('.t-search-widget__clear-icon').removeClass('t-search-widget__clear_show');
        $('input.t-search-widget__input').focus();
    }
    function tsearchwidget_clearInput() {
        tsearchwidget_clearURL();
        $('body').removeClass('t-search-widget__body-fix');
        $('.t-search-widget__input').val('');
        $('.t-search-widget__popup').remove();
        $('.t-search-widget__query-result').remove();
        $('.t-search-widget__header').removeClass('t-search-widget__header_popup-opened');
        currentPage = 1;
        $('.t985__searchvariants').show();
    }
    function tsearchwidget_hideOverlay() {
        $('body').removeClass('t-search-widget__body-fix');
        $('.t-search-widget__overlay').removeClass('t-search-widget__overlay_opened');
        $('.t-search-widget__clear-icon').removeClass('t-search-widget__clear_show');
        tsearchwidget_clearInput();
    }
    function tsearchwidget_clearURL() {
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
            if (search.toString() !== '') {
                history.replaceState(null, '', location.pathname + '?' + escapeHtml(search.toString()));
            } else {
                history.replaceState(null, '', location.pathname);
            }
        }
    }
    function tsearchwidget__drawOverlay() {
        $('.t-search-widget__header').addClass('t-search-widget__header_popup-opened');

        $('body').addClass('t-search-widget__body-fix');
        if (!$('.t-search-widget__popup').length) {
            var html =
                '<div class="t-search-widget__popup">' +
                    '<div class="t-container">' +
                    '<div class="t-search-widget__popup-container t-col t-col_8 t-prefix_2">' +
                        '<div class="t-search-widget__popup-preloaderwrapper">' +
                            '<div class="t-text t-text_md">' + translation.loading[lang] + '</div>' +
                        '</div>' +
                    '</div>' +
                    '</div>' +
                '</div>';

            $('.t-search-widget__overlay').append(html);
            $('.t-search-widget__popup-preloaderwrapper').show();
        }
    }
    function tsearchwidget__drawPopup(sResults, activePage) {
        activePage = activePage || 1;
        $('.t-search-widget__query-result').remove();
        $('.t-search-widget__popup-container').empty();
        $('.t-search-widget__resultwrapper').empty();
        $('.t-search-widget__productwrapper').remove();
        $('.t-search-widget__loadmore-btn-wrap').remove();


        if (sResults) {
            var resultNum = '<div class="t-container t-search-widget__query-result t-descr t-opacity_50">' + sResults.total + ' ' + tsearchwidget_pluralizeWord(sResults.total, translation.showAlltitle[lang]) + ' ' + escapeHtml(currentInput.val()) + '</div>';
            if (sResults.total && !sResults['error']) {
                $('.t-search-widget__popup-container').append(resultNum);
            }
            $('.t-search-widget__popup-container').append('<div class="t-search-widget__resultwrapper"></div>');

            tsearchwidget__appendResults(sResults, activePage);
        }
    }
    function tsearchwidget__appendResults(sResults, activePage) {
        if ('URLSearchParams' in window) {
            var search = new URLSearchParams(window.location.search);
            var query = search.get('search');
            var slice = search.get('slice');
            if (typeof currentInput !== 'undefined') {
                if (query !== currentInput.val()) {
                    search.set('search', escapeHtml(currentInput.val()));
                }
            }
            if (slice !== activePage && activePage > 0) {
                search.set('slice', activePage > 0 ? activePage : 1);
            }
            history.replaceState(null, '', location.pathname + '?' + search.toString());
        }
        var str = '';
        var productStr = '';
        if (sResults['total'] > 0 && typeof sResults['pages'] !== 'undefined') {
            $('.t-search-widget__popup-preloaderwrapper').hide();
            $.each(sResults['pages'], function (key, value) {
                if (sResults['error']) {
                    str +=
                    '<div class="t-search-widget__result t-search-widget__result_error">' +
                    '<div class="t-search-widget__result__title t-title">' +
                    value['title'] +
                    '</div>' +
                    '<div class="t-search-widget__result__body t-descr">' +
                    value['highlight'] +
                    '</div>' +
                    '</div>';
                } else if (typeof value['product'] !== 'undefined') {
                    var title = value['product']['title'].length < 10 ? value['highlight'] : value['product']['title'];
                    var desc = value['highlight'].replace(value['product']['title'], '').trim();
                    var price = parseFloat(value['product']['price']) || '';
                    productStr += '<div class="t-search-widget__result t-search-widget__result_product">';
                    productStr += '<a class="t-search-widget__result_product-link" target="_blank" href="' + value['pageurl'] + '">';
                    productStr += '<div class="t-search-widget__thubmnail">';
                    productStr += '<div class="t-search-widget__result_product-img" style="background-image:url(\'' + value['product']['img'] + '\')"></div>';
                    productStr += '</div>';
                    productStr += '<div class="t-search-widget__result_product-text">';
                    productStr += '<div class="t-search-widget__result_product-title t-name t-name_xs">';
                    productStr +=  title;
                    productStr += '</div>';
                    if (desc != '...') {
                        productStr += '<div class="t-search-widget__result_product-desc t-descr t-descr_xs">';
                        productStr += desc;
                        productStr += '</div>';
                    }
                    if (price !== '') {
                        productStr += '<div class="t-search-widget__result_product-price t-descr t-descr_xs">';
                        productStr += price + value['product']['currency'];
                        productStr += '</div>';
                    }
                    productStr += '</div>';
                    productStr += '</a>';
                    productStr += '</div>';
                } else {
                    str +=
                        '<div class="t-search-widget__result">' +
                            '<a target="_blank" href="' + value['pageurl'] + '">' +
                                '<div class="t-search-widget__result__title t-name t-name_xs">' +
                                    value['title'] +
                                '</div>' +
                                '<div class="t-search-widget__result__body t-descr t-descr_xs">' +
                                    value['highlight'] +
                                '</div>' +
                            '</a>' +
                        '</div>';
                }
            });
        } else if (sResults['total'] == 0) {
            str += '<div class="t-search-widget__notfound">';
            str += '<div class="t-search-widget__notfound-img"><svg width="35" height="43" viewBox="0 0 35 43" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.56"><path d="M15.1899 12.513C15.1899 11.3091 14.2139 10.3331 13.01 10.3331C11.8061 10.3331 10.8301 11.3091 10.8301 12.513C10.8301 13.7169 11.8061 14.6929 13.01 14.6929C14.2139 14.6929 15.1899 13.7169 15.1899 12.513Z" fill="#464646"/><path d="M24.9145 12.513C24.9145 11.3091 23.9385 10.3331 22.7346 10.3331C21.5307 10.3331 20.5547 11.3091 20.5547 12.513C20.5547 13.7169 21.5307 14.6929 22.7346 14.6929C23.9385 14.6929 24.9145 13.7169 24.9145 12.513Z" fill="#464646"/><path d="M22.9029 24.4184C22.9029 23.0263 20.6506 17.7111 17.8723 17.7111C15.094 17.7111 12.8418 23.0263 12.8418 24.4184C12.8418 24.4184 15.094 24.4185 17.8723 24.4185C20.6506 24.4185 22.9029 24.4184 22.9029 24.4184Z" fill="#464646"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 37.9787C0 35.2369 2.2227 33.0142 4.96454 33.0142H35V35.4964H4.96454C3.59362 35.4964 2.48227 36.6078 2.48227 37.9787C2.48227 39.3496 3.59362 40.461 4.96454 40.461H35V42.9432H4.96454C2.2227 42.9432 0 40.7205 0 37.9787Z" fill="#464646"/><path fill-rule="evenodd" clip-rule="evenodd" d="M34.9998 1.24119L34.9998 34.2554L32.5176 34.2554L32.5176 1.24119L34.9998 1.24119Z" fill="#464646"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 6.20567C0 2.77838 2.77838 0 6.20567 0H35V2.48227H6.20567C4.14929 2.48227 2.48227 4.14929 2.48227 6.20567V38.1028H0V6.20567Z" fill="#464646"/></g></svg></div>';
            str += '<div class="t-search-widget__result t-text">' + translation.noResult[lang] + '</div>';
            str += '</div>';
            $('.t-search-widget__popup-preloaderwrapper').hide();
        } else if (typeof sResults['pages'] === 'undefined' && sResults['total'] > 0 && sResults['pagin'] > 0) {
            str += '<div class="t-search-widget__result t-text">' + translation.noResult[lang] + '</div>';
            $('.t-search-widget__popup-preloaderwrapper').hide();
        }

        var wrapper = $('.t-search-widget__resultwrapper');
        if (productStr) {
            wrapper.append('<div class="t-search-widget__productwrapper">' + productStr + '</div>');
        }
        wrapper.append(str);
    }
    function tsearchwidget__appendPagination(page, sResults) {
        $('.t-search-widget__loadmore-btn-wrap').remove();
        $('.t-search-widget__pagination').remove();
        var str = '';
        if (sResults['pagin'] > 1 && page < sResults['pagin']) {
            str += '<div class="t-search-widget__loadmore-btn-wrap t-align_center"><div class="t-search-widget__loadmore-btn t-btn t-btn_sm">' + translation.showMore[lang] + '</div></div>';
        }
        if (sResults['pagin'] > 1) {
            str += '<div class="t-search-widget__pagination" data-search-active-page="' + page + '"></div>';
        }

        $('.t-search-widget__popup-container').append(str);

        $('.t-search-widget__pagination').append(tsearchwidget__createPagination(page, sResults['pagin']));
    }
    function tsearchwidget__createPagination(currentPage, totalcount) {
        var str = '';
        if (currentPage > 1) {
            str +=
                '<div class="t-search-widget__pagination-button t-search-widget__pagination-prev">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="black"/></svg>' +
                '</div>';
        }

        if (totalcount <= 6) {
            for (var i = 1; i <= totalcount; i++) {
                str += tsearchwidget__addPage(i, currentPage);
            }
        } else {
            str += tsearchwidget__addPage('1', currentPage);
            if (currentPage > 3) {
                str += '<span class="t-text t-search-widget__pagination-item t-search-widget__pagination-dots">...</span>';
            }
            if (currentPage == totalcount) {
                str += tsearchwidget__addPage(currentPage - 2, currentPage);
            }
            if (currentPage > 2) {
                str += tsearchwidget__addPage(currentPage - 1, currentPage);
            }
            if (currentPage != 1 && currentPage != totalcount) {
                str += tsearchwidget__addPage(currentPage, currentPage);
            }
            if (currentPage < totalcount - 1) {
                str += tsearchwidget__addPage(currentPage + 1, currentPage);
            }
            if (currentPage == 1) {
                str += tsearchwidget__addPage(currentPage + 2, currentPage);
            }
            if (currentPage < totalcount - 2) {
                str += '<span class="t-text t-search-widget__pagination-item t-search-widget__pagination-dots">...</span>';
            }
            if (totalcount > 1) {
                str += tsearchwidget__addPage(totalcount, currentPage);
            }
        }

        if (currentPage < totalcount) {
            str +=
                '<div class="t-search-widget__pagination-button t-search-widget__pagination-next">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="black"/></svg>' +
                '</div>';
        }
        return str;
    }
    function tsearchwidget__addPage(number, currentPage) {
        var str = '';
        str += '<span class="t-text t-search-widget__pagination-item';
        if (number == currentPage) {
            str += ' t-search-widget__pagination-active';
        }
        str += '" page="' + number + '">' + number + '</span>';
        return str;
    }
    function tsearchwidget__request(page, query, addPage) {
        page = parseInt(page, 10) || 1;
        var project = $('#allrecords').attr('data-tilda-project-id');
        var num = $('.t985').attr('data-search-showby') || 10;
		var descrLength = 50;
        $('.t985__searchvariants').hide();
        if (typeof currentInput !== 'undefined' && (typeof query === 'undefined' || query === null)) {
            query = currentInput.val();
        }

        if (query.length < 2) {
            return;
        }

        if (xhr) {
            xhr.abort();
        }

        xhr = $.ajax({
            type: 'GET',
            url: 'https://search.tildacdn.com/search/?p=' + project + '&q=' + encodeURIComponent(query) + '&page=' + page + '&num=' + num + '&hs=' + descrLength,
            success: function (data) {
                if (!addPage) {
                    tsearchwidget__drawPopup(data, page);
                    $('.t-search-widget__overlay').animate({scrollTop: 0}, 300);
                } else {
                    scrollPos = $('.t-search-widget__result').last().offset().top - $('.t-search-widget__overlay').offset().top + $('.t-search-widget__overlay').scrollTop() - $('.t-search-widget__result').last().height();
                    tsearchwidget__appendResults(data, page);
                    $('.t-search-widget__overlay').animate({scrollTop: scrollPos});
                }
                tsearchwidget__appendPagination(page, data);
                if (page == data['pagin']) {
                    $('.t-search-widget__loadmore-btn-wrap').remove();
                }
            },
            beforeSend: function () {
                currentInput.parent('div').children('.t-site-search-close').hide();
                $('.t-search-widget__clear-icon').removeClass('t-search-widget__clear_show');

                $('.t-search-widget__loading').show();
                tsearchwidget__drawOverlay();
                if ($(window).width <= 960) {
                    $('.t-search-widget__search-icon').hide();
                }
                currentPage = currentPage || 1;
            },
            complete: function () {
                if (query.length > 1) {
                    currentInput.parent('div').children('.t-site-search-close').show();
                }
                if ($(window).width <= 960) {
                    $('.t-search-widget__search-icon').show();
                }
                $('.t-search-widget__loading').hide();
                $('.t-search-widget__clear-icon').addClass('t-search-widget__clear_show');
                currentInput.parent('div').children('button').removeAttr('disabled').css('opacity', '1');
                $('.t-site-search-showAllLoader').remove();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (textStatus == 'abort') {
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
                            highlight: translation.errorOccurredText[lang] + '. ' + '<br>' + translation.description[lang] + ': ' + textStatus + ' ' + errorThrown
                        }
                    }
                };
                tsearchwidget__drawPopup(failData);
            },
            dataType: 'json'
        });
    }
    function escapeHtml(text) {
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
    function tsearchwidget_pluralizeWord(value, words) {
        value = Math.abs(value) % 100;
        var num = value % 10;
        if (typeof words === 'string') return words;
        if (value > 10 && value < 20) return words[2];
        if (num > 1 && num < 5) return words[1];
        if (num == 1) return words[0];
        return words[2];
    }
});