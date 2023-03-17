/**
 * t-null-group содержит в себе все основные функции необходиме для работы с группами в зеро
 */

/**
 * Создание группы
 *
 * @param {string} id - id группы
 * @param {Object} data - параметры группы
 * @param {boolean} isFirstInitOrUndo - значение указывает вызвана функция при инициализации зеро или при undo
 * @returns {void}
 */
function group__create(id, data, isFirstInitOrUndo) {
	var $elems = id ? $('[data-field-groupid-value=' + id + ']') : $('.tn-elem__selected');

	if (typeof $elems == 'undefined' || $elems.length < 2) {
		elem__delFieldValue($('[data-field-groupid-value=' + id + ']'), 'groupid');
		return;
	}

	var groupid = id || group__createGroupId();

	if (!isFirstInitOrUndo) tn_undo__Add('elems_selected_save');

	if (!id) {
		// обновляем zindex элементов на основе наибольшего значения среди выбранных элементов
		var highestZIndex = allelems__getHighestZIndex($elems);
		$elems.sort(function ($a, $b) {
			var aZIndex = parseInt(elem__getFieldValue($($a), 'zindex'));
			var bZIndex = parseInt(elem__getFieldValue($($b), 'zindex'));
			return bZIndex - aZIndex;
		});

		$elems.each(function () {
			var $el = $(this);
			elem__unselect($el, true);
			elem__setFieldValue($el, 'groupid', groupid, false, false, window.tn.topResolution);
			elem__setFieldValue($el, 'zindex', highestZIndex);
			highestZIndex--;
		});
	} else {
		$elems.each(function () {
			var $el = $(this);
			elem__unselect($el, true);
			var $dubleElems = $('[data-elem-id=' + $el.attr('id') + ']');
			if ($dubleElems.length > 1) {
				$dubleElems.each(function () {
					var curEl = $(this);
					if (!curEl.html()) curEl.remove();
				});
			}
		});
	}

	elem__checkZIndexes__Dubble();

	$('.tn-artboard').append('<div id="' + groupid + '" class="tn-group"></div>');
	var $group = $('#' + groupid + '.tn-group');
	$group.append($elems);

	$elems.draggable('disable');
	$elems.resizable('disable');

	group__setPositionByElemsAttrs(groupid);
	group__addUiClickEvents(group__getById(groupid));
	group__updateZIndex(groupid);
	group__saveCurrentPosition(groupid);

	if (typeof data === 'object') {
		if (!data.leftunits) data.leftunits = 'px';
		if (!data.toptunits) data.toptunits = 'px';
		var indexName = group__findHighestNameIndex();
		if (!data.name) data.name = 'Group ' + indexName;

		Object.keys(data).forEach(function (key) {
			if (key !== 'id') {
				if (key === 'lock' && data[key] === 'y') {
					group__lock(groupid, true);
					return;
				}

				if (key === 'hidden' && data[key] === 'y') {
					group__hide(groupid, true);
					return;
				}

				group__setFieldValue(id, key, data[key]);
			}
		});
	} else {
		indexName = group__findHighestNameIndex();
		group__setFieldValue(groupid, 'leftunits', 'px');
		group__setFieldValue(groupid, 'topunits', 'px');
		group__setFieldValue(groupid, 'name', 'Group ' + indexName);
	}

	if (!isFirstInitOrUndo) {
		tn_set_lastChanges();
		layers__update();
		group__select(groupid);
	}

	group__checkEmpty();
}

/**
 * генерация id для группы
 *
 * @returns {string}
 */
function group__createGroupId() {
	return Date.now() + '' + getRandomInt(10000, 99999);
}

/**
 * Добавление элемента в группу
 *
 * @param {jqElement} $el - элемент зероблока
 * @param {string} groupId - id группы
 * @returns {void}
 */
function group__insertElemInGroup($el, groupId) {
	var $group = group__getById(groupId);
	if (!$group) return;
	elem__setFieldValue($el, 'groupid', groupId, false, false, window.tn.topResolution);
	$group.append($el);
	elem__renderViewOneField($el, 'left');
	elem__renderViewOneField($el, 'top');
}

/**
 * Удаление элемента из группы
 *
 * @param {jqElement} $el - элемент зероблока
 * @param {string} groupId
 * @returns {void}
 */
function group__deleteElemFromGroup($el, groupId) {
	var $group = group__getById(groupId);
	if (!$group) return;
	elem__delFieldValue($el, 'groupid', false, false, false, window.tn.topResolution);
	$el.appendTo('.tn-artboard');
	elem__renderViewOneField($el, 'left');
	elem__renderViewOneField($el, 'top');
	$el.draggable('enable');
	group__setPositionByElemsAttrs(groupId);
}

/**
 * Получение индекса названия группы.
 * Новая группа имеет вид "Group 1".
 * При создании новой группы мы ищем самый большой индекс и возвращаем значение на 1 больше
 *
 * @returns {number}
 */
function group__findHighestNameIndex() {
	var highestIndex = 0;
	var $groups = $('.tn-group');
	$groups.each(function () {
		var $group = $(this);
		var name = group__getFieldValue($group, 'name');

		if (name) {
			var splittedName = name.split('Group ');
			if (splittedName.length !== 2) return;
			var index = parseInt(splittedName[1]);
			if (isNaN(index)) return;
			if (index > highestIndex) highestIndex = index;
		}
	});

	return highestIndex + 1;
}

/**
 * конвертация значений атрибутов группы в объект
 *
 * @param {string} groupId
 * @returns {object} - group's data
 */
function group__getDataJson(groupId) {
	var groupFields = 'name,lock,hidden,left,top,leftunits,topunits';
	var data = [];

	if (groupId) {
		var $group = group__getById(groupId);
		var groupData = {id: groupId};
		groupFields.split(',').forEach(function (field) {
			groupData[field] = group__getFieldValue($group, field);
		});

		data = groupData;
	} else {
		$('.tn-group').each(function () {
			var $group = $(this);
			var groupId = $group.attr('id');
			var groupData = {id: groupId};

			groupFields.split(',').forEach(function (field) {
				groupData[field] = group__getFieldValue($group, field);
			});

			data.push(groupData);
		});
	}

	return data;
}

/**
 * Функция возвращает координаты группы на основе аттрибутов, это необходимо например для обновления позиции группы
 * после изменения координат элемента в настройках.
 * Данную функцию необходимо использовать только внутри функции allelems__renderView.
 * Важно чтобы она вызывалась один раз за рендер, так перебираются все элементы в группе.
 * Иначе сильно нагрузит систему.
 *
 * @param {string} groupid
 * @returns {object} - coordinates of group
 */
function group__getMinMaxPoints(groupid) {
	//find max points
	var y_min = 1000000;
	var y_max = -1000000;
	var x_min = 1000000;
	var x_max = -1000000;

	var el_top;
	var el_bottom;
	var el_left;
	var el_right;
	var $els = group__getAllElementsById(groupid);

	$els.each(function () {
		var $el = $(this);

		el_top = parseInt(elem__getFieldValue($el, 'top'));
		el_top = elem__convertPosition__Local__toAbsolute($el, 'top', el_top);
		if (el_top < y_min) y_min = el_top;

		el_bottom = el_top + parseInt($el.height());
		if (el_bottom > y_max) y_max = el_bottom;

		el_left = parseInt(elem__getFieldValue($el, 'left'));
		el_left = elem__convertPosition__Local__toAbsolute($el, 'left', el_left);
		if (el_left < x_min) x_min = el_left;

		el_right = el_left + parseInt($el.width());
		if (el_right > x_max) x_max = el_right;
	});

	return {
		y_min: y_min,
		y_max: y_max,
		x_min: x_min,
		x_max: x_max,
	};
}

/**
 * устанавливаем значения координат и размеров группы
 *
 * @param {string} groupid
 * @param {object} minMaxPoints - значение из функции group__getMinMaxPoints
 * @param {boolean} isDisableUpdateElems - значение указывающее нужно ли обновлять координаты элементов
 * @returns {void}
 */
function group__setPositionByElemsAttrs(groupid, minMaxPoints, isDisableUpdateElems) {
	tn_console();
	// USE minMaxPoints ONLY IN allelems__renderView
	var points = minMaxPoints || group__getMinMaxPoints(groupid);

	$('#' + groupid + '.tn-group')
		.css('top', points.y_min)
		.css('left', points.x_min)
		.css('height', points.y_max - points.y_min)
		.css('width', points.x_max - points.x_min);

	if (!minMaxPoints) group__updateElemsActualPosition(groupid);
	group__saveCurrentPosition(groupid, false, isDisableUpdateElems);
}

/**
 * Получение всех элементов в группе
 *
 * @param {string} id - id группы
 * @returns {jqElement}
 */
function group__getAllElementsById(id) {
	return $('#' + id + '.tn-group .tn-elem');
}

/**
 * Получение самого высокого z-index в группе
 *
 * @param {string} groupId
 * @returns {number}
 */
function group__getHighestZIndexInGroup(groupId) {
	var max = 0;

	group__getAllElementsById(groupId).each(function () {
		var $el = $(this);
		var zindex = elem__getFieldValue($el, 'zindex');
		zindex = parseInt(zindex);
		if (typeof zindex !== 'undefined' && isNaN(zindex) == false && zindex > max) max = zindex;
	});

	max = parseInt(max, 10);
	return max;
}

/**
 * Получение самого низкого z-index в группе
 *
 * @param {string} groupId
 * @returns {number}
 */
function group__getLowestZIndexInGroup(groupId) {
	var min = 10000000;

	group__getAllElementsById(groupId).each(function () {
		var $el = $(this);
		var zindex = elem__getFieldValue($el, 'zindex');
		zindex = parseInt(zindex, 10);
		if (typeof zindex !== 'undefined' && isNaN(zindex) == false && zindex < min) min = zindex;
	});

	min = parseInt(min, 10);
	return min;
}

/**
 * Обновление значения z-index группы.
 * Необходимо при обновлении z-index элемента в группе
 *
 * @param {string} groupId
 * @returns {void}
 */
function group__updateZIndex(groupId) {
	var $group = group__getById(groupId);
	var zindex = group__getHighestZIndexInGroup(groupId);
	$group.css('z-index', zindex);
}

/**
 * Получение элемента группы по id
 *
 * @param {string} groupId
 * @returns {jqElement|null}
 */
function group__getById(groupId) {
	var $group = $('#' + groupId + '.tn-group');
	return $group.length ? $group : null;
}

/**
 * Обновление значения группы
 *
 * @param {string} id
 * @param {string} field
 * @param {string|number} val
 * @returns {void}
 */
function group__setFieldValue(id, field, val) {
	var $group = group__getById(id);
	if ($group) $group.attr('data-field-' + field + '-value', val);
}

/**
 * Получение значения поля группы
 *
 * @param {jqElement} $group
 * @param {string} field
 * @returns {string}
 */
function group__getFieldValue($group, field) {
	return $group.attr('data-field-' + field + '-value');
}

/**
 * Обновление абсолютных координат элементов внутри группы
 *
 * @param {string} groupid
 * @returns {void}
 */
function group__updateElemsActualPosition(groupid) {
	var $groupEl = group__getById(groupid);
	if (!$groupEl) return;
	var groupLeftPos = $groupEl.css('left').slice(0, -2);
	var groupTopPos = $groupEl.css('top').slice(0, -2);

	$('[data-field-groupid-value=' + groupid + ']').each(function () {
		var $el = $(this);
		if ($el.hasClass('tn-elem__fake')) return;
		var elLeft = elem__getFieldValue($el, 'left');
		elLeft = elem__convertPosition__Local__toAbsolute($el, 'left', elLeft);
		var elTop = elem__getFieldValue($el, 'top');
		elTop = elem__convertPosition__Local__toAbsolute($el, 'top', elTop);

		$el.css({
			left: elLeft - groupLeftPos,
			top: elTop - groupTopPos,
		});
	});
}

/**
 * Сохранение координат в атрибутах
 *
 * @param {string} groupId
 * @param {string|false} field - если не указать false, то будет выполнено и для left, и для right
 * @param {boolean} isDisableUpdateElems - значение указывает нужно ли обновить координаты элементов в группе
 * @returns {void}
 */
function group__saveCurrentPosition(groupId, field, isDisableUpdateElems) {
	var $group = group__getById(groupId);
	if (!$group) return;

	if (field) {
		var propValue = parseInt($group.css(field));
		propValue = group__convertPosition__Absolute__toLocal($group, field, propValue);
		group__setFieldValue(groupId, field, propValue);
		panelSettings__updateGroupUi($group, field, propValue);
	} else {
		var left = parseInt($group.css('left'));
		left = group__convertPosition__Absolute__toLocal($group, 'left', left);
		group__setFieldValue(groupId, 'left', left);

		var top = parseInt($group.css('top'));
		top = group__convertPosition__Absolute__toLocal($group, 'top', top);
		group__setFieldValue(groupId, 'top', top);

		tn_multiEdit__updateUi();
	}

	if (!isDisableUpdateElems) {
		$group.find('.tn-elem').each(function () {
			var $el = $(this);
			elem__Save__currentPosition($el);
		});
	}
}

/**
 * Обновление настроек группы в панели настроек
 *
 * @param {string} groupId
 * @param {string} field
 */
function group__updateGroupSizesUI(groupId, field) {
	var $group = group__getById(groupId);

	var propValue = parseInt($group.css(field));
	panelSettings__updateGroupUi($group, field, propValue);
}

/**
 * Выделение группы
 *
 * @param {string} groupid
 * @param {boolean} isSelectAlso - значение указывает нужно ли сбросить уже выделенные элементы и группы или нет
 * @returns {void}
 */
function group__select(groupid, isSelectAlso) {
	tn_console();
	var $group = group__getById(groupid);
	if (!$group) return;

	if (!isSelectAlso) {
		group__unselectAll();
		allelems__unselect();
	}

	allelems__closeEditMode();
	if (window.tn_flag_sbs_panelopen) panelSBS__close();
	var $elemsInGroup = group__getAllElementsById(groupid);
	$elemsInGroup.each(function () {
		var $el = $(this);
		$el.addClass('tn-elem__selected');
	});

	$('.tn-elem__selected').resizable('disable');

	window.tn.multi_edit = true;
	window.tn.multi_edit_elems = $elemsInGroup;
	window.tn.is_group_selected = true;
	window.tn_flag_settings_ui_focus = false;
	$group.addClass('tn-group__selected');
	panelSettings__openTimeout($elemsInGroup, true);
	layers__hightlight();
	$('body').addClass('tn-multiselected');

	elem__removeAxis();

	tn_setOutlinePosition('selected');
	tn_showOutline('selected');
}

/**
 * Снять выделение со всех групп
 */
function group__unselectAll() {
	var $groups = $('.tn-group');
	var groupedElems = $('.tn-group .tn-elem');
	$groups.removeClass('tn-group__selected');
	groupedElems.removeClass('tn-elem__selected');
	groupedElems.resizable('disable');
	group__closeSelectionForAll();
	layers__hightlight();

	tn_hideOutline('selected');
}

/**
 * Разгруппировать
 *
 * @param {string} groupId
 * @param {boolean} withoutUndo - значение указывает добавлять ли в история действие
 * @returns {void}
 */
function group__unmake(groupId, withoutUndo) {
	tn_console();

	var $elems = $('.tn-elem__selected');
	if (!groupId && (typeof $elems == 'undefined' || $elems.length == 0)) {
		return;
	}

	if (!withoutUndo) tn_undo__Add('elems_selected_save');

	var $currentGroup = groupId ? $('.tn-group#' + groupId) : $('.tn-group__selected');

	if (groupId) {
		$elems = $currentGroup.find('.tn-elem');
	}
	$currentGroup.find('.tn-elem').unwrap();
	$currentGroup.remove();

	$elems.each(function () {
		var $el = $(this);
		var groupid = elem__getFieldValue($el, 'groupid');

		if (withoutUndo || (typeof groupid !== 'undefined' && groupid > 0)) {
			elem__delFieldValue($el, 'groupid', false, false, false, window.tn.topResolution);
			elem__renderViewOneField($el, 'left');
			elem__renderViewOneField($el, 'top');
			$el.draggable('enable');
		}
	});

	if (!withoutUndo) tn_set_lastChanges();
	layers__update();
}

/**
 * Проверка есть ли в группе элементы
 *
 * @param {string} groupId
 */
function group__checkEmpty(groupId) {
	var selector = groupId ? '.tn-group#' + groupId : '.tn-group';

	$(selector).each(function () {
		var $group = $(this);
		var id = groupId || $group.attr('id');
		var $groupElems = group__getAllElementsById(id);
		if ($groupElems.length < 2) group__unmake(id, true);
	});
}

/**
 * Снять выделение с конкретной группы
 *
 * @param {string} groupid
 */
function group__unselect(groupid) {
	tn_console();

	var $els = group__getAllElementsById(groupid);
	var $group = group__getById(groupid);

	$els.each(function () {
		var $el = $(this);
		$el.removeClass('tn-elem__selected');
		$el.resizable('disable');
		$el.trigger('elementUnselected');

		if (window.tn_flag_sbs_onstep == 'y') {
			sbs__elem__exitonStepMode($el);
		}
	});

	$group.removeClass('tn-group__selected');

	var $elem_selected = $('.tn-elem__selected');

	if ($elem_selected.length === 1) {
		var $el_sel = $('.tn-elem__selected');
		$el_sel.resizable('enable');
		allelems__closeEditMode();
		$el_sel.trigger('elementSelected');
	}

	if ($elem_selected.length > 1) {
		window.tn.multi_edit = true;
		window.tn.multi_edit_elems = $elem_selected;
		panelSettings__openTimeout($elem_selected, true);
		$('body').addClass('tn-multiselected');
	} else {
		$('body').removeClass('tn-multiselected');
	}

	if ($elem_selected.length === 0) {
		panelABSettings__open();
		tn_hideOutline('selected');
	} else {
		tn_setOutlinePosition('selected');
	}

	$group.draggable('enable');
	layers__hightlight();
	elem__removeAxis();
}

/**
 * "Вход" в группу для совершения дествий с элементами внутри этой группы
 *
 * @param {jqElement} $group
 */
function group__openSelection($group) {
	$group.addClass('tn-group__open');
	$group.removeClass('tn-group__hover');
	tn_setOutlinePosition('hover');
	$group.draggable('disable');

	var $elemsInGroup = $group.find('.tn-elem');
	$elemsInGroup.each(function () {
		var el = $(this);
		var el_lock = elem__getFieldValue(el, 'lock');
		if (el_lock !== 'y') el.draggable('enable');
	});
}

/**
 *  Выход из все "открых" групп
 */
function group__closeSelectionForAll() {
	var $openSelectionGroups = $('.tn-group__open');

	if ($openSelectionGroups.length) {
		$openSelectionGroups.find('.tn-elem').draggable('disable');
		$openSelectionGroups.removeClass('tn-group__open');
		$openSelectionGroups.draggable('enable');
	}
}

/**
 * Блокировка группы
 *
 * @param {string} id - id группы
 * @param {boolean} isInitCall - значение указывает идет ли вызов из функции инициализации блока
 * @param {boolean} disableSaveUndo - значение, которое позволяет отключить добавление в историю
 */
function group__lock(id, isInitCall, disableSaveUndo) {
	var $elems;
	if (!isInitCall && !disableSaveUndo) tn_undo__Add('elems_selected_save');
	if (id) {
		var $group = $('.tn-group#' + id);
		var isLocked = group__getFieldValue($group, 'lock');
		var value = 'y';
		if (isLocked === 'y') value = null;

		group__setFieldValue(id, 'lock', value);

		$elems = group__getAllElementsById(id);
		if (value === 'y') {
			$group.addClass('tn-group__locked');
			$group.draggable('disable');
		} else {
			$group.removeClass('tn-group__locked');
			$group.draggable('enable');
		}
	} else {
		$('.tn-group__selected').each(function () {
			var $group = $(this);
			var groupId = $group.attr('id');
			var isLocked = group__getFieldValue($group, 'lock');
			var value = 'y';
			if (isLocked === 'y') value = null;

			group__setFieldValue(groupId, 'lock', value);

			$elems = group__getAllElementsById(groupId);
			if (value === 'y') {
				$group.addClass('tn-group__locked');
				$group.draggable('disable');
			} else {
				$group.removeClass('tn-group__locked');
				$group.draggable('enable');
			}
		});
	}

	if (!isInitCall) {
		elem__Lock($elems, value);
		tn_set_lastChanges();
	}

	layers__update();
}

/**
 * Сокрытие группы
 *
 * @param {string} id - id группы
 * @param {boolean} isInitCall - значение указывает идет ли вызов из функции инициализации блока
 * @param {boolean} disableSaveUndo - значение, которое позволяет отключить добавление в историю
 */
function group__hide(id, isInitCall, disableSaveUndo) {
	var $elems;
	if (!isInitCall && !disableSaveUndo) tn_undo__Add('elems_selected_save');
	if (id) {
		var $group = $('.tn-group#' + id);
		$elems = group__getAllElementsById(id);
		var isHidden = group__getFieldValue($group, 'hidden');
		var value = 'y';
		if (isHidden === 'y') value = null;
		group__setFieldValue(id, 'hidden', value);

		if (isHidden) {
			$group.removeClass('tn-group__hidden');
		} else {
			$group.addClass('tn-group__hidden');
		}

		if (!isInitCall) {
			elem__Invisible($elems, value);
			tn_set_lastChanges();
		}
	} else {
		$('.tn-group__selected').each(function () {
			var $group = $(this);
			var groupId = $group.attr('id');

			$elems = group__getAllElementsById(groupId);
			var isHidden = group__getFieldValue($group, 'hidden');
			var value = 'y';
			if (isHidden === 'y') value = null;

			group__setFieldValue(groupId, 'hidden', value);

			if (isHidden) {
				$group.removeClass('tn-group__hidden');
			} else {
				$group.addClass('tn-group__hidden');
			}
		});
	}
	if (!isInitCall) {
		elem__Invisible($elems, value);
		if (!disableSaveUndo) tn_set_lastChanges();
	}
	layers__update();
}

/**
 * Разблокировать группу, в которой нет заблокированных элементов (необходимо в undo)
 */
function group__unlockWithoutLockedElems() {
	var $unlockedElemsInLockedGroups = $('.tn-group__locked .tn-elem:not([data-field-lock-value="y"])');
	var $groupsShouldBeUnlocked = $unlockedElemsInLockedGroups.parents('.tn-group__locked');
	$groupsShouldBeUnlocked.each(function () {
		var $group = $(this);
		group__lock($group.attr('id'), true);
	});
}

/**
 * Показать группу, в которой нет скрытых элементов (необходимо в undo)
 */
function group__showkWithoutHiddenElems() {
	var $unlockedElemsInHiddenGroups = $('.tn-group__hidden .tn-elem:not([data-field-invisible-value="y"])');
	var $groupsShouldBeShown = $unlockedElemsInHiddenGroups.parents('.tn-group__hidden');
	$groupsShouldBeShown.each(function () {
		var $group = $(this);
		group__hide($group.attr('id'), true);
	});
}

/**
 * Конвертация координат группы из абсолютных в локальные
 *
 * @param {jqElement} $group - jq элемент группы
 * @param {string} field - поле координат (left или right)
 * @param {string|number} value - значение для конвертации
 * @returns {number}
 */
function group__convertPosition__Absolute__toLocal($group, field, value) {
	value = parseInt(value, 10);
	var units;

	if (field === 'left') {
		units = group__getFieldValue($group, 'leftunits');
		var offset_left = window.tn.canvas_min_offset_left;
		var container_width = window.tn.canvas_min_width;

		value = value - offset_left;

		if (units === '%') {
			value = Math.round((value / container_width) * 100);
		}
	}

	if (field === 'top') {
		units = group__getFieldValue($group, 'topunits');
		var offset_top = window.tn.canvas_min_offset_top;
		var container_height = window.tn.canvas_min_height;

		value = value - offset_top;

		if (units === '%') {
			value = Math.round((value / container_height) * 100);
		}
	}

	return value;
}

/**
 * Конвертация координат группы из локальных в абсолютные
 *
 * @param {jqElement} $group - jq элемент группы
 * @param {string} field - поле координат (left или right)
 * @param {string|number} value - значение для конвертации
 * @returns {number}
 */
function group__convertPosition__Local__toAbsolute($group, field, value) {
	if (typeof value === 'undefined') value = group__getFieldValue($group, field);
	value = parseInt(value, 10);

	if (field == 'left') {
		var offset_left = window.tn.canvas_min_offset_left;
		var group_container_width = window.tn.canvas_min_width;

		/* fluid or not */
		var group_leftunits = group__getFieldValue($group, 'leftunits');
		if (group_leftunits === '%') {
			value = parseInt(group_container_width * parseFloat(value / 100));
		}

		value = offset_left + value;
	}

	if (field == 'top') {
		var offset_top = window.tn.canvas_min_offset_top;
		var group_container_height = window.tn.canvas_min_height;

		/* fluid or not	*/
		var el_topunits = group__getFieldValue($group, 'topunits');
		if (el_topunits === '%') {
			value = parseInt(group_container_height * parseFloat(value / 100));
		}

		value = offset_top + value;
	}

	return value;
}

/**
 * Проверка выделены ли только группы
 *
 * @returns {boolean}
 */
function group__isSelectedOnlyGroups() {
	var $selectedGroups = $('.tn-group__selected');
	var $selectedElemsIngroups = $selectedGroups.find('.tn-elem');
	var $selectedElems = $('.tn-elem__selected');

	return $selectedElemsIngroups.length === $selectedElems.length;
}

/**
 * выравнивание выделенной группы относительно канваса
 *
 * @param {string} prop - параметр выравнивания
 * @returns {void}
 */
function group__aligntoCanvas(prop) {
	tn_console('func: elem__aligntoCanvas');

	if ($('.tn-group__selected').length === 0) return;

	$('.tn-group__selected').each(function () {
		var $el = $(this);

		var width = $el.width();
		var height = $el.height();

		if (prop == 'left') {
			$el.css('left', window.tn.canvas_min_offset_left + 'px');
		}
		if (prop == 'right') {
			$el.css('left', window.tn.canvas_min_offset_left + window.tn.canvas_min_width - parseInt(width) + 'px');
		}
		if (prop == 'center') {
			$el.css('left', window.tn.canvas_min_offset_left + window.tn.canvas_min_width / 2 - parseInt(width / 2) + 'px');
		}
		if (prop == 'top') {
			$el.css('top', window.tn.canvas_min_offset_top + 'px');
		}
		if (prop == 'bottom') {
			$el.css('top', window.tn.canvas_min_offset_top + window.tn.canvas_min_height - parseInt(height) + 'px');
		}
		if (prop == 'middle') {
			$el.css('top', window.tn.canvas_min_offset_top + window.tn.canvas_min_height / 2 - parseInt(height / 2) + 'px');
		}

		group__saveCurrentPosition($el.attr('id'));
		tn_setOutlinePosition('selected');
	});
}

/**
 * Проверка есть ли элементы, которые пренадлежат группе вне группы и создание группы при нахождении таких элементов
 *
 * @returns {void}
 */
function group__checkGroupedElsOutside() {
	var groupIds = [];
	$('.tn-artboard > .tn-elem[data-field-groupid-value]').each(function () {
		var $el = $(this);
		var groupId = elem__getFieldValue($el, 'groupid');
		if (groupId && groupIds.indexOf(groupId) === -1) groupIds.push(groupId);
	});

	groupIds.forEach(function (id) {
		var $els = $('.tn-elem[data-field-groupid-value="' + id + '"]');
		var $group = group__getById(id);

		if ($els.length === 1) {
			elem__delFieldValue($els, 'groupid');
		} else {
			if ($group && $group.length) {
				$els.each(function () {
					group__insertElemInGroup($(this), id);
				});
			} else {
				group__create(id, undefined, true);
			}
		}
	});
}

/**
 * Выводит все элементы группы выше на одно значение по оси z
 *
 * @param {jqElement} $group - jq элемент группы
 */
function group__setZIndex__Backward($group) {
	tn_undo__Add('elems_sort');
	var groupId = $group.attr('id');
	var lowestGroupIndex = group__getLowestZIndexInGroup(groupId);
	lowestGroupIndex = parseInt(lowestGroupIndex);
	var $elems = $('.tn-artboard > .tn-elem:not(.tn-elem__fake), .tn-group');
	var zIndexBehind = 0;
	var $elBehind;

	$elems.each(function () {
		var $el = $(this);
		var isGroup = $el.hasClass('tn-group');
		var elZIndex = isGroup ? group__getLowestZIndexInGroup($el.attr('id')) : elem__getFieldValue($el, 'zindex');
		elZIndex = parseInt(elZIndex, 10);

		if (elZIndex > zIndexBehind && elZIndex < lowestGroupIndex) {
			zIndexBehind = elZIndex;
			$elBehind = $el;
		}
	});

	if (zIndexBehind !== 0) {
		var counter = 0;
		$group.find('.tn-elem').each(function () {
			var $el = $(this);
			elem__setFieldValue($el, 'zindex', zIndexBehind + counter);
			$el.css('z-index', zIndexBehind + counter);
			counter++;
		});

		var zIndexStart = zIndexBehind + counter;

		if ($elBehind.hasClass('tn-group')) {
			counter = 0;
			$elBehind.find('.tn-elem').each(function () {
				var $el = $(this);
				elem__setFieldValue($el, 'zindex', zIndexStart + counter);
				$el.css('z-index', zIndexStart + counter);
				counter++;
			});
		} else {
			elem__setFieldValue($elBehind, 'zindex', zIndexStart);
			$elBehind.css('z-index', zIndexStart);
		}
	}
	tn_set_lastChanges();
}

/**
 * Выводит все элементы группы ниже на одно значение по оси z
 *
 * @param {jqElement} $group - jq элемент группы
 */
function group__setZIndex__Forward($group) {
	tn_undo__Add('elems_sort');
	var groupId = $group.attr('id');
	var lowestGroupIndex = group__getLowestZIndexInGroup(groupId);
	lowestGroupIndex = parseInt(lowestGroupIndex);
	var $elems = $('.tn-artboard > .tn-elem:not(.tn-elem__fake), .tn-group');
	var zIndexForward = 1000000;
	var $elForward;

	$elems.each(function () {
		var $el = $(this);
		var isGroup = $el.hasClass('tn-group');
		var elZIndex = isGroup ? group__getLowestZIndexInGroup($el.attr('id')) : elem__getFieldValue($el, 'zindex');
		elZIndex = parseInt(elZIndex, 10);

		if (elZIndex < zIndexForward && elZIndex > lowestGroupIndex) {
			zIndexForward = elZIndex;
			$elForward = $el;
		}
	});

	if ($elForward) {
		if ($elForward.hasClass('tn-group')) {
			group__setZIndex__Backward($elForward);
		} else {
			var newZIndex = elem__setZIndex__Backward($elForward);
			$elForward.css('z-index', newZIndex);
		}
	}
	tn_set_lastChanges();
}

/**
 * Выводит все элементы группы вниз по оси z
 *
 * @param {jqElement} $group - jq элемент группы
 */
function group__setZIndex__Back($group) {
	tn_undo__Add('elems_sort');
	var $elems = $('.tn-artboard > .tn-elem:not(.tn-elem__fake), .tn-group');
	var groupId = $group.attr('id');
	$elems = sortElemsByZindex($elems);

	var $lowestElem = $($elems[$elems.length - 1]);
	var lowestIndex = $lowestElem.hasClass('tn-group')
		? group__getLowestZIndexInGroup($lowestElem.attr('id'))
		: elem__getFieldValue($lowestElem, 'zindex');
	lowestIndex = parseInt(lowestIndex, 10);

	var $groupElems = sortElemsByZindex($group.find('.tn-elem'));
	var counter = 0;
	$($groupElems.get().reverse()).each(function () {
		var $el = $(this);
		elem__setFieldValue($el, 'zindex', lowestIndex + counter);
		$el.css('z-index', lowestIndex + counter);
		counter++;
	});

	$('.tn-elem:not(.tn-elem__fake)').each(function () {
		var $el = $(this);
		if (elem__getFieldValue($el, 'groupid') == groupId) return;
		var elZIndex = elem__getFieldValue($el, 'zindex');
		elZIndex = parseInt(elZIndex, 10);
		elem__setFieldValue($el, 'zindex', elZIndex + counter);
		$el.css('z-index', elZIndex + counter);
	});
	tn_set_lastChanges();
}

/**
 * Выводит все элементы группы вверх по оси z
 *
 * @param {jqElement} $group - jq элемент группы
 */
function group__setZIndex__Front($group) {
	tn_undo__Add('elems_sort');
	var $elems = $('.tn-artboard > .tn-elem:not(.tn-elem__fake), .tn-group');
	var groupId = $group.attr('id');
	$elems = sortElemsByZindex($elems);
	var $initialLowestGroupEl = group__getLowestZIndexInGroup(groupId);

	var $highestElem = $($elems[0]);
	var highestIndex = $highestElem.hasClass('tn-group')
		? group__getLowestZIndexInGroup($highestElem.attr('id'))
		: elem__getFieldValue($highestElem, 'zindex');
	highestIndex = parseInt(highestIndex, 10);

	var $groupElems = sortElemsByZindex($group.find('.tn-elem'));
	var counter = 0;
	$($groupElems.get().reverse()).each(function () {
		var $el = $(this);
		elem__setFieldValue($el, 'zindex', highestIndex + counter);
		$el.css('z-index', highestIndex + counter);
		counter++;
	});

	$('.tn-elem:not(.tn-elem__fake)').each(function () {
		var $el = $(this);
		if (elem__getFieldValue($el, 'groupid') == groupId) return;
		if (elem__getFieldValue($el, 'zindex') < $initialLowestGroupEl) return;
		var elZIndex = elem__getFieldValue($el, 'zindex');
		elZIndex = parseInt(elZIndex);
		elem__setFieldValue($el, 'zindex', elZIndex - counter);
		$el.css('z-index', elZIndex - counter);
	});
	tn_set_lastChanges();
}

/**
 * Ищет элементы в группе с процентами в координатах
 *
 * @param {string} groupId
 * @param {string} axis - ось поиска
 * @returns {number}
 */
function group__checkElemsWithPercentUnits(groupId, axis) {
	var $group = group__getById(groupId);
	if (axis === 'left') {
		return $group.find('.tn-elem[data-field-leftunits-value="%"]').length;
	} else if (axis === 'top') {
		return $group.find('.tn-elem[data-field-topunits-value="%"]').length;
	} else {
		return $group.find('.tn-elem[data-field-topunits-value="%"], .tn-elem[data-field-leftunits-value="%"]').length;
	}
}
