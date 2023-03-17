function tn_screensettings__open($settings) {
	$settings.addClass('tn-res-settings_active');
	allelems__unselect();

	$('.tooltipster-base').remove();

	tn_screenSettings__hideAllAlerts();
	tn_screenSettings__drawPanel($settings);
	tn_screenSettings__setHandlers($settings);
}

function tn_screensettings__close($settings) {
	tn_console('func: tn_screensettings__close');
	var isScreensChanged = tn_screenSettings__checkScreensChanged($settings);
	if (isScreensChanged && !window.confirm('You have unsaved changes in Breakpoints Settings. Do you want to leave?'))
		return;
	$settings.removeClass('tn-res-settings_active');
}

function tn_screenSettings__drawPanel($settings, screens) {
	if (!screens) screens = JSON.parse(JSON.stringify(window.tn.screens)); //array copy
	window.tn.screensCached = JSON.parse(JSON.stringify(window.tn.screens));

	var isMaxScreens = screens.length === 10;
	var screenInputsHTML = '';

	var screensStr = '';
	Array.prototype.forEach.call(screens, function (s) {
		screensStr += s + ',';
	});
	var isScreensDefault = screensStr.substring(0, screensStr.length - 1) === window.tn.screens_default_str;

	$settings.find('.tn-screens-settings').remove();

	Array.prototype.forEach.call(screens, function (s) {
		var ico;
		if (s < 480) {
			ico = '320';
		} else if (s < 640) {
			ico = '480';
		} else if (s < 960) {
			ico = '640';
		} else if (s < 1200) {
			ico = '960';
		} else if (s < 1600) {
			ico = '1200';
		} else {
			ico = '1600';
		}

		//prettier-ignore
		screenInputsHTML +=
			'<div data-screen="' + s + '" class="tn-screens-settings__row">' +
				'<div class="tn-screens-settings__icon">' +
					'<div class="tn-res-icon tn-res-icon_' + ico + '"></div>' +
				'</div>' +
				'<div class="tn-screens-settings__input-wrapper">' +
					'<input value="' + s + '" class="sui-input tn-screens-settings__input">' +
				'</div>' +
				'<div class="tn-screens-settings__remove tooltip tooltipstered" data-tooltip="Delete"></div>' +
				'<div class="tn-screens-settings__done tooltip tooltipstered" data-tooltip="Update" style="display: none"></div>' +
			'</div>';
	});

	//prettier-ignore
	var screensSetttingsHtml =
		'<div class="tn-screens-settings">' +
			'<div class="tn-screens-settings__title">' +
				'<span class="tn-screens-settings__title__text">Breakpoints, px</span>' +
			'</div>' +
			'<div class="tn-screens-settings__wrapper">' +
				screenInputsHTML +
			'</div>' +
			'<div class="tn-screens-settings__section tn-screens-settings__section_active tn-screens-settings__section_main">' +
				(!isMaxScreens ? '<button class="sui-btn sui-btn_sm tn-screens-settings__btn tn-screens-settings__btn_add">Add breakpoint</button>' : '') +
				(!isScreensDefault ? '<button class="sui-btn sui-btn_sm tn-screens-settings__btn tn-screens-settings__reset">Reset to default</button>' : '') +
				'<button class="sui-btn sui-btn_sm tn-screens-settings__btn tn-screens-settings__btn_save' + (isMaxScreens ? ' tn-screens-settings__btn_full' : '') + '">Save</button>' +
			'</div>' +
		'</div>';

	$settings.append(screensSetttingsHtml);
	tn_tooltip_update();
}

function tn_screenSettings__setHandlers($settings, screens) {
	if (!screens) screens = JSON.parse(JSON.stringify(window.tn.screens)); //array copy

	var $addScreenButton = $settings.find('.tn-screens-settings__btn_add');
	var $saveButton = $settings.find('.tn-screens-settings__btn_save');
	var $inputs = $settings.find(
		'.tn-screens-settings__row:not(.tn-screens-settings__row_new) .tn-screens-settings__input',
	);
	var $deleteIcons = $settings.find('.tn-screens-settings__row .tn-screens-settings__remove');
	var $doneIcons = $settings.find('.tn-screens-settings__row .tn-screens-settings__done');
	var $resetIcon = $settings.find('.tn-screens-settings__reset');
	var $addCheckbox = $settings.find('.sui-toggle-div.js-add .sui-input');
	var $delCheckbox = $settings.find('.sui-toggle-div.js-del .sui-input');

	$resetIcon.click(function () {
		if (!confirm('Are you sure you want to reset Breakpoints to default?')) return;

		$settings.removeClass('tn-res-settings_active');

		tn_screensettings__addUndo([320, 480, 640, 960, 1200]);

		var pairs = tn_screenSettings__compareScreens(window.tn.screensCached, [320, 480, 640, 960, 1200]);
		var oldTopScreen = window.tn.screensCached[window.tn.screensCached.length - 1];
		var newTopScreen = 1200;
		pairs.forEach(function (pair) {
			if (pair.from === pair.to && pair.to !== newTopScreen && pair.from !== oldTopScreen) return;
			tn_screenSettings__transferFields(pair.from, pair.to, oldTopScreen, newTopScreen);
		});

		tn_screensettings__save([320, 480, 640, 960, 1200]);

		tn_screenSettings__showAlert('Breakpoints Settings are reset to default', 'success');
	});

	$addScreenButton.click(function () {
		if (window.tn_flag_settings_ui_focus) return;
		tn_screenSettings__insertAddInput($settings, screens);
	});

	$inputs.on('click', function () {
		$(this).select();
	});

	$inputs.off('focus');
	$inputs.on('focus', function () {
		window.tn_flag_settings_ui_focus = true;
	});

	$inputs.off('focusout');
	$inputs.on('focusout', function () {
		if (window.tn_screenSettings__focusoutKeyboard) {
			window.tn_screenSettings__focusoutKeyboard = false;
			return;
		}
		var _bindedFocusoutSetNewScreen = _setNewScreen.bind(this);
		_bindedFocusoutSetNewScreen();
	});

	$inputs.on('keydown', function (e) {
		if (e.keyCode !== 13) return;
		var _bindedSetNewScreen = _setNewScreen.bind(this);
		_bindedSetNewScreen();
	});

	$inputs.on('focus', function () {
		var inputRow = this.closest('.tn-screens-settings__row');
		var closeBtn = inputRow.querySelector('.tn-screens-settings__remove');
		var addBtn = inputRow.querySelector('.tn-screens-settings__done');

		closeBtn.style.display = 'none';
		addBtn.style.display = 'block';
	});

	$inputs.on('focusout', function () {
		var inputRow = this.closest('.tn-screens-settings__row');
		var closeBtn = inputRow.querySelector('.tn-screens-settings__remove');
		var addBtn = inputRow.querySelector('.tn-screens-settings__done');

		closeBtn.style.display = 'block';
		addBtn.style.display = 'none';
	});

	$inputs.on('input', function () {
		var res = parseInt(this.value);
		if (!res || isNaN(res)) return;

		this.classList.remove('error');

		var ico;
		if (res < 320 || res > 1920) ico = 'unknow';
		else if (res < 480) ico = '320';
		else if (res < 640) ico = '480';
		else if (res < 960) ico = '640';
		else if (res < 1200) ico = '960';
		else if (res < 1600) ico = '1200';
		else if (res <= 1920) ico = '1600';

		var iconNode = this.closest('.tn-screens-settings__row').querySelector('.tn-res-icon');
		iconNode.className = '';
		iconNode.classList.add('tn-res-icon', 'tn-res-icon_' + ico);
	});

	function _setNewScreen() {
		var $inp = $(this);
		var $screenContainer = $inp.closest('.tn-screens-settings__row');
		var currentScreenValue = $screenContainer.attr('data-screen');
		var updatedValue = $inp.val();
		if (!updatedValue.length) {
			$inp.val(currentScreenValue);
			return;
		}

		updatedValue = parseInt(updatedValue, 10);

		var isInvalidValue = isNaN(updatedValue) || updatedValue < 320 || updatedValue > 1920;

		if (isInvalidValue) {
			if (!updatedValue || isNaN(updatedValue)) {
				tn_screenSettings__showAlert('Incorrect number', 'error');
				setTimeout(function () {
					$inp.focus();
					$inp.select();
				});
				this.classList.add('error');
				return;
			}

			if (updatedValue < 320) {
				tn_screenSettings__showAlert('Minimum breakpoint resolution 320px', 'error');
				setTimeout(function () {
					$inp.focus();
					$inp.select();
				});
				this.classList.add('error');
				return;
			}

			if (updatedValue > 1920) {
				tn_screenSettings__showAlert('Maximum breakpoint resolution 1920px', 'error');
				setTimeout(function () {
					$inp.focus();
					$inp.select();
				});
				this.classList.add('error');
				return;
			}
		} else if (currentScreenValue != updatedValue) {
			if (screens.indexOf(updatedValue) > -1) {
				tn_screenSettings__showAlert('Breakpoint already exists', 'error');
				setTimeout(function () {
					$inp.focus();
					$inp.select();
				});
			} else {
				window.tn_flag_settings_ui_focus = false;
				$screenContainer.attr('data-screen', updatedValue);
				screens = tn_screensettings__updateScreen(screens, currentScreenValue, updatedValue);
				isChanged = true;
				tn_screenSettings__drawPanel($settings, screens);
				tn_screenSettings__setHandlers($settings, screens);
				tn_screenSettings__highlightNewScreen($settings, updatedValue);
			}
		} else {
			window.tn_flag_settings_ui_focus = false;
			window.tn_screenSettings__focusoutKeyboard = true;
			$inp.trigger('blur');
		}
	}

	$doneIcons.one(function () {
		var _bindedClickSetNewScreen = _setNewScreen.bind(this);
		_bindedClickSetNewScreen();
	});

	$deleteIcons.click(function () {
		if (screens.length === 2) {
			tn_screenSettings__showAlert('Must have at least 2 breakpoints', 'error');
			return;
		}

		var $screenContainer = $(this).closest('.tn-screens-settings__row');
		var currentScreenValue = $screenContainer.attr('data-screen');
		screens = tn_screensettings__removeScreen(screens, currentScreenValue);
		tn_screenSettings__drawPanel($settings, screens);
		tn_screenSettings__setHandlers($settings, screens);
	});

	$saveButton.click(function () {
		var unsavedInput = $settings.find('.tn-screens-settings__input-add');
		if (unsavedInput.length) {
			var screen = parseInt(unsavedInput.val(), 10);
			if (screen && !isNaN(screen) && screen >= 320 && screen <= 1920 && screens.indexOf(screen) === -1) {
				screens.push(screen);
				screen = tn_screenSettings__sort(screens);
				tn_screensettings__addUndo(screens);

				var pairs = tn_screenSettings__compareScreens(window.tn.screensCached, screens);
				var oldTopScreen = window.tn.screensCached[window.tn.screensCached.length - 1];
				var newTopScreen = screens[screens.length - 1];
				pairs.forEach(function (pair) {
					if (pair.from === pair.to && pair.to !== newTopScreen && pair.from !== oldTopScreen) return;
					tn_screenSettings__transferFields(pair.from, pair.to, oldTopScreen, newTopScreen);
				});

				tn_screensettings__save(screens);
				tn_screenSettings__showAlert('New breakpoint saved!', 'success');
				window.tn_flag_settings_ui_focus = false;
				return;
			}
		}

		var isScreensChanged = tn_screenSettings__checkScreensChanged($settings);
		if (isScreensChanged) {
			tn_screensettings__addUndo(screens);

			var pairs = tn_screenSettings__compareScreens(window.tn.screensCached, screens);
			var oldTopScreen = window.tn.screensCached[window.tn.screensCached.length - 1];
			var newTopScreen = screens[screens.length - 1];
			pairs.forEach(function (pair) {
				if (pair.from === pair.to && pair.to !== newTopScreen && pair.from !== oldTopScreen) return;
				tn_screenSettings__transferFields(pair.from, pair.to, oldTopScreen, newTopScreen);
			});

			tn_screensettings__save(screens);
			tn_screenSettings__showAlert('New breakpoint saved!', 'success');
		} else {
			window.tn_flag_settings_ui_focus = false;
			$settings.removeClass('tn-res-settings_active');
		}
	});

	$delCheckbox.add($addCheckbox).on('click', function () {
		$checkBox = $(this);
		if ($checkBox.hasClass('sui-toggle_on')) {
			$checkBox.removeClass('sui-toggle_on');
			$checkBox.removeAttr('checked');
		} else {
			$checkBox.addClass('sui-toggle_on');
			$checkBox.attr('checked', true);
		}
	});

	if (window.tn_screenSettings__eventListenersAdded) return;

	// закрытие окна настроек на ESC и по клику мино (click outside)
	document.addEventListener('keydown', closeOnKeydown, true);
	document.addEventListener('click', closeOnClick, true);

	function closeOnKeydown(event) {
		var $settingsUncached = $('.tn-res-settings');
		if (event.keyCode !== 27) return;
		if ($settingsUncached.hasClass('tn-res-settings_active')) {
			tn_screenSettings__hideAllAlerts();
			var isScreensChanged = tn_screenSettings__checkScreensChanged($settingsUncached);
			if (
				isScreensChanged &&
				!window.confirm('You have unsaved changes in Breakpoints Settings. Do you want to leave?')
			)
				return;
			$settingsUncached.removeClass('tn-res-settings_active');
		}
	}

	function closeOnClick(event) {
		var $settingsUncached = $('.tn-res-settings');
		if (event.target.closest('.tn-res-settings')) return;
		if (event.target.closest('.tooltipster-base')) return;
		if ($settingsUncached.hasClass('tn-res-settings_active')) {
			tn_screenSettings__hideAllAlerts();
			var isScreensChanged = tn_screenSettings__checkScreensChanged($settingsUncached);
			if (
				isScreensChanged &&
				!window.confirm('You have unsaved changes in Breakpoints Settings. Do you want to leave?')
			)
				return;
			$settingsUncached.removeClass('tn-res-settings_active');
		}
	}

	window.tn_screenSettings__eventListenersAdded = true;
}

function tn_screenSettings__insertAddInput($settings, screens) {
	var settings = $settings[0];
	var addBtn = settings.querySelector('.tn-screens-settings__btn_add');
	var container = settings.querySelector('.tn-screens-settings__section');

	addBtn.remove();

	//prettier-ignore
	var inputHtml =
		'<div class="tn-screens-settings__row-add">' +
			'<div class="tn-screens-settings__icon">' +
				'<div class="tn-res-icon tn-res-icon_unknow"></div>' +
			'</div>' +
			'<div class="tn-screens-settings__input-wrapper">' +
				'<input value="" class="sui-input tn-screens-settings__input-add">' +
			'</div>' +
			'<div class="tn-screens-settings__done tooltip tooltipstered" data-tooltip="Add"></div>' +
		'</div>';

	container.insertAdjacentHTML('afterbegin', inputHtml);
	tn_tooltip_update();

	var input = container.querySelector('.tn-screens-settings__input-add');
	window.tn_flag_settings_ui_focus = true;
	input.focus();

	tn_screenSettings__setHandlersAddInput(container, input, addBtn, screens, $settings);
}

function tn_screenSettings__setHandlersAddInput(container, input, addBtn, screens, $settings) {
	var iconNode = container.querySelector('.tn-res-icon');
	var rowNode = container.querySelector('.tn-screens-settings__row-add');
	var doneIconNode = container.querySelector('.tn-screens-settings__done');

	input.addEventListener('input', function () {
		var res = parseInt(input.value);
		if (!res || isNaN(res)) return;

		input.classList.remove('error');

		var ico;
		if (res < 320 || res > 1920) ico = 'unknow';
		else if (res < 480) ico = '320';
		else if (res < 640) ico = '480';
		else if (res < 960) ico = '640';
		else if (res < 1200) ico = '960';
		else if (res < 1600) ico = '1200';
		else if (res <= 1920) ico = '1600';

		iconNode.className = '';
		iconNode.classList.add('tn-res-icon');
		iconNode.classList.add('tn-res-icon_' + ico);
	});

	input.addEventListener('blur', function (event) {
		window.tn_flag_settings_ui_focus = false;
		var res = input.value;
		if (res.length) return;

		rowNode.remove();
		container.insertAdjacentElement('afterbegin', addBtn);
	});

	doneIconNode.addEventListener('click', function () {
		var res = input.value;
		if (res.length) {
			tn_screenSettings__saveNewScreen(input, $settings, screens);
			return;
		}

		rowNode.remove();
		container.insertAdjacentElement('afterbegin', addBtn);
	});

	input.addEventListener('keydown', function (event) {
		if (event.code !== 'Enter') return;

		var res = input.value;
		if (res.length) {
			window.tn_flag_settings_ui_focus = false;
			tn_screenSettings__saveNewScreen(input, $settings, screens);
			return;
		}

		rowNode.style.display = 'none';
		container.insertAdjacentElement('afterbegin', addBtn);
	});
}

function tn_screenSettings__saveNewScreen(input, $settings, screens) {
	var newScreenValue = parseInt(input.value, 10);

	if (!newScreenValue || isNaN(newScreenValue)) {
		tn_screenSettings__showAlert('Incorrect number', 'error');
		input.classList.add('error');
		setTimeout(function () {
			$(input).focus();
			$(input).select();
		});
		window.tn_flag_settings_ui_focus = true;
		return;
	}

	if (newScreenValue < 320) {
		tn_screenSettings__showAlert('Minimum breakpoint resolution 320px', 'error');
		input.classList.add('error');
		setTimeout(function () {
			$(input).focus();
			$(input).select();
		});
		window.tn_flag_settings_ui_focus = true;
		return;
	}

	if (newScreenValue > 1920) {
		tn_screenSettings__showAlert('Maximum breakpoint resolution 1920px', 'error');
		input.classList.add('error');
		setTimeout(function () {
			$(input).focus();
			$(input).select();
		});
		window.tn_flag_settings_ui_focus = true;
		return;
	}

	if (screens.indexOf(newScreenValue) !== -1) {
		tn_screenSettings__showAlert('Breakpoint already exists', 'error');
		input.classList.add('error');
		setTimeout(function () {
			$(input).focus();
			$(input).select();
		});
		window.tn_flag_settings_ui_focus = true;
		return;
	}

	window.tn_flag_settings_ui_focus = false;
	screens.push(newScreenValue);
	screens = tn_screenSettings__sort(screens);
	tn_screenSettings__drawPanel($settings, screens);
	tn_screenSettings__setHandlers($settings, screens);
	tn_screenSettings__highlightNewScreen($settings, newScreenValue);
}

function tn_screenSettings__showAlert(message, type) {
	var randomId = (Math.random() * 10000).toFixed();
	//prettier-ignore
	var alertHtml =
		'<div class="tn-screens-settings__alert-container alert' + randomId + '">' +
				'<div class="tn-screens-settings__alert ' + type + '">' +
					'<p class="tn-screens-settings__alert-message">' + message + '</p>' +
					'<button class="tn-screens-settings__alert-close">+</button>' +
				'</div>' +
		'</div>';

	document.body.insertAdjacentHTML('beforeend', alertHtml);

	var alertNode = document.querySelector('.alert' + randomId);
	alertNode.addEventListener('click', function () {
		tn_screenSettings__hideAlert(alertNode);
	});

	setTimeout(function () {
		alertNode.classList.add('show');
	}, 100);

	setTimeout(function () {
		tn_screenSettings__hideAlert(alertNode);
	}, 4000);
}

function tn_screenSettings__hideAlert(alertNode) {
	alertNode.classList.remove('show');
	alertNode.classList.add('hide');

	setTimeout(function () {
		alertNode.remove();
	}, 1000);
}

function tn_screenSettings__hideAllAlerts() {
	var alerts = document.querySelectorAll('.tn-screens-settings__alert-container');
	Array.prototype.forEach.call(alerts, function (alert) {
		alert.classList.remove('show');
		alert.classList.add('hide');

		setTimeout(function () {
			alert.remove();
		}, 300);
	});
}

function tn_screenSettings__highlightNewScreen($settings, screen) {
	var settings = $settings[0];
	var screenRow = settings.querySelector('[data-screen="' + screen + '"]');
	setTimeout(function () {
		screenRow.classList.add('new-screen');
	});
	setTimeout(function () {
		screenRow.classList.remove('new-screen');
	}, 800);
}

function tn_screenSettings__convertScreensToStr(screens) {
	var str_screens = '';
	screens.forEach(function (s, i) {
		str_screens += parseInt(s, 10);
		if (i != screens.length - 1) str_screens += ',';
	});

	return str_screens;
}

function tn_screenSettings__transferFields(oldScreen, newScreen, oldTopScreen, newTopScreen) {
	var $artboard = $('.tn-artboard');

	var gridOptions = $artboard.attr('data-project-zb_grid');
	gridOptions = gridOptions ? JSON.parse(gridOptions) : {};
	var currentOptions = '';
	if (oldScreen === oldTopScreen) {
		currentOptions = $artboard.attr('data-artboard-grid') || gridOptions['ab_grid'];
		$artboard.removeAttr('data-artboard-grid');
		delete gridOptions['ab_grid'];
	} else {
		currentOptions = $artboard.attr('data-artboard-grid-res-' + oldScreen) || gridOptions['ab_grid-res-' + oldScreen];
		$artboard.removeAttr('data-artboard-grid-res-' + oldScreen);
		delete gridOptions['ab_grid-res-' + newScreen];
	}

	if (currentOptions && oldScreen === newScreen) {
		if (newScreen === newTopScreen) {
			gridOptions['ab_grid'] = currentOptions;
			$artboard.attr('data-artboard-grid', currentOptions);
		} else {
			gridOptions['ab_grid-res-' + newScreen] = currentOptions;
			$artboard.attr('data-artboard-grid-res-' + newScreen, currentOptions);
		}
	}

	if (oldTopScreen > newTopScreen && oldScreen === newScreen) {
		delete gridOptions['ab_grid'];
		$artboard.removeAttr('data-artboard-grid');
	}

	$artboard.removeAttr('data-project-zb_grid');
	$artboard.attr('data-project-zb_grid', JSON.stringify(gridOptions));

	window.tn.ab_fields.forEach(function (field) {
		var whiteList = ['height'];
		if (whiteList.indexOf(field) === -1) return;

		var fieldValue = '';
		if (oldScreen === oldTopScreen) {
			fieldValue = $artboard.attr('data-artboard-' + field);
		} else {
			fieldValue = $artboard.attr('data-artboard-' + field + '-res-' + oldScreen);
		}

		if (!fieldValue) return;

		if (newScreen === newTopScreen) {
			$artboard.attr('data-artboard-' + field, fieldValue);
		} else {
			$artboard.attr('data-artboard-' + field + '-res-' + newScreen, fieldValue);
		}
	});

	var $elems = $('.tn-elem');
	$elems.each(function (index, elem) {
		var $elem = $(elem);
		var fieldsSrt = $elem.attr('data-fields');
		var fields = fieldsSrt.split(',');

		fields.forEach(function (field) {
			var whiteList = ['width', 'height', 'top', 'left', 'fontsize'];
			if (whiteList.indexOf(field) === -1) return;

			var fieldValue = '';
			if (oldScreen === oldTopScreen) {
				fieldValue = $elem.attr('data-field-' + field + '-value');
			} else {
				fieldValue = $elem.attr('data-field-' + field + '-res-' + oldScreen + '-value');
			}

			if (!fieldValue) return;

			if (newScreen === newTopScreen) {
				$elem.attr('data-field-' + field + '-value', fieldValue);
			} else {
				$elem.attr('data-field-' + field + '-res-' + newScreen + '-value', fieldValue);
			}
		});
	});
}

function tn_screenSettings__compareScreens(oldScreens, newScreens) {
	oldScreens = oldScreens.slice();
	newScreens = newScreens.slice();

	var cache = [];
	var pairs = [];

	// simple compare
	oldScreens.forEach(function (oScreen) {
		if (newScreens.indexOf(oScreen) !== -1) {
			createPair(oScreen, oScreen);
		}
	});

	oldScreens = oldScreens.filter(function (s) {
		return !cache.includes(s);
	});
	newScreens = newScreens.filter(function (s) {
		return !cache.includes(s);
	});

	// deep compare
	oldScreens.forEach(function (oScreen) {
		var entry = newScreens.indexOf(oScreen) !== -1 && cache.indexOf(oScreen) === -1;
		if (entry) {
			createPair(oScreen, oScreen);
			return;
		}

		var differencesWithScreens = [];
		var differences = [];
		newScreens.forEach(function (nScreen) {
			if (cache.indexOf(nScreen) !== -1) return;
			differencesWithScreens.push({
				diff: Math.abs(nScreen - oScreen),
				nScreen: nScreen,
			});
			differences.push(Math.abs(nScreen - oScreen));
		});

		var minDiff = Math.min.apply(null, differences);
		var closestScreen = 0;
		differencesWithScreens.forEach(function (diff) {
			if (diff.diff === minDiff) {
				closestScreen = diff.nScreen;
			}
		});

		if (closestScreen) createPair(oScreen, closestScreen);
	});

	function createPair(oldScreen, newScreen) {
		pairs.push({
			from: oldScreen,
			to: newScreen,
		});

		cache.push(newScreen);
	}

	return pairs;
}

function tn_screensettings__save(screens) {
	var currentScreens = tn_screenSettings__convertScreensToStr(screens);
	setTNobj_screens(currentScreens);
	tn_drawResMenu();
	goResolutionMode(window.tn.topResolution);
	tn_set_lastChanges();
}

function tn_screensettings__addUndo(screens) {
	var previousScreens = tn_screenSettings__convertScreensToStr(window.tn.screens);
	var currentScreens = tn_screenSettings__convertScreensToStr(screens);

	tn_undo__Add('screens_save', {previousScreens, currentScreens});
}

function tn_screensettings__updateScreen(screens, oldValue, newValue) {
	oldValue = parseInt(oldValue, 10);
	newValue = parseInt(newValue, 10);
	var screenIndex = screens.indexOf(oldValue);
	screens[screenIndex] = newValue;
	screens = tn_screenSettings__sort(screens);
	return screens;
}

function tn_screenSettings__sort(screens) {
	return screens.sort(function (a, b) {
		return a - b;
	});
}

function tn_screensettings__removeScreen(screens, oldValue) {
	oldValue = parseInt(oldValue);
	if (!oldValue || isNaN(oldValue)) return;

	var index = screens.indexOf(oldValue);
	screens.splice(index, 1);

	return screens;
}

function tn_screenSettings__checkScreensChanged($settings) {
	var screensStr = '';
	var origScreensStr = '';

	$settings.find('.tn-screens-settings__input').each(function () {
		screensStr += $(this).val();
	});

	window.tn.screens.forEach(function (s) {
		origScreensStr += s;
	});

	return screensStr !== origScreensStr;
}
