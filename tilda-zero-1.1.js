/* eslint-disable no-undef */
window.t396__isMobile =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
	navigator.userAgent.indexOf('Instagram') > -1;

// eslint-disable-next-line no-unused-vars
function t396_init(recid) {
	var record = document.getElementById('rec' + recid);
	var zeroBlock = record ? record.querySelector('.t396') : null;
	var artBoard = record ? record.querySelector('.t396__artboard') : null;

	t396_initTNobj(recid, artBoard);

	var data = '';
	var resolution = t396_detectResolution(recid);
	var allRecords = document.getElementById('allrecords');

	window.tn_window_width = document.documentElement.clientWidth;
	window.tn_scale_factor = parseFloat((window.tn_window_width / resolution).toFixed(3));

	t396_switchResolution(recid, resolution);
	t396_updateTNobj(recid);
	t396_artboard_build(data, recid);

	/*check is device has touchscreen*/
	var isTouchDevice = 'ontouchend' in document;

	window.addEventListener('resize', function () {
		tn_console('>>>> t396: Window on Resize event >>>>');

		if (artBoard && artBoard.classList.contains('t396_fullscreenchange')) {
			artBoard.classList.remove('t396_fullscreenchange');
			return;
		}

		t396_waitForFinalEvent(
			function () {
				if (window.t396__isMobile || isTouchDevice) {
					if (document.documentElement.clientWidth !== window.tn_window_width) {
						t396_doResize(recid);
					}
				} else {
					t396_doResize(recid);
				}
			},
			500,
			'resizeruniqueid' + recid
		);
	});

	window.addEventListener('orientationchange', function () {
		tn_console('>>>> t396: Orient change event >>>>');
		t396_waitForFinalEvent(
			function () {
				t396_doResize(recid);
			},
			600,
			'orientationuniqueid' + recid
		);
	});

	window.addEventListener('load', function () {
		t396_allelems__renderView(artBoard);
		var blockOverflow = artBoard ? window.getComputedStyle(artBoard).getPropertyValue('overflow') : '';

		if (typeof t_lazyload_update === 'function' && blockOverflow === 'auto' && artBoard) {
			artBoard.addEventListener(
				'scroll',
				t_throttle(function () {
					var dataLazy = allRecords ? allRecords.getAttribute('data-tilda-lazy') : null;
					if (window.lazy === 'y' || dataLazy === 'yes') {
						t_onFuncLoad('t_lazyload_update', function () {
							t_lazyload_update();
						});
					}
				}, 500)
			);
		}

		if (window.location.hash !== '' && blockOverflow === 'visible') {
			if (artBoard) artBoard.style.overflow = 'hidden';
			setTimeout(function () {
				if (artBoard) artBoard.style.overflow = 'visible';
			}, 1);
		}
	});

	if (artBoard) {
		artBoard.addEventListener('fullscreenchange', function () {
			artBoard.classList.add('t396_fullscreenchange');
		});
	}

	// recalc zero params, if page has ME901 with padding at axisX
	if (document.querySelector('.t830')) {
		window.addEventListener('load', function () {
			var menuClassList = ['t830__allrecords_padd', 't830__allrecords_padd-small'];
			var isAllRecContainsClass = menuClassList.some(function (className) {
				return allRecords.classList.contains(className);
			});
			if (isAllRecContainsClass) {
				t396_doResize(recid);
			} else {
				allRecords.addEventListener('allRecPaddingInit', function () {
					t396_doResize(recid);
				});
			}
		});
	}

	if (record && zeroBlock && artBoard && record.getAttribute('data-connect-with-tab') === 'yes') {
		zeroBlock.addEventListener('displayChanged', function () {
			t396_allelems__renderView(artBoard);
			t396_doResize(recid);
		});
	}

	/* Fix for T203 and zero with autoscale */
	setTimeout(function () {
		if (record && record.closest('#allrecordstable') && zeroBlock && artBoard) {
			zeroBlock.addEventListener('displayChanged', function () {
				t396_allelems__renderView(artBoard);
				t396_doResize(recid);
			});
		}
	}, 1000);

	// Fix for T635 in ZeroBlock
	var isT635Exist = !!document.querySelector('.t635__textholder');
	if (record && isT635Exist && zeroBlock && artBoard) {
		zeroBlock.addEventListener('animationInited', function () {
			t396_allelems__renderView(artBoard);
			t396_doResize(recid);
		});
	}

	/* fix for disappearing elements in safari */
	if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent) && zeroBlock) {
		zeroBlock.classList.add('t396_safari');
	}

	var isScaled = t396_ab__getFieldValue(artBoard, 'upscale') === 'window';
	var isTildaModeEdit = allRecords ? allRecords.getAttribute('data-tilda-mode') === 'edit' : null;
	if (isScaled && !isTildaModeEdit) {
		t_onFuncLoad('t396_scaleBlock', function () {
			t396_scaleBlock(recid);
		});
	}

	// TODO temporary fix for cases which elements inside zero
	// has zIndex that is larger than editor mode UI elements
	if (isTildaModeEdit && zeroBlock && artBoard) {
		var artBoardOverflow = artBoard.getAttribute('data-artboard-ovrflw');
		zeroBlock.style.position = 'relative';
		// set higher priority of visibility to artboard with overflow auto/visible
		zeroBlock.style.zIndex = artBoardOverflow === 'auto' || artBoardOverflow === 'visible' ? '2' : '1';
	}
}

function t396_isOnlyScalableBrowser() {
	var isFirefox = navigator.userAgent.search('Firefox') !== -1;
	var isOpera =
		(!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') !== -1;
	return isFirefox || isOpera;
}

function t396_doResize(recid) {
	var isOnlyScalable = t396_isOnlyScalableBrowser();
	var record = document.getElementById('rec' + recid);
	var allRecords = document.getElementById('allrecords');
	var resolution = t396_detectResolution(recid);
	var scaleStyle = record ? record.querySelector('.t396__scale-style') : null;
	t396_removeElementFromDOM(scaleStyle);
	if (!isOnlyScalable) {
		var elements = record ? record.querySelectorAll('.t396__elem') : [];
		Array.prototype.forEach.call(elements, function (element) {
			element.style.zoom = '';
			var atom = element.querySelector('.tn-atom');
			if (atom) atom.style.transformOrigin = '';
		});
	} else {
		var atoms = record ? record.querySelectorAll('.tn-atom') : [];
		Array.prototype.forEach.call(atoms, function (atom) {
			var atomWrapper = atom.closest('.tn-atom__scale-wrapper');
			var atomParent = atomWrapper ? atomWrapper.parentNode : null;
			if (atomParent) atomParent.removeChild(atomWrapper);
			if (atomParent) atomParent.appendChild(atom);
		});
	}
	var artBoard = record ? record.querySelector('.t396__artboard') : null;
	var artBoardWidth = artBoard ? artBoard.clientWidth : 0;
	window.tn_window_width = document.documentElement.clientWidth;
	window.tn_scale_factor = parseFloat((window.tn_window_width / resolution).toFixed(3));
	window.tn_scale_offset = (artBoardWidth * window.tn_scale_factor - artBoardWidth) / 2;
	t396_switchResolution(recid, resolution);
	t396_updateTNobj(recid);
	t396_ab__renderView(artBoard);
	var tildaMode = allRecords ? allRecords.getAttribute('data-tilda-mode') : '';
	var isScaled = t396_ab__getFieldValue(artBoard, 'upscale') === 'window';
	if (isScaled && tildaMode !== 'edit') {
		t_onFuncLoad('t396_scaleBlock', function () {
			t396_scaleBlock(recid);
		});
	}
	t396_allelems__renderView(artBoard);
}

function t396_detectResolution(recid) {
	var artBoardId = 'ab' + recid;
	var windowWidth = window.t396__isMobile ? document.documentElement.clientWidth : window.innerWidth;
	var resolution;

	window.tn[artBoardId].screens.forEach(function (screen) {
		if (windowWidth > screen) resolution = screen;
	});

	return resolution;
}

function t396_initTNobj(recid, artBoard) {
	if (!artBoard) return;
	tn_console('func: initTNobj');

	/* Заводим глобальный объект и добавляем туда общие данные */
	if (typeof window.tn !== 'undefined') {
		t396_setScreensTNobj(recid, artBoard);
		return;
	}

	window.tn = {};
	window.tn.ab_fields = [
		'height',
		'width',
		'bgcolor',
		'bgimg',
		'bgattachment',
		'bgposition',
		'filteropacity',
		'filtercolor',
		'filteropacity2',
		'filtercolor2',
		'height_vh',
		'valign',
	];

	t396_setScreensTNobj(recid, artBoard);
}

function t396_setScreensTNobj(recid, artBoard) {
	var artBoardId = 'ab' + recid;

	/* Заводим для конкретного artboard свой объект и записываем туда уникальные данные */
	window.tn[artBoardId] = {};
	window.tn[artBoardId].screens = [];

	var screens = artBoard.getAttribute('data-artboard-screens');
	if (!screens) {
		/* Если пользователь не менял дефолтные разрешения */
		window.tn[artBoardId].screens = [320, 480, 640, 960, 1200];
	} else {
		/* Если пользовательские настройки есть, то создаём корректный массив */
		screens = screens.split(',');
		screens.forEach(function (screen) {
			screen = parseInt(screen, 10);
			window.tn[artBoardId].screens.push(screen);
		});
	}
}

function t396_updateTNobj(recid) {
	tn_console('func: updateTNobj');
	var artBoardId = 'ab' + recid;
	var allRecords = document.getElementById('allrecords');
	var allRecPaddingLeft = allRecords ? window.getComputedStyle(allRecords).paddingLeft || '0' : '0';
	allRecPaddingLeft = parseInt(allRecPaddingLeft, 10);
	var allRecPaddingRight = allRecords ? window.getComputedStyle(allRecords).paddingRight || '0' : '0';
	allRecPaddingRight = parseInt(allRecPaddingRight, 10);

	if (window.zero_window_width_hook && window.zero_window_width_hook === 'allrecords' && allRecords) {
		window.tn.window_width = allRecords.clientWidth - (allRecPaddingLeft + allRecPaddingRight);
	} else {
		window.tn.window_width = document.documentElement.clientWidth;
	}

	window.tn.window_height = window.t396__isMobile ? document.documentElement.clientHeight : window.innerHeight;
	var screensReverse = window.tn[artBoardId].screens.slice().reverse();

	for (var i = 0; i < screensReverse.length; i++) {
		if (window.tn[artBoardId].curResolution !== screensReverse[i]) continue;
		window.tn[artBoardId].canvas_min_width = screensReverse[i];
		window.tn[artBoardId].canvas_max_width = i === 0 ? window.tn.window_width : screensReverse[i - 1];
	}

	window.tn[artBoardId].grid_width = window.tn[artBoardId].canvas_min_width;
	window.tn[artBoardId].grid_offset_left = (window.tn.window_width - window.tn[artBoardId].grid_width) / 2;
}

var t396_waitForFinalEvent = (function () {
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

function t396_switchResolution(recid, resolution) {
	tn_console('func: switchResolution');
	var artBoardId = 'ab' + recid;
	var resolutionMax = window.tn[artBoardId].screens[window.tn[artBoardId].screens.length - 1];

	window.tn[artBoardId].curResolution = resolution;
	window.tn[artBoardId].curResolution_max = resolutionMax;
}

function t396_artboard_build(data, recid) {
	tn_console('func: t396_artboard_build. Recid:' + recid);
	tn_console(data);

	/* set style to artboard */
	var record = document.getElementById('rec' + recid);
	var allRecords = document.getElementById('allrecords');
	var artBoard = record ? record.querySelector('.t396__artboard') : null;
	if (!artBoard) return false;

	t396_ab__renderView(artBoard);

	var event = document.createEvent('Event');
	event.initEvent('artBoardRendered', true, true);

	/* create elements */
	var elements = artBoard.querySelectorAll('.tn-elem');
	Array.prototype.forEach.call(elements, function (element) {
		var dataType = element.getAttribute('data-elem-type');
		switch (dataType) {
			case 'text':
				t396_addText(artBoard, element);
				break;
			case 'image':
				t396_addImage(artBoard, element);
				break;
			case 'shape':
				t396_addShape(artBoard, element);
				break;
			case 'button':
				t396_addButton(artBoard, element);
				break;
			case 'video':
				t396_addVideo(artBoard, element);
				break;
			case 'html':
				t396_addHtml(artBoard, element);
				break;
			case 'tooltip':
				t396_addTooltip(artBoard, element);
				break;
			case 'form':
				t396_addForm(artBoard, element, recid);
				break;
			case 'gallery':
				t396_addGallery(artBoard, element, recid);
				break;
			case 'vector':
				t396_addVector(artBoard, element);
				break;
		}
	});

	artBoard.classList.remove('rendering');
	artBoard.classList.add('rendered');
	artBoard.dispatchEvent(event);

	var artBoardOverflow = artBoard.getAttribute('data-artboard-ovrflw');
	if ((artBoardOverflow === 'visible' || artBoardOverflow === 'visibleX') && allRecords) {
		allRecords.style.overflow = 'hidden';
	}

	if (artBoardOverflow === 'auto') {
		/*check if artboard has horizontal scrollbar*/
		var diff = Math.abs(artBoard.offsetHeight - artBoard.clientHeight);
		if (diff !== 0) {
			artBoard.style.paddingBottom = diff + 'px';
		}
	}

	if (window.t396__isMobile || ('ontouchend' in document && navigator.userAgent.indexOf('AppleWebKit') !== -1)) {
		var style = document.createElement('style');
		// prettier-ignore
		style.textContent = '@media only screen and (min-width:1366px) and (orientation:landscape) and (-webkit-min-device-pixel-ratio:2) {.t396__carrier {background-attachment:scroll!important;}}';

		record.insertAdjacentElement('beforeend', style);
	}
}

function t396_ab__renderView(artBoard) {
	if (!artBoard) return false;
	var fields = window.tn.ab_fields;
	var allRecords = document.getElementById('allrecords');
	var artBoardHeightVH;

	for (var i = 0; i < fields.length; i++) {
		t396_ab__renderViewOneField(artBoard, fields[i]);
	}

	var artBoardMinHeight = t396_ab__getFieldValue(artBoard, 'height');
	var artBoardMaxHeight = t396_ab__getHeight(artBoard);

	var isTildaModeEdit = allRecords ? allRecords.getAttribute('data-tilda-mode') === 'edit' : false;
	var isScaled = t396_ab__getFieldValue(artBoard, 'upscale') === 'window';
	artBoardHeightVH = t396_ab__getFieldValue(artBoard, 'height_vh');
	if (isScaled && !isTildaModeEdit && artBoardHeightVH) {
		var scaledMinHeight = parseInt(artBoardMinHeight, 10) * window.tn_scale_factor;
	}
	var offsetTop;
	if (artBoardMinHeight === artBoardMaxHeight || (scaledMinHeight && scaledMinHeight >= artBoardMaxHeight)) {
		offsetTop = 0;
	} else {
		var artBoardVerticalAlign = t396_ab__getFieldValue(artBoard, 'valign');
		switch (artBoardVerticalAlign) {
			case 'top':
				offsetTop = 0;
				break;
			case 'center':
				if (scaledMinHeight) {
					offsetTop = parseFloat(((artBoardMaxHeight - scaledMinHeight) / 2).toFixed(1));
				} else {
					offsetTop = parseFloat(((artBoardMaxHeight - artBoardMinHeight) / 2).toFixed(1));
				}
				break;
			case 'bottom':
				if (scaledMinHeight) {
					offsetTop = parseFloat((artBoardMaxHeight - scaledMinHeight).toFixed(1));
				} else {
					offsetTop = parseFloat((artBoardMaxHeight - artBoardMinHeight).toFixed(1));
				}
				break;
			case 'stretch':
				offsetTop = 0;
				artBoardMinHeight = artBoardMaxHeight;
				break;
			default:
				offsetTop = 0;
				break;
		}
	}

	artBoard.setAttribute('data-artboard-proxy-min-offset-top', offsetTop);
	artBoard.setAttribute('data-artboard-proxy-min-height', artBoardMinHeight);
	artBoard.setAttribute('data-artboard-proxy-max-height', artBoardMaxHeight);

	var filter = artBoard.querySelector('.t396__filter');
	var carrier = artBoard.querySelector('.t396__carrier');
	artBoardHeightVH = t396_ab__getFieldValue(artBoard, 'height_vh');
	artBoardHeightVH = parseFloat(artBoardHeightVH);
	if (window.t396__isMobile && artBoardHeightVH) {
		var height = (document.documentElement.clientHeight * artBoardHeightVH) / 100;
		artBoard.style.height = height + 'px';
		if (filter) filter.style.height = height + 'px';
		if (carrier) carrier.style.height = height + 'px';
	}
}

function t396_addText(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addText');

	/*add data atributes*/
	var fieldsString = 'top,left,width,container,axisx,axisy,widthunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);
}

function t396_addImage(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addImage');

	/*add data atributes*/
	var fieldsString = 'img,width,filewidth,fileheight,top,left,container,axisx,axisy,widthunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);

	var images = element.querySelectorAll('img');
	Array.prototype.forEach.call(images, function (img) {
		img.addEventListener('load', function () {
			t396_elem__renderViewOneField(element, 'top');
			if (img.src) {
				setTimeout(function () {
					t396_elem__renderViewOneField(element, 'top');
				}, 2000);
			}
		});
		if (img.complete) {
			t396_elem__renderViewOneField(element, 'top');
			if (img.src) {
				setTimeout(function () {
					t396_elem__renderViewOneField(element, 'top');
				}, 2000);
			}
		}
		img.addEventListener('tuwidget_done', function () {
			t396_elem__renderViewOneField(element, 'top');
		});
		t396_changeFilterOnSafari(element, img);
	});
}

function t396_addShape(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addShape');

	/*add data atributes*/
	var fieldsString = 'width,height,top,left,';
	fieldsString += 'container,axisx,axisy,widthunits,heightunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);

	/*fix bug when you use blur&rotate*/
	var atom = element.querySelector('.tn-atom');
	var elementHasBlur =
		/* check for other browsers */
		(window.getComputedStyle(element).backdropFilter &&
			window.getComputedStyle(element).backdropFilter !== 'none') ||
		/* check for safari */
		(window.getComputedStyle(element).webkitBackdropFilter &&
			window.getComputedStyle(element).webkitBackdropFilter !== 'none');

	var atomsTransform;
	var atomComputedStyle = window.getComputedStyle(atom);
	if (atom && atomComputedStyle && atomComputedStyle.transform) {
		// prettier-ignore
		atomsTransform = atomComputedStyle.transform.substring(0, 6) === 'matrix' ? atomComputedStyle.transform : null;
	}

	/*
	matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0) === rotate(45deg)
	matrix(a, b, c, d, tx, ty)
	if there is any rotation than
	b === -c && a === d
	*/
	if (atomsTransform && elementHasBlur) {
		atom.style.transform = 'none';
		element.style.transform = atomsTransform;
	}
}

/**
 * Only for Safari.
 * Hard change filter value in element.
 *
 * @param {HTMLElement} element - .t396__elem
 * @param {HTMLImageElement} img - .t-img
 */
function t396_changeFilterOnSafari(element, img) {
	if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) return;
	var backdropFilter = window.getComputedStyle(element).webkitBackdropFilter;
	if (!backdropFilter || backdropFilter === 'none') return;
	if ('IntersectionObserver' in window) {
		var imageObserver = new IntersectionObserver(function (entries, imageObserver) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				var target = entry.target;
				imageObserver.unobserve(target);
				target.style.webkitBackdropFilter = 'none';
				t396_WaitForUploadImg(img, function () {
					target.style.webkitBackdropFilter = '';
				});
			});
		});
		imageObserver.observe(element);
	}
}

/**
 * Wait image loading.
 * Only for Safari via lazy-loading
 *
 * @param {HTMLImageElement} img
 * @param {Function} cb
 */
function t396_WaitForUploadImg(img, cb) {
	if (window.lazy !== 'y') {
		cb();
		return;
	}
	var timerID = setTimeout(function () {
		if (img.classList.contains('loaded') && img.clientWidth && img.src) {
			cb();
			clearTimeout(timerID);
		} else {
			t396_WaitForUploadImg(img, cb);
		}
	}, 300);
}

function t396_addButton(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addButton');

	/*add data atributes*/
	var fieldsString = 'top,left,width,height,container,axisx,axisy,caption,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);

	return element;
}

function t396_addVideo(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addVideo');

	/*add data atributes*/
	var fieldsString = 'width,height,top,left,';
	fieldsString += 'container,axisx,axisy,widthunits,heightunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);

	/*continued in the file "tilda-zero-video-1.0.js"*/
	t_onFuncLoad('t396_initVideo', function () {
		t396_initVideo(element);
	});
}

function t396_addHtml(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addHtml');

	/*add data atributes*/
	var fieldsString = 'width,height,top,left,';
	fieldsString += 'container,axisx,axisy,widthunits,heightunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);
}

function t396_addTooltip(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addTooltip');

	/*add data atributes*/
	var fieldsString = 'width,height,top,left,';
	fieldsString += 'container,axisx,axisy,widthunits,heightunits,leftunits,topunits,tipposition';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);

	/*continued in the file "tilda-zero-tooltip-1.0.js"*/
	t_onFuncLoad('t396_initTooltip', function () {
		t396_initTooltip(element);
	});
}

function t396_addForm(artBoard, element, recid) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addForm');

	/*add data atributes*/
	var fieldsString = 'width,top,left,';
	fieldsString += 'inputs,container,axisx,axisy,widthunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*find forms data for script*/
	var formElems;
	var elemid = element.getAttribute('data-elem-id');
	var textarea = element.querySelector('.tn-atom__inputs-textarea');
	if (textarea) formElems = textarea.value;

	/*continued in the file "tilda-zero-forms-1.0.js"*/
	t_onFuncLoad('t_zeroForms__init', function () {
		t396_elem__renderView(element);
		t_zeroForms__init(recid, elemid, formElems);
		t396_elem__renderView(element);
	});
}

function t396_addGallery(artBoard, element, recid) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addGallery');

	/*add data atributes*/
	var fieldsString = 'width,height,top,left,';
	fieldsString += 'imgs,container,axisx,axisy,widthunits,heightunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);

	var elemid = element.getAttribute('data-elem-id');

	/*continued in the file "tilda-zero-gallery-1.0.js"*/
	t_onFuncLoad('t_zeroGallery__init', function () {
		t_zeroGallery__init(recid, elemid);
	});
}

function t396_addVector(artBoard, element) {
	element = t396_getEl(element);
	if (!element) return;
	tn_console('func: addVector');

	/*add data atributes*/
	var fieldsString = 'width,filewidth,fileheight,top,left,container,axisx,axisy,widthunits,leftunits,topunits';
	element.setAttribute('data-fields', fieldsString);

	/*render elem view*/
	t396_elem__renderView(element);
}

// TODO: удалить функцию-рудимент, которая унаследовалась из редактора)
// eslint-disable-next-line no-unused-vars
function t396_elem__setFieldValue(element, prop, val, flag_render, flag_updateui, resolution) {
	element = t396_getEl(element);
	if (!element) return;
	var artBoard = element.closest('.t396__artboard');
	var recid = artBoard.getAttribute('data-artboard-recid');
	var artBoardId = 'ab' + recid;
	if (!resolution) resolution = window.tn[artBoardId].curResolution;
	if (+resolution < window.tn[artBoardId].curResolution_max && prop !== 'zindex') {
		element.setAttribute('data-field-' + prop + '-res-' + resolution + '-value', val);
	} else {
		element.setAttribute('data-field-' + prop + '-value', val);
	}
	// eslint-disable-next-line no-undef
	if (flag_render === 'render') elem__renderViewOneField(element, prop);
	// eslint-disable-next-line no-undef
	if (flag_updateui === 'updateui') panelSettings__updateUi(element, prop, val);
}

function t396_elem__getFieldValue(element, prop) {
	element = t396_getEl(element);
	if (!element) return;

	var artBoard = element.closest('.t396__artboard');
	var recid = artBoard.getAttribute('data-artboard-recid');
	var artBoardId = 'ab' + recid;

	if (window.tn[artBoardId].curResolution === window.tn[artBoardId].curResolution_max) {
		dataField = element.getAttribute('data-field-' + prop + '-value');
	} else {
		dataField = element.getAttribute(
			'data-field-' + prop + '-res-' + window.tn[artBoardId].curResolution + '-value'
		);
	}

	if (!dataField && dataField !== '') {
		for (var i = 0; i < window.tn[artBoardId].screens.length; i++) {
			if (window.tn[artBoardId].screens[i] <= window.tn[artBoardId].curResolution) continue;

			if (window.tn[artBoardId].screens[i] === window.tn[artBoardId].curResolution_max) {
				dataField = element.getAttribute('data-field-' + prop + '-value');
			} else {
				dataField = element.getAttribute(
					'data-field-' + prop + '-res-' + window.tn[artBoardId].screens[i] + '-value'
				);
			}
			if (dataField) break;
		}
	}

	return dataField;
}

function t396_elem__renderView(element) {
	element = t396_getEl(element);
	tn_console('func: elem__renderView');
	var fields = element ? element.getAttribute('data-fields') : '';
	if (!fields) return false;
	fields = fields.split(',');

	/*set to element value of every field  via css*/
	fields.forEach(function (field) {
		t396_elem__renderViewOneField(element, field);
	});

	t396_elem_fixLineHeight(element);
}

function t396_elem__renderViewOneField(element, field) {
	element = t396_getEl(element);
	if (!element) return;

	/**
	 * If the element already has dimensions and coordinates,
	 * you don't need to do anything
	 */

	if (element.getAttribute('data-scale-off') === 'yes') {
		return;
	}

	var value = t396_elem__getFieldValue(element, field);
	var elementType;
	var borderWidth;
	var borderStyle;
	var currentValue;
	var slidesMain;
	var slidesImg;

	switch (field) {
		case 'left':
			value = t396_elem__convertPosition__Local__toAbsolute(element, field, value);
			element.style.left = parseFloat(value).toFixed(1) + 'px';
			break;
		case 'top':
			value = t396_elem__convertPosition__Local__toAbsolute(element, field, value);
			element.style.top = parseFloat(value).toFixed(1) + 'px';
			break;
		case 'width':
			value = t396_elem__getWidth(element, value);
			element.style.width = parseFloat(value).toFixed(1) + 'px';
			elementType = element.getAttribute('data-elem-type');
			switch (elementType) {
				case 'tooltip':
					var pinSvgIcon = element.querySelectorAll('.tn-atom__pin-icon');
					/* add width to near parent svg to fix InternerExplorer problem */
					Array.prototype.forEach.call(pinSvgIcon, function (pin) {
						var pinSize = parseFloat(value).toFixed(1) + 'px';
						pin.style.width = pinSize;
						pin.style.height = pinSize;
					});
					element.style.height = parseInt(value).toFixed(1) + 'px';
					break;
				case 'gallery':
					borderWidth = t396_elem__getFieldValue(element, 'borderwidth');
					borderStyle = t396_elem__getFieldValue(element, 'borderstyle');
					if (!borderStyle || !borderWidth || borderStyle === 'none') {
						borderWidth = 0;
					}
					value -= borderWidth * 2;
					currentValue = parseFloat(value).toFixed(1) + 'px';
					slidesMain = element.querySelector('.t-slds__main');
					slidesImg = element.querySelectorAll('.tn-atom__slds-img');

					element.style.width = currentValue;
					if (slidesMain) slidesMain.style.width = currentValue;
					Array.prototype.forEach.call(slidesImg, function (img) {
						img.style.width = currentValue;
					});
					break;
			}
			break;
		case 'height':
			elementType = element.getAttribute('data-elem-type');
			if (elementType === 'tooltip') return;
			value = t396_elem__getHeight(element, value);
			element.style.height = parseFloat(value).toFixed(1) + 'px';

			if (elementType === 'gallery') {
				borderWidth = t396_elem__getFieldValue(element, 'borderwidth');
				borderStyle = t396_elem__getFieldValue(element, 'borderstyle');
				if (!borderStyle || !borderWidth || borderStyle === 'none') {
					borderWidth = 0;
				}
				value -= borderWidth * 2;
				currentValue = parseFloat(value).toFixed(1) + 'px';
				slidesMain = element.querySelector('.t-slds__main');
				slidesImg = element.querySelectorAll('.tn-atom__slds-img');

				element.style.height = currentValue;
				if (slidesMain) slidesMain.style.height = currentValue;
				Array.prototype.forEach.call(slidesImg, function (img) {
					img.style.height = currentValue;
				});
			}
			break;
		case 'container':
			t396_elem__renderViewOneField(element, 'left');
			t396_elem__renderViewOneField(element, 'top');
			break;
		case 'inputs':
			var textArea = element.querySelector('.tn-atom__inputs-textarea');
			value = textArea ? textArea.value : '';
			try {
				// eslint-disable-next-line no-undef
				t_zeroForms__renderForm(element, value);
				// eslint-disable-next-line no-empty
			} catch (err) {}
			break;
	}

	if (
		field === 'width' ||
		field === 'height' ||
		field === 'fontsize' ||
		field === 'fontfamily' ||
		field === 'letterspacing' ||
		field === 'fontweight' ||
		field === 'img'
	) {
		t396_elem__renderViewOneField(element, 'left');
		t396_elem__renderViewOneField(element, 'top');
	}
}

function t396_elem__convertPosition__Local__toAbsolute(element, field, value) {
	element = t396_getEl(element);
	if (!element) return;
	var artBoard = element.closest('.t396__artboard');
	var recid = artBoard.getAttribute('data-artboard-recid');
	var artBoardId = 'ab' + recid;
	var verticalAlignValue = t396_ab__getFieldValue(artBoard, 'valign');
	var isScaled = t396_ab__getFieldValue(artBoard, 'upscale') === 'window';
	var allRecords = document.getElementById('allrecords');
	var tildaMode = allRecords ? allRecords.getAttribute('data-tilda-mode') : '';
	var isTildaModeEdit = tildaMode === 'edit';
	var isOnlyScalable = t396_isOnlyScalableBrowser();
	var isScaledElement = !isTildaModeEdit && isScaled && isOnlyScalable;
	var isZoomedElement = !isTildaModeEdit && isScaled && !isOnlyScalable;
	var valueAxisY = t396_elem__getFieldValue(element, 'axisy');
	var valueAxisX = t396_elem__getFieldValue(element, 'axisx');
	var container = t396_elem__getFieldValue(element, 'container');

	value = parseInt(value);

	var elementContainer;
	var offsetLeft;
	var offsetTop;
	var elementWidth;
	var elementContainerWidth;
	var elementHeight;
	var elementContainerHeight;

	switch (field) {
		case 'left':
			elementContainer = container === 'grid' ? 'grid' : 'window';
			offsetLeft = container === 'grid' ? window.tn[artBoardId].grid_offset_left : 0;
			elementContainerWidth = container === 'grid' ? window.tn[artBoardId].grid_width : window.tn.window_width;

			/*fluid or not*/
			var elementLeftUnits = t396_elem__getFieldValue(element, 'leftunits');
			if (elementLeftUnits === '%') {
				value = t396_roundFloat((elementContainerWidth * value) / 100);
			}

			/*with scale logic*/
			if (!isTildaModeEdit && isScaled) {
				if (container === 'grid' && isOnlyScalable) value = value * window.tn_scale_factor;
			} else {
				value = offsetLeft + value;
			}

			if (valueAxisX === 'center') {
				elementWidth = t396_elem__getWidth(element);

				if (isScaledElement && elementContainer !== 'window') {
					elementContainerWidth *= window.tn_scale_factor;
					elementWidth *= window.tn_scale_factor;
				}

				value = elementContainerWidth / 2 - elementWidth / 2 + value;
			}

			if (valueAxisX === 'right') {
				elementWidth = t396_elem__getWidth(element);
				if (isScaledElement && elementContainer !== 'window') {
					elementContainerWidth *= window.tn_scale_factor;
					elementWidth *= window.tn_scale_factor;
				}
				value = elementContainerWidth - elementWidth + value;
			}

			if (isScaledElement && elementContainer !== 'window') {
				elementWidth = t396_elem__getWidth(element);
				value = value + (elementWidth * window.tn_scale_factor - elementWidth) / 2;
			}

			break;

		case 'top':
			var artBoardParent = element.parentNode;
			if (!artBoardParent.classList.contains('t396__artboard')) {
				artBoardParent = artBoardParent.parentNode;
			}
			var proxyMinOffsetTop = artBoardParent
				? artBoardParent.getAttribute('data-artboard-proxy-min-offset-top')
				: '0';
			var proxyMinHeight = artBoardParent ? artBoardParent.getAttribute('data-artboard-proxy-min-height') : '0';
			var proxyMaxHeight = artBoardParent ? artBoardParent.getAttribute('data-artboard-proxy-max-height') : '0';

			var getElementHeight = function (element) {
				var height = t396_elem__getHeight(element);

				if (element && element.getAttribute('data-elem-type') === 'image') {
					var width = t396_elem__getWidth(element);
					var fileWidth = t396_elem__getFieldValue(element, 'filewidth');
					var fileHeight = t396_elem__getFieldValue(element, 'fileheight');

					if (fileWidth && fileHeight) {
						var ratio = parseInt(fileWidth) / parseInt(fileHeight);
						height = width / ratio;
					}
				}
				return height;
			};

			elementContainer = container === 'grid' ? 'grid' : 'window';
			offsetTop = container === 'grid' ? parseFloat(proxyMinOffsetTop) : 0;
			elementContainerHeight = container === 'grid' ? parseFloat(proxyMinHeight) : parseFloat(proxyMaxHeight);

			/*fluid or not*/
			var elTopUnits = t396_elem__getFieldValue(element, 'topunits');
			if (elTopUnits === '%') {
				value = elementContainerHeight * (value / 100);
			}

			if (isScaledElement && elementContainer !== 'window') {
				value *= window.tn_scale_factor;
			}

			if (isZoomedElement && elementContainer !== 'window') {
				offsetTop = verticalAlignValue === 'stretch' ? 0 : offsetTop / window.tn_scale_factor;
			}

			value = offsetTop + value;

			var artBoardHeightVH = t396_ab__getFieldValue(artBoardParent, 'height_vh');
			var artBoardMinHeight = t396_ab__getFieldValue(artBoardParent, 'height');
			var artBoardMaxHeight = t396_ab__getHeight(artBoardParent);
			if (isScaled && !isTildaModeEdit && artBoardHeightVH) {
				var scaledMinHeight = parseInt(artBoardMinHeight, 10) * window.tn_scale_factor;
			}

			if (valueAxisY === 'center') {
				elementHeight = getElementHeight(element);

				if (isScaledElement && elementContainer !== 'window') {
					if (verticalAlignValue !== 'stretch') {
						elementContainerHeight = elementContainerHeight * window.tn_scale_factor;
					} else if (scaledMinHeight) {
						elementContainerHeight =
							scaledMinHeight > artBoardMaxHeight ? scaledMinHeight : artBoardMaxHeight;
					} else {
						elementContainerHeight = artBoardParent.clientHeight;
					}

					elementHeight *= window.tn_scale_factor;
				}

				if (
					!isTildaModeEdit &&
					isScaled &&
					!isOnlyScalable &&
					elementContainer !== 'window' &&
					verticalAlignValue === 'stretch'
				) {
					if (scaledMinHeight) {
						elementContainerHeight =
							scaledMinHeight > artBoardMaxHeight ? scaledMinHeight : artBoardMaxHeight;
					} else {
						elementContainerHeight = artBoardParent.clientHeight;
					}
					elementContainerHeight = elementContainerHeight / window.tn_scale_factor;
				}

				value = elementContainerHeight / 2 - elementHeight / 2 + value;
			}

			if (valueAxisY === 'bottom') {
				elementHeight = getElementHeight(element);

				if (isScaledElement && elementContainer !== 'window') {
					if (verticalAlignValue !== 'stretch') {
						elementContainerHeight = elementContainerHeight * window.tn_scale_factor;
					} else if (scaledMinHeight) {
						elementContainerHeight =
							scaledMinHeight > artBoardMaxHeight ? scaledMinHeight : artBoardMaxHeight;
					} else {
						elementContainerHeight = artBoardParent.clientHeight;
					}

					elementHeight *= window.tn_scale_factor;
				}

				if (
					!isTildaModeEdit &&
					isScaled &&
					!isOnlyScalable &&
					elementContainer !== 'window' &&
					verticalAlignValue === 'stretch'
				) {
					if (scaledMinHeight) {
						elementContainerHeight =
							scaledMinHeight > artBoardMaxHeight ? scaledMinHeight : artBoardMaxHeight;
					} else {
						elementContainerHeight = artBoardParent.clientHeight;
					}

					elementContainerHeight = elementContainerHeight / window.tn_scale_factor;
				}

				value = elementContainerHeight - elementHeight + value;
			}

			if (isScaledElement && elementContainer !== 'window') {
				elementHeight = getElementHeight(element);
				value = value + (elementHeight * window.tn_scale_factor - elementHeight) / 2;
			}

			break;
	}

	return value;
}

function t396_elem_fixLineHeight(element) {
	/**
	 * Different browsers have different algorithms for calculating relative line-height.
	 * Because of this, large text elements have different heights in different browsers.
	 * To fix this, calculate the line-height in pixels and round it up
	 */

	// early return if element type not text
	var elementType = element.getAttribute('data-elem-type');
	if (elementType !== 'text') return;

	// early return if atom is undefined
	var atom = element.querySelector('.tn-atom');
	if (!atom) return;

	var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	var zoom = element.style.zoom;

	// fix for Safari: for correct property of line-height need to remove zoom,
	// because scaling affects the line-height in Safari
	if (isSafari && zoom) element.style.removeProperty('zoom');

	// remove line-height for case of resize
	atom.style.removeProperty('line-height');
	var lineHeight = parseFloat(window.getComputedStyle(atom).lineHeight);

	// if line-height succesfully find, set it to element
	if (lineHeight && !isNaN(lineHeight)) {
		atom.style.lineHeight = Math.round(lineHeight) + 'px';
	}

	// fix for Safari: set back zoom property
	if (isSafari && zoom) element.style.zoom = zoom;
}

// TODO: удалить функцию-рудимент, которая унаследовалась из редактора)
// eslint-disable-next-line no-unused-vars
function t396_ab__setFieldValue(artBoard, prop, val, resolution) {
	/* tn_console('func: ab__setFieldValue '+prop+'='+val);	*/
	var recid = artBoard.getAttribute('data-artboard-recid');
	var artBoardId = 'ab' + recid;
	if (!resolution) resolution = window.tn[artBoardId].curResolution;
	if (resolution < window.tn[artBoardId].curResolution_max && artBoard) {
		artBoard.setAttribute('data-artboard-' + prop + '-res-' + resolution, val);
	} else if (artBoard) {
		artBoard.setAttribute('data-artboard-' + prop, val);
	}
}

function t396_ab__getFieldValue(artBoard, prop) {
	if (!artBoard) return;

	var dataField;
	var recid = artBoard.getAttribute('data-artboard-recid');
	var artBoardId = 'ab' + recid;

	if (window.tn[artBoardId].curResolution === window.tn[artBoardId].curResolution_max) {
		dataField = artBoard.getAttribute('data-artboard-' + prop);
	} else {
		dataField = artBoard.getAttribute('data-artboard-' + prop + '-res-' + window.tn[artBoardId].curResolution);
	}

	if (typeof dataField === 'undefined') {
		for (var i = 0; i < window.tn[artBoardId].screens.length; i++) {
			if (window.tn[artBoardId].screens[i] <= window.tn[artBoardId].curResolution) continue;

			if (window.tn[artBoardId].screens[i] === window.tn[artBoardId].curResolution_max) {
				dataField = artBoard.getAttribute('data-artboard-' + prop);
			} else {
				dataField = artBoard.getAttribute('data-artboard-' + prop + '-res-' + window.tn[artBoardId].screens[i]);
			}
			if (typeof dataField !== 'undefined') {
				break;
			}
		}
	}

	return dataField;
}

function t396_ab__renderViewOneField(artBoard, field) {
	t396_ab__getFieldValue(artBoard, field);
}

function t396_allelems__renderView(artBoard) {
	if (!artBoard) return false;
	tn_console('func: allelems__renderView: abid:' + artBoard.getAttribute('data-artboard-recid'));
	var ArtBoardelements = artBoard.querySelectorAll('.tn-elem');
	Array.prototype.forEach.call(ArtBoardelements, function (element) {
		t396_elem__renderView(element);
	});
}

// eslint-disable-next-line no-unused-vars
function t396_ab__filterUpdate(artBoard) {
	var filter = artBoard.querySelector('.t396__filter');
	if (!filter) return;
	var filterColorRgb = filter.getAttribute('data-filtercolor-rgb');
	var filterColorRgb2 = filter.getAttribute('data-filtercolor2-rgb');
	var filterOpacity = filter.getAttribute('data-filteropacity');
	var filterOpacity2 = filter.getAttribute('data-filteropacity2');

	if (filterColorRgb && !filterColorRgb2) {
		filter.style.backgroundColor = 'rgba(' + filterColorRgb + ',' + filterOpacity + ')';
	} else if (!filterColorRgb && filterColorRgb2) {
		filter.style.backgroundColor = 'rgba(' + filterColorRgb2 + ',' + filterOpacity2 + ')';
	} else if (filterColorRgb && filterColorRgb2) {
		// prettier-ignore
		filter.style.background = '-webkit-gradient(linear, left top, left bottom, from(rgba(' + filterColorRgb + ',' + filterOpacity + ')), to(rgba(' + filterColorRgb2 + ',' + filterOpacity2 + ')) )';
	} else {
		filter.style.backgroundColor = 'transparent';
	}
}

function t396_ab__getHeight(artBoard, artBoardHeight) {
	if (!artBoardHeight) artBoardHeight = t396_ab__getFieldValue(artBoard, 'height');
	artBoardHeight = parseFloat(artBoardHeight);

	/* get Artboard height (fluid or px) */
	var artBoardHeightVH = t396_ab__getFieldValue(artBoard, 'height_vh');
	if (artBoardHeightVH) {
		artBoardHeightVH = parseFloat(artBoardHeightVH);
		if (!isNaN(artBoardHeightVH)) {
			var artBoardHeightVHpx = (window.tn.window_height * artBoardHeightVH) / 100;
			if (artBoardHeight < artBoardHeightVHpx) {
				artBoardHeight = artBoardHeightVHpx;
			}
		}
	}
	return artBoardHeight;
}

// eslint-disable-next-line no-unused-vars
function t396_hex2rgb(hexStr) {
	/*  note: hexStr should be #rrggbb */
	var hex = parseInt(hexStr.substring(1), 16);
	var r = (hex & 0xff0000) >> 16;
	var g = (hex & 0x00ff00) >> 8;
	var b = hex & 0x0000ff;
	return [r, g, b];
}

function t396_elem__getWidth(element, value) {
	element = t396_getEl(element);
	var artBoard = element.closest('.t396__artboard');
	var recid = artBoard.getAttribute('data-artboard-recid');
	var artBoardId = 'ab' + recid;
	if (!value) value = t396_elem__getFieldValue(element, 'width');
	value = parseFloat(value);
	var elWidthUnits = t396_elem__getFieldValue(element, 'widthunits');
	if (elWidthUnits === '%') {
		var elementContainer = t396_elem__getFieldValue(element, 'container');
		if (elementContainer === 'window') {
			value = (window.tn.window_width * value) / 100;
		} else {
			value = (window.tn[artBoardId].grid_width * value) / 100;
		}
	}
	return value;
}

function t396_elem__getHeight(element, value) {
	element = t396_getEl(element);
	if (!value) value = t396_elem__getFieldValue(element, 'height');
	value = parseFloat(value);
	var elemType = element.getAttribute('data-elem-type');

	if (elemType === 'shape' || elemType === 'video' || elemType === 'html' || elemType === 'gallery') {
		var elHeightUnits = t396_elem__getFieldValue(element, 'heightunits');
		if (elHeightUnits === '%') {
			var artBoard = element.parentNode;
			var proxyMinHeight = artBoard ? artBoard.getAttribute('data-artboard-proxy-min-height') : '0';
			var proxyMaxHeight = artBoard ? artBoard.getAttribute('data-artboard-proxy-max-height') : '0';
			var artBoardMinHeight = parseFloat(proxyMinHeight);
			var artBoardMaxHeight = parseFloat(proxyMaxHeight);
			var elementContainer = t396_elem__getFieldValue(element, 'container');

			if (elementContainer === 'window') {
				value = artBoardMaxHeight * (value / 100);
			} else {
				value = artBoardMinHeight * (value / 100);
			}
		}
	} else if (elemType !== 'button') {
		value = element.clientHeight;
	}

	return value;
}

function t396_roundFloat(n) {
	n = Math.round(n * 100) / 100;
	return n;
}

function tn_console(str) {
	// eslint-disable-next-line no-console
	if (+window.tn_comments === 1) console.log(str);
}

// eslint-disable-next-line no-unused-vars
function t396_hex2rgba(hexStr, opacity) {
	if (!hexStr) return false;
	var a = hexStr.replace(/#/, '');
	if (a.length === 3) hexStr = '#' + a[0] + a[0] + a[1] + a[1] + a[2] + a[2];
	var hex = parseInt(hexStr.substring(1), 16);
	var r = (hex & 0xff0000) >> 16;
	var g = (hex & 0x00ff00) >> 8;
	var b = hex & 0x0000ff;
	return [r, g, b, parseFloat(opacity)];
}

function t396_removeElementFromDOM(el) {
	el = t396_getEl(el);
	if (el && el.parentNode) {
		el.parentNode.removeChild(el);
	}
}

function t396_getEl(el) {
	if (window.jQuery && el instanceof jQuery) {
		return el.length ? el.get(0) : null;
	} else {
		return el;
	}
}

if (!Element.prototype.matches) {
	Element.prototype.matches =
		Element.prototype.matchesSelector ||
		Element.prototype.msMatchesSelector ||
		Element.prototype.mozMatchesSelector ||
		Element.prototype.webkitMatchesSelector ||
		Element.prototype.oMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
		var el = this;
		while (el && el.nodeType === 1) {
			if (Element.prototype.matches.call(el, s)) {
				return el;
			}
			el = el.parentElement || el.parentNode;
		}
		return null;
	};
}