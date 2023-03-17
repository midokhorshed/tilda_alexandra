/* ------------------------ */
/* Init all */

$(document).ready(function () {
	// window.tn_comments_deltatime = 1;
	console.log('-------------------------');
	console.log('-------- TN Zero -------');
	console.log('-------------------------');
	window.tildamode = 'zero';
	window.isSafari = false;
	if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
		window.isSafari = true;
	}
	if (!window.country) window.country = $('body').attr('data-country');

	if (!String.prototype.includes) {
		String.prototype.includes = function (search, start) {
			if (search instanceof RegExp) {
				throw TypeError('first argument must not be a RegExp');
			}
			if (start === undefined) {
				start = 0;
			}
			return this.indexOf(search, start) !== -1;
		};
	}

	tn_loadMinigradients();

	/* create object with no values */
	initTNobj();

	var themeColor = localStorage.getItem('tzerothemecolor');
	var themeSize = localStorage.getItem('tzerothemesize');

	if (themeColor) $('body').addClass('tn-theme-' + themeColor);
	if (themeSize) $('body').addClass('tn-theme-' + themeSize);

	// check scrollbar visibility and offset top menu
	if (window.innerWidth > document.documentElement.clientWidth) {
		$('.tn-mainmenu').css('width', 'calc(100vw - 5px)');
	}

	var $tnRightBox = $('.tn-right-box');

	tn_drawMainMenu();

	tn_figma__setPopupOpenHandler();

	if (window.history.scrollRestoration) {
		window.history.scrollRestoration = 'manual';
	}

	$('#loadicon').css('display', 'none');

	tn_addSnapToggle();

	/* событие по клику - пол */
	$('.tn-floor').mousedown(function (e) {
		tn_console('click: Floor');
		window.tu_flag_widget_ui_focus = false;
		window.tn_flag_settings_ui_focus = false;
		floor__mousedown(e);
	});

	$('.tn-floor').contextmenu(function (e) {
		tn_console('click: Floor');
		floor__mousedown(e);
		contextMenu__open(null, e);
	});

	$('.tn-save-btn').click(function () {
		/* artboard__Save__toLS(); */
		artboard__Save__toDB('');
	});

	$('.tn-sett-btn').click(function () {
		tn_console('click: Sett');

		/* if not floor not item selected (usual on start) */
		if ($('.tn-right-box .tn-settings').length == 0) {
			floor__mousedown();
		}

		tn_toggleSettings(true);
	});

	$('.tn-close-btn').click(function () {
		tn_console('click: Close');
		if (window.tn.last_changes > window.tn.last_save_db) {
			tn_showSaveDialog__beforeClose();
		} else {
			tn_close();
		}
	});

	//guides
	if (window.sessionStorage && sessionStorage.getItem('tn_guides_off') == 'y') {
		window.tn_guides_off = 'y';
	}

	//sections
	if (window.sessionStorage && typeof sessionStorage.getItem('tn_sections_min') != 'undefined') {
		window.tn_sections_min = JSON.parse(sessionStorage.getItem('tn_sections_min'));
	}
	if (typeof window.tn_sections_min != 'object' || window.tn_sections_min === null) {
		window.tn_sections_min = [
			'arrows',
			'dots',
			'border',
			'shadow',
			'anim',
			'formstyle',
			'formbuttonstyle',
			'link',
			'ovrflw',
		];
	}

	/* array of values of editor */
	updateTNobj();

	/* load data and make Artboard */
	if ($('.tn-artboard').attr('data-record-id') == 0 || window.location.href.indexOf('main.html') > 0) {
		artboard__Load__fromLS();
	} else {
		setTimeout(function () {
			artboard__Load__fromDB();
		}, 10);
	}

	$('.tn-floor')
		.mousedown(function (e) {
			if (e.which === 1 && !$(this).is('.lassoRunning')) {
				var $this = $(this);
				$this.addClass('lassoRunning');
				$this.attr('data-lasso-start-left', e.pageX);
				$this.attr('data-lasso-start-top', e.pageY);
				$this.attr('data-lasso-start-zindex', $this.css('z-index'));
				$this.css('z-index', 10000);
			}
		})
		.mouseup(function (e) {
			if (e.which === 1 && $(this).is('.lassoRunning')) {
				var $this = $(this);
				$this.removeClass('lassoRunning');
				$this.removeAttr('data-lasso-start-left');
				$this.removeAttr('data-lasso-start-top');
				$this.css('z-index', $this.attr('data-lasso-start-zindex'));

				var $lasso = $('.tn-lasso');
				if ($lasso.length == 1) {
					var startX = parseInt($lasso.css('left'), 10);
					var startY = parseInt($lasso.css('top'), 10);
					var endX = startX + parseInt($lasso.css('width'), 10);
					var endY = startY + parseInt($lasso.css('height'), 10);
					lasso__getElems(startX, startY, endX, endY);
					$lasso.remove();

					var elems = $('.tn-elem__selected');
					if (elems.length == 1) {
						var el = elems;
						elem__updateUIControls(el);
						el.trigger('elementSelected');
					} else if (elems.length > 1) {
						if (window.tn_flag_sbs_onstep == 'y') {
							sbs__allelems__exitonStepMode();
						}

						window.tn.multi_edit = true;
						window.tn.multi_edit_elems = elems;
						panelSettings__openTimeout(elems, true);
					}

					if (elems.length > 1) {
						$('body').addClass('tn-multiselected');
					} else {
						$('body').removeClass('tn-multiselected');
					}

					if (elems.length) layers__update();
				}
			}
		})
		.mousemove(function (e) {
			if ($(this).hasClass('lassoRunning')) {
				var $this = $(this);
				var factor = window.tn.zoom == 1 ? 1 : 1 / window.tn.zoom;
				var layoutOffsetLeft = $('.tn-layout').position().left * factor;
				var layoutOffsetTop = $('.tn-layout').position().top * factor;
				var startX = parseFloat($this.attr('data-lasso-start-left')) * factor - layoutOffsetLeft;
				var startY = parseFloat($this.attr('data-lasso-start-top')) * factor - layoutOffsetTop;
				var offsetX = e.pageX * factor - startX - layoutOffsetLeft;
				var offsetY = e.pageY * factor - startY - layoutOffsetTop;
				if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
					var $lasso = $('.tn-lasso');
					if ($lasso.length == 0) {
						$('body .tn-layout').append('<div class="tn-lasso"></div>');
						$lasso = $('.tn-lasso');
					}
					if (offsetX > 0) {
						$lasso.css('left', startX + 'px');
						$lasso.css('width', offsetX + 'px');
					} else {
						$lasso.css('left', startX - Math.abs(offsetX) + 'px');
						$lasso.css('width', Math.abs(offsetX) + 'px');
					}
					if (offsetY > 0) {
						$lasso.css('top', startY + 'px');
						$lasso.css('height', offsetY + 'px');
					} else {
						$lasso.css('top', startY - Math.abs(offsetY) + 'px');
						$lasso.css('height', Math.abs(offsetY) + 'px');
					}
				}
			}
		});

	$(document).ready(function () {
		var $floor = $('.tn-floor');
		$floor.attr('data-tu-is-image', 'yes');
		$floor.attr('data-tu-multiple', 'yes');
		$floor.attr('data-tu-noclick', 'yes');
		var multiEditElems = [];
		TUWidget.init($floor)
			.done(function (files) {
				if (this.options.uploadMultiple) {
					tn_console('uploaded imgs >>>>');
					var el;
					var file;
					var new_els_id = [];
					for (var i in files) {
						file = files[i];
						el = addImage();
						elem__setFieldValue(el, 'img', file.tuInfo.cdnUrl, '', '', window.tn.topResolution);
						elem__setFieldValue(el, 'left', i * 20, '', '', window.tn.topResolution);
						elem__setFieldValue(el, 'top', i * 20, '', '', window.tn.topResolution);
						if (file.tuInfo.width > 1) {
							elem__setFieldValue(el, 'filewidth', file.tuInfo.width, '', '', window.tn.topResolution);
							elem__setFieldValue(el, 'width', file.tuInfo.width, '', '', window.tn.topResolution);
						}
						if (file.tuInfo.height > 1) {
							elem__setFieldValue(el, 'fileheight', file.tuInfo.height, '', '', window.tn.topResolution);
						}
						elem__renderViewOneField(el, 'img');
						elem__renderViewOneField(el, 'width');
						multiEditElems.push(el[0]);
						var el_id = el.attr('data-elem-id');
						new_els_id[el_id] = el_id;
					}

					var size = Object.keys(new_els_id).length;

					if (size > 0) {
						if (size == 1) {
							for (var key in new_els_id) {
								var el_new = $('#' + key);
								el_new.trigger('click');
								tn_undo__Add('elem_add', el_new);
							}
						} else {
							floor__mousedown();
							for (var key in new_els_id) {
								var el_new = $('#' + key);
								el_new.addClass('tn-elem__selected');
							}
							tn_undo__Add('elems_selected_add', new_els_id);
							window.tn.multi_edit = true;
							window.tn.multi_edit_elems = multiEditElems;
							panelSettings__openTimeout(multiEditElems, true);
						}
					}
					tn_set_lastChanges();
				}
			})
			.fail(function () {});
	});

	tn_toggleSettings();

	$tnRightBox.scrollGuard();
	$('.tn-left-box').scrollGuard('.tn-layers');

	$('body').addClass('userselect_none');

	/* check first enter */
	var firstopen = localStorage.getItem('tn-firstopen');
	if (firstopen == null) {
		tn_showHelloPopup();
		localStorage.setItem('tn-firstopen', Date.now());
	}

	window.tn_timer_autosave = setInterval(artboard__autoSave__toLS, 30000);

	/* load fonts */
	if (!window.frameElement) {
		var str;
		var rf_id = $('.tn-artboard').attr('data-project-rf_id');
		var rf_fonts = $('.tn-artboard').attr('data-project-rf_fonts');
		if (typeof rf_id == 'undefined' && typeof rf_fonts != 'undefined' && rf_id != '' && rf_fonts != '') {
			str =
				'<script type="text/javascript" src="/js/rfwebfonts.js?4"></script>' +
				'<script type="text/javascript">WebFontConfig = {"id": "' +
				rf_id +
				'", "fonts": ' +
				rf_fonts +
				', by_style: 1, by_id: 1};</script>';
			$('head').append(str);
		}

		var tf_fonts = $('.tn-artboard').attr('data-project-tf_fonts');
		if (typeof tf_fonts != 'undefined' && tf_fonts != '') {
			str =
				'<script type="text/javascript">TildaFonts = [' +
				tf_fonts +
				']</script>' +
				'<script type="text/javascript" src="https://static.tildacdn.com/js/tilda-fonts.min.js"></script>';
			$('head').append(str);
		}

		var typekitid = $('.tn-artboard').attr('data-project-typekitid');
		if (typeof typekitid != 'undefined' && typekitid != '') {
			str =
				'<script type="text/javascript">' +
				'(function(d) {' +
				'var config = {kitId: typekitid,scriptTimeout: 3000};' +
				'var h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src="//use.typekit.net/"+config.kitId+".js";tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)' +
				'})(document);' +
				'</script>';
			$('head').append(str);
		}

		var gf_fonts = $('.tn-artboard').attr('data-project-gf_fonts');
		if (typeof gf_fonts != 'undefined' && gf_fonts != '') {
			str =
				'<link type="text/css" rel="stylesheet" media="screen,print" href="https://fonts.googleapis.com/css2?' +
				gf_fonts +
				'">';
			$('head').append(str);
		}

		var data_h = $('.tn-artboard').attr('data-project-headlinefont');
		var data_t = $('.tn-artboard').attr('data-project-textfont');
		if (
			(typeof data_h != 'undefined' && data_h == 'TildaSans') ||
			(typeof data_t != 'undefined' && data_t == 'TildaSans')
		) {
			str =
				'<link type="text/css" rel="stylesheet" media="screen,print" href="https://static.tildacdn.com/css/fonts-tildasans.css">';
			$('head').append(str);
		}
	}

	window.addEventListener(
		'contextmenu',
		function (e) {
			if (!window.tn_flag_settings_ui_focus) e.preventDefault();
		},
		false,
	);

	tn_createRulers();
	tn_createOutline('selected');
	tn_createOutline('hover');

	tn_addZoomEvent();

	tn_addMoveShape();
	tn_createAbMoveEvent();

	tn_createTidyControlsStorage();
	tn_createTidyControlsWrapper();
	tn_createTidyRangesWrapper();
	tn_createSpacingHint();

	tn_sendUserAgentMetric();
});

$(window).resize(function () {
	tn_console('>>>> Window on Resize event');

	waitForFinalEvent(
		function () {
			var ww = $(window).width();
			var res = 0;

			window.tn.screens.forEach(function (s) {
				if (ww >= s) res = s;
			});

			if (res > 960) {
				res = window.tn.topResolution;
			}

			goResolutionMode(res);

			$('.tn-res-item').removeClass('tn-res-item_active');
			$('.tn-res-item[data-res=' + res + ']').addClass('tn-res-item_active');
		},
		500,
		'some unique string',
	);
});

$(window).bind('beforeunload', function () {
	if (!window.tn_role_dev && window.tn.last_save_db < window.tn.last_changes) return true;
});

/* ------------------------ */
/* TU Object */

/* Not used  */
function getFramedWindow(f) {
	if (f.parentNode == null) {
		f = document.body.appendChild(f);
	}
	var w = f.contentWindow || f.contentDocument;
	if (w && w.nodeType && w.nodeType == 9) {
		w = w.defaultView || w.parentWindow;
	}
	return w;
}

function initTNobj() {
	tn_console('func: initTNobj');
	window.tn = {};

	window.tn.zoom = 1;

	window.tn.screens_default_str = '320,480,640,960,1200';
	setTNobj_screens(window.tn.screens_default_str);

	window.tn.ab_fields = [
		'height',
		'bgcolor',
		'bgimg',
		'filteropacity',
		'filtercolor',
		'filteropacity2',
		'filtercolor2',
		'bgattachment',
		'bgposition',
		'height_vh',
		'valign',
		'ovrflw',
		'isolation',
		'title',
		'grid',
		'gridcolor',
		'gridopacity',
		'gridlineopacity',
		'gridglobal',
		'upscale',
	];
	window.tn.grid_fields = [
		'columns',
		'columngutter',
		'columnmargins',
		'columnwidth',
		'rowbaseline',
		'rowmoduleheight',
		'rowmargins',
	];
	window.tn.grid_options = $('.tn-artboard').attr('data-project-zb_grid');
	if (window.tn.grid_options) window.tn.grid_options = JSON.parse(window.tn.grid_options);

	window.tempaddundoeldata = {};

	window.tn.artboard_id = $('.tn-artboard').attr('data-record-id');

	window.tn.last_changes = 0;
	window.tn.last_save_db = 0;
	window.tn.last_save_ls = 0;

	/* debug */
	tn_unset_allundo();
	localStorage.setItem('undo_' + window.tn.artboard_id, '[]');

	/* fonts */
	var fonts = ['Arial', 'Georgia'];

	var h = parent.$headlinefont;
	var data_h = $('.tn-artboard').attr('data-project-headlinefont');
	if (typeof h == 'undefined' && typeof data_h != 'undefined' && data_h != '') {
		h = data_h;
	}
	if (typeof h != 'undefined') {
		fonts.unshift(h);
		window.tn.headlinefont = h;
		$headlinefont = h;
	}

	var t = parent.$textfont;
	var data_t = $('.tn-artboard').attr('data-project-textfont');
	if (typeof t == 'undefined' && typeof data_t != 'undefined' && data_t != '') {
		t = data_t;
	}
	if (typeof t != 'undefined') {
		fonts.unshift(t);
		window.tn.textfont = t;
		$textfont = t;
	}

	window.fonts = fonts;

	if (typeof $headlinefont == 'undefined') {
		$headlinefont = 'Arial';
	}
	if (typeof $textfont == 'undefined') {
		$textfont = 'Arial';
	}

	var tfw = parent.$textfontweight;
	// var data_tft = $('.tn-artboard').attr('data-project-textfontweight');
	var data_tfw;
	if (typeof tfw == 'undefined' && typeof data_tfw != 'undefined' && data_tfw != '') {
		tfw = data_tfw;
	}
	if (typeof tfw !== 'undefined') {
		window.tn.textfontweight = tfw;
	}

	window.projectid = $('.tn-artboard').attr('data-project-id');

	/* array with animation scenes */
	/* window.tn.scenes = []; */

	/* Lang */
	var lang = parent.$lang;
	var data_lang = $('.tn-artboard').attr('data-user-lang');
	if (typeof lang == 'undefined' && typeof data_lang != 'undefined' && data_lang != '') {
		lang = data_lang;
	}
	if (typeof lang !== 'undefined') {
		window.tn.lang = lang;
	} else {
		window.tn.lang = 'EN';
	}
}

function updateTNobj() {
	tn_console('func: updateTNobj');

	var canvasMin = $('.tn-canvas-min');
	var canvasMax = $('.tn-canvas-max');
	var canvasHelpers = $('.tn-canvas__helper');

	window.tn.window_width = parseInt($(window).width(), 10);
	window.tn.window_height = parseInt($(window).height(), 10);

	// переменные для рисования условных областей
	window.tn.canvas_min_width = window.tn.curResolution;
	if (window.tn.curResolution < 960) {
		window.tn.canvas_max_width = window.tn.curResolution;
	} else if (window.tn.curResolution == 960) {
		window.tn.canvas_max_width = 1024;
	} else {
		window.tn.canvas_max_width = window.tn.curResolution + 200;
	}

	window.tn.grid_width = window.tn.canvas_min_width;
	window.tn.grid_offset_left = parseInt((window.tn.window_width - window.tn.grid_width) / 2, 10);

	/* new */
	window.tn.canvas_min_offset_left = parseInt(canvasMin.css('left'), 10);
	window.tn.canvas_max_offset_left = parseInt(canvasMax.css('left'), 10);
	window.tn.canvas_min_offset_top = parseInt(canvasMin.css('top'), 10);
	window.tn.canvas_max_offset_top = parseInt(canvasMax.css('top'), 10);

	if (window.tn.curResolution >= 1200) {
		canvasHelpers.removeClass('tn-display-none');
	} else {
		canvasHelpers.addClass('tn-display-none');
	}
}

function setTNobj_screens(str_screens) {
	var arr_screens = str_screens.split(',');
	if (typeof arr_screens != 'object' || arr_screens === null || arr_screens.length == 0) {
		console.log('screens str invalid');
		return;
	}

	window.tn.screens = [];
	var sn;
	var i = 0;
	arr_screens.forEach(function (s) {
		sn = Number(s);
		if (sn >= 320 && sn <= 1920) {
			window.tn.screens[i] = Number(s);
			i++;
		}
	});

	window.tn.screens_cnt = window.tn.screens.length;
	window.tn.topResolution = window.tn.screens[window.tn.screens_cnt - 1];
}

var waitForFinalEvent = (function () {
	var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) {
			uniqueId = "Don't call this twice without a uniqueId";
		}
		if (timers[uniqueId]) {
			clearTimeout(timers[uniqueId]);
		}
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();

/* ------------------------ */
/* Switch Resolution */

function switchResolution(res, resmax) {
	tn_console('func: switchResolution');

	if (typeof resmax == 'undefined' || resmax == '') {
		if (res < 960) {
			resmax = res;
		} else if (res == 960) {
			resmax = 1024;
		} else {
			resmax = res + 200;
		}
	}

	if (res < 1200) {
		$('.tn-layout').addClass('tn-layout-responsive');
	} else {
		$('.tn-layout').removeClass('tn-layout-responsive');
	}

	$('.tn-res-item').removeClass('tn-res-item_active');
	$('.tn-res-item[data-res=' + res + ']').addClass('tn-res-item_active');
	$('.tn-layout').attr('data-res', res);

	/* */
	/* tn_testAnimation__stop(); */

	/* */
	window.tn.curResolution = res;
	window.tn.curResolution_max = resmax;

	var $canvas_min = $('.tn-canvas-min');
	var $canvas_max = $('.tn-canvas-max');
	var $filter = $('.tn-filter');
	var $canvas_max_bottom = $('.tn-canvas-max-bottom');

	$canvas_min.css('top', '1000px');
	$canvas_max.css('top', '1000px');
	$filter.css('top', '1000px');

	var canvas_min_offset_left = (parseInt($('.tn-floor').width(), 10) - res) / 2;
	$canvas_min.css('width', res + 'px');
	$canvas_min.css('left', canvas_min_offset_left + 'px');

	var canvas_max_offset_left = (parseInt($('.tn-floor').width(), 10) - resmax) / 2;
	$canvas_max.css('width', resmax + 'px');
	$canvas_max.css('left', canvas_max_offset_left + 'px');

	$filter.css('width', resmax + 'px');
	$filter.css('left', canvas_max_offset_left + 'px');

	$canvas_max_bottom.css('width', resmax + 'px');
	$canvas_max_bottom.css('left', canvas_max_offset_left + 'px');

	/* if was on sbs mode */
	if (window.tn_flag_sbs_panelopen == 'y' || window.tn_flag_sbs_onstep == 'y') {
		delete window.tn_flag_sbs_panelopen;
		sbs__allelems__exitonStepMode();
	}

	/* if has selected element - open again settings panel */
	var $el_selected = $('.tn-elem__selected');
	if ($el_selected.length == 1) {
		$el_selected.trigger('elementSelected');
	}
	if ($el_selected.length > 1) {
		window.tn.multi_edit = true;
		window.tn.multi_edit_elems = $el_selected;
		panelSettings__openTimeout($el_selected, true);
	}

	/* if has opened panel for artboard - open and close */
	if ($('.tn-right-box .tn-settings').attr('data-for-artboard') == 'artboard') {
		panelABSettings__open();
	}

	if ($('.tn-right-box .tn-settings').attr('data-for-artboard') == 'grid') {
		ab__openZBSettings();
	}

	var $btnsCopypasteWrapper = $('.sui-copypaste-wrapper');
	if (+res !== window.tn.topResolution) {
		$btnsCopypasteWrapper.hide();
	} else {
		$btnsCopypasteWrapper.show();
	}

	$('html, body').animate(
		{scrollLeft: $canvas_min.offset().left + $canvas_min.width() / 2 - $(window).width() / 2, scrollTop: 1000 - 80},
		10,
	);

	tn_drawguides(res);
	if (window.tn_guides_off == 'y') {
		$('.tn-guides').toggleClass('tn-display-none');
	}

	allguides__renderView();
}

function goResolutionMode(res) {
	var resmax;

	if (res < 960) {
		resmax = res;
	} else if (res == 960) {
		resmax = 1024;
	} else {
		resmax = res + 200;
	}

	tn_zoomReset(true);
	$('.tn-res-input').val(res);
	$('.tn-resmax-input').val(resmax);
	switchResolution(res, resmax);
	ab__renderGrid();
	updateTNobj();
	ab__renderView();
	allelems__renderView();
	allguides__renderView();

	$('.tn-group').each(function (i, group) {
		var groupid = group.id;
		var minMaxPoints = group__getMinMaxPoints(groupid);
		group__setPositionByElemsAttrs(groupid, minMaxPoints, true);
	});

	$('.tn-res-item').removeClass('tn-res-item_active');
	$('.tn-res-item[data-res=' + res + ']').addClass('tn-res-item_active');

	if ($('.tn-axis').length) elem__drawAxis();

	if ($('.tn-elem__selected, .tn-group__selected').length) {
		tn_setOutlinePosition('selected');
		tn_setOutlinePosition('hover');

		tn_destroyTidyControls();
		tn_createSpacingControls();
	}

	if (window.isAltDown) tn_setRulersPosition();
	document.body.click();
}

/**
 * Отсылаем метрику о браузере пользователя для нужд перехода на ES6
 */
function tn_sendUserAgentMetric() {
	var isAlreadySended = window.localStorage.getItem('tn_sendUserAgentMetric');

	if (isAlreadySended) return;

	var params = JSON.stringify({url: document.location.href, debugService: 'zero'});

	$.ajax({
		url: 'https://sysstat.tildacdn.com/api/performance/?' + params,
		method: 'POST',
		dataType: 'text',
		success: function () {
			window.localStorage.setItem('tn_sendUserAgentMetric', 'y');
		},
	});
}
