function smartAlignElements() {
	tn_console('func: smartAlignElements');

	window.smartAlign__rowsObj = smartAlign__getRowsObj();
	smartAlign__setRowParams();

	smartAlign__setHorizontalAlignBasedOnMinLeft();

	smartAlign__calcAveragePaddingForRows();
	smartAlign__setHorizontalAveragePaddingInRow();

	smartAlign__setTopForElemsInRow();

	smartAlign__calcRowsVerticalAveragePadding();
	smartAlign__setRowsVerticalAveragePadding();

	smartAlign__elems__Save__currentPosition();
	smartAlign__setElemsFieldValues();

	tn_setOutlinePosition('selected');

	tn_destroyTidyControls();
	tn_createSpacingControls();

	tn_multiEdit__updateUi();
}

function setAverageHorizontalPadding(value) {
	tn_console('func: setAverageHorizontalPadding');
	window.smartAlign__rowsObj = smartAlign__getRowsObj();
	smartAlign__setRowParams();

	smartAlign__setHorizontalAlignBasedOnMinLeft();
	smartAlign__setHorizontalAveragePaddingInRow(value);

	smartAlign__elems__Save__currentPosition();
	smartAlign__setElemsFieldValues(value, 'horizontal');

	tn_setOutlinePosition('selected');

	tn_destroyTidyControls();
	tn_createSpacingControls();
}

function setAverageVerticalPadding(value) {
	window.smartAlign__rowsObj = smartAlign__getRowsObj();
	smartAlign__setRowParams();

	smartAlign__setRowsVerticalAveragePadding(value);
	smartAlign__elems__Save__currentPosition();
	smartAlign__setElemsFieldValues(value, 'vertical');

	tn_setOutlinePosition('selected');

	tn_destroyTidyControls();
	tn_createSpacingControls();
}

function smartAlign__elems__setSpacingFieldValues() {
	tn_console('func: smartAlign__elems__setSpacingFieldValues');
	smartAlign__calcAverageSpacing();
	var comparisonSpacingResults = smartAlign__checkEqualCurrentAndCalcSpacings();
	if (comparisonSpacingResults.vertical === true && comparisonSpacingResults.horizontal === true) {
		smartAlign__setElemsFieldValues();
	} else if (comparisonSpacingResults.vertical === true) {
		smartAlign__setElemsFieldValues(null, 'vertical');
	} else if (comparisonSpacingResults.horizontal === true) {
		smartAlign__setElemsFieldValues(null, 'horizontal');
	}
}

function smartAlign__calcAverageSpacing() {
	tn_console('func: smartAlign__calcAverageSpacing');
	window.smartAlign__rowsObj = smartAlign__getRowsObj();
	smartAlign__setRowParams();
	smartAlign__calcAveragePaddingForRows();
	smartAlign__calcRowsVerticalAveragePadding();
}

function smartAlign__getElemsDOMArray() {
	tn_console('func: smartAlign__getElemsDOMArray');
	var elems = document.querySelectorAll(
		'.tn-group__selected, .tn-elem__selected:not([data-field-groupid-value]), .tn-group__open .tn-elem__selected',
	);
	var elemsArray = [];
	for (var h = 0; h < elems.length; h++) {
		elemsArray.push(elems[h]);
	}

	return elemsArray;
}

function smartAlign__sortElemsBasedOnPosition() {
	tn_console('func: smartAlign__sortElemsBasedOnPosition');
	var elems = smartAlign__getElemsDOMArray();
	elems = smartAlign__sortBy('top', elems);

	var rows = {
		elems: [],
	};
	var row = {
		elems: [],
	};

	for (var i = 0; i < elems.length; i++) {
		var element = elems[i];
		var firstRowElement = row.elems.length === 0 ? element : row.elems[0];

		/* when element top border bigger then first element bottom border
         push current row in array and create new empty row for next elems
         plus one for case when user set valing 0 and elements crossed by borders
        */

		if (smartAlign_getElemAbsRect(element).top + 1 > smartAlign_getElemAbsRect(firstRowElement).bottom) {
			row.elems = smartAlign__sortBy('left', row.elems);
			rows.elems.push(row);
			row = {
				elems: [],
			};
		}

		row.elems.push(element);

		if (elems.length - 1 === i) {
			row.elems = smartAlign__sortBy('left', row.elems);
			rows.elems.push(row);
		}
	}

	var newElems = [];
	rows.elems.forEach(function (row) {
		row.elems.forEach(function (element) {
			newElems.push(element);
		});
	});

	return newElems;
}

function smartAlign__getRowsObj() {
	tn_console('func: smartAlign__getRowsObj');
	var elems = smartAlign__sortElemsBasedOnPosition();

	var rows = {
		elems: [],
	};
	var row = {
		elems: [],
	};

	for (var i = 0; i < elems.length; i++) {
		var element = elems[i];
		var firstRowElement = row.elems.length === 0 ? element : row.elems[0];

		/* when element top border bigger then first element bottom border
         push current row in array and create new empty row for next elems
         plus one for case when user set valing 0 and elements crossed by borders
        */

		if (smartAlign_getElemAbsRect(element).top + 1 > smartAlign_getElemAbsRect(firstRowElement).bottom) {
			// row.elems = smartAlign__sortBy('left', row.elems);
			rows.elems.push(row);
			row = {
				elems: [],
			};
		}

		row.elems.push(element);

		if (elems.length - 1 === i) {
			// row.elems = smartAlign__sortBy('left', row.elems);
			rows.elems.push(row);
		}
	}

	return rows;
}

function smartAlign__setRowParams() {
	tn_console('func: smartAlign__setRowParams');
	var rows = window.smartAlign__rowsObj.elems;
	var minLeftInRows = 100000;
	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var prevRowMaxBottom = i === 0 ? 0 : rows[i - 1].maxBottom;
		var minTopInRow = 100000;
		var maxBottomInRow = 0;

		for (var x = 0; x < currentRow.elems.length; x++) {
			var currentElement = currentRow.elems[x];
			if (smartAlign_getElemAbsRect(currentElement).top < minTopInRow) {
				minTopInRow = smartAlign_getElemAbsRect(currentElement).top;
				// smartAlign_getElemAbsRect(currentElement).top > prevRowMaxBottom
				//   ? smartAlign_getElemAbsRect(currentElement).top
				//   : prevRowMaxBottom;
			}
			if (smartAlign_getElemAbsRect(currentElement).bottom > maxBottomInRow) {
				maxBottomInRow = smartAlign_getElemAbsRect(currentElement).bottom;
			}
			if (smartAlign_getElemAbsRect(currentElement).left < minLeftInRows) {
				minLeftInRows = smartAlign_getElemAbsRect(currentElement).left;
			}
		}

		currentRow.minTop = minTopInRow;
		currentRow.maxBottom = maxBottomInRow;
	}

	window.smartAlign__rowsObj.minLeft = minLeftInRows;
	return rows;
}

function smartAlign__setHorizontalAlignBasedOnMinLeft() {
	tn_console('func: smartAlign__setHorizontalAlignBasedOnMinLeft');
	var rowsMinLeft = window.smartAlign__rowsObj.minLeft;
	var rows = window.smartAlign__rowsObj.elems;

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var alignDistance = 0;
		if (smartAlign_getElemAbsRect(currentRow.elems[0]).left > rowsMinLeft) {
			for (var x = 0; x < currentRow.elems.length; x++) {
				var currentElement = currentRow.elems[x];

				if (x === 0) {
					alignDistance = smartAlign_getElemAbsRect(currentElement).left - rowsMinLeft;
					currentElement.style.left = rowsMinLeft + 'px';
				} else {
					currentElement.style.left = smartAlign_getElemAbsRect(currentElement).left - alignDistance + 'px';
				}
			}
		}
	}

	return rows;
}

function smartAlign__calcAveragePaddingForRows() {
	tn_console('func: smartAlign__calcAveragePaddingForRows');
	var rows = window.smartAlign__rowsObj.elems;

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var elementPaddings = [];
		var elementColumnPaddings = [];
		for (var x = 0; x < currentRow.elems.length; x++) {
			var currentElement = currentRow.elems[x];

			if (x !== 0) {
				var prevElement = currentRow.elems[x - 1];

				// if elem is under the previous – calc padding for column
				if (smartAlign_getElemAbsRect(currentElement).top > smartAlign_getElemAbsRect(prevElement).bottom) {
					var paddingColumn =
						smartAlign_getElemAbsRect(currentElement).top - smartAlign_getElemAbsRect(prevElement).bottom;
					elementColumnPaddings.push(paddingColumn);
					continue;
				}
				var padding = smartAlign_getElemAbsRect(currentElement).left - smartAlign_getElemAbsRect(prevElement).right;
				elementPaddings.push(padding);
			}
		}

		rows[i].averageHorizontalPadding = Math.round(calcMedian(elementPaddings)) || '';
		rows[i].averageVerticalColumnPadding = Math.round(calcMedian(elementColumnPaddings)) || '';
	}

	var rowsPaddings = [];

	for (var y = 0; y < rows.length; y++) {
		// eslint-disable-next-line no-redeclare
		var currentRow = rows[y];
		if (currentRow.averageHorizontalPadding !== 0 && currentRow.averageHorizontalPadding !== '') {
			rowsPaddings.push(currentRow.averageHorizontalPadding);
		}
	}

	rows.averageHorizontalPadding = Math.round(calcMedian(rowsPaddings)) || '';

	return rows;
}

function smartAlign__setHorizontalAveragePaddingInRow(value) {
	tn_console('func: smartAlign__setHorizontalAveragePaddingInRow');
	var rows = window.smartAlign__rowsObj.elems;
	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var averageHorizontalPadding = arguments.length > 0 ? value : rows.averageHorizontalPadding;

		for (var x = 0; x < currentRow.elems.length; x++) {
			var currentElement = currentRow.elems[x];
			if (x !== 0) {
				var prevElement = currentRow.elems[x - 1];

				if (smartAlign_getElemAbsRect(currentElement).top > smartAlign_getElemAbsRect(prevElement).bottom) {
					currentElement.style.left = smartAlign_getElemAbsRect(prevElement).left + 'px';
				} else {
					currentElement.style.left = smartAlign_getElemAbsRect(prevElement).right + averageHorizontalPadding + 'px';
				}
			}
		}
	}
}

function smartAlign__setTopForElemsInRow() {
	tn_console('func: smartAlign__setTopForElemsInRow');
	var rows = window.smartAlign__rowsObj.elems;

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var minTop = rows[i].minTop;
		for (var x = 0; x < currentRow.elems.length; x++) {
			var currentElement = currentRow.elems[x];
			var prevElement = currentRow.elems[x - 1];

			if (x !== 0) {
				/* ignore the current element if it is under the previous */
				if (smartAlign_getElemAbsRect(currentElement).top > smartAlign_getElemAbsRect(prevElement).bottom) {
					continue;
				}
			}

			currentElement.style.top = minTop + 'px';
		}
	}
}

function smartAlign__calcRowsVerticalAveragePadding() {
	tn_console('func: smartAlign__calcRowsVerticalAveragePadding');
	var rows = window.smartAlign__rowsObj.elems;

	var sum = 0;
	var rowsPaddings = [];
	for (var i = 0; i < rows.length; i++) {
		if (i === 0) {
			continue;
		}
		var currentRow = rows[i];
		var prevRow = rows[i - 1];
		var Padding = currentRow.minTop - prevRow.maxBottom;
		rowsPaddings.push(Padding);
	}

	for (var y = 0; y < rowsPaddings.length; y++) {
		sum += rowsPaddings[y];
	}

	var averagePadding = Math.round(sum / rowsPaddings.length || '');
	if (averagePadding !== '' || averagePadding !== 0) {
		rows.averageVerticalPadding = averagePadding;
	}

	return rows;
}

function smartAlign__setRowsVerticalAveragePadding(value) {
	tn_console('func: smartAlign__setRowsVerticalAveragePadding');
	var rows = window.smartAlign__rowsObj.elems;
	var rowsVerticalAveragePadding = arguments.length > 0 ? value : rows.averageVerticalPadding;

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var prevRow = i === 0 ? rows[i] : rows[i - 1];

		for (var x = 0; x < currentRow.elems.length; x++) {
			var newTop =
				rows.length === 1 ? currentRow.averageHorizontalColumnPadding : prevRow.maxBottom + rowsVerticalAveragePadding;
			var currentElement = currentRow.elems[x];
			var prevElement = currentRow.elems[x - 1];
			var prevPosition;
			var columnVerticalAveragePadding = rowsVerticalAveragePadding
				? rowsVerticalAveragePadding
				: currentRow.averageVerticalColumnPadding;

			if (x !== 0) {
				if (
					rows.length !== 1 &&
					smartAlign_getElemAbsRect(currentElement).top > prevPosition.bottom &&
					smartAlign_getElemAbsRect(currentElement).top < smartAlign_getElemAbsRect(prevElement).bottom
				) {
					currentElement.style.top =
						smartAlign_getElemAbsRect(prevElement).bottom + columnVerticalAveragePadding + 'px';
					// continue;
				}

				if (
					smartAlign_getElemAbsRect(currentElement).top > smartAlign_getElemAbsRect(prevElement).bottom &&
					prevPosition &&
					smartAlign_getElemAbsRect(currentElement).top === prevPosition.top
				) {
					/* hack for paddings in columns when set paddings from bigger to smaller */
					// prevElement.style.top = smartAlign_getElemAbsRect(prevElement).top + 1 + "px";
					currentElement.style.top = smartAlign_getElemAbsRect(prevElement).top + 'px';
					// continue;
				}

				if (smartAlign_getElemAbsRect(currentElement).top > smartAlign_getElemAbsRect(prevElement).bottom) {
					currentElement.style.top =
						smartAlign_getElemAbsRect(prevElement).bottom + columnVerticalAveragePadding + 'px';
					// continue;
				}
			}

			prevPosition = {
				top: smartAlign_getElemAbsRect(currentElement).top,
				bottom: smartAlign_getElemAbsRect(currentElement).bottom,
			};

			if (rows.length !== 1) {
				prevPosition = {
					top: smartAlign_getElemAbsRect(currentElement).top,
					bottom: smartAlign_getElemAbsRect(currentElement).bottom,
				};
				if (i !== 0) {
					currentElement.style.top = newTop + 'px';
				}
			}
		}

		smartAlign__setRowParams();
	}
}

function smartAlign__setElemsFieldValues(value, axis) {
	tn_console('func: smartAlign__setElemsFieldValues');
	var rows = window.smartAlign__rowsObj.elems;
	var averageHorizontalPadding = rows.averageHorizontalPadding;
	var averageVerticalPadding = rows.averageVerticalPadding;
	var $tnSettigns = $('.tn-settings');
	var $horizontalSliding = $tnSettigns.find('[data-control-field="horizontalpadding"] .sui-slider');
	var $verticalSliding = $tnSettigns.find('[data-control-field="verticalpadding"] .sui-slider');

	if (axis === 'horizontal') {
		averageHorizontalPadding = value || rows.averageHorizontalPadding;
	} else if (axis === 'vertical') {
		averageVerticalPadding = value || rows.averageVerticalPadding;
	}

	averageVerticalPadding = averageVerticalPadding === 0 ? '' : averageVerticalPadding;
	averageHorizontalPadding = averageHorizontalPadding === 0 ? '' : averageHorizontalPadding;

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		for (var x = 0; x < currentRow.elems.length; x++) {
			if (axis === 'horizontal') {
				$tnSettigns.find('[name=horizontalpadding]').val(averageHorizontalPadding);
				$horizontalSliding.slider('value', averageHorizontalPadding);
			} else if (axis === 'vertical') {
				$tnSettigns.find('[name=verticalpadding]').val(averageVerticalPadding);
				$verticalSliding.slider('value', averageVerticalPadding);
			} else {
				$tnSettigns.find('[name=horizontalpadding]').val(averageHorizontalPadding);
				$horizontalSliding.slider('value', averageHorizontalPadding);
				$tnSettigns.find('[name=verticalpadding]').val(averageVerticalPadding);
				$verticalSliding.slider('value', averageVerticalPadding);
			}
		}
	}
}

function smartAlign__elems__Save__currentPosition() {
	tn_console('func: smartAlign__elems__Save__currentPosition');
	var rows = window.smartAlign__rowsObj.elems;

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		for (var x = 0; x < currentRow.elems.length; x++) {
			var currentElement = $(currentRow.elems[x]);
			if (currentElement.hasClass('tn-group')) {
				group__saveCurrentPosition(currentElement.attr('id'));
				tn_setOutlinePosition('selected');
			} else {
				elem__Save__currentPosition(currentElement);
			}
		}
	}
}

function smartAlign__sortBy(border, array) {
	tn_console('func: smartAlign__sortBy');
	return array.sort(function (a, b) {
		if (smartAlign_getElemAbsRect(a)[border] < smartAlign_getElemAbsRect(b)[border]) {
			return -1;
		} else if (smartAlign_getElemAbsRect(a)[border] > smartAlign_getElemAbsRect(b)[border]) {
			return 1;
		} else {
			return 0;
		}
	});
}

function smartAlign_getElemAbsRect(el) {
	// tn_console('func: smartAlign_getElemAbsRect');
	var elementStyleTop = el.style.top;
	var elementStyleLeft = el.style.left;
	var top = parseInt(elementStyleTop.slice(0, -2));
	var left = parseInt(elementStyleLeft.slice(0, -2));
	var width = Math.round(el.getBoundingClientRect().width);
	var height = Math.round(el.getBoundingClientRect().height);

	// recalc width and height elements if zoom != default

	if (window.tn.zoom !== 1) {
		width = Math.round(width / window.tn.zoom);
		height = Math.round(height / window.tn.zoom);
	}

	var right = left + width;
	var bottom = top + height;
	var centerHorizontal = width / 2;
	var centerVertical = height / 2;
	var centerCoordHorizontal = left + centerHorizontal;
	var centerCoordVertical = top + centerVertical;

	return {
		left: left,
		top: top,
		width: width,
		height: height,
		right: right,
		bottom: bottom,
		centerHorizontal: centerHorizontal,
		centerVertical: centerVertical,
		coordCenterHorizontal: centerCoordHorizontal,
		coordCenterVertical: centerCoordVertical,
	};
}

function smartAlign__checkEqualCurrentAndCalcSpacings() {
	tn_console('func: smartAlign__checkEqualCurrentAndCalcSpacings');
	var rows = window.smartAlign__rowsObj.elems;

	var result = {
		horizontal: true,
		vertical: true,
	};

	for (var i = 0; i < rows.length; i++) {
		var currentRow = rows[i];
		var nextRow = rows[i + 1];

		// check vertical spacing
		if (nextRow && nextRow.minTop - currentRow.maxBottom !== window.smartAlign__rowsObj.elems.averageVerticalPadding) {
			result.vertical = false;
		}

		for (var x = 0; x < currentRow.elems.length; x++) {
			var currentElement = currentRow.elems[x];
			var nextElement = currentRow.elems[x + 1];

			// check horizontal spacing
			if (
				nextElement &&
				smartAlign_getElemAbsRect(nextElement).left - smartAlign_getElemAbsRect(currentElement).right !==
					window.smartAlign__rowsObj.elems.averageHorizontalPadding
			) {
				result.horizontal = false;
			}
		}
	}

	return result;
}

function smartAlign__distributeSpacing(axis) {
	window.smartAlign__rowsObj = smartAlign__getRowsObj();
	var border = axis === 'vertical' ? 'top' : 'left';
	var borderPrev = axis === 'vertical' ? 'bottom' : 'right';
	var elementsArr = smartAlign__sortBy(border, smartAlign__getElemsDOMArray());
	var averageSpacing = smartAlign__calculateSpacing(elementsArr, border, borderPrev);

	smartAlign__setElemsFieldValues(averageSpacing, axis);

	elementsArr.forEach(function (el, i) {
		if (i !== 0 && i !== elementsArr.length - 1) {
			var currentElement = elementsArr[i];
			var prevElement = elementsArr[i - 1];
			var coordCurrent = smartAlign_getElemAbsRect(currentElement)[border];
			var coordPrev = smartAlign_getElemAbsRect(prevElement)[borderPrev];

			var elementsSpacing = coordCurrent - coordPrev;
			var diff = 0;
			diff = averageSpacing - elementsSpacing;

			currentElement.style[border] = coordCurrent + diff + 'px';
		}
	});

	smartAlign__distributeLastElement(elementsArr, border, borderPrev, averageSpacing);
	smartAlign__elems__Save__currentPosition();

	tn_destroyTidyControls();
	tn_createSpacingControls();
}

function smartAlign__calculateSpacing(elementsArr, border, borderPrev) {
	var elementsSpacingArr = [];

	elementsArr.forEach(function (el, i) {
		if (i !== 0) {
			var currentElement = elementsArr[i];
			var prevElement = elementsArr[i - 1];
			var coordCurrent = smartAlign_getElemAbsRect(currentElement)[border];
			var coordPrev = smartAlign_getElemAbsRect(prevElement)[borderPrev];
			var elementsSpacing = coordCurrent - coordPrev;
			elementsSpacingArr.push(elementsSpacing);
		}
	});

	var sumSpacing = elementsSpacingArr.reduce(function (sum, current) {
		return sum + current;
	});

	var averageNumber = sumSpacing / (elementsArr.length - 1);
	averageNumber = Math.round(averageNumber);

	return averageNumber;
}

function smartAlign__distributeLastElement(elementsArr, border, borderPrev, average) {
	var lastElement = elementsArr[elementsArr.length - 1];
	var diffArr = [];
	elementsArr.forEach(function (el, i) {
		if (i !== 0) {
			var currentElement = elementsArr[i];
			var prevElement = elementsArr[i - 1];
			var coordCurrent = smartAlign_getElemAbsRect(currentElement)[border];
			var coordPrev = smartAlign_getElemAbsRect(prevElement)[borderPrev];
			diffArr.push(coordCurrent - coordPrev);
		}
	});
	var isEqual = diffArr.every(function (diff) {
		return diff === average;
	});
	if (!isEqual) {
		lastElement.style[border] =
			smartAlign_getElemAbsRect(lastElement)[border] + (average - diffArr[diffArr.length - 1]) + 'px';
	}
}

function smartAlign__distributeEdges(axis, edge) {
	window.smartAlign__rowsObj = smartAlign__getRowsObj();
	var border = axis === 'vertical' ? 'top' : 'left';
	var elementsArr = smartAlign__sortBy(edge, smartAlign__getElemsDOMArray());
	var averageEdges = smartAlign__calculateEdges(elementsArr, edge);

	elementsArr.forEach(function (el, i) {
		if (i !== 0 && i !== elementsArr.length - 1) {
			var currentElement = elementsArr[i];
			var prevElement = elementsArr[i - 1];
			var coordCurrent = smartAlign_getElemAbsRect(currentElement)[edge];
			var coordPrev = smartAlign_getElemAbsRect(prevElement)[edge];
			var elementsSpacing = coordCurrent - coordPrev;
			var diff = 0;
			diff = averageEdges - elementsSpacing;

			var coordValue = coordCurrent + diff;
			switch (edge) {
				case 'coordCenterHorizontal':
					coordValue = coordValue - smartAlign_getElemAbsRect(currentElement)['centerHorizontal'];
					break;
				case 'right':
					coordValue = coordValue - smartAlign_getElemAbsRect(currentElement)['width'];
					break;
				case 'coordCenterVertical':
					coordValue = coordValue - smartAlign_getElemAbsRect(currentElement)['centerVertical'];
					break;
				case 'bottom':
					coordValue = coordValue - smartAlign_getElemAbsRect(currentElement)['height'];
					break;
			}

			currentElement.style[border] = coordValue + 'px';
		}
	});

	smartAlign__elems__Save__currentPosition();
}

function smartAlign__calculateEdges(elementsArr, edge) {
	var elementsSpacingArr = [];

	elementsArr.forEach(function (el, i) {
		if (i !== 0) {
			var currentElement = elementsArr[i];
			var prevElement = elementsArr[i - 1];
			var coordCurrent = smartAlign_getElemAbsRect(currentElement)[edge];
			var coordPrev = smartAlign_getElemAbsRect(prevElement)[edge];
			var elementsSpacing = coordCurrent - coordPrev;
			elementsSpacingArr.push(elementsSpacing);
		}
	});

	var sumSpacing = elementsSpacingArr.reduce(function (sum, current) {
		return sum + current;
	});

	var averageNumber = sumSpacing / (elementsArr.length - 1);
	averageNumber = parseFloat(averageNumber.toFixed(1));

	return averageNumber;
}
