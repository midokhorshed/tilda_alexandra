function tn_toggleGrid() {
	if ($('.tn-guides').hasClass('tn-display-none')) {
		tn_showGrid();
	} else {
		tn_hideGrid();
	}
}

function tn_hideGrid() {
	$('.tn-guides').addClass('tn-display-none');
	window.tn_guides_off = 'y';
	if (window.sessionStorage) {
		sessionStorage.setItem('tn_guides_off', 'y');
	}
	$('.tn-more-grid').html('Show Grid');
}

function tn_showGrid() {
	$('.tn-guides').removeClass('tn-display-none');
	window.tn_guides_off = '';
	if (window.sessionStorage) {
		sessionStorage.setItem('tn_guides_off', '');
	}
	$('.tn-more-grid').html('Hide Grid');
}

function ab__changeGridValue($ab, field, value) {
	//TODO добавить возможность фиксировать больше одного значения при изменении параметров сетки
	var res = parseInt(window.tn.curResolution, 10);
	var gridOptions = ab__getGridOptions($ab);
	var lockedField = localStorage.getItem('tzerogridlock');
	gridOptions[field] = value || '';

	for (var gridField in gridOptions) {
		gridOptions[gridField] =
			typeof gridOptions[gridField] === 'number' ? parseFloat(gridOptions[gridField]) : gridOptions[gridField];
	}

	var recalculateWidth = function () {
		gridOptions.columnwidth =
			(res - gridOptions.columngutter * (gridOptions.columns - 1) - 2 * gridOptions.columnmargins) /
			gridOptions.columns;
		gridOptions.columnwidth = parseFloat(gridOptions.columnwidth.toFixed(1));
		if (gridOptions.columnwidth <= 0) {
			gridOptions.columnwidth = 1;
			if (lockedField !== 'columngutter') {
				recalculateGutter();
			}
		}
	};

	var recalculateGutter = function () {
		if (gridOptions.columns == 1) {
			gridOptions.columnwidth = res - 2 * gridOptions.columnmargins;
			gridOptions.columngutter = 0;
		} else {
			gridOptions.columngutter =
				(res - gridOptions.columns * gridOptions.columnwidth - 2 * gridOptions.columnmargins) /
				(gridOptions.columns - 1);
			gridOptions.columngutter = parseFloat(gridOptions.columngutter.toFixed(1));
		}
		if (gridOptions.columngutter < 0) {
			gridOptions.columngutter = 0;
			if (lockedField !== 'columnwidth') {
				recalculateWidth();
			}
		}
	};

	var recalculateMargins = function () {
		gridOptions.columnmargins =
			(res - gridOptions.columns * gridOptions.columnwidth - gridOptions.columngutter * (gridOptions.columns - 1)) / 2;
		gridOptions.columnmargins = Math.floor(gridOptions.columnmargins.toFixed(1));
		if (gridOptions.columnmargins < 0) {
			gridOptions.columnmargins = 0;
			if (lockedField !== 'columngutter') {
				recalculateGutter();
			}
		}
	};

	var updateData = function (updateField) {
		switch (updateField) {
			case 'columnwidth':
				if (lockedField !== 'columngutter') {
					recalculateGutter();
				} else {
					recalculateMargins();
				}
				break;
			case 'columngutter':
				if (lockedField !== 'columnwidth') {
					recalculateWidth();
				} else {
					recalculateMargins();
				}
				break;
			case 'columnmargins':
				if (lockedField !== 'columngutter') {
					recalculateGutter();
				} else {
					recalculateWidth();
				}
				break;
			case 'columns':
				if (lockedField !== 'columnwidth') {
					recalculateWidth();
				} else {
					recalculateGutter();
				}
				break;

			default:
				break;
		}

		var gridOptionsString = JSON.stringify(gridOptions);
		ab__setFieldValue($ab, 'grid', gridOptionsString);
		ab__panelSettings__updateUi($ab, 'columngutter', gridOptions.columngutter);
		ab__panelSettings__updateUi($ab, 'columnwidth', gridOptions.columnwidth);
		ab__panelSettings__updateUi($ab, 'columnmargins', gridOptions.columnmargins);
	};

	updateData(field);
	var isLocalGrid = ab__getFieldValue($ab, 'gridglobal') === 'block';
	if (isLocalGrid && field !== 'gridglobal') ab_setGridLocalProps();
	tn_set_lastChanges();
}

function ab__renderGrid() {
	var $gridContainer = $('.tn-guides');

	var $artboard = $('.tn-artboard');
	var options = ab__getGridOptions($artboard);
	var colors = ab__getGridColors($artboard);

	// columns render
	var canvasLeftOffset = parseInt($('.tn-canvas-min').css('left'), 10);
	var leftOffset = canvasLeftOffset + (parseInt(options.columnmargins, 10) || 0);
	var htmlStr = '';
	var color = colors['gridcolor'];

	var gridopacity = colors['gridopacity'];
	var gridColor = tn_hex2rgb(color);
	gridColor.push(parseFloat(gridopacity) * 100);

	var lineopacity = colors['gridlineopacity'];
	var borderColor = tn_hex2rgb(color);
	borderColor.push(parseFloat(lineopacity) * 100);

	for (var i = 0; i < options.columns; i++) {
		var columnStyle =
			'left: ' +
			leftOffset +
			'px; width: ' +
			options.columnwidth +
			'px; background-color: rgba(' +
			gridColor.join(',') +
			'%); border-color: rgba(' +
			borderColor.join(',') +
			'%);';
		htmlStr += '<div style="' + columnStyle + '" class="tn-guides__column"></div>';
		leftOffset = leftOffset + parseFloat(options.columnwidth) + (parseFloat(options.columngutter) || 0);
	}

	// rows render
	var margins = options.rowmargins;
	if (margins === '') margins = 0;
	var canvasTopOffset = parseInt($('.tn-canvas-min').css('top'), 10);
	var topOffset = canvasTopOffset + parseInt(margins, 10);
	var abHeight = parseInt(ab__getFieldValue($artboard, 'height'), 10);
	var moduleHeightPx = parseInt(options.rowbaseline, 10) * parseInt(options.rowmoduleheight, 10);
	var moduleHeight = parseInt(options.rowmoduleheight, 10);
	var modulesCount =
		Math.floor(abHeight - 2 * parseInt(margins, 10)) / (moduleHeightPx + parseInt(options.rowbaseline, 10));
	if (!moduleHeight) {
		moduleHeightPx = $('.tn-canvas-min').height() - 2 * parseInt(margins, 10);
		modulesCount = 1;
		moduleHeight = parseInt(moduleHeightPx / parseInt(options.rowbaseline, 10), 10);
	}

	if (options.rowbaseline) {
		for (var j = 0; j < modulesCount; j++) {
			var rowStyle =
				'top: ' +
				topOffset +
				'px; height: ' +
				moduleHeightPx +
				'px; ' +
				(options.rowmoduleheight ? 'background-color: rgba(' + gridColor.join(',') + '%);' : '') +
				' border-color: rgba(' +
				borderColor.join(',') +
				'%);';
			htmlStr += '<div style="' + rowStyle + '" class="tn-guides__row">';
			var lineOffset = parseFloat(options.rowbaseline);
			var borderHeight = 2;
			for (var l = 0; l < moduleHeight - 1; l++) {
				var lineStyle =
					'top: ' + (lineOffset - borderHeight) + 'px; background-color: rgba(' + borderColor.join(',') + '%);';
				htmlStr += '<div style="' + lineStyle + '" class="tn-guides__row__line"></div>';
				lineOffset += parseInt(options.rowbaseline, 10);
			}
			htmlStr += '</div>';
			topOffset = topOffset + parseFloat(moduleHeightPx) + parseFloat(options.rowbaseline);
		}
	}

	$gridContainer.html(htmlStr);
}

function ab__getGridColors($artboard) {
	var gridColors = {};

	gridColors.gridcolor = ab__getFieldValue($artboard, 'gridcolor');
	if (!gridColors.gridcolor)
		gridColors.gridcolor =
			window.tn.grid_options && window.tn.grid_options.ab_gridcolor ? window.tn.grid_options.ab_gridcolor : '#0000ff';

	gridColors.gridopacity = ab__getFieldValue($artboard, 'gridopacity');
	if (!gridColors.gridopacity)
		gridColors.gridopacity =
			window.tn.grid_options && window.tn.grid_options.ab_gridopacity ? window.tn.grid_options.ab_gridopacity : '0';

	gridColors.gridlineopacity = ab__getFieldValue($artboard, 'gridlineopacity');
	if (!gridColors.gridlineopacity)
		gridColors.gridlineopacity =
			window.tn.grid_options && window.tn.grid_options.ab_gridlineopacity
				? window.tn.grid_options.ab_gridlineopacity
				: '0.1';

	return gridColors;
}

/**
 * Сначала надо проверить локальные настройки для данного ArtBoard
 *    если они есть => возвращаем их для текущего разрешения
 *
 * Если локальных настроект нет, то берём параметры из глобальных настроек
 *
 * Если глобальных настроек нет, проверяем, дефолтное ли значение.
 *    если дефолтное => возвращаем заготовленные параметры
 *    если не дефолтное => генерируем новые на основе ближайшего дефолтного
 *
 * @param {jQuery} $artboard
 * @param {Number} resolution
 * @returns {object} gridOptions => объект с параметрами для построения грида
 */
function ab__getGridOptions($artboard, resolution) {
	var res = resolution || window.tn.curResolution;
	var localOptions = '';

	// Ищем локально сохранённые параметры и возвращаем их
	if (res === window.tn.topResolution) {
		localOptions = $artboard.attr('data-artboard-grid');
	} else {
		localOptions = $artboard.attr('data-artboard-grid-res-' + res);
	}

	if (localOptions && localOptions.length) {
		return JSON.parse(localOptions);
	}

	// Ищем глобальные параметры (для всех zb на проекте) и возвращаем их
	var globalOptions = $artboard.attr('data-project-zb_grid');
	globalOptions = globalOptions ? JSON.parse(globalOptions) : '';

	if (globalOptions) {
		var globalOptionsRes =
			res === window.tn.topResolution ? globalOptions['ab_grid'] : globalOptions['ab_grid-res-' + res];
		if (globalOptionsRes) return JSON.parse(globalOptionsRes);
	}

	// Если сохранённых параметров нет, возвращаем параметры по умолчанию
	var currentRes = typeof res === 'number' ? res : parseInt(res, 10);
	var defaultOptions = [
		{
			res: 320,
			columns: 4,
			width: 60,
			gutter: 20,
			margins: 10,
		},
		{
			res: 480,
			columns: 6,
			width: 60,
			gutter: 20,
			margins: 10,
		},
		{
			res: 640,
			columns: 8,
			width: 60,
			gutter: 20,
			margins: 10,
		},
		{
			res: 960,
			columns: 12,
			width: 60,
			gutter: 20,
			margins: 10,
		},
		{
			res: 1200,
			columns: 12,
			width: 60,
			gutter: 40,
			margins: 20,
		},
		{
			res: 1440,
			columns: 14,
			width: 60,
			gutter: 40,
			margins: 40,
		},
		{
			res: 1600,
			columns: 16,
			width: 60,
			gutter: 32,
			margins: 80,
		},
		{
			res: 1920,
			columns: 18,
			width: 60,
			gutter: 40,
			margins: 80,
		},
	];

	var isDefaultRes = defaultOptions.some(function (obj) {
		return obj.res === currentRes;
	});

	// Если брейкпоинт пользователя не попадает под стандартные, то находим ближайший стандартный
	// и меняем у него значение Column gutter для корректного отображения
	if (!isDefaultRes) {
		var differences = [];
		var differencesWithScreens = [];
		var closestDefault = 0;

		defaultOptions.forEach(function (defOptions) {
			if (defOptions.res === currentRes) return;
			differences.push(Math.abs(defOptions.res - currentRes));
			differencesWithScreens.push({
				diff: Math.abs(defOptions.res - currentRes),
				res: defOptions.res,
			});
		});

		var minDiff = Math.min.apply(null, differences);
		differencesWithScreens.forEach(function (screen) {
			if (screen.diff === minDiff) closestDefault = screen.res;
		});
	}

	var currentOptions = {};
	defaultOptions.forEach(function (options) {
		if (isDefaultRes) {
			if (options.res === currentRes) currentOptions = options;
		} else {
			if (options.res === closestDefault) currentOptions = options;
		}
	});

	if (!isDefaultRes) {
		var computedGutter =
			(currentRes - currentOptions.columns * currentOptions.width - 2 * currentOptions.margins) /
			(currentOptions.columns - 1);
		currentOptions.gutter = parseFloat(computedGutter.toFixed(1));
	}

	return {
		columns: currentOptions.columns,
		columngutter: currentOptions.gutter,
		columnmargins: currentOptions.margins,
		columnwidth: currentOptions.width,
		rowbaseline: '',
		rowmoduleheight: '',
		rowmargins: '',
	};
}

function ab__resetGrid() {
	var $ab = $('.tn-artboard');
	var isResetCurrentBlock = ab__getFieldValue($ab, 'gridglobal') === 'block';
	window.tn.screens.forEach(function (res) {
		ab__setFieldValue($ab, 'grid', '', res);
	});
	ab__setFieldValue($ab, 'gridcolor', '');
	ab__setFieldValue($ab, 'gridopacity', '');
	ab__setFieldValue($ab, 'gridlineopacity', '');
	ab__setFieldValue($ab, 'gridglobal', '');
	if (!isResetCurrentBlock) {
		$ab.attr('data-project-zb_grid', '');
		window.tn.grid_options = null;
	}
}

function ab_setGridLocalProps() {
	var $ab = $('.tn-artboard');

	window.tn.screens.forEach(function (screen) {
		var gridOptions = ab__getGridOptions($ab, screen);
		if (!gridOptions) return;
		ab__setFieldValue($ab, 'grid', JSON.stringify(gridOptions), screen);
	});

	var gridColorOptions = ab__getGridColors($ab);
	ab__setFieldValue($ab, 'gridcolor', gridColorOptions.gridcolor);
	ab__setFieldValue($ab, 'gridopacity', gridColorOptions.gridopacity);
	ab__setFieldValue($ab, 'gridlineopacity', gridColorOptions.gridlineopacity);
}
