/* ------------------------ */
/* Settings UI */

function control__drawUi__updateVideoParams(value, $settings, $el, needUpdateAttr) {
	var youTubeFields = ['youtubeid', 'startsec', 'endsec'];
	var vimeoFields = ['vimeoid', 'showinfo', 'vimeohash'];
	var htmlVideoFilds = ['mp4video'];

	if (value === '' || value === 'y') {
		youTubeFields.forEach(function (field) {
			$settings
				.find('[data-control-field="' + field + '"]')
				.closest('.sui-panel__table')
				.css('display', 'table');
		});
		vimeoFields.concat(htmlVideoFilds).forEach(function (field) {
			$settings
				.find('[data-control-field="' + field + '"]')
				.closest('.sui-panel__table')
				.css('display', 'none');
			if (needUpdateAttr) elem__emptyField($el, field, '', 'updateui');
		});
	} else if (value === 'v') {
		vimeoFields.forEach(function (field) {
			$settings
				.find('[data-control-field="' + field + '"]')
				.closest('.sui-panel__table')
				.css('display', 'table');
		});
		youTubeFields.concat(htmlVideoFilds).forEach(function (field) {
			$settings
				.find('[data-control-field="' + field + '"]')
				.closest('.sui-panel__table')
				.css('display', 'none');
			if (needUpdateAttr) elem__emptyField($el, field, '', 'updateui');
		});
	} else if (value === 'html') {
		htmlVideoFilds.forEach(function (field) {
			$settings
				.find('[data-control-field="' + field + '"]')
				.closest('.sui-panel__table')
				.css('display', 'table');
		});
		youTubeFields.concat(vimeoFields).forEach(function (field) {
			$settings
				.find('[data-control-field="' + field + '"]')
				.closest('.sui-panel__table')
				.css('display', 'none');
			if (needUpdateAttr) elem__emptyField($el, field, '', 'updateui');
		});
	}
}

function control__drawUi__radio(elem_id, field) {
	var $c = $('[data-control-field=' + field + ']');
	var value = $c.attr('data-control-value');
	var str = '';
	var $inp;

	if (typeof value === 'undefined') return true;

	str += '<div class="sui-radio">' + '<div class="sui-radio-div">';

	if (field == 'align') {
		str +=
			'<table class="sui-control-radio">' +
			'<tr>' +
			'<td>' +
			'<input type="radio" id="left" name="align" ' +
			(value == 'left' ? 'checked="checked"' : '') +
			'><label for="left">Left</label>' +
			'</td>' +
			'<td>' +
			'<input type="radio" id="center" name="align" ' +
			(value == 'center' ? 'checked="checked"' : '') +
			'><label for="center">Center</label>' +
			'</td>' +
			'<td>' +
			'<input type="radio" id="right" name="align" ' +
			(value == 'right' ? 'checked="checked"' : '') +
			'><label for="right">Right</label>' +
			'</td>' +
			'</tr>' +
			'</table>';
	}

	str += '</div></div>';

	$c.html(str);

	$c.find('.sui-radio-div').buttonset();

	$inp = $('.tn-settings [name=' + field + ']');

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
		var v = $(this).attr('id');
		var $element;

		tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

		$(this).closest('.sui-form-group').attr('data-control-value', v);
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

		$c.removeClass('sui-form-group_undefined');
		tn_set_lastChanges();
	});
}

function control__drawUi__lettercase(elem_id, field) {
	var $controlField = $('[data-control-field=' + field + ']');
	var value = $controlField.attr('data-control-value');
	if (typeof value === 'undefined') return true;

	var changeValue = function ($this, id) {
		var $el = $('#' + elem_id);

		tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

		$this.closest('.sui-form-group').attr('data-control-value', id);
		if (!window.tn.multi_edit) {
			elem__setFieldValue($el, field, id);
			elem__renderViewOneField($el, field);
		} else {
			for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
				var element = window.tn.multi_edit_elems[i];
				elem__setFieldValue($(element), field, id);
				elem__renderViewOneField($(element), field);
			}
		}

		$controlField.removeClass('sui-form-group_undefined');
		tn_set_lastChanges();
		tn_setOutlinePosition('selected');
	};

	var str =
		'<table class="sui-control-lettercase" style="width:100%;">' +
		'<tr>' +
		'<td>' +
		'<label class="sui-label">Letter case</label>' +
		'</td>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn-lettercase sui-btn-lettercase-reset">' +
		'<svg width="8" height="2" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1H0" stroke="#000"/></svg>' +
		'</div>' +
		'<div class="sui-btn-lettercase sui-radio-lettercase"><input type="radio" id="uppercase" class="ui-helper-hidden-accessible" name="lettercase" ' +
		(value === 'uppercase' ? 'checked="checked"' : '') +
		'><label for="uppercase">AG</label></div>' +
		'<div class="sui-btn-lettercase sui-radio-lettercase"><input type="radio" id="capitalize" class="ui-helper-hidden-accessible" name="lettercase" ' +
		(value === 'capitalize' ? 'checked="checked"' : '') +
		'><label for="capitalize">Ag</label></div>' +
		'<div class="sui-btn-lettercase sui-radio-lettercase"><input type="radio" id="lowercase" class="ui-helper-hidden-accessible" name="lettercase" ' +
		(value === 'lowercase' ? 'checked="checked"' : '') +
		'><label for="lowercase">ag</label></div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$controlField.html(str);

	var $btnReset = $('.sui-btn-lettercase-reset');

	if (value !== '') {
		$('#' + value)
			.parent()
			.addClass('sui-btn-lettercase_active');
	} else {
		$btnReset.addClass('sui-btn-lettercase_active');
	}

	$btnReset.on('click', function () {
		var $this = $(this);
		var id = '';
		changeValue($this, id);
		$('.sui-btn-lettercase').removeClass('sui-btn-lettercase_active');
		$this.addClass('sui-btn-lettercase_active');
	});

	$('.tn-settings [name=' + field + ']').on('click change', function () {
		var $this = $(this);
		changeValue($this, $this.attr('id'));
		$('.sui-btn-lettercase').removeClass('sui-btn-lettercase_active');
		$this.parent().addClass('sui-btn-lettercase_active');
	});
}

// TODO: unite buttons drawing in one component
// control__drawUi__actions
// control__drawUi__animtest
// control__drawui__gridReset
function control__drawui__gridReset() {
	var $panel = $('.tn-settings');
	var $cell = $panel.find('[data-control="gridreset"]');
	var str = '';

	str +=
		'<table>' +
		'<tr>' +
		'<td>' +
		'<label class="sui-label">Reset</label>' +
		'</td>' +
		'<td style="width:100%;white-space:nowrap;">' +
		'<div class="sui-btn sui-btn_sm sui-btn-reset">Reset grid settings to default</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$cell.html(str);

	$cell.find('.sui-btn-reset').click(function () {
		if (confirm('Are you sure? Grid settings will be removed for all screens.')) {
			ab__resetGrid();
			localStorage.removeItem('tzerogridlock');
			$('.sui-layer__lock__icon').removeClass('sui-layer__lock__icon_locked');
			ab__renderGrid();
			ab__openZBSettings();
			tn_set_lastChanges();
		}
	});
}

function control__drawUi__actions(elem_id) {
	var $el = $('#' + elem_id);
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=actions]');
	var isShowGroups =
		group__isSelectedOnlyGroups() || ($('.tn-elem__selected').length > 1 && $('.tn-group__selected').length === 0);
	var str = '';
	var el_lock;

	str +=
		'<table>' +
		'<tr>' +
		'<td>' +
		'<label class="sui-label">Actions</label>' +
		'</td>' +
		'<td style="width:100%;white-space:nowrap;">' +
		'<div class="sui-btn sui-btn_sm sui-btn-dupl">Copy</div>' +
		'<div class="sui-btn sui-btn_sm sui-btn-del">Delete</div>' +
		'<div class="sui-btn sui-btn_sm sui-btn-lock" style="margin-right:0;">Lock</div>' +
		'</td>' +
		'</tr>';

	if (isShowGroups) {
		str +=
			'<tr>' +
			'<td style="width: 85px"></td>' +
			'<td style="white-space:nowrap;">' +
			'<div class="sui-btn sui-btn_sm sui-btn-group">' +
			(group__isSelectedOnlyGroups() ? 'Ungroup' : 'Group') +
			'</div>' +
			'</td>' +
			'</tr>';
	}

	str += '</table>';

	$c.html(str);

	$c.find('.sui-btn-del').click(function () {
		tn_elem__delete(group__isSelectedOnlyGroups() ? null : $el);
	});

	$c.find('.sui-btn-dupl').click(function () {
		tn_elem__copy(group__isSelectedOnlyGroups() ? null : $el);
	});

	$c.find('.sui-btn-lock').click(function () {
		var groupId;

		if (group__isSelectedOnlyGroups()) {
			$('.tn-group__selected').each(function () {
				groupId = $(this).attr('id');
				group__lock(groupId);
			});
		} else {
			tn_elem__lock();
		}
	});

	if (isShowGroups) {
		$c.find('.sui-btn-group').click(function () {
			if (group__isSelectedOnlyGroups()) {
				group__unmake();
				panelSettings__openTimeout();
			} else {
				group__create();
			}
		});
	}

	el_lock = elem__getFieldValue($el, 'lock');

	if (el_lock == 'y') {
		$c.find('.sui-btn-lock').html('Unlock');
	} else {
		$c.find('.sui-btn-lock').html('Lock');
	}
}

function control__drawUi__animtest(elem_id) {
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=animtest]');
	var str =
		'<table>' +
		'<tr>' +
		'<td>' +
		'<label class="sui-label">Test</label>' +
		'</td>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn sui-btn_sm sui-btn-anim-test-el">Play Element</div>' +
		'<div class="sui-btn sui-btn_sm sui-btn-anim-test-all">Play All</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-anim-test-el').click(function () {
		var elem_test = $('.tn-elem__selected');
		tn_anim__playElem(elem_test);
	});

	$c.find('.sui-btn-anim-test-all').click(function () {
		tn_anim__playAll();
	});
}

function control__drawUi__alignelems() {
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=alignelem]');
	var str =
		'<table class="sui-form-group-align__table">' +
		'<tr>' +
		'<td>' +
		'<label class="sui-label" style="width:200px;">Align elements</label>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-table-align" style="width:100%;">' +
		'<tr>' +
		'<td>' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-arr-left" style="padding-left:0px;"></div>' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-arr-center"></div>' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-arr-right"></div>' +
		'</td>' +
		'<td>' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-arr-top"></div>' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-arr-middle"></div>' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-arr-bottom"></div>' +
		'</td>' +
		'<td style="text-align:right;">' +
		'<div class="sui-btn-ico sui-btn-ico_elems sui-btn-context-distribution">' +
		'<svg class="sui-btn-ico-square" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">' +
		'<path d="M5.5.5h-5v5h5v-5zM5.5 8.5h-5v5h5v-5zM13.5.5h-5v5h5v-5zM13.5 8.5h-5v5h5v-5z" stroke="#B6B6B6"/>' +
		'</svg>' +
		'<svg class="sui-btn-ico-arrow" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">' +
		'<path d="M1 1l3 3 3-3" stroke="#000"/>' +
		'</svg>' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'<table class="sui-table-align-eachother">' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-radio-div sui-radio-div-eachother">' +
		'<input type="radio" name="align_via" value="eachother" checked>' +
		'<span class="sui-radio-label" data-radio-name="align_via" data-radio-val="eachother">to each other</span>' +
		'</div>' +
		'<div class="sui-radio-div sui-radio-div-grid">' +
		'<input type="radio" name="align_via" value="grid">' +
		'<span class="sui-radio-label" data-radio-name="align_via" data-radio-val="grid">to grid container</span>' +
		'</div>' +
		'<div class="sui-radio-div sui-radio-div-window">' +
		'<input type="radio" name="align_via" value="window">' +
		'<span class="sui-radio-label" data-radio-name="align_via" data-radio-val="window">to window</span>' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-arr-left').click(function () {
		var align_via;

		tn_undo__Add('elems_selected_move');

		align_via = $c.find('[name=align_via]:checked').val();

		elems__selected__alignLeft('left', align_via);
		tn_set_lastChanges();
		tn_multiEdit__updateUi();
	});

	$c.find('.sui-btn-arr-center').click(function () {
		var align_via;

		tn_undo__Add('elems_selected_move');

		align_via = $c.find('[name=align_via]:checked').val();

		elems__selected__alignLeft('center', align_via);
		tn_set_lastChanges();
		tn_multiEdit__updateUi();
	});

	$c.find('.sui-btn-arr-right').click(function () {
		var align_via;

		tn_undo__Add('elems_selected_move');

		align_via = $c.find('[name=align_via]:checked').val();

		elems__selected__alignLeft('right', align_via);
		tn_set_lastChanges();
		tn_multiEdit__updateUi();
	});

	$c.find('.sui-btn-arr-top').click(function () {
		var align_via;

		tn_undo__Add('elems_selected_move');

		align_via = $c.find('[name=align_via]:checked').val();

		elems__selected__alignTop('top', align_via);
		tn_set_lastChanges();
		tn_multiEdit__updateUi();
	});

	$c.find('.sui-btn-arr-middle').click(function () {
		var align_via;

		tn_undo__Add('elems_selected_move');

		align_via = $c.find('[name=align_via]:checked').val();

		elems__selected__alignTop('middle', align_via);
		tn_set_lastChanges();
		tn_multiEdit__updateUi();
	});

	$c.find('.sui-btn-arr-bottom').click(function () {
		var align_via;

		tn_undo__Add('elems_selected_move');

		align_via = $c.find('[name=align_via]:checked').val();

		elems__selected__alignTop('bottom', align_via);
		tn_set_lastChanges();
		tn_multiEdit__updateUi();
	});

	$('.sui-radio-label').click(function () {
		var n = $(this).attr('data-radio-name');
		var v = $(this).attr('data-radio-val');

		$('[name=' + n + '][value=' + v + ']').trigger('click');
	});

	$('.tn-elem__selected').each(function () {
		var $el = $(this);
		var container = elem__getFieldValue($el, 'container');

		if (container == 'window') {
			$('.sui-radio-div-grid').css('display', 'none');
		} else {
			$('.sui-radio-div-window').css('display', 'none');
		}
	});
}

function control__drawUi__alignelem(elemId, isGroup) {
	var $el = $('#' + elemId);
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=alignelem]');

	var str =
		'<table>' +
		'<tr>' +
		'<td style="width:50%;">' +
		'<div class="sui-btn-ico sui-btn-alig-left" style="padding-left:0px;"></div>' +
		'<div class="sui-btn-ico sui-btn-alig-center"></div>' +
		'<div class="sui-btn-ico sui-btn-alig-right"></div>' +
		'</td>' +
		'<td style="width:70px;"></td>' +
		'<td style="width:50%;">' +
		'<div class="sui-btn-ico sui-btn-alig-top"></div>' +
		'<div class="sui-btn-ico sui-btn-alig-middle"></div>' +
		'<div class="sui-btn-ico sui-btn-alig-bottom"></div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-alig-left').click(function () {
		var container;

		tn_undo__Add('elems_selected_move');

		if (isGroup) {
			container = group__getFieldValue($el, 'container');
			group__aligntoCanvas('left', container);
		} else {
			container = elem__getFieldValue($el, 'container');
			elem__aligntoCanvas('left', container);
		}

		tn_set_lastChanges();
	});

	$c.find('.sui-btn-alig-center').click(function () {
		var container;

		tn_undo__Add('elems_selected_move');

		if (isGroup) {
			container = group__getFieldValue($el, 'container');
			group__aligntoCanvas('center', container);
		} else {
			container = elem__getFieldValue($el, 'container');
			elem__aligntoCanvas('center', container);
		}

		tn_set_lastChanges();
	});

	$c.find('.sui-btn-alig-right').click(function () {
		var container;

		tn_undo__Add('elems_selected_move');

		if (isGroup) {
			container = group__getFieldValue($el, 'container');
			group__aligntoCanvas('right', container);
		} else {
			container = elem__getFieldValue($el, 'container');
			elem__aligntoCanvas('right', container);
		}

		tn_set_lastChanges();
	});

	$c.find('.sui-btn-alig-top').click(function () {
		var container;

		tn_undo__Add('elems_selected_move');

		if (isGroup) {
			container = group__getFieldValue($el, 'container');
			group__aligntoCanvas('top', container);
		} else {
			container = elem__getFieldValue($el, 'container');
			elem__aligntoCanvas('top', container);
		}

		tn_set_lastChanges();
	});

	$c.find('.sui-btn-alig-middle').click(function () {
		var container;

		tn_undo__Add('elems_selected_move');

		if (isGroup) {
			container = group__getFieldValue($el, 'container');
			group__aligntoCanvas('middle', container);
		} else {
			container = elem__getFieldValue($el, 'container');
			elem__aligntoCanvas('middle', container);
		}

		tn_set_lastChanges();
	});

	$c.find('.sui-btn-alig-bottom').click(function () {
		var container;

		tn_undo__Add('elems_selected_move');

		if (isGroup) {
			container = group__getFieldValue($el, 'container');
			group__aligntoCanvas('bottom', container);
		} else {
			container = elem__getFieldValue($el, 'container');
			elem__aligntoCanvas('bottom', container);
		}

		tn_set_lastChanges();
	});
}

function control__drawUi__code(elem_id) {
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=code]');
	var str = '';

	$panel.find('sui-form-group[data-control-field="code"]').css('display', 'none');

	str +=
		'<table>' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn sui-btn-rp sui-btn-code">Edit Code</div>' +
		'<div style="opacity:0.5; font-size:14px; padding-top:15px;">The code will be rendered on a published page</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-code').click(function () {
		tn_html__openEditor(elem_id);
	});
}

function control__drawUi__vector(elem_id) {
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control="vectorjson"]');
	var str = '';

	str +=
		'<table>' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn sui-btn-rp sui-btn-vector-edit">Edit Vector</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-vector-edit').click(function () {
		tn_vector__openEditor(elem_id);
	});
}

function control__drawUi__inputs(elem_id) {
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=inputs]');
	var str = '';
	var datastr;
	var data;
	var type;
	var nm;

	str +=
		'<table>' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn sui-btn-rp sui-btn-inputs" style="min-width:145px;">' +
		'Input fields' +
		'</div>';

	datastr = $('#' + elem_id)
		.find('.tn-atom__inputs-textarea')
		.val();

	if (datastr != '' && typeof datastr !== 'undefined') {
		data = JSON.parse(datastr);

		str += '<div style="opacity:0.5; font-size:14px; padding-top:15px;">Inputs: ';

		for (var key in data) {
			type = data[key]['li_type'];
			nm = '';

			if (type == 'em') nm = 'Email';
			if (type == 'ph') nm = 'Phone';
			if (type == 'nm') nm = 'Name';
			if (type == 'in') nm = 'Input';
			if (type == 'ta') nm = 'Textarea';
			if (type == 'sb') nm = 'Selectbox';
			if (type == 'cb') nm = 'Checkbox';
			if (type == 'fl') nm = 'File';
			if (type == 'hd') nm = 'Hidden';
			if (type == 'rd') nm = 'Radio';
			if (type == 'dl') nm = 'Delivery';
			if (type == 'da') nm = 'Date';
			if (type == 'tm') nm = 'Time';
			if (type == 'ur') nm = 'Url';
			if (type == 'qn') nm = 'Quantity';
			if (type == 'uc') nm = 'File';
			if (type == 'uw') nm = 'File';
			if (type == 'rg') nm = 'Range';
			if (type == 'fr') nm = 'Formula';
			if (type == 'ri') nm = 'Radioimage';

			str += nm + ', ';
		}

		str = str.slice(0, -2);
		str += '</div>';
	}

	str +=
		'<div style="opacity:0.5; font-size:14px; padding-top:5px;">' +
		'Add fields that visitors will fill in to submit data through the form' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-inputs').click(function () {
		tn_form__preOpenEditor(elem_id);
	});
}

function control__drawUi__receivers(elem_id) {
	var $el = $('#' + elem_id);
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=receivers]');
	var datastr = elem__getFieldValue($el, 'receivers_names');
	var str =
		'<table>' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn sui-btn-rp sui-btn-receivers" style="min-width:145px;">Services</div>';

	if (typeof datastr != 'undefined' && datastr != '') {
		str += '<div style="opacity:0.5; font-size:14px; padding-top:15px;">Connected: ' + datastr + '</div>';
	} else {
		str += '<div style="opacity:0.5; font-size:14px; padding-top:15px;">Services not connected</div>';
	}

	str +=
		'<div style="opacity:0.5; font-size:14px; padding-top:5px;">' +
		'Connect one or several data capture services integrated with Tilda to collect form submissions' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-receivers').click(function () {
		tn_receivers__openEditor(elem_id);
	});

	setTimeout(function () {
		var str =
			'<div class="sui-panel__table sui-panel__form-virtual-page">' +
			'You can set up form submission as a goal in the analytics system for virtual page view: /tilda/form' +
			window.tn.artboard_id +
			'/submitted/ FB pixel: "Lead" event' +
			'</div>';

		$('.sui-panel__section-formbuttonstyle').append(str);

		$('.sui-panel__form-virtual-page').click(function () {
			tn_copyToClipboard('/tilda/form' + window.tn.artboard_id + '/submitted/');
			td__showBubbleNotice('Virtual page address is copied', 3000);
		});
	}, 1500);
}

function control__drawUi__animmobile(elem_id) {
	var $el = $('#' + elem_id);
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=animmobile]');
	var animEnabled = elem__getFieldValue($el, 'animmobile');
	var str =
		'<table>' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<label class="sui-label" style="width:100%; padding-bottom:15px;">Mobile animation</label>';

	if (animEnabled === 'y') {
		str +=
			'<div class="sui-btn sui-btn-rp sui-btn-animmobile-turnoff">' +
			'Switch off' +
			'</div>' +
			'<div style="opacity:0.5; font-size:14px; padding-top:25px; padding-bottom:5px;" class="sui-hint__mobile-anim">' +
			'The button disables animation on mobile devices.' +
			'</div>';
	} else {
		str +=
			'<div class="sui-btn sui-btn-rp sui-btn-animmobile-turnon">' +
			'Switch on' +
			'</div>' +
			'<div style="opacity:0.5; font-size:14px; padding-top:25px; padding-bottom:5px;" class="sui-hint__mobile-anim">' +
			'We do not recommend using animations on mobile. Some devices may perform poorly. Also, a poorly designed animation can adversely affect user experience.' +
			'</div>';
	}

	str += '</td></tr></table>';

	$c.html(str);

	$c.find('.sui-btn-animmobile-turnon').click(function () {
		elem__setFieldValue($el, 'animmobile', 'y', '', 'updateui', window.tn.topResolution);
		// if used multi edit - set attribute directly on selected elements
		if (window.tn.multi_edit) $('.tn-elem__selected').attr('data-field-animmobile-value', 'y');
	});

	$c.find('.sui-btn-animmobile-turnoff').click(function () {
		elem__emptyField($el, 'animmobile', '', 'updateui', window.tn.topResolution);
		if (window.tn.multi_edit) $('.tn-elem__selected').attr('data-field-animmobile-value', '');
	});
}

// TODO: add common func for buttons
// control__drawui__gridopenbtn
// control__drawUi__sbsopenbtn
function control__drawui__gridopenbtn() {
	var $c = $('.tn-settings [data-control=grid]');
	var str = '';

	str +=
		'<table style="width:100%;">' +
		'<tbody>' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-header-wrapper">' +
		'<label class="sui-label" style="width:100%; padding-bottom:15px;">Zero Block settings</label>' +
		'<div class="sui-copypaste-wrapper">' +
		'<div class="sui-paste-btn sui-paste-btn-sbs tooltip tooltipstered" data-tooltip="Paste animation from clipboard">' +
		'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 19.5H4.5v-14H8M17.5 7V5.5H13" stroke="#9F9F9F"></path><rect x="8.5" y="4.5" width="5" height="2" rx=".5" stroke="#9F9F9F"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M20 19h-8v-9h5v3h3v6zm1-6v7H11V9h7l3 3v1z" fill="#9F9F9F"></path></svg>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="sui-btn sui-btn-rp sui-btn-grid-open">Open</div>' +
		'</td>' +
		'</tr>' +
		'</tbody>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-grid-open').click(function () {
		ab__openZBSettings();
	});
}

function control__drawUi__sbsopenbtn(elem_id) {
	var $el = window.tn.multi_edit ? window.tn.multi_edit_elems : $('#' + elem_id);
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=sbsopenbtn]');
	var sbsevent = elem__getFieldValue($el, 'sbsevent');
	if (window.tn.multi_edit) {
		var elemList = $el.get();
		sbsevent = elemList.reduce(function (prev, next, i) {
			if (i === 0) return prev; // we already have sbs event prop for first elem
			next = elem__getFieldValue($(next), 'sbsevent');
			if (prev !== next) prev = 'Mixed';
			return prev;
		}, elem__getFieldValue($(elemList[0]), 'sbsevent'));
	}
	var isBtnsCopypasteShow = +window.tn.curResolution !== window.tn.topResolution ? ' style="display:none;"' : '';
	var str = '';

	if (typeof sbsevent != 'undefined' && sbsevent != '') {
		$panel.find('.sui-panel__section-anim').css('display', 'none');
	}

	str +=
		'<table style="width:100%;">' +
		'<tr>' +
		'<td style="width:100%;">' +
		'<div class="sui-header-wrapper">' +
		'<label class="sui-label" style="width:100%; padding-bottom:15px;">Step-by-step animation</label>' +
		'<div class="sui-copypaste-wrapper"' +
		isBtnsCopypasteShow +
		'>';

	if (typeof sbsevent !== 'undefined' && sbsevent !== '' && sbsevent !== 'Mixed' && !window.tn.multi_edit) {
		str +=
			'<div class="sui-copy-btn sui-copy-btn-sbs tooltip" data-tooltip="Copy animation to clipboard">' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M20 12.5h-9m0 0l3-3m-3 3l3 3M17.5 10V5.5H14m3.5 9.5v4.5h-13v-14H8" stroke="#9F9F9F"/>' +
			'<rect x="8.5" y="4.5" width="5" height="2" rx=".5" stroke="#9F9F9F"/>' +
			'</svg>' +
			'</div>';
	}

	if (localStorage.getItem('tzerosbsanimation') !== null) {
		str +=
			'<div class="sui-paste-btn sui-paste-btn-sbs tooltip" data-tooltip="Paste animation from clipboard">' +
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M9 19.5H4.5v-14H8M17.5 7V5.5H13" stroke="#9F9F9F"/>' +
			'<rect x="8.5" y="4.5" width="5" height="2" rx=".5" stroke="#9F9F9F"/>' +
			'<path fill-rule="evenodd" clip-rule="evenodd" d="M20 19h-8v-9h5v3h3v6zm1-6v7H11V9h7l3 3v1z" fill="#9F9F9F"/>' +
			'</svg>' +
			'</div>';
	}

	str += '</div></div>';

	var hasEmptyAnim = false;
	if (sbsevent === 'Mixed') {
		hasEmptyAnim = window.tn.multi_edit_elems.get().some(el => !elem__getFieldValue($(el), 'sbsevent'));
	}

	if (hasEmptyAnim) {
		str +=
			'<p class="sui-form-group__hint">Selected elements have different options for step-by-step animation. Please update them.</p>';
	} else {
		if (typeof sbsevent != 'undefined' && sbsevent != '') {
			str +=
				'<div class="sui-btn sui-btn-sbs-edit" style="padding:6px 30px; background-color:#000; color:#fff; font-weight:500;">Edit</div>';

			if (window.tn.curResolution == window.tn.topResolution)
				str += '<div class="sui-btn sui-btn-sbs-remove" style="padding:6px 15px; font-weight:400;">Remove</div>';

			str +=
				'<div style="opacity:0.5; font-size:14px; padding-top:15px;">' +
				'Selected event: ' +
				'<span style="font-weight:500;">' +
				(sbsevent == 'intoview'
					? 'element on Screen'
					: sbsevent == 'blockintoview'
					? 'block on Screen'
					: sbsevent == 'scroll'
					? 'on Scroll'
					: sbsevent == 'hover'
					? 'on Hover'
					: sbsevent == 'click'
					? 'on Click'
					: sbsevent) +
				'</span>' +
				'</div>';

			if (window.tn.curResolution == window.tn.topResolution)
				str +=
					'<div style="opacity:0.8; font-size:14px; padding-top:25px; padding-bottom:5px;" class="sui-hint__removesbs">Remove the Step-By-Step animation <br /> to add the Basic one.</div>';
		} else {
			str +=
				'<div class="sui-btn sui-btn-rp sui-btn-sbs-open">Add</div>' +
				'<div style="opacity:0.5; font-size:14px; padding-top:15px;">Doesn’t work with Basic animation. Basic animation settings will be removed.</div>';
		}
	}

	str += '</td></tr></table>';

	$c.html(str);

	$c.find('.sui-btn-sbs-open').click(function () {
		panelSBS__open(elem_id);
	});

	$c.find('.sui-btn-sbs-edit').click(function () {
		panelSBS__open(elem_id);
	});

	$c.find('.sui-btn-sbs-remove').click(function () {
		if (confirm('Are you sure?')) {
			$panel.find('.sui-hint__removesbs').remove();

			elem__removeSBSAnimation(window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

			$panel.find('.sui-panel__section-anim').css('display', 'block');

			var panelDataParam = window.tn.multi_edit ? window.tn.multi_edit_elems : {data: {elem_id: elem_id}};
			panelSettings__openTimeout(panelDataParam, window.tn.multi_edit);
			control__drawUi__sbsopenbtn(elem_id);
			tn_set_lastChanges();
		}
	});

	var obj = sbs__getStepsObj($el, false);
	if (obj.length <= 1) {
		$c.find('.sui-copy-btn-sbs').css('display', 'none');
	}

	$c.find('.sui-copy-btn-sbs').on('click', function () {
		sbs__copy__sbsAnimation(elem_id);
	});

	$c.find('.sui-paste-btn-sbs').on('click', function () {
		var $currentElem;

		if (!window.tn.multi_edit) {
			elem__removeBasicAnimation($el);
			sbs__paste__sbsAnimationAttr(elem_id);
		} else {
			for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
				$currentElem = $(window.tn.multi_edit_elems[i]);
				elem__removeBasicAnimation($currentElem);
				sbs__paste__sbsAnimationAttr($currentElem.attr('data-elem-id'));
			}
			var multiEditData = panelSettings__getCommonAttrs(window.tn.multi_edit_elems);
			window.tn.multi_edit_common_attrs = multiEditData.commonAttrs;
		}

		control__drawUi__sbsopenbtn(elem_id);
	});
}

function control__drawUi__sbstest(elem_id) {
	var $el = $('#' + elem_id);
	var $panel = $('.tn-settings');
	var $c = $panel.find('[data-control=sbstest]');
	var str =
		'<table>' +
		'<tr>' +
		'<td>' +
		'<label class="sui-label">Test</label>' +
		'</td>' +
		'<td style="width:100%;">' +
		'<div class="sui-btn sui-btn_sm sui-btn-sbs-test-el">Play Element</div>' +
		'<div class="sui-btn sui-btn_sm sui-btn-sbs-test-all">Play All</div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$c.html(str);

	$c.find('.sui-btn-sbs-test-el').click(function () {
		sbs__playElem($('.tn-elem__selected'));
	});

	$c.find('.sui-btn-sbs-test-all').click(function () {
		sbs__playAll(window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
	});
}

function control__drawUi__textarea(elem_id, field) {
	var $c = $('[data-control-field=' + field + ']');
	var value = $c.attr('data-control-value');
	var label = field;
	var str = '';
	var $inp;
	var $el;

	if (field == 'sbsopts') label = 'json';

	str +=
		'<label class="sui-label">' +
		label +
		'</label>' +
		'<table>' +
		'<tr>' +
		'<div class="sui-input-div">' +
		'<textarea rows="10" name="' +
		field +
		'" class="sui-input" style="height:100px;font-size:11px;border:1px solid #ccc;">' +
		value +
		'</textarea>' +
		'</div>';

	$c.html(str);

	$inp = $('.tn-settings [name=' + field + ']');
	$el = $('#' + elem_id);

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
		tn_console('panelsettings onchange input');

		var v = $inp.val();
		var $element;

		tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

		$inp.closest('.sui-form-group').attr('data-control-value', v);

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

		$c.removeClass('sui-form-group_undefined');

		tn_set_lastChanges();
	});
}

function control__drawUi__shapeBgPosition(elem_id) {
	const element = document.querySelector(`[data-elem-id="${elem_id}"]`);

	const field = document.querySelector('[data-control-field="bgposition"]');
	if (!field) return;

	const value = field.getAttribute('data-control-value');

	const isSelected = v => (value === v ? 'selected="selected"' : '');
	const isBgpositionFieldFilled = !!elem__getFieldValue($(element), 'bgimg');

	const controlHTML = /*html*/ `
    <table class="sui-control-shape-bg-position" style="width:100%;">
      <tr>
        <td><label class="sui-label">Position</label></td>
        <td style="width: 100%">
          <div class="sui-select">
            <select class="sui-input sui-select" name="bgposition">
              <option
								value="custom"
								style="${isBgpositionFieldFilled ? '' : 'display: none'}"
								${isSelected('custom')}
							>Custom</option>
              <option value="left top" ${isSelected('left top')}>Left Top</option>
              <option value="center top" ${isSelected('center top')}>Center Top</option>
              <option value="right top" ${isSelected('right top')}>Right Top</option>
              <option value="left center" ${isSelected('left center')}>Left Center</option>
              <option value="center center" ${isSelected('center center')}>Center Center</option>
              <option value="right center" ${isSelected('right center')}>Right Center</option>
              <option value="left bottom" ${isSelected('left bottom')}>Left Bottom</option>
              <option value="center bottom" ${isSelected('center bottom')}>Center Bottom</option>
              <option value="right bottom" ${isSelected('right bottom')}>Right Bottom</option>
            </select>
          </div>
        </td>
        <td>
          <div
            style="margin-left: 16px; ${isBgpositionFieldFilled ? '' : 'display: none;'}"
            class="sui-btn sui-btn_sm sui-btn_singular js-shape-bg-position-edit"
          >Edit</div>
        </td>
      </tr>
    </table>
  `;

	field.innerHTML = controlHTML;

	const control = document.querySelector('.tn-settings [name=bgposition]');
	const editBtn = document.querySelector('.tn-settings .js-shape-bg-position-edit');

	editBtn.addEventListener('click', () => {
		tn_undo__Add('elem_save', $(element));

		const controlValue = control.value;
		if (controlValue !== 'custom') {
			control.value = 'custom';

			const [posX, posY] = controlValue.split(' ');

			elem__setFieldValue($(element), 'bgposition', 'custom', 'render');
			elem__setFieldValue($(element), 'bgposition_imgpos', `${posY},${posX}`, 'render');
		}

		tn_hideOutline('selected');
		tn_hideOutline('hover');

		tn_bgPositionEditor__init(element);
	});

	control.addEventListener('focusin', () => (window.tn_flag_settings_ui_focus = true));
	control.addEventListener('focusout', () => (window.tn_flag_settings_ui_focus = false));

	control.addEventListener('change', () => {
		const controlValue = control.value;
		tn_undo__Add('elem_save', $(element));

		field.setAttribute('data-control-value', controlValue);

		elem__setFieldValue($(element), 'bgposition', controlValue, 'render');

		if (controlValue !== 'custom') {
			elem__setFieldValue($(element), 'bgposition_imgpos', '', 'render');
			elem__setFieldValue($(element), 'bgposition_imgsize', '', 'render');
		}

		tn_set_lastChanges();

		control.dispatchEvent(new FocusEvent('focusout'));
	});
}

function tn_multiEdit__updateUi() {
	if (window.tn.multi_edit) {
		var left = null;
		var top = null;
		var $elems;
		var commonAttrs;

		if ($('.tn-group__selected').length) {
			$elems = $('.tn-artboard > .tn-elem__selected, .tn-group__selected');

			$elems.each(function () {
				var $el = $(this);
				var isGroup = $el.hasClass('tn-group');
				var curLeft = isGroup ? group__getFieldValue($el, 'left') : elem__getFieldValue($el, 'left');
				var curTop = isGroup ? group__getFieldValue($el, 'top') : elem__getFieldValue($el, 'top');

				left = left !== null && left !== curLeft ? 'Mixed' : curLeft;
				top = top !== null && top !== curTop ? 'Mixed' : curTop;
			});
		} else {
			$elems = $('.tn-elem__selected');
			commonAttrs = panelSettings__getCommonAttrs($elems).commonAttrs;
			left = commonAttrs.left === null ? 'Mixed' : commonAttrs.left;
			top = commonAttrs.top === null ? 'Mixed' : commonAttrs.top;
		}

		panelSettings__updateUi($('.tn-elem__fake'), 'left', left);
		panelSettings__updateUi($('.tn-elem__fake'), 'top', top);
	}
}

var td__bubbleNoticeTimeout;
function td__showBubbleNotice(text, delay) {
	if (typeof delay === 'undefined') {
		delay = 6000;
	}

	var id = 1;
	var $cornernotice = $('.cornernotice');
	if ($cornernotice.length > 0) {
		id = $cornernotice.length + 1;
	}

	$('.t-help-bubble').css('display', 'none');

	var str =
		'<div class="td__cornernotice" data-tilda-corner-notice="' +
		id +
		'" style="position: fixed;z-index:3001;background-color:#111;width:350px;bottom:50px;right:-350px;border: 1px solid #ccc;border-radius:10px;">' +
		'<div class="td__cornernotice__close" style="position:absolute;right:10px;top:3px;color:#fff;cursor: pointer;">&times;</div>' +
		'<div class="td__cornernotice__text" style="color:#fff;font-family:\'tfutura\',Arial,sans-serif;font-size:16px;padding:20px 30px;">' +
		text +
		'</div>' +
		'<style>.td__cornernotice__text a{color:#ff855d;text-decoration: underline;}</style>' +
		'</div>';

	$('body').append(str);
	var $el = $('.td__cornernotice[data-tilda-corner-notice="' + id + '"]');

	var el = $el.get(0);
	if (!el) return;
	if (typeof el.bubbleNoticeTimeout === 'undefined') el.bubbleNoticeTimeout = 0;

	var bottom;
	var height;

	if (id > 1) {
		var $prevel = $('.td__cornernotice[data-tilda-corner-notice="' + (id - 1) + '"]');
		if ($prevel.length > 0) {
			bottom = $prevel.css('bottom');
			height = $prevel.css('height');
			bottom = parseInt(bottom);
			height = parseInt(height);
		}

		if (id < 5) {
			$el.css('bottom', bottom + height + 5 + 'px');
		} else {
			$el.css('bottom', bottom + 25 + 'px');
		}
	}
	$el.animate({'opacity': '100', 'right': '20px'}, 400, 'easeInCirc', function () {
		clearTimeout(el.bubbleNoticeTimeout);

		el.bubbleNoticeTimeout = setTimeout(function () {
			td__closeBubbleNotice(id);
		}, delay);
	});

	$el.click(function () {
		var id = $(this).parent().attr('data-tilda-corner-notice');
		td__closeBubbleNotice(id);
		clearTimeout(el.bubbleNoticeTimeout);
	});
}

function td__closeBubbleNotice(id) {
	var $el;

	if (typeof id !== 'undefined' && id > 0) {
		$el = $('.td__cornernotice[data-tilda-corner-notice="' + id + '"]');
	} else {
		$el = $('.td__cornernotice');
	}

	if ($el.length) {
		$el.animate({'opacity': '0', 'right': '0px'}, 300, 'easeOutCirc', function () {
			$(this).remove();
			$('.t-help-bubble').css('display', 'block');
		});
	}
}

/**
 *
 * @param {string[]} animProps
 * @param $settings
 * @param {'table' | 'section'} parent
 * @param {'table' | 'block' | 'none'} display
 */
function control__drawUi__updateVisibilityField(animProps, $settings, parent, display) {
	animProps.forEach(function (animProp) {
		let selector = 'data-control';
		if (!animProp.includes('test')) selector += '-field';
		$settings.find(`[${selector}="${animProp}"]`).closest(`.sui-panel__${parent}`).css('display', display);
	});
}

/**
 *
 * @param {Boolean} isMixed
 * @param {
 * {
 * view: ['intoview', 'blockintoview'],
 * hoverclick: ['hover', 'click'],
 * scroll: ['scroll']
 * }
 * } animSBSTypesObj
 * @param {'intoview' | 'blockintoview' | 'scroll' | 'hover' | 'click' | 'Mixed' | ''} value
 * @return {'view' | 'hover' | 'clickscroll' | ''}
 */
function control__drawUi__getSbsAnimType(isMixed, animSBSTypesObj, value) {
	let sbsAnimType = {value: ''};
	if (isMixed) {
		window.tn.multi_edit_elems.get().forEach(function (el) {
			const animValue = elem__getFieldValue($(el), 'sbsevent');
			control__drawUi__updateAnimSbsType(animSBSTypesObj, animValue, sbsAnimType);
		});
	} else {
		control__drawUi__updateAnimSbsType(animSBSTypesObj, value, sbsAnimType);
	}
	return sbsAnimType.value;
}

/**
 *
 * @param {
 * {
 * view: ['intoview', 'blockintoview'],
 * hoverclick: ['hover', 'click'],
 * scroll: ['scroll']
 * }
 * } animSBSTypesObj
 * @param {'intoview' | 'blockintoview' | 'scroll' | 'hover' | 'click' | 'Mixed' | ''} animValue
 * @param {{value: 'view' | 'hover' | 'clickscroll' | ''}} sbsAnimType
 */
function control__drawUi__updateAnimSbsType(animSBSTypesObj, animValue, sbsAnimType) {
	Object.keys(animSBSTypesObj).forEach(function (key) {
		if (!animSBSTypesObj[key].includes(animValue) || sbsAnimType.value === 'mixed') return;
		if (!sbsAnimType.value) sbsAnimType.value = key;
		if (sbsAnimType.value && sbsAnimType.value !== key) sbsAnimType.value = 'mixed';
	});
}

function control__drawUi__getSBSAnimParams() {
	return {
		animSBSTypesObj: {
			view: ['intoview', 'blockintoview'],
			scroll: ['scroll'],
			hoverclick: ['hover', 'click'],
			mixed: [],
		},
		animTypeNaming: {
			intoview: 'element on Screen',
			blockintoview: 'block on Screen',
			scroll: 'on Scroll',
			hover: 'on Hover',
			click: 'on Click',
		},
	};
}

function control__drawUi__setAnimSelectOptions(value, selectedAnimTypes, animTypeNaming) {
	const isEmptyValueSelected = value === '' ? 'selected="selected"' : '';
	let str = `<option value="" ${isEmptyValueSelected}>None</option>`;
	selectedAnimTypes.forEach(animType => {
		const isSelected = value === animType ? 'selected="selected"' : '';
		str += `<option value="${animType}" ${isSelected}>${animTypeNaming[animType]}</option>`;
	});
	return str;
}

/**
 * return true if current resolution don't contains same values for
 * selected elements props
 *
 * @param {string} field
 * @return {boolean}
 */
function control__drawUi__getMixedState(field) {
	if (window.tn.curResolution === window.tn.topResolution) {
		return window.tn.multi_edit_common_attrs[field] === null;
	}
	const index = window.tn.screens.indexOf(window.tn.curResolution);
	const slicedScreens = window.tn.screens.slice(index);
	return slicedScreens.some(function (screenValue, i) {
		const fieldValue = i < slicedScreens.length - 1 ? field + '-res-' + screenValue : field;
		return window.tn.multi_edit_common_attrs[fieldValue] === null;
	});
}

/**
 * for selected group with same type anim - set anim props anyway
 *
 * @return {boolean}
 */
function control__drawUi__getMultiplyAnimOpts() {
	if (!window.tn.multi_edit) return false;
	const animList = ['fadeinup', 'fadeindown', 'fadeinleft', 'fadeinright'];
	const animElems = $('.tn-elem__selected').get();
	return animElems.every(function (el) {
		return animList.some(function (animType) {
			return elem__getFieldValue($(el), 'animstyle') === animType;
		});
	});
}
