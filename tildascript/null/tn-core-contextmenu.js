/* ------------------------ */
/* Context Menu Settings */

function contextMenu__open($el, event) {
	tn_console();

	if (window.tn_flag_settings_ui_focus) return;
	contextMenu__close();

	if ((!window.tn.multi_edit && $el !== null) || ($el && !$el.hasClass('tn-elem__selected'))) {
		elem__Click($el, event, true);
	}

	$('body').addClass('tn-body_lockscroll');

	if ($el !== null) {
		contextmenu__el_draw($el, event);
	} else {
		contextmenu__ab_draw(event);
	}

	$(document).off('click focusout', function (e) {
		contextMenu__close(e);
	});
	$(document).on('click focusout', function (e) {
		contextMenu__close(e);
	});

	$(document).off('keyup', contextMenu__closeOnEsc);
	$(document).on('keyup', contextMenu__closeOnEsc);

	tn_console_runtime();
}

function contextMenu__closeOnEsc(e) {
	if (e.keyCode === 27) contextMenu__close();
}

function contextMenu__close(e) {
	if (e && e.type === 'click') {
		var $menuContainer = $('.tn-contextmenu-box__section_dropdown');
		if (!(!$menuContainer.is(e.target) && $menuContainer.has(e.target).length === 0)) {
			return;
		}
	}
	$(document).off('click focusout', contextMenu__close);
	$(document).off('keyup', contextMenu__closeOnEsc);
	$('.tn-contextmenu-box').remove();
	$('body').removeClass('tn-body_lockscroll');
}

function contextmenu__el_draw($el, event) {
	var elType = $el.attr('data-elem-type');
	var elem_id = $el.attr('data-elem-id');
	var groupId = elem__getFieldValue($el, 'groupid');
	var isGroup = groupId || $el.hasClass('tn-group');
	var $group = null;
	var lock = elem__getFieldValue($el, 'lock');
	var sbsevent = false;
	var hasBasicAnimation = false;
	var stepsObj = sbs__getStepsObj($el, false);

	$('.tn-elem__selected').each(function () {
		function check(val) {
			return typeof val !== 'undefined' && val !== '';
		}

		var $currentElement = $(this);

		if (!sbsevent) {
			var currentSBSevent = elem__getFieldValue($currentElement, 'sbsevent');
			sbsevent = check(currentSBSevent);
		}

		if (!hasBasicAnimation) {
			var animstyle = elem__getFieldValue($currentElement, 'animstyle');
			var animprx = elem__getFieldValue($currentElement, 'animprx');
			var animfix = elem__getFieldValue($currentElement, 'animfix');
			hasBasicAnimation = check(animstyle) || check(animprx) || check(animfix);
		}

		if (sbsevent && hasBasicAnimation) return false;
	});

	if (isGroup) {
		if (!groupId) groupId = $el.attr('id');
		$group = group__getById(groupId);

		if (!$group.hasClass('tn-group__open')) {
			lock = group__getFieldValue($group, 'lock');
		}
	}

	var contextMenuData = [
		{
			options: [
				{name: 'forward', text: 'Bring Forward'},
				{name: 'backward', text: 'Send Backward'},
				{name: 'front', text: 'Bring to Front'},
				{name: 'back', text: 'Send to Back'},
			],
		},
		{
			options: [
				{
					name: 'copy',
					text: 'Copy',
					shortcut: cmdSymbol() + ' <span class="tn-shortcuts__plus">+</span> C',
				},
				{
					name: 'paste',
					text: 'Paste',
					shortcut: cmdSymbol() + ' <span class="tn-shortcuts__plus">+</span> V',
				},
				{name: 'duplicate', text: 'Duplicate'},
				{
					name: 'delete',
					text: 'Delete',
					shortcut: 'Del',
				},
			],
		},
		{
			options: [
				{
					name: 'group',
					isHidden: !(
						group__isSelectedOnlyGroups() ||
						($('.tn-group__open .tn-elem__selected').length === 0 &&
							$('.tn-artboard > .tn-elem__selected').length > 1 &&
							$('.tn-group__selected').length === 0)
					),
					text: isGroup ? 'Ungroup' : 'Group',
					shortcut: isGroup
						? cmdSymbol() +
						  ' <span class="tn-shortcuts__plus">+</span> Shift <span class="tn-shortcuts__plus">+</span> G'
						: cmdSymbol() + ' <span class="tn-shortcuts__plus">+</span> G',
				},
				{
					name: 'lock',
					text: lock === 'y' ? 'Unlock' : 'Lock',
					shortcut: 'L',
				},
				{name: 'hide', text: 'Hide'},
			],
		},
	];

	if (!window.tn.multi_edit) {
		contextMenuData.push(
			{
				isHidden: elType !== 'form',
				options: [
					{name: 'inputs', text: 'Edit Input Fields'},
					{name: 'services', text: 'Edit Services'},
				],
			},
			{
				isHidden: elType !== 'html',
				options: [{name: 'code', text: 'Edit Code'}],
			},
			{
				isHidden:
					(elType !== 'shape' && elType !== 'image') || (elType === 'shape' && !elem__getFieldValue($el, 'bgimg')),
				options: [
					{name: 'open-image', text: 'Open Image In New Tab', tag: 'a'},
					{name: 'copy-url', text: 'Copy Image Url'},
				],
			},
			{
				isHidden: $el.hasClass('tn-elem__sbsmode'),
				options: [{name: 'classname', text: 'Add CSS Class Name'}],
			},
		);
	}

	contextMenuData.push({
		isDropdown: true,
		name: 'animation',
		text: 'Animation',
		isHidden: +window.tn.curResolution !== window.tn.topResolution,
		options: [
			{
				name: 'copybasic',
				isHidden: !hasBasicAnimation,
				text: 'Copy Basic Animation',
				disableMultiEdit: true,
			},
			{
				name: 'removebasic',
				isHidden: !hasBasicAnimation,
				text: 'Remove Basic Animation',
			},
			{
				name: 'pastebasic',
				isHidden: localStorage.getItem('tzerobasicanimation') === null || sbsevent,
				text: 'Paste Basic Animation',
			},
			{
				name: 'copysbs',
				isHidden: stepsObj.length <= 1,
				text: 'Copy SBS Animation',
				disableMultiEdit: true,
			},
			{
				name: 'removesbs',
				isHidden: !sbsevent,
				text: 'Remove SBS Animation',
			},
			{
				name: 'pastesbs',
				isHidden: localStorage.getItem('tzerosbsanimation') === null,
				text: 'Paste SBS Animation',
			},
			{
				name: 'sbs',
				text: !sbsevent ? 'Add SBS Animation' : 'Edit SBS Animation',
				disableMultiEdit: true,
			},
		],
	});

	var str = contextmenu__draw_box(contextMenuData, elType);
	$('body').append(str);

	var $contextMenuEl = $('.tn-contextmenu-box');
	contextmenu__set_position($contextMenuEl, event);
	contextmenu__dropdown_setHandlers($contextMenuEl);

	$contextMenuEl.find('.tn-contextmenu-box__item_forward').click(function () {
		tn_arrange__forward($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_backward').click(function () {
		tn_arrange__backward($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_front').click(function () {
		tn_arrange__sendFront($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_back').click(function () {
		tn_arrange__sendBack($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_paste').click(function () {
		elem__selected__buf__Paste();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_copy').click(function () {
		elem__selected__buf__Copy();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_duplicate').click(function () {
		tn_elem__copy($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_delete').click(function () {
		tn_elem__delete($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_lock').click(function () {
		tn_elem__lock($el);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_hide').click(function () {
		tn_elem__hide(window.tn.multi_edit ? null : $el, false);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_group').click(function () {
		if (isGroup) {
			group__unmake();
			panelSettings__openTimeout();
		} else {
			group__create();
		}
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_sbs').click(function () {
		var $settingsBtn = $('.tn-sett-btn');
		if ($settingsBtn.hasClass('tn-sett-btn_active')) {
			$settingsBtn.trigger('click');
		}
		panelSBS__open(elem_id);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_classname').click(function () {
		var $settingsBtn = $('.tn-sett-btn');
		goResolutionMode(window.tn.topResolution);
		elem__select($el);
		if ($settingsBtn.hasClass('tn-sett-btn_active')) {
			$settingsBtn.trigger('click');
		}
		$('[data-control-field="classname"]').closest('.sui-panel__table').css('display', 'table');
		$('.tn-right-box').scrollTop($('[data-control-field="classname"]').position().top - 80);
		$('[data-control-field="classname"] input').focus();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_inputs').click(function () {
		tn_form__preOpenEditor(elem_id);
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_services').click(function () {
		tn_receivers__openEditor(elem_id);
	});
	// TODO сделать аналогичное для вектора (?)
	$contextMenuEl.find('.tn-contextmenu-box__item_code').click(function () {
		tn_html__openEditor(elem_id);
	});
	$contextMenuEl
		.find('.tn-contextmenu-box__item_open-image')
		.attr('href', elem__getFieldValue($el, elType === 'shape' ? 'bgimg' : 'img'));
	$contextMenuEl.find('.tn-contextmenu-box__item_open-image').attr('target', '_blank');
	$contextMenuEl.find('.tn-contextmenu-box__item_copy-url').click(function () {
		var imgHref = elem__getFieldValue($el, elType === 'shape' ? 'bgimg' : 'img');
		tn_copyToClipboard(imgHref);
	});

	$contextMenuEl.find('.tn-contextmenu-box__item_copybasic').click(function () {
		panelSettings__copyAnimation(elem_id);
	});

	$contextMenuEl.find('.tn-contextmenu-box__item_pastebasic').click(function () {
		panelSettings__pasteAnimation();
		panelSettings__pasteAnimationAttr(elem_id);
	});

	$contextMenuEl.find('.tn-contextmenu-box__item_copysbs').click(function () {
		sbs__copy__sbsAnimation(elem_id);
	});

	$contextMenuEl.find('.tn-contextmenu-box__item_pastesbs').click(function () {
		if (!group__isSelectedOnlyGroups() && $('.sui-panel__section-sbsopenbtn').length === 0) {
			sbs__paste__sbsAnimation();
		} else {
			if (!window.tn.multi_edit) {
				elem__removeBasicAnimation($el);
				sbs__paste__sbsAnimationAttr(elem_id);
			} else {
				for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
					var $currentElem = $(window.tn.multi_edit_elems[i]);
					elem__removeBasicAnimation($currentElem);
					sbs__paste__sbsAnimationAttr($currentElem.attr('data-elem-id'));
				}
			}
			control__drawUi__sbsopenbtn(elem_id);
		}
	});

	$contextMenuEl.find('.tn-contextmenu-box__item_removesbs').click(function () {
		if (confirm('Are you sure?')) {
			var $elems = $('.tn-elem__selected');
			tn_undo__Add('elem_save', $elems);
			elem__removeSBSAnimation($elems);
			tn_set_lastChanges();
			if ($elems.length === 1) {
				panelSBS__close($elems);
				control__drawUi__sbsopenbtn(elem_id);
			}
		}
	});

	$contextMenuEl.find('.tn-contextmenu-box__item_removebasic').click(function () {
		var $elems = $('.tn-elem__selected');
		tn_undo__Add('elem_save', $elems);
		$elems.each(function () {
			elem__removeBasicAnimation($(this));
		});
		if ($elems.length === 1) {
			panelSettings__cleanBasicAnimtion($elems);
		}
		tn_set_lastChanges();
	});
}

function contextmenu__ab_draw(event) {
	var contextMenuData = [
		{
			options: [
				{
					name: 'paste',
					text: 'Paste',
					shortcut: cmdSymbol() + ' <span class="tn-shortcuts__plus">+</span> V',
				},
			],
		},
		{
			options: [
				{
					name: 'hide-layers',
					text: window.tn_layers_panel != 'open' ? 'Show Layers' : 'Hide Layers',
					shortcut: cmdSymbol() + ' <span class="tn-shortcuts__plus">+</span> L',
				},
				{
					name: 'hide-grid',
					text: $('.tn-guides').hasClass('tn-display-none') ? 'Show Grid' : 'Hide Grid',
					shortcut: 'G',
				},
				{
					name: 'hide-ui',
					text: window.tn_ui_hidden ? 'Show UI' : 'Hide UI',
					shortcut: 'F',
				},
			],
		},
		{
			options: [
				{
					name: 'zoom-in',
					text: 'Zoom In',
					shortcut: cmdSymbol() + ' <span class="tn-more-popup__plus">+</span> +',
				},
				{
					name: 'zoom-out',
					text: 'Zoom Out',
					shortcut: cmdSymbol() + ' <span class="tn-more-popup__plus">+</span> −',
				},
				{
					isHidden: window.tn.zoom == 1,
					name: 'zoom-reset',
					text: 'Zoom Reset',
				},
			],
		},
		{
			isDropdown: true,
			name: 'guides',
			text: 'Guides',
			options: [
				{
					isHidden: !$('.tn-guide').length,
					name: 'guides-hide',
					text: $('.tn-guides-wrpr').css('display') === 'none' ? 'Show Guides' : 'Hide Guides',
				},
				{
					name: 'guides-horizontal',
					text: 'Add Horizontal',
					shortcut: cmdSymbol() + ' <span class="tn-shortcuts__plus">+</span> H',
				},
				{
					name: 'guides-vertical',
					text: 'Add Vertical',
					shortcut: cmdSymbol() + '⇧ <span class="tn-shortcuts__plus">+</span> H',
				},
			],
		},
	];

	var str = contextmenu__draw_box(contextMenuData);
	$('body').append(str);

	var $contextMenuEl = $('.tn-contextmenu-box');
	contextmenu__set_position($contextMenuEl, event);
	contextmenu__dropdown_setHandlers($contextMenuEl);

	$contextMenuEl.find('.tn-contextmenu-box__item_paste').click(function () {
		elem__selected__buf__Paste();
		tn_set_lastChanges();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_hide-layers').click(function () {
		panelLayers__showhide();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_hide-grid').click(function () {
		tn_toggleGrid();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_hide-ui').click(function () {
		tn_toggleUI();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_zoom-reset').click(function () {
		tn_zoomReset();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_zoom-in').click(function () {
		tn_zoomIn();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_zoom-out').click(function () {
		tn_zoomOut();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_guides-hide').click(function () {
		tn_toggleGuides();
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_guides-horizontal').click(function () {
		guide__add('', 'h');
	});
	$contextMenuEl.find('.tn-contextmenu-box__item_guides-vertical').click(function () {
		guide__add('', 'v');
	});
}

function contextmenu__draw_box(data) {
	var str = '';

	function drawOption(options) {
		var optionStr = '';
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			if (option.isHidden || (option.disableMultiEdit && window.tn.multi_edit)) continue;
			var tagName = option.tag || 'div';
			optionStr += '<' + tagName + ' class="tn-contextmenu-box__item tn-contextmenu-box__item_' + option.name + '">';
			optionStr += option.text;
			if (option.shortcut) {
				optionStr += '<span class="tn-contextmenu-box__item__shortcut">';
				optionStr += option.shortcut || '';
				optionStr += '</span>';
			}
			optionStr += '</' + tagName + '>';
		}
		return optionStr;
	}

	str += '<div class="tn-contextmenu-box">';
	for (var i = 0; i < data.length; i++) {
		var section = data[i];
		if (!section.isHidden) {
			if (section.isDropdown) {
				str +=
					'<div class="tn-contextmenu-box__section tn-contextmenu-box__section_dropdown tn-contextmenu-box__section_' +
					section.name +
					'">';
				str += '<div class="tn-contextmenu-box__item">';
				str += section.text;
				str += '</div>';
				str += '<div class="tn-contextmenu-box__section tn-contextmenu-box__section_list">';
				str += drawOption(section.options);
				str += '</div>';
				str += '</div>';
			} else {
				str += '<div class="tn-contextmenu-box__section">';
				str += drawOption(section.options);
				str += '</div>';
			}
		}
	}
	str += '</div>';

	return str;
}

function contextmenu__dropdown_setHandlers($el) {
	$el.find('.tn-contextmenu-box__section_dropdown').hover(
		function () {
			var section = $(this);
			var dropdown = section.find('.tn-contextmenu-box__section_list');
			dropdown.css('display', 'block');
			$(section.find('.tn-contextmenu-box__item')[0]).addClass('tn-contextmenu-box__item_active');

			var sectionWidth = section.width();
			var dropdownWidth = dropdown.width();
			var dropdownHeight = dropdown.height();
			var sectionPosition = section.offset();
			var viewportBottom = window.scrollY + window.innerHeight;
			var viewportRight = window.scrollX + window.innerWidth;

			if (viewportBottom < sectionPosition.top + dropdownHeight) {
				dropdown.css({top: 'auto', bottom: 0});
			}

			if (viewportRight < sectionPosition.left + sectionWidth + dropdownWidth) {
				dropdown.css({right: 'auto', left: '-100%'});
			}
		},
		function () {
			var section = $(this);
			section.find('.tn-contextmenu-box__section_list').css('display', '');
			$(section.find('.tn-contextmenu-box__item')[0]).removeClass('tn-contextmenu-box__item_active');
		},
	);

	$el
		.find('.tn-contextmenu-box__section_dropdown .tn-contextmenu-box__section .tn-contextmenu-box__item')
		.click(function () {
			contextMenu__close();
		});
}

function contextmenu__set_position($el, event) {
	var edgeMenuGap = 10;

	var menuInitialTopPosition = window.scrollY + event.clientY;
	var viewportBottom = window.scrollY + window.innerHeight;
	var differenceMenuAndViewportRight = viewportBottom - (window.scrollY + event.clientY + $el.height());
	var top =
		differenceMenuAndViewportRight > 0
			? menuInitialTopPosition
			: menuInitialTopPosition + differenceMenuAndViewportRight - edgeMenuGap;

	var menuInitialLeftPosition = window.scrollX + event.clientX;
	var viewportRight = window.scrollX + window.innerWidth;
	differenceMenuAndViewportRight = viewportRight - (window.scrollX + event.clientX + $el.width());
	var left =
		differenceMenuAndViewportRight > 0 ? menuInitialLeftPosition : menuInitialLeftPosition - $el.width() - edgeMenuGap;

	$el.css({left: left, top: top});
}
