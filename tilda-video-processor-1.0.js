/**
 * @VideoBG function preserve Copyright 2011 Syd Lawrence ( www.sydlawrence.com ). Version: 0.2
 * Licensed under MIT and GPLv2.
 */

(function ($) {
    var def = $.Deferred();
    window.processYoutubeVideo = function (div, height) {
        load_youtube_api();

        var defFunc = function () {
            var el = $(div);
            var src = el.attr('data-content-video-url-youtube');
            var nomute = el.attr('data-content-video-nomute');
            var noloop = el.attr('data-content-video-noloop');
            var nocover = el.attr('data-content-video-nocover');

            var iframe = document.createElement('iframe');
            iframe.src = processSrc(src, nocover, nomute);
            iframe.frameBorder = 0;
            iframe.allow = 'autoplay';

            var playtimer;
            div.appendChild(iframe);
            if (!window.isMobile) {
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
                                    $('html, body').scrollTop(sp);
                                    delete window.fix_scrolltop_beforestop_youtube;
                                }
                            }
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

            setWidthHeightYoutubeVideo(el, height);
        };
        def.then(defFunc);
    };

    window.onYouTubeIframeAPIReady = function () {
        def.resolve();
    };

    $.fn.videoBG = function (selector, options) {
        var options = {};
        if (typeof selector == 'object') {
            options = $.extend({}, $.fn.videoBG.defaults, selector);
        } else if (!selector) {
            options = $.fn.videoBG.defaults;
        } else {
            return $(selector).videoBG(options);
        }

        var container = $(this);

        /* check if elements available otherwise it will cause issues*/
        if (!container.length) {
            return;
        }

        /* container to be at least relative*/
        if (container.css('position') == 'static' || !container.css('position')) {
            container.css('position', 'relative');
        }

        /* we need a width*/
        if (options.width == 0) {
            options.width = container.width();
        }

        /* we need a height*/
        if (options.height == 0) {
            options.height = container.height();
        }

        /* get the wrapper*/
        /*
		var wrap = $.fn.videoBG.wrapper();
		wrap.height(options.height)
			.width(options.width);
		*/
        /* if is a text replacement*/
        if (options.textReplacement) {
            /* force sizes*/
            options.scale = true;

            /* set sizes and forcing text out*/
            container.width(options.width).height(options.height).css('text-indent', '-9999px');
        } else {
            /* set the wrapper above the video*/
            /*
			wrap.css('z-index',options.zIndex+1);
			*/
        }

        /* move the contents into the wrapper
		// commented by n.o
		//wrap.html(container.clone(true));*/

        /* get the video*/
        var video = $.fn.videoBG.video(options);

        /* if we are forcing width / height */
        if (options.scale) {
            /* overlay wrapper*/
            /*
			wrap.height(options.height)
				.width(options.width);
			*/

            /* video*/
            video.height(options.height).width(options.width);
        }

        /* add it all to the container*/
        /*
		container.html(wrap);
		*/
        container.append(video);

        if (typeof container.attr('data-content-video-nomute') === 'undefined') {
            container.find('video').prop('muted', 'true');
        }

        setWidthHeightHTMLVideo(video, options.height);

        return video.find('video')[0];
    };

    /* set to fullscreen*/
    $.fn.videoBG.setFullscreen = function ($el) {
        var windowWidth = $(window).width(),
            windowHeight = $(window).height();

        $el.css('min-height', 0).css('min-width', 0);
        $el.parent().width(windowWidth).height(windowHeight);
        /* if by width */
        if (windowWidth / windowHeight > $el.aspectRatio) {
            $el.width(windowWidth).height('auto');
            /* shift the element up*/
            var height = $el.height();
            var shift = (height - windowHeight) / 2;
            if (shift < 0) {
                shift = 0;
            }
            $el.css('top', -shift);
        } else {
            $el.width('auto').height(windowHeight);
            /* shift the element left*/
            var width = $el.width();
            var shift = (width - windowWidth) / 2;
            if (shift < 0) {
                shift = 0;
            }
            $el.css('left', -shift);

            /* this is a hack mainly due to the iphone*/
            if (shift === 0) {
                setTimeout(function () {
                    $.fn.videoBG.setFullscreen($el);
                }, 500);
            }
        }

        $('body > .videoBG_wrapper').width(windowWidth).height(windowHeight);
    };

    /* get the formatted video element*/
    $.fn.videoBG.video = function (options) {
        /*commented by n.o*/
        /*$('html, body').scrollTop(-1);*/

        /* video container*/
        var $div = $('<div/>');
        $div.addClass('videoBG')
            .css('position', options.position)
            .css('z-index', options.zIndex)
            .css('top', 0)
            .css('left', 0)
            .css('height', options.height)
            .css('width', options.width)
            .css('opacity', options.opacity)
            .css('overflow', 'hidden');

        /* video element*/
        var $video = $('<video/>');
        $video
            .css('position', 'relative')
            .css('z-index', options.zIndex)
            .attr('poster', options.poster)
            .css('top', 0)
            .css('left', 0)
            .css('min-width', '100%')
            .css('min-height', '100%');

        $video.prop('autoplay', options.autoplay);
        $video.prop('loop', options.loop);
        $video.prop('muted', options.muted);

        if (options.volume > 0) {
            $video.prop('volume', options.volume);
        } else {
            $video.prop('volume', 0);
        }

        /* if fullscreen*/
        if (options.fullscreen) {
            $video.bind('canplay', function () {
                /* set the aspect ratio*/
                $video.aspectRatio = $video.width() / $video.height();
                $.fn.videoBG.setFullscreen($video);
            });

            /* listen out for screenresize*/
            var resizeTimeout;
            $(window).resize(function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function () {
                    $.fn.videoBG.setFullscreen($video);
                }, 100);
            });
            $.fn.videoBG.setFullscreen($video);
        }

        /* video standard element*/
        var v = $video[0];

        /* if meant to loop*/
        if (options.loop) {
            var loops_left = options.loop;

            /* cant use the loop attribute as firefox doesnt support it*/
            $video.bind('ended', function () {
                /* if we have some loops to throw*/
                if (loops_left) {
                    /* replay that bad boy*/
                    v.play();
                }

                /* if not forever*/
                if (loops_left !== true) {
                    /* one less loop*/
                    loops_left--;
                }
            });
        }

        /* when can play, play*/
        $video.bind('canplay', function () {
            if (options.autoplay) {
                /* replay that bad boy*/
                v.play();
            }
        });

        /* if supports video*/
        if ($.fn.videoBG.supportsVideo()) {
            /* supports webm*/
            if ($.fn.videoBG.supportType('webm') && options.webm != '') {
                /* play webm*/
                $video.attr('src', options.webm);
            } else if ($.fn.videoBG.supportType('mp4') && options.mp4 != '') {
                /* supports mp4*/
                /* play mp4*/
                $video.attr('src', options.mp4);

                /*	$video.html('<source src="'.options.mp4.'" />');*/
            } else {
                /* throw ogv at it then*/
                /* play ogv*/
                $video.attr('src', options.ogv);
            }
        }

        /* image for those that dont support the video	*/
        var $img = $('<img/>');
        $img.attr('src', options.poster)
            .css('position', 'absolute')
            .css('z-index', options.zIndex)
            .css('top', 0)
            .css('left', 0)
            .css('min-width', '100%')
            .css('min-height', '100%');

        /* add the image to the video*/
        /* if suuports video*/
        if ($.fn.videoBG.supportsVideo()) {
            /* add the video to the wrapper*/
            $div.html($video);
        } else {
            /* nope - whoa old skool*/
            /* add the image instead*/
            $div.html($img);
        }

        /* if text replacement*/
        if (options.textReplacement) {
            /* force the heights and widths*/
            $div.css('min-height', 1).css('min-width', 1);
            $video.css('min-height', 1).css('min-width', 1);
            $img.css('min-height', 1).css('min-width', 1);

            $div.height(options.height).width(options.width);
            $video.height(options.height).width(options.width);
            $img.height(options.height).width(options.width);
        }

        if ($.fn.videoBG.supportsVideo()) {
            /*			v.play();*/
        }
        return $div;
    };

    /* check if suuports video*/
    $.fn.videoBG.supportsVideo = function () {
        return document.createElement('video').canPlayType;
    };

    /* check which type is supported*/
    $.fn.videoBG.supportType = function (str) {
        /* if not at all supported*/
        if (!$.fn.videoBG.supportsVideo()) {
            return false;
        }

        /* create video*/
        var v = document.createElement('video');

        /* check which?*/
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

    /* get the overlay wrapper*/
    $.fn.videoBG.wrapper = function () {
        var $wrap = $('<div/>');
        $wrap.addClass('videoBG_wrapper').css('position', 'absolute').css('top', 0).css('left', 0);
        return $wrap;
    };

    /* these are the defaults*/
    $.fn.videoBG.defaults = {
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
})(jQuery);

function setWidthHeightHTMLVideo(video, height) {
    // eslint-disable-next-line no-console
    console.log('setWidthHeightHTMLVideo:' + height);
    var el = video.closest('.t-cover__carrier');
    height = height + '';
    var iframe = el.find('video');
    var nocover = el.attr('data-content-video-nocover');
    var customratio = el.attr('data-content-video-ratio');
    var video_ratio = 0.5625;
    if (customratio > 0) video_ratio = parseFloat(customratio) * 1;

    if (nocover != 'yes') {
        if (!height) {
            height = '100vh';
        }
        if (height.indexOf('vh') > -1) {
            var wh = window.innerHeight;
            if (!wh) {
                wh = $(window).height();
            }
            var div_height = Math.floor(wh * (parseInt(height) / 100));
        } else {
            var div_height = parseInt(height);
        }
        var div_width = Math.floor(parseInt(window.innerWidth));
        if (!div_width) {
            div_width = $(window).width();
        }
        var video_width = div_width;
        var video_height = video_width * video_ratio;


        var vw2 = video_width;
        var vh2 = video_height;
        var vh3 = video_height;
        var delta_coef = 1;

        /* count delt_coef if video height less than div height*/
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

        iframe.height(zoom_video_height + 'px');
        iframe.width(zoom_video_width + 'px');
        video.height(zoom_video_height + 'px');
        video.width(zoom_video_width + 'px');

        if (heightDelta > 0) {
            iframe.css('margin-top', -Math.floor(heightDelta / 2) + 'px');
        } else {
            iframe.css('margin-top', 0);
        }
        if (widthDelta > 0) {
            iframe.css('margin-left', -Math.floor(widthDelta / 2) + 'px');
        } else {
            iframe.css('margin-left', 0);
        }
    } else {
        var video_height;
        if (!height) {
            video_height = Math.floor(el.width() * video_ratio);
        }
        if (height && height.indexOf('vh') > -1) {
            video_height = Math.floor(window.innerHeight * (parseInt(height) / 100));
        } else if (height) {
            video_height = parseInt(height);
        }

        iframe.css('width', '100%');
        iframe.height(video_height + 'px');
    }
}

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

function onYouTubePlayerReady_do(div, player, nomute) {
    var timer;
    var wnd = $(window);
    var frame = $(div);
    var timer_count = 0;

    wnd.scroll(function () {
        if (timer) {
            window.clearTimeout(timer);
            if (timer_count >= 15) {
                timer_player_do(frame, wnd, player, nomute);
                timer_count = 0;
            }
            timer_count++;
        }

        timer = window.setTimeout(function () {
            timer_player_do(frame, wnd, player, nomute);
            timer_count = 0;
        }, 100);
    });

    wnd.scroll();
}

function timer_player_do(frame, wnd, player, nomute) {
    var a, b, c, d, s;

    a = frame.offset().top;
    b = frame.height();

    c = wnd.scrollTop();
    d = wnd.height();

    s = player.getPlayerState();

    if (c + d > a && c <= a + b) {
        if (s !== 1) {
            player.playVideo();
        }
        if (nomute == 'yes') {
            if (c > a + b - 100) {
                player.setVolume(30);
            } else if (c > a + b - 200) {
                player.setVolume(70);
            } else if (c + d < a + 200) {
                player.setVolume(30);
            } else {
                player.setVolume(100);
            }
        } else {
            /* console.log("no"); */
        }
    } else if (c + d < a && c + d > a - 500) {
        if (s !== 2) {
            player.playVideo();
            player.pauseVideo();
        }
    } else if (c > a + b && c < a + b + 500) {
        if (s !== 2) {
            player.pauseVideo();
        }
    } else if (s !== 2) {
        player.pauseVideo();
    }
}

function load_youtube_api() {
    if (window.loadytapi_flag !== 'yes') {
        window.loadytapi_flag = 'yes';
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

function setWidthHeightYoutubeVideo(el, height) {
    // eslint-disable-next-line no-console
    console.log('setWidthHeightYoutubeVideo:' + height);
    // Для совместимости со скиптами переписанными на Vanilla JS
	el = $(el);
    var iframe = el.find('iframe');
    var nocover = el.attr('data-content-video-nocover');
    var noadcut = el.attr('data-content-video-noadcut-youtube');
    var customratio = el.attr('data-content-video-ratio');

    var video_ratio = 0.5625;
    if (customratio > 0) video_ratio = parseFloat(customratio) * 1;

    if (nocover != 'yes') {
        if (!height) {
            height = '100vh';
        }
        if (height.indexOf('vh') > -1) {
            var wh = window.innerHeight;
            if (!wh) {
                wh = $(window).height();
            }
            var div_height = Math.floor(wh * (parseInt(height) / 100));
        } else {
            var div_height = parseInt(height);
        }
        var div_width = Math.floor(parseInt(window.innerWidth));
        if (!div_width) {
            div_width = $(window).width();
        }
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

        /* count delt_coef if video height less than div height*/
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

        iframe.height(zoom_video_height + 'px');
        iframe.width(zoom_video_width + 'px');

        if (heightDelta > 0) {
            iframe.css('margin-top', -Math.floor(heightDelta / 2) + 'px');
        }
        if (widthDelta > 0) {
            iframe.css('margin-left', -Math.floor(widthDelta / 2) + 'px');
        }
    } else {
        var video_height;
        if (!height) {
            video_height = Math.floor(el.width() * video_ratio);
        }
        if (height && height.indexOf('vh') > -1) {
            video_height = Math.floor(window.innerHeight * (parseInt(height) / 100));
        } else if (height) {
            video_height = parseInt(height);
        }

        iframe.css('width', '100%');
        iframe.height(video_height + 'px');
    }
}


(function ($) {
    /**
     * @constructor
     */
    function VideoLoadProcessor() {
        this.setScrollListener();
    }

    VideoLoadProcessor.prototype.videoTags = [];
    VideoLoadProcessor.prototype.defaultConfig = {
        isNeedStop: false,
    };
    VideoLoadProcessor.prototype.videoConfigs = [];
    /**
     * @param {HTMLVideoElement} video
     * @param {{} | Undefined} config
     */
    VideoLoadProcessor.prototype.registerNewVideo = function (video, config) {
        if (!(video instanceof HTMLVideoElement)) {
            throw new Error('Wrong tag passed into registerNewVideo');
        }
        if (this.videoTags.indexOf(video) == -1) {
            this.videoTags.push(video);
            this.videoConfigs.push(typeof config == 'undefined' ? this.defaultConfig : config);
            this.scrollCb('', true);
            return true;
        }
        return false;
    };
    /**
     * @param {HTMLVideoElement} video
     */
    VideoLoadProcessor.prototype.unergisterVideo = function (video) {
        if (!(video instanceof HTMLVideoElement)) {
            throw new Error('Wrong tag passed into unregisterNewVideo');
        }
        var index;
        if ((index = this.videoTags.indexOf(video)) > -1) {
            if (typeof video.remove == 'function') {
                video.remove();
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
        /* $(window).scroll(jQuery.proxy(this.scrollCb, this)); */
        $(window).bind('scroll', t_throttle(jQuery.proxy(this.scrollCb, this), 200));
    };

    VideoLoadProcessor.prototype.scrollCb = function (e, firstInvoke) {
        var windowHeight = $(window).height(),
            _v = null;
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
        for (var i = 0, l = this.videoTags.length; i > l; i++) {
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
            parent = $(video).parents('.r')[0];
            if (!parent) {
                parent = video;
            }
        } else {
            parent = video;
        }
        return parent.getBoundingClientRect();
    };
    window.videoLoadProcessor = new VideoLoadProcessor();
})(jQuery);