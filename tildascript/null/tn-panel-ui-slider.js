function control__drawUi__slider(elem_id, field, isCopiedAnimation) {
	var $c = $('[data-control-field=' + field + ']');
	var value = $c.attr('data-control-value');
	var $el = $('#' + elem_id);
	var str = '';
	var label = field;
	var value_show;
	var $inp;
	var max;
	var min;
	var step;
	var widthunits;

	if (typeof value === 'undefined') return true;

	if (field == 'animprxs' && value == '') value = 100;

	value = parseFloat(value);
	value_show = value;

	if (field == 'opacity') value_show = value_show * 100;
	if (field == 'animscale') value_show = value_show * 100;
	if (field === 'effectsvalue') {
		var filterData = elem__getFieldValue($el, 'effects');
		var filterInfo;
		if (filterData) {
			filterData = tn_parseCSSFilter(filterData);
			value_show = filterData ? filterData.value : 0;
			filterInfo = tn_getFiltersInfo(filterData.type);
		} else {
			value_show = 0;
		}

		value = value_show;
	}

	if (isNaN(value_show)) value_show = 0;

	if (field == 'lineheight') label = 'spacing';
	if (field == 'letterspacing') label = '';
	if (field == 'width') label = 'w';
	if (field == 'fontsize') label = 'size';
	if (field == 'speedhover') label = 'Duration';
	if (field == 'animduration') label = 'Duration';
	if (field == 'animdelay') label = 'Delay';
	if (field == 'animdistance') label = 'Distance';
	if (field == 'animscale') label = 'Scale';
	if (field == 'animtriggeroffset') label = 'Trigger Offset';
	if (field == 'animprxs') label = 'Speed, %';
	if (field == 'animprxdx') label = 'Dist X, px';
	if (field == 'animprxdy') label = 'Dist Y, px';
	if (field == 'animfixdist') label = 'Distance';
	if (field == 'animfixtrgofst') label = 'Trigger offset';
	if (field == 'tipwidth') label = 'Width';
	if (field == 'tipradius') label = 'Corner Radius';
	if (field == 'tipshadowblur') label = 'Shadow blur';
	if (field == 'sbstrgofst') label = 'Trigger Offset';
	if (field == 'effectsvalue') label = 'Eff. value';
	if (field == 'variationweight') label = 'Custom Weight';

	// form style
	if (field == 'inputfontsize') label = 'Input font size';
	if (field == 'inputtitlefontsize') label = 'Input title font size';
	if (field == 'inputelsfontsize') label = 'Checkbox label font size';
	if (field == 'buttonfontsize') label = 'Btn font size';
	if (field == 'inputvariationweight') label = 'Input Custom Weight';
	if (field == 'inputtitlevariationweight') label = 'Input Title Custom Weight';
	if (field == 'inputelsvariationweight') label = 'Checkbox Label Custom Weight';
	if (field == 'buttonvariationweight') label = 'Btn Custom Weight';

	str += '<table class="sui-control-slider" style="width:100%;"><tr><td>';

	if (label != '') {
		if (field == 'animduration') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" style="margin-left:0px;padding-left:0px;" data-tooltip="Animation duration in seconds. E.g., 1 sec."/>' +
				'</label>';
		} else if (field == 'animdelay') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Delay the start of the animation after <br /> it is applied, in seconds. E.g., 0 sec."/>' +
				'</label>';
		} else if (field == 'animdistance') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Distance in pixels. E.g., 100 px."/>' +
				'</label>';
		} else if (field == 'animscale') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Start scale animation value in percent. E.g., 90%."/>' +
				'</label>';
		} else if (field == 'animtriggeroffset') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Add an offset at the start of the element <br /> animation relative to the selected trigger."/>' +
				'</label>';
		} else if (field == 'animprxs') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Element will scroll faster or slower than the page. <br>Value > 100% — faster, value < 100% — slower."/>' +
				'</label>';
		} else if (field == 'animfixtrgofst') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Offset helps to add some indent <br>between window border and fixed element."/>' +
				'</label>';
		} else if (field == 'animfixdist') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="The element will remain fixed until the page <br /> is scrolled the specified distance. E.g., 300px"/>' +
				'</label>';
		} else if (field == 'effectsvalue') {
			var units = '';
			var tooltip = '';
			if (filterInfo) units = filterInfo.units;
			if (filterData && filterData.isBackdrop) {
				units = '<br />' + units;
				tooltip =
					'<div class="sui-label-ask tooltip" data-tooltip="To apply background effects, set element opacity. <br /> Background effects are not supported by Firefox <br /> browser."/>';
			}
			str += '<label class="sui-label">' + label + ', ' + units + tooltip + '</label>';
		} else {
			str += '<label class="sui-label">' + label + '</label>';
		}
	}

	str +=
		'</td>' +
		'<td style="width:100%;min-width:50px;">' +
		'<div class="sui-input-slider-div">' +
		'<input type="text" value="' +
		value_show +
		'" name="' +
		field +
		'" class="sui-input" autocomplete="off">' +
		'</div>' +
		'<div class="sui-slider-relwrapper">' +
		'<div class="sui-slider-abswrapper">' +
		'<div class="sui-slider"></div>' +
		'</div>' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$inp = $('.tn-settings [name=' + field + ']');

	if (field == 'fontsize' || field == 'inputfontsize' || field == 'inputtitlefontsize' || field == 'buttonfontsize') {
		min = 10;
		max = 100;
		step = 1;
	}

	if (
		field == 'variationweight' ||
		field == 'inputvariationweight' ||
		field == 'inputtitlevariationweight' ||
		field == 'inputelsvariationweight' ||
		field == 'buttonvariationweight'
	) {
		min = 100;
		max = 1000;
		step = 10;
	}

	if (field == 'width') {
		widthunits = elem__getFieldValue($el, 'widthunits');

		if (widthunits == '%') {
			min = 1;
			max = 100;
			step = 5;
		} else {
			min = 10;
			max = 1200;
			step = 10;
		}
	}

	if (field == 'opacity') {
		min = 0;
		max = 100;
		step = 5;
	}

	if (field == 'rotate') {
		min = 0;
		max = 360;
		step = 45;
	}

	if (field == 'letterspacing') {
		min = 0;
		max = 3;
		step = 0.5;
	}

	if (field == 'lineheight') {
		min = 1;
		max = 2;
		step = 0.05;
	}

	if (field == 'animprxs') {
		min = 50;
		max = 200;
		step = 10;
	}

	if (field == 'animprxdx') {
		min = 0;
		max = 300;
		step = 10;
	}

	if (field == 'animprxdy') {
		min = 0;
		max = 300;
		step = 10;
	}

	if (field == 'animduration') {
		min = 0;
		max = 3;
		step = 0.1;
	}

	if (field == 'animdelay') {
		min = 0;
		max = 3;
		step = 0.1;
	}

	if (field == 'animdistance') {
		min = 0;
		max = 300;
		step = 50;
	}

	if (field == 'animscale') {
		min = 0;
		max = 200;
		step = 5;
	}

	if (field == 'animtriggeroffset') {
		min = 0;
		max = 500;
		step = 50;
	}

	if (field == 'animfixdist') {
		min = 0;
		max = 500;
		step = 10;
	}

	if (field == 'animfixtrgofst') {
		min = 0;
		max = 500;
		step = 10;
	}

	if (field == 'speedhover') {
		min = 0;
		max = 1;
		step = 0.1;
	}

	if (field == 'tipwidth') {
		min = 200;
		max = 320;
		step = 5;
	}

	if (field == 'tipradius') {
		min = 0;
		max = 40;
		step = 1;
	}
	if (field == 'tipshadowblur') {
		min = 0;
		max = 30;
		step = 1;
	}

	if (field == 'sbstrgofst') {
		min = 0;
		max = 500;
		step = 50;
	}

	if (field == 'effectsvalue') {
		min = filterInfo && filterInfo.slider ? filterInfo.slider.min : 0;
		max = filterInfo && filterInfo.slider ? filterInfo.slider.max : 0;
		step = filterInfo && filterInfo.slider ? filterInfo.slider.step : 0;
	}

	setTimeout(function () {
		$c.find('.sui-slider').slider({
			range: 'max',
			min: min,
			max: max,
			step: step,
			value: value_show,
			start: function () {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				$c.removeClass('sui-form-group_undefined');
			},
			slide: function (event, ui) {
				var v = ui.value;
				var $element;
				var eltype;

				$inp.val(v);
				$inp.closest('.sui-form-group').attr('data-control-value', v);

				if (field == 'opacity' && v != 1 && v != 0) v = v / 100;
				if (field == 'animscale' && v != 1 && v != 0) v = v / 100;
				if (
					field === 'effectsvalue' ||
					field === 'variationweight' ||
					field === 'inputvariationweight' ||
					field === 'inputtitlevariationweight' ||
					field === 'inputelsvariationweight' ||
					field === 'buttonvariationweight'
				) {
					$inp.trigger('change');
					return;
				}

				if (!window.tn.multi_edit) {
					elem__setFieldValue($el, field, v);
					elem__renderViewOneField($el, field);
				} else {
					for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
						$element = $(window.tn.multi_edit_elems[i]);
						elem__setFieldValue($element, field, v);
						elem__renderViewOneField($element, field);
					}
				}

				tn_setOutlinePosition('selected');

				window.tn_flag_settings_ui_focus = false;

				tn_set_lastChanges();

				eltype = $el.attr('data-elem-type');

				if (eltype == 'form') {
					if (!window.tn.multi_edit) {
						elem__renderForm($el);
					} else {
						for (var j = 0; j < window.tn.multi_edit_elems.length; j++) {
							$element = $(window.tn.multi_edit_elems[j]);
							elem__renderForm($element);
						}
					}
				}
			},
		});

		$('.sui-slider .ui-slider-handle').unbind('keydown');
	}, 1);

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$c.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	$inp.keydown(function (e) {
		var di;
		var de;
		var v;

		window.tn_flag_settings_ui_focus = true;

		if (field !== '') {
			if (e.which == 38 || e.which == 40) {
				if (e.which == 38) {
					di = +1;
				} else {
					di = -1;
				}

				de = 1;

				if (field == 'lineheight') de = 0.05;
				if (field == 'letterspacing') de = 0.5;
				if (field == 'opacity') de = 5;
				if (field == 'animscale') de = 5;
				if (field == 'tipwidth') de = 5;
				if (field == 'animprxs') de = 10;

				v = parseFloat($inp.val());
				v = v + de * di;
				v = Math.round(v * 100) / 100;

				if (field == 'width') {
					if (v < 0) v = 0;
				}
				if (field == 'opacity') {
					if (v > 100) v = 100;
					if (v < 0) v = 0;
				}
				if (
					field == 'fontsize' ||
					field == 'inputfontsize' ||
					field == 'inputtitlefontsize' ||
					field == 'inputelsfontsize' ||
					field == 'buttonfontsize'
				) {
					if (v > 500) v = 500;
					if (v < 8) v = 8;
				}
				if (
					field === 'variationweight' ||
					field === 'inputvariationweight' ||
					field === 'inputtitlevariationweight' ||
					field === 'inputelsvariationweight' ||
					field === 'buttonvariationweight'
				) {
					v = parseInt(v, 10);
					if (v > 1000) v = 1000;
					if (v < 100) v = 100;
				}
				if (field == 'lineheight') {
					if (v > 10) v = 10;
					if (v < 0) v = 0;
				}
				if (field == 'letterspacing') {
					if (v > 50) v = 50;
					if (v < -50) v = -50;
				}
				if (field == 'rotate') {
					if (v > 359) v = 0;
					if (v < 0) v = 0;
				}
				if (field == 'animduration') {
					if (v < 0) v = 0;
				}
				if (field == 'animdelay') {
					if (v < 0) v = 0;
				}
				if (field == 'animdistance') {
					if (v < 0) v = 0;
				}
				if (field == 'animscale') {
					if (v > 2000) v = 2000;
					if (v < 0) v = 0;
				}
				if (field == 'animprxs') {
					if (v > 200) v = 200;
					if (v < 50) v = 50;
				}
				if (field == 'animprxdx') {
					if (v < 0) v = 0;
				}
				if (field == 'animprxdy') {
					if (v < 0) v = 0;
				}
				if (field == 'animfixdist') {
					if (v < 0) v = 0;
				}
				if (field == 'animfixtrgofst') {
					if (v < -2000) v = -2000;
				}
				if (field == 'tipwidth') {
					if (v > 320) v = 320;
					if (v < 200) v = 200;
				}
				if (field == 'tipradius') {
					if (v > 100) v = 100;
					if (v < 0) v = 0;
				}
				if (field == 'tipshadowblur') {
					if (v > 100) v = 100;
					if (v < 0) v = 0;
				}
				if (field == 'effectsvalue' && filterInfo && filterInfo.slider) {
					if (v > filterInfo.slider.max) v = filterInfo.slider.max;
					if (v < filterInfo.slider.min) v = filterInfo.slider.min;
				}

				$inp.val(v);
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
		var $el = $('#' + elem_id);
		var v = $(this).val();
		var vv = tn_calculateInputNumber(v);
		var tv;
		var $element;
		var eltype;

		// del value in mobile res if empty string
		if (window.tn.curResolution != window.tn.topResolution && v == '') {
			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			elem__delFieldValue($el, field, '', 'render', 'updateui');

			tv = elem__getFieldValue($el, field);

			$(this).closest('.sui-form-group').attr('data-control-value', tv);
			tn_set_lastChanges();

			return;
		}

		if (field == 'opacity') {
			if (vv > 100) vv = 100;
			if (vv < 0) vv = 0;
		}
		if (field == 'rotate') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 0;
			if (vv > 359) vv = 0;
			if (vv < 0) vv = 0;
			$inp.val(vv);
		}
		if (
			field == 'fontsize' ||
			field == 'inputfontsize' ||
			field == 'inputtitlefontsize' ||
			field == 'inputelsfontsize' ||
			field == 'buttonfontsize'
		) {
			if (vv > 500) vv = 500;
			if (vv < 8) vv = 8;
		}
		if (
			field === 'variationweight' ||
			field === 'inputvariationweight' ||
			field === 'inputtitlevariationweight' ||
			field === 'inputelsvariationweight' ||
			field === 'buttonvariationweight'
		) {
			vv = parseInt(vv, 10);
			if (vv > 1000) vv = 1000;
			if (vv < 100) vv = 100;
		}
		if (field == 'lineheight') {
			if (vv > 10) vv = 10;
			if (vv < 0) vv = 0;
		}
		if (field == 'letterspacing') {
			if (vv > 50) vv = 50;
			if (vv < -50) vv = -50;
		}
		if (field == 'width') {
			if (vv < 1) vv = 1;
		}
		if (field == 'animduration') {
			if (vv > 10) vv = 10;
			if (vv < 0) vv = 0;
		}
		if (field == 'animdelay') {
			if (vv > 10) vv = 10;
			if (vv < 0) vv = 0;
		}
		if (field == 'animdistance') {
			if (vv > 1000) vv = 1000;
			if (vv < 0) vv = 0;
		}
		if (field == 'animscale') {
			if (vv > 500) vv = 500;
			if (vv < 0) vv = 0;
		}
		if (field == 'animtriggeroffset') {
			if (vv > 1000) vv = 1000;
			if (vv < -1000) vv = -1000;
		}
		if (field == 'animprxs') {
			if (vv > 200) vv = 200;
			if (vv < 50) vv = 50;
		}
		if (field == 'animprxdx') {
			if (vv < -500) vv = -500;
		}
		if (field == 'animprxdy') {
			if (vv < -500) vv = -500;
		}
		if (field == 'animfixdist') {
			if (vv < 0) vv = 0;
		}
		if (field == 'animfixtrgofst') {
			if (vv < -500) vv = -500;
		}
		if (field == 'tipwidth') {
			if (vv > 320) vv = 320;
			if (vv < 200) vv = 200;
		}
		if (field == 'tipradius') {
			if (vv > 100) vv = 100;
			if (vv < 0) vv = 0;
		}
		if (field == 'tipshadowblur') {
			if (vv > 100) vv = 100;
			if (vv < 0) vv = 0;
		}
		if (field == 'sbstrgofst') {
			if (vv > 1000) vv = 1000;
			if (vv < -1000) vv = -1000;
		}
		if (field == 'speedhover') {
			if (vv > 1) vv = 1;
			if (vv < 0) vv = 0;
			$inp.val(vv);
		}

		if (field == 'width') {
			if (isNaN(vv)) {
				vv = 1;
			} else {
				vv = parseInt(vv.toFixed(0), 10);
			}
			$inp.val(vv);
		}
		if (
			field == 'fontsize' ||
			field == 'inputfontsize' ||
			field == 'inputtitlefontsize' ||
			field == 'inputelsfontsize' ||
			field == 'buttonfontsize'
		) {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 10;
			$inp.val(vv);
		}
		if (
			field === 'variationweight' ||
			field === 'inputvariationweight' ||
			field === 'inputtitlevariationweight' ||
			field === 'inputelsvariationweight' ||
			field === 'buttonvariationweight'
		) {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 400;
			$inp.val(vv);
		}
		if (field == 'lineheight') {
			if (isNaN(vv)) vv = 1.55;
			$inp.val(vv);
		}
		if (field == 'letterspacing') {
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'opacity') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 100;
			$inp.val(vv);
		}
		if (field == 'animduration') {
			vv = parseFloat(vv);
			if (isNaN(vv)) vv = 1;
			$inp.val(vv);
		}
		if (field == 'animdelay') {
			vv = parseFloat(vv);
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'animdistance') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 100;
			$inp.val(vv);
		}
		if (field == 'animtriggeroffset') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'animscale') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 90;
			$inp.val(vv);
		}
		if (field == 'animprxs') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 100;
			$inp.val(vv);
		}
		if (field == 'animprxdx') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 1;
			$inp.val(vv);
		}
		if (field == 'animprxdy') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 1;
			$inp.val(vv);
		}
		if (field == 'animfixdist') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 1;
			$inp.val(vv);
		}
		if (field == 'animfixtrgofst') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 1;
			$inp.val(vv);
		}
		if (field == 'tipwidth') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 200;
			$inp.val(vv);
		}
		if (field == 'tipradius') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'tipshadowblur') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'sbstrgofst') {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 0;
			$inp.val(vv);
		}
		if (field == 'effectsvalue' && filterInfo && filterInfo.slider) {
			vv = parseInt(vv, 10);
			if (isNaN(vv)) vv = 0;
			if (vv > filterInfo.slider.max) vv = filterInfo.slider.max;
			if (vv < filterInfo.slider.min) vv = filterInfo.slider.min;
			$inp.val(vv);
		}

		v = vv;

		tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

		$c.find('.sui-slider').slider('value', vv);

		if (field == 'opacity') v = v / 100;
		if (field == 'animscale') v = v / 100;

		$(this).closest('.sui-form-group').attr('data-control-value', v);

		if (field === 'effectsvalue') {
			var filterString;
			var effectData;
			var effectName;

			if (!window.tn.multi_edit) {
				filterString = elem__getFieldValue($el, 'effects');
				effectData = tn_parseCSSFilter(filterString);
				effectName = effectData.type;

				if (effectData.isBackdrop) effectName = 'bd_' + effectName;
				filterString = tn_generateFilter(effectName, v);
				elem__setFieldValue($el, 'effects', filterString, 'render');
			} else {
				for (var j = 0; j < window.tn.multi_edit_elems.length; j++) {
					$element = $(window.tn.multi_edit_elems[j]);
					filterString = elem__getFieldValue($element, 'effects');
					effectData = tn_parseCSSFilter(filterString);
					effectName = effectData.type;

					if (effectData.isBackdrop) effectName = 'bd_' + effectName;
					filterString = tn_generateFilter(effectName, v);
					elem__setFieldValue($element, 'effects', filterString, 'render');
				}
			}
		} else {
			if (!window.tn.multi_edit) {
				elem__setFieldValue($el, field, v);
				elem__renderViewOneField($el, field);
			} else {
				for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
					$element = $(window.tn.multi_edit_elems[i]);
					elem__setFieldValue($element, field, v);
					elem__renderViewOneField($element, field);
				}
			}
		}

		tn_setOutlinePosition('selected');

		$c.removeClass('sui-form-group_undefined');
		tn_set_lastChanges();

		eltype = $el.attr('data-elem-type');

		if (eltype == 'form') {
			if (!window.tn.multi_edit) {
				elem__renderForm($el);
			} else {
				for (var j = 0; j < window.tn.multi_edit_elems.length; j++) {
					$element = $(window.tn.multi_edit_elems[j]);
					elem__renderForm($element);
				}
			}
		}
	});

	if (window.tn.multi_edit && !isCopiedAnimation) {
		var isMixed = control__drawUi__getMixedState(field);

		if (isMixed) {
			$inp.val('Mixed');
		}

		$inp.focus(function () {
			if ($inp.val() === 'Mixed') {
				$inp.val('');
			}
		});

		$inp.blur(function () {
			if (!$inp.val()) {
				$inp.val('Mixed');
			}
		});
	}
}
