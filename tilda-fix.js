function t446_init(recid) {
	var rec = document.getElementById('rec' + recid);
	if (!rec)
		return;
	var linkItems = rec.querySelectorAll('.t-menu__link-item');
	var subMenuLinks = rec.querySelectorAll('.t-menusub__link-item');
	Array.prototype.forEach.call(linkItems, function (link) {
		link.addEventListener('click', function () {
			if (link.classList.contains('t-menusub__target-link') || link.classList.contains('tooltipstered') ||
				link.classList.contains('t794__tm-link') || link.classList.contains('t966__tm-link') ||
				link.classList.contains('t978__tm-link'))
				return;
			t446_hideMenuOnMobile(link, rec);
		});
	});
	Array.prototype.forEach.call(subMenuLinks, function (subMenuLink) {
		subMenuLink.addEventListener('click', function () {
			t446_hideMenuOnMobile(subMenuLink, rec);
		});
	});
}

function t446_setLogoPadding(recid) {
	var rec = document.getElementById('rec' + recid);
	if (!rec || window.innerWidth <= 980)
		return;
	var menu = rec.querySelector('.t446');
	var logo = menu ? menu.querySelector('.t446__logowrapper') : null;
	var logoWidth = logo ? logo.offsetWidth : 0;
	var leftWrapper = menu ? menu.querySelector('.t446__leftwrapper') : null;
	var rightWrapper = menu ? menu.querySelector('.t446__rightwrapper') : null;
	if (leftWrapper)
		leftWrapper.style.paddingRight = ((logoWidth / 2) + 50) + 'px';
	if (rightWrapper)
		rightWrapper.style.paddingLeft = ((logoWidth / 2) + 50) + 'px';
}

function t446_checkOverflow(recid, menuheight) {
	var rec = document.getElementById('rec' + recid);
	var menu = rec ? rec.querySelector('.t446') : null;
	if (!menu)
		return;
	var rightWrapper = menu.querySelector('.t446__rightwrapper');
	var rightMenuWrap = rightWrapper ? rightWrapper.querySelector('.t446__rightmenuwrapper') : null;
	var additionalWrap = rightWrapper ? rightWrapper.querySelector('.t446__additionalwrapper') : null;
	var burgerWrapOverflow = rightWrapper ? rightWrapper.querySelector('.t446__burgerwrapper_overflow') : null;
	var burgerWrap = rightWrapper ? rightWrapper.querySelector('.t446__burgerwrapper_withoutoverflow') : null;
	var rightWrapperWidth = t446_getPureWidth(rightWrapper);
	var rightMenuWrapWidth = rightMenuWrap ? rightMenuWrap.offsetWidth : 0;
	var additionalWrapWidth = additionalWrap ? additionalWrap.offsetWidth : 0;
	var additionalWrapFloating = additionalWrap ? additionalWrap.style.float || window.getComputedStyle(additionalWrap).float : '';
	var blockHeight = menuheight > 0 ? menuheight : 80;
	if (window.innerWidth > 980 && rightMenuWrapWidth + additionalWrapWidth > rightWrapperWidth) {
		menu.style.height = (blockHeight * 2) + 'px';
		if (additionalWrap)
			additionalWrap.style.float = 'right';
		if (burgerWrapOverflow)
			burgerWrapOverflow.style.display = 'table-cell';
		if (burgerWrap)
			burgerWrap.style.display = 'none';
	} else {
		if (menu.offsetHeight > blockHeight)
			menu.style.height = blockHeight + 'px';
		if (additionalWrap && additionalWrapFloating === 'right')
			additionalWrap.style.float = 'none';
		if (burgerWrapOverflow)
			burgerWrapOverflow.style.display = 'none';
		if (burgerWrap)
			burgerWrap.style.display = 'table-cell';
	}
}

function t446_getPureWidth(el) {
	if (!el)
		return 0;
	var elWidth = el.offsetWidth;
	var elPaddingLeft = parseInt(window.getComputedStyle(el).paddingLeft, 10) || 0;
	var elPaddingRight = parseInt(window.getComputedStyle(el).paddingRight, 10) || 0;
	return elWidth - (elPaddingLeft + elPaddingRight);
}

function t446_highlight() {
	var url = window.location.href;
	var pathname = window.location.pathname;
	if (url.substr(url.length - 1) === '/') {
		url = url.slice(0, -1);
	}
	if (pathname.substr(pathname.length - 1) === '/') {
		pathname = pathname.slice(0, -1);
	}
	if (pathname.charAt(0) === '/') {
		pathname = pathname.slice(1);
	}
	if (pathname === '') {
		pathname = '/';
	}
	var shouldBeActiveElements = document.querySelectorAll('.t446__list_item a[href=\'' + url + '\'], ' +
		'.t446__list_item a[href=\'' + url + '/\'], ' + '.t446__list_item a[href=\'' + pathname + '\'], ' +
		'.t446__list_item a[href=\'/' + pathname + '\'], ' + '.t446__list_item a[href=\'' + pathname + '/\'], ' +
		'.t446__list_item a[href=\'/' + pathname + '/\']');
	Array.prototype.forEach.call(shouldBeActiveElements, function (link) {
		link.classList.add('t-active');
	});
}

function t446_checkAnchorLinks(recid) {
	var rec = document.getElementById('rec' + recid);
	if (!rec || window.innerWidth < 980)
		return;
	var navLinks = rec.querySelectorAll('.t446__list_item a[href*=\'#\']');
	navLinks = Array.prototype.filter.call(navLinks, function (link) {
		return !link.classList.contains('tooltipstered');
	});
	if (navLinks.length)
		t446_catchScroll(navLinks);
}

function t446_catchScroll(navLinks) {
	navLinks = Array.prototype.slice.call(navLinks);
	var clickedSectionID = null;
	var sections = [];
	var sectionToNavigationLinkID = {};
	var interval = 100;
	var lastCall;
	var timeoutID;
	navLinks = navLinks.reverse();
	navLinks.forEach(function (link) {
		var currentSection = t446_getSectionByHref(link);
		if (currentSection && currentSection.id) {
			sections.push(currentSection);
			sectionToNavigationLinkID[currentSection.id] = link;
		}
	});
	t446_updateSectionsOffsets(sections);
	sections.sort(function (a, b) {
		var firstTopOffset = parseInt(a.getAttribute('data-offset-top'), 10) || 0;
		var secondTopOffset = parseInt(b.getAttribute('data-offset-top'), 10) || 0;
		return secondTopOffset - firstTopOffset;
	});
	window.addEventListener('resize', t_throttle(function () {
		t446_updateSectionsOffsets(sections);
	}, 200));
	if (typeof jQuery !== 'undefined') {
		$('.t446').bind('displayChanged', function () {
			t446_updateSectionsOffsets(sections);
		});
	} else {
		var menuEls = document.querySelectorAll('.t446');
		Array.prototype.forEach.call(menuEls, function (menu) {
			menu.addEventListener('displayChanged', function () {
				t446_updateSectionsOffsets(sections);
			});
		});
	}
	setInterval(function () {
		t446_updateSectionsOffsets(sections);
	}, 5000);
	t446_highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID);
	navLinks.forEach(function (navLink, i) {
		navLink.addEventListener('click', function () {
			var clickedSection = t446_getSectionByHref(navLink);
			if (!navLink.classList.contains('tooltipstered') && clickedSection && clickedSection.id) {
				navLinks.forEach(function (link, index) {
					if (index === i) {
						link.classList.add('t-active');
					} else {
						link.classList.remove('t-active');
					}
				});
				clickedSectionID = clickedSection.id;
			}
		});
	});
	window.addEventListener('scroll', function () {
		var dateNow = new Date().getTime();
		if (lastCall && dateNow < lastCall + interval) {
			clearTimeout(timeoutID);
			timeoutID = setTimeout(function () {
				lastCall = dateNow;
				clickedSectionID = t446_highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID);
			}, interval - (dateNow - lastCall));
		} else {
			lastCall = dateNow;
			clickedSectionID = t446_highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID);
		}
	});
}

function t446_updateSectionsOffsets(sections) {
	sections.forEach(function (section) {
		var sectionTopPos = section.getBoundingClientRect().top + window.pageYOffset;
		section.setAttribute('data-offset-top', sectionTopPos);
	});
}

function t446_getSectionByHref(currentLink) {
	if (!currentLink)
		return;
	var href = currentLink.getAttribute('href');
	var curLinkValue = href ? href.replace(/\s+/g, '') : '';
	if (curLinkValue.indexOf('/') === 0)
		curLinkValue = curLinkValue.slice(1);
	if (href && currentLink.matches('[href*="#rec"]')) {
		curLinkValue = curLinkValue.replace(/.*#/, '');
		return document.getElementById(curLinkValue);
	} else {
		var selector = href ? href.trim() : '';
		var slashIndex = selector.indexOf('#') !== -1 ? selector.indexOf('#') : !1;
		if (typeof slashIndex === 'number') {
			selector = selector.slice(slashIndex + 1);
		} else {
			slashIndex = selector.indexOf('/') !== -1 ? selector.indexOf('/') : !1;
			if (typeof slashIndex === 'number')
				selector = selector.slice(slashIndex + 1);
		}
		var fullSelector = '.r[data-record-type="215"] a[name="' + selector + '"]';
		return document.querySelector(fullSelector) ? document.querySelector(fullSelector).closest('.r') : null;
	}
}

function t446_highlightNavLinks(navLinks, sections, sectionToNavigationLinkID, clickedSectionID) {
	var scrollPosition = window.pageYOffset;
	var scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight);
	var returnValue = clickedSectionID;
	var lastSection = sections.length ? sections[sections.length - 1] : null;
	var lastSectionTopPos = lastSection ? lastSection.getAttribute('data-offset-top') : '0';
	lastSectionTopPos = parseInt(lastSectionTopPos, 10) || 0;
	if (sections.length && clickedSectionID === null && lastSectionTopPos > (scrollPosition + 300)) {
		navLinks.forEach(function (link) {
			link.classList.remove('t-active');
		});
		return null;
	}
	for (var i = 0; i < sections.length; i++) {
		var sectionTopPos = sections[i].getAttribute('data-offset-top');
		var navLink = sections[i].id ? sectionToNavigationLinkID[sections[i].id] : null;
		if (scrollPosition + 300 >= sectionTopPos || i === 0 && scrollPosition >= scrollHeight - window.innerHeight) {
			if (clickedSectionID === null && navLink && !navLink.classList.contains('t-active')) {
				navLinks.forEach(function (link) {
					link.classList.remove('t-active');
				});
				if (navLink)
					navLink.classList.add('t-active');
				returnValue = null;
			} else if (clickedSectionID !== null && sections[i].id && clickedSectionID === sections[i].id) {
				returnValue = null;
			}
			break;
		}
	}
	return returnValue;
}

function t446_setBg(recid) {
	var menuBlocks = document.querySelectorAll('.t446');
	Array.prototype.forEach.call(menuBlocks, function (menu) {
		if (window.innerWidth > 980) {
			if (menu.getAttribute('data-bgcolor-setbyscript') === 'yes') {
				menu.style.backgroundColor = menu.getAttribute('data-bgcolor-rgba');
			}
		} else {
			menu.style.backgroundColor = menu.getAttribute('data-bgcolor-hex');
			menu.setAttribute('data-bgcolor-setbyscript', 'yes');
			if (menu.style.transform)
				menu.style.transform = '';
			if (menu.style.opacity)
				menu.style.opacity = '';
		}
	});
}

function t446_appearMenu(recid) {
	if (window.innerWidth <= 980)
		return;
	var menuBlocks = document.querySelectorAll('.t446');
	Array.prototype.forEach.call(menuBlocks, function (menu) {
		var appearOffset = menu.getAttribute('data-appearoffset');
		if (appearOffset) {
			if (appearOffset.indexOf('vh') !== -1) {
				appearOffset = Math.floor((window.innerHeight * (parseInt(appearOffset) / 100)));
			}
			appearOffset = parseInt(appearOffset, 10);
			var menuHeight = menu.clientHeight;
			if (typeof appearOffset === 'number' && window.pageYOffset >= appearOffset) {
				if (menu.style.transform === 'translateY(-' + menuHeight + 'px)') {
					t446_slideUpElement(menu, menuHeight, 'toBottom');
				}
			} else if (menu.style.transform === 'translateY(0px)') {
				t446_slideUpElement(menu, menuHeight, 'toTop');
			} else {
				menu.style.transform = 'translateY(-' + menuHeight + 'px)';
				menu.style.opacity = '0';
			}
		}
	});
}

function t446_slideUpElement(menu, menuHeight, direction) {
	var diff = direction === 'toTop' ? 0 : menuHeight;
	var diffOpacity = direction === 'toTop' ? 1 : 0;
	var timerID = setInterval(function () {
		menu.style.transform = 'translateY(-' + diff + 'px)';
		menu.style.opacity = diffOpacity.toString();
		diffOpacity = direction === 'toTop' ? diffOpacity - 0.1 : diffOpacity + 0.1;
		diff = direction === 'toTop' ? diff + (menuHeight / 20) : diff - (menuHeight / 20);
		if (direction === 'toTop' && diff >= menuHeight) {
			menu.style.transform = 'translateY(-' + menuHeight + 'px)';
			menu.style.opacity = '0';
			clearInterval(timerID);
		}
		if (direction === 'toBottom' && diff <= 0) {
			menu.style.transform = 'translateY(0px)';
			menu.style.opacity = '1';
			clearInterval(timerID);
		}
	}, 10);
}

function t446_changebgopacitymenu(recid) {
	if (window.innerWidth <= 980)
		return;
	var menuBlocks = document.querySelectorAll('.t446');
	Array.prototype.forEach.call(menuBlocks, function (menu) {
		var bgColor = menu.getAttribute('data-bgcolor-rgba');
		var bgColorAfterScroll = menu.getAttribute('data-bgcolor-rgba-afterscroll');
		var bgOpacity = menu.getAttribute('data-bgopacity');
		var bgOpacityTwo = menu.getAttribute('data-bgopacity-two');
		var menuShadow = menu.getAttribute('data-menushadow') || '0';
		var menuShadowValue = menuShadow === '100' ? menuShadow : '0.' + menuShadow;
		menu.style.backgroundColor = window.pageYOffset > 20 ? bgColorAfterScroll : bgColor;
		if (window.pageYOffset > 20 && bgOpacityTwo === '0' || window.pageYOffset <= 20 && bgOpacity === '0.0' || menuShadow ===
			' ') {
			menu.style.boxShadow = 'none';
		} else {
			menu.style.boxShadow = '0px 1px 3px rgba(0,0,0,' + menuShadowValue + ')';
		}
	});
}

function t446_createMobileMenu(recid) {
	var rec = document.getElementById('rec' + recid);
	if (!rec)
		return;
	var menu = rec.querySelector('.t446');
	var burger = rec.querySelector('.t446__mobile');
	if (menu && menu.classList.contains('t446__mobile_burgerhook')) {
		var mobileBurger = burger ? burger.querySelector('.t446__mobile_burger') : null;
		if (mobileBurger) {
			var mobileBurgerParent = mobileBurger.parentElement;
			var link = document.createElement('a');
			link.href = '#menuopen';
			if (mobileBurgerParent) {
				link.appendChild(mobileBurger);
				mobileBurgerParent.appendChild(link);
			}
		}
	} else if (burger) {
		burger.addEventListener('click', function () {
			if (burger.classList.contains('t446_opened')) {
				t446_fadeOut(menu, 300);
				burger.classList.remove('t446_opened');
			} else {
				t446_fadeIn(menu, 300, function () {
					if (menu.style.transform)
						menu.style.transform = '';
					if (menu.style.opacity)
						menu.style.opacity = '';
				});
				burger.classList.add('t446_opened');
			}
		});
	}
	window.addEventListener('resize', t_throttle(function () {
		if (window.innerWidth > 980) {
			if (menu)
				menu.style.opacity = '';
			if (menu)
				menu.style.display = '';
			if (burger)
				burger.classList.remove('t446_opened');
		}
	}, 200));
	var linkItems = rec.querySelectorAll('.t-menu__link-item');
	Array.prototype.forEach.call(linkItems, function (link) {
		link.addEventListener('click', function () {
			if (!link.classList.contains('t966__tm-link') && !link.classList.contains('t978__tm-link')) {
				t446_hideMenuOnMobile(link, rec);
			}
		});
	});
	var logoWrappers = rec.querySelectorAll('.t446__logowrapper2 a');
	Array.prototype.forEach.call(logoWrappers, function (logoWrapper) {
		logoWrapper.addEventListener('click', function () {
			t446_hideMenuOnMobile(link, rec);
		});
	});
}

function t446_hideMenuOnMobile(link, rec) {
	if (!rec || !link || window.innerWidth >= 980)
		return !1;
	var url = link.href ? link.href.trim() : '';
	var menu = rec.querySelector('.t446');
	var burger = rec.querySelector('.t446__mobile');
	if (url && link.matches('[href*="#"]')) {
		if (burger)
			burger.classList.remove('t446_opened');
		if (menu) {
			if (menu.classList.contains('t446__positionabsolute') || (burger && !burger.classList.contains('.t446__positionfixed'))) {
				menu.style.display = 'none';
				menu.style.opacity = '0';
			} else {
				t446_fadeOut(menu, 300);
			}
		}
	}
}

function t446_fadeOut(element, duration, callback) {
	if (!element)
		return !1;
	var opacity = 1;
	duration = parseInt(duration, 10);
	var speed = duration > 0 ? duration / 10 : 40;
	var timer = setInterval(function () {
		element.style.opacity = opacity;
		opacity -= 0.1;
		if (opacity <= 0.1) {
			element.style.opacity = '0';
			element.style.display = 'none';
			if (typeof callback === 'function') {
				callback();
			}
			clearInterval(timer);
		}
	}, speed);
}

function t446_fadeIn(element, duration, callback) {
	if (!element)
		return !1;
	if ((getComputedStyle(element).opacity === '1' || getComputedStyle(element).opacity === '') &&
		getComputedStyle(element).display !== 'none')
		return !1;
	var opacity = 0;
	duration = parseInt(duration, 10);
	var speed = duration > 0 ? duration / 10 : 40;
	element.style.opacity = opacity;
	element.style.display = 'block';
	var timer = setInterval(function () {
		element.style.opacity = opacity;
		opacity += 0.1;
		if (opacity >= 1) {
			element.style.opacity = '1';
			if (typeof callback === 'function') {
				callback();
			}
			clearInterval(timer);
		}
	}, speed);
}

function t978_init(recid, cols, openOnClick) {
	var rec = document.getElementById('rec' + recid);
	var menu = rec ? rec.querySelector('.t978') : null;
	var hook = menu ? menu.getAttribute('data-tooltip-hook') : '';
	if (!hook) return;
	var hookLinks = document.querySelectorAll('a[href="' + hook + '"]');

	var hookLinkParent = hookLinks.length ? hookLinks[0].closest('[data-menu]') : null;
	var isHookLinkParentFixed = hookLinkParent ?
		hookLinkParent.style.position === 'fixed' || window.getComputedStyle(hookLinkParent).position === 'fixed' : false;
	var tooltipMenu = document.querySelectorAll('#rec' + recid + ' .t978__tooltip-menu');

	Array.prototype.forEach.call(tooltipMenu, function (tooltip) {
		var isPosFixed = isHookLinkParentFixed ? 'yes' : 'no';
		tooltip.setAttribute('data-pos-fixed', isPosFixed);
	});

	Array.prototype.forEach.call(hookLinks, function (hookLink) {
		hookLink.classList.add('t978__tm-link');
		hookLink.setAttribute('data-tooltip-menu-id', recid);
	});

	t978_addArrow(recid, hookLinks);
	t978_setUpMenu(recid, hookLinks, cols, openOnClick);
	t978_findActiveItem();
}

function t978_preview(recid, cols) {
	var rec = document.getElementById('rec' + recid);
	if (!rec) return;
	var tooltipMenu = rec.querySelector('.t978__tooltip-menu');
	var content = tooltipMenu ? tooltipMenu.querySelector('.t978__content') : null;
	var submenuContainer = content ? content.querySelector('.t978__submenu-container') : null;

	t978_divideMenu(recid, cols);

	var submenuActiveLink = content ? content.querySelectorAll('.t978__menu-link') : [];
	submenuActiveLink = Array.prototype.filter.call(submenuActiveLink, function (activeLink) {
		return (activeLink.hasAttribute('data-menu-submenu-hook') && activeLink.getAttribute('data-menu-submenu-hook'));
	});
	var submenuHook = submenuActiveLink.length ? submenuActiveLink[0].getAttribute('data-menu-submenu-hook') : '';
	if (!submenuHook) return;
	var activeSubmenuContainer = content ?
		content.querySelector('.t978__submenu-wrapper[data-submenu-hook="' + submenuHook + '"]') : null;
	var activeSubmenu = activeSubmenuContainer ? activeSubmenuContainer.querySelector('.t978__submenu') : null;

	if (window.innerWidth > 980) {
		if (activeSubmenuContainer) activeSubmenuContainer.style.display = 'block';
		if (submenuContainer) submenuContainer.style.display = 'block';
		if (activeSubmenu) activeSubmenu.classList.add('t978__submenu_show');
	}
}

function t978_divideMenu(recid, rows) {
	var rec = document.getElementById('rec' + recid);
	if (!rec) return;
	if (!rows) rows = 1;
	var wrapperList = rec.querySelectorAll('.t978__tooltip-menu .t978__content .t978__submenu-wrapper');
	Array.prototype.forEach.call(wrapperList, function (wrapper) {
		var items = wrapper.querySelectorAll('.t978__submenu-item');
		var list = wrapper.querySelector('.t978__submenu-list');
		var minItemsCountInRow = Math.floor(items.length / rows);
		var remainder = items.length % rows;
		var rowClass = 't978__menu-col_' + rows;

		for (var i = 0; i < rows; i++) {
			var row = document.createElement('div');
			row.classList.add('t978__menu-col');
			row.classList.add(rowClass);
			if (list) list.appendChild(row);
		}

		var listRows = list ? list.querySelectorAll('.t978__menu-col') : [];
		var pointer = 0;
		Array.prototype.forEach.call(listRows, function (row, i) {
			var itemsArray = Array.prototype.slice.call(items);
			var itemPerCol = i < remainder ? minItemsCountInRow + 1 : minItemsCountInRow;
			var slicedItems = itemsArray.splice(pointer, pointer + itemPerCol);
			slicedItems.forEach(function (el) {
				row.appendChild(el);
			});
			pointer += itemPerCol;
		});
	});
}

function t978_setUpMenu(recid, hookLinks, cols, openOnClick) {
	hookLinks = Array.prototype.slice.call(hookLinks);
	var rec = document.getElementById('rec' + recid);
	var submenu = rec ? rec.querySelector('.t978__tooltip-menu') : null;
	if (!submenu) return;
	var content = submenu.querySelector('.t978__content');
	var menu = rec.querySelector('.t978');
	var verticalIndent = menu ? menu.getAttribute('data-tooltip-margin') : '';

	t978_divideMenu(recid, cols);

	if (window.innerWidth > 980) {
		t978_addEventsDesktop(submenu, hookLinks, verticalIndent, openOnClick);
	} else {
		t978_addEventsMobile(submenu, hookLinks, verticalIndent, openOnClick);
	}

	window.addEventListener('scroll', t_throttle(function () {
		if (content) {
			content.addEventListener('mouseleave', function () {
				var activeHookLinks = hookLinks.length ? hookLinks.filter(function (link) {
					return link.classList.contains('t978__tm-link_active');
				}) : [];
				var nextEl = activeHookLinks.length ? activeHookLinks[0].nextElementSibling : null;
				if (submenu.classList.contains('t978__tooltip-menu_show') ||
					(nextEl && nextEl.classList.contains('t978__tooltip-menu_mobile'))) {
					t978_hideTooltipmenu(nextEl);
				}
			});
		}
	}, 300));

	var links = document.querySelectorAll('.t978__tooltip-menu a[href*="#"]');
	links = Array.prototype.slice.call(links);

	links.forEach(function (link) {
		link.addEventListener('click', function () {
			t978_hideTooltipmenu(submenu, link);
			links.forEach(function (element) {
				element.classList.remove('t-active');
			});
			link.classList.add('t-active');
		});
	});

	var elements = document.querySelectorAll('.t450, .t199__mmenu, .t280, .t282, .t204__burger, .t451, .t466');
	var event = document.createEvent('Event');
	event.initEvent('clickedAnchorInTooltipMenu', true, true);

	document.addEventListener('click', function (e) {
		if (e.target.closest('.t978__tooltip-menu a[href*="#"]')) {
			Array.prototype.forEach.call(elements, function (el) {
				el.dispatchEvent(event);
			});
		}
	});
}

function t978_addEventsDesktop(tooltipMenu, hookLinks, verticalIndent, openOnClick) {
	if (!tooltipMenu) return;
	hookLinks = Array.prototype.slice.call(hookLinks);
	var menuLinks = tooltipMenu.querySelector('.t978__menu-link');
	var submenuContainer = tooltipMenu.querySelector('.t978__submenu-container');
	var submenuWrapper = tooltipMenu.querySelectorAll('.t978__submenu-wrapper');
	var timer;

	var hooksAndMenu = hookLinks.concat(tooltipMenu);

	hooksAndMenu.forEach(function (element) {
		element.addEventListener('mouseover', function (e) {
			e.preventDefault();
			if (element.classList.contains('t978__tooltip-menu') && !element.classList.contains('t978__tooltip-menu_show')) return;
			clearTimeout(timer);
			if (element.classList.contains('t978__tooltip-menu') && tooltipMenu.classList.contains('t978__tooltip-menu_show')) return;
			t978_showTooltipmenu(element, tooltipMenu, verticalIndent);
			t978_addSubmenuEvents(tooltipMenu, openOnClick);
		});
		element.addEventListener('mouseout', function () {
			timer = setTimeout(function () {
				t978_hideTooltipmenu(tooltipMenu);
				t978_resetSubmenu(menuLinks, submenuWrapper, submenuContainer);
			}, 300);
		});
	});

	window.addEventListener('resize', t_throttle(function () {
		var tooltipMenuMobile = document.querySelector('.t978__tooltip-menu_mobile');
		if (tooltipMenuMobile) t978_hideTooltipmenu(tooltipMenuMobile);
	}, 300));
}

function t978_addEventsMobile(tooltipMenu, hookLinks, verticalIndent, openOnClick) {
	hookLinks.forEach(function (hookLink) {
		hookLink.addEventListener('click', function (e) {
			e.preventDefault();
			var activeHookLink = hookLinks.filter(function (el) {
				return el.classList.contains('t978__tm-link_active');
			});
			var nextAfterActiveHookLink = activeHookLink.length ? activeHookLink[0].nextElementSibling : null;
			if (tooltipMenu && tooltipMenu.classList.contains('t978__tooltip-menu_show') ||
				(nextAfterActiveHookLink && nextAfterActiveHookLink.classList.contains('t978__tooltip-menu_mobile'))) {
				t978_hideTooltipmenu(nextAfterActiveHookLink, hookLink);
				t978_addSubmenuEvents(nextAfterActiveHookLink, openOnClick);
			} else {
				var tooltipMobile = tooltipMenu ? tooltipMenu.cloneNode(true) : null;
				if (tooltipMobile) tooltipMobile.classList.add('t978__tooltip-menu_mobile');
				t978_showTooltipmenu(hookLink, tooltipMobile, verticalIndent);
				t978_addSubmenuEvents(tooltipMobile, openOnClick);
			}
		});
	});
}

function t978_showTooltipmenu(currentAnchor, tooltipmenu, verticalIndent) {
	var menu = tooltipmenu ? tooltipmenu.closest('.t228') : null;
	if (window.innerWidth <= 980) {
		if (currentAnchor && tooltipmenu) currentAnchor.insertAdjacentElement('afterend', tooltipmenu);
		if (menu) {
			var event = document.createEvent('Event');
			event.initEvent('overflow', true, true);
			menu.dispatchEvent(event);
		}
		if (tooltipmenu) tooltipmenu.style.position = 'static';
		if (tooltipmenu) tooltipmenu.classList.add('t978__tooltip-menu_show');

		if (tooltipmenu && (tooltipmenu.closest('.t280') || tooltipmenu.closest('.t450') || tooltipmenu.closest('.t451'))) {
			tooltipmenu.style.display = 'block';
		} else {
			var otherTooltipMenu = document.querySelectorAll('.t978__tooltip-menu_mobile');
			otherTooltipMenu = Array.prototype.filter.call(otherTooltipMenu, function (tooltip) {
				return tooltip !== tooltipmenu;
			});
			otherTooltipMenu.forEach(function (el) {
				var link = el.previousElementSibling;
				if (link) link.classList.remove('t978__tm-link_active');
				t978_slideUp(el);
			});
			t978_slideDown(tooltipmenu);
		}

		if (currentAnchor) currentAnchor.classList.add('t978__tm-link_active');

		if (window.lazy === 'y') {
			t_lazyload_update();
		}
	} else {
		t978_positionTooltipmenu(currentAnchor, tooltipmenu, verticalIndent);
		if (window.lazy === 'y') {
			t_lazyload_update();
		}
	}
}

function t978_positionTooltipmenu(currentAnchor, tooltipMenu, verticalIndent) {
	t978_positionTooltipmenuX(currentAnchor, tooltipMenu);
	t978_positionTooltipmenuY(currentAnchor, tooltipMenu, verticalIndent);

	if (tooltipMenu) tooltipMenu.style.display = 'block';
	if (tooltipMenu) tooltipMenu.classList.add('t978__tooltip-menu_show');
	if (currentAnchor) currentAnchor.classList.add('t978__tm-link_active');
}

function t978_positionTooltipmenuX(currentAnchor, tooltipMenu) {
	if (!tooltipMenu) return;
	tooltipMenu.style.display = 'block';
	var menu = tooltipMenu.querySelector('.t978__menu');
	var corner = tooltipMenu.querySelector('.t978__tooltip-menu-corner');
	var cornerBorder = tooltipMenu.querySelector('.t978__tooltip-menu-corner-border');

	var winWidth = window.innerWidth;

	var menuWidth = menu.offsetWidth;
	var tooltipmenuWidth = tooltipMenu.offsetWidth;
	var anchorWidth = t978_getValueWithoutPadding(currentAnchor, 'width');
	if (currentAnchor && currentAnchor.classList.contains('t-btn')) {
		anchorWidth = currentAnchor.offsetWidth;
	}
	var anchorLeft = currentAnchor.getBoundingClientRect().left + window.pageXOffset;
	tooltipMenu.style.display = '';
	var cornerLeft;
	var menuX;
	var initialMenuX;
	var anchorCenter;
	var menuCenter;

	var arrowHeight = 10;
	var menuPos = 'left';
	var menuWindowMargin = 10;
	var minMenuWidth = 200;

	initialMenuX = (anchorLeft + anchorWidth / 2) - menuWidth / 2;
	var anchorX = anchorLeft;

	if ((initialMenuX + menuWidth) > winWidth - minMenuWidth) {
		menuPos = 'right';
		if (menu) menu.style.order = '1';
		anchorX = winWidth - (anchorLeft + anchorWidth);

		menuX = winWidth - initialMenuX - tooltipmenuWidth;
		if (initialMenuX + tooltipmenuWidth > winWidth - menuWindowMargin) {
			menuX = menuWindowMargin;
		}
	} else {
		menuX = initialMenuX;
		if (initialMenuX < menuWindowMargin) {
			menuX = menuWindowMargin;
		}
	}

	cornerLeft = menuWidth / 2 - arrowHeight / 2;

	anchorCenter = anchorX + anchorWidth / 2;
	menuCenter = menuX + menuWidth / 2;

	if (menuCenter !== anchorCenter) {
		if (menuX < anchorX) {
			cornerLeft = (anchorX - menuX) + anchorWidth / 2 - arrowHeight / 2;
		} else {
			cornerLeft = anchorWidth / 2 - arrowHeight / 2;
		}
	}

	if (corner) corner.style[menuPos] = cornerLeft + 'px';
	if (cornerBorder) cornerBorder.style[menuPos] = cornerLeft + 'px';
	if (tooltipMenu) tooltipMenu.style[menuPos] = menuX + 'px';
}

function t978_positionTooltipmenuY(currentAnchor, tooltipMenu, verticalIndent) {
	var tooltipmenuHeight = tooltipMenu ? tooltipMenu.offsetHeight : null;
	var scrollTop = window.pageYOffset;
	var anchorHeight = t978_getValueWithoutPadding(currentAnchor, 'height');
	var menuFixed = tooltipMenu ? tooltipMenu.getAttribute('data-pos-fixed') : null;

	var corner = tooltipMenu ? tooltipMenu.querySelector('.t978__tooltip-menu-corner') : null;
	var cornerBorder = tooltipMenu ? tooltipMenu.querySelector('.t978__tooltip-menu-corner-border') : null;

	var currentAnchorTopPos = currentAnchor ? currentAnchor.getBoundingClientRect().top : 0;

	var arrowHeight = 10;
	var verticalIndentDefault = 25;

	if (verticalIndent) {
		verticalIndent = parseInt(verticalIndent, 10);
		/*add arrow*/
		verticalIndent += arrowHeight;
	} else {
		verticalIndent = verticalIndentDefault;
	}

	var axisY;
	if (menuFixed === 'yes') {
		axisY = currentAnchorTopPos + anchorHeight + verticalIndent;
		if (tooltipMenu) tooltipMenu.style.position = 'fixed';
	} else {
		axisY = currentAnchorTopPos + scrollTop + anchorHeight + verticalIndent;
	}

	if (
		axisY + tooltipmenuHeight > scrollTop + document.documentElement.clientHeight &&
		axisY >= tooltipmenuHeight &&
		axisY - scrollTop > tooltipmenuHeight
	) {
		axisY = Math.max(
			axisY - tooltipmenuHeight - anchorHeight - verticalIndent * 2,
			scrollTop
		);
		if (tooltipMenu) tooltipMenu.classList.remove('t978__tooltip-menu_bottom');
		if (tooltipMenu) tooltipMenu.classList.add('t978__tooltip-menu_top');

		if (corner) corner.classList.remove('t978__tooltip-menu-corner_bottom');
		if (corner) corner.classList.add('t978__tooltip-menu-corner_top');

		if (cornerBorder) cornerBorder.classList.remove('t978__tooltip-menu-corner-border_bottom');
		if (cornerBorder) cornerBorder.classList.add('t978__tooltip-menu-corner-border_top');
	} else {
		if (tooltipMenu) tooltipMenu.classList.remove('t978__tooltip-menu_top');
		if (tooltipMenu) tooltipMenu.classList.add('t978__tooltip-menu_bottom');

		if (corner) corner.classList.remove('t978__tooltip-menu-corner_top');
		if (corner) corner.classList.add('t978__tooltip-menu-corner_bottom');

		if (cornerBorder) cornerBorder.classList.remove('t978__tooltip-menu-corner-border_top');
		if (cornerBorder) cornerBorder.classList.add('t978__tooltip-menu-corner-border_bottom');
	}
	if (tooltipMenu) tooltipMenu.style.top = axisY + 'px';
}

function t978_hideTooltipmenu(tooltipmenu, link) {
	var menu = tooltipmenu ? tooltipmenu.querySelector('.t978__menu') : null;
	var corner = tooltipmenu ? tooltipmenu.querySelector('.t978__tooltip-menu-corner') : null;
	var cornerBorder = tooltipmenu ? tooltipmenu.querySelector('.t978__tooltip-menu-corner-border') : null;
	var tooltipmenuParent = tooltipmenu ? tooltipmenu.parentElement : null;
	var activeLink = tooltipmenuParent ? tooltipmenuParent.querySelector('.t978__tm-link_active') : null;
	var menuHookLink = link ? link : activeLink;
	if (tooltipmenu && tooltipmenu.classList.contains('t978__tooltip-menu_mobile')) {
		if (tooltipmenu.closest('.t280') || tooltipmenu.closest('.t450') || tooltipmenu.closest('.t451')) {
			tooltipmenu.style.display = 'none';
			t978_removeEl(tooltipmenu);
		} else {
			t978_slideUp(tooltipmenu, 300, function () {
				t978_removeEl(tooltipmenu);
			});
		}
		if (menuHookLink) menuHookLink.classList.remove('t978__tm-link_active');
	} else {
		var content = tooltipmenu ? tooltipmenu.querySelector('.t978__content') : null;

		if (tooltipmenu) tooltipmenu.style.display = '';
		if (tooltipmenu) tooltipmenu.style.left = '';
		if (tooltipmenu) tooltipmenu.style.right = '';
		if (tooltipmenu) tooltipmenu.style.top = '';
		if (tooltipmenu) tooltipmenu.style.width = '';

		if (menu) menu.style.order = '';

		if (content) content.style.overflowY = '';
		if (content) content.style.height = '';

		if (corner) corner.style.left = '';
		if (corner) corner.style.right = '';

		if (cornerBorder) cornerBorder.style.left = '';
		if (cornerBorder) cornerBorder.style.right = '';

		if (tooltipmenu) tooltipmenu.classList.remove('t978__tooltip-menu_show');
	}
	var activeLinks = document.querySelectorAll('.t978__tm-link_active');
	Array.prototype.forEach.call(activeLinks, function (link) {
		link.classList.remove('t978__tm-link_active');
	});
}

function t978_addSubmenuEvents(tooltipMenu, openOnClick) {
	var submenuLinks = tooltipMenu ? tooltipMenu.querySelectorAll('.t978__menu-link') : [];
	submenuLinks = Array.prototype.slice.call(submenuLinks);
	var submenuContainer = tooltipMenu ? tooltipMenu.querySelector('.t978__submenu-container') : null;
	var submenuWrapper = tooltipMenu ? tooltipMenu.querySelectorAll('.t978__submenu-wrapper') : null;
	var submenuContent = tooltipMenu ? tooltipMenu.querySelectorAll('.t978__submenu-content') : null;
	var timer;
	var submenuOpened = false;
	var linksAndContent = submenuLinks.slice();

	Array.prototype.forEach.call(submenuContent, function (content) {
		linksAndContent.push(content);
	});

	submenuLinks.forEach(function (submenuLink) {
		submenuLink.onclick = function (e) {
			var submenuHook = submenuLink.getAttribute('data-menu-submenu-hook');
			if (submenuHook) {
				e.preventDefault();
				if (window.innerWidth <= 980) {
					if (submenuLink.classList.contains('t978__menu-activelink')) {
						t978_hideSubmenu(tooltipMenu, submenuHook);
					} else {
						submenuLink.classList.add('t978__menu-activelink');
						t978_showSubmenu(tooltipMenu, submenuHook);
						clearTimeout(timer);
					}
				}
			}
		};
	});

	if (window.innerWidth <= 980) return;

	if (openOnClick === 'on') {
		submenuLinks.forEach(function (submenuLink) {
			submenuLink.onclick = function (e) {
				var submenuHook = submenuLink.getAttribute('data-menu-submenu-hook');
				if (!submenuHook) return;
				e.preventDefault();
				if (submenuOpened) {
					t978_resetSubmenu(submenuLinks, submenuWrapper, submenuContainer);
					submenuOpened = false;
				} else {
					submenuLink.classList.add('t978__menu-activelink');
					t978_showSubmenu(tooltipMenu, submenuHook);
					submenuOpened = true;
				}
			};
		});
	} else {
		linksAndContent.forEach(function (element) {
			element.onmouseover = function (e) {
				var submenuLink = e.target.closest('.t978__menu-link');
				if (submenuLink && !submenuLink.classList.contains('.t978__menu-activelink')) {
					t978_resetSubmenu(submenuLinks, submenuWrapper, submenuContainer);
				}
				var submenuHook = element.getAttribute('data-menu-submenu-hook');
				if (submenuHook) {
					element.classList.add('t978__menu-hoverlink');
					t978_showSubmenu(tooltipMenu, submenuHook);
				}
				clearTimeout(timer);
			};

			element.onmouseout = function () {
				var submenuHook = element.getAttribute('data-menu-submenu-hook');
				if (submenuHook) {
					timer = setTimeout(function () {
						t978_resetSubmenu(submenuLinks, submenuWrapper, submenuContainer);
					}, 300);
				}
			};
		});
	}
}

function t978_showSubmenu(tooltipMenu, submenuHook) {
	var content = tooltipMenu ? tooltipMenu.querySelector('.t978__content') : null;
	var submenuContainer = content ? content.querySelector('.t978__submenu-container') : null;
	var submenuWrapper = content ? content.querySelector('.t978__submenu-wrapper[data-submenu-hook="' + submenuHook + '"]') : null;
	var activeLink = content ? content.querySelector('.t978__menu-link[data-menu-submenu-hook="' + submenuHook + '"]') : null;
	var activeLinkWrapper = activeLink ? activeLink.parentElement : null;
	var menu = tooltipMenu ? tooltipMenu.closest('.t228') : null;

	if (menu) {
		var event = document.createEvent('Event');
		event.initEvent('overflow', true, true);
		menu.dispatchEvent(event);
	}

	if (window.innerWidth <= 980) {
		if (activeLinkWrapper && submenuWrapper) {
			activeLinkWrapper.insertAdjacentElement('afterend', submenuWrapper);
		}
		if (content && (content.closest('.t280') || content.closest('.t450') || content.closest('.t451'))) {
			if (submenuContainer) submenuContainer.classList.add('t978__submenu_show');
			if (submenuWrapper) submenuWrapper.classList.add('t978__submenu_show');
		} else {
			t978_slideDown(submenuWrapper);
		}
	} else {
		if (submenuContainer) submenuContainer.classList.add('t978__submenu_show');
		if (submenuWrapper) submenuWrapper.classList.add('t978__submenu_show');
	}
}

function t978_hideSubmenu(tooltipMenu, submenuHook) {
	var content = tooltipMenu ? tooltipMenu.querySelector('.t978__content') : null;
	var submenuContainer = content ? content.querySelector('.t978__submenu-container') : null;
	var submenuWrapper = content ? content.querySelector('.t978__submenu-wrapper[data-submenu-hook="' + submenuHook + '"]') : null;
	var activeLink = content ? content.querySelector('.t978__menu-link[data-menu-submenu-hook="' + submenuHook + '"]') : null;

	if (activeLink) activeLink.classList.remove('t978__menu-activelink');
	if (activeLink) activeLink.classList.remove('t978__menu-hoverlink');

	if (window.innerWidth <= 980) {
		if (content && content.closest('.t280') || content && content.closest('.t450') || content && content.closest('.t451')) {
			if (submenuContainer) submenuContainer.classList.remove('t978__submenu_show');
			if (submenuWrapper) submenuWrapper.classList.remove('t978__submenu_show');
		} else {
			t978_slideUp(submenuContainer);
			t978_slideUp(submenuWrapper);
		}
	} else {
		if (submenuContainer) submenuContainer.classList.remove('t978__submenu_show');
		if (submenuWrapper) submenuWrapper.classList.remove('t978__submenu_show');
	}
}

function t978_resetSubmenu(submenuLinks, submenuWrapper, submenuContainer) {
	Array.prototype.forEach.call(submenuLinks, function (submenuLink) {
		submenuLink.classList.remove('t978__menu-activelink');
		submenuLink.classList.remove('t978__menu-hoverlink');
	});

	if (window.innerWidth <= 980) {
		t978_slideUp(submenuContainer);
		if (submenuWrapper.length) {
			Array.prototype.forEach.call(submenuWrapper, function (wrapper) {
				t978_slideUp(wrapper);
			});
		}
	} else {
		if (submenuContainer) submenuContainer.classList.remove('t978__submenu_show');
		if (submenuWrapper.length) {
			Array.prototype.forEach.call(submenuWrapper, function (wrapper) {
				wrapper.classList.remove('t978__submenu_show');
			});
		}
	}
}

function t978_addArrow(recid, hookLinks) {
	hookLinks = Array.prototype.slice.call(hookLinks);
	var rec = document.getElementById('rec' + recid);
	var menu = rec ? rec.querySelector('.t978') : null;
	var isArrowAppend = menu.getAttribute('data-add-arrow');
	if (!isArrowAppend) return;
	hookLinks.forEach(function (hookLink) {
		var arrow = document.createElement('div');
		arrow.classList.add('t978__arrow');
		hookLink.appendChild(arrow);
	});
}

function t978_findActiveItem() {
	var url = window.location.href;
	var pathname = window.location.pathname;
	var hash = window.location.hash;
	if (url.substr(url.length - 1) === '/') {
		url = url.slice(0, -1);
	}
	if (pathname.substr(pathname.length - 1) === '/') {
		pathname = pathname.slice(0, -1);
	}
	if (pathname.charAt(0) === '/') {
		pathname = pathname.slice(1);
	}
	if (pathname === '') {
		pathname = '/';
	}

	var shouldBeActiveElements = document.querySelectorAll(
		'a[href=\'' + url + '\'].t978__menu-link, a[href=\'' + url + '\'].t978__submenu-link, ' +
		'a[href=\'' + url + '/\'].t978__menu-link, a[href=\'' + url + '/\'].t978__submenu-link, ' +
		'a[href=\'' + pathname + '\'].t978__menu-link, a[href=\'' + pathname + '\'].t978__submenu-link, ' +
		'a[href=\'/' + pathname + '\'].t978__menu-link, a[href=\'/' + pathname + '\'].t978__submenu-link, ' +
		'a[href=\'' + pathname + '/\'].t978__menu-link, a[href=\'' + pathname + '/\'].t978__submenu-link, ' +
		'a[href=\'/' + pathname + '/\'].t978__menu-link, a[href=\'/' + pathname + '/\'].t978__submenu-link' +
		(hash ? ', a[href=\'' + hash + '\'].t978__menu-link, a[href=\'' + hash + '\'].t978__submenu-link' : ''));


	Array.prototype.forEach.call(shouldBeActiveElements, function (link) {
		link.classList.add('t-active');
	});
}

function t978_slideUp(target, duration, callback) {
	if (!target) return;
	if (!duration) duration = 300;
	var step = target.offsetHeight * 10 / duration;
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

function t978_slideDown(target, duration) {
	if (!target) return;
	if (!duration) duration = 300;
	target.style.display = '';
	var newDisplayValue = window.getComputedStyle(target).display === 'none' ? 'block' : window.getComputedStyle(target).display;
	target.style.display = newDisplayValue;
	var cahsedHeight = target.offsetHeight;
	target.style.height = '0';
	target.style.overflow = 'hidden';
	target.setAttribute('data-slide', 'y');
	var step = cahsedHeight * 10 / duration;
	var difference = 0;
	var timerID = setInterval(function () {
		target.style.height = difference + 'px';
		difference += step;
		if (difference >= cahsedHeight) {
			target.style.height = '';
			target.style.overflow = '';
			target.style.display = newDisplayValue;
			target.removeAttribute('data-slide');
			clearInterval(timerID);
		}
	}, 10);
}

function t978_removeEl(el) {
	var elParent = el ? el.parentElement : null;
	if (elParent) elParent.removeChild(el);
}

function t978_getValueWithoutPadding(el, value) {
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

function t270_scroll(hash, offset, speed) {
	if (!speed)
		speed = 400;
	if (hash.indexOf('#!/tproduct/') !== -1 || hash.indexOf('#!/tab/') !== -1) {
		return !0;
	}
	var target;
	if (!hash)
		return;
	try {
		if (hash.substring(0, 1) === '#') {
			target = document.getElementById(hash.substring(1));
		} else {
			target = document.querySelector(hash);
		}
	} catch (event) {
		console.log('Exception t270: ' + event.message);
		return !0;
	}
	if (!target) {
		target = document.querySelector('a[name="' + hash.substr(1) + '"]');
		if (!target)
			return !0;
	}
	var isHistoryChangeAllowed = window.location.hash !== hash;
	var wrapperBlock = document.querySelector('.t270');
	var dontChangeHistory = wrapperBlock ? Boolean(wrapperBlock.getAttribute('data-history-disabled')) : !1;
	target = parseInt(target.getBoundingClientRect().top + window.pageYOffset - offset, 10);
	if (window.isIE) {
		window.scrollTo(0, target);
	} else {
		window.scrollTo({
			left: 0,
			top: target,
			behavior: 'smooth',
		});
	}
	if (!dontChangeHistory && isHistoryChangeAllowed) {
		if (history.pushState) {
			history.pushState(null, null, hash);
		} else {
			window.location.hash = hash;
		}
		isHistoryChangeAllowed = !1;
	}
	return !0;
}