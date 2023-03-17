function tn_addZoomEvent() {
	var layout = document.getElementsByClassName('tn-layout')[0];
	var getCursorCoordsDebounced = t_debounce(tn_getCursorCoords);
	var throttledHandler = t_throttle(tn_zoomHandler, 20);
	var cursorPosition;
	var prevScale;

	document.addEventListener('gesturestart', function (event) {
		event.preventDefault();

		prevScale = event.scale;
	});

	document.addEventListener('gesturechange', function (event) {
		event.preventDefault();

		var newCursorPosition = getCursorCoordsDebounced(event);

		if (newCursorPosition !== null) cursorPosition = newCursorPosition;

		throttledHandler(event, layout, cursorPosition, prevScale);

		prevScale = event.scale;
	});

	document.addEventListener('gestureend', function (event) {
		event.preventDefault();
	});

	document.addEventListener(
		'wheel',
		function (event) {
			if (event.ctrlKey) {
				event.preventDefault();

				var newCursorPosition = getCursorCoordsDebounced(event);

				if (newCursorPosition !== null) cursorPosition = newCursorPosition;

				throttledHandler(event, layout, cursorPosition);
			}
		},
		{passive: false},
	);
}

/**
 *
 * @param {WheelEvent} event
 * @param {HTMLElement} layout
 * @param {{pageX: number, pageY: number, screenX: number, screenY: number}} cursorPosition
 * @param {number} prevScale
 */
function tn_zoomHandler(event, layout, cursorPosition, prevScale) {
	var bgPositionEditor = document.querySelector('.bg-position-editor');
	var modDeltaY = Math.abs(event.deltaY);

	var zoomDelta = modDeltaY < 1 ? 1 : Math.round(modDeltaY);
	zoomDelta /= 100;

	var newZoom;
	if (event.scale) {
		newZoom = parseFloat((parseFloat(window.tn.zoom) + event.scale - prevScale).toFixed(2));
	} else {
		if (event.deltaY < 0) {
			newZoom = parseFloat((parseFloat(window.tn.zoom) + zoomDelta).toFixed(2));
		} else if (event.deltaY > 0) {
			newZoom = parseFloat((parseFloat(window.tn.zoom) - zoomDelta).toFixed(2));
		} else {
			newZoom = window.tn.zoom;
		}
	}

	window.tn.zoom = Math.min(Math.max(0.5, newZoom), 3);

	var scrollX = Math.max(cursorPosition.pageX * window.tn.zoom - event.clientX);
	var scrollY = Math.max(cursorPosition.pageY * window.tn.zoom - event.clientY);

	// После скейла браузер не всегда пересчитывает скролл страницы
	// Мы можем получить ситуацию когда при зуме в 0.5 скролл будет как буд-то зум в 2
	// Тут мы заставляем браузер обновить заскейленый элемент лэйаута
	// Работает в Firefox + Chrome, в Safari будут блики, но они были и до изменений
	if (!window.isSafari) {
		layout.style.willChange = 'transform';
		document.body.style.willChange = 'contents';
	}

	window.requestAnimationFrame(function () {
		$(layout).css('transform', 'scale(' + window.tn.zoom + ')');

		if (bgPositionEditor) {
			$(bgPositionEditor).css('transform', 'scale(' + window.tn.zoom + ')');
		}

		if (window.shape_editor_setZoom) window.shape_editor_setZoom(window.tn.zoom);

		$('.tn-vector-editor').css({
			width: Math.max(
				document.body.scrollWidth,
				document.documentElement.scrollWidth,
				document.body.offsetWidth,
				document.documentElement.offsetWidth,
				document.body.clientWidth,
				document.documentElement.clientWidth,
			),
			height: Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight,
				document.body.offsetHeight,
				document.documentElement.offsetHeight,
				document.body.clientHeight,
				document.documentElement.clientHeight,
			),
		});

		if (typeof scrollX !== 'undefined' && typeof scrollY !== 'undefined') window.scrollTo(scrollX, scrollY);

		if (!window.isSafari) {
			setTimeout(function () {
				layout.style.willChange = '';
				document.body.style.willChange = '';
			});
		}
	});

	tn_drawZoomButtons();
}

function tn_getCursorCoords(event) {
	return {
		pageX: (window.scrollX + event.clientX) / window.tn.zoom,
		pageY: (window.scrollY + event.clientY) / window.tn.zoom,
		screenX: event.clientX,
		screenY: event.clientY,
	};
}

function tn_zoomIn() {
	var prevZoom;
	if (window.tn.zoom >= 3) return;
	if (!window.tn.zoom) window.tn.zoom = 1;

	prevZoom = window.tn.zoom;
	window.tn.zoom += 0.1;

	tn_configureZoomPanel('in', prevZoom);
}

function tn_zoomOut() {
	var prevZoom;
	if (window.tn.zoom < 0.6) return false;
	if (!window.tn.zoom) window.tn.zoom = 1;

	prevZoom = window.tn.zoom;
	window.tn.zoom = window.tn.zoom - 0.1;

	tn_configureZoomPanel('out', prevZoom);
}

function tn_zoomReset(isResolutionChange) {
	var initialZoom = window.tn.zoom;
	var prevZoom;

	if (window.tn.zoom == 1) return;

	prevZoom = window.tn.zoom;
	window.tn.zoom = 1;
	tn_configureZoomPanel('reset', prevZoom, initialZoom, isResolutionChange);
}

function tn_configureZoomPanel(type, prevZoom, initialZoom, isResolutionChange) {
	var scrollOffset = tn_getCenterZoomOffset(prevZoom);
	var layout = document.getElementsByClassName('tn-layout')[0];
	var bgPositionEditor = document.querySelector('.bg-position-editor');
	var guides;

	if (!isResolutionChange) {
		setTimeout(function () {
			window.scrollTo(scrollOffset.x, scrollOffset.y);
			layout.style.transform = 'scale(' + window.tn.zoom + ')';

			if (bgPositionEditor) {
				bgPositionEditor.style.transform = 'scale(' + window.tn.zoom + ')';
			}
		});
	} else {
		window.scrollTo(scrollOffset.x, scrollOffset.y);
		layout.style.transform = 'scale(' + window.tn.zoom + ')';

		if (bgPositionEditor) {
			bgPositionEditor.style.transform = 'scale(' + window.tn.zoom + ')';
		}
	}

	if (window.tn.zoom <= 1) {
		guides = document.getElementsByClassName('tn-guides__line');

		if (guides.length) {
			for (var i in guides) {
				guides.item(i).style.transform = 'scale(' + 1 / window.tn.zoom + ')';
			}
		}
	}

	tn_drawZoomButtons();
}

function tn_getCenterZoomOffset(prevZoom) {
	var centerX = window.scrollX + window.innerWidth / 2;
	var centerY = window.scrollY + window.innerHeight / 2;
	var originalScrollX = centerX / prevZoom - window.innerWidth / 2;
	var originalScrollY = centerY / prevZoom - window.innerHeight / 2;
	var newScrollX = originalScrollX * window.tn.zoom + (window.innerWidth / 2) * (window.tn.zoom - 1);
	var newScrollY = originalScrollY * window.tn.zoom + (window.innerHeight / 2) * (window.tn.zoom - 1);

	return {
		x: newScrollX,
		y: newScrollY,
	};
}

function tn_drawZoomButtons() {
	if (window.tn.zoom !== 1 && !$('.tn-zoom-wrapper').length) {
		// prettier-ignore
		var zoomStr =
			'<td class="tn-zoom-wrapper">' +
			  '<div class="tn-zoom-wrapper__container">' +
			    '<div class="tn-zoom-wrapper__btn tn-zoom-wrapper__btn_out">–</div>' +
			    '<div class="tn-zoom-wrapper__scale">' + Math.round(100 * window.tn.zoom) + '%</div>' +
			    '<div class="tn-zoom-wrapper__btn tn-zoom-wrapper__btn_in">+</div>' +
			    '<div class="tn-zoom-wrapper__btn tn-zoom-wrapper__btn_reset">RESET</div>' +
			  '</div>' +
			'</td>';

		$('.tn-add-wrapper').parent('td').after(zoomStr);
		$('.tn-zoom-wrapper .tn-zoom-wrapper__btn_out').click(tn_zoomOut);
		$('.tn-zoom-wrapper .tn-zoom-wrapper__btn_in').click(tn_zoomIn);
		$('.tn-zoom-wrapper .tn-zoom-wrapper__btn_reset').click(tn_zoomReset);
	} else if (window.tn.zoom == 1) {
		clearTimeout(window.tn.zoomTimeout);

		$('.tn-zoom-wrapper__scale').text(Math.round(100 * window.tn.zoom) + '%');

		window.tn.zoomTimeout = setTimeout(function () {
			if (window.tn.zoom == 1) {
				$('.tn-zoom-wrapper').fadeOut(300, function () {
					$(this).remove();
				});
			}
		}, 7000);
	} else {
		$('.tn-zoom-wrapper__scale').text(Math.round(100 * window.tn.zoom) + '%');
	}
}
