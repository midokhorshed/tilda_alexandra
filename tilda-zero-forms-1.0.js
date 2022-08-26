/**
 * В данном скрипте генерируется форма, которая в последствии добавляется в .tn-atom зеро-блока.
 * Элементы генерируются при помощи document.createElement.
 * Форма, которая находится за пределами видимости, или внутри скрытого зеро-блока, не рендерится.
 * Зеро-форма используется некоторые скрипты и стили из других библиотек Тильды, например,
 * телефонная маска, скрипт калькуляции, и тд.
 *
 * Все сгенерированные скрипты и стили добавляются вниз тега <body>.
 *
 * Строки формируются в функции t_zeroForms__parseIntoElement, при помощи условий внутри
 * конструкции switch...case, где при итерации объекта проверяется определенное условие и если оно
 * true, создаётся HTML-элементы, сопутствующие к нему стили и скрипты (если они нужны).
 */

/**
 * Main property of this object - is li_type.
 * It's meat what type of form element user use:
 * 'em' - email
 * 'ph' - phone
 * 'nm' - name
 * 'in' - input (one line input field)
 * 'ta' - textarea
 * 'sb' - select box (dropdown)
 * 'rd' - radio (question with answers)
 * 'ri' - radio image (question with img answers)
 * 'cb' - checkbox
 * 'uw' - upload widget (file)
 * 'uc' - uploadcare plugin (file)
 * 'da' - date
 * 'tm' - time
 * 'qn' - plus/minus btn (quantity)
 * 'rg' - range slider (quantity)
 * 'ur' - website url
 * 'tx' - text comment
 * 'ws' - white space
 * 'hd' - hidden
 * 'fr' - formula (calculation field)
 *
 * li_ph - placeholder value
 * li_name and li_nm in many types of elements contains same value - variable name
 * lid - id of current element
 * ls - index of current element * 10 (10, 20, 30, etc.)
 * loff - field is switched off, or not
 *
 * li_rule used in one line input field
 * li_rows used only in textarea and white space
 * li_value used in quantity (range, plus/minus btn) and hidden input
 *
 * properties for selects:
 * li_defselitem - default selected item
 * li_variants - list of options
 * li_selfirstvar - selected first option
 *
 * properties for 'question with img answers':
 * li_gallery - objects with img url, alts
 * li_imgratio - image ratio
 * in this type element value of 'li_name' can be different with 'li_nm'
 *
 * properties for 'checkbox':
 * li_checked - is checkbox checked by default
 *
 * properties for 'upload widget':
 * li_multiupl - can upload more than one file
 * li_uwkey - uplad widget public key
 *
 * properties for 'uploadcare':
 * li_inp - local lang
 * li_uckey - upladcare public key
 *
 * properties for 'date':
 * li_dateUnavailFr - unavailable Friday
 * li_dateUnavailFuture - unavailable Future
 * li_dateUnavailMo - unavailable Monday
 * li_dateUnavailPast - unavailable Past
 * li_dateUnavailSa - unavailable Saturday
 * li_dateUnavailSu - unavailable Sunday
 * li_dateUnavailTh - unavailable Thursday
 * li_dateUnavailTu - unavailable Tuesday
 * li_dateUnavailWe - unavailable Wednesday
 * li_datediv - separator value
 * li_dateformat: "DD-MM-YYYY"
 * li_datemask: "99/99/9999"
 * in this type element value of 'li_name' can be different with 'li_nm'
 *
 * properties for 'range slider':
 * li_step
 * li_vmax - max value
 * li_vmin - min value
 *
 * property for 'text comment':
 * li_text - text value
 *
 * properties for 'calculation field':
 * li_expr - expression
 * li_postfix
 * li_prefix
 *
 * @typedef {
 *  {
 *  li_name: string | undefined,
 *  li_nm: string | undefined,
 *  li_ph: string | undefined,
 *  li_req: 'y' | undefined,
 *  li_title: string | undefined,
 *  li_subtitle: string | undefined,
 *  li_type: 'em' | 'ph' | 'nm' | 'in' | 'ta' | 'sb' | 'rd' | 'ri' | 'cb' | 'uw' | 'uc' | 'da' | 'tm' | 'qn' | 'rg' | 'ur' | 'tx'
 *   | 'ws' | 'hd' | 'fr', lid: string, loff: 'y' | '',
 *
 *  li_rule: string | undefined,
 *
 *  li_rows: string | undefined,
 *
 *  li_value: string | undefined,
 *
 *  li_defselitem: string | undefined,
 *  li_variants: string | undefined,
 *  li_selfirstvar: string | undefined,
 *
 *  li_gallery: string | undefined,
 *  li_imgratio: string | undefined,
 *
 *  li_checked: 'y' | undefined,
 *
 *  li_multiupl: string | undefined,
 *  li_uwkey: string | undefined,
 *
 *  li_inp: string | undefined,
 *  li_uckey: string | undefined,
 *
 *  li_dateUnavailFr: 'y' | undefined,
 *  li_dateUnavailFuture: 'y' | undefined,
 *  li_dateUnavailMo: 'y' | undefined,
 *  li_dateUnavailPast: 'y' | undefined,
 *  li_dateUnavailSa: 'y' | undefined,
 *  li_dateUnavailSu: 'y' | undefined,
 *  li_dateUnavailTh: 'y' | undefined,
 *  li_dateUnavailTu: 'y' | undefined,
 *  li_dateUnavailWe: 'y' | undefined,
 *  li_datediv: 'slash' | 'dot' | 'dash' | undefined,
 *  li_dateformat: 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD' | undefined,
 *  li_datemask: '99/99/9999' | '99.99.9999' | '99-99-9999' | '9999/99/99' | '9999.99.99' | '9999-99-99' | undefined,
 *
 *  li_step: string | undefined,
 *  li_vmax: string | undefined,
 *  li_vmin: string | undefined,
 *
 *  li_text: string | undefined,
 *
 *  li_expr: string | undefined,
 *  li_postfix: string | undefined,
 *  li_prefix: string | undefined,
 *
 *  li_mask: string | undefined,
 *  li_masktype: 'a' | 'b' | undefined,
 *  li_maskcountry: string | undefined,
 *
 *  li_radcb: 'cb' | 'rb' | undefined,
 *  li_label: string | undefined,
 *  li_addtocart: string | undefined,
 *  li_prod_title: string | undefined,
 *  li_prod_img: string | undefined,
 *  }
 * } FormObjectEl
 */

/**
 * In this object contains information about styles of current form,
 * and some information need to data transfer (name, success event, etc.)
 * @typedef {
 *   {
 *    inputpos: string | undefined,
 * 		inputfontfamily: string | undefined,
 * 		inputfontsize: string | undefined,
 * 		inputfontweight: string | undefined,
 * 		inputvariationweight: string | undefined,
 * 		inputcolor: string | undefined,
 * 		inputbgcolor: string | undefined,
 * 		inputbordercolor: string | undefined,
 * 		inputbordersize: string | undefined,
 * 		inputradius: string | undefined,
 * 		inputheight: string | undefined,
 * 		inputmargbottom: string | undefined,
 * 		inputmargright: string | undefined,
 * 		inputtitlefontsize: string | undefined,
 * 		inputtitlefontweight: string | undefined,
 * 		inputtitlevariationweight: string | undefined,
 * 		inputtitlecolor: string | undefined,
 * 		inputelscolor: string | undefined,
 * 		inputelsfontsize: string | undefined,
 * 		inputelsfontweight: string | undefined,
 * 		inputelsvariationweight: string | undefined,
 * 		inputtitlemargbottom: string | undefined,
 * 		inputsstyle: string | undefined,
 * 		inputsstyle2: string | undefined,
 * 		buttontitle: string | undefined,
 * 		buttonalign: string | undefined,
 * 		buttoncolor: string | undefined,
 * 		buttonbgcolor: string | undefined,
 * 		buttonbordercolor: string | undefined,
 * 		buttonbordersize: string | undefined,
 * 		buttonradius: string | undefined,
 * 		buttonmargtop: string | undefined,
 * 		buttonwidth: string | undefined,
 * 		buttonheight: string | undefined,
 * 		buttonshadowsize: string | undefined,
 * 		buttonshadowopacity: string | undefined,
 * 		buttonfontfamily: string | undefined,
 * 		buttonfontsize: string | undefined,
 * 		buttonfontweight: string | undefined,
 * 		buttonvariationweight: string | undefined,
 * 		buttonuppercase: string | undefined,
 * 		buttonbgcolorhover: string | undefined,
 * 		buttoncolorhover: string | undefined,
 * 		buttonbordercolorhover: string | undefined,
 * 		buttonshadowsizehover: string | undefined,
 * 		buttonshadowopacityhover: string | undefined,
 * 		buttonspeedhover: string | undefined,
 * 		formmsgsuccess: string | undefined,
 * 		formmsgurl: string | undefined,
 * 		formerrreq: string | undefined,
 * 		formerremail: string | undefined,
 * 		formerrphone: string | undefined,
 * 		formerrname: string | undefined,
 * 		formbottomtext: string | undefined,
 * 		formbottomcb: string | undefined,
 * 		formname: string | undefined,
 * 		receivers: string | undefined,
 * 		inputfrbgcolor: string | undefined,
 *   }
 * } formObj
 */

// prettier-ignore
window.t_zeroForms__browserLang = (window.navigator.userLanguage || window.navigator.language).toUpperCase().slice(0, 2);
window.t_zeroForms__isES6Support = typeof Symbol !== 'undefined';

//TODO t_onFuncLoad в зеро-редакторе
if (window.tildamode === 'zero' && typeof window.t_onFuncLoad === 'undefined') {
	window.t_onFuncLoad = function (funcName, okFunc) {
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
				setTimeout(checkFuncExist, 100);
			});
		}
	};
}

/**
 * Language override based on attribute
 */
t_zeroForms__onReady(function () {
	var allrecords = document.getElementById('allrecords');
	if (!allrecords) return;
	var projectLang = allrecords.getAttribute('data-tilda-project-lang');
	if (projectLang) window.t_zeroForms__browserLang = projectLang;
});

/**
 * get formObject and init zeroForm
 *
 * @param {number| string} recid - record ID
 * @param {string} elemid - element ID
 * @param {{FormObjectEl}} formObjectEls
 */
function t_zeroForms__init(recid, elemid, formObjectEls) {
	var rec = document.getElementById('rec' + recid);
	var zeroForm = rec ? rec.querySelector('.tn-elem[data-elem-id="' + elemid + '"]') : null;
	if (!zeroForm) return;
	var tildamode = t_zeroForms__getTildaMode();
	var checkFunction = tildamode === 'zero' ? 'elem__getFieldValue' : 't396_elem__getFieldValue';
	t_onFuncLoad(checkFunction, function () {
		t_zeroForms__renderForm(zeroForm, formObjectEls, recid, tildamode);
	});
	// set position after zero form rendered
	t_onFuncLoad('t396_elem__renderViewOneField', function () {
		t396_elem__renderViewOneField(zeroForm, 'left');
		t396_elem__renderViewOneField(zeroForm, 'top');
	});
}

/**
 *
 * @param {HTMLElement} zeroForm - current zero-block element (in our case - form)
 * @param {{FormObjectEl} | string} formObjectEls
 * @param {number | string} recid - record ID
 * @param {'edit' | 'preview' | 'published'} tildamode
 */
function t_zeroForms__renderForm(zeroForm, formObjectEls, recid, tildamode) {
	zeroForm = t_zeroForms__getEl(zeroForm);
	if (!recid && window.tildamode === 'published') {
		recid = zeroForm.closest('.r').id.replace('rec', '');
	}

	// if function inited from zero-block script, check typeof of formObjectEls, and update it, if it neseccary
	if (typeof formObjectEls === 'string') formObjectEls = JSON.parse(formObjectEls);

	var record = document.querySelector('.t-records');
	var isEditMode = record ? record.getAttribute('data-tilda-mode') === 'edit' : false;
	if (!isEditMode) isEditMode = window.tildamode !== 'published';
	if (zeroForm.classList.contains('zero-form-rendered') && !isEditMode) return;

	var rec = zeroForm.closest('.r');
	// prettier-ignore
	if (window.tildamode === 'published' && (t_zeroForms__isRecordHidden(rec) || t_zeroForms__isFormOutside(zeroForm))) return;

	if (!formObjectEls) {
		var textarea = zeroForm.querySelector('.tn-atom__inputs-textarea');
		formObjectEls = textarea && textarea.value ? JSON.parse(textarea.value) : {};
	}

	var arrayOfElements = t_zeroFormsFromObjToArray(formObjectEls);

	var zeroFormAtom = zeroForm.querySelector('.tn-atom');
	if (window.tildamode === 'zero' || window.tildamode === 'edit') {
		zeroFormAtom.innerHTML = '';
	} else if (zeroFormAtom.querySelector('.t-form')) return;

	var form = t_zeroForm__createForm(recid, tildamode, arrayOfElements, zeroForm);
	if (!form) return;
	zeroFormAtom.insertAdjacentElement('beforeend', form);

	var customElEvent = document.createEvent('Event');
	customElEvent.initEvent('render', true, true);
	zeroForm.dispatchEvent(customElEvent);
	zeroForm.classList.add('zero-form-rendered');
	t_zeroForms__initMaskAfterRender(zeroForm);
}

/**
 * mask inited after DOMContentLoaded, but hidden forms not render.
 * We should initing them again, when hidden forms will be rendered.
 *
 * @param {HTMLElement} form
 */
function t_zeroForms__initMaskAfterRender(form) {
	t_zeroForm__onRender(form, true, function () {
		var hasMask = form.querySelector('.js-tilda-mask');
		if (hasMask) {
			t_onFuncLoad('tildaForm_initMasks', function () {
				setTimeout(function () {
					var hasNotInitedMask = form.querySelector('.js-tilda-mask:not([data-tilda-mask-init="1"])');
					if (hasNotInitedMask) {
						tildaForm_initMasks();
					}
				}, 500);
			});
		}
	});
}

function t_zeroForm__createForm(recid, tildamode, arrayOfElements, zeroForm) {
	if (!tildamode) tildamode = window.tildamode || t_zeroForms__getTildaMode();
	var formObj = t_zeroForms__createFormObj(zeroForm);
	var isPublished = tildamode === 'published';
	var arrayOfElsWithoutHiddenFiels = arrayOfElements.filter(function (field) {
		return field.loff !== 'y' && field.li_type !== 'hd';
	});

	var form = document.createElement(isPublished ? 'form' : 'div');
	form.classList.add('t-form');
	form.classList.add('t-form_inputs-total_' + arrayOfElsWithoutHiddenFiels.length);
	// .t-form_bbonly class append, when in zero-editor set for form input style: only border-bottom
	if (formObj.inputsstyle) form.classList.add('t-form_bbonly');
	// append horizontal styles, if them sets to current form
	if (formObj.inputpos === 'h') form.classList.add('tn-form_horiz');

	// for published version set more data and values, then for editor, or preview
	if (isPublished) {
		//TODO duplicated id, if zeroblock contains more then one form
		form.id = 'form' + recid;
		form.name = 'form' + recid;
		form.role = 'form';
		form.action = 'https://forms.tildacdn.com/procces/';
		form.method = 'POST';
		form.classList.add('js-form-proccess');
		form.setAttribute('data-formactiontype', '2');
		form.setAttribute('data-inputbox', '.t-input-group');
		form.setAttribute('data-success-callback', 't396_onSuccess');
		form.setAttribute('data-success-popup', 'y');
		form.setAttribute('data-error-popup', 'y');
		if (formObj.formmsgurl) form.setAttribute('data-success-url', formObj.formmsgurl);
	}

	// append to form hidden inputs
	var formReceiversArr = formObj.receivers ? formObj.receivers.split(',') : [];
	formReceiversArr.forEach(function (receiverValue) {
		var hiddenInput = t_zeroForms__createHiddenField(receiverValue, 'formservices[]', 'js-formaction-services');
		form.insertAdjacentElement('beforeend', hiddenInput);
	});

	// append hidden input with form name value, if it exists
	if (formObj.formname) {
		var formNameInput = t_zeroForms__createHiddenField(formObj.formname, 'tildaspec-formname', '');
		form.insertAdjacentElement('beforeend', formNameInput);
	}

	// create success box
	var successBox = document.createElement('div');
	successBox.classList.add('js-successbox');
	successBox.classList.add('t-form__successbox');
	successBox.classList.add('t-text');
	successBox.classList.add('t-text_sm');
	successBox.style.display = 'none';
	successBox.textContent = formObj.formmsgsuccess;
	form.insertAdjacentElement('beforeend', successBox);

	var titleStyles = {
		color: formObj.inputtitlecolor || '',
		fontWeight: formObj.inputtitlefontweight || '',
		fontFamily: formObj.inputfontfamily || '',
		fontSize: formObj.inputtitlefontsize || '',
		paddingBottom: formObj.inputtitlemargbottom || '',
	};

	var inputsBlock = t_zeroForms__generateInputsBlock(recid, zeroForm, arrayOfElements, formObj, titleStyles);
	form.insertAdjacentElement('beforeend', inputsBlock);

	var formID = zeroForm.getAttribute('data-elem-id');

	if (formObj.formbottomtext) {
		var bottomText = document.createElement('div');
		bottomText.style.textAlign = formObj.buttonalign === 'center' ? 'center' : 'left';
		bottomText.style.color = titleStyles.color;
		bottomText.style.fontWeight = titleStyles.fontWeight;
		bottomText.style.fontFamily = titleStyles.fontFamily;
		if (formObj.formbottomcb) t_zeroForms__getBottomText(formID, formObj, recid, zeroForm);
		form.insertAdjacentElement('beforeend', bottomText);
	}

	form.insertAdjacentElement('beforeend', t_zeroForms__createErrorBox(formObj, 'bottom'));
	form.insertAdjacentElement('beforeend', t_zeroForms__createCommentField());

	t_zeroForms__createInputPlaceholderStyles(formID, formObj, recid, zeroForm);

	if (formObj.inputpos === 'h') {
		t_zeroForms__setScriptOrStyle('t-zero-form-h-styles', 'tilda-zero-form-horizontal.min.css', '', 'link', false);
	}

	var commonStyle = '.tn-atom .t-input-block {position: relative;}';
	t_zeroForms__setScriptOrStyle('t-zero-form-c-styles', '', commonStyle, 'style', zeroForm);

	if (formObj.inputsstyle2 === 'y') {
		t_zeroForm__onRender(zeroForm, false, function () {
			t_zeroForms__animateInputs(zeroForm, formObj, recid, formID);
		});
	}

	if (tildamode === 'preview' || tildamode === 'published') {
		t_onFuncLoad('tildaForm_initMasks', function () {
			tildaForm_initMasks();
		});
	}

	if (tildamode !== 'preview') {
		var multiLandingBlocks = document.querySelectorAll('[data-record-type="803"]');
		Array.prototype.forEach.call(multiLandingBlocks, function (multiLandingBlock) {
			var multiLandingID = multiLandingBlock.id.replace('rec', '');
			t_onFuncLoad('t803_init', function () {
				t803_init(multiLandingID);
			});
		});
	}

	return form;
}

function t_zeroForms__createCommentField() {
	var commentField = document.createElement('div');
	commentField.style.position = 'absolute';
	commentField.style.left = '-5000px';
	commentField.style.bottom = '0';
	commentField.style.display = 'none';

	var commentInput = document.createElement('input');
	commentInput.type = 'text';
	commentInput.name = 'form-spec-comments';
	commentInput.value = 'Its good';
	commentInput.classList.add('js-form-spec-comments');
	commentInput.tabIndex = -1;
	commentField.insertAdjacentElement('beforeend', commentInput);
	return commentField;
}

function t_zeroForms__generateInputsBlock(recid, zeroForm, arrayOfElements, formObj, titleStyles) {
	var formID = zeroForm.getAttribute('data-elem-id');
	var filteredArrayOfEls = arrayOfElements.filter(function (elementObj) {
		return elementObj.loff !== 'y' && elementObj.li_type; // remove from list hidden or switch off fields
	});

	var inputsBlock = document.createElement('div');
	inputsBlock.classList.add('t-form__inputsbox');

	filteredArrayOfEls.forEach(function (elementObj) {
		// prettier-ignore
		var parsedHTMLElement = t_zeroForms__parseIntoElement(recid, zeroForm, elementObj, formObj, titleStyles, formID);
		if (parsedHTMLElement) inputsBlock.insertAdjacentElement('beforeend', parsedHTMLElement);
	});

	inputsBlock.insertAdjacentElement('beforeend', t_zeroForms__createErrorBox(formObj, 'middle'));
	inputsBlock.insertAdjacentElement('beforeend', t_zeroForms__createFormButton(recid, zeroForm, formID, formObj));

	return inputsBlock;
}

/**
 * parse from into HTML
 *
 * @param {string} recid - record ID
 * @param {HTMLElement} zeroForm - current form
 * @param {FormObjectEl} elementObj - object item
 * @param {formObj} formObj
 * @param {object} titleStyles
 * @param {string} formID
 * @returns {HTMLElement | void}
 */
function t_zeroForms__parseIntoElement(recid, zeroForm, elementObj, formObj, titleStyles, formID) {
	var isHiddenInput = elementObj.li_type === 'hd';
	if (isHiddenInput) return t_zeroForms__createHiddenField(elementObj.li_value, elementObj.li_nm, '');

	var inputPosStyles = formObj.inputmargbottom ? 'margin-bottom:' + formObj.inputmargbottom + 'px;' : '';
	// prettier-ignore
	inputPosStyles += formObj.inputmargright && formObj.inputpos === 'h' ? 'padding-right:' + formObj.inputmargright + 'px;' : '';

	var inputGroup = document.createElement('div');
	inputGroup.classList.add('t-input-group');
	inputGroup.classList.add('t-input-group_' + elementObj.li_type);
	inputGroup.setAttribute('data-input-lid', elementObj.lid);
	if (inputPosStyles) inputGroup.style = inputPosStyles;

	// prettier-ignore
	var inputFontWeight = formObj.inputfontweight === 'variation' ? formObj.inputvariationweight : formObj.inputfontweight;
	// prettier-ignore
	var textFontWeight = formObj.inputelsfontweight === 'variation' ? formObj.inputelsvariationweight : formObj.inputelsfontweight;
	// prettier-ignore
	var titleFontWeight = formObj.inputtitlefontweight === 'variation' ? formObj.inputtitlevariationweight : formObj.inputtitlefontweight;

	if (elementObj.li_title) t_zeroForms__generateTitle(elementObj, titleStyles, inputGroup, titleFontWeight);
	if (elementObj.li_subtitle) t_zeroForms__generateSubtitle(elementObj, titleStyles, inputGroup);

	var inputStyles = t_zeroForms__initInputStyles(formObj, inputFontWeight);

	var labelStyles = {
		fontSize: formObj.inputelsfontsize || '',
		fontWeight: textFontWeight || '',
	};

	var inputPreferences = {
		name: elementObj.li_nm,
		placeholder: elementObj.li_ph || '',
		secondaryClassName: formObj.inputsstyle ? 't-input_bbonly' : '',
		require: elementObj.li_req === 'y',
		rule: elementObj.li_rule || '',
		mask: elementObj.li_mask || '',
	};

	var inputBlock = document.createElement('div');
	inputBlock.classList.add('t-input-block');
	var generatedField;

	switch (elementObj.li_type) {
		case 'em': // email
			generatedField = t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, 'email');
			break;
		case 'ph': // phone
			generatedField = t_zeroForms__createPhoneInput(recid, elementObj, inputStyles, inputPreferences);
			if (elementObj.li_masktype === 'a') {
				t_zeroForms__setScriptOrStyle('t-zero-phonemask', 'tilda-phone-mask-1.1.min.js', '', 'script', false);
				t_zeroForm__onRender(zeroForm, true, function () {
					t_onFuncLoad('t_form_phonemask_load', function () {
						var selector = '.js-phonemask-input[data-phonemask-lid="' + elementObj.lid + '"]';
						var currentPhoneInput = document.querySelector(selector);
						if (currentPhoneInput) t_form_phonemask_load(currentPhoneInput);
					});
				});
			}
			break;
		case 'nm': // name
			generatedField = t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, 'name');
			break;
		case 'in': // input (one line input field)
			generatedField = t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, 'oneline');
			break;
		case 'ta': // textarea
			generatedField = t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, 'textarea');
			break;
		case 'sb': // select box (dropdown)
			generatedField = t_zeroForms__createSelect(elementObj, inputStyles, inputPreferences);
			if ((formObj.inputsstyle && formObj.inputelscolor) || inputStyles.color) {
				var styles = document.createElement('style');
				var selector = t_zeroForms__createSelector(recid, formID, '.t-select__wrapper:after');
				var selectorWrapperColor = formObj.inputsstyle ? formObj.inputelscolor : inputStyles.color;
				styles.textContent = selector + '{border-top-color:' + selectorWrapperColor + ';}';
				generatedField.insertAdjacentElement('beforeend', styles);
			}
			break;
		case 'rd': // radio (question with answers)
			generatedField = t_zeroForms__createRadio(elementObj, formObj, inputPreferences, labelStyles);
			var inputType = elementObj.li_radcb === 'cb' ? 'checkbox' : 'radio';
			t_zeroForms__setIndicatorStyles(recid, formID, formObj.inputelscolor, inputType, generatedField);
			var fieldSetStyles = '.tn-atom__form fieldset {padding: 0; margin: 0; border: none;}';
			t_zeroForms__setScriptOrStyle('t-zero-form-fieldset-' + formID, '', fieldSetStyles, 'style', zeroForm);
			if (inputType === 'checkbox') {
				t_zeroForm__onRender(zeroForm, false, function () {
					var inputWrapper = zeroForm.querySelector('[data-input-lid="' + elementObj.lid + '"]');
					if (!inputWrapper) return;
					var checkboxList = Array.prototype.slice.call(inputWrapper.querySelectorAll('.t-checkbox'));
					checkboxList.forEach(function (checkbox) {
						checkbox.addEventListener('input', t_zeroForms__updateCheckboxesValues);
					});
				});
			}
			break;
		case 'ri': // radio image (question with img answers)
			generatedField = t_zeroForms__createRadioImage(elementObj, formObj, inputPreferences);
			t_zeroForms__setIndicatorStyles(recid, formID, formObj.inputelscolor, 'img-select', generatedField);
			t_zeroForms__setScriptOrStyle(
				't-zero-img-select-styles',
				'tilda-img-select-1.0.min.css',
				'',
				'link',
				false
			);
			t_zeroForms__setScriptOrStyle(
				't-zero-img-select-script',
				'tilda-img-select-1.0.min.js',
				'',
				'script',
				false
			);
			t_zeroForm__onRender(zeroForm, false, function () {
				t_onFuncLoad('t_input_imgselect_init', function () {
					t_input_imgselect_init(recid, elementObj.lid);
					if (recid) t_input_imgselect_invertColor(recid);
				});
			});
			break;
		case 'cb': // checkbox
			generatedField = t_zeroForms__createCheckbox(elementObj, labelStyles, formObj, inputPreferences);
			t_zeroForms__setIndicatorStyles(recid, formID, formObj.inputelscolor, 'checkbox', generatedField);
			break;
		case 'uw': // upload widget (file)
			generatedField = t_zeroForms__createUploadField(elementObj, inputPreferences, 'uw');
			if (window.tildamode === 'published') {
				t_zeroForm__onRender(zeroForm, true, function () {
					t_onFuncLoad('t_upwidget__init', function () {
						t_upwidget__init();
					});
				});
			}
			break;
		case 'uc': // uploadcare plugin (file)
			generatedField = t_zeroForms__createUploadField(elementObj, inputPreferences, 'uc');
			var scriptContent = 'UPLOADCARE_LOCALE ="' + elementObj.li_inp + '";';
			scriptContent += 'UPLOADCARE_TABS = "all";';
			t_zeroForms__setScriptOrStyle('t-zero-uploadcare-' + formID, '', scriptContent, 'script', false);
			break;
		case 'da': // date
			generatedField = t_zeroForms__createDateField(elementObj, inputPreferences, inputStyles, formObj);
			t_zeroForm__onRender(zeroForm, true, function () {
				t_onFuncLoad('t_datepicker_init', function () {
					t_datepicker_init(recid, elementObj.lid, formID);
				});
			});
			break;
		case 'tm': // time
			generatedField = t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, 'time');
			break;
		case 'qn': // plus/minus btn (quantity)
			// prettier-ignore
			generatedField = t_zeroForms__createQuantityField(elementObj, inputStyles, formObj.inputelscolor, inputPreferences);
			document.removeEventListener('click', t_zeroForms__initQuanityClickCount);
			document.addEventListener('click', t_zeroForms__initQuanityClickCount);
			break;
		case 'rg': // range slider (quantity)
			// prettier-ignore
			generatedField = t_zeroForms__createQuantityRange(elementObj, inputStyles, formObj.inputtitlecolor, inputPreferences);
			if (formObj.inputelscolor) {
				var rangeStyles = document.createElement('style');
				var rangeSelector = t_zeroForms__createSelector(recid, formID, '.t-range');
				var rangePostfix = ['::-webkit-slider-thumb', '::-moz-range-thumb', '::-ms-thumb'];
				rangePostfix.forEach(function (postfix) {
					rangeStyles.textContent += rangeSelector + postfix + '{background:' + formObj.inputelscolor + ';}';
				});
				generatedField.insertAdjacentElement('beforeend', rangeStyles);
			}
			t_zeroForm__onRender(zeroForm, false, function () {
				t_onFuncLoad('t_input_range_init', function () {
					// find recid in preview mode
					if (!recid) recid = zeroForm.closest('.r') ? zeroForm.closest('.r').id.replace('rec', '') : '';
					if (recid) {
						try {
							t_input_range_init(recid, elementObj.lid);
						} catch (err) {
							console.log(err);
						}
					}
				});
			});
			break;
		case 'ur': // website url
			generatedField = t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, 'url');
			break;
		case 'tx': // text comment
			generatedField = document.createElement('div');
			generatedField.classList.add('t-text');
			generatedField.setAttribute('field', 'li_text__' + elementObj.lid);
			generatedField.style.fontWeight = labelStyles.fontWeight;
			generatedField.style.fontSize = labelStyles.fontSize + 'px';
			generatedField.style.fontFamily = titleStyles.fontFamily;
			generatedField.style.color = titleStyles.color;
			generatedField.style.fontSize = labelStyles.fontSize + 'px';
			generatedField.innerHTML = elementObj.li_text;
			break;
		case 'ws': // white space
			generatedField = document.createElement('div');
			generatedField.innerHTML = '&nbsp';
			if (elementObj.li_rows) generatedField.style.height = elementObj.li_rows * 34 + 'px';
			break;
		case 'fr': // formula (calculation field)
			generatedField = t_zeroForms__createCalculation(elementObj, inputStyles, inputPreferences, titleStyles);
			if (formObj.inputfrbgcolor) {
				var calcStyles = document.createElement('style');
				var calcSelector = t_zeroForms__createSelector(recid, formID, '.t-input-group_fr');
				calcStyles.textContent =
					calcSelector + '{background-color:' + formObj.inputfrbgcolor + '; padding: 20px 30px 25px;}';
				generatedField.insertAdjacentElement('beforeend', calcStyles);
			}
			t_zeroForm__onRender(zeroForm, false, function () {
				t_onFuncLoad('tcalc__init', function () {
					tcalc__init(recid, elementObj.lid);
				});
			});
			break;
	}

	if (generatedField) inputBlock.appendChild(generatedField);

	var errorBox = document.createElement('div');
	errorBox.classList.add('t-input-error');
	inputBlock.insertAdjacentElement('beforeend', errorBox);

	inputGroup.insertAdjacentElement('beforeend', inputBlock);

	return inputGroup;
}

function t_zeroForms__generateSubtitle(elementObj, titleStyles, inputGroup) {
	var exceptTypes = ['rd', 'ri', 'uw', 'uc', 'fr', 'cb'];
	var isExceptType = exceptTypes.some(function (type) {
		return type === elementObj.li_type;
	});
	var text = document.createElement(elementObj.li_title || isExceptType ? 'div' : 'label');
	if (text.tagName === 'LABEL') text.style.display = 'block';
	if (text.tagName === 'LABEL') text.setAttribute('for', elementObj.li_type + '-' + elementObj.lid);
	text.classList.add('t-input-subtitle');
	text.classList.add('t-descr');
	text.classList.add('t-descr_xxs');
	text.classList.add('t-opacity_70');
	text.setAttribute('field', 'nullli_subtitle__' + elementObj.lid);
	text.style.color = titleStyles.color;
	text.style.fontFamily = titleStyles.fontFamily;
	text.style.paddingBottom = titleStyles.paddingBottom + 'px';
	text.textContent = elementObj.li_subtitle;
	inputGroup.insertAdjacentElement('beforeend', text);
}

function t_zeroForms__generateTitle(elementObj, titleStyles, inputGroup, titleFontWeight) {
	var exceptTypes = ['rd', 'ri', 'uw', 'uc', 'fr', 'cb'];
	var isExceptType = exceptTypes.some(function (type) {
		return type === elementObj.li_type;
	});
	var title = document.createElement(isExceptType ? 'div' : 'label');
	if (title.tagName === 'LABEL') title.style.display = 'block';
	if (title.tagName === 'LABEL') title.setAttribute('for', elementObj.li_type + '-' + elementObj.lid);
	title.classList.add('t-input-title');
	title.setAttribute('data-redactor-toolbar', 'no');
	title.setAttribute('field', 'nullli_title__' + elementObj.lid);
	title.style.color = titleStyles.color;
	title.style.fontFamily = titleStyles.fontFamily;
	title.style.fontSize = titleStyles.fontSize + 'px';
	title.style.paddingBottom = titleStyles.paddingBottom + 'px';
	title.style.fontWeight = titleFontWeight;
	title.textContent = elementObj.li_title;
	inputGroup.insertAdjacentElement('beforeend', title);
}

function t_zeroForms__createPhoneInput(recid, elementObj, inputStyles, inputPreferences) {
	var maskType = elementObj.li_masktype;
	var input = document.createElement('input');
	if (!elementObj.li_title && !elementObj.li_subtitle) {
		input.ariaLabel = 'phone';
	} else {
		input.id = elementObj.li_type + '-' + elementObj.lid;
	}
	t_zeroForms__appendMainSettingToField(input, inputPreferences, 'tel', '');
	if (maskType === 'a') {
		input.classList.add('js-phonemask-input');
	} else if (elementObj.li_mask) input.classList.add('js-tilda-mask');

	if (maskType === 'a') {
		var browserLangCode = window.t_zeroForms__browserLang === 'RU' ? '+7' : '+1';
		input.placeholder = browserLangCode + '(999)999-9999';
		input.setAttribute('data-phonemask-init', 'no');
		input.setAttribute('data-phonemask-id', recid);
		input.setAttribute('data-phonemask-lid', elementObj.lid);
		input.setAttribute('data-phonemask-maskcountry', elementObj.li_maskcountry);
		if (inputPreferences.secondaryClassName) input.classList.add(inputPreferences.secondaryClassName);
		if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
	} else {
		t_zeroForms__appendAttributes(input, inputPreferences);
		input.setAttribute('data-tilda-rule', 'phone');
		if (inputPreferences.mask) input.setAttribute('data-tilda-mask', inputPreferences.mask);
	}
	t_zeroForms__appendStylesToField(input, inputStyles);
	return input;
}

function t_zeroForms__createInput(elementObj, inputStyles, inputPreferences, type) {
	var input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
	if (!elementObj.li_title && !elementObj.li_subtitle) {
		input.ariaLabel = type;
	} else {
		input.id = elementObj.li_type + '-' + elementObj.lid;
	}
	t_zeroForms__appendMainSettingToField(input, inputPreferences, type === 'textarea' ? '' : 'text', '');
	var tildaRuleTypes = ['name', 'time', 'url', 'email'];
	var isTildaRuleType = tildaRuleTypes.some(function (tildaRuleType) {
		return tildaRuleType === type;
	});
	if (isTildaRuleType) input.setAttribute('data-tilda-rule', type);

	if (type === 'time') {
		input.setAttribute('data-tilda-mask', '99:99');
		input.classList.add('t-inputtime');
	}

	if (type === 'time' || (type === 'oneline' && elementObj.li_mask)) input.classList.add('js-tilda-mask');

	if (type === 'oneline') {
		if (inputPreferences.rule) input.setAttribute('data-tilda-rule', inputPreferences.rule);
		if (inputPreferences.mask) input.setAttribute('data-tilda-mask', inputPreferences.mask);
	}

	t_zeroForms__appendAttributes(input, inputPreferences);
	t_zeroForms__appendStylesToField(input, inputStyles);

	if (type === 'textarea') {
		if (!document.getElementById('zero-forms-textarea-styles')) {
			var styles = document.createElement('style');
			styles.id = 'zero-forms-textarea-styles';
			styles.textContent =
				'.t396__elem .t-input-group_ta textarea.t-input {padding-top:10px; vertical-align: unset; resize: none;}';
			document.head.insertAdjacentElement('beforeend', styles);
		}
		if (elementObj.li_rows > 1) input.style.height = elementObj.li_rows * 25 + 10 + 'px';
		input.rows = elementObj.li_rows || '3';
	}
	return input;
}

function t_zeroForms__createSelect(elementObj, inputStyles, inputPreferences) {
	var options = elementObj.li_variants.split('\n');
	var selectedOption = parseInt(elementObj.li_defselitem, 10);
	var inputWrapper = document.createElement('div');
	inputWrapper.classList.add('t-select__wrapper');
	if (inputPreferences.secondaryClassName) inputWrapper.classList.add('t-select__wrapper_bbonly');

	var input = document.createElement('select');
	input.id = elementObj.li_type + '-' + elementObj.lid;
	t_zeroForms__appendMainSettingToField(input, inputPreferences, '', 't-select');
	if (inputPreferences.secondaryClassName) input.classList.add('t-select_bbonly');
	if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
	t_zeroForms__appendStylesToField(input, inputStyles);

	if (elementObj.li_selfirstvar) {
		var firstOption = document.createElement('option');
		firstOption.textContent = elementObj.li_selfirstvar;
		input.insertAdjacentElement('beforeend', firstOption);
	}

	options.forEach(function (option, i) {
		var optionEl = document.createElement('option');
		optionEl.value = option;
		optionEl.textContent = option;
		if (selectedOption && selectedOption === i + 1) optionEl.selected = true;
		input.insertAdjacentElement('beforeend', optionEl);
	});

	inputWrapper.insertAdjacentElement('beforeend', input);
	return inputWrapper;
}

function t_zeroForms__createRadio(elementObj, formObj, inputPreferences, labelStyles) {
	var radioOptions = elementObj.li_variants.split('\n');
	var isCheckbox = elementObj.li_radcb === 'cb';
	var selectedOption = parseInt(elementObj.li_defselitem, 10);

	var fragment = document.createDocumentFragment();

	var wrapperClassName = (isCheckbox ? 't-checkboxes' : 't-radio') + '__wrapper';
	var wrapper = t_zeroForms__createWrapper(wrapperClassName);

	if (isCheckbox) {
		fragment.appendChild(t_zeroForms__createNameFieldForCheckbox(inputPreferences, wrapper, 'checkboxes'));
	}

	fragment.appendChild(wrapper);

	var inputType = isCheckbox ? 'checkbox' : 'radio';
	var fieldSet = document.createElement('fieldset');
	wrapper.insertAdjacentElement('beforeend', fieldSet);
	radioOptions.forEach(function (radioOption, i) {
		var label = t_zeroForms__createLabel(inputType, labelStyles, formObj);

		var input = document.createElement('input');
		input.type = inputType;
		input.value = radioOption;
		input.classList.add('t-' + inputType);
		if (!isCheckbox) input.classList.add('js-tilda-rule');
		if (!isCheckbox) input.name = inputPreferences.name;
		var inputDescription = elementObj.li_title || elementObj.li_subtitle;
		if (!isCheckbox && inputDescription) input.ariaLabel = inputDescription;
		if (selectedOption && selectedOption === i + 1) input.checked = true;
		if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
		label.insertAdjacentElement('beforeend', input);

		var indicator = t_zeroForms__createIndicator(inputType, formObj.inputelscolor, false);
		label.insertAdjacentElement('beforeend', indicator);

		var textValue = document.createElement('span');
		textValue.textContent = radioOption;
		label.insertAdjacentElement('beforeend', textValue);

		fieldSet.insertAdjacentElement('beforeend', label);
	});

	return fragment;
}

function t_zeroForms__createRadioImage(elementObj, formObj, inputPreferences) {
	var isCheckbox = elementObj.li_radcb === 'cb';
	var galleryOptions = elementObj.li_gallery ? JSON.parse(elementObj.li_gallery) : {};
	if (!galleryOptions.length) return;

	var arrayOfOptions = t_zeroFormsFromObjToArray(galleryOptions);
	var selectedOption = parseInt(elementObj.li_defselitem, 10);

	var fragment = document.createDocumentFragment();

	var wrapper = t_zeroForms__createWrapper('t-img-select__container');
	wrapper.setAttribute('data-check-bgcolor', formObj.inputelscolor || '#000');

	if (isCheckbox) {
		fragment.appendChild(t_zeroForms__createNameFieldForCheckbox(inputPreferences, wrapper, 'img-select'));
	}

	fragment.appendChild(wrapper);

	var inputType = isCheckbox ? 'checkbox' : 'radio';
	var ratio = elementObj.li_imgratio ? elementObj.li_imgratio.replace('_', '-') : '1-1';
	var imgRatioClass = 't-img-select__indicator_' + ratio;
	arrayOfOptions.forEach(function (imgOption, i) {
		var label = t_zeroForms__createLabel('img-select', '', false);

		var input = document.createElement('input');
		input.type = inputType;
		input.value = imgOption.alt || imgOption.img;
		input.classList.add('t-img-select');
		input.name = elementObj.li_nm;
		if (!isCheckbox) input.classList.add('js-tilda-rule');
		if (selectedOption && selectedOption === i + 1) input.checked = true;
		if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
		label.insertAdjacentElement('beforeend', input);

		var indicator = t_zeroForms__createIndicator('img-select', false, {ratio: imgRatioClass, img: imgOption.img});
		indicator.classList.add('t-bgimg');
		indicator.classList.add('t-img-select__indicator');
		indicator.classList.add(imgRatioClass);
		indicator.setAttribute('data-original', imgOption.img);
		indicator.style.backgroundImage = 'url("' + imgOption.img + '")';
		label.insertAdjacentElement('beforeend', indicator);

		if (imgOption.alt) {
			var textElement = document.createElement('div');
			textElement.classList.add('t-img-select__text');
			textElement.classList.add('t-text');
			textElement.classList.add('t-text_xs');
			textElement.textContent = imgOption.alt;
			if (formObj.inputtitlecolor) textElement.style.color = formObj.inputtitlecolor;
			label.insertAdjacentElement('beforeend', textElement);
		}

		wrapper.insertAdjacentElement('beforeend', label);
	});

	return fragment;
}

function t_zeroForms__createCheckbox(elementObj, labelStyles, formObj, inputPreferences) {
	var label = t_zeroForms__createLabel('checkbox', labelStyles, formObj);
	var input = document.createElement('input');
	t_zeroForms__appendMainSettingToField(input, inputPreferences, 'checkbox', 't-checkbox');
	input.value = 'yes';
	if (elementObj.li_checked) input.checked = true;
	if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
	label.insertAdjacentElement('beforeend', input);

	var indicator = t_zeroForms__createIndicator('checkbox', formObj.inputelscolor, false);
	label.insertAdjacentElement('beforeend', indicator);

	var labelText = document.createElement('span');
	labelText.classList.add('t-checkbox__labeltext');
	labelText.textContent = elementObj.li_label;
	label.insertAdjacentElement('beforeend', labelText);

	return label;
}

function t_zeroForms__createUploadField(elementObj, inputPreferences, type) {
	var isUpldWidget = type === 'uw';
	if (window.tildamode !== 'published') {
		var styles = 'color:#fff;background-color:#000; padding:10px 20px; display:inline-block; margin-bottom:10px;';
		var editorFileInput = document.createElement('div');
		editorFileInput.setAttribute('style', styles);
		var isNeedKey = isUpldWidget && elementObj.li_uwkey === '';
		editorFileInput.textContent = isNeedKey ? 'Please set the key' : 'Upload button will be here';
		return editorFileInput;
	}

	var selector = isUpldWidget ? 't-upwidget' : 't-uploadcare';
	var wrapper = t_zeroForms__createWrapper(selector);
	var wrapperStyles = isUpldWidget ? 'margin-bottom:5px;min-height:38px;' : 'margin-bottom:10px;';
	wrapper.setAttribute('style', wrapperStyles);

	var input = document.createElement('input');
	t_zeroForms__appendMainSettingToField(input, inputPreferences, 'hidden', '');
	input.role = isUpldWidget ? 'upwidget-uploader' : 'uploadcare-uploader';
	if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
	input.style.display = 'none';
	if (isUpldWidget) {
		input.setAttribute('data-tilda-upwidget-key', elementObj.li_uwkey || '');
		if (elementObj.li_multiupl === 'y') input.setAttribute('data-tilda-upwidget-multiple', '1');
	} else {
		input.setAttribute('data-public-key', elementObj.li_uckey || 'demopublickey');
	}

	wrapper.insertAdjacentElement('beforeend', input);

	var path = isUpldWidget ? 'tilda-upwidget-1.1.min.js' : 'uploadcare-3.x.min.js';
	t_zeroForms__setScriptOrStyle(selector + '-zero-form', path, '', 'script', false);

	return wrapper;
}

function t_zeroForms__createDateField(elementObj, inputPreferences, inputStyles, formObj) {
	var wrapper = t_zeroForms__createWrapper('t-datepicker__wrapper');
	var input = document.createElement('input');
	var datepickerRestrictions =
		(elementObj.li_dateUnavailPast ? 'past,' : '') +
		(elementObj.li_dateUnavailMo ? 'mo,' : '') +
		(elementObj.li_dateUnavailTu ? 'tu,' : '') +
		(elementObj.li_dateUnavailWe ? 'we,' : '') +
		(elementObj.li_dateUnavailTh ? 'th,' : '') +
		(elementObj.li_dateUnavailFr ? 'fr,' : '') +
		(elementObj.li_dateUnavailSa ? 'sa,' : '') +
		(elementObj.li_dateUnavailSu ? 'su,' : '') +
		(elementObj.li_dateUnavailFuture ? 'future' : '');
	t_zeroForms__appendMainSettingToField(input, inputPreferences, 'text', [
		't-input',
		't-datepicker',
		'js-tilda-mask',
	]);
	t_zeroForms__appendAttributes(input, inputPreferences);
	t_zeroForms__appendStylesToField(input, inputStyles);
	input.setAttribute('data-tilda-rule', 'date');
	input.setAttribute('data-tilda-dateformat', elementObj.li_dateformat);
	input.setAttribute('data-tilda-datediv', elementObj.li_datediv);
	input.setAttribute('data-tilda-mask', elementObj.li_datemask);
	input.setAttribute('data-tilda-dateunvailable', datepickerRestrictions);
	input.id = elementObj.li_type + '-' + elementObj.lid;
	wrapper.insertAdjacentElement('beforeend', input);

	var svgIconColor = formObj.inputsstyle ? formObj.inputelscolor : inputStyles.color;
	var svgIcon =
		'<svg class="t-datepicker__icon" fill="' +
		svgIconColor +
		'" xmlns="http://www.w3.org/2000/svg"' +
		' viewBox="0 0 69.5 76.2" style="width:25px;"><path d="M9.6 42.9H21V31.6H9.6v11.3zm3-8.3H18v5.3h-5.3v-5.3zm16.5' +
		' 8.3h11.3V31.6H29.1v11.3zm3-8.3h5.3v5.3h-5.3v-5.3zM48 42.9h11.3V31.6H48v11.3zm3-8.3h5.3v5.3H51v-5.3zM9.6' +
		' 62H21V50.6H9.6V62zm3-8.4H18V59h-5.3v-5.4zM29.1 62h11.3V50.6H29.1V62zm3-8.4h5.3V59h-5.3v-5.4zM48' +
		' 62h11.3V50.6H48V62zm3-8.4h5.3V59H51v-5.4z"></path><path d="M59.7 6.8V5.3c0-2.9-2.4-5.3-5.3-5.3s-5.3' +
		' 2.4-5.3 5.3v1.5H40V5.3C40 2.4 37.6 0 34.7 0s-5.3 2.4-5.3 5.3v1.5h-9.1V5.3C20.3 2.4 18 0 15 0c-2.9' +
		' 0-5.3 2.4-5.3 5.3v1.5H0v69.5h69.5V6.8h-9.8zm-7.6-1.5c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3v7.1c0 1.3-1' +
		' 2.3-2.3 2.3s-2.3-1-2.3-2.3V5.3zm-19.7 0c0-1.3 1-2.3 2.3-2.3S37 4 37 5.3v7.1c0' +
		' 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3V5.3zm-19.6 0C12.8 4 13.8 3 15 3c1.3 0 2.3 1 2.3' +
		' 2.3v7.1c0 1.3-1 2.3-2.3 2.3-1.3 0-2.3-1-2.3-2.3V5.3zm53.7 67.9H3V9.8h6.8v2.6c0 2.9 2.4 5.3 5.3' +
		' 5.3s5.3-2.4 5.3-5.3V9.8h9.1v2.6c0 2.9 2.4 5.3 5.3 5.3s5.3-2.4 5.3-5.3V9.8h9.1v2.6c0 2.9 2.4 5.3 5.3' +
		' 5.3s5.3-2.4 5.3-5.3V9.8h6.8l-.1 63.4z"></path></svg>';

	wrapper.insertAdjacentHTML('beforeend', svgIcon);

	t_zeroForms__setScriptOrStyle('t-zero-date-styles', 'tilda-date-picker-1.0.min.css', '', 'link', false);
	t_zeroForms__setScriptOrStyle('t-zero-date-script', 'tilda-date-picker-1.0.min.js', '', 'script', false);

	return wrapper;
}

function t_zeroForms__createQuantityField(elementObj, inputStyles, color, inputPreferences) {
	var wrapper = t_zeroForms__createWrapper('t-inputquantity__wrapper');
	var minusBtn = t_zeroForms__createQuanityBtn('minus', color);
	var plusBtn = t_zeroForms__createQuanityBtn('plus', color);
	var input = document.createElement('input');
	t_zeroForms__appendMainSettingToField(input, inputPreferences, 'text', ['t-input', 't-inputquantity']);
	t_zeroForms__appendAttributes(input, inputPreferences);
	t_zeroForms__appendStylesToField(input, inputStyles);
	input.value = elementObj.li_value;
	input.id = elementObj.li_type + '-' + elementObj.lid;
	input.setAttribute('data-tilda-rule', 'number');

	wrapper.insertAdjacentElement('beforeend', minusBtn);
	wrapper.insertAdjacentElement('beforeend', input);
	wrapper.insertAdjacentElement('beforeend', plusBtn);

	return wrapper;
}

function t_zeroForms__createQuanityBtn(type, color) {
	var btn = document.createElement('span');
	btn.classList.add('t-inputquantity__btn');
	btn.classList.add('t-inputquantity__btn-' + type);
	if (color) btn.style.color = color;
	btn.innerHTML = type === 'minus' ? '&ndash;' : '+';
	return btn;
}

function t_zeroForms__createQuantityRange(elementObj, inputStyles, color, inputPreferences) {
	var wrapper = t_zeroForms__createWrapper('t-range__wrapper');
	var input = document.createElement('input');
	t_zeroForms__appendMainSettingToField(input, inputPreferences, 'range', 't-range');
	if (color) input.setAttribute('data-range-color', color);
	input.min = elementObj.li_vmin || '0';
	input.max = elementObj.li_vmax || '10';
	input.step = elementObj.li_step || '1';
	input.value = elementObj.li_value;
	input.style.width = '100%';
	if (!elementObj.li_title && !elementObj.li_subtitle) {
		input.ariaLabel = 'range';
	} else {
		input.id = elementObj.li_type + '-' + elementObj.lid;
	}
	wrapper.insertAdjacentElement('beforeend', input);

	var textField = document.createElement('div');
	textField.classList.add('t-range__value-txt');
	textField.classList.add('t-descr');
	textField.classList.add('t-descr_xxs');
	textField.style.display = 'none';
	wrapper.insertAdjacentElement('beforeend', textField);

	var textWrapper = document.createElement('div');
	textWrapper.classList.add('t-range__interval-txt-wrapper');

	var minValueField = t_zeroForms__createRangeField('min', color, elementObj.li_vmin || '0');
	var maxValueField = t_zeroForms__createRangeField('max', color, elementObj.li_vmax || '10');
	textWrapper.insertAdjacentElement('beforeend', minValueField);
	textWrapper.insertAdjacentElement('beforeend', maxValueField);
	wrapper.insertAdjacentElement('beforeend', textWrapper);

	t_zeroForms__setScriptOrStyle('t-zero-range-script', 'tilda-range-1.0.min.js', '', 'script', false);
	t_zeroForms__setScriptOrStyle('t-zero-range-styles', 'tilda-range-1.0.min.css', '', 'link', false);

	return wrapper;
}

function t_zeroForms__createRangeField(type, color, value) {
	var textField = document.createElement('div');
	textField.classList.add('t-range__interval-txt');
	textField.classList.add('t-range__interval-txt_' + type);
	textField.classList.add('t-descr');
	textField.classList.add('t-descr_xxs');
	if (color) textField.style.color = color;
	textField.textContent = value;
	return textField;
}

function t_zeroForms__createCalculation(elementObj, inputStyles, inputPreferences, titleStyles) {
	var fragment = document.createDocumentFragment();

	var hiddenInput = document.createElement('input');
	t_zeroForms__appendMainSettingToField(hiddenInput, inputPreferences, 'hidden', 't-calc__hiddeninput');
	hiddenInput.tabIndex = -1;
	hiddenInput.value = '0';
	fragment.appendChild(hiddenInput);

	var wrapper = t_zeroForms__createWrapper(['t-calc__wrapper', 't-name', 't-name_md']);
	wrapper.style.color = titleStyles.color;
	wrapper.style.fontFamily = titleStyles.fontFamily;
	wrapper.style.fontSize = titleStyles.fontSize + 'px';
	wrapper.style.fontWeight = titleStyles.fontWeight;

	t_zeroForms__createCalcTextField(elementObj.li_prefix, 'prefix', wrapper);

	var valueField = document.createElement('span');
	valueField.classList.add('t-calc');
	valueField.setAttribute('data-calc-expr', t_zeroForms__escape(elementObj.li_expr));
	valueField.textContent = '0';
	wrapper.insertAdjacentElement('beforeend', valueField);

	t_zeroForms__createCalcTextField(elementObj.li_postfix, 'postfix', wrapper);
	t_zeroForms__setScriptOrStyle('t-zero-calc', 'tilda-calc-1.0.min.js', '', 'script', false);

	fragment.appendChild(wrapper);

	if (elementObj.li_addtocart !== 'y') return fragment;

	if (elementObj.li_prod_title) {
		// prettier-ignore
		var titleInput = t_zeroForms__createHiddenField(elementObj.li_prod_title, 'prod_title', 't-calc__hidden__prod_title');
		wrapper.insertAdjacentElement('beforeend', titleInput);
	}
	if (elementObj.li_prod_img) {
		// prettier-ignore
		var productIMG = t_zeroForms__createHiddenField(elementObj.li_prod_img, 'prod_img', 't-calc__hidden__prod_img');
		wrapper.insertAdjacentElement('beforeend', productIMG);
	}
	return fragment;
}

function t_zeroForms__createCalcTextField(value, type, wrapper) {
	if (!value) return;
	var postfix = document.createElement('span');
	postfix.classList.add('t-calc__' + type + '-text');
	postfix.textContent = value;
	wrapper.insertAdjacentElement('beforeend', postfix);
}

/**
 * create submit button for current form
 *
 * @param {string} recid - record ID
 * @param {HTMLElement} zeroForm - current zeroForm
 * @param {string} formID - form ID
 * @param {formObj} formObj - obj with params
 * @returns {HTMLElement}
 */
function t_zeroForms__createFormButton(recid, zeroForm, formID, formObj) {
	// prettier-ignore
	var btnFontWeight = formObj.buttonfontweight === 'variation' ? formObj.buttonvariationweight : formObj.buttonfontweight;
	var btnWrapper = document.createElement('div');
	btnWrapper.classList.add('tn-form__submit');
	btnWrapper.style.textAlign = formObj.buttonalign;
	btnWrapper.style.marginTop = formObj.buttonmargtop;

	var btn = document.createElement('button');
	btn.type = 'submit';
	btn.classList.add('t-submit');
	btn.style.width = formObj.buttonwidth ? formObj.buttonwidth + 'px' : '100%';
	if (btnFontWeight) btn.style.fontWeight = btnFontWeight;
	if (formObj.buttonheight) btn.style.height = formObj.buttonheight + 'px';
	if (formObj.buttonalign === 'center') {
		btn.style.marginLeft = 'auto';
		btn.style.marginRight = 'auto';
	}
	btn.style.padding = '0 15px';
	btn.style.display = 'block';
	btn.textContent = formObj.buttontitle;

	if (formObj.buttonshadowsize || formObj.buttonshadowopacity) {
		btn.style.boxShadow =
			'0px 0px ' +
			(formObj.buttonshadowsize ? formObj.buttonshadowsize + 'px' : '10px') +
			' 0px rgba(0, 0, 0, ' +
			(formObj.buttonshadowopacity ? formObj.buttonshadowopacity / 100 : '0.3') +
			')';
	}

	btnWrapper.insertAdjacentElement('beforeend', btn);

	t_zeroForm__onRender(zeroForm, false, function () {
		var btnFontFamily = window.getComputedStyle(btn).fontFamily;
		var buttonStyles = t_zeroForms__generateButtonStyles(formObj, btnFontFamily);
		var hasUploadCare = document.getElementById('t-uploadcare-zero-form');
		var hasUploadWidget = document.getElementById('t-upwidget-zero-form');
		var baseSelector = t_zeroForms__createSelector(recid, formID, '');
		if (window.tildamode !== 'published') baseSelector = '[data-elem-id="' + formID + '"] ';

		var selector = baseSelector + '.t-submit';
		if (hasUploadCare) {
			selector += ', ';
			selector += baseSelector + '.uploadcare--widget__button.uploadcare--widget__button_type_open';
		}
		if (hasUploadWidget) {
			selector += ', ';
			selector += baseSelector + '.t-upwidget-container__button';
		}
		var styleValue = selector + '{' + buttonStyles + '}';
		t_zeroForms__setScriptOrStyle('t-zero-form-btn-styles-' + formID, '', styleValue, 'style', zeroForm);
	});

	return btnWrapper;
}

/**
 * create styles in string for submit and upload buttons
 * in t_zeroForms__createFormButton()
 *
 * @param {formObj} formObj
 * @param {string} btnFontFamily
 * @returns {string}
 */
function t_zeroForms__generateButtonStyles(formObj, btnFontFamily) {
	var buttonStyles = {
		color: formObj.buttoncolor || '',
		// prettier-ignore
		'border': formObj.buttonbordersize ? formObj.inputbordersize + 'px solid ' + formObj.buttonbordercolor || 'transparent' : '',
		'background-color': formObj.buttonbgcolor || 'transparent',
		'border-radius': formObj.buttonradius || '0',
		'font-size': formObj.buttonfontsize || '',
		'font-family': formObj.buttonfontfamily || btnFontFamily,
		cursor: 'pointer',
	};
	var stylesString = '';
	var pxValues = ['font-size', 'height', 'border-radius'];
	for (var k in buttonStyles) {
		if (buttonStyles[k]) {
			var isPxContains = pxValues.some(function (key) {
				return key === k.toString();
			});
			if (isPxContains) buttonStyles[k] += 'px';
			stylesString += k + ':' + buttonStyles[k] + ';';
		}
	}
	return stylesString;
}

/**
 * create error box
 *
 * @param {formObj} formObj - obj
 * @param {'bottom' | 'middle'} direction
 * @returns {HTMLElement}
 */
function t_zeroForms__createErrorBox(formObj, direction) {
	var errorBox = document.createElement('div');
	errorBox.classList.add('t-form__errorbox-' + direction);

	var wrapper = document.createElement('div');
	wrapper.classList.add('js-errorbox-all');
	wrapper.classList.add('t-form__errorbox-wrapper');
	wrapper.style.display = 'none';
	errorBox.insertAdjacentElement('beforeend', wrapper);

	var textWrapper = document.createElement('div');
	textWrapper.classList.add('t-form__errorbox-text');
	textWrapper.classList.add('t-text_xs');
	textWrapper.classList.add('t-text');

	var fields = ['all', 'req', 'email', 'name', 'phone', 'string'];
	fields.forEach(function (field) {
		var text = document.createElement('p');
		text.classList.add('t-form__errorbox-item');
		text.classList.add('js-rule-error');
		text.classList.add('js-rule-error-' + field);
		if (field !== 'all' && field !== 'string') text.textContent = formObj['formerr' + field];
		textWrapper.insertAdjacentElement('beforeend', text);
	});

	wrapper.insertAdjacentElement('beforeend', textWrapper);

	var errorBoxCloseBtn = document.createElement('div');
	errorBoxCloseBtn.classList.add('tn-form__errorbox-close');
	errorBoxCloseBtn.classList.add('js-errorbox-close');
	errorBoxCloseBtn.insertAdjacentElement('beforeend', t_zeroForms__createErrorBoxBtn('left'));
	errorBoxCloseBtn.insertAdjacentElement('beforeend', t_zeroForms__createErrorBoxBtn('right'));
	wrapper.insertAdjacentElement('beforeend', errorBoxCloseBtn);

	document.removeEventListener('click', t_zeroForms__initErrorBoxClose);
	document.addEventListener('click', t_zeroForms__initErrorBoxClose);
	t_zeroForms__setScriptOrStyle('t-zero-form-errorbox-styles', 'tilda-zero-form-errorbox.min.css', '', 'link', false);

	return errorBox;
}

/**
 * @param {'left' | 'right'} position
 * @returns {HTMLDivElement}
 */
function t_zeroForms__createErrorBoxBtn(position) {
	var errorBoxEl = document.createElement('div');
	errorBoxEl.classList.add('tn-form__errorbox-close-line');
	errorBoxEl.classList.add('tn-form__errorbox-close-line-' + position);
	return errorBoxEl;
}

/**
 *
 * @param {string} formID - current formID
 * @param {formObj} formObj - object with params
 * @param {string} recid - record ID
 * @param {HTMLElement} zeroForm
 * @returns {HTMLElement} - bottom text as HTMLElement
 */
function t_zeroForms__getBottomText(formID, formObj, recid, zeroForm) {
	var checkboxList = ['cb', 'cbx'];
	var isCheckbox = checkboxList.some(function (cb) {
		return formObj.formbottomcb === cb;
	});
	if (!isCheckbox) {
		var span = document.createElement('span');
		span.textContent = formObj.formbottomcb;
		return span;
	} else {
		var label = t_zeroForms__createLabel('checkbox', '', false);
		label.classList.add('t-text');
		label.classList.add('t-text_xxs');
		if (formObj.inputtitlecolor) label.style.color = formObj.inputtitlecolor;

		var input = document.createElement('input');
		var inputPreferences = {name: 'form_bottom_checkbox'};
		t_zeroForms__appendMainSettingToField(input, inputPreferences, 'checkbox', 't-checkbox');
		input.setAttribute('data-tilda-req', '1');
		if (formObj.formbottomcb === 'cbx') input.checked = true;
		label.insertAdjacentElement('beforeend', input);

		var indicator = t_zeroForms__createIndicator('checkbox', formObj.inputelscolor, false);
		indicator.style.width = '15px';
		indicator.style.height = '15px';
		indicator.style.marginRight = '5px';
		label.insertAdjacentElement('beforeend', indicator);

		var labelText = document.createElement('span');
		labelText.classList.add('t-checkbox__labeltext');
		labelText.textContent = formObj.formbottomtext;
		label.insertAdjacentElement('beforeend', labelText);

		var selector = t_zeroForms__createSelector(recid, formID, '.t-form__bottom-text .t-checkbox__indicator:after');
		var styles = formObj.inputelscolor ? 'color: ' + formObj.inputelscolor + ';' : '';
		styles += 'left:3px;top:0;height:6px;';
		t_zeroForms__setScriptOrStyle(
			't-zero-form-btn-styles-' + formID,
			'',
			selector + '{' + styles + '}',
			'style',
			zeroForm
		);

		return label;
	}
}

/**
 * animate inputs
 *
 * @param {HTMLElement} zeroForm - current form element
 * @param {formObj} formObj - object with params
 * @param {string} recid - record ID
 * @param {string} formID - form ID
 */
function t_zeroForms__animateInputs(zeroForm, formObj, recid, formID) {
	var mainSelector = t_zeroForms__createSelector(recid, formID, '');
	var styles =
		mainSelector +
		'.t-input-group:not(.t-input-group_da):not(.t-input-group_ph):not(.t-input-group_uw)' +
		':not(.t-input-group_ri):not(.t-input-group_cb):not(.t-input-group_rg) .t-input-block, .t-datepicker__wrapper';
	styles += '{position: relative; overflow: hidden;}';
	if (formObj.inputcolor) {
		styles += mainSelector + '.t-input__vis-ph';
		styles += '{color:' + formObj.inputcolor + ';}';
	}
	t_zeroForms__setScriptOrStyle('t-zero-form-anim-styles-' + formID, '', styles, 'style', zeroForm);

	var topOffset = (Number(formObj.inputheight) - Number(formObj.inputfontsize)) / 2;
	var fontWeight = formObj.inputfontweight === 'variation' ? formObj.inputvariationweight : formObj.inputfontweight;

	var selector =
		mainSelector + '.t-input:not(.t-inputquantity):not(.t-input-phonemask__wrap):not(.t-input-phonemask)';
	var inputList = Array.prototype.slice.call(document.querySelectorAll(selector));
	inputList.forEach(function (input) {
		input.classList.add('t-input_pvis');
		input.addEventListener('blur', function (e) {
			if (e.target.getAttribute('data-tilda-mask-init') === '1') {
				// setTimeout is need for correctly clear input value, after end of focus
				setTimeout(function () {
					e.target.value
						? e.target.classList.add('t-input_has-content')
						: e.target.classList.remove('t-input_has-content');
				});
			} else {
				e.target.value
					? e.target.classList.add('t-input_has-content')
					: e.target.classList.remove('t-input_has-content');
			}
		});

		var placeholder = input.getAttribute('placeholder');
		if (!placeholder) return;

		var animField = document.createElement('div');
		animField.classList.add('t-input__vis-ph');
		if (topOffset) animField.style.top = topOffset + 'px';
		if (fontWeight) animField.style.fontWeight = fontWeight;
		if (formObj.inputfontsize) {
			animField.style.fontSize = formObj.inputfontsize + 'px';
			// increase height for 1 px, to prevent cutting
			animField.style.height = parseInt(formObj.inputfontsize, 10) + 1 + 'px';
		}
		animField.textContent = placeholder;
		input.insertAdjacentElement('afterend', animField);
		input.removeAttribute('placeholder');
	});

	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		//BBOnly - border-bottom only (input style: only border-bottom)
		var textareaNotBBOnly = zeroForm.querySelectorAll('textarea:not(.t-input_bbonly)');
		var textareaBBOnly = zeroForm.querySelectorAll('textarea.t-input_bbonly');
		Array.prototype.forEach.call(textareaNotBBOnly, function (textarea) {
			textarea.style.paddingLeft = '17px';
		});
		Array.prototype.forEach.call(textareaBBOnly, function (textarea) {
			textarea.style.textIndent = '-3px';
		});
	}
}

/* ============= support functions for help create elements ============= */

function t_zeroForms__appendAttributes(input, inputPreferences) {
	if (inputPreferences.secondaryClassName) input.classList.add(inputPreferences.secondaryClassName);
	if (inputPreferences.placeholder) input.placeholder = inputPreferences.placeholder;
	if (inputPreferences.require) input.setAttribute('data-tilda-req', '1');
}

/**
 * set inputStyles params to input styles
 *
 * @param {HTMLInputElement | HTMLSelectElement} input
 * @param {Object} inputStyles
 */
function t_zeroForms__appendStylesToField(input, inputStyles) {
	for (var k in inputStyles) {
		input.style[k] = inputStyles[k];
	}
}

/**
 * set styles for indicator inside checkbox, radio or img-select
 *
 * @param {string} recid - record ID
 * @param {string} formID - current form ID
 * @param {string} color - color for current style
 * @param {'checkbox' | 'radio' | 'img-select'} type
 * @param field
 */
function t_zeroForms__setIndicatorStyles(recid, formID, color, type, field) {
	if (!color) return;
	var selector = '.t-' + type + '__indicator:after';
	var currentStyle = type === 'checkbox' ? 'border-color' : 'background-color';
	var styles = document.createElement('style');
	var mainSelector = t_zeroForms__createSelector(recid, formID, selector);
	styles.textContent = mainSelector + '{' + currentStyle + ':' + color + ';}';
	field.appendChild(styles);
}

/**
 * get input placeholder styles
 *
 * @param {string} formID - current form
 * @param {formObj} formObj
 * @param {string} recid - record ID
 * @param {HTMLElement} zeroForm
 * @returns {string}
 */
function t_zeroForms__createInputPlaceholderStyles(formID, formObj, recid, zeroForm) {
	var postfixList = [
		'::-webkit-input-placeholder',
		'::-moz-placeholder',
		':-moz-placeholder',
		':-ms-input-placeholder',
	];
	var elements = ['input', 'textarea'];
	var selector = t_zeroForms__createSelector(recid, formID, '');

	var styles = '';
	elements.forEach(function (element) {
		postfixList.forEach(function (postfix) {
			styles += selector + element + postfix + '{color:' + formObj.inputcolor + ';opacity:0.5;}';
		});
	});
	t_zeroForms__setScriptOrStyle('t-zero-placeholder-' + formID, '', styles, 'style', zeroForm);
}

/**
 * append style or script to body
 *
 * @param {string} id
 * @param {string} path
 * @param {string} content
 * @param {'script' | 'style' | 'link'} type
 * @param {HTMLElement | false} zeroForm
 */
function t_zeroForms__setScriptOrStyle(id, path, content, type, zeroForm) {
	if (document.getElementById(id)) return;
	var location = 'https://static.tildacdn.com';
	var element = document.createElement(type);
	if (content) {
		element.textContent = content;
	} else {
		if (type === 'script') {
			element.src = location + '/js/' + path;
			element.async = true;
			element.charset = 'utf-8';
		} else if (type === 'link') {
			element.href = location + '/css/' + path;
			element.rel = 'stylesheet';
		}
	}
	element.id = id;
	var atomEl = type === 'style' ? zeroForm.querySelector('.tn-atom') : null;
	var appendParent = type === 'style' && atomEl ? atomEl : document.body;
	appendParent.insertAdjacentElement('beforeend', element);
}

/**
 * create label for checkboxes, radio or img-select
 *
 * @param {'checkbox' | 'radio' | 'img-select'} type
 * @param {Object} labelStyles
 * @param {formObj | false} formObj
 * @returns {HTMLLabelElement}
 */
function t_zeroForms__createLabel(type, labelStyles, formObj) {
	var label = document.createElement('label');
	label.classList.add('t-' + type + '__control');
	if (labelStyles && labelStyles.fontSize) label.style.fontSize = labelStyles.fontSize + 'px';
	if (labelStyles) label.style.fontWeight = labelStyles.fontWeight;
	if (formObj && formObj.inputtitlecolor) label.style.color = formObj.inputtitlecolor;
	if (formObj && formObj.inputfontfamily) label.style.fontFamily = formObj.inputfontfamily;
	return label;
}

/**
 * create indicator for radio, checkbox and img-select fields
 *
 * @param {'checkbox' | 'radio' | 'img-select'} type
 * @param {string | undefined | false} colorStyle
 * @param {{ratio: string, img: string} | false} imgIndicatorOpts
 * @returns {HTMLDivElement}
 */
function t_zeroForms__createIndicator(type, colorStyle, imgIndicatorOpts) {
	var indicator = document.createElement('div');
	indicator.classList.add('t-' + type + '__indicator');
	if (colorStyle) indicator.style.borderColor = colorStyle;
	if (type === 'img-select') {
		indicator.classList.add('t-bgimg');
		indicator.classList.add(imgIndicatorOpts.ratio);
		indicator.setAttribute('data-original', imgIndicatorOpts.img);
		indicator.style.backgroundImage = imgIndicatorOpts.img;
	}
	return indicator;
}

/**
 * create hidden input to contain checked checkboxes values
 *
 * @param {Object} inputPreferences
 * @param {HTMLDivElement} wrapper
 * @param {'img-select' | 'checkboxes'} type
 * @returns {HTMLInputElement}
 */
function t_zeroForms__createNameFieldForCheckbox(inputPreferences, wrapper, type) {
	var hiddenInput = document.createElement('input');
	t_zeroForms__appendMainSettingToField(hiddenInput, inputPreferences, 'hidden', 't-' + type + '__hiddeninput');
	hiddenInput.tabIndex = -1;
	if (inputPreferences.require) hiddenInput.setAttribute('data-tilda-req', '1');
	return hiddenInput;
}

/**
 * create hidden input
 *
 * @param {string} value
 * @param {string} name
 * @param {string} fieldClass
 * @returns {HTMLInputElement}
 */
function t_zeroForms__createHiddenField(value, name, fieldClass) {
	var input = document.createElement('input');
	input.type = 'hidden';
	input.tabIndex = -1;
	if (value) input.value = value;
	if (name) input.name = name;
	if (fieldClass) input.classList.add(fieldClass);
	return input;
}

/**
 * create wrapper of input fields
 *
 * @param {string | Array} ListOfClasses
 * @returns {HTMLDivElement}
 */
function t_zeroForms__createWrapper(ListOfClasses) {
	var wrapper = document.createElement('div');
	if (typeof ListOfClasses === 'string') {
		wrapper.classList.add(ListOfClasses);
	} else {
		ListOfClasses.forEach(function (className) {
			wrapper.classList.add(className);
		});
	}
	return wrapper;
}

/**
 * set for input type, name, and className
 *
 * @param {HTMLInputElement | HTMLSelectElement} input
 * @param {Object} inputPreferences
 * @param {string} type
 * @param {Array | string} supportClassList
 */
function t_zeroForms__appendMainSettingToField(input, inputPreferences, type, supportClassList) {
	if (type && type !== 'select') input.type = type;
	input.name = inputPreferences.name || '';
	if (!supportClassList) input.classList.add('t-input');
	if (supportClassList) {
		if (typeof supportClassList === 'object') {
			supportClassList.forEach(function (className) {
				input.classList.add(className);
			});
		} else if (typeof supportClassList === 'string') {
			input.classList.add(supportClassList);
		}
	}
	input.classList.add('js-tilda-rule');
}

/**
 * create object with input styles, remove empty values and append px, if it necessary
 * @param {formObj} formObj
 * @param {string} inputFontWeight
 * @returns {{border: (string|string), backgroundColor: (string|string),
 * color: (string|string), borderRadius: (string|string),
 * fontSize: (string|string), fontWeight: string, height: (string|string)}}
 */
function t_zeroForms__initInputStyles(formObj, inputFontWeight) {
	var inputStyles = {
		color: formObj.inputcolor || '',
		// prettier-ignore
		border: formObj.inputbordersize ? formObj.inputbordersize + 'px solid ' + formObj.inputbordercolor || '#000' : '',
		backgroundColor: formObj.inputbgcolor || 'transparent',
		borderRadius: formObj.inputradius || '',
		fontSize: formObj.inputfontsize || '',
		fontWeight: inputFontWeight || '',
		height: formObj.inputheight || '',
	};

	var pxValues = ['fontSize', 'height', 'borderRadius'];
	for (var k in inputStyles) {
		if (!inputStyles[k]) {
			delete inputStyles[k];
		} else {
			var isPxContains = pxValues.some(function (key) {
				return key === k.toString();
			});
			if (isPxContains) inputStyles[k] += 'px';
		}
	}
	return inputStyles;
}

/* ============== support functions ============== */

/**
 * if zeroblock placed inside innactive tab, don't render it
 *
 * @param {HTMLElement} form
 * @returns {boolean}
 */
function t_zeroForms__isRecordHidden(form) {
	var classList = ['t397__off', 't395__off', 't400__off'];
	return classList.some(function (className) {
		return form.classList.contains(className);
	});
}

/**
 * if form placed outsize zeroblock, don't render it
 *
 * @param {HTMLElement} form
 * @returns {boolean}
 */
function t_zeroForms__isFormOutside(form) {
	var parent = form.closest('.r');
	if (!parent) return false;
	var parentPos = parent.getBoundingClientRect();
	var formPos = form.getBoundingClientRect();
	if (formPos.right < 0 || formPos.left > parentPos.right + window.pageXOffset) return true;
	return formPos.top > parentPos.bottom || formPos.bottom <= parentPos.top;
}

/**
 * get element, if in function provide jQuery el
 *
 * @param {jQuery | HTMLElement }el
 * @returns {HTMLElement}
 */
function t_zeroForms__getEl(el) {
	if (window.jQuery && el instanceof jQuery && el.length) return el.get(0);
	return el;
}

function t_zeroForms__createSelector(recid, formID, selector) {
	var style = window.tildamode === 'published' ? '#rec' + recid + ' ' : '';
	style += '[data-elem-id="' + formID + '"]';
	style += ' ' + selector;
	return style;
}

/**
 * remove single and double quotes from string
 *
 * @param {string} str - current string
 * @returns {string | void}
 */
function t_zeroForms__escape(str) {
	if (str) return str.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * transform parsed object with objects to array with objects to simplify work
 *
 * @param {Object} object
 * @returns {Array}
 */
function t_zeroFormsFromObjToArray(object) {
	var arrayOfOptions = window.t_zeroForms__isES6Support ? Object.values(object) : [];
	if (!window.t_zeroForms__isES6Support) {
		for (var k in object) {
			arrayOfOptions.push(object[k]);
		}
	}
	return arrayOfOptions;
}

/**
 * support function to update hidden input value,
 * after trigger checkboxes
 */
function t_zeroForms__updateCheckboxesValues() {
	var inputWrapper = this.closest('[data-input-lid]');
	var checkedCheckboxes = Array.prototype.slice.call(inputWrapper.querySelectorAll('.t-checkbox:checked'));
	var value = '';
	checkedCheckboxes.forEach(checkbox => {
		if (value) value += '; ';
		value += checkbox.value;
	});
	var hiddenInput = inputWrapper.querySelector('.t-checkboxes__hiddeninput');
	if (hiddenInput) hiddenInput.value = value;
}

/**
 * support function to update quanity count by click.
 * we should trigger input event to correct update calculation field
 *
 * @param e
 */
function t_zeroForms__initQuanityClickCount(e) {
	var quantityBtn = e.target.closest('.t-inputquantity__btn');
	if (!quantityBtn) return;
	var currentParent = quantityBtn.closest('[data-input-lid]');
	var currentInput = currentParent.querySelector('.t-inputquantity');
	var isMinusBtn = quantityBtn.closest('.t-inputquantity__btn-minus');
	var event = document.createEvent('Event');
	event.initEvent('input', true, true);
	if (isMinusBtn) {
		if (currentInput.value > 0) {
			currentInput.value = Number(currentInput.value) - 1;
			currentInput.dispatchEvent(event);
		}
	} else {
		if (currentInput.value >= 0) {
			currentInput.value = Number(currentInput.value) + 1;
			currentInput.dispatchEvent(event);
		}
	}
}

/**
 * support function to close errorbox
 *
 * @param e
 */
function t_zeroForms__initErrorBoxClose(e) {
	var closeBtn = e.target.closest('.js-errorbox-close');
	if (closeBtn) closeBtn.parentElement.style.display = 'none';
}

function t_zeroForms__onReady(func) {
	document.readyState !== 'loading' ? func() : document.addEventListener('DOMContentLoaded', func);
}

/**
 * run callback function after render zero-form
 *
 * @param {HTMLElement} form
 * @param {Boolean} modeChecked
 * @param {Function} callback
 */
function t_zeroForm__onRender(form, modeChecked, callback) {
	if ((window.tildamode === 'edit' || window.tildamode === 'zero') && modeChecked) return;
	t_zeroForms__onReady(function () {
		form.classList.contains('zero-form-rendered') ? callback() : form.addEventListener('render', callback);
	});
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
 *
 * @param zeroForm
 * @returns {formObj}
 */
function t_zeroForms__createFormObj(zeroForm) {
	var formObj = {};
	// prettier-ignore
	var fields = ['inputpos', 'inputfontfamily', 'inputfontsize', 'inputfontweight', 'inputvariationweight', 'inputcolor',
		'inputbgcolor', 'inputbordercolor', 'inputbordersize', 'inputradius', 'inputheight', 'inputmargbottom', 'inputmargright',
		'inputtitlefontsize', 'inputtitlefontweight', 'inputtitlevariationweight', 'inputtitlecolor', 'inputelscolor',
		'inputelsfontsize', 'inputelsfontweight', 'inputelsvariationweight', 'inputtitlemargbottom', 'inputsstyle', 'inputsstyle2',
		'buttontitle', 'buttonalign', 'buttoncolor', 'buttonbgcolor', 'buttonbordercolor', 'buttonbordersize', 'buttonradius',
		'buttonmargtop', 'buttonwidth', 'buttonheight', 'buttonshadowsize', 'buttonshadowopacity', 'buttonfontfamily', 'buttonfontsize',
		'buttonfontweight', 'buttonvariationweight', 'buttonuppercase', 'buttonbgcolorhover', 'buttoncolorhover', 'buttonbordercolorhover',
		'buttonshadowsizehover', 'buttonshadowopacityhover', 'buttonspeedhover', 'formmsgsuccess', 'formmsgurl', 'formerrreq', 'formerremail',
		'formerrphone', 'formerrname', 'formbottomtext', 'formbottomcb', 'formname', 'receivers'];

	// elem__getFieldValue() used in zero-editor, t396_elem__getFieldValue() - in published pages
	fields.forEach(function (field) {
		formObj[field] =
			window.tildamode === 'zero'
				? elem__getFieldValue($(zeroForm), field)
				: t396_elem__getFieldValue(zeroForm, field);
	});
	return formObj;
}

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