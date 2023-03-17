function panelLayers__open() {
	tn_console('func: panelLayers__open');
	window.tn_layers_panel = 'open';

	if (JSON.parse(sessionStorage.getItem('tzerolayerspanel') === null)) {
		var layersPanelState = {'turn': 'on', 'type': 'layers'};
		sessionStorage.setItem('tzerolayerspanel', JSON.stringify(layersPanelState));
	}

	elem__checkZIndexes__Dubble();

	var $tnLeftBox = $('.tn-left-box');
	$tnLeftBox.addClass('tn-left-box_show');
	$tnLeftBox.html(
		'<div class="tn-left-box__header">' +
			'<span class="tn-left-box__caption tn-left-box__caption-layers tn-left-box__caption_active">Layers</span>' +
			'<span class="tn-left-box__caption tn-left-box__caption-blocks">Blocks</span>' +
			'<img src="img/modalClosebutton.png" class="tn-left-box__icon" width="15px">' +
			'</div>',
	);
	$('.tn-left-box__icon').on('click', function () {
		panelLayers__close();
	});

	$tnLeftBox.click(function () {
		floor__mousedown();
	});

	$tnLeftBox.append('<div class="tn-layers"></div>');
	var $panel = $('.tn-layers');
	var str = '';
	str += '<div class="sui-panel__section sui-layers-box" style="padding:0;"></div>';
	str += '<div class="sui-panel__section sui-blocks-box" style="padding:0;"></div>';
	$panel.append(str);

	layers__layersbox__draw($('.tn-layers .sui-layers-box'));
	layers__blocksbox__draw($('.tn-layers .sui-blocks-box'));
	layers__blockstoggle__draw($tnLeftBox);
	$('.tn-more-layers').html('Hide Layers');

	$('.tn-left-box__caption').on('click', function () {
		$('.tn-left-box__caption').removeClass('tn-left-box__caption_active');
		$('.sui-layers-box').css('display', 'block');
		$('.sui-blocks-box').css('display', 'none');
		$('.sui-block__toggle-wrapper').css('display', 'none');
		$(this).addClass('tn-left-box__caption_active');
		layersPanelState = {'turn': 'on', 'type': 'layers'};
		sessionStorage.setItem('tzerolayerspanel', JSON.stringify(layersPanelState));
	});

	$('.tn-left-box__caption-blocks').on('click', function () {
		layers__blocksbox__open();
	});

	var state = JSON.parse(sessionStorage.getItem('tzerolayerspanel'));
	if (state !== null && state.type === 'blocks') {
		layers__blocksbox__open($('.tn-left-box__caption-blocks'));
	}

	layers__blocksbox__addEvents();
}

function layers__blocksbox__open() {
	$('.tn-left-box__caption').removeClass('tn-left-box__caption_active');
	$('.sui-layers-box').css('display', 'none');
	$('.sui-blocks-box').css('display', 'block');
	$('.sui-block__toggle-wrapper').css('display', 'block');
	$('.tn-left-box__caption-blocks').addClass('tn-left-box__caption_active');
	sessionStorage.setItem('tzerolayerspanel', JSON.stringify({'turn': 'on', 'type': 'blocks'}));
	setTimeout(function () {
		layers__blocksbox__addSortable();
	}, 500);
}

function panelLayers__close() {
	tn_console('func: panelLayers__close');
	delete window.tn_layers_panel;
	var layersPanelState = {'turn': 'off', 'type': 'layers'};
	sessionStorage.setItem('tzerolayerspanel', JSON.stringify(layersPanelState));
	var $tnLeftBox = $('.tn-left-box');
	$tnLeftBox.html('');
	$tnLeftBox.removeClass('tn-left-box_show');
	$('.tn-more-layers').html('Show Layers');
}

function layers__layersbox__draw(c) {
	var str = '';
	var obj = [];
	var zindex = 0;
	var $elem;

	$('.tn-elem:not(.tn-elem__fake)').each(function () {
		$elem = $(this);
		var groupId = elem__getFieldValue($elem, 'groupid');
		var layerObj = {};

		if (groupId) {
			zindex = group__getHighestZIndexInGroup(groupId);
		} else {
			zindex = $elem.attr('data-field-zindex-value') ? $elem.attr('data-field-zindex-value') * 1 : 0;
		}

		if (typeof obj[zindex] != 'undefined' && !groupId) console.log('error, duble zindex:' + zindex);

		layerObj.id = $elem.attr('data-elem-id');
		layerObj.type = $elem.attr('data-elem-type');
		layerObj.lock = $elem.attr('data-field-lock-value');
		layerObj.invisible = $elem.attr('data-field-invisible-value');
		layerObj.text = $elem.attr('data-elem-type');
		if (groupId) layerObj.groupId = groupId;

		var layerValue = $elem.attr('data-field-layer-value');

		if (typeof layerValue != 'undefined' && layerValue != '') {
			layerObj.text = layerValue;
		} else {
			if (layerObj.type === 'text') {
				layerObj.text = $elem.find('.tn-atom').text();
			} else if (layerObj.type === 'image') {
				var text = $elem.find('.tn-atom__img').attr('src');

				text = text.split('/').pop();

				if (text !== 'imgfishsquare.gif') {
					if (text.length > 18) {
						text = '..' + text.slice(-18);
					}
				}
				layerObj.text = text;
			} else if (layerObj.type === 'button') {
				layerObj.text = $elem.attr('data-field-caption-value');
			}
		}
		if (layerObj.text.length > 20) {
			layerObj.text = layerObj.text.substring(0, 17) + '...';
		}

		if (layerObj.type === 'text') layerObj.ico = 'text';
		if (layerObj.type === 'image') layerObj.ico = 'image';
		if (layerObj.type === 'shape') layerObj.ico = 'rectangle';
		if (layerObj.type === 'button') layerObj.ico = 'button';
		if (layerObj.type === 'video') layerObj.ico = 'video';
		if (layerObj.type === 'html') layerObj.ico = 'html';
		if (layerObj.type === 'tooltip') layerObj.ico = 'tooltip';
		if (layerObj.type === 'form') layerObj.ico = 'form';
		if (layerObj.type === 'gallery') layerObj.ico = 'gallery';
		if (layerObj.type === 'vector') layerObj.ico = 'vector';

		if (groupId) {
			var elemZIndex = $('.tn-elem#' + layerObj.id).attr('data-field-zindex-value');
			if (!obj[zindex])
				obj[zindex] = {
					groupId: groupId,
				};
			obj[zindex][elemZIndex] = layerObj;
		} else {
			obj[zindex] = layerObj;
		}
	});

	obj = obj.reverse();
	str += '<div class="sui-layers">';

	var openGroupLayers = window.localStorage.getItem('tn-open-group-layers');

	obj.forEach(function (elem) {
		if (!elem) return;
		if (!elem.groupId) {
			str +=
				'<div class="sui-layers__item' +
				(elem.invisible == 'y' ? ' sui-layers__item_invisible' : '') +
				'" data-layer-elem-id="' +
				elem.id +
				'">' +
				'<div class="sui-layer__icon sui-layer__icon_' +
				elem.ico +
				'"></div>' +
				'<div class="sui-layer__text">' +
				tn_escapeHtml(elem.text) +
				'</div>' +
				'<div class="sui-layer__lock' +
				(elem.lock == 'y' ? ' sui-layer__lock_yes' : '') +
				'"><div class="sui-layer__lock__icon"></div></div>' +
				'<div class="sui-layer__invisible' +
				(elem.invisible == 'y' ? ' sui-layer__invisible_yes' : '') +
				'"><div class="sui-layer__invisible__icon"></div></div>' +
				'</div>';
		} else {
			var groupId = elem.groupId;
			var group = $('.tn-group#' + groupId);
			var name = group__getFieldValue(group, 'name');
			var lock = group__getFieldValue(group, 'lock');
			var hidden = group__getFieldValue(group, 'hidden');
			var isOpen = openGroupLayers && openGroupLayers.indexOf(groupId) > -1;

			str +=
				'<div class="sui-layers__group' +
				(hidden == 'y' ? ' sui-layers__group_invisible' : '') +
				'' +
				(isOpen ? ' sui-layers__group_shown' : '') +
				'" data-layer-group-id="' +
				groupId +
				'">' +
				'<div class="sui-layers__group__title">' +
				'<div class="sui-layer__toggle"></div>' +
				'<div class="sui-layers__group__name">' +
				(name || 'Group') +
				'</div>' +
				'<div class="sui-layer__lock' +
				(lock == 'y' ? ' sui-layer__lock_yes' : '') +
				'"><div class="sui-layer__lock__icon"></div></div>' +
				'<div class="sui-layer__invisible' +
				(hidden == 'y' ? ' sui-layer__invisible_yes' : '') +
				'"><div class="sui-layer__invisible__icon"></div></div>' +
				'</div>' +
				'<div class="sui-layers__group__container">';

			Object.keys(elem)
				.reverse()
				.forEach(function (zindex) {
					if (zindex === 'groupId') return;
					var el = elem[zindex];

					str +=
						'<div class="sui-layers__item sui-layers__item_group' +
						(!hidden && el.invisible == 'y' ? ' sui-layers__item_invisible' : '') +
						'" data-layer-elem-id="' +
						el.id +
						'">' +
						'<div class="sui-layer__icon sui-layer__icon_' +
						el.ico +
						'"></div>' +
						'<div class="sui-layer__text">' +
						el.text +
						'</div>' +
						'<div class="sui-layer__lock' +
						(el.lock == 'y' ? ' sui-layer__lock_yes' : '') +
						(lock ? ' sui-layer__lock_hidden' : '') +
						'"><div class="sui-layer__lock__icon"></div></div>' +
						'<div class="sui-layer__invisible' +
						(el.invisible == 'y' ? ' sui-layer__invisible_yes' : '') +
						(hidden ? ' sui-layer__invisible_hidden' : '') +
						'"><div class="sui-layer__invisible__icon"></div></div>' +
						'</div>';
				});

			str += '</div></div>';
		}
	});
	str += '</div>';

	c.html(str);

	c.find('.sui-layer__toggle').click(function (event) {
		event.stopPropagation();
		$(this).parents('.sui-layers__group').toggleClass('sui-layers__group_shown');
		var openLayers = [];

		c.find('.sui-layers__group').each(function () {
			var $groupLayer = $(this);
			if ($groupLayer.hasClass('sui-layers__group_shown')) {
				openLayers.push($groupLayer.attr('data-layer-group-id'));
			}
		});

		window.localStorage.setItem('tn-open-group-layers', openLayers);
	});

	c.find('.sui-layers__item').click(function (event) {
		var elem_id = $(this).attr('data-layer-elem-id');
		elem__Click($('#' + elem_id), event, 'noedit', true);
		layers__hightlight();
		event.stopPropagation();
	});

	c.find('.sui-layers__group__title').click(function (event) {
		var groupId = $(this).parents('.sui-layers__group').attr('data-layer-group-id');
		elem__Click($('.tn-group#' + groupId), event);
		layers__hightlight();
		event.stopPropagation();
	});

	c.find('.sui-layer__lock').click(function (event) {
		var $this = $(this);
		var elem_id = $this.parent().attr('data-layer-elem-id');
		var group_id = $this.parents('.sui-layers__group').attr('data-layer-group-id');

		if (elem_id) {
			var $el = $('#' + elem_id);
			elem__Click($el, event, 'noedit', true);
			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
			elem__Lock();
		} else if (group_id) {
			group__select(group_id);
			group__lock(group_id);
		}
		tn_set_lastChanges();
		event.stopPropagation();
	});

	c.find('.sui-layer__invisible').click(function (event) {
		var $this = $(this);
		var elem_id = $this.parent().attr('data-layer-elem-id');
		var elemGroupId = elem__getFieldValue($('#' + elem_id), 'groupid');
		var group_id = $this.parents('.sui-layers__group').attr('data-layer-group-id');

		if (elemGroupId) {
			var group = group__getById(elemGroupId);
			var hidden = group__getFieldValue(group, 'hidden');
			if (hidden) return;
		}

		if (elem_id) {
			var el = $('#' + elem_id);
			elem__Click(el, event, 'noedit', true);
			tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : el);
			elem__Invisible(el);
		} else if (group_id) {
			group__select(group_id);
			group__hide(group_id);
		}
		tn_set_lastChanges();
		event.stopPropagation();
	});

	c.find('.sui-layer__text').dblclick(function () {
		var $this = $(this);
		var elem_id = $this.parent().attr('data-layer-elem-id');
		var value = $this.text();
		layers__changeName($this, 'layer', value, '', '', elem_id);
		window.tn_flag_settings_ui_focus = true;
	});

	c.find('.sui-layer__text').click(function (e) {
		if ($(e.target).hasClass('sui-layer-text-inp')) {
			window.tn_flag_settings_ui_focus = true;
		}
	});

	c.find('.sui-layers__group__name').dblclick(function () {
		var $this = $(this);
		var groupId = $this.parents('.sui-layers__group').attr('data-layer-group-id');
		var value = $this.text();

		var saveName = function () {
			window.tn_flag_settings_ui_focus = false;
			var updatedValue = $inp.val();
			updatedValue = tn_stripTags(updatedValue);
			updatedValue = updatedValue.replaceAll('"', '');
			if (updatedValue.length > 30) updatedValue = updatedValue.substring(0, 30);
			if (updatedValue.length === 0) updatedValue = value;
			$inp.parent().text(updatedValue);
			group__setFieldValue(groupId, 'name', updatedValue);
		};

		$this.html('<input type="text" value="20" autocomplete="off" class="sui-layer-text-inp">');
		window.tn_flag_settings_ui_focus = true;
		var $inp = $this.find('.sui-layer-text-inp');
		$inp.val(value).focus();
		$inp.select();
		$inp.on('keyup', function (event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				saveName();
			}
		});
		$inp.focusout(saveName);
	});

	layers__hightlight();

	layers__addSortable();
}

function layers__blockstoggle__draw(c) {
	var toggleState = localStorage.getItem('tzerotoggleblocksstate');
	var toggleOnSrc = 'https://front.tildacdn.com/store/img/t-icon-switcher-on.png';
	var toggleOffSrc = 'https://front.tildacdn.com/store/img/t-icon-switcher-off.png';
	var toggleSrc = toggleOnSrc;
	var toggleClass = ' sui-block__toggle_on';
	if (toggleState !== null && toggleState === 'off') {
		toggleClass = ' sui-block__toggle_off';
		toggleSrc = toggleOffSrc;
	}
	var str =
		'<div class="sui-block__toggle-wrapper">' +
		'<div class="sui-block__toggle' +
		toggleClass +
		'">' +
		'<img src="' +
		toggleSrc +
		'" width="30px">' +
		'</div>' +
		'<div class="sui-block__toggle-descr">Show only Zero Blocks</div>' +
		'</div>';
	c.append(str);

	$('.sui-block__toggle-wrapper').on('click', function () {
		var $this = $(this);
		var $ordinaryBlocks = $('.sui-blocks__item_ordinary');
		if ($this.hasClass('sui-block__toggle_on')) {
			$this.removeClass('sui-block__toggle_on');
			$this.addClass('sui-block__toggle_off');
			$this.find('img').attr('src', toggleOffSrc);
			$ordinaryBlocks.removeClass('sui-blocks__item_ordinary-hide');
			localStorage.setItem('tzerotoggleblocksstate', 'off');
		} else {
			$this.removeClass('sui-block__toggle_off');
			$this.addClass('sui-block__toggle_on');
			$this.find('img').attr('src', toggleOnSrc);
			$ordinaryBlocks.addClass('sui-blocks__item_ordinary-hide');
			localStorage.setItem('tzerotoggleblocksstate', 'on');
		}
	});
}

function layers__hightlight() {
	if (typeof window.tn_layers_panel == 'undefined' || window.tn_layers_panel != 'open') return;

	var $layersBox = $('.tn-layers .sui-layers-box');
	if ($layersBox.length === 0) return;
	$layersBox.find('.sui-layers__item').removeClass('sui-layers__item_active');
	$layersBox.find('.sui-layers__group__title').removeClass('sui-layers__group__title_active');

	$('.tn-group__selected, .tn-elem__selected').each(function () {
		var $elem = $(this);
		if ($elem.hasClass('tn-group')) {
			var groupId = $elem.attr('id');
			$layersBox
				.find('.sui-layers__group[data-layer-group-id=' + groupId + '] .sui-layers__group__title')
				.addClass('sui-layers__group__title_active');
		} else {
			var elem_id = $elem.attr('data-elem-id');
			$layersBox.find('.sui-layers__item[data-layer-elem-id=' + elem_id + ']').addClass('sui-layers__item_active');
		}
	});
}

function layers__update() {
	if (typeof window.tn_layers_panel == 'undefined' || window.tn_layers_panel != 'open') return;
	layers__layersbox__draw($('.tn-layers .sui-layers-box'));
}

function panelLayers__showhide() {
	if (typeof window.tn_layers_panel == 'undefined' || window.tn_layers_panel != 'open') {
		panelLayers__open();
	} else {
		panelLayers__close();
	}
}

function layers__addSortable() {
	var commonConfig = {
		opacity: 0.6,
		tolerance: 'pointer',
		axis: 'y',
		containment: '.tn-layers',
		distance: 6,
		/* Скорость анимации "установки" элемента в список */
		revert: 150,
		update: function () {
			layers__reSort();
		},
	};

	$('.sui-layers-box .sui-layers').sortable(
		Object.assign({}, commonConfig, {
			connectWith: '.sui-layers__group_shown .sui-layers__group__container',
		}),
	);

	$('.sui-layers-box .sui-layers__group__container').sortable(
		Object.assign({}, commonConfig, {
			connectWith: '.sui-layers',
		}),
	);
}

function layers__reSort() {
	var counter = 0;
	var $elems = $('.sui-layers__item');
	var elemsLength = $elems.length;

	tn_undo__Add('elems_sort');

	$elems.each(function () {
		var $layer = $(this);
		var $layersGroup = $layer.closest('.sui-layers__group');
		var elem_id = $layer.attr('data-layer-elem-id');
		var zindex = elemsLength - counter;
		var $el = $('#' + elem_id);
		var elval = $el.attr('data-field-zindex-value');
		var groupId;

		if ($layer.hasClass('sui-layers__item_group') && $layersGroup.length === 0) {
			groupId = elem__getFieldValue($el, 'groupid');
			group__deleteElemFromGroup($el, groupId);
		} else if (!$layer.hasClass('sui-layers__item_group') && $layersGroup.length) {
			groupId = $layersGroup.attr('data-layer-group-id');
			group__insertElemInGroup($el, groupId);
		}

		if (elval !== zindex) {
			tn_console(elem_id);
			tn_console(zindex);
			$el.attr('data-field-zindex-value', zindex);
			$el.css('z-index', zindex);
			if ($el.hasClass('tn-elem__selected')) {
				elem__renderViewOneField($el, 'zindex');
				panelSettings__updateUi($el, 'zindex');
			}
		}
		counter++;
	});

	group__checkEmpty();
	layers__update();
	tn_set_lastChanges();
}

function layers__blocksbox__draw(c) {
	var pageid = $('.tn-artboard').attr('data-page-id');
	var recordid = $('.tn-artboard').attr('data-record-id');

	var d = {};
	d['comm'] = 'getrecordslist';
	d['pageid'] = pageid;
	d['recordid'] = recordid;

	$.ajax({
		type: 'POST',
		url: '/zero/get/',
		data: d,
		dataType: 'text',
		success: function (respond) {
			var data_json_str = respond;
			var data = JSON.parse(data_json_str);
			tn_console(data);

			var str = '<div class="sui-blocks">';
			data.forEach(function (rec) {
				var toggleState = localStorage.getItem('tzerotoggleblocksstate');
				var isActive = recordid === rec.id ? ' sui-blocks__item_active' : '';
				var title = rec.ab_title !== '' && typeof rec.ab_title !== 'undefined' ? rec.ab_title : 'Block #' + rec.id;
				var isZero = typeof rec.z !== 'undefined' && rec.z === 'y';
				var ordinaryBlockClass = '';
				if (!isZero) {
					if (toggleState === null || toggleState === 'on') {
						ordinaryBlockClass = ' sui-blocks__item_ordinary sui-blocks__item_ordinary-hide';
					} else {
						ordinaryBlockClass = ' sui-blocks__item_ordinary';
					}
				}
				str +=
					'<div class="sui-blocks__item' +
					isActive +
					ordinaryBlockClass +
					'" data-openrecords-open-recordid="' +
					rec.id +
					'" data-openrecords-open-pageid="' +
					rec.pageid +
					'">' +
					'<div class="sui-blocks__icon">' +
					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
					'<path d="M4 9.5L10 1 9 6.5h4L7 15l1-5.5H4z" fill="#292929"/>' +
					'</svg>' +
					'</div>' +
					'<div class="sui-blocks__text">' +
					title +
					'</div>' +
					'<div class="sui-blocks__add tooltip" data-tooltip="Add new block">' +
					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
					'<path d="M8 4V12" stroke="#000000"/>' +
					'<path d="M12 8L4 8" stroke="#000000"/>' +
					'</svg>' +
					'</div>' +
					'<div class="sui-blocks__dubl tooltip" data-tooltip="Duplicate block">' +
					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
					'<path d="M3.5 6.5H9.5V12.5H3.5V6.5Z" stroke="#000000"/>' +
					'<path d="M7.5 5V3.5H13.5V9.5H11" stroke="#000000"/>' +
					'</svg>' +
					'</div>' +
					'<div class="sui-blocks__del tooltip" data-tooltip="Delete block">' +
					'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
					'<path d="M4.5 12V6.5H11.5V12C11.5 12.2761 11.2761 12.5 11 12.5H5C4.72386 12.5 4.5 12.2761 4.5 12Z" stroke="#000000"/>' +
					'<path d="M3 4H7V3H9V4H13V5H3V4Z" fill="#000000"/>' +
					'</svg>' +
					'</div>' +
					'</div>';
			});
			str += '</div>';

			c.prepend(str);
		},
		error: function () {},
	});
}

function layers__blocksbox__addSortable() {
	$('.sui-blocks-box .sui-blocks').sortable({
		helper: 'clone',
		opacity: 0.8,
		revert: true,
		tolerance: 'pointer',
		axis: 'y',
		update: function () {
			layers__blocksbox__saveRecordsSort();
		},
		stop: function (e, ui) {
			var $currentItem = $(ui.item);
			if (window.frameElement) {
				var currentRec = $currentItem.attr('data-openrecords-open-recordid');
				var prevRec = $currentItem.prev().attr('data-openrecords-open-recordid');
				var nextRec = $currentItem.next().attr('data-openrecords-open-recordid');
				var currentBlock = window.parent.document.getElementById('record' + currentRec);
				var prevBlock = window.parent.document.getElementById('record' + prevRec);
				var nextBlock = window.parent.document.getElementById('record' + nextRec);
				if (typeof prevRec != 'undefined') {
					$(prevBlock).after($(currentBlock));
				} else {
					$(nextBlock).before($(currentBlock));
				}
			}
		},
	});
}

function layers__blocksbox__addEvents() {
	var timer = 0;
	var prevent = false;
	var recordid = $('.tn-artboard').attr('data-record-id');

	$(document).off('click', '.sui-blocks__item');
	$(document).on('click', '.sui-blocks__item', function (e) {
		var $this = $(this);
		if ($(e.target).hasClass('sui-block-text-inp')) {
			window.tn_flag_settings_ui_focus = true;
		}
		timer = setTimeout(function () {
			if (!prevent) {
				var thisRecordid = $this.attr('data-openrecords-open-recordid');
				var pageid = $this.attr('data-openrecords-open-pageid');
				if (recordid !== thisRecordid && !$(e.target).hasClass('sui-block-text-inp')) {
					if (window.tn.last_changes > window.tn.last_save_db) {
						tn_openrecords__beforeGo(thisRecordid, pageid);
					} else {
						tn_openrecords__gorecord(thisRecordid, pageid);
					}
				}
			}
			prevent = false;
		}, 200);
	});

	$(document).off('dblclick', '.sui-blocks__text');
	$(document).on('dblclick', '.sui-blocks__text', function (e) {
		e.preventDefault();
		clearTimeout(timer);
		prevent = true;
		var $this = $(this);
		var value = $this.text();
		var pageid = $this.parent().attr('data-openrecords-open-pageid');
		var recordid = $this.parent().attr('data-openrecords-open-recordid');
		layers__changeName($this, 'block', value, pageid, recordid, '');
		window.tn_flag_settings_ui_focus = true;
	});

	$(document).off('click', '.sui-blocks__add');
	$(document).on('click', '.sui-blocks__add', function (e) {
		e.stopPropagation();
		var recordid = $(this).parents('.sui-blocks__item').attr('data-openrecords-open-recordid');
		layers__blocksbox__addRecord('396', recordid);
	});

	$(document).off('click', '.sui-blocks__dubl');
	$(document).on('click', '.sui-blocks__dubl', function (e) {
		e.stopPropagation();
		var recordid = $(this).parents('.sui-blocks__item').attr('data-openrecords-open-recordid');
		layers__blocksbox__duplicateRecord(recordid);
	});

	$(document).off('click', '.sui-blocks__del');
	$(document).on('click', '.sui-blocks__del', function (e) {
		e.stopPropagation();
		var $blocksItem = $(this).parents('.sui-blocks__item');
		var recordid = $blocksItem.attr('data-openrecords-open-recordid');
		var isConfirm = confirm('Are you sure you want to delete the block?');
		if (isConfirm) {
			layers__blocksbox__delRecord(recordid, $blocksItem);
		}
	});
}

function layers__blocksbox__addRecord(tplid, afterid) {
	var ts = Date.now();
	var pageid = $('.tn-artboard').attr('data-page-id');

	$.ajax({
		type: 'POST',
		url: '/page/submit/',
		data: {comm: 'addnewrecord', pageid: pageid, afterid: afterid, tplid: tplid},
		dataType: 'text',
		success: function (data) {
			layers__blocksbox__checkLogout(data);
			var newreccid = $(data).attr('id').replace(/\D+/g, '');
			if (window.tn.last_changes > window.tn.last_save_db) {
				tn_openrecords__beforeGo(newreccid, pageid);
			} else {
				tn_openrecords__gorecord(newreccid, pageid);
			}
		},
		error: function (xhr) {
			var ts_delta = Date.now() - ts;
			if (xhr.status == 0 && ts_delta < 300) {
				alert('Request error (adding new block). Please check internet connection...');
			} else {
				try {
					layers__blocksbox__errorLog({
						e: 'addrecord',
						data: {comm: 'addnewrecord', pageid: pageid, afterid: afterid, tplid: tplid},
						xhr: xhr.status,
						ts: ts_delta,
					});
				} catch (e) {
					console.log(e);
				}
				alert('Request timeout (adding new block)');
				location.reload();
			}
		},
		timeout: 1000 * 60,
	});
}

function layers__blocksbox__duplicateRecord(recordid) {
	var ts = Date.now();
	var pageid = $('.tn-artboard').attr('data-page-id');

	$.ajax({
		type: 'POST',
		url: '/page/submit/',
		data: {comm: 'dublicaterecord', pageid: pageid, recordid: recordid},
		dataType: 'text',
		success: function (data) {
			layers__blocksbox__checkLogout(data);
			var newreccid = $(data).attr('id').replace(/\D+/g, '');
			if (window.tn.last_changes > window.tn.last_save_db) {
				tn_openrecords__beforeGo(newreccid, pageid);
			} else {
				tn_openrecords__gorecord(newreccid, pageid);
			}
		},
		error: function (xhr) {
			var ts_delta = Date.now() - ts;
			if (xhr.status == 0 && ts_delta < 300) {
				alert('Request error (block duplicating). Please check internet connection...');
			} else {
				try {
					layers__blocksbox__errorLog({
						e: 'dublicaterecord',
						data: {comm: 'dublicaterecord', pageid: pageid, recordid: recordid},
						xhr: xhr.status,
						ts: ts_delta,
					});
				} catch (e) {
					console.log(e);
				}
				alert('Request timeout (block duplicating)');
				location.reload();
			}
		},
		timeout: 1000 * 60,
	});
}

function layers__blocksbox__delRecord(recordid, $blocksItem) {
	var ts = Date.now();
	var pageid = $('.tn-artboard').attr('data-page-id');
	var currentRecordid = $('.tn-artboard').attr('data-record-id');
	var $blocksItemPrev = $blocksItem.prev();
	var $blocksItemNext = $blocksItem.next();

	$.ajax({
		type: 'POST',
		url: '/page/submit/',
		data: {comm: 'deleterecord', pageid: pageid, recordid: recordid},
		dataType: 'text',
		success: function (data) {
			layers__blocksbox__checkLogout(data);
			if (currentRecordid === recordid) {
				if ($blocksItemNext.length !== 0) {
					tn_openrecords__gorecord($blocksItemNext.attr('data-openrecords-open-recordid'), pageid);
				} else if ($blocksItemPrev.length !== 0) {
					tn_openrecords__gorecord($blocksItemPrev.attr('data-openrecords-open-recordid'), pageid);
				} else {
					tn_close();
				}
			} else {
				$blocksItem.remove();
			}
			if (window.frameElement) {
				window.parent.document.getElementById('rec' + recordid).remove();
			}
		},
		error: function (xhr) {
			var ts_delta = Date.now() - ts;
			if (xhr.status == 0 && ts_delta < 300) {
				alert('Request error (block deletion). Please check internet connection...');
			} else {
				try {
					layers__blocksbox__errorLog({
						e: 'delrecord',
						data: {comm: 'deleterecord', pageid: pageid, recordid: recordid},
						xhr: xhr.status,
						ts: ts_delta,
					});
				} catch (e) {
					console.log(e);
				}
				alert('Request timeout (block deletion)');
				location.reload();
			}
		},
		timeout: 1000 * 60,
	});
}

function layers__blocksbox__checkLogout(data) {
	if (typeof data == 'string' && data.substring(0, 10) == '<!--tlp-->') {
		window.location = '/login/';
		console.log('Sorry, you logout!');
	} else if (typeof data == 'string' && data.substring(0, 12) == '<!--tpbaa-->') {
		window.location = '/projects/';
		console.log('Sorry, this page belongs to another account!');
	}
}

function layers__blocksbox__errorLog(d) {
	console.log('Errorlog sending...');
	$.ajax({
		type: 'POST',
		url: 'https://api.tildacdn.info/errorlog/',
		data: d,
		dataType: 'text',
		success: function () {
			console.log('Errorlog sent ok');
		},
		error: function () {},
		timeout: 1000 * 15,
	});
}

function layers__changeName($this, type, value, pageid, recordid, elem_id) {
	var currentRecordid = $('.tn-artboard').attr('data-record-id');
	var saveName = function () {
		window.tn_flag_settings_ui_focus = false;
		var updatedValue = $inp.val();
		updatedValue = tn_stripTags(updatedValue);
		updatedValue = updatedValue.replaceAll(/"/, '');
		updatedValue = updatedValue.replaceAll(/'/, '');
		updatedValue = updatedValue.replaceAll(/\\/, '');
		if (updatedValue.length > 20) updatedValue = updatedValue.substring(0, 17) + '...';
		if (updatedValue.length === 0) updatedValue = value;

		$inp.parent().text(updatedValue);
		if (type === 'layer') {
			elem__setFieldValue($('#' + elem_id), 'layer', updatedValue, '', '', window.tn.topResolution);
		} else if (value !== updatedValue) {
			$.ajax({
				type: 'POST',
				url: '/zero/submit/',
				data: {comm: 'savezeroblocktitle', pageid: pageid, recordid: recordid, ab_title: updatedValue},
				dataType: 'text',
				success: function (data) {
					tn_console(data);
				},
				error: function () {},
			});
		}

		if (currentRecordid === recordid && type === 'block') {
			ab__setFieldValue($('.tn-artboard'), 'title', $inp.val());
		}
	};

	$this.html('<input type="text" value="20" autocomplete="off" class="sui-' + type + '-text-inp">');
	var $inp = $this.find('.sui-' + type + '-text-inp');
	$inp.val(value).focus();
	$inp.select();
	$inp.on('keyup', function (event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			saveName();
		}
	});
	$inp.focusout(function () {
		saveName();
	});

	/* saving the block title just before changing the href */
	$('.sui-blocks__item').off('click');
	$('.sui-blocks__item').on('click', function (e) {
		var $target = $(e.originalEvent.target);
		if ($target.length && !$target.hasClass('sui-block-text-inp')) {
			saveName();
		}
	});
}

function layers__blocksbox__saveRecordsSort() {
	var sortarr = [];
	var pageid = $('.tn-artboard').attr('data-page-id');

	$('.sui-blocks__item').each(function () {
		var recid = $(this).attr('data-openrecords-open-recordid');
		sortarr.push(recid);
	});

	$.ajax({
		type: 'POST',
		url: '/page/submit/',
		data: {comm: 'saverecordssort', pageid: pageid, sorts: sortarr},
		dataType: 'text',
		success: function (data) {
			layers__blocksbox__checkLogout(data);
		},
		error: function (xhr) {
			try {
				errorLog({
					e: 'saverecordssort',
					data: {comm: 'saverecordssort', pageid: pageid, sorts: sortarr},
					xhr: xhr.status,
				});
			} catch (e) {
				//
			}
			alert('Request timeout (saving blocks order)');
			location.reload();
		},
		timeout: 1000 * 60,
	});
}
