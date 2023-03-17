function ab__openZBSettings() {
	var $rightBox = $('.tn-right-box');
	var $panel;
	var wire = '';

	$rightBox.removeClass('tn-right-box_hide');

	$rightBox.html(
		'<div class="tn-right-box__header">' +
			'<span class="tn-right-box__caption">Zero Block settings</span>' +
			'<img src="img/modalClosebutton.png" class="tn-right-box__icon" width="15px">' +
			'</div>',
	);

	$('.tn-right-box__header').click(function () {
		tn_console('click: Minify panel');
		tn_toggleSettings(true);
	});

	$rightBox.append('<div class="tn-settings" data-for-artboard="grid"></div>');
	$panel = $('.tn-settings');

	var gridVideoLink;
	if (window.tn.lang === 'RU') {
		gridVideoLink = 'https://youtu.be/NVatCvA4OKU';
	} else {
		gridVideoLink = 'https://youtu.be/YnMqe8Iizpg';
	}

	// Grid ssettings
	// prettier-ignore
	wire += '' +
	'<div class="sui-panel__section">' +
		'<div class="sui-btn sui-btn-close">' +
			'Back to artboard settings' +
		'</div>' +
		'<table class="sui-panel__table sui-panel__table_toggle">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group_toggle" data-control-field="grid_show" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__table_toggle">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group_toggle" data-control-field="ui_show" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__table_toggle">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group_toggle" data-control-field="layers_show" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__table_toggle">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group_toggle" data-control-field="guides_show" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__table_toggle">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group sui-form-group_toggle" data-control-field="snapping_disable" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
	'</div>' +
	// Grid settings
	'<div class="sui-panel__section sui-panel__section-grid" data-section-name="grid">' +
		'<label class="sui-label sui-label_title">Grid ' + window.tn.curResolution +
			'<div class="sui-label-ask tooltip" data-tooltip="The modular grid defines the basic structure <br>of your design and speeds up your workflow. <br>It creates a unified layout of all website elements <br>and blocks and maintains visual order.' +
				'<br><br>' +
				'<a href=\'' + gridVideoLink + '\' target=\'_blank\'>' +
				'<svg style=\'position:relative;top:3px;\' width=\'21\' height=\'18\' viewBox=\'0 0 36 33\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'>' +
					'<circle cx=\'27.254\' cy=\'8.746\' r=\'7.996\' stroke=\'#ffffff\' stroke-width=\'1.5\'></circle>' +
					'<path d=\'M27.252 13.994V6.997M27.252 5.249v-1.75\' stroke=\'#ffffff\' stroke-width=\'2\'></path>' +
					'<path d=\'M13.025 24.026V16.82l5.024 3.602-5.024 3.603z\' fill=\'#ffffff\' stroke=\'#ffffff\'></path>' +
					'<path d=\'M13.91 8.348H4a3 3 0 00-3 3v17.32a3 3 0 003 3h22.318a3 3 0 003-3v-7.41\' stroke=\'#ffffff\' stroke-width=\'1.5\'></path>' +
				'</svg>' +
				'<span style=\'margin-left:7px;\'>Video tutorial</span>' +
				'</a>' +
			'"></div>' +
		'</label>' +
		// Grid column settings
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="columns" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="columnwidth" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="columngutter" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="columnmargins" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		// Grid row settings
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="rowbaseline" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="rowmoduleheight" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="rowmargins" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="gridcolor" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="gridopacity" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="gridlineopacity" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="gridglobal" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control="gridreset"></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
	'</div>' +
	'<div class="sui-panel__section sui-panel__section-theme" data-section-name="theme">' +
	'<label class="sui-label sui-label_title">Theme</label>' +
	'<table class="sui-panel__table sui-panel__padd_b-10">' +
		'<tr class="sui-panel__tr">' +
			'<td class="sui-panel__td">' +
				'<div class="sui-form-group" data-control-field="themesize" data-control-value=""></div>' +
			'</td>' +
		'</tr>' +
	'</table>' +
		'<table class="sui-panel__table sui-panel__padd_b-10">' +
			'<tr class="sui-panel__tr">' +
				'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="themecolor" data-control-value=""></div>' +
				'</td>' +
			'</tr>' +
		'</table>' +
	'</div>';

	// TODO: add setting theme classes in init functions

	$panel.append(wire);
	$panel.find('.sui-btn-close').click(floor__mousedown);
	ab__addSettingsControls();
	ab__addGridControls();
	control__drawui__gridReset();
	tn_addSectionHandlers();
	tn_tooltip_update();
	$rightBox.animate({scrollTop: 0}, 100);
}

function ab__addSettingsControls() {
	var wrprDisplay = $('.tn-guides-wrpr').css('display');
	var isSnapDisabled = tn_getLocalField('isSnapDisabled');
	window.tn_guides_off = '';

	var fields = [
		{
			name: 'themesize',
			type: 'select',
			onChange: function (val) {
				if (val === 'minimal') {
					localStorage.setItem('tzerothemesize', 'minimal');
					$('body').addClass('tn-theme-minimal');
				} else {
					localStorage.removeItem('tzerothemesize');
					$('body').removeClass('tn-theme-minimal');
				}
			},
		},
		{
			name: 'themecolor',
			type: 'select',
			onChange: function (val) {
				if (val === 'dark') {
					localStorage.setItem('tzerothemecolor', 'dark');
					$('body').removeClass('tn-theme-light');
					$('body').addClass('tn-theme-dark');
				} else if (val === 'light') {
					localStorage.setItem('tzerothemecolor', 'light');
					$('body').removeClass('tn-theme-dark');
					$('body').addClass('tn-theme-light');
				} else {
					localStorage.removeItem('tzerothemecolor');
					$('body').removeClass('tn-theme-dark');
					$('body').removeClass('tn-theme-light');
				}
			},
		},
		{
			name: 'grid_show',
			type: 'toggle',
			label: 'Hide Grid',
			isActive: function () {
				return window.tn_guides_off === 'y';
			},
			checkedAttr: window.tn_guides_off === 'y' ? ' checked="checked"' : '',
			activeClass: window.tn_guides_off === 'y' ? ' sui-toggle_on' : '',
			onChange: function () {
				tn_toggleGrid();
			},
		},
		{
			name: 'ui_show',
			type: 'toggle',
			label: 'Hide UI',
			isActive: function () {
				return window.tn_ui_hidden === 'y';
			},
			checkedAttr: window.tn_ui_hidden === 'y' ? ' checked="checked"' : '',
			activeClass: window.tn_ui_hidden === 'y' ? ' sui-toggle_on' : '',
			onChange: function () {
				tn_toggleUI();
			},
		},
		{
			name: 'layers_show',
			type: 'toggle',
			label: 'Show Layers',
			isActive: function () {
				return window.tn_layers_panel === 'open';
			},
			checkedAttr: window.tn_layers_panel === 'open' ? ' checked="checked"' : '',
			activeClass: window.tn_layers_panel === 'open' ? ' sui-toggle_on' : '',
			onChange: function () {
				panelLayers__showhide();
			},
		},
		{
			name: 'guides_show',
			type: 'toggle',
			label: 'Show Guides',
			isActive: function () {
				return wrprDisplay !== 'none';
			},
			checkedAttr: wrprDisplay !== 'none' ? ' checked="checked"' : '',
			activeClass: wrprDisplay !== 'none' ? ' sui-toggle_on' : '',
			onChange: function () {
				tn_toggleGuides();
			},
		},
		{
			name: 'snapping_disable',
			type: 'toggle',
			label: 'Disable Snapping',
			isActive: function () {
				return isSnapDisabled;
			},
			checkedAttr: isSnapDisabled ? ' checked="checked"' : '',
			activeClass: isSnapDisabled ? ' sui-toggle_on' : '',
			onChange: function () {
				tn_toggleSnap();
			},
		},
	];

	fields.forEach(function (field) {
		if (field.type === 'toggle') {
			ab__control__drawUi__toggle(field);
		} else if (field.type === 'select') {
			ab__control__drawUi__selectbox(field.name, field.onChange);
		}
	});
}
function ab__addGridControls() {
	var $panel = $('.tn-settings');
	var $artboard = $('.tn-artboard');
	var gridOptions = ab__getGridOptions($artboard);
	var value;
	var cel;
	if (!gridOptions) return;

	for (var field in gridOptions) {
		value = gridOptions[field];
		cel = $panel.find('[data-control-field="' + field + '"]');
		cel.attr('data-control-value', value || '');

		if (field === 'gridopacity' || field === 'gridlineopacity') {
			ab__control__drawUi__selectbox(field);
		} else {
			ab__control__drawUi__input(field);
		}
	}

	var abAttrFields = ['gridcolor', 'gridopacity', 'gridlineopacity', 'gridglobal'];
	var gridColor = ab__getGridColors($artboard);
	abAttrFields.forEach(function (field) {
		cel = $panel.find('[data-control-field="' + field + '"]');
		if (field === 'gridglobal') {
			value = ab__getFieldValue($artboard, 'gridglobal');
		} else {
			value = gridColor[field];
		}
		cel.attr('data-control-value', value);
		if (field === 'gridcolor') {
			ab__control__drawUi__input(field);
		} else {
			ab__control__drawUi__selectbox(field);
		}
		if (window.tn.curResolution != window.tn.topResolution) {
			var resValue = ab__getFieldValue_for_Res($artboard, field, window.tn.curResolution);
			if (typeof resValue === 'undefined') {
				cel.addClass('sui-form-group_undefined');
			}
		}
	});

	if (window.tn.curResolution != window.tn.topResolution) {
		$('[data-control-field="gridglobal"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control-field="gridcolor"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control-field="gridopacity"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control-field="gridlineopacity"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control="gridreset"]').closest('.sui-panel__table').css('display', 'none');
	}
}
