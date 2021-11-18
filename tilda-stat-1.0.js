(function () {
	/*
	if (w['tilda_stat_callbacks'] && w['tilda_stat_callbacks'].length > 0) {
	}
	*/

	var allRec = document.getElementById('allrecords');

	function t_stat__generateUniqID() {
		var random = Math.floor(Math.random() * 899999) + 100000;
		return Date.now() + '.' + random;
	}


	function t_stat__getCookie(name) {
		// eslint-disable-next-line no-useless-escape
		var clearName = name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1');
		var regexp = new RegExp('(?:^|; )' + clearName + '=([^;]*)');
		var matches = document.cookie.match(regexp);
		if (matches) {
			return decodeURIComponent(matches[1]);
		}
	}

	/**
	 * 
	 * @param {string} name mean cookie name
	 * @param {string} value 
	 * @param {object} options
	 * @returns {undefined} update Cookie via key document.cookie
	 */
	function t_stat__setCookie(name, value, options) {
		var expires = options.expires;
		if (!expires) return false;
		if (typeof expires === 'number') {
			var expiryDate = Date.now() + (expires * 1e3);
			expires = new Date(expiryDate);
			if (expires.toUTCString) {
				options.expires = expires.toUTCString();
			}
		}
		value = encodeURIComponent(value);
		var updatedCookie = name + '=' + value;
		for (var key in options) {
			updatedCookie += '; ' + key;
			if (options[key] !== true) {
				updatedCookie += '=' + options[key];
			}
		}
		document.cookie = updatedCookie;
	}


	function t_stat__objAssign(obj1, obj2) {
		for (var key in obj2) {
			obj1[key] = obj2[key];
		}
		return obj1;
	}


	function t_stat__onVisibilityWindowChange(callback) {
		var visible = true;

		if (!callback) {
			throw new Error('no callback given');
		}

		function focused() {
			if (!visible) {
				callback(visible = true);
			}
		}

		function unfocused() {
			if (visible) {
				callback(visible = false);
			}
		}

		// try {
		// Standards:
		if ('hidden' in document) {
			document.addEventListener('visibilitychange',
				function () { (document.hidden ? unfocused : focused)(); });
		}
		if ('mozHidden' in document) {
			document.addEventListener('mozvisibilitychange',
				function () { (document.mozHidden ? unfocused : focused)(); });
		}
		if ('webkitHidden' in document) {
			document.addEventListener('webkitvisibilitychange',
				function () { (document.webkitHidden ? unfocused : focused)(); });
		}
		if ('msHidden' in document) {
			document.addEventListener('msvisibilitychange',
				function () { (document.msHidden ? unfocused : focused)(); });
		}
		// IE 9 and lower:
		if ('onfocusin' in document) {
			document.onfocusin = focused;
			document.onfocusout = unfocused;
		}
		// All others:
		window.onpageshow = window.onfocus = focused;
		window.onpagehide = window.onblur = unfocused;
		// }
	}


	function t_stat__trackScrollEvent() {
		var topPosition = window.pageYOffset;
		var windowHeight = window.innerHeight;
		var documentHeight = Math.max(
			document.body.scrollHeight, document.documentElement.scrollHeight,
			document.body.offsetHeight, document.documentElement.offsetHeight,
			document.body.clientHeight, document.documentElement.clientHeight
		);
		var headerHeight = 0;
		var footerHeight = 0;

		isWindowActive = true;

		var headerBlock = document.getElementById('t-header');
		var footerBlock = document.getElementById('t-footer');
		var tildaCopy = document.getElementById('tildacopy');

		if (headerBlock) {
			headerHeight = headerBlock.offsetHeight;
		}
		if (footerBlock) {
			footerHeight = footerBlock.offsetHeight;
		}
		if (tildaCopy) {
			footerHeight += tildaCopy.offsetHeight;
		}
		var userScreenPositon = Math.floor((topPosition - headerHeight + windowHeight) * 100 / (documentHeight - headerHeight - footerHeight));
		// if (p < 10) {
		// 	return;
		// }

		// var breakpoints = [[10, 25], [25, 50], [50, 75], [75, 90], [90, 100]];
		// breakpoints.forEach(function (breakpoint) {
		// 	var pointStart = breakpoint[0];
		// 	var pointEnd = breakpoint[1];
		// 	if (scrollProgress >= pointStart && scrollProgress < pointEnd && !isSendScrollEvent['p' + pointStart]) {
		// 		statParams.page = '/tilda/scroll/' + pointStart + '/';
		// 		window.tildastat('pageview');
		// 		isSendScrollEvent['p' + pointStart] = true;
		// 	}
		// })
		// console.log(isSendScrollEvent);

		//TODO replace from 'if else' to 'forEach'
		if (userScreenPositon >= 10 && !isSendScrollEvent['p10']) {
			statParams.page = '/tilda/scroll/10/';
			window.tildastat('pageview');
			isSendScrollEvent['p10'] = true;
		} else {

			if (userScreenPositon >= 24) {
				if (isSendScrollEvent['p25'] == 0) {
					statParams.page = '/tilda/scroll/25/';
					window.tildastat('pageview');

					isSendScrollEvent['p25'] = setTimeout(function () {
						clearTimeout(isSendScrollEvent['p25']);
						isSendScrollEvent['p25'] = -1;
					}, 5000);
					return;
				} else if (userScreenPositon < 51 && isSendScrollEvent['p25'] == -1) {
					isSendScrollEvent['p25'] = 0;
					return;
				}
			}

			if (userScreenPositon >= 49) {
				if (isSendScrollEvent['p50'] == 0) {
					statParams.page = '/tilda/scroll/50/';
					window.tildastat('pageview');

					isSendScrollEvent['p50'] = setTimeout(function () {
						clearTimeout(isSendScrollEvent['p50']);
						isSendScrollEvent['p50'] = -1;
					}, 5000);
					return;
				} else if (userScreenPositon < 76 && isSendScrollEvent['p50'] == -1) {
					isSendScrollEvent['p50'] = 0;
					return;
				}
			}

			if (userScreenPositon >= 74) {
				if (isSendScrollEvent['p75'] == 0) {
					statParams.page = '/tilda/scroll/75/';
					window.tildastat('pageview');

					isSendScrollEvent['p75'] = setTimeout(function () {
						clearTimeout(isSendScrollEvent['p75']);
						isSendScrollEvent['p75'] = -1;
					}, 5000);
					return;
				} else if (userScreenPositon < 91 && isSendScrollEvent['p75'] == -1) {
					isSendScrollEvent['p75'] = 0;
					return;
				}
			}

			if (userScreenPositon >= 89) {
				if (isSendScrollEvent['p90'] == 0) {
					statParams.page = '/tilda/scroll/90/';
					window.tildastat('pageview');

					isSendScrollEvent['p90'] = setTimeout(function () {
						clearTimeout(isSendScrollEvent['p90']);
						isSendScrollEvent['p90'] = -1;
					}, 5000);
					return;
				} else if (isSendScrollEvent['p90'] == -1) {
					isSendScrollEvent['p90'] = 0;
					return;
				}
			}
		}
	}


	function t_stat__getPageURL() {
		var hostName = window.location.hostname.replace('www.', '');
		if (hostName.lastIndexOf('.') === hostName.length - 1) {
			hostName = hostName.slice(0, -1);
		}
		return hostName + window.location.pathname;
	}


	function t_stat__makeHash(str) {
		var range = Array(str.length);
		for (var i = 0; i < str.length; i++) {
			range[i] = i;
		}
		return Array.prototype.map.call(range, function (i) {
			return str.charCodeAt(i).toString(16);
		}).join('');
	}


	/*
	function hashCode(str) {
		var hash = 0, i, chr;
		if (str.length === 0) return hash;
		for (i = 0; i < str.length; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};
	*/


	function t_stat__getFingerPrint() {
		var str = (navigator.cookieEnabled ? 'cT' : 'cF')
			+ (navigator.deviceMemory ? 'dm' + navigator.deviceMemory : 'dm')
			+ (navigator.hardwareConcurrency ? 'hc' + navigator.hardwareConcurrency : 'hc')
			+ (navigator.languages ? 'l' + navigator.languages.join(',') : 'l')
			+ (navigator.platform ? 'p' + navigator.platform : 'p')
			+ (navigator.vendor ? 'v' + navigator.vendor : 'v')
			+ (navigator.appCodeName ? 'a' + navigator.appCodeName : 'a')
			+ (navigator.appName ? 'n' + navigator.appName : 'n');

		if (navigator.plugins) {
			var ii, plug = '';
			for (ii = 0; ii < navigator.plugins.length; ii++) {
				plug += navigator.plugins[ii].filename;
			}
			str += 'pl' + plug;
		}

		str += 'pr' + window.devicePixelRatio;
		str += 'w' + window.winWidth + 'h' + window.winHeight;

		str = t_stat__makeHash(str);
		//str = hashCode(str);

		//console.log(str);

		return str;
	}


	function t_stat__getUIDandSID() {

		//GET UID AND SID
		userid = t_stat__getCookie('tildauid');
		sessionid = t_stat__getCookie('tildasid');

		if (isCookieDisabled) {
			if (!userid) userid = 'simple';
			if (!sessionid) sessionid = 'simple';
		} else {
			if (!userid) {
				userid = t_stat__generateUniqID();
			}
			if (!sessionid) {
				sessionid = t_stat__generateUniqID();
			}
		}

	}

	function t_stat__setUIDandSID() {
		//PROLONGATE COOKIE EXPIRATION
		if (!isCookieDisabled) {
			var expiriesDate = 60 * 60 * 24 * 90; //90 days in seconds
			t_stat__setCookie('tildauid', userid, { expires: expiriesDate, path: '/' });
			t_stat__setCookie('tildasid', sessionid, { expires: 1800, path: '/' });
		}
	}

	// eslint-disable-next-line no-unused-vars
	function create(opts) {

		//CHECK BOTS
		if (statParams.user_agent > '' && statParams.user_agent.indexOf('bot') != -1) {
			return false;
		}

		if (window.location.protocol != 'http:' && window.location.protocol != 'https:') {
			// eslint-disable-next-line no-console
			console.log('TildaStat: cannot work on local page');
			return false;
		}

		//GET UID AND SID
		t_stat__getUIDandSID();
		t_stat__setUIDandSID();

		statParams.page = t_stat__getPageURL();
		statParams.referrer = document.referrer || '';
		statParams.userid = userid;
		statParams.sessionid = sessionid;
		statParams.user_agent = window.navigator.userAgent;
		statParams.user_language = window.navigator.userLanguage || window.navigator.language;

		if (allRec) {
			statParams.projectid = allRec.getAttribute['data-tilda-project-id'] || '0';
			statParams.pageid = allRec.getAttribute['data-tilda-page-id'] || '0';
			statParams.pagealias = allRec.getAttribute['data-tilda-page-alias'] || '';
			statParams.formskey = allRec.getAttribute['data-tilda-formskey'] || '';
		}

		statParams.params = {};

		var tmp;

		//UTM
		try {
			tmp = decodeURIComponent(window.location.search);
		} catch (e) {
			tmp = window.location.search;
		}
		if (tmp > '?') {
			statParams.pagequery = (tmp).substring(1).toLowerCase();
			if (statParams.pagequery.indexOf('utm_') != -1) {
				var key, arPair, arParams = statParams.pagequery.split('&');
				for (key in arParams) {
					if (arParams[key]) {
						arPair = (arParams[key]).split('=');
						if (arPair.length > 1) {
							if (
								arPair[0] == 'utm_referrer'
								&& (
									!statParams.referrer
									|| statParams.referrer.indexOf('ohio8.v') != -1
								)
							) {
								statParams.referrer = arPair[1];
							} else {
								statParams.params[arPair[0]] = arPair[1];
							}
						} else {
							statParams.params[arPair[0]] = '';
						}
					}
				}
			}
		}

		//IS MOBILE
		var isMobile = false;
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			isMobile = true;
		}
		statParams.ismobile = isMobile;

		//KEY (CODE)
		if (document.getElementById('tildastatscript')) {
			statParams.tildastatcode = document.getElementById('tildastatscript').key;
		}

		//SCROLL STAT
		if (isScrollTrack) {
			// try {
			t_stat__onVisibilityWindowChange(function (visible) {
				isWindowActive = (visible ? true : false);
			});
			document.body.addEventListener('mousewheel', t_throttle(function () { isWindowActive = true; }, 1000));
			document.body.addEventListener('mousemove', t_throttle(function () { isWindowActive = true; }, 1000));
			document.body.addEventListener('keypress', t_throttle(function () { isWindowActive = true; }, 1000));
			document.body.addEventListener('click', t_throttle(function () { isWindowActive = true; }, 1000));

			// }
		}

		//FINGERPRINT
		statParams.fingerprint = t_stat__getFingerPrint();

		//FLAG inited
		isInited = true;
	}


	// eslint-disable-next-line no-unused-vars
	function t_stat__pageView(opts) {
		var staturl = 'https:' + '//stat' + '.tildacdn.' + 'com/event/';

		if (!isCookieDisabled) {
			//RECREATE COOKIE
			var sessid = t_stat__getCookie('tildasid') || '';
			if (sessid != statParams.sessionid) {
				t_stat__setCookie('tildasid', statParams.sessionid, { expires: 1800, path: '/' });
			}
		}

		//get previous url
		if (statParams.referrer === '') {
			statParams.referrer = t_stat__getCookie('previousUrl') || '';
		}

		statParams.tildautm = t_stat__getCookie('TILDAUTM') || '';

		if (!statParams.page) {
			// eslint-disable-next-line no-console
			console.log('TildaStat: page empty');
			statParams.page = t_stat__getPageURL();

			if (window.location.hash && window.location.hash.indexOf('#!') === 0) {
				statParams.page += window.location.hash;
			}
		}

		//for events like /tilda/readtime/ adding domain
		if (statParams.page.substring(0, 1) === '/') {
			statParams.page = window.location.hostname + statParams.page;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('POST', staturl, true);
		xhr.withCredentials = false;
		xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
		xhr.send(statParams);
		xhr.onerror = function (data) {
			// eslint-disable-next-line no-console
			console.error('TildaStat: fail pageview ');
			// eslint-disable-next-line no-console
			console.error(data);
		};
		xhr.timeout = 3e3;

		if (
			statParams.page
			&& statParams.page.indexOf('tilda/scroll') === -1
			&& statParams.page.indexOf('tilda/readtime') === -1
			&& statParams.page.indexOf('tilda/click') === -1
			&& statParams.page.indexOf('tilda/cookieenabled') === -1
		) {
			statParams.referrer = statParams.page;
			if (!isCookieDisabled) {
				t_stat__setCookie('previousUrl', statParams.page, { path: '/', expires: 1800 });
			}
		}
		statParams.page = '';

		//???
		window.tildastatload = true;

	}


	window.tildastat = function (event, opts) {
		if (!event) {
			return false;
		}

		if (event !== 'create' && !isInited) {
			setTimeout(function () {
				window.tildastat(event, opts);
			}, 1000);
			return false;
		}

		if (opts) {
			t_stat__objAssign(statParams, opts);
		}

		switch (event) {
			case 'create':
				create(opts);
				break;

			case 'pageview':
				t_stat__pageView(opts);
				break;

			case 'readtime':
				if (isScrollTrack) {
					if (isWindowActive) {
						statParams.page = '/tilda/readtime/';
						isWindowActive = false;
						t_stat__pageView(opts);
					}

					setTimeout(function () {
						window.tildastat('readtime');
					}, 15000);
				}
				break;

			case 'scroll':
				if (isScrollTrack && typeof t_throttle === 'function') {
					// try {
					window.addEventListener('scroll', t_throttle(t_stat__trackScrollEvent, 1000));
					// }
				}
				break;

			case 'cookieenabled':
				isCookieDisabled = false;

				t_stat__getUIDandSID();
				t_stat__setUIDandSID();

				statParams.userid = userid;
				statParams.sessionid = sessionid;

				statParams.page = '/tilda/cookieenabled/';
				t_stat__pageView(opts);

				break;

			default:
				break;
		}
	};


	var statParams = {};
	var isSendScrollEvent = { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 };
	// var dStartReadTime = new Date();
	var isWindowActive = true;

	var isCookieDisabled = (window['tildastatcookie'] === 'no' ? true : false);
	if (!window['tildastatcookie']) {
		if (allRec) {
			isCookieDisabled = allRec.getAttribute('data-tilda-cookie') === 'no' ? true : false;
		}
	}

	if (window['tildastatcookiegdpr'] === 'yes' && isCookieDisabled === false) {
		isCookieDisabled = true;
		var cookiesConsent = t_stat__getCookie('t_cookiesConsentGiven');
		if (cookiesConsent === true) {
			var cookiesCategories = t_stat__getCookie('t_cookiesCategories');
			if (typeof cookiesCategories === 'string' && cookiesCategories.indexOf('analytics') > -1) {
				isCookieDisabled = false;
			}
		}
	}
	//console.log(isCookieDisabled);

	var isScrollTrack = (window['tildastatscroll'] === 'yes' ? true : false);
	if (typeof window['tildastatscroll'] == 'undefined') {
		if (allRec) {
			isScrollTrack = allRec.getAttribute('data-tilda-stat-scroll') === 'yes' ? true : false;
		}
	}

	var userid = '';
	var sessionid = '';

	var isInited = false;

	window.tildastat('create');

	setTimeout(function () {
		window.tildastat('pageview');
		window.tildastat('readtime');
		window.tildastat('scroll');
	}, 500);

})();