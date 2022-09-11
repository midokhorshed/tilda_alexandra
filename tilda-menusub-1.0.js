// global variables declaration
window.t_menusub__isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Creating (generate submenu list and add it in DOM) and actions (show and hide by hover/click/touch) with second level menu.
 * Blocks ME[103-405].
 *
 * @param {string} recid - record ID
 */
// eslint-disable-next-line no-unused-vars
function t_menusub_init(recid) {
	var rec = document.getElementById('rec' + recid);
	if (!rec) return;
	var submenuWrapperList = rec.querySelectorAll('.t-menusub');
	var submenuHooks = rec.querySelectorAll('a.t-menu__link-item');

	// check if submenu has new version to create correct selector
	var isNewVersion = Array.prototype.some.call(submenuHooks, function (link) {
		return link.getAttribute('data-menu-submenu-hook');
	});
	// event to close submenu
	var closeEvent = window.t_menusub__isMobile ? 'orientationchange' : 'resize';

	Array.prototype.forEach.call(submenuWrapperList, function (submenuWrapper) {
		var hook = submenuWrapper.getAttribute('data-submenu-hook');
		if (!hook) return;
		var hookLinksSelector = isNewVersion ? 'a[data-menu-submenu-hook="' + hook + '"]' : 'a[href="' + hook + '"]';
		var hookLinks = document.querySelectorAll(hookLinksSelector);

		Array.prototype.forEach.call(hookLinks, function (hookLink) {
			hookLink.classList.add('t-menusub__target-link');
			hookLink.setAttribute('data-tooltip-menu-id', recid);
		});

		var submenu = submenuWrapper.querySelector('.t-menusub__menu');

		t_menusub__appendArrow(submenuWrapper, hookLinks);
		if (window.t_menusub__isMobile || 'ontouchend' in document) {
			t_menusub__setUpMenuMobile(submenuWrapper, submenu, hookLinks, recid);
			document.removeEventListener('click', t_menusub__closeFullscreenSubmenu);
			document.addEventListener('click', t_menusub__closeFullscreenSubmenu);
		} else {
			t_menusub__setUpMenuDesktop(submenuWrapper, submenu, hookLinks);
		}
		t_menusub__hightlight();
		t_menusub__checkAnchorLinks(recid);

		window.addEventListener(closeEvent, function () {
			if (submenu) t_menusub__hideSubmenu(submenu);
		});
	});
	// TODO этот код используется для тестирования нового отображения подменю.
	//  После правок в шаблон, необходимо изменить инициализацию на соответствие с ключом.
	if (window.t_menusub__isMobile || 'ontouchend' in document) {
		t_menusub__createFullscreenSubmenu(submenuWrapperList);
	}
}

function t_menusub__closeFullscreenSubmenu(e) {
	var submenu = e.target.closest('.t-menusub__menu--fullscreen');
	if (!submenu) return;
	var navArrow = e.target.closest('.t-menusub__menu--fullscreen__nav-arrow');
	var navLink = e.target.closest('.t-menusub__link-item');
	if (navArrow || navLink) {
		submenu.style.transform = '';
		document.body.classList.remove('t-body_scroll-locked');
		document.documentElement.classList.remove('t-body_scroll-locked');
		setTimeout(function () {
			t_menusub__hideSubmenu(submenu);
			if (navArrow) {
				var submenuPos = submenu.getAttribute('data-cachedPos');
				if (submenuPos) window.scrollTo(0, parseInt(submenuPos, 10));
			}
		}, 300);
	}
}

/**
 * depending on device type, should append to submenu listeners and settings to show/hide them
 * for hooklink and submenu append hover listeners, which wait 300ms before closing submenu
 *
 * @param {HTMLElement} submenuWrapper
 * @param {HTMLElement} submenu
 * @param {NodeList} hookLinks
 */
function t_menusub__setUpMenuDesktop(submenuWrapper, submenu, hookLinks) {
	var marginValue = submenuWrapper.getAttribute('data-submenu-margin');
	var timer;
	Array.prototype.forEach.call(hookLinks, function (hookLink) {
		hookLink.addEventListener('mouseover', function () {
			t_menusub__showSubmenuOnHover(hookLink, timer, submenu, marginValue);
		});
		hookLink.addEventListener('mouseout', function () {
			timer = setTimeout(function () {
				t_menusub__hideSubmenu(submenu);
			}, 300);
		});
		var clickEvents = ['click', 'auxclick'];
		clickEvents.forEach(function (event) {
			hookLink.addEventListener(event, function (e) {
				e.preventDefault();
			});
		});
	});
	submenu.addEventListener('mouseover', function () {
		t_menusub__showSubmenuOnHover(submenu, timer, submenu, marginValue);
	});
	submenu.addEventListener('mouseout', function () {
		timer = setTimeout(function () {
			t_menusub__hideSubmenu(submenu);
		}, 300);
	});
}

/**
 * depending on device type, should append to submenu listeners and settings to show/hide them
 *
 * @param {HTMLElement} submenuWrapper
 * @param {HTMLElement} submenu
 * @param {NodeList} hookLinks
 * @param {string} recid
 */
function t_menusub__setUpMenuMobile(submenuWrapper, submenu, hookLinks, recid) {
	Array.prototype.forEach.call(hookLinks, function (hookLink) {
		hookLink.addEventListener('click', function (e) {
			e.preventDefault();
			if (window.innerWidth > 980 && submenu) {
				t_menusub__hideSubmenu(submenu);
			}
			if (submenu.classList.contains('t-menusub__menu_show')) {
				t_menusub__hideSubmenu(submenu);
			} else {
				var marginValue = submenuWrapper.getAttribute('data-submenu-margin');
				t_menusub__showSubmenu(hookLink, submenu, marginValue);
				t_menusub__showME401Submenu(hookLink);
			}
		});
	});
	document.addEventListener('click', function (e) {
		var isInsideSubmenu = e.target.closest('.t-menusub__menu');
		var isAnchor = e.target.closest('.t-menusub__target-link');
		var isME601 = e.target.closest('.t794__tm-link, .t966__tm-link');

		if (isME601) return;

		// is anchor link is not active, hide previous active menu
		if (
			isAnchor &&
			isAnchor.getAttribute('data-tooltip-menu-id') !== recid &&
			submenu.classList.contains('t-menusub__menu_show')
		) {
			t_menusub__hideSubmenu(submenu);
		}

		// close if click area is not inside anchor or menu
		if (!isInsideSubmenu && !isAnchor && submenu.classList.contains('t-menusub__menu_show')) {
			t_menusub__hideSubmenu(submenu);
		}
	});
}

/**
 * hover anchor links and submenu, only for desktop
 *
 * @param {HTMLElement} el - current element
 * @param {number} timer - param of setTimeout
 * @param {HTMLElement} submenu  - second level menu block (.t-menusub)
 * @param {string} vIndent - margin value in data-attr
 * @returns {void}
 */
function t_menusub__showSubmenuOnHover(el, timer, submenu, vIndent) {
	// if submenu is hovered while disappearing
	if (el.classList.contains('t-menusub__menu') && !el.classList.contains('t-menusub__menu_show')) return;
	clearTimeout(timer);
	// if link is already hoverd and now hover is on submenu element
	if (el.classList.contains('t-menusub__menu') && el.classList.contains('t-menusub__menu_show')) return;
	t_menusub__showSubmenu(el, submenu, vIndent);
}

/**
 * @param {HTMLElement} curAnchor - current anchor
 * @param {HTMLElement} submenu  - second level menu block (.t-menusub)
 * @param {string} vIndent - margin value in data-attr
 */
function t_menusub__showSubmenu(curAnchor, submenu, vIndent) {
	var anchorHeight = curAnchor.offsetHeight;
	var anchorWidth = curAnchor.offsetWidth;
	var anchorMarginLeft = curAnchor ? parseInt(curAnchor.style.marginLeft) || 0 : 0;
	var curAnchorMarginTop = curAnchor ? window.getComputedStyle(curAnchor).getPropertyValue('margin-top') : '0';
	var winHeight = window.innerHeight;
	var winWidth = window.innerWidth;
	var scrollTop = window.pageYOffset;
	var indentTop = vIndent ? parseInt(vIndent, 10) + 10 : 0;
	var positionY = curAnchor.offsetTop - parseInt(curAnchorMarginTop, 10) + anchorHeight + indentTop;
	var positionX = t_menusub__getLeftRelativePos(curAnchor);

	submenu.style.display = 'block';

	var submenuHeight = submenu.offsetHeight;
	var submenuWidth = submenu.offsetWidth;

	// if positionY and submenu height doesn't fit in viewport, positionY will change and set submenu top view
	if (positionY + submenuHeight > scrollTop + winHeight) {
		// update positionY for top view
		var correctedPositionY = positionY - submenuHeight - anchorHeight - indentTop * 2;
		positionY = Math.max(correctedPositionY, scrollTop);
		submenu.classList.remove('t-menusub__menu_bottom');
		submenu.classList.add('t-menusub__menu_top');
	} else {
		submenu.classList.remove('t-menusub__menu_top');
		submenu.classList.add('t-menusub__menu_bottom');
	}
	// for mobile and tablet devices positionY equals 0, because submenu append with relative position, not absolute
	if (window.innerWidth <= 980) positionY = 0;

	var absoluteHookPos = curAnchor.getBoundingClientRect().left;
	var absoluteSubmenuPos = 0;
	var customArrowPosLeft = 0;
	var paddingAxisX = 10;
	var halfArrowWidth = 10;
	var halfAnchorWidth = anchorWidth / 2;

	var recID = curAnchor.closest('.r') ? curAnchor.closest('.r').id : '';
	recID = recID.replace('rec', '');
	var menu = document.getElementById('nav' + recID);
	var menuAbsoluteLeftPos = menu ? menu.getBoundingClientRect().left : 0;

	if (positionX + submenuWidth / 2 < winWidth) {
		// show in the center of anchor
		positionX = positionX + (anchorWidth - submenuWidth) / 2 + anchorMarginLeft;
		// show near left window submenu and add styles for floating arrow
		if (positionX < 0) {
			positionX = paddingAxisX;
			// update absolute pos value
			absoluteSubmenuPos = positionX;
			// update hook absolute position, if menu has right direction (as ME403)
			absoluteHookPos -= menuAbsoluteLeftPos;
			// set absolute hook position equals 0, if menu hasn't full window width setting
			var notFullWidthClassList = [
				'.t446__c12collumns',
				'.t229__c12collumns',
				'.t456__c12collumns',
				'.t228__c12collumns',
				'.t461__c12collumns',
				'.t967__c12collumns',
				'.t815__c12collumns',
				'.t821__c12collumns',
				'.t454__c12collumns',
			];
			var isMenuWithTwelveColWidth = notFullWidthClassList.some(function (className) {
				return menu.querySelector(className);
			});
			if (isMenuWithTwelveColWidth) absoluteHookPos = 0;
			var submenuPos = isMenuWithTwelveColWidth ? absoluteSubmenuPos : -absoluteSubmenuPos;
			customArrowPosLeft = absoluteHookPos + halfAnchorWidth - halfArrowWidth + submenuPos;
			t_menusub__createArrowCustomPos(submenu, customArrowPosLeft);
		} else {
			submenu.classList.remove('t-menusub__menu-custompos');
		}
	} else {
		var rightPosition = winWidth - submenuWidth - paddingAxisX;
		customArrowPosLeft = absoluteHookPos + halfAnchorWidth - halfArrowWidth - rightPosition;
		t_menusub__createArrowCustomPos(submenu, customArrowPosLeft);
		positionX = rightPosition;
	}

	submenu.style.right = '';
	submenu.style.left = positionX + 'px';
	submenu.style.top = positionY + 'px';

	//trigger offsetHeight to repaint submenu
	submenu.offsetHeight;

	submenu.classList.add('t-menusub__menu_show');
	curAnchor.classList.add('t-menusub__target-link_active');

	// if submenu goes beyond viewport, add styles for floating arrow, and set right position equals 0
	if (submenu.getBoundingClientRect().right > window.innerWidth) {
		submenu.style.left = '';
		submenu.style.right = '0';
		var isME403 = menu.classList.contains('t450');
		// update absolute pos value
		absoluteSubmenuPos = isME403 ? 0 : submenu.getBoundingClientRect().left;
		customArrowPosLeft = absoluteHookPos + halfAnchorWidth - halfArrowWidth - absoluteSubmenuPos;
		t_menusub__createArrowCustomPos(submenu, customArrowPosLeft);
	}

	// TODO этот код используется для тестирования нового отображения подменю.
	//  После правок в шаблон, необходимо изменить инициализацию на соответствие с ключом.
	if (window.t_menusub__isMobile || 'ontouchend' in document) {
		submenu.style.transform = 'translateX(0)';
		submenu.setAttribute('data-cachedPos', window.pageYOffset.toString());
		var isInsideSideMenu = submenu.closest('.t451, .t450');
		if (!document.body.classList.contains('t-body_scroll-locked') && !isInsideSideMenu) {
			setTimeout(function () {
				document.body.classList.add('t-body_scroll-locked');
				document.documentElement.classList.add('t-body_scroll-locked');
			}, 300);
		}
	}
}

function t_menusub__createFullscreenSubmenu(submenuWrapperList) {
	Array.prototype.forEach.call(submenuWrapperList, function (submenuWrap) {
		var submenu = submenuWrap.querySelector('.t-menusub__menu');
		if (!submenu || submenu.querySelector('.t-menusub__menu--fullscreen__nav')) return;
		var hookLink = submenuWrap.previousElementSibling;
		var menu = submenu.closest('[data-menu], .t450, .t451');
		var mainColor = window.getComputedStyle(hookLink).color;
		var borderColor = mainColor;
		if (mainColor.indexOf('rgb') === 0) {
			borderColor = mainColor.replace('rgb(', '').replace(')', '');
			borderColor += ', 0.25';
			borderColor = 'rgba(' + borderColor + ')';
		}
		var bgColor = menu ? window.getComputedStyle(menu).backgroundColor : '#000000';
		submenu.classList.add('t-menusub__menu--fullscreen');
		submenu.style.backgroundColor = bgColor;
		submenu.style.height = document.documentElement.clientHeight + 'px';

		var submenuNav = document.createElement('div');
		submenuNav.classList.add('t-menusub__menu--fullscreen__nav');
		if (mainColor.indexOf('rgb') === 0) {
			borderColor = mainColor.replace('rgb(', '').replace(')', '');
			borderColor += ', 0.6';
			borderColor = 'rgba(' + borderColor + ')';
		}
		submenuNav.style.borderBottom = '2px solid ' + borderColor;
		var title = document.createElement('p');
		title.classList.add('t-menusub__menu--fullscreen__nav-title');
		title.textContent = hookLink.textContent;
		title.style.color = mainColor;
		title.style.fontFamily = window.getComputedStyle(hookLink).fontFamily;
		title.style.fontWeight = window.getComputedStyle(hookLink).fontWeight;
		title.style.fontSize = window.getComputedStyle(hookLink).fontSize;
		var backArrow = document.createElement('div');
		backArrow.classList.add('t-menusub__menu--fullscreen__nav-arrow');
		backArrow.innerHTML =
			'<svg class="tmain-submenu__close-icon" width="26px" height="26px"' +
			' viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg">\n' +
			'        <path d="M10.4142136,5 L11.8284271,6.41421356 L5.829,12.414 ' +
			'L23.4142136,12.4142136 L23.4142136,14.4142136 L5.829,14.414 L11.8284271,20.4142136 ' +
			'L10.4142136,21.8284271 L2,13.4142136 L10.4142136,5 Z" fill="' +
			mainColor +
			'"></path>\n' +
			'      </svg>';
		submenuNav.appendChild(backArrow);
		submenuNav.appendChild(title);
		submenu.insertAdjacentElement('afterbegin', submenuNav);
	});
}

function t_menusub__createArrowCustomPos(submenu, position) {
	submenu.classList.add('t-menusub__menu-custompos');
	submenu.style.setProperty('--custom-pos', position + 'px');
}

/**
 * getBoundingClientRect().left may be incorrect working in IE; this function need for prevent it
 *
 * @param {HTMLElement} el - current Element
 * @returns {number} - number of relative left position
 */
function t_menusub__getLeftRelativePos(el) {
	var offsetLeft;
	var parentOffsetLeft = 0;

	// position:fixed elements are offset from the viewport, which itself always has zero offset
	if (window.getComputedStyle(el).getPropertyValue('position') === 'fixed') {
		offsetLeft = el.getBoundingClientRect().left;
	} else {
		offsetLeft = el.getClientRects().length ? el.getBoundingClientRect().left : 0;
		var offsetParent = el.offsetParent;
		while (
			offsetParent &&
			offsetParent.nodeType === 1 &&
			window.getComputedStyle(offsetParent).getPropertyValue('position') === 'static'
		) {
			offsetParent = offsetParent.offsetParent;
		}
		if (offsetParent && offsetParent !== el && offsetParent.nodeType === 1) {
			parentOffsetLeft = offsetParent.getClientRects().length ? offsetParent.getBoundingClientRect().left : 0;
		}
	}
	return offsetLeft - parentOffsetLeft;
}

/**
 * @param {HTMLElement} submenu - second level menu block (.t-menusub)
 * @returns {false} - if wrapME401 is cannot find from submenu
 */
function t_menusub__hideSubmenu(submenu) {
	var activeLink = document.querySelector('.t-menusub__target-link_active');
	if (activeLink) activeLink.classList.remove('t-menusub__target-link_active');

	submenu.style.display = '';
	submenu.style.left = '';
	submenu.style.top = '';
	submenu.classList.remove('t-menusub__menu_show');

	t_menusub__hideME401Submenu(submenu);
}

/**
 * append arrow to hook link, if submenu has necessary data-attribute
 *
 * @param {HTMLElement} submenu
 * @param {NodeList} hookLinks
 */
function t_menusub__appendArrow(submenu, hookLinks) {
	var isHasArrow = submenu.getAttribute('data-add-submenu-arrow');
	if (!isHasArrow) return;
	var arrow = document.createElement('div');
	arrow.classList.add('t-menusub__arrow');
	Array.prototype.forEach.call(hookLinks, function (hookLink) {
		hookLink.insertAdjacentElement('beforeend', arrow);
	});
}

/**
 * highlight active submenu links
 */
function t_menusub__hightlight() {
	var url = window.location.href;
	var pathname = window.location.pathname;

	if (pathname.charAt(0) === '/') pathname = pathname.slice(1);
	if (pathname === '') pathname = '/';

	var shouldBeActiveElements = document.querySelectorAll(
		'.t-menusub__list-item a[href="' +
			url +
			'"], .t-menusub__list-item a[href="' +
			url +
			'/"], .t-menusub__list-item a[href="' +
			pathname +
			'"], .t-menusub__list-item a[href="/' +
			pathname +
			'"], .t-menusub__list-item a[href="' +
			pathname +
			'/"], .t-menusub__list-item a[href="/' +
			pathname +
			'/"]'
	);

	Array.prototype.forEach.call(shouldBeActiveElements, function (element) {
		element.classList.add('t-active');
	});
}

/**
 * special script for ME401 after showing submenu
 *
 * @param {HTMLElement} hookLink
 */
function t_menusub__showME401Submenu(hookLink) {
	var wrapME401 = hookLink.closest('.t280');
	var wrapME401Wrapper = wrapME401 ? wrapME401.querySelector('.t280__menu__wrapper') : null;
	if (!wrapME401Wrapper) return;
	var isMobileHeight = t_menusub__isMobileME401(wrapME401);
	var isStaticME401 = wrapME401Wrapper.getAttribute('data-submenu-static');
	if (wrapME401Wrapper.classList.contains('t280__menu_static')) {
		wrapME401Wrapper.setAttribute('data-submenu-static', 'n');
	}
	if (isStaticME401 === 'n' && isMobileHeight && !wrapME401Wrapper.classList.contains('t280__menu_static')) {
		var wrapME401Menu = wrapME401.querySelector('.t280__menu');
		var wrapME401Bottom = wrapME401.querySelector('.t280__bottom');

		if (wrapME401Menu) wrapME401Menu.style.transition = 'none';
		if (wrapME401Bottom) wrapME401Bottom.style.transition = 'none';
		if (wrapME401Wrapper) wrapME401Wrapper.classList.add('t280__menu_static');
	}
}

/**
 * special script for ME401 after hidding submenu
 *
 * @param {HTMLElement} submenu
 */
function t_menusub__hideME401Submenu(submenu) {
	var wrapME401 = submenu.closest('.t280');
	if (!wrapME401) return;
	var isMobileHeight = t_menusub__isMobileME401(wrapME401);
	var wrapME401Wrapper = wrapME401.querySelector('.t280__menu__wrapper');
	var isStaticME401 = wrapME401Wrapper ? wrapME401Wrapper.getAttribute('data-submenu-static') : '';
	var wrapME401ShowMenus = wrapME401.querySelectorAll('.t280__menu .t-menusub__menu_show');

	if (
		isStaticME401 === 'n' &&
		window.t_menusub__isMobile &&
		isMobileHeight &&
		!wrapME401ShowMenus.length &&
		wrapME401Wrapper.classList.contains('t280__menu_static')
	) {
		wrapME401Wrapper.classList.remove('t280__menu_static');
	}
}

/**
 * check if submenu in ME401 is mobile
 *
 * @param {HTMLElement} wrapME401 - ME401 block
 * @returns {boolean} true | false
 */
function t_menusub__isMobileME401(wrapME401) {
	var wrapME401Menu = wrapME401.querySelector('.t280__menu');
	var wrapME401Bottom = wrapME401.querySelector('.t280__bottom');
	var wrapME401Container = wrapME401.querySelector('.t280__container');
	var menuHeight = wrapME401Menu ? wrapME401Menu.offsetHeight : 0;
	var menuBottomHeight = wrapME401Bottom ? wrapME401Bottom.offsetHeight : 0;
	var menuHeaderHeight = wrapME401Container ? wrapME401Container.offsetHeight : 0;
	var wrapperHeight = window.innerHeight - menuBottomHeight - menuHeaderHeight - 40;
	return menuHeight > wrapperHeight;
}

/**
 * mark active link by scroll. This operation contains with few functions:
 * 1. t_menusub__checkAnchorLinks() find all links, which can be active, and send it to t_menusub__catchScroll()
 * 2. in t_menusub__catchScroll() by scroll check current viewport position and connected with link section,
 * and if this section placed inside viewport, for link append active class
 * 3. to get connected section with link, use function t_menusub__getSectionByHref()
 * 4. to highlight link use function t_menusub__highlightNavLinks()
 * 5. if window width/height will be changed, need update sections position, that doing t_menusub__updateSectionsOffsets()
 *
 *
 * @param {string} recid - record id
 */
function t_menusub__checkAnchorLinks(recid) {
	var rec = document.getElementById('rec' + recid);
	if (!rec || window.innerWidth < 980) return;
	var navLinks = rec.querySelectorAll('a[href*="#"].t-menusub__link-item');
	navLinks = Array.prototype.filter.call(navLinks, function (navLink) {
		return !navLink.classList.contains('tooltipstered');
	});
	if (navLinks.length) t_menusub__catchScroll(navLinks);
}

/**
 * @param {HTMLElement[] | []} navLinks - list of nav links
 */
function t_menusub__catchScroll(navLinks) {
	// to prevent errors by users scripts, which use jQuery, transform again navLinks to Array
	navLinks = Array.prototype.slice.call(navLinks);
	var clickedSectionID = null;
	var sections = [];
	var sectionToNavigationLinkID = {};
	navLinks = navLinks.reverse();

	// find connected with link section
	navLinks.forEach(function (link) {
		var currentSection = t_menusub__getSectionByHref(link);
		if (currentSection && currentSection.id) {
			sections.push(currentSection);
			sectionToNavigationLinkID[currentSection.id] = link;
		}
	});

	// update offsets of finded sections
	t_menusub__updateSectionsOffsets(sections);

	// sort section list from smaller to the largest top offset, it will be needed in t770_highlightNavLinks()
	sections.sort(function (a, b) {
		var firstTopOffset = parseInt(a.getAttribute('data-offset-top'), 10) || 0;
		var secondTopOffset = parseInt(b.getAttribute('data-offset-top'), 10) || 0;
		return secondTopOffset - firstTopOffset;
	});

	// update offsets by resize
	window.addEventListener(
		'resize',
		t_throttle(function () {
			t_menusub__updateSectionsOffsets(sections);
		}, 200)
	);

	t_menusub__highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID);

	// update offsets and highlight link after loading page and 1s
	setTimeout(function () {
		t_menusub__updateSectionsOffsets(sections);
		t_menusub__highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID);
	}, 1000);

	// add listeners by click for navlinks
	navLinks.forEach(function (navLink, i) {
		navLink.addEventListener('click', function () {
			var clickedSection = t_menusub__getSectionByHref(navLink);
			if (!navLink.classList.contains('tooltipstered') && clickedSection && clickedSection.id) {
				navLinks.forEach(function (link, index) {
					index === i ? link.classList.add('t-active') : link.classList.remove('t-active');
				});
				clickedSectionID = clickedSection.id;
			}
		});
	});

	window.addEventListener(
		'scroll',
		t_throttle(function () {
			clickedSectionID = t_menusub__highlightNavLinks(
				navLinks,
				sections,
				sectionToNavigationLinkID,
				clickedSectionID
			);
		}, 100)
	);
}

/**
 * @param {HTMLElement} curlink - e.target on click submenu link
 * @returns {HTMLElement | undefined | null} - undefined / null if any of conditions is not met
 */
function t_menusub__getSectionByHref(curlink) {
	if (!curlink) return;
	var href = curlink.getAttribute('href');
	var curLinkValue = href ? href.replace(/\s+/g, '') : '';
	if (curLinkValue.indexOf('/') === 0) curLinkValue = curLinkValue.slice(1);

	if (href && curlink.matches('[href*="#rec"]')) {
		curLinkValue = curLinkValue.replace(/.*#/, '');
		return document.getElementById(curLinkValue);
	} else {
		var selector = href ? href.trim() : '';
		var slashIndex = selector.indexOf('#') !== -1 ? selector.indexOf('#') : false;
		if (typeof slashIndex === 'number') {
			selector = selector.slice(slashIndex + 1);
		} else {
			slashIndex = selector.indexOf('/') !== -1 ? selector.indexOf('/') : false;
			if (typeof slashIndex === 'number') selector = selector.slice(slashIndex + 1);
		}
		var fullSelector = '.r[data-record-type="215"] a[name="' + selector + '"]';
		return document.querySelector(fullSelector) ? document.querySelector(fullSelector).closest('.r') : null;
	}
}

/**
 *
 * @param {NodeList | array} navLinks - reversed NodeList of navLinks (.t-menusub__link-item)
 * @param {NodeList | array} sections - anchor or block in DOM which can be use (.r id="#anchor")
 * @param {array} sectionToNavigationLinkID - navLinks from reversed NodeList if sections exist
 * @param {string | null} clickedSectionID - current section ID of clicked navLink
 * @returns {null | false | string} -
 */
function t_menusub__highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID) {
	var scrollPosition = window.pageYOffset;
	var scrollHeight = Math.max(
		document.body.scrollHeight,
		document.documentElement.scrollHeight,
		document.body.offsetHeight,
		document.documentElement.offsetHeight,
		document.body.clientHeight,
		document.documentElement.clientHeight
	);
	var returnValue = clickedSectionID;
	var lastSection = sections.length ? sections[sections.length - 1] : null;
	var lastSectionTopPos = lastSection ? lastSection.getAttribute('data-offset-top') : '0';
	lastSectionTopPos = parseInt(lastSectionTopPos, 10) || 0;
	/*if first section is not at the page top (under first blocks)*/
	if (sections.length && clickedSectionID === null && lastSectionTopPos > scrollPosition + 300) {
		navLinks.forEach(function (link) {
			link.classList.remove('t-active');
		});
		return null;
	}

	for (var i = 0; i < sections.length; i++) {
		var sectionTopPos = sections[i].getAttribute('data-offset-top');
		var navLink = sections[i].id ? sectionToNavigationLinkID[sections[i].id] : null;
		if (scrollPosition + 300 >= sectionTopPos || (i === 0 && scrollPosition >= scrollHeight - window.innerHeight)) {
			if (clickedSectionID === null && navLink && !navLink.classList.contains('t-active')) {
				navLinks.forEach(function (link) {
					link.classList.remove('t-active');
				});
				if (navLink) navLink.classList.add('t-active');
				returnValue = null;
			} else if (clickedSectionID !== null && sections[i].id && clickedSectionID === sections[i].id) {
				returnValue = null;
			}
			break;
		}
	}
	return returnValue;
}

/**
 * @param {NodeList | array} sections - list of sections
 */
function t_menusub__updateSectionsOffsets(sections) {
	sections.forEach(function (section) {
		var sectionTopPos = section.getBoundingClientRect().top + window.pageYOffset;
		section.setAttribute('data-offset-top', sectionTopPos);
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