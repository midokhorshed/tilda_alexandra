/* ------------------------ */
/* Artboard operations */

function ab__setFieldValue(ab, prop, val, res) {
	tn_console('func: ab__setFieldValue ' + prop + '=' + val);

	if (prop == 'bgcolor') {
		if (tn_isGradientStyle(val)) val = tn_parseJSONfromGradient(val);
		if (tn_isGradientJSON(val)) val = tn_replaceDoubleQuotes(val);
	}

	if (typeof res === 'undefined' || res == '') res = window.tn.curResolution;

	if (res < window.tn.topResolution && prop !== 'valign' && prop !== 'ovrflw') {
		if (typeof val === 'undefined' || val == 'undefined') {
			ab.removeAttr('data-artboard-' + prop + '-res-' + res);
		} else {
			ab.attr('data-artboard-' + prop + '-res-' + res, val);
		}
	} else {
		if (typeof val === 'undefined' || val == 'undefined') {
			ab.removeAttr('data-artboard-' + prop);
		} else {
			ab.attr('data-artboard-' + prop, val);
		}
	}
}

function ab__getFieldValue(ab, prop) {
	var v;

	//если есть значение в дата-атрибуте для нашего разрешения
	if (window.tn.curResolution === window.tn.topResolution) {
		v = ab.attr('data-artboard-' + prop);
	} else {
		v = ab.attr('data-artboard-' + prop + '-res-' + window.tn.curResolution);
	}

	//значения нет, значит поищем на высших разрешениях лесенкой
	if (typeof v === 'undefined') {
		for (var i = 0; i < window.tn.screens_cnt; i++) {
			if (window.tn.screens[i] <= window.tn.curResolution) continue;

			if (window.tn.screens[i] === window.tn.topResolution) {
				v = ab.attr('data-artboard-' + prop);
			} else {
				v = ab.attr('data-artboard-' + prop + '-res-' + window.tn.screens[i]);
			}
			if (typeof v !== 'undefined') {
				break; //останавливаем цикл (но не выходим из функции)
			}
		} //for
	}
	return v;
}

function ab__getFieldValue_for_Res(ab, prop, res) {
	var v;

	if (res == window.tn.topResolution) {
		v = ab.attr('data-artboard-' + prop);
	} else {
		v = ab.attr('data-artboard-' + prop + '-res-' + res);
	}

	return v;
}

function ab__renderViewOneField(field) {
	var $ab = $('.tn-artboard');
	var $canvas_max = $('.tn-canvas-max');
	var $canvas_min = $('.tn-canvas-min');
	var $filter = $('.tn-filter');
	var bgimg;
	var gradient;

	var value = ab__getFieldValue($ab, field);

	if (typeof value === 'undefined') value = '';

	if (field === 'bgcolor') {
		bgimg = ab__getFieldValue($ab, 'bgimg');

		value = tn_replaceSingleQuotes(value);

		if (tn_isGradientJSON(value)) {
			value = tn_parseGradientFromJSON(value);

			if (bgimg) {
				bgimg = 'url(' + bgimg + '), ' + value;
			} else {
				bgimg = value;
			}

			$canvas_max.css({
				'background-image': bgimg,
				'background-color': 'transparent',
			});
		} else {
			$canvas_max.css({
				'background-color': value,
				'background-image': 'url(' + bgimg + ')',
			});
		}
	}

	if (field === 'bgimg') {
		gradient = ab__getFieldValue($ab, 'bgcolor');
		gradient = tn_replaceSingleQuotes(gradient);

		if (tn_isGradientJSON(gradient)) {
			gradient = tn_parseGradientFromJSON(gradient);
			bgimg = value ? 'url(' + value + '), ' + gradient : gradient;
			$canvas_max.css('background-image', bgimg);
		} else {
			$canvas_max.css('background-image', 'url(' + value + ')');
		}

		$canvas_max.css('background-size', 'cover');
		$canvas_max.css('background-repeat', 'no-repeat');

		if (typeof value === 'undefined' || value == '') {
			$canvas_max.removeClass('tn-canvas-max_noborder');
		} else {
			$canvas_max.addClass('tn-canvas-max_noborder');
		}
	}

	if (field === 'bgattachment') {
		var res = window.tn.curResolution;

		if (res <= 960) value = 'scroll';
		$canvas_max.css('background-attachment', value);
		if (value === 'fixed') {
			$canvas_max.css('transform', 'translate3d(0,0,0)');
		}
	}

	if (field === 'bgposition') {
		$canvas_max.css('background-position', value);
	}

	if (field === 'filtercolor') {
		if (value != '' && typeof value !== 'undefined') {
			var filterColorRGB = tn_hex2rgb(value);
			$filter.attr('data-filtercolor-rgb', filterColorRGB[0] + ',' + filterColorRGB[1] + ',' + filterColorRGB[2]);
		} else {
			$filter.attr('data-filtercolor-rgb', '');
		}

		ab__filterUpdate();
	}

	if (field === 'filtercolor2') {
		if (value != '' && typeof value !== 'undefined') {
			var filterColor2RGB = tn_hex2rgb(value);
			$filter.attr('data-filtercolor2-rgb', filterColor2RGB[0] + ',' + filterColor2RGB[1] + ',' + filterColor2RGB[2]);
		} else {
			$filter.attr('data-filtercolor2-rgb', '');
		}
		ab__filterUpdate();
	}

	if (field === 'filteropacity') {
		if (value != '' && typeof value !== 'undefined') {
			$filter.attr('data-filteropacity', value);
		} else {
			$filter.attr('data-filteropacity', '1');
		}

		ab__filterUpdate();
	}

	if (field === 'filteropacity2') {
		if (value != '' && typeof value !== 'undefined') {
			$filter.attr('data-filteropacity2', value);
		} else {
			$filter.attr('data-filteropacity2', '1');
		}

		ab__filterUpdate();
	}

	if (field === 'height' || field === 'height_vh' || field === 'valign') {
		/* min height */
		var ab_height = parseInt(ab__getFieldValue($ab, 'height'));

		/* max height */
		var ab_height_vh = ab__getFieldValue($ab, 'height_vh');
		var ab_valign = ab__getFieldValue($ab, 'valign');

		if (
			ab_height_vh != '' &&
			isNaN(parseInt(ab_height_vh)) == false &&
			window.tn.curResolution >= 960 &&
			ab_valign != 'stretch'
		) {
			window.tn.canvas_min_offset_top = 1000;
			window.tn.canvas_max_offset_top = 1000;
			window.tn.canvas_min_height = parseInt(ab_height, 10);
			window.tn.canvas_max_height = parseInt(ab_height, 10) + 50;

			if (ab_valign === 'center') {
				window.tn.canvas_min_offset_top = 1050;
				window.tn.canvas_max_offset_top = 1000;
				window.tn.canvas_min_height = parseInt(ab_height, 10);
				window.tn.canvas_max_height = parseInt(ab_height, 10) + 100;
			}

			if (ab_valign === 'bottom') {
				window.tn.canvas_min_offset_top = 1050;
				window.tn.canvas_max_offset_top = 1000;
				window.tn.canvas_min_height = parseInt(ab_height, 10);
				window.tn.canvas_max_height = parseInt(ab_height, 10) + 50;
			}
		} else {
			window.tn.canvas_min_offset_top = 1000;
			window.tn.canvas_max_offset_top = 1000;
			window.tn.canvas_min_height = parseInt(ab_height, 10);
			window.tn.canvas_max_height = parseInt(ab_height, 10);
		}

		$canvas_min.css('top', window.tn.canvas_min_offset_top + 'px');
		$canvas_max.css('top', window.tn.canvas_max_offset_top + 'px');
		$canvas_min.css('height', window.tn.canvas_min_height + 'px');
		$canvas_max.css('height', window.tn.canvas_max_height + 'px');

		$filter.css('height', window.tn.canvas_max_height + 'px');
		$('.tn-floor').css('min-height', window.tn.canvas_max_height + 1500 + 'px');
		$('.tn-bg').css('height', window.tn.canvas_max_height + 'px');
		$('.tn-canvas-max-bottom').css('top', window.tn.canvas_min_offset_top + window.tn.canvas_min_height + 'px');

		$('.tn-canvas-min .tn-canvas__helper').css(
			'bottom',
			-60 -
				parseInt(window.tn.canvas_max_height - window.tn.canvas_min_height) +
				(window.tn.canvas_min_offset_top - window.tn.canvas_max_offset_top) +
				1 +
				'px',
		);

		window.tn.artboard_height = parseInt(ab_height, 10);
	}
}

function ab__filterUpdate() {
	var $filter = $('.tn-filter');
	var c1 = $filter.attr('data-filtercolor-rgb');
	var c2 = $filter.attr('data-filtercolor2-rgb');
	var o1 = $filter.attr('data-filteropacity');
	var o2 = $filter.attr('data-filteropacity2');

	if ((typeof c2 === 'undefined' || c2 == '') && typeof c1 !== 'undefined' && c1 !== '') {
		$filter.css({
			background:
				'-webkit-gradient(linear, left top, left bottom, from(rgba(' +
				c1 +
				',' +
				o1 +
				')), to(rgba(' +
				c1 +
				',' +
				o1 +
				')) )',
		});
	} else if ((typeof c1 === 'undefined' || c1 == '') && typeof c2 !== 'undefined' && c2 !== '') {
		$filter.css({
			background:
				'-webkit-gradient(linear, left top, left bottom, from(rgba(' +
				c2 +
				',' +
				o2 +
				')), to(rgba(' +
				c2 +
				',' +
				o2 +
				')) )',
		});
	} else if (typeof c1 !== 'undefined' && typeof c2 != 'undefined' && c1 != '' && c2 != '') {
		$filter.css({
			background:
				'-webkit-gradient(linear, left top, left bottom, from(rgba(' +
				c1 +
				',' +
				o1 +
				')), to(rgba(' +
				c2 +
				',' +
				o2 +
				')) )',
		});
	} else {
		$filter.css('background', 'transparent');
	}
}

function ab__renderView() {
	var fields = window.tn.ab_fields;
	fields.forEach(function (field) {
		ab__renderViewOneField(field);
	});
}

/* ------------------------ */
/* Artboard Save */

function artboard__Empty__toLS() {
	tn_console('func: empty__Data__Json');
	var recordid = $('.tn-artboard').attr('data-record-id');
	localStorage.removeItem('artboard' + recordid + '_data');
	window.tn.last_save_ls = 0;
}

function artboard__autoSave__toLS() {
	if (window.tn.last_changes > window.tn.last_save_db && window.tn.last_changes > window.tn.last_save_ls) {
		artboard__Save__toLS();
	}
}

/* ------------------------ */
/* Artboard build */

function artboard__Build(data) {
	tn_console('**** func: artboard__Build');
	var artboard = $('.tn-artboard');

	if (data == null) {
		data = {};
		data['ab_height'] = 600;
	}

	/* set custom breakpoints */
	if (
		typeof data['ab_screens'] == 'string' &&
		data['ab_screens'] != '' &&
		data['ab_screens'] != window.tn.screens_default_str
	) {
		setTNobj_screens(data['ab_screens']);
		tn_drawResMenu();
	}

	/* set value for each artboard field */
	window.tn.ab_fields.forEach(function (field) {
		var value = data['ab_' + field];

		if (field === 'grid' && !value) return; //continue

		/* default values of undefined fields */
		if (typeof value === 'undefined') {
			value = '';
			if (field === 'filteropacity') value = '0.5';
			if (field === 'filteropacity2') value = '0.5';
			if (field === 'bgattachment') value = 'scroll';
			if (field === 'bgposition') value = 'center center';
			if (field === 'valign') value = 'center';
			if (field === 'upscale') value = 'grid';
		}

		if (field == 'bgcolor') {
			if (tn_isGradientStyle(value)) {
				value = tn_parseJSONfromGradient(value);
				value = tn_replaceDoubleQuotes(value);
			}
		}

		ab__setFieldValue(artboard, field, value, window.tn.topResolution);

		/* set other resolutions */
		var v;
		window.tn.screens.forEach(function (s) {
			if (s == window.tn.topResolution) return; //continue, skip top resolution

			v = data['ab_' + field + '-res-' + s];

			if (typeof v !== 'undefined') {
				if (field == 'bgcolor') {
					if (tn_isGradientStyle(v)) {
						v = tn_parseJSONfromGradient(v);
						v = tn_replaceDoubleQuotes(v);
					}
				}
				ab__setFieldValue(artboard, field, v, s);
			}
		});
	}); // foreach fields

	ab__renderView();
	updateTNobj();

	$('.tn-guides-wrpr').css('display', 'block');

	/* add elems */
	// TODO: временный фикс дублирования элементов после https://github.com/greensun7/tildazero/pull/557
	// TODO: удалить через 3 недели
	var existedIds = [];
	for (var key in data) {
		var item = data[key];

		if (!item.elem_id) {
			addElem(item);
		} else if (existedIds.indexOf(item.elem_id) === -1) {
			existedIds.push(item.elem_id);
			addElem(item);
		}
	}

	/* add guides horiz */
	if (data != null && typeof data.guides_h !== 'undefined' && data.guides_h.length > 0) {
		// eslint-disable-next-line no-redeclare
		for (var key in data.guides_h) {
			// eslint-disable-next-line no-redeclare
			var item = data.guides_h[key];
			guide__add(item, 'h');
		}
	}

	/* add guides vert */
	if (data != null && typeof data.guides_v != 'undefined' && data.guides_v.length > 0) {
		// eslint-disable-next-line no-redeclare
		for (var key in data.guides_v) {
			// eslint-disable-next-line no-redeclare
			var item = data.guides_v[key];
			guide__add(item, 'v');
		}
	}

	// insert figma import warning
	var warningStr =
		'<td class="tn-figma-warning tn-figma-warning__hidden">' +
		'There are images that have not been uploaded' +
		'<div class="sui-label-ask tooltip tooltipstered" data-tooltip=\'While importing from Figma, all the necessary objects<br> are created, but image files remain on the Figma server<br> and are connected directly from there.<br> This is convenient to speed up the prototyping process.<br> Files on Figma (not transferred to Tilda) are usually<br> available within 30 days and may stop loading.<br> To finish importing, click on the element with an image,<br> then click "Upload to Tilda".\'></div>' +
		'</td>';
	$('.tn-save-btn').closest('td').before(warningStr);
	tn_figma__checkAmazonImages();

	$('.tn-canvas-max-bottom').draggable({
		grid: [0, 10],
		axis: 'y',
		start: function (event, ui) {
			tn_undo__Add('ab_save');
			var zoom = window.tn.zoom;
			$(this).draggable('option', 'grid', [0, 10 * zoom]);

			ui.originalPosition.top = ui.originalPosition.top / zoom;
			ui.originalPosition.left = ui.originalPosition.left / zoom;
			ui.position.top = 0;
		},
		drag: function (event, ui) {
			var $layout = $('.tn-layout');
			var factor = 1 / window.tn.zoom - 1;
			var layoutOffsetTop = $layout.position().top / window.tn.zoom;
			var layoutOffsetLeft = $layout.position().left / window.tn.zoom;
			ui.position.top += (ui.position.top - ui.originalPosition.top) * factor - layoutOffsetTop;
			ui.position.left = ui.originalPosition.left - layoutOffsetLeft;
			var h = parseInt($(this).css('top')) - window.tn.canvas_min_offset_top;
			$('.tn-canvas-min').css('height', h + 'px');
		},
		stop: function (event) {
			var h = parseInt($(this).css('top')) - window.tn.canvas_min_offset_top;
			if (h <= 0) h = 1;
			ab__setFieldValue(artboard, 'height', h);
			ab__renderViewOneField('height');
			ab__panelSettings__updateUi(artboard, 'height', h);

			updateTNobj();
			allelems__renderView();
			allguides__renderView();
			tn_drawguides_updateHeight();

			tn_set_lastChanges();

			if (window.isAltDown) {
				tn_setRulersPosition();
			}

			ab__renderGrid();
			event.stopImmediatePropagation();
		},
	});

	floor__mousedown();

	var flag_open_layers_onstart = '';
	$('.tn-elem').each(function () {
		if ($(this).attr('data-field-invisible-value') == 'y') flag_open_layers_onstart = 'y';
	});

	// fix broken elems
	// delete later
	// (upd from Nikita1 - я не понимаю что это тут делается)
	window.tn.screens.forEach(function (s) {
		if (s == window.tn.topResolution) return; // continue (skip) if top resolution
		$('[data-field-groupid-res-' + s + '-value]').each(function () {
			var $el = $(this);
			var groupId = $el.attr('data-field-groupid-res-' + s + '-value');
			$el.attr('data-field-groupid-value', groupId);
			$el.removeAttr('data-field-groupid-res-' + s + '-value');
		});
	});

	// TODO: временный фикс дублирования элементов после https://github.com/greensun7/tildazero/pull/557
	// TODO: удалить через 3 недели
	var existedGroupIds = [];
	if (data != null && typeof data.groups !== 'undefined' && data.groups.length > 0) {
		data.groups.forEach(function (group) {
			if (existedGroupIds.indexOf(group.id) === -1) {
				existedGroupIds.push(group.id);
				group__create(group.id, group, true);
			}
		});
	}

	group__checkGroupedElsOutside();

	// delete broken elems
	// delete later
	$('[data-field-zindex-value="NaN"]').remove();

	var layersPanelCurrentState = JSON.parse(sessionStorage.getItem('tzerolayerspanel'));
	var settingsPanelCurrentState = sessionStorage.getItem('tzerosettingspanel');
	var firstopen = localStorage.getItem('tn-firstopen');
	var isPanelLayersOpen = 'off';
	var isPanelSettingsOpen = 'off';

	if (layersPanelCurrentState !== null) {
		isPanelLayersOpen = layersPanelCurrentState.turn;
	} else if ($(window).width() >= 1900) {
		isPanelLayersOpen = 'on';
	}

	if (firstopen == null || (firstopen != null && firstopen > 0 && Date.now() - firstopen < 60 * 60 * 12 * 1000)) {
		isPanelSettingsOpen = 'on';
	} else if (settingsPanelCurrentState !== null) {
		isPanelSettingsOpen = settingsPanelCurrentState;
	} else if ($(window).width() >= 1900) {
		isPanelSettingsOpen = 'on';
	}
	if (flag_open_layers_onstart === 'y' || isPanelLayersOpen === 'on') {
		panelLayers__open();
	}
	if (isPanelSettingsOpen === 'on') {
		tn_showSettings();
	}

	setTimeout(function () {
		tn_missedfonts__find();
		allguides__renderView();
		tn_drawguides_updateHeight();
	}, 1500);
}

/* Panel Artboard Settings */

function ab__getData__inJson($ab) {
	var ab_fields = window.tn.ab_fields;
	var data = {
		'data-artboard-page-id': $ab.attr('data-page-id'),
		'data-artboard-record-id': $ab.attr('data-record-id'),
	};

	ab_fields.forEach(function (field) {
		var v;
		window.tn.screens.forEach(function (s) {
			if (s == window.tn.topResolution) {
				v = $ab.attr('data-artboard-' + field);
			} else {
				v = $ab.attr('data-artboard-' + field + '-res-' + s);
			}

			if (typeof v !== 'undefined') {
				if (field == 'bgcolor' || field == 'color') {
					v = tn_replaceSingleQuotes(v);
					if (tn_isGradientJSON(v)) {
						v = tn_parseGradientFromJSON(v);
					}
				}

				if (s == window.tn.topResolution) {
					data['ab_' + field] = v;
				} else {
					data['ab_' + field + '-res-' + s] = v;
				}
			}
		});
	});

	return data;
}
