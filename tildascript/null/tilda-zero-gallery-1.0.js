function t_zeroGallery__init(recid, elemid) {
	var el = $('#rec' + recid + ' .tn-elem[data-elem-id="' + elemid + '"]');

	t_zeroGallery__render(el);
	t396_elem__renderView(el);

	t_sldsInit(el);
	t_slds_updateSlider(el);

	t_zeroGallery__render_next(el, recid);
	if (el.attr('data-field-zoomable-value') == 'y' && $('.t-zoomer__wrapper').length == 0) {
		setTimeout(() => {
			t_initZoom();
		});
	}

	el.on('updateSlider', function () {
		el.find('.tn-elem__gallery__iframe').each(function () {
			var src = $(this).attr('src');
			$(this).attr('src', src);
		});

		el.find('.tn-elem__gallery__play').each(function () {
			$(this).css('display', 'block');
			$(this).next().removeClass('tn-elem__gallery__frame_active');
			$(this).prev().css('opacity', '1');
		});
	});

	// $( window ).resize(function () {
	//   t396_waitForFinalEvent(function(){
	// 		setTimeout(function() {
	// 			t_slds_updateSlider(el);
	// 		}, 200);
	//   }, 500, 'slds_resizeruniqueid'+recid+elemid);
	// });

	$('.t396').bind('displayChanged', function () {
		setTimeout(function () {
			t_slds_updateSlider(recid);
		});
	});

	el.find('.t-slds').css('visibility', 'visible');
}

function t_zeroGallery__setLazyloadUrls(url) {
	if (url.slice(0, 28) !== 'https://static.tildacdn.com/') return '';

	var length = 65;
	if (url.indexOf('/lib') !== -1) {
		length = 69;
	}

	if (url.slice(-3) === 'svg') return url;
	return [url.slice(0, length), '-/resize/20x/', url.slice(length)].join('');
}

function t_zeroForms__getTildaMode() {
	if (typeof window.tildamode != 'undefined') {
		return window.tildamode;
	}

	if ($('#allrecords').length) {
		if ($('#allrecords').attr('data-tilda-mode') == 'edit') {
			window.tildamode = 'edit';
		} else if ($('#allrecords').attr('data-tilda-mode') == 'preview') {
			window.tildamode = 'preview';
		} else {
			window.tildamode = 'published';
		}
	}

	return window.tildamode;
}

function t_zeroGallery__render(el) {
	var datastr = el.attr('data-field-imgs-value');
	if (!datastr) {
		datastr = el.find('.tn-atom__slds-imgs-textarea').val();
	}

	if (typeof datastr == 'undefined' || datastr == '') datastr = '{}';
	var data = JSON.parse(datastr);

	// prettier-ignore
	el.find(".tn-atom").html(' \
		<div class="t-slds" style="visibility: hidden;"> \
			<div class="t-slds__main"> \
				<div class="t-slds__container"> \
					<div class="t-slds__items-wrapper" data-slider-transition="" data-slider-with-cycle="true" data-slider-correct-height="true" data-auto-correct-mobile-width="false"  data-slider-is-preview="true"> \
					</div> \
				</div> \
			</div> \
			<div class="t-slds__bullet_wrapper"></div> \
			<div class="t-slds__caption__container"></div> \
			<div class="t-slds__arrow_container"> \
				<div class="t-slds__arrow_wrapper t-slds__arrow_wrapper-left" data-slide-direction="left" style="height: 488px;"> \
					<div class="t-slds__arrow t-slds__arrow-left"> \
						<div class="t-slds__arrow_body t-slds__arrow_body-left"> \
						<svg class="t-null__slds-arrow t-null__slds-arrow_1" width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">\
							<path d="M39 68L60 47L39 26" stroke="black" vector-effect="non-scaling-stroke"/>\
						</svg>\
						<svg class="t-null__slds-arrow t-null__slds-arrow_2"  width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">\
							<path d="M63 47.917H30" stroke="black" vector-effect="non-scaling-stroke"/>\
							<path d="M46.917 64L63 47.917L46.917 31.834" stroke="black" vector-effect="non-scaling-stroke"/>\
						</svg>\
					</div> \
				</div> \
			</div> \
			<div class="t-slds__arrow_wrapper t-slds__arrow_wrapper-right" data-slide-direction="right" style="height: 488px;"> \
				<div class="t-slds__arrow t-slds__arrow-right "> \
					<div class="t-slds__arrow_body t-slds__arrow_body-right"> \
					<svg class="t-null__slds-arrow t-null__slds-arrow_1" width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">\
						<path d="M39 68L60 47L39 26" stroke="black" vector-effect="non-scaling-stroke"/>\
					</svg>\
					<svg class="t-null__slds-arrow t-null__slds-arrow_2"  width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">\
						<path d="M63 47.917H30" stroke="black" vector-effect="non-scaling-stroke"/>\
						<path d="M46.917 64L63 47.917L46.917 31.834" stroke="black" vector-effect="non-scaling-stroke"/>\
					</svg>\
					</div> \
				</div> \
			</div> \
		</div> \
		</div> \
	');

	function escapeHtml(unsafe) {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	var zoomable = t_zeroForms__getTildaMode() == 'published' && t396_elem__getFieldValue(el, 'zoomable') == 'y';

	for (var i = 0; i < data.length; i++) {
		var imgData = data[i];

		var withLazy = false;
		if (window.lazy == 'y') {
			var lazyoff = t396_elem__getFieldValue(el, 'lazyoff');
			withLazy = window.lazy == 'y' && lazyoff != 'y';
		}

		zoomable = zoomable && !imgData.li_imgurl;
		if (imgData.li_vimeo || imgData.li_youtube) {
			var videoFrame;
			if (imgData.li_youtube) {
				var videoId = imgData.li_youtube;
				if (videoId == false) videoId = '';
				videoFrame =
					'<iframe class="tn-elem__gallery__iframe" width="100%" height="100%" src="https://www.youtube.com/embed/' +
					videoId +
					'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
			} else {
				var videoId = imgData.li_vimeo;
				if (videoId == false) videoId = '';
				videoFrame =
					'<iframe class="tn-elem__gallery__iframe" width="100%" height="100%" src="https://player.vimeo.com/video/' +
					videoId +
					'" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
			}

			// prettier-ignore
			el.find('.t-slds__items-wrapper').append(' \
				<div class="t-slds__item' + (i === 0  ? ' t-slds__item_active' : '') + '" data-slide-index="' + (i + 1) + '"> \
					<div class="t-width"> \
						<div itemscope class="t-null__slds-wrapper t-slds__wrapper t-slds__wrapper_100 t-align_center"> \
							<meta itemprop="image" content="' + escapeHtml(imgData.li_imgalt) + '"> \
							<meta itemprop="caption" content="SEO"> \
							<div class="tn-elem__gallery__video-wrapper">\
								<div class="tn-atom__slds-img' + (withLazy ? ' t-bgimg' : '') + '" \
								' + (withLazy ? ('data-original="' + imgData.li_img + '" style="background-image: url(' + t_zeroGallery__setLazyloadUrls(imgData.li_img) + ')"') : 'style="background-image: url(' + imgData.li_img + ')"') + ' \
									imgfield="tn_img_' + imgData.lid + '" data-tu-noclick="yes" data-tu-is-image="yes" data-tu-multiple="no" />\
			    	    <div class="tn-elem__gallery__play" data-slider-video-type="' + (imgData.li_youtube ? 'youtube' : 'vimeo') + '" data-slider-video-url="' + (imgData.li_youtube || imgData.li_vimeo) + '">\
			    	      <div class="tn-elem__gallery__play_icon">\
			    	        <svg viewBox="0 0 60 60"><g stroke="none" stroke-width="1" fill="" fill-rule="evenodd"><g class="tn-elem__gallery__play_icon__color-holder" transform="translate(-691.000000, -3514.000000)" fill="#FFFFFF"><path d="M721,3574 C737.568542,3574 751,3560.56854 751,3544 C751,3527.43146 737.568542,3514 721,3514 C704.431458,3514 691,3527.43146 691,3544 C691,3560.56854 704.431458,3574 721,3574 Z M715,3534 L732,3544.5 L715,3555 L715,3534 Z"></path></g></g></svg>\
			    	      </div>\
			    	    </div>\
			    	    <div class="tn-elem__gallery__frame">' + videoFrame + '</div>\
			    	  </div>\
						</div> \
					</div> \
				</div> \
			');
		} else {
			// prettier-ignore
			el.find('.t-slds__items-wrapper').append(' \
				<div class="t-slds__item' + (i === 0  ? ' t-slds__item_active' : '') + '" data-slide-index="' + (i + 1) + '"> \
					<div class="t-width"> \
						<div itemscope class="t-null__slds-wrapper t-slds__wrapper t-slds__wrapper_100 t-align_center"> \
							<meta itemprop="image" content="' + escapeHtml(imgData.li_imgalt) + '"> \
							<meta itemprop="caption" content="SEO"> \
							<' + (imgData.li_imgurl ? ('a href="' + imgData.li_imgurl + '"') : 'div') + ' data-img-lid="' + imgData.lid + '" \
							' + (imgData.li_imgtarget ? 'target="_blank"' : '') + (imgData.li_imgnofollow ? 'rel="nofollow"' : '') + '\
							' + (zoomable ? (' data-zoom-target="' + (i + 1) + '" data-zoomable="yes" data-img-zoom-url="' + imgData.li_img + '"') : '') + '\
							class="tn-atom__slds-img' + (withLazy ? ' t-bgimg' : '') + (zoomable ? ' t-zoomable' : '') + '" \
							' + (withLazy ? ('data-original="' + imgData.li_img + '" style="background-image: url(' + t_zeroGallery__setLazyloadUrls(imgData.li_img) + ')"') : 'style="background-image: url(' + imgData.li_img + ')"') + ' \
							width="100%" style="display:block;" imgfield="tn_img_' + imgData.lid + '" \
							data-tu-noclick="yes" data-tu-is-image="yes" data-tu-multiple="no" /> \
						</div> \
					</div> \
				</div> \
			');
		}

		el.find('.tn-elem__gallery__play').click(function () {
			$(this).css('display', 'none');
			$(this).next().addClass('tn-elem__gallery__frame_active');
			$(this).prev().css('opacity', '0');
		});

		// el.find('.t-slds__container').off('mouseover mouseout mousemove click');
		// el.find('.t-slds__container').on('mouseover', function() {
		// 	if (el.hasClass('tn-elem__gallery_arrows-cursor')) {
		// 	el.find('.t-slds__container').off('mousemove click');
		// 	el.find('.t-slds__container').on('mousemove', function (e) {
		// 			var pageX = e.pageX;
		// 			var offsetLeft = el.position().left;
		// 			if (pageX < offsetLeft + el.width()/2) {
		// 				var cursor = "url('";
		// 				cursor += 'data:image/svg+xml;utf8,<svg width="36" height="36" viewBox="0 0 122 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 35H121.5" stroke="black" style="stroke-width: 6px; stroke: rgb(0, 0, 0);"/><path d="M35 1L1 35L35 69" stroke="black" style="stroke-width: 6px; stroke: rgb(0, 0, 0);"/></svg>';
		// 				cursor += "') 0 18, w-resize";
		// 				el.find('.t-slds__container').css('cursor', cursor);
		// 			} else {
		// 				var cursor = "url('";
		// 				cursor += 'data:image/svg+xml;utf8,<svg width="36" height="36" viewBox="0 0 122 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M121 35L0.5 35" stroke="black" style="stroke-width: 6px; stroke: rgb(0, 0, 0);"/><path d="M87 69L121 35L87 1" stroke="black" style="stroke-width: 6px; stroke: rgb(0, 0, 0);"/></svg>';
		// 				cursor += "') 36 18, e-resize";
		// 				el.find('.t-slds__container').css('cursor', cursor);
		// 			}
		// 		});
		// 		el.find('.t-slds__container').on('click', function (e) {
		// 			var pageX = e.pageX;
		// 			if ($(e.target).closest('.tn-elem__gallery__play').length) return;
		// 			var offsetLeft = el.position().left;
		// 			if (pageX < offsetLeft + el.width()/2) {
		// 				el.find('.t-slds__arrow-left').click();
		// 			} else {
		// 				el.find('.t-slds__arrow-right').click();
		// 			}
		// 		})
		// 	}
		// });

		// el.find('.t-slds__container').on('mouseout', function name() {
		// 	el.find('.t-slds__container').off('mousemove click');
		// });

		// prettier-ignore
		el.find('.t-slds__bullet_wrapper').append(' \
			<div class="t-slds__bullet' + (i === 0  ? ' t-slds__bullet_active' : '') + '" data-slide-bullet-for="' + (i + 1) + '"> \
				<div class="t-slds__bullet_body" style="width: 10px; height: 10px;background-color: white;"></div> \
			</div> \
		');

		// prettier-ignore
		el.find('.t-slds').append(' \
			<div class="t-slds__caption' + (i === 0  ? ' t-slds__caption-active' : '') + '" data-slide-caption="' + (i + 1) + '"> \
				<div class="t-slds__caption_wrapper"> \
					<div class="t-slds__title">' + escapeHtml(imgData.li_imgtitle) + '</div> \
				</div> \
			</div> \
		');
	}
}

function t_zeroGallery__render_next(el, recid) {
	var fields_str = '';
	fields_str +=
		'slds_arrowsize,slds_arrowlinesize,slds_arrowcolor,slds_arrowcolorhover,slds_arrowbgcolor,slds_arrowbgcolorhover,slds_arrowbgopacity,slds_arrowbgopacityhover,slds_dotssize,slds_dotsbgcolor,slds_dotsbgcoloractive,slds_loop,slds_speed,slds_autoplay,';
	fields_str +=
		'slds_arrowcontrols,slds_dotscontrols,slds_stretch,slds_playiconsize,slds_playiconcolor,slds_captiontopmargin,slds_dotsvmargin,slds_captionwidth,slds_arrowhmargin,slds_arrowvmargin,slds_dotshmargin,slds_arrowalign,slds_arrowbetweenmargin,slds_arrowtype,slds_cursorcontrol,slds_imgposition,slds_arrowborder';

	fields_str.split(',').forEach(function (field, i, arr) {
		t_zeroGallery__renderViewOneField(el, recid, field);
	});
}

function t_zeroGallery__getArrowSize(value) {
	var size = {
		's': 30,
		'm': 40,
		'l': 45,
		'xl': 50,
	};

	return size[value];
}

function t_zeroGallery__renderViewOneField(el, recid, field) {
	var value = t396_elem__getFieldValue(el, field);

	if (typeof value == 'undefined') value = '';

	if (field == 'slds_imgposition') {
		if (value == '') value = 'center center';
		el.find('.tn-elem__gallery__position-styles').remove();
		// prettier-ignore
		el.find('.t-slds__container').append('\
			<style class="tn-elem__gallery__position-styles">\
				#rec' + recid + ' .tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .tn-atom__slds-img {\
					background-position: ' + value + ';\
				}\
			</style>\
		');
	}
	if (field == 'slds_stretch') {
		if (value == '') value = 'cover';
		el.find('.tn-elem__gallery__stretch-styles').remove();
		// prettier-ignore
		el.find('.t-slds__container').append('\
			<style class="tn-elem__gallery__stretch-styles">\
				#rec' + recid + ' .tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .tn-atom__slds-img {\
					background-size: ' + value + ';\
				}\
			</style>\
		');
		if (value == '') {
			el.find('.tn-atom').css('border-width', '');
		} else {
			el.find('.tn-atom').css('border-width', parseInt(value) + 'px');
		}
	}
	if (field == 'slds_cursorcontrol') {
		if (value == '') value = 'none';
		el.removeClass('tn-elem__gallery_arrows-cursor');
		if (value == 'on') el.addClass('tn-elem__gallery_arrows-cursor');
	}
	if (field == 'slds_arrowcontrols') {
		if (value == '') value = 'near';
		el.removeClass(
			'tn-elem__gallery_arrows-in tn-elem__gallery_arrows-near tn-elem__gallery_arrows-none tn-elem__gallery_arrows-above tn-elem__gallery_arrows-under',
		);
		el.addClass('tn-elem__gallery_arrows-' + value);
		if (value == 'above' || value == 'under') {
			var arrowsize = t396_elem__getFieldValue(el, 'slds_arrowsize');
			var arrowoffset = t396_elem__getFieldValue(el, 'slds_arrowbetweenmargin');
			if (arrowoffset == '' || typeof arrowoffset == 'undefined') arrowoffset = '10';
			if (arrowsize == '' || typeof arrowsize == 'undefined') arrowsize = 's';
			arrowsize = t_zeroGallery__getArrowSize(arrowsize);
			el.find('.t-slds__arrow_container').css('width', arrowsize * 2 + parseInt(arrowoffset));
		} else {
			el.find('.t-slds__arrow_container').css('width', '100%');
			t396_elem__renderViewOneField(el, 'borderwidth');
		}
		t_zeroGallery__renderViewOneField(el, 'slds_arrowhmargin');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowvmargin');
		if (value == 'under') t_zeroGallery__renderViewOneField(el, 'slds_captiontopmargin');
	}

	if (field == 'slds_dotshmargin') {
		if (value == '') value = '20';
		el.find('.tn-elem__gallery__bullet-hmargin-styles').remove();
		el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__bullet-hmargin-styles">\
				#rec' +
				recid +
				' .tn-elem[data-elem-id="' +
				el.attr('data-elem-id') +
				'"] .t-slds__bullet {\
					margin: 10px ' +
				value / 2 +
				'px;\
				}\
			</style>\
		',
		);
	}

	if (field == 'slds_dotscontrols') {
		if (value == '') value = 'none';
		el.find('.t-slds__bullet_wrapper').css('display', 'block');
		var dotsSize = parseInt(t396_elem__getFieldValue(el, 'slds_dotssize'));
		if (value == 'near') {
			el.find('.t-slds__bullet_wrapper').css('bottom', -20 - dotsSize + 'px');
		} else if (value == 'in') {
			el.find('.t-slds__bullet_wrapper').css('bottom', '0');
		} else if (value == 'none') {
			el.find('.t-slds__bullet_wrapper').css('display', 'none');
		}
		t_zeroGallery__renderViewOneField(el, 'slds_dotsvmargin');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowvmargin');
	}
	if (field == 'slds_playiconsize') {
		if (value == '') value = '70';
		el.find('.tn-elem__gallery__icon-size-styles').remove();
		// prettier-ignore
		el.find('.t-slds__container').append('\
			<style class="tn-elem__gallery__icon-size-styles">\
				#rec' + recid + ' .tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .tn-elem__gallery__play {\
					width: ' + parseInt(value) + 'px;\
					height: ' + parseInt(value) + 'px;\
					left: calc(50% - ' + parseInt(value) / 2 + 'px);\
					top: calc(50% - ' + parseInt(value) / 2 + 'px);\
				}\
			</style>\
		');
	}
	if (field == 'slds_playiconcolor') {
		if (value == '') value = '#fff';
		el.find('.tn-elem__gallery__icon-color-styles').remove();
		// prettier-ignore
		el.find('.t-slds__container').append('\
			<style class="tn-elem__gallery__icon-color-styles">\
				#rec' + recid + ' .tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .tn-elem__gallery__play_icon__color-holder {\
					fill: ' + value + '\
				}\
			</style>\
		');
	}
	if (field == 'slds_arrowtype') {
		if (value == '') value = '1';
		el.find('.t-null__slds-arrow').css('display', 'none');
		el.find('.t-null__slds-arrow_' + value).css('display', 'block');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowsize');
	}
	if (field == 'slds_arrowborder') {
		if (value == '') value = 'none';
		el.find('.tn-elem__gallery__arrow-border-styles').remove();
		if (value != 'none') {
			var size = t396_elem__getFieldValue(el, 'slds_arrowlinesize') || '1';
			var color = t396_elem__getFieldValue(el, 'slds_arrowcolor') || '#222';
			var hoverColor = t396_elem__getFieldValue(el, 'slds_arrowcolorhover') || color;
			// prettier-ignore
			el.find('.t-slds__container').append('\
				<style class="tn-elem__gallery__arrow-border-styles">\
					.tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .t-slds__arrow_body:before {\
						border: ' + size + 'px solid ' + color + ';\
					}\
					.tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .t-slds__arrow_body:hover:before {\
						border: ' + size + 'px solid ' + hoverColor + ';\
					}\
				</style>\
			');
		}
	}
	if (field == 'slds_arrowsize') {
		if (value == '') value = 's';
		value = t_zeroGallery__getArrowSize(value);
		el.find('.t-slds__arrow_body').attr('style', 'width: ' + parseInt(value) + 'px !important;');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowbgcolor');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowbetweenmargin');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowvmargin');
	}
	if (field == 'slds_arrowlinesize') {
		if (value == '') value = '1';
		el.find('.t-slds__arrow_body polyline, .t-slds__arrow_body path').css('stroke-width', parseInt(value) + 'px');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowborder');
	}
	if (field == 'slds_arrowcolor') {
		if (value == '') value = '#222';
		el.find('.t-slds__arrow_container polyline, .t-slds__arrow_container path').css('stroke', value);
		t_zeroGallery__renderViewOneField(el, 'slds_arrowborder');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowcolorhover');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowbgcolor');
	}
	if (field == 'slds_dotsbgcolor') {
		if (value == '') value = '#fff';

		if (/gradient/gim.test(value)) {
			el.find('.t-slds__bullet_body').css({
				'background-color': 'transparent',
				'background-image': value,
			});
		} else {
			el.find('.t-slds__bullet_body').css({
				'background-color': value,
				'background-image': '',
			});
		}
	}
	if (field == 'slds_dotsbgcoloractive') {
		if (value == '') value = '#222';
		el.find('.t-slds__bullet_wrapper style').remove();
		el.find('.t-slds__bullet_wrapper').append(
			'\
			<style>\
				#rec' +
				recid +
				' .tn-elem[data-elem-id="' +
				el.attr('data-elem-id') +
				'"] .t-slds__bullet_active .t-slds__bullet_body{\
					background-color: ' +
				value +
				' !important;\
				}\
			</style>\
		',
		);

		if (/gradient/gim.test(value)) {
			el.find('.t-slds__bullet_wrapper').append(
				'\
        <style>\
					#rec' +
					recid +
					' .tn-elem[data-elem-id="' +
					el.attr('data-elem-id') +
					'"] .t-slds__bullet_active .t-slds__bullet_body{\
            background-image: ' +
					value +
					' !important;\
          }\
        </style>\
      ',
			);
		} else {
			el.find('.t-slds__bullet_wrapper').append(
				'\
        <style>\
					#rec' +
					recid +
					' .tn-elem[data-elem-id="' +
					el.attr('data-elem-id') +
					'"] .t-slds__bullet_active .t-slds__bullet_body{\
            background-color: ' +
					value +
					' !important;\
          }\
        </style>\
      ',
			);
		}
	}
	if (field == 'slds_autoplay') {
		if (value == '') value = '0';
		el.find('.t-slds__items-wrapper').attr('data-slider-timeout', parseFloat(value) * 1000);
		setTimeout(function () {
			t_slideMove(el);
		});
	}
	if (field == 'slds_arrowbgcolor') {
		var arrowsize = t396_elem__getFieldValue(el, 'slds_arrowsize');
		var bgSize = t_zeroGallery__getArrowSize(arrowsize);
		var arrowbgopacity = t396_elem__getFieldValue(el, 'slds_arrowbgopacity');
		if (value == '') {
			el.find('.t-slds__arrow').css({
				width: bgSize,
				height: bgSize,
				'background-color': 'transparent',
			});
		} else {
			if (/gradient/gim.test(value)) {
				el.find('.t-slds__arrow').css({
					width: bgSize,
					height: bgSize,
					'background-color': 'transparent',
					'background-image': value,
				});
			} else {
				el.find('.t-slds__arrow').css({
					width: bgSize,
					height: bgSize,
					'background-color': arrowbgopacity ? 'rgba(' + t396_hex2rgba(value, arrowbgopacity) + ')' : value,
					'background-image': '',
				});
			}
		}
		t_zeroGallery__renderViewOneField(el, 'slds_arrowbgcolorhover');
	}
	if (field == 'slds_arrowbgopacity') {
		t_zeroGallery__renderViewOneField(el, 'slds_arrowbgcolor');
	}
	if (field == 'slds_arrowalign') {
		if (value == '') value = 'center';
		el.find('.t-slds__arrow_container').removeClass(
			't-slds__arrow_container-left t-slds__arrow_container-center t-slds__arrow_container-right',
		);
		el.find('.t-slds__arrow_container').addClass('t-slds__arrow_container-' + value);
	}
	if (field == 'slds_dotssize') {
		if (value == '') value = '10';
		el.find('.t-slds__bullet_body').css({
			width: value + 'px',
			height: value + 'px',
		});
		t_zeroGallery__renderViewOneField(el, 'slds_dotscontrols');
	}
	if (field == 'slds_loop') {
		if (value == '') value = 'loop';
		if (value == 'none') {
			el.find('.t-slds__items-wrapper').attr('data-slider-with-cycle', 'false');
			el.find('.t-slds__arrow_container').addClass('t-slds__nocycle');
		} else if (value == 'loop') {
			el.find('.t-slds__items-wrapper').attr('data-slider-with-cycle', 'true');
			el.find('.t-slds__arrow_container').removeClass('t-slds__nocycle');
		}
	}
	if (field == 'slds_speed') {
		if (value == '') value = 'none';
		if (value == 'none') {
			el.find('.t-slds__items-wrapper').attr('data-slider-transition', '');
			el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-slow');
			el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-fast');
			el.find('.t-slds__items-wrapper').addClass('t-slds_animated-none');
		} else if (value == 'slow') {
			el.find('.t-slds__items-wrapper').attr('data-slider-transition', '500');
			el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-fast');
			el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-none');
			el.find('.t-slds__items-wrapper').addClass('t-slds_animated-slow');
		} else if (value == 'fast') {
			el.find('.t-slds__items-wrapper').attr('data-slider-transition', '300');
			el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-slow');
			el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-none');
			el.find('.t-slds__items-wrapper').addClass('t-slds_animated-fast');
		}
	}
	if (field == 'slds_arrowcolorhover') {
		t_zeroGallery__renderViewOneField(el, 'slds_arrowborder');
		el.find('.t-slds__arrow').hover(
			function () {
				if (value == '') value = t396_elem__getFieldValue(el, 'slds_arrowcolorhover');
				if (value == '') value = t396_elem__getFieldValue(el, 'slds_arrowcolor');
				if (value == '' || typeof value == 'undefined') value = '#222';
				$(this).find('polyline, path').css('stroke', value);
			},
			function () {
				var colorpre = t396_elem__getFieldValue(el, 'slds_arrowcolor');
				if (colorpre == '') colorpre = '#222';
				$(this).find('polyline, path').css('stroke', colorpre);
			},
		);
	}
	if (field == 'slds_arrowbgcolorhover') {
		el.find('.t-slds__arrow').hover(
			function () {
				var arrowbgopacity = t396_elem__getFieldValue(el, 'slds_arrowbgopacityhover');
				var color;

				if (arrowbgopacity == '' || typeof arrowbgopacity == 'undefined') arrowbgopacity = '1.0';
				if (value == '') value = t396_elem__getFieldValue(el, 'slds_arrowbgcolor');
				if (value == '' || typeof value == 'undefined') value = 'transparent';
				if (/gradient/gim.test(value)) {
					$(this).css({
						'background-color': 'transparent',
						'background-image': value,
					});
				} else {
					color = value != 'transparent' ? 'rgba(' + t396_hex2rgba(value, arrowbgopacity) + ')' : value;
					$(this).css({
						'background-color': color,
						'background-image': '',
					});
				}
			},
			function () {
				var colorpre = t396_elem__getFieldValue(el, 'slds_arrowbgcolor');
				var arrowbgopacity;

				if (colorpre == '' || typeof colorpre == 'undefined') colorpre = 'transparent';

				if (/gradient/gim.test(colorpre)) {
					$(this).css({
						'background-color': 'transparent',
						'background-image': colorpre,
					});
				} else {
					if (colorpre !== 'transparent') {
						arrowbgopacity = t396_elem__getFieldValue(el, 'slds_arrowbgopacity');
						if (arrowbgopacity == '' || typeof arrowbgopacity == 'undefined') arrowbgopacity = '1.0';
						colorpre = 'rgba(' + t396_hex2rgba(colorpre, arrowbgopacity) + ')';
					}
					$(this).css({
						'background-color': colorpre,
						'background-image': '',
					});
				}
			},
		);
	}
	if (field == 'slds_dotsvmargin') {
		if (value == '') value = '16';
		var dotsControls = t396_elem__getFieldValue(el, 'slds_dotscontrols');
		if (dotsControls === 'near') {
			el.find('.t-slds__bullet_wrapper').css('margin-bottom', -value + 'px');
			el.find('.t-slds__bullet_wrapper').css('padding-bottom', 0);
		} else {
			el.find('.t-slds__bullet_wrapper').css('padding-bottom', value + 'px');
			el.find('.t-slds__bullet_wrapper').css('margin-bottom', 0);
		}
		t_zeroGallery__renderViewOneField(el, 'slds_captiontopmargin');
		t_zeroGallery__renderViewOneField(el, 'slds_arrowvmargin');
	}
	if (field == 'slds_captiontopmargin') {
		if (value == '') value = '20';
		var dotsControls = t396_elem__getFieldValue(el, 'slds_dotscontrols');
		var arrowControls = t396_elem__getFieldValue(el, 'slds_arrowcontrols');
		var topOffset = 0;
		if (dotsControls === 'near') {
			var dotsMargin = t396_elem__getFieldValue(el, 'slds_dotsvmargin');
			var dotsSize = t396_elem__getFieldValue(el, 'slds_dotssize');
			if (dotsMargin == '' || typeof dotsMargin == 'undefined') dotsMargin = '16';
			if (dotsSize == '' || typeof dotsSize == 'undefined') dotsSize = '10';
			topOffset = 20 + parseInt(dotsSize) + parseInt(dotsMargin);
		}
		if (arrowControls === 'under') {
			var arrowsize = t396_elem__getFieldValue(el, 'slds_arrowsize');
			var arrowoffset = t396_elem__getFieldValue(el, 'slds_arrowvmargin');
			if (arrowoffset == '' || typeof arrowoffset == 'undefined') arrowoffset = '10';
			if (arrowsize == '' || typeof arrowsize == 'undefined') arrowsize = 's';
			arrowsize = t_zeroGallery__getArrowSize(arrowsize);
			topOffset = topOffset + parseInt(arrowsize) + parseInt(arrowoffset);
		}
		el.find('.tn-elem__gallery__caption-position-styles').remove();
		// prettier-ignore
		el.find('.t-slds__container').append('\
			<style class="tn-elem__gallery__caption-position-styles">\
				#rec' + recid + ' .tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .t-slds__caption {\
					margin-top: ' + (topOffset + parseInt(value)) + 'px\
				}\
			</style>\
		');
	}
	if (field == 'slds_captionwidth') {
		if (value == '') value = '80';
		el.find('.tn-elem__gallery__caption-width-styles').remove();
		// prettier-ignore
		el.find('.t-slds__container').append('\
			<style class="tn-elem__gallery__caption-width-styles">\
				#rec' + recid + ' .tn-elem[data-elem-id="' + el.attr('data-elem-id') + '"] .t-slds__caption {\
					width: ' + parseInt(value) + '%\
				}\
			</style>\
		');
	}
	if (field == 'slds_arrowhmargin') {
		if (value == '') value = '30';
		var arrowControls = t396_elem__getFieldValue(el, 'slds_arrowcontrols');
		if (arrowControls === 'near') {
			el.find('.t-slds__arrow-right').css('left', value + 'px');
			el.find('.t-slds__arrow-right').css('right', 'auto');
			el.find('.t-slds__arrow-left').css('right', value + 'px');
			el.find('.t-slds__arrow-left').css('left', 'auto');
		} else {
			el.find('.t-slds__arrow-right').css('right', value + 'px');
			el.find('.t-slds__arrow-right').css('left', 'auto');
			el.find('.t-slds__arrow-left').css('left', value + 'px');
			el.find('.t-slds__arrow-left').css('right', 'auto');
		}
	}
	if (field == 'slds_arrowvmargin') {
		if (value == '') value = '10';
		var arrowControls = t396_elem__getFieldValue(el, 'slds_arrowcontrols');
		var css = {};
		if (arrowControls === 'above') {
			css.top = 0 - value + 'px';
			css.bottom = 'auto';
			el.find('.t-slds__arrow').css('margin-top', '0');
		} else if (arrowControls === 'under') {
			var dotsControls = t396_elem__getFieldValue(el, 'slds_dotscontrols');
			var dotsWrapperHeight = 0;
			if (dotsControls === 'near') {
				var dotsMargin = t396_elem__getFieldValue(el, 'slds_dotsvmargin');
				var dotsSize = t396_elem__getFieldValue(el, 'slds_dotssize');
				dotsWrapperHeight = 20 + parseInt(dotsSize) + parseInt(dotsMargin);
			}
			value = parseInt(value) + dotsWrapperHeight;
			css.bottom = 0 - value + 'px';
			css.top = 'auto';
			el.find('.t-slds__arrow').css('margin-top', '0');
		} else {
			css.top = '';
			css.bottom = '';
		}
		el.find('.t-slds__arrow_container').css(css);
		t_zeroGallery__renderViewOneField(el, 'slds_captiontopmargin');
	}

	if (field == 'slds_arrowbetweenmargin') {
		if (value == '' || typeof value == 'undefined') value = '10';
		var arrowControls = t396_elem__getFieldValue(el, 'slds_arrowcontrols');
		if (arrowControls === 'above' || arrowControls === 'under') {
			el.find('.t-slds__arrow-right').css('margin-left', value / 2);
			el.find('.t-slds__arrow-left').css('margin-right', value / 2);
			t_zeroGallery__renderViewOneField(el, 'slds_arrowcontrols');
		}
	}
}

window.tilda_zero_gallery_js_ver = 1;
