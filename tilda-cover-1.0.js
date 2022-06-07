/**
 * tilda-cover создает фон в блоках CR... Так же, здесь есть функции, которые отвечают за эффекты
 * этих фонов - паралакс или фиксация.
 *
 * В tilda-cover есть код, который работает со стрелками на обложках, обспечивая плавный скролл для
 * перехода с текущего блока к следующему.
 *
 * tilda-cover взаимодействует со скриптом tilda-video-processor. Из tilda-cover передаются параметры,
 * заданные для видео в соответствующие функции видео-процессора t_videoprocessor__processHTML5Video - для .webm или .mp4;
 * и processYoutubeVideo - для YouTube-видео.
 */

/**
 * This function check current size of cover element, get speed factor, and create parallax.
 * Using only in desktop
 *
 * @param {HTMLElement} el
 * @param {number} speedFactor
 * @param {Boolean} outerHeight
 */
 function t_cover__parallax(el, speedFactor, outerHeight) {
	var windowHeight = window.innerHeight;
	window.addEventListener('resize', function () {
		windowHeight = window.innerHeight;
	});

	if (document.body.style.webkitTransform) el.style.position = 'relative';
	if (typeof speedFactor !== 'number' && !speedFactor) speedFactor = 0.1;
	var elementHeight = outerHeight ? t_cover__getHeightWithMargin(el) : t_cover__getHeightWithoutPadding(el);

	var events = ['scroll', 'resize'];
	events.forEach(function (event) {
		window.addEventListener(event, function () {
			t_cover__parallaxUpdate(el, speedFactor, windowHeight, elementHeight);
		});
	});

	if (document.readyState !== 'complete') {
		window.addEventListener('load', function () {
			t_cover__parallaxUpdate(el, speedFactor, windowHeight, elementHeight);
		});
	}
	t_cover__parallaxUpdate(el, speedFactor, windowHeight, elementHeight);
}

/**
 * update parallax state
 *
 * @param {HTMLElement} el
 * @param {number} speedFactor
 * @param {number} windowHeight
 * @param {number} elementHeight
 */
function t_cover__parallaxUpdate(el, speedFactor, windowHeight, elementHeight) {
	var viewportTopPos = window.pageYOffset;
	var elementAbsoluteTop = el.getBoundingClientRect().top + viewportTopPos;
	var elementRelativeTop = el.getBoundingClientRect().top;
	var elementBottomPos = elementAbsoluteTop + elementHeight;
	var viewportBottom = viewportTopPos + windowHeight;

	if (elementBottomPos < viewportTopPos || elementAbsoluteTop > viewportBottom) return;

	var bgVerticalShift = (-1) * Math.round(elementRelativeTop * speedFactor);
	if (document.body.style.webkitTransform) {
		el.style.webkitTransform = 'translateY(' + bgVerticalShift + 'px)';
	} else {
		el.style.top = bgVerticalShift + 'px';
	}
}

/**
 * Initing cover after DOM is loaded.
 * Get current cover element, get from it data-attributes,
 *
 * @param {string} id - current cover id
 */
function cover_init(id) {
	var record = document.getElementById('rec' + id);
	var el = document.getElementById('coverCarry' + id);
	// cover logo used in blocks CR34 and CR35
	var coverLogo = record ? record.querySelector('img[data-hook-clogo]') : null;
	if (!el) return;

	// create object with empty values
	var coverParams = {
		'cover-bg': '',
		'cover-height': '',
		'cover-parallax': '',
		'video-url-mp4': '',
		'video-url-webm': '',
		'video-url-youtube': '',
		'video-noloop': '',
		'video-nomute': '',
		'video-nocover': '',
		'bg-base64': '',
	};

	// iterating keys from created object and append to it current values
	for (var key in coverParams) {
		var elAttribute = el.getAttribute('data-content-' + key);
		if (elAttribute) coverParams[key] = elAttribute;
	}

	var videoFormats = ['mp4', 'webm', 'youtube'];

	// if element has parameter nocover - switch off video url
	if (coverParams['video-nocover'] === 'yes') {
		videoFormats.forEach(function (videoFormat) {
			coverParams['video-url-' + videoFormat] = '';
		});
	}

	// checking if one of the video-url params keys has URL as its value
	var isContainsVideo = videoFormats.some(function (videoFormat) {
		return !!(coverParams['video-url-' + videoFormat]);
	});

	if (window.isMobile && isContainsVideo) {
		el.style.backgroundImage = 'url("' + coverParams['cover-bg'] + '")';
	}

	// fix content height
	setTimeout(function () {
		t_cover_recalculateContentHeight(id, false, 0);
		cover_fixBackgroundFixedNode(id);
	}, 300);

	if (coverLogo) {
		coverLogo.onload = function () {
			t_cover_recalculateContentHeight(id, false, 500);
		};
	}

	if (window.isMobile || 'ontouchend' in document) {
		window.addEventListener('orientationchange', function () {
			// need setTimeout to change height, after device rotating,
			// otherwise height will be calculated at time, which orientationchange be triggered
			t_cover_recalculateContentHeight(id, true, 200);
		});
	} else {
		window.addEventListener('resize', function () {
			t_cover_recalculateContentHeight(id, false, 0);
		});
	}

	setListenerToArrow(id);
	t_cover_setCoverParams(el, coverParams, isContainsVideo);
}

/**
 * recalc content height
 *
 * @param {string} id
 * @param {Boolean} isOrientationChange
 * @param {number} timeout
 */
function t_cover_recalculateContentHeight(id, isOrientationChange, timeout) {
	if (timeout) {
		setTimeout(function () {
			t_cover__recalcCoverHeight(id, isOrientationChange);
			cover_fixBackgroundFixedStyles(id);
		}, timeout);
	} else {
		t_cover__recalcCoverHeight(id, isOrientationChange);
		cover_fixBackgroundFixedStyles(id);
	}
}

/**
 * append to current cover some styles/element,
 * depending on type of parallax, contains video url etc.
 *
 * @param {HTMLElement} el
 * @param {Object} coverParams
 * @param {Boolean} isContainsVideo
 */
function t_cover_setCoverParams(el, coverParams, isContainsVideo) {
	var isFixedParallax = coverParams['cover-parallax'] === 'fixed';
	var isDynamicParallax = coverParams['cover-parallax'] === 'dynamic';
	var isbgBase64 = coverParams['bg-base64'] === 'yes';

	t_cover__setCoverVideoParams(el, coverParams, isContainsVideo, isFixedParallax);

	if (isFixedParallax && window.isOpera) el.style.transform = 'unset';

	if (isDynamicParallax && !window.isMobile) {
		var coverHeight = t_cover__getHeightWithoutPadding(el);
		if (coverHeight < window.innerHeight) {
			var heightPadding = window.innerHeight * 0.2;
			el.style.height = (coverHeight + heightPadding) + 'px';
		}
		t_cover__parallax(el, .2, true);
	}

	if (isbgBase64 && coverParams['cover-bg'] && !isContainsVideo) {
		var bgIsLoaded = false;
		var img = document.createElement('img');
		img.src = coverParams['cover-bg'];
		img.onload = function () {
			if (img.parentElement) img.parentElement.removeChild(img);
			el.style.backgroundImage = 'url("' + coverParams['cover-bg'] + '")';
			el.style.opacity = '1';
			bgIsLoaded = true;
		};
		if (!bgIsLoaded) {
			el.style.backgroundImage = '';
			el.style.opacity = '0';
			el.style.transition = 'opacity 25ms';
		}
	}
}

/**
 * set for created video (if it existed) params from data-attributes
 *
 * @param {HTMLElement} el
 * @param {Object} coverParams
 * @param {Boolean} isContainsVideo
 * @param {Boolean} isFixedParallax
 */
function t_cover__setCoverVideoParams(el, coverParams, isContainsVideo, isFixedParallax) {
	var hasYouTubeVideo = Boolean(coverParams['video-url-youtube']);
	if (window.isMobile || !isContainsVideo) return;
	var coverTimer = 0;

	// set preferences for YouTube video
	if (hasYouTubeVideo) {
		t_cover__setStylesForCoverVideo(el, 'youtube');
		window.addEventListener('scroll', function () {
			coverTimer = triggerCoverBgForYoutube(coverTimer, el, coverParams['cover-height']);
		});
		coverTimer = triggerCoverBgForYoutube(coverTimer, el, coverParams['cover-height']);

	} else { // set preferences for other videos like .mp4 or .webm
		t_cover__setStylesForCoverVideo(el, '');
		el.style.backgroundSize = 'auto';

		var isHeightInVH = coverParams['cover-height'].indexOf('vh') !== -1;
		var isMoreVH = isHeightInVH ? parseInt(coverParams['cover-height'], 100) > 100 : false;
		var isHeightInPX = coverParams['cover-height'].indexOf('px') !== -1;
		var isMoreWinHeight = isHeightInPX ? parseInt(coverParams['cover-height'], 100) > window.innerHeight : false;

		var isHeightMoreVH = false;
		if (isFixedParallax && (isMoreVH || isMoreWinHeight)) {
			el.style.height = '100vh';
			isHeightMoreVH = true;
		}

		window.addEventListener('scroll', function () {
			coverTimer = triggerCoverBgForVideo(coverTimer, el, coverParams, isHeightMoreVH, isFixedParallax);
		});
		coverTimer = triggerCoverBgForVideo(coverTimer, el, coverParams, isHeightMoreVH, isFixedParallax);
	}
}

/**
 * set styles before video has been loaded
 *
 * @param {HTMLElement} el - video wrapper
 * @param {string} type - YouTube- or HTML5-video
 */
function t_cover__setStylesForCoverVideo(el, type) {
	el.style.backgroundColor = '#000000';
	el.style.backgroundImage = type === 'youtube' ? '' : 'url("https://tilda.ws/img/spinner-white.gif")';
	el.setAttribute('data-content-cover-bg', '');
}

/**
 * find arrow and set listener scroll to the next section
 *
 * @param {string} id
 */
function setListenerToArrow(id) {
	var rec = document.getElementById('rec' + id);
	if (!rec) return;
	var coverArrow = rec.querySelector('.t-cover__arrow-wrapper');
	if (!coverArrow) return;

	coverArrow.addEventListener('click', function () {
		var recHeight = rec.offsetHeight;
		if (!recHeight) return;
		var recBottomPos = rec.offsetHeight + rec.getBoundingClientRect().top + window.pageYOffset;
		t_cover__scrollToNextSection(recBottomPos, recHeight, 300);
	});
}

function findAndInitCovers() {
	var records = document.querySelector('.t-records');
	var isEditedMode = records ? records.getAttribute('data-tilda-mode') === 'edit' : false;
	if (isEditedMode) return;
	var covers = document.querySelectorAll('.t-cover__carrier');
	Array.prototype.forEach.call(covers, function (cover) {
		var id = cover.getAttribute('data-content-cover-id');
		if (id) cover_init(id);
	});
}

t_onReady(findAndInitCovers);

/**
 * create cover for YouTube, when user will scroll to the current video
 *
 * @param {number} coverTimer - cover time
 * @param {HTMLElement} el - current element
 * @param {string} height - height of el
 * @returns {number} - changer coverTime
 */
function triggerCoverBgForYoutube(coverTimer, el, height) {
	if (coverTimer) window.clearTimeout(coverTimer);

	coverTimer = window.setTimeout(function () {
		var isVideoProcessed = el.querySelector('iframe');
		if (!isVideoProcessed) {
			var windowScrollTop = window.pageYOffset;
			var windowHeight = window.innerHeight;
			var elHeight = t_cover__getHeightWithoutPadding(el);
			var elTopPos = el.getBoundingClientRect().top + windowScrollTop;
			var elBottomPos = elTopPos + elHeight;
			var windowBottomPos = windowScrollTop + windowHeight;
			var padding = 500;

			if (windowBottomPos > elTopPos - padding && elBottomPos + padding >= windowScrollTop) {
				t_onFuncLoad('processYoutubeVideo', function () {
					window.processYoutubeVideo(el, height);
				});
			}
		}
	}, 100);
	return coverTimer;
}

/**
 * create cover for HTML5 video when user will scroll to the current video
 *
 * @param {number} coverTimer - cover time
 * @param {HTMLElement} el - current element
 * @param {object} coverParams - current params for cover
 * @param {Boolean} isHeightMoreVH - boolean value of height the largest then viewport height
 * @param {Boolean} isFixedParallax - parallax fixed
 * @returns {number} - changer coverTime
 */
function triggerCoverBgForVideo(coverTimer, el, coverParams, isHeightMoreVH, isFixedParallax) {
	var currentElementParent = el.parentElement;
	var hasLoop = !(coverParams['video-noloop']);
	var isMuted = !(coverParams['video-nomute']);
	if (coverTimer) clearTimeout(coverTimer);
	var isVideoNotReady = !(el.querySelector('video'));
	if (isVideoNotReady) {
		coverTimer = setTimeout(function () {
			var windowScrollTop = window.pageYOffset;
			var windowHeight = window.innerHeight;
			var elHeight = t_cover__getHeightWithoutPadding(el);
			var elTopPos = el.getBoundingClientRect().top + windowScrollTop;
			var elBottomPos = elHeight + elTopPos;
			var windowBottom = windowScrollTop + windowHeight;
			var padding = 500;
			if (windowBottom > elTopPos - padding && windowScrollTop <= elBottomPos + padding) {
				t_onFuncLoad('t_videoprocessor__processHTML5Video', function () {
					t_videoprocessor__processHTML5Video(el, {
						mp4: coverParams['video-url-mp4'],
						ogv: '',
						webm: coverParams['video-url-webm'],
						poster: '',
						autoplay: true,
						loop: hasLoop,
						scale: true,
						position: 'absolute',
						opacity: 1,
						textReplacement: false,
						zIndex: 0,
						width: '100%',
						height: 0,
						volume: 1,
						muted: isMuted,
						fullscreen: false,
						imgFallback: true,
					});
				});
			}
		}, 100);
	}

	if (isFixedParallax && isHeightMoreVH) {
		var windowScrollTop = window.pageYOffset;
		var windowHeight = window.innerHeight;
		var parentHeight = t_cover__getHeightWithoutPadding(currentElementParent);
		var parentTopPos = currentElementParent.getBoundingClientRect().top + windowScrollTop;
		var parentBottomPos = parentTopPos + parentHeight;

		if (windowScrollTop >= parentBottomPos - windowHeight) {
			el.style.position = 'absolute';
			el.style.bottom = '0px';
			el.style.top = 'auto';
		} else if (windowScrollTop >= parentTopPos) {
			el.style.position = 'fixed';
			el.style.top = '0px';
		} else if (windowScrollTop < parentTopPos) {
			el.style.position = 'relative';
			el.style.top = 'auto';
		}
	}

	return coverTimer;
}

/**
 * this function responsible for recalculating the height of the cover,
 * if the content inside the cover has a highter height then set
 *
 * @param {string} id - of inited record
 * @param {boolean} isOrientationChange - if orientation change - true
 */
function t_cover__recalcCoverHeight(id, isOrientationChange) {
	var rec = document.getElementById('rec' + id);
	var cover = rec ? rec.querySelector('.t-cover') : null;
	var coverCarrier = rec.querySelector('.t-cover__carrier');
	var isMainPageCover = rec ? rec.getAttribute('data-record-type') === '935' : false;
	var coverSetByUserHeight = coverCarrier ? coverCarrier.getAttribute('data-content-cover-height') : '';
	var isFixedBgEarly = rec.getAttribute('data-fixed-bg') === 'y';

	if (!cover || isMainPageCover) return;

	var heightSetByUser = t_cover__getHeightFromAttr(coverSetByUserHeight);
	var calculatedHeight = t_cover__getHeightWithoutPadding(cover);
	var coverHeight = heightSetByUser || calculatedHeight;
	var cashedCoverHeight = 0;
	if (!isFixedBgEarly) {
		// if it is not cover with fixed parallax, calculate pure cover height without appended height after previous calculation
		cashedCoverHeight = cover ? cover.style.height : '';
		cover.style.height = '';
		coverHeight = calculatedHeight;
		cover.style.height = cashedCoverHeight;
	}

	var content = rec.querySelector('div[data-hook-content]');
	var contentHeight = t_cover__getHeightWithoutPadding(content);
	var coverPadding = 40;
	var minCheckedContentHeight = 300;
	var isCoverFullVH = coverCarrier ? coverCarrier.getAttribute('data-content-cover-height') === '100vh' : false;

	// if content highter then cover height; if cover has fixed bg if Safari, if cashed cover height not equal calculated cover
	// height
	if ((contentHeight > minCheckedContentHeight && coverHeight < contentHeight + coverPadding) || isFixedBgEarly || coverHeight !==
		cashedCoverHeight) {
		t_cover__setRecalculatedHeight(rec, contentHeight);
		cover_updateResizeElem(rec);
	} else if ((window.isMobile || 'ontouchend' in document) && isOrientationChange) {
		t_cover__setRecalculatedHeight(rec, contentHeight);
		cover_updateResizeElem(rec);
	} else if (window.isMobile && isCoverFullVH) {
		var selectorsList = ['.t-cover', '.t-cover__filter', '.t-cover__carrier', '.t-cover__wrapper'];
		selectorsList.forEach(function (selector) {
			var element = rec.querySelector(selector);
			if (element) element.style.height = document.documentElement.offsetHeight + 'px';
		});
	}
}

/**
 * get height from data-attribute
 *
 * @param {string} height
 * @return {number} - calculated height
 */
function t_cover__getHeightFromAttr(height) {
	if (!height) return 0;
	if (height.indexOf('vh') !== -1) {
		return parseInt(height, 10) * document.documentElement.clientHeight / 100;
	} else {
		return parseInt(height, 10);
	}
}

/**
 * update cover height
 *
 * @param {HTMLElement} rec - current record
 * @param {number} contentHeight - height of content without padding
 */
function t_cover__setRecalculatedHeight(rec, contentHeight) {
	var coverCarrier = rec.querySelector('.t-cover__carrier');
	var coverCarrierHeight = coverCarrier ? coverCarrier.getAttribute('data-content-cover-height') : '0';
	var setByUserHeight = t_cover__getHeightFromAttr(coverCarrierHeight);
	var isDynamicParallax = coverCarrier ? coverCarrier.getAttribute('data-content-cover-parallax') === 'dynamic' : '';

	var contentHeightPadding = window.innerWidth <= 568 ? 40 : 120;
	var contentHeightExtraPadding = window.innerWidth <= 568 ? 50 : 100;

	contentHeight += contentHeightPadding;
	if (contentHeight > 1000) contentHeight += contentHeightExtraPadding;

	var finishHeight = contentHeight > setByUserHeight ? contentHeight : setByUserHeight;

	var selectorsList = ['.t-cover', '.t-cover__filter', '.t-cover__carrier', '.t-cover__wrapper', '.t-cover__container'];
	selectorsList.forEach(function (selector) {
		var element = rec.querySelector(selector);
		if (isDynamicParallax && element && element.classList.contains('t-cover__carrier') && finishHeight <
			document.documentElement.clientHeight) {
			var heightPadding = document.documentElement.clientHeight * 0.2;
			element.style.height = (finishHeight + heightPadding) + 'px';
		} else if (element) {
			element.style.height = finishHeight + 'px';
		}
	});
	coverCarrier.setAttribute('data-content-cover-updated-height', finishHeight + 'px');
}

/**
 * @param {HTMLElement} rec - element which can be contains element .t-cover__carrier
 */
function cover_updateResizeElem(rec) {
	var allRec = document.getElementById('allrecords');
	var isLazy = allRec ? allRec.getAttribute('data-tilda-lazy') === 'yes' : false;
	if (!isLazy) return;
	var cover = rec.querySelector('.t-cover__carrier');
	t_onFuncLoad('t_lazyload_updateResize_elem', function () {
		t_lazyload_updateResize_elem(cover);
	});
}

/**
 * check is need fixed for background in case if used fixed parallax (only for Safari)
 *
 * @param {string} id - of inited record
 * @returns {boolean} - in case
 */
function cover_checkIsFixForBackgroundNeeded(id) {
	var rec = document.getElementById('rec' + id);
	var coverCarrier = rec ? rec.querySelector('.t-cover__carrier') : null;
	if (!coverCarrier) return false;

	var isFixedEarly = rec.getAttribute('data-fixed-bg') === 'y';

	var videoFormats = ['mp4', 'webm', 'youtube'];
	videoFormats = videoFormats.map(function (videoFormat) {
		return coverCarrier.getAttribute('data-content-video-url-' + videoFormat);
	});

	var isFixedParallax = coverCarrier.getAttribute('data-content-cover-parallax') === 'fixed';

	var isContainsVideo = videoFormats.some(function (url) {
		return url;
	});

	// fix for new versions of Chrome, 
	// where transform cannot work with css property background-attachment: fixed
	var isChrome = window.chrome && !window.opr && window.navigator.userAgent.indexOf('Edg') === -1;
	var coverCarrierTransform = window.getComputedStyle(coverCarrier).transform;
	if (isChrome && coverCarrierTransform === 'matrix(1, 0, 0, 1, 0, 0)') {
		coverCarrier.style.transform = 'initial';
	}

	var isMobile = window.isMobile || 'ontouchend' in document;

	return isFixedParallax && window.isSafari && !isMobile && !isContainsVideo && !isFixedEarly;
}

/**
 * mode for fixed background position
 *
 * @param {string} id - of inited record
 */
function cover_fixBackgroundFixedNode(id) {
	var isNeedFixForFixedParallax = cover_checkIsFixForBackgroundNeeded(id);
	var rec = document.getElementById('rec' + id);
	if (!isNeedFixForFixedParallax || !rec) return;
	var recordType = rec.getAttribute('data-record-type');
	var cover = rec.querySelector('.t-cover');
	var coverParent = cover ? cover.parentElement : null;

	if (!document.getElementById('fixed-bg-cover')) {
		var style = document.createElement('style');
		style.id = 'fixed-bg-cover';
		style.textContent = '.t-cover__container {position: relative;}.t-cover__container .t-cover {clip: rect(0, auto, auto, 0);position: absolute;top: 0;left: 0;width: 100%;height: 100% !important;}.t-cover__container .t-cover .t-cover__carrier {position: fixed;display: block;top: 0;left: 0;width: 100%;height: 100%!important;background-size: cover;background-position: center center;transform: translateZ(0);will-change: transform;}';
		document.head.insertAdjacentElement('beforeend', style);
	}

	var newWrapper = document.createElement('div');
	newWrapper.classList.add('t-cover__container');
	coverParent.insertAdjacentElement('afterbegin', newWrapper);

	newWrapper.style.height = t_cover__getHeightWithoutPadding(cover) + 'px';
	newWrapper.appendChild(cover);

	// specific covers fixes - with video popup and avatar section
	var specificCovers = {
		'275': '.t256__video-container',
		'286': '.t266__video-container',
		'337': '.t-container',
		'906': '.t906__video-container',
	};

	var classContainer = specificCovers[recordType];
	var container = classContainer ? rec.querySelector(classContainer) : null;
	if (container) newWrapper.appendChild(container);
}

/**
 * set mode for fixed bg
 *
 * @param {string} id - of inited record
 * @returns {void}
 */
function cover_fixBackgroundFixedStyles(id) {
	var rec = document.getElementById('rec' + id);
	var isNeedFixForBackground = cover_checkIsFixForBackgroundNeeded(id);
	var cover = rec ? rec.querySelector('.t-cover') : null;
	var coverContainer = rec ? rec.querySelector('.t-cover__container') : null;
	if (!isNeedFixForBackground || !coverContainer || !cover) return;

	var coverHeight = cover.style.height; //cashed cover height
	cover.style.height = 0;
	coverContainer.style.height = coverHeight + 'px';

	rec.setAttribute('data-fixed-bg', 'y');
}

/**
 * get height of element without padding
 *
 * @param {HTMLElement} el - current element
 * @returns {number} - height of el
 */
function t_cover__getHeightWithoutPadding(el) {
	if (!el) return 0;
	var elPaddingTop = parseInt(el.style.paddingTop) || 0;
	var elPaddingBottom = parseInt(el.style.paddingBottom) || 0;
	if (el.clientHeight) {
		return el.clientHeight - (elPaddingTop + elPaddingBottom);
	} else {
		return parseInt(window.getComputedStyle(el).height, 10);
	}
}

/**
 * return number of element height with it margin
 * @param {HTMLElement} el - current element
 * @return {number} - height
 */
function t_cover__getHeightWithMargin(el) {
	if (!el) return 0;
	var elHeight = el.offsetHeight;
	var elMarginTop = parseInt(el.style.marginTop) || 0;
	var elMarginBottom = parseInt(el.style.marginBottom) || 0;
	return elHeight + elMarginTop + elMarginBottom;
}

/**
 * smooth animation scroll
 *
 * @param {number} to - offset top finally position
 * @param {number} duration - duration of animation
 * @param {number} recHeight - record height
 * @returns {void} - if current position equals finally position
 */
function t_cover__scrollToNextSection(to, recHeight, duration) {
	if (duration <= 0) duration = 300;
	var currentPos = window.pageYOffset;
	var difference = to - currentPos;
	var step = 0;
	var scrollHeight = Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.body.clientHeight, document.documentElement.clientHeight,
	);

	var timerID = setInterval(function () {
		step += Math.floor(difference / 15);
		window.scrollTo(0, currentPos + step);
		document.body.setAttribute('data-scrollable', 'true');
		if (window.pageYOffset >= to || scrollHeight <= currentPos + recHeight + step) {
			window.scrollTo(0, to);
			document.body.removeAttribute('data-scrollable');
			clearInterval(timerID);
			timerID = 0;
		}
	}, duration / 15);

	setTimeout(function () {
		if (timerID) {
			if (document.body.getAttribute('data-scrollable') === 'true') {
				document.body.removeAttribute('data-scrollable');
			}
			clearInterval(timerID);
		}
	}, duration * 2);
}