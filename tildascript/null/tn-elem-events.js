function group__addUiClickEvents($group) {
	tn_console('func: addUiClick');

	$group.contextmenu(function (event) {
		var $target = $(event.target);
		var isTargetElem = $target.closest('.tn-elem').length;
		if ($group.hasClass('tn-group__open') && isTargetElem) {
			var $elem = $target.closest('.tn-elem');
			contextMenu__open($elem, event);
		} else if (!$group.hasClass('tn-group__selected')) {
			contextMenu__open(null, event);
		} else if ($target.parents('.tn-elem').length === 0) {
			contextMenu__open($group, event);
		}
	});

	$group.dblclick(function (event) {
		var lock = group__getFieldValue($group, 'lock');
		if ($group.hasClass('tn-group__selected') && lock !== 'y') {
			var elem = event.target.closest('.tn-elem');
			elem__select($(elem));

			tn_hideOutline('hover');
		}
	});

	$group.click(function (event) {
		var target = $(event.target);
		var isSelected = $group.hasClass('tn-group__selected');
		var isTargetElement = target.closest('.tn-elem').length;
		var isEditMode = target.closest('.tn-elem[data-edit-mode="yes"]').length;
		if (!isSelected && !isTargetElement && !isEditMode && !window.tn_flag_settings_ui_focus) {
			floor__mousedown(event);
		}
	});

	$group.mousedown(function (event) {
		elem__mouseDown($group, event);
	});

	elem__addDraggable($group, {isGroup: true});

	$group.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__text($el) {
	tn_console('func: addUiClick');
	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: false,
		handles: 'none',
		snap: '.tn-elem, .tn-guide, .tn-canvas-min, .tn-canvas-max',
		grid: [10, 10],
	});

	$el.resizable('disable');

	$el.dblclick(function (event) {
		var groupId = elem__getFieldValue($el, 'groupid');
		var lock = elem__getFieldValue($el, 'lock');
		var isInsideGroup = false;
		if (groupId) isInsideGroup = $('.tn-group#' + groupId).hasClass('tn-group__open');

		if (
			(!groupId || isInsideGroup) &&
			$el.attr('data-edit-mode') !== 'yes' &&
			lock != 'y' &&
			!$el.find('.tn-atom__sbs-anim-wrapper').length
		) {
			if (window.ver_redactor === 'q') {
				editElementField($el, event);
			} else {
				editElementField_redactor($el);
			}
		}
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__image($el) {
	tn_console('func: addUiClick__image');

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: true,
		handles: 'none',
		grid: [10, 10],
	});

	$el.resizable('disable');

	var $el_img = $el.find('img');

	$(document).ready(function () {
		TUWidget.init($el_img)
			.done(function (file) {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				elem__setFieldValue($el, 'img', file.tuInfo.cdnUrl, '', '', window.tn.topResolution);
				if (file.tuInfo.width > 1)
					elem__setFieldValue($el, 'filewidth', file.tuInfo.width, '', '', window.tn.topResolution);
				if (file.tuInfo.height > 1)
					elem__setFieldValue($el, 'fileheight', file.tuInfo.height, '', '', window.tn.topResolution);
				elem__renderViewOneField($el, 'img');
				elem__renderViewOneField($el, 'width');
				panelSettings__updateUi($el, 'img');
				panelSettings__updateUi($el, 'width');
				panelSettings__updateUi($el, 'left');
				panelSettings__updateUi($el, 'top');
			})
			.fail(function () {});
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__shape($el) {
	tn_console('func: addUiClick__shape');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: false,
		handles: 'none',
		grid: [1, 1],
	});

	$el.resizable('disable');

	var $el_bgimg = $el.find('.tn-atom');

	$(document).ready(function () {
		TUWidget.init($el_bgimg)
			.done(function (file) {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				elem__setFieldValue($el, 'bgimg', file.tuInfo.cdnUrl, '', '', window.tn.topResolution);
				elem__renderViewOneField($el, 'bgimg');
				panelSettings__updateUi($el, 'bgimg');

				var bgPosition = elem__getFieldValue($el, 'bgposition');
				if ($el.attr('data-elem-type') === 'shape' && bgPosition === 'custom') {
					elem__setFieldValue($el, 'bgposition', 'center center', 'render');
					elem__setFieldValue($el, 'bgposition_imgpos', '', 'render');
					elem__setFieldValue($el, 'bgposition_imgsize', '', 'render');

					panelSettings__updateUi($el, 'bgposition');
				}
			})
			.fail(function () {});
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__button($el) {
	tn_console('func: addUiClick_button');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: false,
		handles: 'none',
		grid: [10, 10],
	});

	$el.resizable('disable');

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__video($el) {
	tn_console('func: addUiClick__video');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: false,
		handles: 'none',
		grid: [1, 1],
	});

	$el.resizable('disable');

	var el_bgimg = $el.find('.tn-atom');

	$(document).ready(function () {
		TUWidget.init(el_bgimg)
			.done(function (file) {
				tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
				elem__setFieldValue($el, 'bgimg', file.tuInfo.cdnUrl, '', '', window.tn.topResolution);
				elem__renderViewOneField($el, 'bgimg');
				panelSettings__updateUi($el, 'bgimg');
			})
			.fail(function () {});
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__html($el) {
	tn_console('func: addUiClick__html');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: false,
		handles: 'none',
		grid: [1, 1],
	});

	$el.resizable('disable');

	$el.dblclick(function () {
		var parentGroup = $el.closest('.tn-group');
		var canOpen = true;
		if (parentGroup.length) {
			var isGroupOpen = parentGroup.hasClass('tn-group__open');
			var isGroupLocked = group__getFieldValue(parentGroup, 'lock') === 'y';
			canOpen = isGroupOpen && !isGroupLocked;
		}

		if (elem__getFieldValue($el, 'lock') != 'y' && canOpen) {
			tn_html__openEditor($el.attr('data-elem-id'));
		}
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__tooltip($el) {
	tn_console('func: addUiClick__tooltip');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
		elem__renderViewOneField($el, 'tipposition');
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	$el.resizable({
		distance: 3,
		aspectRatio: true,
		handles: 'none',
		grid: [1, 1],
	});

	$el.resizable('disable');

	$el.dblclick(function (event) {
		var parentGroup = $el.closest('.tn-group');
		var canOpen = true;
		if (parentGroup.length) {
			var isGroupOpen = parentGroup.hasClass('tn-group__open');
			var isGroupLocked = group__getFieldValue(parentGroup, 'lock') === 'y';
			canOpen = isGroupOpen && !isGroupLocked;
		}

		if (
			canOpen &&
			$el.attr('data-edit-mode') !== 'yes' &&
			elem__getFieldValue($el, 'lock') != 'y' &&
			!$el.find('.tn-atom__sbs-anim-wrapper').length
		) {
			if (window.ver_redactor === 'q') {
				editElementField($el, event);
			} else {
				editElementField_redactor($el);
			}
		}
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__form($el) {
	tn_console('func: addUiClick__form');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: false,
		handles: 'e, w',
		snap: '.tn-elem, .tn-guide, .tn-canvas-min, .tn-canvas-max',
		grid: [10, 10],
	});

	$el.resizable('disable');

	$el.dblclick(function () {
		var $parentGroup = $el.closest('.tn-group');
		var canOpen = true;
		if ($parentGroup.length) {
			var isGroupOpen = $parentGroup.hasClass('tn-group__open');
			var isGroupLocked = group__getFieldValue($parentGroup, 'lock') === 'y';
			canOpen = isGroupOpen && !isGroupLocked;
		}

		if (canOpen && elem__getFieldValue($el, 'lock') != 'y') {
			$.getScript('/front/js/t-edrec-form.min.js', function (data, textStatus) {
				if (textStatus == 'success') {
					setTimeout(function () {
						tn_form__openEditor($el.attr('data-elem-id'));
					}, 500);
				} else {
					alert('Error open edit form inputs in zeroblock');
				}
			});
		}
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__gallery($el) {
	tn_console('func: addUiClick__gallery');

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		alsoResize: $($el).find('.t-slds__main, .t-slds__main, .tn-atom__slds-img'),
		handles: 'none',
	});

	var $el_img_list = $el.find('.tn-atom__slds-img');

	$(document).ready(function () {
		$el_img_list.each(function (i) {
			if ($(this)[0].tildaupload) return;
			TUWidget.init($(this))
				.done(function (file) {
					tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : $el);
					var imgId = $(this.element).attr('data-img-lid');
					var imgs = JSON.parse(elem__getFieldValue($el, 'imgs'));
					for (var i = 0; i < imgs.length; i++) {
						var imgData = imgs[i];
						if (imgId == imgData.lid) {
							imgData.li_img = file.tuInfo.cdnUrl;
						}
					}
					elem__setFieldValue($el, 'imgs', JSON.stringify(imgs));
					if (file.tuInfo.width > 1)
						elem__setFieldValue($el, 'filewidth', file.tuInfo.width, '', '', window.tn.topResolution);
					if (file.tuInfo.height > 1)
						elem__setFieldValue($el, 'fileheight', file.tuInfo.height, '', '', window.tn.topResolution);
					elem__renderViewOneField($el, 'imgs');
					elem__renderViewOneField($el, 'width');
					elem__renderViewOneField($el, 'height');
					panelSettings__updateUi($el, 'imgs');
					panelSettings__updateUi($el, 'width');
					panelSettings__updateUi($el, 'left');
					panelSettings__updateUi($el, 'top');
				})
				.fail(function () {});
		});
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function elem__addUiClickEvents__vector($el) {
	tn_console('func: addUiClick__vector');

	window.clicktimeoutId = false;

	$el.click(function (event) {
		elem__Click($el, event);
	});

	$el.contextmenu(function (event) {
		contextMenu__open($el, event);
	});

	$el.mousedown(function (event) {
		elem__mouseDown($el, event);
	});

	elem__addDraggable($el);

	// TODO: REMOVE
	$el.resizable({
		distance: 3,
		aspectRatio: true,
		handles: 'none',
		grid: [10, 10],
	});

	$el.resizable('disable');

	$el.dblclick(function () {
		var parentGroup = $el.closest('.tn-group');
		var canOpen = true;
		if (parentGroup.length) {
			var isGroupOpen = parentGroup.hasClass('tn-group__open');
			var isGroupLocked = group__getFieldValue(parentGroup, 'lock') === 'y';
			canOpen = isGroupOpen && !isGroupLocked;
		}

		if (elem__getFieldValue($el, 'lock') != 'y' && canOpen) {
			tn_vector__openEditor($el.attr('data-elem-id'));
			if (window.tn.curResolution != window.tn.topResolution) {
				td__showBubbleNotice('After saving, shape will be updated at all resolutions', 8000);
			}
		}
	});

	$el.on('mouseover', elem__hoverIn).on('mouseout', elem__hoverOut);
}

function tn_addUiClickEvents__outline($outline) {
	var isSnapDisabled = tn_getLocalField('isSnapDisabled');
	var snapValue = isSnapDisabled ? false : '.tn-elem, .tn-group, .tn-guide, .tn-canvas-min, .tn-canvas-max';
	var rotateAnchors;

	$outline
		.resizable({
			distance: 3,
			aspectRatio: false,
			handles: 'all',
			snap: snapValue,
			grid: [1, 1],
			start: function (event, ui) {
				rotateAnchors = $outline[0].querySelectorAll('.tn-outline__rotate-anchor');
				rotateAnchors.forEach(function (anchor) {
					anchor.style.pointerEvents = 'none';
				});

				$outline.resizable('option', 'minWidth', 10);
				$outline.resizable('option', 'minHeight', 10);
				$outline.resizable('option', 'maxWidth', false);

				tn_undo__Add('elem_save', $('.tn-elem__selected'));

				var $elements = $('.tn-elem__selected, .tn-elem__fake');
				var textItemsCount = $elements.filter('[data-elem-type="text"], [data-elem-type="form"]').length;

				window.isSelectedTextOnly = false;

				if ($elements.length === textItemsCount) {
					window.isSelectedTextOnly = true;
				}

				if ($elements.filter('.tn-elem__locked').length) return;

				var zoom = window.tn.zoom;
				var $groups = $('.tn-group__selected');

				if (
					$elements.filter('[data-elem-type="image"], [data-elem-type="tooltip"], [data-elem-type="vector"]').length &&
					!window.isSelectedTextOnly
				) {
					$outline.resizable('option', 'aspectRatio', true).data('uiResizable')._aspectRatio = true;
				} else {
					$outline.resizable('option', 'aspectRatio', false).data('uiResizable')._aspectRatio = false;
				}

				tn_console('resize: start');

				$groups.each(function (index, group) {
					$(group).addClass('tn-group__on-resize');

					group.startWidth = parseInt($(group).css('width'), 10);
					group.startHeight = parseInt($(group).css('height'), 10);
				});

				var elemsHaveGallery = false;

				$elements.each(function (index, el) {
					var elType = el.dataset.elemType;

					if (elType === 'gallery') {
						$outline.resizable('option', 'minWidth', 200);
						$outline.resizable('option', 'minHeight', 200);
						elemsHaveGallery = true;
					}

					if (elType === 'video' && !elemsHaveGallery) {
						var height = 156;
						if (elem__getFieldValue($(el), 'vidtype') === 'html') {
							var video = el.querySelector('video');
							if (video) {
								var ratio = video.videoWidth / video.videoHeight;
								var currentWidth = elem__getFieldValue($(el), 'width');
								height = Math.floor(currentWidth / ratio) || 156;
								if (height < 156) height = 156;
							}
						}
						$outline.resizable('option', 'minWidth', 156);
						$outline.resizable('option', 'minHeight', height);
					}

					if (elType === 'tooltip' && $elements.length === 1) {
						$outline.resizable('option', 'maxWidth', 200);
					}

					$(el).addClass('tn-elem__on-resize');
					$(el).addClass('noclick');
					el.startWidth = $(el).width();

					if (elType === 'tooltip') {
						el.startHeihgt = el.startWidth;
					} else if (elType === 'image' || elType === 'vector') {
						var imageHeight = $(el).height();
						el.aspectRatio = imageHeight / el.startWidth;
						el.startHeihgt = el.startWidth * el.aspectRatio;
					} else {
						el.startHeihgt = $(el).height();
					}

					var groupid = elem__getFieldValue($(el), 'groupid');
					var $group = $('#' + groupid);

					if (groupid) {
						el.groupRelCoords = {
							top: parseInt($(el).css('top')),
							left: parseInt($(el).css('left')),
						};

						$group[0].outlineRelCoords = tn_outline__getRelativePosition($outline, $group);
					}

					el.outlineRelCoords = tn_outline__getRelativePosition($outline, $(el));
					el.lastHeight = el.startHeihgt;
				});

				$outline.startWidth = ui.originalSize.width * zoom;
				$outline.startHeight = ui.originalSize.height * zoom;
			},
			resize: function (event, ui) {
				var $elements = $('.tn-elem__selected, .tn-elem__fake');
				var mouseEvent = event.originalEvent;

				if (
					$elements.filter('[data-elem-type="image"], [data-elem-type="tooltip"], [data-elem-type="vector"]').length &&
					!window.isSelectedTextOnly
				) {
					$outline.resizable('option', 'aspectRatio', true).data('uiResizable')._aspectRatio = true;
				} else {
					$outline.resizable('option', 'aspectRatio', false).data('uiResizable')._aspectRatio = false;
				}

				if ($elements.filter('.tn-elem__locked').length) {
					ui.element.css(ui.originalPosition);
					ui.element.css(ui.originalSize);

					return;
				}

				var $groups = $('.tn-group__selected');
				var $oultineDescription = $outline.find('.tn-outline__size__text');
				var zoom = window.tn.zoom;
				var factorX = (parseFloat($outline.css('width')) * zoom) / $outline.startWidth;
				var factorY = (parseFloat($outline.css('height')) * zoom) / $outline.startHeight;
				var newOutlineWidth = Math.round($outline.width());
				var newOutlineHeight = Math.round($outline.height());

				$elements.each(function (index, element) {
					var $el = $(element);
					var elHeight;

					elem__resizeWithOutline(element, ui, factorX, factorY);

					elHeight = $el.height();

					if (window.isSelectedTextOnly && elHeight !== element.lastHeight) {
						if (mouseEvent.ctrlKey) $el.css('top', $el.position().top - (elHeight - element.lastHeight) / 2 + 'px');

						tn_setOutlinePosition('selected');

						element.lastHeight = $el.height();
						newOutlineWidth = Math.round($outline.width());
						newOutlineHeight = Math.round($outline.height());
					}
				});

				$groups.each(function (index, group) {
					$(group).css({
						'width': group.startWidth * factorX,
						'height': group.startHeight * factorY,
					});
				});

				$oultineDescription.html(newOutlineWidth + ' &#215; ' + newOutlineHeight);

				if (window.isAltDown) {
					tn_setRulersPosition();
				}
			},
			stop: function (event) {
				tn_console('resize: stop');

				var $elements = $('.tn-elem__selected, .tn-elem__fake');
				if ($elements.filter('.tn-elem__locked').length) return;
				var $groups = $('.tn-group__selected');

				rotateAnchors.forEach(function (anchor) {
					anchor.style.pointerEvents = '';
				});

				$elements.each(function (index, el) {
					var $el = $(el);
					var elType = $(el).attr('data-elem-type');

					elem__Save__currentHeight($el);
					elem__Save__currentWidth($el);
					elem__Save__currentPosition($el);

					if (elType === 'image' || elType === 'vector') $el.css('height', '');

					setTimeout(function () {
						$(el).removeClass('noclick');
					}, 10);
					$(el).removeClass('tn-elem__on-resize');

					if (tn_shapeBorderRadius__shouldShowHandle(el)) {
						tn_shapeBorderRadius__setHandlePosition(el);
					}
				});

				if ($elements.length > 1) {
					tn_multiEdit__updateUi();
					var fakeEl = $('.tn-elem__fake');
					var width = elem__getFieldValue(fakeEl, 'width');
					var height = elem__getFieldValue(fakeEl, 'height');
					panelSettings__updateUi(fakeEl, 'width', width == 0 ? undefined : width);
					panelSettings__updateUi(fakeEl, 'height', height == 0 ? undefined : height);
				}

				$groups.each(function (index, group) {
					var groupid = group.id;

					$(group).removeClass('tn-group__on-resize');

					group__setPositionByElemsAttrs(groupid);
					group__updateGroupSizesUI(groupid, 'width');
					group__updateGroupSizesUI(groupid, 'height');
				});

				tn_set_lastChanges();
				event.stopImmediatePropagation();
				tn_setOutlinePosition('selected');
				tn_updateOutlineDescription();
			},
		})
		.on('resize', function (event) {
			event.stopPropagation();
		});

	var resizable = $outline.data('uiResizable');
	var oldMouseDrag = resizable._mouseDrag;

	resizable._mouseDrag = function (event) {
		if (window.isSelectedTextOnly) {
			event.shiftKey = false;
		}

		return oldMouseDrag.call(this, event);
	};
}

/* ------------------------ */
/* ------------------------ */
/* ------------------------ */
/* Common functions with EVENTS */

function elem__startResize(ui, $el) {
	var zoom = window.tn.zoom;

	ui.originalSize.width = ui.originalSize.width * zoom;
	ui.originalSize.height = ui.originalSize.height * zoom;

	$el.addClass('tn-elem__on-resize');

	tn_hideOutline('hover');
}

function elem__resize($el, event, ui, withRatio) {
	var zoom = window.tn.zoom;
	var axis = $el.data('ui-resizable').axis;

	if (withRatio) {
		ui.size.width = ui.size.width / zoom;
		ui.size.height = ui.size.height / zoom;
	} else if (axis == 'w' || axis == 'e') {
		ui.size.width = ui.size.width / zoom;
		ui.size.height = ui.originalSize.height / zoom;
		ui.position.top = ui.originalPosition.top;
	} else if (axis == 'n' || axis == 's') {
		ui.size.height = ui.size.height / zoom;
		ui.size.width = ui.originalSize.width / zoom;
		ui.position.left = ui.originalPosition.left;
	} else {
		ui.size.width = ui.size.width / zoom;
		ui.size.height = ui.size.height / zoom;
	}
}

function elem__resizeWithOutline(element, ui, factorX, factorY) {
	var $el = $(element);
	var elType = $el.attr('data-elem-type');
	var elWidth = Math.round(element.startWidth * factorX);
	var elHeight = Math.round(element.startHeihgt * factorY);
	var groupId = elem__getFieldValue($el, 'groupid');
	var groupRelPosition = {
		top: 0,
		left: 0,
	};
	var group;
	var newElRelX;
	var newElRelY;
	var elTop;
	var elLeft;

	if (groupId) {
		group = $('#' + groupId);
		groupRelPosition = group[0].outlineRelCoords;

		if (group.hasClass('tn-group__selected')) {
			elTop = element.groupRelCoords.top * factorY;
			elLeft = element.groupRelCoords.left * factorX;

			group.css({
				'top': groupRelPosition.top * factorY + ui.position.top,
				'left': groupRelPosition.left * factorX + ui.position.left,
			});
		} else {
			elTop = ui.position.top - parseFloat(group.css('top')) + element.outlineRelCoords.top * factorY;
			elLeft = ui.position.left - parseFloat(group.css('left')) + element.outlineRelCoords.left * factorX;
		}
	} else {
		newElRelX = element.outlineRelCoords.left * factorX;
		newElRelY = element.outlineRelCoords.top * factorY;

		if (window.isSelectedTextOnly) {
			var elBottom = element.outlineRelCoords.top + elHeight;
			var outlineBottom = ui.position.top + ui.size.height;

			if (elBottom === outlineBottom) {
				elTop = Math.round(outlineBottom - elHeight);
			}
		} else {
			elTop = Math.round(ui.position.top + newElRelY);
		}

		elLeft = Math.round(ui.position.left + newElRelX);
	}

	if (elType !== 'text' && elType !== 'form' && elType !== 'image' && elType !== 'vector') {
		var deltaWidth = Math.abs(elWidth - element.startWidth);
		var deltaHeight = Math.abs(elHeight - element.startHeihgt);

		if (elType === 'tooltip') {
			if (deltaHeight < deltaWidth) {
				elHeight = elWidth;
			} else {
				elWidth = elHeight;
			}

			if (elHeight > 200) elHeight = 200;
		}

		$el.css({
			'height': elHeight,
		});
	}

	elTop = Math.round(elTop);
	elLeft = Math.round(elLeft);

	if (elType === 'gallery' || elType === 'video') {
		var elData = {
			el: $el,
			width: elWidth,
			height: elHeight,
			left: elLeft,
			top: elTop,
		};

		var outlineData = {
			size: ui.size,
			position: ui.position,
		};

		if (elType === 'video') elem__limitResize(elData, outlineData, 156, 156, group);
		if (elType === 'gallery') elem__limitResize(elData, outlineData, 200, 200, group);
	} else {
		if (elType === 'tooltip' && elWidth > 200) elWidth = 200;

		$el.css({
			'top': elTop,
			'left': elLeft,
			'width': elWidth,
		});
	}
}

function elem__limitResize(elData, outlineData, minWidth, minHeight, $group) {
	var isGallery = elData.el.attr('data-elem-type') === 'gallery';
	var elMaxBottom = elData.top + minHeight;
	var elMaxRight = elData.left + minWidth;
	var outlineBottom = outlineData.size.height + outlineData.position.top;
	var outlineRight = outlineData.size.width + outlineData.position.left;
	var finalWidth = elData.width < minWidth ? minWidth : elData.width;

	if ($group) {
		outlineBottom -= parseInt($group.css('top'));
		outlineRight -= parseInt($group.css('left'));
	}

	if (isGallery) {
		elData.el.find('.t-slds__main, .tn-atom__slds-img, .t-slds__items-wrapper').css({
			'width': finalWidth,
			'height': elData.height < minHeight ? minHeight : elData.height,
		});

		elData.el.find('.t-slds__item').css({
			'width': finalWidth,
		});
	}

	elData.el.css({
		'top': elData.height < minHeight && elMaxBottom > outlineBottom ? outlineBottom - minHeight : elData.top,
		'left': elData.width < minWidth && elMaxRight > outlineRight ? outlineRight - minWidth : elData.left,
		'width': finalWidth,
	});

	if (isGallery) t_slds_updateSlider(elData.el);
}

/*-------*/

function tn_outline__getRelativePosition(outline, $el) {
	var groupid = elem__getFieldValue($el, 'groupid');
	var group;
	var relativePosition;

	if (groupid) {
		group = $('#' + groupid);

		if (!group.hasClass('tn-group__selected')) {
			relativePosition = {
				top: parseFloat($el.css('top')) - (parseFloat(outline.css('top')) - parseFloat(group.css('top'))),
				left: parseFloat($el.css('left')) - (parseFloat(outline.css('left')) - parseFloat(group.css('left'))),
			};
		}
	} else {
		relativePosition = {
			top: parseFloat($el.css('top')) - parseFloat(outline.css('top')),
			left: parseFloat($el.css('left')) - parseFloat(outline.css('left')),
		};
	}

	return relativePosition;
}

/*-------*/

function elem__startDrag($el, event, ui) {
	window.tn_flag_elem_dragging = true;

	if (event.altKey) elem__DragWithOptionStart($el);

	var l = parseInt($el.attr('data-drag-start-left'));
	var t = parseInt($el.attr('data-drag-start-top'));
	ui.helper.data('draggableXY.originalPosition', {top: t, left: l});

	$el.addClass('noclick');
	if ($el.hasClass('tn-group')) $el.find('.tn-elem').addClass('noclick');
	$('.tn-elem__selected').addClass('tn-elem__selected__noborder');
	$('.tn-group__selected').addClass('tn-group__selected__noborder');

	elem__DragUndo($el);

	ui.originalPosition.top = ui.originalPosition.top / window.tn.zoom;
	ui.originalPosition.left = ui.originalPosition.left / window.tn.zoom;
	ui.position.top = 0;
	ui.position.left = 0;

	tn_hideOutline('selected');
	tn_hideRulers();
}

function elem__getSelectedBoundingBox() {
	var $selectedElems = $('.tn-elem__selected');
	var outlineRect = document.querySelector('.tn-outline_selected').getBoundingClientRect();

	var $firstEl = $selectedElems.first();
	var $firstOffset = $firstEl.offset();
	var left = $firstOffset.left;
	var top = $firstOffset.top;
	var right = left + $firstEl.outerWidth();
	var bottom = top + $firstEl.outerHeight();

	$selectedElems.slice(1).each(function () {
		var $el = $(this);
		var $offset = $el.offset();
		var elementLeft = $offset.left;
		var elementTop = $offset.top;
		var elementRight = elementLeft + $el.outerWidth();
		var elementBottom = elementTop + $el.outerHeight();

		if (elementLeft < left) {
			left = elementLeft;
		}
		if (elementTop < top) {
			top = elementTop;
		}
		if (elementRight > right) {
			right = elementRight;
		}
		if (elementBottom > bottom) {
			bottom = elementBottom;
		}
	});

	var width = outlineRect.width;
	var height = outlineRect.height;

	return {width, height, top, left};
}

function elem__dragDrag($el, event, ui) {
	var factor = 1 / window.tn.zoom - 1;

	ui.position.top += (ui.position.top - ui.originalPosition.top) * factor;
	ui.position.left += (ui.position.left - ui.originalPosition.left) * factor;

	if (event.shiftKey) {
		factor = 1 / window.tn.zoom;
		var originalPosition = ui.helper.data('draggableXY.originalPosition');
		var deltaX = Math.abs(originalPosition.left * factor - ui.position.left);
		var deltaY = Math.abs(originalPosition.top * factor - ui.position.top);

		if (deltaX > deltaY) {
			ui.position.top = originalPosition.top * factor;
		} else {
			ui.position.left = originalPosition.left * factor;
		}
	}

	elem__addSnapEvents($el, event, ui);

	tn_hideOutline('hover');
}

function elem__stopDrag($el, event) {
	$('.tn-elem__selected').removeClass('tn-elem__selected__noborder');
	$('.tn-group__selected').removeClass('tn-group__selected__noborder');

	var el_type = $el.attr('data-elem-type');
	var topunits = elem__getFieldValue($el, 'topunits');
	var leftunits = elem__getFieldValue($el, 'leftunits');

	if (window.tn_flag_sbs_onstep === 'y') {
		var step_i = parseInt($el.attr('data-sbs-step-i'), 10);
		if (isNaN(step_i) && group__isSelectedOnlyGroups()) {
			var activeStep = document.querySelector('.sui-sbs-step_active');
			step_i = activeStep ? activeStep.getAttribute('data-sbs-step-i') : '0';
			step_i = parseInt(step_i, 10);
		}

		if (step_i > 0) {
			var groupOffsetLeft = 0;
			var groupOffsetTop = 0;
			var groupId = elem__getFieldValue($el, 'groupid');

			if (groupId) {
				var $group = group__getById(groupId);
				groupOffsetLeft = parseInt($group.css('left'));
				groupOffsetTop = parseInt($group.css('top'));
			}

			var left = elem__getFieldValue($el, 'left');
			left = elem__convertPosition__Local__toAbsolute($el, 'left', left);

			var top = elem__getFieldValue($el, 'top');
			top = elem__convertPosition__Local__toAbsolute($el, 'top', top);

			var offset_left = parseInt($el.css('left')) + groupOffsetLeft - parseInt(left);
			var offset_top = parseInt($el.css('top')) + groupOffsetTop - parseInt(top);

			sbs__step__setFieldValue($el, step_i, 'mx', offset_left, 'render', 'updateui');
			sbs__step__setFieldValue($el, step_i, 'my', offset_top, 'render', 'updateui');
		} else {
			elem__Save__currentPosition($el);
		}

		if (
			$el.attr('data-elem-id') !== $('.tn-settings').attr('data-for-elem-id') &&
			!$el.hasClass('tn-elem__selected') &&
			!step_i
		) {
			elem__select($el);
		}

		$el.removeAttr('data-drag-start-left');
		$el.removeAttr('data-drag-start-top');
	} else {
		if (el_type === 'text' || el_type === 'image' || el_type === 'button') {
			if (!$el.isSnap) {
				if (topunits !== '%') {
					var top = parseInt($el.css('top'), 10);
					top = Math.round(top / 5) * 5;
					$el.css('top', top);
				}

				if (leftunits !== '%') {
					var left = parseInt($el.css('left'));
					left = Math.round(left / 10) * 10;
					$el.css('left', left);
				}
			}
		}

		elem__Save__currentPosition($el);

		var factor = 1 / window.tn.zoom;
		var offset_left = parseInt($el.css('left'), 10) - parseInt($el.attr('data-drag-start-left')) * factor;
		var offset_top = parseInt($el.css('top'), 10) - parseInt($el.attr('data-drag-start-top')) * factor;

		if (!($el.hasClass('tn-group') && !$el.hasClass('tn-group__open'))) {
			$el.removeAttr('data-drag-start-left');
			$el.removeAttr('data-drag-start-top');
		}

		if ($el.hasClass('tn-group') || ($('.tn-elem__selected').length > 1 && $el.hasClass('tn-elem__selected'))) {
			factor = 1 / window.tn.zoom;
			var elems = $('.tn-elem__selected').length ? $('.tn-elem__selected') : $el.find('.tn-elem');
			if ($el.hasClass('tn-group') && !$el.hasClass('tn-group__selected')) elems = $el.find('.tn-elem');

			if (!$el.hasClass('tn-group__selected')) group__select($el.attr('id'));

			$.each(elems, function () {
				var $this = $(this);
				var new_left = parseInt($this.attr('data-drag-start-left')) * factor + offset_left;
				var new_top = parseInt($this.attr('data-drag-start-top')) * factor + offset_top;

				var groupId = elem__getFieldValue($this, 'groupid');
				var group = group__getById(groupId);
				if (!(group && group.length && !group.hasClass('tn-group__open'))) {
					$this.css('left', new_left + 'px');
					$this.css('top', new_top + 'px');
				}

				elem__Save__currentPosition($this);

				$(this).removeAttr('data-drag-start-left');
				$(this).removeAttr('data-drag-start-top');
			});
		} else if (!$el.hasClass('tn-elem__selected')) {
			elem__select($el);
		}

		if (leftunits === '%') {
			elem__renderViewOneField($el, 'left');
		}

		if (topunits === '%') {
			elem__renderViewOneField($el, 'top');
		}

		var $selectedGroups = $('.tn-group__selected');
		if (!$selectedGroups.length && $el.hasClass('tn-group')) $selectedGroups = $el;

		if ($selectedGroups.length) {
			$selectedGroups.each(function () {
				var $group = $(this);
				group__setPositionByElemsAttrs($group.attr('id'));
				setTimeout(function () {
					$group.removeClass('noclick');
					$group.find('.tn-elem').removeClass('noclick');
				}, 200);
			});
		} else {
			setTimeout(function () {
				$el.removeClass('noclick');
			}, 10);
		}

		if ($el.hasClass('tn-elem') && $el.closest('.tn-group__open').length) {
			var groupId = elem__getFieldValue($el, 'groupid');
			group__setPositionByElemsAttrs(groupId);
		}
	}

	tn_set_lastChanges();
	event.stopImmediatePropagation();

	if (event.altKey) {
		if ($('.tn-elem__selected').length > 1) {
			elem__DragWithOptionStop($el);
		} else {
			$('.tn-elem__selected').attr('data-field-zindex-value', allelems__getHighestZIndex() + 1);
		}
		layers__update();
	}

	if ($('.tn-elem__selected, .tn-group__selected').length) {
		tn_setOutlinePosition('selected');
		tn_showOutline('selected');
	}

	if ($('.tn-elem__hover, .tn-group__hover').length) {
		tn_setOutlinePosition('hover');
		tn_showOutline('hover');
	}

	window.tn_flag_elem_dragging = false;
}

function elem__DragWithOptionStart($el) {
	var $elems = $('.tn-elem__selected:not(.tn-elem__fake)');
	var isSelectedElement = $el.hasClass('tn-elem__selected');
	var isGroup = $el.hasClass('tn-group');
	var isSelectedGroup = $el.hasClass('tn-group__selected');
	var groupId = !isGroup && elem__getFieldValue($el, 'groupid');
	var duplicateWithGroupIdSave = false;
	var highestZIndex = 999;

	if (!isSelectedElement && !isGroup) {
		$elems = $el;
		if (groupId) duplicateWithGroupIdSave = true;
	} else if (!isSelectedGroup && isGroup) {
		$elems = $el.find('.tn-elem');
	} else if (groupId && !isGroup) {
		duplicateWithGroupIdSave = true;
		if (!isSelectedElement) $elems = $el;
	}

	$el.optionCopyData = elem__DuplicateByOption($elems, duplicateWithGroupIdSave);
	if (duplicateWithGroupIdSave) group__checkGroupedElsOutside();
	if (groupId) highestZIndex = parseInt(group__getHighestZIndexInGroup(groupId), 10);
	$elems.each(function () {
		var $curEl = $(this);
		var curZIndex = parseInt($curEl.css('zindex'), 10);
		$curEl.css('zindex', highestZIndex + curZIndex);
	});
}

function elem__DragWithOptionStop($el) {
	allelems__unselect();
	if (typeof $el.optionCopyData === 'undefined') return;
	$el.optionCopyData.newGroupIds.forEach(function (id) {
		group__create(id, undefined, true);
	});

	$el.optionCopyData.elementsDuplicates.forEach(function (elData) {
		var $el1 = $('#' + elData.originalId);
		var $el2 = $('#' + elData.newElemId);
		elem__SwapCoords($el1, $el2);

		var newElementGroupId = elem__getFieldValue($el2, 'groupid');
		if (newElementGroupId) {
			group__select(newElementGroupId, true);
		} else {
			elem__select__also($el2);
		}
	});

	delete $el.optionCopyData;
	elem__checkZIndexes__Dubble();
}

function elem__DragUndo($el) {
	var isElSelected = $el.hasClass('tn-elem__selected');
	var undoEvent;
	var $movedElems;

	if (($('.tn-elem__selected').length > 1 && isElSelected) || $el.hasClass('tn-group')) {
		$movedElems = $el.hasClass('tn-group__selected') || isElSelected ? null : $el;
		undoEvent = 'elems_selected_move';

		if ($el.optionCopyData) {
			undoEvent = 'elems_selected_add';
			$movedElems = $(
				$el.optionCopyData.elementsDuplicates
					.map(function (data) {
						return '#' + data.newElemId;
					})
					.join(','),
			);
		}
	} else {
		$movedElems = $el;
		undoEvent = 'elem_move';

		if ($el.optionCopyData) {
			undoEvent = 'elem_add';
			$movedElems = $('#' + $el.optionCopyData.elementsDuplicates[0].newElemId);
		}
	}

	tn_undo__Add(undoEvent, $movedElems);
}

function elem__Click($el, event, flag_noedit, disableGroupSelection) {
	if ($('.tn-elem__selected').length === 1 && $el.hasClass('tn-elem__selected')) return;
	var isGroup = $el.hasClass('tn-group');
	var groupId = isGroup ? $el.attr('id') : elem__getFieldValue($el, 'groupid');
	var $group;
	if (isGroup) {
		$group = $el;
	} else {
		$group = groupId ? group__getById(groupId) : null;
	}

	/* if we are not edit element content right now */
	if ($el.attr('data-edit-mode') !== 'yes') {
		/* and if it not drag and drop (to prevent click event, we set class -noclick- on start drag) */
		if ($el.hasClass('noclick')) {
			$el.removeClass('noclick');
		} else {
			tn_console('click: element');
			if ($el.hasClass('tn-elem__selected')) {
				if (event.shiftKey) {
					if (groupId > 1) {
						group__unselect(groupId);
					} else {
						elem__unselect($el);
					}
				} else {
					if ($('.tn-elem__selected').length > 1) {
						if ($('.tn-group__selected').length > 1 && groupId) {
							group__select(groupId);
						} else if (disableGroupSelection || !groupId) {
							elem__select($el);
						}
					} else {
						if (
							$el.attr('data-elem-type') === 'text' &&
							elem__getFieldValue($el, 'lock') != 'y' &&
							typeof flag_noedit == 'undefined' &&
							!$el.find('.tn-atom__sbs-anim-wrapper').length
						) {
							if ($el.attr('data-edit-ready')) {
								if (window.ver_redactor === 'q') {
									editElementField($el);
								} else {
									editElementField_redactor($el);
								}
							} else {
								elem__setEditReady($el);
							}
						}
					}
				}
			} else {
				if (event.shiftKey && $('.tn-elem__selected').length > 0) {
					if (window.tn_flag_sbs_onstep != 'y') {
						if (groupId > 1 && !disableGroupSelection && (!$group || !$group.hasClass('tn-group__open'))) {
							group__select(groupId, true);
						} else {
							elem__select__also($el);
						}
					}
				} else {
					if ((groupId > 1 && !disableGroupSelection && (!$group || !$group.hasClass('tn-group__open'))) || isGroup) {
						group__select(groupId);
					} else {
						elem__select($el);
					}
				}
			}
		}
	}
}

function elem__mouseDown($el) {
	/* save all begin coords */
	$('.tn-elem__selected').each(function () {
		var $this = $(this);
		var pos = $this.position();
		$this.attr('data-drag-start-left', pos.left);
		$this.attr('data-drag-start-top', pos.top);
	});

	var $group = $el.hasClass('tn-group') ? $el : $($el.closest('.tn-group'));

	if ($group.length && !$group.hasClass('tn-group__open')) {
		var pos = $group.position();
		$group.attr('data-drag-start-left', pos.left);
		$group.attr('data-drag-start-top', pos.top);
	}
}

function elem__addSnapEvents($el, event, ui) {
	var draggable = $el.data('ui-draggable');

	var isSnapBefore = $el.isSnap;
	var isSnapAfter = false;

	if (draggable.snapElements) {
		$.each(draggable.snapElements, function (index, element) {
			if (element.snapping) {
				isSnapAfter = true;
			}
		});
	}

	if (isSnapBefore === false && isSnapAfter === true) {
		draggable._trigger('snapin', event, ui);
	}
	if (isSnapBefore === true && isSnapAfter === false) {
		draggable._trigger('snapout', event, ui);
	}

	$el.isSnap = isSnapAfter;
}

function elem__hoverIn() {
	var $el = $(this);
	var dragElsLength = $('.ui-draggable-dragging').length;
	var $hoverGroup;
	var $hoverEl;

	if ($el.hasClass('tn-group') && !$el.hasClass('tn-group__open')) {
		$el.addClass('tn-group__hover');
	}

	if ($el.hasClass('tn-elem')) {
		$el.addClass('tn-elem__hover');
	}

	$hoverEl = $('.tn-elem__hover');
	$hoverGroup = $('.tn-group__hover');

	if ($hoverEl.length + $hoverGroup.length !== 0 && !window.tn.isRotate) {
		if ($hoverEl.length === 1 && $hoverEl.attr('data-edit-mode') !== 'yes') {
			tn_setOutlinePosition('hover');
			tn_showOutline('hover');
		}
	}

	if (window.isAltDown && !dragElsLength) {
		tn_setRulersPosition();
	}
}

function elem__hoverOut() {
	$(this).removeClass('tn-elem__hover').removeClass('tn-group__hover');

	tn_hideOutline('hover');

	if (window.isAltDown) {
		tn_setRulersPosition();
	}
}

/**
 * Пересчитывает переданные координаты для текущего значения `tn.zoom`
 *
 * @param {number} value - Значение пересчитываемой координаты
 *
 * @returns {number}
 */
function elem__getValueWithFactor(value) {
	var factor = 1 / window.tn.zoom - 1;
	return value + value * factor;
}

/**
 * Добавляет возможность перетаскивания элементу
 *
 * @param {jQuery} $el - Элемент к которому добавляется возможность перетаскивания
 * @param {{isGroup?: boolean}} [options] - Опциональные параметры
 */
function elem__addDraggable($el, options) {
	if (!options) {
		options = {};
	}

	var isSnapDisabled = tn_getLocalField('isSnapDisabled');
	var snapValue = isSnapDisabled
		? false
		: '.tn-elem:not(.tn-elem__selected), .tn-guide, .tn-canvas-min, .tn-canvas-max';

	$el.draggable({
		grid: [1, 1],
		distance: 5,
		snap: snapValue,
		snapTolerance: 6,
		appendTo: '.tn-artboard',
		helper: function (event) {
			// Важно выбрать именно первых детей .tn-artboard, т.к элементы внутри группы тоже считаются выделенными
			var $selectedElems = $('.tn-artboard > .tn-elem__selected, .tn-artboard > .tn-group__selected');
			var isDraggedSelected = $selectedElems.filter($el).length;

			// Если есть несколько выделенных элементов, то помещаем их в вспомогательный элемент
			// И пересчитываем координаты относительно нового родителя
			if ($selectedElems.length > 1 && isDraggedSelected) {
				var $helper = $('<div class="tn-elem__helper"></div>');
				var bbox = elem__getSelectedBoundingBox();

				$selectedElems.each(function () {
					var $el = $(this);
					var $pos = $el.position();
					var $clone = $el.clone().detach();

					$clone.removeClass('tn-elem__selected');
					$clone.removeClass('tn-elem__hover');

					$clone.data('draggableXY.original', $el);

					$clone.css('top', elem__getValueWithFactor($pos.top) - elem__getValueWithFactor(bbox.top));
					$clone.css('left', elem__getValueWithFactor($pos.left) - elem__getValueWithFactor(bbox.left));

					$helper.append($clone);

					$el.css('display', 'none');
				});

				$helper.css({
					position: 'absolute',
					width: elem__getValueWithFactor(bbox.width),
					height: elem__getValueWithFactor(bbox.height),
				});

				$el.draggable('option', 'cursorAt', {
					top: event.pageY - bbox.top,
					left: event.pageX - bbox.left,
				});

				return $helper;
			}

			return $el;
		},
		start: function (event, ui) {
			tn_console('drag: start');
			var zoom = window.tn.zoom;
			$el.draggable('option', 'grid', [zoom, zoom]);
			elem__startDrag($el, event, ui);
		},
		drag: function (event, ui) {
			elem__dragDrag($el, event, ui);
		},
		stop: function (event, ui) {
			tn_console('drag: stop');
			var $helper = $('.tn-elem__helper');

			// Если в колбэке start был создан вспомогательный элемент
			// То пересчитываем координаты обратно относительно артборда
			if ($helper.length) {
				var $childs = $helper.children();
				var $helperPos = $helper.position();

				$childs.each(function () {
					var $el = $(this);
					var $original = $el.data('draggableXY.original');
					var $pos = $el.position();

					$original.css('top', elem__getValueWithFactor($helperPos.top + $pos.top));
					$original.css('left', elem__getValueWithFactor($helperPos.left + $pos.left));
					$original.css('display', '');
				});

				$el.draggable('option', 'cursorAt', null);
			}
			var isGroupEditAnim =
				window.tn.multi_edit && window.tn.multi_edit_elems.get().every(el => el.classList.contains('tn-elem__sbsmode'));

			if (group__isSelectedOnlyGroups() && isGroupEditAnim) {
				window.tn.multi_edit_elems.get().forEach(el => {
					elem__stopDrag($(el), event, ui);
				});
			} else {
				elem__stopDrag($el, event, ui);
			}
			tn_multiEdit__updateUi();

			if (options.isGroup && !isGroupEditAnim) group__setPositionByElemsAttrs($el.attr('id'));
		},
	});
}
