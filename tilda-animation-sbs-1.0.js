/**
 * tilda-animation-sbs used in zeroblocks, when user activate step-by-step animation
 */
if (document.readyState !== 'loading') {
	t_animateSbs__init();
} else {
	document.addEventListener('DOMContentLoaded', t_animateSbs__init);
}

/**
 * init animation
 *
 * @returns {void}
 */
function t_animateSbs__init() {
	var record = document.querySelector('.t-records');
	var recordMode = record ? record.getAttribute('data-tilda-mode') : null;
	if (window.isSearchBot ||
		t_animateParallax__checkOldIE() ||
		recordMode === 'edit') {
		return;
	}
	
	// prevent horizontal scroll
	if (document.querySelectorAll('[data-animate-sbs-event="scroll"]').length) {
		document.querySelector('.t-records#allrecords').style.overflowX = 'hidden';
	}
	
	t_animateSbs__wrapAnimatedAtomEls();
	setTimeout(function () {
		t_animateSbs__initAllRes();
	}, 50);
}


/**
 * wrap animated atom elements
 */
function t_animateSbs__wrapAnimatedAtomEls() {
	var wrappingEls = document.querySelectorAll('[data-animate-sbs-event]');
	Array.prototype.forEach.call(wrappingEls, function (wrappingEl) {
		var atomElement = wrappingEl.querySelector('.tn-atom');
		if (atomElement) {
			// condition because of bug in Chrome (MAC)
			if (navigator.userAgent.indexOf('Chrome') === -1) {
				atomElement.style.WebkitBackfaceVisibility = 'hidden';
				atomElement.style.backfaceVisibility = 'hidden';
			}
			if (!atomElement.closest('.tn-atom__sbs-anim-wrapper') &&
				t_animateSbs__getOptsPublishMode(wrappingEl)) {
				t_animateSbs__wrapEl(atomElement, 'tn-atom__sbs-anim-wrapper');
				// reset cache after wrapping el
				atomElement = wrappingEl.querySelector('.tn-atom');
				
				var parentElem = atomElement.closest('.t396__elem');
				var animWrapper = atomElement.closest('.tn-atom__sbs-anim-wrapper');
				var parentFilterStyle = window.getComputedStyle(parentElem).getPropertyValue('filter');
				var parentWebkitFilterStyle = window.getComputedStyle(parentElem)
					.getPropertyValue('-webkit-filter');
				var parentBackdropFilter = window.getComputedStyle(parentElem)
					.getPropertyValue('backdrop-filter');
				var parentWebkitBackdropFilter = window.getComputedStyle(parentElem)
					.getPropertyValue('-webkit-backdrop-filter');
				var isParentHasFilter = parentElem ?
					((parentFilterStyle && parentFilterStyle !== 'none') ||
						(parentWebkitFilterStyle && parentWebkitFilterStyle !== 'none')) : null;
				var isParentHasBackdropFilter = parentElem ?
					((parentBackdropFilter && parentBackdropFilter !== 'none') ||
						(parentWebkitBackdropFilter && parentWebkitBackdropFilter !== 'none')) : null;
				
				if (isParentHasFilter) {
					animWrapper.style.WebkitFilter = parentWebkitFilterStyle;
					animWrapper.style.filter = parentFilterStyle;
					parentElem.style.filter = 'none';
					parentElem.style.WebkitFilter = 'none';
				}
				if (isParentHasBackdropFilter) {
					animWrapper.style.WebkitBackdropFilter = parentWebkitBackdropFilter;
					animWrapper.style.backdropFilter = parentBackdropFilter;
					parentElem.style.backdropFilter = 'none';
					parentElem.style.WebkitBackdropFilter = 'none';
				}
			}
		}
	});
}

/**
 *
 * @returns {void}
 */
function t_animateSbs__initAllRes() {
	var opts = {
		els: document.querySelectorAll('[data-animate-sbs-event]'),
		scrollTop: window.pageYOffset,
		stop: false,
		needUpdate: true,
	};
	opts.mode = (opts.els[0].hasAttribute('data-field-sbsevent-value')) ? 'edit' : 'publish';
	
	if (opts.els.length === 0) {
		return;
	}
	
	t_animateSbs__cashElsData(opts);
	var animStuff = t_animateSbs__generateKeyframes(opts);
	if (animStuff) {
		document.head.insertAdjacentHTML('beforeend', '<style class="sbs-anim-keyframes">' + animStuff +
			'</style>');
	}
	
	var allRecords = document.getElementById('allrecords');
	var lazyLoadValue = allRecords ? allRecords.getAttribute('data-tilda-lazy') : null;
	if (window.lazy === 'y' || lazyLoadValue === 'yes') {
		t_animateSbs__onFuncLoad('t_lazyload_update', function () {
			t_lazyload_update();
		});
	}
	
	var resizeEnd;
	
	/**
	 * update animation
	 */
	function animationUpdate() {
		clearTimeout(resizeEnd);
		resizeEnd = setTimeout(function () {
			opts.stop = false;
			t_animateSbs__cashElsData(opts);
			t_animateSbs__triggerScrollAnim(opts);
			var animStuff = t_animateSbs__generateKeyframes(opts);
			var pastedStyles = document.head.querySelector('style.sbs-anim-keyframes');
			var oldStyle = pastedStyles ? pastedStyles.textContent : '';
			if (animStuff && pastedStyles && animStuff !== oldStyle) {
				pastedStyles.textContent = animStuff;
			}
		}, 500);
	}
	
	window.addEventListener('resize', animationUpdate);
	var zeroBlocks = document.querySelectorAll('.t396');
	Array.prototype.forEach.call(zeroBlocks, function (zeroBlock) {
		zeroBlock.addEventListener('displayChanged', animationUpdate);
	});
	
	t_animateSbs__triggerTimeAnim(opts);
	
	var scrollAnimationEl = document.querySelectorAll('[data-animate-sbs-event=scroll]');
	if (scrollAnimationEl.length) {
		t_animateSbs__triggerScrollAnim(opts);
		t_animateSbs__checkFrame(opts);
	}
	
	window.addEventListener('load', function () {
		t_animateSbs__rereadElsValues(opts);
	});
	
	setTimeout(function () {
		t_animateSbs__rereadElsValues(opts);
	}, 3000);
}


/**
 * update on scroll animation
 *
 * @param {object} opts - options
 */
function t_animateSbs__rereadElsValues(opts) {
	var elements = opts ? opts.els : null;
	if (elements && elements.length) {
		Array.prototype.forEach.call(elements, function (element) {
			t_animateSbs__cashElsTopOffset(element, opts);
			if (element.changeType === 'scroll') {
				t_animateSbs__updateStepsStartValues(element);
			}
		});
	}
}

/**
 * @param {object} opts - options
 */
function t_animateSbs__checkFrame(opts) {
	opts.needUpdate = t_animateSbs__checkChanges(opts);
	if (opts.needUpdate && opts.stop === false) {
		t_animateSbs__triggerScrollAnim(opts);
	}
	requestAnimationFrame(function () {
		t_animateSbs__checkFrame(opts);
	});
}

/**
 * @param {object} opts - options
 * @returns {boolean} - is scroll changes
 */
function t_animateSbs__checkChanges(opts) {
	var oldTop = opts.scrollTop;
	opts.scrollTop = window.pageYOffset;
	return (oldTop !== opts.scrollTop && opts.stop === false);
}

/**
 * trigger animation
 *
 * @param {object} opts - options
 */
function t_animateSbs__triggerScrollAnim(opts) {
	var elements = opts ? opts.els : null;
	if (elements && elements.length) {
		Array.prototype.forEach.call(elements, function (el) {
			if (el.changeType !== 'time') {
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
				
				t_animateSbs__triggerScrollAnim__checkElSteps(opts, el, elState);
				t_animateSbs__triggerScrollAnim__changeEl(el, elState);
			}
		});
	}
}

/**
 * trigger scroll animation - check steps
 *
 * @param {object} opts - options
 * @param {HTMLElement} el - current element
 * @param {object} elState - state of current element
 */
function t_animateSbs__triggerScrollAnim__checkElSteps(opts, el, elState) {
	var steps = el ? el.steps : null;
	if (steps && steps.length) {
		Array.prototype.forEach.call(steps, function (step, i) {
			step.index = i;
			var trigger = opts.scrollTop + el.triggerOffset;
			var isAfterStart = trigger >= step.start;
			var isBeforeStart = trigger < step.start;
			var isAfterEnd = step.end <= trigger;
			var isBeforeEnd = step.end > trigger;
			
			if (isAfterStart && isBeforeEnd) {
				step.state = 'started';
				el.wrapperEl.style.willChange = 'transform';
				var progress = trigger - step.start;
				var percentage = (step.dist === 0) ? 1 : progress / step.dist;
				elState.prevUnfixedDist = step.prevUnfixedDist;
				t_animateSbs__triggerScrollAnim__calcStyle(elState, step, percentage);
			}
			if (isAfterEnd) {
				step.state = 'finished';
				el.wrapperEl.style.willChange = '';
				t_animateSbs__triggerScrollAnim__calcStyle(elState, step, 1);
			}
			if (isBeforeStart && (step.state === 'started' || step.state === 'finished')) {
				step.state = 'unactive';
				el.wrapperEl.style.willChange = '';
				t_animateSbs__triggerScrollAnim__calcStyle(elState, step, 0);
			}
		});
	}
	// workaround for making element transparent on first step
	if (el.steps[1] &&
		el.steps[1].state === 'unactive' &&
		el.steps[1].styles.opacity === 0 &&
		el.steps[1].dist === 0) {
		elState.opacity = 0;
	}
}

/**
 * generate keyframes
 *
 * @param {object} opts - options
 * @returns {string} - keyframes
 */
function t_animateSbs__generateKeyframes(opts) {
	var animStuff = '';
	var elements = opts ? opts.els : null;
	if (elements && elements.length) {
		Array.prototype.forEach.call(elements, function (el) {
			if (el.changeType === 'time') {
				var keyframesOpts = {
					timeDuration: 0,
				};
				var keyframes = [];
				// var firstKeyframe = {'styles':{},'time':0,'ease':el.steps[0].ease};
				// keyframes.push(firstKeyframe);
				t_animateSbs__generateKeyframes__combineObjects(el.steps, keyframes, keyframesOpts);
				t_animateSbs__generateKeyframes__correctFrames(keyframes);
				t_animateSbs__generateKeyframes__countPercent(keyframes, keyframesOpts);
				t_animateSbs__generateKeyframes__correctOpacityOnFirstStep(el, keyframes);
				var keyframesStr = t_animateSbs__generateKeyframes__getTxtStyles(keyframes);
				keyframesOpts.timeDuration /= 1000;
				
				if (keyframesStr !== '') {
					animStuff += t_animateSbs__generateKeyframes__getFinalCss(el, keyframesOpts, keyframesStr);
					if (el.loop !== 'loop' && el.loop !== 'noreverse' &&
						(el.animType === 'hover' || el.animType === 'click')) {
						animStuff += t_animateSbs__generateKeyframes__getReverseAnim(el);
					}
				}
			}
		});
	}
	return animStuff;
}

/**
 * generate keyframes (get reverse animation)
 *
 * @param {HTMLElement} el - current element
 * @returns {string} - string of selectors
 */
function t_animateSbs__generateKeyframes__getReverseAnim(el) {
	var elementID = el.getAttribute('data-elem-id');
	var recordID = el.closest('.t-rec') ? el.closest('.t-rec').getAttribute('id') : '';
	var animStuff = '';
	animStuff += '#' + recordID + ' ';
	animStuff += '[data-elem-id="' + elementID +
		'"].t-sbs-anim_started.t-sbs-anim_reversed .tn-atom__sbs-anim-wrapper';
	animStuff += '{\n-webkit-animation-direction: reverse;\nanimation-direction: reverse;\n}\n\n';
	
	return animStuff;
}

/**
 * get final css
 *
 * @param {HTMLElement} el - current element
 * @param {object} keyframesOpts - options
 * @param {string} keyframesStr - keyframes string
 * @returns {string} - css value
 */
function t_animateSbs__generateKeyframes__getFinalCss(el, keyframesOpts, keyframesStr) {
	var animStuff = '';
	
	var elementID = el ? el.getAttribute('data-elem-id') : '';
	var elementAnimationName = 'sbs-anim-' + elementID;
	var parent = el ? el.closest('.t-rec') : null;
	var recordID = parent ? parent.getAttribute('id') : '';
	el.timeDuration = keyframesOpts.timeDuration;
	
	// for published page, where recs can be duplicated
	if (recordID) {
		animStuff += '#' + recordID + ' ';
		elementAnimationName = 'sbs-anim-' + recordID + '-' + elementID;
		if (keyframesOpts.reverse === true) {
			elementAnimationName += '_reverse';
		}
	}
	var selector = keyframesOpts.hover === true ?
		'[data-elem-id="' + elementID + '"].t-sbs-anim_started:hover .tn-atom__sbs-anim-wrapper' :
		'[data-elem-id="' + elementID + '"].t-sbs-anim_started .tn-atom__sbs-anim-wrapper';
	
	var duration = keyframesOpts.timeDuration === 0 ? 0.00001 : keyframesOpts.timeDuration;
	animStuff += selector + ' {\nanimation: ' + elementAnimationName + ' ' + duration + 's';
	
	if (el.loop === 'loop') {
		animStuff += ' infinite';
	}
	
	//Fix scroll animation flickering in safari
	var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	animStuff += isSafari ? ' linear 0.000001s' : ' linear';
	if (el.loop !== 'loop') {
		animStuff += ' forwards';
	}
	
	animStuff += ';\nbackface-visibility: hidden;\n}\n\n@keyframes ' + elementAnimationName + ' {\n' +
		keyframesStr + '}\n\n';
	
	return animStuff;
}

/**
 * combine objects
 *
 * @param {object} steps - steps obj
 * @param {object} keyframes - keyframes obj
 * @param {object} keyframesOpts - keyframes option obj
 */
function t_animateSbs__generateKeyframes__combineObjects(steps, keyframes, keyframesOpts) {
	for (var j = 0; j < steps.length; j++) {
		var step = steps[j];
		var keyframe = {};
		keyframe.styles = step.styles;
		keyframe.time = step.time * 1 || 0;
		if (j !== (steps.length - 1)) {
			keyframe.ease = steps[j + 1].ease;
		}
		keyframes.push(keyframe);
		keyframesOpts.timeDuration += keyframe.time;
	}
}

/**
 * correct frames
 *
 * @param {object} keyframes - keyframes obj
 */
function t_animateSbs__generateKeyframes__correctFrames(keyframes) {
	for (var k = 0; k < keyframes.length; k++) {
		var keyframe = keyframes[k];
		var isLast = (k === keyframes.length - 1);
		var isFirst = (k === 0);
		if (!isLast) {
			var nextKeyframe = keyframes[k + 1];
		}
		if (!isFirst) {
			var prevKeyframe = keyframes[k - 1];
		}
		for (var style in keyframe.styles) {
			if (!isFirst && !(style in prevKeyframe.styles)) {
				t_animateSbs__generateKeyframes__addStyleToKeyframe(keyframe, prevKeyframe, style, 0);
			}
			
			if (!isLast) {
				if (!(style in nextKeyframe.styles)) {
					t_animateSbs__generateKeyframes__addStyleToKeyframe(keyframe, nextKeyframe, style, 1);
				} else if (style === 'moveX' || style === 'moveY' || style === 'rotate') {
					t_animateSbs__generateKeyframes__recalculateValue(keyframe, nextKeyframe, style);
				}
			}
		}
	}
}

/**
 * add styles to keyframe
 *
 * @param {object} keyframe - current keyframe
 * @param {object} changingKeyFrame - current keyframe
 * @param {string} style - style
 * @param {number} state - state
 */
function t_animateSbs__generateKeyframes__addStyleToKeyframe(keyframe, changingKeyFrame, style, state) {
	if (style === 'blur' || style === 'rotate' || style === 'moveX' || style === 'moveY') {
		changingKeyFrame.styles[style] = (state === 0) ? 0 : keyframe.styles[style];
	}
	if (style === 'opacity' || style === 'scaleX' || style === 'scaleY') {
		changingKeyFrame.styles[style] = (state === 0) ? 1 : keyframe.styles[style];
	}
}

/**
 * recalculate value
 *
 * @param {object} keyframe - current keyframe
 * @param {object} nextKeyframe - next keyframe
 * @param {string} style - style
 */
function t_animateSbs__generateKeyframes__recalculateValue(keyframe, nextKeyframe, style) {
	switch (style) {
		case 'rotate':
			nextKeyframe.styles.rotate = keyframe.styles.rotate * 1 + nextKeyframe.styles.rotate * 1;
			break;
		case 'moveX':
			nextKeyframe.styles.moveX = keyframe.styles.moveX * 1 + nextKeyframe.styles.moveX * 1;
			break;
		case 'moveY':
			nextKeyframe.styles.moveY = keyframe.styles.moveY * 1 + nextKeyframe.styles.moveY * 1;
	}
}

/**
 * get percent
 *
 * @param {object[]} keyframes - list of keyframes
 * @param {object} keyframesOpts - keyframe options
 */
function t_animateSbs__generateKeyframes__countPercent(keyframes, keyframesOpts) {
	for (var j = 0; j < keyframes.length; j++) {
		var keyframe = keyframes[j];
		if (j === 0) {
			// first keyframe
			keyframe.percent = keyframesOpts.timeDuration === 0 ? 0 :
				parseFloat(parseFloat((keyframe.time / keyframesOpts.timeDuration) * 100).toFixed(2));
		} else if (j === (keyframes.length - 1)) {
			// last keyframe
			keyframe.percent = 100;
		} else {
			// keyframes between first and last
			var prevPercent = keyframes[j - 1].percent;
			keyframe.percent = keyframesOpts.timeDuration === 0 ? 0 :
				parseFloat(parseFloat((keyframe.time / keyframesOpts.timeDuration) * 100 + prevPercent)
					.toFixed(2));
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
 * correct opacity on first step
 *
 * @param {HTMLElement} el - current element
 * @param {{time, styles}[]} keyframes - list of obj keyframes
 */
function t_animateSbs__generateKeyframes__correctOpacityOnFirstStep(el, keyframes) {
	// workaround for making element transparent on first step
	var firstKeyframe = keyframes[1];
	if (firstKeyframe && firstKeyframe.time === 0 && firstKeyframe.styles.opacity === 0) {
		var animatedWrapper = el ? el.querySelector('.tn-atom__sbs-anim-wrapper') : null;
		if (animatedWrapper) {
			animatedWrapper.style.opacity = '0';
		}
		keyframes[0].styles.opacity = 0;
	}
}

/**
 * @param {{changes, percent}[]} keyframes - list of objects keyframes
 * @returns {string} - keyframes str
 */
function t_animateSbs__generateKeyframes__getTxtStyles(keyframes) {
	
	var keyframesStr = '';
	for (var j = 0; j < keyframes.length; j++) {
		if (typeof keyframes[j].changes === 'undefined') {
			keyframes[j].changes = t_animateSbs__generateKeyframes__getFrameChanges(keyframes[j]);
		}
		keyframesStr += keyframes[j].percent + '% {' + keyframes[j].changes + '}\n';
	}
	return keyframesStr;
}

/**
 * @param {object} keyframe - current keyframe
 * @returns {string} - styles
 */
function t_animateSbs__generateKeyframes__getFrameChanges(keyframe) {
	var stepChanges = '';
	var transformChanges = '';
	var scaleChanges = {x: 1, y: 1, changed: false};
	
	for (var style in keyframe.styles) {
		switch (style) {
			case 'opacity':
				stepChanges += 'opacity:' + keyframe.styles.opacity + ';';
				break;
			// case 'blur':
			//     stepChanges += 'filter:blur(' + keyframe.styles.blur + 'px);';
			//     break;
			case 'scaleX':
				scaleChanges.x = keyframe.styles.scaleX;
				scaleChanges.changed = true;
				break;
			case 'scaleY':
				scaleChanges.y = keyframe.styles.scaleY;
				scaleChanges.changed = true;
				break;
			case 'moveX':
				transformChanges += 'translateX(' + keyframe.styles.moveX + 'px)';
				break;
			case 'moveY':
				transformChanges += 'translateY(' + keyframe.styles.moveY + 'px)';
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


//TODO unused function
function t_animateSbs__generateKeyframes__reverseObj(keyframes) {
	var reversed = [];
	for (var i = (keyframes.length - 1); i >= 0; i--) {
		var frame = {
			percent: (100 - keyframes[i].percent),
			changes: keyframes[i].changes,
		};
		reversed.push(frame);
	}
	return reversed;
}

/**
 * change element
 *
 * @param {HTMLElement} el - current element
 * @param {object} elState - element state
 */
function t_animateSbs__triggerScrollAnim__changeEl(el, elState) {
	var zoomValue = t_animationSbs__getZoom(el);
	if (t_animationSbs__isOnlyScalableElem()) {
		zoomValue = 1 / zoomValue;
	}
	if (elState.fix === true && el.wrapperEl && el.wrapperEl.style.position !== 'fixed') {
		var top = el.triggerOffset - elState.prevUnfixedDist;
		el.wrapperEl.style.top = top + 'px';
		el.wrapperEl.style.position = 'fixed';
		
		// workaround for Safari
		// move z-index from parent elem to fixed tn-atom__sbs-anim-wrapper,
		// cause Safari doesn't render properly fixed element inside absolute positioned parent with
		// z-index
		
		if (el.zIndexVal) {
			el.wrapperEl.style.zIndex = el.zIndexVal;
		}
	}
	if (elState.fix === false && el.wrapperEl && el.wrapperEl.style.position === 'fixed') {
		el.wrapperEl.style.position = '';
		el.wrapperEl.style.top = '';
		el.wrapperEl.style.zIndex = '';
		
		if (el.zIndexVal) {
			el.style.zIndex = el.zIndexVal;
		}
	}
	if (elState.opacity !== null && el.wrapperEl) {
		el.wrapperEl.style.opacity = elState.opacity;
	}
	
	// if (elState.blur !== null) {
	//  el.wrapperEl.css("filter","blur("+elState.blur+"px)");
	//  }
	
	var trVal = '';
	if (elState.translateX) {
		var translateXValue = elState.translateX;
		if (t_animationSbs__isOnlyScalableElem()) translateXValue = translateXValue / zoomValue;
		trVal += 'translateX(' + translateXValue + 'px)';
	}
	
	if (elState.translateY !== 0 || elState.fixedShiftY !== 0) {
		if (t_animationSbs__isOnlyScalableElem()) {
			trVal += 'translateY(' + (elState.translateY + elState.fixedShiftY) + 'px)';
		} else {
			trVal += 'translateY(' + (elState.translateY / zoomValue + elState.fixedShiftY / zoomValue) +
				'px)';
		}
	}
	if (elState.scaleX !== 1 || elState.scaleY !== 1) {
		trVal += 'scale(' + elState.scaleX + ',' + elState.scaleY + ')';
	}
	if (elState.rotate !== 0) {
		trVal += 'rotate(' + elState.rotate + 'deg)';
	}
	if (el.wrapperEl) {
		el.wrapperEl.style.transform = trVal;
		if (trVal !== '') {
			el.wrapperEl.style.transform = trVal;
		} else {
			el.wrapperEl.style.transform = 'scale(1)';
		}
	}
}

/**
 * calculate style
 *
 * @param {object} elState - current element state
 * @param {object} curStep - current step
 * @param {number} percentage - percents
 * @returns {void}
 */
function t_animateSbs__triggerScrollAnim__calcStyle(elState, curStep, percentage) {
	if (curStep.styles.fix === true && curStep.state === 'started') {
		elState.fix = true;
		elState.fixedShiftY = 0;
	}
	if (curStep.styles.fix === true && curStep.state === 'finished') {
		elState.fix = false;
		elState.fixedShiftY += curStep.dist * 1;
	}
	if (curStep.styles.fix === true && curStep.state === 'unactive') {
		if (curStep.index > 0 && elState.fix === true) {
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
 * get options publish mode
 *
 * @param {HTMLElement} el - current element
 * @returns {string | void} - attr or undefined if data-animate-mobile !== y
 */
function t_animateSbs__getOptsPublishMode(el) {
	var opts;
	var viewportWidth = window.innerWidth;
	
	if (viewportWidth >= 1200) {
		return el.getAttribute('data-animate-sbs-opts');
	}
	
	if (el.getAttribute('data-animate-mobile') !== 'y') return;
	
	if (viewportWidth >= 960) {
		opts = el.getAttribute('data-animate-sbs-opts-res-960');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts');
		return opts;
	}
	if (viewportWidth >= 640) {
		opts = el.getAttribute('data-animate-sbs-opts-res-640');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts-res-960');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts');
		return opts;
	}
	if (viewportWidth >= 480) {
		opts = el.getAttribute('data-animate-sbs-opts-res-480');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts-res-640');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts-res-960');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts');
		return opts;
	}
	if (viewportWidth >= 320) {
		opts = el.getAttribute('data-animate-sbs-opts-res-320');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts-res-480');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts-res-640');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts-res-960');
		if (!opts) opts = el.getAttribute('data-animate-sbs-opts');
		return opts;
	}
}

/**
 * @param {HTMLElement} el - current element
 * @returns {string} - attr value
 */
function t_animateSbs__getOptsEditMode(el) {
	var opts;
	var viewportWidth = window.tn.curResolution;
	
	if (viewportWidth >= 1200) {
		return el.getAttribute('data-field-sbsopts-value');
	}
	
	if (viewportWidth >= 960) {
		opts = el.getAttribute('data-field-sbsopts-res-960-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-value');
		return opts;
	}
	if (viewportWidth >= 640) {
		opts = el.getAttribute('data-field-sbsopts-res-640-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-res-960-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-value');
		return opts;
	}
	if (viewportWidth >= 480) {
		opts = el.getAttribute('data-field-sbsopts-res-480-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-res-640-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-res-960-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-value');
		return opts;
	}
	if (viewportWidth >= 320) {
		opts = el.getAttribute('data-field-sbsopts-res-320-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-res-480-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-res-640-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-res-960-value');
		if (!opts) opts = el.getAttribute('data-field-sbsopts-value');
		return opts;
	}
}

/**
 * @param {HTMLElement} el - current element
 * @returns {string} - attr
 */
function t_animateSbs__getTriggetElems(el) {
	var elements;
	var viewportWidth = window.innerWidth;
	
	if (viewportWidth >= 1200) {
		return el.getAttribute('data-animate-sbs-trgels');
	}
	
	if (viewportWidth >= 960) {
		elements = el.getAttribute('data-animate-sbs-trgels-res-960');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels');
		return elements;
	}
	if (viewportWidth >= 640) {
		elements = el.getAttribute('data-animate-sbs-trgels-res-640');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels-res-960');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels');
		return elements;
	}
	if (viewportWidth >= 480) {
		elements = el.getAttribute('data-animate-sbs-trgels-res-480');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels-res-640');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels-res-960');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels');
		return elements;
	}
	if (viewportWidth >= 320) {
		elements = el.getAttribute('data-animate-sbs-trgels-res-320');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels-res-480');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels-res-640');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels-res-960');
		if (!elements) elements = el.getAttribute('data-animate-sbs-trgels');
		return elements;
	}
}

/**
 * cash elements data
 *
 * @param {object} opts - options
 */
function t_animateSbs__cashElsData(opts) {
	var elements = opts.els;
	opts.triggerElemsAttrName = (opts.mode === 'edit') ?
		'data-field-sbstrgels-value' :
		'data-animate-sbs-trgels';
	
	for (var i = 0; i < elements.length; i++) {
		var el = elements[i];
		var zoomValue = t_animationSbs__getZoom(el);
		el.state = 'unactive';
		el.animType = (opts.mode === 'edit') ? el.getAttribute('data-field-sbsevent-value') :
			el.getAttribute('data-animate-sbs-event');
		el.changeType = (el.animType === 'scroll') ? 'scroll' : 'time';
		el.trigger = (opts.mode === 'edit') ? el.getAttribute('data-field-sbstrg-value') :
			el.getAttribute('data-animate-sbs-trg');
		el.trigger = (el.trigger) ? el.trigger : 1;
		el.triggerElems = t_animateSbs__getTriggetElems(el);
		el.wrapperEl = el.querySelector('.tn-atom__sbs-anim-wrapper');
		el.steps = [];
		var stringOpts;
		stringOpts = (opts.mode === 'edit')
			? t_animateSbs__getOptsEditMode(el)
			: t_animateSbs__getOptsPublishMode(el);
		if (!stringOpts) continue;
		
		if (stringOpts.indexOf('fixed') !== -1) {
			el.zIndexVal = window.getComputedStyle(el).getPropertyValue('z-index');
		}
		
		stringOpts = stringOpts.replace(/'/g, '"');
		var objSteps = JSON.parse(stringOpts);
		t_animateSbs__addDelayStepsToStepsArr(objSteps);
		
		el.loop = (opts.mode === 'edit') ? el.getAttribute('data-field-sbsloop-value') :
			el.getAttribute('data-animate-sbs-loop');
		
		t_animateSbs__cashElsTopOffset(el, opts);
		
		var totalUnfixedDist = 0;
		for (var j = 0; j < objSteps.length; j++) {
			var curStep = {};
			curStep.state = 'unactive';
			curStep.styles = t_animateSbs__getStylesObj(objSteps[j]);
			
			if (el.changeType === 'scroll') {
				curStep.prevUnfixedDist = totalUnfixedDist;
				curStep.dist = objSteps[j].di * zoomValue;
				if (curStep.styles.fix === false) {
					totalUnfixedDist += Number(curStep.dist);
				}
				curStep.start = (j === 0) ? el.topOffset : el.steps[j - 1].end;
				curStep.end = curStep.start + curStep.dist * 1;
			} else {
				curStep.time = objSteps[j].ti;
				curStep.ease = objSteps[j].ea;
			}
			el.steps.push(curStep);
		}
		
		t_animateSbs__updateInfoOnImgLoad(el, opts);
		t_animateSbs__recalcStepsStylesDiff(el.steps);
	}
}

/**
 * update info img onload
 *
 * @param {HTMLElement} el - current element
 * @param {object} opts - options
 */
function t_animateSbs__updateInfoOnImgLoad(el, opts) {
	var images = el.querySelectorAll('img');
	Array.prototype.forEach.call(images, function (img) {
		img.addEventListener('load', function () {
			t_animateSbs__cashElsTopOffset(el, opts);
			if (el.changeType === 'scroll') {
				t_animateSbs__updateStepsStartValues(el);
			}
		});
		if (img.complete) {
			t_animateSbs__cashElsTopOffset(el, opts);
			if (el.changeType === 'scroll') {
				t_animateSbs__updateStepsStartValues(el);
			}
		}
	});
}

/**
 * update steps start value
 *
 * @param {HTMLElement} el - current element
 */
function t_animateSbs__updateStepsStartValues(el) {
	for (var j = 0; j < el.steps.length; j++) {
		var curStep = el.steps[j];
		curStep.start = (j === 0) ? el.topOffset : el.steps[j - 1].end;
		curStep.end = curStep.start + curStep.dist * 1;
	}
}

/**
 * @param {HTMLElement} el - current element
 * @param {object} opts - options
 */
function t_animateSbs__cashElsTopOffset(el, opts) {
	if ((el.animType === 'scroll' || el.animType === 'intoview' || el.animType === 'blockintoview') &&
		opts.mode === 'publish') {
		var elTopPos = parseInt(el.style.top);
		var elRecParent = el.closest('.r');
		var recTopOffset = elRecParent ? elRecParent.getBoundingClientRect().top + window.pageYOffset :
			0;
		el.blockTopOffset = recTopOffset;
		el.topOffset = recTopOffset + elTopPos;
		t_animateSbs__getElTrigger(el);
	}
}

/**
 * add delay to steps
 *
 * @param {object[]} objSteps - steps
 */
function t_animateSbs__addDelayStepsToStepsArr(objSteps) {
	for (var j = 0; j < objSteps.length; j++) {
		var step = objSteps[j];
		if ((!step.dd || step.dd === '0') && (!step.dt || step.dt === '0')) continue;
		
		// duplicate previous step to emulate delay for animation
		var prevStep = (j !== 0) ? t_animateSbs__cloneStep(objSteps[j - 1]) : {
			'mx': '0',
			'my': '0',
			'sx': '1',
			'sy': '1',
			'op': '1',
			'ro': '0',
			'bl': '0',
			'ea': '',
		};
		
		if (typeof step.dt !== 'undefined') {
			prevStep.ti = step.dt;
		} else {
			prevStep.di = step.dd;
		}
		
		objSteps.splice(j, 0, prevStep);
		j++;
	}
}

/**
 * @param {{mx, my, sx, sy, op, ro, bl, ea, fi}} step - step
 * @returns {object} - new step
 */
function t_animateSbs__cloneStep(step) {
	return {
		mx: step.mx,
		my: step.my,
		sx: step.sx,
		sy: step.sy,
		op: step.op,
		ro: step.ro,
		bl: step.bl,
		ea: step.ea,
	};
}

/**
 * @param {{styles}[]} steps - steps
 */
function t_animateSbs__recalcStepsStylesDiff(steps) {
	var sumMoveX = steps[0].styles.moveX;
	var sumMoveY = steps[0].styles.moveY;
	var sumRotate = steps[0].styles.rotate;
	for (var i = 1; i < steps.length; i++) {
		var curS = steps[i].styles;
		curS.moveX = curS.moveX - sumMoveX;
		sumMoveX += curS.moveX;
		curS.moveY = curS.moveY - sumMoveY;
		sumMoveY += curS.moveY;
		curS.rotate = curS.rotate - sumRotate;
		sumRotate += curS.rotate;
	}
}

/**
 * @param {{mx, my, sx, sy, op, ro, bl, ea, fi}} step - step
 * @returns {{moveX, moveY, scaleX, scaleY, opacity, rotate, blur, fix}} - styles
 */
function t_animateSbs__getStylesObj(step) {
	var styles = {};
	styles.moveX = (typeof step.mx != 'undefined') ? step.mx * 1 : 0;
	styles.moveY = (typeof step.my != 'undefined') ? step.my * 1 : 0;
	styles.scaleX = (typeof step.sx != 'undefined') ? step.sx * 1 : 1;
	styles.scaleY = (typeof step.sy != 'undefined') ? step.sy * 1 : 1;
	styles.opacity = (typeof step.op != 'undefined') ? step.op * 1 : 1;
	styles.rotate = (typeof step.ro != 'undefined') ? step.ro * 1 : 0;
	styles.blur = (typeof step.bl != 'undefined') ? step.bl * 1 : 0;
	styles.fix = (typeof step.fi != 'undefined' && step.fi === 'fixed');
	return styles;
}

/**
 * @param {HTMLElement & {triggerOffset, topOffset, animType, blockTopOffset, trigger}} el -
 *   current element
 */
function t_animateSbs__getElTrigger(el) {
	var winHeight = window.innerHeight;
	var zoomValue = 1;
	if (t_animationSbs__isOnlyScalableElem()) {
		zoomValue = t_animationSbs__getZoom(el);
	}
	el.triggerOffset = el.getAttribute('data-animate-sbs-trgofst') * zoomValue;
	el.triggerOffset = el.triggerOffset ? Number(el.triggerOffset) : 0;
	if (+el.trigger === 0.5) {
		el.triggerOffset += winHeight / 2;
		if ((el.animType === 'intoview' || el.animType === 'scroll') && el.triggerOffset >
			el.topOffset && el.triggerOffset <= winHeight / 2) {
			el.triggerOffset = el.topOffset;
		}
		if (el.animType === 'blockintoview' && el.triggerOffset > el.blockTopOffset &&
			el.triggerOffset <= winHeight / 2) {
			el.triggerOffset = el.blockTopOffset;
		}
	}
	if (+el.trigger === 1) {
		el.triggerOffset += winHeight;
		if ((el.animType === 'intoview' || el.animType === 'scroll') && el.triggerOffset >
			el.topOffset && el.triggerOffset <= winHeight) {
			el.triggerOffset = el.topOffset;
		}
		if (el.animType === 'blockintoview' && el.triggerOffset > el.blockTopOffset &&
			el.triggerOffset <= winHeight) {
			el.triggerOffset = el.blockTopOffset;
		}
	}
}

/**
 * trigger time animation
 *
 * @param {object} opts - options
 */
function t_animateSbs__triggerTimeAnim(opts) {
	var elsIntoview = Array.prototype.filter.call(opts.els, function (el) {
		return (el.getAttribute('data-animate-sbs-event') === 'intoview' ||
			el.getAttribute('data-animate-sbs-event') === 'blockintoview');
	});
	t_animateSbs__checkIntoviewEls(opts, elsIntoview);
	window.addEventListener('scroll', t_throttle(function () {
		t_animateSbs__checkIntoviewEls(opts, elsIntoview);
	}, 200));
	t_animateSbs__onActions__initClick(opts);
	t_animateSbs__onActions__initHover(opts);
}

/**
 * @param {object} opts - options
 */
function t_animateSbs__onActions__initClick(opts) {
	var elsClick = Array.prototype.filter.call(opts.els, function (el) {
		return el.getAttribute('data-animate-sbs-event') === 'click';
	});
	var elsClickTrgs = {};
	t_animateSbs__onActions__connectTrgrsWithAnimatedEls(elsClick, elsClickTrgs, 'click');
	var triggerClickElements = document.querySelectorAll('.js-sbs-anim-trigger_click');
	Array.prototype.forEach.call(triggerClickElements, function (triggerClickElement) {
		triggerClickElement.style.cursor = 'pointer';
	});
	
	var onClickCallback = function () {
		var elements = elsClick;
		if (window.innerWidth < 1200) {
			Array.prototype.filter.call(elements, function (el) {
				return el.getAttribute('data-animate-mobile') === 'y';
			});
		}
		var isStarted = elements[0] ? elements[0].classList.contains('t-sbs-anim_started') &&
			!elements[0].classList.contains('t-sbs-anim_reversed') : null;
		if (isStarted) {
			t_animateSbs__onActions__end(elements);
		} else {
			t_animateSbs__onActions__start(elements);
		}
	};
	
	// catch click events on triggers
	Array.prototype.forEach.call(triggerClickElements, function (triggerClickElement) {
		triggerClickElement.removeEventListener('click', onClickCallback);
		triggerClickElement.addEventListener('click', onClickCallback);
	});
}

/**
 *
 * @param {object} opts - options
 */
function t_animateSbs__onActions__initHover(opts) {
	var elsHover = Array.prototype.filter.call(opts.els, function (el) {
		return el.getAttribute('data-animate-sbs-event') === 'hover';
	});
	var elsHoverTrgs = {};
	t_animateSbs__onActions__connectTrgrsWithAnimatedEls(elsHover, elsHoverTrgs, 'hover');
	
	var onEnterCallBack = function (e) {
		var elements = e.target['data-els-to-animate-on-hover'];
		t_animateSbs__onActions__start(elements);
	};
	
	var onLeaveCallBack = function (e) {
		var elements = e.target['data-els-to-animate-on-hover'];
		t_animateSbs__onActions__end(elements);
	};
	
	// catch hover events on triggers
	var triggerHoverElements = document.querySelectorAll('.js-sbs-anim-trigger_hover');
	Array.prototype.forEach.call(triggerHoverElements, function (triggerHoverElement) {
		triggerHoverElement.removeEventListener('mouseenter', onEnterCallBack);
		triggerHoverElement.removeEventListener('mouseleave', onLeaveCallBack);
		triggerHoverElement.addEventListener('mouseenter', onEnterCallBack);
		triggerHoverElement.addEventListener('mouseleave', onLeaveCallBack);
	});
}

/**
 * @param {array} elements - filtered elements
 * @param {object} trgElsObj - trigger elements object
 * @param {string} type - type
 */
function t_animateSbs__onActions__connectTrgrsWithAnimatedEls(elements, trgElsObj, type) {
	Array.prototype.forEach.call(elements, function (el) {
		var idsStr = el.triggerElems;
		if (!idsStr) {
			var selfTriggerNode = el.querySelector('.tn-atom__sbs-anim-wrapper');
			selfTriggerNode['data-els-to-animate-on-' + type] = [];
			selfTriggerNode['data-els-to-animate-on-' + type].push(el);
			selfTriggerNode.classList.add('js-sbs-anim-trigger_' + type);
		} else {
			var idsArr = idsStr ? idsStr.split(',') : [];
			var parentArtboard = el.closest('.t396__artboard');
			var recId = parentArtboard ? parentArtboard.getAttribute('data-artboard-recid') : null;
			// iterate via all triggers
			idsArr.forEach(function (id) {
				var elemUniqueId = recId + id;
				var elTrigger = document.querySelector('.tn-elem__' + recId + id);
				// user could add a link to trigger element and delete it
				// so, we need to check, if it exists
				if (elTrigger) {
					// cash links to animated elems in triggers data
					if (trgElsObj[elemUniqueId] &&
						trgElsObj[elemUniqueId]['data-els-to-animate-on-' + type]) {
						trgElsObj[elemUniqueId]['data-els-to-animate-on-' + type].push(el);
					} else {
						trgElsObj[elemUniqueId] = elTrigger;
						trgElsObj[elemUniqueId].classList.add('js-sbs-anim-trigger_' + type);
						trgElsObj[elemUniqueId]['data-els-to-animate-on-' + type] = [];
						trgElsObj[elemUniqueId]['data-els-to-animate-on-' + type].push(el);
					}
				}
			});
		}
	});
}

/**
 * @param {HTMLElement[]} elements - element
 */
function t_animateSbs__onActions__start(elements) {
	Array.prototype.forEach.call(elements, function (el) {
		if (el.classList.contains('t-sbs-anim_playing')) {
			el.setAttribute('data-planned-dir', 'play');
		} else {
			t_animateSbs__onActions__play(el);
		}
	});
}

/**
 * @param {HTMLElement[]} elements - elements
 */
function t_animateSbs__onActions__end(elements) {
	Array.prototype.forEach.call(elements, function (el) {
		if (el.getAttribute('data-animate-sbs-loop') === 'loop') {
			// elements with loop animation should stop animation after the and of current iteration
			el.onanimationiteration = function () {
				el.classList.remove('t-sbs-anim_started', 't-sbs-anim_playing');
				this.onanimationiteration = null;
			};
		} else if (el.classList.contains('t-sbs-anim_playing')) {
			el.setAttribute('data-planned-dir', 'reverse');
		} else {
			t_animateSbs__onActions__playReverse(el);
		}
	});
}

/**
 * animation end event
 *
 * @param {HTMLElement} el - current element
 */
function t_animateSbs__onActions__onAnimationEnd(el) {
	var depAnimCallback = function () {
		el.classList.remove('t-sbs-anim_playing');
		el.removeEventListener('animationend', el['data-callback-dep-anim']);
		var plannedDirection = el.getAttribute('data-planned-dir');
		if (plannedDirection === 'play' && el.classList.contains('t-sbs-anim_reversed')) {
			t_animateSbs__onActions__play(el);
		} else if (plannedDirection === 'reverse' && !el.classList.contains('t-sbs-anim_reversed')) {
			t_animateSbs__onActions__playReverse(el);
		}
		el.setAttribute('data-planned-dir', '');
	};
	
	el.removeEventListener('animationend', depAnimCallback);
	el.addEventListener('animationend', depAnimCallback);
	el['data-callback-dep-anim'] = depAnimCallback;
}

/**
 * get animation time
 *
 * @param {HTMLElement} el - current element
 * @returns {number} - time
 */
function t_animateSbs__getAnimationTime(el) {
	var dataAnimateSbsOpts = el.getAttribute('data-animate-sbs-opts');
	var animateSbsOpts = dataAnimateSbsOpts ?
		JSON.parse(el.getAttribute('data-animate-sbs-opts').split('\'').join('"')) : [];
	var time = 0;
	for (var i = 0; i < animateSbsOpts.length; i++) {
		var element = animateSbsOpts[i];
		time += parseInt(element.ti);
	}
	return time;
}

/**
 * play animation on action
 *
 * @param {HTMLElement} el - current element
 */
function t_animateSbs__onActions__play(el) {
	el.classList.remove('t-sbs-anim_started', 't-sbs-anim_reversed');
	t_animateSbs__forceRepaint(el);
	var animTime = t_animateSbs__getAnimationTime(el);
	var classListValues = ['t-sbs-anim_started'];
	if (animTime > 0) {
		classListValues.push('t-sbs-anim_playing');
	}
	classListValues.forEach(function (className) {
		el.classList.add(className);
	});
	t_animateSbs__onActions__onAnimationEnd(el);
}

/**
 * play reverse animation
 *
 * @param {HTMLElement} el - current element
 */
function t_animateSbs__onActions__playReverse(el) {
	el.classList.remove('t-sbs-anim_started');
	t_animateSbs__forceRepaint(el);
	var animTime = t_animateSbs__getAnimationTime(el);
	var classListValues = ['t-sbs-anim_started', 't-sbs-anim_reversed'];
	if (animTime > 0) {
		classListValues.push('t-sbs-anim_playing');
	}
	classListValues.forEach(function (className) {
		el.classList.add(className);
	});
	t_animateSbs__onActions__onAnimationEnd(el);
}

/**
 * by default animation wouldn't be played twice
 * if we want to restart it — we need to force an element to be repainted
 *
 * @param {HTMLElement} el - current Element
 */
function t_animateSbs__forceRepaint(el) {
	el.offsetWidth;
}

/**
 * @param {object} opts - options
 * @param {HTMLElement[]} elsIntoview - filterd elements placed in viewport
 * @returns  {void}
 */
function t_animateSbs__checkIntoviewEls(opts, elsIntoview) {
	if (elsIntoview && elsIntoview.length) {
		opts.scrollTop = window.pageYOffset;
		elsIntoview.filter(function (el) {
			var trigger = opts.scrollTop + el.triggerOffset;
			var isAfterStart = el.animType === 'blockintoview' ? trigger >= el.blockTopOffset :
				trigger >= el.topOffset;
			if (isAfterStart && !el.classList.contains('t-sbs-anim_started')) {
				el.classList.add('t-sbs-anim_started');
				return false;
			}
			return true;
		});
	}
}

/**
 * @returns {boolean} - is old ie?
 */
function t_animateParallax__checkOldIE() {
	var sAgent = window.navigator.userAgent;
	var Idx = sAgent.indexOf('MSIE');
	var ieVersion = '';
	var oldIE = false;
	if (Idx > 0) {
		ieVersion = parseInt(sAgent.substring(Idx + 5, sAgent.indexOf('.', Idx)));
		if (ieVersion === 8 || ieVersion === 9) {
			oldIE = true;
		}
	}
	return oldIE;
}

/**
 * @returns {boolean} - is only scalable el
 */
function t_animationSbs__isOnlyScalableElem() {
	var isFirefox = navigator.userAgent.search('Firefox') !== -1;
	// eslint-disable-next-line no-undef
	var isOpera = (!!window.opr && !!opr.addons) || !!window.opera ||
		navigator.userAgent.indexOf(' OPR/') >= 0;
	
	return isFirefox || isOpera;
}

/**
 * get zoom value
 *
 * @param {*} el - current element
 * @returns {string} - scale factor
 */
function t_animationSbs__getZoom(el) {
	var zoomValue = 1;
	var artboard = el.closest('.t396__artboard');
	if (artboard.classList.contains('t396__artboard_scale')) {
		zoomValue = window.tn_scale_factor;
	}
	return zoomValue;
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
		var atomElements = wrappingEl.querySelector('.tn-atom');
		if (atomElements && !atomElements.closest('.tn-atom__sbs-anim-wrapper')) {
			t_animateSbs__wrapEl(atomElements, 'tn-atom__sbs-anim-wrapper');
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
	opts.triggerElemsAttrName = (opts.mode === 'edit') ?
		'data-field-sbstrgels-value' :
		'data-animate-sbs-trgels';
	Array.prototype.forEach.call(elements, function (el) {
		el.state = 'unactive';
		el.animType = (opts.mode === 'edit') ? el.getAttribute('data-field-sbsevent-value') :
			el.getAttribute('data-animate-sbs-event');
		el.changeType = (el.animType === 'scroll') ? 'scroll' : 'time';
		el.trigger = (opts.mode === 'edit') ? el.getAttribute('data-field-sbstrg-value') :
			el.getAttribute('data-animate-sbs-trg');
		el.trigger = el.trigger ? el.trigger : 1;
		el.triggerElems = el.getAttribute(opts.triggerElemsAttrName);
		el.wrapperEl = el.querySelector('.tn-atom__sbs-anim-wrapper');
		el.steps = [];
		var stringOpts = (opts.mode === 'edit') ? el.getAttribute('data-field-sbsopts-value') :
			el.getAttribute('data-animate-sbs-opts');
		if (stringOpts) {
			if (stringOpts.indexOf('fixed') !== -1) {
				el.zIndexVal = window.getComputedStyle(el).getPropertyValue('z-index');
			}
			
			stringOpts = stringOpts.replace(/'/g, '"');
			var objSteps = JSON.parse(stringOpts);
			t_animateSbs__addDelayStepsToStepsArr(objSteps);
			
			el.loop = (opts.mode === 'edit') ? el.getAttribute('data-field-sbsloop-value') :
				el.getAttribute('data-animate-sbs-loop');
			t_animateSbs__cashElsTopOffset(el, opts);
			var totalUnfixedDist = 0;
			for (var j = 0; j < objSteps.length; j++) {
				var curStep = {};
				curStep.state = 'unactive';
				curStep.styles = t_animateSbs__getStylesObj(objSteps[j]);
				if (el.changeType === 'scroll') {
					curStep.prevUnfixedDist = totalUnfixedDist;
					curStep.dist = objSteps[j].di;
					if (curStep.styles.fix === false) {
						totalUnfixedDist += Number(curStep.dist);
					}
					curStep.start = (j === 0) ? el.topOffset : el.steps[j - 1].end;
					curStep.end = curStep.start + curStep.dist * 1;
				} else {
					curStep.time = objSteps[j].ti;
					curStep.ease = objSteps[j].ea;
				}
				el.steps.push(curStep);
			}
			t_animateSbs__updateInfoOnImgLoad(el, opts);
			t_animateSbs__recalcStepsStylesDiff(el.steps);
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
		if (type === 'intoview' ||
			type === 'blockintoview' ||
			type === 'click' ||
			type === 'hover') {
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
 * analog of promise
 *
 * @param {string} funcName - checked function
 * @param {Function} okFunc - main working function
 * @param {number} time - duration of delay
 */
function t_animateSbs__onFuncLoad(funcName, okFunc, time) {
	if (typeof window[funcName] === 'function') {
		okFunc();
	} else {
		setTimeout(function checkFuncExist() {
			if (typeof window[funcName] === 'function') {
				okFunc();
				return;
			}
			if (document.readyState === 'complete' && typeof window[funcName] !== 'function') {
				throw new Error(funcName + ' is undefined');
			}
			setTimeout(checkFuncExist, time || 100);
		});
	}
}

/**
 * wrap element (analog $.wrap())
 * @param {HTMLElement} el - current Element
 * @param {string} className - class of wrapped el
 */
function t_animateSbs__wrapEl(el, className) {
	if (!el) return false;
	var parent = el.parentNode;
	var div = document.createElement('div');
	div.classList.add(className);
	div.style.display = 'table';
	div.style.width = 'inherit';
	div.style.height = 'inherit';
	var clonedEl = el.cloneNode(true);
	div.appendChild(clonedEl);
	if (parent) {
		parent.appendChild(div);
		parent.removeChild(el);
	}
}

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
