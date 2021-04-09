// eslint-disable-next-line no-unused-vars
function t_store_init(recid, opts) {
    var rec = $('#rec' + recid);
    var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);
    if (!isSnippet) {
        t_store_initRouting();
    }

    var el_store = rec.find('.js-store');
    var containerEl = rec.find('.js-store-grid-cont');
    var prodPopup = t_store_get_productPopup_html(recid, opts);
    el_store.append(prodPopup);

    var loadMoreBtn = t_store_get_loadMoreBtn_html(rec, opts);

    if (opts.sidebar) {
        rec.find('.t951__cont-w-filter').append(loadMoreBtn);
    } else {
        containerEl.after(loadMoreBtn);
    }

    var pageMode = $('.t-records').attr('data-tilda-mode');
    opts.isPublishedPage = pageMode !== 'edit' && pageMode !== 'preview';

    /* draw product popup if we have it in URL */
    if (opts.isPublishedPage) {
        t_store_checkUrl(opts, recid);
    }

    if (opts.storepart === '') {
        rec.find('.js-store-grid-cont-preloader').hide();
        if (opts.sidebar) {
            rec.find('.t951__grid-cont').removeClass('t951__grid-cont_hidden');
        }
        return;
    }

    /* show loader in 2s */
    setTimeout(function () {
        rec.find('.js-store-grid-cont-preloader').removeClass('t-store__grid-cont-preloader_hidden');
    }, 1500);

    /*
        before load Products check url for filters params
        parse url for recid first
    */

   var customUrlParams = t_store_paramsToObj(recid);

   if (customUrlParams[recid]) {
    var optsBasedOnURL = t_store_updateOptionsBasedOnUrl(opts, customUrlParams, recid);
    if(optsBasedOnURL) {
        opts = optsBasedOnURL;
        rec.on('controlsDrawn', function () {
            t_store_filters_render_selected(opts, recid);
            if (opts.sidebar) {
                t_store_filters_opts_sort(opts, recid);
            }
        });
    }
   }

    /* if t951 block, add sidebar wrapper for a positioning purpose */
    if (opts.sidebar) {
        var el_filterWrapper = rec.find('.js-store-parts-select-container');
        var el_sidebarWrapper = el_filterWrapper.find('.t951__sidebar');

        if (!el_sidebarWrapper.length) {
            el_filterWrapper.prepend('<div class="t951__sidebar-wrapper"></div>');
        }
    }

    /* draw all products grid */
    t_store_loadProducts('', recid, opts);
    t_store_mobileHoriz_checkBtnVisibility(recid, opts);

    if (opts.isHorizOnMob) {
        var handIcon = t_store_get_handIcon_html(recid);
        rec.find('.js-store-grid-cont-preloader').before(handIcon);
    }

    $(window).bind(
        'resize',
        t_throttle(function () {
            t_store_unifyCardsHeights(recid, opts);
            t_store_moveSearhSort(recid, opts);
            t_store_loadMoreBtn_display(recid, opts);
        }, 200)
    );

    rec.find('.t-store').bind('displayChanged', function () {
        setTimeout(function() {
            t_store_unifyCardsHeights(recid, opts);
        });
    });

    try {
        if (opts.verticalAlignButtons) {
            $(window).bind(
                'resize',
                t_throttle(function () {
                    setTimeout(function () {
                        t_store_verticalAlignButtons(recid, opts);
                    }, 100);
                }, 500)
            );

            rec.find('.t-store').bind('displayChanged', function () {
                t_store_verticalAlignButtons(recid, opts);
            });
        }
    } catch (e) {
        console.log('verticalAlignButtons error: ' + e);
    }
}

function t_store_history_pushState(state, title, url) {
    if (typeof history.pushState != 'undefined') {
        window.history.pushState(state, title, url);
    }
}

function t_store_initRouting() {
    window.onpopstate = function () {
        if (window.history.state && window.history.state.productData) {
            var productPopupData = window.history.state.productData;
            var recid = productPopupData.recid,
                opts = productPopupData.opts,
                productObj = productPopupData.productObj,
                isRelevantsShow = productPopupData.isRelevantsShow;
            t_store_openProductPopup(recid, opts, productObj, isRelevantsShow);
        }
    };
}

function t_store_verticalAlignButtons(recid, opts) {
    var rec = $('#rec' + recid);
    var gridContainer = rec.find('.js-store-grid-cont');
    gridContainer.addClass('t-store__valign-buttons');
    var wrappers = rec.find('.js-store-grid-cont .t-store__card__textwrapper');
    var maxHeight = 0;
    var itemsInRow = parseInt(opts.blocksInRow, 10);

    var mobileView = $(window).width() <= 480;
    var tableView = $(window).width() <= 960 && $(window).width() > 480;
    var mobileOneRow = $(window).width() <= 960 && rec.find('.js-store-grid-cont.t-store__grid-cont_mobile-one-row')[0] ? true : false;
    var mobileTwoItemsInRow = $(window).width() <= 480 && rec.find('.t-store__mobile-two-columns')[0] ? true : false;

    if (mobileView) {
        itemsInRow = 1;
    }

    if (tableView) {
        itemsInRow = 2;
    }

    if (mobileTwoItemsInRow) {
        itemsInRow = 2;
    }

    if (mobileOneRow) {
        itemsInRow = 999999;
    }

    var i = 1;
    var wrappersInRow = [];

    $.each(wrappers, function (key, element) {
        element.style.height = 'unset';
    });

    $.each(wrappers, function (key, element) {
        if (itemsInRow === 1) {
            element.style.height = 'auto';
        } else {
            wrappersInRow.push(element);

            if (element.offsetHeight > maxHeight) {
                maxHeight = element.offsetHeight;
            }

            $.each(wrappersInRow, function (key, wrapper) {
                wrapper.style.height = maxHeight + 'px';
            });

            if (i === itemsInRow) {
                i = 0;
                maxHeight = 0;
                wrappersInRow = [];
            }

            i++;
        }
    });

    if (opts.showRelevants) {
        var relevantWrappers = rec.find('.js-product-relevant .t-store__card__textwrapper');
        var relevantMaxHeight = 0;
        var relevantWrappersInRow = [];
        $.each(relevantWrappers, function (key, element) {
            element.style.height = 'unset';
        });

        $.each(relevantWrappers, function (key, element) {
            relevantWrappersInRow.push(element);

            if (element.offsetHeight > relevantMaxHeight) {
                relevantMaxHeight = element.offsetHeight;
            }

            $.each(relevantWrappersInRow, function (key, wrapper) {
                wrapper.style.height = relevantMaxHeight + 'px';
            });
        });
    }
}

function t_store_hoverZoom_init(recid) {
    if (window.isMobile) {
        return;
    }
    var rec = $('#rec' + recid);
    try {
        if (rec.find('[data-hover-zoom]')[0]) {
            if (!jQuery.cachedZoomScript) {
                jQuery.cachedZoomScript = function (url) {
                    var options = {
                        dataType: 'script',
                        cache: true,
                        url: url,
                    };
                    return jQuery.ajax(options);
                };
            }
            $.cachedZoomScript('https://static.tildacdn.com/js/tilda-hover-zoom-1.0.min.js').done(function (script, textStatus) {
                if (textStatus == 'success') {
                    t_hoverZoom_init(recid);
                } else {
                    console.log('Upload script error: ' + textStatus);
                }
            });
        }
    } catch (e) {
        console.log('Zoom image init error: ' + e.message);
    }
}

function t_store_addStoreParts(recid, opts, storePartsArr) {
    var rec = $('#rec' + recid);
    var el_store = rec.find('.js-store');
    opts.storePartsArr = storePartsArr;
    var tabsHtml = t_store_get_storePartsControl_html(recid, opts);

    if (opts.sidebar) {
        el_store.find('.t951__sidebar-wrapper').prepend(tabsHtml);
    } else {
        el_store.find('.js-store-parts-select-container').prepend(tabsHtml);
    }

    /* draw all products grid */
    t_store_initStoreParts(recid, opts);
}

function t_store_initStoreParts(recid, opts) {
    var rec = $('#rec' + recid);
    /*rec.find('.js-store-parts-select').on('change', function(){
        var storepartuid = $(this).find(':selected').attr('data-storepart-uid');
        opts.storepart = storepartuid;
        rec.find('.js-store-grid-cont').html('');
        rec.find('.js-store-grid-cont-preloader').show();
        t_store_loadProducts(recid, opts);
        t_store_mobileHoriz_checkBtnVisibility(recid, opts);
    });*/

    rec.find('.js-store-parts-switcher').on('click', function () {
        var el_hiddenInput, previousInputValue, prevControl;
        var storeparttitle = $(this).text();
        /* change active btn */
        rec.find('.t-active').removeClass('t-active');
        $(this).addClass('t-active');
        /* redraw table */
        var paramsString = window.location.search;
        var searchParams = new URLSearchParams(paramsString);
        var recidFromSearchParams = searchParams.get('s_recid');
        var storepartFromSearchParams = searchParams.get('s_storepartuid');

        if (!opts.filters) {
            opts.filters = {};
        }

        if ($(this).hasClass('t-store__parts-switch-btn-all')) {
            if (opts.filters['storepartuid']) {
                delete opts.filters['storepartuid'];
            }

            el_hiddenInput = rec.find('.js-store-filter-opt[name="storepartuid"]');
            previousInputValue = el_hiddenInput.val();

            if (previousInputValue) {
                prevControl = rec.find('[data-filter-value="' + previousInputValue + '"]');
                prevControl.prop('checked', false);
                prevControl.removeClass('active');
                t_store_filters_opts_chosenVal_hide(rec, previousInputValue);
                el_hiddenInput.val('');
            }
            t_store_updateUrlWithParams('delete', 'storepartuid', storeparttitle, recid);
        } else if (storepartFromSearchParams !== storeparttitle || recidFromSearchParams !== recid) {
            opts.filters['storepartuid'] = [storeparttitle];
            if (rec.find('.js-store-filter').length > 0) {
                var controlType;
                var el_control = rec.find('[data-filter-value="' + storeparttitle + '"]');

                if (el_control.length > 0) {
                    el_hiddenInput = el_control.parents('.js-store-filter-item').find('.js-store-filter-opt');
                    previousInputValue = el_hiddenInput.val();
                    if (previousInputValue) {
                        prevControl = rec.find('[data-filter-value="' + previousInputValue + '"]');
                        prevControl.prop('checked', false);
                        prevControl.removeClass('active');
                        t_store_filters_opts_chosenVal_hide(rec, previousInputValue);
                    }
                    controlType = el_control.attr('type');

                    switch (controlType) {
                        case 'checkbox':
                            el_control.prop('checked', true);
                            t_store_filters_opts_chosenVal_add(recid, storeparttitle, el_control);
                            t_store_filters_opts_checkboxes_changeHiddenInput(el_control, true);
                            break;
                        case 'selectbox':
                            el_control.addClass('active');
                            t_store_filters_opts_chosenVal_add(recid, storeparttitle, el_control);
                            t_store_filters_opts_customSelect_changeHiddenInput(el_control);
                            break;

                        default:
                            break;
                    }
                } else {
                    el_hiddenInput = rec.find('.js-store-filter-opt[name="storepartuid"]');
                    previousInputValue = el_hiddenInput.val();
                    if (previousInputValue) {
                        prevControl = rec.find('[data-filter-value="' + previousInputValue + '"]');
                        prevControl.prop('checked', false);
                        prevControl.removeClass('active');
                        t_store_filters_opts_chosenVal_hide(rec, previousInputValue);
                        el_hiddenInput.val('');
                    }
                }
            }

            t_store_updateUrlWithParams('update', 'storepartuid', storeparttitle, recid);
        }

        if (opts.sidebar) {
            t_store_filters_scrollStickyBar(rec);
        }

        t_store_showLoadersForProductsList(recid, opts);
        t_store_loadProducts('', recid, opts);
        t_store_mobileHoriz_checkBtnVisibility(recid, opts);
    });
}

function t_store_setActiveStorePart(recid) {
    var rec = $('#rec' + recid);
    var paramsString = window.location.search;
    var searchParams = new URLSearchParams(paramsString);
    var recidFromSearchParams = searchParams.get('s_recid');
    var storepartFromSearchParams = searchParams.get('s_storepartuid');

    if (recid !== recidFromSearchParams) {
        return;
    }

    if (storepartFromSearchParams !== null && storepartFromSearchParams !== '') {
        // replace system symbols :: to default +
        storepartFromSearchParams = storepartFromSearchParams.replace('::', '+');
    }

    rec.find('.t-active').removeClass('t-active');
    rec.find('.js-store-parts-switcher').each(function () {
        if (storepartFromSearchParams) {
            if ($(this).html() == storepartFromSearchParams) {
                $(this).addClass('t-active');
            }
        } else if ($(this).hasClass('t-store__parts-switch-btn-all')) {
            $(this).addClass('t-active');
        }
    });
}

function t_store_showLoadersForProductsList(recid, opts) {
    var rec = $('#rec' + recid);
    /* hide animation for current cards */
    rec.find('.t-store__card').addClass('t-store__card_hidden');
    /* show preloader in 1000ms, if server will answer for a long time */
    var preloaderTimerId = setTimeout(function () {
        if (opts.sidebar) {
            rec.find('.t951__grid-cont').addClass('t951__grid-cont_hidden');
        } else {
            rec.find('.js-store-grid-cont').html('');
        }

        rec.find('.js-store-grid-cont-preloader')
            .css({
                display: '',
                opacity: '0',
            })
            .animate(
                {
                    opacity: 1,
                },
                200
            );
    }, 1000);
    rec.data('preloader-timeout', preloaderTimerId);
}

function t_store_loadProducts(method, recid, opts, slice, relevantsOpts) {
    window.tStoreProductsRequested = true;
    var showRelevants = method === 'relevants' ? true : false;
    var c = Date.now();
    var storepartuid = opts.storepart;
    var isFirstSlice = !slice || parseInt(slice, 10) === 1;
    var rec = $('#rec' + recid);
    var loadMoreBtn = rec.find('.js-store-load-more-btn');
    var gridContainer = showRelevants ? rec.find('.js-store-relevants-grid-cont') : rec.find('.js-store-grid-cont');
    var isT973 = rec.attr('data-record-type') === '973';

    /* combine sending data object */
    var dataObj;

    if (showRelevants) {
        dataObj = {
            storepartuid: storepartuid,
            productuid: relevantsOpts.currentProductUid,
            quantity: relevantsOpts.relevantsQuantity,
            method: relevantsOpts.relevantsMethod,
            sort: relevantsOpts.relevantsSort,
        };
        rec.find('.t-store__relevants-grid-cont').css({ opacity: 0 });
    } else {
        dataObj = {
            storepartuid: storepartuid,
            recid: recid,
            c: c,
        };
    }

    if (isFirstSlice) {
        dataObj.getparts = true;
        dataObj.getoptions = true;
    }
    if (slice) {
        dataObj.slice = slice;
    }
    if (opts.filters) {
        dataObj.filters = opts.filters;
    }
    if (opts.sort && !showRelevants) {
        dataObj.sort = opts.sort;
    }
    if (opts.size && opts.size > 0) {
        dataObj.size = opts.size;
    }

    var apiUrl = showRelevants ? 'https://store.tildacdn.com/api/getrelevantproducts/' : 'https://store.tildacdn.com/api/getproductslist/';

    /* inside tilda we get data from another url */

    if (!opts.isPublishedPage) {
        dataObj.projectid = $('.t-records').attr('data-tilda-project-id');
        apiUrl = showRelevants ? 'https://tilda.cc/projects/store/getrelevantproducts/' : 'https://tilda.cc/projects/store/getproductslist/';
    }

    var ts = Date.now();
    $.ajax({
        type: 'GET',
        url: apiUrl,
        data: dataObj,
        dataType: 'text',
        success: function (data) {
            /* stop loaders */
            loadMoreBtn.removeClass('t-btn_sending');

            /* clear preloader timeout */
            clearTimeout(rec.data('preloader-timeout'));

            /* hide preloader, if it was shown */
            rec.find('.js-store-grid-cont-preloader').hide();
            if (opts.sidebar) {
                rec.find('.t951__grid-cont').removeClass('t951__grid-cont_hidden');
            }

            /* remove cards */
            if (isFirstSlice) {
                gridContainer.html('');
            }

            /* check server error */
            if (typeof data === 'string' && data.substring(0, 1) !== '{' && (data.indexOf('ERROR:') !== -1 || data.indexOf('Wrong') !== -1)) {
                console.log('show error');
                var el_errorBox = t_store_get_errorBox(opts, data);
                gridContainer.append(el_errorBox);
                rec.find('.js-store-error-msg').fadeIn(200);
                return;
            }
            if (data === '') {
                return;
            }

            /* try to parse products data */
            var obj = {};
            try {
                obj = jQuery.parseJSON(data);

                /* links for size chart */
                if (obj.partlinks !== undefined) {
                    opts.linksSizeChart = obj.partlinks;
                }
            } catch (e) {
                console.log(data);
            }
            if (typeof obj !== 'object') {
                return;
            }

            var productsArr = showRelevants ? obj.relevants : obj['products'];

            /* store option params */
            if (obj.options && obj.options.length >= 1) {
                window.tStoreOptionsList = obj.options;
            }

            /* check server error */
            t_store_process(productsArr, recid, opts, slice ? true : false, showRelevants, obj);

            /* add store parts */
            if (obj.parts && obj.parts.length > 1 && rec.find('.js-store-parts-switcher').length === 0 && !opts.hideStoreParts) {
                t_store_addStoreParts(recid, opts, obj.parts);
            }

            if (!showRelevants) {
                t_store_setActiveStorePart(recid, opts);
            }

            /* add filters */
            if (obj.filter === 'y' && !opts.hideFilters) {
                $.when(t_store_loadFilters(recid, opts)).done(function (data) {
                    if (!data) {
                        return;
                    }
                    var filterObject = t_store_parse_jsonData(data);
                    t_store_filters_init(recid, opts, filterObject);
                });
            } else if (opts.sidebar && !showRelevants) {
                var el_sidebar = rec.find('.t951__sidebar');
                el_sidebar.addClass('t951__sidebar_empty');
                var text =
                    window.tildaBrowserLang === 'RU'
                        ? 'Пожалуйста, добавьте хотя бы один фильтр каталога для отображения боковой панели магазина. <a href="http://help-ru.tilda.ws/online-store-payments/filters" target="_blank" rel="nofollow noopener">Справка</a>'
                        : 'Please <a href="https://help.tilda.ws/online-store-payments/filters" target="_blank" rel="nofollow noopener">add at least one catalog filter</a> to display the store sidebar';
                el_sidebar.html('' +
                    '<span class="t-text t-text_xxs">' + text + '</span>' +
                '');
            }

            if (t_store_isQueryInAddressBar('tstore') && window.t_store__scrollToBlock) {
                var hashArr = decodeURI(window.location.hash).split('/');
                var storeuidIndex = hashArr.indexOf('r') + 1;
                var storeuid = hashArr[storeuidIndex];

                if (storeuid == recid) {
                    setTimeout(function () {
                        window.scrollTo(0, rec.offset().top);
                    }, 500);

                    window.t_store__scrollToBlock = null;
                }
            }

            t_store_hoverZoom_init(recid);

            /* pagination */
            if (obj.nextslice) {
                var isMobileOneRow = gridContainer.has('t-store__grid-cont_mobile-one-row');

                loadMoreBtn.show();
                loadMoreBtn.off('click');
                loadMoreBtn.on('click', function () {
                    loadMoreBtn.addClass('t-btn_sending');
                    t_store_loadProducts('', recid, opts, obj.nextslice);
                    t_store_hoverZoom_init(recid);
                });

                if (isMobileOneRow) {
                    gridContainer.bind(
                        'scroll',
                        t_throttle(function () {
                            if (window.tStoreProductsRequested) {
                                return;
                            }

                            if ($(window).width() < 960) {
                                var scrollWidth = gridContainer.get(0).scrollWidth;
                                var scrollLeft = gridContainer.scrollLeft();
                                var outerWidth = gridContainer.outerWidth();
                                if (outerWidth + scrollLeft + 20 > scrollWidth && loadMoreBtn.css('display') !== 'none') {
                                    loadMoreBtn.click();
                                }
                            }
                        }, 200)
                    );
                }
            } else if (!showRelevants) {
                loadMoreBtn.hide();
                gridContainer.off('scroll');
            }

            if (window.isMobile) {
                gridContainer.bind(
                    'scroll',
                    t_throttle(function () {
                        if (typeof $('.t-records').attr('data-tilda-mode') == 'undefined') {
                            if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
                                t_store_onFuncLoad('t_lazyload_update', function () {
                                    t_lazyload_update();
                                });
                            }
                        }
                    }, 200)
                );
            }

            /* filters prods number info */
            if (!showRelevants) {
                t_store_filters_prodsNumber_update(rec, opts, obj);
                rec.on('controlsDrawn', function () {
                    t_store_filters_prodsNumber_update(rec, opts, obj);
                });
            }
            if (showRelevants) {
                rec.find('.t-store__relevants-grid-cont').css({ opacity: 1 });
                var blocksInRowForRelevant = 4;
                if (opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || $(window).width() <= 960)) {
                    t_store_onFuncLoad('t_sldsInit', function() {
                        t_sldsInit(recid + ' .js-store-relevants-grid-cont');
                    });
                }
            }

            if (isT973 && !showRelevants) {
                t_store_onFuncLoad('t_sldsInit', function() {
                    t_sldsInit(recid + ' .js-store-grid-cont');
                });
            }

            if (opts.verticalAlignButtons) {
                if (document.readyState === 'complete') {
                    t_store_verticalAlignButtons(recid, opts);
                } else {
                    $(window).on('load', function () {
                        t_store_verticalAlignButtons(recid, opts);
                    });
                }
            }

            t_store_onFuncLoad('t_animate__startAnimation', function() {
                t_animate__startAnimation();
            });

            window.tStoreProductsRequested = false;
        },
        error: function (xhr) {
            loadMoreBtn.removeClass('t-btn_sending');
            /* check internet connection */
            var ts_delta = Date.now() - ts;
            if (xhr.status == 0 && ts_delta < 100) {
                alert('Request error (get store products). Please check internet connection...');
            }
            window.tStoreProductsRequested = false;
        },
        timeout: 1000 * 25,
    });
}

function t_store_loadOneProduct(recid, opts, curProdUid) {
    var c = Date.now();
    var storepartuid = opts.storepart;

    var dataObj = {
        storepartuid: storepartuid,
        recid: recid,
        productuid: curProdUid,
        c: c,
    };

    return $.ajax({
        type: 'GET',
        url: 'https://store.tildacdn.com/api/getproduct/',
        data: dataObj,
        dataType: 'text',
        success: function (data) {
            console.log(data);
        },
        error: function () {
            console.log("Can't get product with uid = " + curProdUid + ' in storepart = ' + opts.storepart);
        },
        timeout: 1000 * 25,
    });
}

function t_store_loadProducts_byId(idArr, opts) {
    var c = Date.now();

    var dataObj = {
        productsuid: idArr,
        c: c,
    };

    var apiUrl = 'https://store.tildacdn.com/api/getproductsbyuid/';

    /* inside tilda we get data from another url */
    if (opts !== undefined) {
        if (!opts.isPublishedPage) {
            dataObj.projectid = $('.t-records').attr('data-tilda-project-id');
            apiUrl = 'https://tilda.cc/projects/store/getproductsbyuid/';
        }
    }

    return $.ajax({
        type: 'GET',
        url: apiUrl,
        data: dataObj,
        dataType: 'text',
        success: function () {},
        error: function () {
            console.log("Can't get getproductsbyuid. Requesting idArr: ");
            console.log(idArr);
        },
        timeout: 1000 * 25,
    });
}

function t_store_loadFilters(recid, opts) {
    /* because only load data in this method we don't need to check below
        var el_rec = $('#rec' + recid);
        if (el_rec.find('.js-store-filter').length > 0) {
            return;
        }
    */

    /*
    if (window.tStoreFiltersIsRequested) {
        if (window.tStoreFiltersData) {
            t_store_filters_init(recid, opts, window.tStoreFiltersData);
        } else {
            $('#rec'+recid+' .js-store').bind('tStoreFiltersLoaded', function(){
                t_store_filters_init(recid, opts, window.tStoreFiltersData);
            });
        }
        return;
    }
    */

    var c = Date.now();
    var storepartuid = opts.storepart;

    var dataObj = {
        storepartuid: storepartuid,
        c: c,
    };

    /* window.tStoreFiltersIsRequested = true; */

    var apiUrl = 'https://store.tildacdn.com/api/getfilters/';
    /* inside tilda we get data from another url */
    if (!opts.isPublishedPage) {
        dataObj.projectid = $('.t-records').attr('data-tilda-project-id');
        apiUrl = 'https://tilda.cc/projects/store/getfilters/';
    }

    return $.ajax({
        type: 'GET',
        url: apiUrl,
        data: dataObj,
        dataType: 'text',
        success: function () {
            /* try to parse filters data */
            /*
            window.tStoreFiltersData = obj;
            $('.js-store').trigger('tStoreFiltersLoaded');
            */
        },
        error: function () {
            console.log("Can't get filters in storepart = " + opts.storepart);
        },
        timeout: 1000 * 25,
    });
}

function t_store_parse_jsonData(data) {
    try {
        var obj = jQuery.parseJSON(data);
    } catch (e) {
        console.log(data);
    }
    if (typeof obj !== 'object') {
        return;
    }
    return obj;
}

/* draw grid of products */

function t_store_process(productsArr, recid, opts, isNextSlice, isRelevantsShow, obj) {
    var rec = $('#rec' + recid);
    var gridContainer = rec.find('.js-store-grid-cont');
    var isT973 = rec.attr('data-record-type') === '973';
    if (isRelevantsShow) {
        gridContainer = rec.find('.js-store-relevants-grid-cont');
    }
    /* var tpl = rec.find('.js-store-tpl-product').html(); */
    var separator = t_store_get_horizSeparator_html(opts);
    var obj_products = {};
    var countProducts = gridContainer.find('.t-store__card').length;

    /* show empty message, if storepart is empty */
    if (productsArr.length === 0) {
        var el_emptyMsg = t_store_get_emptyMsg_html(opts);
        gridContainer.append(el_emptyMsg);
        rec.find('.js-store-empty-part-msg').fadeIn(200);
        return;
    }

    /* generate product cards HTML */
    var productsHtml = '';
    var blocksInRowForRelevant = 4;
    var blocksInRow = isRelevantsShow ? blocksInRowForRelevant : opts.blocksInRow;

    if ((isRelevantsShow && opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || $(window).width() <= 960)) || (!isRelevantsShow && isT973)) {
        var animationduration = '';
        var animationspeed = '300';
        if (opts.slider_opts.anim_speed === 'fast') {
            animationduration = 't-slds_animated-fast';
        }
        if (opts.slider_opts.anim_speed === 'slow') {
            animationduration = 't-slds_animated-slow';
            animationspeed = '500';
        }

        productsHtml += '<div class="t-slds" style="visibility: hidden;">';
        productsHtml += '<div class="t-slds__main t-container">';
        productsHtml += '<div class="t-slds__container">';
        productsHtml +=
            '<div class="t-slds__items-wrapper ' +
            animationduration +
            '" data-slider-items-in-row="' +
            ((!isRelevantsShow && isT973) ? blocksInRow : blocksInRowForRelevant)  +
            '" data-slider-transition="' +
            animationspeed +
            '" data-slider-with-cycle="true" data-slider-cycle="yes" data-slider-correct-height="' + ((!isRelevantsShow && isT973) ? 'true' : 'false') + '" data-auto-correct-mobile-width="false">';

        productsHtml = productsHtml
            .replace('[[noCycleClass]]', opts.slider_opts.cycle ? '' : 't-slds__nocycle')
            .replace('[[isCycled]]', opts.slider_opts.cycle ? 'true' : 'false');
    }


    $.each(productsArr, function (i, product) {
        if ((!isRelevantsShow && (!isT973)) || (isRelevantsShow && !opts.relevants_slider)) {
            if (countProducts > 0 && countProducts % blocksInRow === 0) {
                productsHtml += separator;
            }
        }

        productsHtml += t_store_get_productCard_html(rec, product, opts, isRelevantsShow, recid, i, productsArr);
        obj_products[product.uid] = product;

        countProducts++;
    });




    if ((isRelevantsShow && opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || $(window).width() <= 960)) || (!isRelevantsShow && isT973)) {
        var arrowsTplEl = rec.find('.js-store-tpl-slider-arrows');
        var arrowsTpl = arrowsTplEl.html();

        productsHtml += '</div>';
        productsHtml += '</div>';

        if (arrowsTpl && !isRelevantsShow && isT973) {
            productsHtml += arrowsTpl;
            gridContainer.removeClass('t-container').removeClass('t-store__grid-cont_mobile-grid');
        }

        if (!isRelevantsShow && isT973) {
            var strBullets = '<div class="t-slds__bullet_wrapper">';
            $.each(productsArr, function (i, product) {
                var key = i + 1;
                strBullets +=
                    '<div class="t-slds__bullet' + (key === 1 ? ' t-slds__bullet_active' : '') + '" data-slide-bullet-for="' + key + '">' +
                        '<div class="t-slds__bullet_body" style="background-color: transparent;"></div>' +
                    '</div>';
            });
            strBullets += '</div>';
            productsHtml += strBullets;
        }

        productsHtml += '</div>';
        productsHtml += '</div>';

        if (arrowsTpl && isRelevantsShow) {
            productsHtml += arrowsTpl;
        }
    }
    /* change DOM */
    t_store_process_appendAndShowProducts(rec, gridContainer, productsHtml);

    /* init product options and edition options */
    $.each(productsArr, function (key, product) {
        var el_product = isRelevantsShow
            ? rec.find('.t-store__relevants__container .js-product.t-item[data-product-gen-uid="' + product.uid + '"]')
            : rec.find('.js-product.t-item[data-product-gen-uid="' + product.uid + '"]');
        el_product.data('cardSize', 'small');
        product = obj_products[product.uid];
        /* create quantity input for popup */
        if (opts.showStoreBtnQuantity === 'both' || opts.showStoreBtnQuantity === 'list') {
            t_store_addProductQuantity(recid, el_product, product, opts);
        }
        t_store_addProductOptions(recid, product, el_product, opts);

        /* Add event handlers for custom styled options */
        t_store_option_handleOnChange_custom(recid, el_product, opts);

        t_store_onFuncLoad('t_prod__initProduct', function() {
            t_prod__initProduct(recid, el_product);
        });
    });

    if (!isNextSlice && opts.isFlexCols && opts.isHorizOnMob) {
        gridContainer.find('.t-store__tail-gap').remove();
        gridContainer.append('<div class="t-store__tail-gap"></div>');
    }
    /* init js events and do js updates */
    if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
        if (opts.relevants_slider) {
            setTimeout(function () {
                t_store_onFuncLoad('t_lazyload_update', function () {
                    t_lazyload_update();
                });
            }, 100);
        } else {
            t_store_onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
    }
    if ($('.t706__cartwin').length > 0) {
        if (typeof tcart__addEvent__links === 'function') {
            tcart__addEvent__links();
        }
    } else {
        console.log('Warning: cart block is not added to this page');
    }

    t_store_initPopup(recid, obj_products, opts, isRelevantsShow, obj);

    t_store_unifyCardsHeights(recid, opts);

    setTimeout(function () {
        t_store_unifyCardsHeights(recid, opts);
    }, 1);

    if(document.fonts !== undefined) {
        if(document.fonts.ready !== undefined) {
            document.fonts.ready.then(function () {
                setTimeout(function() {
                    t_store_unifyCardsHeights(recid, opts);
                }, 1000);
            });
        }
    } else {
        /* IE, old Edge */
        setTimeout(function() {
            t_store_unifyCardsHeights(recid, opts);
        }, 1000);
    }

    if (opts.verticalAlignButtons) {
        if (document.readyState === 'complete') {
            t_store_verticalAlignButtons(recid, opts);
        } else {
            $(window).on('load', function () {
                t_store_verticalAlignButtons(recid, opts);
            });
        }
    }

    if (!opts.previewmode) {
        try {
            addEditFieldEvents_new(recid);
        } catch (e) {
            console.log(e.message);
        }
    }
}

function t_store_process_appendAndShowProducts(rec, gridContainer, productsHtml) {
    gridContainer.append(productsHtml);
    if (rec.data('already-loaded-first-products') === true) {
        /* products in pagination and in tabs we show with transition */
        setTimeout(function () {
            rec.find('.t-store__card').removeClass('t-store__card_hidden');
        }, 10);
    } else {
        /* first products we show without transition */
        rec.find('.t-store__card').removeClass('t-store__card_hidden');
        /* flag, that next loaded products wouldn't be first for this rec */
        rec.data('already-loaded-first-products', true);
    }
}

/* workarounds for case with horizontal scroll on small screens */

function t_store_mobileHoriz_updLazy(recid) {
    /*
    we need to update lazy on horizontal scroll on mobiles
    */
    var scrollContainer = $('#rec' + recid + ' .js-store-grid-cont');
    var curMode = $('.t-records').attr('data-tilda-mode');
    if (scrollContainer.length && curMode != 'edit' && curMode != 'preview') {
        scrollContainer.bind(
            'scroll',
            t_throttle(function () {
                if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
                    t_store_onFuncLoad('t_lazyload_update', function () {
                        t_lazyload_update();
                    });
                }
            }, 500)
        );
    }
}

function t_store_mobileHoriz_checkBtnVisibility(recid, opts) {
    t_store_mobileHoriz_hideLoadBtn(recid, opts);
    $(window).bind(
        'resize',
        t_throttle(function () {
            t_store_mobileHoriz_hideLoadBtn(recid, opts);
        }, 500)
    );
}

function t_store_mobileHoriz_hideLoadBtn(recid, opts) {
    var rec = $('#rec' + recid);
    if ($(window).width() < 960 && opts.hasMobileHorizScroll) {
        rec.find('.js-store-load-more-btn').remove();
    }
}

function t_store_get_storePartsControl_html(recid, opts) {
    var str = '';

    /*str += '<div class="t-store__parts-select-wrapper">';
    str += '    <select class="js-store-parts-select t-store__parts-select t-descr t-descr_xxs">';
    for (var i = 0; i < opts.storePartsArr.length; i++) {
        var storePart = opts.storePartsArr[i];
        var selectedAttr = ( storePart.uid === opts.storepart ? 'selected' : '' );
        str += '<option data-storepart-uid="'+storePart.uid+'" '+selectedAttr+'>';
        str += '    '+storePart.title;
        str += '</option>';
    }
    str += '    </select>';
    str += '</div>';*/

    str += '<div class="t-store__parts-switch-wrapper t-align_center">';
    /* add root part */
    str +=
        '<div class="js-store-parts-switcher t-store__parts-switch-btn t-name t-name_xs t-menu__link-item t-store__parts-switch-btn-all" data-storepart-link="#!/tstore' +
        '/r/' +
        recid +
        '/c/' +
        opts.storepart +
        '" data-storepart-uid="' +
        opts.storepart +
        '" >';
    str += t_store_dict('all');
    str += '</div>';
    /* add custom parts */
    for (var i = 0; i < opts.storePartsArr.length; i++) {
        var storePart = opts.storePartsArr[i];
        str +=
            '<div class="js-store-parts-switcher t-store__parts-switch-btn t-name t-name_xs t-menu__link-item" data-storepart-link="#!/tstore' +
            '/r/' +
            recid +
            '/c/' +
            storePart.uid +
            '-' +
            storePart.title +
            '" data-storepart-uid="' +
            storePart.uid +
            '">';
        str += '' + storePart.title;
        str += '</div>';
    }
    str += '</div>';
    return str;
}

function t_store_get_productPopup_html(recid, opts) {
    var str = '';
    var statAttr = opts.popup_opts.popupStat ? 'data-track-popup="' + opts.popup_opts.popupStat + '"' : '';
    var popupClass = 't-popup__container t-popup__container-static';
    var verticalAlignButtons = opts.verticalAlignButtons;
    var verticalAlignClass = verticalAlignButtons ? 't-store__valign-buttons' : '';
    var showRelevants = opts.showRelevants;
    var titleRelevants = opts.titleRelevants ? opts.titleRelevants : window.tildaBrowserLang === 'RU' ? 'Смотрите также' : 'See also';

    var mobileOneRowClass = opts.relevants_slider ? '' : 't-store__grid-cont_mobile-one-row';

    if (opts.popup_opts.isVertical) {
        popupClass += ' t-store__popup-container_8-cols';
    }
    var popupStyle = opts.popup_opts.overlayBgColorRgba ? 'style="background-color:' + opts.popup_opts.overlayBgColorRgba + '"' : '';
    var containerStyle = opts.popup_opts.containerBgColor ? 'style="background-color:' + opts.popup_opts.containerBgColor + '"' : '';
    var sliderClass = opts.popup_opts.isVertical ? '' : 't-store__prod-popup__col-left t-col t-col_' + opts.popup_opts.columns;
    var infoAlignClass = 't-align_' + (opts.popup_opts.align === 'center' ? 'center' : 'left') + ' ';
    var infoClass = infoAlignClass + (opts.popup_opts.isVertical ? '' : 't-store__prod-popup__col-right t-col t-col_' + opts.popup_opts.columns2);

    str += '<div class="t-popup" ' + statAttr + ' ' + popupStyle + '>';
    str += '    ' + t_store_get_productPopup_closeIcon_html(opts);
    str += '    ' + t_store_get_productPopup_closeText_html(opts);
    str += '    <div class="' + popupClass + '" ' + containerStyle + '>';
    str += '        <div>';
    str += '            <div class="t-store__prod-popup__container">';
    str += '                <div class="js-store-product js-product t-store__product-popup">';
    str += '                    <div class="t-store__prod-popup__slider js-store-prod-slider ' + sliderClass + '"></div>';
    str += '                    <div class="t-store__prod-popup__info ' + infoClass + '">';
    str += '                        ' + t_store_get_productPopup_titleText_html();
    str += '                        <div class="js-store-price-wrapper t-store__prod-popup__price-wrapper">';
    str += '                            ' + t_store_get_productPopup_onePrice_html(opts, 'current');
    str += '                            ' + t_store_get_productPopup_onePrice_html(opts, 'old');
    str += '                        </div>';
    str += '                        <div class="js-product-controls-wrapper"></div>';
    str += '                        ' + t_store_get_productPopup_linksSizeChart_html(opts);
    str += '                        ' + t_store_get_productPopup_buyBtn_html(opts);
    str += '                        ' + t_store_get_productPopup_text_html();
    str += '                    </div>';
    str += '                </div>';
    if (showRelevants) {
        str += '                <div class="t-store__relevants__container">';
        str += '                    <div class="t-store__relevants__title-wrapper">';
        str +=
            '                        <div class="t-store__relevants__title t-uptitle t-uptitle_xxl" style="' +
            opts.typo.title +
            '">' +
            titleRelevants +
            '</div>';
        str += '                    </div>';
        if (!opts.relevants_slider) {
            str += t_store_get_handIcon_html(recid);
        }
        str +=
            '                    <div class="t-store__relevants-grid-cont js-store-relevants-grid-cont ' +
            verticalAlignClass +
            ' ' +
            mobileOneRowClass +
            '"></div>';
        str += '                </div>';
    }
    str += '            </div>';
    str += '        </div>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_productPopup_text_html() {
    var str = '';
    str += '<div class="js-store-prod-text t-store__prod-popup__text t-descr t-descr_xxs"></div>';
    return str;
}

function t_store_get_productPopup_linksSizeChart_html(opts) {
    var str = '';
    str += '<div class="t-store__prod-popup__links-wrapper"></div>';
    return str;
}

function t_store_get_productPopup_buyBtn_html(opts) {
    var str = '';
    var btnStyle = opts.btn1_style;
    var btnTitle = opts.popup_opts.btnTitle;

    if (btnTitle !== '') {
        str += '<div class="t-store__prod-popup__btn-wrapper js-store-buttons-wrapper">';
        str +=     '<a href="#order" class="t-store__prod-popup__btn t-btn t-btn_sm" style="' + btnStyle + '">';
        str +=         '<table style="width:100%; height:100%;"><tr><td class="js-store-prod-popup-buy-btn-txt">';
        str +=             btnTitle;
        str +=         '</td></tr></table>';
        str +=     '</a>';
        str += '</div>';
    }

    return str;
}

function t_store_get_productCard_quantity_html(opts, type) {
    /* type: card or popup */
    var str = '';

    return str;
}

function t_store_get_productPopup_onePrice_html(opts, type) {
    var str = '';
    var priceStylingClass = type === 'current' ? 'js-store-prod-price t-store__prod-popup__price' : 'js-store-prod-price-old t-store__prod-popup__price_old';

    var styleAttr = '';
    var styleStr = '';
    var color = type === 'current' ? opts.price.color : opts.price.colorOld;
    styleStr += color ? 'color:' + color + ';' : '';
    styleStr += opts.price.fontWeight ? 'font-weight:' + opts.price.fontWeight + ';' : '';
    styleAttr = styleStr !== '' ? 'style = "' + styleStr + '"' : '';

    var currency = opts.currencyTxt ? '<div class="t-store__prod-popup__price-currency">' + opts.currencyTxt + '</div>' : '';
    var jsProdClass = type === 'current' ? 'js-product-price js-store-prod-price-val' : 'js-store-prod-price-old-val';

    str += '<div class="' + priceStylingClass + ' t-store__prod-popup__price-item t-name t-name_md" ' + styleAttr + '>';
    str += (opts.currencySide !== 'r' && currency ? currency : '');
    str += '    ' + '<div class="' + jsProdClass + ' t-store__prod-popup__price-value notranslate" translate="no"></div>';
    str += (opts.currencySide === 'r' && currency ? currency : '');
    str += '</div>';

    return str;
}

function t_store_get_productPopup_titleText_html() {
    var str = '';
    str += '<div class="t-store__prod-popup__title-wrapper">';
    str += '    <div class="js-store-prod-name js-product-name t-store__prod-popup__name t-name t-name_xl"></div>';
    str += '    <div class="t-store__prod-popup__brand t-descr t-descr_xxs"></div>';
    str += '    <div class="t-store__prod-popup__sku t-descr t-descr_xxs">';
    str += window.tildaBrowserLang === 'RU' ? 'Артикул: ' : 'SKU: ';
    str += '<span class="js-store-prod-sku js-product-sku">';
    str += '</span>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_productPopup_closeIcon_html(opts) {
    var str = '';
    var iconFillColor = opts.popup_opts.iconColor ? opts.popup_opts.iconColor : '#000000';
    var bgColor = opts.popup_opts.overlayBgColorRgba ? t_store_removeRgbOpacity(opts.popup_opts.overlayBgColorRgba) : opts.popup_opts.containerBgColor;
    var containerFillColor = bgColor && bgColor.length ? bgColor : '#ffffff';

    if (opts.popup_opts.overlayBgColorRgba && !opts.popup_opts.iconColor) {
        // We have to use overlay color (not container bg color) because we use this as popup head on desktop
        // If overlay bg color is defined and icon color is not, guess icon color to match overlay bg color

        var color = t_store_removeRgbOpacity(opts.popup_opts.overlayBgColorRgba);
        iconFillColor = t_store_luma_rgb(color);
    }

    str += '<div class="t-popup__close" style="background-color: ' + containerFillColor + '">';
    str += '    <div class="t-popup__close-wrapper">';

    str += '<svg class="t-popup__close-icon t-popup__close-icon_arrow" width="26px" height="26px" viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
        str += '<path d="M10.4142136,5 L11.8284271,6.41421356 L5.829,12.414 L23.4142136,12.4142136 L23.4142136,14.4142136 L5.829,14.414 L11.8284271,20.4142136 L10.4142136,21.8284271 L2,13.4142136 L10.4142136,5 Z" fill="' + iconFillColor + '"></path>';
    str += '</svg>';

    str +=
        '        <svg class="t-popup__close-icon t-popup__close-icon_cross" width="23px" height="23px" viewBox="0 0 23 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    str += '            <g stroke="none" stroke-width="1" fill="' + iconFillColor + '" fill-rule="evenodd">';
    str +=
        '                <rect transform="translate(11.313708, 11.313708) rotate(-45.000000) translate(-11.313708, -11.313708) " x="10.3137085" y="-3.6862915" width="2" height="30"></rect>';
    str +=
        '                <rect transform="translate(11.313708, 11.313708) rotate(-315.000000) translate(-11.313708, -11.313708) " x="10.3137085" y="-3.6862915" width="2" height="30"></rect>';
    str += '            </g>';
    str += '        </svg>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_productPopup_closeText_html(opts) {
    if (!opts.popup_opts.closeText) {
        return '';
    }

    var closeRichText = t_store_unescapeHtml(opts.popup_opts.closeText);

    var iconFillColor = opts.popup_opts.iconColor ? opts.popup_opts.iconColor : '#000000';
    var containerFillColor = opts.popup_opts.containerBgColor && opts.popup_opts.containerBgColor.length ? opts.popup_opts.containerBgColor : '#ffffff';

    if (opts.popup_opts.containerBgColor && !opts.popup_opts.iconColor) {
        // If container bg color is defined and icon color is not, guess icon color to match container bg color

        var rgbColor = t_store_hexToRgb(containerFillColor);
        iconFillColor = t_store_luma_rgb(rgbColor);
    }

    var style = 'style="color:' + iconFillColor + '"';

    var str = '';
    str += '<div class="t-store__prod-popup__close-txt-wr">';
    str += '    <div class="js-store-close-text t-store__prod-popup__close-txt t-descr t-descr_xxs" ' + style + '>';
    str += closeRichText;
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_loadMoreBtn_html(rec, opts) {
    var str = '';
    // Hide load more button for a single row view
    var isMobileOneRow = $(window).width() < 960 && rec.find('.js-store-grid-cont.t-store__grid-cont_mobile-one-row')[0] ? true : false;
    var className = isMobileOneRow ? ' t-store__load-more-btn-wrap_hidden ' : '';

    var btnSizeClass = opts.btnSize === 'sm' ? 't-btn_xs' : 't-btn_sm';
    str += '<div class="t-store__load-more-btn-wrap t-align_center' + className +'">';
    str += '    <div class="js-store-load-more-btn t-store__load-more-btn t-btn ' + btnSizeClass + '" style="' + opts.btn1_style + 'display:none;">';
    str += '        <table style="width:100%; height:100%;"><tr><td>';
    str += '            ' + t_store_dict('loadmore');
    str += '        </td></tr></table>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_handIcon_html(recid) {
    var str = '';
    var rec = $('#rec' + recid);
    var size = '42';
    var cardFill = 'rgba(190,190,190,0.3)';
    var handFill = 'rgba(190,190,190,1)';
    var blendMode = 'mix-blend-mode: multiply;';

    var blockColor = rec.attr('data-bg-color');
    if (blockColor) {
        var blockColorRGB = t_store_hexToRgb(blockColor);
        var luma = t_store_luma_rgb(blockColorRGB);

        if (luma === 'white') {
            var cardFill = 'rgba(255,255,255,0.2)';
            var handFill = 'rgba(255,255,255,1)';
            blendMode = 'mix-blend-mode: lighten;';
        }
    }

    str += '<div class="t-store__scroll-icon-wrapper" style="' + blendMode + '">';
    str += '<?xml version="1.0" encoding="UTF-8"?>';
    str += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 300" height="' + size + '" width="' + size + '"> <rect class="tooltip-horizontal-scroll-icon_card" x="480" width="200" height="200" rx="5" fill="' + cardFill + '"></rect> <rect class="tooltip-horizontal-scroll-icon_card" y="0" width="200" height="200" rx="5" fill="' + cardFill + '"></rect> <rect class="tooltip-horizontal-scroll-icon_card" x="240" width="200" height="200" rx="5" fill="' + cardFill + '"></rect> <path class="tooltip-horizontal-scroll-icon_hand" d="M78.9579 285.7C78.9579 285.7 37.8579 212.5 20.5579 180.8C-2.44209 138.6 -6.2422 120.8 9.6579 112C19.5579 106.5 33.2579 108.8 41.6579 123.4L61.2579 154.6V32.3C61.2579 32.3 60.0579 0 83.0579 0C107.558 0 105.458 32.3 105.458 32.3V91.7C105.458 91.7 118.358 82.4 133.458 86.6C141.158 88.7 150.158 92.4 154.958 104.6C154.958 104.6 185.658 89.7 200.958 121.4C200.958 121.4 236.358 114.4 236.358 151.1C236.358 187.8 192.158 285.7 192.158 285.7H78.9579Z" fill="' + handFill + '"></path>';
    str += '<style> .tooltip-horizontal-scroll-icon_hand { animation: tooltip-horizontal-scroll-icon_anim-scroll-hand 2s infinite } .tooltip-horizontal-scroll-icon_card { animation: tooltip-horizontal-scroll-icon_anim-scroll-card 2s infinite } @keyframes tooltip-horizontal-scroll-icon_anim-scroll-hand { 0% { transform: translateX(80px) scale(1); opacity: 0 } 10% { transform: translateX(80px) scale(1); opacity: 1 } 20%,60% { transform: translateX(175px) scale(.6); opacity: 1 } 80% { transform: translateX(5px) scale(.6); opacity: 1 } to { transform: translateX(5px) scale(.6); opacity: 0 } } @keyframes tooltip-horizontal-scroll-icon_anim-scroll-card { 0%,60% { transform: translateX(0) } 80%,to { transform: translateX(-240px) } }';
    str += '</style>';
    str += '</svg>';
    str += '</div>';
    return str;
}

function t_store_get_emptyMsg_html(opts) {
    var str = '';
    var styles = opts.typo.titleColor ? 'color:' + opts.typo.titleColor + ';border-color:' + opts.typo.titleColor + ';' : '';
    var classStr = 'js-store-empty-part-msg t-store__empty-part-msg-cont';
    classStr += opts.colClassFullWidth ? ' ' + opts.colClassFullWidth : '';

    str += '<div class="' + classStr + '" style="display:none;">';
    str += '    <div class=" t-store__empty-part-msg-wrapper t-descr t-descr_sm" style="' + styles + '">';
    str += '        <div class="t-store__empty-part-msg">';
    str += '        ' + t_store_dict('emptypartmsg');
    str += '        </div>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_errorBox(opts, errorText) {
    var str = '';
    var styles = opts.typo.titleColor ? 'color:' + opts.typo.titleColor + ';border-color:' + opts.typo.titleColor + ';' : '';
    var classStr = 'js-store-error-msg t-store__error-msg-cont';
    classStr += opts.colClassFullWidth ? ' ' + opts.colClassFullWidth : '';

    str += '<div class="' + classStr + '" style="display:none;">';
    str += '    <div class="t-store__error-msg-wrapper t-descr t-descr_sm" style="' + styles + '">';
    str += '        <div class="t-store__error-msg">';
    str += '        ' + errorText;
    str += '        </div>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_productCard_html(rec, product, opts, isRelevantsShow, recid, key, productsArr) {
    var colClass = isRelevantsShow ? 't-col t-col_3' : opts.colClass;

    var edition = t_store_product_getFirstAvailableEditionData(product.editions);
    var str = '';
    var alignClass = opts.align === 'left' ? 't-align_left' : 't-align_center';
    var animClass = opts.itemsAnim && opts.previewmode ? 't-animate' : '';
    if (window.isMobile) {
        /*
            temporary disable animation for catalog products, because it doesnt work on slow 3G connection
            need to fix it in tilda-animation-1.0.js
        */
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection !== undefined) {
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' || connection.effectiveType === '3g') {
                animClass = '';
            }
        }
    }
    var animAttr = opts.itemsAnim ? 'data-animate-style="' + opts.itemsAnim + '" data-animate-chain="yes" ' : '';
    var isSoldOut = edition.quantity && parseInt(edition.quantity, 10) <= 0;
    var quantityAttr = 'data-product-inv="' + (edition.quantity || '') + '" ';

    var url = t_store_get_productCard_link(opts.prodCard.btnLink1, product, isRelevantsShow, recid, rec);
    var linkTarget = t_store_get_productCard_targetAttr(opts.prodCard.btnLink1, product);
    var link = {
        open: opts.previewmode ? '<a href="' + url + '" ' + linkTarget + '>' : '',
        close: opts.previewmode ? '</a>' : '',
    };

    if (isSoldOut && url === '#order') {
        link.open = '';
        link.close = '';
    }

    var relevantsProductClass = '';

    if (isRelevantsShow) {
        relevantsProductClass = 'js-product-relevant';
    }

    var blocksInRowForRelevant = 4;
    var pack_label = product.pack_label,
        pack_m = product.pack_m,
        pack_x = product.pack_x,
        pack_y = product.pack_y,
        pack_z = product.pack_z;

    key = parseInt(key, 10) + 1;

    var isT973MainSlider = (rec.attr('data-record-type') === '973' && !isRelevantsShow);
    var needRelevantsSlider = isRelevantsShow && opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || $(window).width() <= 960);
    if (needRelevantsSlider || isT973MainSlider) {
        str += '<div class="t-slds__item t-animate" data-slide-index="' + key + '">';
        str += '<div class="t__slds-wrapper t-slds__wrapper t-slds__wrapper_100 t-align_center">';
    }

    var productUrl = product.url || '';

    str +=
        '<div class="js-product t-store__card t-store__card_hidden ' + colClass + ' ' + alignClass + ' ' + relevantsProductClass + ' t-item ' + animClass + '" ' +
        animAttr + quantityAttr +
        'data-product-lid="' + product.uid + '" ' +
        'data-product-uid="' + product.uid + '" ' +
        'data-product-gen-uid="' + product.uid + '" ' +
        'data-product-pack-label="' + pack_label + '" ' +
        'data-product-pack-m="' + pack_m + '" ' +
        'data-product-pack-x="' + pack_x + '" ' +
        'data-product-pack-y="' + pack_y + '" ' +
        'data-product-pack-z="' + pack_z + '" ' +
        'data-product-url="' + productUrl + '" ' +
        '>';
    str += opts.prodCard.hasWrap
        ? t_store_get_productCard_wrapperStructure(product, edition, opts, link, isRelevantsShow, recid, rec)
        : t_store_get_productCard_simpleStructure(product, edition, opts, link, isRelevantsShow, recid, rec);
    str += '</div>';

    if (needRelevantsSlider || isT973MainSlider) {
        str += '</div>';
        str += '</div>';
    }

    return str;
}

function t_store_get_productCard_simpleStructure(product, edition, opts, link, isRelevantsShow, recid, rec) {
    var controlsStyle = opts.prodCard.showOpts ? '' : 'style="display:none;"';
    var strImg = t_store_get_productCard_img_html(product, opts);
    var str = '';
    str += link.open;
    str += '    ' + strImg;
    str += '    ' + t_store_get_productCard_txtAndPrice_html(product, edition, opts, strImg);
    str += link.close;
    str += '<div class="js-product-controls-wrapper t-store__card__prod-controls-wrapper" ' + controlsStyle + '></div>';
    str += t_store_get_productCard_btn_html(product, edition, opts, isRelevantsShow, recid, rec);
    return str;
}

function t_store_get_productCard_wrapperStructure(product, edition, opts, link, isRelevantsShow, recid, rec) {
    var wrapStyles = t_store_get_productCard_getWrapperStylesStr(opts);
    var controlsStyle = opts.prodCard.showOpts ? '' : 'style="display:none;"';
    var str = '';
    var padClass = opts.prodCard && opts.prodCard.txtPad ? 't-store__card__wrap_pad-' + opts.prodCard.txtPad : '';
    str += '<div class="t-store__card__wrap_all ' + padClass + '" style="' + wrapStyles + '">';
    str += '    ' + link.open;
    str += '        ' + t_store_get_productCard_img_html(product, opts);
    str += '    ' + link.close;
    str += '    <div class="t-store__card__wrap_txt-and-btns">';
    str += '        <div class="store__card__wrap_txt-and-opts">';
    str += '            ' + link.open;
    str += '                ' + t_store_get_productCard_txtAndPrice_html(product, edition, opts);
    str += '            ' + link.close;
    str += '            <div class="js-product-controls-wrapper t-store__card__prod-controls-wrapper" ' + controlsStyle + '></div>';
    str += '        </div>';
    str += '        ' + t_store_get_productCard_btn_html(product, edition, opts, isRelevantsShow, recid, rec);
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_productCard_getWrapperStylesStr(opts) {
    var str = '';
    str += opts.prodCard.bgColor ? 'background-color:' + opts.prodCard.bgColor + ';' : '';
    str += opts.prodCard.borderRadius ? 'border-radius:' + parseInt(opts.prodCard.borderRadius, 10) + 'px;' : '';

    var isShadow = (opts.prodCard.shadowOpacity && opts.prodCard.shadowOpacity.length) || (opts.prodCard.shadowSize && opts.prodCard.shadowSize.length) ? true : false;

    if (isShadow) {
        var opacity = opts.prodCard.shadowOpacity ? '0.' + opts.prodCard.shadowOpacity : '0.3';
        var size = opts.prodCard.shadowSize ? parseInt(opts.prodCard.shadowSize, 10) + 'px' : '10px';
        str += 'box-shadow: 0px 0px ' + size + ' 0px rgba(0, 0, 0, ' + opacity + ');';
    }
    return str;
}

function t_store_get_productCard_img_html(product, opts) {
    var str = '';
    var mobileNoPaddingClass = opts.hasOriginalAspectRatio && !opts.isHorizOnMob ? 't-store__card__imgwrapper_original-ratio' : '';
    var wrapperClassStr = 't-store__card__imgwrapper ' + mobileNoPaddingClass + (opts.isFlexCols ? opts.imageRatioClass : '');

    var wrapperStyle = opts.imageHeight && !opts.isFlexCols ? 'padding-bottom:' + (parseInt(opts.imageHeight, 10) * 100) / (opts.colWidth || 360) + '%;' : '';

    if (opts.hasOriginalAspectRatio && opts.prodCard.borderRadius) {
        var size = parseInt(opts.prodCard.borderRadius, 10);
        wrapperStyle += 'border-radius:' + size + 'px ' + size + 'px 0px 0px; overflow: hidden;';
    }

    var hoverImgEl = t_store_get_productCard_imgElHover_html(product, opts);
    var hasHover = opts.imageHover && hoverImgEl;

    var fieldAttrStrName = opts.hasOriginalAspectRatio ? 'imgfield' : 'bgimgfield';
    var imgFieldAttr = product.editions.length === 1 ? fieldAttrStrName + '="st_gallery__' + product.uid + ':::0"' : '';
    var imgEl;

    var imgSrc = t_store_getProductFirstImg(product);

    if (imgSrc !== '') {
        if (opts.hasOriginalAspectRatio) {
            imgEl =
                '<img ' +
                t_store_getLazySrc(opts, imgSrc) +
                ' class="js-product-img t-store__card__img ' +
                (hasHover ? 't-store__card__img_hover' : '') +
                ' t-img" ' +
                imgFieldAttr +
                '/>';
        } else {
            var stylesStr = t_store_get_productCard_getImgStyles(opts);
            imgEl =
                '<div class="js-product-img t-store__card__bgimg ' +
                (hasHover ? 't-store__card__bgimg_hover' : '') +
                ' t-bgimg" data-original="' +
                imgSrc +
                '" style="background-image:url(\'' +
                t_store_getLazyUrl(opts, imgSrc) +
                '\');' +
                stylesStr +
                '" ' +
                imgFieldAttr +
                '></div>';
        }
        str += '<div class="' + wrapperClassStr + '" ' + 'style="' + wrapperStyle +  '">';
        str += '    ' + t_store_get_productCard_mark_html(product, opts);
        str += '    ' + imgEl;
        str += '    ' + (opts.imageHover ? hoverImgEl : '');
        str += '</div>';
        return str;
    } else {
        return '';
    }
}

function t_store_get_productCard_imgElHover_html(product, opts) {
    if (product.gallery && product.gallery[0] === '[') {
        var galleryArr = jQuery.parseJSON(product.gallery);
        if (typeof galleryArr[1] !== 'undefined') {
            var imgSrc = galleryArr[1].img;
            var stylesStr = t_store_get_productCard_getImgStyles(opts);
            return opts.hasOriginalAspectRatio
                ? '<img ' + t_store_getLazySrc(opts, imgSrc) + ' class="t-store__card__img t-store__card__img_second t-img"/>'
                : '<div class="t-store__card__bgimg_second t-bgimg" data-original="' +
                      imgSrc +
                      '" style="background-image:url(' +
                      t_store_getLazyUrl(opts, imgSrc) +
                      ');' +
                      stylesStr +
                      '"></div>';
        }
    }
    return '';
}

function t_store_get_productCard_getImgStyles(opts) {
    if (opts.prodCard.borderRadius) {
        var size = parseInt(opts.prodCard.borderRadius, 10);
        return 'border-radius:' + size + 'px ' + size + 'px 0px 0px; top: -2px;';
    }
    return '';
}

function t_store_get_productCard_mark_html(product, opts) {
    if (!product.mark) {
        return '';
    }
    var stylesStr = '';
    stylesStr += opts.markColor ? 'color:' + opts.markColor + ';' : '';
    stylesStr += opts.markBgColor ? 'background-color:' + opts.markBgColor + ';' : '';
    var style = stylesStr ? 'style="' + stylesStr + '"' : '';
    var str = '';
    str += '<div class="t-store__card__mark-wrapper">';
    str += '    <div class="t-store__card__mark" ' + style + '>';
    str += '        ' + product.mark;
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_productCard_txtAndPrice_html(product, edition, opts, strImg) {
    var str = '';
    var removePadStyle = strImg === '' ? 'style="padding-top:0px;"' : '';
    str += '        <div class="t-store__card__textwrapper" ' + removePadStyle + '>';
    str += '            ' + t_store_get_productCard_txt_html(product, edition, opts);
    if (!opts.price.hasOwnProperty('position') || opts.price.position == '') {
        str += t_store_get_productCard_Price_html(product, edition, opts);
    }
    str += '        </div>';
    return str;
}

function t_store_get_productCard_txt_html(product, edition, opts) {
    var str = '';
    var typoClass = '';
    if (opts.price.hasOwnProperty('position') && opts.price.position == 'at') {
        str += t_store_get_productCard_Price_html(product, edition, opts);
    }

    if (product.title) {
        if (parseInt(opts.blocksInRow, 10) === 4) {
            typoClass = 't-name_xs';
        } else if (parseInt(opts.blocksInRow, 10) === 2) {
            typoClass = 't-name_xl';
        } else {
            typoClass = 't-name_md';
        }
        var titleFieldAttr = product.editions.length === 1 ? 'field="st_title__' + edition.uid + '" data-redactor-toolbar="no"' : '';
        str +=
            '<div class="js-store-prod-name js-product-name t-store__card__title t-name ' +
            typoClass +
            '" style="' +
            opts.typo.title +
            '" ' +
            titleFieldAttr +
            '>';
        str += product.title;
        str += '</div>';
    }
    if (opts.price.hasOwnProperty('position') && opts.price.position == 'bt') {
        str += t_store_get_productCard_Price_html(product, edition, opts);
    }

    if (edition.sku) {
        var skuVisCss = opts.prodCard.showOpts ? '' : 'display:none;';
        var skuColor = opts.typo.descrColor ? 'color:' + opts.typo.descrColor + ';' : '';
        var skuStyle = 'style="' + skuVisCss + skuColor + '"';
        var skuFieldAttr = product.editions.length === 1 ? 'field="st_sku__' + edition.uid + '" data-redactor-toolbar="no"' : '';
        str += '<div class="t-store__card__sku t-descr t-descr_xxs" ' + skuStyle + '>';
        str += window.tildaBrowserLang === 'RU' ? 'Артикул: ' : 'SKU: ';
        str += '<span class="js-store-prod-sku js-product-sku" ' + skuFieldAttr + '>';
        str += edition.sku;
        str += '</span>';
        str += '</div>';
    }
    if (product.descr) {
        var descrFieldAttr = product.editions.length === 1 ? 'field="st_descr__' + edition.uid + '" data-redactor-toolbar="no"' : '';
        str += '<div class="js-store-prod-descr t-store__card__descr t-descr t-descr_xxs" style="' + opts.typo.descr + '" ' + descrFieldAttr + '>';
        str += '    ' + product.descr;
        str += '</div>';
    }
    return str;
}

function t_store_get_productCard_Price_html(product, edition, opts) {
    var str = '';
    var modifier = '';
    if (opts.price.hasOwnProperty('position')) {
        if (opts.price.position == 'at') {
            modifier = ' t-store__card__price-wrapper_above-title';
        } else if (opts.price.position == 'bt') {
            modifier = ' t-store__card__price-wrapper_below-title';
        }
    }

    str += '<div class="js-store-price-wrapper t-store__card__price-wrapper' + modifier + '">';
    str += '    ' + t_store_get_productCard_onePrice_html(product, edition, opts, 'current');
    str += '    ' + t_store_get_productCard_onePrice_html(product, edition, opts, 'old');
    str += '    ' + (parseInt(edition.quantity, 10) === 0 ? t_store_get_soldOutMsg_html() : '');
    str += '</div>';
    return str;
}

function t_store_get_productCard_onePrice_html(product, edition, opts, type) {
    var value = type === 'current' ? edition.price : edition.priceold;
    var priceType = type === 'current' ? 'price' : 'priceold';

    var str = '';
    var priceStylingClass = type === 'current' ? 't-store__card__price' : 't-store__card__price_old';
    var styleAttr = '';
    var styleStr = '';
    var color = type === 'current' ? opts.price.color : opts.price.colorOld;
    styleStr += (!value || value === '0') ? 'display: none;' : '';
    styleStr += color ? 'color:' + color + ';' : '';
    styleStr += opts.price.fontSize ? 'font-size:' + opts.price.fontSize + ';' : '';
    styleStr += opts.price.fontWeight ? 'font-weight:' + opts.price.fontWeight + ';' : '';
    styleAttr = styleStr !== '' ? 'style = "' + styleStr + '"' : '';
    var priceFieldAttr = product.editions.length === 1 ? 'field="st_' + priceType + '__' + edition.uid + '" data-redactor-toolbar="no"' : '';

    var currency = opts.currencyTxt ? '<div class="t-store__card__price-currency">' + opts.currencyTxt + '</div>' : '';
    var jsProdClass = type === 'current' ? 'js-product-price js-store-prod-price-val' : 'js-store-prod-price-old-val';

    str += '<div class="' + priceStylingClass + ' t-store__card__price-item t-name t-name_xs" ' + styleAttr + '>';
    str += (opts.currencySide !== 'r' && currency ? currency : '');
    str += '<div class="' + jsProdClass + ' t-store__card__price-value notranslate" translate="no" ' + priceFieldAttr + '>' + value + '</div>';
    str += (opts.currencySide === 'r' && currency ? currency : '');

    if (product.portion > 0) {
        str += '<div class="t-store__prod__price-portion">/';
        if (product.portion !== '1') {
            str +=  + product.portion + ' ';
        }
        str += t_store_dict(product.unit) + '</div>';
    }

    str += '</div>';
    return str;
}

function t_store_get_productCard_btn_html(product, edition, opts, isRelevantsShow, recid, rec) {
    if (!opts.prodCard.btnTitle1 && !opts.prodCard.btnTitle2) {
        return '';
    }

    var str = '';
    var link;
    var linkTarget;
    var btnSizeClass = opts.btnSize === 'sm' ? 't-btn_xs' : 't-btn_sm';
    var isSoldOut = edition.quantity !== '' && parseInt(edition.quantity, 10) <= 0;

    var canClickBtn1 = !isSoldOut || (isSoldOut && opts.prodCard.btnLink1 !== 'order');
    var canClickBtn2 = !isSoldOut || (isSoldOut && opts.prodCard.btnLink2 !== 'order');

    str += '<div class="t-store__card__btns-wrapper js-store-buttons-wrapper">';
    if (opts.prodCard.btnTitle1 && canClickBtn1) {
        link = t_store_get_productCard_link(opts.prodCard.btnLink1, product, isRelevantsShow, recid, rec);
        linkTarget = t_store_get_productCard_targetAttr(opts.prodCard.btnLink1, product);

        if (opts.prodCard.btnLink1 === 'order' && (opts.showStoreBtnQuantity === 'list' || opts.showStoreBtnQuantity === 'both')) {
            str += t_store_get_productCard_quantity_html(opts, 'card');
        }

        str +=
            '<a href="' +
            link +
            '" ' +
            linkTarget +
            ' class="js-store-prod-btn t-store__card__btn t-btn ' +
            btnSizeClass +
            '" style="' +
            opts.btn1_style +
            '"><span class="t-store__card__btn-text">' +
            opts.prodCard.btnTitle1 +
            '</span></a>';
    }

    if (opts.prodCard.btnTitle2 && canClickBtn2) {
        link = t_store_get_productCard_link(opts.prodCard.btnLink2, product, isRelevantsShow, recid, rec);
        linkTarget = t_store_get_productCard_targetAttr(opts.prodCard.btnLink2, product);

        if (opts.prodCard.btnLink2 === 'order' && (opts.showStoreBtnQuantity === 'list' || opts.showStoreBtnQuantity === 'both')) {
            str += t_store_get_productCard_quantity_html(opts, 'card');
        }

        str +=
            '<a href="' +
            link +
            '" ' +
            linkTarget +
            ' class="js-store-prod-btn2 t-store__card__btn t-store__card__btn_second t-btn ' +
            btnSizeClass +
            '" style="' +
            opts.btn2_style +
            '"><span class="t-store__card__btn-text">' +
            opts.prodCard.btnTitle2 +
            '</span></a>';
    }
    str += '</div>';
    return str;
}

function t_store_get_productCard_link(link, product, isRelevantsShow, recid, rec) {
    if (rec[0]) {
        var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);
        if (isSnippet && link === 'popup') {
            return t_store_generateUrl(product);
        }
    }

    if (link === 'order') {
        return '#order';
    }

    if (isRelevantsShow) {
        var relevantUrl = product.buttonlink ? product.buttonlink : '#prodpopup';
        return relevantUrl;
    }

    if (link === 'popup') {
        if (product.buttonlink) {
            var url = product.buttonlink;
            if (url.indexOf('//') === -1 && url.slice(0, 1) !== '/') {
                url = 'http://' + url;
            }
            return url;
        } else {
            return '#prodpopup';
        }
    }
    return '#prodpopup';
}

function t_store_get_productCard_targetAttr(link, product) {
    if (link === 'popup' && product.buttonlink && product.buttontarget === '_blank') {
        return 'target="_blank"';
    }
    return '';
}

function t_store_get_horizSeparator_html(opts) {
    var str = '<div class="t-clear t-store__grid-separator" [[style]]></div>';
    str = str.replace('[[style]]', opts.vindent ? 'style="margin-bottom:' + opts.vindent + ';"' : '');
    return str;
}

function t_store_unifyCardsHeights(recid, opts) {
    if (!opts.prodCard || !opts.prodCard.hasWrap) {
        return;
    }
    var rec = $('#rec' + recid);
    var cards = rec.find('.t-store__card');
    var blocksPerRow = t_store_unifyCardsHeights_getBlocksInRow(opts, cards);

    if ($(window).width() <= 480 && !opts.isHorizOnMob) {
        rec.find('.t-store__card__wrap_txt-and-btns').css('height', 'auto');
        return;
    }

    for (var i = 0; i < cards.length; i += blocksPerRow) {
        var maxH = 0,
            rowCards = cards.slice(i, i + blocksPerRow).find('.t-store__card__wrap_txt-and-btns');

        rowCards.each(function () {
            var txt = $(this).find('.store__card__wrap_txt-and-opts'),
                btns = $(this).find('.t-store__card__btns-wrapper'),
                height = txt.outerHeight() + btns.outerHeight();
            if (height > maxH) {
                maxH = height;
            }
        });

        rowCards.css('height', maxH);
    }
}

function t_store_unifyCardsHeights_getBlocksInRow(opts, cards) {
    if ($(window).width() <= 960 && opts.isHorizOnMob) {
        return cards.length;
    } else if ($(window).width() <= 960) {
        return 2;
    } else {
        return parseInt(opts.blocksInRow, 10);
    }
}

function t_store_get_soldOutMsg_html() {
    return '<div class="js-store-prod-sold-out t-store__card__sold-out-msg t-name t-name_xs">' + t_store_dict('soldOut') + '</div>';
}

function t_store_initPopup(recid, obj_products, options, isRelevantsShow, obj) {
    for (var productKey in obj_products) {
        var rec = $('#rec' + recid);
        var productNode = isRelevantsShow
            ? rec.find('.js-product-relevant[data-product-gen-uid=' + productKey + ']')
            : rec.find('[data-product-gen-uid=' + productKey + ']');

        var popupTrigger = productNode.find('[href^="#prodpopup"]');

        popupTrigger.unbind();

        if (!isRelevantsShow) {
            window.localStorage.setItem('urlBeforePopupOpen', window.location.href);
        }
        popupTrigger.click(function (e) {
            e.preventDefault();

            var el_prodItem = $(this).closest('.js-product');
            var lid_prod = el_prodItem.attr('data-product-gen-uid');

            var productObj = obj_products[lid_prod];

            var ctrlKey = e.ctrlKey;
            var cmdKey = e.metaKey && navigator.platform.indexOf('Mac') !== -1;
            if (ctrlKey || cmdKey) {
                window.open(productObj.url);
                return;
            }

            if ((obj.header || obj.footer) && obj.disablepopup) {
                location.href = productObj.url;
            } else {
                isRelevantsShow
                    ? t_store_openProductPopup(recid, options, productObj, isRelevantsShow, false, true)
                    : t_store_openProductPopup(recid, options, productObj, isRelevantsShow, false, false);
            }
        });

        if (options.isPublishedPage) {
            setTimeout(function () {
                t_store_checkUrl(options, recid);
            }, 300);
        }

        t_store_copyTypographyFromLeadToPopup(recid, options);
    }
}

function t_store_openProductPopup(recid, opts, productObj, isRelevantsShow, fromHistory, fromPopup) {
    var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);
    if (!isSnippet) {
        t_store_open_popup_routing_init(recid, opts);
    }
    var showRelevants = opts.showRelevants;
    var rec = $('#rec' + recid);
    var el_popup = rec.find('.t-popup');
    t_store_drawProdPopup(recid, el_popup, productObj, opts, fromPopup);

    t_store_showPopup(recid, fromHistory, fromPopup);

    /* read title for analytics, when we add data to popup */
    var analytics = el_popup.attr('data-track-popup');
    if (analytics > '') {
        var virtTitle = productObj.title;
        if (!virtTitle) {
            virtTitle = 'prod' + productObj.uid;
        }
        try {
            if (Tilda && typeof Tilda.sendEcommerceEvent == 'function') {
                Tilda.sendEcommerceEvent('detail', [
                    {
                        id: '' + (productObj.id ? productObj.id : productObj.uid),
                        uid: '' + productObj.uid,
                        price: '' + (productObj.price_min ? productObj.price_min : productObj.price),
                        sku: productObj.sku ? productObj.sku : '',
                        name: productObj.title,
                    },
                ]);
            } else {
                Tilda.sendEventToStatistics(analytics, virtTitle);
            }
        } catch (e) {
            Tilda.sendEventToStatistics(analytics, virtTitle);
        }
    }

    if (opts.isPublishedPage && !fromHistory) {
        t_store_changeUrl(recid, productObj, isRelevantsShow, opts);
    }

    if (rec.attr('data-record-type') === '973') {
        t_slds_updateSlider(recid + ' .js-store-product');
    } else {
        t_slds_updateSlider(recid);
    }


    if (showRelevants && !isSnippet) {
        var relevantsLabel = {
            cc: 'current_category',
            all: 'all_categories',
        };
        var relevantsMethod = relevantsLabel[showRelevants] || 'category_' + showRelevants;
        var relevantsSort = 'random';
        var relevantsQuantity = opts.relevants_quantity || 4;
        t_store_loadProducts('relevants', recid, opts, false, {
            currentProductUid: productObj.uid,
            relevantsQuantity: relevantsQuantity,
            relevantsMethod: relevantsMethod,
            relevantsSort: relevantsSort,
        });
    }
    if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
        t_store_popup_updLazyOnScroll(recid);
    }

    /* create quantity input for popup */
    if (opts.showStoreBtnQuantity === 'both' || opts.showStoreBtnQuantity === 'popup') {
        var el_product = $('#rec' + recid + ' .t-popup .js-store-product');
        t_store_addProductQuantity(recid, el_product, productObj, opts);
    }

    t_store_init_popups(recid);

    /* update animation after transition: opacity ease-in-out .3s */
    setTimeout(function() {
        t_store_onFuncLoad('t_animate__setAnimationStateChains', function() {
            /* animChainsBlocks contains elements, which are animated as a chain, row by row */
            var animChainsBlocks = $('.r').has('.t-animate[data-animate-chain=yes]');
            t_animate__setAnimationStateChains(animChainsBlocks);
        });
    }, 300);
}

function t_store_addProductQuantity(recid, el_product, product, options) {
    var popupButton = el_product.find('.t-store__prod-popup__btn-wrapper a[href="#order"]:not(.t-store__prod-popup__btn_disabled)').first();
    var cardButton = el_product.find('.t-store__card__btns-wrapper a[href="#order"]:not([style*="display: none"])').first();
    var quantity = parseInt(product.quantity, 10);

    if (isNaN(quantity)) {
        if (product.editions !== undefined) {
            quantity = parseInt(product.editions[0].quantity, 10);
        }
    }

    if (cardButton.length === 0 && popupButton.length === 0 || (quantity == 0 || quantity == 1) || options.showStoreBtnQuantity === '' || options.showStoreBtnQuantity === undefined) {
        var quantityBtns = el_product.find('.t-store__prod__quantity');
        quantityBtns.parent().removeClass('t-store__card__btns-wrapper--quantity');
        quantityBtns.remove();
        return;
    }

    if ((options.showStoreBtnQuantity === 'list' && el_product.hasClass('t-store__card')) ||
        (options.showStoreBtnQuantity === 'popup' && el_product.hasClass('t-store__product-snippet')) ||
        (options.showStoreBtnQuantity === 'popup' && el_product.hasClass('t-store__product-popup')) ||
        options.showStoreBtnQuantity === 'both'
    ) {
        /* default parameters not compatibility with IE */
        if (options === undefined) {
            options = {};
        }

        /* find quantity */
        var quantityBtns = el_product.find('.t-store__prod__quantity');
        var input = quantityBtns.find('.t-store__prod__quantity-input');

        /* create quantity */
        if (quantityBtns.length < 1) {
            var str = '';
            var btnStyle = options.btn1_style;
            var quantityBorderRadius = '';
            var classSize = '';

            if (el_product.hasClass('t-store__card')) {
                classSize = '';
                if (options.btnSize === 'sm') {
                    classSize = 't-store__prod__quantity_xs';
                }
            }

            if (btnStyle !== '' && btnStyle !== undefined) {
                position = btnStyle.indexOf('border-radius');
                if (position !== -1) {
                    var endPosition = btnStyle.slice(position).indexOf(';');
                    quantityBorderRadius = btnStyle.slice(position + 14, position + endPosition);
                }
            }

            var borderRadius = '';
            if (quantityBorderRadius !== '') {
                borderRadius = 'border-radius:' + quantityBorderRadius + ';';
            }

            str +=     '<div class="t-store__prod__quantity ' + classSize + '" style="' + borderRadius + '">';
            str +=         '<div class="t-store__prod__quantity__minus-wrapper">';
            str +=             '<span class="t-store__prod__quantity__minus"></span>';
            str +=          '</div>';
            str +=          '<input class="t-store__prod__quantity-input t-descr t-descr_xxs" type="number" min="1" max="9999" step="1" value="1" size="4" maxlength="4" />';
            str +=         '<div class="t-store__prod__quantity__plus-wrapper">';
            str +=             '<span class="t-store__prod__quantity__plus"></span>';
            str +=         '</div>';
            str +=     '</div>';

            if (popupButton.length === 1) {
                popupButton.before(str);
            } else if (cardButton.length === 1) {
                cardButton.before(str);
            }

            /* init events */
            t_store_addProductQuantityEvents(el_product);

            /* find new input */
            quantityBtns = el_product.find('.t-store__prod__quantity');
            input = quantityBtns.find('.t-store__prod__quantity-input');

            var btnsWrapper = cardButton.parent();
            btnsWrapper.addClass('t-store__card__btns-wrapper--quantity');
            if (btnsWrapper.find('a:not([href^="#order"])').length > 0) {
                btnsWrapper.wrap('<div></div>');
            }
        } else {
            /* set default */
            input.val(1);
            /* update input, if max is changed */
            input.change();
            var value = input.val();

            if (isNaN(quantity)) {
                quantityBtns.removeClass('t-store__prod-popup__btn_disabled');
            } else if (quantity > 1) {
                quantityBtns.removeClass('t-store__prod-popup__btn_disabled');
                if (parseInt(value, 10) === 0) {
                    input.val(1);
                }
            } else {
                quantityBtns.addClass('t-store__prod-popup__btn_disabled');
            }
        }

        /* set max quantity */
        if (isNaN(quantity)) {
            input.prop('max', 9999);
        } else if (quantity > 0) {
            input.prop('max', quantity);
        }
    }
}

function t_store_addProductQuantityEvents(product) {
    var quantityBtns = product.find('.t-store__prod__quantity');
    var input = quantityBtns.find('.t-store__prod__quantity-input');

    product.find('.t-store__prod__quantity__minus-wrapper').off('click');
    product.find('.t-store__prod__quantity__minus-wrapper').on('click', function () {
        var count = parseInt(input.val(), 10) - 1;
        count = count < 1 ? 1 : count;
        input.val(count);
        input.change();
    });

    product.find('.t-store__prod__quantity__plus-wrapper').off('click');
    product.find('.t-store__prod__quantity__plus-wrapper').on('click', function () {
        var count = parseInt(input.val(), 10) + 1;
        var max = input.prop('max') || 999;
        count = count > max ? max : count;
        input.val(count);
        input.change();
    });

    product.find('.t-store__prod__quantity-input').off('change');
    product.find('.t-store__prod__quantity-input').on('change', function () {
        var max = input.prop('max') || 999;
        var value = parseInt(input.val() || 1, 10);
        if (value < 1 || isNaN(value)) {
            input.val(1);
        } else if (value > max) {
            input.val(max);
        } else {
            input.val(value);
        }
    });
}

function t_store_init_popups() {
    if (typeof t331_initPopup === 'undefined') {
        return;
    }

    try {
        var blocksWithHook = $('#allrecords').find('.t-popup[data-tooltip-hook]');
        if (blocksWithHook.length > 0) {
            var recidBlockWithHook = parseInt(blocksWithHook.parents()[1].id.slice(3), 10);
            if (recidBlockWithHook && typeof recidBlockWithHook === 'number') {
                t331_initPopup(recidBlockWithHook);
            }
        }
    } catch (e) {
        console.log('something wrong in t_store_init_popups', e);
    }
}

function t_store_open_popup_routing_init(recid, opts) {
    window.onpopstate = function () {
        if (window.history.state) {
            if (window.history.state.productData) {
                var productPopupData = window.history.state.productData;
                var recidFromHistory = productPopupData.recid,
                    optsFromHistory = productPopupData.opts,
                    productObjFromHistory = productPopupData.productObj,
                    isRelevantsShowFromHistory = productPopupData.isRelevantsShow;
                t_store_openProductPopup(recidFromHistory, optsFromHistory, productObjFromHistory, isRelevantsShowFromHistory, true);
            } else {
                t_store_closePopup(true, recid, opts);
            }
        } else {
            t_store_closePopup(true, recid, opts);
        }
    };
}

function t_store_popup_updLazyOnScroll(recid) {
    /*
    need to update lazy on scroll in popup
    */

    var scrollContainer = $('#rec' + recid + ' .t-popup');
    var curMode = $('.t-records').attr('data-tilda-mode');

    if (scrollContainer.length && curMode != 'edit' && curMode != 'preview') {
        scrollContainer.bind(
            'scroll',
            t_throttle(function () {
                if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
                    t_store_onFuncLoad('t_lazyload_update', function () {
                        t_lazyload_update();
                    });
                }
            }, 1000)
        );
    }
}

function t_store_changeUrl(recid, product, isRelevantsShow, opts) {
    var curUrl = window.location.href;
    var productData = {
        productObj: product,
        opts: opts,
        isRelevantsShow: isRelevantsShow,
        recid: recid,
    };
    var newUrl;

    var newPageTitle = document.title + ' – ' + product.title;
    if (curUrl.indexOf('/tproduct/') < 0 && curUrl.indexOf('%2Ftproduct%2F') < 0) {
        newUrl = t_store_generateUrl(product);
        t_store_history_pushState({ productData: productData }, newPageTitle, newUrl);
    } else if (isRelevantsShow) {
        /* for relevants */
        newUrl = t_store_generateUrl(product);
        t_store_history_pushState({ productData: productData }, newPageTitle, newUrl);
    }
}

function t_store_generateUrl(product) {
    var currentProtocol = window.location.protocol;
    var currentHost = window.location.host;
    var relativeProductPath;

    relativeProductPath = product.url.split('://')[1];
    relativeProductPath = relativeProductPath.split('/');
    relativeProductPath.shift();
    relativeProductPath = relativeProductPath.join('/');

    var newUrl = currentProtocol + '//' + currentHost + '/' + relativeProductPath;
    return newUrl;
}

function t_store_drawProdPopup(recid, el_popup, product, options, fromPopup) {
    $(el_popup).scrollTop(0);
    var el_product = el_popup.find('.js-store-product.js-product');
    el_product.data('cardSize', 'large');
    t_store_drawProdPopup_drawGallery(recid, el_popup, product, options);
    t_store_drawProdPopup_nav(product, recid);
    el_popup.find('.js-store-product').data('def-pack-obj', '');
    el_popup.find('.js-store-product').attr('data-product-lid', product.uid).attr('data-product-uid', product.uid).attr('data-product-gen-uid', product.uid);

    if (product.title) {
        el_popup.find('.js-store-prod-name').html(product.title).show();
    } else {
        el_popup.find('.js-store-prod-name').html('').hide();
    }

    var partuids = [];
    try {
        partuids = JSON.parse(product.partuids);
    } catch (e) {}

    /* links for size chart */
    if (options.linksSizeChart !== undefined && partuids.length > 0) {
        var str = '';
        var linksAdded = [];
        for (var i = 0; i < partuids.length; i++) {
            var uid = partuids[i];
            if (options.linksSizeChart[uid] !== undefined) {
                if (options.linksSizeChart[uid].infotext !== undefined && options.linksSizeChart[uid].infourl !== undefined) {
                    if (linksAdded.indexOf(options.linksSizeChart[uid].infourl) === -1) {
                        str += '    <div class="t-store__prod-popup__link t-descr t-descr_xxs">';
                        str += '        <a href="' + options.linksSizeChart[uid].infourl.replace(/"/g, '&quot;') + '" target="_blank">';
                        str += '            ' + options.linksSizeChart[uid].infotext;
                        str += '        </a>';
                        str += '    </div>';

                        linksAdded.push(options.linksSizeChart[uid].infourl);
                    }
                }
            }
        }
        el_popup.find('.t-store__prod-popup__links-wrapper').html(str);
    } else {
        el_popup.find('.t-store__prod-popup__links-wrapper').html('');
    }

    t_store_initTextAndCharacteristics(el_popup, product);

    t_store_addProductOptions(recid, product, el_product, options);
    t_store_option_handleOnChange_custom(recid, el_product, options);
    t_prod__initProduct(recid, el_product);

    if (fromPopup) {
        $(window).unbind('resize', window.t_store_prodPopup_updateGalleryThumbsEvent);
    }
    window.t_store_prodPopup_updateGalleryThumbsEvent = function () {
        t_store_prodPopup_updateGalleryThumbs(recid, el_popup, product, options);
    };
    $(window).bind('resize', window.t_store_prodPopup_updateGalleryThumbsEvent);
}

function t_store_drawProdPopup_nav(product, recid) {
    var rec = $('#rec' + recid);
    var nav = rec.find('.t-popup__close');
    var container;
    var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);

    if (isSnippet) {
        container = $('.t-store__product-snippet');
    } else {
        container = rec.find('.t-popup__container');
    }

    /* Uncomment if you want to add navbar opacity scroll from transparent to solid */
    // if (!product.gallery) {
    //     container.css('margin-top', '60px');
    //     nav.addClass('t-popup__close-solid');
    //     nav.removeClass('t-popup__close-opacity-scroll');
    // } else {
    //     container.css('margin-top', '0');
    //     nav.addClass('t-popup__close-opacity-scroll');
    //     nav.removeClass('t-popup__close-solid');
    // };
}

function t_store_initTextAndCharacteristics(el_popup, product) {
    var prodTxt = product.text ? product.text : product.descr ? product.descr : '';
    if (product.characteristics && product.characteristics.length > 0) {
        prodTxt += prodTxt.length > 0 ? '</br></br>' : '';
        product.characteristics.forEach(function (ch) {
            prodTxt += '<p class="js-store-prod-charcs">' + ch.title + ': ' + ch.value + '</p>';
        });
    }

    var pack_label = product.pack_label || '',
        pack_m = parseInt(product.pack_m, 10) || 0,
        pack_x = parseInt(product.pack_x, 10) || 0,
        pack_y = parseInt(product.pack_y, 10) || 0,
        pack_z = parseInt(product.pack_z, 10) || 0,
        productUrl = product.url || '';

    /* draw characteristics */

    if (pack_label && pack_x && pack_y && pack_z) {
        var dimension = '';
        dimension += pack_x + 'x' + pack_y + 'x' + pack_z;
        prodTxt += '<p class="js-store-prod-dimensions">' + t_store_dict('product-' + pack_label) + ': ' + dimension + '&nbsp;'+t_store_dict('mm') + '</p>';
    }

    /* add 'weight' always */
    prodTxt += '<p class="js-store-prod-weight"></p>';

    el_popup.find('.js-store-prod-text').html(prodTxt).show();

    /* add weight if != 0 */
    if (pack_m) {
        el_popup.find('.js-store-prod-weight').html(t_store_dict('product-weight') + ': ' + pack_m + '&nbsp;' + t_store_dict('g'));
    }
    /* */

    /* add data attributes for characteristics */

    el_popup
        .find('.js-store-product')
        .attr('data-product-pack-label', pack_label)
        .attr('data-product-pack-m', pack_m)
        .attr('data-product-pack-x', pack_x)
        .attr('data-product-pack-y', pack_y)
        .attr('data-product-pack-z', pack_z);

    /* */

    el_popup.find('.js-store-product').attr('data-product-url', productUrl);
}

function t_store_addProductOptions(recid, product, el_product, options) {
    var optionsWrapper = el_product.find('.js-product-controls-wrapper');
    optionsWrapper.html('');
    var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);
    var firstAvailabeEdition = t_store_product_getFirstAvailableEditionData(product.editions);

    /*
    product edition — is a combination of parameters with separate quantity and price
    example: "Blue XS T-Shirt"
    */
    t_store_product_initEditions(recid, product, el_product, options);

    /*
    product modification — is an additional service
    example: "present pack"
    */
    var param1 = { name: product.prod_option, values: product.prod_variants };
    var param2 = { name: product.prod_option2, values: product.prod_variants2 };
    var param3 = { name: product.prod_option3, values: product.prod_variants3 };
    var param4 = { name: product.prod_option4, values: product.prod_variants4 };
    var param5 = { name: product.prod_option5, values: product.prod_variants5 };
    t_store_product_addOneOptionsControl('modificator', param1, optionsWrapper, options, firstAvailabeEdition, recid);
    t_store_product_addOneOptionsControl('modificator', param2, optionsWrapper, options, firstAvailabeEdition, recid);
    t_store_product_addOneOptionsControl('modificator', param3, optionsWrapper, options, firstAvailabeEdition, recid);
    t_store_product_addOneOptionsControl('modificator', param4, optionsWrapper, options, firstAvailabeEdition, recid);
    t_store_product_addOneOptionsControl('modificator', param5, optionsWrapper, options, firstAvailabeEdition, recid);

    if (isSnippet) {
        t_store_option_handleOnChange_custom(recid, el_product, options);
    }
}

function t_store_get_control_option_html(options) {
    var str = '';

    var styleAttr = '';
    var styleStr = '';
    var color = options.typo && options.typo.descrColor ? options.typo.descrColor : '';
    styleStr += color !== '' ? 'color:' + color + ';' : '';
    styleAttr = styleStr !== '' ? 'style = "' + styleStr + '"' : '';

    str += '<div class="js-product-option t-product__option">';
    str += '    <div class="js-product-option-name t-product__option-title t-descr t-descr_xxs" ' + styleAttr + '>[[name]]</div>';
    str +=
        '    <div class="t-product__option-variants t-product__option-variants_regular"> <select class="js-product-option-variants t-product__option-select t-descr t-descr_xxs"> [[optiontags]] </select> </div>';
    str += '</div>';
    return str;
}

function t_store_get_control_editionOption_html(options, curOption) {
    var str = '';

    var styleAttr,
        styleStr = '',
        dataAttr = '';
    var color = options.typo && options.typo.descrColor ? options.typo.descrColor : '';
    styleStr += color !== '' ? 'color:' + color + ';' : '';
    styleAttr = styleStr !== '' ? 'style = "' + styleStr + '"' : '';

    /*  Hide custom selects and restyle later */
    var isCustomOption = t_store_option_checkIfCustom(curOption);
    var optionStyle = isCustomOption ? ' style="display: none;"' : '';

    /*  Store custom select attributes (not used currently) */
    if (curOption.params) {
        if (curOption.params.view) {
            dataAttr += ' data-view-type="' + curOption.params.view + '"';
        }

        if (curOption.params.hasColor) {
            dataAttr += ' data-option-type="color"';
        } else {
            dataAttr += ' data-option-type="regular"';
        }
    }

    str += '<div class="js-product-edition-option t-product__option" data-edition-option-id="[[id]]"' + dataAttr + '>';
    str += '    <div class="js-product-edition-option-name t-product__option-title t-descr t-descr_xxs" ' + styleAttr + '>[[name]]</div>';
    str +=
        '    <div class="t-product__option-variants t-product__option-variants_regular"' + optionStyle + '> <select class="js-product-edition-option-variants t-product__option-select t-descr t-descr_xxs"> [[optiontags]] </select> </div>';
    str += '</div>';

    return str;
}

function t_store_option_styleCustomControl(recid, options, curOption, optionsWrapper, firstAvailabeEdition) {
    var str = '';
    var wrapper = optionsWrapper.find('.js-product-edition-option[data-edition-option-id="' + curOption.name + '"]');
    var isSelect = curOption.params && curOption.params.view === 'select';
    var isColor = curOption.params && curOption.params.hasColor && !curOption.params.linkImage;
    var isImage = curOption.params && curOption.params.linkImage;
    var defaultValue = curOption.values[0];

    /* Get custom class modificators */
    var parentMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-variants');
    var labelMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-item');
    var inputMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-input');
    var checkmarkMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-checkmark');
    var titleMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-title');

    /* If the option is custom dropdown select then add element to display selected value */
    if (isSelect) {
        var selectedMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-selected');
        str += '<div class="t-product__option-selected ' + selectedMod + ' t-descr t-descr_xxs">';

        if (isColor) {
            /* Add addition element for dropdowns with color option for future styling */
            var colorStyle = ' style="background-color: ' + t_store_option_getColorValue(curOption.valuesObj, defaultValue) + ';"';
            str += '    <span class="t-product__option-selected-checkmark"' + colorStyle + '></span>';
        } else if (isImage) {
            var value = curOption.values[0];
            var url = curOption.imagesObj[value];
            var lazyUrl = t_store_getLazyUrl(options, url);

            var imageStyle = !lazyUrl ? '' : ' style="background-image: url(\'' + lazyUrl + '\');"';
            str += '    <div class="t-product__option-selected-checkmark t-bgimg" data-original="' + url + '"' + imageStyle + '></div>';
        }

        str += '        <span class="t-product__option-selected-title">'
         + defaultValue + '</span>';
        str += '</div>';

        /* Hide custom dropdown options list by default */
        parentMod += ' t-product__option-variants_hidden';
    }

    /* Do not replace <form></form>.
    Form tag is required, because multiple radio inputs exist in HTML (product tile, popup etc) */
    str += '<form class="t-product__option-variants t-product__option-variants_custom ' + parentMod + '">';

    for (var i = 0; i < curOption.values.length; i++) {
        var value = curOption.values[i];
        var isActive = firstAvailabeEdition[curOption.name] === value;
        var checked = isActive ? ' checked' : '';
        var activeClass = isActive ? ' t-product__option-item_active ' : '';

        /* Style UI if it has color */
        var checkmarkStyle = !isColor ? '' : ' style="background-color: ' + t_store_option_getColorValue(curOption.valuesObj, value) + ';"';

        /* Put everything together */
        str += '<label class="t-product__option-item ' + activeClass + labelMod + '">';
        str += '    <input class="t-product__option-input ' + inputMod + '" type="radio" name="' + curOption.name + '" value="' + t_store_escapeQuote(value) + '"' + checked + '>';

        if (isImage && curOption.imagesObj) {
            var url = curOption.imagesObj[value];
            var lazyUrl = t_store_getLazyUrl(options, url);
            checkmarkStyle = !lazyUrl ? '' : ' style="background-image: url(\'' + lazyUrl + '\');"';

            str += '    <div class="t-product__option-checkmark t-bgimg ' + checkmarkMod + '"' + checkmarkStyle + ' data-original="' + url + '"></div>';
        } else {
            str += '    <div class="t-product__option-checkmark ' + checkmarkMod + '"' + checkmarkStyle + '></div>';
        }

        str += '    <span class="t-product__option-title ' + titleMod + ' t-descr t-descr_xxs">' + value + '</span>';
        str += '</label>';
    }
    str += '</form>';

    wrapper.append(str);

    // if (window.lazy === 'y') {
    //     setTimeout(function() {
    //         t_lazyload_update();
    //         console.log('here');
    //     }, 500);
    // }
}

function t_store_option_getColorValue(valuesObj, value) {
    var result = '#ffffff';

    for (var key in valuesObj) {
        var item = valuesObj[key];
        if (item.value === value) {
            result = item.color;
            break;
        }
    }

    return result;
}

function t_store_option_getClassModificator(curOption, type, className) {
    // Add class modificators for both filters and options
    if (!curOption) {
        return '';
    }
    var params = curOption.params;
    var result = className + '_' + params.view;

    if (params.hasColor && params.linkImage) {
        // If product options has both color and image, design for filters and options differ
        if (type === 'filter') {
            result = className + '_' + 'buttons';
            result += ' ' + className + '_' + 'color';
        } else {
            result += ' ' + className + '_' + 'image';
        }
    } else if (params.hasColor) {
        result += ' ' + className + '_' + 'color';
    } else if (params.linkImage) {
        result += ' ' + className + '_' + 'image';
    } else {
        result += ' ' + className + '_' + 'simple';
    }

    return result;
}

function t_store_checkUrl(opts, recid) {
    var curUrl = window.location.href;
    var tprodIndex = curUrl.indexOf('/tproduct/');
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && tprodIndex < 0) {
        tprodIndex = curUrl.indexOf('/tproduct/');
        if (tprodIndex < 0) {
            tprodIndex = curUrl.indexOf('%2Ftproduct%2F');
        }
    }
    if (tprodIndex >= 0) {
        curUrl = curUrl.substring(tprodIndex, curUrl.length);
        var prodDataArr = curUrl.split('-');
        if (typeof prodDataArr[1] === 'undefined') {
            return;
        }
        var curProdUid = prodDataArr[1];
        var rec = $('#rec' + recid);
        var prod = rec.find('.js-store-grid-cont [data-product-gen-uid=' + curProdUid + ']');
        var el_popup = rec.find('.t-popup');

        if (curUrl.indexOf(recid) >= 0 && prod.length) {
            /* if product exists among products list at slice 1, we trigger click */
            if (!el_popup.hasClass('t-popup_show')) {
                rec.find('[data-product-gen-uid=' + curProdUid + '] [href^="#prodpopup"]').triggerHandler('click');
            }
            /* scroll to product */
            // work incorrect, need fix
            // var prodOffset = prod.offset().top;
            // $(window).scrollTop(prodOffset - 100);
        } else if (curUrl.indexOf(recid) >= 0) {
            if (el_popup.hasClass('t-popup_show')) {
                return;
            }

            /* if product doesn't exist among products list at slice 1, we load it separately */
            var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);

            if (!isSnippet) {
                t_store_loadOneProduct(recid, opts, curProdUid).then(function (data) {
                    if (typeof data === 'string' && data.substr(0, 1) == '{') {
                        try {
                            var dataObj = jQuery.parseJSON(data);
                            var productObj = dataObj.product;
                        } catch (e) {
                            console.log(data);
                        }
                        if (productObj === '') {
                            console.log("Can't get product with uid = " + curProdUid + ' in storepart = ' + opts.storepart);
                            return;
                        }
                        t_store_openProductPopup(recid, opts, productObj);
                    } else {
                        console.log("Can't get product with uid = " + curProdUid + ' in storepart = ' + opts.storepart);
                    }
                });
            } else {
                // if user coming from catalog redirect back to main page
            }
        }
    }
}

function t_store_showPopup(recid, fromHistory, fromPopup) {
    var el = $('#rec' + recid);
    var popup = el.find('.t-popup');
    t_store_resetNavStyles(recid);

    popup.css('display', 'block');
    setTimeout(function () {
        popup.find('.t-popup__container').addClass('t-popup__container-animated');
        popup.addClass('t-popup_show');
        if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
            t_store_onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
    }, 50);

    $('body').addClass('t-body_popupshowed');

    if (!fromPopup) {
        addPopupEvents(el, recid);
    }
}

function addPopupEvents(el) {
    /* set close events */
    el.find('.t-popup').off('click');
    el.find('.t-popup').on('click', function (e) {
        if (e.target == this) {
            t_store_closePopup(false);
        }
    });

    el.find('.t-popup__close, .js-store-close-text').off('click');
    el.find('.t-popup__close, .js-store-close-text').on('click', function () {
        t_store_closePopup(false);
    });

    $(document).keydown(function (e) {
        if (e.keyCode == 27) {
            t_store_closePopup(false);
        }
    });

    // Change nav opacity on scroll
    el.find('.t-popup').off('scroll');
    t_store_addEvent_scrollNav(el.find('.t-popup'));
    /* finish close events */
}

function t_store_addEvent_scrollNav(el) {
    el.off('scroll');
    var fadeStart = 30,
        fadeUntil = 200,
        fading = el.find('.t-popup__close-opacity-scroll');

    if (!fading.length) {
        return;
    }

    el.on('scroll', function() {
        var offset = el.scrollTop(),
            opacity = 0;

        if (offset >= fadeUntil ) {
            opacity = 1;
        } else if (offset <= fadeStart) {
            opacity = 0;
        } else {
            opacity = offset/fadeUntil;
        }

        fading.css('background-color', 'rgba(255,255,255,' + opacity + ')');
    });
}

function t_store_resetNavStyles(recid) {
    var nav = $('#rec' + recid).find('.t-popup__close');

    // Reset navbar background color
    if (nav.hasClass('t-popup__close-solid')) {
        nav.css('background-color', 'rgba(255,255,255,1)');
    } else if (nav.hasClass('t-popup__close-opacity-scroll')) {
        nav.css('background-color', 'rgba(255,255,255,0)');
    }
}

function t_store_closePopup(fromHistory, recid, opts) {
    var isSnippet = $.contains($('#allrecords')[0], $('.t-store__product-snippet')[0]);
    if (!isSnippet) {
        t_store_closePopup_routing();
    }

    var storepartuid;
    var optsFromHistory;
    var productData;
    var urlBeforePopupOpen;

    $('body').removeClass('t-body_popupshowed');
    $('.t-popup').removeClass('t-popup_show');

    if (fromHistory) {
        if (t_store_isQueryInAddressBar('tstore')) {
            var storeuid;
            var hashArr = decodeURI(window.location.hash).split('/');
            var storepartValueIndex = hashArr.indexOf('c') + 1;
            var storeuidIndex = hashArr.indexOf('r') + 1;
            storeuid = hashArr[storeuidIndex];
            storepartuid;

            if (hashArr[storepartValueIndex].indexOf('-') != -1) {
                storepartuid = hashArr[storepartValueIndex].slice(0, hashArr[storepartValueIndex].indexOf('-'));
            } else {
                storepartuid = hashArr[storepartValueIndex];
            }
            optsFromHistory = window.history.state.opts;
            optsFromHistory.storepart = storepartuid;
            if (!t_store_isStorepartFromHistoryActive(storepartuid, recid, opts)) {
                t_store_loadProducts('', storeuid, optsFromHistory);
            }
        } else if (!t_store_isStorepartFromHistoryActive(opts.storepart, recid, opts)) {
            t_store_loadProducts('', recid, opts);
        }
    } else if (window.history.state && window.history.state.productData) {
        urlBeforePopupOpen = window.localStorage.getItem('urlBeforePopupOpen');
        productData = window.history.state.productData;
        storepartuid = productData.opts.storepart;
        opts = productData.opts;
        recid = productData.recid;
        t_store_history_pushState(
            {
                storepartuid: storepartuid,
                opts: opts,
                recid: recid,
            },
            null,
            urlBeforePopupOpen
        );
    }

    t_store_setActiveStorePart(recid, opts);

    t_store_galleryVideoClearFrame(recid);

    setTimeout(function () {
        $('.t-popup').scrollTop(0);
        $('.t-popup').not('.t-popup_show').css('display', 'none');
    }, 300);

    $(document).unbind('keydown');
    $(window).unbind('resize', window.t_store_prodPopup_updateGalleryThumbsEvent);
}

function t_store_isStorepartFromHistoryActive(storepartuid, recid, opts) {
    var rec = $('#rec' + recid);

    if (opts && !opts.storePartsArr) {
        /*
            when we have catalog with multiple storeparts, opts include storePartsArr key
            so if we don't have this key we know - storepart is active
            because in this case we have only one part
        */
        return true;
    }

    if (!storepartuid) {
        return false;
    }

    storepartuid = parseInt(storepartuid, 10);
    var activeStorepartUid = rec.find('.js-store-parts-switcher.t-active').data('storepartUid');
    return activeStorepartUid === storepartuid;
}

function t_store_closePopup_routing() {
    window.onpopstate = function () {
        if (window.history.state) {
            if (window.history.state.productData) {
                var productPopupData = window.history.state.productData;
                var recid = productPopupData.recid,
                    opts = productPopupData.opts,
                    productObj = productPopupData.productObj,
                    isRelevantsShow = productPopupData.isRelevantsShow;
                t_store_openProductPopup(recid, opts, productObj, isRelevantsShow, true);
            }

            if (window.history.state.storepartuid) {
                // var storepartuid = window.history.state.storepartuid;
                var optsFromHistory = window.history.state.opts;
                var recidFromHistory = window.history.state.recid;
                // opts.storepart = storepartuid;
                opts.isPublishedPage = true; // hack, need fix
                t_store_loadProducts('', recidFromHistory, optsFromHistory);
            }
        } /* else {
            console.log('history is empty');
        } */
    };
}

function t_store_copyTypographyFromLeadToPopup(recid, options) {
    var rec = $('#rec' + recid);
    var titleStyle = rec.find('.js-store-grid-cont .js-store-prod-name').attr('style');
    var descrStyle = rec.find('.js-store-grid-cont .js-store-prod-descr').attr('style');
    if (typeof descrStyle == 'undefined' && options.typo.descr != '') {
        descrStyle = options.typo.descr;
    }
    rec.find('.t-popup .js-store-prod-name').attr('style', t_store_removeSizesFromStylesLine(titleStyle));
    rec.find('.t-popup .js-store-prod-text').attr('style', t_store_removeSizesFromStylesLine(descrStyle));
}

function t_store_removeSizesFromStylesLine(styleStr) {
    if (
        typeof styleStr != 'undefined' &&
        (styleStr.indexOf('font-size') >= 0 || styleStr.indexOf('padding-top') >= 0 || styleStr.indexOf('padding-bottom') >= 0)
    ) {
        var styleStrSplitted = styleStr.split(';');
        styleStr = '';
        for (var i = 0; i < styleStrSplitted.length; i++) {
            if (
                styleStrSplitted[i].indexOf('font-size') >= 0 ||
                styleStrSplitted[i].indexOf('padding-top') >= 0 ||
                styleStrSplitted[i].indexOf('padding-bottom') >= 0
            ) {
                styleStrSplitted.splice(i, 1);
                i--;
                continue;
            }
            if (styleStrSplitted[i] == '') {
                continue;
            }
            styleStr += styleStrSplitted[i] + ';';
        }
    }
    return styleStr;
}

function t_store_drawProdPopup_drawGallery(recid, el_popup, product, options) {
    var rec = $('#rec' + recid);
    var galleryArr;
    if (!product.gallery) {
        el_popup.find('.js-store-prod-slider').html('');
        return;
    }

    if (typeof product.gallery === 'string') {
        galleryArr = jQuery.parseJSON(product.gallery);
    } else {
        galleryArr = product.gallery;
    }

    if (galleryArr.length === 0) {
        el_popup.find('.js-store-prod-slider').html('');
        return;
    }

    var tpl = t_store_get_productcard_slider_html(rec, options);
    var str = tpl;
    var strSlides = '';
    var strBullets = '';
    var hasBullets =
        options.slider_opts.controls === 'thumbs' ||
        options.slider_opts.controls === 'arrowsthumbs' ||
        options.slider_opts.controls === 'dots' ||
        options.slider_opts.controls === '';

    var hasThumbs = options.slider_opts.controls === 'thumbs' || options.slider_opts.controls === 'arrowsthumbs';

    var columnSizeForMainImage = parseInt(options.popup_opts.columns, 10);
    var galleryImageAspectRatio = +options.slider_slidesOpts.ratio;
    var thumbsSize = 60;
    var marginBetweenThumbs = 10;
    var oneBulletTpl;
    var oneBulletStr;
    $.each(galleryArr, function (key, element) {
        var oneSlideTpl = t_store_get_productcard_oneSlide_html(options, element);
        strSlides += oneSlideTpl
            .replace('[[activeClass]]', key === 0 ? 't-slds__item_active' : '')
            .replace('[[productClass]]', key === 0 ? 'js-product-img' : '')
            .replace(/\[\[index\]\]/g, key + 1)
            .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
            .replace(/\[\[imgsource\]\]/g, element.img);

        if (hasBullets) {
            if (hasThumbs && options.sliderthumbsside == 'l') {
                var maxThumbsCount = t_store_prodPopup_gallery_calcMaxThumbsCount(
                    columnSizeForMainImage,
                    galleryImageAspectRatio,
                    thumbsSize,
                    marginBetweenThumbs
                );

                if (key <= maxThumbsCount - 1) {
                    if (key <= maxThumbsCount - 2 || key === galleryArr.length - 1) {
                        oneBulletTpl = t_store_get_productcard_oneSliderBullet_html(options);
                        oneBulletStr = oneBulletTpl
                            .replace('[[activeClass]]', key === 0 ? 't-slds__bullet_active' : '')
                            .replace(/\[\[index\]\]/g, key + 1)
                            .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
                            .replace(/\[\[imgsource\]\]/g, element.img);
                    } else {
                        oneBulletTpl = t_store_get_productcard_thumbsGallery_html(options, galleryArr.length, maxThumbsCount);
                        oneBulletStr = oneBulletTpl
                            .replace('[[activeClass]]', key === 0 ? 't-slds__bullet_active' : '')
                            .replace(/\[\[index\]\]/g, key + 1)
                            .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
                            .replace(/\[\[imgsource\]\]/g, element.img);
                    }

                    strBullets += oneBulletStr;
                }
            } else {
                oneBulletTpl = t_store_get_productcard_oneSliderBullet_html(options);
                oneBulletStr = oneBulletTpl
                    .replace('[[activeClass]]', key === 0 ? 't-slds__bullet_active' : '')
                    .replace(/\[\[index\]\]/g, key + 1)
                    .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
                    .replace(/\[\[imgsource\]\]/g, element.img);

                strBullets += oneBulletStr;
            }
        }
    });

    str = str.replace('[[slides]]', strSlides);

    if (hasBullets) {
        str = str.replace('[[bullets]]', strBullets);
    }

    el_popup.find('.js-store-prod-slider').html(str);

    t_store_galleryVideoHandle(recid);

    var controlsSelStr = '.t-slds__arrow_container, .t-slds__bullet_wrapper, .t-slds__thumbsbullet-wrapper';
    if (galleryArr.length === 1) {
        el_popup.find(controlsSelStr).hide();
    } else {
        el_popup.find(controlsSelStr).show();
    }

    if (!window.tzoominited) {
        try {
            t_store_onFuncLoad('t_initZoom', function() {
                t_initZoom();
            });
        } catch (e) {
            console.log(e.message);
        }
    }
    var sliderOptions;

    if (options.sliderthumbsside == 'l') {
        sliderOptions = {
            thumbsbulletGallery: true,
            storeOptions: options,
        };
    }

    t_store_onFuncLoad('t_sldsInit', function() {
        t_sldsInit(recid + ' .js-store-product', sliderOptions);
    });
}

function t_store_galleryVideoHandle(recid) {
    // video in slider
    var el = $('#rec' + recid);
    var play = el.find('.t-slds__play_icon');
    var url;

    play.click(function () {
        if ($(this).attr('data-slider-video-type') == 'youtube.com') {
            url = $(this).attr('data-slider-video-url');

            $(this)
                .next()
                .html(
                    '<iframe class="t-slds__frame" width="100%" height="100%" src="https://www.youtube.com/embed/' +
                        url +
                        '?autoplay=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
                );
        }
        if ($(this).attr('data-slider-video-type') == 'vimeo.com') {
            url = $(this).attr('data-slider-video-url');
            $(this)
                .next()
                .html(
                    '<iframe class="t-slds__frame" width="100%" height="100%" src="https://player.vimeo.com/video/' +
                        url +
                        '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>'
                );
        }
        $(this).next().css('z-index', '3');
    });

    el.on('updateSlider', function () {
        t_store_galleryVideoClearFrame(recid);
    });
}

function t_store_galleryVideoClearFrame(recid) {
    var rec = $('#rec' + recid);
    var frameWrapper = rec.find('.t-slds__frame-wrapper');
    frameWrapper && frameWrapper.html('').css('z-index', '');
}

function t_store_prodPopup_updateGalleryThumbs(recid, el_popup, product, options) {
    var rec = $('#rec' + recid);
    var galleryArr;

    if (!product.gallery) {
        return;
    }
    if (typeof product.gallery === 'string') {
        galleryArr = jQuery.parseJSON(product.gallery);
    } else {
        galleryArr = product.gallery;
    }

    if (galleryArr.length === 0) {
        el_popup.find('.js-store-prod-slider').html('');
        return;
    }

    var columnSizeForMainImage = parseInt(options.popup_opts.columns, 10);
    var galleryImageAspectRatio = +options.slider_slidesOpts.ratio;
    var thumbsSize = 60,
        marginBetweenThumbs = 10;

    var thumbsCount = rec.find('.t-slds__thumbsbullet').length;
    var maxThumbsCount = t_store_prodPopup_gallery_calcMaxThumbsCount(columnSizeForMainImage, galleryImageAspectRatio, thumbsSize, marginBetweenThumbs);
    var strBullets;

    var oneBulletTpl;
    var oneBulletStr;

    if ((thumbsCount !== maxThumbsCount && galleryArr.length >= maxThumbsCount) || (thumbsCount < maxThumbsCount && thumbsCount !== galleryArr.length)) {
        $.each(galleryArr, function (key, image) {
            if (key <= maxThumbsCount - 1) {
                if (key <= maxThumbsCount - 2 || key === galleryArr.length - 1) {
                    oneBulletTpl = t_store_get_productcard_oneSliderBullet_html(options);
                    oneBulletStr = oneBulletTpl
                        .replace('[[activeClass]]', key === 0 ? 't-slds__bullet_active' : '')
                        .replace(/\[\[index\]\]/g, key + 1)
                        .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, image.img))
                        .replace(/\[\[imgsource\]\]/g, image.img);
                } else {
                    oneBulletTpl = t_store_get_productcard_thumbsGallery_html(options, galleryArr.length, maxThumbsCount);
                    oneBulletStr = oneBulletTpl
                        .replace('[[activeClass]]', key === 0 ? 't-slds__bullet_active' : '')
                        .replace(/\[\[index\]\]/g, key + 1)
                        .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, image.img))
                        .replace(/\[\[imgsource\]\]/g, image.img);
                }

                strBullets += oneBulletStr;
            }
        });

        var thumbsWrapper = rec.find('.t-slds__thumbsbullet-wrapper');
        thumbsWrapper.html(strBullets);

        var sliderOptions;

        if (options.sliderthumbsside == 'l') {
            sliderOptions = {
                thumbsbulletGallery: true,
                storeOptions: options,
            };
        }

        t_sldsInit(recid + ' .js-store-product', sliderOptions);
        if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
            t_store_onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
    }
}

function t_store_prodPopup_gallery_calcMaxThumbsCount(columnSize, galleryImageRatio, thumbSize, marginBetweenThumbs) {
    var columnWidth = t_store_getColumnWidth(columnSize);
    var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // hack for popup columns
    if (windowWidth >= 960 && windowWidth <= 1240) {
        columnWidth = 440;
    }

    var mainImageHeightPercent = Math.floor(galleryImageRatio * 100);
    var mainImageHeight = Math.floor((mainImageHeightPercent * (columnWidth - (thumbSize + marginBetweenThumbs))) / 100);
    var maxPreviewsCount = Math.floor(mainImageHeight / (thumbSize + marginBetweenThumbs));

    return maxPreviewsCount;
}

function t_store_get_productcard_slider_html(rec, options) {
    var str = '';

    var animationduration = 't-slds_animated-none';
    var animationspeed = '300';
    if (options.slider_opts.anim_speed === 'fast') {
        animationduration = 't-slds_animated-fast';
    }
    if (options.slider_opts.anim_speed === 'slow') {
        animationduration = 't-slds_animated-slow';
        animationspeed = '500';
    }

    var thumbsbulletsWithGallerClass = '';

    var hasThumbs = options.slider_opts.controls === 'thumbs' || options.slider_opts.controls === 'arrowsthumbs';

    if (hasThumbs && options.sliderthumbsside == 'l') {
        thumbsbulletsWithGallerClass = 't-slds__thumbsbullets-with-gallery';
    }

    str += '<div class="t-slds ' + thumbsbulletsWithGallerClass + '" style="visibility: hidden;">';
    str += '    <div class="t-slds__main">';
    str += '        <div class="t-slds__container" [[containerStyles]]>';
    str +=
        '            <div class="t-slds__items-wrapper ' +
        animationduration +
        ' [[noCycleClass]]" data-slider-transition="' +
        animationspeed +
        '" data-slider-with-cycle="[[isCycled]]" data-slider-correct-height="true" data-auto-correct-mobile-width="false">';
    str += '                [[slides]]';
    str += '            </div>';
    str += '            [[arrows]]';
    str += '        </div>';
    str += '    </div>';
    str += '    [[bullets]]';
    str += '</div>';

    if (options.slider_opts.controls === 'arrows' || options.slider_opts.controls === 'arrowsthumbs' || options.slider_opts.controls === '') {
        var arrowsTplEl = rec.find('.js-store-tpl-slider-arrows');
        var arrowsTpl = arrowsTplEl.html();
        var arrowsWrapperClass = 't-slds__arrow_container ' + (options.slider_opts.cycle === '' ? 't-slds__nocycle' : '');
        arrowsTpl = '<div class="' + arrowsWrapperClass + '">' + arrowsTpl + '</div>';
        str = str.replace('[[arrows]]', arrowsTpl);
    } else {
        str = str.replace('[[arrows]]', '');
    }

    if (options.slider_opts.controls === 'thumbs' || options.slider_opts.controls === 'arrowsthumbs') {
        var tpl =
            '<div class="t-slds__thumbsbullet-wrapper ' + (options.slider_slidesOpts.bgsize === 'contain' ? 't-align_center' : '') + '">[[bullets]]</div>';
        str = str.replace('[[bullets]]', tpl);
    } else if (options.slider_opts.controls === 'dots' || options.slider_opts.controls === '') {
        str = str.replace('[[bullets]]', '<div class="t-slds__bullet_wrapper">[[bullets]]</div>');
    } else {
        str = str.replace('[[bullets]]', '');
    }

    str = str
        .replace('[[containerStyles]]', options.slider_opts.bgcolor ? 'style="background-color:' + options.slider_opts.bgcolor + ';"' : '')
        .replace('[[noCycleClass]]', options.slider_opts.cycle ? '' : 't-slds__nocycle')
        .replace('[[isCycled]]', options.slider_opts.cycle ? 'true' : 'false');

    return str;
}

function t_store_get_productcard_oneSlide_html(options, element) {
    var iconColor = options.slider_opts.videoPlayerIconColor || '#fff';
    var str = '';
    str += '<div class="t-slds__item [[activeClass]]" data-slide-index="[[index]]">';
    str += '    <div class="t-slds__wrapper" itemscope itemtype="http://schema.org/ImageObject">';
    str += '        <meta itemprop="image" content="[[imgsource]]">';
    str += '        <div class="t-slds__imgwrapper [[zoomClass]]" [[zoomAttrs]]>';
    str +=
        '            <div class="t-slds__bgimg [[containClass]] t-bgimg [[productClass]]" data-original="[[imgsource]]" style="padding-bottom:[[paddingBottomVal]]; background-image: url(\'[[imgsource_lazy]]\');">';
    str += '            </div>';
    str += '         </div>';
    if (element.video) {
        // video in slider
        str += '<div class="t-slds__videowrapper">';
        str +=
            '<div class="t-slds__play_icon" data-slider-video-url="' +
            element.videoid +
            '"  data-slider-video-type="' +
            element.vtype +
            '" style="width:70px; height: 70px; ">';
        str += '<svg width="70px" height="70px" viewBox="0 0 60 60">';
        str += '<g stroke="none" stroke-width="1" fill="" fill-rule="evenodd">';
        str += '<g transform="translate(-691.000000, -3514.000000)" fill="' + iconColor + '">';
        str +=
            '<path d="M721,3574 C737.568542,3574 751,3560.56854 751,3544 C751,3527.43146 737.568542,3514 721,3514 C704.431458,3514 691,3527.43146 691,3544 C691,3560.56854 704.431458,3574 721,3574 Z M715,3534 L732,3544.5 L715,3555 L715,3534 Z"></path>';
        str += '</g>';
        str += '</g>';
        str += '</svg>';
        str += '</div>';
        str += '<div class="t-slds__frame-wrapper"></div>';
        str += '</div>';
    }
    str += '    </div>';
    str += '</div>';
    str = str
        .replace(
            '[[zoomAttrs]]',
            options.slider_slidesOpts.zoomable ? 'data-zoom-target="[[index]]" data-zoomable="yes" data-img-zoom-url="[[imgsource]]"' : ''
        )
        .replace('[[zoomClass]]', options.slider_slidesOpts.zoomable ? 't-zoomable' : '')
        .replace('[[containClass]]', options.slider_slidesOpts.bgsize === 'contain' ? 't-slds__bgimg-contain' : '')
        .replace('[[paddingBottomVal]]', options.slider_slidesOpts.ratio * 100 + '%');
    return str;
}

function t_store_get_productcard_oneSliderBullet_html(options) {
    var str = '';

    if (options.slider_opts.controls === 'thumbs' || options.slider_opts.controls === 'arrowsthumbs') {
        str += '<div class="t-slds__thumbsbullet t-slds__bullet [[activeClass]]" data-slide-bullet-for="[[index]]">';
        str +=
            '    <div class="t-slds__bgimg t-bgimg" data-original="[[imgsource]]" style="padding-bottom: 100%; background-image: url(\'[[imgsource_lazy]]\');"></div>';
        str += '    <div class="t-slds__thumbsbullet-border"></div>';
        str += '</div>';
    }
    if (options.slider_opts.controls === 'dots' || options.slider_opts.controls === '') {
        str += '<div class="t-slds__bullet [[activeClass]]" data-slide-bullet-for="[[index]]">';
        str += '    <div class="t-slds__bullet_body" [[styles]]></div>';
        str += '</div>';

        var styles = '';
        if (options.slider_dotsOpts.size) {
            var size = parseInt(options.slider_dotsOpts.size, 10);
            size = size > 20 ? 20 : size;
            styles += 'width:' + size + 'px;height:' + size + 'px;';
        }
        if (options.slider_dotsOpts.bgcolor) {
            styles += 'background-color:' + options.slider_dotsOpts.bgcolor + ';';
        }
        if (options.slider_dotsOpts.bordersize) {
            var borderColor = options.slider_dotsOpts.bgcoloractive ? options.slider_dotsOpts.bgcoloractive : '#222';
            styles += 'border: ' + options.slider_dotsOpts.bordersize + ' solid ' + borderColor + ';';
        }
        str = str.replace('[[styles]]', styles !== '' ? 'style="' + styles + '"' : '');
    }
    return str;
}

function t_store_get_productcard_thumbsGallery_html(options, galleryLength, maxThumbsCount) {
    var str = '';

    var countForGalleryPreview = galleryLength - maxThumbsCount;
    if (options.slider_opts.controls === 'thumbs' || options.slider_opts.controls === 'arrowsthumbs') {
        str +=
            '<div class="t-slds__thumbsbullet t-slds__bullet t-slds__thumbs_gallery [[activeClass]]" [[zoomAttrs]] data-gallery-length=' +
            countForGalleryPreview +
            ' data-slide-bullet-for=' +
            maxThumbsCount +
            '>';
        str +=
            '    <div class="t-slds__bgimg t-bgimg" data-original="[[imgsource]]" style="padding-bottom: 100%; background-image: url(\'[[imgsource_lazy]]\');"></div>';
        str += '    <div class="t-slds__thumbsbullet-border"></div>';
        str += '</div>';

        str = str.replace(
            '[[zoomAttrs]]',
            options.slider_slidesOpts.zoomable ? 'data-zoom-target="[[index]]" data-zoomable="yes" data-img-zoom-url="[[imgsource]]"' : ''
        );
    }

    return str;
}

function t_store_getLazyUrl(opts, imgSrc) {
    /*
    lazyLoad works just in published pages,
    so in redactor and previewmode we do not add smaller images
    */
    if (!opts.isPublishedPage || window.lazy !== 'y') {
        return imgSrc;
    }
    if (imgSrc.indexOf('static.tildacdn.com') === -1) {
        /* we cant apply lazy load to images, hosted to another servers */
        return imgSrc;
    }
    var arr = imgSrc.split('/');
    arr.splice(imgSrc.split('/').length - 1, 0, '-/resizeb/x20');
    var newSrc = arr.join('/');
    return newSrc;
}

function t_store_getLazySrc(opts, imgSrc) {
    /*
    lazyLoad works just in published pages,
    so in redactor and previewmode we do not add smaller images
    */
    if (!opts.isPublishedPage || window.lazy !== 'y') {
        return 'src="' + imgSrc + '"';
    }
    if (
        imgSrc.indexOf('.tildacdn.com') == -1
        || imgSrc.indexOf('-/empty/')>0
        || imgSrc.indexOf('-/resize/')>0
    ) {
        return 'src="' + imgSrc + '" ';
    }
    var arr = imgSrc.split('/');
    arr.splice(imgSrc.split('/').length - 1, 0, '-/empty');
    var newSrc = arr.join('/');
    return 'src="' + newSrc + '" data-original="' + imgSrc + '"';
}

function t_store_dict(msg) {
    var dict = [];

    dict['soldOut'] = {
        EN: 'Out of Stock',
        RU: 'Нет в наличии',
        FR: 'En rupture de stock',
        DE: 'Ausverkauft',
        ES: 'Agotado',
        PT: 'Fora de estoque',
        UK: 'Немає в наявності',
        JA: '在庫切れ',
        ZH: '缺货',
    };

    dict['all'] = {
        EN: 'All',
        RU: 'Все',
        FR: 'Tout',
        DE: 'Alles',
        ES: 'Todos',
        PT: 'Todos',
        UK: 'Всі',
        JA: 'すべて',
        ZH: '所有',
    };

    dict['emptypartmsg'] = {
        EN: 'Nothing found',
        RU: 'Ничего не найдено',
        FR: 'Rien trouvé',
        DE: 'Nichts gefunden',
        ES: 'Nada encontrado',
        PT: 'Nada encontrado',
        UK: 'Нічого не знайдено',
        JA: '何も見つかりませんでした',
        ZH: '什么都没找到',
    };

    dict['seeotherproducts'] = {
        EN: 'See other',
        RU: 'Другие товары',
        FR: 'Autres produits',
        DE: 'Andere Produkte',
        ES: 'Otros productos',
        PT: 'Outros produtos',
        UK: 'інші товари',
        JA: 'その他の商品',
        ZH: '其他产品',
    };

    dict['addtocart'] = {
        EN: 'Buy now',
        RU: 'Купить',
        FR: 'Acheter',
        DE: 'Zu kaufen',
        ES: 'Para comprar',
        PT: 'Comprar',
        UK: 'Купити',
        JA: '購入する',
        ZH: '要买',
    };

    dict['loadmore'] = {
        EN: 'Load more',
        RU: 'Загрузить еще',
        FR: 'Charger plus',
        DE: 'Mehr laden',
        ES: 'Carga más',
        PT: 'Carregue mais',
        UK: 'Завантажити ще',
        JA: 'もっと読み込む',
        ZH: '裝載更多',
    };

    dict['filters'] = {
        EN: 'Filters',
        RU: 'Фильтры',
        FR: 'Filtres',
        DE: 'Filter',
        ES: 'Filtros',
        PT: 'Filtros',
        UK: 'Фільтри',
        JA: 'フィルター',
        ZH: '过滤器',
    };

    dict['searchplaceholder'] = {
        EN: 'Search',
        RU: 'Поиск',
        FR: 'Recherche de produit',
        DE: 'Produktsuche',
        ES: 'Buscar Productos',
        PT: 'Procurar Produtos',
        UK: 'Пошук товарів',
        JA: '商品を探す',
        ZH: '搜索商品',
    };

    dict['sort-label'] = {
        EN: 'Sort',
        RU: 'Сортировка',
        FR: 'Trier',
        DE: 'Sortieren nach',
        ES: 'Ordenar',
        PT: 'Ordenar',
        UK: 'Сортування',
        JA: '並べ替え',
        ZH: '分类',
    };

    dict['sort-default'] = {
        EN: 'Sort: by default',
        RU: 'Порядок: по умолчанию',
        FR: 'Trier: par défaut',
        DE: 'Sortieren nach: Standardmäßig',
        ES: 'Ordenar: por defecto',
        PT: 'Ordenar: por padrão',
        UK: 'Сортування: за замовчуванням',
        JA: '並べ替え：デフォルトで',
        ZH: '分类: 默认',
    };

    dict['sort-price-asc'] = {
        EN: 'Price: Low to High',
        RU: 'Цена: по возрастанию',
        FR: 'Prix: par ordre croissant',
        DE: 'Preis: aufsteigend',
        ES: 'Precio: de más bajo a más alto',
        PT: 'Preço: baixo para alto',
        UK: 'Ціна: спочатку дешеві',
        JA: '価格の安い順番',
        ZH: '价格: 从便宜到贵',
    };

    dict['sort-price-desc'] = {
        EN: 'Price: High to Low',
        RU: 'Цена: по убыванию',
        FR: 'Prix: par ordre décroissant',
        DE: 'Preis: absteigend',
        ES: 'Precio: de más alto a más bajo',
        PT: 'Preço: alto para baixo',
        UK: 'Ціна: спочатку дорогі ',
        JA: '価格の高い順番',
        ZH: '价格: 从贵到便宜',
    };

    dict['sort-name-asc'] = {
        EN: 'Title: A — Z',
        RU: 'Название: А — Я',
        FR: 'Titre: A — Z',
        DE: 'Titel: A — Z',
        ES: 'Título: A — Z',
        PT: 'Título: A — Z',
        UK: 'Назва:  A — Z',
        JA: '製品名：五十音順 ',
        ZH: '商品名称: 字母顺序排列',
    };

    dict['sort-name-desc'] = {
        EN: 'Title: Z — A',
        RU: 'Название: Я — А',
        FR: 'Titre: Z — A',
        DE: 'Titel: Z — A',
        ES: 'Título: Z — A',
        PT: 'Título: Z — A',
        UK: 'Назва: Z — A',
        JA: '製品名：降順',
        ZH: '商品名称: 降序母顺序排列',
    };

    dict['sort-created-desc'] = {
        EN: 'Sort: newest first',
        RU: 'Порядок: сперва новые',
        FR: 'Trier: le plus récent en premier',
        DE: 'Sortieren nach: Neueste zuerst',
        ES: 'Ordenar: más nuevos primero',
        PT: 'Ordenar: mais recente primeiro',
        UK: 'Сортувати: спочатку нові',
        JA: '最新のものから並べ替え',
        ZH: '分类: 最新的',
    };

    dict['sort-created-asc'] = {
        EN: 'Sort: oldest first',
        RU: 'Порядок: сперва старые',
        FR: 'Trier: le plus ancien en premier',
        DE: 'Sortieren nach: Älteste zuerst',
        ES: 'Ordenar: el más antiguo primero',
        PT: 'Ordenar: mais antigo primeiro',
        UK: 'Сортування: спочатку старі',
        JA: '並べ替え：古いものから',
        ZH: '分类: 最早的',
    };

    dict['filter-price-name'] = {
        EN: 'Price',
        RU: 'Цена',
        FR: 'Prix',
        DE: 'Preis',
        ES: 'Precio',
        PT: 'Preço',
        UK: 'Ціна',
        JA: '価格',
        ZH: '价格',
    };

    dict['filter-available-name'] = {
        EN: 'Availability',
        RU: 'Наличие',
        FR: 'Disponibilité',
        DE: 'Verfügbarkeit',
        ES: 'Disponibilidad',
        PT: 'Disponibilidade',
        UK: 'Наявність',
        JA: '可用性',
        ZH: '可用性',
    };

    dict['filter-available-label'] = {
        EN: 'Only in stock',
        RU: 'Только товары в наличии',
        FR: 'Seulement articles en stock',
        DE: 'Nur auf Lager',
        ES: 'Solo artículos en stock',
        PT: 'Apenas itens em estoque',
        UK: 'Тільки товари в наявності',
        JA: '在庫品のみ',
        ZH: '只有货',
    };

    dict['filter-reset'] = {
        EN: 'Clear All',
        RU: 'Очистить все',
        FR: 'Tout effacer',
        DE: 'Alles löschen',
        ES: 'Limpiar todo',
        PT: 'Limpar tudo',
        UK: 'Очистити все',
        JA: 'すべてクリア',
        ZH: '全部清除',
    };

    dict['filter-expand'] = {
        EN: 'Show All',
        RU: 'Показать все',
        FR: 'Afficher tout',
        DE: 'Zeige alles',
        ES: 'Mostrar todo',
        PT: 'Pokaż wszystko',
        UK: 'Показати всі',
        JA: 'すべて表示する',
        ZH: '显示所有',
    };

    dict['filter-collapse'] = {
        EN: 'Collapse',
        RU: 'Свернуть',
        FR: 'Effondrer',
        DE: 'Zusammenbruch',
        ES: 'Colapso',
        PT: 'Zawalić się',
        UK: 'Згорнути',
        JA: '崩壊',
        ZH: '坍方',
    };

    dict['filter-prodsnumber'] = {
        EN: 'Found',
        RU: 'Найдено',
        FR: 'Trouvé',
        DE: 'Gefunden',
        ES: 'Encontrado',
        PT: 'Encontrado',
        UK: 'Знайдено',
        JA: '見つかった',
        ZH: '发现',
    };

    dict['mm'] = {
        EN: 'mm',
        RU: 'мм',
        FR: 'mm',
        DE: 'mm',
        ES: 'mm',
        PT: 'mm',
        UK: 'мм',
        JA: 'mm',
        ZH: 'mm',
    };

    dict['g'] = {
        EN: 'g',
        RU: 'г',
        FR: 'g',
        DE: 'g',
        ES: 'g',
        PT: 'g',
        UK: 'г',
        JA: 'g',
        ZH: 'g',
    };

    dict['PCE'] = {
        EN: 'pc',
        RU: 'шт',     /* штук */
    };

    dict['NMP'] = {
        EN: 'pack',
        RU: 'уп',     /* упаковка */
    };

    dict['MGM'] = {
        EN: 'mg',
        RU: 'мг',     /* миллиграмм */
    };

    dict['GRM'] = {
        EN: 'g',
        RU: 'г',      /* грамм */
    };

    dict['KGM'] = {
        EN: 'kg',
        RU: 'кг',     /* килограмм */
    };

    dict['TNE'] = {
        EN: 't',
        RU: 'т',      /* тонна */
    };

    dict['MLT'] = {
        EN: 'ml',
        RU: 'мл',     /* миллилитр */
    };

    dict['LTR'] = {
        EN: 'l',
        RU: 'л',      /* литр */
    };

    dict['MMT'] = {
        EN: 'mm',
        RU: 'мм',     /* миллиметр */
    };

    dict['CMT'] = {
        EN: 'cm',
        RU: 'см',     /* сантиметр */
    };

    dict['DMT'] = {
        EN: 'dm',
        RU: 'дм',     /* дециметр */
    };

    dict['MTR'] = {
        EN: 'm',
        RU: 'м',      /* метр */
    };

    dict['MTK'] = {
        EN: 'm²',
        RU: 'м²',     /* квадратный метр */
    };

    dict['MTQ'] = {
        EN: 'm³',
        RU: 'м³',     /* кубический метр */
    };

    dict['RMT'] = {
        EN: 'rm',
        RU: 'пог. м', /* погонный метр */
    };

    dict['HAR'] = {
        EN: 'ha',
        RU: 'га',     /* гектар */
    };

    dict['ACR'] = {
        EN: 'acre',
        RU: 'акр',
    };

    dict['product-lwh'] = {
        EN: 'LxWxH',
        RU: 'ДxШxВ',
        FR: 'LxWxH',
        DE: 'LxBxH',
        ES: 'PxLxK',
        PT: 'LxWxH',
        UK: 'ДxШxВ',
        JA: 'LxWxH',
        ZH: 'LxWxH',
    };
    dict['product-wht'] = {
        EN: 'WxHxT',
        RU: 'ШxВxТ',
        FR: 'LxHxÉ',
        DE: 'BxHxD',
        ES: 'LxKxP',
        PT: 'LxAxE',
        UK: 'ШxВxТ',
        JA: 'WxHxT',
        ZH: 'WxHxT',
    };
    dict['product-whd'] = {
        EN: 'WxHxD',
        RU: 'ШxВxГ',
        FR: 'LxHxP',
        DE: 'BxHxT',
        ES: 'LxKxS',
        PT: 'LxAxP',
        UK: 'ШxВxГ',
        JA: 'WxHxD',
        ZH: 'WxHxD',
    };

    dict['product-weight'] = {
        EN: 'Weight',
        RU: 'Вес',
        FR: 'Poids',
        DE: 'Gewicht',
        ES: 'Kaal',
        PT: 'Peso',
        UK: 'Вага',
        JA: '重さ',
        ZH: '機重',
    };

    var lang = window.browserLang;

    if (typeof dict[msg] !== 'undefined') {
        if (typeof dict[msg][lang] !== 'undefined' && dict[msg][lang] != '') {
            return dict[msg][lang];
        } else {
            return dict[msg]['EN'];
        }
    }

    return 'Text not found "' + msg + '"';
}

// eslint-disable-next-line no-unused-vars
function t_store_convertTextToUrlSlug(txt) {
    var str = txt;
    str = str.replace(/^\s+|\s+$/g, ''); /* trim */
    str = str.replace('&lt;', ''); /* remove tags */
    str = str.toLowerCase();
    str = t_store_transliterate(str); /* transliterate cyrillic symbols */
    str = str.replace(/[^a-z0-9 -]/g, ''); /* remove invalid chars */
    str = str.replace(/\s+/g, '-'); /* collapse whitespace and replace by - */
    str = str.replace(/-+/g, '-'); /* collapse dashes */
    /* workaround for Chineese and other non-latin languages */
    if (str.length === 0 || !str.match(/[a-z]/i)) {
        str = txt;
        str = str.replace(/\s+/g, '-'); /* collapse whitespace and replace by - */
        str = str.replace('&lt;', ''); /* remove tags */
    }
    /* workaround for long titles */
    if (str.length > 40) {
        str = str.slice(0, 40);
        if (str[str.length - 1] === '-') {
            str = str.substring(0, str.length - 1);
        }
    }
    return str;
}

function t_store_transliterate(word) {
    var a = {
        Ё: 'YO',
        Й: 'I',
        Ц: 'TS',
        У: 'U',
        К: 'K',
        Е: 'E',
        Н: 'N',
        Г: 'G',
        Ш: 'SH',
        Щ: 'SCH',
        З: 'Z',
        Х: 'H',
        Ъ: "'",
        ё: 'yo',
        й: 'i',
        ц: 'ts',
        у: 'u',
        к: 'k',
        е: 'e',
        н: 'n',
        г: 'g',
        ш: 'sh',
        щ: 'sch',
        з: 'z',
        х: 'h',
        ъ: "'",
        Ф: 'F',
        Ы: 'I',
        В: 'V',
        А: 'a',
        П: 'P',
        Р: 'R',
        О: 'O',
        Л: 'L',
        Д: 'D',
        Ж: 'ZH',
        Э: 'E',
        ф: 'f',
        ы: 'i',
        в: 'v',
        а: 'a',
        п: 'p',
        р: 'r',
        о: 'o',
        л: 'l',
        д: 'd',
        ж: 'zh',
        э: 'e',
        Я: 'Ya',
        Ч: 'CH',
        С: 'S',
        М: 'M',
        И: 'I',
        Т: 'T',
        Ь: "'",
        Б: 'B',
        Ю: 'YU',
        я: 'ya',
        ч: 'ch',
        с: 's',
        м: 'm',
        и: 'i',
        т: 't',
        ь: "'",
        б: 'b',
        ю: 'yu',
    };
    return $.map(word.split(''), function (char) {
        return a[char] || char;
    }).join('');
}

function t_store_escapeQuote(text) {
    if (!text) {
        return '';
    }
    var map = {
        '"': '&quot;',
        "'": '&#039;',
    };

    return text.replace(/["']/g, function (m) {
        return map[m];
    });
}

function t_store_product_initEditions(recid, product, el_product, options) {
    var optionsWrapper = el_product.find('.js-product-controls-wrapper');

    t_store_product_addEditionControls(product, optionsWrapper, options, recid);
    var hasAvailable = t_store_product_selectAvailableEdition(recid, product, el_product, options);
    if (hasAvailable) {
        t_store_product_triggerSoldOutMsg(el_product, false, options);
        t_store_product_disableUnavailOpts(el_product, product);
    } else {
        t_store_product_triggerSoldOutMsg(el_product, true, options);
    }

    el_product.find('.js-product-edition-option').on('change', function () {
        var edition = t_store_product_detectEditionByControls(el_product, product);

        if (edition) {
            t_store_product_updateEdition(recid, el_product, edition, product, options);
            /* apply additional options to price by func from tilda-products-1.0.js */
            t_prod__updatePrice(recid, el_product);

            var isSoldOut = parseInt(edition.quantity, 10) <= 0;
            t_store_product_triggerSoldOutMsg(el_product, isSoldOut, options);

            /* update quantity buttons & input */
            t_store_addProductQuantity(recid, el_product, edition, options);

        } else {
            var el_changedOpt = $(this);
            var changedOptName = el_changedOpt.attr('data-edition-option-id');
            /* get values of all selectboxes before the changed one */
            var optsValsBeforeChangedArr = [];
            for (var i = 0; i < product.editionOptions.length; i++) {
                var curOption = product.editionOptions[i];
                optsValsBeforeChangedArr.push(curOption);
                if (curOption.name === changedOptName) {
                    break;
                }
            }
            /* need to find edition, which contain values from the selectboxes placed before the changed one and change selectboxes, which are placed after it */
            var hasAvailable = t_store_product_selectAvailableEdition(recid, product, el_product, options, optsValsBeforeChangedArr);
            /* apply additional options to price by func from tilda-products-1.0.js */
            t_prod__updatePrice(recid, el_product);
            t_store_product_triggerSoldOutMsg(el_product, !hasAvailable, options);

            /* update quantity buttons & input */
            t_store_addProductQuantity(recid, el_product, product, options);
        }

        el_product.find('.js-product-edition-option-variants option').removeAttr('disabled');
        t_store_product_disableUnavailOpts(el_product, product);
    });
}

function t_store_product_detectEditionByControls(el_product, product) {
    /* iterate via all product editions to find the selected one */
    for (var i = 0; i < product.editions.length; i++) {
        var curEdition = product.editions[i];
        /* suppose that current edition is selected */
        var isCurEditionSelected = true;
        /* check match of all options values */
        for (var j = 0; j < product.editionOptions.length; j++) {
            var curOption = product.editionOptions[j];
            var el_select = t_store_product_getEditionSelectEl(el_product, curOption);
            var curControlVal = el_select.find('.js-product-edition-option-variants').val();
            var curEditionVal = curEdition[curOption.name];
            if (curControlVal !== curEditionVal) {
                isCurEditionSelected = false;
            }
        }
        /* return current edition object, if all options values match the values from controls */
        if (isCurEditionSelected) {
            return curEdition;
        }
    }
    return null;
}

function t_store_product_addEditionControls(product, optionsWrapper, options, recid) {
    var optionsData = t_store_option_getOptionsData();
    var firstAvailabeEdition = t_store_product_getFirstAvailableEditionData(product.editions);

    if (!product.editionOptions) {
        product.editionOptions = t_store_product_getEditionOptionsArr(product, optionsData);
    }

    product.editionOptions.forEach(function (curOption) {
        t_store_product_addOneOptionsControl('editionopt', curOption, optionsWrapper, options, firstAvailabeEdition, recid);
    });
}

function t_store_product_selectAvailableEdition(recid, product, el_product, opts, optsValsBeforeChangedArr) {
    var edition =
        optsValsBeforeChangedArr && optsValsBeforeChangedArr.length > 0
            ? t_store_product_getFirstAvailableEditionData_forCertainVals(product.editions, optsValsBeforeChangedArr, el_product)
            : t_store_product_getFirstAvailableEditionData(product.editions);

    if (!edition) {
        console.log('No available edition for uid = ' + product.uid + ' with selected options values');
        return false;
    }

    var isAvailable = parseInt(edition.quantity, 10) !== 0;

    /* change controls */
    product.editionOptions.forEach(function (curOption) {
        var value = edition[curOption.name];
        var el_select = t_store_product_getEditionSelectEl(el_product, curOption);

        el_select.find('.js-product-edition-option-variants').val(value);
    });

    t_store_product_updateEdition(recid, el_product, edition, product, opts);
    return isAvailable;
}

function t_store_product_disableUnavailOpts(el_product, product) {
    /* iterate via all edition controls, except the first one */
    for (var i = 1; i < product.editionOptions.length; i++) {
        var curOpt = product.editionOptions[i];
        var el_curOpt = t_store_product_getEditionSelectEl(el_product, curOpt);
        /* get previous control value */
        var prevOpt = product.editionOptions[i - 1];
        var el_prevOpt = t_store_product_getEditionSelectEl(el_product, prevOpt);
        var prevVal = el_prevOpt.find('.js-product-edition-option-variants').val() || '';
        /* disable current control values,
        which doesnt have a common edition with previous control value */
        curOpt.values.forEach(function (curOptVal) {
            var hasEdition = t_store_product_disableUnavailOpts_checkEdtn(product, curOpt, curOptVal, prevOpt, prevVal);

            var el_optionTag = el_curOpt.find('option[value="' + curOptVal + '"]');
            var el_custom_input = el_product.find('.t-product__option-input[value="' + curOptVal + '"]');

            if (hasEdition) {
                el_optionTag.removeAttr('disabled');

                if (el_custom_input.length) {
                    var el_parent = el_custom_input.closest('.t-product__option-item');
                    el_parent.removeClass('t-product__option-item_disabled');
                }
            } else {
                el_optionTag.attr('disabled', 'disabled');

                if (el_custom_input.length) {
                    var el_parent = el_custom_input.closest('.t-product__option-item');
                    el_parent.addClass('t-product__option-item_disabled');
                    el_parent.removeClass('t-product__option-item_active');
                }
            }
        });
    }
}

function t_store_product_updateEdition(recid, el_product, edition, product, opts) {
    /* change price */

    var urlSearch = window.location.search !== '' ? window.location.search.split('=')[1] : '';
    if (urlSearch === edition.uid) {
        $('.js-store-product').attr('data-product-lid', edition.uid);
        $('.js-store-product').attr('data-product-uid', edition.uid);
        $('.js-store-product').attr('data-product-url', window.location);
        t_store_product_updateEdition_moveSlider(recid, el_product, edition);
        $('.js-store-product').attr('data-product-img', edition.img);
    }

    if (edition.price && parseFloat(edition.price) !== 0) {
        var formattedPrice = t_store__getFormattedPrice(edition.price);
        el_product.find('.js-store-prod-price').show();
        el_product.find('.js-store-prod-price-val').html(formattedPrice);

        t_store_onFuncLoad('t_prod__cleanPrice', function() {
            var cleanPrice = t_prod__cleanPrice(edition.price);
            el_product.find('.js-product-price').attr('data-product-price-def', cleanPrice);
            el_product.find('.js-product-price').attr('data-product-price-def-str', cleanPrice);
            el_product.find('.js-product-price').attr('data-product-price-def-str', cleanPrice);
        });


        el_product.find('.t-store__prod__price-portion').remove();
        if (product.portion > 0) {
            var str = '<div class="t-store__prod__price-portion">/';
            if (product.portion !== '1') {
                str +=  + product.portion + ' ';
            }
            str += t_store_dict(product.unit) + '</div>';
            el_product.find('.t-store__card__price-currency + .js-product-price, .js-product-price + .t-store__card__price-currency').after(str);
        }
    } else {
        el_product.find('.js-store-prod-price').hide();
        el_product.find('.js-store-prod-price-val').html('');
        el_product.find('.js-product-price').attr('data-product-price-def', '');
        el_product.find('.js-product-price').attr('data-product-price-def-str', '');
        el_product.find('.t-store__prod__price-portion').remove();
    }

    /* change old price */
    if (edition.priceold && edition.priceold !== '0') {
        var formattedPriceOld = t_store__getFormattedPrice(edition.priceold);
        el_product.find('.js-store-prod-price-old').show();
        el_product.find('.t-store__card__price_old').show();
        el_product.find('.js-store-prod-price-old-val').html(formattedPriceOld);
    } else {
        el_product.find('.js-store-prod-price-old').hide();
        el_product.find('.t-store__card__price_old').hide();
        el_product.find('.js-store-prod-price-old-val').html('');
    }

    /* add product brand */
    var el_brandWrapper = el_product.find('.t-store__prod-popup__brand');
    if (product.brand && product.brand > '') {
        if (el_brandWrapper.find('span[itemprop=brand]').length == 1) {
            el_brandWrapper.find('span[itemprop=brand]').html(product.brand);
        } else {
            el_brandWrapper.html('<span itemprop="brand" class="js-product-brand">'+product.brand+'</span>');
        }
    }

    /* hide empty product's brand */
    if (! product.brand) {
        el_brandWrapper.hide();
    }

    /* change SKU */
    var el_skuWrapper = el_product.find('.t-store__prod-popup__sku');
    var el_sku = el_product.find('.js-store-prod-sku');
    if (edition.sku) {
        el_sku.html(edition.sku);
        if (el_product.data('cardSize') === 'large') {
            el_sku.show();
            el_skuWrapper.show();
        }
    } else {
        el_sku.html('').hide();
        el_skuWrapper.hide();
    }

    /* change quantity */
    el_product.attr('data-product-inv', edition.quantity);

    /* change UID */
    el_product.attr('data-product-lid', edition.uid).attr('data-product-uid', edition.uid);

    /* change pack and weight */
    try {
        var defpackobj = el_product.data('def-pack-obj');

        if (edition.pack_x && edition.pack_y && edition.pack_z) {
            if (!defpackobj) {
                defpackobj = {
                    pack_x: el_product.attr('data-product-pack-x') || 0,
                    pack_y: el_product.attr('data-product-pack-y') || 0,
                    pack_z: el_product.attr('data-product-pack-z') || 0,
                    pack_label: el_product.attr('data-product-pack-label') || product.pack_label || 'lwh',
                    pack_m: el_product.attr('data-product-pack-m') || 0,
                };
                el_product.data('def-pack-obj', defpackobj);
            }

            el_product
                .attr('data-product-pack-x', edition.pack_x)
                .attr('data-product-pack-y', edition.pack_y)
                .attr('data-product-pack-z', edition.pack_z)
                .attr('data-product-pack-label', defpackobj.pack_label);

            var dimmension = '';
            dimmension += edition.pack_x + 'x' + edition.pack_y + 'x' + edition.pack_z;
            if (el_product.find('.js-store-prod-dimensions').length==0) {
                el_product.find('.js-store-prod-pack-' + defpackobj.pack_label).html(t_store_dict('product-' + defpackobj.pack_label) + ': ' + dimmension + '&nbsp;' + t_store_dict('mm'));
            } else {
                el_product.find('.js-store-prod-dimensions').html(t_store_dict('product-'+defpackobj.pack_label) + ': ' + dimmension + '&nbsp;'+t_store_dict('mm'));
            }
        } else if (defpackobj && defpackobj.pack_x) {
            el_product
                .attr('data-product-pack-x', defpackobj.pack_x)
                .attr('data-product-pack-y', defpackobj.pack_y)
                .attr('data-product-pack-z', defpackobj.pack_z)
                .attr('data-product-pack-label', defpackobj.pack_label);

            var dimmension = '';
            dimmension += defpackobj.pack_x + 'x' + defpackobj.pack_y + 'x' + defpackobj.pack_z;
            if (el_product.find('.js-store-prod-dimensions').length==0) {
                el_product.find('.js-store-prod-pack-' + defpackobj.pack_label).html(t_store_dict('product-'+defpackobj.pack_label) + ': ' + dimmension + '&nbsp;' +t_store_dict('mm'));
            } else {
                el_product.find('.js-store-prod-dimensions').html(t_store_dict('product-'+defpackobj.pack_label) + ': ' + dimmension + '&nbsp;' +t_store_dict('mm'));
            }
        }

        if (edition.pack_m) {
            el_product.attr('data-product-pack-m', edition.pack_m);
            el_product.find('.js-store-prod-weight').html(t_store_dict('product-weight') + ': ' + edition.pack_m + '&nbsp;' +t_store_dict('g'));
        } else if (defpackobj && parseFloat(defpackobj.pack_m) > 0) {
            el_product.attr('data-product-pack-m', defpackobj.pack_m);
            el_product.find('.js-store-prod-weight').html(t_store_dict('product-weight') + ': '+defpackobj.pack_m + '&nbsp;' +t_store_dict('g'));
        }
    } catch(e) {
        console.log(e);
    }

    /* change edition img */
    if (edition.img) {
        el_product.attr('data-product-img', edition.img);

        /* move slider */
        if (el_product.data('cardSize') === 'large') {
            t_store_product_updateEdition_moveSlider(recid, el_product, edition);
        } else {
            /* If there is a product tile with no slider, update title image ? */
            /* TODO: Fix lazy load url and uncomment then */

            // var el_image = el_product.find('.js-product-img');
            // var lazyUrl = t_store_getLazyUrl(opts, edition.img);

            // if (el_image.length) {
            //     el_image.attr('data-original', edition.img);
            //     el_image.css('background-image', 'url(' + lazyUrl + ')');

            //     if (window.lazy === 'y') {
            //         if (window.lazy == 'y') {
            //             t_lazyload_update();
            //         }
            //     }
            // }
        }
    } else {
        /* move slider to default image, if previus edition had cutomized image (and filled attribute data-product-img) */
        var prevEditionImgUrl = el_product.attr('data-product-img');
        if (typeof prevEditionImgUrl !== 'undefined' && prevEditionImgUrl !== '' && el_product.data('cardSize') === 'large') {
            t_store_product_updateEdition_moveSlider(recid, el_product, edition);
            el_product.attr('data-product-img', '');
        }
    }

    if (product.portion > 0) {
        /* unit */
        el_product.attr('data-product-unit', product.unit);

        /* portion */
        el_product.attr('data-product-portion', product.portion);

        /* single */
        el_product.attr('data-product-single', product.single);
    }
}

function t_store_product_updateEdition_moveSlider(recid, el_product, edition) {
    if (el_product.find('.t-slds').length === 0) {
        return;
    }

    if (edition.img.indexOf('&amp;') !== -1) {
        edition.img = edition.img.replace('&amp;', '&');
    }
    var sliderWrapper = el_product.find('.t-slds__items-wrapper');
    var el_editionImg = el_product.find('.t-slds__item .t-slds__bgimg[data-original="' + edition.img + '"]');
    /* detect position of image inside slider */
    if (edition.img) {
        var pos = $(el_editionImg[0]).parents('.t-slds__item').attr('data-slide-index');
        if (parseInt(pos, 10) === 0) {
            pos = sliderWrapper.attr('data-slider-totalslides');
        }
    } else {
        pos = 1;
    }

    /* move slider without animation */
    sliderWrapper.attr('data-slider-pos', pos);
    t_store_onFuncLoad('t_slideMoveInstantly', function() {
        t_slideMoveInstantly(recid + ' .js-store-product');
    });
}

function t_store_product_triggerSoldOutMsg(el_product, isSoldOut, opts) {
    el_product.find('.js-store-prod-sold-out').remove();
    var el_buyBtn = el_product.find('[href="#order"]');
    var soldOutMsg;

    if (el_product.data('cardSize') === 'large') {
        var el_buyBtnTxt = el_buyBtn.find('.js-store-prod-popup-buy-btn-txt');
        if (el_buyBtnTxt.length === 0) {
            el_buyBtnTxt = el_buyBtn.find('.js-store-prod-buy-btn-txt');
        }

        if (isSoldOut) {
            soldOutMsg = t_store_get_soldOutMsg_html();
            el_product.find('.js-store-price-wrapper').append(soldOutMsg);
            el_buyBtn.addClass('t-store__prod-popup__btn_disabled');
            el_buyBtnTxt.text(t_store_dict('soldOut'));
        } else {
            el_buyBtn.removeClass('t-store__prod-popup__btn_disabled');
            var btnTitle = opts.buyBtnTitle || (opts.popup_opts && opts.popup_opts.btnTitle) || t_store_dict('addtocart');
            el_buyBtnTxt.text(btnTitle);
        }
    } else if (el_product.data('cardSize') === 'small') {
        if (isSoldOut) {
            soldOutMsg = t_store_get_soldOutMsg_html();
            el_product.find('.js-store-price-wrapper').append(soldOutMsg);
            if (el_buyBtn.length > 1) {
                el_buyBtn.not(':first').hide();
            } else {
                el_buyBtn.hide();
            }
        } else {
            el_buyBtn.show();
        }
    }
}

function t_store_product_addOneOptionsControl(type, curOption, optionsWrapper, options, firstAvailabeEdition, recid) {
    if (curOption.name) {
        var str;
        var tplOneOptionTag;
        var tplSelect;
        var optionsTags = '';

        if (type === 'modificator') {
            if (typeof curOption.values === 'undefined') {
                return;
            }

            /* product modificator */
            /* generate options tags for select */
            tplOneOptionTag = '<option value="[[value]]" data-product-variant-price="[[price]]">[[text]]</option>';
            var valuesArr = curOption.values.split('\n');

            $.each(valuesArr, function (key, value) {
                var valueText = value.split('=')[0];
                var valuePrice = value.split('=')[1];
                optionsTags += tplOneOptionTag
                    .replace(/\[\[value\]\]/g, t_store_escapeQuote(valueText).replace(/&amp;/g, '&amp;amp;'))
                    .replace(/\[\[text\]\]/g, t_store_escapeQuote(valueText))
                    .replace(/\[\[price\]\]/g, valuePrice ? valuePrice : '');
            });

            tplSelect = t_store_get_control_option_html(options);
            str = tplSelect.replace(/\[\[name\]\]/g, curOption.name).replace(/\[\[optiontags\]\]/g, optionsTags);
        } else {
            /* edition option */
            /* generate options tags for select */

            tplOneOptionTag = '<option value="[[value]]">[[text]]</option>';
            $.each(curOption.values, function (key, value) {
                if (value !== '') {
                    optionsTags += tplOneOptionTag
                        .replace(/\[\[value\]\]/g, t_store_escapeQuote(value).replace(/&amp;/g, '&amp;amp;'))
                        .replace(/\[\[text\]\]/g, t_store_escapeQuote(value));
                }
            });

            if (optionsTags!=='') {
                tplSelect = t_store_get_control_editionOption_html(options, curOption);
                str = tplSelect
                    .replace(/\[\[id\]\]/g, curOption.id.replace(/&amp;/g, '&amp;amp;'))
                    .replace(/\[\[name\]\]/g, curOption.name)
                    .replace(/\[\[optiontags\]\]/g, optionsTags);
            }
        }
        /* add select to controls optionsWrapper */
        optionsWrapper.append(str);

        /* Add styled custom select into the DOM */
        var isCustomOption = t_store_option_checkIfCustom(curOption);
        if (isCustomOption) {
            t_store_option_styleCustomControl(recid, options, curOption, optionsWrapper, firstAvailabeEdition);
        }

        /* return a link to edition option control element */
        if (type === 'editionopt') {
            return optionsWrapper.find('.js-product-edition-option').last();
        }
    }
}

function t_store_product_getEditionOptionsArr(product, optionsData) {
    var editions = product.editions;
    var defaultProps = ['quantity', 'price', 'priceold', 'gallery', 'sku', 'uid', 'img', 'externalid', 'pack_x', 'pack_y', 'pack_z', 'pack_m'];
    var allProps = Object.keys(editions[0]);
    var editionOptions = [];

    allProps.forEach(function (p) {
        if (defaultProps.indexOf(p) === -1) {
            var propEl = {
                name: p,
                id: t_store_combineOptionIdByName(p),
                params: t_store_product_getEditionOptionsArr_getParams(p, product, optionsData),
                values: t_store_product_getEditionOptionsArr_getValues(p, editions),
                /* Store all option images for proper render later */
                imagesObj: t_store_product_getEditionOptionsArr_getImgValues(p, editions),
                valuesObj: optionsData && optionsData[p] ? optionsData[p].values : {}
            };

            editionOptions.push(propEl);
        }
    });

    return editionOptions;
}

function t_store_product_getFirstAvailableEditionData(editions) {
    /* iterate editions and return first available */
    for (var i = 0; i < editions.length; i++) {
        var curEdition = editions[i];
        if (parseInt(curEdition.quantity, 10) !== 0) {
            return curEdition;
        }
    }
    return editions[0];
}

function t_store_product_getFirstAvailableEditionData_forCertainVals(editions, optsValsBeforeChangedArr, el_product) {
    var firstUnavailable = '';
    /* iterate editions and return first available with chosen options */
    for (var i = 0; i < editions.length; i++) {
        var curEdition = editions[i];
        var doesContainSelectedOpts = true;

        /* check if edition contain checked options */
        for (var j = 0; j < optsValsBeforeChangedArr.length; j++) {
            var optName = optsValsBeforeChangedArr[j].name;
            var optVal = t_store_product_getCurEditionOptValByName(el_product, optName);
            if (curEdition[optName] !== optVal) {
                doesContainSelectedOpts = false;
                break;
            }
        }

        if (doesContainSelectedOpts) {
            if (parseInt(curEdition.quantity, 10) !== 0) {
                return curEdition;
            } else if (!firstUnavailable) {
                firstUnavailable = curEdition;
            }
        }
    }
    return firstUnavailable;
}

// eslint-disable-next-line no-unused-vars
function t_store_product_disableUnavailOpts_getValsComb(el_product, product, checkingOptName, checkingOptVal) {
    var combination = {};
    for (var i = 0; i < product.editionOptions.length; i++) {
        var curOption = product.editionOptions[i];
        var el_select = t_store_product_getEditionSelectEl(el_product, curOption);
        var controlVal = el_select.find('.js-product-edition-option-variants').val();
        combination[curOption.name] = curOption.name === checkingOptName ? checkingOptVal : controlVal;
    }
    return combination;
}

function t_store_product_disableUnavailOpts_checkEdtn(product, curOpt, curOptVal, prevOpt, prevVal) {
    var hasEdition = false;
    /* check, if we have edition, which has both values: previous and the checking one */
    for (var i = 0; i < product.editions.length; i++) {
        var edition = product.editions[i];
        if (edition[prevOpt.name] === prevVal && edition[curOpt.name] === curOptVal) {
            hasEdition = true;
            break;
        }
    }
    return hasEdition;
}

function t_store_product_getEditionOptionsArr_getValues(prop, editions) {
    var values = [];

    /* iterate all editions and collect unique property values */
    editions.forEach(function (curEdition) {
        var val = curEdition[prop];
        if (values.indexOf(val) === -1) {
            values.push(val);
        }
    });
    return values;
}

function t_store_product_getEditionOptionsArr_getParams(p, product, optionsData) {
    var params = {};

    if (optionsData) {
        /* Store current option parametrs and all option values in current option. Use it to style custom UI later */
        params = optionsData[p] ? optionsData[p].params : {};
    } else {
        var json_options = JSON.parse(product.json_options);
        if (json_options) {
            json_options.forEach(function(optionObj) {
                if (optionObj.params && optionObj.title && optionObj.title === p) {
                    params = optionObj.params;
                }
            });
        }
    }

    return params;
}

function t_store_product_getEditionOptionsArr_getImgValues(prop, editions) {
    var values = {};

    editions.forEach(function (curEdition) {
        var val = curEdition[prop];
        values[val] = curEdition.img;
    });

    return values;
}

function t_store_product_getCurEditionOptValByName(el_product, id) {
    var el_optionsWrap = el_product.find('.js-product-edition-option[data-edition-option-id="' + id + '"]');
    return el_optionsWrap.find('.js-product-edition-option-variants').val() || '';
}

function t_store_product_getEditionSelectEl(wrapper, curOption) {
    return wrapper.find('.js-product-edition-option[data-edition-option-id="' + curOption.id + '"]');
}

function t_store_combineOptionIdByName(text) {
    // eslint-disable-next-line no-useless-escape
    return text.replace(/[\/\\'"<>{}]/g, '');
}

function t_store_getProductFirstImg(product) {
    if (product.gallery && product.gallery[0] === '[') {
        var galleryArr = jQuery.parseJSON(product.gallery);
        if (galleryArr[0] && galleryArr[0].img) {
            return galleryArr[0].img;
        }
    }
    return '';
}

function t_store__getFormattedPrice(price) {
    if (typeof price == 'undefined' || price == 0 || price == '') {
        return '';
    }
    t_store_onFuncLoad('t_prod__cleanPrice', function() {
        price = t_prod__cleanPrice(price);
        price = price.toString();
    });
    var showDecPart = typeof window.tcart != 'undefined' && typeof window.tcart['currency_dec'] != 'undefined' && window.tcart['currency_dec'] == '00';
    var hasDefinedSeparator = typeof window.tcart != 'undefined' && typeof window.tcart['currency_sep'] != 'undefined' && window.tcart['currency_sep'] == '.';

    /* always show decimial part, if it was defined in settings */
    if (showDecPart) {
        if (price.indexOf('.') === -1 && price.indexOf(',') === -1) {
            price = price + '.00';
        } else {
            var foo = price.substr(price.indexOf('.') + 1);
            if (foo.length === 1) {
                price = price + '0';
            }
        }
    }

    /* show correct decimial separator */
    if (hasDefinedSeparator) {
        price = price.replace(',', '.');
    } else {
        price = price.replace('.', ',');
    }

    /* divide thousands with spaces */
    price = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return price;
}

function t_store_filters_init(recid, opts, data) {
    if (!data.sort && !data.search && (!data.filters || data.filters.length === 0)) {
        return;
    }
    var el_rec = $('#rec' + recid);
    if (el_rec.find('.js-store-filter').length > 0) {
        return;
    }
    /* draw html */
    t_store_filters_drawControls(recid, opts, data);
    /* show controls in absolute positioned box after click on title */
    t_store_filters_showHideFilterControls(recid, el_rec);
    /* send data on contrsol change */
    t_store_filters_handleOnChange(recid, opts);
}

function t_store_filters_showHideFilterControls(recid, el_rec) {
    $(window).on('click', function (e) {
        var el_title = '';
        var clickedOnTitle =
            ($(e.target).hasClass('js-store-filter-item-title') || $(e.target).parents('js-store-filter-item-title').length > 0) &&
            $(e.target).parents('#rec' + recid).length > 0;
        var clickedInsideWrapper =
            $(e.target).hasClass('js-store-filter-item-controls-wr') || $(e.target).parents('.js-store-filter-item-controls-wr').length > 0;

        if (clickedOnTitle) {
            /* catch click on title */
            el_title = $(e.target);
        } else if (clickedInsideWrapper) {
            /* catch click on controls wrapper */
            return;
        } else {
            /* catch click outside */
            el_rec.find('.js-store-filter-item').removeClass('active');
            return;
        }

        /* show or hide controls wrapper */
        var el_item = el_title.parents('.js-store-filter-item');
        var el_controlsWrap = el_item.find('.js-store-filter-item-controls-wr');
        if (el_item.hasClass('active')) {
            el_item.removeClass('active');
        } else {
            $('.js-store-filter-item').removeClass('active');
            el_item.addClass('active');
            if (el_controlsWrap.offset().left < 10) {
                el_controlsWrap.addClass('t-store__filter__item-controls-wrap_left');
            } else if (el_controlsWrap.offset().right < 0) {
                console.log('controlsWrap offset right < 0');
            }
        }
    });
}

function t_store_filters_drawControls(recid, opts, data) {
    t_store_filters_cashSortOptsInData(data);
    /* draw search, sort and filters */
    var str = '';
    var searchSortStr = '';

    searchSortStr += '<div class="t-store__filter__search-and-sort">';
    if (data.search) {
        searchSortStr += t_store_filters_drawControls_getSearchHtml();
    }
    if (data.sort) {
        searchSortStr += t_store_filters_drawControls_getSortHtml(data);
    }
    searchSortStr += '</div>';

    var filterClass = 't-store__filter js-store-filter';
    filterClass += opts.isHorizOnMob ? ' t-store__filter_horiz-on-mobile' : '';
    str += '<div class="' + filterClass + '">';
    str += '    <div class="t-store__filter__controls-wrapper">';
    str += '        ' + t_store_filters_mobileBtns_getHtml(recid, data);
    str += '        ' + t_store_filters_opts_getHtml(recid, data, opts);

    if (!opts.sidebar || $(window).width() < 960) {
        str += searchSortStr;
    } else {
        // Attach search and sort to t951 (block with sidebar) if any
        var el_rec = $('#rec' + recid);
        var el_sidebarBlock = el_rec.find('.t951__cont-w-filter');
        if (el_sidebarBlock) {
            el_sidebarBlock.prepend(searchSortStr);
        }
    }

    str += '    </div>';
    str += '    <div class="t-store__filter__chosen-bar" style="display: none;">';
    str += '    ' + t_store_filters_opts_chosenVals_getHtml();
    str += '    ' + t_store_filters_prodsNumber_getHtml();
    str += '    </div>';
    str += '</div>';

    var el_rec = $('#rec' + recid);
    var el_filterWrapper = el_rec.find('.js-store-parts-select-container');
    el_rec.find('.js-store-filter').remove();

    if (opts.sidebar) {
        el_filterWrapper.find('.t951__sidebar-wrapper').append(str);
    } else {
        el_filterWrapper.append(str);
    }

    el_rec.trigger('controlsDrawn');
    /* workaround for controls with possibility to chech several values - save data in hidden input as array*/
    t_store_filters_opts_checkboxes_groupCheckedToHiddenInput(recid);
    /* we use customized select, so need to keep value in hidden value */
    t_store_filters_opts_customSelect_saveToHiddenInput(recid);
    /* init ui btns on mobile */
    t_store_filters_initUIBtnsOnMobile(el_rec);
    /* init reset button */
    t_store_filters_initResetBtn(recid, opts);
    /* init expand buttons */
    t_store_filters_initExpandBtn(recid, opts);
}

function t_store_filters_initResetBtn(recid, opts) {
    var el_rec = $('#rec' + recid);
    el_rec.find('.js-store-filter-reset').on('click', function () {
        /* clear all filters fields */
        el_rec.find('.js-store-filter-search, .js-store-filter-sort, .js-store-filter-opt').val('');
        /* reset all parts; that's because our parts and filter parts are the same stuff (legacy stuff) */
        el_rec.find('.js-store-parts-switcher.t-active').removeClass('t-active');
        el_rec.find('.js-store-parts-switcher.t-store__parts-switch-btn-all').addClass('t-active');
        /* price fields — to default values */
        /* min */
        var el_min = el_rec.find('.js-store-filter-pricemin');
        var minPrice = t_store__getFormattedPrice(el_min.attr('data-min-val'));
        el_min.val(minPrice);
        /* max */
        var el_max = el_rec.find('.js-store-filter-pricemax');
        var maxPrice = t_store__getFormattedPrice(el_max.attr('data-max-val'));
        el_max.val(maxPrice);
        /* checkboxes */
        el_rec.find('.js-store-filter-onlyavail, .js-store-filter-opt-chb').prop('checked', false);
        /* change custom controls view */
        el_rec.find('.js-store-filter-custom-select').removeClass('active');
        el_rec.find('.t-store__filter__checkbox').removeClass('active');
        /* reset controls previous values */
        el_min.data('previousMin', minPrice);
        el_max.data('previousMax', maxPrice);
        el_rec.find('.t-store__filter__item_select .js-store-filter-opt').data('previousVal', '');
        el_rec.find('.t-store__filter__chosen-bar').hide();
        /* send data */

        var el_min_range = el_rec.find('.t-store__filter__range_min');
        var el_max_range = el_rec.find('.t-store__filter__range_max');
        if (opts.sidebar && el_min_range.length && el_max_range.length) {
            // Filters will be updated in the following function call
            t_store_filters_updatePriceRange(el_rec);
        } else {
            t_store_filters_send(recid, opts);
        }

        if (opts.sidebar) {
            t_store_filters_opts_sort(opts, recid);
            t_store_filters_scrollStickyBar(el_rec);
        }

        el_rec.find('.js-store-filter-chosen-item').remove();
        el_rec.find('.js-store-filter-reset').removeClass('t-store__filter__reset_visible');
        el_rec.find('.js-store-filter-search-close').hide();
        t_store_updateUrlWithParams('delete_all', null, null, recid);
    });
}

function t_store_filters_initExpandBtn(recid, opts) {
    var el_rec = $('#rec' + recid);
    el_rec.find('.js-store-filter-btn-expand').on('click', function () {
        var isExpanded = $(this).attr('data-expanded') !== 'no';
        var el_filters = $(this).parent().find('.t-store__filter__item-controls-container');
        var button_text = $(this).find('.t-store__filter__btn-text');

        if (isExpanded) {
            el_filters.find('.t-checkbox__control').each(function(i) {
                if (i > 9) {
                    $(this).addClass('t-checkbox__control_hidden');
                }
            });

            el_filters.find('.t-store__filter__custom-sel').each(function(i) {
                if (i > 9) {
                    $(this).addClass('t-store__filter__custom-sel_hidden');
                }
            });

            button_text.text(t_store_dict('filter-expand'));
            el_filters.removeClass('t-store__filter__item-controls-container_expanded');
            $(this).attr('data-expanded', 'no');
        } else {
            el_filters.find('.t-checkbox__control_hidden').removeClass('t-checkbox__control_hidden');
            el_filters.find('.t-store__filter__custom-sel_hidden').removeClass('t-store__filter__custom-sel_hidden');

            button_text.text(t_store_dict('filter-collapse'));
            el_filters.addClass('t-store__filter__item-controls-container_expanded');
            $(this).attr('data-expanded', 'yes');
        }
    });
}

function t_store_filters_cashSortOptsInData(data) {
    data.sortControlData = {
        name: 'sort',
        label: t_store_dict('sort-label'),
        values: [
            { value: '', text: t_store_dict('sort-default') },
            { value: 'price:asc', text: t_store_dict('sort-price-asc') },
            { value: 'price:desc', text: t_store_dict('sort-price-desc') },
            { value: 'title:asc', text: t_store_dict('sort-name-asc') },
            { value: 'title:desc', text: t_store_dict('sort-name-desc') },
            { value: 'created:desc', text: t_store_dict('sort-created-desc') },
            { value: 'created:asc', text: t_store_dict('sort-created-asc') },
        ],
    };
}

function t_store_filters_drawControls_getSortHtml(data) {
    var str = '';
    str += '<div class="t-store__filter__sort">';
    str += '<div class="t-store__sort-select-wrapper">';
    str += '    <select class="t-store__sort-select t-descr t-descr_xxs js-store-filter-sort" name="sort">';
    for (var i = 0; i < data.sortControlData.values.length; i++) {
        var opt = data.sortControlData.values[i];
        str += '<option data-filter-value="' + opt.value + '" value="' + opt.value + '">' + opt.text + '</option>';
    }
    str += '    </select>';
    str += '</div>';
    str += '</div>';
    return str;
}

function t_store_filters_drawControls_getSearchHtml() {
    var str = '';
    str += '<div class="t-store__filter__search t-descr t-descr_xxs">';
    str += '    <div class="t-store__search-wrapper">';
    str +=
        '        <input class="t-store__filter__input js-store-filter-search" type="text" name="query" placeholder="' +
        t_store_dict('searchplaceholder') +
        '">';
    str +=
        '<svg class="t-store__search-icon js-store-filter-search-btn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"> <path fill="#757575" d="M85 31.1c-.5-8.7-4.4-16.6-10.9-22.3C67.6 3 59.3 0 50.6.6c-8.7.5-16.7 4.4-22.5 11-11.2 12.7-10.7 31.7.6 43.9l-5.3 6.1-2.5-2.2-17.8 20 9 8.1 17.8-20.2-2.1-1.8 5.3-6.1c5.8 4.2 12.6 6.3 19.3 6.3 9 0 18-3.7 24.4-10.9 5.9-6.6 8.8-15 8.2-23.7zM72.4 50.8c-9.7 10.9-26.5 11.9-37.6 2.3-10.9-9.8-11.9-26.6-2.3-37.6 4.7-5.4 11.3-8.5 18.4-8.9h1.6c6.5 0 12.7 2.4 17.6 6.8 5.3 4.7 8.5 11.1 8.9 18.2.5 7-1.9 13.8-6.6 19.2z"></path></svg>';
    str +=
        '<svg class="t-store__search-close-icon js-store-filter-search-close" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#757575" fill-rule="evenodd" clip-rule="evenodd" d="M0.781448 10.6465L10.7814 0.646484L11.4886 1.35359L1.48856 11.3536L0.781448 10.6465Z" fill="black"/><path fill="#757575" fill-rule="evenodd" clip-rule="evenodd" d="M10.6464 11.3536L0.646439 1.35359L1.35355 0.646484L11.3535 10.6465L10.6464 11.3536Z" fill="black"/></svg>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_filters_initUIBtnsOnMobile(el_rec) {
    var el_filtBtn = el_rec.find('.js-store-filter-mob-btn');
    var el_filtOpts = el_rec.find('.t-store__filter__options');
    var el_searchBtn = el_rec.find('.js-store-search-mob-btn');
    var el_searchWrap = el_rec.find('.t-store__filter__search-and-sort');

    el_filtBtn.on('click', function () {
        el_searchWrap.hide();
        el_searchBtn.removeClass('active');

        if (el_filtBtn.hasClass('active')) {
            el_filtOpts.hide();
            el_filtBtn.removeClass('active');
        } else {
            el_filtOpts.show();
            el_filtBtn.addClass('active');
        }
    });
    el_searchBtn.on('click', function () {
        // el_filtOpts.hide();
        el_filtBtn.removeClass('active');

        if (el_searchBtn.hasClass('active')) {
            el_searchWrap.hide();
            el_searchBtn.removeClass('active');
            el_filtBtn.removeClass('active');
        } else {
            el_searchWrap.show();
            el_searchBtn.addClass('active');
            el_filtBtn.removeClass('active');
        }
    });
}

function t_store_loadMoreBtn_display(recid, opts) {
    var rec = $('#rec' + recid);
    var loadMoreWrap = rec.find('.t-store__load-more-btn-wrap');
    var isMobileOneRow = $(window).width() < 960 && rec.find('.js-store-grid-cont.t-store__grid-cont_mobile-one-row')[0] ? true : false;

    if (!isMobileOneRow && loadMoreWrap.hasClass('t-store__load-more-btn-wrap_hidden')) {
        loadMoreWrap.removeClass('t-store__load-more-btn-wrap_hidden');
    } else if (isMobileOneRow && !loadMoreWrap.hasClass('t-store__load-more-btn-wrap_hidden')) {
        loadMoreWrap.addClass('t-store__load-more-btn-wrap_hidden');
    }
}

function t_store_moveSearhSort(recid, opts) {
    var rec = $('#rec' + recid);
    var searchSort = rec.find('.t-store__filter__search-and-sort');

    // If search was hidden on mobile, show it again on window resize
    if ($(window).width() > 960 && searchSort.is(':hidden')) {
        searchSort.show();
    }
    // TODO: else on mobile

    // For blocks with sidebars
    // If filters are in sidebar check position in DOM and replace properly
    // No worries, it works only once on window.width > or < 960
    if (!opts.sidebar) return;

    var controlsWrapper = rec.find('.t-store__filter__controls-wrapper');
    var contWithFiler = rec.find('.js-store-cont-w-filter');

    if (searchSort) {
        var isSearchOnTop = searchSort.parent().hasClass('js-store-cont-w-filter');

        if ($(window).width() < 960) {
            if (isSearchOnTop) {
                searchSort.remove();
                controlsWrapper.append(searchSort);
            }
        } else if (!isSearchOnTop) {
            searchSort.remove();
            contWithFiler.prepend(searchSort);
        }
    }
}

function t_store_filters_send(recid, opts) {
    var filters = {};
    var el_rec = $('#rec' + recid);
    /* price */
    var minVal = t_prod__cleanPrice(el_rec.find('.js-store-filter-pricemin').attr('data-min-val'));
    var checkedMinV = t_prod__cleanPrice(el_rec.find('.js-store-filter-pricemin').val());
    if (checkedMinV !== minVal) {
        filters['price:min'] = checkedMinV;
    }
    var maxVal = t_prod__cleanPrice(el_rec.find('.js-store-filter-pricemax').attr('data-max-val'));
    var checkedMaxV = t_prod__cleanPrice(el_rec.find('.js-store-filter-pricemax').val());

    if (checkedMaxV !== maxVal) {
        filters['price:max'] = checkedMaxV;
    }
    /* availability */
    if (el_rec.find('.js-store-filter-onlyavail')[0] && el_rec.find('.js-store-filter-onlyavail')[0].checked) {
        filters['quantity'] = 'y';
    }
    /* options & characteristics */

    var storepartuid = el_rec.find('.t-store__parts-switch-wrapper .js-store-parts-switcher.t-active:not(.t-store__parts-switch-btn-all)').text();
    if (storepartuid) {
        filters['storepartuid'] = storepartuid;
    }

    // var optionOrCharacteriscticsChecked = false;

    el_rec.find('.js-store-filter-opt').each(function () {
        var v = $(this).val();
        var name = $(this).attr('name');
        if (name === 'sort') {
            return;
        }

        if (v && v !== '' && $(this).attr('data-info-type') === 'array') {
            filters[name] = v.split('&&');
            // optionOrCharacteriscticsChecked = true;
        } else if (v) {
            filters[name] = v;
            // optionOrCharacteriscticsChecked = true;
        }
    });

    // if we don't get options for filter from DOM filter section
    // try to get filters storepartuid from DOM switcher
    // it's useable when filters hidden

    // if (el_rec.find('.t-store__parts-switch-wrapper').length > 0 && !optionOrCharacteriscticsChecked) {
    //     el_rec.find('.t-store__parts-switch-wrapper').each(function () {
    //         var activeSwitch = $(this).find('.js-store-parts-switcher.t-active');

    //         if (activeSwitch.length > 0 && !activeSwitch.hasClass('t-store__parts-switch-btn-all')) {
    //             filters['storepartuid'] = activeSwitch.html();
    //         }
    //     });
    // }

    /* search */
    var searchV = el_rec.find('.js-store-filter-search').val();
    if (searchV) {
        filters['query'] = searchV;
    }
    /* sort */
    var sort = {};
    var sortV = el_rec.find('.js-store-filter-sort').val();
    if (sortV === '') {
        sortV = el_rec.find('.js-store-filter-opt[name="sort"]').val();

        if (t_store_isQueryInAddressBar('tfc_sort[' + recid + ']')) {
            t_store_updateUrlWithParams('delete', 'sort', fieldName + ':' + sortDirection, recid);
        }
    }
    if (sortV) {
        var fieldName = sortV.split(':')[0];
        var sortDirection = sortV.split(':')[1];
        sort[fieldName] = sortDirection;
        t_store_updateUrlWithParams('update', 'sort', fieldName + ':' + sortDirection, recid);
    }
    /* redraw table */
    opts.filters = filters;
    opts.sort = sort;
    t_store_filters_prodsNumber_update(el_rec, opts);
    t_store_showLoadersForProductsList(recid, opts);
    t_store_loadProducts('', recid, opts);
}

function t_store_filters_mobileBtns_getHtml(recid, data) {
    var str = '';
    /* filters */
    if (data.filters.length > 0 || data.sort) {
        str += '<div class="js-store-filter-mob-btn t-store__filter__opts-mob-btn t-name t-name_xs">';
        str +=
            '<svg class="t-store__filter__opts-mob-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.42 100"><defs><style>.cls-1{fill:#1d1d1b;}</style></defs><title>2Монтажная область 1 копия</title><path class="cls-1" d="M13.75,22.59V.38h-6V22.59a10.75,10.75,0,0,0,0,20.64V99.62h6V43.23a10.75,10.75,0,0,0,0-20.64Z"/><path class="cls-1" d="M63.42,67.09a10.75,10.75,0,0,0-7.75-10.32V.38h-6V56.77a10.75,10.75,0,0,0,0,20.64V99.62h6V77.41A10.75,10.75,0,0,0,63.42,67.09Z"/></svg>';
        str += t_store_dict('filters');
        str += '</div>';
    }
    /* search */
    if (data.search) {
        str += '<div class="js-store-search-mob-btn t-store__filter__search-mob-btn t-descr t-descr_xs">';
        str +=
            '<svg class="t-store__filter__search-mob-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"> <path fill="#3f3f3f" d="M85 31.1c-.5-8.7-4.4-16.6-10.9-22.3C67.6 3 59.3 0 50.6.6c-8.7.5-16.7 4.4-22.5 11-11.2 12.7-10.7 31.7.6 43.9l-5.3 6.1-2.5-2.2-17.8 20 9 8.1 17.8-20.2-2.1-1.8 5.3-6.1c5.8 4.2 12.6 6.3 19.3 6.3 9 0 18-3.7 24.4-10.9 5.9-6.6 8.8-15 8.2-23.7zM72.4 50.8c-9.7 10.9-26.5 11.9-37.6 2.3-10.9-9.8-11.9-26.6-2.3-37.6 4.7-5.4 11.3-8.5 18.4-8.9h1.6c6.5 0 12.7 2.4 17.6 6.8 5.3 4.7 8.5 11.1 8.9 18.2.5 7-1.9 13.8-6.6 19.2z"></path></svg>';
        str += '</div>';
    }
    return str;
}

function t_store_filters_opts_getHtml(recid, data, opts) {
    var str = '';
    if (data.filters.length === 0 && !data.sort) {
        return '';
    }
    str += '<div class="t-store__filter__options ' + (!data.sort && !data.search ? 't-store__filter__options_center' : '') + '">';
    var filtersArr = data.filters;
    /* add sort control, which would be shown only on mobiles */
    if (data.sort) {
        str += t_store_filters_opts_getHtml_customSelect(data.sortControlData, opts);
    }

    for (var i = 0; i < filtersArr.length; i++) {
        var f = filtersArr[i];
        if (f.control === 'select') {
            str += t_store_filters_opts_getHtml_customSelect(f, opts);
        } else if (f.control === 'checkbox') {
            str += t_store_filters_opts_getHtml_checkbox(f, opts);
        } else if (f.control === 'range' && f.name === 'price') {
            str += t_store_filters_opts_getHtml_range(f, opts);
        }
    }
    str += '</div>';
    return str;
}

function t_store_filters_opts_getOption(f) {
    // In MVP version we use option data to style filters (because we don't have filter styling data yet)
    var optionsData = t_store_option_getOptionsData();

    if (!optionsData) return null;

    var curOption = f.type && f.type === 'option' ? optionsData[f.label] : null;
    if (!curOption) return null;

    var isCustomOption = t_store_option_checkIfCustom(curOption);
    if (isCustomOption) {
        return curOption;
    }

    return null;
}

function t_store_filters_opts_getHtml_customSelect(f, opts) {
    var str = '';

    var curOption = t_store_filters_opts_getOption(f);
    if (curOption && curOption.params && curOption.params.hasColor) {
        // If product options has color always draw checkbox buttons for filters
        return t_store_filters_opts_getHtml_checkbox(f, opts);
    }
    var isSelect,
        isColor,
        isImage,
        defaultValue = f.values && f.values[0] && f.values[0].value ? f.values[0].value : '',
        parentMod = '',
        itemsListMod = '';

    if (curOption) {
        parentMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item');
        itemsListMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item-controls-container');

        isSelect = curOption.params && curOption.params.view === 'select';
        isColor = curOption.params && curOption.params.hasColor;
        isImage = curOption.params && curOption.params.linkImage && !curOption.params.hasColor;
        defaultValue = curOption.values[0];
    }

    /* control = select */
    var sortClass = f.name === 'sort' ? 't-store__filter__item_sort-mobile' : '';
    var customClass = curOption ? ' t-store__filter__item_custom ' : ' ';

    str += '<div class="' + sortClass + ' t-store__filter__item' + customClass + parentMod + ' t-store__filter__item_select js-store-filter-item t-descr t-descr_xxs">';
    str += '    <div class="t-store__filter__item-title js-store-filter-item-title" data-filter-name="' + f.name.toLowerCase() + '">' + f.label + '</div>';
    str += '    <div class="t-store__filter__item-controls-wrap js-store-filter-item-controls-wr">';
    str += '        <div class="t-store__filter__item-controls-container ' + itemsListMod + '" data-type="selectbox">';
    str += '        <input type="hidden" class="js-store-filter-opt" name="' + f.name + '">';

    var isExpandable = false;
    var isCheckmark = isColor || isImage;

    if (f.values) {
        // Draw expand/collapse button or not (t951)
        isExpandable = opts.sidebar && f.values.length > 10;

        for (var j = 0; j < f.values.length; j++) {
            var v = f.values[j].value;
            var text = f.values[j].text;
            var className = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__custom-sel');
            // Hide option if t951 and list length is > 10 items
            className = opts.sidebar && (j > 9) ? className += ' t-store__filter__custom-sel_hidden ' : className += '';

            if (v !== '') {
                var tmp = '';
                tmp = '<div class="t-store__filter__custom-sel ' + className + ' js-store-filter-custom-select ' + sortClass + '" '
                + 'data-select-val="" '
                + 'data-filter-value="" '
                + 'type="selectbox">';

                if (isColor) {
                    var checkmarkStyle = curOption ? ' style="background-color: ' + t_store_option_getColorValue(curOption.values, v) + ';"' : '';

                    var checkmarkMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__checkmark');
                    tmp += '<div class="t-store__filter__checkmark ' + checkmarkMod + '"' + checkmarkStyle + '></div>';
                } else if (isImage) {

                    // var url = curOption.imagesObj[value];
                    // var lazyUrl = t_store_getLazyUrl(options, url);

                    // var imageStyle = !lazyUrl ? '' : ' style="background-image: url(\'' + lazyUrl + '\');"';
                    // str += '    <div class="t-product__option-selected-checkmark t-bgimg" data-original="' + url + '"' + imageStyle + '></div>';
                }

                var titleMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__title');
                tmp += '<div class="t-store__filter__title ' + titleMod + '">' + (text ? text : v) + '</div>';
                tmp += '    </div>';

                var tmpDOM = jQuery.parseHTML(tmp);
                $(tmpDOM).attr('data-select-val', v).attr('data-filter-value', v);
                str += $(tmpDOM)[0].outerHTML;
            }
        }
    }
    str += '        </div>';
    if (isExpandable) {
        str += t_store_filters_opts_getHtml_expandButton(f, opts);
    }
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_filters_opts_getHtml_checkbox(f, opts) {
    var str = '';
    var curOption = t_store_filters_opts_getOption(f);
    var isSelect,
        isColor,
        isImage,
        defaultValue = f.values && f.values[0] ? f.values[0].value : '',
        parentMod = '',
        itemsListMod = '';

    if (curOption) {
        parentMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item');
        itemsListMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item-controls-container');

        isSelect = curOption.params && curOption.params.view === 'select';
        isColor = curOption.params && curOption.params.hasColor;
        isImage = curOption.params && curOption.params.linkImage && !curOption.params.hasColor;
        defaultValue = curOption.values[0];
    }

    var customClass = curOption ? ' t-store__filter__item_custom ' : ' ';

    if (f.name === 'quantity') {
        /* availability - single checkbox */
        str += '<div class="t-store__filter__item t-store__filter__item_available js-store-filter-item t-descr t-descr_xxs">';
        str += '<div class="t-store__filter__item-title js-store-filter-item-title" data-filter-name="quantity">';
        str += f.label ? f.label : t_store_dict('filter-available-name');
        str += '</div>';
        str += '<div class="t-store__filter__item-controls-wrap js-store-filter-item-controls-wr">';
        str += '<label class="t-checkbox__control t-descr t-descr_xxs">';
        str +=
            '<input class="t-checkbox js-store-filter-onlyavail" type="checkbox" name="' +
            t_store_dict('filter-available-label') +
            '" data-filter-value="' +
            t_store_dict('filter-available-label') +
            '">';
        str += '<div class="t-checkbox__indicator"></div>';
        str += t_store_dict('filter-available-label');
        str += '</label>';
        str += '</div>';
        str += '</div>';
    } else {
        /* control = checkboxes */
        str += '<div class="t-store__filter__item ' + customClass + parentMod + ' t-store__filter__item_checkbox js-store-filter-item t-descr t-descr_xxs">';
        str +=
            '    <div class="t-store__filter__item-title js-store-filter-item-title" data-filter-label="' +
            f.label.toLowerCase() +
            '" data-filter-name="' +
            f.name +
            '">' +
            f.label +
            '</div>';
        str += '    <div class="t-store__filter__item-controls-wrap js-store-filter-item-controls-wr">';
        str += '        <div class="t-store__filter__item-controls-container ' + itemsListMod + '" data-type="checkbox">';
        str += '            <input type="hidden" class="js-store-filter-opt" name="' + f.name + '" data-info-type="array">';

        var isExpandable = false;
        var isCheckmark = isColor || isImage;

        if (f.values) {
            // Draw expand/collapse button or not
            isExpandable = opts.sidebar && f.values.length > 10;

            for (var j = 0; j < f.values.length; j++) {
                var v = f.values[j].value;
                var className = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__checkbox');
                // Hide option if t951 and list length is > 10 items
                className = opts.sidebar && (j > 9) ? className += ' t-checkbox__control_hidden ' : className += '';

                var checkmarkMod = isCheckmark ? 't-store__filter__checkmark ' + t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__checkmark') : '';
                var checkmarkStyle = curOption && isColor ? ' style="background-color: ' + t_store_option_getColorValue(curOption.values, v) + ';"' : '';

                if (v !== '') {
                    var tmp = '';
                    tmp = '<label class="t-checkbox__control t-store__filter__checkbox ' + className + ' t-descr t-descr_xxs">';
                        tmp += '<input class="t-checkbox js-store-filter-opt-chb" type="checkbox" name="" data-filter-value="">';
                        tmp += '<div class="t-checkbox__indicator ' + checkmarkMod + '" ' + checkmarkStyle + '></div>';

                    var titleMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__title');
                    tmp += '<span class="t-store__filter__title ' + titleMod + '">' + v + '</span>';
                    tmp += '</label>';

                    var tmpDOM = jQuery.parseHTML(tmp);
                    $(tmpDOM).find('.js-store-filter-opt-chb').attr('name', v).attr('data-filter-value', v);
                    str += $(tmpDOM)[0].outerHTML;
                }
            }
        }
        str += '        </div>';

        if (isExpandable) {
            str += t_store_filters_opts_getHtml_expandButton(f, opts);
        }
        str += '    </div>';
        str += '</div>';
    }
    return str;
}

function t_store_filters_opts_getHtml_range(f, opts) {
    var isSliderAllowed = t_store_filters_priceRange_checkIfAllowed();
    var str = '';
    /* range for price */
    str += '<div class="t-store__filter__item t-store__filter__item_price js-store-filter-item t-descr t-descr_xxs">';
    str += '    <div class="t-store__filter__item-title js-store-filter-item-title">';
    str += f.label ? f.label : t_store_dict('filter-price-name');
    str += '    </div>';

    if (opts.sidebar && isSliderAllowed) {
        str += t_store_filters_opts_getHtml_sliderRange(f);
    }

    str += '    <div class="t-store__filter__item-controls-wrap t-store__filter__item-price-box js-store-filter-item-controls-wr">';
    str +=
        '        <input class="t-store__filter__input js-store-filter-pricemin" type="text" name="price:min" data-min-val="' +
        f.min +
        '" value="' +
        t_store__getFormattedPrice(f.min) +
        '">';
    str +=
        '&nbsp;—&nbsp;<input class="t-store__filter__input js-store-filter-pricemax" type="text" name="price:max" data-max-val="' +
        f.max +
        '" value="' +
        t_store__getFormattedPrice(f.max) +
        '">';
        str += '&nbsp;<button class="t-store__filter__btn js-store-filter-price-btn">OK</button>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_filters_opts_getHtml_sliderRange(f) {
    var str = '';
    str += '<div class="t-store__filter__item-controls-wrap t-store__filter__item-price-slider js-store-filter-item-controls-wr">';
    str += '<div class="t-store__filter__price-outer t-store__filter__price-outer_start"></div>';
    str += '<div class="t-store__filter__price-outer t-store__filter__price-outer_end"></div>';

    // Required! Calc input range step
    var decimals = t_store_filters_price_countDecimals([f.min, f.max]);
    var step = '';
    if (decimals === 1) {
        step = 0.1;
    } else if ((decimals >= 2)) {
        step = 0.01;
    } else {
        step = 1;
    }

    str +=
        '<input class="t-store__filter__range t-store__filter__range_min" type="range" name="price_range" min="' + f.min + '" max="' + f.max + '" step="' + step + '" data-min-val="' +
        f.min +
        '" value="' +
        t_prod__cleanPrice(f.min) +
        '">';
    str +=
        '<input class="t-store__filter__range t-store__filter__range_max" type="range" name="price_range" min="' + f.min + '" max="' + f.max + '" step="' + step + '" data-max-val="' +
        f.max +
        '" value="' +
        t_prod__cleanPrice(f.max) +
        '">';
    str += '<div class="t-store__filter__range_bg"></div>';
    str += '</div>';

    return str;
}

function t_store_filters_opts_checkboxes_groupCheckedToHiddenInput(recid) {
    var el_rec = $('#rec' + recid);
    el_rec.find('.js-store-filter-opt-chb').on('change', function () {
        t_store_filters_opts_checkboxes_changeHiddenInput($(this));
    });
}

function t_store_filters_opts_checkboxes_changeHiddenInput(el_changedCheckbox, fromSwitch) {
    var el_hiddenInput = el_changedCheckbox.parents('.js-store-filter-item').find('.js-store-filter-opt');
    var value = el_hiddenInput.val();
    if (el_changedCheckbox[0].checked) {
        /* checked on change */
        if (fromSwitch) {
            value = el_changedCheckbox.attr('name');
        } else if (value === '') {
            value = el_changedCheckbox.attr('name');
        } else {
            value += '&&' + el_changedCheckbox.attr('name');
        }
    } else {
        /* unchecked on change — remove from hidden input*/
        var arr = value.split('&&');
        var index = arr.indexOf(el_changedCheckbox.attr('name'));
        if (index !== -1) {
            arr.splice(index, 1);
        }
        value = arr.join('&&');
    }
    el_hiddenInput.val(value);
    // el_hiddenInput.data('previousVal', value);
}

function t_store_filters_opts_getHtml_expandButton(f, opts) {
    var str = '';

    str += '<button class="t-store__filter__btn-expand js-store-filter-btn-expand" data-expanded="no" type="button">';
    str += '<span class="t-store__filter__btn-text t-descr t-descr_xxs">' + t_store_dict('filter-expand') + '</span>';
    str += '</button>';
    return str;
}

function t_store_filters_opts_customSelect_saveToHiddenInput(recid) {
    var el_rec = $('#rec' + recid);
    el_rec.find('.js-store-filter-custom-select').on('click', function () {
        var el_hiddenInput = $(this).parents('.js-store-filter-item').find('.js-store-filter-opt');
        var el_filterItem = $(this).parents('.js-store-filter-item');
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            el_hiddenInput.val('');
            return;
        }
        var val = $(this).attr('data-select-val');
        el_hiddenInput.val(val);
        /* remove active class from other options */
        el_filterItem.find('.js-store-filter-custom-select').removeClass('active');
        /* make active */
        $(this).addClass('active');
    });
}

function t_store_filters_opts_customSelect_changeHiddenInput(element) {
    var el_hiddenInput = element.parents('.js-store-filter-item').find('.js-store-filter-opt');
    var elementValue = element.attr('data-select-val');
    el_hiddenInput.val(elementValue);
    el_hiddenInput.data('previousVal', elementValue);
}

function t_store_filters_opts_chosenVals_getHtml() {
    var str = '';
    str += '<div class="t-store__filter__chosen-wrapper js-store-opts-chosen-wrapper">';
    str += '<div class="t-store__filter__reset js-store-filter-reset t-descr t-descr_xxs">' + t_store_dict('filter-reset') + '</div>';
    str += '</div>';
    return str;
}

function t_store_filters_prodsNumber_getHtml() {
    var str = '';
    str += '<div class="t-store__filter__prods-number js-store-filters-prodsnumber-wrap t-descr t-descr_xxs" style="display:none;">';
    str += t_store_dict('filter-prodsnumber');
    str += ': <span class="js-store-filters-prodsnumber">';
    str += '</span>';
    str += '</div>';
    return str;
}

function t_store_filters_prodsNumber_update(rec, opts, obj) {
    if (!opts.filters) {
        return;
    }

    var chosenBar = rec.find('.t-store__filter__chosen-bar');

    if (Object.keys(opts.filters).length && opts.previewmode.length) {
        chosenBar.show();
    } else {
        chosenBar.hide();
    }

    var changedFiltersNumber = Object.keys(opts.filters).length;
    // var isOnlyPartFilter =
    //     Object.keys(opts.filters).length === 1 &&
    //     opts.filters.storepartuid;

    if (
        changedFiltersNumber > 0 &&
        obj &&
        obj.products.length > 0 &&
        opts.isPublishedPage
        // && checkedInputsLength > 0
    ) {
        chosenBar.show();
        rec.find('.js-store-filters-prodsnumber').text(obj.total);
        rec.find('.js-store-filters-prodsnumber-wrap').show();
        return;
    }

    rec.find('.js-store-filters-prodsnumber-wrap').hide();

    /* If empty part is selected, hide floating bar with chosen items */
    if (opts.sidebar) {
        var chosenValues = chosenBar.find('.t-store__filter__chosen-val');
        if (!chosenValues.length) {
            chosenBar.hide();
        }
    }
}

function t_store_filters_opts_chosenVal_add(recid, val, el_control, label) {
    var option = el_control.closest('.t-store__filter__item-controls-container').find('.js-store-filter-opt').attr('name');
    // Don't add dublicated items to the DOM
    var isExist = $('#rec' + recid).find('.t-store__filter__chosen-val[data-option-name="' + option + '"][data-field-val="' + val + '"]')[0] ? true : false;
    if (isExist) {
        return;
    }

    var tmp = '<div class="t-store__filter__chosen-val js-store-filter-chosen-item t-descr t-descr_xxs" data-field-val=""></div>';

    var tmpDOM = jQuery.parseHTML(tmp);
    $(tmpDOM).attr('data-field-val', val)
        .text(label ? label : val);

    if (option) {
        $(tmpDOM).attr('data-option-name', option);
    }

    var str = $(tmpDOM)[0].outerHTML;

    /* add element */
    var el_wrapper = $('#rec' + recid).find('.js-store-opts-chosen-wrapper');
    el_wrapper.prepend(str);
    /* cash a link to control */
    var el_chosenTagItem = option
        ? el_wrapper.find('.js-store-filter-chosen-item[data-field-val="' + val + '"][data-option-name="' + option + '"]')
        : el_wrapper.find('.js-store-filter-chosen-item[data-field-val="' + val + '"]');;
    el_chosenTagItem.data('controlElem', el_control);
    /* show reset button */
    if (el_wrapper.find('.js-store-filter-chosen-item').length > 1) {
        el_wrapper.find('.js-store-filter-reset').addClass('t-store__filter__reset_visible');
    }
}

function t_store_filters_handleOnChange(recid, opts) {
    var el_rec = $('#rec' + recid);
    /* availability checkbox */
    t_store_filters_handleOnChange_avail(recid, opts, el_rec);
    /* price range */
    t_store_filters_handleOnChange_price(recid, opts, el_rec);
    /* price range slider*/
    if (opts.sidebar) {
        t_store_filters_handleOnChange_priceRange(recid, opts, el_rec);
    }
    /* checkbox */
    t_store_filters_handleOnChange_checkbox(recid, opts, el_rec);
    /* selectbox */
    t_store_filters_handleOnChange_selectbox(recid, opts, el_rec);
    /* init sort */
    t_store_filters_handleOnChange_sort(recid, opts, el_rec);
    /* init search */
    t_store_filters_handleOnChange_search(recid, opts, el_rec);

    /* init remove tag on close icon click */
    t_store_filters_opts_checkedValues_hideOnClick(recid, opts);
}

function t_store_filters_handleOnChange_avail(recid, opts, el_rec) {
    el_rec.find('.js-store-filter-onlyavail').on('change', function () {
        var controlValue = $(this).attr('name');
        var onlyAvailableControl = $(this).hasClass('js-store-filter-onlyavail');
        if (onlyAvailableControl) {
            controlValue = 'y';
        }
        var controlGroup = $(this).closest('.t-store__filter__item-controls-wrap').siblings('.js-store-filter-item-title');
        var controlGroupdId = $(controlGroup).data('filter-name');
        if ($(this)[0].checked) {
            t_store_updateUrlWithParams('add', controlGroupdId, controlValue, recid);
            t_store_filters_opts_chosenVal_add(recid, controlValue, $(this), t_store_dict('filter-available-label'));
        } else {
            t_store_updateUrlWithParams('delete', controlGroupdId, controlValue, recid);
            t_store_filters_opts_chosenVal_hide(el_rec, controlValue);
        }
        t_store_filters_send(recid, opts);
    });
}

function t_store_filters_handleOnChange_price(recid, opts, el_rec) {
    /* price range, min */
    var el_priceFiltItem = el_rec.find('.js-store-filter-item.t-store__filter__item_price');
    var minVal = t_prod__cleanPrice(el_rec.find('.js-store-filter-pricemin').attr('data-min-val'));
    var maxVal = t_prod__cleanPrice(el_rec.find('.js-store-filter-pricemax').attr('data-max-val'));
    var el_min = el_rec.find('.js-store-filter-pricemin');
    var el_max = el_rec.find('.js-store-filter-pricemax');

    if (!el_min.data('previousMin')) {
        el_min.data('previousMin', minVal);
    }

    if (opts.sidebar) {
        el_min.on('change', function() {
            minPriceChanged = t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts);

            if (minPriceChanged) {
                t_store_filters_send(recid, opts);
                var el_min_range = el_rec.find('.t-store__filter__range_min');
                el_min_range.trigger('input');
            }
        });

        el_max.on('change', function() {
            maxPriceChanged = t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts);

            if (maxPriceChanged) {
                t_store_filters_send(recid, opts);
                var el_max_range = el_rec.find('.t-store__filter__range_max');
                el_max_range.trigger('input');
            }
        });
    }

    el_min.on('keypress tstoreMinPriceTriggerReset', function (e) {
        if (e.type === 'keypress' && e.which !== 13) {
            return;
        }

        var minPriceChanged = false;
        var maxPriceChanged = false;
        var isChanged = false;

        minPriceChanged = t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts);
        maxPriceChanged = t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts);

        isChanged = minPriceChanged || maxPriceChanged;
        if (isChanged) {
            t_store_filters_send(recid, opts);
            el_min.blur();
            if (!window.isMobile) {
                el_priceFiltItem.removeClass('active');
            }
        }
    });
    /* price range, max */

    if (!el_max.data('previousMax')) {
        el_max.data('previousMax', maxVal);
    }

    el_max.on('keypress tstoreMaxPriceTriggerReset', function (e) {
        if (e.type === 'keypress' && e.which !== 13) {
            return;
        }

        var minPriceChanged = false;
        var maxPriceChanged = false;
        var isChanged = false;

        minPriceChanged = t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts);
        maxPriceChanged = t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts);

        isChanged = minPriceChanged || maxPriceChanged;
        if (isChanged) {
            t_store_filters_send(recid, opts);
            el_max.blur();
            if (!window.isMobile) {
                el_priceFiltItem.removeClass('active');
            }
        }
    });
    /* submit button */
    var el_btn = el_rec.find('.js-store-filter-price-btn');
    el_btn.on('click', function () {
        var minPriceChanged = false;
        var maxPriceChanged = false;
        var isChanged = false;

        minPriceChanged = t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts);
        maxPriceChanged = t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts);

        isChanged = minPriceChanged || maxPriceChanged;

        if (isChanged) {
            t_store_filters_send(recid, opts);
            if (!window.isMobile) {
                el_priceFiltItem.removeClass('active');
            }
        }
    });
}

function t_store_filters_handleOnChange_priceRange(recid, opts, el_rec) {
    var isSliderAllowed = t_store_filters_priceRange_checkIfAllowed();
    if (!opts.sidebar || !isSliderAllowed) {
        return;
    }

    var el_min_range = el_rec.find('.t-store__filter__range_min');
    var el_max_range = el_rec.find('.t-store__filter__range_max');
    var el_min_text = el_rec.find('.js-store-filter-pricemin');
    var el_max_text = el_rec.find('.js-store-filter-pricemax');
    var min = +el_min_text.attr('data-min-val');
    var max = +el_max_text.attr('data-max-val');
    var minRangeVal = t_prod__cleanPrice(el_min_range.val());
    var maxRangeVal = t_prod__cleanPrice(el_max_range.val());

    t_store_filters_calcPriceOuterWidth(el_rec, 'start', min, max, minRangeVal);
    t_store_filters_calcPriceOuterWidth(el_rec, 'end', min, max, maxRangeVal);

    var minTimer = null,
        maxTimer = null;

    el_min_range.on('input', function() {
        var resultVal = t_prod__cleanPrice(el_min_range.val());
        var minVal = t_prod__cleanPrice(el_min_range.val());
        var maxVal = t_prod__cleanPrice(el_max_range.val());

        if (min === max) {
            resultVal = max;
        } else if (minVal > maxVal) {
            resultVal = maxVal - 1;
        } else if (minVal < min) {
            resultVal = min;
        } else if (minVal >= max) {
            resultVal = max - 1;
        }

        el_min_range.val(resultVal);
        el_min_text.val(resultVal);
        t_store_filters_calcPriceOuterWidth(el_rec, 'start', min, max, resultVal);

        if (minTimer) {
            clearTimeout(minTimer);
        }

        minTimer = setTimeout(function() {
            el_min_text.trigger('tstoreMinPriceTriggerReset');
            t_store_filters_scrollStickyBar(el_rec);
        }, 1000);
    });

    el_max_range.on('input', function() {
        var resultVal = t_prod__cleanPrice(el_max_range.val());
        var minVal = t_prod__cleanPrice(el_min_range.val());
        var maxVal = t_prod__cleanPrice(el_max_range.val());

        if (min === max) {
            resultVal = max;
        } else if (maxVal < minVal) {
            resultVal = minVal + 1;
        } else if (maxVal <= min) {
            resultVal = min + 1;
        } else if (maxVal > max) {
            resultVal = max;
        }

        el_max_range.val(resultVal);
        el_max_text.val(resultVal);
        t_store_filters_calcPriceOuterWidth(el_rec, 'end', min, max, resultVal);

        if (maxTimer) {
            clearTimeout(maxTimer);
        }

        maxTimer = setTimeout(function() {
            el_max_text.trigger('tstoreMaxPriceTriggerReset');
            t_store_filters_scrollStickyBar(el_rec);
        }, 1000);
    });

}

function t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts) {
    var el_rec = $('#rec' + recid);
    var val = t_prod__cleanPrice(el_max.val());

    /* check, that value was changed */
    if (val !== el_max.data('previousMax')) {
        val = t_store_filters_handleOnChange_checkInRange(val, el_max, minVal, maxVal, 'max');

        if (opts && opts.sidebar) {
            var slider_el = el_rec.find('.t-store__filter__range_max');
            slider_el.val(val);
        }

        var text = '< ' + el_max.val();
        /* hide previous checked value tag, if it was alredy applied */
        if (el_max.data('previousMax')) {
            t_store_filters_opts_chosenVal_hide(el_rec, el_max.data('previousMax'));
        }
        /* add new checked value tag */
        if (val !== maxVal) {
            t_store_filters_opts_chosenVal_add(recid, val, el_max, text);
        }
        /* cash current value */
        el_max.data('previousMax', val);

        if (val !== maxVal) {
            el_max.attr('data-filter-value', val);
            t_store_updateUrlWithParams('update', 'price:max', val, recid);
        } else if (val <= maxVal) {
            el_max.attr('data-filter-value', '');
            t_store_updateUrlWithParams('delete', 'price:max', val, recid);
        }
        return true;
    }
    return false;
}

function t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts) {
    var el_rec = $('#rec' + recid);
    var val = t_prod__cleanPrice(el_min.val());
    /* check, that value was changed */

    if (val !== el_min.data('previousMin')) {
        val = t_store_filters_handleOnChange_checkInRange(val, el_min, minVal, maxVal, 'min');

        if (opts && opts.sidebar) {
            var slider_el = el_rec.find('.t-store__filter__range_min');
            slider_el.val(val);
        }

        var text = '> ' + el_min.val();
        /* hide previous checked value tag, if it was alredy applied */
        if (el_min.data('previousMin')) {
            t_store_filters_opts_chosenVal_hide(el_rec, el_min.data('previousMin'));
        }
        /* add new checked value tag */
        if (val !== minVal) {
            t_store_filters_opts_chosenVal_add(recid, val, el_min, text);
        }
        /* cash current value */

        el_min.data('previousMin', val);

        if (val !== minVal) {
            el_min.attr('data-filter-value', val);
            t_store_updateUrlWithParams('update', 'price:min', val, recid);
        } else if (val >= minVal) {
            el_min.attr('data-filter-value', '');
            t_store_updateUrlWithParams('delete', 'price:min', val, recid);
        }
        return true;
    }
    return false;
}

function t_store_filters_handleOnChange_checkInRange(val, el_input, minVal, maxVal, type) {
    if (val === 0 && type === 'max') {
        val = maxVal;
        el_input.val(maxVal);
    } else if (val > maxVal) {
        val = maxVal;
        el_input.val(maxVal);
    } else if (val < minVal) {
        val = minVal;
        el_input.val(minVal);
    }
    return val;
}

function t_store_filters_handleOnChange_checkbox(recid, opts, el_rec) {
    el_rec.find('.js-store-filter-opt-chb').on('change', function () {
        var controlValue = $(this).attr('name');
        var controlGroup = $(this).closest('.t-store__filter__item-controls-wrap').siblings('.js-store-filter-item-title');
        var controlGroupdId = $(controlGroup).data('filter-name');

        if ($(this)[0].checked) {
            $(this).parent().addClass('active');
            t_store_updateUrlWithParams('add', controlGroupdId, controlValue, recid);
            t_store_filters_opts_chosenVal_add(recid, controlValue, $(this));
        } else {
            $(this).parent().removeClass('active');
            t_store_updateUrlWithParams('delete', controlGroupdId, controlValue, recid);
            t_store_filters_opts_chosenVal_hide(el_rec, controlValue, $(this));
        }
        // if (window.location.href.indexOf('/r=') !== -1) {
        //     var recIdFromUrl = window.location.href.split('/r=')[1].split('-')[0];
        //     if (recIdFromUrl == recid) {
        //         /* add filter params (from url to opts) */
        //         opts = t_store_updateOption sBasedOnUrl(opts);
        //     }
        // }
        t_store_setActiveStorePart(recid);
        t_store_filters_send(recid, opts);

        if (opts.sidebar) {
            t_store_filters_opts_sort(opts, recid);
            t_store_filters_scrollStickyBar(el_rec);
        }
    });
}

function t_store_filters_handleOnChange_selectbox(recid, opts, el_rec) {
    el_rec.find('.js-store-filter-custom-select').on('click', function (e) {
        var isMobileSort = $(e.target).hasClass('t-store__filter__item_sort-mobile');

        var text = $(this).attr('data-select-val');
        var label = $(this).text();
        var controlGroup = $(this).closest('.t-store__filter__item-controls-wrap').siblings('.js-store-filter-item-title');
        var controlGroupdId = $(controlGroup).data('filter-name');

        var el_hiddenInput = $(this).parents('.js-store-filter-item').find('.js-store-filter-opt');
        var previous = el_hiddenInput.data('previousVal');
        if (previous) {
            t_store_filters_opts_chosenVal_hide(el_rec, previous);
        }
        if (previous === text) {
            t_store_updateUrlWithParams('delete', controlGroupdId, text, recid);
            t_store_setActiveStorePart(recid);
            t_store_filters_send(recid, opts);
            el_hiddenInput.data('previousVal', '');
            return;
        } else {
            if (isMobileSort) {
                el_rec.find('.js-store-filter-sort').val(text);
            }
            t_store_updateUrlWithParams('update', controlGroupdId, text, recid);
        }
        if (!isMobileSort) {
            t_store_filters_opts_chosenVal_add(recid, text, $(this), label);
        }
        t_store_filters_send(recid, opts);
        el_hiddenInput.data('previousVal', text);

        if (opts.sidebar) {
            t_store_filters_opts_sort(opts, recid);
            t_store_filters_scrollStickyBar(el_rec);
        }
    });
}

function t_store_filters_handleOnChange_search(recid, opts, el_rec) {
    var rec = $('#rec' + recid);
    var prevQuery = '';
    var el_input = el_rec.find('.js-store-filter-search');
    var el_closeBtn = el_rec.find('.js-store-filter-search-close');
    var el_searchBtn = el_rec.find('.js-store-filter-search-btn');
    el_searchBtn.on('click', function () {
        if (prevQuery !== el_input.val()) {
            t_store_filters_opts_chosenVal_hide(el_rec, prevQuery);
            prevQuery = el_input.val();
            t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts);
        }
    });
    el_input
        .on('keypress tstoreSearchTriggerReset', function (e, value) {
            if (value && prevQuery === '') {
                // if event from trigger - get input value from event scope
                prevQuery = value;
            } else if (e.currentTarget.defaultValue && prevQuery === '') {
                // if event from keypress - get input value from input
                prevQuery = e.currentTarget.defaultValue;
                e.currentTarget.defaultValue = '';
            }

            if (e.type === 'keypress' && e.which !== 13) {
                return;
            }
            if (prevQuery !== el_input.val()) {
                t_store_filters_opts_chosenVal_hide(el_rec, prevQuery);
                prevQuery = el_input.val();
                t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts);
                // el_input.val('');
            }
        })
        .on('keyup', function () {
            /* show or hide close icon */
            if ($(this).val().length > 0) {
                el_closeBtn.show();
            } else if ($(this).val().length === 0) {
                el_closeBtn.hide();
            }
        });
    /* init close icon on click */
    el_closeBtn.on('click', function () {
        if (rec.find('.js-store-filter-search[name="query"]').attr('value')) {
            // if event from keypress - get input value from input
            prevQuery = rec.find('.js-store-filter-search[name="query"]').attr('value');
        }

        t_store_filters_opts_chosenVal_hide(el_rec, prevQuery);
        el_input.val('');
        prevQuery = '';
        rec.find('.js-store-filter-search[name="query"]')[0].defaultValue = '';
        t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts);
    });
}

function t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts) {
    var val = el_input.val();
    if (val !== '') {
        /* show chosen tag */
        var chosenValText = t_store_dict('searchplaceholder') + ': ' + val;
        t_store_updateUrlWithParams('update', 'query', val, recid);
        t_store_filters_opts_chosenVal_add(recid, val, el_input, chosenValText);
    } else {
        el_closeBtn.hide();
        t_store_updateUrlWithParams('delete', 'query', val, recid);
    }
    t_store_filters_send(recid, opts);
    el_input.blur();
}

function t_store_filters_handleOnChange_sort(recid, opts, el_rec) {
    el_rec.find('.js-store-filter-sort').on('change', function (e) {
        $(this).find('[selected="selected"]').attr('selected', false);
        $(e.currentTarget.selectedOptions[0]).attr('selected', true);
        t_store_filters_send(recid, opts);
    });
}

function t_store_filters_calcPriceOuterWidth(el_rec, endpoint, min, max, value) {
    // Calculate fill width from price range slider to the nearest endpoint
    var distance = max - min;
    var isStart = endpoint === 'start';
    var result = isStart
        ? Math.ceil((value - min) / distance * 100)
        : Math.ceil((max - value) / distance * 100);

    if (isStart) {
        el_rec.find('.t-store__filter__price-outer_start').css('width', result + '%');
    } else {
        el_rec.find('.t-store__filter__price-outer_end').css('width', result + '%');
    }

}

function t_store_filters_updatePriceRange(el_rec) {
    var isSliderAllowed = t_store_filters_priceRange_checkIfAllowed();
    if (!isSliderAllowed) {
        return;
    }

    var el_min_range = el_rec.find('.t-store__filter__range_min');
    var el_max_range = el_rec.find('.t-store__filter__range_max');
    var el_min_text = el_rec.find('.js-store-filter-pricemin');
    var el_max_text = el_rec.find('.js-store-filter-pricemax');

    el_min_range.val(t_prod__cleanPrice(el_min_text.val()));
    el_max_range.val(t_prod__cleanPrice(el_max_text.val()));

    el_min_range.trigger('input');
    el_max_range.trigger('input');
}

function t_store_filters_price_countDecimals(valuesArr) {
    var result = 0;

    for (var i = 0; i < valuesArr.length; i++) {
        var number = +valuesArr[i];
        var numberAsString = number.toString();
        var decimals = 0;

        if (numberAsString.indexOf('.') !== -1) {
            decimals = numberAsString.split('.')[1].length;
        }

        if (decimals > result)  {
            result = decimals;
        }
    }

    return result;
}

function t_store_filters_opts_chosenVal_hide(el_rec, value, el_control) {
    // find proper option name to hide in order different options share common name
    var option = el_control && el_control.length
        ? el_control.closest('.t-store__filter__item-controls-container').find('.js-store-filter-opt').attr('name')
        : null;

    var el_chosen = option
        ? el_rec.find('.js-store-filter-chosen-item[data-field-val="' + value + '"][data-option-name="' + option + '"]')
        : el_rec.find('.js-store-filter-chosen-item[data-field-val="' + value + '"]');

    var isSidebar = el_rec.attr('data-record-type') === '951';
    if (isSidebar) {
        t_store_filters_updatePriceRange(el_rec);
    }

    var el_min_range = el_rec.find('.t-store__filter__range_min');
    el_min_range.trigger('input');

    el_chosen.remove();
    if (el_rec.find('.js-store-filter-chosen-item').length <= 1) {
        el_rec.find('.js-store-filter-reset').removeClass('t-store__filter__reset_visible');
    }
}

function t_store_filters_opts_checkedValues_hideOnClick(recid, opts) {
    var el_rec = $('#rec' + recid);
    var el_filterWrapper = el_rec.find('.js-store-parts-select-container');
    var defVal;

    el_filterWrapper.on('click', '.js-store-filter-chosen-item', function () {
        var el_chosenItem = $(this);
        var el_control = el_chosenItem.data('controlElem');
        var controlOption = el_control.closest('.t-store__filter__item-controls-container').find('.js-store-filter-opt').attr('name');
        var chosenOption = el_chosenItem.attr('data-option-name');

        if (!el_control) {
            console.log('smth wrong with current filter');
            return;
        }
        if (el_control.hasClass('js-store-filter-opt-chb') || el_control.hasClass('js-store-filter-onlyavail')) {
            /* change control for checkbox */
            el_control[0].checked = false;
            /* change hidden input */
            el_control.trigger('change');
        } else if (el_control.hasClass('js-store-filter-custom-select')) {
            /* change control for selectbox */
            el_control.trigger('click');
        } else if (el_control.hasClass('js-store-filter-pricemin')) {
            /* change control for range, min */
            defVal = t_store__getFormattedPrice(el_control.attr('data-min-val'));
            el_control.val(defVal);
            el_control.trigger('tstoreMinPriceTriggerReset');
            t_store_updateUrlWithParams('delete', 'price:min', null, recid);
        } else if (el_control.hasClass('js-store-filter-pricemax')) {
            /* change control for range, max */
            defVal = t_store__getFormattedPrice(el_control.attr('data-max-val'));
            el_control.val(defVal);
            el_control.trigger('tstoreMaxPriceTriggerReset');
            t_store_updateUrlWithParams('delete', 'price:max', null, recid);
        } else if (el_control.hasClass('js-store-filter-search')) {
            var el_control_value = el_control.val();
            el_control.val('').trigger('tstoreSearchTriggerReset', el_control_value);
        }

        /* remove chosen item */

        // if (chosenOption === controlOption) {
        //     el_chosenItem.remove();
        // }
    });
}

function t_store_filters_scrollStickyBar(el_rec) {
    var el_stickySidebar = el_rec.find('.t951__sidebar_sticky');
    if (!el_stickySidebar.length) return;

    $('html, body').animate({
        scrollTop: el_rec.offset().top - 50
    }, 200);
}

// eslint-disable-next-line no-unused-vars
function t_store_oneProduct_init(recid, opts) {
    var el_prod = $('#rec' + recid + ' .js-store-product_single');
    var uid = el_prod.attr('data-product-gen-uid');
    uid = t_store_oneProduct_clearUid(uid);
    el_prod.attr('data-product-gen-uid', uid);

    t_store_oneProduct_preloader_add(recid);

    var pageMode = $('.t-records').attr('data-tilda-mode');
    opts.isPublishedPage = pageMode !== 'edit' && pageMode !== 'preview';

    var requestOnBlockChangeInRedactor = window.tStoreSingleProdsObj && !opts.previewmode;

    if (!window.tStoreSingleProductsIsRequested || requestOnBlockChangeInRedactor) {
        t_store_oneProduct_requestAllSingle(opts);
        window.tStoreSingleProductsIsRequested = true;
        el_prod.bind('tStoreSingleProductsLoaded', function () {
            t_store_oneProduct_fill(recid, window.tStoreSingleProdsObj[uid], opts);
        });
    } else if (window.tStoreSingleProdsObj) {
        t_store_oneProduct_fill(recid, window.tStoreSingleProdsObj[uid], opts);
    } else {
        el_prod.bind('tStoreSingleProductsLoaded', function () {
            t_store_oneProduct_fill(recid, window.tStoreSingleProdsObj[uid], opts);
        });
    }
}

function t_store_oneProduct_clearUid(uid) {
    return uid.replace('product id: ', '');
}

function t_store_oneProduct_preloader_add(recid) {
    var el_rec = $('#rec' + recid);
    var el_prod = el_rec.find('.js-store-product_single');

    if (window.isSearchBot) {
        return;
    }

    var elInfo = el_prod.find('.js-store-single-product-info');
    elInfo.hide();

    var preloaderTimerId = setTimeout(function () {
        var str = '';
        str += '<div class="t-store__single-prod-preloader" style="display:none;">';
        var strTextEl = '<div class="t-store__single-prod-preloader__text"></div>';
        for (var i = 0; i < 6; i++) {
            str += strTextEl;
        }
        str += '</div>';

        elInfo.before(str);
        el_prod.find('.t-store__single-prod-preloader').fadeIn(200);
    }, 1000);
    el_rec.data('preloader-timeout', preloaderTimerId);
}

function t_store_oneProduct_preloader_hide(recid) {
    var el_rec = $('#rec' + recid);
    var el_prod = el_rec.find('.js-store-product_single');

    clearTimeout(el_rec.data('preloader-timeout'));
    el_prod.find('.js-store-single-product-info').show();
    el_prod.find('.t-store__single-prod-preloader').remove();
}

function t_store_oneProduct_requestAllSingle(opts) {
    /* get single products ids */
    var el_singleProds = $('.js-store-product_single');
    var arrId = [];
    for (var i = 0; i < el_singleProds.length; i++) {
        var uid = $(el_singleProds[i]).attr('data-product-gen-uid');
        uid = t_store_oneProduct_clearUid(uid);
        arrId.push(uid);
    }
    t_store_loadProducts_byId(arrId, opts).then(function (data) {
        if (typeof data !== 'string' || data.substr(0, 1) !== '{') {
            console.log("Can't get products array by uid list");
        }
        try {
            var dataObj = jQuery.parseJSON(data);
            var productsArr = dataObj.products;
        } catch (e) {
            console.log(data);
        }
        if (productsArr === '') {
            console.log("Something went wrong. Can't get products array by uid list. Please check products UID.");
            return;
        }

        /* store option params */
        if (dataObj.options && dataObj.options.length && !window.tStoreOptionsList) {
            window.tStoreOptionsList = dataObj.options;
        }

        /* save data after request, to make to reachable for other single blocks */
        window.tStoreSingleProdsObj = t_store_oneProduct_prodsArrToAssociative(productsArr);
        el_singleProds.trigger('tStoreSingleProductsLoaded');
      });
}

function t_store_oneProduct_prodsArrToAssociative(productsArr) {
    var obj = {};
    if (!productsArr) {
        return obj;
    }
    for (var i = 0; i < productsArr.length; i++) {
        var cur = productsArr[i];
        obj[cur.uid] = cur;
    }
    return obj;
}

function t_store_oneProduct_fill(recid, data, opts) {
    var el_rec = $('#rec' + recid);
    var el_prod = el_rec.find('.js-product');
    t_store_oneProduct_preloader_hide(recid);

    if (!data) {
        t_store_oneProduct_error_show(recid, opts);
        return;
    }
    t_store_oneProduct_successMsg_show(recid, data, opts);

    el_prod.data('cardSize', 'large');

    t_store_oneProduct_fill_data(recid, data, el_prod, opts);

    /* Add events */
    t_store_option_handleOnChange_custom(recid, el_prod, opts);
}

function t_store_oneProduct_successMsg_show(recid, data, opts) {
    if (!opts.previewmode) {
        var el_rec = $('#rec' + recid);
        var text =
            window.tildaBrowserLang === 'RU'
                ? 'Товар успешно связан с каталогом. Название товара в каталоге: '
                : 'Product is connected to catalog. Product name in catalog is ';
        text += '<b>' + data.title + '</b>';
        t_store_showMsgInRedactor(el_rec, text, 'success');
    }
}

function t_store_oneProduct_error_show(recid, opts) {
    if (!opts.previewmode) {
        var el_rec = $('#rec' + recid);
        var errorText =
            window.tildaBrowserLang === 'RU'
                ? 'Не удается получить товар из каталога. Пожалуйста, проверьте, что товар с таким ID существует.'
                : "Can't find a product in the catalog. Please check that the product with this ID exists.";
        t_store_showMsgInRedactor(el_rec, errorText, 'error');
    }
}

function t_store_showMsgInRedactor(el_rec, text, type) {
    el_rec.find('.js-store-msg').remove();
    var textColor = type === 'success' ? '#fff' : '#000';
    var bgColor = type === 'success' ? '#62C584' : 'yellow';
    var msgHtml = '';
    msgHtml += '<div class="js-store-msg" style="margin: 0px;text-align: left; font-family: tfutura,Arial; color: ' + textColor + ';">';
    msgHtml +=
        '   <div style="background: ' +
        bgColor +
        '; padding: 16px 20px; box-sizing: border-box; margin-bottom: 30px; position: relative;" class="t-container">';
    msgHtml += '       <div style="width: 40px; height: 40px; position: absolute; left: 20px; bottom: -40px;">';
    msgHtml +=
        '       <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="40px" width="40px"><polygon fill="' +
        bgColor +
        '" stroke="' +
        bgColor +
        '" stroke-width="0" points="0,0 40,0 0,20 0,0"></polygon></svg>';
    msgHtml += '       </div>';
    msgHtml += text;
    msgHtml += '   </div>';
    msgHtml += '</div>';
    el_rec.prepend(msgHtml);
}

function t_store_oneProduct_fill_data(recid, data, el_product, opts) {
    t_store_addProductOptions(recid, data, el_product, opts, 'largecard');
    t_store_onFuncLoad('t_prod__init', function() {
        t_prod__init(recid);
    });
    /*
    el_product.find('.js-product-name').text(data.title);
    el_product.find('.js-store-prod-text').text(data.descr);
    */
    $(window).trigger('resize');
}

function t_store_isQueryInAddressBar(queryString) {
    var currentLocationSearch = window.location.href;
    return currentLocationSearch.indexOf(queryString) !== -1 ? true : false;
}

function t_store_getColumnWidth(size) {
    var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    var mediaQuery = windowWidth > 1200 ? 'minWidth1200' : 'maxWidth1200';

    var gridSizes = {
        minWidth1200: {
            col_1: 60,
            col_2: 160,
            col_3: 260,
            col_4: 360,
            col_5: 460,
            col_6: 560,
            col_7: 660,
            col_8: 760,
            col_9: 860,
            col_10: 960,
            col_11: 1060,
            col_12: 1160,
        },
        maxWidth1200: {
            col_1: 60,
            col_2: 140,
            col_3: 220,
            col_4: 300,
            col_5: 380,
            col_6: 460,
            col_7: 540,
            col_8: 620,
            col_9: 700,
            col_10: 780,
            col_11: 860,
            col_12: 940,
        },
    };

    return gridSizes[mediaQuery]['col_' + size];
}

function t_store_paramsToObj(recid) {
    var paramsString = decodeURI(window.location.search);
    params = paramsString.slice(1).split('&');
    var result = {};

    if (window.location.href.indexOf('s_recid=') !== -1) {
        // Add support for previous url params model
        var recIdFromURL = window.location.href.split('s_recid=')[1].split('&')[0];
        if (recIdFromURL == recid) {
            params.splice(1).forEach(function(param) {
                if (!result[recid]) {
                    result[recid] = {};
                }

                param = param.replace(/^s_/i, 'tfc_');
                param = param.replace(/%3A/gi, ':');

                var parts = param.split('=');
                var key = parts[0];
                var values = parts[1].replaceAll('+', ' ').split('%2B');
                var filter = key.replace(/^tfc_/i, '');

                if (result[recid] && result[recid][filter]) {
                    result[recid][filter] = result[recid][filter].concat(values);
                } else {
                    result[recid][filter] = values;
                }
            });

            var newUrl = t_store_customURLParamsToString(result);
            window.tStoreCustomUrlParams = result;

            if (window.location.hash) {
                newUrl += window.location.hash;
            }
            window.history.replaceState(null, null, newUrl);
        }
    } else {
        // The part where we work with a new universal url params model
        // example: ?tfc_animals[534534543]=dogs%2Bcats%2Bbig+cats
        if (window.location.href.indexOf('tfc_') === -1) {
            window.tStoreCustomUrlParams = result;
            return result;
        }

        params.forEach(function(param) {
            var parts = param.split('=');
            var key = parts[0]; // example: tfc_animals[534534543]
            var values = parts[1].replaceAll('+', ' ').split('%2B'); // example: [dogs,cats,big cats]

            var regexp = new RegExp(/\[\d.*\]$/, 'gi');
            var match = key.match(regexp);
            var recid = match ? Number(JSON.parse(match[0])) : null;
            var filter = key.replace(regexp, '').replace('tfc_', '');

            if (!result[recid]) {
                result[recid] = {};
            }

            if (result[recid] && result[recid][filter]) {
                result[recid][filter] = result[recid][filter].concat(values);
            } else {
                result[recid][filter] = values;
            }
        });
    }

    window.tStoreCustomUrlParams = result;
    return result;
}

function t_store_customURLParamsToString(params) {
    var result = '';
    for (var recid in params) {
        var rec = params[recid];
        for (var filter in rec) {
            var values = Array.isArray(rec[filter]) ? rec[filter].join('%2B') : rec[filter]; // + analogue // + symbol has been already used for spaces
            values = values.replace(/\s/gi, '+');
            result += !result.length ? '?' : '&';
            result += 'tfc_' + filter + '[' + recid + ']' + '=' + values;
        }
    }

    if (!result.length) {
        return window.location.origin + window.location.pathname;
    } else {
        return decodeURI(result);
    }
}

function t_store_updateUrlWithParams(method, key, value, recid) {
    try {

        params = window.tStoreCustomUrlParams;
        if (!params[recid]) {
            params[recid] = {};
        }

        switch (method) {
            case 'add':
                if (!params[recid][key]) {
                    params[recid][key] = [value];
                } else {
                    params[recid][key].push(value);
                }
                break;
            case 'update':
                params[recid][key] = [value];
                break;
            case 'delete':
                if (!params[recid][key]) {
                    break;
                }
                var deleteThis = key === 'query' || key === 'sort' || key === 'price:min' || key === 'price:max';

                if (deleteThis) {
                    delete params[recid][key];
                } else {
                    params[recid][key] = params[recid][key].filter(function(item) {
                        return item !== value;
                    });
                }

                if (params[recid][key] && !params[recid][key].length) {
                    params[recid][key] = null;
                    delete params[recid][key];
                }
                break;
            case 'delete_all':
                delete params[recid];
                break;
            default:
                break;
        }

        var newUrl = t_store_customURLParamsToString(params);
        if (window.location.hash) {
            newUrl += window.location.hash;
        }
        window.history.replaceState(null, null, newUrl);
    } catch (e) {
        console.log('something wrong in t_store_updateUrlWithParams', e);
    }
}

function t_store_updateOptionsBasedOnUrl(opts, customUrlParams, recid) {
    try {
        var params = customUrlParams[recid];

        opts.filters = {};
        for (var key in params) {
            if (key !== 'sort') {
                var isString = key.indexOf('price:m') !== -1;
                opts.filters[key] = !isString ? params[key] : params[key].toString();
            } else {
                opts.sort = {};
                var parts = params[key].join().split(':');
                var key = parts[0];
                var value = parts[1];
                opts.sort[key] = value;
            }
        }
        return opts;
    } catch (e) {
        console.log('something wrong in t_store_updateOptionsBasedOnUrl', e);
    }
}

function t_store_filters_opts_sort(opts, recid) {
    if (!opts.sidebar) {
        return;
    }

    var el_rec = $('#rec' + recid);
    var el_container = el_rec.find('.t-store__filter__item-controls-container');

    el_container.each(function() {
        var type = $(this).attr('data-type');
        var isSortable = !$(this).hasClass('t-store__filter__item-controls-container_color') && !$(this).hasClass('t-store__filter__item-controls-container_image');

        if (!isSortable) {
            return;
        }

        if (type === 'checkbox') {
            var el_controls = $(this).find('.t-checkbox__control');
            var sorted = el_controls.sort(function(a, b) {
                var first = $(a).find('.js-store-filter-opt-chb');
                var second = $(b).find('.js-store-filter-opt-chb');

                if (first.is(':checked') && !second.is(':checked')) {
                    return -1;
                } else if (!first.is(':checked') && second.is(':checked')) {
                    return 1;
                } else if (!first.is(':checked') && !second.is(':checked')) {
                    var firstVal = first.attr('data-filter-value');
                    var secondVal = second.attr('data-filter-value');
                    if (!isNaN(parseFloat(firstVal)) && !isNaN(parseFloat(secondVal))) {
                        return parseFloat(firstVal) - parseFloat(secondVal);
                    } else if (firstVal < secondVal) {
                        return -1;
                    } else if (firstVal > secondVal) {
                        return 1;
                    }
                }

                return 0;
            });

            $(this).append(sorted);
        } else if (type === 'selectbox') {
            var el_controls = $(this).find('.t-store__filter__custom-sel');
            var sorted = el_controls.sort(function(a,b) {
                if ($(a).hasClass('active') && $(b).hasClass('active'))
                    return 1;
                else if ($(a).hasClass('active') && !$(b).hasClass('active'))
                    return -1;
                else if (!$(a).hasClass('active') && !$(b).hasClass('active')) {
                    if ($(a).attr('data-filter-value') < $(b).attr('data-filter-value')) {
                        return -1;
                    }
                    else if ($(a).attr('data-filter-value') > $(b).attr('data-filter-value')) {
                       return 1;
                   }
                }

                return 0;
            });

            $(this).append(sorted);
        }
    });
}

function t_store_filters_render_selected(opts, recid) {
    try {
        var rec = $('#rec' + recid);
        var filterObject = Object.assign({}, opts.filters);
        var sortObject = Object.assign({}, opts.sort);
        var controlType;
        var el_control;

        for (var filterKey in filterObject) {
            if (typeof filterObject[filterKey] === 'string') {
                filterObject[filterKey] = [filterObject[filterKey]];
            }

            filterObject[filterKey].forEach(function (filterValue) {
                var filterLabel;
                el_control = rec.find('[data-filter-value="' + filterValue + '"]');

                if (filterKey === 'price:min') {
                    el_control = rec.find('[name="price:min"]');
                    el_control.data('previousMin', parseInt(filterValue, 10));
                    el_control.attr('value', t_store__getFormattedPrice(filterValue));
                    filterLabel = '> ' + filterValue;
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);

                    if (opts.sidebar) {
                        rec.find('.t-store__filter__range_min').val(filterValue);
                    }
                } else if (filterKey === 'price:max') {
                    el_control = rec.find('[name="price:max"]');
                    el_control.data('previousMax', parseInt(filterValue, 10));
                    el_control.attr('value', t_store__getFormattedPrice(filterValue));
                    filterLabel = '< ' + filterValue;
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);

                    if (opts.sidebar) {
                        rec.find('.t-store__filter__range_max').val(filterValue);
                    }
                } else if (filterKey === 'query') {
                    rec.find('.js-store-filter-search-close').show();
                    el_control = rec.find('[name="query"]');
                    el_control.attr('value', filterValue);
                    el_control.val(filterValue);
                    filterLabel = t_store_dict('searchplaceholder') + ': ' + filterValue;
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);
                } else if (filterKey === 'quantity') {
                    el_control = rec.find('.js-store-filter-onlyavail');
                    el_control.prop('checked', true);
                    filterLabel = t_store_dict('filter-available-label');
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);
                } else if (el_control.length > 0) {
                    controlType = el_control.attr('type');
                    switch (controlType) {
                        case 'checkbox':
                            el_control.each(function() {
                                // get unique option key name and check with filters
                                var option = $(this).closest('.t-store__filter__item-controls-container').find('.js-store-filter-opt').attr('name');
                                var isValid = filterObject[option] && filterObject[option].indexOf(filterValue) !== -1;

                                if (isValid) {
                                    $(this).prop('checked', true);
                                    $(this).parent().addClass('active');
                                    t_store_filters_opts_chosenVal_add(recid, filterValue, $(this));
                                    t_store_filters_opts_checkboxes_changeHiddenInput($(this));
                                }
                            });
                            break;
                        case 'selectbox':
                            el_control.each(function() {
                                // get unique option key name and check with filters
                                var option = $(this).closest('.t-store__filter__item-controls-container').find('.js-store-filter-opt').attr('name');
                                var isValid = filterObject[option] && filterObject[option].indexOf(filterValue) !== -1;

                                if (isValid) {
                                    t_store_filters_opts_chosenVal_add(recid, filterValue, $(this));
                                    $(this).addClass('active');
                                    t_store_filters_opts_customSelect_changeHiddenInput($(this));
                                }
                            });
                            break;

                        default:
                            break;
                    }
                }
            });
        }

        for (var sortKey in sortObject) {
            var sortQuery = sortKey + ':' + sortObject[sortKey];
            var el_control_option = rec.find('option[data-filter-value="' + sortQuery + '"]');
            var el_control_select = rec.find('.js-store-filter-custom-select[data-filter-value="' + sortQuery + '"]');
            el_control_option.attr('selected', 'selected');
            el_control_select.addClass('active');
        }
    } catch (e) {
        console.log('something wrong in t_store_filters_render_selected', e);
    }
}

function t_store_option_getOptionsData() {
    var productsOptions = window.tStoreOptionsList;

    if (!productsOptions) {
        return null;
    }

    var result = {};

    for (var i = 0; i < productsOptions.length; i++) {
        var option = productsOptions[i];
        var key = option.title;

        if (option.params && typeof option.params === 'string') {
            option.params = JSON.parse(option.params);
        }

        if (option.values && typeof option.values === 'string') {
            option.values = JSON.parse(option.values);
        }

        result[key] = option;
    }

    return result;
}

function t_store_option_checkIfCustom(curOption) {
    var params = curOption.params;
    if (!params || Array.isArray(params)) {
        return false;
    }

    if (params.view && params.view !== 'select') {
        return true;
    }

    if (params.hasColor || params.linkImage) {
        return true;
    }

    return false;
}

function t_store_option_handleOnChange_custom(recid, element, options) {
    // Disable all events before add new ones, because this function is called in different places e.g. at popup open
    var el_select_custom = element.find('.t-product__option-variants_custom');

    /* If custom select UI exists, then add event handlers to change hidden select value */
    if (el_select_custom.length) {
        el_select_custom.each(function(index) {
            var el_input = $(this).find('.t-product__option-input');
            var el_option = $(this).find('.t-product__option-item');
            var el_select_hidden = $(this).parent().find('.t-product__option-variants_regular .js-product-edition-option-variants');

            el_input.off('change');

            el_input.change(function() {
                var value = $(this).val();

                el_select_hidden.val(value).change();
                el_option.removeClass('t-product__option-item_active');
                $(this).parent().addClass('t-product__option-item_active');
            });
        });
    }

    /* If custom dropdown exists, add events */
    var el_select_selected = element.find('.t-product__option-selected_select');

    if (el_select_selected.length) {
        var el_select_custom = el_select_selected.parent().find('.t-product__option-variants_custom');

        /* Toggle dropdown visibility*/
        el_select_selected.off('click');

        el_select_selected.on('click', function() {
            el_select_custom.toggleClass('t-product__option-variants_hidden');

            // TODO: rewrite this part to call t_lazyload_update() only once per custom dropdown
            if (window.lazy === 'y') {
                t_lazyload_update();
            }
        });

        /* Update selected option values */
        var el_option = el_select_custom.find('.t-product__option-item');

        el_option.off('click');

        el_option.on('click', function() {
            el_option.removeClass('t-product__option-item_active');
            $(this).addClass('t-product__option-item_active');
            $(this).closest('.t-product__option-variants_custom').addClass('t-product__option-variants_hidden');

            var value = $(this).find('.t-product__option-title').text();
            var el_text = $(this).closest('.t-product__option').find('.t-product__option-selected-title');
            el_text.text(value);

            /* If dropdown type is color, update color in select */
            var el_selected_color = $(this).closest('.t-product__option').find('.t-product__option-selected.t-product__option-selected_color');

            if (el_selected_color.length) {
                var color = $(this).find('.t-product__option-checkmark_color').css('background-color');
                var el_checkmark = el_selected_color.find('.t-product__option-selected-checkmark');
                el_checkmark.css('background-color', color);
            }

            /* If dropdown type is image, update image in select */
            var el_selected_image = $(this).closest('.t-product__option').find('.t-product__option-selected.t-product__option-selected_image');

            if (el_selected_image.length) {
                var imageUrl = $(this).find('.t-product__option-checkmark_image').css('background-image');

                var el_checkmark = el_selected_image.find('.t-product__option-selected-checkmark');
                el_checkmark.css('background-image', 'none');
                el_checkmark.css('background-image', imageUrl);
            }
        });

        /* Close all custom dropdowns on click outside */
        $(document).off('click outsideCustomDropdown');

        $(document).on('click outsideCustomDropdown', function(e) {
            var el_clicked = $(e.target);
            var el_parent = el_clicked.closest('.t-product__option-variants_custom');

            if (el_parent.length && $.contains(el_parent[0], el_clicked[0])) {
                /* continue */
            } else if (!el_clicked.hasClass('t-product__option-selected') && !el_clicked.parents('.t-product__option-selected').length) {
                /* If selected button or any child of selected button was clicked, don't hide dropdown */
                $('.t-product__option-variants_custom.t-product__option-variants_select').addClass('t-product__option-variants_hidden');
            }
        });
    }
}

function t_store_removePrefixFromParamKey(paramKey) {
    try {
        var prefix = 's_';
        return paramKey.substring(prefix.length);
    } catch (e) {
        console.log('something wrong in t_store_removePrefixFromParamKey', e);
    }
}

function t_store_unescapeHtml(str) {
    return $('<div />').html(str).text();
}

window.t_userAgentParser = {
    userAgent: window.navigator.userAgent,
    getIOSMajorVersion: function () {
        var key = 'iPhone OS';
        try {
            var keyIndex = this.userAgent.search(key);
            if (keyIndex !== -1) {
                var keyValueIndex = keyIndex + key.length + 1;
                var partUaAfterKey = this.userAgent.slice(keyValueIndex);
                var keyValue = partUaAfterKey.match(/(\d{1,3}_\d{1,3}(_\d{1,3})?)/);
                var majorVersionInt = parseInt(keyValue[0], 10);
                return majorVersionInt;
            } else {
                return null;
            }
        } catch (e) {
            console.log('error in userAgentParser > getIOSMajorVersion' + e.message);
        }
    },
    isIOSMobileChrome: function () {
        return navigator.userAgent.match('CriOS') ? true : false;
    },
    getIEVersion: function () {
        try {
            var rv = -1; // Return value assumes failure.

            if (navigator.appName == 'Microsoft Internet Explorer') {
                var ua = navigator.userAgent,
                    re = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');

                if (re.exec(ua) !== null) {
                    rv = parseFloat(RegExp.$1);
                }
            } else if (navigator.appName == 'Netscape') {
                /// in IE 11 the navigator.appVersion says 'trident'
                /// in Edge the navigator.appVersion does not say trident
                if (navigator.appVersion.indexOf('Trident') === -1) rv = 12;
                else rv = 11;
            }

            return rv;
        } catch (e) {
            console.log('error in userAgentParser > getIEVersion' + e.message);
        }
    },
};

// polyfill for URLSearchParams
// from https://unpkg.com/@ungap/url-search-params@0.1.4/min.js
if (window.t_userAgentParser.getIEVersion() <= 11 || (window.isiOS === true && (window.isiOSVersion[0] < 10 || window.isiOSVersion[0] == 10 && window.isiOSVersion[1] < 3))) {
    // eslint-disable-next-line
    var self = this || {};
    try {
        !(function (t, e) {
            if (
                new t('q=%2B').get('q') !== e ||
                new t({ q: e }).get('q') !== e ||
                new t([['q', e]]).get('q') !== e ||
                'q=%0A' !== new t('q=\n').toString() ||
                'q=+%26' !== new t({ q: ' &' }).toString() ||
                'q=%25zx' !== new t({ q: '%zx' }).toString()
            )
                throw t;
            self.URLSearchParams = t;
        })(URLSearchParams, '+');
    } catch (t) {
        !(function (t, a, o) {
            'use strict';
            var u = t.create,
                h = t.defineProperty,
                // eslint-disable-next-line no-useless-escape
                e = /[!'\(\)~]|%20|%00/g,
                n = /%(?![0-9a-fA-F]{2})/g,
                r = /\+/g,
                i = { '!': '%21', "'": '%27', '(': '%28', ')': '%29', '~': '%7E', '%20': '+', '%00': '\0' },
                s = {
                    append: function (t, e) {
                        p(this._ungap, t, e);
                    },
                    delete: function (t) {
                        delete this._ungap[t];
                    },
                    get: function (t) {
                        return this.has(t) ? this._ungap[t][0] : null;
                    },
                    getAll: function (t) {
                        return this.has(t) ? this._ungap[t].slice(0) : [];
                    },
                    has: function (t) {
                        return t in this._ungap;
                    },
                    set: function (t, e) {
                        this._ungap[t] = [a(e)];
                    },
                    forEach: function (e, n) {
                        var r = this;
                        for (var i in r._ungap) r._ungap[i].forEach(t, i);
                        function t(t) {
                            e.call(n, t, a(i), r);
                        }
                    },
                    toJSON: function () {
                        return {};
                    },
                    toString: function () {
                        var t = [];
                        for (var e in this._ungap) for (var n = v(e), r = 0, i = this._ungap[e]; r < i.length; r++) t.push(n + '=' + v(i[r]));
                        return t.join('&');
                    },
                };
            for (var c in s) h(f.prototype, c, { configurable: !0, writable: !0, value: s[c] });
            function f(t) {
                var e = u(null);
                switch ((h(this, '_ungap', { value: e }), !0)) {
                    case !t:
                        break;
                    case 'string' == typeof t:
                        '?' === t.charAt(0) && (t = t.slice(1));
                        for (var n = t.split('&'), r = 0, i = n.length; r < i; r++) {
                            var a = (s = n[r]).indexOf('=');
                            -1 < a ? p(e, g(s.slice(0, a)), g(s.slice(a + 1))) : s.length && p(e, g(s), '');
                        }
                        break;
                    case o(t):
                        for (r = 0, i = t.length; r < i; r++) {
                            var s;
                            p(e, (s = t[r])[0], s[1]);
                        }
                        break;
                    case 'forEach' in t:
                        t.forEach(l, e);
                        break;
                    default:
                        for (var c in t) p(e, c, t[c]);
                }
            }
            function l(t, e) {
                p(this, e, t);
            }
            function p(t, e, n) {
                var r = o(n) ? n.join(',') : n;
                e in t ? t[e].push(r) : (t[e] = [r]);
            }
            function g(t) {
                return decodeURIComponent(t.replace(n, '%25').replace(r, ' '));
            }
            function v(t) {
                return encodeURIComponent(t).replace(e, d);
            }
            function d(t) {
                return i[t];
            }
            self.URLSearchParams = f;
        })(Object, String, Array.isArray);
    }
    !(function (d) {
        var r = !1;
        try {
            // eslint-disable-next-line no-undef
            r = !!Symbol.iterator;
        } catch (t) {
            //
        }
        function t(t, e) {
            var n = [];
            return (
                t.forEach(e, n),
                r
                    ? // eslint-disable-next-line no-undef
                      n[Symbol.iterator]()
                    : {
                          next: function () {
                              var t = n.shift();
                              return { done: void 0 === t, value: t };
                          },
                      }
            );
        }
        'forEach' in d ||
            (d.forEach = function (n, r) {
                var i = this,
                    t = Object.create(null);
                this.toString()
                    .replace(/=[\s\S]*?(?:&|$)/g, '=')
                    .split('=')
                    .forEach(function (e) {
                        !e.length ||
                            e in t ||
                            (t[e] = i.getAll(e)).forEach(function (t) {
                                n.call(r, t, e, i);
                            });
                    });
            }),
            'keys' in d ||
                (d.keys = function () {
                    return t(this, function (t, e) {
                        this.push(e);
                    });
                }),
            'values' in d ||
                (d.values = function () {
                    // eslint-disable-next-line no-unused-vars
                    return t(this, function (t, e) {
                        this.push(t);
                    });
                }),
            'entries' in d ||
                (d.entries = function () {
                    return t(this, function (t, e) {
                        this.push([e, t]);
                    });
                }),
            // eslint-disable-next-line no-undef
            !r || Symbol.iterator in d || (d[Symbol.iterator] = d.entries),
            'sort' in d ||
                (d.sort = function () {
                    for (var t, e, n, r = this.entries(), i = r.next(), a = i.done, s = [], c = Object.create(null); !a; )
                        (e = (n = i.value)[0]), s.push(e), e in c || (c[e] = []), c[e].push(n[1]), (a = (i = r.next()).done);
                    for (s.sort(), t = 0; t < s.length; t++) this.delete(s[t]);
                    for (t = 0; t < s.length; t++) (e = s[t]), this.append(e, c[e].shift());
                }),
            (function (f) {
                function l(t) {
                    var e = t.append;
                    (t.append = d.append), URLSearchParams.call(t, t._usp.search.slice(1)), (t.append = e);
                }
                function p(t, e) {
                    if (!(t instanceof e)) throw new TypeError("'searchParams' accessed on an object that does not implement interface " + e.name);
                }
                function t(e) {
                    var n,
                        r,
                        i,
                        t = e.prototype,
                        a = v(t, 'searchParams'),
                        s = v(t, 'href'),
                        c = v(t, 'search');
                    function o(t, e) {
                        d.append.call(this, t, e), (t = this.toString()), i.set.call(this._usp, t ? '?' + t : '');
                    }
                    function u(t) {
                        d.delete.call(this, t), (t = this.toString()), i.set.call(this._usp, t ? '?' + t : '');
                    }
                    function h(t, e) {
                        d.set.call(this, t, e), (t = this.toString()), i.set.call(this._usp, t ? '?' + t : '');
                    }
                    !a &&
                        c &&
                        c.set &&
                        ((i = c),
                        (r = function (t, e) {
                            return (t.append = o), (t.delete = u), (t.set = h), g(t, '_usp', { configurable: !0, writable: !0, value: e });
                        }),
                        (n = function (t, e) {
                            return g(t, '_searchParams', { configurable: !0, writable: !0, value: r(e, t) }), e;
                        }),
                        f.defineProperties(t, {
                            href: {
                                get: function () {
                                    return s.get.call(this);
                                },
                                set: function (t) {
                                    var e = this._searchParams;
                                    s.set.call(this, t), e && l(e);
                                },
                            },
                            search: {
                                get: function () {
                                    return c.get.call(this);
                                },
                                set: function (t) {
                                    var e = this._searchParams;
                                    c.set.call(this, t), e && l(e);
                                },
                            },
                            searchParams: {
                                get: function () {
                                    return p(this, e), this._searchParams || n(this, new URLSearchParams(this.search.slice(1)));
                                },
                                set: function (t) {
                                    p(this, e), n(this, t);
                                },
                            },
                        }));
                }
                var g = f.defineProperty,
                    v = f.getOwnPropertyDescriptor;
                try {
                    t(HTMLAnchorElement), /^function|object$/.test(typeof URL) && URL.prototype && t(URL);
                } catch (t) {
                    //
                }
            })(Object);
    })(self.URLSearchParams.prototype, Object);
}

// polyfill for Object.assign
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

if (window.t_userAgentParser.getIEVersion() <= 11) {
    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, 'assign', {
            // eslint-disable-next-line no-unused-vars
            value: function assign(target, varArgs) {
                // .length of function is 2
                'use strict';
                if (target === null || target === undefined) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource !== null && nextSource !== undefined) {
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true,
        });
    }
}

function t_store_filters_priceRange_checkIfAllowed() {
    var isFirefox = typeof window['InstallTrigger'] !== 'undefined' ? true : false;
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    return !isIE;
}

function t_store_onFuncLoad(funcName, okFunc, time) {
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

function t_store_hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var aaa = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
    return result ? [aaa.r, aaa.g, aaa.b] : null;
}

function t_store_luma_rgb(color) {
    var isArray = Array.isArray(color);

    if (typeof color == 'undefined') {
        return 'black';
    }
    if (color.indexOf('rgb') != 0 && !isArray) {
        return 'black';
    }

    var rgb = isArray ? color : color.split('(')[1].split(')')[0].split(',');

    if (rgb.length < 3) {
        return 'black';
    }

    return ((0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])) > 128 ? 'black' : 'white';
}

function t_store_removeRgbOpacity(color) {
    if (!color || !color.length) {
        return null;
    }

    var result = color.split(',');

    if (result[3]) {
        result[3] = '1)';
    }

    return result.join();
}