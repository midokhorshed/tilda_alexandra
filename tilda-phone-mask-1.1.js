// The script is responsible for the automatic phone masks for different countries with country codes by default in input type "Phone" in the form

//////
// All method for IE

/**
 * Method ready for ie
 * @param {function} fn
 */
function t_ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

/**
 * Method siblings for ie
 * @param {Node} el
 * @param {string} className
 * @returns {Array}
 */
function t_siblings(el, className) {
    if (!el.parentNode) return [];

    return Array.prototype.filter.call(el.parentNode.children, function (child) {
        return child.classList.contains(className);
    });
}

/**
 * Method closest
 * @param {Node} element
 * @param {string} className
 * @returns {Node | undefined}
 */
function t_getParent(element, className) {
	while (element.nodeType === 1) {
		if(element.classList.contains(className)) {
			return element;
		}
		element = element.parentNode;
	}
	return undefined;
}

t_ready(t_form_phonemask__initPhoneMask);

// Collects input type "Phone" and initializes phone mask
function t_form_phonemask__initPhoneMask() {
    var phoneMaskList = document.querySelectorAll('.js-phonemask-input');

    Array.prototype.forEach.call(phoneMaskList, t_form_phonemask_load);
}

// eslint-disable-next-line no-unused-vars
function t_form_phonemask_load_one(recId) {
    var phoneMaskList = document.querySelectorAll('#rec' + recId + ' .js-phonemask-input');

    Array.prototype.forEach.call(phoneMaskList, t_form_phonemask_load);
}

// Get recId block, lid field and add init flag about init mask phone
function t_form_phonemask_load(input) {
    // todo jqeury element
    if (input[0]) {
        input = input[0];
    }

    var recId = input.getAttribute('data-phonemask-id');
    var lid = input.getAttribute('data-phonemask-lid');
    var maskcountry = input.getAttribute('data-phonemask-maskcountry') || '';

    input.setAttribute('data-phonemask-init', 'yes');

    setTimeout(function () {
        try {
            t_form_phonemask_init(recId, lid, maskcountry);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
        }
    }, 1000);
}

/**
 * Check the availability of the country to install otherwise get it
 * @param {number | string} recId - rec id block
 * @param {number | string} lid - id field
 * @param {string} iso - str country
 */
function t_form_phonemask_init(recId, lid, iso) {
    if (iso) {
        t_form_phonemask_initPhoneMaskForm(recId, lid, iso);
    } else if (window.geo_iso) {
        t_form_phonemask_initPhoneMaskForm(recId, lid, window.geo_iso);
    } else {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://geo.tildacdn.com/geo/country/', true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                var data = xhr.responseText;
                t_form_phonemask_initPhoneMaskForm(recId, lid, data);
            } else {
                t_form_phonemask_initPhoneMaskForm(recId, lid, '');
            }
        };

        xhr.onerror = function() {
            t_form_phonemask_initPhoneMaskForm(recId, lid, '');
        };

        xhr.send();
    }
}

/**
 * Finds elements, replaces fields, init styles, adds handlers
 * @param {number | string} recId - rec id block
 * @param {number | string} lid - id field
 * @param {string} iso - str country
 */
function t_form_phonemask_initPhoneMaskForm(recId, lid, iso) {
    var rec = document.querySelector('#rec' + recId);
    var inputGroup = rec.querySelector('[data-input-lid="' + lid + '"]');

    if (!inputGroup) {
        if (window.tildamode && window.tildamode === 'zero') {
            inputGroup = rec.querySelector('.tn-artboard [data-input-lid="' + lid + '"]');
            if (!inputGroup) inputGroup = rec.querySelector('.tn-artboard');
        } else {
            inputGroup = document.querySelector('[data-input-lid="' + lid + '"]');
            if (!inputGroup) inputGroup = document.body;
        }
    }

    if (inputGroup.getAttribute('data-init-mask')) return;

    t_form_phonemask__replaceInput(inputGroup);

    if (!rec.querySelector('.t-input-phonemask__wrap').classList.contains('t-input-phonemask__wrap-style')) {
        t_form_phonemask__addStyle();
    }

    var input = inputGroup.querySelector('.t-input-phonemask');

    if (typeof iso !== 'string' || !iso) iso = '';

    if (iso.length > 0) iso = iso.toLowerCase();

    if (iso.length > 2) iso = '';

    var countries = t_form_phonemask__getCountriesList();

    if (countries[iso]) {
        var country = countries[iso];
    } else {
        var country = {
            n: 'Russian Federation (Российская Федерация)',
            c: '+7',
            m: '+7(999) 999-99-99'
        };
        var iso = 'ru';
    }

    input.setAttribute('data-phonemask-code', iso.length > 0 ? country.c : '');
    input.setAttribute('data-phonemask-mask', iso.length > 0 ? country.m : '');

    t_form_phonemask__calcMaxlength(input);

    var selectFlag = inputGroup.querySelector('.t-input-phonemask__select-flag');
    var selectCode = inputGroup.querySelector('.t-input-phonemask__select-code');
    var currentMask = input.getAttribute('data-phonemask-mask');
    var currentCode = input.getAttribute('data-phonemask-code');

    if (iso.length > 0) {
        localStorage.setItem('iso_code', iso);
        selectFlag.setAttribute('data-phonemask-flag', iso);
        selectCode.innerHTML = country.c;
        if (currentMask) {
            input.setAttribute('placeholder', currentMask.substr(currentCode.length).replace(/^-+/, ''));
        }
        t_form_phonemask__changeMinLength(input.getAttribute('placeholder'), currentCode, inputGroup);
    }

    t_form_phonemask__addCurrentStyle(inputGroup);

    var optionsWrap = inputGroup.querySelector('.t-input-phonemask__options-wrap');
    optionsWrap.innerHTML = t_form_phonemask__getDrawSelector(countries);

    t_form_phonemask__initSelectEvents(rec, inputGroup, countries);

    inputGroup.setAttribute('data-init-mask', 'yes');
}

/**
 * Substitution of a field during initialization
 * @param {Node} inputGroup - substitution field
 */
function t_form_phonemask__replaceInput(inputGroup) {
    var input = inputGroup.querySelector('.js-phonemask-input');
    if (!input) return;

    var name = input.getAttribute('name');
    var dataReq = input.getAttribute('data-tilda-req') ? 'data-tilda-req="1"' : '';
    var borderBottom = input.classList.contains('t-input_bbonly') ? true : false;
    var style = input.getAttribute('style');

    input.outerHTML = '' +
        '<div class="t-input t-input-phonemask__wrap" style="' + style + '">' +
            '<div class="t-input-phonemask__select">' +
                '<span class="t-input-phonemask__select-flag" data-phonemask-flag=""></span>' +
                '<span class="t-input-phonemask__select-triangle"></span>' +
                '<span class="t-input-phonemask__select-code"></span>' +
            '</div>' +
            '<div class="t-input-phonemask__options-wrap" data-nosnippet></div>' +
            '<input type="tel" class="t-input t-input-phonemask" name="tildaspec-phone-part[]" value="" placeholder="">' +
            '<input type="hidden" class="js-phonemask-result js-tilda-rule" data-tilda-rule="phone" name="' + name + '" value="" ' + dataReq + ' tabindex="-1">\
        </div>';

    var wrap = inputGroup.querySelector('.t-input-phonemask__wrap');

    if (borderBottom) wrap.classList.add('t-input_bbonly');

    var visPhone = t_siblings(wrap, 't-input__vis-ph');

    if (visPhone.length === 0) return;

    Array.prototype.forEach.call(visPhone, function(phone) {
        phone.remove();
    });
}

/**
 * Calc max length in input maxlength attr
 * @param {Node} input - field for dialing the phone
 */
function t_form_phonemask__calcMaxlength(input) {
    var maskWithoutCode = input.getAttribute('data-phonemask-mask').substr(input.getAttribute('data-phonemask-code').length);

    if (maskWithoutCode.charAt(0) === '-') {
        maskWithoutCode = maskWithoutCode.substring(1);
    }

    input.setAttribute('maxlength', maskWithoutCode.length);
    input.setAttribute('data-phonemask-without-code', maskWithoutCode);
}

/**
 * Add style for select group
 * @param {Node} inputGroup
 */
function t_form_phonemask__addCurrentStyle(inputGroup) {
    var input = inputGroup.querySelector('.t-input-phonemask');
    var inputBlock = inputGroup.querySelector('.t-input-block');
    var optionsWrap = inputGroup.querySelector('.t-input-phonemask__options-wrap');
    var selectCode = inputGroup.querySelector('.t-input-phonemask__select-code');
    var color = optionsWrap.style.color;
    var fontSize = optionsWrap.style.fontSize;

    inputBlock.style.overflow = 'initial';

    if (color !== 'rgba(0, 0, 0, 0)') input.style.color = color;

    input.style.fontSize = fontSize;
    input.style.fontWeight = optionsWrap.style.fontWeight;
    selectCode.style.fontSize = fontSize;
}

/**
 * Get country list
 * @param {Array} countries - array list country
 * @returns {string} - string node elements
 */
function t_form_phonemask__getDrawSelector(countries) {
    var str = '';
    str += '<noindex>';
    for (var country in countries) {
        str += '<div class="t-input-phonemask__options-item" id="t-phonemask_' + country + '" data-phonemask-name="' + countries[country].n + '" data-phonemask-mask="' + countries[country].m + '" data-phonemask-country-code="' + country + '" data-phonemask-code="' + countries[country].c + '">';
        str += '<div class="t-input-phonemask__options-name">' + countries[country].n + '</div>';
        str += '<span class="t-input-phonemask__options-code">' + countries[country].c + '</span>';
        str += '<span class="t-input-phonemask__options-flag t-input-phonemask__options-flag_' + country + '"></span>';
        str += '</div>';
    }
    str += '</noindex>';
    return str;
}

/**
 * Add events for select country
 * @param {number | string} rec - rec id block
 * @param {Node} inputGroup - group field
 * @param {object} countries - object with data about each city
 */
function t_form_phonemask__initSelectEvents(rec, inputGroup, countries) {
    var cover = rec.querySelectorAll('.t-cover, .t396__artboard');
    var input = inputGroup.querySelector('.t-input-phonemask');
    var select = inputGroup.querySelector('.t-input-phonemask__select');
    var selectWrap = inputGroup.querySelector('.t-input-phonemask__options-wrap');
    var optionItems = inputGroup.querySelectorAll('.t-input-phonemask__options-item');
    var word = '';
    var timeout = '';

    function resetTimeout() {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            word = '';
        }, 1500);
    }

    function t_form_phonemask__toggleSelect() {
        if (selectWrap.classList.contains('t-input-phonemask__options-wrap_open')) {
            t_form_phonemask__activeSelectClose();
        } else {
            t_form_phonemask__activeSelectClose();
            selectWrap.classList.add('t-input-phonemask__options-wrap_open');
        }

        if (cover.length === 1) cover[0].style.overflow = 'unset';
    }

    function t_form_phonemask__activeSelectClose() {
        var activeSelect = document.querySelector('.t-input-phonemask__options-wrap_open');
        if (activeSelect) activeSelect.classList.remove('t-input-phonemask__options-wrap_open');
    }

    function t_form_phonemask__changeInputVal() {
        var self = this;
        var value = self.value;

        if (value === '(' || !value) {
            self.value = '';
            inputGroup.querySelector('.js-phonemask-result').value = '';
        }

        self.setAttribute('data-phonemask-current', value);

        var curValue = t_form_phonemask__copypasteHandling(self, self.getAttribute('data-phonemask-without-code'));

        t_form_phonemask__addNumberMask(curValue, self);
        t_form_phonemask__changeVal(inputGroup, input);

        if (self.getAttribute('data-phonemask-code') === '+7' && self.value.indexOf('89') === 1) {
            self.value = self.value.replace('89', '9');
        }
    }

    function t_form_phonemask__changeOption() {
        t_form_phonemask__chooseCountry(inputGroup, this);
        t_form_phonemask__calcMaxlength(input);
        t_form_phonemask__activeSelectClose();
        if (cover.length === 1) cover[0].style.overflow = '';
    }

    function t_form_phonemask__getOutsideClick(e) {
        var elem = t_getParent(e.target, 't-input-phonemask__options-wrap');
        var select = t_getParent(e.target, 't-input-phonemask__select');

        if (!elem && !select) {
            t_form_phonemask__activeSelectClose();
            if (cover.length === 1) cover[0].style.overflow = '';
        }
    }

    function t_form_phonemask__handlerKeyUp(e) {
        var activeSelect = document.querySelector('.t-input-phonemask__options-wrap_open');
        if (!activeSelect) return;

        var regExp = /[-[\]/{}()*+?.\\^$|]/g;
        var itemChosen = activeSelect.querySelector('.t-input-phonemask__options-item_chosen');
        var searchCountry = [];

        if (itemChosen) itemChosen.classList.remove('t-input-phonemask__options-item_chosen');

        if (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 96 && e.keyCode <= 105) {
            word = word + e.key;
            word = word.replace(regExp, '\\$&');
            for (var country in countries) {
                t_form_phonemask__searchCountry(activeSelect, word, searchCountry, country, countries[country].c);
            }
        } else if (e.keyCode >= 65 && e.keyCode <= 90 || e.keyCode == 32) {
            word = word + e.key;
            word = word.replace(regExp, '\\$&');
            for (var country in countries) {
                t_form_phonemask__searchCountry(activeSelect, '^' + word, searchCountry, country, countries[country].n);
            }
        }
        resetTimeout();
    }

    t_form_phonemask__changeVal(inputGroup, input);

    select.addEventListener('click', t_form_phonemask__toggleSelect);
    input.addEventListener('input', t_form_phonemask__changeInputVal);
    Array.prototype.forEach.call(optionItems, function(option) {
        option.addEventListener('click', t_form_phonemask__changeOption);
    });

    if (!document.querySelector('[data-init-mask="yes"]')) {
        document.addEventListener('mouseup', t_form_phonemask__getOutsideClick);
        document.addEventListener('keyup', t_form_phonemask__handlerKeyUp);
    }
}

/**
 * Checks the field value is greater than the mask value
 * @param {Node} input - field for dialing the phone
 * @param {string} maskWithoutCode mask phpne
 * @returns {string}
 */
function t_form_phonemask__copypasteHandling(input, maskWithoutCode) {
    var currentValue = input.value;
    var valueArr = currentValue.match(/[0-9]/g) ? currentValue.match(/[0-9]/g) : currentValue;

    if (valueArr.length > maskWithoutCode.match(/[0-9]/g).join('').length) {
        currentValue = valueArr.splice(input.getAttribute('data-phonemask-code').match(/[0-9]/g).length).join('');
    }

    return currentValue;
}

/**
 * Add number mask in input phone
 * @param {string} val - value field phone
 * @param {Node} input - field for dialing the phone
 */
function t_form_phonemask__addNumberMask(val, input) {
    var inputCode = input.getAttribute('data-phonemask-code');
    var inputMask = input.getAttribute('data-phonemask-mask').substr(inputCode.length);
    var number = val.match(/\d+/g);

    if (number) {
        number = number.join('');
    } else {
        number = '';
    }

    var numberArr = number.split('');
    var maskArr = inputMask.match(/(\+|\d+|[\s()-]|9+)/g);
    var phoneString = '';

    if (maskArr) {
        for (var i = 0; i < maskArr.length; i++) {
            if (maskArr[i][0] === '9') {
                phoneString += numberArr.slice(0, maskArr[i].length).join('');
                numberArr.splice(0, maskArr[i].length);
            } else {
                phoneString += maskArr[i];
            }
        }

        phoneString = phoneString.replace(/[\s()-]+$/, '');
        phoneString = phoneString.replace(/^-+/, '');
        input.value = phoneString;
    }
}

/**
 * Change value in phone input and hide input result
 * @param {Node} inputGroup - group field
 * @param {Node} input - field for dialing the phone
 */
function t_form_phonemask__changeVal(inputGroup, input) {
    if (input.value) {
        inputGroup.querySelector('.js-phonemask-result').value = input.getAttribute('data-phonemask-code') + ' ' + input.value;
    }
}

/**
 * Selected country from the list country
 * @param {Node} inputGroup - group input
 * @param {Node} option - selected option
 */
function t_form_phonemask__chooseCountry(inputGroup, option) {
    var input = inputGroup.querySelector('.t-input-phonemask');
    var selectCode = inputGroup.querySelector('.t-input-phonemask__select-code');
    var selectFlag = inputGroup.querySelector('.t-input-phonemask__select-flag');
    var currentCode = option.getAttribute('data-phonemask-code');
    var currentMask = option.getAttribute('data-phonemask-mask');
    var currentCountryCode = option.getAttribute('data-phonemask-country-code');
    var currentInput = input.getAttribute('data-phonemask-current');

    input.setAttribute('data-phonemask-code', currentCode);
    input.setAttribute('data-phonemask-mask', currentMask);
    input.setAttribute('placeholder', currentMask.substr(currentCode.length).replace(/^-+/, ''));

    selectCode.innerHTML = currentCode;
    selectFlag.setAttribute('data-phonemask-flag', currentCountryCode);

    localStorage.setItem('iso_code', currentCountryCode);
    input.focus();

    if (currentInput) {
        t_form_phonemask__addNumberMask(currentInput, input);
    }

    t_form_phonemask__changeVal(inputGroup, input);
    t_form_phonemask__changeMinLength(input.getAttribute('placeholder'), currentCode, inputGroup);
}

/**
 * Search country in the list countrys and scroll to the found country
 * @param {Node} container - block list country
 * @param {string} regexp - search string
 * @param {Node} searchCountry - search option country
 * @param {string} country - str iso country
 * @param {string} property - str name country
 */
function t_form_phonemask__searchCountry(container, regexp, searchCountry, country, property) {
    var regExp = new RegExp(regexp, 'i');

    if (property.search(regExp) !== -1) {
        searchCountry.push(container.querySelector('#t-phonemask_' + country));
        searchCountry[0].classList.add('t-input-phonemask__options-item_chosen');

        var activeSelectTop = container.querySelector('.t-input-phonemask__options-item_chosen').getBoundingClientRect().top;
        var containerTop = container.getBoundingClientRect().top;
        var calcScroll = document.body.scrollTop + container.scrollTop;

        container.scrollTop = activeSelectTop - containerTop + calcScroll;
    }
}

/**
 * Add min length symbol hide input result
 * @param {string} mask - mask country phone
 * @param {string} code - code country phone
 * @param {Node} inputGroup - group field
 */
function t_form_phonemask__changeMinLength(mask, code, inputGroup) {
    var minlength = 1;

    if (mask && code) {
        var spaceLength = 1;
        var input = inputGroup.querySelector('.t-input-phonemask');
        var inputResult = inputGroup.querySelector('.js-phonemask-result');
        var phonemaskCode = input.getAttribute('data-phonemask-code');

        var floatingLength = {
            /* Условие для Германии, Эстонии, Албании, Австрии, Алжира, Бутана, Ботсваны, Болгарии, Кубы, Венгрии, Ливана, Аргентины, Южной Кореи, Бангладеша, Палестины, Хорватии, Кипра, Австралии, Панамы, Бразилии, Турции, Франции, Эквадора, Косово, Италии, ОАЭ, Китая – может быть разное количество цифр в номере */
            '+49': 1,
            '+372': 1,
            '+355': 1,
            '+213': 1,
            '+975': 1,
            '+267': 1,
            '+359': 1,
            '+53': 1,
            '+36': 1,
            '+961': 1,
            '+54': 1,
            '+82': 1,
            '+880': 1,
            '+970': 1,
            '+385': 1,
            '+43': 1,
            '+357': 1,
            '+61': 1,
            '+507': 1,
            '+55': 1,
            '+90': 1,
            '+33': 1,
            '+593': 1,
            '+383': 1,
            '+39': 1,
            '+971': 1,
            '+86': 1,
            /* Условие для Израиля и Нигерии – может быть от 8 до 10 цифр */
            '+972': 2,
            '+234': 2,
            /* Условие для Великобритании – может быть от 7 до 11 цифр */
            '+44': 4,
            /* Условие для Финляндии – может быть от 6 до 10 цифр */
            '+358': 4,
        };

        minlength = code.length + spaceLength + mask.length - (floatingLength[phonemaskCode] || 0);
    }

    inputResult.setAttribute('data-tilda-rule-minlength', minlength);
}

// style flag contry
function t_form_phonemask__addStyle() {
    var css = '.t-input-group.js-error-control-box .t-input-phonemask{border:0!important}.t-input_pvis.t-input-phonemask__wrap{padding-top:0;padding-bottom:0}.t-input-phonemask__wrap{position:relative;display:-ms-flexbox;display:-webkit-flex;display:flex}.t-input-phonemask{height:auto;padding:0;background-color:transparent}.t-input-phonemask__options-wrap{display:none;position:absolute;top:calc(100% + 5px);left:0;z-index:10;min-width:410px;max-height:200px;padding-top:5px;padding-bottom:5px;background-color:#fff;border:1px solid #eee;border-radius:7px;box-shadow:0 0 1px rgba(0,0,0,.1);overflow-y:scroll}.t-input-phonemask__options-wrap.t-input-phonemask__options-wrap_open{display:block}.t-input-phonemask__options-item{display:-ms-flexbox;display:-webkit-flex;display:flex;-ms-flex-pack:end;-webkit-justify-content:flex-end;justify-content:flex-end;-ms-flex-align:center;-webkit-align-items:center;align-items:center;padding:8px 10px;font-family:sans-serif;font-size:14px;color:#000!important;cursor:pointer}.t-input-phonemask__options-item.t-input-phonemask__options-item_chosen,.t-input-phonemask__options-item:hover{background-color:#eee}.t-input-phonemask__options-name{margin-right:auto;text-align:left}.t-input-phonemask__select{display:-ms-flexbox;display:-webkit-flex;display:flex;-ms-flex-align:center;-webkit-align-items:center;align-items:center;margin-right:5px;margin-left:0;font-size:16px;cursor:pointer}.t-input-phonemask__select-triangle{position:relative;margin-left:6px;border-style:solid;border-width:5px 4px 0;border-color:#9a9a9a transparent transparent}.t-input-phonemask__select-code{white-space:nowrap}.t-input-phonemask__options-code,.t-input-phonemask__select-code{margin-left:10px}.t-input-phonemask__options-flag,.t-input-phonemask__select-flag{width:18px;height:13px;background-color:#c5c5c5;box-shadow:0 0 5px rgba(0,0,0,.3)}.t-input-phonemask__options-flag{margin-left:8px}.t-input-phonemask__options-wrap::-webkit-scrollbar{width:8px;height:15px}.t-input-phonemask__options-wrap::-webkit-scrollbar-thumb{border-radius:7px;background:#c2c9d2}@media screen and (max-width:640px){.t-input-phonemask__options-wrap{min-width:auto}}.t-input-phonemask__options-flag,.t-input-phonemask__select-flag{background-image:url(https://static.tildacdn.com/lib/flags/flags5.png);background-repeat:no-repeat;display:inline-block}.t-input-phonemask__options-flag_np,.t-input-phonemask__select-flag[data-phonemask-flag=np]{width:16px}';

    var countries = {
        ad: '-5px -5px',
        ae: '-33px -5px',
        af: '-61px -5px',
        ag: '-89px -5px',
        al: '-117px -5px',
        am: '-145px -5px',
        ao: '-173px -5px',
        ar: '-201px -5px',
        at: '-229px -5px',
        au: '-257px -5px',
        az: '-285px -5px',
        ba: '-313px -5px',
        bb: '-5px -28px',
        bd: '-33px -28px',
        be: '-61px -28px',
        bf: '-89px -28px',
        bg: '-117px -28px',
        bh: '-145px -28px',
        bi: '-173px -28px',
        bj: '-201px -28px',
        bm: '-229px -28px',
        bn: '-257px -28px',
        bo: '-285px -28px',
        br: '-313px -28px',
        bs: '-5px -51px',
        bt: '-33px -51px',
        bw: '-61px -51px',
        by: '-89px -51px',
        bz: '-117px -51px',
        ca: '-145px -51px',
        cd: '-173px -51px',
        cf: '-201px -51px',
        cg: '-229px -51px',
        ch: '-257px -51px',
        ci: '-285px -51px',
        ck: '-313px -51px',
        cl: '-5px -74px',
        cm: '-33px -74px',
        cn: '-61px -74px',
        co: '-89px -74px',
        cr: '-117px -74px',
        cu: '-145px -74px',
        cv: '-173px -74px',
        cy: '-201px -74px',
        cz: '-229px -74px',
        de: '-257px -74px',
        dj: '-285px -74px',
        dk: '-313px -74px',
        dm: '-5px -97px',
        do: '-33px -97px',
        dz: '-61px -97px',
        ec: '-89px -97px',
        ee: '-117px -97px',
        eg: '-145px -97px',
        eh: '-173px -97px',
        er: '-201px -97px',
        es: '-229px -97px',
        et: '-257px -97px',
        fi: '-285px -97px',
        fj: '-313px -97px',
        fm: '-5px -120px',
        fr: '-33px -120px',
        ga: '-61px -120px',
        gb: '-89px -120px',
        gd: '-117px -120px',
        ge: '-145px -120px',
        gh: '-173px -120px',
        gm: '-201px -120px',
        gn: '-229px -120px',
        gq: '-257px -120px',
        gr: '-285px -120px',
        gt: '-313px -120px',
        gw: '-5px -143px',
        gy: '-33px -143px',
        hk: '-61px -143px',
        hn: '-89px -143px',
        hr: '-117px -143px',
        ht: '-145px -143px',
        hu: '-173px -143px',
        id: '-201px -143px',
        ie: '-229px -143px',
        il: '-257px -143px',
        in: '-285px -143px',
        iq: '-313px -143px',
        ir: '-5px -166px',
        is: '-33px -166px',
        it: '-61px -166px',
        jm: '-89px -166px',
        jo: '-117px -166px',
        jp: '-145px -166px',
        ke: '-173px -166px',
        kg: '-201px -166px',
        kh: '-229px -166px',
        ki: '-257px -166px',
        km: '-285px -166px',
        kn: '-313px -166px',
        kp: '-5px -189px',
        kr: '-33px -189px',
        ks: '-61px -189px',
        kw: '-89px -189px',
        kz: '-117px -189px',
        la: '-145px -189px',
        lb: '-173px -189px',
        lc: '-201px -189px',
        li: '-229px -189px',
        lk: '-257px -189px',
        lr: '-285px -189px',
        ls: '-313px -189px',
        lt: '-5px -212px',
        lu: '-33px -212px',
        lv: '-61px -212px',
        ly: '-89px -212px',
        ma: '-117px -212px',
        mc: '-145px -212px',
        md: '-173px -212px',
        me: '-201px -212px',
        mg: '-229px -212px',
        mh: '-257px -212px',
        mk: '-285px -212px',
        ml: '-313px -212px',
        mm: '-5px -235px',
        mn: '-33px -235px',
        mo: '-61px -235px',
        mr: '-89px -235px',
        mt: '-117px -235px',
        mu: '-145px -235px',
        mv: '-173px -235px',
        mw: '-201px -235px',
        mb: '-229px -235px',
        mx: '-229px -235px',
        my: '-257px -235px',
        mz: '-285px -235px',
        na: '-313px -235px',
        ne: '-5px -258px',
        ng: '-33px -258px',
        ni: '-61px -258px',
        nl: '-89px -258px',
        no: '-117px -258px',
        np: '-341px -5px',
        nr: '-145px -258px',
        nu: '-173px -258px',
        nz: '-201px -258px',
        om: '-229px -258px',
        pa: '-257px -258px',
        pe: '-285px -258px',
        pg: '-313px -258px',
        ph: '-5px -281px',
        pk: '-33px -281px',
        pl: '-61px -281px',
        ps: '-89px -281px',
        pt: '-117px -281px',
        pw: '-145px -281px',
        py: '-173px -281px',
        qa: '-201px -281px',
        ro: '-229px -281px',
        rs: '-257px -281px',
        ru: '-285px -281px',
        rw: '-313px -281px',
        sa: '-5px -304px',
        sb: '-33px -304px',
        sc: '-61px -304px',
        sd: '-89px -304px',
        se: '-117px -304px',
        sg: '-145px -304px',
        si: '-173px -304px',
        sk: '-201px -304px',
        sl: '-229px -304px',
        sm: '-257px -304px',
        sn: '-285px -304px',
        so: '-313px -304px',
        sr: '-5px -327px',
        ss: '-33px -327px',
        st: '-61px -327px',
        sv: '-89px -327px',
        sy: '-117px -327px',
        sz: '-145px -327px',
        td: '-173px -327px',
        tg: '-201px -327px',
        th: '-229px -327px',
        tj: '-257px -327px',
        tl: '-285px -327px',
        tm: '-313px -327px',
        tn: '-367px -5px',
        to: '-341px -28px',
        tr: '-341px -51px',
        tt: '-341px -74px',
        tv: '-341px -97px',
        tw: '-341px -120px',
        tz: '-341px -143px',
        ua: '-341px -166px',
        ug: '-341px -189px',
        us: '-341px -212px',
        uy: '-341px -235px',
        uz: '-341px -258px',
        va: '-341px -281px',
        vc: '-341px -304px',
        ve: '-341px -327px',
        vn: '-5px -350px',
        vu: '-33px -350px',
        ws: '-61px -350px',
        xk: '-89px -350px',
        ye: '-117px -350px',
        za: '-145px -350px',
        zm: '-173px -350px',
        zw: '-201px -350px',
    };

    Object.keys(countries).forEach(function (key) {
        css += '.t-input-phonemask__options-flag_' + key + ',' +
            '.t-input-phonemask__select-flag[data-phonemask-flag=' + key + '] {' +
            'background-position:' + countries[key] +
            '}';
    });

    document.head.insertAdjacentHTML('beforeend', '<style class="t-phonemask-style">' + css + '</style>');

    var wraps = document.querySelectorAll('.t-input-phonemask__wrap');

    Array.prototype.forEach.call(wraps, function(wrap) {
        wrap.classList.add('t-input-phonemask__wrap-style');
    });
}

// Country information name, code phone, mask phone
function t_form_phonemask__getCountriesList() {
    return {
        af: {
            n: 'Afghanistan (افغانستان)',
            c: '+93',
            m: '+93-99-999-9999',
        },
        al: {
            n: 'Albania (Shqipëri)',
            c: '+355',
            m: '+355(999) 999-999',
        },
        dz: {
            n: 'Algeria (الجزائر)',
            c: '+213',
            m: '+213-99-999-9999',
        },
        ad: {
            n: 'Andorra',
            c: '+376',
            m: '+376-999-999',
        },
        ao: {
            n: 'Angola',
            c: '+244',
            m: '+244(999) 999-999',
        },
        am: {
            n: 'Armenia (Հայաստան)',
            c: '+374',
            m: '+374-99-999-999',
        },
        ag: {
            n: 'Antigua and Barbuda',
            c: '+1 (268)',
            m: '+1 (268)999-9999',
        },
        ar: {
            n: 'Argentina',
            c: '+54',
            m: '+54(999) 9999-9999',
        },
        au: {
            n: 'Australia',
            c: '+61',
            m: '+61-99-9999-9999',
        },
        at: {
            n: 'Austria (Österreich)',
            c: '+43',
            m: '+43(999) 999-99999',
        },
        az: {
            n: 'Azerbaijan (Azərbaycan)',
            c: '+994',
            m: '+994-99-999-99-99',
        },
        bs: {
            n: 'Bahamas',
            c: '+1 (242)',
            m: '+1 (242)999-9999',
        },
        bh: {
            n: 'Bahrain (البحرين)',
            c: '+973',
            m: '+973-9999-9999',
        },
        bd: {
            n: 'Bangladesh (বাংলাদেশ)',
            c: '+880',
            m: '+880-9999-999999',
        },
        bb: {
            n: 'Barbados',
            c: '+1 (246)',
            m: '+1 (246)999-9999',
        },
        by: {
            n: 'Belarus (Беларусь)',
            c: '+375',
            m: '+375(99) 999-99-99',
        },
        be: {
            n: 'Belgium (België)',
            c: '+32',
            m: '+32(999) 999-999',
        },
        bz: {
            n: 'Belize',
            c: '+501',
            m: '+501-999-9999',
        },
        bj: {
            n: 'Benin (Bénin)',
            c: '+229',
            m: '+229-99-99-9999',
        },
        bt: {
            n: 'Bhutan (འབྲུག)',
            c: '+975',
            m: '+975-9-999-9999',
        },
        bo: {
            n: 'Bolivia',
            c: '+591',
            m: '+591-9-999-9999',
        },
        ba: {
            n: 'Bosnia and Herzegovina',
            c: '+387',
            m: '+387-99-999-999',
        },
        bw: {
            n: 'Botswana',
            c: '+267',
            m: '+267-99-999-999',
        },
        br: {
            n: 'Brazil (Brasil)',
            c: '+55',
            m: '+55(99) 99999-9999',
        },
        bn: {
            n: 'Brunei',
            c: '+673',
            m: '+673-999-9999',
        },
        bg: {
            n: 'Bulgaria (България)',
            c: '+359',
            m: '+359(999) 999-999',
        },
        bf: {
            n: 'Burkina Faso',
            c: '+226',
            m: '+226-99-99-9999',
        },
        bi: {
            n: 'Burundi (Uburundi)',
            c: '+257',
            m: '+257-99-99-9999',
        },
        kh: {
            n: 'Cambodia (កម្ពុជា)',
            c: '+855',
            m: '+855-99-999-999',
        },
        cm: {
            n: 'Cameroon (Cameroun)',
            c: '+237',
            m: '+237-9-99-99-99-99',
        },
        ca: {
            n: 'Canada',
            c: '+1',
            m: '+1(999) 999-9999',
        },
        cv: {
            n: 'Cape Verde (Kabu Verdi)',
            c: '+238',
            m: '+238(999) 99-99',
        },
        cf: {
            n: 'Central African Republic (République centrafricaine)',
            c: '+236',
            m: '+236-99-99-9999',
        },
        td: {
            n: 'Chad (Tchad)',
            c: '+235',
            m: '+235-99-99-99-99',
        },
        cl: {
            n: 'Chile',
            c: '+56',
            m: '+56-9-9999-9999',
        },
        cn: {
            n: 'China (中国)',
            c: '+86',
            m: '+86(999) 9999-9999',
        },
        co: {
            n: 'Colombia',
            c: '+57',
            m: '+57(999) 999-9999',
        },
        km: {
            n: 'Comoros (جزر القمر)',
            c: '+269',
            m: '+269-99-99999',
        },
        cd: {
            n: 'Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)',
            c: '+243',
            m: '+243(999) 999-999',
        },
        cg: {
            n: 'Congo (Republic) (Congo-Brazzaville)',
            c: '+242',
            m: '+242-99-999-9999',
        },
        ck: {
            n: 'Cook Islands',
            c: '+682',
            m: '+682-99-999',
        },
        cr: {
            n: 'Costa Rica',
            c: '+506',
            m: '+506-9999-9999',
        },
        ci: {
            n: 'Cote d’Ivoire',
            c: '+225',
            m: '+225-99-999-999',
        },
        hr: {
            n: 'Croatia (Hrvatska)',
            c: '+385',
            m: '+385-99-999-9999',
        },
        cu: {
            n: 'Cuba',
            c: '+53',
            m: '+53-9-999-9999',
        },
        cy: {
            n: 'Cyprus (Κύπρος)',
            c: '+357',
            m: '+357-99-999-999',
        },
        cz: {
            n: 'Czech Republic (Česká republika)',
            c: '+420',
            m: '+420(999) 999-999',
        },
        dk: {
            n: 'Denmark (Danmark)',
            c: '+45',
            m: '+45-99-99-99-99',
        },
        dj: {
            n: 'Djibouti',
            c: '+253',
            m: '+253-99-99-99-99',
        },
        dm: {
            n: 'Dominica',
            c: '+1 (767)',
            m: '+1 (767)999-9999',
        },
        do: {
            n: 'Dominican Republic (República Dominicana)',
            c: '+1',
            m: '+1(999) 999-9999',
        },
        ec: {
            n: 'Ecuador',
            c: '+593',
            m: '+593-99-999-9999',
        },
        eg: {
            n: 'Egypt (مصر)',
            c: '+20',
            m: '+20(999) 999-9999',
        },
        sv: {
            n: 'El Salvador',
            c: '+503',
            m: '+503-99-99-9999',
        },
        gq: {
            n: 'Equatorial Guinea (Guinea Ecuatorial)',
            c: '+240',
            m: '+240-99-999-9999',
        },
        er: {
            n: 'Eritrea',
            c: '+291',
            m: '+291-9-999-999',
        },
        ee: {
            n: 'Estonia (Eesti)',
            c: '+372',
            m: '+372-9999-9999',
        },
        et: {
            n: 'Ethiopia',
            c: '+251',
            m: '+251-99-999-9999',
        },
        fj: {
            n: 'Fiji',
            c: '+679',
            m: '+679-999-9999',
        },
        fi: {
            n: 'Finland (Suomi)',
            c: '+358',
            m: '+358-999-9999999',
        },
        fr: {
            n: 'France',
            c: '+33',
            m: '+33(999) 999-9999',
        },
        ga: {
            n: 'Gabon',
            c: '+241',
            m: '+241-9-99-99-99',
        },
        gm: {
            n: 'Gambia',
            c: '+220',
            m: '+220(999) 99-99',
        },
        ge: {
            n: 'Georgia (საქართველო)',
            c: '+995',
            m: '+995(999) 999-999',
        },
        de: {
            n: 'Germany (Deutschland)',
            c: '+49',
            m: '+49(999) 999-99999',
        },
        gh: {
            n: 'Ghana (Gaana)',
            c: '+233',
            m: '+233(999) 999-999',
        },
        gr: {
            n: 'Greece (Ελλάδα)',
            c: '+30',
            m: '+30(999) 999-9999',
        },
        gd: {
            n: 'Grenada',
            c: '+1 (473)',
            m: '+1 (473)999-9999',
        },
        gt: {
            n: 'Guatemala',
            c: '+502',
            m: '+502-9-999-9999',
        },
        gn: {
            n: 'Guinea (Guinée)',
            c: '+224',
            m: '+224-999-99-99-99',
        },
        gw: {
            n: 'Guinea-Bissau (Guiné Bissau)',
            c: '+245',
            m: '+245-9-999999',
        },
        gy: {
            n: 'Guyana',
            c: '+592',
            m: '+592-999-9999',
        },
        ht: {
            n: 'Haiti',
            c: '+509',
            m: '+509-99-99-9999',
        },
        hn: {
            n: 'Honduras',
            c: '+504',
            m: '+504-9999-9999',
        },
        hk: {
            n: 'Hong Kong (香港)',
            c: '+852',
            m: '+852-9999-9999',
        },
        hu: {
            n: 'Hungary (Magyarország)',
            c: '+36',
            m: '+36(999) 999-999',
        },
        is: {
            n: 'Iceland (Ísland)',
            c: '+354',
            m: '+354-999-9999',
        },
        in: {
            n: 'India (भारत)',
            c: '+91',
            m: '+91(9999) 999-999',
        },
        id: {
            n: 'Indonesia',
            c: '+62',
            m: '+62(999) 999-99-999',
        },
        ir: {
            n: 'Iran (ایران)',
            c: '+98',
            m: '+98(999) 999-9999',
        },
        iq: {
            n: 'Iraq (العراق)',
            c: '+964',
            m: '+964(999) 999-9999',
        },
        ie: {
            n: 'Ireland',
            c: '+353',
            m: '+353(999) 999-999',
        },
        il: {
            n: 'Israel (ישראל)',
            c: '+972',
            m: '+972-999-999-9999',
        },
        it: {
            n: 'Italy (Italia)',
            c: '+39',
            m: '+39(999) 9999-999',
        },
        jm: {
            n: 'Jamaica',
            c: '+1',
            m: '+1(999) 999-9999',
        },
        jp: {
            n: 'Japan (日本)',
            c: '+81',
            m: '+81-99-9999-9999',
        },
        jo: {
            n: 'Jordan (الأردن)',
            c: '+962',
            m: '+962-9-9999-9999',
        },
        kz: {
            n: 'Kazakhstan (Казахстан)',
            c: '+7',
            m: '+7(999) 999-99-99',
        },
        ke: {
            n: 'Kenya',
            c: '+254',
            m: '+254-999-999999',
        },
        ki: {
            n: 'Kiribati',
            c: '+686',
            m: '+686-99-999',
        },
        xk: {
            n: 'Kosovo (Republic)',
            c: '+383',
            m: '+383-99-999-999'
        },
        kw: {
            n: 'Kuwait (الكويت)',
            c: '+965',
            m: '+965-9999-9999',
        },
        kg: {
            n: 'Kyrgyzstan (Кыргызстан)',
            c: '+996',
            m: '+996(999) 999-999',
        },
        la: {
            n: 'Laos (ລາວ)',
            c: '+856',
            m: '+856-99-999-999',
        },
        lv: {
            n: 'Latvia (Latvija)',
            c: '+371',
            m: '+371-99-999-999',
        },
        lb: {
            n: 'Lebanon (لبنان)',
            c: '+961',
            m: '+961-99-999-999',
        },
        ls: {
            n: 'Lesotho',
            c: '+266',
            m: '+266-9-999-9999',
        },
        lr: {
            n: 'Liberia',
            c: '+231',
            m: '+231-99-999-9999',
        },
        ly: {
            n: 'Libya (ليبيا)',
            c: '+218',
            m: '+218-99-999-999',
        },
        li: {
            n: 'Liechtenstein',
            c: '+423',
            m: '+423-999-99-99',
        },
        lt: {
            n: 'Lithuania (Lietuva)',
            c: '+370',
            m: '+370(999) 99-999',
        },
        lu: {
            n: 'Luxembourg',
            c: '+352',
            m: '+352(999) 999-999',
        },
        mo: {
            n: 'Macao',
            c: '+853',
            m: '+853-9999-9999',
        },
        mk: {
            n: 'Macedonia (FYROM) (Македонија)',
            c: '+389',
            m: '+389-99-999-999',
        },
        mg: {
            n: 'Madagascar (Madagasikara)',
            c: '+261',
            m: '+261-99-99-99999',
        },
        mw: {
            n: 'Malawi',
            c: '+265',
            m: '+265-9-9999-9999',
        },
        my: {
            n: 'Malaysia',
            c: '+60',
            m: '+60-99-999-9999',
        },
        mv: {
            n: 'Maldives',
            c: '+960',
            m: '+960-999-9999',
        },
        ml: {
            n: 'Mali',
            c: '+223',
            m: '+223-99-99-9999',
        },
        mt: {
            n: 'Malta',
            c: '+356',
            m: '+356-9999-9999',
        },
        mh: {
            n: 'Marshall Islands',
            c: '+692',
            m: '+692-999-9999',
        },
        mr: {
            n: 'Mauritania (موريتانيا)',
            c: '+222',
            m: '+222-99-99-9999',
        },
        mu: {
            n: 'Mauritius (Moris)',
            c: '+230',
            m: '+230-999-9999',
        },
        mx: {
            n: 'Mexico (México)',
            c: '+52',
            m: '+52(999) 999-9999',
        },
        mb: {
            n: 'Mexico (México)',
            c: '+521',
            m: '+521(999) 999-9999',
        },
        fm: {
            n: 'Micronesia',
            c: '+691',
            m: '+691-999-9999',
        },
        md: {
            n: 'Moldova (Republica Moldova)',
            c: '+373',
            m: '+373-9999-9999',
        },
        mc: {
            n: 'Monaco',
            c: '+377',
            m: '+377-99-999-999',
        },
        mn: {
            n: 'Mongolia (Монгол)',
            c: '+976',
            m: '+976-99-99-9999',
        },
        me: {
            n: 'Montenegro (Crna Gora)',
            c: '+382',
            m: '+382-99-999-999',
        },
        ma: {
            n: 'Morocco (المغرب)',
            c: '+212',
            m: '+212-99-9999-999',
        },
        mz: {
            n: 'Mozambique (Moçambique)',
            c: '+258',
            m: '+258-99-999-999',
        },
        mm: {
            n: 'Myanmar (Burma) (မြန်မာ)',
            c: '+95',
            m: '+95-99-999-999',
        },
        na: {
            n: 'Namibia (Namibië)',
            c: '+264',
            m: '+264-99-999-9999',
        },
        nr: {
            n: 'Nauru',
            c: '+674',
            m: '+674-999-9999',
        },
        np: {
            n: 'Nepal (नेपाल)',
            c: '+977',
            m: '+977-99-999-999',
        },
        nl: {
            n: 'Netherlands (Nederland)',
            c: '+31',
            m: '+31-99-999-9999',
        },
        nz: {
            n: 'New Zealand',
            c: '+64',
            m: '+64(999) 999-999',
        },
        ni: {
            n: 'Nicaragua',
            c: '+505',
            m: '+505-9999-9999',
        },
        ne: {
            n: 'Niger (Nijar)',
            c: '+227',
            m: '+227-99-99-9999',
        },
        ng: {
            n: 'Nigeria',
            c: '+234',
            m: '+234-999-999-9999',
        },
        nu: {
            n: 'Niue',
            c: '+683',
            m: '+683-9999',
        },
        kp: {
            n: 'North Korea (조선 민주주의 인민 공화국)',
            c: '+850',
            m: '+850-99-999-999',
        },
        no: {
            n: 'Norway (Norge)',
            c: '+47',
            m: '+47(999) 99-999',
        },
        om: {
            n: 'Oman (عُمان)',
            c: '+968',
            m: '+968-99-999-999',
        },
        pa: {
            n: 'Panama',
            c: '+507',
            m: '+507 9999-9999',
        },
        pk: {
            n: 'Pakistan (پاکستان)',
            c: '+92',
            m: '+92(999) 999-9999',
        },
        pw: {
            n: 'Palau',
            c: '+680',
            m: '+680-999-9999',
        },
        ps: {
            n: 'Palestinian Territory',
            c: '+970',
            m: '+970 99 999 9999',
        },
        pg: {
            n: 'Papua New Guinea',
            c: '+675',
            m: '+675(999) 99-999',
        },
        py: {
            n: 'Paraguay',
            c: '+595',
            m: '+595(999) 999-999',
        },
        pe: {
            n: 'Peru (Perú)',
            c: '+51',
            m: '+51(999) 999-999',
        },
        ph: {
            n: 'Philippines',
            c: '+63',
            m: '+63(999) 999-9999',
        },
        pl: {
            n: 'Poland (Polska)',
            c: '+48',
            m: '+48(999) 999-999',
        },
        pt: {
            n: 'Portugal',
            c: '+351',
            m: '+351-99-999-9999',
        },
        qa: {
            n: 'Qatar (قطر)',
            c: '+974',
            m: '+974-9999-9999',
        },
        ro: {
            n: 'Romania (România)',
            c: '+40',
            m: '+40-99-999-9999',
        },
        ru: {
            n: 'Russian Federation (Российская Федерация)',
            c: '+7',
            m: '+7(999) 999-99-99',
        },
        rw: {
            n: 'Rwanda',
            c: '+250',
            m: '+250(999) 999-999',
        },
        kn: {
            n: 'Saint Kitts and Nevis',
            c: '+1 (869)',
            m: '+1 (869)999-9999',
        },
        lc: {
            n: 'Saint Lucia',
            c: '+1 (758)',
            m: '+1 (758)999-9999',
        },
        vc: {
            n: 'Saint Vincent and the Grenadines',
            c: '+1 (784)',
            m: '+1 (784)999-9999',
        },
        ws: {
            n: 'Samoa',
            c: '+685',
            m: '+685-99-9999',
        },
        sm: {
            n: 'San Marino',
            c: '+378',
            m: '+378-9999-999999',
        },
        st: {
            n: 'Sao Tome and Principe (São Tomé e Príncipe)',
            c: '+239',
            m: '+239-99-99999',
        },
        sa: {
            n: 'Saudi Arabia (المملكة العربية السعودية)',
            c: '+966',
            m: '+966-9-9999-9999',
        },
        sn: {
            n: 'Senegal (Sénégal)',
            c: '+221',
            m: '+221-99-999-9999',
        },
        rs: {
            n: 'Serbia (Србија)',
            c: '+381',
            m: '+381-99-999-9999',
        },
        sc: {
            n: 'Seychelles',
            c: '+248',
            m: '+248-9-999-999',
        },
        sl: {
            n: 'Sierra Leone',
            c: '+232',
            m: '+232-99-999999',
        },
        sg: {
            n: 'Singapore',
            c: '+65',
            m: '+65-9999-9999',
        },
        sk: {
            n: 'Slovakia (Slovensko)',
            c: '+421',
            m: '+421(999) 999-999',
        },
        si: {
            n: 'Slovenia (Slovenija)',
            c: '+386',
            m: '+386-99-999-999',
        },
        sb: {
            n: 'Solomon Islands',
            c: '+677',
            m: '+677-999-9999',
        },
        so: {
            n: 'Somalia (Soomaaliya)',
            c: '+252',
            m: '+252-99-999-999',
        },
        za: {
            n: 'South Africa',
            c: '+27',
            m: '+27-99-999-9999',
        },
        kr: {
            n: 'South Korea (대한민국)',
            c: '+82',
            m: '+82-99-9999-9999',
        },
        ss: {
            n: 'South Sudan (جنوب السودان)',
            c: '+211',
            m: '+211-99-999-9999',
        },
        es: {
            n: 'Spain (España)',
            c: '+34',
            m: '+34(999) 999-999',
        },
        lk: {
            n: 'Sri Lanka (ශ්‍රී ලංකාව)',
            c: '+94',
            m: '+94-99-999-9999',
        },
        sd: {
            n: 'Sudan (السودان)',
            c: '+249',
            m: '+249-99-999-9999',
        },
        sr: {
            n: 'Suriname',
            c: '+597',
            m: '+597-999-9999',
        },
        sz: {
            n: 'Swaziland',
            c: '+268',
            m: '+268-99-99-9999',
        },
        se: {
            n: 'Sweden (Sverige)',
            c: '+46',
            m: '+46-99-999-9999',
        },
        ch: {
            n: 'Switzerland (Schweiz)',
            c: '+41',
            m: '+41-99-999-9999',
        },
        sy: {
            n: 'Syria (سوريا)',
            c: '+963',
            m: '+963-99-9999-999',
        },
        tw: {
            n: 'Taiwan (台灣)',
            c: '+886',
            m: '+886-9999-9999',
        },
        tj: {
            n: 'Tajikistan',
            c: '+992',
            m: '+992-99-999-9999',
        },
        tz: {
            n: 'Tanzania',
            c: '+255',
            m: '+255-99-999-9999',
        },
        th: {
            n: 'Thailand (ไทย)',
            c: '+66',
            m: '+66-99-999-9999',
        },
        tg: {
            n: 'Togo',
            c: '+228',
            m: '+228-99-999-999',
        },
        to: {
            n: 'Tonga',
            c: '+676',
            m: '+676-99999',
        },
        tt: {
            n: 'Trinidad and Tobago',
            c: '+1 (868)',
            m: '+1 (868)999-9999',
        },
        tn: {
            n: 'Tunisia (تونس)',
            c: '+216',
            m: '+216-99-999-999',
        },
        tr: {
            n: 'Turkey (Türkiye)',
            c: '+90',
            m: '+90(999) 999-99999',
        },
        tm: {
            n: 'Turkmenistan',
            c: '+993',
            m: '+993-9-999-9999',
        },
        tv: {
            n: 'Tuvalu',
            c: '+688',
            m: '+688-999999',
        },
        ug: {
            n: 'Uganda',
            c: '+256',
            m: '+256(999) 999-999',
        },
        ua: {
            n: 'Ukraine (Україна)',
            c: '+380',
            m: '+380(99) 999-99-99',
        },
        ae: {
            n: 'United Arab Emirates (الإمارات العربية المتحدة)',
            c: '+971',
            m: '+971-99-999-9999',
        },
        gb: {
            n: 'United Kingdom',
            c: '+44',
            m: '+44-99-9999-99999',
        },
        us: {
            n: 'USA',
            c: '+1',
            m: '+1(999) 999-9999',
        },
        uy: {
            n: 'Uruguay',
            c: '+598',
            m: '+598-9-999-99-99',
        },
        uz: {
            n: 'Uzbekistan (Oʻzbekiston)',
            c: '+998',
            m: '+998-99-999-9999',
        },
        vu: {
            n: 'Vanuatu',
            c: '+678',
            m: '+678-99-99999',
        },
        va: {
            n: 'Vatican City (Città del Vaticano)',
            c: '+39',
            m: '+39-9-999-99999',
        },
        ve: {
            n: 'Venezuela',
            c: '+58',
            m: '+58(999) 999-9999',
        },
        vn: {
            n: 'Vietnam (Việt Nam)',
            c: '+84',
            m: '+84-99-9999-999',
        },
        ye: {
            n: 'Yemen (اليمن)',
            c: '+967',
            m: '+967-9-999-999',
        },
        zm: {
            n: 'Zambia',
            c: '+260',
            m: '+260-99-999-9999',
        },
        zw: {
            n: 'Zimbabwe',
            c: '+263',
            m: '+263-9-999999',
        }
    };
}