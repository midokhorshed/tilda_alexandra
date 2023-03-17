function elem__selected__offsetMove(x, y) {
	$('.tn-artboard > .tn-elem__selected, .tn-group__open .tn-elem__selected, .tn-group__selected').each(function () {
		var $el = $(this);
		elem__offsetMove($el, x, y);
		var groupId = elem__getFieldValue($el, 'groupid');
		if (groupId) {
			group__setPositionByElemsAttrs(groupId);
		}
	});

	tn_setOutlinePosition('selected');
	tn_showOutline('selected');

	tn_hideOutline('hover');
}

function elem__selected__lineheightChange(d) {
	$('.tn-elem__selected').each(function () {
		var $el = $(this);
		if ($el.attr('data-elem-type') !== 'text') return;
		var v = elem__getFieldValue($el, 'lineheight');
		v = parseFloat(v);
		v = v + 1 * d;
		if (v >= 10) v = 10;
		if (v <= 0) v = 0;
		v = Math.round(v * 100) / 100;
		elem__setFieldValue($el, 'lineheight', v, 'render', 'updateui');
	});
}

function elem__selected__letterspacingChange(d) {
	$('.tn-elem__selected').each(function () {
		var $el = $(this);
		if ($el.attr('data-elem-type') !== 'text') return;
		var v = elem__getFieldValue($el, 'letterspacing');
		v = parseFloat(v);
		v = v + 1 * d;
		if (v >= 50) v = 50;
		if (v <= -50) v = -50;
		v = Math.round(v * 100) / 100;
		elem__setFieldValue($el, 'letterspacing', v, 'render', 'updateui');
	});
}

function elem__selected__makeBigger(d) {
	$('.tn-elem__selected').each(function () {
		var $el = $(this);
		var v;

		if ($el.attr('data-elem-type') == 'text') {
			v = elem__getFieldValue($el, 'fontsize');
			v = parseInt(v, 10);
			v = v + 2 * d;
			elem__setFieldValue($el, 'fontsize', v, 'render', 'updateui');
		}
		if ($el.attr('data-elem-type') == 'image') {
			v = elem__getFieldValue($el, 'width');
			v = parseInt(v, 10);
			v = v + 10 * d;
			elem__setFieldValue($el, 'width', v, 'render', 'updateui');
		}
		if (
			$el.attr('data-elem-type') == 'shape' ||
			$el.attr('data-elem-type') == 'video' ||
			$el.attr('data-elem-type') == 'html'
		) {
			v = elem__getFieldValue($el, 'width');
			v = parseInt(v, 10);
			var koef = parseInt(elem__getFieldValue($el, 'height')) / v;
			v = v + 10 * d;
			elem__setFieldValue($el, 'width', v, 'render', 'updateui');
			elem__setFieldValue($el, 'height', parseInt(v * koef), 'render', 'updateui');
		}
		if ($el.attr('data-elem-type') == 'tooltip') {
			v = elem__getFieldValue($el, 'width');
			v = parseInt(v, 10);
			v = v + 1 * d;
			elem__setFieldValue($el, 'width', v, 'render', 'updateui');
		}
	});

	tn_setOutlinePosition('selected');
}

function elem__selected__buf__Copy() {
	var $els = $('.tn-elem__selected');
	var $groups = $('.tn-group__selected');

	if ($els.length == 0) return;
	if (typeof $els == 'undefined') return;

	var groupIds = [];
	var groups_data = {};
	$groups.each(function () {
		var $group = $(this);
		var groupId = $group.attr('id');
		groupIds.push(groupId);
		groups_data[groupId] = group__getDataJson(groupId);
	});

	var res = window.tn.curResolution;
	var els_data = {};

	$els.each(function () {
		var $el = $(this);
		var el_id = $el.attr('data-elem-id');
		els_data[el_id] = elem__getData__inJson($el);
	});

	var str = localStorage.getItem('buf'); // TODO - переименовать все переменые в LS - введя единый префикс
	var buf_obj = $.parseJSON(str);

	var buf_obj = [];

	var obj = {
		comm: 'copytobuf',
		res: res,
		data: els_data,
		groups: groups_data,
	};

	buf_obj.push(obj);

	var buf_obj_str = JSON.stringify(buf_obj);
	tn_console('BUFFFF' + buf_obj_str);

	localStorage.setItem('buf', buf_obj_str);
}

function elem__selected__buf__Paste() {
	var str = localStorage.getItem('buf');
	var buf_obj = $.parseJSON(str);

	if (typeof buf_obj == 'undefined' || buf_obj == null) {
		return '';
	}

	var els_data = buf_obj[0]['data'];
	var groups_data = buf_obj[0]['groups'];
	var new_els_id = [];
	var updatedGroupIds = {};
	els_data = $.map(els_data, function (val, key) {
		return val;
	});
	els_data.sort(function (a, b) {
		var aZIndex = a.zindex;
		var bZIndex = b.zindex;
		return aZIndex - bZIndex;
	});

	$.each(els_data, function (key, item) {
		if (typeof item === 'undefined') return; // continue next

		var data = item;
		var old_id = data['elem_id'];

		if (data.groupid && !group__getById(data.groupid)) {
			delete data.groupid;
		}

		/* add coord shift for in all resolutions if such element still exist on page */
		if ($('[data-elem-id=' + old_id + ']').length > 0) {
			var container = data.container;

			var width = container === 'grid' ? window.tn.canvas_min_width : window.tn.canvas_max_width;
			var offsetLeft = 10;
			if (data.leftunits === '%') {
				offsetLeft = 1;
			}

			if (data.groupid && group__checkElemsWithPercentUnits(data.groupid, 'left') && data.leftunits !== '%') {
				offsetLeft = width / 100;
			}

			var height = container === 'grid' ? window.tn.canvas_min_height : window.tn.canvas_max_height;
			var offsetTop = 10;
			if (data.topunits === '%') {
				offsetTop = 1;
			}

			if (data.groupid && group__checkElemsWithPercentUnits(data.groupid, 'left') && data.topunits !== '%') {
				offsetTop = height / 100;
			}

			data['top'] = parseInt(data['top'], 10) + offsetTop + 'px';
			data['left'] = parseInt(data['left'], 10) + offsetLeft + 'px';

			var v;
			window.tn.screens.forEach(function (s, i) {
				if (s == window.tn.topResolution) return; //continue (skip)

				//todo - нет ли тут ошибки в написании атрибута? кажется не хватает '-value'
				//todo - совсем не понятно что это тут делается
				v = data['top-res-' + s];
				if (typeof v != 'undefined') {
					data['top-res-' + s] = parseInt(v, 10) + 10 + 'px';
				}
				v = data['left-res-' + s];
				if (typeof v != 'undefined') {
					data['left-res-' + s] = parseInt(v, 10) + 10 + 'px';
				}
			});
		}

		if (data['groupid'] && groups_data[data['groupid']]) {
			if (!updatedGroupIds[data['groupid']]) {
				updatedGroupIds[data['groupid']] = Date.now() + '' + getRandomInt(10000, 99999);
				data['groupid'] = updatedGroupIds[data['groupid']];
			} else {
				data['groupid'] = updatedGroupIds[data['groupid']];
			}
		}

		data['elem_id'] = Date.now();
		data['zindex'] = allelems__getHighestZIndex() + 1;
		if (data.elem_type === 'form') {
			var inputs = JSON.parse(data.inputs);
			var lid = Date.now();
			Object.keys(inputs).forEach(function (i, n) {
				inputs[i].lid = lid + n;
			});
			data.inputs = JSON.stringify(inputs);
		}

		var $el_new = addElem(data);
		var el_new_id = $el_new.attr('data-elem-id');
		var newElGroupId = elem__getFieldValue($el_new, 'groupid');
		new_els_id[el_new_id] = el_new_id;

		if (newElGroupId) {
			group__insertElemInGroup($el_new, newElGroupId);
		}
	}); //each

	Object.keys(groups_data).forEach(function (key) {
		var groupData = groups_data[key];
		group__create(updatedGroupIds[key], groupData);
		$('.tn-group#' + updatedGroupIds[key]).addClass('tn-group__selected');
	});

	var size = Object.keys(new_els_id).length;
	if (size > 0) {
		if (size == 1) {
			for (var key in new_els_id) {
				var $el_new = $('#' + key);
				$el_new.trigger('click');
				tn_undo__Add('elem_add', $el_new);
			}
		} else {
			floor__mousedown();
			Object.keys(groups_data).forEach(function (key) {
				var $group = $('.tn-group#' + updatedGroupIds[key]);
				group__select(updatedGroupIds[key], Object.keys(groups_data).length === 1 ? false : true);
				$group.draggable('enable');
			});
			for (var key in new_els_id) {
				var $el_new = $('#' + key);
				$el_new.addClass('tn-elem__selected');
			}
			tn_undo__Add('elems_selected_add', new_els_id);
		}
	}

	layers__update();
}

function elems__selected__alignLeft(a, via) {
	tn_console('func: elems__selected__alignLeft');

	if (typeof via == 'undefined' || via == '') via = 'eachother';

	if (via == 'eachother') {
		if ($('.tn-elem__selected').length < 2) return;
	} else {
		if ($('.tn-elem__selected').length == 0) return;
	}

	/* find min and max points */
	var isSelectedOnlyOneGroup =
		$('.tn-group__selected').length === 1 &&
		$('.tn-group__selected .tn-elem').length === $('.tn-elem__selected').length;

	if (via == 'eachother' || via == 'grid' || via == 'window') {
		var min = 1000000;
		var max = -1000000;
		var el_left;
		var el_right;

		$(isSelectedOnlyOneGroup ? '.tn-elem__selected' : '.tn-group__selected, .tn-elem__selected').each(function () {
			var $el = $(this);
			var groupId = elem__getFieldValue($el, 'groupid');
			var $group;
			if (groupId) $group = group__getById(groupId);
			if ($group && !$group.hasClass('tn-group__open') && !isSelectedOnlyOneGroup) return;

			var position = elem__getRealPosition($el);

			if (a == 'left') {
				el_left = position.left;
				if (el_left < min) min = el_left;
			}
			if (a == 'right') {
				el_right = position.left + parseInt($el.width(), 10);
				if (el_right > max) max = el_right;
			}
			if (a == 'center') {
				el_left = position.left;
				if (el_left < min) min = el_left;

				el_right = position.left + parseInt($el.width(), 10);
				if (el_right > max) max = el_right;
			}
		});

		if (min == 1000000 && max == -1000000) return;
	}

	/* set new position */

	if (via == 'eachother') {
		$(isSelectedOnlyOneGroup ? '.tn-elem__selected' : '.tn-group__selected, .tn-elem__selected').each(function () {
			var $el = $(this);
			var isGroup = $el.hasClass('tn-group');
			var groupId = elem__getFieldValue($el, 'groupid');
			var $group;
			var groupLeft;
			var value;
			if (groupId) $group = group__getById(groupId);
			if ($group) {
				if (!$group.hasClass('tn-group__open') && !isSelectedOnlyOneGroup) return;
				groupLeft = parseInt($group.css('left'), 10);
			}

			if (a == 'left') {
				value = $group ? min - groupLeft : min;
			}
			if (a == 'right') {
				value = max - parseInt($el.width(), 10);
				value = $group ? value - groupLeft : value;
			}
			if (a == 'center') {
				value = min + parseInt((max - min) / 2, 10) - parseInt($el.width() / 2, 10);
				value = $group ? value - groupLeft : value;
			}

			$el.css('left', value + 'px');

			if (isGroup) {
				group__saveCurrentPosition($el.attr('id'));
			} else {
				elem__Save__currentPosition($el);
			}
		});
	}

	if (via == 'grid') {
		var elsGroupIds = [];
		var shift = 0;

		if (a == 'left') {
			shift = window.tn.canvas_min_offset_left - min;
		}
		if (a == 'right') {
			shift = window.tn.canvas_min_offset_left + window.tn.canvas_min_width - max;
		}
		if (a == 'center') {
			shift = window.tn.canvas_min_width / 2 - (min - window.tn.canvas_min_offset_left + (max - min) / 2);
		}

		$('.tn-elem__selected').each(function () {
			var $el = $(this);
			var pos = parseInt($el.css('left'), 10);

			$el.css('left', pos + shift + 'px');
			elem__Save__currentPosition($el);
			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId && elsGroupIds.indexOf(groupId) === -1) elsGroupIds.push(groupId);
		});

		elsGroupIds.forEach(function (id) {
			group__setPositionByElemsAttrs(id);
		});
	}

	if (via == 'window') {
		var elsGroupIds = [];
		var shift = 0;

		if (a == 'left') {
			shift = window.tn.canvas_max_offset_left - min;
		}
		if (a == 'right') {
			shift = window.tn.canvas_max_offset_left + window.tn.canvas_max_width - max;
		}
		if (a == 'center') {
			shift = window.tn.canvas_max_width / 2 - (min - window.tn.canvas_max_offset_left + (max - min) / 2);
		}

		$('.tn-elem__selected').each(function () {
			var $el = $(this);
			var pos = parseInt($el.css('left'));

			$el.css('left', pos + shift + 'px');
			elem__Save__currentPosition($el);
			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId && elsGroupIds.indexOf(groupId) === -1) elsGroupIds.push(groupId);
		});

		elsGroupIds.forEach(function (id) {
			group__setPositionByElemsAttrs(id);
		});
	}

	tn_setOutlinePosition('selected');

	tn_destroyTidyControls();
	tn_createSpacingControls();
}

function elems__selected__alignTop(a, via) {
	tn_console('func: elems__selected__alignTop');

	if (via == 'eachother') {
		if ($('.tn-elem__selected').length < 2) return;
	} else {
		if ($('.tn-elem__selected').length == 0) return;
	}

	/* find min and max points */

	var isSelectedOnlyOneGroup =
		$('.tn-group__selected').length === 1 &&
		$('.tn-group__selected .tn-elem').length === $('.tn-elem__selected').length;

	if (via == 'eachother' || via == 'grid' || via == 'window') {
		var min = 1000000;
		var max = -1000000;
		var el_top;
		var el_bottom;

		if ($('.tn-elem__selected').length < 2) return;

		var selector = isSelectedOnlyOneGroup ? '.tn-elem__selected' : '.tn-group__selected, .tn-elem__selected';

		$(selector).each(function () {
			var $el = $(this);
			var groupId = elem__getFieldValue($el, 'groupid');
			var $group;
			if (groupId) $group = group__getById(groupId);
			if ($group && !$group.hasClass('tn-group__open') && !isSelectedOnlyOneGroup) return;

			var position = elem__getRealPosition($el);

			if (a == 'top') {
				el_top = position.top;
				if (el_top < min) min = el_top;
			}
			if (a == 'bottom') {
				el_bottom = position.top + parseInt($el.height(), 10);
				if (el_bottom > max) max = el_bottom;
			}
			if (a == 'middle') {
				el_top = position.top;
				if (el_top < min) min = el_top;

				el_bottom = position.top + parseInt($el.height(), 10);
				if (el_bottom > max) max = el_bottom;
			}
		});

		if (min == 1000000 && max == -1000000) return;
	}

	/* set new position */

	if (via == 'eachother') {
		$(isSelectedOnlyOneGroup ? '.tn-elem__selected' : '.tn-group__selected, .tn-elem__selected').each(function () {
			var $el = $(this);
			var isGroup = $el.hasClass('tn-group');
			var groupId = elem__getFieldValue($el, 'groupid');
			var $group;
			var groupTop;
			var value;
			if (groupId) $group = group__getById(groupId);
			if ($group) {
				if (!$group.hasClass('tn-group__open') && !isSelectedOnlyOneGroup) return;
				groupTop = parseInt($group.css('top'), 10);
			}

			if (a == 'top') {
				value = $group ? min - groupTop : min;
			}
			if (a == 'bottom') {
				value = max - parseInt($el.height(), 10);
				value = $group ? value - groupTop : value;
			}
			if (a == 'middle') {
				value = min + parseInt((max - min) / 2) - parseInt($el.height() / 2, 10);
				value = $group ? value - groupTop : value;
			}

			$el.css('top', value + 'px');

			if (isGroup) {
				group__saveCurrentPosition($el.attr('id'));
			} else {
				elem__Save__currentPosition($el);
			}
		});
	}

	if (via == 'grid') {
		var elsGroupIds = [];
		var shift = 0;

		if (a == 'top') {
			shift = window.tn.canvas_min_offset_top - min;
		}
		if (a == 'bottom') {
			shift = window.tn.canvas_min_offset_top + window.tn.canvas_min_height - max;
		}
		if (a == 'middle') {
			shift = window.tn.canvas_min_height / 2 - (min - window.tn.canvas_min_offset_top + (max - min) / 2);
		}

		$('.tn-elem__selected').each(function () {
			var $el = $(this);
			var pos = parseInt($el.css('top'), 10);
			$el.css('top', pos + shift + 'px');
			elem__Save__currentPosition($el);
			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId && elsGroupIds.indexOf(groupId) === -1) elsGroupIds.push(groupId);
		});

		elsGroupIds.forEach(function (id) {
			group__setPositionByElemsAttrs(id);
		});
	}

	if (via == 'window') {
		var elsGroupIds = [];
		var shift = 0;

		if (a == 'top') {
			shift = window.tn.canvas_max_offset_top - min;
		}
		if (a == 'bottom') {
			shift = window.tn.canvas_max_offset_top + window.tn.canvas_max_height - max;
		}
		if (a == 'middle') {
			shift = window.tn.canvas_max_height / 2 - (min - window.tn.canvas_max_offset_top + (max - min) / 2);
		}

		$('.tn-elem__selected').each(function () {
			var $el = $(this);
			var pos = parseInt($el.css('top'));

			$el.css('top', pos + shift + 'px');
			elem__Save__currentPosition($el);
			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId && elsGroupIds.indexOf(groupId) === -1) elsGroupIds.push(groupId);
		});

		elsGroupIds.forEach(function (id) {
			group__setPositionByElemsAttrs(id);
		});
	}

	tn_setOutlinePosition('selected');

	tn_destroyTidyControls();
	tn_createSpacingControls();
}
