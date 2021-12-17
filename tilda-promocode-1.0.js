/**
 * Init promo code in block
 * @param {string} recId - main block id
 * @param {string} lid - input group id
 */
// eslint-disable-next-line no-unused-vars
function t_input_promocode_init(recId, lid) {
    var rec = document.querySelector('#rec' + recId);
    var wrapper = rec.querySelector('[data-input-lid="' + lid + '"]');
    var inputPromocode = wrapper.querySelector('.t-inputpromocode');
    var btnPromocode = wrapper.querySelector('.t-inputpromocode__btn');

    inputPromocode.setAttribute('autocomplete', navigator.userAgent.search(/Chrome/) > 0 ? 'no' : 'off');

    inputPromocode.addEventListener('focus', function() {
        btnPromocode.style.display = 'table-cell';
    });

    btnPromocode.addEventListener('click', function() {
        t_input_promocode__applyPromoCode(wrapper, inputPromocode, btnPromocode);
    });
}

/**
 * Apply a promo code on request and add html text if the request was successful
 * @param {Node} wrapper - group input
 * @param {Node} input - input promo code
 * @param {Node} btn - button apply promo code
 */
 function t_input_promocode__applyPromoCode(wrapper, input, btn) {
    var val = input.value;

    if (!val) {
        // eslint-disable-next-line no-console
        console.log('Promo code is empty');
        return;
    }

    var allRecords = document.querySelector('#allrecords');
    var dataPromocode = {
        promocode: val,
        projectid: allRecords.getAttribute('data-tilda-project-id')
    };

    var dataPromocode = new FormData();

    dataPromocode.append('promocode', val);
    dataPromocode.append('projectid', allRecords.getAttribute('data-tilda-project-id'));

    if (!dataPromocode.has('projectid')) {
        alert(t_input_promocode__getLangText('badprojectid'));
        return;
    }
    var currentMode = allRecords.getAttribute('data-tilda-mode');

    if (currentMode !== 'edit' || currentMode !== 'preview') {
        if (window.t_promocode_load && window.t_promocode_load === 'y') return;

        window.t_promocode_load = 'y';
        btn.classList.add('t-btn_sending');

        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'https://forms.tildacdn.com/payment/promocode/', true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                delete window.t_promocode_load;
                btn.classList.remove('t-btn_sending');
                var data = xhr.responseText;

                if (data) {
                    var objData = JSON.parse(data);
                    if (typeof objData === 'object') {
                        if (objData['message'] && objData['message'] === 'OK') {
                            var str = '';

                            str += '<div style="font-weight:600;" class="t-text">' + t_input_promocode__getLangText('promocode') + ' ';
                            str += objData['promocode'];
                            str += ' ' + t_input_promocode__getLangText('activated') + '.<br>' + t_input_promocode__getLangText('discount') + ': ';
                            if (objData['discountsum'] && objData['discountsum'] > 0) {
                                if (typeof window.tcart === 'object') {
                                    try {
                                        if (typeof tcart__showPrice === 'function') {
                                            str += tcart__showPrice(objData['discountsum']);
                                        }
                                    } catch (err) {
                                        /* */
                                    }
                                } else {
                                    str += objData['discountsum'];
                                }
                            }
                            if (objData['discountpercent'] && objData['discountpercent'] > 0) {
                                str += parseFloat(objData['discountpercent']) + '%';
                            }
                            str += '</div>';
                            wrapper.querySelector('.t-inputpromocode__wrapper').innerHTML = str;
                            try {
                                t_onFuncLoad('tcart__addPromocode', function () {
                                    tcart__addPromocode(objData);
                                });
                            } catch (err) {
                                /* */
                            }
                        } else if (objData['error'] && objData['error']) {
                            alert(objData['error']);
                        } else {
                            alert('Promo code activation some error.');
                        }
                    } else {
                        alert('Promo code activation error. Bad answer from server');
                    }
                } else {
                    alert('Promo code activation error. Empty answer from server');
                }
            } else {
                delete window.t_promocode_load;
                btn.classList.remove('t-btn_sending');
                alert('Request status error ' + xhr.status);
            }
        };

        xhr.onerror = function() {
            delete window.t_promocode_load;
            btn.classList.remove('t-btn_sending');
            alert('Request timeout error (activate promo code)');
        };

        xhr.send(dataPromocode);
    } else {
        alert(t_input_promocode__getLangText('publish'));
        return;
    }
}

/**
 * Get language text
 * @param {string} msg - type text
 * @returns {string} - language text
 */
function t_input_promocode__getLangText(msg) {
    var dict = [];

    dict['publish'] = {
        EN: 'Please, publish the page, to test promo code activation functionality',
        RU: 'Пожалуйста, опубликуйте страницу, чтобы проверить функциональность активации промокода',
        FR: 'S\'il vous plaît, publier la page, pour tester la fonctionnalité d\'activation promo de code',
        DE: 'Bitte veröffentlichen Sie die Seite, um Testgutscheincode Aktivierung Funktionalität',
        ES: 'Por favor, publicar la página, a la funcionalidad de activación código promocional prueba',
        PT: 'Por favor, publicar a página, a funcionalidade de ativação código de teste promo',
        UK: 'Будь ласка, опублікуйте сторінку, щоб перевірити функціональність активації промокоду',
        JA: '、テスト用プロモーションコードのアクティベーション機能に、ページを公開してください。',
        ZH: '请发布页面，测试促销代码激活功能',
        PL: 'Opublikuj stronę, aby przetestować funkcjonalność aktywacji kodu promocyjnego',
        KK: 'Промокодты іске қосу функциясын тексеру үшін бетті жариялаңыз',
        IT: 'Si prega, pubblicare la pagina, alla funzionalità il codice di attivazione di prova promozionale`',
        LV: 'Lūdzu, publicējiet lapu, lai testa promo kodu aktivizācijas funkcionalitāti',
    };

    dict['badprojectid'] = {
        EN: 'Promo code activation error. Bad projectid',
        RU: 'Ошибка активации промокода. Некорректный projectid',
        FR: 'Promo Erreur d\'activation de code. Bad projectId',
        DE: 'Promo Code Aktivierungsfehler. Bad projectid',
        ES: 'Error de activación de código promocional. Mala projectId',
        PT: 'Promo erro de ativação código. Bad projectId',
        UK: 'Помилка активації промокоду. Поганий projectid',
        JA: 'プロモーションコードのアクティブ化エラー。悪い projectid',
        ZH: '促销代码激活错误。坏专案编号',
        PL: 'Błąd aktywacji kodu promocyjnego. Bad projectid',
        KK: 'Промокодты белсендіру қатесі. Нашар projectid',
        IT: 'Errore di attivazione codice promozionale. Bad projectid',
        LV: 'Promo kods aktivizācijas kļūda. Bad projectid',
    };

    dict['promocode'] = {
        EN: 'Promo code',
        RU: 'Промокод',
        FR: 'Code promo',
        DE: 'Gutscheincode',
        ES: 'Código promocional',
        PT: 'Código promocional',
        UK: 'Промокод',
        JA: 'プロモーションコード',
        ZH: '促销代码',
        PL: 'Kod rabatowy',
        KK: 'Промокод',
        IT: 'Codice promozionale',
        LV: 'Promo kods',
    };

    dict['activated'] = {
        EN: 'has been activated',
        RU: 'активирован',
        FR: 'a été activé',
        DE: 'wurde aktiviert',
        ES: 'Ha sido activado',
        PT: 'Foi ativado',
        UK: 'активований',
        JA: '活性化されています',
        ZH: '已被激活',
        PL: 'został aktywowany',
        KK: 'болды белсендірілді',
        IT: 'è stato attivato',
        LV: 'ir aktivizēta',
    };

    dict['discount'] = {
        EN: 'Your discount',
        RU: 'Ваша скидка',
        FR: 'votre remise',
        DE: 'Ihr Rabatt',
        ES: 'su descuento',
        PT: 'seu desconto',
        UK: 'Ваша знижка',
        JA: 'あなたの割引',
        ZH: '您的折扣',
        PL: 'Twój rabat',
        KK: 'Сіздің жеңілдік',
        IT: 'Lo sconto',
        LV: 'Jūsu atlaide',
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