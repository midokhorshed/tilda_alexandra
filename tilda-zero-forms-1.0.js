/**
 * Forms (Zero Block)
 * ---------------------------------------------------------------------------------
 * Скрипт является функциональной частью Zero Block. Вызывается из скрипта tilda-zero-N.N.js.
 * tilda-zero forms генерирует строку и парсит её в HTML внутри зеро-блока. Работает, при
 * необходимости (если в форму добавлен инпут с телефонной маской, или блок с калькуляцией
 * значений), со скриптами tilda-calc, tilda-range и тд.
 *
 * В генерируемой строке содержится как HTML, так и теги <style>. Тег <script> тоже может быть
 * добавлен: обычно он создаётся чтобы инициилизировать то или иное поле, например, маску для
 * телефона. В таком случае скрипт объявляется через document.createElement('script') и в его тело
 * добавляется построчно то, что должно быть инициализировано. Чтобы избежать инициализации до
 * того, как элемент будет добавлен в зеро-блок, скрипты добавляются вниз страницы и только после
 * того, как элементы были добавлены в ZB.
 *
 * Строки формируются в функции t_zeroForms__getFormInputHtml, при помощи условий внутри
 * конструкции if...else, где при итерации объекта проверяется определенное условие и если оно
 * true, генерируется строка, стили и, если необходимо, скрипт.
 *
 * Принцип подключения:
 * - Если на странице есть хотя бы 1 элемент ('.tn-elem') с типом 'form' (data-elem-type='form').
 */

 window.t_zeroForms__browserLang = (window.navigator.userLanguage || window.navigator.language)
 .toUpperCase()
 .slice(0, 2);

function t_zero__onReady(func) {
 document.readyState !== 'loading' ? func() : document.addEventListener('DOMContentLoaded', func);
}

/**
* Language override based on attribute
*/
t_zero__onReady(function () {
 var allrecords = document.getElementById('allrecords');
 if (allrecords) {
	 var projectLang = allrecords.getAttribute('data-tilda-project-lang');
	 if (projectLang) {
		 window.t_zeroForms__browserLang = projectLang;
	 }
 }
});

/**
* init zeroForms
*
* @param {number| string} recid - record ID
* @param {string} elemid - element ID
*/
// eslint-disable-next-line no-unused-vars
function t_zeroForms__init(recid, elemid, formElems) {
 var element = document.querySelector('#rec' + recid + ' .tn-elem[data-elem-id="' + elemid + '"]');
 if (!element) return;

 if (!formElems) {
	 var textarea = element.querySelector('.tn-atom__inputs-textarea');
	 formElems = textarea ? textarea.value : null;
 }

 t_zeroForms__renderForm(element, formElems, recid);

 var hasJquery = typeof jQuery === 'function';
 try {
	 t396_elem__renderViewOneField(hasJquery ? $(element) : element, 'left');
	 t396_elem__renderViewOneField(hasJquery ? $(element) : element, 'top');
 } catch (e) {
	 /**/
 }
}

/**
*
* @param {HTMLElement} el - current Element
* @param {Object} inputsValuesObj - object with inputs values and types
* @return {void} - if zero-block has .t-calc
*/
function t_zeroForms__saveFormData(el, inputsValuesObj) {
 if (window.jQuery && el instanceof jQuery) {
	 el = el.length ? el.get(0) : null;
 }
 var currentZB = el ? el.closest('.t396') : null;
 var zeroBlockHasCalc = currentZB ? currentZB.querySelector('.t-calc') : null;
 if (zeroBlockHasCalc) return;
 var inputsList = el
	 ? el.querySelectorAll('.t-input, .t-select, .t-img-select, .t-range, .t-radio, .t-checkbox')
	 : [];

 Array.prototype.forEach.call(inputsList, function (input) {
	 var inputContainer = input.closest('.t-input-group');
	 var inputID = inputContainer ? inputContainer.getAttribute('data-input-lid') : null;
	 if (!inputsValuesObj[inputID]) inputsValuesObj[inputID] = {};

	 inputsValuesObj[inputID].val = input.value;
	 inputsValuesObj[inputID].tag = input.tagName.toLowerCase();

	 if (input.classList.contains('t-img-select')) {
		 inputsValuesObj[inputID].type = 'img-select';
		 inputsValuesObj[inputID].val = [];
		 var radioInputsImg = inputContainer.querySelectorAll('.t-img-select');

		 Array.prototype.forEach.call(radioInputsImg, function (radio) {
			 if (radio.checked) {
				 inputsValuesObj[inputID].val.push(radio.value);
			 }
		 });
	 }

	 if (input.classList.contains('t-range')) {
		 inputsValuesObj[inputID].type = 'range';
	 }

	 if (input.classList.contains('t-radio')) {
		 inputsValuesObj[inputID].val = null;
		 inputsValuesObj[inputID].type = 'radio';
		 var radioInputs = inputContainer.querySelectorAll('.t-radio');

		 Array.prototype.forEach.call(radioInputs, function (radio) {
			 if (radio.checked) {
				 inputsValuesObj[inputID].val = radio.value;
			 }
		 });
	 }

	 if (input.classList.contains('t-checkbox')) {
		 inputsValuesObj[inputID].val = input.checked;
		 inputsValuesObj[inputID].type = 'checkbox';
	 }

	 var isValEmptyArray = Array.isArray(inputsValuesObj[inputID].val) && !inputsValuesObj[inputID].val.length;
	 if (!inputsValuesObj[inputID].val || isValEmptyArray) {
		 delete inputsValuesObj[inputID];
	 }
 });
}

/**
*
* @param {HTMLElement} el - current element
* @param {Object} inputsValues -inputs values object
*/
function t_zeroForms__setFormData(el, inputsValues) {
 for (var id in inputsValues) {
	 var type = inputsValues[id].type;
	 var value = inputsValues[id].val;
	 var tag = inputsValues[id].tag;
	 var input;

	 switch (type) {
		 case 'img-select':
			 value.forEach(function (val) {
				 input = el.querySelector('[data-input-lid="' + id + '"] input[value="' + val + '"]');
				 if (input) input.checked = true;
			 });
			 break;
		 case 'radio':
			 input = el.querySelector('[data-input-lid="' + id + '"] input[value="' + value + '"]');
			 if (input) input.checked = true;
			 break;
		 case 'checkbox':
			 input = el.querySelector('[data-input-lid="' + id + '"] ' + tag);
			 if (input) input.checked = value;
			 break;
		 default:
			 input = el.querySelector('[data-input-lid="' + id + '"] ' + tag);
			 if (input) {
				 input.value = value;
				 if (type === 'range') {
					 var customOnInputEvent = document.createEvent('Event');
					 customOnInputEvent.initEvent('input', true, true);
					 input.dispatchEvent(customOnInputEvent);
				 }
			 }
			 break;
	 }
 }
}

/**
*
* @param {HTMLElement} el - current element
* @param {string} datastr - textarea value
* @param {string} recid - record ID
*/
function t_zeroForms__renderForm(el, datastr, recid) {
 if (window.jQuery && el instanceof jQuery) {
	 el = el.length ? el.get(0) : null;
 }
 var record = document.querySelector('.t-records');
 var isEditMode = record ? record.getAttribute('data-tilda-mode') === 'edit' : false;
 if (!isEditMode) isEditMode = document.getElementById('for_redactor_toolbar');
 if (el && el.classList.contains('zero-form-rendered') && !isEditMode) {
	 t_zeroForms__resizeButton(el);
	 return;
 }
 var oldStyles = document.querySelectorAll('.t-zero-forms-s');
 Array.prototype.forEach.call(oldStyles, function (oldStyle) {
	 oldStyle.parentElement.removeChild(oldStyle);
 });
 var inputsValues = {};
 t_zeroForms__saveFormData(el, inputsValues);
 if (!datastr) {
	 var elemid = el.getAttribute('data-elem-id');
	 var datastr = JSON.stringify(window['tn_form__inputsdata__' + recid + '__' + elemid]);

	 if (!datastr) {
		 var textarea = el.querySelector('.tn-atom__inputs-textarea');
		 datastr = textarea ? textarea.value : null;
	 }
 }

 var data = {};
 try {
	 if (datastr) {
		 data = JSON.parse(datastr);
	 }
 } catch (error) {
	 /* */
 }
 if (!recid) recid = '';

 var a = {};
 var fields = [
	 'inputpos',
	 'inputfontfamily',
	 'inputfontsize',
	 'inputfontweight',
	 'inputvariationweight',
	 'inputcolor',
	 'inputbgcolor',
	 'inputbordercolor',
	 'inputbordersize',
	 'inputradius',
	 'inputheight',
	 'inputmargbottom',
	 'inputmargright',
	 'inputtitlefontsize',
	 'inputtitlefontweight',
	 'inputtitlevariationweight',
	 'inputtitlecolor',
	 'inputelscolor',
	 'inputelsfontsize',
	 'inputelsfontweight',
	 'inputelsvariationweight',
	 'inputtitlemargbottom',
	 'inputsstyle',
	 'inputsstyle2',
	 'buttontitle',
	 'buttonalign',
	 'buttoncolor',
	 'buttonbgcolor',
	 'buttonbordercolor',
	 'buttonbordersize',
	 'buttonradius',
	 'buttonmargtop',
	 'buttonwidth',
	 'buttonheight',
	 'buttonshadowsize',
	 'buttonshadowopacity',
	 'buttonfontfamily',
	 'buttonfontsize',
	 'buttonfontweight',
	 'buttonvariationweight',
	 'buttonuppercase',
	 'buttonbgcolorhover',
	 'buttoncolorhover',
	 'buttonbordercolorhover',
	 'buttonshadowsizehover',
	 'buttonshadowopacityhover',
	 'buttonspeedhover',
	 'formmsgsuccess',
	 'formmsgurl',
	 'formerrreq',
	 'formerremail',
	 'formerrphone',
	 'formerrname',
	 'formbottomtext',
	 'formbottomcb',
	 'formname',
	 'receivers',
 ];
 var tildamode = t_zeroForms__getTildaMode();
 var hasJquery = typeof jQuery === 'function';

 fields.forEach(function (field) {
	 if (tildamode === 'zero') {
		 a[field] = elem__getFieldValue(hasJquery ? $(el) : el, field);
	 } else {
		 t_onFuncLoad('t396_elem__getFieldValue', function () {
			 a[field] = t396_elem__getFieldValue(hasJquery ? $(el) : el, field);
			 if (typeof a[field] == 'undefined') a[field] = '';
		 });
	 }
 });

 var receiversArr = typeof a.receivers !== 'undefined' && a.receivers ? a.receivers.split(',') : [];
 var inputscounter = 0;

 for (var key in data) {
	 if (data[key]['loff'] !== 'y' && data[key]['li_type'] !== 'hd') {
		 inputscounter++;
	 }
 }

 var str = '';

 if (tildamode === 'published') {
	 var recordBlock = el.closest('.r');
	 recid = recordBlock ? recordBlock.id.replace('rec', '') : '';
	 str +=
		 '<form id="form' +
		 recid +
		 '" name="form' +
		 recid +
		 '" role="form" action="https://forms.tildacdn.com/procces/" method="POST" data-formactiontype="2" data-inputbox=".t-input-group" class="t-form js-form-proccess t-form_inputs-total_' +
		 inputscounter +
		 ' ' +
		 (a.inputsstyle ? 't-form_bbonly' : '') +
		 ' ' +
		 (a.inputpos === 'h' ? 'tn-form_horiz' : '') +
		 '" ' +
		 (a.formmsgurl ? 'data-success-url="' + a.formmsgurl + '"' : '') +
		 ' data-success-callback="t396_onSuccess" data-success-popup="y" data-error-popup="y">';
 } else {
	 str +=
		 '<div class="t-form t-form_inputs-total_' +
		 inputscounter +
		 ' ' +
		 (a.inputsstyle ? 't-form_bbonly' : '') +
		 ' ' +
		 (a.inputpos === 'h' ? 'tn-form_horiz' : '') +
		 '">';
 }

 for (var z = 0; z < receiversArr.length; z++) {
	 if (typeof receiversArr[z] !== 'undefined' && receiversArr[z]) {
		 str +=
			 '<input type="hidden" name="formservices[]" value="' +
			 receiversArr[z] +
			 '" class="js-formaction-services">';
	 }
 }

 if (a.formname) {
	 str += '<input type="hidden" name="tildaspec-formname" tabindex="-1" value="' + a.formname + '">';
 }

 str +=
	 '<div class="js-successbox t-form__successbox t-text t-text_sm" style="display:none;">' +
	 a.formmsgsuccess +
	 '</div>';

 str += '<div class="t-form__inputsbox">';

 var itemscounter = 0;
 var scripts = [];

 for (var key in data) {
	 if (data[key]['loff'] === 'y' || !data[key]['li_type']) {
		 str += '';
	 } else {
		 itemscounter++;
		 var parsedObj = t_zeroForms__getFormInputHtml(el, data[key], itemscounter, a, recid);
		 str += parsedObj.string;
		 var script = parsedObj.script;
		 script.forEach(function (scr) {
			 if (scr) {
				 scripts.push(scr);
			 }
		 });
	 }
 }

 str += '<div class="t-form__errorbox-middle">';
 str += t_zeroForms__getErrorBoxHtml(el, a);
 str += '</div>';

 str += t_zeroForms__getFormButtonHtml(el, a);

 str += '</div>';

 if (typeof a.formbottomtext !== 'undefined' && a.formbottomtext) {
	 str +=
		 '<div class="t-form__bottom-text t-text" style="margin-top:15px;font-size:13px;' +
		 (a.buttonalign === 'center' ? 'text-align:center;' : 'text-align:left;') +
		 (a.inputtitlecolor ? 'color:' + a.inputtitlecolor + ';' : '') +
		 (a.inputtitlefontweight ? 'font-weight:' + a.inputtitlefontweight + ';' : '') +
		 (a.inputfontfamily ? 'font-family:' + a.inputfontfamily + ';' : '') +
		 '">';
	 str += t_zeroForms__getBottomText(el, a, recid);
	 str += '</div>';
 }

 str += '<div class="t-form__errorbox-bottom">';
 str += t_zeroForms__getErrorBoxHtml(el, a);
 str += '</div>';

 str +=
	 '<div style="position: absolute; left: -5000px; bottom: 0; display: none;"><input type="text" name="form-spec-comments" value="Its good" class="js-form-spec-comments" tabindex="-1"></div>';

 if (tildamode === 'published') {
	 str += '</form>';
 } else {
	 str += '</div>';
 }

 if (a.inputcolor) {
	 str += t_zeroForms__getInputPlaceholderStyles(el, a, recid);
 }

 if (a.inputpos === 'h') {
	 str += t_zeroForms__getHorizStyles();
 }

 if (a.inputsstyle2 === 'y') {
	 setTimeout(function () {
		 t_zeroForms__animateInputs(el, a, recid);
	 }, 2000);
 }

 str += t_zeroForms__getCommonStyles();
 var atomList = el.querySelectorAll('.tn-atom');
 Array.prototype.forEach.call(atomList, function (atom) {
	 atom.innerHTML = str;
 });

 scripts.forEach(function (script) {
	 if (script) {
		 document.body.insertAdjacentElement('beforeend', script);
	 }
 });

 if (tildamode === 'preview' || tildamode === 'published') {
	 try {
		 window.tildaForm_initMasks();
	 } catch (err) {
		 /* */
	 }
 }

 if (tildamode !== 'preview') {
	 var multiLandingBlocks = document.querySelectorAll('.t803');
	 Array.prototype.forEach.call(multiLandingBlocks, function (multiLandingBlock) {
		 var multilandRecID = multiLandingBlock.closest('.r')
			 ? multiLandingBlock.closest('.r').id.replace('rec', '')
			 : '';
		 // eslint-disable-next-line no-undef
		 if (multilandRecID) t803_init(multilandRecID);
	 });
 }

 t_zeroForms__setFormData(el, inputsValues);

 var customElEvent = document.createEvent('Event');
 customElEvent.initEvent('render', true, true);
 el.dispatchEvent(customElEvent);
 el.classList.add('zero-form-rendered');
}

/**
* parse from into HTML
*
* @param {HTMLElement} el - current element
* @param {Object} item - object item
* @param {number} itemscounter - counter
* @param {Object} a - object
* @param {string} recid - record ID
* @returns {{string: string, script: *[]}}
*/
function t_zeroForms__getFormInputHtml(el, item, itemscounter, a, recid) {
 var str = '';
 var i;
 var script = null;
 var scriptText = '';
 var scripts = [];
 var itemKeys = [
	 'li_ph',
	 'li_nm',
	 'li_req',
	 'li_value',
	 'li_mask',
	 'li_title',
	 'li_subtitle',
	 'li_rule',
	 'li_vmin',
	 'li_vmax',
	 'li_rows',
	 'li_selfirstvar',
	 'li_defselitem',
	 'li_variants',
	 'li_radcb',
	 'li_checked',
	 'li_uckey',
	 'li_inp',
	 'li_dateformat',
	 'li_datediv',
	 'li_text',
	 'li_prefix',
	 'li_expr',
	 'li_postfix',
	 'li_multiupl',
	 'li_uwkey',
	 'li_step',
 ];

 itemKeys.forEach(function (key) {
	 if (typeof item[key] === 'undefined') item[key] = '';
 });

 if (item.li_type && item.li_type !== 'hd') {
	 str +=
		 '<div class="t-input-group t-input-group_' +
		 item.li_type +
		 '" data-input-lid="' +
		 item.lid +
		 '" style="' +
		 (a.inputmargbottom ? 'margin-bottom:' + a.inputmargbottom + 'px;' : '') +
		 '' +
		 (a.inputmargright && a.inputpos === 'h' ? 'padding-right:' + a.inputmargright + 'px;' : '') +
		 '">';

	 var fontInputWeight = a.inputfontweight === 'variation' ? a.inputvariationweight : a.inputfontweight;
	 var fontInputElsWeight =
		 a.inputelsfontweight === 'variation' ? a.inputelsvariationweight : a.inputelsfontweight;
	 var fontInputTitleWeight =
		 a.inputtitlefontweight === 'variation' ? a.inputtitlevariationweight : a.inputtitlefontweight;

	 var input_style =
		 (a.inputcolor ? 'color:' + a.inputcolor + ';' : '') +
		 ' ' +
		 (a.inputbordersize || a.inputbordercolor
			 ? 'border:' +
				 (a.inputbordersize ? a.inputbordersize + 'px' : '0px') +
				 ' solid ' +
				 (a.inputbordercolor ? a.inputbordercolor : '#000') +
				 ';'
			 : '') +
		 ' ' +
		 (a.inputbgcolor ? 'background-color:' + a.inputbgcolor + ';' : 'background-color:transparent;') +
		 ' ' +
		 (a.inputradius
			 ? 'border-radius:' +
				 a.inputradius +
				 'px; -moz-border-radius:' +
				 a.inputradius +
				 'px; -webkit-border-radius:' +
				 a.inputradius +
				 'px;'
			 : '') +
		 (a.inputfontsize ? 'font-size:' + a.inputfontsize + 'px;' : '') +
		 (fontInputWeight ? 'font-weight:' + fontInputWeight + ';' : '') +
		 (a.inputheight ? 'height:' + a.inputheight + 'px;' : '');
	 var inputName = 'name="' + item.li_nm + '"';
	 var input_ph = item.li_ph ? 'placeholder="' + item.li_ph + '"' : '';
	 var input_req = item.li_req === 'y' ? 'data-tilda-req="1"' : '';
	 var input_bbonly = a.inputsstyle ? 't-input_bbonly' : '';
	 var inputTextStyles =
		 (a.inputcolor ? 'color:' + a.inputcolor + ';' : '') +
		 (a.inputfontfamily ? 'font-family:' + a.inputfontfamily + ';' : '') +
		 (a.inputfontsize ? 'font-size:' + a.inputfontsize + 'px;' : '') +
		 (fontInputWeight ? 'font-weight:' + fontInputWeight + ';' : '');
	 var input_txtlbl_style =
		 (a.inputtitlecolor ? 'color:' + a.inputtitlecolor + ';' : '') +
		 ' ' +
		 (a.inputelsfontsize ? 'font-size:' + a.inputelsfontsize + 'px;' : '') +
		 (fontInputElsWeight ? 'font-weight:' + fontInputElsWeight + ';' : '') +
		 (a.inputfontfamily ? 'font-family:' + a.inputfontfamily + ';' : '');

	 if (item.li_title) {
		 str +=
			 '<div class="t-input-title" data-redactor-toolbar="no" field="nullli_title__' +
			 item.lid +
			 '" style="' +
			 (a.inputtitlecolor ? 'color:' + a.inputtitlecolor + ';' : '') +
			 (fontInputTitleWeight ? 'font-weight:' + fontInputTitleWeight + ';' : '') +
			 (a.inputfontfamily ? "font-family:'" + a.inputfontfamily + "';" : '') +
			 (a.inputtitlefontsize ? 'font-size:' + a.inputtitlefontsize + 'px;' : '') +
			 (a.inputtitlemargbottom ? 'padding-bottom:' + a.inputtitlemargbottom + 'px;' : '') +
			 '">' +
			 item.li_title +
			 '</div>';
	 }
	 if (item.li_subtitle) {
		 str +=
			 '<div class="t-input-subtitle t-descr t-descr_xxs t-opacity_70" field="nullli_subtitle__' +
			 item.lid +
			 '" style="' +
			 (a.inputtitlecolor ? 'color:' + a.inputtitlecolor + ';' : '') +
			 (a.inputfontfamily ? 'font-family:' + a.inputfontfamily + ';' : '') +
			 (a.inputtitlemargbottom ? 'padding-bottom:' + a.inputtitlemargbottom + 'px;' : '') +
			 '">' +
			 item.li_subtitle +
			 '</div>';
	 }
	 str += '<div class="t-input-block">';
	 if (item.li_type === 'in') {
		 str +=
			 '<input type="text" ' +
			 inputName +
			 ' class="t-input js-tilda-rule ' +
			 (item.li_mask ? 'js-tilda-mask' : '') +
			 ' ' +
			 input_bbonly +
			 '" value="" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' ' +
			 (item.li_rule ? 'data-tilda-rule="' + item.li_rule + '"' : '') +
			 ' ' +
			 (item.li_mask ? 'data-tilda-mask="' + item.li_mask + '"' : '') +
			 ' style="' +
			 input_style +
			 '">';
	 } else if (item.li_type === 'em') {
		 str +=
			 '<input type="text" ' +
			 inputName +
			 ' class="t-input js-tilda-rule ' +
			 input_bbonly +
			 '" value="" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' data-tilda-rule="email" style="' +
			 input_style +
			 '">';
	 } else if (item.li_type === 'ph') {
		 if (item.li_masktype === 'a') {
			 if (!recid) {
				 recid = el.closest('.r') ? el.closest('.r').id : '';
			 }
			 if (!recid) {
				 recid = el.closest('.tn-artboard') ? el.closest('.tn-artboard').getAttribute('data-record-id') : '';
			 }
			 recid = recid ? recid.replace('rec', '') : '';
			 str +=
				 '<input type="tel" ' +
				 inputName +
				 ' data-phonemask-init="no" data-phonemask-id="' +
				 recid +
				 '" data-phonemask-lid="' +
				 item.lid + '"' +
				 (item.li_maskcountry ? ' data-phonemask-maskcountry="' + item.li_maskcountry + '"' : '')
				 + ' class="t-input js-tilda-rule js-phonemask-input ' +
				 input_bbonly +
				 '" placeholder="' +
				 (window.t_zeroForms__browserLang === 'RU' ? '+7' : '+1') +
				 '(999)999-9999" value="" ' +
				 input_ph +
				 ' ' +
				 input_req +
				 ' style="' +
				 input_style +
				 '">';

			 script = document.createElement('script');
			 script.classList.add('t-zero-forms-s');
			 //@formatter:off
			 scriptText = '';
			 scriptText += 'if (!document.getElementById("t-phonemask-script")) {';
			 scriptText += '(function (d, w, o) {';
			 scriptText +=
				 'var n=d.getElementsByTagName(o)[0],s=d.createElement(o),f=function(){n.parentNode.insertBefore(s,n);};';
			 scriptText += 's.type = "text/javascript";';
			 scriptText += 's.async = true;';
			 scriptText += 's.id = "t-phonemask-script";';
			 scriptText += 's.src="https://static.tildacdn.com/js/tilda-phone-mask-1.1.min.js";';
			 scriptText +=
				 'if (w.opera=="[object Opera]") {d.addEventListener("DOMContentLoaded", f, false);} else {f();}';
			 scriptText +=
				 'if (w.opera=="[object Opera]") {d.addEventListener("DOMContentLoaded", f, false);} else {f();}';
			 scriptText += '})(document, window, "script");';
			 scriptText += '} else {';
			 scriptText += 'setTimeout(function() {';
			 scriptText += 'try {';
			 scriptText += 'if (typeof t_form_phonemask_load == "function") {';
			 scriptText +=
				 'var phoneMaskInputLidList = document.querySelectorAll("#rec' + recid + ' .js-phonemask-input[data-phonemask-lid=\'' +
				 item.lid +
				 '\']");';
			 scriptText +=
				 'Array.prototype.forEach.call(phoneMaskInputLidList, function(phoneMask) { t_form_phonemask_load(phoneMask); });';
			 scriptText += '}';
			 scriptText += '} catch(err) {console.log(err);};';
			 scriptText += '}, 500);';
			 scriptText += '}';
			 //@formatter:on
			 script.textContent = scriptText;
			 scripts.push(script);
		 } else {
			 str +=
				 '<input type="tel" ' +
				 inputName +
				 ' class="t-input js-tilda-rule ' +
				 (item.li_mask ? 'js-tilda-mask' : '') +
				 ' ' +
				 input_bbonly +
				 '" value="" ' +
				 input_ph +
				 ' ' +
				 input_req +
				 ' data-tilda-rule="phone" ' +
				 (item.li_mask ? 'data-tilda-mask="' + item.li_mask + '"' : '') +
				 ' style="' +
				 input_style +
				 '">';
		 }
	 } else if (item.li_type === 'nm') {
		 str +=
			 '<input type="text" ' +
			 inputName +
			 ' class="t-input js-tilda-rule ' +
			 input_bbonly +
			 '" value="" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' data-tilda-rule="name" style="' +
			 input_style +
			 '">';
	 } else if (item.li_type === 'ta') {
		 str +=
			 '<textarea ' +
			 inputName +
			 ' class="t-input js-tilda-rule ' +
			 input_bbonly +
			 '" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' style="' +
			 input_style +
			 ' ' +
			 (item.li_rows > 1 ? 'height:' + (item.li_rows * 25 + 10) + 'px' : '') +
			 '; padding-top:10px; vertical-align: unset; resize: none;" rows="' +
			 (item.li_rows > 0 ? item.li_rows : '3') +
			 '"></textarea>';
	 } else if (item.li_type === 'sb') {
		 var sb = item.li_variants.split('\n');
		 str += '<div class="t-select__wrapper ' + (a.inputsstyle ? 't-select__wrapper_bbonly' : '') + '">';
		 str +=
			 '<select ' +
			 inputName +
			 ' class="t-select js-tilda-rule ' +
			 (a.inputsstyle ? 't-select_bbonly' : '') +
			 '" ' +
			 input_req +
			 ' style="' +
			 input_style +
			 '">';
		 if (item.li_selfirstvar) {
			 str += '<option value="">' + item.li_selfirstvar + '</option>';
		 }
		 for (i = 0; i < sb.length; i++) {
			 str +=
				 '<option value="' +
				 sb[i] +
				 '" ' +
				 (parseInt(item.li_defselitem, 10) > 0
					 ? parseInt(item.li_defselitem, 10) === i + 1
						 ? 'selected="selected"'
						 : ''
					 : '') +
				 '>' +
				 sb[i] +
				 '</option>';
		 }
		 str += '</select>';
		 if (a.inputelscolor) {
			 str += '<style>';
			 str +=
				 '.tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"] .t-select__wrapper:after {';
			 str += 'border-top-color:' + a.inputelscolor + ';';
			 str += '}';
			 str += '</style>';
		 }
		 str += '</div>';
	 } else if (item.li_type === 'rd') {
		 var rd = item.li_variants.split('\n');
		 if (item.li_radcb === 'cb') {
			 str +=
				 '<input type="hidden" class="t-checkboxes__hiddeninput js-tilda-rule" ' +
				 inputName +
				 ' tabindex="-1" value="" ' +
				 input_req +
				 '>';
			 str += '<div class="t-checkboxes__wrapper">';
			 for (i = 0; i < rd.length; i++) {
				 str += '<label class="t-checkbox__control" style="' + input_txtlbl_style + '">';
				 str +=
					 '<input type="checkbox" value="' +
					 rd[i] +
					 '" class="t-checkbox" ' +
					 (+item.li_defselitem > 0 ? (+item.li_defselitem === +i + 1 ? 'checked="checked"' : '') : '') +
					 ' ' +
					 input_req +
					 '><div class="t-checkbox__indicator" ' +
					 (a.inputelscolor ? 'style="border-color:' + a.inputelscolor + ';"' : '') +
					 '></div>' +
					 rd[i] +
					 '</label>';
			 }
			 str += '</div>';

			 recid = el.closest('.r') ? el.closest('.r').id : '';
			 recid = recid ? recid.replace('rec', '') : '';
			 var currentElID = el.getAttribute('data-elem-id');

			 script = document.createElement('script');
			 script.classList.add('t-zero-forms-s');
			 // script.textContent = `t_zero__onReady(function() {
			 // 		function t_input_checkboxes_updateval(inputList) {
			 // 			var checkedCheckboxes = Array.prototype.slice.call(inputList.querySelectorAll('.t-checkbox:checked'));
			 // 			var value = '';
			 // 			checkedCheckboxes.forEach((checkbox) => {
			 // 				if (value) value += '; ';
			 // 				value += checkbox.value;
			 // 			});
			 // 			var hiddenInput = inputList.querySelector('.t-checkboxes__hiddeninput');
			 // 			if (hiddenInput) hiddenInput.value = value;
			 // 		}
			 // 		function t_input_checkboxes_init(recid, lid, elemid) {
			 // 			var record = document.getElementById('rec' + recid);
			 // 			var elemForm = record ? record.querySelector('[data-elem-id="'+elemid+'"]') : null;
			 // 			if (!elemForm) return;
			 // 			var inputList = elemForm.querySelector('[data-input-lid="'+lid+'"]');
			 // 			var checkboxes = Array.prototype.slice.call(inputList.querySelectorAll('.t-checkbox'));
			 // 			checkboxes.forEach((checkbox) => {
			 // 				checkbox.addEventListener('input', () => {
			 // 					t_input_checkboxes_updateval(inputList);
			 // 				});
			 // 			});
			 // 			t_input_checkboxes_updateval(inputList);
			 // 		}
			 // 		t_input_checkboxes_init('${recid}', '${item.lid}', '${currentElID}');
			 // 	});`;

			 // transform via Babel
			 script.textContent =
				 "t_zero__onReady(function() {\n\t\t\t\t\t\tfunction t_input_checkboxes_updateval(inputList) {\n\t\t\t\t\t\t\tvar checkedCheckboxes = Array.prototype.slice.call(inputList.querySelectorAll('.t-checkbox:checked'));\n\t\t\t\t\t\t\tvar value = '';\n\t\t\t\t\t\t\tcheckedCheckboxes.forEach((checkbox) => {\n\t\t\t\t\t\t\t\tif (value) value += '; ';\n\t\t\t\t\t\t\t\tvalue += checkbox.value;\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\tvar hiddenInput = inputList.querySelector('.t-checkboxes__hiddeninput');\n\t\t\t\t\t\t\tif (hiddenInput) hiddenInput.value = value;\n\t\t\t\t\t\t}\n\t\t\t\t\t\tfunction t_input_checkboxes_init(recid, lid, elemid) {\n\t\t\t\t\t\t\tvar record = document.getElementById('rec' + recid);\n\t\t\t\t\t\t\tvar elemForm = record ? record.querySelector('[data-elem-id=\"'+elemid+'\"]') : null;\n\t\t\t\t\t\t\tif (!elemForm) return;\n\t\t\t\t\t\t\tvar inputList = elemForm.querySelector('[data-input-lid=\"'+lid+'\"]');\n\t\t\t\t\t\t\tvar checkboxes = Array.prototype.slice.call(inputList.querySelectorAll('.t-checkbox'));\n\t\t\t\t\t\t\tcheckboxes.forEach((checkbox) => {\n\t\t\t\t\t\t\t\tcheckbox.addEventListener('input', () => {\n\t\t\t\t\t\t\t\t\tt_input_checkboxes_updateval(inputList);\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\tt_input_checkboxes_updateval(inputList);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tt_input_checkboxes_init('"
					 .concat(recid, "', '")
					 .concat(item.lid, "', '")
					 .concat(currentElID, "');\n\t\t\t\t\t});");
			 scripts.push(script);

			 if (a.inputelscolor) {
				 str += '<style>';
				 str +=
					 '#rec' +
					 recid +
					 ' .tn-elem[data-elem-id="' +
					 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
					 '"] .t-checkbox__indicator:after {';
				 str += 'border-color:' + a.inputelscolor + ';';
				 str += '}';
				 str += '</style>';
			 }
		 } else {
			 str += '<div class="t-radio__wrapper">';
			 for (i = 0; i < rd.length; i++) {
				 str += '<label class="t-radio__control" style="' + input_txtlbl_style + '">';
				 str +=
					 '<input type="radio" ' +
					 inputName +
					 ' value="' +
					 rd[i] +
					 '" ' +
					 (+item.li_defselitem > 0 ? (+item.li_defselitem === i + 1 ? 'checked="checked"' : '') : '') +
					 ' ' +
					 input_req +
					 ' class="t-radio js-tilda-rule"><div class="t-radio__indicator" ' +
					 (a.inputelscolor ? 'style="border-color:' + a.inputelscolor + ';"' : '') +
					 '></div>' +
					 rd[i] +
					 '</label>';
			 }
			 if (a.inputelscolor) {
				 str += '<style>';
				 str +=
					 '.tn-elem[data-elem-id="' +
					 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
					 '"] .t-radio__indicator:after {';
				 str += 'background:' + a.inputelscolor + ';';
				 str += '}';
				 str += '</style>';
			 }
			 str += '</div>';
		 }
	 } else if (item.li_type === 'cb') {
		 str += '<label class="t-checkbox__control" style="' + input_txtlbl_style + '">';
		 str +=
			 '<input type="checkbox" ' +
			 inputName +
			 ' value="yes" class="t-checkbox js-tilda-rule" ' +
			 (item.li_checked === 'y' ? 'checked' : '') +
			 ' ' +
			 input_req +
			 '><div class="t-checkbox__indicator" ' +
			 (a.inputelscolor ? 'style="border-color:' + a.inputelscolor + ';"' : '') +
			 '></div><div class="t-checkbox__labeltext" style="display:inline;">' +
			 item.li_label +
			 '</div></label>';
		 if (a.inputelscolor) {
			 str += '<style>';
			 str +=
				 '#rec' +
				 recid +
				 ' .tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"] .t-checkbox__indicator:after {';
			 str += 'border-color:' + a.inputelscolor + ';';
			 str += '}';
			 str += '</style>';
		 }
	 } else if (item.li_type === 'da') {
		 str += '<div class="t-datepicker__wrapper">';
		 str +=
			 '<input type="text" ' +
			 inputName +
			 ' class="t-input t-datepicker js-tilda-rule js-tilda-mask ' +
			 input_bbonly +
			 '" value="" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' data-tilda-rule="date" data-tilda-dateformat="' +
			 item.li_dateformat +
			 '" data-tilda-datediv="' +
			 item.li_datediv +
			 '" data-tilda-dateunvailable="' +
			 (item.li_dateUnavailPast ? 'past,' : '') +
			 (item.li_dateUnavailMo ? 'mo,' : '') +
			 (item.li_dateUnavailTu ? 'tu,' : '') +
			 (item.li_dateUnavailWe ? 'we,' : '') +
			 (item.li_dateUnavailTh ? 'th,' : '') +
			 (item.li_dateUnavailFr ? 'fr,' : '') +
			 (item.li_dateUnavailSa ? 'sa,' : '') +
			 (item.li_dateUnavailSu ? 'su,' : '') +
			 (item.li_dateUnavailFuture ? 'future,' : '') +
			 (item.li_dateUnavailToday ? 'today' : '') +
			 '" data-tilda-mask="' +
			 item.li_datemask +
			 '" style="' +
			 input_style +
			 '">';
		 str +=
			 '<svg class="t-datepicker__icon ' +
			 (a.inputsstyle ? 't-datepicker__icon_bbonly' : '') +
			 '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 69.5 76.2" style="width:25px;' +
			 (a.inputelscolor ? 'fill:' + a.inputelscolor + ';' : '') +
			 '">';
		 str +=
			 '<path d="M9.6 42.9H21V31.6H9.6v11.3zm3-8.3H18v5.3h-5.3v-5.3zm16.5 8.3h11.3V31.6H29.1v11.3zm3-8.3h5.3v5.3h-5.3v-5.3zM48 42.9h11.3V31.6H48v11.3zm3-8.3h5.3v5.3H51v-5.3zM9.6 62H21V50.6H9.6V62zm3-8.4H18V59h-5.3v-5.4zM29.1 62h11.3V50.6H29.1V62zm3-8.4h5.3V59h-5.3v-5.4zM48 62h11.3V50.6H48V62zm3-8.4h5.3V59H51v-5.4z"/>';
		 str +=
			 '<path d="M59.7 6.8V5.3c0-2.9-2.4-5.3-5.3-5.3s-5.3 2.4-5.3 5.3v1.5H40V5.3C40 2.4 37.6 0 34.7 0s-5.3 2.4-5.3 5.3v1.5h-9.1V5.3C20.3 2.4 18 0 15 0c-2.9 0-5.3 2.4-5.3 5.3v1.5H0v69.5h69.5V6.8h-9.8zm-7.6-1.5c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3v7.1c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3V5.3zm-19.7 0c0-1.3 1-2.3 2.3-2.3S37 4 37 5.3v7.1c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3V5.3zm-19.6 0C12.8 4 13.8 3 15 3c1.3 0 2.3 1 2.3 2.3v7.1c0 1.3-1 2.3-2.3 2.3-1.3 0-2.3-1-2.3-2.3V5.3zm53.7 67.9H3V9.8h6.8v2.6c0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3V9.8h9.1v2.6c0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3V9.8h9.1v2.6c0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3V9.8h6.8l-.1 63.4z"/>';
		 str += '</svg>';
		 str += '</div>';
		 str += '<link rel="stylesheet" href="https://static.tildacdn.com/css/tilda-date-picker-1.0.min.css">';

		 recid = el.closest('.r') ? el.closest('.r').id : '';
		 if (!recid) {
			 recid = el.closest('.tn-artboard') ? el.closest('.tn-artboard').getAttribute('data-record-id') : '';
		 }
		 recid = recid ? recid.replace('rec', '') : '';
		 var elemid = el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '';

		 script = document.createElement('script');
		 script.classList.add('t-zero-forms-s');
		 //@formatter:off
		 scriptText = '';
		 scriptText += "if (document.readyState != 'loading'){";
		 scriptText += 't_inputDatePicker__init();';
		 scriptText += '} else {';
		 scriptText += "document.addEventListener('DOMContentLoaded', function() {";
		 scriptText += 't_inputDatePicker__init();';
		 scriptText += '});';
		 scriptText += '}';
		 scriptText += 'function t_inputDatePicker__init() {';
		 scriptText += 'var script = document.createElement("script");';
		 scriptText += 'script.src = "https://static.tildacdn.com/js/tilda-date-picker-1.0.min.js";';
		 scriptText += 'script.async = true;';
		 scriptText +=
			 'if (!document.querySelector(\'script[src^="https://static.tildacdn.com/js/tilda-date-picker-"]\')) {';
		 scriptText += 'document.body.insertAdjacentElement("beforeend", script);';
		 scriptText += 'script.onload = function() {';
		 scriptText += 'setTimeout(function() {';
		 scriptText +=
			 'try {t_datepicker_init(' + recid + ',' + item.lid + ',' + elemid + ')} catch(err) {console.log(err)};';
		 scriptText += '}, 500);';
		 scriptText += '}';
		 scriptText += '} else {';
		 scriptText += 'setTimeout(function() {';
		 scriptText +=
			 'try {t_datepicker_init(' + recid + ',' + item.lid + ',' + elemid + ')} catch(err) {console.log(err)};';
		 scriptText += '}, 500);';
		 scriptText += '}';
		 scriptText += '}';
		 //@formatter:on
		 script.textContent = scriptText;
		 scripts.push(script);
	 } else if (item.li_type === 'uc') {
		 var tildamode = t_zeroForms__getTildaMode();
		 if (tildamode === 'published') {
			 str += '<div class="t-uploadcare" style="margin-bottom:10px;">';
			 str +=
				 '<input type="text" type="hidden" role="uploadcare-uploader" class="js-tilda-rule" ' +
				 inputName +
				 ' data-public-key="' +
				 (item.li_uckey ? item.li_uckey : 'demopublickey') +
				 '" ' +
				 input_req +
				 ' style="display:none;">';

			 if (!document.getElementById('uploadCareLib')) {
				 script = document.createElement('script');
				 script.classList.add('t-zero-forms-s');
				 script.src = 'https://static.tildacdn.com/js/uploadcare-3.x.min.js';
				 script.async = true;
				 script.charset = 'utf-8';
				 script.id = 'uploadCareLib';
				 document.body.insertAdjacentElement('beforeend', script);
				 script = null;
			 }

			 script = document.createElement('script');
			 script.classList.add('t-zero-forms-s');
			 var elemID = el.getAttribute('data-elem-id');
			 script.id = 'uploadCareScript-' + elemID;
			 scriptText = 'UPLOADCARE_LOCALE = "' + item.li_inp + '";';
			 scriptText += 'UPLOADCARE_TABS = "all";';
			 script.textContent = scriptText;
			 document.body.insertAdjacentElement('beforeend', script);
			 script = null;

			 str += '</div>';
		 } else {
			 str +=
				 '<div style="color:#fff;background-color:#000; padding:10px 20px; display:inline-block; margin-bottom:10px;">Upload button will be here</div>';
		 }
	 } else if (item.li_type === 'uw') {
		 var tildamode = t_zeroForms__getTildaMode();
		 if (tildamode === 'published') {
			 str += '<div class="t-upwidget" style="margin-bottom:5px;min-height:38px;">';
			 str +=
				 '<input type="text" type="hidden" role="upwidget-uploader" class="js-tilda-rule" ' +
				 inputName +
				 ' data-tilda-upwidget-key="' +
				 (item.li_uwkey ? item.li_uwkey : '') +
				 '" ' +
				 input_req +
				 ' ' +
				 (item.li_multiupl === 'y' ? 'data-tilda-upwidget-multiple="1"' : '') +
				 ' style="display:none;">';
			 str += '</div>';

			 script = document.createElement('script');
			 script.classList.add('t-zero-forms-s');
			 //@formatter:off
			 scriptText = '';
			 scriptText += "if (document.readyState != 'loading'){";
			 scriptText += 't_inputUpWidget__init();';
			 scriptText += '} else {';
			 scriptText += "document.addEventListener('DOMContentLoaded', function() {";
			 scriptText += 't_inputUpWidget__init();';
			 scriptText += '});';
			 scriptText += '}';
			 scriptText += 'function t_inputUpWidget__init() {';
			 scriptText += 'var script = document.createElement("script");';
			 scriptText += 'script.src = "https://static.tildacdn.com/js/tilda-upwidget-1.1.min.js";';
			 scriptText += 'script.id = "tUpWidget";';
			 scriptText += 'script.async = true;';
			 scriptText += 'if (!document.getElementById("tUpWidget")) {';
			 scriptText += 'document.body.insertAdjacentElement("beforeend", script);';
			 scriptText += 'script.onload = function() {';
			 scriptText += 'setTimeout(function() {';
			 scriptText += 'try {t_upwidget__init()} catch(err) {console.log(err)};';
			 scriptText += '}, 500);';
			 scriptText += '}';
			 scriptText += '} else {';
			 scriptText += 'setTimeout(function() {';
			 scriptText += 'try {t_upwidget__init()} catch(err) {console.log(err)};';
			 scriptText += '}, 500);';
			 scriptText += '}';
			 scriptText += '}';
			 //@formatter:on
			 script.textContent = scriptText;
			 scripts.push(script);
		 } else {
			 str +=
				 '<div style="color:#fff;background-color:#000; padding:10px 20px; display:inline-block; margin-bottom:5px;">' +
				 (item.li_uwkey === '' ? 'Please set the key' : 'Upload button will be here') +
				 '</div>';
		 }
	 } else if (item.li_type === 'tm') {
		 str +=
			 '<input type="text" ' +
			 inputName +
			 ' class="t-input t-inputtime js-tilda-rule js-tilda-mask ' +
			 input_bbonly +
			 '" value="" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' data-tilda-rule="time" data-tilda-mask="99:99" style="' +
			 input_style +
			 '">';
	 } else if (item.li_type === 'hd') {
		 str += '<input type="hidden" ' + inputName + ' tabindex="-1" value="' + item.li_value + '">';
	 } else if (item.li_type === 'ur') {
		 str +=
			 '<input type="text" ' +
			 inputName +
			 ' class="t-input js-tilda-rule ' +
			 input_bbonly +
			 '" value="" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' data-tilda-rule="url" style="' +
			 input_style +
			 '">';
	 } else if (item.li_type === 'qn') {
		 str += '<div class="t-inputquantity__wrapper">';
		 str +=
			 '  <span class="t-inputquantity__btn t-inputquantity__btn-minus" ' +
			 (a.inputelscolor ? 'style="color:' + a.inputelscolor + '"' : '') +
			 '>&ndash;</span>';
		 str +=
			 '  <input type="text" ' +
			 inputName +
			 ' class="t-input t-inputquantity js-tilda-rule ' +
			 input_bbonly +
			 '" value="' +
			 item.li_value +
			 '" ' +
			 input_ph +
			 ' ' +
			 input_req +
			 ' data-tilda-rule="number" style="' +
			 input_style +
			 '">';
		 str +=
			 '  <span class="t-inputquantity__btn t-inputquantity__btn-plus" ' +
			 (a.inputelscolor ? 'style="color:' + a.inputelscolor + '"' : '') +
			 '>+</span>';
		 str += '</div>';

		 recid = el.closest('.r') ? el.closest('.r').id : '';
		 recid = recid ? recid.replace('rec', '') : '';

		 script = document.createElement('script');
		 script.classList.add('t-zero-forms-s');
		 //@formatter:off
		 scriptText = '';
		 scriptText += "if (document.readyState != 'loading'){";
		 scriptText += 't_input__quanityCounterInit()';
		 scriptText += '} else {';
		 scriptText += "document.addEventListener('DOMContentLoaded', function() {";
		 scriptText += 't_input__quanityCounterInit()';
		 scriptText += '});';
		 scriptText += '}';
		 scriptText += '';
		 scriptText += 'function t_input__quanityCounterInit() {';
		 scriptText += 'function t_input_quantity_init(recid, lid) {';
		 scriptText +=
			 "var plusBtn = document.querySelector('#rec' + recid + ' [data-input-lid=\"' + lid + '\"] .t-inputquantity__btn-plus');";
		 scriptText +=
			 "var minusBtn = document.querySelector('#rec' + recid + ' [data-input-lid=\"' + lid + '\"] .t-inputquantity__btn-minus');";
		 scriptText += 'if (plusBtn) {';
		 scriptText += "plusBtn.addEventListener('click', function() {";
		 scriptText += "var parent = plusBtn.closest('[data-input-lid=\"'+lid+'\"]');";
		 scriptText += "var quantity = parent ? parent.querySelector('.t-inputquantity') : null;";
		 scriptText += 'var val = quantity ? +quantity.value : 0;';
		 scriptText += 'if (val >= 0) {';
		 scriptText += 'val++;';
		 scriptText += '} else {';
		 scriptText += 'val = 1;';
		 scriptText += '}';
		 scriptText += 'if (quantity) quantity.value = val;';
		 scriptText += '});';
		 scriptText += '}';
		 scriptText += 'if (minusBtn) {';
		 scriptText += "minusBtn.addEventListener('click', function() {";
		 scriptText += "var parent = plusBtn.closest('[data-input-lid=\"'+lid+'\"]');";
		 scriptText += "var quantity = parent ? parent.querySelector('.t-inputquantity') : null;";
		 scriptText += 'var val = quantity ? +quantity.value : 0;';
		 scriptText += 'if (val > 0) {';
		 scriptText += 'val--;';
		 scriptText += '} else {';
		 scriptText += 'val = 0;';
		 scriptText += '}';
		 scriptText += 'if (quantity) quantity.value = val;';
		 scriptText += '});';
		 scriptText += '}';
		 scriptText += '}';
		 scriptText += "t_input_quantity_init('" + recid + "','" + item.lid + "');";
		 scriptText += '}';
		 //@formatter:on
		 script.textContent = scriptText;
		 scripts.push(script);
	 } else if (item.li_type === 'pc') {
		 /* */
	 } else if (item.li_type === 'tx') {
		 str +=
			 '<div class="t-text" field="li_text__' +
			 item.lid +
			 '" style="' +
			 input_txtlbl_style +
			 '">' +
			 item.li_text +
			 '</div>';
	 } else if (item.li_type === 'ws') {
		 str +=
			 '<div class="" style="' +
			 (item.li_rows > 0 ? 'height:' + item.li_rows * 34 + 'px' : '') +
			 '">&nbsp;</div>';
	 } else if (item.li_type === 'st') {
		 /* */
	 } else if (item.li_type === 'fr') {
		 str +=
			 '<input type="hidden" class="t-calc__hiddeninput js-tilda-rule" ' +
			 inputName +
			 ' tabindex="-1" value="0">';
		 str += '<div class="t-calc__wrapper t-name t-name_md" style="' + inputTextStyles + '">';
		 str +=
			 '    ' +
			 (item.li_prefix ? '<span class="t-calc__prefix-text">' + item.li_prefix + '</span>' : '') +
			 '<span class="t-calc" data-calc-expr="' +
			 t_zeroForms__escape(item.li_expr) +
			 '">0</span>' +
			 (item.li_postfix ? '<span class="t-calc__postfix-text">' + item.li_postfix + '</span>' : '') +
			 '';
		 str += '</div>';

		 recid = el.closest('.r') ? el.closest('.r').id : '';
		 recid = recid ? recid.replace('rec', '') : '';

		 script = document.createElement('script');
		 script.classList.add('t-zero-forms-s');

		 // script.textContent = `t_zero__onReady(function() {
		 // 		var script = document.createElement('script');
		 // 		script.src = 'https://static.tildacdn.com/js/tilda-calc-1.0.min.js';
		 // 		script.id = 'tCalcScript';
		 // 		script.async = true;
		 // 		if (!document.getElementById('tCalcScript')) {
		 // 			var currentScript = document.getElementById('${item.lid}-calc');
		 // 			if (currentScript) currentScript.insertAdjacentElement('beforebegin', script);
		 // 		} else {
		 // 			script = document.getElementById('tCalcScript');
		 // 		}
		 // 		if (script.readyState === 'loaded' || script.readyState === 'complete') {
		 // 			tcalc__init('${recid}', '${item.lid}');
		 // 		} else {
		 // 			script.addEventListener('load', function() {
		 // 				tcalc__init('${recid}', '${item.lid}');
		 // 			});
		 // 		}
		 // 	});`;

		 // transform via Babel
		 script.textContent =
			 "t_zero__onReady(function() {\n\t\t\t\t\tvar script = document.createElement('script');\n\t\t\t\t\tscript.src = 'https://static.tildacdn.com/js/tilda-calc-1.0.min.js';\n\t\t\t\t\tscript.id = 'tCalcScript';\n\t\t\t\t\tscript.async = true;\n\t\t\t\t\tif (!document.getElementById('tCalcScript')) {\n\t\t\t\t\t\tvar currentScript = document.getElementById('"
				 .concat(
					 item.lid,
					 "-calc');\n\t\t\t\t\t\tif (currentScript) currentScript.insertAdjacentElement('beforebegin', script);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tscript = document.getElementById('tCalcScript');\n\t\t\t\t\t}\n\t\t\t\t\tif (script.readyState === 'loaded' || script.readyState === 'complete') {\n\t\t\t\t\t\ttcalc__init('"
				 )
				 .concat(recid, "', '")
				 .concat(
					 item.lid,
					 "');\n\t\t\t\t\t} else {\n\t\t\t\t\t\tscript.addEventListener('load', function() {\n\t\t\t\t\t\t\ttcalc__init('"
				 )
				 .concat(recid, "', '")
				 .concat(item.lid, "');\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});");
		 script.id = item.lid + '-calc';
		 scripts.push(script);

		 if (typeof a.inputfrbgcolor != 'undefined' && a.inputfrbgcolor) {
			 str += '<style>';
			 str +=
				 '.tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"] .t-input-group_fr {';
			 str += '    background-color: ' + a.inputfrbgcolor + ';';
			 str += '    padding: 20px 30px 25px;';
			 str += '}';
			 str += '</style>';
		 }
		 if (item.li_addtocart === 'y') {
			 if (item.li_prod_title) {
				 str +=
					 '<input type="hidden" class="t-calc__hidden__prod_title" name="prod_title" value="' +
					 item.li_prod_title +
					 '" tabindex="-1">';
			 }
			 if (item.li_prod_img) {
				 str +=
					 '<input type="hidden" class="t-calc__hidden__prod_img" name="prod_img" value="' +
					 item.li_prod_img +
					 '" tabindex="-1">';
			 }
		 }
	 } else if (item.li_type === 'rg') {
		 str += '<div class="t-range__wrapper">';
		 str +=
			 '    <input ' +
			 inputName +
			 ' class="t-range js-tilda-rule" type="range" min="' +
			 (item.li_vmin ? item.li_vmin : '0') +
			 '" max="' +
			 (item.li_vmax ? item.li_vmax : '10') +
			 '" step="' +
			 (item.li_step ? item.li_step : '1') +
			 '" ' +
			 (item.li_value ? 'value="' + item.li_value + '"' : '') +
			 ' ' +
			 (a.inputelscolor ? 'data-range-color="' + a.inputelscolor + '"' : '') +
			 '>';
		 str += '    <div class="t-range__value-txt t-descr t-descr_xxs" style="display: none;"></div>';
		 str += '    <div class="t-range__interval-txt-wrapper">';
		 str +=
			 '        <div class="t-range__interval-txt t-range__interval-txt_min t-descr t-descr_xxs" ' +
			 (a.inputtitlecolor ? 'style="color: ' + a.inputtitlecolor + '"' : '') +
			 '>' +
			 (item.li_vmin ? item.li_vmin : '0') +
			 '</div>';
		 str +=
			 '        <div class="t-range__interval-txt t-range__interval-txt_max t-descr t-descr_xxs" ' +
			 (a.inputtitlecolor ? 'style="color: ' + a.inputtitlecolor + '"' : '') +
			 '>' +
			 (item.li_vmax ? item.li_vmax : '10') +
			 '</div>';
		 str += '    </div>';
		 str += '</div>';
		 str += '<link rel="stylesheet" href="https://static.tildacdn.com/css/tilda-range-1.0.min.css">';

		 recid = el.closest('.r') ? el.closest('.r').id : '';
		 if (!recid) {
			 recid = el.closest('.tn-artboard') ? el.closest('.tn-artboard').getAttribute('data-record-id') : '';
		 }
		 recid = recid ? recid.replace('rec', '') : '';

		 script = document.createElement('script');
		 script.classList.add('t-zero-forms-s');

		 // script.textContent = `t_zero__onReady(function() {
		 // 		var script = document.createElement('script');
		 // 		script.src = 'https://static.tildacdn.com/js/tilda-range-1.0.min.js';
		 // 		script.id = 'tRangeSlider';
		 // 		script.async = true;
		 // 		if (!document.getElementById('tRangeSlider')) {
		 // 			document.body.insertAdjacentElement('beforeend', script);
		 // 		} else {
		 // 			script = document.getElementById('tRangeSlider');
		 // 		}
		 // 		if (script.readyState === 'loaded' || script.readyState === 'complete') {
		 // 			t_input_range_init('${recid}', '${item.lid}');
		 // 		} else {
		 // 			script.addEventListener('load', function() {
		 // 				t_input_range_init('${recid}', '${item.lid}');
		 // 			});
		 // 		}
		 // 	});`;

		 // transform via Babel
		 script.textContent =
			 "t_zero__onReady(function() {\n\t\t\t\t\tvar script = document.createElement('script');\n\t\t\t\t\tscript.src = 'https://static.tildacdn.com/js/tilda-range-1.0.min.js';\n\t\t\t\t\tscript.id = 'tRangeSlider';\n\t\t\t\t\tscript.async = true;\n\t\t\t\t\tif (!document.getElementById('tRangeSlider')) {\n\t\t\t\t\t\tdocument.body.insertAdjacentElement('beforeend', script);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tscript = document.getElementById('tRangeSlider');\n\t\t\t\t\t}\n\t\t\t\t\tif (script.readyState === 'loaded' || script.readyState === 'complete') {\n\t\t\t\t\t\tt_input_range_init('"
				 .concat(recid, "', '")
				 .concat(
					 item.lid,
					 "');\n\t\t\t\t\t} else {\n\t\t\t\t\t\tscript.addEventListener('load', function() {\n\t\t\t\t\t\t\tt_input_range_init('"
				 )
				 .concat(recid, "', '")
				 .concat(item.lid, "');\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});");
		 scripts.push(script);

		 if (a.inputelscolor) {
			 str += '<style>';
			 str +=
				 (recid ? '#rec' + recid + ' ' : '') +
				 '.tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"]  .t-range::-webkit-slider-thumb {';
			 str += '    background: ' + a.inputelscolor + ';';
			 str += '}';
			 str +=
				 (recid ? '#rec' + recid + ' ' : '') +
				 '.tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"]  .t-range::-moz-range-thumb {';
			 str += '    background: ' + a.inputelscolor + ';';
			 str += '}';
			 str +=
				 (recid ? '#rec' + recid + ' ' : '') +
				 '.tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"]  .t-range::-ms-thumb {';
			 str += '    background: ' + a.inputelscolor + ';';
			 str += '}';
			 str += '</style>';
		 }
	 } else if (item.li_type === 'ri') {
		 // var formhaschrdbox = 'yes';
		 if (item.li_radcb === 'cb') {
			 str +=
				 '<input type="hidden" class="t-img-select__hiddeninput js-tilda-rule" ' +
				 inputName +
				 ' tabindex="-1" value="" ' +
				 input_req +
				 '>';
		 }

		 var galobj = '';
		 if (typeof item.li_gallery !== 'undefined' && item.li_gallery) {
			 galobj = JSON.parse(item.li_gallery);
		 }
		 if (typeof galobj === 'object') {
			 str +=
				 '<div class="t-img-select__container" data-check-bgcolor="' +
				 (a.inputelscolor ? a.inputelscolor : '#000') +
				 '">';
			 for (i = 0; i < galobj.length; i++) {
				 if (typeof galobj[i] != 'undefined') {
					 str += '<label class="t-img-select__control">';
					 str +=
						 '    <input ' +
						 (item.li_radcb === 'cb' ? 'type="checkbox"' : 'type="radio" ' + inputName) +
						 ' value="' +
						 (typeof galobj[i].alt != 'undefined' && galobj[i].alt ? galobj[i].alt : galobj[i].img) +
						 '" class="t-img-select ' +
						 (item.li_radcb === 'rb' ? 'js-tilda-rule' : '') +
						 '" ' +
						 (+item.li_defselitem > 0
							 ? +item.li_defselitem === i + 1
								 ? 'checked="checked"'
								 : ''
							 : '') +
						 ' ' +
						 input_req +
						 '>';
					 if (galobj[i].img) {
						 var selectimgratio = 't-img-select__indicator_1-1';
						 switch (item.li_imgratio) {
							 case '3_2':
								 selectimgratio = 't-img-select__indicator_3-2';
								 break;
							 case '4_3':
								 selectimgratio = 't-img-select__indicator_4-3';
								 break;
							 case '2_3':
								 selectimgratio = 't-img-select__indicator_2-3';
								 break;
							 case '3_4':
								 selectimgratio = 't-img-select__indicator_3-4';
								 break;
						 }
						 str +=
							 '<div class="t-bgimg t-img-select__indicator ' +
							 selectimgratio +
							 '" data-original="' +
							 galobj[i].img +
							 '" style="background-image:url(\'' +
							 galobj[i].img +
							 '\');"></div>';
					 }
					 if (typeof galobj[i].alt != 'undefined' && galobj[i].alt) {
						 str +=
							 '    <div class="t-img-select__text t-text t-text_xs"' +
							 (a.inputtitlecolor ? ' style="color: ' + a.inputtitlecolor + '"' : '') +
							 '>';
						 str += '      ' + galobj[i].alt + '';
						 str += '    </div>';
					 }
					 str += '</label>';
				 }
			 }
			 str += '</div>';
		 }

		 str += '<link rel="stylesheet" href="https://static.tildacdn.com/css/tilda-img-select-1.0.css">';

		 recid = el.closest('.r') ? el.closest('.r').id : '';
		 recid = recid ? recid.replace('rec', '') : '';

		 script = document.createElement('script');
		 script.classList.add('t-zero-forms-s');

		 // script.textContent = `t_zero__onReady(function() {
		 // 		var script = document.createElement('script');
		 // 		script.src = 'https://static.tildacdn.com/js/tilda-img-select-1.0.min.js';
		 // 		script.id = 'tImgSelect';
		 // 		script.async = true;
		 // 		if (!document.getElementById('tImgSelect')) {
		 // 			document.body.insertAdjacentElement('beforeend', script);
		 // 		} else {
		 // 			script = document.getElementById('tImgSelect');
		 // 		}
		 // 		if (script.readyState === 'loaded' || script.readyState === 'complete') {
		 // 			t_input_imgselect_init('${recid}', '${item.lid}');
		 // 			t_input_imgselect_invertColor('${recid}');
		 // 		} else {
		 // 			script.addEventListener('load', function() {
		 // 				t_input_imgselect_init('${recid}', '${item.lid}');
		 // 				t_input_imgselect_invertColor('${recid}');
		 // 			});
		 // 		}
		 // 	});`;

		 // transform via Babel
		 script.textContent =
			 "t_zero__onReady(function() {\n\t\t\t\t\tvar script = document.createElement('script');\n\t\t\t\t\tscript.src = 'https://static.tildacdn.com/js/tilda-img-select-1.0.min.js';\n\t\t\t\t\tscript.id = 'tImgSelect';\n\t\t\t\t\tscript.async = true;\n\t\t\t\t\tif (!document.getElementById('tImgSelect')) {\n\t\t\t\t\t\tdocument.body.insertAdjacentElement('beforeend', script);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tscript = document.getElementById('tImgSelect');\n\t\t\t\t\t}\n\t\t\t\t\tif (script.readyState === 'loaded' || script.readyState === 'complete') {\n\t\t\t\t\t\tt_input_imgselect_init('"
				 .concat(recid, "', '")
				 .concat(item.lid, "');\n\t\t\t\t\t\tt_input_imgselect_invertColor('")
				 .concat(
					 recid,
					 "');\n\t\t\t\t\t} else {\n\t\t\t\t\t\tscript.addEventListener('load', function() {\n\t\t\t\t\t\t\tt_input_imgselect_init('"
				 )
				 .concat(recid, "', '")
				 .concat(item.lid, "');\n\t\t\t\t\t\t\tt_input_imgselect_invertColor('")
				 .concat(recid, "');\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});");
		 scripts.push(script);

		 if (a.inputelscolor) {
			 str += '<style>';
			 str +=
				 '.tn-elem[data-elem-id="' +
				 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
				 '"] .t-img-select__indicator:after {';
			 str += '   background-color:' + a.inputelscolor + ';';
			 str += '  }';
			 str += '</style>';
		 }
	 }
	 str += '<div class="t-input-error"></div>';
	 str += '</div>';
	 str += '</div>';
 } else if (item.li_type === 'hd') {
	 str += '<input type="hidden" name="' + item.li_nm + '" tabindex="-1" value="' + item.li_value + '">';
 }
 return {
	 string: str,
	 script: scripts,
 };
}

/**
* create button for current form
*
* @param {HTMLElement} el - current form
* @param {Object} a - obj with params
* @returns {string} - string, which will parse into HTML
*/
function t_zeroForms__getFormButtonHtml(el, a) {
 if (window.jQuery && el instanceof jQuery) {
	 el = el.length ? el.get(0) : null;
 }
 var currentFormID = el ? el.getAttribute('data-elem-id') : '';
 var rec = el ? el.closest('.r') : null;
 var recid = rec ? rec.id : '';
 var hasUploadCare = document.getElementById('uploadCareScript-' + currentFormID);
 var str = '';
 var buttonfontweight = a.buttonfontweight === 'variation' ? a.buttonvariationweight : a.buttonfontweight;
 str +=
	 '<div class="tn-form__submit" style="' +
	 (a.buttonalign === 'center' ? 'text-align:center;' : '') +
	 (a.buttonmargtop ? 'margin-top:' + a.buttonmargtop + 'px' : '') +
	 '">';
 str += '<button type="submit" class="t-submit" style="';
 if (a.buttoncolor) str += 'color:' + a.buttoncolor + ';';
 if (a.buttonbordersize || a.buttonbordercolor) {
	 str +=
		 'border:' +
		 (a.buttonbordersize ? a.buttonbordersize : '0') +
		 'px solid ' +
		 (a.buttonbordercolor ? a.buttonbordercolor : 'transparent') +
		 ';';
 }
 str += a.buttonbgcolor ? 'background-color:' + a.buttonbgcolor + ';' : 'background-color: transparent;';
 if (a.buttonradius) str += 'border-radius:' + a.buttonradius + 'px;';
 if (a.buttonfontfamily) str += 'font-family:' + a.buttonfontfamily + ';';
 if (buttonfontweight) str += 'font-weight:' + buttonfontweight + ';';
 if (a.buttonfontsize) str += 'font-size:' + a.buttonfontsize + 'px;';
 if (a.buttonshadowsize || a.buttonshadowopacity) {
	 str +=
		 'box-shadow: 0px 0px ' +
		 (a.buttonshadowsize ? a.buttonshadowsize + 'px' : '10px') +
		 ' 0px rgba(0, 0, 0, ' +
		 (a.buttonshadowopacity ? a.buttonshadowopacity / 100 : '0.3') +
		 ');';
 }
 if (a.buttonwidth) {
	 str += 'width:' + a.buttonwidth + 'px;';
 } else {
	 str += 'width:100%;';
 }
 if (a.buttonheight) str += 'height:' + a.buttonheight + 'px;';
 if (a.buttonalign === 'center') str += 'margin-left:auto;margin-right:auto;';
 str += 'padding:0 15px;display:block;';
 str += '">';
 if (a.buttontitle) str += a.buttontitle;
 str += '</button>';
 str += '</div>';

 if (hasUploadCare && currentFormID && recid) {
	 str += '<style>';
	 str +=
		 '#' +
		 recid +
		 ' [data-elem-id="' +
		 currentFormID +
		 '"] .uploadcare--widget__button.uploadcare--widget__button_type_open {';
	 str += 'cursor: pointer;';
	 if (a.buttoncolor) str += 'color:' + a.buttoncolor + ';';
	 if (a.buttonbordersize || a.buttonbordercolor) {
		 str +=
			 'border:' +
			 (a.buttonbordersize ? a.buttonbordersize : '0') +
			 'px solid ' +
			 (a.buttonbordercolor ? a.buttonbordercolor : 'transparent') +
			 ';';
	 }
	 if (a.buttonradius) str += 'border-radius:' + a.buttonradius + 'px;';
	 if (a.buttonfontfamily) str += 'font-family:' + a.buttonfontfamily + ';';
	 if (buttonfontweight) str += 'font-weight:' + buttonfontweight + ';';
	 if (a.buttonfontsize) str += 'font-size:' + a.buttonfontsize + 'px;';
	 str += a.buttonbgcolor ? 'background-color:' + a.buttonbgcolor + ';' : 'background-color: transparent;';
	 str += '}';
	 str += '</style>';
 }

 return str;
}

/**
*
* @param {HTMLElement} el - current form
* @param {string} datastr - textarea value
* @param {string} recid - record ID
*/

function t_zeroForms__resizeButton(el) {
 if (window.jQuery && el instanceof jQuery) {
	 el = el.length ? el.get(0) : null;
 }

 var a = {};
 var field = 'buttonwidth';
 var tildamode = t_zeroForms__getTildaMode();
 var hasJquery = typeof jQuery === 'function';

 if (tildamode === 'zero') {
	 a[field] = elem__getFieldValue(hasJquery ? $(el) : el, field);
 } else {
	 t_onFuncLoad('t396_elem__getFieldValue', function () {
		 a[field] = t396_elem__getFieldValue(hasJquery ? $(el) : el, field);
		 if (typeof a[field] == 'undefined') a[field] = '';
	 });
 }

 var button = el.querySelector('.t-submit');
 var cashedWidth = parseInt(button.style.width, 10);
 var currentWidth = parseInt(a.buttonwidth, 10);
 if (cashedWidth !== currentWidth) button.style.width = currentWidth + 'px';
}

/**
* get input placeholder styles
*
* @param {HTMLElement} el - current element
* @param {Object} a - obj
* @param {string} recid - record ID
* @returns {string}
*/
function t_zeroForms__getInputPlaceholderStyles(el, a, recid) {
 if (window.jQuery && el instanceof jQuery) {
	 el = el.length ? el.get(0) : null;
 }
 var selector = '';
 if (recid > 0) selector += '#rec' + recid + ' ';
 selector +=
	 '.tn-elem[data-elem-id="' + (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') + '"]';
 var str = '';
 str += '<style>';
 str += selector + ' input::-webkit-input-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' input::-moz-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' input:-moz-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' input:-ms-input-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' textarea::-webkit-input-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' textarea::-moz-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' textarea:-moz-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += selector + ' textarea:-ms-input-placeholder {color:' + a.inputcolor + '; opacity: 0.5;} ';
 str += '</style>';
 return str;
}

/**
* get error box
*
* @param {HTMLElement} el - current element
* @param {Object} a - obj
* @returns {string}
*/
function t_zeroForms__getErrorBoxHtml(el, a) {
 var str = '';
 //@formatter:off
 str += '<div class="js-errorbox-all t-form__errorbox-wrapper" style="display:none;">';
 str += '    <div class="t-form__errorbox-text t-text t-text_xs">';
 str += '        <p class="t-form__errorbox-item js-rule-error js-rule-error-all"></p>';
 str += '        <p class="t-form__errorbox-item js-rule-error js-rule-error-req">' + a.formerrreq + '</p>';
 str += '        <p class="t-form__errorbox-item js-rule-error js-rule-error-email">' + a.formerremail + '</p>';
 str += '        <p class="t-form__errorbox-item js-rule-error js-rule-error-name">' + a.formerrname + '</p>';
 str += '        <p class="t-form__errorbox-item js-rule-error js-rule-error-phone">' + a.formerrphone + '</p>';
 str += '        <p class="t-form__errorbox-item js-rule-error js-rule-error-string"></p>';
 str += '    </div>';
 str +=
	 '	<div class="tn-form__errorbox-close js-errorbox-close"><div class="tn-form__errorbox-close-line tn-form__errorbox-close-line-left"></div><div class="tn-form__errorbox-close-line tn-form__errorbox-close-line-right"></div></div>';
 str += '</div>';
 //@formatter:on

 str += '<style>';
 str +=
	 '.tn-atom .t-input-error{position:absolute;color:red;background-color:#fff;padding:8px 10px;border-radius:2px;z-index:1;margin-top:5px;left:0px;box-shadow:0px 1px 20px 0px rgba(0, 0, 0, 0.2);}';
 str +=
	 ".tn-atom .t-input-error:after{content:'';position:absolute;width:0;height:0;border:solid transparent;border-width:6px;top:-12px;left:15%;border-bottom-color:#fff;}";
 str += '.tn-form__errorbox-close{';
 str += '	height:14px; position:absolute; right:8px; top:8px; width:14px; cursor:pointer;';
 str += '}';
 str += '.tn-form__errorbox-close-line{';
 str +=
	 '	background:#fff none repeat scroll 0 0;height:1px; left:0; margin-top:-1px; position:absolute; top:50%; width:100%;';
 str += '}';
 str += '.tn-form__errorbox-close-line-left{';
 str += '	transform:rotate(45deg);';
 str += '}';
 str += '.tn-form__errorbox-close-line-right{';
 str += '	transform:rotate(-45deg);';
 str += '}';
 str += '.tn-atom .t-form__errorbox-wrapper, .tn-form__errorbox-popup{';
 str +=
	 '	position:fixed; bottom:20px; right:20px; z-index:10000; max-width:400px; min-width:260px; width:auto; box-shadow:0 0 3px 1px rgba(0, 0, 0, 0.2); border-radius:3px;text-align:left;font-family:Arial,sans-serf;background:#F95D51;padding:10px;';
 str += '}';
 str +=
	 '.tn-atom .js-error-control-box .t-radio__wrapper, .tn-atom .js-error-control-box .t-checkbox__control{padding:3px;margin-top:-3px;}';

 str += '@media screen and (max-width: 480px){';
 str += '.tn-atom .t-form__errorbox-wrapper, .tn-form__errorbox-popup {';
 str += '	max-width:280px;';
 str += '}';
 str += '}';
 str += '</style>';
 //@formatter:on

 var script = document.createElement('script');
 script.classList.add('t-zero-forms-s');
 //@formatter:off
 script.id = 'errorBoxScriptInit';
 script.textContent += "document.addEventListener('click', function(e) {";
 script.textContent += "if (e.target.closest('.js-errorbox-close') && e.target.closest('.tn-atom')) {";
 script.textContent += "e.target.parentNode.style.display = 'none';";
 script.textContent += '}';
 script.textContent += '});';
 //@formatter:on
 if (!document.getElementById('errorBoxScriptInit')) {
	 document.body.insertAdjacentElement('beforeend', script);
 }
 return str;
}

/**
* change string
*
* @param {string} str - current string
* @returns {string | void} - changed string or void if str === undefined
*/
function t_zeroForms__escape(str) {
 if (typeof str != 'undefined') {
	 str = str.replace(/"/g, '&quot;');
	 str = str.replace(/'/g, '&apos;');
 }
 return str;
}

/**
* get tildamode
*
* @returns {string|void} - void if attr in switch case cannot find current options
*/
function t_zeroForms__getTildaMode() {
 if (typeof window.tildamode !== 'undefined') {
	 return window.tildamode;
 }
 var allRec = document.getElementById('allrecords');
 if (allRec) {
	 switch (allRec.getAttribute('data-tilda-mode')) {
		 case 'edit':
			 window.tildamode = 'edit';
			 break;
		 case 'preview':
			 window.tildamode = 'preview';
			 break;
		 default:
			 window.tildamode = 'published';
			 break;
	 }
 }
 return window.tildamode;
}

/**
* styles for horizontal form
*
* @returns {string} - string, which will parse into HTML
*/
function t_zeroForms__getHorizStyles() {
 var str = '';
 str += '<style>';
 str += '.tn-form_horiz .t-section__topwrapper { margin-bottom: 75px; }';
 str += '.tn-form_horiz .t-section__title { margin-bottom: 30px; }';
 str += '.tn-form_horiz .t-section__descr { max-width: 560px; }';
 str += '.tn-form_horiz.t-form_inputs-total_5 .t-input-group{ width: 20%; }';
 str += '.tn-form_horiz.t-form_inputs-total_4 .t-input-group{ width: 25%; }';
 str += '.tn-form_horiz.t-form_inputs-total_3 .t-input-group{ width: 33.33%; }';
 str += '.tn-form_horiz.t-form_inputs-total_2 .t-input-group{ width: 50%; }';
 str += '.tn-form_horiz.t-form_inputs-total_1 .t-input-group{ width: 100%; }';
 str +=
	 '.tn-form_horiz .t-form__inputsbox{ display:table; -webkit-transition: max-height 0.3s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s linear; transition: max-height 0.3s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s linear; max-height: 5000px;	}';
 str +=
	 '.tn-form_horiz__inputsbox_hidden.t-form__inputsbox { display: block; overflow: hidden; max-height: 0px; opacity: 0; }';
 str += '.tn-form_horiz .t-input-group { display: table-cell; vertical-align: bottom; }';
 str += '.tn-form_horiz .t-input-block{ height: 100%; width:100%; box-sizing: border-box; }';
 str += '.tn-form_horiz .t-input-title { padding-bottom: 5px; }';
 str += '.tn-form_horiz .t-input-subtitle{ margin-top: -5px; padding-bottom: 10px; }';
 str += '.tn-form_horiz .t-form__submit,';
 str += '.tn-form_horiz .tn-form__submit{ display: table-cell; vertical-align: bottom; height: 100%;	}';
 str += '.tn-form_horiz .t-datepicker{ width: 100%; }';
 str += '.tn-form_horiz .t-form_bbonly .t-input-title{ padding-bottom: 0; margin-bottom: 0; }';
 str += '.tn-form_horiz .t-form_bbonly .t-input-subtitle{ padding-bottom: 0; padding-top: 5px; }';
 str += '.tn-form_horiz .t-input-error { display:none !important; }';
 str += '</style>';
 return str;
}

/**
* adding styles for .t-input-block
*
* @returns {string} - styles
*/
function t_zeroForms__getCommonStyles() {
 var str = '';
 str += '<style>';
 str += '.tn-atom .t-input-block {position: relative;}';
 str += '</style>';
 return str;
}

/**
*
* @param {HTMLElement} el - current form
* @param {Object} a - object with params
* @param {string} recid - record ID
* @returns {string} - string, which will parse into HTML
*/
function t_zeroForms__getBottomText(el, a, recid) {
 var str = '';

 if (a.formbottomcb === 'cb' || a.formbottomcb === 'cbx') {
	 // var formhaschrdbox = 'yes';
	 str +=
		 '<label class="t-checkbox__control t-text t-text_xxs" style="' +
		 (a.inputtitlecolor ? 'color:' + a.inputtitlecolor + ';' : '') +
		 '">';
	 str +=
		 '<input type="checkbox" name="form_bottom_checkbox" value="yes" class="t-checkbox js-tilda-rule" data-tilda-req="1" ' +
		 (a.formbottomcb === 'cbx' ? 'checked' : '') +
		 '><div class="t-checkbox__indicator" style="width:15px;height:15px;margin-right:5px;' +
		 (a.inputelscolor ? 'border-color:' + a.inputelscolor + ';' : '') +
		 '"></div><div class="t-checkbox__labeltext" style="display:inline;">' +
		 a.formbottomtext +
		 '</div></label>';
	 str += '<style>';
	 if (recid > 0) str += '#rec' + recid + ' ';
	 str +=
		 '#rec' +
		 recid +
		 ' .tn-elem[data-elem-id="' +
		 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
		 '"] .t-form__bottom-text .t-checkbox__indicator:after {';
	 if (a.inputelscolor) {
		 str += 'border-color:' + a.inputelscolor + ';';
	 }
	 str += 'left:3px;top:0;height:6px;';
	 str += '}';
	 str += '</style>';
 } else if (a.formbottomtext) {
	 str += a.formbottomtext;
 }
 return str;
}

/**
* animate inputs
*
* @param {HTMLElement} el - current form element
* @param {Object} a - object with params
* @param {string} recid - record ID
*/
function t_zeroForms__animateInputs(el, a, recid) {
 if (a.inputcolor) {
	 var str = '<style class="t-zero-forms-s">';
	 if (recid > 0) str += '#rec' + recid + ' ';
	 str +=
		 '.tn-elem[data-elem-id="' +
		 (el.getAttribute('data-elem-id') ? el.getAttribute('data-elem-id') : '') +
		 '"] .t-input__vis-ph{color:' +
		 a.inputcolor +
		 ';}';
	 str += '</style>';
	 document.head.insertAdjacentHTML('beforeend', str);
 }

 var ph_top = '';
 if (a.inputheight && a.inputfontsize) {
	 ph_top = (a.inputheight * 1 - a.inputfontsize * 1) / 2;
 }

 var inputs = el.querySelectorAll(
	 '.t-input:not(.t-inputquantity):not(.t-input-phonemask__wrap):not(.t-input-phonemask)'
 );
 var fontInputWeight = a.inputfontweight === 'variation' ? a.inputvariationweight : a.inputfontweight;
 var inputsGroup = el.querySelectorAll(
	 '.t-input-group:not(.t-input-group_da):not(.t-input-group_uw):not(.t-input-group_ri):not(.t-input-group_cb):not(.t-input-group_rg):not(.t-input-group_ph) .t-input-block, .t-datepicker__wrapper'
 );
 Array.prototype.forEach.call(inputsGroup, function (input) {
	 input.style.position = 'relative';
	 input.style.overflow = 'hidden';
 });
 Array.prototype.forEach.call(inputs, function (input) {
	 input.classList.add('t-input_pvis');
	 var placeholder = input.getAttribute('placeholder');
	 if (placeholder) {
		 input.insertAdjacentHTML(
			 'afterend',
			 '<div class="t-input__vis-ph" style="' +
				 (ph_top ? 'top:' + ph_top + 'px;' : '') +
				 (fontInputWeight ? 'font-weight:' + fontInputWeight + ';' : '') +
				 (a.inputfontsize
					 ? 'font-size:' + a.inputfontsize + 'px;height:' + (parseInt(a.inputfontsize, 10) + 1) + 'px;' //increase height for 1 px, to prevent cutting
					 : '') +
				 '">' +
				 placeholder +
				 '</div>'
		 );
	 }
	 input.setAttribute('placeholder', '');

	 input.addEventListener('blur', function (e) {
		 if (e.target.value) {
			 e.target.classList.add('t-input_has-content');
		 } else {
			 e.target.classList.remove('t-input_has-content');
		 }
	 });
 });
 if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
	 var textareaNotBBOnly = el.querySelectorAll('textarea:not(.t-input_bbonly)');
	 var textareaBBOnly = el.querySelectorAll('textarea.t-input_bbonly');
	 Array.prototype.forEach.call(textareaNotBBOnly, function (textarea) {
		 textarea.style.paddingLeft = '17px';
	 });
	 Array.prototype.forEach.call(textareaBBOnly, function (textarea) {
		 textarea.style.textIndent = '-3px';
	 });
 }
}

window.tilda_zero_forms_js_ver = 1;

// Polyfill: Element.prototype.matches
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
