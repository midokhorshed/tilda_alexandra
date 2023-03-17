function addmenu__open() {
	moremenu__close();
	$('.tn-add-wrapper').toggleClass('tn-add-wrapper_opened');
}

function addmenu__close() {
	$('.tn-add-wrapper').removeClass('tn-add-wrapper_opened');
}

function moremenu__open() {
	addmenu__close();
	tn_toggleMoreRedoVisibility();
	$('.tn-more-wrapper').toggleClass('tn-more-wrapper_opened');
}

function moremenu__close() {
	$('.tn-more-wrapper').removeClass('tn-more-wrapper_opened');
}

function tn_drawMainMenu() {
	var str =
		'' +
		'<table class="tn-mainmenu__table">' +
		'<tr class="tn-mainmenu__table__row">' +
		'<td style="width:200px;">' +
		'<div class="tn-add-wrapper"></div>' +
		'</td>' +
		'<td style="width:100%;">' +
		'<div class="tn-res-wrapper"></div>' +
		'</td>' +
		'<td style="width:200px;">' +
		'<div class="tn-rightbtns-wrapper"></div>' +
		'</td>' +
		'</tr>' +
		'</table>';

	$('.tn-mainmenu').html(str);

	tn_drawAddMenu();
	tn_drawResMenu();
	tn_drawMoreMenu();
}

function tn_drawAddMenu() {
	var $container = $('.tn-mainmenu .tn-add-wrapper');
	var htmlAddBtn =
		window.oplan > 0 ? '<div class="tn-add-popup__item tn-add-html" data-type="html">Add HTML</div>' : '';

	var html =
		'' +
		'<div class="tn-add-btn">' +
		'<div class="tn-add-btn__icon"></div>' +
		'</div>' +
		'<div class="tn-add-popup">' +
		'<div class="tn-add-popup__item tn-add-text" data-type="text">Add Text</div>' +
		'<div class="tn-add-popup__item tn-add-image" data-type="image">Add Image</div>' +
		'<div class="tn-add-popup__item tn-add-shape" data-type="shape">Add Shape</div>' +
		'<div class="tn-add-popup__item tn-add-button" data-type="button">Add Button</div>' +
		'<div class="tn-add-popup__item tn-add-video" data-type="video">Add Video</div>' +
		'<div class="tn-add-popup__item tn-add-tooltip" data-type="tooltip">Add Tooltip</div>' +
		htmlAddBtn +
		'<div class="tn-add-popup__item tn-add-form" data-type="form">Add Form</div>' +
		'<div class="tn-add-popup__item tn-add-gallery" data-type="gallery">Add Gallery</div>' +
		'<div class="tn-add-popup__item tn-add-vector" data-type="vector">Add Vector (beta)</div>' +
		'</div>';

	$container.html(html);

	$container.find('.tn-add-btn').click(function () {
		addmenu__open();
		// allelems__unselect();
	});

	$container.find('.tn-add-popup__item').click(function () {
		var elType = $(this).attr('data-type');
		var element;

		addmenu__close();
		if (window.tn.curResolution != window.tn.topResolution) goResolutionMode(window.tn.topResolution);

		switch (elType) {
			case 'text':
				element = addText();
				break;
			case 'image':
				element = addImage();
				break;
			case 'shape':
				element = addShape();
				break;
			case 'button':
				element = addButton();
				break;
			case 'video':
				element = addVideo();
				break;
			case 'tooltip':
				element = addTooltip();
				break;
			case 'html':
				element = addHtml();
				break;
			case 'form':
				element = addForm();
				break;
			case 'gallery':
				element = addGallery();
				break;
			case 'vector':
				element = addVector();
				break;

			default:
				break;
		}

		elem__select(element);

		/* when the element is just selected, you need to draw the position of the tooltip text */
		if (elType == 'tooltip') {
			elem__renderViewOneField(element, 'tipposition');
		}

		tn_undo__Add('elem_add', element);
		tn_set_lastChanges();
		layers__update();
	});
}

function tn_drawResMenu() {
	var $container = $('.tn-mainmenu .tn-res-wrapper');

	var html = '' + '<div class="tn-res-slider">' + '<table>' + '<tr>';

	var s_next;
	window.tn.screens.forEach(function (s, i) {
		if (i < window.tn.screens_cnt - 1) {
			s_next = window.tn.screens[i + 1];
		} else {
			s_next = 'MAX';
		}

		var ico;
		if (s < 480) {
			ico = '320';
		} else if (s < 640) {
			ico = '480';
		} else if (s < 960) {
			ico = '640';
		} else if (s < 1200) {
			ico = '960';
		} else if (s < 1600) {
			ico = '1200';
		} else {
			ico = '1600';
		}

		html +=
			'<td class="tn-res-item tn-res-' +
			s +
			'" data-res="' +
			s +
			'">' +
			'<div class="tn-res-icon tn-res-icon_' +
			ico +
			' tooltip" data-tooltip="SCREENS: ' +
			s +
			'&mdash;' +
			s_next +
			'"></div>' +
			'</td>';
	});

	html +=
		'' +
		'<td class="tn-res-settings"><div class="tn-res-icon tn-res-icon_settings"></div></td>' +
		'</tr>' +
		'</table>' +
		'</div>' +
		'<input type="text" class="tn-res-input" readonly style="border:0; color:#000; width:30px; display:none;">' +
		'<input type="text" class="tn-resmax-input" readonly style="border:0; color:#000; width:30px;  display:none;">';

	$container.html(html);

	$container.find('.tn-res-input').val(window.tn.topResolution);
	$container.find('.tn-resmax-input').val(window.tn.topResolution + 200);

	$container.find('.tn-res-' + window.tn.topResolution).addClass('tn-res-item_active');
	switchResolution(window.tn.topResolution);

	// клик на иконку экрана
	$container.find('.tn-res-item').click(function () {
		tn_console('click: resolution slider item');
		var res = $(this).attr('data-res');
		res = Number(res);
		goResolutionMode(res);
	});

	//клик на иконку настроек
	var $settings = $container.find('.tn-res-settings');
	$settings.find('.tn-res-icon_settings').click(function () {
		tn_console('click: screens settings');
		if ($settings.hasClass('tn-res-settings_active')) {
			tn_screensettings__close($settings);
		} else {
			tn_screensettings__open($settings);
		}
	});
}

function tn_drawMoreMenu() {
	var $container = $('.tn-mainmenu .tn-rightbtns-wrapper');

	var html =
		'' +
		'<table width="100%">' +
		'<tr>' +
		'<td>' +
		'<div class="tn-save-btn">' +
		'<div class="tn-save-btn__icon">Save</div>' +
		'</div>' +
		'</td>' +
		'<td>' +
		'<div class="tn-close-btn">' +
		'<div class="tn-close-btn__icon">Close</div>' +
		'</div>' +
		'</td>' +
		'<td>' +
		'<div class="tn-help-btn">' +
		'<div class="tn-close-btn__icon">?</div>' +
		'</div>' +
		'</td>' +
		'<td>' +
		'<div class="tn-more-wrapper">' +
		'<div class="tn-more-btn">' +
		'<div class="tn-more-btn__icon">...</div>' +
		'</div>' +
		'<div class="tn-more-popup">' +
		'<table class="tn-more-table">' +
		'<tr>' +
		'<td class="tn-more-table__left">' +
		'<div class="tn-more-popup__item tn-more-redo">Redo</div>' +
		'<div class="tn-more-popup__item tn-more-undo">Undo</div>' +
		'<div class="tn-more-popup__item tn-more-grid">Hide Grid</div>' +
		'<div class="tn-more-popup__item tn-more-sett">Show Settings</div>' +
		'<div class="tn-more-popup__item tn-more-ui">Hide UI</div>' +
		'<div class="tn-more-popup__item tn-more-layers">Show Layers</div>' +
		'<div class="tn-more-popup__item tn-more-zoom-in">Zoom In</div>' +
		'<div class="tn-more-popup__item tn-more-zoom-out">Zoom Out</div>' +
		'<div class="tn-more-popup__item tn-more-figma">Import</div>' +
		'<div class="tn-more-popup__item tn-more-settings">Open Zero Block Settings</div>' +
		'<div class="tn-more-popup__item tn-more-shortcuts">Keyboard Shortcuts</div>' +
		'<div class="tn-more-popup__item tn-more-about">About Zero Block</div>' +
		'<div class="tn-more-popup__item tn-more-help">Help</div>' +
		'<div class="tn-more-popup__item" style="height:10px;opacity:0.2;"></div>' +
		'<div class="tn-more-popup__item tn-more-guides">Guides: Hide/Show</div>' +
		'<div class="tn-more-popup__item tn-more-add-guide-h">Guides: Add Horizontal</div>' +
		'<div class="tn-more-popup__item tn-more-add-guide-v">Guides: Add Vertical</div>' +
		'<div class="tn-more-popup__item tn-more-snap">Disable Snapping</div>' +
		'</td>' +
		'<td class="tn-more-table__right">' +
		'<div class="tn-more-popup__key tn-more-redo">' +
		cmdSymbol() +
		'⇧ <span class="tn-more-popup__plus">+</span> Z</div>' +
		'<div class="tn-more-popup__key">' +
		cmdSymbol() +
		' <span class="tn-more-popup__plus">+</span> Z</div>' +
		'<div class="tn-more-popup__key">G</div>' +
		'<div class="tn-more-popup__key">TAB</div>' +
		'<div class="tn-more-popup__key">F</div>' +
		'<div class="tn-more-popup__key">' +
		cmdSymbol() +
		' <span class="tn-more-popup__plus">+</span> L</div>' +
		'<div class="tn-more-popup__key">' +
		cmdSymbol() +
		' <span class="tn-more-popup__plus">+</span> +</div>' +
		'<div class="tn-more-popup__key">' +
		cmdSymbol() +
		' <span class="tn-more-popup__plus">+</span> −</div><div class="tn-more-popup__key"></div>' +
		'<div class="tn-more-popup__key"></div>' +
		'<div class="tn-more-popup__key"></div>' +
		'<div class="tn-more-popup__key"></div>' +
		'<div class="tn-more-popup__key"></div>' +
		'<div class="tn-more-popup__key" style="height:10px;opacity:0.2;"></div>' +
		'<div class="tn-more-popup__key"></div>' +
		'<div class="tn-more-popup__key">' +
		cmdSymbol() +
		' <span class="tn-more-popup__plus">+</span> H</div>' +
		'<div class="tn-more-popup__key">' +
		cmdSymbol() +
		'⇧ <span class="tn-more-popup__plus">+</span> H</div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'</div>' +
		'</div>' +
		'</td>' +
		'</tr>' +
		'</table>' +
		'';

	$container.html(html);

	/* событие по клику - открываем попап more */
	$container.find('.tn-more-btn').click(function () {
		moremenu__open();
		// allelems__unselect();
	});

	/* событие по клику на любой пункт попапа- закрываем попап more */
	$container.find('.tn-more-popup__item').click(function () {
		moremenu__close();
	});

	$container.find('.tn-more-undo').click(function () {
		tn_undo();
	});

	$container.find('.tn-more-redo').click(function () {
		tn_undo('redo');
	});

	$container.find('.tn-more-settings').click(function () {
		ab__openZBSettings();
		tn_showSettings();
	});

	$container.find('.tn-more-grid').click(function () {
		tn_toggleGrid();
	});

	$container.find('.tn-more-layers').click(function () {
		panelLayers__showhide();
	});

	$container.find('.tn-more-zoom-in').click(function () {
		tn_zoomIn();
	});

	$container.find('.tn-more-zoom-out').click(function () {
		tn_zoomOut();
	});

	$container.find('.tn-more-guides').click(function () {
		tn_toggleGuides();
	});

	$container.find('.tn-more-add-guide-h').click(function () {
		var $guide = guide__add('', 'h');
		tn_undo__Add('guides_add', $guide);
	});

	$container.find('.tn-more-add-guide-v').click(function () {
		var $guide = guide__add('', 'v');
		tn_undo__Add('guides_add', $guide);
	});

	$container.find('.tn-more-sett').click(function () {
		tn_tab();
	});

	$container.find('.tn-more-shortcuts').click(function () {
		tn_showShortcuts();
	});

	$container.find('.tn-help-btn').click(function () {
		if (window.tn.lang == 'RU') {
			window.open('http://help-ru.tilda.ws/zero', '_blank');
		} else {
			window.open('http://help.tilda.ws/zero', '_blank');
		}
		return false;
	});

	$container.find('.tn-more-help').click(function () {
		if (window.tn.lang == 'RU') {
			window.open('http://help-ru.tilda.ws/zero', '_blank');
		} else {
			window.open('http://help.tilda.ws/zero', '_blank');
		}
		return false;
	});

	$container.find('.tn-more-about').click(function () {
		if (window.tn.lang == 'RU') {
			window.open('http://zero.tilda.cc/ru', '_blank');
		} else {
			window.open('http://zero.tilda.cc', '_blank');
		}
		return false;
	});

	$container.find('.tn-more-ui').click(function () {
		tn_toggleUI();
	});

	$container.find('.tn-more-grid').html($('.tn-guides').hasClass('tn-display-none') ? 'Show Grid' : 'Hide Grid');
	$container
		.find('.tn-more-sett')
		.html($('.tn-right-box').hasClass('tn-display-none') ? 'Show Settings' : 'Hide Settings');
	$container.find('.tn-more-layers').html(window.tn_layers_panel != 'open' ? 'Show Layers' : 'Hide Layers');
}

/**
 * Проверяет и изменяет видимость пункта меню `Redo` в зависимости от наличия элементов в стеке `redo`
 */
function tn_toggleMoreRedoVisibility() {
	var redoStack = localStorage.getItem('redo_' + window.tn.artboard_id);
	var redoMenuElements = $('.tn-more-wrapper .tn-more-redo');

	if (!redoStack || redoStack === '[]') {
		redoMenuElements.css('display', 'none');
	} else {
		redoMenuElements.css('display', 'block');
	}
}
