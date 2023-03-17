/* start for readctor functions */

function sbs__step__render($elem, step_obj, step_i) {
	sbs__stopElem($elem);
	sbs__resetPlayKeyframesAll();
	sbs__elem__reset($elem);

	if (typeof step_obj == 'undefined') return;
	if (step_i == 0) return;

	if (!window.tn.multi_edit) {
		sbs__step__showRenderedStep($elem, step_obj);
	} else {
		for (var i = 0; i < window.tn.multi_edit_elems.length; i++) {
			$elem = $(window.tn.multi_edit_elems[i]);
			sbs__step__showRenderedStep($elem, step_obj);
		}
	}
}

function sbs__step__showRenderedStep($elem, step_obj) {
	var $wrapper = $elem.find('.tn-atom__sbs-anim-wrapper');
	var transformChanges = '';
	var value;
	var groupId;
	var group;

	if ($wrapper.length === 0) {
		$elem
			.find('.tn-atom')
			.wrap('<div class="tn-atom__sbs-anim-wrapper" style="display:table; width:inherit; height:inherit;"></div>');
		$wrapper = $elem.find('.tn-atom__sbs-anim-wrapper');
	}

	if (step_obj.op !== '') {
		$wrapper.css('opacity', step_obj.op);
	}

	if (step_obj.mx !== '') {
		value = elem__getFieldValue($elem, 'left');
		value = elem__convertPosition__Local__toAbsolute($elem, 'left', value);
		groupId = elem__getFieldValue($elem, 'groupid');

		if (groupId) {
			group = group__getById(groupId);
			value = value - parseInt(group.css('left'), 10);
		}

		$elem.css('left', parseFloat(value) + parseFloat(step_obj.mx) + 'px');
	}
	if (step_obj.my !== '') {
		value = elem__getFieldValue($elem, 'top');
		value = elem__convertPosition__Local__toAbsolute($elem, 'top', value);

		groupId = elem__getFieldValue($elem, 'groupid');

		if (groupId) {
			group = group__getById(groupId);
			value = value - parseInt(group.css('top'), 10);
		}

		$elem.css('top', parseFloat(value) + parseFloat(step_obj.my) + 'px');
	}

	if (step_obj.sx !== '') {
		transformChanges += 'scaleX(' + step_obj.sx + ')';
	}

	if (step_obj.sy !== '') {
		transformChanges += 'scaleY(' + step_obj.sy + ')';
	}

	if (step_obj.ro !== '') {
		transformChanges += 'rotate(' + step_obj.ro + 'deg)';
	}

	$wrapper.css('transform', transformChanges);
}

function sbs__elem__reset($elem) {
	if ($elem.length > 1) {
		$elem.get().forEach(el => {
			$(el).find('.tn-atom__sbs-anim-wrapper > .tn-atom').unwrap();
			elem__renderView($(el));
		});
	} else {
		$elem.find('.tn-atom__sbs-anim-wrapper > .tn-atom').unwrap();
		elem__renderView($elem);
	}
}

function sbs__allelems__reset() {
	$('.tn-atom__sbs-anim-wrapper > .tn-atom').unwrap();
	allelems__renderView();
}

function sbs__playElem($elem) {
	if (sbs__stopElem($elem)) {
		if (window.tn.multi_edit) {
			window.tn.multi_edit_elems.get().forEach(el => sbs__returnStepRender($(el)));
		} else {
			sbs__returnStepRender($elem);
		}
		return;
	}

	if (window.tn.multi_edit) {
		window.tn.multi_edit_elems.get().forEach(el => sbs__processSBSAnimation($(el)));
	} else {
		sbs__processSBSAnimation($elem);
	}
}

function sbs__processSBSAnimation($elem) {
	sbs__stopAll($elem);
	sbs__elem__reset($elem);

	tn_hideOutline('selected');

	sbs__setupElem($elem);

	$elem.addClass('t-sbs-anim_started t-sbs-anim_playing');
	$elem.addClass('tn-elem__selected__noborder');

	$('.sui-btn-sbs-test-el').addClass('sui-btn-sbs-test-el_stop').text('Stop');

	if ($elem.attr('data-field-sbsloop-value') !== 'loop') {
		$elem.on('animationend', function () {
			$elem.removeClass('t-sbs-anim_playing');

			setTimeout(function () {
				if ($elem.hasClass('t-sbs-anim_playing') === false) {
					sbs__stopElem($elem);
					sbs__returnStepRender($elem);
					if (!elem__getFieldValue($elem, 'groupid')) $elem.draggable('enable');
				}
			}, 2000);
		});
	}

	$elem.draggable('disable');
}

function sbs__playAll($elem) {
	var maxDuration = 0;
	var hasLoop = false;
	var $els;

	if (sbs__stopAll()) {
		sbs__returnStepRender($elem);
		return;
	}

	$els = $('[data-field-sbsevent-value]').filter(function (i, el) {
		var isScroll = $(el).attr('data-field-sbsevent-value') === 'scroll';
		return $(el).attr('data-field-sbsevent-value') && !isScroll;
	});

	tn_hideOutline('selected');

	$els.each(function () {
		var $currentEl = $(this);
		if ($currentEl.hasClass('tn-elem__fake')) return;
		var duration;

		sbs__stopElem($currentEl);
		sbs__elem__reset($currentEl);

		duration = sbs__setupElem($currentEl);
		maxDuration = duration > maxDuration ? duration : maxDuration;

		$currentEl.addClass('t-sbs-anim_started t-sbs-anim_playing');
		$currentEl.addClass('tn-elem__selected__noborder');
		$currentEl.draggable('disable');

		if ($currentEl.attr('data-field-sbsloop-value') !== 'loop') {
			$currentEl.on('animationend', function () {
				$currentEl.removeClass('t-sbs-anim_playing');
				if (!elem__getFieldValue($currentEl, 'groupid')) $currentEl.draggable('enable');
			});
		} else {
			hasLoop = true;
		}
	});

	$('.sui-btn-sbs-test-all').addClass('sui-btn-sbs-test-all_stop').text('Stop');

	if (hasLoop === false) {
		setTimeout(function () {
			if ($('.t-sbs-anim_playing').length === 0) {
				if ($elem.length > 1) {
					$elem.each(function (i, el) {
						sbs__stopAll($(el));
						sbs__returnStepRender($(el));
						if (!elem__getFieldValue($(el), 'groupid')) $(el).draggable('enable');
					});
				} else {
					sbs__stopAll($elem);
					sbs__returnStepRender($elem);
					if (!elem__getFieldValue($elem, 'groupid')) $elem.draggable('enable');
				}
			}
		}, maxDuration * 1000 + 2000);
	}
}

function sbs__stopElem($elem) {
	const stopBtnEnabled = $('.sui-btn-sbs-test-el').hasClass('sui-btn-sbs-test-el_stop');
	if (window.tn.multi_edit) {
		const animatedEls = window.tn.multi_edit_elems.get();
		if (animatedEls.every(el => el.classList.contains('t-sbs-anim_started') && stopBtnEnabled)) {
			animatedEls.forEach(el => sbs__stopElemAnimation($(el)));
			return true;
		}
	} else {
		if ($elem.hasClass('t-sbs-anim_started') && stopBtnEnabled) {
			sbs__stopElemAnimation($elem);
			return true;
		}
	}
}

function sbs__stopElemAnimation($elem) {
	$elem.removeClass('t-sbs-anim_started t-sbs-anim_playing');
	$elem.removeClass('tn-elem__selected__noborder');
	$('.sui-btn-sbs-test-el').removeClass('sui-btn-sbs-test-el_stop').text('Play Element');
	$elem.find('.tn-atom__sbs-anim-wrapper > .tn-atom').unwrap();
	$elem.find('.sbs-anim-keyframes').remove();
	if (!elem__getFieldValue($elem, 'groupid')) $elem.draggable('enable');
	tn_showOutline('selected');
}

function sbs__stopAll() {
	var $playingEls = $('[data-field-sbsevent-value].t-sbs-anim_started');
	var $playBtn = $('.sui-btn-sbs-test-all');

	if (($playingEls.length > 0 || window.tn.multi_edit) && $playBtn.hasClass('sui-btn-sbs-test-all_stop')) {
		$playingEls.get().forEach(el => {
			el.classList.remove('t-sbs-anim_started', 't-sbs-anim_playing', 'tn-elem__selected__noborder');
			if (!elem__getFieldValue($(el), 'groupid')) $(el).draggable('enable');
		});

		$playBtn.removeClass('sui-btn-sbs-test-all_stop').text('Play All');
		$('.tn-atom__sbs-anim-wrapper > .tn-atom').unwrap();
		$('.sbs-anim-keyframes').remove();

		tn_showOutline('selected');

		return true;
	}
}

function sbs__returnStepRender($elem) {
	var allSteps_obj = sbs__getStepsObj($elem, false);
	var step_i = $elem.attr('data-sbs-step-i');
	var step_obj = allSteps_obj[step_i];

	sbs__step__render($elem, step_obj, step_i);
}

function sbs__setupElem($elem) {
	var opts = {
		elements: $elem.get(),
		isEditMode: true,
	};

	var id;
	var $el_atom;
	var animStuff;
	var $existingStyle;

	id = $elem.attr('data-elem-id');
	$el_atom = $elem.find('.tn-atom');

	if ($elem.find('.tn-atom__sbs-anim-wrapper').length === 0) {
		$el_atom.wrap(
			'<div class="tn-atom__sbs-anim-wrapper" style="display:table; width:inherit; height:inherit;"></div>',
		);
	}

	var backdropFilter = $elem.css('-webkit-backdrop-filter') || $elem.css('backdrop-filter');
	if (backdropFilter) {
		var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
		$elem.css('-webkit-backdrop-filter', 'none');
		$elem.css('backdrop-filter', 'none');
		var sbsWrapper = $elem.find('.tn-atom__sbs-anim-wrapper');
		if (isFirefox) sbsWrapper.css('backface-visibility', 'visible');
		sbsWrapper.css('-webkit-backdrop-filter', backdropFilter).css('backdrop-filter', backdropFilter);
	}

	t_animationSBS__cacheAndSetData(opts);
	animStuff = t_animationSBS__generateKeyframes(opts);
	$existingStyle = $elem.find('.sbs-anim-keyframes');

	if ($existingStyle.length > 0) {
		$existingStyle.html(animStuff);
	} else {
		$el_atom.after('<style class="sbs-anim-keyframes sbs-anim-keyframes__' + id + '">' + animStuff + '</style>');
	}

	return opts.elements[0].timeDuration;
}

function sbs__resetPlayKeyframesAll() {
	$('.tn-atom__sbs-anim-wrapper > .tn-atom').unwrap();
	$('.sbs-anim-keyframes').remove();
	$('.t-sbs-anim_started').removeClass('t-sbs-anim_started').removeClass('tn-elem__selected__noborder');
}

/* end for readctor functions */
