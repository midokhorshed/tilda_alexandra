function tn_vector__openEditor(elem_id) {
	window.tn_flag_settings_ui_focus = true;

	var leftBox = document.querySelector('.tn-left-box');
	var isLeftBoxOpened = leftBox ? leftBox.classList.contains('tn-left-box_show') : false;
	var elem = $('#' + elem_id);
	var atom = elem.find('.tn-atom');
	var jsonValue = elem__getFieldValue(elem, 'vectorjson');
	var documentHeight = Math.max(
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.body.offsetHeight,
		document.documentElement.offsetHeight,
		document.body.clientHeight,
		document.documentElement.clientHeight,
	);
	var documentWidth = Math.max(
		document.body.scrollWidth,
		document.documentElement.scrollWidth,
		document.body.offsetWidth,
		document.documentElement.offsetWidth,
		document.body.clientWidth,
		document.documentElement.clientWidth,
	);

	var scaleValue = elem__getFieldValue(elem, 'width') / elem__getFieldValue(elem, 'filewidth') || 1;

	var elParams = {
		top: (elem.get(0).getBoundingClientRect().top + window.pageYOffset) / window.tn.zoom,
		left: (elem.get(0).getBoundingClientRect().left + window.pageXOffset) / window.tn.zoom,
		scale: scaleValue,
		zoom: window.tn.zoom || 1,
	};

	tn_vector__loadVectorLib('shape-editor', elem.get(0), function () {
		var vectorEditor = $('.tn-vector-editor');
		if (!vectorEditor.length) {
			$('body').append(
				'<div class="tn-vector-editor" style="height:' +
					documentHeight / window.tn.zoom +
					'px; width:' +
					documentWidth / window.tn.zoom +
					'px;"></div>',
			);
		} else {
			vectorEditor.css({
				'display': 'block',
				'height': documentHeight / window.tn.zoom,
				'width': documentWidth / window.tn.zoom,
			});
		}

		document.removeEventListener('keydown', tn_vector__createPanoramaEvent);
		document.removeEventListener('keyup', tn_vector__removePanoramaEvent);
		document.addEventListener('keydown', tn_vector__createPanoramaEvent);
		document.addEventListener('keyup', tn_vector__removePanoramaEvent);

		tn_onFuncLoad(
			'shape_editor_init',
			function () {
				elem.css('display', 'none');
				$('.tn-axis').css('display', 'none');
				tn_hideOutline('selected');

				// hide UI, but still show grid-container and grid
				tn_toggleUI();
				$('.tn-canvas-min').removeClass('tn-canvas-min_noborder');
				tn_showGrid();
				ab__control__toggle__update('ui_show');
				shape_editor_init(document.querySelector('.tn-vector-editor'), jsonValue, elParams, function (json, svg) {
					var updatedSVG;
					if (json && svg) {
						updatedSVG = JSON.parse(json);
						if (updatedSVG.p && updatedSVG.p.length) {
							var updatedTopPos = updatedSVG.b ? updatedSVG.b.y || 0 : 0;
							var updatedLeftPos = updatedSVG.b ? updatedSVG.b.x || 0 : 0;
							var updatedWidth = updatedSVG.b ? updatedSVG.b.w || 0 : 0;
							var updatedHeight = updatedSVG.b ? updatedSVG.b.h || 0 : 0;

							var left = elem__convertPosition__Absolute__toLocal(elem, 'left', updatedLeftPos);
							var top = elem__convertPosition__Absolute__toLocal(elem, 'top', updatedTopPos);

							elem__setFieldValue(elem, 'left', left, 'render', 'updateui');
							elem__setFieldValue(elem, 'top', top, 'render', 'updateui');

							if (updatedWidth && updatedHeight) {
								updatedWidth = parseInt(updatedWidth.toFixed(0), 10);
								updatedHeight = parseInt(updatedHeight.toFixed(0), 10);
								elem__setFieldValue(elem, 'width', updatedWidth, 'render', 'updateui');
								elem__setFieldValue(elem, 'filewidth', updatedWidth, 'render', '', window.tn.topResolution);
								elem__setFieldValue(elem, 'fileheight', updatedHeight, 'render', '', window.tn.topResolution);
							}

							elem__setFieldValue(elem, 'vectorjson', json, 'render', 'updateui', window.tn.topResolution);
							atom.html(svg);
						}
					}

					vectorEditor = $('.tn-vector-editor');
					vectorEditor.css('display', 'none');
					$('.tn-axis').css('display', '');
					vectorEditor.find('svg').css('transform', '');
					if (updatedSVG && (!updatedSVG.p || updatedSVG.p.length === 0)) {
						elem__Delete(elem);
					} else {
						elem.css('display', '');
						elem__select(elem);
						tn_showOutline('selected');
					}
					tn_toggleUI();
					if (isLeftBoxOpened) panelLayers__open();
					ab__control__toggle__update('ui_show');
					window.tn_flag_settings_ui_focus = false;
				});
			},
			Date.now(),
		);
	});
}

function tn_vector__createPanoramaEvent(e) {
	if (e.keyCode === 32) {
		tn_console('space inside vector editor');
		e.preventDefault();
		$('.tn-vector-editor').css('pointer-events', 'none');
		tn_showMoveShape();
		window.isSpaceDown = true;
	}
}

function tn_vector__removePanoramaEvent(e) {
	if (e.keyCode === 32) {
		$('.tn-vector-editor').css('pointer-events', '');
		tn_hideMoveShape();
		window.isSpaceDown = false;
	}
}

function tn_vector__loadVectorLib(name, el, cb) {
	var script = document.getElementById(name + '-js');
	var styles = document.getElementById(name + '-styles');
	if (script && styles) {
		cb();
		return;
	}

	// lock click events and after 1s waiting,
	// set class for element with loader
	document.body.style.pointerEvents = 'none';
	var timerID = setTimeout(function () {
		if (flagList.length !== 2) {
			el.classList.add('t_null-wait');
		}
	}, 1000);

	script = document.createElement('script');
	script.id = name + '-js';
	script.src = 'https://front.tildacdn.com/shapeeditor/t-shape-editor.min.js' + '?ver=' + window.ver;
	styles = document.createElement('link');
	styles.href = 'https://front.tildacdn.com/shapeeditor/t-shape-editor.min.css' + '?ver=' + window.ver;
	styles.id = name + '-styles';
	styles.rel = 'stylesheet';

	var scriptAndStyles = [script, styles];
	var flagList = [];
	scriptAndStyles.forEach(function (element) {
		document.body.appendChild(element);
		element.addEventListener('load', function () {
			flagList.push(true);
			if (flagList.length === 2) {
				clearTimeout(timerID);
				document.body.style.pointerEvents = '';
				el.classList.remove('t_null-wait');
				cb();
			}
		});
		element.addEventListener('error', function () {
			document.body.style.pointerEvents = '';
			alert('Error while loading shape editor. Please, try later or check your internet connection');
		});
	});
}
