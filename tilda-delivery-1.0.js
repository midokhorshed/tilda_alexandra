/**
 * Advanced delivery, can connect the integration of delivery services - CDEK, Boxberry, Pochta.ru, etc.
 * This script is called from the tilda-cart-1.0
 */

var tcart_newDelivery = {
    deliveryState: {
        currentRequest: null,
        projectId: null,
        city: {},
        services: {},
        searchboxes: {},
        focusoutTimers: {},
        cityCoordinates: null,
        ymapApiKey: null,
        cityGuid: null,
        streetGuid: null,
        currencyCode: null,
        pickupList: null,
        postalCode: null,
        staticCities: null,
        geoData: null,
        autocompleteData: {
            cities: null,
        },
        badResponseCounters: {
            services: 0,
        },
        activeServiceUid: null,
        freeDeliveryThreshold: null,
        fullNames: {
            city: '',
            street: '',
            house: '',
            pickup: '',
        },
    },

    init: function (ymapApiKey) {
        var that = this;
        window.tcart_newDeliveryActive = true;

        that.updateProjectId();

        var cart = document.querySelector('.t706');
        if (cart) {
            that.deliveryState.currencyCode = cart.getAttribute('data-project-currency-code');
        }
        that.deliveryState.ymapApiKey = ymapApiKey;

        if (that.deliveryState.ymapApiKey) {
            that.mapAppendScript('', ymapApiKey);
        }


        var deliveryWrapper = cart.querySelector('.t-radio__wrapper-delivery');
        var allDeliveryWrapper = cart.querySelectorAll('.t-radio__wrapper-delivery');

        if (allDeliveryWrapper.length > 0) {
            Array.prototype.forEach.call(allDeliveryWrapper, function (el) {
                el.innerHTML = '';
            });
        }

        deliveryWrapper.setAttribute('id', 'customdelivery');

        // append delivery title in wrappper
        var deliveryTitle = tcart_newDelivery.createTitle(t_delivery_dict('delivery'));
        deliveryWrapper.appendChild(deliveryTitle);

        that.appendStyleFromSettings();

        var submitButton = document.querySelector('.t706 .t-form__submit button');
        if (submitButton) {
            submitButton.classList.add('t706__submit_disable');
            submitButton.setAttribute('disabled', 'disabled');
        }

        that.getCityFromGeo(that.deliveryState.projectId,
            function (data) {
                if (!data) {
                    return;
                }

                var cityInput = tcart_newDelivery.createInput(
                    '',
                    t_delivery_dict('city'),
                    null,
                    null,
                    null,
                    null,
                    'searchbox-input load js-tilda-rule',
                    'tildadelivery-city',
                    null,
                    null,
                    true,
                    null,
                    'chosevalue'
                );
                var searchbox = that.createSearchbox(cityInput, 'city-searchbox');
                var postalCodeInput = tcart_newDelivery.createInput('', '', null, null, null, null, '', 'tildadelivery-postalcode', true);
                var hashInput = tcart_newDelivery.createInput('', 'hash', null, null, null, null, '', 'tildadelivery-hash', true);
                var countryInput = tcart_newDelivery.createInput('', 'country', null, null, null, null, '', 'tildadelivery-country', true);

                deliveryWrapper.appendChild(postalCodeInput);
                deliveryWrapper.appendChild(hashInput);
                deliveryWrapper.appendChild(countryInput);
                deliveryWrapper.appendChild(searchbox);

                that.searchboxInit('city-searchbox', 'city');

                var deliveryServicesWrapper = document.createElement('div');
                deliveryServicesWrapper.id = 'delivery-services-wrapper';
                deliveryWrapper.appendChild(deliveryServicesWrapper);

                that.deliveryState.geoData = data;

                var cityData;
                if (data.cities) {
                    cityData = data.cities[0];
                    that.deliveryState.staticCities = data.cities;
                } else {
                    cityData = data;
                }

                if (cityData) {
                    that.deliveryState.city = cityData;
                    that.deliveryState.cityGuid = cityData.guid;
                    that.deliveryState.countryIso = cityData.countryIso;
                    that.deliveryState.postalCode = cityData.postalCode;
                    that.deliveryState.cityPostalCode = cityData.postalCode;
                }

                if (cityData.name === '') {
                    var citySearchInput = document.querySelector('.t706 #city-searchbox input');
                    citySearchInput.classList.remove('load');
                    citySearchInput.readOnly = false;
                    return;
                }

                document.querySelector('.t706 #city-searchbox .t-input-description').textContent = cityData.fullName;
                document.querySelector('[name="tildadelivery-country"]').value = cityData.countryIso;

                if (that.deliveryState.ymapApiKey) {
                    that.getCityCoordinates('yandex', cityData.name, function (data) {
                        var coordinates;
                        try {
                            coordinates = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');

                            if (coordinates) {
                                coordinates = [coordinates[1], coordinates[0]];
                                that.deliveryState.cityCoordinates = coordinates;
                            }
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error(e);
                        }
                    });
                }


                if (!that.deliveryState.searchboxes['city-searchbox']) {
                    that.deliveryState.searchboxes['city-searchbox'] = {};
                }

                that.deliveryState.searchboxes['city-searchbox'].address = cityData;

                that.deliveryState.fullNames.city = cityData.fullName;

                document.querySelector('input[name="tildadelivery-city"]').value = cityData.name;
                document.querySelector('input[name="tildadelivery-city"]').setAttribute('data-option-selected', true);

                // append wrapper for radio in wrappper
                that.setPostalCodeInput(cityData.postalCode);
                that.renderServices(cityData.postalCode);

                if (submitButton) {
                    submitButton.classList.remove('t706__submit_disable');
                    submitButton.removeAttribute('disabled');
                }
            },
            function () {
                that.showUnavailableMessage(deliveryWrapper);
            }
        );

        // dynamic events for every clear trigger
        var customDelivery = document.getElementById('customdelivery');
        if (customDelivery) {
            var events = 'click';
            var clearTarget = '';
            if (window.isMobile) {
                events += ' touchstart';
                clearTarget = '.searchbox-input';
            } else {
                // The touchpad on Windows sends only the mousdown event
                events += ' mousedown';
                clearTarget += '.t-input-clear';
            }

            events.split(' ').forEach(function (e) {
                customDelivery.addEventListener(e, function (e) {
                    for (var target = e.target; target && target != this; target = target.parentNode) {
                        if (target.matches('.searchbox-change-pickup')) {
                            var searchBoxWrapper = target.closest('.searchbox-wrapper');
                            if (searchBoxWrapper) {
                                searchBoxWrapper.classList.remove('show-info');
                            }
                        }

                        if (target.matches(clearTarget)) {
                            clickHandler.call(target, e);
                            break;
                        }
                    }
                }, false);
            });
        }

        /**
         * Handler of click for inputs
         *
         * @param {Event} event click's event
         */
        function clickHandler(event) {
            var target = event.target; // is searchbox-input or t-input-clear
            var doClear = false;

            if ((target.matches('.searchbox-input')) && window.isMobile) {
                var style = getComputedStyle(target);
                var width = target.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
                var inputWrapper = target.closest('.t-input-block');

                if (width - event.offsetX <= 45 && inputWrapper && inputWrapper.classList.contains('active')) {
                    doClear = true;
                }
            } else if (target.matches('.t-input-clear')) {
                doClear = true;
            }

            if (doClear) {
                var searchbox = target.closest('.searchbox-wrapper');
                var searchboxId = searchbox.getAttribute('id');

                searchbox.querySelector('.searchbox-list').innerHTML = '';

                clearTimeout(that.deliveryState.focusoutTimers[searchboxId]);

                searchbox.querySelector('.searchbox-input').value = '';
                searchbox.querySelector('.t-input-block').classList.remove('active');
                setTimeout(function () {
                    searchbox.querySelector('.searchbox-input').focus();
                }, 50);

                if (that.deliveryState.searchboxes[searchboxId] && that.deliveryState.searchboxes[searchboxId].address) {
                    that.deliveryState.searchboxes[searchboxId].address = null;
                }
            }

        }

        that.renderFullAddressNode();
    },

    /** @deprecated */
    appendStyleFromSettings: function () {
        var ref = document.querySelector('script');

        var firstInput = document.querySelector('.t706 .t-form__inputsbox .t-input-group input[type="text"]');

        var inputStyleText = '';
        if (firstInput) {
            var isBorderBottomOnly = firstInput.classList.contains('t-input_bbonly');
            if (isBorderBottomOnly) {
                inputStyleText +=
                    'outline: none; padding-left: 0!important; padding-right: 0!important; border-top: 0!important; border-right: 0!important; border-left: 0!important; background-color: transparent!important; border-radius: 0!important;';
            }
            inputStyleText += firstInput.style.cssText;
        } else {
            inputStyleText += 'color: #000000; border: 1px solid #000000;';
        }

        var inputStyleTag = document.createElement('style');
        inputStyleTag.innerHTML = '.t706 .t-form__inputsbox #customdelivery .t-input {' + inputStyleText + '}';

        ref.parentNode.insertBefore(inputStyleTag, ref);

        var firstLabel = document.querySelector('.t706 .t-form__inputsbox .t-input-group .t-input-title');

        if (firstLabel) {
            var labelStyleText = '';
            labelStyleText += firstLabel.style.cssText;

            var labelStyleTag = document.createElement('style');
            labelStyleTag.innerHTML = '.t706 .t-form__inputsbox #customdelivery .t-input-title {' + labelStyleText + '}';
            ref.parentNode.insertBefore(labelStyleTag, ref);
        }
    },

    disableChoseServiceControls: function () {
        var inputs = document.querySelectorAll('.t706 input[name="tildadelivery-type"]');
        Array.prototype.forEach.call(inputs, function (el) {
            el.setAttribute('disabled', 'disabled');
        });
    },

    enableChoseServiceControls: function () {
        var inputs = document.querySelectorAll('.t706 input[name="tildadelivery-type"]');
        Array.prototype.forEach.call(inputs, function (el) {
            el.removeAttribute('disabled');
        });
    },

    getFullAddress: function () {
        var fullNames = this.deliveryState.fullNames;
        var address = '';

        if (fullNames.pickup) {
            address += fullNames.city + ', ' + fullNames.pickup;
        } else if (fullNames.street) {
            address += fullNames.city + ', ' + fullNames.street;
        } else if (fullNames.pickup === null && fullNames.street === null && fullNames.house) {
            address += fullNames.city + ',';
        }

        if (fullNames.house) {
            address += ' ' + fullNames.house;
        }

        return address;
    },

    renderFullAddressNode: function () {
        var addressNode = document.createElement('div');
        addressNode.classList.add('delivery-full-address');
        addressNode.classList.add('t-descr');
        var ref = document.querySelector('.t706__cartwin-totalamount-info');
        ref.insertAdjacentElement('afterend', addressNode);
    },

    setFullAddress: function (address) {
        var addressNode = document.querySelector('.delivery-full-address');
        if (addressNode) {
            addressNode.textContent = address;
        }
    },

    changeCartInputsHandler: function () {
        var that = this;
        var inputs = document.querySelectorAll('.t706 input');
        Array.prototype.forEach.call(inputs, function (el) {
            el.removeEventListener('change', that.saveTcartDelivery);
            el.addEventListener('change', that.saveTcartDelivery);
        });
    },

    /**
     * Remember the delivery data
     */
    saveTcartDelivery: function () {
        var keysForTcartDelivery = [
            'city',
            'street',
            'pickup-name',
            'pickup-address',
            'pickup-id',
            'house',
            'entrance',
            'floor',
            'aptoffice',
            'phone',
            'entrancecode',
            'comment',
            'service-id',
            'hash',
            'postalcode',
            'country',
            'userinitials',
            'onelineaddress',
        ];

        var cart = document.querySelector('.t706');

        keysForTcartDelivery.forEach(function (key) {
            var value = '';
            var el = cart.querySelector('[name="tildadelivery-' + key + '"]');

            if (el) {
                value = el.value;
            }

            switch (key) {
                case 'service-id':
                    el = cart.querySelector('[name="tildadelivery-type"]:checked');
                    if (el) {
                        value = el.getAttribute('data-service-id');
                    }
                    break;
                case 'pickup-id':
                    el = cart.querySelector('[data-pickup-id]');
                    if (el) {
                        value = el.getAttribute('data-pickup-id');
                    }
                    break;
                case 'pickup-address':
                    el = cart.querySelector('[data-pickup-address]');
                    if (el) {
                        value = el.getAttribute('data-pickup-address');
                    }
                    break;
                default:
                    break;
            }

            if (value !== '' && window.tcart.delivery !== undefined) {
                window.tcart.delivery[key] = value;
            }
        });

        // Remember the delivery data entered/selected by users
        if (window.deliveryUserFieldsAutoComplete === undefined) {
            window.deliveryUserFieldsAutoComplete = {};
        }

        var keysForAutoComplete = [
            'street',
            'house',
            'entrance',
            'floor',
            'aptoffice',
            'phone',
            'entrancecode',
            'comment',
            'postalcode',
            'country',
            'userinitials',
            'onelineaddress',
        ];

        keysForAutoComplete.forEach(function (key) {
            var value = '';
            var el = cart.querySelector('[name="tildadelivery-' + key + '"]');
            if (el) {
                value = el.value;
            }

            if (value !== '' && window.tcart.delivery !== undefined) {
                window.deliveryUserFieldsAutoComplete[key] = value;
            }
        });
    },

    /**
     * Recover delivery data entered/selected by user
     */
    restoreTcartDelivery: function () {
        var keys = [
            'street',
            'house',
            'entrance',
            'floor',
            'aptoffice',
            'phone',
            'entrancecode',
            'comment',
            'postalcode',
            'country',
            'userinitials',
            'onelineaddress',
        ];

        var cart = document.querySelector('.t706');
        var userFields = window.deliveryUserFieldsAutoComplete;

        keys.forEach(function (key) {
            var inputName = 'tildadelivery-' + key;
            var el = cart.querySelector('[name=' + inputName + ']');

            if (el && userFields !== undefined && userFields[key] !== undefined && userFields[key] !== '') {
                el.value = userFields[key];

                if (key === 'street') {
                    tcart__inputErrorHandler.show(el, t_delivery_dict('selectAddress'));
                }
            }
        });
    },

    /**
     * Adding a Yandex map script
     *
     * @param {string} type map type, only 'yandex'. TODO: add 'google'
     * @param {string} ymapApiKey Yandex map key
     */
    mapAppendScript: function (type, ymapApiKey) {
        var script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + (ymapApiKey || '') + '&lang=ru_RU';
        document.head.appendChild(script);
    },

    /**
     * Init a Yandex map
     *
     * @param {string} type map type, only 'yandex'. TODO: add 'google'
     */
    mapInit: function (type) {
        switch (type) {
            case 'yandex':
                if (window.ymaps !== undefined) {
                    var mapWrapper = document.createElement('div');
                    mapWrapper.id = 'delivery-yandex-map';
                    document.getElementById('pickup-searchbox').querySelector('.searchbox-inner-wrapper').appendChild(mapWrapper);
                    var that = this;

                    window.ymaps.ready(function () {
                        window.deliveryMap = new ymaps.Map(
                            'delivery-yandex-map', {
                                center: that.deliveryState.cityCoordinates || [55.76, 37.64],
                                zoom: 8,
                                controls: ['zoomControl'],
                                maxZoom: 20,
                            }, {
                                yandexMapDisablePoiInteractivity: true,
                            }
                        );
                    });
                }
                break;

            default:
                break;
        }
    },

    /**
     * Add points to map
     *
     * @param {string} type map type, only 'yandex'. TODO: add 'google'
     * @param {Array} points coordinates
     * @param {Node} searchbox node of input
     */
    mapAddPoints: function (type, points, searchbox) {
        var that = this;

        if (window.ymaps !== undefined) {
            window.ymaps.ready(function () {
                if (window.deliveryMap.geoObjects) {
                    window.deliveryMap.geoObjects.removeAll();
                }
                var pointsForCluster = [];
                points.forEach(function (point) {
                    // if point have wrong coordinates - skip him
                    if (point.coordinates[0] === 0 && point.coordinates[1] === 0) {
                        return;
                    }
                    pointsForCluster.push(point.coordinates);
                });

                if (pointsForCluster.length > 0) {
                    var clusterer = new ymaps.Clusterer({
                        preset: 'islands#circleIcon',

                        /**
                         * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
                         */
                        groupByCoordinates: false,
                        clusterDisableClickZoom: false,
                        clusterHideIconOnBalloonOpen: false,
                        geoObjectHideIconOnBalloonOpen: false,
                    });

                    /**
                     * Функция возвращает объект, содержащий данные метки.
                     * Поле данных clusterCaption будет отображено в списке геообъектов в балуне кластера.
                     * Поле balloonContentBody - источник данных для контента балуна.
                     * Оба поля поддерживают HTML-разметку.
                     * Список полей данных, которые используют стандартные макеты содержимого иконки метки
                     * и балуна геообъектов, можно посмотреть в документации.
                     *
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
                     * @param {number} index index of points
                     * @returns {object} baloon content
                     */
                    var getPointData = function (index) {
                        var point = points[index];
                        var name = point.name;
                        var address = point.address || '';
                        var worktime = point.workTime || '';
                        var phones = point.phones || '';
                        var addressComment = point.addressComment || '';
                        var phonesLabel = '';

                        var balloonContentHeader = '';
                        balloonContentHeader += '<b>' + name + '</b>';

                        var balloonContentBody = '';
                        balloonContentBody += '<b>' + t_delivery_dict('address') + ': ' + '</b>' + address + '</br>';

                        var restrictions = '';
                        if (point.cash && point.cash === 'n') {
                            restrictions += 'cash';
                        }

                        balloonContentBody +=
                            '<div style="margin: 10px 0;" class="delivery-map-point-select" ' +
                            (restrictions ? 'data-restrictions="' + restrictions + '"' : '') +
                            ' data-point-index=' +
                            index +
                            ' onclick="window.tcart__chosePointOnMap(this); return false;">' +
                            t_delivery_dict('select') +
                            '</div>';
                        balloonContentBody += addressComment ? addressComment + '</br>' : '';
                        balloonContentBody += worktime ? '<b>' + t_delivery_dict('workingHours') + ': ' + '</b>' + worktime + '</br>' : '';

                        if (phones.length) {
                            phonesLabel = phones.length > 1 ? '<b>' + t_delivery_dict('phones') + ': ' + '</b>' : '<b>' + t_delivery_dict('phone') + ': ' + '</b>';
                            balloonContentBody += phonesLabel + phones.join(', ') + '</br>';
                        }

                        window.tcart__chosePointOnMap = function (button) {
                            var i = button.dataset.pointIndex;
                            var point = points[i];
                            // myGeoObject.options.set('iconColor', '#000');
                            var searchInput = searchbox.querySelector('.searchbox-input');
                            var searchboxId = searchbox.getAttribute('id');

                            tcart__inputErrorHandler.hide(searchInput);

                            if (!that.deliveryState.searchboxes[searchboxId]) {
                                that.deliveryState.searchboxes[searchboxId] = {};
                            }
                            searchInput.setAttribute('data-option-selected', true);

                            that.deliveryState.fullNames.pickup = point.address;
                            that.deliveryState.postalCode = point.postalCode;
                            that.setPostalCodeInput(point.postalCode);
                            that.changePickupHandler(point.id, point.name, point.postalCode, searchbox, point.address);
                            document.querySelector('.t706 [name="tildadelivery-pickup-name"]').value = point.name;

                            that.saveTcartDelivery();
                            window.deliveryMap.balloon.close();

                            that.showPickupInfo(point.id, searchbox);
                            // cashrule
                            that.hidePaymentMethod(button);
                        };

                        return {
                            balloonContentHeader: balloonContentHeader,
                            balloonContentBody: balloonContentBody,
                            balloonContentFooter: '',
                        };
                    };

                    /**
                     * Функция возвращает объект, содержащий опции метки.
                     * Все опции, которые поддерживают геообъекты, можно посмотреть в документации.
                     *
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
                     * @param {number} index just index
                     * @returns {object} options
                     */
                    var getPointOptions = function (index) {
                        return {
                            preset: 'islands#circleIcon',
                            index: index,
                        };
                    };

                    var geoObjects = [];

                    /**
                     * Данные передаются вторым параметром в конструктор метки, опции - третьим.
                     *
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark.xml#constructor-summary
                     */
                    for (var i = 0, len = pointsForCluster.length; i < len; i++) {
                        geoObjects[i] = new ymaps.Placemark(pointsForCluster[i], getPointData(i), getPointOptions(i));
                    }

                    /**
                     * Можно менять опции кластеризатора после создания.
                     */
                    clusterer.options.set({
                        gridSize: 80,
                        clusterDisableClickZoom: false,
                    });

                    /**
                     * В кластеризатор можно добавить javascript-массив меток (не геоколлекцию) или одну метку.
                     *
                     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#add
                     */
                    clusterer.add(geoObjects);
                    window.deliveryMap.geoObjects.add(clusterer);

                    window.deliveryMap.setBounds(clusterer.getBounds(), {
                        checkZoomRange: true,
                    }).then(function () {
                        if (window.deliveryMap.getZoom() > 20) {
                            window.deliveryMap.setZoom(18);
                        }
                    }, this);
                }
            });
        }
    },

    setPostalCodeInput: function (value) {
        var cart = document.querySelector('.t706');
        cart.querySelector('input[name="tildadelivery-postalcode"]').value = value;
    },
    setHashInput: function (value) {
        var cart = document.querySelector('.t706');
        cart.querySelector('input[name="tildadelivery-hash"]').value = value;
    },

    createSearchbox: function (input, id) {
        var searchboxWrapper = document.createElement('div');
        searchboxWrapper.classList.add('searchbox-wrapper');
        searchboxWrapper.setAttribute('id', id);

        var searchboxInnerWrapper = document.createElement('div');
        searchboxInnerWrapper.classList.add('searchbox-inner-wrapper');
        searchboxInnerWrapper.appendChild(input);

        var searchboxList = document.createElement('div');
        searchboxList.classList.add('searchbox-list');
        searchboxList.setAttribute('tabindex', -1);
        searchboxInnerWrapper.appendChild(searchboxList);
        searchboxWrapper.appendChild(searchboxInnerWrapper);

        var searchboxInfo = document.createElement('div');
        searchboxInfo.classList.add('searchbox-info');
        searchboxInfo.setAttribute('tabindex', -1);
        searchboxWrapper.appendChild(searchboxInfo);

        return searchboxWrapper;
    },

    searchboxInit: function (searchboxId, searchboxType) {
        var searchbox = document.getElementById(searchboxId);
        var searchInput = searchbox.querySelector('.searchbox-input');
        var inputWrapper = searchInput.closest('.t-input-block');
        var that = this;

        var changeTimeout;

        'paste keyup'.split(' ').forEach(function (eventName) {
            searchInput.addEventListener(eventName, function (event) {
                if (!(event.keyCode >= 33 && event.keyCode <= 40)) {
                    clearTimeout(changeTimeout);

                    if (that.deliveryState.searchboxes[searchboxId]) {
                        that.deliveryState.searchboxes[searchboxId].address = null;
                    }

                    if (that.deliveryState.searchboxes[searchboxId] && searchboxType !== 'pickup') {
                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress = null;
                    }

                    if (searchInput.value !== '' && !inputWrapper.classList.contains('active')) {
                        inputWrapper.classList.add('active');
                    }

                    changeTimeout = setTimeout(function () {
                        that.changeSearchboxInputHandler(event, searchbox, searchboxType);
                        changeTimeout = null;
                    }, 500);
                }
            }, false);
        });

        var clicked = false;
        // The touchpad on Windows sends only the mousdown event
        'click mousedown keyup'.split(' ').forEach(function (eventName) {
            searchInput.addEventListener(eventName, function (event) {
                if (!clicked) {
                    clicked = true;
                    t_throttle(that.clickSearchboxInputHandler(event, searchbox, searchboxType));
                }

                setTimeout(function () {
                    clicked = false;
                }, 200);
            }, false);
        });

        searchInput.addEventListener('blur', function (event) {
            var relatedTarget = event.relatedTarget;
            if (!relatedTarget || !relatedTarget.classList.contains('searchbox-list')) {
                clearTimeout(changeTimeout);
                that.focusoutSearchboxInputHandler(searchbox, searchboxType);
            }
        }, false);
    },

    clickSearchboxInputHandler: function (event, searchbox, searchboxType) {
        var searchInput = searchbox.querySelector('.searchbox-input');
        var inputWrapper = searchInput.closest('.t-input-block');

        if (searchInput.value !== '' && !inputWrapper.classList.contains('active')) {
            inputWrapper.classList.add('active');
        }

        var searchList = searchbox.querySelector('.searchbox-list');
        var searchListItems = searchbox.querySelectorAll('.searchbox-list-item');
        if (searchListItems.length) {
            searchList.style.display = '';
            return;
        }

        if (searchInput.classList.contains('load')) {
            return;
        }

        var isAddressStrong;
        var serviceId = parseInt(searchInput.getAttribute('data-service-id'), 10);

        if (serviceId) {
            isAddressStrong = this.deliveryState.services[serviceId].strongAddress;
        }

        var that = this;
        var searchboxId = searchbox.getAttribute('id');

        if (this.deliveryState.searchboxes[searchboxId] && searchboxType !== 'pickup') {
            this.deliveryState.searchboxes[searchboxId].autocompleteAddress = null;
        }

        var pattern = (event.target.value || '').trim();
        var ajaxData;

        if (!searchbox.classList.contains('load')) {
            searchbox.classList.add('load');
            searchbox.readOnly = true;
        }

        var data;

        switch (searchboxType) {
            case 'city':

                if (pattern === '') {
                    searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                    searchList.style.display = '';
                    searchbox.classList.remove('load');
                    searchbox.readOnly = false;
                    return;
                }

                ajaxData = {
                    pattern: pattern,
                };
                ajaxData = JSON.stringify(ajaxData);

                if (
                    that.deliveryState.searchboxes[searchboxId] &&
                    (that.deliveryState.searchboxes[searchboxId].autocompleteAddress || that.deliveryState.staticCities)
                ) {
                    searchbox.classList.remove('load');
                    searchbox.readOnly = false;
                    data = that.deliveryState.staticCities || that.deliveryState.searchboxes[searchboxId].autocompleteAddress;

                    if (data.error || data.length === 0) {
                        if (searchInput.value !== '') {
                            searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                        } else {
                            searchList.innerHTML = '';
                        }
                        return;
                    }

                    searchList.style.display = '';

                    that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                    that.deliveryState.searchboxes[searchboxId].addresses = data;

                    that.deliveryState.autocompleteData.cities = data;

                    that.fillSearchList(searchList, data, 'address');
                    that.choseSearchListItemHandler(searchbox, searchboxType);
                } else {
                    that.getAddresses(ajaxData, searchboxType,
                        function (data) {
                            searchbox.classList.remove('load');
                            searchbox.readOnly = false;

                            if (data.error || data.length === 0) {
                                if (searchInput.value !== '') {
                                    searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                                } else {
                                    searchList.innerHTML = '';
                                }
                                return;
                            }

                            searchList.style.display = '';

                            that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                            that.deliveryState.searchboxes[searchboxId].addresses = data;

                            that.deliveryState.autocompleteData.cities = data;

                            that.fillSearchList(searchList, data, 'address');
                            that.choseSearchListItemHandler(searchbox, searchboxType);
                        });
                }

                break;

            case 'pickup':
                var deliveryServiceId = searchInput.getAttribute('data-service-id');
                var restrictions = '';
                var radioDeliveryService = document.querySelector('.t706 input.t-radio_delivery[data-service-id="' + deliveryServiceId + '"]');
                if (radioDeliveryService) {
                    restrictions = radioDeliveryService.getAttribute('data-restrictions') || '';
                }

                if (that.deliveryState.searchboxes[searchboxId] && that.deliveryState.searchboxes[searchboxId].autocompleteAddress) {
                    searchbox.classList.remove('load');
                    searchbox.readOnly = false;
                    data = that.deliveryState.searchboxes[searchboxId].autocompleteAddress;

                    if (data.error || data.length === 0) {
                        searchList.innerHTML = '';
                        var lang = window.tildaBrowserLang.toLowerCase();
                        var userFriendlyError = data.userFriendlyError ?
                            data.userFriendlyError[lang] ?
                            data.userFriendlyError[lang] :
                            data.userFriendlyError.en :
                            '';

                        if (data.error) {
                            tcart__errorHandler.show(userFriendlyError || data.error);
                        }
                        return;
                    }

                    data = data.filter(function (item) {
                        return (
                            item.name.toLowerCase().indexOf(pattern.toLowerCase()) !== -1 || item.address.toLowerCase().indexOf(pattern.toLowerCase()) !== -1
                        );
                    });

                    data = data.map(function (item) {
                        if (restrictions === 'cash') {
                            item.cash = 'n';
                        }
                        return item;
                    });

                    if (!that.deliveryState.searchboxes[searchboxId]) {
                        that.deliveryState.searchboxes[searchboxId] = {};
                    }

                    that.fillSearchList(searchList, data, 'pickup');
                    that.choseSearchListItemHandler(searchbox, searchboxType);
                } else {
                    that.getPickupList({
                        projectId: that.deliveryState.projectId,
                        postalCode: that.deliveryState.city.postalCode,
                        deliveryId: deliveryServiceId,
                        pattern: pattern,
                        onload: function (data) {
                            searchbox.classList.remove('load');
                            searchbox.readOnly = false;

                            if (data.error || data.length === 0) {
                                if (searchInput.value !== '') {
                                    searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                                } else {
                                    searchList.innerHTML = '';
                                }
                                var lang = window.tildaBrowserLang.toLowerCase();
                                var userFriendlyError = data.userFriendlyError ?
                                    data.userFriendlyError[lang] ?
                                    data.userFriendlyError[lang] :
                                    data.userFriendlyError.en :
                                    '';

                                if (data.error) {
                                    tcart__errorHandler.show(userFriendlyError || data.error);
                                }
                                return;
                            }

                            if (!that.deliveryState.searchboxes[searchboxId]) {
                                that.deliveryState.searchboxes[searchboxId] = {};
                            }
                            that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data;
                            that.deliveryState.pickupList = data;
                            that.fillSearchList(searchList, data, 'pickup');
                            that.choseSearchListItemHandler(searchbox, searchboxType);
                        }
                    });
                }

                break;

            case 'street':
                ajaxData = {
                    pattern: pattern,
                    fias: this.deliveryState.cityGuid,
                };
                ajaxData = JSON.stringify(ajaxData);

                if (!that.deliveryState.searchboxes[searchboxId]) {
                    that.deliveryState.searchboxes[searchboxId] = {};
                }

                if (isAddressStrong && searchboxType === 'street') {
                    searchInput.setAttribute('data-option-selected', false);
                }

                that.getAddresses(ajaxData, searchboxType,
                    function (data) {
                        searchbox.classList.remove('load');
                        searchbox.readOnly = false;

                        if (data.error || data.length === 0) {
                            if (searchInput.value !== '') {
                                searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                            } else {
                                searchList.innerHTML = '';
                            }
                            return;
                        }

                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                        that.fillSearchList(searchList, data, 'address');
                        that.choseSearchListItemHandler(searchbox, searchboxType);
                    });

                break;

            case 'house':
                ajaxData = {
                    pattern: pattern,
                    fias: this.deliveryState.streetGuid || this.deliveryState.cityGuid,
                };
                ajaxData = JSON.stringify(ajaxData);

                that.getAddresses(ajaxData, searchboxType,
                    function (data) {
                        searchbox.classList.remove('load');
                        searchbox.readOnly = false;
                        if (data.error || data.length === 0) {
                            searchList.innerHTML = '';
                            return;
                        }

                        if (!that.deliveryState.searchboxes[searchboxId]) {
                            that.deliveryState.searchboxes[searchboxId] = {};
                        }
                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                        that.fillSearchList(searchList, data, 'address');
                        that.choseSearchListItemHandler(searchbox, searchboxType);
                    });

                break;

            default:
                searchbox.classList.remove('load');
                searchbox.readOnly = false;
                break;
        }
    },

    changeSearchboxInputHandler: function (e, searchbox, searchboxType) {
        var that = this;
        var searchList = searchbox.querySelector('.searchbox-list');
        var searchInput = searchbox.querySelector('.searchbox-input');

        var inputWrapper = searchInput.closest('.t-input-block');

        var searchboxId = searchbox.getAttribute('id');
        var serviceId = parseInt(searchInput.getAttribute('data-service-id'));
        var isAddressStrong;

        if (serviceId) {
            isAddressStrong = this.deliveryState.services[serviceId].strongAddress;
        }

        if (searchInput.classList.contains('load')) {
            return;
        }

        var pattern = (e.target.value || '').trim();
        var ajaxData;

        if (!searchbox.classList.contains('load')) {
            searchbox.classList.add('load');
            searchbox.readOnly = true;
        }

        if (searchInput.value === '') {
            inputWrapper.classList.remove('active');
        }

        var data;

        switch (searchboxType) {
            case 'city':
                ajaxData = {
                    pattern: pattern,
                };
                ajaxData = JSON.stringify(ajaxData);

                if (!that.deliveryState.searchboxes[searchboxId]) {
                    that.deliveryState.searchboxes[searchboxId] = {};
                }

                if (
                    that.deliveryState.searchboxes[searchboxId] &&
                    that.deliveryState.staticCities
                ) {
                    searchbox.classList.remove('load');
                    searchbox.readOnly = false;
                    data = that.deliveryState.staticCities;
                    if (Array.isArray(data)) {
                        data = data.filter(function (item) {
                            return (
                                item.name.toLowerCase().indexOf(pattern.toLowerCase()) !== -1 || item.fullName.toLowerCase().indexOf(pattern.toLowerCase()) !== -1
                            );
                        });
                    } else {
                        // eslint-disable-next-line no-console
                        console.log(data);
                    }

                    if (data.length === 0) {
                        if (searchInput.value !== '') {
                            searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                        } else {
                            searchList.innerHTML = '';
                        }
                        return;
                    }

                    that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                    that.deliveryState.searchboxes[searchboxId].addresses = data;

                    that.deliveryState.autocompleteData.cities = data;

                    that.fillSearchList(searchList, data, 'address');
                    that.choseSearchListItemHandler(searchbox, searchboxType);
                } else {
                    that.getAddresses(ajaxData, searchboxType,
                        function (data) {
                            searchbox.classList.remove('load');
                            searchbox.readOnly = false;

                            if (data.error || data.length === 0) {
                                if (searchInput.value !== '') {
                                    searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                                } else {
                                    searchList.innerHTML = '';
                                }
                                return;
                            }

                            that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                            that.deliveryState.searchboxes[searchboxId].addresses = data;

                            that.deliveryState.autocompleteData.cities = data;

                            that.fillSearchList(searchList, data, 'address');
                            that.choseSearchListItemHandler(searchbox, searchboxType);
                        });
                }

                break;
            case 'pickup':
                searchInput.setAttribute('data-option-selected', false);

                if (that.deliveryState.searchboxes[searchboxId] && that.deliveryState.searchboxes[searchboxId].autocompleteAddress) {
                    searchbox.classList.remove('load');
                    searchbox.readOnly = false;
                    data = that.deliveryState.searchboxes[searchboxId].autocompleteAddress;

                    data = data.filter(function (item) {
                        return (
                            item.name.toLowerCase().indexOf(pattern.toLowerCase()) !== -1 || item.address.toLowerCase().indexOf(pattern.toLowerCase()) !== -1
                        );
                    });

                    if (data.length === 0) {
                        if (searchInput.value !== '') {
                            searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                        } else {
                            searchList.innerHTML = '';
                        }
                        return;
                    }

                    that.fillSearchList(searchList, data, 'pickup');
                    that.choseSearchListItemHandler(searchbox, searchboxType);
                }

                break;

            case 'street':
                ajaxData = {
                    pattern: pattern,
                    fias: this.deliveryState.cityGuid,
                };
                ajaxData = JSON.stringify(ajaxData);

                if (!that.deliveryState.searchboxes[searchboxId]) {
                    that.deliveryState.searchboxes[searchboxId] = {};
                }

                if (isAddressStrong) {
                    searchInput.setAttribute('data-option-selected', false);
                }

                that.getAddresses(ajaxData, searchboxType,
                    function (data) {
                        searchbox.classList.remove('load');
                        searchbox.readOnly = false;

                        if (data.error || data.length === 0) {
                            if (searchInput.value !== '') {
                                searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                            } else {
                                searchList.innerHTML = '';
                            }
                            return;
                        }

                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                        that.deliveryState.searchboxes[searchboxId].addresses = data;

                        that.fillSearchList(searchList, data, 'address');
                        that.choseSearchListItemHandler(searchbox, searchboxType);
                    });

                break;

            case 'house':
                ajaxData = {
                    pattern: pattern,
                    fias: this.deliveryState.streetGuid || this.deliveryState.cityGuid,
                };
                ajaxData = JSON.stringify(ajaxData);

                if (!that.deliveryState.searchboxes[searchboxId]) {
                    that.deliveryState.searchboxes[searchboxId] = {};
                }

                that.getAddresses(ajaxData, searchboxType,
                    function (data) {
                        searchbox.classList.remove('load');
                        searchbox.readOnly = false;

                        if (data.error || data.length === 0) {
                            if (searchInput.value !== '') {
                                searchList.innerHTML = '<div class="searchbox-list-item t-text" style="user-select: none; pointer-events: none;">' + t_delivery_dict('noResult') + '</div>';
                            } else {
                                searchList.innerHTML = '';
                            }
                            return;
                        }

                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress = data[0];
                        that.deliveryState.searchboxes[searchboxId].addresses = data;

                        that.fillSearchList(searchList, data, 'address');
                        that.choseSearchListItemHandler(searchbox, searchboxType);
                    });

                break;
        }
    },

    choseSearchListItemHandler: function (searchbox, searchboxType) {
        var searchboxId = searchbox.getAttribute('id');
        var searchInput = searchbox.querySelector('.searchbox-input');
        var searchboxDescriptionInput = searchbox.querySelector('.t-input-description');
        var searchList = searchbox.querySelector('.searchbox-list');
        var searchListItems = searchbox.querySelectorAll('.searchbox-list-item');
        var postalCode;
        var that = this;
        var serviceId;

        var inputWrapper = searchInput.closest('.t-input-block');

        tcart__inputErrorHandler.hide(searchInput);

        var clicked = false;
        // The touchpad on Windows sends only the mousdown event
        'click mousedown'.split(' ').forEach(function (eventName) {
            Array.prototype.forEach.call(searchListItems, function (searchListItem) {
                searchListItem.addEventListener(eventName, function (e) {
                    if (clicked) {
                        return;
                    }
                    clicked = true;

                    inputWrapper.classList.remove('active');
                    clearTimeout(that.deliveryState.focusoutTimers[searchboxId]);
                    postalCode = e.target.dataset.postalcode;
                    that.deliveryState.postalCode = postalCode;
                    that.setPostalCodeInput(postalCode);

                    if (!that.deliveryState.searchboxes[searchboxId]) {
                        that.deliveryState.searchboxes[searchboxId] = {};
                    }

                    switch (searchboxType) {
                        case 'city':
                            searchInput.classList.add('load');
                            searchInput.readOnly = true;
                            tcart__errorHandler.hide();

                            searchInput.value = e.target.dataset.name;
                            searchboxDescriptionInput.innerHTML = e.target.dataset.fullName;

                            document.querySelector('.t706 [name="tildadelivery-country"]').value = e.target.dataset.countryIso;

                            searchInput.setAttribute('data-guid', e.target.dataset.guid);

                            if (that.deliveryState.ymapApiKey) {
                                that.getCityCoordinates('yandex', e.target.dataset.name,
                                    function (data) {
                                        var coordinates;
                                        try {
                                            coordinates = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');

                                            if (coordinates) {
                                                coordinates = [coordinates[1], coordinates[0]];
                                                that.deliveryState.cityCoordinates = coordinates;
                                            }
                                        } catch (e) {
                                            // eslint-disable-next-line no-console
                                            console.error(e);
                                        }
                                    });
                            }

                            that.deliveryState.searchboxes[searchboxId].address = {
                                name: e.target.dataset.name,
                                postalCode: postalCode,
                                guid: e.target.dataset.guid,
                            };

                            that.deliveryState.city = {
                                name: e.target.dataset.name,
                                fullName: e.target.dataset.fullName,
                                postalCode: postalCode,
                                guid: e.target.dataset.guid,
                            };

                            that.deliveryState.cityPostalCode = postalCode;

                            var cityGeoData;
                            var length = that.deliveryState.autocompleteData.cities.length;
                            for (var i = 0; i < length; i++) {
                                if (that.deliveryState.autocompleteData.cities[i].guid === e.target.dataset.guid) {
                                    cityGeoData = that.deliveryState.autocompleteData.cities[i];
                                    break;
                                }
                            }

                            that.deliveryState.geoData = cityGeoData;

                            that.deliveryState.cityGuid = e.target.dataset.guid;
                            that.deliveryState.streetGuid = null;

                            that.deliveryState.fullNames = {};

                            that.deliveryState.fullNames.city = e.target.dataset.fullName;

                            document.getElementById('delivery-services-wrapper').innerHTML = '';

                            that.renderServices(postalCode);

                            searchList.style.display = 'none';

                            break;

                        case 'street':
                            serviceId = parseInt(searchInput.getAttribute('data-service-id'), 10);
                            searchInput.value = e.target.dataset.shortname;
                            searchInput.setAttribute('data-guid', e.target.dataset.guid);

                            // for street with postalCode equal 0
                            postalCode = postalCode || that.deliveryState.city.postalCode;

                            that.deliveryState.searchboxes[searchboxId].address = {
                                name: e.target.dataset.name,
                                shortName: e.target.dataset.shortname,
                                postalCode: postalCode,
                                guid: e.target.dataset.guid,
                            };

                            that.deliveryState.streetGuid = e.target.dataset.guid;

                            that.deliveryState.fullNames.street = e.target.dataset.shortname;

                            that.deliveryState.fullNames.house = null;
                            that.clearHouseInput();

                            window.tcart.emptyDeliveryServices = true;
                            tcart__updateDelivery();

                            that.getDeliveryPrice({
                                projectId: that.deliveryState.projectId,
                                postalCode: postalCode,
                                serviceId: serviceId,
                                onload: function (data) {
                                    if (data.error || data.length === 0) {
                                        var lang = window.tildaBrowserLang.toLowerCase();
                                        var userFriendlyError = data.userFriendlyError ?
                                            data.userFriendlyError[lang] ?
                                            data.userFriendlyError[lang] :
                                            data.userFriendlyError.en :
                                            '';

                                        if (data.error) {
                                            tcart__errorHandler.show(userFriendlyError || data.error);
                                        }
                                        window.tcart.emptyDeliveryServices = true;
                                        tcart__updateDelivery();
                                        return;
                                    }

                                    window.tcart.emptyDeliveryServices = false;
                                    tcart__errorHandler.hide();

                                    if (data.hash !== undefined) {
                                        that.setHashInput(data.hash);
                                    }

                                    if (data.price !== undefined) {
                                        var servicePrice = data.price;
                                        that.updatePriceValueInRadio(servicePrice, serviceId);
                                    }

                                    that.setFullAddress(that.getFullAddress());
                                    tcart__showDeliveryPrice();

                                },
                                onerror: function () {
                                    var error = '';
                                    if (window.browserLang === 'RU') {
                                        error = 'Невозможно получить почтовый индекс для доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for street" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                    } else {
                                        error = 'Unable to get a postal code for delivery. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for street" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                    }

                                    tcart__errorHandler.show('Request failed: ' + error);
                                    window.tcart.emptyDeliveryServices = true;
                                    tcart__updateDelivery();
                                    return;
                                }
                            });

                            searchList.innerHTML = '';

                            break;

                        case 'pickup':
                            var coordinates = e.target.dataset.coordinates.split(',');

                            // cashrule
                            that.hidePaymentMethod(e.target);

                            that.changePickupHandler(e.target.dataset.pickupid, e.target.dataset.name, postalCode, searchbox, e.target.dataset.address, coordinates);

                            that.deliveryState.searchboxes[searchboxId].address = {
                                name: e.target.dataset.name,
                                pickupid: e.target.dataset.pickupid,
                                postalCode: postalCode,
                            };

                            that.deliveryState.fullNames[searchboxType] = e.target.dataset.address;

                            that.showPickupInfo(e.target.dataset.pickupid, searchbox);

                            searchList.innerHTML = '';

                            break;

                        case 'house':
                            serviceId = parseInt(searchInput.getAttribute('data-service-id'), 10);
                            searchInput.value = e.target.dataset.name;

                            // for house with postalCode equal 0
                            postalCode = postalCode || that.deliveryState.city.postalCode;

                            that.deliveryState.searchboxes[searchboxId].address = {
                                postalCode: postalCode,
                            };

                            that.deliveryState.fullNames[searchboxType] = e.target.dataset.name;

                            window.tcart.emptyDeliveryServices = true;
                            tcart__updateDelivery();

                            that.getDeliveryPrice({
                                projectId: that.deliveryState.projectId,
                                postalCode: postalCode,
                                serviceId: serviceId,
                                onload: function (data) {
                                    if (data.error || data.length === 0) {
                                        var lang = window.tildaBrowserLang.toLowerCase();
                                        var userFriendlyError = data.userFriendlyError ?
                                            data.userFriendlyError[lang] ?
                                            data.userFriendlyError[lang] :
                                            data.userFriendlyError.en :
                                            '';

                                        if (data.error) {
                                            tcart__errorHandler.show(userFriendlyError || data.error);
                                        }
                                        window.tcart.emptyDeliveryServices = true;
                                        tcart__updateDelivery();

                                        that.removePriceValueInRadio(serviceId);

                                        return;
                                    }

                                    window.tcart.emptyDeliveryServices = false;
                                    tcart__errorHandler.hide();

                                    if (data.hash !== undefined) {
                                        that.setHashInput(data.hash);
                                    }

                                    if (data.price !== undefined) {
                                        var servicePrice = data.price;
                                        that.updatePriceValueInRadio(servicePrice, serviceId);
                                    }
                                    that.setFullAddress(that.getFullAddress());
                                    tcart__showDeliveryPrice();

                                },
                                onerror: function () {
                                    var error = '';
                                    if (window.browserLang === 'RU') {
                                        error = 'Невозможно получить почтовый индекс для доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for house" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                    } else {
                                        error = 'Unable to get a postal code for delivery. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for house" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                    }

                                    tcart__errorHandler.show('Request failed: ' + error);
                                    window.tcart.emptyDeliveryServices = true;
                                    tcart__updateDelivery();
                                    return;
                                }
                            });

                            searchList.innerHTML = '';
                            break;
                    }

                    searchInput.setAttribute('data-option-selected', true);
                    setTimeout(function () {
                        clicked = false;
                    }, 200);
                }, false);
            });

        });
    },

    focusoutSearchboxInputHandler: function (searchbox, searchboxType) {
        var that = this;
        var postalCode;
        var searchList = searchbox.querySelector('.searchbox-list');
        var searchboxDescriptionInput = searchbox.querySelector('.t-input-description');
        var searchboxId = searchbox.getAttribute('id');
        var searchInput = searchbox.querySelector('.searchbox-input');
        var inputWrapper = searchInput.closest('.t-input-block');
        var data;
        var serviceId = parseInt(searchInput.getAttribute('data-service-id'), 10);
        var isAddressStrong;

        if (serviceId && searchList.innerHTML !== '') {
            isAddressStrong = this.deliveryState.services[serviceId].strongAddress;
            searchInput.setAttribute('data-option-selected', false);
        } else {
            searchInput.setAttribute('data-option-selected', true);
        }

        this.deliveryState.focusoutTimers[searchboxId] = setTimeout(function () {
            inputWrapper.classList.remove('active');
            if (that.deliveryState.searchboxes[searchboxId] && that.deliveryState.searchboxes[searchboxId].address) {
                tcart__inputErrorHandler.hide(searchInput);
                if (searchboxType === 'city') {
                    searchList.style.display = 'none';
                } else {
                    searchList.innerHTML = '';
                }
                return;
            }

            switch (searchboxType) {
                case 'city':
                    if (that.deliveryState.searchboxes[searchboxId] && that.deliveryState.searchboxes[searchboxId].autocompleteAddress && searchInput.value === that.deliveryState.searchboxes[searchboxId].autocompleteAddress.name) {
                        searchInput.classList.add('load');
                        searchInput.readOnly = true;
                        data = that.deliveryState.searchboxes[searchboxId].autocompleteAddress;
                        // set address in state
                        that.deliveryState.searchboxes[searchboxId].address = data;

                        // hide errors
                        tcart__inputErrorHandler.hide(searchInput);

                        if (that.deliveryState.ymapApiKey) {
                            that.getCityCoordinates('yandex', data.name,
                                function (data) {
                                    var coordinates;
                                    try {
                                        coordinates = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');

                                        if (coordinates) {
                                            coordinates = [coordinates[1], coordinates[0]];
                                            that.deliveryState.cityCoordinates = coordinates;
                                        }
                                    } catch (e) {
                                        // eslint-disable-next-line no-console
                                        console.error(e);
                                    }
                                });
                        }
                        postalCode = data.postalCode;
                        that.deliveryState.postalCode = postalCode;
                        that.setPostalCodeInput(postalCode);
                        document.querySelector('[name="tildadelivery-country"]').value = data.countryIso;

                        searchInput.value = data.name;

                        searchboxDescriptionInput.innerHTML = data.fullName;
                        searchInput.setAttribute('data-guid', data.guid);

                        that.deliveryState.city.name = data.name;
                        that.deliveryState.city.fullName = data.fullName;
                        that.deliveryState.city.postalCode = postalCode;
                        that.deliveryState.city.guid = data.guid;
                        that.deliveryState.cityPostalCode = postalCode;

                        that.deliveryState.cityGuid = data.guid;
                        that.deliveryState.streetGuid = null;

                        that.deliveryState.fullNames = {};
                        that.deliveryState.fullNames[searchboxType] = data.fullName;

                        var cityGeoData;
                        var length = that.deliveryState.autocompleteData.cities.length;
                        for (var i = 0; i < length; i++) {
                            if (that.deliveryState.autocompleteData.cities[i].guid === data.guid) {
                                cityGeoData = that.deliveryState.autocompleteData.cities[i];
                                break;
                            }
                        }

                        that.deliveryState.geoData = cityGeoData;

                        searchList.style.display = 'none';
                        that.renderServices(postalCode);

                        searchInput.setAttribute('data-option-selected', true);
                    } else {
                        searchList.innerHTML = '';
                        searchboxDescriptionInput.innerHTML = '';

                        var addressesWrapper = document.getElementById('addresses-wrapper');
                        if (addressesWrapper && addressesWrapper.parentNode) {
                            addressesWrapper.parentNode.removeChild(addressesWrapper);
                        }

                        searchInput.setAttribute('data-option-selected', false);
                        that.deliveryState.streetGuid = null;
                        that.deliveryState.fullNames = {};
                        tcart__inputErrorHandler.show(searchInput, t_delivery_dict('selectCity'));
                    }

                    document.getElementById('delivery-services-wrapper').innerHTML = '';

                    break;

                case 'street':
                    if (
                        that.deliveryState.searchboxes[searchboxId] &&
                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress &&
                        searchInput.value === that.deliveryState.searchboxes[searchboxId].autocompleteAddress.shortName
                    ) {
                        data = that.deliveryState.searchboxes[searchboxId].autocompleteAddress;
                        // set address in state
                        that.deliveryState.searchboxes[searchboxId].address = data;
                        that.deliveryState.fullNames[searchboxType] = data.shortName;
                        // hide errors
                        tcart__inputErrorHandler.hide(searchInput);

                        postalCode = data.postalCode;
                        that.deliveryState.postalCode = postalCode;

                        searchInput.value = data.shortName;

                        searchInput.setAttribute('data-guid', data.guid);

                        that.deliveryState.streetGuid = data.guid;
                        that.setPostalCodeInput(postalCode);
                        searchInput.setAttribute('data-option-selected', true);

                        searchList.innerHTML = '';

                        that.getDeliveryPrice({
                            projectId: that.deliveryState.projectId,
                            postalCode: postalCode,
                            serviceId: serviceId,
                            onload: function (data) {
                                if (data.error || data.length === 0) {
                                    var lang = window.tildaBrowserLang.toLowerCase();
                                    var userFriendlyError = data.userFriendlyError ?
                                        data.userFriendlyError[lang] ?
                                        data.userFriendlyError[lang] :
                                        data.userFriendlyError.en :
                                        '';

                                    if (data.error) {
                                        tcart__errorHandler.show(userFriendlyError || data.error);
                                    }
                                    return;
                                }

                                if (data.hash !== undefined) {
                                    that.setHashInput(data.hash);
                                }

                                if (data.price !== undefined) {
                                    var servicePrice = data.price;
                                    that.updatePriceValueInRadio(servicePrice, serviceId);
                                }
                                that.setFullAddress(that.getFullAddress());
                                tcart__showDeliveryPrice();

                            },
                            onerror: function () {
                                var error = '';
                                if (window.browserLang === 'RU') {
                                    error = 'Невозможно получить почтовый индекс для доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for street" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                } else {
                                    error = 'Unable to get a postal code for delivery. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for street" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                }

                                tcart__errorHandler.show('Request failed: ' + error);
                                window.tcart.emptyDeliveryServices = true;
                                tcart__updateDelivery();
                                return;
                            }
                        });
                    } else {
                        if (isAddressStrong) {
                            searchInput.setAttribute('data-option-selected', false);
                            searchList.innerHTML = '';
                            tcart__inputErrorHandler.show(searchInput, t_delivery_dict('selectAddress'));
                        }

                        searchList.innerHTML = '';
                    }

                    that.deliveryState.fullNames.house = null;
                    that.clearHouseInput();

                    break;

                case 'house':
                    if (
                        that.deliveryState.searchboxes[searchboxId] &&
                        that.deliveryState.searchboxes[searchboxId].autocompleteAddress &&
                        searchInput.value === that.deliveryState.searchboxes[searchboxId].autocompleteAddress.name
                    ) {
                        data = that.deliveryState.searchboxes[searchboxId].autocompleteAddress;
                        // set address in state
                        that.deliveryState.searchboxes[searchboxId].address = data;
                        that.deliveryState.fullNames[searchboxType] = data.name;
                        // hide errors
                        tcart__inputErrorHandler.hide(searchInput);

                        postalCode = data.postalCode;
                        that.deliveryState.postalCode = postalCode;

                        searchInput.val(data.name);

                        searchInput.setAttribute('data-option-selected', true);
                        that.setPostalCodeInput(postalCode);

                        searchList.innerHTML = '';

                        that.getDeliveryPrice({
                            projectId: that.deliveryState.projectId,
                            postalCode: postalCode,
                            serviceId: serviceId,
                            onload: function (data) {
                                if (data.error || data.length === 0) {
                                    var lang = window.tildaBrowserLang.toLowerCase();
                                    var userFriendlyError = data.userFriendlyError ?
                                        data.userFriendlyError[lang] ?
                                        data.userFriendlyError[lang] :
                                        data.userFriendlyError.en :
                                        '';

                                    if (data.error) {
                                        tcart__errorHandler.show(userFriendlyError || data.error);
                                    }
                                    return;
                                }

                                if (data.hash !== undefined) {
                                    that.setHashInput(data.hash);
                                }

                                if (data.price !== undefined) {
                                    var servicePrice = data.price;
                                    that.updatePriceValueInRadio(servicePrice, serviceId);
                                }
                                that.setFullAddress(that.getFullAddress());
                                tcart__showDeliveryPrice();

                            },
                            onerror: function () {
                                var error = '';
                                if (window.browserLang === 'RU') {
                                    error = 'Невозможно получить почтовый индекс для доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for house" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                } else {
                                    error = 'Unable to get a postal code for delivery. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get a postal code for house" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                                }

                                tcart__errorHandler.show('Request failed: ' + error);
                                window.tcart.emptyDeliveryServices = true;
                                tcart__updateDelivery();
                                return;
                            }
                        });
                    } else {
                        searchList.innerHTML = '';
                    }

                    break;

                case 'pickup':
                    searchList.innerHTML = '';
                    var autocompleteAddress = null;
                    var equalAddress = null;

                    if (that.deliveryState.searchboxes[searchboxId] && that.deliveryState.searchboxes[searchboxId].autocompleteAddress) {
                        autocompleteAddress = data = that.deliveryState.searchboxes[searchboxId].autocompleteAddress;
                        autocompleteAddress.forEach(function (address) {
                            if (address.name === searchInput.value) {
                                equalAddress = address;
                            }
                        });
                    }

                    if (autocompleteAddress && equalAddress) {
                        data = equalAddress;
                        // set address in state
                        that.deliveryState.searchboxes[searchboxId].address = data;
                        that.deliveryState.fullNames[searchboxType] = data.address;
                        // hide errors
                        tcart__inputErrorHandler.hide(searchInput);
                        searchInput.setAttribute('data-option-selected', true);

                        that.changePickupHandler(data.id, data.name, data.postalCode, searchbox, data.address, data.coordinates);
                        that.setPostalCodeInput(data.postalCode);
                        that.deliveryState.postalCode = data.postalCode;
                        searchList.innerHTML = '';
                    } else {
                        searchInput.setAttribute('data-option-selected', false);
                        tcart__inputErrorHandler.show(searchInput, t_delivery_dict('selectAddress'));
                    }
                    break;

                default:
                    break;
            }
        }, 200);
    },

    fillSearchList: function (searchList, data, type) {
        var newWrap = document.createElement('div');
        var searchListItemDescription;
        var titleText;
        var descriptionText;

        data.forEach(function (address) {
            var searchListItem = document.createElement('div');
            searchListItem.classList.add('searchbox-list-item');
            searchListItem.classList.add('t-text');

            switch (type) {
                case 'pickup':
                    titleText = address.name;
                    descriptionText = address.address;

                    var restrictions = '';
                    if (address.cash && address.cash === 'n') {
                        restrictions += 'cash';
                    }
                    searchListItem.dataset.restrictions = restrictions;
                    break;

                case 'address':
                    if (address.fullName) {
                        // modify data from server
                        titleText = address.fullName.split(',').reverse()[0];
                        var fullNameValue = address.fullName;
                        fullNameValue = fullNameValue.split(',').reverse();
                        fullNameValue.shift();
                        fullNameValue = fullNameValue.join(', ');
                        descriptionText = fullNameValue;
                    } else {
                        // for house autocomplete
                        titleText = address.name;
                        descriptionText = '';
                    }

                    break;

                default:
                    break;
            }

            searchListItem.dataset.name = address.name;
            searchListItem.dataset.fullName = address.fullName || '';
            searchListItem.dataset.postalcode = address.postalCode;
            searchListItem.dataset.guid = address.guid || '';
            searchListItem.dataset.pickupid = address.id || '';
            searchListItem.dataset.shortname = address.shortName || '';
            searchListItem.dataset.address = address.address || '';
            searchListItem.dataset.coordinates = address.coordinates || '';

            searchListItem.dataset.countryIso = address.countryIso || '';

            var searchListItemText = document.createElement('div');
            searchListItemText.classList.add('searchbox-list-item-text');
            searchListItemText.appendChild(document.createTextNode(titleText));
            searchListItem.appendChild(searchListItemText);

            searchListItemDescription = document.createElement('div');
            searchListItemDescription.classList.add('searchbox-list-item-description');

            searchListItemDescription.appendChild(document.createTextNode(descriptionText));
            searchListItem.appendChild(searchListItemDescription);

            newWrap.appendChild(searchListItem);
        });

        searchList.innerHTML = '';
        searchList.appendChild(newWrap);

        searchList.scrollTop = 0;
    },

    showPickupInfo: function (pickupId, searchbox) {
        var searchboxInfo = searchbox.querySelector('.searchbox-info');
        searchbox.classList.add('show-info');
        var pickupData;

        this.deliveryState.pickupList.forEach(function (pickupItem) {
            if (pickupItem.id == pickupId) {
                pickupData = pickupItem;
                return;
            }
        });

        var name = pickupData.name;
        var address = pickupData.address || '';
        var worktime = pickupData.workTime || '';
        var phones = pickupData.phones || '';
        var addressComment = pickupData.addressComment || '';

        var infoContent = '';
        infoContent += '<p style="font-weight: 400; margin-bottom: 15px;" class="t-text">' + t_delivery_dict('pickup') + ':' + '</p>';
        infoContent += '<p class="t-text">' + name + '</p>';
        infoContent += '<p class="t-text">' + t_delivery_dict('address') + ': ' + address + '</p>';
        if (addressComment) {
            infoContent += '<p class="t-text" style="opacity: 0.6; line-height: 22px; font-size: .9rem;">' + addressComment + '</p>';
        }
        infoContent += worktime ? '<p class="t-text">' + t_delivery_dict('workingHours') + ': ' + worktime + '</p>' : '';

        if (phones.length) {
            infoContent +=
                phones.length > 1 ?
                '<p class="t-text">' + t_delivery_dict('phones') + ': ' + phones.join(', ') + '</p>' :
                '<p class="t-text">' + t_delivery_dict('phone') + ': ' + phones.join(', ') + '</p>';
        }

        infoContent +=
            '<span style="border-bottom: 1px dashed #000; font-weight: 400; margin-top: 10px; display: inline-block; cursor: pointer;" class="t-text searchbox-change-pickup">' +
            t_delivery_dict('change') +
            '</span>';

        searchboxInfo.innerHTML = infoContent;
    },

    /**
     * Declension of number
     *
     * @param {number} number number
     * @returns {string} day (1, 21, 31...) or days (other cases)
     */
    declensionOfNumber: function (number) {
        if (parseInt(number, 10) % 10 === 1 && parseInt(number, 10) !== 11) {
            return t_delivery_dict('day');
        } else {
            return t_delivery_dict('days');
        }
    },

    renderServices: function (postalCode) {
        this.deliveryState.services = {};
        this.deliveryState.postalCode = {};

        var deliveryServicesWrapper = document.getElementById('delivery-services-wrapper');
        if (deliveryServicesWrapper) {
            deliveryServicesWrapper.innerHTML = '';
        }
        var addressesWrapper = document.getElementById('addresses-wrapper');
        if (addressesWrapper && addressesWrapper.parentNode) {
            addressesWrapper.parentNode.removeChild(addressesWrapper);
        }

        var cityPostalCode = this.deliveryState.cityPostalCode || '';
        var that = this;
        var currencyCode = this.deliveryState.currencyCode;
        var citySearchInput = document.querySelector('.t706 #city-searchbox input');
        var cart = document.querySelector('.t706');
        var deliveryWrapper = cart.querySelector('.t-radio__wrapper-delivery');

        this.getServices(this.deliveryState.projectId, cityPostalCode, currencyCode,
            function (data) {
                if (data.error) {
                    var lang = window.tildaBrowserLang.toLowerCase();
                    var userFriendlyError = data.userFriendlyError ?
                        data.userFriendlyError[lang] ?
                        data.userFriendlyError[lang] :
                        data.userFriendlyError.en :
                        '';

                    window.tcart.emptyDeliveryServices = true;
                    tcart__errorHandler.show(userFriendlyError || data.error);
                    citySearchInput.classList.remove('load');
                    citySearchInput.readOnly = false;
                    tcart__updateDelivery();
                    return;
                }

                if (data.length === 0) {
                    window.tcart.emptyDeliveryServices = true;
                    that.deliveryState.activeServiceUid = null;
                    tcart__errorHandler.show(t_delivery_dict('deliveryNotPossible'));
                    citySearchInput.classList.remove('load');
                    citySearchInput.readOnly = false;
                } else {
                    window.tcart.emptyDeliveryServices = false;
                }

                // append radios in wrappper
                data.forEach(function (service, index) {
                    if (service.currency && service.currency !== that.deliveryState.currencyCode) {
                        // eslint-disable-next-line no-console
                        console.error(service.title + ': wrong delivery currency (' + service.currency + ')');

                        if (data.length === index + 1) {
                            // unblock UI if error in last service
                            var cartContent = document.querySelectorAll('.t706 .t706__cartwin-products, .t706 .t706__orderform');
                            Array.prototype.forEach.call(cartContent, function (el) {
                                el.style.pointerEvents = '';
                            });
                            citySearchInput.classList.remove('load');
                            citySearchInput.readOnly = false;
                        }

                        return;
                    }
                    that.deliveryState.services[service.id] = {};
                    that.deliveryState.services[service.id].fields = service.fields;
                    that.deliveryState.services[service.id].strongAddress = service.strongAddress;

                    var serviceHint = service.hint || '';
                    var title = service.title || '';
                    var serviceMinimumPrice = service.minimumPrice || '';
                    var description;
                    var checkedStatus = false;
                    var freeDeliveryThreshold = service.freeDeliveryThreshold || '';

                    var dayString = that.declensionOfNumber(service.minimumDeliverTime);
                    if (service.staticPrice && service.minimumDeliverTime) {
                        description =
                            t_delivery_dict('from') + ' ' + service.minimumDeliverTime + ' ' + dayString + ', ' + tcart__showPrice(service.staticPrice);
                    } else if (service.staticPrice) {
                        description = tcart__showPrice(service.staticPrice);
                    } else if (service.minimumDeliverTime && service.minimumPrice) {
                        description =
                            t_delivery_dict('from') +
                            ' ' +
                            service.minimumDeliverTime +
                            ' ' +
                            dayString +
                            ', ' +
                            t_delivery_dict('from') +
                            ' ' +
                            tcart__showPrice(service.minimumPrice);
                    } else if (service.minimumPrice) {
                        description = t_delivery_dict('from') + ' ' + tcart__showPrice(service.minimumPrice);
                    } else if (service.minimumDeliverTime) {
                        description = t_delivery_dict('from') + ' ' + service.minimumDeliverTime + ' ' + dayString;
                    }

                    if (service.type === 'delivery') {
                        serviceMinimumPrice = '';
                    }

                    // rescrictions for hide controls in cart
                    // for example hide payment method 'cash'

                    var restrictions = '';

                    if (service.cash === 'n') {
                        restrictions += 'cash';
                    }

                    if (index === 0) {
                        checkedStatus = true;
                    }

                    var serviceItem = tcart_newDelivery.createRadio(
                        title,
                        description,
                        serviceMinimumPrice,
                        service.type,
                        null,
                        service.id,
                        index,
                        service.staticPrice || service.minimumPrice,
                        serviceHint,
                        service.hash,
                        restrictions,
                        checkedStatus,
                        freeDeliveryThreshold
                    );
                    document.getElementById('delivery-services-wrapper').appendChild(serviceItem);
                });

                tcart__updateDelivery();
                tcart_newDelivery.changeDeliveryTypeListener();

                var triggerChangeEvent;
                if (/msie|trident/.test(navigator.userAgent)) {
                    triggerChangeEvent = document.createEvent('Event');
                    triggerChangeEvent.initEvent('change', true, false);
                } else {
                    triggerChangeEvent = new Event('change');
                }
                var el = document.getElementById('delivery-services-wrapper').querySelector('input[name="tildadelivery-type"]:checked');
                el.dispatchEvent(triggerChangeEvent);

                var cartContent = document.querySelectorAll('.t706 .t706__cartwin-products, .t706 .t706__orderform');
                Array.prototype.forEach.call(cartContent, function (el) {
                    el.style.pointerEvents = '';

                });
                tcart__showDeliveryPrice();
            },
            function () {
                that.deliveryState.badResponseCounters.services++;
                if (that.deliveryState.badResponseCounters.services < 5) {
                    setTimeout(function () {
                        that.renderServices(postalCode);
                    }, 1000);
                } else {
                    tcart__preloader.hide();
                    that.showUnavailableMessage(deliveryWrapper);
                }
            }
        );
    },

    getCityFromGeo: function (projectId, onload, onerror) {
        var dataObj = {
            projectId: projectId,
        };

        if (!window.dev) {
            var tCityFromGeo = sessionStorage.getItem('tCityFromGeo');
            if (tCityFromGeo !== null) {
                try {
                    onload(JSON.parse(tCityFromGeo));
                    return;
                } catch (e) { /**/ }
            }
        }

        var tildaProjectLang = document.getElementById('allrecords').getAttribute('data-tilda-project-lang');
        if (tildaProjectLang) {
            dataObj.lang = tildaProjectLang;
        }

        dataObj = JSON.stringify(dataObj);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                if (!window.dev) {
                    sessionStorage.setItem('tCityFromGeo', xhr.responseText);
                }
                onload(JSON.parse(xhr.responseText));
            }
        };
        xhr.onerror = onerror;
        xhr.open('POST', 'https://geoserv.tildacdn.com/api/detect-city/');
        xhr.timeout = 30000;
        xhr.send(dataObj);
    },

    getPayTypes: function () {
        var paytypes = document.getElementById('customdelivery').getAttribute('data-paytypes');
        if (paytypes) {
            try {
                paytypes = JSON.parse(paytypes);
            } catch (error) { /**/ }
        }

        if (!paytypes || (typeof paytypes != 'object' && typeof paytypes != 'function')) {
            paytypes = {};

            var paymentsystem = document.querySelectorAll('.t706 input[name=paymentsystem]');
            Array.prototype.forEach.call(paymentsystem, function (el) {
                if (el.value === 'cash') {
                    paytypes.cash = 'y';
                } else if (el.value === 'banktransfer') {
                    paytypes.banktransfer = 'y';
                } else {
                    paytypes.card = 'y';
                }
            });

            if (!paytypes.card && !paytypes.cash && !paytypes.banktransfer) {
                var paytype = document.querySelector('.t706').getAttribute('data-payment-system');
                if (paytype == 'cash') {
                    paytypes.cash = 'y';
                } else if (paytype == 'banktransfer') {
                    paytypes.banktransfer = 'y';
                } else if (paytype && paytype != '' && paytype != 'none') {
                    paytypes.card = 'y';
                } else {
                    paytypes.none = 'y';
                }
            }

            document.getElementById('customdelivery').setAttribute('data-paytypes', JSON.stringify(paytypes));
        }

        return paytypes;
    },

    /**
     * Getting a list of services available to work with the postal codes
     *
     * @param {string} projectId project id
     * @param {string} postalCode postal code
     * @param {string} currencyCode currency code
     * @param {Function} onload callback function on success
     * @param {Function} [onerror] callback function on fail
     */
    getServices: function (projectId, postalCode, currencyCode, onload, onerror) {
        this.updateTotal();

        var cartAmount = window.tcart.prodamount || 0;
        if (window.tcart.prodamount_withdiscount || window.tcart.prodamount_withdiscount === 0) {
            cartAmount = window.tcart.prodamount_withdiscount;
        }
        var products = this.removeEmptyOrDeletedProducts();

        var itemsCount = window.tcart.total || 0;
        if (itemsCount === undefined || itemsCount < 1) {
            onload({
                error: new Error(window.tildaBrowserLang === 'RU' ? 'добавьте в корзину хотя бы один товар' : 'add at least one product')
            });
        }

        tcart__preloader.show(document.getElementById('delivery-services-wrapper'), t_delivery_dict('loadingServices'));
        tcart__hideDeliveryPrice();

        var dataObj = {
            action: 'list',
            projectId: projectId,
            postalCode: postalCode || 0,
            currency: currencyCode,
            itemsCount: itemsCount,
            cartAmount: cartAmount,
            geoData: this.deliveryState.geoData || {},
            products: products,
            paytypes: this.getPayTypes(),
        };

        var tildaProjectLang = document.getElementById('allrecords').getAttribute('data-tilda-project-lang');
        if (tildaProjectLang) {
            dataObj.lang = tildaProjectLang;
        }

        dataObj = JSON.stringify(dataObj);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            tcart__preloader.hide();
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                onload(JSON.parse(xhr.responseText));
            }
        };
        if (onerror) {
            xhr.onerror = onerror;
        }
        xhr.open('POST', 'https://delivery.tildacdn.com/cart-api/');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        xhr.timeout = 30000;
        xhr.send(dataObj);
    },

    /**
     * Getting a pickup list
     *
     * @param {object} params A set of parameters used to getting the pickup list
     * @param {string} params.projectId project id
     * @param {string} params.postalCode postal code
     * @param {string} params.deliveryId delivery id
     * @param {string} [params.pattern] pattern
     * @param {Function} params.onload callback function on success
     */
    getPickupList: function (params) {
        var submitButton = document.querySelector('.t706 .t-form__submit button');
        if (submitButton) {
            submitButton.classList.add('t706__submit_disable');
            submitButton.setAttribute('disabled', 'disabled');
        }

        this.updateTotal();

        var cartAmount = window.tcart.prodamount || 0;
        if (window.tcart.prodamount_withdiscount || window.tcart.prodamount_withdiscount === 0) {
            cartAmount = window.tcart.prodamount_withdiscount;
        }
        var products = this.removeEmptyOrDeletedProducts();

        var itemsCount = window.tcart.total || 0;
        if (itemsCount === undefined || itemsCount < 1) {
            onload({
                error: new Error(window.tildaBrowserLang === 'RU' ? 'добавьте в корзину хотя бы один товар' : 'add at least one product')
            });
        }

        var dataObj = {
            action: 'pickup-list',
            projectId: params.projectId,
            postalCode: params.postalCode || 0,
            deliveryId: params.deliveryId,
            pattern: params.pattern,
            itemsCount: itemsCount,
            cartAmount: cartAmount,
            geoData: this.deliveryState.geoData || {},
            products: products,
            paytypes: this.getPayTypes(),
        };

        var tildaProjectLang = document.getElementById('allrecords').getAttribute('data-tilda-project-lang');
        if (tildaProjectLang) {
            dataObj.lang = tildaProjectLang;
        }

        dataObj = JSON.stringify(dataObj);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                params.onload(JSON.parse(xhr.responseText));
            }

            if (submitButton) {
                submitButton.classList.remove('t706__submit_disable');
                submitButton.removeAttribute('disabled');
            }
        };
        xhr.open('POST', 'https://delivery.tildacdn.com/cart-api/');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
        xhr.timeout = 30000;
        xhr.send(dataObj);
    },

    /**
     * Getting a delivery price
     *
     * @param {object} params A set of parameters used to calculate the delivery price
     * @param {string} params.projectId project id
     * @param {string} params.postalCode postal code
     * @param {string} params.serviceId service id
     * @param {string} [params.pickupPointId] pickup point id
     * @param {Function} params.onload callback function on success
     * @param {Function} params.onerror callback function on fail
     */
    getDeliveryPrice: function (params) {
        tcart__hideDeliveryPrice();
        var submitButton = document.querySelector('.t706 .t-form__submit button');
        if (submitButton) {
            submitButton.classList.add('t706__submit_disable');
            submitButton.setAttribute('disabled', 'disabled');
        }

        this.updateTotal();

        var itemsCount = window.tcart.total || 0;
        if (itemsCount === undefined || itemsCount < 1) {
            onload({
                error: new Error(window.tildaBrowserLang === 'RU' ? 'добавьте в корзину хотя бы один товар' : 'add at least one product')
            });
        }

        var cartAmount = window.tcart.prodamount || 0;
        if (window.tcart.prodamount_withdiscount || window.tcart.prodamount_withdiscount === 0) {
            cartAmount = window.tcart.prodamount_withdiscount;
        }
        var products = this.removeEmptyOrDeletedProducts();

        var dataObj = {
            action: 'calculate',
            projectId: params.projectId,
            postalCode: params.postalCode,
            deliveryId: params.serviceId,
            currency: this.deliveryState.currencyCode,
            itemsCount: itemsCount,
            cartAmount: cartAmount,
            pickupPointId: params.pickupPointId,
            products: products,
            guid: this.deliveryState.cityGuid || 0,
        };

        dataObj = JSON.stringify(dataObj);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                params.onload(JSON.parse(xhr.responseText));
            }

            if (submitButton) {
                submitButton.classList.remove('t706__submit_disable');
                submitButton.removeAttribute('disabled');
            }
        };
        xhr.onerror = params.onerror;
        xhr.open('POST', 'https://delivery.tildacdn.com/cart-api/');
        xhr.timeout = 30000;
        xhr.send(dataObj);
    },

    getCityCoordinates: function (mapType, city, onload) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                onload(JSON.parse(xhr.responseText));
            }
        };
        xhr.open('GET', 'https://geocode-maps.yandex.ru/1.x/?apikey=' + this.deliveryState.ymapApiKey + '&format=json&geocode=' + city);
        xhr.timeout = 30000;
        xhr.send();
    },

    getAddresses: function (data, type, onload, onerror) {
        var submitButton = document.querySelector('.t706 .t-form__submit button');
        if (submitButton) {
            submitButton.classList.add('t706__submit_disable');
            submitButton.setAttribute('disabled', 'disabled');
        }

        var that = this;

        if (that.deliveryState.currentRequest) {
            that.deliveryState.currentRequest.abort();
        }

        var apiURL = {
            'street': 'https://geoserv.tildacdn.com/api/address/',
            'city': 'https://geoserv.tildacdn.com/api/city/',
            'pickup': 'https://delivery.tildacdn.com/cart-api/',
            'house': 'https://geoserv.tildacdn.com/api/house/',
        };

        var pattern = '';
        try {
            var json = JSON.parse(data);
            pattern = 't' + type + '_' + json.pattern.toLowerCase();
            if (json.fias !== undefined) {
                pattern += '_' + json.fias;
            }
            if (window.dev === undefined) {
                var tDataFromGeo = sessionStorage.getItem(pattern);
                if (tDataFromGeo !== null) {
                    try {
                        onload(JSON.parse(tDataFromGeo));
                        return;
                    } catch (e) { /**/ }
                }
            }
        } catch (e) { /**/ }

        var tildaProjectLang = document.getElementById('allrecords').getAttribute('data-tilda-project-lang');
        if (tildaProjectLang) {
            try {
                var json = JSON.parse(data);
                json.lang = tildaProjectLang;
                data = JSON.stringify(json);
            } catch (e) { /**/ }
        }

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE && xhr.status === 200) {
                if (!window.dev) {
                    sessionStorage.setItem(pattern, xhr.responseText);
                }
                onload(JSON.parse(xhr.responseText));
            }

            if (submitButton) {
                submitButton.classList.remove('t706__submit_disable');
                submitButton.removeAttribute('disabled');
            }

            that.deliveryState.currentRequest = null;
        };
        if (typeof onerror === 'function') {
            xhr.onerror = function () {
                onerror();
                that.deliveryState.currentRequest = null;
            };
        }
        if (apiURL[type]) {
            xhr.open('POST', apiURL[type]);
        }
        xhr.timeout = 30000;
        xhr.send(data);
        that.deliveryState.currentRequest = xhr;
    },

    createInput: function (
        inputType,
        label,
        placeholder,
        defaultValue,
        inputId,
        serviceId,
        classes,
        name,
        hidden,
        groupStyle,
        isRequired,
        inputMode,
        tildaRule
    ) {
        label = label || '';
        placeholder = placeholder || '';
        inputId = inputId || '';
        serviceId = serviceId || '';
        inputType = inputType || '';
        inputMode = inputMode || '';
        defaultValue = defaultValue || '';
        tildaRule = tildaRule || '';

        isRequired = isRequired ? 1 : 0;
        classes = classes + ' t-input' || 't-input';

        var div = document.createElement('div');
        div.classList.add('t-input-group');
        div.classList.add('t-input-group_in');
        if (groupStyle) {
            div.style.cssText = groupStyle;
        }
        if (hidden) {
            div.setAttribute('hidden', '');
        }
        div.setAttribute('data-input-lid', '');

        var title = document.createElement('div');
        title.classList.add('t-input-title');
        title.classList.add('t-descr');
        title.classList.add('t-descr_md');
        title.setAttribute('data-redactor-toolbar', 'no');
        title.setAttribute('field', '');
        title.appendChild(document.createTextNode(label));
        div.appendChild(title);

        var inputWrapper = document.createElement('div');
        inputWrapper.classList.add('t-input-block');

        var input = document.createElement('input');
        classes.split(' ').forEach(function (className) {
            if (className !== '') {
                input.classList.add(className);
            }
        });
        if (tildaRule) {
            input.setAttribute('data-tilda-rule', tildaRule);
        }
        if (inputMode) {
            input.setAttribute('inputmode', inputMode);
        }
        if (inputType) {
            input.setAttribute('type', inputType);
        }
        input.setAttribute('data-service-id', serviceId);
        input.name = name.toLowerCase();
        input.value = defaultValue;
        input.placeholder = placeholder;
        input.autocomplete = navigator.userAgent.search(/Chrome/) !== -1 ? 'no' : 'off';
        input.setAttribute('data-tilda-req', isRequired);
        input.dataset.tildaReq = isRequired;
        inputWrapper.appendChild(input);

        if (inputType !== 'hidden') {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 88 88');
            svg.classList.add('t706__search-icon');
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M85 31.1c-.5-8.7-4.4-16.6-10.9-22.3C67.6 3 59.3 0 50.6.6c-8.7.5-16.7 4.4-22.5 11-11.2 12.7-10.7 31.7.6 43.9l-5.3 6.1-2.5-2.2-17.8 20 9 8.1 17.8-20.2-2.1-1.8 5.3-6.1c5.8 4.2 12.6 6.3 19.3 6.3 9 0 18-3.7 24.4-10.9 5.9-6.6 8.8-15 8.2-23.7zM72.4 50.8c-9.7 10.9-26.5 11.9-37.6 2.3-10.9-9.8-11.9-26.6-2.3-37.6 4.7-5.4 11.3-8.5 18.4-8.9h1.6c6.5 0 12.7 2.4 17.6 6.8 5.3 4.7 8.5 11.1 8.9 18.2.5 7-1.9 13.8-6.6 19.2z');
            path.setAttribute('fill', '#3f3f3f');
            svg.appendChild(path);
            inputWrapper.appendChild(svg);

            var inputClear = document.createElement('div');
            inputClear.classList.add('t-input-clear');
            inputWrapper.appendChild(inputClear);
        }

        var inputDescription = document.createElement('div');
        inputDescription.classList.add('t-input-description');
        inputDescription.classList.add('t-text');
        inputDescription.classList.add('t-text_xs');
        inputDescription.style.cssText = 'color: #505050; margin: 5px 0 0;';
        inputWrapper.appendChild(inputDescription);

        var inputError = document.createElement('div');
        inputError.classList.add('t-input-error');
        inputWrapper.appendChild(inputError);

        div.appendChild(inputWrapper);

        return div;
    },

    createRadio: function (
        title,
        description,
        minimumPrice,
        deliveryType,
        classes,
        serviceId,
        index,
        staticPrice,
        hint,
        hash,
        restrictions,
        checkedStatus,
        freeDeliveryThreshold
    ) {
        title = title || '';
        description = description || '';
        minimumPrice = minimumPrice || '';
        hint = hint || '';
        hash = hash || '';
        restrictions = restrictions || '';
        freeDeliveryThreshold = freeDeliveryThreshold || '';
        classes = classes || '';
        classes += ' t-radio__control t-text t-text_xs';

        var label = document.createElement('label');
        label.setAttribute('data-service-id', serviceId);
        classes.split(' ').forEach(function (className) {
            if (className !== '') {
                label.classList.add(className);
            }
        });

        var input = document.createElement('input');
        if (checkedStatus) {
            input.checked = true;
        }
        input.setAttribute('data-delivery-price', '');
        if (restrictions) {
            input.setAttribute('data-restrictions', restrictions);
        }
        if (freeDeliveryThreshold) {
            input.setAttribute('data-free-delivery-threshold', freeDeliveryThreshold);
        }
        if (hash) {
            input.setAttribute('data-hash-value', hash);
        }
        if (staticPrice) {
            input.setAttribute('data-delivery-price', staticPrice);
            input.setAttribute('data-static-price', staticPrice);
        }
        input.setAttribute('data-service-id', serviceId);
        input.setAttribute('data-delivery-type', deliveryType);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'tildadelivery-type');
        input.classList.add('t-radio');
        input.classList.add('t-radio_delivery');
        input.classList.add('js-tilda-rule');
        input.setAttribute('data-tilda-req', 1);
        input.dataset.tildaReq = 1;
        input.setAttribute('value', title);
        if (hint) {
            input.setAttribute('data-hint-text', hint);
        }
        label.appendChild(input);

        var radioIndicator = document.createElement('div');
        radioIndicator.classList.add('t-radio__indicator');
        radioIndicator.style.cssText = 'border-color: #000;';
        label.appendChild(radioIndicator);

        var spanValue = document.createElement('span');
        spanValue.classList.add('delivery-checkbox-label');
        spanValue.appendChild(document.createTextNode(title));
        label.appendChild(spanValue);

        var spanDescr = document.createElement('span');
        spanDescr.classList.add('delivery-minimum');
        spanDescr.appendChild(document.createTextNode(description));
        label.appendChild(spanDescr);

        return label;
    },

    createTitle: function (label, classes) {
        label = label || '';
        classes = classes || '';

        var div = document.createElement('div');
        div.style.margin = '20px 0';
        div.classList.add('t-name');
        div.classList.add('t-name_md');
        classes.split(' ').forEach(function (className) {
            if (className !== '') {
                div.classList.add(className);
            }
        });
        div.appendChild(document.createTextNode(label));

        return div;
    },

    createSelect: function (label, classes, options, pickupServiceId, name) {
        label = label || '';
        classes = classes || '';
        name = name || '';

        var str = '';

        str += '<label class="t-input-title t-descr t-descr_md">Пункт выдачи</label>';
        str += '<div class="ss-select delivery-pickup-select">';
        str += '<select class="ss-input ss-select delivery-select" data-service-id="' + pickupServiceId + '" name="' + name + '">';
        str += '<option data-point-id="">Не выбран</option>';

        options.forEach(function (option) {
            str += '<option data-point-id=' + option.id + '>' + option.address + '</option>';
        });

        str += '</select>';
        str += '</div>';

        return str;
    },

    changeDeliveryTypeListener: function () {
        var that = this;

        var inputs = document.querySelectorAll('.t706 input[data-delivery-type]');
        Array.prototype.forEach.call(inputs, function (el) {
            el.addEventListener('change', function () {
                var serviceUid = parseInt(this.getAttribute('data-service-id'), 10) || 0;
                var freeDeliveryThreshold = parseInt(this.getAttribute('data-free-delivery-threshold'), 10);

                if (freeDeliveryThreshold) {
                    that.deliveryState.freeDeliveryThreshold = freeDeliveryThreshold;
                } else {
                    that.deliveryState.freeDeliveryThreshold = 0;
                }
                that.deliveryState.activeServiceUid = serviceUid;

                tcart__errorHandler.hide();
                that.renderAddressFields(this);
                if (this.dataset.hashValue) {
                    that.setHashInput(this.dataset.hashValue);
                }
                // cashrule
                that.hidePaymentMethod(this);

                var inputsNeedUpdatePrice = document.querySelectorAll('.t706 input[data-delivery-type]');
                Array.prototype.forEach.call(inputsNeedUpdatePrice, function (el) {
                    var price = el.getAttribute('data-static-price');
                    if (price > 0) {
                        el.setAttribute('data-delivery-price', price);
                    } else {
                        el.setAttribute('data-delivery-price', '');
                    }
                });

                that.hints.deleteAll();
                that.deliveryState.fullNames.pickup = null;
                that.deliveryState.fullNames.street = null;
                that.deliveryState.fullNames.house = null;

                if (that.deliveryState.searchboxes['pickup-searchbox']) {
                    that.deliveryState.searchboxes['pickup-searchbox'] = null;
                }

                if (this.getAttribute('data-hint-text')) {
                    that.hints.render(this.getAttribute('data-hint-text'));
                }

                tcart__updateDelivery();
            }, false);
        });
    },

    hidePaymentMethod: function (control) {
        var cashControl = document.querySelector('.t706 [data-payment-variant-system="cash"]');
        if (!cashControl) return;
        var cashControlParent = cashControl.parentNode;
        var paymentWrapper = cashControlParent.closest('.t-radio__wrapper-payment');
        var firstControl = paymentWrapper.querySelector('[data-payment-variant-system]:not([data-payment-variant-system="cash"])');

        // for now its only cash value
        if (control.dataset.restrictions === 'cash' && cashControl.length) {
            cashControlParent.style.display = 'none';
            firstControl.checked = true;
        } else {
            cashControlParent.style.display = '';
        }
    },

    removePriceValueInRadio: function (deliveryServiceId) {
        var radioDeliveryService = document.querySelector('.t706 input.t-radio_delivery[data-service-id="' + deliveryServiceId + '"]');
        if (radioDeliveryService) {
            radioDeliveryService.removeAttribute('data-delivery-price');
            tcart__updateDelivery();
            tcart__hideDeliveryPrice();
        }
    },

    updatePriceValueInRadio: function (priceValue, deliveryServiceId) {
        var radioDeliveryService = document.querySelector('.t706 input.t-radio_delivery[data-service-id="' + deliveryServiceId + '"]');
        if (radioDeliveryService) {
            radioDeliveryService.setAttribute('data-delivery-price', priceValue);
            tcart__updateDelivery();
            tcart__showDeliveryPrice();
        }
    },

    changePickupHandler: function (id, name, postalCode, searchbox, pickupAddress, coordinates) {
        var searchInput = searchbox.querySelector('.searchbox-input');
        var serviceId = searchInput.getAttribute('data-service-id');
        var that = this;

        // for custom pickup point with postalCode equal 0
        postalCode = postalCode || this.deliveryState.city.postalCode;

        searchInput.setAttribute('data-pickup-id', id);
        searchInput.setAttribute('data-pickup-address', pickupAddress);

        searchInput.value = name;

        that.getDeliveryPrice({
            projectId: that.deliveryState.projectId,
            postalCode: postalCode,
            serviceId: serviceId,
            pickupPointId: id,
            onload: function (data) {
                var servicePrice = data.price;

                if (data.error || data.length === 0) {
                    var lang = window.tildaBrowserLang.toLowerCase();
                    var userFriendlyError = data.userFriendlyError ?
                        data.userFriendlyError[lang] ?
                        data.userFriendlyError[lang] :
                        data.userFriendlyError.en :
                        '';

                    if (data.error) {
                        tcart__errorHandler.show(userFriendlyError || data.error);
                    }
                    window.tcart.emptyDeliveryServices = true;
                    tcart__updateDelivery();
                    return;
                }

                window.tcart.emptyDeliveryServices = false;
                tcart__errorHandler.hide();

                if (data.hash !== undefined) {
                    that.setHashInput(data.hash);
                }

                if (!id) {
                    servicePrice = 0;
                }

                that.updatePriceValueInRadio(servicePrice, serviceId);
                that.setFullAddress(that.getFullAddress());

            },
            onerror: function () {
                var error = '';
                if (window.browserLang === 'RU') {
                    error = 'Невозможно получить почтовый индекс для доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get a pickup" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                } else {
                    error = 'Unable to get a postal code for delivery. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get a pickup" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                }

                tcart__errorHandler.show('Request failed: ' + error);
                window.tcart.emptyDeliveryServices = true;
                tcart__updateDelivery();
                return;
            }
        });

        var isCoordinatesEmpty;

        if (coordinates) {
            isCoordinatesEmpty = coordinates[0] == 0 && coordinates[1] == 0;
        }

        if (coordinates && window.deliveryMap && !isCoordinatesEmpty) {
            window.deliveryMap.setCenter(coordinates, 16);
        }
    },

    renderAddressFields: function (element) {
        this.disableChoseServiceControls();
        var that = this;
        var wrapper = document.getElementById('customdelivery');
        var deliveryServiceId = element.getAttribute('data-service-id');

        var addressesWrapper = document.getElementById('addresses-wrapper');
        if (addressesWrapper && addressesWrapper.parentNode) {
            addressesWrapper.parentNode.removeChild(addressesWrapper);
        }

        wrapper.setAttribute('data-service-id', deliveryServiceId);
        var deliveryAddressesWrapper = document.createElement('div');
        deliveryAddressesWrapper.id = 'addresses-wrapper';
        wrapper.appendChild(deliveryAddressesWrapper);

        var deliveryType = element.getAttribute('data-delivery-type');
        var searchInput = document.querySelector('.t706 #city-searchbox input');

        switch (deliveryType) {
            case 'pickup':
                tcart__preloader.show(document.getElementById('addresses-wrapper'), t_delivery_dict('loadingPickup'));
                window.tcart.emptyDeliveryServices = false;
                var restrictions = '';
                var radioDeliveryService = document.querySelector('.t706 input.t-radio_delivery[data-service-id="' + deliveryServiceId + '"]');
                if (radioDeliveryService) {
                    restrictions = radioDeliveryService.getAttribute('data-restrictions') || '';
                }

                that.getPickupList({
                    projectId: that.deliveryState.projectId,
                    postalCode: that.deliveryState.city.postalCode,
                    deliveryId: deliveryServiceId,
                    onload: function (data) {
                        if (data.error) {
                            var lang = window.tildaBrowserLang.toLowerCase();
                            var userFriendlyError = data.userFriendlyError ?
                                data.userFriendlyError[lang] ?
                                data.userFriendlyError[lang] :
                                data.userFriendlyError.en :
                                '';
                            tcart__errorHandler.show(userFriendlyError || data.error);
                            window.tcart.emptyDeliveryServices = true;
                            tcart__preloader.hide();
                            that.enableChoseServiceControls();
                            searchInput.classList.remove('load');
                            searchInput.readOnly = false;
                            tcart__updateDelivery();
                            return;
                        }

                        tcart__preloader.hide();

                        data = data.map(function (item) {
                            if (restrictions === 'cash') {
                                item.cash = 'n';
                            }
                            return item;
                        });

                        var pickupInput = that.createInput(
                            '',
                            t_delivery_dict('pickup'),
                            t_delivery_dict('selectPickup'),
                            null,
                            null,
                            deliveryServiceId,
                            'searchbox-input js-tilda-rule',
                            'tildadelivery-pickup-name',
                            null,
                            null,
                            true,
                            null,
                            'chosevalue'
                        );
                        var searchBox = that.createSearchbox(pickupInput, 'pickup-searchbox');
                        document.getElementById('addresses-wrapper').appendChild(searchBox);

                        that.deliveryState.searchboxes['pickup-searchbox'] = {};
                        that.deliveryState.searchboxes['pickup-searchbox'].autocompleteAddress = data;
                        that.deliveryState.pickupList = data;

                        if (that.deliveryState.ymapApiKey) {
                            that.mapInit('yandex');
                        }

                        that.searchboxInit('pickup-searchbox', 'pickup', null, data);
                        that.renderUserFields(deliveryAddressesWrapper, deliveryServiceId);
                        that.changeCartInputsHandler();

                        var searchboxNode = document.querySelector('.t706 #pickup-searchbox');
                        if (that.deliveryState.ymapApiKey) {
                            that.mapAddPoints('', data, searchboxNode);
                        }

                        that.enableChoseServiceControls();

                        searchInput.classList.remove('load');
                        searchInput.readOnly = false;
                    }
                });
                break;

            case 'delivery':
                window.tcart.emptyDeliveryServices = false;
                that.renderUserFields(deliveryAddressesWrapper, deliveryServiceId);
                that.changeCartInputsHandler();
                that.enableChoseServiceControls();
                searchInput.classList.remove('load');
                searchInput.readOnly = false;
                break;

            default:
                break;
        }
    },

    clearHouseInput: function () {
        var house = document.querySelector('.t706 #customdelivery [name="tildadelivery-house"]');
        if (house) {
            house.value = '';
        }
    },

    renderUserFields: function (wrapper, deliveryServiceId) {
        var fields = this.deliveryState.services[deliveryServiceId].fields;
        var smallSizeFieldsCount = 0;

        for (var k in fields) {
            switch (k) {
                case 'street':
                    break;
                case 'comment':
                    break;
                case 'userInitials':
                    break;
                default:
                    smallSizeFieldsCount++;
                    break;
            }
        }

        var counter = 0;
        for (var fieldKey in fields) {
            var autocomplete = fields[fieldKey].autocomplete;
            var inputLabel = '';
            var inputGroupStyle = '';
            var inputType = '';
            var inputMode = '';
            var inputPlaceholder = '';
            var inputRequired = true;

            switch (fieldKey) {
                case 'street':
                    inputLabel = t_delivery_dict('street');
                    inputGroupStyle = 'width: 100%';
                    break;
                case 'house':
                    counter++;
                    inputLabel = t_delivery_dict('house');
                    break;
                case 'entrance':
                    counter++;
                    inputLabel = t_delivery_dict('entrance');
                    inputType = 'number';
                    inputMode = 'numeric';
                    inputRequired = false;
                    break;
                case 'floor':
                    counter++;
                    inputLabel = t_delivery_dict('floor');
                    inputType = 'number';
                    inputMode = 'numeric';
                    inputRequired = false;
                    break;
                case 'aptOffice':
                    counter++;
                    inputLabel = t_delivery_dict('apt');
                    inputRequired = false;
                    break;
                case 'phone':
                    counter++;
                    inputLabel = t_delivery_dict('phone');
                    inputType = 'number';
                    inputMode = 'numeric';
                    break;
                case 'entranceCode':
                    counter++;
                    inputLabel = t_delivery_dict('entranceCode');
                    inputRequired = false;
                    break;
                case 'comment':
                    inputLabel = t_delivery_dict('comment');
                    inputGroupStyle = 'width: 100%';
                    inputRequired = false;
                    inputPlaceholder = t_delivery_dict('orderComment');
                    break;
                case 'oneLineAddress':
                    counter++;
                    inputLabel = t_delivery_dict('address');
                    break;
                case 'userInitials':
                    inputGroupStyle = 'width: 100%';
                    inputLabel = t_delivery_dict('fullName');
                    inputPlaceholder = t_delivery_dict('johnDoe');
                    break;

                default:
                    break;
            }

            if (smallSizeFieldsCount === counter && smallSizeFieldsCount % 2 !== 0) {
                inputGroupStyle = 'width: 100%';
            }

            inputLabel = inputLabel || '';
            var inputName = 'tildadelivery-' + fieldKey;
            var tildaRule = '';

            if (autocomplete) {
                tildaRule = 'chosevalue';

                if (fieldKey === 'house') {
                    tildaRule = '';
                }

                var inputWithAutocomplete = tcart_newDelivery.createInput(
                    inputType,
                    inputLabel,
                    inputPlaceholder,
                    '',
                    '',
                    deliveryServiceId,
                    'searchbox-input js-tilda-rule',
                    inputName,
                    false,
                    inputGroupStyle,
                    inputRequired,
                    inputMode,
                    tildaRule
                );
                var searchboxId = fieldKey + '-searchbox';
                var searchbox = this.createSearchbox(inputWithAutocomplete, searchboxId);

                wrapper.appendChild(searchbox);

                this.searchboxInit(searchboxId, fieldKey);
            } else {
                if (fieldKey === 'userInitials') {
                    tildaRule = 'name';
                }

                var input = tcart_newDelivery.createInput(
                    inputType,
                    inputLabel,
                    inputPlaceholder,
                    '',
                    '',
                    deliveryServiceId,
                    'js-tilda-rule',
                    inputName,
                    false,
                    inputGroupStyle,
                    inputRequired,
                    inputMode,
                    tildaRule
                );

                wrapper.appendChild(input);
            }
        }

        this.restoreTcartDelivery();
    },

    hints: {
        render: function (hintText) {
            var deliveryServicesWrapper = document.getElementById('delivery-services-wrapper');
            var hintElem = document.createElement('div');
            var classes = 'delivery-hint t-text t-text_xs';
            classes.split(' ').forEach(function (className) {
                hintElem.classList.add(className);
            });
            hintElem.setAttribute('id', 'delivery-hint');
            hintElem.appendChild(document.createTextNode(hintText));

            deliveryServicesWrapper.insertAdjacentElement('afterend', hintElem);
        },

        deleteAll: function () {
            var deliveryHint = document.querySelector('.t706 .delivery-hint');
            if (deliveryHint && deliveryHint.parentNode) {
                deliveryHint.parentNode.removeChild(deliveryHint);
            }
        },
    },

    // geoserv temporarily unavailable
    showUnavailableMessage: function (deliveryWrapper) {
        var cityInput = tcart_newDelivery.createInput(
            'hidden',
            '',
            '',
            'nodelivery',
            null,
            null,
            'js-tilda-rule',
            'delivery-badresponse-comment',
            null,
            null,
            true,
            '',
            'deliveryreq'
        );

        if (window.tcart) {
            window.tcart.system = 'none';
        }

        var message = document.createElement('div');
        message.style.cssText = 'margin: 20px 0; line-height: 22px; color: red;';
        message.classList.add('t-text');
        message.appendChild(document.createTextNode(t_delivery_dict('unavailable')));

        deliveryWrapper.appendChild(message);
        deliveryWrapper.appendChild(cityInput);
    },

    updateTotal: function () {
        // update total before uses
        if ((window.tcart.products === undefined || window.tcart.products.length === 0) && window.tcart__syncProductsObject__LStoObj !== undefined && window.tcart__updateTotalProductsinCartObj !== undefined) {
            tcart__syncProductsObject__LStoObj();
            tcart__updateTotalProductsinCartObj();
        }
    },

    /**
     * Return window.tcart.products without empty or deleted products
     *
     * @returns {Array} products without empty or deleted
     */
    removeEmptyOrDeletedProducts: function () {
        var products = [];

        window.tcart.products.forEach(function (product) {
            if (JSON.stringify(product) !== '{}' && product.deleted !== 'yes') {
                products.push(product);
            }
        });

        return products;
    },

    updateProjectId: function () {
        var that = this;
        var itemsWithProjectId = [document.getElementById('allrecords'), document.getElementById('t-header'), document.getElementById('t-footer')];

        Array.prototype.forEach.call(itemsWithProjectId, function (el) {
            if (el && !parseInt(that.deliveryState.projectId, 10)) {
                that.deliveryState.projectId = parseInt(el.getAttribute('data-tilda-project-id'), 10);
            }
        });

        var el = document.getElementById('tildacopy');
        if (el && !parseInt(that.deliveryState.projectId, 10)) {
            that.deliveryState.projectId = parseInt((el.getAttribute('data-tilda-sign') || '').split('#')[0], 10);
        }
    },
};

var tcart__errorHandler = {
    show: function (error) {
        var all = document.querySelector('.t706 .js-errorbox-all');
        var string = document.querySelector('.t706 .t-form__errorbox-item.js-rule-error-string');

        if (error) {
            Array.prototype.forEach.call(string, function (el) {
                if (el) {
                    el.innerHTML = error;
                }
            });
        }

        if (string.textContent !== '') {
            Array.prototype.forEach.call(all, function (el) {
                if (el) {
                    el.style.display = '';
                }
            });

            Array.prototype.forEach.call(string, function (el) {
                if (el) {
                    el.style.display = '';
                }
            });
        }
    },
    hide: function () {
        var all = document.querySelector('.t706 .js-errorbox-all');
        var string = document.querySelector('.t706 .t-form__errorbox-item.js-rule-error-string');

        Array.prototype.forEach.call(all, function (el) {
            if (el) {
                el.style.display = 'none';
            }
        });

        Array.prototype.forEach.call(string, function (el) {
            if (el) {
                el.style.display = 'none';
            }
        });
    },
};

var tcart__inputErrorHandler = {
    show: function (input, errorText) {
        var inputWrapper = input.closest('.t-input-group');
        if (inputWrapper) {
            var inputError = inputWrapper.querySelector('.t-input-error');
            inputError.textContent = errorText;
            inputWrapper.classList.add('js-error-control-box');
        }
    },
    hide: function (input) {
        var inputWrapper = input.closest('.t-input-group');
        if (inputWrapper) {
            var inputError = inputWrapper.querySelector('.t-input-error');
            inputError.textContent = '';
            inputWrapper.classList.remove('js-error-control-box');
        }
    },
};

/**
 * Hides total amount and full address
 */
function tcart__hideDeliveryPrice() {
    var totalamount = document.querySelector('.t706 .t706__cartwin-totalamount-info');
    if (totalamount) {
        totalamount.style.opacity = 0;
    }

    var fullAddress = document.querySelector('.t706 .delivery-full-address');
    if (fullAddress) {
        fullAddress.style.opacity = 0;
    }
}

/**
 * Shows total amount and full address
 */
function tcart__showDeliveryPrice() {
    var totalamount = document.querySelector('.t706 .t706__cartwin-totalamount-info');
    if (totalamount) {
        totalamount.style.opacity = 1;
    }

    var fullAddress = document.querySelector('.t706 .delivery-full-address');
    if (fullAddress) {
        fullAddress.style.opacity = 1;
    }
}

var tcart__preloader = {
    show: function (elementForBefore, loadMessage) {
        if (!elementForBefore) {
            return;
        }

        var customdelivery = document.getElementById('customdelivery');
        if (customdelivery && !customdelivery.querySelector('.tcart__preloader')) {
            var loader = document.createElement('div');
            loader.classList.add('tcart__preloader');
            loader.style.cssText = 'margin: 20px 0;';

            if (loadMessage) {
                var text = document.createElement('div');
                text.classList.add('t-text');
                loader.style.cssText = 'text-align: center; opacity: .5; font-size: 15px;';
                text.appendChild(document.createTextNode(loadMessage));
                loader.appendChild(text);
            }

            var animatedLoader = document.createElement('div');
            animatedLoader.classList.add('lds-ellipsis');
            animatedLoader.appendChild(document.createElement('div'));
            animatedLoader.appendChild(document.createElement('div'));
            animatedLoader.appendChild(document.createElement('div'));
            animatedLoader.appendChild(document.createElement('div'));

            loader.appendChild(animatedLoader);

            elementForBefore.insertAdjacentElement('beforebegin', loader);
        }
    },
    hide: function () {
        var preloader = document.querySelector('.t706 .tcart__preloader');
        if (preloader && preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
        }
    },
};

/**
 * Called only in tilda-cart
 *
 */
// eslint-disable-next-line no-unused-vars
function tcart__rerenderDeliveryServices() {
    clearTimeout(window.rerenderTimer);
    window.rerenderTimer = setTimeout(function () {
        var cartContent = document.querySelectorAll('.t706 .t706__cartwin-products, .t706 .t706__orderform');
        Array.prototype.forEach.call(cartContent, function (el) {
            el.style.pointerEvents = 'none';
        });
        var needRender = false;
        var deliveryState = tcart_newDelivery.deliveryState;
        var deliveryServices = deliveryState.services;
        var activeServiceUid = deliveryState.activeServiceUid;
        var that = tcart_newDelivery;

        if (!activeServiceUid) {
            Array.prototype.forEach.call(cartContent, function (el) {
                el.style.pointerEvents = '';
            });
            return;
        }

        var serviceUidsFromCard = [];
        var serviceUidsFromServer = [];

        Object.keys(deliveryServices).forEach(function (key) {
            serviceUidsFromCard.push(parseInt(key, 10));
        });

        that.updateProjectId();

        if (!parseInt(deliveryState.projectId, 10)) {
            var error = '';
            if (window.browserLang === 'RU') {
                error = 'Невозможно получить сервисы доставок. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get delivery services" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
            } else {
                error = 'Unable to get a delivery services. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get delivery services" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
            }

            tcart__errorHandler.show(error);
            window.tcart.emptyDeliveryServices = true;
            tcart__updateDelivery();
            return;
        }

        tcart_newDelivery.getServices(deliveryState.projectId, deliveryState.cityPostalCode, deliveryState.currencyCode,
            function (data) {
                if (Array.isArray(data)) {
                    data.forEach(function (serviceFromServer) {
                        serviceUidsFromServer.push(serviceFromServer.id);
                    });
                }

                serviceUidsFromCard.sort(function (a, b) {
                    return a - b;
                });

                serviceUidsFromServer.sort(function (a, b) {
                    return a - b;
                });

                needRender = JSON.stringify(serviceUidsFromServer) !== JSON.stringify(serviceUidsFromCard) && serviceUidsFromServer.indexOf(activeServiceUid) === -1;

                if (needRender) {
                    tcart_newDelivery.renderServices(deliveryState.postalCode);
                    var cartContent = document.querySelectorAll('.t706 .t706__cartwin-products, .t706 .t706__orderform');
                    Array.prototype.forEach.call(cartContent, function (el) {
                        el.style.pointerEvents = '';
                    });
                } else {
                    var radioControls = document.querySelectorAll('.t706 #delivery-services-wrapper .t-radio__control');
                    Array.prototype.forEach.call(radioControls, function (radio) {
                        if (radio && radio.parentNode) {
                            radio.parentNode.removeChild(radio);
                        }
                    });

                    if (Array.isArray(data)) {
                        data.forEach(function (service, index) {
                            if (service.currency && service.currency !== that.deliveryState.currencyCode) {
                                // eslint-disable-next-line no-console
                                console.error(service.title + ': wrong delivery currency (' + service.currency + ')');
                                return;
                            }
                            that.deliveryState.services[service.id] = {};
                            that.deliveryState.services[service.id].fields = service.fields;
                            that.deliveryState.services[service.id].strongAddress = service.strongAddress;

                            var serviceHint = service.hint || '';
                            var label = service.title || '';
                            var serviceMinimumPrice = service.minimumPrice || '';
                            var description;
                            var freeDeliveryThreshold = service.freeDeliveryThreshold || '';

                            var dayString = that.declensionOfNumber(service.minimumDeliverTime);
                            if (service.staticPrice && service.minimumDeliverTime) {
                                description =
                                    t_delivery_dict('from') + ' ' + service.minimumDeliverTime + ' ' + dayString + ', ' + tcart__showPrice(service.staticPrice);
                            } else if (service.staticPrice) {
                                description = tcart__showPrice(service.staticPrice);
                            } else if (service.minimumDeliverTime && service.minimumPrice) {
                                description =
                                    t_delivery_dict('from') +
                                    ' ' +
                                    service.minimumDeliverTime +
                                    ' ' +
                                    dayString +
                                    ', ' +
                                    t_delivery_dict('from') +
                                    ' ' +
                                    tcart__showPrice(service.minimumPrice);
                            } else if (service.minimumPrice) {
                                description = t_delivery_dict('from') + ' ' + tcart__showPrice(service.minimumPrice);
                            } else if (service.minimumDeliverTime) {
                                description = t_delivery_dict('from') + ' ' + service.minimumDeliverTime + ' ' + dayString;
                            }

                            if (service.type === 'delivery') {
                                serviceMinimumPrice = '';
                            }

                            // rescrictions for hide controls in cart
                            // for example hide payment method 'cash'

                            var restrictions = '';

                            if (service.cash === 'n') {
                                restrictions += 'cash';
                            }

                            var checkedStatus = false;
                            if (service.id === activeServiceUid) {
                                checkedStatus = true;
                            }

                            var serviceItem = tcart_newDelivery.createRadio(
                                label,
                                description,
                                serviceMinimumPrice,
                                service.type,
                                null,
                                service.id,
                                index,
                                service.staticPrice || service.minimumPrice,
                                serviceHint,
                                service.hash,
                                restrictions,
                                checkedStatus,
                                freeDeliveryThreshold
                            );

                            document.getElementById('delivery-services-wrapper').appendChild(serviceItem);
                        });
                    }

                    var postalCode;
                    if (typeof deliveryState.postalCode === 'object') {
                        postalCode = deliveryState.cityPostalCode;
                    } else {
                        postalCode = deliveryState.postalCode;
                    }

                    tcart_newDelivery.getDeliveryPrice({
                        projectId: deliveryState.projectId,
                        postalCode: postalCode,
                        serviceId: activeServiceUid,
                        onload: function (data) {
                            if (data.error) {
                                window.tcart.emptyDeliveryServices = true;
                            } else {
                                window.tcart.emptyDeliveryServices = false;
                                tcart__errorHandler.hide();
                            }

                            if (data.hash !== undefined) {
                                tcart_newDelivery.setHashInput(data.hash);
                            }

                            if (data.price !== undefined) {
                                var servicePrice = data.price;
                                tcart_newDelivery.updatePriceValueInRadio(servicePrice, activeServiceUid);
                            }

                            tcart__updateDelivery();
                            tcart_newDelivery.changeDeliveryTypeListener();
                            var cartContent = document.querySelectorAll('.t706 .t706__cartwin-products, .t706 .t706__orderform');
                            Array.prototype.forEach.call(cartContent, function (el) {
                                el.style.pointerEvents = '';
                            });
                            tcart__showDeliveryPrice();
                        },
                        onerror: function () {
                            var error = '';
                            if (window.browserLang === 'RU') {
                                error = 'Невозможно получить почтовый индекс для доставки. Пожалуйста, перезагрузите страницу и попробуйте еще раз. Если ситуация не изменилась, обратитесь в поддержку <a href="mailto:team@tilda.cc?subject=Unable to get active service" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                            } else {
                                error = 'Unable to get a postal code for delivery. Please reload the page and try again. If the situation has not changed, please contact support <a href="mailto:team@tilda.cc?subject=Unable to get active service" style="color:#fff;text-decoration:underline;">team@tilda.cc</a>.';
                            }

                            tcart__errorHandler.show('Request failed: ' + error);
                            window.tcart.emptyDeliveryServices = true;
                            tcart__updateDelivery();
                            return;
                        }
                    });
                }
            });
    }, 500);
}

/**
 * Translation
 *
 * @param {string} msg string that needs translation
 * @returns {string} translation
 */
function t_delivery_dict(msg) {
    var dict = [];

    dict.address = {
        EN: 'Address',
        RU: 'Адрес',
        FR: 'Adresse',
        DE: 'Adresse',
        ES: 'Dirección',
        PT: 'Endereço',
        JA: '住所',
        ZH: '地址',
        UK: 'Адреса',
        PL: 'Adres',
        KK: 'Мекен-жай',
        IT: 'Indirizzo',
        LV: 'Adrese',
    };

    dict.city = {
        EN: 'City',
        RU: 'Город',
        FR: 'Ville',
        DE: 'Stadt',
        ES: 'Ciudad',
        PT: 'Cidade',
        JA: '市',
        ZH: '城市',
        UK: 'Місто',
        PL: 'Miasto',
        KK: 'Қала',
        IT: 'Città',
        LV: 'Pilsēta',
    };

    dict.street = {
        EN: 'Street',
        RU: 'Улица',
        FR: 'Rue',
        DE: 'Straße',
        ES: 'Calle',
        PT: 'Rua',
        JA: '通り',
        ZH: '街道',
        UK: 'Вулиця',
        PL: 'Ulica',
        KK: 'Көше',
        IT: 'Strada',
        LV: 'Iela',
    };

    dict.house = {
        EN: 'House',
        RU: 'Дом',
        FR: 'Loger',
        DE: 'Haus',
        ES: 'Edificio №',
        PT: 'Lar',
        JA: '家',
        ZH: '屋',
        UK: 'Будинок',
        PL: 'Budynek',
        KK: 'Үй',
        IT: 'Casa',
        LV: 'Māja',
    };

    dict.entrance = {
        EN: 'Entrance',
        RU: 'Подъезд',
        FR: 'Entrée',
        DE: 'Eingang',
        ES: 'Entrada',
        PT: 'Entrada',
        JA: 'エントランス',
        ZH: '入口',
        UK: 'Під’їзд',
        PL: 'Wejście',
        KK: 'Кіру',
        IT: 'Ingresso',
        LV: 'Ieeja',
    };

    dict.floor = {
        EN: 'Floor',
        RU: 'Этаж',
        FR: 'Étage',
        DE: 'Fußboden',
        ES: 'Planta',
        PT: 'Andar',
        JA: '床',
        ZH: '地面',
        UK: 'Поверх',
        PL: 'Piętro',
        KK: 'Еден',
        IT: 'Pavimento',
        LV: 'Stāvs',
    };

    dict.apt = {
        EN: 'Apt/office',
        RU: 'Квартира/офис',
        FR: 'Apt/bureau',
        DE: 'Apt/Büro',
        ES: 'Piso/oficina',
        PT: 'Apt/escritório',
        JA: 'アプト/オフィス',
        ZH: '公寓/办公室',
        UK: 'Квартира/офіс',
        PL: 'Mieszkanie/lokal',
        KK: 'Пәтер/кеңсе',
        IT: 'Abitazione/ufficio',
        LV: 'Dzīvoklis/birojs',
    };

    dict.phone = {
        EN: 'Phone',
        RU: 'Телефон',
        FR: 'Téléphoner',
        DE: 'Telefon',
        ES: 'Teléfono',
        PT: 'Telefone',
        JA: '電話',
        ZH: '电话',
        UK: 'Телефон',
        PL: 'Telefon',
        KK: 'Телефон',
        IT: 'Telefono',
        LV: 'Tālrunis',
    };

    dict.phones = {
        EN: 'Phones',
        RU: 'Телефоны',
        FR: 'Téléphones',
        DE: 'Telefone',
        ES: 'Telefonos',
        PT: 'Telefones',
        JA: '電話',
        ZH: '手机',
        UK: 'Телефони',
        PL: 'Telefony',
        KK: 'Телефондар',
        IT: 'Cellulari',
        LV: 'Telefoni',
    };

    dict.entranceCode = {
        EN: 'Entrance code',
        RU: 'Домофон',
        FR: 'Code d\'entrée',
        DE: 'Zugangscode',
        ES: 'Código de entrada',
        PT: 'Código de entrada',
        JA: 'エントランスコード',
        ZH: '入口代码',
        UK: 'Домофон',
        PL: 'Domofon',
        KK: 'Түсу коды',
        IT: 'Codice d\'ingresso',
        LV: 'Ieejas kods',
    };

    dict.comment = {
        EN: 'Comment',
        RU: 'Комментарий',
        FR: 'Commenter',
        DE: 'Kommentar',
        ES: 'Comentario',
        PT: 'Comente',
        JA: 'コメント',
        ZH: '评论',
        UK: 'Коментар',
        PL: 'Komentarz',
        KK: 'Түсініктеме',
        IT: 'Commento',
        LV: 'Komentāri',
    };

    dict.day = {
        EN: 'day',
        RU: 'дня',
        FR: 'journée',
        DE: 'tag',
        ES: 'día',
        PT: 'dia',
        JA: '日',
        ZH: '日',
        UK: 'дні',
        PL: 'dzień',
        KK: 'күн',
        IT: 'giorno',
        LV: 'diena',
    };

    dict.days = {
        EN: 'days',
        RU: 'дней',
        FR: 'journées',
        DE: 'Tage',
        ES: 'dias',
        PT: 'dias',
        JA: '日々',
        ZH: '天',
        UK: 'днів',
        PL: 'dzień',
        KK: 'күн',
        IT: 'giorni',
        LV: 'dienas',
    };

    dict.from = {
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

    dict.deliveryNotPossible = {
        EN: 'Unfortunately, delivery to your chosen city is not possible',
        RU: 'К сожалению, в выбранный вами город доставка не осуществляется',
        FR: 'Malheureusement, la livraison à votre ville choisie n\'est pas possible',
        DE: 'Leider ist eine Lieferung in der gewählten Stadt nicht möglich',
        ES: 'Por desgracia, la entrega a su ciudad elegida no es posible',
        PT: 'Infelizmente, a entrega à sua cidade escolhida não é possível',
        JA: '残念ながら、あなたの選ばれた都市への配信を行うことはできません',
        ZH: '不幸的是，送货到你所选择的城市是不可能的',
        UK: 'На жаль, в обране місто доставка не здійснюється',
        PL: 'Niestety nie dostarczamy w wybrane przez ciebie miejsce',
        KK: 'Өкінішке орай, Сіздің таңдаған қалаға жеткізу мүмкін емес',
        IT: 'Purtroppo, la consegna al vostro città scelta non è possibile',
        LV: 'Diemžēl piegāde uz jūsu izvēlēto pilsētu netiek veikta',
    };

    dict.delivery = {
        EN: 'Delivery',
        RU: 'Доставка',
        FR: 'Livraison',
        DE: 'Lieferung',
        ES: 'Entrega',
        PT: 'Entrega',
        JA: '配達',
        ZH: '交货',
        UK: 'Доставка',
        PL: 'Dostawa',
        KK: 'Жеткізілім',
        IT: 'Consegna',
        LV: 'Piegāde',
    };

    dict.pickup = {
        EN: 'Pickup location',
        RU: 'Пункт получения',
        FR: 'Lieu de ramassage',
        DE: 'Treffpunkt',
        ES: 'Lugar de recogida',
        PT: 'Local de retirada',
        JA: 'ピックアップ場所',
        ZH: '接人的地方',
        UK: 'Пункт отримання',
        PL: 'Miejsce odbioru',
        KK: 'Жеткізу орны',
        IT: 'Posto di raccolta',
        LV: 'Saņemšanas punkts',
    };

    dict.selectPickup = {
        EN: 'Select pickup location',
        RU: 'Выберите пункт получения',
        FR: 'Sélectionnez l\'emplacement pick-up',
        DE: 'Wählen Sie Abholort',
        ES: 'Seleccionar ubicación de recogida',
        PT: 'Escolha local de retirada',
        JA: 'ピックアップ場所を選択',
        ZH: '选择的取货地点',
        UK: 'Виберіть пункт отримання',
        PL: 'Wybierz miejsce odbioru',
        KK: 'Желімді орынды таңдаңыз',
        IT: 'Seleziona ubicazione pickup',
        LV: 'Izvēlieties pikaps atrašanās vietu',
    };

    dict.selectAddress = {
        EN: 'Please select an address from the options provided',
        RU: 'Пожалуйста, выберите адрес из предложенных вариантов',
        FR: 'S\'il vous plaît sélectionner une adresse parmi les options proposées',
        DE: 'Bitte wählen Sie eine Adresse aus den Optionen zur Verfügung gestellt',
        ES: 'Por favor, seleccione una dirección de una de las opciones proporcionadas',
        PT: 'Por favor seleccione um endereço entre as opções fornecidas',
        JA: '提供されるオプションからアドレスを選択してください',
        ZH: '请从所提供的选项的地址',
        UK: 'Будь ласка, виберіть адресу із запропонованих варіантів',
        PL: 'Wybierz adres wśród oferowanych opcji',
        KK: 'Берілген параметрлерден мекенжайды таңдаңыз',
        IT: 'Si prega di selezionare un indirizzo tra le opzioni previste',
        LV: 'Lūdzu, izvēlieties adresi no piedāvātajām iespējām',
    };

    dict.selectCity = {
        EN: 'Please select an city from the options provided',
        RU: 'Пожалуйста, выберите город из предложенных вариантов',
        FR: 'S\'il vous plaît choisir une ville parmi les options proposées',
        DE: 'Bitte wählen Sie eine Stadt aus den Optionen zur Verfügung gestellt',
        ES: 'Por favor, seleccione una ciudad de entre las opciones proporcionadas',
        PT: 'Por favor, selecione uma cidade entre as opções fornecidas',
        JA: '提供されるオプションから都市を選択してください',
        ZH: '请从所提供的选项的城市',
        UK: 'Будь ласка, виберіть місто із запропонованих варіантів',
        PL: 'Wybierz miejsce wśród oferowanych opcji',
        KK: 'Берілген параметрлерден бір қаланы таңдаңыз',
        IT: 'Si prega di selezionare una città tra le opzioni previste',
        LV: 'Lūdzu, izvēlieties pilsētu no piedāvātajām iespējām',
    };

    dict.orderComment = {
        EN: 'Order comment',
        RU: 'Комментарий к заказу',
        FR: 'Commentaire de commande',
        DE: 'Bestellen Kommentar',
        ES: 'Comentario de la orden',
        PT: 'Comentário ordem',
        JA: '注文のコメント',
        ZH: '为了评论',
        UK: 'Коментар до замовлення',
        PL: 'Komentarz do zamówienia',
        KK: 'Тапсырыс беру қатынасқа',
        IT: 'Commento Order',
        LV: 'Komentējiet pasūtījumu',
    };

    dict.select = {
        EN: 'Select',
        RU: 'Выбрать',
        FR: 'Sélectionner',
        DE: 'Wählen',
        ES: 'Seleccione',
        PT: 'Selecionar',
        JA: '選択する',
        ZH: '选择',
        UK: 'Вибрати',
        PL: 'Wybierz',
        KK: 'Таңдаңыз',
        IT: 'Selezionare',
        LV: 'Izvēlieties',
    };

    dict.workingHours = {
        EN: 'Working hours',
        RU: 'Время работы',
        FR: 'Heures d\'ouverture',
        DE: 'Arbeitszeit',
        ES: 'Horas Laborales',
        PT: 'Jornada de trabalho',
        JA: '勤務時間',
        ZH: '工作时间',
        UK: 'Час роботи',
        PL: 'Godziny robocze',
        KK: 'Жұмыс сағаттары',
        IT: 'Ore lavorative',
        LV: 'Darba stundas',
    };

    dict.unavailable = {
        EN: 'Delivery service temporarily unavailable.',
        RU: 'К сожалению, в данный момент сервис доставки недоступен.',
        FR: 'Service de livraison temporairement indisponible.',
        DE: 'Zustelldienst vorübergehend nicht verfügbar.',
        ES: 'Servicio de entrega disponible temporalmente.',
        PT: 'Serviço de entrega temporariamente indisponíveis.',
        JA: '配達サービスが一時的に利用できません。',
        ZH: '送货服务暂时不可用。',
        UK: 'Служба доставки тимчасово не працює.',
        PL: 'Niestety, w tym momencie dostawa nie jest możliwa.',
        KK: 'Жеткізу қызметі уақытша қол жетімсіз.',
        IT: 'Servizio di consegna temporaneamente non disponibile.',
        LV: 'Diemžēl piegādes pakalpojums pašlaik nav pieejams.',
    };

    dict.loadingServices = {
        EN: 'Loading delivery services',
        RU: 'Получение сервисов доставки',
        FR: 'Services de livraison de chargement',
        DE: 'Laden Zustelldienste',
        ES: 'Servicios Carga de entrega',
        PT: 'Serviços de carga de entrega',
        JA: 'ローディング配信サービス',
        ZH: '加载送货服务',
        UK: 'Отримання сервісів доставки',
        PL: 'Otrzymanie serwisów dostawy',
        KK: 'Жеткізу қызметтері жүктелуде',
        IT: 'Servizi di consegna Caricamento',
        LV: 'Piegādes pakalpojumu saņemšana',
    };

    dict.loadingPickup = {
        EN: 'Loading a list of pickup locations',
        RU: 'Получение списка пунктов выдачи заказов',
        FR: 'Chargement d\'une liste d\'emplacements pick-up',
        DE: 'Laden einer Liste von Standorten pickup',
        ES: 'Carga de una lista de los lugares de recogida',
        PT: 'Carregando uma lista de locais de coleta',
        JA: 'ピックアップ場所のリストを読み込みます',
        ZH: '加载接客位置的列表',
        UK: 'Отримання списку пунктів видачі замовлень',
        PL: 'Otrzymanie listy miejsc wydania zamówień',
        KK: 'Желімді орындардың тізімін жүктеу',
        IT: 'Caricamento di un elenco di luoghi di ritiro',
        LV: 'Saņemšanas punktu saraksta iegūšana',
    };

    dict.noResult = {
        EN: 'No results were found for your request',
        RU: 'По вашему запросу ничего не найдено',
        FR: 'Aucun résultat n\'a été trouvé pour votre demande',
        DE: 'Es wurden keine Ergebnisse für Ihre Anfrage gefunden',
        ES: 'No se encontraron resultados para su solicitud',
        PT: 'Não foram encontrados resultados para sua solicitação',
        JA: '該当する結果はあなたの要求のために見つかりませんでした',
        ZH: '没有找到您的要求',
        UK: 'За вашим запитом нічого не знайдено',
        PL: 'Brak wyników',
        KK: 'Нәтижелері Сіздің сұранысыңыз бойынша табылған жоқ',
        IT: 'Non sono stati trovati risultati per la tua richiesta',
        LV: 'Jūsu meklēšanas vaicājumam netika atrasts neviens rezultāts',
    };

    dict.change = {
        EN: 'Change',
        RU: 'Изменить',
        FR: 'Changer',
        DE: 'Veränderung',
        ES: 'Cambio',
        PT: 'Mudar',
        JA: '変化する',
        ZH: '改变',
        UK: 'Змінити',
        PL: 'Zmień',
        KK: 'Өзгеріс',
        IT: 'Modificare',
        LV: 'Rediģēt',
    };

    dict.fullName = {
        EN: 'Full name',
        RU: 'Получатель (ФИО полностью)',
        FR: 'Nom et prénom',
        DE: 'Vollständiger Name',
        ES: 'Nombre completo',
        PT: 'Nome completo',
        JA: 'フルネーム',
        ZH: '全名',
        UK: 'Одержувач (ПІБ повністю)',
        PL: 'Pełne imię',
        KK: 'Толық аты',
        IT: 'Nome e cognome',
        LV: 'Saņēmējs (pilns vārds)',
    };

    dict.johnDoe = {
        EN: 'John Doe',
        RU: 'Иванов Иван Иванович',
        FR: 'Jean Dupont',
        DE: 'Max Mustermann',
        ES: 'Fulano de Tal',
        PT: 'Fulano de Tal',
        JA: 'なになに',
        ZH: '张三',
        UK: 'Іван Іванович Іваненко',
        PL: 'Jan Kowalski',
        KK: 'Алмаз Ахметов',
        IT: 'Mario Rossi',
        LV: 'John Doe',
    };

    var lang = window.browserLang;

    if (typeof dict[msg] !== 'undefined') {
        if (typeof dict[msg][lang] !== 'undefined' && dict[msg][lang] != '') {
            return dict[msg][lang];
        } else {
            return dict[msg].EN;
        }
    }

    return 'Text not found #' + msg;
}

// Prefix: Element.closest
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