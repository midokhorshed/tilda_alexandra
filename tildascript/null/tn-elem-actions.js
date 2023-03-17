function elem__Delete($element) {
	var groupIdList = [];
	if ($element) {
		var groupId = elem__getFieldValue($element, 'groupid');
		if (groupId) groupIdList.push(groupId);
		if (window.tn_flag_sbs_panelopen === 'y') panelSBS__close($element, true);
		$element.remove();
	} else {
		var $selectedElems = $('.tn-elem__selected');
		$selectedElems.each(function () {
			var $el = $(this);
			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId) groupIdList.push(groupId);
			if (window.tn_flag_sbs_panelopen === 'y' && $selectedElems.length === 1) panelSBS__close($el, true);
			$el.remove();
		});
	}

	group__checkEmpty();

	if (groupIdList.length) {
		groupIdList.forEach(function (id) {
			var $group = group__getById(id);
			if ($group) group__setPositionByElemsAttrs(id, false, true);
		});
	}

	layers__update();
	tn_figma__checkAmazonImages();

	tn_hideOutline('hover');
	tn_hideRotateCursor($('.tn-rotate-cursor'));
}

function elem__Duplicate($el, disableSelect) {
	tn_console('func: elem__Duplicate');
	var json_str = elem__getData__inJson($el);
	var item = json_str;

	item['elem_id'] = Date.now();
	item['zindex'] = allelems__getHighestZIndex() + 1;

	if (item.elem_type === 'form') {
		var inputs = JSON.parse(item.inputs);
		var counter = 0;
		var lid = Date.now();
		Object.keys(inputs).forEach(function (i) {
			inputs[i].lid = lid + counter;
			counter++;
		});
		item.inputs = JSON.stringify(inputs);
	}

	var $new_el;
	$new_el = addElem(item);

	if (!disableSelect) elem__select($new_el);

	layers__update();

	return $new_el;
}

function elem__DuplicateByOption($elements, isSaveGroupId) {
	tn_console('func: elem__DuplicateByOption');
	var newGroupIds = {};
	var copyData = {
		elementsDuplicates: [],
		newGroupIds: [],
	};

	$elements.each(function () {
		var $el = $(this);
		var json_str = elem__getData__inJson($el);
		var item = json_str;

		item['elem_id'] = Date.now();

		if (item.elem_type === 'form') {
			var inputs = JSON.parse(item.inputs);
			var counter = 0;
			var lid = Date.now();
			Object.keys(inputs).forEach(function (i) {
				inputs[i].lid = lid + counter;
				counter++;
			});
			item.inputs = JSON.stringify(inputs);
		}

		if (item['groupid'] && !isSaveGroupId) {
			if (!newGroupIds[item['groupid']]) {
				var newId = group__createGroupId();
				newGroupIds[item['groupid']] = newId;
				copyData.newGroupIds.push(newId);
				item['groupid'] = newId;
			} else {
				item['groupid'] = newGroupIds[item['groupid']];
			}
		}

		var $new_el;
		$new_el = addElem(item);

		copyData.elementsDuplicates.push({
			originalId: $el.attr('id'),
			newElemId: $new_el.attr('id'),
		});
	});

	layers__update();

	return copyData;
}

function elem__SwapCoords($el1, $el2) {
	var el1Coords = {
		left: elem__getFieldValue($el1, 'left'),
		top: elem__getFieldValue($el1, 'top'),
	};

	var el2Coords = {
		left: elem__getFieldValue($el2, 'left'),
		top: elem__getFieldValue($el2, 'top'),
	};

	elem__setFieldValue($el1, 'left', el2Coords.left);
	elem__setFieldValue($el1, 'top', el2Coords.top);
	elem__setFieldValue($el2, 'left', el1Coords.left);
	elem__setFieldValue($el2, 'top', el1Coords.top);
	elem__renderView($el1);
	elem__renderView($el2);
}

function elem__Lock($els, forceValue) {
	tn_console('func: elem_Lock');
	var $selectedElems = $els && $els.length > 0 ? $els : $('.tn-elem__selected');

	$selectedElems.each(function () {
		var $el = $(this);
		if ($el.length == 0) return;
		var lock = elem__getFieldValue($el, 'lock');
		var lockVal = lock === 'y' ? '' : 'y';
		var val = typeof forceValue !== 'undefined' ? forceValue : lockVal;

		elem__setFieldValue($el, 'lock', val, 'render', 'updateui');

		if (lock === 'y') $el.removeClass('tn-elem__locked');

		layers__update();
	});
}

function elem__Invisible($els, forceValue) {
	tn_console('func: elem_invisible');
	var $selectedElems = $els && $els.length > 0 ? $els : $('.tn-elem__selected');

	$selectedElems.each(function () {
		var $el = $(this);
		if ($el.length == 0) return;
		var invisible = elem__getFieldValue($el, 'invisible');
		var invisibleVal = invisible === 'y' ? '' : 'y';
		var val = typeof forceValue !== 'undefined' ? forceValue : invisibleVal;

		elem__setFieldValue($el, 'invisible', val, 'render', 'updateui');
		if (val !== 'y') $el.removeClass('tn-elem__invisible');
	});

	layers__update();
}

function tn_arrange__backward($el) {
	var $inp = $('.tn-settings [name=zindex]');
	tn_undo__Add('elems_sort');
	if (window.tn.multi_edit) {
		$('.tn-artboard > .tn-elem__selected, .tn-group__selected').each(function () {
			var $curEl = $(this);
			if ($curEl.hasClass('tn-group')) {
				group__setZIndex__Backward($curEl);
			} else {
				var new_zindex = elem__setZIndex__Backward($curEl);
				$inp.val(new_zindex);
			}
		});
	} else {
		var new_zindex = elem__setZIndex__Backward($el);
		$inp.val(new_zindex);
	}
	layers__update();
	tn_set_lastChanges();
}

function tn_arrange__forward($el) {
	var $inp = $('.tn-settings [name=zindex]');
	tn_undo__Add('elems_sort');
	if (window.tn.multi_edit) {
		$('.tn-artboard > .tn-elem__selected, .tn-group__selected').each(function () {
			var curEl = $(this);
			if (curEl.hasClass('tn-group')) {
				group__setZIndex__Forward(curEl);
			} else {
				var new_zindex = elem__setZIndex__Forward(curEl);
				$inp.val(new_zindex);
			}
		});
	} else {
		var new_zindex = elem__setZIndex__Forward($el);
		$inp.val(new_zindex);
	}
	layers__update();
	tn_set_lastChanges();
}

function tn_arrange__sendFront($el) {
	var $inp = $('.tn-settings [name=zindex]');
	tn_undo__Add('elems_sort');
	if (window.tn.multi_edit) {
		$('.tn-artboard > .tn-elem__selected, .tn-group__selected').each(function () {
			var curEl = $(this);
			if (curEl.hasClass('tn-group')) {
				group__setZIndex__Front(curEl);
			} else {
				var new_zindex = elem__setZIndex__Front(curEl);
				$inp.val(new_zindex);
			}
		});
	} else {
		var new_zindex = elem__setZIndex__Front($el);
		$inp.val(new_zindex);
	}
	layers__update();
	tn_set_lastChanges();
}

function tn_arrange__sendBack($el) {
	var $inp = $('.tn-settings [name=zindex]');
	tn_undo__Add('elems_sort');
	if (window.tn.multi_edit) {
		$('.tn-artboard > .tn-elem__selected, .tn-group__selected').each(function () {
			var curEl = $(this);
			if (curEl.hasClass('tn-group')) {
				group__setZIndex__Back(curEl);
			} else {
				var new_zindex = elem__setZIndex__Back(curEl);
				$inp.val(new_zindex);
			}
		});
	} else {
		var new_zindex = elem__setZIndex__Back($el);
		$inp.val(new_zindex);
	}
	layers__update();
	tn_set_lastChanges();
}

function tn_elem__copy($el) {
	if (window.tn.multi_edit) {
		elem__selected__buf__Copy();
		elem__selected__buf__Paste();
		tn_set_lastChanges();
	} else {
		var $new_el = elem__Duplicate($el);
		elem__offsetMove($new_el, +20, +20);
		tn_undo__Add('elem_duplicate', $new_el);
		tn_set_lastChanges();
	}
}

function tn_elem__delete() {
	if ($('.tn-elem__selected').length === 1) {
		tn_undo__Add('elem_delete', $('.tn-elem__selected'));
	} else {
		tn_undo__Add('elems_selected_delete');
	}
	elem__Delete();
	tn_set_lastChanges();
	floor__mousedown();
}

function tn_elem__lock($el) {
	if (!$el) $el = $('.tn-elem__selected');
	tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
	if (group__isSelectedOnlyGroups()) {
		group__lock();
	} else {
		elem__Lock();
	}
	tn_set_lastChanges();
}

function tn_elem__hide($el, event) {
	tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);

	if ($el && $el.length === 1) {
		elem__Click($el, event, 'noedit');
		elem__Invisible($el);
	} else if (window.tn.multi_edit) {
		if (group__isSelectedOnlyGroups()) {
			group__hide();
		} else {
			elem__Invisible($('.tn-elem__selected'));
		}
	}
	tn_set_lastChanges();
	if (event) event.stopPropagation();
}
