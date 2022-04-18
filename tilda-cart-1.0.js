/**
 * Блок ST100, находится в категории "Магазин"
 * Скрипт добавляет на страницу виджет корзины. Список товаров хранится в localStorage.
 * Используется вместе с блоками товаров (ST***)
 */

// eslint-disable-next-line no-unused-vars
function tcart__init(recid, ymapApiKey) {
    window.tcart__ymapApiKey = ymapApiKey;
    var cartBlock = document.querySelector('.t706');
	var cartBlocksLength = document.querySelectorAll('.t706').length;
	var rec = document.querySelector('#rec' + recid);

    // предотвращает несколько инициализаций
    if (window.tcart_initted === 'yes' && cartBlocksLength > 1) {
        var errorText = window.browserLang === 'RU' ? 'Ошибка: На странице присутствуют ' + cartBlocksLength + ' виджета корзины (блок ST100). Пожалуйста, удалите дубликаты. Блоки могут находиться на странице Header или Footer.' : 'Error: ' + cartBlocksLength + ' cart widgets (block ST100) on the page. Remove a duplicate. Blocks can be on the Header or Footer page.';

        if (!document.querySelector('.t706__previewmode-infobox .t706__previewmode-infobox-error')) {
			Array.prototype.forEach.call(document.querySelectorAll('.t706__previewmode-infobox center'), function(infobox) {
				infobox.insertAdjacentHTML('beforeend', '<div class="t706__previewmode-infobox-error" style="color:red">' + errorText + '</div>');
			});
        }

        if (window.tcart_erroralert === undefined) {
            alert(errorText);
            window.tcart_erroralert = 'yes';
            // eslint-disable-next-line no-console
            console.error('Error: Two cart widgets (block ST100) on the page. Remove a duplicate.');
        }

        return;
    }

    var dontStore = cartBlock.getAttribute('data-cart-dontstore');
    if (dontStore == 'y') window.tcart_dontstore = 'y';

    var isOneProduct = cartBlock.getAttribute('data-cart-oneproduct');
    if (isOneProduct == 'y') window.tcart_oneproduct = 'y';

    var maxStoreDays = cartBlock.getAttribute('data-cart-maxstoredays');
    if (maxStoreDays) window.tcart_maxstoredays = maxStoreDays;

    // stat
    var sendEvent = cartBlock.getAttribute('data-cart-sendevent-onadd');
    if (sendEvent == 'y') window.tcart_sendevent_onadd = 'y';

    window.tcart_initted = 'yes';

    tcart__drawBottomTotalAmount();
    tcart__loadLocalObj();
    tcart__reDrawCartIcon();
    tcart__addEvent__links();
    tcart__addEvents();

    // Если перейти из списка товаров в товар в сниппете, положить его в корзину и вернуться назад на страницу, то иконка останется со старым значением, нужно обновить
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            tcart__loadLocalObj();
            tcart__reDrawCartIcon();
        }
    }, false);

    setTimeout(function () {
        tcart__addEvent__selectpayment();
        var hash = decodeURIComponent(document.location.hash);
		// добавление в корзину с любой кнопки по ссылке
        if (hash.indexOf('#order:') !== -1) {
            var customCartBtn = document.querySelector('a[href="' + hash + '"]');
            customCartBtn.click();
        }
    });

    // отключает эффект появления при скролле
    rec.setAttribute('data-animationappear', 'off');
    rec.style.opacity = '1';

	var prodAmountLabel = cartBlock.querySelector('.t706__cartwin-prodamount-label');
	var totalAmountLabel = cartBlock.querySelector('.t706__cartwin-totalamount-label');
    if (cartBlock.querySelector('.t-input-group_dl')) {
        if (prodAmountLabel) prodAmountLabel.innerHTML = tcart_dict('subtotal') + ': ';
        if (totalAmountLabel) totalAmountLabel.innerHTML = tcart_dict('grandTotal') + ': ';
    } else {
        if (prodAmountLabel) prodAmountLabel.innerHTML = tcart_dict('total') + ': ';
        if (totalAmountLabel) totalAmountLabel.innerHTML = tcart_dict('total') + ': ';
    }

    // добавляет дефолтный заголовок для попапа
	var cartHeading = cartBlock.querySelector('.t706__cartwin-heading');
    if (cartHeading.innerHTML == '') cartHeading.innerHTML = tcart_dict('yourOrder') + ':';

    // добавляет дефолтный текст для кнопки подтверждения заказа
	var cartSubmitBtn = cartBlock.querySelector('.t-form__submit .t-submit');
    if (cartSubmitBtn.innerHTML == 'Submit') cartSubmitBtn.innerHTML = tcart_dict('submitOrder');

    // добавляет дефолтный заголовок для payment method, если он существует
	var cartPaymentMethodInput = cartBlock.querySelector('.t-input-group_pm');
    if (cartPaymentMethodInput) cartPaymentMethodInput.querySelector('.t-input-title').innerHTML = tcart_dict('paymentMethod');

	var cartSubmit = cartBlock.querySelector('.t-form__submit');
	var cartMinimal = cartBlock.querySelector('.t706__minimal');
	if (cartSubmit && cartMinimal) {
		cartSubmit.addEventListener('mouseenter', function() {
			cartMinimal.classList.add('active');
		});
		cartSubmit.addEventListener('mouseleave', function() {
			cartMinimal.classList.remove('active');
		});
	}
}

function tcart_dict(msg) {
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

    dict['subtotal'] = {
        EN: 'Subtotal',
        RU: 'Сумма',
        FR: 'Sous-total',
        DE: 'Zwischensumme',
        ES: 'Subtotal',
        PT: 'Subtotal',
        JA: '小計',
        ZH: '小计。',
        UK: 'Сума',
        PL: 'Suma',
        KK: 'Қорытынды',
        IT: 'Totale parziale',
        LV: 'Kopējā summa',
    };

    dict['grandTotal'] = {
        EN: 'Total',
        RU: 'Итоговая сумма',
        FR: 'Total',
        DE: 'Gesamtsumme',
        ES: 'Total',
        PT: 'Total',
        JA: '合計',
        ZH: '总额。',
        UK: 'Загальна сума',
        PL: 'Suma łącznie',
        KK: 'Жалпы',
        IT: 'Totale',
        LV: 'Kopējā summa',
    };

    dict['yourOrder'] = {
        EN: 'Your order',
        RU: 'Ваш заказ',
        FR: 'Votre commande',
        DE: 'Ihre Bestellung',
        ES: 'Su pedido',
        PT: 'Seu pedido',
        JA: '注文済',
        ZH: '你的订货。',
        UK: 'Ваше замовлення',
        PL: 'Twoje zamówienie',
        KK: 'Сіздің тапсырысыңыз',
        IT: 'Il tuo ordine',
        LV: 'Jūsu pasūtījums',
    };

    dict['submitOrder'] = {
        EN: 'Submit order',
        RU: 'Оформить заказ',
        FR: 'Commander',
        DE: 'Bestellung abschicken',
        ES: 'Enviar pedido',
        PT: 'Enviar pedido',
        JA: '注文を確定',
        ZH: '办妥订货。',
        UK: 'Оформити замовлення',
        PL: 'Zamów',
        KK: 'Өтінімді',
        IT: 'Inviare ordine',
        LV: 'Iesniegt pasūtījumu',
    };

    dict['paymentMethod'] = {
        EN: 'Payment method',
        RU: 'Способ оплаты',
        FR: 'Mode de paiement',
        DE: 'Zahlungsmethode',
        ES: 'Método de pago',
        PT: 'Método de pagamento',
        JA: '支払方法',
        ZH: '付款方式。',
        UK: 'Спосіб оплати',
        PL: 'Sposób płatności',
        KK: 'Төлем тәсілі',
        IT: 'Metodo di pagamento',
        LV: 'Apmaksas veids',
    };

    dict['clickToOrder'] = {
        EN: 'Click to order',
        RU: 'Оформить заказать',
        FR: 'Commander',
        DE: 'Bestellung abschicken',
        ES: 'Enviar pedido',
        PT: 'Enviar pedido',
        JA: '注文を確定',
        ZH: '提交订单。',
        UK: 'Оформити замовлення',
        PL: 'Zamów',
        KK: 'Бұйрығына басыңыз',
        IT: 'Clicca per ordine',
        LV: 'Uzklikšķiniet pasūtījuma',
    };

    dict['subtotalDiscount'] = {
        EN: 'Subtotal with discount',
        RU: 'Сумма со скидкой',
        FR: 'Sous-total avec remise',
        DE: 'Zwischensumme mit Rabatt',
        ES: 'Subtotal con descuento',
        PT: 'Subtotal com desconto',
        JA: '割引後小計',
        ZH: '减价同小计。',
        UK: 'Сума зі знижкою',
        PL: 'Suma z rabatem',
        KK: 'Жеңілдікпен Қорытынды',
        IT: 'Totale parziale con lo sconto',
        LV: 'Atlaides summa',
    };

    dict['promoCode'] = {
        EN: 'Promo code',
        RU: 'Промокод',
        FR: 'Code promo',
        DE: 'Aktionscode',
        ES: 'Código promocional',
        PT: 'Código promocional',
        JA: 'プロモコード',
        ZH: '促销代码。',
        UK: 'Промокод',
        PL: 'Kod rabatowy',
        KK: 'Промокод',
        IT: 'Codice promozionale',
        LV: 'Promo kods',
    };

    dict['discount'] = {
        EN: 'Discount',
        RU: 'Скидка',
        FR: 'Remise',
        DE: 'Rabatt',
        ES: 'Descuento',
        PT: 'Desconto',
        JA: '割引',
        ZH: '减价。',
        UK: 'Знижка',
        PL: 'Rabat',
        KK: 'Жеңілдік',
        IT: 'Sconto',
        LV: 'Atlaide',
    };

    dict['minimumOrder'] = {
        EN: 'Minimum order',
        RU: 'Минимальный заказ',
        FR: 'Commande minimale',
        DE: 'Minimale Bestellung',
        ES: 'Pedido mínimo',
        PT: 'Pedido mínimo',
        JA: '最小注文価格',
        ZH: '最小的订货。',
        UK: 'Мінімальне замовлення',
        PL: 'Minimalne zamówienie',
        KK: 'Ең аз тапсырыс',
        IT: 'Ordine minimo',
        LV: 'Minimālais pasūtījuma',
    };

    dict['minimumQuantity'] = {
        EN: 'Minimum order quantity',
        RU: 'Минимальное количество в заказе',
        FR: 'Quantité de commande minimale',
        DE: 'Mindestbestellmenge',
        ES: 'Cantidad mínima del pedido',
        PT: 'Quantidade mínima por pedido',
        JA: '最小注文数',
        ZH: '最小的总数。',
        UK: 'Мінімальна кількість у замовленні',
        PL: 'Minimalna ilość w zamówieniu',
        KK: 'Ең аз тапсырыс саны',
        IT: 'Quantità di ordine minimo',
        LV: 'Minimālais pasūtījuma daudzums',
    };

    dict['limitReached'] = {
        EN: 'Sorry, limit has been reached. This is the maximum quantity of goods in stock',
        RU: 'Извините, достигнут лимит. Это максимально возможное количество товаров в наличии',
        FR: 'Désolé, la limite a été atteinte. Il s\'agit de la quantité maximale de marchandises en stock',
        DE: 'Entschuldigung, das Limit wurde erreicht. Dies ist die maximale Menge an Waren auf Lager',
        ES: 'Lo sentimos, se ha alcanzado el límite. Esta es la cantidad máxima de productos en stock',
        PT: 'Desculpe, o limite foi atingido. Esta é a quantidade máxima de bens em stock',
        JA: '申し訳ありませんが、上限に達しました。これは、商品の在庫の最大数量です',
        ZH: '对不起，已经达到极限。这是库存货物的最大数量',
        UK: 'Вибачте, досягнутий ліміт. Це максимально можлива кількість товарів в наявності',
        PL: 'Przepraszamy, osiągnięto limit. Jest to maksymalna ilość dostępnego towaru',
        KK: 'Кешіріңіз, шегі қол жеткізілді. Бұл қоймада тауарлардың барынша саны',
        IT: 'Siamo spiacenti, il limite è stato raggiunto. Questa è la quantità massima di merce in magazzino',
        LV: 'Diemžēl ierobežojums ir sasniegts. Tas ir maksimālais iespējamais preču skaits noliktavā',
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

    /* units */
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

function tcart__nullObj() {
    var tcart = {};
    tcart['products'] = [];
    tcart['prodamount'] = 0;
    tcart['amount'] = 0;
    tcart['system'] = '';
    return tcart;
}

/**
 * Загружает корзину из localStorage, устанавливает отображение валюты
 */
function tcart__loadLocalObj() {
    var dataJsonStr = null;
    var timestamp;
    var delta;

    if (typeof localStorage === 'object') {
        try {
            dataJsonStr = localStorage.getItem('tcart');
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Your web browser does not support storing a Cart data locally.');
        }
    }

    if (dataJsonStr === null) {
        window.tcart = tcart__nullObj();
    } else {
        window.tcart = JSON.parse(dataJsonStr);
    }

    // удаляет из window.tcart пустые или удаленные товары
    if (window.tcart['products'] !== undefined) {
        var actualProductsObj = [];
        var oldCountProducts = window.tcart['products'].length;
        window.tcart['products'].forEach(function (product) {
            if (!tcart__isEmptyObject(product) && product.deleted !== 'yes') {
                actualProductsObj.push(product);
            }
        });
        window.tcart['products'] = actualProductsObj;
        var actualCountProducts = window.tcart['products'].length;
        if (actualCountProducts !== oldCountProducts) {
            tcart__saveLocalObj();
        }
    }

    // проверяет срок хранения в корзине
    if (window.tcart_maxstoredays) {
        var maxStoreDays = parseInt(window.tcart_maxstoredays);
        if (maxStoreDays > 0) {
            if (window.tcart.updated > 0) {
                timestamp = Math.floor(Date.now() / 1000);
                delta = timestamp * 1 - window.tcart.updated * 1;
                if (delta > 60 * 60 * 24 * maxStoreDays) {
                    if (typeof localStorage === 'object') {
                        window.tcart.products = [];
                        localStorage.setItem('tcart', JSON.stringify(window.tcart));
                    }
                    window.tcart = tcart__nullObj();
                }
            }
        } else if (maxStoreDays === 0) {
            window.tcart = tcart__nullObj();
        }
    } else if (window.tcart.updated > 0) {
        timestamp = Math.floor(Date.now() / 1000);
        delta = timestamp * 1 - window.tcart.updated * 1;
        if (delta > 60 * 60 * 24 * 30) {
            window.tcart = tcart__nullObj();
        }
    }

    if (window.tcart_dontstore === 'y') {
        window.tcart = tcart__nullObj();
    }

    // устанавливает дефолтное отображение валюты
    delete window.tcart['currency'];
    delete window.tcart['currency_txt'];
    delete window.tcart['currency_txt_l'];
    delete window.tcart['currency_txt_r'];
    delete window.tcart['currency_side'];
    delete window.tcart['currency_sep'];
    delete window.tcart['currency_dec'];
    window.tcart['currency'] = '$';
    window.tcart['currency_side'] = 'l';
    window.tcart['currency_sep'] = '.';
    window.tcart['currency_dec'] = '';

    if (window.tcart['delivery']) delete window.tcart['delivery'];
    if (window.tcart['promocode']) delete window.tcart['promocode'];

	// если валюта задана в настройках user payment
    /*
	var pc=$('.t706').attr('data-userpayment-currency');
	if(typeof pc!='undefined' && pc!=''){
		window.tcart['currency']=pc;
	}
	*/

    //////
    // если валюта задана в настройках проекта:
	var cartBlock = document.querySelector('.t706');
    var paymentCurrency = cartBlock.getAttribute('data-project-currency');
    if (paymentCurrency) window.tcart['currency'] = paymentCurrency;

    // название валюты
    window.tcart['currency_txt'] = window.tcart['currency'];

    // расположение значка валюты
    var projectCurrency = cartBlock.getAttribute('data-project-currency-side');
    if (projectCurrency == 'r') window.tcart['currency_side'] = 'r';

    if (window.tcart['currency_side'] == 'l') {
        window.tcart['currency_txt_l'] = window.tcart['currency_txt'] + '';
        window.tcart['currency_txt_r'] = '';
    } else {
        window.tcart['currency_txt_r'] = ' ' + window.tcart['currency_txt'];
        window.tcart['currency_txt_l'] = '';
    }

    // десятичный разделитель
    projectCurrency = cartBlock.getAttribute('data-project-currency-sep');
    if (projectCurrency == '.' || projectCurrency == ',') {
        window.tcart['currency_sep'] = projectCurrency;
    } else if (window.tcart['currency'] == '$' || window.tcart['currency'] == '€' || window.tcart['currency'] == 'USD' || window.tcart['currency'] == 'EUR') {
        window.tcart['currency_sep'] = '.';
    } else {
        window.tcart['currency_sep'] = ',';
    }

    // десятичный формат
    projectCurrency = cartBlock.getAttribute('data-project-currency-dec');
    if (projectCurrency == '00') {
        window.tcart['currency_dec'] = projectCurrency;
    } else {
        window.tcart['currency_dec'] = '';
    }

	// добавляет платежную систему
    delete window.tcart['system'];
    var paymentSystem = cartBlock.getAttribute('data-payment-system');
	window.tcart['system'] = paymentSystem ? paymentSystem : 'none';

    // минимальная сумма заказа
    var minimumOrderAmount = cartBlock.getAttribute('data-cart-minorder');
    if (minimumOrderAmount > 0 && window.tcart_minorder) {
        minimumOrderAmount = minimumOrderAmount * 1;
        window.tcart_minorder = minimumOrderAmount;
		var minimumOrderHtml = '<div class="t706__cartwin-prodamount-minorder t706__minimal"><span>' + tcart_dict('minimumOrder') + ': ' + tcart__showPrice(minimumOrderAmount) + '</span></div>';
		var minimumOrderErrorHtml = '<p data-rule-filled="true" class="t-form__errorbox-item js-rule-error js-rule-error-minorder" style="display: none;">' + tcart_dict('minimumOrder') + ': ' + tcart__showPrice(minimumOrderAmount) + '</p>';
        document.querySelector('.t706__cartwin-prodamount-wrap').insertAdjacentHTML('afterbegin', minimumOrderHtml);
        document.querySelector('.t706__cartwin-totalamount-wrap').insertAdjacentHTML('afterbegin', minimumOrderHtml);
        document.querySelector('.js-errorbox-all .t-form__errorbox-text').insertAdjacentHTML('beforeend', minimumOrderErrorHtml);
    }

    // минимальное количество товара
    var minimumQuantity = cartBlock.getAttribute('data-cart-mincntorder');
    if (minimumQuantity > 0 && window.tcart_mincntorder) {
        minimumQuantity = minimumQuantity * 1;
        window.tcart_mincntorder = minimumQuantity;
		var minimumQuantityHtml = '<div class="t706__cartwin-prodamount-mincntorder t706__minimal"><span>' + tcart_dict('minimumQuantity') + ': ' + minimumQuantity + '</span></div>';
		var minimumQuantityErrorHtml = '<p data-rule-filled="true"  class="t-form__errorbox-item js-rule-error js-rule-error-minquantity" style="display: none;">' + tcart_dict('minimumQuantity') + ': ' + minimumQuantity + '</p>';
        document.querySelector('.t706__cartwin-prodamount-wrap').insertAdjacentHTML('afterbegin', minimumQuantityHtml);
        document.querySelector('.t706__cartwin-totalamount-wrap').insertAdjacentHTML('afterbegin', minimumQuantityHtml);
        document.querySelector('.js-errorbox-all .t-form__errorbox-text').insertAdjacentHTML('beforeend', minimumQuantityErrorHtml);
    }

    tcart__addDelivery();
    tcart__updateTotalProductsinCartObj();
}

/**
 * Сохраняет объект window.tcart в localStorage, обновляет дату изменения
 */
function tcart__saveLocalObj() {
    if (window.tcart_newDeliveryActive && window.tcart.amount && window.tcart.total) {
        tcart__rerenderDeliveryServices();
    }

    if (window.tcart_dontstore === 'y') return;
    if (typeof window.tcart_maxstoredays != 'undefined' && window.tcart_maxstoredays == 0) return;
    if (typeof window.tcart === 'object') {
        window.tcart.updated = Math.floor(Date.now() / 1000);
        var dataJsonStr = JSON.stringify(window.tcart);

        if (typeof localStorage === 'object') {
            try {
                localStorage.setItem('tcart', dataJsonStr);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Your web browser does not support storing a Cart data locally.');
            }
        }
    }
}

/**
 * Синхронизирует товары в объекте window.tcart и localStorage
 */
function tcart__syncProductsObject__LStoObj() {
    if (window.tcart_dontstore === 'y') return;
    if (typeof window.tcart_maxstoredays != 'undefined' && window.tcart_maxstoredays == 0) return;

    if (typeof localStorage === 'object') {
        try {
            var lsJsonStr = localStorage.getItem('tcart');
            var lsJsonObj = JSON.parse(lsJsonStr);
            if (typeof lsJsonObj['products'] === 'object') {

                // удаляет из window.tcart пустые или удаленные товары
                var actualProductsObj = [];
                var oldCountProducts = lsJsonObj['products'].length;
                lsJsonObj['products'].forEach(function (product) {
                    if (!tcart__isEmptyObject(product) && product.deleted !== 'yes' && product.quantity > 0) {
                        actualProductsObj.push(product);
                    }
                });
                window.tcart['products'] = actualProductsObj;
                var actualCountProducts = window.tcart['products'].length;
                if (actualCountProducts !== oldCountProducts) {
                    tcart__saveLocalObj();
                }

                tcart__updateTotalProductsinCartObj();
            }
        } catch (e) {
            /* */
        }
    }
}

/**
 * События виджета корзины и localStorage
 */
function tcart__addEvents() {
	var body = document.querySelector('body');

    var cartIcon = document.querySelector('.t706__carticon');
	if (cartIcon) {
		cartIcon.addEventListener('click', function () {
			tcart__openCart();
		});
	}

	body.addEventListener('click', function(e) {
		if (e.target && e.target.closest('a[href="#opencart"]')) {
			tcart__openCart();
			e.preventDefault();
		}
	});

	var cartClose = document.querySelector('.t706__cartwin-close');
	if (cartClose) {
		cartClose.addEventListener('click', function () {
			tcart__closeCart();
		});
	}

    var cartCloseBtn = document.querySelector('.t706__cartwin-closebtn');
	if (cartCloseBtn) {
		cartCloseBtn.addEventListener('click', function () {
			tcart__closeCart();
		});
	}

	if (document.querySelector('.t706 .js-form-proccess')) {
		document.querySelector('.t706 .js-form-proccess').setAttribute('data-formcart', 'y');
	}

    document.querySelector('.t706__cartwin').addEventListener('mousedown', function (e) {
        if (e.target == this) {
            var windowWidth = window.innerWidth;
            var maxScrollBarWidth = 17;
            var windowWithoutScrollBar = windowWidth - maxScrollBarWidth;
            if (e.clientX > windowWithoutScrollBar) {
                return;
            }
            tcart__closeCart();
        }
    });

    // синхронизирует localstorage в разных вкладках
    if (window.tcart_dontstore !== 'y') {
        window.addEventListener('storage', function (e) {
            if (e.isTrusted && !window.clearTCart && !document.hasFocus()) {
                if (e.key === 'tcart') {
                    try {
                        var lsJsonStr = localStorage.getItem('tcart');
                        var lsJsonObj = JSON.parse(lsJsonStr);
                        if (typeof lsJsonObj['products'] == 'object') {
                            window.tcart['products'] = lsJsonObj['products'];
                            tcart__updateTotalProductsinCartObj();
                        }
                    } catch (e) {
                        /* */
                    }

                    tcart__reDrawCartIcon();

                    // перерисовывает товары в открытом окне корзины
                    if (body.classList.contains('t706__body_cartwinshowed')) {
                        if (window.tcart_newDeliveryActive && window.tcart.amount && window.tcart.total) {
                            tcart__rerenderDeliveryServices();
                        }
                        tcart__reDrawProducts();
                        tcart__reDrawTotal();
                    }
                }
            }
        });
    }
}

/**
 * События кнопки добавления в корзину
 */
function tcart__addEvent__links() {
	var recs = document.querySelectorAll('.r');
	var body = document.querySelector('body');
	Array.prototype.forEach.call(recs, function(rec) {
		rec.addEventListener('click', function (e) {
			var cartBtn = e.target.closest('[href^="#order"]') ? e.target.closest('[href^="#order"]') : '';
			if (!cartBtn) return;
			e.preventDefault();
			if (e.target.classList.contains('t1002__addBtn') || e.target.closest('.t1002__addBtn')) {
				return;
			}
			var btnForm = cartBtn.closest('form');
			if (btnForm) {
				var arErrors = window.tildaForm.validate(btnForm);
				if (window.tildaForm.showErrors(btnForm, arErrors)) return false;
			}

			if (cartBtn.getAttribute('data-dbclk-prevent') == 'yes') {
				return;
			} else {
				cartBtn.setAttribute('data-dbclk-prevent', 'yes');
				setTimeout(function () {
					cartBtn.removeAttribute('data-dbclk-prevent');
				}, 1000);
			}

			// закрывает другие попапы
			if (body.classList.contains('t-body_popupshowed') || document.querySelectorAll('.t-popup.t-popup_show').length > 0) {
				body.classList.remove('t-body_popupshowed');
				Array.prototype.forEach.call(document.querySelectorAll('.t-popup'), function(popup) {
					popup.classList.remove('t-popup_show');
				});
				setTimeout(function () {
					Array.prototype.forEach.call(document.querySelectorAll('.t-popup:not(.t-popup_show)'), function(popup) {
						popup.style.display = 'none';
					});
				}, 300);
				tcart__clearProdUrl();
			}

			var cartBtnLink = cartBtn.getAttribute('href');
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

			if (cartBtnLink.substring(0, 7) === '#order:') {
				var productData = cartBtnLink.substring(7);
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
						price = tcart__cleanPrice(price);
					} else {
						name = productData;
					}

					// обрабатывает параметры
					if (typeof imgLink !== 'undefined' && imgLink !== '') {
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
						recid = cartBtn.closest('.r').getAttribute('id') ? cartBtn.closest('.r').getAttribute('id').replace('rec', '') : '';
					}
				}
			}

			var productElement = cartBtn.closest('.js-product');
			if (productElement) {
				if (name == '') {
					name = productElement.querySelector('.js-product-name').textContent || '';
				}
				if (price == '' || price == 0) {
					var elementPrice = productElement.querySelector('.js-product-price');
					if (elementPrice) {
						if (elementPrice.classList.contains('js-store-prod-price-range-val')) {
							price = elementPrice.getAttribute('data-product-price-def');
						} else {
							price = elementPrice.textContent;
						}
					}
					price = tcart__cleanPrice(price);
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
						optionPrice = tcart__cleanPrice(optionPrice);
	
						if (optionName && optionVariant) {
							var optionObj = {};
							if (optionName != '') {
								optionName = tcart__escapeHtml(optionName);
							}
							if (optionVariant != '') {
								optionVariant = tcart__escapeHtml(optionVariant);
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
						optionPrice = tcart__cleanPrice(optionPrice);
	
						if (typeof optionName != 'undefined' && typeof optionVariant != 'undefined') {
							var optionObj = {};
							if (optionName != '') {
								optionName = tcart__escapeHtml(optionName);
							}
							if (optionVariant != '') {
								optionVariant = tcart__escapeHtml(optionVariant);
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

			var productUrl = productElement ? productElement.getAttribute('data-product-url') : '';
			var isOrderButtonActive = productElement ? productElement.querySelector('a[href="#order"]:not(.t-btn)') : '';
			var settedLinkInToProduct = productElement ? productElement.querySelector('.js-product-link:not([href="#prodpopup"]):not([href="#order"])') : '';
			if (settedLinkInToProduct) {
				var settedLinkInToProductHref = settedLinkInToProduct.getAttribute('href');
			}

			if (!productUrl && settedLinkInToProductHref) {
				productUrl = settedLinkInToProductHref;
			} else if (!productUrl && recid && lid && !isOrderButtonActive) {
				productUrl = window.location.origin + window.location.pathname + '#!/tproduct/' + recid + '-' + lid;
			} else if (!productUrl) {
				productUrl = window.location.origin + window.location.pathname + '#rec' + recid;
			}

			if (name == '' && (price == '' || price == 0)) {
				return;
			}

			if (name == '') name = 'NoName';
			if (price == '') price = 0;

			if (name != '') name = tcart__escapeHtml(name);
			if (img != '') img = tcart__escapeHtmlImg(img);

			var productObj = {};
			productObj['name'] = name;
			productObj['price'] = price;
			productObj['img'] = img;
			productObj['recid'] = recid;
			productObj['lid'] = lid;

			productObj['packLabel'] = packLabel;
			productObj['packM'] = packM;
			productObj['packX'] = packX;
			productObj['packY'] = packY;
			productObj['packZ'] = packZ;

			productObj['url'] = productUrl;

			if (options && options.length > 0) {
				productObj['options'] = options;
			}
			if (sku) {
				sku = tcart__escapeHtml(sku);
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

			var quantityBtns = cartBtn.parentElement.querySelector('.t-store__prod__quantity');
			if (quantityBtns) {
				var input = quantityBtns.querySelector('.t-store__prod__quantity-input');
				var count = parseInt(input.value, 10);
				if (!isNaN(count) && count > 0) {
					productObj['quantity'] = count;
					// устанавливает количество по умолчанию
					input.value = 1;
					var changeEvent = new Event('change');
					input.dispatchEvent(changeEvent);
				}
			}

			tcart__addProduct(productObj);

			if (window.tcart_sendevent_onadd == 'y') {
				try {
					Tilda.sendEcommerceEvent('add', [productObj]);
				} catch (e) {
					if (window.Tilda && typeof Tilda.sendEventToStatistics == 'function') {
						var virtPage = '/tilda/cart/add/';
						if (recid > 0) virtPage += recid;
						if (uid && uid > 0) {
							virtPage += '-u' + uid;
						} else if (lid && lid > 0) {
							virtPage += '-' + lid;
						}
						var virtTitle = name;
						var virtPrice = price;
						Tilda.sendEventToStatistics(virtPage, virtTitle, window.location.href, virtPrice);
					}
				}
			}
		});
	});
}

/**
 * Добавляет товар в корзину
 *
 * @param {object} productObj - объект товара
 */
function tcart__addProduct(productObj) {
    var timestamp = Math.floor(Date.now() / 1000);
	var cartIcon = document.querySelector('.t706__carticon');
    tcart__syncProductsObject__LStoObj();

    var products = window.tcart['products'];
    var isInCart = '';

    if (products.length > 0) {
        Array.prototype.forEach.call(products, function(product, index) {
            var isEqualOptions = 'y';
            var isEqualSKU = '';
            if (window.tcart_oneproduct == 'y') {
                if (product['name'] == productObj['name'] && product['price'] == productObj['price']) {
                    if (
                        product['options'] == undefined &&
                        productObj['options'] == undefined &&
                        product['sku'] == undefined &&
                        productObj['sku'] == undefined
                    ) {
                        isInCart = 'yes';
                        return false;
                    }
                    if (
                        product['options'] == undefined &&
                        productObj['options'] == undefined &&
                        product['sku'] != undefined &&
                        productObj['sku'] != undefined &&
                        product['sku'] == productObj['sku']
                    ) {
                        isInCart = 'yes';
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
                            if (parseInt(window.tcart['products'][index]['quantity'], 10) === parseInt(productObj['inv'], 10)) {
                                alert(tcart_dict('limitReached'));
                            }

                            isInCart = 'yes';
                            return false;
                        }
                    }
                }
            } else if (product['name'] == productObj['name'] && product['price'] == productObj['price'] && product.portion == productObj.portion && product.single == productObj.single) {
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
                        } else if (option === undefined || productObj['options'][index] === undefined) {
                            return (isEqualOptions = false);
                        }
                    });
                }

                if (product['sku'] === productObj['sku']) {
                    isEqualSKU = 'y';
                }

                if (isEqualOptions === 'y' && isEqualSKU === 'y') {
                    var inv = parseInt(productObj['inv'], 10);
                    var quantity = parseInt(productObj['quantity'], 10);
                    var quantityInCart = parseInt(window.tcart['products'][index]['quantity'], 10);

                    if (quantityInCart === inv) {
                        alert(tcart_dict('limitReached'));
                        isInCart = 'yes';
                        return false;
                    }

                    if (productObj['quantity'] !== undefined) {
                        if (quantityInCart + quantity > inv) {
                            alert(tcart_dict('limitReached'));
                            isInCart = 'yes';
                            window.tcart['products'][index]['quantity'] = inv;
                        } else {
                            window.tcart['products'][index]['quantity'] += quantity;
                        }
                    } else {
                        window.tcart['products'][index]['quantity']++;
                    }

                    window.tcart['products'][index]['amount'] = window.tcart['products'][index]['price'] * window.tcart['products'][index]['quantity'];
                    window.tcart.products[index]['amount'] = tcart__roundPrice(window.tcart.products[index]['amount']);
                    window.tcart['products'][index]['ts'] = timestamp;
                    isInCart = 'yes';
                    return false;
                }
            }
        });
    }

    if (isInCart == '') {
        if (productObj['quantity'] === undefined) {
            productObj['quantity'] = 1;
            productObj['amount'] = productObj['price'];
        } else {
            productObj['amount'] = tcart__roundPrice(productObj['price'] * productObj['quantity']);
        }
        productObj['ts'] = timestamp;
		if (productObj.pack_m === '' || parseInt(productObj.pack_m, 10) === 0) {
            var gramms = false;
            var index = 0;
            ['GRM', 'KGM', 'TNE'].forEach(function (unit, i) {
                if (unit === productObj.unit) {
                    gramms = true;
                    index = i;
                }
            });

            if (gramms) {
                productObj.pack_m = productObj.portion * Math.pow(1000, index);
            }
        }
        window.tcart['products'].push(productObj);
    }

    tcart__updateTotalProductsinCartObj();
    tcart__reDrawCartIcon();
    tcart__saveLocalObj();

    if (document.querySelector('.t706').getAttribute('data-opencart-onorder') == 'yes') {
        setTimeout(function () {
            tcart__openCart();
        }, 10);
    } else if (cartIcon) {
        cartIcon.classList.add('t706__carticon_neworder');
        setTimeout(function () {
            cartIcon.classList.remove('t706__carticon_neworder');
        }, 2000);
    }
}

/**
 * Обновляет информацию о цене или наличии товара, если они изменились
 */
function tcart__updateProductsPrice() {
    var now = Math.floor(Date.now() / 1000);

    if (window.tcart !== undefined) {
        if (window.tcart.updated !== undefined) {
            var timestamp = parseInt(window.tcart.updated, 10);
            if ((now - timestamp) / (60 * 60) > 12) {
				var dataCart = {};
                dataCart.prodamount = window.tcart.prodamount;
                dataCart.discount = window.tcart.discount;
                dataCart.products = JSON.stringify(window.tcart.products);
                dataCart.amount = window.tcart.amount;
                dataCart.total = window.tcart.total;
                dataCart.updated = window.tcart.updated;


                // Adding a endpoint to the tcart_endpoints object
                if (!window.tcart_endpoint) {
                    window.tcart_endpoint = 'store.tildacdn.com';
                }

                var apiUrl = 'https://' + window.tcart_endpoint + '/api/getpriceproducts/';
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
                                window.tcart.products.forEach(function (product, index) {
                                    var uid = product.uid || product.lid;
                                    if (badUid === uid) {
                                        if (product.options !== undefined && productsArr[i].options !== undefined && productsArr[i].variant !== undefined) {
                                            product.options.forEach(function (option) {
                                                if (option.variant === productsArr[i].variant) {
                                                    window.tcart.products[index].amount = parseFloat(productsArr[i].last_amount);
                                                    window.tcart.products[index].price = parseFloat(productsArr[i].last_price);
                                                    return;
                                                }
                                            });
                                        }

                                        if (product.options === undefined && productsArr[i].options === undefined && productsArr[i].variant === undefined) {
                                            window.tcart.products[index].amount = parseFloat(productsArr[i].last_amount);
                                            window.tcart.products[index].price = parseFloat(productsArr[i].last_price);
                                            return;
                                        }
                                    }
                                });
                            }

                            if (productsArr[i].error === 'LESS_PRODUCTS' || productsArr[i].error === 'NOT_FOUND_PRODUCT') {
                                window.tcart.products.forEach(function (product, index) {
                                    var uid = product.uid || product.lid;
                                    if (badUid === uid) {
                                        window.tcart.products[index] = {};
                                    }
                                });
                            }
                        });

                        tcart__saveLocalObj();
                        tcart__reDrawProducts();
                        tcart__updateTotalProductsinCartObj();
                        tcart__reDrawCartIcon();
                        tcart__reDrawTotal();
					}
				};
				xhr.onerror = function(error) {
					tcart_changeEndpoint(error, function () {
                        tcart__updateProductsPrice();
                    });
				};
				xhr.send(dataCart);
            }
        }
    }
}

/**
 * Обновляет количество товаров в корзине
 */
function tcart__updateTotalProductsinCartObj() {
    var products = window.tcart['products'];
    if (products.length > 0) {
        // пропускает пустые или удаленные товары
        var total = 0;
        var prodAmount = 0;
        Array.prototype.forEach.call(products, function (product) {
            if (!tcart__isEmptyObject(product) && product.deleted !== 'yes') {
                if (product.single === 'y') {
                    total = total + 1;
                } else {
                    total = total + product['quantity'] * 1;
                }
                prodAmount = prodAmount * 1 + product['amount'] * 1;
            }
        });
        prodAmount = tcart__roundPrice(prodAmount);
        window.tcart['total'] = total;
        window.tcart['prodamount'] = prodAmount;

        var amount = prodAmount;

        // добавляет промокод
        if (typeof window.tcart.promocode == 'object' && window.tcart.promocode.promocode) {
            var discountSum = 0;

            if (window.tcart.promocode.discountsum > 0) {
                discountSum = window.tcart.promocode.discountsum * 1;
            } else if (window.tcart.promocode.discountpercent > 0) {
                discountSum = tcart__roundPrice((amount * window.tcart.promocode.discountpercent * 1) / 100);
            } else {
                // eslint-disable-next-line no-console
                console.error('Cart Some error.');
            }

            amount = amount - discountSum;
            amount = tcart__roundPrice(amount);
            if (amount < 0) {
                amount = 0;
            }

            window.tcart['prodamount_discountsum'] = discountSum;
            window.tcart['prodamount_withdiscount'] = amount;
        } else {
            delete window.tcart['prodamount_discountsum'];
            delete window.tcart['prodamount_withdiscount'];
        }

        // добавляет доставку
        if (
            typeof window.tcart.delivery == 'object' &&
            typeof window.tcart.delivery.price != 'undefined' &&
            window.tcart.delivery.price > 0 &&
            window.tcart.prodamount > 0
        ) {
            if (window.tcart.delivery.freedl > 0 && amount >= window.tcart.delivery.freedl) {
                /* */
            } else {
                amount = amount + window.tcart.delivery.price * 1;
            }
        }

        if (amount > 0) {
            amount = tcart__roundPrice(amount);
        }
        window.tcart['amount'] = amount;
    } else {
        window.tcart['total'] = 0;
        window.tcart['prodamount'] = 0;
        window.tcart['amount'] = 0;
    }
}

function tcart__reDrawCartIcon() {
    var cart = window.tcart;
    var cartIcon = document.querySelector('.t706__carticon');
	var t1004_cartCounter = document.querySelector('.t1004 .js-carticon-counter');
	if (cartIcon) {
		var cartIconCounter = cartIcon.querySelector('.js-carticon-counter');
		var cartIconText = document.querySelector('.t706__carticon-text');
		if (cart['total'] == 1) {
			cartIcon.style.opacity = 0;
			cartIcon.style.transition = 'opacity .3s';
			cartIcon.style.opacity = 1;
		}

	}
	
    if (cart.products !== undefined && cart.products.length > 0 && cart['total'] > 0) {
		if (cartIcon) cartIcon.classList.add('t706__carticon_showed');
		if (cartIconCounter) cartIconCounter.innerHTML = cart['total'];
		if (t1004_cartCounter) t1004_cartCounter.innerHTML = cart['total'];
    } else {
        if (cartIcon) cartIcon.classList.remove('t706__carticon_showed');
		if (cartIconCounter) cartIconCounter.innerHTML = '';
		if (t1004_cartCounter) t1004_cartCounter.innerHTML = '';
    }

	if (cartIconCounter) {
		if (tcart__showPrice(window.tcart.prodamount) === '') {
			cartIconText.style.display = 'none';
		} else {
			cartIconText.style.display = 'block';
			cartIconText.innerHTML = '= ' + tcart__showPrice(window.tcart.prodamount);
		}
	}

    if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        try {
            tcart__onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        } catch (e) {
            /* eslint-disable-next-line no-console */
            console.error('js lazyload not loaded');
        }
    }
}

function tcart__openCart() {
	var submitBtn = document.querySelector('.t706 .t-form__submit button');
	var cartIcon = document.querySelector('.t706__carticon');
    if (cartIcon) cartIcon.classList.remove('t706__carticon_showed');
    document.querySelector('body').classList.add('t706__body_cartwinshowed');

    var customDelivery = document.getElementById('customdelivery');
    if (!customDelivery) {
        submitBtn.classList.remove('t706__submit_disable');
        submitBtn.removeAttribute('disabled');
    } else if (!customDelivery.querySelector('.tcart__preloader')) {
        submitBtn.classList.remove('t706__submit_disable');
        submitBtn.removeAttribute('disabled');
    }

    if (window.tildaForm.hideErrors !== undefined) {
        window.tildaForm.hideErrors(document.querySelector('.t706 .t-form'));
    }

    setTimeout(function () {
        tcart__lockScroll();
    }, 500);

    tcart__syncProductsObject__LStoObj();
    tcart__updateProductsPrice();

    var cartWindow = document.querySelector('.t706__cartwin');
    cartWindow.style.opacity = 0;
	cartWindow.style.transition = 'opacity .3s';
    cartWindow.classList.add('t706__cartwin_showed');

	// фикс для анимации
	setTimeout(function() {
		cartWindow.style.opacity = 1;
	}, 0);

    tcart__reDrawProducts();
    tcart__reDrawTotal();
    document.addEventListener('keyup', tcart__keyUpFunc);
    if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        try {
            tcart__onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('js lazyload not loaded');
        }
    }

	// если deliveryActive не смог проинициализироваться до открытия корзины
	Array.prototype.forEach.call(document.querySelectorAll('.t706 .t-form .t-radio__wrapper-delivery'), function (wrapper) {
        if (wrapper.getAttribute('data-delivery-services') === 'y' && !window.tcart_newDeliveryActive) {
            if (typeof tcart_newDelivery !== 'undefined' && typeof tcart_newDelivery.init === 'function') {
                tcart_newDelivery.init(window.tcart__ymapApiKey);
            } else {
				var deliveryScriptLink = 'https://static.tildacdn.com/js/tilda-delivery-1.0.min.js';
				if (!document.querySelector('script[src^="' + deliveryScriptLink + '"]')) {
					var deliveryScript = document.createElement('script');
					deliveryScript.type = 'text/javascript';
					deliveryScript.src = deliveryScriptLink;
					deliveryScript.onload = function() {
						tcart_newDelivery.init(window.tcart__ymapApiKey);
						var deliveryCSSLink = 'https://static.tildacdn.com/css/tilda-delivery-1.0.min.css';
						var deliveryCSS = document.querySelector('link[href^="' + deliveryCSSLink + '"]');
						if (!deliveryCSS) {
							document.querySelector('body').insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="' + deliveryCSSLink + '">');
						}
					};
					deliveryScript.onerror = function(textStatus) {
						// eslint-disable-next-line no-console
						console.error('Upload script failed, error: ' + textStatus);
					};
					document.head.appendChild(deliveryScript);
				}
            }
        }
    });

    // Восстановление из LS раннее заполненных полей - save/restore form's fields
    if (document.querySelectorAll('.t706 .t-form .t-input-group_sf').length > 0) {
        var localKey;
        var savedContacts;
        var cartKey;

        if (typeof sessionStorage === 'object') {
            try {
                cartKey = sessionStorage.getItem('cartkey');
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Your web browser does not support storing a \'cartkey\' data locally a session.');
            }
        } else {
            // eslint-disable-next-line no-console
            console.error('Your web browser does not support sessionStorage.');
        }

        // восстановить поля из LS
        var restoreFieldsFromLS = function () {
            if (savedContacts) {
				var datacipherScriptLink = 'https://static.tildacdn.com/js/tilda-cart-datacipher-1.0.min.js';
				if (!document.querySelector('script[src^="' + datacipherScriptLink + '"]')) {
					var datacipherScript = document.createElement('script');
					datacipherScript.type = 'text/javascript';
					datacipherScript.src = datacipherScriptLink;
					datacipherScript.onload = function() {
						var decodedStr = tcart__dataCipher.decode(cartKey, savedContacts);
						try {
                            var cartObj = JSON.parse(decodedStr);
                            if (typeof window.deliveryUserFieldsAutoComplete === 'undefined') {
                                window.deliveryUserFieldsAutoComplete = {};
                            }
							cartObj.forEach(function (cartWindow) {
                                // radio
                                try {
                                    var radioElem = document.querySelector('.t706 .t-form [type="radio"][name="' + cartWindow.name + '"][value="' + cartWindow.value + '"]');
                                    if (radioElem) {
                                        radioElem.checked = true;
                                        if (radioElem) {
                                            var triggerChangeEvent;
                                            if (/msie|trident/i.test(navigator.userAgent)) {
                                                triggerChangeEvent = document.createEvent('Event');
                                                triggerChangeEvent.initEvent('change', true, false);
                                            } else {
                                                triggerChangeEvent = new Event('change');
                                            }
                                            radioElem.dispatchEvent(triggerChangeEvent);
                                        }
                                    }
                                    if (cartWindow.name === 'paymentsystem') {
                                        radioElem.dispatchEvent(new Event('change'));
                                    }
                                } catch (e) {
                                    // There is no such radio-field. Do nothing
                                }

                                // доставка
                                var deliveryKeys = [
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

                                if (!deliveryKeys.some(function (key) {
									var truly = cartWindow.name === 'tildadelivery-' + key;
									if (truly) {
										window.deliveryUserFieldsAutoComplete[key] = cartWindow.value;
									}
									return truly;
								})) {
                                    // остальное
                                    var formField = document.querySelector('.t706 .t-form [name="' + cartWindow.name + '"]:not([type="radio"])');
                                    if (formField && formField.value === '' && cartWindow.name !== 'tildadelivery-city') {
                                        formField.value = cartWindow.value;

                                        if (cartWindow.name === 'tildaspec-phone-part[]') {
                                            formField.dispatchEvent(new Event('input'));
                                        }

                                    } else if (cartWindow.name === 'tildadelivery-city' && formField.value !== cartWindow.value) {
                                        formField.setAttribute('data-option-selected', false);
                                        formField.value = cartWindow.value;
                                        formField.dispatchEvent(new Event('keyup'));
                                        formField.dispatchEvent(new Event('blur'));
                                    } else if (cartWindow.name === 'tildaspec-phone-part[]-code') {
                                        document.querySelector('.t706 .t-form [data-phonemask-code="' + cartWindow.value + '"]').click();
                                    }
                                }
                            });
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('Can\'t get JSON.' + decodedStr);
                        }
					};
					datacipherScript.onerror = function(textStatus) {
						// eslint-disable-next-line no-console
						console.error('Upload script failed, error: ' + textStatus);
					};
					document.head.appendChild(datacipherScript);
				}
            }
        };

        if (typeof localStorage === 'object') {
            try {
                localKey = localStorage.getItem('tcart_savedcontacts_localkey');
                savedContacts = localStorage.getItem('tcart_savedcontacts');

                if (!localKey) {
                    localKey = Math.random().toString();
                    localStorage.setItem('tcart_savedcontacts_localkey', localKey);
                }

                var post = {
                    data: btoa(JSON.stringify({
                        projectid: document.querySelector('.t-records').getAttribute('data-tilda-project-id'),
                        pageid: document.querySelector('.t-records').getAttribute('data-tilda-page-id'),
                        localstoragekey: localKey,
                    })),
                };

                if (!cartKey) {
                    // получает cartKey
					var xhr = new XMLHttpRequest();
					xhr.open('POST', 'https://store-tools.tildacdn.com/api/v1/getkeyforsavedcontacts/');
					xhr.onload = function() {
						if (xhr.status >= 200 && xhr.status < 400) {
							var data = xhr.responseText;
							if (typeof data !== 'string' || data.substr(0, 1) !== '{') {
								// eslint-disable-next-line no-console
								console.error('Can\'t get array.');
							}
							try {
                                var dataObj = JSON.parse(data);
                                if (dataObj.error === 'No data field') {
                                    // Nothing to do
                                }
                                if (dataObj.error === 'Bad request...') {
                                    // The request is not from Tilda's page
                                }
                                if (dataObj.error === 'Access denied') {
                                    // IP was blocked
                                }
                                if (typeof dataObj.data === 'object' && Object.prototype.hasOwnProperty.call(dataObj.data, 'cartkey')) {
                                    cartKey = dataObj.data.cartkey;
                                    try {
                                        sessionStorage.setItem('cartkey', cartKey);
                                    } catch (error) {
                                        // eslint-disable-next-line no-console
                                        console.error('Your web browser does not support storing a \'cartkey\' data locally a session.');
                                    }

                                    restoreFieldsFromLS();
                                }
                            } catch (e) {
                                // eslint-disable-next-line no-console
                                console.error('Can\'t get JSON. It\'s incorrect: ', data);
                                localStorage.removeItem('tcart_savedcontacts');
                                localStorage.removeItem('tcart_savedcontacts_localkey');
                            }
						}
					};
					xhr.send(post);
                } else {
                    restoreFieldsFromLS();
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Your web browser does not support storing a \'tcart_savedcontacts\' data locally. ' + e);
            }

            // Сохраняет поля формы в tcart_savedcontacts
			var beforeSendHandler = function (event) {
                var isChecked = event.target.querySelector('.t-input-group_sf input').checked;
                if (cartKey && isChecked) {
					var tcart__saveFormFields = function() {
						var serializeArray = tcart__serializeCartForm(event.target);
						var array = [];
						serializeArray.forEach(function (el) {
							/* Excluding special/system fields */
							if (el.name.indexOf('form-spec-') === -1 && (el.name.indexOf('tildaspec-') === -1 || el.name === 'tildaspec-phone-part[]') && el.name.indexOf('formservices') === -1 && el.value !== '') {
								array.push(el);
								if (el.name === 'tildaspec-phone-part[]') {
									var code = event.target.querySelector('[name="' + el.name + '"]').getAttribute('data-phonemask-code');
									array.push({
										name: 'tildaspec-phone-part[]-code',
										value: code
									});
								}
							}
						});

						var json = JSON.stringify(array);
						var savedContacts = tcart__dataCipher.encode(cartKey, json);
						localStorage.setItem('tcart_savedcontacts', savedContacts);
					};

					var datacipherScriptLink = 'https://static.tildacdn.com/js/tilda-cart-datacipher-1.0.min.js';
					if (!document.querySelector('script[src^="' + datacipherScriptLink + '"]')) {
						var datacipherScript = document.createElement('script');
						datacipherScript.type = 'text/javascript';
						datacipherScript.src = datacipherScriptLink;

						document.head.appendChild(datacipherScript);
						datacipherScript.onload = function() {
							tcart__saveFormFields();
						};
					} else {
						tcart__saveFormFields();
					}
                }
            };
			if (typeof jQuery !== 'undefined') {
				$('.t706 .t-form').on('tildaform:beforesend', beforeSendHandler);
			} else {
				document.querySelector('.t706 .t-form').addEventListener('tildaform:beforesend', beforeSendHandler);
			}
        } else {
            // eslint-disable-next-line no-console
            console.error('Your web browser does not support localstorage.');
        }
    }
}

/**
 * Перерисовывает товары в окне корзины
 */
function tcart__reDrawProducts() {
    var cartWindowProducts = document.querySelector('.t706__cartwin-products');

    // удаляет пустые или удаленные товары
    if (window.tcart['products'] !== undefined) {
        var actualProductsObj = [];
        var oldCountProducts = window.tcart['products'].length;
		Array.prototype.forEach.call(window.tcart['products'], function(product) {
            if (!tcart__isEmptyObject(product) && product.deleted !== 'yes' && product.quantity > 0) {
                actualProductsObj.push(product);
            }
        });
        window.tcart['products'] = actualProductsObj;
        var actualCountProducts = window.tcart['products'].length;
        if (actualCountProducts !== oldCountProducts) {
            tcart__saveLocalObj();
        }
    }

    var hasImg = '';
    if (actualProductsObj.length > 0) {
        Array.prototype.forEach.call(actualProductsObj, function(product) {
            if (product['img'] != '') {
                hasImg = 'yes';
            }
        });
    }

    if (actualProductsObj.length > 0) {
        var str = '';
        Array.prototype.forEach.call(actualProductsObj, function(product, index) {
            str += '<div class="t706__product" data-cart-product-i="' + index + '">';
            if (hasImg == 'yes') {
                str += '<div class="t706__product-thumb"><div class="t706__product-imgdiv"' + (product['img'] !== '' ? 'style="background-image:url(\'' + product['img'] + '\');"' : '') + '></div></div>';
            }
            str += '<div class="t706__product-title t-descr t-descr_sm">';
            if (product.url) {
                str += '<a style="color: inherit" target="_blank" href="' + product.url + '">' + product['name'] + '</a>';
            } else {
                str += product['name'];
            }

            if (product.options && product.options.length > 0) {
                str += '<div class="t706__product-title__option">';
                Array.prototype.forEach.call(product.options, function(option) {
                    str += '<div>' + option['option'] + ': ' + option['variant'] + '</div>';
                });
                str += '</div>';
            }
            if (typeof product['sku'] != 'undefined' && product['sku'] != '') {
                str += '<div class="t706__product-title__option">';
                str += product['sku'];
                str += '</div>';
            }

            if (product.portion > 0) {
                str += '<div class="t706__product-title__portion">';
                str += tcart__showPrice(product.price) + '/';
                if (product.portion !== '1') {
                    str += product.portion + ' ';
                }
                str += tcart_dict(product.unit) + '</div>';
            }

            str += '</div>';
            if (window.tcart_oneproduct == 'y') {
                str +=
                    '<div class="t706__product-plusminus t-descr t-descr_sm" style="display:none;"><span class="t706__product-quantity">' +
                    product.quantity +
                    '</span></div>';
            } else {
                str += '<div class="t706__product-plusminus t-descr t-descr_sm"><span class="t706__product-minus"><img src="https://static.tildacdn.com/lib/linea/c8eecd27-9482-6c4f-7896-3eb09f6a1091/arrows_circle_minus.svg" style="width:16px;height:16px;border:0"></span>';
                str += '<span class="t706__product-quantity">' + product.quantity + '</span>';
                str += '<span class="t706__product-plus"><img src="https://static.tildacdn.com/lib/linea/c47d1e0c-6880-dc39-ae34-521197f7fba7/arrows_circle_plus.svg" style="width:16px;height:16px;border:0"></span></div>';
            }

            if (product.portion > 0) {
                str += '<div class="t706__product-amount--portion t-descr t-descr_sm">';
                if (product.amount > 0) {
                    str += '<span class="t706__product-amount">' + tcart__showPrice(product.amount) + '</span>';
                    str += '<span class="t706__product-portion">' + tcart__showWeight(product.quantity * product.portion, product.unit) + '</span>';
                }
                str += '</div>';
            } else {
                str += '<div class="t706__product-amount t-descr t-descr_sm">';
                if (product.amount > 0) {
                    str += tcart__showPrice(product.amount);
                }
                str += '</div>';
            }

            str += '<div class="t706__product-del"><img src="https://static.tildacdn.com/lib/linea/1bec3cd7-e9d1-2879-5880-19b597ef9f1a/arrows_circle_remove.svg" style="width:20px;height:20px;border:0;"></div>';
            str += '</div>';
        });
        cartWindowProducts.innerHTML = str;
        tcart__addEvents__forProducts();
		var submitBtn = document.querySelector('.t706 .t-form__submit button');
        submitBtn.classList.remove('t706__submit_disable');
        submitBtn.removeAttribute('disabled');
    } else {
        cartWindowProducts.innerHTML = '';
        // tcart__closeCart();
    }
}

/**
 * Перерисовывает total в окне корзины
 */
function tcart__reDrawTotal() {
    document.querySelector('.t706__cartwin-prodamount').innerHTML = tcart__showPrice(window.tcart.prodamount);
    document.querySelector('.t706__cartwin-totalamount').innerHTML = tcart__showPrice(window.tcart.amount);

	// добавляет детали, если есть доставка или промокод
    var totalAmountInfo = document.querySelector('.t706__cartwin-totalamount-info');
    totalAmountInfo.innerHTML = '';

    var totalAmountLabel;
    var totalAmountValue;

    if (typeof window.tcart.promocode == 'object' || typeof window.tcart.delivery == 'object') {
        totalAmountInfo.style.display = 'block';
        totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + tcart_dict('subtotal') + ':' + '</span>';
        totalAmountValue = '<span class="t706__cartwin-totalamount-info_value">' + tcart__showPrice(window.tcart.prodamount) + '</span>';
        totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue + '<br>');
    }

    if (typeof window.tcart.promocode == 'object') {
        totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + tcart_dict('promoCode') + ' ' + window.tcart.promocode.promocode + ':' + '</span>';
        totalAmountValue =
            '<span class="t706__cartwin-totalamount-info_value">' +
            (window.tcart.promocode.discountpercent ? ' ' + parseFloat(window.tcart.promocode.discountpercent) + '% ' : '') +
            '</span>';

        totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue + '<br>');
        totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + tcart_dict('discount') + ':' + '</span>';
        totalAmountValue = '<span class="t706__cartwin-totalamount-info_value">' + tcart__showPrice(window.tcart.prodamount_discountsum) + '</span>';
        totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue + '<br>');
        if (window.tcart.prodamount_withdiscount > 0) {
            totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + tcart_dict('subtotalDiscount') + ':' + '</span>';
            totalAmountValue = '<span class="t706__cartwin-totalamount-info_value">' + tcart__showPrice(window.tcart.prodamount_withdiscount) + '</span>';
            totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue + '<br>');
        } else {
            totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + tcart_dict('subtotalDiscount') + ':' + '</span>';
            totalAmountValue = '<span class="t706__cartwin-totalamount-info_value">' + ' 0' + '</span>';
            totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue + '<br>');
        }
    }

    if (
        typeof window.tcart.delivery == 'object' &&
        window.tcart.delivery.name &&
        window.tcart.delivery.price &&
        (window.tcart.delivery.price > 0 || window.tcart.delivery['service-id'])
    ) {
        if (
            window.tcart.delivery.freedl > 0 &&
            window.tcart.prodamount >= window.tcart.delivery.freedl &&
            (window.tcart.prodamount_withdiscount >= window.tcart.delivery.freedl || !window.tcart.prodamount_withdiscount)
        ) {
            totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + window.tcart.delivery.name + ':' + '</span>';
            totalAmountValue = '<span class="t706__cartwin-totalamount-info_value">' + ' 0 (' + tcart_dict('free') + ')<br>' + '</span>';
            totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue);
        } else if (window.tcart.delivery.price > 0) {
            totalAmountLabel = '<span class="t706__cartwin-totalamount-info_label">' + window.tcart.delivery.name + ':' + '</span>';
            totalAmountValue = '<span class="t706__cartwin-totalamount-info_value">' + tcart__showPrice(window.tcart.delivery.price) + '</span>';
            totalAmountInfo.insertAdjacentHTML('beforeend', totalAmountLabel + totalAmountValue + '<br>');
        }
    }

	var prodAmountWrap = document.querySelector('.t706__cartwin-prodamount-wrap');
    if (window.tcart.prodamount == 0) {
        prodAmountWrap.style.display = 'none';
    } else {
        prodAmountWrap.style.display = 'block';
    }

    tcart__changeSubmitStatus();

	var totalAmountWrap = document.querySelector('.t706__cartwin-totalamount-wrap');
	var orderForm = document.querySelector('.t706__orderform');
    if (window.tcart.amount == 0) {
        totalAmountWrap.style.display = 'none';
    } else if (window.tcart.prodamount == window.tcart.amount) {
        if (orderForm && orderForm.offsetHeight > 700) {
            totalAmountWrap.style.display = 'block';
        } else {
            totalAmountWrap.style.display = 'none';
        }
    } else {
        totalAmountWrap.style.display = 'block';
    }

    if (window.tcart.promocode) {
        totalAmountWrap.style.display = 'block';
        if (window.tcart.amount == 0) {
            document.querySelector('.t706__cartwin-totalamount').innerHTML = '0';
        }
    }

    if (window.tcart.delivery && window.tcart.delivery.price > 0) {
        totalAmountWrap.style.display = 'block';
    }

    var cartIconText = document.querySelector('.t706__carticon-text');
	if (cartIconText) cartIconText.innerHTML = '= ' + tcart__showPrice(window.tcart.prodamount);
}

function tcart__changeSubmitStatus() {
	var newDeliveryActive = window.tcart_newDeliveryActive;
    var minOrderSetted = window.tcart_minorder > 0;
    var minQuantitySetted = window.tcart_mincntorder > 0;

	var submitBtn = document.querySelector('.t706 .t-form__submit button');
	var submit = document.querySelector('.t706 .t-submit');
	var minOrder = document.querySelector('.t706__cartwin-prodamount-minorder');
	var minCountOrder = document.querySelector('.t706__cartwin-prodamount-mincntorder');

    if (newDeliveryActive) {
        if (window.tcart.emptyDeliveryServices) {
            window.tcart__errorHandler.show();
            submitBtn.classList.add('t706__submit_disable');
            submitBtn.setAttribute('disabled', 'disabled');
        }
    }

    if (minOrderSetted && minQuantitySetted) {
        if (minOrderSetted) {
            if (window.tcart.prodamount >= window.tcart_minorder) {
                minOrder.style.display = 'none';
            } else {
                minOrder.style.display = 'block';
            }
        }

        if (minQuantitySetted) {
            if (window.tcart.total >= window.tcart_mincntorder) {
                minCountOrder.style.display = 'none';
            } else {
                minCountOrder.style.display = 'block';
            }
        }

        if (window.tcart.prodamount >= window.tcart_minorder && window.tcart.total >= window.tcart_mincntorder) {
            if (newDeliveryActive && window.tcart.emptyDeliveryServices) {
                return;
            }
            submit.classList.remove('t706__submit_disable');
            submitBtn.removeAttribute('disabled');
        }
    } else if (minOrderSetted || minQuantitySetted) {
        if (minOrderSetted) {
            if (window.tcart.prodamount >= window.tcart_minorder) {
                if (newDeliveryActive && window.tcart.emptyDeliveryServices) {
                    return;
                }

                var customDelivery = document.getElementById('customdelivery');
                if (!customDelivery) {
                    minOrder.style.display = 'none';
                    submitBtn.classList.remove('t706__submit_disable');
                    submitBtn.removeAttribute('disabled');
                } else if (!customDelivery.querySelector('.tcart__preloader')) {
                    minOrder.style.display = 'none';
                    submitBtn.classList.remove('t706__submit_disable');
                    submitBtn.removeAttribute('disabled');
                }
            } else {
                minOrder.style.display = 'block';
            }
        }

        if (minQuantitySetted) {
            if (window.tcart.total >= window.tcart_mincntorder) {
                if (newDeliveryActive && window.tcart.emptyDeliveryServices) {
                    return;
                }
                minCountOrder.style.display = 'none';
                submit.classList.remove('t706__submit_disable');
                submitBtn.removeAttribute('disabled');
            } else {
                minCountOrder.style.display = 'block';
            }
        }
    } else if (newDeliveryActive && !window.tcart.emptyDeliveryServices) {
        window.tcart__errorHandler.hide();
        submit.classList.remove('t706__submit_disable');
        submitBtn.removeAttribute('disabled');
    }
}

function tcart__addEvents__forProducts() {
    Array.prototype.forEach.call(document.querySelectorAll('.t706__product-plus'), function(btn) {
		btn.addEventListener('click', function() {
			tcart__product__plus(this);
		});
    });

    Array.prototype.forEach.call(document.querySelectorAll('.t706__product-minus'), function(btn) {
		btn.addEventListener('click', function() {
			tcart__product__minus(this);
		});
    });

    Array.prototype.forEach.call(document.querySelectorAll('.t706__product-del'), function(btn) {
		btn.addEventListener('click', function() {
			tcart__product__del(this);
		});
    });

    Array.prototype.forEach.call(document.querySelectorAll('.t706__product-quantity'), function(btn) {
		btn.addEventListener('click', function() {
			tcart__product__editquantity(this);
		});
    });
}

function tcart__closeCart() {
    var cart = window.tcart;
	var submitBtn = document.querySelector('.t706 .t-form__submit button');
	var cartIcon = document.querySelector('.t706__carticon');
	var cartIconText = document.querySelector('.t706__carticon-text');
	var cartWindow = document.querySelector('.t706__cartwin');

    document.querySelector('body').classList.remove('t706__body_cartwinshowed');

    // fix IOS11 cursor bug + general IOS background scroll
    tcart__unlockScroll();

    submitBtn.classList.remove('t706__submit_disable');
    submitBtn.removeAttribute('disabled');

    if (window.tcart_dontstore === 'y') {
        if (window.tcart) {
            if (cart.products) {
                cart.products = [];
            }
        }

        tcart__updateTotalProductsinCartObj();
        tcart__reDrawCartIcon();
        tcart__reDrawTotal();
    }
	if (cartIcon) {
		if (cart.products && cart.products.length > 0 && cart['total'] > 0) {
			cartIcon.classList.add('t706__carticon_showed');
		} else {
			cartIcon.classList.remove('t706__carticon_showed');
		}

	}
	if (cartIconText) {
		if (cart['amount'] > 0) {
			cartIconText.style.display = 'block';
		} else {
			cartIconText.style.display = 'none';
		}
	}

    tcart__delZeroquantity_inCartObj();

    document.removeEventListener('keyup', tcart__keyUpFunc);

    if (cartIcon) cartIcon.classList.remove('t706__carticon_neworder');
	cartWindow.style.transition = 'opacity .3s';
	cartWindow.style.opacity = 0;

    setTimeout(function () {
        cartWindow.classList.remove('t706__cartwin_showed');
        cartWindow.style.opacity = '1';
    }, 300);

    if (window.tcart_success == 'yes') {
        location.reload();
    }
}

function tcart__keyUpFunc(e) {
    if (e.keyCode == 27) {
        tcart__closeCart();
    }
}

function tcart__product__plus(buttonElement) {
    var productElement = buttonElement.closest('.t706__product');
    var cartProductIndex = productElement.getAttribute('data-cart-product-i');

    // получаем товары из LS
    if (!window.tcart.products[cartProductIndex]) {
        tcart__syncProductsObject__LStoObj();
        if (window.tcart.products[cartProductIndex] == undefined) {
            return;
        }
    }

    if (window.tcart.products[cartProductIndex].quantity > 0 && window.tcart.products[cartProductIndex].inv !== undefined && window.tcart.products[cartProductIndex].inv > 0) {
        if (window.tcart.products[cartProductIndex].inv == window.tcart.products[cartProductIndex].quantity) {
            alert(tcart_dict('limitReached'));
            return;
        }
    }

    window.tcart.products[cartProductIndex].quantity++;
    window.tcart.products[cartProductIndex].amount = window.tcart.products[cartProductIndex].price * window.tcart.products[cartProductIndex].quantity;
    window.tcart.products[cartProductIndex].amount = tcart__roundPrice(window.tcart.products[cartProductIndex].amount);

    productElement.querySelector('.t706__product-quantity').innerHTML = window.tcart.products[cartProductIndex].quantity;

    if (window.tcart.products[cartProductIndex].single === 'y' && window.tcart.products[cartProductIndex].portion !== undefined) {
        productElement.querySelector('.t706__product-portion').innerHTML = tcart__showWeight(window.tcart.products[cartProductIndex].quantity * window.tcart.products[cartProductIndex].portion, window.tcart.products[cartProductIndex].unit);
    }

    if (window.tcart.products[cartProductIndex].amount > 0) {
        productElement.querySelector('.t706__product-amount').innerHTML = tcart__showPrice(window.tcart.products[cartProductIndex].amount);
    } else {
        productElement.querySelector('.t706__product-amount').innerHTML = '';
    }

    tcart__updateTotalProductsinCartObj();
    tcart__reDrawCartIcon();
    tcart__reDrawTotal();
    tcart__saveLocalObj();
}

function tcart__product__minus(buttonElement) {
    var productElement = buttonElement.closest('.t706__product');
    var cartProductIndex = productElement.getAttribute('data-cart-product-i');

    // получаем товары из LS
    if (!window.tcart.products[cartProductIndex]) {
        tcart__syncProductsObject__LStoObj();
        if (window.tcart.products[cartProductIndex] == undefined) {
            return;
        }
    }

    if (window.tcart.products[cartProductIndex].quantity > 0) {
        window.tcart.products[cartProductIndex].quantity--;
    }

    window.tcart.products[cartProductIndex].amount = tcart__roundPrice(window.tcart.products[cartProductIndex].price * window.tcart.products[cartProductIndex].quantity);

    if (window.tcart.products[cartProductIndex]['amount'] > 0) {
        productElement.querySelector('.t706__product-amount').innerHTML = tcart__showPrice(window.tcart.products[cartProductIndex]['amount']);
    }

    if (window.tcart.products[cartProductIndex].amount > 0 && window.tcart.products[cartProductIndex].single === 'y' && window.tcart.products[cartProductIndex].portion !== undefined) {
        productElement.querySelector('.t706__product-portion').innerHTML = tcart__showWeight(window.tcart.products[cartProductIndex].quantity * window.tcart.products[cartProductIndex].portion, window.tcart.products[cartProductIndex].unit);
    }

    productElement.querySelector('.t706__product-quantity').innerHTML = window.tcart.products[cartProductIndex].quantity;

    if (window.tcart.products[cartProductIndex]['quantity'] == 0) {
        tcart__product__del(buttonElement);
    }

    tcart__updateTotalProductsinCartObj();
    tcart__reDrawCartIcon();
    tcart__reDrawTotal();
    tcart__saveLocalObj();
}

function tcart__product__del(buttonElement) {
    var productElement = buttonElement.closest('.t706__product');
    var cartProductIndex = productElement.getAttribute('data-cart-product-i');
    var cartVersion = parseInt(buttonElement.closest('.t706').getAttribute('data-cart-ver'), 10);

    if (cartVersion > 136) {
        var title = productElement.querySelector('.t706__product-title a').textContent || productElement.querySelector('.t706__product-title').contents().eq(0).textContent;
        var height = productElement.offsetHeight;
        var products = productElement.closest('.t706__cartwin-products');
        var product;

        // добавляет разметку таймера
        var deleted = products.querySelector('.t706__product-deleted[data-cart-product-i="' + cartProductIndex + '"]');
        if (!deleted) {
            productElement.insertAdjacentHTML('afterend', '<div class="t706__product-deleted" data-cart-product-i="' + cartProductIndex + '" style="display: none">\
                <div class="t706__product-deleted-wrapper" colspan="5">\
                    <div class="t706__product-deleted__timer t-descr">\
                        <div class="t706__product-deleted__timer__left">\
                            <div class="t706__product-deleted__timer__counter">\
                                <span class="t706__product-deleted__timer__counter__number">4</span>\
                                <svg class="t706__product-deleted__timer__counter__circle">\
                                    <circle r="10" cx="12" cy="12"></circle>\
                                </svg>\
                            </div>\
                            <div class="t706__product-deleted__timer__title">' + tcart_dict('youRemoved') + ' "' + title + '"</div>\
                        </div>\
                        <div class="t706__product-deleted__timer__return">' + tcart_dict('undo') + '</div>\
                    </div>\
                </div>\
            </div>');
            deleted = products.querySelector('.t706__product-deleted[data-cart-product-i="' + cartProductIndex + '"]');

            // сохраняет товар и удаляет из корзины
            tcart_fadeOut(productElement, 200, function () {
				if (productElement.parentNode !== null) {
					product = productElement.parentNode.removeChild(productElement);
				}
                tcart_fadeIn(deleted, 200);
				deleted.style.height = height + 'px';
            });

            window.tcart.products[cartProductIndex].deleted = 'yes';
            // обновляет состояние корзины
            tcart__updateTotalProductsinCartObj();
            tcart__reDrawCartIcon();
            tcart__reDrawTotal();
            tcart__saveLocalObj();

            // считает товары в window.tcart
            var productsLength = window.tcart.products.filter(function (product) {
                if (tcart__isEmptyObject(product) || product.deleted === 'yes' || product.quantity === 0) {
                    return false;
                } else {
                    return true;
                }
            }).length;

            // отключает кнопку в корзине
            if (productsLength === 0) {
                document.querySelector('.t706 .t-form__submit button').classList.add('t706__submit_disable');
                document.querySelector('.t706 .t-form__submit button').getAttribute('disabled', 'disabled');
            }

            // включает таймер
            var timerOut = setInterval(function () {
                var countdown = deleted.querySelector('.t706__product-deleted__timer__counter__number');
                var count = countdown.innerText;

                if (!document.querySelector('.t706__cartwin').classList.contains('t706__cartwin_showed')) {
                    clearInterval(timerOut);
                }

                if (count > 1) {
                    countdown.innerText = parseInt(count, 10) - 1;
                } else {
                    clearInterval(timerOut);
					tcart_fadeOut(deleted, 200, function() {
						var attr = deleted.getAttribute('data-clicked');
                        if (attr !== 'yes') {
                            if (window.tcart.products[cartProductIndex] !== undefined && window.tcart.products[cartProductIndex].deleted === 'yes') {
								if (deleted.parentNode !== null) {
									deleted.parentNode.removeChild(deleted);
								}
                                window.tcart.products[cartProductIndex] = {};
                                if (products.querySelectorAll('.t706__product-deleted').length === 0) {
                                    if (tcart__isEmptyObject(window.tcart.products[cartProductIndex])) {
                                        window.tcart.products.splice(cartProductIndex, 1);
                                        tcart__reDrawProducts();
                                    }
                                }
                                tcart__saveLocalObj();
                            }
                        }

                        var productsLength = window.tcart.products.filter(function (product) {
                            if (tcart__isEmptyObject(product)) {
                                return false;
                            } else {
                                return true;
                            }
                        }).length;

                        if (window.tcart.products.length === 0 || productsLength === 0) {
                            tcart__closeCart();
                        }
					});
                }
            }, 1000);

            // восстанавливает товар
            Array.prototype.forEach.call(deleted.querySelectorAll('.t706__product-deleted__timer__return'), function(deletedReturnBtn) {
				var deletedReturnClickHandler = function() {
					deleted.setAttribute('data-clicked', 'yes');
					clearInterval(timerOut);

					tcart_fadeOut(deleted, 200, function () {
						deleted.insertAdjacentElement('afterend', product);
						tcart_fadeIn(product, 200);
						if (deleted.parentNode !== null) {
							deleted.parentNode.removeChild(deleted);
						}
					});

					if (window.tcart.products[cartProductIndex] === undefined) {
						tcart__reDrawProducts();
						var productsLength = window.tcart.products.filter(function (el) {
							if (tcart__isEmptyObject(el)) {
								return false;
							} else {
								return true;
							}
						}).length;

						if (window.tcart.products.length === 0 || productsLength === 0) {
							tcart__closeCart();
						}
					} else {
						delete window.tcart.products[cartProductIndex].deleted;
					}
					if (buttonElement.classList.contains('t706__product-minus')) {
						tcart__product__plus(buttonElement);
					} else {
						tcart__updateTotalProductsinCartObj();
						tcart__reDrawCartIcon();
						tcart__reDrawTotal();
						tcart__saveLocalObj();
					}

					var submitButton = document.querySelector('.t706 .t-form__submit button');
					submitButton.classList.remove('t706__submit_disable');
					submitButton.removeAttribute('disabled');

					deletedReturnBtn.removeEventListener('click', deletedReturnClickHandler);
				};
				deletedReturnBtn.addEventListener('click', deletedReturnClickHandler);
			});
        }
    } else {
        // старый вариант корзины

        // восстанавливает товар из LS
        if (window.tcart.products[cartProductIndex] === undefined) {
            tcart__syncProductsObject__LStoObj();
        }

        window.tcart.products.splice(cartProductIndex, 1);
		if (productElement.parentNode !== null) {
			productElement.parentNode.removeChild(productElement);
		}
        tcart__updateTotalProductsinCartObj();
        tcart__reDrawCartIcon();
        tcart__saveLocalObj();
        tcart__reDrawProducts();
        tcart__reDrawTotal();

        if (window.tcart.products.length === 0) {
            tcart__closeCart();
        }
    }
}

function tcart__product__editquantity(buttonElement) {
    var quantity = '';
    if (buttonElement.querySelector('.t706__product-quantity-inp')) {
        return;
    }
    var productElement = buttonElement.closest('.t706__product');
    var cartProductIndex = productElement.getAttribute('data-cart-product-i');
    var buttonElementText = parseInt(buttonElement.textContent, 10);
    if (buttonElementText == 0 || buttonElementText > 0) {
        quantity = buttonElementText;
    } else {
        quantity = 1;
    }

    var str = '<input type="text" name="tilda-tmp-cart-qnt" class="t706__product-quantity-inp" value="' + quantity + '" style="width:30px">';
    buttonElement.innerHTML = str;
    buttonElement.classList.add('t706__product-quantity_editing');

    var quantityInput = buttonElement.querySelector('.t706__product-quantity-inp');
    quantityInput.addEventListener('focus', function () {
        var inputElement = this;
        setTimeout(function () {
            inputElement.selectionStart = inputElement.selectionEnd = 10000;
        }, 0);
    });
    quantityInput.focus();

    quantityInput.addEventListener('focusout', function () {
        var quantity = '';
        var quantityInputValue = parseInt(quantityInput.value, 10);
        if (quantityInputValue > 0) {
            quantity = quantityInputValue;
        } else {
            quantity = 1;
        }

        tcart__product__updateQuantity(buttonElement, productElement, cartProductIndex, quantity);

        buttonElement.textContent = window.tcart.products[cartProductIndex].quantity;
        buttonElement.classList.remove('t706__product-quantity_editing');
    });
}

function tcart__product__updateQuantity(buttonElement, productElement, cartProductIndex, quantity) {
    if (quantity > 0) {
        if (window.tcart.products[cartProductIndex].inv !== undefined && window.tcart.products[cartProductIndex].inv > 0) {
            if (quantity > window.tcart.products[cartProductIndex].inv) {
                alert(tcart_dict('limitReached'));
                quantity = window.tcart.products[cartProductIndex].inv;
            }
        }

        window.tcart.products[cartProductIndex].quantity = quantity;
        window.tcart.products[cartProductIndex].amount = window.tcart.products[cartProductIndex].price * window.tcart.products[cartProductIndex].quantity;
        window.tcart.products[cartProductIndex].amount = tcart__roundPrice(window.tcart.products[cartProductIndex].amount);
        productElement.querySelector('.t706__product-quantity').innerHTML = window.tcart.products[cartProductIndex].quantity;

        if (window.tcart.products[cartProductIndex].single === 'y' && window.tcart.products[cartProductIndex].portion !== undefined) {
            productElement.querySelector('.t706__product-portion').innerHTML = tcart__showWeight(window.tcart.products[cartProductIndex].quantity * window.tcart.products[cartProductIndex].portion, window.tcart.products[cartProductIndex].unit);
        }

		var productAmount = productElement.querySelector('.t706__product-amount');
        if (window.tcart.products[cartProductIndex].amount > 0) {
            productAmount.innerHTML = tcart__showPrice(window.tcart.products[cartProductIndex].amount);
        } else {
            productAmount.innerHTML = '';
        }
    } else {
        tcart__product__del(buttonElement);
    }

    tcart__updateTotalProductsinCartObj();
    tcart__reDrawCartIcon();
    tcart__reDrawTotal();
    tcart__saveLocalObj();

    if (quantity == 0) {
        tcart__reDrawProducts();
    }
}

function tcart__delZeroquantity_inCartObj() {
    var products = window.tcart['products'];
    var isModified = '';
    if (products.length > 0) {
        products.forEach(function (product, index) {
            if (typeof product != 'undefined' && product['quantity'] == 0) {
                window.tcart.products.splice(index, 1);
                isModified = 'yes';
            }
        });
    }
    if (isModified == 'yes') {
        tcart__saveLocalObj();
    }
}

function tcart__drawBottomTotalAmount() {
    var str = '';
    str += '<div class="t706__cartwin-totalamount-wrap t-descr t-descr_xl">';

    str += '<div class="t706__cartwin-totalamount-info" style="margin-top: 10px; font-size:14px; font-weight:400;"></div>';

    str += '<span class="t706__cartwin-totalamount-label">' + tcart_dict('total') + ': ' + '</span>';
    str += '<span class="t706__cartwin-totalamount"></span>';
    str += '</div>';
    document.querySelector('.t706 .t-form__errorbox-middle').insertAdjacentHTML('beforebegin', str);
}

function tcart__addDelivery() {
    var deliveryWrapper = document.querySelector('.t706 .t-form .t-radio__wrapper-delivery');
    if (!deliveryWrapper) return;

    /* add first value if some variant checked by default */
	var selectedDelivery = document.querySelector('.t706 .t-form .t-radio__wrapper-delivery input:checked') ? document.querySelector('.t706 .t-form .t-radio__wrapper-delivery input:checked') : document.querySelector('.t706 .t-form .t-radio__wrapper-delivery input')[0];
    if (selectedDelivery) {
		var deliveryName = selectedDelivery.value;
		var deliveryPrice = selectedDelivery.getAttribute('data-delivery-price');
		var deliveryServiceId = document.querySelector('.t706 .t-form .t-radio__wrapper-delivery .t-radio_delivery:checked').getAttribute('data-service-id');
	}
	if (typeof deliveryName !== 'undefined' && typeof deliveryPrice !== 'undefined' && deliveryName !== '') {
        deliveryPrice = tcart__cleanPrice(deliveryPrice);
        var nameStartIndex = deliveryName.indexOf('=');
        if (nameStartIndex > 0) {
            deliveryName = deliveryName.substring(0, nameStartIndex);
            deliveryName = deliveryName.trim();
        }
        window.tcart.delivery = {};
        window.tcart.delivery['name'] = deliveryName;
        window.tcart.delivery['price'] = deliveryPrice;
        if (deliveryServiceId) {
            window.tcart.delivery['service_id'] = deliveryServiceId;
        }

        // бесплатная доставка
        // получает порог бесплатной доставки для кастомных доставок
        if (window.tcart_newDeliveryActive && window.tcart_newDelivery.deliveryState.freeDeliveryThreshold >= 0) {
            window.tcart.delivery['freedl'] = window.tcart_newDelivery.deliveryState.freeDeliveryThreshold;
        } else if (deliveryWrapper.getAttribute('data-delivery-free') >= 0) {
            // получает порог бесплатной доставки для стандартных доставок
            window.tcart.delivery['freedl'] = parseInt(deliveryWrapper.getAttribute('data-delivery-free'), 10);
        }
    }

    var deliveryInputs = document.querySelectorAll('.t706 .t-form .t-radio__wrapper-delivery input');
    if (deliveryInputs.length) {
        Array.prototype.forEach.call(deliveryInputs, function(deliveryInput) {
			deliveryInput.addEventListener('change', function () {
				tcart__updateDelivery();
			});
		});
    }
}

function tcart__updateDelivery() {
	var selectedDelivery = document.querySelector('.t706 .t-form .t-radio__wrapper-delivery input:checked');
    var deliveryName = selectedDelivery.value;
    var deliveryPrice = selectedDelivery.getAttribute('data-delivery-price');

    if (deliveryName && deliveryPrice) {
        deliveryPrice = tcart__cleanPrice(deliveryPrice);
        if (deliveryName != '') {
            var nameStartIndex = deliveryName.indexOf('=');
            if (nameStartIndex > 0) {
                deliveryName = deliveryName.substring(0, nameStartIndex);
                deliveryName = deliveryName.trim();
            }
        }

        window.tcart.delivery = {};
        window.tcart.delivery['name'] = deliveryName;
        window.tcart.delivery['price'] = deliveryPrice;

        // бесплатная доставка
		// получает порог бесплатной доставки для кастомных доставок
        if (window.tcart_newDeliveryActive && window.tcart_newDelivery.deliveryState.freeDeliveryThreshold >= 0) {
            window.tcart.delivery['freedl'] = window.tcart_newDelivery.deliveryState.freeDeliveryThreshold;
        } else {
			// получает порог бесплатной доставки для стандартных доставок
            var deliveryWrapper = document.querySelector('.t706 .t-form .t-radio__wrapper-delivery');
            if (deliveryWrapper.getAttribute('data-delivery-free') >= 0) {
                window.tcart.delivery['freedl'] = parseInt(deliveryWrapper.getAttribute('data-delivery-free'), 10);
            }
        }
    } else if (window.tcart.delivery !== undefined) {
        delete window.tcart.delivery;
    }

    if (document.querySelector('.t706 #customdelivery')) {
        if (tcart_newDelivery.fillTcartDelivery === undefined) {
            tcart_newDelivery.saveTcartDelivery();
        } else {
            tcart_newDelivery.fillTcartDelivery();
        }
        tcart_newDelivery.setFullAddress(tcart_newDelivery.getFullAddress());
    }

    if (window.tcart['products'] === undefined || window.tcart['products'].length === 0) {
        tcart__syncProductsObject__LStoObj();
    }

    tcart__updateTotalProductsinCartObj();
    tcart__reDrawTotal();
}

// eslint-disable-next-line no-unused-vars
function tcart__addPromocode(promocodeObject) {
	// предотвращает двойную активацию промокода
    if (typeof window.tcart.promocode == 'object') {
        // eslint-disable-next-line no-console
        console.error('Error. Promocode already activated before');
        return;
    }

    if (typeof promocodeObject == 'object' && typeof promocodeObject['promocode'] != 'undefined' && promocodeObject['promocode'] != '' && (promocodeObject['discountsum'] > 0 || promocodeObject['discountpercent'] > 0)) {
        window.tcart.promocode = promocodeObject;
    }

    if (window.tcart_newDeliveryActive && window.tcart.amount && window.tcart.total) {
        tcart__rerenderDeliveryServices();
    }
    tcart__updateTotalProductsinCartObj();
    tcart__reDrawTotal();
}

function tcart__addEvent__selectpayment() {
    if (document.querySelectorAll('.t706 .t-input-group_pm').length == 0) {
        return;
    }

    var paymentInputs = document.querySelectorAll('.t706 .t-form .t-radio__wrapper-payment input');
    if (paymentInputs.length) {
		Array.prototype.forEach.call(paymentInputs, function(paymentInput) {
			paymentInput.addEventListener('change', function () {
				var variantInput = document.querySelector('.t706 .t-form .t-radio__wrapper-payment input:checked');
				var variant;
				if (variantInput) {
					variant = document.querySelector('.t706 .t-form .t-radio__wrapper-payment input:checked').getAttribute('data-payment-variant-system');
				}
				if (!variant) {
					variant = '';
				}
				document.querySelector('.t706').setAttribute('data-payment-variant-system', variant);
				window.tcart['system'] = variant;
			});
		});
        document.querySelector('.t706 .t-form .t-radio__wrapper-payment input:checked').dispatchEvent(new Event('change'));
    }
}

function tcart__escapeHtml(text) {
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

function tcart__escapeHtmlImg(text) {
    var map = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
    };
    return text.replace(/[<>"]/g, function (m) {
        return map[m];
    });
}

function tcart__cleanPrice(price) {
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

function tcart__roundPrice(price) {
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

function tcart__showWeight(weight, unit) {
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

        var position = -1;
        var key = '';

        Object.keys(convertedUnits).forEach(function (el) {
            var index = convertedUnits[el].units.indexOf(unit);
            if (index >= 0) {
                position = index;
                key = el;
            }
        });

        if (position >= 0 && key !== '') {
            var value = convertedUnits[key].value;
            for (var i = position + 1; i < convertedUnits[key].units.length; i++) {
                if (weight > value) {
                    weight /= value;
                    unit = convertedUnits[key].units[i];
                }
            }
        }

        return tcart__roundPrice(weight) + ' ' + tcart_dict(unit);
    } else {
        return '';
    }
}

function tcart__showPrice(price) {
    if (typeof price == 'undefined' || price == 0 || price == '') {
        price = '';
    } else {
        price = price.toString();

        if (typeof window.tcart['currency_dec'] != 'undefined' && window.tcart['currency_dec'] == '00') {
            if (price.indexOf('.') === -1 && price.indexOf(',') === -1) {
                price = price + '.00';
            } else {
                var priceDecimal = price.substr(price.indexOf('.') + 1);
                if (priceDecimal.length === 1) {
                    price = price + '0';
                }
            }
        }

        price = price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        if (typeof window.tcart['currency_sep'] != 'undefined' && window.tcart['currency_sep'] == ',') {
            price = price.replace('.', ',');
        }
        price = window.tcart['currency_txt_l'] + price + window.tcart['currency_txt_r'];
    }
    return price;
}

/**
 * fix IOS11 cursor bug + general IOS background scroll
 */
function tcart__lockScroll() {
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

function tcart__unlockScroll() {
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

function tcart__clearProdUrl() {
    try {
        var currentUrl = window.location.href;
        // проверяет стандартный product url
        var indexToRemove = currentUrl.indexOf('#!/tproduct/');
        if (window.isiOS && indexToRemove < 0) {
            indexToRemove = currentUrl.indexOf('%23!/tproduct/');
            if (indexToRemove < 0) {
                indexToRemove = currentUrl.indexOf('#%21%2Ftproduct%2F');
            }
        }
        // проверяет product url каталога
        if (indexToRemove < 0) {
            tcart__onFuncLoad('t_store_closePopup', function () {
                t_store_closePopup(false);
            });
        }
        if (indexToRemove < 0) {
            return;
        }
        // меняет url
        currentUrl = currentUrl.substring(0, indexToRemove);
        if (typeof history.replaceState != 'undefined') {
            try {
                window.history.replaceState('', '', currentUrl);
            } catch (e) { /* */ }
        }
    } catch (e) { /* */ }
}

function tcart__onFuncLoad(funcName, okFunc, time) {
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

function tcart_fadeOut(el, duration, complete) {
	var opacity = 1;
	duration = parseInt(duration);
	var speed = duration > 0 ? duration / 10 : 40; // default duration = 400
	var timer = setInterval(function() {
		el.style.opacity = opacity;
		opacity -= 0.1;
		if (opacity <= 0.1) {
			clearInterval(timer);
			el.style.display = 'none';
			if (typeof complete === 'function') {
				complete();
			}
		}
	}, speed);
}

function tcart_fadeIn(el, duration, complete) {
	if ((getComputedStyle(el).opacity === '1' || getComputedStyle(el).opacity === '') && getComputedStyle(el).display !== 'none') return false;
	var opacity = 0;
	duration = parseInt(duration);
	var speed = duration > 0 ? duration / 10 : 40;
	el.style.opacity = opacity;
	el.style.display = '';
	var timer = setInterval(function() {
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

/**
 * Method isEmptyObject for ie8+
 *
 * @param {object} obj - object for checked
 * @returns {boolean} - return true/false
 */
 function tcart__isEmptyObject(obj) {
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


/**
 * Polyfill: Element.closest
 */
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
function tcart_changeEndpoint(error, callback) {
    if (
        error &&
        (error.status >= 500 || error.status == 408 || error.status == 410 || error.status == 429 || error.statusText == 'timeout' || (error.status == 0 && error.state() == 'rejected')) &&
        window.tcart_endpoint.indexOf('store.tildacdn.com') !== -1
    ) {
        window.tcart_endpoint = 'store2.tildacdn.com';
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

/**
 * Method jq serializeArray in js for IE8+
 *
 * @param {Node} form - form element
 * @returns {Array} - arr name and value input
 */
 function tcart__serializeCartForm(form) {
	var arr = [];
	var elements = form.elements;
	for (var i = 0; i < elements.length; i++) {
		// если элементы не имеют name или disabled или скрыты и name !== tildadelivery-pickup-name - пропускаем их
		if (!elements[i].name || elements[i].disabled || ((elements[i].type == 'hidden' || elements[i].offsetParent === null) && elements[i].name.indexOf('tildadelivery-pickup-name') !== 0) || ['file', 'reset', 'submit', 'button'].indexOf(elements[i].type) > -1) continue;
		if (elements[i].type === 'select-multiple') {
			var options = elements[i].options;
			for (var j = 0; j < options.length; j++) {
				if (!options[j].selected) continue;
				arr.push({
					name: options[j].name,
					value: options[j].value
				});
			}
			continue;
		}
		if (['checkbox', 'radio'].indexOf(elements[i].type) > -1 && !elements[i].checked) continue;
		arr.push({
			name: elements[i].name,
			value: elements[i].value
		});
	}
	return arr;
}