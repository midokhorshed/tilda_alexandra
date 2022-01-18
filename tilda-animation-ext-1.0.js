/**
 * tilda-animation-ext use in zero-block when user choose in basic animation 'parallax' or 'fixing'
 */
if (document.readyState != 'loading') {
  t_animationExt__init();
} else {
  document.addEventListener('DOMContentLoaded', t_animationExt__init);
}

/**
 * init animation
 * 
 * @returns {void} - if mode is edit
 */
function t_animationExt__init() {
  var record = document.querySelector('.t-records');
  var tMode = record ? record.getAttribute('data-tilda-mode') : '';
  if (window.isSearchBot === 1
    || t_animateParallax__checkOldIE()
    || tMode === 'edit') { return; }

  t_animateFix__wrapEls();
  t_animateParallax__wrapEls();

  setTimeout(function () {
    t_animateParallax__initScroll();
    t_animateParallax__initMouse();
    var mouseElements = document.querySelectorAll('[data-animate-prx="mouse"], [data-animate-prx-res-960="mouse"], [data-animate-prx-res-640="mouse"], [data-animate-prx-res-480="mouse"], [data-animate-prx-res-320="mouse"]');
    var fixedElements = document.querySelectorAll('[data-animate-fix]:not([data-animate-fix-alw="yes"]), [data-animate-fix-res-960]:not([data-animate-fix-alw-res="yes"]), [data-animate-fix-res-640]:not([data-animate-fix-alw="yes"]),[data-animate-fix-res-480]:not([data-animate-fix-alw="yes"]),[data-animate-fix-res-320]:not([data-animate-fix-alw="yes"])');
    if (mouseElements.length || fixedElements.length) {
      var getClientRects = document.body.getClientRects();
      if (getClientRects.length > 0) {
        var initHeight = getClientRects[0].height;
        if ('ResizeObserver' in window) {
          var bodyHeightResizeObserver_animateParallax = new ResizeObserver(function (entries) {
            for (var index = 0; index < entries.length; index++) {
              // body's height is changed
              if (entries[index].contentRect.height !== initHeight) {
                getClientRects = document.querySelector('body').getClientRects();
                if (getClientRects.length > 0) {
                  initHeight = getClientRects[0].height;
                  for (var i = 0; i < mouseElements.length; i++) {
                    var el = mouseElements[i];
                    t_animateParallax__cashOffsets(el);
                  }
                  t_animateFix__cashElsInfo(fixedElements);
                }
              }
            }
          });
          bodyHeightResizeObserver_animateParallax.observe(document.querySelector('body'));
        }
      }
    }
  }, 1000);

  if (window.pageYOffset === 0) {
    setTimeout(function () {
      t_animateFix__init();
    }, 1000);
  } else {
    setTimeout(function () {
      t_animateFix__init();
    }, 50);
  }
}


/**
 * analog of promise
 * 
 * @param {Function} funcName - check function
 * @param {Function} okFunc - current function to init
 * @param {number} time - duration
 */
function t_animationExt__onFuncLoad(funcName, okFunc, time) {
  if (typeof window[funcName] === 'function') {
    okFunc();
  } else {
    setTimeout(function checkFuncExist() {
      if (typeof window[funcName] === 'function') {
        okFunc();
        return;
      }
      if (document.readyState === 'complete' && typeof window[funcName] !== 'function') {
        throw new Error(funcName + ' is undefined');
      }
      setTimeout(checkFuncExist, time || 100);
    });
  }
}

/**
 * get attribute value
 * 
 * @param {HTMLElement} el - current element
 * @param {string} attr - animation attribute
 * @param {number} res - ?
 * @returns {string | null | undefined} - attribute value (null - if attribute is not defined, undefined - if el attr data-animate-mobile !== 'y')
 */
function t_animationExt__getAttrByRes(el, attr, res) {
  var viewportWidth = res || window.innerWidth;
  var attrValue;

  if (viewportWidth >= 1200) {
    attrValue = el.getAttribute('data-animate-' + attr);
    return attrValue;
  }

  if (el.getAttribute('data-animate-mobile') !== 'y') {
    el.style.transition = 'none';
    return;
  }

  if (viewportWidth >= 960) {
    attrValue = el.getAttribute('data-animate-' + attr + '-res-960');
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr);
    }
    return attrValue;
  }
  if (viewportWidth >= 640) {
    attrValue = el.getAttribute('data-animate-' + attr + '-res-640');
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr + '-res-960');
    }
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr);
    }
    return attrValue;
  }
  if (viewportWidth >= 480) {
    attrValue = el.getAttribute('data-animate-' + attr + '-res-480');
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr + '-res-640');
    }
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr + '-res-960');
    }
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr);
    }
    return attrValue;
  }
  if (viewportWidth >= 320) {
    attrValue = el.getAttribute('data-animate-' + attr + '-res-320');
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr + '-res-480');
    }
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr + '-res-640');
    }
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr + '-res-960');
    }
    if (!attrValue && !res) {
      attrValue = el.getAttribute('data-animate-' + attr);
    }
    return attrValue;
  }
}

/**
 * wrap elements
 */
function t_animateFix__wrapEls() {
  var wrappingElements = document.querySelectorAll('[data-animate-fix], [data-animate-fix-res-960], [data-animate-fix-res-640], [data-animate-fix-res-480], [data-animate-fix-res-320]');
  Array.prototype.forEach.call(wrappingElements, function (wrappingElement) {
    var resultValue = t_animationExt__getAttrByRes(wrappingElement, 'prx');
    if (resultValue) {
      wrappingElement.removeAttribute('data-animate-prx');
      wrappingElement.removeAttribute('data-animate-prx-res-960');
      wrappingElement.removeAttribute('data-animate-prx-res-640');
      wrappingElement.removeAttribute('data-animate-prx-res-480');
      wrappingElement.removeAttribute('data-animate-prx-res-320');
    }
    var currentAtom = wrappingElement.querySelectorAll('.tn-atom');
    Array.prototype.forEach.call(currentAtom, function (atom) {
      var parent = atom.parentNode;
      var div = document.createElement('div');
      div.classList.add('tn-atom__sticky-wrapper');
      div.style.display = 'table';
      div.style.width = 'inherit';
      div.style.height = 'inherit';
      var clonedEl = atom.cloneNode(true);
      div.appendChild(clonedEl);
      parent.appendChild(div);
      if (parent) {
        parent.removeChild(atom);
      }
    });

    // if elem has appearance animation, we need to move it to fixed wrapper, because position:fixed doesnt work inside element with transform
    var currentFixedWrapper = wrappingElement.querySelector('.tn-atom__sticky-wrapper');
    if (wrappingElement.classList.contains('t-animate')) {
      wrappingElement.classList.remove('t-animate');
      if (currentFixedWrapper) {
        currentFixedWrapper.classList.add('t-animate');
        var breakpoints = [1200, 960, 640, 480, 320];
        var atributes = ['style', 'distance', 'duration', 'scale', 'delay'];
        breakpoints.forEach(function (breakpoint, breakpointIndex) {
          atributes.forEach(function (attr) {
            if (breakpointIndex === 0) {
              currentFixedWrapper.setAttribute('data-animate-' + attr, t_animationExt__getAttrByRes(wrappingElement, attr, breakpoint));
              wrappingElement.removeAttribute('data-animate-' + attr);
            } else {
              currentFixedWrapper.setAttribute('data-animate-' + attr + '-res-' + breakpoint, t_animationExt__getAttrByRes(wrappingElement, attr, breakpoint));
              wrappingElement.removeAttribute('data-animate-' + attr + + '-res-' + breakpoint);
            }
          });
        });
      }
    }
  });
}

/**
 * animate fixed elements
 * 
 * @returns {void}
 */
function t_animateFix__init() {
  var fixedElements = document.querySelectorAll("[data-animate-fix]:not([data-animate-fix-alw='yes']), [data-animate-fix-res-960]:not([data-animate-fix-alw-res='yes']), [data-animate-fix-res-640]:not([data-animate-fix-alw='yes']),[data-animate-fix-res-480]:not([data-animate-fix-alw='yes']),[data-animate-fix-res-320]:not([data-animate-fix-alw='yes'])");
  var alwaysFixedElements = document.querySelectorAll("[data-animate-fix][data-animate-fix-alw='yes'], [data-animate-fix-res-960][data-animate-fix-alw='yes'], [data-animate-fix-res-640][data-animate-fix-alw='yes'],[data-animate-fix-res-480][data-animate-fix-alw='yes'],[data-animate-fix-res-320][data-animate-fix-alw='yes']");
  var stopFixing = false;

  if (!fixedElements.length) {
    return;
  }

  t_animateFix__cashElsInfo(fixedElements);
  t_animateFix__cashElsInfo(alwaysFixedElements);

  t_animateFix__updatePositions(fixedElements);
  t_animateFix__positionAlwaysFixed(alwaysFixedElements);
  var allRecords = document.getElementById('allrecords');
  var lazyLoad = allRecords ? allRecords.getAttribute('data-tilda-lazy') : null;
  if (window.lazy === 'y' || lazyLoad === 'yes') {
    t_animationExt__onFuncLoad('t_lazyload_update', function () {
      t_lazyload_update();
    });
  }

  window.addEventListener('resize', t_throttle(function () {
    t_animateFix__cashElsInfo(fixedElements);
    t_animateFix__cashElsInfo(alwaysFixedElements);
    t_animateFix__updatePositions(fixedElements, true);
    t_animateFix__positionAlwaysFixed(alwaysFixedElements);
  }, 100));

  window.addEventListener('scroll', t_throttle(function () {
    if (stopFixing) { return; }
    t_animateFix__updatePositions(fixedElements, false);
  }, 30));

  // catch events of window height changes it may be caused by tabs or "show more" button
  var zeroBlocks = document.querySelectorAll('.t396');
  Array.prototype.forEach.call(zeroBlocks, function (zeroBlock) {
    zeroBlock.addEventListener('displayChanged', function () {
      if (stopFixing) { return; }
      setTimeout(function () {
        t_animateFix__cashElsInfo(fixedElements);
        t_animateFix__updatePositions(fixedElements, true);
      }, 10);
    });
  });
}

/**
 * animated elements with always fixed position
 * 
 * @param {NodeList} alwaysFixedEls - current elements list
 */
function t_animateFix__positionAlwaysFixed(alwaysFixedEls) {
  Array.prototype.forEach.call(alwaysFixedEls, function (alwaysFixedEl) {
    alwaysFixedEl.style.position = 'fixed';
    alwaysFixedEl.style.top = alwaysFixedEl.triggerOffset + 'px';
  });
}

/**
 * 
 * @param {NodeList} fixedEls - fixed elements
 * @param {boolean} isPageResized - boolean value of resizing page
 * @returns {void}
 */
function t_animateFix__updatePositions(fixedEls, isPageResized) {
  var scrollTop = window.pageYOffset;

  for (var i = 0; i < fixedEls.length; i++) {
    var el = fixedEls[i];
    var zoomValue = t_animationExt__getZoom(el);
    if (el.distance == 0) return;

    if (!t_animationExt__isOnlyScalableElem()) {
      var trigger = scrollTop + (el.triggerOffset * zoomValue);
    } else {
      var trigger = scrollTop + el.triggerOffset;
    }
    var isAfterStart = trigger >= el.topOffset;
    var isBeforeStart = trigger < el.topOffset;
    var isBeforeEnd = el.end > trigger;
    var isAfterEnd = el.end <= trigger;

    // if element is located between start and end
    if ((isAfterStart && isBeforeEnd && (el.fixedWrapperEl && !el.fixedWrapperEl.classList.contains('t-sticky_going') || isPageResized))
      || (isBeforeEnd && el.fixedWrapperEl && el.fixedWrapperEl.classList.contains('t-sticky_ended'))) {
      el.style.transform = '';
      el.fixedWrapperEl.style.position = 'fixed';
      el.fixedWrapperEl.style.top = el.triggerOffset + 'px';
      // if (isSafari) {
      //   $(el).css({"position":"fixed"});
      // }
      el.fixedWrapperEl.classList.add('t-sticky_going');
      el.fixedWrapperEl.classList.remove('t-sticky_ended');
    }
    // if element is located under end
    if (isAfterEnd && el.fixedWrapperEl && !el.fixedWrapperEl.classList.contains('t-sticky_ended')) {
      var distanceWithoutZoom = t_animationExt__isOnlyScalableElem() ? el.distance : (el.distance / zoomValue);
      el.style.transform = 'translateY(' + distanceWithoutZoom + 'px)';
      el.fixedWrapperEl.style.top = '';
      el.fixedWrapperEl.style.position = '';
      // if (isSafari) {
      //   $(el).css({"position":""});
      // }
      el.fixedWrapperEl.classList.remove('t-sticky_going');
      el.fixedWrapperEl.classList.add('t-sticky_ended');
    }
    // if element is located above start
    if (isBeforeStart && el.fixedWrapperEl && el.fixedWrapperEl.classList.contains('t-sticky_going')) {
      el.fixedWrapperEl.style.top = '';
      el.fixedWrapperEl.style.position = '';
      // if (isSafari) {
      //   $(el).css({"position":""});
      // }
      el.fixedWrapperEl.classList.remove('t-sticky_going');
    }
  }
}

/**
 * @returns {boolean} - value is only scalable elem
 */
function t_animationExt__isOnlyScalableElem() {
  var isFirefox = navigator.userAgent.search('Firefox') !== -1;
  // eslint-disable-next-line no-undef
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  return isFirefox || isOpera;
}

/**
 * @param {HTMLElement} el - current element
 * @returns {number} - zoom value
 */
function t_animationExt__getZoom(el) {
  var zoomValue = 1;
  var artboard = el.closest('.t396__artboard');

  if (artboard && artboard.classList.contains('t396__artboard_scale')) {
    zoomValue = window.tn_scale_factor;
  }

  return zoomValue;
}

/**
 * cash element information
 * 
 * @param {NodeList} fixedEls - fixed elements
 */
function t_animateFix__cashElsInfo(fixedEls) {
  var winHeight = window.innerHeight;
  Array.prototype.forEach.call(fixedEls, function (fixedEl) {
    var zoomValue = t_animationExt__getZoom(fixedEl);
    var elTopPos = parseInt(fixedEl.style.top);
    if (!t_animationExt__isOnlyScalableElem()) {
      elTopPos = parseInt(fixedEl.style.top) * zoomValue;
    }
    var elParent = fixedEl.closest('.r');
    //TODO раньше было так: recTopOffset = elRecParent.offset().top + elRecParent.css("padding-top").replace("px", "") * 1; 
    // доп. учет padding'a тут лишний, offset() учитывает внутренние отступы
    var recTopOffset = elParent ? elParent.getBoundingClientRect().top + window.pageYOffset : 0;
    fixedEl.topOffset = recTopOffset + elTopPos;
    fixedEl.trigger = t_animationExt__getAttrByRes(fixedEl, 'fix');
    fixedEl.distance = t_animationExt__getAttrByRes(fixedEl, 'fix-dist') * 1 || 0;
    fixedEl.distance *= zoomValue;
    fixedEl.end = fixedEl.topOffset + fixedEl.distance;
    fixedEl.fixedWrapperEl = fixedEl.querySelector('.tn-atom__sticky-wrapper');
    t_animateFix__getElTrigger(fixedEl, winHeight);
  });
}

/**
 * get element trigger
 * 
 * @param {HTMLElement} el - current element
 * @param {number} winHeight - window height
 */
function t_animateFix__getElTrigger(el, winHeight) {
  var zoomValue = t_animationExt__getZoom(el);
  el.triggerOffset = t_animationExt__getAttrByRes(el, 'fix-trgofst');
  el.triggerOffset = !el.triggerOffset || el.triggerOffset === '0' ? 0 : el.triggerOffset * 1;
  if (t_animationExt__isOnlyScalableElem()) el.triggerOffset *= zoomValue;

  if (el.trigger == '0.5') {
    el.triggerOffset += winHeight / 2;
    if (el.triggerOffset > el.topOffset && el.triggerOffset <= winHeight / 2) {
      el.triggerOffset = el.topOffset;
    }
    if (!t_animationExt__isOnlyScalableElem()) el.triggerOffset /= zoomValue;
  }

  if (el.trigger == '1') {
    el.triggerOffset += winHeight;
    if (el.triggerOffset > el.topOffset && el.triggerOffset <= winHeight) {
      el.triggerOffset = el.topOffset;
    }
    if (!t_animationExt__isOnlyScalableElem()) el.triggerOffset /= zoomValue;
  }
}

//TODO not used function

// function t_animateFix__reset(fixedEls) {
//   for (var i = 0; i < fixedEls.length; i++) {
//     var el = fixedEls[i];
//     $(el).css("transform", "");
//     el.fixedWrapperEl.css("position", "");
//     // if (isSafari) {
//     //   $(el).css({"position":""});
//     // }
//     el.fixedWrapperEl.removeClass("t-sticky_ended t-sticky_going");
//   }
// }

/**
 * wrap element
 */
function t_animateParallax__wrapEls() {
  var wrappingElements = document.querySelectorAll("[data-animate-prx='scroll'] .tn-atom, [data-animate-prx='mouse'] .tn-atom,[data-animate-prx-res-960='scroll'] .tn-atom, [data-animate-prx-res-960='mouse'] .tn-atom,[data-animate-prx-res-640='scroll'] .tn-atom, [data-animate-prx-res-640='mouse'] .tn-atom,[data-animate-prx-res-480='scroll'] .tn-atom, [data-animate-prx-res-480='mouse'] .tn-atom,[data-animate-prx-res-320='scroll'] .tn-atom, [data-animate-prx-res-320='mouse'] .tn-atom");
  Array.prototype.forEach.call(wrappingElements, function (wrappingElement) {
    var parent = wrappingElement.parentNode;
    var div = document.createElement('div');
    div.classList.add('tn-atom__prx-wrapper');
    div.style.display = 'table';
    div.style.width = 'inherit';
    div.style.height = 'inherit';
    var clonedEl = wrappingElement.cloneNode(true);
    div.appendChild(clonedEl);
    parent.appendChild(div);
    if (parent) {
      parent.removeChild(wrappingElement);
    }
  });
}

/**
 * init scroll
 * 
 * @returns {void}
 */
function t_animateParallax__initScroll() {
  var scrollElements = document.querySelectorAll("[data-animate-prx='scroll'],[data-animate-prx-res-960='scroll'],[data-animate-prx-res-640='scroll'],[data-animate-prx-res-480='scroll'],[data-animate-prx-res-320='scroll']");
  var scrollTop = window.pageYOffset;

  if (!scrollElements.length) return;

  var hiddenEls = [];

  Array.prototype.filter.call(scrollElements, function (scrollEl) {
    scrollEl.topOffset = scrollEl.getBoundingClientRect().top + window.pageYOffset;
    var scrollElHeight = t_animateExt__getPureHeight(scrollEl);
    scrollEl.bottomOffset = scrollEl.topOffset + scrollElHeight;

    // mark the ones, which are under viewport
    var atomWrapper = scrollEl.querySelector('.tn-atom__prx-wrapper');
    if (atomWrapper) {
      if (scrollEl.bottomOffset < scrollTop) {
        atomWrapper.setAttribute('data-above-parallax', 'true');
      } else {
        atomWrapper.setAttribute('data-above-parallax', 'false');
      }
    }
    // if elements are hidden, we add parallax, when they become visible why? because hidden elements return incorrect offset().top (always 0) and Rellax starts to add transform too early
    if (!scrollEl.offsetWidth
      && !scrollEl.offsetHeight
      && !scrollEl.getClientRects().length) {
      hiddenEls.push(scrollEl);
      return false;
    }

    if (atomWrapper) {
      // add speed
      var elSpeed = t_animationExt__getAttrByRes(scrollEl, 'prx-s');
      atomWrapper.setAttribute('data-rellax-speed', Math.round((parseInt(elSpeed) - 100) / 10));
    }
    return true;
  });

  // TODO: update onscroll param for elements above viewport, at the moment 01.11.2021 it works only for element under viewport
  if (scrollElements.length) {
    if (document.querySelectorAll('[data-above-parallax="true"]').length) {
      // eslint-disable-next-line no-undef
      Rellax('[data-above-parallax="true"]', {
        round: true,
        center: true
      });
    }

    if (document.querySelectorAll('[data-above-parallax="false"]').length) {
      // eslint-disable-next-line no-undef
      Rellax('[data-above-parallax="false"]', {
        round: true,
        onscroll: true
      });
    }
  }

  // onscroll - custom parameter, just for Tilda animation, not from original library

  // at the moment 27.12.2017 Rellax have two modes:
  // 1. it centeres elements when you scroll to them (and adds transform onready, before any scroll start, so elements jump and are not at their original positions);
  // 2. without centering it moves elements for too long distance;

  window.addEventListener('scroll', t_throttle(function () {
    var visibleEls = [];
    Array.prototype.filter.call(hiddenEls, function (hiddenElement) {
      if (hiddenElement.offsetWidth || hiddenElement.offsetHeight || hiddenElement.getClientRects().length) {
        visibleEls.push(hiddenElement);
        return false;
      }
      return true;
    });
    if (!visibleEls.length) return;
    var lastVisibleEl = visibleEls[visibleEls.length - 1];
    var elSpeed = t_animationExt__getAttrByRes(lastVisibleEl, 'prx-s');
    var curSelector = 'rellax' + Date.now();
    Array.prototype.forEach.call(visibleEls, function (visibleEl) {
      var atomWrapper = visibleEl.querySelector('.tn-atom__prx-wrapper');
      if (atomWrapper) {
        atomWrapper.setAttribute('data-rellax-speed', Math.round((parseInt(elSpeed) - 100) / 10));
      }
      visibleEl.classList.add(curSelector);
    });
    // eslint-disable-next-line no-undef
    Rellax('.' + curSelector, {
      round: true,
      onscroll: true
    });
  }, 50));
}

/**
 * init mouse animation
 * 
 * @returns {void}
 */
function t_animateParallax__initMouse() {
  var mouseElements = document.querySelectorAll("[data-animate-prx='mouse'],[data-animate-prx-res-960='mouse'],[data-animate-prx-res-640='mouse'],[data-animate-prx-res-480='mouse'],[data-animate-prx-res-320='mouse']");

  if (!mouseElements.length) return;

  // cash some information
  var winHeight = window.innerHeight;
  var winWidth = window.innerWidth;

  Array.prototype.forEach.call(mouseElements, function (mouseElement) {
    mouseElement.pathX = t_animationExt__getAttrByRes(mouseElement, 'prx-dx');
    mouseElement.pathY = t_animationExt__getAttrByRes(mouseElement, 'prx-dy');
    mouseElement.animEl = mouseElement.querySelectorAll('.tn-atom__prx-wrapper');
    t_animateParallax__cashOffsets(mouseElement);

    // cash offsets for images with lazyload, which are loaded later
    var elType = mouseElement.getAttribute('data-elem-type');
    if (elType === 'image') {
      t_animateParallax__cashOffsets__OnImgLoad(mouseElement);
    }
    t_animateParallax__moveEl(mouseElement, winHeight, winWidth);
  });

  window.addEventListener('resize', function () {
    winHeight = window.innerHeight;
    winWidth = window.innerWidth;
    Array.prototype.forEach.call(mouseElements, function (mouseElement) {
      t_animateParallax__cashOffsets(mouseElement);
    });
  }, 50);
}

/**
 * get height without padding
 * 
 * @param {HTMLElement} el - current element
 * @returns {number} - height without padding
 */
function t_animateExt__getPureHeight(el) {
  var elHeight = el.clientHeight || el.offsetHeight;
  var elPaddingTop = el.style.paddingTop || 0;
  var elPaddingBottom = el.style.paddingBottom || 0;
  return elHeight - (elPaddingTop + elPaddingBottom);
}

/**
 * save offset of element
 * 
 * @param {HTMLElement} el - current element
 */
function t_animateParallax__cashOffsets(el) {
  el.topOffset = el.getBoundingClientRect().top + window.pageYOffset;
  var elHeight = t_animateExt__getPureHeight(el);
  el.bottomOffset = el.topOffset + elHeight;
  // cash parent offset, if element is larger
  var parent = el.closest('.r');
  //JQUERY
  var parentOffsetTop = parent ? parent.getBoundingClientRect().top + window.pageYOffset : 0;
  var parentHeight = parent ? t_animateExt__getPureHeight(parent) : 0;
  var parentOffsetBottom = parentOffsetTop + parentHeight;
  if (parentOffsetTop > el.topOffset) {
    el.parentTopOffset = parentOffsetTop;
  }
  if (parentOffsetBottom < el.bottomOffset) {
    el.parentBottomOffset = parentOffsetBottom;
  }
}

/**
 * save offset of img
 * 
 * @param {HTMLElement} el - current element
 */
function t_animateParallax__cashOffsets__OnImgLoad(el) {
  // we need to catch load event for images, if lazyload is active
  if (window.lazy) {
    var currentImages = el.querySelectorAll('img');
    Array.prototype.forEach.call(currentImages, function (currentImage) {
      currentImage.addEventListener('load', t_animateParallax__cashOffsets(el));
    });
  }
}

/**
 * @param {HTMLElement} el - current element
 * @param {number} winHeight - window height
 * @param {number} winWidth - window width
 */
function t_animateParallax__moveEl(el, winHeight, winWidth) {
  var pathX = el.pathX;
  var pathY = el.pathY;
  var moveX = 0;
  var moveY = 0;
  var frameMoveX = 0;
  var frameMoveY = 0;
  var stop = false;

  document.body.addEventListener('mousemove', t_throttle(function (e) {
    if (typeof e == 'undefined' || window.innerWidth < 1200) return;
    var topActiveArea = e.pageY - e.clientY - 100;
    var bottomActiveArea = e.pageY + winHeight + 100;
    if (el.bottomOffset < topActiveArea || el.topOffset > bottomActiveArea) {
      return;
    }
    if (el.parentTopOffset > e.pageY || el.parentBottomOffset < e.pageY) {
      return;
    }

    // for large background image, which is larger than record (".r") height
    if (!pathX) {
      var winHalfX = winWidth / 2;
      var mouseCenterOffsetX = winHalfX - e.clientX;
      var moveIntensityX = mouseCenterOffsetX / winHalfX;
      moveX = Math.round(pathX * moveIntensityX);
    }
    if (!pathY) {
      var winHalfY = winHeight / 2;
      var mouseCenterOffsetY = winHalfY - e.clientY;
      var moveIntensityY = mouseCenterOffsetY / winHalfY;
      moveY = Math.round(pathY * moveIntensityY);
    }

    stop = false;
    t_animateParallax__moveEl__drawFrame();
  }, 50));

  /**
   * @returns {void}
   */
  function t_animateParallax__moveEl__drawFrame() {
    if (stop) { return; }

    requestAnimationFrame(t_animateParallax__moveEl__drawFrame);

    if (moveX != 0) {
      frameMoveX += (moveX - frameMoveX) * 0.02;
    }
    if (moveY != 0) {
      frameMoveY += (moveY - frameMoveY) * 0.02;
    }
    if (Math.abs(frameMoveX - moveX) < 1 && Math.abs(frameMoveY - moveY) < 1) {
      stop = true;
      return;
    }
    if (el && el.animEl.length) {
      Array.prototype.forEach.call(el.animEl, function (animatedEl) {
        animatedEl.style.transform = 'translate3d(' + frameMoveX + 'px, ' + frameMoveY + 'px, 0px)';
      });
    }
  }
}

/**
 * check old version of IE
 * 
 * @returns {boolean} - is old IE version
 */
function t_animateParallax__checkOldIE() {
  var sAgent = window.navigator.userAgent,
    Idx = sAgent.indexOf('MSIE'),
    ieVersion = '',
    oldIE = false;
  if (Idx > 0) {
    ieVersion = parseInt(sAgent.substring(Idx + 5, sAgent.indexOf('.', Idx)));
    if (ieVersion == 8 || ieVersion == 9 || ieVersion == 10) {
      oldIE = true;
    }
  }
  return oldIE;
}




// ------------------------------------------
// Rellax.js - v1.0.0
// Buttery smooth parallax library
// Copyright (c) 2016 Moe Amaya (@moeamaya)
// MIT license
//
// Thanks to Paraxify.js and Jaime Cabllero
// for parallax concepts
// ------------------------------------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Rellax = factory();
  }
}(this, function () {
  var Rellax = function (el, options) {
    'use strict';

    var self = Object.create(Rellax.prototype);

    var posY = 0; // set it to -1 so the animate function gets called at least once
    var screenY = 0;
    var posX = 0;
    var screenX = 0;
    var blocks = [];
    var pause = false;

    // check what requestAnimationFrame to use, and if
    // it's not supported, use the onscroll event
    var loop = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      function (callback) { setTimeout(callback, 1000 / 60); };

    // check which transform property to use
    var transformProp = window.transformProp || (function () {
      var testEl = document.createElement('div');
      if (testEl.style.transform === null) {
        var vendors = ['Webkit', 'Moz', 'ms'];
        for (var vendor in vendors) {
          if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
            return vendors[vendor] + 'Transform';
          }
        }
      }
      return 'transform';
    })();

    // limit the given number in the range [min, max]
    var clamp = function (num, min, max) {
      return (num <= min) ? min : ((num >= max) ? max : num);
    };

    // Default Settings
    self.options = {
      speed: -2,
      center: false,
      round: true,
      vertical: true,
      horizontal: false,
      callback: function () { },
    };

    // User defined options (might have more in the future)
    if (options) {
      Object.keys(options).forEach(function (key) {
        self.options[key] = options[key];
      });
    }

    // If some clown tries to crank speed, limit them to +-10
    self.options.speed = clamp(self.options.speed, -10, 10);

    // By default, rellax class
    if (!el) {
      el = '.rellax';
    }

    // check if el is a className or a node
    var elements = typeof el === 'string' ? document.querySelectorAll(el) : [el];

    // Now query selector
    if (elements.length > 0) {
      self.elems = elements;
    }

    // The elements don't exist
    else {
      throw new Error("The elements you're trying to select don't exist.");
    }


    // Let's kick this script off
    // Build array for cached element values
    // Bind scroll and resize to animate method
    var init = function () {
      screenY = window.innerHeight;
      screenX = window.innerWidth;
      setPosition();

      // Get and cache initial position of all elements
      for (var i = 0; i < self.elems.length; i++) {
        var block = createBlock(self.elems[i]);
        // Tilda custom parameter to fix too long moving distance
        if (self.options.onscroll) {
          block.inViewport = false;
        }
        blocks.push(block);
      }

      window.addEventListener('resize', function () {
        animate();
      });

      // Start the loop
      update();

      // The loop does nothing if the scrollPosition did not change
      // so call animate to make sure every element has their transforms
      animate();
    };


    // We want to cache the parallax blocks'
    // values: base, top, height, speed
    // el: is dom object, return: el cache values
    var createBlock = function (el) {
      var dataPercentage = el.getAttribute('data-rellax-percentage');
      var dataSpeed = el.getAttribute('data-rellax-speed');
      var dataZindex = el.getAttribute('data-rellax-zindex') || 0;

      // initializing at scrollY = 0 (top of browser), scrollX = 0 (left of browser)
      // ensures elements are positioned based on HTML layout.
      //
      // If the element has the percentage attribute, the posY and posX needs to be
      // the current scroll position's value, so that the elements are still positioned based on HTML layout
      var posY = self.options.vertical ? (dataPercentage || self.options.center ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) : 0) : 0;
      var posX = self.options.horizontal ? (dataPercentage || self.options.center ? (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft) : 0) : 0;

      // Tilda custom parameter
      if (self.options.onscroll) {
        posY = window.pageYOffset;
      }

      var blockTop = posY + el.getBoundingClientRect().top;
      var zoomValue = t_animationExt__getZoom(el);
      // for zoomed blocks
      blockTop *= zoomValue;
      var blockHeight = el.clientHeight || el.offsetHeight || el.scrollHeight;

      var blockLeft = posX + el.getBoundingClientRect().left;
      var blockWidth = el.clientWidth || el.offsetWidth || el.scrollWidth;

      // apparently parallax equation everyone uses
      var percentageY = dataPercentage ? dataPercentage : (posY - blockTop + screenY) / (blockHeight + screenY);
      var percentageX = dataPercentage ? dataPercentage : (posX - blockLeft + screenX) / (blockWidth + screenX);
      if (self.options.center) { percentageX = 0.5; percentageY = 0.5; }

      // Optional individual block speed as data attr, otherwise global speed
      // Check if has percentage attr, and limit speed to 5, else limit it to 10
      var speed = dataSpeed ? clamp(dataSpeed, -10, 10) : self.options.speed;
      if (dataPercentage || self.options.center) {
        speed = clamp(dataSpeed || self.options.speed, -5, 5);
      }

      var bases = updatePosition(percentageX, percentageY, speed);

      // ~~Store non-translate3d transforms~~
      // Store inline styles and extract transforms
      var style = el.style.cssText;
      var transform = '';

      // Check if there's an inline styled transform
      if (style.indexOf('transform') >= 0) {
        // Get the index of the transform
        var index = style.indexOf('transform');

        // Trim the style to the transform point and get the following semi-colon index
        var trimmedStyle = style.slice(index);
        var delimiter = trimmedStyle.indexOf(';');

        // Remove "transform" string and save the attribute
        if (delimiter) {
          transform = ' ' + trimmedStyle.slice(11, delimiter).replace(/\s/g, '');
        } else {
          transform = ' ' + trimmedStyle.slice(11).replace(/\s/g, '');
        }
      }

      return {
        baseX: bases.x,
        baseY: bases.y,
        top: blockTop,
        left: blockLeft,
        height: blockHeight,
        width: blockWidth,
        speed: speed,
        style: style,
        transform: transform,
        zindex: dataZindex
      };
    };

    // set scroll position (posY, posX)
    // side effect method is not ideal, but okay for now
    // returns true if the scroll changed, false if nothing happened
    var setPosition = function () {
      var oldY = posY;
      var oldX = posX;

      if (window.pageYOffset !== undefined) {
        posY = window.pageYOffset;
      } else {
        posY = (document.documentElement || document.body.parentNode || document.body).scrollTop;
      }

      if (window.pageXOffset !== undefined) {
        posX = window.pageXOffset;
      } else {
        posX = (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      }

      if (oldY != posY && self.options.vertical) {
        // scroll changed, return true
        return true;
      }

      if (oldX != posX && self.options.horizontal) {
        // scroll changed, return true
        return true;
      }

      // scroll did not change
      return false;
    };


    // Ahh a pure function, gets new transform value
    // based on scrollPosition and speed
    // Allow for decimal pixel values
    var updatePosition = function (percentageX, percentageY, speed) {
      var result = {};
      var valueX = (speed * (100 * (1 - percentageX)));
      var valueY = (speed * (100 * (1 - percentageY)));

      result.x = self.options.round ? Math.round(valueX) : Math.round(valueX * 100) / 100;
      result.y = self.options.round ? Math.round(valueY) : Math.round(valueY * 100) / 100;

      return result;
    };


    //
    var update = function () {
      if (setPosition() && pause === false) {
        animate();
      }

      // loop again
      loop(update);
    };

    // Transform3d on parallax element
    var animate = function () {
      for (var i = 0; i < self.elems.length; i++) {
        if (self.options.onscroll && blocks[i].top > (posY + screenY)) {
          continue;
        }

        var percentageY = ((posY - blocks[i].top + screenY) / (blocks[i].height + screenY));
        var percentageX = ((posX - blocks[i].left + screenX) / (blocks[i].width + screenX));

        // Subtracting initialize value, so element stays in same spot as HTML
        var positions = updatePosition(percentageX, percentageY, blocks[i].speed);// - blocks[i].baseX;
        if (blocks[i].inViewport == false) {
          blocks[i].baseY = positions.y;
          blocks[i].baseX = positions.x;
        }
        blocks[i].inViewport = true;
        var positionY = positions.y - blocks[i].baseY;
        var positionX = positions.x - blocks[i].baseX;

        var zindex = blocks[i].zindex;

        // Move that element
        // (Set the new translation and append initial inline transforms.)
        var translate = 'translate3d(' + (self.options.horizontal ? positionX : '0') + 'px,' + (self.options.vertical ? positionY : '0') + 'px,' + zindex + 'px) ' + blocks[i].transform;
        self.elems[i].style[transformProp] = translate;
      }
      self.options.callback(positions);
    };


    self.destroy = function () {
      for (var i = 0; i < self.elems.length; i++) {
        self.elems[i].style.cssText = blocks[i].style;
      }
      pause = true;
    };


    init();
    return self;
  };
  return Rellax;
}));


// Polyfill: Element.matches
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