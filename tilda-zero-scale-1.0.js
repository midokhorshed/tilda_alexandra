/**
 * Autoscale (Zero Block)
 * -----------------------------------------------------------------------------------------
 * Скрипт является функциональной частью Zero Block. Вызывается из скрипта tilda-zero-N.N.js.
 * Реализовывает функцию Autoscale, которая увеличивает весь контент блока по ширине экрана.
 * Работает на css-свойствах transform: scale() (для НЕ-Хромиум Opera и Firefox) и zoom (для всех остальных браузеров).
 *
 * Принцип работы:
 * - Найти обложку, фильтр и блок самого artBoard и дать им высотку умноженную на window.tn-scale_factor
 * - Найти все элементы внутри artBoard и дать им соответсвующее css-свойство со значением window.tn-scale_factor
 *
 * Принцип подключения:
 * - Если на странице есть хотя бы 1 Zero Block с включённой функцией "Autoscale to window width".
 * - О том, что функция включена, говорит data-атрибут на элементе artBoard data-artboard-upscale="window"
 *   или data-artboard-upscale-res-NNN="window".
 */

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

function t396_scaleBlock(recid) {
	var isOnlyScalable = t396_isOnlyScalableBrowser();
	var resolution = t396_detectResolution(recid);
	var record = document.getElementById('rec' + recid);
	var elements = record ? record.querySelectorAll('.t396__elem') : [];
	var artBoard = record ? record.querySelector('.t396__artboard') : null;

	if (artBoard) {
		var artBoardWidth = artBoard.clientWidth;
		var artBoardHeight = t396_ab__getFieldValue(artBoard, 'height');
		var updatedBlockHeight = Math.floor(artBoardHeight * window.tn_scale_factor);
		var artBoardHeightVH = t396_ab__getFieldValue(artBoard, 'height_vh');
		window.tn_scale_offset = (artBoardWidth * window.tn_scale_factor - artBoardWidth) / 2;

		if (artBoardHeightVH) {
			var artBoardMinHeight = t396_ab__getFieldValue(artBoard, 'height');
			var artBoardMaxHeight = t396_ab__getHeight(artBoard);
			var scaledMinHeight = artBoardMinHeight * window.tn_scale_factor;
			updatedBlockHeight = scaledMinHeight >= artBoardMaxHeight ? scaledMinHeight : artBoardMaxHeight;
		}

		artBoard.classList.add('t396__artboard_scale');

		// prettier-ignore
		var styleStr =
			'<style class="t396__scale-style">' +
				'.t-rec#rec' + recid + ' { overflow: visible; }' +
				'#rec' + recid + ' .t396__carrier,' +
				'#rec' + recid + ' .t396__filter,' +
				'#rec' + recid + ' .t396__artboard {' +
					'height: ' + updatedBlockHeight + 'px !important;' +
					'width: 100vw !important;' +
					'max-width: 100%;' +
				'}' +
			'</style>';

		artBoard.insertAdjacentHTML('beforeend', styleStr);
	}

	Array.prototype.forEach.call(elements, function (elem) {
		var atom = elem.querySelector('.tn-atom');
		var containerProp = t396_elem__getFieldValue(elem, 'container');
		var elemType = elem.getAttribute('data-elem-type');

		if (containerProp === 'grid') {
			if (isOnlyScalable) {
				if (atom) {
					var atomParent = atom.parentNode;
					var div = document.createElement('div');
					div.classList.add('tn-atom__scale-wrapper');
					div.style.transform = 'scale(' + window.tn_scale_factor + ')';
					if (atomParent) atomParent.removeChild(atom);
					div.appendChild(atom);
					if (atomParent) atomParent.appendChild(div);
				}

				// update filter scale for scalable browsers
				if (elem.style.backdropFilter === 'none') elem.style.backdropFilter = '';
				var elemFilter = getComputedStyle(elem).backdropFilter;
				if (elemFilter && atom && div) {
					elem.style.backdropFilter = 'none';
					div.style.backdropFilter = elemFilter;
				}

				/**
				 * Background-attachment: fixed; not working with any transform property in Firefox.
				 * To fixed it, we detect such cases, remove wrapper with transform: scale()
				 * and add the coordinates and dimensions calculated with window.tn_scale_factor
				 */

				var imageElem = elem.querySelector('.t-bgimg');
				if (imageElem && window.getComputedStyle(imageElem).backgroundAttachment === 'fixed') {
					// Remove wrapper with transform: scale() property
					elem.removeChild(imageElem.parentNode);
					elem.appendChild(imageElem);

					// Calculate current height, width, top, left
					var elemHeight = t396_elem__getFieldValue(elem, 'height');
					elemHeight = t396_elem__getHeight(elem, elemHeight);
					elemHeight = t396_elem__convertPosition__Local__toAbsolute(elem, 'height', elemHeight);

					var elemWidth = t396_elem__getFieldValue(elem, 'width');
					elemWidth = t396_elem__getWidth(elem, elemWidth);
					elemWidth = t396_elem__convertPosition__Local__toAbsolute(elem, 'width', elemWidth);

					var elemTop = parseFloat(t396_elem__getFieldValue(elem, 'top'));
					var elemLeft = parseFloat(t396_elem__getFieldValue(elem, 'left'));

					// Add height, width, top, left emulating transform: scale()
					elem.style.top = elemTop * window.tn_scale_factor + 'px';
					elem.style.left = elemLeft * window.tn_scale_factor + 'px';
					elem.style.height = elemHeight * window.tn_scale_factor + 'px';
					elem.style.width = elemWidth * window.tn_scale_factor + 'px';

					// Set the attribute so the other functions will not rerander the element
					elem.setAttribute('data-scale-off', 'yes');
				}
			} else {
				elem.style.zoom = window.tn_scale_factor;

				/**
				 * On iPad with desktop userAgent, the zoom property does not scale text. To fix it, manually recalculate
				 * the size and coordinates of the text. Separate solution for the text inside
				 * the button in next if() construction
				 */

				var isIpad = /Macintosh/.test(navigator.userAgent) && 'ontouchend' in document && screen.width >= 744;

				if (elemType === 'text' && isIpad) {
					// remove zoom property that doesn't work and properties from past itherations
					atom.style.removeProperty('font-size');
					elem.style.removeProperty('zoom');
					elem.style.removeProperty('top');
					elem.style.removeProperty('left');
					elem.style.removeProperty('width');

					// get styles that must be scaled
					var fontSize = parseInt(window.getComputedStyle(atom).fontSize, 10);

					var elemWidth = t396_elem__getFieldValue(elem, 'width');
					elemWidth = t396_elem__getWidth(elem, elemWidth);
					elemWidth = t396_elem__convertPosition__Local__toAbsolute(elem, 'width', elemWidth);

					var elemTop = parseFloat(t396_elem__getFieldValue(elem, 'top'));
					elemTop = t396_elem__convertPosition__Local__toAbsolute(elem, 'top', elemTop);

					var elemLeft = parseFloat(t396_elem__getFieldValue(elem, 'left'));
					elemLeft = t396_elem__convertPosition__Local__toAbsolute(elem, 'left', elemLeft);

					// set scaled styles on element
					atom.style.fontSize = fontSize * window.tn_scale_factor + 'px';
					elem.style.top = elemTop * window.tn_scale_factor + 'px';
					elem.style.left = elemLeft * window.tn_scale_factor + 'px';
					elem.style.width = elemWidth * window.tn_scale_factor + 'px';

					// Set the attribute so the other functions will not rerander the element
					elem.setAttribute('data-scale-off', 'yes');
				}

				if (elemType === 'button' && isIpad && !atom.classList.contains('t396_manual-scaled-text')) {
					/**
					 * remove zoom property that doesn't work for text inside the button.
					 * It's needed because getComputedStyles returns wrong fontSize of element with zoom
					 */

					elem.style.removeProperty('zoom');

					// calculate current styles and set on element. Add class for returns in case of resize
					var atomStyles = window.getComputedStyle(atom);
					var fontSize = parseInt(atomStyles.fontSize, 10);
					atom.classList.add('t396_manual-scaled-text');
					atom.style.fontSize = fontSize * window.tn_scale_factor + 'px';

					// put back zoom for button
					elem.style.zoom = window.tn_scale_factor;
				}

				/**
				 * The Zoom property does not scale content inside an iframe.
				 * Therefore, it is necessary to remove zoom for such elements and add transform: scale()
				 */

				var iframe = elem.querySelector('iframe');
				var isAnimated = elem.getAttribute('data-animate-style');
				var isSBSAnimated = elem.getAttribute('data-animate-sbs-event');

				if (iframe && !isAnimated && !isSBSAnimated) {
					elem.style.removeProperty('zoom');

					var elemHeight = t396_elem__getFieldValue(elem, 'height');
					elemHeight = t396_elem__getHeight(elem, elemHeight);
					elemHeight = t396_elem__convertPosition__Local__toAbsolute(elem, 'height', elemHeight);

					var elemWidth = t396_elem__getFieldValue(elem, 'width');
					elemWidth = t396_elem__getWidth(elem, elemWidth);
					elemWidth = t396_elem__convertPosition__Local__toAbsolute(elem, 'width', elemWidth);

					var elemTop = parseFloat(t396_elem__getFieldValue(elem, 'top'));
					elemTop = t396_elem__convertPosition__Local__toAbsolute(elem, 'top', elemTop);
					elemTop = elemTop * window.tn_scale_factor;
					elemTop = elemTop + (elemHeight * window.tn_scale_factor - elemHeight) / 2;

					var elemLeft = parseFloat(t396_elem__getFieldValue(elem, 'left'));
					elemLeft = t396_elem__convertPosition__Local__toAbsolute(elem, 'left', elemLeft);
					elemLeft = elemLeft * window.tn_scale_factor;
					elemLeft = elemLeft + (elemWidth * window.tn_scale_factor - elemWidth) / 2;

					/**
					 * It is necessary to calculate the correct offset left and offset top of the element,
					 * for this we convert from local to absolute value.
					 * We also need to calculate the actual width and height of the element after scale
					 * and add the difference to the offsets
					 */

					elem.style.top = elemTop + 'px';
					elem.style.left = elemLeft + 'px';

					var atomParent = atom.parentNode;
					if (atomParent && atomParent.classList.contains('tn-atom__scale-wrapper')) {
						atomParent = atomParent.parentNode;
					}
					var div = document.createElement('div');
					div.classList.add('tn-atom__scale-wrapper');
					div.style.transform = 'scale(' + window.tn_scale_factor + ')';
					while (atomParent.firstChild) {
						atomParent.removeChild(atomParent.firstChild);
					}
					div.appendChild(atom);
					if (atomParent) atomParent.appendChild(div);
					elem.setAttribute('data-scale-off', 'yes');
				}

				/**
				 * If you apply the Zoom property to shapes that are 1px high or 1px wide,
				 * they will be visually different thicknesses. This code fixes that bug.
				 */

				if (elemType === 'shape') {
					var elemHeight = t396_elem__getFieldValue(elem, 'height');
					elemHeight = t396_elem__getHeight(elem, elemHeight);
					elemHeight = t396_elem__convertPosition__Local__toAbsolute(elem, 'height', elemHeight);

					var elemWidth = t396_elem__getFieldValue(elem, 'width');
					elemWidth = t396_elem__getWidth(elem, elemWidth);
					elemWidth = t396_elem__convertPosition__Local__toAbsolute(elem, 'width', elemWidth);

					var elemTop = parseFloat(t396_elem__getFieldValue(elem, 'top'));
					elemTop = t396_elem__convertPosition__Local__toAbsolute(elem, 'top', elemTop);

					var elemLeft = parseFloat(t396_elem__getFieldValue(elem, 'left'));
					elemLeft = t396_elem__convertPosition__Local__toAbsolute(elem, 'left', elemLeft);

					var elemStyles = window.getComputedStyle(atom);
					var elemBorder = elemStyles.borderWidth;
					var isImage = elemStyles.backgroundImage !== 'none' ? true : false;
					var isAnimated = elem.getAttribute('data-animate-sbs-event');

					/**
					 * Check the width and height of the shape, the presence
					 * of the border and the background image
					 */

					if ((elemHeight <= 2 || elemWidth <= 2) && elemBorder === '0px' && !isImage && !isAnimated) {
						elem.style.removeProperty('zoom');

						/**
						 * Multiply the dimensions and coordinates by the scale factor and assign the elements.
						 * Rounding is necessary to solve the problem
						 */

						var scaleWidth = elemWidth * window.tn_scale_factor;
						var scaleHeight = elemHeight * window.tn_scale_factor;
						var scaleTop = elemTop * window.tn_scale_factor;
						var scaleLeft = elemLeft * window.tn_scale_factor;

						elem.style.width = parseFloat(scaleWidth) + 'px';
						elem.style.height = parseFloat(scaleHeight) + 'px';
						elem.style.top = Math.round(scaleTop) + 'px';
						elem.style.left = Math.round(scaleLeft) + 'px';

						/**
						 * Set the attribute so that other functions do not change
						 * the size and coordinates of the element
						 */

						elem.setAttribute('data-scale-off', 'yes');
					}
				}

				if (elem.getAttribute('data-elem-type') === 'text' && resolution < 1200 && atom) {
					atom.style.webkitTextSizeAdjust = 'auto';
				}
				if (atom) atom.style.transformOrigin = 'center';
			}
		}
	});
}

/**
 * For cases where there is no inline function t396_initialScale() in the <head/>.
 * This can happen if the user receives "body only" data via the API
 */
if (!window.t396_initialScale) window.t396_initialScale = function () {};