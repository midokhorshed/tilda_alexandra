// eslint-disable-next-line no-unused-vars
function t_store_init(recid, opts) {
    var rec = document.getElementById('rec' + recid);
    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));

    if (!isSnippet) {
        t_store_initRouting();
    }
    var el_store = rec.querySelector('.js-store');
    var prodPopup = t_store_get_productPopup_html(recid, opts);
    el_store.insertAdjacentHTML('beforeend', prodPopup);

    var pageMode = document.getElementById('allrecords').getAttribute('data-tilda-mode');
    opts.isPublishedPage = pageMode !== 'edit' && pageMode !== 'preview';

    // draw product popup if we have it in URL
    if (opts.isPublishedPage) {
        t_store_checkUrl(opts, recid);
    }

    var girdPreloader = rec.querySelector('.js-store-grid-cont-preloader');

    if (opts.storepart === '') {
        girdPreloader.style.display = 'none';
        if (opts.sidebar) {
            rec.querySelector('.t951__grid-cont').classList.remove('t951__grid-cont_hidden');
        }
        return;
    }

    // show loader in 2s
    setTimeout(function () {
        girdPreloader.classList.remove('t-store__grid-cont-preloader_hidden');
    }, 1500);

    // before load Products check url for filters params*/
    var customUrlParams = t_store_paramsToObj(recid, opts);

    if (customUrlParams[recid]) {
        var optsBasedOnURL = t_store_updateOptionsBasedOnUrl(opts, customUrlParams, recid);
        if (optsBasedOnURL) {
            opts = optsBasedOnURL;
            rec.addEventListener('controlsDrawn', function () {
                t_store_filters_render_selected(opts, recid);
            });
        }
    }

    if (opts.sidebar) {
        rec.addEventListener('controlsDrawn', function () {
            t_store_filters_opts_sort(opts, recid);
        });

        // if t951 block, add sidebar wrapper for a positioning purpose
        var el_filterWrapper = rec.querySelector('.js-store-parts-select-container');
        var el_sidebarWrapper = el_filterWrapper.querySelector('.t951__sidebar');

        if (!el_sidebarWrapper) {
            el_filterWrapper.insertAdjacentHTML('afterbegin', '<div class="t951__sidebar-wrapper"></div>');
        }
    }

    // Set proper slice if it has been set on URL
    var slice = 1;
    if (customUrlParams[recid] && customUrlParams[recid].page) {
        // Check if page is in URLParams
        // Data could be stored as array :(
        slice = Array.isArray(customUrlParams[recid].page) ?
            customUrlParams[recid].page.join('') :
            customUrlParams[recid].page;
    }

    // draw all products grid
    t_store_loadProducts('', recid, opts, slice);
    t_store_mobileHoriz_checkBtnVisibility(recid, opts);

    if (opts.isHorizOnMob) {
        var handIcon = t_store_get_handIcon_html(recid);
        rec.querySelector('.js-store-grid-cont-preloader').insertAdjacentHTML('beforebegin', handIcon);
    }

    window.addEventListener('resize', t_throttle(function () {
        t_store_unifyCardsHeights(recid, opts);
        t_store_moveSearhSort(recid, opts);
        t_store_loadMoreBtn_display(recid);
        t_store_pagination_display(recid);
    }));

    rec.querySelector('.t-store').addEventListener('displayChanged', function () {
        setTimeout(function () {
            t_store_unifyCardsHeights(recid, opts);
        });
    });

    try {
        if (opts.verticalAlignButtons) {
            window.addEventListener('resize', t_throttle(function () {
                t_store_verticalAlignButtons(recid, opts);
            }, 500));

            rec.querySelector('.t-store').addEventListener('displayChanged', function () {
                t_store_verticalAlignButtons(recid, opts);
            });
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('verticalAlignButtons error: ' + e);
    }
}

function t_store_history_pushState(state, title, url) {
    if (typeof history.pushState != 'undefined') {
        window.history.pushState(state, title, url);
    }
}

function t_store_tabs_init(recid, options, product, el_product, el_popup) {
    var tabs = el_product.querySelectorAll('.t-store__tabs');
    t_store__removeElement(tabs);

    t_store_loadProductTabs(recid, options, product.uid, function () {
        var tabsData = window.tStoreTabsList ? window.tStoreTabsList[product.uid] : null;

        if (!tabsData || !tabsData.length) {
            t_store_initTextAndCharacteristics(el_popup, product);
            return;
        } else {
            t_store_drawProdPopup_drawTabs(recid, options, tabsData);
            t_store_tabs_handleOnChange(recid, el_product);
            t_store_initTextAndCharacteristics(el_popup, product);
        }
    });
}

/**
 * Function for Snippet only
 *
 * @param {*} recid
 * @param {*} options
 * @param {*} product
 */
// eslint-disable-next-line no-unused-vars
function t_store_productInit(recid, options, product) {
    var el_product = document.querySelector('#rec' + recid + ' .t-store__product-snippet.js-store-product');
    var urlSearch = t_store_snippet_getJsonFromUrl();

    if (options.tabs && options.tabs !== '') {
        t_store_tabs_initSnippet(recid, options, el_product, product);
    } else {
        t_store_initTextAndCharacteristics(el_product, product);
    }
    // TODO: jQuery?
    document.body.dispatchEvent(new Event('twishlist_addbtn'));

    setTimeout(function () {
        if (!window.isSearchBot && window.Tilda && typeof Tilda.sendEcommerceEvent == 'function') {
            if (!urlSearch.editionuid) {
                Tilda.sendEcommerceEvent('detail', [{
                    id: '' + (product.id ? product.id : product.uid),
                    uid: '' + product.uid,
                    price: '' + (product.price_min ? product.price_min : product.price),
                    sku: product.sku ? product.sku : '',
                    name: product.title,
                }]);
            } else {
                product.editions.forEach(function (cur) {
                    if (cur.uid === urlSearch.editionuid) {
                        Tilda.sendEcommerceEvent('detail', [{
                            id: '' + cur.uid,
                            uid: '' + cur.uid,
                            price: '' + cur.price,
                            sku: cur.sku ? cur.sku : '',
                            name: product.title,
                        }]);
                    }
                });
            }
        }
    }, 3000);
}

function t_store_tabs_initSnippet(recid, opts, el_product, product) {
    var el_tabs = el_product.querySelector('.t-store__tabs');
    if (!el_tabs) {
        t_store_initTextAndCharacteristics(el_product, product);
        return;
    }

    var tabDesign = opts.tabs;
    var isAccordion = tabDesign === 'accordion';
    var colors = t_store_getCustomColors(opts);

    // Update tab items
    Array.prototype.forEach.call(el_tabs.querySelectorAll('.t-store__tabs__item'), function (item, i) {
        var el_title = item.querySelector('.t-store__tabs__item-title');
        var title = el_title.textContent.trim();
        var el_button = item.querySelector('.t-store__tabs__item-button');
        var el_content = item.querySelector('.t-store__tabs__content');

        item.setAttribute('data-tab-title', t_store_escapeQuote(title));
        el_button.setAttribute('data-tab-title', t_store_escapeQuote(title));

        if (i === 0) {
            item.classList.add('t-store__tabs__item_active');
            el_button.classList.add('t-store__tabs__item-button_active');

            item.querySelector('.t-store__tabs__content').style.display = 'block';
        }

        if (colors.titleColor) {
            el_title.style.color = colors.titleColor;
        }

        if (colors.descrColor) {
            el_content.style.color = colors.descrColor;
        }

        var closeIcon = t_store_tabs_closeIcon_getHtml(recid, opts);
        el_button.insertAdjacentHTML('beforeend', closeIcon);
    });

    // Update tab controls
    Array.prototype.forEach.call(el_tabs.querySelectorAll('.t-store__tabs__button'), function (item, i) {
        var el_title = item.querySelector('.t-store__tabs__button-title');
        var title = el_title.textContent.trim();

        item.setAttribute('data-tab-title', t_store_escapeQuote(title));

        if (i === 0) {
            item.classList.add('t-store__tabs__button_active');
        }

        if (colors.titleColor) {
            el_title.style.color = colors.titleColor;
        }
    });

    if (!isAccordion) {
        var el_controls = el_tabs.querySelector('.t-store__tabs__controls');
        el_controls.insertAdjacentHTML('afterbegin', t_store_tabs_fade_getStyle(opts));
        el_controls.insertAdjacentHTML('afterbegin', t_store_tabs_tabBorder_getStyle(recid, opts));
    } else {
        el_tabs.querySelector('.t-store__tabs__list').insertAdjacentHTML('afterbegin', t_store_tabs_accordionBorder_getStyle(recid, opts));
    }

    el_tabs.classList.remove('t-store__tabs_snippet');
    el_tabs.classList.add('t-col');
    el_tabs.classList.add('t-col_12');
    t_store_tabs_handleOnChange(recid, el_product);
    t_store_initTextAndCharacteristics(el_product, product);
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
    var rec = document.getElementById('rec' + recid);
    var gridContainer = rec.querySelector('.js-store-grid-cont');
    if (gridContainer) {
        gridContainer.classList.add('t-store__valign-buttons');
    }
    var wrappers = rec.querySelector('.js-store-grid-cont .t-store__card__textwrapper');
    var maxHeight = 0;
    var itemsInRow = parseInt(opts.blocksInRow, 10);

    var mobileView = window.innerWidth <= 480;
    var tableView = window.innerWidth <= 960 && window.innerWidth > 480;
    var mobileOneRow = window.innerWidth <= 960 && rec.querySelector('.js-store-grid-cont.t-store__grid-cont_mobile-one-row')[0] ? true : false;
    var mobileTwoItemsInRow = window.innerWidth <= 480 && rec.querySelector('.t-store__mobile-two-columns')[0] ? true : false;

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

    if (wrappers) {
        Array.prototype.forEach.call(wrappers, function (element) {
            element.style.height = 'unset';
        });
    }

    if (wrappers) {
        Array.prototype.forEach.call(wrappers, function (element) {
            if (itemsInRow === 1) {
                element.style.height = 'auto';
            } else {
                wrappersInRow.push(element);

                if (element.offsetHeight > maxHeight) {
                    maxHeight = element.offsetHeight;
                }

                Array.prototype.forEach.call(wrappersInRow, function (wrapper) {
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
    }

    if (opts.showRelevants) {
        var relevantWrappers = rec.querySelectorAll('.js-product-relevant .t-store__card__textwrapper');
        var relevantMaxHeight = 0;
        var relevantWrappersInRow = [];
        Array.prototype.forEach.call(relevantWrappers, function (element) {
            element.style.height = 'unset';
        });

        Array.prototype.forEach.call(relevantWrappers, function (element) {
            relevantWrappersInRow.push(element);

            if (element.offsetHeight > relevantMaxHeight) {
                relevantMaxHeight = element.offsetHeight;
            }

            Array.prototype.forEach.call(relevantWrappersInRow, function (wrapper) {
                wrapper.style.height = relevantMaxHeight + 'px';
            });
        });
    }
}

function t_store_hoverZoom_init(recid) {
    if (window.isMobile) {
        return;
    }
    var rec = document.getElementById('rec' + recid);
    try {
        if (rec.querySelector('[data-hover-zoom]')) {
            if (!jQuery.cachedScript) {
                jQuery.cachedScript = function (url) {
                    var options = {
                        dataType: 'script',
                        cache: true,
                        url: url,
                    };
                    return jQuery.ajax(options);
                };
            }
            $.cachedScript('https://static.tildacdn.com/js/tilda-hover-zoom-1.0.min.js').done(function (script, textStatus) {
                if (textStatus == 'success') {
                    t_hoverZoom_init(recid);
                } else {
                    // eslint-disable-next-line no-console
                    console.log('Upload script error: ' + textStatus);
                }
            });
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Zoom image init error: ' + e.message);
    }
}

function t_store_addStoreParts(recid, opts, storePartsArr) {
    var rec = document.getElementById('rec' + recid);
    var el_store = rec.querySelector('.js-store');
    opts.storePartsArr = storePartsArr;
    var tabsHtml = t_store_get_storePartsControl_html(recid, opts);

    if (opts.sidebar) {
        el_store.querySelector('.t951__sidebar-wrapper').insertAdjacentHTML('afterbegin', tabsHtml);
    } else {
        el_store.querySelector('.js-store-parts-select-container').insertAdjacentHTML('afterbegin', tabsHtml);
    }

    // draw all products grid
    t_store_initStoreParts(recid, opts);
}

function t_store_initStoreParts(recid, opts) {
    var rec = document.getElementById('rec' + recid);

    Array.prototype.forEach.call(rec.querySelectorAll('.js-store-parts-switcher'), function (switcher) {
        switcher.addEventListener('click', function () {
            var params = window.tStoreCustomUrlParams || {};
            var el_hiddenInput, previousInputValue, prevControl;
            var storeparttitle = this.textContent;
            // change active btn
            var activeBtn = rec.querySelector('.t-active');
            if (activeBtn) {
                activeBtn.classList.remove('t-active');
            }
            this.classList.add('t-active');

            if (!opts.filters) {
                opts.filters = {};
            }

            if (this.classList.contains('t-store__parts-switch-btn-all')) {
                if (opts.filters['storepartuid']) {
                    delete opts.filters['storepartuid'];
                }

                el_hiddenInput = rec.querySelector('.js-store-filter-opt[name="storepartuid"]');
                if (el_hiddenInput) {
                    previousInputValue = el_hiddenInput.value;
                }

                if (params[recid] && params[recid].storepartuid) {
                    params[recid].storepartuid.forEach(function (storepart) {
                        var control = rec.querySelector('.js-store-filter-opt-chb[data-filter-value="' + storepart.replace(/\\/g, '\\\\') + '"]');
                        if (control) {
                            control.checked = false;
                        }
                        t_store_filters_opts_chosenVal_hide(rec, storepart);
                    });
                }
                if (el_hiddenInput) {
                    el_hiddenInput.value = '';
                }

                params[recid].storepartuid = [];
                window.tStoreCustomUrlParams = params;
                t_store_updateUrlWithParams('delete', 'storepartuid', storeparttitle, recid);
            } else {
                opts.filters['storepartuid'] = [storeparttitle];
                if (rec.querySelectorAll('.js-store-filter').length > 0) {
                    var controlType;
                    var el_control = rec.querySelector('[data-filter-value="' + storeparttitle.replace(/\\/g, '\\\\') + '"]');

                    if (el_control.length > 0) {
                        el_hiddenInput = el_control.closest('.js-store-filter-item').querySelector('.js-store-filter-opt');
                        previousInputValue = el_hiddenInput.value;
                        if (previousInputValue) {
                            prevControl = rec.querySelector('[data-filter-value="' + previousInputValue + '"]');
                            prevControl.checked = false;
                            prevControl.classList.remove('active');
                            t_store_filters_opts_chosenVal_hide(rec, previousInputValue);
                        }
                        controlType = el_control.getAttribute('type');

                        switch (controlType) {
                            case 'checkbox':
                                el_control.checked = true;
                                t_store_filters_opts_chosenVal_add(recid, storeparttitle, el_control);
                                t_store_filters_opts_checkboxes_changeHiddenInput(el_control, true);
                                break;
                            case 'selectbox':
                                el_control.classList.add('active');
                                t_store_filters_opts_chosenVal_add(recid, storeparttitle, el_control);
                                t_store_filters_opts_customSelect_changeHiddenInput(el_control);
                                break;

                            default:
                                break;
                        }
                    } else {
                        el_hiddenInput = rec.querySelector('.js-store-filter-opt[name="storepartuid"]');
                        previousInputValue = el_hiddenInput.value;
                        if (previousInputValue) {
                            prevControl = rec.querySelector('[data-filter-value="' + previousInputValue + '"]');
                            prevControl.checked = false;
                            prevControl.classList.remove('active');
                            t_store_filters_opts_chosenVal_hide(rec, previousInputValue);
                            el_hiddenInput.value = '';
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
            t_store_setActiveStorePart(recid);
        });
    });
}

function t_store_setActiveStorePart(recid) {
    var rec = document.getElementById('rec' + recid);
    var params = window.tStoreCustomUrlParams;

    var activeBtn = rec.querySelector('.t-active');
    if (activeBtn) {
        activeBtn.classList.remove('t-active');
    }
    Array.prototype.forEach.call(rec.querySelectorAll('.js-store-parts-switcher'), function (switcher) {
        var isAllButton = switcher.classList.contains('t-store__parts-switch-btn-all');

        if (params && params[recid]) {
            var partName = switcher.innerHTML.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
            var parts = params[recid].storepartuid;

            if (parts && parts.indexOf(partName) !== -1) {
                switcher.classList.add('t-active');
            }

            if (!parts && isAllButton) {
                switcher.classList.add('t-active');
            }
        } else if (isAllButton) {
            switcher.classList.add('t-active');
        }
    });
}

function t_store_showLoadersForProductsList(recid, opts) {
    var rec = document.getElementById('rec' + recid);
    // hide animation for current cards
    Array.prototype.forEach.call(rec.querySelectorAll('.t-store__card'), function (card) {
        card.classList.add('t-store__card_hidden');
    });
    // show preloader in 1000ms, if server will answer for a long time
    var preloaderTimerId = setTimeout(function () {
        if (opts.sidebar) {
            rec.querySelector('.t951__grid-cont').classList.add('t951__grid-cont_hidden');
        } else {
            rec.querySelector('.js-store-grid-cont').innerHTML = '';
        }

        var girdPreloader = rec.querySelector('.js-store-grid-cont-preloader');
        girdPreloader.style.display = '';
        girdPreloader.style.opacity = 0;
        girdPreloader.style.transition = 'opacity 200ms';
        girdPreloader.style.opacity = '1';
    }, 1000);
    rec.setAttribute('preloader-timeout', preloaderTimerId);
}

function t_store_loadProducts(method, recid, opts, slice, relevantsOpts) {
    window.tStoreProductsRequested = true;
    var showRelevants = method === 'relevants' ? true : false;
    var c = Date.now();
    var storepartuid = opts.storepart;
    var isFirstSlice = !slice || parseInt(slice, 10) === 1;
    var rec = document.getElementById('rec' + recid);
    var gridContainer = showRelevants ? rec.querySelector('.js-store-relevants-grid-cont') : rec.querySelector('.js-store-grid-cont');
    var isT973 = rec.getAttribute('data-record-type') === '973';

    // combine sending data object
    var dataObj;

    if (showRelevants) {
        dataObj = {
            storepartuid: storepartuid,
            productuid: relevantsOpts.currentProductUid,
            quantity: relevantsOpts.relevantsQuantity,
            method: relevantsOpts.relevantsMethod,
            sort: relevantsOpts.relevantsSort,
        };
        rec.querySelector('.t-store__relevants-grid-cont').style.opacity = 0;
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

    // inside tilda we get data from another url

    if (!opts.isPublishedPage) {
        dataObj.projectid = document.getElementById('allrecords').getAttribute('data-tilda-project-id');
        apiUrl = showRelevants ? 'https://tilda.cc/projects/store/getrelevantproducts/' : 'https://tilda.cc/projects/store/getproductslist/';
    }

    var ts = Date.now();
    $.ajax({
        type: 'GET',
        url: apiUrl,
        data: dataObj,
        dataType: 'text',
        success: function (data) {
            // clear preloader timeout
            clearTimeout(rec.getAttribute('preloader-timeout'));

            // hide preloader, if it was shown
            var girdPreloader = rec.querySelector('.js-store-grid-cont-preloader');
            if (girdPreloader) {
                girdPreloader.style.display = 'none';
            }
            if (opts.sidebar) {
                rec.querySelector('.t951__grid-cont').classList.remove('t951__grid-cont_hidden');
            }

            // remove cards
            if (isFirstSlice) {
                gridContainer.innerHTML = '';
            }

            // check server error
            if (typeof data === 'string' && data.substring(0, 1) !== '{' && (data.indexOf('ERROR:') !== -1 || data.indexOf('Wrong') !== -1)) {
                // eslint-disable-next-line no-console
                console.log('show error');
                var el_errorBox = t_store_get_errorBox(opts, data);
                gridContainer.insertAdjacentHTML('beforeend', el_errorBox);
                fadeIn(rec.querySelector('.js-store-error-msg'), 200);
                return;
            }
            if (data === '') {
                return;
            }

            // try to parse products data
            var obj = {};
            try {
                obj = JSON.parse(data);

                // links for size chart
                if (obj.partlinks !== undefined) {
                    opts.linksSizeChart = obj.partlinks;
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(data);
            }
            if (typeof obj !== 'object') {
                return;
            }

            var productsArr = showRelevants ? obj.relevants : obj['products'];

            // store option params
            if (obj.options && obj.options.length >= 1) {
                window.tStoreOptionsList = obj.options;
            }

            // check server error
            t_store_process(productsArr, recid, opts, slice ? true : false, showRelevants, obj);

            // add store parts
            if (obj.parts && obj.parts.length > 1 && !rec.querySelector('.js-store-parts-switcher') && !opts.hideStoreParts) {
                t_store_addStoreParts(recid, opts, obj.parts);
            }

            if (!showRelevants) {
                t_store_setActiveStorePart(recid);
            }

            // add filters
            if (obj.filter === 'y' && !opts.hideFilters) {
                t_store_loadFilters(recid, opts, function (data) {
                    if (!data) {
                        return;
                    }
                    var filterObject = t_store_parse_jsonData(data);
                    t_store_filters_init(recid, opts, filterObject);
                    // filters prods number info
                    if (!showRelevants) {
                        t_store_filters_prodsNumber_update(rec, opts, obj);
                    }
                });
            } else if (opts.sidebar && !showRelevants) {
                var el_sidebar = rec.querySelector('.t951__sidebar');
                el_sidebar.classList.add('t951__sidebar_empty');
                var text =
                    window.tildaBrowserLang === 'RU' ?
                    'Пожалуйста, добавьте хотя бы один фильтр каталога для отображения боковой панели магазина. <a href="https://help-ru.tilda.cc/online-store-payments/filters" target="_blank" rel="nofollow noopener">Справка</a>' :
                    'Please <a href="https://help.tilda.cc/online-store-payments/filters" target="_blank" rel="nofollow noopener">add at least one catalog filter</a> to display the store sidebar';
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

            // show more button
            var loadMoreBtn = rec.querySelector('.js-store-load-more-btn');
            // stop loaders
            if (loadMoreBtn) {
                loadMoreBtn.classList.remove('t-btn_sending');
            }

            var scrollLoadMoreClickEvent = function () {
                if (window.tStoreProductsRequested) {
                    return;
                }

                if (window.innerWidth < 960) {
                    var scrollWidth = gridContainer.get(0).scrollWidth;
                    var scrollLeft = gridContainer.scrollLeft();
                    var outerWidth = gridContainer.outerWidth();
                    if (outerWidth + scrollLeft + 20 > scrollWidth && loadMoreBtn.style.display !== 'none') {
                        loadMoreBtn.click();
                    }
                }
            };
            // load more
            if (obj.nextslice) {
                var isMobileOneRow = gridContainer.querySelectorAll('t-store__grid-cont_mobile-one-row').length > 0;

                if (!loadMoreBtn) {
                    // add load more button
                    var loadMoreBtn = t_store_get_loadMoreBtn_html(rec, opts);

                    if (opts.sidebar) {
                        rec.querySelector('.t951__cont-w-filter').insertAdjacentHTML('beforeend', loadMoreBtn);
                    } else {
                        rec.querySelector('.js-store-grid-cont').insertAdjacentHTML('afterend', loadMoreBtn);
                    }

                    loadMoreBtn = rec.querySelector('.js-store-load-more-btn');
                } else {
                    loadMoreBtn.style.display = '';
                    var loadMoreBtnEvent = function () {
                        if (!window.tStoreProductsRequested) {
                            loadMoreBtn.classList.add('t-btn_sending');
                            t_store_loadProducts('', recid, opts, obj.nextslice);
                        }
                    };
                    loadMoreBtn.removeEventListener('click', loadMoreBtnEvent);
                    loadMoreBtn.addEventListener('click', loadMoreBtnEvent);
                }

                if (isMobileOneRow) {
                    gridContainer.addEventListener('scroll', t_throttle(scrollLoadMoreClickEvent));
                }
            } else if (!showRelevants && loadMoreBtn) {
                loadMoreBtn.style.display = 'none';
                gridContainer.removeEventListener('scroll', scrollLoadMoreClickEvent);
            }

            // add Pagination
            if (opts.showPagination && opts.showPagination === 'on' && !showRelevants) {
                t_store_pagination_draw(recid, opts, slice, obj.nextslice, obj.total);
            }

            if (window.isMobile) {
                gridContainer.addEventListener('scroll', t_throttle(function () {
                    if (typeof document.getElementById('allrecords').getAttribute('data-tilda-mode') == 'undefined') {
                        if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
                            t_store_onFuncLoad('t_lazyload_update', function () {
                                t_lazyload_update();
                            });
                        }
                    }
                }));
            }

            if (showRelevants) {
                rec.querySelector('.t-store__relevants-grid-cont').style.opacity = 1;
                var blocksInRowForRelevant = 4;
                if (opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || window.innerWidth <= 960)) {
                    t_store_onFuncLoad('t_sldsInit', function () {
                        t_sldsInit(recid + ' .js-store-relevants-grid-cont');
                    });
                }
            }

            if (isT973 && !showRelevants) {
                t_store_onFuncLoad('t_sldsInit', function () {
                    t_sldsInit(recid + ' .js-store-grid-cont');
                });
            }

            if (opts.verticalAlignButtons) {
                t_store_verticalAlignButtons(recid, opts);
            }

            if (opts.verticalAlignButtons) {
                if (document.readyState === 'complete') {
                    t_store_verticalAlignButtons(recid, opts);
                } else {
                    window.addEventListener('load', function () {
                        t_store_verticalAlignButtons(recid, opts);
                    });
                }
            }

            t_store_onFuncLoad('t_animate__startAnimation', function () {
                t_animate__startAnimation();
            });

            document.body.dispatchEvent(new Event('twishlist_addbtn'));
            window.tStoreProductsRequested = false;
        },
        error: function (xhr) {
            // show more button
            var loadMoreBtn = rec.querySelector('.js-store-load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.classList.remove('t-btn_sending');
            }
            // check internet connection
            var ts_delta = Date.now() - ts;
            if (xhr.status == 0 && ts_delta < 100) {
                // eslint-disable-next-line no-console
                console.log('Request error (get store products). Please check internet connection...');
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
            // eslint-disable-next-line no-console
            console.log(data);
        },
        error: function () {
            // eslint-disable-next-line no-console
            console.log("Can't get product with uid = " + curProdUid + ' in storepart = ' + opts.storepart);
        },
        timeout: 1000 * 25,
    });
}

function t_store_loadProducts_byId(idArr, opts, onsuccess) {
    var c = Date.now();

    var dataObj = {
        productsuid: idArr,
        c: c,
    };

    var apiUrl = 'https://store.tildacdn.com/api/getproductsbyuid/';

    // inside tilda we get data from another url
    if (opts !== undefined) {
        if (!opts.isPublishedPage) {
            dataObj.projectid = document.getElementById('allrecords').getAttribute('data-tilda-project-id');
            apiUrl = 'https://tilda.cc/projects/store/getproductsbyuid/';
        }
    }

    return $.ajax({
        type: 'GET',
        url: apiUrl,
        data: dataObj,
        dataType: 'text',
        success: function (data) {
            onsuccess(data);
        },
        error: function () {
            // eslint-disable-next-line no-console
            console.log("Can't get getproductsbyuid. Requesting idArr: ");
            // eslint-disable-next-line no-console
            console.log(idArr);
        },
        timeout: 1000 * 25,
    });
}

function t_store_loadFilters(recid, opts, onsuccess) {
    /* because only load data in this method we don't need to check below
        var el_rec = document.getElementById('rec' + recid);
        if (el_rec.querySelector('.js-store-filter').length > 0) {
            return;
        }
    */

    /*
    if (window.tStoreFiltersIsRequested) {
        if (window.tStoreFiltersData) {
            t_store_filters_init(recid, opts, window.tStoreFiltersData);
        } else {
            $('#rec'+recid+' .js-store').addEventListener('tStoreFiltersLoaded', function(){
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
    // inside tilda we get data from another url
    if (!opts.isPublishedPage) {
        dataObj.projectid = document.getElementById('allrecords').getAttribute('data-tilda-project-id');
        apiUrl = 'https://tilda.cc/projects/store/getfilters/';
    }

    return $.ajax({
        type: 'GET',
        url: apiUrl,
        data: dataObj,
        dataType: 'text',
        success: function (data) {
            // try to parse filters data
            /*
            window.tStoreFiltersData = obj;
            $('.js-store').dispatchEvent(new Event('tStoreFiltersLoaded');
            */

            onsuccess(data);
        },
        error: function () {
            // eslint-disable-next-line no-console
            console.log("Can't get filters in storepart = " + opts.storepart);
        },
        timeout: 1000 * 25,
    });
}

function t_store_loadProductTabs(recid, opts, curProdUid, onload) {
    var c = Date.now();
    var storepartuid = opts.storepart;

    var dataObj = {
        storepartuid: storepartuid,
        recid: recid,
        productuid: curProdUid,
        c: c,
    };

    if (!opts.isPublishedPage) {
        dataObj.projectid = document.getElementById('allrecords').getAttribute('data-tilda-project-id');
    }

    var apiUrl = 'https://store.tildacdn.com/api/getproducttabs/';

    // inside tilda we get data from another url
    if (!opts.isPublishedPage) {
        dataObj.projectid = document.getElementById('allrecords').getAttribute('data-tilda-project-id');
        apiUrl = 'https://tilda.cc/projects/store/getproducttabs/';
    }

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var data = xhr.responseText;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            if (typeof data !== 'object') {
                // eslint-disable-next-line no-console
                console.log('Wrong tabs data format for product uid = ' + curProdUid + ' in storepart = ' + opts.storepart);
                return;
            }

            if (!window.tStoreTabsList) {
                window.tStoreTabsList = {};
            }

            window.tStoreTabsList[data.productuid] = data.tabs;

            onload();
        }
    };
    xhr.onerror = function () {
        // eslint-disable-next-line no-console
        console.log("Can't get tabs for product uid = " + curProdUid + ' in storepart = ' + opts.storepart);
    };
    xhr.open('GET', apiUrl + '?' + t_store__serializeData(dataObj));
    xhr.send();
}

function t_store_parse_jsonData(data) {
    try {
        var obj = JSON.parse(data);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(data);
    }
    if (typeof obj !== 'object') {
        return;
    }
    return obj;
}

// draw grid of products
function t_store_process(productsArr, recid, opts, isNextSlice, isRelevantsShow, obj) {
    var rec = document.getElementById('rec' + recid);
    var gridContainer = rec.querySelector('.js-store-grid-cont');
    var isT973 = rec.getAttribute('data-record-type') === '973';

    if (isRelevantsShow) {
        gridContainer = rec.querySelector('.js-store-relevants-grid-cont');
    }

    var separator = t_store_get_horizSeparator_html(opts);
    var obj_products = {};
    var countProducts = gridContainer.querySelectorAll('.t-store__card').length;

    // show empty message, if storepart is empty
    if (productsArr.length === 0) {
        var el_emptyMsg = t_store_get_emptyMsg_html(opts);
        gridContainer.insertAdjacentHTML('beforeend', el_emptyMsg);
        fadeIn(rec.querySelector('.js-store-empty-part-msg'), 200);
        return;
    }

    if (isRelevantsShow && opts.relevants_slider && opts.prodCard.shadowSize && opts.prodCard.shadowSize.length) {
        var paddingStyle = '';
        var size = parseInt(opts.prodCard.shadowSize, 10) > 10 ? 10 : parseInt(opts.prodCard.shadowSize, 10);
        var sizeHover = parseInt(opts.prodCard.shadowSizeHover, 10) > 40 ? 40 : parseInt(opts.prodCard.shadowSizeHover, 10);
        var maxSize = Math.max(sizeHover, size);

        // Add paddings for shadows in relevants block
        paddingStyle += '<style>\n';
        paddingStyle += '@media screen and (max-width:960px) {\n';
        paddingStyle += '#rec' + recid + ' .t-store .t-store__relevants__container .t-store__relevants-grid-cont .t-store__card__wrap_all {\n';
        paddingStyle += 'margin: ' + size + 'px;\n';
        paddingStyle += '}\n';
        paddingStyle += '}\n';
        paddingStyle += '@media screen and (min-width:961px) {\n';
        paddingStyle += '#rec' + recid + ' .t-store .t-store__relevants__container .t-store__relevants-grid-cont .t-slds__items-wrapper {\n';
        paddingStyle += 'padding-top: ' + maxSize + 'px;\n';
        paddingStyle += 'padding-bottom: ' + maxSize + 'px;\n';
        paddingStyle += '}\n';
        paddingStyle += '#rec' + recid + ' .t-store .t-store__relevants__container .t-store__relevants__title-wrapper .t-store__relevants__title {\n';
        paddingStyle += 'margin-bottom: ' + (40 - maxSize) + 'px;\n';
        paddingStyle += '}\n';
        paddingStyle += '}\n';
        paddingStyle += '</style>';

        rec.querySelector('.t-popup .t-store__relevants__container').insertAdjacentHTML('beforebegin', paddingStyle);
    }

    // generate product cards HTML
    var productsHtml = '';
    var blocksInRowForRelevant = 4;
    var blocksInRow = isRelevantsShow ? blocksInRowForRelevant : opts.blocksInRow;

    if ((isRelevantsShow && opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || window.innerWidth <= 960)) || (!isRelevantsShow && isT973)) {
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
            ((!isRelevantsShow && isT973) ? blocksInRow : blocksInRowForRelevant) +
            '" data-slider-transition="' +
            animationspeed +
            '" data-slider-with-cycle="true" data-slider-cycle="yes" data-slider-correct-height="' + ((!isRelevantsShow && isT973) ? 'true' : 'false') + '" data-auto-correct-mobile-width="false">';

        productsHtml = productsHtml
            .replace('[[noCycleClass]]', opts.slider_opts.cycle ? '' : 't-slds__nocycle')
            .replace('[[isCycled]]', opts.slider_opts.cycle ? 'true' : 'false');
    }

    // Store product min and max prices
    Array.prototype.forEach.call(productsArr, function (product) {
        var minPrice = null;
        var maxPrice = null;

        t_store_onFuncLoad('t_store__cleanPrice', function () {
            product.editions.forEach(function (edition) {
                if (edition.price && edition.price !== '') {
                    var price = t_store__cleanPrice(edition.price);

                    if (minPrice === null) {
                        minPrice = price;
                    } else {
                        minPrice = Math.min(minPrice, price);
                    }

                    if (maxPrice === null) {
                        maxPrice = price;
                    } else {
                        maxPrice = Math.max(maxPrice, price);
                    }
                }
            });
        });

        product.minPrice = minPrice;
        product.maxPrice = maxPrice;
    });

    Array.prototype.forEach.call(productsArr, function (product, i) {
        if ((!isRelevantsShow && (!isT973)) || (isRelevantsShow && !opts.relevants_slider)) {
            if (countProducts > 0 && countProducts % blocksInRow === 0) {
                productsHtml += separator;
            }
        }

        productsHtml += t_store_get_productCard_html(rec, product, opts, isRelevantsShow, recid, i, productsArr);
        obj_products[product.uid] = product;

        countProducts++;
    });

    if ((isRelevantsShow && opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || window.innerWidth <= 960)) || (!isRelevantsShow && isT973)) {
        var arrowsTplEl = rec.querySelector('.js-store-tpl-slider-arrows');
        var arrowsTpl = arrowsTplEl.innerHTML;

        productsHtml += '</div>';
        productsHtml += '</div>';

        if (arrowsTpl && !isRelevantsShow && isT973) {
            productsHtml += arrowsTpl;
            gridContainer.classList.remove('t-container').classList.remove('t-store__grid-cont_mobile-grid');
        }

        if (!isRelevantsShow && isT973) {
            var strBullets = '<div class="t-slds__bullet_wrapper">';
            Array.prototype.forEach.call(productsArr, function (product, i) {
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
    // change DOM
    t_store_process_appendAndShowProducts(rec, gridContainer, productsHtml);

    // init product options and edition options
    Array.prototype.forEach.call(productsArr, function (product) {
        var el_product = isRelevantsShow ?
            rec.querySelector('.t-store__relevants__container .js-product.t-item[data-product-gen-uid="' + product.uid + '"]') :
            rec.querySelector('.t-store__grid-cont .js-product.t-item[data-product-gen-uid="' + product.uid + '"]');
        el_product.setAttribute('cardSize', 'small');
        product = obj_products[product.uid];
        // create quantity input for popup
        if (opts.showStoreBtnQuantity === 'both' || opts.showStoreBtnQuantity === 'list') {
            t_store_addProductQuantity(recid, el_product, product, opts);
        }
        t_store_addProductOptions(recid, product, el_product, opts);

        // Add event handlers for custom styled options
        t_store_option_handleOnChange_custom(recid, el_product, opts);

        t_store_onFuncLoad('t_prod__initProduct', function () {
            t_prod__initProduct(recid, el_product);
        });
    });

    if (!isNextSlice && opts.isFlexCols && opts.isHorizOnMob) {
        var storeTailGap = gridContainer.querySelector('.t-store__tail-gap');
        t_store__removeElement(storeTailGap);
        gridContainer.insertAdjacentHTML('beforeend', '<div class="t-store__tail-gap"></div>');
    }
    // init js events and do js updates
    if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
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
    if (document.querySelector('.t706__cartwin')) {
        if (typeof tcart__addEvent__links === 'function') {
            tcart__addEvent__links();
        }
    } else {
        // eslint-disable-next-line no-console
        console.log('Warning: cart block is not added to this page');
    }

    t_store_initPopup(recid, obj_products, opts, isRelevantsShow, obj);

    t_store_unifyCardsHeights(recid, opts);
    if (opts.verticalAlignButtons) {
        t_store_verticalAlignButtons(recid, opts);
    }

    setTimeout(function () {
        t_store_unifyCardsHeights(recid, opts);
        if (opts.verticalAlignButtons) {
            t_store_verticalAlignButtons(recid, opts);
        }
    }, 1);

    if (document.fonts !== undefined) {
        if (document.fonts.ready !== undefined) {
            document.fonts.ready.then(function () {
                setTimeout(function () {
                    t_store_unifyCardsHeights(recid, opts);
                }, 1000);
            });
        }
    } else {
        // IE, old Edge
        setTimeout(function () {
            t_store_unifyCardsHeights(recid, opts);
        }, 1000);
    }

    if (opts.verticalAlignButtons) {
        if (document.readyState === 'complete') {
            t_store_verticalAlignButtons(recid, opts);
        } else {
            window.addEventListener('load', function () {
                t_store_verticalAlignButtons(recid, opts);
            });
        }
    }

    if (!opts.previewmode) {
        try {
            /* TODO: fix */
            // eslint-disable-next-line no-undef
            addEditFieldEvents_new(recid);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e.message);
        }
    }
}

function t_store_process_appendAndShowProducts(rec, gridContainer, productsHtml) {
    gridContainer.insertAdjacentHTML('beforeend', productsHtml);
    if (rec.getAttribute('already-loaded-first-products') === true) {
        // products in pagination and in tabs we show with transition
        setTimeout(function () {
            Array.prototype.forEach.call(rec.querySelectorAll('.t-store__card'), function (card) {
                card.classList.remove('t-store__card_hidden');
            });
        }, 10);
    } else {
        // first products we show without transition
        Array.prototype.forEach.call(rec.querySelectorAll('.t-store__card'), function (card) {
            card.classList.remove('t-store__card_hidden');
        });
        // flag, that next loaded products wouldn't be first for this rec
        rec.setAttribute('already-loaded-first-products', true);
    }
}

function t_store_pagination_draw(recid, opts, curPage, nextSlice, total) {
    // Config
    curPage = !curPage ? 1 : Number(curPage);
    var PAGES_DRAW_COUNT = 5;
    var pageSize = opts.size;
    var totalPages = Math.ceil(total / pageSize);
    var pagingRange = t_store_pagination_getPagingRange(curPage, 1, totalPages, PAGES_DRAW_COUNT);

    // Draw
    var rec = document.getElementById('rec' + recid);
    var gridContainer = rec.querySelector('.js-store-grid-cont');
    var loadmore = rec.querySelector('.t-store__load-more-btn-wrap');
    var pagination = rec.querySelector('.t-store__pagination');

    if (totalPages <= 1) {
        t_store__removeElement(pagination);
        return;
    }

    var html = t_store_pagination_getHtml(recid, opts, curPage, pagingRange, totalPages);
    // Append properly
    if (pagination) {
        t_store__removeElement(pagination);
        pagination.insertAdjacentHTML('beforeend', html);
    } else if (loadmore) {
        loadmore.insertAdjacentHTML('afterend', html);
    } else {
        gridContainer.insertAdjacentHTML('afterend', html);
    }

    var pagination = rec.querySelector('.t-store__pagination');
    if (pagination) {
        pagination.setAttribute('data-active-page', curPage);
        pagination.setAttribute('data-total-pages', totalPages);
    }

    // Events
    t_store_pagination_addEvents(recid, opts);
    // Toggle display
    t_store_pagination_display(recid);
}

function t_store_pagination_getHtml(recid, opts, curPage, pagingRange, totalPages) {
    var rec = document.getElementById('rec' + recid);
    var pagination = rec.querySelector('.t-store__pagination');
    var str = '';

    var addStyles = t_store_pagination_getButtonStyles(opts);
    var descrColor = opts.typo && opts.typo.descrColor && opts.typo.descrColor.length ? opts.typo.descrColor : null;
    var iconsColor = descrColor || addStyles.bgColor || '#000000';
    var separator = '...';
    var prev = '<?xml version="1.0" encoding="UTF-8"?>\
    <svg class="t-store__pagination__arrow t-store__pagination__arrow_prev" width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
            <path d="M5.85355339,3.14644661 C6.02711974,3.32001296 6.04640489,3.58943736 5.91140884,3.7843055 L5.85355339,3.85355339 L1.707,8 L15.5,8 C15.7761424,8 16,8.22385763 16,8.5 C16,8.74545989 15.8231248,8.94960837 15.5898756,8.99194433 L15.5,9 L1.707,9 L5.85355339,13.1464466 C6.02711974,13.320013 6.04640489,13.5894374 5.91140884,13.7843055 L5.85355339,13.8535534 C5.67998704,14.0271197 5.41056264,14.0464049 5.2156945,13.9114088 L5.14644661,13.8535534 L0.146446609,8.85355339 L0.108961015,8.81166225 L0.108961015,8.81166225 L0.0667474273,8.74976515 L0.0667474273,8.74976515 L0.0376105602,8.6905951 L0.0376105602,8.6905951 L0.0166108213,8.62813914 L0.0166108213,8.62813914 L0.00544806672,8.57406693 L0.00544806672,8.57406693 L0.00182199094,8.54281541 L0.00182199094,8.54281541 L0,8.48946265 C0.000554364655,8.46826702 0.00233820308,8.44709424 0.00546187104,8.42608223 L0,8.5 L0.00282096186,8.4465724 L0.00282096186,8.4465724 L0.0166082551,8.37185423 L0.0166082551,8.37185423 L0.0377922373,8.30896344 L0.0377922373,8.30896344 L0.0885911588,8.2156945 L0.0885911588,8.2156945 L0.134588748,8.15871357 L0.134588748,8.15871357 L5.14644661,3.14644661 C5.34170876,2.95118446 5.65829124,2.95118446 5.85355339,3.14644661 Z" fill="' + iconsColor + '" fill-rule="nonzero"></path>\
        </g>\
    </svg>';
    var next = '<?xml version="1.0" encoding="UTF-8"?>\
    <svg class="t-store__pagination__arrow t-store__pagination__arrow_next" width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
            <path d="M10.1464466,3.14644661 C9.97288026,3.32001296 9.95359511,3.58943736 10.0885912,3.7843055 L10.1464466,3.85355339 L14.293,8 L0.5,8 C0.223857625,8 0,8.22385763 0,8.5 C0,8.74545989 0.176875161,8.94960837 0.410124368,8.99194433 L0.5,9 L14.293,9 L10.1464466,13.1464466 C9.97288026,13.320013 9.95359511,13.5894374 10.0885912,13.7843055 L10.1464466,13.8535534 C10.320013,14.0271197 10.5894374,14.0464049 10.7843055,13.9114088 L10.8535534,13.8535534 L15.8535534,8.85355339 L15.891039,8.81166225 L15.891039,8.81166225 L15.9332526,8.74976515 L15.9332526,8.74976515 L15.9623894,8.6905951 L15.9623894,8.6905951 L15.9833892,8.62813914 L15.9833892,8.62813914 L15.9945519,8.57406693 L15.9945519,8.57406693 L16,8.5 L16,8.5 L15.997179,8.4465724 L15.997179,8.4465724 L15.9833917,8.37185423 L15.9833917,8.37185423 L15.9622078,8.30896344 L15.9622078,8.30896344 L15.9114088,8.2156945 L15.9114088,8.2156945 L15.8654113,8.15871357 L15.8654113,8.15871357 L10.8535534,3.14644661 C10.6582912,2.95118446 10.3417088,2.95118446 10.1464466,3.14644661 Z" fill="' + iconsColor + '" fill-rule="nonzero"></path>\
        </g>\
    </svg>';

    var prevClass = t_store_pagination_getClass(opts, 't-store__pagination__item', 'prev');
    var nextClass = t_store_pagination_getClass(opts, 't-store__pagination__item', 'next');
    var separatorClass = t_store_pagination_getClass(opts, 't-store__pagination__item', 'separator');
    var btnStyle = opts.typo.descr;

    if (addStyles.bgColor) {
        btnStyle += ' border-color: ' + addStyles.bgColor + ';';
    }

    if (addStyles.borderRadius) {
        btnStyle += ' border-radius: ' + addStyles.borderRadius + ';';
    }

    if (!pagination) {
        str += '<div class="t-store__pagination" data-active-page="' + curPage + '" data-total-pages="' + totalPages + '">';
    }

    if (curPage !== 1) {
        str += '<div class="' + prevClass + '" style="' + btnStyle + '" data-control-type="prev">' + prev + '</div>';
    }

    var last = pagingRange.length - 1;
    for (var i = 0; i < pagingRange.length; i++) {
        var value = pagingRange[i];
        var isActive = value === curPage;

        var pageClass = t_store_pagination_getClass(opts, 't-store__pagination__item', 'page', isActive);

        // the first item
        if (i === 0 && value !== 1) {
            str += '<div class="' + pageClass + '" style="' + btnStyle + '" data-page-num="1">1</div>';
        }
        // separator
        if (i === 0 && value > 2) {
            str += '<div class="' + separatorClass + '" style="' + btnStyle + '">' + separator + '</div>';
        }
        // actual values from paging range
        str += '<div class="' + pageClass + '" style="' + btnStyle + '" data-page-num="' + value + '">' + value + '</div>';
        // separator
        if (i === last && pagingRange[last] < totalPages - 1) {
            str += '<div class="' + separatorClass + '" style="' + btnStyle + '">' + separator + '</div>';
        }
        // last item
        if (i === last && pagingRange[last] !== totalPages) {
            str += '<div class="' + pageClass + '" style="' + btnStyle + '" data-page-num="' + totalPages + '">' + totalPages + '</div>';
        }
    }

    if (curPage < totalPages) {
        str += '<div class="' + nextClass + '" style="' + btnStyle + '" data-control-type="next">' + next + '</div>';
    }

    if (!pagination) {
        str += '</div>';
    }

    return str;
}

function t_store_pagination_display(recid) {
    var rec = document.getElementById('rec' + recid);
    var gridContainer = rec.querySelector('.js-store-grid-cont');
    var pagination = rec.querySelector('.t-store__pagination');
    if (pagination && gridContainer.length) {
        var isMobileOneRow = gridContainer.classList.contains('t-store__grid-cont_mobile-one-row') && window.innerWidth < 960;
        if (isMobileOneRow) {
            pagination.style.display = 'none';
        } else {
            pagination.style.display = '';
        }
    }
}

function t_store_pagination_getClass(opts, className, type, isActive) {
    var sizeClass = opts.btnSize === 'sm' ? 'js-pagination-item_sm ' : '';
    var result = type === 'separator' ? className : 'js-pagination-item ' + sizeClass + className;

    if (isActive) {
        result += ' ' + className + '_active';
    }

    // type modificator
    result += ' ' + className + '_' + type;
    // common part
    result += ' t-descr t-descr_xxs';

    return result;
}

function t_store_pagination_getButtonStyles(opts) {
    var addStyles = opts.btn1_style.split(';');
    var bgColor = null;
    var borderRadius = null;
    var result = {};

    addStyles.forEach(function (style) {
        if (style.indexOf('background-color') === 0) {
            bgColor = style.replace('background-color:', '').trim();
        } else if (style.indexOf('border-radius') === 0) {
            borderRadius = style.replace('border-radius:', '').trim();
        }
    });

    if (bgColor) {
        result.bgColor = bgColor;
        var rgb = t_store_hexToRgb(bgColor);

        if (rgb) {
            var rgba = rgb;
            rgba.push(1);
            result.bgColorRgba = rgba;
        }
    }
    if (borderRadius) {
        result.borderRadius = borderRadius;
    }

    return result;
}

function t_store_pagination_addEvents(recid, opts) {
    var rec = document.getElementById('rec' + recid);
    var buttons = rec.querySelectorAll('.js-pagination-item');
    var pagination = rec.querySelector('.t-store__pagination');

    var addStyles = t_store_pagination_getButtonStyles(opts);
    var hoverColor = 'rgba(0, 0, 0, 0.05)';
    if (addStyles.bgColorRgba) {
        var opacity = 0.05;
        addStyles.bgColorRgba[addStyles.bgColorRgba.length - 1] = opacity;
        hoverColor = 'rgba(' + addStyles.bgColorRgba.join(', ') + ')';
    }

    Array.prototype.forEach.call(buttons, function (button) {
        button.addEventListener('mouseenter', function () {
            this.style.backgroundColor = hoverColor;
        });

        button.addEventListener('mouseleave', function () {
            this.style.backgroundColor = 'unset';
        });

        button.addEventListener('click', function () {
            var container = this.closest('.t-store__pagination');
            var pageNum = Number(this.getAttribute('data-page-num'));
            var activePage = Number(container.getAttribute('data-active-page'));
            var maxPage = Number(container.getAttribute('data-total-pages'));
            var isNext = this.getAttribute('data-control-type') === 'next';
            var isPrev = this.getAttribute('data-control-type') === 'prev';
            var slice = pageNum;

            if (!isNaN(pageNum) && pageNum == activePage) {
                return;
            }

            if (isNext) {
                slice = activePage + 1 <= maxPage ? activePage + 1 : maxPage;
            } else if (isPrev) {
                slice = activePage - 1 >= 1 ? activePage - 1 : 1;
            } else if (!isNaN(pageNum)) {
                slice = pageNum;
            }

            if (isNext || isPrev || !isNaN(pageNum)) {
                rec.querySelector('.js-store-grid-cont').innerHTML = '';
                t_store_showLoadersForProductsList(recid, opts);
                t_store_loadProducts('', recid, opts, slice);

                pagination.setAttribute('data-active-page', slice);
                pagination.setAttribute('data-total-pages', maxPage);
                // Update URL
                t_store_pagination_updateUrl(recid, opts, slice);

                var el_store = this.closest('.t-store');
                if (el_store) {
                    if (window.isIE) {
                        window.scrollTo(0, el_store.getBoundingClientRect().top + window.pageYOffset - 50);
                    } else {
                        window.scrollTo({
                            left: 0,
                            top: el_store.getBoundingClientRect().top + window.pageYOffset - 50,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });
}

function t_store_pagination_updateUrl(recid, opts, slice) {
    var params = window.tStoreCustomUrlParams || {};
    if (!params[recid]) {
        params[recid] = {};
    }

    params[recid].page = slice;
    if (slice == 1) {
        delete params[recid].page;
    }

    window.tStoreCustomUrlParams = params;
    t_store_paramsToObj_updateUrl(params);
}

function t_store_pagination_getPagingRange(current, min, total, length) {
    // Return paging range according to length
    var result = [];
    if (length > total) length = total;

    var start = current - Math.floor(length / 2);
    start = Math.max(start, min);
    start = Math.min(start, min + total - length);

    for (var i = 0; i < length; i++) {
        result.push(start + i);
    }

    return result;
}

function t_store_mobileHoriz_checkBtnVisibility(recid, opts) {
    t_store_mobileHoriz_hideLoadBtn(recid, opts);
    window.addEventListener('resize', t_throttle(function () {
        t_store_mobileHoriz_hideLoadBtn(recid, opts);
    }, 500));
}

function t_store_mobileHoriz_hideLoadBtn(recid, opts) {
    var rec = document.getElementById('rec' + recid);
    if (window.innerWidth < 960 && opts.hasMobileHorizScroll) {
        var loadMoreBtn = rec.querySelector('.js-store-load-more-btn');
        t_store__removeElement(loadMoreBtn);
    }
}

function t_store_get_storePartsControl_html(recid, opts) {
    var str = '';

    str += '<div class="t-store__parts-switch-wrapper t-align_center">';
    // add root part
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
    // add custom parts
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
    var titleRelevants = opts.titleRelevants ? opts.titleRelevants : t_store_dict('seeAlso');

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
    str += t_store_get_productPopup_closeIcon_html(opts);
    str += t_store_get_productPopup_closeText_html(opts);
    str += '<div class="' + popupClass + '" ' + containerStyle + '>';
    str += '<div>';
    str += '<div class="t-store__prod-popup__container">';
    str += '<div class="js-store-product js-product t-store__product-popup">';
    str += '<div class="t-store__prod-popup__slider js-store-prod-slider ' + sliderClass + '"></div>';
    str += '<div class="t-store__prod-popup__info ' + infoClass + '">';
    str += t_store_get_productPopup_titleText_html();
    str += '<div class="js-store-price-wrapper t-store__prod-popup__price-wrapper">';
    str += t_store_get_productPopup_onePrice_html(opts, 'current');
    str += t_store_get_productPopup_onePrice_html(opts, 'old');
    str += '</div>';
    str += '<div class="js-product-controls-wrapper"></div>';
    str += t_store_get_productPopup_linksSizeChart_html();
    str += t_store_get_productPopup_buyBtn_html(opts);
    str += t_store_get_productPopup_text_html();
    str += '</div>';
    str += '</div>';

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

function t_store_get_productPopup_linksSizeChart_html() {
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
        str += '<a href="#order" class="t-store__prod-popup__btn t-btn t-btn_sm" style="' + btnStyle + '">';
        str += '<table style="width:100%; height:100%;"><tr><td class="js-store-prod-popup-buy-btn-txt">';
        str += btnTitle;
        str += '</td></tr></table>';
        str += '</a>';
        str += '</div>';
    }

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
    str += '<div class="' + jsProdClass + ' t-store__prod-popup__price-value notranslate" translate="no"></div>';
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
    str += t_store_dict('sku') + ': ';
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

/*
    Used in the snippet only.
    old name function: t_store_checkCloseIconColor
*/
// eslint-disable-next-line no-unused-vars
function t_store_get_productPopup_closeIcon_color(recid, opts) {
    // Usefull function for snippet
    var iconFillColor = opts.popup_opts.iconColor ? opts.popup_opts.iconColor : '#000000';
    var bgColor = opts.popup_opts.overlayBgColorRgba ? t_store_removeRgbOpacity(opts.popup_opts.overlayBgColorRgba) : opts.popup_opts.containerBgColor;
    var containerFillColor = bgColor && bgColor.length ? bgColor : '#ffffff';

    if (opts.popup_opts.overlayBgColorRgba && !opts.popup_opts.iconColor) {
        // We have to use overlay color (not container bg color) because we use this as popup head on desktop
        // If overlay bg color is defined and icon color is not, guess icon color to match overlay bg color

        var color = t_store_removeRgbOpacity(opts.popup_opts.overlayBgColorRgba);
        iconFillColor = t_store_luma_rgb(color);
    }

    var rec = document.getElementById('rec' + recid);
    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
    var wrapper = isSnippet ?
        rec.querySelector('.t-store__prod-snippet__container') :
        rec.querySelector('.t-popup');

    var el_close = wrapper.querySelector('.t-popup__close');
    el_close.style.backgroundColor = containerFillColor;

    var el_icon_cross = wrapper.querySelector('.t-popup__close-icon_cross');
    if (isSnippet && !opts.popup_opts.iconColor || Math.abs(t_store_getLightnessColor(iconFillColor) - t_store_getLightnessColor(t_store_removeRgbOpacity(containerFillColor))) > 0.1) {
        var color = t_store_removeRgbOpacity(opts.popup_opts.containerBgColor) || 'rgb(0,0,0)';
        el_icon_cross.querySelector('g').setAttribute('fill', t_store_luma_rgb(color));
    } else {
        el_icon_cross.querySelector('g').setAttribute('fill', iconFillColor);
    }

    var el_icon_arrow = wrapper.querySelector('.t-popup__close-icon_arrow');
    el_icon_arrow.querySelector('path').setAttribute('fill', iconFillColor);
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
    var isMobileOneRow = window.innerWidth < 960 && rec.querySelector('.js-store-grid-cont.t-store__grid-cont_mobile-one-row')[0] ? true : false;
    var className = isMobileOneRow ? ' t-store__load-more-btn-wrap_hidden ' : '';

    var btnSizeClass = opts.btnSize === 'sm' ? 't-btn_xs' : 't-btn_sm';
    str += '<div class="t-store__load-more-btn-wrap t-align_center' + className + '">';
    str += '    <div class="js-store-load-more-btn t-store__load-more-btn t-btn ' + btnSizeClass + '" style="' + opts.btn1_style + 'display:none;">';
    str += '        <table style="width:100%; height:100%;"><tr><td>' + t_store_dict('loadmore') + '</td></tr></table>';
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_get_handIcon_html(recid) {
    var str = '';
    var rec = document.getElementById('rec' + recid);
    var size = '42';
    var cardFill = 'rgba(190,190,190,0.3)';
    var handFill = 'rgba(190,190,190,1)';
    var blendMode = 'mix-blend-mode: multiply;';

    var blockColor = rec.getAttribute('data-bg-color');
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
        // temporary disable animation for catalog products, because it doesnt work on slow 3G connection need to fix it in tilda-animation-1.0.js
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

    var url = t_store_get_productCard_link(opts.prodCard.btnLink1, product, isRelevantsShow, rec);
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

    var isT973MainSlider = (rec.getAttribute('data-record-type') === '973' && !isRelevantsShow);
    var needRelevantsSlider = isRelevantsShow && opts.relevants_slider && (productsArr.length > blocksInRowForRelevant || window.innerWidth <= 960);
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

    str += opts.prodCard.hasWrap ?
        t_store_get_productCard_wrapperStructure(product, edition, opts, link, isRelevantsShow, rec) :
        t_store_get_productCard_simpleStructure(product, edition, opts, link, isRelevantsShow, rec);
    str += '</div>';

    if (needRelevantsSlider || isT973MainSlider) {
        str += '</div>';
        str += '</div>';
    }

    return str;
}

function t_store_get_productCard_simpleStructure(product, edition, opts, link, isRelevantsShow, rec) {
    var controlsStyle = opts.prodCard.showOpts ? '' : 'style="display:none;"';
    var strImg = t_store_get_productCard_img_html(product, opts);
    var str = '';
    str += link.open;
    str += '    ' + strImg;
    str += '    ' + t_store_get_productCard_txtAndPrice_html(product, edition, opts, strImg);
    str += link.close;
    str += '<div class="js-product-controls-wrapper t-store__card__prod-controls-wrapper" ' + controlsStyle + '></div>';
    str += t_store_get_productCard_btn_html(product, edition, opts, isRelevantsShow, rec);
    return str;
}

function t_store_get_productCard_wrapperStructure(product, edition, opts, link, isRelevantsShow, rec) {
    var str = '';
    var wrapStyles = t_store_get_productCard_getWrapperStylesStr(opts);
    var controlsStyle = opts.prodCard.showOpts ? '' : 'style="display:none;"';
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
    str += '        ' + t_store_get_productCard_btn_html(product, edition, opts, isRelevantsShow, rec);
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

function t_store_get_productCard_img_html(product, opts, curImage) {
    var str = '';
    var mobileNoPaddingClass = opts.hasOriginalAspectRatio && !opts.isHorizOnMob ? 't-store__card__imgwrapper_original-ratio' : '';
    var wrapperClassStr = 't-store__card__imgwrapper ' + mobileNoPaddingClass + (opts.isFlexCols ? ' ' + opts.imageRatioClass : '');

    var wrapperStyle = opts.imageHeight && !opts.isFlexCols ? 'padding-bottom:' + (parseInt(opts.imageHeight, 10) * 100) / (opts.colWidth || 360) + '%;' : '';

    if (opts.hasOriginalAspectRatio && opts.prodCard.borderRadius) {
        var size = parseInt(opts.prodCard.borderRadius, 10);
        wrapperStyle += 'border-radius:' + size + 'px ' + size + 'px 0px 0px; overflow: hidden;';
    }

    var hoverImgEl = t_store_get_productCard_imgElHover_html(product, opts, curImage);
    var hasHover = opts.imageHover && hoverImgEl;

    var fieldAttrStrName = opts.hasOriginalAspectRatio ? 'imgfield' : 'bgimgfield';
    var imgFieldAttr = product.editions.length === 1 ? fieldAttrStrName + '="st_gallery__' + product.uid + ':::0"' : '';
    var imgEl;

    var imgSrc = curImage ? curImage : t_store_getProductFirstImg(product);

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
        str += '<div class="' + wrapperClassStr + '" ' + 'style="' + wrapperStyle + '">';
        str += '    ' + t_store_get_productCard_mark_html(product, opts);
        str += '    ' + imgEl;
        str += '    ' + (opts.imageHover ? hoverImgEl : '');
        str += '</div>';
        return str;
    } else {
        return '';
    }
}

function t_store_get_productCard_img_replaceWith(product, el_product, opts, curImage) {
    var el_image = el_product.querySelector('.t-store__card__imgwrapper');
    var el_newImage = t_store_get_productCard_img_html(product, opts, curImage);

    if (el_image) {
        el_image.outerHTML = el_newImage;
    }

    if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        t_store_onFuncLoad('t_lazyload_update', function () {
            t_lazyload_update();
        });
    }
    document.body.dispatchEvent(new Event('twishlist_addbtn'));
}

function t_store_get_productCard_imgElHover_html(product, opts, curtImg) {
    if (product.gallery && product.gallery[0] === '[') {
        var galleryArr = JSON.parse(product.gallery);
        if (typeof galleryArr[1] !== 'undefined') {
            var imgSrc = galleryArr[1].img;
            // if current image is passed to the function find another unique image in gallery to show on hover
            if (curtImg && curtImg.length) {
                for (var i = 0; i < galleryArr.length; i++) {
                    var img = galleryArr[i].img;
                    if (img !== curtImg) {
                        imgSrc = img;
                        break;
                    }
                }
            }

            var stylesStr = t_store_get_productCard_getImgStyles(opts);
            return opts.hasOriginalAspectRatio ?
                '<img ' + t_store_getLazySrc(opts, imgSrc) + ' class="t-store__card__img t-store__card__img_second t-img"/>' :
                '<div class="t-store__card__bgimg_second t-bgimg" data-original="' +
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
        return 'border-radius:' + size + 'px ' + size + 'px 0px 0px; ' + (size > 0 ? 'top: -2px;' : '');
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
    str += '<div class="t-store__card__mark" ' + style + '>';
    str += product.mark;
    str += '</div>';
    str += '</div>';
    return str;
}

function t_store_get_productCard_txtAndPrice_html(product, edition, opts, strImg) {
    var str = '';
    var removePadStyle = strImg === '' ? 'style="padding-top:0px;"' : '';
    str += '<div class="t-store__card__textwrapper" ' + removePadStyle + '>';
    str += t_store_get_productCard_txt_html(product, edition, opts);
    if (!Object.prototype.hasOwnProperty.call(opts.price, 'position') || opts.price.position == '') {
        str += t_store_get_productCard_Price_html(product, edition, opts);
    }
    str += '</div>';
    return str;
}

function t_store_get_productCard_txt_html(product, edition, opts) {
    var str = '';
    var typoClass = '';
    if (Object.prototype.hasOwnProperty.call(opts.price, 'position') && opts.price.position == 'at') {
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
    if (Object.prototype.hasOwnProperty.call(opts.price, 'position') && opts.price.position == 'bt') {
        str += t_store_get_productCard_Price_html(product, edition, opts);
    }

    if (edition.sku) {
        var skuVisCss = opts.prodCard.showOpts ? '' : 'display:none;';
        var skuColor = opts.typo.descrColor ? 'color:' + opts.typo.descrColor + ';' : '';
        var skuStyle = 'style="' + skuVisCss + skuColor + '"';
        var skuFieldAttr = product.editions.length === 1 ? 'field="st_sku__' + edition.uid + '" data-redactor-toolbar="no"' : '';
        str += '<div class="t-store__card__sku t-descr t-descr_xxs" ' + skuStyle + '>';
        str += t_store_dict('sku') + ': ';
        str += '<span class="js-store-prod-sku js-product-sku" ' + skuFieldAttr + '>';
        str += edition.sku;
        str += '</span>';
        str += '</div>';
    }
    if (product.descr) {
        var descrFieldAttr = product.editions.length === 1 ? 'field="st_descr__' + edition.uid + '" data-redactor-toolbar="no"' : '';
        str += '<div class="js-store-prod-descr t-store__card__descr t-descr t-descr_xxs" style="' + opts.typo.descr + '" ' + descrFieldAttr + '>';
        str += product.descr;
        str += '</div>';
    }
    return str;
}

function t_store_get_productCard_Price_html(product, edition, opts) {
    var str = '';
    var modifier = '';
    var formattedPriceRange = t_store__getFormattedPriceRange(opts, product);

    if (Object.prototype.hasOwnProperty.call(opts.price, 'position')) {
        if (opts.price.position == 'at') {
            modifier = ' t-store__card__price-wrapper_above-title';
        } else if (opts.price.position == 'bt') {
            modifier = ' t-store__card__price-wrapper_below-title';
        }
    }

    str += '<div class="js-store-price-wrapper t-store__card__price-wrapper' + modifier + '">';
    str += t_store_get_productCard_onePrice_html(product, edition, opts, 'current');
    // Don't draw old price whenever price range is shown
    if (!formattedPriceRange) {
        str += t_store_get_productCard_onePrice_html(product, edition, opts, 'old');
    }
    str += (parseInt(edition.quantity, 10) === 0 ? t_store_get_soldOutMsg_html() : '');
    str += '</div>';
    return str;
}

function t_store_get_productCard_onePrice_html(product, edition, opts, type) {
    var value = type === 'current' ? edition.price : edition.priceold;
    var formattedPrice = t_store__getFormattedPrice(opts, value);
    var formattedPriceRange = t_store__getFormattedPriceRange(opts, product);
    formattedPrice = formattedPriceRange ? formattedPriceRange : formattedPrice;
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
    if (formattedPriceRange) {
        jsProdClass += ' js-store-prod-price-range-val';
    }

    str += '<div class="' + priceStylingClass + ' t-store__card__price-item t-name t-name_xs" ' + styleAttr + '>';
    if (!formattedPriceRange) {
        str += (opts.currencySide !== 'r' && currency ? currency : '');
    }
    str += '<div class="' + jsProdClass + ' t-store__card__price-value notranslate" translate="no" ' + priceFieldAttr + '>' + formattedPrice + '</div>';
    if (!formattedPriceRange) {
        str += (opts.currencySide === 'r' && currency ? currency : '');
    }

    if (product.portion > 0) {
        str += '<div class="t-store__prod__price-portion"><span class="t-store__prod__price-portion-slash">/</span>';
        if (product.portion !== '1') {
            str += +product.portion + ' ';
        }
        str += t_store_dict(product.unit) + '</div>';
    }

    str += '</div>';
    return str;
}

function t_store_get_productCard_btn_html(product, edition, opts, isRelevantsShow, rec) {
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
        link = t_store_get_productCard_link(opts.prodCard.btnLink1, product, isRelevantsShow, rec);
        linkTarget = t_store_get_productCard_targetAttr(opts.prodCard.btnLink1, product);

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
        link = t_store_get_productCard_link(opts.prodCard.btnLink2, product, isRelevantsShow, rec);
        linkTarget = t_store_get_productCard_targetAttr(opts.prodCard.btnLink2, product);

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

function t_store_get_productCard_link(link, product, isRelevantsShow, rec) {
    if (rec[0]) {
        var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
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
    var rec = document.getElementById('rec' + recid);

    // separately product cards and relevant product cards in a popup
    ['.t-store__grid-cont .t-store__card', '.t-popup__container .t-store__card'].forEach(function (el) {
        var cards = rec.querySelector(el);
        if (cards) {
            var blocksPerRow = t_store_unifyCardsHeights_getBlocksInRow(opts, cards);

            if (window.innerWidth <= 480 && !opts.isHorizOnMob) {
                rec.querySelector('.t-store__card__wrap_txt-and-btns').style.height = 'auto';
                return;
            }

            for (var i = 0; i < cards.length; i += blocksPerRow) {
                var maxH = 0;
                var rowCards = cards.slice(i, i + blocksPerRow).querySelector('.t-store__card__wrap_txt-and-btns');

                Array.prototype.forEach.call(rowCards, function (card) {
                    var txt = card.querySelector('.store__card__wrap_txt-and-opts');
                    var btns = card.querySelector('.t-store__card__btns-wrapper');
                    var height = txt.outerHeight() + btns.outerHeight();

                    if (height > maxH) {
                        maxH = height;
                    }
                });

                rowCards.style.height = maxH;
            }
        }
    });
}

function t_store_unifyCardsHeights_getBlocksInRow(opts, cards) {
    if (window.innerWidth <= 960 && opts.isHorizOnMob) {
        return cards.length;
    } else if (window.innerWidth <= 960) {
        return 2;
    } else {
        return parseInt(opts.blocksInRow, 10);
    }
}

function t_store_get_soldOutMsg_html() {
    return '<div class="js-store-prod-sold-out t-store__card__sold-out-msg t-name t-name_xs">' + t_store_dict('soldOut') + '</div>';
}

function t_store_initPopup(recid, obj_products, options, isRelevantsShow, obj) {
    if (!isRelevantsShow) {
        window.localStorage.setItem('urlBeforePopupOpen', window.location.href);
    }

    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));

    for (var productKey in obj_products) {
        var rec = document.getElementById('rec' + recid);
        var productNode = isRelevantsShow ?
            rec.querySelector('.js-product-relevant[data-product-gen-uid="' + productKey + '"]') :
            rec.querySelector('[data-product-gen-uid="' + productKey + '"]');

        // Replace #prodpopup to absolute link
        var prodPopups = productNode.querySelectorAll('[href^="#prodpopup"]');
        Array.prototype.forEach.call(prodPopups, function (prodpopup) {
            prodpopup.removeEventListener('click', popupClickEvent);

            var el_prodItem = productNode.closest('.js-product');
            var lid_prod = el_prodItem.getAttribute('data-product-gen-uid');
            var productObj = obj_products[lid_prod];
            if (productObj !== undefined) {
                prodpopup.setAttribute('href', productObj.url);
            }

            var popupClickEvent = function (e) {
                e.preventDefault();
                if (e.target.closest('.t1002__addBtn')) {
                    return;
                }
                el_prodItem = this.closest('.js-product');
                lid_prod = el_prodItem.getAttribute('data-product-gen-uid');

                productObj = obj_products[lid_prod];

                var ctrlKey = e.ctrlKey;
                var cmdKey = e.metaKey && navigator.platform.indexOf('Mac') !== -1;
                if (ctrlKey || cmdKey) {
                    window.open(productObj.url);
                    return;
                }

                if ((obj.header || obj.footer) && obj.disablepopup) {
                    location.href = productObj.url;
                } else {
                    isRelevantsShow ?
                        t_store_openProductPopup(recid, options, productObj, isRelevantsShow, false, true) :
                        t_store_openProductPopup(recid, options, productObj, isRelevantsShow, false, false);
                }
            };

            if (!isSnippet) {
                prodpopup.addEventListener('click', popupClickEvent);
            }
        });
    }

    if (options.isPublishedPage) {
        setTimeout(function () {
            t_store_checkUrl(options, recid);
        }, 300);
    }

    t_store_copyTypographyFromLeadToPopup(recid, options);
}

function t_store_openProductPopup(recid, opts, productObj, isRelevantsShow, fromHistory, fromPopup) {
    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
    if (!isSnippet) {
        t_store_open_popup_routing_init(recid, opts);
    }
    var showRelevants = opts.showRelevants;
    var rec = document.getElementById('rec' + recid);
    var el_popup = rec.querySelector('.t-popup');
    if (el_popup) {
        t_store_drawProdPopup(recid, el_popup, productObj, opts, fromPopup);
    }
    t_store_showPopup(recid, fromHistory, fromPopup);

    try {
        if (Tilda && typeof Tilda.sendEcommerceEvent == 'function') {
            Tilda.sendEcommerceEvent('detail', [{
                id: '' + (productObj.id ? productObj.id : productObj.uid),
                uid: '' + productObj.uid,
                price: '' + (productObj.price_min ? productObj.price_min : productObj.price),
                sku: productObj.sku ? productObj.sku : '',
                name: productObj.title,
            }]);
        }

        // read title for analytics, when we add data to popup
        var analytics = el_popup.getAttribute('data-track-popup');
        if (analytics > '') {
            var virtTitle = 'Popup: ' + productObj.title;

            Tilda.sendEventToStatistics(analytics, virtTitle, '', 0);
        }
    } catch (e) {
        /* */
    }

    if (opts.isPublishedPage && !fromHistory) {
        t_store_changeUrl(recid, productObj, isRelevantsShow, opts);
    }

    if (rec.getAttribute('data-record-type') === '973') {
        t_slds_updateSlider(recid + ' .js-store-product');
    } else {
        t_slds_updateSlider(recid);
    }

    // TODO: move code into function
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

    if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        t_store_popup_updLazyOnScroll(recid);
    }

    // create quantity input for popup
    if (opts.showStoreBtnQuantity === 'both' || opts.showStoreBtnQuantity === 'popup') {
        var el_product = document.querySelector('#rec' + recid + ' .t-popup .js-store-product');
        t_store_addProductQuantity(recid, el_product, productObj, opts);
    }

    t_store_hoverZoom_init(recid);

    // update animation after transition: opacity ease-in-out .3s
    setTimeout(function () {
        t_store_onFuncLoad('t_animate__setAnimationStateChains', function () {
            // animChainsBlocks contains elements, which are animated as a chain, row by row
            var allBlocks = document.querySelectorAll('.r');
            var animChainsBlocks = [];
            Array.prototype.forEach.call(allBlocks, function (block) {
                if (block.querySelector('.t-animate[data-animate-chain=yes]')) {
                    // TODO: jQuery
                    // eslint-disable-next-line no-jquery/no-jquery-constructor
                    animChainsBlocks.push($(block));
                }
            });
            if (animChainsBlocks.length) {
                // eslint-disable-next-line no-jquery/no-jquery-constructor, no-jquery/no-map-util
                t_animate__setAnimationStateChains($($.map(animChainsBlocks, function (el) {
                    return el.get();
                })));
            }
        });
    }, 300);
}

function t_store_addProductQuantity(recid, el_product, product, options) {
    if (el_product instanceof jQuery) {
        if (el_product.length === 0) {
            return;
        }
        el_product = el_product[0];
    }
    var popupButton = el_product.querySelector('.t-store__prod-popup__btn-wrapper a[href="#order"]:not(.t-store__prod-popup__btn_disabled)');
    var cardButton = el_product.querySelector('.t-store__card__btns-wrapper a[href="#order"]:not([style*="display: none"])');
    var quantity = parseInt(product.quantity, 10);

    if (isNaN(quantity)) {
        if (product.editions !== undefined) {
            var firstAvailabeEdition = t_store_product_getFirstAvailableEditionData(product.editions);
            quantity = parseInt(firstAvailabeEdition.quantity, 10);
        }
    }

    if (!cardButton && !popupButton || (quantity == 0 || quantity == 1) || options.showStoreBtnQuantity === '' || options.showStoreBtnQuantity === undefined) {
        var quantityBtns = el_product.querySelector('.t-store__prod__quantity');
        if (quantityBtns) {
            quantityBtns.parentNode.classList.remove('t-store__card__btns-wrapper--quantity');
            t_store__removeElement(quantityBtns);
        }
        return;
    }

    if ((options.showStoreBtnQuantity === 'list' && el_product.classList.contains('t-store__card')) ||
        (options.showStoreBtnQuantity === 'popup' && el_product.classList.contains('t-store__product-snippet')) ||
        (options.showStoreBtnQuantity === 'popup' && el_product.classList.contains('t-store__product-popup')) ||
        options.showStoreBtnQuantity === 'both'
    ) {
        // default parameters not compatibility with IE
        if (options === undefined) {
            options = {};
        }

        // find quantity
        var quantityBtns = el_product.querySelector('.t-store__prod__quantity');
        if (quantityBtns) {
            var input = quantityBtns.querySelector('.t-store__prod__quantity-input');

        }

        // create quantity
        if (!quantityBtns) {
            var str = '';
            var btnStyle = options.btn1_style;
            var quantityBorderRadius = '';
            var classSize = '';

            if (el_product.classList.contains('t-store__card')) {
                classSize = '';
                if (options.btnSize === 'sm') {
                    classSize = 't-store__prod__quantity_xs';
                }
            }

            if (btnStyle !== '' && btnStyle !== undefined) {
                var position = btnStyle.indexOf('border-radius');
                if (position !== -1) {
                    var endPosition = btnStyle.slice(position).indexOf(';');
                    quantityBorderRadius = btnStyle.slice(position + 14, position + endPosition);
                }
            }

            var borderRadius = '';
            if (quantityBorderRadius !== '') {
                borderRadius = 'border-radius:' + quantityBorderRadius + ';';
            }

            str += '<div class="t-store__prod__quantity ' + classSize + '" style="' + borderRadius + '">';
            str += '<div class="t-store__prod__quantity__minus-wrapper">';
            str += '<span class="t-store__prod__quantity__minus"></span>';
            str += '</div>';
            str += '<input class="t-store__prod__quantity-input t-descr t-descr_xxs" type="number" min="1" max="9999" step="1" value="1" size="4" maxlength="4" />';
            str += '<div class="t-store__prod__quantity__plus-wrapper">';
            str += '<span class="t-store__prod__quantity__plus"></span>';
            str += '</div>';
            str += '</div>';

            if (popupButton) {
                popupButton.insertAdjacentHTML('beforebegin', str);
            } else if (cardButton) {
                cardButton.insertAdjacentHTML('beforebegin', str);
            }

            // init events
            t_store_addProductQuantityEvents(el_product);

            // find new input
            quantityBtns = el_product.querySelector('.t-store__prod__quantity');
            input = quantityBtns.querySelector('.t-store__prod__quantity-input');

            if (cardButton) {
                var btnsWrapper = cardButton.parentNode;
                btnsWrapper.classList.add('t-store__card__btns-wrapper--quantity');
                if (btnsWrapper.querySelectorAll('a:not([href^="#order"])').length > 0 && Element.prototype.matches.call(btnsWrapper.parentNode, 'div[class]')) {
                    // To be safe, need to specify the class of parent, e.g. `.t-store__card__btns-wrapper`
                    var parent = btnsWrapper.parentNode;
                    var div = document.createElement('div');
                    div.appendChild(btnsWrapper);
                    if (parent) {
                        parent.appendChild(div);
                    }
                }
            }
        } else {
            // set default
            var min = input.min || 1;
            input.value = min;
            // update input, if max is changed
            input.dispatchEvent(new Event('change'));
            var value = input.value;

            if (isNaN(quantity)) {
                quantityBtns.classList.remove('t-store__prod-popup__btn_disabled');
            } else if (quantity > 1) {
                quantityBtns.classList.remove('t-store__prod-popup__btn_disabled');
                if (parseInt(value, 10) === 0) {
                    input.value = min;
                }
            } else {
                quantityBtns.classList.add('t-store__prod-popup__btn_disabled');
            }
        }

        if (input) {
            // set max quantity
            if (isNaN(quantity)) {
                input.max = 9999;
            } else if (quantity > 0) {
                input.max = quantity;
            }
        }
    }
}

function t_store_addProductQuantityEvents(product) {
    if (product instanceof jQuery) {
        if (product.length === 0) {
            return;
        }
        product = product[0];
    }
    var quantityBtns = product.querySelector('.t-store__prod__quantity');
    if (quantityBtns) {
        var input = quantityBtns.querySelector('.t-store__prod__quantity-input');

        var quantityMinusClickEvent = function () {
            input.stepDown();
        };
        var quantityMinusWrapper = product.querySelector('.t-store__prod__quantity__minus-wrapper');
        if (quantityMinusWrapper) {
            quantityMinusWrapper.removeEventListener('click', quantityMinusClickEvent);
            quantityMinusWrapper.addEventListener('click', quantityMinusClickEvent);
        }

        var quantityPlusClickEvent = function () {
            input.stepUp();
        };
        var quantityPlusWrapper = product.querySelector('.t-store__prod__quantity__plus-wrapper');
        if (quantityPlusWrapper) {
            quantityPlusWrapper.removeEventListener('click', quantityPlusClickEvent);
            quantityPlusWrapper.addEventListener('click', quantityPlusClickEvent);
        }

        var quantityInputChangeEvent = function () {
            var min = input.min || 1;
            var max = input.max || 9999;
            var value = parseInt(input.value || 1, 10);
            if (value < 1 || isNaN(value)) {
                input.value = min;
            } else if (value > max) {
                input.value = max;
            } else {
                input.value = value;
            }
        };
        var quantityInput = product.querySelector('.t-store__prod__quantity-input');
        if (quantityInput) {
            quantityInput.removeEventListener('change', quantityInputChangeEvent);
            quantityInput.addEventListener('change', quantityInputChangeEvent);
        }
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
    // need to update lazy on scroll in popup
    var scrollContainer = document.querySelector('#rec' + recid + ' .t-popup');
    var curMode = document.getElementById('allrecords').getAttribute('data-tilda-mode');

    if (scrollContainer.length && curMode != 'edit' && curMode != 'preview') {
        scrollContainer.addEventListener('scroll', t_throttle(function () {
            if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
                t_store_onFuncLoad('t_lazyload_update', function () {
                    t_lazyload_update();
                });
            }
        }, 1000));
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
        t_store_history_pushState({
            productData: productData
        }, newPageTitle, newUrl);
    } else if (isRelevantsShow) {
        // for relevants
        newUrl = t_store_generateUrl(product);
        t_store_history_pushState({
            productData: productData
        }, newPageTitle, newUrl);
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
    el_popup.scrollTop = 0;
    var el_product = el_popup.querySelector('.js-store-product.js-product');
    el_product.setAttribute('cardSize', 'large');
    t_store_drawProdPopup_drawGallery(recid, el_popup, product, options);
    if (!window.t_store__defPackObj) {
        window.t_store__defPackObj = {};
    }
    var storeProduct = el_popup.querySelector('.js-store-product');
    storeProduct.setAttribute('data-product-lid', product.uid);
    storeProduct.setAttribute('data-product-uid', product.uid);
    storeProduct.setAttribute('data-product-gen-uid', product.uid);

    var storeProdName = el_popup.querySelector('.js-store-prod-name');
    if (product.title) {
        storeProdName.innerHTML = product.title;
        storeProdName.style.display = '';
    } else {
        storeProdName.innerHTML = '';
        storeProdName.style.display = 'none';
    }

    var partuids = [];
    try {
        partuids = JSON.parse(product.partuids);
    } catch (e) {
        /* */
    }

    // links for size chart
    if (options.linksSizeChart !== undefined && partuids.length > 0) {
        var str = '';
        var linksAdded = [];
        for (var i = 0; i < partuids.length; i++) {
            var uid = partuids[i];
            if (options.linksSizeChart[uid] !== undefined) {
                if (options.linksSizeChart[uid].infotext !== undefined && options.linksSizeChart[uid].infourl !== undefined) {
                    if (linksAdded.indexOf(options.linksSizeChart[uid].infourl) === -1) {
                        str += '<div class="t-store__prod-popup__link t-descr t-descr_xxs">';
                        str += '<a href="' + options.linksSizeChart[uid].infourl.replace(/"/g, '&quot;') + '" target="_blank">';
                        str += options.linksSizeChart[uid].infotext;
                        str += '</a>';
                        str += '</div>';

                        linksAdded.push(options.linksSizeChart[uid].infourl);
                    }
                }
            }
        }
        el_popup.querySelector('.t-store__prod-popup__links-wrapper').innerHTML = str;
    } else {
        el_popup.querySelector('.t-store__prod-popup__links-wrapper').innerHTML = '';
    }

    t_store_initTextAndCharacteristics(el_popup, product);
    // Draw tabs
    if (options.tabs && options.tabs !== '') {
        t_store_tabs_init(recid, options, product, el_product, el_popup);
    }

    t_store_addProductOptions(recid, product, el_product, options);
    t_store_option_handleOnChange_custom(recid, el_product, options);
    t_prod__initProduct(recid, el_product);

    window.t_store_prodPopup_updateGalleryThumbsEvent = function () {
        t_store_prodPopup_updateGalleryThumbs(recid, el_popup, product, options);
    };
    if (fromPopup) {
        window.removeEventListener('resize', window.t_store_prodPopup_updateGalleryThumbsEvent);
    }
    window.addEventListener('resize', window.t_store_prodPopup_updateGalleryThumbsEvent);
}

function t_store_initTextAndCharacteristics(el_popup, product) {
    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
    var el_prodTxt = el_popup.querySelector('.js-store-prod-text');
    while (el_prodTxt.firstChild) {
        el_prodTxt.removeChild(el_prodTxt.firstChild);
    }
    el_prodTxt.style.display = 'none';

    var pack_label = product.pack_label || '',
        pack_m = parseInt(product.pack_m, 10) || 0,
        pack_x = parseInt(product.pack_x, 10) || 0,
        pack_y = parseInt(product.pack_y, 10) || 0,
        pack_z = parseInt(product.pack_z, 10) || 0,
        productUrl = product.url || '';

    var isDimentions = pack_label && pack_x && pack_y && pack_z;
    var isWeight = pack_m;
    var isCharcs =
        (product.characteristics && product.characteristics.length > 0) ||
        (isDimentions || isWeight);

    var isDescriptionDrawn = true;
    var isCharsDrawn = isCharcs;

    // If any tab contains description or product characteristics, hide it in product overview
    var el_tabDescr = el_popup.querySelectorAll('.t-store__tabs__item[data-tab-type="text"]');
    if (el_tabDescr.length) {
        isDescriptionDrawn = false;
    }

    var el_tabCharcs = el_popup.querySelectorAll('.t-store__tabs__item[data-tab-type="chars"]');
    if (el_tabCharcs.length) {
        isCharsDrawn = false;
    }

    var prodTxt = '<div class="js-store-prod-all-text"' + (!isDescriptionDrawn ? ' style="display: none;"' : '') + '>';
    prodTxt += product.text ? product.text : product.descr ? product.descr : '';
    prodTxt += '</div>';

    var charcsStyle = isDescriptionDrawn ? 'margin-top: 20px;' : '';
    charcsStyle += !isCharsDrawn ? 'display: none;' : '';
    var charcsTxt = '<div class="js-store-prod-all-charcs"' + (charcsStyle.length ? ' style="' + charcsStyle + '"' : '') + '>';
    if (isCharcs) {
        product.characteristics.forEach(function (ch) {
            charcsTxt += '<p class="js-store-prod-charcs">' + ch.title + ': ' + ch.value + '</p>';
        });
    }

    // draw characteristics
    // add 'dimensions' & 'weight' always
    charcsTxt += '<p class="js-store-prod-dimensions"></p>';
    charcsTxt += '<p class="js-store-prod-weight"></p>';
    charcsTxt += '</div>';
    el_prodTxt.insertAdjacentHTML('beforeend', prodTxt);
    el_prodTxt.insertAdjacentHTML('beforeend', charcsTxt);
    el_prodTxt.style.display = '';

    // Redraw dimensions and weight if corresponding tab exists in snippet
    if (isSnippet && el_tabCharcs.length) {
        Array.prototype.forEach.call(el_tabCharcs, function (tabCharc) {
            var el_charcsContent = tabCharc.querySelector('.t-store__tabs__content');
            while (el_charcsContent.firstChild) {
                el_charcsContent.removeChild(el_charcsContent.firstChild);
            }
            el_charcsContent.insertAdjacentHTML('beforeend', charcsTxt);
            el_charcsContent.querySelector('.js-store-prod-all-charcs').style.display = '';
            el_charcsContent.querySelector('.js-store-prod-all-charcs').style.marginTop = 0;
        });
    }

    // add dimension if != 0
    if (isDimentions) {
        var dimension = pack_x + 'x' + pack_y + 'x' + pack_z;
        var fullDimension = t_store_dict('product-' + pack_label) + ': ' + dimension + '&nbsp;' + t_store_dict('mm');
        el_popup.querySelector('.js-store-prod-dimensions').innerHTML = fullDimension;

        if (isSnippet) {
            Array.prototype.forEach.call(el_tabCharcs, function (tabCharc) {
                tabCharc.querySelector('.js-store-prod-dimensions').innerHTML = fullDimension;
            });

            el_popup.setAttribute('data-product-pack-label', pack_label);
            el_popup.setAttribute('data-product-pack-x', pack_x);
            el_popup.setAttribute('data-product-pack-y', pack_y);
            el_popup.setAttribute('data-product-pack-z', pack_z);
        }
    }

    // add weight if != 0
    if (isWeight) {
        var fullWeight = t_store_dict('product-weight') + ': ' + pack_m + '&nbsp;' + t_store_dict('g');
        el_popup.querySelector('.js-store-prod-weight').innerHTML = fullWeight;

        if (isSnippet) {
            if (el_tabCharcs.length) {
                el_tabCharcs.querySelector('.js-store-prod-weight').innerHTML = fullWeight;
            }
            el_popup.setAttribute('data-product-pack-m', pack_m);
        }
    }

    // add data attributes for characteristics
    var storeProduct = el_popup.querySelector('.js-store-product');
    if (storeProduct) {
        storeProduct.setAttribute('data-product-pack-label', pack_label);
        storeProduct.setAttribute('data-product-pack-m', pack_m);
        storeProduct.setAttribute('data-product-pack-x', pack_x);
        storeProduct.setAttribute('data-product-pack-y', pack_y);
        storeProduct.setAttribute('data-product-pack-z', pack_z);
        storeProduct.setAttribute('data-product-url', productUrl);
    }
}

function t_store_addProductOptions(recid, product, el_product, options) {
    if (el_product instanceof jQuery) {
        if (el_product.length === 0) {
            return;
        }
        el_product = el_product[0];
    }

    var optionsWrapper = el_product.querySelector('.js-product-controls-wrapper');
    optionsWrapper.innerHTML = '';
    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
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
    var param1 = {
        name: product.prod_option,
        values: product.prod_variants
    };
    var param2 = {
        name: product.prod_option2,
        values: product.prod_variants2
    };
    var param3 = {
        name: product.prod_option3,
        values: product.prod_variants3
    };
    var param4 = {
        name: product.prod_option4,
        values: product.prod_variants4
    };
    var param5 = {
        name: product.prod_option5,
        values: product.prod_variants5
    };
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
    str += '<div class="js-product-option-name t-product__option-title t-descr t-descr_xxs" ' + styleAttr + '>[[name]]</div>';
    str += '<div class="t-product__option-variants t-product__option-variants_regular"> <select class="js-product-option-variants t-product__option-select t-descr t-descr_xxs"> [[optiontags]] </select> </div>';
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

    //  Hide custom selects and restyle later
    var isCustomOption = t_store_option_checkIfCustom(curOption);
    var optionStyle = isCustomOption ? ' style="display: none;"' : '';

    //  Store custom select attributes (not used currently)
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
    str += '<div class="js-product-edition-option-name t-product__option-title t-descr t-descr_xxs" ' + styleAttr + '>[[name]]</div>';
    str += '<div class="t-product__option-variants t-product__option-variants_regular"' + optionStyle + '> <select class="js-product-edition-option-variants t-product__option-select t-descr t-descr_xxs"> [[optiontags]] </select> </div>';
    str += '</div>';

    return str;
}

function t_store_option_styleCustomControl(recid, options, curOption, optionsWrapper, firstAvailabeEdition) {
    var str = '';
    var wrapper = optionsWrapper.querySelector('.js-product-edition-option[data-edition-option-id="' + curOption.id + '"]');
    if (!wrapper) {
        return;
    }
    var isSelect = curOption.params && curOption.params.view === 'select';
    var isColor = curOption.params && curOption.params.hasColor && !curOption.params.linkImage;
    var isImage = curOption.params && curOption.params.linkImage;
    var defaultValue = curOption.values[0];

    // Get custom class modificators
    var parentMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-variants');
    var labelMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-item');
    var inputMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-input');
    var checkmarkMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-checkmark');
    var titleMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-title');

    // If the option is custom dropdown select then add element to display selected value
    if (isSelect) {
        var selectedMod = t_store_option_getClassModificator(curOption, 'select', 't-product__option-selected');
        str += '<div class="t-product__option-selected ' + selectedMod + ' t-descr t-descr_xxs">';

        if (isColor) {
            // Add addition element for dropdowns with color option for future styling
            var colorStyle = ' style="background-color: ' + t_store_option_getColorValue(curOption.valuesObj, defaultValue) + ';"';
            str += '<span class="t-product__option-selected-checkmark"' + colorStyle + '></span>';
        } else if (isImage) {
            var value = curOption.values[0];
            var url = curOption.imagesObj[value];
            var lazyUrl = t_store_getLazyUrl(options, url);

            var imageStyle = !lazyUrl ? '' : ' style="background-image: url(\'' + lazyUrl + '\');"';
            str += '<div class="t-product__option-selected-checkmark t-bgimg" data-original="' + url + '"' + imageStyle + '></div>';
        }

        str += '<span class="t-product__option-selected-title">' +
            defaultValue + '</span>';
        str += '</div>';

        // Hide custom dropdown options list by default
        parentMod += ' t-product__option-variants_hidden';
    }

    // Do not replace <form></form>. Form tag is required, because multiple radio inputs exist in HTML (product tile, popup etc)
    str += '<form class="t-product__option-variants t-product__option-variants_custom ' + parentMod + '">';

    for (var i = 0; i < curOption.values.length; i++) {
        var value = curOption.values[i];
        var isActive = firstAvailabeEdition[curOption.name] === value;
        var checked = isActive ? ' checked' : '';
        var activeClass = isActive ? ' t-product__option-item_active ' : '';

        // Style UI if it has color
        var checkmarkStyle = !isColor ? '' : ' style="background-color: ' + t_store_option_getColorValue(curOption.valuesObj, value) + ';"';

        // Put everything together
        str += '<label class="t-product__option-item ' + activeClass + labelMod + '">';
        str += '<input class="t-product__option-input ' + inputMod + '" type="radio" name="' + curOption.name + '" value="' + t_store_escapeQuote(value) + '"' + checked + '>';

        if (isImage && curOption.imagesObj) {
            var url = curOption.imagesObj[value];
            var lazyUrl = t_store_getLazyUrl(options, url);
            checkmarkStyle = !lazyUrl ? '' : ' style="background-image: url(\'' + lazyUrl + '\');"';

            str += '<div class="t-product__option-checkmark t-bgimg ' + checkmarkMod + '"' + checkmarkStyle + ' data-original="' + url + '"></div>';
        } else {
            str += '<div class="t-product__option-checkmark ' + checkmarkMod + '"' + checkmarkStyle + '></div>';
        }

        str += '<span class="t-product__option-title ' + titleMod + ' t-descr t-descr_xxs">' + value + '</span>';
        str += '</label>';
    }
    str += '</form>';

    wrapper.insertAdjacentHTML('beforeend', str);
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
        var rec = document.getElementById('rec' + recid);
        var prod = rec.querySelector('.js-store-grid-cont [data-product-gen-uid="' + curProdUid + '"]');
        var el_popup = rec.querySelector('.t-popup');

        if (curUrl.indexOf(recid) >= 0 && prod) {
            // if product exists among products list at slice 1, we trigger click
            if (!el_popup.classList.contains('t-popup_show')) {
                rec.querySelector('[data-product-gen-uid="' + curProdUid + '"] [href^="#prodpopup"]').click();
            }
            // scroll to product
            // work incorrect, need fix
            // var prodOffset = prod.offset().top;
            // $(window).scrollTop(prodOffset - 100);
        } else if (curUrl.indexOf(recid) >= 0 && el_popup) {
            if (el_popup.classList.contains('t-popup_show')) {
                return;
            }

            // if product doesn't exist among products list at slice 1, we load it separately
            var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));

            if (!isSnippet) {
                t_store_loadOneProduct(recid, opts, curProdUid).then(function (data) {
                    if (typeof data === 'string' && data.substr(0, 1) == '{') {
                        try {
                            var dataObj = JSON.parse(data);
                            var productObj = dataObj.product;
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.log(data);
                        }
                        if (productObj === '') {
                            // eslint-disable-next-line no-console
                            console.log("Can't get product with uid = " + curProdUid + ' in storepart = ' + opts.storepart);
                            return;
                        }
                        t_store_openProductPopup(recid, opts, productObj);
                    } else {
                        // eslint-disable-next-line no-console
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
    var el = document.getElementById('rec' + recid);
    var popup = el.querySelector('.t-popup');
    t_store_resetNavStyles(recid);

    document.body.classList.add('t-body_popupshowed');
    document.body.dispatchEvent(new Event('popupShowed'));

    popup.style.display = 'block';
    var isPopupOverflowed = popup.scrollHeight > document.documentElement.clientHeight;
    if (!isPopupOverflowed) {
        // remove scrollbar before show popup
        popup.style.overflow = 'hidden';
    }

    setTimeout(function () {
        popup.querySelector('.t-popup__container').classList.add('t-popup__container-animated');
        popup.classList.add('t-popup_show');
        document.body.dispatchEvent(new Event('twishlist_addbtn'));
        if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
            t_store_onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
        if (!isPopupOverflowed) {
            // add scrollbar after .3s of transition
            setTimeout(function () {
                popup.style.overflow = 'auto';
            }, 300);
        }
    }, 50);

    if (!fromPopup) {
        addPopupEvents(el, recid);
    }
}

function t_store_closePopupKeyDown(e) {
    if (e.keyCode == 27) {
        t_store_closePopup(false);
    }
}

function addPopupEvents(el) {
    // set close events
    var popupOutsideClickEvent = function (e) {
        if (e.target == this) {
            t_store_closePopup(false);
        }
    };
    el.querySelector('.t-popup').removeEventListener('click', popupOutsideClickEvent);
    el.querySelector('.t-popup').addEventListener('click', popupOutsideClickEvent);

    var popupCloseClickEvent = function () {
        t_store_closePopup(false);
    };

    Array.prototype.forEach.call(el.querySelectorAll('.t-popup__close, .js-store-close-text'), function (elem) {
        elem.removeEventListener('click', popupCloseClickEvent);
        elem.addEventListener('click', popupCloseClickEvent);
    });

    document.addEventListener('keydown', t_store_closePopupKeyDown);

    // Change nav opacity on scroll
    var fadeStart = 30;
    var fadeUntil = 200;
    var fading = el.querySelectorAll('.t-popup__close-opacity-scroll');

    if (!fading.length) {
        return;
    }

    var scrollNav = function (el) {
        var offset = el.scrollTop(),
            opacity = 0;

        if (offset >= fadeUntil) {
            opacity = 1;
        } else if (offset <= fadeStart) {
            opacity = 0;
        } else {
            opacity = offset / fadeUntil;
        }

        fading.style.backgroundClor = 'rgba(255,255,255,' + opacity + ')';
    };
    el.querySelector('.t-popup').removeEventListener('scroll', scrollNav);
    el.querySelector('.t-popup').addEventListener('scroll', scrollNav);
}

function t_store_resetNavStyles(recid) {
    var nav = document.getElementById('rec' + recid).querySelector('.t-popup__close');

    // Reset navbar background color
    if (nav.classList.contains('t-popup__close-solid')) {
        nav.style.backgroundClor = 'rgba(255,255,255,1)';
    } else if (nav.classList.contains('t-popup__close-opacity-scroll')) {
        nav.style.backgroundClor = 'rgba(255,255,255,0)';
    }
}

function t_store_closePopup(fromHistory, recid, opts) {
    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
    if (!isSnippet) {
        t_store_closePopup_routing();
    }

    var storepartuid;
    var optsFromHistory;
    var productData;
    var urlBeforePopupOpen;

    Array.prototype.forEach.call(document.querySelectorAll('.t-popup'), function (popup) {
        popup.classList.remove('t-popup_show');
    });
    setTimeout(function () {
        // add scrollbar after .3s of transition
        document.body.classList.remove('t-body_popupshowed');
        document.body.dispatchEvent(new Event('popupHidden'));
    }, 300);

    if (fromHistory) {
        if (t_store_isQueryInAddressBar('tstore')) {
            var hashArr = decodeURI(window.location.hash).split('/');
            var storepartValueIndex = hashArr.indexOf('c') + 1;
            var storeuidIndex = hashArr.indexOf('r') + 1;
            var storepartuid;
            var storeuid = hashArr[storeuidIndex];

            if (hashArr[storepartValueIndex].indexOf('-') != -1) {
                storepartuid = hashArr[storepartValueIndex].slice(0, hashArr[storepartValueIndex].indexOf('-'));
            } else {
                storepartuid = hashArr[storepartValueIndex];
            }
            if (window.history.state) {
                optsFromHistory = window.history.state.opts;
                optsFromHistory.storepart = storepartuid;
            }
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
        t_store_history_pushState({
                storepartuid: storepartuid,
                opts: opts,
                recid: recid,
            },
            null,
            urlBeforePopupOpen
        );
    }

    if (recid) {
        t_store_setActiveStorePart(recid);
        t_store_galleryVideoClearFrame(recid);
        t_store_tabs_videoClearFrame(recid);
    }

    setTimeout(function () {
        document.querySelector('.t-popup').scrollTop = 0;
        Array.prototype.forEach.call(document.querySelectorAll('.t-popup:not(.t-popup_show)'), function (popup) {
            popup.style.display = 'none';
        });
    }, 300);

    document.removeEventListener('keydown', t_store_closePopupKeyDown);
    window.removeEventListener('resize', window.t_store_prodPopup_updateGalleryThumbsEvent);
    document.body.dispatchEvent(new Event('twishlist_addbtn'));
}

function t_store_isStorepartFromHistoryActive(storepartuid, recid, opts) {
    var rec = document.getElementById('rec' + recid);

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
    var activeStorepartUid = rec.querySelector('.js-store-parts-switcher.t-active').getAttribute('data-storepartUid');
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
        }
    };
}

function t_store_copyTypographyFromLeadToPopup(recid, options) {
    var rec = document.getElementById('rec' + recid);
    var prodName = rec.querySelector('.js-store-grid-cont .js-store-prod-name');
    var prodDescr = rec.querySelector('.js-store-grid-cont .js-store-prod-descr');

    if (prodName) {
        var titleStyle = prodName.getAttribute('style');

        var popupStoreProdName = rec.querySelector('.t-popup .js-store-prod-name');
        if (popupStoreProdName) {
            popupStoreProdName.setAttribute('style', t_store_removeSizesFromStylesLine(titleStyle));
        }
    }

    if (prodDescr) {
        var descrStyle = prodDescr.getAttribute('style');
        if (typeof descrStyle == 'undefined' && options.typo.descr != '') {
            descrStyle = options.typo.descr;
        }

        var popupStoreProdText = rec.querySelector('.t-popup .js-store-prod-text');
        if (popupStoreProdText) {
            popupStoreProdText.setAttribute('style', t_store_removeSizesFromStylesLine(descrStyle));
        }
    }
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

function t_store_drawProdPopup_drawTabs(recid, opts, tabsData) {
    var el_rec = document.getElementById('rec' + recid);
    var el_wrapper = el_rec.querySelector('.t-popup .js-product');

    var str = '';
    var tabDesign = opts.tabs;
    var isAccordion = tabDesign === 'accordion';
    var activeTab = !isAccordion && tabsData[0] ? tabsData[0] : null;

    // Styles from block settings
    var colors = t_store_getCustomColors(opts);
    var descrColorStyle = !colors.descrColor ? '' : ' style="color: ' + colors.descrColor + ';"';
    var titleColorStyle = !colors.titleColor ? '' : ' style="color: ' + colors.titleColor + ';"';

    // Start tab layout
    str += '<div class="t-store__tabs t-store__tabs_' + tabDesign + ' t-col t-col_12" data-tab-design="' + tabDesign + '"' + (activeTab ? ' data-active-tab="' + activeTab.title + '"' : '') + '>';

    // Draw tabs controls for Tab design
    str += '<div class="t-store__tabs__controls-wrap">';
    str += '<div class="t-store__tabs__controls">';
    if (!isAccordion) {
        str += t_store_tabs_fade_getStyle(opts);
        str += t_store_tabs_tabBorder_getStyle(recid, opts);
    }
    tabsData.forEach(function (tab, i) {
        str += '<div class="t-store__tabs__button js-store-tab-button' +
            (i === 0 && !isAccordion ? ' t-store__tabs__button_active' : ' ') +
            '" data-tab-title="' + t_store_escapeQuote(tab.title) + '"' +
            '>';
        str += '<div class="t-store__tabs__button-title t-name t-name_xs"' + titleColorStyle + '>';
        str += tab.title;
        str += '</div>';
        str += '</div>';
    });
    str += '</div>';
    str += '</div>';

    // Draw unified layout for any tab design
    str += '<div class="t-store__tabs__list">';

    if (isAccordion) {
        str += t_store_tabs_accordionBorder_getStyle(recid, opts);
    }
    tabsData.forEach(function (tab, i) {
        var content = t_store_drawProdPopup_getSingleTabData(tab, el_wrapper, opts);

        str += '        <div class="t-store__tabs__item' + (i === 0 && !isAccordion ? ' t-store__tabs__item_active' : ' ') + '"' + ' data-tab-title="' + t_store_escapeQuote(tab.title) + '" data-tab-type="' + tab.type + '">';

        str += '            <div class="t-store__tabs__item-button js-store-tab-button"' + ' data-tab-title="' + t_store_escapeQuote(tab.title) + '">';
        str += '                <div class="t-store__tabs__item-title t-name t-name_xs"' + titleColorStyle + '>';
        str += tab.title;
        str += '                </div>';
        if (isAccordion) {
            str += t_store_tabs_closeIcon_getHtml(recid, opts);
        }
        str += '            </div>';
        // Add content
        str += '            <div class="t-store__tabs__content t-descr t-descr_xxs"' + descrColorStyle + '>';
        str += content;
        str += '            </div>';
        str += '        </div>';
    });
    str += '</div>';
    str += '</div>';

    var el_tabs = el_wrapper.querySelectorAll('.t-store__tabs');

    if (el_tabs.length) {
        Array.prototype.forEach.call(el_tabs, function (tab) {
            tab.outerHTML = str;
        });
    } else {
        el_wrapper.insertAdjacentHTML('beforeend', str);
    }
}

function t_store_getCustomColors(opts) {
    var descrColor = opts.typo && opts.typo.descrColor ? opts.typo.descrColor : null;
    var titleColor = opts.typo && opts.typo.titleColor ? opts.typo.titleColor : null;

    var bgColor = opts.popup_opts.containerBgColor && opts.popup_opts.containerBgColor.length ? opts.popup_opts.containerBgColor : '#ffffff';
    var bgColorRgb = t_store_hexToRgb(bgColor);
    var fadeColorTo = 'rgba(' + bgColorRgb.join(',') + ',1)';
    var fadeColorFrom = 'rgba(' + bgColorRgb.join(',') + ',0)';

    var titleColorRgb,
        borderActiveColor,
        borderPassiveColor;

    if (titleColor) {
        titleColorRgb = t_store_hexToRgb(titleColor);
        borderActiveColor = 'rgba(' + titleColorRgb.join(',') + ',1)';
        borderPassiveColor = 'rgba(' + titleColorRgb.join(',') + ',0.3)';
    }

    return {
        descrColor: descrColor,
        titleColor: titleColor,
        titleColorRgb: titleColorRgb,
        borderActiveColor: borderActiveColor,
        borderPassiveColor: borderPassiveColor,
        bgColor: bgColor,
        bgColorRgb: bgColorRgb,
        fadeColorTo: fadeColorTo,
        fadeColorFrom: fadeColorFrom,

    };
}

function t_store_tabs_fade_getStyle(opts) {
    var str = '';
    var colors = t_store_getCustomColors(opts);
    var fadeStyleLeft = 'background-image:linear-gradient(to right,' + colors.fadeColorTo + ' 0%, ' + colors.fadeColorFrom + ' 90%)';
    var fadeStyleRight = 'background-image:linear-gradient(to right,' + colors.fadeColorFrom + ' 0%, ' + colors.fadeColorTo + ' 90%)';

    str += '<style>';
    str += '    .t-store__tabs__controls-wrap:before, .t-store__tabs__controls-wrap:after {\n';
    str += '        display: none;\n';
    str += '        z-index: 1;\n';
    str += '        position: absolute;\n';
    str += '        content: "";\n';
    str += '        width: 50px;\n';
    str += '        bottom: 1px;\n';
    str += '        top: 0;\n';
    str += '        pointer-events: none;\n';
    str += '    }\n';
    str += '    .t-store__tabs__controls-wrap_left:before {\n';
    str += fadeStyleLeft + ';\n';
    str += '        left: -1px;\n';
    str += '    }\n';
    str += '    .t-store__tabs__controls-wrap_right:after {\n';
    str += fadeStyleRight + ';\n';
    str += '        right: -2px;\n';
    str += '    }\n';
    str += '    .t-store__tabs__controls-wrap_left:before {\n';
    str += '        display: block;\n';
    str += '    }\n';
    str += '    .t-store__tabs__controls-wrap_right:after {\n';
    str += '        display: block;\n';
    str += '    }\n';
    str += '</style>';

    return str;
}

function t_store_tabs_tabBorder_getStyle(recid, opts) {
    var str = '';
    var colors = t_store_getCustomColors(opts);

    if (colors.borderActiveColor && colors.borderPassiveColor) {
        str += '<style>';

        str += '@media screen and (max-width:560px) {\n';
        str += '    #rec' + recid + ' .t-store .t-store__tabs__controls .t-store__tabs__button.t-store__tabs__button_active {\n';
        str += '        border-bottom: 1px solid ' + colors.borderPassiveColor + ';\n';
        str += '    }\n';

        str += '    #rec' + recid + ' .t-store .t-store__tabs__controls .t-store__tabs__button_active .t-store__tabs__button-title:after {\n';
        str += '        border-bottom: 1px solid ' + colors.borderActiveColor + ';\n';
        str += '    }\n';

        str += '}\n';

        str += '    #rec' + recid + ' .t-store .t-store__tabs .t-store__tabs__button {\n';
        str += '        border-bottom: 1px solid ' + colors.borderPassiveColor + ';\n';
        str += '    }\n';

        str += '    #rec' + recid + ' .t-store .t-store__tabs__controls .t-store__tabs__button_active, \n';
        str += '    #rec' + recid + ' .t-store .t-store__tabs__controls .t-store__tabs__button:hover, \n';
        str += '    #rec' + recid + ' .t-store .t-store__tabs_snippet .t-store__tabs__controls .t-store__tabs__button:first-child {\n';
        str += '        border-bottom: 1px solid ' + colors.borderActiveColor + ';\n';
        str += '    }\n';

        str += '</style>';
    }
    return str;
}

function t_store_tabs_accordionBorder_getStyle(recid, opts) {
    var str = '';
    var colors = t_store_getCustomColors(opts);

    if (colors.borderActiveColor && colors.borderPassiveColor) {
        str += '<style>';
        str += '    #rec' + recid + ' .t-store .t-store__tabs.t-store__tabs_accordion .t-store__tabs__item-button {\n';
        str += '        border-top: 1px solid ' + colors.borderActiveColor + ';\n';
        str += '    }\n';

        str += '    #rec' + recid + ' .t-store .t-store__tabs_accordion .t-store__tabs__item-button:not(.t-store__tabs__item-button_active) {\n';
        str += '        border-bottom: 1px solid ' + colors.borderActiveColor + ';\n';
        str += '    }\n';
        str += '</style>';
    }
    return str;
}

function t_store_tabs_closeIcon_getHtml(recid, opts) {
    var str = '';
    var colors = t_store_getCustomColors(opts);
    var fillColor = colors.borderActiveColor ? colors.borderActiveColor : '#222222';

    str += '<div class="t-store__tabs__close">';
    if (colors.borderPassiveColor) {
        str += '<style>';
        str += '    #rec' + recid + ' .t-store .t-store__tabs__close:after {\n';
        str += '        background-color: ' + colors.borderPassiveColor + ';\n';
        str += '    }\n';
        str += '</style>';
    }

    str += '    <svg class="t-store__tabs__close-icon" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    str += '        <g stroke="none" stroke-width="1px" fill="none" fill-rule="evenodd" stroke-linecap="square">';
    str += '        <g transform="translate(1.000000, 1.000000)" stroke="' + fillColor + '">';
    str += '            <path d="M0,11 L22,11"></path>';
    str += '            <path d="M11,0 L11,22"></path>';
    str += '        </g>';
    str += '        </g>';
    str += '    </svg>';
    str += '</div>';

    return str;
}

function t_store_drawProdPopup_getSingleTabData(tab, el_wrapper, opts) {
    if (!tab || typeof tab !== 'object') {
        return null;
    }

    if (tab.type === 'info' || tab.type === 'template') {
        return t_store_addLazyLoadToHtml(opts, tab.data);
    } else if (tab.type === 'text') {
        return el_wrapper.querySelector('.js-store-prod-all-text').innerHTML;
    } else if (tab.type === 'chars') {
        return el_wrapper.querySelector('.js-store-prod-all-charcs').innerHTML;
    }
}

function t_store_addLazyLoadToHtml(opts, string) {
    // lazyLoad works just in published pages, so in redactor and previewmode we do not add smaller images
    if (!opts.isPublishedPage || window.lazy !== 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') !== 'yes') {
        return string;
    }

    var html = document.createElement('div');
    html.insertAdjacentHTML('beforeend', string);

    Array.prototype.forEach.call(html.querySelectorAll('img'), function (image) {
        var source = image.getAttribute('src');
        image.classList.add('t-img');

        if (
            source.indexOf('.tildacdn.com') == -1 ||
            source.indexOf('-/empty/') > 0 ||
            source.indexOf('-/resize/') > 0
        ) {
            // do nothing
        } else {
            var arr = source.split('/');
            arr.splice(source.split('/').length - 1, 0, '-/empty');
            var newSrc = arr.join('/');

            image.setAttribute('src', newSrc);
            image.setAttribute('data-original', source);
        }
    });

    // TODO Uncomment when lazy load for videos will be ready to use
    // tilda-video-1.0.js is required
    // html.find('.t-redactor__video-container').each(function() {
    //     var wrapper = $(this);
    //     var url = wrapper.find('iframe').attr('src');
    //     var videoId = '';
    //     wrapper.classList.add('t-video-lazyload');
    //     wrapper.attr('data-videolazy-load', 'false');

    //     var type = null;
    //     if (/youtube\.com/gi.test(url)) {
    //         type = 'youtube';
    //     }
    //     if (/vimeo\.com/gi.test(url)) {
    //         type = 'vimeo';
    //     }

    //     if (type == 'youtube') {
    //         if (url.indexOf('youtube.com/watch') !== -1) {
    //             console.log('1');
    //             videoId = url.match(/youtube\.com\/watch\?v=([a-z0-9_-]{11})/i);
    //         } else if (url.indexOf('youtube.com/embed') !== -1) {
    //             videoId = url.match(/youtube\.com\/embed\/([a-z0-9_-]{11})/i);
    //         } else {
    //             videoId = url.match(/youtu\.be\/([a-z0-9_-]{11})/i);
    //         }

    //         if (videoId && videoId.length > 1) {
    //             videoId = videoId[1];
    //         }
    //     }

    //     if (type == 'vimeo') {
    //         videoId = url.match(/vimeo\.com\/([0-9]+)/i);
    //         if (videoId && videoId.length > 1) {
    //             videoId = videoId[1];
    //         }
    //     }

    //     wrapper.attr('data-videolazy-id', videoId);
    //     wrapper.attr('data-videolazy-type', type);
    // })

    // Return as string
    return html.innerHTML;
}

function t_store_drawProdPopup_drawGallery(recid, el_popup, product, options) {
    var rec = document.getElementById('rec' + recid);
    if (el_popup instanceof jQuery) {
        if (el_popup.length === 0) {
            return;
        }
        el_popup = el_popup[0];
    }
    var galleryArr;
    if (!product.gallery) {
        el_popup.querySelector('.js-store-prod-slider').innerHTML = '';
        return;
    }

    if (typeof product.gallery === 'string') {
        galleryArr = JSON.parse(product.gallery);
    } else {
        galleryArr = product.gallery;
    }

    if (galleryArr.length === 0) {
        el_popup.querySelector('.js-store-prod-slider').innerHTML = '';
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

    Array.prototype.forEach.call(galleryArr, function (element, index) {
        var oneSlideTpl = t_store_get_productcard_oneSlide_html(options, element);
        strSlides += oneSlideTpl
            .replace('[[activeClass]]', index === 0 ? 't-slds__item_active' : '')
            .replace('[[productClass]]', index === 0 ? 'js-product-img' : '')
            .replace(/\[\[index\]\]/g, index + 1)
            .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
            .replace(/\[\[imgsource\]\]/g, element.img);

        if (hasBullets) {
            if (hasThumbs && options.sliderthumbsside == 'l') {
                var maxThumbsCount = t_store_prodPopup_gallery_calcMaxThumbsCount(columnSizeForMainImage, galleryImageAspectRatio, thumbsSize, marginBetweenThumbs);

                if (index <= maxThumbsCount - 1) {
                    if (index <= maxThumbsCount - 2 || index === galleryArr.length - 1) {
                        oneBulletTpl = t_store_get_productcard_oneSliderBullet_html(options);
                        oneBulletStr = oneBulletTpl
                            .replace('[[activeClass]]', index === 0 ? 't-slds__bullet_active' : '')
                            .replace(/\[\[index\]\]/g, index + 1)
                            .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
                            .replace(/\[\[imgsource\]\]/g, element.img);
                    } else {
                        oneBulletTpl = t_store_get_productcard_thumbsGallery_html(options, galleryArr.length, maxThumbsCount);
                        oneBulletStr = oneBulletTpl
                            .replace('[[activeClass]]', index === 0 ? 't-slds__bullet_active' : '')
                            .replace(/\[\[index\]\]/g, index + 1)
                            .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, element.img))
                            .replace(/\[\[imgsource\]\]/g, element.img);
                    }

                    strBullets += oneBulletStr;
                }
            } else {
                oneBulletTpl = t_store_get_productcard_oneSliderBullet_html(options);
                oneBulletStr = oneBulletTpl
                    .replace('[[activeClass]]', index === 0 ? 't-slds__bullet_active' : '')
                    .replace(/\[\[index\]\]/g, index + 1)
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

    el_popup.querySelector('.js-store-prod-slider').innerHTML = str;

    t_store_galleryVideoHandle(recid);

    var controlsSelStr = '.t-slds__arrow_container, .t-slds__bullet_wrapper, .t-slds__thumbsbullet-wrapper';
    if (galleryArr.length === 1) {
        el_popup.querySelector(controlsSelStr).style.display = 'none';
    } else {
        el_popup.querySelector(controlsSelStr).style.display = '';
    }

    var sliderOptions;

    if (options.sliderthumbsside == 'l') {
        sliderOptions = {
            thumbsbulletGallery: true,
            storeOptions: options,
        };
    }

    var isSnippet = document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') && document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
    if (isSnippet) {
        t_store_onFuncLoad('t_sldsInit', function () {
            t_sldsInit(recid + ' .js-store-product', sliderOptions);
        });
    } else {
        setTimeout(function () {
            t_store_onFuncLoad('t_sldsInit', function () {
                t_sldsInit(recid + ' .js-store-product', sliderOptions);
            });
        }, 200);
    }
}

function t_store_galleryVideoHandle(recid) {
    // video in slider
    var el = document.getElementById('rec' + recid);
    var play = el.querySelector('.t-slds__play_icon');

    if (play) {
        var url;
        play.addEventListener('click', function () {
            if (this.getAttribute('data-slider-video-type') == 'youtube.com') {
                url = this.getAttribute('data-slider-video-url');
                this.nextElementSibling.innerHTML = '<iframe class="t-slds__frame" width="100%" height="100%" src="https://www.youtube.com/embed/' + url + '?autoplay=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
            }
            if (this.getAttribute('data-slider-video-type') == 'vimeo.com') {
                url = this.getAttribute('data-slider-video-url');
                this.nextElementSibling.innerHTML = '<iframe class="t-slds__frame" width="100%" height="100%" src="https://player.vimeo.com/video/' + url + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
            }
            this.nextElementSibling.style.zIndex = 3;
        });

        el.addEventListener('updateSlider', function () {
            t_store_galleryVideoClearFrame(recid);
        });
    }

}

function t_store_galleryVideoClearFrame(recid) {
    var rec = document.getElementById('rec' + recid);
    var frameWrapper = rec.querySelector('.t-slds__frame-wrapper');
    if (frameWrapper) {
        frameWrapper.innerHTML = '';
        frameWrapper.style.zIndex = '';
    }
}

function t_store_tabs_videoClearFrame(recid) {
    var rec = document.getElementById('rec' + recid);
    var frameWrapper = rec.querySelector('.t-store__tabs .t-redactor__video-container');
    if (frameWrapper) {
        frameWrapper.innerHTML = '';
    }
}

function t_store_prodPopup_updateGalleryThumbs(recid, el_popup, product, options) {
    var rec = document.getElementById('rec' + recid);
    var galleryArr;

    var hasThumbs = options.slider_opts.controls === 'thumbs' || options.slider_opts.controls === 'arrowsthumbs';
    if (hasThumbs || options.sliderthumbsside !== 'l') {
        return;
    }

    if (!product.gallery) {
        return;
    }
    if (typeof product.gallery === 'string') {
        galleryArr = JSON.parse(product.gallery);
    } else {
        galleryArr = product.gallery;
    }

    if (galleryArr.length === 0) {
        el_popup.querySelector('.js-store-prod-slider').innerHTML = '';
        return;
    }

    var columnSizeForMainImage = parseInt(options.popup_opts.columns, 10);
    var galleryImageAspectRatio = +options.slider_slidesOpts.ratio;
    var thumbsSize = 60,
        marginBetweenThumbs = 10;

    var thumbsCount = rec.querySelectorAll('.t-slds__thumbsbullet').length;
    var maxThumbsCount = t_store_prodPopup_gallery_calcMaxThumbsCount(columnSizeForMainImage, galleryImageAspectRatio, thumbsSize, marginBetweenThumbs);
    var strBullets;

    var oneBulletTpl;
    var oneBulletStr;

    if ((thumbsCount !== maxThumbsCount && galleryArr.length >= maxThumbsCount) || (thumbsCount < maxThumbsCount && thumbsCount !== galleryArr.length)) {
        Array.prototype.forEach.call(galleryArr, function (image, index) {
            if (index <= maxThumbsCount - 1) {
                if (index <= maxThumbsCount - 2 || index === galleryArr.length - 1) {
                    oneBulletTpl = t_store_get_productcard_oneSliderBullet_html(options);
                    oneBulletStr = oneBulletTpl
                        .replace('[[activeClass]]', index === 0 ? 't-slds__bullet_active' : '')
                        .replace(/\[\[index\]\]/g, index + 1)
                        .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, image.img))
                        .replace(/\[\[imgsource\]\]/g, image.img);
                } else {
                    oneBulletTpl = t_store_get_productcard_thumbsGallery_html(options, galleryArr.length, maxThumbsCount);
                    oneBulletStr = oneBulletTpl
                        .replace('[[activeClass]]', index === 0 ? 't-slds__bullet_active' : '')
                        .replace(/\[\[index\]\]/g, index + 1)
                        .replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(options, image.img))
                        .replace(/\[\[imgsource\]\]/g, image.img);
                }

                strBullets += oneBulletStr;
            }
        });

        var thumbsWrapper = rec.querySelector('.t-slds__thumbsbullet-wrapper');
        thumbsWrapper.innerHTML = strBullets;

        var sliderOptions;

        if (options.sliderthumbsside == 'l') {
            sliderOptions = {
                thumbsbulletGallery: true,
                storeOptions: options,
            };
        }

        t_sldsInit(recid + ' .js-store-product', sliderOptions);
        if (window.lazy === 'y' || document.getElementById('allrecords').getAttribute('data-tilda-lazy') === 'yes') {
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

    if ((thumbSize + marginBetweenThumbs) * (maxPreviewsCount + 1) - marginBetweenThumbs <= mainImageHeight) {
        maxPreviewsCount += 1;
    }

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
        var arrowsTplEl = rec.querySelector('.js-store-tpl-slider-arrows');
        var arrowsTpl = arrowsTplEl.innerHTML;
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
        var classes = 't-slds__thumbsbullet t-slds__bullet t-slds__thumbs_gallery [[activeClass]]';
        if (options.slider_slidesOpts.zoomable) {
            classes += ' t-slds__thumbs_gallery-zoomable';
        }
        str += '<div class="' + classes + '" [[zoomAttrs]]' +
            ' data-gallery-length="' + countForGalleryPreview + '"' +
            ' data-slide-bullet-for="' + maxThumbsCount + '">';
        str += '    <div class="t-slds__bgimg t-bgimg" data-original="[[imgsource]]" style="padding-bottom: 100%; background-image: url(\'[[imgsource_lazy]]\');"></div>';
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
    // lazyLoad works just in published pages, so in redactor and previewmode we do not add smaller images
    if (!opts.isPublishedPage || window.lazy !== 'y') {
        return imgSrc;
    }
    if (imgSrc.indexOf('static.tildacdn.com') === -1) {
        // we cant apply lazy load to images, hosted to another servers
        return imgSrc;
    }
    var arr = imgSrc.split('/');
    arr.splice(imgSrc.split('/').length - 1, 0, '-/resizeb/x20');
    var newSrc = arr.join('/');
    return newSrc;
}

function t_store_getLazySrc(opts, imgSrc) {
    // lazyLoad works just in published pages, so in redactor and previewmode we do not add smaller images
    if (!opts.isPublishedPage || window.lazy !== 'y') {
        return 'src="' + imgSrc + '"';
    }
    if (
        imgSrc.indexOf('.tildacdn.com') == -1 ||
        imgSrc.indexOf('-/empty/') > 0 ||
        imgSrc.indexOf('-/resize/') > 0
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

    dict['sku'] = {
        EN: 'SKU',
        RU: 'Артикул',
        FR: 'UGS',
        DE: 'SKU',
        ES: 'SKU',
        PT: 'SKU',
        UK: 'Код товару',
        JA: '単品管理',
        ZH: '存货单位',
        PL: 'SKU',
        KK: 'SKU',
        IT: 'SKU',
        LV: 'SKU',
    };

    dict['soldOut'] = {
        EN: 'Out of stock',
        RU: 'Нет в наличии',
        FR: 'En rupture de stock',
        DE: 'Ausverkauft',
        ES: 'Agotado',
        PT: 'Fora de estoque',
        UK: 'Немає в наявності',
        JA: '在庫切れ',
        ZH: '缺货',
        PL: 'Nie ma na stanie',
        KK: 'Сатылды',
        IT: 'Esaurito',
        LV: 'Nav noliktavā',
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
        PL: 'Wszystkie',
        KK: 'Барлық',
        IT: 'Tutti',
        LV: 'Visi',
    };

    dict['from'] = {
        EN: 'from',
        RU: 'от',
        FR: 'de',
        DE: 'von',
        ES: 'de',
        PT: 'de',
        JA: 'から',
        ZH: '从',
        UK: 'від',
        PL: 'od',
        KK: 'бастап',
        IT: 'da',
        LV: 'no',
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
        PL: 'Nic nie znaleziono',
        KK: 'Ештеңе табылмады',
        IT: 'Non abbiamo trovato nulla',
        LV: 'Nekas nav atrasts',
    };

    dict['seeotherproducts'] = {
        EN: 'See other',
        RU: 'Другие товары',
        FR: 'Autres produits',
        DE: 'Andere produkte',
        ES: 'Otros productos',
        PT: 'Outros produtos',
        UK: 'Інші товари',
        JA: 'その他の商品',
        ZH: '其他产品',
        PL: 'Inne produkty',
        KK: 'Басқа қараңыз',
        IT: 'Vedi altri',
        LV: 'Skatiet citas',
    };

    dict['seeAlso'] = {
        EN: 'See also',
        RU: 'Смотрите также',
        FR: 'Voir également',
        DE: 'Siehe auch',
        ES: 'Ver también',
        PT: 'Veja também',
        UK: 'Дивись також',
        JA: 'また見なさい',
        ZH: '也可以看看',
        PL: 'Patrz również',
        KK: 'Сондай-ақ, қараңыз',
        IT: 'Guarda anche',
        LV: 'Skatīt arī',
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
        PL: 'Kup',
        KK: 'Қазір сатып Ал',
        IT: 'Acquista ora',
        LV: 'Pērc tagad',
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
        PL: 'Pokaż więcej',
        KK: 'Load көп',
        IT: 'Carica ancora',
        LV: 'Ielādēt vairāk',
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
        PL: 'Filtry',
        KK: 'Сүзгілер',
        IT: 'Filtri',
        LV: 'Filtri',
    };

    dict['searchplaceholder'] = {
        EN: 'Search',
        RU: 'Поиск',
        FR: 'Recherche de produit',
        DE: 'Produktsuche',
        ES: 'Buscar productos',
        PT: 'Procurar produtos',
        UK: 'Пошук товарів',
        JA: '商品を探す',
        ZH: '搜索商品',
        PL: 'Wyszukaj produkt',
        KK: 'Іздеу',
        IT: 'Ricerca',
        LV: 'Meklēt',
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
        PL: 'Sortuj',
        KK: 'Сорт',
        IT: 'Ordinare',
        LV: 'Šķirot',
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
        PL: 'Sortuj: dowolnie',
        KK: 'Сұрыптау: Әдепкі бойынша',
        IT: 'Ordina: per impostazione predefinita',
        LV: 'Kārtot: pēc noklusējuma',
    };

    dict['sort-price-asc'] = {
        EN: 'Price: low to high',
        RU: 'Цена: по возрастанию',
        FR: 'Prix: par ordre croissant',
        DE: 'Preis: aufsteigend',
        ES: 'Precio: de más bajo a más alto',
        PT: 'Preço: baixo para alto',
        UK: 'Ціна: спочатку дешеві',
        JA: '価格の安い順番',
        ZH: '价格: 从便宜到贵',
        PL: 'Cena: od najniższej',
        KK: 'Бағасы: жоғары төмен',
        IT: 'Prezzo crescente',
        LV: 'Cena: no zema uz augstu',
    };

    dict['sort-price-desc'] = {
        EN: 'Price: high to low',
        RU: 'Цена: по убыванию',
        FR: 'Prix: par ordre décroissant',
        DE: 'Preis: absteigend',
        ES: 'Precio: de más alto a más bajo',
        PT: 'Preço: alto para baixo',
        UK: 'Ціна: спочатку дорогі ',
        JA: '価格の高い順番',
        ZH: '价格: 从贵到便宜',
        PL: 'Cena: od najdroższej',
        KK: 'Бағасы: төмен жоғары',
        IT: 'Prezzo decrescente',
        LV: 'Cena: no augstākās līdz zemākajai',
    };

    dict['sort-name-asc'] = {
        EN: 'Title: A—Z',
        RU: 'Название: А—Я',
        FR: 'Titre: A—Z',
        DE: 'Titel: A—Z',
        ES: 'Título: A—Z',
        PT: 'Título: A—Z',
        UK: 'Назва:  А—Я',
        JA: '製品名：五十音順',
        ZH: '商品名称: 字母顺序排列',
        PL: 'Nazwa: A-Ż',
        KK: 'Атауы: A-Z',
        IT: 'Titolo: A-Z',
        LV: 'Nosaukums: A-Z',
    };

    dict['sort-name-desc'] = {
        EN: 'Title: Z—A',
        RU: 'Название: Я—А',
        FR: 'Titre: Z—A',
        DE: 'Titel: Z—A',
        ES: 'Título: Z—A',
        PT: 'Título: Z—A',
        UK: 'Назва: Я—А',
        JA: '製品名：降順',
        ZH: '商品名称: 降序母顺序排列',
        PL: 'Nazwa: Ż-A',
        KK: 'Атауы: Z-A',
        IT: 'Titolo: Z-A',
        LV: 'Nosaukums: no Z līdz A',
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
        PL: 'Sortuj: najnowsze',
        KK: 'Сұрыптау: Бірінші жаңалар Бірінші',
        IT: 'Nuovi primo',
        LV: 'Kārtot: jaunākie vispirms',
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
        PL: 'Sortuj: najstarsze',
        KK: 'Сұрыптау: көне бірінші',
        IT: 'Ordina: prima i più vecchi',
        LV: 'Kārtot: vecākie vispirms',
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
        PL: 'Cena',
        KK: 'Баға',
        IT: 'Prezzo',
        LV: 'Cena',
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
        PL: 'Dostępność',
        KK: 'Болуы',
        IT: 'Disponibilità',
        LV: 'Pieejamība',
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
        PL: 'Tylko dostępne produkty',
        KK: 'Тек қоймада',
        IT: 'Solo in magazzino',
        LV: 'Tikai noliktavā',
    };

    dict['filter-reset'] = {
        EN: 'Clear all',
        RU: 'Очистить все',
        FR: 'Tout effacer',
        DE: 'Alles löschen',
        ES: 'Limpiar todo',
        PT: 'Limpar tudo',
        UK: 'Очистити все',
        JA: 'すべてクリア',
        ZH: '全部清除',
        PL: 'Wyczyść wszystko',
        KK: 'Clear Барлық',
        IT: 'Cancella tutto',
        LV: 'Nodzēst visu',
    };

    dict['filter-expand'] = {
        EN: 'Show all',
        RU: 'Показать все',
        FR: 'Afficher tout',
        DE: 'Zeige alles',
        ES: 'Mostrar todo',
        PT: 'Pokaż wszystko',
        UK: 'Показати всі',
        JA: 'すべて表示する',
        ZH: '显示所有',
        PL: 'Pokaż wszystko',
        KK: 'Барлығын көрсету',
        IT: 'Mostra tutto',
        LV: 'Parādīt visu',
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
        PL: 'Zwiń',
        KK: 'Күйреу',
        IT: 'Crollo',
        LV: 'Sabrukums',
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
        PL: 'Znaleziono',
        KK: 'Табылған',
        IT: 'Trovato',
        LV: 'Atrasts',
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
        PL: 'mm',
        KK: 'мм',
        IT: 'mm',
        LV: 'mm',
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
        PL: 'r',
        KK: 'г',
        IT: 'g',
        LV: 'g',
    };

    dict['PCE'] = { // штук
        EN: 'pc',
        RU: 'шт',
    };

    dict['NMP'] = { // упаковка
        EN: 'pack',
        RU: 'уп',
    };

    dict['MGM'] = { // миллиграмм
        EN: 'mg',
        RU: 'мг',
    };

    dict['GRM'] = { // грамм
        EN: 'g',
        RU: 'г',
    };

    dict['KGM'] = { // килограмм
        EN: 'kg',
        RU: 'кг',
    };

    dict['TNE'] = { // тонна
        EN: 't',
        RU: 'т',
    };

    dict['MLT'] = { // миллилитр
        EN: 'ml',
        RU: 'мл',
    };

    dict['LTR'] = { // литр
        EN: 'l',
        RU: 'л',
    };

    dict['MMT'] = { // миллиметр
        EN: 'mm',
        RU: 'мм',
    };

    dict['CMT'] = { // сантиметр
        EN: 'cm',
        RU: 'см',
    };

    dict['DMT'] = { // дециметр
        EN: 'dm',
        RU: 'дм',
    };

    dict['MTR'] = { // метр
        EN: 'm',
        RU: 'м',
    };

    dict['MTK'] = { // квадратный метр
        EN: 'm²',
        RU: 'м²',
    };

    dict['MTQ'] = { // кубический метр
        EN: 'm³',
        RU: 'м³',
    };

    dict['LMT'] = { // погонный метр
        EN: 'lm',
        RU: 'пог. м',
    };

    dict['HAR'] = { // гектар
        EN: 'ha',
        RU: 'га',
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
        PL: 'LxWxH',
        KK: 'LxWxH',
        IT: 'LxWxH',
        LV: 'LxWxH',
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
        PL: 'WxHxT',
        KK: 'WxHxT',
        IT: 'WxHxT',
        LV: 'WxHxT',
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
        PL: 'WxHxD',
        KK: 'WxHxD',
        IT: 'WxHxD',
        LV: 'WxHxD',
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
        PL: 'Waga',
        KK: 'Салмақ',
        IT: 'Peso',
        LV: 'Svars',
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
    var optionsWrapper = el_product.querySelector('.js-product-controls-wrapper');

    t_store_product_addEditionControls(product, optionsWrapper, options, recid);
    var hasAvailable = t_store_product_selectAvailableEdition(recid, product, el_product, options);
    if (hasAvailable) {
        t_store_product_triggerSoldOutMsg(el_product, false, options);
        t_store_product_disableUnavailOpts(el_product, product);
    } else {
        t_store_product_triggerSoldOutMsg(el_product, true, options);
    }

    Array.prototype.forEach.call(el_product.querySelectorAll('.js-product-edition-option'), function (option) {
        option.addEventListener('change', function () {
            var edition = t_store_product_detectEditionByControls(el_product, product);
            // pass isChange = true on this onchange event only
            // It's for switching image on option change
            var isChanged = true;

            if (edition) {
                t_store_product_updateEdition(recid, el_product, edition, product, options, isChanged);
                // apply additional options to price by func from tilda-products-1.0.js
                t_prod__updatePrice(recid, el_product);

                var isSoldOut = parseInt(edition.quantity, 10) <= 0;
                t_store_product_triggerSoldOutMsg(el_product, isSoldOut, options);

                // update quantity buttons & input
                t_store_addProductQuantity(recid, el_product, edition, options);
            } else {
                var changedOptName = this.getAttribute('data-edition-option-id');
                // get values of all selectboxes before the changed one
                var optsValsBeforeChangedArr = [];
                for (var i = 0; i < product.editionOptions.length; i++) {
                    var curOption = product.editionOptions[i];
                    optsValsBeforeChangedArr.push(curOption);
                    if (curOption.name === changedOptName) {
                        break;
                    }
                }
                // need to find edition, which contain values from the selectboxes placed before the changed one and changselectboxes, which are placed after it */
                var hasAvailable = t_store_product_selectAvailableEdition(recid, product, el_product, options, optsValsBeforeChangedArr, isChanged);
                // apply additional options to price by func from tilda-products-1.0.js
                t_prod__updatePrice(recid, el_product);
                t_store_product_triggerSoldOutMsg(el_product, !hasAvailable, options);

                // update quantity buttons & input
                t_store_addProductQuantity(recid, el_product, product, options);
            }

            Array.prototype.forEach.call(el_product.querySelectorAll('.js-product-edition-option-variants option'), function (variantOption) {
                variantOption.removeAttribute('disabled');
            });
            t_store_product_disableUnavailOpts(el_product, product);
        });
    });
}

function t_store_product_detectEditionByControls(el_product, product) {
    // iterate via all product editions to find the selected one

    for (var i = 0; i < product.editions.length; i++) {
        var curEdition = product.editions[i];
        // suppose that current edition is selected
        var isCurEditionSelected = true;
        // check match of all options values
        for (var j = 0; j < product.editionOptions.length; j++) {
            var curOption = product.editionOptions[j];
            var el_select = t_store_product_getEditionSelectEl(el_product, curOption);
            if (el_select) {
                var curControlVal = el_select.querySelector('.js-product-edition-option-variants').value;
                var curEditionVal = curEdition[curOption.name];
                if (curControlVal !== curEditionVal) {
                    isCurEditionSelected = false;
                }
            }
        }

        // return current edition object, if all options values match the values from controls
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

function t_store_product_selectAvailableEdition(recid, product, el_product, opts, optsValsBeforeChangedArr, isChanged) {
    var edition =
        optsValsBeforeChangedArr && optsValsBeforeChangedArr.length > 0 ?
        t_store_product_getFirstAvailableEditionData_forCertainVals(product.editions, optsValsBeforeChangedArr, el_product) :
        t_store_product_getFirstAvailableEditionData(product.editions);

    if (!edition) {
        // eslint-disable-next-line no-console
        console.log('No available edition for uid = ' + product.uid + ' with selected options values');
        return false;
    }

    var isAvailable = parseInt(edition.quantity, 10) > 0 || edition.quantity === '';

    // change controls
    Array.prototype.forEach.call(product.editionOptions, function (curOption) {
        var value = edition[curOption.name];
        var el_select = t_store_product_getEditionSelectEl(el_product, curOption);
        if (el_select) {
            var variant = el_select.querySelector('.js-product-edition-option-variants');
            if (variant) {
                variant.value = value;
            }

            // Change custom options if available
            var el_custom_opts = el_select.querySelectorAll('.t-product__option-variants_custom');
            Array.prototype.forEach.call(el_custom_opts, function (customOpt) {
                var el_items = customOpt.querySelectorAll('.t-product__option-item');
                Array.prototype.forEach.call(el_items, function (item) {
                    var el_input = item.querySelector('.t-product__option-input');
                    if (el_input.value === value) {
                        setTimeout(function () {
                            el_input.checked = true;
                            el_input.click();
                        });
                        item.classList.add('t-product__option-item_active');
                    } else {
                        el_input.checked = false;
                        item.classList.remove('t-product__option-item_active');
                    }
                });
            });
        }
    });

    t_store_product_updateEdition(recid, el_product, edition, product, opts, isChanged);
    return isAvailable;
}

function t_store_product_disableUnavailOpts(el_product, product) {
    // get values of all selectboxes before the changed one
    var optsValsBeforeChangedArr = [];

    if (product.editionOptions.length > 0) {
        // push first edition too
        optsValsBeforeChangedArr.push(product.editionOptions[0]);
    }

    // iterate via all edition controls, except the first one
    for (var i = 1; i < product.editionOptions.length; i++) {
        var curOpt = product.editionOptions[i];
        var el_curOpt = t_store_product_getEditionSelectEl(el_product, curOpt);

        if (!el_curOpt) {
            return;
        }

        optsValsBeforeChangedArr.push(curOpt);

        // disable current control values, which doesn't have a common edition with previous controls values
        Array.prototype.forEach.call(curOpt.values, function (curOptVal) {
            var hasEdition = t_store_product_getFirstAvailableEditionData_forCertainVals(product.editions, optsValsBeforeChangedArr, el_product, curOptVal);

            var value = (curOptVal || '').replace(/\\/g, '\\\\');
            var el_optionTag = el_curOpt.querySelector('option[value="' + value + '"]');
            var el_custom_input = el_curOpt.querySelector('.t-product__option-input[value="' + value + '"]');

            if (hasEdition) {
                if (el_optionTag) {
                    el_optionTag.removeAttribute('disabled');
                }

                if (el_custom_input) {
                    var el_parent = el_custom_input.closest('.t-product__option-item');
                    el_parent.classList.remove('t-product__option-item_disabled');
                }
            } else {
                if (el_optionTag) {
                    el_optionTag.setAttribute('disabled', 'disabled');
                }

                if (el_custom_input) {
                    var el_parent = el_custom_input.closest('.t-product__option-item');
                    el_parent.classList.add('t-product__option-item_disabled');
                    el_parent.classList.remove('t-product__option-item_active');
                }
            }
        });
    }
}

function t_store_product_updateEdition(recid, el_product, edition, product, opts, isChanged) {
    var urlSearch = t_store_snippet_getJsonFromUrl();

    if (el_product instanceof jQuery) {
        el_product = el_product[0];
    }

    if (!edition) {
        product.editions.forEach(function (cur) {
            if (cur.uid === urlSearch.editionuid) {
                edition = cur;
            }
        });
    }

    // TODO: remove
    // eslint-disable-next-line no-jquery/no-jquery-constructor, no-jquery/no-each-collection
    $('.r .js-store-product').each(function (i, product) {
        // eslint-disable-next-line no-jquery/no-jquery-constructor, no-jquery/no-attr, no-jquery/no-data
        $(product).attr('cardSize', $(product).data('cardSize'));
    });

    if (urlSearch.editionuid === edition.uid) {
        Array.prototype.forEach.call(document.querySelectorAll('.js-store-product'), function (product) {
            product.setAttribute('data-product-lid', edition.uid);
            product.setAttribute('data-product-uid', edition.uid);
            product.setAttribute('data-product-url', window.location);
            product.setAttribute('data-product-img', edition.img);
        });

        setTimeout(function () {
            t_store_product_updateEdition_moveSlider(recid, el_product, edition);
        }, 200);

        // If edition was passed as URL param, update hidden select only
        Array.prototype.forEach.call(document.querySelectorAll('[data-product-uid="' + edition.uid + '"] .js-product-edition-option'), function (editionOption) {
            var name = editionOption.getAttribute('data-edition-option-id');
            if (edition[name]) {
                var value = edition[name];
                var el_select = editionOption.querySelector('.js-product-edition-option-variants');
                // Superbimportant check to avoid maximum call stack error
                if (el_select.value !== value) {
                    el_select.value = value;
                    el_select.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    // change price
    if (edition.price && parseFloat(edition.price) !== 0) {
        var formattedPrice = t_store__getFormattedPrice(opts, edition.price);
        var formattedPriceRange = t_store__getFormattedPriceRange(opts, product);
        formattedPrice = formattedPriceRange ? formattedPriceRange : formattedPrice;
        el_product.querySelector('.js-store-prod-price-val').textContent = formattedPrice;
        var storeProdPrice = el_product.querySelector('.js-store-prod-price');
        if (storeProdPrice) {
            storeProdPrice.style.display = '';
        }

        var cleanPrice = t_store__cleanPrice(edition.price);
        var productPrice = el_product.querySelector('.js-product-price');
        if (productPrice) {
            productPrice.setAttribute('data-product-price-def', cleanPrice);
            productPrice.setAttribute('data-product-price-def-str', cleanPrice);
        }

        t_store__removeElement(el_product.querySelector('.t-store__prod__price-portion'));
        if (product.portion > 0) {
            var str = '<div class="t-store__prod__price-portion"><span class="t-store__prod__price-portion-slash">/</span>';
            if (product.portion !== '1') {
                str += +product.portion + ' ';
            }
            str += t_store_dict(product.unit) + '</div>';
            Array.prototype.forEach.call(el_product.querySelectorAll('.t-store__card__price-currency + .js-product-price, .js-product-price + .t-store__card__price-currency, .t-store__prod-popup__price-currency + .js-product-price, .js-product-price + .t-store__prod-popup__price-currency'), function (selector) {
                selector.insertAdjacentHTML('afterend', str);
            });
        }
    } else {
        var storeProdPrice = el_product.querySelector('.js-store-prod-price');
        if (storeProdPrice) {
            storeProdPrice.style.display = 'none';
        }
        el_product.querySelector('.js-store-prod-price-val').textContent = '';
        el_product.querySelector('.js-product-price').setAttribute('data-product-price-def', '');
        el_product.querySelector('.js-product-price').setAttribute('data-product-price-def-str', '');
        t_store__removeElement(el_product.querySelector('.t-store__prod__price-portion'));
    }

    // change old price
    if (edition.priceold && edition.priceold !== '0') {
        var formattedPriceOld = t_store__getFormattedPrice(opts, edition.priceold);
        var storeProdPriceOld = el_product.querySelector('.js-store-prod-price-old');
        if (storeProdPriceOld) {
            storeProdPriceOld.style.display = '';
        }
        var cardPriceOld = el_product.querySelector('.t-store__card__price_old');
        if (cardPriceOld) {
            cardPriceOld.style.display = '';
        }
        el_product.querySelector('.js-store-prod-price-old-val').innerHTML = formattedPriceOld;
    } else {
        var storeProdPriceOld = el_product.querySelector('.js-store-prod-price-old');
        if (storeProdPriceOld) {
            storeProdPriceOld.style.display = 'none';
        }
        var cardPriceOld = el_product.querySelector('.t-store__card__price_old');
        if (cardPriceOld) {
            cardPriceOld.style.display = 'none';
        }
        el_product.querySelector('.js-store-prod-price-old-val').innerHTML = '';
    }

    // add product brand
    var el_brandWrapper = el_product.querySelector('.t-store__prod-popup__brand');
    if (product.brand && product.brand > '' && el_brandWrapper) {
        if (el_brandWrapper.querySelectorAll('span[itemprop=brand]').length == 1) {
            el_brandWrapper.querySelector('span[itemprop=brand]').innerHTML = product.brand;
        } else {
            el_brandWrapper.innerHTML = '<span itemprop="brand" class="js-product-brand">' + product.brand + '</span>';
        }
    }

    // hide empty product's brand
    if (!product.brand && el_brandWrapper) {
        el_brandWrapper.style.display = 'none';
    }

    // change SKU
    var el_skuWrapper = el_product.querySelector('.t-store__prod-popup__sku');
    var el_sku = el_product.querySelector('.js-store-prod-sku');
    if (edition.sku) {
        el_sku.innerHTML = edition.sku;
        if (el_product.getAttribute('cardSize') === 'large') {
            el_sku.style.display = '';
            if (el_skuWrapper) {
                el_skuWrapper.style.display = '';
            }
        }
    } else {
        if (el_sku) {
            el_sku.innerHTML = '';
            el_sku.style.display = 'none';
        }
        if (el_skuWrapper) {
            el_skuWrapper.style.display = 'none';
        }
    }

    // change quantity
    el_product.setAttribute('data-product-inv', edition.quantity);

    // change UID
    el_product.setAttribute('data-product-lid', edition.uid);
    el_product.setAttribute('data-product-uid', edition.uid);

    if (!window.t_store__defPackObj) {
        window.t_store__defPackObj = {};
    }

    // change pack and weight
    try {
        var defpackobj = window.t_store__defPackObj[edition.uid];

        if (edition.pack_x && edition.pack_y && edition.pack_z) {
            if (!defpackobj) {
                defpackobj = {
                    pack_x: el_product.getAttribute('data-product-pack-x') || 0,
                    pack_y: el_product.getAttribute('data-product-pack-y') || 0,
                    pack_z: el_product.getAttribute('data-product-pack-z') || 0,
                    pack_label: el_product.getAttribute('data-product-pack-label') || product.pack_label || 'lwh',
                    pack_m: el_product.getAttribute('data-product-pack-m') || 0,
                };
                window.t_store__defPackObj[edition.uid] = defpackobj;
            }

            el_product.setAttribute('data-product-pack-x', edition.pack_x);
            el_product.setAttribute('data-product-pack-y', edition.pack_y);
            el_product.setAttribute('data-product-pack-z', edition.pack_z);
            el_product.setAttribute('data-product-pack-label', defpackobj.pack_label);

            var dimmension = '';
            dimmension += edition.pack_x + 'x' + edition.pack_y + 'x' + edition.pack_z;
            var storeProdDimensions = el_product.querySelector('.js-store-prod-dimensions');
            if (storeProdDimensions) {
                el_product.querySelector('.js-store-prod-dimensions').innerHTML = t_store_dict('product-' + defpackobj.pack_label) + ': ' + dimmension + '&nbsp;' + t_store_dict('mm');
            }
        } else if (defpackobj && defpackobj.pack_x) {
            el_product.setAttribute('data-product-pack-x', defpackobj.pack_x);
            el_product.setAttribute('data-product-pack-y', defpackobj.pack_y);
            el_product.setAttribute('data-product-pack-z', defpackobj.pack_z);
            el_product.setAttribute('data-product-pack-label', defpackobj.pack_label);

            var dimmension = '';
            dimmension += defpackobj.pack_x + 'x' + defpackobj.pack_y + 'x' + defpackobj.pack_z;
            var storeProdDimensions = el_product.querySelector('.js-store-prod-dimensions');
            if (storeProdDimensions) {
                storeProdDimensions.innerHTML = t_store_dict('product-' + defpackobj.pack_label) + ': ' + dimmension + '&nbsp;' + t_store_dict('mm');
            }
        }

        var storeProdWeight = el_product.querySelector('.js-store-prod-weight');
        if (storeProdWeight) {
            if (edition.pack_m) {
                el_product.setAttribute('data-product-pack-m', edition.pack_m);
                storeProdWeight.innerHTML = t_store_dict('product-weight') + ': ' + edition.pack_m + '&nbsp;' + t_store_dict('g');
            } else if (defpackobj && parseFloat(defpackobj.pack_m) > 0) {
                el_product.setAttribute('data-product-pack-m', defpackobj.pack_m);
                storeProdWeight.innerHTML = t_store_dict('product-weight') + ': ' + defpackobj.pack_m + '&nbsp;' + t_store_dict('g');
            }
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }

    // change edition img
    if (edition.img) {
        el_product.setAttribute('data-product-img', edition.img);

        // move slider
        if (el_product.getAttribute('cardSize') === 'large') {
            t_store_product_updateEdition_moveSlider(recid, el_product, edition);
        } else if (isChanged) {
            t_store_get_productCard_img_replaceWith(product, el_product, opts, edition.img);
        }
    } else {
        // move slider to default image, if previus edition had cutomized image (and filled attribute data-product-img)
        var prevEditionImgUrl = el_product.getAttribute('data-product-img');
        if (typeof prevEditionImgUrl !== 'undefined' && prevEditionImgUrl !== '' && el_product.getAttribute('cardSize') === 'large') {
            t_store_product_updateEdition_moveSlider(recid, el_product, edition);
            el_product.setAttribute('data-product-img', '');
        }
    }

    if (product.portion > 0) {
        // unit
        el_product.setAttribute('data-product-unit', product.unit);

        // portion
        el_product.setAttribute('data-product-portion', product.portion);

        // single
        el_product.setAttribute('data-product-single', product.single);
    } else {
        el_product.removeAttribute('data-product-unit');
        el_product.removeAttribute('data-product-portion');
        el_product.removeAttribute('data-product-single');
    }
}

function t_store_product_updateEdition_moveSlider(recid, el_product, edition) {
    if (!el_product.querySelector('.t-slds')) {
        var sliderReadyEvent = function () {
            t_store_product_updateEdition_moveSlider(recid, el_product, edition);
            el_product.removeEventListener('sliderIsReady', sliderReadyEvent);
        };

        el_product.removeEventListener('sliderIsReady', sliderReadyEvent);
        el_product.addEventListener('sliderIsReady', sliderReadyEvent);
        return;
    }
    var pos = 1;

    if (edition.img.indexOf('&amp;') !== -1) {
        edition.img = edition.img.replace('&amp;', '&');
    }
    var sliderWrapper = el_product.querySelector('.t-slds__items-wrapper');
    var el_editionImg = el_product.querySelector('.t-slds__item .t-slds__bgimg[data-original="' + edition.img + '"]');

    var el_editionImgFreeOrTrial = el_product.querySelector('.t-slds__item .t-slds__bgimg[data-original="' + (edition.img || '').replace('static.tildacdn.com', 'static.tildacdn.info') + '"]');
    if (!el_editionImg && el_editionImgFreeOrTrial) {
        el_editionImg = el_editionImgFreeOrTrial;
    }

    // detect position of image inside slider
    if (el_editionImg && edition.img) {
        pos = el_editionImg.closest('.t-slds__item').getAttribute('data-slide-index');
        if (parseInt(pos, 10) === 0) {
            pos = sliderWrapper.getAttribute('data-slider-totalslides');
        }
    }

    // move slider without animation
    sliderWrapper.setAttribute('data-slider-pos', pos);
    t_store_onFuncLoad('t_slideMoveInstantly', function () {
        t_slideMoveInstantly(recid + ' .js-store-product');
    });

    var storeProduct = document.querySelector('#rec' + recid + ' .js-store-product');
    var sliderReadyEvent = function () {
        t_slideMoveInstantly(recid + ' .js-store-product');
        storeProduct.removeEventListener('sliderIsReady', sliderReadyEvent);
    };

    storeProduct.removeEventListener('sliderIsReady', sliderReadyEvent);
    storeProduct.addEventListener('sliderIsReady', sliderReadyEvent);
}

function t_store_product_triggerSoldOutMsg(el_product, isSoldOut, opts) {
    t_store__removeElement(el_product.querySelector('.js-store-prod-sold-out'));
    var el_buyBtn = el_product.querySelectorAll('[href="#order"]');
    var soldOutMsg;

    if (el_product instanceof jQuery) {
        el_product = el_product[0];
    }

    if (!el_buyBtn[0]) {
        return;
    }

    // TODO: remove
    // eslint-disable-next-line no-jquery/no-jquery-constructor, no-jquery/no-each-collection
    $('.r .js-store-product').each(function (i, product) {
        // eslint-disable-next-line no-jquery/no-jquery-constructor, no-jquery/no-attr, no-jquery/no-data
        $(product).attr('cardSize', $(product).data('cardSize'));
    });

    if (el_product.getAttribute('cardSize') === 'large') {
        var el_buyBtnTxt = el_buyBtn[0].querySelector('.js-store-prod-popup-buy-btn-txt');
        if (!el_buyBtnTxt) {
            el_buyBtnTxt = el_buyBtn[0].querySelector('.js-store-prod-buy-btn-txt');
        }

        if (isSoldOut) {
            soldOutMsg = t_store_get_soldOutMsg_html();
            el_product.querySelector('.js-store-price-wrapper').insertAdjacentHTML('beforeend', soldOutMsg);
            Array.prototype.forEach.call(el_buyBtn, function (btn) {
                btn.classList.add('t-store__prod-popup__btn_disabled');
            });
            if (el_buyBtnTxt) {
                el_buyBtnTxt.textContent = t_store_dict('soldOut');
            }
        } else {
            Array.prototype.forEach.call(el_buyBtn, function (btn) {
                btn.classList.remove('t-store__prod-popup__btn_disabled');
            });
            var btnTitle = opts.buyBtnTitle || (opts.popup_opts && opts.popup_opts.btnTitle) || t_store_dict('addtocart');
            if (el_buyBtnTxt) {
                el_buyBtnTxt.textContent = btnTitle;
            }
        }
    } else if (el_product.getAttribute('cardSize') === 'small') {
        if (isSoldOut) {
            soldOutMsg = t_store_get_soldOutMsg_html();
            el_product.querySelector('.js-store-price-wrapper').insertAdjacentHTML('beforeend', soldOutMsg);
            if (el_buyBtn.length > 1) {
                el_buyBtn[el_buyBtn.length - 1].style.display = 'none';
            } else if (el_buyBtn[0]) {
                el_buyBtn[0].style.display = 'none';
            }
        } else if (el_buyBtn.length) {
            Array.prototype.forEach.call(el_buyBtn, function (btn) {
                btn.style.display = '';
            });
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

            // product modificator
            // generate options tags for select
            tplOneOptionTag = '<option value="[[value]]" data-product-variant-price="[[price]]">[[text]]</option>';
            var valuesArr = curOption.values.split('\n');

            Array.prototype.forEach.call(valuesArr, function (value) {
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
            // edition option
            // generate options tags for select

            tplOneOptionTag = '<option value="[[value]]">[[text]]</option>';
            Array.prototype.forEach.call(curOption.values, function (value) {
                if (value !== '') {
                    optionsTags += tplOneOptionTag
                        .replace(/\[\[value\]\]/g, t_store_escapeQuote(value).replace(/&amp;/g, '&amp;amp;'))
                        .replace(/\[\[text\]\]/g, t_store_escapeQuote(value));
                }
            });

            if (optionsTags !== '') {
                tplSelect = t_store_get_control_editionOption_html(options, curOption);
                str = tplSelect
                    .replace(/\[\[id\]\]/g, curOption.id.replace(/&amp;/g, '&amp;amp;'))
                    .replace(/\[\[name\]\]/g, curOption.name)
                    .replace(/\[\[optiontags\]\]/g, optionsTags);
            }
        }
        // add select to controls optionsWrapper
        if (str) {
            optionsWrapper.insertAdjacentHTML('beforeend', str);
        }

        // Add styled custom select into the DOM
        var isCustomOption = t_store_option_checkIfCustom(curOption);
        if (isCustomOption) {
            t_store_option_styleCustomControl(recid, options, curOption, optionsWrapper, firstAvailabeEdition);
        }

        // return a link to edition option control element
        if (type === 'editionopt') {
            var last = document.querySelectorAll('.js-product-edition-option').length - 1;
            return optionsWrapper.querySelectorAll('.js-product-edition-option')[last];
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
                // Store all option images for proper render later
                imagesObj: t_store_product_getEditionOptionsArr_getImgValues(p, editions),
                valuesObj: optionsData && optionsData[p] ? optionsData[p].values : {}
            };

            editionOptions.push(propEl);
        }
    });

    return editionOptions;
}

function t_store_product_getFirstAvailableEditionData(editions) {
    // iterate editions and return first available
    for (var i = 0; i < editions.length; i++) {
        var curEdition = editions[i];
        if (parseInt(curEdition.quantity, 10) !== 0) {
            return curEdition;
        }
    }
    return editions[0];
}

function t_store_product_getFirstAvailableEditionData_forCertainVals(editions, optsValsBeforeChangedArr, el_product, curVal) {
    var firstAvailable = '';
    // iterate editions and return first available with chosen options
    for (var i = 0; i < editions.length; i++) {
        var curEdition = editions[i];
        var doesContainSelectedOpts = true;

        // check if edition contain checked options
        for (var j = 0; j < optsValsBeforeChangedArr.length; j++) {
            var name = optsValsBeforeChangedArr[j].name;
            var id = optsValsBeforeChangedArr[j].id;
            var val = t_store_product_getCurEditionOptValById(el_product, id);

            if (curVal !== undefined && j === optsValsBeforeChangedArr.length - 1) {
                val = curVal;
            }

            if (curEdition[name] !== val) {
                doesContainSelectedOpts = false;
                break;
            }
        }

        if (doesContainSelectedOpts) {
            if (parseInt(curEdition.quantity, 10) !== 0) {
                return curEdition;
            } else if (!firstAvailable) {
                firstAvailable = curEdition;
            }
        }
    }

    return firstAvailable;
}

function t_store_product_getEditionOptionsArr_getValues(prop, editions) {
    var values = [];

    // iterate all editions and collect unique property values
    editions.forEach(function (curEdition) {
        var val = curEdition[prop];
        if (values.indexOf(val) === -1) {
            values.push(val);
        }
    });

    values = t_store_product_sortValues(values);

    return values;
}

function t_store_product_sortValues(values, type, filterValues) {
    var result = values || [];
    if (!values.length) return result;
    var testValue = type === 'filter' ? values[0].value.toString() : values[0].toString();

    // Preserve case sensitive logic for now
    var clothesOrder = ['XXXS', '3XS', 'XXS', '2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', 'XXXXL', 'BXL', '4XL', 'BXXL', '5XL', 'BXXXL', '6XL'];

    var wattOrder = ['Вт', 'W', 'даВт', 'daW', 'гВт', 'hW', 'кВт', 'kW', 'мВт', 'mW', 'ГВт', 'GW', 'ТВт', 'TW', 'ПВт', 'PW'];

    var bytesOrder = ['Б', 'B', 'Кб', 'Кбайт', 'KiB', 'KB', 'Мбайт', 'Мб', 'MiB', 'MB', 'Mb', 'Гбайт', 'Гб', 'GiB', 'GB', 'Gb', 'Тбайт', 'Тб', 'TiB', 'TB'];

    var weightOrder = ['мкг', 'mcg', 'мг', 'mg', 'г', 'g', 'кг', 'kg', 'т', 't', 'ц'];

    var lengthOrder = ['мкм', 'мм', 'mm', 'дм', 'dm', 'см', 'cm', 'м', 'm', 'км', 'km'];

    var litreOrder = ['мл', 'л'];

    var units = {
        wattOrder: wattOrder,
        bytesOrder: bytesOrder,
        weightOrder: weightOrder,
        lengthOrder: lengthOrder,
        litreOrder: litreOrder,
    };

    // Check if ALL user values are matched clothesOrder array data
    var isCloth = true;
    var checkValues = filterValues ? filterValues : values;
    checkValues.forEach(function (value) {
        if (typeof value == 'string') {
            value = value.trim().toUpperCase();
            if (clothesOrder.indexOf(value) < 0) {
                isCloth = false;
            }
        }
    });

    if (isCloth) {
        result = result.sort(function (a, b) {
            var valueA = type === 'filter' ? a.value : a;
            var valueB = type === 'filter' ? b.value : b;

            return clothesOrder.indexOf(valueA) - clothesOrder.indexOf(valueB);
        });
    } else {
        try {
            result = values.sort(function (a, b) {
                var valueA = type === 'filter' ? a.value : a;
                var valueB = type === 'filter' ? b.value : b;
                valueA = parseFloat(valueA.toString().replace(',', '.').trim());
                valueB = parseFloat(valueB.toString().replace(',', '.').trim());

                if (!isNaN(valueA) && !isNaN(valueB)) {
                    return valueA - valueB;
                } else {
                    return 0;
                }
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
        }

        try {
            for (var unit in units) {
                var values = units[unit];

                var isUnit = t_store_product_testUnits(values, testValue);
                var re = new RegExp(/^\d*,?\.?\d+\s*/, 'gi');

                if (isUnit) {
                    result = result.sort(function (a, b) {
                        var valueA = type === 'filter' ? a.value : a;
                        var valueB = type === 'filter' ? b.value : b;
                        valueA = valueA.toString().replace(re, '').trim();
                        valueB = valueB.toString().replace(re, '').trim();

                        return values.indexOf(valueA) - values.indexOf(valueB);
                    });

                    return result;
                }
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
        }
    }

    return result;
}

function t_store_product_testUnits(values, testValue) {
    // Test testValue on [values] and return true if testValue contains measure unit
    var result = false;
    testValue = testValue.replace(/\s/g, '');

    for (var i = 0; i < values.length; i++) {
        var value = values[i];

        var test = '^[\\d.,]+(' + value + '){1}$';
        var re = new RegExp(test, 'i');

        if (re.test(testValue)) {
            result = true;
            break;
        }
    }

    return result;
}

function t_store_product_getEditionOptionsArr_getParams(p, product, optionsData) {
    var params = {};

    if (optionsData) {
        // Store current option parametrs and all option values in current option. Use it to style custom UI later
        params = optionsData[p] ? optionsData[p].params : {};
    } else {
        var json_options = JSON.parse(product.json_options);
        if (json_options) {
            json_options.forEach(function (optionObj) {
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
        if (!values[val]) {
            values[val] = curEdition.img;
        }
    });

    return values;
}

function t_store_product_getCurEditionOptValById(el_product, id) {
    var el_optionsWrap = el_product.querySelector('.js-product-edition-option[data-edition-option-id="' + id + '"]');
    if (el_optionsWrap) {
        return el_optionsWrap.querySelector('.js-product-edition-option-variants').value;
    } else {
        return '';
    }
}

function t_store_product_getEditionSelectEl(wrapper, curOption) {
    return wrapper.querySelector('.js-product-edition-option[data-edition-option-id="' + curOption.id + '"]');
}

function t_store_combineOptionIdByName(text) {
    return text.replace(/[/\\'"<>{}]/g, '');
}

function t_store_getProductFirstImg(product) {
    if (product.gallery && product.gallery[0] === '[') {
        var galleryArr = JSON.parse(product.gallery);
        if (galleryArr[0] && galleryArr[0].img) {
            return galleryArr[0].img;
        }
    }
    return '';
}

function t_store__getFormattedPrice(opts, price) {
    if (typeof price == 'undefined' || price === null || price == 0 || price == '') {
        return '';
    }
    price = t_store__cleanPrice(price);
    price = price.toString();

    var showDecPart = false;
    var hasDefinedSeparator = false;

    if (opts.currencyDecimal) {
        showDecPart = opts.currencyDecimal === '00';
    } else if (typeof window.tcart != 'undefined' && typeof window.tcart['currency_dec'] != 'undefined') {
        showDecPart = window.tcart['currency_dec'] === '00';
    }

    if (opts.currencySeparator) {
        hasDefinedSeparator = opts.currencySeparator === '.';
    } else if (typeof window.tcart != 'undefined' && typeof window.tcart['currency_sep'] != 'undefined') {
        hasDefinedSeparator = window.tcart['currency_sep'] === '.';
    }

    // always show decimial part, if it was defined in settings
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

    // show correct decimial separator
    if (hasDefinedSeparator) {
        price = price.replace(',', '.');
    } else {
        price = price.replace('.', ',');
    }

    // divide thousands with spaces
    price = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return price;
}

function t_store__getFormattedPriceRange(opts, product) {
    // Important: return null if user selected to draw product variants UI in product card
    if (!Object.prototype.hasOwnProperty.call(opts, 'prodCard') ||
        opts.prodCard.showOpts ||
        !opts.price.priceRange ||
        opts.price.priceRange == '' ||
        !Object.prototype.hasOwnProperty.call(product, 'minPrice') ||
        !Object.prototype.hasOwnProperty.call(product, 'maxPrice')) {
        return null;
    }

    var minPrice = product.minPrice;
    var maxPrice = product.maxPrice;

    if (minPrice !== null && maxPrice !== null && minPrice !== maxPrice) {
        minPrice = t_store__getFormattedPrice(opts, minPrice);
        maxPrice = t_store__getFormattedPrice(opts, maxPrice);
        var priceRangeDesign = opts.price.priceRange;

        if (opts.currencyTxt) {
            if (opts.currencySide === 'l') {
                minPrice = opts.currencyTxt + minPrice;
            } else if (opts.currencySide === 'r') {
                if (priceRangeDesign === 'range') {
                    maxPrice = maxPrice + ' ' + opts.currencyTxt;
                } else if (priceRangeDesign === 'from') {
                    minPrice = minPrice + ' ' + opts.currencyTxt;
                }
            }
        }

        if (priceRangeDesign === 'range') {
            return minPrice + '&mdash;' + maxPrice;
        } else if (priceRangeDesign === 'from') {
            return t_store_dict('from') + ' ' + minPrice;
        }

    } else {
        return null;
    }
}

function t_store_filters_init(recid, opts, data) {
    if (!data.sort && !data.search && (!data.filters || data.filters.length === 0)) {
        return;
    }
    var el_rec = document.getElementById('rec' + recid);
    if (el_rec.querySelectorAll('.js-store-filter').length > 0) {
        return;
    }
    // draw html
    t_store_filters_drawControls(recid, opts, data);
    // show controls in absolute positioned box after click on title
    t_store_filters_showHideFilterControls(recid, el_rec);
    // send data on contrsol change
    t_store_filters_handleOnChange(recid, opts);
}

function t_store_filters_showHideFilterControls(recid, el_rec) {
    window.addEventListener('click', function (e) {
        var el_title = '';
        var clickedOnTitle = (e.target.classList.contains('js-store-filter-item-title') || e.target.closest('.js-store-filter-item-title')) && e.target.closest('#rec' + recid);
        var clickedInsideWrapper = e.target.classList.contains('js-store-filter-item-controls-wr') || e.target.closest('.js-store-filter-item-controls-wr');

        if (clickedOnTitle) {
            // catch click on title
            el_title = e.target;
        } else if (clickedInsideWrapper) {
            // catch click on controls wrapper
            return;
        } else {
            // catch click outside
            Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-item'), function (filterItem) {
                filterItem.classList.remove('active');
            });
            return;
        }

        // show or hide controls wrapper
        var el_item = el_title.closest('.js-store-filter-item');
        var el_controlsWrap = el_item.querySelector('.js-store-filter-item-controls-wr');
        if (el_item.classList.contains('active')) {
            el_item.classList.remove('active');
        } else {
            Array.prototype.forEach.call(document.querySelectorAll('.js-store-filter-item'), function (filterItem) {
                filterItem.classList.remove('active');
            });
            el_item.classList.add('active');
            if (el_controlsWrap.getBoundingClientRect().right + window.pageXOffset < 10) {
                el_controlsWrap.classList.add('t-store__filter__item-controls-wrap_left');
            } else if (el_controlsWrap.getBoundingClientRect().right + window.pageXOffset < 0) {
                // eslint-disable-next-line no-console
                console.log('controlsWrap offset right < 0');
            }
        }
    });
}

function t_store_filters_drawControls(recid, opts, data) {
    t_store_filters_cashSortOptsInData(data);
    // draw search, sort and filters
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

    if (!opts.sidebar || window.innerWidth < 960) {
        str += searchSortStr;
    } else {
        // Attach search and sort to t951 (block with sidebar) if any
        var el_rec = document.getElementById('rec' + recid);
        var el_sidebarBlock = el_rec.querySelector('.t951__cont-w-filter');
        if (el_sidebarBlock) {
            el_sidebarBlock.insertAdjacentHTML('afterbegin', searchSortStr);
        }
    }

    str += '    </div>';

    // Place chosen filters bar in a proper place in DOM
    var choseBarStr = '';
    choseBarStr += '    <div class="t-store__filter__chosen-bar" style="display: none;">';
    choseBarStr += '    ' + t_store_filters_opts_chosenVals_getHtml();
    choseBarStr += '    ' + t_store_filters_prodsNumber_getHtml();
    choseBarStr += '    </div>';

    if (!opts.sidebar) {
        str += choseBarStr;
    }
    str += '</div>';

    var el_rec = document.getElementById('rec' + recid);
    var el_filterWrapper = el_rec.querySelector('.js-store-parts-select-container');
    t_store__removeElement(el_rec.querySelector('.js-store-filter'));

    if (opts.sidebar) {
        el_filterWrapper.insertAdjacentHTML('beforeend', choseBarStr);
        var t951Wrapper = el_filterWrapper.querySelector('.t951__sidebar-wrapper');
        if (t951Wrapper) {
            t951Wrapper.insertAdjacentHTML('beforeend', str);
        }
    } else {
        el_filterWrapper.insertAdjacentHTML('beforeend', str);
    }

    el_rec.dispatchEvent(new Event('controlsDrawn'));
    // workaround for controls with possibility to chech several values - save data in hidden input as array
    t_store_filters_opts_checkboxes_groupCheckedToHiddenInput(recid);
    // we use customized select, so need to keep value in hidden value
    t_store_filters_opts_customSelect_saveToHiddenInput(recid);
    // init ui btns on mobile
    t_store_filters_initUIBtnsOnMobile(el_rec);
    // init reset button
    t_store_filters_initResetBtn(recid, opts);
    // init expand buttons
    t_store_filters_initExpandBtn(recid);
}

function t_store_filters_initResetBtn(recid, opts) {
    var el_rec = document.getElementById('rec' + recid);
    el_rec.querySelector('.js-store-filter-reset').addEventListener('click', function () {
        // clear all filters fields
        Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-search, .js-store-filter-sort, .js-store-filter-opt'), function (filter) {
            filter.value = '';
        });

        // reset all parts; that's because our parts and filter parts are the same stuff (legacy stuff)
        Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-parts-switcher.t-active'), function (switcher) {
            switcher.classList.remove('t-active');
        });
        var resetAll = el_rec.querySelector('.js-store-parts-switcher.t-store__parts-switch-btn-all');
        if (resetAll) {
            resetAll.classList.add('t-active');
        }

        // price fields — to default values

        // min
        var el_min = el_rec.querySelector('.js-store-filter-pricemin');
        if (el_min) {
            var minPrice = t_store__getFormattedPrice(opts, el_min.getAttribute('data-min-val'));
            el_min.value = minPrice;
        }

        // max
        var el_max = el_rec.querySelector('.js-store-filter-pricemax');
        if (el_max) {
            var maxPrice = t_store__getFormattedPrice(opts, el_max.getAttribute('data-max-val'));
            el_max.value = maxPrice;
        }

        // checkboxes
        Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-onlyavail, .js-store-filter-opt-chb'), function (item) {
            item.checked = false;
        });
        // change custom controls view
        var storeFilterCustomSelect = el_rec.querySelector('.js-store-filter-custom-select');
        if (storeFilterCustomSelect) {
            storeFilterCustomSelect.classList.remove('active');
        }
        el_rec.querySelector('.t-store__filter__checkbox').classList.remove('active');

        // reset controls previous values
        if (el_min) {
            el_min.setAttribute('data-previousmin', minPrice);
        }
        if (el_max) {
            el_max.setAttribute('data-previousmax', maxPrice);
        }
        var storeFilterOpt = el_rec.querySelector('.t-store__filter__item_select .js-store-filter-opt');
        if (storeFilterOpt) {
            storeFilterOpt.setAttribute('data-previousval', '');
        }
        el_rec.querySelector('.t-store__filter__chosen-bar').style.display = 'none';

        // send data
        var el_min_range = el_rec.querySelector('.t-store__filter__range_min');
        var el_max_range = el_rec.querySelector('.t-store__filter__range_max');
        if (opts.sidebar && el_min_range && el_max_range) {
            // Filters will be updated in the following function call
            t_store_filters_updatePriceRange(el_rec);
        } else {
            t_store_filters_send(recid, opts);
        }

        if (opts.sidebar) {
            t_store_filters_opts_sort(opts, recid);
            t_store_filters_scrollStickyBar(el_rec);
        }

        var storeFilterChosenItem = el_rec.querySelectorAll('.js-store-filter-chosen-item');
        Array.prototype.forEach.call(storeFilterChosenItem, function (item) {
            t_store__removeElement(item);
        });
        var storeFilterReset = el_rec.querySelector('.js-store-filter-reset');
        if (storeFilterReset) {
            storeFilterReset.classList.remove('t-store__filter__reset_visible');
        }
        var storeFilterSearchClose = el_rec.querySelector('.js-store-filter-search-close');
        if (storeFilterSearchClose) {
            storeFilterSearchClose.style.display = 'none';
        }
        t_store_updateUrlWithParams('delete_all', null, null, recid);
    });
}

function t_store_filters_initExpandBtn(recid) {
    var el_rec = document.getElementById('rec' + recid);
    var btnsExpanded = el_rec.querySelectorAll('.js-store-filter-btn-expand');
    Array.prototype.forEach.call(btnsExpanded, function (btn) {
        btn.addEventListener('click', function () {
            var isExpanded = this.getAttribute('data-expanded') !== 'no';
            var el_filters = this.parentNode.querySelector('.t-store__filter__item-controls-container');
            var button_text = this.querySelector('.t-store__filter__btn-text');

            if (isExpanded) {
                Array.prototype.forEach.call(el_filters.querySelectorAll('.t-checkbox__control'), function (control, i) {
                    if (i > 9) {
                        control.classList.add('t-checkbox__control_hidden');
                    }
                });

                Array.prototype.forEach.call(el_filters.querySelectorAll('.t-store__filter__custom-sel'), function (filter, i) {
                    if (i > 9) {
                        this.classList.add('t-store__filter__custom-sel_hidden');
                    }
                });

                button_text.textContent = t_store_dict('filter-expand');
                el_filters.classList.remove('t-store__filter__item-controls-container_expanded');
                this.setAttribute('data-expanded', 'no');
            } else {
                el_filters.querySelector('.t-checkbox__control_hidden').classList.remove('t-checkbox__control_hidden');
                var storeFilterCustomSelHidden = el_filters.querySelector('.t-store__filter__custom-sel_hidden');
                if (storeFilterCustomSelHidden) {
                    storeFilterCustomSelHidden.classList.remove('t-store__filter__custom-sel_hidden');
                }

                button_text.textContent = t_store_dict('filter-collapse');
                el_filters.classList.add('t-store__filter__item-controls-container_expanded');
                this.setAttribute('data-expanded', 'yes');
            }
        });
    });
}

function t_store_filters_cashSortOptsInData(data) {
    data.sortControlData = {
        name: 'sort',
        label: t_store_dict('sort-label'),
        values: [{
                value: '',
                text: t_store_dict('sort-default')
            },
            {
                value: 'price:asc',
                text: t_store_dict('sort-price-asc')
            },
            {
                value: 'price:desc',
                text: t_store_dict('sort-price-desc')
            },
            {
                value: 'title:asc',
                text: t_store_dict('sort-name-asc')
            },
            {
                value: 'title:desc',
                text: t_store_dict('sort-name-desc')
            },
            {
                value: 'created:desc',
                text: t_store_dict('sort-created-desc')
            },
            {
                value: 'created:asc',
                text: t_store_dict('sort-created-asc')
            },
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
    var el_filtBtn = el_rec.querySelector('.js-store-filter-mob-btn');
    var el_filtOpts = el_rec.querySelector('.t-store__filter__options');
    var el_searchBtn = el_rec.querySelector('.js-store-search-mob-btn');
    var el_searchWrap = el_rec.querySelector('.t-store__filter__search-and-sort');

    if (el_filtBtn) {
        el_filtBtn.addEventListener('click', function () {
            el_searchWrap.style.display = 'none';
            el_searchBtn.classList.remove('active');

            if (el_filtBtn.classList.contains('active')) {
                el_filtOpts.style.display = 'none';
                el_filtBtn.classList.remove('active');
            } else {
                el_filtOpts.style.display = '';
                el_filtBtn.classList.add('active');
            }
        });
    }

    if (el_searchBtn) {
        el_searchBtn.addEventListener('click', function () {
            // el_filtOpts.style.display = 'none';
            el_filtBtn.classList.remove('active');

            if (el_searchBtn.classList.contains('active')) {
                el_searchWrap.style.display = 'none';
                el_searchBtn.classList.remove('active');
                el_filtBtn.classList.remove('active');
            } else {
                el_searchWrap.style.display = '';
                el_searchBtn.classList.add('active');
                el_filtBtn.classList.remove('active');
            }
        });
    }
}

function t_store_loadMoreBtn_display(recid) {
    var rec = document.getElementById('rec' + recid);
    var loadMoreWrap = rec.querySelector('.t-store__load-more-btn-wrap');
    var isMobileOneRow = window.innerWidth < 960 && rec.querySelector('.js-store-grid-cont.t-store__grid-cont_mobile-one-row')[0] ? true : false;

    if (!isMobileOneRow && loadMoreWrap && loadMoreWrap.classList.contains('t-store__load-more-btn-wrap_hidden')) {
        loadMoreWrap.classList.remove('t-store__load-more-btn-wrap_hidden');
    } else if (isMobileOneRow && !loadMoreWrap.classList.contains('t-store__load-more-btn-wrap_hidden')) {
        loadMoreWrap.classList.add('t-store__load-more-btn-wrap_hidden');
    }
}

function t_store_moveSearhSort(recid, opts) {
    var rec = document.getElementById('rec' + recid);
    var searchSort = rec.querySelector('.t-store__filter__search-and-sort');

    // If search was hidden on mobile, show it again on window resize
    // console.log($(searchSort).is(':hidden'));
    // console.log(window.getComputedStyle(searchSort).display);
    if (window.innerWidth > 960 && searchSort && window.getComputedStyle(searchSort).display === 'none') {
        searchSort.style.display = '';
    }
    // TODO: else on mobile

    // For blocks with sidebars
    // If filters are in sidebar check position in DOM and replace properly
    // No worries, it works only once on window.width > or < 960
    if (!opts.sidebar) return;

    var controlsWrapper = rec.querySelector('.t-store__filter__controls-wrapper');
    var contWithFiler = rec.querySelector('.js-store-cont-w-filter');

    if (searchSort) {
        var isSearchOnTop = searchSort.parentNode.classList.contains('js-store-cont-w-filter');

        if (window.innerWidth < 960) {
            if (isSearchOnTop) {
                t_store__removeElement(searchSort);
                controlsWrapper.insertAdjacentHTML('beforeend', searchSort);
            }
        } else if (!isSearchOnTop) {
            t_store__removeElement(searchSort);
            contWithFiler.insertAdjacentHTML('afterbegin', searchSort);
        }
    }
}

function t_store_filters_send(recid, opts) {
    var filters = {};
    var el_rec = document.getElementById('rec' + recid);
    // price
    var storeFilterPriceMin = el_rec.querySelector('.js-store-filter-pricemin');
    if (storeFilterPriceMin) {
        var minVal = t_store__cleanPrice(el_rec.querySelector('.js-store-filter-pricemin').getAttribute('data-min-val'));
        var checkedMinV = t_store__cleanPrice(el_rec.querySelector('.js-store-filter-pricemin').value);
    }
    if (checkedMinV !== minVal) {
        filters['price:min'] = checkedMinV;
    }
    var storeFilterPriceMax = el_rec.querySelector('.js-store-filter-pricemax');
    if (storeFilterPriceMax) {
        var maxVal = t_store__cleanPrice(el_rec.querySelector('.js-store-filter-pricemax').getAttribute('data-max-val'));
        var checkedMaxV = t_store__cleanPrice(el_rec.querySelector('.js-store-filter-pricemax').value);
    }

    if (checkedMaxV !== maxVal) {
        filters['price:max'] = checkedMaxV;
    }
    // availability
    if (el_rec.querySelector('.js-store-filter-onlyavail') && el_rec.querySelector('.js-store-filter-onlyavail').checked) {
        filters['quantity'] = 'y';
    }
    // options & characteristics

    var storepartuid = el_rec.querySelector('.t-store__parts-switch-wrapper .js-store-parts-switcher.t-active:not(.t-store__parts-switch-btn-all)') || '';
    if (storepartuid && storepartuid.textContent) {
        filters['storepartuid'] = storepartuid.textContent;
    }

    // var optionOrCharacteriscticsChecked = false;
    Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-opt'), function (filterOpt) {
        var v = filterOpt.value;
        var name = filterOpt.getAttribute('name');
        if (name === 'sort') {
            return;
        }

        if (v && v !== '' && filterOpt.getAttribute('data-info-type') === 'array') {
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

    // if (el_rec.querySelector('.t-store__parts-switch-wrapper').length > 0 && !optionOrCharacteriscticsChecked) {
    //     el_rec.querySelector('.t-store__parts-switch-wrapper').each(function () {
    //         var activeSwitch = $(this).find('.js-store-parts-switcher.t-active');

    //         if (activeSwitch.length > 0 && !activeSwitch.classList.contains('t-store__parts-switch-btn-all')) {
    //             filters['storepartuid'] = activeSwitch.innerHTML;
    //         }
    //     });
    // }

    // search
    var storeFilterSearch = el_rec.querySelector('.js-store-filter-search');
    if (storeFilterSearch) {
        var searchV = storeFilterSearch.value;
    }
    if (searchV) {
        filters['query'] = searchV;
    }
    // sort
    var sort = {};
    var storeFilterSort = el_rec.querySelector('.js-store-filter-sort');
    if (storeFilterSort) {
        var sortV = storeFilterSort.value;
        if (sortV === '') {
            sortV = el_rec.querySelector('.js-store-filter-opt[name="sort"]').value;

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
    }
    // redraw table
    opts.filters = filters;
    opts.sort = sort;
    t_store_filters_prodsNumber_update(el_rec, opts);
    t_store_showLoadersForProductsList(recid, opts);
    t_store_pagination_updateUrl(recid, opts, 1);
    t_store_loadProducts('', recid, opts);
}

function t_store_filters_mobileBtns_getHtml(recid, data) {
    var str = '';
    // filters
    if (data.filters.length > 0 || data.sort) {
        str += '<div class="js-store-filter-mob-btn t-store__filter__opts-mob-btn t-name t-name_xs">';
        str +=
            '<svg class="t-store__filter__opts-mob-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.42 100"><defs><style>.cls-1{fill:#1d1d1b;}</style></defs><title>2Монтажная область 1 копия</title><path class="cls-1" d="M13.75,22.59V.38h-6V22.59a10.75,10.75,0,0,0,0,20.64V99.62h6V43.23a10.75,10.75,0,0,0,0-20.64Z"/><path class="cls-1" d="M63.42,67.09a10.75,10.75,0,0,0-7.75-10.32V.38h-6V56.77a10.75,10.75,0,0,0,0,20.64V99.62h6V77.41A10.75,10.75,0,0,0,63.42,67.09Z"/></svg>';
        str += t_store_dict('filters');
        str += '</div>';
    }
    // search
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
    // add sort control, which would be shown only on mobiles
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
    var isColor,
        parentMod = '',
        itemsListMod = '';

    if (curOption) {
        parentMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item');
        itemsListMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item-controls-container');
        isColor = curOption.params && curOption.params.hasColor;
    }

    // control = select
    var sortClass = f.name === 'sort' ? 't-store__filter__item_sort-mobile' : '';
    var customClass = curOption ? ' t-store__filter__item_custom ' : ' ';

    str += '<div class="' + sortClass + ' t-store__filter__item' + customClass + parentMod + ' t-store__filter__item_select js-store-filter-item t-descr t-descr_xxs">';
    str += '    <div class="t-store__filter__item-title js-store-filter-item-title" data-filter-name="' + f.name.toLowerCase() + '">' + f.label + '</div>';
    str += '    <div class="t-store__filter__item-controls-wrap js-store-filter-item-controls-wr">';
    str += '        <div class="t-store__filter__item-controls-container ' + itemsListMod + '" data-type="selectbox">';
    str += '        <input type="hidden" class="js-store-filter-opt" name="' + f.name + '">';

    var isExpandable = false;

    if (f.values) {
        f.values = t_store_product_sortValues(f.values, 'filter');
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
                tmp = '<div class="t-store__filter__custom-sel ' + className + ' js-store-filter-custom-select ' + sortClass + '" data-select-val="" data-filter-value="" type="selectbox">';

                if (isColor) {
                    var checkmarkStyle = curOption ? ' style="background-color: ' + t_store_option_getColorValue(curOption.values, v) + ';"' : '';

                    var checkmarkMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__checkmark');
                    tmp += '<div class="t-store__filter__checkmark ' + checkmarkMod + '"' + checkmarkStyle + '></div>';
                }

                var titleMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__title');
                tmp += '<div class="t-store__filter__title ' + titleMod + '">' + (text ? text : v) + '</div>';
                tmp += '    </div>';

                var el = document.createElement('div');
                el.innerHTML = tmp;
                el.children[0].setAttribute('data-select-val', v);
                el.children[0].setAttribute('data-filter-value', v);
                str += el.children[0].outerHTML;
            }
        }
    }
    str += '        </div>';
    if (isExpandable) {
        str += t_store_filters_opts_getHtml_expandButton();
    }
    str += '    </div>';
    str += '</div>';
    return str;
}

function t_store_filters_opts_getHtml_checkbox(f, opts) {
    var str = '';
    var curOption = t_store_filters_opts_getOption(f);
    var isColor;
    var isImage;
    var parentMod = '';
    var itemsListMod = '';

    if (curOption) {
        parentMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item');
        itemsListMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__item-controls-container');

        isColor = curOption.params && curOption.params.hasColor;
        isImage = curOption.params && curOption.params.linkImage && !curOption.params.hasColor;
    }

    var customClass = curOption ? ' t-store__filter__item_custom ' : ' ';

    if (f.name === 'quantity') {
        // availability - single checkbox
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
        // control = checkboxes
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
            f.values = t_store_product_sortValues(f.values, 'filter');
            isExpandable = opts.sidebar && f.values.length > 10;

            for (var j = 0; j < f.values.length; j++) {
                var v = f.values[j].value;
                var classes = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__checkbox');
                // Hide option if t951 and list length is > 10 items
                classes = opts.sidebar && (j > 9) ? classes += ' t-checkbox__control_hidden ' : classes += '';

                var checkmarkMod = isCheckmark ? 't-store__filter__checkmark ' + t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__checkmark') : '';

                if (v !== '') {
                    var label = document.createElement('label');
                    label.classList.add('t-checkbox__control');
                    label.classList.add('t-store__filter__checkbox');
                    if (classes) {
                        classes.split(' ').forEach(function (className) {
                            if (className !== '') {
                                label.classList.add(className);
                            }
                        });
                    }
                    label.classList.add('t-descr');
                    label.classList.add('t-descr_xxs');

                    var input = document.createElement('input');
                    input.classList.add('t-checkbox');
                    input.classList.add('js-store-filter-opt-chb');
                    input.setAttribute('type', 'checkbox');
                    input.setAttribute('name', v);
                    input.setAttribute('data-filter-value', v);
                    label.appendChild(input);

                    var div = document.createElement('div');
                    div.classList.add('t-checkbox__indicator');
                    if (checkmarkMod) {
                        checkmarkMod.split(' ').forEach(function (className) {
                            if (className !== '') {
                                div.classList.add(className);
                            }
                        });
                    }
                    if (curOption && isColor) {
                        div.style.backgroundColor = t_store_option_getColorValue(curOption.values, v);
                    }
                    label.appendChild(div);

                    var span = document.createElement('span');
                    span.classList.add('t-store__filter__title');
                    var titleMod = t_store_option_getClassModificator(curOption, 'filter', 't-store__filter__title');
                    if (titleMod) {
                        titleMod.split(' ').forEach(function (className) {
                            if (className !== '') {
                                span.classList.add(className);
                            }
                        });
                    }
                    span.appendChild(document.createTextNode(v));
                    label.appendChild(span);

                    str += label.outerHTML;
                }
            }
        }
        str += '        </div>';

        if (isExpandable) {
            str += t_store_filters_opts_getHtml_expandButton();
        }
        str += '    </div>';
        str += '</div>';
    }

    return str;
}

function t_store_filters_opts_getHtml_range(f, opts) {
    var isSliderAllowed = t_store_filters_priceRange_checkIfAllowed();
    var str = '';
    // range for price
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
        t_store__getFormattedPrice(opts, f.min) +
        '">';
    str +=
        '&nbsp;—&nbsp;<input class="t-store__filter__input js-store-filter-pricemax" type="text" name="price:max" data-max-val="' +
        f.max +
        '" value="' +
        t_store__getFormattedPrice(opts, f.max) +
        '">';
    str += '<button class="t-store__filter__btn js-store-filter-price-btn">OK</button>';
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
        '<input class="t-store__filter__range t-store__filter__range_min" type="range" name="price_range" min="' + t_store__cleanPrice(f.min) + '" max="' + t_store__cleanPrice(f.max) + '" step="' + step + '" data-min-val="' +
        t_store__cleanPrice(f.min) +
        '" value="' +
        t_store__cleanPrice(t_store__cleanPrice(f.min)) +
        '">';
    str +=
        '<input class="t-store__filter__range t-store__filter__range_max" type="range" name="price_range" min="' + t_store__cleanPrice(f.min) + '" max="' + t_store__cleanPrice(f.max) + '" step="' + step + '" data-max-val="' +
        t_store__cleanPrice(f.max) +
        '" value="' +
        t_store__cleanPrice(f.max) +
        '">';
    str += '<div class="t-store__filter__range_bg"></div>';
    str += '</div>';

    return str;
}

function t_store_filters_opts_checkboxes_groupCheckedToHiddenInput(recid) {
    var el_rec = document.getElementById('rec' + recid);
    Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-opt-chb'), function (optChb) {
        optChb.addEventListener('change', function () {
            t_store_filters_opts_checkboxes_changeHiddenInput(this);
        });
    });
}

function t_store_filters_opts_checkboxes_changeHiddenInput(el_changedCheckbox, fromSwitch) {
    var el_hiddenInput = el_changedCheckbox.closest('.js-store-filter-item').querySelector('.js-store-filter-opt');
    var value = el_hiddenInput.value;
    if (el_changedCheckbox.checked) {
        // checked on change
        if (fromSwitch) {
            value = el_changedCheckbox.getAttribute('name');
        } else if (value === '') {
            value = el_changedCheckbox.getAttribute('name');
        } else {
            value += '&&' + el_changedCheckbox.getAttribute('name');
        }
    } else {
        // unchecked on change — remove from hidden input
        var arr = value.split('&&');
        var index = arr.indexOf(el_changedCheckbox.getAttribute('name'));
        if (index !== -1) {
            arr.splice(index, 1);
        }
        value = arr.join('&&');
    }
    el_hiddenInput.value = value;
    // el_hiddenInput.setAttribute('data-previousval', value);
}

function t_store_filters_opts_getHtml_expandButton() {
    var str = '';
    str += '<button class="t-store__filter__btn-expand js-store-filter-btn-expand" data-expanded="no" type="button">';
    str += '<span class="t-store__filter__btn-text t-descr t-descr_xxs">' + t_store_dict('filter-expand') + '</span>';
    str += '</button>';
    return str;
}

function t_store_filters_opts_customSelect_saveToHiddenInput(recid) {
    var el_rec = document.getElementById('rec' + recid);
    Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-custom-select'), function (customSelect) {
        customSelect.addEventListener('click', function () {
            var el_hiddenInput = this.closest('.js-store-filter-item').querySelector('.js-store-filter-opt');
            var el_filterItem = this.closest('.js-store-filter-item');
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                el_hiddenInput.value = '';
                return;
            }
            var val = this.getAttribute('data-select-val');
            el_hiddenInput.value = val;
            // remove active class from other options
            el_filterItem.querySelector('.js-store-filter-custom-select').classList.remove('active');
            // make active
            this.classList.add('active');
        });
    });
}

function t_store_filters_opts_customSelect_changeHiddenInput(element) {
    var el_hiddenInput = element.closest('.js-store-filter-item').querySelector('.js-store-filter-opt');
    var elementValue = element.getAttribute('data-select-val');
    el_hiddenInput.value = elementValue;
    el_hiddenInput.setAttribute('data-previousval', elementValue);
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

    var chosenBar = rec.querySelector('.t-store__filter__chosen-bar');
    if (chosenBar) {
        if (Object.keys(opts.filters).length && opts.previewmode.length) {
            chosenBar.style.display = '';
        } else {
            chosenBar.style.display = 'none';
        }
    }

    var changedFiltersNumber = Object.keys(opts.filters).length;
    var storeFiltersProdsNumberWrap = rec.querySelector('.js-store-filters-prodsnumber-wrap');

    if (
        changedFiltersNumber > 0 &&
        obj &&
        obj.products.length > 0 &&
        opts.isPublishedPage
        // && checkedInputsLength > 0
    ) {
        if (chosenBar) {
            chosenBar.style.display = '';
        }
        rec.querySelector('.js-store-filters-prodsnumber').textContent = obj.total;
        if (storeFiltersProdsNumberWrap) {
            storeFiltersProdsNumberWrap.style.display = '';
        }
        return;
    }

    if (storeFiltersProdsNumberWrap) {
        storeFiltersProdsNumberWrap.style.display = 'none';
    }

    // If empty part is selected, hide floating bar with chosen items
    if (opts.sidebar && chosenBar) {
        var chosenValues = chosenBar.querySelectorAll('.t-store__filter__chosen-val');
        if (!chosenValues.length) {
            chosenBar.style.display = 'none';
        }
    }
}

function t_store_filters_opts_chosenVal_add(recid, val, el_control, label) {
    var container = el_control.closest('.t-store__filter__item-controls-container');
    if (container) {
        var option = container.querySelector('.js-store-filter-opt').getAttribute('name');
    }

    // Don't add dublicated items to the DOM
    var isExist = document.getElementById('rec' + recid).querySelector('.t-store__filter__chosen-val[data-option-name="' + option + '"][data-field-val="' + val + '"]') ? true : false;
    if (isExist) {
        return;
    }

    var el = document.createElement('div');
    el.classList.add('t-store__filter__chosen-val');
    el.classList.add('js-store-filter-chosen-item');
    el.classList.add('t-descr');
    el.classList.add('t-descr_xxs');
    el.setAttribute('data-field-val', val);
    if (option) {
        el.setAttribute('data-option-name', option);
    }
    el.appendChild(document.createTextNode(label ? t_store_unescapeHtml(label) : t_store_unescapeHtml(val)));

    var str = el.outerHTML;

    // add element
    var el_wrapper = document.getElementById('rec' + recid).querySelector('.js-store-opts-chosen-wrapper');
    el_wrapper.insertAdjacentHTML('afterbegin', str);

    // cache a link to control
    var el_chosenTagItem = option ? el_wrapper.querySelector('.js-store-filter-chosen-item[data-field-val="' + val + '"][data-option-name="' + option + '"]') : el_wrapper.querySelector('.js-store-filter-chosen-item[data-field-val="' + val + '"]');
    if (el_chosenTagItem) {
        if (!window.controlElem) {
            window.controlElem = {};
        }
        if (!window.controlElem[recid]) {
            window.controlElem[recid] = {};
        }
        window.controlElem[recid][val] = el_control;
    }

    // show reset button
    if (el_wrapper.querySelectorAll('.js-store-filter-chosen-item').length > 1) {
        el_wrapper.querySelector('.js-store-filter-reset').classList.add('t-store__filter__reset_visible');
    }
}

function t_store_filters_handleOnChange(recid, opts) {
    var el_rec = document.getElementById('rec' + recid);
    // availability checkbox
    t_store_filters_handleOnChange_avail(recid, opts, el_rec);
    // price range
    t_store_filters_handleOnChange_price(recid, opts, el_rec);
    // price range slider
    if (opts.sidebar) {
        t_store_filters_handleOnChange_priceRange(recid, opts, el_rec);
    }
    // checkbox
    t_store_filters_handleOnChange_checkbox(recid, opts, el_rec);
    // selectbox
    t_store_filters_handleOnChange_selectbox(recid, opts, el_rec);
    // init sort
    t_store_filters_handleOnChange_sort(recid, opts, el_rec);
    // init search
    t_store_filters_handleOnChange_search(recid, opts, el_rec);

    // init remove tag on close icon click
    t_store_filters_opts_checkedValues_hideOnClick(recid, opts);
}

function t_store_filters_handleOnChange_avail(recid, opts, el_rec) {
    var filterOnlyAvailable = el_rec.querySelector('.js-store-filter-onlyavail');
    if (filterOnlyAvailable) {
        filterOnlyAvailable.addEventListener('change', function () {
            var controlValue = this.getAttribute('name');
            var onlyAvailableControl = this.classList.contains('js-store-filter-onlyavail');
            if (onlyAvailableControl) {
                controlValue = 'y';
            }
            var controlGroup;
            Array.prototype.forEach.call(this.closest('.t-store__filter__item-controls-wrap').parentNode.children, function (sibling) {
                if (sibling.classList.contains('js-store-filter-item-title')) {
                    controlGroup = sibling;
                }
            });

            var controlGroupdId = controlGroup.getAttribute('data-filter-name');
            if (this.checked) {
                t_store_updateUrlWithParams('add', controlGroupdId, controlValue, recid);
                t_store_filters_opts_chosenVal_add(recid, controlValue, this, t_store_dict('filter-available-label'));
            } else {
                t_store_updateUrlWithParams('delete', controlGroupdId, controlValue, recid);
                t_store_filters_opts_chosenVal_hide(el_rec, controlValue);
            }
            t_store_filters_send(recid, opts);
        });
    }
}

function t_store_filters_handleOnChange_price(recid, opts, el_rec) {
    // price range, min
    var el_priceFiltItem = el_rec.querySelector('.js-store-filter-item.t-store__filter__item_price');
    var el_min = el_rec.querySelector('.js-store-filter-pricemin');
    var el_max = el_rec.querySelector('.js-store-filter-pricemax');

    if (el_min) {
        var minVal = t_store__cleanPrice(el_min.getAttribute('data-min-val'));
    }

    if (el_max) {
        var maxVal = t_store__cleanPrice(el_max.getAttribute('data-max-val'));
    }

    if (el_min && !el_min.getAttribute('data-previousmin')) {
        el_min.setAttribute('data-previousmin', minVal);
    }

    if (opts.sidebar) {
        if (el_min) {
            el_min.addEventListener('change', function () {
                var minPriceChanged = t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts);

                if (minPriceChanged) {
                    t_store_filters_send(recid, opts);
                    var el_min_range = el_rec.querySelector('.t-store__filter__range_min');
                    el_min_range.dispatchEvent(new Event('input'));
                }
            });
        }

        if (el_max) {
            el_max.addEventListener('change', function () {
                var maxPriceChanged = t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts);

                if (maxPriceChanged) {
                    t_store_filters_send(recid, opts);
                    var el_max_range = el_rec.querySelector('.t-store__filter__range_max');
                    el_max_range.dispatchEvent(new Event('input'));
                }
            });
        }
    }

    if (el_min) {
        Array.prototype.forEach.call(['keypress', 'tstoreMinPriceTriggerReset'], function (event) {
            el_min.addEventListener(event, function (e) {
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
                        el_priceFiltItem.classList.remove('active');
                    }
                }
            });
        });
    }

    // price range, max
    if (el_max && !el_max.getAttribute('data-previousmax')) {
        el_max.setAttribute('data-previousmax', maxVal);
    }

    if (el_max) {
        Array.prototype.forEach.call(['keypress', 'tstoreMaxPriceTriggerReset'], function (event) {
            el_max.addEventListener(event, function (e) {
                if (e.type !== 'keypress' || e.which === 13) {
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
                            el_priceFiltItem.classList.remove('active');
                        }
                    }
                }
            });
        });
    }
    // submit button
    var el_btn = el_rec.querySelector('.js-store-filter-price-btn');
    if (el_btn) {
        el_btn.addEventListener('click', function () {
            var minPriceChanged = false;
            var maxPriceChanged = false;
            var isChanged = false;

            minPriceChanged = t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts);
            maxPriceChanged = t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts);

            isChanged = minPriceChanged || maxPriceChanged;

            if (isChanged) {
                t_store_filters_send(recid, opts);
                if (!window.isMobile) {
                    el_priceFiltItem.classList.remove('active');
                }
            }
        });
    }
}

function t_store_filters_handleOnChange_priceRange(recid, opts, el_rec) {
    var isSliderAllowed = t_store_filters_priceRange_checkIfAllowed();
    if (!opts.sidebar || !isSliderAllowed) {
        return;
    }

    var el_min_range = el_rec.querySelector('.t-store__filter__range_min');
    var el_max_range = el_rec.querySelector('.t-store__filter__range_max');
    var el_min_text = el_rec.querySelector('.js-store-filter-pricemin');
    var el_max_text = el_rec.querySelector('.js-store-filter-pricemax');
    if (el_min_text) {
        var min = +el_min_text.getAttribute('data-min-val');
    }
    if (el_max_text) {
        var max = +el_max_text.getAttribute('data-max-val');
    }
    if (el_min_range) {
        var minRangeVal = t_store__cleanPrice(el_min_range.value);
    }
    if (el_max_range) {
        var maxRangeVal = t_store__cleanPrice(el_max_range.value);
    }

    t_store_filters_calcPriceOuterWidth(el_rec, 'start', min, max, minRangeVal);
    t_store_filters_calcPriceOuterWidth(el_rec, 'end', min, max, maxRangeVal);

    var minTimer = null;
    var maxTimer = null;

    if (el_min_range) {
        el_min_range.addEventListener('input', function () {
            var resultVal = t_store__cleanPrice(el_min_range.value);
            var minVal = t_store__cleanPrice(el_min_range.value);
            var maxVal = t_store__cleanPrice(el_max_range.value);

            if (min === max) {
                resultVal = max;
            } else if (minVal > maxVal) {
                resultVal = maxVal - 1;
            } else if (minVal < min) {
                resultVal = min;
            } else if (minVal >= max) {
                resultVal = max - 1;
            }

            el_min_range.value = resultVal;
            var formattedPrice = resultVal ?
                t_store__getFormattedPrice(opts, resultVal.toString()) :
                resultVal;
            el_min_text.value = formattedPrice;
            t_store_filters_calcPriceOuterWidth(el_rec, 'start', min, max, resultVal);

            if (minTimer) {
                clearTimeout(minTimer);
            }

            minTimer = setTimeout(function () {
                el_min_text.dispatchEvent(new Event('tstoreMinPriceTriggerReset'));
                t_store_filters_scrollStickyBar(el_rec);
            }, 1000);
        });
    }

    if (el_max_range) {
        el_max_range.addEventListener('input', function () {
            var resultVal = t_store__cleanPrice(el_max_range.value);
            var minVal = t_store__cleanPrice(el_min_range.value);
            var maxVal = t_store__cleanPrice(el_max_range.value);

            if (min === max) {
                resultVal = max;
            } else if (maxVal < minVal) {
                resultVal = minVal + 1;
            } else if (maxVal <= min) {
                resultVal = min + 1;
            } else if (maxVal > max) {
                resultVal = max;
            }

            el_max_range.value = resultVal;
            var formattedPrice = resultVal ?
                t_store__getFormattedPrice(opts, resultVal.toString()) :
                resultVal;
            el_max_text.value = formattedPrice;
            t_store_filters_calcPriceOuterWidth(el_rec, 'end', min, max, resultVal);

            if (maxTimer) {
                clearTimeout(maxTimer);
            }

            maxTimer = setTimeout(function () {
                el_max_text.dispatchEvent(new Event('tstoreMaxPriceTriggerReset'));
                t_store_filters_scrollStickyBar(el_rec);
            }, 1000);
        });
    }
}

function t_store_filters_handleOnChange_price_checkMax(recid, el_max, minVal, maxVal, opts) {
    var el_rec = document.getElementById('rec' + recid);
    var val = t_store__cleanPrice(el_max.value);

    // check, that value was changed
    if (val !== el_max.getAttribute('data-previousmax')) {
        val = t_store_filters_handleOnChange_checkInRange(val, el_max, minVal, maxVal, 'max');

        if (opts && opts.sidebar) {
            var slider_el = el_rec.querySelector('.t-store__filter__range_max');
            slider_el.value = val;
        }

        var text = '< ' + el_max.value;
        // hide previous checked value tag, if it was alredy applied
        if (el_max.getAttribute('data-previousmax')) {
            t_store_filters_opts_chosenVal_hide(el_rec, el_max.getAttribute('data-previousmax'));
        }
        // add new checked value tag
        if (val !== maxVal) {
            t_store_filters_opts_chosenVal_add(recid, val, el_max, text);
        }
        // cash current value
        el_max.setAttribute('data-previousmax', val);

        if (val !== maxVal) {
            el_max.setAttribute('data-filter-value', val);
            t_store_updateUrlWithParams('update', 'price:max', val, recid);
        } else if (val <= maxVal) {
            el_max.setAttribute('data-filter-value', '');
            t_store_updateUrlWithParams('delete', 'price:max', val, recid);
        }
        return true;
    }
    return false;
}

function t_store_filters_handleOnChange_price_checkMin(recid, el_min, minVal, maxVal, opts) {
    var el_rec = document.getElementById('rec' + recid);
    var val = t_store__cleanPrice(el_min.value);
    // check, that value was changed

    if (val !== el_min.getAttribute('data-previousmin')) {
        val = t_store_filters_handleOnChange_checkInRange(val, el_min, minVal, maxVal, 'min');

        if (opts && opts.sidebar) {
            var slider_el = el_rec.querySelector('.t-store__filter__range_min');
            slider_el.value = val;
        }

        var text = '> ' + el_min.value;
        // hide previous checked value tag, if it was alredy applied
        if (el_min.getAttribute('data-previousmin')) {
            t_store_filters_opts_chosenVal_hide(el_rec, el_min.getAttribute('data-previousmin'));
        }
        // add new checked value tag
        if (val !== minVal) {
            t_store_filters_opts_chosenVal_add(recid, val, el_min, text);
        }
        // cash current value

        el_min.setAttribute('data-previousmin', val);

        if (val !== minVal) {
            el_min.setAttribute('data-filter-value', val);
            t_store_updateUrlWithParams('update', 'price:min', val, recid);
        } else if (val >= minVal) {
            el_min.setAttribute('data-filter-value', '');
            t_store_updateUrlWithParams('delete', 'price:min', val, recid);
        }
        return true;
    }
    return false;
}

function t_store_filters_handleOnChange_checkInRange(val, el_input, minVal, maxVal, type) {
    if (val === 0 && type === 'max') {
        val = maxVal;
        el_input.value = maxVal;
    } else if (val > maxVal) {
        val = maxVal;
        el_input.value = maxVal;
    } else if (val < minVal) {
        val = minVal;
        el_input.value = minVal;
    }
    return val;
}

function t_store_filters_handleOnChange_checkbox(recid, opts, el_rec) {
    Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-opt-chb'), function (filterOptChb) {
        filterOptChb.addEventListener('change', function () {
            var _this = this;
            var controlValue = this.getAttribute('name');
            var childrensOfConstolsWrap = this.closest('.t-store__filter__item-controls-wrap').parentNode.children;
            Array.prototype.forEach.call(childrensOfConstolsWrap, function (sibling) {
                if (sibling.classList.contains('js-store-filter-item-title')) {
                    var controlGroupdId = sibling.getAttribute('data-filter-name');

                    if (_this.checked) {
                        _this.parentNode.classList.add('active');
                        t_store_updateUrlWithParams('add', controlGroupdId, controlValue, recid);
                        t_store_filters_opts_chosenVal_add(recid, controlValue, _this);
                    } else {
                        _this.parentNode.classList.remove('active');
                        t_store_updateUrlWithParams('delete', controlGroupdId, controlValue, recid);
                        t_store_filters_opts_chosenVal_hide(el_rec, controlValue, _this);
                    }

                    t_store_setActiveStorePart(recid);
                    t_store_filters_send(recid, opts);

                    if (opts.sidebar) {
                        t_store_filters_opts_sort(opts, recid);
                        t_store_filters_scrollStickyBar(el_rec);
                    }
                }
            });
        });
    });
}

function t_store_filters_handleOnChange_selectbox(recid, opts, el_rec) {
    Array.prototype.forEach.call(el_rec.querySelectorAll('.js-store-filter-custom-select'), function (filterCustomSelect) {
        filterCustomSelect.addEventListener('click', function (e) {
            var isMobileSort = e.target.classList.contains('t-store__filter__item_sort-mobile') || this.classList.contains('t-store__filter__item_sort-mobile');

            var text = this.getAttribute('data-select-val');
            var label = this.textContent;
            var controlGroup;
            Array.prototype.forEach.call(this.closest('.t-store__filter__item-controls-wrap').parentNode.children, function (sibling) {
                if (sibling.classList.contains('js-store-filter-item-title')) {
                    controlGroup = sibling;
                }
            });

            var controlGroupdId = controlGroup.getAttribute('data-filter-name');

            var el_hiddenInput = this.closest('.js-store-filter-item').querySelector('.js-store-filter-opt');
            var previous = el_hiddenInput.getAttribute('data-previousval');
            if (previous) {
                t_store_filters_opts_chosenVal_hide(el_rec, previous);
            }
            if (previous === text) {
                t_store_updateUrlWithParams('delete', controlGroupdId, text, recid);
                t_store_setActiveStorePart(recid);
                t_store_filters_send(recid, opts);
                el_hiddenInput.setAttribute('data-previousval', '');

                if (opts.sidebar) {
                    t_store_filters_opts_sort(opts, recid);
                }
                return;
            } else {
                if (isMobileSort) {
                    el_rec.querySelector('.js-store-filter-sort').value = text;
                }
                t_store_updateUrlWithParams('update', controlGroupdId, text, recid);
            }
            if (!isMobileSort) {
                t_store_filters_opts_chosenVal_add(recid, text, this, label);
            }
            t_store_filters_send(recid, opts);
            el_hiddenInput.setAttribute('data-previousval', text);

            if (opts.sidebar) {
                t_store_filters_opts_sort(opts, recid);
                t_store_filters_scrollStickyBar(el_rec);
            }
        });
    });
}

function t_store_filters_handleOnChange_search(recid, opts, el_rec) {
    var rec = document.getElementById('rec' + recid);
    var prevQuery = '';
    var el_input = el_rec.querySelector('.js-store-filter-search');
    var el_closeBtn = el_rec.querySelector('.js-store-filter-search-close');
    var el_searchBtn = el_rec.querySelector('.js-store-filter-search-btn');

    if (el_searchBtn) {
        el_searchBtn.addEventListener('click', function () {
            if (prevQuery !== el_input.value) {
                t_store_filters_opts_chosenVal_hide(el_rec, prevQuery);
                prevQuery = el_input.value;
                t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts);
            }
        });
    }

    if (el_input) {
        Array.prototype.forEach.call(['keypress', 'tstoreSearchTriggerReset'], function name(event) {
            el_input.addEventListener(event, function (e, value) {
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
                if (prevQuery !== el_input.value) {
                    t_store_filters_opts_chosenVal_hide(el_rec, prevQuery);
                    prevQuery = el_input.value;
                    t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts);
                    // el_input.value = '';
                }
            });
        });

        el_input.addEventListener('keyup', function () {
            // show or hide close icon
            if (this.value.length > 0) {
                el_closeBtn.style.display = '';
            } else if (this.value.length === 0) {
                el_closeBtn.style.display = 'none';
            }
        });
    }

    // init close icon on click
    if (el_closeBtn) {
        el_closeBtn.addEventListener('click', function () {
            if (rec.querySelector('.js-store-filter-search[name="query"]').getAttribute('value')) {
                // if event from keypress - get input value from input
                prevQuery = rec.querySelector('.js-store-filter-search[name="query"]').getAttribute('value');
            }

            t_store_filters_opts_chosenVal_hide(el_rec, prevQuery);
            el_input.value = '';
            prevQuery = '';
            rec.querySelector('.js-store-filter-search[name="query"]').defaultValue = '';
            t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts);
        });
    }
}

function t_store_filters_handleOnChange_search_send(recid, el_input, el_closeBtn, opts) {
    var val = el_input.value;
    if (val !== '') {
        // show chosen tag
        var chosenValText = t_store_dict('searchplaceholder') + ': ' + val;
        t_store_updateUrlWithParams('update', 'query', val, recid);
        t_store_filters_opts_chosenVal_add(recid, val, el_input, chosenValText);
    } else {
        el_closeBtn.style.display = 'none';
        t_store_updateUrlWithParams('delete', 'query', val, recid);
    }
    t_store_filters_send(recid, opts);
    el_input.blur();
}

// function t_store_filters_handleOnChange_sort(recid, opts, el_rec) {
//     $(el_rec).find('.js-store-filter-sort').on('change', function (e) {
//         $(this).find('[selected="selected"]').attr('selected', false);
//         $(e.currentTarget.selectedOptions[0]).attr('selected', true);
//         t_store_filters_send(recid, opts);
//     });
// }

function t_store_filters_handleOnChange_sort(recid, opts, el_rec) {
    var storeFilterSort = el_rec.querySelector('.js-store-filter-sort');
    if (storeFilterSort) {
        storeFilterSort.addEventListener('change', function (e) {
            var selectedEl = this.querySelector('[selected="selected"]');
            if (selectedEl) {
                selectedEl.selected = false;
            }
            e.currentTarget.selectedOptions[0].selected = true;
            t_store_filters_send(recid, opts);
        });
    }
}

function t_store_filters_calcPriceOuterWidth(el_rec, endpoint, min, max, value) {
    // Calculate fill width from price range slider to the nearest endpoint
    var distance = max - min;
    var isStart = endpoint === 'start';
    var result = isStart ?
        Math.ceil((value - min) / distance * 100) :
        Math.ceil((max - value) / distance * 100);

    if (isStart) {
        var priceStart = el_rec.querySelector('.t-store__filter__price-outer_start');
        if (priceStart) {
            priceStart.style.width = result + '%';
        }
    } else {
        var priceEnd = el_rec.querySelector('.t-store__filter__price-outer_end');
        if (priceEnd) {
            priceEnd.style.width = result + '%';
        }
    }

}

function t_store_filters_updatePriceRange(el_rec) {
    var isSliderAllowed = t_store_filters_priceRange_checkIfAllowed();
    if (!isSliderAllowed) {
        return;
    }

    var el_min_range = el_rec.querySelector('.t-store__filter__range_min');
    var el_max_range = el_rec.querySelector('.t-store__filter__range_max');
    var el_min_text = el_rec.querySelector('.js-store-filter-pricemin');
    var el_max_text = el_rec.querySelector('.js-store-filter-pricemax');

    if (el_min_range) {
        el_min_range.value = t_store__cleanPrice(el_min_text.value);
        el_min_range.dispatchEvent(new Event('input'));
    }

    if (el_max_range) {
        el_max_range.value = t_store__cleanPrice(el_max_text.value);
        el_max_range.dispatchEvent(new Event('input'));
    }
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

        if (decimals > result) {
            result = decimals;
        }
    }

    return result;
}

function t_store_filters_opts_chosenVal_hide(el_rec, value, el_control) {
    // find proper option name to hide in order different options share common name
    var option = el_control && el_control.length ?
        el_control.closest('.t-store__filter__item-controls-container').querySelector('.js-store-filter-opt').getAttribute('name') :
        null;

    if (typeof value === 'number') {
        value = value.toString();
    }

    var el_chosen = option ?
        el_rec.querySelector('.js-store-filter-chosen-item[data-field-val="' + value + '"][data-option-name="' + option + '"]') :
        el_rec.querySelector('.js-store-filter-chosen-item[data-field-val="' + value.replace(/\\/g, '\\\\') + '"]');

    var isSidebar = el_rec.getAttribute('data-record-type') === '951';
    if (isSidebar) {
        t_store_filters_updatePriceRange(el_rec);
    }

    var el_min_range = el_rec.querySelector('.t-store__filter__range_min');
    if (el_min_range) {
        el_min_range.dispatchEvent(new Event('input'));
    }

    t_store__removeElement(el_chosen);
    if (el_rec.querySelectorAll('.js-store-filter-chosen-item').length <= 1) {
        var storeFilterReset = el_rec.querySelector('.js-store-filter-reset');
        if (storeFilterReset) {
            storeFilterReset.classList.remove('t-store__filter__reset_visible');
        }
    }
}

function t_store_filters_opts_checkedValues_hideOnClick(recid, opts) {
    var el_rec = document.getElementById('rec' + recid);
    var el_filterWrapper = el_rec.querySelector('.js-store-parts-select-container');
    var defVal;

    el_filterWrapper.addEventListener('click', function (e) {
        if (e.target.closest('.js-store-filter-chosen-item')) {
            var el_control = window.controlElem[recid][e.target.getAttribute('data-field-val')];

            if (!el_control) {
                // If no control has been passed, then there is no 'quantity' filter most likely
                // So we can't trigger 'change' on filter's input. Below is a temporary ugly workaround to fix the case
                if (e.target.textContent === t_store_dict('filter-available-label')) {
                    t_store_updateUrlWithParams('delete', 'quantity', null, recid);

                    t_store_filters_opts_chosenVal_hide(el_rec, 'y', e.target);
                    t_store_setActiveStorePart(recid);
                    t_store_filters_send(recid, opts);

                    if (opts.sidebar) {
                        t_store_filters_opts_sort(opts, recid);
                        t_store_filters_scrollStickyBar(el_rec);
                    }
                }

                // eslint-disable-next-line no-console
                console.log('smth wrong with current filter');
                return;
            }
            if (el_control.classList.contains('js-store-filter-opt-chb') || el_control.classList.contains('js-store-filter-onlyavail')) {
                // change control for checkbox
                el_control.checked = false;
                // change hidden input
                el_control.dispatchEvent(new Event('change'));
            } else if (el_control.classList.contains('js-store-filter-custom-select')) {
                // change control for selectbox
                el_control.click();
            } else if (el_control.classList.contains('js-store-filter-pricemin')) {
                // change control for range, min
                defVal = t_store__getFormattedPrice(opts, el_control.getAttribute('data-min-val'));
                el_control.value = defVal;
                el_control.dispatchEvent(new Event('tstoreMinPriceTriggerReset'));
                t_store_updateUrlWithParams('delete', 'price:min', null, recid);
            } else if (el_control.classList.contains('js-store-filter-pricemax')) {
                // change control for range, max
                defVal = t_store__getFormattedPrice(opts, el_control.getAttribute('data-max-val'));
                el_control.value = defVal;
                el_control.dispatchEvent(new Event('tstoreMaxPriceTriggerReset'));
                t_store_updateUrlWithParams('delete', 'price:max', null, recid);
            } else if (el_control.classList.contains('js-store-filter-search')) {
                el_control.value = '';
                el_control.dispatchEvent(new Event('tstoreSearchTriggerReset'));
            }
        }
    });
}

function t_store_filters_scrollStickyBar(el_rec) {
    var el_stickySidebar = el_rec.querySelector('.t951__sidebar_sticky');
    if (!el_stickySidebar) return;

    if (window.isIE) {
        window.scrollTo(0, el_rec.getBoundingClientRect().top + window.pageYOffset - 50);
    } else {
        window.scrollTo({
            left: 0,
            top: el_rec.getBoundingClientRect().top + window.pageYOffset - 50,
            behavior: 'smooth'
        });
    }
}

/* Used in the tpl only */
// eslint-disable-next-line no-unused-vars
function t_store_oneProduct_init(recid, opts) {
    var el_prod = document.querySelector('#rec' + recid + ' .js-store-product_single');
    var uid = el_prod.getAttribute('data-product-gen-uid');
    uid = t_store_oneProduct_clearUid(uid);
    el_prod.setAttribute('data-product-gen-uid', uid);

    t_store_oneProduct_preloader_add(recid);

    var pageMode = document.getElementById('allrecords').getAttribute('data-tilda-mode');
    opts.isPublishedPage = pageMode !== 'edit' && pageMode !== 'preview';

    var requestOnBlockChangeInRedactor = window.tStoreSingleProdsObj && !opts.previewmode;

    if (!window.tStoreSingleProductsIsRequested || requestOnBlockChangeInRedactor) {
        t_store_oneProduct_requestAllSingle(opts);
        window.tStoreSingleProductsIsRequested = true;
        el_prod.addEventListener('tStoreSingleProductsLoaded', function () {
            t_store_oneProduct_fill(recid, window.tStoreSingleProdsObj[uid], opts);
        });
    } else if (window.tStoreSingleProdsObj) {
        t_store_oneProduct_fill(recid, window.tStoreSingleProdsObj[uid], opts);
    } else {
        el_prod.addEventListener('tStoreSingleProductsLoaded', function () {
            t_store_oneProduct_fill(recid, window.tStoreSingleProdsObj[uid], opts);
        });
    }
}

function t_store_oneProduct_clearUid(uid) {
    return uid.replace('product id: ', '');
}

function t_store_oneProduct_preloader_add(recid) {
    var el_rec = document.getElementById('rec' + recid);
    var el_prod = el_rec.querySelector('.js-store-product_single');

    if (window.isSearchBot) {
        return;
    }

    var elInfo = el_prod.querySelector('.js-store-single-product-info');
    elInfo.style.display = 'none';

    var preloaderTimerId = setTimeout(function () {
        var str = '';
        str += '<div class="t-store__single-prod-preloader" style="display:none;">';
        var strTextEl = '<div class="t-store__single-prod-preloader__text"></div>';
        for (var i = 0; i < 6; i++) {
            str += strTextEl;
        }
        str += '</div>';

        elInfo.insertAdjacentHTML('beforebegin', str);
        fadeIn(el_prod.querySelector('.t-store__single-prod-preloader'), 200);
    }, 1000);
    el_rec.setAttribute('preloader-timeout', preloaderTimerId);
}

function t_store_oneProduct_preloader_hide(recid) {
    var el_rec = document.getElementById('rec' + recid);
    var el_prod = el_rec.querySelector('.js-store-product_single');

    clearTimeout(el_rec.getAttribute('preloader-timeout'));
    el_prod.querySelector('.js-store-single-product-info').style.display = '';
    t_store__removeElement(el_prod.querySelector('.t-store__single-prod-preloader'));
}

function t_store_oneProduct_requestAllSingle(opts) {
    // get single products ids
    var el_singleProds = document.querySelectorAll('.js-store-product_single');
    var arrId = [];

    Array.prototype.forEach.call(el_singleProds, function (product) {
        var uid = product.getAttribute('data-product-gen-uid');
        uid = t_store_oneProduct_clearUid(uid);
        arrId.push(uid);
    });

    t_store_loadProducts_byId(arrId, opts, function (data) {
        if (typeof data !== 'string' || data.substr(0, 1) !== '{') {
            // eslint-disable-next-line no-console
            console.log("Can't get products array by uid list");
        }
        try {
            var dataObj = JSON.parse(data);
            var productsArr = dataObj.products;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(data);
        }
        if (productsArr === '') {
            // eslint-disable-next-line no-console
            console.log("Something went wrong. Can't get products array by uid list. Please check products UID.");
            return;
        }

        // store option params
        if (dataObj.options && dataObj.options.length && !window.tStoreOptionsList) {
            window.tStoreOptionsList = dataObj.options;
        }

        // save data after request, to make to reachable for other single blocks
        window.tStoreSingleProdsObj = t_store_oneProduct_prodsArrToAssociative(productsArr);
        Array.prototype.forEach.call(el_singleProds, function (product) {
            product.dispatchEvent(new Event('tStoreSingleProductsLoaded'));
        });
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
    var el_rec = document.getElementById('rec' + recid);
    var el_prod = el_rec.querySelector('.js-product');
    t_store_oneProduct_preloader_hide(recid);

    el_prod.setAttribute('cardSize', 'large');

    if (!data) {
        t_store_oneProduct_error_show(recid, opts);
        t_store_product_triggerSoldOutMsg(el_prod, true, opts);

        if (el_prod.querySelector('.js-store-prod-price-old-val').textContent === '') {
            el_prod.querySelector('.js-store-prod-price-old').style.display = 'none';
        }

        return;
    }
    t_store_oneProduct_successMsg_show(recid, data, opts);

    t_store_oneProduct_fill_data(recid, data, el_prod, opts);

    // Add events
    t_store_option_handleOnChange_custom(recid, el_prod, opts);
}

function t_store_oneProduct_successMsg_show(recid, data, opts) {
    if (!opts.previewmode) {
        var el_rec = document.getElementById('rec' + recid);
        var text =
            window.tildaBrowserLang === 'RU' ?
            'Товар успешно связан с каталогом. Название товара в каталоге: ' :
            'Product is connected to catalog. Product name in catalog is ';
        text += '<b>' + data.title + '</b>';
        t_store_showMsgInRedactor(el_rec, text, 'success');
    }
}

function t_store_oneProduct_error_show(recid, opts) {
    if (!opts.previewmode) {
        var el_rec = document.getElementById('rec' + recid);
        var errorText =
            window.tildaBrowserLang === 'RU' ?
            'Не удается получить товар из каталога. Возможно он был удален или отключен. Пожалуйста, проверьте, что товар с таким ID существует.' :
            "Can't find a product in the catalog. It may have been deleted or disabled. Please check that the product with this ID exists.";
        t_store_showMsgInRedactor(el_rec, errorText, 'error');
    }
}

function t_store_showMsgInRedactor(el_rec, text, type) {
    var storeMsg = el_rec.querySelector('.js-store-msg');
    t_store__removeElement(storeMsg);
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
    el_rec.insertAdjacentHTML('afterbegin', msgHtml);
}

function t_store_oneProduct_fill_data(recid, data, el_product, opts) {
    t_store_addProductOptions(recid, data, el_product, opts, 'largecard');
    t_store_onFuncLoad('t_prod__init', function () {
        t_prod__init(recid);
    });
}

function t_store_isQueryInAddressBar(queryString) {
    var currentLocationSearch = decodeURI(window.location.href);
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

function t_store_paramsToObj(recid, opts) {
    var paramsString;
    try {
        paramsString = decodeURI(window.location.search);
    } catch (e) {
        paramsString = window.location.search;
    }

    var result = {
        otherParams: []
    };
    result[recid] = {};

    try {
        paramsString = paramsString.replace(/&amp;/g, '%26amp');
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }
    var params = paramsString.slice(1).split('&');

    params = params.map(function (param) {
        return param.replace(/%26amp/g, '&amp;');
    });

    // Store other non-Tilda URL params
    result.otherParams = params.filter(function (param) {
        var isTildaFilter = /^tfc_/i.test(param) || /^s_/i.test(param);

        return !isTildaFilter && param;
    });

    if (window.location.href.indexOf('s_recid=') !== -1) {
        // Add support for previous url params model
        var recIdFromURL = window.location.href.split('s_recid=')[1].split('&')[0];
        if (recIdFromURL == recid) {
            params.splice(1).forEach(function (param) {
                try {
                    var isTildaFilter = /^s_/i.test(param);

                    // If recid is not on the page, don't add it to params
                    var isRecOnPage = document.querySelector('#rec' + recid);
                    if (!isRecOnPage) {
                        return;
                    }

                    if (!result[recid]) {
                        result[recid] = {};
                    }

                    if (isTildaFilter) {
                        param = param.replace(/^s_/i, 'tfc_');
                        param = param.replace(/%3A/gi, ':');

                        var parts = param.split('=');
                        var key = parts[0];
                        var values = parts[1].replace(/\+/g, ' ').split('%2B');
                        var filter = key.replace(/^tfc_/i, '');

                        result[recid][filter] = result[recid][filter] ?
                            result[recid][filter].concat(values) :
                            values;
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log(e);
                }
            });
        }
    } else if (window.location.href.indexOf('tfc_') !== -1) {
        // The part where we work with a new universal url params model
        // example: ?tfc_animals[534534543]=dogs%2Bcats%2Bbig+cats

        params.forEach(function (param) {
            var parts = param.split('=');
            try {
                var isTildaFilter = /^tfc_/i.test(param);

                // Store utm and other params separately
                if (isTildaFilter) {
                    var key = parts[0]; // example: tfc_animals[534534543]
                    var values = parts[1].replace(/\+/g, ' ').split('%2B'); // example: [dogs,cats,big cats]

                    var regexp = new RegExp(/\[\d.*\]$/, 'gi');
                    var match = key.match(regexp);
                    var recid = match ? Number(JSON.parse(match[0])) : null;

                    if (!recid) {
                        // eslint-disable-next-line no-console
                        console.error('Can\'t find recid in URL param');
                        return;
                    }

                    // If recid is not on the page, don't add it to params
                    var isRecOnPage = document.querySelector('#rec' + recid);
                    if (!isRecOnPage) {
                        return;
                    }

                    var filter = key.replace(regexp, '').replace('tfc_', '');
                    if (!result[recid]) result[recid] = {};

                    result[recid][filter] = result[recid][filter] ?
                        result[recid][filter].concat(values) :
                        values;
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(e);
            }
        });
    }

    window.tStoreCustomUrlParams = result;
    t_store_paramsToObj_updateUrl(result);

    // Check if there are any default sort options
    var sortByRec = t_store_paramsToObj_getDefaultSort(recid, opts.defaultSort);

    for (var rec in sortByRec) {
        var newSort = sortByRec[rec].sort;
        var newQuantity = sortByRec[rec].quantity;
        // var isSortChanged = false;

        if (!newSort && !newQuantity) {
            continue;
        }

        if (result[rec] && result[rec].sort && opts.previewmode) {
            // Do not set default sorting if it has been already set by URL param
        } else if (newSort) {
            if (!result[rec]) {
                result[rec] = {};
            }

            result[rec].sort = newSort;
        }

        if (result[rec] && result[rec].quantity === 'y' && opts.previewmode) {
            // If quantity is set to 'y' by URL params, don't change it
        } else if (newQuantity) {
            // Otherwise, if default (new) quantity is 'y', update it
            if (!result[rec]) {
                result[rec] = {};
            }

            result[rec].quantity = 'y';
        }
    }

    window.tStoreCustomUrlParams = result;
    return result;
}

function t_store_paramsToObj_updateUrl(paramsObj) {
    var newUrl = t_store_customURLParamsToString(paramsObj);

    if (window.location.hash) {
        newUrl += window.location.hash;
    }
    try {
        window.history.replaceState(null, null, newUrl);
    } catch (e) {
        /* */
    }
}

function t_store_paramsToObj_getDefaultSort(recid, sort) {
    // Store default sort opts for all recids in window

    var result = window.tStoreDefaultSort ?
        window.tStoreDefaultSort : {};

    if (!sort) {
        return result;
    }

    if (sort.default) {
        var mapSort = {
            'sort-price-asc': 'price:asc',
            'sort-price-desc': 'price:desc',
            'sort-name-asc': 'title:asc',
            'sort-name-desc': 'title:desc',
            'sort-created-asc': 'created:asc',
            'sort-created-desc': 'created:desc'
        };

        if (!result[recid]) {
            result[recid] = {};
        }

        result[recid].sort = new Array(mapSort[sort.default]);
    }

    if (sort.in_stock) {
        if (!result[recid]) {
            result[recid] = {};
        }
        result[recid].quantity = 'y';
    }

    window.tStoreDefaultSort = result;
    return result;
}

function t_store_customURLParamsToString(params) {
    var result = '';
    var otherParams = '';

    for (var param in params) {
        var rec = params[param];
        if (param !== 'otherParams') {
            for (var filter in rec) {
                try {
                    var values = Array.isArray(rec[filter]) ? rec[filter].join('[[PLUS]]') : rec[filter].toString(); // + analogue // + symbol has been already used for spaces
                    values = values.replace(/%/g, '%25');
                    values = values.replace(/\[\[PLUS\]\]/g, '%2B');
                    values = values.replace(/%26amp/g, '&amp;');
                    values = values.replace(/\s/gi, '+');
                    result += !result.length ? '?' : '&';
                    result += 'tfc_' + filter + '[' + param + ']' + '=' + values;
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.log(e);
                }
            }
        }
    }

    if (params.otherParams && params.otherParams.length) {
        params.otherParams.forEach(function (param) {
            if (param.length) {
                otherParams += '&' + param;
            }
        });

        result = result.length ? result + otherParams : '?' + otherParams.slice(1);
    }

    if (!result.length) {
        return window.location.origin + window.location.pathname;
    } else {
        return result;
    }
}

function t_store_updateUrlWithParams(method, key, value, recid) {
    try {
        var params = window.tStoreCustomUrlParams || {};
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
                var deleteThis = typeof params[recid][key] === 'string' ||
                    key === 'query' ||
                    key === 'sort' ||
                    key === 'price:min' ||
                    key === 'price:max' ||
                    key === 'quantity';

                if (deleteThis) {
                    delete params[recid][key];
                } else {
                    params[recid][key] = params[recid][key].filter(function (item) {
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

        window.tStoreCustomUrlParams = params;
        t_store_paramsToObj_updateUrl(params);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log('something wrong in t_store_updateUrlWithParams', e);
    }
}

function t_store_updateOptionsBasedOnUrl(opts, customUrlParams, recid) {
    try {
        var params = customUrlParams[recid];

        opts.filters = {};
        for (var key in params) {
            if (key !== 'sort') {
                var isString = key.indexOf('price:m') !== -1 ||
                    key.indexOf('quantity') !== -1;
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
        // eslint-disable-next-line no-console
        console.log('something wrong in t_store_updateOptionsBasedOnUrl', e);
    }
}

function t_store_filters_opts_sort(opts, recid) {
    if (!opts.sidebar) {
        return;
    }

    var el_rec = document.getElementById('rec' + recid);
    var el_container = el_rec.querySelectorAll('.t-store__filter__item-controls-container');

    Array.prototype.forEach.call(el_container, function (control) {
        var type = control.getAttribute('data-type');

        if (type === 'checkbox') {
            var el_controls = control.querySelectorAll('.t-checkbox__control');
            // Pass all filter values to customSort
            var filterValues = [];
            Array.prototype.forEach.call(el_controls, function (control) {
                var value = control.querySelector('.js-store-filter-opt-chb').getAttribute('data-filter-value');
                filterValues.push(value);
            });

            var sortedControls = Array.prototype.slice.call(el_controls, 0).sort(function (a, b) {
                var first = a.querySelector('.js-store-filter-opt-chb');
                var second = b.querySelector('.js-store-filter-opt-chb');

                if (first.checked && !second.checked) {
                    return -1;
                } else if (!first.checked && second.checked) {
                    return 1;
                } else if (!first.checked && !second.checked) {
                    var valueA = first.getAttribute('data-filter-value');
                    var valueB = second.getAttribute('data-filter-value');
                    // Apply default sort before custom sort
                    var sorted = [valueA, valueB].sort();
                    // Don't pass second argument 'filter' as function expects object in that case
                    sorted = t_store_product_sortValues(sorted, 'string', filterValues);
                    return sorted.indexOf(valueA) - sorted.indexOf(valueB);
                }

                return 0;
            });

            Array.prototype.forEach.call(sortedControls, function (sortedControl) {
                var filterOptChb = sortedControl.getAttribute('.js-store-filter-opt-chb');
                if (filterOptChb && filterOptChb.checked) {
                    sortedControl.classList.remove('t-checkbox__control_hidden');
                }
                control.insertAdjacentElement('beforeend', sortedControl);
            });
        } else if (type === 'selectbox') {
            var el_controls = control.querySelectorAll('.t-store__filter__custom-sel');
            // Pass all filter values to customSort
            var filterValues = [];
            Array.prototype.forEach.call(el_controls, function (control) {
                var value = control.getAttribute('data-filter-value');
                filterValues.push(value);
            });

            var sortedControls = Array.prototype.slice.call(el_controls, 0).sort(function (a, b) {
                if (a.classList.contains('active') && b.classList.contains('active')) {
                    return 1;
                } else if (a.classList.contains('active') && !b.classList.contains('active')) {
                    return -1;
                } else if (!a.classList.contains('active') && !b.classList.contains('active')) {
                    var valueA = a.getAttribute('data-filter-value');
                    var valueB = b.getAttribute('data-filter-value');
                    var sorted = [valueA, valueB].sort();
                    sorted = t_store_product_sortValues(sorted, 'string', filterValues);
                    return sorted.indexOf(valueA) - sorted.indexOf(valueB);
                }

                return 0;
            });

            Array.prototype.forEach.call(sortedControls, function (sortedControl) {
                if (sortedControl.classList.contains('active')) {
                    sortedControl.classList.remove('t-store__filter__custom-sel_hidden');
                }
                control.insertAdjacentElement('beforeend', sortedControl);
            });

        }
    });
}

function t_store_filters_render_selected(opts, recid) {
    try {
        var rec = document.getElementById('rec' + recid);
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
                el_control = rec.querySelectorAll('[data-filter-value="' + filterValue.replace(/\\/g, '\\\\') + '"]');

                if (filterKey === 'price:min') {
                    el_control = rec.querySelector('[name="price:min"]');
                    el_control.setAttribute('data-previousmin', parseInt(filterValue, 10));
                    el_control.setAttribute('value', t_store__getFormattedPrice(opts, filterValue));
                    filterLabel = '> ' + filterValue;
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);

                    if (opts.sidebar) {
                        rec.querySelector('.t-store__filter__range_min').value = filterValue;
                    }
                } else if (filterKey === 'price:max') {
                    el_control = rec.querySelector('[name="price:max"]');
                    el_control.setAttribute('data-previousmax', parseInt(filterValue, 10));
                    el_control.setAttribute('value', t_store__getFormattedPrice(opts, filterValue));
                    filterLabel = '< ' + filterValue;
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);

                    if (opts.sidebar) {
                        rec.querySelector('.t-store__filter__range_max').value = filterValue;
                    }
                } else if (filterKey === 'query') {
                    rec.querySelector('.js-store-filter-search-close').style.display = '';
                    el_control = rec.querySelector('[name="query"]');
                    el_control.setAttribute('value', filterValue);
                    el_control.value = filterValue;
                    filterLabel = t_store_dict('searchplaceholder') + ': ' + filterValue;
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);
                } else if (filterKey === 'quantity') {
                    el_control = rec.querySelector('.js-store-filter-onlyavail');
                    if (el_control.length) {
                        el_control.checked = true;
                    }
                    filterLabel = t_store_dict('filter-available-label');
                    t_store_filters_opts_chosenVal_add(recid, filterValue, el_control, filterLabel);
                } else if (el_control.length > 0) {
                    controlType = el_control[0].getAttribute('type');
                    switch (controlType) {
                        case 'checkbox':
                            Array.prototype.forEach.call(el_control, function (control) {
                                // get unique option key name and check with filters
                                var option = control.closest('.t-store__filter__item-controls-container').querySelector('.js-store-filter-opt').getAttribute('name');
                                var isValid = filterObject[option] && filterObject[option].indexOf(filterValue) !== -1;

                                if (isValid) {
                                    control.checked = true;
                                    control.parentNode.classList.add('active');
                                    t_store_filters_opts_chosenVal_add(recid, filterValue, control);
                                    t_store_filters_opts_checkboxes_changeHiddenInput(control);
                                }
                            });
                            break;
                        case 'selectbox':
                            Array.prototype.forEach.call(el_control, function (control) {
                                // get unique option key name and check with filters
                                var option = control.closest('.t-store__filter__item-controls-container').querySelector('.js-store-filter-opt').getAttribute('name');
                                var isValid = filterObject[option] && filterObject[option].indexOf(filterValue) !== -1;

                                if (isValid) {
                                    t_store_filters_opts_chosenVal_add(recid, filterValue, control);
                                    control.classList.add('active');
                                    t_store_filters_opts_customSelect_changeHiddenInput(control);
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
            var el_control_option = rec.querySelector('option[data-filter-value="' + sortQuery + '"]');
            var el_control_select = rec.querySelector('.js-store-filter-custom-select[data-filter-value="' + sortQuery + '"]');
            el_control_option.selected = true;
            el_control_select.classList.add('active');
        }
    } catch (e) {
        // eslint-disable-next-line no-console
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

function t_store_tabs_handleOnChange(recid, el_product) {
    var tabs = el_product.querySelector('.t-store__tabs');
    var design = tabs.getAttribute('data-tab-design');
    var isAccordion = design === 'accordion';

    var buttons = el_product.querySelectorAll('.js-store-tab-button');
    var buttonsTabClickEvent = function () {
        var title = this.getAttribute('data-tab-title');
        var el_list = tabs.querySelector('.t-store__tabs__list');

        // Tabs
        if (!isAccordion) {
            Array.prototype.forEach.call(el_list.querySelector('.t-store__tabs__item'), function (item) {
                var curTitle = item.getAttribute('data-tab-title');

                if (curTitle === title) {
                    item.classList.add('t-store__tabs__item_active');
                    item.querySelector('.t-store__tabs__content').style.opacity = 0;
                    item.querySelector('.t-store__tabs__content').style.display = '';
                    setTimeout(function () {
                        t_store_tabs_animateHeight(tabs);
                    }, 0);
                } else {
                    item.classList.remove('t-store__tabs__item_active');
                    item.querySelector('.t-store__tabs__content').style.display = 'none';
                }
            });

            // Update active state for buttons
            var isActive = this.classList.contains('t-store__tabs__button_active');
            var el_controls = this.closest('.t-store__tabs__controls');
            if (isActive || !el_controls) {
                return;
            }

            Array.prototype.forEach.call(el_controls.querySelectorAll('.t-store__tabs__button'), function (btn) {
                var curTitle = btn.getAttribute('data-tab-title');

                if (curTitle === title) {
                    btn.classList.add('t-store__tabs__button_active');
                } else {
                    btn.classList.remove('t-store__tabs__button_active');
                }
            });
            // Accordion
        } else {
            var el_tab = this.parentNode;
            var tabsContent = el_tab.querySelector('.t-store__tabs__content');

            if (tabsContent.style.height === '') {
                tabsContent.style.height = getComputedStyle(tabsContent).height;
            }

            setTimeout(function () {
                if (!el_tab.classList.contains('t-store__tabs__item_active')) {
                    tabsContent.style.height = 'auto';

                    var height = tabsContent.clientHeight + 'px';

                    tabsContent.style.height = '0px';

                    setTimeout(function () {
                        tabsContent.style.height = height;
                    }, 0);
                } else {
                    tabsContent.style.height = '0px';

                    tabsContent.addEventListener('transitionend', function () {
                        el_tab.classList.remove('t-store__tabs__item_active');
                    }, {
                        once: true
                    });
                }

                el_tab.querySelector('.t-store__tabs__item-button').classList.toggle('t-store__tabs__item-button_active');
                el_tab.classList.toggle('t-store__tabs__item_active');

                Array.prototype.forEach.call(el_list.querySelector('.t-store__tabs__item'), function (item) {
                    var curTitle = item.getAttribute('data-tab-title');
                    var el_content = item.querySelector('.t-store__tabs__content');
                    var el_button = item.querySelector('.t-store__tabs__item-button');
                    var isActive = item.classList.contains('t-store__tabs__item_active');

                    if (curTitle !== title && isActive) {
                        // el_content.slideToggle(300);
                        if (el_content.style.height === '') {
                            el_content.style.height = getComputedStyle(el_content).height;
                        }

                        setTimeout(function () {
                            if (!el_content.classList.contains('t-store__tabs__item_active')) {
                                el_content.style.height = 'auto';

                                var height = el_content.clientHeight + 'px';

                                el_content.style.height = '0px';

                                setTimeout(function () {
                                    el_content.style.height = height;
                                }, 0);
                            } else {
                                el_content.style.height = '0px';

                                el_content.addEventListener('transitionend', function () {
                                    el_content.classList.remove('t-store__tabs__item_active');
                                }, {
                                    once: true
                                });
                            }
                        }, 0);
                        item.classList.toggle('t-store__tabs__item_active');
                        el_button.classList.toggle('t-store__tabs__item-button_active');
                    }
                });
            }, 0);
        }

        tabs.setAttribute('data-active-tab', title);
    };
    Array.prototype.forEach.call(buttons, function (button) {
        button.removeEventListener('click', buttonsTabClickEvent);
        button.addEventListener('click', buttonsTabClickEvent);
    });

    if (!isAccordion) {
        var el_controls = tabs.querySelector('.t-store__tabs__controls');
        t_store_tabs_handleFade(el_controls);
        el_controls.addEventListener('scroll', function () {
            t_store_tabs_handleFade(this);
        });
    }
}

function t_store_tabs_animateHeight(el_container) {
    var heightnow = parseFloat(getComputedStyle(el_container, null).height.replace('px', ''));

    el_container.style.height = 'auto';
    var heightfull = parseFloat(getComputedStyle(el_container, null).height.replace('px', ''));

    el_container.querySelector('.t-store__tabs__content').style.opacity = 1;

    el_container.style.heigth = heightnow;
    el_container.style.transition = 'height 500ms';
    el_container.style.heigth = heightfull;
}

function t_store_tabs_handleFade(el_controls) {
    var el_wrapper = el_controls.parentNode;

    if (window.innerWidth < 560) {
        var TRIGGER_DISTANCE = 10;
        var width = el_controls.width();
        var scrollLeft = el_controls.scrollLeft();
        var scrollWidth = el_controls[0].scrollWidth;

        if (scrollLeft > TRIGGER_DISTANCE) {
            el_wrapper.classList.add('t-store__tabs__controls-wrap_left');
        } else {
            el_wrapper.classList.remove('t-store__tabs__controls-wrap_left');
        }

        if (scrollWidth - width > scrollLeft + TRIGGER_DISTANCE) {
            el_wrapper.classList.add('t-store__tabs__controls-wrap_right');
        } else {
            el_wrapper.classList.remove('t-store__tabs__controls-wrap_right');
        }
    } else {
        el_wrapper.classList.remove('t-store__tabs__controls-wrap_left');
        el_wrapper.classList.remove('t-store__tabs__controls-wrap_right');
    }
}

function t_store_option_handleOnChange_custom(recid, element, opts) {
    // Disable all events before add new ones, because this function is called in different places e.g. at popup open
    var editionOptionEvent = function () {
        var el_control = this.closest('.js-product-edition-option');
        var el_custom_ui = el_control.querySelector('.t-product__option-variants_custom');
        document.body.dispatchEvent(new Event('twishlist_addbtn'));
        if (!el_control || !el_custom_ui) {
            return;
        }

        var value = this.value;
        var el_active_option = el_custom_ui.querySelector('.t-product__option-item_active');

        // Update only if selected option of custom select !== value of hidden (updated) select
        if (el_active_option) {
            var el_input = el_active_option.querySelector('.t-product__option-input');

            if (el_input.value !== value) {
                el_input.checked = false;
                var el_upd_input = el_custom_ui.querySelector('.t-product__option-input[value="' + value + '"]');
                setTimeout(function () {
                    el_upd_input.click();
                    el_upd_input.checked = true;
                });

                el_active_option.classList.remove('t-product__option-item_active');
                el_upd_input.parentNode.classList.add('t-product__option-item_active');

                setTimeout(function () {
                    t_store_unifyCardsHeights(recid, opts);
                    if (opts.verticalAlignButtons) {
                        t_store_verticalAlignButtons(recid, opts);
                    }
                }, 50);
            }
        }
    };

    Array.prototype.forEach.call(element.querySelectorAll('.js-product-edition-option-variants'), function (editionOption) {
        editionOption.removeEventListener('change', editionOptionEvent);
        editionOption.addEventListener('change', editionOptionEvent);
    });

    Array.prototype.forEach.call(element.querySelectorAll('.t-product__option-variants_custom'), function (variantCustom) {
        var el_input = variantCustom.querySelectorAll('.t-product__option-input');
        var el_option = variantCustom.querySelectorAll('.t-product__option-item');
        var el_select_hidden = variantCustom.parentNode.querySelector('.t-product__option-variants_regular .js-product-edition-option-variants');

        Array.prototype.forEach.call(el_input, function (optionInput) {
            optionInput.addEventListener('change', function () {
                var value = this.value;
                value = value.replace(/&/g, '&amp;');

                el_select_hidden.value = value;
                el_select_hidden.dispatchEvent(new Event('change'));
                Array.prototype.forEach.call(el_option, function (option) {
                    option.classList.remove('t-product__option-item_active');
                });
                this.parentNode.classList.add('t-product__option-item_active');

                setTimeout(function () {
                    t_store_unifyCardsHeights(recid, opts);
                    if (opts.verticalAlignButtons) {
                        t_store_verticalAlignButtons(recid, opts);
                    }
                }, 50);
            });
        });
    });

    // If custom dropdown exists, add events
    Array.prototype.forEach.call(element.querySelectorAll('.t-product__option-selected_select'), function (customDropdown) {
        // Toggle dropdown visibility
        var customDropdownClickEvent = function () {
            if (this.nextElementSibling.classList.contains('t-product__option-variants_custom')) {
                this.nextElementSibling.classList.toggle('t-product__option-variants_hidden');
            }
            // TODO: rewrite this part to call t_lazyload_update() only once per custom dropdown
            if (window.lazy === 'y') {
                t_lazyload_update();
            }
        };
        customDropdown.removeEventListener('click', customDropdownClickEvent);
        customDropdown.addEventListener('click', customDropdownClickEvent);

        // Update selected option values
        var el_select_custom = customDropdown.parentNode.querySelector('.t-product__option-variants_custom');
        var el_option = el_select_custom.querySelectorAll('.t-product__option-item');

        var optionClickEvent = function () {
            Array.prototype.forEach.call(el_option, function (option) {
                option.classList.remove('t-product__option-item_active');
            });
            this.classList.add('t-product__option-item_active');
            this.closest('.t-product__option-variants_custom').classList.add('t-product__option-variants_hidden');

            var value = this.querySelector('.t-product__option-title').textContent;
            var el_text = this.closest('.t-product__option').querySelector('.t-product__option-selected-title');
            el_text.textContent = value;

            // If dropdown type is color, update color in select
            var el_selected_color = this.closest('.t-product__option').querySelector('.t-product__option-selected.t-product__option-selected_color');

            if (el_selected_color) {
                var color = this.querySelector('.t-product__option-checkmark_color').style.backgroundColor;
                var el_checkmark = el_selected_color.querySelector('.t-product__option-selected-checkmark');
                el_checkmark.style.backgroundcolor = color;
            }

            // If dropdown type is image, update image in select
            var el_selected_image = this.closest('.t-product__option').querySelector('.t-product__option-selected.t-product__option-selected_image');

            if (el_selected_image) {
                var imageUrl = this.querySelector('.t-product__option-checkmark_image').style.backgroundImage;
                var imageUrlLazyload = this.querySelector('.t-product__option-checkmark_image').getAttribute('data-original');

                var el_checkmark = el_selected_image.querySelector('.t-product__option-selected-checkmark');
                el_checkmark.setAttribute('data-original', imageUrlLazyload);
                el_checkmark.style.backgroundImage = 'none';
                el_checkmark.style.backgroundImage = imageUrl;
            }
        };
        Array.prototype.forEach.call(el_option, function (option) {
            option.removeEventListener('click', optionClickEvent);
            option.addEventListener('click', optionClickEvent);
        });

        // Close all custom dropdowns on click outside
        var clickOutsideEvent = function (e) {
            var el_clicked = e.target;
            var el_parent = el_clicked.closest('.t-product__option-variants_custom');

            if (el_parent && el_parent !== el_clicked && el_parent.contains(el_clicked)) {
                // continue
            } else if (!el_clicked.classList.contains('t-product__option-selected') && !el_clicked.closest('.t-product__option-selected')) {
                // If selected button or any child of selected button was clicked, don't hide dropdown
                Array.prototype.forEach.call(document.querySelectorAll('.t-product__option-variants_custom.t-product__option-variants_select'), function (select) {
                    select.classList.add('t-product__option-variants_hidden');
                });
            }
        };
        Array.prototype.forEach.call(['click', 'outsideCustomDropdown'], function (event) {
            document.removeEventListener(event, clickOutsideEvent);
            document.addEventListener(event, clickOutsideEvent);
        });
    });
}

function t_store_unescapeHtml(str) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
}

// polyfill for Object.assign
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
window.isIE = !!document.documentMode;
if (window.isIE) {
    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, 'assign', {
            value: function assign(target) {
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
    return !window.isIE;
}

function t_store_onFuncLoad(funcName, okFunc, time) {
    if (typeof window[funcName] === 'function') {
        okFunc();
    } else {
        var startTime = Date.now();
        setTimeout(function checkFuncExist() {
            var currentTime = Date.now();
            if (typeof window[funcName] === 'function') {
                okFunc();
                return;
            }
            if (document.readyState === 'complete' && currentTime - startTime > 5000 && typeof window[funcName] !== 'function') {
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

function t_store_getLightnessColor(color) {
    var rgb;
    if (color.indexOf('rgb') === -1) { // hex
        var hex = parseInt(((color.indexOf('#') > -1) ? color.substring(1) : color), 16);
        rgb = {
            r: hex >> 16,
            g: (hex & 0x00FF00) >> 8,
            b: (hex & 0x0000FF),
        };
    } else { // rgb
        var values = color.replace(/[^\d,.]/g, '');
        var rgba = values.split(',');

        rgb = {
            r: rgba[0],
            g: rgba[1],
            b: rgba[2]
        };
    }
    rgb.r /= 255, rgb.g /= 255, rgb.b /= 255;
    var max = Math.max(rgb.r, rgb.g, rgb.b),
        min = Math.min(rgb.r, rgb.g, rgb.b);
    return (max + min) / 2;
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

function t_store_snippet_getJsonFromUrl() {
    var url = window.location.search;
    var query = url.substr(1);
    var result = {};
    query.split('&').forEach(function (part) {
        var item = part.split('=');
        try {
            result[item[0]] = decodeURIComponent(item[1]); /* TODO: item[1].replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25') */
        } catch (error) {
            result[item[0]] = item[1];
        }
    });
    return result;
}

/**
 * Clear price from symbols
 *
 * @param {Number | String} price
 * @returns
 */
function t_store__cleanPrice(price) {
    if (price) {
        price = price.toString();
        price = price.replace(',', '.').replace(/[^0-9.]/g, '');
        price = parseFloat(price).toFixed(2);
        if (isNaN(price)) price = 0;
        price = parseFloat(price);
        price = price * 1;
        if (price < 0) price = 0;
    } else {
        price = 0;
    }
    return price;
}

/**
 * Remove element
 *
 * @param {HTMLElement} el
 */
function t_store__removeElement(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

function fadeIn(el, duration, complete) {
    if ((getComputedStyle(el).opacity === '1' || getComputedStyle(el).opacity === '') && getComputedStyle(el).display !== 'none') return false;
    var opacity = 0;
    duration = parseInt(duration);
    var speed = duration > 0 ? duration / 10 : 40;
    el.style.opacity = opacity;
    el.style.display = 'block';
    var timer = setInterval(function () {
        el.style.opacity = opacity;
        opacity += 0.1;
        if (opacity >= 1.0) {
            clearInterval(timer);
            if (typeof complete === 'function') {
                complete();
            }
        }
    }, speed);
}

// Array.prototype.some()
if (!Array.prototype.some) {
    Array.prototype.some = function (fn) {
        'use strict';
        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }
        if (typeof fn !== 'function') {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fn.call(thisArg, t[i], i, t)) {
                return true;
            }
        }
        return false;
    };
}

// Element.matches()
(function (e) {
    var matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
    !matches ? (e.matches = e.matchesSelector = function matches(selector) {
        var matches = document.querySelectorAll(selector);
        var th = this;
        return Array.prototype.some.call(matches, function (e) {
            return e === th;
        });
    }) : (e.matches = e.matchesSelector = matches);
})(Element.prototype);

// Element.closest()
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

// String.prototype.trim()
if (!String.prototype.trim) {
    (function () {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    })();
}

function t_store__serializeData(obj, prefix) {
    var str = [];
    for (var property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            var key = prefix ? prefix + '[' + property + ']' : property;
            var value = obj[property];
            str.push((value !== null && typeof v === 'object') ?
                t_store__serializeData(value, key) :
                encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    }
    return str.join('&');
}