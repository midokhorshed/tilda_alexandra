/**
 * tilda-zoom-2.0 use in case user add action in his block by the setting "zoom image on click". It's can be in blocks category image, catalog, about, news, feeds, and gallery (carousel or img blocks grid)
 */
if (document.readyState !== 'loading') {
	if (!window.tzoominited) {
		t_zoom_onFuncLoad('t_initZoom', t_initZoom);
	}
} else {
	document.addEventListener('DOMContentLoaded', function () {
		if (!window.tzoominited) {
			t_zoom_onFuncLoad('t_initZoom', t_initZoom);
		}
	});
}

/**
 * get zoomerWrapper element, and if it exist - create carousel with zoom in modal
 */
function t_initZoom() {
	var zoomerWrapper = document.querySelectorAll('.t-zoomer__wrapper');
	if (!zoomerWrapper.length) {
		window.tzoominited = true;
		window.tzoomopenonce = false;
		window.isDoubletapScaleAdded = false;
		var zoomableElmnts = document.querySelectorAll('[data-zoomable="yes"]:not(.t-slds__thumbs_gallery):not([data-img-zoom-url=""])');
		Array.prototype.forEach.call(zoomableElmnts, function (zoomableEl) {
			zoomableEl.classList.add('t-zoomable');
		});
		document.body.insertAdjacentHTML('beforeend',
			'<div class="t-zoomer__wrapper">' +
			'<div class="t-zoomer__container">' +
			'</div>' +
			'<div class="t-zoomer__bg"></div>' +
			'<div class="t-zoomer__close" style="display:none;">' +
			'<svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M1.41421 -0.000151038L0 1.41406L21.2132 22.6273L22.6274 21.2131L1.41421 -0.000151038Z" fill="black"/>' +
			'<path d="M22.6291 1.41421L21.2148 0L0.00164068 21.2132L1.41585 22.6274L22.6291 1.41421Z" fill="black"/>' +
			'</svg>' +
			'</div>' +
			'</div>');

		document.querySelector('.t-zoomer__wrapper').insertAdjacentHTML('beforeend',
			'<div class="t-zoomer__scale showed" style="display:none;">' +
			'<svg class="icon-increase" width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M22.832 22L17.8592 17.0273" stroke="black" stroke-width="2" stroke-linecap="square"/>' +
			'<path fill-rule="evenodd" clip-rule="evenodd" d="M4.58591 3.7511C0.917768 7.41924 0.917768 13.367 4.58591 17.0352C8.25405 20.7033 14.2019 20.7033 17.87 17.0352C21.5381 13.367 21.5381 7.41924 17.87 3.7511C14.2019 0.0829653 8.25405 0.0829653 4.58591 3.7511Z" stroke="black" stroke-width="2"/>' +
			'<path d="M6.25781 10.3931H16.2035" stroke="black" stroke-width="2"/>' +
			'<path d="M11.2305 15.3662V5.42053" stroke="black" stroke-width="2"/>' +
			'</svg>' +
			'<svg class="icon-decrease" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
			'<path d="M21.9961 22L17.0233 17.0273" stroke="black" stroke-width="2" stroke-linecap="square"/>' +
			'<path fill-rule="evenodd" clip-rule="evenodd" d="M3.74997 3.7511C0.0818308 7.41924 0.0818308 13.367 3.74997 17.0352C7.41811 20.7033 13.3659 20.7033 17.0341 17.0352C20.7022 13.367 20.7022 7.41924 17.0341 3.7511C13.3659 0.0829653 7.41811 0.0829653 3.74997 3.7511Z" stroke="black" stroke-width="2"/>' +
			'<path d="M5.41797 10.3931H15.3637" stroke="black" stroke-width="2"/>' +
			'</svg>' +
			'</div>'
		);

		t_zoom__initFullScreenImgOnClick();
		t_zoom__closeCarousel();
	}
}

function t_zoom__initFullScreenImgOnClick() {
	var sections = document.querySelectorAll('.r');
	Array.prototype.forEach.call(sections, function (section) {
		section.addEventListener('click', function (e) {
			var target = e.target;
			for (target; target && target !== this; target = target.parentNode) {
				if (target.matches('.t-zoomable:not([data-img-zoom-url=""])') || target.matches('.t-slds__thumbs_gallery-zoomable')) {
					t_zoomHandler.call(target, e);
					break;
				}
			}
		});
	});
}

function t_zoom__closeCarousel() {
	var zoomerCloseAndBg = document.querySelectorAll('.t-zoomer__close, .t-zoomer__bg');
	Array.prototype.forEach.call(zoomerCloseAndBg, function (el) {
		el.addEventListener('click', function () {
			t_zoom_close();
			var isPopupShown = !!document.querySelectorAll('.t-popup_show').length;
			if (isPopupShown) {
				document.addEventListener('keydown', function (e) {
					if (e.keyCode === 27 && window.t_store_closePopup) {
						t_store_closePopup(false);
					}
				});
			}
		});
	});
}

/**
 * init zoom controls (arrows/dots)
 * @returns {false| void} false - in case of JS cannot find parent (.r) or zoomerWrapper
 */
function t_zoomHandler() {
	//this in this context - e.target when user clicked on '.t-zoomable:not([data-img-zoom-url=""])' or '.t-slds__thumbs_gallery-zoomable' block (this block itself)
	var targetElement = this;
	document.body.classList.add('t-zoomer__show');
	var zoomerContainers = document.querySelectorAll('.t-zoomer__container');
	Array.prototype.forEach.call(zoomerContainers, function (zoomerContainer) {
		zoomerContainer.innerHTML = '<div class="t-carousel__zoomed">' +
			'<div class="t-carousel__zoomer__slides">' +
			'<div class="t-carousel__zoomer__inner">' +
			'<div class="t-carousel__zoomer__track">' +
			'</div>' +
			'</div>' +
			'<div class="t-carousel__zoomer__control t-carousel__zoomer__control_left" data-zoomer-slide="prev">' +
			'<div class="t-carousel__zoomer__arrow__wrapper t-carousel__zoomer__arrow__wrapper_left">' +
			'<div class="t-carousel__zoomer__arrow t-carousel__zoomer__arrow_left t-carousel__zoomer__arrow_small"></div>' +
			'</div>' +
			'</div>' +
			'<div class="t-carousel__zoomer__control t-carousel__zoomer__control_right" data-zoomer-slide="next">' +
			'<div class="t-carousel__zoomer__arrow__wrapper t-carousel__zoomer__arrow__wrapper_right">' +
			'<div class="t-carousel__zoomer__arrow t-carousel__zoomer__arrow_right t-carousel__zoomer__arrow_small"></div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>';
	});

	var parentBlock = targetElement.closest('.r');

	if (!parentBlock) return false;

	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');

	if (!sliderTrack) return false;

	t_zoom__addingImgsIntoCarousel(targetElement);

	var closeBtn = document.querySelector('.t-zoomer__close');
	if (closeBtn) {
		closeBtn.style.display = 'flex';
	}

	t_zoom_setModalColor(parentBlock);
	t_zoom__createAndLoopSlider(targetElement);
	t_zoom__getEventOnBtn();
	t_zoom__closeZoomOnKeyup();

	document.body.classList.add('t-zoomer__show_fixed');

	t_zoom__initSingleZoom();
	t_zoom__setEventOnZoomerInner();
	t_zoom_checkForScale();
	t_zoom_lockScroll();
	t_zoom_initSwipe();
	t_zoom_initCloseSwipe();
	t_zoom_initResizeListener();

	window.tzoomopenonce = true;

	t_zoom__initEventsonMobile();
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

		//TODO: перенес условие выше, перед всеми инитами, тк при каждой инициализации sliderTrack всё равно остается в DOM, и на него накладываются ивенты hammer'а. Если я что-то не учел/не увидел, то поправьте, я верну на прежнее место.
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
				if (sliderTrackTransition !== 'y' && modalOnDrag !== 'y' &&
					event.maxPointers === 1 &&
					!isScaled) {
					sliderTrack.style.transition = '';
					var velocity = Math.abs(event.velocityX);
					var sliderTrackOffset = sliderTrack.offsetLeft;
					var slideWidth = slideItems[0].offsetWidth;
					var targetSlideOffset = sliderTrack.querySelector('.t-carousel__zoomer__item.active').offsetLeft;
					var distance = slideWidth - Math.abs(sliderTrackOffset + targetSlideOffset);
					var transitionTime = (distance / velocity) / 1000;

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

function t_zoom__initEventsonMobile() {
	if (window.isMobile) {
		t_zoom_setHideControlsTimer();
		var modal = document.querySelector('.t-zoomer__wrapper');
		var modalListeners = ['touchstart', 'touchmove', 'touchend', 'mousemove'];
		Array.prototype.forEach.call(modalListeners, function (listener) {
			modal.addEventListener(listener, t_zoom_setHideControlsTimer);
		});
	}
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

function t_zoom__closeZoomOnKeyup() {
	// TODO: удалить после рефакторинга блоков ST
	if (typeof jQuery !== 'undefined') {
		$(document).unbind('keydown');
	}
	document.onkeydown = null;
	var isPopupShown = !!document.querySelectorAll('.t-popup_show').length;
	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 37:
				t_zoom__setEventOnBtn('prev');
				break;
			case 39:
				t_zoom__setEventOnBtn('next');
				break;
			case 27:
				t_zoom_close();
				if (isPopupShown) {
					document.onkeydown = function (e) {
						if (e.keyCode === 27) {
							t_store_closePopup(false);
						}
					};
				}
				break;
			default:
				break;
		}
	};
}

function t_zoom__setEventOnZoomerInner() {
	var carouselZooomerInner = document.querySelector('.t-carousel__zoomer__inner');
	carouselZooomerInner.addEventListener('click', function () {
		if (window.isMobile) return false;
		if (carouselZooomerInner.classList.contains('scale-active')) {
			t_zoom_unscale();
		} else {
			t_zoom_close();
		}
	});
}

function t_zoom__getEventOnBtn() {
	var navBtns = [{
		name: 'right',
		move: 'next'
	},
	{
		name: 'left',
		move: 'prev'
	}];

	Array.prototype.forEach.call(navBtns, function (navBtn) {
		var arrowBtn = document.querySelector('.t-carousel__zoomer__control_' + navBtn.name);
		arrowBtn.addEventListener('click', function () {
			t_zoom__setEventOnBtn(navBtn.move);
		});
	});
}

function t_zoom__setEventOnBtn(btnMove) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var modal = document.querySelector('.t-zoomer__wrapper');
	var sliderOnTransition = sliderTrack.getAttribute('data-on-transition');
	var modalOnDrag = modal.getAttribute('data-on-drag');
	if (sliderOnTransition !== 'y' && modalOnDrag !== 'y') {
		t_zoom_unscale();
		setTimeout(function () {
			t_zoom_showSlide(btnMove);
			t_zoom_checkForScale();
		});
	}
}

function t_zoom__addingImgsIntoCarousel(targetElement) {
	var parentBlock = targetElement.closest('.r');
	var images = parentBlock.querySelectorAll('.t-zoomable:not(.t-slds__thumbs_gallery):not(.tn-atom__slds-img)');

	if (parentBlock.querySelectorAll('.t-slds').length) {
		var slider = targetElement.closest('.t-slds');
		if (slider) {
			images = slider.querySelectorAll('.t-zoomable:not(.t-slds__thumbs_gallery)');
		}
	}
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	Array.prototype.forEach.call(images, function (img) {
		var dataZoomAttr = img.getAttribute('data-img-zoom-url');
		var imgTitle = '';
		var imgDescr = '';
		var titleBody = '';
		var descrBody = '';
		var imgURLs = dataZoomAttr ? dataZoomAttr.split(',') : '';
		if (img.nodeName === 'IMG' || img.nodeName === 'DIV') {
			imgTitle = img.getAttribute('title') || '';
			imgDescr = img.getAttribute('data-img-zoom-descr') || '';
		}
		if (imgTitle) {
			titleBody = '<div class="t-zoomer__title t-name t-descr_xxs">' + imgTitle + '</div>';
		}
		if (imgDescr) {
			descrBody = '<div class="t-zoomer__descr t-descr t-descr_xxs">' + imgDescr + '</div>';
		}

		sliderTrack.insertAdjacentHTML('beforeend',
			'<div class="t-carousel__zoomer__item">' +
			'<div class="t-carousel__zoomer__wrapper">' +
			'<img class="t-carousel__zoomer__img" src="' + imgURLs + '">' +
			'</div>' +
			'<div class="t-zoomer__comments">' + titleBody + descrBody + '</div>' +
			'</div>');
	});
}

function t_zoom__createAndLoopSlider(targetElement) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var modal = document.querySelector('.t-zoomer__wrapper');
	var slideItems = document.querySelectorAll('.t-carousel__zoomer__item');
	var maxCommentsHeight = 0;
	if (modal && slideItems.length) {
		var imageBordersWidth = modal.offsetHeight - slideItems.offsetHeight;

		Array.prototype.forEach.call(slideItems, function (slideItem) {

			var zoomerComments = slideItem.querySelectorAll('.t-zoomer__comments');

			Array.prototype.forEach.call(zoomerComments, function (comment) {
				var zoomerTitle = comment.querySelector('.t-zoomer__title');
				var zoomerDescr = comment.querySelector('.t-zoomer__descr');
				if (!zoomerTitle && !zoomerDescr) {
					comment.style.padding = 0;
				}
				var commentHeight = comment.offsetHeight;
				maxCommentsHeight = maxCommentsHeight > commentHeight ? maxCommentsHeight : commentHeight;
				comment.style.height = maxCommentsHeight + 'px';
			});

			var zoomedImages = slideItem.querySelectorAll('.t-carousel__zoomer__img');
			Array.prototype.forEach.call(zoomedImages, function (zoomedImg) {
				zoomedImg.style.maxHeight = 'calc(100vh - ' + (maxCommentsHeight + imageBordersWidth) + 'px';
				var ZoomedImgSrc = zoomedImg.getAttribute('src');
				if (ZoomedImgSrc && ZoomedImgSrc.indexOf('.svg') !== -1) {
					zoomedImg.style.width = window.innerWidth + 'px';
				}
			});

			var arrowWrappers = document.querySelectorAll('.t-carousel__zoomer__arrow__wrapper');
			Array.prototype.forEach.call(arrowWrappers, function (arrowWrapper) {
				arrowWrapper.style.top = 'calc(50% - ' + (maxCommentsHeight / 2) + 'px)';
			});
		});

		var targetURL = targetElement.getAttribute('data-img-zoom-url');
		var targetImg = targetURL ? document.querySelector('.t-carousel__zoomer__img[src="' + targetURL + '"]') : false;
		var carouselItem = targetImg ? targetImg.closest('.t-carousel__zoomer__item') : false;
		Array.prototype.forEach.call(slideItems, function (slideItem, index) {
			slideItem.setAttribute('data-zoomer-slide-number', index);
		});
		if (slideItems.length > 1) {
			t_zoom_loopSlider();
		}
		var carouselPosLeft = carouselItem ? carouselItem.offsetLeft : false;
		if (carouselItem) {
			carouselItem.classList.add('active');
			sliderTrack.style.transition = 'none';
			sliderTrack.style.transform = 'translateX(' + -carouselPosLeft + 'px)';
			setTimeout(function () {
				sliderTrack.style.transition = '';
			});
		}
	}
}

/**
 * @param {string} direction - slider transition direction (return to current slide, if direction is not defined)
 */
function t_zoom_showSlide(direction) {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var slideItems = sliderTrack.querySelectorAll('.t-carousel__zoomer__item');
	var targetItem = sliderTrack.querySelector('.t-carousel__zoomer__item.active');
	var currentSlideIndex = 0;
	Array.prototype.forEach.call(slideItems, function (slideItem, index) {
		if (slideItem === targetItem) {
			currentSlideIndex = index;
		}
	});
	switch (direction) {
		case 'next':
			currentSlideIndex = (currentSlideIndex + 1) % slideItems.length;
			sliderTrack.setAttribute('data-on-transition', 'y');
			break;
		case 'prev':
			currentSlideIndex = (slideItems.length + (currentSlideIndex - 1)) % slideItems.length;
			sliderTrack.setAttribute('data-on-transition', 'y');
			break;
	}

	var trackPosition = slideItems[currentSlideIndex].offsetLeft;
	targetItem.classList.remove('active');
	slideItems[currentSlideIndex].classList.add('active');
	sliderTrack.style.transform = 'translateX(' + (-trackPosition) + 'px';
}

/**
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

	Array.prototype.forEach.call(events, function (event) {
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

		if ((sliderTrack.getAttribute('data-on-drag') !== 'y' || modal.getAttribute('data-on-drag') === 'y') &&
			((event.angle > -120 && event.angle < -60) || (event.angle < 120 && event.angle > 60)) &&
			event.maxPointers === 1 &&
			!isScaled) {
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

	if (modal.getAttribute('data-on-drag') === 'y' &&
		event.maxPointers === 1 &&
		!isScaled) {
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


function t_zoom_checkForScale() {
	var eventAdded = false;
	var zoomedImage = document.querySelector('.t-carousel__zoomer__item.active .t-carousel__zoomer__img:not(.loaded)');
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;

	if (!zoomedImage) return;

	zoomedImage.onload = function () {
		if (eventAdded) return;
		if (windowHeight < zoomedImage.naturalHeight || windowWidth < zoomedImage.naturalWidth) {
			zoomedImage.classList.add('loaded');
			if (!window.isDoubletapScaleAdded) t_zoom_doubletapScaleInit();
			t_zoom_scale_init();
			return;
		}
	};

	if (zoomedImage.complete && !eventAdded) {
		eventAdded = true;
		if (windowHeight < zoomedImage.naturalHeight || windowWidth < zoomedImage.naturalWidth) {
			if (!window.isDoubletapScaleAdded) t_zoom_doubletapScaleInit();
			t_zoom_scale_init();
			return;
		} else {
			document.querySelector('.t-zoomer__scale').style.display = '';
		}
	}
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
		zoomerWrapper.addEventListener('click', function (e) {
			var zoomedImage = document.querySelector('.t-carousel__zoomer__item.active .t-carousel__zoomer__img');
			var zoomerTrack = document.querySelector('.t-carousel__zoomer__track');
			var zoomerInner = document.querySelector('.t-carousel__zoomer__inner');
			for (var target = e.target; target && target != this; target = target.parentNode) {
				if (target === zoomerScale) {
					zoomerTrack.setAttribute('data-on-transition', '');
					zoomerTrack.style.transition = 'none';
					zoomerTrack.style.transform = 'none';
					zoomedImage.style.maxHeight = '';
					if (zoomerWrapper.classList.contains('scale-active')) {
						t_zoom_unscale();
					} else {
						zoomerWrapper.classList.add('scale-active');
						zoomerInner.classList.add('scale-active');
						if (window.isMobile) {
							t_zoom_mobileZoomPositioningInit(zoomedImage);
						} else {
							t_zoom_desktopZoomPositioningInit(zoomedImage, e);
						}
					}
					break;
				}
			}
		}, false);
	}
}

function t_zoom_doubletapScaleInit() {
	window.isDoubletapScaleAdded = true;
	var zoomerWrapper = document.querySelector('.t-zoomer__wrapper');
	var hammer = new Hammer(zoomerWrapper, {
		domEvents: true,
		inputClass: Hammer.TouchInput,
		cssProps: {
			touchCollout: 'default',
		},
		recognizers: [
			[
				Hammer.Tap,
			],
		],
	});

	hammer.on('tap', function (e) {
		if (e.tapCount === 2 &&
			document.body.classList.contains('t-zoomer__show') &&
			!e.target.closest('.t-carousel__zoomer__control')) {

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
 * check that the img natural params largest then window width / height or both
 * @param {HTMLElement} zoomedImage - current image
 * @param {Event} event - on click zoomerScale (.t-zoomer__scale)
 */
function t_zoom_desktopZoomPositioningInit(zoomedImage, event) {
	var leftCoord = (window.innerWidth - zoomedImage.offsetWidth) / 2;
	var topCoord = (window.innerHeight - zoomedImage.offsetHeight) / 2;
	var clientYpercent;
	var imageYpx;
	var clientXpercent;
	var imageXpx;

	zoomedImage.style.left = leftCoord + 'px';
	zoomedImage.style.top = topCoord + 'px';

	if (window.innerWidth < zoomedImage.naturalWidth && window.innerHeight < zoomedImage.naturalHeight) {
		clientXpercent = (event.clientX * 100) / window.innerWidth;
		imageXpx = -(clientXpercent * (zoomedImage.offsetWidth - window.innerWidth)) / 100;
		clientYpercent = (event.clientY * 100) / window.innerHeight;
		imageYpx = -(clientYpercent * (zoomedImage.offsetHeight - window.innerHeight)) / 100;

		zoomedImage.style.left = imageXpx + 'px';
		zoomedImage.style.top = imageYpx + 'px';

		if (window.isMobile) {
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

	} else if (window.innerWidth < zoomedImage.naturalWidth) {
		clientXpercent = (event.clientX * 100) / window.innerWidth;
		imageXpx = -(clientXpercent * (zoomedImage.offsetWidth - window.innerWidth)) / 100;

		zoomedImage.style.left = imageXpx + 'px';

		if (window.isMobile) {
			zoomedImage.ontouchmove = function (e) {
				imageMoveWidth(e, zoomedImage);
			};
		} else {
			zoomedImage.onmousemove = function (e) {
				imageMoveWidth(e, zoomedImage);
			};
		}

	} else if (window.innerHeight < zoomedImage.naturalHeight) {
		clientYpercent = (event.clientY * 100) / window.innerHeight;
		imageYpx = -(clientYpercent * (zoomedImage.offsetHeight - window.innerHeight)) / 100;

		zoomedImage.style.top = imageYpx + 'px';

		if (window.isMobile) {
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
		clientXpercent = (e.touches !== undefined ? e.touches[0].clientX : e.clientX) * 100 / window.innerWidth;
		imageXpx = -(clientXpercent * (img.offsetWidth - window.innerWidth)) / 100;
		img.style.left = imageXpx + 'px';
	}
	function imageMoveHeight(e, img) {
		clientYpercent = (e.touches !== undefined ? e.touches[0].clientY : e.clientY) * 100 / window.innerHeight;
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

	if (event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel') {
		var touch = event.touches[0] || event.changedTouches[0];

		coordinates.x = touch.pageX;
		coordinates.y = touch.pageY;
	}

	return coordinates;
}

function t_zoom_close() {
	t_zoom_unscale();
	document.body.classList.remove('t-zoomer__show', 't-zoomer__show_fixed');
	document.onkeydown = null;
	t_zoom_unlockScroll();
}

function t_zoom_unscale() {
	var scaledZoomerWrappers = document.querySelectorAll('.t-zoomer__wrapper.scale-active, .t-carousel__zoomer__inner');
	Array.prototype.forEach.call(scaledZoomerWrappers, function (wrapper) {
		wrapper.classList.remove('scale-active');
	});

	var zoomedItem = document.querySelector('.t-carousel__zoomer__item.active');
	var zoomerTrack = document.querySelector('.t-carousel__zoomer__track');
	var modal = document.querySelector('.t-zoomer__wrapper');
	if (zoomedItem) {
		var zoomedImages = document.querySelectorAll('.t-carousel__zoomer__img');
		var zoomerComments = zoomedItem.querySelector('.t-zoomer__comments');
		if (zoomerComments && modal) {
			Array.prototype.forEach.call(zoomedImages, function (zoomedImage) {
				var imageBordersWidth = modal.offsetHeight - zoomedItem.offsetHeight;
				var height = zoomerComments.offsetHeight;
				zoomedImage.onmousemove = null;
				zoomedImage.ontouchmove = null;
				zoomedImage.style.transform = '';
				zoomedImage.style.left = '';
				zoomedImage.style.top = '';
				zoomedImage.style.maxHeight = 'calc(100vh - ' + (imageBordersWidth + height) + 'px)';
			});
		}
	}

	if (zoomedItem.offsetLeft !== undefined && zoomedItem.offsetTop !== undefined) {
		var trackPosition = zoomedItem.offsetLeft;
		zoomerTrack.style.transform = 'translateX(' + -trackPosition + 'px)';
	}

	setTimeout(function () {
		zoomerTrack.style.transition = '';
	});
}

function t_zoom_lockScroll() {
	var isAndroid = /(android)/i.test(navigator.userAgent);
	if ((window.isiOS && !window.MSStream) || isAndroid) {
		if ((window.isiOSVersion && window.isiOSVersion) || isAndroid) {
			if (window.isiOSVersion[0] === 11 || isAndroid) {
				if (!document.body.classList.contains('t-body_scroll-locked')) {
					var bodyScrollTop =
						typeof window.pageYOffset !== 'undefined' ?
							window.pageYOffset :
							(
								document.documentElement ||
								document.body.parentNode ||
								document.body
							).scrollTop;
					document.body.classList.add('t-body_scroll-locked');
					document.body.style.top = '-' + bodyScrollTop + 'px';
					document.body.setAttribute('data-popup-scrolltop', bodyScrollTop);
				}
			}
		}
	}
}

function t_zoom_unlockScroll() {
	var isAndroid = /(android)/i.test(navigator.userAgent);
	if ((window.isiOS && !window.MSStream) || isAndroid) {
		if ((window.isiOSVersion && window.isiOSVersion) || isAndroid) {
			if (window.isiOSVersion[0] === 11 || isAndroid) {
				if (document.body.classList.contains('t-body_scroll-locked')) {
					var bodyScrollTop = document.body.getAttribute('data-popup-scrolltop');
					document.body.classList.remove('t-body_scroll-locked');
					document.body.style.top = '';
					document.body.removeAttribute('data-popup-scrolltop');
					window.scrollTo(0, bodyScrollTop);
				}
			}
		}
	}
}

function t_zoom_initResizeListener() {
	var debouncedResizeHandler = t_throttle(t_zoom_resizeHandler, 300);
	window.addEventListener('resize', debouncedResizeHandler);
}

function t_zoom_resizeHandler() {
	var sliderTrack = document.querySelector('.t-carousel__zoomer__track');
	var activeSlidePosition = sliderTrack.querySelector('.t-carousel__zoomer__item.active').offsetLeft;
	sliderTrack.style.transform = 'translateX(' + -activeSlidePosition + 'px)';
}

function t_zoom_onFuncLoad(funcName, okFunc, time) {
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
 * @param {HTMLElement} parent - block from which modal was called
 */
function t_zoom_setModalColor(parent) {
	var COLOR_WHITE = '#ffffff';
	var COLOR_BLACK = '#000000';
	var bgColor = parent.getAttribute('data-bg-color');

	var parentBGColor = bgColor ? bgColor : COLOR_WHITE;

	parentBGColor = t_zoom_hexToRgb(parentBGColor);

	var modalContainer = document.querySelector('.t-zoomer__container');
	var modalSvg = document.querySelectorAll('.t-zoomer__wrapper svg');
	var controlsBG = document.querySelectorAll('.t-zoomer__close, .t-zoomer__scale');
	var arrowsWrapper = modalContainer.querySelectorAll('.t-carousel__zoomer__arrow__wrapper');
	var modalTextColor;
	var controlsBGColor;
	var titleAndDescr = document.querySelectorAll('.t-zoomer__title, .t-zoomer__descr');

	var modalBGColor = t_zoom_luma_rgb(parentBGColor) === 'black' ? COLOR_BLACK : COLOR_WHITE;

	if (modalBGColor === COLOR_BLACK) {
		modalTextColor = COLOR_WHITE;
		controlsBGColor = 'rgba(1, 1, 1, 0.3)';

		Array.prototype.forEach.call(arrowsWrapper, function (arrow) {
			arrow.classList.add('t-carousel__zoomer__arrow__wrapper_dark');
		});
	} else {
		modalTextColor = COLOR_BLACK;
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
 * @returns {string} (black | white) depending of illumination of the passed
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

	return ((0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])) < 128 ? 'black' : 'white';
}

/**
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
	var aaa = result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
	return result ? [aaa.r, aaa.g, aaa.b] : null;
}

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