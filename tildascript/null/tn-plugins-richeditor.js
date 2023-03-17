function editElementField_redactor(el) {
	tn_console('func: editElementField');

	var $body = $('body');
	var $mainmenu = $('#mainmenu');
	var $redactorToolbar = $('#for_redactor_toolbar');
	var el_type = el.attr('data-elem-type');

	/* close and save other fields opened for edit */
	allelems__closeEditMode();
	allelems__unselect();
	var $parentGroup = el.closest('.tn-group');
	if ($parentGroup.length) {
		$parentGroup.addClass('tn-group__open');
		$parentGroup.draggable('disable');
	}

	window.waschanged = '';
	window.tn_flag_settings_ui_focus = true;

	$body.removeClass('userselect_none');
	el.addClass('redactor_open');

	$redactorToolbar.stop();
	$mainmenu.stop();

	$redactorToolbar.html('');
	$redactorToolbar.css('opacity', '0');

	$mainmenu.animate(
		{
			'opacity': '0',
			'top': '-60px',
		},
		400,
		'easeInCirc',
		function () {
			$redactorToolbar.animate(
				{
					'opacity': '1',
					'top': '0px',
				},
				300,
				'easeOutCirc',
			);
		},
	);

	el.attr('data-edit-mode', 'yes');
	el.draggable('disable');
	el.resizable('disable');

	tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : el);

	$(window).keydown(function (e) {
		if ((e.metaKey || e.ctrlKey) && e.keyCode == 86) {
			if ($body.scrollLeft() != 0) {
				window.bdy_left = $body.scrollLeft();
			}
			window.bdy_top = $body.scrollTop();
			setTimeout(function () {
				$body.scrollLeft(window.bdy_left);
				$body.scrollTop(window.bdy_top);
			}, 5);
			setTimeout(function () {
				$body.scrollLeft(window.bdy_left);
				$body.scrollTop(window.bdy_top);
			}, 10);
			setTimeout(function () {
				$body.scrollLeft(window.bdy_left);
				$body.scrollTop(window.bdy_top);
			}, 50);
		}
	});

	var el_target_class = '.tn-atom';
	if (el_type == 'tooltip') el_target_class = '.tn-atom__tip-text';

	el.find(el_target_class).redactor({
		buttons: ['bold', 'italic', 'deleted', 'link', ''],
		focus: true,
		linebreaks: true,
		allowedTags: [
			'p',
			'a',
			'i',
			'b',
			'br',
			'div',
			'del',
			'u',
			'ul',
			'ol',
			'li',
			'sup',
			'sub',
			'em',
			'table',
			'tr',
			'td',
			'th',
			'tbody',
			'thead',
			'strike',
			'span',
			'inline',
			'strong',
		],
		replaceDivs: false,
		cleanOnPaste: true,
		toolbarExternal: '#for_redactor_toolbar',
		plugins: ['underline', 'fontcolorex', 'fontweight', 'clearstyle'],
		dragUpload: false,
		initCallback: function () {},
		changeCallback: function () {
			window.waschanged = 'yes';
		},
		dropdownShownCallback: function () {},
		blurCallback: function () {
			saveElementEditedField(el);
		},
		pasteBeforeCallback: function (html) {
			html = $.htmlClean(html, {
				format: true,
				allowedTags: [
					'div',
					'span',
					'p',
					'h1',
					'h2',
					'h3',
					'a',
					'i',
					'b',
					'br',
					'del',
					'u',
					'ul',
					'ol',
					'li',
					'sup',
					'sub',
					'em',
					'strike',
					'strong',
				],
				allowedClasses: [''],
				allowedAttributes: [
					['href'],
					['style'],
					['rel'],
					['data-verified'],
					['data-redactor-tag'],
					['data-redactor-style'],
				],
			});
			html = html.replace(/<h1\s(.*?)>/gi, '<h1>');
			html = html.replace(/<h1><br\s?\/?><\/h1>/gi, '<br /><br />');
			html = html.replace(/<h1>([\w\W]*?)<\/h1>/gi, '$1<br /><br />');
			html = html.replace(/<h2\s(.*?)>/gi, '<h2>');
			html = html.replace(/<h2><br\s?\/?><\/h2>/gi, '<br /><br />');
			html = html.replace(/<h2>([\w\W]*?)<\/h2>/gi, '$1<br /><br />');
			html = html.replace(/<h3\s(.*?)>/gi, '<h3>');
			html = html.replace(/<h3><br\s?\/?><\/h3>/gi, '<br /><br />');
			html = html.replace(/<h3>([\w\W]*?)<\/h3>/gi, '$1<br /><br />');
			html = html.replace(/<div\s(.*?)>/gi, '<div>');
			html = html.replace(/<div><br\s?\/?><\/div>/gi, '<br />');
			html = html.replace(/<div>([\w\W]*?)<\/div>/gi, '$1<br />');
			return html;
		},
	});
}

/**
 * Инициализирует Quill редактор
 *
 * @param {Node} el - контейнер редактора
 * @param {MouseEvent} [reason] - событие мыши которое послужило причиной вызова функции
 */
function editElementField(el, reason) {
	tn_console('func: editElementField');
	var el_type = el.attr('data-elem-type');

	/* close and save other fields opened for edit */
	allelems__closeEditMode();
	allelems__unselect();
	var parentGroup = el.closest('.tn-group');
	if (parentGroup.length) {
		parentGroup.addClass('tn-group__open');
		parentGroup.draggable('disable');
	}

	window.waschanged = '';
	window.tn_flag_settings_ui_focus = true;

	var $body = $('body');
	var $redactorToolbar = $('#for_redactor_toolbar');
	var $mainMenu = $('#mainmenu');
	$body.removeClass('userselect_none');
	$redactorToolbar.addClass('for_redactor_toolbar_zero');
	el.addClass('redactor_open');

	$redactorToolbar.stop();
	$mainMenu.stop();

	$redactorToolbar.html('');
	$redactorToolbar.css('opacity', '0');

	$mainMenu.animate(
		{
			'opacity': '0',
			'top': '-60px',
		},
		400,
		'easeInCirc',
		function () {
			$redactorToolbar.animate(
				{
					'opacity': '1',
					'top': '0px',
				},
				300,
				'easeOutCirc',
			);
		},
	);

	el.attr('data-edit-mode', 'yes');

	el.draggable('disable');
	el.resizable('disable');

	tn_undo__Add('elem_save', window.tn.multi_edit ? window.tn.multi_edit_elems : el);

	$(window).keydown(function (e) {
		if ((e.metaKey || e.ctrlKey) && e.keyCode == 86) {
			if ($body.scrollLeft() != 0) {
				window.bdy_left = $body.scrollLeft();
			}
			window.bdy_top = $body.scrollTop();
			setTimeout(function () {
				$body.scrollLeft(window.bdy_left);
				$body.scrollTop(window.bdy_top);
			}, 5);
			setTimeout(function () {
				$body.scrollLeft(window.bdy_left);
				$body.scrollTop(window.bdy_top);
			}, 10);
			setTimeout(function () {
				$body.scrollLeft(window.bdy_left);
				$body.scrollTop(window.bdy_top);
			}, 50);
		}
	});

	var el_target_class = '.tn-atom';
	if (el_type == 'tooltip') el_target_class = '.tn-atom__tip-text';

	var $editable = el.find(el_target_class);

	// При наличии события вызова функции пытаемся установить курсор в место клика
	// Детали по используемым методам в PR https://github.com/greensun7/tildazero/pull/510
	var positionCursor;
	if (reason) {
		var isWebKitCompatible = 'caretRangeFromPoint' in document;
		var isFirefoxCompatible = 'caretPositionFromPoint' in document;

		if (isWebKitCompatible) {
			var range = document.caretRangeFromPoint(reason.clientX, reason.clientY);

			positionCursor = tn_getCursorPositionFromRange($editable[0], range);
		} else if (isFirefoxCompatible) {
			var range = document.caretPositionFromPoint(reason.clientX, reason.clientY);

			positionCursor = {start: range.offset, end: range.offset, offset: 0};
		}
	}

	var quill = new Quill($editable[0], {
		formats: [
			'bold',
			'color',
			'italic',
			'link',
			'strike',
			'underline',
			'list',
			'weight',
			'subscript',
			'superscript',
			'background',
		],
		debug: false,
		modules: {
			toolbar_content: {
				selector: '#for_redactor_toolbar',
				hint: true,
				callback: function () {
					var $forred = $('#for_redactor_toolbar');
					$forred.find('.ql-font_custom').css('display', 'none');
					$forred.find('.ql-size_custom').css('display', 'none');
					$forred.find('.ql-lineheight_custom').css('display', 'none');
					$forred.find('.ql-align_custom').css('display', 'none');
				},
			},
			popup: true,
			tooltip: true,
			clipboard: true,
			dropdown: true,
			tilda_link: '.ql-link_custom',
			textcolor: '.ql-color_custom',
			weightDropdown: '.ql-weight_custom',
			cleanstyle: '.ql-clean_custom',
			typograph: '.ql-typograph_custom',
			more: '.ql-more_custom',
			tilda_hotkeys: true,
			toolbar: {
				container: '#for_redactor_toolbar',
				toolbarOptions: [
					'bold',
					'italic',
					'underline',
					{
						list: 'ordered',
					},
					{
						list: 'bullet',
					},
					'link',
				],
			},
		},
	});

	quill.on('text-change', function () {
		window.waschanged = 'yes';
		// add to editor code
		Quill.addMarkersOnTextChange(quill);
	});

	if (positionCursor && positionCursor.start) {
		quill.setSelection(positionCursor.start, positionCursor.offset);
	} else {
		quill.focus();
	}

	var disable = function (e) {
		var editor = el;
		var $toolbar = $('#for_redactor_toolbar');
		if (!$(e.target).closest(editor).length && !$(e.target).closest($toolbar).length && el.find('.ql-editor').length) {
			quill.setSelection(0);
			saveElementEditedField(el);
		}
	};

	$(document).off('mousedown', disable);
	$(document).on('mousedown', disable);
}

function saveElementEditedField($el) {
	tn_console('^^^^^^^^^^ func: saveElementEditedField');

	/* if set color for all text - move to prop */
	var $atom = $el.find('.tn-atom');
	var atomColor = $atom.css('color');

	if (
		typeof atomColor !== 'undefined' &&
		atomColor != '' &&
		typeof $atom.attr('style') !== 'undefined' &&
		$atom.attr('style') != '' &&
		$atom.attr('style').indexOf('color:') !== -1
	) {
		var atomColorByAttr = elem__getFieldValue($el, 'color');
		if (atomColorByAttr != 'undefined' && atomColorByAttr != '') {
			var hexColor = tn_rgb2hex(atomColor);
			if (atomColorByAttr != hexColor) {
				elem__setFieldValue($el, 'color', hexColor, 'render', 'updateui');
			}
		}
	}

	/* if set link for all text - show alert */
	if ($atom.find('a').length === 1) {
		var atomHtml = $atom.html();
		if (typeof atomHtml !== 'undefined' && atomHtml.substring(0, 8) === '<a href=' && atomHtml.slice(-4) == '</a>') {
			alert("To put a link to the entire text, we recommend using the special 'link' field in the panel setting.");
		}
	}

	window.tn_flag_settings_ui_focus = false;

	var el_type = $el.attr('data-elem-type');

	$('body').addClass('userselect_none');
	$el.removeClass('redactor_open');

	var el_target_class = '.tn-atom';
	if (el_type === 'tooltip') el_target_class = '.tn-atom__tip-text';
	var value;

	if (window.ver_redactor === 'q') {
		value = $el.find(el_target_class).find('.ql-editor').html();
		value = value.replace(/&nbsp;/g, ' ');
		value = value.replace(/<br>/gi, '');
		value = value.replace(/<p>([\w\W]*?)<\/p>/gi, '$1<br />');
		value = Quill.addNbspMarkers(value);
		if (value.slice(-6) === '<br />' && value.slice(-12) !== '<br /><br />') {
			value = value.substring(0, value.length - 6);
		}
	} else {
		value = $el.find(el_target_class).redactor('code.get');
		value = value.replace(/&nbsp;/g, ' ');
	}

	var styles = $el.find(el_target_class).attr('style');

	if (window.ver_redactor === 'q') {
		$el.find('.ql-editor').remove();
	} else {
		$el.find('.redactor-box').remove();
	}

	if (el_type === 'text') {
		if (window.ver_redactor === 'q') {
			$el.find('.ql-container').removeClass('ql-container');
		} else {
			$el.prepend('<div class="tn-atom" field="text"></div>');
		}
		$el.find('.tn-atom').html(value);
		$el.find('.tn-atom').attr('style', styles);
	}

	if (el_type === 'tooltip') {
		$el.find('.tn-atom__tip').html('<div class="tn-atom__tip-text" field="tipcaption"></div>');
		$el.find('.tn-atom__tip-text').html(value);
		$el.find('.tn-atom__tip-text').attr('style', styles);
	}

	$el.attr('data-edit-mode', '');

	$('#for_redactor_toolbar').finish();
	$('#mainmenu').finish();

	$('#for_redactor_toolbar').animate(
		{
			'opacity': '0',
			'top': '-60px',
		},
		400,
		'easeInCirc',
		function () {
			$('#for_redactor_toolbar').html('');
			$('#mainmenu').animate({'opacity': '1', 'top': '0px'}, 300, 'easeOutCirc');
		},
	);

	window.waschanged = '';

	tn_set_lastChanges();

	// if (!elem__getFieldValue($el, 'groupid')) $el.draggable('enable');

	elem__renderView($el);

	layers__update();
}

function tn_input__openRedactor(el, field) {
	window.tn_flag_settings_ui_focus = true;

	var elem_id = el.attr('data-elem-id');
	var value = elem__getFieldValue(el, field);
	var $body = $('body');

	var s =
		'<div class="tn-wincode" data-code-elem-id="' +
		elem_id +
		'" data-code-field="' +
		field +
		'" style="position:fixed; z-index:2000; top:0; left:0; display:table; width:100%; height:100vh; background-color:#aaa;">' +
		'<div style="display:table-row;">' +
		'<div style="display:table-cell; width:100%; height:60px; background-color:#000; text-align:right; vertical-align:middle;">' +
		'<table width="150px" style="float:right;">' +
		'<tr>' +
		'<td style="width:160px; padding-right:20px;"><div class="tn-code-save-btn" style="width:160px;"><div class="tn-code-save-btn__icon">Close & Update</div></div></td>' +
		'</tr>' +
		'</table>' +
		'</div>' +
		'</div>' +
		'<div style="display:table-row;">' +
		'<div style="display:table-cell; width:100%; height:100%; background-color:#eee;">' +
		'<div style="display:block;width:720px;margin:auto;margin-top:20px;background-color:#fff;border:1px solid rgba(0,0,0,0.2);">' +
		'<div style="width:100%;position:relative;">' +
		'<textarea id="redtext" rows="4" redaktormin="yes" style="width:720px;min-height:200px;"></textarea>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<style>' +
		'.tn-wincode .redactor-editor{background-color:#fff;min-height:200px;padding:10px;}' +
		'</style>' +
		'</div>';

	$body.append(s);

	var $textarea = $('.tn-wincode #redtext');
	$textarea.val(value);

	if (window.ver_redactor === 'q') {
		tn_input__openEditor__addEditor($textarea);
	} else {
		tn_input__openRedactor__addRedactor($textarea);
	}

	setTimeout(function () {
		window.tn_flag_settings_ui_focus = true;
	}, 500);

	$body.addClass('tn-body_lockscroll').removeClass('userselect_none');

	$('.tn-code-save-btn').click(function () {
		var value;
		if (window.ver_redactor === 'q') {
			value = $('.tn-wincode .ql-editor').html();
			value = value.replace(/&nbsp;/g, ' ');
			value = value.replace(/<br>/gi, '');
			value = value.replace(/<p>([\w\W]*?)<\/p>/gi, '$1<br />');
			if (field !== 'formbottomtext' && field !== 'formmsgsuccess') value = Quill.addNbspMarkers(value);
			if (value.slice(-6) === '<br />' && value.slice(-12) !== '<br /><br />') {
				value = value.substring(0, value.length - 6);
			}
		} else {
			value = $('.tn-wincode #redtext').val();
		}
		var elemid = $('.tn-wincode').attr('data-code-elem-id');
		var codeField = $('.tn-wincode').attr('data-code-field');
		var el = $('#' + elemid);

		elem__setFieldValue(el, codeField, value, 'render', 'updateui');
		elem__renderForm(el);

		$('.tn-wincode').remove();
		window.tn_flag_settings_ui_focus = false;
		$body.removeClass('tn-body_lockscroll').addClass('userselect_none');
	});

	$('.tn-code-close-btn').click(function () {
		$('.tn-wincode').remove();
		$body.removeClass('tn-body_lockscroll').addClass('userselect_none');
		window.tn_flag_settings_ui_focus = false;
	});
}

function tn_input__openEditor__addEditor(el) {
	var html = el.val();
	var wrapper = el.parent();
	el.replaceWith('<div class="tn-form-editor__wrapper"></div>');

	var quill = new Quill(wrapper.find('.tn-form-editor__wrapper')[0], {
		formats: [
			'bold',
			'color',
			'font',
			'italic',
			'link',
			'size',
			'strike',
			'underline',
			'list',
			'align',
			'weight',
			'lineheight',
			'align',
			'subscript',
			'superscript',
			'background',
		],
		debug: false,
		modules: {
			toolbar_content: {
				toolbarClass: 'tn-form-editor__toolbar',
				editorWrapper: wrapper,
				hint: true,
			},
			popup: true,
			tooltip: true,
			clipboard: true,
			dropdown: true,
			tilda_link: '.ql-link_custom',
			textcolor: '.ql-color_custom',
			weightDropdown: '.ql-weight_custom',
			fontDropdown: '.ql-font_custom',
			sizeDropdown: '.ql-size_custom',
			lineheightDropdown: '.ql-lineheight_custom',
			alignDropdown: '.ql-align_custom',
			typograph: '.ql-typograph_custom',
			cleanstyle: '.ql-clean_custom',
			more: '.ql-more_custom',
			tilda_hotkeys: true,
			toolbar: {
				container: '.tn-form-editor__toolbar',
				toolbarOptions: [
					'bold',
					'italic',
					'underline',
					{
						list: 'ordered',
					},
					{
						list: 'bullet',
					},
					'link',
				],
			},
		},
	});

	quill.setContents(quill.clipboard.convert(html));

	quill.on('text-change', function () {
		window.waschanged = 'yes';
	});
	quill.on('selection-change', function () {
		window.tn_flag_settings_ui_focus = true;
	});
	quill.focus();
}

function tn_input__openRedactor__addRedactor(el) {
	el.redactor({
		lang: 'en',
		focus: true,
		linebreaks: true,
		boldTag: 'b',
		italicTag: 'i',
		replaceDivs: false,
		allowedTags: [
			'p',
			'a',
			'i',
			'b',
			'br',
			'div',
			'del',
			'u',
			'ul',
			'ol',
			'li',
			'hr',
			'sup',
			'sub',
			'em',
			'table',
			'tr',
			'td',
			'th',
			'tbody',
			'thead',
			'strike',
			'span',
			'inline',
			'strong',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
		],
		buttons: ['bold', 'italic', 'deleted', 'link', 'unorderedlist', 'orderedlist', ''],
		dragUpload: false,
		plugins: [
			'underline',
			'fontcolorex',
			'fontweight',
			'setfontfamily',
			'setfontsize',
			'setlineheight',
			'setalign',
			'clearstyle',
		],
		initCallback: function () {},
		changeCallback: function () {
			window.waschanged = 'yes';
		},
		focusCallback: function () {
			var y = this.$editor.has('div').is('div');
			if (y == true) {
				var st = getAttrStrintoArr(this.$editor.find('div').attr('style'));
				if (st['font-size'] !== undefined && st['font-size'] != '') this.setfontsize.enter(st['font-size']);
				if (st['line-height'] !== undefined && st['line-height'] != '') this.setlineheight.enter(st['line-height']);
				if (st['text-align'] !== undefined && st['text-align'] != '') this.setalign.enter(st['text-align']);
				if (st['font-family'] !== undefined && st['font-family'] != '') this.setfontfamily.enter(st['font-family']);
				if (st['color'] !== undefined && st['color'] != '') this.fontcolorex.enter(st['color']);
				this.$editor.find('div').contents().unwrap();
			}
		},
		blurCallback: function () {
			if (window.waschanged) {
				var value = this.$editor.html();
				value = value.replace(/&nbsp;/g, ' ');

				/*if was set custom styles*/
				var str = '';
				var el = this.$box.parent();
				if (el.attr('data-redactor-font-size') != undefined)
					str = str + 'font-size:' + el.attr('data-redactor-font-size') + ';';
				if (el.attr('data-redactor-line-height') != undefined)
					str = str + 'line-height:' + el.attr('data-redactor-line-height') + ';';
				if (el.attr('data-redactor-text-align') != undefined)
					str = str + 'text-align:' + el.attr('data-redactor-text-align') + ';';
				if (el.attr('data-redactor-font-family') != undefined)
					str = str + 'font-family:' + el.attr('data-redactor-font-family') + ';';
				if (el.attr('data-redactor-color') != undefined) str = str + 'color:' + el.attr('data-redactor-color') + ';';
				if (str != '') {
					value = '<div style="' + str + '" data-customstyle="yes">' + value + '</div>';
					this.$editor.html(value);
					this.code.sync();
				}
				setTimeout(function () {
					el.find('textarea').trigger('change');
				}, 100);
			}
		},
		pasteBeforeCallback: function (html) {
			html = $.htmlClean(html, {
				format: true,
				allowedTags: [
					'div',
					'span',
					'p',
					'h1',
					'h2',
					'h3',
					'a',
					'i',
					'b',
					'br',
					'del',
					'u',
					'ul',
					'ol',
					'li',
					'sup',
					'sub',
					'em',
					'strike',
					'strong',
				],
				allowedClasses: [''],
				allowedAttributes: [
					['href'],
					['style'],
					['rel'],
					['data-verified'],
					['data-redactor-tag'],
					['data-redactor-style'],
				],
			});
			html = html.replace(/<h1\s(.*?)>/gi, '<h1>');
			html = html.replace(/<h1><br\s?\/?><\/h1>/gi, '<br /><br />');
			html = html.replace(/<h1>([\w\W]*?)<\/h1>/gi, '$1<br /><br />');
			html = html.replace(/<h2\s(.*?)>/gi, '<h2>');
			html = html.replace(/<h2><br\s?\/?><\/h2>/gi, '<br /><br />');
			html = html.replace(/<h2>([\w\W]*?)<\/h2>/gi, '$1<br /><br />');
			html = html.replace(/<h3\s(.*?)>/gi, '<h3>');
			html = html.replace(/<h3><br\s?\/?><\/h3>/gi, '<br /><br />');
			html = html.replace(/<h3>([\w\W]*?)<\/h3>/gi, '$1<br /><br />');
			html = html.replace(/<div\s(.*?)>/gi, '<div>');
			html = html.replace(/<div><br\s?\/?><\/div>/gi, '<br />');
			html = html.replace(/<div>([\w\W]*?)<\/div>/gi, '$1<br />');
			return html;
		},
	});
}

/**
 * Получение позиции курсора по заранее полученному `Range`, модификация функции `Quill.getCursorPosition`
 *
 * @param {Node} parent - родительский элемент
 * @param {Range} range - заранее полученный `Range`
 * @return {{start: number; end: number; offset: number}} позиция курсора
 */
function tn_getCursorPositionFromRange(parent, range) {
	function getNodeTextLength(node) {
		var length = 0;

		if (node.nodeName === 'BR') {
			length = 1;
		} else if (node.nodeName === '#text') {
			length = node.nodeValue.length;
		} else if (node.childNodes != null) {
			for (var i = 0; i < node.childNodes.length; i++) {
				length += getNodeTextLength(node.childNodes[i]);
			}
		}

		return length;
	}

	function getTextLength(parent, node, offset) {
		var length = 0;

		if (node.nodeName === '#text') {
			length += offset;
		} else {
			for (var i = 0; i < offset; i++) {
				length += getNodeTextLength(node.childNodes[i]);
			}
		}

		if (node != parent) {
			if (node.parentNode != null) {
				length += getTextLength(parent, node.parentNode, getOffset(node));
			}
		}

		return length;
	}

	function getOffset(node) {
		return node == null ? -1 : getOffset(node.previousSibling) + 1;
	}

	var startPosition = 0;
	var endPosition = 0;
	var offsetPosition = 0;

	if (range) {
		startPosition = getTextLength(parent, range.startContainer, range.startOffset);
		endPosition = getTextLength(parent, range.endContainer, range.endOffset);
		offsetPosition = Math.max(endPosition - startPosition, 0);
	}

	return {
		start: startPosition,
		end: endPosition,
		offset: offsetPosition,
	};
}
