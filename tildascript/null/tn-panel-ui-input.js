function control__drawUi__input(elem_id, field) {
	var $c = $('[data-control-field=' + field + ']');
	var value = $c.attr('data-control-value');
	var label = field;
	var $settings = $('.tn-settings');
	var str = '';
	var link;
	var v;
	var $inp;
	var $el;
	var propVals;
	var groups;
	var isValueNotInitial;

	if (typeof value === 'undefined') return true;

	if (field == 'top' || field == 'left' || field == 'height') {
		value = parseInt(value, 10);
		if (isNaN(value)) value = '';
	}

	if (field == 'top') label = 'y';
	if (field == 'left') label = 'x';
	if (field == 'height') label = 'h';
	if (field == 'width') label = 'w';
	if (field == 'zindex') label = 'arrange';
	if (field == 'borderradius') label = 'radius';
	if (field == 'borderstyle') label = 'style';
	if (field == 'borderwidth') label = 'Brdr.size, px';
	if (field == 'bordercolor') label = 'Border';
	if (field == 'shadowcolor') label = 'Shadow';
	if (field == 'shadowx') label = 'offset x';
	if (field == 'shadowy') label = 'offset y';
	if (field == 'shadowblur') label = 'blur';
	if (field == 'shadowspread') label = 'spread';
	if (field == 'bgcolorhover') label = 'bgcolor on Hover';
	if (field == 'colorhover') label = 'Color on Hover';
	if (field == 'bordercolorhover') label = 'Border on Hover';
	if (field == 'speedhover') label = 'Speed';
	if (field == 'widthvw') label = 'Fluid width';
	if (field == 'heightvh') label = 'Fluid height';
	if (field == 'leftvw') label = 'Fluid X';
	if (field == 'topvh') label = 'Fluid Y';
	if (field == 'youtubeid') label = 'Youtube Url or ID';
	if (field == 'vimeoid') label = 'Vimeo Url or ID';
	if (field == 'vimeohash') label = 'Hash';
	if (field == 'mp4video') label = 'Video Url';
	if (field == 'pincolor') label = 'Icon color';
	if (field == 'tipbgcolor') label = 'Bg. color';
	if (field == 'startsec') label = 'Start sec.';
	if (field == 'endsec') label = 'End sec';
	if (field == 'classname') label = 'CSS Class Name';
	if (field == 'bgcolor') label = 'Bg. color';

	// form style
	if (field == 'inputcolor') label = 'Input color';
	if (field == 'inputbgcolor') label = 'Input bg.color';
	if (field == 'inputbordercolor') label = 'Input border color';
	if (field == 'inputbordersize') label = 'Input border size';
	if (field == 'inputradius') label = 'Input radius';
	if (field == 'inputheight') label = 'Input height';
	if (field == 'inputmargbottom') label = 'Input margin bottom';
	if (field == 'inputmargright') label = 'Input margin right';
	if (field == 'inputtitlecolor') label = 'Input title color';
	if (field == 'inputtitlemargbottom') label = 'Input title padding bottom';
	if (field == 'inputelscolor') label = 'COLOR OF CHECKBOXES, RADIO BTNS, AND OTHER ELEMENTS';
	if (field == 'buttontitle') label = 'Btn title';
	if (field == 'buttoncolor') label = 'Text color';
	if (field == 'buttonbgcolor') label = 'Bg.color';
	if (field == 'buttonbordercolor') label = 'Btn border color';
	if (field == 'buttonhovercolor') label = 'Btn color on hover';
	if (field == 'buttonhoverbgcolor') label = 'Btn Bg. color on hover';
	if (field == 'buttonhoverbordercolor') label = 'Btn border color on hover';
	if (field == 'buttonhovershadowsize') label = 'Btn shadow size on hover';
	if (field == 'buttonbordersize') label = 'Btn border size';
	if (field == 'buttonradius') label = 'Btn corner radius';
	if (field == 'buttonmargtop') label = 'Btn margin top';
	if (field == 'buttonwidth') label = 'Btn width';
	if (field == 'buttonheight') label = 'Btn height';
	if (field == 'buttonpaddhoriz') label = 'Btn inner padding horiz.';
	if (field == 'buttonpaddvert') label = 'Btn inner padding vert.';
	if (field == 'buttonshadowsize') label = 'Btn shadow size';
	if (field == 'buttonshadowopacity') label = 'Btn shadow opacity';
	if (field == 'formmsgcolor') label = 'Form msg. color';
	if (field == 'formmsgbgcolor') label = 'Form msg. bg.color';
	if (field == 'formmsgsuccess') label = 'Success message';
	if (field == 'formmsgurl') label = 'Success url';
	if (field == 'formerrreq') label = 'Error: required field';
	if (field == 'formerremail') label = 'Error: email is incorrect';
	if (field == 'formerrphone') label = 'Error: phone is incorrect';
	if (field == 'formerrname') label = 'Error: name is incorrect';
	if (field == 'formbottomtext') label = 'Text under form';
	if (field == 'link') label = 'Url';

	// gallery style
	if (field == 'slds_arrowlinesize') label = 'Line size';
	if (field == 'slds_arrowcolor') label = 'Color';
	if (field == 'slds_arrowcolorhover') label = 'Hover color';
	if (field == 'slds_arrowbgcolor') label = 'Bg. color';
	if (field == 'slds_arrowbgcolorhover') label = 'Hover bg. color';
	if (field == 'slds_dotssize') label = 'Size';
	if (field == 'slds_dotsbgcolor') label = 'Color';
	if (field == 'slds_dotsbgcoloractive') label = 'Active color';
	if (field == 'slds_autoplay') label = 'autoplay (s)';
	if (field == 'slds_playiconsize') label = 'Size';
	if (field == 'slds_playiconcolor') label = 'Color';
	if (field == 'slds_captiontopmargin') label = 'Top margin';
	if (field == 'slds_dotsvmargin' || field == 'slds_arrowvmargin') label = 'VERTICAL SPACING, PX';
	if (field == 'slds_dotshmargin' || field == 'slds_arrowbetweenmargin') label = 'SPACING BETWEEN, PX';
	if (field == 'slds_arrowhmargin') label = 'Horizontal margin';

	// ekraniruem kavichki
	if (
		field == 'caption' ||
		field == 'alt' ||
		field == 'link' ||
		field == 'buttontitle' ||
		field == 'formmsgurl' ||
		field == 'formmsgsuccess' ||
		field == 'formbottomtext'
	) {
		value = value.replaceAll('"', '&quot;');
		value = value.split('"').join("'");
	}

	if (field == 'link') {
		value = value.trim();
	}

	if (field == 'formmsgsuccess' || field == 'formbottomtext') {
		if (typeof value != 'undefined' && value != '') {
			value = $('<div>' + value + '</div>').text();
		}
	}

	str += '<table class="sui-control-input"><tr><td>';

	if (field == 'animtriggeroffset') {
		str += '<label class="sui-label">' + label + '<div class="sui-label-ask tooltip" data-tooltip=""/>' + '</label>';
	} else if (field == 'alt') {
		link = "<a href='http://help.tilda.ws/search-engine#alt' target='_blank'>Learn more</a>";
		str +=
			'<label class="sui-label">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="Alt texts are used for SEO to describe <br /> the appearance of an image and its <br /> function on a web page. ' +
			link +
			'"/></label>';
	} else if (field == 'shadowx') {
		str +=
			'<label class="sui-label">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="Horizontal offset: a positive value moves <br /> the shadow to the right, a negative value <br /> moves the shadow to the left."/></label>';
	} else if (field == 'shadowy') {
		str +=
			'<label class="sui-label">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="Vertical offset: a positive value moves the shadow <br /> below the element, a negative value moves <br /> the shadow above it."/></label>';
	} else if (field == 'classname') {
		str +=
			'<label class="sui-label">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="This option sets a custom class name for the element."/>' +
			'</label>';
	} else if (field == 'vimeohash') {
		str +=
			'<label class="sui-label">' +
			label +
			'<div class="sui-label-ask tooltip" data-tooltip="If your video is private in Vimeo, <br> it will have an extra combination <br> of numbers and letters (hash) <br> at the end of the link. <br> Please add it to this field."/>' +
			'</label>';
	} else {
		str += '<label class="sui-label">' + label + '</label>';
	}

	str +=
		'</td>' +
		'<td style="width:100%;">' +
		'<div class="sui-input-div">' +
		'<input type="text" value="' +
		value +
		'" name="' +
		field +
		'" class="sui-input" autocomplete="off">' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	if ((field === 'color' || field === 'bgcolor') && tn_isGradientJSON(tn_replaceSingleQuotes(value))) {
		$c.find('.sui-input').attr('value', tn_replaceSingleQuotes(value));
	}

	$inp = $('.tn-settings [name=' + field + ']');
	$el = $('#' + elem_id);

	/*
  if(field=='bordercolor'){
    if(value==''){
      if(elem__getFieldValue(el,'borderwidth')==''){
        $('.tn-settings').find('[data-control-field=borderwidth]').closest('.sui-panel__table').css('display','none');
      }
      if(elem__getFieldValue(el,'borderstyle')==''){
        $('.tn-settings').find('[data-control-field=borderstyle]').closest('.sui-panel__table').css('display','none');
      }
    }
    if(value!=''){
      $('.tn-settings').find('[data-control-field=borderwidth]').closest('.sui-panel__table').css('display','table');
      $('.tn-settings').find('[data-control-field=borderstyle]').closest('.sui-panel__table').css('display','table');
    }
  }
  */

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

		if (
			field !== 'color' &&
			field !== 'zindex' &&
			field !== 'bgcolor' &&
			field !== 'tipbgcolor' &&
			field !== 'pincolor' &&
			field !== 'pinbgcolor' &&
			field !== 'pinbordercolor' &&
			field !== 'caption' &&
			field !== 'classname' &&
			field !== 'link' &&
			field !== 'shadowcolor' &&
			field !== 'bgcolorhover' &&
			field !== 'colorhover' &&
			field !== 'bordercolorhover' &&
			field !== 'inputcolor' &&
			field !== 'inputbgcolor' &&
			field !== 'inputbordercolor' &&
			field !== 'inputelscolor' &&
			field !== 'inputtitlecolor' &&
			field !== 'formname' &&
			field !== 'formerrreq' &&
			field !== 'formerremail' &&
			field !== 'formerrname' &&
			field !== 'buttontitle' &&
			field !== 'buttoncolor' &&
			field !== 'buttonbgcolor' &&
			field !== 'buttonbordercolor' &&
			field !== 'buttonhovercolor' &&
			field !== 'buttonhoverbgcolor' &&
			field !== 'buttonhoverbordercolor' &&
			field !== 'slds_arrowcolor' &&
			field !== 'slds_arrowcolorhover' &&
			field !== 'slds_arrowbgcolor' &&
			field !== 'slds_arrowbgcolorhover' &&
			field !== 'slds_dotsbgcolor' &&
			field !== 'slds_dotsbgcoloractive'
		) {
			if (e.which == 38) {
				v = parseFloat($inp.val());

				if (isNaN(v)) v = 0;

				v += 1;

				$inp.val(v);
				$inp.trigger('change');
			}

			if (e.which == 40) {
				v = parseFloat($inp.val());

				if (isNaN(v)) v = 0;

				v -= 1;

				$inp.val(v);
				$inp.trigger('change');
			}
		}
	});

	/*select all input value by click */
	$inp.on('focus', function () {
		var input = this;
		if (input.focused || input.name === 'formmsgsuccess' || input.name === 'formbottomtext') return;
		setTimeout(function () {
			input.select();
			input.focused = true;
		}, 100);
	});

	$inp.on('blur', function () {
		this.focused = false;
	});

	$inp.change(function () {
		tn_console('panelsettings onchange input');

		var v;
		var tv;
		var isHexColor;
		var isGradient;
		var pevent;
		var foo;
		var isGroupField;
		var $groups;
		var groupId;
		var $group;
		var propVal;
		var $element;
		var eltype;
		var isGradientField = field == 'color' || field == 'bgcolor' || field == 'bgcolorhover';

		if (field == 'formmsgsuccess' || field == 'formbottomtext') return;
		if (field !== 'zindex' && !isGradientField) {
			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			tn_set_lastChanges();
		}

		v = $inp.val();

		// del value in mobile res if empty string
		if (window.tn.curResolution != window.tn.topResolution && v == '') {
			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			elem__delFieldValue($el, field, '', 'render', 'updateui');

			tv = elem__getFieldValue($el, field);

			$(this).closest('.sui-form-group').attr('data-control-value', tv);
			$c.addClass('sui-form-group_undefined');
			tn_setOutlinePosition('selected');
			tn_set_lastChanges();

			return;
		}

		if (field == 'left' || field == 'top') {
			v = tn_calculateInputNumber(v);
			if (isNaN(v)) v = 0;
			$inp.val(v);
		}

		if (field == 'height') {
			v = tn_calculateInputNumber(v);

			if (isNaN(v)) v = 1;
			if (v == 0) v = 1;
			v = parseInt(v.toFixed(0), 10);

			$inp.val(v);
		}

		if (
			field == 'borderwidth' ||
			field == 'borderradius' ||
			field == 'shadowblur' ||
			field == 'shadowx' ||
			field == 'shadowy' ||
			field == 'shadowspread'
		) {
			if (v != '') {
				v = tn_calculateInputNumber(v);
				if (isNaN(v)) v = 0;
				$inp.val(v);
			}
		}

		if (tn_shapeBorderRadius__shouldShowHandle($el[0]) && field === 'borderradius') {
			tn_shapeBorderRadius__setHandlePosition($el[0], v);
		}

		if (
			field == 'inputbordersize' ||
			field == 'inputradius' ||
			field == 'inputheight' ||
			field == 'inputmarginbottom' ||
			field == 'inputtitlemargbottom' ||
			field == 'inputmargright' ||
			field == 'inputmargbottom' ||
			field == 'buttonbordersize' ||
			field == 'buttonradius' ||
			field == 'buttonmargtop' ||
			field == 'buttonwidth' ||
			field == 'buttonheight' ||
			field == 'buttonshadowsize' ||
			field == 'buttonhovershadowsize'
		) {
			if (v != '') {
				v = tn_calculateInputNumber(v);
				if (isNaN(v)) v = 0;
				$inp.val(v);
			}
		}

		if (
			field == 'slds_playiconsize' ||
			field == 'slds_captiontopmargin' ||
			field == 'slds_dotsvmargin' ||
			field == 'slds_arrowhmargin'
		) {
			if (v != '') {
				v = tn_calculateInputNumber(v);
				if (isNaN(v)) v = 0;
				$inp.val(v);
			}
		}

		if (field == 'slds_arrowlinesize') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 1;
				if (v > 6) v = 6;
				if (v < 1) v = 1;

				$inp.val(v);
			}
		}

		if (field == 'slds_dotssize') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 1;
				if (v > 20) v = 20;

				$inp.val(v);
			}
		}

		if (field == 'slds_arrowvmargin' || field == 'slds_arrowhmargin') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 0;
				if (v > 100) v = 100;

				$inp.val(v);
			}
		}

		if (field == 'slds_playiconsize') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 0;
				if (v > 200) v = 200;

				$inp.val(v);
			}
		}

		if (field == 'slds_arrowbetweenmargin') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 0;
				if (v > 1100) v = 1100;

				$inp.val(v);
			}
		}

		if (field == 'slds_autoplay') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = '';
				if (v > 100) v = 100;
				if (v <= 0) v = '';

				$inp.val(v);
			}
		}

		if (field == 'slds_dotshmargin' || field == 'slds_dotssize') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 0;
				if (v > 20) v = 20;

				$inp.val(v);
			}
		}

		if (field == 'slds_dotsvmargin') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 0;
				if (v > 50) v = 50;

				$inp.val(v);
			}
		}

		if (field == 'slds_arrowvmargin' || field == 'slds_dotssize') {
			if (v != '') {
				v = tn_calculateInputNumber(v);

				if (isNaN(v)) v = 0;
				if (v < 0) v = 0;

				$inp.val(v);
			}
		}

		// check correct color
		var isEnableSetGradient = false;
		if (
			field == 'color' ||
			field == 'bgcolor' ||
			field == 'bordercolor' ||
			field == 'shadowcolor' ||
			field == 'bgcolorhover' ||
			field == 'colorhover' ||
			field == 'bordercolorhover' ||
			field == 'tipbgcolor' ||
			field == 'pincolor' ||
			field == 'pinbgcolor' ||
			field == 'pinbordercolor' ||
			field == 'inputcolor' ||
			field == 'inputbgcolor' ||
			field == 'inputbordercolor' ||
			field == 'inputtitlecolor' ||
			field == 'inputelscolor' ||
			field == 'buttoncolor' ||
			field == 'buttonbgcolor' ||
			field == 'buttonbordercolor' ||
			field == 'buttonhovercolor' ||
			field == 'buttonhoverbgcolor' ||
			field == 'buttonhoverbordercolor' ||
			field == 'slds_arrowcolor' ||
			field == 'slds_arrowcolorhover' ||
			field == 'slds_arrowbgcolor' ||
			field == 'slds_arrowbgcolorhover' ||
			field == 'slds_dotsbgcolor' ||
			field == 'slds_dotsbgcoloractive' ||
			field == 'slds_playiconcolor'
		) {
			if (v != '') {
				v = tn_replaceSingleQuotes(v);
				isGradient = tn_isGradientJSON(v) || tn_isGradientStyle(v);

				if (!isGradient) {
					if (v.indexOf('#') == -1) {
						v = '#' + v;
					}

					v = v.toLowerCase().replace(/[^a-fA-F0-9#]+/g, '');

					if (v !== v) $inp.val(v);

					isHexColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(v);

					if (!isHexColor) v = '';
				} else {
					v = tn_replaceDoubleQuotes(v);
				}

				var oldValue = elem__getFieldValue($el, field);
				if (isGradientField && tn_replaceDoubleQuotes(v) !== tn_replaceDoubleQuotes(oldValue)) {
					isEnableSetGradient = true;
					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
					tn_set_lastChanges();
				}

				if (isHexColor || isGradient) $inp.val(v);
			} else {
				isEnableSetGradient = true;
			}
		}

		if (field == 'caption') {
			v = tn_stripTags(v);
		}

		if (field == 'classname') {
			v = v.replace(/[^a-zA-Z^\d^_^\-+$]/g, '');
			v = tn_stripTags(v);
		}

		if (
			field == 'link' ||
			field == 'formname' ||
			field == 'formmsgurl' ||
			field == 'formerrreq' ||
			field == 'formerremail' ||
			field == 'formerrphone' ||
			field == 'formerrname'
		) {
			v = tn_stripTags(v);
			v = v.replaceAll('"', '');
		}

		if (field == 'link') {
			v = v.trim();
			pevent = elem__getFieldValue($el, 'pevent');

			if (pevent == 'none') {
				tn_alert(
					'Sorry, you can not set this value. The field "POINTER EVENTS" set as NONE. Please set value as AUTO and try again.',
				);
				v = '';
				$(this).val(v);
			}

			if (v) {
				$settings.find('[data-control-field="linktarget"]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field="relnofollow"]').closest('.sui-panel__table').css('display', 'table');
				$settings.find('[data-control-field="buttonstat"]').closest('.sui-panel__table').css('display', 'table');
			} else {
				elem__emptyField($el, 'linktarget', false, 'updateui');
				elem__emptyField($el, 'relnofollow', false, 'updateui');
				elem__emptyField($el, 'buttonstat', false, 'updateui');
				$settings.find('[data-control-field="linktarget"]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field="relnofollow"]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('[data-control-field="buttonstat"]').closest('.sui-panel__table').css('display', 'none');
				$settings.find('.sui-form-group__hint_buttonstat').css('display', 'none');
			}
		}

		if (field == 'youtubeid') {
			foo = tn_parseYoutubelink(v);

			if (foo == false) foo = '';

			if (v != foo) {
				v = foo;
				$inp.val(v);
			}
		}

		if (field == 'vimeoid') {
			foo = tn_parseVimeolink(v);

			if (foo == false) foo = '';

			if (v != foo) {
				v = foo;
				$inp.val(v);
			}
		}

		if (field == 'endsec' || field == 'startsec' || field == 'buttonshadowopacity') {
			v = tn_calculateInputNumber(v);
			$inp.val(v);
		}

		$inp.closest('.sui-form-group').attr('data-control-value', v);

		isGroupField = field === 'left' || field === 'top';
		$groups = $('.tn-group__selected');

		if (!isGradientField || isEnableSetGradient) {
			if ($groups.length && isGroupField) {
				if (group__isSelectedOnlyGroups() && $groups.length === 1) {
					groupId = $('.tn-group__selected').attr('id');
					$group = group__getById(groupId);
					propVal = group__convertPosition__Local__toAbsolute($group, field, v);
					$group.css(field, propVal + 'px');

					group__setFieldValue(groupId, field, v);
					group__saveCurrentPosition(groupId, field);
				} else {
					$groups.each(function () {
						var $group = $(this);
						var groupId = $group.attr('id');
						var propVal = group__convertPosition__Local__toAbsolute($group, field, v);

						$group.css(field, propVal + 'px');

						group__setFieldValue(groupId, field, v);
						group__saveCurrentPosition(groupId, field);
					});

					$('.tn-artboard > .tn-elem__selected').each(function () {
						var $elem = $(this);
						elem__setFieldValue($elem, field, v);
						elem__renderViewOneField($elem, field);
					});
				}

				tn_setOutlinePosition('selected');
			} else {
				if (!window.tn.multi_edit) {
					elem__setFieldValue($el, field, v);
					elem__renderViewOneField($el, field);
				} else {
					for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
						$element = $(window.tn.multi_edit_elems[i]);

						if ((typeof v === 'number' && isNaN(v)) || typeof v === 'undefined') {
							elem__setFieldValue($element, field, elem__getFieldValue($element, field));
						} else {
							elem__setFieldValue($element, field, v);
						}

						elem__renderViewOneField($element, field);
					}
				}

				tn_setOutlinePosition('selected');
			}
		}

		$c.removeClass('sui-form-group_undefined');

		if (field == 'caption') {
			layers__update();
		}

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

	if (
		field == 'color' ||
		field == 'bgcolor' ||
		field == 'bordercolor' ||
		field == 'shadowcolor' ||
		field == 'bgcolorhover' ||
		field == 'bordercolorhover' ||
		field == 'colorhover' ||
		field == 'tipbgcolor' ||
		field == 'pincolor' ||
		field == 'pinbgcolor' ||
		field == 'pinbordercolor' ||
		field == 'inputcolor' ||
		field == 'inputbgcolor' ||
		field == 'inputbordercolor' ||
		field == 'inputtitlecolor' ||
		field == 'inputelscolor' ||
		field == 'buttoncolor' ||
		field == 'buttonbgcolor' ||
		field == 'buttonbordercolor' ||
		field == 'buttonhovercolor' ||
		field == 'buttonhoverbgcolor' ||
		field == 'buttonhoverbordercolor' ||
		field == 'slds_arrowcolor' ||
		field == 'slds_arrowcolorhover' ||
		field == 'slds_arrowbgcolor' ||
		field == 'slds_arrowbgcolorhover' ||
		field == 'slds_dotsbgcolor' ||
		field == 'slds_dotsbgcoloractive' ||
		field == 'slds_playiconcolor'
	) {
		var eltype = $el.attr('data-elem-type');

		value = tn_replaceSingleQuotes(value);
		tn_initMinicolors($inp, field, value, eltype);
	}

	if (field == 'zindex') {
		$inp.css('display', 'none');

		$c.find('.sui-input-div').after(
			'<div class="sui-btn-ico sui-btn-back" data-helper="Send to back" style="padding-right:0px;"><div class="sui-btn-back__icon tooltip" data-tooltip="Send to back"></div></div>',
		);
		$c.find('.sui-input-div').after(
			'<div class="sui-btn-ico sui-btn-front" data-helper="Bring to front"><div class="sui-btn-front__icon tooltip" data-tooltip="Bring to front"/></div>',
		);
		$c.find('.sui-input-div').after(
			'<div class="sui-btn-ico sui-btn-backward" data-helper="Send backward"><div class="sui-btn-backward__icon tooltip" data-tooltip="Send backward"/></div>',
		);
		$c.find('.sui-input-div').after(
			'<div class="sui-btn-ico sui-btn-forward" data-helper="Bring forward" style="padding-left:0px;"><div class="sui-btn-frontward__icon tooltip" data-tooltip="Bring forward"/></div>',
		);

		$c.find('.sui-btn-back').click(function () {
			tn_arrange__sendBack($el);
		});
		$c.find('.sui-btn-front').click(function () {
			tn_arrange__sendFront($el);
		});
		$c.find('.sui-btn-backward').click(function () {
			tn_arrange__backward($el);
		});
		$c.find('.sui-btn-forward').click(function () {
			tn_arrange__forward($el);
		});
	}

	if (field === 'link') {
		if (!value) {
			$settings.find('[data-control-field="linktarget"]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field="relnofollow"]').closest('.sui-panel__table').css('display', 'none');
			$settings.find('[data-control-field="buttonstat"]').closest('.sui-panel__table').css('display', 'none');
		}
	}

	if (field == 'formbottomtext' || field == 'formmsgsuccess') {
		$inp.focusin(function () {
			tn_input__openRedactor($el, field);
		});

		$c.find('.sui-input-link-editinredactor').click(function () {
			tn_input__openRedactor($el, field);
		});
	}

	if (
		(field === 'width' || field === 'height' || field === 'left' || field === 'top') &&
		group__isSelectedOnlyGroups()
	) {
		propVals = [];
		groups = $('.tn-group__selected');

		groups.each(function () {
			var $group = $(this);
			var value = parseInt($group.css(field), 10);

			if (field === 'left' || field === 'top') {
				value = group__convertPosition__Absolute__toLocal($group, field, value);
			}

			if (propVals.indexOf(value) === -1) propVals.push(value);
		});

		$inp.val(propVals.length === 1 ? propVals[0] : 'Mixed');

		if (field === 'width' || field === 'height') {
			$inp.css('opacity', '0.3');
			$inp.css('transition', 'none');
			$inp.addClass('sui-input__disabled');
			$inp.prop('disabled', true);
			$inp.parents('.sui-form-group').css('padding-top', '0px');
		}
	}

	if (window.tn.multi_edit && $inp.css('display') !== 'none') {
		if ($('.tn-group__selected').length) tn_multiEdit__updateUi();
		var isMixed = control__drawUi__getMixedState(field);
		if (isMixed) $inp.val('Mixed');
	}

	isValueNotInitial = function () {
		return !$inp.val() && $inp.val() !== 'undefined' && isMixed;
	};

	$inp.focus(function () {
		if ($inp.val() === 'Mixed') {
			$inp.val('');
		}
	});

	$inp.blur(function () {
		if (isValueNotInitial() && window.tn.multi_edit) {
			$inp.val('Mixed');
		}
	});
}
