/**
 * Пересчитывает переданное значение в соответствии с текущим зумом редактора
 *
 * @param {number} value
 * @returns {number}
 */
function tn_bgPositionEditor__zoomFactor(value) {
	return value + value * (1 / window.tn.zoom - 1);
}

/**
 * Инициализация редактора позиции бэкграунда
 *
 * Мы добавляем 2 картинки, одна из них будет отображаться в полноценных размерах, а другая будет обрезаться по ширине контейнера
 *
 * Эти 2 картинки мы перемещаем совместно, и так достигается эффект подсвечивания какой-то части картинки
 *
 * @param {HTMLElement} element
 */
async function tn_bgPositionEditor__init(element) {
	const zoomFactor = tn_bgPositionEditor__zoomFactor;

	const atom = element.querySelector('.tn-atom');

	let editor = document.querySelector('.bg-position-editor');
	if (!editor) {
		editor = document.createElement('div');
		editor.classList.add('bg-position-editor');
		document.body.insertAdjacentElement('beforeend', editor);
	}

	editor.style.transform = `scale(${window.tn.zoom})`;

	editor.innerHTML = /*html*/ `
    <div class="bg-position-editor__resize">
      <div class="bg-position-editor__resize-handlers">
        <div class="bg-position-editor__resize-trigger" data-side="top">
          <div class="bg-position-editor__resize-line bg-position-editor__resize-line_h"></div>
        </div>
        <div class="bg-position-editor__resize-trigger" data-side="left">
          <div class="bg-position-editor__resize-line bg-position-editor__resize-line_v"></div>
        </div>
        <div class="bg-position-editor__resize-trigger" data-side="bottom">
          <div class="bg-position-editor__resize-line bg-position-editor__resize-line_h"></div>
        </div>
        <div class="bg-position-editor__resize-trigger" data-side="right">
          <div class="bg-position-editor__resize-line bg-position-editor__resize-line_v"></div>
        </div>
        <div class="bg-position-editor__resize-trigger" data-side="topleft"></div>
        <div class="bg-position-editor__resize-trigger" data-side="topright"></div>
        <div class="bg-position-editor__resize-trigger" data-side="bottomleft"></div>
        <div class="bg-position-editor__resize-trigger" data-side="bottomright"></div>
      </div>
    </div>
    <div class="bg-position-editor__hidden">
      <img class="bg-position-editor__hidden-img" />
    </div>
    <div class="bg-position-editor__overlay"></div>
    <div class="bg-position-editor__highlight">
      <div class="bg-position-editor__ref">
        <img class="bg-position-editor__ref-img" />
      </div>
    </div>
  `;

	const highlightWrapper = editor.querySelector('.bg-position-editor__highlight');
	const hiddenWrapper = editor.querySelector('.bg-position-editor__hidden');
	const resizeWrapper = editor.querySelector('.bg-position-editor__resize');

	const hiddenImg = editor.querySelector('.bg-position-editor__hidden-img');
	const refImg = editor.querySelector('.bg-position-editor__ref-img');
	const resizeHandlers = editor.querySelector('.bg-position-editor__resize-handlers');

	const resizeTriggers = editor.querySelectorAll('.bg-position-editor__resize-trigger');

	const atomStyles = getComputedStyle(atom);
	const atomRect = atom.getBoundingClientRect();

	const [, imageURL] = /url\("(.+)"\)/.exec(atomStyles.backgroundImage);

	const imageSize = await tn_bgPositionEditor__getImageSize(imageURL, atomRect, atomStyles.backgroundSize);

	const {imagePositionX, imagePositionY} = tn_bgPositionEditor__calculateImagePosition(imageSize, atomStyles);

	hiddenImg.src = imageURL;
	refImg.src = imageURL;

	[...resizeTriggers].forEach(trigger => {
		tn_bgPositionEditor__bindTriggerEvents(editor, trigger);
	});

	[hiddenWrapper, highlightWrapper, resizeWrapper].forEach(el => {
		Object.assign(el.style, {
			top: zoomFactor(atomRect.y + window.scrollY) + 'px',
			left: zoomFactor(atomRect.x + window.scrollX) + 'px',
			width: zoomFactor(atomRect.width) + 'px',
			height: zoomFactor(atomRect.height) + 'px',
		});
	});

	[hiddenImg, refImg, resizeHandlers].forEach(el => {
		Object.assign(el.style, {
			top: imagePositionY.position + 'px',
			left: imagePositionX.position + 'px',
			transform: `translate(${imagePositionX.transform}, ${imagePositionY.transform})`,
			width: imageSize.width + 'px',
			height: imageSize.height + 'px',
		});
	});

	atom.style.visibility = 'hidden';

	tn_bgPositionEditor__bindEvents(editor, element);
}

/**
 * Добавляет события ресайза для переданных триггеров, редактирование учитывает оригинальные пропорции картинки
 *
 * @param {HTMLElement} editor - элемент редактора (.bg-position-editor)
 * @param {HTMLElement} trigger - элемент триггера
 */
function tn_bgPositionEditor__bindTriggerEvents(editor, trigger) {
	const zoomFactor = tn_bgPositionEditor__zoomFactor;

	let startX;
	let startY;
	let width;
	let height;
	let aspectRatio;
	let translateY;
	let translateX;

	const hiddenImg = editor.querySelector('.bg-position-editor__hidden-img');
	const refImg = editor.querySelector('.bg-position-editor__ref-img');
	const resizeHandlers = editor.querySelector('.bg-position-editor__resize-handlers');

	const side = trigger.getAttribute('data-side');

	const onMousedown = event => {
		event.preventDefault();
		event.stopImmediatePropagation();

		startX = event.clientX;
		startY = event.clientY;

		width = parseInt(hiddenImg.style.width, 10);
		height = parseInt(hiddenImg.style.height, 10);
		aspectRatio = height / width;

		const position = tn_bgPositionEditor__getCurrentPosition(editor);
		[translateX, translateY] = [position.translateX, position.translateY];

		trigger.removeEventListener('mousedown', onMousedown);
		document.addEventListener('mousemove', onMousemove);
		document.addEventListener('mouseup', onMouseup);
	};

	const onMousemove = event => {
		const endX = event.clientX;
		const endY = event.clientY;
		const deltaX = zoomFactor(startX - endX);
		const deltaY = zoomFactor(startY - endY);

		let newTranslateY = translateY;
		let newTranslateX = translateX;
		let newHeight = height;
		let newWidth = width;

		if (['top', 'left', 'topleft'].includes(side)) {
			const delta = side === 'left' ? deltaX : deltaY;

			newTranslateY -= delta * aspectRatio;
			newTranslateX -= delta;
			newHeight += delta * aspectRatio;
			newWidth += delta;
		}

		if (['bottom', 'right', 'bottomright'].includes(side)) {
			const delta = side === 'bottom' ? deltaY : deltaX;

			newHeight -= delta * aspectRatio;
			newWidth -= delta;
		}

		if (side === 'topright') {
			newTranslateY -= deltaY;
			newHeight += deltaY * aspectRatio;
			newWidth += deltaY;
		}
		if (side === 'bottomleft') {
			newTranslateX += deltaY;
			newHeight -= deltaY * aspectRatio;
			newWidth -= deltaY;
		}

		[hiddenImg, refImg, resizeHandlers].forEach(el => {
			Object.assign(el.style, {
				transform: `translate(${newTranslateX}px, ${newTranslateY}px)`,
				width: newWidth + 'px',
				height: newHeight + 'px',
			});
		});
	};

	const onMouseup = () => {
		document.removeEventListener('mousemove', onMousemove);
		document.removeEventListener('mouseup', onMouseup);
		trigger.addEventListener('mousedown', onMousedown);
	};

	trigger.addEventListener('mousedown', onMousedown);
}

/**
 * Получает позицию картинки в редакторе и её смещение
 *
 * Позиция может посчитаться в двух вариантах, когда мы получаем значения в процентах и в пикселях.
 *
 * 1. Значения в процентах в большинстве случаев означают наши константы, например 'center center', тогда мы пересчитываем как позицию так и смещение
 *
 * 2. Значение в пикселях означают что элемент уже был отредактирован в редакторе, и тогда мы можем опустить коррекцию позиции с помощью смещения
 *
 * @param {{height: number, width: number}} imageSize - размеры картинки
 * @param {CSSStyleDeclaration} atomStyles - стили редактируемого "атома"
 * @returns
 */
function tn_bgPositionEditor__calculateImagePosition(imageSize, atomStyles) {
	let imagePositionY;
	if (atomStyles.backgroundPositionY.endsWith('%')) {
		const factorY = parseInt(atomStyles.backgroundPositionY, 10) / 100;

		imagePositionY = {
			position: parseInt(atomStyles.height, 10) * factorY,
			transform: `-${imageSize.height * factorY}px`,
		};
	} else {
		imagePositionY = {
			position: parseInt(atomStyles.backgroundPositionY, 10),
			transform: 0,
		};
	}

	let imagePositionX;
	if (atomStyles.backgroundPositionX.endsWith('%')) {
		const factorX = parseInt(atomStyles.backgroundPositionX, 10) / 100;

		imagePositionX = {
			position: parseInt(atomStyles.width, 10) * factorX,
			transform: `-${imageSize.width * factorX}px`,
		};
	} else {
		imagePositionX = {
			position: parseInt(atomStyles.backgroundPositionX, 10),
			transform: 0,
		};
	}

	return {
		imagePositionX,
		imagePositionY,
	};
}

/**
 * Добавляет события перемещения бэкграунда
 *
 * @param {HTMLElement} editor - элемент редактора (.bg-position-editor)
 * @param {HTMLElement} element - редактируемый элемент в Zero
 */
function tn_bgPositionEditor__bindEvents(editor, element) {
	const zoomFactor = tn_bgPositionEditor__zoomFactor;

	let startX;
	let startY;
	let translateX;
	let translateY;

	const hiddenImg = editor.querySelector('.bg-position-editor__hidden-img');
	const refImg = editor.querySelector('.bg-position-editor__ref-img');
	const resizeHandlers = editor.querySelector('.bg-position-editor__resize-handlers');

	const onMousedown = event => {
		if (editor === event.target || !editor.contains(event.target)) {
			return tn_bgPositionEditor__destroyEditor(element);
		}

		event.preventDefault();

		startX = event.clientX;
		startY = event.clientY;

		let position = tn_bgPositionEditor__getCurrentPosition(editor);
		[translateX, translateY] = [position.translateX, position.translateY];

		editor.removeEventListener('mousedown', onMousedown);
		editor.addEventListener('mousemove', onMousemove);
		editor.addEventListener('mouseup', onMouseup);
	};

	const onMousemove = event => {
		const endX = event.clientX;
		const endY = event.clientY;
		const deltaX = startX - endX;
		const deltaY = startY - endY;

		[hiddenImg, refImg, resizeHandlers].forEach(el => {
			Object.assign(el.style, {
				transform: `translate(${translateX - zoomFactor(deltaX)}px, ${translateY - zoomFactor(deltaY)}px)`,
			});
		});
	};

	const onMouseup = () => {
		editor.removeEventListener('mousemove', onMousemove);
		editor.removeEventListener('mouseup', onMouseup);

		editor.addEventListener('mousedown', onMousedown);
	};

	editor.addEventListener('mousedown', onMousedown);
}

/**
 * Преобразовываем размеры, смещение и позицию референсной картинки
 *
 * @param {HTMLElement} editor - элемент редактора (.bg-position-editor)
 */
function tn_bgPositionEditor__getCurrentPosition(editor) {
	const image = editor.querySelector('.bg-position-editor__hidden-img');
	const styles = window.getComputedStyle(image);

	// Парсим подобную структуру: "matrix(0, 0, 0, 0, -200.50, 400)"
	// И забираем две последних цифры, которые показывают смещение по x и y
	const transformMatrixRegex = /matrix\(-?\d+, -?\d+, -?\d+, -?\d+, (-?[\d.]+), (-?[\d.]+)\)/;
	let [, translateX, translateY] = transformMatrixRegex.exec(styles.transform);
	[translateX, translateY] = [parseFloat(translateX), parseFloat(translateY)];

	let [top, left] = [parseFloat(styles.top), parseFloat(styles.left)];
	let [width, height] = [parseFloat(styles.width), parseFloat(styles.height)];

	return {
		top,
		left,
		translateX,
		translateY,
		width,
		height,
	};
}

/**
 * Выход из редактора и установка итоговых значений для элемента
 *
 * @param {HTMLElement} element - редактируемый элемент в Zero
 */
function tn_bgPositionEditor__destroyEditor(element) {
	const atom = element.querySelector('.tn-atom');
	const editor = document.querySelector('.bg-position-editor');

	atom.style.visibility = null;

	const {top, left, width, height, translateX, translateY} = tn_bgPositionEditor__getCurrentPosition(editor);

	elem__setFieldValue($(element), 'bgposition_imgpos', `${translateY + top}px,${translateX + left}px`, 'render');
	elem__setFieldValue($(element), 'bgposition_imgsize', `${width}px,${height}px`, 'render');

	tn_showOutline('selected');

	editor.remove();
}

/**
 * Получаем размеры оригинальной картинки, при необходимости учитывая её фактические размеры в качестве бэкграунда установленные через css
 *
 * @param {string} src - ссылка на картинку
 * @param {{width: number, height: number}} containerSize - размеры элемента в котором картинка находится в текущий момент
 * @param {string} backgroundSize - размер бэкграунда, результат получения `el.style.backgroundSize`
 * @returns {Promise<{width: number, height: number}>}
 */
function tn_bgPositionEditor__getImageSize(src, containerSize, backgroundSize) {
	return new Promise(resolve => {
		const image = document.createElement('img');
		image.src = src;

		image.onload = function () {
			let width = image.width;
			let height = image.height;

			if (backgroundSize === 'cover') {
				const ratioW = containerSize.width / width;
				const ratioH = containerSize.height / height;

				const coverRatio = Math.max(ratioW, ratioH);

				width *= coverRatio;
				height *= coverRatio;
			} else if (backgroundSize.includes('px')) {
				[width, height] = backgroundSize.split(' ');
				[width, height] = [parseInt(width, 10), parseInt(height, 10)];
			}

			resolve({width, height});
		};
	});
}
