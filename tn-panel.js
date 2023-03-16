/* ------------------------ */
/* Panel Element Settings */

/**
 * Поиск общих атрибутов среди выбранных элементов
 * Функция возвращает одинаковые значения параметров элементов,
 * все используемы типы и спсиок всех полей элементов
 *
 * @param {jqElement[]} data - массив элементов
 * @returns {object}
 */
function panelSettings__getCommonAttrs(data) {
	var elemsAttrs = [];
	var types = [];
	var commonAttrs;
	var fields = '';
	var uniqueFields = [];

	// находим все атрибуты и наименования всех настроек элементов
	$.each(data, function (i) {
		var $el = $(data[i]);
		var elType = $el.attr('data-elem-type');
		var elFields = $el.attr('data-fields');

		if (types.indexOf(elType) === -1) {
			types.push(elType);
			fields = fields + ',' + elFields;
		}

		var attrs = data[i].attributes;
		elemsAttrs.push(attrs);
	});

	// удаляем дубликаты наименований настроек
	fields.split(',').forEach(function (field) {
		if (uniqueFields.indexOf(field) === -1 && field !== '') uniqueFields.push(field);
	});

	fields = uniqueFields.join(',');
	commonAttrs = {};

	// находим общие настройки
	elemsAttrs.forEach(function (nodeMap) {
		$.each(nodeMap, function (i, attr) {
			// получаем название настройки
			var propertyName = attr.name.split('-').slice(2, -1).join('-');

			if (propertyName) {
				/**
				 * если значение адаптивно, проверить, существует ли оно в других объектах
				 * если нет - задать для ключа свойство null
				 */
				if (propertyName.includes('-res-')) {
					var isSetRespProps = elemsAttrs.every(function (obj) {
						var attrList = Object.values(obj);
						return attrList.some(function (attrValue) {
							return attrValue.name.includes(propertyName);
						});
					});
					if (!isSetRespProps) commonAttrs[propertyName] = null;
				}
				// если значение отсутсвует в списке, добавляем
				if (typeof commonAttrs[propertyName] === 'undefined') {
					commonAttrs[propertyName] = attr.nodeValue;
					// если значение в списке уже есть, указываем значение для него null
				} else if (commonAttrs[propertyName] !== null && commonAttrs[propertyName] !== attr.nodeValue) {
					commonAttrs[propertyName] = null;
				}
			}
		});
	});

	delete commonAttrs.elem_id;
	delete commonAttrs.elem_type;

	// в объекте commonAttrs значение какого-либо параметра как null означает,
	// что настройка по-разному выставлена у разных элементов
	// если какой-то настройки нет, значит она не выставлена ни у одного элемента
	return {commonAttrs: commonAttrs, types: types, fields: fields};
}

/**
 * Функция необходима, когда выбираем какие настройки показывать,
 * но вход идут тип или типы элемнтов, типы для которых необходимо показывать и тип проверки
 *
 * @param {string[]} elemsTypes - тип или типы выбранных элементов
 * @param {string[]} typesForChecking - типы элементов, которые допустимы
 * @param {string} typeOfChecking - тип проверки (внутри функции описание кааждого типа)
 * @returns {boolean}
 */
function panelSettings__checkSettingsShow(elemsTypes, typesForChecking, typeOfChecking) {
	var isShow;

	switch (typeOfChecking) {
		// параметр, который проверяет на конкретный тип элемента
		// например что элемент button это именно элемент button
		case 'uniq':
			isShow =
				(!window.tn.multi_edit && elemsTypes === typesForChecking) ||
				(window.tn.multi_edit && elemsTypes.length === 1 && elemsTypes[0] === typesForChecking);
			break;

		//////////
		//////////
		// Параметр который возвращает true для всех типов, кроме определенных.
		// Если все элементы соответсвуют тем типам, которые мы указали в typesForChecking,
		// тогда вернется false.
		// Если среди элементов есть типы, отличные от указанных нами в typesForChecking,
		// вернется true
		case 'except':
			isShow = true;
			if (window.tn.multi_edit) {
				var availableTypes = [];

				elemsTypes.forEach(function (type) {
					if (typesForChecking.indexOf(type) === -1) availableTypes.push(type);
				});

				if (availableTypes.length === 0) isShow = false;
			} else {
				typesForChecking.forEach(function (type) {
					if (type === elemsTypes) isShow = false;
				});
			}
			break;
		// Возвращает true, когда хотя бы один из выбранных элементов
		// имеет соответсвует типу в typesForChecking
		case 'several':
			isShow = false;
			if (window.tn.multi_edit) {
				elemsTypes.forEach(function (type) {
					if (typesForChecking.indexOf(type) >= 0) isShow = true;
				});
			} else {
				if (typesForChecking.indexOf(elemsTypes) >= 0) isShow = true;
			}
			break;

		default:
			break;
	}

	return isShow;
}

function panelSettings__openTimeout(data, isMultiElems) {
	setTimeout(function () {
		panelSettings__open(data, isMultiElems);
	}, 1);
}

function panelSettings__open(data, isMultiElems) {
	tn_console();

	var elem_id;
	var $el;
	var commonAttrs;
	var type;
	var multiEditData;
	var elemData;
	var panelTitle;
	var $panel;
	var fields;
	var previousScrollPosition;

	if (!data) {
		data = $('.tn-elem__selected');
		if (data.length > 1) isMultiElems = true;
	}

	$('.tn-elem__fake').remove();

	if (isMultiElems) {
		multiEditData = panelSettings__getCommonAttrs(data);
		commonAttrs = multiEditData.commonAttrs;
		type = multiEditData.types;
		window.tn.multi_edit_common_attrs = commonAttrs;
		window.tn.multi_edit_types = type;
		elemData = commonAttrs;
		$el = addFake(elemData, multiEditData.fields);
		elem_id = $el.attr('data-elem-id');
	} else {
		elem_id = data.data.elem_id;
		$el = $('#' + elem_id);
		type = $el.attr('data-elem-type');
	}

	$('.tn-right-box').removeClass('tn-right-box_hide');

	if (window.tn.multi_edit) {
		if (group__isSelectedOnlyGroups()) {
			panelTitle = $('.tn-group__selected').length > 1 ? 'Selected Groups' : 'Selected Group';
		} else {
			panelTitle = 'Selected elements';
		}
	} else {
		panelTitle = 'Element settings';
	}

	previousScrollPosition = $('.tn-right-box').scrollTop();

	// prettier-ignore
	$('.tn-right-box').html(
		'<div class="tn-right-box__header">' +
		'<span class="tn-right-box__caption">' + panelTitle + '</span>' +
		'<img src="img/tn-close.png" class="tn-right-box__icon" width="15px">' +
		'</div>'
	);

	$('.tn-right-box__header').click(function () {
		tn_console('click: Minify panel');
		tn_toggleSettings(true);
	});

	$('.tn-right-box').append('<div class="tn-settings" data-for-elem-id="' + elem_id + '"></div>');

	$panel = $('.tn-settings');
	fields = '';

	if ($el) {
		elem_id = $el.attr('data-elem-id');
		fields = $el.attr('data-fields');
	}

	if (window.tn_flag_sbs_panelopen == 'y') {
		panelSBS__open(elem_id);
		return;
	}

	panelSettings__drawLayout($panel, $el, elem_id, type);

	tn_addSectionHandlers();

	/* Add Controls */
	panelSettings__addControls(elem_id, $el, type, fields, false);

	tn_tooltip_update();

	tn_console_runtime();

	$('.tn-right-box').scrollTop(previousScrollPosition);
	var $btnPaste = $panel.find('.sui-paste-btn-basic');
	var $btnCopy = $panel.find('.sui-copy-btn-basic');

	$panel.find('.sui-copy-btn-basic').on('click', function () {
		panelSettings__copyAnimation($(this).parents('.tn-settings').attr('data-for-elem-id'));
		if ($btnPaste.css('display') !== 'block') {
			$btnPaste.css('display', 'block');
		}
		td__showBubbleNotice('Animation is copied', 3000);
	});

	$btnPaste.on('click', function () {
		panelSettings__pasteAnimation();
		panelSettings__pasteAnimationAttr(elem_id);
		if ($btnCopy.css('display') !== 'block') {
			$btnCopy.css('display', 'block');
		}
		td__showBubbleNotice('Animation is pasted', 3000);
	});

	panelSettings__addAlignContextMenu();
}

function panelSettings__addControls(elem_id, $el, type, fields, isCopiedAnimation) {
	var $panel = $('.tn-settings');
	var res = window.tn.curResolution;
	var type = $el.attr('data-elem-type');
	var value;
	var fieldsArr;
	var groupId;

	if (window.tn.multi_edit) {
		if (!group__isSelectedOnlyGroups() || $('.tn-group__selected').length > 1) {
			control__drawUi__paddingelems();
		}
		setTimeout(function () {
			smartAlign__elems__setSpacingFieldValues();
		}, 100);
	}

	if (fields && fields.length) {
		fieldsArr = fields.split(',');

		if (group__isSelectedOnlyGroups() && fieldsArr.indexOf('height') === -1) {
			fieldsArr.push('height');
			fieldsArr.push('heightunits');
		}

		var fontWeight = elem__getFieldValue($el, 'fontweight');
		var inputFontWeight = elem__getFieldValue($el, 'inputfontweight');
		var inputTitleFontWeight = elem__getFieldValue($el, 'inputtitlefontweight');
		var inputElsFontWeight = elem__getFieldValue($el, 'inputelsfontweight');
		var buttonFontWeight = elem__getFieldValue($el, 'buttonfontweight');

		fieldsArr.forEach(function (field) {
			var wrstr = '';
			var group;
			var $cel;
			var value_for_res;
			var elCustomClassName;

			if (
				field == 'sbsevent' ||
				field == 'sbstrg' ||
				field == 'sbstrgofst' ||
				field == 'sbsloop' ||
				field == 'sbsopts' ||
				field == 'sbstrgels'
			)
				return true;
			if (field == 'layer') return true;
			if (field == 'bgposition_imgsize' || field == 'bgposition_imgpos') return true;

			if (
				group__isSelectedOnlyGroups() &&
				(field === 'left' ||
					field === 'top' ||
					field === 'container' ||
					field === 'axisx' ||
					field === 'axisy' ||
					field === 'leftunits' ||
					field === 'topunits')
			) {
				group = $('.tn-group__selected');

				value = isCopiedAnimation
					? JSON.parse(localStorage.getItem('tzerobasicanimation'))[field]
					: group__getFieldValue(group, field);
			} else {
				value = isCopiedAnimation
					? JSON.parse(localStorage.getItem('tzerobasicanimation'))[field]
					: elem__getFieldValue($el, field);
			}

			$cel = $panel.find('[data-control-field=' + field + ']');

			var addPanel = function (panelField, panelValue) {
				return (
					'<table class="sui-panel__table sui-panel__padd_b-10">' +
					'<tr class="sui-panel__tr">' +
					'<td class="sui-panel__td">' +
					'<div class="sui-form-group" data-control-field="' +
					panelField +
					'" data-control-value="' +
					panelValue +
					'"></div>' +
					'</td>' +
					'</tr>' +
					'</table>'
				);
			};

			if ($cel.length == 0 && !group__isSelectedOnlyGroups() && !window.tn.multi_edit) {
				wrstr += addPanel(field, value);

				if (type === 'form') {
					if (field.substr(0, 6) == 'button') {
						$panel.find('.sui-panel__section-formbuttonstyle').append(wrstr);
					} else {
						$panel.find('.sui-panel__section-formstyle').append(wrstr);
					}
				} else if (field != 'filewidth' && field != 'fileheight' && field != 'code' && field != 'vectorjson') {
					$panel.find('.sui-panel__section-other').append(wrstr);
				}

				$cel = $panel.find('[data-control-field=' + field + ']');
			}

			if ($cel.length > 0) {
				$cel.attr('data-control-value', value);
			}

			if (type === 'shape' && field === 'bgposition') {
				control__drawUi__shapeBgPosition(elem_id, field);
			} else if (
				field === 'fontweight' ||
				field === 'container' ||
				field === 'axisx' ||
				field === 'axisy' ||
				field === 'fontfamily' ||
				field === 'bgattachment' ||
				field === 'bgposition' ||
				field === 'borderstyle' ||
				field === 'linktarget' ||
				field === 'relnofollow' ||
				field === 'buttonstat' ||
				field === 'tag' ||
				field === 'shadowopacity' ||
				field === 'leftunits' ||
				field === 'topunits' ||
				field === 'widthunits' ||
				field === 'heightunits' ||
				field === 'figure' ||
				field === 'zoomable' ||
				field === 'lazyoff' ||
				field === 'pevent' ||
				field === 'animstyle' ||
				field === 'animprx' ||
				field === 'animfix' ||
				field === 'tipposition' ||
				field === 'tipopen' ||
				field === 'pinicon' ||
				field === 'vidtype' ||
				field === 'showinfo' ||
				field === 'mute' ||
				field === 'loop' ||
				field === 'autoplay' ||
				(type === 'gallery' &&
					(field === 'slds_arrowsize' ||
						field === 'slds_arrowbgopacity' ||
						field === 'slds_arrowbgopacityhover' ||
						field === 'slds_loop' ||
						field === 'slds_speed' ||
						field === 'slds_arrowcontrols' ||
						field === 'slds_dotscontrols' ||
						field === 'slds_stretch' ||
						field === 'slds_imgposition' ||
						field === 'slds_captionwidth' ||
						field === 'slds_arrowalign' ||
						field === 'slds_arrowtype' ||
						field === 'slds_cursorcontrol' ||
						field === 'slds_arrowborder'))
			) {
				control__drawUi__selectbox(elem_id, field, false);
			} else if (
				field === 'variationweight' ||
				field === 'fontsize' ||
				(field === 'width' && !group__isSelectedOnlyGroups()) ||
				field === 'lineheight' ||
				field === 'letterspacing' ||
				field === 'opacity' ||
				field === 'rotate' ||
				field === 'animduration' ||
				field === 'animdelay' ||
				field === 'animdistance' ||
				field === 'animscale' ||
				field === 'animtriggeroffset' ||
				field === 'animprxs' ||
				field === 'animprxdx' ||
				field === 'animprxdy' ||
				field === 'animfixdist' ||
				field === 'animfixtrgofst' ||
				field === 'speedhover' ||
				field === 'tipwidth' ||
				field === 'tipradius' ||
				field === 'tipshadowblur'
			) {
				control__drawUi__slider(elem_id, field, false);
			} else if (field === 'lettercase') {
				control__drawUi__lettercase(elem_id, field);
			} else if (field == 'align') {
				control__drawUi__radio(elem_id, field);
			} else if ((field == 'img' || field == 'bgimg' || field == 'tipimg') && !window.tn.multi_edit) {
				control__drawUi__upload(elem_id, field);
			} else if (field == 'imgs' && !window.tn.multi_edit) {
				control__drawUi__galleryupload(elem_id);
			} else if ((field == 'filewidth' || field == 'fileheight') && value > 0) {
				$('.sui-file-label').append(' ' + value + 'px');
			} else if (field == 'code') {
				control__drawUi__code(elem_id, field);
			} else if (type === 'form') {
				if (
					field === 'buttonfontweight' ||
					field === 'inputelsfontweight' ||
					field === 'inputtitlefontweight' ||
					field === 'inputfontweight' ||
					field === 'inputpos' ||
					field === 'inputfontfamily' ||
					field === 'fieldfontfamily' ||
					field === 'inputsstyle' ||
					field === 'inputsstyle2' ||
					field === 'buttonalign' ||
					field === 'buttonfontfamily' ||
					field === 'buttonuppercase' ||
					field === 'buttonfontfamily' ||
					field === 'formbottomcb'
				) {
					control__drawUi__selectbox(elem_id, field, false);
				} else if (
					field === 'buttonvariationweight' ||
					field === 'inputelsvariationweight' ||
					field === 'inputtitlevariationweight' ||
					field === 'inputvariationweight' ||
					field === 'inputfontsize' ||
					field === 'inputtitlefontsize' ||
					field === 'inputelsfontsize' ||
					field === 'buttonfontsize'
				) {
					control__drawUi__slider(elem_id, field, false);
				} else if (field == 'inputs') {
					control__drawUi__inputs(elem_id, field);
				} else if (field == 'receivers') {
					control__drawUi__receivers(elem_id, field);
				} else if (field != 'receivers_names') {
					control__drawUi__input(elem_id, field);
				}
			} else if (field === 'effects') {
				control__drawUi__selectbox(elem_id, 'effectstype');
				control__drawUi__slider(elem_id, 'effectsvalue');

				var filterData = elem__getFieldValue($el, 'effects');
				if (filterData) filterData = tn_parseCSSFilter(filterData);

				if (!filterData) {
					$('[data-control-field="effectsvalue"]').closest('.sui-panel__table').css('display', 'none');
				}
				$('[data-control-field="effects"]').closest('.sui-panel__table').css('display', 'none');
			} else if (field === 'vectorjson') {
				control__drawUi__vector(elem_id);
			} else {
				control__drawUi__input(elem_id, field);
			}

			if (!group__isSelectedOnlyGroups() && $('.tn-group__selected').length) {
				$('[data-control-field="width"]').closest('.sui-panel__table').css('display', 'none');
				$('[data-control-field="height"]').closest('.sui-panel__table').css('display', 'none');
			}

			if (res != window.tn.topResolution) {
				if (
					field == 'classname' ||
					field == 'shadowopacity' ||
					field == 'shadowcolor' ||
					field == 'zindex' ||
					field == 'tag' ||
					field == 'fontfamily' ||
					field == 'fontweight' ||
					field == 'lettercase' ||
					field == 'link' ||
					field == 'linktarget' ||
					field == 'relnofollow' ||
					field == 'buttonstat' ||
					field == 'img' ||
					field == 'bgimg' ||
					field == 'alt' ||
					field == 'figure' ||
					field == 'zoomable' ||
					field == 'lazyoff' ||
					field == 'pevent' ||
					field == 'code' ||
					field == 'vectorjson' ||
					field == 'inputs' ||
					(type === 'form' &&
						(field == 'inputfontfamily' ||
							field == 'fieldfontfamily' ||
							field == 'inputfontweight' ||
							field == 'inputcolor' ||
							field == 'inputbgcolor' ||
							field == 'inputbordercolor' ||
							field == 'inputelscolor' ||
							field == 'inputelsfontweight' ||
							field == 'inputtitlefontweight' ||
							field == 'inputtitlecolor' ||
							field == 'inputsstyle' ||
							field == 'inputsstyle2' ||
							field == 'buttontitle' ||
							field == 'buttoncolor' ||
							field == 'buttonbgcolor' ||
							field == 'buttonbordercolor' ||
							field == 'buttonhovercolor' ||
							field == 'buttonhoverbgcolor' ||
							field == 'buttonhoverbordercolor' ||
							field == 'buttonhovershadowsize' ||
							field == 'buttonfontfamily' ||
							field == 'buttonfontweight' ||
							field == 'formmsgcolor' ||
							field == 'formmsgbgcolor' ||
							field == 'formmsgsuccess' ||
							field == 'formmsgurl' ||
							field == 'formname' ||
							field == 'formbottomtext' ||
							field == 'formbottomcb' ||
							field == 'formerrreq' ||
							field == 'formerremail' ||
							field == 'formerrphone' ||
							field == 'formerrname')) ||
					(type === 'gallery' &&
						(field == 'color' ||
							field == 'slds_playiconcolor' ||
							field == 'slds_dotsbgcoloractive' ||
							field == 'slds_dotsbgcolor' ||
							field == 'slds_arrowbgopacityhover' ||
							field == 'slds_arrowbgopacity' ||
							field == 'slds_arrowbgcolorhover' ||
							field == 'slds_arrowbgcolor' ||
							field == 'slds_arrowcolorhover' ||
							field == 'slds_arrowcolor' ||
							field == 'imgs' ||
							field == 'slds_imgposition' ||
							field == 'slds_stretch' ||
							field == 'slds_arrowtype'))
				) {
					$cel.closest('.sui-panel__table').css('display', 'none');

					if (field == 'img') $cel.closest('.sui-panel__section-image').css('display', 'none');
					if (field == 'bgimg') $cel.closest('.sui-panel__section-bgimage').css('display', 'none');
					if (field == 'link') $cel.closest('.sui-panel__section-link').css('display', 'none');
					if (field == 'alt') $cel.closest('.sui-panel__section-tag').css('display', 'none');
					if (field == 'tag') $cel.closest('.sui-panel__section-tag').css('display', 'none');
					if (field == 'code') $cel.closest('.sui-panel__section-code').css('display', 'none');
					if (field == 'vectorjson') $cel.closest('.sui-panel__section-vectorjson').css('display', 'none');
					if (field == 'inputs') $cel.closest('.sui-panel__section-inputs').css('display', 'none');
					if (field == 'imgs') $cel.closest('.sui-panel__section-gallery-imgs').css('display', 'none');
					if (type === 'gallery') $cel.closest('.sui-panel__section-gallery-settings').css('display', 'none');
				} else {
					value_for_res = elem__getFieldValue_for_Res($el, field, res);

					if (typeof value_for_res == 'undefined' && !group__isSelectedOnlyGroups()) {
						$cel.addClass('sui-form-group_undefined');
					}

					if (field == 'animmobile' && res < 1200) {
						tn__updateUI__mobAnimation($el);
					}
				}
			}

			elCustomClassName = elem__getFieldValue($el, 'classname');
			if (!elCustomClassName) {
				$('[data-control-field="classname"]').closest('.sui-panel__table').css('display', 'none');
			}
			if (isCopiedAnimation) {
				$el.attr('data-field-' + field + '-value', value);
			}
		});

		$('[data-control-field="animmobile"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control-field="groupid"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control-field="amazonsrc"]').closest('.sui-panel__table').css('display', 'none');
		$('[data-control-field="uploaderror"]').closest('.sui-panel__table').css('display', 'none');

		if (fontWeight !== 'variation') {
			$('[data-control-field="variationweight"]').closest('.sui-panel__table').css('display', 'none');
		}
		if (inputFontWeight !== 'variation') {
			$('[data-control-field="inputvariationweight"]').closest('.sui-panel__table').css('display', 'none');
		}
		if (inputTitleFontWeight !== 'variation') {
			$('[data-control-field="inputtitlevariationweight"]').closest('.sui-panel__table').css('display', 'none');
		}
		if (inputElsFontWeight !== 'variation') {
			$('[data-control-field="inputelsvariationweight"]').closest('.sui-panel__table').css('display', 'none');
		}
		if (buttonFontWeight !== 'variation') {
			$('[data-control-field="buttonvariationweight"]').closest('.sui-panel__table').css('display', 'none');
		}

		if (window.tn.multi_edit) {
			$('[data-section-name="image"]').css('display', 'none');
			$('[data-section-name="imgs"]').css('display', 'none');
			$('[data-section-name="bgimg"]').css('display', 'none');
			$('[data-section-name="inputs"]').css('display', 'none');

			if (type.length > 1) {
				$panel.find('[data-section-name="formstyle"]').css('display', 'none');
				$panel.find('[data-section-name="formbuttonstyle"]').css('display', 'none');
				$panel.find('[data-section-name="arrows"]').css('display', 'none');
				$panel.find('[data-section-name="dots"]').css('display', 'none');
				$panel.find('[data-section-name="code"]').css('display', 'none');
				$panel.find('[data-section-name="tipimg"]').css('display', 'none');
				$panel.find('[data-section-name="playicon"]').css('display', 'none');
			}
		}
	}

	control__drawUi__actions(elem_id);

	if ($el) {
		control__drawUi__alignelem(elem_id);
		control__drawUi__animtest(elem_id);
		control__drawUi__sbsopenbtn(elem_id);
		control__drawUi__animmobile(elem_id);
	}

	if (group__isSelectedOnlyGroups()) {
		$('.sui-panel__toggleContainerFields').css('display', 'none');
	}

	if ($('.tn-artboard > .tn-elem__selected').length && $('.tn-group__selected').length) {
		$('.sui-panel__section-container').addClass('sui-panel__section_disable');
	}

	if (!$el || window.tn.multi_edit) {
		if (group__isSelectedOnlyGroups() && $('.tn-group__selected').length === 1) {
			groupId = $('.tn-group__selected').attr('id');
			control__drawUi__alignelem(groupId, true);
		} else {
			control__drawUi__alignelems();
		}
	}

	if (res != window.tn.topResolution) {
		if (type === 'tooltip') {
			$panel.find('.sui-panel__section-pin').css('display', 'none');
			$panel.find('.sui-panel__section-font').css('display', 'none');
			$panel.find('.sui-panel__section-shadow').css('display', 'none');
			$panel.find('.sui-panel__section-tip').css('display', 'none');
			$panel.find('.sui-panel__section-tipimg').css('display', 'none');
			$panel.find('.sui-panel__section-other').find('[data-control-field="opacity"]').css('display', 'none');
		}

		if (type === 'video') {
			$panel.find('.sui-panel__section-video').css('display', 'none');
			$panel.find('.sui-panel__section-videosett').css('display', 'none');
			$panel.find('.sui-panel__section-bgimg').css('display', 'none');
		}
	}
}

function panelSettings__toggle() {
	tn_console('func: panelSettings__toggle');
	$('.tn-right-box').toggleClass('tn-right-box_hide');
}

function panelSettings__showcontainerfields() {
	$('.sui-panel__toggleContainerFields').remove();
	$('.sui-panel__section-container').removeClass('sui-panel_hidden');
}

function panelSettings__updateGroupUi(group, field, new_value) {
	var updatedValue = new_value;
	var $c = $('[data-control-field=' + field + ']');
	var $inp = $('.tn-settings [name=' + field + ']');

	if (typeof updatedValue == 'undefined') updatedValue = group__getFieldValue(group, field);

	$c.attr('data-control-value', updatedValue);
	$inp.val(updatedValue);
}

function panelSettings__updateUi($el, field, new_value) {
	var res = window.tn.curResolution;
	var $c = $('[data-control-field=' + field + ']');
	var $inp = $('.tn-settings [name=' + field + ']');
	var $tsl;
	var widthunits;
	var $fdiv;
	var $flabel;
	var elem_id;
	var value_for_res;

	if (window.tn.multi_edit && typeof new_value === 'undefined') new_value = 'Mixed';
	if (typeof new_value == 'undefined') new_value = elem__getFieldValue($el, field);
	if (field == 'opacity') new_value = new_value * 100;
	if (field == 'animscale') new_value = new_value * 100;

	if (field == 'formmsgsuccess' || field == 'formbottomtext') {
		if (typeof new_value != 'undefined' && new_value != '') {
			new_value = $('<div>' + new_value + '</div>').text();
		}
	}

	$c.attr('data-control-value', new_value);
	$inp.val(new_value);

	// update slider
	$tsl = $c.find('.sui-slider');

	if ($tsl.length > 0) {
		$tsl.slider({value: parseFloat(new_value)});

		if (field == 'width') {
			widthunits = elem__getFieldValue($el, 'widthunits');

			if (widthunits == '%') {
				$tsl.slider({'min': 0, 'max': 100});
			} else {
				$tsl.slider({'min': 10, 'max': window.tn.topResolution});
			}
		}
	}

	// update color
	if (
		field == 'color' ||
		field == 'bgcolor' ||
		field == 'bordercolor' ||
		field == 'shadowcolor' ||
		field == 'bordercolorhover' ||
		field == 'colorhover' ||
		field == 'tipbgcolor' ||
		field == 'pincolor' ||
		field == 'pinbgcolor' ||
		field == 'pinbordercolor' ||
		field == 'slds_arrowcolor' ||
		field == 'slds_arrowcolorhover' ||
		field == 'slds_arrowbgcolor'
	) {
		control__drawUi__input($el.attr('id'), field);
	}

	// update color
	if (field == 'align') {
		$c.find('input:radio[name="align"]')
			.filter('[id="' + new_value + '"]')
			.prop('checked', true);
		$c.find('.sui-radio-div').buttonset('refresh');
	}

	if (field == 'lettercase') {
		$c.find('.sui-btn-lettercase').removeClass('sui-btn-lettercase_active');

		if (!new_value) {
			$c.find('.sui-btn-lettercase-reset').addClass('sui-btn-lettercase_active');
		} else {
			$c.find('input:radio[name="lettercase"]')
				.filter('[id="' + new_value + '"]')
				.prop('checked', true)
				.parent()
				.addClass('sui-btn-lettercase_active');
		}
	}

	if (field == 'fontweight') {
		$('[data-control-field="variationweight"]')
			.closest('.sui-panel__table')
			.css('display', new_value === 'variation' ? 'table' : 'none');
	}
	if (field == 'inputvariationweight') {
		$('[data-control-field="inputvariationweight"]')
			.closest('.sui-panel__table')
			.css('display', new_value === 'variation' ? 'table' : 'none');
	}
	if (field == 'inputtitlevariationweight') {
		$('[data-control-field="inputtitlevariationweight"]')
			.closest('.sui-panel__table')
			.css('display', new_value === 'variation' ? 'table' : 'none');
	}
	if (field == 'inputelsvariationweight') {
		$('[data-control-field="inputelsvariationweight"]')
			.closest('.sui-panel__table')
			.css('display', new_value === 'variation' ? 'table' : 'none');
	}
	if (field == 'buttonvariationweight') {
		$('[data-control-field="buttonvariationweight"]')
			.closest('.sui-panel__table')
			.css('display', new_value === 'variation' ? 'table' : 'none');
	}

	if (field == 'img' || field == 'bgimg' || field == 'tipimg') {
		$fdiv = $c.find('.sui-file-div');
		$flabel = $c.find('.sui-file-label');

		if (new_value != '') {
			$flabel.html('...' + new_value.substr(new_value.length - 15));
			$fdiv.css('display', 'block');
		} else {
			$flabel.html('');
			$fdiv.css('display', 'none');
		}
	}

	if (field == 'imgs' && !window.tn.multi_edit) {
		elem_id = $el.attr('id');
		control__drawUi__galleryupload(elem_id);
	}

	if (field == 'lock') {
		$fdiv = $('.tn-settings').find('.sui-btn-lock');

		if (new_value == 'y') {
			$fdiv.html('Unlock');
			$el.draggable('disable');
			$el.resizable('disable');
			$el.addClass('tn-elem__locked');
		} else {
			$fdiv.html('Lock');

			if (!elem__getFieldValue($el, 'groupid')) $el.draggable('enable');

			if ($el.closest('.tn-group').length) {
				if ($el.closest('.tn-group').hasClass('tn-group__open')) {
					$el.resizable('enable');
				}
			} else {
				$el.resizable('enable');
			}

			$el.removeClass('tn-elem__locked');
		}
	}

	if (field == 'invisible') {
		if (new_value == 'y') {
			$el.addClass('tn-elem__invisible');
		} else {
			$el.removeClass('tn-elem__invisible');
		}
	}

	if (res != window.tn.topResolution) {
		value_for_res = elem__getFieldValue_for_Res($el, field, res);

		if (typeof value_for_res == 'undefined' && !group__isSelectedOnlyGroups()) {
			$c.addClass('sui-form-group_undefined');
		} else {
			$c.removeClass('sui-form-group_undefined');
		}
	}

	if (res < 1200) {
		if (field == 'animmobile') {
			if (window.tn.multi_edit) {
				/**
				 * при мультиредактировании необходимо дождаться,
				 * когда соответствующие атрибуты будут проставлены для всех
				 * выделенных элементов - поэтому используем setTimeout
				 */
				setTimeout(function () {
					tn__updateUI__mobAnimation($el);
				}, 300);
			} else {
				tn__updateUI__mobAnimation($el);
			}
			elem_id = $el.attr('id');
			control__drawUi__animmobile(elem_id);
		}
	}

	if (field === 'effects' || field === 'effectstype' || field === 'effectsvalue') {
		var filterData = elem__getFieldValue($el, 'effects');
		var effectName = '';
		var effectValue = '';

		if (filterData) {
			filterData = tn_parseCSSFilter(filterData);
			effectValue = filterData ? filterData.value : 0;
			effectName = filterData.type;
			if (filterData.isBackdrop) effectName = 'bd_' + effectName;
		} else {
			effectValue = '';
			effectName = '';
		}

		$('.tn-settings [name=effectstype]').val(effectName);
		$('.tn-settings [name=effectsvalue]').val(effectValue);
		$('[data-control-field=effectstype]').attr('data-control-value', effectName);
		$('[data-control-field=effectsvalue]').attr('data-control-value', effectValue);

		if (effectName) {
			control__drawUi__slider($el.attr('id'), 'effectsvalue');
			$('.tn-settings [data-control-field="effectsvalue"]').closest('.sui-panel__table').css('display', 'table');
		} else {
			$('.tn-settings [data-control-field="effectsvalue"]').closest('.sui-panel__table').css('display', 'none');
		}
	}

	if (field === 'bgposition') {
		var isBgpositionFieldFilled = !!elem__getFieldValue($el, 'bgimg');
		var $customField = $c.find('option[value="custom"]');
		var $editBtn = $c.find('.js-shape-bg-position-edit');

		if (isBgpositionFieldFilled) {
			$customField.css('display', '');
			$editBtn.css('display', '');
		} else {
			$customField.css('display', 'none');
			$editBtn.css('display', 'none');
		}
	}

	tn_tooltip_update();
}

function tn__updateUI__mobAnimation($el) {
	var animObj = {};
	var animProps = ['animmobile', 'animstyle', 'animprx', 'animfix', 'sbsevent'];
	animProps.forEach(function (prop) {
		animObj[prop] = '';
	});
	animObj.hasBasicAnim = false;

	if (window.tn.multi_edit) {
		var selectedList = window.tn.multi_edit_elems.get();
		if (!selectedList.length) return;

		/**
		 * 1. создаём объект с ключами из переменной animProps, причем ключ должен быть массивом
		 * 2. итерируем выделенные элементы, если у них есть нужное нам свойство - добавляем в массив любое значение
		 * 3. сформированный объект для двух выделенных элементов будет иметь примерно такой вид:
		 * {animmobile: ["y", "y"], animstyle: ["y", "y"], animprx: [], animfix: [], sbsevent: []},
		 * что говорит о том, что на двух элементах включена моб. анимация, и на двух есть базовая анимация.
		 * Таким образом можно подсчитать для группы элементов важные параметры без дополнительных итераций.
		 */
		var selectedObj = selectedList.reduce(function (prev, next) {
			animProps.forEach(function (prop) {
				if (typeof prev[prop] === 'undefined') prev[prop] = [];
				if (elem__getFieldValue_for_Res($(next), prop, window.tn.topResolution)) prev[prop].push('y');
			});
			return prev;
		}, {});

		if (selectedObj.animmobile.length === 0) {
			animObj.animmobile = false;
		} else if (selectedObj.animmobile.length === selectedList.length) {
			animObj.animmobile = 'y';
		} else {
			animObj.animmobile = 'diff-group';
		}
		animObj.animstyle = selectedObj.animstyle.length === selectedList.length;
		animObj.animprx = selectedObj.animprx.length === selectedList.length;
		animObj.animfix = selectedObj.animfix.length === selectedList.length;
		animObj.sbsevent = selectedObj.sbsevent.length === selectedList.length;
		animObj.hasBasicAnim = selectedObj.animstyle.length || selectedObj.animprx.length || selectedObj.animfix.length;
	} else {
		for (var key in animObj) {
			animObj[key] = elem__getFieldValue_for_Res($el, key, window.tn.topResolution);
		}
		animObj.hasBasicAnim = animObj.animstyle || animObj.animprx || animObj.animfix;
	}

	if (animObj.animmobile === 'diff-group') {
		$('.sui-panel__section-anim').css('display', 'none');
		$('.sui-panel__section-sbsopenbtn').css('display', 'none');
		$('.sui-panel__section-animmobile').css('display', 'none');
		$('.sui-panel__section-animmobilediff').css('display', 'block');
	} else if (animObj.animmobile === 'y') {
		$('.sui-panel__section-anim').css('display', animObj.hasBasicAnim ? 'block' : 'none');
		$('.sui-panel__section-sbsopenbtn').css('display', animObj.sbsevent ? 'block' : 'none');
		$('.sui-panel__section-animmobilediff').css('display', 'none');
	} else {
		$('.sui-panel__section-anim').css('display', 'none');
		$('.sui-panel__section-sbsopenbtn').css('display', 'none');
		$('.sui-panel__section-animmobilediff').css('display', 'none');
		$('.sui-panel__section-animmobile').css('display', animObj.hasBasicAnim || animObj.sbsevent ? 'block' : 'none');
	}
}

function control__drawUi__paddingelems() {
	var $panel = $('.tn-settings');
	var flag_diffaxis = false;
	var foo_container;
	var foo_axisx;
	var foo_axisy;
	var foo_leftunits;
	var foo_topunits;
	var foo_widthunits;
	var $inp;

	$('.tn-elem__selected').each(function (i) {
		var $el = $(this);
		var container = elem__getFieldValue($el, 'container');
		var axisx = elem__getFieldValue($el, 'axisx');
		var axisy = elem__getFieldValue($el, 'axisy');
		var leftunits = elem__getFieldValue($el, 'leftunits');
		var topunits = elem__getFieldValue($el, 'topunits');
		var widthunits = elem__getFieldValue($el, 'widthunits');

		if (leftunits == 'px') leftunits = '';
		if (topunits == 'px') topunits = '';
		if (typeof widthunits == 'undefined' || widthunits == 'px') widthunits = '';

		if (i == 0) {
			foo_container = container;
			foo_axisx = axisx;
			foo_axisy = axisy;
			foo_leftunits = leftunits;
			foo_topunits = topunits;
			foo_widthunits = widthunits;
		} else {
			if (
				foo_container != container ||
				foo_axisx != axisx ||
				foo_axisy != axisy ||
				foo_leftunits != leftunits ||
				foo_topunits != topunits ||
				foo_widthunits != widthunits
			) {
				flag_diffaxis = true;
			}
		}
	});

	var fieldsArr = ['horizontalpadding', 'verticalpadding'];

	fieldsArr.forEach(function (field) {
		var $c = $panel.find('[data-control-field=' + field + ']');
		var $inp = $c.find('input');

		if (flag_diffaxis === true) {
			$c.css('opacity', '0.3').css('pointer-events', 'none');
		} else {
			$c.css('opacity', '1').css('pointer-events', 'auto');
		}

		setTimeout(function () {
			$c.find('.sui-slider').slider({
				range: 'max',
				min: 0,
				max: 1000,
				/* Сомнения насчёт значения для шага */
				step: 5,
				value: $inp.closest('.sui-form-group').attr('data-control-value'),
				start: function () {
					$c.removeClass('sui-form-group_undefined');
				},
				slide: function (event, ui) {
					var v = ui.value;
					$inp.val(v);
					$inp.closest('.sui-form-group').attr('data-control-value', v);
					$inp.trigger('change');
				},
			});
			$('.sui-slider .ui-slider-handle').unbind('keydown');
		}, 1);

		$inp.focusin(function () {
			window.tn_flag_settings_ui_focus = true;
		});

		$inp.focusout(function () {
			window.tn_flag_settings_ui_focus = false;
		});

		$inp.keydown(function (e) {
			tn_console(e.which);

			var $this = $(this);
			var val;

			window.tn_flag_settings_ui_focus = true;

			if (e.which == 38) {
				val = parseFloat($this.val());
				if (isNaN(val)) val = 0;
				val = val + 1;

				$this.val(val);
				$this.trigger('change');
				$this.parents('.sui-form-group').find('.sui-slider').slider('value', val);
			}
			if (e.which == 40) {
				val = parseFloat($this.val());
				if (isNaN(val)) val = 0;
				val = val - 1;

				$this.val(val);
				$this.trigger('change');
				$this.parents('.sui-form-group').find('.sui-slider').slider('value', val);
			}
		});

		$inp.change(function () {
			tn_console('panelsettings onchange input');
			var $this = $(this);
			var val = $this.val();
			val = tn_calculateInputNumber(val);
			val = parseInt(val, 10);

			if (val == '') val = 0;
			if (val > 1000) val = 1000;
			if (val < -1000) val = -1000;
			if (isNaN(val)) val = 1;

			/* Была проверка, при которой значение = 0, если что-то не то вводили,
					но нижняя граница для этих полей === 1, если я не ошибаюсь.
					Так что пока закомментила эти условия, когда сверимся или удалю, или верну.
			*/
			// if (Math.sign(val) === -1 || val > 1000) val = 0;
			// if (isNaN(val)) val = 0;

			$this.val(val);
			$this.parents('.sui-form-group').find('.sui-slider').slider('value', val);

			tn_undo__Add('elems_selected_move');

			if ($this.attr('name') == 'horizontalpadding') {
				setAverageHorizontalPadding(val);
			}

			if ($this.attr('name') == 'verticalpadding') {
				setAverageVerticalPadding(val);
			}

			tn_set_lastChanges();
		});
	});
}

function panelSettings__copyAnimation(elem_id) {
	var $el = $('#' + elem_id);
	var basicAnimationObj = {};
	var fields = [
		'animstyle',
		'animduration',
		'animdelay',
		'animtriggeroffset',
		'animscale',
		'animdistance',
		'animprx',
		'animfix',
		'animprxs',
		'animprxdx',
		'animprxdy',
		'animfixdist',
		'animfixtrgofst',
		'animmobile',
	];
	var fieldsWithRes = [
		'animstyle',
		'animduration',
		'animdistance',
		'animdelay',
		'animtriggeroffset',
		'animprx',
		'animprxs',
		'animfix',
		'animfixtrgofst',
		'animfixdist',
	];

	fields.forEach(function (field) {
		basicAnimationObj[field] =
			typeof elem__getFieldValue($el, field) !== 'undefined' ? elem__getFieldValue($el, field) : '';
	});

	window.tn.screens.forEach(function (s) {
		if (s == window.tn.topResolution) return; //continue (skip)
		fieldsWithRes.forEach(function (field) {
			basicAnimationObj[field + '-res-' + s] =
				typeof elem__getFieldValue_for_Res($el, field, s) !== 'undefined'
					? elem__getFieldValue_for_Res($el, field, s)
					: '';
		});
	});

	localStorage.setItem('tzerobasicanimation', JSON.stringify(basicAnimationObj));
}

function panelSettings__pasteAnimation() {
	var elemsIdArr = [];

	$('.tn-elem__selected').each(function () {
		elemsIdArr.push($(this).data('elem-id'));
	});

	elemsIdArr.forEach(function (item) {
		var $el = $('#' + item);
		var type = $el.attr('data-elem-type');
		var fields = $el.attr('data-fields');

		panelSettings__addControls(item, $el, type, fields, true);
	});
}

function panelSettings__pasteAnimationAttr(elem_id) {
	var $el = $('#' + elem_id);
	var animationObj = JSON.parse(localStorage.getItem('tzerobasicanimation'));

	for (var field in animationObj) {
		elem__setFieldValue($el, field, animationObj[field], 'render', 'updateui');

		if (field.indexOf('-res-') !== -1 && animationObj[field] === '') {
			elem__delFieldValue($el, field);
		}
	}
}

function panelSettings__cleanBasicAnimtion($el) {
	panelSettings__updateUi($el, 'animduration', '');
	panelSettings__updateUi($el, 'animdelay', '');
	panelSettings__updateUi($el, 'animdistance', '');
	panelSettings__updateUi($el, 'animscale', '');
	panelSettings__updateUi($el, 'animtriggeroffset', '');
	panelSettings__updateUi($el, 'animprx', '');
	panelSettings__updateUi($el, 'animprxs', '');
	panelSettings__updateUi($el, 'animprxdy', '');
	panelSettings__updateUi($el, 'animprxdx', '');
	panelSettings__updateUi($el, 'animfix', '');
	panelSettings__updateUi($el, 'animfixdist', '');
	panelSettings__updateUi($el, 'animfixtrgofst', '');
	panelSettings__updateUi($el, 'animstyle', '');
	control__drawUi__selectbox($el.attr('id'), 'animstyle');
	control__drawUi__selectbox($el.attr('id'), 'animprx');
	control__drawUi__selectbox($el.attr('id'), 'animfix');
}

function panelSettings__addAlignContextMenu() {
	var $panel = $('.tn-settings');
	$panel.find('.sui-btn-context-distribution').on('click', function () {
		var $box = $('.tn-contextmenu-box_align');
		if ($box.length === 0) {
			$('[data-control="alignelem"]').append(panelSettings__drawAlignContextMenu());
			var top = parseInt($('.sui-table-align').position().top + $('.sui-table-align').outerHeight(), 10);
			$box = $('.tn-contextmenu-box_align');
			$box.css({right: 0, top: top});
		} else {
			panelSettings__closeAlignContextMenu($box);
		}
	});

	$(document).mouseup(function (e) {
		var $box = $('.tn-contextmenu-box_align');
		if ($box.length !== 0) {
			var $btn = $('.sui-btn-context-distribution');
			if (
				!$box.is(e.target) &&
				$box.has(e.target).length === 0 &&
				!$btn.is(e.target) &&
				$btn.has(e.target).length === 0
			) {
				panelSettings__closeAlignContextMenu($box);
			}
		}
	});

	$(document).on('click', '.tn-contextmenu-box_align .tn-contextmenu-box__item', function () {
		panelSettings__closeAlignContextMenu($('.tn-contextmenu-box_align'));
	});

	$(document).off('click', '.tn-contextmenu-box__item_tidyup');
	$(document).on('click', '.tn-contextmenu-box__item_tidyup', function () {
		tn_undo__Add('elems_selected_move');
		smartAlignElements();
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_verticalspacing');
	$(document).on('click', '.tn-contextmenu-box__item_verticalspacing', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeSpacing('vertical');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_horizontalspacing');
	$(document).on('click', '.tn-contextmenu-box__item_horizontalspacing', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeSpacing('horizontal');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_leftedges');
	$(document).on('click', '.tn-contextmenu-box__item_leftedges', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeEdges('horizontal', 'left');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_verticalcenters');
	$(document).on('click', '.tn-contextmenu-box__item_verticalcenters', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeEdges('horizontal', 'coordCenterHorizontal');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_rightedges');
	$(document).on('click', '.tn-contextmenu-box__item_rightedges', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeEdges('horizontal', 'right');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_topedges');
	$(document).on('click', '.tn-contextmenu-box__item_topedges', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeEdges('vertical', 'top');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_horizontalcenters');
	$(document).on('click', '.tn-contextmenu-box__item_horizontalcenters', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeEdges('vertical', 'coordCenterVertical');
		tn_set_lastChanges();
	});

	$(document).off('click', '.tn-contextmenu-box__item_bottomedges');
	$(document).on('click', '.tn-contextmenu-box__item_bottomedges', function () {
		tn_undo__Add('elems_selected_move');
		smartAlign__distributeEdges('vertical', 'bottom');
		tn_set_lastChanges();
	});
}

function panelSettings__closeAlignContextMenu($box) {
	$box.remove();
}
