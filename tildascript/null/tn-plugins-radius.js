window.tn_shapeBorderRadius__OFFSET = 16;

function tn_shapeBorderRadius__shouldShowHandle(element) {
	const isShape = element.getAttribute('data-elem-type') === 'shape';
	const isRectangle = element.getAttribute('data-field-figure-value') === 'rectangle';

	return isShape && isRectangle;
}

function tn_shapeBorderRadius__setHandlePosition(element, position) {
	const OFFSET = window.tn_shapeBorderRadius__OFFSET;

	let initalBorderRadius = position || parseInt(element.style.borderRadius, 10) || 0;

	const handle = element.querySelector('.border-radius-handle');
	const elementBBox = element.getBoundingClientRect();

	const smallestSide = Math.min(elementBBox.width, elementBBox.height);

	// Если шейп по одной стороне меньше чем 64 пикселя, то скрываем элемент
	if (smallestSide < 64) {
		handle.style.display = 'none';
	} else {
		handle.style.display = null;
	}

	const maxRadius = smallestSide / 2 / window.tn.zoom;
	const factor = (maxRadius - OFFSET) / maxRadius;

	if (initalBorderRadius >= maxRadius) {
		handle.style.bottom = maxRadius + 'px';
		handle.style.right = maxRadius + 'px';
	} else if (initalBorderRadius) {
		const borderRadius = Math.round(initalBorderRadius * factor + OFFSET);

		handle.style.bottom = borderRadius + 'px';
		handle.style.right = borderRadius + 'px';
	} else {
		handle.style.bottom = OFFSET + 'px';
		handle.style.right = OFFSET + 'px';
	}
}

function tn_shapeBorderRadius__destroyHandle(element) {
	const handle = element.querySelector('.border-radius-handle');

	if (handle) {
		handle.remove();
	}
}

function tn_shapeBorderRadius__initHandle(element) {
	if (element instanceof jQuery) {
		element = element[0];
	}

	let handle = element.querySelector('.border-radius-handle');
	if (handle) handle.remove();

	element.insertAdjacentHTML(
		'beforeend',
		/*html*/ `
			<div class="border-radius-handle">
    	  <div class="border-radius-handle__circle"></div>
    	</div>
  	`,
	);

	const OFFSET = window.tn_shapeBorderRadius__OFFSET;

	const atom = element.querySelector('.tn-atom');
	handle = element.querySelector('.border-radius-handle');
	const $handle = $(handle);

	tn_shapeBorderRadius__setHandlePosition(element);

	let startX;
	let startY;
	let handleY;
	let elementBBox;

	$handle.tooltipster({
		theme: 'tn-tooltip__tooltipster--radius-handle',
		interactive: true,
		autoClose: false,
		arrow: false,
		updateAnimation: false,
		content: '',
		delay: 0,
		position: 'top',
		trigger: 'custom',
	});

	const onMousedown = event => {
		event.preventDefault();
		event.stopImmediatePropagation();

		handle.style.display = 'block';

		elementBBox = element.getBoundingClientRect();

		startX = event.clientX;
		startY = event.clientY;
		handleY = parseInt(handle.style.bottom, 10);
		handleX = parseInt(handle.style.right, 10);

		document.addEventListener('mousemove', onMousemove);
		document.addEventListener('mouseup', onMouseup);
		handle.removeEventListener('mousedown', onMousedown);
	};

	const onMousemove = event => {
		const endX = event.clientX;
		const endY = event.clientY;
		const deltaX = endX - startX;
		const deltaY = endY - startY;

		const maxRadius = Math.min(elementBBox.width, elementBBox.height) / 2 / window.tn.zoom;
		const factor = (maxRadius - OFFSET) / maxRadius;

		const resultingDelta = (deltaX + deltaY) / 2;
		let position = Math.round(handleY - resultingDelta);

		if (position >= maxRadius) position = maxRadius;
		if (position - OFFSET <= 0) position = OFFSET;

		handle.style.bottom = position + 'px';
		handle.style.right = position + 'px';

		const borderRadius = Math.round((position - OFFSET) / factor);

		element.style.borderRadius = borderRadius + 'px';
		atom.style.borderRadius = borderRadius + 'px';

		$handle.tooltipster('content', `Radius ${borderRadius}`);
		$handle.tooltipster('show');
	};

	const onMouseup = () => {
		const $el = $(element);
		const borderRadius = parseInt(atom.style.borderRadius, 10);

		handle.style.display = null;

		tn_undo__Add('elem_save', $el);
		elem__setFieldValue($el, 'borderradius', borderRadius, true, true);
		panelSettings__updateUi($el, 'borderradius');

		$handle.tooltipster('hide');

		document.removeEventListener('mousemove', onMousemove);
		document.removeEventListener('mouseup', onMouseup);
		handle.addEventListener('mousedown', onMousedown);
	};

	handle.addEventListener('mousedown', onMousedown);
}
