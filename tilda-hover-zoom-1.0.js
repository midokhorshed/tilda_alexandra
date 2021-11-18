// eslint-disable-next-line no-unused-vars
function t_hoverZoom_init(recid) {
    var parentHZContainer = document.getElementById('rec' + recid);
    if (!parentHZContainer) return false;
    var hoverZoomContainers = parentHZContainer.querySelectorAll('.t-slds__bgimg');
    if (!hoverZoomContainers.length) return false;

    hoverZoomContainers.forEach(function (imgBlock) {
        var parent = imgBlock.parentNode;
        var img = document.createElement('img');
        img.classList.add('js-image-zoom-hover');
        var url = imgBlock.getAttribute('data-original');
        // if hasn't img - return false
        if (!url) return false;
        if (~url.indexOf('/-/empty/') || url === '') return false;
        //set overflow hidden for parent with pos absolute (doesn't move from parent)
        parent.style.overflow = 'hidden';
        t_hoverZoom_addScaledEl(recid, parent, img, url, parentHZContainer);
    });
    document.head.insertAdjacentHTML('beforeend', '<style>.t-slds__imgwrapper {position: relative;} .t-slds__item_active.t-slds__item .js-image-zoom-hover {display:block;} .t-slds__item .js-image-zoom-hover {display:none;}</style>');
}

function t_hoverZoom_addScaledEl(recid, parent, img, url, parentHZContainer) {
    img.onload = function () {
        var parentForOffset = parentHZContainer.querySelector('.t-slds__item_active');
        var parentWidth = parentForOffset.offsetWidth;
        var parentHeight = parentForOffset.offsetHeight;
        var xRatio;
        var yRatio;
        var timer;
        var delay = 0;
        var fade = 200;
        var offset = t_hover_zoom__getCoords(parentForOffset);
        var zoomEnable = false;
        var zoomEnambleContainers = document.querySelectorAll('#rec' + recid + '-zoomEnable');

        //if parent has img inside - don't add img
        if (parent.querySelector('img')) {
            return false;
        }
        //"this" in this context - img
        if (parentWidth > this.width || parentHeight > this.height) {
            return false;
        }
        this.style.cssText = 'position: absolute; top: 0; left: 0; opacity: 0; width: ' + this.width + 'px; height: ' + this.height + 'px; max-width: none;';

        this.addEventListener('mouseenter', function (e) {
            //if screen width changed
            parentForOffset = img.parentNode;
            offset = t_hover_zoom__getCoords(parentForOffset);
            timer = setTimeout(function () {
                parentWidth = parentForOffset.offsetWidth;
                parentHeight = parentForOffset.offsetHeight;

                xRatio = (parentWidth - img.width) / parentWidth;
                yRatio = (parentHeight - img.height) / parentHeight;

                //"this" in this context - NOT img, use "img"
                img.style.left = ((e.pageX - offset.left) * xRatio) + 'px';
                img.style.top = ((e.pageY - offset.top) * yRatio) + 'px';
            }, delay);
        });

        this.addEventListener('mousemove', function (e) {
            offset = t_hover_zoom__getCoords(parentForOffset);
            img.style.left = ((e.pageX - offset.left) * xRatio) + 'px';
            img.style.top = ((e.pageY - offset.top) * yRatio) + 'px';
        });

        this.addEventListener('mouseleave', function () {
            clearTimeout(timer);
        });

        t_hover_zoom_hoverFade(img, fade);

        parent.append(this);

        zoomEnable = true;

        if (zoomEnable && zoomEnambleContainers.length > 1) {
            parent.insertAdjacentHTML('beforeend', '<style id="rec' + recid + '-zoomEnable">' + '#rec' + recid + ' .t-slds__arrow_wrapper { pointer-events: none }' + '#rec' + recid + ' .t-slds__arrow { pointer-events: all }' + '</style>');
        }

    };

    img.setAttribute('src', url);

    function t_hover_zoom_hoverFade(el, duration) {
        if (!el) return false;
        //timerFadeIn need to clear interval, when user leaves this el area
        var timerFadeIn;
        el.addEventListener('mouseenter', function () {
            var opacityPercent = +(el.style.opacity) * 100;
            //fadeIn when mouse enters the el area
            timerFadeIn = setInterval(function () {
                if (opacityPercent < 100) {
                    ++opacityPercent;
                    el.style.opacity = opacityPercent / 100;
                } else {
                    clearInterval(timerFadeIn);
                }
            }, (duration / 200));
        });
        el.addEventListener('mouseleave', function () {
            clearInterval(timerFadeIn);
            var opacityPercent = +(el.style.opacity) * 100;
            //fadeOut func
            var timerFadeOut = setInterval(function () {
                if (opacityPercent > 0) {
                    --opacityPercent;
                    el.style.opacity = opacityPercent / 100;
                } else {
                    clearInterval(timerFadeOut);
                }
            }, (duration / 200));
        });
    }

    //analog of the $.offset();
    function t_hover_zoom__getCoords(element) {
        if (element) {
            var rect = element.getBoundingClientRect();
            var top = rect.top + window.pageYOffset;
            var left = rect.left + window.pageXOffset;
            return { top: top, left: left };
        }
    }
}