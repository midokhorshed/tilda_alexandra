/** 
 * tilda-feed draws a news feed with different settings and data
 * blocks FD101, FD201, FD301, FD302
 */

function t_feed_init(recid, opts) {
    window.tFeedPosts = {};

    t_feed_createObjWithPosts();
    var rec = document.querySelector('#rec' + recid);
    var records = document.querySelector('#allrecords');
    var feed = rec.querySelector('.js-feed');
    var preloader = rec.querySelector('.js-feed-preloader');
    var gridType = feed.getAttribute('data-feed-grid-type');
    var pageMode = records.getAttribute('data-tilda-mode');
    opts.isPublishedPage = pageMode !== 'edit' && pageMode !== 'preview';

    if ((opts.btnText && opts.amountOfPosts) || opts.btnAllPosts.text) {
        if (gridType === 'side-panel') {
            var panelFeed = rec.querySelector('.t-feed__feed-wrapper');
            panelFeed.insertAdjacentHTML('beforeend', t_feed_drawBtnsContainer(opts));
        } else {
            feed.insertAdjacentHTML('beforeend', t_feed_drawBtnsContainer(opts));
        }
    }

    if (window.lazy === 'y' || records.getAttribute('data-tilda-lazy') === 'yes') {
        t_feed_onFuncLoad('t_lazyload_update', function () {
            t_lazyload_update();
        });
    }

    setTimeout(function () {
        if (preloader) {
            preloader.classList.remove('t-feed__post-preloader__container_hidden');
        }
    }, 1500);

    t_feed_showLoadersForPostsList(recid);
    if (window.location.hash.indexOf('#!/tfeeds') != -1) {
        t_feed_loadPosts(recid, opts, 1, false, t_feed_loadPartPosts);
    } else if (gridType === 'side-panel') {
        t_feed_loadPanelPosts(recid, opts);
    } else {
        t_feed_loadPosts(recid, opts, 1, false);
    }
    t_feed_showMore(recid, opts);

    if (feed.getAttribute('data-feed-grid-type') == 'col') {
        window.addEventListener('resize', t_throttle(function () {
            t_feed_unifyColHeights(recid, opts);
        }, 200));

        feed.addEventListener('displayChanged', function () {
            t_feed_unifyColHeights(recid, opts);
        });
    }

    window.onpopstate = function () {
        var body = document.body;
        body.classList.remove('t-zoomer__show');
        body.classList.remove('t-zoomer__show_fixed');

        if (window.history.state !== null) {
            var obj = window.history.state.obj;
            var post = window.history.state.post;
            t_feed_workPostPopup(recid, obj, post, post.uid, opts);
        } else if (body.classList.contains('t-body_popupshowed')) {
            t_feed_closePopup(recid, opts, window.location.href);
        }
    };
}


/**
 * Show posts from the current part
 * @param {string} recid – recid of current block
 * @param {object} opts – object with feed settings
 * @param {number} slice – number of the current phase in pagination (before the "Show more" button)
 */
function t_feed_loadPartPosts(recid, opts, slice) {
    var rec = document.querySelector('#rec' + recid);
    var switchers = rec.querySelectorAll('.js-feed-parts-switcher');
    Array.prototype.forEach.call(switchers, function(switcher){
        var hashArr = decodeURI(window.location.hash).split('/');
        var isPartTitle = switcher.getAttribute('data-feedpart-title') == hashArr[hashArr.length - 1];
        var isUid = switcher.closest('.js-feed').getAttribute('data-feed-uid') == hashArr[hashArr.length - 3];
        if (isPartTitle && isUid) {
            var feedpartuid = switcher.getAttribute('data-feedpart-uid');
            opts.feeduid = opts.feeduid.split('-')[0] + '-' + feedpartuid;
            rec.querySelector('.t-active').classList.remove('t-active');
            switcher.classList.add('t-active');
        }
    });
    
    window.tFeedPosts[recid]['switcher'] = true;
    window.tFeedPosts[recid]['count'] = 0;

    t_feed_loadPosts(recid, opts, slice, false);

    if (window.location.href.indexOf('#!/tfeeds') != -1) {
        var hashArr = decodeURI(window.location.hash).split('/');
        var uid = hashArr[hashArr.length - 3];
        var feed = document.querySelector('.js-feed[data-feed-uid="' + uid + '"]');
        var offset = feed.getBoundingClientRect();
        var offsetTop = typeof offset !== 'undefined' ? offset.top + window.pageYOffset : 0;
        t_feed_scrollToFeed(feed, offsetTop);
    }
}


/**
 * Scroll to the current feed on load or after closing the popup
 * @param {HTMLElement} feed – current feed
 * @param {number} offsetTop – top coordinate of current feed
 */
function t_feed_scrollToFeed(feed, offsetTop) {
    var top = typeof offsetTop !== 'undefined' && typeof feed.getBoundingClientRect() !== 'undefined' ? offsetTop - 100 : 0;
    window.scrollTo({
        top: top
    });
}


/**
 * Create a separate object for each news feed
 */
function t_feed_createObjWithPosts() {
    var feeds = document.querySelectorAll('.js-feed');
    Array.prototype.forEach.call(feeds, function(feed) {
        var id = feed.getAttribute('data-feed-recid');
        window.tFeedPosts[id] = {};
        if (typeof window.tFeedPosts[id] != 'undefined') {
            window.tFeedPosts[id]['count'] = 0;
            window.tFeedPosts[id]['switcher'] = false;
        }
    });
}

/**
 * Load posts – all or from current part
 * @param {string} recid – recid of current feed
 * @param {object} opts – object with all settings
 * @param {number} slice – number of step in "pagination" after clickin on the "Show more" button
 * @param {boolean} showmore – boolean to understand that posts are loaded after clicking on the "Show more" button
 * @param {Function} callback – function for load posts from current part
 */
function t_feed_loadPosts(recid, opts, slice, showmore, callback) {
    var rec = document.querySelector('#rec' + recid);
    var records = document.querySelector('.t-records');
    var btnShowMore = document.querySelector('.js-feed-btn-show-more');
    var isFirstSlice = !slice || parseInt(slice) === 1;
    var dataObj = t_feed_createDataObjForRequest(
        recid,
        opts,
        isFirstSlice,
        slice
    );
    var apiUrl = 'https://feeds.tildacdn.com/api/getfeed/';
    // inside tilda we get data from another url
    if (!opts.isPublishedPage) {
        dataObj.projectid = records.getAttribute('data-tilda-project-id');
        apiUrl = 'https://tilda.cc/projects/feeds/getfeed/';
    }
    if (btnShowMore) {
        btnShowMore.style.pointerEvents = 'none';
        btnShowMore.style.opacity = '0.7';
    }

    var ts = Date.now();

    var t_feed__serializeData = function(obj, prefix) {
        var str = [];
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                var key = prefix ? prefix + '[' + property + ']' : property;
                var value = obj[property];
                str.push((value !== null && typeof v === 'object') ?
                    t_feed__serializeData(value, key) :
                    encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        return str.join('&');
    };

    var request = new XMLHttpRequest();
    request.open('GET', apiUrl + '?' + t_feed__serializeData(dataObj), true);
    request.timeout = 1000 * 25;
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {

            var preloader = rec.querySelector('.js-feed-preloader');
            var container = rec.querySelector('.js-feed-container');

            if (request.response === '') {
                return;
            }

            try {
                var obj = JSON.parse(request.response);
            } catch (e) {
                if (preloader.parentNode !== null) {
                    preloader.parentNode.removeChild(preloader);
                }
                container.insertAdjacentHTML('beforeend', t_feed_drawErrorBox(opts, request.response));
            }

            if (typeof obj !== 'object') {
                return;
            }

            if ('error' in JSON.parse(request.response)) {
                setTimeout(function () {
                    if (preloader.parentNode !== null) {
                        preloader.parentNode.removeChild(preloader);
                    }
                    container.insertAdjacentHTML('beforeend', t_feed_drawErrorBox(opts, JSON.parse(request.response).error));
                }, 500);
            }

            var feed = rec.querySelector('.js-feed');
            feed.setAttribute('data-feed-uid', obj.feeduid);

            if (!window.tFeedPosts[recid]) {
                window.tFeedPosts[recid] = {};
            }

            window.tFeedPosts[recid]['lang'] = obj.feedlang;

            // clear preloader timeout
            clearTimeout(rec.getAttribute('data-preloader-timeout'));

            // hide preloader, if it was shown
            if (preloader) {
                if (preloader.parentNode !== null) {
                    preloader.parentNode.removeChild(preloader);
                }
            }

            if (isFirstSlice) {
                container.innerHTML = '';
            }

            if (typeof obj['posts'] != 'undefined') {
                var slice = parseInt(obj.slice, 10);
                var total = parseInt(obj.total, 10);
                if (slice < total || slice === total) {
                    t_feed_generatePosts(obj, obj['posts'], recid, opts, showmore);
                } else if (typeof obj['posts'] != 'undefined' && obj['posts'].length === 0) {
                    container.insertAdjacentHTML('beforeend', t_feed_drawEmptyMessage(opts, recid));
                    return;
                }

                var switchers = rec.querySelectorAll('.js-feed-parts-switcher');
                if (obj['posts'].length !== 0 && obj.parts && obj.parts.length > 1 && switchers.length === 0 && !opts.hideFeedParts) {
                    t_feed_addFeedParts(recid, opts, obj.parts, obj.feeduid);
                }
            }

            if (typeof callback != 'undefined') {
                callback(recid, opts, slice, showmore);
            }

            var posts = rec.querySelectorAll('.t-feed__post');
            Array.prototype.forEach.call(posts, function(post){
                post.classList.remove('t-feed__post_hidden');
            });

            if (btnShowMore) {
                btnShowMore.style.pointerEvents = 'inherit';
                btnShowMore.style.opacity = '1';
            }

            t_feed_displayButtons(recid, obj.nextslice, (obj.posts || []).length);        
        }
    };

    request.onerror = function(xhr) {
        var ts_delta = Date.now() - ts;
        if (xhr.status == 0 && ts_delta < 100 && xhr.readyState !== 0) {
            alert('Request error (get posts). Please check internet connection...');
        }
    };

    request.send();
}


/**
 * Function for t946 (not on production)
 */
function t_feed_loadPanelPosts(recid, opts) {
    var feeds = JSON.parse(localStorage.getItem('tFeeds'));
    // Если виджет хоть раз открывался, загрузить посты через 3 секунды
    // Если нет, то t_feed_loadPosts будет вызван из блока t946 при клике на кнопку виджета
    if (feeds && feeds['isEverLoaded']) {
        setTimeout(function () {
            t_feed_loadPosts(recid, opts, 1, false);
        }, 3000);
    }
}


function t_feed_createDataObjForRequest(recid, opts, isFirstSlice, slice) {
    var size = opts.amountOfPosts;
    var currentDate = Date.now();
    var dateFilter = opts.dateFilter;
    var obj = {
        feeduid: opts.feeduid,
        recid: recid,
        c: currentDate,
        size: size,
        slice: slice,
        sort: {
            date: opts.reverse
        },
        filters: {
            date: {}
        }
    };

    if (dateFilter === 'all') {
        obj.filters.date = '';
    } else {
        obj.filters.date[dateFilter] = 'now';
    }

    if (slice) {
        obj.slice = slice;
    }

    if (isFirstSlice) {
        obj.getparts = true;
    }

    return obj;
}


function t_feed_displayButtons(recid, nextslice, arrLength) {
    var rec = document.querySelector('#rec' + recid);
    var btnsWrapper = rec.querySelector('.t-feed__buttons-wrapper');
    var btnShowMore = rec.querySelector('.js-feed-btn-show-more');
    var btnShowAll = rec.querySelector('.js-feed-btn-show-all-posts');

    if (btnsWrapper) {
        btnsWrapper.classList.remove('t-feed__buttons-wrapper_hidden');

        if (btnShowMore) {
            btnShowMore.style.display = typeof nextslice === 'undefined' ? 'none' : 'block';
        }

        if (btnShowAll) {
            btnShowAll.style.display = arrLength === 0 ? 'none' : 'block';
        }
    }
}


/**
 * Render current posts
 * @param {object} obj – object with data which came from the backend
 * @param {Array} feedArr – array with posts to be rendered
 * @param {string} recid – recid of current feed
 * @param {object} opts – object with feed settings
 * @param {boolean} showmore – boolean to understand that posts are loaded after clicking on the "Show more" button
 */
function t_feed_generatePosts(obj, feedArr, recid, opts, showmore) {
    var rec = document.querySelector('#rec' + recid);
    var feedContainer = rec.querySelector('.js-feed-container');
    var gridType = rec.querySelector('.js-feed').getAttribute('data-feed-grid-type');
    var feedHTML = '';

    if (typeof feedArr !== 'undefined') {
        for (var i = 0; i < feedArr.length; i++) {
            var post = feedArr[i];
            if (gridType === 'col') {
                feedHTML += '' + t_feed_drawSeparator(recid, opts);
            }
            feedHTML += t_feed_drawWholePost(recid, post, opts);
            window.tFeedPosts[recid]['count'] = window.tFeedPosts[recid]['count'] + 1;
            window.tFeedPosts[recid][post.uid] = post;
        }
    }

    var scrollTop = window.pageYOffset;

    // change DOM
    feedContainer.insertAdjacentHTML('beforeend', feedHTML);

    // return to previous scrollTop
    window.scrollTop = scrollTop;

    t_feed_initPopup(recid, obj, window.tFeedPosts, opts);
    t_feed_unifyColHeights(recid, opts);

    if (document.fonts !== undefined) {
        if (document.fonts.ready !== undefined) {
            document.fonts.ready.then(function () {
                setTimeout(function () {
                    t_feed_unifyColHeights(recid, opts);
                }, 1000);
            });
        }
    } else {
        // for IE and old Edge
        setTimeout(function () {
            t_feed_unifyColHeights(recid, opts);
        }, 1000);
    }

    if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
        t_feed_onFuncLoad('t_lazyload_update', function () {
            t_lazyload_update();
        });
    }

    if (showmore) {
        if (typeof t_animate__startAnimation === 'function') {
            t_animate__startAnimation();
        }
    }

    if (!opts.previewmode) {
        try {
            addEditFieldEvents_new(recid);
        } catch (e) {
            console.log(e);
        }
    }
}

/**
 * Draw vertical spacing between elements if it needed
 * @param {string} recid – recid of current block
 * @param {object} opts – object with feed settings
 * @returns 
 */
function t_feed_drawSeparator(recid, opts) {
    var str = '';
    if (window.tFeedPosts[recid]['count'] > 0 && window.tFeedPosts[recid]['count'] % opts.blocksInRow === 0) {
        str += '<div class="t-clear t-feed__grid-separator" style="margin-bottom:' + opts.vindent + '"></div>';
    }
    return str;
}


function t_feed_showMore(recid, opts) {
    var rec = document.querySelector('#rec' + recid);
    var feedContainer = rec.querySelector('.js-feed-container');
    var btnShowMore = rec.querySelector('.js-feed-btn-show-more');
    var slice = 1;

    if (btnShowMore !== null) {
        btnShowMore.addEventListener('click', function (e) {
            e.preventDefault();
            if (!window.tFeedPosts[recid]['switcher']) {
                slice++;
            } else {
                slice = 2;
            }
            window.tFeedPosts[recid]['switcher'] = false;
            t_feed_loadPosts(recid, opts, slice, true);
        });

        if (opts.isHorizOnMob) {
            feedContainer.addEventListener('scroll', t_throttle(function () {
                var scrollWidth = feedContainer.scrollWidth;
                var scrollLeft = feedContainer.scrollLeft;
                var outerWidth = feedContainer.offsetWidth;
                if (outerWidth + scrollLeft + 20 > scrollWidth && getComputedStyle(btnShowMore)['display'] !== 'none') {
                    btnShowMore.click();
                }
            }, 200));
        }
    }
}


/**
 * Switch between parts
 * @param {string} recid – recid of current block
 * @param {object} opts – object with feed settings
*/
function t_feed_initFeedParts(recid, opts) {
    var rec = document.querySelector('#rec' + recid);
    var switchers = rec.querySelectorAll('.js-feed-parts-switcher');

    Array.prototype.forEach.call(switchers, function(switcher){
        switcher.addEventListener('click', function () {
            var self = this;
            var btnAll = rec.querySelector('.t-feed__parts-switch-btn-all');
            var feedpartuid = self.getAttribute('data-feedpart-uid');

            // change active btn
            rec.querySelector('.t-active').classList.remove('t-active');

            self.classList.add('t-active');

            // redraw table
            opts.feeduid = opts.feeduid.split('-')[0] + '-' + feedpartuid;
            window.tFeedPosts[recid]['switcher'] = true;
            window.tFeedPosts[recid]['count'] = 0;

            if (btnAll.classList.contains('t-feed__parts-switch-btn_hide') && !opts.showPartAll) {
                btnAll.classList.remove('t-feed__parts-switch-btn_hide');
            }

            t_feed_showLoadersForPostsList(recid);
            t_feed_loadPosts(recid, opts, 1, true);

            if (self.classList.contains('t-feed__parts-switch-btn-all')) {
                history.replaceState({}, null, window.location.href.split('#')[0]);
            }
        });
    });
}


/**
 * Add skeleton on slow loading
 * @param {string} recid – recid of current block
 * @returns 
 */
function t_feed_showLoadersForPostsList(recid) {
    var rec = document.querySelector('#rec' + recid);
    var posts = rec.querySelectorAll('.t-feed__post');
    var btnShowMore = rec.querySelector('.t-feed__show-more-btn');
    var preloader = rec.querySelector('.js-feed-preloader');
    // hide animation for current cards
    Array.prototype.forEach.call(posts, function(post){
        post.classList.add('t-feed__post_hidden');
    });
    if (btnShowMore) {
        btnShowMore.classList.add('t-feed__show-more-btn_hidden');
    }

    // show preloader in 1000ms, if server will answer for a long time
    if (!preloader) return;
    var preloaderTimerId = setTimeout(function () {
        preloader.style.display = '';
        preloader.style.opacity = '0';
        preloader.style.transitionDuration = '0.2s';
        preloader.style.opacity = '1';
    }, 1000);
    rec.setAttribute('data-preloader-timeout', preloaderTimerId);
}


/**
 * Generate html for whole post
 * @param {string} recid – recid of current block
 * @param {object} post – JSON with data for post
 * @param {object} opts – object with feed settings
 * @returns 
 */
function t_feed_drawWholePost(recid, post, opts) {
    var rec = document.querySelector('#rec' + recid);
    var records = document.querySelector('.t-records');
    var feed = rec.querySelector('.js-feed');
    var gridType = feed.getAttribute('data-feed-grid-type');
    var gridColModification = feed.getAttribute('data-feed-col-modification');

    var url = post.directlink ? post.directlink : '#postpopup';
    var target = post.directtarget == '_blank' ? 'target="_blank"' : '';
    var alignClass = opts.align === 'left' ? 't-align_left' : 't-align_center';
    var animClass = opts.itemsAnim && opts.previewmode ? 't-animate' : '';

    if (records.getAttribute('data-blocks-animationoff')) {
        animClass = '';
    }

    var animAttr = opts.itemsAnim ? 'data-animate-style="' + opts.itemsAnim + '" data-animate-chain="yes"' : '';
    var gridClass = '';
    var linkHTML = {
        open: opts.previewmode ? '<a href="' + url + '" ' + target + ' class="js-feed-post-link">' : '',
        close: opts.previewmode ? '</a>' : ''
    };

    if (gridType === 'row' || gridType === 'row-bigimg') {
        gridClass = 't-col t-col_' + opts.colClass + ' t-prefix_' + opts.prefixClass;
    } else if (gridType === 'col') {
        gridClass = opts.blocksClass + ' ' + alignClass;
    }

    var str = '';
    str += '<div class="js-feed-post t-feed__post t-feed__post_hidden t-item ' + gridClass + ' ' + animClass + '" ' + animAttr + ' data-post-uid="' + post.uid + '">';

    if (gridType === 'row' && !opts.separator.hideSeparator) {
        str += '' + t_feed_drawPostSeparatorLine(opts);
    }
    str += linkHTML.open;
    if (gridType === 'row' || gridType === 'side-panel') {
        str += '' + t_feed_drawRowType(post, opts, recid);
    } else if (gridType === 'col') {
        str += '' + t_feed_drawColType(post, opts, gridColModification, recid);
    } else if (gridType === 'row-bigimg') {
        str += '' + t_feed_drawRowBigImgType(post, opts, recid);
    }
    str += linkHTML.close;
    str += '</div>';
    return str;
}


/**
 * Generate layout for FD20*
 * @param {object} post – JSON with data for post
 * @param {object} opts – object with feed settings
 * @param {string} recid – recid of current block
 * @returns 
 */
function t_feed_drawRowBigImgType(post, opts, recid) {
    var titleMargin;
    if (opts.imagePos === 'aftertitle') {
        if (opts.datePos !== 'aftertitle' && opts.partsPos !== 'aftertitle') {
            titleMargin = true;
        } else {
            titleMargin = false;
        }
    } else {
        titleMargin = false;
    }

    var str = '';
    str += '<div class="t-feed__row-bigimg-grid__post-wrapper">';

    if (opts.imagePos == 'beforetitle') {
        str += '' + t_feed_drawImageInRowBig(opts, post, 'beforetitle', recid);
    }

    if ((opts.showDate && opts.datePos == 'beforetitle') || (opts.showParts && post.postparts.length > 0 && opts.partsPos == 'beforetitle')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'beforetitle', 'col', recid);
    }

    str += '' + t_feed_drawTitle(opts, post, 'medium', titleMargin);

    if ((opts.showDate && opts.datePos == 'aftertitle') || (opts.showParts && post.postparts.length > 0 && opts.partsPos == 'aftertitle')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'aftertitle', 'col', recid);
    }

    if (opts.imagePos == 'aftertitle') {
        str += '' + t_feed_drawImageInRowBig(opts, post, 'aftertitle', recid);
    }

    if (opts.showShortDescr) {
        str += '    <div class="t-feed__textwrapper">';
        str += '' + t_feed_drawDescr(opts, post, 'medium');
        str += '    </div>';
    }

    if ((opts.showDate && opts.datePos == 'afterdescr') || (opts.showParts && post.postparts.length > 0 && opts.partsPos == 'afterdescr')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'afterdescr', 'col', recid);
    }

    if (opts.imagePos == 'afterdescr') {
        str += '' + t_feed_drawImageInRowBig(opts, post, 'afterdescr', recid);
    }

    str += '  </div>';
    str += '</div>';

    return str;
}


/**
 * Generate layout for FD10*
 * @param {object} post – JSON with data for post
 * @param {object} opts – object with feed settings
 * @param {string} recid – recid of current block
 * @returns 
 */
function t_feed_drawRowType(post, opts, recid) {
    var rec = document.querySelector('#rec' + recid);
    var gridType = rec.querySelector('.js-feed').getAttribute('data-feed-grid-type');
    var imageUrl = post.thumb ? post.thumb : post.image;

    var str = '';
    if (gridType === 'side-panel') {
        str += '<div class="t-feed__row-grid__post-wrapper t-feed__row-grid__post-wrapper_panel">';
    } else {
        var paddingClass = opts.separator.hideSeparator ? ' t-feed__row-grid__post-wrapper_padd-sm' : '';
        str += '<div class="t-feed__row-grid__post-wrapper' + paddingClass + '">';
    }

    if (post.mediatype === 'video') {
        if (post.mediadata.indexOf('vimeo') !== -1 && post.thumb === '') {
            imageUrl = 'https://static.tildacdn.com/ffb6456b-781b-40e8-9517-ffb5225e8bcd/imgfish.jpg';
        }
    }

    if ((post.thumb !== '' || post.image !== '' || post.mediatype === 'video') && opts.showImage) {
        str += '<div class="t-feed__post-imgwrapper">' +
                    '<div class="js-feed-post-image t-feed__post-bgimg t-bgimg" data-original="' +
                        imageUrl + '" style="background-image:url(' + t_feed_getLazyUrl(opts, imageUrl) + ');width:' +
                        opts.imageWidth + ';height:' + opts.imageHeight + '" bgimgfield="fe_img__' + post.uid + '">' + 
                    '</div>' +
                '</div>';
    }
    str += '<div class="t-feed__textwrapper">';

    if ((opts.showDate && opts.datePosPs == 'beforetitle') || (opts.showParts && post.postparts.length > 0 && opts.partsPosPs == 'beforetitle')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'beforetitle', 'row', recid);
    }

    str += '' + t_feed_drawTitle(opts, post, 'small', false);

    if ((opts.showDate && opts.datePosPs == 'aftertitle') || (opts.showParts && post.postparts.length > 0 && opts.partsPosPs == 'aftertitle')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'aftertitle', 'row', recid);
    }

    if (opts.showShortDescr) {
        str += '' + t_feed_drawDescr(opts, post, 'small');
    }

    if ((opts.showDate && opts.datePosPs == 'afterdescr') || (opts.showParts && post.postparts.length > 0 && opts.partsPosPs == 'afterdescr')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'afterdescr', 'row', recid);
    }

    str += '</div>' +
            '</div>' +
            '</div>';

    return str;
}


/**
 * Generate layout for FD30*
 * @param {object} post – JSON with data for post
 * @param {object} opts – object with feed settings
 * @param {string} gridColModification – attribute value to check if the column has a background or not
 * @param {string} recid – recid of current block
 * @returns 
 */
function t_feed_drawColType(post, opts, gridColModification, recid) {
    var isBgModification = gridColModification === 'bg';
    var btnsAlignClass = opts.btnsAlign ? ' t-feed__col-grid__wrapper_align' : '';
    var paddingClass = isBgModification ? ' t-feed__col-grid__content' : '';
    var paddingAfterDescr = isBgModification && opts.imagePosPs == 'afterdescr' ? ' t-feed__col-grid__content_paddingtop' : '';
    var paddingSize = isBgModification ? opts.colWithBg.paddingSize : '';
    var marginBottom = !isBgModification && opts.imagePosPs == 'afterdescr' ? ' t-feed__col-grid__content_marginbottom' : '';
    var style = isBgModification ? 'style="' + t_feed_addStyleToColWithBg(opts) + '"' : '';

    var str = '';
    str += '<div class="t-feed__col-grid__post-wrapper" ' + style + '>';
    if (opts.imagePosPs == 'beforetitle' || !opts.imagePosPs) {
        str += '' + t_feed_drawImage(opts, post, 'beforetitle', recid, isBgModification);
    }
    str += '<div class="t-feed__col-grid__wrapper' + btnsAlignClass + paddingClass + paddingAfterDescr + marginBottom + ' ' + paddingSize + '">';

    if ((opts.showDate && opts.datePos == 'beforetitle') || (opts.showParts && post.postparts.length > 0 && opts.partsPos == 'beforetitle')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'beforetitle', 'col', recid);
    }

    str += '  <div class="t-feed__textwrapper">';
    str += '' + t_feed_drawTitle(opts, post, 'small', false);

    if ((opts.showDate && opts.datePos == 'aftertitle') || (opts.showParts && post.postparts.length > 0 && opts.partsPos == 'aftertitle')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'aftertitle', 'col', recid);
    }

    if (opts.showShortDescr) {
        str += '' + t_feed_drawDescr(opts, post, 'small');
    }
    str += '  </div>';

    if ((opts.showDate && opts.datePos == 'afterdescr') || (opts.showParts && post.postparts.length > 0 && opts.partsPos == 'afterdescr')) {
        str += '' + t_feed_drawDateAndParts(opts, post, 'afterdescr', 'col', recid);
    }

    if (opts.btnReadMore) {
        str += '' + t_feed_drawReadMoreBtn(opts);
    }
    str += '</div>';

    if (opts.imagePosPs == 'afterdescr') {
        str += '' + t_feed_drawImage(opts, post, 'afterdescr', recid, isBgModification);
    }
    str += '</div>';

    return str;
}


function t_feed_addStyleToColWithBg(opts) {
    var style = '';
    style += opts.colWithBg.background ? 'background-color:' + opts.colWithBg.background + ';' : '';
    style += opts.colWithBg.borderRadius ? 'border-radius:' + opts.colWithBg.borderRadius + ';' : '';
    if (opts.colWithBg.shadowSize || opts.colWithBg.shadowOpacity) {
        var shadowSize = opts.colWithBg.shadowSize ? opts.colWithBg.shadowSize : '20px';
        var shadowOpacity = opts.colWithBg.shadowOpacity ? '0.' + opts.colWithBg.shadowOpacity : '0.3';
        style += 'box-shadow: 0px 0px ' + shadowSize + ' 0px rgba(0, 0, 0, ' + shadowOpacity + ');';
    }

    return style;
}


/**
 * Unify height for columns with different count of text
 * @param {string} recid – recid of current block
 * @param {object} opts – object with feed settings
 * @returns 
 */
function t_feed_unifyColHeights(recid, opts) {
    var rec = document.querySelector('#rec' + recid);
    var feed = rec.querySelector('.js-feed');
    var posts = rec.querySelectorAll('.t-feed__post');
    var blocksPerRow = t_feed_getBlocksInRowHeight(opts, posts);

    if (feed.getAttribute('data-feed-grid-type') !== 'col') {
        return;
    }

    if (window.innerWidth <= 480 && !opts.isHorizOnMob) {
        Array.prototype.forEach.call(posts, function(post) {
            post.style.height = 'auto';
        });
        return;
    }

    for (var i = 0; i < posts.length; i += blocksPerRow) {
        var maxHeight = 0;
        var postsArray = Array.prototype.slice.call(posts);
        var postsRows = postsArray.slice(i, i + blocksPerRow);


        var cardsContent = [];
        postsRows.forEach(function(row) {
            cardsContent.push(row.querySelector('.t-feed__col-grid__wrapper'));
        });


        Array.prototype.forEach.call(cardsContent, function(card) {
            var paddingTop = parseInt(getComputedStyle(card)['padding-top'], 10);
            var paddingBottom = parseInt(getComputedStyle(card)['padding-bottom'], 10);
            var datePartsHeightTop = 0;
            var datePartsHeightBottom = 0;
            var btnHeight = 0;

            var dateBeforeTitle = card.querySelector('.t-feed__post-parts-date-row_beforetitle');
            if (dateBeforeTitle && dateBeforeTitle.offsetHeight != null) {
                datePartsHeightTop = t_feed_calcOuterHeight(dateBeforeTitle);
            }

            var dateAfterDescr = card.querySelector('.t-feed__post-parts-date-row_afterdescr');
            if (dateAfterDescr && dateAfterDescr.offsetHeight != null) {
                datePartsHeightBottom = t_feed_calcOuterHeight(dateAfterDescr);
            }
            var btnReadMore = card.querySelector('.t-feed__button-readmore');
            if (btnReadMore && btnReadMore.offsetHeight != null) {
                btnHeight = t_feed_calcOuterHeight(btnReadMore);
            }

            var textWrapper = card.querySelector('.t-feed__textwrapper');
            var textHeight = parseInt(getComputedStyle(textWrapper, null).height.replace('px', ''), 10);
            var height = datePartsHeightTop + datePartsHeightBottom + textHeight + paddingTop + paddingBottom + btnHeight;

            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        Array.prototype.forEach.call(cardsContent, function(card) {
            card.style.height = maxHeight + 'px';
        });
    }
}


/**
 * Calculate space between elements in post (data, parts, buttons, etc.)
 * @param {HTMLElement} el 
 * @returns 
 */
function t_feed_calcOuterHeight(el) {
    var height = el.offsetHeight;
    var style = getComputedStyle(el);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

/**
 * Calculate count of posts in row
 * @param {object} opts – object with feed settings
 * @param {NodeList} cols – posts in row
 * @returns 
 */
function t_feed_getBlocksInRowHeight(opts, cols) {
    if (window.innerWidth <= 960 && opts.isHorizOnMob) {
        return cols.length;
    } else if (window.innerWidth <= 960) {
        return 1;
    } else {
        return parseInt(opts.blocksInRow);
    }
}


function t_feed_drawImageInRowBig(opts, post, position, recid) {
    var imageUrl = post.thumb ? post.thumb : post.image;
    var height = opts.imageRatio + '%';
    var str = '';
    if ((post.thumb !== '' || post.image !== '' || post.mediatype === 'video') && opts.showImage) {
        str += '<div class="t-feed__post-imgwrapper t-feed__post-imgwrapper_' + position + '" style="padding-bottom:' + height + ';">';
        if ((opts.showDate && opts.datePos == 'onimage') || (opts.showParts && opts.partsPos == 'onimage')) {
            str += '' + t_feed_drawDateAndParts(opts, post, 'onimage', 'col', recid);
        }
        str += '<div class="t-feed__post-bgimg t-bgimg" bgimgfield="fe_img__' + post.uid + '" data-original="' + imageUrl + '" style="background-image:url(' + t_feed_getLazyUrl(opts, imageUrl) + ');">' +
                '</div>' +
                '</div>';
    }
    return str;
}


function t_feed_drawImage(opts, post, position, recid, isBgModification) {
    var imageRatio = opts.imageRatio ? opts.imageRatio + '%' : '66%';
    var borderRadiusStyle = isBgModification && opts.colWithBg.borderRadius ? 'border-radius:' + opts.colWithBg.borderRadius + ' ' + opts.colWithBg.borderRadius + ' 0 0;' : '';
    var imageStyle = 'style="padding-bottom:' + imageRatio + ';' + borderRadiusStyle + '"';
    var mobileClass = opts.isHorizOnMob && opts.hasOriginalAspectRatio ? 't-feed__post-imgwrapper_mobile-nopadding' : '';

    var str = '';
    if ((post.thumb !== '' || post.image !== '' || post.mediatype === 'video') && opts.showImage) {
        var imageUrl = post.thumb ? post.thumb : post.image;
        if (post.mediatype === 'video') {
            if (post.mediadata.indexOf('vimeo') != -1 && post.thumb === '') {
                imageUrl = 'https://static.tildacdn.com/ffb6456b-781b-40e8-9517-ffb5225e8bcd/imgfish.jpg';
            }
        }
        str += '<div class="t-feed__post-imgwrapper t-feed__post-imgwrapper_' + position + ' ' + mobileClass + '" ' + imageStyle + '>';

        if ((opts.showDate && opts.datePos == 'onimage') || (opts.showParts && opts.partsPos == 'onimage')) {
            str += '' + t_feed_drawDateAndParts(opts, post, 'onimage', 'col', recid);
        }

        if (opts.hasOriginalAspectRatio) {
            str += '<img ' + t_feed_getLazySrc(opts, imageUrl) + ' class="t-feed__post-img t-img js-feed-img" imgfield="fe_img__' + post.uid + '" />';
        } else {
            str += '<div class="t-feed__post-bgimg t-bgimg" bgimgfield="fe_img__' + post.uid + '" data-original="' + imageUrl + '" style="background-image:url(' + t_feed_getLazyUrl(opts, imageUrl) + ');' + borderRadiusStyle + '">' +
                    '</div>';
        }
        str += '</div>';
    }
    return str;
}


function t_feed_drawTitle(opts, post, size, margin) {
    var titleMargin = margin ? 't-feed__post-title_margin' : '';
    var fontSize = 't-name';
    if (size == 'medium') {
        fontSize = 't-heading';
    }
    var typoSize = '';

    if (opts.blocksInRow == 4) {
        typoSize += 't-name_xs';
    } else if (opts.blocksInRow == 2 || !opts.blocksInRow) {
        typoSize += 't-name_xl';
    } else {
        typoSize += 't-name_md';
    }

    if (size == 'medium') {
        typoSize = 't-heading_lg';
    }

    var str = '';
    str += '<div class="js-feed-post-title t-feed__post-title ' + titleMargin + ' ' + fontSize + ' ' + typoSize + '" field="fe_title__' + post.uid + '" style="' + opts.typo.title + '" data-redactor-toolbar="no">' + post.title + '</div>';
    return str;
}


function t_feed_drawDescr(opts, post, size) {
    var fontSize = 'xxs';
    if (size == 'medium') {
        fontSize = 'sm';
    }
    var str = '';
    if (post.descr != '') {
        str += '<div class="js-feed-post-descr t-feed__post-descr t-descr t-descr_' + fontSize + '" field="fe_descr__' + post.uid + '" style="' + opts.typo.descr + '" data-redactor-toolbar="no">' + t_feed_cropShortDescr(post, opts) + '</div>';
    }
    return str;
}


function t_feed_drawDateAndParts(opts, post, position, type, recid) {
    var isOnImage = position === 'onimage';
    var isInRow = position === 'afterdescr' || position === 'beforetitle' || position === 'aftertitle';
    var datePosition = type === 'col' ? opts.datePos : opts.datePosPs;
    var partsPosition = type === 'col' ? opts.partsPos : opts.partsPosPs;
    var dateHTML = '<span class="js-feed-post-date t-feed__post-date t-uptitle t-uptitle_xs" style="' + opts.typo.subtitle + '">' + t_feed_formateDate(post.date, opts, recid) + '</span>';
    var labelWrapperHTML = {
        open: isOnImage ? '<div class="t-feed__post-label-wrapper">' : '',
        close: isOnImage ? '</div>' : ''
    };
    var labelHTML = {
        open: isOnImage ? '<div class="t-feed__post-label">' : '',
        close: isOnImage ? '</div>' : ''
    };
    var partsDateRowHTML = {
        open: isInRow ? '<div class="t-feed__post-parts-date-row t-feed__post-parts-date-row_' + position + '">' : '',
        close: isInRow ? '</div>' : ''
    };

    var str = '';
    str += partsDateRowHTML.open;
    str += labelWrapperHTML.open;
    if (opts.showDate && datePosition == position) {
        str += labelHTML.open;
        str += dateHTML;
        str += labelHTML.close;
    }
    if (post.postparts.length > 0 && opts.showParts && partsPosition == position) {
        str += labelHTML.open;
        str += '' + t_feed_drawParts(opts, post);
        str += labelHTML.close;
    }
    str += labelWrapperHTML.close;
    str += partsDateRowHTML.close;

    return str;
}


function t_feed_drawParts(opts, post) {
    var style = opts.typo.subtitle ? 'style="' + opts.typo.subtitle + '"' : '';
    var str = '';
    post.postparts.forEach(function (item) {
        if (item != '') {
            str += '<span class="t-feed__post-tag t-uptitle t-uptitle_xs" ' + style + '>' + item.parttitle + '</span>';
        }
    });
    return str;
}


function t_feed_drawReadMoreBtn(opts) {
    var btnTextColor = opts.btnTextColor ? 'style="color:' + opts.btnTextColor + ';"' : '';
    var btnSize = opts.btnSize == 'sm' ? 'xs' : 'sm';
    var btnWrapperClass = opts.btnType === 'text' ? 't-feed__button-readmore_text' : '';

    var str = '';
    str += '<div class="t-feed__button-readmore ' + btnWrapperClass + '">';
    if (opts.btnType === 'text') {
        str += '<div class="t-btntext" ' + btnTextColor + '>' + opts.btnReadMore + '</div>';
    } else {
        str += '<div class="t-btn t-btn_' + btnSize + '" style="' + opts.btnStyle + '">' +
                    '<div class="t-feed__button-container">' +
                        '<span>' + opts.btnReadMore + '</span>' +
                    '</div>' +
                '</div>';
    }
    str += '</div>';
    return str;
}


function t_feed_drawBtnsContainer(opts) {
    var str = '';
    str += '<div class="t-feed__buttons-wrapper t-feed__buttons-wrapper_hidden t-container">';
    if (opts.btnText && opts.amountOfPosts) {
        str += '' + t_feed_drawShowMoreBtn(opts);
    }
    if (opts.btnAllPosts.text) {
        str += '' + t_feed_drawShowAllPostsBtn(opts);
    }
    str += '</div>';
    return str;
}


function t_feed_drawShowMoreBtn(opts) {
    var str = '';
    if (opts.btnText) {
        str += '<div class="t-feed__button-wrapper">' +
                    '<a href="" class="js-feed-btn-show-more t-feed__showmore-btn t-btn" style="' + opts.bbtnStyle + '">' +
                        '<div class="t-feed__button-container">' +
                            '<span>' + opts.btnText + '</span>' +
                        '</div>' +
                    '</a>' +
                '</div>';
    }
    return str;
}


function t_feed_drawShowAllPostsBtn(opts) {
    var target = opts.btnAllPosts.target ? 'target="_blank"' : '';
    var str = '';
    str += '<div class="t-feed__button-wrapper">' +
                '<a href="' + opts.btnAllPosts.link + '" class="js-feed-btn-show-all-posts t-feed__showallpost-btn t-btn" ' + target + ' style="' + opts.bbtnStyle + '">' +
                    '<div class="t-feed__button-container">' +
                        '<span>' + opts.btnAllPosts.text + '</span>' +
                    '</div>' +
                '</a>' +
            '</div>';
    return str;
}


/**
 * Generate parts 
 * @param {string} recid – recid of current block
 * @param {object} opts – object with feed settings
 * @param {Array} feedPartsArr – array of parts
 * @param {string} feeduid – uid of current feed
 */
function t_feed_addFeedParts(recid, opts, feedPartsArr, feeduid) {
    var rec = document.querySelector('#rec' + recid);
    var feed = rec.querySelector('.js-feed');
    opts.feedPartsArr = feedPartsArr;
    var tabsHtml = t_feed_drawFeedPartsControl(opts, feeduid, recid);
    feed.querySelector('.js-feed-parts-select-container').insertAdjacentHTML('afterbegin', tabsHtml);
    // draw all products grid
    t_feed_initFeedParts(recid, opts);
}


function t_feed_drawFeedPartsControl(opts, feeduid, recid) {
    var partsWithBg = '';
    if (opts.parts_opts) {
        partsWithBg = (opts.parts_opts.partsBgColor || opts.parts_opts.partsBorderSize || opts.parts_opts.partsBorderColor) ? 't-feed__parts-switch-btn_bg' : '';
    }
    var alignClass = '';
    if (opts.parts_opts) {
        if (opts.parts_opts.align) {
            alignClass = opts.parts_opts.align === 'left' ? 't-align_left' : 't-align_center';
        } else {
            alignClass = 't-align_center';
        }
    }
    var str = '';
    str += '<div class="t-feed__parts-switch-wrapper ' + alignClass + '">';
    // add root part
    var hideClass = !opts.showPartAll ? ' t-feed__parts-switch-btn_hide' : '';
    str += '<div class="js-feed-parts-switcher t-feed__parts-switch-btn ' + partsWithBg + ' t-feed__parts-switch-btn-all t-name t-name_xs t-menu__link-item t-active' + hideClass + '" data-feedpart-title="" data-feedpart-uid="' + opts.feeduid + '">' +
                '<span>' +
                    '' + t_feed_getDictionary('all', recid) +
                '</span>' +
            '</div>';
    // add custom parts
    for (var i = 0; i < opts.feedPartsArr.length; i++) {
        var feedPart = opts.feedPartsArr[i];
        str += '<div class="js-feed-parts-switcher t-feed__parts-switch-btn ' + partsWithBg + ' t-name t-name_xs t-menu__link-item" data-feedpart-title="' + feedPart.title + '" data-feedpart-uid="' + feedPart.uid + '">' +
                    '<a href="#!/tfeeds/' + feeduid + '/c/' + feedPart.title + '">' +
                        '' + feedPart.title +
                    '</a>' +
                '</div>';
    }
    str += '</div>';
    return str;
}


function t_feed_getLazyUrl(opts, imgSrc) {
    // lazyLoad works just in published pages,
    // so in redactor and previewmode we do not add smaller images
    if (!opts.isPublishedPage || window.lazy !== 'y') {
        return imgSrc;
    }
    if (imgSrc.indexOf('static.tildacdn.com') === -1) {
        // we cant apply lazy load to images, hosted to another servers
        return imgSrc;
    }
    var arr = imgSrc.split('/');
    arr.splice(imgSrc.split('/').length - 1, 0, '-/resizeb/x20');
    var newSrc = arr.join('/');
    return newSrc;
}


function t_feed_getLazySrc(opts, imgSrc) {
    // lazyLoad works just in published pages,
    // so in redactor and previewmode we do not add smaller images
    if (!opts.isPublishedPage || window.lazy !== 'y') {
        return 'src="' + imgSrc + '"';
    }
    var arr = imgSrc.split('/');
    arr.splice(imgSrc.split('/').length - 1, 0, '-/empty');
    var newSrc = arr.join('/');
    return 'src="' + newSrc + '" data-original="' + imgSrc + '"';
}


/**
 * Draw separator in FD10*
 * @param {object} opts – object with feed settings
 * @returns 
 */
function t_feed_drawPostSeparatorLine(opts) {
    var str = '';
    var style = '';
    style += opts.separator.height ? 'height:' + opts.separator.height + ';' : '';
    style += opts.separator.color ? 'background-color:' + opts.separator.color + ';' : '';
    style += opts.separator.opacity ? 'opacity:' + opts.separator.opacity / 100 + ';' : '';
    style = style ? 'style="' + style + '"' : '';
    str += '<div class="t-feed__post__line-separator" ' + style + '></div>';
    return str;
}


/**
 * Crop text in short descr in feed
 * @param {object} post – JSON with data for post
 * @param {object} opts – object with feed settings
 * @returns 
 */
function t_feed_cropShortDescr(post, opts) {
    var postDescr = post.descr;
    if (opts.amountOfSymbols != '') {
        postDescr = postDescr.replace(/<[^>]+>/g, '');
        postDescr = postDescr.replace(/&nbsp;/g, ' ');
        postDescr = postDescr.substr(0, opts.amountOfSymbols);
        if (post.descr.length > opts.amountOfSymbols) {
            postDescr += ' ...';
        }
    }
    return postDescr;
}


/**
 * Add events for popup on load
 * @param {string} recid – recid of current block
 * @param {object} obj – object with data which came from the backend
 * @param {object} obj_posts – object with posts in current feed
 * @param {object} opts – object with feed settings
 */
function t_feed_initPopup(recid, obj, obj_posts, opts) {
    var rec = document.querySelector('#rec' + recid);
    var feed = rec.querySelector('.js-feed');
    var gridType = feed.getAttribute('data-feed-grid-type');

    // TODO: избавиться от добавления #postpopup – old
    var popupTriggers = rec.querySelectorAll('[href^="#postpopup"]');
    // popupTrigger.unbind(); //? – old

    // Replace #postpopup to absolute link
    Array.prototype.forEach.call(popupTriggers, function(trigger) {
        var parent = trigger.closest('.t-feed__post');
        var uid = parent.getAttribute('data-post-uid');
        var post = obj_posts[recid][uid];
        if (post !== undefined) {
            trigger.setAttribute('href', post.url);
        }
    });

    Array.prototype.forEach.call(popupTriggers, function(trigger) {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();

            if (gridType === 'side-panel') {
                feed.classList.add('t946__feed-container_expanded');
            }

            var postItem = trigger.closest('.js-feed-post');
            var lid_post = postItem.getAttribute('data-post-uid');
            var post = obj_posts[recid][lid_post];

            var ctrlKey = e.ctrlKey;
            var cmdKey = e.metaKey && navigator.platform.indexOf('Mac') !== -1;
            if (ctrlKey || cmdKey) {
                window.open(post.url);
                return;
            }

            if ((obj.header || obj.footer) && obj.disablepopup) {
                location.href = post.url;
            } else {
                t_feed_workPostPopup(recid, obj, post, lid_post, opts);
            }
        });
    });

   
    // set close events
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 27) {
            t_feed_closePopup(recid, opts, window.location.href);
        }
    });
}


/**
 * Ready to show popup
 * @param {string} recid – recid of current block
 * @param {object} obj – object with data which came from the backend
 * @param {object} post – JSON with data for post
 * @param {string} lid_post – parent post uid
 * @param {object} opts – object with feed settings
 */
function t_feed_workPostPopup(recid, obj, post, lid_post, opts) {
    var rec = document.querySelector('#rec' + recid);
    var feed = rec.querySelector('.js-feed');
    if (typeof window.tFeedPosts[recid] !== 'undefined') {
        window.tFeedPosts[recid]['title'] = document.title;
    }

   if (opts.popup_opts.isShare) {
        var script = document.createElement('script');
        script.src = 'https://static.tildacdn.com/js/ya-share.js';
        script.async = true;
        document.body.appendChild(script);
    }
    feed.insertAdjacentHTML('beforeend', t_feed_drawWholePostPopup(obj, post, opts, lid_post, recid));

    if (opts.popup_opts.showRelevants === 'all' || opts.popup_opts.showRelevants === 'cc') {
        t_feed_addRelevantsPosts(recid, opts, post, lid_post);
    }

    setTimeout(function () {
        // removed t_feed_breakText because it solved by css
        if (opts.popup_opts.zoom) {
            t_feed_addZoom();
        }
    }, 100);

    t_feed_showPopup(recid, post, opts);

    document.title = post.title;

    if (typeof post.needGetPost != 'undefined') {
        t_feed_addPostPopupLoader();
        t_feed_loadPostPopupData(recid, lid_post, opts);
    }

    if (post.mediatype == 'gallery') {
        t_feed_addPostPopupGallery(recid, post);
    }

    if (opts.isPublishedPage) {
        t_feed_changeURL(obj, post);
    }
}


function t_feed_loadPostPopupData(recid, lid_post, opts) {
    var apiUrl = 'https://feeds.tildacdn.com/api/getpost/?postuid=' + lid_post;
    if (!opts.isPublishedPage) {
        var records = document.querySelector('.t-records');
        var projectid = records.getAttribute('data-tilda-project-id');
        apiUrl = 'https://tilda.cc/projects/feeds/getpost/?projectid=' + projectid + '&postuid=' + lid_post;
    }
    var ts = Date.now();

    var request = new XMLHttpRequest();
    request.open('GET', apiUrl + '&' + recid, true);
    request.timeout = 1000 * 25;
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            if (request.response === '') {
                return;
            }

            var obj = JSON.parse(request.response);

            if (typeof obj !== 'object') {
                return;
            }

            var text = JSON.parse(request.response).post.text;
            document.querySelector('.js-feed-post-text').innerHTML = text;
            // removed t_feed_breakText because it solved by css
            if (opts.popup_opts.zoom) {
                t_feed_addZoom();
            }
        }
    };

    request.onerror = function() {
        var xhr = request.response;
        var ts_delta = Date.now() - ts;
        if (xhr.status == 0 && ts_delta < 100 && xhr.readyState !== 0) {
            alert('Request error (get posts). Please check internet connection...');
        }
    };

    request.send(); 
}


function t_feed_addPostPopupGallery(recid, post) {
    if (post.mediadata !== '' && JSON.parse(post.mediadata).length > 0) {
        t_feed_setGalleryImageHeight(recid);

        if (t_sldsInit) {
            t_sldsInit(recid);
            if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
                t_feed_onFuncLoad('t_lazyload_update', function () {
                    t_lazyload_update();
                });
            }
        }
        if (t_slds_UpdateSliderHeight) {
            t_slds_updateSlider(recid);
            t_slds_UpdateSliderHeight(recid);
        }
        if (t_slds_UpdateSliderArrowsHeight) {
            t_slds_updateSlider(recid);
            t_slds_UpdateSliderArrowsHeight(recid);
        }
    }
}


/**
 * Add skeleton for popup elements on slow load
 */
function t_feed_addPostPopupLoader() {
    var loader = '';
    for (var i = 0; i < 20; i++) {
        loader += '<div class="t-feed__post-popup__text-loader"></div>';
    }
    document.querySelector('.js-feed-post-text').innerHTML = loader;
}


/**
 * Add zoom for images in popup if zoom setting is on
 */
function t_feed_addZoom() {
    var images = document.querySelectorAll('.js-feed-post-text img');
    Array.prototype.forEach.call(images, function(image) {
        image.classList.add('t-zoomable');
        image.setAttribute('data-zoomable', 'yes');
        image.setAttribute('data-img-zoom-url', image.getAttribute('src'));
    });
}


function t_feed_showPopup(recid, post, opts) {
    var rec = document.querySelector('#rec' + recid);
    var popup = rec.querySelector('.t-feed__post-popup.t-popup');
    var arrowTop = popup.querySelector('.t-feed__post-popup__arrow-top');
    popup.style.display = 'block';
    popup.classList.add('t-popup_show');

    setTimeout(function () {
        popup.querySelector('.t-popup__container').classList.remove('t-feed__post-popup__container_loading');
    }, 300);

    setTimeout(function () {
        popup.querySelector('.t-popup__container').classList.add('t-popup__container-animated');
        if (window.lazy === 'y' || document.querySelector('#allrecords').getAttribute('data-tilda-lazy') === 'yes') {
            t_feed_onFuncLoad('t_lazyload_update', function () {
                t_lazyload_update();
            });
        }
    }, 50);

    document.body.classList.add('t-body_popupshowed');
    t_feed_getCountOfViews(popup);

    if (arrowTop) {
        popup.addEventListener('scroll', function () {
            t_feed_addPostPopupArrowTop(this, arrowTop);
        });
    
        arrowTop.addEventListener('click', function () {
            t_feed_scrollTo(popup, 0, 300);
        });
    }

    t_feed_openShare(popup);
    t_feed_sendDataToAnalytics(popup, post);


    // set close events
    document.querySelector('.js-feed-popup-close').addEventListener('click', function () {
        t_feed_closePopup(recid, opts, window.location.href);
    });
}


function t_feed_scrollTo(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        t_feed_scrollTo(element, to, duration - 10);
    }, 10);
}


function t_feed_sendDataToAnalytics(popup, post) {
    var urlWithoutDomenStart = post.url.indexOf('/tpost');
    var urlWithoutDomen = post.url.substr(urlWithoutDomenStart);
    var analytics = popup.getAttribute('data-track-popup');
    if (analytics > '') {
        Tilda.sendEventToStatistics(urlWithoutDomen);
    }
}


/**
 * Add sharing button if at lest one social site is on in block settings
 * @param {HTMLElement} popup – current popup
 * @returns 
 */
function t_feed_openShare(popup) {
    // TODO: trick for snippet
    if (popup instanceof jQuery) {
        popup = document;
    }

    var shareOpen = popup.querySelector('.js-feed-share-open');
    var shareWrapper = popup.querySelector('.t-feed__share');
    var shareContainer = popup.querySelector('.t-feed__share-container');

    if (!shareOpen) {
        return;
    }

    var timerId = setInterval(function () {
        if (popup.querySelector('.ya-share2').classList.contains('ya-share2_inited')) {
            shareOpen.classList.add('t-feed__share-icon_active');
            clearInterval(timerId);
        }
    }, 100);
    if (window.isMobile) {
        shareOpen.addEventListener('click', function () {
            if (shareWrapper.classList.contains('t-feed__share_open')) {
                shareWrapper.classList.remove('t-feed__share_open');
            } else {
                shareWrapper.classList.add('t-feed__share_open');
            }
        });
    } else {
        var timeout;
        shareContainer.addEventListener('mouseover', function () {
            if (shareOpen.classList.contains('t-feed__share-icon_active')) {
                shareWrapper.classList.add('t-feed__share_open');
            }
            clearTimeout(timeout);
        });
        shareContainer.addEventListener('mouseout', function () {
            timeout = setTimeout(function () {
                shareWrapper.classList.remove('t-feed__share_open');
            }, 750);
        });
    }
}

/**
 * Show arrow in popup if back to top button setting is on
 * @param {HTMLElement} popup – current popup
 * @param {HTMLElement} arrowTop – arrow top element
 */
function t_feed_addPostPopupArrowTop(popup, arrowTop) {
    var isShow = arrowTop.classList.contains('t-feed__post-popup__arrow-top_show');
    if (popup.scrollTop > 300) {
        if (!isShow) {
            arrowTop.classList.add('t-feed__post-popup__arrow-top_show');
        }
    } else if (isShow) {
        arrowTop.classList.remove('t-feed__post-popup__arrow-top_show');
    }
}


/**
 * Send information about views in the admin panel
 * @param {HTMLElement} popup – current popup
 */
function t_feed_getCountOfViews(popup) {
    // TODO: trick for snippet
    if (popup instanceof jQuery) {
        popup = document.querySelector('.t-feed__post-popup');
    }

    var apiUrl = 'https://feeds.tildacdn.com/api/setpostviewed/';
    setTimeout(function () {
        var request = new XMLHttpRequest();
        request.open('GET', apiUrl + '?' + 'postuid=' + popup.getAttribute('data-feed-popup-postuid'), true);
        request.timeout = 1000 * 25;
        request.onload = function() {};
        request.onerror = function() {
            console.log(request.response);
        };
        request.send(); 
    }, 3000);
}


function t_feed_closePopup(recid, opts, curUrl) {
    var rec = document.querySelector('#rec' + recid);
    var feed = rec.querySelector('.js-feed');
    var popup = document.querySelector('.t-feed__post-popup.t-popup');
    var gridType = feed.getAttribute('data-feed-grid-type');

    if (!popup) {
        return;
    }

    if (gridType === 'side-panel') {
        feed.classList.remove('t946__feed-container_expanded');
    }

    document.body.classList.remove('t-body_popupshowed');
    popup.classList.remove('t-popup_show');
    var indexToRemove = curUrl.indexOf('/tpost/');
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && indexToRemove < 0) {
        indexToRemove = curUrl.indexOf('/tpost/');
        if (indexToRemove < 0) {
            indexToRemove = curUrl.indexOf('%2Ftpost%2F');
        }
    }
    
    document.title = window.tFeedPosts[recid]['title'];

    if (shareScript && opts.popup_opts.isShare) {
        var shareScript = document.querySelector('script[src^="https://static.tildacdn.com/js/ya-share.js"]');
        if (shareScript.parentNode !== null) {
            shareScript.parentNode.removeChild(shareScript);
        }
    }

    setTimeout(function () {
        popup.scrollTop = 0;
        if (popup && !popup.classList.contains('t-popup_show') && popup.parentNode !== null) {
            popup.parentNode.removeChild(popup);
        }

        if (window.history.state !== null) {
            window.history.pushState(null, null, curUrl);
        }
    }, 300);

    if (curUrl.indexOf('#!') != -1) {
        var popup = document.querySelector('.t-feed__post-popup');
        var feed = popup.closest('.js-feed');
        var offset = feed.getBoundingClientRect();
        var offsetTop = typeof offset !== 'undefined' ? offset.top + window.pageYOffset : 0;
        t_feed_scrollToFeed(feed, offsetTop);
    }
}


/**
 * Change url for current post in popup
 * @param {object} obj – object with data which came from the backend
 * @param {object} post – JSON with data for post
 */
function t_feed_changeURL(obj, post) {
    var curUrl = window.location.href;

    var hostUrl = window.location.protocol + '//' + window.location.hostname;
    // Cut out protocol and host from post url and collect pathname
    var postPathname = post.url.split('/').slice(3).join('/');
    var url = hostUrl + '/' + postPathname;

    var newPageTitle = document.title + '-' + post.title;

    if (curUrl.indexOf('/tpost/') === -1 && curUrl.indexOf('%2Ftpost%2F') === -1) {
        if (typeof history.pushState != 'undefined') {
            window.history.pushState({
                postData: 'open',
                obj: obj,
                post: post
            }, newPageTitle, url);
        }
    }
}


function t_feed_drawWholePostPopup(obj, post, opts, lid_post, recid) {
    var rec = document.querySelector('#rec' + recid);
    var feed = rec.querySelector('.js-feed');
    var gridType = feed.getAttribute('data-feed-grid-type');
    var statAttr = opts.popup_opts.popupStat ? 'data-track-popup="' + opts.popup_opts.popupStat + '"' : '';
    var popupStyle = opts.popup_opts.overlayBgColorRgba ? 'style="background-color:' + opts.popup_opts.overlayBgColorRgba + '"' : '';
    var popupStyleClose = opts.popup_opts.overlayBgColorRgba ? 'style="background-color:' + opts.popup_opts.overlayBgColorRgba.replace('1)', '0.9)') + '"' : '';

    var inOneColumnHTML = {
        open: !opts.popup_opts.inTwoColumns ? '<div class="t-feed__post-popup__content t-col t-col_8">' : '',
        close: !opts.popup_opts.inTwoColumns ? '</div>' : ''
    };

    var inTwoColumnsHTML = {
        open: opts.popup_opts.inTwoColumns ? '<div class="t-feed__post-popup__content t-feed__post-popup__content_half t-feed__post-popup__content-col t-col t-col_6">' : '',
        close: opts.popup_opts.inTwoColumns ? '</div>' : ''
    };

    var str = '';
    var panelClass = gridType === 'side-panel' ? ' t-feed__post-popup_panel ' : ' ';
    str += '<div class="t-feed__post-popup' + panelClass + 't-popup" data-feed-popup-feeduid="' + obj.feeduid + '" data-feed-popup-postuid="' + lid_post + '" ' + statAttr + ' ' + popupStyle + '>' +
                '<div class="t-feed__post-popup__close-wrapper t-feed__post-popup__close-wrapper_loading" ' + popupStyleClose + '>' +
                    '' + t_feed_drawPostPopupCloseIcon(opts) +
                    '' + t_feed_drawPopupTitle(obj, opts) +
                    '' + t_feed_drawSharing(opts) +
                '</div>';

    var containerClass = gridType === 'side-panel' ? ' t-feed__post-popup__container_panel ' : ' ';
    str += '<div class="t-feed__post-popup__container' + containerClass + 't-feed__post-popup__container_loading t-container t-popup__container t-popup__container-static t-popup__container-animated">' +
            '<div class="t-feed__post-popup__content-wrapper">';
    str += inOneColumnHTML.open;

    if (!opts.popup_opts.inTwoColumns) {
        if (opts.popup_opts.imagePos == 'aftertitle') {
            str += '' + t_feed_addPostPopupHeading(opts, post, recid);
            str += '' + t_feed_drawPostPopupCover(recid, 'aftertitle', opts, post);
        } else {
            str += '' + t_feed_drawPostPopupCover(recid, 'beforetitle', opts, post);
            str += '' + t_feed_addPostPopupHeading(opts, post, recid);
        }
    }

    if (opts.popup_opts.inTwoColumns) {
        str += inTwoColumnsHTML.open;
        str += '' + t_feed_drawPostPopupCover(recid, 'beforetitle', opts, post);
        str += inTwoColumnsHTML.close;
    }

    str += inTwoColumnsHTML.open;
    if (opts.popup_opts.inTwoColumns) {
        str += '' + t_feed_addPostPopupHeading(opts, post, recid);
    }
    str += '' + t_feed_drawPostPopupText(opts, post);
    if (post.authorname) {
        str += '' + t_feed_drawPostPopupAuthor(opts, post);
    }

    str += '' + t_feed_drawPostPopupDateAndParts('aftertext', opts, post, recid);

    str += inTwoColumnsHTML.close;
    str += inOneColumnHTML.close;

    str += '</div>';

    if (obj.code != '' && obj.code != null && post.disablecomments != 1) {
        str += '<div class="t-feed__post-popup__content-wrapper">' +
                    '<div class="t-feed__post-popup__content t-col t-col_8">' +
                        '<div class="js-feed-comments t-feed__post-popup__comments">' +
                            '' + obj.code +
                        '</div>' +
                    '</div>' +
                '</div>';
    }

    if (opts.popup_opts.showRelevants != '') {
        str += '<div class="js-feed-relevants t-feed__post-popup__relevants"></div>';
    }
    str += '</div>';

    if (typeof opts.arrowtop_opts != 'undefined' && opts.arrowtop_opts.isShow) {
        str += '' + t_feed_drawPostPopupArrowTop(opts);
    }
    str += '</div>';

    return str;
}


function t_feed_addPostPopupHeading(opts, post, recid) {
    var str = '';
    str += '' + t_feed_drawPostPopupDateAndParts('beforetitle', opts, post, recid);
    str += '' + t_feed_drawPostPopupTitle(opts, post);
    str += '' + t_feed_drawPostPopupDateAndParts('aftertitle', opts, post, recid);
    return str;
}


function t_feed_drawPostPopupDateAndParts(position, opts, post, recid) {
    var tags = '';
    var style = opts.popup_opts.subtitleColor ? 'style="color:' + opts.popup_opts.subtitleColor + '"' : '';

    post.postparts.forEach(function (item) {
        tags += '<a href="' + item.parturl + '" class="t-feed__post-popup__tag"><span class="t-uptitle t-uptitle_xs" ' + style + '>' + item.parttitle + '</span></a>';
    });

    var str = '';
    if ((opts.popup_opts.datePos == position && post.date != '') || (opts.popup_opts.partsPos == position && post.postparts.length > 0)) {
        str += '<div class="t-feed__post-popup__date-parts-wrapper t-feed__post-popup__date-parts-wrapper_' + position + '">';
        if (opts.popup_opts.datePos == position) {
            str += '' + t_feed_drawPostPopupDate(opts, post, recid);
        }
        if (opts.popup_opts.partsPos == position) {
            if (post.postparts.length > 0) {
                str += tags;
            }
        }
        str += '</div>';
    }
    return str;
}


function t_feed_drawPostPopupCloseIcon(opts) {
    var fillColor = opts.popup_opts.iconColor ? opts.popup_opts.iconColor : '#000000';
    var str = '';
    str += '<div class="js-feed-popup-close t-popup__close">' +
                '<div class="t-popup__close-wrapper">' +
                    '<svg class="t-popup__close-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M1 1L10 10L1 19" stroke="' + fillColor + '" stroke-width="2"/>' +
                    '</svg>' +
                '</div>' +
            '</div>';
    return str;
}


function t_feed_drawPopupTitle(obj, opts) {
    var title = opts.popup_opts.closeText ? opts.popup_opts.closeText : obj.feedtitle;

    var titleStyle = '';
    if (opts.popup_opts.iconColor) {
        titleStyle = 'style="color:' + opts.popup_opts.iconColor + '"';
    }

    var str = '<div class="js-feed-popup-close t-feed__post-popup__close-text-wrapper">' +
                    '<div class="js-feed-popup-title t-feed__post-popup__close-text t-descr t-descr_xxs" ' + titleStyle + '>' + title + '</div>' +
                '</div>';
    return str;
}


function t_feed_drawSharing(opts) {
    var shareBg = opts.popup_opts.shareBg ? 'style="background-color:' + opts.popup_opts.shareBg + ';"' : 'style="background-color: #ffffff;"';
    var arrowColor = opts.popup_opts.shareBg ? 'style="border-bottom: 8px solid ' + opts.popup_opts.shareBg + ';"' : '';
    var str = '';
    if (typeof opts.popup_opts.isShare != 'undefined' && opts.popup_opts.isShare != 'false' && opts.popup_opts.isShare) {
        str += '<div class="t-feed__share-container">' +
                    '<div class="js-feed-share-open t-feed__share-icon">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.92 15.79">' +
                            '<g data-name="Слой 2">' +
                                '<path d="M16 9.67v6H.19v-12h7.18a7.1 7.1 0 00-1.46.89 7 7 0 00-1.08 1.11H2.19v8H14v-1.9z"/>' +
                                '<path d="M17.73 5.7L12.16.13V3.8c-1.45.06-7 .73-7.62 7.08a.07.07 0 00.13 0c.49-1.35 2.11-3.43 7.49-3.52v3.88z"/>' +
                            '</g>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="t-feed__share ' + opts.popup_opts.shareStyle + '" ' + shareBg + '>' +
                        '<div class="t-feed__share-arrow" ' + arrowColor + '></div>' +
                        '<div class="ya-share2" data-access-token:facebook="' + opts.popup_opts.shareFBToken + '" data-yashareL10n="en" data-services="' + opts.popup_opts.shareServices + '" data-counter=""></div>' +
                    '</div>' +
                '</div>';
    }
    return str;
}


function t_feed_drawPostPopupCover(recid, position, opts, post) {
    var zoomClass = opts.popup_opts.zoom ? ' t-zoomable' : '';
    var zoomTarget = opts.popup_opts.zoom ? ' data-zoomable="yes" data-img-zoom-url="' + post.mediadata + '"' : '';
    var str = '';
    if (post.mediatype == 'image') {
        if (post.mediadata) {
            str += '<div id="feed-cover" class="t-feed__post-popup__cover-wrapper t-feed__post-popup__cover-wrapper_' + position + '">' +
                        '<img src="' + post.mediadata + '" class="js-feed-post-image t-feed__post-popup__img t-img' + zoomClass + '"' + zoomTarget + '>' +
                    '</div>';
        }
    }
    if (post.mediatype == 'video') {
        if (post.mediadata) {
            str += '<div class="t-feed__post-popup__cover-wrapper_video t-feed__post-popup__cover-wrapper t-feed__post-popup__cover-wrapper_' + position + '">' +
                        '' + t_feed_drawPostPopupVideo(post) +
                    '</div>';
        }
    }
    if (post.mediatype == 'gallery') {
        if (post.mediadata != '' && JSON.parse(post.mediadata).length > 0) {
            str += '<div class="t-feed__post-popup__cover-wrapper t-feed__post-popup__cover-wrapper_' + position + '">' +
                        '' + t_feed_drawPostPopupGallery(recid, opts, post) +
                    '</div>';
        }
    }
    return str;
}


function t_feed_drawPostPopupVideo(post) {
    var playerType = '';
    var videoId = '';
    var value = post.mediadata;

    if (value.indexOf('youtube') != -1 || value.indexOf('youtu.be') != -1) {
        playerType = 'youtube';
    } else if (value.indexOf('vimeo') != -1) {
        playerType = 'vimeo';
    }

    var str = '';
    if (playerType == 'youtube') {
        if (value.indexOf('youtube') != -1) {
            videoId = value.match(/youtube\.com\/watch\?v=([a-z0-9_-]{11})/i);
        } else {
            videoId = value.match(/youtu\.be\/([a-z0-9_-]{11})/i);
        }

        if (videoId && videoId.length > 1) {
            videoId = videoId[1];
        }
        str += '<iframe src="//youtube.com/embed/' + videoId + '?rel=0&fmt=18&html5=1&showinfo=0" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>';
    }
    if (playerType == 'vimeo') {
        videoId = value.match(/vimeo\.com\/([0-9]+)/i);
        if (videoId && videoId.length > 1) {
            videoId = videoId[1];
        }
        str += '<iframe src="//player.vimeo.com/video/' + videoId + '?title=0&byline=0&portrait=0&badge=0&color=ffffff" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    }

    return str;
}


function t_feed_drawPostPopupGallery(recid, opts, post) {
    var galleryItems = JSON.parse(post.mediadata);
    var galleryControl = typeof opts.gallery != 'undefined' ? opts.gallery.control : '';
    var withArrowsClass = galleryControl !== 'dots' ? ' t-slds__witharrows' : '';

    var str = '';
    str += '<div class="t-slds" style="visibility: hidden;">' +
                '<div class="t-container t-slds__main">' +
                    '<div class="t-slds__container t-width t-margin_auto">' +
                        '<div class="t-slds__items-wrapper ' + withArrowsClass + '" data-slider-transition="" data-slider-with-cycle="true" data-slider-correct-height="true" data-auto-correct-mobile-width="false">';
    galleryItems.forEach(function (item, i) {
        var activeClass = i == 0 ? ' t-slds__item_active' : '';
        var zoomClass = opts.popup_opts.zoom ? ' t-zoomable' : '';
        var zoomTarget = opts.popup_opts.zoom ? ' data-zoomable="yes" data-img-zoom-url="' + item.img + '"' : '';

        str += '<div class="t-slds__item' + activeClass + '" data-slide-index="' + (i + 1) + '">' +
                    '<div class="t-width t-margin_auto">' +
                        '<div class="t-slds__wrapper t-align_center">';


        if (typeof opts.popup_opts.bgSize == 'undefined') {
            str += '<div class="t_feed__post-popup__gallery-imgwrapper">' +
                        '<div class="t-slds__bgimg t-bgimg' + zoomClass + '"' + zoomTarget + ' data-original="' + item.img + '" style="background-image: url(' + t_feed_getLazyUrl(opts, item.img) + ');"></div>' +
                        '<div class="t-feed__post-popup__slider-separator" data-slider-image-width="860" data-slider-image-height="560"></div>' +
                    '</div>';
        } else {
            if (opts.popup_opts.bgSize == 'cover' || opts.popup_opts.bgSize == 'contain') {
                var containBgSize = opts.popup_opts.bgSize == 'contain' ? ' t-slds__bgimg-contain' : '';
                str += '<div class="t_feed__post-popup__gallery-imgwrapper">' +
                            '<div class="t-slds__bgimg' + containBgSize + ' t-bgimg' + zoomClass + '"' + zoomTarget + ' data-original="' + item.img + '" style="background-image: url(' + t_feed_getLazyUrl(opts, item.img) + ');"></div>' +
                            '<div class="t-feed__post-popup__slider-separator" data-slider-image-width="860" data-slider-image-height="560"></div>' +
                        '</div>';
            }
            if (opts.popup_opts.bgSize == '') {
                var attrOnload = i == 1 ? 'onload="t_sldsInit(' + recid + ')" ' : '';
                str += '<img ' + attrOnload + t_feed_getLazySrc(opts, item.img) + ' class="t-slds__img t-img' + zoomClass + '"' + zoomTarget + '>';
            }
        }
        str +=  '</div>' +
                '</div>' +
                '</div>';
    });
    str += '</div>';
    if (galleryControl !== 'dots') {
        str += '<div class="t-slds__arrow_container">';
        if (galleryItems.length != 1) {
            str += '' + t_feed_drawSliderArrow(opts, 'left');
            str += '' + t_feed_drawSliderArrow(opts, 'right');
        }
        str += '</div>';
    }
    if (galleryControl === 'dots' || galleryControl === '') {
        str += '' + t_feed_drawSliderDots(galleryItems, opts);
    }
    str += '</div>' +
            '</div>' +
            '</div>';
    return str;
}


function t_feed_drawSliderArrow(opts, direction) {
    var arrowWidth = '';
    var arrowBgWidth = '';
    var isGallery = typeof opts.gallery != 'undefined';
    var arrowColor = '';
    if (isGallery) {
        if (opts.gallery.arrowColor) {
            arrowColor = opts.gallery.arrowColor;
        } else {
            arrowColor = '#222222';
        }
    }
    var arrowBg = isGallery ? opts.gallery.arrowBg : '';
    var arrowBgHover = isGallery ? opts.gallery.arrowBgHover : '';
    var showBorder = isGallery ? opts.gallery.showBorder : '';
    var arrowSize = isGallery ? opts.gallery.arrowSize : '';
    var arrowBorderSize = isGallery ? opts.gallery.arrowBorderSize : '';
    if (arrowBorderSize !== '') {
        arrowBorderSize = parseInt(opts.gallery.arrowBorderSize);
    } else {
        arrowBorderSize = 1;
    }

    var str = '';

    if (arrowBg !== '' || arrowBgHover !== '' || showBorder !== '') {
        switch (arrowSize) {
            case 'sm':
                arrowWidth = 6;
                arrowBgWidth = 30;
                break;
            case 'lg':
                arrowWidth = 10;
                arrowBgWidth = 50;
                break;
            case 'xl':
                arrowWidth = 14;
                arrowBgWidth = 60;
                break;
            default:
                arrowWidth = 8;
                arrowBgWidth = 40;
                break;
        }
    } else {
        switch (arrowSize) {
            case 'sm':
                arrowWidth = 12;
                break;
            case 'lg':
                arrowWidth = 20;
                break;
            case 'xl':
                arrowWidth = 24;
                break;
            default:
                arrowWidth = 16;
                break;
        }
    }

    var arrowWithBgClass = arrowBg !== '' || arrowBgHover !== '' || showBorder !== '' ? ' t-slds__arrow-withbg' : '';
    var arrowStyle = '';
    if (arrowBg !== '' || arrowBgHover !== '' || showBorder !== '') {
        arrowStyle += 'style="';
        arrowStyle += 'width:' + arrowBgWidth + 'px;';
        arrowStyle += 'height:' + arrowBgWidth + 'px;';
        if (showBorder !== '') {
            arrowStyle += 'border: ' + arrowBorderSize + 'px solid ' + arrowColor + ';';
        }
        arrowStyle += '"';
    }

    str += '<div class="t-slds__arrow_wrapper t-slds__arrow_wrapper-' + direction + '" data-slide-direction="' + direction + '">' +
                '<div class="t-slds__arrow t-slds__arrow-' + direction + ' ' + arrowWithBgClass + '" ' + arrowStyle + '>' +
                    '<div class="t-slds__arrow_body t-slds__arrow_body-' + direction + '" style="width: ' + (arrowWidth + arrowBorderSize) + 'px;">' +
                        '<svg style="display: block" viewBox="0 0 ' + (arrowWidth + arrowBorderSize * 1.3) + ' ' + (arrowWidth * 2 + arrowBorderSize) + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                            '<polyline fill="none" stroke="' + arrowColor + '" stroke-linejoin="butt" stroke-linecap="butt" stroke-width="' + arrowBorderSize + '" points="' + (arrowBorderSize / 2) + ',' + (arrowBorderSize / 2) + ' ' + (arrowWidth + arrowBorderSize / 2) + ',' + (arrowWidth + arrowBorderSize / 2) + ' ' + (arrowBorderSize / 2) + ',' + (arrowWidth * 2 + arrowBorderSize / 2) + '" />' +
                        '</svg>' +
                    '</div>' +
                '</div>' +
            '</div>';

    return str;
}


function t_feed_drawSliderDots(galleryItems, opts) {
    var isGallery = typeof opts.gallery != 'undefined';
    var bulletWidth = isGallery ? opts.gallery.dotsWidth : '8px';
    bulletWidth = parseInt(bulletWidth);
    if (bulletWidth > 20) {
        bulletWidth = 20;
    }
    var activeBulletClass = '';
    var dotsActiveBg = isGallery ? opts.gallery.dotsActiveBg : '';
    dotsActiveBg = dotsActiveBg !== '' ? dotsActiveBg : '#222222';
    var dotsBg = isGallery ? opts.gallery.dotsBg : '';
    var dotsBorderSize = isGallery ? opts.gallery.dotsBorderSize : '';
    var dotsStyle = '';

    dotsStyle += bulletWidth !== '' ? 'width:' + bulletWidth + 'px;height:' + bulletWidth + 'px;' : '';
    dotsStyle += dotsBg !== '' ? 'background-color:' + dotsBg + ';' : '';
    dotsStyle += dotsBorderSize !== '' ? 'border:' + dotsBorderSize + ' solid ' + dotsActiveBg + ';' : '';

    var str = '';
    str += '<div class="t-slds__bullet_wrapper">';
    galleryItems.forEach(function (item, i) {
        if (item.length != 1) {
            activeBulletClass = i == 0 ? ' t-slds__bullet_active' : '';
            str += '<div class="t-slds__bullet' + activeBulletClass + '" data-slide-bullet-for="' + (i + 1) + '">' +
                        '<div class="t-slds__bullet_body" style="' + dotsStyle + '"></div>' +
                    '</div>';
        }
    });
    str += '</div>';
    return str;
}


function t_feed_setGalleryImageHeight(recid) {
    var rec = document.querySelector('#rec' + recid);
    var images = rec.querySelectorAll('.t-feed__post-popup__slider-separator');
    Array.prototype.forEach.call(images, function(image){
        var width = image.getAttribute('data-slider-image-width');
        var height = image.getAttribute('data-slider-image-height');
        var ratio = height / width;
        var padding = ratio * 100;
        image.style.paddingBottom =  padding + '%';
    });
}


// TODO: add only for snippet
// eslint-disable-next-line no-unused-vars
function t_feed_PostInit() {
    /* *** */
}


function t_feed_drawPostPopupDate(opts, post, recid) {
    var style = opts.popup_opts.subtitleColor ? 'style="color:' + opts.popup_opts.subtitleColor + '"' : '';
    var str = '';
    if (typeof opts.popup_opts.showDate == 'undefined' || opts.popup_opts.showDate) {
        str += '<span class="t-feed__post-popup__date-wrapper">' +
                    '<span class="js-feed-post-date t-feed__post-popup__date t-uptitle t-uptitle_sm" ' + style + '>' + t_feed_formateDate(post.date, opts, recid) + '</span>' +
                '</span>';
    }
    return str;
}


function t_feed_drawPostPopupTitle(opts, post) {
    var style = opts.popup_opts.titleColor ?
        'style="color:' + opts.popup_opts.titleColor + '"' :
        '';
    var str = '';
    if (post.title) {
        str += '<div class="t-feed__post-popup__title-wrapper">' +
                    '<div class="js-feed-post-title t-feed__post-popup__title t-title t-title_xxs" ' + style + '>' +
                        '' + post.title +
                    '</div>' +
                '</div>';
    }
    return str;
}


function t_feed_drawPostPopupText(opts, post) {
    var style = opts.popup_opts.textColor ? 'style="color:' + opts.popup_opts.textColor + '"' : '';
    var text = '';

    if (post.text) {
        text = post.text;
    } else if (post.descr && typeof post.needGetPost == 'undefined') {
        text = post.descr;
    }

    // Временно убираем
    var textFF = '';
    // if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    //     textFF = ' t-feed__post-popup__text_ff';
    // }

    var str = '';
    if (text || post.needGetPost) {
        str += '<div id="feed-text" class="t-feed__post-popup__text-wrapper" data-animationappear="off">' +
                    '<div class="js-feed-post-text t-feed__post-popup__text t-text t-text_md' + textFF + '" ' + style + '>' + text + '</div>' +
                '</div>';
    }

    return str;
}


/**
 * Draw author element if it is filled in admin panel
 * @param {object} opts – object with feed settings
 * @param {object} post – JSON with data for post
 * @returns 
 */
function t_feed_drawPostPopupAuthor(opts, post) {
    var authorLink = {
        open: post.authorurl ? '<a href="' + post.authorurl + '" class="t-feed__post-popup__author-link" target="_blank">' : '',
        close: post.authorurl ? '</a>' : ''
    };

    var style = opts.popup_opts.textColor ? 'style="color:' + opts.popup_opts.textColor + '"' : '';
    var str = '';

    str += authorLink.open;
    str += '<div class="js-feed-post-author t-feed__post-popup__author-wrapper">';
    if (post.authorimg) {
        str += '<div class="js-feed-post-author-image t-feed__post-popup__author-bgimg t-bgimg" data-original="' + post.authorimg + '" style="background-image:url(' + post.authorimg + ')"></div>';
    }
    if (post.authorname) {
        str += '<span class="js-feed-post-author-name t-feed__post-popup__author-name t-descr t-descr_xxs" ' + style + '>' + post.authorname + '</span>';
    }
    str += '</div>';
    str += authorLink.close;
    return str;
}


/**
 * Render relevant posts if "See also" section is shown
 * @param {string} recid – recid of current block
 * @param {object} opts – object with feed settings
 * @param {object} obj – object with data which came from the backend
 * @param {string} postuid – uid of current post
 * @returns 
 */
function t_feed_addRelevantsPosts(recid, opts, obj, postuid) {
    var ts = Date.now();

    var request = new XMLHttpRequest();
    request.open('GET', t_feed_createRelevantsURL(opts, obj, postuid), true);
    request.timeout = 1000 * 25;
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            if (request.response === '') {
                return;
            }

            var obj = JSON.parse(request.response);

            if (typeof obj !== 'object') {
                return;
            }

            t_feed_addRelevantsHTML(recid, opts, obj);
        }
    };

    request.onerror = function() {
        var ts_delta = Date.now() - ts;
        if (request.response.status == 0 && ts_delta < 100 && request.response.readyState !== 0) {
            alert('Request error (get posts). Please check internet connection...');
        }
    };

    request.send();
}


function t_feed_createRelevantsURL(opts, obj, postuid) {
    var method = 'random';
    var postsFromPart = '';

    switch (opts.popup_opts.methodRelevants) {
        case 'random':
            method = 'random';
            break;
        case 'newest':
            method = 'last';
            break;
        case 'pop':
            method = 'popular';
            break;
        case 'unpop':
            method = 'unpopular';
            break;
    }

    if (opts.popup_opts.showRelevants == 'cc') {
        if (typeof obj.postparts[0] != 'undefined') {
            postsFromPart = '&partuid=' + obj.postparts[0].partuid;
        }
    }

    var apiUrl = 'https://feeds.tildacdn.com/api/getrelevantposts/?postuid=' + postuid + '&size=4&method=' + method + postsFromPart;
    return apiUrl;
}


function t_feed_addRelevantsHTML(recid, opts, obj) {
    var relevantsHTML = '';
    var relevantsPosts = obj.relevants;

    if (relevantsPosts.length > 0) {
        relevantsHTML += '' + t_feed_addRelevantsTitle(recid, opts);
        relevantsHTML += '<div class="t-feed__post-popup__relevants-wrapper">';
        for (var i = 0; i < relevantsPosts.length; i++) {
            var post = relevantsPosts[i];
            if (opts.popup_opts.styleRelevants == 'cols') {
                relevantsHTML += '' + t_feed_drawRelevantsPostInCol(opts, post);
            } else {
                relevantsHTML += '' + t_feed_drawRelevantsPostInRow(opts, post);
            }
        }
        relevantsHTML += '</div>';
    }

    var relevantsWrapper = document.querySelector('.js-feed-relevants');
    relevantsWrapper.insertAdjacentHTML('beforeend', relevantsHTML);
}


function t_feed_addRelevantsTitle(recid, opts) {
    var style = opts.popup_opts.titleColor ? ' style="color:' + opts.popup_opts.titleColor + '";' : '';
    var widthWrapper = opts.popup_opts.styleRelevants == 'cols' ? ' t-col_12' : ' t-col_8 t-prefix t-prefix_2';
    var title = opts.popup_opts.titleRelevants ? opts.popup_opts.titleRelevants : t_feed_getDictionary('seealso', recid);
    var str = '<div class="t-feed__post-popup__relevants-title-wrapper t-col' + widthWrapper + '">' +
                '<div class="t-feed__post-popup__relevants-title t-align_left t-uptitle t-uptitle_xxl"' + style + '>' + title + '</div>' +
            '</div>';
    return str;
}


function t_feed_drawRelevantsPostInRow(opts, post) {
    var str = '<div class="t-feed__post-popup__relevants-item-wrapper">' +
                '<div class="t-feed__post-popup__relevants-item t-feed__post-popup__relevants-item_row t-col t-col_8 t-prefix t-prefix_2 t-align_left">' +
                    '<a class="" href="' + post.url + '">' +
                        '<div class="t-feed__post-popup__relevants-content">' +
                            '' + t_feed_drawRelevantsPostContent(opts, post) +
                        '</div>' +
                    '</a>' +
                '</div>' +
            '</div>';
    return str;
}


function t_feed_drawRelevantsPostInCol(opts, post) {
    var str = '<div class="t-feed__post-popup__relevants-item t-col t-col_3 t-align_left">' +
                '<a class="" href="' + post.url + '">' +
                    '' + t_feed_drawRelevantsPostContent(opts, post) +
                '</a>' +
            '</div>';
    return str;
}


function t_feed_drawRelevantsPostContent(opts, post) {
    var titleStyle = opts.popup_opts.titleColor ? ' style="color:' + opts.popup_opts.titleColor + '";' : '';
    var textStyle = opts.popup_opts.textColor ? ' style="color:' + opts.popup_opts.textColor + '";' : '';
    var partsStyle = opts.popup_opts.subtitleColor ? ' style="color:' + opts.popup_opts.subtitleColor + '";' : '';
    var imgSrc = '';
    if (post.thumb) {
        imgSrc = post.thumb;
    } else if (post.image) {
        imgSrc = post.image;
    }

    var str = '';
    if (imgSrc) {
        str += '<div class="t-feed__post-popup__relevants-imgwrapper">' +
                    '<div class="t-feed__post-popup__relevants-bgimg t-bgimg" data-original="' + imgSrc + '" style="background-image: url(' + imgSrc + ');"></div>' +
                '</div>';
    }
    str += '<div class="t-feed__post-popup__relevants-textwrapper">' +
            '<div class="t-feed__post-popup__relevants-parts" style="">';
    post.postparts.forEach(function (item) {
        if (item != '') {
            str += '<span class="t-feed__post-popup__relevants-item-tag t-uptitle t-uptitle_xs"' + partsStyle + '>' + item.parttitle + '</span>';
        }
    });
    str += '</div>';
    if (post.title) {
        str += '<div class="t-feed__post-popup__relevants-item-title t-name t-name_xs"' + titleStyle + '>' + post.title + '</div>';
    }
    if (post.descr) {
        str += '<div class="t-feed__post-popup__relevants-item-descr t-descr t-descr_xxs"' + textStyle + '>' + post.descr + '</div>';
    }
    str += '</div>';
    return str;
}


function t_feed_drawPostPopupArrowTop(opts) {
    var color = opts.arrowtop_opts.color ? 'style="fill: ' + opts.arrowtop_opts.color + ';"' : '';
    var bottomCoordinate = opts.arrowtop_opts.bottom ? opts.arrowtop_opts.bottom : '20px';

    var position = 'left:20px;';
    if (opts.arrowtop_opts.left) {
        position = 'left:' + opts.arrowtop_opts.left + ';';
    }
    if (opts.arrowtop_opts.right) {
        position = 'right:' + opts.arrowtop_opts.right + ';';
    }

    var style = 'style="position:fixed;z-index:1;bottom:' + bottomCoordinate + ';' + position + 'min-height:30px;"';
    var str = '';

    str += '<div class="t-feed__post-popup__arrow-top" ' + style + '>';
    switch (+opts.arrowtop_opts.style) {
        case 2:
            str += '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 48 48">' +
                        '<path ' + color + ' d="M24 3.125c11.511 0 20.875 9.364 20.875 20.875S35.511 44.875 24 44.875 3.125 35.511 3.125 24 12.489 3.125 24 3.125m0-3C10.814.125.125 10.814.125 24S10.814 47.875 24 47.875 47.875 37.186 47.875 24 37.186.125 24 .125z"/>' +
                        '<path ' + color + ' d="M25.5 36.033a1.5 1.5 0 11-3 0V16.87l-7.028 7.061a1.497 1.497 0 01-2.121.005 1.5 1.5 0 01-.005-2.121l9.591-9.637A1.498 1.498 0 0124 11.736h.001c.399 0 .783.16 1.063.443l9.562 9.637a1.5 1.5 0 01-2.129 2.114l-6.994-7.049-.003 19.152z"/>' +
                    '</svg>';
            break;
        case 3:
            str += '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 48 48">' +
                        '<path ' + color + ' d="M43.006 47.529H4.964a4.805 4.805 0 01-4.791-4.791V4.697A4.805 4.805 0 014.964-.094h38.042a4.805 4.805 0 014.791 4.791v38.042a4.805 4.805 0 01-4.791 4.79zM25.503 16.881l6.994 7.049a1.5 1.5 0 102.129-2.114l-9.562-9.637a1.5 1.5 0 00-1.063-.443H24c-.399 0-.782.159-1.063.442l-9.591 9.637a1.5 1.5 0 102.126 2.116L22.5 16.87v19.163a1.5 1.5 0 103 0l.003-19.152z"/>' +
                    '</svg>';
            break;
        case 1:
        default:
            str += '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 48 48">' +
                        '<path ' + color + ' d="M47.875 24c0 13.186-10.689 23.875-23.875 23.875S.125 37.186.125 24 10.814.125 24 .125 47.875 10.814 47.875 24zm-22.372-7.119l6.994 7.049a1.5 1.5 0 102.129-2.114l-9.562-9.637a1.5 1.5 0 00-1.063-.443H24c-.399 0-.782.159-1.063.442l-9.591 9.637a1.5 1.5 0 102.126 2.116L22.5 16.87v19.163a1.5 1.5 0 103 0l.003-19.152z"/>' +
                    '</svg>';
            break;
    }
    str += '</div>';

    return str;
}


function t_feed_drawEmptyMessage(opts, recid) {
    var styles = opts.typo.titleColor ? 'color:' + opts.typo.titleColor + ';border-color:' + opts.typo.titleColor + ';' : '';
    var str = '<div class="js-feed-error-msg t-feed__error-msg-cont t-col t-col_12">' +
                    '<div class="t-feed__error-msg-wrapper t-descr t-descr_sm" style="' + styles + '">' +
                        '<div class="t-feed__error-msg">' +
                            '' + t_feed_getDictionary('emptypartmsg', recid) +
                        '</div>' +
                    '</div>' +
                '</div>';
    return str;
}


function t_feed_drawErrorBox(opts, errorText) {
    var styles = opts.typo.titleColor ? 'color:' + opts.typo.titleColor + ';border-color:' + opts.typo.titleColor + ';' : '';
    var str = '<div class="js-feed-error-msg t-feed__error-msg-cont t-col t-col_12">' +
                    '<div class="t-feed__error-msg-wrapper t-descr t-descr_sm" style="' + styles + '">' +
                        '<div class="t-feed__error-msg">' +
                            '' + errorText +
                        '</div>' +
                    '</div>' +
                '</div>';
    return str;
}


function t_feed_formateDate(date, opts, recid) {
    var dayDate = date.split(' ')[0];
    var timeDate = date.split(' ')[1];
    var dateParts = dayDate.split('-');
    var newDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var time = +opts.timeFormat == 1 ? ' ' + timeDate : '';
    var newMonth = newDate.getMonth();
    var day = dateParts[2];
    var month = dateParts[1];
    var year = dateParts[0];

    var monthArr = [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december'
    ];

    var monthTitle = t_feed_getDictionary(monthArr[newMonth], recid);


    switch (+opts.dateFormat) {
        case 1:
            return month + '-' + day + '-' + year + time;
        case 2:
            return day + '-' + month + '-' + year + time;
        case 3:
            return day + '/' + month + '/' + year + time;
        case 4:
            return day + '.' + month + '.' + year + time;
        case 5:
            return monthTitle[0] + ' ' + day + ', ' + year + time;
        case 6:
            return day + ' ' + monthTitle[1] + ' ' + year + time;
        default:
            return t_feed_addDefaultDate(recid, dateParts, date, monthTitle, time);
    }
}


function t_feed_addDefaultDate(recid, dateParts, date, monthTitle, time) {
    var lang = t_feed_returnLang(recid);
    var currentDate = new Date();
    var postDateMs = Date.parse(date);
    var diffDate = currentDate - postDateMs;
    var days = Math.floor(diffDate / (60 * 60 * 1000 * 24));
    var agoTitle = t_feed_getDictionary('ago', recid);
    var daysTitle = (lang == 'RU' || lang == 'UK') && (days > 4) ? t_feed_getDictionary('days', recid)[1] : t_feed_getDictionary('days', recid)[0];
    var currentYear = currentDate.getFullYear();
    var postYear = +date.split('-')[0];
    var agoTitleSeparator = (lang == 'JA' || lang == 'ZH') ? '' : ' ';
    var year = postYear != currentYear ? postYear : '';
    var defaultDate = '';

    if (days == 0) {
        defaultDate = t_feed_getDictionary('today', recid);
    }

    if (days == 1) {
        defaultDate = t_feed_getDictionary('yesterday', recid);
    }

    if (days > 1 && days < 15) {
        if (lang == 'FR' || lang == 'DE' || lang == 'ES' || lang == 'PT') {
            defaultDate = agoTitle + agoTitleSeparator + days + agoTitleSeparator + daysTitle;
        } else {
            defaultDate = days + agoTitleSeparator + daysTitle + agoTitleSeparator + agoTitle;
        }
    }

    if (days >= 15 || postYear > currentYear) {
        defaultDate = t_feed_addFullDate(lang, dateParts[2], monthTitle, year) + time;
    }

    return defaultDate;
}


function t_feed_addFullDate(lang, day, month, year) {
    var monthSeparator = lang == 'DE' ? '. ' : ' ';
    var datePartSeparator = ' ';
    if (lang == 'EN') {
        datePartSeparator = year != '' ? ', ' : '';
    } else if (lang == 'ES' || lang == 'PT') {
        datePartSeparator = year != '' ? ' de ' : '';
    }

    var monthTitle = month[1];
    if (lang == 'EN' || lang == 'DE') {
        monthTitle = month[0];
    }

    if (lang == 'EN') {
        return monthTitle + ' ' + day + datePartSeparator + year;
    } else if (lang == 'JA' || lang == 'ZH') {
        return year + monthTitle + day;
    } else {
        return day + monthSeparator + monthTitle + datePartSeparator + year;
    }
}


function t_feed_getDictionary(msg, recid) {
    var dict = [];

    dict['emptypartmsg'] = {
        EN: 'Nothing found',
        RU: 'Ничего не найдено',
        FR: 'Rien trouvé',
        DE: 'Nichts gefunden',
        ES: 'Nada encontrado',
        PT: 'Nada encontrado',
        UK: 'Нічого не знайдено',
        JA: '何も見つかりませんでした',
        ZH: '什么都没找到',
        PL: 'Nic nie znaleziono',
        KK: 'Ештеңе табылмады',
        IT: 'Non abbiamo trovato nulla',
        LV: 'Nekas nav atrasts',
    };

    dict['all'] = {
        EN: 'All',
        RU: 'Все',
        FR: 'Tout',
        DE: 'Alles',
        ES: 'Todos',
        PT: 'Todos',
        UK: 'Всі',
        JA: 'すべて',
        ZH: '所有',
        PL: 'Wszystko',
        KK: 'Барлық',
        IT: 'Tutte',
        LV: 'Visi',
    };

    dict['seealso'] = {
        EN: 'See also',
        RU: 'Смотрите также',
        FR: 'Voir également',
        DE: 'Siehe auch',
        ES: 'Ver también',
        PT: 'Veja também',
        UK: 'Дивись також',
        JA: 'また見なさい',
        ZH: '也可以看看',
        PL: 'Patrz również',
        KK: 'Сондай-ақ, қараңыз',
        IT: 'Guarda anche',
        LV: 'Skatīt arī',
    };

    dict['today'] = {
        EN: 'Today',
        RU: 'Сегодня',
        FR: 'Aujourd\'hui',
        DE: 'Heute',
        ES: 'Hoy',
        PT: 'Hoje',
        UK: 'Сьогодні',
        JA: '今日',
        ZH: '今天',
        PL: 'Dzisiaj',
        KK: 'Бүгін',
        IT: 'Oggi',
        LV: 'Šodien',
    };

    dict['yesterday'] = {
        EN: 'Yesterday',
        RU: 'Вчера',
        FR: 'Hier',
        DE: 'Gestern',
        ES: 'Ayer',
        PT: 'Ontem',
        UK: 'Вчора',
        JA: '昨日',
        ZH: '昨天',
        PL: 'Wczoraj',
        KK: 'Кеше',
        IT: 'Ieri',
        LV: 'Vakar',
    };

    dict['days'] = {
        EN: ['days'],
        RU: ['дня', 'дней'],
        FR: ['jours'],
        DE: ['tagen'],
        ES: ['dias'],
        PT: ['dias'],
        UK: ['дні', 'днів'],
        JA: ['日'],
        ZH: ['天'],
        PL: ['dni'],
        KK: ['күн'],
        IT: ['giorni'],
        LV: ['dienas'],
    };

    dict['ago'] = {
        EN: 'ago',
        RU: 'назад',
        FR: 'Il y a',
        DE: 'Vor',
        ES: 'Hace',
        PT: 'Há',
        UK: 'тому',
        JA: '前',
        ZH: '前',
        PL: 'powrót',
        KK: 'бұрын',
        IT: 'fa',
        LV: 'pirms',
    };

    dict['january'] = {
        EN: ['January', 'january'],
        RU: ['Январь', 'января'],
        FR: ['Janvier', 'janvier'],
        DE: ['Januar', 'januar'],
        ES: ['Enero', 'de enero'],
        PT: ['Janeiro', 'de janeiro'],
        UK: ['Січень', 'січня'],
        JA: ['一月', '一月'],
        ZH: ['一月', '一月'],
        PL: ['Styczeń', 'styczenia'],
        KK: ['Қаңтар'],
        IT: ['Gennaio'],
        LV: ['Janvāris'],
    };

    dict['february'] = {
        EN: ['February', 'february'],
        RU: ['Февраль', 'февраля'],
        FR: ['Février', 'février'],
        DE: ['Februar', 'februar'],
        ES: ['Febrero', 'de febrero'],
        PT: ['Fevereiro', 'de fevereiro'],
        UK: ['Лютий', 'лютого'],
        JA: ['二月', '二月'],
        ZH: ['二月', '二月'],
        PL: ['Luty', 'lutego'],
        KK: ['Ақпан'],
        IT: ['Febbraio'],
        LV: ['Februāris'],
    };

    dict['march'] = {
        EN: ['March', 'March'],
        RU: ['Март', 'марта'],
        FR: ['Mars', 'mars'],
        DE: ['März', 'märz'],
        ES: ['Marzo', 'de marzo'],
        PT: ['Março', 'de março'],
        UK: ['Березень', 'березня'],
        JA: ['三月', '三月'],
        ZH: ['三月', '三月'],
        PL: ['Marzec', 'marca'],
        KK: ['Наурыз'],
        IT: ['Marzo'],
        LV: ['Marts'],
    };

    dict['april'] = {
        EN: ['April', 'april'],
        RU: ['Апрель', 'апреля'],
        FR: ['Avril', 'avril'],
        DE: ['April', 'april'],
        ES: ['Abril', 'de abril'],
        PT: ['Abril', 'de abril'],
        UK: ['Квітень', 'квітня'],
        JA: ['四月', '四月'],
        ZH: ['四月', '四月'],
        PL: ['Kwiecień', 'kwietnia'],
        KK: ['Сәуір'],
        IT: ['Aprile'],
        LV: ['Aprīlis'],
    };

    dict['may'] = {
        EN: ['May', 'may'],
        RU: ['Май', 'мая'],
        FR: ['Mai', 'mai'],
        DE: ['Kann', 'kann'],
        ES: ['Mayo', 'de mayo'],
        PT: ['Maio', 'de maio'],
        UK: ['Травень', 'травня'],
        JA: ['五月', '五月'],
        ZH: ['五月', '五月'],
        PL: ['Maj', 'maja'],
        KK: ['Мамыр'],
        IT: ['Maggio'],
        LV: ['Maijs'],
    };

    dict['june'] = {
        EN: ['June', 'june'],
        RU: ['Июнь', 'июня'],
        FR: ['Juin', 'juin'],
        DE: ['Juni', 'juni'],
        ES: ['Junio', 'de junio'],
        PT: ['Junho', 'de junho'],
        UK: ['Червень', 'червня'],
        JA: ['六月', '六月'],
        ZH: ['六月', '六月'],
        PL: ['Czerwiec', 'czerwca'],
        KK: ['Маусым'],
        IT: ['Giugno'],
        LV: ['Jūnijs'],
    };

    dict['july'] = {
        EN: ['July', 'july'],
        RU: ['Июль', 'июля'],
        FR: ['Juillet', 'juillet'],
        DE: ['Juli', 'Juli'],
        ES: ['Julio', 'de julio'],
        PT: ['Julho', 'de julho'],
        UK: ['Липень', 'липня'],
        JA: ['七月', '七月'],
        ZH: ['七月', '七月'],
        PL: ['Lipiec', 'lipca'],
        KK: ['Шілде'],
        IT: ['Luglio'],
        LV: ['Jūlijs'],
    };

    dict['august'] = {
        EN: ['August', 'august'],
        RU: ['Август', 'августа'],
        FR: ['Août', 'août'],
        DE: ['August', 'august'],
        ES: ['Agosto', 'de agosto'],
        PT: ['Agosto', 'de agosto'],
        UK: ['Серпень', 'серпня'],
        JA: ['八月', '八月'],
        ZH: ['八月', '八月'],
        PL: ['Sierpień', 'sierpnia'],
        KK: ['Тамыз'],
        IT: ['Agosto'],
        LV: ['Augusts'],
    };

    dict['september'] = {
        EN: ['September', 'september'],
        RU: ['Сентябрь', 'сентября'],
        FR: ['Septembre', 'septembre'],
        DE: ['September', 'september'],
        ES: ['Septiembre', 'de septiembre'],
        PT: ['Setembro', 'de setembro'],
        UK: ['Вересень', 'вересня'],
        JA: ['九月', '九月'],
        ZH: ['九月', '九月'],
        PL: ['Wrzesień', 'września'],
        KK: ['Қыркүйек'],
        IT: ['Settembre'],
        LV: ['Septembris'],
    };

    dict['october'] = {
        EN: ['October', 'october'],
        RU: ['Октябрь', 'октября'],
        FR: ['Octobre', 'octobre'],
        DE: ['Oktober', 'oktober'],
        ES: ['Octubre', 'de octubre'],
        PT: ['Outubro', 'de outubro'],
        UK: ['Жовтень', 'жовтня'],
        JA: ['十月', '十月'],
        ZH: ['十月', '十月'],
        PL: ['Październik', 'października'],
        KK: ['Қазан'],
        IT: ['Ottobre'],
        LV: ['Oktobris'],
    };

    dict['november'] = {
        EN: ['November', 'november'],
        RU: ['Ноябрь', 'ноября'],
        FR: ['Novembre', 'novembre'],
        DE: ['November', 'november'],
        ES: ['Noviembre', 'de noviembre'],
        PT: ['Novembro', 'de novembro'],
        UK: ['Листопад', 'листопада'],
        JA: ['十一月', '十一月'],
        ZH: ['十一月', '十一月'],
        PL: ['Listopad', 'listopada'],
        KK: ['Қараша'],
        IT: ['Novembre'],
        LV: ['Novembris'],
    };

    dict['december'] = {
        EN: ['December', 'december'],
        RU: ['Декабрь', 'декабря'],
        FR: ['Décembre', 'décembre'],
        DE: ['Dezember', 'dezember'],
        ES: ['Diciembre', 'de diciembre'],
        PT: ['Dezembro', 'de dezembro'],
        UK: ['Грудень', 'грудня'],
        JA: ['十二月', '十二月'],
        ZH: ['十二月', '十二月'],
        PL: ['Grudzień', 'grudnia'],
        KK: ['Желтоқсан'],
        IT: ['Dicembre'],
        LV: ['Decembris'],
    };

    var lang = t_feed_returnLang(recid);

    if (typeof dict[msg] !== 'undefined') {
        if (typeof dict[msg][lang] !== 'undefined' && dict[msg][lang] != '') {
            return dict[msg][lang];
        } else {
            return dict[msg]['EN'];
        }
    }

    return 'Text not found "' + msg + '"';
}


function t_feed_returnLang(recid) {
    var lang = 'EN';
    if (typeof window.tFeedPosts[recid] != 'undefined' && window.tFeedPosts[recid]['lang'] != '') {
        lang = window.tFeedPosts[recid]['lang'].toUpperCase();
    } else {
        lang = window.browserLang;
    }

    return lang;
}


function t_feed_onFuncLoad(funcName, okFunc, time) {
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
