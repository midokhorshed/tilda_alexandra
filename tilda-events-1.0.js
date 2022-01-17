/**
 * tilda-events works with some statistic (GTM, Yandex.Metrica, VK.pixel, FB.pixel, etc.) to send user behavior on the current page
 */
window.Tilda = window.Tilda || {};
(function () {
    Tilda.sendEcommerceEvent = function (type, productsArr) {
        if (typeof productsArr === 'undefined' || productsArr.length === 0) {
            return false;
        }

        if (typeof type === 'undefined' || (type !== 'add' && type !== 'remove' && type !== 'purchase' && type !== 'detail')) {
            return false;
        }
        
        var virtPage;
        var virtTitle = '';
        var virtPrice = 0;
        var virtProducts = [];
        var variant_str;
        var productObj;
        var recid = '';
        var uid = '';
        var lid = '';

        for (var i = 0; i < productsArr.length; i++) {
            productObj = productsArr[i];

            if (virtTitle > '') {
                virtTitle += ', ';
            }
            virtTitle += productObj.name;
            virtPrice += productObj.price;

            variant_str = '';
            if (typeof productObj.options !== 'undefined' && productObj.options.length > 0) {
                Array.prototype.forEach.call(productObj.options, function (option) {
                    variant_str += '' + option['option'] + ': ' + option['variant'] + '; ';
                });
            }
            var virtProduct = {
                name: productObj.name,
                price: productObj.price,
                variant: variant_str,
                quantity: 1,
            };
            if (productObj.id && productObj.id > 0) {
                // eslint-disable-next-line no-undef
                id = productObj.id;
                virtProduct.id = productObj.id;
            }

            if (productObj.uid && productObj.uid > 0) {
                uid = productObj.uid;
                virtProduct.uid = productObj.uid;
            }

            if (productObj.recid && productObj.recid > 0) {
                recid = productObj.recid;
                virtProduct.recid = productObj.recid;
            }

            if (productObj.lid && productObj.lid > 0) {
                lid = productObj.lid;
                virtProduct.lid = productObj.lid;
            }

            if (productObj.sku && productObj.sku > 0) {
                virtProduct.sku = productObj.sku;
            }

            virtProducts[virtProducts.length] = virtProduct;
        }

        if (type === 'add' || type === 'remove') {
            virtPage = '/tilda/cart/' + type + '/';
            if (recid > 0) {
                virtPage += '' + recid;
            }
            if (uid > 0) {
                virtPage += '-u' + uid;
            } else if (lid > 0) {
                virtPage += '-' + lid;
            }
        }
        if (type === 'detail') {
            virtPage = '/tilda/product/detail/';
            if (uid > 0) {
                virtPage += '' + uid + '/';
            } else {
                if (recid > 0) {
                    virtPage += 'r' + recid;
                }
                if (lid > 0) {
                    virtPage += '-l' + lid;
                }
            }
        }
        if (type === 'purchase') {
            virtPage = '/tilda/rec' + recid + '/payment/';
        }

        var virtProduct = {
            ecommerce: {},
        };
        virtProduct.ecommerce[type] = { products: virtProducts };

        Tilda.sendEventToStatistics(virtPage, virtTitle, virtProduct, virtPrice);
    };

    Tilda.sendEventToStatistics = function (virtPage, virtTitle, referer, price) {
        var isVirtPage = virtPage.substring(0, 1) === '/';
        var products = [];
        var allRec = document.getElementById('allrecords');
        var allRecFbSendEvent = allRec ? allRec.getAttribute('data-fb-event') : null;
        var noFbSendEvent = !!(allRecFbSendEvent && allRecFbSendEvent === 'nosend');
        var allRecVkSendEvent = allRec ? allRec.getAttribute('data-vk-event') : null;
        var noVkSendEvent = !!(allRecVkSendEvent && allRecVkSendEvent === 'nosend');
        var currencyCode = '';
        var curBlock = document.querySelector('.t706');
        if (allRec.getAttribute('data-tilda-currency')) {
            currencyCode = allRec.getAttribute('data-tilda-currency');
        } else if (curBlock && curBlock.getAttribute('data-project-currency-code')) {
            currencyCode = curBlock.getAttribute('data-project-currency-code');
        } else {
            currencyCode = 'RUB';
        }

        if (!referer) {
            referer = window.location.href;
        }
        price = price ? parseFloat(price) : 0;

        if (price > 0) {
            if (!window.dataLayer) {
                window.dataLayer = [];
            }

            if (virtPage.indexOf('/tilda/') !== -1 && virtPage.indexOf('/payment/') !== -1 && window.tildaForm && window.tildaForm.orderIdForStat > '') {
                referer = {
                    ecommerce: {
                        purchase: {
                            actionField: {
                                id: window.tildaForm.orderIdForStat,
                                revenue: window.tildaForm.amountForStat,
                            },
                            products: window.tildaForm.arProductsForStat,
                        },
                    },
                };

                if (window.tildaForm.tildapayment && window.tildaForm.tildapayment.promocode) {
                    referer.ecommerce.purchase.actionField.coupon = window.tildaForm.tildapayment.promocode;
                }

                referer.event = 'purchase';
            } else {
                if (referer && referer.ecommerce) {
                    if (referer.ecommerce.add && referer.ecommerce.add.products) {
                        products = referer.ecommerce.add.products;
                    } else {
                        if (referer.ecommerce.remove && referer.ecommerce.remove.products) {
                            products = referer.ecommerce.remove.products;
                        } else {
                            if (referer.ecommerce.detail && referer.ecommerce.detail.products) {
                                products = referer.ecommerce.detail.products;
                            }
                        }
                    }

                    if (products && products.length > 0) {
                        for (var p = 0; p < products.length; p++) {
                            if (!products[p].id) {
                                if (products[p].sku) {
                                    products[p].id = products[p].sku;
                                } else {
                                    if (products[p].uid) {
                                        products[p].id = products[p].uid;
                                    } else {
                                        if (products[p].recid && products[p].lid) {
                                            products[p].id = '' + products[p].recid + '_' + products[p].lid;
                                        }
                                    }
                                }
                            }
                        }

                        if (referer.ecommerce.add && referer.ecommerce.add.products) {
                            referer.ecommerce.add.products = products;
                            referer.event = 'addToCart';
                        } else {
                            if (referer.ecommerce.remove && referer.ecommerce.remove.products) {
                                referer.ecommerce.remove.products = products;
                                referer.event = 'removeFromCart';
                            } else {
                                if (referer.ecommerce.detail && referer.ecommerce.detail.products) {
                                    referer.ecommerce.detail.products = products;
                                    referer.event = 'viewProduct';
                                } else {
                                    if (isVirtPage) {
                                        referer.event = 'pageView';
                                        referer.eventAction = virtPage;
                                    } else {
                                        referer.event = virtPage;
                                    }
                                    referer.title = virtTitle;
                                    referer.value = price;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (typeof window.dataLayer !== 'undefined') {
            if (isVirtPage) {
                if (price > 0) {
                    if (referer && referer.ecommerce) {
                        window.dataLayer.push(referer);
                    } else {
                        window.dataLayer.push({ event: 'pageView', eventAction: virtPage, title: virtTitle, value: price, product: referer });
                    }
                } else {
                    window.dataLayer.push({ event: 'pageView', eventAction: virtPage, title: virtTitle, referer: referer });
                }
            } else {
                if (referer && referer.ecommerce) {
                    window.dataLayer.push(referer);
                } else {
                    window.dataLayer.push({ event: virtPage, eventAction: virtTitle, value: price, referer: referer });
                }
            }
        }

        try {
            if (window.gtagTrackerID && window.mainTracker === 'gtag') {
                if (isVirtPage) {
                    if (referer && referer.event) {
                        if (referer.event === 'purchase') {
                            gtag('event', 'purchase', {
                                transaction_id: referer.ecommerce.purchase.actionField.id,
                                value: parseFloat(price).toFixed(2),
                                currency: currencyCode,
                                items: referer.ecommerce.purchase.products,
                            });
                        } else {
                            if (referer.event === 'addToCart' && referer.ecommerce.add) {
                                gtag('event', 'add_to_cart', {
                                    items: referer.ecommerce.add.products,
                                });
                            } else {
                                if (referer.event === 'removeFromCart' && referer.ecommerce.remove) {
                                    gtag('event', 'remove_from_cart', {
                                        items: referer.ecommerce.remove.products,
                                    });
                                } else {
                                    if (referer.event === 'viewProduct' && referer.ecommerce.detail) {
                                        gtag('event', 'view_item', {
                                            items: referer.ecommerce.detail.products,
                                        });
                                    }
                                }
                            }
                        }
                    } else {
                        gtag('config', window.gtagTrackerID, {
                            page_title: virtTitle,
                            page_path: virtPage,
                        });
                    }
                } else {
                    gtag('event', virtPage, {
                        event_category: 'tilda',
                        event_label: virtTitle,
                        value: price,
                    });
                }
            }
        } catch (e) { }

        if (window.ga && window.mainTracker !== 'tilda' && window.mainTracker !== 'gtag') {
            if (isVirtPage) {
                if (referer && referer.event) {
                    try {
                        if (!window.Tilda.isLoadGAEcommerce) {
                            window.Tilda.isLoadGAEcommerce = true;
                            ga('require', 'ec');
                        }
                        ga('set', 'currencyCode', currencyCode);

                        if (referer.event === 'purchase') {
                            var product;
                            var iProduct = referer.ecommerce.purchase.products.length;
                            for (var i = 0; i < iProduct; i++) {
                                product = referer.ecommerce.purchase.products[i];
                                ga('ec:addProduct', {
                                    id: product.id || i,
                                    name: product.name,
                                    price: parseFloat(product.price).toFixed(2),
                                    quantity: product.quantity,
                                });
                            }

                            ga('ec:setAction', 'purchase', {
                                id: referer.ecommerce.purchase.actionField.id,
                                revenue: parseFloat(price).toFixed(2),
                            });
                        } else {
                            if (referer.event === 'addToCart' && referer.ecommerce.add) {
                                var product;
                                var iProduct = referer.ecommerce.add.products.length;
                                for (var i = 0; i < iProduct; i++) {
                                    product = referer.ecommerce.add.products[i];
                                    ga('ec:addProduct', {
                                        id: product.id || i,
                                        name: product.name,
                                        price: parseFloat(product.price).toFixed(2),
                                        quantity: product.quantity,
                                    });
                                }
                                ga('ec:setAction', 'add');
                            } else {
                                if (referer.event === 'removeFromCart' && referer.ecommerce.remove) {
                                    var product;
                                    var iProduct = referer.ecommerce.remove.products.length;
                                    for (var i = 0; i < iProduct; i++) {
                                        product = referer.ecommerce.remove.products[i];
                                        ga('ec:addProduct', {
                                            id: product.id || i,
                                            name: product.name,
                                            price: parseFloat(product.price).toFixed(2),
                                            quantity: product.quantity,
                                        });
                                    }
                                    ga('ec:setAction', 'remove');
                                } else {
                                    if (referer.event === 'viewProduct' && referer.ecommerce.detail) {
                                        var product;
                                        var iProduct = referer.ecommerce.detail.products.length;
                                        for (var i = 0; i < iProduct; i++) {
                                            product = referer.ecommerce.detail.products[i];
                                            ga('ec:addProduct', {
                                                id: product.id || i,
                                                name: product.name,
                                                price: parseFloat(product.price).toFixed(2),
                                                quantity: product.quantity,
                                            });
                                        }
                                        ga('ec:setAction', 'detail');
                                    }
                                }
                            }
                        }
                    } catch (e) { }
                    ga('send', { hitType: 'pageview', page: virtPage, title: virtTitle, params: referer });
                } else {
                    ga('send', { hitType: 'pageview', page: virtPage, title: virtTitle });
                }
            } else {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'tilda',
                    eventAction: virtPage,
                    eventLabel: virtTitle,
                    eventValue: price,
                });
            }
        }

        if (window.mainMetrikaId && window.mainMetrikaId > 0 && typeof ym === 'function') {
            if (isVirtPage) {
                var mOpts = {
                    title: virtTitle,
                };
                if (price > 0) {
                    mOpts.params = {
                        order_price: price,
                    };
                    if (currencyCode) {
                        mOpts.params.currency = currencyCode;
                    }
                    ym(window.mainMetrikaId, 'hit', virtPage, mOpts);
                } else {
                    ym(window.mainMetrikaId, 'hit', virtPage, mOpts);
                }
            } else {
                if (price > 0) {
                    mOpts = {
                        order_price: price,
                    };
                    if (currencyCode) {
                        mOpts.currency = currencyCode;
                    }
                    ym(window.mainMetrikaId, 'reachGoal', virtPage, mOpts);
                } else {
                    ym(window.mainMetrikaId, 'reachGoal', virtPage);
                }
            }
        }

        if (window.mainMetrika > '' && window[window.mainMetrika]) {
            if (isVirtPage) {
                if (price > 0) {
                    window[window.mainMetrika].hit(virtPage, { title: virtTitle, order_price: price, params: referer });
                } else {
                    window[window.mainMetrika].hit(virtPage, { title: virtTitle });
                }
            } else {
                if (price > 0) {
                    window[window.mainMetrika].reachGoal(virtPage, { title: virtTitle, params: referer, order_price: price });
                } else {
                    window[window.mainMetrika].reachGoal(virtPage, { title: virtTitle, referer: referer });
                }
            }
        }

        if (typeof window.fbq !== 'undefined' && noFbSendEvent === false) {
            try {
                if (isVirtPage) {
                    if (virtPage.indexOf('tilda/') !== -1 && (virtPage.indexOf('/payment/') !== -1 || virtPage.indexOf('/submitted/') !== -1)) {
                        if (price > 0 && currencyCode) {
                            window.fbq('track', 'InitiateCheckout', {
                                content_name: virtTitle,
                                content_category: virtPage,
                                value: price,
                                currency: currencyCode,
                            });
                        } else {
                            window.fbq('track', 'Lead', { content_name: virtTitle, content_category: virtPage });
                        }
                    } else {
                        if (referer && referer.event && price > 0) {
                            if (referer.event === 'addToCart' && referer.ecommerce.add) {
                                var product;
                                var iProduct = referer.ecommerce.add.products.length;
                                var content_ids = [];
                                for (var i = 0; i < iProduct; i++) {
                                    product = referer.ecommerce.add.products[i];
                                    content_ids.push(product.id || product.uid || product.name);
                                }

                                window.fbq('track', 'AddToCart', { content_ids: content_ids, content_type: 'product', value: price, currency: currencyCode });
                            } else {
                                if (referer.event === 'viewProduct' && referer.ecommerce.detail) {
                                    var product;
                                    var iProduct = referer.ecommerce.detail.products.length;
                                    var content_ids = [];
                                    for (var i = 0; i < iProduct; i++) {
                                        product = referer.ecommerce.detail.products[i];
                                        content_ids.push(product.id || product.uid || product.name);
                                    }

                                    window.fbq('track', 'ViewContent', {
                                        content_ids: content_ids,
                                        content_type: 'product',
                                        value: price,
                                        currency: currencyCode,
                                    });
                                } else {
                                    if (virtPage.indexOf('tilda/popup') !== -1) {
                                        window.fbq('track', 'ViewContent', { content_name: virtTitle, content_category: virtPage });
                                    } else {
                                        window.fbq('track', 'ViewContent', { content_name: virtTitle, content_category: virtPage });
                                    }
                                }
                            }
                        } else {
                            if (virtPage.indexOf('tilda/popup') !== -1) {
                                window.fbq('track', 'ViewContent', { content_name: virtTitle, content_category: virtPage });
                            } else {
                                window.fbq('track', 'ViewContent', { content_name: virtTitle, content_category: virtPage });
                            }
                        }
                    }
                } else {
                    window.fbq('track', virtPage, { content_name: virtTitle, value: price });
                }
            } catch (e) {
                /**/
            }
        }

        if (typeof window.VK !== 'undefined' && typeof window.VK.Retargeting !== 'undefined' && noVkSendEvent === false) {
            try {
                if (isVirtPage) {
                    var allRec = document.getElementById('allrecords');
                    var vkPriceListId = allRec ? allRec.getAttribute('data-vk-price-list-id') : null;
                    var priceListID = vkPriceListId ?
                        parseInt(vkPriceListId) || 0 : 0;
                    var eventName = '';
                    var eventParams = false;
                    if (referer && referer.event) {
                        eventParams = { products: [], currency_code: '', total_price: 0 };

                        if (referer.event === 'purchase' && referer.ecommerce.purchase) {
                            if (price > 0 && priceListID > 0) {
                                eventParams.currency_code = currencyCode;
                                var product;
                                var iProduct = referer.ecommerce.purchase.products.length;
                                var content_ids = [];
                                for (var i = 0; i < iProduct; i++) {
                                    product = referer.ecommerce.purchase.products[i];

                                    eventParams.products.push({
                                        id: product.id || product.uid || product.name,
                                        price: product.price ? product.price : 0,
                                    });

                                    eventParams.total_price = price;
                                }
                                eventName = 'init_checkout';
                            } else {
                                eventName = 't-purchase';
                            }
                        } else {
                            if (referer.event === 'addToCart' && referer.ecommerce.add) {
                                if (price > 0 && priceListID > 0) {
                                    eventParams.currency_code = currencyCode;
                                    var product;
                                    var iProduct = referer.ecommerce.add.products.length;
                                    var content_ids = [];
                                    for (var i = 0; i < iProduct; i++) {
                                        product = referer.ecommerce.add.products[i];

                                        eventParams.products.push({
                                            id: product.id || product.uid || product.name,
                                            price: product.price ? product.price : 0,
                                        });

                                        eventParams.total_price = price;
                                    }
                                    eventName = 'add_to_cart';
                                } else {
                                    eventName = 't-add-to-cart';
                                    if (referer.ecommerce.add[0] && referer.ecommerce.add[0].uid) {
                                        eventName += '-' + referer.ecommerce.add[0].uid;
                                    }
                                }
                            } else {
                                if (referer.event === 'viewProduct' && referer.ecommerce.detail) {
                                    if (price > 0 && priceListID > 0) {
                                        eventParams.currency_code = currencyCode;
                                        var product;
                                        var iProduct = referer.ecommerce.detail.products.length;
                                        var content_ids = [];
                                        for (var i = 0; i < iProduct; i++) {
                                            product = referer.ecommerce.detail.products[i];

                                            eventParams.products.push({
                                                id: product.id || product.uid || product.name,
                                                price: product.price ? product.price : 0,
                                            });

                                            eventParams.total_price = price;
                                        }
                                        eventName = 'view_product';
                                    } else {
                                        eventName = 't-view-product';
                                        if (referer.ecommerce.detail[0] && referer.ecommerce.detail[0].uid) {
                                            eventName += '-' + referer.ecommerce.detail[0].uid;
                                        }
                                    }
                                } else {
                                    if (referer.event === 'removeFromCart' && referer.ecommerce.remmove) {
                                        if (price > 0 && priceListID > 0) {
                                            eventParams.currency_code = currencyCode;
                                            var product;
                                            var iProduct = referer.ecommerce.remove.products.length;
                                            var content_ids = [];
                                            for (var i = 0; i < iProduct; i++) {
                                                product = referer.ecommerce.remove.products[i];

                                                eventParams.products.push({
                                                    id: product.id || product.uid || product.name,
                                                    price: product.price ? product.price : 0,
                                                });

                                                eventParams.total_price = price;
                                            }
                                            eventName = 'remove_from_cart';
                                        } else {
                                            eventName = 't-remove-product';
                                            if (referer.ecommerce.remove[0] && referer.ecommerce.remove[0].uid) {
                                                eventName += '-' + referer.ecommerce.remove[0].uid;
                                            }
                                        }
                                    } else {
                                        eventName = referer.event;
                                    }
                                }
                            }
                        }
                    } else {
                        if (virtPage.indexOf('tilda/') !== -1 && virtPage.indexOf('/payment/') !== -1) {
                            var tmp = virtPage.replace('/tilda/', '');
                            tmp = tmp.replace('tilda/', '');
                            tmp = tmp.replace('/payment/', '');
                            eventName = 't-purchase-' + tmp;
                        } else {
                            if (virtPage.indexOf('tilda/') !== -1 && virtPage.indexOf('/submitted/') !== -1) {
                                var tmp = virtPage.replace('/tilda/', '');
                                tmp = tmp.replace('tilda/', '');
                                tmp = tmp.replace('/submitted/', '');
                                eventName = 't-lead-' + tmp;
                            } else {
                                if (virtPage.indexOf('tilda/popup') !== -1) {
                                    var tmp = virtPage.replace('/tilda/', '');
                                    tmp = tmp.replace('/', '-');
                                    eventName = 't-' + tmp;
                                } else {
                                    if (virtPage.indexOf('tilda/click') !== -1) {
                                        var tmp = virtPage.replace('/tilda/', '');
                                        tmp = tmp.replace('/', '-');
                                        eventName = 't-' + tmp;
                                    } else {
                                        var tmp = virtPage.replace('/', '-');
                                        eventName = 't-' + tmp;
                                    }
                                }
                            }
                        }
                    }

                    if (priceListID > 0 && eventParams && eventParams.currency_code) {
                        VK.Retargeting.Event('purchase');
                        VK.Retargeting.ProductEvent(priceListID, eventName, eventParams);
                    } else {
                        VK.Retargeting.Event(eventName);
                        if (eventName.substring(0, 10) === 't-purchase') {
                            VK.Goal('purchase');
                        } else {
                            if (eventName.substring(0, 6) === 't-lead') {
                                VK.Goal('lead');
                            }
                        }

                    }
                } else {
                    // eslint-disable-next-line no-undef
                    VK.Retargeting.Event(virtPage);
                }
            } catch (e) {
                /**/
            }
        }

        if (window.mainMailruId > '0') {
            var _tmr = window._tmr || (window._tmr = []);
            if (isVirtPage) {
                if (price > 0) {
                    _tmr.push({ id: '' + window.mainMailruId, type: 'pageView', url: virtPage, value: price, start: new Date().getTime() });
                } else {
                    _tmr.push({ id: '' + window.mainMailruId, type: 'pageView', url: virtPage, start: new Date().getTime() });
                }
            } else {
                if (price > 0) {
                    _tmr.push({ id: '' + window.mainMailruId, type: 'reachGoal', goal: virtPage, value: price });
                } else {
                    _tmr.push({ id: '' + window.mainMailruId, type: 'reachGoal', goal: virtPage });
                }
            }
        }

        if (typeof window.tildastat === 'function') {
            if (isVirtPage) {
                if (virtPage.indexOf('payment') > 0 && virtPage.indexOf('tilda/form') > -1) {
                    virtPage = virtPage.replace('tilda/form', 'tilda/rec');
                }
                window.tildastat('pageview', { page: virtPage });
            } else {
                window.tildastat('pageview', { page: '/tilda/event/' + virtPage });
            }
        }
    };

    Tilda.saveUTM = function () {
        try {
            var tildaPageURL = window.location.href;
            var tildaPageQuery = '';
            var tildaPageUTM = '';
            if (tildaPageURL.toLowerCase().indexOf('utm_') !== -1) {
                tildaPageURL = tildaPageURL.toLowerCase();
                tildaPageQuery = tildaPageURL.split('?');
                tildaPageQuery = tildaPageQuery[1];
                if (typeof tildaPageQuery === 'string') {
                    var arPair;
                    var arParams = tildaPageQuery.split('&');
                    for (var i in arParams) {
                        arPair = arParams[i].split('=');
                        if (arPair[0].substring(0, 4) === 'utm_') {
                            tildaPageUTM = tildaPageUTM + arParams[i] + '|||';
                        }
                    }

                    if (tildaPageUTM.length > 0) {
                        var date = new Date();
                        date.setDate(date.getDate() + 30);
                        document.cookie = 'TILDAUTM=' + encodeURIComponent(tildaPageUTM) + '; path=/; expires=' + date.toUTCString();
                    }
                }
            }
        } catch (err) { }
    };

    if (document.readyState !== 'loading') {
        t_events__initEvent();
    } else {
        document.addEventListener('DOMContentLoaded', t_events__initEvent);
    }

    /**
     * init event
     */
    function t_events__initEvent() {
        var myNav = navigator.userAgent.toLowerCase();
        var isIE = myNav.indexOf('msie') !== -1 ? parseInt(myNav.split('msie')[1]) : false;

        if (isIE === 8 || isIE === 9) {
            var btns = document.querySelectorAll('.t-btn');
            Array.prototype.forEach.call(btns, function (btn) {
                var url = btn.getAttribute('href');
                if (btn.querySelector('table') && url && url.indexOf('#popup:') === -1 && url.indexOf('#price:') === -1) {
                    btn.addEventListener('click', function (e) {
                        var currentUrl = e.target.getAttribute('href');
                        e.preventDefault();
                        window.location.href = currentUrl;
                    });
                }
            });
        }

        try {
            var allRec = document.getElementById('allrecords');
            var allRecCookie = allRec ? allRec.getAttribute('data-tilda-cookie') : null;
            if (!allRec || allRecCookie !== 'no') {
                Tilda.saveUTM();
            }
        } catch (e) { }

        var records = document.querySelectorAll('.r');
        Array.prototype.forEach.call(records, function (record) {
            record.removeEventListener('click', linkClickCreateEvent);
            record.addEventListener('click', linkClickCreateEvent);
        });

        /**
         * 
         * @param {event} e - event
         * @returns {false | void} - false if url contains 'http'
         */
        function linkClickCreateEvent(e) {
            if (e.target.closest('a.js-click-stat') || e.target.closest('.js-click-zero-stat')) {
                var targetEl = e.target.closest('a.js-click-stat') || e.target.closest('.js-click-zero-stat');
                var virtPage = targetEl.getAttribute('data-tilda-event-name');
                var virtTitle = targetEl.textContent;
                var url = targetEl.getAttribute('href') || '';
                var target = targetEl.getAttribute('target');

                if (!virtPage) {
                    var record = targetEl.closest('.r');
                    var recordId = record ? record.getAttribute('id') : '';
                    virtPage = '/tilda/click/' + recordId + '/?url=' + url;
                }
                Tilda.sendEventToStatistics(virtPage, virtTitle);
                if (url.substring(0, 4) === 'http') {
                    window.setTimeout(function () {
                        var params = '';
                        var item;
                        var html = '';
                        if (target === '_blank') {
                            if (url.indexOf('?') !== -1) {
                                params = url.split('?');
                                url = params[0];
                                params = params[1];
                                if (params.indexOf('#') !== -1) {
                                    params = params.split('#');
                                    url = url + '#' + params[1];
                                    params = params[0];
                                }
                                params = params.split('&');
                            }
                            if (!document.getElementById('tildaredirectform')) {
                                document.body.insertAdjacentHTML('beforeend', '<form id="tildaredirectform" target="_blank" method="GET" action="' + url + '" style="display:none;"></form>');
                            } else {
                                document.getElementById('tildaredirectform').setAttribute('method', 'GET');
                                document.getElementById('tildaredirectform').setAttribute('action', url);
                            }
                            html = '';
                            if (params.length > 0) {
                                for (var ii in params) {
                                    item = params[ii].split('=');
                                    if (item && item.length > 0) {
                                        html += '<input type="hidden" name="' + item[0] + '" value="' + (item[1] ? item[1] : '') + '">';
                                    }
                                }
                            }
                            var tildaRedirectForm = document.getElementById('tildaredirectform');
                            if (tildaRedirectForm) {
                                tildaRedirectForm.innerHTML = html;
                                tildaRedirectForm.submit();
                            }
                        } else {
                            window.location.href = url;
                        }
                    }, 300);
                    e.preventDefault();
                    return false;
                }
            }
        }

        var inputsAmount = document.querySelectorAll('input.js-amount');
        Array.prototype.forEach.call(inputsAmount, function (inputAmount) {
            var price = inputAmount.value;
            price = price.replace(/,/g, '.');
            // eslint-disable-next-line no-useless-escape
            price = parseFloat(price.replace(/[^0-9\.]/g, ''));
            inputAmount.value = price;
        });

    }
})();