/**
 * tilda-animation-sbs используется в Зеро-блоках для пошаговой анимации.
 * Здесь передается объект с данными, настроенными пользователем для анимации,
 * генерируется в @keyframes и добавляется в <style>.
 */

/**
 * HTML element with parameters, which gets from data-attributes,
 * placed inside animatedObject in 'elements' key.
 *
 * scaledDifference value need to calculate difference with top position of unscaled parent
 * and top position of scaled element for Firefox/Opera browser with autoscale.
 *
 * 'status' key need to remove from animated list innactive elements.
 *
 * Key 'animType' depend on installed event from editor:
 * for value 'element on screen' - 'intoview'
 * for value 'block on screen' - 'blockintoview'
 * for value 'on scroll' - 'scroll'
 * for value 'on hover' - 'hover'
 * for value 'on click' - 'click'
 *
 *
 * @typedef {HTMLElement & {
 *   animType: 'intoview' | 'blockintoview' | 'scroll' | 'click' | 'hover',
 *   trigger: number,
 *   triggerElems: string,
 *   wrapperEl: HTMLElement,
 *   zIndex: string | undefined,
 *   loop: 'loop' | 'noreverse' | null,
 *   topOffset: number,
 *   parentRecTopPos: number,
 *   triggerOffset: number | undefined,
 *   steps: animatedStepToElement[],
 *   scaledDifference: number | undefined,
 *   uniqueID: string,
 *   status: 'innactive' | 'active' | undefined
 *  }
 * } AnimatedHTML
 */

/**
 * animated object with sbs-anim elements.
 * They placed into key 'elements' as type AnimatedHTML,
 * scrollTop - window.pageYOffset, may be updated
 * needUpdate - if pageYOffset changed, set needUpdate as true
 * isEditMode - to play animation in edit mode, we should check this value
 * Created in t_animationSBS__initAllRes()
 *
 * @typedef {
 *  {
 *    elements: AnimatedHTML[],
 *    scrollTop: number,
 *    needUpdate: Boolean,
 *    isEditMode: Boolean
 *  }
 * } animatedObject
 */

/**
 * objSteps - parsed into object string from data-attribute, which contains
 * steps object with some parameters:
 * ti/di - duration in ms / distance in px
 * mx - axisX movement in px
 * my - axisY movement in px
 * sx - scale axisX - (value from editor / 100)
 * sy - scale axisY - (value from editor / 100)
 * op - opacity - (value from editor / 100)
 * ro - rotate - in deg's
 * fi - fix - '' for none, 'fixed' for fixed
 * bl - blur
 * ea - easing - '' for linear, 'easeOut' for ease out
 * dt/dd - delay (value from editor * 1000) in ms / delay in px
 *
 * One object inside array - one step.
 *
 * Why in some cases provide to element 'ti' key, in other - 'di'?
 * It depends on animation event. Event on scroll uses distance and delay in px,
 * that why to object append keys 'di' and 'dd'. In other cases should be 'ti' and 'dt'.
 * Not all events has value fix: fixed/none, which append to step object key 'fi'.
 *
 * @typedef {
 *  {
 *    di: string | undefined,
 *    ti: string | undefined,
 *    mx: string,
 *    my: string,
 *    sx: string,
 *    sy: string,
 *    op: string,
 *    ro: string,
 *    fi: '' | 'fixed' | undefined,
 *    bl: string,
 *    ea: '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin',
 *    dt: string | undefined,
 *    dd: string | undefined,
 *  }
 * } animationStep
 */

/**
 * styles, created in t_animationSBS__createStepStyles. They value matches steps keys with same value,
 * but in styles this values more readeble: key 'moveX' vs 'mx'.
 *
 * All keys, exept last, use number type (in step it has string).
 *
 * Last key 'fix' return boolean value: true, if step has key 'fi' and it value = 'fixed'.
 *
 * @typedef {
 *  {
 *   moveX: number,
 *   moveY: number,
 *   scaleX: number,
 *   scaleY: number,
 *   opacity: number,
 *   rotate: number,
 *   blur: number,
 *   fix: Boolean
 *  }
 * } stepStyles
 */

/**
 * step for animated HTMLElement. Difference between this step and animationStep is as follows:
 * 1. animationStep - it's parsed object from data-attribute,
 *    animatedStepToElement - object, created in t_animationSBS__cacheAndSetData()
 * 2. animatedStepToElement more readeble then animationStep
 * 3. animatedStepToElement placed inside AnimatedHTML (key-array 'steps')
 *
 * Summary: animatedStepToElement parse as step value with more readeble parameters, then animationStep,
 * and placed inside AnimatedHTML.steps array
 *
 * @typedef {
 *   {
 *    state: 'started' | 'finished' | 'unactive',
 *    styles: stepStyles,
 *    prevUnfixedDist: number,
 *    dist: number,
 *    start: number | undefined,
 *    end: number | undefined,
 *    time: string | undefined,
 *    ease: '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 *   }
 * } animatedStepToElement
 */

/**
 * scroll element state object
 *
 * Summary: animatedStepToElement parse as step value with more readeble parameters, then animationStep,
 * and placed inside AnimatedHTML.steps array
 *
 * @typedef {
 * 		{
 * 			opacity: number,
 * 			blur: number,
 * 			fix: Boolean,
 * 			fixedShiftY: number,
 * 			translateX: number,
 * 			translateY: number,
 * 			scaleX: number,
 * 			scaleY: number,
 * 			rotate: number,
 * 			prevUnfixedDist: number | undefined
 * 		}
 * } scrollElementState
 */

window.t_animationSBS__isOnlyScalable = Boolean(
	navigator.userAgent.search('Firefox') !== -1 ||
		Boolean((window.opr && window.opr.addons) || window.opera || navigator.userAgent.indexOf(' OPR/') !== -1)
);
window.t_animationSBS__isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// start animation, when the contents of its tab have become visible
if (document.visibilityState === 'visible') {
	if (document.readyState !== 'loading') {
		t_animationSBS__init();
	} else {
		document.addEventListener('DOMContentLoaded', t_animationSBS__init);
	}
} else {
	document.addEventListener('visibilitychange', t_animationSBS__checkVisibilityPage);
}

function t_animationSBS__checkVisibilityPage() {
	if (document.visibilityState === 'visible') {
		t_onReady(t_animationSBS__init);
		document.removeEventListener('visibilitychange', t_animationSBS__checkVisibilityPage);
	}
}

/**
 * check terms to create sbs-animation and if the conditions are met, create animation
 */
function t_animationSBS__init() {
	var allRec = document.getElementById('allrecords');
	var isEditMode = allRec ? allRec.getAttribute('data-tilda-mode') === 'edit' : null;
	if (!isEditMode) isEditMode = Boolean(document.getElementById('for_redactor_toolbar'));
	if (/Bot/i.test(navigator.userAgent) || t_animationSBS__checkOldIE() || isEditMode) return;

	// prevent horizontal scroll
	if (document.querySelector('[data-animate-sbs-event="scroll"]')) allRec.style.overflowX = 'hidden';

	// initing animation after zeroblock is render
	t_animationSBS__isZeroBlocksRender(function () {
		t_animationSBS__wrapAndUpdateEls();
		t_animationSBS__initAllRes(isEditMode);
	});
}

/**
 * as our script is async, we should wait, when zeroblock will be rendered.
 * For new sites we can use artBoardRendered custom event, but for old - only setTimeout.
 *
 * @param {Function} callback
 */
function t_animationSBS__isZeroBlocksRender(callback) {
	var firstAtrboard = document.querySelector('.t396__artboard');
	if (!firstAtrboard) return;
	if (firstAtrboard.classList.contains('rendered')) {
		callback();
	} else {
		firstAtrboard.addEventListener('artBoardRendered', callback);
	}
}

/**
 * wrap animated atom elements and set/remove installed styles
 */
function t_animationSBS__wrapAndUpdateEls() {
	var animatedElements = Array.prototype.slice.call(document.querySelectorAll('[data-animate-sbs-event]'));
	animatedElements.forEach(function (animatedEl) {
		var atom = animatedEl.querySelector('.tn-atom');
		if (!atom) return;

		// condition because of bug in Chrome (MAC)
		if (navigator.userAgent.indexOf('Chrome') === -1) {
			atom.style.WebkitBackfaceVisibility = 'hidden';
			atom.style.backfaceVisibility = 'hidden';
		}

		// if element hasn't options (mobile animation disabled)
		// or element already has sbs-wrapper - leave from this function
		var atomWrapper = atom.closest('.tn-atom__sbs-anim-wrapper');
		var isElementHasAnimateOpts = t_animationSBS__getAnimOptions(animatedEl, 'published', null);
		if (atomWrapper || !isElementHasAnimateOpts) return;

		// wrap scaled wrapper, if zeroblock has autoscaled option, and browser is Firefox or Opera
		var scaleWrapper = atom.closest('.tn-atom__scale-wrapper');
		t_animationSBS__wrapEl(scaleWrapper || atom, 'tn-atom__sbs-anim-wrapper');

		// update values after wrapping
		atom = animatedEl.querySelector('.tn-atom');
		atomWrapper = atom.closest('.tn-atom__sbs-anim-wrapper');

		t_animationSBS__updateStylesAfterWrapping(atom, atomWrapper);
	});
}

function t_animationSBS__updateStylesAfterWrapping(atom, wrapper) {
	var parentElem = atom.closest('.t396__elem');

	// add border-radius property for animation wrapper, because we set filters for parentElem
	// getPropertyValue returns border-radius value in px. If it cannot setted, will return '0px'
	var elType = parentElem ? parentElem.getAttribute('data-elem-type') : '';
	var elBorderRadius = window.getComputedStyle(parentElem).getPropertyValue('border-radius');
	if (elType === 'shape' && parseInt(elBorderRadius, 10)) {
		wrapper.style.borderRadius = elBorderRadius;
	}

	// find filters in parent element to set them to wrapper, and remove from current parent
	var filterList = ['filter', 'backdrop-filter'];
	filterList = filterList.map(function (filter) {
		var webkitFilter = '-webkit-' + filter;
		var parentFilterValue = window.getComputedStyle(parentElem).getPropertyValue(filter);
		if (parentFilterValue === 'none' || parentFilterValue === '')
			parentFilterValue = window.getComputedStyle(parentElem).getPropertyValue(webkitFilter);
		if (parentFilterValue !== 'none' && parentFilterValue !== '')
			return {filter: filter, webkitFilter: webkitFilter, value: parentFilterValue};
	});
	filterList = filterList.filter(function (filter) {
		return filter;
	});
	var atomTransformValue = window.getComputedStyle(atom).transform;

	filterList.forEach(function (filterOpts) {
		wrapper.style[filterOpts.webkitFilter] = filterOpts.value;
		wrapper.style[filterOpts.filter] = filterOpts.value;
		parentElem.style[filterOpts.webkitFilter] = 'none';
		parentElem.style[filterOpts.filter] = 'none';
		if (atomTransformValue === 'none') atom.style.transform = 'translateZ(0)';
	});

	t_animationSBS__chromeFixBackdropFilter(atom, wrapper, filterList);
}

function t_animationSBS__chromeFixBackdropFilter(atom, wrapper, filterList) {
	var hasBackdropFilter = filterList.some(function (opt) {
		return opt.filter === 'backdrop-filter';
	});
	if (navigator.userAgent.indexOf('Chrome') === -1 || !hasBackdropFilter) return;
	var atomBG = window.getComputedStyle(atom).getPropertyValue('background-color');
	var atomsOpacity = window.getComputedStyle(atom).getPropertyValue('opacity');
	if (atomBG === 'rgba(0, 0, 0, 0)' || atomsOpacity === '1') return;
	var atomsBackgroundColorRGB = atomBG.substring(atomBG.indexOf('(') + 1, atomBG.indexOf(')'));
	wrapper.style.backgroundColor = 'rgba(' + atomsBackgroundColorRGB + ',' + atomsOpacity + ')';
	atom.style.opacity = '1';
	atom.style.backgroundColor = 'transparent';
}

/**
 * Create animatedObject and set main triggers and steps for sbs-animation.
 *
 * @param {Boolean} isEditMode
 */
function t_animationSBS__initAllRes(isEditMode) {
	var animatedObject = {
		elements: Array.prototype.slice.call(document.querySelectorAll('[data-animate-sbs-event]')),
		scrollTop: window.pageYOffset,
		needUpdate: true,
		isEditMode: isEditMode,
	};

	if (!animatedObject.elements.length) return;

	// update animatedObject.elements, set for them steps with styles
	t_animationSBS__cacheAndSetData(animatedObject);

	// generate keyframes and append them to the head
	t_animationSBS__generateKeyframes(animatedObject);

	// update lazyload
	var allRecords = document.getElementById('allrecords');
	var isLazy = allRecords ? allRecords.getAttribute('data-tilda-lazy') === 'yes' : false;
	if (window.lazy === 'y' || isLazy)
		t_onFuncLoad('t_lazyload_update', function () {
			t_lazyload_update();
		});

	// find all elements, that has animation by such events - element on Screen / block on Screen
	var elOrBlockOnScreenList = animatedObject.elements.filter(function (el) {
		var eventAttribute = 'data-animate-sbs-event';
		return el.getAttribute(eventAttribute) === 'intoview' || el.getAttribute(eventAttribute) === 'blockintoview';
	});

	// update animation on resize, displaychanged or while using Safari and open page with pageYOffset !== 0
	var timerID;

	function animationUpdate() {
		clearTimeout(timerID);
		timerID = setTimeout(function () {
			animatedObject.elements = Array.prototype.slice.call(document.querySelectorAll('[data-animate-sbs-event]'));
			t_animationSBS__cacheAndSetData(animatedObject);
			t_animationSBS__triggerScrollAnim(animatedObject);
			t_animationSBS__updateIntoViewElsState(animatedObject, elOrBlockOnScreenList);
			t_animationSBS__generateKeyframes(animatedObject);
		}, 500);
	}

	if ('ResizeObserver' in window) {
		t_animationSBS__createResizeObserver(function () {
			// in Safari values from @keyframes may be cached,
			// to remove cache should update ID
			if (window.t_animationSBS__isSafari) {
				animatedObject.elements.forEach(function (el) {
					el.wrapperEl.removeAttribute('id');
				});
			}
			animationUpdate();
		});
	} else {
		var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		if (isMobile) {
			window.addEventListener('orientationchange', function () {
				// setTimeout need to wait when viewport will be updated
				setTimeout(function () {
					animationUpdate();
				}, 300);
			});
		} else {
			window.addEventListener('resize', animationUpdate);
		}
	}

	var zeroBlocks = document.querySelectorAll('.t396');
	Array.prototype.forEach.call(zeroBlocks, function (zeroBlock) {
		zeroBlock.addEventListener('displayChanged', animationUpdate);
	});

	// fix for Safari to update animation if user reloading page and pageYOffset !== 0
	if (window.t_animationSBS__isSafari) {
		window.addEventListener('scroll', reinitAnimationAfterPageLoad);

		function reinitAnimationAfterPageLoad() {
			if (window.pageYOffset !== 0) animationUpdate();
			window.removeEventListener('scroll', reinitAnimationAfterPageLoad);
		}
	}

	// all types of animation, exept 'on Scroll'
	t_animationSBS__triggerNoScrollAnimation(animatedObject, elOrBlockOnScreenList);

	// only for 'on Scroll' animation
	var scrollAnimationEl = document.querySelectorAll('[data-animate-sbs-event="scroll"]');
	//TODO анимация по скроллу работает рывками, надо рефакторить
	if (scrollAnimationEl.length) {
		t_animationSBS__triggerScrollAnim(animatedObject);
		t_animationSBS__checkFrame(animatedObject);
	}

	window.addEventListener('load', function () {
		t_animationSBS__changeElValues(animatedObject);
	});

	// if window is not loaded (include DOM complete and all scripts are loaded) too long, update values by setTimeout
	setTimeout(function () {
		t_animationSBS__changeElValues(animatedObject);
	}, 3000);
}

/**
 * create resize observer to update animation, when user open dropdown list, or click
 * 'show more' button in catalog
 *
 * @param {Function} callback
 */
function t_animationSBS__createResizeObserver(callback) {
	var getClientRects = document.body.getClientRects();
	var initHeight = getClientRects[0].height;
	var animateParallaxResizeObserver = new ResizeObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.contentRect.height !== initHeight) {
				initHeight = getClientRects[0].height;
				callback();
			}
		});
	});
	animateParallaxResizeObserver.observe(document.body);
}

/**
 * Update and set triggers.
 * For scroll animation update steps values.
 *
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__changeElValues(animatedObject) {
	animatedObject.elements.forEach(function (element) {
		t_animationSBS__setAndCacheElTopPos(element, animatedObject);
		if (element.animType !== 'scroll') return;
		t_animationSBS__updateStepsValues(element);
	});
}

/**
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__checkFrame(animatedObject) {
	animatedObject.needUpdate = t_animationSBS__checkPosChanges(animatedObject);
	if (animatedObject.needUpdate) t_animationSBS__triggerScrollAnim(animatedObject);
	requestAnimationFrame(function () {
		t_animationSBS__checkFrame(animatedObject);
	});
}

/**
 * @param {animatedObject} animatedObject - options
 * @returns {boolean} - is scrollTop position changed?
 */
function t_animationSBS__checkPosChanges(animatedObject) {
	var oldTop = animatedObject.scrollTop;
	animatedObject.scrollTop = window.pageYOffset;
	return oldTop !== animatedObject.scrollTop;
}

/**
 * trigger 'on Scroll' animation
 *
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__triggerScrollAnim(animatedObject) {
	animatedObject.elements.forEach(function (el) {
		if (el.animType !== 'scroll') return;
		var elState = {
			opacity: 1,
			blur: 0,
			fix: false,
			fixedShiftY: 0,
			translateX: 0,
			translateY: 0,
			scaleX: 1,
			scaleY: 1,
			rotate: 0,
		};

		t_animationSBS__scrollAnimationCheckSteps(animatedObject, el, elState);
		t_animationSBS__scrollAnimationUpdateTransform(el, elState);
	});
}

/**
 * trigger scroll animation - check steps
 *
 * @param {animatedObject} animatedObject - options
 * @param {AnimatedHTML} animatedHTML - current element
 * @param {scrollElementState} elState - state of current element
 */
function t_animationSBS__scrollAnimationCheckSteps(animatedObject, animatedHTML, elState) {
	animatedHTML.steps.forEach(function (step, i) {
		// append to trigger position .scaledDifference value - difference between parent and scaled element in Firefox/Opera
		var trigger = animatedObject.scrollTop + animatedHTML.triggerOffset + (animatedHTML.scaledDifference || 0);
		var isAfterStart = trigger >= step.start;
		var isBeforeStart = trigger < step.start;
		var isAfterEnd = step.end <= trigger;
		var isBeforeEnd = step.end > trigger;

		if (isAfterStart && isBeforeEnd) {
			step.state = 'started';
			if (animatedHTML.wrapperEl) animatedHTML.wrapperEl.style.willChange = 'transform';
			var progress = trigger - step.start;
			var percentage = step.dist === 0 ? 1 : progress / step.dist;
			elState.prevUnfixedDist = step.prevUnfixedDist;
			t_animationSBS__scrollAnimationCalcStepStyles(elState, step, percentage, i);
		}
		if (isAfterEnd) {
			step.state = 'finished';
			if (animatedHTML.wrapperEl) animatedHTML.wrapperEl.style.willChange = '';
			t_animationSBS__scrollAnimationCalcStepStyles(elState, step, 1, i);
		}
		if (isBeforeStart && (step.state === 'started' || step.state === 'finished')) {
			step.state = 'unactive';
			if (animatedHTML.wrapperEl) animatedHTML.wrapperEl.style.willChange = '';
			t_animationSBS__scrollAnimationCalcStepStyles(elState, step, 0, i);
		}
	});

	// workaround for making element transparent on first step
	if (
		animatedHTML.steps[1] &&
		animatedHTML.steps[1].state === 'unactive' &&
		animatedHTML.steps[1].styles.opacity === 0 &&
		animatedHTML.steps[1].dist === 0
	) {
		elState.opacity = 0;
	}
}

/**
 * calculate style for scroll animation
 *
 * @param {scrollElementState} elState - current element state
 * @param {animatedStepToElement} curStep - current step
 * @param {number} percentage - percents
 * @param {number} i - index of current step
 * @returns {void}
 */
function t_animationSBS__scrollAnimationCalcStepStyles(elState, curStep, percentage, i) {
	if (curStep.styles.fix === true && curStep.state === 'started') {
		elState.fix = true;
		elState.fixedShiftY = 0;
	}
	if (curStep.styles.fix === true && curStep.state === 'finished') {
		elState.fix = false;
		elState.fixedShiftY += curStep.dist;
	}
	if (curStep.styles.fix === true && curStep.state === 'unactive') {
		if (i > 0 && elState.fix === true) {
			return;
		}
		elState.fix = false;
	}

	elState.opacity += percentage * (curStep.styles.opacity - elState.opacity);
	elState.blur += percentage * (curStep.styles.blur - elState.blur);
	elState.translateX += percentage * curStep.styles.moveX;
	elState.translateY += percentage * curStep.styles.moveY;
	elState.scaleX += percentage * (curStep.styles.scaleX - elState.scaleX);
	elState.scaleY += percentage * (curStep.styles.scaleY - elState.scaleY);
	elState.rotate += percentage * curStep.styles.rotate;
}

/**
 * change scroll animation element
 *
 * @param {AnimatedHTML} el - current element
 * @param {scrollElementState} elState - element state
 */
function t_animationSBS__scrollAnimationUpdateTransform(el, elState) {
	var zoomValue = t_animationSBS__getZoom(el);
	var elParent = el.closest('.t396__elem');
	var isElHasWillChange = elParent ? window.getComputedStyle(elParent).willChange : '';
	if (window.t_animationSBS__isOnlyScalable) zoomValue = 1 / zoomValue;

	if (elState.fix === true && el.wrapperEl && el.wrapperEl.style.position !== 'fixed') {
		var top = el.triggerOffset - elState.prevUnfixedDist;
		if (!window.t_animationSBS__isOnlyScalable) top /= zoomValue;
		el.wrapperEl.style.top = top + (el.scaledDifference || 0) + 'px';
		el.wrapperEl.style.position = 'fixed';
		if (isElHasWillChange) elParent.style.willChange = 'unset';

		// fix for Safari: move z-index from parent elem to fixed tn-atom__sbs-anim-wrapper,
		// cause Safari doesn't render properly fixed element inside absolute positioned parent with z-index
		if (el.zIndex) el.wrapperEl.style.zIndex = el.zIndex;
	}

	if (elState.fix === false && el.wrapperEl && window.getComputedStyle(el.wrapperEl).position === 'fixed') {
		el.wrapperEl.style.position = '';
		el.wrapperEl.style.top = '';
		el.wrapperEl.style.zIndex = '';
		if (el.zIndex) el.style.zIndex = el.zIndex;
		if (elParent) elParent.style.willChange = '';
	}

	if (el.wrapperEl) el.wrapperEl.style.opacity = elState.opacity.toString();

	var translateValue = '';
	if (elState.translateX) {
		var translateXValue = elState.translateX;
		if (window.t_animationSBS__isOnlyScalable) translateXValue = translateXValue / zoomValue;
		translateValue += 'translateX(' + translateXValue + 'px)';
	}

	if (elState.translateY !== 0 || elState.fixedShiftY !== 0) {
		var translateYValue = elState.translateY + elState.fixedShiftY;
		if (!window.t_animationSBS__isOnlyScalable) translateYValue /= zoomValue;
		translateValue += 'translateY(' + translateYValue + 'px)';
	}
	if (elState.scaleX !== 1 || elState.scaleY !== 1) {
		translateValue += 'scale(' + elState.scaleX + ',' + elState.scaleY + ')';
	}
	if (elState.rotate !== 0) {
		translateValue += 'rotate(' + elState.rotate + 'deg)';
	}

	if (translateValue) {
		if (el.wrapperEl) el.wrapperEl.style.transform = translateValue;
	} else {
		if (el.wrapperEl) el.wrapperEl.style.transform = 'scale(1)';
	}
}

/**
 * generate keyframes and append them to the document head
 *
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__generateKeyframes(animatedObject) {
	var generatedKeyframe = '';
	animatedObject.elements.forEach(function (el) {
		if (el.animType === 'scroll') return;
		var keyframesOpts = {timeDuration: 0};
		var keyframes = [];
		var isOpacityAnimation = el.steps.every(function (step) {
			return (
				step.styles.moveX === 0 &&
				step.styles.moveY === 0 &&
				step.styles.scaleX === 1 &&
				step.styles.scaleY === 1 &&
				step.styles.rotate === 0 &&
				step.styles.blur === 0 &&
				step.styles.fix === false
			);
		});
		t_animationSBS__generateKeyframes__combineObjects(el.steps, keyframes, keyframesOpts, isOpacityAnimation);
		t_animationSBS__generateKeyframes__correctFrames(keyframes);
		t_animationSBS__generateKeyframes__countPercent(keyframes, keyframesOpts);
		t_animationSBS__generateKeyframes__correctOpacityOnFirstStep(el, keyframes);
		var keyframesStr = t_animationSBS__generateKeyframes__getTxtStyles(el, keyframes);
		keyframesOpts.timeDuration /= 1000;
		if (!keyframesStr) return;
		generatedKeyframe += t_animationSBS__generateKeyframes__getFinalCss(el, keyframesOpts, keyframesStr);
		if (!el.loop && (el.animType === 'hover' || el.animType === 'click')) {
			generatedKeyframe += t_animationSBS__generateKeyframes__getReverseAnim(el);
		}
	});

	if (!generatedKeyframe) return;
	if (animatedObject.isEditMode) return generatedKeyframe;
	var generatedSBSKeyframe = document.querySelector('.sbs-anim-keyframes');
	if (!generatedSBSKeyframe) {
		generatedSBSKeyframe = document.createElement('style');
		generatedSBSKeyframe.classList.add('sbs-anim-keyframes');
		generatedSBSKeyframe.textContent = generatedKeyframe;
		document.head.insertAdjacentElement('beforeend', generatedSBSKeyframe);
	} else if (generatedSBSKeyframe.textContent !== generatedKeyframe) {
		generatedSBSKeyframe.textContent = generatedKeyframe;
	}
}

/**
 * combine objects
 *
 * @param { animatedStepToElement[]} steps - steps obj
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }[]} keyframes - keyframes obj array
 * @param {{
 *   timeDuration: number
 * }} keyframesOpts - object with all time duration
 * @param {Boolean} isOpacityAnimation
 */
function t_animationSBS__generateKeyframes__combineObjects(steps, keyframes, keyframesOpts, isOpacityAnimation) {
	steps.forEach(function (step, i) {
		var keyframe = {};
		keyframe.styles = isOpacityAnimation ? {opacity: step.styles.opacity} : step.styles;
		keyframe.time = step.time * 1 || 0;
		if (i !== steps.length - 1) keyframe.ease = steps[i + 1].ease;
		keyframes.push(keyframe);
		keyframesOpts.timeDuration += keyframe.time;
	});
}

/**
 * correct frames
 *
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }[]} keyframes - keyframes obj array
 */
function t_animationSBS__generateKeyframes__correctFrames(keyframes) {
	keyframes.forEach(function (keyframe, i) {
		var isLast = i === keyframes.length - 1;
		var isFirst = i === 0;
		var nextKeyframe = !isLast ? keyframes[i + 1] : null;
		var prevKeyframe = !isFirst ? keyframes[i - 1] : null;

		for (var style in keyframe.styles) {
			if (!isFirst && !(style in prevKeyframe.styles)) {
				t_animationSBS__generateKeyframes__addStyleToKeyframe(keyframe, prevKeyframe, style, 0);
			}
			if (!isLast) {
				if (!(style in nextKeyframe.styles)) {
					t_animationSBS__generateKeyframes__addStyleToKeyframe(keyframe, nextKeyframe, style, 1);
				} else if (style === 'moveX' || style === 'moveY' || style === 'rotate') {
					t_animationSBS__generateKeyframes__recalculateValue(keyframe, nextKeyframe, style);
				}
			}
		}
	});
}

/**
 * add styles to keyframe
 *
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }} keyframe - current keyframe
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }} changingKeyFrame - prev/next keyframe
 * @param {string} style - style
 * @param {0 | 1} state - state - 0 for prev keyframe, 1 - for next keyframe
 */
function t_animationSBS__generateKeyframes__addStyleToKeyframe(keyframe, changingKeyFrame, style, state) {
	if (style === 'blur' || style === 'rotate' || style === 'moveX' || style === 'moveY') {
		changingKeyFrame.styles[style] = state === 0 ? 0 : keyframe.styles[style];
	}
	if (style === 'opacity' || style === 'scaleX' || style === 'scaleY') {
		changingKeyFrame.styles[style] = state === 0 ? 1 : keyframe.styles[style];
	}
}

/**
 * recalculate value
 *
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }} keyframe - current keyframe
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }} nextKeyframe - next keyframe
 * @param {string} style - style
 */
function t_animationSBS__generateKeyframes__recalculateValue(keyframe, nextKeyframe, style) {
	switch (style) {
		case 'rotate':
			nextKeyframe.styles.rotate += keyframe.styles.rotate;
			break;
		case 'moveX':
			nextKeyframe.styles.moveX += keyframe.styles.moveX;
			break;
		case 'moveY':
			nextKeyframe.styles.moveY += keyframe.styles.moveY;
	}
}

/**
 * get percent
 *
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined,
 *   percent: number | undefined
 * }[]} keyframes - keyframes obj array
 * @param {{
 *   timeDuration: number
 * }} keyframesOpts - object with all time duration
 */
function t_animationSBS__generateKeyframes__countPercent(keyframes, keyframesOpts) {
	for (var j = 0; j < keyframes.length; j++) {
		var keyframe = keyframes[j];
		var keyframePercentFloating;
		if (j === 0) {
			// first keyframe
			if (keyframesOpts.timeDuration === 0) {
				keyframe.percent = 0;
			} else {
				keyframePercentFloating = ((100 * keyframe.time) / keyframesOpts.timeDuration).toFixed(2);
				keyframe.percent = parseInt(keyframePercentFloating, 10);
			}
		} else if (j === keyframes.length - 1) {
			// last keyframe
			keyframe.percent = 100;
		} else {
			// keyframes between first and last
			var prevPercent = keyframes[j - 1].percent;
			if (keyframesOpts.timeDuration === 0) {
				keyframe.percent = 0;
			} else {
				keyframePercentFloating = ((100 * keyframe.time) / keyframesOpts.timeDuration + prevPercent).toFixed(2);
				if (parseInt(keyframePercentFloating, 10) === 100 && j === keyframes.length - 2 && j !== 0) {
					continue;
				}
				keyframe.percent = parseInt(keyframePercentFloating, 10);
			}
			if (keyframe.percent === prevPercent) {
				keyframe.percent += 1;
			}
			if (keyframe.percent > 100) {
				keyframe.percent = 99;
			}
		}
	}
}

/**
 * making element transparent on first step
 *
 * @param {AnimatedHTML} el - current element
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease:  '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined
 * }[]} keyframes - keyframes obj array
 */
function t_animationSBS__generateKeyframes__correctOpacityOnFirstStep(el, keyframes) {
	var afterFirstKeyframe = keyframes[1];
	if (afterFirstKeyframe && afterFirstKeyframe.time === 0 && afterFirstKeyframe.styles.opacity === 0) {
		var animatedWrapper = el ? el.querySelector('.tn-atom__sbs-anim-wrapper') : null;
		if (animatedWrapper) {
			animatedWrapper.style.opacity = '0';
		}
		keyframes[0].styles.opacity = 0;
	}
}

/**
 * set animation steps in percents
 *
 * @param {AnimatedHTML} el - currentElement
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease: '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined,
 *   percent: number,
 *   changes: string | undefined
 * }[]} keyframes - keyframes obj array (percents set in t_animationSBS__generateKeyframes__countPercent())
 * @returns {string} - keyframes str
 */
function t_animationSBS__generateKeyframes__getTxtStyles(el, keyframes) {
	var keyframesStr = '';
	keyframes.forEach(function (keyframe) {
		if (!keyframe.changes) keyframe.changes = t_animationSBS__generateKeyframes__getFrameChanges(el, keyframe);
		keyframesStr += typeof keyframe.percent === 'number' ? keyframe.percent + '% {' + keyframe.changes + '}\n' : '';
	});
	return keyframesStr;
}

/**
 * @param {AnimatedHTML} el - currentElement
 * @param {{
 *   styles: stepStyles,
 *   time: number,
 *   ease: '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin' | undefined,
 *   percent: number,
 *   changes: string | undefined
 * }} keyframe - keyframes obj
 * @returns {string} - styles
 */
function t_animationSBS__generateKeyframes__getFrameChanges(el, keyframe) {
	var stepChanges = '';
	var transformChanges = '';
	var scaleChanges = {x: 1, y: 1, changed: false};
	var zoomValue = window.t_animationSBS__isOnlyScalable ? t_animationSBS__getZoom(el) : 1;

	for (var style in keyframe.styles) {
		switch (style) {
			case 'opacity':
				stepChanges += 'opacity:' + keyframe.styles.opacity + ';';
				break;
			case 'scaleX':
				scaleChanges.x = keyframe.styles.scaleX;
				scaleChanges.changed = true;
				break;
			case 'scaleY':
				scaleChanges.y = keyframe.styles.scaleY;
				scaleChanges.changed = true;
				break;
			case 'moveX':
				transformChanges += 'translateX(' + keyframe.styles.moveX * zoomValue + 'px)';
				break;
			case 'moveY':
				transformChanges += 'translateY(' + keyframe.styles.moveY * zoomValue + 'px)';
				break;
			case 'rotate':
				transformChanges += 'rotate(' + keyframe.styles.rotate + 'deg)';
				break;
		}
	}

	if (scaleChanges.changed === true) {
		transformChanges += 'scale(' + scaleChanges.x + ',' + scaleChanges.y + ')';
	}

	if (transformChanges !== '') {
		stepChanges += 'transform:' + transformChanges + ';';
	}

	if (typeof keyframe.ease !== 'undefined') {
		stepChanges += 'animation-timing-function:';
		switch (keyframe.ease) {
			case 'easeIn':
				stepChanges += 'ease-in;';
				break;
			case 'easeOut':
				stepChanges += 'ease-out;';
				break;
			case 'easeInOut':
				stepChanges += 'ease-in-out;';
				break;
			case 'bounceFin':
				stepChanges += 'cubic-bezier(0.34,1.61,0.7,1);';
				break;
			default:
				stepChanges += 'linear;';
		}
	}
	return stepChanges;
}

/**
 * get final css
 *
 * @param {AnimatedHTML} animatedHTML - current element
 * @param {{timeDuration:number}} keyframesOpts - options
 * @param {string} keyframesStr - keyframes string
 * @returns {string} - css value
 */
function t_animationSBS__generateKeyframes__getFinalCss(animatedHTML, keyframesOpts, keyframesStr) {
	var animStuff = '';
	var elementAnimationName = 'sbs-anim-' + animatedHTML.uniqueID;
	var selector = '.t-sbs-anim_started #' + animatedHTML.uniqueID;
	var isES6Support = typeof Symbol !== 'undefined';

	var duration = keyframesOpts.timeDuration === 0 ? 0.00001 : keyframesOpts.timeDuration;
	if (isES6Support) {
		animStuff += `${selector} {animation: ${elementAnimationName} ${duration}s`;
	} else {
		animStuff += selector + ' {\nanimation: ' + elementAnimationName + ' ' + duration + 's';
	}

	if (animatedHTML.loop === 'loop') animStuff += ' infinite';

	//Fix scroll animation flickering in safari
	animStuff += window.t_animationSBS__isSafari ? ' linear 0.000001s' : ' linear';
	if (animatedHTML.loop !== 'loop') animStuff += ' forwards';

	if (isES6Support) {
		animStuff += `;backface-visibility: hidden;} @keyframes ${elementAnimationName} {${keyframesStr}}`;
	} else {
		animStuff +=
			';\nbackface-visibility: hidden;\n}\n\n@keyframes ' +
			elementAnimationName +
			' {\n' +
			keyframesStr +
			'}\n\n';
	}
	return animStuff;
}

/**
 * generate keyframes (get reverse animation)
 *
 * @param {AnimatedHTML} animatedHTML - current element
 * @returns {string} - string of selectors
 */
function t_animationSBS__generateKeyframes__getReverseAnim(animatedHTML) {
	var elementID = animatedHTML.getAttribute('data-elem-id');
	var recordID = animatedHTML.closest('.t-rec') ? animatedHTML.closest('.t-rec').getAttribute('id') : '';
	var animStuff = '';
	animStuff += '#' + recordID + ' ';
	animStuff += '[data-elem-id="' + elementID + '"].t-sbs-anim_started.t-sbs-anim_reversed .tn-atom__sbs-anim-wrapper';
	animStuff += '{\n-webkit-animation-direction: reverse;\nanimation-direction: reverse;\n}\n\n';

	return animStuff;
}

/**
 *
 * @param {HTMLElement | AnimatedHTML} el - current element
 * @param {string} mode - edit or published
 * @param {string | null} value - search value
 * @returns {string} - founded attribute
 */
function t_animationSBS__getAnimOptions(el, mode, value) {
	if (!el) return '';
	var attributeList = ['sbs', 'opts'];
	if (!value) value = mode === 'edit' ? attributeList.join('') : attributeList.join('-');
	var preffix = mode === 'edit' ? 'field' : 'animate';
	var postfix = mode === 'edit' ? '-value' : '';
	var resolution = mode === 'edit' ? window.tn.curResolution : window.innerWidth;
	var mobileAnimAttribute = mode === 'edit' ? 'data-field-animmobile-value' : 'data-animate-mobile';
	var isElHasMobileAnimation = el.getAttribute(mobileAnimAttribute) === 'y';
	var breakpoints = [960, 640, 480, 320];
	var foundValue;

	if (resolution >= 1200) {
		var attribute = 'data-' + preffix + '-' + value + postfix;
		return el.getAttribute(attribute);
	}

	if (!isElHasMobileAnimation && mode !== 'edit') {
		el.style.transition = 'none';
		return '';
	}

	breakpoints.forEach(function (breakpoint, i) {
		if (resolution < breakpoint || foundValue) return;
		foundValue = el.getAttribute('data-' + preffix + '-' + value + '-res-' + breakpoint + postfix);
		if (i > 0 && !foundValue) {
			var slicedBreakpoints = breakpoints.slice(0, i);
			slicedBreakpoints.reverse().forEach(function (slicedBreakpoint) {
				if (foundValue) return;
				foundValue = el.getAttribute('data-' + preffix + '-' + value + '-res-' + slicedBreakpoint + postfix);
			});
		}
	});
	return foundValue ? foundValue : el.getAttribute('data-' + preffix + '-' + value) || '';
}

/**
 * iterate animated elements to set for them necessary options
 *
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__cacheAndSetData(animatedObject) {
	animatedObject.elements.forEach(function (animatedHTML) {
		// set to animated element type of animation, and change type method
		var animTypeAttribute = animatedObject.isEditMode ? 'data-field-sbsevent-value' : 'data-animate-sbs-event';
		animatedHTML.animType = animatedHTML.getAttribute(animTypeAttribute);

		// get trigger and set it to element
		var animTriggerAttribute = animatedObject.isEditMode ? 'data-field-sbstrg-value' : 'data-animate-sbs-trg';
		animatedHTML.trigger = parseFloat(animatedHTML.getAttribute(animTriggerAttribute));
		if (isNaN(animatedHTML.trigger)) animatedHTML.trigger = 1;
		animatedHTML.triggerElems = t_animationSBS__getAnimOptions(animatedHTML, 'published', 'sbs-trgels');
		animatedHTML.wrapperEl = animatedHTML.querySelector('.tn-atom__sbs-anim-wrapper');

		// prettier-ignore
		var elemAnimSteps = t_animationSBS__getAnimOptions(animatedHTML, animatedObject.isEditMode ? 'edit' : 'published', null);

		// status need to remove innactive element from animated list later
		animatedHTML.status = elemAnimSteps ? 'active' : 'innactive';
		if (animatedHTML.status === 'innactive') return;

		//if animation option is not fixed, append z-index value
		if (elemAnimSteps.indexOf('fixed') !== -1) {
			animatedHTML.zIndex = window.getComputedStyle(animatedHTML).getPropertyValue('z-index');
		}

		// in data-attribute we cannot place string with double quotes,
		// but JSON.parse not work with single quotes. To parse from string
		// we should replace single quotes with double quotes.
		elemAnimSteps = elemAnimSteps.replace(/'/g, '"');
		elemAnimSteps = JSON.parse(elemAnimSteps);
		t_animationSBS__addDelayToSteps(elemAnimSteps);

		// set loop value:
		// none - hasn't data-attribute, returns null
		// loop - 'loop'
		// no-reverse - 'noreverse'
		var animLoopAttribute = animatedObject.isEditMode ? 'data-field-sbsloop-value' : 'data-animate-sbs-loop';
		animatedHTML.loop = animatedHTML.getAttribute(animLoopAttribute);

		// append to element such params as
		// el.parentRecTopPos - parent absolute top position
		// el.topOffset - element absolute top pos
		// el.triggerOffset - trigger, contains topOffset,
		// and depended on installed start trigger: top/center/bottom
		t_animationSBS__setAndCacheElTopPos(animatedHTML, animatedObject);

		// append steps from data-attribute to element.steps array
		var zoomValue = t_animationSBS__getZoom(animatedHTML);
		animatedHTML.steps = [];
		var totalUnfixedDist = 0;

		elemAnimSteps.forEach(function (step, i) {
			var stepObj = {};
			stepObj.state = 'unactive';
			stepObj.styles = t_animationSBS__createStepStyles(step);

			if (animatedHTML.animType === 'scroll') {
				stepObj.prevUnfixedDist = totalUnfixedDist;
				stepObj.dist = step.di * zoomValue; // step.di - distance in px
				if (stepObj.styles.fix === false) totalUnfixedDist += stepObj.dist; // stepObj.styles.fix - step.fi === 'fixed'
				stepObj.start = i === 0 ? animatedHTML.topOffset : animatedHTML.steps[i - 1].end;
				stepObj.end = stepObj.start + stepObj.dist;
			} else {
				stepObj.time = step.ti; // step.ti - duration in ms
				stepObj.ease = step.ea; // '' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceFin'
			}

			animatedHTML.steps.push(stepObj);
		});

		if (!animatedHTML.wrapperEl.id) t_animationSBS__generateUniqueIDForEl(animatedHTML);
		t_animationSBS__updateInfoOnImgLoad(animatedHTML, animatedObject);
		t_animationSBS__updateMoveAndRotateStepsStyles(animatedHTML.steps);
	});

	// remove all innactive elements from list
	animatedObject.elements = animatedObject.elements.filter(function (el) {
		if (el.status === 'innactive') {
			if (el.wrapperEl) el.wrapperEl.removeAttribute('style');
			if (el.wrapperEl) el.wrapperEl.style.display = 'table';
			if (el.wrapperEl) el.wrapperEl.style.width = 'inherit';
			if (el.wrapperEl) el.wrapperEl.style.height = 'inherit';
		}
		return el.status !== 'innactive';
	});
}

/**
 * create uniqueID to set selector and animation name for animation @keyframes.
 * Set uniqueID to wrapperEl id.
 * Update ID (if they exists) to remove cache in @keyframes in Safari
 *
 * @param {AnimatedHTML} animatedHTML
 */
function t_animationSBS__generateUniqueIDForEl(animatedHTML) {
	animatedHTML.uniqueID = Math.floor(Math.random() * Date.now()).toString(36) + performance.now().toString(36);
	animatedHTML.uniqueID = animatedHTML.uniqueID.replace(/\d/g, '');
	animatedHTML.uniqueID += Math.floor(Math.random() * 100000).toString(36);
	animatedHTML.uniqueID = animatedHTML.uniqueID.replace('.', '-');
	animatedHTML.wrapperEl.id = animatedHTML.uniqueID;
}

/**
 * update info img onload
 *
 * @param {AnimatedHTML} element - current element
 * @param {animatedObject} opts - options
 */
function t_animationSBS__updateInfoOnImgLoad(element, opts) {
	var image = element.querySelector('img');
	if (!image) return;
	image.addEventListener('load', function () {
		t_animationSBS__updateValuesAterIMGLoading(element, opts);
	});
	if (image.complete) {
		t_animationSBS__updateValuesAterIMGLoading(element, opts);
	}
}

/**
 * @param {AnimatedHTML} element - current element
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__updateValuesAterIMGLoading(element, animatedObject) {
	t_animationSBS__setAndCacheElTopPos(element, animatedObject);
	if (element.animType === 'scroll') t_animationSBS__updateStepsValues(element);
}

/**
 * update steps start/end values
 *
 * @param {AnimatedHTML} element - current element
 */
function t_animationSBS__updateStepsValues(element) {
	element.steps.forEach(function (step, i) {
		step.start = i === 0 ? element.topOffset : element.steps[i - 1].end;
		step.end = step.start + step.dist;
	});
}

/**
 * append to element topOffset and parentRecTopPos, or update them.
 * Used only for animation events in editor:
 * element on screen - 'intoview'
 * on scroll - 'scroll'
 * block on screen - 'blockintoview'
 *
 * Not for click/hover triggers.
 *
 * @param {AnimatedHTML} el - current element
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__setAndCacheElTopPos(el, animatedObject) {
	var zoomValue = t_animationSBS__getZoom(el);
	var animTypeList = ['scroll', 'intoview', 'blockintoview'];
	var isNotContainsNeedAnimTypes = animTypeList.every(function (animType) {
		return el.animType !== animType;
	});
	if (animatedObject.isEditMode || isNotContainsNeedAnimTypes) return;
	var elTopPos = parseInt(el.style.top, 10);

	// for animation type 'element on Screen' or 'on Scroll' need update
	// top position with scale in autoscaled zeroblock
	if ((el.animType === 'scroll' || el.animType === 'intoview') && !window.t_animationSBS__isOnlyScalable) {
		elTopPos *= zoomValue;
	}

	var elRecParent = el.closest('.r');
	var recTopOffset = elRecParent ? elRecParent.getBoundingClientRect().top + window.pageYOffset : 0;
	var recPaddingTop = elRecParent ? parseInt(elRecParent.style.paddingTop, 10) || 0 : 0;
	el.parentRecTopPos = recTopOffset;
	el.topOffset = recTopOffset + elTopPos + recPaddingTop;

	// consider difference from topOffset in scaled wrappers,
	// because the css scale() property scaled only element, not it's parent (unlike zoom() property)
	var scaledWrapped = el.querySelector('.tn-atom__scale-wrapper');
	var isScaled = window.t_animationSBS__isOnlyScalable && scaledWrapped;
	var difference =
		el.wrapperEl.getBoundingClientRect().top - (scaledWrapped ? scaledWrapped.getBoundingClientRect().top : 0);
	if (isScaled && el.wrapperEl && window.getComputedStyle(el.wrapperEl).position !== 'fixed' && difference > 0) {
		el.scaledDifference = difference;
	}

	t_animationSBS__setTriggerOffset(el);
}

/**
 * Update steps duration, if next step contains delay
 *
 * @param {animationStep[]} objSteps - steps
 */
function t_animationSBS__addDelayToSteps(objSteps) {
	var skippedItem;
	objSteps.forEach(function (step, i) {
		// if step not contains delay, leave this iteration
		if ((!parseInt(step.dd, 10) && !parseInt(step.dt, 10)) || skippedItem === i) return;
		var prevClonedStep = i !== 0 ? Object.create(objSteps[i - 1]) : null;
		if (!prevClonedStep) return;
		var currentDelay = parseInt(step.dd, 10) || parseInt(step.dt, 10);
		if (typeof prevClonedStep.ti !== 'undefined') prevClonedStep.ti = currentDelay.toString();
		if (typeof prevClonedStep.di !== 'undefined') prevClonedStep.di = currentDelay.toString();
		objSteps.splice(i, 0, prevClonedStep);
		// skip next iteration to perevent duplicate cloned step
		skippedItem = i + 1;
	});
}

/**
 * update moveX, moveY and rotate values,
 * according to their difference between prev and next steps
 *
 * @param {animatedStepToElement[]} steps - steps
 */
function t_animationSBS__updateMoveAndRotateStepsStyles(steps) {
	var firstStepMoveX = steps[0].styles.moveX;
	var firstStepMoveY = steps[0].styles.moveY;
	var firstStepRotate = steps[0].styles.rotate;

	steps.forEach(function (step) {
		var stepStyle = step.styles;
		stepStyle.moveX -= firstStepMoveX;
		firstStepMoveX += stepStyle.moveX;
		stepStyle.moveY -= firstStepMoveY;
		firstStepMoveY += stepStyle.moveY;
		stepStyle.rotate -= firstStepRotate;
		firstStepRotate += stepStyle.rotate;
	});
}

/**
 * @param {animationStep} step - current step
 * @returns {stepStyles} - styles
 */
function t_animationSBS__createStepStyles(step) {
	return {
		moveX: parseInt(step.mx, 10) || 0,
		moveY: parseInt(step.my, 10) || 0,
		scaleX: !isNaN(parseFloat(step.sx)) ? parseFloat(step.sx) : 1,
		scaleY: !isNaN(parseFloat(step.sy)) ? parseFloat(step.sy) : 1,
		opacity: !isNaN(parseFloat(step.op)) ? parseFloat(step.op) : 1,
		rotate: parseInt(step.ro, 10) || 0,
		blur: parseInt(step.bl, 10) || 0,
		fix: step.fi === 'fixed',
	};
}

/**
 * updated or new parameter triggerOffset depend on 'start trigger' in animation options:
 * on window top; on window bottom; on window center.
 *
 * @param {AnimatedHTML} el - current element
 */
function t_animationSBS__setTriggerOffset(el) {
	var winHeight = window.innerHeight;
	var zoomValue = t_animationSBS__getZoom(el);

	el.triggerOffset = Number(el.getAttribute('data-animate-sbs-trgofst'));
	if (window.t_animationSBS__isOnlyScalable || el.animType === 'scroll') el.triggerOffset *= zoomValue;
	if (!el.triggerOffset) el.triggerOffset = 0;
	if (el.trigger === 0.5 || el.trigger === 1) {
		el.triggerOffset += winHeight * el.trigger;
		if (
			(el.animType === 'intoview' || el.animType === 'scroll') &&
			el.triggerOffset > el.topOffset &&
			el.triggerOffset <= winHeight * el.trigger
		) {
			el.triggerOffset = el.topOffset;
		}
		if (
			el.animType === 'blockintoview' &&
			el.triggerOffset > el.parentRecTopPos &&
			el.triggerOffset <= winHeight * el.trigger
		) {
			el.triggerOffset = el.parentRecTopPos;
		}
	}
}

/**
 * create triggers to such type animation events as:
 * 1. element on Screen
 * 2. block on Screen
 * 3. click
 * 4. hover
 *
 * @param {animatedObject} animatedObject - options
 * @param {AnimatedHTML[]} elsIntoview - filtered AnimatedHTML, which has event from editor
 * 'element on Screen' - 'intoview' or
 * 'block on Screen' - 'blockintoview'.
 */
function t_animationSBS__triggerNoScrollAnimation(animatedObject, elsIntoview) {
	t_animationSBS__updateIntoViewElsState(animatedObject, elsIntoview);
	window.addEventListener(
		'scroll',
		t_throttle(function () {
			t_animationSBS__updateIntoViewElsState(animatedObject, elsIntoview);
		}, 200)
	);
	t_animationSBS__initClickTriggers(animatedObject);
	t_animationSBS__initHoverTriggers(animatedObject);
}

//============================ on action animation: hover and click ============================//

/**
 * init animation with click
 *
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__initClickTriggers(animatedObject) {
	var clickedElements = animatedObject.elements.filter(function (el) {
		return el.getAttribute('data-animate-sbs-event') === 'click';
	});
	if (!clickedElements.length) return;
	t_animationSBS__connectTriggersWithAnimEls(clickedElements);
	var triggerClickElements = Array.prototype.slice.call(document.querySelectorAll('.js-sbs-anim-trigger_click'));
	if (!triggerClickElements.length) return;

	// if element has class .js-sbs-anim-trigger_click, set style cursor: pointer;
	var clickStyles = document.createElement('style');
	clickStyles.textContent = '.js-sbs-anim-trigger_click { cursor: pointer; }';
	document.head.insertAdjacentElement('beforeend', clickStyles);

	// remove old listener, and set new one
	Array.prototype.forEach.call(triggerClickElements, function (triggerClickElement) {
		triggerClickElement.removeEventListener('click', t_animationSBS__initClickCallback);
		triggerClickElement.addEventListener('click', t_animationSBS__initClickCallback);
	});
}

/**
 * trigger and start animation by click
 */
function t_animationSBS__initClickCallback() {
	var targets = this['data-els-to-animate-on-click'];

	// remove click event from .t396__elem and append it for this children
	if (this.classList.contains('t396__elem')) {
		this.style.pointerEvents = 'none';
		var wrapper = this.querySelector('.tn-atom__sbs-anim-wrapper');
		if (wrapper) wrapper.style.pointerEvents = 'auto';
		if (wrapper) {
			wrapper.style.pointerEvents = 'auto';
		} else {
			wrapper = this.querySelector('.tn-atom');
			if (wrapper) wrapper.style.pointerEvents = 'auto';
		}
	}

	// check if elements has mobile animation
	if (window.innerWidth < 1200) {
		targets = targets.filter(function (target) {
			return target.getAttribute('data-animate-mobile') === 'y';
		});
	}
	if (!targets.length) return;
	var isStarted =
		targets[0].classList.contains('t-sbs-anim_started') && !targets[0].classList.contains('t-sbs-anim_reversed');
	isStarted ? t_animationSBS__actionOnEnd(targets) : t_animationSBS__actionOnStart(targets);
}

/**
 *
 * @param {animatedObject} animatedObject - options
 */
function t_animationSBS__initHoverTriggers(animatedObject) {
	var hoveredElements = animatedObject.elements.filter(function (el) {
		return el.getAttribute('data-animate-sbs-event') === 'hover';
	});
	if (!hoveredElements.length) return;
	t_animationSBS__connectTriggersWithAnimEls(hoveredElements);

	// catch hover events on triggers
	var triggerHoverElements = document.querySelectorAll('.js-sbs-anim-trigger_hover');
	Array.prototype.forEach.call(triggerHoverElements, function (triggerHoverElement) {
		if ('ontouchend' in document) {
			// in touch devices mouseenter/mouseleave can override the click event,
			// to prevent it - use click again
			triggerHoverElement.removeEventListener('click', t_animationSBS__initHoverTrigger);
			triggerHoverElement.addEventListener('click', t_animationSBS__initHoverTrigger);
		} else {
			triggerHoverElement.removeEventListener('mouseenter', t_animationSBS__initHoverTrigger);
			triggerHoverElement.removeEventListener('mouseleave', t_animationSBS__initHoverTrigger);
			triggerHoverElement.addEventListener('mouseenter', t_animationSBS__initHoverTrigger);
			triggerHoverElement.addEventListener('mouseleave', t_animationSBS__initHoverTrigger);
		}
	});
}

/**
 * trigger and start animation by hover
 */
function t_animationSBS__initHoverTrigger(e) {
	var target = e.currentTarget;
	var targets = e.currentTarget['data-els-to-animate-on-hover'];
	if (e.type === 'mouseenter') t_animationSBS__actionOnStart(targets);
	if (e.type === 'mouseleave') t_animationSBS__actionOnEnd(targets);
	if (e.type === 'click') {
		t_animationSBS__actionOnStart(targets);
		// to prevent double-click, need use setTimeout
		setTimeout(function () {
			document.addEventListener('click', t_animationSBS__updateClickForHoverTrigger);
		});
	}
	function t_animationSBS__updateClickForHoverTrigger(e) {
		if (target !== e.target.closest('.t396__elem')) {
			t_animationSBS__actionOnEnd(targets);
			document.removeEventListener('click', t_animationSBS__updateClickForHoverTrigger);
		}
	}
}

/**
 * @param {AnimatedHTML[]} animatedHTMLList - filtered elements
 */
function t_animationSBS__connectTriggersWithAnimEls(animatedHTMLList) {
	var type = animatedHTMLList[0].getAttribute('data-animate-sbs-event');
	animatedHTMLList.forEach(function (animatedHTML) {
		var idsStr = animatedHTML.triggerElems;
		// if animated element hasn't idsStr, its animation will be triggered by the same element
		if (!idsStr) {
			var selfTriggerNode = animatedHTML.querySelector('.tn-atom__sbs-anim-wrapper');
			if (selfTriggerNode) selfTriggerNode['data-els-to-animate-on-' + type] = [animatedHTML];
			if (selfTriggerNode) selfTriggerNode.classList.add('js-sbs-anim-trigger_' + type);
		} else {
			var triggersIDs = idsStr ? idsStr.split(',') : [];
			var parentArtboard = animatedHTML.closest('.t396__artboard');
			var recid = parentArtboard ? parentArtboard.getAttribute('data-artboard-recid') : '';

			triggersIDs.forEach(function (id) {
				var elemUniqueID = recid + id;
				var elTrigger = document.querySelector('.tn-elem__' + elemUniqueID);
				if (!elTrigger) return;

				// to first animated element create array,
				// which placed all animated els, connected with this trigger
				if (!elTrigger['data-els-to-animate-on-' + type]) {
					elTrigger['data-els-to-animate-on-' + type] = [];
					elTrigger['data-els-to-animate-on-' + type].push(animatedHTML);
					elTrigger.classList.add('js-sbs-anim-trigger_' + type);
				} else {
					elTrigger['data-els-to-animate-on-' + type].push(animatedHTML);
				}
			});
		}
	});
}

/**
 * @param {AnimatedHTML[]} elements - element
 */
function t_animationSBS__actionOnStart(elements) {
	elements.forEach(function (el) {
		el.classList.contains('t-sbs-anim_playing')
			? el.setAttribute('data-planned-dir', 'play')
			: t_animationSBS__playAnimation(el);
	});
}

/**
 * @param {AnimatedHTML[]} elements - elements
 */
function t_animationSBS__actionOnEnd(elements) {
	elements.forEach(function (el) {
		if (el.getAttribute('data-animate-sbs-loop') === 'loop') {
			// elements with loop animation should stop animation after the and of current iteration
			el.addEventListener('animationiteration', t_animationSBS__setIterationAnimation);
		} else if (el.classList.contains('t-sbs-anim_playing')) {
			el.setAttribute('data-planned-dir', 'reverse');
		} else {
			t_animationSBS__playReverseAnim(el);
		}
	});
}

function t_animationSBS__setIterationAnimation() {
	this.classList.remove('t-sbs-anim_started');
	this.classList.remove('t-sbs-anim_reversed');
	this.classList.remove('t-sbs-anim_playing');
	this.removeEventListener('animationiteration', t_animationSBS__setIterationAnimation);
}

/**
 * ending of animation
 *
 * @param {AnimatedHTML} el - current element
 */
function t_animationSBS__animationEnd(el) {
	el.removeEventListener('animationend', t_animationSBS__animationEndingEvent);
	el.addEventListener('animationend', t_animationSBS__animationEndingEvent);
	el['data-callback-dep-anim'] = t_animationSBS__animationEndingEvent;
}

function t_animationSBS__animationEndingEvent() {
	this.classList.remove('t-sbs-anim_playing');
	this.removeEventListener('animationend', this['data-callback-dep-anim']);
	var plannedDirection = this.getAttribute('data-planned-dir');
	if (plannedDirection === 'play' && this.classList.contains('t-sbs-anim_reversed')) {
		t_animationSBS__playAnimation(this);
	} else if (plannedDirection === 'reverse' && !this.classList.contains('t-sbs-anim_reversed')) {
		t_animationSBS__playReverseAnim(this);
	}
	this.setAttribute('data-planned-dir', '');
}

/**
 * return the time it takes to complete the full animation cycle
 *
 * @param {AnimatedHTML} el - current element
 * @returns {number} - time
 */
function t_animationSBS__getAnimationFullTime(el) {
	var dataAnimateSbsOpts = el.getAttribute('data-animate-sbs-opts');
	if (!dataAnimateSbsOpts) return 0;
	var animateSbsOpts = JSON.parse(el.getAttribute('data-animate-sbs-opts').split("'").join('"'));
	return animateSbsOpts.reduce(function (prev, next) {
		return prev + (parseInt(next.ti, 10) || 0);
	}, 0);
}

/**
 * play animation on action
 *
 * @param {AnimatedHTML} el - current element
 */
function t_animationSBS__playAnimation(el) {
	el.classList.remove('t-sbs-anim_started');
	el.classList.remove('t-sbs-anim_reversed');
	t_animationSBS__forceRepaint(el);
	var animTime = t_animationSBS__getAnimationFullTime(el);
	var classListValues = ['t-sbs-anim_started'];
	if (animTime > 0) classListValues.push('t-sbs-anim_playing');
	classListValues.forEach(function (className) {
		el.classList.add(className);
	});
	t_animationSBS__animationEnd(el);
}

/**
 * Play reverse animation.
 * only for click and hover triggers.
 *
 * @param {HTMLElement} el - current element
 */
function t_animationSBS__playReverseAnim(el) {
	el.classList.remove('t-sbs-anim_started');
	t_animationSBS__forceRepaint(el);
	var animTime = t_animationSBS__getAnimationFullTime(el);
	var classListValues = ['t-sbs-anim_started', 't-sbs-anim_reversed'];
	if (animTime > 0) classListValues.push('t-sbs-anim_playing');

	classListValues.forEach(function (className) {
		el.classList.add(className);
	});
	t_animationSBS__animationEnd(el);
}

/**
 * by default animation wouldn't be played twice
 * if we want to restart it — we need to force an element to be repainted
 *
 * @param {HTMLElement} el - current Element
 */
function t_animationSBS__forceRepaint(el) {
	el.offsetWidth;
}

//============================ end of action animation: hover and click ============================//

/**
 * @param {animatedObject} animatedObject - options
 * @param {AnimatedHTML[]} elsIntoView - filtered AnimatedHTML, which has event from editor
 * 'element on Screen' - 'intoview' or
 * 'block on Screen' - 'blockintoview'.
 */
function t_animationSBS__updateIntoViewElsState(animatedObject, elsIntoView) {
	if (!elsIntoView || !elsIntoView.length) return;
	animatedObject.scrollTop = window.pageYOffset;
	elsIntoView.forEach(function (el) {
		var trigger = animatedObject.scrollTop + el.triggerOffset;
		var isAfterStart = el.animType === 'blockintoview' ? trigger >= el.parentRecTopPos : trigger >= el.topOffset;
		// to equal working in edit and published mode find parent as el.closest('.t396').parentElement
		var parentEl = el.closest('.t396').parentElement;
		var hiddenClasses = ['t397__off', 't395__off', 't400__off'];
		var isParentHidden = hiddenClasses.some(function (className) {
			return parentEl.classList.contains(className);
		});
		if (!isAfterStart || isParentHidden) return;
		if (!el.classList.contains('t-sbs-anim_started')) el.classList.add('t-sbs-anim_started');
	});
}

/**
 * check is old IE. If true, do not start sbs-animation
 *
 * @returns {boolean}
 */
function t_animationSBS__checkOldIE() {
	var userAgent = window.navigator.userAgent;
	var iEIndex = userAgent.indexOf('MSIE');
	if (iEIndex === -1) return false;
	var ieVersion = parseInt(userAgent.substring(iEIndex + 5, userAgent.indexOf('.', iEIndex)), 10);
	return ieVersion === 8 || ieVersion === 9 || ieVersion === 10;
}

/**
 * get zoom value
 *
 * @param {HTMLElement} el - current element
 * @returns {number} - scale factor
 */
function t_animationSBS__getZoom(el) {
	var artboard = el.closest('.t396__artboard');
	if (artboard && artboard.classList.contains('t396__artboard_scale')) {
		return window.tn_scale_factor;
	}
	return 1;
}

// BELOW FUNCTIONS ARE USED FOR SUPPORT OLD SITES
// WITH CUSTOM CODE FOR MOBILE ANIMATION
// FROM TILDOSHNAYA
// DO NOT REMOVE!!!
// ========================================================================================
/**
 * for old sites - wrap atom elements
 */
// eslint-disable-next-line no-unused-vars
function t_animateSbs__wrapAtomEls() {
	var wrappingEls = document.querySelectorAll('[data-animate-sbs-event]');
	Array.prototype.forEach.call(wrappingEls, function (wrappingEl) {
		var atomElement = wrappingEl.querySelector('.tn-atom');
		if (atomElement && !atomElement.closest('.tn-atom__sbs-anim-wrapper')) {
			t_animationSBS__wrapEl(atomElement, 'tn-atom__sbs-anim-wrapper');
			var elType = wrappingEl.getAttribute('data-elem-type');
			// getPropertyValue returns border-radius value in px. If it cannot setted, will return '0px'
			var elBorderRadius = window.getComputedStyle(wrappingEl).getPropertyValue('border-radius');
			if (elType === 'shape' && elBorderRadius && parseInt(elBorderRadius)) {
				var animWrapper = wrappingEl.querySelector('.tn-atom__sbs-anim-wrapper');
				if (animWrapper) animWrapper.style.borderRadius = elBorderRadius;
			}
		}
	});
}

/**
 * for old sites - cash elements info
 *
 * @param {{els, mode}} opts - options
 */
// eslint-disable-next-line no-unused-vars
function t_animateSbs__cashElsInfo(opts) {
	var elements = opts.els;
	opts.triggerElemsAttrName = opts.mode === 'edit' ? 'data-field-sbstrgels-value' : 'data-animate-sbs-trgels';
	Array.prototype.forEach.call(elements, function (el) {
		el.state = 'unactive';
		el.animType =
			opts.mode === 'edit'
				? el.getAttribute('data-field-sbsevent-value')
				: el.getAttribute('data-animate-sbs-event');
		el.changeType = el.animType === 'scroll' ? 'scroll' : 'time';
		el.trigger =
			opts.mode === 'edit' ? el.getAttribute('data-field-sbstrg-value') : el.getAttribute('data-animate-sbs-trg');
		el.trigger = el.trigger ? el.trigger : 1;
		el.triggerElems = el.getAttribute(opts.triggerElemsAttrName);
		el.wrapperEl = el.querySelector('.tn-atom__sbs-anim-wrapper');
		el.steps = [];
		var stringOpts =
			opts.mode === 'edit'
				? el.getAttribute('data-field-sbsopts-value')
				: el.getAttribute('data-animate-sbs-opts');
		if (stringOpts) {
			if (stringOpts.indexOf('fixed') !== -1) {
				el.zIndex = window.getComputedStyle(el).getPropertyValue('z-index');
			}

			stringOpts = stringOpts.replace(/'/g, '"');
			var objSteps = JSON.parse(stringOpts);
			t_animationSBS__addDelayToSteps(objSteps);

			el.loop =
				opts.mode === 'edit'
					? el.getAttribute('data-field-sbsloop-value')
					: el.getAttribute('data-animate-sbs-loop');
			t_animationSBS__setAndCacheElTopPos(el, opts);
			var totalUnfixedDist = 0;
			for (var j = 0; j < objSteps.length; j++) {
				var curStep = {};
				curStep.state = 'unactive';
				curStep.styles = t_animationSBS__createStepStyles(objSteps[j]);
				if (el.changeType === 'scroll') {
					curStep.prevUnfixedDist = totalUnfixedDist;
					curStep.dist = objSteps[j].di;
					if (curStep.styles.fix === false) {
						totalUnfixedDist += Number(curStep.dist);
					}
					curStep.start = j === 0 ? el.topOffset : el.steps[j - 1].end;
					curStep.end = curStep.start + curStep.dist * 1;
				} else {
					curStep.time = objSteps[j].ti;
					curStep.ease = objSteps[j].ea;
				}
				el.steps.push(curStep);
			}
			t_animationSBS__updateInfoOnImgLoad(el, opts);
			t_animationSBS__updateMoveAndRotateStepsStyles(el.steps);
		}
	});
}

/**
 * for old sites - reset animation
 *
 * @param {object} opts -  options
 */
// eslint-disable-next-line no-unused-vars
function t_animateSbs__reset(opts) {
	var elements = opts.els;
	for (var i = 0; i < elements.length; i++) {
		var type = elements[i].animType;
		if (type === 'intoview' || type === 'blockintoview' || type === 'click' || type === 'hover') {
			elements[i].classList.remove('t-sbs-anim_started');
			var animatedWrapper = elements[i].querySelector('.tn-atom__sbs-anim-wrapper');
			if (animatedWrapper) {
				animatedWrapper.style.opacity = '';
			}
		} else {
			elements[i].state = 'reseted';
			var atomAnimWrapper = elements[i].wrapperEl;
			if (atomAnimWrapper) {
				atomAnimWrapper.style.transform = '';
				atomAnimWrapper.style.position = '';
				atomAnimWrapper.style.top = '';
				atomAnimWrapper.style.opacity = '';
			}
		}
	}
}

/**
 * wrap element
 *
 * @param {HTMLElement} el - current Element
 * @param {string} className - class of wrapped el
 */
function t_animationSBS__wrapEl(el, className) {
	if (!el) return false;
	var parent = el.parentNode;
	var div = document.createElement('div');
	div.classList.add(className);
	div.style.display = 'table';
	div.style.width = 'inherit';
	div.style.height = 'inherit';
	div.appendChild(el);
	if (parent) {
		parent.appendChild(div);
	}
}

//=============== FOR ZERO EDITOR ============//
//TODO remove and update in zero tpl,
// after published for all users
function t_animateSbs__cashElsData(opts) {}
function t_animateSbs__generateKeyframes(opts) {
	opts.elements = Array.prototype.slice.call(opts.els);
	opts.isEditMode = true;
	t_animationSBS__cacheAndSetData(opts);
	return t_animationSBS__generateKeyframes(opts);
}