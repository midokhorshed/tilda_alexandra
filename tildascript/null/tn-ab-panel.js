function panelABSettings__open() {
	tn_console('func: panelArtboard__open');

	var $artboard = $('.tn-artboard');
	var $rightBox = $('.tn-right-box');

	$rightBox.removeClass('tn-right-box_hide');
	$rightBox.html(
		'<div class="tn-right-box__header"><span class="tn-right-box__caption">Artboard settings</span><img src="img/modalClosebutton.png" class="tn-right-box__icon" width="15px"></div>',
	);
	$('.tn-right-box__header').click(function () {
		tn_console('click: Minify panel');
		tn_toggleSettings(true);
	});

	$rightBox.append('<div class="tn-settings" data-for-artboard="artboard"></div>');

	var $panel = $('.tn-settings');

	// prettier-ignore
	var wire = '' +
	'<div class="sui-panel__section sui-panel__section">' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="height" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'</div>' +
	'<div class="sui-panel__section sui-panel__section-more">' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="height_vh" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="valign" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="upscale" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'</div>' +
	'<div class="sui-panel__section sui-panel__section">' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="bgcolor" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'</div>' +
	'<div class="sui-panel__section sui-panel__section-image">' +
	'  <label class="sui-label sui-label_title" style="width:100%;">Background image</label>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="bgimg" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="bgattachment" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="bgposition" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="filtercolor" data-control-value=""></div>' +
	'    </td>' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="filteropacity" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'  <table class="sui-panel__table sui-panel__padd_b-10">' +
	'   <tr class="sui-panel__tr">' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="filtercolor2" data-control-value=""></div>' +
	'    </td>' +
	'    <td class="sui-panel__td">' +
	'    <div class="sui-form-group" data-control-field="filteropacity2" data-control-value=""></div>' +
	'    </td>' +
	'   </tr>' +
	'  </table>' +
	'</div>';

	if (window.userrole === 'tester') {
		// prettier-ignore
		wire += '' +
			'<div class="sui-panel__section sui-panel__section-ovrflw" data-section-name="ovrflw">' +
			'  <label class="sui-label sui-label_title" style="width:100%;">Overflow</label>' +
			'  <table class="sui-panel__table sui-panel__padd_b-10">' +
			'    <tr class="sui-panel__tr">' +
			'      <td class="sui-panel__td">' +
			'        <div class="sui-form-group" data-control-field="ovrflw" data-control-value=""></div>' +
			'      </td>' +
			'    </tr>' +
			'  </table>' +
			'  <table class="sui-panel__table sui-panel__padd_b-10">' +
			'    <tr class="sui-panel__tr">' +
			'      <td class="sui-panel__td">' +
			'        <div class="sui-form-group" data-control-field="isolation" data-control-value=""></div>' +
			'      </td>' +
			'    </tr>' +
			'  </table>' +
			'  <div class="sui-form-group__hint sui-form-group__hint_overflow" style="display: none;">Isolation Z-index may conflict with Overflow: Visible or Auto option. Be careful when using these options together.</div>' +
			'</div>';
	} else {
		// prettier-ignore
		wire += '' +
			'<div class="sui-panel__section sui-panel__section-other">' +
			'  <table class="sui-panel__table sui-panel__padd_b-10">' +
			'    <tr class="sui-panel__tr">' +
			'      <td class="sui-panel__td">' +
			'        <div class="sui-form-group" data-control-field="ovrflw" data-control-value=""></div>' +
			'      </td>' +
			'    </tr>' +
			'  </table>' +
			'</div>';
	}

	// prettier-ignore
	wire += '' +
		'<div class="sui-panel__section sui-panel__section-grid">' +
		'  <table class="sui-panel__table sui-panel__padd_b-10">' +
		'    <tr class="sui-panel__tr">' +
		'      <td class="sui-panel__td">' +
		'        <div class="sui-form-group" data-control="grid" data-control-value=""></div>' +
		'      </td>' +
		'    </tr>' +
		'  </table>' +
		'</div>';

	$panel.append(wire);

	var res = window.tn.curResolution;
	var fields = window.tn.ab_fields;
	var overflowValue = '';
	var isolationValue = '';

	/* Add Controls */
	fields.forEach(function (field) {
		var value = ab__getFieldValue($artboard, field);

		var cel = $panel.find('[data-control-field="' + field + '"]');
		cel.attr('data-control-value', value);

		if (field === 'bgimg') {
			ab__control__drawUi__upload(field);
		} else if (
			field === 'upscale' ||
			field === 'bgattachment' ||
			field === 'bgposition' ||
			field === 'filteropacity' ||
			field === 'filteropacity2' ||
			field === 'valign' ||
			field === 'ovrflw' ||
			field === 'isolation'
		) {
			ab__control__drawUi__selectbox(field);
		} else {
			ab__control__drawUi__input(field);
		}

		if (res != window.tn.topResolution) {
			if (field === 'ovrflw') {
				cel.closest('.sui-panel__section-ovrflw').css('display', 'none');
				if (field === 'ovrflw') cel.closest('.sui-panel__section-other').css('display', 'none');
			} else {
				var value_for_res = ab__getFieldValue_for_Res($artboard, field, res);
				if (typeof value_for_res === 'undefined') {
					cel.addClass('sui-form-group_undefined');
				}
			}
		}

		if (field === 'ovrflw') overflowValue = value;
		if (field === 'isolation') isolationValue = value;
	});

	control__drawui__gridopenbtn();

	tn_tooltip_update();

	// default values for these settings are empty string
	// if the value of the default settings, then the panel is hidden
	if (!overflowValue && !isolationValue) {
		$('.sui-panel__section-ovrflw').addClass('sui-panel__section_closed');
	}

	if (overflowValue === 'visible' && isolationValue === 'isolate') {
		$('.sui-form-group__hint_overflow').css('display', 'block');
	}
}

function ab__panelSettings__updateUi(ab, field, new_value) {
	tn_console('func: ab__panelSettings__updateUi. field: ' + field);

	var $control = $('[data-control-field=' + field + ']');
	if (typeof new_value == 'undefined') new_value = ab__getFieldValue(ab, field);
	$control.attr('data-control-value', new_value);
	var $inp = $('.tn-settings [name=' + field + ']');
	$inp.val(new_value);

	if (field == 'bgcolor' || field == 'filtercolor' || field == 'filtercolor2') {
		ab__control__drawUi__input(field);
	}

	if (field == 'bgimg') {
		var fdiv = $control.find('.sui-file-div');
		var flabel = $control.find('.sui-file-label');

		if (typeof new_value != 'undefined' && new_value != '') {
			flabel.html('...' + new_value.substr(new_value.length - 15));
			fdiv.css('display', 'block');
		} else {
			flabel.html('');
			fdiv.css('display', 'none');
		}
	}

	tn_tooltip_update();
}
