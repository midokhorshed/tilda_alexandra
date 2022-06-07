/**
 * tilda-video-processor необходим для блоков, где в качестве фоновой обложки зачастую используюся видео -
 * (CR...). Однако иногда это могут быть остальные блоки: видео VD01; последовательность слайдов GL06.
 * Видео загружается ссылой и может воспроизводиться либо как  в формате .mp4 и .webm для HTML5-проигрывателя,
 * либо это будет ссылка на YouTube видео и соответственно YouTube-плеер. Для первого случая - основная функция в скрипте
 * t_videoprocessor__processHTML5Video, для второго - processYoutubeVideo. В них происходят по сути идентичные сценарии:
 * получаем параметры, переданные через tilda-cover, эти параметры применяем на видео, которое будет создавать, вешаем
 * обработчики по ресайзу или скроллу:
 * например, постановку на паузу, если видео не в зоне видимости; переопределение высоты контейнера и видео; и тд.
 *
 * В tilda-cover можно установить эффект при скролле: паралакс или фиксацию. Фиксация в видео не
 * работает.
 *
 * В setWidthAndHeightVideo обложка для YouTube увеличена по высоте, чтобы пользователь не видел
 * рекламный блок снизу, это вынесено в переменной isAdCutted.
 *
 * фоновые видео не работают в мобильных версиях. Но они будут работать на iPad Pro, потому что там
 * по дефолту установлен предпросмотр страницы в десктопной версии.
 */

/**
 *  append to head YouTube api script, wait after load YT object
 *  to create iframe and set properties
 *
 * @param {HTMLElement} el
 * @param {string} height
 */
 function processYoutubeVideo(el, height) {
	// append YouTube API script
	if (!document.getElementById('youtube-api')) {
		var script = document.createElement('script');
		script.id = 'youtube-api';
		script.src = 'https://www.youtube.com/iframe_api';
		document.head.insertAdjacentElement('beforeend', script);
	}

	videoProcessor_onFuncLoad('YT', function () {
		// create object with YouTube video params, which will be found by data-attributes in current element
		var videoObject = {
			'url-youtube': '',
			'nomute': '',
			'noloop': '',
			'nocover': '',
		};

		// iterating keys from created object and append to it current values
		for (var key in videoObject) {
			var value = el.getAttribute('data-content-video-' + key);
			if (value) videoObject[key] = value;
		}

		// append new values to simplified using in t_videoprocessor__setYoutubePlayer
		videoObject['mute'] = videoObject['nomute'] !== 'yes';
		videoObject['loop'] = videoObject['noloop'] !== 'yes';
		videoObject['cover'] = videoObject['nocover'] !== 'yes';

		if (window.isMobile) return;
		t_videoprocessor__setYoutubePlayer(el, videoObject);
		var customHeight = t_videoprocessor__getHeightFromAttr(height);
		var calculatedHeight = parseInt(el.getAttribute('data-content-cover-updated-height'), 10) || 0;
		var maxHeight = calculatedHeight > customHeight ? el.getAttribute('data-content-cover-updated-height') : height;
		setWidthAndHeightVideo(el, maxHeight, 'youtube');

		window.addEventListener('resize', function () {
			if (videoObject['cover']) {
				// update params of maxHeight in resize
				customHeight = t_videoprocessor__getHeightFromAttr(height);
				calculatedHeight = parseInt(el.getAttribute('data-content-cover-updated-height'), 10) || 0;
				maxHeight = calculatedHeight > customHeight ? el.getAttribute('data-content-cover-updated-height') : height;
				setWidthAndHeightVideo(el, maxHeight, 'youtube');
			}
		});
	});
}

function t_videoprocessor__setYoutubePlayer(el, videoObject) {
	// create YouTube iframe
	var iframe = document.createElement('iframe');
	iframe.src = t_videoprocessor__generateYoutubeURL(videoObject);
	iframe.frameBorder = '0';
	iframe.allow = 'fullscreen';
	el.appendChild(iframe);

	var playtimer;

	new YT.Player(iframe, {
		events:
			{
				onReady: function (e) {
					t_videoprocessor__pauseAndPlayYouTubeVideo(el, e.target, videoObject['mute']);
					t_videoprocessor__muteYouTubeVideo(e, videoObject);
					e.target.setLoop(true);
				},
				onStateChange: function (e) {
					t_videoprocessor__muteYouTubeVideo(e, videoObject);
					if (e.data === YT.PlayerState.PLAYING) {
						playtimer = t_videoprocessor__updateLoopedVideo(e.target, videoObject);
					} else {
						window.clearInterval(playtimer);
					}
				},
			},
	});
}

/**
 * mute created video
 *
 * @param {Event} e
 * @param {Object} videoObject
 */
function t_videoprocessor__muteYouTubeVideo(e, videoObject) {
	if (e.target.setVolume && videoObject['mute']) {
		e.target.setVolume(0);
	}
}

/**
 * remove black window between stop and play again video
 *
 * @param {Object} el - player
 * @param {Object} videoObject
 * @return {number} - an interval, that checks ending of the video
 */
function t_videoprocessor__updateLoopedVideo(el, videoObject) {
	return setInterval(function () {
		// time in sec
		var currentTime = el.getCurrentTime();
		var endVideoTime = el.getDuration();
		if (endVideoTime && currentTime + 1 > endVideoTime) {
			el.seekTo(0); // return to the beginning (0sec)
			if (videoObject['noloop']) {
				el.stopVideo();
				el.clearVideo();
			}
		}
	}, 1000);
}

/**
 * function to generate mp4 or .webm video
 *
 * @param {HTMLElement} el
 * @param {Object} options
 */
function t_videoprocessor__processHTML5Video(el, options) {
	if (!el) return;

	// container to be at least relative
	if (window.getComputedStyle(el).position === 'static' || !el.style.position) {
		el.style.position = 'relative';
	}
	//set height
	options.height = el.offsetHeight;

	var videoWrapper = t_videoprocessor__createHTML5Video(options);
	el.insertAdjacentElement('beforeend', videoWrapper);
	setWidthAndHeightVideo(videoWrapper, options.height + 'px', 'html5');

	window.addEventListener('resize', function () {
		setWidthAndHeightVideo(videoWrapper, options.height + 'px', 'html5');
	});

	window.addEventListener('scroll', t_throttle(function () {
		t_videoprocessor__pauseAndPlayHTMLVideo(videoWrapper);
	}));

	return videoWrapper.querySelector('video');
}

function t_videoprocessor__pauseAndPlayHTMLVideo(videoWrapper) {
	var video = videoWrapper.querySelector('video');
	if (!video) return;

	var viewportTopPos = window.pageYOffset;
	var viewportBottomPos = viewportTopPos + document.documentElement.clientHeight;
	var videoWrapperTopPos = videoWrapper.getBoundingClientRect().top + viewportTopPos;
	var videoWrapperHeight = videoWrapper.offsetHeight;
	var videoWrapperBottomPos = videoWrapperTopPos + videoWrapperHeight;
	var padding = 500;

	var currentPosition;
	if (viewportBottomPos > videoWrapperTopPos && viewportTopPos <= videoWrapperBottomPos) {
		currentPosition = 'inside';
	} else if (
		(viewportBottomPos < videoWrapperTopPos && viewportBottomPos > videoWrapperTopPos - padding) ||
		(viewportTopPos > videoWrapperBottomPos && viewportTopPos < videoWrapperBottomPos + padding)) {
		currentPosition = 'near';
	} else {
		currentPosition = 'near';
	}

	switch (currentPosition) {
		case 'inside':
			video.play();
			break;
		case 'near':
			video.pause();
			break;
	}
}

/**
 * create video wrapper with video with current options
 *
 * @param {Object} options
 * @return {HTMLDivElement}
 */
function t_videoprocessor__createHTML5Video(options) {
	var videoWrapper = document.createElement('div');
	videoWrapper.style.position = options.position;
	videoWrapper.style.zIndex = options.zIndex;
	videoWrapper.style.top = '0';
	videoWrapper.style.left = '0';
	videoWrapper.style.height = options.height + 'px';
	videoWrapper.style.width = options.width + 'px';
	videoWrapper.style.opacity = options.opacity;
	videoWrapper.style.overflow = 'hidden';

	var video = document.createElement('video');
	video.style.position = 'relative';
	video.style.zIndex = options.zIndex;
	video.style.poster = options.poster;
	video.style.top = '0';
	video.style.left = '0';
	video.style.minHeight = '100%';
	video.style.minWidth = '100%';
	video.style.height = options.height + 'px';
	video.style.width = options.width + 'px';
	video.autoplay = options.autoplay;
	video.loop = options.loop;
	video.muted = options.muted;
	video.volume = options.volume;
	video.setAttribute('playsinline', '');

	video.addEventListener('canplay', function () {
		if (options.autoplay) {
			video.muted = true;
			video.play();
		}
	});

	var codec = options.mp4 ? 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' : 'video/webm; codecs="vp8, vorbis"';
	var emptyVideo = document.createElement('video');
	var isVideoSupported = emptyVideo.canPlayType(codec);

	if (isVideoSupported) {
		video.src = options.webm || options.mp4;
		videoWrapper.insertAdjacentElement('beforeend', video);
	} else if (!videoWrapper.querySelector('.no-video-loader')) {
		// image for those that don't support the video
		var img = document.createElement('img');
		img.setAttribute('src', options.poster);
		img.style.position = 'absolute';
		img.style.zIndex = options.zIndex;
		img.style.top = '0';
		img.style.left = '0';
		img.style.minHeight = '100%';
		img.style.minWidth = '100%';
		img.classList.add('no-video-loader');
		videoWrapper.insertAdjacentElement('beforeend', img);
	}

	return videoWrapper;
}

/**
 * set width and height to current video
 *
 * @param {HTMLElement} el - current el
 * @param {string} height - height with px or vh
 * @param {string} type - YouTube or HTML5 video
 */
function setWidthAndHeightVideo(el, height, type) {
	var iframe = el.querySelector('iframe');
	if (type === 'html5') {
		var video = el;
		el = el.closest('.t-cover__carrier');
		iframe = el.querySelector('video');
	}

	var isHasCover = el.getAttribute('data-content-video-nocover') !== 'yes';
	var isAdCutted = el.getAttribute('data-content-video-noadcut-youtube') !== 'yes';
	var customRatio = el.getAttribute('data-content-video-ratio');
	var adCuttedPadding = isAdCutted && type === 'youtube' ? 220 : 0;
	var videoRatio = 0.5625;


	if (customRatio && parseFloat(customRatio) > 0) videoRatio = parseFloat(customRatio);

	if (isHasCover) {
		var coverHeight = t_videoprocessor__getHeight(height, isHasCover, el, videoRatio);
		var videoWidth = window.innerWidth;
		var videoHeight = videoWidth * videoRatio;
		var deltaRatio = 1;

		// recalculate deltaRatio if video height less than div height
		if (videoHeight - adCuttedPadding < coverHeight) {
			deltaRatio = videoHeight < coverHeight ? coverHeight / videoHeight : videoHeight / coverHeight;
			deltaRatio += 0.02;
		}

		var zoomedWidth = Math.floor(videoWidth * deltaRatio);
		var zoomedHeight = Math.floor((videoHeight + adCuttedPadding) * deltaRatio);
		var heightDelta = zoomedHeight - coverHeight;
		var widthDelta = zoomedWidth - videoWidth;

		if (iframe) iframe.style.height = zoomedHeight + 'px';
		if (iframe) iframe.style.width = zoomedWidth + 'px';

		if (type === 'html5') {
			video.style.height = zoomedHeight + 'px';
			video.style.width = zoomedWidth + 'px';
		}

		if (iframe) iframe.style.marginTop = heightDelta > 0 ? -Math.floor(heightDelta / 2) + 'px' : '0';
		if (iframe) iframe.style.marginLeft = widthDelta > 0 ? -Math.floor(widthDelta / 2) + 'px' : '0';

	} else {
		var noCoverHeight = t_videoprocessor__getHeight(height, isHasCover, el, videoRatio);
		if (iframe) iframe.style.width = '100%';
		if (iframe) iframe.style.height = noCoverHeight + 'px';
	}
}

/**
 * calculate and get height for video element
 *
 * @param {string} height
 * @param {Boolean} isHasCover
 * @param {HTMLElement} el
 * @param {number} videoRatio
 * @return {number} - height
 */
function t_videoprocessor__getHeight(height, isHasCover, el, videoRatio) {
	var calculatedHeight;
	if (!height) {
		if (isHasCover) {
			height = '100vh';
		} else {
			calculatedHeight = Math.floor(el.offsetWidth * videoRatio);
		}
	}
	if (height.indexOf('vh') !== -1) {
		var parsedHeight = parseInt(height, 10) || 0;
		calculatedHeight = Math.floor(document.documentElement.clientHeight * (parsedHeight / 100));
	} else if (height) {
		calculatedHeight = parseInt(height, 10) || 0;
	}
	return calculatedHeight || 0;
}

function t_videoprocessor__getHeightFromAttr(height) {
	if (!height) return 0;
	if (height.indexOf('vh') !== -1) {
		return parseInt(height, 10) * document.documentElement.clientHeight / 100;
	} else {
		return parseInt(height, 10);
	}
}

/**
 * @param {Object} videoObject - link to video
 * @returns {string} - transformed src
 */
function t_videoprocessor__generateYoutubeURL(videoObject) {
	var src = videoObject['url-youtube'];
	var protocolAndDomain = 'https://www.youtube.com/embed';
	var hasCover = videoObject['cover'];
	var isMute = videoObject['mute'];

	// if contains only videoID
	if (src.indexOf(protocolAndDomain) === -1) {
		if (src.indexOf('/') === -1) src = '/' + src;
		// append to protocol and domain video ID, it will look like: https://www.youtube.com/embed/{URL}
		src = protocolAndDomain.concat(src);
	}

	// adding separator for parameters in URL
	src += src.indexOf('?') === -1 ? '?' : '&';

	var currentLocation = location.protocol + '//' + location.host;

	var videoID = src.replace(protocolAndDomain + '/', '');
	var firstSeparator = videoID.indexOf('?');
	if (firstSeparator !== -1) videoID = videoID.slice(0, firstSeparator);

	if (hasCover) {
		src += 'autoplay=1&loop=1&enablejsapi=1&&playerapiid=featuredytplayer&controls=0&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&theme=light&wmode=transparent&origin=' +
			currentLocation + '&playlist=' + videoID;
	} else {
		src += 'autoplay=0&loop=0&enablejsapi=1&&playerapiid=featuredytplayer&controls=1&modestbranding=1&rel=0&showinfo=0&color=black&iv_load_policy=3&theme=dark&wmode=transparent&origin=' +
			currentLocation;
	}

	if (isMute) src += '&mute=1';

	return src;
}

/**
 * which user scroll the page, background video can be pausing;
 * and smooth muting its volume (not for bg cover)
 *
 * @param {HTMLElement} el - current element, which include YouTube iframe
 * @param {Object} player
 * @param {Boolean} isMute
 */
function t_videoprocessor__pauseAndPlayYouTubeVideo(el, player, isMute) {
	window.addEventListener('scroll', function () {
		var viewportTopPos = window.pageYOffset;
		var viewportHeight = document.documentElement.clientHeight;
		var viewportBottomPos = viewportTopPos + viewportHeight;
		var videoTopPos = el.getBoundingClientRect().top + viewportTopPos;
		var videoHeight = el.offsetHeight;
		var videoBottomPos = videoTopPos + videoHeight;
		var isInvisible = el.getAttribute('data-video-invisible') === 'y';
		var playerState = player.getPlayerState();
		var padding = 500;

		var currentPosition;
		if (viewportBottomPos > videoTopPos && viewportTopPos <= videoBottomPos) {
			currentPosition = 'inside';
		} else if (
			(viewportBottomPos < videoTopPos && viewportBottomPos > videoTopPos - padding) ||
			(viewportTopPos > videoBottomPos && viewportTopPos < videoBottomPos + padding)) {
			currentPosition = 'near';
		} else {
			currentPosition = 'far';
		}

		// playerState:
		//-1 – воспроизведение видео не началось
		// 0 – воспроизведение видео завершено
		// 1 – воспроизведение
		// 2 – пауза
		// 3 – буферизация
		// 5 – видео находится в очереди

		switch (currentPosition) {
			case 'inside':
				if (playerState === -1 || playerState === 3 || playerState === 5 || (playerState === 2 && isInvisible)) {
					player.playVideo();
					el.removeAttribute('data-video-invisible');
				}
				if (!isMute) {
					var muteStatePos = 'inside';
					if (videoTopPos > videoBottomPos - 200) muteStatePos = 'near';
					if (videoTopPos > videoBottomPos - 100 || viewportBottomPos < videoTopPos + 200) muteStatePos = ' far';
					t_videoprocessor__smoothMuteSound(player, muteStatePos);
				}
				break;
			case 'near':
				el.setAttribute('data-video-invisible', 'y');
				t_videoprocessor__pauseVideo(player, playerState);
				break;
			case 'far':
				t_videoprocessor__pauseVideo(player, playerState);
				break;
		}
	});
}

/**
 * @param {Object} player
 * @param {string} muteStatePos
 */
function t_videoprocessor__smoothMuteSound(player, muteStatePos) {
	switch (muteStatePos) {
		case 'far':
			player.setVolume(30);
			break;
		case 'near':
			player.setVolume(70);
			break;
		case 'inside':
			player.setVolume(100);
			break;
	}
}

/**
 * @param {Object} player
 * @param {number} playerState
 */
function t_videoprocessor__pauseVideo(player, playerState) {
	if (playerState !== 2) {
		player.pauseVideo();
	}
}

/**
 * some analog of promise
 * we cannot use here t_onFuncLoad, because after getting YT object, we need check is YT.Player is ready to use
 *
 * @param {String} obj - if obj is object
 * @param {Function} okFunc - do okFunc
 */
function videoProcessor_onFuncLoad(obj, okFunc) {
	var timer;
	if (typeof window[obj] === 'object' && typeof window[obj].Player === 'function') {
		okFunc();
	} else {
		timer = setInterval(function () {
			if (typeof window[obj] === 'object' && typeof window[obj].Player === 'function') {
				okFunc();
				clearInterval(timer);
				timer = 0;
			}
		}, 100);
	}
	window.addEventListener('load', function () {
		setTimeout(function () {
			if (timer) {
				if (typeof window[obj] === 'object' && typeof window[obj].Player === 'function') {
					okFunc();
					clearInterval(timer);
				} else {
					clearInterval(timer);
					throw new Error(obj + ' is undefined');
				}
			}
		}, 5000);
	});
}

if (!Element.prototype.matches) {
	Element.prototype.matches =
		Element.prototype.matchesSelector ||
		Element.prototype.msMatchesSelector ||
		Element.prototype.mozMatchesSelector ||
		Element.prototype.webkitMatchesSelector ||
		Element.prototype.oMatchesSelector;
}

// Polyfill: Element.closest
if (!Element.prototype.closest) {
	Element.prototype.closest = function (s) {
		var el = this;
		while (el && el.nodeType === 1) {
			if (Element.prototype.matches.call(el, s)) {
				return el;
			}
			el = el.parentElement || el.parentNode;
		}
		return null;
	};
}