/**
 * tilda-video-processor use in blocks, which can be placed video into their cover (CR...)
 */
(function () {
    window.processYoutubeVideo = function (div, height) {
        load_youtube_api();

        var defFunc = function () {
            var src = div.getAttribute('data-content-video-url-youtube');
            var nomute = div.getAttribute('data-content-video-nomute');
            var noloop = div.getAttribute('data-content-video-noloop');
            var nocover = div.getAttribute('data-content-video-nocover');

            var iframe = document.createElement('iframe');
            iframe.src = processSrc(src, nocover, nomute);
            iframe.frameBorder = 0;
            iframe.allow = 'autoplay';

            var playtimer;
            div.appendChild(iframe);
            if (!window.isMobile && typeof YT !== 'undefined') {
                // eslint-disable-next-line no-undef
                new YT.Player(iframe, {
                    events: {
                        onReady: function (e) {
                            onYouTubePlayerReady_do(div, e.target, nomute);
                            if (e.target.setVolume && nomute != 'yes') {
                                e.target.setVolume(0);
                            }
                            e.target.setLoop(true);
                        },
                        onStateChange: function (e) {
                            if (e.target.setVolume && nomute != 'yes') {
                                e.target.setVolume(0);
                            }

                            if (e.data === -1) {
                                var sp = window.fix_scrolltop_beforestop_youtube;
                                if (sp >= 0) {
                                    window.scrollTo(0, sp);
                                    delete window.fix_scrolltop_beforestop_youtube;
                                }
                            }
                            // eslint-disable-next-line no-undef
                            if (e.data === YT.PlayerState.PLAYING) {
                                playtimer = window.setInterval(function () {
                                    var a = e.target.getCurrentTime();
                                    var b = e.target.getDuration();
                                    if (a + 1 > b && b !== 0) {
                                        e.target.seekTo(0);
                                        if (noloop === 'yes') {
                                            e.target.stopVideo();
                                            e.target.clearVideo();
                                        }
                                    }
                                }, 1000);
                            } else {
                                window.clearInterval(playtimer);
                            }
                        },
                    },
                });
            }

            setWidthHeightYoutubeVideo(div, height);
        };

        t_onFuncLoad(window.onYouTubeIframeAPIReady, defFunc);
    };

    window.onYouTubeIframeAPIReady = function () {
        if (typeof YT !== 'undefined') {
            return true;
        }
    };

    var t_videoProcessor__extend = function (out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                // eslint-disable-next-line no-prototype-builtins
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    };

    window.videoBG = function (selector, options) {

        var options = {};
        if (typeof selector == 'object') {
            options = t_videoProcessor__extend({}, window.videoBG.defaults, selector);
        } else if (!selector) {
            options = window.videoBG.defaults;
        } else {
            return selector.videoBG(options);
        }

        var container = this;

        // check if elements available otherwise it will cause issues
        if (!container) {
            return;
        }

        // container to be at least relative
        if (container.style.position === 'static' || !container.style.position) {
            container.style.position = 'relative';
        }

        // get width
        if (options.width == 0) {
            options.width = container.offsetWidth;
        }

        // get height
        if (options.height == 0) {
            options.height = container.offsetHeight;
        }

        // get the wrapper

        // var wrap = window.videoBG.wrapper();
        // wrap.height(options.height)
        //     .width(options.width);

        // if is a text replacement
        if (options.textReplacement) {
            // force sizes
            options.scale = true;

            // set sizes and forcing text out
            container.style.width = options.width + 'px';
            container.style.height = options.height + 'px';
            container.style.textIndent = '-9999px';
        } else {
            // set the wrapper above the video
            //wrap.css('z-index',options.zIndex+1);
        }

        // move the contents into the wrapper
        // commented by n.o
        // wrap.html(container.clone(true));

        // get the video
        var video = window.videoBG.video(options);

        // if we are forcing width / height
        if (options.scale) {
            // overlay wrapper
            // wrap.height(options.height)
            //     .width(options.width);

            // video
            video.style.height = options.height + 'px';
            video.style.width = options.width + 'px';
        }

        // add it all to the container
        // container.html(wrap);
        container.insertAdjacentElement('beforeend', video);

        if (container.getAttribute('data-content-video-nomute')) {
            var videoBlock = container.querySelector('video');
            if (videoBlock) {
                videoBlock.setAttribute('muted', 'true');
            }
        }

        setWidthHeightHTMLVideo(video, options.height + 'px');

        return video.querySelector('video');
    };

    // set to fullscreen
    window.videoBG.setFullscreen = function (el) {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        el.style.minHeight = 0;
        el.style.minWidth = 0;
        if (el.parentNode) {
            el.parentNode.style.width = windowWidth + 'px';
            el.parentNode.style.height = windowHeight + 'px';
        }
        // if by width
        if (windowWidth / windowHeight > el.aspectRatio) {
            el.style.width = windowWidth + 'px';
            el.style.height = 'auto';
            /* shift the element up*/
            var height = el.offsetHeight;
            var shift = (height - windowHeight) / 2;
            if (shift < 0) {
                shift = 0;
            }
            el.style.top = -shift + 'px';
        } else {
            el.style.width = 'auto';
            el.style.height = windowHeight + 'px';
            // shift the element left
            var width = el.offsetWidth;
            var shift = (width - windowWidth) / 2;
            if (shift < 0) {
                shift = 0;
            }
            el.style.left = -shift + 'px';

            // this is a hack mainly due to the iphone
            if (shift === 0) {
                setTimeout(function () {
                    window.videoBG.setFullscreen(el);
                }, 500);
            }
        }

        var videoBgWrapper = document.querySelectorAll('body > .videoBG_wrapper');
        Array.prototype.forEach.call(videoBgWrapper, function (videoBg) {
            videoBg.style.width = windowWidth + 'px';
            videoBg.style.height = windowHeight + 'px';
        });
    };

    // get the formatted video element
    window.videoBG.video = function (options) {
        // commented by n.o
        // $('html, body').scrollTop(-1);

        // video container
        var div = document.createElement('div');
        div.classList.add('videoBG');
        div.style.position = options.position;
        div.style.zIndex = options.zIndex;
        div.style.top = 0;
        div.style.left = 0;
        div.style.height = options.height + 'px';
        div.style.width = options.width + 'px';
        div.style.opacity = options.opacity;
        div.style.overflow = 'hidden';
        // video element
        var video = document.createElement('video');
        video.style.position = 'relative';
        video.style.zIndex = options.zIndex;
        video.style.poster = options.poster;
        video.style.top = 0;
        video.style.left = 0;
        video.style.minHeight = '100%';
        video.style.minWidth = '100%';
        video.setAttribute('autoplay', options.autoplay);
        video.setAttribute('loop', options.loop);
        video.setAttribute('muted', options.muted);

        if (options.volume > 0) {
            video.setAttribute('volume', options.volume);
        } else {
            video.setAttribute('volume', 0);
        }

        // if fullscreen
        if (options.fullscreen) {
            video.bind('canplay', function () {
                // set the aspect ratio
                video.aspectRatio = video.offsetWidth / video.offsetHeight;
                window.videoBG.setFullscreen(video);
            });

            // listen out for screenresize
            var resizeTimeout;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function () {
                    window.videoBG.setFullscreen(video);
                }, 100);
            });
            window.videoBG.setFullscreen(video);
        }

        // if meant to loop
        if (options.loop) {
            var loops_left = options.loop;

            // cant use the loop attribute as firefox doesnt support it
            video.bind('ended', function () {
                // if we have some loops to throw
                if (loops_left) {
                    // replay
                    video.play();
                }

                /* if not forever*/
                if (loops_left !== true) {
                    /* one less loop*/
                    loops_left--;
                }
            });
        }

        // when can play, play
        video.bind('canplay', function () {
            if (options.autoplay) {
                // replay
                video.play();
            }
        });

        // if supports video
        if (window.videoBG.supportsVideo()) {
            // supports webm
            if (window.videoBG.supportType('webm') && options.webm != '') {
                // play webm
                video.setAttribute('src', options.webm);
            } else if (window.videoBG.supportType('mp4') && options.mp4 != '') {
                // supports mp4
                // play mp4
                video.setAttribute('src', options.mp4);

                // $video.html('<source src="'.options.mp4.'" />');
            } else {
                // throw ogv at it then
                // play ogv
                video.setAttribute('src', options.ogv);
            }
        }

        // image for those that dont support the video
        var img = document.createElement('img');
        img.setAttribute('src', options.poster);
        img.style.position = 'absolute';
        img.style.zIndex = options.zIndex;
        img.style.top = 0;
        img.style.left = 0;
        img.style.minHeight = '100%';
        img.style.minWidth = '100%';

        // add the image to the video
        // if suuports video
        if (window.videoBG.supportsVideo()) {
            // add the video to the wrapper
            div.insertAdjacentElement('beforeend', video);
        } else {
            // nope - whoa old skool
            // add the image instead
            div.insertAdjacentElement('beforeend', img);
        }

        // if text replacement
        if (options.textReplacement) {
            // force the heights and widths
            div.style.minHeight = '1px';
            div.style.minWidth = '1px';
            video.style.minHeight = '1px';
            video.style.minWidth = '1px';
            img.style.minHeight = '1px';
            img.style.minWidth = '1px';

            div.style.height = options.height + 'px';
            div.style.width = options.width + 'px';
            video.style.height = options.height + 'px';
            video.style.width = options.width + 'px';
            img.style.height = options.height + 'px';
            img.style.width = options.width + 'px';
        }

        if (window.videoBG.supportsVideo()) {
            // v.play();
        }
        return div;
    };

    // check if supported video
    window.videoBG.supportsVideo = function () {
        return document.createElement('video').canPlayType;
    };

    // check which type is supported
    window.videoBG.supportType = function (str) {
        // if not at all supported
        if (!window.videoBG.supportsVideo()) {
            return false;
        }

        // create video
        var v = document.createElement('video');

        // check which?
        switch (str) {
            case 'webm':
                return v.canPlayType('video/webm; codecs="vp8, vorbis"');
            case 'mp4':
                return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
            case 'ogv':
                return v.canPlayType('video/ogg; codecs="theora, vorbis"');
        }
        /* nope*/
        return false;
    };

    // get the overlay wrapper
    window.videoBG.wrapper = function () {
        var wrap = document.createElement('div');
        wrap.classList.add('videoBG_wrapper');
        wrap.style.position = 'absolute';
        wrap.style.top = 0;
        wrap.style.left = 0;
        return wrap;
    };

    // these are the defaults
    window.videoBG.defaults = {
        mp4: '',
        ogv: '',
        webm: '',
        poster: '',
        autoplay: true,
        loop: true,
        scale: false,
        position: 'absolute',
        opacity: 1,
        textReplacement: false,
        zIndex: 0,
        width: 0,
        height: 0,
        fullscreen: false,
        imgFallback: true,
    };
})();

/**
 * 
 * @param {HTMLElement} video - current video
 * @param {number} height - current video height
 */
function setWidthHeightHTMLVideo(video, height) {
    // eslint-disable-next-line no-console
    // console.log('setWidthHeightHTMLVideo:' + height);
    var el = video.closest('.t-cover__carrier');
    height = height + '';
    var iframe = el.querySelector('video');
    var nocover = el.getAttribute('data-content-video-nocover');
    var customratio = el.getAttribute('data-content-video-ratio');
    var video_ratio = 0.5625;
    if (customratio && !isNaN(Number(customratio)) && Number(customratio) > 0) {
        video_ratio = parseFloat(customratio);
    }

    if (nocover != 'yes') {
        if (!height) {
            height = '100vh';
        }
        if (height.indexOf('vh') !== -1) {
            var wh = window.innerHeight;
            var parsedHeight = parseInt(height) || 0;
            var div_height = Math.floor(wh * (parsedHeight / 100));
        } else {
            var div_height = parseInt(height) || 0;
        }
        var div_width = window.innerWidth;
        var video_width = div_width;
        var video_height = video_width * video_ratio;


        var vw2 = video_width;
        var vh2 = video_height;
        var vh3 = video_height;
        var delta_coef = 1;

        // count delt_coef if video height less than div height
        if (vh3 < div_height) {
            if (video_height < div_height) {
                var delta_coef = div_height / video_height + 0.02;
            } else {
                var delta_coef = video_height / div_height + 0.02;
            }
        }

        var zoom_video_width = Math.floor(vw2 * delta_coef);
        var zoom_video_height = Math.floor(vh2 * delta_coef);

        var heightDelta = zoom_video_height - div_height;
        var widthDelta = zoom_video_width - div_width;

        iframe.style.height = zoom_video_height + 'px';
        iframe.style.width = zoom_video_width + 'px';
        video.style.height = zoom_video_height + 'px';
        video.style.width = zoom_video_width + 'px';

        if (heightDelta > 0) {
            iframe.style.marginTop = -Math.floor(heightDelta / 2) + 'px';
        } else {
            iframe.style.marginTop = 0;
        }
        if (widthDelta > 0) {
            iframe.style.marginLeft = -Math.floor(widthDelta / 2) + 'px';
        } else {
            iframe.style.marginLeft = 0;
        }
    } else {
        var video_height;
        if (!height) {
            video_height = Math.floor(el.offsetWidth * video_ratio);
        }
        if (height && height.indexOf('vh') > -1) {
            var parsedHeight = parseInt(height) || 0;
            video_height = Math.floor(window.innerHeight * (parsedHeight / 100));
        } else if (height) {
            video_height = parseInt(height) || 0;
        }

        iframe.style.width = '100%';
        iframe.style.height = video_height + 'px';
    }
}

/**
 * @param {string} src - link to video
 * @param {string} nocover - nocover param
 * @param {string} nomute - nomute param
 * @returns {string} - transformed src
 */
function processSrc(src, nocover, nomute) {
    if (src.indexOf('https://www.youtube.com/embed') === -1) {
        src = 'https://www.youtube.com/embed' + (src[0] === '/' ? src : '/' + src);
    }

    if (src.indexOf('?') !== -1) {
        src += '&';
    } else {
        src += '?';
    }

    var extractVideoId = function (src) {
        var parts = src.split('/'),
            neededPart = null;
        for (var i = 0, l = parts.length; i < l; i++) {
            if (parts[i] === 'embed') {
                neededPart = parts[i + 1];
            }
        }
        if (neededPart.indexOf('?') !== -1) {
            neededPart = neededPart.split('?')[0];
        }
        return neededPart;
    };
    var currentLocation = location.protocol + '//' + location.host;

    if (nocover != 'yes') {
        src =
            (src[src.length - 1] == '/' ? src : src) +
            'autoplay=1&loop=1&enablejsapi=1&&playerapiid=featuredytplayer&controls=0&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&theme=light&wmode=transparent&origin=' +
            currentLocation +
            '&playlist=' +
            extractVideoId(src);
    } else {
        src =
            (src[src.length - 1] == '/' ? src : src) +
            'autoplay=0&loop=0&enablejsapi=1&&playerapiid=featuredytplayer&controls=1&modestbranding=1&rel=0&showinfo=0&color=black&iv_load_policy=3&theme=dark&wmode=transparent&origin=' +
            currentLocation;
    }

    if (nomute !== 'yes') {
        src += '&mute=1';
    }

    return src;
}

/**
 * @param {HTMLElement} div - created div element
 * @param {object} player - current player
 * @param {string} nomute - nomute param
 */
function onYouTubePlayerReady_do(div, player, nomute) {
    window.addEventListener('scroll', t_videoProcessor__createEventOnScroll(div, player, nomute));
    t_videoProcessor__createEventOnScroll(div, player, nomute);
}

/**
 * @param {HTMLElement} div - created div element
 * @param {object} player - current player
 * @param {string} nomute - nomute param
 */
function t_videoProcessor__createEventOnScroll(div, player, nomute) {
    var timer;
    var timer_count = 0;
    if (timer) {
        window.clearTimeout(timer);
        if (timer_count >= 15) {
            timer_player_do(div, player, nomute);
            timer_count = 0;
        }
        timer_count++;
    }
    timer = window.setTimeout(function () {
        timer_player_do(div, player, nomute);
        timer_count = 0;
    }, 100);
}

/**
 * 
 * @param {HTMLElement} frame - created div element
 * @param {object} player - current player
 * @param {string} nomute - nomute param
 */
function timer_player_do(frame, player, nomute) {
    var frameOffsetTop = frame.getBoundingClientRect().top + window.pageYOffset;
    var frameWidth = frame.offsetWidth;
    var windowTopPos = window.pageYOffset;
    var viewportHeight = window.innerHeight;
    var playerState = player.getPlayerState();

    if (windowTopPos + viewportHeight > frameOffsetTop
        && windowTopPos <= frameOffsetTop + frameWidth) {
        if (playerState !== 1) {
            player.playVideo();
        }
        if (nomute == 'yes') {
            if (windowTopPos > frameOffsetTop + frameWidth - 100) {
                player.setVolume(30);
            } else if (windowTopPos > frameOffsetTop + frameWidth - 200) {
                player.setVolume(70);
            } else if (windowTopPos + viewportHeight < frameOffsetTop + 200) {
                player.setVolume(30);
            } else {
                player.setVolume(100);
            }
        }
    } else if (windowTopPos + viewportHeight < frameOffsetTop && windowTopPos + viewportHeight > frameOffsetTop - 500) {
        if (playerState !== 2) {
            player.playVideo();
            player.pauseVideo();
        }
    } else if (windowTopPos > frameOffsetTop + frameWidth && windowTopPos < frameOffsetTop + frameWidth + 500) {
        if (playerState !== 2) {
            player.pauseVideo();
        }
    } else if (playerState !== 2) {
        player.pauseVideo();
    }
}

/**
 * load youtube api
 */
function load_youtube_api() {
    if (window.loadytapi_flag !== 'yes') {
        window.loadytapi_flag = 'yes';
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

/**
 * emulate promise
 * 
 * @param {Function} funcName - if current function is function
 * @param {Function} okFunc - do okFunc
 * @param {number} time - duration
 */
function t_onFuncLoad(funcName, okFunc, time) {
    if (typeof funcName === 'function') {
        okFunc();
    } else {
        var startTime = Date.now();
        setTimeout(function checkFuncExist() {
            var currentTime = Date.now();
            if (typeof funcName === 'function') {
                okFunc();
                return;
            }
            if (document.readyState === 'complete' && currentTime - startTime > 5000 && typeof funcName !== 'function') {
                throw new Error(funcName + ' is undefined');
            }
            setTimeout(checkFuncExist, time || 100);
        });
    }
}

/**
 * @param {HTMLElement} el - current element
 * @param {number} height - height
 */
function setWidthHeightYoutubeVideo(el, height) {
    //TODO с video-processor взаимодействует скрипт tilda-cover, который на jquery, поэтому делаем проверку на элемент/nodeList
    el = el instanceof HTMLElement ? el : el[0];
    var iframe = el.querySelector('iframe');
    var nocover = el.getAttribute('data-content-video-nocover');
    var noadcut = el.getAttribute('data-content-video-noadcut-youtube');
    var customratio = el.getAttribute('data-content-video-ratio');

    var video_ratio = 0.5625;
    if (customratio && !isNaN(Number(customratio)) && customratio > 0) video_ratio = parseFloat(customratio);

    if (nocover != 'yes') {
        if (!height) {
            height = '100vh';
        }
        if (height.indexOf('vh') !== -1) {
            var wh = window.innerHeight;
            var parsedHeight = parseInt(height) || 0;
            var div_height = Math.floor(wh * (parsedHeight / 100));
        } else {
            var div_height = parseInt(height) || 0;
        }
        var div_width = window.innerWidth;
        var video_width = div_width;
        var video_height = video_width * video_ratio;

        var vw2 = video_width;
        var vh2 = video_height;
        var vh3 = video_height;
        var delta_coef = 1;

        if (noadcut != 'yes') {
            vh2 = vh2 + 110 + 110;
            vh3 = video_height - 220;
        }

        // count delt_coef if video height less than div height
        if (vh3 < div_height) {
            if (video_height < div_height) {
                var delta_coef = div_height / video_height + 0.02;
            } else {
                var delta_coef = video_height / div_height + 0.02;
            }
        }

        var zoom_video_width = Math.floor(vw2 * delta_coef);
        var zoom_video_height = Math.floor(vh2 * delta_coef);

        var heightDelta = zoom_video_height - div_height;
        var widthDelta = zoom_video_width - div_width;

        iframe.style.height = zoom_video_height + 'px';
        iframe.style.width = zoom_video_width + 'px';

        if (heightDelta > 0) {
            iframe.style.marginTop = -Math.floor(heightDelta / 2) + 'px';
        }
        if (widthDelta > 0) {
            iframe.style.marginLeft = -Math.floor(widthDelta / 2) + 'px';
        }
    } else {
        var video_height;
        if (!height) {
            video_height = Math.floor(el.offsetWidth * video_ratio);
        }
        if (height && height.indexOf('vh') > -1) {
            var parsedHeight = parseInt(height) || 0;
            video_height = Math.floor(window.innerHeight * (parsedHeight / 100));
        } else if (height) {
            video_height = parseInt(height) || 0;
        }

        iframe.style.width = '100%';
        iframe.style.height = video_height + 'px';
    }
}


(function () {
    /**
     * video load processor
     */
    function VideoLoadProcessor() {
        this.setScrollListener();
    }

    VideoLoadProcessor.prototype.videoTags = [];
    VideoLoadProcessor.prototype.defaultConfig = {
        isNeedStop: false,
    };
    VideoLoadProcessor.prototype.videoConfigs = [];
    VideoLoadProcessor.prototype.registerNewVideo = function (video, config) {
        if (!(video instanceof HTMLVideoElement)) {
            throw new Error('Wrong tag passed into registerNewVideo');
        }
        if (this.videoTags.indexOf(video) === -1) {
            this.videoTags.push(video);
            this.videoConfigs.push(typeof config == 'undefined' ? this.defaultConfig : config);
            this.scrollCb('', true);
            return true;
        }
        return false;
    };

    VideoLoadProcessor.prototype.unergisterVideo = function (video) {
        if (!(video instanceof HTMLVideoElement)) {
            throw new Error('Wrong tag passed into unregisterNewVideo');
        }
        var index;
        if ((index = this.videoTags.indexOf(video)) !== -1) {
            if (typeof video.remove == 'function') {
                if (video.parentNode !== null) {
                    video.parentNode.removeChild(video);
                }
            } else if (video.parentNode) {
                video.parentNode.removeChild(video);
            }
            this.pauseVideo(video, this.videoConfigs[index]);
            this.videoTags.splice(index, 1);
            this.videoConfigs.splice(index, 1);
            return true;
        }
        return false;
    };

    VideoLoadProcessor.prototype.pauseVideo = function (video, config) {
        if (!config) {
            throw new Error('Wrong config type!');
        }
        video.pause();
        if (config.isNeedStop) {
            video.load();
        }
    };

    VideoLoadProcessor.prototype.setScrollListener = function () {
        window.addEventListener('scroll', t_throttle(this.scrollCb.bind(this), 200));
    };

    VideoLoadProcessor.prototype.scrollCb = function (e, firstInvoke) {
        var windowHeight = window.innerHeight;
        var _v = null;
        var _vrect;
        for (var i = 0, l = this.videoTags.length; i < l; i++) {
            (_v = this.videoTags[i]), (_vrect = this.getVideoBoundingRect(_v, false));
            /* set fade volume */
            if (Math.abs(_vrect.top) < windowHeight && Math.abs(_vrect.top) > windowHeight / 2) {
                var vol = 1 - (Math.abs(_vrect.top) - windowHeight / 2) / (windowHeight / 2) - 0.2;
                if (vol > 0 && vol <= 1 && _v.volume != 0) {
                    _v.volume = vol;
                }
            }
            /* then pause              */
            if (Math.abs(_vrect.top) > windowHeight || _vrect.height == 0 /*display : none*/) {
                this.pauseVideo(_v, this.videoConfigs[i]);
                continue;
            }

            if (firstInvoke) {
                _v.play();
            }

            if (_v.paused && _v.loop) {
                _v.play();
            }
        }
    };

    VideoLoadProcessor.prototype.getVideoObject = function (video) {
        var l = this.videoTags.length;
        //TODO условие раньше было i > l, это не ошибка?
        for (var i = 0; i < l; i++) {
            var vo = this.videoTags[i];
            if (vo.v === video) {
                return vo;
            }
        }
        return null;
    };

    VideoLoadProcessor.prototype.getVideoBoundingRect = function (video, isNeedParent) {
        if (typeof isNeedParent == 'undefined') {
            isNeedParent = true;
        }
        var parent = null;
        if (isNeedParent) {
            parent = video.closest('.r');
            if (!parent) {
                parent = video;
            }
        } else {
            parent = video;
        }
        return parent.getBoundingClientRect();
    };
    window.videoLoadProcessor = new VideoLoadProcessor();
})();

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