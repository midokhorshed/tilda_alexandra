function t_hoverZoom_init(recid) {
    var rec = $('#rec' + recid);
    var div = rec.find('.t-slds__container .t-slds__bgimg');

    div.each(function () {
        var parent = $(this).parent();
        var image = new Image();
        image.classList.add('js-image-zoom-hover');
        var url = $(this).attr('data-original');

        /* if dont have image - return */
        if (typeof url != 'undefined') {
            if (url.indexOf('/-/empty/') >= 0 || url == '') {
                return;
            }
        } else {
            return;
        }

        /* set hidden, for zoomImage with pos absolute doesn't move from parent */
        parent.css({
            overflow: 'hidden'
        });

        t_hoverZoom_addScaledEl(recid, parent, image, url);
    });

    $('head').append('<style>.t-slds__imgwrapper {position: relative;} .t-slds__item_active.t-slds__item .js-image-zoom-hover {display:block;} .t-slds__item .js-image-zoom-hover {display:none;}</style>');
}

function t_hoverZoom_addScaledEl(recid, parent, image, url) {
    var rec = $('#rec' + recid);

    var zoomImage = $(image);
    zoomImage.load(function () {
        var parentForOffset = rec.find('.t-slds__item_active');
        var parentWidth = parentForOffset.outerWidth();
        var parentHeight = parentForOffset.outerHeight();
        var xRatio;
        var yRatio;
        var timer;
        var delay = 0;
        var fade = 200;
        var offset = parentForOffset.offset();
        var zoomEnable = false;

        /* add image only if there is no image inside  */
        if (parent.find('img')[0]) {
            return;
        }

        if (parentWidth > this.width || parentHeight > this.height) {
            return;
        } else {
            $(this)
                .css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    width: image.width,
                    height: image.height,
                    maxWidth: 'none'
                })
                .mouseenter(function (el) {
                    parentForOffset = $(this).parent();
                    offset = parentForOffset.offset();
                    var _this = $(this);
                    timer = setTimeout(function () {
                        parentWidth = parentForOffset.outerWidth();
                        parentHeight = parentForOffset.outerHeight();

                        xRatio = -(image.width - parentWidth) / parentWidth;
                        yRatio = -(image.height - parentHeight) / parentHeight;
                        _this
                            .css('left', (el.pageX - offset.left) * xRatio)
                            .css('top', (el.pageY - offset.top) * yRatio);
                        _this.stop().fadeTo(fade, 1);
                    }, delay);
                })
                .mousemove(function (el) {
                    offset = parentForOffset.offset();
                    $(this)
                        .css('left', (el.pageX - offset.left) * xRatio)
                        .css('top', (el.pageY - offset.top) * yRatio);
                })
                .mouseleave(function () {
                    clearTimeout(timer);
                    $(this)
                        .stop()
                        .fadeTo(fade, 0);
                    var _this = $(this);
                    setTimeout(function () {
                        _this.css('left', 0).css('top', 0);
                    }, 200);
                });
            $(this).appendTo(parent);

            zoomEnable = true;

            if (zoomEnable && $('#rec' + recid + '-zoomEnable').length < 1) {
                $("<style id='rec" + recid + "-zoomEnable'>" +
                    '#rec' + recid + ' .t-slds__arrow_wrapper { pointer-events: none }' +
                    '#rec' + recid + ' .t-slds__arrow { pointer-events: all }' +
                    '</style>').appendTo(parent);
            }
        }
    });

    zoomImage.attr('src', url);
}