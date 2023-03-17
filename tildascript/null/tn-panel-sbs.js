function panelSBS__open(elem_id) {
	tn_console('func: panelSBS__open');

	var $el = $('#' + elem_id);
	var $rightBox = $('.tn-right-box');
	var $panel;
	var wire = '';

	window.tn_flag_sbs_panelopen = 'y';
	delete window.tn_flag_sbs_onstep;

	sbs__elem__reset($el);
	sbs__resetPlayKeyframesAll();

	$rightBox.removeClass('tn-right-box_hide');

	// prettier-ignore
	$rightBox.html(
		'<div class="tn-right-box__header">' +
		'<span class="tn-right-box__caption">Step-by-Step animation</span>' +
		'<img src="img/modalClosebutton.png" class="tn-right-box__icon" width="15px">' +
		'</div>');

	$('.tn-right-box__header').click(function () {
		tn_console('click: Minify panel');
		tn_toggleSettings(true);
	});

	$rightBox.append('<div class="tn-settings" data-for-elem-id="' + elem_id + '"></div>');

	$panel = $('.tn-settings');
	elem_id = $el.attr('data-elem-id');

	// prettier-ignore
	wire +=
		'<div class="sui-panel__section sui-panel__section-sbs-event">' +
		'<div class="sui-btn sui-btn-close">Back to main settings</div>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-control-field="sbsevent" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	if (window.tn.curResolution == window.tn.topResolution) {
		// prettier-ignore
		wire +=
			'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
			'<td class="sui-panel__td">' +
			'<div class="sui-form-group" data-control-field="sbstrg" data-control-value=""></div>' +
			'</td>' +
			'</tr>' +
			'</table>';
	}

	// prettier-ignore
	wire +=
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-control-field="sbstrgofst" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	// prettier-ignore
	wire +=
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-control-field="sbsloop" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-control="sbstest" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</div>' +
		'<div class="sui-panel__section sui-panel__section-sbs-trgels">' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-control-field="sbstrgels" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</div>' +
		'<div class="sui-panel__section sui-panel__section-sbs-opts">' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-control-field="sbsopts" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<p class="sui-form-group__hint sbsoptsempty">Selected elements have different steps, you can see and edit animation steps only on elements with the same steps</p>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</div>';

	// prettier-ignore
	wire +=
		'<div class="sui-panel__section sui-panel__section-sbs-prop" style="position:relative;">' +
		'<label class="sui-label" style="width:100%; padding-left:3px; padding-bottom:15px;">Properties for: step <span class="sui-sbs-label-step-index" style="font-weight:500;"></span></label>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="ti" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="di" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="mx" data-control-value=""></div>' +
		'</td>' +
		'<td class="sui-panel__td sui-panel__2col-space"></td>' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="my" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="sx" data-control-value=""></div>' +
		'</td>' +
		'<td class="sui-panel__td sui-panel__2col-space"></td>' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="sy" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="op" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="ro" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10" style="display:none;">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="bl" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="fi" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="ea" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="dt" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
		'<td class="sui-panel__td">' +
		'<div class="sui-form-group" data-sbs-prop-field="dd" data-control-value=""></div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</div>';

	// Btns copy paste
	if (parseInt(window.tn.curResolution, 10) === window.tn.topResolution) {
		wire += '' + sbs__copypaste__draw(elem_id);
	}

	$panel.append(wire);

	// Add Controls
	panelSBS__addControls(elem_id, false);

	tn_tooltip_update();

	control__drawUi__sbstest(elem_id);

	$panel.find('.sui-btn-close').click(function () {
		panelSBS__close($el);
	});

	$panel.find('.sui-btn-sbs-copy').click(function () {
		sbs__copy__sbsAnimation($(this).parents('.tn-settings').attr('data-for-elem-id'));

		if ($panel.find('.sui-btn-sbs-paste').hasClass('sui-btn_disabled')) {
			$panel.find('.sui-btn-sbs-paste').removeClass('sui-btn_disabled');
		}

		td__showBubbleNotice('Animation is copied', 3000);
	});

	$panel.find('.sui-btn-sbs-paste').click(function () {
		elem__removeBasicAnimation($el);
		sbs__paste__sbsAnimation();
		sbs__paste__sbsAnimationAttr(elem_id);
		td__showBubbleNotice('Animation is pasted', 3000);
	});

	$rightBox.animate({scrollTop: 0}, 100);

	tn_console_runtime('func: panelSBS__open');
}

function panelSBS__addControls(elem_id, isCopiedAnimation) {
	var $panel = $('.tn-settings');
	var res = window.tn.curResolution;
	var $el = $('#' + elem_id);
	var fields = $el.attr('data-fields');

	fields.split(',').forEach(function (field) {
		var value;
		var $cel;
		var value_for_res;
		var $settings = $('.tn-settings');

		if (
			field != 'sbsevent' &&
			field != 'sbstrg' &&
			field != 'sbstrgofst' &&
			field != 'sbsloop' &&
			field != 'sbsopts' &&
			field != 'sbstrgels'
		)
			return true;

		if (isCopiedAnimation) {
			value = JSON.parse(localStorage.getItem('tzerosbsanimation'))[field];
		} else {
			if (window.tn.multi_edit) {
				value = elem__getFieldValue($el, field) || window.tn.multi_edit_common_attrs[field];
			} else {
				value = elem__getFieldValue($el, field);
			}
		}

		$cel = $panel.find('[data-control-field=' + field + ']');

		if ($cel.length == 0) {
			$panel
				.find('.sui-panel__section-other')
				.append(
					'<div class="sui-form-group" data-control-field="' + field + '" data-control-value="' + value + '"></div>',
				);
			$cel = $panel.find('[data-control-field=' + field + ']');
		}

		if (window.tn.multi_edit && !value) value = elem__getFieldValue($el, field);
		$cel.attr('data-control-value', value);

		if (field === 'sbsevent' || field === 'sbstrg' || field === 'sbsloop') {
			control__drawUi__selectbox(elem_id, field, isCopiedAnimation);
		} else if (field === 'sbstrgofst') {
			control__drawUi__slider(elem_id, field, isCopiedAnimation);
		} else if (field === 'sbsopts') {
			if (!value && window.tn.multi_edit) {
				control__drawUi__updateVisibilityField([field], $settings, 'table', 'none');
				$('.sbsoptsempty').addClass('sbsoptsempty__active');
			} else {
				control__drawUi__steps(elem_id, field, isCopiedAnimation);
				control__drawUi__updateVisibilityField([field], $settings, 'table', 'table');
				$('.sbsoptsempty').removeClass('sbsoptsempty__active');
			}
		} else if (field === 'sbstrgels') {
			control__drawUi__trgels(elem_id, field, isCopiedAnimation);
		} else {
			control__drawUi__input(elem_id, field);
		}

		if (res != window.tn.topResolution) {
			$('[data-control-field="sbsevent"]').closest('.sui-panel__table').css('display', 'none');
			$('[data-control-field="sbsloop"]').closest('.sui-panel__table').css('display', 'none');

			value_for_res = elem__getFieldValue_for_Res($el, field, res);

			if (typeof value_for_res == 'undefined') {
				$cel.addClass('sui-form-group_undefined');
			}
		}

		if (isCopiedAnimation) {
			$el.attr('data-field-' + field + '-value', value);
		}
	});
}

function panelSBS__close($el, disableSelection) {
	tn_console('func: panelSBS__close');

	var isMultiSelect = window.tn.multi_edit;
	var selectedElems = window.tn.multi_edit ? window.tn.multi_edit_elems : $el;

	delete window.tn_flag_sbs_panelopen;

	$('.tn-right-box').html('');

	floor__mousedown();
	sbs__resetPlayKeyframesAll();

	if (isMultiSelect) {
		selectedElems.each(function () {
			var $currentElem = $(this);
			sbs__elem__exitonStepMode($currentElem);
			if (!disableSelection) elem__select__also($currentElem);
		});
	} else if ($el) {
		sbs__elem__exitonStepMode($el);
		if (!disableSelection) $el.trigger('click');
	}
}

function sbs__copy__sbsAnimation(elem_id) {
	var $el = $('#' + elem_id);
	var sbsAnimationObj = {};
	var fields = ['sbsevent', 'sbstrg', 'sbstrgofst', 'sbsloop', 'sbsopts', 'sbstrgels', 'animmobile'];

	fields.forEach(function (field) {
		sbsAnimationObj[field] =
			typeof elem__getFieldValue($el, field) !== 'undefined' ? elem__getFieldValue($el, field) : '';
	});

	window.tn.screens.forEach(function (s) {
		if (s == window.tn.topResolution) return; //continue (skip)
		sbsAnimationObj['sbsopts-res-' + s] =
			typeof elem__getFieldValue_for_Res($el, 'sbsopts', s) !== 'undefined'
				? elem__getFieldValue_for_Res($el, 'sbsopts', s)
				: '';
	});

	localStorage.setItem('tzerosbsanimation', JSON.stringify(sbsAnimationObj));
}

function sbs__paste__sbsAnimation() {
	var elemsIdArr = [];

	$('.tn-elem__selected').each(function () {
		elemsIdArr.push($(this).data('elem-id'));
	});

	elemsIdArr.forEach(function (itemId) {
		panelSBS__addControls(itemId, true);
	});
}

function sbs__paste__sbsAnimationAttr(elem_id) {
	var $el = $('#' + elem_id);
	var animationObj = JSON.parse(localStorage.getItem('tzerosbsanimation'));

	for (var field in animationObj) {
		$el.attr('data-field-' + field + '-value', animationObj[field]);

		if (field.indexOf('sbsopts-res') !== -1 && animationObj[field] === '') {
			$el.removeAttr('data-field-' + field + '-value');
		}
	}
}

function panelSBS__updateUi($el, field, step_i) {
	tn_console('func: panelSBS__updateUi');

	if (field == 'sbsopts') {
		control__drawUi__steps($el.attr('data-elem-id'), 'sbsopts', false);

		if (typeof step_i != 'undefined' && step_i >= 0) {
			$('.sui-sbs-steps-div')
				.find('.sui-sbs-step__' + step_i)
				.trigger('click');
		}
	}
}

function sbs__allelems__exitonStepMode() {
	tn_console('func: sbs__allelems__exitonStepMode');

	sbs__resetPlayKeyframesAll();

	$('.tn-elem__sbsmode').each(function () {
		sbs__elem__exitonStepMode($(this));
	});
}

function sbs__elem__exitonStepMode($el) {
	if (window.tn.multi_edit) {
		window.tn.multi_edit_elems.get().forEach(el => {
			el.classList.remove('tn-elem__sbsmode');
			el.removeAttribute('data-sbs-step-i');
			sbs__elem__reset($(el));
		});
	} else {
		$el.removeClass('tn-elem__sbsmode');
		$el.removeAttr('data-sbs-step-i');
		sbs__elem__reset($el);
	}

	delete window.tn_flag_sbs_onstep;

	setTimeout(function () {
		if ($('.tn-elem__selected').length && !window.tn_flag_elem_dragging) {
			tn_setOutlinePosition('selected');
			tn_showOutline('selected');
		}
	});
}

function control__drawUi__steps(elem_id, field, isCopiedAnimation) {
	var $el = $('#' + elem_id);
	var $c = $('[data-control-field=' + field + ']');
	var $panelSbsCopypaste = $('.sui-panel__section-sbs-copypaste');
	var $btnCopy = $('.sui-btn-sbs-copy');
	var value = $c.attr('data-control-value');
	var label = 'Steps';
	var str = '';
	var $inp;
	var obj;
	var sbsevent;

	str +=
		'<label class="sui-label">' +
		label +
		'</label>' +
		'<table>' +
		'<tr>' +
		'<div class="sui-input-div">' +
		'<textarea rows="10" name="' +
		field +
		'" class="sui-input" style="display:none;height:50px;font-size:11px;border:1px solid #ccc;margin-bottom:20px;">' +
		value +
		'</textarea>' +
		'</div>' +
		'<div class="sui-sbs-steps-div" style="margin-bottom:10px;margin-top:10px;"></div>' +
		'<div class="sui-sbs-steps-add">' +
		'<div class="sui-btn sui-btn-sbs-step-add">+ Add step</div>' +
		'</div>';

	$c.html(str);

	$inp = $('.tn-settings [name=' + field + ']');

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$c.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	$inp.keydown(function (e) {
		tn_console(e.which);
		window.tn_flag_settings_ui_focus = true;
	});

	$inp.change(function () {
		tn_console('panelsettings onchange input');

		var value;

		tn_undo__Add('elem_sbs', $el);
		value = $inp.val();

		$inp.closest('.sui-form-group').attr('data-control-value', value);
		elem__setFieldValue($el, field, value);
		$c.removeClass('sui-form-group_undefined');

		tn_set_lastChanges();
	});

	$c.find('.sui-btn-sbs-step-add').click(function (e) {
		sbs__step__add($el, $c);
		e.stopPropagation();
	});

	/**
	 * $('.sui-panel__section-sbs-opts').click(function() {
	 *	 alert('!');
	 * });
	 */

	// steps
	sbs__stepsbox__draw($el, $c, isCopiedAnimation);

	// select first
	$c.find('.sui-sbs-steps-div').find('.sui-sbs-step').first().trigger('click');

	obj = sbs__getStepsObj($el, isCopiedAnimation);

	if (obj.length == 0) {
		sbsevent = elem__getFieldValue($el, 'sbsevent');

		if (typeof sbsevent != 'undefined' && sbsevent != '') {
			sbs__step__add($el, $c, 'start', 'noundo');
		}
	}

	var sbsParams = ['sbsevent', 'sbsloop', 'sbsopts', 'sbstrg', 'sbstrgels', 'sbstrgofst'];
	var hasMixedAnimation = window.tn.multi_edit && sbsParams.some(param => control__drawUi__getMixedState(param));

	if (JSON.parse(localStorage.getItem('tzerosbsanimation')) === null) {
		if (obj.length <= 1) {
			$panelSbsCopypaste.css('display', 'none');
		} else {
			$panelSbsCopypaste.css('display', 'block');
			$('.sui-btn-sbs-paste').addClass('sui-btn_disabled');
			if (!window.tn.multi_edit || !hasMixedAnimation) $btnCopy.removeClass('sui-btn_disabled');
		}
	} else if (obj.length <= 1) {
		$btnCopy.addClass('sui-btn_disabled');
	} else {
		if (!window.tn.multi_edit || !hasMixedAnimation) $btnCopy.removeClass('sui-btn_disabled');
	}
}

function sbs__getStepsObj($el, isCopiedAnimation) {
	let value;
	if (isCopiedAnimation) {
		value = JSON.parse(localStorage.getItem('tzerosbsanimation'))['sbsopts'];
	} else {
		if (window.tn.multi_edit) {
			value = elem__getFieldValue($el, 'sbsopts') || window.tn.multi_edit_common_attrs['sbsopts'];
			if (!value) value = elem__getFieldValue($el, 'sbsopts');
		} else {
			value = elem__getFieldValue($el, 'sbsopts');
		}
	}
	return value ? JSON.parse(value.replaceAll("'", '"')) : [];
}

function sbs__setStepsObj($el, obj) {
	var value = JSON.stringify(obj);

	value = value.replaceAll('"', "'");

	if (value == '[]') value = '';

	elem__setFieldValue($el, 'sbsopts', value, '', 'updateui');

	if (window.tn.multi_edit) {
		for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
			$(window.tn.multi_edit_elems[i]).attr('data-field-sbsopts-value', value);
		}
	}
}

function sbs__convertStepsObj($el, event) {
	var obj = sbs__getStepsObj($el, false);

	for (var i = 0, l = obj.length; i < l; i++) {
		if (event == 'scroll') {
			if (typeof obj[i].di == 'undefined' && typeof obj[i].ti != 'undefined' && obj[i].ti >= 0) {
				obj[i].di = obj[i].ti;
				delete obj[i].ti;
			}

			if (typeof obj[i].ea != 'undefined') {
				delete obj[i].ea;
			}

			if (typeof obj[i].dt != 'undefined') {
				delete obj[i].dt;
			}
		} else {
			if (typeof obj[i].ti == 'undefined' && typeof obj[i].di != 'undefined' && obj[i].di >= 0) {
				obj[i].ti = obj[i].di;
				delete obj[i].di;
			}

			if (typeof obj[i].fi != 'undefined') {
				delete obj[i].fi;
			}

			if (typeof obj[i].dd != 'undefined') {
				delete obj[i].dd;
			}
		}
	}

	sbs__setStepsObj($el, obj);
}

function sbs__stepsbox__draw($el, $c, isCopiedAnimation) {
	var obj = sbs__getStepsObj($el, isCopiedAnimation);
	var str = '<table class="sui-sbs-steps-table"><tbody style="overflow:auto;">';

	obj.forEach(function (item, i) {
		str +=
			'<tr class="sui-sbs-step sui-sbs-step__' +
			i +
			'" data-sbs-step-i="' +
			i +
			'">' +
			'<td class="sui-sbs-step-td-name">' +
			(i == 0 ? 'Start' : 'Step ' + i) +
			'</td>' +
			'<td class="sui-sbs-step-td-time"><span style="opacity:0.3;" class="sui-sbs-step-time">';

		if (typeof item.ti != 'undefined' && item.ti >= 0) {
			str += item.ti / 1000 + 's';
		} else if (typeof item.di != 'undefined' && item.di >= 0) {
			str += item.di + 'px';
		}

		str += '</span></td>';

		if (i == 0) {
			str += '<td class="sui-sbs-step-td-del"></td>';
		} else {
			str += '<td class="sui-sbs-step-td-del sui-sbs-step-del">x</td>';
		}

		str += '</tr>';
	});

	str += '</tbody></table>';

	$c.find('.sui-sbs-steps-div').html(str);

	$c.find('.sui-sbs-step').click(function (e) {
		var $this = $(this);
		var step_i;
		var step_obj;

		$('.sui-sbs-step').removeClass('sui-sbs-step_active');
		$this.addClass('sui-sbs-step_active');
		step_i = $this.attr('data-sbs-step-i');

		if (step_i > 0) {
			if (window.tn.multi_edit) {
				window.tn.multi_edit_elems.get().forEach(el => {
					el.classList.add('tn-elem__sbsmode');
					el.setAttribute('data-sbs-step-i', step_i);
					$(el).resizable('disable');
				});
			} else {
				$el.addClass('tn-elem__sbsmode');
				$el.resizable('disable');
				$el.attr('data-sbs-step-i', step_i);
			}

			window.tn_flag_sbs_onstep = 'y';

			tn_hideOutline('selected');
		} else {
			var $selectedElems = window.tn.multi_edit ? window.tn.multi_edit_elems : $el;

			$selectedElems.each(function () {
				var $currentElem = $(this);
				sbs__elem__exitonStepMode($currentElem);
				$currentElem.attr('data-sbs-step-i', step_i);
			});
		}

		sbs__step__drawprops($el, $c, step_i);
		step_obj = sbs__step__getObj($el, step_i);
		sbs__step__render($el, step_obj, step_i);

		e.stopPropagation();
	});

	$c.find('.sui-sbs-step-del').click(function (e) {
		var step_i = $(this).parent().attr('data-sbs-step-i');
		sbs__step__del($el, $c, step_i);
		e.stopPropagation();
	});

	$c.find('.sui-sbs-steps-div tbody').sortable({
		helper: sbs__step__fixWidthHelper,
		opacity: 0.8,
		revert: false,
		tolerance: 'pointer',
		axis: 'y',
		items: 'tr:not(.sui-sbs-step__0)',
		start: function (e, ui) {
			ui.placeholder.height(ui.helper.outerHeight());
		},
		update: function () {
			sbs__step__reSort($el, $c);
		},
	});
}

function sbs__step__fixWidthHelper(e, ui) {
	ui.children().each(function () {
		$(this).width($(this).width());
	});

	return ui;
}

function sbs__step__reSort($el, $c) {
	var $step_act = $('.sui-sbs-steps-div .sui-sbs-step_active');
	var obj_new = [];
	var i = 0;
	var step_act_new_i = '';
	var step_act_i;
	var obj;

	if ($step_act.length) {
		step_act_i = $step_act.attr('data-sbs-step-i');
	}

	obj = sbs__getStepsObj($el, false);

	$('.sui-sbs-steps-div .sui-sbs-step').each(function () {
		var step_i = $(this).attr('data-sbs-step-i');

		obj_new.push(obj[step_i]);

		if (typeof step_act_i != 'undefined' && step_act_i == step_i) {
			step_act_new_i = i;
		}

		i++;
	});

	sbs__setStepsObj($el, obj_new);
	sbs__stepsbox__draw($el, $c, false);

	if (step_act_new_i != '') {
		$c.find('.sui-sbs-steps-div .sui-sbs-step[data-sbs-step-i=' + step_act_new_i + ']').trigger('click');
	}
}

function sbs__step__add($el, $c, flag_isstart, flag_noundo) {
	tn_console('func: sbs__step__add');

	var obj;
	var l;
	var sbsevent;
	var obj_step;
	var $panelCopypaste = $('.sui-panel__section-sbs-copypaste');

	if (flag_noundo != 'noundo') {
		tn_undo__Add('elem_sbs', $el);
	}

	obj = sbs__getStepsObj($el, false);
	l = obj.length;

	if (l === 0) {
		sbsevent = elem__getFieldValue($el, 'sbsevent');

		if (sbsevent == 'scroll') {
			obj_step = {
				'di': '0',
				'mx': '0',
				'my': '0',
				'sx': '1',
				'sy': '1',
				'op': '1',
				'ro': '0',
				'bl': '0',
				'fi': '',
				'dd': '0',
			};
		} else {
			obj_step = {
				'ti': '0',
				'mx': '0',
				'my': '0',
				'sx': '1',
				'sy': '1',
				'op': '1',
				'ro': '0',
				'bl': '0',
				'ea': '',
				'dt': '0',
			};
		}
	} else if (l === 1) {
		sbsevent = elem__getFieldValue($el, 'sbsevent');

		if (sbsevent == 'scroll') {
			obj_step = {
				'di': '100',
				'mx': '0',
				'my': '0',
				'sx': '1',
				'sy': '1',
				'op': '1',
				'ro': '0',
				'bl': '0',
				'fi': '',
				'dd': '0',
			};
		} else {
			obj_step = {
				'ti': '1000',
				'mx': '0',
				'my': '0',
				'sx': '1',
				'sy': '1',
				'op': '1',
				'ro': '0',
				'bl': '0',
				'ea': '',
				'dt': '0',
			};
		}
	} else {
		obj_step = obj[l - 1];
	}

	obj.push(obj_step);

	sbs__setStepsObj($el, obj);
	sbs__stepsbox__draw($el, $c, false);

	// select last
	$c.find('.sui-sbs-steps-div .sui-sbs-step').last().trigger('click');

	if (l > 0 && $panelCopypaste.css('display') === 'none') {
		$panelCopypaste.css('display', 'block');
	}

	if (l > 0) {
		$('.sui-btn-sbs-copy').removeClass('sui-btn_disabled');
	}
}

function sbs__step__del($el, $c, step_i) {
	tn_console('func: sbs__step__del');
	tn_undo__Add('elem_sbs', $el);

	var obj = sbs__getStepsObj($el, false);

	obj.splice(step_i, 1);
	sbs__setStepsObj($el, obj);
	sbs__stepsbox__draw($el, $c, false);

	// select closed
	if (step_i == 0) {
		$c.find('.sui-sbs-steps-div .sui-sbs-step').first().trigger('click');
	} else {
		$c.find('.sui-sbs-steps-div .sui-sbs-step[data-sbs-step-i=' + (step_i - 1) + ']').trigger('click');
	}

	if (obj.length === 0) {
		$('.tn-settings .sui-panel__section-sbs-prop').css('display', 'none');
	}

	if (obj.length <= 1) {
		if (JSON.parse(localStorage.getItem('tzerosbsanimation')) === null) {
			$('.sui-panel__section-sbs-copypaste').css('display', 'none');
		}
		$('.sui-btn-sbs-copy').addClass('sui-btn_disabled');
	}
}

function sbs__step__drawprops($el, $c, step_i) {
	var $c_props = $('.tn-settings .sui-panel__section-sbs-prop');
	var sbsevent;
	var fields;
	var value;
	var $cel;

	$c_props.css('display', 'block');

	step_i = parseInt(step_i, 10);

	if (step_i > 0) {
		$c_props.find('.sui-sbs-label-step-index').html(step_i);
	} else {
		$c_props.find('.sui-sbs-label-step-index').html('start');
	}

	sbsevent = elem__getFieldValue($el, 'sbsevent');

	if (sbsevent == 'scroll') {
		fields = ['di', 'mx', 'my', 'sx', 'sy', 'op', 'ro', 'bl', 'fi', 'dd'];
		$c_props.find('[data-sbs-prop-field=di]').closest('.sui-panel__table').css('display', 'table');
		$c_props.find('[data-sbs-prop-field=ti]').closest('.sui-panel__table').css('display', 'none');
		$c_props.find('[data-sbs-prop-field=fi]').closest('.sui-panel__table').css('display', 'table');
		$c_props.find('[data-sbs-prop-field=ea]').closest('.sui-panel__table').css('display', 'none');
		$c_props.find('[data-sbs-prop-field=dd]').closest('.sui-panel__table').css('display', 'table');
		$c_props.find('[data-sbs-prop-field=dt]').closest('.sui-panel__table').css('display', 'none');
	} else {
		fields = ['ti', 'mx', 'my', 'sx', 'sy', 'op', 'ro', 'bl', 'ea', 'dt'];
		$c_props.find('[data-sbs-prop-field=di]').closest('.sui-panel__table').css('display', 'none');
		$c_props.find('[data-sbs-prop-field=ti]').closest('.sui-panel__table').css('display', 'table');
		$c_props.find('[data-sbs-prop-field=fi]').closest('.sui-panel__table').css('display', 'none');
		$c_props.find('[data-sbs-prop-field=ea]').closest('.sui-panel__table').css('display', 'table');
		$c_props.find('[data-sbs-prop-field=dd]').closest('.sui-panel__table').css('display', 'none');
		$c_props.find('[data-sbs-prop-field=dt]').closest('.sui-panel__table').css('display', 'table');
	}

	for (var i = 0, l = fields.length; i < l; i++) {
		value = sbs__step__getFieldValue($el, step_i, fields[i]);

		$cel = $c_props.find('[data-sbs-prop-field=' + fields[i] + ']');
		$cel.attr('data-control-value', value);

		if (fields[i] == 'ea' || fields[i] == 'fi' || fields[i] == 'tror') {
			sbs__drawUi__selectbox($el, $c_props, step_i, fields[i]);
		} else {
			sbs__drawUi__slider($el, $c_props, step_i, fields[i]);
		}
	}

	if (step_i == 0) {
		$c_props.find('.sui-panel__table').css('visibility', 'hidden');

		if ($c_props.find('.sui-panel-sbs-hint-step0').length == 0) {
			$c_props.append(
				'<div class="sui-panel-sbs-hint-step0" style="position:absolute; width:255px; top:50px; left:20px;font-size:13px;opacity:0.55;">If you want to make the initial state of the element different from the default, add the first step, set its duration/distance to 0, and select options to be applied at the start of the animation. <br><br>E.g.: to fade the element from transparent to full opacity, add the first step, set its duration/distance to 0, and set the opacity to 0%</div>',
			);
		}
	} else {
		$c_props.find('.sui-panel-sbs-hint-step0').remove();
		$c_props.find('.sui-panel__table').css('visibility', 'visible');
	}
}

function sbs__step__getObj($el, step_i) {
	var obj = sbs__getStepsObj($el, false);
	var value;

	for (var i = 0, l = obj.length; i < l; i++) {
		if (i == step_i) {
			value = obj[i];
			return value;
		}
	}
}

function sbs__step__getFieldValue($el, step_i, field) {
	var obj = sbs__getStepsObj($el, false);
	var value;

	for (var i = 0, l = obj.length; i < l; i++) {
		if (i == step_i) {
			value = obj[i][field];
			return value;
		}
	}
}

function sbs__step__setFieldValue(el, step_i, field, value, flag_render, flag_updateui) {
	var obj = sbs__getStepsObj(el, false);
	var foo;

	for (var i = 0, l = obj.length; i < l; i++) {
		if (i == step_i) {
			obj[i][field] = value;
			sbs__setStepsObj(el, obj);

			if (flag_render == 'render') {
				sbs__step__render(el, obj[i], i);
			}

			if (flag_updateui == 'updateui') {
				foo = $('.sui-form-group[data-sbs-prop-field=' + field + '] .sui-sbs-opts-option-table');

				if (typeof foo != 'undefined') {
					foo.find('input').val(value).trigger('change');
				}
			}
		}
	}
}

function sbs__drawUi__slider($el, $c_props, step_i, field) {
	var $p = $c_props.find('[data-sbs-prop-field=' + field + ']');
	var value = $p.attr('data-control-value');
	var str = '';
	var value_show;
	var label;
	var max;
	var min;
	var step;
	var units;
	var $inp;
	var sx;

	value = parseFloat(value);
	// value = tn_calculateInputNumber(value);
	value_show = value;

	if (field == 'op') value_show = Math.round(value_show * 100);
	if (field == 'sx') value_show = Math.round(value_show * 100);
	if (field == 'sy') value_show = Math.round(value_show * 100);
	if (field == 'ti') value_show = value_show / 1000;
	if (field == 'dt') value_show = value_show / 1000;

	if (isNaN(value_show)) value_show = 0;

	label = field;

	if (field == 'ti') label = 'Duration';
	if (field == 'di') label = 'Distance';
	if (field == 'mx') label = 'Move X,Y';
	if (field == 'sx') label = 'Scale X,Y';
	if (field == 'op') label = 'Opacity';
	if (field == 'ro') label = 'Rotate';
	if (field == 'bl') label = 'Blur';
	if (field == 'dt') label = 'Delay';
	if (field == 'dd') label = 'Delay';

	if (field == 'ti') {
		min = 0;
		max = 5;
		step = 0.1;
		units = 's';
	}

	if (field == 'di') {
		min = 0;
		max = 1000;
		step = 10;
		units = 'px';
	}

	if (field == 'mx') {
		min = -500;
		max = 500;
		step = 10;
		units = 'px';
	}

	if (field == 'my') {
		min = -500;
		max = 500;
		step = 10;
		units = 'px';
	}

	if (field == 'sx') {
		min = 0;
		max = 200;
		step = 5;
		units = '%';
	}

	if (field == 'sy') {
		min = 0;
		max = 200;
		step = 5;
		units = '%';
	}

	if (field == 'op') {
		min = 0;
		max = 100;
		step = 5;
		units = '%';
	}

	if (field == 'ro') {
		min = -360;
		max = 360;
		step = 5;
		units = '&deg;';
	}

	if (field == 'bl') {
		min = 0;
		max = 20;
		step = 1;
		units = 'px';
	}

	if (field == 'dt') {
		min = 0;
		max = 5;
		step = 0.1;
		units = 's';
	}

	if (field == 'dd') {
		min = 0;
		max = 1000;
		step = 10;
		units = 'px';
	}

	str += '<table style="width:100%;" class="sui-sbs-opts-option-table"><tr>';

	if (field != 'my' && field != 'sy') {
		// prettier-ignore
		str +=
			'<td>' +
				'<label class="sui-label" style="">' + label + '</label>' +
			'</td>';
	}

	// prettier-ignore
	str +=
				'<td style="width:100%;min-width:65px;">' +
					'<div class="sui-input-slider-div">' +
						'<input type="text" value="' + value_show + '" name="' + field + '" class="sui-input">' +
					'</div>' +
					'<div class="sui-slider-relwrapper">' +
						'<div class="sui-slider-abswrapper">' +
							'<div class="sui-slider"></div>' +
						'</div>' +
					'</div>' +
				'</td>' +
				'<td style="width:10px;">' +
					'<label class="sui-label" style="margin-right:0;width:10px;text-transform:lowercase;">' + units + '</label>' +
				'</td>' +
			'</tr>' +
		'</table>';

	$p.html(str);

	$inp = $('.tn-settings [name=' + field + ']');

	$p.find('.sui-slider').slider({
		range: 'max',
		min: min,
		max: max,
		step: step,
		value: value_show,
		start: function () {
			tn_undo__Add('elem_sbs', $el);
			$p.removeClass('sui-form-group_undefined');
		},
		slide: function (event, ui) {
			var value = ui.value;
			var bar;
			var $foo;

			$inp.val(value);

			if (field == 'op' && value != 1 && value != 0) value = value / 100;
			if (field == 'sx' && value != 1 && value != 0) value = value / 100;
			if (field == 'sy' && value != 1 && value != 0) value = value / 100;
			if (field == 'ti' && value != 0) value = value * 1000;
			if (field == 'dt' && value != 0) value = value * 1000;

			$inp.closest('.sui-form-group').attr('data-control-value', value);

			sbs__step__setFieldValue($el, step_i, field, value, 'render');

			if (field == 'sx') {
				bar = Math.round(value * 100);
				$foo = $('.sui-form-group[data-sbs-prop-field=sy] .sui-sbs-opts-option-table');

				if (typeof $foo != 'undefined' && $foo.css('display') == 'none') {
					$foo.find('input').val(bar).trigger('change');
				}
			}

			if (field == 'ti') {
				$('.sui-sbs-step__' + step_i + ' .sui-sbs-step-time').html(value / 1000 + 's');
			}
			if (field == 'di') {
				$('.sui-sbs-step__' + step_i + ' .sui-sbs-step-time').html(value + 'px');
			}

			window.tn_flag_settings_ui_focus = false;
			tn_set_lastChanges();
		},
	});

	$('.sui-slider .ui-slider-handle').unbind('keydown');

	if (field == 'sy') {
		sx = sbs__step__getFieldValue($el, step_i, 'sx');

		if (sx == value) {
			$p.find('.sui-sbs-opts-option-table').css('display', 'none');
			$p.append(
				'<div class="sui-sbs-scaley-differ-label" style="font-size:10px; opacity:0.7;white-space:nowrap;">Differ X,Y</div>',
			);

			$p.find('.sui-sbs-scaley-differ-label').click(function () {
				$p.find('.sui-sbs-opts-option-table').css('display', 'block');
				$p.find('.sui-sbs-scaley-differ-label').remove();
			});
		} else {
			$p.find('.sui-sbs-opts-option-table').css('display', 'block');
			$p.find('.sui-sbs-scaley-differ-label').remove();
		}
	}

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$p.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	$inp.keydown(function (e) {
		var di;
		var de;
		var value;

		window.tn_flag_settings_ui_focus = true;

		if (field !== '') {
			if (e.which == 38 || e.which == 40) {
				di = e.which == 38 ? +1 : -1;
				de = 1;

				if (field == 'ti') de = 0.1;
				if (field == 'mx') de = 10;
				if (field == 'my') de = 10;
				if (field == 'op') de = 5;
				if (field == 'sx') de = 5;
				if (field == 'sy') de = 5;
				if (field == 'dt') de = 0.1;

				value = parseFloat($inp.val());
				value = value + de * di;
				value = Math.round(value * 100) / 100;

				if (field == 'ti') {
					if (value < 0) value = 0;
				}
				if (field == 'op') {
					if (value > 100) value = 100;
					if (value < 0) value = 0;
				}
				if (field == 'sx') {
					if (value < 0) value = 0;
				}
				if (field == 'sy') {
					if (value < 0) value = 0;
				}
				if (field == 'ro') {
					if (value > 1800) value = 0;
					if (value < -1800) value = -1800;
				}
				if (field == 'bl') {
					if (value < 0) value = 0;
				}
				if (field == 'dt') {
					if (value < 0) value = 0;
				}

				$inp.val(value);
				$inp.trigger('change');
			}
		}
		if (e.which == 13) {
			$(this).blur();
			window.tn_flag_settings_ui_focus = false;
		}
	});

	$inp.on('focus', function () {
		var input = this;
		if (input.focused) return;
		setTimeout(function () {
			input.select();
			input.focused = true;
		}, 100);
	});

	$inp.on('blur', function () {
		this.focused = false;
	});

	$inp.change(function () {
		var v = $(this).val();
		var vv = tn_calculateInputNumber(v);
		// var vv = parseFloat(v);
		var $foo;

		if (field == 'ti') {
			if (vv < 0) vv = 0;
		}
		if (field == 'di') {
			if (vv < 0) vv = 0;
		}
		if (field == 'op') {
			if (vv > 100) vv = 100;
			if (vv < 0) vv = 0;
		}
		if (field == 'sx') {
			if (vv < 0) vv = 0;
		}
		if (field == 'sy') {
			if (vv < 0) vv = 0;
		}
		if (field == 'ro') {
			if (vv > 1800) vv = 0;
			if (vv < -1800) vv = -1800;
		}
		if (field == 'bl') {
			if (vv < 0) vv = 0;
		}
		if (field == 'dt') {
			if (vv < 0) vv = 0;
		}
		if (field == 'dd') {
			if (vv < 0) vv = 0;
		}

		if (
			field == 'mx' ||
			field == 'my' ||
			field == 'bl' ||
			field == 'ti' ||
			field == 'di' ||
			field == 'rt' ||
			field == 'dt' ||
			field == 'dd' ||
			field == 'ro'
		) {
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'op') {
			vv = parseInt(vv);
			if (isNaN(vv)) vv = 100;
			$inp.val(vv);
		}
		if (field == 'sx' || field == 'sy') {
			vv = parseInt(vv);
			if (isNaN(vv)) vv = 100;
			$inp.val(vv);
		}

		v = vv;

		tn_undo__Add('elem_sbs', $el);

		$p.find('.sui-slider').slider('value', vv);

		if (field == 'op') v = v / 100;
		if (field == 'sx') v = v / 100;
		if (field == 'sy') v = v / 100;
		if (field == 'ti') v = v * 1000;
		if (field == 'dt') v = v * 1000;

		$(this).closest('.sui-form-group').attr('data-control-value', v);

		sbs__step__setFieldValue($el, step_i, field, v, 'render');

		if (field == 'sx') {
			$foo = $('.sui-form-group[data-sbs-prop-field=sy] .sui-sbs-opts-option-table');

			if (typeof $foo != 'undefined' && $foo.css('display') == 'none') {
				$foo
					.find('input')
					.val(v * 100)
					.trigger('change');
			}
		}

		if (field == 'ti') {
			$('.sui-sbs-step__' + step_i + ' .sui-sbs-step-time').html(v / 1000 + 's');
		}

		if (field == 'di') {
			$('.sui-sbs-step__' + step_i + ' .sui-sbs-step-time').html(v + 'px');
		}

		$p.removeClass('sui-form-group_undefined');
		tn_set_lastChanges();
	});
}

function sbs__drawUi__selectbox($el, $c_props, step_i, field) {
	var $p = $c_props.find('[data-sbs-prop-field=' + field + ']');
	var value = $p.attr('data-control-value');
	var str = '';
	var label = field;
	var $inp;

	if (field == 'ea') label = 'Easing';
	if (field == 'fi') label = 'Fix';
	if (field == 'tror') label = 'Origin';

	// prettier-ignore
	str +=
		'<table style="width:100%;">' +
			'<tr>' +
				'<td>' +
					'<label class="sui-label">' + label + '</label>' +
				'</td>' +
				'<td style="width:100%;min-width:50px;">' +
					'<div class="sui-select">' +
						'<select class="sui-input sui-select" name="' + field + '">';

	if (field == 'ea') {
		// prettier-ignore
		str +=
			'<option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Linear</option>' +
			'<option value="easeIn" ' + (value == 'easeIn' ? 'selected="selected"' : '') + '>Ease In</option>' +
			'<option value="easeOut" ' + (value == 'easeOut' ? 'selected="selected"' : '') + '>Ease Out</option>' +
			'<option value="easeInOut" ' + (value == 'easeInOut' ? 'selected="selected"' : '') + '>Ease In Out</option>' +
			'<option value="bounceFin" ' + (value == 'bounceFin' ? 'selected="selected"' : '') + '>Elastic Fin</option>';
	}

	if (field == 'fi') {
		// prettier-ignore
		str +=
			'<option value="" ' + (value == '' ? 'selected="selected"' : '') + '>None</option>' +
			'<option value="fixed" ' + (value == 'fixed' ? 'selected="selected"' : '') + '>Fixed</option>';
	}

	if (field == 'tror') {
		// prettier-ignore
		str +=
			'<option value="left top" ' + (value == 'left top' ? 'selected="selected"' : '') + '>Left Top</option>' +
			'<option value="center top" ' + (value == 'center top' ? 'selected="selected"' : '') + '>Center Top</option>' +
			'<option value="right top" ' + (value == 'right top' ? 'selected="selected"' : '') + '>Right Top</option>' +
			'<option value="left center" ' + (value == 'left center' ? 'selected="selected"' : '') + '>Left Center</option>' +
			'<option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Center Center</option>' +
			'<option value="right center" ' + (value == 'right center' ? 'selected="selected"' : '') + '>Right Center</option>' +
			'<option value="left bottom" ' + (value == 'left bottom' ? 'selected="selected"' : '') + '>Left Bottom</option>' +
			'<option value="center bottom" ' + (value == 'center bottom' ? 'selected="selected"' : '') + '>Center Bottom</option>' +
			'<option value="right bottom" ' + (value == 'right bottom' ? 'selected="selected"' : '') + '>Right Bottom</option>';
	}

	// prettier-ignore
	str +=
						'</select>' +
					'</div>' +
				'</td>' +
			'</tr>' +
		'</table>';

	$p.html(str);

	$inp = $('.tn-settings [name=' + field + ']');

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$p.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	$inp.change(function () {
		var $this = $(this);
		var v = $this.val();

		tn_undo__Add('elem_sbs', $el);

		$this.closest('.sui-form-group').attr('data-control-value', v);
		sbs__step__setFieldValue($el, step_i, field, v, 'render');
		$p.removeClass('sui-form-group_undefined');
		tn_set_lastChanges();
	});
}

function control__drawUi__trgels(elem_id, field, isCopiedAnimation) {
	var $el = $('#' + elem_id);
	var $c = $('[data-control-field=' + field + ']');
	var value = $c.attr('data-control-value');
	var label = 'Trigger';
	var str = '';
	var $inp;

	// prettier-ignore
	str +=
		'<label class="sui-label">' + label + '</label>' +
		'<table>' +
			'<tr>' +
				'<div class="sui-input-div">' +
					'<textarea rows="10" name="' + field + '" class="sui-input" style="display:none;height:50px;font-size:11px;border:1px solid #ccc;margin-bottom:20px;">' + value + '</textarea>' +
				'</div>' +
				'<div class="sui-sbs-trgels-div"></div>' +
				'<div class="sui-sbs-steps-add">' +
					'<div class="sui-btn sui-btn-sbs-trgels-add">+ Add trigger</div>' +
				'</div>';

	$c.html(str);

	$inp = $('.tn-settings [name=' + field + ']');

	$inp.change(function () {
		tn_console('panelsettings onchange input');

		var value;

		tn_undo__Add('elem_sbs', $el);

		value = $inp.val();

		$inp.closest('.sui-form-group').attr('data-control-value', value);
		elem__setFieldValue($el, field, value);
		tn_set_lastChanges();
	});

	$c.find('.sui-btn-sbs-trgels-add').click(function (e) {
		var elem_id = $('.tn-settings').attr('data-for-elem-id');

		$(document).mousedown({elem_id: elem_id}, sbs__trgels__choose);

		$('.tn-elem').mouseover(sbs__trgels__choose__els__mouseover);
		$('.tn-elem').mouseleave(sbs__trgels__choose__els__mouseleave);

		$('.sui-sbs-steps-add').css('display', 'none');
		$('.sui-sbs-steps-add').after(
			'<div class="sui-sbs-steps-add__hint" style="font-size:14px;padding-top:5px;">Please click on any element</div>',
		);

		$('.tn-elem').css('cursor', 'alias');

		e.stopPropagation();
	});

	// draw
	sbs__trgels__draw($el, $c, isCopiedAnimation);
}

function sbs__trgels__choose(event) {
	tn_console('func: sbs__trgels__choose. elem_id' + event.data.elem_id);

	// elemen id with animation
	var elem_id = event.data.elem_id;
	var $el = $('#' + elem_id);
	var $elems = $('.tn-elem');
	var $clickel;
	var clickel_id;
	var cur_sbstrgels;
	var $c;

	// id of element wich we just clicked
	$(event.target)
		.closest('.tn-elem')
		.each(function () {
			$clickel = $(this);
			clickel_id = $(this).attr('data-elem-id');
		});

	if (typeof clickel_id != 'undefined' && clickel_id != '') {
		cur_sbstrgels = elem__getFieldValue($el, 'sbstrgels');

		// self-trigger could be set programmatically, after the last trigger was removed,
		// to prevent this id append to list, remove it
		if ($el.attr('id') === cur_sbstrgels && $('.sui-sbs-trgel').length === 0) cur_sbstrgels = '';

		if (typeof cur_sbstrgels != 'undefined' && cur_sbstrgels != '') {
			if (cur_sbstrgels.indexOf(clickel_id) === -1) {
				clickel_id = cur_sbstrgels + ',' + clickel_id;
			} else {
				clickel_id = cur_sbstrgels;
			}
		}

		elem__setFieldValue($el, 'sbstrgels', clickel_id, '', 'updateui');

		if (window.tn.multi_edit) {
			for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
				$(window.tn.multi_edit_elems[i]).attr('data-field-sbstrgels-value', clickel_id);
			}
		}
	}

	$c = $('[data-control-field=sbstrgels]');

	sbs__trgels__draw($el, $c, false);

	$('.sui-sbs-steps-add__hint').remove();
	$('.sui-sbs-steps-add').css('display', 'inline-block');
	$elems.css('cursor', 'auto');

	if (typeof $clickel == 'object') {
		$clickel.addClass('noclick');
	}

	$(document).unbind('mousedown', sbs__trgels__choose);

	$elems.unbind('mouseover', sbs__trgels__choose__els__mouseover);
	$elems.unbind('mouseleave', sbs__trgels__choose__els__mouseleave);

	$('.tn-elem__highlight').removeClass('tn-elem__highlight');

	event.stopPropagation();
}

function sbs__trgels__choose__els__mouseover() {
	$(this).addClass('tn-elem__highlight');
}
function sbs__trgels__choose__els__mouseleave() {
	$(this).removeClass('tn-elem__highlight');
}

function sbs__trgels__draw($el, $c, isCopiedAnimation) {
	tn_console('func: sbs__trgels__draw');

	var v = isCopiedAnimation
		? JSON.parse(localStorage.getItem('tzerosbsanimation'))['sbstrgels']
		: elem__getFieldValue($el, 'sbstrgels');
	var str = '';
	var arr;
	var $elem;
	var type;
	var text;
	var foo;

	var fieldValue = 'sbstrgels';
	var breakpointValue = '';
	if (window.tn.curResolution !== window.tn.topResolution && window.tn.curResolution !== window.tn.topResolution) {
		breakpointValue = '-res-' + window.tn.curResolution;
	}
	var adaptiveFieldValue = 'data-field-' + fieldValue + breakpointValue + '-value';

	if (!v) {
		sbs__drawEmptyTriggerList($c);
		return;
	}

	arr = v.split(',');

	str += '<table class="sui-sbs-trgels__table"><tbody style="overflow:auto;">';

	for (var i = 0, l = arr.length; i < l; i++) {
		$elem = $('#' + arr[i]);

		if (typeof $elem == 'undefined' || $elem.length == 0) continue;

		type = $elem.attr('data-elem-type');
		text = type;
		foo = $elem.attr('data-field-layer-value');

		if (typeof foo != 'undefined' && foo != '') {
			text = foo;
		} else {
			if (type == 'text') {
				text = $elem.find('.tn-atom').text();
			} else if (type == 'image') {
				text = $elem.find('.tn-atom__img').attr('src');
				text = text.split('/').pop();

				if (text != 'imgfishsquare.gif') {
					if (text.length > 18) {
						text = '..' + text.slice(-18);
					}
				}
			} else if (type == 'button') {
				text = $elem.attr('data-field-caption-value');
			}
		}

		if (text.length > 20) {
			text = text.substring(0, 18) + '..';
		}

		var iconType = type === 'shape' ? 'rectangle' : type;
		// prettier-ignore
		str +=
			'<tr class="sui-sbs-trgel sui-sbs-trgel__' + i + '" data-sbs-trgel-id="' + arr[i] + '">' +
				'<td class="sui-sbs-trgels__td" style="width:20px;padding-left:10px;">' +
					'<div class="sui-sbs-trgel__icon sui-sbs-trgel__icon_' + iconType + '" style="width:15px;height:15px;margin:3px 5px 3px 5px;display:block;"></div>' +
				'</td>' +
				'<td class="sui-sbs-trgels__td" style="width:140px;padding-left:10px;">' + text + '</td>' +
				'<td class="sui-sbs-trgels__td sui-sbs-trgel-del" style="width:20px;cursor:pointer;">x</td>' +
			'</tr>';
	}

	str += '</tbody></table>';
	$c.find('.sui-sbs-trgels-div').html(str);

	$c.find('.sui-sbs-trgel').mouseover(function () {
		var id = $(this).attr('data-sbs-trgel-id');
		$('#' + id).addClass('tn-elem__highlight');
	});

	$c.find('.sui-sbs-trgel').mouseleave(function () {
		var id = $(this).attr('data-sbs-trgel-id');
		$('#' + id).removeClass('tn-elem__highlight');
	});

	$c.find('.sui-sbs-trgel-del').click(function (e) {
		var id = $(this).parent().attr('data-sbs-trgel-id');
		var elem_id = $('.tn-settings').attr('data-for-elem-id');
		var $el = $('#' + elem_id);

		// check for last trigger, which will be removed
		var isLastRemovedTrigger = $(this).parents('.sui-sbs-trgels__table').find('.sui-sbs-trgel').length === 1;
		var cachedValue = elem__getFieldValue($el, 'sbstrgels');
		if (isLastRemovedTrigger) $el.attr(adaptiveFieldValue, '');
		var v = $el.attr(adaptiveFieldValue) || '';

		$(this).parent().remove();
		if (isLastRemovedTrigger) sbs__drawEmptyTriggerList($c);

		// don't repeat triggers id
		var value = v
			.split(',')
			.filter(function (elID) {
				return elID !== id;
			})
			.join(',');

		// if value is empty, set self-trigger (not for desktop resolution)
		if (!value && cachedValue && window.tn.curResolution < window.tn.topResolution) value = elem_id;

		elem__setFieldValue($el, 'sbstrgels', value, '', 'updateui');

		$('.tn-elem').removeClass('tn-elem__highlight');

		e.stopPropagation();
	});
}

function sbs__drawEmptyTriggerList($c) {
	$c.find('.sui-sbs-trgels-div').html(
		'<span style="font-size:13px;opacity:0.55;">By default, the animation event starts when you click or hover over the animated element itself. Alternatively, you can attach this event to any other element.</span>',
	);
}

function sbs__copypaste__draw(elem_id) {
	var copiedAnimation = JSON.parse(localStorage.getItem('tzerosbsanimation'));
	var btnPasteDisabledClass = copiedAnimation === null ? ' sui-btn_disabled' : '';
	var wire = '';

	var style = JSON.parse(localStorage.getItem('tzerosbsanimation')) === null ? ' style="display:none;"' : '';
	// prettier-ignore
	wire +=
	'<div class="sui-panel__section sui-panel__section-sbs-copypaste"' + style + '>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<table style="width:100%;">' +
						'<tr>' +
							'<td>' +
								'<label class="sui-label" style="width: 260px;">Copy & paste' +
									'<div class="sui-label-ask tooltip" data-tooltip="You can copy animations from one element to another. </br> Click “Copy animation”, then choose another element </br> and click “Paste animation” in the animation settings"></div>' +
								'</label>' +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td style="width:100%; min-width:60px; padding-top: 15px;">' +
								'<div class="sui-btn sui-btn-sbs-copy sui-btn_disabled">Copy animation</div>' +
								'<div class="sui-btn sui-btn-sbs-paste' + btnPasteDisabledClass + '">Paste animation</div>' +
							'</td>' +
						'</tr>' +
					'</table>' +
				'</td>' +
			'</tr>' +
		'</table>' +
	'</div>';

	return wire;
}
