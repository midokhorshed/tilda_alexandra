/**
 * tilda-animation 
 * работает в блоках, где анимация может быть подключена к его элементам - заголовок, подзаголовок,
 * анимированные цифры и т.д.
 */

/**
 * tilda-animation
 * work with:
 *  - basicly animated elements like: titles, subtitles, paragraphs, buttons (fadeIn, fadeInTop, fadeInBottom, fadeInLeft, fadeInRight etc.)
 *  - numbers animation (for blocks CL19, FR402, FR403, FR501 etc)
 *  - basic animation in Zero Block, but fixing and parallax doing tilda-animation-ext
 * 	
 * 
 * how does it work by steps
 * 1) check the document readystate if it is not 'loading' than start init otherwise wait for DOMContentLoaded
 * 2) init function
 * 		- check all cases when we need to turn off animation
 * 		- wrap all text elements with custom opacity
 * 		- add no hover class to btns
 * 		- check for animation type fadeInLeft if they it exists than added overflow-x: hidden to #allrecords 
 * 		- prepair all elements with number animation
 * 			- replace number part with span with 0
 * 			- dublicate all el styles to new span
 * 3) start animation function after 1.5s delay
 * 		- get all animated blocks/elems into 3 Node lists
 * 			1) grouped animation blocks
 * 			2) chain animation blocks
 * 			3) other animation elements
 * 		- if there is a mobile device than additionally check 
 * 		  and remove animation class (.t-animate) from all blocks
 * 		  except elements in zero-block with mobile animtion turned on
 * 		- set state for all animated groups of blocks depends on their position on the screen
 * 			1) grouped animation blocks
 * 			2) chain animation blocks
 * 			3) other animation elements  
 * 		- regroup animated groups of blocks
 * 		- if the intersection observer is exist than set it, special observer for each array EXCEPT CHAIN ANIMMATION (grouped, other els)
 * 		- for chain animation we set scroll event on window 
 * 			we check first element in chain array and add it class t-animate__chain_first-in-row,
 * 			to let the new row be animated as soon, as the first element in previous row is animated 
 *  	
 */


t_onReady(t_animate__init);

/**
 * Init animation
 *
 * @returns {void} - if user stay in edit mode, animation off, etc.
 */
function t_animate__init() {
	// check if we need to turn off animation
	if(!t_animate__checkAnimationAvailability()) return;

	// wrap animated text elements with custom opacity  
	t_animate__wrapTextWithOpacity();

	// adding t-animate_no-hover to animated btns
	t_animate__addNoHoverClassToBtns();

	// check for fadeInLeft elements
	t_animate__preventHorizontalScroll();

	// prepair number for animation
	if (window.innerWidth >= 1200) {
		t_animate__parseNumberText();
	}
	// start animation using setTimeout because 
	// if don't than animation will be triggered 
	// immediately and some styles/images may be not downloaded yet
	setTimeout(function () {
		t_animate__startAnimation();
	}, 1500);
}

/**
 * Remove animation class from el, if element is not inside zeroBlock and ZB data-animate-mobile !== 'y'
 *
 * @param {HTMLElement[]} elems - animated elements in array
 * @returns {HTMLElement[]} - filtered elements array (without zeroBlock child)
 */
function t_animate__checkMobile(elems) {
	return Array.prototype.filter.call(elems, function(elem){
		var ZBParent = elem.closest('.t396__elem');
		var ZBAnimateMobile = ZBParent ? ZBParent.getAttribute('data-animate-mobile') : null;
		if (!ZBAnimateMobile) {
			elem.classList.remove('t-animate');
			return false;
		} else {
			return true;
		}
	});
}

/**
 * If there are some fadeInLeft animated elements
 * than added to their parent (not ZB) overflow-x: hidden
 * @param {HTMLElement} allRec - t-recordes element
 */

function t_animate__preventHorizontalScroll() {
	// prevent page from horizontal scroll
	var allRec = document.querySelector('.t-records');
	var fadeInLeftEls = document.querySelectorAll('[data-animate-style=fadeinleft]');
	fadeInLeftEls = Array.prototype.filter.call(fadeInLeftEls, function (el) {
		return !(el.classList.contains('t396__elem'));
	});
	if (allRec && fadeInLeftEls.length) {
		allRec.style.overflowX = 'hidden';
	}
}

/**
 * Check if we need to turn off animmation on the page 
 * @returns {Boolean} 
 */
function t_animate__checkAnimationAvailability() {
	var allRec = document.querySelector('.t-records');
	var animationOff = allRec ? allRec.getAttribute('data-blocks-animationoff') : null;
	var editMode = allRec ? allRec.getAttribute('data-tilda-mode') : null;

	// turning off animmation
	if (/Bot/i.test(navigator.userAgent) || animationOff === 'yes' || t_animate__checkIE() || editMode === 'edit') {
		var animationList = document.querySelectorAll('.t-animate');
		Array.prototype.forEach.call(animationList, function (animation) {
			animation.classList.remove('t-animate');
		});
		return false;
	}

	return true;
}

/**
 * Start animation
 *
 * @returns {void} - if some elements cannot find
 */
function t_animate__startAnimation() {
	var records = document.querySelectorAll('.r');

	// animGroupsBlocks contains connected elements, which animation starts at the same time
	var animGroupsBlocks = Array.prototype.filter.call(records, function (record) {
		return record.querySelector('.t-animate[data-animate-group=yes]');
	});

	// animChainsBlocks contains elements, which are animated as a chain, row by row
	var animChainsBlocks = Array.prototype.filter.call(records, function (record) {
		return record.querySelector('.t-animate[data-animate-chain="yes"]');
	});

	// animElems contains independent single elements
	var animElems = document.querySelectorAll('.t-animate');
	animElems = Array.prototype.filter.call(animElems, function (animEl) {
		return !(animEl.getAttribute('data-animate-group') === 'yes' || animEl.getAttribute('data-animate-chain') === 'yes') && !animEl.getAttribute('observer-ready');
	});
	
	// upgrade list of animated blocks because of mobile resolution
	if (window.innerWidth < 1200) {
		animGroupsBlocks = t_animate__checkMobile(animGroupsBlocks);
		animChainsBlocks = t_animate__checkMobile(animChainsBlocks);
		animElems = t_animate__checkMobile(animElems);
	}

	// if there is no more blocks than quit
	if (!animGroupsBlocks.length && !animElems.length && !animChainsBlocks.length) {
		return;
	}

	// set state to all groups
	t_animate__setAnimationState(animGroupsBlocks, animChainsBlocks, animElems);

	animGroupsBlocks = t_animate__hasWaitAnimation(animGroupsBlocks);
	animElems = t_animate__hasWaitAnimation(animElems);
	animChainsBlocks = t_animate__hasWaitAnimation(animChainsBlocks);
	/**
	 * Conditionally apply a workaround for the CSS transition bug in Safari 15.4 / WebKit browsers.
	 * Remove this workaround once the WebKit bug fix is released.
	 * https://github.com/WebKit/WebKit/commit/068a5519f0216cac2e937dcff214ae843ae69a55
	 */
	var isWebKit154 = typeof navigator !== 'undefined' && /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) && /(os |version\/)15(.|_)[4-9]/i.test(navigator.userAgent);

	if ('IntersectionObserver' in window && !isWebKit154) {
		// groups
		if (animGroupsBlocks.length) {
			var animGroupsObserver = new IntersectionObserver(function (entries, animGroupsObserver) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						var target = entry.target;
						animGroupsObserver.unobserve(target);

						// code from function t_animate__animateGroups but without checking distance to top of the window 
						var currentBlockEls = target.querySelectorAll('.t-animate');

						// clear array from all chaining blocks
						currentBlockEls = Array.prototype.filter.call(currentBlockEls, function (el) {
							return !(el.classList.contains('t-animate__btn-wait-chain') || el.getAttribute('data-animate-chain') === 'yes');
						});
						t_animate__makeSectionButtonWait(target);
						t_animate__saveSectionHeaderStartTime(target);
						Array.prototype.forEach.call(currentBlockEls, function (el) {
							el.classList.remove('t-animate_wait');
							t_animate__removeNoHoverClassFromBtns(el);
							el.classList.add('t-animate_started');
						});
					}
				});
			});

			animGroupsBlocks.forEach(function (animGroup) {
				animGroupsObserver.observe(animGroup);
			});
		}

		// elems
		if (animElems.length) {
			animElems.forEach(function (animElem) {
				var options = {};
				var curElemTriggerOffset = t_animate__getAttrByResBase(animElem, 'trigger-offset');
				if (curElemTriggerOffset) {
					options.rootMargin = '0px 0px ' + curElemTriggerOffset.replace('px', '') * -1 + 'px 0px';
				}

				var animElemsObserver = new IntersectionObserver(function (entries, animElemsObserver) {
					entries.forEach(function (entry) {
						var target = entry.target;
						if (!target.demandTransform && target.style.transform) {
							target.demandTransform = target.style.transform;
							target.style.transform = 'unset';
						} else {
							var computedTransform = window.getComputedStyle(target).transform;
							if (!target.style.transform && computedTransform !== 'none') {
								target.demandTransform = computedTransform;
								target.style.transform = 'unset';
							}
						}

						if (entry.isIntersecting) {
							animElemsObserver.unobserve(target);

							var delay = target.style.transitionDelay || '0ms';
							if (delay.indexOf('ms') !== -1) {
								delay = parseInt(delay) + 250;
							} else {
								delay = parseFloat(delay) * 1000 + 250;
							}

							// code from function t_animate__animateElems
							var animateElems = function () {
								target.classList.remove('t-animate_wait');
								t_animate__removeNoHoverClassFromBtns(target);
								target.classList.add('t-animate_started');
								if (t_animate__getAttrByResBase(target, 'style') === 'animatednumber') {
									t_animate__animateNumbers(target);
								}
							};

							if (target.demandTransform && target.demandTransform.indexOf('matrix') !== -1) {
								target.style.transform = '';
							}

							if (target.demandTransform && target.style.transform === 'unset') {
								target.style.transform = target.demandTransform;
								delete target.demandTransform;
							}

							setTimeout(function () {
								animateElems();
							}, delay);
						}
					});
				}, options);

				animElem.dataset.observerReady = true;
				animElemsObserver.observe(animElem);
			});
		}

		// chains
		if (animChainsBlocks.length) {
			var getOffsets = function () {
				t_animate__getChainOffsets(animChainsBlocks);
			};
			getOffsets();
			window.addEventListener('resize', t_throttle(getOffsets));
			setInterval(getOffsets, 5000);
			window.addEventListener('scroll', t_throttle(function () {
				var viewTop = window.pageYOffset;
				var viewBottom = viewTop + window.innerHeight;
				t_animate__animateChainsBlocks(animChainsBlocks, viewBottom);
			}));
		}

	} else {
		
		// cache offsets
		var getOffsets = function () {
			t_animate__getGroupsOffsets(animGroupsBlocks);
			t_animate__getChainOffsets(animChainsBlocks);
			t_animate__getElemsOffsets(animElems);
		};
		getOffsets();
		window.addEventListener('resize', t_throttle(getOffsets));
		setInterval(getOffsets, 5000);
		// end of cache offsets
		window.addEventListener('scroll', t_throttle(function () {
			var refreshedBlocks = t_animate__deleteAnimatedEls(animGroupsBlocks, animElems);
			animElems = refreshedBlocks[0];
			animGroupsBlocks = refreshedBlocks[1];
			var animBlocks = t_animate__animateOnScroll(animGroupsBlocks, animChainsBlocks, animElems);
			if (animBlocks && animBlocks.length) {
				animGroupsBlocks = animBlocks[0];
				animChainsBlocks = animBlocks[1];
				animElems = animBlocks[2];
			}
		}));
	}

	Array.prototype.forEach.call(records, function (record) {
		var recordPopup = record.querySelector('.t-popup');
		if (recordPopup) {
			recordPopup.addEventListener('scroll', t_throttle(function () {
				var viewBottom = window.pageYOffset + window.innerHeight;
				if (recordPopup.classList.contains('t-animate') && recordPopup.getAttribute('data-animate-chain') === 'yes' ||
					recordPopup.querySelector('.t-animate[data-animate-chain=yes]')) {
					var popupAnimChainsBlocks = [recordPopup];
					t_animate__setAnimationStateChains(popupAnimChainsBlocks);
					popupAnimChainsBlocks = Array.prototype.filter.call(popupAnimChainsBlocks, function (el) {
						return el.querySelector('.t-animate_wait');
					});
					t_animate__getChainOffsets(popupAnimChainsBlocks);
					t_animate__animateChainsBlocks(popupAnimChainsBlocks, viewBottom);
				}
			}));
		}
	});
}


/* ---------- functions, which do all animation work on scroll ---------- */

/**
 * Animate on scroll. Called if IntersectionObserver is undefined
 *
 * @param {HTMLElement[]} animGroupsBlocks - list of animated group blocks
 * @param {HTMLElement[]} animChainsBlocks - list of animated chain blocks
 * @param {HTMLElement[]} animElems - list of animated elements
 * @returns {void}
 */
function t_animate__animateOnScroll(animGroupsBlocks, animChainsBlocks, animElems) {
	if (!animGroupsBlocks.length && !animChainsBlocks.length && !animElems.length) return;
	var viewTop = window.pageYOffset;
	var viewBottom = viewTop + window.innerHeight;
	var newAnimGroupsBlocks = t_animate__animateGroups(animGroupsBlocks, viewBottom, viewTop);
	var newAnimChainsBlocks = t_animate__animateChainsBlocks(animChainsBlocks, viewBottom, viewTop);
	var newAnimElems = t_animate__animateElems(animElems, viewBottom, viewTop);
	return [newAnimGroupsBlocks, newAnimChainsBlocks, newAnimElems];
}

/**
 * Animate grouped blocks. Called inside t_animate__animateOnScroll
 *
 * @param {HTMLElement[]} animGroupsBlocks - list of animated group blocks
 * @param {number} viewBottom - bottom position of viewport
 */
function t_animate__animateGroups(animGroupsBlocks, viewBottom) {
	animGroupsBlocks.forEach(function (currentBlock) {
		if (currentBlock.curTopOffset < viewBottom) {
			var currentBlockEls = currentBlock.querySelectorAll('.t-animate');
			currentBlockEls = Array.prototype.filter.call(currentBlockEls, function (el) {
				return !(el.classList.contains('t-animate__btn-wait-chain') || el.getAttribute('data-animate-chain') === 'yes');
			});
			t_animate__makeSectionButtonWait(currentBlock);
			t_animate__saveSectionHeaderStartTime(currentBlock);
			Array.prototype.forEach.call(currentBlockEls, function (currentBlockEl) {
				currentBlockEl.classList.remove('t-animate_wait');
				t_animate__removeNoHoverClassFromBtns(currentBlockEl);
				currentBlockEl.classList.add('t-animate_started');
			});
		}
	});

	return animGroupsBlocks;
}

/**
 * Animate chain blocks
 * @param {HTMLElement[]} animChainsBlocks - list of animation chain blocks
 * @param {number} viewBottom - bottom position of viewport
 */
function t_animate__animateChainsBlocks(animChainsBlocks, viewBottom) {
	animChainsBlocks.forEach(function (curBlock) {
		if (curBlock.itemsOffsets[0] < viewBottom && curBlock.querySelectorAll('.t-animate_wait').length) {
			t_animate__animateChainItemsOnScroll(curBlock, viewBottom);
			if (curBlock.itemsOffsets.length) {
				t_animate__checkSectionButtonAnimation__outOfTurn(curBlock);
			}
		}
	});

	return animChainsBlocks;
}

/**
 * Animate common elements. Called inside t_animate__animateOnScroll
 *
 * @param {HTMLElement[]} animElems - list of animated elements
 * @param {number} viewBottom - bottom position of viewport
 */
 function t_animate__animateElems(animElems, viewBottom, viewTop) {
	Array.prototype.filter.call(animElems, function (el) {
		var curElemTrigger = t_animate__detectElemTriggerOffset(el, viewBottom);
		if (el.curTopOffset < curElemTrigger) {
			el.classList.remove('t-animate_wait');
			t_animate__removeNoHoverClassFromBtns(el);
			el.classList.add('t-animate_started');
			if (t_animate__getAttrByResBase(el, 'style') === 'animatednumber') {
				t_animate__animateNumbers(el);
			}
			return true;
		}

		if (el.curTopOffset < viewTop) {
			return false;
		}
	});

	return animElems;
}

/**
 * Delete animated elements. Called inside t_animate__animateOnScroll
 * @param {HTMLElement[]} animGroupsBlocks - list of animation chain blocks
 * @param {HTMLElement[]} animElems - list of animation chain blocks
 * @returns 
 */
function t_animate__deleteAnimatedEls(animGroupsBlocks, animElems) {
	var viewTop = window.pageYOffset;
	var newAnimGroupsBlocks = [];
	var newAnimElems = [];
	animGroupsBlocks.forEach(function (animGroupsBlock) {
		if (animGroupsBlock.curTopOffset <= viewTop) {
			var animateElList = animGroupsBlock.querySelectorAll('.t-animate');
			Array.prototype.forEach.call(animateElList, function (animateEl) {
				animateEl.classList.remove('t-animate');
				animateEl.classList.remove('t-animate_wait');
				animateEl.classList.remove('t-animate_no-hover');
			});
		} else {
			newAnimGroupsBlocks.push(animGroupsBlock);
		}
	});
	animElems.forEach(function (animElem) {
		if (animElem.curTopOffset <= viewTop) {
			animElem.classList.remove('t-animate');
			animElem.classList.remove('t-animate_no-hover');
		} else {
			newAnimElems.push(animElem);
		}
	});
	return [newAnimElems, newAnimGroupsBlocks];
}

/**
 * Animate chain blocks. (part of t_animate__animateChainsBlocks)
 * @param {HTMLElement & {itemsOffsets}} curBlock - current block
 * @param {number} viewBottom - bottom position of viewport
 */
function t_animate__animateChainItemsOnScroll(curBlock, viewBottom) {
	var waitingChainItems = curBlock.querySelectorAll('.t-animate_wait[data-animate-chain=yes]');
	waitingChainItems = Array.prototype.slice.call(waitingChainItems);
	var itemOrder = 0;
	var rowOrder = 0;
	var rowOffset = curBlock.itemsOffsets[0];
	var chainDelay = 0.16;
	var delayFromPrevScroll = t_animate__getDelayFromPreviousScrollEvent(curBlock, chainDelay);
	var sectionHeadDelay = t_animate__getSectionHeadDealy(curBlock);
	// we add class t-animate__chain_first-in-row to items, to let the new row be animated as soon, as the first element in
	// previous row is animated
	if (waitingChainItems.length) waitingChainItems[0].classList.add('t-animate__chain_first-in-row');
	for (var s = 0; s < waitingChainItems.length; s++) {
		var item = waitingChainItems[s];
		var itemTopOffset = curBlock.itemsOffsets[s];
		if (itemTopOffset < viewBottom) {
			if (itemTopOffset !== rowOffset) {
				// if we check next row at the same scroll event
				item.classList.add('t-animate__chain_first-in-row');
				rowOrder++;
				// itemOrder = rowOrder - next row animation starts earlier, right after first item in prevoius one
				itemOrder = rowOrder;
				rowOffset = itemTopOffset;
			}
			// start item animation, set delay
			var curItemDelay = itemOrder * chainDelay + delayFromPrevScroll + sectionHeadDelay;
			item.style.transitionDelay = curItemDelay + 's';
			item.classList.remove('t-animate_wait');
			item.classList.add('t-animate_started');
			item.setAttribute('data-animate-start-time', (Date.now() + curItemDelay * 1000));
			if (item[0] === waitingChainItems[waitingChainItems.length - 1]) {
				t_animate__checkSectionButtonAnimation(curBlock, curItemDelay);
			}
			if (+itemTopOffset === +rowOffset) {
				itemOrder++;
			}
			// remove animated cached chain items and offsets
			waitingChainItems.splice(s, 1);
			curBlock.itemsOffsets.splice(s, 1);
			s--;
		} else {
			break;
		}
	}
	t_animate__catchTransitionEndEvent(curBlock);
}

/**
 * Get section head delay. Used for chain blocks only
 *
 * @param {HTMLElement} curBlock - current element
 * @returns {number} - section head delay
 */
function t_animate__getSectionHeadDealy(curBlock) {
	var sectionTitle = curBlock.querySelector('.t-section__title.t-animate');
	var sectionDescr = curBlock.querySelector('.t-section__descr.t-animate');
	var sectionHeadDelay = 0;
	if (sectionTitle) {
		var titleStartTime = sectionTitle.getAttribute('data-animate-start-time') || 0;
		if ((Date.now() - titleStartTime) <= 160) {
			sectionHeadDelay = 0.16;
			return sectionHeadDelay;
		}
	}
	if (sectionDescr) {
		var descrStartTime = sectionDescr.getAttribute('data-animate-start-time') || 0;
		if ((Date.now() - descrStartTime) <= 160) {
			sectionHeadDelay = 0.16;
			return sectionHeadDelay;
		}
	}
	return sectionHeadDelay;
}

/**
 * In this function we count delay, if chain items from this block on previous scroll event didn't finish its transition
 *
 * @param {HTMLElement} curBlock - current element
 * @param {number} chainDelay - chain delay
 * @returns {number} - number of delay
 */
function t_animate__getDelayFromPreviousScrollEvent(curBlock, chainDelay) {
	var isFirstRow = !curBlock.querySelectorAll('.t-animate_started').length;
	var notAnimated = curBlock.querySelectorAll('.t-animate__chain_first-in-row.t-animate_started');
	notAnimated = Array.prototype.filter.call(notAnimated, function (notAnim) {
		return !notAnim.classList.contains('t-animate__chain_showed');
	});
	// return, if it is the first element in chain or all the items are already animated
	if (isFirstRow || !notAnimated.length) {
		return 0;
	}
	if (notAnimated.length) {
		var lastNotAnimated = notAnimated[notAnimated.length - 1];
		var lastNotAnimatedStart = lastNotAnimated.getAttribute('data-animate-start-time') || 0;
		var timeGap = lastNotAnimatedStart - Date.now();
		if (timeGap <= 0) {
			return chainDelay;
		} else {
			return (timeGap / 1000 + chainDelay);
		}
	}
}

/**
 * Animate chain blocks on event (transitionend)
 *
 * @param {HTMLElement} curBlock - current element
 */
function t_animate__catchTransitionEndEvent(curBlock) {
	var animateChainList = curBlock.querySelectorAll('.t-animate__chain_first-in-row.t-animate_started');
	animateChainList = Array.prototype.filter.call(animateChainList, function (animChain) {
		return !animChain.classList.contains('t-animate__chain_showed');
	});
	Array.prototype.forEach.call(animateChainList, function (animateChain) {
		var events = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'otransitionend', 'MSTransitionEnd'];
		events.forEach(function (event) {
			animateChain.addEventListener(event, function () {
				t_animate__addEventOnAnimateChain(animateChain);
			});
			animateChain.removeEventListener(event, function () {
				t_animate__addEventOnAnimateChain(animateChain);
			});
		});
	});
}

/* ---------- functions, for animated number ---------- */

/**
 * parse number text
 * for the first time define a number and replace it with span with 0 in it
 * also duplicate styles from main element to span
 *
 */
function t_animate__parseNumberText() {
	var viewTop = window.pageYOffset;
	var animElemsNumber = document.querySelectorAll('.t-animate[data-animate-style=\'animatednumber\']');
	Array.prototype.forEach.call(animElemsNumber, function (curElem) {
		var text;
		var style = '';
		var spanList = curElem.querySelectorAll('span');

		Array.prototype.forEach.call(spanList, function (span) {
			style += span.getAttribute('style') || '';
			span.removeAttribute('style');
			span.removeAttribute('data-redactor-style');
		});

		if (curElem.querySelectorAll('div[data-customstyle="yes"]').length) {
			var customStyleYes = curElem.querySelector('div[data-customstyle="yes"]');
			text = customStyleYes ? customStyleYes.innerHTML : '';
			var newStyle = curElem.getAttribute('style') || '';
			var customStyleEl = curElem.querySelector('div[data-customstyle]');
			var customStyleElStyle = customStyleEl ? customStyleEl.getAttribute('style') : '';
			if (customStyleElStyle) {
				newStyle += customStyleElStyle;
			}
			curElem.setAttribute('style', newStyle);
		} else {
			text = curElem.innerHTML;
		}

		// remove duplicate styles
		style = style.split(';').filter(function (element, index) {
			return style.split(';').indexOf(element) === index;
		}).join(';');

		// don't parse elems, who is above viewport and won't be animated
		if (curElem.getBoundingClientRect().top + window.pageYOffset < (viewTop - 500)) {
			return;
		}

		if (text.length) {
			var number = text.replace(/<br>/g, ' ').replace(/[^\d., ]+/g, '').replace(/ (\.|,)/g, '').replace(/(\d)(?=\d) /g, '$1')
				.trim();
			var removeNumberSpace = number;

			if (text.indexOf(number) === -1) {
				number = number.split(' ')[0]; // >2000+ м3
				removeNumberSpace = number;
			}
			if (number !== '') {
				curElem.setAttribute('data-animate-number-count', text);
				t_animate__changeNumberOnZero(curElem, text.replace(removeNumberSpace, 'num'));

				var notAnimatedNumbers = curElem.querySelectorAll('span');
				notAnimatedNumbers = Array.prototype.filter.call(notAnimatedNumbers, function (notAnimNumber) {
					return !notAnimNumber.classList.contains('.t-animate__number');
				});
				Array.prototype.forEach.call(notAnimatedNumbers, function (notAnimatedNumber) {
					notAnimatedNumber.setAttribute('style', style);
				});
			}
		}
	});
}

/**
 * Append to element span.t-animate__number
 *
 * @param {HTMLElement} el - current element
 * @param {string} removeNumberSpace - remove number space
 */
function t_animate__changeNumberOnZero(el, removeNumberSpace) {
	el.innerHTML = removeNumberSpace.replace(/num/g, '<span class="t-animate__number">' + 0 + '</span>');
}

/**
 * Mainn function to animate numbers 
 *
 * @param {HTMLElement} curElem - current element
 * @returns {false} - if current element is not defined
 */
function t_animate__animateNumbers(curElem) {
	if (!curElem) return false;
	var text = curElem.getAttribute('data-animate-number-count');
	var style = [];
	var notAnimatedNumbers = curElem.querySelectorAll('span');
	notAnimatedNumbers = Array.prototype.filter.call(notAnimatedNumbers, function (notAnimNumber) {
		return !notAnimNumber.classList.contains('.t-animate__number');
	});
	if (notAnimatedNumbers.length) {
		style = notAnimatedNumbers[0].getAttribute('style') || '';
	}

	var number = [];
	var numberDotOrComma = null;
	if (text) {
		numberDotOrComma = text.match(/\d+\.\d+|\d+,\d+/g);
		var numberWithSpace = text.match(/\d+/g);
		var removeNumberSpace = text.replace(/(\d)(?= \d) /g, '$1');

		var numberWithoutLetter = removeNumberSpace.split(' ');

		numberWithoutLetter.forEach(function (item) {
			if (!isNaN(parseInt(item.replace(/[^\d., ]+/g, ''), 10))) {
				number.push(item.replace(/[^\d., ]+/g, ''));
			}
		});
	}

	var decimalLength = 0;
	var isFloat = false;
	var isComma = false;
	curElem.removeAttribute('data-animate-number-count');

	if (numberDotOrComma !== null) {
		isComma = numberDotOrComma[0].indexOf(',') !== -1;
	}

	number.forEach(function (item, i) {
		if (numberDotOrComma !== null) {
			var itemSplitArr;
			if (item.indexOf(',') !== -1) {
				itemSplitArr = item.split(',');
			}
			if (item.indexOf('.') !== -1) {
				itemSplitArr = item.split('.');
			}
			if (item.indexOf(',') !== -1 || item.indexOf('.') !== -1) {
				decimalLength = itemSplitArr[1].length;
				number[i] = +itemSplitArr.join('.');
				isFloat = true;
			}
		}
	});

	var animatedNumber = curElem.querySelector('.t-animate__number');
	if (number[0]) {
		var maxNum = Number(number[0]) || 0;
		var startNum = 0;
		var round = Math.pow(10, decimalLength);
		if (isFloat) {
			maxNum *= round;
			startNum *= round;
		}
		// value in ms of one iteration which increasing the startNum
		var timer = 12;
		var animationStep = 0;
		var interval = setInterval(function () {
			// 9 - to create round value without zero as last number in value [from 1000 to 1111]
			startNum += maxNum / (timer * 9);

			if (isFloat) {
				animationStep = (Math.round(startNum) / round).toFixed(decimalLength) + '';
			} else {
				animationStep = Math.floor(startNum) + '';
			}

			if (numberWithSpace.length > 1) {
				animationStep = animationStep.replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
			}
			if (isComma) {
				animationStep = animationStep.replace(/\./g, ',');
			}
			if (animatedNumber) animatedNumber.textContent = animationStep;
			if (startNum >= maxNum) {
				clearInterval(interval);
				curElem.innerHTML = text;
				var curElSpan = curElem.querySelectorAll('span');
				Array.prototype.forEach.call(curElSpan, function (span) {
					span.setAttribute('style', style);
				});
			}
		}, timer);
	}
}


/* ---------- functions, which set animation state after DOMContentLoaded ---------- */

/**
 * Set animation state
 *
 * @param {HTMLElement[]} animGroupsBlocks - animated group block list
 * @param {HTMLElement[]} animChainsBlocks - animated chain block list
 * @param {HTMLElement[]} animElems - animated elements list
 */
function t_animate__setAnimationState(animGroupsBlocks, animChainsBlocks, animElems) {
	var viewTop = window.pageYOffset;
	var viewBottom = viewTop + window.innerHeight;
	
	t_animate__setGroupsBlocksState(animGroupsBlocks, viewTop, viewBottom);

	animChainsBlocks.forEach(function (curBlock) {
		t_animate__assignChainDelay(curBlock, viewBottom, viewTop);
		t_animate__checkSectionButtonAnimation__outOfTurn(curBlock);
	});

	t_animate__setAnimELemsState(animElems, viewTop, viewBottom);

	window.addEventListener('resize', t_throttle(t_animate__removeInlineAnimStyles));
}

/**
 * Set state for animElems group
 * @param {HTMLElement[]} animElems - animated elements list
 * @param {number} viewTop 
 * @param {number} viewBottom 
 */
function t_animate__setAnimELemsState(animElems, viewTop, viewBottom) {
	animElems.forEach(function (curElem) {
		var curElemOffsetTop = curElem.getBoundingClientRect().top + window.pageYOffset;
		if (curElemOffsetTop < (viewTop - 500)) {
			curElem.classList.remove('t-animate');
			curElem.classList.remove('t-animate_no-hover');

			// fix for numbers with anchor link
			if (t_animate__getAttrByResBase(curElem, 'style') === 'animatednumber') {
				t_animate__animateNumbers(curElem);
			}

			return true;
		}
		var curElemTrigger = t_animate__detectElemTriggerOffset(curElem, viewBottom);
		t_animate__setCustomAnimSettings(curElem, curElemOffsetTop, viewBottom);
		if (curElemOffsetTop < curElemTrigger) {
			t_animate__removeNoHoverClassFromBtns(curElem);
			curElem.classList.add('t-animate_started');
			if (t_animate__getAttrByResBase(curElem, 'style') === 'animatednumber') {
				t_animate__animateNumbers(curElem);
			}
		}
		if (curElemOffsetTop >= curElemTrigger) {
			curElem.classList.add('t-animate_wait');
		}
	});
}

/**
 * Set state for animGroupsBlocks group
 * @param {HTMLElement[]} animGroupsBlocks - animated group elements list
 * @param {number} viewTop 
 * @param {number} viewBottom 
 */
function t_animate__setGroupsBlocksState(animGroupsBlocks, viewTop, viewBottom) {
	animGroupsBlocks.forEach(function (curBlock) {
		var curBlockAnimElems = curBlock.querySelectorAll('.t-animate');
		curBlockAnimElems = Array.prototype.filter.call(curBlockAnimElems, function (animEl) {
			return !(animEl.getAttribute('data-animate-chain') === 'yes');
		});
		var curBlockOffset = curBlock.getBoundingClientRect().top + window.pageYOffset;
		t_animate__removeAnimFromHiddenSlides(curBlock);
		var sectionHeadDelay = t_animate__assignSectionDelay(curBlock);
		t_animate__assignGroupDelay(curBlock, sectionHeadDelay);
		Array.prototype.forEach.call(curBlockAnimElems, function (el) {
			var parentIsHidden = el.closest('.t397__off') || el.closest('.t395__off') || el.closest('.t400__off');
			if (el.classList.contains('t-animate_no-hover') && parentIsHidden) {
				el.classList.remove('t-animate_no-hover');
			}
			if (curBlockOffset <= (viewTop - 100)) {
				t_animate__saveSectionHeaderStartTime(curBlock);
				el.classList.remove('t-animate');
				el.classList.remove('t-animate_no-hover');
				el.style.transitionDelay = '';
				return true;
			}
			if (curBlockOffset < viewBottom && curBlockOffset > (viewTop - 100)) {
				// if button is part of section with chain animation, it should wait till the end of chain animation
				t_animate__makeSectionButtonWait(curBlock);
				if (!el.classList.contains('.t-animate__btn-wait-chain')) {
					t_animate__removeNoHoverClassFromBtns(el);
					if (parentIsHidden) {
						el.classList.add('t-animate_wait');
					} else {
						el.classList.add('t-animate_started');
					}
				}
			}
			if (curBlockOffset >= viewBottom) {
				el.classList.add('t-animate_wait');
			}
		});
	});
}

/**
 * Set animation state for animChainsBlocks group
 *
 * @param {HTMLElement[] | NodeList} animChainsBlocks - animated chain blocks
 */
function t_animate__setAnimationStateChains(animChainsBlocks) {
	if (!animChainsBlocks || !animChainsBlocks.length) return false;
	var viewTop = window.pageYOffset;
	var viewBottom = viewTop + window.innerHeight;
	Array.prototype.forEach.call(animChainsBlocks, function (curBlock) {
		t_animate__assignChainDelay(curBlock, viewBottom, viewTop);
		t_animate__checkSectionButtonAnimation__outOfTurn(curBlock);
	});
}

/**
 * Return section head delay. Used for animGroupsBlocks
 *
 * @param {HTMLElement} curBlock - current element
 * @returns {number} - section head delay
 */
function t_animate__assignSectionDelay(curBlock) {
	var sectionHeadDelay = 0;
	var sectionTitle = curBlock.querySelectorAll('.t-section__title.t-animate');
	var sectionDescr = curBlock.querySelectorAll('.t-section__descr.t-animate');
	if (sectionTitle.length) {
		sectionHeadDelay = 0.16;
	}
	if (sectionDescr.length) {
		Array.prototype.forEach.call(sectionDescr, function (descr) {
			descr.style.transitionDelay = sectionHeadDelay + 's';
		});
		sectionHeadDelay += 0.16;
	}
	return sectionHeadDelay;
}

/**
 * Add style transition-delay for current element. 
 * Depends on which elements are in current block
 * @param {HTMLElement} curBlock - current block
 * @param {number} sectionHeadDelay - delay
 */
function t_animate__assignGroupDelay(curBlock, sectionHeadDelay) {
	var animDelay = 0;
	if (curBlock.querySelectorAll('[data-animate-order]').length) {
		t_animate__assignOrderedElemsDelay(curBlock, sectionHeadDelay);
	} else {
		var elemImg = curBlock.querySelectorAll('.t-img.t-animate');
		var elemSubtitle = curBlock.querySelectorAll('.t-uptitle.t-animate');
		var elemTitle = curBlock.querySelectorAll('.t-title.t-animate');
		elemTitle = Array.prototype.filter.call(elemTitle, function (title) {
			return !(title.classList.contains('t-section__title'));
		});
		var elemDescr = curBlock.querySelectorAll('.t-descr.t-animate');
		elemDescr = Array.prototype.filter.call(elemDescr, function (descr) {
			return !(descr.classList.contains('t-section__descr'));
		});
		var elemBtn = curBlock.querySelectorAll('.t-btn.t-animate, .t-btnwrapper.t-animate');
		elemBtn = Array.prototype.filter.call(elemBtn, function (descr) {
			return !(descr.closest('.t-section__bottomwrapper'));
		});
		var elemTimer = curBlock.querySelectorAll('.t-timer.t-animate');
		var elemForm = curBlock.querySelectorAll('form.t-animate');
		if (elemImg.length) {
			animDelay = 0.5;
		}
		if (elemTitle.length) {
			Array.prototype.forEach.call(elemTitle, function (title) {
				title.style.transitionDelay = animDelay + 's';
			});
		}
		if (elemTitle.length) {
			animDelay = animDelay + 0.3;
		}
		if (elemDescr.length) {
			Array.prototype.forEach.call(elemDescr, function (descr) {
				descr.style.transitionDelay = animDelay + 's';
			});
		}
		if (elemDescr.length) {
			animDelay = animDelay + 0.3;
		}
		if (elemSubtitle.length) {
			Array.prototype.forEach.call(elemSubtitle, function (subTitle) {
				subTitle.style.transitionDelay = animDelay + 's';
			});
		}
		if (elemSubtitle.length) {
			animDelay = animDelay + 0.3;
		}
		if (elemSubtitle.length || elemTitle.length || elemDescr.length) {
			animDelay = animDelay + 0.2;
		}
		if (elemTimer.length) {
			Array.prototype.forEach.call(elemTimer, function (timer) {
				timer.style.transitionDelay = animDelay + 's';
			});
		}
		if (elemTimer.length) {
			animDelay = animDelay + 0.5;
		}
		if (elemBtn.length) {
			elemBtn[0].style.transitionDelay = animDelay + 's';
		}
		if (elemBtn.length === 2) {
			animDelay = animDelay + 0.4;
		}
		if (elemBtn.length === 2) {
			elemBtn[1].style.transitionDelay = animDelay + 's';
		}
		if (elemForm.length !== 0) {
			Array.prototype.forEach.call(elemForm, function (form) {
				form.style.transitionDelay = animDelay + 's';
			});
		}
	}
}

/**
 * Add style transition-delay for animated el with [data-animate-order]
 *
 * @param {HTMLElement} curBlock - currentl element
 * @param {number} sectionHeadDelay - delay
 */
function t_animate__assignOrderedElemsDelay(curBlock, sectionHeadDelay) {
	var animDelay = 0;
	if (sectionHeadDelay) {
		animDelay = sectionHeadDelay;
	}

	var elem1 = curBlock.querySelectorAll('.t-animate[data-animate-order="1"]');
	var elem2 = curBlock.querySelectorAll('.t-animate[data-animate-order="2"]');
	var elem3 = curBlock.querySelectorAll('.t-animate[data-animate-order="3"]');
	var elem4 = curBlock.querySelectorAll('.t-animate[data-animate-order="4"]');
	var elem5 = curBlock.querySelectorAll('.t-animate[data-animate-order="5"]');
	var elem6 = curBlock.querySelectorAll('.t-animate[data-animate-order="6"]');
	var elem7 = curBlock.querySelectorAll('.t-animate[data-animate-order="7"]');
	var elem8 = curBlock.querySelectorAll('.t-animate[data-animate-order="8"]');
	var elem9 = curBlock.querySelectorAll('.t-animate[data-animate-order="9"]');
	if (elem1.length) {
		Array.prototype.forEach.call(elem1, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if (elem1.length && elem2.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem2[0], 'delay') * 1;
		Array.prototype.forEach.call(elem2, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length) && elem3.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem3[0], 'delay') * 1;
		Array.prototype.forEach.call(elem3, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length || elem3.length) && elem4.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem4[0], 'delay') * 1;
		Array.prototype.forEach.call(elem4, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length || elem3.length || elem4.length) && elem5.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem5[0], 'delay') * 1;
		Array.prototype.forEach.call(elem5, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length || elem3.length || elem4.length || elem5.length) && elem6.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem6[0], 'delay') * 1;
		Array.prototype.forEach.call(elem6, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length || elem3.length || elem4.length || elem5.length || elem6.length) && elem7.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem7[0], 'delay') * 1;
		Array.prototype.forEach.call(elem7, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length || elem3.length || elem4.length || elem5.length || elem6.length || elem7.length) &&
		elem8.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem8[0], 'delay') * 1;
		Array.prototype.forEach.call(elem8, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
	if ((elem1.length || elem2.length || elem3.length || elem4.length || elem5.length || elem6.length || elem7.length ||
			elem8.length) && elem9.length) {
		animDelay = animDelay + t_animate__getAttrByResBase(elem9[0], 'delay') * 1;
		Array.prototype.forEach.call(elem9, function (el) {
			el.style.transitionDelay = animDelay + 's';
		});
	}
}

/**
 * Set the delay for chain animation
 * @param {HTMLElement} curBlock - current block
 * @param {number} viewBottom - bottom position of viewport
 * @param {number} viewTop  - current element offset top
 */
function t_animate__assignChainDelay(curBlock, viewBottom, viewTop) {
	var chain = curBlock.querySelectorAll('.t-animate[data-animate-chain=yes]');
	var itemOrder = 0;
	if (chain.length) {
		var chainEl = chain[0];
		var rowOffset = chainEl.getBoundingClientRect().top + window.pageYOffset;
		chainEl.classList.add('t-animate__chain_first-in-row');
		var sectionHeadDelay = t_animate__getCurBlockSectionHeadDelay(curBlock);
		Array.prototype.forEach.call(chain, function (curItem) {
			var curItemOffset = curItem.getBoundingClientRect().top + window.pageYOffset;
			if (curItemOffset < viewTop) {
				curItem.classList.remove('t-animate');
				return true;
			}
			if (curItemOffset < viewBottom) {
				if (curItemOffset !== rowOffset) {
					curItem.classList.add('t-animate__chain_first-in-row');
					rowOffset = curItemOffset;
				}
				var curItemDelay = itemOrder * 0.16 + sectionHeadDelay;
				curItem.style.transitionDelay = curItemDelay + 's';
				curItem.classList.add('t-animate_started');
				curItem.setAttribute('data-animate-start-time', (Date.now() + curItemDelay * 1000));
				if (chainEl === chain[chain.length - 1]) {
					t_animate__checkSectionButtonAnimation(curBlock, curItemDelay);
				}
				itemOrder++;
				var events = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'otransitionend', 'MSTransitionEnd'];
				events.forEach(function (event) {
					curItem.addEventListener(event, function () {
						t_animate__addEventOnAnimateChain(curItem);
					});
					curItem.removeEventListener(event, function () {
						t_animate__addEventOnAnimateChain(curItem);
					});
				});
			} else {
				curItem.classList.add('t-animate_wait');
			}
		});
	}
}


/* ---------- some helper functions ---------- */

/**
 * Get element, check if its parent is zeroBlock 
 * and return animated attribute depends on
 * the clients device resolution 
 * (320<->480<->640<->960<->1200<-)
 *
 * @param {HTMLElement} el - animated el
 * @param {string} attr - animate param
 * @returns {string | null} - if element has animated param from second arg in data-attr, return string, else - null
 */
 function t_animate__getAttrByResBase(el, attr) {
	var width = window.isMobile ? document.documentElement.clientWidth : window.innerWidth;

	var attrValue;

	if (width >= 1200) {
		attrValue = el.getAttribute('data-animate-' + attr);
		return attrValue;
	}

	var parentZeroBlock = el.closest('.t396__elem');
	var parentZeroBlockAnimateMob = parentZeroBlock ? parentZeroBlock.getAttribute('data-animate-mobile') : null;
	if (parentZeroBlockAnimateMob !== 'y') {
		el.style.transition = 'none';
		return null;
	}

	if (width >= 960) {
		attrValue =
			el.getAttribute('data-animate-' + attr + '-res-960') ||
			el.getAttribute('data-animate-' + attr);
		return attrValue;
	}
	if (width >= 640) {
		attrValue =
			el.getAttribute('data-animate-' + attr + '-res-640') ||
			el.getAttribute('data-animate-' + attr + '-res-960') ||
			el.getAttribute('data-animate-' + attr);
		return attrValue;
	}
	if (width >= 480) {
		attrValue =
			el.getAttribute('data-animate-' + attr + '-res-480') ||
			el.getAttribute('data-animate-' + attr + '-res-640') ||
			el.getAttribute('data-animate-' + attr + '-res-960') ||
			el.getAttribute('data-animate-' + attr);
		return attrValue;
	}
	if (width >= 320) {
		attrValue =
			el.getAttribute('data-animate-' + attr + '-res-320') ||
			el.getAttribute('data-animate-' + attr + '-res-480') ||
			el.getAttribute('data-animate-' + attr + '-res-640') ||
			el.getAttribute('data-animate-' + attr + '-res-960') ||
			el.getAttribute('data-animate-' + attr);
		return attrValue;
	}
}

/**
 * Filter Array of HTMLElements, if the element or its children contains .t-animate_wait 
 *
 * @param {HTMLElement[]} elementsArray - list of elements
 * @returns {HTMLElement[]} - filtered Array
 */
function t_animate__hasWaitAnimation(elementsArray) {
	return elementsArray.filter(function (el) {
		return el.classList.contains('t-animate_wait') || el.querySelector('.t-animate_wait');
	});
}

/**
 * Add event on transitionend
 *
 * @param {HTMLElement} el - current element
 */
function t_animate__addEventOnAnimateChain(el) {
	el.classList.add('t-animate__chain_showed');
}

/**
 * Add custom anim style for animElems group
 * @param {HTMLElement} curElem - current element
 * @param {number} curElemOffsetTop - current element offset top
 * @param {number} viewBottom - bottom position
 */
function t_animate__setCustomAnimSettings(curElem, curElemOffsetTop, viewBottom) {
	//check element custom distance
	var curElemStyle = t_animate__getAttrByResBase(curElem, 'style');
	var curElemDistance = t_animate__getAttrByResBase(curElem, 'distance');
	if (curElemDistance && curElemDistance !== '') {
		curElemDistance = curElemDistance.replace('px', '');
		// to add new position fast, without transition duration, we need set it to 0s
		curElem.style.transitionDuration = '0s';
		curElem.style.transitionDelay = '0s';

		switch (curElemStyle) {
			case 'fadeinup':
				curElem.style.transform = 'translate3d(0,' + curElemDistance + 'px,0)';
				break;
			case 'fadeindown':
				curElem.style.transform = 'translate3d(0,-' + curElemDistance + 'px,0)';
				break;
			case 'fadeinleft':
				curElem.style.transform = 'translate3d(' + curElemDistance + 'px,0,0)';
				break;
			case 'fadeinright':
				curElem.style.transform = 'translate3d(-' + curElemDistance + 'px,0,0)';
				break;
			default:
				break;
		}

		t_animate__forceElemInViewPortRepaint(curElem, curElemOffsetTop, viewBottom);

		// remove 0s transition duration
		curElem.style.transitionDuration = '';
		curElem.style.transitionDelay = '';
	}
	// check element custom scale
	var curElemScale = t_animate__getAttrByResBase(curElem, 'scale');
	if (curElemScale) {
		//to add new position fast, without transition duration, we need set it to 0s
		curElem.style.transitionDuration = '0s';
		curElem.style.transitionDelay = '0s';
		curElem.style.transform = 'scale(' + curElemScale + ')';

		t_animate__forceElemInViewPortRepaint(curElem, curElemOffsetTop, viewBottom);

		// remove 0s transition duration
		curElem.style.transitionDuration = '';
		curElem.style.transitionDelay = '';
	}
	// detect element delay
	var curElemDelay = t_animate__getAttrByResBase(curElem, 'delay');
	if (curElemDelay) {
		curElem.style.transitionDelay = curElemDelay + 's';
	}
	// detect element transirtion duration
	var curElemDuration = t_animate__getAttrByResBase(curElem, 'duration');
	if (curElemDuration) {
		curElem.style.transitionDuration = curElemDuration + 's';
	}
}

/**
 * Remove inline animated styles for ZB elements in screen < 980px
 */
function t_animate__removeInlineAnimStyles() {
	if (window.innerWidth < 980) {
		var animatedElements = document.querySelectorAll('.t396__elem.t-animate:not(.t-animate_wait)');
		Array.prototype.forEach.call(animatedElements, function (animatedElement) {
			animatedElement.style.transform = '';
			animatedElement.style.transitionDuration = '';
			animatedElement.style.transitionDelay = '';
		});
	}
}

/**
 * Force repaint element
 *
 * @param {HTMLElement} curElem - current element
 * @param {number} curElemOffsetTop - number of offset
 * @param {number} viewBottom - number of offset
 */
function t_animate__forceElemInViewPortRepaint(curElem, curElemOffsetTop, viewBottom) {
	if (curElem && (curElemOffsetTop < (viewBottom + 500))) {
		curElem.offsetHeight;
	}
}

/**
 * Calculate trigger offset for animElems group
 * @param {HTMLElement} curElem - current element
 * @param {number} viewBottom - bottom position of viewport
 * @returns {number} - curElemTrigger - difference between viewBottom and current el offset top
 */
function t_animate__detectElemTriggerOffset(curElem, viewBottom) {
	var curElemTriggerOffset = t_animate__getAttrByResBase(curElem, 'trigger-offset');
	var curElemTrigger = viewBottom;
	if (curElemTriggerOffset) {
		curElemTriggerOffset = curElemTriggerOffset.replace('px', '');
		curElemTrigger = viewBottom - curElemTriggerOffset * 1;
	}
	return curElemTrigger;
}

/**
 * Set attributes for title and description to save 
 * animation start time (to set right delay for chain items)
 *
 * @param {HTMLElement} curBlock - current block
 */
function t_animate__saveSectionHeaderStartTime(curBlock) {
	var sectionTitle = curBlock.querySelectorAll('.t-section__title.t-animate');
	var sectionDescr = curBlock.querySelectorAll('.t-section__descr.t-animate');
	if (sectionTitle.length) {
		Array.prototype.forEach.call(sectionTitle, function (title) {
			title.setAttribute('data-animate-start-time', Date.now());
		});
	}
	if (sectionDescr.length) {
		Array.prototype.forEach.call(sectionDescr, function (descr) {
			descr.setAttribute('data-animate-start-time', Date.now() + 160);
		});
	}
}

/**
 * Add section head delay if current block has animated title or descr
 *
 * @param {HTMLElement} curBlock - current block
 * @returns {number} - of sectionHeadDelay
 */
function t_animate__getCurBlockSectionHeadDelay(curBlock) {
	var sectionHeadDelay = 0;
	if (curBlock.querySelectorAll('.t-section__title.t-animate').length) {
		sectionHeadDelay += 0.16;
	}
	if (curBlock.querySelectorAll('.t-section__descr.t-animate').length) {
		sectionHeadDelay += 0.16;
	}
	return sectionHeadDelay;
}

/**
 * Add wait class to btn if it is a part of chain animation
 * @param {HTMLElement} curBlock - block contains [data-animate-chain=yes]
 */
function t_animate__makeSectionButtonWait(curBlock) {
	var chainLength = curBlock.querySelectorAll('.t-animate[data-animate-chain=yes]').length;
	var sectionBtn = curBlock.querySelectorAll('.t-section__bottomwrapper .t-btn.t-animate');
	if (chainLength.length && sectionBtn.length) {
		Array.prototype.forEach.call(sectionBtn, function (btn) {
			btn.classList.add('t-animate__btn-wait-chain');
		});
	}
}


/**
 * Add animation to btn if it has t-animate__btn-wait-chain
 *
 * @param {HTMLElement} curBlock - block contains animated btn
 * @param {number} curItemDelay - current delay
 */
function t_animate__checkSectionButtonAnimation(curBlock, curItemDelay) {
	var chainBtn = curBlock.querySelectorAll('.t-animate__btn-wait-chain');
	if (chainBtn.length) {
		Array.prototype.forEach.call(chainBtn, function (btn) {
			btn.style.transitionDelay = (curItemDelay + 0.16) + 's';
			t_animate__removeNoHoverClassFromBtns(btn);
			btn.classList.remove('t-animate__btn-wait-chain');
			btn.classList.add('t-animate_started');
		});
	}
}

/**
 * Add chainDelay if current block not contains chain items
 *
 * @param {HTMLElement} curBlock - current block
 */
function t_animate__checkSectionButtonAnimation__outOfTurn(curBlock) {
	var waitingChainItems = curBlock.querySelectorAll('.t-animate[data-animate-chain=yes]');
	waitingChainItems = Array.prototype.filter.call(waitingChainItems, function (chain) {
		return !(chain.classList.contains('t-animate_started'));
	});
	if (!waitingChainItems.length) {
		var chainDelay = 0.16;
		t_animate__checkSectionButtonAnimation(curBlock, chainDelay);
	}
}

/**
 * Add no-hover class to btn
 */
function t_animate__addNoHoverClassToBtns() {
	var animatedBtns = document.querySelectorAll('.t-btn.t-animate');
	Array.prototype.forEach.call(animatedBtns, function (btn) {
		btn.classList.add('t-animate_no-hover');
	});
}

/**
 * Add event to .t-btn on transitionend after which remove transition-delay&transition-duration and t-animate_no-hover class
 *
 * @param {HTMLElement} curBlockAnimElem - current el
 * @returns {false} - if current el is not defined
 */
function t_animate__removeNoHoverClassFromBtns(curBlockAnimElem) {
	if (!curBlockAnimElem) return false;
	var currentBtn = curBlockAnimElem.classList.contains('t-btn') ? curBlockAnimElem : null;
	if (currentBtn) {
		currentBtn.ontransitionend = function (e) {
			if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
				currentBtn.classList.remove('t-animate_no-hover');
				currentBtn.style.transitionDelay = '';
				currentBtn.style.transitionDuration = '';
				this.ontransitionend = null;
			}
		};
	}
}

/**
 * For group animation add equal offset (curTopOffset)
 *
 * @param {HTMLElement[]} animGroupsBlocks - animated group block list
 */
function t_animate__getGroupsOffsets(animGroupsBlocks) {
	animGroupsBlocks.forEach(function (animGroupsBlock) {
		var animatedChild = animGroupsBlock.querySelector('.t-animate');
		if (animatedChild) {
			animGroupsBlock.curTopOffset = animatedChild.getBoundingClientRect().top + window.pageYOffset;
		}
	});
}

/**
 * Add itemsOffsets param to animated elements
 *
 * @param {HTMLElement[]} animChainsBlocks animated chain block list
 */
function t_animate__getChainOffsets(animChainsBlocks) {
	animChainsBlocks.forEach(function (animChainsBlock) {
		var currentChain = animChainsBlock.querySelectorAll('.t-animate_wait[data-animate-chain=yes]');
		animChainsBlock.itemsOffsets = [];
		Array.prototype.forEach.call(currentChain, function (curChain, index) {
			animChainsBlock.itemsOffsets[index] = curChain.getBoundingClientRect().top + window.pageYOffset;
		});
	});
}

/**
 * Add curTopOffset param to animated elements
 *
 * @param {HTMLElement[]} animElems - animated elements
 */
function t_animate__getElemsOffsets(animElems) {
	animElems.forEach(function (animElem) {
		animElem.curTopOffset = window.pageYOffset + animElem.getBoundingClientRect().top;
	});
}

/**
 * Remove animation from hidden blocks
 *
 * @param {HTMLElement} curBlock - current block
 */
function t_animate__removeAnimFromHiddenSlides(curBlock) {
	var slides = curBlock.querySelectorAll('.t-slides');
	if (slides.length) {
		var slidesItems = curBlock.querySelectorAll('.t-slides__item');
		slidesItems = Array.prototype.filter.call(slidesItems, function (slide) {
			return !(slide.classList.contains('t-slides__item_active'));
		});
		var hiddenSlides = [];
		slidesItems.forEach(function (slide) {
			var animateEl = slide.querySelector('.t-animate');
			if (animateEl) hiddenSlides.push(animateEl);
		});
		hiddenSlides.forEach(function (hiddenSlide) {
			hiddenSlide.classList.remove('t-animate');
			hiddenSlide.classList.remove('t-animate_no-hover');
		});
	}
}

/**
 * Move custom opacity from text element to wrapped <div>
 */
function t_animate__wrapTextWithOpacity() {
	var textElements = document.querySelectorAll('.t-title.t-animate, .t-descr.t-animate, .t-uptitle.t-animate, .t-text.t-animate');
	Array.prototype.forEach.call(textElements, function (el) {
		var style = el.getAttribute('style');
		if (style && style.indexOf('opacity') !== -1) {
			var opacity = el.style.opacity;
			if (opacity && opacity > 0) {
				el.style.opacity = '';
				var div = document.createElement('div');
				div.style.opacity = opacity;
				var children = el.childNodes;
				Array.prototype.forEach.call(children, function (child) {
					var clonedChild = child.cloneNode(true);
					div.appendChild(clonedChild);
				});
				el.innerHTML = '';
				el.appendChild(div);
			}
		}
	});
}

/**
 * Check IE browser
 *
 * @returns {Boolean} - if ie browser return true
 */
function t_animate__checkIE() {
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