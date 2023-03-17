function allelems__unselect(disableArtboardOpen) {
	$('.tn-elem__selected').each(function () {
		var $el = $(this);
		elem__unselect($el, true);
	});

	if (!disableArtboardOpen) panelABSettings__open();

	tn_hideOutline('selected');
	tn_hideRulers();

	tn_destroyTidyControls();

	group__unselectAll();

	window.tn.multi_edit = false;
	window.tn.multi_edit_elems = null;
	$('.tn-elem__fake').remove();

	elem__removeAxis();
	$('body').removeClass('tn-multiselected');
}

function elem__select($el) {
	tn_console();
	allelems__unselect(true);
	allelems__closeEditMode();
	if (window.tn.curResolution != window.tn.topResolution && elem__getFieldValue($el, 'animmobile') !== 'y') {
		panelSBS__close($el, true);
	}

	$el.addClass('tn-elem__selected');

	tn_setOutlinePosition('selected');
	tn_showOutline('selected');

	elem__updateUIControls($el);

	/* fire event */
	$el.trigger('elementSelected');

	elem__drawAxis($el);
	window.tn_flag_settings_ui_focus = false;

	if ($('.tn-elem__selected').length > 1) {
		$('body').addClass('tn-multiselected');
	} else {
		$('body').removeClass('tn-multiselected');
	}

	var groupId = elem__getFieldValue($el, 'groupid');
	if (groupId) {
		var $group = group__getById(groupId);
		group__openSelection($group);
	}

	tn_console_runtime();

	if ($el.attr('data-elem-type') === 'text') {
		elem__setEditReady($el);
	}
}

function elem__unselect($el, isUnselectAll) {
	tn_console('func: elem__unselect');
	$el.removeClass('tn-elem__selected');
	$el.trigger('elementUnselected');

	if (window.tn_flag_sbs_onstep == 'y') {
		sbs__elem__exitonStepMode($el);
	}

	var elem_selected_length = $('.tn-elem__selected').length;

	if (elem_selected_length === 1) {
		var $el_sel = $('.tn-elem__selected');

		window.tn.multi_edit = false;
		allelems__closeEditMode();
		if (!isUnselectAll) $el_sel.trigger('elementSelected');
	}

	if (elem_selected_length > 1 && !isUnselectAll) {
		window.tn.multi_edit = true;
		window.tn.multi_edit_elems = $('.tn-elem__selected');
		panelSettings__openTimeout(window.tn.multi_edit_elems, true);

		$('body').addClass('tn-multiselected');
	} else {
		$('body').removeClass('tn-multiselected');
	}

	if (!isUnselectAll) {
		if (elem_selected_length === 0) {
			panelABSettings__open();
			tn_hideOutline('selected');
			tn_hideRulers();
		} else {
			tn_setOutlinePosition('selected');
		}
	}

	elem__removeAxis();

	tn_console_runtime('func: elem__unselect');
}

function allelems__closeEditMode() {
	$('[data-edit-mode=yes]').each(function () {
		saveElementEditedField($(this));
	});
}

function elem__select__also($el) {
	tn_console('func: elem__select__also');
	var el_lock = elem__getFieldValue($el, 'lock');

	if ($('.tn-elem__selected').filter('.tn-elem__locked').length || el_lock == 'y') return;

	allelems__closeEditMode();

	$el.addClass('tn-elem__selected');

	window.tn.multi_edit = true;
	window.tn.multi_edit_elems = $('.tn-elem__selected');

	panelSettings__openTimeout(window.tn.multi_edit_elems, true);
	layers__hightlight();
	elem__removeAxis();

	window.tn_flag_settings_ui_focus = false;

	if ($('.tn-elem__selected').length > 1) {
		$('body').addClass('tn-multiselected');
	} else {
		$('body').removeClass('tn-multiselected');
	}

	if (window.tn_flag_sbs_panelopen) {
		panelSBS__close();
	}

	tn_setOutlinePosition('selected');
	tn_showOutline('selected');

	tn_console_runtime('func: elem__select__also');

	tn_destroyTidyControls();
	tn_createSpacingControls();
}

function allelems__selectall() {
	var $elems = $('.tn-artboard > .tn-elem, .tn-group');
	if ($elems.length == 0) return;

	allelems__closeEditMode();

	$elems.each(function () {
		var $el = $(this);
		var isGroup = $el.hasClass('tn-group');
		var lock = isGroup ? group__getFieldValue($el, 'lock') : elem__getFieldValue($el, 'lock');
		var invisible = isGroup ? group__getFieldValue($el, 'hidden') : elem__getFieldValue($el, 'invisible');

		if (lock != 'y' && invisible != 'y') {
			if (!isGroup) {
				$el.addClass('tn-elem__selected');
			} else {
				var groupId = $el.attr('id');
				group__select(groupId, true);
			}
		}
	});

	$elems = $('.tn-elem__selected');
	if ($elems.length == 1) {
		elem__updateUIControls($elems);
		$elems.trigger('elementSelected');
	} else if ($elems.length > 1) {
		window.tn.multi_edit = true;
		window.tn.multi_edit_elems = $elems;
		panelSettings__openTimeout($elems, true);
		layers__hightlight();
	}

	if ($elems.length > 1) {
		$('body').addClass('tn-multiselected');
	} else {
		$('body').removeClass('tn-multiselected');
	}

	elem__removeAxis();
	window.tn_flag_settings_ui_focus = false;

	tn_setOutlinePosition('selected');
	tn_showOutline('selected');

	tn_destroyTidyControls();
	tn_createSpacingControls();
}
