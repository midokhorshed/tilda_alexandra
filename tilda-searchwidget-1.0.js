$(document).ready(function () {
    var timerID = 0,
        currentInput,
        currentPage,
        xhr,
        loader_svg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0IiBmaWxsPSJub25lIj48c3R5bGU+LmF7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlOiM3RjdGN0Y7fS5ie3N0cm9rZS1saW5lam9pbjpiZXZlbDtzdHJva2Utd2lkdGg6MjtzdHJva2U6IzdGN0Y3Rjt9PC9zdHlsZT48cGF0aCBkPSJNMzMgMUM0MC43IDEgNDguNCAzLjkgNTQuMiA5LjggNjQuOSAyMC41IDY1LjggMzcuMiA1NyA0OUw1MSA1NSIgY2xhc3M9ImEiLz48cGF0aCBkPSJNMzEgNjNDMjMuMyA2MyAxNS42IDYwLjEgOS44IDU0LjIgLTAuOSA0My41LTEuOCAyNi44IDcgMTVMMTMgOSIgY2xhc3M9ImEiLz48cGF0aCBkPSJNNTEgNDRWNTVINjIiIGNsYXNzPSJiIi8+PHBhdGggZD0iTTEzIDIwVjlIMiIgY2xhc3M9ImIiLz48L3N2Zz4=',
        lang = window.browserLang;

    var translation = {
        placeholder: {
            RU: 'Поиск',
            EN: 'Search',
            UK: 'Пошук',
            PL: 'Wyszukiwanie',
        },
        button: {
            RU: 'Поиск',
            EN: 'Find',
            UK: 'Пошук',
            PL: 'Szukaj',
        },
        noResult: {
            RU: 'Ничего не найдено',
            EN: 'Nothing found',
            UK: 'Нічого не знайдено',
            PL: 'Nic nie znaleziono',
        },
        showMore: {
            RU: 'Показать ещё',
            EN: 'Show more',
            UK: 'Показати ще',
            PL: 'Pokaż więcej',
        },
        showAlltitle: {
            RU: [
                'результат по запросу:',
                'результата по запросу:',
                'результатов по запросу:',
            ],
            EN: ['result for:', 'results for:'],
            UK: [
                'результат за запитом:',
                'результати за запитом:',
                'результатів за запитом:',
            ],
            PL: [
                'wynik wyszukiwania:',
                'wyniki wyszukiwania:',
                'wyników wyszukiwania:',
            ],
        },
        errorOccurred: {
            RU: 'При отправке запроса произошла ошибка',
            EN: 'An error occurred while sending the request',
            UK: 'При відправленні запиту виникла помилка',
            PL: 'Wystąpił błąd podczas wysyłania żądania',
        },
        errorOccurredText: {
            RU: 'Сервер не смог ответить на запрос.<br>Описание: ',
            EN: 'The server could not respond to the request.<br>Description: ',
            UK: 'Сервер не зміг відповісти на запит.<br>Опис: ',
            PL: 'Serwer nie odpowiada<br>Opis: ',
        },
    };

    $('.t-search-widget__button').click(function () {
        tsearchwidget_drawSearchBar();
        tsearchwidget_clearInput();
    });

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
            tsearchwidget__request(slice, query);
        }
    }

    function tsearchwidget_drawSearchBar() {
        $('input.t-search-widget__input').val('');
        $('.t-search-widget__overlay').addClass('t-search-widget__overlay_opened');
        $('.t-search-widget__close-icon').on('click', function () {
            tsearchwidget_hideOverlay();
        });
        $('.t-search-widget__clear-icon').on('click', function () {
            tsearchwidget_clearInput();
            $(this).hide();
        });
        $('.t-search-widget__overlay').on('click', function (e) {
            var target = $(e.target);
            if (!target.is('.t-search-widget__header, .t-search-widget__popup') && !target.parents().is('.t-search-widget__header, .t-search-widget__popup')) {
                tsearchwidget_hideOverlay();
            }
        });
        $('input.t-search-widget__input').on('input', function () {
            if ($(document).height() - $(this).offset().top < 400) {
                return false;
            }
            currentInput = $(this);
            if (currentInput.val().length >= 2) {
                if (timerID > 0) {
                    clearTimeout(timerID);
                }
                timerID = setTimeout(function () {
                    tsearchwidget__request();
                }, 300);
            }
            if (currentInput.val().length === 0) {
                tsearchwidget_clearInput();
            }
        });
        $('.t-search-widget__input').on('keyup', function (event) {
            if (event.keyCode == 13) {
                currentInput = $(this);
                tsearchwidget__request();
                $(this).blur();
            }
        });
    }
    function tsearchwidget_clearInput() {
        tsearchwidget_clearURL();
        $('.t-search-widget__input').val('');
        $('.t-search-widget__popup').remove();
        $('.t-search-widget__query-result').remove();
        $('.t-search-widget__header').removeClass('t-search-widget__header_popup-opened');
        currentPage = 1;
    }
    function tsearchwidget_hideOverlay() {
        tsearchwidget_clearURL();
        $('.t-search-widget__overlay').removeClass('t-search-widget__overlay_opened');
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

    $('body').on('click', 'span[page].t-search-widget__pagination-item', function () {
        $(this).addClass('t-search-widget__pagination-active');
        currentPage = $(this).attr('page');
        $('.t-search-widget__pagination').attr('data-search-active-page', currentPage);
        tsearchwidget__request(currentPage);
    });
    $('body').on('click', '.t-search-widget__loadmore-btn', function () {
        currentPage = parseInt($('.t-search-widget__pagination').attr('data-search-active-page')) + 1;
        tsearchwidget__request(currentPage, undefined, true);
        $('.t-search-widget__pagination-item[data-search-active-page="' + currentPage + '"]').addClass('t-search-widget__pagination-active');
        $('.t-search-widget__pagination').attr('data-search-active-page', currentPage);
    });
    $('body').on('click', '.t-search-widget__pagination-prev', function () {
        currentPage--;
        tsearchwidget__request(currentPage);
    });
    $('body').on('click', '.t-search-widget__pagination-next', function () {
        currentPage++;
        tsearchwidget__request(currentPage);
    });

    function tsearchwidget__drawPopup(sResults, activePage) {
        activePage = activePage || 1;

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

        $('.t-search-widget__query-result').remove();
        $('.t-search-widget__popup-container').empty();
        $('.t-search-widget__resultwrapper').empty();
        $('.t-search-widget__productwrapper').remove();
        $('.t-search-widget__loadmore-btn-wrap').remove();
        // $('.t-search-widget__pagination').remove();

        if (!$('.t-search-widget__popup').length) {
            var html =
                '<div class="t-search-widget__popup">' +
                    '<div class="t-search-widget__popup-container t-container">' +
                        '<div class="t-search-widget__popup-preloaderwrapper">' +
                            '<img width="24px" class="t-search-widget__popup-preloader" src="' + loader_svg + '" />' +
                        '</div>' +
                    '</div>' +
                '</div>';

            $('.t-search-widget__overlay').append(html);
        }
        $('.t-search-widget__popup-container').append('<div class="t-search-widget__resultwrapper"></div>')
        var resultNum = '<div class="t-container t-search-widget__query-result t-descr t-opacity_50">' + sResults.total + ' ' + tsearchwidget_pluralizeWord(sResults.total, translation.showAlltitle[lang]) + ' ' + escapeHtml(currentInput.val()) + '</div>';
        if (sResults.total) {
            $('.t-search-widget__header').append(resultNum);
        }

        tsearchwidget__appendResults(sResults);

        $('.t-search-widget__header').addClass('t-search-widget__header_popup-opened');

        $('body').addClass('body-fix');

        $('.t-site-search-popup__preloader').show();
    }
    function tsearchwidget__appendResults(sResults) {
        var str = '';
        var productStr = '';
        if (sResults['total'] > 0 && typeof sResults['pages'] !== 'undefined') {
            $('.t-search-widget__popup-preloaderwrapper').hide();
            $.each(sResults['pages'], function (key, value) {
                if (sResults['error'] === true) {
                    str +=
                    '<div class="t-search-widget__result">' +
                    '<div class="t-search-widget__result__title t-descr">' + 
                    value['title'] + 
                    '</div>' +
                    '<div class="t-search-widget__result__body t-text">' + 
                    value['highlight'] + 
                    '</div>' +
                    '</div>';
                } else {
                    if (typeof value['product'] !== 'undefined') {
                        var title = value['product']['title'].length < 10 ? value['highlight'] : value['product']['title'];
                        var desc = value['highlight'].replace(value['product']['title'], '').trim().replace(/(.{50})..+/, '$1…');
                        var price = parseFloat(value['product']['price']) || '';
                        productStr +=
                            '<div class="t-search-widget__result t-search-widget__result_product">' +
                                '<a class="t-search-widget__result_product-link" target="_blank" href="' + value['pageurl'] + '">' +
                                    '<div class="t-search-widget__thubmnail">' +
                                        '<div class="t-search-widget__result_product-img" style="background-image:url(\'' + value['product']['img'] + '\')"></div>' +
                                    '</div>' +
                                    '<div class="t-search-widget__result_product-text">' +
                                        '<div class="t-search-widget__result_product-title t-text t-text_sm">' +
                                            title +
                                        '</div>' +
                                        '<div class="t-search-widget__result_product-desc t-text t-text_xs">' +
                                            desc +
                                        '</div>' +
                                        '<div class="t-search-widget__result_product-price t-text t-text_xs">' +
                                            price + value['product']['currency'] +
                                        '</div>' +
                                    '</div>' +
                                '</a>' +
                            '</div>';
                    } else {
                        str +=
                            '<div class="t-search-widget__result">' +
                                '<a target="_blank" href="' + value['pageurl'] + '">' +
                                    '<div class="t-search-widget__result__title t-descr">' +
                                        value['title'] +
                                    '</div>' +
                                    '<div class="t-search-widget__result__body t-text">' +
                                        value['highlight'] +
                                    '</div>' +
                                '</a>' +
                            '</div>';
                    }
                }
            });
        } else if (sResults['total'] == 0) {
            str += '<div class="t-search-widget__result t-text">' + translation.noResult[lang] + '</div>';
            $('.t-search-widget__popup-preloader').hide();
        } else if (typeof sResults['pages'] === 'undefined' && sResults['total'] > 0 && sResults['pagin'] > 0) {
            str += '<div class="t-search-widget__result t-text">' + translation.noResult[lang] + '</div>';
            $('.t-search-widget__popup-preloader').hide();
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
            for (i = 1; i <= totalcount; i++) {
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

        if (typeof currentInput !== 'undefined' && typeof query === 'undefined') {
            query = currentInput.val();
        }
        if (query.length < 2) {
            return;
        }
        if (xhr) {
            xhr.abort();
        }

        xhr = '';
        $.ajax({
            type: 'GET',
            url: 'https://search.tildacdn.com/search/?p=' + project + '&q=' + encodeURIComponent(query) + '&page=' + page + '&num=' + num,
            success: function (data) {
                if (!addPage) {
                    tsearchwidget__drawPopup(data, false, page);
                } else {
                    tsearchwidget__appendResults(data, false, page);
                }
                tsearchwidget__appendPagination(page, data);
                if (page == data['pagin']) {
                    $('.t-search-widget__loadmore-btn-wrap').remove();
                }
            },
            beforeSend: function () {
                currentInput.parent('div').children('.t-site-search-close').hide();
                $('.t-search-widget__clear-icon').hide();
                $('.t-search-widget__loading').show();
                currentPage = currentPage || 1;

                inputFormWidth = currentInput.outerWidth();
                inputFormLeft = currentInput.position().left - 1;
            },
            complete: function () {
                if (query.length > 1) {
                    currentInput.parent('div').children('.t-site-search-close').show();
                }
                $('.t-search-widget__loading').hide();
                $('.t-search-widget__clear-icon').show();
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
                            highlight: translation.errorOccurredText[lang] + ' ' + textStatus + ' ' + errorThrown,
                        },
                    },
                };
                tsearchwidget__drawPopup(failData);
            },
            dataType: 'json',
        });
    }

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
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