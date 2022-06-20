/**
 * Only for Zero Block. All settings from animation -> parallax / fixing.
 * In parallax can be set trigger by scroll or mousemoving, in fixing can be set trigger zone:
 * on top/middle or bottom of window view
 */

// check browsers that don't support css zoom param and use autoscale
window.t_animationExt__isOnlyScalable = Boolean(navigator.userAgent.search('Firefox') !== -1 ||
	Boolean((window.opr && window.opr.addons) || window.opera || navigator.userAgent.indexOf(' OPR/') !== -1));

window.t_animationExt__isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
	'ontouchend' in document);

t_onReady(t_animationExt__init);

/**
 * init animation
 *
 * @returns {void} - if mode is edited
 */
function t_animationExt__init() {
	var record = document.querySelector('.t-records');
	var isEditMode = record ? record.getAttribute('data-tilda-mode') === 'edit' : false;
	if (/Bot/i.test(navigator.userAgent) || t_animateParallax__checkOldIE() || isEditMode) return;

	t_animationExt__wrapFixEls();
	t_animationExt__wrapParallaxEls();

	t_animationExt__isZeroBlocksRender(function () {
		t_animateParallax__initScroll(); //append to scroll parallax elements topOffset and bottomOffset keys
		t_animateParallax__initMouse(); //append to mouse parallax elements pathX, pathY and animEl keys
		var fixedElements = t_animationExt__getElsByBreakpoints('fix', []);
		var mouseElements = t_animationExt__getElsByBreakpoints('prx', ['mouse']);

		// append to mouse parallax elements such params: topOffset, bottomOffset, parentTopOffset, parentBottomOffset
		// and to fixed elements: topOffset, triggerOffset, trigger, distance, end, fixedWrapperEl
		t_animationExt__createResizeObserver(fixedElements, mouseElements);
		t_animateFix__init(fixedElements);
	});
}

/**
 * init animation after zeroblock is rendered
 *
 * @param {Function} cb
 */
function t_animationExt__isZeroBlocksRender(cb) {
	var firstAtrboard = document.querySelector('.t396__artboard');
	if (firstAtrboard) {
		var timerID = setInterval(function () {
			if (firstAtrboard.classList.contains('rendered')) {
				cb();
				clearTimeout(timerID);
			}
		}, 30);
	}
}

/**
 *
 * @param {HTMLElement[]} fixedElements
 * @param {HTMLElement[]} mouseElements
 */
function t_animationExt__createResizeObserver(fixedElements, mouseElements) {
	if (!mouseElements.length && !fixedElements.length) return;
	var getClientRects = document.body.getClientRects();
	if (!getClientRects.length || !('ResizeObserver' in window)) return;
	var initHeight = getClientRects[0].height;
	var animateParallaxResizeObserver = new ResizeObserver(function (entries) {
		for (var i = 0; i < entries.length; i++) {
			if (entries[i].contentRect.height !== initHeight) {
				initHeight = getClientRects[0].height;
				mouseElements.forEach(function (mouseEl) {
					t_animateParallax__cashOffsets(mouseEl);
				});
				t_animateFix__cashElsInfo(fixedElements);
			}
		}
	});
	animateParallaxResizeObserver.observe(document.body);
}

/**
 * This function create wrapper for fixed animation elements to prevent mixed styles of element and animation,
 * remove parallax atributes, if them exists, to prevent double wrapping in t_animateParallax__wrapEls
 * update and set new animation data-attributes
 */
function t_animationExt__wrapFixEls() {
	var animatedElements = t_animationExt__getElsByBreakpoints('fix', []);
	var breakpoints = [1200, 960, 640, 480, 320];
	animatedElements.forEach(function (animatedEl) {
		var isElHasParallaxAnimation = t_animationExt__getAttrByRes(animatedEl, 'prx', 0);
		if (isElHasParallaxAnimation) {
			breakpoints.forEach(function (breakpoint, i) {
				var attributeName = i === 0 ? 'data-animate-prx' : 'data-animate-prx-res-' + breakpoint;
				animatedEl.removeAttribute(attributeName);
			});
		}
		var atom = animatedEl.querySelector('.tn-atom');
		var scaleWrapper = atom.closest('.tn-atom__scale-wrapper');
		t_animationExt__wrapEl(atom, 'tn-atom__sticky-wrapper', scaleWrapper);

		// if elem has appearance animation, we need to move it to fixed wrapper,
		// because position:fixed doesn't work inside element with transform
		var currentFixedWrapper = animatedEl.querySelector('.tn-atom__sticky-wrapper');
		if (!animatedEl.classList.contains('t-animate') || !currentFixedWrapper) return;
		animatedEl.classList.remove('t-animate');
		currentFixedWrapper.classList.add('t-animate');
		var atributes = ['style', 'distance', 'duration', 'scale', 'delay'];
		breakpoints.forEach(function (breakpoint, i) {
			atributes.forEach(function (attr) {
				var attributeValue = t_animationExt__getAttrByRes(animatedEl, attr, breakpoint);
				if (i === 0) {
					currentFixedWrapper.setAttribute('data-animate-' + attr, attributeValue);
					animatedEl.removeAttribute('data-animate-' + attr);
				} else {
					currentFixedWrapper.setAttribute('data-animate-' + attr + '-res-' + breakpoint, attributeValue);
					animatedEl.removeAttribute('data-animate-' + attr + +'-res-' + breakpoint);
				}
			});
		});
	});
}

/**
 * wrap parallax animated elements
 */
function t_animationExt__wrapParallaxEls() {
	var animatedElements = t_animationExt__getElsByBreakpoints('prx', ['scroll', 'mouse']);
	animatedElements.forEach(function (animatedEl) {
		var atom = animatedEl.querySelector('.tn-atom');
		var scaleWrapper = atom.closest('.tn-atom__scale-wrapper, .tn-atom__sbs-anim-wrapper');
		t_animationExt__wrapEl(atom, 'tn-atom__prx-wrapper', scaleWrapper);

		//remove from parent backdrop filter
		var parentElement = atom.closest('.tn-elem');
		var parentBlurValue = window.getComputedStyle(parentElement).backdropFilter;
		if (parentElement && parentBlurValue !== 'none') {
			parentElement.style.backdropFilter = '';
			var wrapper = atom.closest('.tn-atom__prx-wrapper');
			if (wrapper) wrapper.style.backdropFilter = parentBlurValue;
		}
	});
}


/*============= FIXED ANIMATED ELEMENTS ==============*/

/**
 * animate fixed elements
 *
 * @param {(HTMLElement &
 * {
 * topOffset:number,
 * triggerOffset:number,
 * trigger: number,
 * distance:number,
 * end:number,
 * fixedWrapperEl:HTMLElement
 * }
 * )[]} fixedElements - fixed elements
 * @returns {void}
 */
function t_animateFix__init(fixedElements) {
	if (!fixedElements.length) return;

	t_animateFix__cashElsInfo(fixedElements);
	t_animateFix__updatePositions(fixedElements, false);

	var allRecords = document.getElementById('allrecords');
	var isLazyActive = allRecords ? allRecords.getAttribute('data-tilda-lazy') === 'yes' : false;
	if (window.lazy === 'y' || isLazyActive) t_onFuncLoad('t_lazyload_update', t_lazyload_update);

	window.addEventListener('resize', t_throttle(function () {
		t_animateFix__cashElsInfo(fixedElements);
		t_animateFix__updatePositions(fixedElements, true);
	}, 100));

	window.addEventListener('scroll', t_throttle(function () {
		t_animateFix__updatePositions(fixedElements, false);
	}, 30));

	// catch events of window height changes it may be caused by tabs or "show more" button
	var zeroBlocks = document.querySelectorAll('.t396');
	Array.prototype.forEach.call(zeroBlocks, function (zeroBlock) {
		zeroBlock.addEventListener('displayChanged', t_throttle(function () {
			t_animateFix__cashElsInfo(fixedElements);
			t_animateFix__updatePositions(fixedElements, true);
		}, 30));
	});
}

/**
 *
 * @param {(HTMLElement &
 * {
 * topOffset:number,
 * triggerOffset:number,
 * trigger: number,
 * distance:number,
 * end:number,
 * fixedWrapperEl:HTMLElement
 * }
 * )[]} fixedEls - fixed elements
 * @param {boolean} isPageResized - boolean value of resizing page
 * @returns {void}
 */
function t_animateFix__updatePositions(fixedEls, isPageResized) {
	var scrollTop = window.pageYOffset;
	fixedEls.forEach(function (fixedEl) {
		if (fixedEl.distance === 0) {
			// fix if user resize screen which animation is played (and element still has position fixed)
			if (isPageResized) {
				fixedEl.fixedWrapperEl.style.position = '';
				fixedEl.fixedWrapperEl.style.top = '';
				fixedEl.fixedWrapperEl.classList.remove('t-sticky_going');
				fixedEl.fixedWrapperEl.classList.remove('t-sticky_ended');
			}
			return;
		}
		var zoomValue = t_animationExt__getZoom(fixedEl);
		var triggerPosition = scrollTop + (fixedEl.triggerOffset * zoomValue);

		// set difference between parent and scaled element offsets for Firefox/Opera that uses autoscale
		var scaledWrapper = fixedEl.querySelector('.tn-atom__scale-wrapper');
		if (window.t_animationExt__isOnlyScalable && scaledWrapper &&
			fixedEl.fixedWrapperEl && fixedEl.fixedWrapperEl.style.position !== 'fixed') {
			var elTopPos = fixedEl.getBoundingClientRect().top;
			var scaleTopPos = scaledWrapper.getBoundingClientRect().top;
			var difference = elTopPos - scaleTopPos;
			fixedEl.setAttribute('data-scaled-diff', difference.toString());
		}

		// update trigger position for Firefox/Opera that uses autoscale
		var diff = 0;
		if (window.t_animationExt__isOnlyScalable && scaledWrapper) {
			diff = fixedEl.getAttribute('data-scaled-diff') || '0';
			diff = parseInt(diff, 10);
			triggerPosition = scrollTop + fixedEl.triggerOffset + diff;
		}

		var isAfterStart = triggerPosition >= fixedEl.topOffset;
		var isBeforeStart = triggerPosition < fixedEl.topOffset;
		var isBeforeEnd = fixedEl.end > triggerPosition;
		var isAfterEnd = fixedEl.end <= triggerPosition;
		var isAnimationActivated = fixedEl.fixedWrapperEl ? fixedEl.fixedWrapperEl.classList.contains('t-sticky_going') : false;
		var isAnimationEnded = fixedEl.fixedWrapperEl ? fixedEl.fixedWrapperEl.classList.contains('t-sticky_ended') : false;

		if (isAfterStart && isBeforeEnd && (!isAnimationActivated || isPageResized) || isBeforeEnd && isAnimationEnded) {
			fixedEl.style.transform = '';
			fixedEl.fixedWrapperEl.style.position = 'fixed';
			fixedEl.fixedWrapperEl.style.top = fixedEl.triggerOffset + diff + 'px';
			fixedEl.fixedWrapperEl.classList.add('t-sticky_going');
			fixedEl.fixedWrapperEl.classList.remove('t-sticky_ended');
		}

		if (isAfterEnd && !isAnimationEnded) {
			var distance = window.t_animationExt__isOnlyScalable ? fixedEl.distance : (fixedEl.distance / zoomValue);
			fixedEl.style.transform = 'translateY(' + distance + 'px)';
			fixedEl.fixedWrapperEl.style.top = '';
			fixedEl.fixedWrapperEl.style.position = '';
			fixedEl.fixedWrapperEl.classList.remove('t-sticky_going');
			fixedEl.fixedWrapperEl.classList.add('t-sticky_ended');
		}

		if (isBeforeStart && isAnimationActivated) {
			fixedEl.fixedWrapperEl.style.top = '';
			fixedEl.fixedWrapperEl.style.position = '';
			fixedEl.fixedWrapperEl.classList.remove('t-sticky_going');
		}
	});
}

/**
 * cash element information
 *
 * @param {(HTMLElement &
 * {
 * topOffset:number,
 * triggerOffset:number,
 * trigger: number,
 * distance:number,
 * end:number,
 * fixedWrapperEl:HTMLElement
 * }
 * )[]} fixedEls - fixed elements
 */
function t_animateFix__cashElsInfo(fixedEls) {
	var winHeight = window.innerHeight;
	fixedEls.forEach(function (fixedEl) {
		var zoomValue = t_animationExt__getZoom(fixedEl);
		var elTopPos = parseInt(fixedEl.style.top, 10);
		if (!window.t_animationExt__isOnlyScalable) elTopPos *= zoomValue;

		// append parents padding top to absolute top position to create trigger point
		var elParent = fixedEl.closest('.r');
		var recTopOffset = elParent ? elParent.getBoundingClientRect().top + window.pageYOffset : 0;
		var elParentPaddingTop = elParent ? parseInt(elParent.style.paddingTop, 10) || 0 : 0;
		recTopOffset += elParentPaddingTop ? elParentPaddingTop : 0;

		fixedEl.topOffset = recTopOffset + elTopPos;
		fixedEl.trigger = parseFloat(t_animationExt__getAttrByRes(fixedEl, 'fix', 0)) || 0;
		fixedEl.distance = parseInt(t_animationExt__getAttrByRes(fixedEl, 'fix-dist', 0), 10) || 0;
		fixedEl.distance *= zoomValue;
		fixedEl.end = fixedEl.topOffset + fixedEl.distance;
		fixedEl.fixedWrapperEl = fixedEl.querySelector('.tn-atom__sticky-wrapper');
		t_animateFix__getElTrigger(fixedEl, winHeight);
	});
}

/**
 * get element trigger
 *
 * @param {(HTMLElement &
 * {
 * topOffset:number,
 * triggerOffset:number,
 * trigger: number,
 * distance:number,
 * end:number,
 * fixedWrapperEl:HTMLElement
 * }
 * )} fixedEl - fixed element
 * @param {number} winHeight - window height
 */
function t_animateFix__getElTrigger(fixedEl, winHeight) {
	var zoomValue = t_animationExt__getZoom(fixedEl);
	fixedEl.triggerOffset = parseInt(t_animationExt__getAttrByRes(fixedEl, 'fix-trgofst', 0), 10) || 0;
	fixedEl.triggerOffset *= zoomValue;
	if (fixedEl.trigger === 0.5 || fixedEl.trigger === 1) {
		var isHalfTrigger = fixedEl.trigger === 0.5;
		var appendedHeight = isHalfTrigger ? winHeight / 2 : winHeight;
		var removedHeight = isHalfTrigger ? t_animationExt__getPureHeight(fixedEl) / 2 : t_animationExt__getPureHeight(fixedEl);
		removedHeight *= zoomValue;
		fixedEl.triggerOffset += appendedHeight;
		fixedEl.triggerOffset -= removedHeight;
		if (fixedEl.triggerOffset > fixedEl.topOffset && fixedEl.triggerOffset <= appendedHeight) {
			fixedEl.triggerOffset = fixedEl.topOffset;
		}
		if (!window.t_animationExt__isOnlyScalable) fixedEl.triggerOffset /= zoomValue;
	}
}


/*============= MOUSEMOVE PARALLAX ==============*/

/**
 * init mouse parallax animation
 *
 * @returns {void}
 */
function t_animateParallax__initMouse() {
	var parallaxMouseElements = t_animationExt__getElsByBreakpoints('prx', ['mouse']);
	if (!parallaxMouseElements.length) return;

	parallaxMouseElements.forEach(function (parallaxMouseEl) {
		parallaxMouseEl.pathX = parseInt(t_animationExt__getAttrByRes(parallaxMouseEl, 'prx-dx', 0), 10) || 0;
		parallaxMouseEl.pathY = parseInt(t_animationExt__getAttrByRes(parallaxMouseEl, 'prx-dy', 0), 10) || 0;
		parallaxMouseEl.animEl = parallaxMouseEl.querySelectorAll('.tn-atom__prx-wrapper');
		t_animateParallax__cashOffsets(parallaxMouseEl);

		// cash offsets for images with lazyload, which are loaded later
		var isImageType = parallaxMouseEl.getAttribute('data-elem-type') === 'image';
		if (isImageType) t_animateParallax__cashOffsets__OnImgLoad(parallaxMouseEl);
		t_animateParallax__moveEl(parallaxMouseEl);
	});

	window.addEventListener('resize', t_throttle(function () {
		parallaxMouseElements.forEach(function (parallaxMouseEl) {
			t_animateParallax__cashOffsets(parallaxMouseEl);
		});
	}, 50));
}

/**
 * save offset of parallax mouse element
 *
 * @param {HTMLElement &
 * {
 * topOffset: number,
 * bottomOffset:number,
 * pathX: number,
 * pathY:number,
 * animEl:NodeList,
 * parentTopOffset: number,
 * parentBottomOffset:number
 * }
 * } parallaxMouseEl - current element
 */
function t_animateParallax__cashOffsets(parallaxMouseEl) {
	parallaxMouseEl.topOffset = parallaxMouseEl.getBoundingClientRect().top + window.pageYOffset;
	var elHeight = t_animationExt__getPureHeight(parallaxMouseEl);
	parallaxMouseEl.bottomOffset = parallaxMouseEl.topOffset + elHeight;
	// cash parent offset, if element is larger
	var parent = parallaxMouseEl.closest('.r');
	var parentOffsetTop = parent ? parent.getBoundingClientRect().top + window.pageYOffset : 0;
	var parentHeight = parent ? t_animationExt__getPureHeight(parent) : 0;
	var parentOffsetBottom = parentOffsetTop + parentHeight;
	if (parentOffsetTop > parallaxMouseEl.topOffset) {
		parallaxMouseEl.parentTopOffset = parentOffsetTop;
	}
	if (parentOffsetBottom < parallaxMouseEl.bottomOffset) {
		parallaxMouseEl.parentBottomOffset = parentOffsetBottom;
	}
}

/**
 * save offset of img inside parallax mouse element.
 * we need to catch load event for images, if lazyload is active
 *
 * @param {HTMLElement} el - current element
 */
function t_animateParallax__cashOffsets__OnImgLoad(el) {
	if (!window.lazy) return;
	var image = el.querySelector('img');
	if (image) image.addEventListener('load', function () {
		t_animateParallax__cashOffsets(el);
	});
}

/**
 * move element by mousemoving for parallax mouse elements
 *
 * @param {HTMLElement &
 * {
 * topOffset: number,
 * bottomOffset:number,
 * pathX: number,
 * pathY:number,
 * animEl:NodeList,
 * parentTopOffset: number,
 * parentBottomOffset:number
 * }
 * } parallaxMouseEl - current element
 */
function t_animateParallax__moveEl(parallaxMouseEl) {
	var winHeight = window.innerHeight;
	var winWidth = window.innerWidth;
	var pathX = parallaxMouseEl.pathX;
	var pathY = parallaxMouseEl.pathY;
	var moveX = 0;
	var moveY = 0;
	var frameMoveX = 0;
	var frameMoveY = 0;
	var stop = false;

	document.body.addEventListener('mousemove', t_throttle(function (e) {
		var padding = pathX || 0;
		var viewportTopPos = window.pageYOffset;
		var viewportBottomPos = window.pageYOffset + window.innerHeight;
		var isElOutsideViewport = viewportBottomPos <= parallaxMouseEl.topOffset - padding
			|| parallaxMouseEl.bottomOffset + padding <= viewportTopPos;
		if (isElOutsideViewport) return;
		if (typeof e == 'undefined' || window.innerWidth < 1200) return;
		var topActiveArea = e.pageY - e.clientY - 100;
		var bottomActiveArea = e.pageY + winHeight + 100;

		if (window.innerWidth < 1400 &&
			(parallaxMouseEl.bottomOffset < topActiveArea || parallaxMouseEl.topOffset > bottomActiveArea)) return;
		if (parallaxMouseEl.parentTopOffset > e.pageY || parallaxMouseEl.parentBottomOffset < e.pageY) return;

		// for large background image, which is larger than record (".r") height
		if (typeof pathX === 'number') {
			var winHalfX = winWidth / 2;
			var mouseCenterOffsetX = winHalfX - e.clientX;
			var moveIntensityX = mouseCenterOffsetX / winHalfX;
			moveX = Math.round(pathX * moveIntensityX);
		}
		if (typeof pathY === 'number') {
			var winHalfY = winHeight / 2;
			var mouseCenterOffsetY = winHalfY - e.clientY;
			var moveIntensityY = mouseCenterOffsetY / winHalfY;
			moveY = Math.round(pathY * moveIntensityY);
		}

		stop = false;
		t_animateParallax__moveEl__drawFrame();
	}, 50));

	function t_animateParallax__moveEl__drawFrame() {
		if (stop) return;
		requestAnimationFrame(t_animateParallax__moveEl__drawFrame);

		if (moveX) frameMoveX += (moveX - frameMoveX) * 0.02;
		if (moveY) frameMoveY += (moveY - frameMoveY) * 0.02;

		if (Math.abs(frameMoveX - moveX) < 1 && Math.abs(frameMoveY - moveY) < 1) {
			stop = true;
			return;
		}

		if (parallaxMouseEl && parallaxMouseEl.animEl.length) {
			Array.prototype.forEach.call(parallaxMouseEl.animEl, function (animatedEl) {
				animatedEl.style.transform = 'translate3d(' + frameMoveX + 'px, ' + frameMoveY + 'px, 0px)';
			});
		}
	}
}


/*============= SCROLL PARALLAX ==============*/
/**
 * init scroll for parallax animated elements
 *
 * @returns {void}
 */
function t_animateParallax__initScroll() {
	var parallaxScrollElements = t_animationExt__getElsByBreakpoints('prx', ['scroll']);
	if (!parallaxScrollElements.length) return;

	var hiddenEls = parallaxScrollElements.filter(function (el) {
		return t_animationExt__isElementHidden(el);
	});

	parallaxScrollElements.forEach(function (parallaxScrollEl) {
		if (!t_animationExt__isElementHidden(parallaxScrollEl)) {
			var elSpeed = t_animationExt__getAttrByRes(parallaxScrollEl, 'prx-s', 0);
			var rellaxSpeed = Math.round((parseInt(elSpeed) - 100) / 10);
			var parallaxWrapper = parallaxScrollEl.querySelector('.tn-atom__prx-wrapper');
			if (parallaxWrapper && rellaxSpeed) parallaxWrapper.setAttribute('data-rellax-speed', rellaxSpeed.toString());
		}
	});

	if (parallaxScrollElements.length) {
		t_animationExt__createScrollParallax('[data-rellax-speed]');
	}

	if (!hiddenEls.length) return;

	window.addEventListener('scroll', t_throttle(function () {
		var visibleElements = hiddenEls.filter(function (el, i) {
			if (!t_animationExt__isElementHidden(el)) {
				// remove from hidden elements visible child
				hiddenEls.splice(i, 1);
				// and append this child to visible elements array
				return true;
			}
			return false;
		});
		if (!visibleElements.length) return;
		var lastVisibleEl = visibleElements[visibleElements.length - 1];
		var elSpeed = t_animationExt__getAttrByRes(lastVisibleEl, 'prx-s', 0);
		var curSelector = 'rellax' + Date.now();
		visibleElements.forEach(function (visibleEl) {
			var atomWrapper = visibleEl.querySelector('.tn-atom__prx-wrapper');
			var rellaxSpeed = Math.round((parseInt(elSpeed) - 100) / 10);
			if (atomWrapper) atomWrapper.setAttribute('data-rellax-speed', rellaxSpeed.toString());
			visibleEl.classList.add(curSelector);
		});
		t_animationExt__createScrollParallax('.' + curSelector);
	}, 50));
}

/**
 * find element by selector, get it offsets and create parallax. Update values by resize/orientation change
 *
 * @param {string} selector
 */
function t_animationExt__createScrollParallax(selector) {
	var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
	var scrollParallaxOptions = t_animationExt__getParallaxOffests(elements);

	// update offsets in resize
	if (window.t_animationExt__isMobile) {
		window.addEventListener('orientationchange', function () {
			// wait to get correct viewport height
			setTimeout(function () {
				scrollParallaxOptions = t_animationExt__getParallaxOffests(elements);
				t_animationExt__animateParallaxOnScroll(scrollParallaxOptions);
			}, 300);
		});
	} else {
		window.addEventListener('resize', t_throttle(function () {
			scrollParallaxOptions = t_animationExt__getParallaxOffests(elements);
			t_animationExt__animateParallaxOnScroll(scrollParallaxOptions);
		}, 50));
	}

	window.addEventListener('scroll', function () {
		t_animationExt__animateParallaxOnScroll(scrollParallaxOptions);
	});
}

/**
 * create object with necessary params to create and animate parallax
 *
 * @param {HTMLElement[]} elements
 * @returns {{
 * el: HTMLElement,
 * elHeight: number,
 * elTopPos: number,
 * elBottomPos: number,
 * posY: number,
 * speed: number,
 * isAboveParallax: Boolean
 * }[]}
 */
function t_animationExt__getParallaxOffests(elements) {
	return elements.map(function (scrollParallaxEl) {
		var speedFactor = scrollParallaxEl.getAttribute('data-rellax-speed');
		var posY = window.pageYOffset;
		var scaledDifference = t_animationExt__calcScaledDiff(scrollParallaxEl);
		var blockTopPos = scrollParallaxEl.getBoundingClientRect().top + posY + scaledDifference;
		var blockHeight = scrollParallaxEl.clientHeight;
		var isAboveParallax = posY > blockTopPos;

		// update element top position inside zero-block, that use autoscale
		var zoomValue = t_animationExt__getZoom(scrollParallaxEl);
		if (!window.t_animationExt__isOnlyScalable) blockTopPos *= zoomValue;

		// apparently parallax equation everyone uses
		var percentageY = 0.5;

		var speedPoint = 5;
		var speed = speedFactor ? t_animationExt__getParallaxSpeed(speedFactor, -speedPoint, speedPoint) : 0;
		var positionY = t_animationExt__getParallaxPosition(speed, percentageY);

		return {
			el: scrollParallaxEl,
			elHeight: blockHeight,
			elTopPos: blockTopPos,
			elBottomPos: blockHeight + blockTopPos,
			posY: positionY,
			speed: speed,
			isAboveParallax: isAboveParallax
		};
	});
}

/**
 * create object with necessary params to create and animate parallax
 *
 * @param {{
 * el: HTMLElement,
 * elHeight: number,
 * elTopPos: number,
 * elBottomPos: number,
 * posY: number,
 * speed: number,
 * isAboveParallax: Boolean
 * }[]} scrollParallaxOptions
 */
function t_animationExt__animateParallaxOnScroll(scrollParallaxOptions) {
	var viewportHeight = document.documentElement.clientHeight;
	var viewportTopPos = window.pageYOffset;
	var viewportBottomPos = viewportTopPos + viewportHeight;
	scrollParallaxOptions.forEach(function (opt) {
		var isElementOutsideViewport = opt.elTopPos > viewportBottomPos || opt.elBottomPos < viewportTopPos;
		if (!opt.isAboveParallax && isElementOutsideViewport) return;
		var percentageY = ((viewportBottomPos - opt.elTopPos) / (opt.elHeight + viewportHeight));
		var updatePositionY = t_animationExt__getParallaxPosition(opt.speed, percentageY);
		if (!opt.isAboveParallax) {
			opt.posY = updatePositionY;
			opt.isAboveParallax = true;
		}
		updatePositionY -= opt.posY;
		opt.el.style.transform = 'translateY(' + updatePositionY + 'px)';
	});
}

/**
 * get correct trigger offsets in autoscale mode, in case of use Firefox/Opera
 *
 * @param {HTMLElement} el
 * @returns {number} - difference between top position of parent and scaled children
 */
function t_animationExt__calcScaledDiff(el) {
	var scaledWrapper = el.querySelector('.tn-atom__scale-wrapper');
	if (window.t_animationExt__isOnlyScalable && scaledWrapper && el) {
		var elTopPos = el.getBoundingClientRect().top;
		var scaleTopPos = scaledWrapper.getBoundingClientRect().top;
		var difference = elTopPos - scaleTopPos;
		el.setAttribute('data-scaled-diff', difference.toString());
	}
	var diff = el.getAttribute('data-scaled-diff') || '0';
	return parseInt(diff, 10);
}

function t_animationExt__getParallaxSpeed(value, min, max) {
	return (value <= min) ? min : ((value >= max) ? max : value);
}

function t_animationExt__getParallaxPosition(speed, percentage) {
	return Math.round((speed * (100 * (1 - percentage))));
}


/*============= Support functions ==============*/

/**
 * get height without padding
 *
 * @param {HTMLElement} el - current element
 * @returns {number} - height without padding
 */
function t_animationExt__getPureHeight(el) {
	if (!el) return 0;
	var elHeight = el.clientHeight || el.offsetHeight || parseInt(window.getComputedStyle(el).height, 10);
	var elPaddingTop = el.style.paddingTop || 0;
	var elPaddingBottom = el.style.paddingBottom || 0;
	return elHeight - (elPaddingTop + elPaddingBottom);
}

function t_animationExt__isElementHidden(el) {
	return !el.offsetWidth && !el.offsetHeight && !el.getClientRects().length;
}

/**
 * check old IE versions
 *
 * @returns {boolean} - is old IE version
 */
function t_animateParallax__checkOldIE() {
	var iEIndex = window.navigator.userAgent.indexOf('MSIE');
	if (iEIndex === -1) return false;
	var ieVersion = parseInt(window.navigator.userAgent.substring(iEIndex +
		5, window.navigator.userAgent.indexOf('.', iEIndex)), 10);
	return ieVersion === 8 || ieVersion === 9 || ieVersion === 10;
}

/**
 * @param {HTMLElement} el - current element
 * @returns {number} - zoom value
 */
function t_animationExt__getZoom(el) {
	var artboard = el.closest('.t396__artboard');
	if (artboard && artboard.classList.contains('t396__artboard_scale')) {
		return window.tn_scale_factor;
	}
	return 1;
}

/**
 * get value from attribute, it depends on resolution parameter, element contains mobile animation, or not
 *
 * @param {HTMLElement} el - current element
 * @param {string} attr - animation attribute
 * @param {number} resolution - resolution, in many times use window.innerWidth
 * @returns {string} - attribute value (empty string - if attribute is not defined, or el is not defined
 */
function t_animationExt__getAttrByRes(el, attr, resolution) {
	if (!el) return '';
	if (!resolution) resolution = window.innerWidth;
	var isElHasMobileAnimation = el.getAttribute('data-animate-mobile') === 'y';
	var breakpoints = [1200, 960, 640, 480, 320];
	var foundValue;

	for (var i = 0; i < breakpoints.length; i++) {
		if (i === 0 && resolution >= breakpoints[i]) {
			foundValue = el.getAttribute('data-animate-' + attr);
			break;
		}
		if (!isElHasMobileAnimation) {
			el.style.transition = 'none';
			break;
		}
		if (i > 0 && resolution >= breakpoints[i]) {
			foundValue = el.getAttribute('data-animate-' + attr + '-res-' + breakpoints[i]);
			if (i > 1 && !foundValue) {
				var slicedBreakpoints = breakpoints.slice(1, i);
				for (var n = slicedBreakpoints.length - 1; n >= 0; n--) {
					foundValue = el.getAttribute('data-animate-' + attr + '-res-' + slicedBreakpoints[n]);
					if (foundValue) break;
				}
				if (!foundValue) foundValue = el.getAttribute('data-animate-' + attr);
				break;
			}
		}
	}
	return foundValue ? foundValue : '';
}

/**
 * get elements by data-atributes
 *
 * @param {string} attribute
 * @param {Array} triggers - may be ['scroll', 'mouse']
 * @return {HTMLElement[]} - html element array
 */
function t_animationExt__getElsByBreakpoints(attribute, triggers) {
	var breakpoints = [1200, 960, 640, 480, 320];
	var animatedElements = [];
	breakpoints.forEach(function (breakpoint, i) {
		if (triggers && triggers.length) {
			triggers.forEach(function (trigger) {
				var selector = '[data-animate-' + attribute + '="' + trigger + '"]';
				if (i !== 0) selector = '[data-animate-' + attribute + '-res' + breakpoint + '="' + trigger + '"]';
				var animtedEls = Array.prototype.slice.call(document.querySelectorAll(selector));
				if (animtedEls.length) animatedElements = animatedElements.concat(animtedEls);
			});
		} else {
			var selector = i === 0 ? '[data-animate-' + attribute + ']' : '[data-animate-' + attribute + '-res-' + breakpoint + ']';
			var animtedEls = Array.prototype.slice.call(document.querySelectorAll(selector));
			if (animtedEls.length) animatedElements = animatedElements.concat(animtedEls);
		}
	});
	return animatedElements;
}

/**
 * wrappint atom element to current classname div
 *
 * @param {HTMLElement} el - atom
 * @param {string} className
 * @param {HTMLElement | null} scaleWrapper - for Opera/Firefox, in case of use autoscale
 */
function t_animationExt__wrapEl(el, className, scaleWrapper) {
	var parentElement = el.closest('.tn-elem');
	var div = document.createElement('div');
	div.classList.add(className);
	div.style.display = 'table';
	div.style.width = 'inherit';
	div.style.height = 'inherit';
	scaleWrapper ? div.appendChild(scaleWrapper) : div.appendChild(el);
	parentElement.appendChild(div);
}

/*============= Polyfills ==============*/

// Polyfill: Element.matches
if (!Element.prototype.matches) {
	Element.prototype.matches =
		Element.prototype.matchesSelector ||
		Element.prototype.msMatchesSelector ||
		Element.prototype.mozMatchesSelector ||
		Element.prototype.webkitMatchesSelector ||
		Element.prototype.oMatchesSelector;
}

// Polyfill: Element.closest
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