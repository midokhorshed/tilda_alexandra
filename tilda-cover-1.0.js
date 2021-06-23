/**
 * Parallax function created by alex on 7/4/14.
 */

(function ($) {
    var $window = $(window);
    var windowHeight = $window.height();

    $window.resize(function () {
        windowHeight = $window.height();
    });

    $.fn.parallax = function (speedFactor, outerHeight) {
        var $this = $(this);
        var getHeight;
        var firstTop;
        var isWebkitTransform = typeof document.body.style['-webkit-transform'] == 'undefined' ? false : true;
        if (isWebkitTransform) {
            $this.css('position', 'relative');
        }

        /*get the starting position of each element to have parallax applied to it*/

        window.correctFirstTop4Parallax = function () {
            $this.each(function () {
                firstTop = $this.offset().top;
            });
        };

        window.correctFirstTop4Parallax();

        if (outerHeight) {
            getHeight = function (jqo) {
                return jqo.outerHeight(true);
            };
        } else {
            getHeight = function (jqo) {
                return jqo.height();
            };
        }

        /* setup defaults if arguments aren't specified*/
        if (arguments.length < 1 || speedFactor === null) {
            speedFactor = 0.1;
        }
        if (arguments.length < 2 || outerHeight === null) {
            outerHeight = true;
        }
        /* function to be called whenever the window is scrolled or resized*/
        function update() {
            var pos = $window.scrollTop();
            $this.each(function () {
                var $element = $(this);
                var top = $element.offset().top;
                var height = getHeight($element);
                var rect = this.getBoundingClientRect();
                /*                var backgroundVerticalShift = -Math.abs(Math.round((firstTop - pos) * speedFactor));*/
                /* Check if totally above or totally below viewport*/
                if (top + height < pos || top > pos + windowHeight) {
                    return;
                }
                var backgroundVerticalShift = -1 * Math.round(rect.top * speedFactor);
                if (isWebkitTransform) {
                    this.style['-webkit-transform'] = 'translateY(' + backgroundVerticalShift + 'px)';
                } else {
                    this.style['top'] = backgroundVerticalShift + 'px';
                }
            });
        }
        update();
        $(window).resize(window.correctFirstTop4Parallax);
        $window.bind('scroll', update).resize(update);
        if (document.readyState !== 'complete') {
            window.addEventListener('load', function () {
                update();
            });
        }
    };
})(jQuery);


(function ($) {
    window.cover_init = function (id) {
        $(document).ready(function () {

            var cover_carrier = document.body.querySelector('#coverCarry' + id);
            var el = $(cover_carrier);

            var backgroundurl = el.attr('data-content-cover-bg');
            var height = el.attr('data-content-cover-height');
            var parallax = el.attr('data-content-cover-parallax');
            var videomp4 = el.attr('data-content-video-url-mp4');
            var videowebm = el.attr('data-content-video-url-webm');
            var youtubeid = el.attr('data-content-video-url-youtube');
            var noloop = el.attr('data-content-video-noloop');
            var nomute = el.attr('data-content-video-nomute');
            var bgbase64 = el.attr('data-content-bg-base64');
            var video_nocover = el.attr('data-content-video-nocover');

            if (!backgroundurl) {
                backgroundurl = '';
            }
            if (!height) {
                height = '';
            }
            if (!parallax) {
                parallax = '';
            }
            if (!videomp4) {
                videomp4 = '';
            }
            if (!videowebm) {
                videowebm = '';
            }
            if (!youtubeid) {
                youtubeid = '';
            }
            if (!noloop) {
                noloop = '';
            }
            if (!nomute) {
                nomute = '';
            }
            if (!youtubeid) {
                youtubeid = '';
            }
            if (!bgbase64) {
                bgbase64 = '';
            }

            if (video_nocover && video_nocover == 'yes') {
                videomp4 = '';
                videowebm = '';
                youtubeid = '';
            }

            if (window.isMobile && (videowebm != '' || videomp4 != '' || youtubeid != '')) {
                el.css('background-image', "url('" + backgroundurl + "')");
            }

            /*fix content height*/
            setTimeout(function () {
                cover_fixcontentheight(id);
                cover_fixBackgroundFixedStyles(id);
            }, 500);
            cover_fixBackgroundFixedNode(id);

            /*fix content height if has a logo inside*/
            var clogo = $('#rec' + id).find('img[data-hook-clogo]');
            if (clogo.length) {
                clogo.load(function () {
                    setTimeout(function () {
                        cover_fixcontentheight(id);
                        cover_fixBackgroundFixedStyles(id);
                    }, 500);
                });
            }

            if (window.isMobile) {
                $(window).on('orientationchange', function () {
                    cover_fixcontentheight(id);
                    cover_fixBackgroundFixedStyles(id);
                });
            }

            /* if set video*/
            if (videomp4 !== '' || videowebm !== '' || youtubeid !== '') {
                if (!window.isMobile) {
                    /* Initializing the videos */
                    if (youtubeid == '' && (videomp4 != '' || videowebm != '')) {
                        el.css('background-color', '#000000');
                        el.css('background-image', "url('https://tilda.ws/img/spinner-white.gif')");
                        el.css('background-size', 'auto');
                        el.attr('data-content-cover-bg', '');
                        var loop = false;
                        if (noloop != '') {
                            loop = false;
                        } else {
                            loop = true;
                        }

                        var muted = true;
                        if (nomute != '') {
                            muted = false;
                        } else {
                            muted = true;
                        }

                        var height_more_vh = '';
                        if (parallax == 'fixed') {
                            if (height.indexOf('vh') > -1) {
                                if (parseInt(height) > 100) {
                                    el.css('height', '100vh');
                                    height_more_vh = 'yes';
                                }
                            }
                            if (height.indexOf('px') > -1) {
                                if (parseInt(height) > $(window).height()) {
                                    el.css('height', '100vh');
                                    height_more_vh = 'yes';
                                }
                            }
                        }

                        var cotimer;
                        var flagprocessed = '';
                        var wnd = $(window);
                        var prnt = el.parent();

                        wnd.scroll(function () {
                            if (cotimer) {
                                window.clearTimeout(cotimer);
                            }

                            cotimer = window.setTimeout(function () {
                                if (!(flagprocessed > 0)) {
                                    var a, b, c, d;

                                    a = el.offset().top;
                                    b = el.height();

                                    c = wnd.scrollTop();
                                    d = wnd.height();

                                    if (c + d > a - 500 && c <= a + b + 500) {
                                        cover_onFuncLoad(el.videoBG, function () {
                                            var vid = el.videoBG({
                                                mp4: videomp4,
                                                webm: videowebm,
                                                poster: '',
                                                preload: 'none',
                                                autoplay: 'true',
                                                loop: loop,
                                                volume: 1,
                                                scale: true,
                                                zIndex: 0,
                                                width: '100%',
                                            });
                                            vid.setAttribute('muted', muted);
                                            vid.setAttribute('playsinline', ''); /* iOS only */

                                            videoLoadProcessor.registerNewVideo(vid);
                                            flagprocessed = 1;
                                        });
                                    }
                                }
                            }, 100);

                            if (parallax == 'fixed' && height_more_vh == 'yes') {
                                var aa, bb, cc, dd;

                                aa = prnt.offset().top;
                                bb = prnt.height();

                                cc = wnd.scrollTop();
                                dd = wnd.height();

                                if (cc >= aa + bb - dd) {
                                    el.css('position', 'absolute');
                                    el.css('bottom', '0px');
                                    el.css('top', 'auto');
                                    /*el.css("vertical-align","bottom");*/
                                } else if (cc >= aa) {
                                    el.css('position', 'fixed');
                                    el.css('top', '0px');
                                } else if (cc < aa) {
                                    el.css('position', 'relative');
                                    el.css('top', 'auto');
                                }
                            }
                        });

                        wnd.scroll();

                        /* Initializing youtube video*/
                    } else if (youtubeid != '') {
                        el.css('background-color', '#000000');
                        el.css('background-image', '');
                        el.attr('data-content-cover-bg', '');
                        var cotimer;
                        var flagprocessed = 0;
                        var wnd = $(window);

                        wnd.scroll(function () {
                            if (cotimer) {
                                window.clearTimeout(cotimer);
                            }

                            cotimer = window.setTimeout(function () {
                                flagprocessed = el.find('iframe').length;
                                if (!(flagprocessed > 0)) {
                                    var a, b, c, d;

                                    a = el.offset().top;
                                    b = el.height();

                                    c = wnd.scrollTop();
                                    d = wnd.height();

                                    if (c + d > a - 500 && c <= a + b + 500) {
                                        processYoutubeVideo(cover_carrier, height);
                                    }
                                }
                            }, 100);
                        });

                        wnd.scroll();
                    }
                }
            }

            if (parallax == 'dynamic') {
                if (!window.isMobile) {
                    var offset = el.offset().top - (el.offset().top - $(window).height());
                    if (el.height() < $(window).height()) {
                        el.height(el.height() + offset * 0.2);
                    }
                    el.parallax(0.2, true);
                }
            }

            if (bgbase64 == 'yes' && backgroundurl != '' && videomp4 == '' && videowebm == '' && youtubeid == '') {
                var bg_already = '';
                $('<img/>')
                    .attr('src', backgroundurl)
                    .load(function () {
                        $(this).remove();
                        el.css('background-image', "url('" + backgroundurl + "')");
                        el.css('opacity', '1');
                        bg_already = 'yes';
                    });
                if (bg_already != 'yes') {
                    el.css('background-image', '');
                    el.css('opacity', '0');
                    el.css('transition', 'opacity 25ms');
                }
            }

            var coverarrow = $('#rec' + id).find('.t-cover__arrow-wrapper');
            if (coverarrow.length > 0) {
                coverarrow.click(function () {
                    var recheight = $('#rec' + id).height();
                    if (recheight > 0) {
                        $('html, body').animate({
                            scrollTop: $('#rec' + id).offset().top + recheight
                        }, 500);
                    }
                });
            }
        });
    };

    $(document).ready(function () {
        var curMode = $('.t-records').attr('data-tilda-mode');
        if (curMode != 'edit') {
            $('.t-cover__carrier').each(function () {
                var id = $(this).attr('data-content-cover-id');
                if (id > 0) {
                    cover_init(id);
                }
            });
        }
    });
})(jQuery);


function cover_fixcontentheight(id) {
    /* correct cover height if content more when cover height */
    var el = $('#rec' + id);
    var hcover = el.find('.t-cover').height();
    var hcontent = el.find('div[data-hook-content]').outerHeight();

    if (hcontent > 300 && hcover < hcontent + 40) {
        var hcontent = hcontent + 120;
        if (hcontent > 1000) {
            hcontent += 100;
        }
        // eslint-disable-next-line no-console
        console.log('auto correct cover height: ' + hcontent);
        // el.find('.t-cover').height(hcontent);
        // el.find('.t-cover__filter').height(hcontent);
        // el.find('.t-cover__carrier').height(hcontent);
        // el.find('.t-cover__wrapper').height(hcontent);
        el.find('.t-cover').css('min-height', hcontent);
        el.find('.t-cover__filter').css('min-height', hcontent);
        el.find('.t-cover__carrier').css('min-height', hcontent);
        el.find('.t-cover__wrapper').css('min-height', hcontent);

        if (!window.isMobile) {
            setTimeout(function () {
                var divvideo = el.find('.t-cover__carrier');
                if (divvideo.find('iframe').length > 0) {
                    // eslint-disable-next-line no-console
                    console.log('correct video from cover_fixcontentheight');
                    setWidthHeightYoutubeVideo(divvideo, hcontent + 'px');
                }
                if (divvideo.find('video').length > 0) {
                    // eslint-disable-next-line no-console
                    console.log('correct html5video from cover_fixcontentheight');
                    /* n: need to dev */
                    /* setWidthHeightHTMLVideo(divvideo, hcontent); */
                }
            }, 2000);
        }
        if (typeof window.t_lazyload_updateResize_elem === 'function') {
            try {
                window.t_lazyload_updateResize_elem(el.find('.t-cover__carrier'));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log('error:' + e);
            }
        }
    }
}


function cover_checkIsFixForBackgroundNeeded(id) {
    var rec = document.body.querySelector('#rec' + id);
    if (!rec) {
        return;
    }
    var coverCarrier = rec.querySelector('.t-cover__carrier');
    var youtubeUrl;
    var mp4Url;
    var webmUrl;
    if (coverCarrier !== null) {
        youtubeUrl = coverCarrier.getAttribute('data-content-video-url-youtube');
        mp4Url = coverCarrier.getAttribute('data-content-video-url-mp4');
        webmUrl = coverCarrier.getAttribute('data-content-video-url-webm');
    }
    var is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var isMobile = window.isMobile || (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document); // fix for ios13+
    if (
        !isMobile &&
        is_safari &&
        !youtubeUrl &&
        !mp4Url &&
        !webmUrl &&
        coverCarrier &&
        coverCarrier.getAttribute('data-content-cover-parallax') === 'fixed' &&
        !window['cover' + id + 'fixbackgroundstyles']
    ) {
        return true;
    } else {
        return false;
    }
}


function cover_fixBackgroundFixedNode(id) {
    if (cover_checkIsFixForBackgroundNeeded(id)) {
        var rec = document.body.querySelector('#rec' + id);
        var parent = document.body.querySelector('#rec' + id + ' .t-cover').parentNode;
        // eslint-disable-next-line no-console
        console.log('new fix node background-position: fixed');
        if (!window.cover_fixBackgroundStyles) {
            var css =
                '.t-cover__container {position: relative;}.t-cover__container .t-cover {clip: rect(0, auto, auto, 0);position: absolute;top: 0;left: 0;width: 100%;height: 100% !important;}.t-cover__container .t-cover .t-cover__carrier {position: fixed;display: block;top: 0;left: 0;width: 100%;height: 100%!important;background-size: cover;background-position: center center;transform: translateZ(0);will-change: transform;}',
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            head.appendChild(style);

            style.type = 'text/css';
            if (style.styleSheet) {
                // This is required for IE8 and below.
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            window.cover_fixBackgroundStyles = true;
        }

        var newWrapper = document.createElement('div');
        newWrapper.classList.add('t-cover__container');
        parent.prepend(newWrapper);

        var cover = rec.querySelector('.t-cover');
        var coverHeight = cover.style.height;
        newWrapper.style.height = coverHeight;
        newWrapper.append(cover);

        // specific covers fixes - with video popup and avatar section
        var specificCovers = {
            275: '.t256__video-container',
            286: '.t266__video-container',
            337: '.t-container',
            906: '.t906__video-container',
        };

        var classContainer = specificCovers[rec.getAttribute('data-record-type')];
        if (classContainer !== undefined) {
            var container = rec.querySelector(classContainer);
            newWrapper.append(container);
        }

        window['cover' + id + 'fixbackgroundnodes'] = true;
    }
}


function cover_fixBackgroundFixedStyles(id) {
    var rec = document.body.querySelector('#rec' + id);

    if (cover_checkIsFixForBackgroundNeeded(id)) {
        // eslint-disable-next-line no-console
        console.log('new fix style background-position: fixed');
        var newWrapper = rec.querySelector('.t-cover__container');
        if (newWrapper !== null) {
            var cover = rec.querySelector('.t-cover');
            var coverHeight = cover.style.height;
            cover.style.height = 0;

            if (newWrapper.style !== null) {
                newWrapper.style.height = coverHeight;
            }


            window['cover' + id + 'fixbackgroundstyles'] = true;
        }
    } else {
        return;
    }
}

function cover_onFuncLoad(funcName, okFunc) {
    if (typeof funcName === 'function') {
        okFunc();
    } else {
        setTimeout(function checkFuncExist() {
            if (typeof funcName === 'function') {
                okFunc();
                return;
            }
            if (document.readyState === 'complete' && typeof funcName !== 'function') {
                throw new Error(funcName + ' is undefined');
            }
            setTimeout(checkFuncExist, 100);
        });
    }
}