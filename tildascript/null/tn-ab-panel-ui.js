function ab__control__drawUi__input(field) {
	var $controlField = $('[data-control-field="' + field + '"]');
	var value = $controlField.attr('data-control-value');
	if (field === 'height') value = parseInt(value, 10) || 0;
	var withLock = field === 'columngutter' || field === 'columnmargins' || field === 'columnwidth';

	var str = '';
	var link;
	var label = field;

	if (field === 'bgcolor') label = 'Bg&nbsp;color';
	if (field === 'filtercolor') label = 'Filter start';
	if (field === 'filtercolor2') label = 'Filter end';
	if (field === 'height_vh') label = 'Window Container Height, %';
	if (field === 'height') label = 'Grid Container Height, px';

	// grid settings
	if (field == 'columns') label = 'Columns';
	if (field == 'columngutter') label = 'Column gutter, px';
	if (field == 'columnmargins') label = 'Column margins, px';
	if (field == 'columnwidth') label = 'Column width, px';
	if (field == 'rowbaseline') label = 'Row baseline, px';
	if (field == 'rowmoduleheight') label = 'Module height';
	if (field == 'rowmargins') label = 'Row Margins, px';
	if (field == 'gridcolor') label = 'Color';

	str += '<table style="width:100%;"><tr><td>';

	if (field === 'height') {
		link = "<a href='https://help.tilda.ws/zero-block-advanced#grid' target='_blank'>Learn more</a>";
		str +=
			'<label class="sui-label" style="width:230px;">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="Set the height of the grid workspace. <br /> This will be the block height if the window <br /> container height is not specified. ' +
			link +
			'"/></label>';
		str += '</td></tr><tr><td style="width:100%;">';
	} else if (field === 'height_vh') {
		link = "<a href='https://help.tilda.ws/zero-block-advanced#window' target='_blank'>Learn more</a>";
		str +=
			'<label class="sui-label" style="width:230px;">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="Set the block height as a percentage of the <br /> window (viewport) height on the visitor&apos;s device. <br /> The window container allows you to fix elements&apos; <br /> position regardless of the screen size. ' +
			link +
			'"/></label>';
		str += '</td></tr><tr><td style="width:100%;">';
	} else {
		str += '<label class="sui-label">' + label + '</label>';
		str += '</td><td style="width:100%;">';
	}

	str += '<div class="sui-input-div">';
	str +=
		'<input type="text" value="' +
		value +
		'" name="' +
		field +
		'" class="sui-input" ' +
		(field === 'height_vh' ? 'placeholder="ex:100"' : '') +
		'>';
	if (withLock)
		str +=
			'<div class="sui-layer__lock__icon tooltip tooltipstered" data-tooltip="Column Width, Gutter, and Margins fields are linked <br/> and are calculated automatically depending on the <br /> values you enter. For example, if you change <br /> the Column Width, the new Gutter will be calculated <br /> automatically. To lock one of the parameters, click <br /> the lock icon in the input field."></div>';
	str += '</div>';
	str += '</td>';
	str += '</tr></table>';

	$controlField.html(str);

	if (field === 'bgcolor' && tn_isGradientJSON(tn_replaceSingleQuotes(value))) {
		$controlField.find('.sui-input').attr('value', tn_replaceSingleQuotes(value));
	}

	var $inp = $('.tn-settings [name=' + field + ']');
	var $ab = $('.tn-artboard');

	if (field === 'filtercolor' || field === 'filtercolor2') {
		$controlField.find('.sui-input-div').css('width', '110px');
	}

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$controlField.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	if (withLock) {
		var $lockBtn = $controlField.find('.sui-layer__lock__icon');
		var isLocked = localStorage.getItem('tzerogridlock') === field;

		if (isLocked) $lockBtn.addClass('sui-layer__lock__icon_locked');

		$lockBtn.click(function () {
			var lockingFields = ['columngutter', 'columnmargins', 'columnwidth'];
			isLocked = localStorage.getItem('tzerogridlock') === field;

			if (isLocked) {
				lockingFields.forEach(function (name) {
					var $lockingControlField = $('[data-control-field="' + name + '"]');
					$lockingControlField.find('.sui-layer__lock__icon_hidden').removeClass('sui-layer__lock__icon_hidden');
				});
			} else {
				lockingFields.forEach(function (name) {
					if (name !== field) {
						var $lockingControlField = $('[data-control-field="' + name + '"]');
						$lockingControlField.find('.sui-layer__lock__icon').addClass('sui-layer__lock__icon_hidden');
					}
				});
			}

			localStorage.setItem('tzerogridlock', isLocked ? '' : field);
			$lockBtn.toggleClass('sui-layer__lock__icon_locked');
		});
	}

	$inp.keydown(function (e) {
		window.tn_flag_settings_ui_focus = true;
		if (field !== 'bgcolor' && field !== 'filtercolor' && field !== 'filtercolor2' && field !== 'gridcolor') {
			if (e.which == 38) {
				var value = parseFloat($inp.val());
				if (isNaN(value)) value = 0;
				value = value + 1;
				$inp.val(value);
				$inp.trigger('change');
			}
			if (e.which == 40) {
				value = parseFloat($inp.val());
				if (isNaN(value)) value = 0;
				value = value - 1;
				if (field === 'width' && value < 0) value = 0;
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
		var v = $inp.val();
		var isGradient;
		var isHexColor;

		if (field === 'gridcolor' || field === 'gridopacity' || field === 'gridlineopacity') {
			ab__setFieldValue($ab, field, v);
			ab__renderGrid();
			if (field === 'gridcolor') {
				var isLocalGrid = ab__getFieldValue($ab, 'gridglobal') === 'block';
				if (isLocalGrid) ab_setGridLocalProps();
			}
		} else if (window.tn.grid_fields.indexOf(field) >= 0) {
			v = tn_calculateInputNumber(v);

			if (field === 'rowbaseline') {
				v = parseInt(v, 10);
				if (isNaN(v) || v <= 0) v = '';
				if (v > 100) v = 100;
				$inp.val(v);
			}

			if (field === 'rowmoduleheight') {
				v = parseInt(v, 10);
				if (isNaN(v) || v <= 0) v = '';
				if (v > 100) v = 100;
				$inp.val(v);
			}

			if (field === 'rowmargins') {
				v = parseInt(v, 10);
				if (isNaN(v) || v <= 0) v = '';
				if (v > 1000) v = 1000;
				$inp.val(v);
			}

			if (field === 'columns') {
				if (isNaN(v) || v <= 0) v = 1;
				if (v > 24) v = 24;
				$inp.val(v);
			}

			if (field === 'columnwidth') {
				if (isNaN(v) || v <= 0) v = 1;
				if (v > 1200) v = 1200;
				$inp.val(v);
			}

			if (field === 'columnmargins') {
				if (isNaN(v) || v < 0) v = 0;
				if (v > 500) v = 500;
				$inp.val(v);
			}

			if (field === 'columngutter') {
				if (isNaN(v) || v < 0) v = 0;
				if (v > 1000) v = 1200;
				$inp.val(v);
			}

			ab__changeGridValue($ab, field, v);
			ab__renderGrid();
		} else {
			if (field !== 'bgcolor') {
				tn_undo__Add('ab_save');
				tn_set_lastChanges();
			}
			/* del value in mobile res if empty string */
			var exceptFields = ['height_vh', 'bgcolor'];
			if (window.tn.curResolution !== window.tn.topResolution && v == '' && exceptFields.indexOf(field) === -1) {
				ab__setFieldValue($ab, field, undefined);
				v = ab__getFieldValue($ab, field);
				$inp.closest('.sui-form-group').attr('data-control-value', v);
				$controlField.addClass('sui-form-group_undefined');
			} else {
				/* main */
				if (field === 'height') {
					v = tn_calculateInputNumber(v);
					if (isNaN(v)) v = 1;
					if (v < 0) v = 1;
					$inp.val(v);
				}

				if (field === 'height_vh') {
					v = tn_calculateInputNumber(v);
					if (isNaN(v)) v = '';
					$inp.val(v);
				}

				if (field !== 'filtercolor' && field !== 'filtercolor2') {
					ab__setFieldValue($ab, field, v);
				}
				$inp.closest('.sui-form-group').attr('data-control-value', v);
				$controlField.removeClass('sui-form-group_undefined');
			}

			if (field == 'height' || field == 'height_vh') {
				ab__renderViewOneField(field);
				updateTNobj();
				allelems__renderView();
				allguides__renderView();
				tn_drawguides_updateHeight();
			} else {
				ab__renderViewOneField(field);
			}

			/* check correct color A*/
			if (field == 'bgcolor' || field == 'filtercolor' || field == 'filtercolor2') {
				if (v != '' && typeof v !== 'undefined') {
					isGradient = tn_isGradientJSON(v);

					if (!isGradient) {
						if (v.indexOf('#') == -1) {
							v = '#' + v;
							$inp.val(v);
						}

						v = v.toLowerCase().replace(/[^a-fA-F0-9#]+/g, '');

						if (v !== v) $inp.val(v);

						isHexColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(v);

						if (!isHexColor) v = '';
					} else {
						$inp.val(v);
					}

					var oldValue = ab__getFieldValue($ab, field);
					if (field == 'bgcolor' && tn_replaceDoubleQuotes(v) !== tn_replaceDoubleQuotes(oldValue)) {
						tn_undo__Add('ab_save');
						tn_set_lastChanges();
						ab__setFieldValue($ab, field, v);
						ab__renderViewOneField(field);
					} else if (field == 'filtercolor' || field == 'filtercolor2') {
						ab__setFieldValue($ab, field, v);
						ab__renderViewOneField(field);
					}
				} else if (v === '' && (field == 'filtercolor' || field == 'filtercolor2')) {
					ab__setFieldValue($ab, field, v);
					ab__renderViewOneField(field);
				}
			}
		}
	});

	if (field == 'bgcolor' || field == 'filtercolor' || field == 'filtercolor2' || field == 'gridcolor') {
		tn_initMinicolors($inp, field, value);
	}

	if (field == 'width') $controlField.css('display', 'none');
}

function ab__control__drawUi__selectbox(field, onChange) {
	var $control = $('[data-control-field=' + field + ']');
	var value = $control.attr('data-control-value');

	var str = '';
	var label = field;

	if (field == 'bgattachment') label = 'Behavior';
	if (field == 'bgposition') label = 'Position';
	if (field == 'filteropacity' || field == 'filteropacity2') label = '';
	if (field == 'valign') label = 'grid container align in window';
	if (field == 'ovrflw') label = 'Overflow';
	if (field == 'isolation') label = 'Z-index';
	if (field == 'gridhide') label = 'Visibility';
	if (field == 'upscale') label = 'Scale grid container (Beta)';
	if (field == 'gridglobal') label = 'Use for';
	if (field == 'themecolor') label = 'Color';
	if (field == 'themesize') label = 'Size';

	// Grid settings
	if (field == 'gridopacity') label = 'Opacity';
	if (field == 'gridlineopacity') label = 'Border opacity';

	str += '<table style="width:100%;"><tr>';
	str += '<td>';

	if (field == 'valign') {
		if (label != '') str += '<label class="sui-label" style="width:230px;">' + label + '</label>';
		str += '</td></tr><tr><td class="sui-form-group-td-minwidth-60">';
	} else if (field === 'ovrflw') {
		var isTester = window.userrole === 'tester';
		var styleWidth = !isTester ? 'style="width:230px;"' : '';
		var separator = !isTester ? '</tr><tr>' : '';
		if (label != '')
			str +=
				'<label class="sui-label"' +
				styleWidth +
				'>' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Use this option to overlay elements outside <br /> of this block on the next or previous block."/>' +
				'</label>';
		str += '</td>' + separator + '<td class="sui-form-group-td-minwidth-60">';
	} else if (field === 'isolation') {
		if (label != '')
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="This option isolates this Zero Block <br /> elements Z-index (stack order of elements) <br /> from the Z-index of the Block Library elements. <br /> Use it to prevent elements of this block to overlap  <br /> on another blocks on the page.  It\'s may be useful <br /> when your Zero has a lot of elements."/>' +
				'</label>';
		str += '</td><td class="sui-form-group-td-minwidth-60">';
	} else if (field === 'gridglobal') {
		str +=
			'<label class="sui-label">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="The grid settings apply to the entire project and <br /> will be available in all blocks on this website. <br /> If you want to set the grid exclusively for this block, <br /> set it to &quot;Current block&quot;."/>' +
			'</label>';
		str += '</td><td class="sui-form-group-td-minwidth-60">';
	} else if (field === 'upscale') {
		if (label != '')
			str +=
				'<label class="sui-label" style="width:230px;">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Enable this option to scale the element width to 100% <br /> screen size in the current screen width range. <br /> The option will only be applied to elements attached <br /> to the grid container. If the element is attached to <br /> a window container, its width will remain unchanged."/>' +
				'</label>';
		str += '</td></tr><tr><td class="sui-form-group-td-minwidth-60">';
	} else {
		if (label != '') str += '<label class="sui-label">' + label + '</label>';
		str += '</td><td class="sui-form-group-td-minwidth-60">';
	}

	str += '<div class="sui-select">';

	str += '<select class="sui-input sui-select" name="' + field + '">';

	if (field === 'bgattachment') {
		str += '<option value="scroll"' + (value == 'scroll' ? ' selected="selected"' : '') + '>Scroll</option>';
		str += '<option value="fixed"' + (value == 'fixed' ? ' selected="selected"' : '') + '>Fixed</option>';
	}

	if (field === 'bgposition') {
		str += '<option value="left top" ' + (value == 'left top' ? 'selected="selected"' : '') + '>Left Top</option>';
		str +=
			'<option value="center top" ' + (value == 'center top' ? 'selected="selected"' : '') + '>Center Top</option>';
		str += '<option value="right top" ' + (value == 'right top' ? 'selected="selected"' : '') + '>Right Top</option>';
		str +=
			'<option value="left center" ' + (value == 'left center' ? 'selected="selected"' : '') + '>Left Center</option>';
		str +=
			'<option value="center center" ' +
			(value == 'center center' ? 'selected="selected"' : '') +
			'>Center Center</option>';
		str +=
			'<option value="right center" ' +
			(value == 'right center' ? 'selected="selected"' : '') +
			'>Right Center</option>';
		str +=
			'<option value="left bottom" ' + (value == 'left bottom' ? 'selected="selected"' : '') + '>Left Bottom</option>';
		str +=
			'<option value="center bottom" ' +
			(value == 'center bottom' ? 'selected="selected"' : '') +
			'>Center Bottom</option>';
		str +=
			'<option value="right bottom" ' +
			(value == 'right bottom' ? 'selected="selected"' : '') +
			'>Right Bottom</option>';
	}

	if (
		field === 'filteropacity' ||
		field === 'filteropacity2' ||
		field === 'gridopacity' ||
		field === 'gridlineopacity'
	) {
		str += '  <option value="1" ' + (value == '1' ? 'selected="selected"' : '') + '>100%</option>';
		str += '  <option value="0.95" ' + (value == '0.95' ? 'selected="selected"' : '') + '>95%</option>';
		str += '  <option value="0.9" ' + (value == '0.9' ? 'selected="selected"' : '') + '>90%</option>';
		str += '  <option value="0.85" ' + (value == '0.85' ? 'selected="selected"' : '') + '>85%</option>';
		str += '  <option value="0.8" ' + (value == '0.8' ? 'selected="selected"' : '') + '>80%</option>';
		str += '  <option value="0.75" ' + (value == '0.75' ? 'selected="selected"' : '') + '>75%</option>';
		str += '  <option value="0.7" ' + (value == '0.7' ? 'selected="selected"' : '') + '>70%</option>';
		str += '  <option value="0.65" ' + (value == '0.65' ? 'selected="selected"' : '') + '>65%</option>';
		str += '  <option value="0.6" ' + (value == '0.6' ? 'selected="selected"' : '') + '>60%</option>';
		str += '  <option value="0.55" ' + (value == '0.55' ? 'selected="selected"' : '') + '>55%</option>';
		str += '  <option value="0.5" ' + (value == '0.5' ? 'selected="selected"' : '') + '>50%</option>';
		str += '  <option value="0.45" ' + (value == '0.45' ? 'selected="selected"' : '') + '>45%</option>';
		str += '  <option value="0.4" ' + (value == '0.4' ? 'selected="selected"' : '') + '>40%</option>';
		str += '  <option value="0.35" ' + (value == '0.35' ? 'selected="selected"' : '') + '>35%</option>';
		str += '  <option value="0.3" ' + (value == '0.3' ? 'selected="selected"' : '') + '>30%</option>';
		str += '  <option value="0.25" ' + (value == '0.25' ? 'selected="selected"' : '') + '>25%</option>';
		str += '  <option value="0.2" ' + (value == '0.2' ? 'selected="selected"' : '') + '>20%</option>';
		str += '  <option value="0.15" ' + (value == '0.15' ? 'selected="selected"' : '') + '>15%</option>';
		str += '  <option value="0.1" ' + (value == '0.1' ? 'selected="selected"' : '') + '>10%</option>';
		str += '  <option value="0.05" ' + (value == '0.05' ? 'selected="selected"' : '') + '>5%</option>';
		str += '  <option value="0" ' + (value == '0' ? 'selected="selected"' : '') + '>0%</option>';
	}

	if (field === 'valign') {
		str += '  <option value="top" ' + (value == 'top' ? 'selected="selected"' : '') + '>Top</option>';
		str += '  <option value="center" ' + (value == 'center' ? 'selected="selected"' : '') + '>Center</option>';
		str += '  <option value="bottom" ' + (value == 'bottom' ? 'selected="selected"' : '') + '>Bottom</option>';
		str += '  <option value="stretch" ' + (value == 'stretch' ? 'selected="selected"' : '') + '>Stretch</option>';
	}

	if (field === 'ovrflw') {
		str += '  <option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Hidden</option>';
		str += '  <option value="visible" ' + (value == 'visible' ? 'selected="selected"' : '') + '>Visible</option>';
		str += '  <option value="auto" ' + (value == 'auto' ? 'selected="selected"' : '') + '>Auto</option>';
	}

	if (field === 'isolation') {
		str += '  <option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Default</option>';
		str += '  <option value="isolate" ' + (value == 'isolate' ? 'selected="selected"' : '') + '>Isolate</option>';
	}

	if (field === 'gridglobal') {
		str += '  <option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Whole project</option>';
		str += '  <option value="block" ' + (value == 'block' ? 'selected="selected"' : '') + '>Current block</option>';
	}

	if (field === 'upscale') {
		str += '  <option value="grid" ' + (value == 'grid' ? 'selected="selected"' : '') + '>None</option>';
		str +=
			'  <option value="window" ' +
			(value == 'window' ? 'selected="selected"' : '') +
			'>Autoscale to window width</option>';
	}
	if (field === 'themecolor') {
		value = localStorage.getItem('tzerothemecolor');
		str += '  <option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Classic</option>';
		str += '  <option value="light" ' + (value == 'light' ? 'selected="selected"' : '') + '>Light</option>';
		str += '  <option value="dark" ' + (value == 'dark' ? 'selected="selected"' : '') + '>Dark</option>';
	}

	if (field === 'themesize') {
		value = localStorage.getItem('tzerothemesize');
		str += '  <option value="" ' + (value == '' ? 'selected="selected"' : '') + '>Classic</option>';
		str += '  <option value="minimal" ' + (value == 'minimal' ? 'selected="selected"' : '') + '>Minimal</option>';
	}

	str += '</select>';

	str += '</select>';
	str += '</div>';
	str += '</td>';
	str += '</tr></table>';

	$control.html(str);

	if (field === 'filteropacity' || field == 'filteropacity2') {
		$control.find('.sui-input').css('height', '44px');
		$control.find('.sui-select').addClass('sui-select_after_bottom-18');
	}

	if (field === 'ovrflw') tn_addSectionHandlers();

	var $inp = $('.tn-settings [name=' + field + ']');
	var $ab = $('.tn-artboard');

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$control.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	$inp.change(function () {
		var v = $(this).val();
		if (onChange) {
			onChange(v);
		} else {
			if (field === 'gridopacity' || field === 'gridlineopacity') {
				$(this).closest('.sui-form-group').attr('data-control-value', v);
				ab__setFieldValue($ab, field, v);
				var isLocalGrid = ab__getFieldValue($ab, 'gridglobal') === 'block';
				if (isLocalGrid) ab_setGridLocalProps();
				ab__renderGrid();
			} else {
				tn_undo__Add('ab_save');
				$(this).closest('.sui-form-group').attr('data-control-value', v);
				ab__setFieldValue($ab, field, v);
				if (field === 'ovrflw' || field === 'isolation') {
					var overflowValue = field === 'ovrflw' ? v : $('[data-control-field="ovrflw"]').attr('data-control-value');
					var isolationValue =
						field === 'isolation' ? v : $('[data-control-field="isolation"]').attr('data-control-value');
					var hint = $('.sui-form-group__hint_overflow');
					if (overflowValue === 'visible' && isolationValue === 'isolate') {
						hint.css('display', 'block');
					} else {
						hint.css('display', 'none');
					}
				}
				if (field == 'valign') {
					ab__renderViewOneField(field);
					updateTNobj();
					allelems__renderView();
				} else {
					ab__renderViewOneField(field);
				}
			}

			tn_set_lastChanges();
		}

		window.tn_flag_settings_ui_focus = false;
	});
}

function ab__control__drawUi__toggle(field) {
	var $c = $('[data-control-field=' + field.name + ']');
	var value = $c.attr('data-control-value');
	var str = '';

	if (typeof value === 'undefined') return true;
	// prettier-ignore
	str +=
		'<table style="width:100%;">' +
			'<tr>' +
				'<td>' +
					'<label class="sui-label">' + field.label + '</label>' +
				'</td>' +
				'<td style="width:100%;min-width:50px;">' +
					'<div class="sui-toggle-div" name="' + field.name + '" data-toggle-active="' + field.activeAttr + '">' +
						'<input type="checkbox" class="sui-input sui-toggle' + field.activeClass + '"' + field.checkedAttr + '></input>' +
					'</div>' +
				'</div>' +
				'</td>' +
			'</tr>' +
		'</table>';

	$c.html(str);

	var $toggle = $('.tn-settings [data-control-field=' + field.name + ']');
	$toggle.off('click');
	$toggle.on('click', function () {
		var $input = $(this).find('input');
		if ($input.hasClass('sui-toggle_on')) {
			$input.removeClass('sui-toggle_on');
			$input.removeAttr('checked');
		} else {
			$input.addClass('sui-toggle_on');
			$input.attr('checked', 'true');
		}
		if (field.onChange) {
			field.onChange();
		}
	});

	$toggle.off('update');
	$toggle.on('update', function () {
		var $input = $(this).find('input');
		if (field.isActive()) {
			$input.addClass('sui-toggle_on');
			$input.attr('checked', 'true');
		} else {
			$input.removeClass('sui-toggle_on');
			$input.removeAttr('checked');
		}
	});
}

function ab__control__toggle__update(field) {
	var $toggle = $('.tn-settings [name=' + field + ']');
	if ($toggle.length) {
		$toggle.trigger('update');
	}
}

function ab__control__drawUi__upload(field) {
	$(document).ready(function () {
		var $control = $('[data-control-field=' + field + ']');
		var value = $control.attr('data-control-value');

		// prettier-ignore
		var str =
			'<div class="sui-input-upload-div">' +
			'  <input type="text" value="' + value + '" name="' + field + '" class="sui-input">' +
			'</div>' +
			'<table class="sui-file-div"><tr>' +
			'<td style="vertical-align:top;">' +
			'<label class="sui-label">File</label>' +
			'</td><td style="width:100%; vertical-align:top;">' +
			'  <div class="sui-file-label"></div>' +
			'  <div class="sui-btn sui-btn_sm sui-file-del">Delete</div>' +
			'</td>' +
			'</tr></table>';

		$control.html(str);

		var $inp = $('.tn-settings [name=' + field + ']');
		var $ab = $('.tn-artboard');
		var $fdiv = $control.find('.sui-file-div');
		var $flabel = $control.find('.sui-file-label');

		if (value !== '') {
			$flabel.html('...' + value.substr(value.length - 15));
			$fdiv.css('display', 'block');
		} else {
			$flabel.html('');
			$fdiv.css('display', 'none');
		}

		$inp.change(function () {
			var v = $(this).val();

			tn_undo__Add('ab_save');

			$(this).closest('.sui-form-group').attr('data-control-value', v);
			ab__setFieldValue($ab, field, v);
			ab__renderViewOneField(field);

			if (v != '') {
				$flabel.html('...' + v.substr(v.length - 15));
				$fdiv.css('display', 'block');
			} else {
				$flabel.html('');
				$fdiv.css('display', 'none');
			}

			tn_set_lastChanges();
		});

		$control.find('.sui-file-del').click(function () {
			$inp.val('');
			$inp.trigger('change');
		});

		$inp.each(function () {
			var $this = $(this);
			var elementid = $this.attr('id');

			if (!elementid) {
				elementid = 'tuwidget' + parseInt(Math.floor(Math.random() * (999999 - 99999 + 1)) + 99999);
				$this.attr('id', elementid);
			}

			var $inpContainer = $inp.closest('.sui-form-group');
			$inpContainer.addClass('sui-form-group_placeholder-upload');
			setTimeout(function () {
				if ($('.tn-settings[data-for-artboard="artboard"]').length === 0) return;
				if ($('#' + elementid).length === 0) return;
				TUWidget.init($this)
					.done(function (file) {
						tn_undo__Add('ab_save');
						$inp.val(file.tuInfo.cdnUrl);
						$inp.trigger('change');

						setTimeout(function () {
							$('#' + elementid + '-previews')
								.removeClass('tu-popup-progressbar-completed')
								.removeClass('tu-processing')
								.removeClass('tu-image-preview')
								.removeClass('tu-success')
								.removeClass('tu-complete')
								.addClass('tu-popup-progressbar-start');
						}, 3000);
					})
					.fail(function () {});
				$inpContainer.removeClass('sui-form-group_placeholder-upload');
			}, 1);
		});
	});
}
