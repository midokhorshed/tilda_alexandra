/**
 * tilda-cover create background cover in CR... blocks with some scroll effects (paralax or fixed). In this script placed code, initing smooth scroll on click down arrow. tilda-cover work with images and video.
 */
(function () {
    var windowHeight = window.innerHeight;
    window.addEventListener('resize', function () {
        windowHeight = window.innerHeight;
    });
    // replace $.fn. to window.
    window.parallax = function (el, speedFactor, outerHeight) {
        var getHeight;
        // var firstTop;
        var isWebkitTransform = true;
        if (typeof document.body.style.WebkitTransform === 'undefined') {
            isWebkitTransform = false;
        }
        if (isWebkitTransform) {
            el.style.position = 'relative';
        }

        //get the starting position of each element to have parallax applied to it
        // window.correctFirstTop4Parallax = function () {
        //     firstTop = el.getBoundingClientRect().top + window.pageYOffset;
        // };

        // window.correctFirstTop4Parallax();

        if (outerHeight) {
            getHeight = function (el) {
                var elHeight = el.offsetHeight;
                var elMarginTop = parseInt(el.style.marginTop) || 0;
                var elMarginBottom = parseInt(el.style.marginBottom) || 0;
                return elHeight + elMarginTop + elMarginBottom;
            };
        } else {
            getHeight = function (el) {
                var elHeight = t_cover__getHeightWithoutPadding(el);
                return elHeight;
            };
        }

        // setup defaults if arguments aren't specified
        if (arguments.length < 1 || speedFactor === null) {
            speedFactor = 0.1;
        }
        if (arguments.length < 2 || outerHeight === null) {
            outerHeight = true;
        }

        /**
         * update viewport offset on scroll or resize (function to be called whenever the window is scrolled or resized)
         * 
         * @returns {void} - if current user position not contains el
         */
        function update() {
            var position = window.pageYOffset;
            var top = el.getBoundingClientRect().top + window.pageYOffset;
            var height = getHeight(el);
            var rectTop = el.getBoundingClientRect().top;
            if (top + height < position || top > position + windowHeight) {
                return;
            }
            var backgroundVerticalShift = -1 * Math.round(rectTop * speedFactor);
            if (isWebkitTransform) {
                el.style['-webkit-transform'] = 'translateY(' + backgroundVerticalShift + 'px)';
            } else {
                el.style['top'] = backgroundVerticalShift + 'px';
            }
        }
        update();

        // window.addEventListener('resize', window.correctFirstTop4Parallax);
        window.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        if (document.readyState !== 'complete') {
            window.addEventListener('load', function () {
                update();
            });
        }
    };
})();


(function () {
    window.cover_init = function (id) {
        if (document.readyState != 'loading') {
            t_cover__initCover();
        } else {
            document.addEventListener('DOMContentLoaded', t_cover__initCover);
        }
        /**
         * init cover
         */
        function t_cover__initCover() {
            var el = document.body.querySelector('#coverCarry' + id);
            var backgroundURL = el.getAttribute('data-content-cover-bg') || '';
            var height = el.getAttribute('data-content-cover-height') || '';
            var parallax = el.getAttribute('data-content-cover-parallax') || '';
            var videoMP4 = el.getAttribute('data-content-video-url-mp4') || '';
            var videoWEBM = el.getAttribute('data-content-video-url-webm') || '';
            var youtubeID = el.getAttribute('data-content-video-url-youtube') || '';
            var noLoop = el.getAttribute('data-content-video-noloop') || '';
            var noMute = el.getAttribute('data-content-video-nomute') || '';
            var bgBase64 = el.getAttribute('data-content-bg-base64') || '';
            var videoNoCover = el.getAttribute('data-content-video-nocover') || '';

            if (videoNoCover && videoNoCover === 'yes') {
                videoMP4 = '';
                videoWEBM = '';
                youtubeID = '';
            }

            if (window.isMobile &&
                (videoWEBM !== '' || videoMP4 !== '' || youtubeID !== '')) {
                el.style.backgroundImage = 'url("' + backgroundURL + '")';
            }

            // fix content height
            setTimeout(function () {
                cover_fixcontentheight(id, false);
                cover_fixBackgroundFixedStyles(id);
            }, 500);
            cover_fixBackgroundFixedNode(id);

            // fix content height if has a logo inside
            var record = document.getElementById('rec' + id);
            var coverLogo = record.querySelector('img[data-hook-clogo]');
            if (coverLogo) {
                coverLogo.onload = function () {
                    setTimeout(function () {
                        cover_fixcontentheight(id, false);
                        cover_fixBackgroundFixedStyles(id);
                    }, 500);
                };
            }

            if (window.isMobile) {
                window.addEventListener('orientationchange', function () {
                    window.addEventListener('resize', function () {
                        cover_fixcontentheight(id, true);
                        cover_fixBackgroundFixedStyles(id);
                    });
                });
            }

            // if set video
            if (videoMP4 !== '' || videoWEBM !== '' || youtubeID !== '') {
                if (!window.isMobile) {
                    // Initializing the videos
                    if (youtubeID === '' && (videoMP4 !== '' || videoWEBM !== '')) {
                        el.style.backgroundColor = '#000000';
                        el.style.backgroundImage = 'url("https://tilda.ws/img/spinner-white.gif")';
                        el.style.backgroundSize = 'auto';
                        el.setAttribute('data-content-cover-bg', '');
                        var loop = false;
                        if (noLoop != '') {
                            loop = false;
                        } else {
                            loop = true;
                        }

                        var muted = true;
                        if (noMute !== '') {
                            muted = false;
                        } else {
                            muted = true;
                        }

                        var heightMoreVh = '';
                        if (parallax === 'fixed') {
                            if (height.indexOf('vh') !== -1) {
                                if (parseInt(height) > 100) {
                                    el.style.height = '100vh';
                                    heightMoreVh = 'yes';
                                }
                            }
                            if (height.indexOf('px') !== -1) {
                                if (parseInt(height) > window.innerHeight) {
                                    el.style.height = '100vh';
                                    heightMoreVh = 'yes';
                                }
                            }
                        }

                        window.addEventListener('scroll', function () {
                            t_cover__setCover(el, videoMP4, videoWEBM, loop, muted, parallax, heightMoreVh);
                        });
                        t_cover__setCover(el, videoMP4, videoWEBM, loop, muted, parallax, heightMoreVh);

                        // Initializing youtube video
                    } else if (youtubeID !== '') {
                        el.style.backgorundColor = '#000000';
                        el.style.backgroundImage = '';
                        el.setAttribute('data-content-cover-bg', '');
                        window.addEventListener('scroll', function () {
                            t_cover__initYoutubeVideo(el, height);
                        });
                        t_cover__initYoutubeVideo(el, height);
                    }
                }
            }

            if (parallax === 'dynamic') {
                if (!window.isMobile) {
                    var offset = window.innerHeight;
                    var elHeight = t_cover__getHeightWithoutPadding(el);
                    if (elHeight < window.innerHeight) {
                        el.style.height = (elHeight + (offset * 0.2)) + 'px';
                    }
                    window.parallax(el, .2, true);
                }
            }

            if (bgBase64 === 'yes' && backgroundURL !== '' && videoMP4 === '' && videoWEBM === '' && youtubeID === '') {
                var bg_already = '';
                var img = document.createElement('img');
                img.src = backgroundURL;
                img.onload = function () {
                    if (img.parentNode) {
                        img.parentNode.removeChild(img);
                    }
                    el.style.backgroundImage = 'url("' + backgroundURL + '")';
                    el.style.opacity = '1';
                    bg_already = 'yes';
                };
                if (bg_already !== 'yes') {
                    el.style.backgroundImage = '';
                    el.style.opacity = '0';
                    el.style.transition = 'opacity 25ms';
                }
            }

            var rec = document.getElementById('rec' + id);
            var coverArrow = rec ? rec.querySelector('.t-cover__arrow-wrapper') : null;
            if (coverArrow) {
                coverArrow.addEventListener('click', function () {
                    //TODO заменил на offsetHeight, чтобы корректно отрабатывался скролл при внешних отступах (margin)
                    var recHeight = rec.offsetHeight;
                    if (recHeight > 0) {
                        var recPos = rec.getBoundingClientRect().top + window.pageYOffset;
                        t_cover__scrollToNextSection(recPos + recHeight, 300);
                    }
                });
            }

            if (el.hasAttribute('data-content-video-url-youtube') ||
                el.hasAttribute('data-content-video-url-mp4') ||
                el.hasAttribute('data-content-video-url-webm')) {
                window.addEventListener('resize', t_throttle(function () {
                    if (el.querySelector('.videoBG')) {
                        var elHeight = t_cover__getHeightWithoutPadding(el);
                        window.setWidthHeightHTMLVideo(el.querySelector('.videoBG'), elHeight);
                    }
                    if (el.querySelector('iframe')) {
                        var height = el.getAttribute('data-content-cover-height');
                        window.setWidthHeightYoutubeVideo(el, height);
                    }
                }));
            }
        }
    };

    /**
     * init cover if current mode is not "edit" and coverCarrier has attr data-content-cover-id
     */
    function t_cover__startInitingCover() {
        var records = document.querySelector('.t-records');
        var curMode = records ? records.getAttribute('data-tilda-mode') : '';
        if (curMode !== 'edit') {
            var coverCarriers = document.querySelectorAll('.t-cover__carrier');
            Array.prototype.forEach.call(coverCarriers, function (coverCarrier) {
                var id = coverCarrier.getAttribute('data-content-cover-id');
                if (id > 0) {
                    // eslint-disable-next-line no-undef
                    cover_init(id);
                }
            });
        }
    }

    if (document.readyState != 'loading') {
        t_cover__startInitingCover();
    } else {
        document.addEventListener('DOMContentLoaded', t_cover__startInitingCover);
    }

})();

/**
 * set cover to element
 * 
 * @param {HTMLElement} el - current element
 * @param {string} videoMP4 - param form data-attr
 * @param {string} videoWEBM - param form data-attr
 * @param {string} loop - param form data-attr
 * @param {string} muted - param form data-attr
 * @param {string} parallax - param form data-attr
 * @param {string} heightMoreVh - calculated value, returned 'yes' or ''
 */
function t_cover__setCover(el, videoMP4, videoWEBM, loop, muted, parallax, heightMoreVh) {
    var coverTimer;
    var flagprocessed = '';
    var currentElementParent = el.parentNode;
    if (coverTimer) {
        window.clearTimeout(coverTimer);
    }

    coverTimer = window.setTimeout(function () {
        if (!(flagprocessed > 0)) {
            var elHeight = t_cover__getHeightWithoutPadding(el);
            var elTopPos = el.getBoundingClientRect().top + window.pageYOffset;

            var windowScrollTop = window.pageYOffset;
            var windowHeight = window.innerHeight;

            if (windowScrollTop + windowHeight > elTopPos - 500 && windowScrollTop <= elTopPos + elHeight + 500) {
                cover_onFuncLoad(el.videoBG, function () {
                    var vid = el.videoBG({
                        mp4: videoMP4,
                        webm: videoWEBM,
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
                    vid.setAttribute('playsinline', ''); // iOS only

                    // eslint-disable-next-line no-undef
                    videoLoadProcessor.registerNewVideo(vid);
                    flagprocessed = 1;
                });
            }
        }
    }, 100);

    if (parallax == 'fixed' && heightMoreVh == 'yes') {
        var parentHeight = t_cover__getHeightWithoutPadding(currentElementParent);
        var parentTopPos = currentElementParent.getBoundingClientRect().top + window.pageYOffset;

        var windowScrollTop = window.pageYOffset;
        var windowHeight = window.innerHeight;

        if (windowScrollTop >= parentTopPos + parentHeight - windowHeight) {
            el.style.position = 'absolute';
            el.style.bottom = '0px';
            el.style.top = 'auto';
            //el.css("vertical-align","bottom");
        } else if (windowScrollTop >= parentTopPos) {
            el.style.position = 'fixed';
            el.style.top = '0px';
        } else if (windowScrollTop < parentTopPos) {
            el.style.position = 'relative';
            el.style.top = 'auto';
        }
    }
}

/**
 * @param {HTMLElement} el - current element
 * @param {string} height - param from data-attr
 */
function t_cover__initYoutubeVideo(el, height) {
    var flagprocessed = 0;
    var coverTimer;
    if (coverTimer) {
        window.clearTimeout(coverTimer);
    }

    coverTimer = window.setTimeout(function () {
        flagprocessed = el.querySelector('iframe');
        if (!flagprocessed) {
            var elHeight = t_cover__getHeightWithoutPadding(el);
            var elTopPos = el.getBoundingClientRect().top + window.pageYOffset;

            var windowScrollTop = window.pageYOffset;
            var windowHeight = window.innerHeight;

            if (windowScrollTop + windowHeight > elTopPos - 500 && windowScrollTop <= elTopPos + elHeight + 500) {
                // eslint-disable-next-line no-undef
                processYoutubeVideo(el, height);
                cover_onFuncLoad(window.processYoutubeVideo, function () {
                    window.processYoutubeVideo(el, height);
                });
            }
        }
    }, 100);
}

/**
 * @param {string} id - of inited record
 * @param {boolean} isOrientationChange - if orientation change - true
 */
function cover_fixcontentheight(id, isOrientationChange) {
    // correct cover height if content more when cover height
    var el = document.querySelector('#rec' + id);
    var cover = el.querySelector('.t-cover');
    var coverHeight = cover ? t_cover__getHeightWithoutPadding(cover) : 0;
    var content = el.querySelector('div[data-hook-content]');
    var contentHeight = content ? t_cover__getHeightWithoutPadding(content) : 0;
    if (contentHeight > 300 && coverHeight < contentHeight + 40) {
        cover_setRecalculatedCoverHeight(el, contentHeight);
        if (!window.isMobile) {
            setTimeout(function () {
                var divVideo = el.querySelector('.t-cover__carrier');
                if (divVideo && divVideo.querySelector('iframe')) {
                    // eslint-disable-next-line no-console
                    console.log('correct video from cover_fixcontentheight');
                    window.setWidthHeightYoutubeVideo(divVideo, contentHeight + 'px');
                }
                if (divVideo.querySelector('video')) {
                    // eslint-disable-next-line no-console
                    console.log('correct html5video from cover_fixcontentheight');
                    // n: need to dev
                    // setWidthHeightHTMLVideo(divvideo, hcontent);
                }
            }, 2000);
        }
        cover_updateResizeElem(el);
    } else if (window.isMobile && isOrientationChange) {
        cover_setRecalculatedCoverHeight(el, contentHeight);
        cover_updateResizeElem(el);
    } else if (window.isMobile) {
        var elCoverCarrier = el.querySelector('.t-cover__carrier');
        if (elCoverCarrier && elCoverCarrier.getAttribute('data-content-cover-height') === '100vh') {
            var height = window.innerHeight;
            var selectorsList = ['.t-cover', '.t-cover__filter', '.t-cover__carrier', '.t-cover__wrapper'];

            Array.prototype.forEach.call(selectorsList, function (selector) {
                if (el.querySelector(selector)) {
                    el.querySelector(selector).style.height = height + 'px';
                }
            });
        }
    }
}

/**
 * @param {HTMLElement} el - current element
 * @param {number} hcontent - height of content without padding
 */
function cover_setRecalculatedCoverHeight(el, hcontent) {
    var coverCarrier = el.querySelector('.t-cover__carrier');
    var startHeight = coverCarrier ? coverCarrier.getAttribute('data-content-cover-height') : '0';
    var height = window.innerHeight;
    if (startHeight.indexOf('vh') !== -1) {
        height = Math.round(parseInt(startHeight, 10) / 100 * height);
    } else {
        height = parseInt(startHeight, 10);
    }
    var hcontentReserve = window.innerWidth <= 568 ? 40 : 120;
    var hcontentMargin = window.innerWidth <= 568 ? 50 : 100;
    hcontent = hcontent + hcontentReserve;
    if (hcontent > 1000) {
        hcontent += hcontentMargin;
    }
    height = height < hcontent ? hcontent : height;
    // eslint-disable-next-line no-console
    console.log('auto correct cover height: ' + height);

    var selectorsList = ['.t-cover', '.t-cover__filter', '.t-cover__carrier', '.t-cover__wrapper'];

    Array.prototype.forEach.call(selectorsList, function (selector) {
        if (el.querySelector(selector)) {
            el.querySelector(selector).style.height = height + 'px';
        }
    });
}

/**
 * @param {HTMLElement} el - element which can be contains .t-cover__carrier
 */
function cover_updateResizeElem(el) {
    if (typeof window.t_lazyload_updateResize_elem === 'function') {
        try {
            window.t_lazyload_updateResize_elem(el.querySelector('.t-cover__carrier'));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log('error:' + e);
        }
    }
}

/**
 * check is fix for bg
 * 
 * @param {string} id - of inited record
 * @returns {boolean} - in case
 */
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

/**
 * mode for fixed background position
 * 
 * @param {string} id - of inited record
 */
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
        parent.insertAdjacentElement('afterbegin', newWrapper);

        var cover = rec.querySelector('.t-cover');
        //TODO var coverHeight = cover.style.height incorrect
        var coverHeight = t_cover__getHeightWithoutPadding(cover);
        newWrapper.style.height = coverHeight;
        newWrapper.appendChild(cover);

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
            newWrapper.appendChild(container);
        }

        window['cover' + id + 'fixbackgroundnodes'] = true;
    }
}

/**
 * set mode for fixed bg 
 * 
 * @param {string} id - of inited record
 * @returns {void}
 */
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

/**
 * some analog of promise
 * 
 * @param {Function} funcName - if funcName is function
 * @param {Function} okFunc - do okFunc
 */
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
/**
 * get height of element without padding
 * 
 * @param {HTMLElement} el - current element
 * @returns {number} - height of el
 */
function t_cover__getHeightWithoutPadding(el) {
    var elPaddingTop = parseInt(el.style.paddingTop) || 0;
    var elPaddingBottom = parseInt(el.style.paddingBottom) || 0;
    return el.clientHeight - (elPaddingTop + elPaddingBottom);
}

/**
 * smooth animation scroll
 * 
 * @param {number} to - offset top finally position
 * @param {number} duration - duration of animation
 * @returns {void} - if current position equals finally position
 */
function t_cover__scrollToNextSection(to, duration) {
    if (duration <= 0) return;
    var difference = to - window.pageYOffset;
    var perTick = difference / duration * 10;
    setTimeout(function () {
        window.scrollTo(0, window.pageYOffset + perTick);
        document.body.setAttribute('data-scrollable', 'true');
        if (window.pageYOffset === to) {
            document.body.removeAttribute('data-scrollable');
            return;
        }
        t_cover__scrollToNextSection(to, duration - 10);
    }, 10);
}