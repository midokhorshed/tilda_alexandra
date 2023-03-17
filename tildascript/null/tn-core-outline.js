function tn_createOutline(type) {
	var $outline = $(
		'<div class="tn-outline tn-outline_' +
			type +
			'">' +
			'<div class="tn-outline__border tn-outline__border_top"></div>' +
			'<div class="tn-outline__border tn-outline__border_bottom"></div>' +
			'<div class="tn-outline__border tn-outline__border_left"></div>' +
			'<div class="tn-outline__border tn-outline__border_right"></div>' +
			'</div>',
	);

	if (type === 'selected') {
		tn_addUiClickEvents__outline($outline);
		tn_createRotateCursor();
		tn_createRotateAnchors($outline);

		$('<p class="tn-outline__size"><span class="tn-outline__size__text"></span></p>').appendTo($outline);
		$outline = $('<div class="tn-outline-wrpr"></div>').append($outline);
	}

	$outline.appendTo('.tn-layout');
}

function tn_createRotateAnchors($outline) {
	var sides = ['nw', 'ne', 'sw', 'se'];
	var $anchor;

	for (var i in sides) {
		$anchor = $(
			'<div class="tn-outline__rotate-anchor tn-outline__rotate-anchor_' +
				sides[i] +
				'"><div class="tn-outline__rotate-anchor-zone-1"></div><div class="tn-outline__rotate-anchor-zone-2"></div></div>',
		);
		$anchor.tnSide = sides[i];
		tn_addRotateEvents($anchor);
		$anchor.appendTo($outline);
	}
}

function tn_createRotateCursor() {
	var $cursor = $(
		'<div class="tn-rotate-cursor">' +
			'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M1.49443 -0.260851L-0.261481 1.49506C-0.579506 1.81308 -0.579507 2.32871 -0.261481 2.64673L1.49443 4.40264C2.00744 4.91566 2.88462 4.55232 2.88462 3.82681V3.2188C6.02928 3.4612 8.5388 5.97072 8.7812 9.11538H8.17319C7.44768 9.11538 7.08434 9.99255 7.59736 10.5056L9.35327 12.2615C9.67129 12.5795 10.1869 12.5795 10.5049 12.2615L12.2608 10.5056C12.7739 9.99255 12.4105 9.11538 11.685 9.11538H11.0436C10.794 4.72345 7.27655 1.20599 2.88462 0.95636V0.314984C2.88462 -0.410525 2.00745 -0.773867 1.49443 -0.260851Z" fill="black" stroke="white"/>' +
			'<clipPath id="clip0">' +
			'<rect width="12" height="12" fill="white"/>' +
			'</clipPath>' +
			'</svg>' +
			'</div>',
	);

	$cursor.appendTo($('.tn-layout'));
}

function tn_addRotateEvents($anchor) {
	var startPosition = {
		x: 0,
		y: 0,
	};

	var currentPosition = {
		x: 0,
		y: 0,
	};

	var $cursor = $('.tn-rotate-cursor');
	var isRotatable = true;
	var isRotate = false;
	var cursorAngle = 0;
	var selectedCenter;
	var angle;
	var newAngle;
	var shiftAngle;

	$anchor.on('mouseenter', function (event) {
		var $selectedEl = $('.tn-elem__selected');

		isRotatable = typeof elem__getFieldValue($selectedEl, 'rotate') === 'undefined' ? false : true;

		if ($selectedEl.length === 1 && isRotatable) {
			switch ($anchor.tnSide) {
				case 'ne':
					cursorAngle = 0;
					break;
				case 'se':
					cursorAngle = 90;
					break;
				case 'sw':
					cursorAngle = 180;
					break;
				case 'nw':
					cursorAngle = 270;
					break;
			}

			$cursor.css(
				'transform',
				'translate(' +
					event.pageX / window.tn.zoom +
					'px, ' +
					event.pageY / window.tn.zoom +
					'px) rotate(' +
					cursorAngle +
					'deg)',
			);
			tn_showRotateCursor($cursor);
		}
	});

	$anchor.on('mousemove', function (event) {
		if ($('.tn-elem__selected').length === 1 && isRotatable) {
			$cursor.css({
				'transform':
					'translate(' +
					event.pageX / window.tn.zoom +
					'px, ' +
					event.pageY / window.tn.zoom +
					'px) rotate(' +
					cursorAngle +
					'deg)',
			});
		}
	});

	$anchor.on('mouseleave', function () {
		if (!window.tn.isRotate && $('.tn-elem__selected').length === 1 && isRotatable) {
			tn_hideRotateCursor($cursor);
		}
	});

	$anchor.on('mousedown', function (event) {
		var $selectedElems = $('.tn-elem__selected');

		if ($selectedElems.length === 1 && isRotatable) {
			isRotate = true;
			window.tn.isRotate = true;

			angle = parseInt(elem__getFieldValue($selectedElems, 'rotate'), 10);

			startPosition.x = event.pageX;
			startPosition.y = event.pageY;

			selectedCenter = tn_getSelectedCenter();

			event.stopPropagation();
		}
	});

	$(document).on('mousemove', function (event) {
		var $selectedEl;
		var newCursorAngle;
		var moveAngle;

		if (isRotate && event.buttons) {
			currentPosition.x = event.pageX;
			currentPosition.y = event.pageY;

			moveAngle = tn_calculateAngle(selectedCenter, startPosition, currentPosition);

			newCursorAngle = cursorAngle + moveAngle;
			$cursor.css(
				'transform',
				'translate(' +
					event.pageX / window.tn.zoom +
					'px, ' +
					event.pageY / window.tn.zoom +
					'px) rotate(' +
					newCursorAngle +
					'deg)',
			);

			newAngle = angle + moveAngle;

			if (newAngle < 0) newAngle += 360;
			if (newAngle >= 360) newAngle -= 360;

			if (event.shiftKey && newAngle % 15 !== 0) {
				return;
			} else {
				shiftAngle = newAngle;
			}

			$selectedEl = $('.tn-elem__selected');
			$selectedEl.find('.tn-atom').css('transform', 'rotate(' + newAngle + 'deg)');

			panelSettings__updateUi($selectedEl, 'rotate', newAngle);

			// tn_setOutlineAngle(newAngle, 'selected');
		}
	});

	$(document).on('mouseup', function (event) {
		var $selectedEl;
		if (isRotate) {
			tn_hideRotateCursor($cursor);

			$selectedEl = $('.tn-elem__selected');

			tn_undo__Add('elem_save', $selectedEl);

			isRotate = false;
			window.tn.isRotate = false;

			if (event.shiftKey && newAngle % 15 !== 0) newAngle = shiftAngle;

			elem__setFieldValue($selectedEl, 'rotate', newAngle, 'render', 'updateui');
		}
	});
}

function tn_showRotateCursor($cursor) {
	$(
		'.tn-floor, .tn-mainmenu, .tn-elem, .tn-group, .tn-outline__rotate-anchor, .tn-right-box, .tn-left-box, .ui-resizable-handle',
	).css('cursor', 'none');
	$cursor.css('display', 'block');
}

function tn_hideRotateCursor($cursor) {
	$(
		'.tn-floor, .tn-mainmenu, .tn-elem, .tn-group, .tn-outline__rotate-anchor, .tn-right-box, .tn-left-box, .ui-resizable-handle',
	).css('cursor', '');
	$cursor.css('display', 'none');
}

function tn_getSelectedCenter() {
	var $outline = $('.tn-outline_selected');
	var outlinePosition = $outline.position();

	return {
		x: outlinePosition.left + $outline.width() / 2,
		y: outlinePosition.top + $outline.height() / 2,
	};
}

function tn_calculateAngle(center, start, end) {
	var startVector = {
		x: start.x - center.x,
		y: start.y - center.y,
	};

	var endVector = {
		x: end.x - center.x,
		y: end.y - center.y,
	};

	var cos =
		(startVector.x * endVector.x + startVector.y * endVector.y) /
		(Math.sqrt(Math.pow(startVector.x, 2) + Math.pow(startVector.y, 2)) *
			Math.sqrt(Math.pow(endVector.x, 2) + Math.pow(endVector.y, 2)));
	var matrixDet = startVector.x * endVector.y - startVector.y * endVector.x;
	var angle = Math.round(Math.acos(cos) * (180 / Math.PI));

	if (matrixDet < 0) angle = -angle;

	return angle;
}

function tn_setOutlinePosition(eventType) {
	var $outline;
	var outlineCoordinates;
	var $selectedElems;
	// var elRotateAngle;

	if (!eventType) eventType = 'selected';

	$outline = $('.tn-outline_' + eventType);
	outlineCoordinates = tn_findOutlineCoordinates(eventType);

	$outline.css({
		top: outlineCoordinates.top,
		left: outlineCoordinates.left,
		width: outlineCoordinates.right - outlineCoordinates.left,
		height: outlineCoordinates.bottom - outlineCoordinates.top,
	});

	if (eventType === 'selected') {
		$selectedElems = $('.tn-elem__selected');

		// if ($selectedElems.length === 1) {
		//   elRotateAngle = parseInt(elem__getFieldValue($selectedElems, 'rotate'), 10);
		//   tn_setOutlineAngle(elRotateAngle, eventType);
		// } else {
		//   tn_setOutlineAngle(0, eventType);
		// }

		var width = $outline.width();
		var height = $outline.height();

		if (width <= 5 || height <= 5) {
			$outline[0].style.setProperty('--tn-outline-offset', '-8px');
		} else if (width <= 10 || height <= 10) {
			$outline[0].style.setProperty('--tn-outline-offset', '-6px');
		} else {
			$outline[0].style.setProperty('--tn-outline-offset', '-4px');
		}

		tn_showResizeAnchors($selectedElems);
		tn_updateOutlineDescription();
	}
	//  else {
	//   $selectedElems = $('.tn-elem__hover');

	//   elRotateAngle = parseInt(elem__getFieldValue($selectedElems, 'rotate'), 10);
	//   tn_setOutlineAngle(elRotateAngle, eventType);
	// }
}

// function tn_setOutlineAngle(angle, outlineType) {
//   var $outline = $('.tn-outline_' + outlineType);

//   $outline.css('transform', 'rotate(' + angle + 'deg)');

//   if (outlineType === 'selected') tn_relocateOutlineDescription(angle);
// }

function tn_findOutlineCoordinates(eventType) {
	var blocks = $('.tn-elem__' + eventType + ', .tn-group__' + eventType);
	var outlineCoordinates = {};

	blocks.each(function () {
		var elCoordinates = tn_getElCoordinates($(this));

		for (var key in elCoordinates) {
			switch (key) {
				case 'left':
				case 'top':
					if (!outlineCoordinates[key] || elCoordinates[key] < outlineCoordinates[key]) {
						outlineCoordinates[key] = elCoordinates[key];
					}
					break;

				case 'right':
				case 'bottom':
					if (!outlineCoordinates[key] || elCoordinates[key] > outlineCoordinates[key]) {
						outlineCoordinates[key] = elCoordinates[key];
					}
					break;
			}
		}
	});

	return outlineCoordinates;
}

function tn_getElCoordinates(el) {
	var elCoordinates = {};
	var size;
	var groupid = elem__getFieldValue(el, 'groupid');
	var group;

	if (groupid) {
		group = $('#' + groupid);

		elCoordinates.top = parseInt(group.css('top'), 10);
		elCoordinates.left = parseInt(group.css('left'), 10);

		if (!group.hasClass('tn-group__selected')) {
			elCoordinates.top += parseInt(el.css('top'), 10);
			elCoordinates.left += parseInt(el.css('left'), 10);

			size = tn_getSizeInPx(el);
		} else {
			size = tn_getSizeInPx(group);
		}
	} else {
		elCoordinates.top = parseInt(el.css('top'), 10);
		elCoordinates.left = parseInt(el.css('left'), 10);

		size = tn_getSizeInPx(el);
	}

	elCoordinates.bottom = elCoordinates.top + size.height;
	elCoordinates.right = elCoordinates.left + size.width;

	return elCoordinates;
}

function tn_showOutline(eventType) {
	var $selectedEl = $('.tn-elem__selected');

	if (!$('.tn-elem__on-resize').length && !$selectedEl.hasClass('tn-elem__sbsmode')) {
		$('.tn-outline_' + eventType).removeClass('tn-outline__hidden');
	}
}

function tn_hideOutline(eventType) {
	$('.tn-outline_' + eventType).addClass('tn-outline__hidden');
}

function tn_updateOutlineDescription() {
	var $outline = $('.tn-outline_selected');
	var $sizeBox = $outline.find('.tn-outline__size');
	var $sizeTextBox = $outline.find('.tn-outline__size__text');
	var selectedWidth = Math.round($outline.width());
	var selectedHeight = Math.round($outline.height());
	var $selectedElement = $('.tn-elem__selected');

	$('.tn-outline__size__warning').remove();
	$sizeBox.removeClass('tn-outline__size_warning');

	$sizeTextBox.html(selectedWidth + ' <span class="tn-outline__size__text">&#215;</span> ' + selectedHeight);
	if ($selectedElement.length === 1 && elem__getFieldValue($selectedElement, 'amazonsrc') === 'y') {
		var warningIcon =
			'<span class="tn-outline__size__warning">' +
			'<svg x="0px" y="0px" viewBox="0 0 192.146 192.146" style="enable-background:new 0 0 192.146 192.146;" xml:space="preserve">' +
			'<g>' +
			'<g>' +
			'<g>' +
			'<path style="fill:#ffffff;" d="M108.186,144.372c0,7.054-4.729,12.32-12.037,12.32h-0.254c-7.054,0-11.92-5.266-11.92-12.32' +
			'c0-7.298,5.012-12.31,12.174-12.31C103.311,132.062,108.059,137.054,108.186,144.372z M88.44,125.301h15.447l2.951-61.298H85.46' +
			'L88.44,125.301z M190.372,177.034c-2.237,3.664-6.214,5.921-10.493,5.921H12.282c-4.426,0-8.51-2.384-10.698-6.233' +
			'c-2.159-3.849-2.11-8.549,0.147-12.349l84.111-149.22c2.208-3.722,6.204-5.96,10.522-5.96h0.332' +
			'c4.445,0.107,8.441,2.618,10.513,6.546l83.515,149.229C192.717,168.768,192.629,173.331,190.372,177.034z M179.879,170.634' +
			'L96.354,21.454L12.292,170.634H179.879z"/>' +
			'</g>' +
			'</g>' +
			'</g>' +
			'</svg>' +
			'</span>';
		$sizeBox.append(warningIcon);
	}
}

function tn_relocateOutlineDescription(angle) {
	var $description = $('.tn-outline__size');

	switch (true) {
		case (angle >= 0 && angle < 45) || (angle >= 315 && angle < 360):
			$description.css({
				'top': 'auto',
				'left': '50%',
				'bottom': '-25px',
				'right': 'auto',
				'transform-origin': '',
				'transform': '',
			});

			break;

		case angle >= 45 && angle < 135:
			$description.css({
				'top': '50%',
				'left': 'auto',
				'bottom': 'auto',
				'right': '-25px',
				'transform-origin': 'right top',
				'transform': 'rotate(-90deg) translate(50%, -100%)',
			});

			break;

		case angle >= 135 && angle < 225:
			$description.css({
				'top': '-25px',
				'left': '50%',
				'bottom': 'auto',
				'right': 'auto',
				'transform-origin': 'center',
				'transform': 'rotate(180deg) translateX(50%)',
			});

			break;

		case angle >= 225 && angle < 315:
			$description.css({
				'top': '50%',
				'left': '-25px',
				'bottom': 'auto',
				'right': 'auto',
				'transform-origin': 'left top',
				'transform': 'rotate(90deg) translate(-50%, -100%)',
			});

			break;
	}
}

function tn_showResizeAnchors(elems) {
	var textItemsCount = elems.filter('[data-elem-type="text"], [data-elem-type="form"]').length;
	var $outline = $('.tn-outline_selected');
	var anchorNames;

	if (elems.length === textItemsCount) {
		anchorNames = ['w', 'e'];
		$outline.addClass('tn-outline_text-selected');
	} else {
		anchorNames = ['all'];
		$outline.removeClass('tn-outline_text-selected');
	}

	$outline.resizable('option', 'handles', anchorNames.join());
}

function tn_getSizeInPx(el) {
	return {
		width: Math.round(el.width()),
		height: Math.round(el.height()),
	};
}
