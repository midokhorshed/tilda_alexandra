function t_submenublocks__highlightActiveLinks(selector) {
	var url = window.location.href;
	var path = window.location.pathname;
	var hash = window.location.hash;

	if (path[path.length - 1] === '/') path = path.slice(0, -1);
	if (path[0] === '/') path = path.slice(1);
	if (path === '') path = '/';

	var links = document.querySelectorAll(selector);
	links = Array.prototype.filter.call(links, function (link) {
		var href = link.getAttribute('href');
		if (href[0] === '/' && href.length > 1) href = href.slice(1);
		if (href[href.length - 1] === '/' && href.length > 1) href = href.slice(0, -1);
		return href && (href === url || href === hash || href === path);
	});

	links.forEach(function (link) {
		link.classList.add('t-active');
	});
}

function t_submenublocks__addEventsDesktop(submenu, hooksAndSubmenu, verticalIndent, selector) {
	var timer;
	hooksAndSubmenu.forEach(function (element) {
		if (!window.isMobile) {
			element.addEventListener('mouseover', function () {
				var isSubmenu = element.classList.contains(selector.slice(1) + '__tooltip-menu');
				var isSubmenuShowed = element.classList.contains(selector.slice(1) + '__tooltip-menu_show');
				// if submenu is hovered while disappearing
				if (isSubmenu && !isSubmenuShowed) return;
				if (timer) clearTimeout(timer);
				// if link is already hovered and now hover is on submenu element
				if (isSubmenu && isSubmenuShowed) return;

				t_submenublocks__showSubmenu(element, submenu, verticalIndent, selector);
			});
			element.addEventListener('mouseout', function () {
				timer = setTimeout(function () {
					t_submenublocks__hideSubmenu(submenu, selector);
				}, 300);
			});
		}
		// horizontal tablets and no-adaptive mode on mobile
		if ((window.isMobile || 'ontouchend' in document) && window.innerWidth > 980) {
			element.addEventListener('click', function (e) {
				if (
					e.target &&
					(e.target.classList.contains('t978__menu-link') || e.target.closest('.t978__menu-link'))
				)
					return;
				var isSubmenuShowed = submenu.classList.contains(selector.slice(1) + '__tooltip-menu_show');
				if (!isSubmenuShowed) {
					t_submenublocks__showSubmenu(element, submenu, verticalIndent, selector);
				} else {
					t_submenublocks__hideSubmenu(submenu, selector);
				}
			});
			window.addEventListener(
				'orientationchange',
				t_throttle(function () {
					t_submenublocks__hideSubmenu(submenu, selector);
				}, 300)
			);
		}
	});
}

function t_submenublocks__addEventsMobile(submenu, hookLinks, verticalIndent, selector) {
	hookLinks.forEach(function (hookLink) {
		hookLink.addEventListener('click', function (e) {
			e.preventDefault();
			if (submenu.closest('.t-submenu--fullscreen')) {
				t_submenublocks__openFullScreenSubmenu(hookLink, submenu);
				return;
			}
			var isSubmenuShowed = submenu.classList.contains(selector.slice(1) + '__tooltip-menu_show');
			if (hookLink.classList.contains('t-menu__link-item')) {
				var insertedSubmenu = hookLink.nextElementSibling;
				if (
					isSubmenuShowed ||
					(insertedSubmenu && insertedSubmenu.classList.contains(selector.slice(1) + '__tooltip-menu_mobile'))
				) {
					t_submenublocks__hideSubmenu(insertedSubmenu, selector, hookLink);
				} else {
					var clonedSubmenu = submenu.cloneNode(true);
					clonedSubmenu.classList.add(selector.slice(1) + '__tooltip-menu_mobile');
					t_submenublocks__showSubmenu(hookLink, clonedSubmenu, verticalIndent, selector);
					var submenuLinks = clonedSubmenu.querySelectorAll('a[href*="#"]:not(.t978__menu-link_hook)');
					Array.prototype.forEach.call(submenuLinks, function (link) {
						link.addEventListener('click', function () {
							t_submenublocks__hideSubmenu(clonedSubmenu, selector);
							var submenuAnchorEvent = document.createEvent('Event');
							submenuAnchorEvent.initEvent('clickedAnchorInTooltipMenu', true, true);
							link.dispatchEvent(submenuAnchorEvent);
						});
					});
				}
			} else {
				submenu.getAttribute('data-mobiletooltip') === 'yes' && isSubmenuShowed
					? t_submenublocks__hideSubmenu(submenu, selector)
					: t_submenublocks__showSubmenu(hookLink, submenu, verticalIndent, selector);
				var submenuLinks = submenu.querySelectorAll('a[href*="#"]:not(.t978__menu-link_hook)');
				Array.prototype.forEach.call(submenuLinks, function (link) {
					link.addEventListener('click', function () {
						t_submenublocks__hideSubmenu(submenu, selector);
						var submenuAnchorEvent = document.createEvent('Event');
						submenuAnchorEvent.initEvent('clickedAnchorInTooltipMenu', true, true);
						link.dispatchEvent(submenuAnchorEvent);
					});
				});
			}
		});
		window.addEventListener(
			'resize',
			t_throttle(function () {
				var submenuToHide = document.querySelectorAll(selector.slice(1) + '__tooltip-menu_mobile');
				Array.prototype.forEach.call(submenuToHide, function (menu) {
					t_submenublocks__hideSubmenu(menu, selector);
				});
			}, 300)
		);
	});
	document.addEventListener('click', function (e) {
		var currentAnchor = e.target.closest(selector + '__tm-link');
		var submenuToHide = document.querySelectorAll(selector + '__tooltip-menu');
		Array.prototype.forEach.call(submenuToHide, function (menu) {
			var isSubmenuShowed = menu.classList.contains(selector.slice(1) + '__tooltip-menu_show');
			var insideMenu = e.target.closest(selector + '__tooltip-menu');
			if (!insideMenu && !currentAnchor && menu && isSubmenuShowed) {
				t_submenublocks__hideSubmenu(menu, selector);
			}
		});
	});
}

function t_submenublocks__showSubmenu(anchor, submenu, verticalIndent, selector) {
	if (!submenu) return;
	var isInsideZero = anchor.closest('.tn-atom');
	// prettier-ignore
	var isMobileView = window.innerWidth < 980 && (window.isMobile || ('ontouchend' in document && /Macintosh/.test(navigator.userAgent)));
	// insert cloned menu after anchor link on mobile
	if (isMobileView && anchor) {
		if (anchor.classList.contains('t-menu__link-item')) {
			anchor.insertAdjacentElement('afterend', submenu);
			submenu.style.position = 'static';
			submenu.style.opacity = '1';

			t_submenublocks__slideDown(submenu, 300, function () {
				var overflowEvent = document.createEvent('Event');
				overflowEvent.initEvent('menuOverflow', true, true);
				submenu.dispatchEvent(overflowEvent);

				var showEvent = document.createEvent('Event');
				showEvent.initEvent('submenuShow', true, true);
				submenu.dispatchEvent(showEvent);
			});

			submenu.classList.add(selector.slice(1) + '__tooltip-menu_show');
			if (anchor) anchor.classList.add(selector.slice(1) + '__tm-link_active');
			if (window.lazy === 'y') t_lazyload_update();
			// TODO у ссылки в zero нет класса .t-menu__link-item
			if (isInsideZero) {
				submenu.style.position = 'absolute';
				submenu.style.width = 'calc(100vw - 20px)';
				submenu.style.right = '10px';
				submenu.style.left = '10px';
			}
			return;
		} else {
			submenu.setAttribute('data-mobiletooltip', 'yes');
		}
	}

	t_submenublocks__calcSubmenuX(anchor, submenu, selector);
	t_submenublocks__calcSubmenuY(anchor, submenu, verticalIndent, selector);

	submenu.style.display = submenu.style.display === 'none' ? '' : 'block';

	submenu.classList.add(selector.slice(1) + '__tooltip-menu_show');
	if (anchor) anchor.classList.add(selector.slice(1) + '__tm-link_active');

	var showEvent = document.createEvent('Event');
	showEvent.initEvent('submenuShow', true, true);
	submenu.dispatchEvent(showEvent);
	if (window.lazy === 'y') t_lazyload_update();
}

function t_submenublocks__calcSubmenuX(anchor, submenu, selector) {
	var winWidth = window.innerWidth;

	submenu.style.display = 'block';
	var submenuWidth = submenu.offsetWidth;
	submenu.style.display = '';

	var isME601B = selector === '.t978';

	if (isME601B) var ME601Bmenu = submenu.querySelector('.t978__menu');
	var minME601BmenuWidth = isME601B ? 200 : 0;

	var submenuWindowMargin = 10;
	if (Math.ceil(submenuWidth + submenuWindowMargin * 2) > winWidth) {
		submenuWidth = winWidth - submenuWindowMargin * 2;
		submenu.style.maxWidth = submenuWidth + 'px';
	}

	var anchorWidth = anchor.classList.contains('t-btn')
		? anchor.offsetWidth
		: t_submenublocks__getValueWithoutPadding(anchor, 'width');
	var anchorLeft = anchor.getBoundingClientRect().left + window.pageXOffset;
	var anchorCenter = anchorLeft + anchorWidth / 2;

	var submenuX = anchorCenter;
	var cornerLeft;
	var cornerSize = 10;

	var anchorArrowSize = anchor.querySelector(selector + '__arrow') ? 12 : 0;
	var submenuPos = 'left';

	// position menu in zero block
	var parentZeroMenu = anchor.closest('.t396__artboard');
	if (parentZeroMenu && parentZeroMenu.classList.contains('t396__artboard_scale') && window.tn_scale_factor) {
		var isFirefox = navigator.userAgent.search('Firefox') !== -1;
		var isOpera =
			(!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') !== -1;
		anchorLeft = isFirefox || isOpera ? anchorLeft : anchorLeft * window.tn_scale_factor;
		anchorWidth = anchorWidth * window.tn_scale_factor;
		anchorCenter = anchorLeft + anchorWidth / 2;
		submenuX = anchorCenter;
	}

	if (submenuX + submenuWidth / 2 < winWidth - minME601BmenuWidth) {
		// show in the center of anchor
		submenuX = submenuX - submenuWidth / 2;
		// show near left window border
		if (submenuX < 0) {
			submenuX = submenuWindowMargin;
		}
	} else {
		// show near right window border
		submenuX = submenuWindowMargin;
		submenuPos = 'right';
		if (isME601B && ME601Bmenu) ME601Bmenu.style.order = '1';
	}

	var submenuLeft = submenuPos === 'left' ? submenuX : winWidth - submenuX - submenuWidth;
	cornerLeft = anchorCenter - submenuLeft - cornerSize / 2;

	var submenuCenter = submenuX + submenuWidth / 2;

	if (submenuCenter !== anchorCenter) {
		if (submenuLeft < anchorLeft) {
			cornerLeft = winWidth - anchorCenter - submenuX + cornerSize / 2;
		} else {
			cornerLeft = anchorWidth / 2 - cornerSize / 2 - anchorArrowSize;
		}
	}

	submenu.style[submenuPos] = submenuX + 'px';
	var corner = submenu.querySelector(selector + '__tooltip-menu-corner');
	var cornerBorder = submenu.querySelector(selector + '__tooltip-menu-corner-border');

	if (corner) {
		corner.style.left = 'auto';
		corner.style.right = 'auto';
		corner.style[submenuPos] = cornerLeft + 'px';
	}

	if (cornerBorder) {
		cornerBorder.style.left = 'auto';
		cornerBorder.style.right = 'auto';
		cornerBorder.style[submenuPos] = cornerLeft + 'px';
	}
}

function t_submenublocks__calcSubmenuY(anchor, submenu, verticalIndent, selector) {
	submenu.style.display = 'block';
	var submenuHeight = submenu.offsetHeight;
	submenu.style.display = '';
	var submenuY;

	var scrollTop = window.pageYOffset;
	var anchorHeight = t_submenublocks__getValueWithoutPadding(anchor, 'height');
	var anchorTop = anchor ? anchor.getBoundingClientRect().top : 0;

	var cornerSize = 10;
	var verticalIndentDefault = 25;

	verticalIndent = verticalIndent ? parseInt(verticalIndent, 10) + cornerSize : verticalIndentDefault;

	var parentZeroMenuArtboard = anchor.closest('.t396__artboard');
	var parentZeroMenuBlock = anchor.closest('.t396');
	var parentZeroMenuRec = anchor.closest('[data-record-type="396"]');

	if (
		(parentZeroMenuArtboard && window.getComputedStyle(parentZeroMenuArtboard).position === 'fixed') ||
		(parentZeroMenuBlock && window.getComputedStyle(parentZeroMenuBlock).position === 'fixed') ||
		(parentZeroMenuRec && window.getComputedStyle(parentZeroMenuRec).position === 'fixed')
	) {
		submenu.setAttribute('data-pos-fixed', 'yes');
	}

	if (
		parentZeroMenuArtboard &&
		parentZeroMenuArtboard.classList.contains('t396__artboard_scale') &&
		window.tn_scale_factor &&
		!window.isFirefox &&
		!window.isOpera
	) {
		anchorTop *= window.tn_scale_factor;
	}
	var menuFixed = submenu.getAttribute('data-pos-fixed');
	if (menuFixed === 'yes') {
		submenuY = anchorTop + anchorHeight + verticalIndent;
		submenu.style.position = 'fixed';
	} else {
		submenuY = anchorTop + scrollTop + anchorHeight + verticalIndent;
	}

	var corner = submenu.querySelector(selector + '__tooltip-menu-corner');
	var cornerBorder = submenu.querySelector(selector + '__tooltip-menu-corner-border');
	if (
		submenuY + submenuHeight > scrollTop + window.innerHeight &&
		submenuY >= submenuHeight &&
		submenuY - scrollTop > submenuHeight
	) {
		submenuY = Math.max(submenuY - submenuHeight - anchorHeight - verticalIndent * 2, scrollTop);
		if (corner) {
			corner.classList.remove(selector.slice(1) + '__tooltip-menu-corner_bottom');
			corner.classList.add(selector.slice(1) + '__tooltip-menu-corner_top');
		}

		if (cornerBorder) {
			cornerBorder.classList.remove(selector.slice(1) + '__tooltip-menu-corner-border_bottom');
			cornerBorder.classList.add(selector.slice(1) + '__tooltip-menu-corner-border_top');
		}
	} else {
		if (corner) {
			corner.classList.remove(selector.slice(1) + '__tooltip-menu-corner_top');
			corner.classList.add(selector.slice(1) + '__tooltip-menu-corner_bottom');
		}

		if (cornerBorder) {
			cornerBorder.classList.remove(selector.slice(1) + '__tooltip-menu-corner-border_top');
			cornerBorder.classList.add(selector.slice(1) + '__tooltip-menu-corner-border_bottom');
		}
	}
	submenu.style.top = submenuY + 'px';

	var submenuTopOffset = submenu.getBoundingClientRect().top;
	if (submenuTopOffset + submenuHeight > window.innerHeight) {
		var content = submenu.querySelector(selector + '__content');
		var contentPaddingBottom = content
			? content.style.paddingBottom || window.getComputedStyle(content).paddingBottom
			: '0';
		var contentPadding = parseInt(contentPaddingBottom, 10);
		var paddingWindow = 40;

		var height = window.innerHeight - submenuY - contentPadding - paddingWindow - cornerSize;

		if (content) content.style.overflowY = 'scroll';
		if (content) content.style.height = height + 'px';
	}
}

function t_submenublocks__hideSubmenu(submenu, selector) {
	if (!submenu || submenu.closest('.t-submenu--fullscreen')) return;
	var isME601B = selector === '.t978';

	if (submenu.getAttribute('data-mobiletooltip') === 'yes') submenu.setAttribute('data-mobiletooltip', '');

	if (submenu.classList.contains(selector.slice(1) + '__tooltip-menu_mobile')) {
		t_submenublocks__slideUp(submenu, 300, function () {
			t_submenublocks__removeEl(submenu);
			var overflowEvent = document.createEvent('Event');
			overflowEvent.initEvent('menuOverflow', true, true);
			submenu.dispatchEvent(overflowEvent);

			var hideEvent = document.createEvent('Event');
			hideEvent.initEvent('submenuHide', true, true);
			submenu.dispatchEvent(hideEvent);
		});
	} else {
		var content = submenu ? submenu.querySelector(selector.slice(1) + '__content') : null;

		submenu.style.display = '';
		submenu.style.left = '';
		submenu.style.right = '';
		submenu.style.top = '';
		submenu.style.width = '';

		if (content) {
			content.style.overflowY = '';
			content.style.height = '';
		}

		if (isME601B) {
			var menu = submenu.querySelector(selector + '__menu');
			var corner = submenu.querySelector(selector + '__tooltip-menu-corner');
			var cornerBorder = submenu.querySelector(selector + '__tooltip-menu-corner-border');
			if (menu) menu.style.order = '';
			if (corner) {
				corner.style.left = '';
				corner.style.right = '';
			}
			if (cornerBorder) {
				cornerBorder.style.left = '';
				cornerBorder.style.right = '';
			}
		}
		submenu.classList.remove(selector.slice(1) + '__tooltip-menu_show');
		var hideEvent = document.createEvent('Event');
		hideEvent.initEvent('submenuHide', true, true);
		submenu.dispatchEvent(hideEvent);
	}
	var activeLinks = document.querySelectorAll(selector + '__tm-link_active');
	Array.prototype.forEach.call(activeLinks, function (link) {
		link.classList.remove(selector.slice(1) + '__tm-link_active');
	});
}

function t_submenublocks__addArrow(recid, hookLinks, selector) {
	var rec = document.getElementById('rec' + recid);
	var submenuBlock = rec ? rec.querySelector(selector) : null;
	var isArrowAppend = submenuBlock.getAttribute('data-add-arrow');
	if (!isArrowAppend) return;

	hookLinks = Array.prototype.slice.call(hookLinks);
	hookLinks.forEach(function (hookLink) {
		var arrow = document.createElement('div');
		arrow.classList.add(selector.slice(1) + '__arrow');
		hookLink.appendChild(arrow);

		// border-color tn-atom перебивает border-color стрелочки
		var isInsideZero = hookLink.closest('.tn-atom');
		var hasCustomBorderColor = window.getComputedStyle(hookLink).borderColor !== 'rgba(0, 0, 0, 0)';
		if (isInsideZero && !hasCustomBorderColor) {
			hookLink.style.borderColor = 'initial';
			hookLink.style.border = 'none';
		}
	});
}

function t_submenublocks__slideUp(target, duration, callback) {
	if (!target) return;
	if (!duration) duration = 300;
	var step = (target.offsetHeight * 10) / duration;
	var difference = target.offsetHeight;
	target.style.overflow = 'hidden';
	target.setAttribute('data-slide', 'y');
	var timerID = setInterval(function () {
		difference -= step;
		target.style.height = difference + 'px';
		if (difference <= 0) {
			target.style.height = '';
			target.style.overflow = '';
			target.style.display = 'none';
			target.removeAttribute('data-slide');
			if (typeof callback === 'function') {
				callback();
			}
			clearInterval(timerID);
		}
	}, 10);
}

function t_submenublocks__slideDown(target, duration, callback) {
	if (!target) return;
	if (!duration) duration = 300;
	target.style.display = '';
	var newDisplayValue =
		window.getComputedStyle(target).display === 'none' ? 'block' : window.getComputedStyle(target).display;
	target.style.display = newDisplayValue;
	var cahsedHeight = target.offsetHeight;
	target.style.height = '0';
	target.style.overflow = 'hidden';
	target.setAttribute('data-slide', 'y');
	var step = (cahsedHeight * 10) / duration;
	var difference = 0;
	var timerID = setInterval(function () {
		target.style.height = difference + 'px';
		difference += step;
		if (difference >= cahsedHeight) {
			target.style.height = '';
			target.style.overflow = '';
			target.style.display = newDisplayValue;
			target.removeAttribute('data-slide');
			if (typeof callback === 'function') {
				callback();
			}
			clearInterval(timerID);
		}
	}, 10);
}

function t_submenublocks__removeEl(el) {
	if (el && el.parentElement) el.parentElement.removeChild(el);
}

function t_submenublocks__getValueWithoutPadding(el, value) {
	if (!el) return 0;
	var elWidth = el.offsetWidth || parseInt(window.getComputedStyle(el).width, 10);
	var elHeight = el.offsetHeight || parseInt(window.getComputedStyle(el).height, 10);
	switch (value) {
		case 'width':
			var paddingLeft = el.style.paddingLeft || parseInt(window.getComputedStyle(el).paddingLeft, 10);
			var paddingRight = el.style.paddingLeft || parseInt(window.getComputedStyle(el).paddingRight, 10);
			return elWidth - (paddingLeft + paddingRight);
		case 'height':
			var paddingTop = el.style.paddingTop || parseInt(window.getComputedStyle(el).paddingTop, 10);
			var paddingBottom = el.style.paddingBottom || parseInt(window.getComputedStyle(el).paddingBottom, 10);
			return elHeight - (paddingTop + paddingBottom);
	}
}

function t_submenublocks__setFullScreenMenu(submenu) {
	t_submenublocks__setFullScreenMenu_getStyles('fullscreensubmenu-styles');
	var hookLinkHref = submenu.getAttribute('data-tooltip-hook');
	var hookLinks = Array.prototype.slice.call(document.querySelectorAll('a[href*="' + hookLinkHref + '"]'));
	submenu = submenu.querySelector('div');
	submenu.classList.add('t-submenu--fullscreen');
	submenu.style.height = document.documentElement.clientHeight + 'px';
	var submenuItem = submenu.querySelector('[data-menu-item-number="1"], .t978__menu-link');
	var submenuTitle = submenuItem.querySelector('.t966__menu-item-title');
	var submenuDescr = submenuItem.querySelector('.t966__menu-item-desc');
	if (submenuTitle) {
		submenuItem = submenuTitle;
	} else if (submenuDescr) {
		submenuItem = submenuDescr;
	}
	var currentColor = submenuItem.style.color;
	var borderColor = getComputedStyle(submenu).borderColor;
	if (borderColor === 'rgba(0, 0, 0, 0)') borderColor = '';
	submenu.style.border = 'none';
	var mainColor = borderColor || currentColor || '#000000';

	var submenuNav = document.createElement('div');
	submenuNav.classList.add('t-submenu--fullscreen__nav');
	submenuNav.style.borderBottom = '2px solid ' + mainColor;

	// if every hooklinks placed inside left side menu,
	// set left side view for submenu
	hookLinks = hookLinks.filter(function (hookLink) {
		var rec = hookLink.closest('.r');
		return rec && getComputedStyle(rec).display !== 'none';
	});
	if (
		hookLinks.every(function (hookLink) {
			return hookLink.closest('.t450__left, .t451m__left');
		})
	) {
		submenu.classList.add('t-submenu--fullscreen-left');
	}

	var title = document.createElement('p');
	title.classList.add('t-submenu--fullscreen__nav-title');
	title.classList.add('t-name');
	title.style.color = currentColor || '#000000';
	title.style.fontSize = parseInt(getComputedStyle(submenuItem).fontSize, 10) * 1.2 + 'px';
	var backArrow = document.createElement('div');
	backArrow.classList.add('t-submenu--fullscreen__nav-arrow');
	backArrow.innerHTML =
		'<svg class="t_submenu__close-icon" width="26px" height="26px"' +
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

	backArrow.addEventListener('click', t_submenublocks__closeFullscreenSubmenu);
	var linkList = submenu.querySelectorAll(
		'.t794__typo, .t966__menu-link, .t978__innermenu-link, .t978__menu-link:not(.t978__menu-link_hook)'
	);
	Array.prototype.forEach.call(linkList, function (link) {
		link.addEventListener('click', t_submenublocks__closeFullscreenSubmenu);
	});

	window.addEventListener('orientationchange', function () {
		setTimeout(function () {
			Array.prototype.forEach.call(document.querySelectorAll('.t-submenu--fullscreen'), function (submenu) {
				submenu.style.height = document.documentElement.clientHeight + 'px';
			});
		}, 300);
	});

	// only for ME601b
	if (submenu.closest('.t978__tooltip-menu')) {
		// to set bg correcty
		if (submenu.querySelector('.t978__content')) {
			submenu.style.backgroundColor = getComputedStyle(submenu.querySelector('.t978__content')).backgroundColor;
		}
		// to open dropdown by click
		t_onFuncLoad('t978_addInnermenuEvents', function () {
			t978_addInnermenuEvents(submenu, 'on');
		});
	}
}

function t_submenublocks__setFullScreenMenu_getStyles(id) {
	if (document.getElementById(id)) return;
	var styles = document.createElement('link');
	styles.addEventListener('error', function () {
		t_onFuncLoad('t_fallback__reloadSRC', function () {
			t_fallback__reloadSRC(styles);
		});
	});
	styles.href = 'https://static.tildacdn.com/css/tilda-submenublocks-1.0.min.css';
	styles.id = id;
	styles.rel = 'stylesheet';
	document.head.insertAdjacentElement('beforeend', styles);
}

function t_submenublocks__openFullScreenSubmenu(anchor, submenu) {
	var submenuTitle = submenu.querySelector('.t-submenu--fullscreen__nav-title');
	if (submenuTitle) submenuTitle.textContent = anchor.textContent;
	t_submenublocks__updateBodyBg('open', submenu);
	submenu.style.transform = 'translateX(0)';
	submenu.setAttribute('data-cachedPos', window.pageYOffset.toString());
	if (!document.body.classList.contains('t-body_scroll-locked')) {
		setTimeout(function () {
			document.body.classList.add('t-body_scroll-locked');
			document.documentElement.classList.add('t-body_scroll-locked');
		}, 300);
	}
}

/**
 * set color inside top browser area with system data
 *
 * @param {string} action
 * @param {HTMLElement} submenu
 */
function t_submenublocks__updateBodyBg(action, submenu) {
	if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) return;
	if (action === 'close') {
		var cachedBG = document.body.getAttribute('data-cached-color');
		document.body.style.backgroundColor = cachedBG || '';
	} else {
		var bgColor = getComputedStyle(submenu).backgroundColor;
		if (bgColor) {
			var bodyBG = getComputedStyle(document.body).backgroundColor;
			if (bodyBG !== 'rgba(0, 0, 0, 0)') {
				document.body.setAttribute('data-cached-color', bodyBG);
			}
			document.body.style.backgroundColor = bgColor;
		}
	}
}

function t_submenublocks__closeFullscreenSubmenu(e) {
	var submenu = e.target.closest('.t-submenu--fullscreen');
	if (!submenu) return;
	var navArrow = e.target.closest('.t-submenu--fullscreen__nav-arrow');
	var navLink = e.target.closest('a[href*="#"]');
	if (navArrow || navLink) {
		t_submenublocks__updateBodyBg('close', submenu);
		submenu.style.transform = '';
		document.body.classList.remove('t-body_scroll-locked');
		document.documentElement.classList.remove('t-body_scroll-locked');
		if (navArrow) {
			var submenuPos = submenu.getAttribute('data-cachedPos');
			if (submenuPos) window.scrollTo(0, parseInt(submenuPos, 10));
		}
	}
}