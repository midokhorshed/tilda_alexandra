/**
 * @typedef {
 * | group_create
 * | elem_save
 * | elem_delete
 * | elem_add
 * | elem_duplicate
 * | elem_move
 * | elems_selected_save
 * | elems_selected_delete
 * | elems_selected_add
 * | elems_selected_move
 * | elem_sbs
 * | ab_save
 * | screens_save
 * | guides_save
 * | guides_add
 * | guides_delete
 * } ActionType
 */

/**
 * Добавляет действие в стек undo/redo
 *
 * @param {ActionType} comm - Тип действия которое нужно добавить в undo/redo
 * @param {jQuery} [$el] - Опциональный элемент из которого нужно получить данные, может быть как результатом вызова `$('.tn-elem__selected')`, так и переменной `window.tn.multi_edit_elems`, так и одним единственным элементом, так же может быть обьектом {previousScreens, currentScreens} при смене брейкпоинтов
 * @param {'undo' | 'redo'} [action=undo]
 * @param {number} [delay=300]
 */
function tn_undo__Add(comm, $el, action, delay) {
	if (!action) {
		action = 'undo';
	}

	if (typeof delay !== 'number') {
		delay = 300;
	}

	tn_console('func: tn_' + action + '__Add. comm:' + comm);

	var elem_id = 0;
	var res = window.tn.curResolution;
	var groupIds = [];
	var $ab;

	if (
		comm == 'group_create' ||
		comm == 'elem_save' ||
		comm == 'elem_delete' ||
		comm == 'elem_add' ||
		comm == 'elem_duplicate'
	) {
		if ($el && ($el.selector === '.tn-elem__selected' || $el.length > 1)) {
			if (typeof window.tempaddundoeldata[0] === 'undefined') {
				window.tempaddundoeldata[0] = {isMultiUndo: true};
			}

			$('.tn-elem__selected').each(function () {
				var $tel = $(this);
				var tel_id = $tel.attr('data-elem-id');

				if (typeof window.tempaddundoeldata[0][tel_id] === 'undefined') {
					window.tempaddundoeldata[0][tel_id] = elem__getData__inJson($tel);
				}
			});
		} else {
			elem_id = $el.attr('data-elem-id');
			if (typeof window.tempaddundoeldata[elem_id] === 'undefined') {
				window.tempaddundoeldata[elem_id] = elem__getData__inJson($el);
			}
		}
	} else if (comm == 'elem_move') {
		elem_id = $el.attr('data-elem-id');

		if (typeof window.tempaddundoeldata[elem_id] == 'undefined') {
			window.tempaddundoeldata[elem_id] = {};
			window.tempaddundoeldata[elem_id]['data-field-left-value'] = elem__getFieldValue($el, 'left');
			window.tempaddundoeldata[elem_id]['data-field-top-value'] = elem__getFieldValue($el, 'top');
		}
	} else if (comm == 'elems_sort') {
		window.tempaddundoeldata[elem_id] = {};

		$('.tn-elem').each(function () {
			var $tel = $(this);
			var tel_id = $tel.attr('data-elem-id');
			var z = $tel.attr('data-field-zindex-value');

			if (typeof z === 'undefined') z = '';

			window.tempaddundoeldata[elem_id][tel_id] = z;
		});
	} else if (comm == 'elems_figma_import') {
		window.tempaddundoeldata[elem_id] = {};
		groupIds = [];

		for (var id in $el) {
			var $elem = $('#' + id);
			var groupId = elem__getFieldValue($elem, 'groupid');
			if (groupId && groupIds.indexOf(groupId) === -1) groupIds.push(groupId);
			window.tempaddundoeldata[elem_id][id] = elem__getData__inJson($elem);
		}
	} else if (comm == 'elems_selected_save' || comm == 'elems_selected_delete' || comm == 'elems_selected_add') {
		window.tempaddundoeldata[elem_id] = {};
		var $currentElems = $('.tn-elem__selected');
		if (comm == 'elems_selected_add' && $el.length) {
			$currentElems = $el;
		}

		// При redo элементы могут быть не выделены, но мы их получаем из $el
		if ($el && $el.length > 1) {
			$currentElems = $el;
		}

		groupIds = [];

		$currentElems.each(function () {
			var $tel = $(this);
			var groupId = elem__getFieldValue($tel, 'groupid');
			var tel_id = $tel.attr('data-elem-id');

			if (groupId && groupIds.indexOf(groupId) === -1) groupIds.push(groupId);

			window.tempaddundoeldata[elem_id][tel_id] = elem__getData__inJson($tel);
		});

		if ((comm == 'elems_selected_save' || comm == 'elems_selected_delete') && groupIds.length) {
			window.tempaddundoeldata.groups = {};

			groupIds.forEach(function (id) {
				window.tempaddundoeldata.groups[id] = group__getDataJson(id);
			});
		}
	} else if (comm == 'elems_selected_move') {
		if (typeof window.tempaddundoeldata[elem_id] == 'undefined') {
			var selectedElems = $el && $el.hasClass('tn-group') ? $el.find('.tn-elem') : $('.tn-elem__selected');

			window.tempaddundoeldata[elem_id] = {};

			selectedElems.each(function () {
				var $t_el = $(this);
				var t_el_id = $t_el.attr('data-elem-id');

				window.tempaddundoeldata[elem_id][t_el_id] = {};
				window.tempaddundoeldata[elem_id][t_el_id]['data-field-left-value'] = elem__getFieldValue($t_el, 'left');
				window.tempaddundoeldata[elem_id][t_el_id]['data-field-top-value'] = elem__getFieldValue($t_el, 'top');
			});
		}
	} else if (comm == 'elem_sbs') {
		elem_id = $el.attr('data-elem-id');

		if (typeof window.tempaddundoeldata[elem_id] == 'undefined') {
			window.tempaddundoeldata[elem_id] = {};
			window.tempaddundoeldata[elem_id]['data-sbs-step-i'] = $el.attr('data-sbs-step-i');
			window.tempaddundoeldata[elem_id]['data-field-sbsopts-value'] = elem__getFieldValue($el, 'sbsopts');
		}
	} else if (comm == 'ab_save') {
		$ab = $('.tn-artboard');

		window.tempaddundoeldata[elem_id] = {};
		window.tempaddundoeldata[elem_id] = ab__getData__inJson($ab);
	} else if (comm == 'screens_save') {
		window.tempaddundoeldata[elem_id] = {};
		$ab = $('.tn-artboard');

		var data = $el;

		var patch = {
			previousScreens: data.previousScreens,
			currentScreens: data.currentScreens,
			ab: ab__getData__inJson($ab),
			elems: $('.tn-elem')
				.map(function () {
					return elem__getData__inJson($(this));
				})
				.toArray(),
		};

		window.tempaddundoeldata[elem_id] = patch;
	} else if (['guides_save', 'guides_delete', 'guides_add'].indexOf(comm) !== -1) {
		window.tempaddundoeldata[elem_id] = {};

		var $guide = $el;

		window.tempaddundoeldata[elem_id] = {
			id: $guide.attr('data-guide-id'),
			type: $guide.attr('data-guide-type'),
			top: parseInt($guide.attr('data-field-top-value'), 10),
			left: parseInt($guide.attr('data-field-left-value'), 10),
		};
	}

	function saveToStorage() {
		tn_console('save to ' + action);

		var data = window.tempaddundoeldata[elem_id];
		var ab_id = window.tn.artboard_id;
		var str = localStorage.getItem(action + '_' + ab_id);
		var undo_obj = $.parseJSON(str);
		var obj = {};
		var undo_obj_str;

		if (window.tempaddundoeldata.groups) data.groups = window.tempaddundoeldata.groups;

		delete window.tempaddundoeldata[elem_id];

		if (typeof undo_obj == 'undefined' || undo_obj == null) {
			undo_obj = [];
			undo_obj['ab_id'] = ab_id;
		}

		obj['comm'] = comm;
		obj['res'] = res;
		obj['elem_id'] = elem_id;
		obj['data'] = data;

		undo_obj.push(obj);

		undo_obj_str = JSON.stringify(undo_obj);

		localStorage.setItem(action + '_' + ab_id, undo_obj_str);

		// При любом действии стек redo становится неактуальным
		if (action == 'undo') localStorage.setItem('redo_' + ab_id, '[]');
	}

	if (delay === 0) {
		saveToStorage();
	} else {
		waitForFinalEvent(
			function () {
				saveToStorage();
			},
			delay,
			'tn-null-' + action,
		);
	}

	tn_console_runtime('func: tn_' + action + '__Add. comm:' + comm);
}

/**
 * Повторяющаяся фукнция для вызова обратного действия для undo/redo
 * При вызове с action='undo' - добавляется запись в стек redo, и наоборот
 *
 * @param {'undo' | 'redo'} [action=undo] - Действие, которое нужно выполнить
 * @param {any} commit - Объект из стека undo/redo
 * @param {boolean} isMultiUndo - Флаг индикатор того что мы работаем с множеством элементов
 */
function tn_undo__AddReversedAction(action, commit, isMultiUndo) {
	tn_console('func: tn_undo__AddReversedAction', action, isMultiUndo);

	var $el;

	if (isMultiUndo) {
		var elementsSelector = Object.keys(commit['data'])
			.map(function (key) {
				return '#' + key;
			})
			.join(',');
		$el = $(elementsSelector);
	} else if (commit['comm'] === 'ab_save') {
		$el = undefined;
	} else if (commit['comm'] === 'screens_save') {
		$el = {
			previousScreens: commit['data'].currentScreens,
			currentScreens: commit['data'].previousScreens,
		};
	} else if (['guides_save', 'guides_add', 'guides_delete'].indexOf(commit['comm']) !== -1) {
		$el = $('.tn-guide[data-guide-id="' + commit['data'].id + '"]');
	} else {
		$el = $('#' + commit['elem_id']);
	}

	if (action === 'undo') tn_undo__Add(commit['comm'], $el, 'redo', 0);
	if (action === 'redo') tn_undo__Add(commit['comm'], $el, 'undo', 0);
}

/**
 * Вызывает undo/redo функционал
 *
 * @param {'undo' | 'redo'} [action=undo] - Действите которое нужно выполнить
 */
function tn_undo(action) {
	if (!action) {
		action = 'undo';
	}

	tn_console('func: tn_undo', 'action: ' + action);

	var ab_id = window.tn.artboard_id;
	var undoObj = $.parseJSON(localStorage.getItem(action + '_' + ab_id));
	var obj;
	var res;
	var data;
	var val;
	var item_id;
	var item_data;
	var $el;
	var elval;
	var reinitGroupIds;
	var key;
	var group;
	var elemGroupId;
	var $groups;
	var createdGroups;
	var ab_fields;

	if (typeof undoObj == 'undefined' || undoObj == null || Object.keys(undoObj).length == 0) {
		tn_console('undoObj is null');
		return '';
	}

	// Не выполяем undo если включен редактор бэкграунда шейпов
	if (document.querySelector('.bg-position-editor')) {
		return false;
	}

	obj = undoObj.splice(-1, 1)[0];

	if (typeof obj !== 'undefined') {
		if (obj['comm'] == 'elem_save') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			if (obj.data.isMultiUndo) {
				delete obj.data.isMultiUndo;

				tn_undo__AddReversedAction(action, obj, true);

				data = obj['data'];

				for (key in data) {
					item_id = key;
					item_data = data[key];

					delete item_data['elem_id'];
					delete item_data['elem_type'];

					// востанавливаем эллемент
					undo_do_element(item_id, item_data, res);
				}
			} else {
				tn_undo__AddReversedAction(action, obj, false);

				item_id = obj['elem_id'];
				item_data = obj['data'];

				delete item_data['elem_id'];
				delete item_data['elem_type'];

				// востанавливаем эллемент
				undo_do_element(item_id, item_data, res);
			}
		}

		if (obj['comm'] == 'elem_move') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, false);

			item_id = obj['elem_id'];
			item_data = obj['data'];
			$el = $('#' + item_id);

			elem__setFieldValue($el, 'left', item_data['data-field-left-value'], 'render');
			elem__setFieldValue($el, 'top', item_data['data-field-top-value'], 'render');

			if ($el.hasClass('tn-elem__selected')) {
				panelSettings__updateUi($el, 'left');
				panelSettings__updateUi($el, 'top');
			}
		}

		if (obj['comm'] == 'elem_delete') {
			tn_console(obj);
			if (obj.data.isMultiUndo) {
				delete obj.data.isMultiUndo;
				data = obj['data'];

				if (action === 'undo') {
					for (key in data) {
						item_id = key;
						item_data = data[item_id];
						addElem(item_data);
					}

					tn_undo__AddReversedAction(action, obj, true);
				} else {
					tn_undo__AddReversedAction(action, obj, true);

					for (key in data) {
						elem__Delete($('#' + key));
					}
				}
			} else {
				item_id = obj['elem_id'];
				data = obj['data'];

				if (action === 'undo') {
					addElem(data);

					tn_undo__AddReversedAction(action, obj, false);
				} else {
					tn_undo__AddReversedAction(action, obj, false);

					elem__Delete($('#' + item_id));
				}
			}

			group__checkGroupedElsOutside();
		}

		if (obj['comm'] == 'elem_duplicate') {
			tn_console(obj);

			item_id = obj['elem_id'];
			$el = $('#' + item_id);

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);

				elem__Delete($el);

				tn_hideOutline('selected');
			} else {
				addElem(obj['data']);

				tn_undo__AddReversedAction(action, obj, false);
			}
		}

		if (obj['comm'] == 'elem_add') {
			tn_console(obj);

			item_id = obj['elem_id'];
			$el = $('#' + item_id);

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);

				elem__Delete($el);
			} else {
				addElem(obj['data']);

				tn_undo__AddReversedAction(action, obj, false);
			}

			floor__mousedown();

			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId) group__setPositionByElemsAttrs(groupId, false, true);
		}

		if (obj['comm'] == 'elems_sort') {
			tn_console(obj);

			data = obj['data'];
			val;

			tn_undo__AddReversedAction(action, obj, true);

			for (key in data) {
				$el = $('#' + key);
				elval = $el.attr('data-field-zindex-value');

				if (elval !== data[key]) {
					tn_console(key);

					$el.attr('data-field-zindex-value', data[key]);

					elem__renderViewOneField($el, 'zindex');
					panelSettings__updateUi($el, 'zindex');
				}
			}
		}

		if (obj['comm'] == 'elems_selected_save') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, true);

			data = obj['data'];
			reinitGroupIds = [];

			if (data.groups) {
				for (var id in data.groups) {
					group = data.groups[id];
					undo_do_group(id, group);
				}
			}

			for (key in data) {
				item_id = key;
				item_data = data[key];

				delete item_data['elem_id'];
				delete item_data['elem_type'];

				// востанавливаем эллемент
				undo_do_element(item_id, item_data, res);

				elemGroupId = elem__getFieldValue($('#' + item_id), 'groupid');

				if (elemGroupId && !group__getById(elemGroupId) && reinitGroupIds.indexOf(elemGroupId) === -1)
					reinitGroupIds.push(elemGroupId);
			}

			$groups = $('.tn-group');

			$groups.each(function () {
				var $group = $(this);
				var groupId = $group.attr('id');
				var groupedElemsInsideGroup = $group.find('.tn-elem[data-field-groupid-value=' + groupId + ']');

				if (groupedElemsInsideGroup.length === 0) group__unmake(groupId, true);
			});

			if (reinitGroupIds.length) {
				createdGroups = [];

				reinitGroupIds.forEach(function (id) {
					group__create(id, false, true);
					createdGroups.push(id);
				});
			}
		}

		if (obj['comm'] == 'elems_selected_move') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, true);

			data = obj['data'];

			for (key in data) {
				item_id = key;
				item_data = data[key];
				$el = $('#' + item_id);

				elem__setFieldValue($el, 'left', item_data['data-field-left-value'], 'render', 'updateui');
				elem__setFieldValue($el, 'top', item_data['data-field-top-value'], 'render', 'updateui');
			}

			if ($('.tn-elem__selected').length !== 0) {
				smartAlign__elems__setSpacingFieldValues();
			}
		}

		if (obj['comm'] == 'elems_selected_delete') {
			tn_console(obj);

			data = obj['data'];
			val;

			if (action === 'undo') {
				for (key in data) {
					if (key !== 'groups') {
						item_data = data[key];
						addElem(item_data);
					}
				}

				if (data.groups) {
					for (id in data.groups) {
						group = data.groups[id];
						group__create(group.id, group, true);
					}
				}

				tn_undo__AddReversedAction(action, obj, true);
				group__checkGroupedElsOutside();
			} else {
				tn_undo__AddReversedAction(action, obj, true);

				if (data.groups) {
					for (id in data.groups) {
						group = data.groups[id];
						group__unmake(group.id, true);
					}
				}

				for (key in data) {
					if (key !== 'groups') {
						elem__Delete($('#' + key));
					}
				}
				group__checkGroupedElsOutside();
			}
		}

		if (obj['comm'] == 'elems_selected_add' || obj['comm'] == 'elems_figma_import') {
			tn_console(obj);

			var groupIdList = [];
			data = obj['data'];
			val;

			for (key in data) {
				item_id = key;
				$el = $('#' + item_id);
				var groupId = elem__getFieldValue($el, 'groupid');
				if (groupId) groupIdList.push(groupId);

				elem__Delete($el);
			}

			if (groupIdList.length) {
				groupIdList.forEach(function (id) {
					group__setPositionByElemsAttrs(id, false, true);
				});
			}
			floor__mousedown();
		}

		if (obj['comm'] == 'elem_sbs') {
			tn_console(obj);

			item_id = obj['elem_id'];
			item_data = obj['data'];
			$el = $('#' + item_id);

			elem__setFieldValue($el, 'left', item_data['data-field-left-value'], 'render');
			elem__setFieldValue($el, 'top', item_data['data-field-top-value'], 'render');

			if ($el.hasClass('tn-elem__selected')) {
				panelSettings__updateUi($el, 'left');
				panelSettings__updateUi($el, 'top');
			}
		}

		if (obj['comm'] == 'elem_delete') {
			tn_console(obj);
			if (obj.data.isMultiUndo) {
				delete obj.data.isMultiUndo;
				data = obj['data'];

				if (action === 'undo') {
					for (key in data) {
						item_id = key;
						item_data = data[item_id];
						addElem(item_data);
					}

					tn_undo__AddReversedAction(action, obj, true);
				} else {
					tn_undo__AddReversedAction(action, obj, true);

					for (key in data) {
						elem__Delete($('#' + key));
					}
				}
			} else {
				item_id = obj['elem_id'];
				data = obj['data'];

				if (action === 'undo') {
					addElem(data);

					tn_undo__AddReversedAction(action, obj, false);
				} else {
					tn_undo__AddReversedAction(action, obj, false);

					elem__Delete($('#' + item_id));
				}
			}

			group__checkGroupedElsOutside();
		}

		if (obj['comm'] == 'elem_duplicate') {
			tn_console(obj);

			item_id = obj['elem_id'];
			$el = $('#' + item_id);

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);

				elem__Delete($el);

				tn_hideOutline('selected');
			} else {
				addElem(obj['data']);

				tn_undo__AddReversedAction(action, obj, false);
			}
		}

		if (obj['comm'] == 'elem_add') {
			tn_console(obj);

			item_id = obj['elem_id'];
			$el = $('#' + item_id);

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);

				elem__Delete($el);
			} else {
				addElem(obj['data']);

				tn_undo__AddReversedAction(action, obj, false);
			}

			floor__mousedown();

			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId) group__setPositionByElemsAttrs(groupId, false, true);
		}

		if (obj['comm'] == 'elems_sort') {
			tn_console(obj);

			data = obj['data'];
			val;

			tn_undo__AddReversedAction(action, obj, true);

			for (key in data) {
				$el = $('#' + key);
				elval = $el.attr('data-field-zindex-value');

				if (elval !== data[key]) {
					tn_console(key);

					$el.attr('data-field-zindex-value', data[key]);

					elem__renderViewOneField($el, 'zindex');
					panelSettings__updateUi($el, 'zindex');
				}
			}
		}

		if (obj['comm'] == 'elems_selected_save') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, true);

			data = obj['data'];
			reinitGroupIds = [];

			if (data.groups) {
				for (var id in data.groups) {
					group = data.groups[id];
					undo_do_group(id, group);
				}
			}

			for (key in data) {
				item_id = key;
				item_data = data[key];

				delete item_data['elem_id'];
				delete item_data['elem_type'];

				// востанавливаем эллемент
				undo_do_element(item_id, item_data, res);

				elemGroupId = elem__getFieldValue($('#' + item_id), 'groupid');

				if (elemGroupId && !group__getById(elemGroupId) && reinitGroupIds.indexOf(elemGroupId) === -1)
					reinitGroupIds.push(elemGroupId);
			}

			$groups = $('.tn-group');

			$groups.each(function () {
				var $group = $(this);
				var groupId = $group.attr('id');
				var groupedElemsInsideGroup = $group.find('.tn-elem[data-field-groupid-value=' + groupId + ']');

				if (groupedElemsInsideGroup.length === 0) group__unmake(groupId, true);
			});

			if (reinitGroupIds.length) {
				createdGroups = [];

				reinitGroupIds.forEach(function (id) {
					group__create(id, false, true);
					createdGroups.push(id);
				});
			}
		}

		if (obj['comm'] == 'elems_selected_move') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, true);

			data = obj['data'];

			for (key in data) {
				item_id = key;
				item_data = data[key];
				$el = $('#' + item_id);

				elem__setFieldValue($el, 'left', item_data['data-field-left-value'], 'render', 'updateui');
				elem__setFieldValue($el, 'top', item_data['data-field-top-value'], 'render', 'updateui');
			}

			if ($('.tn-elem__selected').length !== 0) {
				smartAlign__elems__setSpacingFieldValues();
			}
		}

		if (obj['comm'] == 'elems_selected_delete') {
			tn_console(obj);

			data = obj['data'];
			val;

			if (action === 'undo') {
				for (key in data) {
					if (key !== 'groups') {
						item_data = data[key];
						addElem(item_data);
					}
				}

				if (data.groups) {
					for (id in data.groups) {
						group = data.groups[id];
						group__create(group.id, group, true);
					}
				}

				tn_undo__AddReversedAction(action, obj, true);
				group__checkGroupedElsOutside();
			} else {
				tn_undo__AddReversedAction(action, obj, true);

				if (data.groups) {
					for (id in data.groups) {
						group = data.groups[id];
						group__unmake(group.id, true);
					}
				}

				for (key in data) {
					if (key !== 'groups') {
						elem__Delete($('#' + key));
					}
				}
				group__checkGroupedElsOutside();
			}
		}

		if (obj['comm'] == 'elems_selected_add' || obj['comm'] == 'elems_figma_import') {
			tn_console(obj);

			var groupIdList = [];
			data = obj['data'];
			val;

			for (key in data) {
				item_id = key;
				$el = $('#' + item_id);
				var groupId = elem__getFieldValue($el, 'groupid');
				if (groupId) groupIdList.push(groupId);

				elem__Delete($el);
			}

			if (groupIdList.length) {
				groupIdList.forEach(function (id) {
					group__setPositionByElemsAttrs(id, false, true);
				});
			}
			floor__mousedown();
		}

		if (obj['comm'] == 'elem_sbs') {
			tn_console(obj);

			if ($el.hasClass('tn-elem__selected')) {
				panelSettings__updateUi($el, 'left');
				panelSettings__updateUi($el, 'top');
			}
		}

		if (obj['comm'] == 'elem_delete') {
			tn_console(obj);
			if (obj.data.isMultiUndo) {
				delete obj.data.isMultiUndo;
				data = obj['data'];

				if (action === 'undo') {
					for (key in data) {
						item_id = key;
						item_data = data[item_id];
						addElem(item_data);
					}

					tn_undo__AddReversedAction(action, obj, true);
				} else {
					tn_undo__AddReversedAction(action, obj, true);

					for (key in data) {
						elem__Delete($('#' + key));
					}
				}
			} else {
				item_id = obj['elem_id'];
				data = obj['data'];

				if (action === 'undo') {
					addElem(data);

					tn_undo__AddReversedAction(action, obj, false);
				} else {
					tn_undo__AddReversedAction(action, obj, false);

					elem__Delete($('#' + item_id));
				}
			}

			group__checkGroupedElsOutside();
		}

		if (obj['comm'] == 'elem_duplicate') {
			tn_console(obj);

			item_id = obj['elem_id'];
			$el = $('#' + item_id);

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);

				elem__Delete($el);

				tn_hideOutline('selected');
			} else {
				addElem(obj['data']);

				tn_undo__AddReversedAction(action, obj, false);
			}
		}

		if (obj['comm'] == 'elem_add') {
			tn_console(obj);

			item_id = obj['elem_id'];
			$el = $('#' + item_id);

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);

				elem__Delete($el);
			} else {
				addElem(obj['data']);

				tn_undo__AddReversedAction(action, obj, false);
			}

			floor__mousedown();

			var groupId = elem__getFieldValue($el, 'groupid');
			if (groupId) group__setPositionByElemsAttrs(groupId, false, true);
		}

		if (obj['comm'] == 'elems_sort') {
			tn_console(obj);

			data = obj['data'];
			val;

			tn_undo__AddReversedAction(action, obj, true);

			for (key in data) {
				$el = $('#' + key);
				elval = $el.attr('data-field-zindex-value');

				if (elval !== data[key]) {
					tn_console(key);

					$el.attr('data-field-zindex-value', data[key]);

					elem__renderViewOneField($el, 'zindex');
					panelSettings__updateUi($el, 'zindex');
				}
			}
		}

		if (obj['comm'] == 'elems_selected_save') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, true);

			data = obj['data'];
			reinitGroupIds = [];

			if (data.groups) {
				for (var id in data.groups) {
					group = data.groups[id];
					undo_do_group(id, group);
				}
			}

			for (key in data) {
				item_id = key;
				item_data = data[key];

				delete item_data['elem_id'];
				delete item_data['elem_type'];

				// востанавливаем эллемент
				undo_do_element(item_id, item_data, res);

				elemGroupId = elem__getFieldValue($('#' + item_id), 'groupid');

				if (elemGroupId && !group__getById(elemGroupId) && reinitGroupIds.indexOf(elemGroupId) === -1)
					reinitGroupIds.push(elemGroupId);
			}

			$groups = $('.tn-group');

			$groups.each(function () {
				var $group = $(this);
				var groupId = $group.attr('id');
				var groupedElemsInsideGroup = $group.find('.tn-elem[data-field-groupid-value=' + groupId + ']');

				if (groupedElemsInsideGroup.length === 0) group__unmake(groupId, true);
			});

			if (reinitGroupIds.length) {
				createdGroups = [];

				reinitGroupIds.forEach(function (id) {
					group__create(id, false, true);
					createdGroups.push(id);
				});
			}
		}

		if (obj['comm'] == 'elems_selected_move') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, true);

			data = obj['data'];

			for (key in data) {
				item_id = key;
				item_data = data[key];
				$el = $('#' + item_id);

				elem__setFieldValue($el, 'left', item_data['data-field-left-value'], 'render', 'updateui');
				elem__setFieldValue($el, 'top', item_data['data-field-top-value'], 'render', 'updateui');
			}

			if ($('.tn-elem__selected').length !== 0) {
				smartAlign__elems__setSpacingFieldValues();
			}
		}

		if (obj['comm'] == 'elems_selected_delete') {
			tn_console(obj);

			data = obj['data'];
			val;

			if (action === 'undo') {
				for (key in data) {
					if (key !== 'groups') {
						item_data = data[key];
						addElem(item_data);
					}
				}

				if (data.groups) {
					for (id in data.groups) {
						group = data.groups[id];
						group__create(group.id, group, true);
					}
				}

				tn_undo__AddReversedAction(action, obj, true);
				group__checkGroupedElsOutside();
			} else {
				tn_undo__AddReversedAction(action, obj, true);

				if (data.groups) {
					for (id in data.groups) {
						group = data.groups[id];
						group__unmake(group.id, true);
					}
				}

				for (key in data) {
					if (key !== 'groups') {
						elem__Delete($('#' + key));
					}
				}
				group__checkGroupedElsOutside();
			}
		}

		if (obj['comm'] == 'elems_selected_add' || obj['comm'] == 'elems_figma_import') {
			tn_console(obj);

			var groupIdList = [];
			data = obj['data'];
			val;

			for (key in data) {
				item_id = key;
				$el = $('#' + item_id);
				var groupId = elem__getFieldValue($el, 'groupid');
				if (groupId) groupIdList.push(groupId);

				elem__Delete($el);
			}

			if (groupIdList.length) {
				groupIdList.forEach(function (id) {
					group__setPositionByElemsAttrs(id, false, true);
				});
			}
			floor__mousedown();
		}

		if (obj['comm'] == 'elem_sbs') {
			tn_console(obj);

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			tn_undo__AddReversedAction(action, obj, false);

			item_id = obj['elem_id'];
			item_data = obj['data'];
			$el = $('#' + item_id);

			elem__setFieldValue($el, 'sbsopts', item_data['data-field-sbsopts-value'], 'render');

			if (
				window.tn_flag_sbs_panelopen == 'y' &&
				$el.hasClass('tn-elem__selected') &&
				$('.tn-elem__selected').length == 1
			) {
				panelSBS__updateUi($el, 'sbsopts', item_data['data-sbs-step-i']);
			}
		}

		if (obj['comm'] == 'ab_save') {
			tn_console(obj);

			data = obj['data'];

			delete data['data-artboard-page-id'];
			delete data['data-artboard-record-id'];

			res = obj['res'];

			if (res != window.tn.curResolution) {
				switchResolution(res);
				ab__renderGrid();
				updateTNobj();
				ab__renderView();
				allelems__renderView();
			}

			undo_do_artboard(data, res, function beforeArtboardUpdate() {
				tn_undo__AddReversedAction(action, obj, false);
			});

			ab__renderView();
			allelems__renderView();
		}

		if (obj['comm'] == 'screens_save') {
			tn_console(obj);

			data = obj['data'];
			res = obj['res'];

			tn_undo__AddReversedAction(action, obj, false);

			setTNobj_screens(data.previousScreens);
			tn_drawResMenu();
			goResolutionMode(window.tn.topResolution);

			data.elems.forEach(function (fields) {
				var id = fields.elem_id;
				var $el = $('#' + id);

				delete fields['elem_id'];
				delete fields['elem_type'];

				Object.keys(fields).forEach(function (field) {
					var value = fields[field];

					if (field === 'inputs') return;

					elem__setFieldValue($el, field, value, '', '', window.tn.topResolution);

					window.tn.screens.forEach(function (screen) {
						if (screen === window.tn.topResolution) return;

						var value = data[field + '-res-' + screen];
						if (typeof value !== 'undefined') {
							elem__setFieldValue($el, field, value, '', '', screen);
						}
					});
				});
			});

			undo_do_artboard(data.ab, res);

			ab__renderView();
			allelems__renderView();
		}

		if (obj['comm'] === 'guides_save') {
			tn_console(obj);

			data = obj['data'];
			res = obj['res'];

			tn_undo__AddReversedAction(action, obj, false);

			var $guide = $('.tn-guide[data-guide-id="' + data.id + '"]');

			if (data.type === 'h') {
				$guide.css('top', data.top + window.tn.canvas_min_offset_top + 'px');
				guide__save__currentPosition($guide);
			}

			if (data.type === 'v') {
				$guide.css('left', data.left + window.tn.canvas_min_offset_left + 'px');
				guide__save__currentPosition($guide);
			}
		}

		if (obj['comm'] === 'guides_add') {
			tn_console(obj);

			data = obj['data'];
			res = obj['res'];

			var $guide = $('#' + data.id);
			var guidePosition = data.type === 'h' ? data.top : data.left;

			if (action === 'undo') {
				tn_undo__AddReversedAction(action, obj, false);
				$guide.remove();
			} else {
				guide__add(guidePosition, data.type, data.id);
				tn_undo__AddReversedAction(action, obj, false);
			}
		}

		if (obj['comm'] === 'guides_delete') {
			tn_console(obj);

			data = obj['data'];
			res = obj['res'];

			var $guide = $('#' + data.id);
			var guidePosition = data.type === 'h' ? data.top : data.left;

			if (action === 'undo') {
				guide__add(guidePosition, data.type, data.id);
				tn_undo__AddReversedAction(action, obj, false);
			} else {
				tn_undo__AddReversedAction(action, obj, false);
				$guide.remove();
			}
		}

		tn_set_lastChanges();
	}

	localStorage.setItem(action + '_' + ab_id, JSON.stringify(undoObj));

	layers__update();

	if (window.tn.multi_edit) {
		panelSettings__openTimeout(window.tn.multi_edit_elems, true);
	}

	group__unlockWithoutLockedElems();
	group__showkWithoutHiddenElems();

	tn_hideOutline('hover');
	tn_toggleMoreRedoVisibility();

	tn_console_runtime('func: tn_undo');
}

function undo_do_group(groupId, data) {
	tn_console('func: undo_do_element', groupId, data);

	var groupFields = 'lock,hidden';
	var group = $('.tn-group#' + groupId);

	if (!group.length) return;

	groupFields.split(',').forEach(function (prop) {
		var val = typeof data[prop] === 'undefined' ? null : data[prop];

		if (prop === 'hidden') {
			if (val != group__getFieldValue(group, 'hidden')) group__hide(groupId, false, true);
		}

		if (prop === 'lock') {
			if (val != group__getFieldValue(group, 'lock')) group__lock(groupId, false, true);
		}
	});
}

// TODO: refactor, undo only cchanged fields
/**
 * по входящим данным востанавливает эллемент
 * это вынесенная повторяющаяся функция в undo (save and save_selected)
 */
function undo_do_element(item_id, data, res) {
	tn_console('func: undo_do_element', item_id, data, res);

	var $el = $('#' + item_id);
	var fields;
	var el_v;
	var old_v;
	var arr_key;
	var attr_key;
	var eltype;

	if (!$el.hasClass('tn-elem')) return;

	// DO FIELDS
	fields = $el.attr('data-fields').split(',');

	fields.forEach(function (prop) {
		old_v = data['data-field-' + prop + '-value'];

		if (res == window.tn.topResolution) {
			arr_key = prop;
			attr_key = 'data-field-' + prop + '-value';
		} else {
			arr_key = prop + '-res-' + res;
			attr_key = 'data-field-' + prop + '-res-' + res + '-value';
		}

		old_v = data[arr_key];

		if (tn_isGradientStyle(old_v)) {
			old_v = tn_parseJSONfromGradient(old_v);
			old_v = tn_replaceDoubleQuotes(old_v);
		}

		el_v = $el.attr(attr_key);

		if (old_v != el_v) {
			tn_console('res: ' + res + ' return: field: ' + prop + ' val: ' + old_v);
			tn_console(arr_key);

			if (typeof old_v != 'undefined') {
				$el.attr(attr_key, old_v);
			} else {
				$el.removeAttr(attr_key);
			}

			elem__renderViewOneField($el, prop);

			if ($el.hasClass('tn-elem__selected')) panelSettings__updateUi($el, prop);

			if (
				prop == 'sbsevent' &&
				window.tn_flag_sbs_panelopen == 'y' &&
				$el.hasClass('tn-elem__selected') &&
				$('.tn-elem__selected').length == 1
			) {
				panelSBS__close($el);
				panelSBS__open($el.attr('data-elem-id'));
			}
		}

		var isAnimationChanged = false;
		if (prop.indexOf('anim') === 0) {
			panelSettings__updateUi($el, prop);
			isAnimationChanged = true;
		}

		if (isAnimationChanged) {
			control__drawUi__selectbox($el.attr('id'), 'animstyle');
			control__drawUi__selectbox($el.attr('id'), 'animprx');
			control__drawUi__selectbox($el.attr('id'), 'animfix');
		}
	});

	// DO CONTENT
	if (typeof data['text'] != 'undefined') {
		if (data['text'] != $el.find('.tn-atom').html()) {
			$el.find('.tn-atom').html(Quill.addNbspMarkers(data['text']));
			elem__renderViewOneField($el, 'text');
		}
	}

	eltype = $el.attr('data-elem-type');

	if (eltype == 'form') {
		elem__renderForm($el);
	}
}

function tn_unset_allundo() {
	tn_console('func: tn_unset_allundo');

	var keys = Object.keys(localStorage);
	var i = keys.length;
	var k;

	while (i--) {
		k = keys[i];

		if (k.substring(0, 5) == 'undo_') {
			localStorage.removeItem(k);
		}
	}
}

/**
 *
 * @param {object} data
 * @param {object} res
 * @param {Function} beforeUpdate
 */
function undo_do_artboard(data, res, beforeUpdate) {
	var $ab = $('.tn-artboard');

	if (typeof beforeUpdate === 'function') beforeUpdate();

	var ab_fields = window.tn.ab_fields;

	ab_fields.forEach(function (field) {
		var value = data['ab_' + field];
		var v;

		if (tn_isGradientStyle(value)) {
			value = tn_parseJSONfromGradient(value);
			value = tn_replaceDoubleQuotes(value);
		}

		ab__setFieldValue($ab, field, value);

		// Устанавливаем значения для остальных разрешений
		// Поле valign является глобальным и не устанавливается для разрешений
		if (field !== 'valign') {
			window.tn.screens.forEach(function (s, i) {
				if (s == window.tn.topResolution) return;

				v = data['ab_' + field + '-res-' + s];
				ab__setFieldValue($ab, field, v, s);
			});
		}

		//todo - нет ли тут ошибки что UI обновляется значением value которое для десктопа, а не тем что на текущем разрешении
		ab__panelSettings__updateUi($ab, field);
	});
}
