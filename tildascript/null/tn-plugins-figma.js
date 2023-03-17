/**
 * Установка обработчика события на открытие попапа
 */
function tn_figma__setPopupOpenHandler() {
	$('.tn-more-figma').click(function () {
		moremenu__close();

		if (typeof jQuery.cachedScript !== 'function') {
			jQuery.cachedScript = function (url) {
				var options = {
					dataType: 'script',
					cache: true,
					url: url,
				};

				return jQuery.ajax(options);
			};
		}

		$('head').append('<link href="https://tilda.cc/front/css/t-popups.min.css" rel="stylesheet">');

		$.cachedScript('https://tilda.cc/front/js/t-popups.min.js').done(function (script, textStatus) {
			if (textStatus == 'success') {
				$('body').append(
					'<div class="td-popup" id="popup_figmaimport"><div class="td-popup__wrap"><div class="td-popup-window"></div></div></div>',
				);
				setTimeout(function () {
					tn_figma__openPopup();
				}, 100);
			} else {
				console.log('Error init figma import in zeroblock. Err:' + textStatus);
			}
		});
	});
}

/**
 * Получение сохраненных данных
 *
 * Апи ключ сохраняется настолько насколько возомжно
 *
 * Ссылка на фрейм сохраняется до перезагрузки
 *
 * @returns {{key: string, url: string, fileKey: string, nodeId: string}}}
 */
function tn_figma__getPersistedData() {
	var key = window.localStorage.getItem('tn-figma-api-key');
	var urlData = window.sessionStorage.getItem('tn-figma-api-url-data');
	if (!urlData) return {key};

	urlData = JSON.parse(urlData);

	return {
		key,
		url: urlData.url,
		fileKey: urlData.fileKey,
		nodeId: urlData.nodeId,
	};
}

/**
 * Установка сохраненных данных
 *
 * @param {string} apiKey
 * @param {string} apiUrl
 */
function tn_figma__setPersistedData(apiKey, apiUrl) {
	window.localStorage.setItem('tn-figma-api-key', apiKey);
	window.sessionStorage.setItem('tn-figma-api-url-data', apiUrl);
}

/**
 * Отрисовка попапа загрузки
 */
function tn_figma_showLoader() {
	// prettier-ignore
	var loaderPopupStr =
    '<div id="formfigmaimport">' +
      '<div class="td-popup-window__head" style="height:95px;">' +
        '<div class="td-popup-window__close" style="margin-right: 38px;" onclick="tn_figma__stopImport(true);">' +
      '</div>' +
      '<div class="td-popup-window__title">Import Figma Layout (Beta)</div></div>' +
      '<div class="td-popup-window__middle" style="position: relative;">' +
        '<div style="opacity:0.75; padding-top:15px; font-weight: 300; font-size: 16px; width: 580px;">Import any layout from Figma into Zero Block. To do that, create a personal API token in Figma Account Settings (Personal access tokens), select the frame you want to import in the Layers panel, and copy the link. Learn more in our <a <a style="color: #f06847;text-decoration: none;" target="_blank" href="https://help.tilda.cc/zero-figma-import">Help Center</a>.</div>' +
        '<div style="opacity:0.75; padding-top:15px; font-weight: 300; font-size: 16px; width: 580px;">While importing from Figma, all the necessary objects are created, but image files remain on the Figma server and are connected directly from there. This is convenient to speed up the prototyping process. Files on Figma (not transferred to Tilda) are usually available within 30 days and may stop loading. To finish importing, click on the element with an image, then click "Upload to Tilda".</div>' +
        '<div class="td-popup-window__middle-wrapper td-tab-content">' +
          '<div class="td-popup-error" style="padding:20px 10px;margin-top:10px;display:none;"></div>' +
          '<div id="tab_general" class="td-tab-pane td-tab-pane_active">' +
            '<img style="display: block; margin: 40px auto 0;" src="https://tilda.cc/tpl/img/ajax-loader.gif" style="">' +
            '<div style="font-size: 22px;text-align: center;padding-top: 15px;">Importing layout</div>' +
            '<div class="td-popup-window__bottom">' +
              '<div class="td-popup-window__bottom-right">' +
                '<input type="button" onclick="tn_figma__stopImport(true);" value="Cancel" class="td-popup-btn-white" style="margin-right:5px;">' +
                '<input style="opacity: 0.6;" disabled type="button" value="Import" class="td-popup-btn" id="importsubmitbutton">' +
              '</div>' +
              '<br>' +
            '</div>' +
          '</div>' +
        '</div>';

	if (window.tn.lang === 'RU') {
		// prettier-ignore
		loaderPopupStr +=
      '<a href="https://youtu.be/YzKmXR5vtIg" target="_blank">' +
        '<div class="tooltip" style="position: absolute; top: 18px; right: 32px;" data-tooltip="Video tutorial">' +
          '<svg width="36" height="33" viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<circle class="pe-content__videolink-icon-stroke" cx="27.254" cy="8.746" r="7.996" stroke="#5dcae2" stroke-width="1.5"></circle>' +
            '<path class="pe-content__videolink-icon-stroke" d="M27.252 13.994V6.997M27.252 5.249v-1.75" stroke="#5dcae2" stroke-width="2"></path>' +
            '<path class="pe-content__videolink-icon-play" d="M13.025 24.026V16.82l5.024 3.602-5.024 3.603z" fill="#5dcae2" stroke="#5dcae2"></path>' +
            '<path class="pe-content__videolink-icon-stroke" d="M13.91 8.348H4a3 3 0 00-3 3v17.32a3 3 0 003 3h22.318a3 3 0 003-3v-7.41" stroke="#5dcae2" stroke-width="1.5"></path>' +
          '</svg>' +
        '</div>' +
      '</a>';
	}

	loaderPopupStr += '</div></div>';

	window.tn_flag_settings_ui_focus = true;
	showpopup('#popup_figmaimport', loaderPopupStr);
}

/**
 * Функция отмены импорта
 *
 * @param {boolean} isClosePopup - Значение указывает нужно ли закрыть попап
 */
function tn_figma__stopImport(isClosePopup) {
	if (confirm('Are you sure?')) {
		window.tn.figmImportData.stopImport = true;
		if (isClosePopup) tn_figma__closePopup();
	}
}

/**
 * Отрисовка попапа ошибки
 *
 * @param {number} errorCode
 */
function tn_figma__openErrorPopup(errorCode) {
	var errorText = '';
	if (errorCode === 400) {
		errorText = 'Figma API error code 400: Check that the data you entered is correct and try again.';
	} else if (errorCode === 403) {
		errorText = 'Figma API error code 403: Check that the API key you entered is correct and try again.';
	} else if (errorCode === 404) {
		errorText = 'Figma API error code 404: Check that the data you entered is correct and try again.';
	} else if (errorCode === 503 || errorCode === 504) {
		errorText = 'Figma API error code ' + errorCode + ': Please try again later.';
	} else if (errorCode === 429) {
		errorText =
			'Figma API error code 429: Too many requests. Please wait a while before attempting the import again (typically a minute).';
	} else if (errorCode === 500) {
		errorText =
			'Figma API error code 500: The images in the layout may be too large or the number of objects is exceeded. Please reduce it and try again.';
	} else if (errorCode === 1000) {
		errorText =
			'Error when importing layout. Please ensure that your link pointing to one frame. <br> Learn more in our <a style="color: #f06847;text-decoration: none;" target="_blank" href="https://help.tilda.cc/zero-figma-import">Help Center</a>.';
	}

	// prettier-ignore
	var errorPopupStr =
    '<div id="formfigmaimport">' +
      '<div class="td-popup-window__head" style="height:95px;">' +
        '<div class="td-popup-window__close" onclick="tn_figma__closePopup();">' +
      '</div>' +
      '<div class="td-popup-window__title">Import Figma Layout (Beta)</div></div>' +
      '<div class="td-popup-window__middle" style="position: relative;">' +
        '<div style="opacity:0.75; padding-top:25px; font-weight: 300; font-size: 18px; text-align: center">' + errorText + '</div>' +
        '<div class="td-popup-window__middle-wrapper td-tab-content">' +
          '<div class="td-popup-error" style="padding:20px 10px;margin-top:10px;display:none;"></div>' +
          '<div id="tab_general" class="td-tab-pane td-tab-pane_active">' +
            '<div class="td-popup-window__bottom">' +
              '<div class="td-popup-window__bottom-right">' +
                '<input type="button" onclick="tn_figma__closePopup();" value="Cancel" class="td-popup-btn-white" style="margin-right:5px;">' +
              '</div>' +
              '<br>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

	window.tn_flag_settings_ui_focus = true;
	showpopup('#popup_figmaimport', errorPopupStr);
}

/**
 * Отрисовка попапа для импорта
 *
 * @returns {void}
 */
function tn_figma__openPopup() {
	tn_console('func: tn_figma__openPopup');

	// prettier-ignore
	var importPopupStr =
    '<div id="formfigmaimport">' +
      '<div class="td-popup-window__head" style="height:95px;">' +
        '<div class="td-popup-window__close" style="margin-right: 38px;" onclick="tn_figma__closePopup();">' +
      '</div>' +
      '<div class="td-popup-window__title">Import Figma Layout (Beta)</div></div>' +
      '<div class="td-popup-window__middle" style="position: relative;">' +
        '<div style="opacity:0.75; padding-top:15px; font-weight: 300; font-size: 16px; width: 580px;">Import any layout from Figma into Zero Block. To do that, create a personal API token in Figma Account Settings (Personal access tokens), select the frame you want to import in the Layers panel, and copy the link. Learn more in our <a style="color: #f06847;text-decoration: none;" target="_blank" href="https://help.tilda.cc/zero-figma-import">Help Center</a>.</div>' +
        '<div style="opacity:0.75; padding-top:15px; font-weight: 300; font-size: 16px; width: 580px;">While importing from Figma, all the necessary objects are created, but image files remain on the Figma server and are connected directly from there. This is convenient to speed up the prototyping process. Files on Figma (not transferred to Tilda) are usually available within 30 days and may stop loading. To finish importing, click on the element with an image, then click "Upload to Tilda".</div>' +
        '<div class="td-popup-window__error" style="display: none;color: red;opacity:0.75; padding-top:15px; font-weight: 300; font-size: 16px;">Select the frame you want to import in the Layers panel.</div>' +
        '<div class="td-popup-window__middle-wrapper td-tab-content">' +
          '<div class="td-popup-error" style="padding:20px 10px;margin-top:10px;display:none;"></div>' +
          '<div id="tab_general" class="td-tab-pane td-tab-pane_active">' +
            '<div class="td-item-group">' +
              '<div class="td-item-group__title">Layout url</div>' +
              '<input id="modalinputfigmaurl" type="text" name="url" class="td-input" value="" placeholder="https://www.figma.com/file/...">' +
            '</div>' +
            '<div class="td-item-group">' +
              '<div class="td-item-group__title">API token</div>' +
              '<input id="modalinputfigmakey" type="text" name="key" class="td-input" value="" placeholder="749673-51gs0615-0e2e-****-****-************">' +
            '</div>' +
            '<div class="td-popup-window__bottom">' +
              '<div class="td-popup-window__bottom-right">' +
                '<input type="button" onclick="tn_figma__closePopup();" value="Cancel" class="td-popup-btn-white" style="margin-right:5px;">' +
                '<input type="button" value="Import" class="td-popup-btn" id="importsubmitbutton">' +
              '</div>' +
              '<br>' +
            '</div>' +
          '</div>' +
        '</div>';

	if (window.tn.lang === 'RU') {
		// prettier-ignore
		importPopupStr +=
      '<a href="https://youtu.be/YzKmXR5vtIg" target="_blank">' +
        '<div class="tooltip" style="position: absolute; top: 18px; right: 32px;" data-tooltip="Video tutorial">' +
          '<svg width="36" height="33" viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="27.254" cy="8.746" r="7.996" stroke="#5dcae2" stroke-width="1.5"></circle>' +
            '<path d="M27.252 13.994V6.997M27.252 5.249v-1.75" stroke="#5dcae2" stroke-width="2"></path>' +
            '<path d="M13.025 24.026V16.82l5.024 3.602-5.024 3.603z" fill="#5dcae2" stroke="#5dcae2"></path>' +
            '<path d="M13.91 8.348H4a3 3 0 00-3 3v17.32a3 3 0 003 3h22.318a3 3 0 003-3v-7.41" stroke="#5dcae2" stroke-width="1.5"></path>' +
          '</svg>' +
        '</div>' +
      '</a>';
	}

	importPopupStr += '</div></div>';

	window.tn_flag_settings_ui_focus = true;
	showpopup('#popup_figmaimport', importPopupStr);
	init_popup();

	tn_tooltip_update();

	var figmaApiUrlData = tn_figma__getPersistedData();

	var $popup = $('#formfigmaimport');
	var $inputUrl = $popup.find('#modalinputfigmaurl');
	var $inputAPI = $popup.find('#modalinputfigmakey');

	$inputUrl.val(figmaApiUrlData.url);
	$inputAPI.val(figmaApiUrlData.key);

	$popup.find('#importsubmitbutton').click(function () {
		var url = $inputUrl.val();
		var apiKey = $inputAPI.val();
		figmaApiUrlData = {
			url: url,
			fileKey: tn_figma__getApiUrlData(url).fileKey,
			nodeId: tn_figma__getApiUrlData(url).nodeId,
		};

		if (!url || !apiKey) return;

		// if (figmaApiUrlData.nodeId.split(':')[0] === '0') {
		//   $('.td-popup-window__error').css('display', 'block');
		//   return;
		// }

		figmaApiUrlData = JSON.stringify(figmaApiUrlData);
		tn_figma__setPersistedData(apiKey, figmaApiUrlData);

		tn_figma__getNodes();
		tn_figma_showLoader();
		tn_tooltip_update();
	});
}

/**
 * Функция закрытия попапа
 * @returns {void}
 */
function tn_figma__closePopup() {
	window.tn_flag_settings_ui_focus = false;
	closepopup();
}

/**
 * Получение и отрисовка всех нод (элементов) макета из фигмы
 */
function tn_figma__getNodes() {
	window.tn.figmImportData = {
		isFigmaTopFrameRendered: false,
		newElemsIds: {},
		imgIds: [],
		stopImport: false,
	};
	var figmaApiUrlData = tn_figma__getPersistedData();
	var apiKey = figmaApiUrlData.key;
	var file = figmaApiUrlData.fileKey;
	var node = figmaApiUrlData.nodeId.replace('-', ':');

	var url = 'https://api.figma.com/v1/files/' + file + '/nodes?ids=' + node + '&geometry=paths';

	$.ajax({
		url: url,
		headers: {'X-FIGMA-TOKEN': apiKey},
		method: 'GET',
		dataType: 'json',
		success: function (data) {
			try {
				for (var nodeKey in data.nodes) {
					if (Object.prototype.hasOwnProperty.call(data.nodes, nodeKey)) {
						var node = data.nodes[nodeKey];
						tn_figma__drawAllNodes([node.document]);
					}
				}

				//делаем запрос для получения всех изображений по их id в фигме
				if (window.tn.figmImportData.imgIds.length) {
					tn_figma__getAllAmazonImages(window.tn.figmImportData.imgIds, function (imgData) {
						window.tn.figmImportData.imgIds.forEach(function (elInfo) {
							var $el = $('#' + elInfo.id);

							elem__setFieldValue($el, elInfo.field, imgData[elInfo.nodeId]);
							elem__setFieldValue($el, 'amazonsrc', 'y');
							elem__renderViewOneField($el, elInfo.field);

							if (elInfo.isArrow) {
								var left = elem__getFieldValue($el, 'left');

								elem__setFieldValue($el, 'width', 8);
								elem__setFieldValue($el, 'left', left - 4);
								elem__renderViewOneField($el, 'width');
								elem__renderViewOneField($el, 'left');
							}

							tn_figma__checkAmazonImages();

							tn_figma__closePopup();
							layers__update();
						});
					});
				} else {
					tn_figma__closePopup();
					layers__update();
					floor__mousedown();
				}

				tn_undo__Add('elems_figma_import', window.tn.figmImportData.newElemsIds);
			} catch (error) {
				console.error('Figma Import Error', error);
				tn_figma__openErrorPopup(1000);
			}
		},
		statusCode: {
			400: function () {
				tn_figma__openErrorPopup(400);
			},
			403: function () {
				tn_figma__openErrorPopup(403);
			},
			404: function () {
				tn_figma__openErrorPopup(404);
			},
			503: function () {
				tn_figma__openErrorPopup(503);
			},
			504: function () {
				tn_figma__openErrorPopup(504);
			},
			429: function () {
				tn_figma__openErrorPopup(429);
			},
			500: function () {
				tn_figma__openErrorPopup(500);
			},
		},
	});
}

/**
 * Получение ссылок на изображения
 *
 * @param {object[]} imgData - данные об изображениях
 * @param {Function} callback
 */
function tn_figma__getAllAmazonImages(imgData, callback) {
	var svgNodeIds = '';
	var pngNodeIds = '';
	var allImgs = {};

	imgData.forEach(function (data) {
		if (data.isSVG) {
			svgNodeIds += data.nodeId + ',';
		} else {
			pngNodeIds += data.nodeId + ',';
		}
	});

	svgNodeIds = svgNodeIds.slice(0, -1);
	pngNodeIds = pngNodeIds.slice(0, -1);

	// Для получения svg и png изображений используются разные методы
	// Мы проверяем что нам нужно и делаем только необходимые запросы
	if (pngNodeIds && svgNodeIds) {
		tn_figma__getImage(pngNodeIds, false, function (data) {
			allImgs = Object.assign(allImgs, data.images);

			tn_figma__getImage(svgNodeIds, true, function (data) {
				allImgs = Object.assign(allImgs, data.images);
				callback(allImgs);
			});
		});
	} else if (pngNodeIds) {
		tn_figma__getImage(pngNodeIds, false, function (data) {
			allImgs = Object.assign(allImgs, data.images);
			callback(allImgs);
		});
	} else if (svgNodeIds) {
		tn_figma__getImage(svgNodeIds, true, function (data) {
			allImgs = Object.assign(allImgs, data.images);
			callback(allImgs);
		});
	}
}

/**
 * Запрос на получение ссылок на изображения
 *
 * @param {string} imgNodeId
 * @param {boolean} isSVG
 * @param {Function} callback
 */
function tn_figma__getImage(imgNodeId, isSVG, callback) {
	var figmaApiUrlData = tn_figma__getPersistedData();
	var apiKey = figmaApiUrlData.key;
	var file = figmaApiUrlData.fileKey;

	var svgParam = isSVG ? '&format=svg' : '';
	var scaleParams = '&scale=4';
	var url = 'https://api.figma.com/v1/images/' + file + '?ids=' + imgNodeId + svgParam + scaleParams;

	$.ajax({
		url: url,
		headers: {'X-FIGMA-TOKEN': apiKey},
		method: 'GET',
		dataType: 'json',
		success: function (data) {
			callback(data);
		},
	});
}

/**
 * Главная функции отрисовки всех элементов
 *
 * @param {object[]} nodes - элементы из фигмы
 * @param {number} x - координата
 * @param {number} y - координата
 * @param {object} groupData - данные о группе элементов
 */
function tn_figma__drawAllNodes(nodes, x, y, groupData) {
	if (!nodes || !nodes.length) return null;

	if (window.tn.figmImportData.stopImport) return null;

	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		// Проверяем является ли текущая нода главным фреймом или это элемент
		var isFrame = (!x || !y) && node.type === 'FRAME';
		var data = isFrame ? node.absoluteBoundingBox : {x: x, y: y};

		if (isFrame) {
			if (!window.tn.figmImportData.isFigmaTopFrameRendered) {
				var abColor = '';
				if (node.fills && node.fills[0] && node.fills[0].color) {
					abColor = tn_figma__getColor(node.fills[0].color);
				}
				var ab = $('.tn-artboard');
				ab__setFieldValue(ab, 'height', node.absoluteBoundingBox.height, window.tn.topResolution);
				if (abColor) ab__setFieldValue(ab, 'bgcolor', abColor, window.tn.topResolution);
				ab__renderViewOneField('bgcolor');
				ab__renderViewOneField('height');
			}
			window.tn.figmImportData.isFigmaTopFrameRendered = true;
		}

		// рендерим ноду и на выходе получаем значение есть ли дочерние элементы и нужно ли рендерить их
		var isRenderChildren = t_figma__renderNode(node, data.x, data.y, groupData ? groupData.id : null, isFrame);

		if (isRenderChildren && node.children.length) {
			var currentGroupData = groupData;
			var isTopLevelGroupInit = false;

			// проверяем рендерим ли группу, если нет, создаем новую
			if (!currentGroupData) {
				isTopLevelGroupInit = true;
				currentGroupData = {
					id: group__createGroupId(),
					name: node.name,
				};
			}

			if (isFrame) currentGroupData = null;
			// Текущая функция рекурсивная и вызывает сама себя, пока не закончатся дочерние элементы
			tn_figma__drawAllNodes(node.children, data.x, data.y, currentGroupData);
			if (isTopLevelGroupInit && currentGroupData) {
				group__create(currentGroupData.id, undefined, true);
				group__setFieldValue(currentGroupData.id, 'name', currentGroupData.name);
			}
		}
	}
}

/**
 * Рендер элемента
 *
 * @param {object} node - параметры элемента в фигме
 * @param {number} x - координата
 * @param {number} y - координата
 * @param {string} groupId - id группы
 * @param {boolean} isTopFrame - значение указывает родительский ли это фрейм
 *
 * @returns {boolean} - значение о наличии дочерних элементов и необходимости их рендерить
 */
function t_figma__renderNode(node, x, y, groupId, isTopFrame) {
	if (node.visible === false) return false;
	var $el = null;
	var name = node.name.toLowerCase();
	var realX = node.absoluteBoundingBox.x - x;
	var realY = node.absoluteBoundingBox.y - y;
	// UPDATE SIZES SOURCE, CHECK RENDER LINE
	var width = node.size.x;
	var height = node.size.y;
	var data = {};
	data.top = Math.floor(realY);
	data.left = Math.floor(realX);
	data.width = Math.floor(width);
	data.height = Math.floor(height);
	data.elem_id = Date.now();
	data.layer = node.name;
	data.groupid = groupId;

	if (name.includes('svg')) {
		$el = tn_figma__renderVector(node, data);
	} else if (name.includes('image')) {
		$el = tn_figma__renderShape(node, data, true);
	} else if (name.includes('button') && (node.type === 'GROUP' || node.type === 'COMPONENT' || node.type === 'FRAME')) {
		$el = tn_figma__renderButton(node, data);
	} else {
		switch (node.type) {
			case 'REGULAR_POLYGON':
			case 'ELLIPSE':
			case 'VECTOR':
			case 'STAR':
			case 'LINE':
				if (node.type === 'ELLIPSE' && node.absoluteBoundingBox.width === node.absoluteBoundingBox.height) {
					$el = tn_figma__renderShape(node, data, false, 'circle');
				} else if (node.type === 'LINE') {
					$el = tn_figma__renderShape(node, data, false, 'line');
				} else {
					$el = tn_figma__renderVector(node, data);
				}
				break;
			case 'RECTANGLE':
				$el = tn_figma__renderShape(node, data);
				break;
			case 'TEXT':
				$el = tn_figma__renderText(node, data);
				break;
			case 'FRAME':
			case 'COMPONENT':
			case 'GROUP':
				var isMask = tn_figma__checkIsMask(node);

				if (isMask) {
					// если используется маска, то рендерим обычный шейп с фоном
					$el = tn_figma__renderShape(node, data, true);
				} else {
					if (node.custom) {
						$el = tn_figma__renderShape(node, data);
						break;
					} else if (!isTopFrame && node.type === 'FRAME') {
						var frameNode = JSON.parse(JSON.stringify(node));
						frameNode.children = [];
						frameNode.custom = true;
						node.children.unshift(frameNode);
					}
					return true;
				}
				break;

			default:
				return true;
		}
	}

	if ($el) {
		var elId = $el.attr('data-elem-id');
		window.tn.figmImportData.newElemsIds[elId] = elId;
	}
}

/**
 * Рендер элемента "Кнопка"
 *
 * @param {object} node - параметры элемента в фигме
 * @param {object} data - параметры элемента для рендеринга
 *
 * @returns {jQuery | boolean} - отрендереный элемент или false в случае неудачной попытки ренедринга
 */
function tn_figma__renderButton(node, data) {
	var textNode;
	var shapeNode;

	if (node.type === 'FRAME' || (node.type === 'COMPONENT' && node.children.length === 1)) {
		shapeNode = node;
	}

	node.children.forEach(function (currentNode) {
		if (!textNode && currentNode.type === 'TEXT') textNode = currentNode;
		if (!shapeNode && currentNode.type === 'RECTANGLE') shapeNode = currentNode;
	});

	if (!textNode) return false;

	data.elem_type = 'button';
	data.zindex = allelems__getHighestZIndex() + 1;
	data.speedhover = '0.2';

	if (textNode) {
		data.caption = textNode.characters;
		data.fontsize = textNode.style.fontSize;
		data.lineheight = (textNode.style.lineHeightPercentFontSize / 100).toFixed(2);
		data.color = textNode.fills[0] && textNode.fills[0].color && tn_figma__getColor(textNode.fills[0].color);
		var isTextWidthEqualShape = data.width == Math.floor(textNode.size.x);
		data.align = isTextWidthEqualShape ? textNode.style.textAlignHorizontal.toLowerCase() : 'center';
	}
	if (shapeNode) {
		data.bgcolor = shapeNode.fills[0] && shapeNode.fills[0].color && tn_figma__getColor(shapeNode.fills[0].color);
		data.borderradius = tn_figma__getBorderRadius(shapeNode);
		data.bordercolor =
			shapeNode.strokes[0] && shapeNode.strokes[0].color && tn_figma__getColor(shapeNode.strokes[0].color);
		data.borderwidth = shapeNode.strokeWeight;
	}

	if (typeof window.tn.textfont != 'undefined' && window.tn.textfont != 'undefined' && window.tn.textfont != '') {
		data.fontfamily = window.tn.textfont;
	} else {
		data.fontfamily = 'Arial';
	}

	if (
		typeof window.tn.textfontweight != 'undefined' &&
		window.tn.textfontweight != 'undefined' &&
		window.tn.textfontweight != ''
	) {
		data.fontweight = window.tn.textfontweight;
	} else {
		data.fontweight = '400';
	}

	var $el = addButton(data);
	return $el;
}

function tn_figma__renderVector(node, data) {
	data.elem_type = 'image';
	data.width = Math.floor(data.width);
	data.zindex = allelems__getHighestZIndex() + 1;

	var $el = addImage(data);

	window.tn.figmImportData.imgIds.push({
		id: $el.attr('id'),
		nodeId: node.id,
		field: 'img',
		isSVG: true,
		isArrow: (node.size.x == 0 || node.size.y == 0) && node.type === 'VECTOR',
	});

	return $el;
}

/**
 * Рендер элемента "Шейп"
 *
 * @param {object} node - параметры элемента в фигме
 * @param {object} data - параметры элемента для рендеринга
 * @param {boolean} isImage - является ли элемент изображением
 * @param {string} figure - тип фигуры
 *
 * @returns {jQuery} - отрендереный элемент
 */
function tn_figma__renderShape(node, data, isImage, figure) {
	var isImg = (node.fills[0] && node.fills[0].type === 'IMAGE') || node.fills.length > 1 || isImage;

	data.elem_type = 'shape';
	if (figure) data.figure = figure;
	data.borderradius = figure === 'circle' ? '3000' : node.cornerRadius || '';
	data.bordercolor = node.strokes[0] && node.strokes[0].color && tn_figma__getColor(node.strokes[0].color);
	if (data.bordercolor) data.borderwidth = node.strokeWeight;
	data.zindex = allelems__getHighestZIndex() + 1;
	if (!isImg) {
		data.rotate = tn_figma__getRotationInDegrees(node.relativeTransform);
	}

	if (node.effects.length) {
		var dataWithShadow;
		node.effects.forEach(function (effect) {
			switch (effect.type) {
				case 'DROP_SHADOW':
					dataWithShadow = tn_figma__getShadow(data, effect);
					break;
				case 'INNER_SHADOW':
				case 'BACKGROUND_BLUR':
				case 'LAYER_BLUR':
					isImg = true;
					break;

				default:
					break;
			}
		});

		if (!isImg) data = dataWithShadow;
	}

	if (node.fills.length) {
		node.fills.forEach(function (effect) {
			switch (effect.type) {
				case 'GRADIENT_LINEAR':
				case 'GRADIENT_RADIAL':
				case 'GRADIENT_ANGULAR':
				case 'GRADIENT_DIAMOND':
					isImg = true;
					break;
				default:
					break;
			}
		});
	}

	if (isImg) {
		data.width = Math.floor(node.absoluteBoundingBox.width);
		data.height = Math.floor(node.absoluteBoundingBox.height);
	} else {
		data.bgcolor = node.fills[0] && node.fills[0].color && tn_figma__getColor(node.fills[0].color);
		var colorOpacity = node.fills[0] && node.fills[0].opacity ? parseFloat(node.fills[0].opacity.toFixed(2)) : '';
		var layerOpacity = node.opacity ? parseFloat(node.opacity.toFixed(2)) : '';

		if (typeof colorOpacity === 'number' && typeof layerOpacity === 'number') {
			data.opacity = colorOpacity < layerOpacity ? colorOpacity : layerOpacity;
		} else if (typeof colorOpacity === 'number') {
			data.opacity = colorOpacity;
		} else if (typeof layerOpacity === 'number') {
			data.opacity = layerOpacity;
		}
	}

	var $el = addShape(data);

	if (isImg) {
		window.tn.figmImportData.imgIds.push({
			id: $el.attr('id'),
			nodeId: node.id,
			field: 'bgimg',
		});
	}

	return $el;
}

/**
 * Рендер элемента "Текст"
 *
 * @param {object} node - параметры элемента в фигме
 * @param {object} data - параметры элемента для рендеринга
 *
 * @returns {jQuery} - отрендереный элемент
 */
function tn_figma__renderText(node, data) {
	data.elem_type = 'text';
	data.text = node.characters.replaceAll('\n', '<br>');
	data.fontsize = node.style.fontSize;
	data.lineheight = (node.style.lineHeightPercentFontSize / 100).toFixed(2);
	data.color = node.fills[0] && node.fills[0].color && tn_figma__getColor(node.fills[0].color);
	data.align = node.style.textAlignHorizontal;
	data.zindex = allelems__getHighestZIndex() + 1;

	if (typeof window.tn.textfont != 'undefined' && window.tn.textfont != 'undefined' && window.tn.textfont != '') {
		data.fontfamily = window.tn.textfont;
	} else {
		data.fontfamily = 'Arial';
	}

	if (
		typeof window.tn.textfontweight != 'undefined' &&
		window.tn.textfontweight != 'undefined' &&
		window.tn.textfontweight != ''
	) {
		data.fontweight = window.tn.textfontweight;
	} else {
		data.fontweight = node.style.fontWeight;
	}

	var $el = addText(data);
	return $el;
}

/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */

/**
 * Конвертация цвета из rgb формата фигмы в hex
 *
 * @param {object} color
 *
 * @returns {string}
 */
function tn_figma__getColor(color) {
	if (!color) return '';
	var rgb =
		'rgb(' + parseInt(color.r * 255, 10) + ',' + parseInt(color.g * 255, 10) + ',' + parseInt(color.b * 255, 10) + ')';
	var hex = tn_rgb2hex(rgb);
	return hex;
}

/**
 * Получение border radius из ноды, в случае когда пользователь не открывает меню настроек радиуса для каждой стороны
 *
 * То в `node.rectangleCornerRadii` будут пустые значения, в этом случае берем значение из `node.cornerRadius`
 *
 * В обратном случае `node.cornerRadius` не будет задан
 *
 * @param {object} node - параметры элемента в фигме
 *
 * @returns {number}
 */
function tn_figma__getBorderRadius(node) {
	if (node.cornerRadius) {
		return node.cornerRadius;
	}

	return node.rectangleCornerRadii && node.rectangleCornerRadii[0];
}

/**
 * Получение угла поворота из матрицы
 *
 * @param {Array} matrix - матрица угла поворота
 *
 * @returns {number} - угол поворота в градусах
 */
function tn_figma__getRotationInDegrees(matrix) {
	return Math.round((Math.atan2(matrix[1][0], matrix[0][0]) * 180) / Math.PI);
}

/**
 * Получение `nodeId` и `fileKey` из пользовательского URL
 *
 * @param {string} layoutUrl - пользовательский URL который указывает на фрейм или группу
 *
 * @returns {{ nodeId: string, fileKey: string }}
 */
function tn_figma__getApiUrlData(layoutUrl) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = layoutUrl;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}

	return {
		nodeId: params['node-id'],
		fileKey: parser.pathname.split('/')[2],
	};
}

/**
 * Проверка на то, что нода является маской
 *
 * @param {object} node - параметры элемента в фигме
 *
 * @returns {boolean}
 */
function tn_figma__checkIsMask(node) {
	var isMask = false;
	if (node && node.children && node.children.length) {
		for (var i = 0; i < node.children.length; i++) {
			if (node.children[i].isMask) {
				isMask = true;
				break;
			}
		}
	}

	return isMask;
}

/**
 * Установка флагов предупреждения для картинок который не были загружены на сервера Тильды
 */
function tn_figma__checkAmazonImages() {
	var $elemsWithAmazonImgs = $(
		'.tn-elem[data-field-amazonsrc-value="y"]:not(.tn-elem[data-field-uploaderror-value="y"])',
	);
	var $importWarning = $('.tn-figma-warning');
	if ($elemsWithAmazonImgs.length === 0) {
		$importWarning.addClass('tn-figma-warning__hidden');
	} else {
		$importWarning.removeClass('tn-figma-warning__hidden');
	}
}

/**
 * Получение параметров тени из ноды
 *
 * @param {object} elemData - параметры элемента в фигме
 * @param {object} shadowData - параметры тени в фигме
 *
 * @returns {object}
 */
function tn_figma__getShadow(elemData, shadowData) {
	var updatedData = JSON.parse(JSON.stringify(elemData));
	var rgbString = 'rgb(' + shadowData.color.r + ',' + shadowData.color.g + ',' + shadowData.color.b + ')';
	updatedData.shadowcolor = tn_rgb2hex(rgbString);
	updatedData.shadowopacity = parseFloat(shadowData.color.a).toFixed(1);
	updatedData.shadowx = shadowData.offset.x;
	updatedData.shadowy = shadowData.offset.y;
	updatedData.shadowy = shadowData.offset.y;
	updatedData.shadowblur = shadowData.radius;
	updatedData.shadowspread = shadowData.spread;

	return updatedData;
}
