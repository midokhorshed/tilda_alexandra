function tn_toggleGuides() {
	var $tnGuidesWrpr = $('.tn-guides-wrpr');
	if ($tnGuidesWrpr.css('display') == 'none') {
		$tnGuidesWrpr.css('display', 'block');
		allguides__renderView();
	} else {
		$tnGuidesWrpr.css('display', 'none');
	}
}

/**
 * Добавляет горизонтальный или вертикальный гайд на заданной позиции
 *
 * Позиция передается без учёта оффсета (`window.tn.canvas_min_offset_top` и `window.tn.canvas_min_offset_left`)
 *
 * @param {number | string} value - значение координаты без учета оффсета
 * @param {'h' | 'v'} guide_type - тип гайда, горизонтальный (h) или вертикальный (v)
 * @param {string} [id] - id гайда, если не передан, то будет сгенерирован автоматически
 * @returns {jQuery} - jQuery элемент гайда
 */
function guide__add(value, guide_type, id) {
	tn_console('func: addGuide');

	var guide_id;
	if (id) {
		guide_id = id;
	} else {
		var guide_id = Date.now();
		/* When artboard loaded, some guides are generated in same time and has same ID.
		 * To prevent this, set Math.random() value to generated ID */
		guide_id += '-' + Math.round(Math.random() * 10000);
	}

	var $tnGuidesWrpr = $('.tn-guides-wrpr');

	if (typeof value == 'undefined' || value == '') {
		value = 80;
	}

	if (typeof guide_type == 'undefined' || guide_type == '') {
		guide_type = 'h';
	}

	/* add wrapper */
	$tnGuidesWrpr.append(
		'<div class="tn-guide tn-guide_' +
			guide_type +
			'" id="' +
			guide_id +
			'" data-guide-id="' +
			guide_id +
			'" data-guide-type="' +
			guide_type +
			'">' +
			'<div class="tn-guide__line"></div>' +
			'<input class="tn-guide__coords" maxlength="7">' +
			'<div class="tn-guide__del">' +
			'<img src="img/modalClosebutton.png" style="width:15px;">' +
			'</div>' +
			'</div>',
	);

	var $guide = $('#' + guide_id);
	if (guide_type == 'h') {
		$guide.attr('data-field-top-value', value);
	} else {
		$guide.attr('data-field-left-value', value);
	}

	/* add ui edit clicks */
	guide__addUiClickEvents($guide);

	/* render guide view */
	guide__renderView($guide);

	guide__update__coordsHint($guide);

	$tnGuidesWrpr.css('display', 'block');

	return $guide;
}

function guide__renderView($guide) {
	var value;
	var guideType = $guide.attr('data-guide-type');

	if (guideType == 'h') {
		value = parseInt($guide.attr('data-field-top-value'), 10) + window.tn.canvas_min_offset_top;
		$guide.css('top', parseInt(value, 10) + 'px');
	}

	if (guideType == 'v') {
		value = parseInt($guide.attr('data-field-left-value'), 10) + window.tn.canvas_min_offset_left;
		$guide.css('left', parseFloat(value) + 'px');
	}
}

function guide__addUiClickEvents($guide) {
	tn_console('func: addUiClick__guide');
	window.clicktimeoutId = false;

	$guide.find('.tn-guide__del').click(function () {
		tn_undo__Add('guides_delete', $guide);

		$guide.remove();
	});

	$guide.hover(function () {
		if (!$guide.hasClass('tn-guide_edit')) guide__update__coordsHint($guide);
	});

	var guide_type = $guide.attr('data-guide-type');

	var axis;
	if (guide_type == 'h') {
		axis = 'y';
	} else {
		axis = 'x';
	}

	$guide.draggable({
		distance: 3,
		axis: axis,
		grid: [1, 1],
		snap: '.tn-elem, .tn-group',
		snapTolerance: 5,
		snapMode: 'outer',
		start: function (event, ui) {
			tn_undo__Add('guides_save', $guide);

			tn_console('drag: start');
			var zoom = window.tn.zoom;
			var $this = $(this);
			if (guide_type == 'h') {
				$this.draggable('option', 'grid', [0, zoom]);
				ui.originalPosition.top = ui.originalPosition.top / zoom;
				ui.originalPosition.left = ui.originalPosition.left / zoom;
				ui.position.top = 0;
			} else {
				$this.draggable('option', 'grid', [zoom, 0]);
				ui.originalPosition.top = ui.originalPosition.top / zoom;
				ui.originalPosition.left = ui.originalPosition.left / zoom;
				ui.position.left = 0;
			}
			$guide.addClass('tn-guide_dragging');
		},
		drag: function (event, ui) {
			var layoutOffsetTop;
			var factor = 1 / window.tn.zoom - 1;
			var $tnLayout = $('.tn-layout');
			if (guide_type == 'h') {
				layoutOffsetTop = $tnLayout.position().top / window.tn.zoom;
				ui.position.top += (ui.position.top - ui.originalPosition.top) * factor - layoutOffsetTop;
				ui.position.left = ui.originalPosition.left;
			} else {
				layoutOffsetTop = $tnLayout.position().top / window.tn.zoom;
				ui.position.left += (ui.position.left - ui.originalPosition.left) * factor;
				ui.position.top = ui.originalPosition.top;
			}
			guide__save__currentPosition($guide);
			guide__update__coordsHint($guide);
		},
		stop: function (event) {
			tn_console('drag: stop');
			$('.tn-guide').removeClass('tn-guide_dragging');
			event.stopImmediatePropagation();
		},
	});

	var $input = $guide.find('.tn-guide__coords');

	$input.on('focus', function () {
		window.tn_flag_settings_ui_focus = true;
		allelems__unselect();
		$input.select();
		$input.val(parseInt($input.val(), 10));
		$guide.addClass('tn-guide_edit');
	});

	$input.on('blur', function () {
		window.tn_flag_settings_ui_focus = false;
		$guide.removeClass('tn-guide_edit');
	});

	$input.on('mouseleave', function (event) {
		event.preventDefault();
	});

	$input.on('keydown', function (event) {
		if (event.keyCode === 13) {
			tn_undo__Add('guides_save', $guide);

			var inputValue = $input.val();
			var guidePosition = tn_calculateInputNumber(inputValue);
			var guideType = $guide.attr('data-guide-type');
			var left;
			var top;

			if (guideType === 'h') {
				top = guidePosition + window.tn.canvas_min_offset_top;
				$guide.css('top', top + 'px');
			}

			if (guideType === 'v') {
				left = guidePosition + window.tn.canvas_min_offset_left;
				$guide.css('left', left + 'px');
			}

			guide__save__currentPosition($guide);
			guide__update__coordsHint($guide);

			$(this).blur();
		}

		if (event.keyCode === 27) $(this).blur();
	});
}

function guide__save__currentPosition($guide) {
	if ($guide.attr('data-guide-type') == 'h') {
		var curtop = parseInt($guide.css('top'), 10);
		var top = parseInt(curtop - window.tn.canvas_min_offset_top, 10);
		$guide.attr('data-field-top-value', top);
	} else {
		var curleft = parseInt($guide.css('left'), 10);
		var left = parseInt(curleft - window.tn.canvas_min_offset_left, 10);
		$guide.attr('data-field-left-value', left);
	}
}

function guide__update__coordsHint($guide) {
	var $tnGuideCoords = $guide.find('.tn-guide__coords');
	var $tnGuideDel = $guide.find('.tn-guide__del');

	if ($guide.attr('data-guide-type') == 'h') {
		var top = $guide.attr('data-field-top-value');
		$tnGuideCoords.val(top + 'px');
		$tnGuideCoords.css('left', window.tn.canvas_max_offset_left);
		$tnGuideDel.css('left', window.tn.canvas_max_offset_left - 20);
	} else {
		var left = $guide.attr('data-field-left-value');
		$tnGuideCoords.val(left + 'px');
		$tnGuideCoords.css('top', window.tn.canvas_max_offset_top);
		$tnGuideDel.css('top', window.tn.canvas_max_offset_top - 20);
	}
}

function allguides__renderView() {
	tn_console('func: allguides__renderView');
	var $tnGuide = $('.tn-guide');
	$tnGuide.each(function () {
		guide__renderView($(this));
	});

	if ($tnGuide.length) {
		var line_h = 5000;
		if (typeof window.tn.canvas_max_height != 'undefined' && window.tn.canvas_max_height > 5000) {
			line_h = window.tn.canvas_max_height + 1500;
		}
		$('.tn-guide_v').css('height', line_h + 'px');
	}
}
