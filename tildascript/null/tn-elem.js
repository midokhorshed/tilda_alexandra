function elem__setFieldValue($el, prop, val, flag_render, flag_updateui, res) {
	if (window.tn.multi_edit && $el.attr('data-fields')) {
		var fields = $el.attr('data-fields').split(',');
		if (fields.indexOf(prop) === -1) return;
	}

	//todo - может стоит перенести в другое место
	if (
		prop == 'bgcolor' ||
		prop == 'color' ||
		prop == 'bgcolorhover' ||
		prop == 'slds_dotsbgcolor' ||
		prop == 'slds_dotsbgcoloractive' ||
		prop == 'slds_arrowbgcolor' ||
		prop == 'slds_arrowbgcolorhover' ||
		prop == 'tipbgcolor'
	) {
		if (tn_isGradientStyle(val)) val = tn_parseJSONfromGradient(val);
		if (tn_isGradientJSON(val)) val = tn_replaceDoubleQuotes(val);
	}

	if (typeof res == 'undefined' || res == '') res = window.tn.curResolution;

	if (res < window.tn.topResolution && prop !== 'zindex' && prop !== 'lock' && prop !== 'invisible') {
		//todo: может стоит перенести zindex и др в другое место
		$el.attr('data-field-' + prop + '-res-' + res + '-value', val);
	} else {
		$el.attr('data-field-' + prop + '-value', val);
	}

	if (flag_render === 'render') elem__renderViewOneField($el, prop);
	if (flag_updateui === 'updateui') panelSettings__updateUi($el, prop, val);
}

function elem__delFieldValue($el, prop, val, flag_render, flag_updateui, res) {
	if (typeof res === 'undefined' || res == '') res = window.tn.curResolution;
	tn_console('func: elem__delFieldValue ' + prop + '=' + val + ' Res:' + res);

	if (res < window.tn.topResolution && prop != 'zindex') {
		$el.removeAttr('data-field-' + prop + '-res-' + res + '-value');
	} else {
		$el.removeAttr('data-field-' + prop + '-value');
	}

	if (flag_render == 'render') elem__renderViewOneField($el, prop);
	if (flag_updateui == 'updateui') {
		panelSettings__updateUi($el, prop, val);
		if (prop == 'leftunits' || prop == 'topunits' || prop == 'widthunits' || prop == 'heightunits' || prop == 'lock') {
			elem__updateUIControls($el);
		}
	}
}

function elem__emptyField($el, prop, flag_render, flag_updateui) {
	window.tn.screens.forEach(function (s, i) {
		if (s == window.tn.topResolution) {
			$el.attr('data-field-' + prop + '-value', '');
		} else {
			$el.removeAttr('data-field-' + prop + '-res-' + s + '-value');
		}
	});

	if (typeof flag_render != 'undefined' && flag_render == 'render') elem__renderViewOneField($el, prop);
	if (typeof flag_updateui != 'undefined' && flag_updateui == 'updateui') {
		panelSettings__updateUi($el, prop, '');
		if (prop == 'leftunits' || prop == 'topunits' || prop == 'widthunits' || prop == 'heightunits' || prop == 'lock') {
			elem__updateUIControls($el);
		}
	}
}

function elem__getFieldValue($el, prop) {
	var v;

	if (prop == 'height' && ($el.attr('data-elem-type') == 'text' || $el.attr('data-elem-type') == 'image')) {
		v = parseInt($el.innerHeight(), 10);
		return v;
	}

	//если есть значение в дата-атрибуте для нашего разрешения
	if (window.tn.curResolution === window.tn.topResolution) {
		v = $el.attr('data-field-' + prop + '-value');
	} else {
		v = $el.attr('data-field-' + prop + '-res-' + window.tn.curResolution + '-value');
	}

	//значения нет, значит поищем на высших разрешениях лесенкой
	if (typeof v === 'undefined') {
		for (var i = 0; i < window.tn.screens_cnt; i++) {
			if (window.tn.screens[i] <= window.tn.curResolution) continue;

			if (window.tn.screens[i] === window.tn.topResolution) {
				v = $el.attr('data-field-' + prop + '-value');
			} else {
				v = $el.attr('data-field-' + prop + '-res-' + window.tn.screens[i] + '-value');
			}
			if (typeof v !== 'undefined') {
				break; //останавливаем цикл (но не выходим из функции)
			}
		} //for
	}

	return v;
}

function elem__getFieldValue_for_Res($el, prop, res) {
	var v;

	if (res == window.tn.topResolution) {
		v = $el.attr('data-field-' + prop + '-value');
	} else {
		v = $el.attr('data-field-' + prop + '-res-' + res + '-value');
	}
	return v; //value for resolution
}

/* Different browsers have different algorithms for calculating relative line-height.
Because of this, large text elements have different heights in different browsers.
To fix this, calculate the line-height in pixels and round it up */
function elem__setLineHeightFontSize($el, value, prop) {
	var computedLineHeight;

	if (prop === 'fontsize') {
		$el.css('font-size', parseInt(value, 10) + 'px');
		var lineHeight = elem__getFieldValue($el, 'lineheight');
		computedLineHeight = parseFloat(value) * parseFloat(lineHeight);
	}

	if (prop === 'lineheight') {
		if (!value) value = '0';
		var fontSize = elem__getFieldValue($el, 'fontsize');
		computedLineHeight = parseFloat(value) * parseFloat(fontSize);
	}

	if (isNaN(computedLineHeight)) return;
	$el.css('line-height', Math.round(computedLineHeight) + 'px');
}

function elem__convertPosition__Local__toAbsolute($el, field, value) {
	value = parseInt(value);

	if (field == 'left') {
		var offset_left;
		var el_container_width;
		var el_width;
		var container = elem__getFieldValue($el, 'container');

		if (container == 'grid') {
			offset_left = window.tn.canvas_min_offset_left;
			el_container_width = window.tn.canvas_min_width;
		} else {
			offset_left = window.tn.canvas_max_offset_left;
			el_container_width = window.tn.canvas_max_width;
		}

		/* fluid or not */
		var el_leftunits = elem__getFieldValue($el, 'leftunits');
		if (el_leftunits == '%') {
			value = parseInt(el_container_width * parseFloat(value / 100));
		}

		value = offset_left + value;

		var el_axisx = elem__getFieldValue($el, 'axisx');

		if (el_axisx == 'center') {
			el_width = elem__getWidth($el);
			value = el_container_width / 2 - el_width / 2 + value;
		}

		if (el_axisx == 'right') {
			el_width = elem__getWidth($el);
			value = el_container_width - el_width + value;
		}
	}

	if (field == 'top') {
		var offset_top;
		var el_container_height;
		var el_height;
		var container = elem__getFieldValue($el, 'container');

		if (container == 'grid') {
			offset_top = window.tn.canvas_min_offset_top;
			el_container_height = window.tn.canvas_min_height;
		} else {
			offset_top = window.tn.canvas_max_offset_top;
			el_container_height = window.tn.canvas_max_height;
		}

		/* fluid or not	*/
		var el_topunits = elem__getFieldValue($el, 'topunits');
		if (el_topunits == '%') {
			value = parseInt(el_container_height * parseFloat(value / 100));
		}

		value = offset_top + value;

		var el_axisy = elem__getFieldValue($el, 'axisy');

		if (el_axisy == 'center') {
			el_height = elem__getHeight($el);
			value = el_container_height / 2 - el_height / 2 + value;
		}

		if (el_axisy == 'bottom') {
			el_height = elem__getHeight($el);
			value = el_container_height - el_height + value;
		}
	}

	return value;
}

function elem__convertPosition__Absolute__toLocal($el, field, value) {
	value = parseInt(value, 10);

	if (field == 'left') {
		var container = elem__getFieldValue($el, 'container');
		var units = elem__getFieldValue($el, 'leftunits');
		var axisx = elem__getFieldValue($el, 'axisx');

		if (container == 'grid') {
			var offset_left = window.tn.canvas_min_offset_left;
			var container_width = window.tn.canvas_min_width;
		} else {
			var offset_left = window.tn.canvas_max_offset_left;
			var container_width = window.tn.canvas_max_width;
		}

		value = value - offset_left;

		if (axisx == 'center') {
			var el_width = elem__getWidth($el);
			value = value - container_width / 2 + el_width / 2;
		}

		if (axisx == 'right') {
			var el_width = elem__getWidth($el);
			value = value - container_width + el_width;
		}

		if (units == '%') {
			value = Math.round((value / container_width) * 100);
		}
	}

	if (field == 'top') {
		var container = elem__getFieldValue($el, 'container');
		var units = elem__getFieldValue($el, 'topunits');
		var axisy = elem__getFieldValue($el, 'axisy');

		if (container == 'grid') {
			var offset_top = window.tn.canvas_min_offset_top;
			var container_height = window.tn.canvas_min_height;
		} else {
			var offset_top = window.tn.canvas_max_offset_top;
			var container_height = window.tn.canvas_max_height;
		}

		value = value - offset_top;

		if (axisy == 'center') {
			var el_height = elem__getHeight($el);
			value = value - container_height / 2 + el_height / 2;
		}

		if (axisy == 'bottom') {
			var el_height = elem__getHeight($el);
			value = value - container_height + el_height;
		}

		if (units == '%') {
			value = Math.round((value / container_height) * 100);
		}
	}

	return value;
}

function elem__convertSize__Absolute__toLocal(el, field, value) {
	value = parseInt(value, 10);
	var container_width;

	if (field == 'width') {
		var units = elem__getFieldValue(el, 'widthunits');

		if (units == '%') {
			var container = elem__getFieldValue(el, 'container');

			if (container == 'grid') {
				container_width = window.tn.canvas_min_width;
			} else {
				container_width = window.tn.canvas_max_width;
			}

			value = parseInt((value / container_width) * 100, 10);
		}
	}

	if (field == 'height') {
		var units = elem__getFieldValue(el, 'heightunits');
		var container_height;

		if (units == '%') {
			var container = elem__getFieldValue(el, 'container');

			if (container == 'grid') {
				container_height = window.tn.canvas_min_height;
			} else {
				container_height = window.tn.canvas_max_height;
			}

			value = parseInt((value / container_height) * 100, 10);
		}
	}

	return value;
}

function elem__getData__inJson($el) {
	var fields = $el.attr('data-fields');

	if (fields) {
		fields = fields.split(',');
	} else {
		fields = [];
	}

	var el_values = {};
	el_values.elem_id = $el.attr('data-elem-id');
	el_values.elem_type = $el.attr('data-elem-type');

	fields.forEach(function (field) {
		var fieldValue = $el.attr('data-field-' + field + '-value');

		if (
			field == 'bgcolor' ||
			field == 'color' ||
			field == 'bgcolorhover' ||
			field == 'slds_dotsbgcolor' ||
			field == 'slds_dotsbgcoloractive' ||
			field == 'slds_arrowbgcolor' ||
			field == 'slds_arrowbgcolorhover' ||
			field == 'tipbgcolor'
		) {
			fieldValue = tn_replaceSingleQuotes(fieldValue);

			if (tn_isGradientJSON(fieldValue)) {
				fieldValue = tn_parseGradientFromJSON(fieldValue);
			}
		}

		el_values[field] = fieldValue;

		/* get values of this field on other resolutions */
		var v;
		window.tn.screens.forEach(function (s) {
			if (s == window.tn.topResolution) return; //continue (skip)

			v = $el.attr('data-field-' + field + '-res-' + s + '-value');

			if (typeof v !== 'undefined') {
				if (field == 'bgcolor' || field == 'color') {
					v = tn_replaceSingleQuotes(v);
					if (tn_isGradientJSON(v)) {
						v = tn_parseGradientFromJSON(v);
					}
				}

				el_values[field + '-res-' + s] = v;
			}
		});
	});

	if (el_values.elem_type == 'text')
		el_values.text =
			window.ver_redactor === 'q' ? Quill.removeNbspMarkers($el.find('.tn-atom').html()) : $el.find('.tn-atom').html();
	if (el_values.elem_type == 'html') el_values.code = $el.find('.tn-atom__html-textarea').val();
	if (el_values.elem_type == 'form') el_values.inputs = $el.find('.tn-atom__inputs-textarea').val();
	if (el_values.elem_type == 'vector') el_values.vectorsvg = $el.find('.tn-atom').html();
	if (el_values.elem_type == 'tooltip') {
		if (window.ver_redactor === 'q') {
			el_values.tipcaption = Quill.removeNbspMarkers($el.find('.tn-atom__tip-text').html());
		} else {
			el_values.tipcaption = $el.find('.tn-atom__tip-text').html();
		}
		el_values.height = el_values['width'];
	}

	return el_values;
}

function allelems__getData__inJson() {
	tn_console('func: allelems__getData__inJson');

	var data = {};
	var i = 0;
	var $verticalGuides = $('.tn-guide_v');
	var $horizontalGuides = $('.tn-guide_h');

	$('.tn-elem:not(.tn-elem__fake)').each(function () {
		var $el = $(this);
		var el_values = elem__getData__inJson($el);
		data[i] = el_values;
		i++;
	});

	if ($horizontalGuides.length > 0) {
		var guides_h = [];
		$horizontalGuides.each(function () {
			if (typeof $(this).attr('data-field-top-value') != 'undefined') {
				guides_h[guides_h.length] = $(this).attr('data-field-top-value');
			}
		});
		data['guides_h'] = guides_h;
	}
	if ($verticalGuides.length > 0) {
		var guides_v = [];
		$verticalGuides.each(function () {
			if (typeof $(this).attr('data-field-left-value') != 'undefined') {
				guides_v[guides_v.length] = $(this).attr('data-field-left-value');
			}
		});
		data['guides_v'] = guides_v;
	}

	if ($('.tn-group').length > 0) {
		data.groups = group__getDataJson();
	}

	var $ab = $('.tn-artboard');

	/* add info artboard */
	var ab_fields = window.tn.ab_fields;

	ab_fields.forEach(function (field) {
		var fieldValue = $ab.attr('data-artboard-' + field);

		if (field == 'bgcolor') {
			fieldValue = tn_replaceSingleQuotes(fieldValue);

			if (tn_isGradientJSON(fieldValue)) {
				fieldValue = tn_parseGradientFromJSON(fieldValue);
			}
		}

		data['ab_' + field] = fieldValue;

		/* get values of this field on other resolutions */
		var v;
		window.tn.screens.forEach(function (s, i) {
			if (s == window.tn.topResolution) return; //continue (skip)

			v = $ab.attr('data-artboard-' + field + '-res-' + s);
			if (typeof v !== 'undefined') {
				if (field == 'bgcolor') {
					v = tn_replaceSingleQuotes(v);
					if (tn_isGradientJSON(v)) {
						v = tn_parseGradientFromJSON(v);
					}
				}

				data['ab_' + field + '-res-' + s] = v;
			}
		});
	}); //foreach fields

	//
	// screens
	var str_screens = '';
	window.tn.screens.forEach(function (s, i) {
		str_screens += s;
		if (i != window.tn.screens_cnt - 1) str_screens += ',';
	});

	if (str_screens !== window.tn.screens_default_str) {
		data['ab_screens'] = str_screens;
	}

	data['timestamp'] = Date.now();

	tn_console(data);

	return data;
}

function allelems__cleanData__inJson(data) {
	tn_console('func: allelems__cleanData__inJson');

	for (var i in data) {
		var elem = data[i];

		if (elem === 'isolate' && window.userrole !== 'tester') {
			delete data[i];
		}

		var canBeEmptyFields = ['ab_bgimg', 'ab_height_vh', 'ab_bgcolor'];
		var isResponsiveValue = i.indexOf('-res-') !== -1;
		var mayBeEmptyField =
			isResponsiveValue &&
			canBeEmptyFields.some(function (field) {
				return i.indexOf(field) !== -1;
			});

		if (typeof elem == 'undefined' || (elem == '' && !mayBeEmptyField)) {
			delete data[i];
		}

		if (typeof elem == 'object') {
			for (var ii in elem) {
				var prop = elem[ii];
				if (typeof prop == 'undefined' || prop == '') {
					delete data[i][ii];
				}
				if (
					(ii == 'rotate' && prop == '0') ||
					(ii == 'bgattachment' && prop == 'static') ||
					(ii == 'bgposition' && prop == 'center center') ||
					(ii == 'opacity' && prop == '1') ||
					(ii == 'letterspacing' && prop == '0') ||
					(ii == 'container' && prop == 'grid') ||
					(ii == 'axisx' && prop == 'left') ||
					(ii == 'axisy' && prop == 'top') ||
					(ii == 'tag' && prop == 'div') ||
					(ii == 'align' && prop == 'left' && elem.elem_type !== 'button') ||
					(ii == 'animduration' && prop == '0') ||
					(ii == 'animdelay' && prop == '0') ||
					(ii == 'animdistance' && prop == '0') ||
					(ii == 'animtriggeroffset' && prop == '0') ||
					(ii == 'animprxs' && prop == '100') ||
					(ii == 'animprxdx' && prop == '0') ||
					(ii == 'animprxdy' && prop == '0') ||
					(ii == 'animfixdist' && prop == '0') ||
					(ii == 'animfixtrgofst' && prop == '0')
				) {
					delete data[i][ii];
				}
				if (
					(ii == 'widthunit' && prop == 'px') ||
					(ii == 'heightunit' && prop == 'px') ||
					(ii == 'topunit' && prop == 'px') ||
					(ii == 'leftunit' && prop == 'px')
				) {
					delete data[i][ii];
				}
				if (ii === 'fontweight' && data[i]['variationweight']) {
					data[i]['fontweight'] = data[i]['variationweight'];
					delete data[i]['variationweight'];
				}
				if (ii === 'inputfontweight' && data[i]['inputvariationweight']) {
					data[i][ii] = data[i]['inputvariationweight'];
					delete data[i]['inputvariationweight'];
				}
				if (ii === 'inputtitlefontweight' && data[i]['inputtitlevariationweight']) {
					data[i][ii] = data[i]['inputtitlevariationweight'];
					delete data[i]['inputtitlevariationweight'];
				}
				if (ii === 'inputelsfontweight' && data[i]['inputelsvariationweight']) {
					data[i][ii] = data[i]['inputelsvariationweight'];
					delete data[i]['inputelsvariationweight'];
				}
				if (ii === 'buttonfontweight' && data[i]['buttonvariationweight']) {
					data[i][ii] = data[i]['buttonvariationweight'];
					delete data[i]['buttonvariationweight'];
				}
			}
		}
	}

	return data;
}

/* ------------------------ */
/* Move Element */

function elem__Save__currentWidth(el) {
	var width = el.css('width');
	width = parseFloat(width);

	width = elem__convertSize__Absolute__toLocal(el, 'width', width);
	var cachedWidth = parseInt(elem__getFieldValue(el, 'width'), 10);
	if (cachedWidth === width) return;

	elem__setFieldValue(el, 'width', width);
	var elem_id = el.attr('data-elem-id');
	$('.tn-settings[data-for-elem-id=' + elem_id + ']')
		.find('[name=width]')
		.val(width);
	if (window.tn.curResolution != window.tn.topResolution)
		$('.tn-settings').find('[data-control-field=width]').removeClass('sui-form-group_undefined');
}

function elem__Save__currentHeight($el) {
	var height = $el.css('height');
	height = parseFloat(height);

	height = elem__convertSize__Absolute__toLocal($el, 'height', height);
	var cachedHeight = parseInt(elem__getFieldValue($el, 'height'), 10);
	if (cachedHeight === height) return;

	elem__setFieldValue($el, 'height', height);
	var elem_id = $el.attr('data-elem-id');
	$('.tn-settings[data-for-elem-id=' + elem_id + ']')
		.find('[name=height]')
		.val(height);
	if (window.tn.curResolution != window.tn.topResolution)
		$('.tn-settings').find('[data-control-field=height]').removeClass('sui-form-group_undefined');
}

function elem__Save__absolutePosition($el, left, top) {
	top = parseInt(top, 10);
	left = parseInt(left, 10);

	left = elem__convertPosition__Absolute__toLocal($el, 'left', left);
	top = elem__convertPosition__Absolute__toLocal($el, 'top', top);

	/* fix fractions */
	top = Math.round(top);
	left = Math.round(left);
	var cachedTopPos = parseInt(elem__getFieldValue($el, 'top'), 10);
	var cachedLeftPos = parseInt(elem__getFieldValue($el, 'left'), 10);

	if (cachedTopPos !== top) elem__setFieldValue($el, 'top', top);
	if (cachedLeftPos !== left) elem__setFieldValue($el, 'left', left);

	var elem_id = $el.attr('data-elem-id');

	/* top */
	if (cachedTopPos !== top) {
		var $control = $('.tn-settings[data-for-elem-id=' + elem_id + ']');
		$control.find('[name=top]').val(top);
		if (window.tn.curResolution != window.tn.topResolution)
			$control.find('[data-control-field=top]').removeClass('sui-form-group_undefined');
	}

	/* left */
	if (cachedLeftPos !== left) {
		$control = $('.tn-settings[data-for-elem-id=' + elem_id + ']');
		$control.find('[name=left]').val(left);
		if (window.tn.curResolution != window.tn.topResolution)
			$control.find('[data-control-field=left]').removeClass('sui-form-group_undefined');
	}
}

function elem__Save__currentPosition($el) {
	var top = parseInt(elem__getRealPosition($el).top);
	var left = parseInt(elem__getRealPosition($el).left);

	elem__Save__absolutePosition($el, left, top);
}

/* check used or not this func */
function elem__Save__currentPosition__left($el) {
	var left = $el.css('left');
	left = elem__convertPosition__Absolute__toLocal($el, 'left', left);

	elem__setFieldValue($el, 'left', left);

	var elem_id = $el.attr('data-elem-id');
	$('.tn-settings[data-for-elem-id=' + elem_id + ']')
		.find('[name=left]')
		.val(left);
	if (window.tn.curResolution != window.tn.topResolution)
		$('.tn-settings').find('[data-control-field=left]').removeClass('sui-form-group_undefined');
}

function elem__offsetMove($el, x, y) {
	var isGroup = $el.hasClass('tn-group');
	var new_x;
	var new_y;

	if (x > 0 || x < 0) {
		var el_x = parseInt($el.css('left'));
		new_x = el_x + x;
		$el.css('left', new_x + 'px');
	}
	if (y > 0 || y < 0) {
		var el_y = parseInt($el.css('top'));
		new_y = el_y + y;
		$el.css('top', new_y + 'px');
	}
	if (x > 0 || x < 0 || y > 0 || y < 0) {
		if (window.tn_flag_sbs_onstep == 'y' && !isGroup) {
			var step_i = $el.attr('data-sbs-step-i') * 1;
			if (step_i > 0) {
				var left = elem__getFieldValue($el, 'left');
				left = elem__convertPosition__Local__toAbsolute($el, 'left', left);
				var top = elem__getFieldValue($el, 'top');
				top = elem__convertPosition__Local__toAbsolute($el, 'top', top);
				var offset_left = parseInt($el.css('left')) - parseInt(left);
				var offset_top = parseInt($el.css('top')) - parseInt(top);
				sbs__step__setFieldValue($el, step_i, 'mx', offset_left, 'render', 'updateui');
				sbs__step__setFieldValue($el, step_i, 'my', offset_top, 'render', 'updateui');
			} else {
				elem__Save__currentPosition($el);
			}
		} else {
			if (isGroup) {
				group__saveCurrentPosition($el.attr('id'));
			} else {
				elem__Save__currentPosition($el);
			}
		}
	}
}

/**
 * @param {'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'} align
 * @param {'grid' | 'window'} container
 * @returns
 */
function elem__aligntoCanvas(align, container) {
	tn_console('func: elem__aligntoCanvas');

	if ($('.tn-elem__selected').length == 0) return;

	$('.tn-elem__selected').each(function () {
		var $el = $(this);
		var $group = $el.closest('.tn-group');
		var isInsideGroup = $group.length > 0;

		if (isInsideGroup) {
			var $elementPosition = $el.position();
			$elementPosition.width = $el.width();
			$elementPosition.height = $el.height();

			var $groupPosition = $group.position();
			$groupPosition.width = $group.width();
			$groupPosition.height = $group.height();

			elem__setAlignPosition($el, align, {
				left: 0,
				right: $groupPosition.width - parseInt($elementPosition.width, 10),
				center: $groupPosition.width / 2 - parseInt($elementPosition.width / 2, 10),

				top: 0,
				bottom: $groupPosition.height - parseInt($elementPosition.height, 10),
				middle: $groupPosition.height / 2 - parseInt($elementPosition.height / 2, 10),
			});
		} else {
			elem__setAlignPosition($el, align, elem__getCanvasPositions($el, container));
		}

		elem__Save__currentPosition($el);
	});

	if (window.tn.multi_edit) {
		$('.tn-elem__fake').remove();
		panelSettings__openTimeout(window.tn.multi_edit_elems, true);
	}

	tn_setOutlinePosition('selected');
}

/**
 * Получает размеры канваса в формате обьекта для выравнивания
 *
 * @param {jQuery} $el
 * @param {'grid' | 'window'} container
 */
function elem__getCanvasPositions($el, container) {
	var canvasType = container === 'grid' ? 'min' : 'max';
	var canvas = {
		left: window.tn['canvas_' + canvasType + '_offset_left'],
		top: window.tn['canvas_' + canvasType + '_offset_top'],
		width: window.tn['canvas_' + canvasType + '_width'],
		height: window.tn['canvas_' + canvasType + '_height'],
	};

	var width = $el.width();
	var height = $el.height();

	return {
		left: canvas.left,
		right: canvas.left + canvas.width - parseInt(width, 10),
		center: canvas.left + canvas.width / 2 - parseInt(width / 2, 10),

		top: canvas.top,
		bottom: canvas.top + canvas.height - parseInt(height, 10),
		middle: canvas.top + canvas.height / 2 - parseInt(height / 2, 10),
	};
}

/**
 * Устанавливает top, left элемента в зависимости от выравнивания
 *
 * @param {jQuery} $el - элемент для выравнивания
 * @param {'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'} align
 * @param {{left: number, center: number, right: number, top: number, middle: number, bottom: number}} position - размер контейнера
 */
function elem__setAlignPosition($el, align, position) {
	if (align === 'left') $el.css('left', position.left + 'px');
	if (align === 'right') $el.css('left', position.right + 'px');
	if (align === 'center') $el.css('left', position.center + 'px');

	if (align === 'top') $el.css('top', position.top + 'px');
	if (align === 'bottom') $el.css('top', position.bottom + 'px');
	if (align === 'middle') $el.css('top', position.middle + 'px');
}

function elem__drawAxis($el) {
	$('.tn-axis').remove();

	if (typeof $el == 'undefined') {
		if ($('.tn-elem__selected').length == 1) {
			$el = $('.tn-elem__selected');
		} else {
			return;
		}
	}

	$('body .tn-layout').append(
		'<div class="tn-axis"><div class="tn-axis__x-ico"></div><div class="tn-axis__y-ico"></div></div>',
	);
	var $axis = $('.tn-axis');
	var container = elem__getFieldValue($el, 'container');
	var axis_x = elem__getFieldValue($el, 'axisx');
	var axis_y = elem__getFieldValue($el, 'axisy');
	var axis_left;
	var axis_top;
	if (container == 'grid') {
		if (axis_x == 'left') axis_left = window.tn.canvas_min_offset_left;
		if (axis_x == 'right') axis_left = window.tn.canvas_min_offset_left + window.tn.canvas_min_width;
		if (axis_x == 'center') axis_left = window.tn.canvas_min_offset_left + window.tn.canvas_min_width / 2;
		$axis.css('left', axis_left + 'px');

		if (axis_y == 'top') axis_top = window.tn.canvas_min_offset_top;
		if (axis_y == 'bottom') axis_top = window.tn.canvas_min_offset_top + window.tn.canvas_min_height;
		if (axis_y == 'center') axis_top = window.tn.canvas_min_offset_top + window.tn.canvas_min_height / 2;
		$axis.css('top', axis_top + 'px');
	} else {
		if (axis_x == 'left') axis_left = window.tn.canvas_max_offset_left;
		if (axis_x == 'right') axis_left = window.tn.canvas_max_offset_left + window.tn.canvas_max_width;
		if (axis_x == 'center') axis_left = window.tn.canvas_max_offset_left + window.tn.canvas_max_width / 2;
		$axis.css('left', axis_left + 'px');

		if (axis_y == 'top') axis_top = window.tn.canvas_max_offset_top;
		if (axis_y == 'bottom') axis_top = window.tn.canvas_max_offset_top + window.tn.canvas_max_height;
		if (axis_y == 'center') axis_top = window.tn.canvas_max_offset_top + window.tn.canvas_max_height / 2;
		$axis.css('top', axis_top + 'px');
	}
}

function elem__removeAxis() {
	$('.tn-axis').remove();
}

function elem__updateUIControls($el) {
	var el_container = elem__getFieldValue($el, 'container');
	var el_lock = elem__getFieldValue($el, 'lock');

	/* resizable and dragable */
	if (el_lock == 'y') {
		$el.draggable('disable');
	} else {
		if (!window.tn.multi_edit) {
			if (!elem__getFieldValue($el, 'groupid')) $el.draggable('enable');
		}

		if (el_container == 'window') {
			$el.addClass('tn-elem__fluid');
		} else {
			$el.removeClass('tn-elem__fluid');
		}
	}

	if (el_lock == 'y') {
		$el.addClass('tn-elem__locked');
	} else {
		$el.removeClass('tn-elem__locked');
	}
}

function elem__getWidth(el, value) {
	if (typeof value == 'undefined') value = parseInt(elem__getFieldValue(el, 'width'));
	var el_widthunits = elem__getFieldValue(el, 'widthunits');
	if (el_widthunits == '%') {
		var el_container = elem__getFieldValue(el, 'container');
		if (el_container == 'window') {
			value = parseInt(window.tn.canvas_max_width * parseFloat(parseInt(value) / 100));
		} else {
			value = parseInt(window.tn.canvas_min_width * parseFloat(parseInt(value) / 100));
		}
	}
	return value;
}

function elem__getHeight($el, value) {
	if (typeof value == 'undefined') value = elem__getFieldValue($el, 'height');
	value = parseInt(value, 10);

	if (
		$el.attr('data-elem-type') == 'shape' ||
		$el.attr('data-elem-type') == 'video' ||
		$el.attr('data-elem-type') == 'html' ||
		$el.attr('data-elem-type') == 'tile' ||
		$el.attr('data-elem-type') == 'gallery'
	) {
		var el_heightunits = elem__getFieldValue($el, 'heightunits');

		if (el_heightunits == '%') {
			var el_container = elem__getFieldValue($el, 'container');
			if (el_container == 'window') {
				value = parseInt(window.tn.canvas_max_height * parseFloat(value / 100));
			} else {
				value = parseInt(window.tn.canvas_min_height * parseFloat(value / 100));
			}
		}
	} else if ($el.attr('data-elem-type') != 'button') {
		value = parseInt($el.innerHeight(), 10);
	}

	return value;
}

function elem__renderForm($el, datastr) {
	t_zeroForms__renderForm($el, datastr);
}

function elem__getRealPosition($el) {
	var groupId = elem__getFieldValue($el, 'groupid');
	var elLeft = $el.css('left');
	var elTop = $el.css('top');

	if (groupId) {
		var $group = $('#' + groupId + '.tn-group');
		elLeft = parseInt(elLeft, 10) + parseInt($group.css('left'), 10) + 'px';
		elTop = parseInt(elTop, 10) + parseInt($group.css('top'), 10) + 'px';
	}

	return {
		left: parseInt(elLeft, 10),
		top: parseInt(elTop, 10),
	};
}

function elem__setEditReady($el) {
	$el.attr('data-edit-ready', true);
	setTimeout(function () {
		$el.removeAttr('data-edit-ready');
	}, 3000);
}

function elem__removeBasicAnimation($el) {
	elem__emptyField($el, 'animduration', '', '', '');
	elem__emptyField($el, 'animdelay', '', '', '');
	elem__emptyField($el, 'animdistance', '', '', '');
	elem__emptyField($el, 'animscale', '', '', '');
	elem__emptyField($el, 'animtriggeroffset', '', '', '');
	elem__emptyField($el, 'animprx', '', '', '');
	elem__emptyField($el, 'animprxs', '', '', '');
	elem__emptyField($el, 'animprxdy', '', '', '');
	elem__emptyField($el, 'animprxdx', '', '', '');
	elem__emptyField($el, 'animfix', '', '', '');
	elem__emptyField($el, 'animfixdist', '', '', '');
	elem__emptyField($el, 'animfixtrgofst', '', '', '');
	elem__emptyField($el, 'animstyle', '', '', '');
}

function elem__removeSBSAnimation($elems) {
	$elems.each(function () {
		var $el = $(this);
		elem__emptyField($el, 'sbsevent', '', '');
		elem__emptyField($el, 'sbstrg', '', '');
		elem__emptyField($el, 'sbstrgofst', '', '');
		elem__emptyField($el, 'sbstrgels', '', '');
		elem__emptyField($el, 'sbsopts', '', '');
		elem__emptyField($el, 'sbsloop', '', '');
		elem__setFieldValue($el, 'animmobile', '', '', 'updateui', window.tn.topPosition);
	});
}
