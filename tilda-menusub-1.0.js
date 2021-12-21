/**
 * Creating (generate submenu list and add it in DOM) and actions (show and hide by hover/click/touch) with second level menu. Blocks ME[103-405].
 * 
 * @param {string} recid - record ID
 */
// eslint-disable-next-line no-unused-vars
function t_menusub_init(recid) {
    var submenuList = document.querySelectorAll('#rec' + recid + ' .t-menusub');
    Array.prototype.forEach.call(submenuList, function (submenu) {
        var hook = submenu.getAttribute('data-submenu-hook');
        if (!hook) return;
        var hookLinks = '';
        var newVersion = false;
        var submenuLinks = document.querySelectorAll('#rec' + recid + ' a.t-menu__link-item');
        Array.prototype.forEach.call(submenuLinks, function (submenuLink) {
            if (submenuLink.getAttribute('data-menu-submenu-hook')) {
                newVersion = true;
            }
        });
        if (newVersion) {
            hookLinks = document.querySelectorAll('a[data-menu-submenu-hook="' + hook + '"]');
        } else {
            hookLinks = document.querySelectorAll('a[href="' + hook + '"]');
        }
        Array.prototype.forEach.call(hookLinks, function (hookLink) {
            hookLink.classList.add('t-menusub__target-link');
            hookLink.setAttribute('data-tooltip-menu-id', recid);
        });

        t_menusub_add_arrow(recid, hookLinks, hook);
        t_menusub_set_up_menu(recid, hookLinks, hook);
        t_menusub_highlight();
        t_menusub_checkAnchorLinks(recid);
    });

    var menusubEvent = window.isMobile ? 'orientationchange' : 'resize';

    window.addEventListener(menusubEvent, function () {
        Array.prototype.forEach.call(submenuList, function (submenu) {
            var menusubMenuList = submenu.querySelectorAll('.t-menusub__menu');
            Array.prototype.forEach.call(menusubMenuList, function (menusubMenu) {
                t_menusub_hide_submenu(menusubMenu);
            });
        });
    });
}

/**
 * @param {number} recid - record id
 * @param {NodeList} hookLinks - list of hooklinks
 * @param {string} hook - href
 */
function t_menusub_set_up_menu(recid, hookLinks, hook) {
    var subMenuList = document.querySelectorAll('#rec' + recid + ' .t-menusub[data-submenu-hook="' + hook + '"] .t-menusub__menu');
    Array.prototype.forEach.call(subMenuList, function (subMenu) {
        var contentList = subMenu.querySelectorAll('.t-menusub__content');
        if (window.isMobile) {
            t_menusub_set_up_menu_mobile(recid, hookLinks, subMenu);
        } else {
            t_menusub_set_up_menu_desktop(recid, hookLinks, subMenu);
        }
        window.addEventListener('scroll', t_throttle(function () {
            Array.prototype.forEach.call(contentList, function (content) {
                content.addEventListener('mouseleave', function () {
                    if (window.isMobile) return;
                    if (subMenu.classList.contains('t-menusub__menu_show')) {
                        t_menusub_hide_submenu(subMenu);
                    }
                });
            });
        }));
    });
}

/**
 * @param {HTMLElement} wrapME401 - ME401 wrap
 */
function t_menusub_open_inME401(wrapME401) {
    var submenuParentWrapper = wrapME401.querySelector('.t280__menu__wrapper');
    if (submenuParentWrapper && !submenuParentWrapper.classList.contains('t280__menu_static')) {
        var wrapME401Menu = wrapME401.querySelector('.t280__menu');
        var wrapME401Bottom = wrapME401.querySelector('.t280__bottom');
        var wrapME401Wrapper = wrapME401.querySelector('.t280__menu__wrapper');
        if (wrapME401Menu) {
            wrapME401Menu.style.transition = 'none';
        }
        if (wrapME401Bottom) {
            wrapME401Bottom.style.transition = 'none';
        }
        if (wrapME401Wrapper) {
            wrapME401Wrapper.classList.add('t280__menu_static');
        }
    }
}

/**
 * @param {HTMLElement} wrapME401 - ME401 wrap
 */
function t_menusub_close_inME401(wrapME401) {
    var submenuParentWrapper = wrapME401.querySelector('.t280__menu__wrapper');
    if (submenuParentWrapper && submenuParentWrapper.classList.contains('t280__menu_static')) {
        var wrapME401Wrapper = wrapME401.querySelector('.t280__menu__wrapper');
        if (wrapME401Wrapper) {
            wrapME401Wrapper.classList.remove('t280__menu_static');
        }
    }
}

/**
 * @param {number} recid - record id
 * @param {NodeList} hookLinks - nodelist of hooklinks
 * @param {HTMLElement} submenu - submeny
 */
function t_menusub_set_up_menu_mobile(recid, hookLinks, submenu) {
    //use single el, because margin value for all submenu items the value is the same
    var menuSub = document.querySelector('#rec' + recid + ' .t-menusub');
    var marginValue = menuSub ? menuSub.getAttribute('data-submenu-margin') : '';
    Array.prototype.forEach.call(hookLinks, function (hookLink) {
        hookLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.innerWidth > 980) {
                var menuSubMenuList = document.querySelectorAll('#rec' + recid + ' .t-menusub__menu');
                Array.prototype.forEach.call(menuSubMenuList, function (menuSubMenu) {
                    t_menusub_hide_submenu(menuSubMenu);
                });
            }
            if (submenu.classList.contains('t-menusub__menu_show')) {
                t_menusub_hide_submenu(submenu);
            } else {
                t_menusub_show(hookLink, submenu, marginValue);
                var wrapME401 = hookLink.closest('.t280');
                if (wrapME401) {
                    var wrapME401Wrapper = wrapME401.querySelector('.t280__menu__wrapper');
                    var isMobileHeight = t_menusub_is_mobile_ME401(wrapME401);
                    var isStaticME401 = wrapME401Wrapper ? wrapME401Wrapper.getAttribute('data-submenu-static') : '';
                    t_menusub_is_static_ME401(wrapME401);
                    if (isStaticME401 === 'n' && wrapME401 && isMobileHeight) {
                        t_menusub_open_inME401(wrapME401);
                    }
                }
            }
        });
    });
    document.addEventListener('click', function (e) {
        var isInsideSubmenu = e.target.classList.contains('t-menusub__menu') || e.target.closest('.t-menusub__menu');
        var isAnchor = e.target.classList.contains('t-menusub__target-link') || e.target.closest('.t-menusub__target-link');

        //Closing submenu causes position to shift me601
        if (e.target.classList.contains('t794__tm-link') || e.target.classList.contains('t966__tm-link')) {
            return;
        }
        if (isAnchor) {
            var curAnchor;
            if (e.target.classList.contains('t-menusub__target-link')) {
                curAnchor = e.target;
            } else {
                curAnchor = e.target.closest('.t-menusub__target-link');
            }
            if (curAnchor.getAttribute('data-tooltip-menu-id') !== recid && submenu.classList.contains('t-menusub__menu_show')) {
                t_menusub_hide_submenu(submenu);
            }
        }

        if (!isInsideSubmenu && !isAnchor && submenu.classList.contains('t-menusub__menu_show')) {
            t_menusub_hide_submenu(submenu);
        }
    });
}

/**
 * @param {string} recid - record (block) ID 
 * @param {NodeList} hookLinks - all hooks links from current rec, that can open submenu
 * @param {HTMLElement} submenu - second level menu block (.t-menusub)
 */
function t_menusub_set_up_menu_desktop(recid, hookLinks, submenu) {
    var menuSubList = document.querySelectorAll('#rec' + recid + ' .t-menusub');
    Array.prototype.forEach.call(menuSubList, function (menuSub) {
        var marginValue = menuSub.getAttribute('data-submenu-margin');
        var timer;
        Array.prototype.forEach.call(hookLinks, function (hookLink) {
            hookLink.addEventListener('mouseover', function () {
                t_showMenuOnHover(hookLink, timer, submenu, marginValue);
            });
            hookLink.addEventListener('mouseout', function () {
                timer = setTimeout(function () {
                    t_menusub_hide_submenu(submenu);
                }, 300);
            });
            hookLink.addEventListener('click', function (e) {
                e.preventDefault();
            });
            hookLink.addEventListener('auxclick', function (e) {
                e.preventDefault();
            });
        });
        submenu.addEventListener('mouseover', function () {
            t_showMenuOnHover(submenu, timer, submenu, marginValue);
        });
        submenu.addEventListener('mouseout', function () {
            timer = setTimeout(function () {
                t_menusub_hide_submenu(submenu);
            }, 300);
        });
    });
}

/**
 * @param {HTMLElement} el - current element
 * @param {number} timer - param of setTimeout
 * @param {HTMLElement} submenu  - second level menu block (.t-menusub)
 * @param {string} vIndent - margin value in data-attr
 * @returns {void}
 */
function t_showMenuOnHover(el, timer, submenu, vIndent) {
    // if submenu is hovered while disappearing
    if (
        el.classList.contains('t-menusub__menu') && !el.classList.contains('t-menusub__menu_show')) {
        return;
    }
    clearTimeout(timer);
    // if link is already hoverd and now hover is on submenu element
    if (el.classList.contains('t-menusub__menu') && el.classList.contains('t-menusub__menu_show')) {
        return;
    }
    t_menusub_show(el, submenu, vIndent);
}

/**
 * @param {HTMLElement} curAnchor - current anchor
 * @param {HTMLElement} submenu  - second level menu block (.t-menusub)
 * @param {string} vIndent - margin value in data-attr
 */
function t_menusub_show(curAnchor, submenu, vIndent) {
    var anchorHeight = curAnchor.offsetHeight;
    var anchorWidth = curAnchor.offsetWidth;
    var anchorMarginLeft = 0;
    var curAnchorMarginTop = '0';
    if (curAnchor) {
        anchorMarginLeft = parseInt(curAnchor.style.marginLeft) || 0;
        curAnchorMarginTop = window.getComputedStyle(curAnchor).getPropertyValue('margin-top') || '0';
    }

    var winHeight = window.innerHeight;
    var winWidth = window.innerWidth;
    var scrollTop = window.pageYOffset;
    var anchorLeft = curAnchor.offsetLeft;

    if (typeof vIndent != 'undefined' && vIndent != '') {
        vIndent = parseInt(vIndent, 10);
        vIndent = vIndent + 10;
    }

    var positionY = curAnchor.offsetTop - parseInt(curAnchorMarginTop, 10) + anchorHeight + vIndent;
    var positionX = anchorLeft;

    submenu.style.display = 'block';

    var submenuHeight = submenu.offsetHeight;
    var submenuWidth = submenu.offsetWidth;

    // detect positionY, show on the top or bottom?
    if (positionY + submenuHeight > scrollTop + winHeight) {
        positionY = Math.max(
            positionY - submenuHeight - anchorHeight - vIndent * 2,
            scrollTop
        );
        submenu.classList.remove('t-menusub__menu_bottom');
        submenu.classList.add('t-menusub__menu_top');
    } else {
        submenu.classList.remove('t-menusub__menu_top');
        submenu.classList.add('t-menusub__menu_bottom');
    }

    if (window.innerWidth <= 980) {
        positionY = 0;
    }

    if (positionX + submenuWidth / 2 < winWidth) {
        // show in the center of anchor
        positionX = positionX + (anchorWidth - submenuWidth) / 2 + anchorMarginLeft;
        // show near left window border
        if (positionX < 0) {
            positionX = 10;
        }
    } else {
        // show near right window border
        positionX = winWidth - submenuWidth - 10;
    }



    // Changing heights on mobiles
    // TODO: need exceptions in blocks
    submenu.style.left = positionX + 'px';
    submenu.style.top = positionY + 'px';

    submenu.classList.add('t-menusub__menu_show');
    curAnchor.classList.add('t-menusub__target-link_active');
}

/**
 * @param {HTMLElement} submenu - second level menu block (.t-menusub)
 * @returns {false} - if wrapME401 is cannot find from submenu
 */
function t_menusub_hide_submenu(submenu) {
    var activeLink = document.querySelector('.t-menusub__target-link_active');
    if (activeLink) {
        activeLink.classList.remove('t-menusub__target-link_active');
    }

    submenu.style.display = '';
    submenu.style.left = '';
    submenu.style.top = '';
    submenu.classList.remove('t-menusub__menu_show');

    var wrapME401 = submenu.closest('.t280');
    if (!wrapME401) return false;
    var isMobileHeight = t_menusub_is_mobile_ME401(wrapME401);
    var wrapME401Wrapper = wrapME401.querySelector('.t280__menu__wrapper');
    var isStaticME401 = wrapME401Wrapper ? wrapME401Wrapper.getAttribute('data-submenu-static') : '';
    var wrapME401ShowMenus = wrapME401.querySelectorAll('.t280__menu .t-menusub__menu_show');

    if (isStaticME401 === 'n' && window.isMobile && isMobileHeight && !wrapME401ShowMenus.length) {
        t_menusub_close_inME401(wrapME401);
    }
}

/**
 * adding arrows on menu list
 * 
 * @param {string} recid - record ID
 * @param {NodeList} hookLinks - all hooks links from current rec, that can open submenu
 * @param {string} hook - e.target (target link)
 * @returns {void}
 */
function t_menusub_add_arrow(recid, hookLinks, hook) {
    var arrowBlock = document.querySelector('#rec' + recid + ' .t-menusub[data-submenu-hook="' + hook + '"]');
    if (!arrowBlock) return;
    var arrow = arrowBlock.getAttribute('data-add-submenu-arrow');
    if (!arrow) return;
    Array.prototype.forEach.call(hookLinks, function (hookLink) {
        hookLink.insertAdjacentHTML('beforeend', '<div class="t-menusub__arrow"></div>');
    });
}

/**
 * highlight submenu
 */
function t_menusub_highlight() {
    var url = window.location.href;
    var pathname = window.location.pathname;

    Array.prototype.forEach.call([url, pathname], function (urlString) {
        if (urlString[urlString.length - 1] === '/') {
            urlString = urlString.slice(0, -1);
        }
    });

    if (pathname.charAt(0) === '/') {
        pathname = pathname.slice(1);
    }
    if (pathname === '') {
        pathname = '/';
    }

    var listOfElements = '.t-menusub__list-item a[href="' + url + '"], .t-menusub__list-item a[href="' + url + '/"], .t-menusub__list-item a[href="' + pathname + '"], .t-menusub__list-item a[href="/' + pathname + '"], .t-menusub__list-item a[href="' + pathname + '/"], .t-menusub__list-item a[href="/' + pathname + '/"]';
    var elementsList = document.querySelectorAll(listOfElements);

    Array.prototype.forEach.call(elementsList, function (element) {
        element.classList.add('t-active');
    });
}

/**
 * @param {HTMLElement} wrapME401 - ME401 block
 */
function t_menusub_is_static_ME401(wrapME401) {
    if (wrapME401) {
        var wrapME401Wrapper = wrapME401.querySelector('.t280__menu__wrapper');
        if (wrapME401Wrapper && wrapME401Wrapper.classList.contains('t280__menu_static')) {
            wrapME401Wrapper.setAttribute('data-submenu-static', 'n');
        }
    }
}

/**
 * @param {HTMLElement} wrapME401 - ME401 block
 * @returns {boolean} true | false
 */
function t_menusub_is_mobile_ME401(wrapME401) {
    var wrapME401Menu = wrapME401.querySelector('.t280__menu');
    var wrapME401Bottom = wrapME401.querySelector('.t280__bottom');
    var wrapME401Container = wrapME401.querySelector('.t280__container');
    var menuHeight = wrapME401Menu ? wrapME401Menu.offsetHeight : 0;
    var menuBottomHeight = wrapME401Bottom ? wrapME401Bottom.offsetHeight : 0;
    var menuHeaderHeight = wrapME401Container ? wrapME401Container.offsetHeight : 0;
    var wrapperHeight = window.innerHeight - menuBottomHeight - menuHeaderHeight - 40;
    if (menuHeight > wrapperHeight) {
        return true;
    }
    return false;
}

/**
 * @param {number} recid - record id
 */
function t_menusub_checkAnchorLinks(recid) {
    if (window.innerWidth >= 960) {
        var navLinks = document.querySelectorAll('#rec' + recid + ' a:not(.tooltipstered)[href*="#"].t-menusub__link-item');
        if (navLinks.length) {
            t_menusub_catchScroll(navLinks);
        }
    }
}

/**
 * @param {NodeList} navLinks - list of nav links
 */
function t_menusub_catchScroll(navLinks) {
    var clickedSectionId = null;
    var sections = [];
    var sectionIdTonavigationLink = [];
    var interval = 100;
    var lastCall;
    var timeoutId;

    var navLinksReversed = [];
    Array.prototype.forEach.call(navLinks, function (navLink) {
        navLinksReversed.push(navLink);
    });
    navLinksReversed.reverse();

    Array.prototype.forEach.call(navLinksReversed, function (navLinkReversed) {
        var curSectionList = t_menusub_getSectionByHref(navLinkReversed);
        if (curSectionList && curSectionList.length) {
            Array.prototype.forEach.call(curSectionList, function (curSection) {
                if (curSection.id) {
                    sections.push(curSection);
                }
                sectionIdTonavigationLink[curSection.id] = navLinkReversed;
            });
        }

        navLinkReversed.addEventListener('click', function () {
            if (!navLinkReversed.classList.contains('tooltipstered')) {
                navLinkReversed.classList.remove('t-active');
                var sections = t_menusub_getSectionByHref(navLinkReversed);
                if (sections && sections.length) {
                    Array.prototype.forEach.call(sections, function (section) {
                        sectionIdTonavigationLink[section.id].classList.add('t-active');
                        clickedSectionId = section.id;
                    });
                }
            }
        });
    });

    t_menusub_highlightNavLinks(navLinksReversed, sections, sectionIdTonavigationLink, clickedSectionId);

    window.addEventListener('resize', t_throttle(function () {
        t_menusub_updateSectionsOffsets(sections);
    }));

    setTimeout(function () {
        t_menusub_updateSectionsOffsets(sections);
        t_menusub_highlightNavLinks(navLinksReversed, sections, sectionIdTonavigationLink, clickedSectionId);
    }, 1000);

    window.addEventListener('scroll', t_throttle(function () {
        var now = new Date().getTime();
        if (lastCall && now < (lastCall + interval)) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                lastCall = now;
                clickedSectionId = t_menusub_highlightNavLinks(navLinksReversed, sections, sectionIdTonavigationLink, clickedSectionId);
            }, interval - (now - lastCall));
        } else {
            lastCall = now;
            clickedSectionId = t_menusub_highlightNavLinks(navLinksReversed, sections, sectionIdTonavigationLink, clickedSectionId);
        }
    }));
}


/**
 * @param {HTMLElement} curlink - e.target on click submenu link
 * @returns {HTMLElement | undefined} - undefined if any of conditions is not met
 */
function t_menusub_getSectionByHref(curlink) {
    var href = curlink.getAttribute('href');
    var hash = '';
    if (href) {
        hash = href.replace(/\s+/g, '').substring(1);
    }
    var block = document.querySelectorAll('.r[id="' + hash + '"]');
    var anchors = document.querySelectorAll('.r[data-record-type="215"]');
    //checking that the anchor has children with current attr
    var anchorChild;
    if (anchors.length) {
        var anchorChild = 0;
        Array.prototype.forEach.call(anchors, function (anchor) {
            if (anchor.querySelector('a[name="' + hash + '"]')) {
                anchorChild++;
            }
        });
    }
    if (block.length === 1) {
        return block;
    } else if (anchors.length === 1 && anchorChild) {
        return anchors;
    } else {
        return undefined;
    }
}

/**
 * 
 * @param {NodeList} navLinks - reversed NodeList of navLinks (.t-menusub__link-item)
 * @param {NodeList} sections - anchor or block in DOM which can be use (.r id="#anchor")
 * @param {NodeList} sectionIdTonavigationLink - navLinks from reversed NodeList if sections exist
 * @param {string} clickedSectionId - current section ID of clicked navLink
 * @returns {null | false | string} -
 */
function t_menusub_highlightNavLinks(navLinks, sections, sectionIdTonavigationLink, clickedSectionId) {
    var scrollPosition = window.pageYOffset;
    var valueToReturn = clickedSectionId;
    var lastChildSectionAttr = 0;
    if (sections.length) {
        lastChildSectionAttr = sections[sections.length - 1].getAttribute('data-offset-top');
    }
    if (sections.length && clickedSectionId === null && +lastChildSectionAttr > (scrollPosition + 300)) {
        Array.prototype.forEach.call(navLinks, function (navLink) {
            navLink.classList.remove('t-active');
        });
        return null;
    }

    Array.prototype.forEach.call(sections, function (section) {
        var sectionTop = section.getAttribute('data-offset-top');
        var id = section.id;
        var navLink = sectionIdTonavigationLink[id];
        var documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

        if (((scrollPosition + 300) >= sectionTop) || (sections[0].id === id && scrollPosition >= documentHeight - window.innerHeight)) {
            if (clickedSectionId === null && !navLink.classList.contains('t-active')) {
                Array.prototype.forEach.call(navLinks, function (navLink) {
                    navLink.classList.remove('t-active');
                });
                navLink.classList.add('t-active');
            } else if (clickedSectionId !== null && id === clickedSectionId) {
                valueToReturn = null;
            }
        }
        return false;
    });
    return valueToReturn;
}

/**
 * @param {NodeList} sections - list of sections
 */
function t_menusub_updateSectionsOffsets(sections) {
    Array.prototype.forEach.call(sections, function (section) {
        section.setAttribute('data-offset-top', section.offsetTop);
    });
}

// Polyfill: Element.prototype.matches
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