/**
 * Блок T1002, находится в категории "Магазин"
 * Скрипт добавляет на страницу виджет вишлиста и кнопку "Добавить в избранное" для каждого товара на странице.
 * Список избранного хранится в localStorage.
 * Используется вместе с блоками товаров (ST***), в этих блоках и скрипте tilda-catalog-1.1.js 
 * триггерится событие 'twishlist_addbtn', которое запускает отрисовку кнопок для товаров 
 * (актуально для попапов/сниппетов и динамически отрисовываемых товаров).
 */

// eslint-disable-next-line no-unused-vars
function twishlist__init(recid) {
    var wishlistBlock = document.querySelector('.t1002');
    var wishlistBlocksLength = document.querySelectorAll('.t1002').length;
	var rec = document.querySelector('#rec' + recid);

    // предотвращает несколько инициализаций
    if (window.twishlist_initted === 'yes' && wishlistBlocksLength > 1) {
        var errorText = window.browserLang === 'RU' ? 'Ошибка: На странице присутствуют ' + wishlistBlocksLength + ' виджета избранного (блок ST110). Пожалуйста, удалите дубликаты. Блоки могут находиться на странице Header или Footer.' : 'Error: ' + wishlistBlocksLength + ' wishlist widgets (block ST110) on the page. Remove a duplicate. Blocks can be on the Header or Footer page.';
        if (!document.querySelector('.t1002__previewmode-infobox .t1002__previewmode-infobox-error')) {
            Array.prototype.forEach.call(document.querySelectorAll('.t1002__previewmode-infobox center'), function(infobox) {
				infobox.insertAdjacentHTML('beforeend', '<div class="t1002__previewmode-infobox-error" style="color:red">' + errorText + '</div>');
			});
        }
        if (window.twishlist_erroralert === undefined) {
            alert(errorText);
            window.twishlist_erroralert = 'yes';
            // eslint-disable-next-line no-console
            console.error('Error: Two wishlist widgets (block ST110) on the page. Remove a duplicate.');
        }
        return;
    }

    // сколько дней товар хранится в избранном
    var maxStoreDays = wishlistBlock.getAttribute('data-wishlist-maxstoredays');
    if (maxStoreDays) {
        window.twishlist_maxstoredays = maxStoreDays;
    }

    window.twishlist_initted = 'yes';

	twishlist__loadLocalObj();
    twishlist__reDrawCartIcon();
    twishlist__addEvent__links();
    twishlist__addEvents();
	twishlist__addProductButtons();

    setTimeout(function () {
        var hash = decodeURIComponent(document.location.hash);
        if (hash.indexOf('#addtofavorites:') !== -1) {
			// добавление в избранное с любой кнопки по ссылке
            var customWishlistBtn = document.querySelector('a[href="' + hash + '"]');
            customWishlistBtn.click();
        }
    });

    // отключает эффект появления при скролле
    rec.setAttribute('data-animationappear', 'off');
    rec.style.opacity = '1';

    // добавляет дефолтный заголовок для попапа
	var wishlistHeading = wishlistBlock.querySelector('.t1002__wishlistwin-heading');
    if (wishlistHeading.innerHTML == '') {
        wishlistHeading.innerHTML = twishlist_dict('yourWishlist') + ':';
    }
}

function twishlist_dict(msg) {
    var dict = [];

    dict['yourWishlist'] = {
        EN: 'Favorites',
        RU: 'Избранное',
        FR: 'Favoris',
        DE: 'Favoriten',
        ES: 'Favoritos',
        PT: 'Favoritos',
        JA: 'お気に入り',
        ZH: '收藏',
        UK: 'Вибране',
        PL: 'Ulubione',
        KK: 'Таңдаулылар',
        IT: 'Preferiti',
        LV: 'Izlase',
    };

	dict['youAdd'] = {
        EN: 'added to favorites',
        RU: 'добавлено в избранное',
        FR: 'enregistré dans les favoris',
        DE: 'in favoriten gespeichert',
        ES: 'guardado en favoritos',
        PT: 'guardado nos favoritos',
        JA: 'お気に入り に保存しました',
        ZH: '已添加到愿望清单',
        UK: 'додано у вибране',
        PL: 'zapisano w ulubionych',
        KK: 'таңдаулыларға қосылды',
        IT: 'salvato nei preferiti',
        LV: 'pievienots izlasei',
    };

    dict['undo'] = {
        EN: 'Undo',
        RU: 'Вернуть',
        FR: 'Annuler',
        DE: 'Rückgängig',
        ES: 'Deshacer',
        PT: 'Desfazer',
        JA: '元に戻す',
        ZH: '撤销',
        UK: 'Повернути',
        PL: 'Powrót',
        KK: 'Болдырмау',
        IT: 'Disfare',
        LV: 'Atcelt',
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

    dict['LMT'] = {
        EN: 'lm',
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

    var lang = window.browserLang;

    if (dict[msg]) {
		if (dict[msg][lang]) {
            return dict[msg][lang];
        } else {
            return dict[msg]['EN'];
        }
	}

    return 'Text not found #' + msg;
}

function twishlist__nullObj() {
    var twishlist = {};
    twishlist['products'] = [];
    twishlist['prodamount'] = 0;
    twishlist['amount'] = 0;
    return twishlist;
}

/**
 * Загружает вишлист из localStorage, устанавливает отображение валюты
 */
function twishlist__loadLocalObj() {
    var dataJsonStr = null;
    var timestamp;
    var delta;

    if (typeof localStorage === 'object') {
		try {
			dataJsonStr = localStorage.getItem('twishlist');
        } catch (e) {
			// eslint-disable-next-line no-console
            console.error('Your web browser does not support storing a Wishlist data locally.');
        }
    }

    if (dataJsonStr === null) {
        window.twishlist = twishlist__nullObj();
    } else {
        window.twishlist = JSON.parse(dataJsonStr);
    }

    // удаляет из window.twishlist пустые или удаленные товары
    if (window.twishlist['products'] !== undefined) {
        var actualProductsObj = [];
        var oldCountProducts = window.twishlist['products'].length;
        window.twishlist['products'].forEach(function(product) {
            if (!twishlist__isEmptyObject(product) && product.deleted !== 'yes') {
                actualProductsObj.push(product);
            }
        });
        window.twishlist['products'] = actualProductsObj;
        var actualCountProducts = window.twishlist['products'].length;
        if (actualCountProducts !== oldCountProducts) {
            twishlist__saveLocalObj();
        }
    }

    // проверяет срок хранения в вишлисте
    if (window.twishlist_maxstoredays) {
		var maxStoreDays = window.twishlist_maxstoredays;
        if (maxStoreDays > 0) {
            if (window.twishlist.updated > 0) {
                timestamp = Math.floor(Date.now() / 1000);
                delta = timestamp * 1 - window.twishlist.updated * 1;
                if (delta > 60 * 60 * 24 * maxStoreDays) {
                    if (typeof localStorage === 'object') {
                        window.twishlist.products = [];
                        localStorage.setItem('twishlist', JSON.stringify(window.twishlist));
                    }
                    window.twishlist = twishlist__nullObj();
                }
			}
        } else if (maxStoreDays == '0') {
            window.twishlist = twishlist__nullObj();
        }
    } else if (window.twishlist.updated > 0) {
        timestamp = Math.floor(Date.now() / 1000);
        delta = timestamp * 1 - window.twishlist.updated * 1;
        if (delta > 60 * 60 * 24 * 30) {
            window.twishlist = twishlist__nullObj();
        }
    }

	// TODO: вынести в другую функцию
    // устанавливает дефолтное отображение валюты
    delete window.twishlist['currency'];
    delete window.twishlist['currency_txt'];
    delete window.twishlist['currency_txt_l'];
    delete window.twishlist['currency_txt_r'];
    delete window.twishlist['currency_side'];
    delete window.twishlist['currency_sep'];
    delete window.twishlist['currency_dec'];
    window.twishlist['currency'] = '$';
    window.twishlist['currency_side'] = 'l';
    window.twishlist['currency_sep'] = '.';
    window.twishlist['currency_dec'] = '';

    // если валюта задана в настройках user payment 
    var wishlistBlock = document.querySelector('.t1002');
	var paymentCurrency = wishlistBlock.getAttribute('data-userpayment-currency');
	if (paymentCurrency){
		window.twishlist['currency'] = paymentCurrency;
	}

	//////
    // если валюта задана в настройках проекта:
    var projectCurrency = wishlistBlock.getAttribute('data-project-currency');
    if (projectCurrency) {
        window.twishlist['currency'] = projectCurrency;
    }

    // название валюты
    window.twishlist['currency_txt'] = window.twishlist['currency'];

    // расположение значка валюты
    projectCurrency = wishlistBlock.getAttribute('data-project-currency-side');
    if (projectCurrency == 'r') {
        window.twishlist['currency_side'] = 'r';
    }
    if (window.twishlist['currency_side'] == 'l') {
        window.twishlist['currency_txt_l'] = window.twishlist['currency_txt'] + '';
        window.twishlist['currency_txt_r'] = '';
    } else {
        window.twishlist['currency_txt_r'] = ' ' + window.twishlist['currency_txt'];
        window.twishlist['currency_txt_l'] = '';
    }

    // десятичный разделитель
    projectCurrency = wishlistBlock.getAttribute('data-project-currency-sep');
    if (projectCurrency == '.' || projectCurrency == ',') {
        window.twishlist['currency_sep'] = projectCurrency;
    } else if (window.twishlist['currency'] == '$' || window.twishlist['currency'] == '€' || window.twishlist['currency'] == 'USD' || window.twishlist['currency'] == 'EUR') {
        window.twishlist['currency_sep'] = '.';
    } else {
        window.twishlist['currency_sep'] = ',';
    }

    // десятичный формат
    projectCurrency = wishlistBlock.getAttribute('data-project-currency-dec');
    if (projectCurrency == '00') {
        window.twishlist['currency_dec'] = projectCurrency;
    } else {
        window.twishlist['currency_dec'] = '';
    }

    twishlist__updateTotalProductsObj();
}

/**
 * Сохраняет объект window.twishlist в localStorage, обновляет дату изменения
 */
function twishlist__saveLocalObj() {
    // если max days == 0 - не сохраняем
    if (typeof window.twishlist_maxstoredays != 'undefined' && window.twishlist_maxstoredays == 0) {
        return;
    }

    if (typeof window.twishlist == 'object') {
        window.twishlist.updated = Math.floor(Date.now() / 1000);
        var dataJsonStr = JSON.stringify(window.twishlist);
        if (typeof localStorage === 'object') {
            try {
                localStorage.setItem('twishlist', dataJsonStr);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Your web browser does not support storing a Wishlist data locally.');
            }
        }
    }
}

/** 
 * Синхронизирует товары в объекте window.twishlist и localStorage
 */
function twishlist__syncProductsObject__LStoObj() {
    if (typeof window.twishlist_maxstoredays != 'undefined' && window.twishlist_maxstoredays == 0) {
		return;
    }

    if (typeof localStorage === 'object') {
		try {
			var lsJsonStr = localStorage.getItem('twishlist');
            var lsJsonObj = JSON.parse(lsJsonStr);
            if (typeof lsJsonObj['products'] == 'object') {
				
				// удаляет из window.twishlist пустые или удаленные товары
                var actualProductsObj = [];
                var oldCountProducts = lsJsonObj['products'].length;

                lsJsonObj['products'].forEach(function(product) {
                    if (!twishlist__isEmptyObject(product) && product.deleted !== 'yes' && product.quantity > 0) {
                        actualProductsObj.push(product);
                    }
                });
                window.twishlist['products'] = actualProductsObj;
                var actualCountProducts = window.twishlist['products'].length;
                if (actualCountProducts !== oldCountProducts) {
                    twishlist__saveLocalObj();
                }

                twishlist__updateTotalProductsObj();
            }
        } catch (e) {
            /* */
        }
    }
}

/**
 * Добавляет кнопку с сердечком на каждую карточку товара
 */
function twishlist__addProductButtons() {
	var productElementsList = document.querySelectorAll('.js-product');
	var wishlistBtnPosition = document.querySelector('.t1002').getAttribute('data-wishlistbtn-pos');
	if (productElementsList.length > 0) {
		Array.prototype.forEach.call(productElementsList, function(productElement) {
			var productObj = twishlist__getProductObjFromPel(productElement);
			var productInWishlist = twishlist__checkIfInWishlist(productObj).flag;
			var btnClass = productInWishlist ? ' t1002__addBtn_active' : '';
			var btnSvg = '<svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6.32647C20 11.4974 10.5 17 10.5 17C10.5 17 1 11.4974 1 6.32647C1 -0.694364 10.5 -0.599555 10.5 5.57947C10.5 -0.599555 20 -0.507124 20 6.32647Z" stroke="black" stroke-linejoin="round"/></svg>';
			var wishlistBtn = '<a href="#addtofavorites" class="t1002__addBtn' + btnClass + '">' + btnSvg + '</a>';
            var addBtn = productElement.querySelector('.t1002__addBtn');

			var t1002BtnsWrapper = productElement.querySelector('.t1002__btns-wrapper');
			var jsStoreBtnsWrapper = productElement.querySelector('.js-store-buttons-wrapper');
			var tStorePopupBtnsWrapper = productElement.querySelector('.t-store__prod-popup__btn-wrapper');
			var t1002PictureWrapper = productElement.querySelector('.t1002__picture-wrapper');
			var tStoreImgWrapper = productElement.querySelector('.t-store__card__imgwrapper');

			var productIsSingle = productElement.classList.contains('js-product-single') || 
								productElement.classList.contains('t-store__product-snippet') || 
								productElement.closest('.t-popup');

			if (!addBtn) {
				// попап и одиночный продукт
				if (productIsSingle && (t1002BtnsWrapper || tStorePopupBtnsWrapper)) {
					if (t1002BtnsWrapper) t1002BtnsWrapper.insertAdjacentHTML('beforeend', wishlistBtn);
					if (tStorePopupBtnsWrapper) tStorePopupBtnsWrapper.insertAdjacentHTML('beforeend', wishlistBtn);
				} else if (wishlistBtnPosition === 'picture' && (t1002PictureWrapper || tStoreImgWrapper)) {
					if (tStoreImgWrapper) tStoreImgWrapper.classList.add('t1002__picture-wrapper');
					productElement.querySelector('.t1002__picture-wrapper').insertAdjacentHTML('beforeend', wishlistBtn);
				} else if (wishlistBtnPosition === 'button' && (t1002BtnsWrapper || jsStoreBtnsWrapper)) {
					if (t1002BtnsWrapper) t1002BtnsWrapper.insertAdjacentHTML('beforeend', wishlistBtn);
					if (jsStoreBtnsWrapper) jsStoreBtnsWrapper.insertAdjacentHTML('beforeend', wishlistBtn);
				}
			} else {
				productInWishlist ? addBtn.classList.add('t1002__addBtn_active') : addBtn.classList.remove('t1002__addBtn_active');
			}
		});
	}
}

/**
 * События виджета вишлиста и localStorage
 */
function twishlist__addEvents() {
	var body = document.querySelector('body');
    // TODO: кастомное событие jquery
	$('body').on('twishlist_addbtn', function() {
		twishlist__addProductButtons();
	});
	var wishlistIcon = document.querySelector('.t1002__wishlisticon');
	if (wishlistIcon) {
		wishlistIcon.addEventListener('click', function () {
			twishlist__openWishlist();
		});
	}

	body.addEventListener('click', function(e) {
		if (e.target && e.target.closest('a[href="#showfavorites"]')) {
			twishlist__openWishlist();
			e.preventDefault();
		}
	});

    document.querySelector('.t1002__wishlistwin-close').addEventListener('click', function () {
        twishlist__closeWishlist();
    });

    document.querySelector('.t1002__wishlistwin').addEventListener('mousedown', function (e) {
        if (e.target == this) {
            var windowWidth = window.innerWidth;
            var maxScrollBarWidth = 17;
            var windowWithoutScrollBar = windowWidth - maxScrollBarWidth;
            if (e.clientX > windowWithoutScrollBar) {
                return;
            }
            twishlist__closeWishlist();
        }
    });

    // синхронизирует localstorage в разных вкладках
	window.addEventListener('storage', function (e) {
		if (e.isTrusted) {
			if (e.key === 'twishlist') {
				try {
					var lsJsonStr = localStorage.getItem('twishlist');
					var lsJsonObj = JSON.parse(lsJsonStr);
					if (typeof lsJsonObj['products'] == 'object') {
						window.twishlist['products'] = lsJsonObj['products'];
						twishlist__updateTotalProductsObj();
					}
				} catch (e) {
					/* */
				}
				twishlist__reDrawCartIcon();

				// перерисовывает товары в открытом окне вишлиста
				if (document.querySelector('body').classList.contains('t1002__body_wishlistwinshowed')) {
					twishlist__reDrawProducts();
				}
			}
		}
	});
}

/**
 * Генерирует объект товара из html-элемента
 * 
 * @param {HTMLElement} productElement - элемент, содержащий информацию о товаре
 * @returns {object} productObj - объект товара
 */
function twishlist__getProductObjFromPel(productElement) {
	// TODO: возможно, убрать обнуление переменных
	var price = '0';
	var name = '';
	var img = '';
	var sku = '';
	var lid = '';
	var uid = '';
	var recid = '';
	var inv = '';

	var single = '';
	var unit = '';
	var portion = '';

	var packLabel = '';
	var packM = '';
	var packX = '';
	var packY = '';
	var packZ = '';

	if (productElement) {
		if (name == '') {
			name = productElement.querySelector('.js-product-name').textContent || '';
		}
		if (price == '' || price == 0) {
			var el_price = productElement.querySelector('.js-product-price');
			if (el_price) {
				if (el_price.classList.contains('js-store-prod-price-range-val')) {
					price = el_price.getAttribute('data-product-price-def');
				} else {
					price = el_price.textContent;
				}	
			}
			price = twishlist__cleanPrice(price);
		}
		if (img == '') {
			if (productElement.getAttribute('data-product-img')) {
				img = productElement.getAttribute('data-product-img');
			} else {
				var imgDiv = productElement.querySelector('.js-product-img');
				if (imgDiv) {
					var original = imgDiv.getAttribute('data-original') || '';
					if (original.length > 0) {
						img = original;
					} else if (imgDiv.tagName == 'IMG') {
						img = imgDiv.getAttribute('src');
					} else if (imgDiv.tagName == 'DIV') {
						img = '';
						var imgCss = getComputedStyle(imgDiv)['background-image'];
						if (imgCss) {
							img = imgCss.replace('url(', '').replace(')', '').replace(/"/gi, '');
						}
					}
				}
			}
		}
		if (lid == '') {
			lid = productElement.getAttribute('data-product-lid') || '';
		}
		if (uid == '') {
			uid = productElement.getAttribute('data-product-uid') || '';
		}
		if (recid == '') {
			var recidAttr = productElement.closest('.r').getAttribute('id');
			recid = recidAttr ? recidAttr.replace('rec', '') : '';
		}
		if (inv == '') {
			inv = productElement.getAttribute('data-product-inv') || '';
		}

		unit = productElement.getAttribute('data-product-unit') || '';
		portion = productElement.getAttribute('data-product-portion') || '';
		single = productElement.getAttribute('data-product-single') || '';

		var options = [];
		// варианты товара (с разными свойствами)
        var editionOptionsElements = productElement.querySelectorAll('.js-product-edition-option');
        Array.prototype.forEach.call(editionOptionsElements, function(optionsElement) {
			var optionName = optionsElement.querySelector('.js-product-edition-option-name').textContent;
			var selectedOption = optionsElement.querySelector('option:checked');
			if (selectedOption) {
				var optionVariant = selectedOption.value;
				var optionPrice = selectedOption.getAttribute('data-product-edition-variant-price');
				optionPrice = twishlist__cleanPrice(optionPrice);
	
				if (optionName && optionVariant) {
					var optionObj = {};
					if (optionName != '') {
						optionName = twishlist__escapeHtml(optionName);
					}
					if (optionVariant != '') {
						optionVariant = twishlist__escapeHtml(optionVariant);
						optionVariant = optionVariant.replace(/(?:\r\n|\r|\n)/g, '');
					}
					if (optionName.length > 1 && optionName.charAt(optionName.length - 1) == ':') {
						optionName = optionName.substring(0, optionName.length - 1);
					}
					optionObj['option'] = optionName;
					optionObj['variant'] = optionVariant;
					optionObj['price'] = optionPrice;
					options.push(optionObj);
				}
			}
		});
		// дополнительные опции
        var optionsElements = productElement.querySelectorAll('.js-product-option');
		Array.prototype.forEach.call(optionsElements, function(optionsElement) {
			var optionName = optionsElement.querySelector('.js-product-option-name').textContent;
			var selectedOption = optionsElement.querySelector('option:checked');
			if (selectedOption) {
				var optionVariant = selectedOption.value;
				var optionPrice = selectedOption.getAttribute('data-product-variant-price');
				optionPrice = twishlist__cleanPrice(optionPrice);
	
				if (optionName && optionVariant) {
					var optionObj = {};
					if (optionName != '') {
						optionName = twishlist__escapeHtml(optionName);
					}
					if (optionVariant != '') {
						optionVariant = twishlist__escapeHtml(optionVariant);
						optionVariant = optionVariant.replace(/(?:\r\n|\r|\n)/g, '');
					}
					if (optionName.length > 1 && optionName.charAt(optionName.length - 1) == ':') {
						optionName = optionName.substring(0, optionName.length - 1);
					}
					optionObj['option'] = optionName;
					optionObj['variant'] = optionVariant;
					optionObj['price'] = optionPrice;
					options.push(optionObj);
				}
			}
		});
		if (sku == '') {
			sku = productElement.querySelector('.js-product-sku') ? productElement.querySelector('.js-product-sku').textContent.trim() : '';
		}
		if (packLabel == '') {
			packLabel = productElement.getAttribute('data-product-pack-label') || '';
		}
		if (packM == '') {
			packM = productElement.getAttribute('data-product-pack-m') || '';
		}
		if (packX == '') {
			packX = productElement.getAttribute('data-product-pack-x') || '';
		}
		if (packY == '') {
			packY = productElement.getAttribute('data-product-pack-y') || '';
		}
		if (packZ == '') {
			packZ = productElement.getAttribute('data-product-pack-z') || '';
		}
	}
	var productUrl = productElement.getAttribute('data-product-url');
	var settedLinkInToProduct = productElement.querySelector('.js-product-link:not([href="#prodpopup"]):not([href="#addtofavorites"]:not([href="#order"]');
	if (settedLinkInToProduct) {
		var settedLinkInToProductHref = settedLinkInToProduct.getAttribute('href');
	}

	if (!productUrl && settedLinkInToProductHref) {
		productUrl = settedLinkInToProductHref;
	} else if (!productUrl && recid && lid) {
		productUrl = window.location.origin + window.location.pathname + '#!/tproduct/' + recid + '-' + lid;
	} else if (!productUrl) {
		productUrl = window.location.origin + window.location.pathname + '#rec' + recid;
	}
	if (name == '' && (price == '' || price == 0)) {
		return;
	}

	if (name == '') name = 'NoName';
	if (price == '') price = 0;

	if (name != '') name = twishlist__escapeHtml(name);
	if (img != '') img = twishlist__escapeHtmlImg(img);

	var productObj = {};
	productObj['name'] = name;
	productObj['price'] = price;
	productObj['img'] = img;
	productObj['recid'] = recid;
	productObj['lid'] = lid;

	productObj['pack_label'] = packLabel;
	productObj['pack_m'] = packM;
	productObj['pack_x'] = packX;
	productObj['pack_y'] = packY;
	productObj['pack_z'] = packZ;

	productObj['url'] = productUrl;
	if (options.length > 0) {
		productObj['options'] = options;
	}
	if (sku) {
		sku = twishlist__escapeHtml(sku);
		productObj['sku'] = sku;
	}

	if (uid) productObj['uid'] = uid;
	if (lid) productObj['lid'] = lid;
	if (inv > 0) productObj['inv'] = parseInt(inv, 10);

	if (unit) {
		productObj['unit'] = unit;
	}

	if (portion) {
		productObj['portion'] = portion;
	}

	if (single) {
		productObj['single'] = single;
	}

	return productObj;
}

/**
 * События кнопки добавления в избранное
 */
function twishlist__addEvent__links() {
	var recs = document.querySelectorAll('.r');
	Array.prototype.forEach.call(recs, function(rec) {
		rec.addEventListener('click', function (e) {
			var wishlistBtn = e.target.closest('[href^="#addtofavorites"]') ? e.target.closest('[href^="#addtofavorites"]') : '';
			if (!wishlistBtn) return;
			e.preventDefault();
	
			var price = '0';
			var name = '';
			var img = '';
			var wishlistBtnLink = wishlistBtn.getAttribute('href');
			var productObj = {
				name: '',
				price: '0',
				recid: ''
			};
			
			// получает данные товара из ссылки
			if (wishlistBtnLink.substring(0, 16) == '#addtofavorites:') {
				var productData = wishlistBtnLink.substring(16);
				if (productData) {
					// если есть специальный параметр для картинки
					if (productData.indexOf(':::') > 0) {
						var imgLinkPos = productData.indexOf(':::');
						// проверяет, что ::: не в названии товара
						if (productData.indexOf('=') > 0 && productData.indexOf('=') < productData.indexOf(':::')) {
							var imgLink = productData.substring(imgLinkPos + 3);
							productData = productData.substring(0, imgLinkPos);
						}
					}
	
					if (productData.indexOf('=') > 0) {
						var productDataParams = productData.split('=');
						if (productDataParams[0]) name = productDataParams[0];
						if (productDataParams[1]) price = productDataParams[1];
						price = twishlist__cleanPrice(price);
					} else {
						name = productData;
					}

					// обрабатывает параметры
					if (imgLink) {
						if (imgLink.indexOf('=') > 0) {
							// eslint-disable-next-line no-redeclare
							var imgLinkArr = imgLink.split('=');
							if (imgLinkArr[0] && imgLinkArr[1]) {
								if (imgLinkArr[0] == 'image' && (imgLinkArr[1].indexOf('tildacdn.com') > 0 || imgLinkArr[1].indexOf('tildacdn.info') > 0)) {
									img = imgLinkArr[1];
								}
							}
						}
					}
	
					if (recid == '') {
						recid = wishlistBtn.closest('.r').getAttribute('id') ? wishlistBtn.closest('.r').getAttribute('id').replace('rec', '') : '';
					}
				}
				productObj['name'] = name;
				productObj['price'] = price;
				productObj['recid'] = recid;
				productObj['img'] = img;
	
			}
	
			// получает данные товара из html-элемента
			var productElement = wishlistBtn.closest('.js-product');
			if (productElement) {
				wishlistBtn.classList.add('t1002__addBtn_neworder');
				wishlistBtn.classList.add('t1002__addBtn_active');
				setTimeout(function () {
					wishlistBtn.classList.remove('t1002__addBtn_neworder');
				}, 2000);
				productObj = twishlist__getProductObjFromPel(productElement);
	
				var price = productObj.price;
				var recid = productObj.recid;
			}

			// если товар уже в вишлисте - удаляет его
			var objFromWishlist = twishlist__checkIfInWishlist(productObj);
			if (objFromWishlist.flag) {
				var id = objFromWishlist.id;
				window.twishlist.products[id].deleted = 'yes';
				var wishlistIconCounter = document.querySelector('.js-wishlisticon-counter');
				twishlist__updateTotalProductsObj();
				if (wishlistIconCounter) {
					wishlistIconCounter.innerHTML = window.twishlist.total;
				}
				// меню с поиском, корзиной и вишлистом
				if (document.querySelector('.t1004')) {
					document.querySelector('.t1004 .js-wishlisticon-counter').innerHTML = window.twishlist.total;
				}
				twishlist__saveLocalObj();
				wishlistBtn.classList.remove('t1002__addBtn_active');
				window.twishlist.products[id] = {};
				if (twishlist__isEmptyObject(window.twishlist.products[id])) {
					window.twishlist.products.splice(id, 1);
					twishlist__reDrawProducts();
				}
				twishlist__reDrawCartIcon();
			} else {
				twishlist__addProduct(productObj);
				var bubbleTxt = productObj.name + ' ' + twishlist_dict('youAdd');
				twishlist__showBubble(bubbleTxt);
			}
	
			twishlist__addProductButtons();
		});
	});
}

/**
 * Проверяет, добавлен ли товар в вишлист
 * 
 * @param {object} productObj - объект товара
 * @returns {object} objInWishlist - находится ли товар в вишлисте, id этого товара в вишлисте
 */
function twishlist__checkIfInWishlist(productObj) {
	var products = window.twishlist['products'];
    var isInWishlist = false;
	var objIndex = '';

    if (products.length > 0) {
		Array.prototype.forEach.call(products, function(product, index) {
            var isEqualOptions = 'y';
            var isEqualSKU = '';
			if (!productObj) {
				return;
			}
			if ((product['uid'] !== undefined && product['uid'] == productObj['uid']) ||
				(product['uid'] == undefined && product['name'] && product['name'].trim() == productObj['name'].trim() && product['price'] == productObj['price'])) {
				if (
					product['options'] == undefined &&
					productObj['options'] == undefined &&
					product['sku'] == undefined &&
					productObj['sku'] == undefined
				) {
					objIndex = index;
					isInWishlist = true;
					return false;
				}
				if (
					product['options'] == undefined &&
					productObj['options'] == undefined &&
					product['sku'] != undefined &&
					productObj['sku'] != undefined &&
					product['sku'] == productObj['sku']
				) {
					objIndex = index;
					isInWishlist = true;
					return false;
				}

				if (typeof product['options'] == 'object' && typeof productObj['options'] == 'object') {
					Array.prototype.forEach.call(product['options'], function (option, index) {
						if (typeof option == 'object' && typeof productObj['options'][index] == 'object') {
							if (
								option['option'] !== productObj['options'][index]['option'] ||
								option['variant'] !== productObj['options'][index]['variant'] ||
								option['price'] !== productObj['options'][index]['price']
							) {
								return (isEqualOptions = false);
							}
						} else if (option == undefined || productObj['options'][index] == undefined) {
							return (isEqualOptions = false);
						}
					});

					if (product['sku'] === productObj['sku']) {
						isEqualSKU = 'y';
					}

					if (isEqualOptions === 'y' && isEqualSKU === 'y') {
						objIndex = index;
						isInWishlist = true;
						return false;
					}
				}
			}
        });
    }
	var objInWishlist = { 
		id: objIndex,
		flag: isInWishlist
	};
	return objInWishlist;
}

/**
 * Добавляет товар в вишлист
 * 
 * @param {object} productObj - объект товара
 */
function twishlist__addProduct(productObj) {
    var timestamp = Math.floor(Date.now() / 1000);
	var twishlistIcon = document.querySelector('.t1002__wishlisticon');

    twishlist__syncProductsObject__LStoObj();
	
	var isObjInWishlist = twishlist__checkIfInWishlist(productObj).flag;

    if (!isObjInWishlist) {
		if (productObj['quantity'] === undefined) {
            productObj['quantity'] = 1;
            productObj['amount'] = productObj['price'];
        } else {
            productObj['amount'] = twishlist__roundPrice(productObj['price'] * productObj['quantity']);
        }
        productObj['ts'] = timestamp;
        window.twishlist['products'].push(productObj);
    }

    twishlist__updateTotalProductsObj();

    twishlist__reDrawCartIcon();

    twishlist__saveLocalObj();

    if (document.querySelector('.t1002').getAttribute('data-openwishlist-onorder') == 'yes') {
        setTimeout(function () {
            twishlist__openWishlist();
        }, 10);
    } else if (twishlistIcon) {
		twishlistIcon.classList.add('t1002__wishlisticon_neworder');
		setTimeout(function () {
			twishlistIcon.classList.remove('t1002__wishlisticon_neworder');
		}, 2000);
	}
}

/**
 * Обновляет информацию о цене или наличии товара, если они изменились
 */
function twishlist__updateProductsPrice() {
    var now = Math.floor(Date.now() / 1000);

    if (window.twishlist !== undefined) {
        if (window.twishlist.updated !== undefined) {
            var timestamp = parseInt(window.twishlist.updated, 10);
            if ((now - timestamp) / (60 * 60) > 12) {
				var dataCart = {};
                dataCart.prodamount = window.twishlist.prodamount;
                dataCart.discount = window.twishlist.discount;
                dataCart.products = JSON.stringify(window.twishlist.products);
                dataCart.amount = window.twishlist.amount;
                dataCart.total = window.twishlist.total;
                dataCart.updated = window.twishlist.updated;

                // Adding a endpoint to the twishlist_endpoints object
                if (!window.twishlist_endpoint) {
                    window.twishlist_endpoint = 'store.tildacdn.com';
                }

                var apiUrl = 'https://' + window.twishlist_endpoint + '/api/getpriceproducts/';

				var xhr = new XMLHttpRequest();
				xhr.open('POST', apiUrl);
				xhr.onload = function() {
					if (xhr.status >= 200 && xhr.status < 400) {
						var data = xhr.responseText;
						if (typeof data !== 'string' || data.substr(0, 1) !== '{') {
							// eslint-disable-next-line no-console
							console.error('Can\'t get array.');
						}
						var productsArr = [];
						
						try {
							var dataObj = JSON.parse(data);
							if (dataObj.status === 'error') {
								productsArr = dataObj.bad;
							} else if (dataObj.status === 'success') {
								return;
							}
						} catch (e) {
							// eslint-disable-next-line no-console
							console.error('Can\'t get JSON.', data);
						}
		
						if (productsArr === '') {
							// eslint-disable-next-line no-console
							console.error('Something went wrong. Can\'t get products array.');
							return;
						}
		
						if (productsArr.length === 0) {
							// eslint-disable-next-line no-console
							console.error('Nothing to update.');
							return;
						}
						Object.keys(productsArr).forEach(function (i) {
							var badUid = productsArr[i].uid || productsArr[i].lid;
		
							if (productsArr[i].error === 'PRICE_CHANGED') {
								window.twishlist.products.forEach(function (product, index) {
									var uid = product.uid || product.lid;
									if (badUid === uid) {
										if (product.options !== undefined && productsArr[i].options !== undefined && productsArr[i].variant !== undefined) {
											product.options.forEach(function (option) {
												if (option.variant === productsArr[i].variant) {
													window.twishlist.products[index].amount = parseFloat(productsArr[i].last_amount);
													window.twishlist.products[index].price = parseFloat(productsArr[i].last_price);
													return;
												}
											});
										}
		
										if (product.options === undefined && productsArr[i].options === undefined && productsArr[i].variant === undefined) {
											window.twishlist.products[index].amount = parseFloat(productsArr[i].last_amount);
											window.twishlist.products[index].price = parseFloat(productsArr[i].last_price);
											return;
										}
									}
								});
							}
		
							if (productsArr[i].error === 'LESS_PRODUCTS' || productsArr[i].error === 'NOT_FOUND_PRODUCT') {
								window.twishlist.products.forEach(function (product, index) {
									var uid = product.uid || product.lid;
									if (badUid === uid) {
										window.twishlist.products[index] = {};
									}
								});
							}
						});
		
						twishlist__saveLocalObj();
						twishlist__reDrawProducts();
						twishlist__updateTotalProductsObj();
						var wishlistIconCounter = document.querySelector('.js-wishlisticon-counter');
						if (wishlistIconCounter) {
							wishlistIconCounter.innerHTML = window.twishlist.total;
						}
						if (document.querySelector('.t1004')) {
							document.querySelector('.t1004 .js-wishlisticon-counter').innerHTML = window.twishlist.total;
						}
					}
				};
				xhr.onerror = function(error) {
					twishlist__changeEndpoint(error, function () {
                        twishlist__updateProductsPrice();
                    });
				};
				xhr.send(window.twishlist);
            }
        }
    }
}

/**
 * Обновляет количество товаров в избранном
 */
function twishlist__updateTotalProductsObj() {
    var products = window.twishlist['products'];
    if (products.length > 0) {
        // пропускает пустые или удаленные товары
        var total = 0;
        var prodamount = 0;
        Array.prototype.forEach.call(products, function (product) {
            if (!twishlist__isEmptyObject(product) && product.deleted !== 'yes') {
                if (product.single === 'y') {
                    total = total + 1;
                } else {
                    total = total + product['quantity'] * 1;
                }
                prodamount = prodamount * 1 + product['amount'] * 1;
            }
        });
        prodamount = twishlist__roundPrice(prodamount);
        window.twishlist['total'] = total;
        window.twishlist['prodamount'] = prodamount;

        var amount = prodamount;

        if (amount > 0) {
            amount = twishlist__roundPrice(amount);
        }
        window.twishlist['amount'] = amount;
    } else {
        window.twishlist['total'] = 0;
        window.twishlist['prodamount'] = 0;
        window.twishlist['amount'] = 0;
    }
}

function twishlist__reDrawCartIcon() {
    var twishlist = window.twishlist;
    var wishlistIcon = document.querySelector('.t1002__wishlisticon');
	if (wishlistIcon) {
		var wishlistIconCounter = wishlistIcon.querySelector('.js-wishlisticon-counter');
		if (twishlist['total'] == 1) {
			wishlistIcon.style.opacity = 0;
			wishlistIcon.style.transition = 'opacity .3s';
			wishlistIcon.style.opacity = 1;
		}
	}
	var t1004_wishlistCounter = document.querySelector('.t1004 .js-wishlisticon-counter');

    if (twishlist.products !== undefined && twishlist.products.length > 0 && twishlist['total'] > 0) {
		if (wishlistIcon) {
			wishlistIcon.classList.add('t1002__wishlisticon_showed');
			wishlistIconCounter.innerHTML = twishlist['total'];
		}
		if (t1004_wishlistCounter) {
			t1004_wishlistCounter.innerHTML = twishlist['total'];
		}
    } else {
		if (wishlistIcon) {
			wishlistIcon.classList.remove('t1002__wishlisticon_showed');
			wishlistIconCounter.innerHTML = '';
		}
		if (t1004_wishlistCounter) {
			t1004_wishlistCounter.innerHTML = '';
		}
    }

    if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        try {
            twishlist__onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('js lazyload not loaded');
        }
    }
}

function twishlist__openWishlist() {
	var wishlistIcon = document.querySelector('.t1002__wishlisticon');
	var wishlistWindow = document.querySelector('.t1002__wishlistwin');
	if (wishlistIcon) {
		wishlistIcon.classList.remove('t1002__wishlisticon_showed');
	}
    document.querySelector('body').classList.add('t1002__body_wishlistwinshowed');

    setTimeout(function () {
        twishlist__lockScroll();
    }, 500);

    twishlist__syncProductsObject__LStoObj();

    twishlist__updateProductsPrice();

    wishlistWindow.style.opacity = 0;
	wishlistWindow.style.transition = 'opacity .3s';
	wishlistWindow.classList.add('t1002__wishlistwin_showed');

	// фикс для анимации
	setTimeout(function() {
		wishlistWindow.style.opacity = 1;
		var contentEl = document.querySelector('.t1002__wishlistwin-content');
		contentEl.classList.add('t1002__wishlistwin-content_showed');
	}, 0);

    twishlist__reDrawProducts();
    document.addEventListener('keyup', twishlist__keyUpFunc);
    if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        try {
            twishlist__onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('js lazyload not loaded');
        }
    }
}

/**
 * Перерисовывает товары в окне вишлиста
 */
function twishlist__reDrawProducts() {
    var wishlistWindowProducts = document.querySelector('.t1002__wishlistwin-products');

    // удаляет пустые или удаленные товары
    if (window.twishlist['products'] !== undefined) {
        var actualProductsObj = [];
        var oldCountProducts = window.twishlist['products'].length;
        Array.prototype.forEach.call(window.twishlist['products'], function(product) {
            if (!twishlist__isEmptyObject(product) && product.deleted !== 'yes' && product.quantity > 0) {
                actualProductsObj.push(product);
            }
        });
        window.twishlist['products'] = actualProductsObj;
        var actualCountProducts = window.twishlist['products'].length;
        if (actualCountProducts !== oldCountProducts) {
            twishlist__saveLocalObj();
        }
    }

    var hasImg = '';
    if (actualProductsObj.length > 0) {
        var str = '';
        Array.prototype.forEach.call(actualProductsObj, function(product, index) {
			if (product['img'] != '') {
                hasImg = 'yes';
            }

            str += '<div class="t1002__product" data-wishlist-product-i="' + index + '">';
            if (hasImg == 'yes') {
                str += '<div class="t1002__product-thumb"><div class="t1002__product-imgdiv"' + (product['img'] !== '' ? 'style="background-image:url(\'' + product['img'] + '\');"' : '') + '></div></div>';
            }
            str += '<div class="t1002__product-title t-descr t-descr_sm">';
            if (product.url) {
                str += '<a class="t1002__product-link" target="_blank" style="color: inherit" href="' + product.url + '">' + product['name'] + '</a>';
            } else {
                str += product['name'];
            }

            if (product.options && product.options.length > 0) {
                str += '<div class="t1002__product-title__option">';
                Array.prototype.forEach.call(product.options, function(option) {
                    str += '<div>' + option['option'] + ': ' + option['variant'] + '</div>';
                });
                str += '</div>';
            }
            if (product['sku']) {
                str += '<div class="t1002__product-title__option">';
                str += product['sku'];
                str += '</div>';
            }

            str += '</div>';

			str += '<div class="t1002__product-amount t-descr t-descr_sm">';
			if (product.amount > 0) {
				str += twishlist__showPrice(product.amount);
			}
			str += '</div>';
		
            str += '<div class="t1002__product-del"><img src="https://static.tildacdn.com/lib/linea/1bec3cd7-e9d1-2879-5880-19b597ef9f1a/arrows_circle_remove.svg" style="width:20px;height:20px;border:0;"></div>';
            str += '</div>';
        });
        wishlistWindowProducts.innerHTML = str;
        twishlist__addEvents__forProducts();
    } else {
        wishlistWindowProducts.innerHTML = '';
    }
}

/**
 * Добавляет событие удаления товара из вишлиста
 */
function twishlist__addEvents__forProducts() {
	var productDelBtns = document.querySelectorAll('.t1002__product-del');
	Array.prototype.forEach.call(productDelBtns, function(productDelBtn) {
		productDelBtn.addEventListener('click', function() {
			var productElement = this.closest('.t1002__product');
			twishlist__delProduct(productElement);
		});
	});
}

function twishlist__closeWishlist() {
	var twishlist = window.twishlist;
	var twishlistIcon = document.querySelector('.t1002__wishlisticon');
	var twishlistWin = document.querySelector('.t1002__wishlistwin');
    document.querySelector('body').classList.remove('t1002__body_wishlistwinshowed');

    twishlist__unlockScroll();

	// скрывает иконку вишлиста, если в нем не осталось товаров
	if (twishlistIcon) {
		if (twishlist.products !== undefined && twishlist.products.length > 0 && twishlist['total'] > 0) {
			twishlistIcon.classList.add('t1002__wishlisticon_showed');
		} else {
			twishlistIcon.classList.remove('t1002__wishlisticon_showed');
		}
	}

    twishlist__delZeroquantity_inCartObj();

    document.removeEventListener('keyup', twishlist__keyUpFunc);

	if (twishlistIcon) {
		twishlistIcon.classList.remove('t1002__wishlisticon_neworder');
	}
	twishlistWin.style.transition = 'opacity .3s';
	twishlistWin.style.opacity = 0;

	document.querySelector('.t1002__wishlistwin-content').classList.remove('t1002__wishlistwin-content_showed');
    setTimeout(function () {
		twishlistWin.classList.remove('t1002__wishlistwin_showed');
        twishlistWin.style.opacity = '1';
    }, 300);

    if (window.twishlist_success == 'yes') {
		location.reload();
    }
	// TODO: trigger
	$('body').trigger('twishlist_addbtn');
}

function twishlist__keyUpFunc(e) {
    if (e.keyCode == 27) {
        twishlist__closeWishlist();
    }
}

/**
 * Удаляет товар из вишлиста
 * 
 * @param {HTMLElement} wishlistProductElement - элемент, содержащий информацию о товаре
 */
function twishlist__delProduct(wishlistProductElement) {
	var wishlistIconCounter = document.querySelector('.t1002__wishlisticon .js-wishlisticon-counter');
	var t1004_wishlistCounter = document.querySelector('.t1004 .js-wishlisticon-counter');
    var wishlistProductId = wishlistProductElement.getAttribute('data-wishlist-product-i');

	if (window.twishlist.products[wishlistProductId] === undefined) {
		twishlist__syncProductsObject__LStoObj();
	}

	window.twishlist.products.splice(wishlistProductId, 1);
	if (wishlistProductElement.parentNode !== null) {
		wishlistProductElement.parentNode.removeChild(wishlistProductElement);
	}

	twishlist__updateTotalProductsObj();
	if (wishlistIconCounter) {
		wishlistIconCounter.innerHTML = window.twishlist.total;
	}
	if (t1004_wishlistCounter) {
		t1004_wishlistCounter.innerHTML = window.twishlist.total;
	}
	twishlist__saveLocalObj();
	twishlist__reDrawProducts();

	if (window.twishlist.products.length === 0) {
		twishlist__closeWishlist();
		if (t1004_wishlistCounter) {
			t1004_wishlistCounter.innerHTML = '';
		}
	}
	// TODO: trigger
	$('body').trigger('twishlist_addbtn');
}

function twishlist__delZeroquantity_inCartObj() {
    var products = window.twishlist['products'];
    var isModified = '';
    if (products.length > 0) {
        Array.prototype.forEach.call(products, function (product, index) {
            if (product && !product['quantity']) {
                window.twishlist.products.splice(index, 1);
                isModified = 'yes';
            }
        });
    }
    if (isModified == 'yes') {
        twishlist__saveLocalObj();
    }
}

/**
 * Показывает всплывающее сообщение о том, что товар добавлен в вишлист
 * 
 * @param {string} text - текст сообщения
 */
function twishlist__showBubble(text) {
	var delay = 3000;
    var id = 1;
	var bubble = document.querySelectorAll('.t1002__bubble');
	if (bubble.length > 0) {
		id = bubble.length + 1;
	}

	var str = '' +
		'<div class="t1002__bubble" data-wishlist-bubble="' + id + '">' +
		'<div class="t1002__bubble-close">&times;</div>' +
		'<div class="t1002__bubble-text">' + text + '</div>' +
		'</div>' +
		'';

	document.querySelector('body').insertAdjacentHTML('beforeend', str);
	var currentBubble = document.querySelector('.t1002__bubble[data-wishlist-bubble="' + id + '"]');

	if (id > 1) {
		var prevElement = document.querySelector('.t1002__bubble[data-wishlist-bubble="' + (id - 1) + '"]');
		if (prevElement) {
			var elementBottom = getComputedStyle(prevElement)['bottom'];
			var elementHeight = getComputedStyle(prevElement)['height'];
			elementBottom = parseInt(elementBottom);
			elementHeight = parseInt(elementHeight);
		}
		if (id < 5) {
			currentBubble.style.bottom = (elementBottom + elementHeight + 5) + 'px';
		} else {
			currentBubble.style.bottom = (elementBottom + 25) + 'px';
		}
	}

	// фикс для анимации
	setTimeout(function() {
		currentBubble.style.transition = 'opacity .4s, right .4s';
		currentBubble.style.opacity = 1;
		currentBubble.style.right = '20px';
	}, 0);

	// закрываем бабл через delay = 3s + 400ms на открытие
	setTimeout(function () {
		twishlist__closeBubble(id);
	}, delay + 400);

	currentBubble.querySelector('.t1002__bubble-close').addEventListener('click', function () {
		var id = this.closest('.t1002__bubble').getAttribute('data-wishlist-bubble');
		twishlist__closeBubble(id);
	});
}

function twishlist__closeBubble(id) {
	if (id) {
		var bubble = document.querySelector('.t1002__bubble[data-wishlist-bubble="' + id + '"]');
	}
	if (bubble) {
		bubble.style.opacity = 0;
		bubble.style.right = 0;
		setTimeout(function () {
			if (bubble.parentNode !== null) {
				bubble.parentNode.removeChild(bubble);
			}
		}, 300);
	}
}

function twishlist__escapeHtml(text) {
    var map = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[<>"']/g, function (m) {
        return map[m];
    });
}

function twishlist__escapeHtmlImg(text) {
    var map = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
    };
    return text.replace(/[<>"]/g, function (m) {
        return map[m];
    });
}

function twishlist__cleanPrice(price) {
    if (!price) {
        price = 0;
    } else {
        price = price.replace(',', '.');
        // eslint-disable-next-line no-useless-escape
        price = price.replace(/[^0-9\.]/g, '');
        price = parseFloat(price).toFixed(2);
        if (isNaN(price)) price = 0;
        price = parseFloat(price);
        price = price * 1;
        if (price < 0) price = 0;
    }
    return price;
}

function twishlist__roundPrice(price) {
    if (!price) {
        price = 0;
    } else {
        price = parseFloat(price).toFixed(2);
        price = parseFloat(price);
        price = price * 1;
        if (price < 0) price = 0;
    }
    return price;
}

function twishlist__showPrice(price) {
    if (!price) {
        price = '';
    } else {
        price = price.toString();

        if (window.twishlist['currency_dec'] == '00') {
            if (price.indexOf('.') === -1 && price.indexOf(',') === -1) {
                price = price + '.00';
            } else {
                var foo = price.substr(price.indexOf('.') + 1);
                if (foo.length === 1) {
                    price = price + '0';
                }
            }
        }

        price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        if (window.twishlist['currency_sep'] == ',') {
            price = price.replace('.', ',');
        }
        price = window.twishlist['currency_txt_l'] + price + window.twishlist['currency_txt_r'];
    }
    return price;
}

/**
 * fix IOS11 cursor bug + general IOS background scroll
 */ 
function twishlist__lockScroll() {
    if (window.isiOS && !window.MSStream) {
        if (window.isiOSVersion !== '' && window.isiOSVersion !== undefined) {
            if (window.isiOSVersion[0] === 11) {
                var body = document.querySelector('body');
                if (!body.classList.contains('t-body_scroll-locked')) {
                    var bodyScrollTop =
                        typeof window.pageYOffset !== 'undefined' ?
                        window.pageYOffset :
                        (document.documentElement || document.body.parentNode || document.body).scrollTop;
                    body.classList.add('t-body_scroll-locked');
                    body.style.top = '-' + bodyScrollTop + 'px';
                    body.setAttribute('data-popup-scrolltop', bodyScrollTop);
                }
            }
        }
    }
}

function twishlist__unlockScroll() {
    if (window.isiOS && !window.MSStream) {
        if (window.isiOSVersion !== '' && window.isiOSVersion !== undefined) {
            if (window.isiOSVersion[0] === 11) {
                var body = document.querySelector('body');
                if (body.classList.contains('t-body_scroll-locked')) {
                    var bodyScrollTop = body.getAttribute('data-popup-scrolltop');
                    body.classList.remove('t-body_scroll-locked');
                    body.style.top = '';
                    body.removeAttribute('data-popup-scrolltop');
                    window.scrollTo(0, bodyScrollTop);
                }
            }
        }
    }
}

function twishlist__onFuncLoad(funcName, okFunc, time) {
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

/**
 * Method isEmptyObject for ie8+
 * 
 * @param {object} obj - object for checked
 * @returns {boolean} - return true/false
 */
 function twishlist__isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

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
function twishlist__changeEndpoint(error, callback) {
    if (
        error &&
        (error.status >= 500 || error.status == 408 || error.status == 410 || error.status == 429 || error.statusText == 'timeout' || (error.status == 0 && error.state() == 'rejected')) &&
        window.twishlist_endpoint.indexOf('store.tildacdn.com') !== -1
    ) {
        window.twishlist_endpoint = 'store2.tildacdn.com';
        if (typeof callback === 'function') {
            callback();
        }
    } else if (error && error.responseText > '') {
        // eslint-disable-next-line no-console
        console.log('[' + error.status + '] ' + error.responseText + '. Please, try again later.');
    } else if (error && error.statusText) {
        // eslint-disable-next-line no-console
        console.log('Error [' + error.status + ', ' + error.statusText + ']. Please, try again later.');
    } else {
        // eslint-disable-next-line no-console
        console.log('[' + error.status + '] ' + 'Unknown error. Please, try again later.');
    }
}