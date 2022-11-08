/**
 * tilda-zoom подключается когда в настройках блока пользователь включает "увеличение изображения по клику".
 * Такая функция есть у блоков из категории изображений, каталога, новостей, фидов,
 * галереи (карусель или просто сетка картинок).
 *
 * На странице создается пустой див '.t-zoomer__wrapper', который содержит в себе пустые дивы с контейнером, фоном, и т.д.
 * При клике на элемент, где tilda-zoom активирован, в этот блок добавляется контент с триггерного элемента
 * и его рядом стоящих элементов (если они есть).
 * Если элементов несколько, то дополнительно добавляется по бокам два клонированных элемента,
 * чтобы обеспечить бесконечное перелистывание созданной zoom-карусели.
 *
 * Для мобильной версии используется библиотека Hammer (для событий по свайпу, двойному тапу, и т.д.).
 */
// global variables declaration
window.t_zoom__isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
window.t_zoom__isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

window.t_zoom__iOSMajorVersion = 0;
if (window.t_zoom__isiOS) {
	var version = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
	if (version !== null) {
		window.t_zoom__iOSMajorVersion = parseInt(version[1], 10);
	}
}

t_onReady(function () {
	if (!window.tzoominited) t_initZoom();
});

/**
 * get zoomerWrapper element, and if it doesn't exist - create carousel with zoom in modal
 */
function t_initZoom() {
	var zoomerWrapper = document.querySelector('.t-zoomer__wrapper');
	if (zoomerWrapper) return;

	window.tzoominited = true;
	window.tzoomopenonce = false;
	window.isDoubletapScaleAdded = false;

	//prettier-ignore
	var zoomableElmnts = document.querySelectorAll('[data-zoomable="yes"]:not(.t-slds__thumbs_gallery):not([data-img-zoom-url=""])');
	Array.prototype.forEach.call(zoomableElmnts, function (zoomableEl) {
		zoomableEl.classList.add('t-zoomable');
	});

	//create zoom wrapper and append handlers for it
	var zoomWrapper = document.createElement('div');
	zoomWrapper.classList.add('t-zoomer__wrapper');
	var zoomContainer = document.createElement('div');
	zoomContainer.classList.add('t-zoomer__container');
	var zoomBG = document.createElement('div');
	zoomBG.classList.add('t-zoomer__bg');
	var zoomCloseBtn = t_zoom__createCloseBtn();
	var scaleBtn = t_zoom__createScaleBtn();

	// and append it to body
	zoomWrapper.appendChild(zoomContainer);
	zoomWrapper.appendChild(zoomBG);
	zoomWrapper.appendChild(zoomCloseBtn);
	zoomWrapper.appendChild(scaleBtn);
	document.body.insertAdjacentElement('beforeend', zoomWrapper);

	t_zoom__initFullScreenImgOnClick();
	t_zoom__closeAndSlideCarousel();
}

/**
 * create close btn for zoomer wrapper
 *
 * @return {HTMLDivElement} - close btn
 */
function t_zoom__createCloseBtn() {
	var zoomCloseBtn = document.createElement('div');
	zoomCloseBtn.classList.add('t-zoomer__close');
	zoomCloseBtn.style.display = 'none';
	var svgCloseBtn = '';
	/*@formatter:off*/
	svgCloseBtn += '<svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">';
	svgCloseBtn +=
		'<path d="M1.41421 -0.000151038L0 1.41406L21.2132 22.6273L22.6274 21.2131L1.41421 -0.000151038Z" fill="black"/>';
	svgCloseBtn +=
		'<path d="M22.6291 1.41421L21.2148 0L0.00164068 21.2132L1.41585 22.6274L22.6291 1.41421Z" fill="black"/>';
	svgCloseBtn += '</svg>';
	/*@formatter:on*/
	zoomCloseBtn.insertAdjacentHTML('beforeend', svgCloseBtn);
	return zoomCloseBtn;
}

/**
 * create scale btn for zoomer wrapper
 *
 * @return {HTMLDivElement} - scale btn
 */
function t_zoom__createScaleBtn() {
	var scaleBtn = document.createElement('div');
	scaleBtn.classList.add('t-zoomer__scale');
	scaleBtn.classList.add('showed');
	var svgScaleBtn = '';
	svgScaleBtn +=
		'<svg class="icon-increase" width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">';
	svgScaleBtn += '<path d="M22.832 22L17.8592 17.0273" stroke="black" stroke-width="2" stroke-linecap="square"/>';
	svgScaleBtn +=
		'<path fill-rule="evenodd" clip-rule="evenodd" d="M4.58591 3.7511C0.917768 7.41924 0.917768 13.367 4.58591 17.0352C8.25405 20.7033 14.2019 20.7033 17.87 17.0352C21.5381 13.367 21.5381 7.41924 17.87 3.7511C14.2019 0.0829653 8.25405 0.0829653 4.58591 3.7511Z" stroke="black" stroke-width="2"/>';
	svgScaleBtn += '<path d="M6.25781 10.3931H16.2035" stroke="black" stroke-width="2"/>';
	svgScaleBtn += '<path d="M11.2305 15.3662V5.42053" stroke="black" stroke-width="2"/>';
	svgScaleBtn += '</svg>';
	svgScaleBtn +=
		'<svg class="icon-decrease" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">';
	svgScaleBtn += '<path d="M21.9961 22L17.0233 17.0273" stroke="black" stroke-width="2" stroke-linecap="square"/>';
	svgScaleBtn +=
		'<path fill-rule="evenodd" clip-rule="evenodd" d="M3.74997 3.7511C0.0818308 7.41924 0.0818308 13.367 3.74997 17.0352C7.41811 20.7033 13.3659 20.7033 17.0341 17.0352C20.7022 13.367 20.7022 7.41924 17.0341 3.7511C13.3659 0.0829653 7.41811 0.0829653 3.74997 3.7511Z" stroke="black" stroke-width="2"/>';
	svgScaleBtn += '<path d="M5.41797 10.3931H15.3637" stroke="black" stroke-width="2"/>';
	svgScaleBtn += '</svg>';
	scaleBtn.insertAdjacentHTML('beforeend', svgScaleBtn);
	return scaleBtn;
}

/**
 * create listeners for document and window to open zoomer
 * and check for scale in case of resize/orientationchange
 */
function t_zoom__initFullScreenImgOnClick() {
	document.addEventListener('click', function (e) {
		//prettier-ignore
		var zoomableElement = e.target.closest('.t-zoomable:not([data-img-zoom-url=""]), .t-slds__thumbs_gallery-zoomable');
		if (zoomableElement) t_zoomHandler(zoomableElement);
	});
	var currentEvent = window.t_zoom__isMobile ? 'orientationchange' : 'resize';
	window.addEventListener(currentEvent, function () {
		if (document.body.classList.contains('t-zoomer__show')) {
			t_zoom_checkForScale();
		}
	});
}

/**
 * close carousel by close btn and key ESC,
 * change slide by arrow key in keyboard
 */
function t_zoom__closeAndSlideCarousel() {
	var closeBtn = document.querySelector('.t-zoomer__close');
	if (!closeBtn) return;
	closeBtn.addEventListener('click', function () {
		t_zoom_close();
	});

	document.addEventListener('keydown', function (e) {
		if (document.body.classList.contains('t-zoomer__show')) {
			switch (e.keyCode) {
				case 27: //esc
					e.preventDefault();
					t_zoom_close();
					break;
				case 37: //arrow left
					t_zoom__setEventOnBtn('prev');
					break;
				case 39: //arrow right
					t_zoom__setEventOnBtn('next');
					break;
			}
		}
	});
}

/**
 * init zoom controls (arrows/dots)
 *
 * @returns {false| void} false - in case of JS cannot find parent (.r) or zoomerWrapper
 */
function t_zoomHandler(targetElement) {
	document.body.classList.add('t-zoomer__show');

	// if zoomer popup opened from card popup, add .t-zoomer__active to body
	var isProductPopupShown = document.querySelector('.t-popup_show');
	if (isProductPopupShown) document.body.classList.add('t-zoomer__active');

	var zoomContainer = document.querySelector('.t-zoomer__container');
	// create zoomer carousel
	var zoomerCarousel = document.createElement('div');
	zoomerCarousel.classList.add('t-carousel__zoomed');
	var zoomerSlide = document.createElement('div');
	zoomerSlide.classList.add('t-carousel__zoomer__slides');

	// create zoomer inner and track
	var zoomerInner = document.createElement('div');
	zoomerInner.classList.add('t-carousel__zoomer__inner');
	var zoomerTrack = document.createElement('div');
	zoomerTrack.classList.add('t-carousel__zoomer__track');
	zoomerInner.appendChild(zoomerTrack);

	//create arrows
	var leftArrow = t_zoom_createSliderArrow('left');
	var rightArrow = t_zoom_createSliderArrow('right');
	zoomerSlide.appendChild(leftArrow);
	zoomerSlide.appendChild(rightArrow);

	zoomerSlide.appendChild(zoomerInner);
	zoomerCarousel.appendChild(zoomerSlide);
	if (zoomContainer) zoomContainer.innerHTML = '';
	if (zoomContainer) zoomContainer.appendChild(zoomerCarousel);

	var parentBlock = targetElement.closest('.r');
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	if (!sliderTrack || !parentBlock) return false;

	t_zoom__addingImgsIntoCarousel(targetElement);

	var closeBtn = document.querySelector('.t-zoomer__close');
	if (closeBtn) closeBtn.style.display = 'flex';

	t_zoom_setModalColor(parentBlock);
	t_zoom__createAndLoopSlider(targetElement);
	t_zoom__getEventOnBtn();

	document.body.classList.add('t-zoomer__show_fixed');

	t_zoom__initSingleZoom();
	t_zoom_checkForScale();
	t_zoom_lockScroll();
	if (window.t_zoom__isMobile || 'ontouchend' in document) {
		t_zoom_initSwipe();
		t_zoom_initCloseSwipe();
	}
	t_zoom_initResizeListener();

	window.tzoomopenonce = true;

	t_zoom__initEventsonMobile();
}

/**
 * create arrow slide
 *
 * @param {String} direction - prev/next
 * @return {HTMLDivElement}
 */
function t_zoom_createSliderArrow(direction) {
	var ArrowContainer = document.createElement('div');
	ArrowContainer.classList.add('t-carousel__zoomer__control');
	ArrowContainer.classList.add('t-carousel__zoomer__control_' + direction);
	ArrowContainer.setAttribute('data-zoomer-slide', direction === 'left' ? 'prev' : 'next');
	var ArrowWrapper = document.createElement('div');
	ArrowWrapper.classList.add('t-carousel__zoomer__arrow__wrapper');
	ArrowWrapper.classList.add('t-carousel__zoomer__arrow__wrapper_' + direction);
	var arrow = document.createElement('div');
	arrow.classList.add('t-carousel__zoomer__arrow');
	arrow.classList.add('t-carousel__zoomer__arrow_' + direction);
	arrow.classList.add('t-carousel__zoomer__arrow_small');
	ArrowWrapper.appendChild(arrow);
	ArrowContainer.appendChild(ArrowWrapper);
	return ArrowContainer;
}

/**
 * add events on mobile via Hammer
 */
function t_zoom_initSwipe() {
	var slideItems = document.querySelectorAll('.t-carousel__zoomer__item');
	var modal = document.querySelector('.t-zoomer__wrapper');

	if (slideItems.length > 1) {
		var hammer = new Hammer(modal, {
			domEvents: true,
			inputClass: Hammer.TouchInput,
			cssProps: {
				touchCollout: 'default',
			},
			recognizers: [
				[
					Hammer.Pan,
					{
						direction: Hammer.DIRECTION_HORIZONTAL,
					},
				],
			],
		});

		var sliderTrackPosLeft = null;
		var isScaled = false;

		if (!window.tzoomopenonce) {
			hammer.on('panstart', function () {
				//reinit sliderTrack for this func
				var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
				var sliderTrackTransition = sliderTrack.getAttribute('data-on-transition');
				if (sliderTrackTransition !== 'y') {
					if (sliderTrack) {
						sliderTrackPosLeft = sliderTrack.getBoundingClientRect().left;
						sliderTrack.style.transition = 'none';
					}
				} else {
					sliderTrackPosLeft = null;
				}
				isScaled = t_zoom__isScaled(modal);
			});

			hammer.on('panmove', function (event) {
				//reinit sliderTrack for this func
				var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
				var sliderTrackTransition = sliderTrack.getAttribute('data-on-transition');
				var modalOnDrag = modal.getAttribute('data-on-drag');
				if (sliderTrackTransition !== 'y' && modalOnDrag !== 'y' && event.maxPointers === 1 && !isScaled) {
					var deltaX = Math.abs(event.deltaX);

					if (deltaX > 40) {
						sliderTrack.setAttribute('data-on-drag', 'y');
					}

					if (sliderTrackPosLeft) {
						var newTrackPosition = sliderTrackPosLeft + event.deltaX;
						sliderTrack.style.transform = 'translateX(' + newTrackPosition + 'px)';
					}
				}
			});

			hammer.on('panend', function (event) {
				//reinit sliderTrack for this func
				var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
				sliderTrack.setAttribute('data-on-drag', '');
				var sliderTrackTransition = sliderTrack.getAttribute('data-on-transition');
				var modalOnDrag = modal.getAttribute('data-on-drag');
				if (sliderTrackTransition !== 'y' && modalOnDrag !== 'y' && event.maxPointers === 1 && !isScaled) {
					sliderTrack.style.transition = '';
					var velocity = Math.abs(event.velocityX);
					var sliderTrackOffset = sliderTrack.offsetLeft;
					var slideWidth = slideItems[0].offsetWidth;
					var targetSlideOffset = sliderTrack.querySelector('.t-carousel__zoomer__item.active').offsetLeft;
					var distance = slideWidth - Math.abs(sliderTrackOffset + targetSlideOffset);
					var transitionTime = distance / velocity / 1000;

					if (transitionTime > 0.6) {
						transitionTime = 0.6;
					} else if (transitionTime < 0.2) {
						transitionTime = 0.2;
					}

					sliderTrack.style.transitionDuration = transitionTime + 's';

					if (event.velocityX < -0.5 || event.deltaX < -80) {
						t_zoom_unscale();
						t_zoom_showSlide('next');
						t_zoom_checkForScale();
					} else if (event.velocityX > 0.5 || event.deltaX > 80) {
						t_zoom_unscale();
						t_zoom_showSlide('prev');
						t_zoom_checkForScale();
					} else {
						t_zoom_showSlide();
					}
				}
			});
		}
	}
}

/**
 * hide controls when user is idle
 */
function t_zoom__initEventsonMobile() {
	if (!window.t_zoom__isMobile) return;
	t_zoom_setHideControlsTimer();
	var modal = document.querySelector('.t-zoomer__wrapper');
	var modalEvents = ['touchstart', 'touchmove', 'touchend', 'mousemove'];
	modalEvents.forEach(function (event) {
		modal.addEventListener(event, t_zoom_setHideControlsTimer);
	});
}

/**
 * in case of count of zoom el not more one
 */
function t_zoom__initSingleZoom() {
	var slidesCount = document.querySelectorAll('.t-carousel__zoomer__item').length;
	if (slidesCount === 1) {
		var controls = document.querySelectorAll('.t-carousel__zoomer__control');
		Array.prototype.forEach.call(controls, function (control) {
			control.style.display = 'none';
		});
	}
}

/**
 * get and set events on prev/next btns
 */
function t_zoom__getEventOnBtn() {
	var navBtns = [
		{
			name: 'right',
			direction: 'next',
		},
		{
			name: 'left',
			direction: 'prev',
		},
	];

	navBtns.forEach(function (navBtn) {
		var arrowBtn = document.querySelector('.t-carousel__zoomer__control_' + navBtn.name);
		arrowBtn.addEventListener('click', function () {
			t_zoom__setEventOnBtn(navBtn.direction);
		});
	});
}

/**
 * get button direction and show slide
 *
 * @param {String} btnMove - next or prev
 */
function t_zoom__setEventOnBtn(btnMove) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var modal = document.querySelector('.t-zoomer__wrapper');
	var sliderOnTransition = sliderTrack.getAttribute('data-on-transition');
	var modalOnDrag = modal.getAttribute('data-on-drag');
	if (sliderOnTransition === 'y' || modalOnDrag === 'y') return;
	t_zoom_unscale();
	setTimeout(function () {
		t_zoom_showSlide(btnMove);
		t_zoom_checkForScale();
	});
}

/**
 * create slides for zoomer carousel:
 * from target element will find parent with all slides,
 * iterate them and check if exist data-img-zoom-url, description, title, etc., and append all of them to slider track
 *
 * @param targetElement
 */
function t_zoom__addingImgsIntoCarousel(targetElement) {
	var parentBlock = targetElement.closest('.r');
	//prettier-ignore
	var images = parentBlock ? parentBlock.querySelectorAll('.t-zoomable:not(.t-slds__thumbs_gallery):not(.tn-atom__slds-img)') : [];
	var slide = parentBlock ? parentBlock.querySelector('.t-slds') : null;
	// check if target element placed inside slider
	if (slide) {
		var slider = targetElement.closest('.t-slds');
		if (slider) images = slider.querySelectorAll('.t-zoomable:not(.t-slds__thumbs_gallery)');

		// remove one duplicated slide from zeroblock gallery if this gallery contains video
		if (slider && slider.querySelector('.tn-elem__gallery__video-wrapper')) {
			images = Array.prototype.slice.call(images);
			images.splice(-1, 1);
		}
	}

	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var isLazy = window.lazy === 'y';
	Array.prototype.forEach.call(images, function (img, i) {
		var dataZoomAttr = img.getAttribute('data-img-zoom-url');
		var imgTitle = '';
		var imgDescr = '';
		var imgURLs = dataZoomAttr ? dataZoomAttr.split(',') : '';
		if (img.nodeName === 'IMG' || img.nodeName === 'DIV') {
			imgTitle = img.getAttribute('title') || '';
			imgDescr = img.getAttribute('data-img-zoom-descr') || '';
		}

		if (imgTitle) {
			var slideTitle = document.createElement('div');
			slideTitle.classList.add('t-zoomer__title');
			slideTitle.classList.add('t-name');
			slideTitle.classList.add('t-descr_xxs');
			slideTitle.textContent = imgTitle;
		}
		if (imgDescr) {
			var slideDescription = document.createElement('div');
			slideDescription.classList.add('t-zoomer__descr');
			slideDescription.classList.add('t-descr');
			slideDescription.classList.add('t-descr_xxs');
			slideDescription.textContent = imgDescr;
		}

		var zoomerSlide = document.createElement('div');
		zoomerSlide.classList.add('t-carousel__zoomer__item');
		var zoomerWrapper = document.createElement('div');
		zoomerWrapper.classList.add('t-carousel__zoomer__wrapper');
		var slideIMG = document.createElement('img');
		slideIMG.classList.add('t-carousel__zoomer__img');
		if (isLazy) {
			slideIMG.classList.add('t-img');
			slideIMG.setAttribute('data-original', imgURLs);
			// to smooth sliding between first and last slide, set src with original image
			if (i === 0 || i === images.length - 1) slideIMG.src = imgURLs;
		} else {
			slideIMG.src = imgURLs;
		}
		zoomerSlide.appendChild(zoomerWrapper);
		zoomerWrapper.appendChild(slideIMG);

		// append .t-zoomer__comments in mobile to create an even grid of slides
		if (imgTitle || imgDescr || window.t_zoom__isMobile) {
			var slideComment = document.createElement('div');
			slideComment.classList.add('t-zoomer__comments');
			if (imgTitle) slideComment.appendChild(slideTitle);
			if (imgDescr) slideComment.appendChild(slideDescription);
			zoomerSlide.appendChild(slideComment);
		}
		sliderTrack.appendChild(zoomerSlide);
	});
}

/**
 * set style params and data-attributes (data-slide number, etc.) for created slides, and init slider
 *
 * @param {HTMLElement} targetElement - current element
 */
function t_zoom__createAndLoopSlider(targetElement) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var modal = document.querySelector('.t-zoomer__wrapper');
	var slideItems = document.querySelectorAll('.t-carousel__zoomer__item');

	if (modal && slideItems.length) {
		var imageBordersWidth = modal.offsetHeight - slideItems[0].offsetHeight;

		// get max height of comments in all slides to set this height for all of them, for set an even grid of slider
		var maxHeightOfComments = Array.prototype.reduce.call(
			slideItems,
			function (prev, slide) {
				var comment = slide.querySelector('.t-zoomer__comments');
				var commentHeight = comment ? comment.offsetHeight : 0;
				if (commentHeight > prev) prev = commentHeight;
				return prev;
			},
			0
		);

		var isLazy = window.lazy === 'y';
		Array.prototype.forEach.call(slideItems, function (slideItem) {
			var image = slideItem.querySelector('.t-carousel__zoomer__img');
			var attributeName = isLazy ? 'data-original' : 'src';
			var imageSrc = image.getAttribute(attributeName);
			var comment = slideItem.querySelector('.t-zoomer__comments');
			var commentHeight = comment ? comment.offsetHeight : 0;
			if (window.t_zoom__isMobile) {
				commentHeight = maxHeightOfComments;
			}

			if (comment) comment.style.height = commentHeight + 'px';
			image.style.maxHeight = document.documentElement.clientHeight - (commentHeight + imageBordersWidth) + 'px';

			if (imageSrc && imageSrc.indexOf('.svg') !== -1) {
				image.style.width = window.innerWidth + 'px';
			}

			var arrowWrappers = document.querySelectorAll('.t-carousel__zoomer__arrow__wrapper');

			Array.prototype.forEach.call(arrowWrappers, function (arrowWrapper) {
				arrowWrapper.style.top = commentHeight ? 'calc(50% - ' + commentHeight / 2 + 'px)' : '50%';
			});
		});

		Array.prototype.forEach.call(slideItems, function (slideItem, index) {
			slideItem.setAttribute('data-zoomer-slide-number', index);
		});

		if (slideItems.length > 1) t_zoom_loopSlider();

		var targetURL = targetElement.getAttribute('data-img-zoom-url');
		var attributeName = isLazy ? 'data-original' : 'src';
		var selector = '.t-carousel__zoomer__img[' + attributeName + '="' + targetURL + '"]';
		var targetImg = targetURL ? document.querySelector(selector) : null;
		var carouselItem = targetImg ? targetImg.closest('.t-carousel__zoomer__item') : null;

		//set clicked slide active in zoomer slider
		if (carouselItem) {
			var carouselPosLeft = carouselItem ? carouselItem.offsetLeft : false;
			carouselItem.classList.add('active');
			sliderTrack.style.transition = 'none';
			sliderTrack.style.transform = 'translateX(' + -carouselPosLeft + 'px)';
			setTimeout(function () {
				sliderTrack.style.transition = '';
			}, 200);
		}
		if (isLazy) t_onFuncLoad('t_lazyload_update', t_lazyload_update);
	}
}

/**
 * change active slide
 *
 * @param {string} direction - slider transition direction (return to current slide, if direction is not defined)
 */
function t_zoom_showSlide(direction) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var slideItems = sliderTrack.querySelectorAll('.t-carousel__zoomer__item');
	var targetItem = sliderTrack.querySelector('.t-carousel__zoomer__item.active');
	var currentSlideIndex = 0;
	var isClickFromZoomedImg = sliderTrack.getAttribute('data-cached-zoom') === 'y';
	Array.prototype.forEach.call(slideItems, function (slideItem, index) {
		if (slideItem === targetItem) {
			currentSlideIndex = index;
		}
	});
	if (direction === 'next' || direction === 'prev') {
		var slideCount = direction === 'next' ? currentSlideIndex + 1 : slideItems.length + (currentSlideIndex - 1);
		currentSlideIndex = slideCount % slideItems.length;
		sliderTrack.setAttribute('data-on-transition', 'y');
		// fix for mobile if it used after swipe events,
		// which can be cache 0 transition before use
		// prettier-ignore
		if (window.t_zoom__isMobile && getComputedStyle(sliderTrack).transitionDuration === '0s' && !isClickFromZoomedImg) {
			sliderTrack.style.transition = '';
		}
	}

	var trackPosition = slideItems[currentSlideIndex].offsetLeft;
	targetItem.classList.remove('active');
	slideItems[currentSlideIndex].classList.add('active');
	sliderTrack.style.transform = 'translateX(' + -trackPosition + 'px)';

	// if slide changed from zoomed image, should trigger transitionend event,
	// to prevent stuck slider
	if (isClickFromZoomedImg) {
		sliderTrack.removeAttribute('data-cached-zoom');
		var transitionend = new Event('transitionend');
		sliderTrack.dispatchEvent(transitionend);
	}

	if (window.lazy === 'y') {
		t_onFuncLoad('t_lazyload_update', t_lazyload_update);
		var activeImg = slideItems[currentSlideIndex].querySelector('img');
		if (activeImg && !activeImg.src) {
			setTimeout(function () {
				t_onFuncLoad('t_lazyload_update', t_lazyload_update);
			}, 200);
		}
	}
}

/**
 * create loop for zoomer slider
 *
 * @param {string} side of slider before loop ('start' or 'end')
 * @returns {number | void} number in case of side is false via Boolean convert
 */
function t_zoom_transitForLoop(side) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var slideItems = document.querySelectorAll('.t-carousel__zoomer__item');
	var currentSlideIndex;
	var slideOffset;
	if (!side) {
		return 1;
	}
	if (side === 'start') {
		//(length - 2) because adding two cloned slides
		currentSlideIndex = slideItems.length - 2;
	}
	if (side === 'end') {
		currentSlideIndex = 1;
	}

	slideOffset = slideItems[currentSlideIndex].offsetLeft;

	Array.prototype.forEach.call(slideItems, function (slideItem, index) {
		if (index === currentSlideIndex) {
			slideItem.classList.add('active');
		} else {
			slideItem.classList.remove('active');
		}
	});

	sliderTrack.style.transition = 'none';
	sliderTrack.style.transform = 'translateX(' + -slideOffset + 'px)';

	setTimeout(function () {
		sliderTrack.style.transition = '';
		if (window.lazy === 'y') t_onFuncLoad('t_lazyload_update', t_lazyload_update);
	});
}

/**
 * adding two copy slides to the beggining and end for smooth switching of slides between first and last
 */
function t_zoom_loopSlider() {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var sliderItems = sliderTrack.querySelectorAll('.t-carousel__zoomer__item');
	var firstSlideCopy = sliderItems[0].cloneNode(true);
	var lastSlideCopy = sliderItems[sliderItems.length - 1].cloneNode(true);
	firstSlideCopy.classList.remove('active');
	lastSlideCopy.classList.remove('active');

	sliderTrack.insertBefore(lastSlideCopy, sliderTrack.firstChild);
	sliderTrack.appendChild(firstSlideCopy);

	//reinit NodeList (because querySelectorAll not live collection)
	sliderItems = sliderTrack.querySelectorAll('.t-carousel__zoomer__item');
	var slidesCount = sliderItems.length;

	var events = ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd'];

	events.forEach(function (event) {
		sliderTrack.addEventListener(event, function () {
			var currentSlideIndex = 0;
			Array.prototype.forEach.call(sliderItems, function (sliderItem, index) {
				if (sliderItem.classList.contains('active')) {
					currentSlideIndex = index;
				}
			});
			if (currentSlideIndex === 0) {
				t_zoom_transitForLoop('start');
			}
			if (currentSlideIndex === slidesCount - 1) {
				t_zoom_transitForLoop('end');
			}
			sliderTrack.setAttribute('data-on-transition', '');
		});
	});
}

function t_zoom_initCloseSwipe() {
	var modal = document.querySelector('.t-zoomer__wrapper');
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var isScaled = false;
	var modalPosition;

	var hammer = new Hammer(modal, {
		domEvents: true,
		inputClass: Hammer.TouchInput,
		cssProps: {
			touchCollout: 'default',
		},
		recognizers: [
			[
				Hammer.Pan,
				{
					direction: Hammer.DIRECTION_VERTICAL,
				},
			],
		],
	});

	hammer.on('panstart', function () {
		modalPosition = modal.offsetTop;
		modal.style.position = 'none';
		isScaled = t_zoom__isScaled(modal);
	});

	hammer.on('panmove', function (event) {
		var deltaY = Math.abs(event.deltaY);

		if (
			(sliderTrack.getAttribute('data-on-drag') !== 'y' || modal.getAttribute('data-on-drag') === 'y') &&
			((event.angle > -120 && event.angle < -60) || (event.angle < 120 && event.angle > 60)) &&
			event.maxPointers === 1 &&
			!isScaled
		) {
			if (deltaY > 40) {
				modal.setAttribute('data-on-drag', 'y');
			}

			var newTrackPosition = modalPosition + event.deltaY;
			modal.style.transform = 'translateY(' + newTrackPosition + 'px)';
		}
	});

	hammer.on('panend', t_zoom_closeSwipeHandler);
}

function t_zoom_closeSwipeHandler(event) {
	var modal = document.querySelector('.t-zoomer__wrapper');
	var closeAnimationTime = 300;
	var isScaled = t_zoom__isScaled(modal);

	modal.style.transition = 'transform ' + closeAnimationTime + 'ms ease-out';

	if (Math.abs(event.deltaY) < 40) {
		modal.style.transform = '';
	}

	if (modal.getAttribute('data-on-drag') === 'y' && event.maxPointers === 1 && !isScaled) {
		if (event.deltaY < -200 || event.velocityY < -0.3) {
			modal.style.transform = 'translateY(-100vh)';

			setTimeout(function () {
				t_zoom_close();
				modal.style.transform = '';
			}, closeAnimationTime);
		} else if (event.deltaY > 200 || event.velocityY > 0.3) {
			modal.style.transform = 'translateY(100vh)';

			setTimeout(function () {
				t_zoom_close();
				modal.style.transform = '';
			}, closeAnimationTime);
		} else {
			modal.style.transform = '';
		}
	}
	modal.setAttribute('data-on-drag', '');
}

/**
 * if zoomed image has naturalHeight/Width larger than viewport width/height,
 * we can scale this image
 */
function t_zoom_checkForScale() {
	var zoomedImage = document.querySelector('.t-carousel__zoomer__item.active .t-carousel__zoomer__img:not(.loaded)');
	if (!zoomedImage) return;

	var allRecords = document.getElementById('allrecords');
	var isLazyActive = allRecords ? allRecords.getAttribute('data-tilda-lazy') === 'yes' : false;
	if (window.lazy === 'y' || isLazyActive) {
		var timer = Date.now();
		t_zoom__waitImgForScale(zoomedImage, timer, function () {
			t_zoom_checkToScaleInit(zoomedImage);
		});
	} else if (zoomedImage.complete) {
		t_zoom_checkToScaleInit(zoomedImage);
	} else {
		zoomedImage.onload = function () {
			t_zoom_checkToScaleInit(zoomedImage);
		};
	}
}

/**
 * wait for zoomed image to contain src, natural width and height
 *
 * @param {HTMLImageElement} zoomedImage
 * @param {number} timer - Date.now()
 * @param {function} callback
 */
function t_zoom__waitImgForScale(zoomedImage, timer, callback) {
	if (zoomedImage.src && zoomedImage.naturalWidth && zoomedImage.naturalHeight) {
		callback();
		// wait no more than 3 seconds
	} else if (Date.now() - timer < 3000) {
		setTimeout(function () {
			t_zoom__waitImgForScale(zoomedImage, timer, callback);
		}, 500);
	} else {
		console.warn(
			"zoomed image isn't complete, natural width: " +
				zoomedImage.naturalWidth +
				', natural height: ' +
				zoomedImage.naturalHeight
		);
		callback();
	}
}

/**
 * we cannot check original size of svg, and then we should check, is img has .svg format,
 * and if yes, fetch original <svg> to get original height and width
 *
 * @param {HTMLImageElement} zoomedImage - current zoomed image
 */
function t_zoom_checkToScaleInit(zoomedImage) {
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var zoomerWrapper = document.querySelector('.t-zoomer__wrapper');
	zoomerWrapper.classList.remove('zoomer-no-scale');
	//prettier-ignore
	var hasOriginalSvgParams = zoomedImage.hasAttribute('data-original-svg-height') || zoomedImage.hasAttribute('data-original-svg-width');

	if (zoomedImage.src.indexOf('.svg') !== -1 && !window.isIE && !hasOriginalSvgParams) {
		t_zoom_fetchSVG(zoomedImage, windowHeight, windowWidth);
	} else if (windowHeight < zoomedImage.naturalHeight || windowWidth < zoomedImage.naturalWidth) {
		//prettier-ignore
		if (!window.isDoubletapScaleAdded && (window.t_zoom__isMobile || 'ontouchend' in document)) t_zoom_doubletapScaleInit();
		t_zoom_scale_init();
	} else {
		document.querySelector('.t-zoomer__scale').style.display = '';
		zoomerWrapper.classList.add('zoomer-no-scale');
	}
}

/**
 * get <svg> to check it real size
 *
 * @param {HTMLImageElement} zoomedImage - current image
 * @param {number} windowHeight
 * @param {number} windowWidth
 */
function t_zoom_fetchSVG(zoomedImage, windowHeight, windowWidth) {
	var url = zoomedImage.src;
	fetch(url)
		.then(function (response) {
			return response.text();
		})
		.then(function (svg) {
			var div = document.createElement('div');
			document.body.insertAdjacentElement('beforeend', div);
			div.innerHTML = svg;
			var parsedSVG = div.querySelector('svg');
			zoomedImage.setAttribute('data-original-svg-height', parsedSVG.getBBox().height.toString());
			zoomedImage.setAttribute('data-original-svg-width', parsedSVG.getBBox().width.toString());
			zoomedImage.style.width = parsedSVG.getBBox().width + 'px';
			zoomedImage.style.height = parsedSVG.getBBox().height + 'px';

			if (windowHeight < parsedSVG.getBBox().height || windowWidth < parsedSVG.getBBox().width) {
				if (!window.isDoubletapScaleAdded && (window.t_zoom__isMobile || 'ontouchend' in document))
					t_zoom_doubletapScaleInit();
				t_zoom_scale_init();
			} else {
				document.querySelector('.t-zoomer__scale').style.display = '';
			}
			document.body.removeChild(div);
		});
}

/**
 * init scale image if it possible
 */
function t_zoom_scale_init() {
	var zoomerWrapper = document.querySelector('.t-zoomer__wrapper');
	var zoomerScale = document.querySelector('.t-zoomer__scale');
	zoomerScale.style.display = 'block';
	if (zoomerScale.getAttribute('data-zoom-scale-init') !== 'y') {
		zoomerScale.setAttribute('data-zoom-scale-init', 'y');
		zoomerWrapper.addEventListener(
			'click',
			function (e) {
				var zoomedImage = document.querySelector('.t-carousel__zoomer__item.active .t-carousel__zoomer__img');
				var zoomerTrack = document.querySelector('.t-carousel__zoomer__track');
				var zoomerInner = document.querySelector('.t-carousel__zoomer__inner');
				var noScaleCurrentIMG = !zoomerWrapper.classList.contains('zoomer-no-scale');
				if (
					(window.t_zoom__isMobile && e.target.closest('.t-zoomer__scale') && noScaleCurrentIMG) ||
					(!window.t_zoom__isMobile &&
						noScaleCurrentIMG &&
						!e.target.closest('.t-zoomer__close, .t-carousel__zoomer__control'))
				) {
					zoomerTrack.setAttribute('data-on-transition', '');
					zoomerTrack.style.transition = 'none';
					zoomerTrack.style.transform = 'none';
					zoomedImage.style.maxHeight = '';
					if (zoomerWrapper.classList.contains('scale-active')) {
						t_zoom_unscale();
					} else {
						zoomerWrapper.classList.add('scale-active');
						zoomerInner.classList.add('scale-active');
						if (window.t_zoom__isMobile) {
							t_zoom_mobileZoomPositioningInit(zoomedImage);
						} else {
							t_zoom_desktopZoomPositioningInit(zoomedImage, e);
						}
					}
				}
			},
			false
		);
	}
}

/**
 * for mobile devices scale/unscale image by double tap
 */
function t_zoom_doubletapScaleInit() {
	window.isDoubletapScaleAdded = true;
	var zoomerWrapper = document.querySelector('.t-zoomer__wrapper');
	var hammer = new Hammer(zoomerWrapper, {
		domEvents: true,
		inputClass: Hammer.TouchInput,
		cssProps: {
			touchCollout: 'default',
		},
		recognizers: [[Hammer.Tap]],
	});

	hammer.on('tap', function (e) {
		if (
			e.tapCount === 2 &&
			document.body.classList.contains('t-zoomer__show') &&
			!e.target.closest('.t-carousel__zoomer__control')
		) {
			var zoomedImage = document.querySelector('.t-carousel__zoomer__item.active .t-carousel__zoomer__img');
			var zoomerInner = document.querySelector('.t-carousel__zoomer__inner');
			var zoomerTrack = document.querySelector('.t-carousel__zoomer__track');

			zoomedImage.style.maxHeight = '';
			zoomerTrack.style.transition = 'none';
			zoomerTrack.style.transform = 'none';

			if (zoomerWrapper.classList.contains('scale-active')) {
				t_zoom_unscale();
			} else {
				zoomerWrapper.classList.add('scale-active');
				zoomerInner.classList.add('scale-active');
				t_zoom_mobileZoomPositioningInit(zoomedImage);
			}
		}
	});
}

/**
 * check that the img natural params the largest then window width / height or both
 *
 * @param {HTMLImageElement} zoomedImage - current image
 * @param {MouseEvent} event - on click zoomerScale (.t-zoomer__scale)
 */
function t_zoom_desktopZoomPositioningInit(zoomedImage, event) {
	var leftCoord = (window.innerWidth - zoomedImage.offsetWidth) / 2;
	var topCoord = (window.innerHeight - zoomedImage.offsetHeight) / 2;
	var clientYpercent;
	var imageYpx;
	var clientXpercent;
	var imageXpx;

	var naturalWidth = zoomedImage.getAttribute('data-original-svg-width') || zoomedImage.naturalWidth;
	var naturalHeight = zoomedImage.getAttribute('data-original-svg-height') || zoomedImage.naturalHeight;

	zoomedImage.style.left = leftCoord + 'px';
	zoomedImage.style.top = topCoord + 'px';

	if (window.innerWidth < naturalWidth && window.innerHeight < naturalHeight) {
		clientXpercent = (event.clientX * 100) / window.innerWidth;
		imageXpx = -(clientXpercent * (naturalWidth - window.innerWidth)) / 100;
		clientYpercent = (event.clientY * 100) / window.innerHeight;
		imageYpx = -(clientYpercent * (naturalHeight - window.innerHeight)) / 100;

		zoomedImage.style.left = imageXpx + 'px';
		zoomedImage.style.top = imageYpx + 'px';

		if (window.t_zoom__isMobile) {
			zoomedImage.ontouchmove = function (e) {
				imageMoveWidth(e, zoomedImage);
				imageMoveHeight(e, zoomedImage);
			};
		} else {
			zoomedImage.onmousemove = function (e) {
				imageMoveWidth(e, zoomedImage);
				imageMoveHeight(e, zoomedImage);
			};
		}
	} else if (window.innerWidth < naturalWidth) {
		clientXpercent = (event.clientX * 100) / window.innerWidth;
		imageXpx = -(clientXpercent * (naturalWidth - window.innerWidth)) / 100;

		zoomedImage.style.left = imageXpx + 'px';

		if (window.t_zoom__isMobile) {
			zoomedImage.ontouchmove = function (e) {
				imageMoveWidth(e, zoomedImage);
			};
		} else {
			zoomedImage.onmousemove = function (e) {
				imageMoveWidth(e, zoomedImage);
			};
		}
	} else if (window.innerHeight < naturalHeight) {
		clientYpercent = (event.clientY * 100) / window.innerHeight;
		imageYpx = -(clientYpercent * (naturalHeight - window.innerHeight)) / 100;

		zoomedImage.style.top = imageYpx + 'px';

		if (window.t_zoom__isMobile) {
			zoomedImage.ontouchmove = function (e) {
				imageMoveHeight(e, zoomedImage);
			};
		} else {
			zoomedImage.onmousemove = function (e) {
				imageMoveHeight(e, zoomedImage);
			};
		}
	}

	function imageMoveWidth(e, img) {
		clientXpercent = ((e.touches !== undefined ? e.touches[0].clientX : e.clientX) * 100) / window.innerWidth;
		imageXpx = -(clientXpercent * (img.offsetWidth - window.innerWidth)) / 100;
		img.style.left = imageXpx + 'px';
	}

	function imageMoveHeight(e, img) {
		clientYpercent = ((e.touches !== undefined ? e.touches[0].clientY : e.clientY) * 100) / window.innerHeight;
		imageYpx = -(clientYpercent * (img.offsetHeight - window.innerHeight)) / 100;
		img.style.top = imageYpx + 'px';
	}
}

/**
 * @param {HTMLElement} zoomedImage
 */
function t_zoom_mobileZoomPositioningInit(zoomedImage) {
	var leftCoordinate = (window.innerWidth - zoomedImage.offsetWidth) / 2;
	var topCoordinate = (window.innerHeight - zoomedImage.offsetHeight) / 2;

	zoomedImage.style.left = leftCoordinate + 'px';
	zoomedImage.style.top = topCoordinate + 'px';

	var currentPosition = {
		x: 0,
		y: 0,
	};

	var startTouchPosition = {};
	var currentTranslate = {};

	zoomedImage.ontouchstart = function (e) {
		startTouchPosition = t_zoom_getTouchEventXY(e);
	};
	zoomedImage.ontouchmove = function (e) {
		var currentTouchPosition = t_zoom_getTouchEventXY(e);
		var moveVelocity = 1.5;
		var imageOffsetX = (currentTouchPosition.x - startTouchPosition.x) * moveVelocity;
		var imageOffsetY = (currentTouchPosition.y - startTouchPosition.y) * moveVelocity;

		currentTranslate.x = currentPosition.x + imageOffsetX;
		currentTranslate.y = currentPosition.y + imageOffsetY;

		if (currentTranslate.x > -leftCoordinate) {
			currentTranslate.x = -leftCoordinate;
		}

		if (currentTranslate.x < leftCoordinate) {
			currentTranslate.x = leftCoordinate;
		}

		if (currentTranslate.y > -topCoordinate) {
			currentTranslate.y = -topCoordinate;
		}

		if (currentTranslate.y < topCoordinate) {
			currentTranslate.y = topCoordinate;
		}
		if (zoomedImage.offsetHeight < window.innerHeight) currentTranslate.y = 0;
		zoomedImage.style.transform = 'translate(' + currentTranslate.x + 'px, ' + currentTranslate.y + 'px)';
	};
	zoomedImage.ontouchend = function () {
		currentPosition.x = currentTranslate.x;
		currentPosition.y = currentTranslate.y;
	};
	zoomedImage.ontouchcancel = function () {
		currentPosition.x = currentTranslate.x;
		currentPosition.y = currentTranslate.y;
	};
}

/**
 * @param {Event} event - ontouchstart or ontouchmove event
 * @returns {object} - coordinates of start touch position in current zoomedImage
 */
function t_zoom_getTouchEventXY(event) {
	var coordinates = {
		x: 0,
		y: 0,
	};

	if (
		event.type === 'touchstart' ||
		event.type === 'touchmove' ||
		event.type === 'touchend' ||
		event.type === 'touchcancel'
	) {
		var touch = event.touches[0] || event.changedTouches[0];

		coordinates.x = touch.pageX;
		coordinates.y = touch.pageY;
	}

	return coordinates;
}

function t_zoom_close() {
	t_zoom_unscale();
	document.body.classList.remove('t-zoomer__show');
	document.body.classList.remove('t-zoomer__show_fixed');
	var zoomContainer = document.querySelector('.t-zoomer__container');
	if (zoomContainer) zoomContainer.innerHTML = '';
	setTimeout(function () {
		document.body.classList.remove('t-zoomer__active');
	}, 200);
	t_zoom_unlockScroll();
}

/**
 * unscale zoomed image
 */
function t_zoom_unscale() {
	// prettier-ignore
	var scaledZoomerWrappers = document.querySelectorAll('.t-zoomer__wrapper.scale-active, .t-carousel__zoomer__inner.scale-active');

	Array.prototype.forEach.call(scaledZoomerWrappers, function (wrapper) {
		wrapper.classList.remove('scale-active');
	});

	var zoomedItem = document.querySelector('.t-carousel__zoomer__item.active');
	var zoomerTrack = document.querySelector('.t-carousel__zoomer__track');
	var modal = document.querySelector('.t-zoomer__wrapper');

	if (zoomedItem) {
		var image = zoomedItem.querySelector('.t-carousel__zoomer__img');
		var comment = zoomedItem.querySelector('.t-zoomer__comments');

		if (modal) {
			var imageBordersWidth = modal.offsetHeight - zoomedItem.offsetHeight;
			var height = comment ? comment.offsetHeight : 0;

			image.onmousemove = null;
			image.ontouchmove = null;
			image.style.transform = '';
			image.style.left = '';
			image.style.top = '';
			image.style.maxHeight = 'calc(100vh - ' + (imageBordersWidth + height) + 'px)';
		}
	}

	// return slider current position of active slide
	if (zoomedItem.offsetLeft !== undefined && zoomedItem.offsetTop !== undefined) {
		var trackPosition = zoomedItem.offsetLeft;
		zoomerTrack.style.transform = 'translateX(' + -trackPosition + 'px)';
	}

	if (scaledZoomerWrappers.length) zoomerTrack.setAttribute('data-cached-zoom', 'y');

	// remove transition to prevent visible return to active slide
	setTimeout(function () {
		zoomerTrack.style.transition = '';
	}, 100);
}

/**
 * lock scroll for iOS11 or Android devices
 */
function t_zoom_lockScroll() {
	var isAndroid = /(android)/i.test(navigator.userAgent);
	var isiOS11 = window.t_zoom__isiOS && window.t_zoom__iOSMajorVersion === 11 && !window.MSStream;
	if ((isiOS11 || isAndroid) && !document.body.classList.contains('t-body_scroll-locked')) {
		var bodyScrollTop = window.pageYOffset;
		document.body.classList.add('t-body_scroll-locked');
		document.body.style.top = '-' + bodyScrollTop + 'px';
		document.body.setAttribute('data-popup-scrolltop', bodyScrollTop.toString());
	}
}

/**
 * unlock scroll for iOS11 or Android devices
 */
function t_zoom_unlockScroll() {
	var isAndroid = /(android)/i.test(navigator.userAgent);
	var isiOS11 = window.t_zoom__isiOS && window.t_zoom__iOSMajorVersion === 11 && !window.MSStream;
	if ((isiOS11 || isAndroid) && document.body.classList.contains('t-body_scroll-locked')) {
		var bodyScrollTop = document.body.getAttribute('data-popup-scrolltop');
		document.body.classList.remove('t-body_scroll-locked');
		document.body.style.top = '';
		document.body.removeAttribute('data-popup-scrolltop');
		window.scrollTo(0, Number(bodyScrollTop));
	}
}

function t_zoom_initResizeListener() {
	var debouncedResizeHandler = t_throttle(function () {
		t_zoom_resizeHandler();
	});
	window.addEventListener('resize', debouncedResizeHandler);
}

function t_zoom_resizeHandler() {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	if (!sliderTrack) return;
	var activeSlidePosition = sliderTrack.querySelector('.t-carousel__zoomer__item.active').offsetLeft;
	sliderTrack.style.transform = 'translateX(' + -activeSlidePosition + 'px)';
}

/**
 * set bg color for modal and elements inside,
 * for example if it is dark, set dark bg, and white color for text and controls
 *
 * @param {HTMLElement} parent - block from which modal was called
 */
function t_zoom_setModalColor(parent) {
	var whiteColor = '#ffffff';
	var blackColor = '#000000';
	var bgColor = parent.getAttribute('data-bg-color');

	var parentBGColor = bgColor ? bgColor : whiteColor;
	parentBGColor = t_zoom_hexToRgb(parentBGColor);

	var isSnippet =
		document.getElementById('allrecords') !== document.querySelector('.t-store__product-snippet') &&
		document.getElementById('allrecords').contains(document.querySelector('.t-store__product-snippet'));
	if (isSnippet && parent) {
		parentBGColor = parent.style.backgroundColor;
	}

	var modalContainer = document.querySelector('.t-zoomer__container');
	var modalSvg = document.querySelectorAll('.t-zoomer__wrapper svg');
	var controlsBG = document.querySelectorAll('.t-zoomer__close, .t-zoomer__scale');
	var arrowsWrapper = modalContainer.querySelectorAll('.t-carousel__zoomer__arrow__wrapper');
	var modalTextColor;
	var controlsBGColor;
	var titleAndDescr = document.querySelectorAll('.t-zoomer__title, .t-zoomer__descr');

	var modalBGColor = t_zoom_luma_rgb(parentBGColor) === 'black' ? blackColor : whiteColor;

	if (modalBGColor === blackColor) {
		modalTextColor = whiteColor;
		controlsBGColor = 'rgba(1, 1, 1, 0.3)';

		Array.prototype.forEach.call(arrowsWrapper, function (arrow) {
			arrow.classList.add('t-carousel__zoomer__arrow__wrapper_dark');
		});
	} else {
		modalTextColor = blackColor;
		controlsBGColor = 'rgba(255, 255, 255, 0.3)';

		Array.prototype.forEach.call(arrowsWrapper, function (arrow) {
			arrow.classList.remove('t-carousel__zoomer__arrow__wrapper_dark');
		});
	}

	Array.prototype.forEach.call(controlsBG, function (controlBg) {
		controlBg.style.background = controlsBGColor;
	});

	modalContainer.style.backgroundColor = modalBGColor;
	modalContainer.style.color = modalTextColor;

	Array.prototype.forEach.call(modalSvg, function (svg) {
		if (svg.getAttribute('fill') === 'none') {
			svg.setAttribute('fill', 'none');
		} else {
			svg.setAttribute('fill', modalTextColor);
		}
		var modalPath = svg.querySelectorAll('path');
		if (modalPath.length > 0) {
			Array.prototype.forEach.call(modalPath, function (path) {
				if (path.getAttribute('stroke')) {
					path.setAttribute('stroke', modalTextColor);
				}
				if (path.getAttribute('fill')) {
					path.setAttribute('fill', modalTextColor);
				}
			});
		}
	});

	Array.prototype.forEach.call(titleAndDescr, function (el) {
		el.style.color = modalTextColor;
	});
}

/**
 * @param {string | Array} color in rgb format
 * @returns {string} (black | white) depending on illumination of the passed
 */
function t_zoom_luma_rgb(color) {
	var isArray = Array.isArray(color);

	if (typeof color == 'undefined') {
		return 'black';
	}
	if (color.indexOf('rgb') !== 0 && !isArray) {
		return 'black';
	}

	var rgb = isArray ? color : color.split('(')[1].split(')')[0].split(',');

	if (rgb.length < 3) {
		return 'black';
	}

	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] < 128 ? 'black' : 'white';
}

/**
 * transform from HEX to RGB
 *
 * @param {string} hex - color in hex format
 * @returns {Array} - color in RGB format
 */
function t_zoom_hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	var colorModel = result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
	return result ? [colorModel.r, colorModel.g, colorModel.b] : null;
}

/**
 * hide controls at idle time
 */
function t_zoom_setHideControlsTimer() {
	var controls = document.querySelectorAll('.t-carousel__zoomer__arrow__wrapper, .t-zoomer__scale');
	Array.prototype.forEach.call(controls, function (control) {
		control.classList.remove('t-zoomer__hide-animation');
	});
	setTimeout(function () {
		Array.prototype.forEach.call(controls, function (control) {
			control.classList.add('t-zoomer__hide-animation');
		});
	});
}

function t_zoom__isScaled(modal) {
	if (window.visualViewport) {
		return window.visualViewport.scale !== 1 || modal.classList.contains('scale-active');
	} else {
		return modal.classList.contains('scale-active');
	}
}

// Polyfill: Element.prototype.matches
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