function tn_checkAlignment() {
	var selectedElems = document.querySelectorAll(
		'.tn-elem__selected:not([data-field-groupid-value]), .tn-group__open .tn-elem__selected, .tn-group__selected',
	);
	var elemsArr = Array.prototype.slice.call(selectedElems);
	var isAlign = {
		vertical: true,
		horizontal: true,
	};

	var elemsSortedByTop;
	var elemsSortedByLeft;
	var verticalGap;
	var horizontalGap;
	var currentVerticalGap;
	var currentHorizontalGap;

	if (selectedElems.length > 1) {
		// vertical spacing check

		elemsSortedByTop = smartAlign__sortBy('top', elemsArr).slice(0);
		verticalGap = Math.round(
			elemsSortedByTop[1].getBoundingClientRect().top - elemsSortedByTop[0].getBoundingClientRect().bottom,
		);

		for (var j = 1; j < elemsSortedByTop.length; j++) {
			currentVerticalGap = Math.round(
				elemsSortedByTop[j].getBoundingClientRect().top - elemsSortedByTop[j - 1].getBoundingClientRect().bottom,
			);

			if (
				currentVerticalGap !== verticalGap ||
				elemsSortedByTop[j].getBoundingClientRect().left >= elemsSortedByTop[j - 1].getBoundingClientRect().right ||
				elemsSortedByTop[j].getBoundingClientRect().right <= elemsSortedByTop[j - 1].getBoundingClientRect().left
			) {
				isAlign.vertical = false;
			}
		}

		// horizontal spacing check

		elemsSortedByLeft = smartAlign__sortBy('left', elemsArr).slice(0);
		horizontalGap = Math.round(
			elemsSortedByLeft[1].getBoundingClientRect().left - elemsSortedByLeft[0].getBoundingClientRect().right,
		);

		for (var k = 1; k < elemsSortedByLeft.length; k++) {
			currentHorizontalGap = Math.round(
				elemsSortedByLeft[k].getBoundingClientRect().left - elemsSortedByLeft[k - 1].getBoundingClientRect().right,
			);

			if (
				currentHorizontalGap !== horizontalGap ||
				elemsSortedByLeft[k].getBoundingClientRect().top >= elemsSortedByLeft[k - 1].getBoundingClientRect().bottom ||
				elemsSortedByLeft[k].getBoundingClientRect().bottom <= elemsSortedByLeft[k - 1].getBoundingClientRect().top
			) {
				isAlign.horizontal = false;
			}
		}
	} else {
		isAlign.vertical = false;
		isAlign.horizontal = false;
	}

	return isAlign;
}

function tn_createSpacingControls() {
	var isAlign = tn_checkAlignment();

	tn_destroyTidyControls();

	if (isAlign.horizontal) {
		tn_createHorizontalSpacingControls();
	} else if (isAlign.vertical) {
		tn_createVerticalSpacingControls();
	}

	if (isAlign.vertical || isAlign.horizontal) spacingControls__addShowOnHoverEvent();
}

function tn_createVerticalSpacingControls() {
	var topCoords = tn_getTidyVerticalControlsCoords();
	var controlsWidth = 20;
	var outlineClientRect = document.querySelector('.tn-outline_selected').getBoundingClientRect();
	var leftCoord =
		(outlineClientRect.left + window.scrollX + (outlineClientRect.width - controlsWidth * window.tn.zoom) / 2) /
		window.tn.zoom;

	tn_renderTidyVerticalControls(topCoords, leftCoord, controlsWidth);
}

function tn_createVerticalRangeRects(elemsArr) {
	var topCoords = tn_getTidyVerticalRangesCoords(elemsArr);
	var rectHeights = tn_getTidyVerticalRectsHeights(elemsArr);
	var rects = tn_renderTidyVerticalRangeRects(elemsArr, topCoords, rectHeights);

	return rects;
}

function tn_renderTidyVerticalRangeRects(elemsArr, topArr, heightArr) {
	var rangesWrapper = window.tn.tidyControlsState.rangesWrapper;
	var rectsCount = topArr.length;
	var rectsArr = [];
	var currentRect;
	var currentRectWidth;
	var prevElLeft;
	var nextElLeft;
	var prevElRight;
	var nextElRight;
	var currentRectRight;
	var currentRectLeft;

	for (var i = 0; i < rectsCount; i++) {
		currentRect = document.createElement('div');
		currentRect.classList.add('tn-tidy-range', 'tn-tidy-range_vertical');

		prevElLeft = elemsArr[i].getBoundingClientRect().left;
		nextElLeft = elemsArr[i + 1].getBoundingClientRect().left;

		currentRectLeft =
			prevElLeft > nextElLeft
				? (prevElLeft + window.scrollX) / window.tn.zoom
				: (nextElLeft + window.scrollX) / window.tn.zoom;

		prevElRight = elemsArr[i].getBoundingClientRect().right;
		nextElRight = elemsArr[i + 1].getBoundingClientRect().right;

		currentRectRight =
			prevElRight < nextElRight
				? (prevElRight + window.scrollX) / window.tn.zoom
				: (nextElRight + window.scrollX) / window.tn.zoom;

		currentRectWidth = currentRectRight - currentRectLeft;

		currentRect.style.width = currentRectWidth + 'px';
		currentRect.style.height = heightArr[i] + 'px';
		currentRect.style.top = topArr[i] + 'px';
		currentRect.style.left = currentRectLeft + 'px';
		currentRect.index = i + 1;

		rangesWrapper.appendChild(currentRect);

		rectsArr.push(currentRect);
	}

	return rectsArr;
}

function tn_getTidyVerticalRangesCoords(elemsArr) {
	var coordsArray = [];

	for (var i = 0; i < elemsArr.length - 1; i++) {
		coordsArray.push((elemsArr[i].getBoundingClientRect().bottom + window.scrollY) / window.tn.zoom);
	}

	return coordsArray;
}

function tn_getTidyVerticalRectsHeights(elemsArr) {
	var heights = [];

	for (var i = 0; i < elemsArr.length - 1; i++) {
		heights.push(elemsArr[i + 1].getBoundingClientRect().top - elemsArr[i].getBoundingClientRect().bottom);
	}

	return heights;
}

function tn_getTidyVerticalControlsCoords() {
	var elemsList = document.querySelectorAll(
		'.tn-elem__selected:not([data-field-groupid-value]), .tn-group__open .tn-elem__selected, .tn-group__selected',
	);
	var elemsArr = Array.prototype.slice.call(elemsList);
	var sortedElems = smartAlign__sortBy('top', elemsArr);
	var coordsArray = [];
	var currentTopCoord;

	for (var i = 0; i < sortedElems.length - 1; i++) {
		currentTopCoord =
			(Math.round(
				(sortedElems[i + 1].getBoundingClientRect().top + sortedElems[i].getBoundingClientRect().bottom) / 2,
			) +
				window.scrollY) /
			window.tn.zoom;
		coordsArray.push(currentTopCoord);
	}

	return coordsArray;
}

function tn_renderTidyVerticalControls(topArr, left, width) {
	var controlsWrapper = window.tn.tidyControlsState.controlsWrapper;
	var controlsCount = topArr.length;
	var currentControl;

	for (var i = 0; i < controlsCount; i++) {
		currentControl = document.createElement('div');
		currentControl.classList.add('tn-tidy-control', 'tn-tidy-control_vertical');

		currentControl.style.width = width + 'px';
		currentControl.style.top = topArr[i] + 'px';
		currentControl.style.left = left + 'px';
		currentControl.index = i + 1;

		tn_addTidyVerticalEvents(currentControl);

		window.tn.tidyControlsState.setVertical(currentControl, i + 1);

		controlsWrapper.appendChild(currentControl);
	}
}

function tn_addTidyVerticalEvents(control) {
	var sortedElems;
	var hint;
	var rangeRects;

	$(control).draggable({
		axis: 'y',
		start: function () {
			var elemsList = document.querySelectorAll(
				'.tn-elem__selected:not([data-field-groupid-value]), .tn-group__open .tn-elem__selected, .tn-group__selected',
			);
			var elemsArr = Array.prototype.slice.call(elemsList);

			sortedElems = smartAlign__sortBy('top', elemsArr);

			tn_undo__Add('elem_save', $('.tn-elem__selected'));

			hint = document.querySelector('.tn-spacing-hint');
			rangeRects = tn_createVerticalRangeRects(sortedElems);

			tn_hideOutline('selected');
			tn_hideTidyControls();

			tn_showSpacingHint();
		},
		drag: function (event) {
			var controlsCount = window.tn.tidyControlsState.verticals.length;
			var movementY = event.originalEvent.originalEvent.movementY;
			var hasEqualElemsTop = false;
			var throttledSetHintPosiiton = t_throttle(tn_setSpacingHintPosition, 20);
			var firstElemBottom = sortedElems[0].getBoundingClientRect().bottom;
			var secondElemTop = sortedElems[1].getBoundingClientRect().top;
			var currentElTop;
			var prevElTop;
			var elemMovement;
			var prevElemMovement;

			tn_setSpacingHintValue(hint, firstElemBottom, secondElemTop);
			throttledSetHintPosiiton(hint, event.pageX, event.pageY);

			for (var i = 1; i < controlsCount + 1; i++) {
				elemMovement = movementY * i;
				prevElemMovement = movementY * (i - 1);

				currentElTop = sortedElems[i].getBoundingClientRect().top;
				prevElTop = sortedElems[i - 1].getBoundingClientRect().top;

				if (currentElTop + elemMovement <= prevElTop + prevElemMovement) {
					hasEqualElemsTop = true;
				}
			}

			if (!hasEqualElemsTop) {
				for (var j = 1; j < controlsCount + 1; j++) {
					elemMovement = movementY * j;
					sortedElems[j].style.top = parseInt(sortedElems[j].style.top, 10) + elemMovement + 'px';
				}

				tn_setVerticalRectsCoords(sortedElems, rangeRects);
			}
		},
		stop: function () {
			smartAlign__elems__Save__currentPosition();

			setTimeout(function () {
				smartAlign__setElemsFieldValues(window.smartAlign__rowsObj.elems.averageVerticalPadding, 'vertical');
			}, 1);

			tn_destroyTidyRangeRects();

			if (window.tn.tidyControlsState.verticals.length) tn_setTidyVerticalsPosition();
			if (window.tn.tidyControlsState.horizontals.length) tn_setTidyHorizontalsPosition();

			tn_hideSpacingHint();
			tn_showTidyControls();

			tn_setOutlinePosition('selected');
			tn_showOutline('selected');
		},
	});
}

function tn_setVerticalRectsCoords(elemsArr, rects) {
	var prevElBottom;
	var nextElTop;
	var currentRect;

	for (var i = 0; i < rects.length; i++) {
		currentRect = rects[i];

		prevElBottom = elemsArr[i].getBoundingClientRect().bottom;
		nextElTop = elemsArr[i + 1].getBoundingClientRect().top;

		if (prevElBottom <= nextElTop) {
			currentRect.style.top = (prevElBottom + window.scrollY) / window.tn.zoom + 'px';
			currentRect.style.height = (nextElTop - prevElBottom) / window.tn.zoom + 'px';
		}
		if (prevElBottom > nextElTop) {
			currentRect.style.top = (nextElTop + window.scrollY) / window.tn.zoom + 'px';
			currentRect.style.height = (prevElBottom - nextElTop) / window.tn.zoom + 'px';
		}
	}
}

function tn_setTidyVerticalsPosition() {
	var controls = window.tn.tidyControlsState.verticals;
	var topCoords = tn_getTidyVerticalControlsCoords();
	var outlineCoords = document.querySelector('.tn-outline_selected').getBoundingClientRect();
	var width = 20;

	for (var i = 0; i < controls.length; i++) {
		controls[i].control.style.top = topCoords[i] + 'px';
		controls[i].control.style.left =
			(outlineCoords.left + window.scrollX) / window.tn.zoom +
			(outlineCoords.width / window.tn.zoom - width) / 2 +
			'px';
		controls[i].control.style.width = width + 'px';
	}
}

function tn_createHorizontalSpacingControls() {
	var leftCoords = tn_getTidyHorizontalControlsCoords();
	var controlsHeight = 20;
	var outlineClientRect = document.querySelector('.tn-outline_selected').getBoundingClientRect();
	var topCoord =
		(outlineClientRect.top + window.scrollY + (outlineClientRect.height - controlsHeight * window.tn.zoom) / 2) /
		window.tn.zoom;

	tn_renderTidyHorizontalControls(leftCoords, topCoord, controlsHeight);
}

function tn_createHorizontalRangeRects(elemsArr) {
	var leftCoords = tn_getTidyHorizontalRangesCoords(elemsArr);
	var rectWidths = tn_getTidyHorizontalRectsHeights(elemsArr);
	var rects = tn_renderHorizontalRangeRects(elemsArr, leftCoords, rectWidths);

	return rects;
}

function tn_renderHorizontalRangeRects(elemsArr, leftArr, widthArr) {
	var rangesWrapper = window.tn.tidyControlsState.rangesWrapper;
	var rectsCount = leftArr.length;
	var rectsArr = [];
	var currentRect;
	var currentRectHeight;
	var prevElTop;
	var nextElTop;
	var prevElBottom;
	var nextElBottom;
	var currentRectBottom;
	var currentRectTop;

	for (var i = 0; i < rectsCount; i++) {
		currentRect = document.createElement('div');
		currentRect.classList.add('tn-tidy-range', 'tn-tidy-range_vertical');

		prevElTop = elemsArr[i].getBoundingClientRect().top;
		nextElTop = elemsArr[i + 1].getBoundingClientRect().top;

		currentRectTop =
			prevElTop > nextElTop
				? (prevElTop + window.scrollY) / window.tn.zoom
				: (nextElTop + window.scrollY) / window.tn.zoom;

		prevElBottom = elemsArr[i].getBoundingClientRect().bottom;
		nextElBottom = elemsArr[i + 1].getBoundingClientRect().bottom;

		currentRectBottom =
			prevElBottom < nextElBottom
				? (prevElBottom + window.scrollY) / window.tn.zoom
				: (nextElBottom + window.scrollY) / window.tn.zoom;

		currentRectHeight = currentRectBottom - currentRectTop;

		currentRect.style.height = currentRectHeight + 'px';
		currentRect.style.width = widthArr[i] + 'px';
		currentRect.style.left = leftArr[i] + 'px';
		currentRect.style.top = currentRectTop + 'px';
		currentRect.index = i + 1;

		rangesWrapper.appendChild(currentRect);

		rectsArr.push(currentRect);
	}

	return rectsArr;
}

function tn_getTidyHorizontalRangesCoords(elemsArr) {
	var coordsArray = [];

	for (var i = 0; i < elemsArr.length - 1; i++) {
		coordsArray.push((elemsArr[i].getBoundingClientRect().right + window.scrollX) / window.tn.zoom);
	}

	return coordsArray;
}

function tn_getTidyHorizontalRectsHeights(elemsArr) {
	var widths = [];

	for (var i = 0; i < elemsArr.length - 1; i++) {
		widths.push(
			(elemsArr[i + 1].getBoundingClientRect().right - elemsArr[i].getBoundingClientRect().left) / window.tn.zoom,
		);
	}

	return widths;
}

function tn_getTidyHorizontalControlsCoords() {
	var elemsList = document.querySelectorAll(
		'.tn-elem__selected:not([data-field-groupid-value]), .tn-group__open .tn-elem__selected, .tn-group__selected',
	);
	var elemsArr = Array.prototype.slice.call(elemsList);
	var sortedElems = smartAlign__sortBy('left', elemsArr);
	var coordsArray = [];
	var currentLeftCoord;

	for (var i = 0; i < sortedElems.length - 1; i++) {
		currentLeftCoord =
			(Math.round(
				(sortedElems[i + 1].getBoundingClientRect().left + sortedElems[i].getBoundingClientRect().right) / 2,
			) +
				window.scrollX) /
			window.tn.zoom;

		coordsArray.push(currentLeftCoord);
	}

	return coordsArray;
}

function tn_renderTidyHorizontalControls(leftArr, top, height) {
	var controlsWrapper = window.tn.tidyControlsState.controlsWrapper;
	var controlsCount = leftArr.length;
	var currentControl;

	for (var i = 0; i < controlsCount; i++) {
		currentControl = document.createElement('div');
		currentControl.classList.add('tn-tidy-control', 'tn-tidy-control_horizontal');

		currentControl.style.height = height + 'px';
		currentControl.style.left = leftArr[i] + 'px';
		currentControl.style.top = top + 'px';
		currentControl.index = i + 1;

		tn_addTidyHorizontalEvents(currentControl);

		window.tn.tidyControlsState.setHorizontal(currentControl, i + 1);

		controlsWrapper.appendChild(currentControl);
	}
}

function tn_addTidyHorizontalEvents(control) {
	var sortedElems;
	var hint;
	var rangeRects;

	$(control).draggable({
		axis: 'x',
		start: function () {
			var elemsList = document.querySelectorAll(
				'.tn-elem__selected:not([data-field-groupid-value]), .tn-group__open .tn-elem__selected, .tn-group__selected',
			);
			var elemsArr = Array.prototype.slice.call(elemsList);

			sortedElems = smartAlign__sortBy('left', elemsArr);
			rangeRects = tn_createHorizontalRangeRects(sortedElems);
			hint = document.querySelector('.tn-spacing-hint');

			tn_undo__Add('elem_save', $('.tn-elem__selected'));

			tn_showSpacingHint();

			tn_hideOutline('selected');
			tn_hideTidyControls();
		},
		drag: function (event) {
			var controlsCount = window.tn.tidyControlsState.horizontals.length;
			var movementX = event.originalEvent.originalEvent.movementX;
			var hasEqualElemsleft = false;
			var throttledSetHintPosition = t_throttle(tn_setSpacingHintPosition, 20);
			var firstElemRight = sortedElems[0].getBoundingClientRect().right;
			var secondElemLeft = sortedElems[1].getBoundingClientRect().left;
			var currentElLeft;
			var prevElLeft;
			var elemMovement;
			var prevElemMovement;

			tn_setSpacingHintValue(hint, firstElemRight, secondElemLeft);
			throttledSetHintPosition(hint, event.pageX, event.pageY);

			for (var i = 1; i < controlsCount + 1; i++) {
				elemMovement = movementX * i;
				prevElemMovement = movementX * (i - 1);

				currentElLeft = sortedElems[i].getBoundingClientRect().left;
				prevElLeft = sortedElems[i - 1].getBoundingClientRect().left;

				if (currentElLeft + elemMovement <= prevElLeft + prevElemMovement) {
					hasEqualElemsleft = true;
				}
			}

			if (!hasEqualElemsleft) {
				for (var j = 1; j < controlsCount + 1; j++) {
					elemMovement = movementX * j;
					sortedElems[j].style.left = parseInt(sortedElems[j].style.left, 10) + elemMovement + 'px';
				}

				tn_setHorizontalRectsCoords(sortedElems, rangeRects);
			}
		},
		stop: function () {
			tn_setOutlinePosition('selected');
			tn_showOutline('selected');

			smartAlign__elems__Save__currentPosition();

			setTimeout(function () {
				smartAlign__setElemsFieldValues(window.smartAlign__rowsObj.elems.averageHorizontalPadding, 'horizontal');
			}, 1);

			tn_destroyTidyRangeRects();

			if (window.tn.tidyControlsState.verticals.length) tn_setTidyVerticalsPosition();
			if (window.tn.tidyControlsState.horizontals.length) tn_setTidyHorizontalsPosition();

			tn_hideSpacingHint();
			tn_showTidyControls();
		},
	});
}

function tn_setHorizontalRectsCoords(elemsArr, rects) {
	var prevElRight;
	var nextElLeft;
	var currentRect;

	for (var i = 0; i < rects.length; i++) {
		currentRect = rects[i];

		prevElRight = elemsArr[i].getBoundingClientRect().right;
		nextElLeft = elemsArr[i + 1].getBoundingClientRect().left;

		if (prevElRight <= nextElLeft) {
			currentRect.style.left = (prevElRight + window.scrollX) / window.tn.zoom + 'px';
			currentRect.style.width = (nextElLeft - prevElRight) / window.tn.zoom + 'px';
		}
		if (prevElRight > nextElLeft) {
			currentRect.style.left = (nextElLeft + window.scrollX) / window.tn.zoom + 'px';
			currentRect.style.width = (prevElRight - nextElLeft) / window.tn.zoom + 'px';
		}
	}
}

function tn_setTidyHorizontalsPosition() {
	var controls = window.tn.tidyControlsState.horizontals;
	var leftCoords = tn_getTidyHorizontalControlsCoords();
	var outlineCoords = document.querySelector('.tn-outline_selected').getBoundingClientRect();
	var height = 20;
	var currentTop;

	for (var i = 0; i < controls.length; i++) {
		currentTop =
			(outlineCoords.top + window.scrollY) / window.tn.zoom + (outlineCoords.height / window.tn.zoom - height) / 2;

		controls[i].control.style.left = leftCoords[i] + 'px';
		controls[i].control.style.top = currentTop + 'px';
		controls[i].control.style.height = height + 'px';
	}
}

function tn_destroyTidyControls() {
	if (window.tn.tidyControlsState) {
		window.tn.tidyControlsState.controlsWrapper.innerHTML = '';
		spacingControls__removeShowOnHoverEvent();
		window.tn.tidyControlsState.clearState();
	}
}

function tn_destroyTidyRangeRects() {
	window.tn.tidyControlsState.rangesWrapper.innerHTML = '';
}

function tn_hideTidyControls() {
	var controlsArr = window.tn.tidyControlsState.verticals.concat(window.tn.tidyControlsState.horizontals);

	controlsArr.forEach(function (controlObj) {
		controlObj.control.style.opacity = 0;
	});
}

function tn_showTidyControls() {
	var controlsArr = window.tn.tidyControlsState.verticals.concat(window.tn.tidyControlsState.horizontals);

	controlsArr.forEach(function (controlObj) {
		controlObj.control.style.opacity = 1;
	});
}

function tn_createTidyControlsWrapper() {
	var controlsWrapper = document.createElement('div');
	var layout = document.querySelector('.tn-layout');

	controlsWrapper.classList.add('tn-tidy-controls-wrpr');

	window.tn.tidyControlsState.setControlsWrapper(controlsWrapper);

	layout.appendChild(controlsWrapper);
}

function tn_createTidyRangesWrapper() {
	var rangesWrapper = document.createElement('div');
	var layout = document.querySelector('.tn-layout');

	rangesWrapper.classList.add('tn-tidy-range-wrpr');

	window.tn.tidyControlsState.setRangesWrapper(rangesWrapper);

	layout.appendChild(rangesWrapper);
}

function tn_createTidyControlsStorage() {
	var state = {
		controlsWrapper: null,
		rangesWrapper: null,
		verticals: [],
		horizontals: [],

		setControlsWrapper: function (wrapper) {
			this.controlsWrapper = wrapper;
		},

		setRangesWrapper: function (wrapper) {
			this.rangesWrapper = wrapper;
		},

		setVertical: function (control, index) {
			this.verticals.push({
				control: control,
				index: index,
			});
		},

		setHorizontal: function (control, index) {
			this.horizontals.push({
				control: control,
				index: index,
			});
		},

		clearState: function () {
			this.verticals.splice(0, this.verticals.length);
			this.horizontals.splice(0, this.horizontals.length);
		},
	};

	window.tn.tidyControlsState = state;
}

function spacingControls__addShowOnHoverEvent() {
	document.addEventListener('mousemove', spacingControls__showOnHoverHandler);
}

function spacingControls__removeShowOnHoverEvent() {
	document.removeEventListener('mousemove', spacingControls__showOnHoverHandler);
}

function spacingControls__showOnHoverHandler(event) {
	var outline = document.querySelector('.tn-outline_selected');
	var outlineCoords = outline.getBoundingClientRect();

	if (
		event.x > outlineCoords.left &&
		event.x < outlineCoords.right &&
		event.y > outlineCoords.top &&
		event.y < outlineCoords.bottom
	) {
		tn_showTidyControls();
	} else {
		tn_hideTidyControls();
	}
}

function tn_createSpacingHint() {
	var layout = document.querySelector('.tn-layout');
	var hint = document.createElement('div');

	hint.classList.add('tn-spacing-hint');
	layout.appendChild(hint);
}

function tn_showSpacingHint() {
	var hint = document.querySelector('.tn-spacing-hint');
	hint.style.display = 'block';
}

function tn_hideSpacingHint() {
	var hint = document.querySelector('.tn-spacing-hint');
	hint.style.display = 'none';
}

function tn_setSpacingHintPosition(hint, mouseX, mouseY) {
	var hintCoords = {
		left: (mouseX + 20) / window.tn.zoom,
		top: (mouseY - 20) / window.tn.zoom,
	};

	hint.style.transform = 'translate(' + hintCoords.left + 'px, ' + hintCoords.top + 'px)';
}

function tn_setSpacingHintValue(hint, prevElEnd, nextElStart) {
	var value = Math.round((nextElStart - prevElEnd) / window.tn.zoom);
	hint.innerHTML = value;

	return value;
}
