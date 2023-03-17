function elem__setZIndex__Backward($el) {
	tn_console('func: elem__zindex__backward');

	var $group = $el.closest('.tn-group');
	var $elems = $group.length ? $group.find('.tn-elem') : $('.tn-artboard > .tn-elem, .tn-group');
	var z_el = elem__getFieldValue($el, 'zindex');
	z_el = parseInt(z_el, 10);

	/* get closest behinde elem */
	var z_behind = 0;
	var $el_behind;

	$elems.each(function () {
		var $el_temp = $(this);
		var isGroup = $el_temp.hasClass('tn-group');
		var z_temp = isGroup
			? group__getLowestZIndexInGroup($el_temp.attr('id'), 'zindex')
			: elem__getFieldValue($el_temp, 'zindex');
		z_temp = parseInt(z_temp);

		if (z_temp < z_el) {
			if (z_temp > z_behind) {
				$el_behind = $el_temp;
				z_behind = z_temp;
			}
		}
	});

	if (typeof $el_behind !== 'undefined') {
		elem__setFieldValue($el, 'zindex', z_behind, 'render');

		if ($el_behind.hasClass('tn-group')) {
			var $elems = $el_behind.find('.tn-elem');
			$elems.each(function () {
				var $curEl = $(this);
				var curZIndex = parseInt(elem__getFieldValue($curEl, 'zindex'));
				elem__setFieldValue($curEl, 'zindex', curZIndex + 1);
			});
		} else {
			elem__setFieldValue($el_behind, 'zindex', z_el, 'render');
		}

		var new_z_el = elem__getFieldValue($el, 'zindex');
		return new_z_el;
	} else {
		/* el already on bottom, return same zindex */
		return z_el;
	}
}

function elem__setZIndex__Forward($el) {
	tn_console('func: elem__zindex__forward');

	var $group = $el.closest('.tn-group');
	var $elems = $group.length ? $group.find('.tn-elem') : $('.tn-artboard > .tn-elem, .tn-group');
	var z_el = elem__getFieldValue($el, 'zindex');
	z_el = parseInt(z_el, 10);

	/* get closest forward elem */
	var z_forward = 0;
	var $el_forward;

	/* get highest */
	$elems.each(function () {
		var $el_temp = $(this);
		var isGroup = $el_temp.hasClass('tn-group');
		var z_temp = isGroup
			? group__getHighestZIndexInGroup($el_temp.attr('id'), 'zindex')
			: elem__getFieldValue($el_temp, 'zindex');

		z_temp = parseInt(z_temp);

		if (z_temp > z_forward) {
			$el_forward = $el_temp;
			z_forward = z_temp;
		}
	});

	/* get higher then el but lower whet most top el */
	$elems.each(function () {
		var $el_temp = $(this);
		var isGroup = $el_temp.hasClass('tn-group');
		var z_temp = isGroup
			? group__getHighestZIndexInGroup($el_temp.attr('id'), 'zindex')
			: elem__getFieldValue($el_temp, 'zindex');
		z_temp = parseInt(z_temp);

		if (z_temp > z_el && z_temp < z_forward) {
			$el_forward = $el_temp;
			z_forward = z_temp;
		}
	});

	if (typeof $el_forward !== 'undefined') {
		elem__setFieldValue($el, 'zindex', z_forward, 'render');

		if ($el_forward.hasClass('tn-group')) {
			var $elems = $el_forward.find('.tn-elem');
			$elems.each(function () {
				var curEl = $(this);
				var curZIndex = parseInt(elem__getFieldValue(curEl, 'zindex'));
				elem__setFieldValue(curEl, 'zindex', curZIndex - 1);
			});
		} else {
			elem__setFieldValue($el_forward, 'zindex', z_el, 'render');
		}

		var new_z_el = elem__getFieldValue($el, 'zindex');
		return new_z_el;
	} else {
		/* el already on top, return same zindex */
		return z_el;
	}
}

function elem__setZIndex__Front($el) {
	tn_console('func: elem__zindex__front');
	var $group = $el.closest('.tn-group');
	var z_el = elem__getFieldValue($el, 'zindex');
	z_el = parseInt(z_el, 10);

	/* get closest highest elem */
	var z_highest = 0;

	/* get highest */
	if ($group.length) {
		var groupId = $group.attr('id');
		z_highest = parseInt(group__getHighestZIndexInGroup(groupId));
	} else {
		$('.tn-elem').each(function () {
			var $el_temp = $(this);
			var z_temp = elem__getFieldValue($el_temp, 'zindex');
			z_temp = parseInt(z_temp);

			if (z_temp > z_highest) {
				z_highest = z_temp;
			}
		});
	}

	/* if it already on top */
	if (z_highest == z_el) return z_el;

	var new_z_el = z_el;

	/* go down one by one to bottom */
	var $elems = $group.length ? $group.find('.tn-elem') : $('.tn-elem');
	$elems.each(function () {
		var $el_temp = $(this);
		var z_temp = parseInt(elem__getFieldValue($el_temp, 'zindex'));

		if (z_temp > z_el) {
			new_z_el = elem__setZIndex__Forward($el);
		}
	});

	return new_z_el;
}

function elem__setZIndex__Back($el) {
	tn_console('func: elem__zindex__back');
	var $group = $el.closest('.tn-group');
	var z_el = elem__getFieldValue($el, 'zindex');
	z_el = parseInt(z_el, 10);
	var new_z_el;

	/* get closest backe elem */
	var z_lower = 10000000;

	/* get lower */
	if (!$group.length) {
		$('.tn-elem').each(function () {
			var $el_temp = $(this);
			var z_temp = elem__getFieldValue($el_temp, 'zindex');
			z_temp = parseInt(z_temp, 10);
			if (z_temp < z_lower) z_lower = z_temp;
		});
	}

	/* if it already on bottom */
	if (z_lower == z_el) return z_el;

	/* go down each one by one */
	$('.tn-elem').each(function () {
		var $el_temp = $(this);
		var z_temp = parseInt(elem__getFieldValue($el_temp, 'zindex'));
		z_temp = parseInt(z_temp, 10);

		if (z_temp < z_el) {
			new_z_el = elem__setZIndex__Backward($el);
		}
	});

	return new_z_el;
}

function allelems__getHighestZIndex($elems) {
	var max = 0;
	var $els = $elems && $elems.length ? $elems : $('.tn-elem');

	$els.each(function () {
		var z = $(this).attr('data-field-zindex-value');
		z = parseInt(z, 10);
		if (typeof z !== 'undefined' && isNaN(z) == false && z > max) max = z;
	});
	max = parseInt(max, 10);
	return max;
}

function elem__checkZIndexes__Dubble() {
	var obj = {};

	$('.tn-elem').each(function () {
		var $el = $(this);
		var zindex = group__getFieldValue($el, 'zindex');
		if (obj[zindex]) {
			obj[zindex].push($el);
		} else {
			obj[zindex] = [$el];
		}
	});

	var counter = 0;

	Object.keys(obj).forEach(function (zindex) {
		var $els = obj[zindex];

		if ($els.length === 1) {
			var el = $els[0];
			var index = parseInt(zindex) + counter;
			el.attr('data-field-zindex-value', index);
			el.css('z-index', index);
		} else {
			$els.forEach(function ($el) {
				var index = parseInt(zindex) + counter;
				$el.attr('data-field-zindex-value', index);
				$el.css('z-index', index);
				counter++;
			});
		}
	});
}
