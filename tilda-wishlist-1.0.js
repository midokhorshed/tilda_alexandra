// eslint-disable-next-line no-unused-vars
function twishlist__init(recid) {
	
    var el = $('.t1002');
    /* prevent N-init */
    if (window.twishlist_initted === 'yes' && el.length > 1) {
        var str = window.browserLang === 'RU' ? 'Ошибка: На странице присутствуют ' + el.length + ' виджета корзины (блок ST100). Пожалуйста, удалите дубликаты. Блоки могут находиться на странице Header или Footer.' : 'Error: ' + el.length + ' wishlist widgets (block ST100) on the page. Remove a duplicate. Blocks can be on the Header or Footer page.';

        if ($('.t1002__previewmode-infobox .t1002__previewmode-infobox-error').length === 0) {
            $('.t1002__previewmode-infobox center').append('<div class="t1002__previewmode-infobox-error" style="color:red">' + str + '</div>');
        }

        if (window.twishlist_erroralert === undefined) {
            alert(str);
            window.twishlist_erroralert = 'yes';
            // eslint-disable-next-line no-console
            console.error('Error: Two wishlist widgets (block ST100) on the page. Remove a duplicate.');
        }

        return;
    }

    /* max days */
    fooo = el.attr('data-wishlist-maxstoredays');
    if (typeof fooo != 'undefined' && fooo != '' && fooo >= 0) {
        window.twishlist_maxstoredays = fooo;
    }

    window.twishlist_initted = 'yes';
	
	twishlist__loadLocalObj();
	
    twishlist__drawBottomTotalAmount();
	
    twishlist__reDrawCartIcon();
	
    twishlist__addEvent__links();
	
    twishlist__addEvents();
	
	twishlist__addProductButtons();

    setTimeout(function () {
        var hash = decodeURIComponent(document.location.hash);
        if (hash.indexOf('#wishlist:') !== -1) {
            var button = $('a[href="' + hash + '"]')[0];
            $(button).click();
        }
    });

    /* fix def visible */
    $('#rec' + recid).attr('data-animationappear', 'off');
    $('#rec' + recid).css('opacity', '1');

    el.find('.t1002__wishlistwin-totalamount-label').html(twishlist_dict('total') + ': ');

    /* add auto title for popup */
    if (el.find('.t1002__wishlistwin-heading').html() == '') {
        el.find('.t1002__wishlistwin-heading').html(twishlist_dict('yourWishlist') + ':');
    }
}

function twishlist_dict(msg) {
    var dict = [];

    dict['total'] = {
        EN: 'Total',
        RU: 'Сумма',
        FR: 'Total',
        DE: 'Gesamtsumme',
        ES: 'Total',
        PT: 'Total',
        JA: '合計',
        ZH: '总额。',
        UK: 'Сума',
        PL: 'Suma',
        KK: 'Жалпы',
        IT: 'Totale',
        LV: 'Kopā',
    };

    dict['yourWishlist'] = {
        EN: 'Wishlist',
        RU: 'Избранное',
        FR: 'Liste de Souhaits',
        DE: 'Wunschliste',
        ES: 'Lista de deseos',
        PT: 'Lista de desejos',
        JA: 'ウィッシュリスト',
        ZH: '愿望清单',
        UK: 'Список побажань',
        PL: 'Lista życzeń',
        KK: 'Тілектер тізімі',
        IT: 'Lista dei desideri',
        LV: 'Vēlmju saraksts',
    };

    dict['free'] = {
        EN: 'free',
        RU: 'бесплатно',
        FR: 'gratuit',
        DE: 'kostenlos',
        ES: 'gratis',
        PT: 'livre',
        UK: 'безкоштовно',
        JA: '無料で',
        ZH: '免费',
        PL: 'za darmo',
        KK: 'тегін',
        IT: 'gratuito',
        LV: 'bezmaksas',
    };

    dict['youRemoved'] = {
        EN: 'You removed',
        RU: 'Вы удалили',
        FR: 'Vous avez retiré',
        DE: 'Sie haben entfernt',
        ES: 'Has eliminado',
        PT: 'Retirou',
        JA: '除去しました',
        ZH: '你删除了',
        UK: 'Щойно видалено',
        PL: 'Usunąłeś',
        KK: 'Сіз жойылған',
        IT: 'Hai rimosso',
        LV: 'Jūs izdzēsāt',
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

    var lang = window.browserLang;

    if (typeof dict[msg] !== 'undefined') {
        if (typeof dict[msg][lang] !== 'undefined' && dict[msg][lang] != '') {
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

function twishlist__loadLocalObj() {
    var data_json_str = null;
    var ts;
    var delta;

    if (typeof localStorage === 'object') {
        try {
            data_json_str = localStorage.getItem('twishlist');
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Your web browser does not support storing a Wishlist data locally.');
        }
    }

    if (data_json_str === null) {
        window.twishlist = twishlist__nullObj();
    } else {
        window.twishlist = JSON.parse(data_json_str);
    }
	
    /* remove empty or deleted products */
    if (window.twishlist['products'] !== undefined) {
		
        var obj = [];
        var oldCountProducts = window.twishlist['products'].length;
        $.each(window.twishlist['products'], function (index, product) {
            if (!$.isEmptyObject(product) && product.deleted !== 'yes') {
                obj.push(product);
            }
        });
        window.twishlist['products'] = obj;
        var actualCountProducts = window.twishlist['products'].length;
        if (actualCountProducts !== oldCountProducts) {
            twishlist__saveLocalObj();
        }
    }

    /* how old info */
    if (typeof window.twishlist_maxstoredays != 'undefined' && window.twishlist_maxstoredays != '') {
        var foo = window.twishlist_maxstoredays;
        if (foo > 0) {
            if (typeof window.twishlist.updated != 'undefined' && window.twishlist.updated > 0) {
                ts = Math.floor(Date.now() / 1000);
                delta = ts * 1 - window.twishlist.updated * 1;
                if (delta > 60 * 60 * 24 * foo) {
                    if (typeof localStorage === 'object') {
                        window.twishlist.products = [];
                        localStorage.setItem('twishlist', JSON.stringify(window.twishlist));
                    }
                    window.twishlist = twishlist__nullObj();
                }
            }
        } else if (foo == '0') {
            window.twishlist = twishlist__nullObj();
        }
    } else if (typeof window.twishlist.updated != 'undefined' && window.twishlist.updated > 0) {
        ts = Math.floor(Date.now() / 1000);
        delta = ts * 1 - window.twishlist.updated * 1;
        if (delta > 60 * 60 * 24 * 30) {
            window.twishlist = twishlist__nullObj();
        }
    }

    /* set currency sign */
    /* set default */
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

    /* if set in user payment */
    /*
	var pc=$('.t1002').attr('data-userpayment-currency');
	if(typeof pc!='undefined' && pc!=''){
		window.twishlist['currency']=pc;
	}
	*/

    /* if set inside wishlist block */
    var cc = $('.t1002').attr('data-project-currency');
    if (typeof cc != 'undefined' && cc != '') {
        window.twishlist['currency'] = cc;
    }

    /* set txt currency */
    window.twishlist['currency_txt'] = window.twishlist['currency'];

    /* if set inside wishlist block */
    cc = $('.t1002').attr('data-project-currency-side');
    if (typeof cc != 'undefined' && cc == 'r') {
        window.twishlist['currency_side'] = 'r';
    }

    if (window.twishlist['currency_side'] == 'l') {
        window.twishlist['currency_txt_l'] = window.twishlist['currency_txt'] + '';
        window.twishlist['currency_txt_r'] = '';
    } else {
        window.twishlist['currency_txt_r'] = ' ' + window.twishlist['currency_txt'];
        window.twishlist['currency_txt_l'] = '';
    }

    /* if set inside wishlist block */
    cc = $('.t1002').attr('data-project-currency-sep');
    if (typeof cc != 'undefined' && (cc == '.' || cc == ',')) {
        window.twishlist['currency_sep'] = cc;
    } else if (window.twishlist['currency'] == '$' || window.twishlist['currency'] == '€' || window.twishlist['currency'] == 'USD' || window.twishlist['currency'] == 'EUR') {
        window.twishlist['currency_sep'] = '.';
    } else {
        window.twishlist['currency_sep'] = ',';
    }

    /* if set inside wishlist block */
    cc = $('.t1002').attr('data-project-currency-dec');
    if (typeof cc != 'undefined' && cc == '00') {
        window.twishlist['currency_dec'] = cc;
    } else {
        window.twishlist['currency_dec'] = '';
    }

    /* update total */
    twishlist__updateTotalProductsinCartObj();
}

function twishlist__saveLocalObj() {
    /* max days=0 */

    if (typeof window.twishlist_maxstoredays != 'undefined' && window.twishlist_maxstoredays == 0) {
        return;
    }

    if (typeof window.twishlist == 'object') {
        window.twishlist.updated = Math.floor(Date.now() / 1000);

        var data_json_str = JSON.stringify(window.twishlist);

        if (typeof localStorage === 'object') {
            try {
                localStorage.setItem('twishlist', data_json_str);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Your web browser does not support storing a Cart data locally.');
            }
        }
    }
}

function twishlist__syncProductsObject__LStoObj() {
    /* max days=0 */
    if (typeof window.twishlist_maxstoredays != 'undefined' && window.twishlist_maxstoredays == 0) {
        return;
    }

    if (typeof localStorage === 'object') {
        try {
            var foo_json_str = localStorage.getItem('twishlist');
            var foo_json_obj = JSON.parse(foo_json_str);
            if (typeof foo_json_obj['products'] == 'object') {

                /* remove empty or deleted products */
                var obj = [];
                var oldCountProducts = foo_json_obj['products'].length;
                $.each(foo_json_obj['products'], function (index, product) {
                    if (!$.isEmptyObject(product) && product.deleted !== 'yes' && product.quantity > 0) {
                        obj.push(product);
                    }
                });
                window.twishlist['products'] = obj;
                var actualCountProducts = window.twishlist['products'].length;

                if (actualCountProducts !== oldCountProducts) {
                    twishlist__saveLocalObj();
                }

                twishlist__updateTotalProductsinCartObj();
            }
        } catch (e) {
            /* */
        }
    }
}

function twishlist__addProductButtons() {
	var pel = $('.js-product');
	pel.each(function() {
		var productObj = twishlist__getProductObjFromPel($(this));
		var productInWishlist = twishlist__checkIfInWishlist(productObj).flag === 'yes';
		var btnClass = productInWishlist ? ' t1002__addBtn_active' : '';
		if ($(this).find('.t1002__addBtn').length === 0) {
			$(this).find('.t1002__btns-wrapper').append('<a href="#wishlist" class="t1002__addBtn' + btnClass + '"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5.32647C19 10.4974 9.5 16 9.5 16C9.5 16 0 10.4974 0 5.32647C0 -1.69436 9.5 -1.59956 9.5 4.57947C9.5 -1.59956 19 -1.50712 19 5.32647Z" fill="#C0C0C0"/></svg></a>');
			$(this).find('.js-store-buttons-wrapper').append('<a href="#wishlist" class="t1002__addBtn' + btnClass + '"><svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5.32647C19 10.4974 9.5 16 9.5 16C9.5 16 0 10.4974 0 5.32647C0 -1.69436 9.5 -1.59956 9.5 4.57947C9.5 -1.59956 19 -1.50712 19 5.32647Z" fill="#C0C0C0"/></svg></a>');
		} else {

			if (productInWishlist) {
				$(this).find('.t1002__addBtn').addClass('t1002__addBtn_active')

			} else {
				$(this).find('.t1002__addBtn').removeClass('t1002__addBtn_active')
			}
			
			// productInWishlist ? $(this).find('.t1002__addBtn').addClass('t1002__addBtn_active') : $(this).find('.t1002__addBtn').removeClass('t1002__addBtn_active')
		}
	})
}
function twishlist__addEvents() {
	$('body').on('twishlist_addbtn', function() {
		twishlist__addProductButtons();
	})
    $('.t1002__wishlisticon').click(function () {
        twishlist__openCart();
    });

    $('.t1002__wishlistwin-close').click(function () {
        twishlist__closeCart();
    });

    $('.t1002__wishlistwin-closebtn').click(function () {
        twishlist__closeCart();
    });

    $('.t1002').find('.js-form-proccess').attr('data-formwishlist', 'y');

    $('.t1002__wishlistwin').mousedown(function (e) {
        if (e.target == this) {
            var windowWidth = $(window).width();
            var maxScrollBarWidth = 17;
            var windowWithoutScrollBar = windowWidth - maxScrollBarWidth;
            if (e.clientX > windowWithoutScrollBar) {
                return;
            }
            twishlist__closeCart();
        }
    });

    /* sync storage */

	$(window).on('storage', function (e) {
		if (e.originalEvent && !window.clearTCart) {
			if (e.originalEvent.key === 'twishlist') {

				try {
					var foo_json_str = localStorage.getItem('twishlist');
					var foo_json_obj = JSON.parse(foo_json_str);
					if (typeof foo_json_obj['products'] == 'object') {
						window.twishlist['products'] = foo_json_obj['products'];
						twishlist__updateTotalProductsinCartObj();
					}
				} catch (e) {
					/* */
				}
				twishlist__reDrawCartIcon();

				/* popup's wishlist is opened */
				if ($('body').hasClass('t1002__body_wishlistwinshowed')) {
					twishlist__reDrawProducts();
					// twishlist__reDrawTotal();
				}
			}
		}
	});
}

function twishlist__getProductObjFromPel(pel) {
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

	var pack_label = '',
		pack_m = '',
		pack_x = '',
		pack_y = '',
		pack_z = '';

	if (typeof pel != 'undefined') {
		if (name == '') {
			name = pel.find('.js-product-name').text();
			if (typeof name == 'undefined') name = '';
		}
		if (price == '' || price == 0) {
			var el_price = pel.find('.js-product-price');

			if (el_price.hasClass('js-store-prod-price-range-val')) {
				price = el_price.attr('data-product-price-def');
			} else {
				price = el_price.text();
			}

			price = twishlist__cleanPrice(price);
		}
		if (img == '') {
			if (typeof pel.attr('data-product-img') != 'undefined' && pel.attr('data-product-img') != '') {
				img = pel.attr('data-product-img');
			} else {
				var imgdiv = pel.find('.js-product-img');
				if (typeof imgdiv != 'undefined') {
					var original = imgdiv.attr('data-original') || '';
					if (original.length > 0) {
						img = original;
					} else if (imgdiv.is('img')) {
						img = imgdiv.attr('src');
					} else if (imgdiv.is('div')) {
						img = '';
						var imgcss = imgdiv.css('background-image');
						if (typeof imgcss != 'undefined' && imgcss != '') {
							img = imgcss.replace('url(', '').replace(')', '').replace(/"/gi, '');
						}
					}
				}
			}
		}
		if (lid == '') {
			lid = pel.attr('data-product-lid');
			if (typeof lid == 'undefined') lid = '';
		}
		if (uid == '') {
			uid = pel.attr('data-product-uid');
			if (typeof uid == 'undefined') uid = '';
		}
		if (recid == '') {
			recid = pel.closest('.r').attr('id').replace('rec', '');
			if (typeof recid == 'undefined') recid = '';
		}

		if (inv == '') {
			inv = pel.attr('data-product-inv');
			if (typeof inv == 'undefined') inv = '';
		}

		unit = pel.attr('data-product-unit') || '';
		portion = pel.attr('data-product-portion') || '';
		single = pel.attr('data-product-single') || '';
		
		var options = [];
		pel.find('.js-product-edition-option').each(function () {
			var el_opt = $(this);
			var op_option = el_opt.find('.js-product-edition-option-name').text();
			var op_variant = el_opt.find('option:selected').val();
			var op_price = el_opt.find('option:selected').attr('data-product-edition-variant-price');
			op_price = twishlist__cleanPrice(op_price);

			if (typeof op_option != 'undefined' && typeof op_variant != 'undefined') {
				var obj = {};
				if (op_option != '') {
					op_option = twishlist__escapeHtml(op_option);
				}
				if (op_variant != '') {
					op_variant = twishlist__escapeHtml(op_variant);
					op_variant = op_variant.replace(/(?:\r\n|\r|\n)/g, '');
				}
				if (op_option.length > 1 && op_option.charAt(op_option.length - 1) == ':') {
					op_option = op_option.substring(0, op_option.length - 1);
				}
				obj['option'] = op_option;
				obj['variant'] = op_variant;
				obj['price'] = op_price;
				options.push(obj);
			}
		});
		pel.find('.js-product-option').each(function () {
			var el_opt = $(this);
			var op_option = el_opt.find('.js-product-option-name').text();
			var op_variant = el_opt.find('option:selected').val();
			var op_price = el_opt.find('option:selected').attr('data-product-variant-price');
			op_price = twishlist__cleanPrice(op_price);

			if (typeof op_option != 'undefined' && typeof op_variant != 'undefined') {
				var obj = {};
				if (op_option != '') {
					op_option = twishlist__escapeHtml(op_option);
				}
				if (op_variant != '') {
					op_variant = twishlist__escapeHtml(op_variant);
					op_variant = op_variant.replace(/(?:\r\n|\r|\n)/g, '');
				}
				if (op_option.length > 1 && op_option.charAt(op_option.length - 1) == ':') {
					op_option = op_option.substring(0, op_option.length - 1);
				}
				obj['option'] = op_option;
				obj['variant'] = op_variant;
				obj['price'] = op_price;
				options.push(obj);
			}
		});
		if (sku == '') {
			sku = pel.find('.js-product-sku').text().trim();
			if (typeof sku == 'undefined') sku = '';
		}

		if (pack_label == '') {
			pack_label = pel.attr('data-product-pack-label');
			if (typeof pack_label == 'undefined') pack_label = '';
		}
		if (pack_m == '') {
			pack_m = pel.attr('data-product-pack-m');
			if (typeof pack_m == 'undefined') pack_m = '';
		}
		if (pack_x == '') {
			pack_x = pel.attr('data-product-pack-x');
			if (typeof pack_x == 'undefined') pack_x = '';
		}
		if (pack_y == '') {
			pack_y = pel.attr('data-product-pack-y');
			if (typeof pack_y == 'undefined') pack_y = '';
		}
		if (pack_z == '') {
			pack_z = pel.attr('data-product-pack-z');
			if (typeof pack_z == 'undefined') pack_z = '';
		}
	}
	var productUrl = pel.attr('data-product-url');
	var isOrderButtonActive = pel.find('a[href="#wishlist"]').not('.t-btn').length;
	var settedLinkInToProduct = pel.find('.js-product-link').not('[href="#prodpopup"]').not('[href="#wishlist"]').attr('href');

	if (typeof productUrl == 'undefined' && settedLinkInToProduct) {
		productUrl = settedLinkInToProduct;
	} else if (typeof productUrl == 'undefined' && recid && lid && !isOrderButtonActive) {
		productUrl = window.location.origin + window.location.pathname + '#!/tproduct/' + recid + '-' + lid;
	} else if (typeof productUrl == 'undefined') {
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

	productObj['pack_label'] = pack_label;
	productObj['pack_m'] = pack_m;
	productObj['pack_x'] = pack_x;
	productObj['pack_y'] = pack_y;
	productObj['pack_z'] = pack_z;

	productObj['url'] = productUrl;

	if (typeof options != 'undefined' && options.length > 0) {
		productObj['options'] = options;
	}
	if (typeof sku != 'undefined' && sku != '') {
		sku = twishlist__escapeHtml(sku);
		productObj['sku'] = sku;
	}

	if (typeof uid != 'undefined' && uid != '') productObj['uid'] = uid;
	if (typeof lid != 'undefined' && lid != '') productObj['lid'] = lid;
	if (typeof inv != 'undefined' && inv > 0) productObj['inv'] = parseInt(inv, 10);

	if (unit !== '') {
		productObj['unit'] = unit;
	}

	if (portion !== '') {
		productObj['portion'] = portion;
	}

	if (single !== '') {
		productObj['single'] = single;
	}

	return productObj;
}
function twishlist__addEvent__links() {
	$('.r').on('click', '[href^="#wishlist"]', function (e) {
        e.preventDefault();
        var el = $(this);
        var btnForm = el.closest('form');
        if (btnForm.length) {
            var arErrors = window.tildaForm.validate(btnForm);
            if (window.tildaForm.showErrors(btnForm, arErrors)) return false;
        }
		
        var tmp = el.attr('href');

        if (tmp.substring(0, 10) == '#wishlist:') {
            var str = tmp.substring(10);
            if (typeof str != 'undefined' && str != '') {
                /* if has special parameter */
                if (str.indexOf(':::') > 0) {
                    var bar_pos = str.indexOf(':::');
                    /* double check what this ::: not in product name */
                    if (str.indexOf('=') > 0 && str.indexOf('=') < str.indexOf(':::')) {
                        var bar_str = str.substring(bar_pos + 3);
                        str = str.substring(0, bar_pos);
                    }
                }

                /* get name and price */
                if (str.indexOf('=') > 0) {
                    var arr = str.split('=');
                    if (typeof arr[0] != 'undefined') name = arr[0];
                    if (typeof arr[1] != 'undefined') price = arr[1];
                    price = twishlist__cleanPrice(price);
                } else {
                    name = str;
                }

                /* process parameters */
                if (typeof bar_str != 'undefined' && bar_str != '') {
                    if (bar_str.indexOf('=') > 0) {
                        // eslint-disable-next-line no-redeclare
                        var arr = bar_str.split('=');
                        if (typeof arr[0] != 'undefined' && typeof arr[1] != 'undefined' && arr[0] != '' && arr[1] != '') {
                            if (arr[0] == 'image' && arr[1].indexOf('tildacdn.com') > 0) {
                                img = arr[1];
                            }
                        }
                    }
                }

                if (recid == '') {
                    recid = el.closest('.r').attr('id').replace('rec', '');
                    if (typeof recid == 'undefined') recid = '';
                }
            }
        }
		
        var pel = $(this).closest('.js-product');
		$(this).addClass('t1002__addBtn_active');
		var productObj = twishlist__getProductObjFromPel(pel);
		
		var price = productObj.price;
        var name = productObj.name;
		
        var lid = productObj.lid;
        var uid = productObj.uid;
        var recid = productObj.recid;
		
		var objFromWishlist = twishlist__checkIfInWishlist(productObj);
		if (objFromWishlist.flag === 'yes') {
			var i = objFromWishlist.id;
			window.twishlist.products[i].deleted = 'yes';

			twishlist__updateTotalProductsinCartObj();
			$('.t1002__wishlisticon-counter').html(window.twishlist.total);
			// twishlist__reDrawTotal();
			twishlist__saveLocalObj();
			$(this).removeClass('t1002__addBtn_active');
			window.twishlist.products[i] = {};
			if ($.isEmptyObject(window.twishlist.products[i])) {
				window.twishlist.products.splice(i, 1);
				twishlist__reDrawProducts();
			}
			
		} else {
			twishlist__addProduct(productObj);
		}
    });
}

function twishlist__checkIfInWishlist(productObj) {
	var obj = window.twishlist['products'];
    var flag_inwishlist = '';
	var objIndex = '';

    if (obj.length > 0) {
        $.each(obj, function (index, product) {
            var eq_options = 'y';
            var eq_sku = '';
			if (!productObj) {
				return;
			}
			if (product['name'].trim() == productObj['name'].trim() && product['price'] == productObj['price']) {
				if (
					product['options'] == undefined &&
					productObj['options'] == undefined &&
					product['sku'] == undefined &&
					productObj['sku'] == undefined
				) {
					objIndex = index;
					flag_inwishlist = 'yes';
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
					flag_inwishlist = 'yes';
					return false;
				}

				if (typeof product['options'] == 'object' && typeof productObj['options'] == 'object') {
					$.each(product['options'], function (index, option) {
						if (typeof option == 'object' && typeof productObj['options'][index] == 'object') {
							if (
								option['option'] !== productObj['options'][index]['option'] ||
								option['variant'] !== productObj['options'][index]['variant'] ||
								option['price'] !== productObj['options'][index]['price']
							) {
								return (eq_options = false);
							}
						} else if (option == undefined || productObj['options'][index] == undefined) {
							return (eq_options = false);
						}
					});

					if (product['sku'] === productObj['sku']) {
						eq_sku = 'y';
					}

					if (eq_options === 'y' && eq_sku === 'y') {
						if (parseInt(window.twishlist['products'][index]['quantity'], 10) === parseInt(productObj['inv'], 10)) {
							alert(twishlist_dict('limitReached'));
						}
						objIndex = index;
						flag_inwishlist = 'yes';
						return false;
					}
				}
			}
        });
    }
	return { id: objIndex,
			 flag: flag_inwishlist
			};
}
function twishlist__addProduct(productObj) {
    var ts = Math.floor(Date.now() / 1000);

    /* sync products object from ls to obj */
    twishlist__syncProductsObject__LStoObj();

	var flag_inwishlist = twishlist__checkIfInWishlist(productObj).flag;

    if (flag_inwishlist == '') {
        if (productObj['quantity'] === undefined) {
            productObj['quantity'] = 1;
            productObj['amount'] = productObj['price'];
        } else {
            productObj['amount'] = twishlist__roundPrice(productObj['price'] * productObj['quantity']);
        }
        productObj['ts'] = ts;
        window.twishlist['products'].push(productObj);
    }

    twishlist__updateTotalProductsinCartObj();

    twishlist__reDrawCartIcon();

    twishlist__saveLocalObj();

    if ($('.t1002').attr('data-openwishlist-onorder') == 'yes') {
        setTimeout(function () {
            twishlist__openCart();
        }, 10);
    } else {
        $('.t1002__wishlisticon').addClass('t1002__wishlisticon_neworder');
        setTimeout(function () {
            $('.t1002__wishlisticon').removeClass('t1002__wishlisticon_neworder');
        }, 2000);
    }
}

function twishlist__updateProductsPrice() {
    var now = Math.floor(Date.now() / 1000);

    if (window.twishlist !== undefined) {
        if (window.twishlist.updated !== undefined) {
            var ts = parseInt(window.twishlist.updated, 10);
            if ((now - ts) / (60 * 60) > 12) {
                $.ajax({
                    type: 'POST',
                    url: 'https://store.tildacdn.com/api/getpriceproducts/',
                    data: window.twishlist,
                    dataType: 'text',
                    success: function (data) {
                        if (typeof data !== 'string' || data.substr(0, 1) !== '{') {
                            // eslint-disable-next-line no-console
                            console.error('Can\'t get array.');
                        }

                        var productsArr = [];

                        try {
                            var dataObj = jQuery.parseJSON(data);
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
                        twishlist__updateTotalProductsinCartObj();
                        $('.t1002__wishlisticon-counter').html(window.twishlist.total);
                    },
                    timeout: 1000 * 25,
                });
            }
        }
    }
}

function twishlist__updateTotalProductsinCartObj() {
    var obj = window.twishlist['products'];
    if (obj.length > 0) {
        /* skip empty or deleted products */
        var total = 0;
        var prodamount = 0;
        $.each(obj, function (index, product) {
            if (!$.isEmptyObject(product) && product.deleted !== 'yes') {
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
    var el = $('.t1002__wishlisticon');

    if (twishlist['total'] == 1) {
        el.css('opacity', 0);
        el.animate({
            opacity: 1
        }, 300);
    }

    if (twishlist.products !== undefined && twishlist.products.length > 0 && twishlist['total'] > 0) {
        el.addClass('t1002__wishlisticon_showed');
        el.find('.t1002__wishlisticon-counter').html(twishlist['total']);
    } else {
        el.removeClass('t1002__wishlisticon_showed');
        el.find('.t1002__wishlisticon-counter').html('');
    }

    if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
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

function twishlist__openCart() {
    $('.t1002__wishlisticon').removeClass('t1002__wishlisticon_showed');
    $('body').addClass('t1002__body_wishlistwinshowed');

    if (window.tildaForm.hideErrors !== undefined) {
        window.tildaForm.hideErrors($('.t1002 .t-form'));
    }

    setTimeout(function () {
        twishlist__lockScroll();
    }, 500);

    /* sync products object from ls to obj */
    twishlist__syncProductsObject__LStoObj();

    /* update products in the wishlist */
    twishlist__updateProductsPrice();

    var el = $('.t1002__wishlistwin');
    el.css('opacity', 0);
    el.addClass('t1002__wishlistwin_showed');
    el.animate({
        opacity: 1
    }, 300);
    twishlist__reDrawProducts();
    $(document).keyup(twishlist__keyUpFunc);
    if (window.lazy === 'y' || $('#allrecords').attr('data-tilda-lazy') === 'yes') {
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

function twishlist__reDrawProducts() {
    var el = $('.t1002__wishlistwin-products');

    /* remove empty or deleted products */
    if (window.twishlist['products'] !== undefined) {
        var obj = [];
        var oldCountProducts = window.twishlist['products'].length;
        $.each(window.twishlist['products'], function (index, product) {
            if (!$.isEmptyObject(product) && product.deleted !== 'yes' && product.quantity > 0) {
                obj.push(product);
            }
        });
        window.twishlist['products'] = obj;
        var actualCountProducts = window.twishlist['products'].length;
        if (actualCountProducts !== oldCountProducts) {
            twishlist__saveLocalObj();
        }
    }

    var flag_hasimg = '';
    if (obj.length > 0) {
        $.each(obj, function (index, product) {
            if (product['img'] != '') {
                flag_hasimg = 'yes';
            }
        });
    }

    if (obj.length > 0) {
        var str = '';
        $.each(obj, function (index, product) {
            str += '<div class="t1002__product" data-wishlist-product-i="' + index + '">';
            if (flag_hasimg == 'yes') {
                str += '<div class="t1002__product-thumb"><div class="t1002__product-imgdiv"' + (product['img'] !== '' ? 'style="background-image:url(\'' + product['img'] + '\');"' : '') + '></div></div>';
            }
            str += '<div class="t1002__product-title t-descr t-descr_sm">';
            if (product.url) {
                str += '<a style="color: inherit" target="_blank" href="' + product.url + '">' + product['name'] + '</a>';
            } else {
                str += product['name'];
            }

            if (typeof product.options != 'undefined' && product.options.length > 0) {
                str += '<div class="t1002__product-title__option">';
                $.each(product.options, function (o_index, option) {
                    str += '<div>' + option['option'] + ': ' + option['variant'] + '</div>';
                });
                str += '</div>';
            }
            if (typeof product['sku'] != 'undefined' && product['sku'] != '') {
                str += '<div class="t1002__product-title__option">';
                str += product['sku'];
                str += '</div>';
            }

            if (product.portion > 0) {
                str += '<div class="t1002__product-title__portion">';
                str += twishlist__showPrice(product.price) + '/';
                if (product.portion !== '1') {
                    str += product.portion + ' ';
                }
                str += t_store_dict(product.unit) + '</div>';
            }

            str += '</div>';

            if (product.portion > 0) {
                str += '<div class="t1002__product-amount--portion t-descr t-descr_sm">';
                if (product.amount > 0) {
                    str += '<span class="t1002__product-amount">' + twishlist__showPrice(product.amount) + '</span>';
                    str += '<span class="t1002__product-portion">' + twishlist__showWeight(product.quantity * product.portion, product.unit) + '</span>';
                }
                str += '</div>';
            } else {
                str += '<div class="t1002__product-amount t-descr t-descr_sm">';
                if (product.amount > 0) {
                    str += twishlist__showPrice(product.amount);
                }
                str += '</div>';
            }

            str += '<div class="t1002__product-del"><img src="https://static.tildacdn.com/lib/linea/1bec3cd7-e9d1-2879-5880-19b597ef9f1a/arrows_circle_remove.svg" style="width:20px;height:20px;border:0;"></div>';
            str += '</div>';
        });
        el.html(str);
        twishlist__addEvents__forProducts();
    } else {
        el.html('');
        // twishlist__closeCart();
    }
}

function twishlist__addEvents__forProducts() {
    $('.t1002__product-del').click(function () {
        twishlist__product__del($(this));
    });
}

function twishlist__closeCart() {
	var twishlist = window.twishlist;
    $('body').removeClass('t1002__body_wishlistwinshowed');
	
    /*fix IOS11 cursor bug + general IOS background scroll*/
    twishlist__unlockScroll();
	
    if (twishlist.products !== undefined && twishlist.products.length > 0 && twishlist['total'] > 0) {
		$('.t1002__wishlisticon').addClass('t1002__wishlisticon_showed');
    } else {
		$('.t1002__wishlisticon').removeClass('t1002__wishlisticon_showed');
    }
	
    twishlist__delZeroquantity_inCartObj();
	
    $(document).unbind('keyup', twishlist__keyUpFunc);
	
    $('.t1002__wishlisticon').removeClass('t1002__wishlisticon_neworder');
    $('.t1002__wishlistwin').animate({
		opacity: 0
    }, 300);
	
    setTimeout(function () {
		$('.t1002__wishlistwin').removeClass('t1002__wishlistwin_showed');
        $('.t1002__wishlistwin').css('opacity', '1');
    }, 300);
	
    if (window.twishlist_success == 'yes') {
		location.reload();
    }
	$('body').trigger('twishlist_addbtn');
}

function twishlist__keyUpFunc(e) {
    if (e.keyCode == 27) {
        twishlist__closeCart();
    }
}

function twishlist__product__del(thiss) {
    var el = thiss.closest('.t1002__product');
    var i = el.attr('data-wishlist-product-i');

	var title = el.find('.t1002__product-title a').text() || el.find('.t1002__product-title').contents().eq(0).text();
	var height = el.outerHeight();
	var products = $(el).closest('.t1002__wishlistwin-products');
	var product;

	/* add timer */
	var deleted = products.find('.t1002__product-deleted[data-wishlist-product-i="' + i + '"]');
	if (deleted.length === 0) {
		$(el).after('<div class="t1002__product-deleted" data-wishlist-product-i="' + i + '" style="display: none">\
			<div class="t1002__product-deleted-wrapper" colspan="5">\
				<div class="t1002__product-deleted__timer t-descr">\
					<div class="t1002__product-deleted__timer__left">\
						<div class="t1002__product-deleted__timer__counter">\
							<span class="t1002__product-deleted__timer__counter__number">4</span>\
							<svg class="t1002__product-deleted__timer__counter__circle">\
								<circle r="10" cx="12" cy="12"></circle>\
							</svg>\
						</div>\
						<div class="t1002__product-deleted__timer__title">' + twishlist_dict('youRemoved') + ' "' + title + '"</div>\
					</div>\
					<div class="t1002__product-deleted__timer__return">' + twishlist_dict('undo') + '</div>\
				</div>\
			</div>\
		</div>');
		deleted = products.find('.t1002__product-deleted[data-wishlist-product-i="' + i + '"]');

		/* save product & remove in wishlist */
		$(el).fadeOut(200, function () {
			product = $(this).detach();
			$(deleted).fadeIn(200).css('height', height);
		});

		/* add plug */
		window.twishlist.products[i].deleted = 'yes';

		/* update wishlist status */
		twishlist__updateTotalProductsinCartObj();
		$('.t1002__wishlisticon-counter').html(window.twishlist.total);
		twishlist__saveLocalObj();

		/* count products in window.twishlist */
		var productsLength = window.twishlist.products.filter(function (el) {
			if ($.isEmptyObject(el) || el.deleted === 'yes' || el.quantity === 0) {
				return false;
			} else {
				return true;
			}
		}).length;

		/* start timer */
		var timerOut = setInterval(function () {
			var countdown = $(deleted).find('.t1002__product-deleted__timer__counter__number');
			var count = $(countdown).text();

			if (!$('.t1002__wishlistwin').hasClass('t1002__wishlistwin_showed')) {
				clearInterval(timerOut);
			}

			if (count > 1) {
				$(countdown).text(parseInt(count, 10) - 1);
			} else {
				clearInterval(timerOut);
				$(deleted).fadeOut(200, function () {
					var attr = $(deleted).attr('data-clicked');
					if (attr !== 'yes') {
						if (window.twishlist.products[i] !== undefined && window.twishlist.products[i].deleted === 'yes') {
							$(this).remove();
							window.twishlist.products[i] = {};
							if (products.find('.t1002__product-deleted').length === 0) {
								if ($.isEmptyObject(window.twishlist.products[i])) {
									window.twishlist.products.splice(i, 1);
									twishlist__reDrawProducts();
								}
							}
							twishlist__saveLocalObj();
						}
					}

					var productsLength = window.twishlist.products.filter(function (el) {
						if ($.isEmptyObject(el)) {
							return false;
						} else {
							return true;
						}
					}).length;

					if (window.twishlist.products.length === 0 || productsLength === 0) {
						twishlist__closeCart();
					}
				});
			}
		}, 1000);

		/* restore product */
		$(deleted).find('.t1002__product-deleted__timer__return').one('click', function () {
			$(deleted).attr('data-clicked', 'yes');
			clearInterval(timerOut);
			$(deleted).fadeOut(200, function () {
				$(this).after($(product));
				$(product).fadeIn(200, function () {
					$(this).removeAttr('style');
				});
				$(this).remove();
			});

			if (window.twishlist.products[i] === undefined) {
				twishlist__reDrawProducts();
				var productsLength = window.twishlist.products.filter(function (el) {
					if ($.isEmptyObject(el)) {
						return false;
					} else {
						return true;
					}
				}).length;

				if (window.twishlist.products.length === 0 || productsLength === 0) {
					twishlist__closeCart();
				}
			} else {
				delete window.twishlist.products[i].deleted;
			}
			
			twishlist__updateTotalProductsinCartObj();
			$('.t1002__wishlisticon-counter').html(window.twishlist.total);
			twishlist__saveLocalObj();
		});
	}
	$('body').trigger('twishlist_addbtn');
}

function twishlist__delZeroquantity_inCartObj() {
    var obj = window.twishlist['products'];
    var flag_ismod = '';
    if (obj.length > 0) {
        $.each(obj, function (index, product) {
            if (typeof product != 'undefined' && product['quantity'] == 0) {
                window.twishlist.products.splice(index, 1);
                flag_ismod = 'yes';
            }
        });
    }
    if (flag_ismod == 'yes') {
        twishlist__saveLocalObj();
    }
}

function twishlist__drawBottomTotalAmount() {
    var str = '';
    str += '<div class="t1002__wishlistwin-totalamount-wrap t-descr t-descr_xl">';

    str += '<div class="t1002__wishlistwin-totalamount-info" style="margin-top: 10px; font-size:14px; font-weight:400;"></div>';

    str += '<span class="t1002__wishlistwin-totalamount-label">' + twishlist_dict('total') + ': ' + '</span>';
    str += '<span class="t1002__wishlistwin-totalamount"></span>';
    str += '</div>';
    $('.t1002 .t-form__errorbox-middle').before(str);
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
    if (typeof price == 'undefined' || price == '' || price == 0) {
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
    if (typeof price == 'undefined' || price == '' || price == 0) {
        price = 0;
    } else {
        price = parseFloat(price).toFixed(2);
        price = parseFloat(price);
        price = price * 1;
        if (price < 0) price = 0;
    }
    return price;
}

function twishlist__showWeight(weight, unit) {
    if (!isNaN(parseInt(weight, 10))) {
        var convertedUnits = {
            lites: {
                value: 1000,
                units: ['MLT', 'LTR'],
            },
            gramms: {
                value: 1000,
                units: ['MGM', 'GRM', 'KGM', 'TNE'],
            },
            meters: {
                value: 10,
                units: ['MMT', 'CMT', 'DMT', 'MTR'],
            },
        };

        var pos = -1;
        var key = '';

        Object.keys(convertedUnits).forEach(function (el) {
            var index = convertedUnits[el].units.indexOf(unit);
            if (index >= 0) {
                pos = index;
                key = el;
            }
        });

        if (pos >= 0 && key !== '') {
            var value = convertedUnits[key].value;
            for (var i = pos + 1; i < convertedUnits[key].units.length; i++) {
                if (weight > value) {
                    weight /= value;
                    unit = convertedUnits[key].units[i];
                }
            }
        }

        return twishlist__roundPrice(weight) + ' ' + t_store_dict(unit);
    } else {
        return '';
    }
}

function twishlist__showPrice(price) {
    if (typeof price == 'undefined' || price == 0 || price == '') {
        price = '';
    } else {
        price = price.toString();

        if (typeof window.twishlist['currency_dec'] != 'undefined' && window.twishlist['currency_dec'] == '00') {
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

        if (typeof window.twishlist['currency_sep'] != 'undefined' && window.twishlist['currency_sep'] == ',') {
            price = price.replace('.', ',');
        }
        price = window.twishlist['currency_txt_l'] + price + window.twishlist['currency_txt_r'];
    }
    return price;
}

/*fix IOS11 cursor bug + general IOS background scroll*/
function twishlist__lockScroll() {
    if (window.isiOS && !window.MSStream) {
        if (window.isiOSVersion !== '' && window.isiOSVersion !== undefined) {
            if (window.isiOSVersion[0] === 11) {
                var body = $('body');
                if (!body.hasClass('t-body_scroll-locked')) {
                    var bodyScrollTop =
                        typeof window.pageYOffset !== 'undefined' ?
                        window.pageYOffset :
                        (document.documentElement || document.body.parentNode || document.body).scrollTop;
                    body.addClass('t-body_scroll-locked');
                    body.css('top', '-' + bodyScrollTop + 'px');
                    body.attr('data-popup-scrolltop', bodyScrollTop);
                }
            }
        }
    }
}

function twishlist__unlockScroll() {
    if (window.isiOS && !window.MSStream) {
        if (window.isiOSVersion !== '' && window.isiOSVersion !== undefined) {
            if (window.isiOSVersion[0] === 11) {
                var body = $('body');
                if (body.hasClass('t-body_scroll-locked')) {
                    var bodyScrollTop = $('body').attr('data-popup-scrolltop');
                    body.removeClass('t-body_scroll-locked');
                    body.css('top', '');
                    body.removeAttr('data-popup-scrolltop');
                    window.scrollTo(0, bodyScrollTop);
                }
            }
        }
    }
}

function twishlist__clearProdUrl() {
    try {
        var curUrl = window.location.href;
        /* check standart product url */
        var indexToRemove = curUrl.indexOf('#!/tproduct/');
        if (window.isiOS && indexToRemove < 0) {
            indexToRemove = curUrl.indexOf('%23!/tproduct/');
            if (indexToRemove < 0) {
                indexToRemove = curUrl.indexOf('#%21%2Ftproduct%2F');
            }
        }
        /* check catalog product url */
        if (indexToRemove < 0) {
            twishlist__onFuncLoad('t_store_closePopup', function () {
                t_store_closePopup(false);
            });
        }
        if (indexToRemove < 0) {
            return;
        }
        /* change url */
        curUrl = curUrl.substring(0, indexToRemove);
        if (typeof history.replaceState != 'undefined') {
            try {
                window.history.replaceState('', '', curUrl);
            } catch (e) { /* */ }
        }
    } catch (e) { /* */ }
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