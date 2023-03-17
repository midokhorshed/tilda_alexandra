function control__drawUi__selectbox(elem_id, field, isCopiedAnimation) {
	var isCurrentResTop = window.tn.curResolution === window.tn.topResolution;
	var isMixed = window.tn.multi_edit && control__drawUi__getMixedState(field);
	var $c = $('[data-control-field=' + field + ']');
	var $el = $('[data-elem-id="' + elem_id + '"]');
	// prettier-ignore
	var isEmptyFieldValue = window.tn.multi_edit && window.tn.multi_edit_common_attrs[field] === '' || elem__getFieldValue($el, field) === '';
	var value = $c.attr('data-control-value');
	var $settings = $('.tn-settings');
	var str = '';
	var label = field;
	var fontexist;
	var type;
	var groups;
	var propVals;
	var $inp;

	if (field === 'sbsevent' && window.tn.multi_edit && value === '' && isMixed) {
		value = 'Mixed';
	}

	if (typeof value === 'undefined') return true;

	if (field == 'fontfamily') label = 'Typeface';
	if (field == 'fontweight') label = 'Weight';
	if (field == 'bgattachment') label = 'Behavior';
	if (field == 'bgposition') label = 'Position';
	if (field == 'borderstyle') label = 'Style';
	if (field == 'linktarget') label = 'Target';
	if (field == 'relnofollow') label = 'Rel nofollow';
	if (field == 'buttonstat') label = 'Click tracking';
	if (field == 'shadowopacity') label = 'Opacity';
	if (field == 'axisx') label = 'Axis X';
	if (field == 'axisy') label = 'Axis Y';
	if (field == 'zoomable') label = 'Zoomable';
	if (field == 'lazyoff') label = 'Lazyload';
	if (field == 'pevent') label = 'Pointer events';
	if (field == 'effectstype') label = 'Effect';
	if (field == 'autoplay') label = 'Autoplay';
	if (field == 'animstyle') label = 'Animation';
	if (field == 'animprx') label = 'Parallax';
	if (field == 'animfix') label = 'Fixing';
	if (field == 'tipposition') label = 'Position';
	if (field == 'tipopen') label = 'Show';
	if (field == 'pinicon') label = 'Icon';
	if (field == 'vidtype') label = 'Type';
	if (field == 'showinfo') label = 'Show info';
	if (field == 'loop') label = 'Loop';
	if (field == 'mute') label = 'Mute';
	if (field == 'autoplay') label = 'Autoplay';
	if (field == 'sbsevent') label = 'Event';
	if (field == 'sbstrg') label = 'Start Trigger';
	if (field == 'sbsloop') label = 'Loop';
	if (field == 'figure') label = 'Shape';

	// form styles
	if (field == 'inputpos') label = 'Form design';
	if (field == 'inputfontfamily') label = 'Font family';
	if (field == 'fieldfontfamily') label = 'Input font family';
	if (field == 'inputfontweight') label = 'Input font weight';
	if (field == 'inputtitlefontweight') label = 'Input title font weight';
	if (field == 'inputelsfontweight') label = 'Checkbox label font weight';
	if (field == 'inputsstyle') label = 'Input style';
	if (field == 'inputsstyle2') label = 'Placeholder style';
	if (field == 'buttonalign') label = 'Btn align';
	if (field == 'buttonfontfamily') label = 'Btn font family';
	if (field == 'buttonfontweight') label = 'Btn font weight';

	// gallery style
	if (field == 'slds_arrowborder') label = 'Border';
	if (field == 'slds_arrowcontrols') label = 'Controls';
	if (field == 'slds_dotscontrols') label = 'Controls';
	if (field == 'slds_cursorcontrol') label = 'Cursor control';
	if (field == 'slds_arrowsize') label = 'Size';
	if (field == 'slds_loop') label = 'Loop';
	if (field == 'slds_speed') label = 'Slide speed';
	if (field == 'slds_arrowbgopacity') label = 'Bg. opacity';
	if (field == 'slds_arrowbgopacityhover') label = 'Hover bg. opacity';
	if (field == 'slds_stretch') label = 'Stretch';
	if (field == 'slds_imgposition') label = 'Position';
	if (field == 'slds_captionwidth') label = 'Caption width';
	if (field == 'slds_arrowalign') label = 'Align';
	if (field == 'slds_arrowtype') label = 'Type';

	if (field == 'formbottomcb') label = 'Show checkbox';

	str += '<table class="sui-control-selectbox" style="width:100%;"><tr><td>';

	if (field != 'leftunits' && field != 'topunits' && field != 'widthunits' && field != 'heightunits') {
		if (field == 'axisx') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Set the origin of axis X">' +
				'</label>';
		} else if (field == 'axisy') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Set the origin of axis Y">' +
				'</label>';
		} else if (field == 'tag') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Tag for SEO">' +
				'</label>';
		} else if (field == 'buttonstat') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Send data to analytics systems when button is clicked.">' +
				'</label>';
		} else if (field == 'fontfamily') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Connect other fonts in <a href=\'/projects/settings/?projectid=' +
				window.projectid +
				"#tab=ss_menu_fonts' target='_blank' style='color:#fff; text-decoration:underline; font-weight:bold;'>Site&nbsp;Settings</a>. \"/>" +
				'</label>';
		} else if (field == 'animfix') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Element will be fixed when it reaches <br /> a trigger: window top, center, or bottom."/>' +
				'</label>';
		} else if (field == 'pevent') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="The value None instructs the pointer event <br>to go	&#34;through&#34; the element and target whatever <br>is &#34;underneath&#34; that element instead."/>' +
				'</label>';
		} else if (field == 'effectstype') {
			var link = "<a href='https://caniuse.com/?search=filter' target='_blank'>CanIUse</a>";
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Effects may not be supported by older browsers. <br /> See support list in ' +
				link +
				'"/>' +
				'</label>';
		} else if (field == 'lazyoff') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask tooltip" data-tooltip="Images are loaded as they appear on the screen. <br /> Option reduces page load time."/>' +
				'</label>';
		} else if (field == 'zoomable') {
			str +=
				'<label class="sui-label">' +
				label +
				'<div class="sui-label-ask sui-label-ask_no-pad tooltip" data-tooltip="This option allows zooming <br /> in the image on click or tap."/>' +
				'</label>';
		} else {
			str += '<label class="sui-label">' + label + '</label>';
		}

		str += '</td><td style="width:100%;">';
	} else {
		str += '</td><td style="width:50px;">';
	}

	const isMuteShouldBeDisabled = elem__getFieldValue($el, 'autoplay') === 'y' && field === 'mute';
	if (isMuteShouldBeDisabled) {
		if (elem__getFieldValue($el, 'mute') !== 'y') {
			elem__setFieldValue($el, 'mute', 'y', 'render', 'updateui', '');
		}
	}
	let muteSelectClass = 'sui-input sui-select';
	if (isMuteShouldBeDisabled) muteSelectClass += ' sui-select__disabled';
	str += `
		<div class="sui-select">
			<select class="${muteSelectClass}" name="${field}" ${isMuteShouldBeDisabled ? 'disabled' : ''}>`;

	if (field == 'leftunits' || field == 'topunits' || field == 'widthunits' || field == 'heightunits') {
		str +=
			'<option value="px" ' +
			(value == 'px' ? 'selected="selected"' : '') +
			'>px</option>' +
			'<option value="%" ' +
			(value == '%' ? 'selected="selected"' : '') +
			'>%</option>';
	}

	if (field == 'align' || field == 'slds_arrowalign') {
		str +=
			'<option value="left" ' +
			(value == 'left' ? 'selected="selected"' : '') +
			'>Left</option>' +
			'<option value="center" ' +
			(value == 'center' ? 'selected="selected"' : '') +
			'>Center</option>' +
			'<option value="right" ' +
			(value == 'right' ? 'selected="selected"' : '') +
			'>Right</option>';
	}

	if (field == 'slds_arrowtype') {
		str +=
			'<option value="1" ' +
			(value == '1' ? 'selected="selected"' : '') +
			'>Triangle</option>' +
			'<option value="2" ' +
			(value == '2' ? 'selected="selected"' : '') +
			'>Pointer</option>';
	}

	if (field == 'slds_arrowborder') {
		str +=
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="border" ' +
			(value == 'border' ? 'selected="selected"' : '') +
			'>Border</option>';
	}

	if (
		field == 'fontweight' ||
		field == 'inputfontweight' ||
		field == 'inputtitlefontweight' ||
		field == 'inputelsfontweight' ||
		field == 'buttonfontweight'
	) {
		var fonFamilyField;
		if (field == 'fontweight') {
			fonFamilyField = 'fontfamily';
		} else if (field == 'inputtitlefontweight' || field == 'inputelsfontweight') {
			fonFamilyField = 'inputfontfamily';
		} else if (field == 'inputfontweight') {
			fonFamilyField = 'fieldfontfamily';
		} else {
			fonFamilyField = 'buttonfontfamily';
		}

		var fontFamily = elem__getFieldValue($el, fonFamilyField);

		if (isDefaultTildaFont(fontFamily)) {
			str +=
				'<option value="100" ' +
				(value == '100' ? 'selected="selected"' : '') +
				'>Thin</option>' +
				'<option value="300" ' +
				(value == '300' ? 'selected="selected"' : '') +
				'>Light</option>' +
				'<option value="400" ' +
				(value == '400' ? 'selected="selected"' : '') +
				'>Normal</option>' +
				'<option value="500" ' +
				(value == '500' ? 'selected="selected"' : '') +
				'>Medium</option>' +
				'<option value="600" ' +
				(value == '600' ? 'selected="selected"' : '') +
				'>Semibold</option>' +
				'<option value="700" ' +
				(value == '700' ? 'selected="selected"' : '') +
				'>Bold</option>';
		} else {
			str +=
				'<option value="100" ' +
				(value == '100' ? 'selected="selected"' : '') +
				'>Thin</option>' +
				'<option value="200" ' +
				(value == '200' ? 'selected="selected"' : '') +
				'>Extralight</option>' +
				'<option value="300" ' +
				(value == '300' ? 'selected="selected"' : '') +
				'>Light</option>' +
				'<option value="400" ' +
				(value == '400' ? 'selected="selected"' : '') +
				'>Normal</option>' +
				'<option value="500" ' +
				(value == '500' ? 'selected="selected"' : '') +
				'>Medium</option>' +
				'<option value="600" ' +
				(value == '600' ? 'selected="selected"' : '') +
				'>Semibold</option>' +
				'<option value="700" ' +
				(value == '700' ? 'selected="selected"' : '') +
				'>Bold</option>' +
				'<option value="800" ' +
				(value == '800' ? 'selected="selected"' : '') +
				'>Extrabold</option>' +
				'<option value="900" ' +
				(value == '900' ? 'selected="selected"' : '') +
				'>Black</option>' +
				'<option value="variation" ' +
				(value === 'variation' ? 'selected="selected"' : '') +
				'>Custom</option>';
		}
	}

	if (field == 'container') {
		str +=
			'<option value="grid" ' +
			(value == 'grid' ? 'selected="selected"' : '') +
			'>Grid Container</option>' +
			'<option value="window" ' +
			(value == 'window' ? 'selected="selected"' : '') +
			'>Window Container</option>';
	}

	if (field == 'axisx') {
		str +=
			'<option value="left" ' +
			(value == 'left' ? 'selected="selected"' : '') +
			'>Left</option>' +
			'<option value="center" ' +
			(value == 'center' ? 'selected="selected"' : '') +
			'>Center</option>' +
			'<option value="right" ' +
			(value == 'right' ? 'selected="selected"' : '') +
			'>Right</option>';
	}

	if (field == 'axisy') {
		str +=
			'<option value="top" ' +
			(value == 'top' ? 'selected="selected"' : '') +
			'>Top</option>' +
			'<option value="center" ' +
			(value == 'center' ? 'selected="selected"' : '') +
			'>Center</option>' +
			'<option value="bottom" ' +
			(value == 'bottom' ? 'selected="selected"' : '') +
			'>Bottom</option>';
	}

	if (
		field == 'opacity' ||
		field == 'shadowopacity' ||
		field == 'slds_arrowbgopacity' ||
		field == 'slds_arrowbgopacityhover'
	) {
		str +=
			'<option value="1" ' +
			(value == '1' ? 'selected="selected"' : '') +
			'>100%</option>' +
			'<option value="0.9" ' +
			(value == '0.9' ? 'selected="selected"' : '') +
			'>90%</option>' +
			'<option value="0.8" ' +
			(value == '0.8' ? 'selected="selected"' : '') +
			'>80%</option>' +
			'<option value="0.7" ' +
			(value == '0.7' ? 'selected="selected"' : '') +
			'>70%</option>' +
			'<option value="0.6" ' +
			(value == '0.6' ? 'selected="selected"' : '') +
			'>60%</option>' +
			'<option value="0.5" ' +
			(value == '0.5' ? 'selected="selected"' : '') +
			'>50%</option>' +
			'<option value="0.4" ' +
			(value == '0.4' ? 'selected="selected"' : '') +
			'>40%</option>' +
			'<option value="0.3" ' +
			(value == '0.3' ? 'selected="selected"' : '') +
			'>30%</option>' +
			'<option value="0.2" ' +
			(value == '0.2' ? 'selected="selected"' : '') +
			'>20%</option>' +
			'<option value="0.1" ' +
			(value == '0.1' ? 'selected="selected"' : '') +
			'>10%</option>' +
			'<option value="0" ' +
			(value == '0' ? 'selected="selected"' : '') +
			'>0%</option>';
	}

	if (field == 'bgattachment') {
		str +=
			'<option value="scroll" ' +
			(value == 'scroll' ? 'selected="selected"' : '') +
			'>Scroll</option>' +
			'<option value="fixed" ' +
			(value == 'fixed' ? 'selected="selected"' : '') +
			'>Fixed</option>';
	}

	if (field == 'bgposition' || field == 'slds_imgposition') {
		str +=
			'<option value="left top" ' +
			(value == 'left top' ? 'selected="selected"' : '') +
			'>Left Top</option>' +
			'<option value="center top" ' +
			(value == 'center top' ? 'selected="selected"' : '') +
			'>Center Top</option>' +
			'<option value="right top" ' +
			(value == 'right top' ? 'selected="selected"' : '') +
			'>Right Top</option>' +
			'<option value="left center" ' +
			(value == 'left center' ? 'selected="selected"' : '') +
			'>Left Center</option>' +
			'<option value="center center" ' +
			(value == 'center center' ? 'selected="selected"' : '') +
			'>Center Center</option>' +
			'<option value="right center" ' +
			(value == 'right center' ? 'selected="selected"' : '') +
			'>Right Center</option>' +
			'<option value="left bottom" ' +
			(value == 'left bottom' ? 'selected="selected"' : '') +
			'>Left Bottom</option>' +
			'<option value="center bottom" ' +
			(value == 'center bottom' ? 'selected="selected"' : '') +
			'>Center Bottom</option>' +
			'<option value="right bottom" ' +
			(value == 'right bottom' ? 'selected="selected"' : '') +
			'>Right Bottom</option>';
	}

	if (
		field == 'fontfamily' ||
		field == 'inputfontfamily' ||
		field == 'buttonfontfamily' ||
		field == 'fieldfontfamily'
	) {
		fontexist = '';

		window.fonts.forEach(function (item) {
			str +=
				'  <option value="' +
				item +
				'" ' +
				(value == '' + item + '' ? 'selected="selected"' : '') +
				'>' +
				item +
				'</option>';
			if (value == item) fontexist = 'y';
		});

		if (field === 'fieldfontfamily') {
			str += '  <option value="' + value + '" ' + (fontexist == '' ? 'selected="selected"' : '') + '>Inherit</option>';
		}

		if (fontexist == '' && field !== 'fieldfontfamily') {
			str += '  <option value="' + value + '" selected="selected"> Font not connected - ' + value + '</option>';
		}
	}

	if (field == 'borderstyle') {
		str +=
			'<option value="solid" ' +
			(value == 'solid' ? 'selected="selected"' : '') +
			'>Solid</option>' +
			'<option value="dotted" ' +
			(value == 'dotted' ? 'selected="selected"' : '') +
			'>Dotted</option>' +
			'<option value="dashed" ' +
			(value == 'dashed' ? 'selected="selected"' : '') +
			'>Dashed</option>' +
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>';
	}

	if (field == 'linktarget') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>Same window</option>' +
			'<option value="_blank" ' +
			(value == '_blank' ? 'selected="selected"' : '') +
			'>New window</option>';
	}

	if (field == 'relnofollow') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="nofollow" ' +
			(value == 'nofollow' ? 'selected="selected"' : '') +
			'>Nofollow</option>';
	}

	if (field == 'buttonstat') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="buttonstatsend" ' +
			(value == 'buttonstatsend' ? 'selected="selected"' : '') +
			'>Send data to analytics</option>';

		if (value == 'buttonstatsend') {
			$('.sui-form-group__hint_buttonstat').css('display', 'block');
		}
	}

	if (field == 'tag') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>DIV</option>' +
			'<option value="h1" ' +
			(value == 'h1' ? 'selected="selected"' : '') +
			'>H1</option>' +
			'<option value="h2" ' +
			(value == 'h2' ? 'selected="selected"' : '') +
			'>H2</option>' +
			'<option value="h3" ' +
			(value == 'h3' ? 'selected="selected"' : '') +
			'>H3</option>';
	}

	if (field == 'animstyle') {
		var animTypesObj = {
			fadein: 'Fade In',
			fadeinup: 'Fade In Up',
			fadeindown: 'Fade In Down',
			fadeinleft: 'Fade In Left',
			fadeinright: 'Fade In Right',
			zoomin: 'Zoom In',
		};
		var animTypesList = Object.keys(animTypesObj);
		var zoomIn = animTypesList[animTypesList.length - 1]; // zoomin
		var fadeIn = animTypesList[0]; //fadein

		// props for animation types
		var animProps = ['animduration', 'animdelay', 'animtriggeroffset', 'animtest', 'animdistance', 'animscale'];
		var mainAnimProps = animProps.slice(0, -2); // ['animduration', 'animdelay', 'animtriggeroffset', 'animtest']

		if (elem__getFieldValue($el, field) === '' || isCurrentResTop) {
			str += '<option value="" ' + (value === '' ? 'selected="selected"' : '') + '>None</option>';
		}
		var multiplyValue = control__drawUi__getMultiplyAnimOpts();

		if (value || multiplyValue || isCurrentResTop) {
			if (!isCurrentResTop) {
				if (value === zoomIn || value === fadeIn) {
					animTypesList = [value]; // update animTypesList array, set only one param
				} else {
					animTypesList.shift(); // remove fadeIn
					animTypesList.pop(); // remove zoomIn
				}
			}
			animTypesList.forEach(function (animValue) {
				var selectedParam = value === animValue ? 'selected="selected"' : '';
				str += '<option value="' + animValue + '" ' + selectedParam + '>' + animTypesObj[animValue] + '</option>';
			});
			if (value || multiplyValue) {
				control__drawUi__updateVisibilityField(mainAnimProps, $settings, 'table', 'table');
				if (animTypesList.length === 1) {
					// state only for fadeIn or zoomIn
					var hiddenPropsList = ['animdistance'];
					if (value === 'fadein') hiddenPropsList.push('animscale');
					control__drawUi__updateVisibilityField(hiddenPropsList, $settings, 'table', 'none');
				} else {
					control__drawUi__updateVisibilityField(['animscale'], $settings, 'table', 'none');
					control__drawUi__updateVisibilityField(['animdistance'], $settings, 'table', 'table');
				}
			} else {
				control__drawUi__updateVisibilityField(animProps, $settings, 'table', 'none');
			}
		} else {
			if (!isCurrentResTop && isEmptyFieldValue)
				control__drawUi__updateVisibilityField([field], $settings, 'table', 'none');
			control__drawUi__updateVisibilityField(animProps, $settings, 'table', 'none');
		}
	}

	if (field == 'animprx') {
		if (elem__getFieldValue($el, field) === '' || isCurrentResTop) {
			str += '<option value="" ' + (value === '' ? 'selected="selected"' : '') + '>None</option>';
		}
		if (!isCurrentResTop) {
			if (value) {
				var textValue = value[0].toUpperCase() + value.slice(1);
				str += '<option value="' + value + '" ' + 'selected="selected"' + '>' + textValue + '</option>';
			} else if (window.tn.multi_edit) {
				str += '';
			}
		} else {
			str +=
				'<option value="scroll" ' +
				(value == 'scroll' ? 'selected="selected"' : '') +
				'>Scroll</option>' +
				'<option value="mouse" ' +
				(value == 'mouse' ? 'selected="selected"' : '') +
				'>Mouse</option>';
		}

		if (value == '') {
			$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'none');
		}

		if (value == 'scroll') {
			$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'table');
			$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'none');
		}

		if (value == 'mouse') {
			$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'table');
			$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'table');
		}
		if (!isCurrentResTop && isEmptyFieldValue)
			control__drawUi__updateVisibilityField([field], $settings, 'table', 'none');
	}

	if (field == 'animfix') {
		if (elem__getFieldValue($el, field) === '' || isCurrentResTop) {
			str += '<option value="" ' + (value === '' ? 'selected="selected"' : '') + '>None</option>';
		}
		if (isCurrentResTop || !window.tn.multi_edit || window.tn.multi_edit_common_attrs['animprx'] !== null) {
			str +=
				'<option value="0" ' +
				(value == '0' ? 'selected="selected"' : '') +
				'>on Window Top</option>' +
				'<option value="0.5" ' +
				(value == '0.5' ? 'selected="selected"' : '') +
				'>on Window Center</option>' +
				'<option value="1" ' +
				(value == '1' ? 'selected="selected"' : '') +
				'>on Window Bottom</option>';
		}

		if (value == '') {
			$settings.find('[data-control-field=animfixdist]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field=animfixtrgofst]').closest('.sui-panel__table').css('display', 'none');
		}

		if (value != '' && (value == '1' || value == '0.5' || value == '0')) {
			$settings.find('[data-control-field=animfixdist]').closest('.sui-panel__table').css('display', 'table');
			$settings.find('[data-control-field=animfixtrgofst]').closest('.sui-panel__table').css('display', 'table');
		}
		if (!isCurrentResTop && isEmptyFieldValue)
			control__drawUi__updateVisibilityField([field], $settings, 'table', 'none');
	}

	if (field == 'figure') {
		str +=
			'<option value="rectangle" ' +
			(value == 'rectangle' ? 'selected="selected"' : '') +
			'>Rectangle</option>' +
			'<option value="circle" ' +
			(value == 'circle' ? 'selected="selected"' : '') +
			'>Circle</option>' +
			'<option value="line" ' +
			(value == 'line' ? 'selected="selected"' : '') +
			'>Line</option>';
	}

	if (field == 'zoomable') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>Zoom on click</option>';
	}

	if (field == 'lazyoff') {
		type = $el.attr('data-elem-type');

		str += '  <option value="" ' + (value == '' ? 'selected="selected"' : '') + '>On (by default)</option>';

		if (type === 'shape')
			str +=
				'  <option value="n" ' +
				(value == 'n' ? 'selected="selected"' : '') +
				'>On, without showing thumbnail</option>';

		str += '  <option value="y" ' + (value == 'y' ? 'selected="selected"' : '') + '>Off</option>';
	}

	if (field == 'pevent') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>Auto</option>' +
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>';
	}

	if (field == 'effectstype') {
		type = $el.attr('data-elem-type');
		var filterString = elem__getFieldValue($el, 'effects');
		var filterData = tn_parseCSSFilter(filterString);
		var effectName = '';
		if (filterData) {
			effectName = filterData.type;
			if (filterData.isBackdrop) effectName = 'bd_' + effectName;
		}

		if (window.tn.multi_edit) {
			var isMixedData = tn_checkIsEffectsMixed($('.tn-elem__selected'));
		}

		str +=
			'<option value="" ' +
			(effectName == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="blur" ' +
			(effectName == 'blur' ? 'selected="selected"' : '') +
			'>Blur</option>' +
			'<option value="brightness" ' +
			(effectName == 'brightness' ? 'selected="selected"' : '') +
			'>Brightness</option>' +
			'<option value="contrast" ' +
			(effectName == 'contrast' ? 'selected="selected"' : '') +
			'>Contrast</option>' +
			'<option value="grayscale" ' +
			(effectName == 'grayscale' ? 'selected="selected"' : '') +
			'>Grayscale</option>' +
			'<option value="hue-rotate" ' +
			(effectName == 'hue-rotate' ? 'selected="selected"' : '') +
			'>Hue-Rotate</option>' +
			'<option value="invert" ' +
			(effectName == 'invert' ? 'selected="selected"' : '') +
			'>Invert</option>' +
			'<option value="saturate" ' +
			(effectName == 'saturate' ? 'selected="selected"' : '') +
			'>Saturate</option>' +
			'<option value="sepia" ' +
			(effectName == 'sepia' ? 'selected="selected"' : '') +
			'>Sepia</option>';

		if ($('.tn-elem__selected[data-elem-type="text"]').length === 0) {
			str +=
				'<option value="bd_blur" ' +
				(effectName == 'bd_blur' ? 'selected="selected"' : '') +
				'>Background Blur</option>' +
				'<option value="bd_brightness" ' +
				(effectName == 'bd_brightness' ? 'selected="selected"' : '') +
				'>Background Brightness</option>' +
				'<option value="bd_contrast" ' +
				(effectName == 'bd_contrast' ? 'selected="selected"' : '') +
				'>Background Contrast</option>' +
				'<option value="bd_grayscale" ' +
				(effectName == 'bd_grayscale' ? 'selected="selected"' : '') +
				'>Background Grayscale</option>' +
				'<option value="bd_hue-rotate" ' +
				(effectName == 'bd_hue-rotate' ? 'selected="selected"' : '') +
				'>Background Hue-Rotate</option>' +
				'<option value="bd_invert" ' +
				(effectName == 'bd_invert' ? 'selected="selected"' : '') +
				'>Background Invert</option>' +
				'<option value="bd_saturate" ' +
				(effectName == 'bd_saturate' ? 'selected="selected"' : '') +
				'>Background Saturate</option>' +
				'<option value="bd_sepia" ' +
				(effectName == 'bd_sepia' ? 'selected="selected"' : '') +
				'>Background Sepia</option>';
		}

		if (isMixedData && isMixedData.isTypeMixed) {
			str += '<option style="display: none;" disabled selected>Mixed</option>';
		}
	}

	if (field == 'tipposition') {
		str +=
			'<option value="top" ' +
			(value == 'top' ? 'selected="selected"' : '') +
			'>Top</option>' +
			'<option value="right" ' +
			(value == 'right' ? 'selected="selected"' : '') +
			'>Right</option>' +
			'<option value="bottom" ' +
			(value == 'bottom' ? 'selected="selected"' : '') +
			'>Bottom</option>' +
			'<option value="left" ' +
			(value == 'left' ? 'selected="selected"' : '') +
			'>Left</option>';
	}

	if (field == 'tipopen') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>on Hover</option>' +
			'<option value="click" ' +
			(value == 'click' ? 'selected="selected"' : '') +
			'>on Click</option>';
	}

	if (field == 'pinicon') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="qst" ' +
			(value == 'qst' ? 'selected="selected"' : '') +
			'>Question</option>' +
			'<option value="info" ' +
			(value == 'info' ? 'selected="selected"' : '') +
			'>Info</option>' +
			'<option value="plus" ' +
			(value == 'plus' ? 'selected="selected"' : '') +
			'>Plus</option>' +
			'<option value="star" ' +
			(value == 'star' ? 'selected="selected"' : '') +
			'>Star</option>' +
			'<option value="camera" ' +
			(value == 'camera' ? 'selected="selected"' : '') +
			'>Camera</option>' +
			'<option value="img" ' +
			(value == 'img' ? 'selected="selected"' : '') +
			'>Image file</option>';

		if (value == '') {
			$settings.find('[data-control-field=pincolor]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('.sui-panel__section-bgimg').css('display', 'none');
		}

		if (value == 'qst' || value == 'info' || value == 'plus' || value == 'star' || value == 'camera') {
			$settings.find('[data-control-field=pincolor]').closest('.sui-panel__table').css('display', 'table');
			$settings.find('.sui-panel__section-bgimg').css('display', 'none');
		}

		if (value == 'img') {
			$settings.find('[data-control-field=pincolor]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('.sui-panel__section-bgimg').css('display', 'block');
		}
	}

	if (field == 'showinfo') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>Show</option>';
	}

	if (field == 'mute') {
		str +=
			'<option value="" ' +
			(value == '' && elem__getFieldValue($el, 'autoplay') !== 'y' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="y" ' +
			(value == 'y' || elem__getFieldValue($el, 'autoplay') === 'y' ? 'selected="selected"' : '') +
			'>Mute</option>';
	}

	if (field == 'loop') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>Loop</option>';
	}

	if (field == 'autoplay') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>Autoplay</option>';
	}

	if (field == 'vidtype') {
		str +=
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>YouTube</option>' +
			'<option value="v" ' +
			(value == 'v' ? 'selected="selected"' : '') +
			'>Vimeo</option>' +
			'<option value="html" ' +
			(value == 'html' ? 'selected="selected"' : '') +
			'>MP4</option>';

		control__drawUi__updateVideoParams(value, $settings, $el, false);
	}

	if (field == 'sbsevent') {
		const {animSBSTypesObj, animTypeNaming} = control__drawUi__getSBSAnimParams();
		const animSBSType = control__drawUi__getSbsAnimType(isMixed, animSBSTypesObj, value);
		const isMixedValue = value === 'Mixed';
		let selectedAnimTypes = isMixedValue ? animSBSTypesObj[animSBSType] : Object.values(animSBSTypesObj).flat();
		str += control__drawUi__setAnimSelectOptions(value, selectedAnimTypes, animTypeNaming);

		if (value) {
			let animPropDisplayValue = animSBSType === 'scroll' || animSBSType === 'view' ? 'table' : 'none';
			control__drawUi__updateVisibilityField(['sbstrg', 'sbstrgofst'], $settings, 'table', animPropDisplayValue);

			animPropDisplayValue = animSBSType === 'scroll' || animSBSType === 'mixed' ? 'none' : 'table';
			control__drawUi__updateVisibilityField(['sbsloop', 'sbstest'], $settings, 'table', animPropDisplayValue);

			animPropDisplayValue = animSBSType === 'hoverclick' ? 'table' : 'none';
			control__drawUi__updateVisibilityField(['sbstrgels'], $settings, 'section', animPropDisplayValue);
			control__drawUi__updateVisibilityField(['sbsopts'], $settings, 'section', 'block');
		} else {
			control__drawUi__updateVisibilityField(
				['sbstrg', 'sbstrgofst', 'sbsloop', 'sbstest'],
				$settings,
				'table',
				'none',
			);
			control__drawUi__updateVisibilityField(['sbstrgels', 'sbsopts'], $settings, 'section', 'none');
		}
		$settings.find('.sui-panel__section-sbs-prop').css('display', 'none');
	}

	if (field == 'sbstrg') {
		str +=
			'<option value="0" ' +
			(value == '0' ? 'selected="selected"' : '') +
			'>on Window Top</option>' +
			'<option value="0.5" ' +
			(value == '0.5' ? 'selected="selected"' : '') +
			'>on Window Center</option>' +
			'<option value="1" ' +
			(value == '1' ? 'selected="selected"' : '') +
			'>on Window Bottom</option>';
	}

	if (field == 'sbsloop') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="loop" ' +
			(value == 'loop' ? 'selected="selected"' : '') +
			'>Loop</option>' +
			'<option value="noreverse" ' +
			(value == 'noreverse' ? 'selected="selected"' : '') +
			'>No reverse</option>';
	}

	if (field == 'inputpos') {
		str +=
			'<option value="v" ' +
			(value == 'v' ? 'selected="selected"' : '') +
			'>Vertical</option>' +
			'<option value="h" ' +
			(value == 'h' ? 'selected="selected"' : '') +
			'>Horizontal</option>';

		if (value == 'v') {
			setTimeout(function () {
				$settings.find('[data-control-field=inputmargbottom]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field=inputmargright]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=buttonalign]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field=buttonmargtop]').closest('.sui-panel__table').css('display', 'table');
			}, 500);
		}

		if (value == 'h') {
			setTimeout(function () {
				$settings.find('[data-control-field=inputmargbottom]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=inputmargright]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field=buttonalign]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=buttonmargtop]').closest('.sui-panel__table').css('display', 'none');
			}, 500);
		}
	}

	if (field == 'inputsstyle') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>Default</option>' +
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>Only bottom border</option>';
	}

	if (field == 'inputsstyle2') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>Default</option>' +
			'<option value="y" ' +
			(value == 'y' ? 'selected="selected"' : '') +
			'>Visible after clicking on input</option>';
	}

	if (field == 'buttonalign') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>Left</option>' +
			'<option value="center" ' +
			(value == 'center' ? 'selected="selected"' : '') +
			'>Center</option>';
	}

	if (field == 'formbottomcb') {
		str +=
			'<option value="" ' +
			(value == '' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="cb" ' +
			(value == 'cb' ? 'selected="selected"' : '') +
			'>Show checkbox</option>' +
			'<option value="cbx" ' +
			(value == 'cbx' ? 'selected="selected"' : '') +
			'>Show checked checkbox</option>';
	}

	if (field == 'slds_speed') {
		str +=
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="slow" ' +
			(value == 'slow' ? 'selected="selected"' : '') +
			'>Slow</option>' +
			'<option value="fast" ' +
			(value == 'fast' ? 'selected="selected"' : '') +
			'>Fast</option>';
	}

	if (field == 'slds_arrowsize') {
		str +=
			'<option value="s" ' +
			(value == 's' ? 'selected="selected"' : '') +
			'>Small</option>' +
			'<option value="m" ' +
			(value == 'm' ? 'selected="selected"' : '') +
			'>Medium</option>' +
			'<option value="l" ' +
			(value == 'l' ? 'selected="selected"' : '') +
			'>Large</option>' +
			'<option value="xl" ' +
			(value == 'xl' ? 'selected="selected"' : '') +
			'>X-Large</option>';
	}

	if (field == 'slds_dotscontrols') {
		str +=
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="near" ' +
			(value == 'near' ? 'selected="selected"' : '') +
			'>Near the picture</option>' +
			'<option value="in" ' +
			(value == 'in' ? 'selected="selected"' : '') +
			'>In the picture</option>';
	}

	if (field == 'slds_cursorcontrol') {
		str +=
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="on" ' +
			(value == 'on' ? 'selected="selected"' : '') +
			'>On</option>';
	}

	if (field == 'slds_arrowcontrols') {
		str +=
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="near" ' +
			(value == 'near' ? 'selected="selected"' : '') +
			'>Near the picture</option>' +
			'<option value="in" ' +
			(value == 'in' ? 'selected="selected"' : '') +
			'>In the picture</option>' +
			'<option value="above" ' +
			(value == 'above' ? 'selected="selected"' : '') +
			'>Above the picture</option>' +
			'<option value="under" ' +
			(value == 'under' ? 'selected="selected"' : '') +
			'>Under the picture</option>';

		if (value == 'above' || value == 'under') {
			$settings.find('[data-control-field=slds_arrowhmargin]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field=slds_arrowvmargin]').closest('.sui-panel__table').css('display', 'table');
			$settings
				.find('[data-control-field=slds_arrowbetweenmargin]')
				.closest('.sui-panel__table')
				.css('display', 'table');
			$settings.find('[data-control-field=slds_arrowalign]').closest('.sui-panel__table').css('display', 'table');
		} else {
			$settings.find('[data-control-field=slds_arrowhmargin]').closest('.sui-panel__table').css('display', 'table');
			$settings.find('[data-control-field=slds_arrowvmargin]').closest('.sui-panel__table').css('display', 'none');
			$settings
				.find('[data-control-field=slds_arrowbetweenmargin]')
				.closest('.sui-panel__table')
				.css('display', 'none');
			$settings.find('[data-control-field=slds_arrowalign]').closest('.sui-panel__table').css('display', 'none');
		}
	}

	if (field == 'slds_stretch') {
		str +=
			'<option value="contain" ' +
			(value == 'contain' ? 'selected="selected"' : '') +
			'>Contain</option>' +
			'<option value="cover" ' +
			(value == 'cover' ? 'selected="selected"' : '') +
			'>Cover</option>';
	}

	if (field == 'slds_loop') {
		str +=
			'<option value="none" ' +
			(value == 'none' ? 'selected="selected"' : '') +
			'>None</option>' +
			'<option value="loop" ' +
			(value == 'loop' ? 'selected="selected"' : '') +
			'>Loop</option>';
	}

	if (field == 'slds_captionwidth') {
		str +=
			'<option value="50" ' +
			(value == '50' ? 'selected="selected"' : '') +
			'>50%</option>' +
			'<option value="60" ' +
			(value == '60' ? 'selected="selected"' : '') +
			'>60%</option>' +
			'<option value="70" ' +
			(value == '70' ? 'selected="selected"' : '') +
			'>70%</option>' +
			'<option value="80" ' +
			(value == '80' ? 'selected="selected"' : '') +
			'>80%</option>' +
			'<option value="90" ' +
			(value == '90' ? 'selected="selected"' : '') +
			'>90%</option>' +
			'<option value="100" ' +
			(value == '100' ? 'selected="selected"' : '') +
			'>100%</option>';
	}

	if (window.tn.multi_edit && !isCopiedAnimation && field !== 'effectstype') {
		str += '<option style="display: none;" disabled ' + (isMixed ? 'selected' : '') + '>Mixed</option>';
	}

	str += '</select>' + '</div>' + '</td>' + '</tr>' + '</table>';

	$c.html(str);

	$inp = $('.tn-settings [name=' + field + ']');

	$inp.focusin(function () {
		window.tn_flag_settings_ui_focus = true;
		$c.removeClass('sui-form-group_undefined');
	});

	$inp.focusout(function () {
		window.tn_flag_settings_ui_focus = false;
	});

	$inp.change(function () {
		var value = $(this).val();
		var $fakeEl;
		var $el;

		if (window.tn.multi_edit) {
			tn_undo__Add('elems_selected_save');
			$fakeEl = $('.tn-elem__fake');
			control__drswUi__selectbox_change($fakeEl, value, field);

			for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
				$el = $(window.tn.multi_edit_elems[i]);
				control__drswUi__selectbox_change($el, value, field);
			}
		} else {
			$el = $('#' + elem_id);
			tn_undo__Add('elem_save', $el);
			control__drswUi__selectbox_change($el, value, field);
		}

		if (field === 'autoplay') {
			var curEl = window.tn.multi_edit ? window.tn.multi_edit_elems : $('#' + elem_id);
			var muteValue = $('.tn-settings [data-control-field="mute"]');
			var muteInput = muteValue.find('.sui-select');
			var muteTooltip = $('.sui-panel-mute-autoplay-message');
			if (value === 'y') {
				curEl.each(function () {
					if (elem__getFieldValue($(this), 'mute') === '') {
						control__drswUi__selectbox_change($(this), 'y', 'mute');
						panelSettings__updateUi($(this), 'mute', 'y');
					}
				});
				muteInput.addClass('sui-select__disabled');
				muteInput.prop('disabled', true);
				muteTooltip.css('display', '');
			} else {
				muteInput.removeClass('sui-select__disabled');
				muteInput.prop('disabled', false);
				muteTooltip.css('display', 'none');
			}
		}
	});

	function control__drswUi__selectbox_change($el, val, field) {
		var res = window.tn.curResolution;
		var isGroupField =
			field === 'leftunits' || field === 'topunits' || field === 'container' || field === 'axisx' || field === 'axisy';
		var $groups = $('.tn-group__selected');
		var $btnCopyBasic = $('.sui-copy-btn.sui-copy-btn-basic');
		var w;
		var h;
		var sbstrg;
		var sbstrgofst;
		var sbsopts;
		var eltype;
		var link;
		var $element;
		var initialValue = elem__getFieldValue($el, field);

		$c.attr('data-control-value', val);

		if (group__isSelectedOnlyGroups() && isGroupField) {
			$groups.each(function () {
				var $group = $(this);
				var left = group__convertPosition__Local__toAbsolute($group, 'left');
				var top = group__convertPosition__Local__toAbsolute($group, 'top');

				group__setFieldValue($group.attr('id'), field, val);

				$group.css({
					'left': left + 'px',
					'top': top + 'px',
				});

				group__saveCurrentPosition($group.attr('id'));
				tn_setOutlinePosition('selected');
			});

			return;
		}

		if (field == 'container') {
			elem__setFieldValue($el, field, val);
			elem__Save__currentPosition($el);
			elem__renderViewOneField($el, 'width');
			elem__renderViewOneField($el, 'height');
			elem__drawAxis($el);
			elem__updateUIControls($el);
			tn_setOutlinePosition('selected');
		} else if (field !== 'effectstype') {
			elem__setFieldValue($el, field, val, 'render');
		}

		if (field == 'axisx') {
			elem__setFieldValue($el, 'left', '0', 'render', 'updateui');
			elem__renderViewOneField($el, 'top');
			elem__drawAxis($el);
			tn_setOutlinePosition('selected');
		}

		if (field == 'axisy') {
			elem__setFieldValue($el, 'top', '0', 'render', 'updateui');
			elem__renderViewOneField($el, 'left');
			elem__drawAxis($el);
			tn_setOutlinePosition('selected');
		}

		if (field == 'leftunits') {
			elem__setFieldValue($el, 'left', '0', 'render', 'updateui');
			elem__updateUIControls($el);
			tn_setOutlinePosition('selected');
		}

		if (field == 'topunits') {
			elem__setFieldValue($el, 'top', '0', 'render', 'updateui');
			elem__updateUIControls($el);
			tn_setOutlinePosition('selected');
		}

		if (field == 'widthunits') {
			elem__setFieldValue($el, 'width', '100', 'render', 'updateui');
			elem__updateUIControls($el);
			tn_setOutlinePosition('selected');
		}

		if (field == 'heightunits') {
			elem__setFieldValue($el, 'height', '100', 'render', 'updateui');
			elem__updateUIControls($el);
			tn_setOutlinePosition('selected');
		}

		if (field === 'fontfamily') {
			if (isDefaultTildaFont(val)) {
				var weight = elem__getFieldValue($el, 'fontweight');
				var newFontValue = changeFontWeightToNearest(weight);
				elem__setFieldValue($el, 'fontweight', newFontValue, 'render', 'updateui');
				$settings
					.find('[data-control-field=variationweight]')
					.closest('.sui-panel__table')
					.css('display', isVariation ? 'table' : 'none');
			}
			control__drawUi__selectbox($el.attr('id'), 'fontweight');
		}

		if (field === 'inputfontfamily') {
			if (isDefaultTildaFont(val)) {
				weight = elem__getFieldValue($el, 'inputtitlefontweight');
				newFontValue = changeFontWeightToNearest(weight);
				elem__setFieldValue($el, 'inputtitlefontweight', newFontValue, 'render', 'updateui');
				weight = elem__getFieldValue($el, 'inputelsfontweight');
				newFontValue = changeFontWeightToNearest(weight);
				elem__setFieldValue($el, 'inputelsfontweight', newFontValue, 'render', 'updateui');

				$settings
					.find('[data-control-field=inputtitlevariationweight],[data-control-field=inputelsvariationweight]')
					.closest('.sui-panel__table')
					.css('display', isVariation ? 'table' : 'none');
			}
			control__drawUi__selectbox($el.attr('id'), 'inputtitlefontweight');
			control__drawUi__selectbox($el.attr('id'), 'inputelsfontweight');
		}

		if (field === 'fieldfontfamily') {
			if (isDefaultTildaFont(val)) {
				weight = elem__getFieldValue($el, 'inputfontweight');
				newFontValue = changeFontWeightToNearest(weight);
				elem__setFieldValue($el, 'inputfontweight', newFontValue, 'render', 'updateui');
				$settings
					.find('[data-control-field=inputvariationweight]')
					.closest('.sui-panel__table')
					.css('display', isVariation ? 'table' : 'none');
			}
			control__drawUi__selectbox($el.attr('id'), 'inputfontweight');
		}

		if (field === 'buttonfontfamily') {
			if (isDefaultTildaFont(val)) {
				weight = elem__getFieldValue($el, 'buttonfontweight');
				newFontValue = changeFontWeightToNearest(weight);
				elem__setFieldValue($el, 'buttonfontweight', newFontValue, 'render', 'updateui');
				$settings
					.find('[data-control-field=buttonvariationweight]')
					.closest('.sui-panel__table')
					.css('display', isVariation ? 'table' : 'none');
			}
			control__drawUi__selectbox($el.attr('id'), 'buttonfontweight');
		}

		if (field === 'fontweight') {
			var isVariation = val === 'variation';
			if (isVariation && initialValue && initialValue !== 'variation') {
				elem__setFieldValue($el, 'variationweight', initialValue);
				if (!window.tn.multi_edit || $el.hasClass('tn-elem__fake')) {
					panelSettings__updateUi($el, 'variationweight', initialValue);
				}
			} else if (!isVariation) {
				elem__emptyField($el, 'variationweight');
			}
			$settings
				.find('[data-control-field=variationweight]')
				.closest('.sui-panel__table')
				.css('display', isVariation ? 'table' : 'none');
			tn_setOutlinePosition('selected');
		}

		if (field === 'inputfontweight') {
			isVariation = val === 'variation';
			if (isVariation && initialValue && initialValue !== 'variation') {
				elem__setFieldValue($el, 'inputvariationweight', initialValue);
				if (!window.tn.multi_edit || $el.hasClass('tn-elem__fake')) {
					panelSettings__updateUi($el, 'inputvariationweight', initialValue);
				}
			} else if (!isVariation) {
				elem__emptyField($el, 'inputvariationweight');
			}
			$settings
				.find('[data-control-field=inputvariationweight]')
				.closest('.sui-panel__table')
				.css('display', val === 'variation' ? 'table' : 'none');
		}

		if (field === 'inputtitlefontweight') {
			isVariation = val === 'variation';
			if (isVariation && initialValue && initialValue !== 'variation') {
				elem__setFieldValue($el, 'inputtitlevariationweight', initialValue);
				if (!window.tn.multi_edit || $el.hasClass('tn-elem__fake')) {
					panelSettings__updateUi($el, 'inputtitlevariationweight', initialValue);
				}
			} else if (!isVariation) {
				elem__emptyField($el, 'inputtitlevariationweight');
			}
			$settings
				.find('[data-control-field=inputtitlevariationweight]')
				.closest('.sui-panel__table')
				.css('display', val === 'variation' ? 'table' : 'none');
		}

		if (field === 'inputelsfontweight') {
			isVariation = val === 'variation';
			if (isVariation && initialValue && initialValue !== 'variation') {
				elem__setFieldValue($el, 'inputelsvariationweight', initialValue);
				if (!window.tn.multi_edit || $el.hasClass('tn-elem__fake')) {
					panelSettings__updateUi($el, 'inputelsvariationweight', initialValue);
				}
			} else if (!isVariation) {
				elem__emptyField($el, 'inputelsvariationweight');
			}
			$settings
				.find('[data-control-field=inputelsvariationweight]')
				.closest('.sui-panel__table')
				.css('display', val === 'variation' ? 'table' : 'none');
		}

		if (field === 'buttonfontweight') {
			isVariation = val === 'variation';
			if (isVariation && initialValue && initialValue !== 'variation') {
				elem__setFieldValue($el, 'buttonvariationweight', initialValue);
				if (!window.tn.multi_edit || $el.hasClass('tn-elem__fake')) {
					panelSettings__updateUi($el, 'buttonvariationweight', initialValue);
				}
			} else if (!isVariation) {
				elem__emptyField($el, 'buttonvariationweight');
			}
			$settings
				.find('[data-control-field=buttonvariationweight]')
				.closest('.sui-panel__table')
				.css('display', val === 'variation' ? 'table' : 'none');
		}

		if (field == 'figure') {
			if ($el.attr('data-elem-type') !== 'shape') return;

			w = parseInt(elem__getFieldValue($el, 'width'), 10);

			if (w < 60) {
				elem__emptyField($el, 'width');
				elem__setFieldValue($el, 'width', '100', 'render', 'updateui', window.tn.topResolution);
			}

			if (val == 'circle') {
				if (!window.tn.multi_edit) {
					$settings.find('.sui-panel__section-bgimg').css('display', 'block');
					$settings.find('.sui-panel__section-shadow').css('display', 'block');
					$settings.find('.sui-panel__section-border').css('display', 'block');
					$settings.find('[data-control-field=borderradius]').closest('.sui-panel__table').css('display', 'none');
				}

				elem__emptyField($el, 'height');

				w = elem__getFieldValue($el, 'width');

				elem__setFieldValue($el, 'height', w, 'render', 'updateui', window.tn.topResolution);
				elem__emptyField($el, 'borderradius');
				elem__setFieldValue($el, 'borderradius', '3000', 'render', 'updateui', window.tn.topResolution);

				$el.find('.ui-resizable-s').css('display', '');
				$el.find('.ui-resizable-n').css('display', '');
				$el.find('.ui-resizable-se').css('display', '');
				$el.find('.ui-resizable-sw').css('display', '');
				$el.find('.ui-resizable-ne').css('display', '');
				$el.find('.ui-resizable-nw').css('display', '');

				tn_shapeBorderRadius__destroyHandle($el[0]);
			}

			if (val == 'line') {
				elem__emptyField($el, 'bgimg', 'render', 'updateui');
				elem__emptyField($el, 'shadowcolor');
				elem__emptyField($el, 'borderradius');
				elem__renderViewOneField($el, 'bgimg');
				elem__renderViewOneField($el, 'shadowcolor');
				elem__renderViewOneField($el, 'borderradius');

				if (!window.tn.multi_edit) {
					$settings.find('.sui-panel__section-bgimg').css('display', 'none');
					$settings.find('.sui-panel__section-shadow').css('display', 'none');
					$settings.find('.sui-panel__section-border').css('display', 'none');
					$settings.find('[data-control-field=borderradius]').closest('.sui-panel__table').css('display', 'none');
				}

				elem__emptyField($el, 'height');
				elem__setFieldValue($el, 'height', '5', 'render', 'updateui', window.tn.topResolution);

				$el.find('.ui-resizable-s').css('display', 'none');
				$el.find('.ui-resizable-n').css('display', 'none');
				$el.find('.ui-resizable-se').css('display', 'none');
				$el.find('.ui-resizable-sw').css('display', 'none');
				$el.find('.ui-resizable-ne').css('display', 'none');
				$el.find('.ui-resizable-nw').css('display', 'none');

				tn_shapeBorderRadius__destroyHandle($el[0]);
			}

			if (val == 'rectangle') {
				if (!window.tn.multi_edit) {
					$settings.find('.sui-panel__section-bgimg').css('display', 'block');
					$settings.find('.sui-panel__section-shadow').css('display', 'block');
					$settings.find('.sui-panel__section-border').css('display', 'block');
					$settings.find('[data-control-field=borderradius]').closest('.sui-panel__table').css('display', 'block');
				}

				elem__emptyField($el, 'borderradius');
				elem__renderViewOneField($el, 'borderradius');

				h = parseInt(elem__getFieldValue($el, 'height'), 10);

				if (h < 10) {
					elem__emptyField($el, 'height');
					w = parseInt(elem__getFieldValue($el, 'width'), 10);
					elem__setFieldValue($el, 'height', w, 'render', 'updateui', window.tn.topResolution);
				}

				$el.find('.ui-resizable-s').css('display', '');
				$el.find('.ui-resizable-n').css('display', '');
				$el.find('.ui-resizable-se').css('display', '');
				$el.find('.ui-resizable-sw').css('display', '');
				$el.find('.ui-resizable-ne').css('display', '');
				$el.find('.ui-resizable-nw').css('display', '');

				tn_shapeBorderRadius__initHandle($el[0]);
			}

			tn_setOutlinePosition('selected');
		}

		if (field == 'buttonstat') {
			if (val == 'buttonstatsend') {
				$('.sui-form-group__hint_buttonstat').css('display', 'block');
			} else {
				$('.sui-form-group__hint_buttonstat').css('display', 'none');
			}
		}

		if (field == 'effectstype') {
			if (val) {
				var filterString = tn_generateFilter(val);
				elem__setFieldValue($el, 'effects', filterString, 'render');
				control__drawUi__slider($el.attr('id'), 'effectsvalue');
				$settings.find('[data-control-field="effectsvalue"]').closest('.sui-panel__table').css('display', 'table');
				tn_tooltip_update();
			} else {
				elem__emptyField($el, 'effects', 'render');
				$settings.find('[data-control-field="effectsvalue"]').closest('.sui-panel__table').css('display', 'none');
			}
		}

		if (field == 'animstyle') {
			if (val == '') {
				$settings.find('[data-control-field=animduration]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animdelay]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animdistance]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animscale]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animtriggeroffset]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control=animtest]').closest('.sui-panel__table').css('display', 'none');

				elem__emptyField($el, 'animduration');
				elem__emptyField($el, 'animdelay');
				elem__emptyField($el, 'animdistance');
				elem__emptyField($el, 'animscale');
				elem__emptyField($el, 'animtriggeroffset');

				if (res >= 1200) elem__emptyField($el, 'animmobile');

				if (elem__getFieldValue($el, 'animprx') == '' && elem__getFieldValue($el, 'animfix') == '') {
					$btnCopyBasic.css('display', 'none');
				}
			} else {
				$settings.find('[data-control-field=animduration]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field=animdelay]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field=animtriggeroffset]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control=animtest]').closest('.sui-panel__table').css('display', 'table');

				if (elem__getFieldValue($el, 'animduration') == '') {
					elem__setFieldValue($el, 'animduration', '1', 'render', 'updateui', window.tn.topResolution);
				}

				if (elem__getFieldValue($el, 'animdelay') == '') {
					elem__setFieldValue($el, 'animdelay', '0', 'render', 'updateui', window.tn.topResolution);
				}

				if (elem__getFieldValue($el, 'animtriggeroffset') == '') {
					elem__setFieldValue($el, 'animtriggeroffset', '0', 'render', 'updateui', window.tn.topResolution);
				}

				if (val == 'fadein') {
					$settings.find('[data-control-field=animscale]').closest('.sui-panel__table').css('display', 'none');

					if (elem__getFieldValue($el, 'animscale') != '') {
						elem__emptyField($el, 'animscale');
					}

					$settings.find('[data-control-field=animdistance]').closest('.sui-panel__table').css('display', 'none');

					if (elem__getFieldValue($el, 'animdistance') != '') {
						elem__emptyField($el, 'animdistance');
					}
				}

				if (val == 'fadeinup' || val == 'fadeindown' || val == 'fadeinleft' || val == 'fadeinright') {
					$settings.find('[data-control-field=animdistance]').closest('.sui-panel__table').css('display', 'table');

					if (elem__getFieldValue($el, 'animdistance') == '') {
						elem__setFieldValue($el, 'animdistance', '100', 'render', 'updateui', window.tn.topResolution);
					}

					$settings.find('[data-control-field=animscale]').closest('.sui-panel__table').css('display', 'none');

					if (elem__getFieldValue($el, 'animscale') != '') {
						elem__emptyField($el, 'animscale');
					}
				}

				if (val == 'zoomin') {
					$settings.find('[data-control-field=animscale]').closest('.sui-panel__table').css('display', 'table');

					elem__setFieldValue($el, 'animscale', '0.9', 'render', 'updateui', window.tn.topResolution);

					$settings.find('[data-control-field=animdistance]').closest('.sui-panel__table').css('display', 'none');

					if (elem__getFieldValue($el, 'animdistance') != '') {
						elem__emptyField($el, 'animdistance');
					}
				}

				if ($btnCopyBasic.css('display') !== 'block') {
					$btnCopyBasic.css('display', 'block');
				}
			}
		}

		if (field == 'animprx') {
			if (val == '') {
				$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'none');

				elem__emptyField($el, 'animprxs');
				elem__emptyField($el, 'animprxdy');
				elem__emptyField($el, 'animprxdx');

				if (elem__getFieldValue($el, 'animstyle') == '' && elem__getFieldValue($el, 'animfix') == '') {
					$btnCopyBasic.css('display', 'none');
				}
			} else {
				if (val == 'scroll') {
					$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'none');

					elem__emptyField($el, 'animprxdy');
					elem__emptyField($el, 'animprxdx');

					if (elem__getFieldValue($el, 'animprxs') == '') {
						elem__setFieldValue($el, 'animprxs', '100', 'render', 'updateui', window.tn.topResolution);
					}
				}
				if (val == 'mouse') {
					$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'table');

					elem__emptyField($el, 'animprxs');

					if (elem__getFieldValue($el, 'animprxdx') == '') {
						elem__setFieldValue($el, 'animprxdx', '0', 'render', 'updateui', window.tn.topResolution);
					}

					if (elem__getFieldValue($el, 'animprxdy') == '') {
						elem__setFieldValue($el, 'animprxdy', '0', 'render', 'updateui', window.tn.topResolution);
					}
				}

				// hide fix
				$settings.find('[data-control-field=animfixdist]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animfixtrgofst]').closest('.sui-panel__table').css('display', 'none');

				elem__emptyField($el, 'animfix', '', 'updateui');
				elem__emptyField($el, 'animfixdist', '', 'updateui');
				elem__emptyField($el, 'animfixtrgofst', '', 'updateui');

				if ($btnCopyBasic.css('display') !== 'block') {
					$btnCopyBasic.css('display', 'block');
				}
			}
		}

		if (field == 'animfix') {
			if (val == '') {
				$settings.find('[data-control-field=animfixdist]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animfixtrgofst]').closest('.sui-panel__table').css('display', 'none');

				elem__emptyField($el, 'animfixdist');
				elem__emptyField($el, 'animfixtrgofst');

				if (elem__getFieldValue($el, 'animstyle') == '' && elem__getFieldValue($el, 'animprx') == '') {
					$btnCopyBasic.css('display', 'none');
				}
			} else {
				$settings.find('[data-control-field=animfixdist]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field=animfixtrgofst]').closest('.sui-panel__table').css('display', 'table');

				if (elem__getFieldValue($el, 'animfixdist') == '') {
					elem__setFieldValue($el, 'animfixdist', '0', 'render', 'updateui', window.tn.topResolution);
				}

				if (elem__getFieldValue($el, 'animfixtrgofst') == '') {
					elem__setFieldValue($el, 'animfixtrgofst', '0', 'render', 'updateui', window.tn.topResolution);
				}

				// hide prx
				$settings.find('[data-control-field=animprxs]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animprxdx]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=animprxdy]').closest('.sui-panel__table').css('display', 'none');

				elem__emptyField($el, 'animprx', '', 'updateui');
				elem__emptyField($el, 'animprxs', '', 'updateui');
				elem__emptyField($el, 'animprxdy', '', 'updateui');
				elem__emptyField($el, 'animprxdx', '', 'updateui');

				if ($btnCopyBasic.css('display') !== 'block') {
					$btnCopyBasic.css('display', 'block');
				}
			}
		}

		if (field == 'pinicon') {
			if (val == '') {
				$settings.find('[data-control-field=pincolor]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('.sui-panel__section-bgimg').css('display', 'none');

				elem__emptyField($el, 'pincolor', 'render', 'updateui');
				elem__emptyField($el, 'bgimg', 'render', 'updateui');
			}

			if (val == 'img') {
				$settings.find('[data-control-field=pincolor]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('.sui-panel__section-bgimg').css('display', 'block');
				elem__emptyField($el, 'pincolor', 'render', 'updateui');
			}

			if (val == 'qst' || val == 'info' || val == 'plus' || val == 'star' || val == 'camera') {
				$settings.find('[data-control-field=pincolor]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('.sui-panel__section-bgimg').css('display', 'none');

				elem__emptyField($el, 'bgimg', 'render', 'updateui');

				if (elem__getFieldValue($el, 'pincolor') == '') {
					elem__setFieldValue($el, 'pincolor', '#ffffff', 'render', 'updateui', window.tn.topResolution);
				}
			}
		}

		if (field == 'slds_arrowcontrols') {
			if (val == 'cursor') {
				$settings.find('[data-control-field=slds_arrowvmargin]').closest('.sui-panel__table').css('display', 'none');
				$settings
					.find('[data-control-field=slds_arrowbetweenmargin]')
					.closest('.sui-panel__table')
					.css('display', 'none');
				$settings.find('[data-control-field=slds_arrowalign]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=slds_arrowhmargin]').closest('.sui-panel__table').css('display', 'none');
			} else if (val == 'above' || val == 'under') {
				$settings.find('[data-control-field=slds_arrowhmargin]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=slds_arrowvmargin]').closest('.sui-panel__table').css('display', 'table');
				$settings
					.find('[data-control-field=slds_arrowbetweenmargin]')
					.closest('.sui-panel__table')
					.css('display', 'table');
				$settings.find('[data-control-field=slds_arrowalign]').closest('.sui-panel__table').css('display', 'table');
			} else {
				$settings.find('[data-control-field=slds_arrowvmargin]').closest('.sui-panel__table').css('display', 'none');
				$settings
					.find('[data-control-field=slds_arrowbetweenmargin]')
					.closest('.sui-panel__table')
					.css('display', 'none');
				$settings.find('[data-control-field=slds_arrowalign]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=slds_arrowhmargin]').closest('.sui-panel__table').css('display', 'table');
			}
		}

		if (field == 'vidtype') {
			control__drawUi__updateVideoParams(val, $settings, $el, true);
		}

		if (field == 'vidtype' || field == 'showinfo') {
			elem__renderViewOneField($el, 'youtubeid');
			elem__renderViewOneField($el, 'vimeoid');
			elem__renderViewOneField($el, 'mp4video');
		}

		if (field == 'sbsevent') {
			if (val == '') {
				var select = document.querySelector('select[name="sbsevent"]');
				// after updating mixed state options
				if (select && select.options.length < 6) {
					const {animSBSTypesObj, animTypeNaming} = control__drawUi__getSBSAnimParams();
					let selectedAnimTypes = Object.values(animSBSTypesObj).flat();
					select.innerHTML = control__drawUi__setAnimSelectOptions(value, selectedAnimTypes, animTypeNaming);
				}
				$settings.find('[data-control-field=sbstrg]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=sbstrgofst]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field=sbsloop]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control=sbstest]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('.sui-panel__section-sbs-trgels').css('display', 'none');
				$settings.find('.sui-panel__section-sbs-opts').css('display', 'none');
				$settings.find('.sui-panel__section-sbs-prop').css('display', 'none');

				elem__emptyField($el, 'sbstrg', '', 'updateui');
				elem__emptyField($el, 'sbstrgofst', '', 'updateui');
				elem__emptyField($el, 'sbstrgels', '', 'updateui');
				elem__emptyField($el, 'sbsloop', '', 'updateui');
				elem__emptyField($el, 'sbsopts', '', 'updateui');
			} else {
				if (val == 'scroll' || val == 'intoview' || val == 'blockintoview') {
					$settings.find('[data-control-field=sbstrg]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=sbstrgofst]').closest('.sui-panel__table').css('display', 'table');

					sbstrg = elem__getFieldValue($el, 'sbstrg');
					sbstrgofst = elem__getFieldValue($el, 'sbstrgofst');

					if (typeof sbstrg == 'undefined' || sbstrg == '')
						elem__setFieldValue($el, 'sbstrg', '1', '', 'updateui', window.tn.topResolution);
					if (typeof sbstrgofst == 'undefined' || sbstrgofst == '')
						elem__setFieldValue($el, 'sbstrgofst', '0', '', 'updateui', window.tn.topResolution);
				} else {
					$settings.find('[data-control-field=sbstrg]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=sbstrgofst]').closest('.sui-panel__table').css('display', 'none');

					elem__emptyField($el, 'sbstrg', '', 'updateui');
					elem__emptyField($el, 'sbstrgofst', '', 'updateui');
				}

				if (val == 'scroll') {
					$settings.find('[data-control-field=sbsloop]').closest('.sui-panel__table').css('display', 'none');
					elem__emptyField($el, 'sbsloop', '', 'updateui');
					$settings.find('[data-control=sbstest]').closest('.sui-panel__table').css('display', 'none');
				} else {
					$settings.find('[data-control-field=sbsloop]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control=sbstest]').closest('.sui-panel__table').css('display', 'table');
				}

				if (val == 'hover' || val == 'click') {
					$settings.find('.sui-panel__section-sbs-trgels').css('display', 'block');
				} else {
					$settings.find('.sui-panel__section-sbs-trgels').css('display', 'none');
					elem__emptyField($el, 'sbstrgels', '', 'updateui');
				}

				$settings.find('.sui-panel__section-sbs-opts').css('display', 'block');
				sbsopts = elem__getFieldValue($el, 'sbsopts');

				if (typeof sbsopts == 'undefined' || sbsopts == '') {
					$settings.find('.sui-panel__section-sbs-prop').css('display', 'none');
				} else {
					$settings.find('.sui-panel__section-sbs-prop').css('display', 'block');
				}

				sbs__convertStepsObj($el, val);
				control__drawUi__steps(elem_id, 'sbsopts');
				elem__removeBasicAnimation($el);
			}
			if ($('.sbsoptsempty__active').length) {
				$('.sbsoptsempty__active').removeClass('sbsoptsempty__active');
				control__drawUi__updateVisibilityField(['sbsopts'], $settings, 'table', 'table');
			}
		}

		if (field == 'inputpos') {
			if (val == 'v') {
				elem__emptyField($el, 'formbottomcb', '', '', '');

				setTimeout(function () {
					$settings.find('[data-control-field=inputmargbottom]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=inputmargright]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=buttonalign]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=buttonmargtop]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=formbottomcb]').closest('.sui-panel__table').css('display', 'none');
				}, 500);
			}

			if (val == 'h') {
				elem__emptyField($el, 'buttonalign', '', '', '');
				elem__emptyField($el, 'buttonmargtop', '', '', '');

				setTimeout(function () {
					$settings.find('[data-control-field=inputmargbottom]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=inputmargright]').closest('.sui-panel__table').css('display', 'table');
					$settings.find('[data-control-field=buttonalign]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=buttonmargtop]').closest('.sui-panel__table').css('display', 'none');
					$settings.find('[data-control-field=formbottomcb]').closest('.sui-panel__table').css('display', 'table');
				}, 500);
			}
		}

		if (field == 'pevent') {
			if (val == 'none') {
				eltype = $el.attr('data-elem-type');

				if (eltype == 'text' || eltype == 'image' || eltype == 'shape' || eltype == 'button') {
					link = elem__getFieldValue($el, 'link');

					if (link != '') {
						tn_alert(
							'Sorry, you can not set this value. The field "LINK" is not empty. Please remove it and try again.',
						);
						val = '';
						$(this).val(val);
					}
				}
			}
		}

		$c.removeClass('sui-form-group_undefined');

		tn_set_lastChanges();

		$inp.trigger('focusout');

		eltype = $el.attr('data-elem-type');

		if (eltype == 'form') {
			if (!window.tn.multi_edit) {
				elem__renderForm($el);
			} else {
				for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
					$element = $(window.tn.multi_edit_elems[i]);
					if ($element.attr('data-elem-type') == 'form') elem__renderForm($element);
				}
			}
		}
	}

	if ((field === 'widthunits' || field === 'heightunits') && group__isSelectedOnlyGroups()) {
		$inp.css('opacity', '0.3');
		$inp.val('px');
		$inp.addClass('sui-input__disabled');
		$inp.prop('disabled', true);
	}

	if (field == 'container') $('.sui-containers-togler__container').html(': ' + (value || 'Mixed'));
	if (field == 'axisx') $('.sui-containers-togler__axisx').html(': ' + (value || 'Mixed'));
	if (field == 'axisy') $('.sui-containers-togler__axisy').html(': ' + (value || 'Mixed'));

	if (field == 'figure') {
		if (value == 'circle' && !window.tn.multi_edit) {
			$settings.find('[data-control-field=borderradius]').closest('.sui-panel__table').css('display', 'none');
		}

		if (value == 'line' && !window.tn.multi_edit) {
			$settings.find('.sui-panel__section-bgimg').css('display', 'none');
			$settings.find('.sui-panel__section-shadow').css('display', 'none');
			$settings.find('[data-control-field=borderradius]').closest('.sui-panel__table').css('display', 'none');
		}
	}

	if (field === 'buttonstat') {
		$settings.find('.sui-form-group__hint_buttonstat').click(function () {
			tn_copyToClipboard($(this).attr('data-stat-id'));
			td__showBubbleNotice('Virtual page address is copied', 3000);
		});
	}
}
