// This file adds global variables and functions

// All method for IE

/**
 * Method ready for ie 8+
 * @param {function} fn
*/
function t_ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState != 'loading') {
                fn();
            }
        });
    }
}

/**
 * Method classList.add for ie8+
 * @param {Node} el - el for which we add the class
 * @param {string} className - name class
 * @returns {void}
 */
function t_addClass(el, className) {
    // HTML 5 compliant browsers
    if (document.body.classList) {
        el.classList.add(className);
        return;
    }
    // legacy browsers (IE<10) support
    el.className += (el.className ? ' ' : '') + className;
}

/**
 * Method classList.remove for ie8+
 * @param {Node} el - el for which we remove the class
 * @param {string} className - name class
 * @returns {void}
 */
function t_removeClass(el, className) {
    // HTML 5 compliant browsers
    if (document.body.classList) {
        el.classList.remove(className);
        return;
    }
    // legacy browsers (IE<10) support
    el.className = el.className.replace(new RegExp('(^|\\s+)' + className + '(\\s+|$)'), ' ').replace(/^\s+/, '').replace(/\s+$/, '');
}

/**
 * Method remove() for ie 8+
 * @param {Node} el - remove element
*/
function t_removeEl(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * Get outer width with margin
 * @param {Node} el - element
 * @returns
 */
function t_outerWidth(el) {
    var style = getComputedStyle(el);
    var width = style.width;
    var marginLeft = style.marginLeft;
    var marginRight = style.marginRight;

    if (width === 'auto') width = 0;
    if (marginLeft === 'auto') marginLeft = 0;
    if (marginRight === 'auto') marginRight = 0;

    width = parseInt(width) + parseInt(marginLeft) + parseInt(marginRight);

    return width;
}

// global variables declaration

window.isSearchBot = false;
if (/Bot/i.test(navigator.userAgent)) {
    window.isSearchBot = true;
}

window.isMobile = false;
window.$isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.isMobile = true;
    window.$isMobile = true;
}

window.isiOS = false;
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.isiOS = true;
}

window.isiOSChrome = navigator.userAgent.match('CriOS') ? true : false;

window.isFirefox = /firefox/i.test(navigator.userAgent);

window.isiOSVersion = '';
if (window.isiOS) {
    var version = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (version !== null) {
        window.isiOSVersion = [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)];
    }
}

window.isSafari = false;
if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    window.isSafari = true;
}

window.isSafariVersion = ''; // TODO: maybe simplify to safariVersion?
if (window.isSafari) {
    var version = (navigator.appVersion).match(/Version\/(\d+)\.(\d+)\.?(\d+)? Safari/);
    if (version !== null) {
        window.isSafariVersion = [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)];
    }
}

window.browserLang = (window.navigator.userLanguage || window.navigator.language).toUpperCase().slice(0, 2);
window.tildaBrowserLang = window.browserLang; // legacy

/** Language override based on attribute */
t_ready(function() {
    var projectLang = document.getElementById('allrecords').getAttribute('data-tilda-project-lang');
    if (projectLang) {
        window.browserLang = projectLang;
    }
});

/**
 * Service functions
 * @param {Function} fn - fn apply
 * @param {Number} threshhold - timer
 * @param {Node} scope - context
 * @returns {Function}
 */
function t_throttle(fn, threshhold, scope) {
    var last;
    var deferTimer;
    threshhold || (threshhold = 250);
    return function () {
        var context = scope || this;
        var now = +new Date();
        var args = arguments;

        if (last && now < last + threshhold) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

/**
 * Checks if a function has loaded or not
 * @param {string} funcName - fn name
 * @param {Function} okFunc - fn to run
 * @param {number} time - time checked
 */
// eslint-disable-next-line no-unused-vars
function t_onFuncLoad(funcName, okFunc, time) {
    if (typeof window[funcName] === 'function') {
        okFunc();
    } else {
        var startTime = Date.now();
        setTimeout(function checkFuncExist() {
            var currentTime = Date.now();
            if (typeof window[funcName] === 'function') {
                okFunc();
                return;
            }
            if (document.readyState === 'complete' && currentTime - startTime > 5000 && typeof window[funcName] !== 'function') {
                throw new Error(funcName + ' is undefined');
            }
            setTimeout(checkFuncExist, time || 100);
        });
    }
}

/** Turn off font boosting */
t_ready(function() {
    var userAgent = window.navigator.userAgent;
    var isInstagram = userAgent.indexOf('Instagram') !== -1;
    var isFacebook = userAgent.indexOf('FBAV') !== -1;
    var isYandex = userAgent.indexOf('YaSearchBrowser') !== -1;
    var isSamsung = userAgent.indexOf('SamsungBrowser') !== -1;
    var isDuckDuckGo = userAgent.indexOf('DuckDuckGo') !== -1;
    var isAndroid = userAgent.indexOf('Android') !== -1;
    if (isAndroid && (isFacebook || isInstagram || isYandex || isSamsung || isDuckDuckGo)) {
        var textElement = document.createElement('p');
        textElement.style.lineHeight = '100px';
        textElement.style.padding = '0';
        textElement.style.margin = '0';
        textElement.style.height = 'auto';
        textElement.style.position = 'absolute';
        textElement.style.opacity = '0.001';
        textElement.innerText = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        document.body.appendChild(textElement);
        var factor = 100 / textElement.getBoundingClientRect().height;
        textElement.parentNode.removeChild(textElement);
        if (factor < 0.98) {
            document.body.insertAdjacentHTML('beforeend', '<style>.t396 [data-elem-type="text"] .tn-atom {zoom: ' + factor * 100 + '%;}</style>');
        }
    }
});

/** Tilda label */
t_ready(function() {
    setTimeout(function () {
        var tildaLabel = document.querySelector('.t-tildalabel');
        var bodyScrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

        if ((!document.getElementById('tildacopy') && !tildaLabel) || !tildaLabel.querySelectorAll('div')) {
            var childs = document.body.childNodes;
            var arrChilds = [];

            for (var i = 0; i < childs.length; i++) {
                var element = childs[i];

                if (element.nodeType === 8) {
                    arrChilds.push(element);
                }
            }

            for (var i = 0; i < arrChilds.length; i++) {
                if (arrChilds[i].nodeValue.indexOf('\'t remove this l') !== -1) {
                    document.getElementById('allrecords').insertAdjacentHTML('afterend', '<div class="t-tildalabel t-tildalabel-free" style="display: block !important; visibility: visible !important; position: relative !important; width: 100% !important; pointer-events: all !important; opacity: 1 !important; margin: 0 !important; z-index: 99900 !important"><div class="t-tildalabel-free__main"><a href="https://tilda.cc" target="_blank" style="padding-bottom:12px; display: block;"><img style="width:40px;" src="https://static.tildacdn.com/img/tildacopy.png"></a><div style="padding-bottom: 15px;">This site was made on <a href="https://tilda.cc" target="_blank" style="text-decoration: none; color:inherit;">Tilda — a website builder</a> that helps to&nbsp;create a&nbsp;website without any code</div><a href="https://tilda.cc/registration/" target="_blank" style="display: inline-block; padding: 10px 20px; font-size: 13px; border-radius: 50px; background-color: #fa8669; color: #fff; text-decoration: none;">Create a website</a></div><div class="t-tildalabel-free__links-wr"><a class="t-tildalabel-free__txt-link" href="https://help' + (window.browserLang === 'RU' ? '-ru' : '') + '.tilda.cc/white-label" target="_blank">' + (window.browserLang === 'RU' ? 'Как удалить этот лейбл' : 'How to remove this block') + '?</a></div></div>');
                }
            }
        } else if (bodyScrollHeight + 70 > window.innerHeight) {
            if (tildaLabel) {
                tildaLabel.setAttribute('style', 'display: block !important; visibility: visible !important; position: relative !important; width: 100% !important; pointer-events: all !important; opacity: 1 !important; margin: 0 !important; z-index: 1 !important');
            }
        }
    }, 500);
});

/** Appearance animation */
t_ready(function() {
    if (!window.isMobile && document.getElementById('allrecords').getAttribute('data-blocks-animationoff') !== 'yes' && window.isSearchBot === false) {
        var recBlocks = document.querySelectorAll('.r');

        for (var i = 0; i < recBlocks.length; i++) {
            var rec = recBlocks[i];
            var style = rec.getAttribute('style');

            if (style && style.indexOf('background-color') !== -1) {
                rec.setAttribute('data-animationappear', 'off');
            }
        }

        // add animation
        var recBlocksNot = document.querySelectorAll('.r:not([data-animationappear="off"]):not([data-screen-min]):not([data-screen-max])');

        for (var i = 0; i < recBlocksNot.length; i++) {
            var rec = recBlocksNot[i];
            var recTop = rec.getBoundingClientRect().top + window.pageYOffset;
            var position = window.pageYOffset + window.innerHeight + 300;

            if (recTop > 1000 && recTop > position) {
                t_addClass(rec, 'r_hidden');
            } else {
                t_addClass(rec, 'r_showed');
            }
            t_addClass(rec, 'r_anim');
        }

        // eslint-disable-next-line no-inner-declarations
        function t_blocksFade() {
            if (recBlocksNot.length) {
                for (var i = recBlocksNot.length - 1; i >= 0; i--) {
                    var rec = recBlocksNot[i];
                    var recTop = rec.getBoundingClientRect().top + window.pageYOffset;
                    var position = 0;

                    if (rec.offsetHeight <= 100) {
                        position = window.pageYOffset + window.innerHeight;
                    } else {
                        position = window.pageYOffset + window.innerHeight - 100;
                    }

                    if (recTop < position) {
                        t_removeClass(rec, 'r_hidden');
                        t_addClass(rec, 'r_showed');
                        recBlocksNot = Array.prototype.slice.call(recBlocksNot);
                        recBlocksNot.splice(i, 1);
                    }
                }
            }
        }

        window.addEventListener('scroll', t_throttle(t_blocksFade, 200));
        setTimeout(function() {
            t_blocksFade();
        });
    }


    var html = document.querySelector('html');

    if (html.style.display === 'none') {
        html.style.display = 'block';
    }

    var tildaLabel = document.querySelector('.t-tildalabel');
    var bodyScrollHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );

    if (bodyScrollHeight + 70 < window.innerHeight) {
        if (tildaLabel) {
            tildaLabel.style.display = 'none';
        }
    } else {
        // eslint-disable-next-line no-lonely-if
        if (tildaLabel) {
            tildaLabel.setAttribute('style', 'display: block !important');
        }
    }
});

/**
 * TODO: Why do you need window.winWidth and window.winHeight?
 * The blocks are hidden via css. It seems to work the same without this function.
 */
(function() {
    /** Set window width and height */
    function t_setWindowVars() {
        window.winWidth = window.innerWidth;
        window.winHeight = window.innerHeight;
    }

    /** Show and hide blocks */
    function t_blocksdisplay() {
        var windowWidth = window.innerWidth;
        var recBlocks = document.querySelectorAll('.r[data-screen-max], .r[data-screen-min]');
        var max;
        var min;
        var display;

        for (var i = 0; i < recBlocks.length; i++) {
            var rec = recBlocks[i];

            if (rec.getAttribute('data-connect-with-tab') === 'yes') return;

            display = getComputedStyle(rec).display;
            max = rec.getAttribute('data-screen-max');
            min = rec.getAttribute('data-screen-min');

            if (!max) max = 10000;
            if (!min) min = 0;

            max = parseInt(max);
            min = parseInt(min);

            if (min <= max) {
                if (windowWidth <= max && windowWidth > min) {
                    if (display !== 'block') {
                        rec.style.display = 'block';
                    }
                } else if (display !== 'none') {
                    rec.style.display = 'none';
                }
            }
        }
    }

    t_ready(function() {
        t_setWindowVars();
        t_blocksdisplay();

        window.addEventListener('resize', t_throttle(t_setWindowVars, 200));
        window.addEventListener('resize', t_throttle(t_blocksdisplay, 200));
    });
})();

/**
 * Defining heights for covers and other blocks in the mobile version,
 * reducing fonts and tracking blocks that are not optimized for the mobile version
 */
(function() {
    function t_correctHeight() {
        var coverCarries = document.querySelectorAll('.t-cover__carrier');
        var factor = 0;

        for (var i = 0; i < coverCarries.length; i++) {
            var element = coverCarries[i];
            var elementStyle = element.style;

            if (elementStyle.height.indexOf('vh') > -1) {
                factor = parseInt(elementStyle.height, 10) / 100;

                var div = document.createElement('div');
                div.id = 'tempDiv';
                div.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100vh;visibility:hidden;';
                document.body.appendChild(div);

                var tempDiv = document.getElementById('tempDiv');
                var tempDivHeight = parseInt(getComputedStyle(tempDiv).height.replace('px', ''));
                t_removeEl(tempDiv);

                var newHeight = Math.round(tempDivHeight * factor) + 'px';
                var cover = element.closest('.t-cover');

                if (cover) {
                    var opacityLayer = cover.querySelector('.t-cover__filter');
                    var textBox = cover.querySelector('.t-cover__wrapper');
                }

                if (opacityLayer) {
                    opacityLayer.style.height = newHeight;
                }
                if (textBox) {
                    textBox.style.height = newHeight;
                }
                elementStyle.height = cover.style.height = newHeight;
            }
        }

        // others
        var elCarries = document.querySelectorAll('[data-height-correct-vh]');
        var windowHeight = window.innerHeight;
        factor = 0;

        for (var i = 0; i < elCarries.length; i++) {
            var element = elCarries[i];
            var elementStyle = element.style;

            if (elementStyle.height.indexOf('vh') > -1) {
                factor = parseInt(elementStyle.height) / 100;
                newHeight = windowHeight + 'px';
                elementStyle.height = newHeight;
            }
        }
    }

    if (window.isMobile) {
        t_ready(function() {
            setTimeout(t_correctHeight, 400);
        });

        window.addEventListener('load', function() {
            setTimeout(t_correctHeight, 400);
        });

        if (window.innerWidth < 480) {
            t_ready(function() {
                var customStyleElements = document.querySelectorAll('[data-customstyle="yes"]');
                var fieldElements = document.querySelectorAll('[field] span, [field] strong, [field] em');

                for (var i = 0; i < customStyleElements.length; i++) {
                    var element = customStyleElements[i];

                    if (parseInt(getComputedStyle(element).fontSize.replace('px', '')) > 26) {
                        element.style.fontSize = null;
                        element.style.lineHeight = null;
                    }
                }

                for (var i = 0; i < fieldElements.length; i++) {
                    var element = fieldElements[i];

                    if (parseInt(getComputedStyle(element).fontSize.replace('px', '')) > 26) {
                        element.style.fontSize = null;
                    }
                }

                var elements = document.querySelectorAll('' +
                    '.t-text:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-name:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-title:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-descr:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-heading:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-text-impact:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-subtitle:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"])'
                );

                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    var elementStyle = element.getAttribute('style');

                    if (elementStyle && elementStyle.indexOf('font-size') > -1) {
                        if (parseInt(getComputedStyle(element).fontSize.replace('px', '')) > 26) {
                            if (element.getAttribute('data-auto-correct-font-size') === 'rem') {
                                // set adaptive font size for mobile devices
                                var newStyle = elementStyle.replace(/font-size.*px;/gi, 'font-size: 1.6rem;').replace('line-height', 'lineheight');
                                element.setAttribute('style', newStyle);
                            } else {
                                // reset font-size for all other elements
                                var newStyle = elementStyle.replace('font-size', 'fontsize').replace('line-height', 'lineheight');
                                element.setAttribute('style', newStyle);
                            }
                        }
                    }
                }
            });

            window.addEventListener('load', function() {
                var windowWidth = window.innerWidth;

                var recBlocks = document.querySelectorAll('.r');
                var visibleRecBlocks = [];

                for (var i = 0; i < recBlocks.length; i++) {
                    var rec = recBlocks[i];
                    var recStyles = getComputedStyle(rec);

                    if (recStyles.display !== 'none' && recStyles.visibility !== 'hidden' && recStyles.opacity !== '0') {
                        visibleRecBlocks.push(rec);
                    }
                }

                for (var i = 0; i < visibleRecBlocks.length; i++) {
                    var rec = visibleRecBlocks[i];
                    var blocks = rec.querySelectorAll('div:not([data-auto-correct-mobile-width="false"], .tn-elem, .tn-atom, .tn-atom__sbs-anim-wrapper, .tn-atom__prx-wrapper, .tn-atom__videoiframe, .tn-atom .t-form *, .tn-atom__sticky-wrapper, .t-store__relevants__container, .t-slds__items-wrapper, .js-product-controls-wrapper, .js-product-edition-option, .t-product__option-variants)');

                    for (var j = 0; j < blocks.length; j++) {
                        var block = blocks[j];
                        var blockWidth = t_outerWidth(block);

                        if (blockWidth > windowWidth) {
                            if (block.getAttribute('[data-customstyle]') === 'yes') {
                                if (block.parentNode.getAttribute('[data-auto-correct-mobile-width]') === 'false') {
                                    return;
                                }
                            }

                            // eslint-disable-next-line no-console
                            console.log('Block not optimized for mobile width. Block width:' + blockWidth + ' Block id:' + rec.getAttribute('id'));
                            // eslint-disable-next-line no-console
                            console.log(block);

                            rec.style.overflow = 'auto';
                            if (blockWidth - 3 > windowWidth) {
                                rec.style.wordBreak = 'break-all';
                            }
                        }
                    }
                }
            });
        } else if (window.innerWidth < 900) {
            t_ready(function() {
                var customStyleElements = document.querySelectorAll('[data-customstyle="yes"]');
                var fieldElements = document.querySelectorAll('[field] span, [field] strong, [field] em');

                for (var i = 0; i < customStyleElements.length; i++) {
                    var element = customStyleElements[i];

                    if (parseInt(getComputedStyle(element).fontSize.replace('px', '')) > 30) {
                        element.style.fontSize = null;
                        element.style.lineHeight = null;
                    }
                }

                for (var i = 0; i < fieldElements.length; i++) {
                    var element = fieldElements[i];

                    if (parseInt(getComputedStyle(element).fontSize.replace('px', '')) > 30) {
                        element.style.fontSize = null;
                    }
                }

                var elements = document.querySelectorAll('' +
                    '.t-text:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-name:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-title:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-descr:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-heading:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-text-impact:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"]), ' +
                    '.t-subtitle:not(.tn-elem, .tn-atom, [data-auto-correct-line-height="false"])'
                );

                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    var elementStyle = element.getAttribute('style');

                    if (elementStyle && elementStyle.indexOf('font-size') > -1) {
                        if (parseInt(getComputedStyle(element).fontSize.replace('px', '')) > 30) {
                            if (element.getAttribute('data-auto-correct-font-size') === 'rem') {
                                // set adaptive font size for mobile devices
                                var newStyle = elementStyle.replace(/font-size.*px;/gi, 'font-size: 1.6rem;').replace('line-height', 'lineheight');
                                element.setAttribute('style', newStyle);
                            } else {
                                // reset font-size for all other elements
                                var newStyle = elementStyle.replace('font-size', 'fontsize').replace('line-height', 'lineheight');
                                element.setAttribute('style', newStyle);
                            }
                        }
                    }
                }
            });
        }
    }
})();

/**
 * Adding rel=noopener for all links on the page
 * https://mathiasbynens.github.io/rel-noopener/
 * UPD: Browsers now implicitly set rel=noopener for any target=_blank link
 */
(function() {
    t_ready(function() {
        setTimeout(function() {
            var links = document.querySelectorAll('a[href^="http"][target="_blank"]');

            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var attrRel = link.getAttribute('rel') || '';

                if (attrRel === '') {
                    link.setAttribute('rel', 'noopener');
                } else if (attrRel.indexOf('noopener') === -1) {
                    link.setAttribute('rel', attrRel + ' noopener');
                }
            }
        }, 2500);
    });
})();

/** Capture JS errors */
// eslint-disable-next-line no-unused-vars
(function(window, Math) {
    /*
    window.t_captureJsErrors = function (message, filename, lineno, colno, error){
        var has_code='';
        var el_all=$('#allrecords');
        if($('.t123').length || $('.tn-atom__html').length || el_all.attr('data-tilda-project-headcode')==='yes' || el_all.attr('data-tilda-page-headcode')==='yes'){
            var has_code='y';
        }
        if(has_code!=='y'){
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'https://sysstat.tildacdn.com/api/js/error/', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                event_id: Date.now() + '-' + Math.floor(Math.random() * 100000),
                request: {
                    url: window.location.href,
                },
                exception: {
                    values: [
                        {
                            type: (typeof error!=='undefined' && error!=null && typeof error.name!=='undefined' ? error.name: ''),
                            value: message,
                            stacktrace: {
                                frames: [
                                    { filename: filename, colno: colno, lineno: lineno }
                                ]
                            }
                        }
                    ]
                },
                stacktrace: (typeof error!=='undefined' && error!==null && typeof error.stack!=='undefined' ? error.stack : '')
            }));
        }
    }

    window.onerror = function(message, filename, lineno, colno, error) {
        if(typeof window.t_jserr_i!='number')window.t_jserr_i=0;
        window.t_jserr_i++;
        setTimeout(function() {
            window.t_captureJsErrors(message, filename, lineno, colno, error);
        }, 500*window.t_jserr_i);
    };
    */

    window.onerror = function(message, filename, lineno, colno, error) {
        if (typeof window.t_jserrors!=='object') window.t_jserrors=[];
        window.t_jserrors.push({
            message:message,
            filename:filename,
            lineno:lineno,
            colno:colno,
            error:error
        });
    };

})(window,Math);