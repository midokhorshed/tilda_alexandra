function elem__renderView($el) {
	tn_console('func: elem__renderView');
	var fields = $el.attr('data-fields');
	if (fields) {
		fields = fields.split(',');
	} else {
		fields = [];
	}

	var eltype = $el.attr('data-elem-type');

	/* set to element value of every field  via css */
	fields.forEach(function (field) {
		elem__renderViewOneField($el, field, eltype);
	});

	$el.isSnap = false;
	tn_console_runtime();
}

function elem__renderViewOneField($el, field, eltype) {
	/* console.log('func: elem__renderViewOneField'); */
	var value = elem__getFieldValue($el, field);
	var $atom = $el.find('.tn-atom');
	var minMaxPoints;
	var isGroupCreated;
	var bgimg;
	var gradient;

	if (typeof eltype == 'undefined') {
		eltype = $el.attr('data-elem-type');
	}

	if (field == 'left') {
		var groupid = elem__getFieldValue($el, 'groupid');
		isGroupCreated = $('#' + groupid).length;

		if (isGroupCreated) {
			minMaxPoints = window.tn.groupsBounds ? window.tn.groupsBounds[groupid] : false;
			group__setPositionByElemsAttrs(groupid, minMaxPoints, true);
		} else {
			value = elem__convertPosition__Local__toAbsolute($el, field, value);
			$el.css('left', parseFloat(value) + 'px');
		}
	}

	if (field == 'top') {
		var groupid = elem__getFieldValue($el, 'groupid');
		isGroupCreated = $('#' + groupid).length;

		if (isGroupCreated) {
			minMaxPoints = window.tn.groupsBounds ? window.tn.groupsBounds[groupid] : false;
			group__setPositionByElemsAttrs(groupid, minMaxPoints, true);
		} else {
			value = elem__convertPosition__Local__toAbsolute($el, field, value);
			$el.css('top', parseFloat(value) + 'px');
		}
	}

	if (field == 'width') {
		value = elem__getWidth($el, value);
		$el.css('width', parseInt(value) + 'px');

		if (eltype == 'tooltip') {
			$el.css('height', parseInt(value) + 'px');
		}
		if (eltype == 'gallery') {
			var borderWidth = elem__getFieldValue($el, 'borderwidth');
			var borderStyle = elem__getFieldValue($el, 'borderstyle');
			if (borderStyle == 'none' || borderWidth == '') borderWidth = 0;
			value = value - 2 * parseInt(borderWidth);
			value = parseFloat(value).toFixed(1);
			$el.css('width', value + 'px');
			$el.find('.t-slds__main').css('width', value + 'px');
			$el.find('.tn-atom__slds-img').css('width', value + 'px');
		}
	}

	if (field == 'height') {
		value = elem__getHeight($el, value);
		if (value == 0) value = 1;
		$el.css('height', parseInt(value) + 'px');

		if (eltype === 'gallery') {
			var borderWidth = elem__getFieldValue($el, 'borderwidth');
			var borderStyle = elem__getFieldValue($el, 'borderstyle');
			if (borderStyle == 'none' || borderWidth == '') borderWidth = 0;
			value = value - 2 * parseInt(borderWidth);
			value = parseFloat(value).toFixed(1);
			$el.css('height', value + 'px');
			$el.find('.tn-atom__slds-img').css('height', value + 'px');
			$el.find('.t-slds__main').css('height', value + 'px');
		}
	}

	if (field == 'color') {
		if (value == '' && eltype == 'button') {
			value = 'transparent';
		}

		if (eltype === 'text') {
			value = tn_replaceSingleQuotes(value);

			if (tn_isGradientJSON(value)) {
				gradient = tn_parseGradientFromJSON(value);

				$el.find('.tn-atom').css({
					'color': 'transparent',
					'background-image': gradient,
					'-webkit-background-clip': 'text',
					'caret-color': '#000',
				});
				if (isSafari) {
					$el.find('.tn-atom').css({
						'display': 'inline-block',
						'-webkit-box-decoration-break': 'clone',
					});
				}
			} else {
				$el.find('.tn-atom').css('color', value);
				if (isSafari) {
					$el.find('.tn-atom').css({
						'display': '',
						'-webkit-box-decoration-break': '',
					});
				}
			}
		} else {
			$el.find('.tn-atom').css('color', value);
		}

		if (eltype == 'tooltip') {
			$el.css('color', value);
		}
		if (eltype == 'button') {
			elem__renderViewOneField($el, 'colorhover');
		}
	}

	if (field == 'align') $el.css('text-align', value);
	if (field == 'fontfamily') $el.css('font-family', '"' + value + '"');
	if (field == 'fontsize') elem__setLineHeightFontSize($el, value, 'fontsize');
	if (field == 'lineheight') elem__setLineHeightFontSize($el, value, 'lineheight');
	if (field == 'letterspacing') $el.css('letter-spacing', parseFloat(value, 10) + 'px');
	if (field == 'lettercase') $el.css('text-transform', value || '');
	if (field == 'zindex') $el.css('z-index', parseInt(value, 10));
	if (field == 'fontweight') $el.css('font-weight', parseInt(value, 10));
	if (field == 'variationweight') $el.css('font-weight', parseInt(value, 10));

	if (field == 'bgcolor' && eltype !== 'text') {
		if (value == '') value = 'transparent';

		bgimg = elem__getFieldValue($el, 'bgimg');
		value = tn_replaceSingleQuotes(value);

		if (tn_isGradientStyle(value)) {
			value = tn_parseJSONfromGradient(value);
		}

		if (tn_isGradientJSON(value)) {
			value = tn_parseGradientFromJSON(value);

			if (bgimg) {
				bgimg = 'url(' + bgimg + '), ' + value;
			} else {
				bgimg = value;
			}

			$atom.css({
				'background-image': bgimg,
				'background-color': 'transparent',
			});
		} else {
			$atom.css('background-color', value);
			var cachedBG = $atom.css('background-image');
			if (cachedBG && cachedBG.indexOf('url(') === -1 && cachedBG.indexOf('-gradient(') !== -1) {
				$atom.css('background-image', '');
			}
			if (bgimg) $atom.css('background-image', 'url(' + bgimg + ')');
		}

		if (eltype == 'button') {
			elem__renderViewOneField($el, 'bgcolorhover');
		}
	}

	if (field == 'bgattachment') {
		var res = window.tn.curResolution;
		if (res <= 960) value = 'scroll';
		$el.find('.tn-atom').css('background-attachment', value);
	}

	if (field === 'bgposition' && value !== 'custom') {
		$el.find('.tn-atom').css('background-position', value);
	} else if (field === 'bgposition' && value === 'custom') {
		$el.find('.tn-atom').css('background-position', '');
	}

	if (field === 'bgposition_imgpos' && value) {
		var positions = value.split(',');
		$el.find('.tn-atom').css('background-position-y', positions[0]);
		$el.find('.tn-atom').css('background-position-x', positions[1]);
	}

	if (field === 'bgposition_imgsize' && value) {
		var size = value.split(',').join(' ');
		$el.find('.tn-atom').css('background-size', size);
	} else if (field === 'bgposition_imgsize' && !value) {
		$el.find('.tn-atom').css('background-size', 'cover');
	}

	if (field === 'bgposition_imgsize' && value) {
		var size = value.split(',').join(' ');
		$el.find('.tn-atom').css('background-size', size);
	} else if (field === 'bgposition_imgsize' && !value) {
		$el.find('.tn-atom').css('background-size', 'cover');
	}

	if (field == 'borderwidth') {
		if (value != '') value = parseInt(value) + 'px';
		if (eltype == 'gallery') {
			$el.find('.t-slds__main').css('border-width', value);
			var borderStyle = elem__getFieldValue($el, 'borderstyle');
			var arrowControls = elem__getFieldValue($el, 'slds_arrowcontrols');
			if (arrowControls == 'near' || arrowControls == 'in') {
				if (borderStyle != 'none') {
					$el.find('.t-slds__arrow').css('margin-top', value);
				} else {
					$el.find('.t-slds__arrow').css('margin-top', '');
				}
			}
			elem__renderViewOneField($el, 'width');
			elem__renderViewOneField($el, 'height');
		} else {
			$el.find('.tn-atom').css('border-width', value);
		}
	}

	if (field == 'borderradius') {
		if (value != '') value = parseInt(value, 10) + 'px';

		if (eltype == 'gallery') {
			$el.find('.t-slds__main').css('border-radius', value);
		} else {
			$el.find('img').css('border-radius', value);
			$el.find('.tn-atom').css('border-radius', value);
			if (eltype == 'shape' || eltype == 'image' || eltype == 'button') {
				$el.css('border-radius', value);
			}
		}

		if (tn_shapeBorderRadius__shouldShowHandle($el[0])) {
			if ($el.find('.border-radius-handle').length) {
				tn_shapeBorderRadius__setHandlePosition($el[0]);
			} else {
				tn_shapeBorderRadius__initHandle($el[0]);
			}
		}
	}

	if (field == 'bordercolor') {
		if (value == '') value = 'transparent';
		$el.find('.tn-atom').css('border-color', value);
		$el.find('.t-slds__main').css('border-color', value);

		if (eltype == 'button') {
			elem__renderViewOneField($el, 'bordercolorhover');
		}
	}
	if (field == 'borderstyle') {
		if (value == '') value = 'solid';
		if (eltype == 'gallery') {
			$el.find('.t-slds__main').css('border-style', value);
			elem__renderViewOneField($el, 'borderwidth');
		} else {
			$el.find('.tn-atom').css('border-style', value);
		}
	}

	if (field == 'container') {
		elem__renderViewOneField($el, 'left');
		elem__renderViewOneField($el, 'top');
	}

	if (field == 'opacity') {
		$el.find('.tn-atom').css('opacity', parseFloat(value, 10));
	}

	if (field == 'rotate') {
		var $e = $el.find('.tn-atom');
		$e.css({'WebkitTransform': 'rotate(' + parseInt(value, 10) + 'deg)'});
		$e.css({'-moz-transform': 'rotate(' + parseInt(value, 10) + 'deg)'});
	}

	if (field == 'img') {
		$el.find('.tn-atom__img').attr('src', value);
	}

	if (field == 'bgimg') {
		if (typeof value == 'undefined') value = '';

		gradient = elem__getFieldValue($el, 'bgcolor');
		gradient = tn_replaceSingleQuotes(gradient);
		var hasGradient = tn_isGradientJSON(gradient);

		if (value) {
			bgimg = 'url(' + value + ')';
			if (hasGradient) bgimg += ', ' + tn_parseGradientFromJSON(gradient);

			$atom.css({
				'background-image': bgimg,
				'background-size': 'cover',
				'background-repeat': 'no-repeat',
			});
		} else {
			$atom.css('background-image', hasGradient ? tn_parseGradientFromJSON(gradient) : '');
		}
	}

	if (field == 'tipimg') {
		if (typeof value == 'undefined') value = '';
		$el.find('.tn-atom__tip-img').remove();
		if (value != '') {
			$el.find('.tn-atom__tip').prepend('<img src="" class="tn-atom__tip-img">');
			$el.find('.tn-atom__tip-img').attr('src', value);
		}
	}

	if (field == 'alt') {
		$el.find('.tn-atom__img').attr('alt', value);
	}

	if (
		field == 'shadowcolor' ||
		field == 'shadowopacity' ||
		field == 'shadowx' ||
		field == 'shadowy' ||
		field == 'shadowblur' ||
		field == 'shadowspread'
	) {
		var s_c = elem__getFieldValue($el, 'shadowcolor');
		var s_o = parseFloat(elem__getFieldValue($el, 'shadowopacity'));
		var s_x = parseInt(elem__getFieldValue($el, 'shadowx'), 10);
		var s_y = parseInt(elem__getFieldValue($el, 'shadowy'), 10);
		var s_b = parseInt(elem__getFieldValue($el, 'shadowblur'), 10);
		var s_s = parseInt(elem__getFieldValue($el, 'shadowspread'), 10);
		if (isNaN(s_o)) s_o = 1;
		if (isNaN(s_x)) s_x = 0;
		if (isNaN(s_y)) s_y = 0;
		if (isNaN(s_b)) s_b = 0;
		if (isNaN(s_s)) s_s = 0;

		if (s_o != 1 && typeof s_c != 'undefined' && s_c != '') {
			var s_rgb = tn_hex2rgb(s_c);
			s_c = 'rgba(' + s_rgb[0] + ',' + s_rgb[1] + ',' + s_rgb[2] + ',' + s_o + ')';
		}

		var selector = '.tn-atom';
		if (eltype == 'gallery') selector = '.t-slds__main';

		if (typeof s_c == 'undefined' || s_c == '') {
			$el.find(selector).css('box-shadow', 'none');
		} else {
			$el.find(selector).css('box-shadow', '' + s_x + 'px ' + s_y + 'px ' + s_b + 'px ' + s_s + 'px ' + s_c + '');
		}
	}

	// Effects
	if (field === 'effects') {
		if (!value) {
			$el.css({'filter': ''});
			$el.css({'backdrop-filter': ''});
			$el.css({'-webkit-backdrop-filter': ''});
			$el.css({'transform': ''});
		}

		var filterData = tn_parseCSSFilter(value);
		if (value && value.split(' ')[1]) {
			var filterValue = value.split(' ')[1].slice(0, -1);

			if (filterData.isBackdrop) {
				$el.css({'filter': ''});
				$el.css({'backdrop-filter': filterValue});
				$el.css({'-webkit-backdrop-filter': filterValue});
			} else {
				$el.css({'backdrop-filter': ''});
				$el.css({'-webkit-backdrop-filter': ''});
				$el.css({'filter': filterValue});
			}

			$el.css({'transform': 'translateZ(0)'});
		}
	}

	if (field == 'caption') {
		$el.find('.tn-atom').html(value);
	}

	if (field == 'classname') {
		$el.addClass(value);
	}

	if (field == 'youtubeid') {
		var vidtype = elem__getFieldValue($el, 'vidtype');
		if (vidtype == '' || vidtype == 'y') {
			var showinfo = elem__getFieldValue($el, 'showinfo');
			if (showinfo == 'y') {
				showinfo = 1;
			} else {
				showinfo = 0;
			}
			$el
				.find('.tn-atom')
				.html(
					'<div class="tn-atom__videoiframe" style="pointer-events:none; width:100%; height:100%;"><iframe id="youtubeiframe" width="100%" height="100%" src="//www.youtube.com/embed/' +
						value +
						'?rel=0&fmt=18&html5=1&showinfo=' +
						showinfo +
						'" frameborder="0" allowfullscreen></iframe></div>',
				);
		}
	}

	if (field == 'vimeoid') {
		var vidtype = elem__getFieldValue($el, 'vidtype');
		if (vidtype == 'v') {
			var showinfo = elem__getFieldValue($el, 'showinfo');
			$el
				.find('.tn-atom')
				.html(
					'<div class="tn-atom__videoiframe" style="pointer-events:none; width:100%; height:100%;"><iframe src="//player.vimeo.com/video/' +
						value +
						'?badge=0' +
						(showinfo == 'y' ? '&portrait=1&title=1&byline=1' : '&portrait=0&title=0&byline=0') +
						'&color=ffffff" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>',
				);
		}
	}

	if (field == 'mp4video') {
		var vidtype = elem__getFieldValue($el, 'vidtype');
		if (vidtype == 'html') {
			var mp4Source = elem__getFieldValue($el, 'mp4video');
			var video = $el.find('.tn-atom video');
			var isProcessSameVideo = false;
			if (video.length) {
				var mp4VideoSource = video.find('source[type="video/mp4"]').get(0);
				if ((mp4Source && mp4VideoSource && mp4VideoSource.src === mp4Source) || (!mp4VideoSource && !mp4Source)) {
					isProcessSameVideo = true;
				}
			}
			if (!isProcessSameVideo) {
				var source = '';
				if (mp4Source) source += '<source src="' + mp4Source + '" type="video/mp4">';
				var videoTag = '<video width="100%" style="display: none;" playsinline>' + source + '</video>';
				var loaderTag = source
					? '<img class="html-video-loader" style="display: block;" src="https://tilda.cc/tpl/img/ajax-loader.gif" style="">'
					: '';
				$el
					.find('.tn-atom')
					.html(
						'<div class="tn-atom__videoiframe" style="pointer-events:none; width:100%; height:100%; display: flex; align-items: center; justify-content: center">' +
							loaderTag +
							videoTag +
							'</div>',
					);
				video = $el.find('.tn-atom video');
				var loader = $el.find('.tn-atom .html-video-loader');
				video.on('canplay', function () {
					loader.css('display', 'none');
					video.css('display', 'block');
					var videoEl = video.get(0);
					if (videoEl) {
						var videoRatio = videoEl.videoWidth / videoEl.videoHeight;
						var currentWidth = elem__getFieldValue($el, 'width');
						var currentHeight = elem__getFieldValue($el, 'height');
						var updatedHeight = Math.floor(currentWidth / videoRatio);
						if (updatedHeight > currentHeight) {
							elem__setFieldValue($el, 'height', updatedHeight, 'render', 'updateui');
						}
						tn_setOutlinePosition('selected');
					}
				});
			}
		}
	}

	if (field == 'youtubeid' || field == 'vimeoid' || field == 'mp4video') {
		var foo = elem__getFieldValue($el, 'bgimg');
		if (foo != '') {
			$el
				.find('.tn-atom')
				.html(
					'<div class="tn-atom__video-play-link"><div class="tn-atom__video-play-icon"><svg width="70" height="70" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="30" fill="black"/><path d="M41 29.7495L24.0014 19.2495L24.0061 40.2493L41 29.7495Z" fill="white"/></svg></div></div>',
				);
		}
	}

	if (field == 'bgcolorhover') {
		$el.hover(
			function () {
				if (value == '') value = elem__getFieldValue($el, 'bgcolor');
				if (value == '' || typeof value == 'undefined') value = 'transparent';

				value = tn_replaceSingleQuotes(value);

				if (tn_isGradientJSON(value)) {
					$el.find('.tn-atom').css({
						'background-color': '',
						'background-image': tn_parseGradientFromJSON(value),
					});
				} else {
					$el.find('.tn-atom').css({
						'background-color': value,
						'background-image': '',
					});
				}
			},
			function () {
				var bgpre = elem__getFieldValue($el, 'bgcolor');

				bgpre = tn_replaceSingleQuotes(bgpre);

				if (tn_isGradientJSON(bgpre)) {
					$el.find('.tn-atom').css({
						'background-color': '',
						'background-image': tn_parseGradientFromJSON(bgpre),
					});
				} else {
					$el.find('.tn-atom').css({
						'background-color': bgpre,
						'background-image': '',
					});
				}
			},
		);
	}

	if (field == 'bordercolorhover') {
		$el.hover(
			function () {
				if (value == '') value = elem__getFieldValue($el, 'bordercolor');
				if (value == '' || typeof value == 'undefined') value = 'transparent';
				$el.find('.tn-atom').css('border-color', value);
			},
			function () {
				var colorpre = elem__getFieldValue($el, 'bordercolor');
				if (colorpre == '') colorpre = 'transparent';
				$el.find('.tn-atom').css('border-color', colorpre);
			},
		);
	}

	if (field == 'colorhover') {
		$el.hover(
			function () {
				if (value == '') value = elem__getFieldValue($el, 'color');
				if (value == '' || typeof value == 'undefined') value = 'transparent';
				$el.find('.tn-atom').css('color', value);
			},
			function () {
				var colorpre = elem__getFieldValue($el, 'color');
				if (colorpre == '') colorpre = 'transparent';
				$el.find('.tn-atom').css('color', colorpre);
			},
		);
	}

	if (field == 'speedhover') {
		if (value > -1) {
			setInterval(function () {
				$el.find('.tn-atom').css({
					transition:
						'background-color ' +
						parseFloat(value) +
						's ease-in-out, color ' +
						parseFloat(value) +
						's ease-in-out, border-color ' +
						parseFloat(value) +
						's ease-in-out',
				});
			}, 200);
		} else {
			$el.find('.tn-atom').css({transition: 'none'});
		}
	}

	if (field == 'slds_imgposition') {
		if (value == '') value = 'center center';
		$el.find('.tn-elem__gallery__position-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__position-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
				'"] .tn-atom__slds-img {\
					background-position: ' +
				value +
				';\
				}\
			</style>\
		',
		);
	}
	if (field == 'slds_stretch') {
		if (value == '') value = 'cover';
		$el.find('.tn-elem__gallery__stretch-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__stretch-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
				'"] .tn-atom__slds-img {\
					background-size: ' +
				value +
				';\
				}\
			</style>\
		',
		);
	}
	if (field == 'slds_cursorcontrol') {
		if (value == '') value = 'none';
		$el.removeClass('tn-elem__gallery_arrows-cursor');
		if (value == 'on') $el.addClass('tn-elem__gallery_arrows-cursor');
	}
	if (field == 'slds_arrowcontrols') {
		if (value == '') value = 'near';
		$el.removeClass(
			'tn-elem__gallery_arrows-in tn-elem__gallery_arrows-near tn-elem__gallery_arrows-none tn-elem__gallery_arrows-above tn-elem__gallery_arrows-under',
		);
		$el.addClass('tn-elem__gallery_arrows-' + value);
		if (value == 'above' || value == 'under') {
			var arrowsize = elem__getFieldValue($el, 'slds_arrowsize');
			var arrowoffset = elem__getFieldValue($el, 'slds_arrowbetweenmargin');
			if (arrowoffset == '') arrowoffset = '10';
			if (arrowsize == '') arrowsize = 's';
			arrowsize = t_zeroGallery__getArrowSize(arrowsize);
			$el.find('.t-slds__arrow_container').css('width', arrowsize * 2 + parseInt(arrowoffset));
		} else {
			$el.find('.t-slds__arrow_container').css('width', '100%');
			elem__renderViewOneField($el, 'borderwidth');
		}
		// ONLY FOR RENDER IN ZERO EDITOR: BEGIN
		$el.find('.t-slds__arrow_wrapper').css('width', '0');
		if (value == 'in') $el.find('.t-slds__arrow_wrapper').css('width', '0');
		// ONLY FOR RENDER IN ZERO EDITOR: END
		elem__renderViewOneField($el, 'slds_arrowhmargin');
		elem__renderViewOneField($el, 'slds_arrowvmargin');
		if (value == 'under') elem__renderViewOneField($el, 'slds_captiontopmargin');
	}

	if (field == 'slds_dotshmargin') {
		if (value == '') value = '20';
		$el.find('.tn-elem__gallery__bullet-hmargin-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__bullet-hmargin-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
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
		$el.find('.t-slds__bullet_wrapper').css('display', 'block');
		var dotsSize = parseInt(elem__getFieldValue($el, 'slds_dotssize'));
		if (value == 'near') {
			$el.find('.t-slds__bullet_wrapper').css('bottom', -20 - dotsSize + 'px');
		} else if (value == 'in') {
			$el.find('.t-slds__bullet_wrapper').css('bottom', '0');
		} else if (value == 'none') {
			$el.find('.t-slds__bullet_wrapper').css('display', 'none');
		}
		elem__renderViewOneField($el, 'slds_dotsvmargin');
		elem__renderViewOneField($el, 'slds_arrowvmargin');
	}
	if (field == 'slds_playiconsize') {
		if (value == '') value = '70';
		$el.find('.tn-elem__gallery__icon-size-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__icon-size-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
				'"] .tn-elem__gallery__play {\
					width: ' +
				parseInt(value) +
				'px;\
					height: ' +
				parseInt(value) +
				'px;\
					left: calc(50% - ' +
				parseInt(value) / 2 +
				'px);\
					top: calc(50% - ' +
				parseInt(value) / 2 +
				'px);\
				}\
			</style>\
		',
		);
	}
	if (field == 'slds_playiconcolor') {
		if (value == '') value = '#fff';
		$el.find('.tn-elem__gallery__icon-color-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__icon-color-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
				'"] .tn-elem__gallery__play_icon__color-holder {\
					fill: ' +
				value +
				'\
				}\
			</style>\
		',
		);
	}
	if (field == 'slds_arrowtype') {
		if (value == '') value = '1';
		$el.find('.t-null__slds-arrow').css('display', 'none');
		$el.find('.t-null__slds-arrow_' + value).css('display', 'block');
		elem__renderViewOneField($el, 'slds_arrowsize');
	}
	if (field == 'slds_arrowborder') {
		if (value == '') value = 'none';
		$el.find('.tn-elem__gallery__arrow-border-styles').remove();
		if (value != 'none') {
			var size = elem__getFieldValue($el, 'slds_arrowlinesize') || '1';
			var color = elem__getFieldValue($el, 'slds_arrowcolor') || '#222';
			var hoverColor = elem__getFieldValue($el, 'slds_arrowcolorhover') || color;
			$el.find('.t-slds__container').append(
				'\
				<style class="tn-elem__gallery__arrow-border-styles">\
					.tn-elem[data-elem-id="' +
					$el.attr('data-elem-id') +
					'"] .t-slds__arrow_body:before {\
						border: ' +
					size +
					'px solid ' +
					color +
					';\
					}\
					.tn-elem[data-elem-id="' +
					$el.attr('data-elem-id') +
					'"] .t-slds__arrow_body:hover:before {\
						border: ' +
					size +
					'px solid ' +
					hoverColor +
					';\
					}\
				</style>\
			',
			);
		}
	}
	if (field == 'slds_arrowsize') {
		if (value == '') value = 's';
		value = t_zeroGallery__getArrowSize(value);
		$el.find('.t-slds__arrow_body').attr('style', 'width: ' + parseInt(value) + 'px !important;');
		elem__renderViewOneField($el, 'slds_arrowbgcolor');
		elem__renderViewOneField($el, 'slds_arrowbetweenmargin');
		elem__renderViewOneField($el, 'slds_arrowvmargin');
	}
	if (field == 'slds_arrowlinesize') {
		if (value == '') value = '1';
		$el.find('.t-slds__arrow_body polyline, .t-slds__arrow_body path').css('stroke-width', parseInt(value) + 'px');
		elem__renderViewOneField($el, 'slds_arrowborder');
	}
	if (field == 'slds_arrowcolor') {
		if (value == '') value = '#222';
		$el.find('.t-slds__arrow_container polyline, .t-slds__arrow_container path').css('stroke', value);
		elem__renderViewOneField($el, 'slds_arrowborder');
		elem__renderViewOneField($el, 'slds_arrowcolorhover');
		elem__renderViewOneField($el, 'slds_arrowbgcolor');
	}
	if (field == 'slds_dotsbgcolor') {
		if (value == '') value = '#fff';

		value = tn_replaceSingleQuotes(value);

		if (tn_isGradientJSON(value)) {
			$el.find('.t-slds__bullet_body').css({
				'background-color': 'transparent',
				'background-image': tn_parseGradientFromJSON(value),
			});
		} else {
			$el.find('.t-slds__bullet_body').css({
				'background-color': value,
				'background-image': '',
			});
		}
	}
	if (field == 'slds_dotsbgcoloractive') {
		if (value == '') value = '#222';

		$el.find('.t-slds__bullet_wrapper style').remove();

		value = tn_replaceSingleQuotes(value);

		if (tn_isGradientJSON(value)) {
			$el.find('.t-slds__bullet_wrapper').append(
				'\
        <style>\
          .t-slds__bullet_active .t-slds__bullet_body{\
            background-image: ' +
					tn_parseGradientFromJSON(value) +
					' !important;\
          }\
        </style>\
      ',
			);
		} else {
			$el.find('.t-slds__bullet_wrapper').append(
				'\
        <style>\
          .t-slds__bullet_active .t-slds__bullet_body{\
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
	}
	if (field == 'slds_arrowbgcolor') {
		var arrowsize = elem__getFieldValue($el, 'slds_arrowsize');
		var bgSize = t_zeroGallery__getArrowSize(arrowsize);
		var arrowbgopacity = elem__getFieldValue($el, 'slds_arrowbgopacity');
		if (value == '') {
			$el.find('.t-slds__arrow').css({
				width: bgSize,
				height: bgSize,
				'background-color': 'transparent',
				'background-image': '',
			});
		} else {
			value = tn_replaceSingleQuotes(value);

			if (tn_isGradientJSON(value)) {
				$el.find('.t-slds__arrow').css({
					width: bgSize,
					height: bgSize,
					'background-color': 'transparent',
					'background-image': tn_parseGradientFromJSON(value),
				});
			} else {
				$el.find('.t-slds__arrow').css({
					width: bgSize,
					height: bgSize,
					'background-color': arrowbgopacity ? 'rgba(' + tn_hex2rgba(value, arrowbgopacity) + ')' : value,
					'background-image': '',
				});
			}
		}
		elem__renderViewOneField($el, 'slds_arrowbgcolorhover');
	}
	if (field == 'slds_arrowbgopacity') {
		elem__renderViewOneField($el, 'slds_arrowbgcolor');
	}
	if (field == 'slds_arrowalign') {
		if (value == '') value = 'center';
		$el
			.find('.t-slds__arrow_container')
			.removeClass('t-slds__arrow_container-left t-slds__arrow_container-center t-slds__arrow_container-right');
		$el.find('.t-slds__arrow_container').addClass('t-slds__arrow_container-' + value);
	}
	if (field == 'slds_dotssize') {
		if (value == '') value = '10';
		$el.find('.t-slds__bullet_body').css({
			width: value + 'px',
			height: value + 'px',
		});
		elem__renderViewOneField($el, 'slds_dotscontrols');
	}
	if (field == 'slds_loop') {
		if (value == '') value = 'loop';
		if (value == 'none') {
			$el.find('.t-slds__items-wrapper').attr('data-slider-with-cycle', 'false');
			$el.find('.t-slds__arrow_container').addClass('t-slds__nocycle');
		} else if (value == 'loop') {
			$el.find('.t-slds__items-wrapper').attr('data-slider-with-cycle', 'true');
			$el.find('.t-slds__arrow_container').removeClass('t-slds__nocycle');
		}
	}
	if (field == 'slds_speed') {
		if (value == '') value = 'none';
		if (value == 'none') {
			$el.find('.t-slds__items-wrapper').attr('data-slider-transition', '');
			$el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-slow');
			$el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-fast');
			$el.find('.t-slds__items-wrapper').addClass('t-slds_animated-none');
		} else if (value == 'slow') {
			$el.find('.t-slds__items-wrapper').attr('data-slider-transition', '500');
			$el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-fast');
			$el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-none');
			$el.find('.t-slds__items-wrapper').addClass('t-slds_animated-slow');
		} else if (value == 'fast') {
			$el.find('.t-slds__items-wrapper').attr('data-slider-transition', '300');
			$el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-slow');
			$el.find('.t-slds__items-wrapper').removeClass('t-slds_animated-none');
			$el.find('.t-slds__items-wrapper').addClass('t-slds_animated-fast');
		}
	}
	if (field == 'slds_arrowcolorhover') {
		elem__renderViewOneField($el, 'slds_arrowborder');
		$el.find('.t-slds__arrow').hover(
			function () {
				if (value == '') value = elem__getFieldValue($el, 'slds_arrowcolorhover');
				if (value == '') value = elem__getFieldValue($el, 'slds_arrowcolor');
				if (value == '' || typeof value == 'undefined') value = '#222';
				$(this).find('polyline, path').css('stroke', value);
			},
			function () {
				var colorpre = elem__getFieldValue($el, 'slds_arrowcolor');
				if (colorpre == '') colorpre = '#222';
				$(this).find('polyline, path').css('stroke', colorpre);
			},
		);
	}
	if (field == 'slds_arrowbgcolorhover') {
		$el.find('.t-slds__arrow').hover(
			function () {
				var arrowbgopacity = elem__getFieldValue($el, 'slds_arrowbgopacityhover');
				var color;

				if (arrowbgopacity == '') arrowbgopacity = '1.0';
				if (value == '') value = elem__getFieldValue($el, 'slds_arrowbgcolor');
				if (value == '') value = 'transparent';

				value = tn_replaceSingleQuotes(value);

				if (tn_isGradientJSON(value)) {
					$(this).css({
						'background-color': 'transparent',
						'background-image': tn_parseGradientFromJSON(value),
					});
				} else {
					color = value != 'transparent' ? 'rgba(' + tn_hex2rgba(value, arrowbgopacity) + ')' : value;
					$(this).css({
						'background-color': color,
						'background-image': '',
					});
				}
			},
			function () {
				var colorpre = elem__getFieldValue($el, 'slds_arrowbgcolor');
				var arrowbgopacity;

				if (colorpre == '') colorpre = 'transparent';

				colorpre = tn_replaceSingleQuotes(colorpre);

				if (tn_isGradientJSON(colorpre)) {
					$(this).css({
						'background-color': 'transparent',
						'background-image': tn_parseGradientFromJSON(colorpre),
					});
				} else {
					if (colorpre !== 'transparent') {
						arrowbgopacity = elem__getFieldValue($el, 'slds_arrowbgopacity');
						if (arrowbgopacity == '') arrowbgopacity = 1.0;
						colorpre = 'rgba(' + tn_hex2rgba(colorpre, arrowbgopacity) + ')';
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
		var dotsControls = elem__getFieldValue($el, 'slds_dotscontrols');
		if (dotsControls === 'near') {
			$el.find('.t-slds__bullet_wrapper').css('margin-bottom', -value + 'px');
			$el.find('.t-slds__bullet_wrapper').css('padding-bottom', 0);
		} else {
			$el.find('.t-slds__bullet_wrapper').css('padding-bottom', value + 'px');
			$el.find('.t-slds__bullet_wrapper').css('margin-bottom', 0);
		}
		elem__renderViewOneField($el, 'slds_captiontopmargin');
		elem__renderViewOneField($el, 'slds_arrowvmargin');
	}
	if (field == 'slds_captiontopmargin') {
		if (value == '') value = '20';
		var dotsControls = elem__getFieldValue($el, 'slds_dotscontrols');
		var arrowControls = elem__getFieldValue($el, 'slds_arrowcontrols');
		var topOffset = 0;
		if (dotsControls === 'near') {
			var dotsMargin = elem__getFieldValue($el, 'slds_dotsvmargin');
			var dotsSize = elem__getFieldValue($el, 'slds_dotssize');
			topOffset = 20 + parseInt(dotsSize) + parseInt(dotsMargin);
		}
		if (arrowControls === 'under') {
			var arrowsize = elem__getFieldValue($el, 'slds_arrowsize');
			var arrowoffset = elem__getFieldValue($el, 'slds_arrowvmargin');
			if (arrowoffset == '') arrowoffset = '10';
			if (arrowsize == '') arrowsize = 's';
			arrowsize = t_zeroGallery__getArrowSize(arrowsize);
			topOffset = topOffset + parseInt(arrowsize) + parseInt(arrowoffset);
		}
		$el.find('.tn-elem__gallery__caption-position-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__caption-position-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
				'"] .t-slds__caption {\
					margin-top: ' +
				(topOffset + parseInt(value)) +
				'px\
				}\
			</style>\
		',
		);
	}
	if (field == 'slds_captionwidth') {
		if (value == '') value = '80';
		$el.find('.tn-elem__gallery__caption-width-styles').remove();
		$el.find('.t-slds__container').append(
			'\
			<style class="tn-elem__gallery__caption-width-styles">\
				.tn-elem[data-elem-id="' +
				$el.attr('data-elem-id') +
				'"] .t-slds__caption {\
					width: ' +
				parseInt(value) +
				'%\
				}\
			</style>\
		',
		);
	}
	if (field == 'slds_arrowhmargin') {
		if (value == '') value = '30';
		var arrowControls = elem__getFieldValue($el, 'slds_arrowcontrols');
		if (arrowControls === 'near') {
			$el.find('.t-slds__arrow-right').css('left', value + 'px');
			$el.find('.t-slds__arrow-right').css('right', 'auto');
			$el.find('.t-slds__arrow-left').css('right', value + 'px');
			$el.find('.t-slds__arrow-left').css('left', 'auto');
		} else {
			$el.find('.t-slds__arrow-right').css('right', value + 'px');
			$el.find('.t-slds__arrow-right').css('left', 'auto');
			$el.find('.t-slds__arrow-left').css('left', value + 'px');
			$el.find('.t-slds__arrow-left').css('right', 'auto');
		}
	}

	if (field == 'slds_arrowvmargin') {
		if (value == '') value = '10';
		var arrowControls = elem__getFieldValue($el, 'slds_arrowcontrols');
		var css = {};
		if (arrowControls === 'above') {
			css.top = 0 - value + 'px';
			css.bottom = 'auto';
			$el.find('.t-slds__arrow').css('margin-top', '0');
		} else if (arrowControls === 'under') {
			var dotsControls = elem__getFieldValue($el, 'slds_dotscontrols');
			var dotsWrapperHeight = 0;
			if (dotsControls === 'near') {
				var dotsMargin = elem__getFieldValue($el, 'slds_dotsvmargin');
				var dotsSize = elem__getFieldValue($el, 'slds_dotssize');
				dotsWrapperHeight = 20 + parseInt(dotsSize) + parseInt(dotsMargin);
			}
			value = parseInt(value) + dotsWrapperHeight;
			css.bottom = 0 - value + 'px';
			css.top = 'auto';
			$el.find('.t-slds__arrow').css('margin-top', '0');
		} else {
			css.top = '';
			css.bottom = '';
		}
		$el.find('.t-slds__arrow_container').css(css);
		elem__renderViewOneField($el, 'slds_captiontopmargin');
	}

	if (field == 'slds_arrowbetweenmargin') {
		if (value == '') value = '10';
		var arrowControls = elem__getFieldValue($el, 'slds_arrowcontrols');
		if (arrowControls === 'above' || arrowControls === 'under') {
			$el.find('.t-slds__arrow-right').css('margin-left', value / 2);
			$el.find('.t-slds__arrow-left').css('margin-right', value / 2);
			elem__renderViewOneField($el, 'slds_arrowcontrols');
		}
	}

	if (field == 'widthunits') {
		elem__renderViewOneField($el, 'width');
	}

	if (field == 'heightunits') {
		elem__renderViewOneField($el, 'height');
	}

	if (field == 'leftunits') {
		elem__renderViewOneField($el, 'left');
	}

	if (field == 'topunits') {
		elem__renderViewOneField($el, 'top');
	}

	if (field == 'tipposition') {
		if (!$el.hasClass('tn-elem__selected')) return;
		if (value == '') value = 'top';
		var tipw = parseInt($el.find('.tn-atom__tip').outerWidth());
		var tiph = parseInt($el.find('.tn-atom__tip').outerHeight());
		var pinw = parseInt($el.find('.tn-atom__pin').width());
		var padd = 15;
		if (value == 'top')
			$el
				.find('.tn-atom__tip')
				.css('top', '-' + (tiph * 1 + padd) + 'px')
				.css('left', '-' + (tipw / 2 - pinw / 2) + 'px');
		if (value == 'right')
			$el
				.find('.tn-atom__tip')
				.css('top', pinw / 2 - tiph / 2 + 'px')
				.css('left', pinw + padd + 'px');
		if (value == 'bottom')
			$el
				.find('.tn-atom__tip')
				.css('top', pinw * 1 + padd + 'px')
				.css('left', '-' + (tipw / 2 - pinw / 2) + 'px');
		if (value == 'left')
			$el
				.find('.tn-atom__tip')
				.css('top', pinw / 2 - tiph / 2 + 'px')
				.css('left', '-' + (tipw + padd) + 'px');
	}
	if (field == 'tipbgcolor') {
		if (value == '') value = 'transparent';

		value = tn_replaceSingleQuotes(value);

		if (tn_isGradientJSON(value)) {
			$el.find('.tn-atom__tip').css({
				'background-color': '',
				'background-image': tn_parseGradientFromJSON(value),
			});
		} else {
			$el.find('.tn-atom__tip').css({
				'background-color': value,
				'background-image': '',
			});
		}

		if (eltype == 'button') {
			elem__renderViewOneField($el, 'bgcolorhover');
		}
	}
	if (field == 'tipradius') {
		if (value == '') value = 0;
		$el.find('.tn-atom__tip').css('border-radius', value + 'px');
	}
	if (field == 'tipwidth') {
		if (value == '') value = 260;
		$el.find('.tn-atom__tip').css('width', parseFloat(value) + 'px');
	}
	if (field == 'tipshadowblur') {
		if (value == '') value = 0;
		$el.find('.tn-atom__tip').css('box-shadow', 'rgba(0, 0, 0, 0.3) 0px 0px ' + value + 'px 0px');
	}
	if (field == 'pinicon') {
		if (value == '' || value == 'img') {
			$el.find('.tn-atom__pin').html('');
		} else {
			var pincolor = elem__getFieldValue($el, 'pincolor');
			if (typeof pincolor == 'undefined' || pincolor == '') pincolor = '#000';
			if (value == 'qst') {
				var foo = '<div class="tn-atom__pin-icon">';
				foo += '<svg width="100%" height="100%" style="display:block;" viewBox="0 0 25 25">';
				foo += '<g stroke="none" stroke-width="1.5" fill="none" fill-rule="evenodd">';
				foo += '<g>';
				foo += '<g transform="translate(9.000000, 6.800000)">';
				foo +=
					'<path d="M3.48833774,8.19927008 C3.48833774,7.88872587 3.3487997,6.65099635 4.37688754,5.90659633 C5.69058476,4.88826489 7.04132628,4.41067505 7.04132628,2.75352263 C7.04132628,1.62587484 6.231817,0.131200155 4.07587217,0.0202534993 C2.22064757,-0.103393555 0.471623579,1.06713456 0.500349002,2.75352263" stroke="' +
					pincolor +
					'"></path>';
				foo += '<ellipse fill="' + pincolor + '" cx="3.5" cy="11.3" rx="1.2" ry="1.2"></ellipse>';
				foo += '</g>';
				foo += '</g>';
				foo += '</g>';
				foo += '</svg>';
				foo += '</div>';
			}
			if (value == 'info') {
				var foo = '<div class="tn-atom__pin-icon">';
				foo += '<svg width="100%" height="100%" style="display:block;" viewBox="0 0 25 25">';
				foo += '<g stroke="none" stroke-width="1.5" fill="none" fill-rule="evenodd">';
				foo += '<g>';
				foo += '<path d="M13,10 L13,18" stroke="' + pincolor + '" stroke-linejoin="bevel"></path>';
				foo += '<circle fill="' + pincolor + '" cx="13" cy="7.0" r="1.3"></circle>';
				foo += '</g>';
				foo += '</g>';
				foo += '</svg>';
				foo += '</div>';
			}
			if (value == 'plus') {
				var foo = '<div class="tn-atom__pin-icon">';
				foo += '<svg width="100%" height="100%" style="display:block;" viewBox="0 0 25 25">';
				foo += '<g stroke="none" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="square">';
				foo += '<g stroke="' + pincolor + '">';
				foo += '<g transform="translate(7.500000, 7.700000)">';
				foo += '<path d="M5,0 L5,9.28571429"></path>';
				foo += '<path d="M0.357142857,4.64285714 L9.64285714,4.64285714"></path>';
				foo += '</g>';
				foo += '</g>';
				foo += '</g>';
				foo += '</svg>';
				foo += '</div>';
			}
			if (value == 'camera') {
				var foo = '<div class="tn-atom__pin-icon">';
				foo += '<svg width="100%" height="100%" style="display:block;" viewBox="0 0 25 25">';
				foo += '<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">';
				foo += '<g fill="' + pincolor + '">';
				foo +=
					'<path d="M7,8.86363636 L8.36363636,8.86363636 L9.26906134,7.0527864 C9.43845336,6.71400238 9.78471648,6.5 10.1634885,6.5 L14.8365115,6.5 C15.2152835,6.5 15.5615466,6.71400238 15.7309387,7.0527864 L16.6363636,8.86363636 L18,8.86363636 C18.5522847,8.86363636 19,9.31135161 19,9.86363636 L19,16.1363636 C19,16.6886484 18.5522847,17.1363636 18,17.1363636 L7,17.1363636 C6.44771525,17.1363636 6,16.6886484 6,16.1363636 L6,9.86363636 C6,9.31135161 6.44771525,8.86363636 7,8.86363636 Z M12.5,15.1666667 C14.0954893,15.1666667 15.3888889,13.8732671 15.3888889,12.2777778 C15.3888889,10.6822885 14.0954893,9.38888889 12.5,9.38888889 C10.9045107,9.38888889 9.61111111,10.6822885 9.61111111,12.2777778 C9.61111111,13.8732671 10.9045107,15.1666667 12.5,15.1666667 Z M12.5,13.7222222 C11.7022554,13.7222222 11.0555556,13.0755224 11.0555556,12.2777778 C11.0555556,11.4800331 11.7022554,10.8333333 12.5,10.8333333 C13.2977446,10.8333333 13.9444444,11.4800331 13.9444444,12.2777778 C13.9444444,13.0755224 13.2977446,13.7222222 12.5,13.7222222 Z"></path>';
				foo += '</g>';
				foo += '</g>';
				foo += '</svg>';
				foo += '</div>';
			}
			if (value == 'star') {
				var foo = '<div class="tn-atom__pin-icon">';
				foo += '<svg width="100%" height="100%" style="display:block;" viewBox="0 0 25 25">';
				foo += '<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">';
				foo += '<g fill="' + pincolor + '">';
				foo +=
					'<polygon points="12.605 16.6945552 7.90485152 19.1655695 8.80250001 13.9318772 5 10.2253557 10.2549258 9.46177034 12.605 4.69999981 14.9550743 9.46177034 20.21 10.2253557 16.4075 13.9318772 17.3051485 19.1655695"></polygon>';
				foo += '</g>';
				foo += '</g>';
				foo += '</svg>';
				foo += '</div>';
			}
			$el.find('.tn-atom__pin').html(foo);
		}
	}
	if (field == 'pincolor') {
		elem__renderViewOneField($el, 'pinicon');
	}

	if (field == 'inputs') {
		value = $el.find('.tn-atom__inputs-textarea').val();
		elem__renderForm($el, value);
	}

	if (field == 'imgs') {
		t_zeroGallery__render($el, value);

		t_sldsInit($el);
		t_slds_updateSlider($el);
		hammer.get('pan').set({enable: false, preventDefault: true});
		$el.find('.t-slds').css('visibility', 'visible');
		elem__addUiClickEvents__gallery($el);
		$el.find('.ui-resizable-handle').css('display', '');
		$el.find('.ui-resizable-handle').css('display', '');
		$el.find('.ui-resizable-handle').css('display', '');
	}

	if (
		field == 'width' ||
		field == 'height' ||
		field == 'fontsize' ||
		field == 'fontfamily' ||
		field == 'letterspacing' ||
		field == 'lineheight' ||
		field == 'fontweight' ||
		field == 'img'
	) {
		elem__renderViewOneField($el, 'left');
		elem__renderViewOneField($el, 'top');
	}

	if (eltype == 'gallery' && field != 'invisible') {
		t_slds_updateSlider($el);
	}
}

function allelems__renderView() {
	tn_console('func: allelems__renderView');
	$('.tn-elem').each(function () {
		var el = $(this);
		var groupid = elem__getFieldValue(el, 'groupid');
		var isGroupCreated = $('#' + groupid).length;
		if (isGroupCreated && (!window.tn.groupsBounds || !window.tn.groupsBounds[groupid])) {
			if (!window.tn.groupsBounds) window.tn.groupsBounds = {};
			window.tn.groupsBounds[groupid] = group__getMinMaxPoints(groupid);
		}
		elem__renderView(el);
	});
	for (var groupId in window.tn.groupsBounds) {
		group__updateElemsActualPosition(groupId);
	}
	window.tn.groupsBounds = null;

	tn_console_runtime();
}
