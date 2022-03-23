/**
 * tilda-slds используется в блоках категории Галерея (GL), Колонки (CL), Магазин (ST), Отзывы (TS)  
 * и в блоках CR30N, PR201N и TE800. 
 * Скрипт устанавливает размер и параметры слайдера и его контролов, добавляет анимацию, 
 * добавляет библиотеку hammer.js для мобильных устройств.
 */

/**
 * Sets default params, width, height and arrow position for slider
 * 
 * @param {object} sliderOptions - options from store (tilda-catalog)
 */
/* eslint-disable-next-line no-unused-vars */
function t_sldsInit(rec, sliderOptions) {
    var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
    if (!sliderRec) return;
    var sliderItems = sliderRec.querySelectorAll('.t-slds__item:not(.t-slds__item_dummy)');
	if (!sliderItems) return;
	var totalSlides = sliderItems.length;
	var firstSlide = sliderItems[0];
	var lastSlide = sliderItems[sliderItems.length - 1];
	var windowWidth = window.innerWidth;
	var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
	var itemsInRow = parseInt(sliderWrapper.getAttribute('data-slider-items-in-row'), 10) || 0;
	var sliderWithCycle = sliderWrapper.getAttribute('data-slider-with-cycle');
	var sliderTransition = parseFloat(sliderWrapper.getAttribute('data-slider-transition'));
	var stopSlider = sliderWrapper.getAttribute('data-slider-stop');

	if (!sliderTransition && sliderTransition !== 0) sliderTransition = 300;

    if (stopSlider == 'true') return false;

    // catalog-1.1 can create a slider with data-slider-transition
    if (isNaN(sliderTransition)) {
        sliderWrapper.setAttribute('data-slider-transition', '300');
    }

    if (!sliderWrapper.classList.contains('t-slds_animated-fast') && 
		!sliderWrapper.classList.contains('t-slds_animated-slow') && 
		!sliderWrapper.classList.contains('t-slds_animated-none')) {
        sliderWrapper.classList.add('t-slds_animated-fast');
    }

    var defaultCountItemsInRow = itemsInRow;
    t_slds_setItemsInRow(rec);
    t_slds_changeImageUrl(rec);

	// remove animation for old IE
    var userAgent = window.navigator.userAgent;
    var Idx = userAgent.indexOf('MSIE');
    var ieVersion = '';
    var oldIE = false;
    if (Idx > 0) {
        ieVersion = parseInt(userAgent.substring(Idx + 5, userAgent.indexOf('.', Idx)));
        if (ieVersion == 8 || ieVersion == 9) {
            oldIE = true;
        }
    }
    if (oldIE === true) {
        sliderWrapper.classList.remove('t-slds_animated-fast');
		sliderWrapper.classList.remove('t-slds_animated-slow');
		sliderWrapper.classList.add('t-slds_animated-none t-slds_ie');
		sliderWrapper.setAttribute('data-slider-correct-height', 'true');
        sliderWrapper.setAttribute('data-slider-items-in-row', 1);
    }

    if (sliderWrapper.getAttribute('data-slider-initialized') == 'true') {
        totalSlides = totalSlides - 2;
    }

    sliderWrapper.setAttribute('data-slider-initialized', 'true');
    sliderWrapper.setAttribute('data-slider-totalslides', totalSlides);
	// catalog-1.1 can create a slider with data-slider-pos
    if (!sliderWrapper.getAttribute('data-slider-pos')) {
        sliderWrapper.setAttribute('data-slider-pos', 1);
    }
    sliderWrapper.setAttribute('data-slider-pos', 1);
    sliderWrapper.setAttribute('data-slider-curr-pos', 1);
    sliderWrapper.setAttribute('data-slider-cycle', '');
    sliderWrapper.setAttribute('data-slider-animated', '');

    var position = 1;

	// Remove unnecessary attr & class before 'clone'
    var restoreAttrClass = false;
	var firstSlideImgwrapper = firstSlide.querySelector('[data-zoomable="yes"]');
	var lastSlideImgwrapper = lastSlide.querySelector('[data-zoomable="yes"]');
    if (firstSlideImgwrapper && lastSlideImgwrapper) {
        restoreAttrClass = true;
        if (firstSlideImgwrapper.classList.contains('t-zoomable')) firstSlideImgwrapper.classList.remove('t-zoomable');
        firstSlideImgwrapper.removeAttribute('data-zoomable');
        if (lastSlideImgwrapper.classList.contains('t-zoomable')) lastSlideImgwrapper.classList.remove('t-zoomable');
        lastSlideImgwrapper.removeAttribute('data-zoomable');
    }

	// slides' indexes begin with 1, index == 0 is the first slide copy's index. same for the last slide
    if (sliderRec.querySelectorAll('.t-slds__item[data-slide-index="0"]').length == 0) {
		var lastSlideDummy = lastSlide.cloneNode(true);
		lastSlideDummy.setAttribute('data-slide-index', '0');
		var sldsWrapper = firstSlide.parentNode;
        sldsWrapper.insertBefore(lastSlideDummy, firstSlide);
		var fieldItem = sldsWrapper.querySelectorAll('[data-slide-index="0"] [field]');
		if (fieldItem.length > 0) {
			Array.prototype.forEach.call(fieldItem, function(item){
				item.removeAttribute('field');
			});
		}
    }
    if (sliderRec.querySelectorAll('.t-slds__item[data-slide-index="' + (totalSlides + 1) + '"]').length == 0) {
		var firstSlideDummy = firstSlide.cloneNode(true);
		firstSlideDummy.setAttribute('data-slide-index', totalSlides + 1);
		firstSlideDummy.classList.remove('t-slds__item_active');
        lastSlide.insertAdjacentElement('afterend', firstSlideDummy);
		lastSlide.classList.add('t-slds__item-loaded');
        if (itemsInRow > 0 && sliderWithCycle === 'true') {
            var beginningSlide = firstSlide;
            var endSlide = lastSlide;
            for (var i = 0; i < itemsInRow - 1; i++) {
                var newSlide = beginningSlide.nextElementSibling.cloneNode(true);
				newSlide.setAttribute('data-slide-index', totalSlides + i + 1);
                endSlide.nextElementSibling.insertAdjacentElement('afterend', newSlide);
                endSlide = endSlide.nextElementSibling;
                beginningSlide = beginningSlide.nextElementSibling;
            }
        }
    }
	
	if (restoreAttrClass) {
        firstSlideImgwrapper.classList.add('t-zoomable');
        firstSlideImgwrapper.setAttribute('data-zoomable', 'yes');
        lastSlideImgwrapper.classList.add('t-zoomable');
        lastSlideImgwrapper.setAttribute('data-zoomable', 'yes');
	}

    itemsInRow = parseInt(sliderWrapper.getAttribute('data-slider-items-in-row'), 10) || 0;
	var arrowRight = sliderRec.querySelectorAll('.t-slds__arrow_wrapper-right');
    if (arrowRight.length > 0) {
		Array.prototype.forEach.call(arrowRight, function(arrow){
			arrow.style.display = (sliderWithCycle === 'false' && totalSlides - itemsInRow <= 0) ? 'none' : '';
		});
    }

    t_slds_SliderWidth(rec);
    if (sliderWrapper.getAttribute('data-slider-correct-height') == 'true') {
        t_slds_SliderHeight(rec);
    }
    t_slds_SliderArrowsHeight(rec);
    t_slds_ActiveSlide(rec, position, totalSlides);
    t_slds_initSliderControls(rec, sliderOptions);
    t_slds_ActiveCaption(rec, position, totalSlides);
    if (sliderWrapper.getAttribute('data-slider-timeout') > 0) {
        // Fix for hide block with autoplay
        t_slds_initAutoPlay(rec, position, totalSlides, sliderOptions);
    }
    if (sliderRec.querySelectorAll('.t-slds__item-loaded').length < totalSlides + 2) {
        t_slds_UpdateImages(rec, position);
    }
    if (sliderWrapper.getAttribute('data-slider-arrows-nearpic') == 'yes') {
        t_slds_positionArrows(rec);
    }

    if (!oldIE) {
		t_slds_onHammerLoad('Hammer', function () {
            t_slds_initSliderSwipe(rec, totalSlides, windowWidth);
        });
    }
    /*
        IOS13 have bug - CSS transition doesn't work with transform
        so we can remove buggy animation

        right now we emulate CSS transition on JS with func t_ slide_MoveAnimation below

        if (window.isSafariVersion && window.isSafariVersion[0] >= 13 && window.isiOSChrome) {
            sliderWrapper.removeClass('t-slds_animated-fast').removeClass('t-slds_animated-slow').addClass('t-slds_animated-none').attr('data-slider-correct-height', 'true')
            sliderWrapper.attr('data-slider-items-in-row', 1);
        }
    */

    var sldsBlock = sliderRec.querySelectorAll('.t-slds');
	if (sldsBlock.length > 0) {
		Array.prototype.forEach.call(sldsBlock, function(slide){
			slide.style.visibility = '';
		});
	}

    // displayChanged for .t-store__product-snippet
	sliderRec.removeEventListener('displayChanged', t_slds_updateOnDisplayChange);
    sliderRec.addEventListener('displayChanged', t_slds_updateOnDisplayChange(rec, defaultCountItemsInRow));

	// todo: jquery trigger
	$(sliderRec).trigger('sliderIsReady');
    window.addEventListener('resize', t_throttle(function () {
        setTimeout(function () {
            t_slds_setItemsInRow(rec, defaultCountItemsInRow);
            t_slds_updateSlider(rec);
            t_slds_positionArrows(rec);
        }, 100);
    }));
    window.addEventListener('load', function () {
        if (sliderWrapper.getAttribute('data-slider-correct-height') == 'true') {
            t_slds_UpdateSliderHeight(rec);
        }
        t_slds_UpdateSliderArrowsHeight(rec);
    });
}

/**
 * Used in hidden block t973
 * 
 * @param {object} defaultCountItemsInRow - опция из tilda-catalog
 */
function t_slds_updateOnDisplayChange(rec, defaultCountItemsInRow) {
	t_throttle(function () {
		t_slds_setItemsInRow(rec, defaultCountItemsInRow);
		t_slds_updateSlider(rec);
		t_slds_positionArrows(rec);
	});
}

/**
 * Sets number of slides in row
 * 
 * @param {object} defaultCountItemsInRow - options from store (tilda-catalog)
 */
function t_slds_setItemsInRow(rec, defaultCountItemsInRow) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
    var updatedItemsInRow;

    if (itemsInRow) {
        if (window.innerWidth <= 960) {
            updatedItemsInRow = 2;
        }
        if (window.innerWidth <= 640) {
            updatedItemsInRow = 1;
        }
        if (window.innerWidth > 960) {
            updatedItemsInRow = defaultCountItemsInRow;
        }
    }

    if (updatedItemsInRow) {
        sliderWrapper.setAttribute('data-slider-items-in-row', updatedItemsInRow);
    }
}

/**
 * 
 * Adds event listeners for arrows and bullets
 * @param {object} sliderOptions  - options from store (tilda-catalog)
 */
function t_slds_initSliderControls(rec, sliderOptions) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
    var sliderWidth = itemsInRow > 0 ? sliderRec.querySelector('.t-slds__container .t-slds__item').offsetWidth : sliderRec.querySelector('.t-slds__container').offsetWidth;
    var stopSlider = sliderWrapper.getAttribute('data-slider-stop');
    if (stopSlider == 'true') return false;

    sliderWrapper.style.transform = 'translateX(-' + (sliderWidth) + 'px)';

	var arrowWrapper = sliderRec.querySelectorAll('.t-slds__arrow_wrapper');

	if (arrowWrapper.length > 0) {
		Array.prototype.forEach.call(arrowWrapper, function(wrapper) {
			wrapper.addEventListener('click', function() {
				var currentTranslate = t_slds_getCurrentTranslate(sliderRec);
				var isAnimated = sliderWrapper.getAttribute('data-slider-animated');
				var position = parseFloat(sliderWrapper.getAttribute('data-slider-pos'));
				var totalSlides = parseFloat(sliderWrapper.getAttribute('data-slider-totalslides'));
				var isCycled = sliderWrapper.getAttribute('data-slider-with-cycle');
				var cycle = '';
				if (isAnimated == '') {
					sliderWrapper.setAttribute('data-slider-animated', 'yes');
					var direction = this.getAttribute('data-slide-direction');
					if (direction === 'left') {
						if (isCycled == 'false' && position == 1) {
							position = 1;
						} else {
							position--;
						}
					} else if (isCycled == 'false' && position == totalSlides) {
						position = totalSlides;
					} else {
						position++;
					}
					sliderWrapper.setAttribute('data-slider-pos', position);
					if ((position == (totalSlides + 1)) || (position == 0)) {
						cycle = 'yes';
					}
					sliderWrapper.setAttribute('data-slider-cycle', cycle);
					t_slideMoveWithoutAnimation(rec, false, sliderOptions, currentTranslate);
				}
				t_slds_updateSlider(rec);
			});
		});
	}

	var bullets = sliderRec.querySelectorAll('.t-slds__bullet');
	if (bullets.length > 0) {
		bullets.forEach(function(bullet) {
			bullet.addEventListener('click', function () {
				var currentTranslate = t_slds_getCurrentTranslate(sliderRec);
				var position = parseFloat(bullet.getAttribute('data-slide-bullet-for'));
				sliderWrapper.setAttribute('data-slider-pos', position);
				t_slideMoveWithoutAnimation(rec, false, sliderOptions, currentTranslate);
				t_slds_updateSlider(rec);
			});
		});
	}
}

function t_slds_animate(timing, draw, duration) {
    var start = performance.now();

    requestAnimationFrame(function t_slds_animate(time) {
        // timeFraction is changing from 0 to 1
        var timeFraction = (time - start) / duration;

        if (timeFraction > 1) timeFraction = 1;

        // calc current animation state
        var progress = timing(timeFraction);

        // paint it
        draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(t_slds_animate);
        } else if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
            t_slds_onHammerLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }

    });
}

/**
 * emulates CSS transition on JS (fix for iOS13)
 * @param {HTMLElement} sliderWrapper - '.t-slds__items-wrapper'
 * @param {string} position - current position from 'data-slider-pos' attr 
 * @param {number} sliderWidth - item (if 1 in row) or container width
 * @param {number} animateDuration - from 'data-slider-transition' attr
 * @returns 
 */
function t_slide_MoveAnimation(sliderWrapper, position, sliderWidth, animateDuration) {
    if (!sliderWrapper) return;
    sliderWrapper.style.transition = 'height ease-in-out .5s, transform ease-in-out 0s';

    var translateValue = -Math.abs(position * sliderWidth);
    var currentTranslate = -parseInt(getComputedStyle(sliderWrapper).transform.match(/\d+/)[0]);
    var nextTransformValue = currentTranslate - translateValue;

    if (nextTransformValue === 0) {
        return;
    }

    t_slds_animate(
        function (timing) {
            return timing;
        },
        function (progress) {
            sliderWrapper.style.transform = 'translateX(' + (currentTranslate - (nextTransformValue * progress)) + 'px)';
        },
        animateDuration
    );
}

/**
 * Adds fadeout animation if slider is not animated (speed = 0), moves slides
 * @param {boolean} withoutNewInterval - if false, creates new interval on click on bullet or arrow
 * @param {object} sliderOptions - options from store (tilda-catalog)
 */
function t_slideMoveWithoutAnimation(rec, withoutNewInterval, sliderOptions) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var position = parseFloat(sliderWrapper.getAttribute('data-slider-pos'));
    var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
	var sliderWidth = itemsInRow > 0 ? sliderRec.querySelector('.t-slds__container .t-slds__item').offsetWidth : sliderRec.querySelector('.t-slds__container').offsetWidth;
    var totalSlides = parseFloat(sliderWrapper.getAttribute('data-slider-totalslides'));
    var sliderNotAnimated = sliderWrapper.classList.contains('t-slds_animated-none');

    if (position > totalSlides + 1) {
        position = 1;
    }

    if (sliderNotAnimated) {
        var activeSlide = sliderRec.querySelector('.t-slds__item_active');
		var items = sliderRec.querySelectorAll('.t-slds__item');

        if (activeSlide && sliderRec.querySelectorAll('.t-slds__item_dummy').length === 0) {
			var dummy = activeSlide.cloneNode(true);
			dummy.classList.add('t-slds__item_dummy');
			dummy.style.position = 'absolute';
			dummy.style.left = sliderWidth * position + 'px';
			sliderWrapper.appendChild(dummy);

			Array.prototype.forEach.call(items, function(item) {
				item.style.opacity = 0;
			});
			t_slds_fadeOut(dummy, 400, function() {
				if (dummy.parentNode !== null) {
					dummy.parentNode.removeChild(dummy);
				}
			});
            // A small delay before fadeOut
            setTimeout(function () {
				Array.prototype.forEach.call(items, function(item) {
					t_slds_fadeIn(item);
				});
            }, 50);


        }
        sliderWrapper.classList.add('t-slds_animated-cancel');
    }

    t_slideMove(rec, withoutNewInterval, sliderOptions);

    if (sliderNotAnimated) {
        sliderWrapper.classList.remove('t-slds_animated-cancel');
    }
}

/**
 * Used in catalog
 * @param {boolean} withoutNewInterval - if false, creates new interval on click on bullet or arrow
 * @param {object} sliderOptions 
 */
/* eslint-disable-next-line no-unused-vars */
function t_slideMoveInstantly(rec, withoutNewInterval, sliderOptions) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
	var position = parseFloat(sliderWrapper.getAttribute('data-slider-pos'));
    var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
    var sliderWidth = itemsInRow > 0 ? sliderRec.querySelector('.t-slds__container .t-slds__item').offsetWidth : sliderRec.querySelector('.t-slds__container').offsetWidth;
    var totalSlides = parseFloat(sliderWrapper.getAttribute('data-slider-totalslides'));
    var sliderNotAnimated = sliderWrapper.classList.contains('t-slds_animated-none');

    if (position > totalSlides + 1) {
        position = 1;
    }

    if (sliderNotAnimated) {
        var activeSlide = sliderRec.querySelector('.t-slds__item_active');
        if (activeSlide && sliderRec.querySelectorAll('.t-slds__item_dummy').length === 0) {
            var dummy = activeSlide.cloneNode(true);
			dummy.classList.add('t-slds__item_dummy');
			dummy.style.position = 'absolute';
			dummy.style.left = sliderWidth * position + 'px';
			sliderWrapper.appendChild(dummy);
			t_slds_fadeOut(dummy, 400, function() {
				if (dummy.parentNode !== null) {
					dummy.parentNode.removeChild(dummy);
				}
			});
        }
        sliderWrapper.classList.add('t-slds_animated');
        sliderWrapper.classList.add('t-slds_animated-cancel');
    } else {
        sliderWrapper.classList.add('t-slds_animated');
        sliderWrapper.classList.add('t-slds_animated-cancel');
    }

    t_slideMove(rec, withoutNewInterval, sliderOptions);

    if (sliderNotAnimated) {
        sliderWrapper.classList.remove('t-slds_animated');
        sliderWrapper.classList.remove('t-slds_animated-cancel');
    } else {
        sliderWrapper.classList.remove('t-slds_animated');
        sliderWrapper.classList.remove('t-slds_animated-cancel');
    }
}

/**
 * Moves slides
 * @param {boolean} withoutNewInterval - if false, creates new interval on click on bullet or arrow
 * @param {object} sliderOptions - options from store (tilda-catalog)
 */
function t_slideMove(rec, withoutNewInterval, sliderOptions) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var itemsInRow = parseFloat(sliderWrapper.getAttribute('data-slider-items-in-row') || 0);
    var sliderWidth = itemsInRow > 0 ? sliderRec.querySelector('.t-slds__container .t-slds__item').offsetWidth : sliderRec.querySelector('.t-slds__container').offsetWidth;
    var sliderTransition = parseFloat(sliderWrapper.getAttribute('data-slider-transition'));
    var position = parseFloat(sliderWrapper.getAttribute('data-slider-pos'));
    var totalSlides = parseFloat(sliderWrapper.getAttribute('data-slider-totalslides'));
    var cycle = sliderWrapper.getAttribute('data-slider-cycle');
    var sliderNotAnimated = sliderWrapper.classList.contains('t-slds_animated-none');
    var sliderAutoPlay = sliderWrapper.getAttribute('data-slider-timeout') > 0;
    var stopSlider = sliderWrapper.getAttribute('data-slider-stop');
	var arrowWrapperRight = sliderRec.querySelector('.t-slds__arrow_wrapper-right');
	var arrowWrapperLeft = sliderRec.querySelector('.t-slds__arrow_wrapper-left');

	if (!sliderTransition && sliderTransition !== 0) sliderTransition = 300;

    if (position > totalSlides + 1) {
        position = 1;
        sliderWrapper.setAttribute('data-slider-pos', 1);
    }

    if (stopSlider == 'true') return false;

	if (arrowWrapperRight) {
		if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' &&
			(position == totalSlides || (itemsInRow > 1 && position == totalSlides - itemsInRow + 1))) {
			t_slds_fadeOut(arrowWrapperRight, 300);
		} else {
			t_slds_fadeIn(arrowWrapperRight, 300);
		}
	}

	if (arrowWrapperLeft) {
		if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' && position == 1) {
			t_slds_fadeOut(arrowWrapperLeft, 300);
		} else {
			t_slds_fadeIn(arrowWrapperLeft, 300);
		}
	}
    sliderWrapper.classList.add('t-slds_animated');

    if (window.isSafariVersion && window.isSafariVersion[0] >= 13 && window.isiOSChrome && !sliderNotAnimated) {
        t_slide_MoveAnimation(sliderWrapper, position, sliderWidth, sliderTransition);
    } else {
        sliderWrapper.style.transform = ('translateX(-' + (sliderWidth * position) + 'px)');
    }

    setTimeout(function () {
        sliderWrapper.classList.remove('t-slds_animated');
        sliderWrapper.setAttribute('data-slider-animated', '');
        cycle = sliderWrapper.getAttribute('data-slider-cycle');
        if (cycle == 'yes') {
            if (position == (totalSlides + 1)) {
                position = 1;
            }
            if (position == 0) {
                position = totalSlides;
            }

            if (window.isSafariVersion && window.isSafariVersion[0] >= 13 && window.isiOSChrome && !sliderNotAnimated) {
				t_slide_MoveAnimation(sliderWrapper, position, sliderWidth, 0);
            } else {
                sliderWrapper.style.transform = 'translateX(-' + (sliderWidth * position) + 'px)';
            }
            if (sliderNotAnimated !== true) {
                t_slds_ActiveSlide(rec, position, totalSlides, sliderOptions);
            }
            sliderWrapper.setAttribute('data-slider-pos', position);
        }
        if (window.lazy === 'y' || (document.querySelector('#allrecords') && document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes')) {
            t_slds_onHammerLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
        if (!withoutNewInterval && sliderAutoPlay) {
            t_slds_initAutoPlay(rec, position, totalSlides, sliderOptions);
        }
    }, sliderTransition);
    t_slds_ActiveBullet(rec, position, totalSlides, sliderOptions);
    t_slds_ActiveSlide(rec, position, totalSlides);
    if (sliderWrapper.getAttribute('data-slider-correct-height') == 'true') {
        t_slds_SliderHeight(rec);
    }
    t_slds_SliderArrowsHeight(rec);
    t_slds_ActiveCaption(rec, position, totalSlides);
    if (sliderRec.querySelectorAll('.t-slds__item-loaded').length < totalSlides + 2) {
        t_slds_UpdateImages(rec, position);
    }
    sliderWrapper.getAttribute('data-slider-curr-pos', position);
}

/**
 * Updates slider width, height and position
 */
function t_slds_updateSlider(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    t_slds_SliderWidth(rec);
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
    var sliderWidth = itemsInRow > 0 ? sliderRec.querySelector('.t-slds__container .t-slds__item').offsetWidth : sliderRec.querySelector('.t-slds__container').offsetWidth;
    var position = parseFloat(sliderWrapper.getAttribute('data-slider-pos'));
    var totalSlides = parseFloat(sliderWrapper.getAttribute('data-slider-totalslides'));
    var sliderWithCycle = sliderWrapper.getAttribute('data-slider-with-cycle');
	var arrowWrapperRight = sliderRec.querySelector('.t-slds__arrow_wrapper-right');

    if (position > totalSlides + 1) {
        position = 1;
        sliderWrapper.setAttribute('data-slider-pos', 1);
    }

	if (arrowWrapperRight) {
		if (sliderWithCycle === 'false' && totalSlides - itemsInRow <= 0) {
			arrowWrapperRight.style.display = 'none';
		} else {
			arrowWrapperRight.style.display = '';
		}
	}

    sliderWrapper.style.transform = 'translateX(-' + (sliderWidth * position) + 'px)';
    if (sliderWrapper.getAttribute('data-slider-correct-height') == 'true') {
        t_slds_UpdateSliderHeight(rec);
    }
    t_slds_UpdateSliderArrowsHeight(rec);
}

function t_slds_UpdateImages(rec, position) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var item = sliderRec.querySelector('.t-slds__item[data-slide-index="' + position + '"]');
	if (!item) return;
    item.classList.add('t-slds__item-loaded');
    item.nextElementSibling.classList.add('t-slds__item-loaded');
    item.previousElementSibling.classList.add('t-slds__item-loaded');
}

/**
 * Shows active item caption
 */
function t_slds_ActiveCaption(rec, position, totalSlides) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var captions = sliderRec.querySelectorAll('.t-slds__caption');
    var captionActive = sliderRec.querySelector('.t-slds__caption[data-slide-caption="' + position + '"]');

	Array.prototype.forEach.call(captions, function(caption){
		caption.classList.remove('t-slds__caption-active');
	});
    if (position == 0) {
        captionActive = sliderRec.querySelector('.t-slds__caption[data-slide-caption="' + totalSlides + '"]');
    } else if (position == totalSlides + 1) {
        captionActive = sliderRec.querySelector('.t-slds__caption[data-slide-caption="1"]');
    }
	if (captionActive) {
		captionActive.classList.add('t-slds__caption-active');
	}
}

/**
 * Function for scrolling images on touch slide
 * @param {number} distance - movement of the X axis
 */
function t_slds_scrollImages(rec, distance) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var value = (distance < 0 ? '' : '-') + Math.abs(distance).toString();
    sliderRec.querySelector('.t-slds__items-wrapper').style.transform = 'translateX(' + value + 'px)';
}

/**
 * Adds class to active bullet
 * @param {number} position - active slide number
 * @param {object} sliderOptions - options from store (tilda-catalog)
 */
function t_slds_ActiveBullet(rec, position, totalSlides, sliderOptions) {
    var maxThumbsCount;

    if (sliderOptions && sliderOptions.thumbsbulletGallery) {
        var columnSizeForMainImage = parseInt(sliderOptions.storeOptions.popup_opts.columns);
        var galleryImageAspectRatio = +sliderOptions.storeOptions.slider_slidesOpts.ratio;
        maxThumbsCount = t_store_prodPopup_gallery_calcMaxThumbsCount(columnSizeForMainImage, galleryImageAspectRatio, 60, 10);
    }

	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var bullets = sliderRec.querySelectorAll('.t-slds__bullet');
    var bulletActive = sliderRec.querySelector('.t-slds__bullet[data-slide-bullet-for="' + position + '"]');

	Array.prototype.forEach.call(bullets, function(bullet){
		bullet.classList.remove('t-slds__bullet_active');
	});
    if ((sliderOptions && sliderOptions.thumbsbulletGallery) && (position >= maxThumbsCount && position != totalSlides + 1) || (totalSlides >= maxThumbsCount && position == 0)) {
        bulletActive = sliderRec.querySelector('.t-slds__bullet[data-slide-bullet-for="' + maxThumbsCount + '"]');
    } else if (position == 0) {
        bulletActive = sliderRec.querySelector('.t-slds__bullet[data-slide-bullet-for="' + totalSlides + '"]');
    } else if (position == totalSlides + 1) {
        bulletActive = sliderRec.querySelector('.t-slds__bullet[data-slide-bullet-for="1"]');
    }
	if (bulletActive) bulletActive.classList.add('t-slds__bullet_active');
}

/**
 * Adds class to active slide
 * @param {number} position - active slide number
 */
function t_slds_ActiveSlide(rec, position, totalSlides) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
	var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
    var slides = sliderRec.querySelectorAll('.t-slds__item');
    var slideActive = sliderRec.querySelector('.t-slds__item[data-slide-index="' + position + '"]');
    var sliderNotAnimated = sliderWrapper ? sliderWrapper.classList.contains('t-slds_animated-none') : false;
    var iframes = sliderRec.querySelectorAll('iframe');

    Array.prototype.forEach.call(iframes, function (iframe) {
        if (iframe.src) {
            if (iframe.src.indexOf('&enablejsapi=1') !== -1) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
            if (iframe.src.indexOf('vimeo') !== -1 && (iframe.src.indexOf('&amp;api=1') !== -1 || iframe.src.indexOf('&api=1') !== -1)) {
                iframe.contentWindow.postMessage('{"method":"pause","value":"true"}', '*');
            }
        }
    });

	Array.prototype.forEach.call(slides, function(slide){
		slide.classList.remove('t-slds__item_active');
	});

    if (position == 0 && sliderNotAnimated === false) {
        sliderRec.querySelector('.t-slds__item[data-slide-index="' + totalSlides + '"]').classList.add('t-slds__item_active');
    } else if (position == 0 && sliderNotAnimated === true) {
        slideActive = sliderRec.querySelector('.t-slds__item[data-slide-index="' + totalSlides + '"]');
    } else if (position == totalSlides + 1 && sliderNotAnimated === false) {
        sliderRec.querySelector('.t-slds__item[data-slide-index="' + 1 + '"]').classList.add('t-slds__item_active');
    } else if (position == totalSlides + 1 && sliderNotAnimated === true) {
        slideActive = sliderRec.querySelector('.t-slds__item[data-slide-index="1"]');
    }
    slideActive.classList.add('t-slds__item_active');
}

function t_slds_SliderWidth(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderContainer = sliderRec.querySelector('.t-slds__container');
	if (sliderContainer) { 
		var containerPaddingLeft = parseInt(getComputedStyle(sliderContainer).paddingLeft) || 0;
		var containerPaddingRight = parseInt(getComputedStyle(sliderContainer).paddingRight) || 0;
		var sliderContainerWidth = sliderContainer.clientWidth - (containerPaddingLeft + containerPaddingRight);
		var totalSlides = sliderRec.querySelectorAll('.t-slds__item:not(.t-slds__item_dummy)').length;
		var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
		if (sliderWrapper) {
			var stopSlider = sliderWrapper.getAttribute('data-slider-stop');
			var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
			if (stopSlider == 'true') {
				return false;
			}
			sliderWrapper.style.width = sliderContainerWidth * totalSlides + 'px';
		}
		if (window.innerWidth <= 640) {
			itemsInRow = 1;
		} else if (window.innerWidth <= 960 && itemsInRow > 1) {
			itemsInRow = 2;
		}
		var itemWidth = itemsInRow > 1 ?
			sliderContainerWidth / itemsInRow :
			sliderContainerWidth;
		if (itemWidth > 0) {
			var items = sliderRec.querySelectorAll('.t-slds__item');
			Array.prototype.forEach.call(items, function(item){
				item.style.width = itemWidth + 'px';
			});
		}
	}
}

// next two functions are basically the same, but they are called from blocks so we can't remove one of them for now
function t_slds_SliderHeight(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper:not([data-slider-correct-height="false"])');
	var activeItem = sliderRec.querySelector('.t-slds__item_active');
	if (activeItem) {
		var itemPaddingTop = parseInt(getComputedStyle(activeItem).paddingTop) || 0;
		var itemPaddingBottom = parseInt(getComputedStyle(activeItem).paddingBottom) || 0;
		var height = activeItem.clientHeight - (itemPaddingTop + itemPaddingBottom);
	}
    // correct height only for items with data-slider-correct-height attribute
    if (height && sliderWrapper) {
        sliderWrapper.style.height = height + 'px';
    }
}

function t_slds_UpdateSliderHeight(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper:not([data-slider-correct-height="false"])');
    var activeItem = sliderRec.querySelector('.t-slds__item_active');
	if (activeItem) {
		var itemPaddingTop = parseInt(getComputedStyle(activeItem).paddingTop) || 0;
		var itemPaddingBottom = parseInt(getComputedStyle(activeItem).paddingBottom) || 0;
		var height = activeItem.clientHeight - (itemPaddingTop + itemPaddingBottom);
	}
    if (height !== 0 && sliderWrapper) {
        sliderWrapper.style.height = height + 'px';
    }
}

function t_slds_SliderArrowsHeight(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var activeItem = sliderRec.querySelector('.t-slds__item_active');
	if (activeItem) {
		var itemPaddingTop = parseInt(getComputedStyle(activeItem).paddingTop) || 0;
		var itemPaddingBottom = parseInt(getComputedStyle(activeItem).paddingBottom) || 0;
		var height = activeItem.clientHeight - (itemPaddingTop + itemPaddingBottom);
	}
	var arrowWrappers = sliderRec.querySelectorAll('.t-slds__arrow_wrapper');

    if (height && arrowWrappers.length > 0) {
		Array.prototype.forEach.call(arrowWrappers, function(arrowWrapper){
			arrowWrapper.style.height = height + 'px';
		});
    }
}

function t_slds_UpdateSliderArrowsHeight(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var activeItem = sliderRec.querySelector('.t-slds__item_active');
	if (activeItem) {
		var itemPaddingTop = parseInt(getComputedStyle(activeItem).paddingTop) || 0;
		var itemPaddingBottom = parseInt(getComputedStyle(activeItem).paddingBottom) || 0;
		var height = activeItem.clientHeight - (itemPaddingTop + itemPaddingBottom);
	}
	var arrowWrappers = sliderRec.querySelectorAll('.t-slds__arrow_wrapper');

    if (height && arrowWrappers.length > 0) {
		Array.prototype.forEach.call(arrowWrappers, function(arrowWrapper){
			arrowWrapper.style.height = height + 'px';
		});
    }
}

function t_slds_initAutoPlay(rec, position, totalSlides, sliderOptions) {
    var isZeroBlock = typeof rec === 'object';
	var sliderRec = isZeroBlock ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderContainer = sliderRec.querySelector('.t-slds');
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var sliderTimeOut = parseFloat(sliderWrapper.getAttribute('data-slider-timeout'));
    var cycle = '';
    var stopSlider = sliderWrapper.getAttribute('data-slider-stop');
    var galleryIntervalIdAttr = sliderWrapper.getAttribute('data-slider-interval-id');

    if (galleryIntervalIdAttr) {
        clearInterval(galleryIntervalIdAttr);
    }

    if (stopSlider == 'true') return false;

    if (!window.isMobile && sliderContainer) {
        sliderContainer.addEventListener('mouseover', function() {
            sliderWrapper.setAttribute('data-slider-stopped', 'yes');
        });
		sliderContainer.addEventListener('mouseout', function () {
            sliderWrapper.setAttribute('data-slider-stopped', '');
        });
    }

    // below methods will trigger reflow, check once 
    var elementTop = sliderRec.getBoundingClientRect().top + window.pageYOffset;
    var elementBottom = elementTop + sliderRec.offsetHeight;
    window.addEventListener('resize', t_throttle(function () {
			// recalculate after window resizing
			elementTop = sliderRec.getBoundingClientRect().top + window.pageYOffset;
			elementBottom = elementTop + sliderRec.offsetHeight;
		})
	);

    // set the name of the hidden property and the change event for visibility 
    var hidden, visibilityChange;
    if (typeof document.hidden !== 'undefined') {
        // Opera <= 12.10, Firefox <= 18
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        // IE
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }

    // handle page visibility change
    document.addEventListener(visibilityChange, function () {
        // if the page is hidden, stop the slider
        if (document[hidden]) {
            sliderWrapper.setAttribute('data-slider-stopped', 'yes');
        } else {
            var display = getComputedStyle(sliderRec).display;
            var viewportTop = window.pageYOffset;
            var viewportBottom = viewportTop + window.innerHeight;
            elementTop = sliderRec.getBoundingClientRect().top + window.pageYOffset;
            elementBottom = elementTop + sliderRec.offsetHeight;
            if (elementBottom > viewportTop && elementTop < viewportBottom && display !== 'none') {
                sliderWrapper.setAttribute('data-slider-stopped', '');
            }
        }
    }, false);

    if (sliderRec.length === 1) {
        window.bind('scroll', t_throttle(function () {
            var display = getComputedStyle(sliderRec).display;
            var viewportTop = window.pageYOffset;
            var viewportBottom = viewportTop + window.innerHeight;
            if (display !== 'none') {
                elementTop = sliderRec.getBoundingClientRect().top + window.pageYOffset;
                elementBottom = elementTop + sliderRec.offsetHeight;
                if (elementBottom > viewportTop && elementTop < viewportBottom) {
                    sliderWrapper.setAttribute('data-slider-stopped', '');
                } else if (sliderWrapper.getAttribute('data-slider-stopped') === '') {
                    sliderWrapper.setAttribute('data-slider-stopped', 'yes');
                }
            } else if (!isZeroBlock) {
                sliderWrapper.setAttribute('data-slider-stopped', 'yes');
            }
        }));
    }

    var galleryIntervalId = setInterval(function () {
		var stopped = sliderWrapper.getAttribute('data-slider-stopped');
        var ignorehover = sliderWrapper.getAttribute('data-slider-autoplay-ignore-hover');
        var isSliderTouch = sliderWrapper.getAttribute('data-slider-touch');
		
        var currentTranslate = t_slds_getCurrentTranslate(sliderRec);
		
        if (stopped != 'yes' && ignorehover != 'yes' && isSliderTouch != 'yes') {
            if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' && position == totalSlides) {
                position = totalSlides;
            } else {
                position++;
            }

            sliderWrapper.setAttribute('data-slider-pos', position);
            if ((position == (totalSlides + 1)) || (position == 0)) {
                cycle = 'yes';
            }
            t_slideMoveWithoutAnimation(rec, true, sliderOptions, currentTranslate);
            t_slds_updateSlider(rec);
            if (cycle == 'yes') {
                if (position == (totalSlides + 1)) {
                    position = 1;
                }
                if (position == 0) {
                    position = totalSlides;
                }
                sliderWrapper.setAttribute('data-slider-pos', position);
            }
            sliderWrapper.setAttribute('data-slider-cycle', cycle);
        }
    }, sliderTimeOut);
    sliderWrapper.setAttribute('data-slider-interval-id', galleryIntervalId);
}

function t_slds_positionArrows(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var container = sliderRec.querySelector('.t-slds__arrow_container-outside');
    var item = sliderRec.querySelector('.t-slds__item');
	if (!item) return;
    var inner = item.offsetWidth;
    var arrowleft = sliderRec.querySelector('.t-slds__arrow-left') ? sliderRec.querySelector('.t-slds__arrow-left').offsetWidth : 0;
    var arrowright = sliderRec.querySelector('.t-slds__arrow-right') ? sliderRec.querySelector('.t-slds__arrow-right').offsetWidth : 0;
    if (container) {
		container.style.maxWidth = arrowleft + arrowright + inner + 120 + 'px';
	}
}

function t_slds_initSliderSwipe(rec, totalSlides, windowWidth, sliderOptions) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
    var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
	if (!sliderWrapper) return;
    var stopSlider = sliderWrapper.getAttribute('data-slider-stop');
	
    var timeout;
    var isScrolling = false;
    if (stopSlider == 'true') return false;
	
    delete Hammer.defaults.cssProps.userSelect;

	/* eslint-disable-next-line no-undef */
	hammer = new Hammer(sliderWrapper, {
		domEvents: true,
		inputClass: Hammer.TouchInput,
		recognizers: [
			[Hammer.Pan, {
				direction: Hammer.DIRECTION_HORIZONTAL
			}]
		]
	});

	window.addEventListener('scroll', function () {
		isScrolling = true;
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			isScrolling = false;
		}, 250);
	});

	if (totalSlides == 1) {
		return false;
	}
	
	/* eslint-disable-next-line no-undef */
	hammer.on('pan', function (event) {
		if (isScrolling) {
			return false;
		}
		var sliderWrapper = sliderRec.querySelector('.t-slds__items-wrapper');
		var itemsInRow = sliderWrapper.getAttribute('data-slider-items-in-row') || 0;
		var withSingleMove = itemsInRow > 1;
		var sliderWidth = withSingleMove ? sliderRec.querySelector('.t-slds__container .t-slds__item').offsetWidth : sliderRec.querySelector('.t-slds__container').offsetWidth;
		var position = parseFloat(sliderWrapper.getAttribute('data-slider-pos'));
		var totalSlides = parseFloat(sliderWrapper.getAttribute('data-slider-totalslides'));
		var cycle = '';
		var distance = event.deltaX;
		var percentage = 100 / totalSlides * event.deltaX / window.innerWidth;
		var sensitivity = 30;
		var stopSlider = sliderWrapper.getAttribute('data-slider-stop');
		if (stopSlider == 'true') {
			return false;
		}
		sliderWrapper.setAttribute('data-slider-touch', 'yes');
		t_slds_scrollImages(rec, (sliderWidth * position) - distance);
		if (event.isFinal) {
			if (event.velocityX > 0.4) {
				if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' && position == 1) {
					position = 1;
				} else {
					position--;
				}
				sliderWrapper.setAttribute('data-slider-pos', position);
				if (position == 0) {
					cycle = 'yes';
				}
				sliderWrapper.setAttribute('data-slider-cycle', cycle);
				t_slideMove(rec, false, sliderOptions);
			} else if (event.velocityX < -0.4) {
				if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' &&
					(position == totalSlides || withSingleMove && position == totalSlides - itemsInRow + 1)) {
					position = withSingleMove ? totalSlides - itemsInRow : totalSlides;
				} else {
					position++;
				}
				sliderWrapper.setAttribute('data-slider-pos', position);
				if (position == (totalSlides + 1)) {
					cycle = 'yes';
				}
				sliderWrapper.setAttribute('data-slider-cycle', cycle);
				t_slideMove(rec, false, sliderOptions);
			} else if (percentage <= -(sensitivity / totalSlides)) {
				if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' &&
					(position == totalSlides || withSingleMove && position == totalSlides - itemsInRow + 1)) {
					position = withSingleMove ? totalSlides - itemsInRow : totalSlides;
				} else {
					position++;
				}
				sliderWrapper.setAttribute('data-slider-pos', position);
				if (position == (totalSlides + 1)) {
					cycle = 'yes';
				}
				sliderWrapper.setAttribute('data-slider-cycle', cycle);
				t_slideMove(rec, false, sliderOptions);
			} else if (percentage >= (sensitivity / totalSlides)) {
				if (sliderWrapper.getAttribute('data-slider-with-cycle') == 'false' && position == 1) {
					position = 1;
				} else {
					position--;
				}
				sliderWrapper.setAttribute('data-slider-pos', position);
				if (position == 0) {
					cycle = 'yes';
				}
				sliderWrapper.setAttribute('data-slider-cycle', cycle);
				t_slideMove(rec, false, sliderOptions);
			} else {
				t_slideMove(rec, false, sliderOptions);
			}
			sliderWrapper.setAttribute('data-slider-touch', '');
		}
	});
	/* eslint-disable-next-line no-undef */
	hammer.on('panend', function () {
		t_slideMove(rec, false, sliderOptions);
	});
	
}

function t_slds_getCurrentTranslate(el) {
    var sliderWrapper = el.querySelector('.t-slds__items-wrapper');
    if (sliderWrapper) {
        var transform = getComputedStyle(sliderWrapper).transform;
        if (transform !== undefined && transform !== '') {
            var match = transform.match(/\d+/g);
            if (match !== null) {
                return parseInt(match[0], 10);
            }
        }
    }
}

function t_slds_changeImageUrl(rec) {
	var sliderRec = typeof rec === 'object' ? rec[0] : document.querySelector('#rec' + rec);
	if (!sliderRec) return;
	var imgs = sliderRec.querySelectorAll('.t-slds__img');
	Array.prototype.forEach.call(imgs, function(img){
		var srcAttr = img.getAttribute('data-src');
        if (srcAttr) {
            img.setAttribute('src', srcAttr);
            img.removeAttribute('data-src');
        }
	});
}

function t_slds_onHammerLoad(funcName, okFunc, time) {
    if (typeof window[funcName] === 'function') {
        okFunc();
    } else {
        var startTime = Date.now();
		/* eslint-disable-next-line no-unused-vars */
        var timerId = setTimeout(function checkFuncExist() {
            var currentTime = Date.now();
            if (typeof window[funcName] === 'function') {
                okFunc();
                return;
            }
            if (currentTime - startTime > 7000) {
                throw new Error(funcName + ' is undefined');
            }
            timerId = setTimeout(checkFuncExist, time || 100);
        });
    }
}

function t_slds_fadeOut(el, duration, complete) {
	var opacity = 1;
	duration = parseInt(duration);
	var speed = duration > 0 ? duration / 10 : 40; // default duration = 400
	var timer = setInterval(function() {
		el.style.opacity = opacity;
		opacity -= 0.1;
		if (opacity <= 0.1) {
			clearInterval(timer);
			el.style.display = 'none';
			if (typeof complete === 'function') {
				complete();
			}
		}
	}, speed);
}

function t_slds_fadeIn(el, duration, complete) {
	if ((getComputedStyle(el).opacity === '1' || getComputedStyle(el).opacity === '') && getComputedStyle(el).display !== 'none') return false;
	var opacity = 0;
	duration = parseInt(duration);
	var speed = duration > 0 ? duration / 10 : 40;
	el.style.opacity = opacity;
	el.style.display = 'block';
	var timer = setInterval(function() {
		el.style.opacity = opacity;
		opacity += 0.1;
		if (opacity >= 1.0) {
			clearInterval(timer);
			if (typeof complete === 'function') {
				complete();
			}
		}
	}, speed);
}