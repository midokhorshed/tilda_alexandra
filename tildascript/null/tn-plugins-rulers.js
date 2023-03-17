function tn_createRulers() {
	var rulers = $(
		'<div class="tn-rulers-wrpr">' +
			'<div class="tn-ruler tn-ruler_top" data-direction="top">' +
			'<span class="tn-ruler__number"></span>' +
			'</div>' +
			'<div class="tn-ruler tn-ruler_bottom" data-direction="bottom">' +
			'<span class="tn-ruler__number"></span>' +
			'</div>' +
			'<div class="tn-ruler tn-ruler_left" data-direction="left">' +
			'<span class="tn-ruler__number"></span>' +
			'</div>' +
			'<div class="tn-ruler tn-ruler_right" data-direction="right">' +
			'<span class="tn-ruler__number"></span>' +
			'</div>' +
			'</div>',
	);
	rulers.appendTo('.tn-layout');
}

function tn_setRulersPosition() {
	var $selectedEl = $('.tn-elem__selected');
	var $parent;

	if ($selectedEl.length) {
		if ($('.tn-elem__hover, .tn-group__hover').length && !$('.tn-elem__on-resize, .tn-group__on-resize').length) {
			tn_setRelativeRulersPosition($('.tn-outline_hover'));
		} else {
			$parent = $selectedEl.length === 1 ? tn_getOneElContainer($selectedEl) : tn__getElementsContainer($selectedEl);
			tn_setRelativeRulersPosition($parent);
		}
		tn_setRulerNumbers();
	}
}

function tn_setRelativeRulersPosition(target) {
	var $rulers = $('.tn-ruler');
	var targetCoords = tn_getBlockCoords(target);
	var $selectedOutline = $('.tn-outline_selected');
	var $sbsModeElem = $('.tn-elem__sbsmode');
	var selectedItem;
	var selectedCoords;
	var targetPosition;

	selectedItem = $sbsModeElem.length ? $sbsModeElem : $selectedOutline;

	selectedCoords = tn_getBlockCoords(selectedItem);
	targetPosition = tn_getRelativeOutlinePosition(selectedCoords, targetCoords);

	$rulers.each(function () {
		var ruler = $(this);
		var rulerDirection = ruler.attr('data-direction');

		switch (rulerDirection) {
			case 'top':
			case 'bottom':
				tn_setVerticalRulerPosition(ruler, rulerDirection, selectedItem, target, targetPosition);
				break;
			case 'left':
			case 'right':
				tn_setHorizontalRulerPosition(ruler, rulerDirection, selectedItem, target, targetPosition);
				break;
		}
	});
}

function tn_setVerticalRulerPosition(ruler, direction, item, target, targetPosition) {
	var $rulerNumber = ruler.find('.tn-ruler__number');
	var selectedElCoordinates = tn_getBlockCoords(item);
	var targetElCoordinates = tn_getBlockCoords(target);
	var verticalRulerLeft = (selectedElCoordinates.left + selectedElCoordinates.right) / 2;
	var rulerWidth = 0;
	var rulerHeight = 0;
	var rulerTop;
	var rulerBottom;

	if (targetPosition.length) {
		for (var i = 0; i < targetPosition.length; i++) {
			if (targetPosition[i] === direction) {
				if (verticalRulerLeft > targetElCoordinates.right) {
					ruler.css('border-left', 'none').css('border-right', '1px solid red');
					$rulerNumber.css('left', '100%');
				} else if (verticalRulerLeft < targetElCoordinates.left) {
					ruler.css('border-right', 'none').css('border-left', '1px solid red');
					$rulerNumber.css('left', '0');
				}
				ruler.css('border-' + direction, '1px dashed red');
				break;
			} else {
				ruler.css('border-' + direction, '');
				$rulerNumber.css('left', '');
			}
		}

		for (var j = 0; j < targetPosition.length; j++) {
			if (targetPosition[j] === direction) {
				if (verticalRulerLeft > targetElCoordinates.right) {
					rulerWidth = verticalRulerLeft - targetElCoordinates.right;
					verticalRulerLeft -= rulerWidth;
				} else if (verticalRulerLeft < targetElCoordinates.left) {
					rulerWidth = targetElCoordinates.left - verticalRulerLeft;
				}
				rulerHeight = Math.abs(selectedElCoordinates[direction] - targetElCoordinates[direction]) - target.height();
			}
		}

		if (selectedElCoordinates[direction] > targetElCoordinates[direction]) {
			rulerTop = targetElCoordinates[direction] + target.height();
		}
	} else {
		rulerHeight = Math.abs(selectedElCoordinates[direction] - targetElCoordinates[direction]);

		if (
			selectedElCoordinates.right < targetElCoordinates.right &&
			selectedElCoordinates.left < targetElCoordinates.left
		) {
			verticalRulerLeft = (selectedElCoordinates.right + targetElCoordinates.left) / 2;
		} else if (
			selectedElCoordinates.right > targetElCoordinates.right &&
			selectedElCoordinates.left > targetElCoordinates.left
		) {
			verticalRulerLeft = (selectedElCoordinates.left + targetElCoordinates.right) / 2;
		} else if (item.width() > target.width()) {
			verticalRulerLeft = (targetElCoordinates.left + targetElCoordinates.right) / 2;
		} else {
			verticalRulerLeft = (selectedElCoordinates.left + selectedElCoordinates.right) / 2;
		}
	}

	if (selectedElCoordinates[direction] > targetElCoordinates[direction]) {
		rulerBottom = selectedElCoordinates[direction];
		if (!targetPosition.length) rulerTop = targetElCoordinates[direction];
	} else {
		rulerTop = selectedElCoordinates[direction];
		rulerBottom = targetElCoordinates[direction];
	}

	ruler.css({
		width: rulerWidth,
		height: rulerHeight,
		top: rulerTop,
		bottom: rulerBottom,
		left: verticalRulerLeft,
	});
}

function tn_setHorizontalRulerPosition(ruler, direction, item, target, targetPosition) {
	var $rulerNumber = ruler.find('.tn-ruler__number');
	var selectedElCoordinates = tn_getBlockCoords(item);
	var targetElCoordinates = tn_getBlockCoords(target);
	var horizontalRulerTop = (selectedElCoordinates.top + selectedElCoordinates.bottom) / 2;
	var rulerWidth = 0;
	var rulerHeight = 0;
	var rulerLeft;
	var rulerRight;

	if (targetPosition.length) {
		for (var i = 0; i < targetPosition.length; i++) {
			if (targetPosition[i] === direction) {
				if (horizontalRulerTop > targetElCoordinates.bottom) {
					ruler.css('border-top', 'none').css('border-bottom', '1px solid red');
					$rulerNumber.css('top', '100%');
				} else if (horizontalRulerTop < targetElCoordinates.top) {
					ruler.css('border-bottom', 'none').css('border-top', '1px solid red');
					$rulerNumber.css('top', '0');
				}
				ruler.css('border-' + direction, '1px dashed red');
				break;
			} else {
				ruler.css('border-' + direction, '');
				$rulerNumber.css('top', '');
			}
		}

		for (var j = 0; j < targetPosition.length; j++) {
			if (targetPosition[j] === direction) {
				if (horizontalRulerTop > targetElCoordinates.bottom) {
					rulerHeight = horizontalRulerTop - targetElCoordinates.bottom;
					horizontalRulerTop -= rulerHeight;
				} else if (horizontalRulerTop < targetElCoordinates.top) {
					rulerHeight = targetElCoordinates.top - horizontalRulerTop;
				}
				rulerWidth = Math.abs(selectedElCoordinates[direction] - targetElCoordinates[direction]) - target.width();
			}
		}

		if (selectedElCoordinates[direction] > targetElCoordinates[direction]) {
			rulerLeft = targetElCoordinates[direction] + target.width();
		}
	} else {
		rulerWidth = Math.abs(selectedElCoordinates[direction] - targetElCoordinates[direction]);

		if (
			selectedElCoordinates.bottom < targetElCoordinates.bottom &&
			selectedElCoordinates.top < targetElCoordinates.top
		) {
			horizontalRulerTop = (selectedElCoordinates.bottom + targetElCoordinates.top) / 2;
		} else if (
			selectedElCoordinates.bottom > targetElCoordinates.bottom &&
			selectedElCoordinates.top > targetElCoordinates.top
		) {
			horizontalRulerTop = (selectedElCoordinates.top + targetElCoordinates.bottom) / 2;
		} else if (item.height() > target.height()) {
			horizontalRulerTop = (targetElCoordinates.top + targetElCoordinates.bottom) / 2;
		} else {
			horizontalRulerTop = (selectedElCoordinates.top + selectedElCoordinates.bottom) / 2;
		}
	}

	if (selectedElCoordinates[direction] > targetElCoordinates[direction]) {
		rulerRight = selectedElCoordinates[direction];

		if (!targetPosition.length) rulerLeft = targetElCoordinates[direction];
	} else {
		rulerLeft = selectedElCoordinates[direction];
		rulerRight = targetElCoordinates[direction];
	}

	ruler.css({
		width: rulerWidth,
		height: rulerHeight,
		left: rulerLeft,
		right: rulerRight,
		top: horizontalRulerTop,
	});
}

function tn_getOneElContainer($el) {
	var containerType = $el[0].dataset.fieldContainerValue;
	var container = containerType === 'grid' ? $('.tn-canvas-min') : $('.tn-canvas-max');
	return container;
}

function tn__getElementsContainer(selectedEl) {
	var isAllWindow = true;
	selectedEl.each(function (i, el) {
		if (el.dataset.fieldContainerValue === 'grid') {
			isAllWindow = false;
			return false;
		}
	});
	return isAllWindow ? $('.tn-canvas-max') : $('.tn-canvas-min');
}

function tn_getBlockCoords(block) {
	var blockCoords = {
		left: parseInt(block.css('left'), 10),
		top: parseInt(block.css('top'), 10),
	};

	blockCoords.right = blockCoords.left + block.outerWidth();
	blockCoords.bottom = blockCoords.top + block.outerHeight();

	return blockCoords;
}

function tn_getRelativeOutlinePosition(selectCoords, hoverCoords) {
	var targetPosition = [];

	if (selectCoords.left > hoverCoords.right) {
		targetPosition.push('left');
	}

	if (selectCoords.right < hoverCoords.left) {
		targetPosition.push('right');
	}

	if (selectCoords.top > hoverCoords.bottom) {
		targetPosition.push('top');
	}

	if (selectCoords.bottom < hoverCoords.top) {
		targetPosition.push('bottom');
	}

	return targetPosition;
}

function tn_showRulers() {
	if ($('.tn-elem').length > 0) $('.tn-ruler').css('opacity', 1);
}

function tn_hideRulers() {
	$('.tn-ruler').css('opacity', '');
}

function tn_setRulerNumbers() {
	$('.tn-ruler').each(function () {
		var $ruler = $(this);
		var numberContainer = $ruler.find('.tn-ruler__number');
		var rulerDirection = $ruler.attr('data-direction');
		var number;

		switch (rulerDirection) {
			case 'top':
			case 'bottom':
				number = $ruler.height();
				break;

			case 'left':
			case 'right':
				number = $ruler.width();
				break;
		}

		if (number === 0) {
			numberContainer.hide().text('');
		} else {
			number = parseInt(number, 10);
			numberContainer.show().text(number);
		}
	});
}
