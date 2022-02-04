/*
 Скрипт устанавливает кастомную маску для поля, которую указал пользователь в настройках
 Скрипт инициализируется из файла tilda-forms-1.0, если на странице есть одно кастомное поле,
 то в функцию mask передается поле, маска и объект с настройками
 Поля запоминают значение только если поле было заполнено до конца, иначе поле полностью очищается при расфокусе
 Также в ZB блоках при новой отрисовки поля значение этого поле запоминается и после отрисовки поле заполнено
 В момент фокуса курсор автомотически подставляется в начало маски или в конец при заполненом поле
 Ввод типа данных в поле для маски соответствует символу указанного в маске, (числа, буквы и числа/буквы)
*/
// This file is responsible for custom masks in form fields

// Polyfill: Object.assign
if (typeof Object.assign != 'function') {
	Object.assign = function(target) {
		'use strict';
		if (target == null) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		target = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var source = arguments[index];
			if (source != null) {
				for (var key in source) {
					if (Object.prototype.hasOwnProperty.call(source, key)) {
						target[key] = source[key];
					}
				}
			}
		}
		return target;
	};
}

/* eslint-disable no-undef */

(function () {
	var userAgent = navigator.userAgent;

	window.tildaCustomMaskSetting = {
		iPhone: /iphone/i.test(userAgent),
		chrome: /chrome/i.test(userAgent),
		android: /android/i.test(userAgent),
		caretTimeoutId: 0,
		defaultSetting: {
			definitions: {
				'9': '[0-9]',
				'a': '[A-Za-z]',
				'а': '[А-Яа-яЁё]',
				'*': '[A-Za-zА-Яа-яЁё0-9]'
			},
			autoclear: true,
			dataName: 'rawMaskFn',
			placeholder: '_'
		}
	};
})();

/**
 * Sets the cursor in the input relative to the mask
 * @param {Node} input - input element
 * @param {number} begin - current index start relative mask
 * @param {number} end - current index end relative mask
 * @returns {Node | Object}
 */
function t_customMask__caret(input, begin, end) {
	var range;

	if (!input || input.style.display === 'none') return;

	if (typeof begin === 'number') {
		end = (typeof end === 'number') ? end : begin;

		if (input.setSelectionRange) {
			input.setSelectionRange(begin, end);
		} else {
			// eslint-disable-next-line no-lonely-if
			if (input.createTextRange) {
				range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', end);
				range.moveStart('character', begin);
				range.select();
			}
		}

		return input;
	} else {
		if (input.setSelectionRange) {
			begin = input.selectionStart;
			end = input.selectionEnd;
		} else {
			// eslint-disable-next-line no-lonely-if
			if (document.selection && document.selection.createRange) {
				range = document.selection.createRange();
				begin = 0 - range.duplicate().moveStart('character', -100000);
				end = begin + range.text.length;
			}
		}
		return { begin: begin, end: end };
	}
}
// TODO: The function is not used anywhere, but may be required
/**
 * Trigger unmask event which removes all field masks
 *
 * @param {Node} input - input element
 */
// eslint-disable-next-line no-unused-vars
function t_customMask__unmask(input) {
	return t_triggerEvent(input, 'unmask');
}

/**
 * Init mask in input
 *
 * @param {Node} input - input element
 * @param {string} mask - mask input
 * @param {Object} settings - obj setting mask
 * @returns
 */
// eslint-disable-next-line no-unused-vars
function t_customMask__mask(input, mask, settings) {
	var objDefinitions;
	var arrTests = [];
	var arrMask = [];
	var partialPosition;
	var firstNonMaskPos = null;
	var lastRequiredNonMaskPos;
	var maskLength;
	var oldValue;

	if (!mask && input) {
		var functionName = window.tildaCustomMaskSetting.defaultSetting.dataName;
		return functionName ? functionName() : undefined;
	}

	settings = Object.assign({}, {
		autoclear: window.tildaCustomMaskSetting.defaultSetting.autoclear,
		placeholder: window.tildaCustomMaskSetting.defaultSetting.placeholder,
		completed: null
	}, settings);

	objDefinitions = window.tildaCustomMaskSetting.defaultSetting.definitions;
	partialPosition = maskLength = mask.length;

	mask = String(mask);

	arrMask = mask.split('');

	for (var i = 0; i < arrMask.length; i++) {
		var element = arrMask[i];
		if (element === '?') {
			maskLength--;
			partialPosition = i;
		} else {
			// eslint-disable-next-line no-lonely-if
			if (objDefinitions[element]) {
				arrTests.push(new RegExp(objDefinitions[element]));

				if (firstNonMaskPos === null) {
					firstNonMaskPos = arrTests.length - 1;
				}

				if (i < partialPosition) {
					lastRequiredNonMaskPos = arrTests.length - 1;
				}
			} else {
				arrTests.push(null);
			}
		}
	}

	var arrBuffer = [];

	for (var i = 0; i < arrMask.length; i++) {
		var el = arrMask[i];

		if (el !== '?') {
			if (objDefinitions[el]) {
				arrBuffer.push(t_customMask__getPlaceholder(i));
			} else {
				arrBuffer.push(el);
			}
		}
	}

	var defaultBuffer = arrBuffer.join('');
	var inputValue = input.value;

	/**
	 * Get symbol placeholder for mask
	 *
	 * @param {number} index - current index position in input (starts from 0)
	 * @returns {string} - symbol mask
	 */
	function t_customMask__getPlaceholder(index) {
		if (index < settings.placeholder.length) {
			return settings.placeholder.charAt(index);
		}
		return settings.placeholder.charAt(0);
	}

	/**
	 * Check try completed (settings.completed always null)
	 */
	function t_customMask__tryFireCompleted() {
		if (!settings.completed) {
			return;
		}

		for (var i = firstNonMaskPos; i <= lastRequiredNonMaskPos; i++) {
			if (arrTests[i] && arrBuffer[i] === t_customMask__getPlaceholder(i)) {
				return;
			}
		}
		// TODO: call for obj context?
		// settings.completed.call(input);
		settings.completed = input;
	}

	/**
	 * Return next index relative to himself
	 *
	 * @param {number} position - current index (starts from 0)
	 * @returns {number} - next current index
	 */
	function t_customMask__seekNext(position) {
		while (++position < maskLength && !arrTests[position]);
		return position;
	}

	/**
	 * Return prev index relative to himself
	 *
	 * @param {number} position - current index (starts from 0)
	 * @returns - prev current index
	 */
	function t_customMask__seekPrev(position) {
		while (--position >= 0 && !arrTests[position]);
		return position;
	}

	/**
	 * Shift left in input (character set)
	 *
	 * @param {number} begin - where did index end up in relation to the mask (starts from 0)
	 * @param {number} end - the index it clears when moving left (starts from 0)
	 */
	function t_customMask__shiftL(begin, end) {
		var positionNext = t_customMask__seekNext(end);

		if (begin < 0) return;

		for (var i = begin; i < maskLength; i++) {
			if (arrTests[i]) {
				if (positionNext < maskLength && arrTests[i].test(arrBuffer[positionNext])) {
					arrBuffer[i] = arrBuffer[positionNext];
					arrBuffer[positionNext] = t_customMask__getPlaceholder(positionNext);
				} else {
					break;
				}

				positionNext = t_customMask__seekNext(positionNext);
			}
		}
		t_customMask__writeBuffer();
		t_customMask__caret(input, Math.max(firstNonMaskPos, begin));
	}

	/**
	 * Shift right in input (character set)
	 * positionNext - current index, including mask characters (starts from 1)
	 * searchSymbol - symbol, search placeholder symbol in arr mask by index
	 *
	 * @param {number} position the index of the typed character, including mask characters (starts from 0)
	 */
	function t_customMask__shiftR(position) {
		var placeholderSymbol = t_customMask__getPlaceholder(position);
		var positionNext;
		var searchSymbol;

		for (var i = position; i < maskLength; i++) {
			if (arrTests[i]) {
				positionNext = t_customMask__seekNext(i);
				searchSymbol = arrBuffer[i];
				arrBuffer[i] = placeholderSymbol;
				if (positionNext < maskLength && arrTests[positionNext].test(searchSymbol)) {
					placeholderSymbol = searchSymbol;
				} else {
					break;
				}
			}
		}
	}

	/**
	 * Android event
	 */
	function t_customMask__androidInputEvent() {
		var currentValue = input.value;
		var position = t_customMask__caret(input);
		var t_customMask__proxy = function () {
			t_customMask__caret(input, position.begin, position.begin);
		};

		if (oldValue && oldValue.length && oldValue.length > currentValue.length) {
			// a deletion or backspace happened
			var nextPosition = t_customMask__checkVal(true);
			var currentPosition = position.end;

			while (currentPosition > 0 && !arrTests[currentPosition - 1]) {
				currentPosition--;
			}

			if (currentPosition === 0) {
				currentPosition = nextPosition;
			}

			position.begin = currentPosition;
			setTimeout(function () {
				t_customMask__proxy();
				t_customMask__tryFireCompleted();
			}, 0);
		} else {
			position.begin = t_customMask__checkVal(true);
			setTimeout(function () {
				t_customMask__proxy();
				t_customMask__tryFireCompleted();
			}, 0);
		}
	}

	/**
	 * If the value does not match the mask, then we clear the field from the value and substitute the mask when blur event
	 */
	function t_customMask__blurEvent() {
		t_customMask__checkVal();

		if (input.value != inputValue) {
			if (input.change) {
				input.change();
			}
		}
	}

	/**
	 * Keydown Event
	 *
	 * @param {KeyboardEvent} event - event
	 * @returns {undefined} - exit function
	 */
	function t_customMask__keydownEvent(event) {
		if (input.readOnly) return;

		event = event || window.event;
		var keyCode = event.keyCode || event.which;

		var position;
		var begin;
		var end;

		oldValue = input.value;

		// backspace, delete, and escape get special treatment
		if (keyCode === 8 || keyCode === 46 || (window.tildaCustomMaskSetting.iPhone && keyCode === 127)) {
			position = t_customMask__caret(input);
			begin = position.begin;
			end = position.end;

			if (end - begin === 0) {
				begin = keyCode !== 46 ? t_customMask__seekPrev(begin) : (end = t_customMask__seekNext(begin - 1));
				end = keyCode === 46 ? t_customMask__seekNext(end) : end;
			}

			t_customMask__clearBuffer(begin, end);
			t_customMask__shiftL(begin, end - 1);

			event.preventDefault ? event.preventDefault() : (event.returnValue = false);
		} else {
			// eslint-disable-next-line no-lonely-if
			if (keyCode === 13) { // Enter
				t_customMask__blurEvent();
			} else {
				// eslint-disable-next-line no-lonely-if
				if (keyCode === 27) { // Escape
					input.value = inputValue;
					t_customMask__caret(input, 0, t_customMask__checkVal());

					event.preventDefault ? event.preventDefault() : (event.returnValue = false);
				}
			}
		}
	}

	/**
	 * Keypress event
	 * currentPosition - the index of the typed character, including mask characters (starts from 0)
	 * enteredSymbol - entered character
	 *
	 * @param {KeyboardEvent} event - event
	 * @returns {undefined} - exit function
	 */
	function t_customMask__keypressEvent(event) {
		if (input.readOnly) return;

		event = event || window.event;
		var keyCode = event.keyCode || event.which;

		var position = t_customMask__caret(input);
		var currentPosition;
		var enteredSymbol;
		var next;

		// ignore
		if (keyCode === 17 || keyCode === 18 || keyCode === 91 || keyCode === 93 || keyCode < 32) {
			return;
		} else {
			// eslint-disable-next-line no-lonely-if
			if (keyCode && keyCode !== 13) {
				if (position.end - position.begin !== 0) {
					t_customMask__clearBuffer(position.begin, position.end);
					t_customMask__shiftL(position.begin, position.end - 1);
				}

				currentPosition = t_customMask__seekNext(position.begin - 1);

				if (currentPosition < maskLength) {
					enteredSymbol = String.fromCharCode(keyCode);

					if (arrTests[currentPosition].test(enteredSymbol)) {
						t_customMask__shiftR(currentPosition);

						arrBuffer[currentPosition] = enteredSymbol;
						t_customMask__writeBuffer();
						next = t_customMask__seekNext(currentPosition);

						if (window.tildaCustomMaskSetting.android) {
							// path for CSP Violation on FireFox OS 1.1
							var t_customMask__proxy = function () {
								t_customMask__caret(input, next);
							};

							setTimeout(t_customMask__proxy, 0);
						} else {
							t_customMask__caret(input, next);
						}

						if (position.begin <= lastRequiredNonMaskPos) {
							t_customMask__tryFireCompleted();
						}
					}
				}
				event.preventDefault ? event.preventDefault() : (event.returnValue = false);
			}
		}
	}

	/**
	 * Clears the mask of entered values
	 *
	 * @param {number} start - next index for clear
	 * @param {number} end - the current index that was clear
	 */
	function t_customMask__clearBuffer(start, end) {
		for (var i = start; i < end && i < maskLength; i++) {
			if (arrTests[i]) {
				arrBuffer[i] = t_customMask__getPlaceholder(i);
			}
		}
	}

	/**
	 * Writes the entered values to the mask array
	 */
	function t_customMask__writeBuffer() {
		input.value = arrBuffer.join('');
	}

	/**
	 * Checks if the number of characters entered matches the number in the mask
	 *
	 * @param {boolean} allow - flag true/false
	 */
	function t_customMask__checkVal(allow) {
		// try to place characters where they belong
		var currentValue = input.value;
		var lastMatch = -1;
		var position = 0;
		var currentSymbol;

		for (var i = 0; i < maskLength; i++) {
			if (arrTests[i]) {
				arrBuffer[i] = t_customMask__getPlaceholder(i);
				while (position++ < currentValue.length) {
					currentSymbol = currentValue.charAt(position - 1);
					if (arrTests[i].test(currentSymbol)) {
						arrBuffer[i] = currentSymbol;
						lastMatch = i;
						break;
					}
				}
				if (position > currentValue.length) {
					t_customMask__clearBuffer(i + 1, maskLength);
					break;
				}
			} else {
				if (arrBuffer[i] === currentValue.charAt(position)) {
					position++;
				}
				if (i < partialPosition) {
					lastMatch = i;
				}
			}
		}

		if (allow) {
			t_customMask__writeBuffer();
		} else {
			// eslint-disable-next-line no-lonely-if
			if (lastMatch + 1 < partialPosition) {
				if (settings.autoclear || arrBuffer.join('') === defaultBuffer) {
					// invalid value. Remove it and replace it with the mask, which is the default behavior.
					if (input.value) input.value = '';

					t_customMask__clearBuffer(0, maskLength);
				} else {
					// invalid value, but we opt to show the value to the user and allow them to correct their mistake.
					t_customMask__writeBuffer();
				}
			} else {
				t_customMask__writeBuffer();
				input.value = input.value.substring(0, lastMatch + 1);
			}
		}
		return (partialPosition ? i : firstNonMaskPos);
	}

	/**
	 * Delivers a mask in focus
	 */
	function t_customMask__focusEvent() {
		if (input.readOnly) return;

		clearTimeout(window.tildaCustomMaskSetting.caretTimeoutId);
		inputValue = input.value;

		var position = t_customMask__checkVal();

		window.tildaCustomMaskSetting.caretTimeoutId = setTimeout(function () {
			t_customMask__writeBuffer();

			if (position == mask.replace('?', '').length) {
				t_customMask__caret(input, 0, position);
			} else {
				setTimeout(function(){
					t_customMask__caret(input, position);
				}, 50);
			}
		}, 10);
	}

	/**
	 * Input event
	 */
	function t_customMask__inputEvent() {
		if (input.readOnly) return;

		// trim 8 if the mask starts at +7
		if (input.getAttribute('data-tilda-mask').indexOf('+7') === 0) {
			var value = input.value.replace(/\D/g, '');

			if (value.indexOf('78') === 0) {
				input.value = value.substring(2);
			}
			if (value.indexOf('8') === 0 || value.indexOf('7') === 0) {
				input.value = value.substring(1);
			}
		}
		setTimeout(function () {
			var position = t_customMask__checkVal(true);

			t_customMask__caret(input, position);
			t_customMask__tryFireCompleted();
		}, 0);
	}

	/**
	 * Unmask event remove all event custom mask
	 */
	function t_customMask__unmaskEvent() {
		var inputsCustomMask = document.querySelectorAll('.js-tilda-mask');

		for (var i = 0; i < inputsCustomMask.length; i++) {
			var input = inputsCustomMask[i];

			t_removeEventListener(input, eventFocus, t_customMask__focusEvent);
			t_removeEventListener(input, eventBlur, t_customMask__blurEvent);
			t_removeEventListener(input, 'keydown', t_customMask__keydownEvent);
			t_removeEventListener(input, 'keypress', t_customMask__keypressEvent);
			t_removeEventListener(input, 'input', t_customMask__inputEvent);
			t_removeEventListener(input, 'paste', t_customMask__inputEvent);
			t_removeEventListener(input, 'unmask', t_customMask__unmaskEvent);
		}
	}

	var eventFocus = 'focus';
	var eventBlur = 'blur';

	if (!document.addEventListener) {
		eventFocus = 'focusin';
		eventBlur = 'focusout';
	}

	t_addEventListener(input, eventFocus, t_customMask__focusEvent);
	t_addEventListener(input, eventBlur, t_customMask__blurEvent);
	t_addEventListener(input, 'keydown', t_customMask__keydownEvent);
	t_addEventListener(input, 'keypress', t_customMask__keypressEvent);
	t_addEventListener(input, 'input', t_customMask__inputEvent);
	t_addEventListener(input, 'paste', t_customMask__inputEvent);
	t_addEventListener(input, 'unmask', t_customMask__unmaskEvent, {once: true});

	if (window.tildaCustomMaskSetting.chrome && window.tildaCustomMaskSetting.android) {
		t_removeEventListener(input, 'input', t_customMask__androidInputEvent);
		t_addEventListener(input, 'input', t_customMask__androidInputEvent);
	}
	// perform initial check for existing values
	t_customMask__checkVal();
}